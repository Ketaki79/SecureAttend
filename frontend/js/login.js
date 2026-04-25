// ---------------- ELEMENTS ----------------
const email = document.getElementById('email');
const password = document.getElementById('password');
const role = document.getElementById('role');
const walletAddressInput = document.getElementById('walletAddress');
const walletError = document.getElementById('walletError');
const successPopup = document.getElementById('successPopup');

// ---------------- AUTO WALLET FOR OLD USERS ----------------
async function connectWalletAuto() {
  if (!window.ethereum) {
    walletAddressInput.value = "MetaMask Not Installed";
    return;
  }

  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    walletAddressInput.value = accounts.length ? accounts[0] : "Not Connected";

    // Fetch wallet for existing email
    if (email.value.endsWith('@gmail.com')) {
      try {
        const res = await fetch('http://localhost:5000/api/get-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value })
        });
        const data = await res.json();
        if (data.success) {
          walletAddressInput.value = data.walletAddress; // old user's wallet
        }
      } catch {}
    }
  } catch {
    walletAddressInput.value = "Error";
  }
}

window.addEventListener("load", connectWalletAuto);
email.addEventListener("blur", connectWalletAuto); // update wallet when email entered

// ---------------- FORM SUBMIT ----------------
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  walletError.classList.remove('show');

  if (!email.value || !password.value || !role.value) {
    alert("Please fill all fields!");
    return;
  }

  if (!window.ethereum) {
    walletError.textContent = "Install MetaMask!";
    walletError.classList.add('show');
    return;
  }

  let accounts;
  try {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  } catch {
    walletError.textContent = "MetaMask connection rejected!";
    walletError.classList.add('show');
    return;
  }

  if (!accounts.length) {
    walletError.textContent = "Connect MetaMask first!";
    walletError.classList.add('show');
    return;
  }

  const walletAddress = accounts[0];
  walletAddressInput.value = walletAddress;

  try {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        role: role.value,
        walletAddress
      })
    });

    const result = await res.json();

    if (result.success) {
      // Play success sound
      const audio = new Audio('success.mp3'); // add your success.mp3 file
      audio.play();

      successPopup.classList.add('show');
      setTimeout(() => window.location.href = 'dashboard.html', 2000);
    } else {
      alert(result.error || result.message || 'Login failed!');
    }

  } catch (err) {
    alert("Server error. Try again later.");
  }
});