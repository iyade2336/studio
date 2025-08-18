// This file is dedicated to exporting the Firebase configuration object.
// By isolating it, we ensure that environment variables are loaded correctly.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "iot-guardian-8o73w.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: "iot-guardian-8o73w.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: "https://iot-guardian-8o73w-default-rtdb.europe-west1.firebasedatabase.app",
};
