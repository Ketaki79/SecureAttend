// routes/faculty.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get students of a faculty
router.get('/:faculty_id/students', async (req, res) => {
  const { faculty_id } = req.params;
  try {
    const [students] = await db.query(
      `SELECT u.id AS student_id, u.first_name, u.last_name, s.id AS subject_id, s.name AS subject_name
       FROM student_subject ss
       JOIN subjects s ON ss.subject_id = s.id
       JOIN users u ON ss.student_id = u.id
       JOIN faculty_subject fs ON fs.subject_id = s.id
       WHERE fs.faculty_id = ?`,
      [faculty_id]
    );
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark attendance
router.post('/:faculty_id/mark-attendance', async (req, res) => {
  const { attendance } = req.body;
  try {
    const queries = attendance.map(a =>
      db.query(
        `INSERT INTO attendance (student_id, subject_id, date, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = ?`,
        [a.student_id, a.subject_id, a.date, a.status, a.status]
      )
    );
    await Promise.all(queries);
    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance for a subject
router.get('/:faculty_id/subject/:subject_id/attendance', async (req, res) => {
  const { subject_id } = req.params;
  try {
    const [records] = await db.query(
      `SELECT a.id, u.first_name, u.last_name, a.date, a.status
       FROM attendance a
       JOIN users u ON a.student_id = u.id
       WHERE a.subject_id = ?`,
      [subject_id]
    );
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;