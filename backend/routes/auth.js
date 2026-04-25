const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// ---------------- CHECK WALLET (for registration) ----------------
router.post('/check-wallet', async (req, res) => {
  const { walletAddress } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE wallet_address = ?',
      [walletAddress]
    );
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- GET WALLET BY EMAIL (for existing users) ----------------
router.post('/get-wallet', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT wallet_address FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) return res.json({ success: false, message: 'User not found' });
    res.json({ success: true, walletAddress: rows[0].wallet_address });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- REGISTER ----------------
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role, walletAddress } = req.body;

  try {
    // Check existing email
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) return res.status(400).json({ message: 'User already exists' });

    // Check wallet (for new user)
    const [walletCheck] = await db.query('SELECT * FROM users WHERE wallet_address = ?', [walletAddress]);
    if (walletCheck.length > 0) return res.status(400).json({ message: 'Wallet already registered!' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query(
      `INSERT INTO users (first_name, last_name, email, password, role, wallet_address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, role, walletAddress]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------------- LOGIN ----------------
router.post('/login', async (req, res) => {
  const { email, password, role, walletAddress } = req.body;

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );

    if (users.length === 0)
      return res.status(404).json({ error: 'UserNotFound' });

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'InvalidCredentials' });

    console.log("DB Wallet:", user.wallet_address);
    console.log("MetaMask Wallet:", walletAddress);

    if (user.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;