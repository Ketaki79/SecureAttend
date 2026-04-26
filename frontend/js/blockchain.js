// ================= BLOCKCHAIN CONNECTION =================

let web3;
let contract;
let userAccount;

// DEPLOYED CONTRACT ADDRESS (Ganache)
const contractAddress = "0x8f8421e683956Ad15b6E7d301182D3D79E2A46C9";

//  ABI 
const contractABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_student", "type": "address" },
      { "internalType": "string", "name": "_subject", "type": "string" },
      { "internalType": "bool", "name": "_present", "type": "bool" }
    ],
    "name": "markAttendance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRecords",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "student", "type": "address" },
          { "internalType": "string", "name": "subject", "type": "string" },
          { "internalType": "uint256", "name": "date", "type": "uint256" },
          { "internalType": "bool", "name": "present", "type": "bool" }
        ],
        "internalType": "struct Attendance.Record[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ================= AUTO CONNECT =================
window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts"
      });

      if (accounts.length > 0) {
        userAccount = accounts[0];
        console.log("Wallet Connected:", userAccount);

        contract = new web3.eth.Contract(contractABI, contractAddress);

        // auto-fill wallet input if exists
        let walletInput = document.getElementById("walletAddress");
        if (walletInput) {
          walletInput.value = userAccount;
        }
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    alert("Install MetaMask first!");
  }
});

// ================= MANUAL CONNECT =================
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found");
    return;
  }

  web3 = new Web3(window.ethereum);

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  userAccount = accounts[0];

  contract = new web3.eth.Contract(contractABI, contractAddress);

  console.log("Connected:", userAccount);

  let walletInput = document.getElementById("walletAddress");
  if (walletInput) walletInput.value = userAccount;
}

// ================= MARK ATTENDANCE =================
async function markAttendance(student, subject, present) {
  try {
    await contract.methods.markAttendance(
    studentWalletAddress,
    subjectName,
    present
    ).send({ from: userAccount });

    alert("Attendance stored on blockchain ✔");
  } catch (err) {
    console.error(err);
    alert("Transaction failed");
  }
}

// ================= GET ALL RECORDS =================
async function getRecords() {
  try {
    const data = await contract.methods.getRecords().call();
    return data;
  } catch (err) {
    console.error(err);
  }
}