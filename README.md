# Feedants – Competition Details (Full Stack Module)

A production-grade, functional full-stack implementation of the **Competition Details** screen for Feedants:
- **Frontend**: React Native (Expo) with responsive design, modular components, and real-time state synchronization
- **Backend**: Node.js + Express.js with robust validation, rate limiting, and concurrency control
- **Database**: MongoDB (Mongoose) with atomic capacity tracking, transactions, and unique index guards

Every piece of information (title, prize pool, entry fee, live spots remaining, timer countdown, dates, judge intro, previous winners, rewards tiers, referral link, payment assurance, and dynamic user CTA buttons) is dynamically served through the backend database.

---

## 1. Project Architecture & Directory Structure

```
feedants-assignment/
├── backend/                       # Node.js + Express + MongoDB REST API
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection with pool management
│   │   ├── models/               # Competition, User, Registration, Submission
│   │   ├── middleware/           # JWT auth, express-validator, rate-limit, error handler
│   │   ├── controllers/          # competitionController, registrationController, etc.
│   │   ├── routes/               # Modular Express API routers
│   │   ├── utils/                # ApiError, asyncHandler, competitionState engine
│   │   ├── seed/seed.js          # Seed dataset matching design reference exactly
│   │   └── server.js             # Server bootstrap & middleware chain
│   └── package.json
└── mobile/                        # React Native (Expo) Application
    ├── src/
    │   ├── api/                  # Axios HTTP client with auth interceptors & API methods
    │   ├── hooks/                # React Query hooks with auto-polling & cache invalidation
    │   ├── theme.js              # Color palette, spacing, typography, and radius design tokens
    │   ├── components/
    │   │   ├── CompetitionHeaderCard.js  # Title, tags, certificate pill, prize, spots progress
    │   │   ├── JudgeCard.js              # Judge profile, credentials & Intro Video modal
    │   │   ├── CountdownBanner.js        # Server-synced live ticking countdown timer
    │   │   ├── ImportantDatesCard.js     # 2x2 grid for registration, submissions & result dates
    │   │   ├── PreviousWinners.js        # Horizontal winners showcase with video playback
    │   │   ├── TabsSection.js            # About / Judging / Rules tabs with expand accordion
    │   │   ├── RewardsList.js            # 1st - 6th rank prize breakdown + disclaimer banner
    │   │   ├── AssuranceCard.js          # Prize money video explainer & Razorpay trust badge
    │   │   ├── ReferEarnCard.js          # Referral link copy + native share action
    │   │   ├── UserFeedbackCard.js       # Testimonials participant review card
    │   │   ├── AdBanner.js               # Dashed ad slot component
    │   │   ├── BottomActionBar.js        # Floating action button (Register / Upload Submission)
    │   │   ├── BottomNavBar.js           # 5-tab bottom navigation (Home, Explore, +, Competitions, Profile)
    │   │   └── SubmissionModal.js        # Interactive video entry submission sheet
    │   ├── screens/
    │   │   └── CompetitionDetailsScreen.js # Main screen matching the design reference
    │   └── utils/
    │       └── dateUtils.js              # Server clock offset & formatters
    ├── App.js
    └── package.json
```

---

## 2. Design Fidelity & Features

| Design Element | Implementation & Visual Polish |
|---|---|
| **Top Navigation** | `← Go back` title and interactive `ENG` / `हिंदी` language toggle pill |
| **Header Card** | `Feedants Classical Dance` title, `✓ Registered` pill badge, `Dance` / `Multi-Win` tags, `🏆 Winners get certificate`, `₹ 1,500` teal prize pool, `₹ 99` entry fee, and `👥 Only 19 spots left` with animated progress track |
| **Judge Section** | Avatar of Judge Manju Dubey, Kathak Dancer credentials, and circular `▶` play button triggering an in-app Intro Video modal |
| **Live Countdown** | Mint container with hourglass icon, dynamic countdown (`01d : 06h : 28m : 32s`), and `⏱️ Hurry up!` status |
| **Important Dates** | 2x2 grid displaying `Register Before (10 Aug 26)`, `Submission Starts (6 Aug 26)`, `Submission Ends (30 Aug 26)`, and `Result Date (1 Sept 26)` |
| **Previous Winners** | Horizontal cards featuring past winners (Riya Shah, Aarav Mehta, Neha Verma, Ishita Chopra) with video thumbnail play badges |
| **Tabs Section** | `About Competition` (with teal active indicator), `Judging Parameters`, `Rules & Eligibility` with `View more ⌄` expand accordion |
| **Rewards Tier** | 6 prize positions (`1st: ₹550` to `6th: ₹80`) with gold/silver/bronze icons + disclaimer box |
| **Trust Assurance** | `How will you receive prize money? Watch video` + `Refund policy` + `Secure payments powered by Razorpay` |
| **Refer & Earn** | Referral link box with one-tap `Copy Link` feedback, `Refer Now` share action, and `You earn ₹10 for every signup` |
| **User Reviews** | `Hear From Our Users - See what participants say about Feedants ›` modal sheet |
| **Ad Slot** | Dashed border `📢 Ad Here` placeholder |
| **Dynamic Bottom Button** | Floating CTA: `Upload Submission` with `Registered` status, or `Register Now` with entry fee |
| **Bottom Navigation Bar** | 5 items: `Home`, `Explore`, `(+) Create`, `Competitions` (active teal), `Profile` |

