import { db } from "../config.js";
import { collection, addDoc, serverTimestamp, getDocs } 
  from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

export async function initAssignments() {
  const assignBtn = document.getElementById("assignBtn");
  const assignmentList = document.getElementById("assignmentList");
  const driverSelect = document.getElementById("driverSelect");

  // Load drivers into dropdown
  async function loadDrivers() {
    driverSelect.innerHTML = "<option>Select Driver</option>";
    try {
      const snap = await getDocs(collection(db, "users"));
      snap.forEach(doc => {
        const user = doc.data();
        if (user.role === "driver") {
          const opt = document.createElement("option");
          opt.value = doc.id;
          opt.textContent = user.name || user.email || "Unnamed Driver";
          driverSelect.appendChild(opt);
        }
      });
    } catch (err) {
      console.error("Error loading drivers:", err);
    }
  }

  // Create new assignment
  if (assignBtn) {
    assignBtn.addEventListener("click", async () => {
      const custName = document.getElementById("custName").value;
      const jobAddr = document.getElementById("jobAddr").value;
      const category = document.getElementById("category").value;
      const task = document.getElementById("task").value;
      const driver = driverSelect.value;

      if (!custName || !jobAddr || driver === "Select Driver") {
        alert("Please fill all fields and select a driver");
        return;
      }

      try {
        await addDoc(collection(db, "assignments"), {
          customer: custName,
          address: jobAddr,
          category,
          task,
          driver,
          created: serverTimestamp(),
        });
        alert("Assignment created!");
        loadAssignments();
      } catch (err) {
        console.error("Error creating assignment:", err);
      }
    });
  }

  // Load assignments list
  async function loadAssignments() {
    assignmentList.innerHTML = "";
    try {
      const snap = await getDocs(collection(db, "assignments"));
      snap.forEach(doc => {
        const a = doc.data();
        const div = document.createElement("div");
        div.className = "assignment-card";
        div.innerHTML = `<strong>${a.customer}</strong> – ${a.task} (${a.driver})`;
        assignmentList.appendChild(div);
      });
    } catch (err) {
      console.error("Error loading assignments:", err);
    }
  }

  // Initial loads
  loadDrivers();
  loadAssignments();
}
