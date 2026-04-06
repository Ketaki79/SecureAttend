// ---------------- ELEMENTS ----------------
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const role = document.getElementById('role');

const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const successPopup = document.getElementById('successPopup');

const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

// Wallet
const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressInput = document.getElementById('walletAddress');
const walletError = document.getElementById('walletError');

// ---------------- EYE TOGGLE ----------------
function toggleEye(input, icon){
  if(input.type === 'password'){
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}
togglePassword.addEventListener('click', ()=>toggleEye(password, togglePassword));
toggleConfirmPassword.addEventListener('click', ()=>toggleEye(confirmPassword, toggleConfirmPassword));

// ---------------- VALIDATION ----------------
function validateFirstName(){ firstNameError.classList.toggle('show', firstName.value.trim().length < 3); }
function validateLastName(){ lastNameError.classList.toggle('show', lastName.value.trim().length < 3); }
function validateEmail(){ 
  const regex = /^[a-z][a-z0-9._%+-]*@gmail\.com$/;
  emailError.classList.toggle('show', !regex.test(email.value.trim()));
}
function validatePassword(){ 
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  passwordError.classList.toggle('show', !regex.test(password.value));
  validateConfirmPassword();
}
function validateConfirmPassword(){ confirmPasswordError.classList.toggle('show', password.value !== confirmPassword.value); }

[firstName,lastName,email,password,confirmPassword].forEach(el => el.addEventListener('input', ()=>{
  if(el===firstName) validateFirstName();
  else if(el===lastName) validateLastName();
  else if(el===email) validateEmail();
  else if(el===password) validatePassword();
  else if(el===confirmPassword) validateConfirmPassword();
}));

// ---------------- WALLET ----------------
async function connectWallet(){
  if(window.ethereum){
    try{
      const accounts = await ethereum.request({ method:'eth_requestAccounts' });
      walletAddressInput.value = accounts[0];
      walletError.classList.remove('show');
      connectWalletBtn.textContent = "Wallet Connected";
      connectWalletBtn.disabled = true;
    } catch(err){
      alert("Please allow wallet connection!");
    }
  } else {
    alert("MetaMask not installed!");
  }
}
connectWalletBtn.addEventListener('click', connectWallet);

// Detect account changes
if(window.ethereum){
  ethereum.on('accountsChanged', (accounts)=>{
    if(accounts.length===0){
      walletAddressInput.value = '';
      walletError.textContent = "Wallet disconnected! Please connect again.";
      walletError.classList.add('show');
      connectWalletBtn.disabled = false;
      connectWalletBtn.textContent = "Connect Wallet";
    } else {
      walletAddressInput.value = accounts[0];
      walletError.classList.remove('show');
      connectWalletBtn.textContent = "Wallet Connected";
      connectWalletBtn.disabled = true;
      alert("MetaMask account changed! Your wallet address has been updated.");
    }
  });
}

// ---------------- FORM SUBMIT ----------------
document.getElementById('registerForm').addEventListener('submit', async e=>{
  e.preventDefault();

  validateFirstName(); validateLastName(); validateEmail(); validatePassword(); validateConfirmPassword();

  if([firstNameError,lastNameError,emailError,passwordError,confirmPasswordError].every(el=>!el.classList.contains('show')) && role.value){
    
    if(!walletAddressInput.value){
      walletError.textContent = "Please connect your wallet before submitting!";
      walletError.classList.add('show');
      return;
    }

    const data = {
      firstName:firstName.value,
      lastName:lastName.value,
      email:email.value,
      password:password.value,
      role:role.value,
      walletAddress: walletAddressInput.value
    };

    try{
      const res = await fetch('http://localhost:5000/api/register', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
      });
      let result;
      try{ result = await res.json(); } catch{ alert("Server error (not JSON)"); return; }

      if(result.success){
        successPopup.classList.add('show');
        setTimeout(()=>{ successPopup.classList.remove('show'); window.location.href='login.html'; }, 2500);
      } else { alert(result.message); }

    } catch(err){ alert('Registration failed!'); }

  } else if(!role.value){ alert("Please select a role!"); }
});