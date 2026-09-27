require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Competition = require('../models/Competition');
const User = require('../models/User');
const Registration = require('../models/Registration');

async function seed() {
  await connectDB();

  await Promise.all([
    Competition.deleteMany({}),
    Registration.deleteMany({}),
    User.deleteMany({ email: 'demo@feedants.com' }),
  ]);

  const passwordHash = await User.hashPassword('password123');
  const demoUser = await User.create({
    name: 'Demo Participant',
    email: 'demo@feedants.com',
    passwordHash,
  });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const competition = await Competition.create({
    title: 'Feedants Classical Dance',
    tags: ['Dance', 'Multi-Win'],
    hasCertificateForWinners: true,

    prizePool: 1500,
    entryFee: 99,
    currency: 'INR',

    totalSpots: 20,
    spotsBooked: 1,

    judge: {
      name: 'Manju Dubey',
      title: 'Judge',
      experienceLabel: 'Professional Kathak Dancer \u00b7 12+ Years of Experience',
      photoUrl: 'http://localhost:5000/uploads/manju_dubey.jpg',
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },

    // Matches the timeline and live countdown in the design reference
    registrationOpensAt: new Date(now - 4 * day),
    registrationClosesAt: new Date(now + 1 * day + 6 * 60 * 60 * 1000 + 28 * 60 * 1000 + 32 * 1000),
    submissionStartsAt: new Date(now - 2 * day),
    submissionEndsAt: new Date(now + 24 * day),
    resultDate: new Date(now + 26 * day),

    aboutText:
      'This is an online classical dance competition open for all age groups. Participate from anywhere and showcase your talent. Express your passion through traditional dance.',
    judgingParameters:
      'Entries are judged on technique, rhythm (Taal), emotional expression (Bhava), choreography originality, costume, and overall stage presence by our panel of professional dancers.',
    rulesAndEligibility:
      'Open to all age groups and skill levels. One entry per participant. Video performance must be continuous and unedited between 2 to 3 minutes. Traditional Indian classical styles allowed: Kathak, Bharatanatyam, Odissi, Kathakali, Kuchipudi, Manipuri, Mohiniyattam.',

    rewards: [
      { position: 1, label: '1st Winner', amount: 550 },
      { position: 2, label: '2nd Winner', amount: 300 },
      { position: 3, label: '3rd Winner', amount: 240 },
      { position: 4, label: '4th Winner', amount: 200 },
      { position: 5, label: '5th Winner', amount: 130 },
      { position: 6, label: '6th Winner', amount: 80 },
    ],

    previousWinners: [
      {
        name: 'Riya Shah',
        position: 1,
        photoUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
      {
        name: 'Aarav Mehta',
        position: 1,
        photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
      {
        name: 'Neha Verma',
        position: 2,
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
      {
        name: 'Ishita Chopra',
        position: 3,
        photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
    ],

    disclaimerText: 'Only contributions from paid participants will be considered for judging.',
    prizeMoneyInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',

    referral: { earnAmountPerSignup: 10 },
  });

  await Registration.create({
    competition: competition._id,
    user: demoUser._id,
    entryFeePaid: competition.entryFee,
    paymentId: 'seed_payment_1',
    paymentStatus: 'paid',
    status: 'active',
  });

  console.log('Seed complete.');
  console.log('Demo user: demo@feedants.com / password123');
  console.log('Competition id:', competition._id.toString());

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
