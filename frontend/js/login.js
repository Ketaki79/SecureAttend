// js/login.js

const togglePassword = document.getElementById('togglePassword');
const password = document.getElementById('password');

togglePassword.addEventListener('click', () => {
  const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
  password.setAttribute('type', type);
  togglePassword.classList.toggle('fa-eye-slash');
});

async function login() {
  const email = document.getElementById('email').value.trim();
  const passwordValue = document.getElementById('password').value.trim();
  const role = document.getElementById('role').value;
  const error = document.getElementById('error');

  // Clear previous error
  error.textContent = '';

  if (!email || !passwordValue || !role) {
    error.textContent = 'Please fill all fields';
    return;
  }

  try {
    // Example POST request to your backend
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: passwordValue, role })
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle errors from server
      if (data.error === 'UserNotFound') {
        error.textContent = 'Register first';
      } else if (data.error === 'InvalidCredentials') {
        error.textContent = 'Enter correct email or password';
      } else {
        error.textContent = 'Something went wrong';
      }
      return;
    }

    // Successful login
    // Redirect based on role
    if (role === 'admin') {
      window.location.href = 'admin.html';
    } else if (role === 'faculty') {
      window.location.href = 'faculty.html';
    } else if (role === 'student') {
      window.location.href = 'student.html';
    }
    
  } catch (err) {
    console.error(err);
    error.textContent = 'Server not responding';
  }
}