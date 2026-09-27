'use strict';

const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { setup, teardown, resetDb, makeUser, makeCompetition, assertInvariant } = require('./helpers');
const { Registration, Competition } = require('../src/models');
const { releaseExpiredHolds } = require('../src/services/registration.service');

let app;
before(async () => {
  app = await setup();
});
after(teardown);
beforeEach(resetDb);

describe('concurrency', () => {
  it('50 parallel registrations for the last 15 seats: exactly 15 succeed', { timeout: 120_000 }, async () => {
    const CAPACITY = 20;
    const ALREADY = 5;
    const c = await makeCompetition({ capacity: CAPACITY });
    // Pre-book 5 seats with real registrations so the invariant holds.
    for (let i = 0; i < ALREADY; i++) {
      const u = await makeUser();
      assert.equal((await request(app).post(`/api/v1/competitions/${c.slug}/registrations`).set(u.auth)).status, 201);
    }

    const users = await Promise.all(Array.from({ length: 50 }, () => makeUser()));
    const results = await Promise.all(
      users.map((u) => request(app).post(`/api/v1/competitions/${c.slug}/registrations`).set(u.auth).send()),
    );

    const ok = results.filter((r) => r.status === 201);
    const full = results.filter((r) => r.status === 409 && r.body.error.code === 'COMPETITION_FULL');
    assert.equal(ok.length, CAPACITY - ALREADY, 'exactly the remaining seats are granted');
    assert.equal(full.length, 50 - (CAPACITY - ALREADY), 'everyone else gets COMPETITION_FULL');

    const comp = await assertInvariant(assert, c._id);
    assert.equal(comp.bookedCount, CAPACITY);
    assert.equal(new Set(ok.map((r) => r.body.registration.id)).size, ok.length);
  });

  it('same user hammering register gets a single hold', { timeout: 60_000 }, async () => {
    const c = await makeCompetition();
    const u = await makeUser();
    const results = await Promise.all(
      Array.from({ length: 20 }, () => request(app).post(`/api/v1/competitions/${c.slug}/registrations`).set(u.auth).send()),
    );
    for (const r of results) assert.ok([200, 201].includes(r.status), `unexpected ${r.status} ${JSON.stringify(r.body)}`);
    assert.equal(new Set(results.map((r) => r.body.registration.id)).size, 1);
    const comp = await assertInvariant(assert, c._id);
    assert.equal(comp.bookedCount, 1);
  });

  it('sweeper racing registrations and cancellations keeps the counter exact', { timeout: 60_000 }, async () => {
    const c = await makeCompetition({ capacity: 10 });
    const users = await Promise.all(Array.from({ length: 10 }, () => makeUser()));
    const regs = await Promise.all(users.map((u) => request(app).post(`/api/v1/competitions/${c.slug}/registrations`).set(u.auth)));
    assert.equal((await Competition.findById(c._id)).bookedCount, 10);
    await Registration.updateMany({ competitionId: c._id }, { $set: { holdExpiresAt: new Date(Date.now() - 1000) } });

    const newcomers = await Promise.all(Array.from({ length: 10 }, () => makeUser()));
    await Promise.all([
      releaseExpiredHolds(),
      releaseExpiredHolds(),
      ...regs.slice(0, 5).map((r, i) => request(app).delete(`/api/v1/registrations/${r.body.registration.id}`).set(users[i].auth)),
      ...newcomers.map((u) => request(app).post(`/api/v1/competitions/${c.slug}/registrations`).set(u.auth)),
    ]);
    await releaseExpiredHolds();
    const comp = await assertInvariant(assert, c._id);
    assert.ok(comp.bookedCount <= 10);
  });
});
