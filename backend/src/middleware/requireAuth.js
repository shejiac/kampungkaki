const admin = require('../config/firebase');
const { AUTH_REQUIRED } = process.env;

const requireAuth = async (req, res, next) => {
  if (AUTH_REQUIRED === 'false') {
    return next();
  }

  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = requireAuth;
