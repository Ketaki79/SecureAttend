// register.js
// ---------------- ELEMENTS ----------------
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const role = document.getElementById('role');

const walletAddressInput = document.getElementById('walletAddress');
const walletError = document.getElementById('walletError');
const successPopup = document.getElementById('successPopup');

const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

// ---------------- EYE TOGGLE ----------------
function toggleEye(input, icon){
  input.type = input.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('fa-eye-slash');
}

togglePassword.addEventListener('click', ()=>toggleEye(password, togglePassword));
toggleConfirmPassword.addEventListener('click', ()=>toggleEye(confirmPassword, toggleConfirmPassword));

// ---------------- DYNAMIC VALIDATION ----------------
function validateField(input, errorId, validator) {
  const errorEl = document.getElementById(errorId);
  input.addEventListener('input', () => {
    if (validator(input.value)) {
      errorEl.classList.remove('show');
    } else {
      errorEl.classList.add('show');
    }
  });
}

// Validators
const minLength3 = val => val.length >= 3;
const emailValidator = val => val.endsWith('@gmail.com');
const passwordValidator = val => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val);
const confirmPasswordValidator = val => val === password.value;

// Attach dynamic validation
validateField(firstName, 'firstNameError', minLength3);
validateField(lastName, 'lastNameError', minLength3);
validateField(email, 'emailError', emailValidator);
validateField(password, 'passwordError', passwordValidator);
validateField(confirmPassword, 'confirmPasswordError', confirmPasswordValidator);

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

// ---------------- FORM SUBMIT ----------------
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  walletError.classList.remove('show');

  // Basic validation
  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    alert("Please fill all fields!");
    return;
  }
  if (password.value !== confirmPassword.value) {
    alert("Passwords do not match!");
    return;
  }
  if (!role.value) {
    alert("Select a role!");
    return;
  }

  // MetaMask connect (popup)
  if (!window.ethereum) {
    walletError.textContent = "Install MetaMask!";
    walletError.classList.add('show');
    return;
  }
  let accounts;
  try {
    accounts = await ethereum.request({ method: 'eth_requestAccounts' }); // popup
  } catch {
    walletError.textContent = "MetaMask connection rejected!";
    walletError.classList.add('show');
    return;
  }

  const walletAddress = accounts[0];
  walletAddressInput.value = walletAddress;

  // Check wallet for new users
  try {
    const resCheck = await fetch('http://localhost:5000/api/check-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress })
    });
    const checkResult = await resCheck.json();

    if (checkResult.exists) {
      walletError.textContent = "This wallet is already registered! Use a new wallet.";
      walletError.classList.add('show');
      return;
    }
  } catch {
    walletError.textContent = "Server error while checking wallet!";
    walletError.classList.add('show');
    return;
  }

  // Submit registration
  try {
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        role: role.value,
        walletAddress
      })
    });

    const result = await res.json();
    if (result.success) {
      successPopup.classList.add('show');
      // Optional: play popup sound
      new Audio('success.mp3').play();
      setTimeout(() => window.location.href = 'login.html', 2000);
    } else {
      alert(result.message);
    }
  } catch {
    alert("Server error. Try again later.");
  }
});
