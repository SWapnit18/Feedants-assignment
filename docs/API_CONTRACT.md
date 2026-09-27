# Feedants Competition Details — API Contract (source of truth)

Both `backend/` and `mobile/` MUST follow this contract exactly. Base path: `/api/v1`.
Default dev server: `http://localhost:4000`.

## Conventions

- JSON only. All timestamps are ISO-8601 UTC strings. All money is **integer paise** (`amount: 9900` = ₹99). Currency `"INR"`.
- Every response for competition data includes `serverTime` (ISO) so the client can compute clock offset for countdowns (never trust device clock).
- Language: `?lang=en|hi` (default `en`). Localized DB fields are stored as `{ en, hi }` and resolved server-side into plain strings.
- Auth: `Authorization: Bearer <jwt>`. Detail endpoints work anonymously (viewer = null); mutating endpoints require auth.
- Errors: `{ "error": { "code": "SOME_CODE", "message": "Human readable", "details"?: any } }` with proper HTTP status.
  Error codes: `VALIDATION_ERROR`(400), `UNAUTHENTICATED`(401), `FORBIDDEN`(403), `NOT_FOUND`(404),
  `ALREADY_REGISTERED`(409), `COMPETITION_FULL`(409), `REGISTRATION_CLOSED`(409), `REGISTRATION_NOT_OPEN`(409),
  `SUBMISSION_WINDOW_CLOSED`(409), `NOT_REGISTERED`(403), `ALREADY_SUBMITTED`(409), `HOLD_EXPIRED`(410),
  `PAYMENT_VERIFICATION_FAILED`(400), `IDEMPOTENCY_CONFLICT`(409), `RATE_LIMITED`(429), `INTERNAL`(500).
- Mutating POSTs accept an `Idempotency-Key` header (UUID). Same key + same user → same stored response replayed.

## Auth (demo)

`POST /auth/dev-login` body `{ "email": "amit@feedants.dev" }` → `{ token, user: { id, name, avatarUrl, referralCode } }`
(enabled only when `ENABLE_DEV_LOGIN=true`; real OTP login is out of scope).
`GET /auth/users` (dev only) → `{ users: [{ id, name, email, avatarUrl }] }` — lets the app offer a user switcher for demoing multi-user concurrency.
`GET /me` → `{ user }`.

## Competition details

`GET /competitions/:idOrSlug?lang=en` (optional auth) → 200:

```jsonc
{
  "serverTime": "2026-09-27T12:00:00.000Z",
  "competition": {
    "id": "…", "slug": "feedants-classical-dance",
    "title": "Feedants Classical Dance",
    "category": "Dance",
    "tags": ["Dance", "Multi-Win"],          // chips
    "certificate": true,                      // "Winners get certificate"
    "prizePool": 150000, "entryFee": 9900, "currency": "INR",
    "judge": { "name": "Manju Dubey", "title": "Professional Kathak Dancer", "experienceYears": 12,
               "avatarUrl": "https://…", "introVideoUrl": "https://…mp4" },
    "dates": {
      "registrationOpensAt": "…", "registrationClosesAt": "…",
      "submissionStartsAt": "…", "submissionEndsAt": "…", "resultAt": "…"
    },
    "previousWinners": [ { "id": "…", "name": "Riya Shah", "positionLabel": "1st Winner", "position": 1,
                            "thumbnailUrl": "https://…", "videoUrl": "https://…mp4" } ],
    "tabs": {
      "about": "long text (may contain \n)",
      "judgingParameters": ["Technique & precision (30%)", "…"],
      "rulesAndEligibility": ["Open to all age groups", "…"]
    },
    "rewards": [ { "position": 1, "label": "1st Winner", "amount": 55000 } ],   // sorted by position
    "disclaimer": "Only contributions from paid participants will be considered for judging.",
    "prizeInfoVideoUrl": "https://…mp4",
    "refundPolicy": "text",
    "paymentProvider": "razorpay",
    "ad": null | { "imageUrl": "…", "targetUrl": "…", "label": "…" },
    "status": "published" | "cancelled"
  },
  "availability": { "capacity": 20, "booked": 1, "remaining": 19, "isFull": false },
  "lifecycle": {
    "phase": "upcoming" | "registration_open" | "registration_closed" | "submission_open" | "judging" | "results_announced" | "cancelled",
    "registrationOpen": true, "submissionOpen": true, "resultsOut": false,
    "nextDeadline": { "type": "registration_closes" | "registration_opens" | "submission_starts" | "submission_ends" | "result", "at": "…" } | null
  },
  "viewer": null | {
    "registration": null | { "id": "…", "status": "pending_payment" | "confirmed", "holdExpiresAt": "…" | null },
    "submission": null | { "id": "…", "status": "received", "mediaUrl": "…", "submittedAt": "…" },
    "primaryAction": {
      "type": "login" | "register" | "complete_payment" | "upload_submission" | "view_submission"
              | "submission_not_started" | "registration_closed" | "full" | "not_open_yet" | "judging" | "view_results" | "cancelled",
      "enabled": true,
      "label": "Upload Submission",
      "subLabel": "Registered" | null
    }
  }
}
```

