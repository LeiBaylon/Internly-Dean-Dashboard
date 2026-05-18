# Interly Dean Dashboard

Dean-facing dashboard for OJT monitoring: intern profiles, hours, weekly reports, competencies, and sanctions.

## Getting Started

1. Install dependencies:
   - `npm install`
2. Start the dev server:
   - `npm run dev`

## Firebase Environment Variables

Set these in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Auth Setup

- Enable Email/Password sign-in in Firebase Authentication.
- Create a user profile document at `users/{uid}` with `role = "dean"` for dean access.

## Notes

- Dean access is enforced by role checks from the user profile document.
- Firestore rules and indexes are included as starter templates.
- UI screens read and write directly to Firestore using the web SDK.
