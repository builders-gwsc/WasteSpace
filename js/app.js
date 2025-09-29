// /js/app.js
import { onReadyUser, wireLogout } from "./auth.js";
import * as Assignments from "./modules/assignments.js";
import * as TimeClock from "./modules/timeclock.js";
import * as Calendar from "./modules/calendar.js";
import * as LoadBuilder from "./modules/loadbuilder.js";
import * as Yard from "./modules/yard.js";
import * as Routes from "./modules/routes.js";
import * as PTO from "./modules/pto.js";
import * as Reports from "./modules/reports.js";

const $ = (s, r = document) => r.querySelector(s);

const VIEWS = {
  assignments: { el: $("#view-assignments"), mod: Assignments, roles: ["driver","manager","gm"] },
  timeclock:   { el: $("#view-timeclock"),   mod: TimeClock,   roles: ["driver","manager","gm"] },
  calendar:    { el: $("#view-calendar"),    mod: Calendar,    roles: ["manager","gm"] },
  loadbuilder: { el: $("#view-loadbuilder"), mod: LoadBuilder, roles: ["manager","gm"] },
  yard:        { el: $("#view-yard"),        mod: Yard,        roles: ["manager","gm"] },
  routes:      { el: $("#view-routes"),      mod: Routes,      roles: ["driver","manager","gm"] },
  pto:         { el: $("#view-pto"),         mod: PTO,         roles: ["driver","manager","gm"] },
  reports:     { el: $("#view-reports"),     mod: Reports,     roles: ["manager","gm"] },
};

let ctx = { user: null, role: null };
let current = null;

function showView(key) {
  const target = VIEWS[key];
  if (!target || !target.roles.includes(ctx.role)) return;

  Object.values(VIEWS).forEach(v => v.el?.setAttribute("hidden",""));
  target.el?.removeAttribute("hidden");

  if (current?.mod?.destroy) current.mod.destroy(ctx);
  current = target;
  if (current.mod?.init) current.mod.init(target.el, ctx);

  location.hash = key;
}

function wireNav() {
  document.querySelectorAll("[data-view]").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });
}

function enforceRoleNav(role) {
  document.querySelectorAll("[data-view]").forEach(btn => {
    const allowed = VIEWS[btn.dataset.view]?.roles.includes(role);
    btn.toggleAttribute("disabled", !allowed);
    btn.classList.toggle("disabled", !allowed);
  });
}

function initialView() {
  const key = location.hash?.replace("#","") || "assignments";
  showView(key);
}

wireNav();
wireLogout();

onReadyUser(({ user, role }) => {
  ctx = { user, role };
  const badge = document.getElementById("roleBadge");
  if (badge) badge.textContent = role.toUpperCase();
  enforceRoleNav(role);
  initialView();
});
