const API = "http://localhost:5000/api/admin";

// ================= INIT =================
window.addEventListener("load", () => {
  refreshAll();
});

// 🔁 MASTER REFRESH (IMPORTANT)
async function refreshAll() {
  await Promise.all([
    loadStudents(),
    loadFaculty(),
    loadSubjects()
  ]);
}

// ================= STUDENTS =================
async function loadStudents() {
  try {
    const res = await fetch(`${API}/students`);
    const data = await res.json();

    const table = document.getElementById("studentTable");
    table.innerHTML = "";

    document.getElementById("studentCount").innerText = data.length;

    data.forEach(s => {
      table.innerHTML += `
        <tr class="hover:bg-white/5">
          <td class="p-3">${s.first_name} ${s.last_name || ""}</td>
          <td class="p-3">${s.email}</td>
          <td class="p-3">${s.branch || "-"}</td>
          <td class="p-3">${s.semester || "-"}</td>
          <td class="p-3 text-red-400 cursor-pointer" onclick="deleteStudent(${s.id})">Delete</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Students error:", err);
  }
}

async function addStudent() {
  const payload = {
    first_name: sFirstName.value.trim(),
    last_name: sLastName.value.trim(),
    email: sEmail.value.trim(),
    branch: sBranch.value.trim(),
    semester: sSem.value.trim()
  };

  if (!payload.first_name || !payload.email) {
    alert("Required fields missing");
    return;
  }

  await fetch(`${API}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  await refreshAll();
}

async function deleteStudent(id) {
  await fetch(`${API}/students/${id}`, { method: "DELETE" });
  await refreshAll();
}

// ================= FACULTY =================
async function loadFaculty() {
  try {
    const res = await fetch(`${API}/faculty`);
    const data = await res.json();

    const facultyList = Array.isArray(data) ? data : [];

    document.getElementById("facultyCount").innerText = facultyList.length;

    const table = document.getElementById("facultyTable");
    table.innerHTML = "";

    facultyList.forEach(f => {
      table.innerHTML += `
        <tr class="hover:bg-white/5">
          <td class="p-3">${f.first_name} ${f.last_name || ""}</td>
          <td class="p-3">${f.email}</td>
          <td class="p-3">${f.branch || "-"}</td>
          <td class="p-3">${f.subject || "-"}</td>
          <td class="p-3 text-red-400 cursor-pointer" onclick="deleteFaculty(${f.id})">Delete</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Faculty error:", err);
  }
}

async function addFaculty() {
  const payload = {
    first_name: fFirstName.value.trim(),
    last_name: fLastName.value.trim(),
    email: fEmail.value.trim(),
    branch: fBranch.value.trim(),
    subject: fSubject.value.trim()
  };

  if (!payload.first_name || !payload.email || !payload.subject) {
    alert("Required fields missing");
    return;
  }

  const res = await fetch(`${API}/faculty`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Faculty add failed");
    return;
  }

  await refreshAll(); 
}

async function deleteFaculty(id) {
  await fetch(`${API}/faculty/${id}`, { method: "DELETE" });
  await refreshAll();
}

// ================= SUBJECTS =================
async function loadSubjects() {
  try {
    const res = await fetch(`${API}/subjects`);
    const data = await res.json();

    const subjects = Array.isArray(data) ? data : [];

    document.getElementById("subjectCount").innerText = subjects.length;

    const table = document.getElementById("subjectTable");
    table.innerHTML = "";

    subjects.forEach(sub => {
      table.innerHTML += `
        <tr class="hover:bg-white/5">
          <td class="p-3">${sub.name || "-"}</td>
          <td class="p-3">${sub.code || "-"}</td>
          <td class="p-3">${sub.faculty_name || "-"}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Subjects error:", err);
  }
}

async function addSubject() {
  const payload = {
    name: subName.value,
    code: subCode.value,
    faculty_id: subFaculty.value
  };

  if (!payload.name || !payload.code || !payload.faculty_id) {
    alert("Fill all fields");
    return;
  }

  await fetch(`${API}/add-subject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  await refreshAll();
}

async function deleteSubject(id) {
  await fetch(`${API}/subject/${id}`, { method: "DELETE" });
  await refreshAll();
}

// ================= EXPORT =================
window.addStudent = addStudent;
window.addFaculty = addFaculty;
window.addSubject = addSubject;
window.deleteStudent = deleteStudent;
window.deleteFaculty = deleteFaculty;
window.deleteSubject = deleteSubject;