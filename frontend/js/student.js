// ================= STUDENT.JS =================
let web3;
let userAccount;
let contract;

const contractAddress = "0xYourGanacheContractAddress"; // Replace with your contract
const contractABI = [ /* ABI JSON here */ ];

const subjects = ["Blockchain", "DBMS"]; // Example subjects
let attendanceData = {}; // Will be fetched from blockchain

// ------------------- CONNECT METAMASK -------------------
async function connectMetaMask() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAccount = accounts[0];
      web3 = new Web3(window.ethereum);
      contract = new web3.eth.Contract(contractABI, contractAddress);

      console.log("Connected MetaMask:", userAccount);
      await loadAttendance();
    } catch (err) {
      console.error(err);
      alert("MetaMask connection failed!");
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// ------------------- LOAD ATTENDANCE FROM BLOCKCHAIN -------------------
async function loadAttendance() {
  attendanceData = {};
  for (let sub of subjects) {
    attendanceData[sub] = {};
    try {
      const studentList = await contract.methods.getStudents().call(); // Assuming getStudents() exists
      for (let student of studentList) {
        const status = await contract.methods.getAttendance(student, sub).call();
        attendanceData[sub][student] = status ? "present" : "absent";
      }
    } catch (err) {
      console.error("Blockchain load error:", err);
    }
  }

  renderMyAttendance();
  renderStudentReport();
}

// ------------------- RENDER ATTENDANCE TABLE -------------------
function renderMyAttendance() {
  const table = document.getElementById("myAttendanceTable");
  table.innerHTML = "";

  subjects.forEach(sub => {
    const status = attendanceData[sub]?.[userAccount] || "absent";
    table.innerHTML += `
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

// ------------------- STUDENT REPORT -------------------
let studentChart;
function renderStudentReport() {
  const data = subjects.map(sub => attendanceData[sub]?.[userAccount] === "present" ? 1 : 0);
  const presentCount = data.reduce((a,b)=>a+b,0);
  const percentage = subjects.length ? ((presentCount / subjects.length) * 100).toFixed(1) : 0;

  document.getElementById("studentPercentage").innerText = percentage + "%";

  if(studentChart) studentChart.destroy();

  studentChart = new Chart(document.getElementById("studentChart"), {
    type: 'bar',
    data: {
      labels: subjects,
      datasets: [{ label: 'Attendance', data: data, backgroundColor: data.map(v => v ? '#22c55e' : '#ef4444') }]
    },
    options: { scales: { y: { beginAtZero: true, max: 1, ticks: { stepSize: 1 } } } }
  });
}

// ------------------- INITIAL LOAD -------------------
window.addEventListener('load', async () => {
  await connectMetaMask();
});