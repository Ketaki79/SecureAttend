// sidebar.js

// ================= Sidebar Section Switching =================
function showSection(sectionId, btn = null) {
  // Hide all possible sections
  document.querySelectorAll(
    '.section, #dashboard, #students, #faculty, #subjects, #attendance, #profile, #reports'
  ).forEach(sec => sec.classList.add('hidden'));

  // Show the selected section
  const section = document.getElementById(sectionId);
  if (section) section.classList.remove('hidden');

  // Highlight active button
  if (btn) {
    document.querySelectorAll('aside nav button').forEach(b => {
      b.classList.remove('text-blue-400', 'bg-white/10');
    });
    btn.classList.add('text-blue-400', 'bg-white/10');
  }
}

// ================= Optional: Set default active tab on page load =================
document.addEventListener('DOMContentLoaded', () => {
  const defaultBtn = document.querySelector('aside nav button');
  if (defaultBtn) defaultBtn.click();
});