const router = require("express").Router();
const db = require("../db");
const { web3, contract } = require("../services/web3");

router.post("/mark", async (req, res) => {
  const { studentId, subjectId, date, status, walletAddress } = req.body;

  try {
    const tx = await contract.methods
      .markAttendance(studentId, subjectId, date, status === "present")
      .send({ from: walletAddress, gas: 3000000 });

    await db.query(
      `INSERT INTO attendance 
       (student_id, subject_id, attendance_date, status, tx_hash)
       VALUES (?, ?, ?, ?, ?)`,
      [studentId, subjectId, date, status, tx.transactionHash]
    );

    res.json({ success: true, txHash: tx.transactionHash });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;