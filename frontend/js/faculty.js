// ================= FACULTY.JS =================
let web3;
let userAccount;
let contract;

const contractAddress = "0xYourGanacheContractAddress"; // Replace with your contract
const contractABI = [ /* ABI JSON here */ ];

let students = [];         // Will fetch from blockchain
const subjects = ["Blockchain", "DBMS"]; // Example subjects
let attendanceData = {};   // { subject: { studentName: "present"/"absent" } }

// ------------------- CONNECT METAMASK -------------------
async function connectMetaMask() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAccount = accounts[0];
      web3 = new Web3(window.ethereum);
      contract = new web3.eth.Contract(contractABI, contractAddress);

      console.log("Connected MetaMask:", userAccount);
      await loadStudents();
    } catch (err) {
      console.error(err);
      alert("MetaMask connection failed!");
    }
  } else {
    alert("Please install MetaMask!");
  }
}

// ------------------- LOAD STUDENTS & ATTENDANCE -------------------
async function loadStudents() {
  students = [];
  attendanceData = {};

  try {
    const studentList = await contract.methods.getStudents().call();
    students = studentList.map(s => ({ name: s }));

    for (let sub of subjects) {
      attendanceData[sub] = {};
      for (let student of students) {
        const status = await contract.methods.getAttendance(student.name, sub).call();
        attendanceData[sub][student.name] = status ? "present" : "absent";
      }
    }
  } catch (err) {
    console.error("Blockchain load error:", err);
  }

  loadTable();
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
async function mark(studentName, status) {
  const subject = document.getElementById("subject").value;
  if (!attendanceData[subject]) attendanceData[subject] = {};

  attendanceData[subject][studentName] = status;
  loadTable();

  // Save on blockchain
  try {
    await contract.methods.markAttendance(studentName, subject, status === "present").send({ from: userAccount });
    console.log(`Attendance marked: ${studentName} - ${subject} - ${status}`);
  } catch (err) {
    console.error("Blockchain error:", err);
  }
}

// ------------------- INITIAL LOAD -------------------
window.addEventListener('load', async () => {
  await connectMetaMask();
});
document.getElementById("subject").addEventListener("change", loadTable);