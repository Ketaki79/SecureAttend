// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all students
router.get('/students', async (req, res) => {
  try {
    const [students] = await db.query('SELECT * FROM users WHERE role = "student"');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add student (by admin)
router.post('/students', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    await db.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, "student")',
      [first_name, last_name, email, password]
    );
    res.json({ message: 'Student added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;