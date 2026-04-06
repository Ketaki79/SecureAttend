// faculty.js

import { connectWallet, contract, account } from "./blockchain.js";

let subjects = [];        // Faculty subjects from DB
let students = [];        // Students of selected subject
let attendanceData = {};  // { studentId: "present"/"absent" }

// ------------------- INITIAL LOAD -------------------
window.addEventListener("load", async () => {
  const connected = await connectWallet();
  if (connected) {
    await loadSubjects(); // Load faculty subjects from DB
  }
});

// ------------------- LOAD SUBJECTS -------------------
async function loadSubjects() {
  // Example fetch from backend PHP/Node.js endpoint
  const res = await fetch(`/api/facultySubjects?wallet=${account}`);
  subjects = await res.json(); // [{id:1, name:"DBMS"}, {id:2, name:"Blockchain"}]

  const subjectSelect = document.getElementById("subject");
  const reportSelect = document.getElementById("reportSubject");

  subjectSelect.innerHTML = '<option value="" disabled selected>Select Subject</option>';
  reportSelect.innerHTML = "";

  subjects.forEach(sub => {
    subjectSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
    reportSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
  });

  // Listen for subject change to load students
  subjectSelect.addEventListener("change", async (e) => {
    const subjectId = e.target.value;
    await loadStudents(subjectId);
  });
}

// ------------------- LOAD STUDENTS -------------------
async function loadStudents(subjectId) {
  const res = await fetch(`/api/studentsBySubject?subjectId=${subjectId}`);
  students = await res.json(); // [{id:1, name:"John Doe"}, ...]

  const table = document.getElementById("table");
  table.innerHTML = "";

  attendanceData = {}; // reset

  students.forEach(student => {
    attendanceData[student.id] = "absent"; // default
    table.innerHTML += `
      <tr>
        <td class="p-4">${student.name}</td>
        <td class="p-4">
          <select onchange="setAttendance(${student.id}, this.value)" class="bg-white/10 text-white rounded px-2">
            <option value="present">Present</option>
            <option value="absent" selected>Absent</option>
          </select>
        </td>
      </tr>
    `;
  });
}

// ------------------- SET ATTENDANCE -------------------
function setAttendance(studentId, status) {
  attendanceData[studentId] = status;
}

// ------------------- SUBMIT ATTENDANCE -------------------
async function submitAttendance() {
  const subjectId = document.getElementById("subject").value;
  if (!subjectId) return alert("Select a subject!");

  for (const studentId in attendanceData) {
    const status = attendanceData[studentId] === "present";
    try {
      // Call blockchain function
      await contract.methods.markAttendance(studentId, subjectId, status).send({ from: account });
    } catch (err) {
      console.error(err);
      alert("Error submitting attendance!");
      return;
    }
  }
  alert("Attendance submitted successfully!");
}

// ------------------- LOAD REPORT -------------------
async function loadReport() {
  const subjectId = document.getElementById("reportSubject").value;
  const res = await fetch(`/api/attendanceReport?subjectId=${subjectId}`);
  const report = await res.json(); // [{student:"John", present:12, total:15}, ...]

  // Calculate percentage
  let totalLectures = 0;
  let totalAttended = 0;
  report.forEach(r => {
    totalLectures += r.total;
    totalAttended += r.present;
  });

  const percentage = totalLectures ? Math.round((totalAttended / totalLectures) * 100) : 0;
  document.getElementById("percentage").textContent = percentage + "%";

  // Render chart
  const ctx = document.getElementById("chart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: report.map(r => r.student),
      datasets: [{
        label: "Attendance %",
        data: report.map(r => (r.present / r.total) * 100),
        backgroundColor: "rgba(59, 130, 246, 0.7)"
      }]
    },
    options: { scales: { y: { beginAtZero: true, max: 100 } } }
  });
}