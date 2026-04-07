const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');


// ================= REGISTER =================
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role, walletAddress } = req.body;

  try {
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const [walletCheck] = await db.query(
      'SELECT * FROM users WHERE wallet_address = ?',
      [walletAddress]
    );

    if (walletCheck.length > 0) {
      return res.status(400).json({ message: 'Wallet already registered!' });
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users 
      (first_name, last_name, email, password, role, wallet_address) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, role, walletAddress]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  const { email, password, role, walletAddress } = req.body;

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'UserNotFound' });
    }

    const user = users[0];

    // 🔐 PASSWORD CHECK
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'InvalidCredentials' });
    }

    // 🔥 WALLET CHECK
    if (user.wallet_address !== walletAddress) {
      return res.status(401).json({ error: 'WalletMismatch' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.first_name,
        email: user.email,
        role: user.role,
        walletAddress: user.wallet_address
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;