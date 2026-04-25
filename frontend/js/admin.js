// ================= ADMIN.JS =================

// ---------------- DATA ----------------
let students = [];
let faculty = [];
let subjects = [];

// ---------------- DOM ----------------
const sName = document.getElementById("sName");
const sSem = document.getElementById("sSem");

const studentTable = document.getElementById("studentTable");
const facultyTable = document.getElementById("facultyTable");

const studentCount = document.getElementById("studentCount");
const facultyCount = document.getElementById("facultyCount");

// ---------------- INIT ----------------
window.addEventListener("load", async () => {
  await connectMetaMask();
  await loadStudentsFromBlockchain();
});

// ---------------- LOAD STUDENTS ----------------
async function loadStudentsFromBlockchain() {
  students = await getStudentsBlockchain();
  renderStudents();
  updateCounts();
}

// ---------------- ADD STUDENT ----------------
async function addStudent() {
  const name = document.getElementById("sName").value;
  const email = document.getElementById("sEmail").value;
  const branch = document.getElementById("sBranch").value;
  const sem = document.getElementById("sSem").value;

  const wallet = prompt("Enter student wallet address");

  if (!wallet) return alert("Wallet required");

  await fetch("http://localhost:3000/add-student", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email, branch, sem, wallet })
  });

  await addStudentBlockchain(name, sem, wallet);

  alert("Student added successfully");

  loadStudentsFromBlockchain();
}

// ---------------- ADD FACULTY ----------------
async function addFaculty() {
  const name = document.getElementById("fName").value;
  const email = document.getElementById("fEmail").value;
  const branch = document.getElementById("fBranch").value;
  const subject = document.getElementById("fSubject").value;

  const wallet = prompt("Enter faculty wallet");

  if (!wallet) return;

  await fetch("http://localhost:3000/add-faculty", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ name, email, branch, subject, wallet })
  });

  await addFacultyBlockchain(wallet);

  alert("Faculty added");
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

// ---------------- RENDER ----------------
function renderStudents() {
  studentTable.innerHTML = "";

  students.forEach((s, i) => {
    studentTable.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.sem}</td>
        <td>${s.wallet}</td>
        <td>
          <button onclick="deleteStudent(${i})" class="text-red-400">
            Delete
          </button>
        </td>
      </tr>
    `;
  });
}

function renderFaculty() {
  facultyTable.innerHTML = "";

  faculty.forEach((f, i) => {
    facultyTable.innerHTML += `
      <tr>
        <td>${f.wallet}</td>
        <td>
          <button onclick="deleteFaculty(${i})" class="text-red-400">
            Delete
          </button>
        </td>
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