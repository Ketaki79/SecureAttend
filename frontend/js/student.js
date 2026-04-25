// ================= STUDENT.JS =================

let account;

window.addEventListener("load", async () => {
  await connectMetaMask();
  account = window.getAccount();

  if (account) {
    await loadAttendanceFromBlockchain();
  }
});

// ---------------- LOAD FROM BLOCKCHAIN ----------------
async function loadAttendanceFromBlockchain() {
  const records = await getAttendanceRecords();

  // Filter only this student
  const myRecords = records.filter(r => r.student.toLowerCase() === account.toLowerCase());

  const subjectMap = {};

  myRecords.forEach(r => {
    if (!subjectMap[r.subject]) {
      subjectMap[r.subject] = { present: 0, total: 0 };
    }

    subjectMap[r.subject].total++;
    if (r.present) subjectMap[r.subject].present++;
  });

  const tableBody = document.querySelector("#attendance tbody");
  tableBody.innerHTML = "";

  let totalLectures = 0;
  let totalPresent = 0;

  Object.keys(subjectMap).forEach(subject => {
    const data = subjectMap[subject];
    const percent = Math.round((data.present / data.total) * 100);

    tableBody.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>${s.email || "-"}</td>
        <td>${s.branch || "-"}</td>
        <td>${s.sem}</td>
        <td>${s.wallet}</td>
      </tr>
    `;

    totalLectures += data.total;
    totalPresent += data.present;
  });

  const overall = totalLectures
    ? Math.round((totalPresent / totalLectures) * 100)
    : 0;

  document.querySelector("#dashboard .text-3xl").textContent = overall + "%";
}