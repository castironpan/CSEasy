// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  "projectId": "studio-1467048136-26051",
  "appId": "1:176464226105:web:6c95a1640bca0dbad26ae8",
  "apiKey": "AIzaSyABOBOk24IhBcb_DS_aLPK56alw-NyyT3g",
  "authDomain": "studio-1467048136-26051.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "176464226105"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
