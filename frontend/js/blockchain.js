let web3;
let account;

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      web3 = new Web3(window.ethereum);
      account = accounts[0];

      console.log("Connected:", account);
      alert("Wallet Connected: " + account);

    } catch (err) {
      console.error("MetaMask Error:", err);
      alert("User denied MetaMask access");
    }
  } else {
    alert("MetaMask not installed");
  }
}