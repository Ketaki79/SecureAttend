// ================= blockchain.js =================
let web3;
let contract;
let account;

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

// ------------------- CONNECT METAMASK -------------------
export async function connectMetaMask() {
  if (!window.ethereum) throw new Error("MetaMask not installed!");
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userAccount = accounts[0];
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(contractABI, contractAddress);

    console.log("MetaMask connected:", userAccount);
    return userAccount;
  } catch (err) {
    console.error("MetaMask connection error:", err);
    throw err;
  }
}

// ------------------- GET STUDENTS -------------------
export async function getStudents() {
  if (!contract) throw new Error("Blockchain not connected");

  try {
    const count = await contract.methods.getStudentCount().call();
    const students = [];

    for (let i = 0; i < count; i++) {
      const s = await contract.methods.students(i).call();
      students.push({ name: s.name, sem: s.sem, email: "", branch: "" });
    }
    return students;
  } catch (err) {
    console.error("Failed to get students:", err);
    throw err;
  }
}

// ------------------- ADD STUDENT -------------------
export async function addStudent(name, sem, account) {
  if (!contract) throw new Error("Blockchain not connected");

  try {
    await contract.methods.addStudent(name, sem).send({ from: account });
    console.log("Student added on blockchain:", name);
  } catch (err) {
    console.error("Failed to add student:", err);
    throw err;
  }
}

// ------------------- GET ATTENDANCE -------------------
export async function getAttendance(subject) {
  if (!contract) throw new Error("Blockchain not connected");

  const attendance = {};
  try {
    const studentCount = await contract.methods.getStudentCount().call();
    for (let i = 0; i < studentCount; i++) {
      const student = await contract.methods.students(i).call();
      const status = await contract.methods.getAttendance(student.name, subject).call();
      attendance[student.name] = status ? "present" : "absent";
    }
    return attendance;
  } catch (err) {
    console.error("Failed to get attendance:", err);
    throw err;
  }
}

// ------------------- MARK ATTENDANCE -------------------
export async function markAttendance(name, subject, isPresent, account) {
  if (!contract) throw new Error("Blockchain not connected");

  try {
    await contract.methods.markAttendance(name, subject, isPresent).send({ from: account });
    console.log(`Attendance marked for ${name} (${subject}): ${isPresent ? 'Present' : 'Absent'}`);
  } catch (err) {
    console.error("Failed to mark attendance:", err);
    throw err;
  }
}