import { connectWallet, contract, account } from "./blockchain.js";

let subjects = [];
let attendanceData = {}; // { subject: "present"/"absent" }

// ------------------- INITIAL LOAD -------------------
window.addEventListener("load", async () => {
  const connected = await connectWallet();
  if (connected) await loadAttendance();
});

// ------------------- LOAD ATTENDANCE FROM BLOCKCHAIN -------------------
async function loadAttendance() {
  attendanceData = {};
  subjects = [];

  try {
    const records = await contract.methods.getRecords().call();
    const uniqueSubjects = new Set();

    records.forEach(r => {
      uniqueSubjects.add(r.subject);
      if (r.student.toLowerCase() === account.toLowerCase()) {
        attendanceData[r.subject] = r.present ? "present" : "absent";
      }
    });

    subjects = [...uniqueSubjects];
    renderMyAttendance();
    renderStudentReport();

  } catch (err) {
    console.error("Blockchain load error:", err);
    alert("Failed to fetch attendance from blockchain");
  }
}

// ------------------- RENDER ATTENDANCE TABLE -------------------
function renderMyAttendance() {
  const tbody = document.getElementById("myAttendanceTable").querySelector("tbody");
  tbody.innerHTML = "";

  subjects.forEach(sub => {
    const status = attendanceData[sub] || "absent";
    tbody.innerHTML += `
      <tr class="border-b border-white/10 hover:bg-white/10">
        <td class="p-4">${sub}</td>
        <td class="p-4">
          <span class="${status==='present' ? 'text-green-500' : 'text-red-500'} font-semibold">
            ${status.toUpperCase()}
          </span>
        </td>
      </tr>
    `;
  });
}

// ------------------- STUDENT REPORT CHART -------------------
let studentChart;
function renderStudentReport() {
  const data = subjects.map(sub => attendanceData[sub] === "present" ? 1 : 0);
  const total = subjects.length;
  const presentCount = data.reduce((a,b)=>a+b,0);
  const percentage = total ? ((presentCount/total)*100).toFixed(1) : 0;

  document.getElementById("totalLectures").innerText = total;
  document.getElementById("attendedLectures").innerText = presentCount;
  document.getElementById("studentPercentage").innerText = percentage + "%";

  if(studentChart) studentChart.destroy();

  const ctx = document.getElementById("studentChart").getContext("2d");
  studentChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["Present", "Absent"],
      datasets: [{
        data: [presentCount, total-presentCount],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom", labels: { color: "white" } } }
    }
  });
}