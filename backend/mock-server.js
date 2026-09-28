'use strict';
const http = require('http');
const crypto = require('crypto');
const PORT = process.env.PORT || 5000;
const DAY = 24 * 60 * 60 * 1000;
const n = Date.now();
const iso = (d) => (d ? new Date(d).toISOString() : null);
const t = (v) => (v && typeof v === 'object' ? v.en || v.hi || '' : v || '');

// Secure scrypt password hashing
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

// In-memory users store
const usersDb = new Map();
const demoSalt = 'feedants-demo-salt';
const demoUser = {
  id: 'user-001',
  name: 'Feedants Participant',
  email: 'user@feedants.dev',
  salt: demoSalt,
  passwordHash: hashPassword('password123', demoSalt),
  referralEarnings: 0,
  wonCount: 0,
  profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
};
usersDb.set(demoUser.email.toLowerCase(), demoUser);

let currentUser = demoUser;

const userRegistrations = new Map(); // competitionId/slug -> registration object
const userSubmissions = new Map();   // competitionId/slug -> array of submissions

function computeAvailability(c) {
  const booked = Math.min(Math.max(c.bookedCount || 0, 0), c.capacity);
  const remaining = Math.max(c.capacity - booked, 0);
  return { capacity: c.capacity, booked, remaining, isFull: remaining === 0 };
}

function computeLifecycle(c, nowDate) {
  const nd = nowDate.getTime();
  const d = c.dates;
  const published = c.status === 'published';
  const registrationOpen = published && new Date(d.registrationOpensAt) <= nowDate && nowDate < new Date(d.registrationClosesAt);
  const submissionOpen = published && new Date(d.submissionStartsAt) <= nowDate && nowDate < new Date(d.submissionEndsAt);
  const resultsOut = published && nd >= new Date(d.resultAt).getTime();
  let phase;
  if (resultsOut) phase = 'results_announced';
  else if (nd >= new Date(d.submissionEndsAt).getTime()) phase = 'judging';
  else if (submissionOpen) phase = 'submission_open';
  else if (registrationOpen) phase = 'registration_open';
  else if (nd >= new Date(d.registrationClosesAt).getTime() && nd < new Date(d.submissionStartsAt).getTime()) phase = 'registration_closed';
  else phase = 'upcoming';
  const events = [
    { type: 'registration_opens', at: d.registrationOpensAt },
    { type: 'registration_closes', at: d.registrationClosesAt },
    { type: 'submission_starts', at: d.submissionStartsAt },
    { type: 'submission_ends', at: d.submissionEndsAt },
    { type: 'result', at: d.resultAt },
  ].filter((e) => new Date(e.at).getTime() > nd).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const nextDeadline = events.length > 0 ? { type: events[0].type, at: iso(events[0].at) } : null;
  return { phase, registrationOpen, submissionOpen, resultsOut, nextDeadline };
}