---

## 3. Concurrency & Data Consistency Strategy

To support **thousands of concurrent users** competing for limited spots without race conditions:

1. **Atomic Check-and-Increment:**
   - Rather than checking spots in application memory, capacity is verified atomically in MongoDB via `$expr: { $lt: ['$spotsBooked', '$totalSpots'] }` within a `findOneAndUpdate` operation.
   - Only the winning request acquires the spot; subsequent racing requests receive matched count 0 and an instant 409 `All spots booked`.
2. **Duplicate Registration Guard:**
   - A compound unique partial index on `Registration { competition: 1, user: 1, status: 'active' }` guarantees that racing duplicate requests from the same user cannot create duplicate bookings.
3. **Transactions & Compensating Rollback:**
   - Wrapped in MongoDB multi-document sessions/transactions (with automatic fallback compensation for standalone dev instances), guaranteeing atomicity across both `Competition` capacity updates and `Registration` document creations.
4. **Server-Anchored Countdown:**
   - Device clocks drift and can be tampered with. The API returns `dates.serverTime` with every response. The client computes a server-clock offset once, preventing false expiration or deadline bypass.

---

## 4. Setup & Running Locally

### Step 1: Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run seed      # Seeds Feedants Classical Dance competition & demo user
npm run dev       # Starts Express server on http://localhost:5000
```

### Step 2: Mobile App Setup

```bash
cd ../mobile
npm install
npx expo start
```

Press `w` for web, `a` for Android emulator, `i` for iOS simulator, or scan the QR code with **Expo Go**.

---

## 5. API Reference

- `GET /api/competitions` – Returns featured or all active competitions.
- `GET /api/competitions/:id` – Returns complete dynamic screen payload, dates, capacity, user state, and derived action button.
- `GET /api/competitions/:id/winners` – Returns previous winners dataset.
- `POST /api/competitions/:id/register` – Concurrency-safe atomic registration.
- `POST /api/competitions/:id/submissions` – Performance entry upload endpoint.
- `POST /api/auth/login` – Authentication token endpoint for testing.

---

## 6. Submission Details & Design Rationale

### A. Important Assumptions Made
1. **Curated Showcase for Previous Winners**: Previous winners are modeled as an embedded showcase array on the `Competition` schema rather than computed dynamically from historical user documents, ensuring past winners are preserved regardless of account deletion.
2. **Server-Authoritative Clock**: Device clocks can drift or be altered. Deadlines and the ticking countdown are anchored against the server timestamp offset (`dates.serverTime`) returned by the API.
3. **Simulated Payment Gateway**: The assignment models Razorpay tokenization safely without exposing private gateway secrets on client devices.

### B. Major Technical Decisions
1. **Atomic Check-and-Increment**: To survive thousands of concurrent users competing for limited seats, capacity validation is enforced at the database layer via `$expr: { $lt: ['$spotsBooked', '$totalSpots'] }` within an atomic `findOneAndUpdate`.
2. **Stateless Dynamic State Machine**: Competition phases (`UPCOMING`, `REGISTRATION_OPEN`, `SUBMISSION_OPEN`, `JUDGING`, `RESULTS_DECLARED`) are derived pure-functionally on read from timestamps and counters in [`competitionState.js`](file:///c:/Users/patel/Desktop/feedants-assignment/backend/src/utils/competitionState.js), preventing state drift without requiring background cron workers.
3. **Compound Unique Index Guard**: A partial unique index on `Registration { competition: 1, user: 1, status: 'active' }` guarantees duplicate requests cannot register a user twice.
4. **Design Tokens & Unified Theme**: Extracted typography, colors, borders, and elevation tokens into [`theme.js`](file:///c:/Users/patel/Desktop/feedants-assignment/mobile/src/theme.js) to guarantee 100% pixel accuracy with Feedants design guidelines.

### C. Trade-offs Considered
1. **Short Polling vs. WebSockets**: Implemented a 15-second polling interval with React Query focus-refetching for the demo. In ultra-high traffic environments, MongoDB Change Streams + Redis Pub/Sub + WebSockets would be the preferred event-driven approach.
2. **Direct Video Upload vs. API Multipart**: Used modular URL payloads with local disk fallback for developer ease; in production, pre-signed S3/GCS URLs should be used so large video binaries never hit Node.js API servers directly.

### D. Production Improvements Roadmap
1. **Redis Caching Layer**: Add a Redis cache in front of `GET /api/competitions/:id` with cache-invalidation on registration/submission writes to achieve sub-5ms read latencies under peak traffic.
2. **Razorpay Signature Webhooks**: Integrate full server-side signature verification where `Registration` activation occurs strictly upon webhook confirmation.
3. **Distributed Sharding**: Shard the MongoDB collection by `competitionId` to isolate write contention for viral competitions.
4. **Media Transcoding**: Integrate AWS MediaConvert or Cloudinary to generate adaptive bitrate streams (HLS/DASH) for judging video playback across mobile connections.
