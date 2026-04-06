// ================= ADMIN.JS FULLY FIXED =================

// ------------------- IMPORT BLOCKCHAIN MODULE -------------------
import * as blockchain from './blockchain.js';

// ------------------- DATA ARRAYS -------------------
let students = [];          // Local students array for UI
let faculty = [];           // Local faculty array
let subjects = [];          // Example subjects

let attendanceData = {};    // { subject: { studentName: "present"/"absent" } }

// ------------------- METAMASK -------------------
let userAccount;

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
const studentTable = document.getElementById("studentTable");
const facultyTable = document.getElementById("facultyTable");

const subjectSelect = document.getElementById("subject");
const tableBody = document.getElementById("table");
const submitBtn = document.getElementById("submitBtn");
const reportSubject = document.getElementById("reportSubject");
const chartCanvas = document.getElementById("chart");
const percentageDisplay = document.getElementById("percentage");

let chart; // Chart.js instance

// ------------------- CONNECT METAMASK -------------------
async function connectMetaMask() {
  try {
    userAccount = await blockchain.connectMetaMask();
    console.log("Connected MetaMask account:", userAccount);
    alert("MetaMask Connected: " + userAccount);

    await loadStudentsFromBlockchain();
  } catch (err) {
    console.error("MetaMask connection failed:", err);
    alert(err.message);
  }
}

// ------------------- LOAD STUDENTS FROM BLOCKCHAIN -------------------
async function loadStudentsFromBlockchain() {
  try {
    students = await blockchain.getStudents();
    renderStudents();
    updateCounts();
    loadTable();
  } catch (err) {
    console.error("Failed to load blockchain students:", err);
  }
}

// ------------------- NAVIGATION -------------------
function showSection(id, el = null) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".menu-btn").forEach(btn => btn.classList.remove("bg-blue-600"));
  if (el) el.classList.add("bg-blue-600");
}

// ------------------- ADD STUDENT -------------------
async function addStudent() {
  const name = sName.value.trim();
  const email = sEmail.value.trim();
  const branch = sBranch.value.trim();
  const sem = sSem.value.trim();

  if (!name || !email || !branch || !sem) {
    alert("Please fill all fields!");
    return;
  }

  try {
    await blockchain.addStudent(name, sem, userAccount);

    students.push({ name, email, branch, sem });

    sName.value = sEmail.value = sBranch.value = sSem.value = "";

    renderStudents();
    updateCounts();
    loadTable();
    alert("Student added successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to add student!");
  }
}

// ------------------- RENDER STUDENTS -------------------
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

// ------------------- DELETE STUDENT -------------------
function deleteStudent(i) {
  students.splice(i, 1);
  renderStudents();
  updateCounts();
  loadTable();
}

// ------------------- ADD FACULTY -------------------
function addFaculty() {
  const name = fName.value.trim();
  const email = fEmail.value.trim();
  const branch = fBranch.value.trim();
  const subject = fSubject.value.trim();

  if (!name || !email || !branch || !subject) {
    alert("Please fill all fields!");
    return;
  }

  faculty.push({ name, email, branch, subject });

  fName.value = fEmail.value = fBranch.value = fSubject.value = "";

  renderFaculty();
  updateCounts();
  alert("Faculty added successfully!");
}

// ------------------- RENDER FACULTY -------------------
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

// ------------------- DELETE FACULTY -------------------
function deleteFaculty(i) {
  faculty.splice(i, 1);
  renderFaculty();
  updateCounts();
}

// ------------------- UPDATE COUNTS -------------------
function updateCounts() {
  studentCount.innerText = students.length;
  facultyCount.innerText = faculty.length;
}

// ------------------- LOAD ATTENDANCE TABLE -------------------
async function loadTable() {
  const subject = subjectSelect.value;
  if (!subject) return;

  if (!attendanceData[subject]) attendanceData[subject] = {};

  try {
    const blockchainAttendance = await blockchain.getAttendance(subject);
    Object.assign(attendanceData[subject], blockchainAttendance);
  } catch (err) {
    console.error("Failed to load attendance from blockchain:", err);
  }

  tableBody.innerHTML = "";
  students.forEach((student) => {
    const name = student.name;
    const status = attendanceData[subject][name] || "";

    tableBody.innerHTML += `
      <tr class="border-b border-white/10 hover:bg-white/10">
        <td class="p-4">${name}</td>
        <td class="p-4 flex gap-3">
          <button onclick="markAttendance('${name}', 'present')" 
            class="px-4 py-1 rounded-full text-sm ${status==='present' ? 'bg-green-500 scale-105' : 'bg-white/10 hover:bg-green-500'}">
            Present
          </button>
          <button onclick="markAttendance('${name}', 'absent')" 
            class="px-4 py-1 rounded-full text-sm ${status==='absent' ? 'bg-red-500 scale-105' : 'bg-white/10 hover:bg-red-500'}">
            Absent
          </button>
        </td>
      </tr>
    `;
  });
}

// ------------------- MARK ATTENDANCE -------------------
async function markAttendance(name, status) {
  const subject = subjectSelect.value;
  if (!subject) return;

  if (!attendanceData[subject]) attendanceData[subject] = {};
  attendanceData[subject][name] = status;

  loadTable();

  try {
    await blockchain.markAttendance(name, subject, status === "present", userAccount);
    console.log(`Attendance for ${name} saved as ${status}`);
  } catch (err) {
    console.error("Blockchain attendance failed:", err);
  }
}

// ------------------- SUBMIT ATTENDANCE -------------------
function submitAttendance() {
  if (!subjectSelect.value) return;
  submitBtn.innerText = "Saving...";
  submitBtn.classList.add("opacity-70");

  setTimeout(() => {
    submitBtn.innerText = "Saved";
    submitBtn.classList.add("bg-green-600");

    setTimeout(() => {
      submitBtn.innerText = "Submit Attendance";
      submitBtn.classList.remove("bg-green-600", "opacity-70");
    }, 2000);
  }, 1000);
}

// ------------------- LOAD ATTENDANCE REPORT -------------------
function loadReport() {
  const subject = reportSubject.value;
  if (!subject) return;

  const data = attendanceData[subject] || {};
  const names = Object.keys(data);
  const values = names.map(n => data[n] === "present" ? 1 : 0);

  const presentCount = values.reduce((a, b) => a + b, 0);
  const percentage = names.length ? ((presentCount / names.length) * 100).toFixed(1) : 0;

  percentageDisplay.innerText = percentage + "%";

  if (chart) chart.destroy();

  chart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        label: 'Attendance',
        data: values,
        backgroundColor: values.map(v => v ? '#22c55e' : '#ef4444')
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true, max: 1, ticks: { stepSize: 1 } }
      }
    }
  });
}

// ------------------- EVENT LISTENERS -------------------
subjectSelect.addEventListener("change", loadTable);
reportSubject.addEventListener("change", loadReport);

window.addStudent = addStudent;
window.addFaculty = addFaculty;
window.deleteStudent = deleteStudent;
window.deleteFaculty = deleteFaculty;
window.markAttendance = markAttendance;
window.submitAttendance = submitAttendance;
window.loadTable = loadTable;
window.loadReport = loadReport;
window.showSection = showSection;

// ------------------- INITIAL LOAD -------------------
window.addEventListener("load", async () => {
  await connectMetaMask();
  loadTable();
});