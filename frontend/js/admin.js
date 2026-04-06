// ================= ADMIN.JS =================

// ------------------- DATA ARRAYS -------------------
let students = []; // Local student array for UI
let faculty = [];  // Local faculty array
let subjects = []; // List of all subjects
let attendanceData = {}; // { subject: { studentName: "present"/"absent" } }

// ------------------- DOM ELEMENTS -------------------
const sName = document.getElementById("sName");
const sEmail = document.getElementById("sEmail");
const sBranch = document.getElementById("sBranch");
const sSem = document.getElementById("sSem");

const fName = document.getElementById("fName");
const fEmail = document.getElementById("fEmail");
const fBranch = document.getElementById("fBranch");
const fSubject = document.getElementById("fSubject");

const studentCount = document.getElementById("studentCount");
const facultyCount = document.getElementById("facultyCount");
const subjectCount = document.getElementById("subjectCount");

const studentTable = document.getElementById("studentTable");
const facultyTable = document.getElementById("facultyTable");
const subjectTable = document.getElementById("subjectTable");

// ------------------- ADD STUDENT -------------------
function addStudent() {
  const name = sName.value.trim();
  const email = sEmail.value.trim();
  const branch = sBranch.value.trim();
  const sem = sSem.value.trim();

  if (!name || !email || !branch || !sem) return alert("Please fill all fields!");

  students.push({ name, email, branch, sem });

  sName.value = sEmail.value = sBranch.value = sSem.value = "";

  renderStudents();
  updateCounts();
}

// ------------------- ADD FACULTY -------------------
function addFaculty() {
  const name = fName.value.trim();
  const email = fEmail.value.trim();
  const branch = fBranch.value.trim();
  const subject = fSubject.value.trim();

  if (!name || !email || !branch || !subject) return alert("Please fill all fields!");

  faculty.push({ name, email, branch, subject });

  // Track subjects dynamically
  if (!subjects.includes(subject)) subjects.push(subject);

  fName.value = fEmail.value = fBranch.value = fSubject.value = "";

  renderFaculty();
  updateCounts();
  updateSubjects();
}

// ------------------- DELETE STUDENT -------------------
function deleteStudent(i) {
  students.splice(i, 1);
  renderStudents();
  updateCounts();
}

// ------------------- DELETE FACULTY -------------------
function deleteFaculty(i) {
  const removed = faculty.splice(i, 1)[0];
  renderFaculty();
  updateCounts();

  // Remove subject if no other faculty teaches it
  if (!faculty.find(f => f.subject === removed.subject)) {
    subjects = subjects.filter(s => s !== removed.subject);
  }

  updateSubjects();
}

// ------------------- RENDER FUNCTIONS -------------------
function renderStudents() {
  studentTable.innerHTML = "";
  students.forEach((s, i) => {
    studentTable.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.email}</td>
        <td>${s.branch}</td>
        <td>${s.sem}</td>
        <td><button onclick="deleteStudent(${i})" class="text-red-400">Delete</button></td>
      </tr>
    `;
  });
}

function renderFaculty() {
  facultyTable.innerHTML = "";
  faculty.forEach((f, i) => {
    facultyTable.innerHTML += `
      <tr>
        <td>${f.name}</td>
        <td>${f.email}</td>
        <td>${f.branch}</td>
        <td>${f.subject}</td>
        <td><button onclick="deleteFaculty(${i})" class="text-red-400">Delete</button></td>
      </tr>
    `;
  });
}

function renderSubjects() {
  subjectTable.innerHTML = "";
  subjects.forEach(sub => {
    const sem = getSemesterForSubject(sub);
    subjectTable.innerHTML += `
      <tr>
        <td>${sem}</td>
        <td>${sub}</td>
      </tr>
    `;
  });
}

// ------------------- HELPER: GET SEMESTER FOR SUBJECT -------------------
function getSemesterForSubject(subjectName) {
  // Look for first student in branch taught by faculty with this subject
  const fac = faculty.find(f => f.subject === subjectName);
  if (!fac) return "N/A";

  // Try to find a student in the same branch
  const student = students.find(s => s.branch === fac.branch);
  return student ? student.sem : "N/A";
}

// ------------------- UPDATE COUNTS -------------------
function updateCounts() {
  studentCount.innerText = students.length;
  facultyCount.innerText = faculty.length;
  subjectCount.innerText = subjects.length;
  renderSubjects();
}

// ------------------- WINDOW GLOBALS -------------------
window.addStudent = addStudent;
window.addFaculty = addFaculty;
window.deleteStudent = deleteStudent;
window.deleteFaculty = deleteFaculty;

// ------------------- INITIAL LOAD -------------------
window.addEventListener("load", () => {
  updateCounts();
});