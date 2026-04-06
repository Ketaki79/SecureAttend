// ================= ADMIN.JS =================

// ------------------- DATA ARRAYS -------------------
let students = [];          // Local students array for UI
let faculty = [];           // Local faculty array
let subjects = ["Blockchain", "DBMS"]; // Example subjects

let attendanceData = {};    // { subject: { studentName: "present"/"absent" } }

// ------------------- METAMASK / GANACHE -------------------
let web3;
let userAccount;
let contract;

const contractAddress = "0xYourGanacheContractAddress"; // Replace with your deployed contract
const contractABI = [ /* ABI JSON here */ ];

async function connectMetaMask() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAccount = accounts[0];
      web3 = new Web3(window.ethereum);
      contract = new web3.eth.Contract(contractABI, contractAddress);

      console.log("Connected MetaMask account:", userAccount);
      alert("MetaMask Connected: " + userAccount);

      await loadStudentsFromBlockchain();
    } catch (err) {
      console.error(err);
      alert("MetaMask access denied!");
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// ------------------- LOAD STUDENTS FROM BLOCKCHAIN -------------------
async function loadStudentsFromBlockchain() {
  if (!contract) return;
  try {
    const count = await contract.methods.getStudentCount().call();
    students = [];

    for (let i = 0; i < count; i++) {
      const s = await contract.methods.students(i).call();
      students.push({ name: s.name, sem: s.sem, email: "", branch: "" }); // Fill email/branch locally if needed
    }

    renderStudents();
    updateCounts();
  } catch (err) {
    console.error("Failed to load blockchain students:", err);
  }
}

// ------------------- NAVIGATION -------------------
function showSection(id, el = null) {
  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");

  document.querySelectorAll(".menu-item").forEach(btn => btn.classList.remove("bg-blue-600"));
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

  // Save to blockchain
  if (contract && userAccount) {
    try {
      await contract.methods.addStudent(name, sem).send({ from: userAccount });
      console.log("Student added on blockchain");
    } catch (err) {
      console.error("Blockchain error:", err);
      alert("Failed to add student on blockchain!");
      return;
    }
  }

  // Save locally
  students.push({ name, email, branch, sem });
  sName.value = sEmail.value = sBranch.value = sSem.value = "";

  renderStudents();
  updateCounts();
  alert("Student added successfully!");
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
}

// ------------------- ADD FACULTY -------------------
function addFaculty() {
  faculty.push({
    name: fName.value,
    email: fEmail.value,
    branch: fBranch.value,
    subject: fSubject.value
  });

  fName.value = fEmail.value = fBranch.value = fSubject.value = "";

  renderFaculty();
  updateCounts();
  alert("Faculty Added");
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

// ------------------- ATTENDANCE -------------------
function loadTable() {
  const subject = document.getElementById("subject").value;
  if (!attendanceData[subject]) attendanceData[subject] = {};

  const table = document.getElementById("table");
  table.innerHTML = "";

  students.forEach(nameObj => {
    const name = nameObj.name;
    const status = attendanceData[subject][name] || "";

    table.innerHTML += `
      <tr class="border-b border-white/10 hover:bg-white/10">
        <td class="p-4">${name}</td>
        <td class="p-4 flex gap-3">
          <button onclick="mark('${name}','present')" 
            class="px-4 py-1 rounded-full text-sm ${status==='present' ? 'bg-green-500 scale-105' : 'bg-white/10 hover:bg-green-500'}">
            Present
          </button>
          <button onclick="mark('${name}','absent')" 
            class="px-4 py-1 rounded-full text-sm ${status==='absent' ? 'bg-red-500 scale-105' : 'bg-white/10 hover:bg-red-500'}">
            Absent
          </button>
        </td>
      </tr>
    `;
  });
}

// Mark attendance (local + blockchain)
async function mark(name, status) {
  const subject = document.getElementById("subject").value;
  if (!attendanceData[subject]) attendanceData[subject] = {};

  attendanceData[subject][name] = status;
  loadTable();

  if (contract && userAccount) {
    try {
      await contract.methods.markAttendance(name, subject, status === "present").send({ from: userAccount });
      console.log("Attendance saved on blockchain");
    } catch (err) {
      console.error("Blockchain attendance failed:", err);
    }
  }
}

// ------------------- SUBMIT ATTENDANCE -------------------
function submitAttendance() {
  const btn = document.getElementById("submitBtn");
  btn.innerText = "Saving...";
  btn.classList.add("opacity-70");

  setTimeout(() => {
    btn.innerText = "✅ Saved";
    btn.classList.add("bg-green-600");

    setTimeout(() => {
      btn.innerText = "Submit Attendance";
      btn.classList.remove("bg-green-600", "opacity-70");
    }, 2000);
  }, 1000);
}

// ------------------- REPORT -------------------
let chart;
function loadReport() {
  const subject = document.getElementById("reportSubject").value;
  const data = attendanceData[subject] || {};
  const names = Object.keys(data);
  const values = names.map(n => data[n] === "present" ? 1 : 0);

  const present = values.reduce((a,b)=>a+b,0);
  const percentage = names.length ? ((present/names.length)*100).toFixed(1) : 0;

  document.getElementById("percentage").innerText = percentage + "%";

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{ label: 'Attendance', data: values, backgroundColor: values.map(v => v ? '#22c55e' : '#ef4444') }]
    },
    options: { scales: { y: { beginAtZero: true, max: 1, ticks: { stepSize: 1 } } } }
  });
}

// ------------------- INITIALIZATION -------------------
window.addEventListener('load', async () => {
  await connectMetaMask();
  loadTable();
});
document.getElementById("subject").addEventListener("change", loadTable);