const competitions = [
  {
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
      registrationOpensAt: new Date(n - 5 * DAY).toISOString(),
      registrationClosesAt: new Date(n + DAY).toISOString(),
      submissionStartsAt: new Date(n - 2 * DAY).toISOString(),
      submissionEndsAt: new Date(n + 20 * DAY).toISOString(),
      resultAt: new Date(n + 22 * DAY).toISOString(),
    },
    about: {
      en: 'Showcase your classical dance skills in this prestigious Feedants competition. Open to all classical dance forms including Bharatanatyam, Kathak, Odissi, Kuchipudi, and more. Compete with top dancers across the country, receive feedback from distinguished masters, and win from a ₹1,500 cash pool.',
      hi: 'इस प्रतिष्ठित फीडेंट्स प्रतियोगिता में अपने शास्त्रीय नृत्य कौशल का प्रदर्शन करें। भरतनाट्यम, कथक, ओडिसी, कुचिपुड़ी और अधिक सहित सभी शास्त्रीय नृत्य रूपों के लिए खुला है।'
    },
    judgingParameters: [
      { name: 'Technique & Footwork', description: 'Technical precision, posture, and mudras.', percentage: 35 },
      { name: 'Abhinaya & Expression', description: 'Facial expressions and emotional portrayal.', percentage: 25 },
      { name: 'Rhythm & Taal', description: 'Sync with the rhythm, laya, and beat cycles.', percentage: 20 },
      { name: 'Costume & Presentation', description: 'Traditional attire, makeup, and stage presence.', percentage: 20 },
    ],
    rules: [
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
    prizeInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    referral: {
      shareLink: 'https://feedants.com/r/feedants-classical-dance',
      earnAmountPerSignup: 10,
    },
    judge: {
      name: 'Pandit Rajendra Sharma',
      title: 'Classical Dance Expert - 30+ Years',
      profession: 'Kathak Guru',
      experience: '30+ Years Experience',
      experienceLabel: 'Kathak Guru · 30+ Years Exp',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
  },
  {
    id: 'comp-002',
    slug: 'feedants-bharatanatyam-open',
    title: { en: 'Bharatanatyam Open Championship', hi: 'भरतनाट्यम ओपन' },
    category: 'Classical Dance',
    tags: ['Classical', 'Dance'],
    certificate: true,
    prizePool: 800,
    entryFee: 49,
    currency: 'INR',
    capacity: 25,
    bookedCount: 6,
    status: 'published',
    dates: {
      registrationOpensAt: new Date(n - 3 * DAY).toISOString(),
      registrationClosesAt: new Date(n + 3 * DAY).toISOString(),
      submissionStartsAt: new Date(n - 1 * DAY).toISOString(),
      submissionEndsAt: new Date(n + 15 * DAY).toISOString(),
      resultAt: new Date(n + 18 * DAY).toISOString(),
    },
    about: {
      en: 'A premier Bharatanatyam showcase for passionate dancers. Present your finest Varnam, Tillana, or Jatiswaram and gain nationwide recognition.',
    },
    judgingParameters: [
      { name: 'Nritta (Pure Dance)', description: 'Footwork rhythm and geometric clarity.', percentage: 40 },
      { name: 'Nritya (Expressive)', description: 'Navarasas and storytelling abhinaya.', percentage: 35 },
      { name: 'Angashuddhi & Grace', description: 'Body line clarity and poise.', percentage: 25 },
    ],
    rules: [
      'Solo Bharatanatyam recital recorded in single take.',
      'Appropriate temple costume and ankle bells required.',
    ],
    rewards: [
      { position: 1, label: '1st Winner', amount: 400 },
      { position: 2, label: '2nd Winner', amount: 250 },
      { position: 3, label: '3rd Winner', amount: 150 },
    ],
    disclaimer: 'Certified Bharatanatyam jury evaluation. Results are final.',
    prizeInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    referral: {
      shareLink: 'https://feedants.com/r/bharatanatyam-open',
      earnAmountPerSignup: 10,
    },
    judge: {
      name: 'Dr. Meenakshi Sunderam',
      title: 'Kalakshetra Scholar & Veteran Dancer',
      profession: 'Bharatanatyam Acharya',
      experience: '25+ Years Experience',
      experienceLabel: 'Bharatanatyam Acharya · 25+ Years',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    },
  },
  {
    id: 'comp-003',
    slug: 'feedants-bollywood-dance-fest',
    title: { en: 'Bollywood Beats Showdown', hi: 'बॉलीवुड बीट्स' },
    category: 'Bollywood',
    tags: ['Bollywood', 'High Energy'],
    certificate: true,
    prizePool: 600,
    entryFee: 0,
    currency: 'INR',
    capacity: 100,
    bookedCount: 34,
    status: 'published',
    dates: {
      registrationOpensAt: new Date(n - 4 * DAY).toISOString(),
      registrationClosesAt: new Date(n + 7 * DAY).toISOString(),
      submissionStartsAt: new Date(n - 2 * DAY).toISOString(),
      submissionEndsAt: new Date(n + 14 * DAY).toISOString(),
      resultAt: new Date(n + 16 * DAY).toISOString(),
    },
    about: {
      en: 'Electrifying Bollywood dance contest. Show your energy, transitions, and cinematic groove to trending tracks.',
    },
    judgingParameters: [
      { name: 'Energy & Flow', description: 'Dynamic movement and stamina.', percentage: 40 },
      { name: 'Choreography', description: 'Creativity and originality of routine.', percentage: 35 },
      { name: 'Performance & Aura', description: 'Screen presence and engagement.', percentage: 25 },
    ],
    rules: ['1 to 4 minute Bollywood routine.', 'Solo or duo allowed.'],
    rewards: [
      { position: 1, label: '1st Winner', amount: 300 },
      { position: 2, label: '2nd Winner', amount: 200 },
      { position: 3, label: '3rd Winner', amount: 100 },
    ],
    disclaimer: 'Free entry contest. Jury decision is final.',
    prizeInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    referral: {
      shareLink: 'https://feedants.com/r/bollywood-showdown',
      earnAmountPerSignup: 10,
    },
    judge: {
      name: 'Choreographer Aryan Roy',
      title: 'Bollywood Industry Choreographer',
      profession: 'Film Choreographer',
      experience: '12+ Years Experience',
      experienceLabel: 'Film Choreographer · 12+ Years',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    },
  },
  {
    id: 'comp-004',
    slug: 'feedants-contemporary-fusion',
    title: { en: 'Contemporary & Lyrical Expressions', hi: 'समकालीन नृत्य' },
    category: 'Contemporary',
    tags: ['Contemporary', 'Lyrical'],
    certificate: true,
    prizePool: 450,
    entryFee: 39,
    currency: 'INR',
    capacity: 50,
    bookedCount: 18,
    status: 'published',
    dates: {
      registrationOpensAt: new Date(n - 6 * DAY).toISOString(),
      registrationClosesAt: new Date(n + 4 * DAY).toISOString(),
      submissionStartsAt: new Date(n - 1 * DAY).toISOString(),
      submissionEndsAt: new Date(n + 18 * DAY).toISOString(),
      resultAt: new Date(n + 21 * DAY).toISOString(),
    },
    about: {
      en: 'Explore storytelling through fluid contemporary, modern, and lyrical movement.',
    },
    judgingParameters: [
      { name: 'Fluidity & Form', description: 'Seamless transitions and extension.', percentage: 40 },
      { name: 'Emotional Storytelling', description: 'Narrative depth and immersion.', percentage: 35 },
      { name: 'Spatial Awareness', description: 'Floor work and level dynamics.', percentage: 25 },
    ],
    rules: ['Original choreography 2-5 minutes in length.'],
    rewards: [
      { position: 1, label: '1st Winner', amount: 250 },
      { position: 2, label: '2nd Winner', amount: 120 },
      { position: 3, label: '3rd Winner', amount: 80 },
    ],
    disclaimer: 'Decision of the jury is final.',
    prizeInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    referral: {
      shareLink: 'https://feedants.com/r/contemporary-fusion',
      earnAmountPerSignup: 10,
    },
    judge: {
      name: 'Natasha Fernandez',
      title: 'Contemporary Artist & Movement Coach',
      profession: 'Movement Director',
      experience: '15+ Years Experience',
      experienceLabel: 'Movement Director · 15+ Years',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    },
  },
];

const WINNERS = {};

const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Ananya S.',
    author: 'Ananya S.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    text: 'The submission flow was incredibly easy. Loved the live countdown and transparent judging parameters!',
    quote: 'The submission flow was incredibly easy. Loved the live countdown and transparent judging parameters!',
    subtitle: '1st Winner · Classical Dance 2025',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Rohit M.',
    author: 'Rohit M.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    text: 'Clear guidelines, instant spot booking confirmation, and quick support on payment queries.',
    quote: 'Clear guidelines, instant spot booking confirmation, and quick support on payment queries.',
    subtitle: 'Participant · Kathak Finals',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Priya K.',
    author: 'Priya K.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    text: 'I could track my registration and submission status in real time. Highly recommend Feedants!',
    quote: 'I could track my registration and submission status in real time. Highly recommend Feedants!',
    subtitle: '3rd Place Winner',
    rating: 5,
  },
  {
    id: 't4',
    name: 'Vikram D.',
    author: 'Vikram D.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    text: 'Seamless from payment checkout to video preview and judge evaluation. Great platform.',
    quote: 'Seamless from payment checkout to video preview and judge evaluation. Great platform.',
    subtitle: 'Finalist · Folk Fest',
    rating: 5,
  },
];

