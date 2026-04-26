const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB check
db.query("SELECT 1")
  .then(() => console.log("MySQL Connected"))
  .catch(err => console.log(err));

// ROUTES
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/student', require('./routes/student'));
app.use('/api/attendance', require('./routes/attendance'));

app.get('/', (req, res) => res.send("Backend Running"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});