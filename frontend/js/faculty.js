// ================= FACULTY.JS =================

let account;
let subjects = [];
let students = [];
let attendanceData = {};

// ---------------- INIT ----------------
window.addEventListener("load", async () => {
  await connectMetaMask();
  account = window.getAccount();

  if (account) {
    await loadSubjects();
  }
});

// ---------------- LOAD SUBJECTS ----------------
async function loadSubjects() {
  const res = await fetch(`/api/facultySubjects?wallet=${account}`);
  subjects = await res.json();

  const subjectSelect = document.getElementById("subject");
  const reportSelect = document.getElementById("reportSubject");

  subjectSelect.innerHTML = '<option disabled selected>Select Subject</option>';
  reportSelect.innerHTML = "";

  subjects.forEach(sub => {
    subjectSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
    reportSelect.innerHTML += `<option value="${sub.id}">${sub.name}</option>`;
  });

  subjectSelect.addEventListener("change", async (e) => {
    await loadStudents(e.target.value);
  });
}

// ---------------- LOAD STUDENTS ----------------
async function loadStudents(subjectId) {
  const res = await fetch(`/api/studentsBySubject?subjectId=${subjectId}`);
  students = await res.json();

  const table = document.getElementById("table");
  table.innerHTML = "";

  attendanceData = {};

  students.forEach(student => {
    attendanceData[student.id] = "absent";

    table.innerHTML += `
      <tr>
        <td class="p-4">${student.name}</td>
        <td class="p-4">
          <select onchange="setAttendance(${student.id}, this.value)">
            <option value="present">Present</option>
            <option value="absent" selected>Absent</option>
          </select>
        </td>
      </tr>
    `;
  });
}

// ---------------- SET ATTENDANCE ----------------
function setAttendance(studentId, status) {
  attendanceData[studentId] = status;
}

// ---------------- SUBMIT ATTENDANCE ----------------
async function submitAttendance() {
  const subjectEl = document.getElementById("subject");
  const subjectName = subjectEl.selectedOptions[0]?.text;

  if (!subjectName) return alert("Select subject");

  for (const student of students) {
    if (!student.walletAddress) {
      console.warn("Missing wallet for:", student.name);
      continue;
    }

    const status = attendanceData[student.id] === "present";

    await markAttendanceBlockchain(
      student.walletAddress,
      subjectName,
      status
    );
  }

  alert("Attendance submitted on blockchain!");
}