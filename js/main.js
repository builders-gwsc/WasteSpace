// /js/main.js
import { logout } from "./auth.js";
import { initAssignments } from "./modules/assignments.js";
import { initTimeclock } from "./modules/timeclock.js";

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll("main section");

  // Tab switching
  tabs.forEach(btn => {
    btn.addEventListener("click", () => {
      tabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      sections.forEach(s => s.classList.remove("active"));
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => logout());

  // Initialize modules
  initAssignments();
  initTimeclock();
});
