# Feedants Competition API (backend)

Node.js + Express 5 + MongoDB (Mongoose 8). Implements `../docs/API_CONTRACT.md`.

## Run

```bash
cd backend
npm install
npm run dev        # http://0.0.0.0:4000/api/v1 — no MongoDB needed
npm test           # unit + integration + concurrency tests (in-memory replica set)
```

When `MONGODB_URI` is unset, `npm run dev` starts an **in-memory single-node replica set**
(`mongodb-memory-server`, downloads a mongod binary on the first run) and seeds demo data. Data is lost on exit.

With a real database (it must be a replica set because the app uses transactions):

```bash
docker compose up -d                       # mongo:7, --replSet rs0, auto rs.initiate via healthcheck
export MONGODB_URI="mongodb://localhost:27017/feedants?replicaSet=rs0&directConnection=true"
npm run seed                               # wipes + seeds demo data
npm run dev                                # or: npm start
```

For a phone on the LAN, set `PUBLIC_BASE_URL=http://<your-LAN-IP>:4000` (used for upload URLs) and point the app at the same host.

Demo users (via `POST /api/v1/auth/dev-login {"email": …}`): `amit@feedants.dev` (not registered for the main competition),
`priya@feedants.dev` (confirmed), `rahul@feedants.dev`, `sneha@feedants.dev`, plus `participant1..20@feedants.dev`.
Demo competitions: `feedants-classical-dance` (the design), `feedants-bharatanatyam-open` (full),
`feedants-folk-fest` (judging), `feedants-kathak-finals` (results), `feedants-free-freestyle` (free).

## Environment

Every variable is documented in [`.env.example`](.env.example) (copy it to `.env`). The main ones:
`PORT` (4000), `HOST` (0.0.0.0), `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `ENABLE_DEV_LOGIN`, `PAYMENT_MODE` (mock|live),
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SEAT_HOLD_MINUTES` (10), `HOLD_SWEEP_INTERVAL_MS`, `PUBLIC_BASE_URL`, `CORS_ORIGIN`,
`RATE_LIMIT_*`, `UPLOAD_*`, `LOG_LEVEL`.

## Endpoints (`/api/v1`)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | – | DB readiness |
| POST | `/auth/dev-login` | – | `{ email }` → `{ token, user }` (only when `ENABLE_DEV_LOGIN=true`) |
| GET | `/auth/users` | – | dev user switcher |
| GET | `/me` | ✓ | current user |
| GET | `/me/referral` | ✓ | code, link, signups, earned |
| GET | `/competitions/:idOrSlug?lang=en\|hi` | optional | details + availability + lifecycle + viewer / anonymousAction |
| GET | `/competitions/:idOrSlug/availability` | – | polling; `ETag` + `Cache-Control: public, max-age=2` |
| GET | `/competitions/:idOrSlug/testimonials?limit=10` | – | |
| POST | `/competitions/:idOrSlug/registrations` | ✓ + Idempotency-Key | reserve seat (201 new hold / 200 existing hold) |
| POST | `/payments/mock/checkout` | ✓ | `{ orderId }` → Razorpay-style signed triple (mock mode only) |
| POST | `/registrations/:id/verify-payment` | ✓ + Idempotency-Key | HMAC verification → confirmed |
| DELETE | `/registrations/:id` | ✓ | cancel own pending hold |
| POST | `/uploads` | ✓ | multipart `file` (video/* or image/*, ≤ 50 MB) |
| POST | `/competitions/:idOrSlug/submissions` | ✓ + Idempotency-Key | `{ mediaUrl, caption? }` |
| GET | `/competitions/:idOrSlug/submissions/me` | ✓ | |

Errors always look like `{ "error": { "code", "message", "details"? } }`, with the codes and statuses listed in the contract.

## Architecture

```
src/
  config/       env (zod-validated), logger (pino), db (connect / in-memory replset / index sync)
  models/       Mongoose schemas + indexes
  routes/       routing + per-route middleware (auth → rate limit → idempotency → zod validation)
  controllers/  thin HTTP adapters
  services/     business logic
    lifecycle.js              pure functions: phase, flags, nextDeadline, availability, primaryAction
    registration.service.js   seat reservation / hold release / cancel
    payment.service.js        HMAC sign + verify (timingSafeEqual), confirm / re-reserve
    submission.service.js     submission rules
  middleware/   auth, validate, idempotency, rateLimit, errorHandler
  jobs/         holdSweeper (every 30 s)
  seed.js       demo data relative to "now"
  app.js / server.js (graceful shutdown)
```

### Key decisions

- **Seat consistency.** `bookedCount` is a denormalised counter on the competition, so reading availability costs one document read.
  A registration runs in one transaction that does a conditional `findOneAndUpdate({ status: 'published', window open, $expr: bookedCount < capacity }, { $inc: 1 })`
  and inserts the registration. Both writes commit or neither does. Under contention MongoDB raises WriteConflict, and
  `withTransaction` retries it. A **unique partial index** on `(competitionId, userId)` for `pending_payment|confirmed` blocks duplicate
  active registrations, even when two requests race. Invariant: `bookedCount == count(active registrations) ≤ capacity`. The tests assert it after
  every scenario, including 50 parallel registrations competing for 15 seats.
- **Seat holds.** A paid registration holds its seat for `SEAT_HOLD_MINUTES`. Expired holds move to `expired` and the seat is decremented in a
  transaction. The move is conditional on the status, so it is idempotent: the sweeper can run on every instance and also
  runs lazily when the user reads or registers again. If a user pays after the hold lapsed, the backend confirms the registration when the seat is
  still counted or can be taken again. Otherwise it returns `HOLD_EXPIRED` and marks the registration `refunded` for a refund.
- **Payments.** The mock checkout creates a real `HMAC_SHA256(orderId|paymentId, secret)`, so verification uses the production code path.
- **Idempotency.** The first request claims `(key, user, route)` in `idempotencykeys` (24 h TTL) and the final response (<500) is stored.
  Replays return that stored response with `Idempotent-Replayed: true`. Reusing a key with a different body, or while the first request is still running, returns `IDEMPOTENCY_CONFLICT`.
- **Time.** The server clock decides everything. Every competition response carries `serverTime`, so the client can correct its countdowns.
- **Money** is stored as integer paise. **i18n**: `{ en, hi }` fields are resolved on the server from `?lang`.

### Assumptions / trade-offs

- `submissionOpen` and `registrationOpen` also require `status === 'published'`, so a cancelled competition is never open.
- `lifecycle.nextDeadline` is the earliest future lifecycle event (the design countdown shows "Registration closes in").
- Dev login stands in for OTP auth. Uploads go to local disk (production would use S3 presigned PUT plus a CDN). Rate limits use an in-memory store (production would use Redis).

### Production next steps

Razorpay Orders API plus a webhook (`payment.captured`) as a second confirmation path, a refund worker for `refunded` rows,
Redis for rate limits and the availability cache, a shared-lock sweeper or queue (e.g. BullMQ), OpenAPI spec, and metrics/tracing.
