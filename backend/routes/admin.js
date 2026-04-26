const router = require("express").Router();
const db = require("../db");
const web3Service = require("../services/web3");

// ================= ADD STUDENT =================
router.post("/students", async (req, res) => {
  try {
    console.log("Incoming student:", req.body);

    const { first_name, last_name, email, branch, semester } = req.body;

    if (!first_name || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [exists] = await db.query(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (exists.length) {
      return res.status(400).json({ message: "Email already exists" });
    }

    await db.query(`
      INSERT INTO users 
      (first_name, last_name, email, role, branch, semester, status)
      VALUES (?, ?, ?, 'student', ?, ?, 'pending')
    `, [first_name, last_name, email, branch, semester]);

    res.json({ success: true });

  } catch (err) {
    console.error("STUDENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE STUDENT =================
router.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Deleting student:", id);

    await db.query("DELETE FROM users WHERE id=? AND role='student'", [id]);

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE STUDENT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET STUDENTS =================
router.get("/students", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, first_name, last_name, email, branch, semester
      FROM users
      WHERE role='student'
    `);

    res.json(rows);

  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ADD FACULTY =================
router.post("/faculty", async (req, res) => {
  try {
    console.log("Incoming faculty:", req.body);

    const { first_name, last_name, email, branch, subject } = req.body;

    if (!first_name || !email || !subject) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [exists] = await db.query(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (exists.length) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // insert faculty
    const [result] = await db.query(`
      INSERT INTO users 
      (first_name, last_name, email, role, branch, status)
      VALUES (?, ?, ?, 'faculty', ?, 'pending')
    `, [first_name, last_name, email, branch]);

    const facultyId = result.insertId;

    // subject check
    let [subjectRows] = await db.query(
      "SELECT id FROM subjects WHERE name=?",
      [subject]
    );

    let subjectId;

    if (subjectRows.length === 0) {
      const [sub] = await db.query(
        "INSERT INTO subjects (name) VALUES (?)",
        [subject]
      );
      subjectId = sub.insertId;
    } else {
      subjectId = subjectRows[0].id;
    }

    // map
    await db.query(
      "INSERT INTO faculty_subject (faculty_id, subject_id) VALUES (?, ?)",
      [facultyId, subjectId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("FACULTY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE FACULTY =================
router.delete("/faculty/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Deleting faculty:", id);

    await db.query("DELETE FROM faculty_subject WHERE faculty_id=?", [id]);
    await db.query("DELETE FROM users WHERE id=? AND role='faculty'", [id]);

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE FACULTY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET FACULTY =================
router.get("/faculty", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.branch,
             s.name AS subject
      FROM users u
      LEFT JOIN faculty_subject fs ON u.id = fs.faculty_id
      LEFT JOIN subjects s ON fs.subject_id = s.id
      WHERE u.role = 'faculty'
    `);

    res.json(rows);

  } catch (err) {
    console.error("GET FACULTY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ================= ADD SUBJECT =================
router.post("/add-subject", async (req, res) => {
  try {
    const { name, code, faculty_id } = req.body;

    // Validation
    if (!name || !code || !faculty_id) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Insert into MySQL
    const [result] = await db.execute(
      "INSERT INTO subjects (name, code, faculty_id) VALUES (?, ?, ?)",
      [name, code, faculty_id]
    );

    const subjectId = result.insertId;

    // OPTIONAL: Store on blockchain (if contract supports)
    try {
      await web3Service.addSubjectOnChain(subjectId, name, code);
    } catch (bcErr) {
      console.error("Blockchain error:", bcErr.message);
    }

    res.json({
      message: "Subject added successfully",
      subjectId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET SUBJECTS =================
router.get("/subjects", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT s.id, s.name, s.code, u.first_name AS faculty_name
      FROM subjects s
      JOIN users u ON s.faculty_id = u.id
    `);

    res.json(rows);

  } catch (err) {
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

// ================= DELETE SUBJECT =================
router.delete("/subject/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await db.execute("DELETE FROM subjects WHERE id = ?", [id]);

    res.json({ message: "Subject deleted" });

  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;