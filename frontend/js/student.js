// ================= ACTIVE MENU =================
function showSection(id, el) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".menu-item").forEach(btn => btn.classList.remove("bg-blue-600"));
  if(el) el.classList.add("bg-blue-600");
}

// ================= STUDENT DATA =================
const subjects = ["Blockchain", "DBMS"];
const attendanceData = {
  "Blockchain": "present", // example: the student's status per subject
  "DBMS": "absent"
};

// ================= LOAD TABLE =================
function loadMyAttendance() {
  const table = document.getElementById("myAttendanceTable");
  table.innerHTML = "";

  subjects.forEach(sub => {
    const status = attendanceData[sub] || "absent";
    table.innerHTML += `
      <tr class="border-b border-white/10 hover:bg-white/10">
        <td class="p-4">${sub}</td>
        <td class="p-4">
          <span class="${status==='present' ? 'text-green-500' : 'text-red-500'} font-semibold">${status.toUpperCase()}</span>
        </td>
      </tr>
    `;
  });
}

// ================= REPORT =================
let studentChart;

function loadStudentReport() {
  const data = subjects.map(sub => attendanceData[sub]==="present" ? 1 : 0);
  const presentCount = data.reduce((a,b)=>a+b,0);
  const percentage = subjects.length ? ((presentCount / subjects.length) * 100).toFixed(1) : 0;
  
  document.getElementById("studentPercentage").innerText = percentage + "%";

  if(studentChart) studentChart.destroy();

  studentChart = new Chart(document.getElementById("studentChart"), {
    type: 'bar',
    data: {
      labels: subjects,
      datasets: [{ 
        label: 'Attendance',
        data: data,
        backgroundColor: data.map(v => v ? '#22c55e' : '#ef4444')
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// ================= INITIAL LOAD =================
loadMyAttendance();
loadStudentReport();