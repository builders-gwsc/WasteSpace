// /js/modules/timeclock.js
import { db, auth } from "../config.js";
import {
  collection, addDoc, getDoc, setDoc, doc,
  query, where, orderBy, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

export function initTimeclock() {
  // Buttons
  const punchInBtn = document.getElementById("punchInBtn");
  const punchOutBtn = document.getElementById("punchOutBtn");
  const lunchStartBtn = document.getElementById("lunchStartBtn");
  const lunchStopBtn = document.getElementById("lunchStopBtn");
  const confirmNoLunchBtn = document.getElementById("confirmNoLunchBtn");

  // Displays
  const statusEl = document.getElementById("status");
  const dayTotalEl = document.getElementById("dayTotal");
  const weekTotalEl = document.getElementById("weekTotal");
  const dayEventsEl = document.getElementById("dayEvents");

  let ROLE = "driver";
  let USER = null;
  let CURRENT_STATE = "off";

  // Helpers
  const ymd = (d = new Date()) => d.toISOString().split("T")[0];
  const secondsToHMM = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  async function getRole(uid) {
    const uref = doc(db, "users", uid);
    const snap = await getDoc(uref);
    return snap.exists() ? snap.data().role : "driver";
  }

  async function writeEvent(type) {
    return addDoc(collection(db, "timeEvents"), {
      userId: USER.uid,
      type,
      timestamp: serverTimestamp(),
    });
  }

  function timeDayRef(uid, ymdStr) {
    return doc(db, "timeDays", `${uid}_${ymdStr}`);
  }
  async function setNoLunchConfirmed(uid, ymdStr) {
    await setDoc(timeDayRef(uid, ymdStr), { userId: uid, noLunchConfirmed: true }, { merge: true });
  }

  async function getEvents(uid, fromDate, toDate) {
    const q = query(
      collection(db, "timeEvents"),
      where("userId", "==", uid),
      orderBy("timestamp", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ ...d.data(), _ts: d.data().timestamp?.toDate() }))
      .filter((e) => e._ts >= fromDate && e._ts < toDate);
  }

  async function computeDay(uid, dateObj) {
    const start = new Date(dateObj); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(start.getDate() + 1);
    const events = await getEvents(uid, start, end);

    let workSeconds = 0;
    let lunchSeconds = 0;
    let onSince = null;
    let lunchSince = null;

    for (const e of events) {
      if (e.type === "in") onSince = e._ts;
      if (e.type === "out" && onSince) { workSeconds += (e._ts - onSince) / 1000; onSince = null; }
      if (e.type === "lunch_start") lunchSince = e._ts;
      if (e.type === "lunch_end" && lunchSince) { lunchSeconds += (e._ts - lunchSince) / 1000; lunchSince = null; }
    }

    const todayRef = await getDoc(timeDayRef(uid, ymd(start)));
    const noLunchConfirmed = todayRef.exists() ? todayRef.data().noLunchConfirmed : false;

    let policyAdj = 0;
    if (lunchSeconds < 60 && !noLunchConfirmed) policyAdj = -1800; // auto deduct 30m

    return {
      events,
      netSeconds: Math.max(0, workSeconds - lunchSeconds + policyAdj),
      recordedLunch: lunchSeconds >= 60,
      noLunchConfirmed,
    };
  }

  async function computeWeek(uid) {
    const start = new Date(); start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 7);

    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const res = await computeDay(uid, d);
      total += res.netSeconds;
    }
    return total;
  }

  function setState(state) {
    CURRENT_STATE = state;
    punchInBtn.disabled = state !== "off";
    punchOutBtn.disabled = state === "off";
    lunchStartBtn.style.display = (state === "on") ? "inline-block" : "none";
    lunchStopBtn.style.display = (state === "lunch") ? "inline-block" : "none";
    confirmNoLunchBtn.style.display = "none"; // only handled after refreshSelf()
  }

  async function refreshSelf() {
    const today = await computeDay(USER.uid, new Date());
    const weekTotal = await computeWeek(USER.uid);

    dayTotalEl.textContent = `• ${secondsToHMM(today.netSeconds)}`;
    weekTotalEl.textContent = `• ${secondsToHMM(weekTotal)}`;
    dayEventsEl.innerHTML = today.events.map(e => `<div>${e.type} – ${e._ts.toLocaleString()}</div>`).join("");

    // Confirm no lunch button only shows if OFF state, no lunch recorded, and not already confirmed
    if (CURRENT_STATE === "off" && !today.recordedLunch && !today.noLunchConfirmed) {
      confirmNoLunchBtn.style.display = "inline-block";
    } else {
      confirmNoLunchBtn.style.display = "none";
    }
  }

  // Event Handlers
  punchInBtn.addEventListener("click", async () => { await writeEvent("in"); setState("on"); await refreshSelf(); });
  punchOutBtn.addEventListener("click", async () => { await writeEvent("out"); setState("off"); await refreshSelf(); });
  lunchStartBtn.addEventListener("click", async () => { await writeEvent("lunch_start"); setState("lunch"); await refreshSelf(); });
  lunchStopBtn.addEventListener("click", async () => { await writeEvent("lunch_end"); setState("on"); await refreshSelf(); });
  confirmNoLunchBtn.addEventListener("click", async () => { await setNoLunchConfirmed(USER.uid, ymd(new Date())); await refreshSelf(); });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      statusEl.textContent = "Not signed in";
      return;
    }
    USER = user;
    ROLE = await getRole(user.uid);
    setState("off");
    await refreshSelf();
  });
}
