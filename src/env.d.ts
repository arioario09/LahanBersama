/// <reference types="vite/client" />

// Project-specific env var typings for `import.meta.env`.
// Add keys here as your app requires them.
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;

  readonly GEMINI_API_KEY?: string;
  readonly APP_URL?: string;

  // more env vars...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
