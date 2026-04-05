const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

togglePassword.classList.add("fa-eye-slash");

togglePassword.onclick = () => {
  if (password.type === "password") {
    password.type = "text";
    togglePassword.classList.replace("fa-eye-slash", "fa-eye");
  } else {
    password.type = "password";
    togglePassword.classList.replace("fa-eye", "fa-eye-slash");
  }
};

function login() {
  const role = document.getElementById("role").value;

  if (role === "admin") location.href = "admin.html";
  else if (role === "faculty") location.href = "faculty.html";
  else location.href = "student.html";
}