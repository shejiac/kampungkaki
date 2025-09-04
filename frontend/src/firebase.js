// src/firebase.js
// Firebase v9+ modular SDK
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCICkZKITXjlXhhrOSS_Ix4XWwzTcfpYjU",
  authDomain: "kkauth-a60b6.firebaseapp.com",
  projectId: "kkauth-a60b6",
  storageBucket: "kkauth-a60b6.firebasestorage.app",
  messagingSenderId: "441208456782",
  appId: "1:441208456782:web:3cc98d12c87935db03251f",
  measurementId: "G-8SXYKVMMFL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Auth instance
export const auth = getAuth(app);
// use the browser's language for SMS templates if supported
auth.useDeviceLanguage();

/**
 * Ensure an *invisible* reCAPTCHA verifier exists. Firebase renders
 * and manages it for you. Call once before signInWithPhoneNumber.
 *
 * NOTE: Make sure your app includes a <div id="recaptcha-container" />
 * somewhere in the DOM.
 */
export function ensureRecaptcha(containerId = "recaptcha-container") {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved automatically by Firebase; we can proceed
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          // If it expires, we will create a new one on next call
          console.log("reCAPTCHA expired");
        },
      }
    );
  }
  return window.recaptchaVerifier;
}

/**
 * Starts phone auth (sends SMS). Returns a ConfirmationResult.
 * You must call confirmation.confirm(code) afterwards.
 */
export function startPhoneSignIn(phoneE164) {
  const verifier = ensureRecaptcha(); // will create once
  return signInWithPhoneNumber(auth, phoneE164, verifier);
}

/** Subscribe to auth state changes (optional helper) */
export function onAuthChanged(cb) {
  return onAuthStateChanged(auth, cb);
}

/** Sign out and clear the reCAPTCHA instance safely */
export async function logoutFirebase() {
  try {
    await signOut(auth);
  } finally {
    // clean up the verifier if it exists
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {}
      delete window.recaptchaVerifier;
    }
  }
}

// Debug function to test your config
export function debugFirebaseConfig() {
  console.log('Firebase Config Check:');
  console.log('API Key:', firebaseConfig.apiKey ? '✅ Set' : '❌ Missing');
  console.log('Auth Domain:', firebaseConfig.authDomain ? '✅ Set' : '❌ Missing');
  console.log('Project ID:', firebaseConfig.projectId ? '✅ Set' : '❌ Missing');
  console.log('App ID:', firebaseConfig.appId ? '✅ Set' : '❌ Missing');
  
  // Check if reCAPTCHA container exists
  const container = document.getElementById('recaptcha-container');
  console.log('reCAPTCHA container:', container ? '✅ Found' : '❌ Missing');
  
  return {
    configComplete: !!(
      firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
    ),
    recaptchaContainer: !!container
  };
}