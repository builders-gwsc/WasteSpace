import { auth, db } from "./config.js";
import {
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Ensure session persists until explicit logout
await setPersistence(auth, browserLocalPersistence);

// Redirect user by Firestore role
export async function redirectByRole(user) {
  if (!user) return;

  const uref = doc(db, "users", user.uid);
  const snap = await getDoc(uref);

  let role = "driver"; // default
  if (snap.exists()) role = snap.data().role;

  if (role === "driver") location.href = "driver.html";
  else if (role === "manager") location.href = "manager.html";
  else if (role === "gm") location.href = "hub.html";
}

// Logout
export function logout() {
  return signOut(auth).then(() => (location.href = "index.html"));
}

// Attach UI event listeners
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPass").value;
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        redirectByRole(userCred.user);
      } catch (err) {
        alert("Login failed: " + err.message);
      }
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPass").value;
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), { role: "driver" });
        redirectByRole(userCred.user);
      } catch (err) {
        alert("Signup failed: " + err.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
    });
  }
});

// Watch for auth state changes
onAuthStateChanged(auth, (user) => {
  if (!user) console.log("No user signed in.");
  else console.log("User signed in:", user.email);
});
