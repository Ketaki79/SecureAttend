// student.js

let account;

let subjects = [];        // Subjects for this student
let attendanceRecords = []; // {subjectId, subjectName, present, total}

// ------------------- INITIAL LOAD -------------------
window.addEventListener("load", async () => {
  account = await connectMetaMask();
  if (account) {
    await loadAttendance();
  }
});

// ------------------- LOAD SUBJECTS -------------------
async function loadSubjects() {
  // Fetch subjects for this student from backend
  const res = await fetch(`/api/studentSubjects?wallet=${account}`);
  subjects = await res.json(); // [{id:1, name:"DBMS"}, {id:2, name:"Blockchain"}]

  // Populate attendance table
  const tableBody = document.querySelector("#attendance tbody");
  tableBody.innerHTML = "";

  subjects.forEach(sub => {
    tableBody.innerHTML += `
      <tr class="border-b border-white/10">
        <td class="p-4">${sub.name}</td>
        <td class="p-4 text-yellow-400" id="status-${sub.id}">Loading...</td>
      </tr>
    `;
  });
}

// ------------------- LOAD ATTENDANCE -------------------
async function loadAttendance() {
  // Fetch attendance data from backend or blockchain
  const res = await fetch(`/api/studentAttendance?wallet=${account}`);
  attendanceRecords = await res.json(); 
  // Example: [{subjectId:1, subjectName:"DBMS", present:12, total:15}, ...]

  let totalLectures = 0;
  let totalAttended = 0;

  attendanceRecords.forEach(record => {
    const statusCell = document.getElementById(`status-${record.subjectId}`);
    const percentage = record.total ? Math.round((record.present / record.total) * 100) : 0;
    statusCell.textContent = `${percentage}%`;

    // Color code: green >= 75, yellow 50-74, red <50
    if (percentage >= 75) statusCell.className = "p-4 text-green-400";
    else if (percentage >= 50) statusCell.className = "p-4 text-yellow-400";
    else statusCell.className = "p-4 text-red-400";

    totalLectures += record.total;
    totalAttended += record.present;
  });

  // Update dashboard summary
  const totalPercent = totalLectures ? Math.round((totalAttended / totalLectures) * 100) : 0;
  document.querySelector("#dashboard .text-3xl.text-blue-400").textContent = `${totalPercent}%`;

  // Render pie chart
  const ctx = document.getElementById("pieChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: attendanceRecords.map(r => r.subjectName),
      datasets: [{
        label: "Attendance %",
        data: attendanceRecords.map(r => r.present),
        backgroundColor: [
          "rgba(34,197,94,0.7)",
          "rgba(248,211,77,0.7)",
          "rgba(239,68,68,0.7)",
          "rgba(59,130,246,0.7)"
        ]
      }]
    },
    options: {
      plugins: { legend: { position: "bottom" } }
    }
  });
}