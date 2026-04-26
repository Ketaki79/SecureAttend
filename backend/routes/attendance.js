const router = require('express').Router();
const db = require('../db');
const Web3 = require('../services/web3');

// ================= MARK ATTENDANCE =================
router.post('/mark', async (req, res) => {
  const { student_id, faculty_id, subject_id, status } = req.body;

  try {
    // 1. Get student wallet from DB 
    const [studentRows] = await db.query(
      "SELECT wallet_address FROM users WHERE id=?",
      [student_id]
    );

    if (!studentRows.length) {
      return res.status(404).json({ error: "Student not found" });
    }

    const studentWallet = studentRows[0].wallet_address;

    // 2. Get subject name from DB
    const [subjectRows] = await db.query(
      "SELECT name FROM subjects WHERE id=?",
      [subject_id]
    );

    if (!subjectRows.length) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const subject_name = subjectRows[0].name;

    // 3. Send to blockchain (Ganache)
    const txHash = await Web3.markAttendance(
      studentWallet,
      subject_name,
      status
    );

    // 4. Store in MySQL
    await db.query(
      `INSERT INTO attendance 
      (student_id, faculty_id, subject_id, date, status, tx_hash)
      VALUES (?, ?, ?, CURDATE(), ?, ?)`,
      [student_id, faculty_id, subject_id, status, txHash]
    );

    res.json({ success: true, txHash });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= STUDENT VIEW =================
router.get('/student/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT a.*, s.name as subject
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE student_id = ?`,
      [id]
    );

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;