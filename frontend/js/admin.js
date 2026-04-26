const API = "http://localhost:5000/api/admin";

// ---------------- LOAD ----------------
window.addEventListener("load", () => {
  loadStudents();
  loadFaculty();
});

// ================= STUDENTS =================

// LOAD STUDENTS
async function loadStudents() {
  try {
    const res = await fetch(`${API}/students`);
    const data = await res.json();

    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    document.getElementById("studentCount").innerText = data.length;

    data.forEach(s => {
      table.innerHTML += `
        <tr>
          <td>${s.first_name} ${s.last_name || ""}</td>
          <td>${s.email}</td>
          <td>${s.branch || "-"}</td>
          <td>${s.semester || "-"}</td>
          <td>
            <button onclick="deleteStudent(${s.id})" style="color:red">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Load students error:", err);
  }
}

// ADD STUDENT
async function addStudent() {
  const payload = {
    first_name: document.getElementById("sFirstName").value.trim(),
    last_name: document.getElementById("sLastName").value.trim(),
    email: document.getElementById("sEmail").value.trim(),
    branch: document.getElementById("sBranch").value.trim(),
    semester: document.getElementById("sSem").value.trim()
  };

  // ✅ VALIDATION
  if (!payload.first_name || !payload.email) {
    alert("Fill required fields");
    return;
  }

  try {
    const res = await fetch(`${API}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to add student");
    }

    loadStudents();

  } catch (err) {
    console.error("Add student error:", err);
    alert(err.message);
  }
}

// DELETE STUDENT
async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;

  try {
    const res = await fetch(`${API}/students/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Delete failed");
    }

    loadStudents();

  } catch (err) {
    console.error("Delete student error:", err);
  }
}

// ================= FACULTY =================

// LOAD FACULTY
async function loadFaculty() {
  try {
    const res = await fetch(`${API}/faculty`);
    const data = await res.json();

    document.getElementById("facultyCount").innerText = data.length;

    const table = document.getElementById("facultyTable");
    table.innerHTML = "";

    data.forEach(f => {
      table.innerHTML += `
        <tr>
          <td>${f.first_name} ${f.last_name || ""}</td>
          <td>${f.email}</td>
          <td>${f.branch || "-"}</td>
          <td>${f.subject || "-"}</td>
          <td>
            <button onclick="deleteFaculty(${f.id})" style="color:red">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Load faculty error:", err);
  }
}

// ADD FACULTY
async function addFaculty() {
  const payload = {
    first_name: document.getElementById("fFirstName").value.trim(),
    last_name: document.getElementById("fLastName").value.trim(),
    email: document.getElementById("fEmail").value.trim(),
    branch: document.getElementById("fBranch").value.trim(),
    subject: document.getElementById("fSubject").value.trim()
  };

  // ✅ VALIDATION
  if (!payload.first_name || !payload.email || !payload.subject) {
    alert("Fill required fields");
    return;
  }

  try {
    const res = await fetch(`${API}/faculty`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to add faculty");
    }

    loadFaculty();

  } catch (err) {
    console.error("Add faculty error:", err);
    alert(err.message);
  }
}

// DELETE FACULTY
async function deleteFaculty(id) {
  if (!confirm("Delete this faculty?")) return;

  try {
    const res = await fetch(`${API}/faculty/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Delete failed");
    }

    loadFaculty();

  } catch (err) {
    console.error("Delete faculty error:", err);
  }
}

// ================= SUBJECTS =================

const subName = document.getElementById("subName");
const subCode = document.getElementById("subCode");
const subFaculty = document.getElementById("subFaculty");
const subjectTable = document.getElementById("subjectTable");

// ================= ADD SUBJECT =================
async function addSubject() {
  const name = subName.value;
  const code = subCode.value;
  const faculty_id = subFaculty.value;

  if (!name || !code || !faculty_id) {
    alert("Fill all fields");
    return;
  }

  try {
    const res = await fetch("/api/admin/add-subject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, code, faculty_id })
    });

    const data = await res.json();
    alert(data.message);

    loadSubjects();

  } catch (err) {
    console.error(err);
    alert("Error adding subject");
  }
}

// ================= LOAD SUBJECTS =================
async function loadSubjects() {
  try {
    const res = await fetch("/api/admin/subjects");
    const data = await res.json();

    subjectTable.innerHTML = "";

    data.forEach(sub => {
      subjectTable.innerHTML += `
        <tr>
          <td>${sub.id}</td>
          <td>${sub.name}</td>
          <td>${sub.code}</td>
          <td>${sub.faculty_name}</td>
          <td>
            <button onclick="deleteSubject(${sub.id})">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error(err);
  }
}

// ================= DELETE =================
async function deleteSubject(id) {
  if (!confirm("Delete subject?")) return;

  await fetch(`/api/admin/subject/${id}`, {
    method: "DELETE"
  });

  loadSubjects();
}

// Load on page start
loadSubjects();

// ================= WALLET =================
async function getWallet() {
  if (window.ethereum) {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    return accounts[0];
  } else {
    alert("Install MetaMask");
    return "";
  }
}

// expose globally
window.addStudent = addStudent;
window.addFaculty = addFaculty;
window.deleteStudent = deleteStudent;
window.deleteFaculty = deleteFaculty;