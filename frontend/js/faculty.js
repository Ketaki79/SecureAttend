// ================= faculty.js =================
import { connectWallet, contract, account } from "./blockchain.js";

let students = [];
let attendanceData = {};   // { subject: { student: "present"/"absent" } }

// ------------------- INITIALIZE -------------------
window.addEventListener("load", async () => {
  const connected = await connectWallet();
  if (connected) await loadStudents();
});

// ------------------- LOAD STUDENTS & ATTENDANCE -------------------
async function loadStudents() {
  students = [];
  attendanceData = {};
  const uniqueSubjects = new Set();

  try {
    const records = await contract.methods.getRecords().call();

    records.forEach(r => {
      // Add unique students
      if (!students.find(s => s.name === r.student)) students.push({ name: r.student });

      // Add unique subjects
      uniqueSubjects.add(r.subject);

      // Attendance data
      if (!attendanceData[r.subject]) attendanceData[r.subject] = {};
      attendanceData[r.subject][r.student] = r.present ? "present" : "absent";
    });

    // Populate dropdowns dynamically
    populateSubjectDropdown([...uniqueSubjects]);
    populateReportDropdown([...uniqueSubjects]);

  } catch (err) {
    console.error("Blockchain load error:", err);
    alert("Failed to load attendance from blockchain");
  }

  loadTable();
}

// ------------------- POPULATE DROPDOWNS -------------------
function populateSubjectDropdown(subjectsList) {
  const select = document.getElementById("subject");
  select.innerHTML = '<option value="" disabled selected>Select Subject</option>';

  subjectsList.forEach(sub => {
    const option = document.createElement("option");
    option.value = sub;
    option.textContent = sub;
    option.classList.add("text-black");
    select.appendChild(option);
  });

  if (subjectsList.length > 0) select.value = subjectsList[0];
}

function populateReportDropdown(subjectsList) {
  const select = document.getElementById("reportSubject");
  select.innerHTML = "";

  subjectsList.forEach(sub => {
    const option = document.createElement("option");
    option.value = sub;
    option.textContent = sub;
    option.classList.add("text-black");
    select.appendChild(option);
  });
}

// ------------------- LOAD ATTENDANCE TABLE -------------------
function loadTable() {
  const subject = document.getElementById("subject").value;
  const table = document.getElementById("table");
  table.innerHTML = "";

  students.forEach(s => {
    const status = attendanceData[subject]?.[s.name] || "";
    table.innerHTML += `
      <tr class="border-b border-white/10 hover:bg-white/10">
        <td class="p-4">${s.name}</td>
        <td class="p-4 flex gap-3">
          <button onclick="mark('${s.name}','present')" 
            class="px-4 py-1 rounded-full text-sm ${status==='present' ? 'bg-green-500 scale-105' : 'bg-white/10 hover:bg-green-500'}">
            Present
          </button>
          <button onclick="mark('${s.name}','absent')" 
            class="px-4 py-1 rounded-full text-sm ${status==='absent' ? 'bg-red-500 scale-105' : 'bg-white/10 hover:bg-red-500'}">
            Absent
          </button>
        </td>
      </tr>
    `;
  });
}

// ------------------- MARK ATTENDANCE -------------------
window.mark = async function(studentName, status) {
  const subject = document.getElementById("subject").value;

  if (!attendanceData[subject]) attendanceData[subject] = {};
  attendanceData[subject][studentName] = status;

  loadTable();

  try {
    await contract.methods
      .markAttendance(studentName, subject, status === "present")
      .send({ from: account });
    console.log(`Marked ${studentName} as ${status} for ${subject}`);
  } catch (err) {
    console.error("Blockchain error:", err);
    alert("Failed to mark attendance on blockchain");
  }
}

// ------------------- REPORTS -------------------
window.loadReport = function() {
  const subject = document.getElementById("reportSubject").value;
  const total = students.length;
  let presentCount = 0;

  students.forEach(s => {
    if (attendanceData[subject]?.[s.name] === "present") presentCount++;
  });

  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;
  document.getElementById("percentage").textContent = `${percentage}%`;

  const ctx = document.getElementById("chart").getContext("2d");
  if (window.attendanceChart) window.attendanceChart.destroy();

  window.attendanceChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Present", "Absent"],
      datasets: [{
        data: [presentCount, total - presentCount],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom", labels: { color: "white" } }
      }
    }
  });
}

// ------------------- SUBJECT CHANGE -------------------
document.getElementById("subject").addEventListener("change", loadTable);