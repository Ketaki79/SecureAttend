// ================= ACTIVE MENU =================
function showSection(id, el) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".menu-item").forEach(btn => btn.classList.remove("bg-blue-600"));
  if(el) el.classList.add("bg-blue-600");
}

// ================= STUDENTS =================
const students = [
  "Rahul Sharma",
  "Priya Patel",
  "Amit Verma",
  "Sneha Iyer"
];

let attendanceData = {};

// ================= LOAD TABLE =================
function loadTable() {
  const subject = document.getElementById("subject").value;
  if (!attendanceData[subject]) attendanceData[subject] = {};

  const table = document.getElementById("table");
  table.innerHTML = "";

  students.forEach(name => {
    const status = attendanceData[subject][name] || "";

    table.innerHTML += `
      <tr class="border-b border-white/10 hover:bg-white/10">
        <td class="p-4">${name}</td>
        <td class="p-4 flex gap-3">

          <button onclick="mark('${name}','present')" 
            class="px-4 py-1 rounded-full text-sm
            ${status==='present' ? 'bg-green-500 scale-105' : 'bg-white/10 hover:bg-green-500'}">
            Present
          </button>

          <button onclick="mark('${name}','absent')" 
            class="px-4 py-1 rounded-full text-sm
            ${status==='absent' ? 'bg-red-500 scale-105' : 'bg-white/10 hover:bg-red-500'}">
            Absent
          </button>

        </td>
      </tr>
    `;
  });
}

// ================= MARK =================
function mark(name, status) {
  const subject = document.getElementById("subject").value;
  attendanceData[subject][name] = status;
  loadTable();
}

// Initialize table on page load
loadTable();
document.getElementById("subject").addEventListener("change", loadTable);

// ================= SUBMIT =================
function submitAttendance() {
  const btn = document.getElementById("submitBtn");

  btn.innerText = "Saving...";
  btn.classList.add("opacity-70");

  setTimeout(() => {
    btn.innerText = "✅ Saved";
    btn.classList.add("bg-green-600");

    setTimeout(() => {
      btn.innerText = "Submit Attendance";
      btn.classList.remove("bg-green-600");
    }, 2000);

  }, 1000);
}

// ================= REPORT =================
let chart;

function loadReport() {
  const subject = document.getElementById("reportSubject").value;
  const data = attendanceData[subject] || {};

  const names = Object.keys(data);
  const values = names.map(n => data[n] === "present" ? 1 : 0);

  let present = values.reduce((a,b)=>a+b,0);
  let percentage = names.length ? ((present/names.length)*100).toFixed(1) : 0;

  document.getElementById("percentage").innerText = percentage + "%";

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
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
        y: {
          beginAtZero: true,
          max: 1,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}