function findComp(idOrSlug) {
  return competitions.find((c) => c.id === idOrSlug || c.slug === idOrSlug) || competitions[0];
}

function serializeComp(c, winnerList, isRegistered = false) {
  return {
    id: c.id,
    slug: c.slug,
    title: t(c.title),
    category: c.category,
    tags: c.tags || [],
    certificate: !!c.certificate,
    prizePool: c.prizePool,
    entryFee: c.entryFee,
    currency: c.currency,
    judge: c.judge || null,
    dates: {
      registrationOpensAt: iso(c.dates.registrationOpensAt),
      registrationClosesAt: iso(c.dates.registrationClosesAt),
      submissionStartsAt: iso(c.dates.submissionStartsAt),
      submissionEndsAt: iso(c.dates.submissionEndsAt),
      resultAt: iso(c.dates.resultAt),
      resultDate: iso(c.dates.resultAt),
    },
    previousWinners: winnerList || [],
    about: t(c.about),
    tabs: {
      about: t(c.about),
      judgingParameters: c.judgingParameters || [],
      rulesAndEligibility: c.rules || [],
    },
    judgingParameters: c.judgingParameters || [],
    rulesAndEligibility: c.rules || [],
    rewards: (c.rewards || []).sort((a, b) => a.position - b.position).map((r) => ({
      position: r.position,
      label: t(r.label),
      amount: r.amount,
    })),
    disclaimer: t(c.disclaimer),
    disclaimerText: t(c.disclaimer),
    prizeInfoVideoUrl: c.prizeInfoVideoUrl || null,
    prizeMoneyInfoVideoUrl: c.prizeInfoVideoUrl || null,
    referral: c.referral || {
      shareLink: 'https://feedants.com/r/' + c.slug,
      earnAmountPerSignup: 10,
    },
    refundPolicy: null,
    paymentProvider: 'razorpay',
    ad: null,
    status: c.status,
    user: {
      isRegistered,
    },
  };
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(json),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key',
  });
  res.end(json);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch (_) {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key',
    });
    return res.end();
  }

  const url = req.url.split('?')[0];

  // Health
  if (url === '/api/v1/health') {
    return send(res, 200, { status: 'ok', db: true, serverTime: new Date().toISOString() });
  }

  // User Profile: GET /api/v1/me
  if (req.method === 'GET' && url === '/api/v1/me') {
    const allUserSubs = [];
    userSubmissions.forEach((subs, compId) => {
      const comp = competitions.find((c) => c.id === compId || c.slug === compId);
      subs.forEach((s) => {
        allUserSubs.push({
          ...s,
          competitionTitle: comp ? t(comp.title) : 'Dance Competition',
          competitionCategory: comp?.category || 'Dance',
          competitionSlug: comp?.slug || compId,
          prizePool: comp?.prizePool || 50000,
        });
      });
    });

    return send(res, 200, {
      status: 'ok',
      user: {
        ...currentUser,
        submissions: allUserSubs,
      },
    });
  }

  // User Profile: PUT /api/v1/me
  if (req.method === 'PUT' && url === '/api/v1/me') {
    const body = await parseBody(req);
    if (body.name) currentUser.name = body.name.trim();
    if (body.email) currentUser.email = body.email.trim();
    return send(res, 200, { status: 'ok', user: currentUser });
  }

  // Auth: POST /api/v1/auth/sign-in or /api/v1/auth/login or /api/v1/auth/signin
  if (
    req.method === 'POST' &&
    (url === '/api/v1/auth/sign-in' ||
      url === '/api/v1/auth/signin' ||
      url === '/api/v1/auth/login' ||
      url === '/auth/sign-in' ||
      url === '/auth/signin' ||
      url === '/auth/login')
  ) {
    const body = await parseBody(req);
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return send(res, 400, {
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = usersDb.get(email);
    if (!user) {
      return send(res, 401, {
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const hashedInput = hashPassword(password, user.salt);
    if (hashedInput !== user.passwordHash) {
      return send(res, 401, {
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    currentUser = user;
    const token = `jwt_${user.id}_${Date.now()}`;
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      referralEarnings: user.referralEarnings,
      wonCount: user.wonCount,
    };

    return send(res, 200, {
      success: true,
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser,
      },
    });
  }

  // Auth: POST /api/v1/auth/sign-up or /api/v1/auth/signup
  if (
    req.method === 'POST' &&
    (url === '/api/v1/auth/sign-up' ||
      url === '/api/v1/auth/signup' ||
      url === '/auth/sign-up' ||
      url === '/auth/signup')
  ) {
    const body = await parseBody(req);
    const name = (body.name || '').trim();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!name) {
      return send(res, 400, {
        success: false,
        message: 'Full name is required.',
      });
    }

    if (!email || !email.includes('@')) {
      return send(res, 400, {
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    if (!password || password.length < 8) {
      return send(res, 400, {
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    if (usersDb.has(email)) {
      return send(res, 409, {
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, newSalt);

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      salt: newSalt,
      passwordHash,
      referralEarnings: 0,
      wonCount: 0,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    };

    usersDb.set(email, newUser);
    currentUser = newUser;

    const token = `jwt_${newUser.id}_${Date.now()}`;
    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      profileImage: newUser.profileImage,
      referralEarnings: newUser.referralEarnings,
      wonCount: newUser.wonCount,
    };

    return send(res, 201, {
      success: true,
      message: 'Account created successfully!',
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser,
      },
    });
  }

  // Auth: POST /api/v1/auth/dev-login
  if (
    req.method === 'POST' &&
    (url === '/api/v1/auth/dev-login' || url === '/auth/dev-login')
  ) {
    const body = await parseBody(req);
    const email = (body.email || 'user@feedants.dev').trim().toLowerCase();
    let user = usersDb.get(email);
    if (!user) {
      user = demoUser;
    }
    currentUser = user;
    const token = `jwt_${user.id}_${Date.now()}`;
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      referralEarnings: user.referralEarnings,
      wonCount: user.wonCount,
    };
    return send(res, 200, {
      success: true,
      token,
      user: safeUser,
      data: {
        token,
        user: safeUser,
      },
    });
  }

  // Competitions List: GET /api/v1/competitions
  if (req.method === 'GET' && url === '/api/v1/competitions') {
    const items = competitions.map((c) => {
      const avail = computeAvailability(c);
      const isReg = userRegistrations.has(c.id) || userRegistrations.has(c.slug);
      return {
        id: c.id,
        slug: c.slug,
        title: t(c.title),
        category: c.category,
        tags: c.tags || [],
        entryFee: c.entryFee,
        prizePool: c.prizePool,
        status: c.status,
        availability: avail,
        judge: c.judge,
        isRegistered: isReg,
        dates: {
          registrationOpensAt: iso(c.dates.registrationOpensAt),
          registrationClosesAt: iso(c.dates.registrationClosesAt),
          submissionStartsAt: iso(c.dates.submissionStartsAt),
          submissionEndsAt: iso(c.dates.submissionEndsAt),
          resultAt: iso(c.dates.resultAt),
          resultDate: iso(c.dates.resultAt),
        },
      };
    });
    return send(res, 200, { items });
  }

  // Create Competition: POST /api/v1/competitions
  if (req.method === 'POST' && url === '/api/v1/competitions') {
    const body = await parseBody(req);
    const newId = `comp-${String(competitions.length + 1).padStart(3, '0')}`;
    const slug = (body.title || 'new-competition').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newComp = {
      id: newId,
      slug: slug || newId,
      title: { en: body.title || 'Custom Competition' },
      category: body.category || 'Classical Dance',
      tags: [body.category || 'Dance', 'Live'],
      certificate: true,
      prizePool: Number(body.prizePool) || 50000,
      entryFee: Number(body.entryFee) || 0,
      currency: 'INR',
      capacity: 50,
      bookedCount: 0,
      status: 'published',
      dates: {
        registrationOpensAt: new Date().toISOString(),
        registrationClosesAt: new Date(Date.now() + 7 * DAY).toISOString(),
        submissionStartsAt: new Date().toISOString(),
        submissionEndsAt: new Date(Date.now() + 20 * DAY).toISOString(),
        resultAt: new Date(Date.now() + 25 * DAY).toISOString(),
      },
      about: { en: body.about || `Welcome to ${body.title || 'the competition'}! Showcase your talent and compete with top creators.` },
      judgingParameters: [
        { name: 'Performance & Technique', description: 'Technical proficiency and mastery.', percentage: 50 },
        { name: 'Creativity & Impact', description: 'Unique style and artistic interpretation.', percentage: 50 },
      ],
      rules: ['Submissions must be original work.', 'Follow all competition guidelines.'],
      rewards: [
        { position: 1, label: '1st Place', amount: Math.round((Number(body.prizePool) || 50000) * 0.6) },
        { position: 2, label: '2nd Place', amount: Math.round((Number(body.prizePool) || 50000) * 0.4) },
      ],
      disclaimer: 'Decision of the jury is final.',
      prizeInfoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      judge: {
        name: currentUser.name,
        title: 'Host & Organizer',
        profession: 'Competition Host',
        experience: 'Host',
        experienceLabel: 'Host & Organizer',
        photoUrl: currentUser.profileImage,
        introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      },
      referral: {
        shareLink: `https://feedants.com/r/${slug}`,
        earnAmountPerSignup: 10,
      },
    };
    competitions.unshift(newComp);
    return send(res, 201, { success: true, competition: serializeComp(newComp, [], false) });
  }

  // Testimonials: GET /api/v1/competitions/:id/testimonials
  const testMatch = url.match(/^\/api\/v1\/competitions\/([^/]+)\/testimonials$/);
  if (req.method === 'GET' && testMatch) {
    return send(res, 200, { items: TESTIMONIALS });
  }

  // Registrations: POST /api/v1/competitions/:id/registrations
  const regMatch = url.match(/^\/api\/v1\/competitions\/([^/]+)\/registrations$/);
  if (req.method === 'POST' && regMatch) {
    const comp = findComp(regMatch[1]);
    const body = await parseBody(req);
    comp.bookedCount = Math.min((comp.bookedCount || 0) + 1, comp.capacity);
    const regRecord = {
      id: `reg-${Date.now()}`,
      competitionId: comp.id,
      competitionSlug: comp.slug,
      userId: currentUser.id,
      status: 'confirmed',
      paymentMethod: body.paymentMethod || 'upi',
      amount: comp.entryFee,
      confirmedAt: new Date().toISOString(),
    };
    userRegistrations.set(comp.id, regRecord);
    userRegistrations.set(comp.slug, regRecord);
    return send(res, 200, {
      success: true,
      registration: regRecord,
      message: 'Registration confirmed successfully!',
    });
  }

  // Submissions: POST /api/v1/competitions/:id/submissions
  const subMatch = url.match(/^\/api\/v1\/competitions\/([^/]+)\/submissions$/);
  if (req.method === 'POST' && subMatch) {
    const comp = findComp(subMatch[1]);
    const body = await parseBody(req);
    const submissionRecord = {
      id: `sub-${Date.now()}`,
      competitionId: comp.id,
      userId: currentUser.id,
      mediaUrl: body.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      caption: body.caption,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };
    if (!userSubmissions.has(comp.id)) userSubmissions.set(comp.id, []);
    userSubmissions.get(comp.id).push(submissionRecord);
    return send(res, 200, {
      success: true,
      submission: submissionRecord,
      message: 'Video submission uploaded and accepted!',
    });
  }

  // File Upload: POST /api/v1/uploads
  if (req.method === 'POST' && url === '/api/v1/uploads') {
    return send(res, 200, {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    });
  }

  // Details: GET /api/v1/competitions/:id
  const detailMatch = url.match(/^\/api\/v1\/competitions\/([^/]+)$/);
  if (req.method === 'GET' && detailMatch) {
    const comp = findComp(detailMatch[1]);
    const nowDate = new Date();
    const availability = computeAvailability(comp);
    const lifecycle = computeLifecycle(comp, nowDate);
    const winnerList = WINNERS[comp.id] || [];
    const isRegistered = userRegistrations.has(comp.id) || userRegistrations.has(comp.slug);
    const hasSubmission = (userSubmissions.get(comp.id) || []).length > 0;

    let viewer = null;
    let action = null;

    if (isRegistered) {
      viewer = {
        isRegistered: true,
        registration: userRegistrations.get(comp.id) || userRegistrations.get(comp.slug),
        primaryAction: {
          action: 'SUBMIT',
          type: 'SUBMIT',
          label: hasSubmission ? 'Resubmit Video' : 'Upload Submission',
          subLabel: hasSubmission ? '✓ 1 Video Submitted' : '✓ Registered',
          enabled: lifecycle.submissionOpen,
        },
      };
      action = viewer.primaryAction;
    } else {
      viewer = {
        isRegistered: false,
        registration: null,
        primaryAction: {
          action: 'REGISTER',
          type: 'REGISTER',
          label: availability.isFull ? 'Competition Full' : comp.entryFee > 0 ? 'Register Now' : 'Register Free',
          subLabel: availability.isFull ? 'No spots remaining' : `Entry Fee: ₹${comp.entryFee}`,
          enabled: lifecycle.registrationOpen && !availability.isFull,
        },
      };
      action = viewer.primaryAction;
    }

    const anon = {
      action: 'REGISTER',
      type: 'REGISTER',
      label: availability.isFull ? 'Competition Full' : comp.entryFee > 0 ? 'Register Now' : 'Register Free',
      subLabel: availability.isFull ? 'No spots remaining' : `Entry Fee: ₹${comp.entryFee}`,
      enabled: lifecycle.registrationOpen && !availability.isFull,
    };

    return send(res, 200, {
      serverTime: nowDate.toISOString(),
      competition: serializeComp(comp, winnerList, isRegistered),
      availability,
      lifecycle,
      viewer,
      anonymousAction: anon,
    });
  }

  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log('[mock-server] Running at http://localhost:' + PORT + '/api/v1');
  console.log('[mock-server] Serving fully interactive full-stack mock dataset');
});
