// frontend/src/config/firebase.js
/* eslint-disable no-underscore-dangle */
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  connectAuthEmulator,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"; // optional

// ----- Firebase client config from Vite env -----
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Singleton app/auth (friendly to Vite HMR)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.useDeviceLanguage();

// ----- Emulators (on when VITE_USE_EMULATORS=1) -----
const useEmulators = String(import.meta.env.VITE_USE_EMULATORS ?? "0") === "1";

if (useEmulators) {
  const authHost = import.meta.env.VITE_AUTH_EMULATOR_HOST ?? "127.0.0.1";
  const authPort = Number(import.meta.env.VITE_AUTH_EMULATOR_PORT ?? 9099);

  // Connect only once per HMR session
  // @ts-ignore (private flag on Auth)
  if (auth._canInitEmulator !== false) {
    connectAuthEmulator(auth, `http://${authHost}:${authPort}`, { disableWarnings: true });
  }

  // Firestore emulator is optional — connect if Firestore is used
  try {
    const db = getFirestore(app);
    const fsHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST ?? "127.0.0.1";
    const fsPort = Number(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT ?? 8080);
    // Guard to avoid reconnecting on HMR
    // @ts-ignore
    if (!window.__kk_fs_emulator_connected) {
      connectFirestoreEmulator(db, fsHost, fsPort);
      // @ts-ignore
      window.__kk_fs_emulator_connected = true;
    }
  } catch {
    // If Firestore isn't used, that's fine.
  }
}

// ----- reCAPTCHA (invisible) -----
function ensureRecaptcha(containerId = "recaptcha-container") {
  if (!window.recaptchaVerifier) {
    // Ensure the container exists (create hidden if missing)
    if (!document.getElementById(containerId)) {
      const div = document.createElement("div");
      div.id = containerId;
      div.style.display = "none";
      document.body.appendChild(div);
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  }
  return window.recaptchaVerifier;
}

/** Start phone sign-in; pass E.164 phone (e.g. "+6591234567"). */
export async function startPhoneSignIn(phoneNumber, containerId) {
  const verifier = ensureRecaptcha(containerId);
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
}

/** Optional helper if you ever need to clear the verifier manually. */
export function resetRecaptcha() {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = undefined;
  }
}

export async function logoutFirebase() {
  return signOut(auth);
}

export { app, auth };
