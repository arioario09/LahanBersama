## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and fill in your secrets.
   - Use `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
   - Keep `GEMINI_API_KEY` secret and do not commit `.env.local`
3. If you use a Firebase service account file, do not commit `serviceAccountKey.json`; keep it outside the repo.
4. Run the app:
   `npm run dev`
