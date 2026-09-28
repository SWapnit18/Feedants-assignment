/**
 * Offline / fallback mock data for the Feedants app.
 * Used as a fallback when the backend is unreachable (offline / demo mode).
 * Mirrors the data served by backend/mock-server.js
 */

const DAY = 24 * 60 * 60 * 1000;
const n = Date.now();
const iso = (d) => new Date(d).toISOString();

export const MOCK_COMPETITION = {
  id: 'comp-001',
  slug: 'feedants-classical-dance',
  title: { en: 'Feedants Classical Dance', hi: 'फीडेंट्स शास्त्रीय नृत्य' },
  category: 'Classical Dance',
  tags: ['Dance', 'Multi-Win'],
  certificate: true,
  prizePool: 1500,
  entryFee: 99,
  currency: 'INR',
  capacity: 20,
  bookedCount: 1,
  status: 'published',
  dates: {
    registrationOpensAt: iso(n - 5 * DAY),
    registrationClosesAt: iso(n + DAY),
    submissionStartsAt: iso(n - 2 * DAY),
    submissionEndsAt: iso(n + 20 * DAY),
    resultAt: iso(n + 22 * DAY),
    serverTime: iso(n),
  },
  about: {
    en: 'Showcase your classical dance skills in this prestigious Feedants competition. Open to all classical dance forms including Bharatanatyam, Kathak, Odissi, Kuchipudi, and more. Compete with top dancers across the country, receive feedback from distinguished masters, and win from a Rs 1,500 cash pool.',
    hi: 'इस प्रतिष्ठित फीडेंट्स प्रतियोगिता में अपने शास्त्रीय नृत्य कौशल का प्रदर्शन करें। भरतनाट्यम, कथक, ओडिसी, कुचिपुड़ी और अधिक सहित सभी शास्त्रीय नृत्य रूपों के लिए खुला है।',
  },
  judgingParameters: [
    { name: 'Technique & Footwork', description: 'Technical precision, posture, and mudras.', percentage: 35 },
    { name: 'Abhinaya & Expression', description: 'Facial expressions and emotional portrayal.', percentage: 25 },
    { name: 'Rhythm & Taal', description: 'Sync with the rhythm, laya, and beat cycles.', percentage: 20 },
    { name: 'Costume & Presentation', description: 'Traditional attire, makeup, and stage presence.', percentage: 20 },
  ],
  rulesAndEligibility: [
    'Performance must be continuous, unedited, well-lit with clear classical audio.',
    'Video duration must be between 1 to 10 minutes.',
    'Traditional classical attire (Kathak, Bharatanatyam, Odissi, etc.) is encouraged.',
    'Entries must be original and not published in another active competition.',
  ],
  rewards: [
    { position: 1, label: '1st Winner', amount: 550 },
    { position: 2, label: '2nd Winner', amount: 300 },
    { position: 3, label: '3rd Winner', amount: 240 },
    { position: 4, label: '4th Winner', amount: 200 },
    { position: 5, label: '5th Winner', amount: 130 },
    { position: 6, label: '6th Winner', amount: 80 },
  ],
  disclaimer: 'Results are decided by the judging panel. Decision is final.',
  prizeMoneyInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  referral: {
    shareLink: 'https://feedants.com/r/feedants-classical-dance',
    earnAmountPerSignup: 10,
  },
  judge: {
    name: 'Pandit Rajendra Sharma',
    title: 'Classical Dance Expert - 30+ Years',
    profession: 'Kathak Guru',
    experience: '30+ Years Experience',
    experienceLabel: 'Kathak Guru - 30+ Years Exp',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  previousWinners: [
    {
      name: 'Priya Nair',
      position: 1,
      photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=faces',
      testimonial: 'Winning at Feedants was a dream come true!',
    },
    {
      name: 'Arjun Mehta',
      position: 2,
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      testimonial: 'An incredible platform for serious dancers.',
    },
    {
      name: 'Kavya Reddy',
      position: 3,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      testimonial: 'The judges gave wonderful feedback.',
    },
  ],
  // Computed lifecycle/viewer for offline mode
  state: 'registration_open',
  countdownTargetAt: iso(n + DAY),
  action: {
    action: 'REGISTER',
    type: 'REGISTER',
    label: 'Register Now',
    subLabel: 'Entry Fee: Rs 99',
    enabled: true,
  },
  viewer: {
    isRegistered: false,
    registration: null,
    hasSubmission: false,
    primaryAction: {
      action: 'REGISTER',
      type: 'REGISTER',
      label: 'Register Now',
      subLabel: 'Entry Fee: Rs 99',
      enabled: true,
    },
  },
  availability: { capacity: 20, booked: 1, remaining: 19, isFull: false },
};

export const MOCK_COMPETITIONS_LIST = [MOCK_COMPETITION];

export const MOCK_TESTIMONIALS = [
  {
    id: 't1',
    userName: 'Priya Nair',
    userPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=faces',
    rating: 5,
    text: 'Winning at Feedants was a dream come true! The judges gave detailed, valuable feedback.',
    competitionTitle: 'Classical Dance Championship',
  },
  {
    id: 't2',
    userName: 'Arjun Mehta',
    userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    rating: 5,
    text: 'An incredible platform for serious dancers. Very well organized competition.',
    competitionTitle: 'Bharatanatyam Open',
  },
  {
    id: 't3',
    userName: 'Kavya Reddy',
    userPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    rating: 4,
    text: 'Great experience overall. Prize money was transferred quickly after results.',
    competitionTitle: 'Classical Dance Championship',
  },
];