Phase rule (registration and submission windows may overlap, as in the design):
cancelled > results_announced (now ≥ resultAt) > judging (now ≥ submissionEndsAt) > submission_open (now in submission window) >
registration_open (now in registration window) > registration_closed (after regCloses, before submissionStarts) > upcoming.
`registrationOpen = status published && registrationOpensAt ≤ now < registrationClosesAt`.
`submissionOpen = submissionStartsAt ≤ now < submissionEndsAt`.
When viewer is null (anonymous), still compute `primaryAction` for an anonymous user with type `login` if registration is open, otherwise the phase-based action; send it inside `"anonymousAction"` at top level. (i.e. top-level field `anonymousAction` present only when viewer is null.)

`primaryAction` decision (logged-in):
1. cancelled → `cancelled`, disabled.
2. confirmed registration:
   - submission exists → `view_submission` (enabled), subLabel "Submitted"
   - submissionOpen → `upload_submission` enabled, label "Upload Submission", subLabel "Registered"
   - now < submissionStartsAt → `submission_not_started` disabled, subLabel "Registered"
   - resultsOut → `view_results`; else `judging` disabled.
3. pending_payment with hold not expired → `complete_payment` enabled.
4. no registration: registrationOpen && !isFull → `register` enabled label "Register Now · ₹99";
   isFull → `full` disabled; before opens → `not_open_yet`; otherwise `registration_closed` disabled (or `view_results` if resultsOut).

`GET /competitions/:id/availability` → `{ serverTime, availability, lifecycle }` — cheap endpoint for polling (clients poll every ~10s while screen focused). Sets `Cache-Control: public, max-age=2` and ETag.

`GET /competitions/:id/testimonials?limit=10` → `{ items: [{ id, name, avatarUrl, text, rating }] }` ("Hear From Our Users").

## Registration + payment (seat hold model)

`POST /competitions/:id/registrations` (auth, `Idempotency-Key`) → 
- Atomically reserves a seat: `competitions.updateOne({ _id, status:'published', bookedCount: { $lt: capacity } }, { $inc: { bookedCount: 1 } })` inside a MongoDB transaction with the registration insert. Unique partial index on `(competitionId, userId)` for active registrations prevents duplicates.
- Paid competition → 201 `{ registration: { id, status: "pending_payment", holdExpiresAt }, payment: { provider: "razorpay", orderId, amount, currency, keyId, mock: true } }`. Seat is held for `SEAT_HOLD_MINUTES` (default 10). Expired holds are released (bookedCount decremented, status `expired`) by a periodic sweeper and lazily on read.
- Free competition (entryFee 0) → 201 with status `confirmed` and `payment: null`.
- If user already has an active pending hold, return it (200) instead of creating a new one.

