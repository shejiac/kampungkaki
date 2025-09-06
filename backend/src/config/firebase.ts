// backend/src/config/firebase.ts
// Toggle-able Firebase Admin init. Won't import firebase-admin if AUTH_REQUIRED=false.

export const AUTH_REQUIRED = process.env.AUTH_REQUIRED !== 'false';

let admin: any = null;

if (AUTH_REQUIRED) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    admin = require('firebase-admin');

    // Prefer env var with JSON; otherwise use ADC if set (GOOGLE_APPLICATION_CREDENTIALS)
    const svc = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (!admin.apps.length) {
      admin.initializeApp(
        svc
          ? { credential: admin.credential.cert(svc) }
          : { credential: admin.credential.applicationDefault() }
      );
    }

    console.log('[firebase] admin initialized');
  } catch (e) {
    console.error('[firebase] init failed:', e);
    // If you want hard fail, rethrow. Otherwise, set AUTH_REQUIRED=false in .env to bypass.
    throw e;
  }
} else {
  console.log('[firebase] AUTH_REQUIRED=false → skipping admin init');
}

export { admin };


/*import 'dotenv/config';
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
*/