// blockchain.js

// ------------------- CONTRACT CONFIG -------------------
const contractAddress = "0x8f8421e683956Ad15b6E7d301182D3D79E2A46C9";

const contractABI = [
  {
    "inputs":[{"internalType":"uint256","name":"","type":"uint256"}],
    "name":"records",
    "outputs":[
      {"internalType":"address","name":"student","type":"address"},
      {"internalType":"string","name":"subject","type":"string"},
      {"internalType":"uint256","name":"date","type":"uint256"},
      {"internalType":"bool","name":"present","type":"bool"}
    ],
    "stateMutability":"view",
    "type":"function",
    "constant":true
  },
  {
    "inputs":[
      {"internalType":"address","name":"_student","type":"address"},
      {"internalType":"string","name":"_subject","type":"string"},
      {"internalType":"bool","name":"_present","type":"bool"}
    ],
    "name":"markAttendance",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint256","name":"_sem","type":"uint256"}],
    "name":"addStudent",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs":[],"name":"getStudentCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true
  },
  {
    "inputs":[{"internalType":"uint256","name":"","type":"uint256"}],
    "name":"students",
    "outputs":[
      {"internalType":"string","name":"name","type":"string"},
      {"internalType":"uint256","name":"sem","type":"uint256"},
      {"internalType":"address","name":"studentAddress","type":"address"}
    ],
    "stateMutability":"view",
    "type":"function",
    "constant":true
  },
  {
    "inputs":[],
    "name":"getRecords",
    "outputs":[
      {
        "components":[
          {"internalType":"address","name":"student","type":"address"},
          {"internalType":"string","name":"subject","type":"string"},
          {"internalType":"uint256","name":"date","type":"uint256"},
          {"internalType":"bool","name":"present","type":"bool"}
        ],
        "internalType":"struct Attendance.Record[]",
        "name":"",
        "type":"tuple[]"
      }
    ],
    "stateMutability":"view",
    "type":"function",
    "constant":true
  }
];

// ------------------- GLOBAL VARIABLES -------------------
let web3;
let contract;
let userAccount;

// ------------------- CONNECT METAMASK -------------------
async function connectMetaMask() {
  if (!window.ethereum) {
    alert("Please install MetaMask");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    userAccount = accounts[0];

    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(contractABI, contractAddress);

    console.log("Connected:", userAccount);
  } catch (error) {
    console.error("MetaMask connection failed:", error);
  }
}

// ---------------- ADD STUDENT ----------------
async function addStudentBlockchain(name, sem) {
  try {
    return await contract.methods
      .addStudent(name, sem)
      .send({ from: userAccount });
  } catch (err) {
    console.error("Add student error:", err);
  }
}

// ---------------- MARK ATTENDANCE ----------------
async function markAttendanceBlockchain(student, subject, present) {
  try {
    return await contract.methods
      .markAttendance(student, subject, present)
      .send({ from: userAccount });
  } catch (err) {
    console.error("Attendance error:", err);
  }
}

// ---------------- GET STUDENTS ----------------
async function getStudentsBlockchain() {
  try {
    const count = await contract.methods.getStudentCount().call();
    let list = [];

    for (let i = 0; i < count; i++) {
      const s = await contract.methods.students(i).call(); // ✅ FIXED

      list.push({
        name: s.name,
        sem: s.sem,
        wallet: s.studentAddress,
      });
    }

    return list;
  } catch (err) {
    console.error("Get students error:", err);
  }
}

// ---------------- GET RECORDS ----------------
async function getAttendanceRecords() {
  try {
    const records = await contract.methods.getRecords().call();

    return records.map((r) => ({
      student: r.student,
      subject: r.subject,
      date: new Date(r.date * 1000).toLocaleString(), // ✅ FIXED
      present: r.present,
    }));
  } catch (err) {
    console.error("Get records error:", err);
  }
}

// ------------------- HELPER FUNCTIONS -------------------
function getContract() {
  if (!contract) throw new Error("Blockchain not connected");
  return contract;
}

function getUserAccount() {
  if (!userAccount) throw new Error("MetaMask not connected");
  return userAccount;
}

// ------------------- GLOBAL ACCESS -------------------
window.connectMetaMask = connectMetaMask;
window.addStudentBlockchain = addStudentBlockchain;
window.markAttendanceBlockchain = markAttendanceBlockchain;
window.getStudentsBlockchain = getStudentsBlockchain;
window.getAttendanceRecords = getAttendanceRecords;
window.getContract = () => contract;
window.getAccount = () => userAccount;