// ---------------- ELEMENTS ----------------
const email = document.getElementById('email');
const password = document.getElementById('password');
const role = document.getElementById('role');

const walletAddressInput = document.getElementById('walletAddress');
const error = document.getElementById('error');
const togglePassword = document.getElementById('togglePassword');


// ---------------- EYE TOGGLE ----------------
togglePassword.addEventListener('click', () => {
  password.type = password.type === 'password' ? 'text' : 'password';
  togglePassword.classList.toggle('fa-eye-slash');
});


// ---------------- AUTO WALLET ----------------
async function connectWalletAuto() {
  if (!window.ethereum) {
    walletAddressInput.value = "MetaMask Not Installed";
    return;
  }

  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    walletAddressInput.value = accounts.length ? accounts[0] : "Not Connected";
  } catch {
    walletAddressInput.value = "Error";
  }
}

window.addEventListener("load", connectWalletAuto);


// ---------------- LOGIN ----------------
async function login() {
  error.textContent = '';

  // ✅ VALIDATION
  if (!email.value || !password.value || !role.value) {
    error.textContent = "Fill all fields!";
    return;
  }

  if (!window.ethereum) {
    error.textContent = "Install MetaMask!";
    return;
  }

  let accounts;

  try {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  } catch {
    error.textContent = "Connect MetaMask!";
    return;
  }

  if (!accounts.length) {
    error.textContent = "Wallet not connected!";
    return;
  }

  const walletAddress = accounts[0];

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

    const data = await res.json();

    if (!res.ok) {
      error.textContent =
        data.error === 'UserNotFound' ? 'Register first' :
        data.error === 'InvalidCredentials' ? 'Wrong email/password' :
        data.error === 'WalletMismatch' ? 'Wrong MetaMask account' :
        'Error occurred';
      return;
    }

    localStorage.setItem("wallet", walletAddress);

    if (role.value === 'admin') window.location.href = 'admin.html';
    else if (role.value === 'faculty') window.location.href = 'faculty.html';
    else window.location.href = 'student.html';

  } catch {
    error.textContent = "Server error!";
  }
}