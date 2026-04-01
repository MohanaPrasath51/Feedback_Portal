// ============================================================
// Firebase Configuration
// ============================================================
// Steps to get your config:
// 1. Go to https://console.firebase.google.com
// 2. Select your project (or create one)
// 3. Click the gear icon → Project Settings
// 4. Under "Your apps", click the </> (Web) icon to register a web app
// 5. Copy the firebaseConfig object and paste the values below
// ============================================================

import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDhc_a5ADr3mtPn45AZpk7Cheg-lTEjSHc",
  authDomain: "feedbackportal-4588c.firebaseapp.com",
  projectId: "feedbackportal-4588c",
  storageBucket: "feedbackportal-4588c.firebasestorage.app",
  messagingSenderId: "520526681365",
  appId: "1:520526681365:web:8f2396fedc277b7480851c",
};

const app = initializeApp(firebaseConfig);

export default app;
