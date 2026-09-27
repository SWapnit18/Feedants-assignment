'use strict';

/**
 * Demo seed. All dates are relative to "now" so the demo is always live.
 * `npm run seed` seeds the DB at MONGODB_URI (destructive for these collections).
 */
const mongoose = require('mongoose');
const models = require('./models');
const { randomId } = require('./utils/ids');

const { User, Competition, Registration, Submission, Testimonial, Referral, IdempotencyKey } = models;

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const rupees = (r) => Math.round(r * 100);

const VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';
const videos = {
  blazes: `${VIDEO}/ForBiggerBlazes.mp4`,
  escapes: `${VIDEO}/ForBiggerEscapes.mp4`,
  fun: `${VIDEO}/ForBiggerFun.mp4`,
  joyrides: `${VIDEO}/ForBiggerJoyrides.mp4`,
  meltdowns: `${VIDEO}/ForBiggerMeltdowns.mp4`,
};
const thumb = (name) => `${VIDEO}/images/${name}.jpg`;
const avatar = (gender, n) => `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

const ORDINALS = [
  { en: '1st Winner', hi: 'प्रथम विजेता' },
  { en: '2nd Winner', hi: 'द्वितीय विजेता' },
  { en: '3rd Winner', hi: 'तृतीय विजेता' },
  { en: '4th Winner', hi: 'चौथा विजेता' },
  { en: '5th Winner', hi: 'पाँचवाँ विजेता' },
  { en: '6th Winner', hi: 'छठा विजेता' },
];
const rewards = (amountsInRupees) =>
  amountsInRupees.map((amt, i) => ({ position: i + 1, label: ORDINALS[i], amount: rupees(amt) }));

const JUDGING = [
  { en: 'Technique & precision (30%)', hi: 'तकनीक और सटीकता (30%)' },
  { en: 'Expression & abhinaya (25%)', hi: 'भाव और अभिनय (25%)' },
  { en: 'Rhythm & taal (20%)', hi: 'लय और ताल (20%)' },
  { en: 'Choreography & creativity (15%)', hi: 'नृत्य-रचना और रचनात्मकता (15%)' },
  { en: 'Costume & presentation (10%)', hi: 'वेशभूषा और प्रस्तुति (10%)' },
];
const RULES = [
  { en: 'Open to all age groups', hi: 'सभी आयु वर्गों के लिए खुला' },
  { en: 'Solo performances only; 2–5 minutes long', hi: 'केवल एकल प्रस्तुति; अवधि 2–5 मिनट' },
  { en: 'Video must be recorded in a single continuous take', hi: 'वीडियो एक ही निरंतर टेक में रिकॉर्ड होना चाहिए' },
  { en: 'Only one entry per participant', hi: 'प्रति प्रतिभागी केवल एक प्रविष्टि' },
  { en: 'Entries must be original and not previously awarded', hi: 'प्रविष्टियाँ मौलिक हों और पहले पुरस्कृत न हुई हों' },
  { en: 'Registration fee is non-refundable once submissions are judged', hi: 'मूल्यांकन के बाद पंजीकरण शुल्क वापस नहीं होगा' },
];
const DISCLAIMER = {
  en: 'Only contributions from paid participants will be considered for judging.',
  hi: 'केवल भुगतान करने वाले प्रतिभागियों की प्रविष्टियों का ही मूल्यांकन किया जाएगा।',
};
const REFUND_POLICY = {
  en: 'If the competition is cancelled, entry fees are refunded in full to the original payment method within 5–7 business days. Fees are otherwise non-refundable.',
  hi: 'यदि प्रतियोगिता रद्द होती है, तो प्रवेश शुल्क 5–7 कार्य दिवसों में मूल भुगतान माध्यम पर पूरा वापस किया जाएगा। अन्यथा शुल्क वापस नहीं होगा।',
};
const JUDGE_MANJU = {
  name: 'Manju Dubey',
  title: { en: 'Professional Kathak Dancer', hi: 'पेशेवर कथक नृत्यांगना' },
  experienceYears: 12,
  avatarUrl: avatar('women', 44),
  introVideoUrl: videos.joyrides,
};
const AD = {
  imageUrl: 'https://picsum.photos/seed/feedants-ad/1200/300',
  targetUrl: 'https://feedants.com',
  label: { en: 'Ad Here', hi: 'विज्ञापन' },
};

function previousWinners() {
  return [
    { name: 'Riya Shah', position: 1, positionLabel: ORDINALS[0], thumbnailUrl: thumb('ForBiggerBlazes'), videoUrl: videos.blazes },
    { name: 'Aarav Mehta', position: 1, positionLabel: ORDINALS[0], thumbnailUrl: thumb('ForBiggerEscapes'), videoUrl: videos.escapes },
    { name: 'Neha Verma', position: 2, positionLabel: ORDINALS[1], thumbnailUrl: thumb('ForBiggerFun'), videoUrl: videos.fun },
    { name: 'Ishita Chopra', position: 3, positionLabel: ORDINALS[2], thumbnailUrl: thumb('ForBiggerMeltdowns'), videoUrl: videos.meltdowns },
  ];
}

function baseCompetition(overrides) {
  return {
    category: 'Dance',
    tags: ['Dance', 'Multi-Win'],
    certificate: true,
    currency: 'INR',
    judge: JUDGE_MANJU,
    previousWinners: previousWinners(),
    judgingParameters: JUDGING,
    rules: RULES,
    disclaimer: DISCLAIMER,
    prizeInfoVideoUrl: videos.fun,
    refundPolicy: REFUND_POLICY,
    paymentProvider: 'razorpay',
    ad: AD,
    status: 'published',
    ...overrides,
  };
}

/** Build the competition fixtures for a given `now`. */
function buildCompetitions(now) {
  const t = now.getTime();
  const at = (ms) => new Date(t + ms);
  const mainRegClose = t + DAY + 6 * HOUR + 28 * MIN;
  const mainSubEnd = mainRegClose + 20 * DAY;

  return {
    main: baseCompetition({
      slug: 'feedants-classical-dance',
      title: { en: 'Feedants Classical Dance', hi: 'फीडेंट्स शास्त्रीय नृत्य' },
      prizePool: rupees(1500),
      entryFee: rupees(99),
      ad: null, // unsold slot → app renders the design's dashed "Ad Here" placeholder
      capacity: 20,
      dates: {
        registrationOpensAt: at(-5 * DAY),
        registrationClosesAt: new Date(mainRegClose),
        submissionStartsAt: at(-2 * DAY),
        submissionEndsAt: new Date(mainSubEnd),
        resultAt: new Date(mainSubEnd + 2 * DAY),
      },
      about: {
        en: 'This is an online classical dance competition open for all age groups.\nParticipate from anywhere and showcase your talent.\nExpress your passion through traditional dance.\n\nPerform any Indian classical form — Kathak, Bharatanatyam, Odissi, Kuchipudi, Manipuri or Mohiniyattam — and upload your performance video before the deadline. Our expert judge reviews every paid entry and winners are announced on the result date.',
        hi: 'यह सभी आयु वर्गों के लिए खुली एक ऑनलाइन शास्त्रीय नृत्य प्रतियोगिता है।\nकहीं से भी भाग लें और अपनी प्रतिभा दिखाएँ।\nपारंपरिक नृत्य के माध्यम से अपना जुनून व्यक्त करें।\n\nकोई भी भारतीय शास्त्रीय नृत्य शैली — कथक, भरतनाट्यम, ओडिसी, कुचिपुड़ी, मणिपुरी या मोहिनीअट्टम — प्रस्तुत करें और समय सीमा से पहले अपना वीडियो अपलोड करें। हमारे विशेषज्ञ निर्णायक हर भुगतान की गई प्रविष्टि की समीक्षा करते हैं और परिणाम तिथि पर विजेताओं की घोषणा की जाती है।',
      },
      rewards: rewards([550, 300, 240, 200, 130, 80]),
    }),
    full: baseCompetition({
      slug: 'feedants-bharatanatyam-open',
      title: { en: 'Feedants Bharatanatyam Open', hi: 'फीडेंट्स भरतनाट्यम ओपन' },
      tags: ['Dance', 'Bharatanatyam'],
      prizePool: rupees(2000),
      entryFee: rupees(149),
      capacity: 20,
      dates: {
        registrationOpensAt: at(-7 * DAY),
        registrationClosesAt: at(3 * DAY),
        submissionStartsAt: at(-1 * DAY),
        submissionEndsAt: at(15 * DAY),
        resultAt: at(18 * DAY),
      },
      about: {
        en: 'An open Bharatanatyam challenge. All seats have been booked — watch this space for the next edition!',
        hi: 'एक खुली भरतनाट्यम चुनौती। सभी सीटें बुक हो चुकी हैं — अगले संस्करण के लिए जुड़े रहें!',
      },
      rewards: rewards([800, 500, 300, 200, 120, 80]),
    }),
    judging: baseCompetition({
      slug: 'feedants-folk-fest',
      title: { en: 'Feedants Folk Fest', hi: 'फीडेंट्स लोक उत्सव' },
      tags: ['Dance', 'Folk'],
      certificate: false,
      prizePool: rupees(1000),
      entryFee: rupees(49),
      capacity: 30,
      dates: {
        registrationOpensAt: at(-30 * DAY),
        registrationClosesAt: at(-10 * DAY),
        submissionStartsAt: at(-20 * DAY),
        submissionEndsAt: at(-1 * DAY),
        resultAt: at(2 * DAY),
      },
      about: {
        en: 'Celebrate India’s folk dances — Garba, Bhangra, Lavani, Bihu and more. Submissions are closed and judging is in progress.',
        hi: 'भारत के लोक नृत्यों का उत्सव — गरबा, भांगड़ा, लावणी, बिहू और भी बहुत कुछ। प्रविष्टियाँ बंद हैं और मूल्यांकन जारी है।',
      },
      rewards: rewards([400, 250, 150, 100, 60, 40]),
      ad: null,
    }),
    results: baseCompetition({
      slug: 'feedants-kathak-finals',
      title: { en: 'Feedants Kathak Finals', hi: 'फीडेंट्स कथक फ़ाइनल्स' },
      tags: ['Dance', 'Kathak', 'Multi-Win'],
      prizePool: rupees(3000),
      entryFee: rupees(199),
      capacity: 25,
      dates: {
        registrationOpensAt: at(-45 * DAY),
        registrationClosesAt: at(-25 * DAY),
        submissionStartsAt: at(-30 * DAY),
        submissionEndsAt: at(-6 * DAY),
        resultAt: at(-3 * DAY),
      },
      about: {
        en: 'The grand finale for Kathak artists. Results are out — congratulations to all the winners!',
        hi: 'कथक कलाकारों के लिए भव्य फ़ाइनल। परिणाम घोषित हो चुके हैं — सभी विजेताओं को बधाई!',
      },
      rewards: rewards([1100, 700, 500, 350, 200, 150]),
    }),
    free: baseCompetition({
      slug: 'feedants-free-freestyle',
      title: { en: 'Feedants Free Freestyle', hi: 'फीडेंट्स फ्री फ्रीस्टाइल' },
      category: 'Dance',
      tags: ['Dance', 'Freestyle', 'Free Entry'],
      certificate: true,
      prizePool: rupees(500),
      entryFee: 0,
      capacity: 50,
      dates: {
        registrationOpensAt: at(-1 * DAY),
        registrationClosesAt: at(5 * DAY),
        submissionStartsAt: at(3 * DAY),
        submissionEndsAt: at(12 * DAY),
        resultAt: at(14 * DAY),
      },
      about: {
        en: 'A free-entry freestyle dance jam. Register now; submissions open in a few days.',
        hi: 'निःशुल्क प्रवेश वाला फ्रीस्टाइल डांस जैम। अभी रजिस्टर करें; प्रविष्टियाँ कुछ दिनों में शुरू होंगी।',
      },
      rewards: rewards([200, 150, 100, 50]),
      ad: null,
    }),
  };
}

const TESTIMONIALS = [
  { name: 'Ananya Iyer', avatarUrl: avatar('women', 68), rating: 5, text: { en: 'Loved competing from home! The judging feedback helped me improve my abhinaya.', hi: 'घर से प्रतियोगिता में भाग लेना बहुत अच्छा लगा! निर्णायक की प्रतिक्रिया से मेरा अभिनय बेहतर हुआ।' } },
  { name: 'Karan Malhotra', avatarUrl: avatar('men', 75), rating: 5, text: { en: 'Smooth registration and payment. Won 2nd place and the prize arrived in two days.', hi: 'आसान पंजीकरण और भुगतान। दूसरा स्थान मिला और इनाम दो दिनों में आ गया।' } },
  { name: 'Meera Nair', avatarUrl: avatar('women', 21), rating: 4, text: { en: 'Great platform for classical dancers to get noticed.', hi: 'शास्त्रीय नर्तकों के लिए पहचान बनाने का बेहतरीन मंच।' } },
  { name: 'Rohan Gupta', avatarUrl: avatar('men', 12), rating: 5, text: { en: 'Transparent rules and a genuinely experienced judge. Highly recommended!', hi: 'पारदर्शी नियम और सचमुच अनुभवी निर्णायक। ज़रूर आज़माएँ!' } },
  { name: 'Diya Kapoor', avatarUrl: avatar('women', 33), rating: 4, text: { en: 'The countdown kept me on my toes — submitted just in time!', hi: 'काउंटडाउन ने मुझे सतर्क रखा — ठीक समय पर प्रविष्टि जमा की!' } },
];

/**
 * Wipe demo collections and insert fixtures.
 * @param {{ now?: Date }} [opts]
 */
async function seedDatabase({ now = new Date() } = {}) {
  await Promise.all(
    [User, Competition, Registration, Submission, Testimonial, Referral, IdempotencyKey].map((m) => m.deleteMany({})),
  );

  const users = await User.insertMany([
    { name: 'Amit Rawal', email: 'amit@feedants.dev', avatarUrl: avatar('men', 32), referralCode: 'referral123' },
    { name: 'Priya Sharma', email: 'priya@feedants.dev', avatarUrl: avatar('women', 65), referralCode: 'priya2026' },
    { name: 'Rahul Verma', email: 'rahul@feedants.dev', avatarUrl: avatar('men', 46), referralCode: 'rahul2026' },
    { name: 'Sneha Patel', email: 'sneha@feedants.dev', avatarUrl: avatar('women', 17), referralCode: 'sneha2026' },
  ]);
  const [amit, priya, rahul, sneha] = users;
  await User.updateMany({ _id: { $in: [priya._id, rahul._id, sneha._id] } }, { $set: { referredBy: amit._id } });

  const fillers = await User.insertMany(
    Array.from({ length: 20 }, (_, i) => ({
      name: `Participant ${i + 1}`,
      email: `participant${i + 1}@feedants.dev`,
      avatarUrl: avatar(i % 2 ? 'men' : 'women', 50 + i),
      referralCode: `part${i + 1}${randomId(4).toLowerCase()}`,
    })),
  );

  const fixtures = buildCompetitions(now);
  const competitions = {};
  for (const [key, data] of Object.entries(fixtures)) {
    competitions[key] = await Competition.create({ ...data, bookedCount: 0 });
  }

  const confirmed = (competition, user, confirmedAgo = 1 * DAY) => ({
    competitionId: competition._id,
    userId: user._id,
    status: 'confirmed',
    amount: competition.entryFee,
    currency: 'INR',
    orderId: competition.entryFee > 0 ? `order_${randomId(14)}` : null,
    paymentId: competition.entryFee > 0 ? `pay_${randomId(14)}` : null,
    confirmedAt: new Date(now.getTime() - confirmedAgo),
  });

  const registrations = [
    confirmed(competitions.main, priya),
    ...fillers.map((u) => confirmed(competitions.full, u)),
    confirmed(competitions.judging, rahul, 15 * DAY),
    ...fillers.slice(0, 7).map((u) => confirmed(competitions.judging, u, 15 * DAY)),
    confirmed(competitions.results, sneha, 28 * DAY),
    ...fillers.slice(7, 18).map((u) => confirmed(competitions.results, u, 28 * DAY)),
  ];
  const regDocs = await Registration.insertMany(registrations);

  // Keep the invariant bookedCount == count(active registrations).
  for (const c of Object.values(competitions)) {
    const count = regDocs.filter((r) => String(r.competitionId) === String(c._id)).length;
    await Competition.updateOne({ _id: c._id }, { $set: { bookedCount: count } });
  }

  const regOf = (competition, user) =>
    regDocs.find((r) => String(r.competitionId) === String(competition._id) && String(r.userId) === String(user._id));
  await Submission.insertMany([
    { competitionId: competitions.judging._id, userId: rahul._id, registrationId: regOf(competitions.judging, rahul)._id, mediaUrl: videos.escapes, caption: 'Garba night performance', createdAt: new Date(now.getTime() - 5 * DAY) },
    { competitionId: competitions.results._id, userId: sneha._id, registrationId: regOf(competitions.results, sneha)._id, mediaUrl: videos.blazes, caption: 'Kathak tatkar medley', createdAt: new Date(now.getTime() - 10 * DAY) },
  ]);

  await Testimonial.insertMany(TESTIMONIALS.map((x, i) => ({ ...x, isPublished: true, createdAt: new Date(now.getTime() - i * DAY) })));

  await Referral.insertMany([priya, rahul, sneha].map((u) => ({ referrerId: amit._id, refereeId: u._id, rewardAmount: 1000 })));

  return {
    users: users.length + fillers.length,
    competitions: Object.values(competitions).map((c) => c.slug),
    registrations: regDocs.length,
  };
}

module.exports = { seedDatabase, buildCompetitions };

if (require.main === module) {
  (async () => {
    const config = require('./config');
    const { connectDatabase } = require('./config/db');
    if (!config.mongoUri) {
      console.error('MONGODB_URI is required for `npm run seed` (in-memory dev DB is auto-seeded by `npm run dev`).');
      process.exit(1);
    }
    await connectDatabase();
    const summary = await seedDatabase();
    console.log('Seeded:', summary);
    await mongoose.disconnect();
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
