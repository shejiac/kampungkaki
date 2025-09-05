import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { AUTH_REQUIRED } from '../config/firebase.js';
import admin from '../config/firebase.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /me
 *  - PROD (AUTH_REQUIRED=true): phone from Firebase token (req.auth.phone_number)
 *  - DEV  (AUTH_REQUIRED=false): pass ?phone=+65xxxx
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const phone = AUTH_REQUIRED
      ? (req.auth?.phone_number || req.auth?.phoneNumber || null)
      : (req.query.phone || null);

    if (!phone) return res.status(400).json({ error: 'missing_phone' });

    const r = await pool.query('select * from users where phone=$1', [phone]);
    res.json(r.rows[0] || null);
  } catch (e) {
    console.error('GET /me error:', e);
    res.status(500).json({ error: 'me_failed' });
  }
});

/**
 * PUT /me
 * Body: { fullName?, age?, address?, avatarUrl? }
 *  - PROD: phone comes from Firebase token
 *  - DEV : include phone in body
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    const phone = AUTH_REQUIRED
      ? (req.auth?.phone_number || req.auth?.phoneNumber || null)
      : (req.body?.phone || null);

    if (!phone) return res.status(400).json({ error: 'missing_phone' });

    const { fullName, age, address, avatarUrl } = req.body || {};
    const r = await pool.query(
      `insert into users (phone, full_name, age, address, avatar_url)
       values ($1, $2, $3, $4, $5)
       on conflict (phone) do update
       set full_name = excluded.full_name,
           age       = excluded.age,
           address   = excluded.address,
           avatar_url= excluded.avatar_url
       returning *`,
      [phone, fullName ?? null, age ?? null, address ?? null, avatarUrl ?? null]
    );

    res.json(r.rows[0] || null);
  } catch (e) {
    console.error('PUT /me error:', e);
    res.status(500).json({ error: 'update_failed' });
  }
});

// Health check for auth system
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    auth_required: AUTH_REQUIRED,
    timestamp: new Date().toISOString()
  });
});

router.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { phone_number } = decodedToken;

    let user = await prisma.user.findUnique({
      where: { phone: phone_number }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { phone: phone_number }
      });
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: error.message });
  }
});

export default router;