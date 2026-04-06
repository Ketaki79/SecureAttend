let web3;
let account;

async function connectWallet() {
  if (window.ethereum) {
    try {
      web3 = new Web3(window.ethereum);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      account = accounts[0];
      console.log("Connected:", account);
      alert("Wallet Connected: " + account);

    } catch (err) {
      console.error(err);
      alert("MetaMask access denied");
    }
  } else {
    alert("Please install MetaMask");
  }
}