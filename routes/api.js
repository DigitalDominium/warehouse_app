const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const nodemailer = require('nodemailer');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// List of consumables
const consumables = [
  "Handle with Care Sticker", "Different Quantity and Kit Sticker", "Clear Tape",
  "Brown Tape", "Latex Gloves", "Cotton Gloves", "Cardboard 4\" X 7\"",
  // Add all other consumables from your list here
];

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Validate QR code and get user
router.post('/scan', async (req, res) => {
  const { qrCode } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE qr_code = $1', [qrCode]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    res.json({ userId: user.id, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record replenishment
router.post('/replenish', async (req, res) => {
  const { userId, status, discrepancies } = req.body;
  try {
    await pool.query(
      'INSERT INTO replenishments (user_id, status, discrepancies) VALUES ($1, $2, $3)',
      [userId, status, status === 'discrepancy' ? discrepancies : []]
    );

    if (status === 'discrepancy') {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.SUPERVISOR_EMAIL,
        subject: 'Replenishment Discrepancy Report',
        text: `Replenishment completed with discrepancies by user ID ${userId}.\n\nMissing items:\n${discrepancies.join('\n')}`,
      };
      await transporter.sendMail(mailOptions);
    }

    res.json({ message: 'Replenishment recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get consumables list
router.get('/consumables', (req, res) => {
  res.json(consumables);
});

module.exports = router;