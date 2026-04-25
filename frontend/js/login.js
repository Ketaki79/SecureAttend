// ---------------- WAIT FOR DOM ----------------
window.addEventListener("DOMContentLoaded", () => {

  // ELEMENTS
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const role = document.getElementById('role');
  const walletAddressInput = document.getElementById('walletAddress');
  const walletError = document.getElementById('walletError');
  const successPopup = document.getElementById('successPopup');
  const togglePassword = document.getElementById('togglePassword');
  const form = document.getElementById('loginForm');

  // ---------------- PASSWORD TOGGLE ----------------
  togglePassword.addEventListener('click', () => {
    const type = password.type === "password" ? "text" : "password";
    password.type = type;
    togglePassword.classList.toggle("fa-eye-slash");
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
  email.addEventListener("blur", connectWalletAuto);

  // ---------------- LOGIN ----------------
  form.addEventListener('submit', async (e) => {
  e.preventDefault();

  walletError.textContent = "";

  if (!window.ethereum) {
    walletError.textContent = "Install MetaMask!";
    return;
  }

  let accounts;

  try {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  } catch {
    walletError.textContent = "Wallet connection rejected!";
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

    console.log("SERVER RESPONSE:", data); 

    if (!res.ok) {
      if (data.error === "UserNotFound") {
        walletError.textContent = "User not found";
      } else if (data.error === "InvalidCredentials") {
        walletError.textContent = "Wrong password";
       } else if (data.error === "WalletMismatch") {
        walletError.textContent = "Wrong wallet connected";
      } else {
        walletError.textContent = "Login failed";
      }
      return;
    }

    if (data.success) {
    const role = data.user.role;

    if (role === "student") {
      window.location.href = "student.html";
    } 
    else if (role === "admin") {
      window.location.href = "admin.html";
    } 
    else if (role === "faculty") {
      window.location.href = "faculty.html";
     }
    }

  } catch (err) {
    console.error(err);
    walletError.textContent = "Server error";
  }
  });

}); 