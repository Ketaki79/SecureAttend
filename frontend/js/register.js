// ================= ELEMENTS =================
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


// ================= PASSWORD TOGGLE =================
function toggleEye(input, icon) {
  input.type = input.type === 'password' ? 'text' : 'password';
  icon.classList.toggle('fa-eye-slash');
}

togglePassword.addEventListener('click', () => toggleEye(password, togglePassword));
toggleConfirmPassword.addEventListener('click', () => toggleEye(confirmPassword, toggleConfirmPassword));


// ================= VALIDATION =================
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
const passwordValidator = val =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(val);
const confirmPasswordValidator = val => val === password.value;

// Attach validation
validateField(firstName, 'firstNameError', minLength3);
validateField(lastName, 'lastNameError', minLength3);
validateField(email, 'emailError', emailValidator);
validateField(password, 'passwordError', passwordValidator);
validateField(confirmPassword, 'confirmPasswordError', confirmPasswordValidator);


// ================= REGISTER =================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  walletError.textContent = "";
  walletError.classList.remove('show');

  // -------- BASIC VALIDATION --------
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

  // -------- METAMASK --------
  if (!window.ethereum) {
    walletError.textContent = "Install MetaMask!";
    walletError.classList.add('show');
    return;
  }

  let accounts;

  try {
    //  THIS TRIGGERS POPUP
    accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
  } catch (err) {
    walletError.textContent = "Wallet connection rejected!";
    walletError.classList.add('show');
    return;
  }

  const walletAddress = accounts[0];
  walletAddressInput.value = walletAddress;


  // -------- SEND TO BACKEND --------
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
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

    // -------- HANDLE BACKEND ERRORS --------
    if (!res.ok) {
      if (result.error === "WalletAlreadyUsed") {
        walletError.textContent = "This wallet is already registered!";
      } 
      else if (result.error === "NotCreatedByAdmin") {
        walletError.textContent = "Contact admin to create your account first!";
      } 
      else {
        walletError.textContent = result.error || "Registration failed!";
      }

      walletError.classList.add('show');
      return;
    }

    // -------- SUCCESS --------
    if (result.success) {
      successPopup.classList.add('show');

      // optional sound
      try {
        new Audio('success.mp3').play();
      } catch {}

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    }

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    walletError.textContent = "Server error. Try again later.";
    walletError.classList.add('show');
  }
});