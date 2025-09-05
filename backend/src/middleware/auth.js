import { admin, AUTH_REQUIRED } from '../config/firebase.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireAuth = async (req, res, next) => {
  if (!AUTH_REQUIRED) {
    return next();
  }

  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { id: decodedToken.uid }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: decodedToken.uid,
          phone: decodedToken.phone_number
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};