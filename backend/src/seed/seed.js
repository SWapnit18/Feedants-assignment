'use strict';

// Development/test seed only. Production data is created and edited through the API/admin workflow.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { Competition, Registration, Testimonial, User, Referral, Winner } = require('../models');

const DAY = 24 * 60 * 60 * 1000;

function datesFor({ registrationClosesAt, submissionEndsAt, resultAt } = {}) {
  const now = Date.now();
  return {
    registrationOpensAt: new Date(now - 5 * DAY),
    registrationClosesAt: registrationClosesAt || new Date(now + DAY),
    submissionStartsAt: new Date(now - 2 * DAY),
    submissionEndsAt: submissionEndsAt || new Date(now + 20 * DAY),
    resultAt: resultAt || new Date(now + 22 * DAY),
  };
}

function competitionData(overrides = {}) {
  const dates = overrides.dates || datesFor();
  return {
    slug: overrides.slug,
    title: overrides.title || { en: 'Competition', hi: 'प्रतियोगिता' },
    category: overrides.category || 'Dance',
    tags: overrides.tags || [],
    certificate: true,
    prizePool: overrides.prizePool ?? 1500,
    entryFee: overrides.entryFee ?? 99,
    currency: 'INR',
    capacity: overrides.capacity ?? 20,
    bookedCount: overrides.bookedCount ?? 0,
    dates,
    about: overrides.about || { en: 'Competition information will be provided by the organizer.', hi: 'प्रतियोगिता की जानकारी आयोजक द्वारा दी जाएगी।' },
    judgingParameters: overrides.judgingParameters || [
      { name: { en: 'Technique', hi: 'तकनीक' }, description: { en: 'Technical quality of the performance.', hi: 'प्रदर्शन की तकनीकी गुणवत्ता।' }, percentage: 50 },
      { name: { en: 'Expression', hi: 'अभिव्यक्ति' }, description: { en: 'Expression and presentation.', hi: 'अभिव्यक्ति और प्रस्तुति।' }, percentage: 50 },
    ],
    rules: overrides.rules || [{ en: 'Follow the organizer rules.', hi: 'आयोजक के नियमों का पालन करें।' }],
    rewards: overrides.rewards || [],
    previousWinners: overrides.previousWinners || [],
    disclaimer: overrides.disclaimer || { en: 'Results are decided by the judging panel.', hi: 'परिणाम निर्णायक मंडल द्वारा तय किए जाते हैं।' },
    status: overrides.status || 'published',
  };
}

async function seedDatabase() {
  await Promise.all([Competition, Registration, Testimonial, User, Referral, Winner].map((model) => model.deleteMany({})));

  const [amit, priya, rahul, sneha] = await User.create([
    { name: 'Amit Rawal', email: 'amit@feedants.dev', referralCode: 'referral123' },
    { name: 'Priya Sharma', email: 'priya@feedants.dev', referralCode: 'priya123' },
    { name: 'Rahul Sharma', email: 'rahul@feedants.dev', referralCode: 'rahul123' },
    { name: 'Sneha Kapoor', email: 'sneha@feedants.dev', referralCode: 'sneha123' },
  ]);
  const fillerUsers = await User.create(Array.from({ length: 16 }, (_, index) => ({
    name: `Participant ${index + 5}`,
    email: `participant${index + 5}@feedants.dev`,
    referralCode: `participant${index + 5}`,
  })));

  const main = await Competition.create(competitionData({
    slug: 'feedants-classical-dance',
    title: { en: 'Feedants Classical Dance', hi: 'फीडेंट्स शास्त्रीय नृत्य' },
    tags: ['Dance', 'Multi-Win'],
    prizePool: 1500,
    entryFee: 99,
    capacity: 20,
    bookedCount: 1,
    rewards: [550, 300, 240, 200, 130, 80].map((amount, index) => ({ position: index + 1, label: { en: `${index + 1} Winner`, hi: `${index + 1} विजेता` }, amount })),
  }));
  await Registration.create({ competitionId: main._id, userId: priya._id, status: 'confirmed', amount: main.entryFee, currency: 'INR', confirmedAt: new Date() });

  const full = await Competition.create(competitionData({ slug: 'feedants-bharatanatyam-open', capacity: 20, bookedCount: 20 }));
  await Registration.create([amit, priya, rahul, sneha, ...fillerUsers].map((user) => ({
    competitionId: full._id,
    userId: user._id,
    status: 'confirmed',
    amount: full.entryFee,
    currency: 'INR',
    confirmedAt: new Date(),
  })));
  const closed = await Competition.create(competitionData({
    slug: 'feedants-folk-fest',
    dates: datesFor({ registrationClosesAt: new Date(Date.now() - DAY), submissionEndsAt: new Date(Date.now() - 1), resultAt: new Date(Date.now() + DAY) }),
  }));
  const results = await Competition.create(competitionData({
    slug: 'feedants-kathak-finals',
    dates: datesFor({ registrationClosesAt: new Date(Date.now() - 3 * DAY), submissionEndsAt: new Date(Date.now() - 2 * DAY), resultAt: new Date(Date.now() - DAY) }),
  }));
  await Competition.create(competitionData({ slug: 'feedants-free-freestyle', entryFee: 0 }));

  await Testimonial.create([
    { name: 'Participant One', text: { en: 'The submission flow was easy to follow.' }, rating: 5, isPublished: true },
    { name: 'Participant Two', text: { en: 'The competition information was clear.' }, rating: 4, isPublished: true },
    { name: 'Participant Three', text: { en: 'I could track my registration status.' }, rating: 5, isPublished: true },
  ]);
  await Referral.create([
    { referrerId: amit._id, refereeId: priya._id, rewardAmount: 1000 },
    { referrerId: amit._id, refereeId: rahul._id, rewardAmount: 1000 },
    { referrerId: amit._id, refereeId: sneha._id, rewardAmount: 1000 },
  ]);

  return { main, full, closed, results };
}

async function run() {
  await connectDB();
  await seedDatabase();
  console.log('[seed] Development data inserted.');
  await mongoose.connection.close();
}

module.exports = { seedDatabase };

if (require.main === module) run().catch((error) => {
  console.error('[seed] failed', error);
  process.exitCode = 1;
});
