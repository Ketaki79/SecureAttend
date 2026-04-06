const express = require('express');
const router = express.Router();
const db = require('../db');


//  REGISTER
router.post('/register', async (req, res) => {
  console.log("BODY:", req.body); 
  const { firstName, lastName, email, password, role } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, role]
    );

    res.json({ success: true });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ success: false, 
      message: err.message 
    });
    }
});


//  LOGIN (ALL ROLES)
router.post('/login', async (req, res) => {
  console.log("LOGIN BODY:", req.body); 
  const { email, password, role } = req.body;

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND password = ? AND role = ?',
      [email, password, role]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'InvalidCredentials' });
    }

    res.json({ success: true, user: users[0] });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: err.message
    });
  }
});

module.exports = router;