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

## Firestore Seed

Use the seed script to populate interns, reports, competencies, hours, sanctions, and sanction schedules.

1. Download a Firebase Admin SDK service account JSON for your project.
2. Export credentials and dean UID, then run the script:

```
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
export DEAN_UID="your-auth-uid"
npm run seed
```

Optional:
- Set `DEAN_DISPLAY_NAME` to override the seeded user display name.
- Use `FIREBASE_SERVICE_ACCOUNT` to pass the raw service account JSON instead of a file path.

## Notes

- Dean access is enforced by role checks from the user profile document.
- Firestore rules and indexes are included as starter templates.
- UI screens read and write directly to Firestore using the web SDK.
# Internly-Dean-Dashboard
