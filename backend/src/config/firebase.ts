import 'dotenv/config';
import admin from 'firebase-admin';

const {
  USE_FIREBASE_EMULATOR,
  GOOGLE_APPLICATION_CREDENTIALS,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
} = process.env;

if (!admin.apps.length) {
  if (USE_FIREBASE_EMULATOR === '1') {
    // Local emulators: Auth @ 127.0.0.1:9099, Firestore @ 127.0.0.1:8080
    process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';
    admin.initializeApp({ projectId: FIREBASE_PROJECT_ID || 'demo-project' });
  } else if (GOOGLE_APPLICATION_CREDENTIALS) {
    // Real project via ADC (service account file path)
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  } else if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
    // Real project via inline env credentials (great for CI)
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    throw new Error('No Firebase Admin credentials. Set USE_FIREBASE_EMULATOR=1 or real creds.');
  }
}

export const AUTH_REQUIRED = 'AUTH_REQUIRED';

const auth = admin.auth();
const db = admin.firestore?.();

export { admin, auth, db };