`POST /payments/mock/checkout` body `{ orderId }` (auth, only when `PAYMENT_MODE=mock`) → `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` — simulates the Razorpay checkout sheet; the signature is a real HMAC-SHA256(`orderId|paymentId`, RAZORPAY_KEY_SECRET) so the verify path is identical to production.

`POST /registrations/:id/verify-payment` (auth, `Idempotency-Key`) body `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` →
200 `{ registration: { id, status: "confirmed" } }`. Verifies HMAC; if hold expired but a seat is still available it re-reserves atomically, otherwise `HOLD_EXPIRED` (and in prod would trigger refund). Idempotent: verifying an already-confirmed registration returns 200.

`DELETE /registrations/:id` (auth) — cancel an own pending hold → releases seat. 200 `{ registration: { id, status: "cancelled" } }`. Confirmed registrations cannot be cancelled here (409 `FORBIDDEN`).

## Submissions

`POST /uploads` (auth, multipart field `file`, video/* or image/*, max 50MB) → `{ url, mimeType, size }` (local disk storage in dev; S3 presigned in prod — documented).
`POST /competitions/:id/submissions` (auth, `Idempotency-Key`) body `{ mediaUrl, caption? }` → 201 `{ submission }`.
Requires confirmed registration and submissionOpen. One submission per user per competition (unique index).
`GET /competitions/:id/submissions/me` → `{ submission | null }`.

## Referral

`GET /me/referral` (auth) → `{ code, link: "https://feedants.com/r/<code>", rewardPerSignup: 1000, signups: 3, earned: 3000 }`.

## Collections (MongoDB)

- `users` { name, email(unique), avatarUrl, referralCode(unique), referredBy? }
- `competitions` { slug(unique), title{en,hi}, category, tags[], certificate, prizePool, entryFee, currency, capacity, bookedCount,
  judge{…}, dates{…}, previousWinners[], about{en,hi}, judgingParameters[{en,hi}], rules[{en,hi}], rewards[], disclaimer{en,hi},
  prizeInfoVideoUrl, refundPolicy{en,hi}, ad, status, timestamps } — index on status+dates.registrationClosesAt.
  Invariant: `0 ≤ bookedCount ≤ capacity`, and bookedCount == count(registrations with status in [pending_payment, confirmed]).
- `registrations` { competitionId, userId, status: pending_payment|confirmed|expired|cancelled|refunded, amount, orderId, paymentId,
  holdExpiresAt, confirmedAt, timestamps } — unique partial index (competitionId,userId) where status ∈ {pending_payment, confirmed};
  index (status, holdExpiresAt) for sweeper.
- `submissions` { competitionId, userId, registrationId, mediaUrl, caption, status, timestamps } — unique (competitionId,userId).
- `testimonials` { name, avatarUrl, text{en,hi}, rating, isPublished }
- `idempotencykeys` { key, userId, route, requestHash, statusCode, body, createdAt(TTL 24h) } — unique (key,userId,route).
- `referrals` { referrerId, refereeId(unique), rewardAmount, timestamps }

## Seed data (relative to now so the demo is always live)

Main competition slug `feedants-classical-dance` matching the design: prize pool ₹1,500, fee ₹99, capacity 20, 1 booked,
registration closes in ~1d 6h 28m, submission started 2 days ago, submission ends regClose+20d, result +2d after that.
Rewards 550/300/240/200/130/80. 4 previous winners (Riya Shah 1st, Aarav Mehta 1st, Neha Verma 2nd, Ishita Chopra 3rd).
Extra competitions to demo states: `feedants-bharatanatyam-open` (full: 20/20), `feedants-folk-fest` (registration closed / judging),
`feedants-kathak-finals` (results announced), `feedants-free-freestyle` (free, entryFee 0).
Users: amit@feedants.dev (Amit Rawal, NOT registered for main), priya@feedants.dev (registered+confirmed for main = the 1 booked),
rahul@feedants.dev, sneha@feedants.dev.
