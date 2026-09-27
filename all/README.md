# Feedants: Competition Details (Full-Stack Module)

This is a working version of the Feedants **Competition Details** screen, built with **React Native (Expo)**, **Node.js + Express**, and **MongoDB**.
Everything on the screen comes from the backend: the competition content, available spots, lifecycle dates, countdowns, the user's registration and submission state, the primary button, referral, testimonials and ads. Registration, payment (a mock of Razorpay that uses real signatures), cancelling a seat hold, and uploading a submission all work end to end.

```
feedants-competition/
├── backend/   Express + Mongoose API (see backend/README.md)
├── mobile/    Expo React Native app (see mobile/README.md)
└── docs/      API_CONTRACT.md (API + schema spec), design reference, assignment brief
```

## Quick start

**1. Backend** (Node 20+; installing MongoDB is optional)

```bash
cd backend
cp .env.example .env
npm install
npm run dev          # with no MONGODB_URI set, it starts an in-memory Mongo replica set and seeds it
# or use real Mongo:  docker compose up -d  → set MONGODB_URI in .env → npm run seed → npm run dev
npm test             # unit, integration and concurrency tests
```

The API runs at `http://localhost:4000/api/v1`.

**2. Mobile**

```bash
cd mobile
cp .env.example .env # set EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:4000/api/v1 for a physical phone
npm install
npx expo start       # press i (iOS simulator) / a (Android emulator) or scan the QR code with Expo Go
```

**Demo tips:** tap the **Profile** avatar in the bottom bar to switch between the seeded demo users. This lets you watch spots, registration state and the button change from different users' points of view. The competition switcher opens several seeded competitions, each in a different state: open, full, judging, results out, and free.

## Environment variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `PORT` | backend | `4000` | HTTP port |
| `MONGODB_URI` | backend | *(unset → in-memory replica set)* | Mongo connection string. It must be a replica set, because transactions need one |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | backend | dev value / `7d` | Auth tokens |
| `ENABLE_DEV_LOGIN` | backend | `true` | Turns on the demo login and user listing |
| `PAYMENT_MODE` | backend | `mock` | `mock` simulates the Razorpay checkout |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | backend | test values | Used for the order and the HMAC signature check |
| `SEAT_HOLD_MINUTES` | backend | `10` | How long an unpaid seat stays reserved |
| `PUBLIC_BASE_URL` / `CORS_ORIGIN` | backend | | Upload URLs and CORS |
| `EXPO_PUBLIC_API_URL` | mobile | `http://localhost:4000/api/v1` | API base URL |

See `backend/.env.example` and `mobile/.env.example` for the full lists.

---

## Assumptions

- **Registration and submission windows can overlap.** In the design, submission starts on 6 Aug but registration closes on 10 Aug. So the lifecycle is a set of time-based flags, not one straight line of stages. A single `phase` value is still worked out for display.
- **Registering means paying.** The ₹99 entry fee must be paid, and the disclaimer says only paid participants are judged. Tapping Register reserves a seat for a limited time (`SEAT_HOLD_MINUTES`). The seat becomes confirmed only after the payment signature checks out. Unpaid holds expire and the seat goes back into the pool.
- **Free competitions** (entry fee 0) confirm the seat right away.
- **One registration and one submission per user per competition.**
- **Authentication is out of scope.** It is replaced by a demo login that issues a JWT. A real app would use phone/OTP login.
- **Razorpay is mocked.** The mock creates a real HMAC-SHA256 signature, and the backend checks it with the same code it would use in production. Only the checkout screen is simulated.
- **Content is stored in both languages** (`{ en, hi }`). The server picks the right language, so the client never downloads both.
- **All times are UTC**, and the client adjusts its countdown to the server's clock (`serverTime`). A user who changes the phone's clock can't change what they see.

## Major technical decisions

1. **Seats are booked in one atomic database step.** A conditional update (`bookedCount < capacity → $inc`) and the registration insert run together in a MongoDB transaction. A unique partial index on `(competitionId, userId)` for active registrations stops duplicates. As a result, when many users register at once, the competition never oversells, even across several server instances. A concurrency test sends 50 registrations at once for the remaining spots and checks that exactly the right number succeed.
2. **A stored counter keeps reads fast.** `bookedCount` sits on the competition document, so reading availability costs one indexed lookup instead of counting registrations. The transaction keeps the counter matching the actual active registrations.
3. **Unpaid holds are released in two ways.** A background job frees expired holds, and holds are also freed when a user reads or registers again. This keeps things correct if the job falls behind.
4. **Idempotency keys** on every write (`Idempotency-Key` header, stored with a 24-hour expiry). If a network retry or double-tap resends a request, the server returns the stored response instead of charging or registering twice.
5. **The server decides what the main button does.** It sends `viewer.primaryAction`, and the business rules live in one tested pure function (`lifecycle`). The app only displays the result, so a new client can't get the rules wrong.
6. **Availability can be fetched cheaply and often.** A separate small endpoint sends ETag and short cache headers, and the app checks it every 10 seconds while the screen is open (it pauses when the app is in the background). Because it is cacheable, a CDN can serve it to thousands of viewers.
7. **The backend is layered:** routes → controllers → services → models. Input is validated with zod, errors come back in one standard format with specific codes, and the server has rate limiting, helmet, structured logging and graceful shutdown.
8. **On the mobile side,** React Query manages server data (caching, retries, refetch when the screen regains focus). The screen is built from small, reusable, theme-based components.

## Trade-offs

- **Polling instead of WebSockets or SSE** for the spot count. It is simpler, works with caches and load balancers without extra setup, and a delay of about 10 seconds is fine because the atomic booking step prevents overselling anyway. Pushing live updates is the next step (see below).
- **Transactions require a replica set.** This adds a little setup, so the dev server starts an in-memory replica set automatically.
- **A stored counter vs. counting on every read.** The counter is faster but can drift from the real count. The transaction and the hold-release job keep it accurate, and a reconciliation job would be added in production.
- **Uploads go to local disk** through the API. This is simple for a demo, but in production the files would go straight to S3 using presigned URLs.
- **Content is embedded in the competition document** (judge, rewards, previous winners). These lists are small and always read together, so it takes one read instead of joins. The trade-off is that the same judge's details are copied into each competition.

## What I'd improve for production

- Real OTP authentication, and a real Razorpay integration with a **webhook** as the final source of truth for payments, plus automatic refunds when a payment arrives after the hold has expired.
- Push live spot counts through SSE or WebSockets (Redis pub/sub), and cache competition details in Redis or a CDN, cleared whenever something changes.
- Uploads straight to S3 with presigned URLs, video transcoding, and checks on the content.
- A regular job that re-counts active registrations and corrects `bookedCount` if it has drifted. A waitlist when a competition is full.
- Monitoring (OpenTelemetry, metrics on registration conflicts and hold expiries), load tests (k6), and CI.
- Better accessibility (screen reader labels, dynamic text size), analytics, deep links for referrals, and E2E tests with Detox.

## If the ZIP does not open or run

This distribution intentionally excludes `node_modules`, `.git`, `.expo`, and macOS metadata so the ZIP stays small and portable.

After extracting:

### Backend
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

### Mobile
```bash
cd mobile
npm install
copy .env.example .env
npx expo start
```

For a physical phone, set `EXPO_PUBLIC_API_URL` in `mobile/.env` to your computer's LAN IP, for example:
`http://192.168.1.10:4000/api/v1`

