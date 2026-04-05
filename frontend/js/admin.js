// Data Arrays
let students = [];
let faculty = [];
let subjects = [];

// NAVIGATION
function showSection(sec){
  document.querySelectorAll("main > div").forEach(d => d.classList.add("hidden"));
  document.getElementById(sec).classList.remove("hidden");

  if(sec==="students") renderStudents();
  if(sec==="faculty") renderFaculty();
  if(sec==="subjects") renderSubjects();
}

// ADD STUDENT
function addStudent(){
  students.push({
    name: sName.value,
    email: sEmail.value,
    branch: sBranch.value,
    sem: sSem.value
  });

  sName.value = "";
  sEmail.value = "";
  sBranch.value = "";
  sSem.value = "";

  updateCounts();
  alert("Student Added");
}

// ADD FACULTY
function addFaculty(){
  faculty.push({
    name: fName.value,
    email: fEmail.value,
    branch: fBranch.value,
    subject: fSubject.value
  });

  fName.value = "";
  fEmail.value = "";
  fBranch.value = "";
  fSubject.value = "";

  updateCounts();
  alert("Faculty Added");
}

// RENDER STUDENTS
function renderStudents(){
  studentTable.innerHTML="";
  students.forEach((s,i)=>{
    studentTable.innerHTML+=`
    <tr>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td>${s.branch}</td>
      <td>${s.sem}</td>
      <td><button onclick="deleteStudent(${i})" class="text-red-400">Delete</button></td>
    </tr>`;
  });
}

// RENDER FACULTY
function renderFaculty(){
  facultyTable.innerHTML="";
  faculty.forEach((f,i)=>{
    facultyTable.innerHTML+=`
    <tr>
      <td>${f.name}</td>
      <td>${f.email}</td>
      <td>${f.branch}</td>
      <td>${f.subject}</td>
      <td><button onclick="deleteFaculty(${i})" class="text-red-400">Delete</button></td>
    </tr>`;
  });
}

// RENDER SUBJECTS
function renderSubjects() {
  let table = document.getElementById("subjectTable");
  table.innerHTML = "";

  subjects.forEach(s => {
    table.innerHTML += `
      <tr class="border-b border-white/10">
        <td class="p-2">${s.sem}</td>
        <td>${s.subject}</td>
      </tr>
    `;
  });
}

// DELETE
function deleteStudent(i){ students.splice(i,1); renderStudents(); updateCounts();}
function deleteFaculty(i){ faculty.splice(i,1); renderFaculty(); updateCounts();}

// UPDATE COUNTS
function updateCounts(){
  studentCount.innerText = students.length;
  facultyCount.innerText = faculty.length;
}