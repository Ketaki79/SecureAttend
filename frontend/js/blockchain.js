let web3;
let contract;
let account;

const contractAddress = "PASTE_CONTRACT_ADDRESS";
const abi = [PASTE_ABI_HERE];

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    account = accounts[0];

    contract = new web3.eth.Contract(abi, contractAddress);

    console.log("Connected:", account);
  } else {
    alert("Install MetaMask");
  }
}