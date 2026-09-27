/**
 * =========================================================================
 * FEEDANTS COMPETITION SYSTEM - DATABASE SEED SCRIPT
 * (Requirement #21: clearly separated development / initial test data)
 * =========================================================================
 * This script seeds the initial competition document and user accounts in
 * MongoDB for development and local testing.
 *
 * Production UI consumes all data dynamically via the REST API from MongoDB.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Winner = require('../models/Winner');
const Testimonial = require('../models/Testimonial');

async function seed() {
  await connectDB();

  console.log('[seed] Cleaning test records...');
  await Promise.all([
    Competition.deleteMany({}),
    Registration.deleteMany({}),
    Winner.deleteMany({}),
    Testimonial.deleteMany({}),
    User.deleteMany({ email: { $in: ['swapnit@feedants.com', 'demo@feedants.com'] } }),
  ]);

  const passwordHash = await User.hashPassword('Feedants@2026');

  // Real initial authenticated user
  const user = await User.create({
    name: 'Swapnit Patel',
    email: 'swapnit@feedants.com',
    passwordHash,
    profileImage: null, // Initial dynamic avatar generates 'S'
    photoUrl: null,
    referralCode: 'swapnit2026',
  });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  // Real Competition Document with full fields as per Requirements #4, #5, #11, #13, #14
  const competition = await Competition.create({
    title: 'Feedants Classical Dance',
    category: 'Classical Dance',
    tags: ['Dance', 'Multi-Win'],
    hasCertificateForWinners: true,

    prizePool: 1500,
    entryFee: 99,
    currency: 'INR',

    totalSpots: 20,
    maxParticipants: 20,
    spotsBooked: 1,

    judge: {
      name: 'Manju Dubey',
      title: 'Judge',
      profession: 'Professional Kathak Dancer',
      experience: '12+ Years of Experience',
      experienceLabel: 'Professional Kathak Dancer · 12+ Years of Experience',
      profileImage: 'http://localhost:5000/uploads/manju_dubey.jpg',
      photoUrl: 'http://localhost:5000/uploads/manju_dubey.jpg',
      introductionVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },

    registrationOpensAt: new Date(now - 4 * day),
    registrationClosesAt: new Date(now + 1 * day + 6 * 60 * 60 * 1000 + 28 * 60 * 1000 + 32 * 1000),
    submissionStartsAt: new Date(now - 2 * day),
    submissionEndsAt: new Date(now + 24 * day),
    resultDate: new Date(now + 26 * day),

    aboutText:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    description:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',

    // Requirement #13: Structured Judging Parameters with percentages summing to exactly 100%
    judgingParametersText:
      'Entries are judged on technique, rhythm (Taal), emotional expression (Bhava), choreography originality, costume, and overall stage presence by our panel of professional dancers.',
    judgingParameters: [
      {
        name: 'Technique & Footwork',
        description: 'Precision of Tatkar, poses (Angashuddhi), and body posture clarity',
        percentage: 30,
      },
      {
        name: 'Rhythm & Taal Sync',
        description: 'Accurate synchronization with beats, laya control, and musicality',
        percentage: 25,
      },
      {
        name: 'Emotional Expression (Bhava)',
        description: 'Facial expressions (Mukhabhinaya), storytelling, and emotional depth',
        percentage: 25,
      },
      {
        name: 'Choreography & Presentation',
        description: 'Originality, stage presence, traditional costume, and ghungroo clarity',
        percentage: 20,
      },
    ],

    rules:
      'Open to all age groups and skill levels. One entry per participant. Video performance must be continuous and unedited between 1 to 10 minutes. Traditional Indian classical styles allowed: Kathak, Bharatanatyam, Odissi, Kathakali, Kuchipudi, Manipuri, Mohiniyattam.',
    eligibility:
      'Open to all age groups and skill levels across India. Both solo classical dancers and students can participate.',
    rulesAndEligibility:
      'Open to all age groups and skill levels. One entry per participant. Video performance must be continuous and unedited between 1 to 10 minutes. Traditional Indian classical styles allowed: Kathak, Bharatanatyam, Odissi, Kathakali, Kuchipudi, Manipuri, Mohiniyattam.',

    // Requirement #14: Dynamic rewards stored in MongoDB
    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],

    // Requirement #12 & #19: No fake hardcoded previous winners disguised as real history
    previousWinners: [],

    disclaimerText: 'Only contributions from paid participants will be considered for judging.',
    prizeMoneyInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',

    referral: { earnAmountPerSignup: 10 },
    isPublished: true,
  });

  // Initial verified registration to demonstrate live 1 / 20 booked -> 19 spots left
  await Registration.create({
    competition: competition._id,
    user: user._id,
    entryFeePaid: competition.entryFee,
    paymentId: 'pay_init_seed_1',
    paymentStatus: 'paid',
    status: 'active',
  });

  console.log('[seed] Database seeded successfully!');
  console.log('[seed] User:', user.name, `<${user.email}>`);
  console.log('[seed] Competition ID:', competition._id.toString());

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
