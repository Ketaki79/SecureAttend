// ================= BLOCKCHAIN.JS =================

// ⚠️ UPDATE AFTER REDEPLOYING CONTRACT
const contractAddress = "YOUR_NEW_CONTRACT_ADDRESS";

const contractABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_name", "type": "string"},
      {"internalType": "uint256", "name": "_sem", "type": "uint256"},
      {"internalType": "address", "name": "_wallet", "type": "address"}
    ],
    "name": "addStudent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_faculty", "type": "address"}
    ],
    "name": "addFaculty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_student", "type": "address"},
      {"internalType": "string", "name": "_subject", "type": "string"},
      {"internalType": "bool", "name": "_present", "type": "bool"}
    ],
    "name": "markAttendance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStudentCount",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "getStudent",
    "outputs": [
      {"type": "string"},
      {"type": "uint256"},
      {"type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRecords",
    "outputs": [
      {
        "components": [
          {"name": "student", "type": "address"},
          {"name": "subject", "type": "string"},
          {"name": "timestamp", "type": "uint256"},
          {"name": "present", "type": "bool"}
        ],
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ---------------- GLOBALS ----------------
let web3;
let contract;
let userAccount;

// ---------------- CONNECT ----------------
async function connectMetaMask() {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  const accounts = await ethereum.request({
    method: "eth_requestAccounts"
  });

  userAccount = accounts[0];
  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(contractABI, contractAddress);

  console.log("Connected:", userAccount);
}

// ---------------- ADD STUDENT ----------------
async function addStudentBlockchain(name, sem, wallet) {
  if (!contract) throw "Contract not loaded";

  return await contract.methods
    .addStudent(name, sem, wallet)
    .send({ from: userAccount });
}

// ---------------- ADD FACULTY ----------------
async function addFacultyBlockchain(wallet) {
  return await contract.methods
    .addFaculty(wallet)
    .send({ from: userAccount });
}

// ---------------- MARK ATTENDANCE ----------------
async function markAttendanceBlockchain(student, subject, present) {
  return await contract.methods
    .markAttendance(student, subject, present)
    .send({ from: userAccount });
}

// ---------------- GET STUDENTS ----------------
async function getStudentsBlockchain() {
  const count = await contract.methods.getStudentCount().call();
  let list = [];

  for (let i = 0; i < count; i++) {
    const s = await contract.methods.getStudent(i).call();

    list.push({
      name: s[0],
      sem: s[1],
      wallet: s[2]
    });
  }

  return list;
}

// ---------------- GET RECORDS ----------------
async function getAttendanceRecords() {
  const records = await contract.methods.getRecords().call();

  return records.map(r => ({
    student: r.student,
    subject: r.subject,
    date: new Date(r.timestamp * 1000).toLocaleString(),
    present: r.present
  }));
}

// ---------------- EXPORT ----------------
window.connectMetaMask = connectMetaMask;
window.addStudentBlockchain = addStudentBlockchain;
window.addFacultyBlockchain = addFacultyBlockchain;
window.markAttendanceBlockchain = markAttendanceBlockchain;
window.getStudentsBlockchain = getStudentsBlockchain;
window.getAttendanceRecords = getAttendanceRecords;