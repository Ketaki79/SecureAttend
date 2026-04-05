const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------------------
// MySQL Connection
// ------------------
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // replace with your MySQL password
    database: "secureattend"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL database");
});

// ------------------
// JWT Secret Key
// ------------------
const SECRET_KEY = "secureattend_secret_key";

// ------------------
// Routes
// ------------------

// 1. User Login
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send({ message: "User not found" });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).send({ message: "Invalid password" });

        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: "8h" });
        res.send({ token, user: { id: user.id, first_name: user.first_name, role: user.role } });
    });
});

// 2. Register User (Faculty / Student)
app.post("/register", async (req, res) => {
    const { first_name, last_name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
        [first_name, last_name, email, hashedPassword, role],
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send({ message: "User registered successfully", userId: results.insertId });
        }
    );
});

// 3. Mark Attendance
app.post("/attendance", (req, res) => {
    const { student_id, subject_id, date, status } = req.body;
    db.query(
        "INSERT INTO attendance (student_id, subject_id, date, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=?",
        [student_id, subject_id, date, status, status],
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send({ message: "Attendance recorded" });
        }
    );
});

// 4. Get Attendance for a Subject
app.get("/attendance/:subject_id", (req, res) => {
    const subject_id = req.params.subject_id;
    db.query(
        `SELECT u.id AS student_id, u.first_name, u.last_name, a.date, a.status
         FROM attendance a
         JOIN users u ON a.student_id = u.id
         WHERE a.subject_id = ?`,
        [subject_id],
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        }
    );
});

// 5. Get Attendance Report for a Student
app.get("/report/:student_id", (req, res) => {
    const student_id = req.params.student_id;
    db.query(
        `SELECT s.name AS subject, 
                SUM(CASE WHEN a.status='present' THEN 1 ELSE 0 END) AS present,
                SUM(CASE WHEN a.status='absent' THEN 1 ELSE 0 END) AS absent
         FROM attendance a
         JOIN subjects s ON a.subject_id = s.id
         WHERE a.student_id = ?
         GROUP BY s.id`,
        [student_id],
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.send(results);
        }
    );
});

// ------------------
// Start Server
// ------------------
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});