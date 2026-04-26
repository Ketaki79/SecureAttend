const express = require('express');
const router = express.Router();
const db = require('../db');

// ================= GET STUDENTS BY SUBJECT =================
router.get('/studentsBySubject', async (req, res) => {
  const { subjectId } = req.query;

  try {
    const [rows] = await db.query(`
      SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.wallet_address
      FROM student_subject ss
      JOIN users u ON ss.student_id = u.id
      WHERE ss.subject_id = ?
    `, [subjectId]);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET STUDENT ATTENDANCE =================
router.get('/:id/attendance', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        a.id,
        s.name AS subject_name,
        a.date,
        a.status,
        a.tx_hash
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      WHERE a.student_id = ?
    `, [id]);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;