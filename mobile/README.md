# Feedants – Competition Details (React Native / Expo)

A functional **Competition Details** screen built with Expo SDK 57, TypeScript (strict) and TanStack Query.
Every value on the screen comes from the backend (`../backend`) as described in `../docs/API_CONTRACT.md`.

## Run

```bash
cd mobile
npm install
cp .env.example .env          # then edit EXPO_PUBLIC_API_URL if needed
npx expo start                # press i (iOS sim), a (Android emu) or scan the QR with Expo Go
```

Start the backend first (`cd ../backend && npm run dev`, port 4000).

| Where the app runs         | `EXPO_PUBLIC_API_URL`                       |
| -------------------------- | ------------------------------------------- |
| iOS simulator / web        | `http://localhost:4000/api/v1` (default)    |
| Android emulator           | `http://10.0.2.2:4000/api/v1` (default on Android) |
| Physical device (Expo Go)  | `http://<your-LAN-IP>:4000/api/v1`          |

Restart `npx expo start -c` after changing `.env`. Media URLs that the backend returns as `localhost`
are rewritten to the configured host so uploads/videos also play on devices.

Checks: `npx tsc --noEmit`, `npx expo-doctor`, `npx expo export --platform ios`.

## Demo helpers

- On first launch the app dev-logs in as **amit@feedants.dev** (`POST /auth/dev-login`).
- Tap the **Profile avatar** in the tab bar (or long-press the competition title) to open **Demo controls**:
  - switch demo user (`GET /auth/users`: Amit, Priya, Rahul and Sneha first, filler users collapsed). Use two devices or switch users to try seat contention.
  - switch competition: `feedants-classical-dance` (main), `-bharatanatyam-open` (full), `-folk-fest` (judging),
    `-kathak-finals` (results), `-free-freestyle` (free entry).
- The ENG / हिंदी toggle is saved and sent as `?lang=` so both API content and UI strings switch.

## What's implemented

- **Primary CTA is driven by the server**: `viewer.primaryAction` / `anonymousAction`. Flows:
  - `register` / `complete_payment` → `POST /registrations` → **PaymentSheet** (mock Razorpay, live "Seat held for 09:59")
    → `POST /payments/mock/checkout` → `POST /registrations/:id/verify-payment` → toast + refetch. "Release seat" calls `DELETE /registrations/:id`.
  - `upload_submission` → **SubmissionSheet**: pick video/image (expo-image-picker) → multipart `POST /uploads`
    with a live progress bar (XHR) → `POST /competitions/:id/submissions`.
  - `view_submission` plays your entry. `view_results` shows an info toast. Disabled states show the server label.
- **Idempotency**: one `Idempotency-Key` (expo-crypto `randomUUID`) per user intent, kept for retries after network errors, 5xx or
  `IDEMPOTENCY_CONFLICT`, and cleared after success or a business error. The checkout result is cached so a verify retry sends the same body.
  A ref lock plus disabled buttons stop double taps.
- **Errors**: every contract error code maps to a localized, friendly message (`src/i18n`). After an error the app refetches.
  `HOLD_EXPIRED` after checkout shows "Seat released — your payment will be refunded"; a 413 upload shows "File is larger than 50 MB".
- **Live data**: availability is polled every 10 s (`/availability`) only while the app is in the foreground (react-query `focusManager` ↔ `AppState`).
  The countdown uses the **server clock** (offset measured from `serverTime`, using the request midpoint). When it reaches zero, or when
  polling shows a new lifecycle phase, the details query is invalidated so the lifecycle and CTA refresh.
- Loading skeleton, full-screen error with retry, pull-to-refresh, empty states (no winners, no rewards, no testimonials, no ad → dashed "Ad Here").

## Structure

```
App.tsx                         providers: SafeArea → Query → I18n → Auth → Toast
src/api/        client.ts (fetch wrapper, ApiError, base URL), endpoints.ts, hooks.ts (react-query), types.ts (contract)
src/auth/       AuthProvider (JWT in AsyncStorage, dev-login, silent re-login on 401)
src/hooks/      useServerClock (useServerNow/useCountdown), useIdempotencyKey, useCompetitionActions (CTA orchestration)
src/i18n/       en.ts, hi.ts, provider (persisted language, t(), errorMessage())
src/theme/      colors, spacing, radius, typography (Poppins), shadow
src/utils/      format.ts (paise → "₹1,500", "10 Aug 26", "11:50 PM", countdown)
src/screens/    CompetitionDetailsScreen.tsx
src/components/ AppText, Card, Chip, SectionHeader, ProgressBar, Button, Avatar, Skeleton, BottomSheet, Toast,
                ScreenHeader, LanguageToggle, StatusBadge, CompetitionSummaryCard, PlayButton, JudgeCard, CountdownBanner,
                ImportantDates, PreviousWinners, InfoTabs, RewardsList, DisclaimerBar, PaymentInfoCards, ReferralCard,
                TestimonialsRow, AdSlot, PrimaryCTA, BottomTabBar, VideoModal, ErrorState,
                sheets/{PaymentSheet, SubmissionSheet, TestimonialsSheet, DemoControlsSheet}
```

All native modules used (expo-video, expo-image, expo-image-picker, expo-clipboard, expo-crypto, AsyncStorage) are included in Expo Go,
so you don't need a development build.
