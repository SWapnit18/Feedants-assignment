# Feedants Competition — Fixed Portable Package

## Requirements
- Node.js 20+
- npm
- Expo Go (for a phone) or Android Studio/iOS Simulator
- MongoDB is optional because the backend can use its seeded in-memory database in development.

## Run backend
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

## Run mobile
Open another terminal:
```bash
cd mobile
npm install
copy .env.example .env
npx expo start
```

If using a physical phone, replace localhost in `mobile/.env` with your computer's LAN IP:
```env
EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:4000/api/v1
```

## Important
The ZIP is portable: dependencies and Git metadata are intentionally excluded. Run `npm install` in both `backend` and `mobile` after extracting.
