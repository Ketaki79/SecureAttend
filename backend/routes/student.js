// routes/student.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get subjects for student
router.get('/:id/subjects', async (req, res) => {
  const { id } = req.params;
  try {
    const [subjects] = await db.query(
      `SELECT s.id, s.name
       FROM student_subject ss
       JOIN subjects s ON ss.subject_id = s.id
       WHERE ss.student_id = ?`,
      [id]
    );
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
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