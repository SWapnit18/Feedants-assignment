'use strict';

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { randomUUID } = require('node:crypto');
const { setup, teardown, resetDb, makeUser, makeCompetition, assertInvariant, DAY } = require('./helpers');
const { Registration, Competition } = require('../src/models');
const { releaseExpiredHolds } = require('../src/services/registration.service');
const { seedDatabase } = require('../src/seed');

let app;
before(async () => {
  app = await setup();
});
after(teardown);
beforeEach(resetDb);

const api = (p) => `/api/v1${p}`;

async function register(comp, u, key) {
  const req = request(app).post(api(`/competitions/${comp.slug}/registrations`)).set(u.auth);
  if (key) req.set('Idempotency-Key', key);
  return req.send();
}
async function pay(u, reg, orderId) {
  const co = await request(app).post(api('/payments/mock/checkout')).set(u.auth).send({ orderId });
  assert.equal(co.status, 200);
  return request(app).post(api(`/registrations/${reg.id}/verify-payment`)).set(u.auth).set('Idempotency-Key', randomUUID()).send(co.body);
}
async function expireHold(regId) {
  await Registration.updateOne({ _id: regId }, { $set: { holdExpiresAt: new Date(Date.now() - 1000) } });
}

describe('competition details', () => {
  it('anonymous view of seeded main competition matches the contract', async () => {
    await seedDatabase();
    const res = await request(app).get(api('/competitions/feedants-classical-dance'));
    assert.equal(res.status, 200);
    const b = res.body;
    assert.ok(Date.parse(b.serverTime));
    assert.equal(b.competition.title, 'Feedants Classical Dance');
    assert.equal(b.competition.prizePool, 150000);
    assert.equal(b.competition.entryFee, 9900);
    assert.deepEqual(b.availability, { capacity: 20, booked: 1, remaining: 19, isFull: false });
    assert.equal(b.lifecycle.phase, 'submission_open');
    assert.equal(b.lifecycle.nextDeadline.type, 'registration_closes');
    assert.deepEqual(b.competition.rewards.map((r) => r.amount), [55000, 30000, 24000, 20000, 13000, 8000]);
    assert.equal(b.competition.previousWinners.length, 4);
    assert.equal(b.viewer, null);
    assert.equal(b.anonymousAction.type, 'login');
    assert.equal(b.competition.tabs.judgingParameters.length > 0, true);
  });

  it('resolves Hindi and viewer state for a registered user', async () => {
    await seedDatabase();
    const login = await request(app).post(api('/auth/dev-login')).send({ email: 'priya@feedants.dev' });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.name, 'Priya Sharma');
    const res = await request(app)
      .get(api('/competitions/feedants-classical-dance?lang=hi'))
      .set('Authorization', `Bearer ${login.body.token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.competition.title, 'फीडेंट्स शास्त्रीय नृत्य');
    assert.equal(res.body.viewer.registration.status, 'confirmed');
    assert.equal(res.body.viewer.primaryAction.type, 'upload_submission');
    assert.equal(res.body.anonymousAction, undefined);
  });

  it('demo competitions expose their intended states', async () => {
    await seedDatabase();
    const phase = async (slug) => (await request(app).get(api(`/competitions/${slug}`))).body;
    assert.equal((await phase('feedants-bharatanatyam-open')).anonymousAction.type, 'full');
    assert.equal((await phase('feedants-folk-fest')).lifecycle.phase, 'judging');
    assert.equal((await phase('feedants-kathak-finals')).lifecycle.phase, 'results_announced');
    assert.equal((await phase('feedants-free-freestyle')).competition.entryFee, 0);
    for (const slug of ['feedants-classical-dance', 'feedants-bharatanatyam-open', 'feedants-folk-fest', 'feedants-kathak-finals']) {
      const c = await Competition.findOne({ slug });
      await assertInvariant(assert, c._id);
    }
  });

  it('404s unknown competitions, 400s bad lang, 401s bad tokens', async () => {
    assert.equal((await request(app).get(api('/competitions/nope'))).body.error.code, 'NOT_FOUND');
    const c = await makeCompetition();
    const bad = await request(app).get(api(`/competitions/${c.slug}?lang=fr`));
    assert.equal(bad.status, 400);
    assert.equal(bad.body.error.code, 'VALIDATION_ERROR');
    const unauth = await request(app).get(api(`/competitions/${c.slug}`)).set('Authorization', 'Bearer garbage');
    assert.equal(unauth.status, 401);
    // lookup by id works too
    assert.equal((await request(app).get(api(`/competitions/${c._id}`))).status, 200);
  });

  it('availability supports ETag / 304 and short caching', async () => {
    const c = await makeCompetition();
    const first = await request(app).get(api(`/competitions/${c._id}/availability`));
    assert.equal(first.status, 200);
    assert.equal(first.headers['cache-control'], 'public, max-age=2');
    assert.ok(first.headers.etag);
    const second = await request(app).get(api(`/competitions/${c._id}/availability`)).set('If-None-Match', first.headers.etag);
    assert.equal(second.status, 304);
    await Competition.updateOne({ _id: c._id }, { $inc: { bookedCount: 1 } });
    const third = await request(app).get(api(`/competitions/${c._id}/availability`)).set('If-None-Match', first.headers.etag);
    assert.equal(third.status, 200);
    assert.equal(third.body.availability.booked, 1);
  });

  it('testimonials and referral summary', async () => {
    await seedDatabase();
    const t = await request(app).get(api('/competitions/feedants-classical-dance/testimonials?limit=3'));
    assert.equal(t.body.items.length, 3);
    const login = await request(app).post(api('/auth/dev-login')).send({ email: 'amit@feedants.dev' });
    const ref = await request(app).get(api('/me/referral')).set('Authorization', `Bearer ${login.body.token}`);
    assert.deepEqual(ref.body, { code: 'referral123', link: 'https://feedants.com/r/referral123', rewardPerSignup: 1000, signups: 3, earned: 3000 });
    const users = await request(app).get(api('/auth/users'));
    assert.ok(users.body.users.length >= 4);
  });
});

describe('registration → payment → submission', () => {
  it('happy path', async () => {
    const c = await makeCompetition();
    const u = await makeUser();

    const reg = await register(c, u, randomUUID());
    assert.equal(reg.status, 201);
    assert.equal(reg.body.registration.status, 'pending_payment');
    assert.ok(Date.parse(reg.body.registration.holdExpiresAt) > Date.now());
    assert.equal(reg.body.payment.amount, 9900);
    assert.equal(reg.body.payment.provider, 'razorpay');
    assert.equal(reg.body.payment.mock, true);
    await assertInvariant(assert, c._id);

    let details = await request(app).get(api(`/competitions/${c.slug}`)).set(u.auth);
    assert.equal(details.body.viewer.primaryAction.type, 'complete_payment');
    assert.equal(details.body.availability.booked, 1);

    const verified = await pay(u, reg.body.registration, reg.body.payment.orderId);
    assert.equal(verified.status, 200);
    assert.deepEqual(verified.body, { registration: { id: reg.body.registration.id, status: 'confirmed' } });

    // verifying again is idempotent
    const again = await pay(u, reg.body.registration, reg.body.payment.orderId);
    assert.equal(again.status, 200);

    details = await request(app).get(api(`/competitions/${c.slug}`)).set(u.auth);
    assert.equal(details.body.viewer.primaryAction.type, 'upload_submission');

    const sub = await request(app)
      .post(api(`/competitions/${c.slug}/submissions`))
      .set(u.auth)
      .set('Idempotency-Key', randomUUID())
      .send({ mediaUrl: 'https://example.com/v.mp4', caption: 'My dance' });
    assert.equal(sub.status, 201);
    assert.equal(sub.body.submission.status, 'received');

    const dupSub = await request(app).post(api(`/competitions/${c.slug}/submissions`)).set(u.auth).send({ mediaUrl: 'https://example.com/v2.mp4' });
    assert.equal(dupSub.body.error.code, 'ALREADY_SUBMITTED');

    const mine = await request(app).get(api(`/competitions/${c.slug}/submissions/me`)).set(u.auth);
    assert.equal(mine.body.submission.mediaUrl, 'https://example.com/v.mp4');

    details = await request(app).get(api(`/competitions/${c.slug}`)).set(u.auth);
    assert.equal(details.body.viewer.primaryAction.type, 'view_submission');
    await assertInvariant(assert, c._id);
  });

  it('free competitions confirm immediately without payment', async () => {
    const c = await makeCompetition({ entryFee: 0 });
    const u = await makeUser();
    const reg = await register(c, u);
    assert.equal(reg.status, 201);
    assert.equal(reg.body.registration.status, 'confirmed');
    assert.equal(reg.body.payment, null);
    await assertInvariant(assert, c._id);
  });

  it('duplicate registration: pending hold is returned (200), confirmed → ALREADY_REGISTERED', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const first = await register(c, u);
    const second = await register(c, u);
    assert.equal(second.status, 200);
    assert.equal(second.body.registration.id, first.body.registration.id);
    await pay(u, first.body.registration, first.body.payment.orderId);
    const third = await register(c, u);
    assert.equal(third.status, 409);
    assert.equal(third.body.error.code, 'ALREADY_REGISTERED');
    const comp = await assertInvariant(assert, c._id);
    assert.equal(comp.bookedCount, 1);
  });

  it('registration closed / not open / cancelled', async () => {
    const u = await makeUser();
    const closed = await makeCompetition({ dates: { registrationOpensAt: new Date(Date.now() - 10 * DAY), registrationClosesAt: new Date(Date.now() - DAY) } });
    const r1 = await register(closed, u);
    assert.equal(r1.status, 409);
    assert.equal(r1.body.error.code, 'REGISTRATION_CLOSED');

    const future = await makeCompetition({ dates: { registrationOpensAt: new Date(Date.now() + DAY), registrationClosesAt: new Date(Date.now() + 2 * DAY) } });
    assert.equal((await register(future, u)).body.error.code, 'REGISTRATION_NOT_OPEN');

    const cancelled = await makeCompetition({ status: 'cancelled' });
    assert.equal((await register(cancelled, u)).body.error.code, 'REGISTRATION_CLOSED');
    await assertInvariant(assert, closed._id);
  });

  it('full competition → COMPETITION_FULL', async () => {
    const c = await makeCompetition({ capacity: 1 });
    const a = await makeUser();
    const b = await makeUser();
    assert.equal((await register(c, a)).status, 201);
    const res = await register(c, b);
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'COMPETITION_FULL');
    const details = await request(app).get(api(`/competitions/${c.slug}`)).set(b.auth);
    assert.equal(details.body.viewer.primaryAction.type, 'full');
    await assertInvariant(assert, c._id);
  });

  it('requires auth for mutations', async () => {
    const c = await makeCompetition();
    const res = await request(app).post(api(`/competitions/${c.slug}/registrations`));
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, 'UNAUTHENTICATED');
  });

  it('rejects forged payment signatures and foreign registrations', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const other = await makeUser();
    const reg = await register(c, u);
    const orderId = reg.body.payment.orderId;
    const forged = await request(app)
      .post(api(`/registrations/${reg.body.registration.id}/verify-payment`))
      .set(u.auth)
      .send({ razorpay_order_id: orderId, razorpay_payment_id: 'pay_x', razorpay_signature: 'a'.repeat(64) });
    assert.equal(forged.status, 400);
    assert.equal(forged.body.error.code, 'PAYMENT_VERIFICATION_FAILED');

    const co = await request(app).post(api('/payments/mock/checkout')).set(u.auth).send({ orderId });
    const wrongOrder = await request(app)
      .post(api(`/registrations/${reg.body.registration.id}/verify-payment`))
      .set(u.auth)
      .send({ ...co.body, razorpay_order_id: 'order_other' });
    assert.equal(wrongOrder.body.error.code, 'PAYMENT_VERIFICATION_FAILED');

    const foreign = await request(app).post(api(`/registrations/${reg.body.registration.id}/verify-payment`)).set(other.auth).send(co.body);
    assert.equal(foreign.status, 404);
    assert.equal((await request(app).post(api('/payments/mock/checkout')).set(other.auth).send({ orderId })).status, 404);
  });

  it('cancel a pending hold releases the seat; confirmed cannot be cancelled', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const reg = await register(c, u);
    const del = await request(app).delete(api(`/registrations/${reg.body.registration.id}`)).set(u.auth);
    assert.deepEqual(del.body, { registration: { id: reg.body.registration.id, status: 'cancelled' } });
    let comp = await assertInvariant(assert, c._id);
    assert.equal(comp.bookedCount, 0);
    // idempotent
    assert.equal((await request(app).delete(api(`/registrations/${reg.body.registration.id}`)).set(u.auth)).status, 200);
    comp = await assertInvariant(assert, c._id);
    assert.equal(comp.bookedCount, 0);

    const reg2 = await register(c, u);
    assert.equal(reg2.status, 201);
    await pay(u, reg2.body.registration, reg2.body.payment.orderId);
    const denied = await request(app).delete(api(`/registrations/${reg2.body.registration.id}`)).set(u.auth);
    assert.equal(denied.status, 409);
    assert.equal(denied.body.error.code, 'FORBIDDEN');
  });

  it('submission rules: NOT_REGISTERED, pending hold, window closed, bad url', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const body = { mediaUrl: 'https://example.com/a.mp4' };
    const notReg = await request(app).post(api(`/competitions/${c.slug}/submissions`)).set(u.auth).send(body);
    assert.equal(notReg.status, 403);
    assert.equal(notReg.body.error.code, 'NOT_REGISTERED');

    await register(c, u); // pending only
    assert.equal((await request(app).post(api(`/competitions/${c.slug}/submissions`)).set(u.auth).send(body)).body.error.code, 'NOT_REGISTERED');

    const later = await makeCompetition({ entryFee: 0, dates: { submissionStartsAt: new Date(Date.now() + DAY), submissionEndsAt: new Date(Date.now() + 5 * DAY), resultAt: new Date(Date.now() + 6 * DAY) } });
    await register(later, u);
    const early = await request(app).post(api(`/competitions/${later.slug}/submissions`)).set(u.auth).send(body);
    assert.equal(early.status, 409);
    assert.equal(early.body.error.code, 'SUBMISSION_WINDOW_CLOSED');
    const d = await request(app).get(api(`/competitions/${later.slug}`)).set(u.auth);
    assert.equal(d.body.viewer.primaryAction.type, 'submission_not_started');

    const badUrl = await request(app).post(api(`/competitions/${later.slug}/submissions`)).set(u.auth).send({ mediaUrl: 'javascript:alert(1)' });
    assert.equal(badUrl.body.error.code, 'VALIDATION_ERROR');
  });

  it('uploads accept images/videos only', async () => {
    const u = await makeUser();
    const ok = await request(app).post(api('/uploads')).set(u.auth).attach('file', Buffer.from('fake-bytes'), { filename: 'clip.mp4', contentType: 'video/mp4' });
    assert.equal(ok.status, 201);
    assert.match(ok.body.url, /\/uploads\/[0-9a-f-]+\.mp4$/);
    assert.equal(ok.body.mimeType, 'video/mp4');
    const served = await request(app).get(new URL(ok.body.url).pathname);
    assert.equal(served.status, 200);
    require('node:fs').rmSync(require('node:path').join(__dirname, '..', 'uploads', new URL(ok.body.url).pathname.split('/').pop()));
    const bad = await request(app).post(api('/uploads')).set(u.auth).attach('file', Buffer.from('x'), { filename: 'a.txt', contentType: 'text/plain' });
    assert.equal(bad.body.error.code, 'VALIDATION_ERROR');
  });
});

describe('seat holds expiry', () => {
  it('sweeper releases expired holds and restores availability', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const reg = await register(c, u);
    assert.equal((await Competition.findById(c._id)).bookedCount, 1);
    await expireHold(reg.body.registration.id);

    const released = await releaseExpiredHolds();
    assert.equal(released, 1);
    assert.equal(await releaseExpiredHolds(), 0, 'release is idempotent');
    const r = await Registration.findById(reg.body.registration.id);
    assert.equal(r.status, 'expired');
    const comp = await assertInvariant(assert, c._id);
    assert.equal(comp.bookedCount, 0);
  });

  it('lazily releases on the user’s own read and allows re-registering', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const reg = await register(c, u);
    await expireHold(reg.body.registration.id);

    const d = await request(app).get(api(`/competitions/${c.slug}`)).set(u.auth);
    assert.equal(d.body.viewer.registration, null);
    assert.equal(d.body.viewer.primaryAction.type, 'register');
    assert.equal(d.body.availability.booked, 0);

    const again = await register(c, u);
    assert.equal(again.status, 201);
    assert.notEqual(again.body.registration.id, reg.body.registration.id);
    const comp = await assertInvariant(assert, c._id);
    assert.equal(comp.bookedCount, 1);
  });

  it('paying after expiry re-reserves when a seat is free, else HOLD_EXPIRED', async () => {
    const c = await makeCompetition({ capacity: 1 });
    const a = await makeUser();
    const b = await makeUser();

    // a: expired + swept, seat still free → payment confirms
    const ra = await register(c, a);
    await expireHold(ra.body.registration.id);
    await releaseExpiredHolds();
    const ok = await pay(a, ra.body.registration, ra.body.payment.orderId);
    assert.equal(ok.status, 200);
    assert.equal(ok.body.registration.status, 'confirmed');
    await assertInvariant(assert, c._id);

    // b cannot even register now (full); make a 2nd competition to test the loss case
    const c2 = await makeCompetition({ capacity: 1 });
    const rb = await register(c2, b);
    await expireHold(rb.body.registration.id);
    await releaseExpiredHolds();
    assert.equal((await register(c2, a)).status, 201); // a takes the only seat
    const lost = await pay(b, rb.body.registration, rb.body.payment.orderId);
    assert.equal(lost.status, 410);
    assert.equal(lost.body.error.code, 'HOLD_EXPIRED');
    assert.equal((await Registration.findById(rb.body.registration.id)).status, 'refunded');
    await assertInvariant(assert, c2._id);
  });

  it('paying a lapsed-but-unswept hold confirms (the seat is still counted)', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const reg = await register(c, u);
    await expireHold(reg.body.registration.id);
    const ok = await pay(u, reg.body.registration, reg.body.payment.orderId);
    assert.equal(ok.status, 200);
    const comp = await assertInvariant(assert, c._id);
    assert.equal(comp.bookedCount, 1);
  });
});

describe('idempotency', () => {
  it('replays the stored response for the same key', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const key = randomUUID();
    const first = await register(c, u, key);
    const replay = await register(c, u, key);
    assert.equal(first.status, 201);
    assert.equal(replay.status, 201);
    assert.equal(replay.headers['idempotent-replayed'], 'true');
    assert.deepEqual(replay.body, first.body);
    assert.equal(await Registration.countDocuments({ competitionId: c._id }), 1);
  });

  it('same key with a different body → IDEMPOTENCY_CONFLICT', async () => {
    const c = await makeCompetition({ entryFee: 0 });
    const u = await makeUser();
    await register(c, u);
    const key = randomUUID();
    const s1 = await request(app).post(api(`/competitions/${c.slug}/submissions`)).set(u.auth).set('Idempotency-Key', key).send({ mediaUrl: 'https://example.com/1.mp4' });
    assert.equal(s1.status, 201);
    const s2 = await request(app).post(api(`/competitions/${c.slug}/submissions`)).set(u.auth).set('Idempotency-Key', key).send({ mediaUrl: 'https://example.com/2.mp4' });
    assert.equal(s2.status, 409);
    assert.equal(s2.body.error.code, 'IDEMPOTENCY_CONFLICT');
  });

  it('keys are scoped per user', async () => {
    const c = await makeCompetition();
    const a = await makeUser();
    const b = await makeUser();
    const key = randomUUID();
    const ra = await register(c, a, key);
    const rb = await register(c, b, key);
    assert.equal(rb.status, 201);
    assert.notEqual(ra.body.registration.id, rb.body.registration.id);
  });

  it('parallel requests with the same key create exactly one registration', async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const key = randomUUID();
    const results = await Promise.all(Array.from({ length: 5 }, () => register(c, u, key)));
    for (const r of results) assert.ok([201, 409].includes(r.status), `unexpected ${r.status}`);
    assert.ok(results.some((r) => r.status === 201));
    assert.equal(await Registration.countDocuments({ competitionId: c._id }), 1);
    await assertInvariant(assert, c._id);
  });
});
