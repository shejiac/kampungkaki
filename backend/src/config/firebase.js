import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_REQUIRED = process.env.AUTH_REQUIRED !== 'false';

function initFirebaseAdmin() {
  if (!AUTH_REQUIRED) {
    console.log('🔓 AUTH_REQUIRED=false — dev mode (no Firebase token check)');
    return; // skip admin init in dev mode
  }

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      const json = Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        'base64'
      ).toString('utf8');
      const sa = JSON.parse(json);
      admin.initializeApp({ credential: admin.credential.cert(sa) });
      console.log('✅ Firebase Admin initialized (base64)');
      return;
    }

    const pid = process.env.FIREBASE_PROJECT_ID;
    const email = process.env.FIREBASE_CLIENT_EMAIL;
    let key = process.env.FIREBASE_PRIVATE_KEY;

    if (pid && email && key) {
      // handle \n escape sequences and possible surrounding quotes
      if (key.startsWith('"') && key.endsWith('"')) {
        key = key.slice(1, -1);
      }
      key = key.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          project_id: pid,
          client_email: email,
          private_key: key,
        }),
      });
      console.log('✅ Firebase Admin initialized (separate env vars)');
      return;
    }

    throw new Error('No Firebase Admin credentials found in env');
  } catch (err) {
    console.error('❌ Firebase Admin init failed:', err?.message || err);
    process.exit(1);
  }
}

initFirebaseAdmin();

export { admin, AUTH_REQUIRED };