// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6-Y2WUy6RUI91KCDtmuz_ZbTdep72SEk",
  authDomain: "iot-guardian-8o73w.firebaseapp.com",
  databaseURL: "https://iot-guardian-8o73w-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iot-guardian-8o73w",
  storageBucket: "iot-guardian-8o73w.firebasestorage.app",
  messagingSenderId: "311981433813",
  appId: "1:311981433813:web:eb91016b4e934d82f5535c"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
