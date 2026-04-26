const express = require('express');
const router = express.Router();
const db = require('../db');

// ================= GET STUDENTS =================
router.get('/students', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, first_name, last_name, email, wallet_address FROM users WHERE role="student"'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ADD STUDENT =================
router.post('/students', async (req, res) => {
  const { firstName, lastName, email, walletAddress } = req.body;

  try {
    await db.query(
      `INSERT INTO users (first_name, last_name, email, password, role, wallet_address)
       VALUES (?, ?, ?, '', 'student', ?)`,
      [firstName, lastName, email, walletAddress]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET FACULTY =================
router.get('/faculty', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, first_name, last_name, email, wallet_address FROM users WHERE role="faculty"'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= ADD FACULTY =================
router.post('/faculty', async (req, res) => {
  const { firstName, lastName, email, walletAddress, subject } = req.body;

  try {
    await db.query(
      `INSERT INTO users (first_name, last_name, email, password, role, wallet_address)
       VALUES (?, ?, ?, '', 'faculty', ?)`,
      [firstName, lastName, email, walletAddress]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;