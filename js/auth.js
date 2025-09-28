// /js/auth.js
import { auth, db } from "./config.js";
import {
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

await setPersistence(auth, browserLocalPersistence);

export function redirectByRole(user) {
  const uref = doc(db, "users", user.uid);
  getDoc(uref).then((snap) => {
    const role = snap.exists() ? snap.data().role : "driver";
    if (role === "driver") location.href = "driver.html";
    else if (role === "manager") location.href = "manager.html";
    else if (role === "gm") location.href = "hub.html";
  });
}

export function logout() {
  return signOut(auth).then(() => (location.href = "index.html"));
}
