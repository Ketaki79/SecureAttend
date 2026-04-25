// routes/student.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET students by subject
router.get('/studentsBySubject', async (req, res) => {
  const { subjectId } = req.query;

  try {
    const [rows] = await db.execute(`
      SELECT 
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.wallet_address AS walletAddress
      FROM student_subject ss
      JOIN users u ON ss.student_id = u.id
      WHERE ss.subject_id = ? AND u.role = 'student'
    `, [subjectId]);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get attendance for student
router.get('/:id/attendance', async (req, res) => {
  const { id } = req.params;
  try {
    const [attendance] = await db.query(
      `SELECT a.id, s.name AS subject_name, a.date, a.status
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       WHERE a.student_id = ?`,
      [id]
    );
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;