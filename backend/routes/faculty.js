const express = require('express');
const router = express.Router();
const db = require('../db');

// ================= GET STUDENTS OF FACULTY =================
router.get('/:faculty_id/students', async (req, res) => {
  const { faculty_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        u.id AS student_id,
        u.first_name,
        u.last_name,
        s.id AS subject_id,
        s.name AS subject_name
      FROM faculty_subject fs
      JOIN subjects s ON fs.subject_id = s.id
      JOIN student_subject ss ON ss.subject_id = s.id
      JOIN users u ON ss.student_id = u.id
      WHERE fs.faculty_id = ?
    `, [faculty_id]);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= MARK ATTENDANCE =================
router.post('/:faculty_id/mark-attendance', async (req, res) => {
  const { attendance, txHash } = req.body;

  try {
    const queries = attendance.map(a =>
      db.query(
        `INSERT INTO attendance 
        (student_id, subject_id, date, status, tx_hash)
        VALUES (?, ?, ?, ?, ?)`,
        [a.student_id, a.subject_id, a.date, a.status, txHash || null]
      )
    );

    await Promise.all(queries);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET ATTENDANCE =================
router.get('/:faculty_id/subject/:subject_id/attendance', async (req, res) => {
  const { subject_id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        u.first_name,
        u.last_name,
        a.date,
        a.status,
        a.tx_hash
      FROM attendance a
      JOIN users u ON a.student_id = u.id
      WHERE a.subject_id = ?
    `, [subject_id]);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;