const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, walletAddress } = req.body;

  try {
    // Check user exists (created by admin)
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "NotCreatedByAdmin" });
    }

    // 🔥 CHECK WALLET DUPLICATE
    const [walletRows] = await db.query(
      "SELECT * FROM users WHERE wallet_address=?",
      [walletAddress]
    );

    if (walletRows.length) {
      return res.status(400).json({ error: "WalletAlreadyUsed" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE users 
       SET password=?, wallet_address=?, status='active'
       WHERE email=?`,
      [hashed, walletAddress, email]
    );

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password, role, walletAddress } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email=? AND role=?",
      [email, role]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "UserNotFound" });
    }

    const user = rows[0];

    if (user.status !== "active") {
      return res.status(401).json({ error: "AccountNotActive" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "InvalidCredentials" });
    }

    if (user.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: "WalletMismatch" });
    }

    res.json({ success: true, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;