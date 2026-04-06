const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./db');
db.query("SELECT 1")
  .then(() => console.log("MySQL Connected Successfully"))
  .catch(err => console.log("DB Error", err));

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const facultyRoutes = require('./routes/faculty');
const studentRoutes = require('./routes/student');

app.use('/api', authRoutes);        
app.use('/admin', adminRoutes);
app.use('/faculty', facultyRoutes);
app.use('/student', studentRoutes);

// TEST
app.get('/', (req, res) => {
  res.send('Backend running');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));