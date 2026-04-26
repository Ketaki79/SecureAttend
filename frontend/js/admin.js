// ================= ADMIN.JS =================

// ---------------- DATA ----------------
let students = [];
let faculty = [];

const studentTable = document.getElementById("studentTable");
const facultyTable = document.getElementById("facultyTable");

const studentCount = document.getElementById("studentCount");
const facultyCount = document.getElementById("facultyCount");

// ================= LOAD =================
window.addEventListener("load", () => {
  loadStudents();
  loadFaculty();
});

// ================= STUDENTS =================
async function loadStudents() {
  const res = await fetch("http://localhost:5000/api/students");
  students = await res.json();
  renderStudents();
  studentCount.innerText = students.length;
}

async function addStudent() {
  const firstName = document.getElementById("sName").value;
  const email = document.getElementById("sEmail").value;
  const branch = document.getElementById("sBranch").value;
  const sem = document.getElementById("sSem").value;

  const walletAddress = prompt("Enter student wallet");

  await fetch("http://localhost:5000/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName: "", email, walletAddress })
  });

  alert("Student added");
  loadStudents();
}

// ================= FACULTY =================
async function loadFaculty() {
  const res = await fetch("http://localhost:5000/api/faculty");
  faculty = await res.json();
  renderFaculty();
  facultyCount.innerText = faculty.length;
}

async function addFaculty() {
  const firstName = document.getElementById("fName").value;
  const email = document.getElementById("fEmail").value;
  const branch = document.getElementById("fBranch").value;
  const subject = document.getElementById("fSubject").value;

  const walletAddress = prompt("Enter faculty wallet");

  await fetch("http://localhost:5000/api/faculty", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName: "", email, walletAddress, subject })
  });

  alert("Faculty added");
  loadFaculty();
}

// ---------------- DELETE STUDENT ----------------
function deleteStudent(i) {
  students.splice(i, 1);
  renderStudents();
  updateCounts();
}

// ---------------- DELETE FACULTY ----------------
function deleteFaculty(i) {
  faculty.splice(i, 1);
  renderFaculty();
  updateCounts();
}

// ================= RENDER =================
function renderStudents() {
  studentTable.innerHTML = "";

  students.forEach(s => {
    studentTable.innerHTML += `
      <tr>
        <td>${s.first_name} ${s.last_name}</td>
        <td>${s.email}</td>
        <td>${s.wallet_address}</td>
      </tr>
    `;
  });
}

function renderFaculty() {
  facultyTable.innerHTML = "";

  faculty.forEach(f => {
    facultyTable.innerHTML += `
      <tr>
        <td>${f.first_name} ${f.last_name}</td>
        <td>${f.email}</td>
        <td>${f.wallet_address}</td>
      </tr>
    `;
  });
}

// ---------------- COUNTS ----------------
function updateCounts() {
  studentCount.innerText = students.length;
  facultyCount.innerText = faculty.length;
}

// ---------------- GLOBAL ----------------
window.addStudent = addStudent;
window.addFaculty = addFaculty;
window.deleteStudent = deleteStudent;
window.deleteFaculty = deleteFaculty;