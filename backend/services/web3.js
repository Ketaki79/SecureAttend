// ================= WEB3 SERVICE =================
const { Web3 } = require("web3");

//  GANACHE RPC
const web3 = new Web3("http://127.0.0.1:7545");

//  CONTRACT JSON (make sure path is correct)
const contractJSON = require("../../blockchain/build/contracts/Attendance.json");

//  CONTRACT DETAILS (PUT YOUR VALUES HERE)
const CONTRACT_ADDRESS = "0x8f8421e683956Ad15b6E7d301182D3D79E2A46C9"; 
const ADMIN_PRIVATE_KEY = "0xa3cb54c2720262b6beae6f8b8ac88e39c3f1b89b64759df085816978deec978c";    

//  INIT CONTRACT
const contract = new web3.eth.Contract(
  contractJSON.abi,
  CONTRACT_ADDRESS
);

//  ADD ADMIN ACCOUNT
const account = web3.eth.accounts.privateKeyToAccount(ADMIN_PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// ======================================================
//  ADD SUBJECT ON BLOCKCHAIN
// ======================================================
const addSubjectOnChain = async (id, name, code) => {
  try {
    const tx = contract.methods.addSubject(id, name, code);

    const gas = await tx.estimateGas({
      from: account.address
    });

    const result = await tx.send({
      from: account.address,
      gas
    });

    console.log(" Subject added on blockchain:", result.transactionHash);

    return result.transactionHash;

  } catch (err) {
    console.error(" Blockchain Subject Error:", err.message);
    throw err;
  }
};

// ======================================================
//  MARK ATTENDANCE
// ======================================================
const markAttendance = async (studentWallet, subject, status) => {
  try {
    const tx = contract.methods.markAttendance(
      studentWallet,
      subject,
      status === "present"
    );

    const gas = await tx.estimateGas({
      from: account.address
    });

    const result = await tx.send({
      from: account.address,
      gas
    });

    console.log(" Attendance marked:", result.transactionHash);

    return result.transactionHash;

  } catch (err) {
    console.error(" Attendance Error:", err.message);
    throw err;
  }
};

// ======================================================
module.exports = {
  addSubjectOnChain,
  markAttendance
};