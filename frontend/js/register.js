// Elements
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const role = document.getElementById('role');

// Error elements
const firstNameError = document.getElementById('firstNameError');
const lastNameError = document.getElementById('lastNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

// Success popup
const successPopup = document.getElementById('successPopup');

// Eye toggles
const togglePassword = document.getElementById('togglePassword');
const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');

function toggleEye(input, icon) {
  if(input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  }
}

togglePassword.addEventListener('click', ()=>toggleEye(password, togglePassword));
toggleConfirmPassword.addEventListener('click', ()=>toggleEye(confirmPassword, toggleConfirmPassword));

// Validation functions
function validateFirstName() { firstNameError.classList.toggle('show', firstName.value.trim().length < 3); }
function validateLastName() { lastNameError.classList.toggle('show', lastName.value.trim().length < 3); }
function validateEmail() {
  const regex = /^[a-z][a-z0-9._%+-]*@gmail\.com$/;
  emailError.classList.toggle('show', !regex.test(email.value.trim()));
}
function validatePassword() {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  passwordError.classList.toggle('show', !regex.test(password.value));
  validateConfirmPassword();
}
function validateConfirmPassword() { confirmPasswordError.classList.toggle('show', password.value !== confirmPassword.value); }

// Live validation
[firstName, lastName, email, password, confirmPassword].forEach(el => el.addEventListener('input', () => {
  if(el === firstName) validateFirstName();
  else if(el === lastName) validateLastName();
  else if(el === email) validateEmail();
  else if(el === password) validatePassword();
  else if(el === confirmPassword) validateConfirmPassword();
}));

// Form submission
document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();

  validateFirstName(); validateLastName(); validateEmail(); validatePassword(); validateConfirmPassword();

  if([firstNameError, lastNameError, emailError, passwordError, confirmPasswordError].every(el => !el.classList.contains('show')) && role.value){
    const data = { firstName:firstName.value, lastName:lastName.value, email:email.value, password:password.value, role:role.value };
    try {
      const res = await fetch('/register', {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
      });
      const result = await res.json();
      if(result.success){
        successPopup.classList.add('show');
        setTimeout(() => { successPopup.classList.remove('show'); window.location.href='login.html'; }, 2500);
      } else { alert(result.message); }
    } catch(err) { alert('Registration failed!'); }
  } else if(!role.value){ alert("Please select a role!"); }
});