import admin from '../config/firebase.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'No authorization header provided'
      });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        error: 'Invalid token format'
      });
    }

    return res.status(401).json({
      error: 'Invalid token'
    });
  }
};

import { admin, AUTH_REQUIRED } from '../config/firebase.js';

export const requireAuth = async (req, res, next) => {
  if (!AUTH_REQUIRED) return next(); // dev mode

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing_token' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.auth = decoded; // contains phone_number (E.164) if using phone auth
    return next();
  } catch (e) {
    console.error('ID token verify failed:', e?.message || e);
    return res.status(401).json({ error: 'invalid_token' });
  }
};

export const optionalAuth = async (req, res, next) => {
  if (!AUTH_REQUIRED) {
    req.auth = null;
    return next();
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      req.auth = null;
      return next();
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.auth = decoded;
    next();
  } catch (error) {
    // If token is invalid, just set auth to null and continue
    req.auth = null;
    next();
  }
};