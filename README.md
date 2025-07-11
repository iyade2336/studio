# IoT Guardian

This is a Next.js starter project for IoT Guardian, built with Firebase Studio.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Environment Variables

To run this project, you will need to add the following environment variables to a `.env.local` file in the project root. You can create this file by copying the `.env.example` file.

`GEMINI_API_KEY` - Your API key for Google AI Studio.
`NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase Web API Key.
`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase Auth Domain.
`NEXT_PUBLIC_FIREBASE_DATABASE_URL` - Your Firebase Realtime Database URL.
`NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase Project ID.
`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase Storage Bucket.
`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase Messaging Sender ID.
`NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase App ID.

### For Production Deployment (e.g., on Render.com)

When deploying, set these same environment variables in your hosting provider's dashboard. Do not commit your `.env.local` file to version control.
