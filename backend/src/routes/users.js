const express = require('express');
const { PrismaClient } = require('@prisma/client');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
