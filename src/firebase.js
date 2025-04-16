
  // src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAMe8AUYptC4BkpqUkxpIYMjW0S6XY_jJA",
  authDomain: "newrnd-8e0a2.firebaseapp.com",
  projectId: "newrnd-8e0a2",
  storageBucket: "newrnd-8e0a2.firebasestorage.app",
  messagingSenderId: "817187487746",
  appId: "1:817187487746:web:4fffb1e1b6b216a073271b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);