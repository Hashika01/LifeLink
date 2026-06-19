/* ═══════════════════════════════════════════════════════════════════
   LifeLink v3.0 — Pure Vanilla JavaScript
═══════════════════════════════════════════════════════════════════ */

"use strict";

// ── CONSTANTS ────────────────────────────────────────────────────
const EMERGENCY_DB = {
  fire:       { label:"Fire Emergency",      icon:"🔥", color:"#FF5722", severity:9,  category:"FIRE",          confidence:94, risk:88, responders:["Fire Brigade","Ambulance","Police Control"],            protocol:"Evacuate immediately. Do not use elevators. Crawl low under smoke.",             firstAid:"Cover mouth with wet cloth. Move to stairwell exits only." },
  medical:    { label:"Medical Emergency",   icon:"🫀", color:"#F44336", severity:10, category:"MEDICAL",       confidence:97, risk:96, responders:["Advanced Life Support","Cardiac Unit","Air Ambulance"],  protocol:"Keep patient still. Do not give food/water. Loosen clothing.",                  firstAid:"Check breathing. Begin CPR if unconscious and not breathing." },
  heart:      { label:"Cardiac Emergency",   icon:"💔", color:"#E53935", severity:10, category:"MEDICAL",       confidence:97, risk:98, responders:["Cardiac Response Unit","ALS Ambulance","Cath Lab Team"], protocol:"Chew aspirin if not allergic. Stay calm. Don't exert.",                        firstAid:"Begin CPR immediately. Use AED if available." },
  accident:   { label:"Road Accident",       icon:"🚗", color:"#FF9800", severity:7,  category:"ACCIDENT",      confidence:91, risk:72, responders:["Trauma Ambulance","Traffic Police","Fire & Rescue"],     protocol:"Do not move injured persons. Secure scene. Hazard lights on.",                  firstAid:"Control bleeding with pressure. Keep injured warm." },
  flood:      { label:"Flood Emergency",     icon:"🌊", color:"#2196F3", severity:8,  category:"DISASTER",      confidence:89, risk:80, responders:["NDRF Unit","Coast Guard","Disaster Relief"],             protocol:"Move to higher ground immediately. Avoid all flowing water.",                   firstAid:"Do not drink flood water. Seek medical help for wounds." },
  earthquake: { label:"Earthquake",          icon:"🏚️", color:"#795548", severity:9,  category:"DISASTER",      confidence:92, risk:85, responders:["NDRF Search & Rescue","Medical Corps","Heavy Equipment"], protocol:"Drop, cover, hold on. Away from windows. Do not run outside.",                 firstAid:"Do not move injured. Check for crush injuries." },
  robbery:    { label:"Security Threat",     icon:"🔫", color:"#9C27B0", severity:8,  category:"CRIME",         confidence:88, risk:79, responders:["Armed Police Response","Rapid Action Force","Special Branch"], protocol:"Do not resist. Stay calm. Comply with demands.",                      firstAid:"Treat wounds once safe. Note attacker description." },
  attack:     { label:"Physical Attack",     icon:"🚨", color:"#E91E63", severity:9,  category:"CRIME",         confidence:90, risk:86, responders:["Police Emergency","Armed Response","Ambulance"],          protocol:"Move to populated area. Make noise. Attract attention.",                       firstAid:"Apply pressure to wounds. Do not remove embedded objects." },
  women:      { label:"Women's Safety",      icon:"🛡️", color:"#E91E63", severity:9,  category:"WOMENS_SAFETY", confidence:93, risk:84, responders:["Women's Helpline 181","Police Control Room","Safe House Unit"], protocol:"Move to crowded area. Call trusted contact. Stay on line.",          firstAid:"Document injuries. Preserve evidence. Seek safe shelter." },
  child:      { label:"Child Safety Alert",  icon:"👶", color:"#FF5722", severity:10, category:"CHILD_SAFETY",  confidence:96, risk:94, responders:["Child Helpline 1098","Police Control Room","Child Welfare"], protocol:"Do not leave child. Attract public attention immediately.",             firstAid:"Reassure child. Do not question. Contact authorities." },
  help:       { label:"General SOS",         icon:"🆘", color:"#607D8B", severity:6,  category:"GENERAL_SOS",   confidence:78, risk:58, responders:["Police Control Room","General Ambulance"],                protocol:"Stay calm. Share exact location. Keep phone charged.",                          firstAid:"Stay in safe location. Signal for help visibly." },
  sos:        { label:"Emergency SOS",       icon:"📡", color:"#FF1744", severity:7,  category:"SOS",           confidence:82, risk:65, responders:["Emergency Control Room","Police","Ambulance"],             protocol:"Responders notified. Stay at current location. Keep phone on.",                 firstAid:"Stay visible. Signal passing vehicles or people." },
};

const NLP_PATTERNS = [
  { pattern:/\b(fire|burn|blaz|smok|flame)/i,               type:"fire" },
  { pattern:/\b(heart|cardiac|chest pain|not breathing|collapsed|faint|stroke|seizure|unconscious|breathing)/i, type:"heart" },
  { pattern:/\b(bleeding|wound|injur|broke|fractur|medical|sick|pain|hurt|ambulance)/i, type:"medical" },
  { pattern:/\b(accident|crash|collision|car|vehicle|truck|bike|road|hit)/i,            type:"accident" },
  { pattern:/\b(flood|water|drown|tsunami|cyclone|rain|overflow)/i,                     type:"flood" },
  { pattern:/\b(earthquake|quake|tremor|shaking|building|collapse)/i,                  type:"earthquake" },
  { pattern:/\b(robbery|theft|steal|stolen|burglar|mug|snatch)/i,                       type:"robbery" },
  { pattern:/\b(attack|assault|hit|stab|shot|weapon|gun|knife|follow|stalk)/i,          type:"attack" },
  { pattern:/\b(woman|women|girl|harass|molest|eve|rape|follow)/i,                      type:"women" },
  { pattern:/\b(child|kid|baby|minor|missing|kidnap|abduct)/i,                          type:"child" },
  { pattern:/\b(help|sos|emergency|danger|save|rescue)/i,                               type:"sos" },
];

const HOLD_DURATION = 2000;
const RING_R = 45;
const RING_C = 2 * Math.PI * RING_R;

const FALLBACK_SERVICES = [
  { id:1, name:"Apollo Hospital",     type:"hospital", dist:0.8, distLabel:"0.8 km", eta:"4 min",  phone:"044-2829-0200" },
  { id:2, name:"MIOT International",  type:"hospital", dist:1.2, distLabel:"1.2 km", eta:"6 min",  phone:"044-4200-2288" },
  { id:3, name:"Teynampet Police",    type:"police",   dist:1.5, distLabel:"1.5 km", eta:"7 min",  phone:"044-2433-4567" },
  { id:4, name:"Anna Nagar Fire Stn", type:"fire",     dist:2.1, distLabel:"2.1 km", eta:"9 min",  phone:"101" },
  { id:5, name:"Adyar Fire Station",  type:"fire",     dist:2.8, distLabel:"2.8 km", eta:"12 min", phone:"101" },
  { id:6, name:"Nandanam Police",     type:"police",   dist:3.2, distLabel:"3.2 km", eta:"14 min", phone:"100" },
];

const HISTORY_DATA = [
  { id:"LL-2026-A92KX4", type:"Medical Emergency",  time:"14:32", location:"Anna Nagar, Chennai",   severity:8, category:"MEDICAL",       status:"Resolved" },
  { id:"LL-2026-B74MQ1", type:"Fire Emergency",      time:"13:15", location:"T. Nagar, Chennai",     severity:9, category:"FIRE",          status:"Resolved" },
  { id:"LL-2026-C31WP8", type:"Road Accident",       time:"11:52", location:"Adyar, Chennai",        severity:6, category:"ACCIDENT",      status:"Resolved" },
  { id:"LL-2026-D58RN2", type:"Security Threat",     time:"10:08", location:"Nungambakkam, Chennai", severity:7, category:"CRIME",         status:"Resolved" },
  { id:"LL-2026-E19YZ6", type:"Women's Safety",      time:"09:44", location:"Velachery, Chennai",    severity:9, category:"WOMENS_SAFETY", status:"Resolved" },
];

const HEAT_DOTS = [
  {x:"28%",y:"35%",r:22,c:"rgba(232,17,43,.45)",d:"0s"},
  {x:"52%",y:"48%",r:18,c:"rgba(255,120,0,.4)",d:".4s"},
  {x:"70%",y:"25%",r:14,c:"rgba(255,200,0,.35)",d:".8s"},
  {x:"18%",y:"60%",r:16,c:"rgba(232,17,43,.3)",d:"1.2s"},
  {x:"82%",y:"65%",r:12,c:"rgba(255,87,34,.35)",d:".6s"},
  {x:"40%",y:"72%",r:10,c:"rgba(255,150,0,.3)",d:"1.5s"},
];

// ── APP STATE ────────────────────────────────────────────────────
const state = {
  page: "home",
  emergency: null,
  incidentId: null,
  geo: { lat: null, lng: null, accuracy: null, error: null, loading: false },
  services: [],
  geoWatchId: null,
  leafletMap: null,
  leafletUserMarker: null,
  leafletSvcMarkers: [],
  voiceState: "idle", // idle|listening|processing|classifying|done|error
  sosHolding: false,
  sosTimer: null,
  sosProgress: 0,
  sosAnimFrame: null,
  fakeCallTimer: null,
  fakeCallTick: 0,
  fakeCallActive: false,
  childSubmitted: false,
  commandTick: 0,
  commandTickInterval: null,
  respCount: 0,
};

let _idSeed = 1;
function makeIncidentId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let id = "", n = Date.now() + (_idSeed++ * 9973);
  for (let i = 0; i < 6; i++) { id += chars[n % chars.length]; n = Math.floor(n / chars.length) + i * 1009; }
  return `LL-2026-${id}`;
}

function sanitize(s) { return String(s).replace(/[<>"'&]/g,"").trim().slice(0,200); }

function classifyNLP(text) {
  const t = sanitize(text).toLowerCase();
  for (const { pattern, type } of NLP_PATTERNS) {
    if (pattern.test(t)) return type;
  }
  return null;
}

function computeRiskScore(emergencyType, severity, confidence) {
  const base       = (severity / 10) * 50;
  const confFactor = (confidence / 100) * 30;
  const typeFactor = EMERGENCY_DB[emergencyType]?.risk ?? 60;
  return Math.min(99, Math.round(base + confFactor + (typeFactor * 0.2)));
}

function computeConfidence(type, inputLength) {
  const base        = EMERGENCY_DB[type]?.confidence ?? 75;
  const lengthBonus = Math.min(5, Math.floor(inputLength / 10));
  return Math.min(99, base + lengthBonus);
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── AI CLASSIFICATION ────────────────────────────────────────────
async function aiClassify(userText) {
  const cleaned = sanitize(userText);
  const type = classifyNLP(cleaned) || "sos";
  const confidence = computeConfidence(type, cleaned.length);
  return {
    ...EMERGENCY_DB[type],
    type, confidence,
    severity: EMERGENCY_DB[type].severity,
    reasoning: `NLP pattern matched "${type}" category`,
    immediateAction: EMERGENCY_DB[type].protocol?.split(".")[0] ?? "Stay calm and await responders",
    source: "local",
  };
}

// ── GEOLOCATION ──────────────────────────────────────────────────
function startGeo() {
  if (!navigator.geolocation) { state.geo.error = "Geolocation not supported"; return; }
  state.geo.loading = true;
  state.geoWatchId = navigator.geolocation.watchPosition(
    pos => {
      state.geo = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy), error: null, loading: false };
      onGeoUpdate();
    },
    err => {
      const msgs = { 1:"Location access denied", 2:"Location unavailable", 3:"Location request timed out" };
      state.geo.error = msgs[err.code] ?? "Location error";
      state.geo.loading = false;
    },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
}

function stopGeo() {
  if (state.geoWatchId != null) { navigator.geolocation.clearWatch(state.geoWatchId); state.geoWatchId = null; }
}

function onGeoUpdate() {
  if (state.geo.lat && state.geo.lng) {
    updateMapUserMarker();
    fetchNearbyServices(state.geo.lat, state.geo.lng).catch(() => {});
  }
  if (state.page === "dashboard") renderServicesPanel();
  renderGeoStatus();
}

// ── OVERPASS API ─────────────────────────────────────────────────
async function fetchNearbyServices(lat, lng, radiusM = 5000) {
  const query = `[out:json][timeout:15];
(
  node["amenity"="hospital"](around:${radiusM},${lat},${lng});
  node["amenity"="police"](around:${radiusM},${lat},${lng});
  node["amenity"="fire_station"](around:${radiusM},${lat},${lng});
  node["amenity"="clinic"](around:${radiusM},${lat},${lng});
  way["amenity"="hospital"](around:${radiusM},${lat},${lng});
  way["amenity"="police"](around:${radiusM},${lat},${lng});
  way["amenity"="fire_station"](around:${radiusM},${lat},${lng});
);
out center 20;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", { method:"POST", body:query });
    if (!res.ok) throw new Error("Overpass error");
    const data = await res.json();
    state.services = data.elements.map(el => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      const dist = haversineKm(lat, lng, elLat, elLng);
      const amenity = el.tags?.amenity;
      const type = amenity === "hospital" || amenity === "clinic" ? "hospital" : amenity === "police" ? "police" : "fire";
      const name = el.tags?.name || el.tags?.["name:en"] || (type === "hospital" ? "Hospital" : type === "police" ? "Police Station" : "Fire Station");
      const etaMin = Math.round((dist / 40) * 60);
      return { id: el.id, name, type, lat: elLat, lng: elLng, dist, distLabel: dist < 1 ? `${Math.round(dist*1000)}m` : `${dist.toFixed(1)}km`, eta:`${etaMin} min`, phone: el.tags?.phone || (type === "police" ? "100" : type === "fire" ? "101" : "108") };
    }).sort((a, b) => a.dist - b.dist).slice(0, 8);
    if (state.page === "dashboard") renderServicesPanel();
  } catch (_) { /* silently fall back */ }
}

// ── NAVIGATION ───────────────────────────────────────────────────
function navigate(page) {
  const pages = ["home","dashboard","command","safety","history"];
  pages.forEach(p => {
    document.getElementById(`page-${p}`).classList.toggle("active", p === page);
    const btn = document.querySelector(`.nb[data-page="${p}"]`);
    if (btn) btn.classList.toggle("act", p === page);
  });
  state.page = page;
  if (page === "home")      renderHome();
  if (page === "dashboard") renderDashboard();
  if (page === "command")   renderCommand();
  if (page === "safety")    renderSafety();
  if (page === "history")   renderHistory();
}

// ── HELPERS ──────────────────────────────────────────────────────
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "style" && typeof v === "object") {
      Object.assign(el.style, v);
    } else if (k.startsWith("on")) {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "className") {
      el.className = v;
    } else if (k === "innerHTML") {
      el.innerHTML = v;
    } else {
      el.setAttribute(k, v);
    }
  }
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === "string" || typeof child === "number") el.appendChild(document.createTextNode(child));
    else if (child instanceof Node) el.appendChild(child);
  }
  return el;
}

function div(attrs, ...children) { return h("div", attrs, ...children); }
function span(attrs, ...children) { return h("span", attrs, ...children); }
function btn(attrs, ...children) { return h("button", attrs, ...children); }

function makeDot(type) { return span({ className: `dot d${type}` }); }
function makeTag(cls, ...children) { return span({ className: `tag ${cls}` }, ...children); }
function makeLbl(text) { return div({ className: "lbl" }, text); }

function makeBar(value, color) {
  const wrap = div({ className: "bar" });
  const fill = div({ className: "barf", style: { width: "0%", background: color } });
  wrap.appendChild(fill);
  setTimeout(() => { fill.style.width = `${value}%`; }, 80);
  return wrap;
}

function categoryColor(cat) {
  const map = { MEDICAL:"#F44336", FIRE:"#FF5722", ACCIDENT:"#FF9800", DISASTER:"#2196F3", CRIME:"#9C27B0", WOMENS_SAFETY:"#E91E63", CHILD_SAFETY:"#FF5722", GENERAL_SOS:"#607D8B", SOS:"#FF1744" };
  return map[cat] || "#607D8B";
}

function categoryTag(cat) {
  const map = { MEDICAL:"tr", FIRE:"tr", ACCIDENT:"to", DISASTER:"tb", CRIME:"tp", WOMENS_SAFETY:"tr", CHILD_SAFETY:"to", GENERAL_SOS:"tgr", SOS:"tr" };
  return map[cat] || "tgr";
}

function severityBar(val) {
  const color = val >= 9 ? "#e8112b" : val >= 7 ? "#ff9426" : "#4096ff";
  return makeBar(val * 10, color);
}

function animateCount(el, target, duration = 1200) {
  const start = Date.now();
  function step() {
    const elapsed = Date.now() - start;
    const progress = Math.min(1, elapsed / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  step();
}

// ── HOME PAGE ────────────────────────────────────────────────────
function renderHome() {
  const el = document.getElementById("page-home");
  el.innerHTML = "";

  const hero = div({ className: "hero-section" });

  const tagRow = div({ style: { marginBottom:"20px" } });
  tagRow.appendChild(makeTag("tr", makeDot("l"), " AI EMERGENCY RESPONSE — INDIA · REAL-TIME"));
  hero.appendChild(tagRow);

  const title = h("h1", { className: "hero-title" });
  title.innerHTML = `EVERY<br><span style="color:#d80e26">SECOND</span><br>COUNTS`;
  hero.appendChild(title);

  hero.appendChild(h("p", { style: { fontSize:"16px", color:"#6b87ae", maxWidth:"500px", margin:"0 auto 28px", lineHeight:"1.75" } },
    "LifeLink connects you to emergency services in seconds through real AI classification, live GPS tracking, and intelligent dispatch routing."
  ));

  const btns = div({ style: { display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center" } });
  const sosBtn = btn({ className: "br", onclick: () => { activateSOS(); navigate("dashboard"); } }, "🆘 Activate SOS");
  const dashBtn = btn({ className: "bp", onclick: () => navigate("dashboard") }, "🧠 AI Dashboard");
  const cmdBtn = btn({ className: "bg", onclick: () => navigate("command") }, "⚡ Command Center →");
  btns.appendChild(sosBtn);
  btns.appendChild(dashBtn);
  btns.appendChild(cmdBtn);
  hero.appendChild(btns);

  el.appendChild(hero);

  // Stats section
  const stats = h("section", { style: { maxWidth:"1080px", margin:"0 auto", padding:"0 18px 50px" } });
  const statsGrid = div({ className: "grid-stats" });
  const statData = [
    { v: 12847, l: "Emergency Responses", i: "🚨" },
    { v: 3291,  l: "Lives Saved",         i: "❤️" },
    { v: 47,    l: "Avg Response (sec)",  i: "⚡" },
    { v: 28,    l: "Cities Active",       i: "🌆" },
  ];
  statData.forEach((s, i) => {
    const card = div({ className: "stc", style: { animation: `cp .45s ease ${i * .08}s both` } });
    card.appendChild(span({ style: { fontSize:"22px", marginBottom:"6px", display:"block" } }, s.i));
    const num = h("div", { style: { fontFamily:"'Rajdhani',sans-serif", fontSize:"32px", fontWeight:"700" } }, "0");
    card.appendChild(num);
    card.appendChild(div({ style: { fontSize:"11px", color:"#34507a", marginTop:"2px" } }, s.l));
    statsGrid.appendChild(card);
    setTimeout(() => animateCount(num, s.v), i * 80);
  });
  stats.appendChild(statsGrid);
  el.appendChild(stats);

  // Features section
  const feats = h("section", { style: { maxWidth:"1080px", margin:"0 auto", padding:"0 18px 64px" } });
  feats.appendChild(makeLbl("PLATFORM CAPABILITIES"));
  const featGrid = div({ className: "grid-auto", style: { marginTop:"14px" } });
  const featData = [
    { i:"🧠", t:"Real AI Classification",    d:"NLP understands natural language — 'my father isn't breathing' — not just keywords.",       c:"#4096ff" },
    { i:"📍", t:"Live GPS Tracking",          d:"navigator.geolocation provides live coordinates, accuracy metrics, and continuous updates.", c:"#24d480" },
    { i:"🗺️", t:"OpenStreetMap Integration",  d:"Real Leaflet.js map with dark theme, live user marker, and nearest services.",              c:"#b85aff" },
    { i:"🆘", t:"Hold-to-Activate SOS",       d:"2-second hold prevents accidental triggers. Progress ring, haptic simulation, instant dispatch.", c:"#ff3f62" },
    { i:"🎙️", t:"Voice Recognition",          d:"Web Speech API listens and classifies your emergency in real-time.",                        c:"#ff9426" },
    { i:"🛡️", t:"Women & Child Safety",       d:"Dedicated modes with fake call, rapid SOS, and missing child broadcast.",                   c:"#E91E63" },
  ];
  featData.forEach(f => {
    const card = div({ className: "featcard" });
    card.appendChild(span({ style: { fontSize:"26px", marginBottom:"10px", display:"block" } }, f.i));
    card.appendChild(h("div", { style: { fontFamily:"'Rajdhani',sans-serif", fontSize:"16px", fontWeight:"700", color:f.c, marginBottom:"6px" } }, f.t));
    card.appendChild(h("p", { style: { fontSize:"12px", color:"#6b87ae", lineHeight:"1.7" } }, f.d));
    featGrid.appendChild(card);
  });
  feats.appendChild(featGrid);
  el.appendChild(feats);

  // Emergency quick types
  const quickEl = h("section", { style: { maxWidth:"1080px", margin:"0 auto", padding:"0 18px 64px" } });
  quickEl.appendChild(makeLbl("QUICK EMERGENCY TYPES"));
  const quickGrid = div({ style: { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"10px", marginTop:"14px" } });
  Object.entries(EMERGENCY_DB).slice(0,8).forEach(([key, em]) => {
    const card = div({
      className: "card",
      style: { cursor:"pointer", textAlign:"center", padding:"14px", transition:"border-color .2s, transform .2s", borderColor:"rgba(0,100,255,.12)" },
      onclick: () => { activateEmergency(em); navigate("dashboard"); }
    });
    card.addEventListener("mouseover",  () => { card.style.borderColor = em.color + "44"; card.style.transform = "translateY(-2px)"; });
    card.addEventListener("mouseout",   () => { card.style.borderColor = ""; card.style.transform = ""; });
    card.appendChild(span({ style:{ fontSize:"26px", display:"block", marginBottom:"6px" } }, em.icon));
    card.appendChild(div({ style:{ fontSize:"11px", color:"#8aabcc", lineHeight:"1.4" } }, em.label));
    quickGrid.appendChild(card);
  });
  quickEl.appendChild(quickGrid);
  el.appendChild(quickEl);
}

// ── DASHBOARD PAGE ───────────────────────────────────────────────
function renderDashboard() {
  const el = document.getElementById("page-dashboard");
  el.innerHTML = "";

  const wrap = div({ className: "dashboard-wrap" });

  // Header
  const hdr = div({ style:{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"18px", flexWrap:"wrap", gap:"10px" } });
  hdr.appendChild(div({}, makeLbl("AI EMERGENCY DASHBOARD"), h("h1", { style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"22px", fontWeight:"700" } }, "Intelligent Dispatch")));
  if (state.emergency) {
    const liveTag = makeTag("tr");
    liveTag.style.animation = "bk 1s infinite";
    liveTag.appendChild(makeDot("l"));
    liveTag.appendChild(document.createTextNode(` ${state.incidentId} LIVE`));
    hdr.appendChild(liveTag);
  }
  wrap.appendChild(hdr);

  // Split layout
  const split = div({ className: "dashboard-split" });

  // LEFT COLUMN
  const left = div({ style:{ display:"flex", flexDirection:"column", gap:"18px" } });

  // SOS Section
  left.appendChild(buildSOSSection());

  // Voice + Input Section
  left.appendChild(buildVoiceSection());

  // Map
  left.appendChild(buildMapSection());

  split.appendChild(left);

  // RIGHT COLUMN
  const right = div({ style:{ display:"flex", flexDirection:"column", gap:"14px" } });

  // Classification result
  right.appendChild(buildResultSection());

  // Nearby services
  right.appendChild(buildServicesSection());

  split.appendChild(right);
  wrap.appendChild(split);
  el.appendChild(wrap);

  // Init Leaflet map after DOM insertion
  requestAnimationFrame(() => initLeafletMap());

  // Start geo if not started
  if (state.geoWatchId == null && !state.geo.lat) startGeo();
}

function buildSOSSection() {
  const card = div({ className: "card", style:{ textAlign:"center" } });
  card.appendChild(makeLbl("HOLD 2 SECONDS TO ACTIVATE"));

  const soswrap = div({ className: "soswrap", style:{ margin:"20px auto 16px", width:"fit-content" } });

  // Pulse rings
  soswrap.appendChild(div({ className: "sosring" }));

  const isOk = state.emergency !== null;
  const sosClass = isOk ? "sosbtn ok" : "sosbtn";

  const innerContent = div({ style:{ display:"flex", flexDirection:"column", alignItems:"center", gap:"2px" } });
  innerContent.appendChild(div({ style:{ fontSize:"24px", fontWeight:"700", letterSpacing:"3px", fontFamily:"'Rajdhani',sans-serif" } }, isOk ? "✓ SENT" : "SOS"));
  innerContent.appendChild(div({ style:{ fontSize:"10px", letterSpacing:"1.5px", opacity:".8" } }, isOk ? "RESPONDERS NOTIFIED" : "PRESS & HOLD"));

  // Progress ring SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "sospsvg");
  svg.setAttribute("viewBox", "0 0 166 166");
  svg.setAttribute("aria-hidden", "true");
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", "83"); circle.setAttribute("cy", "83"); circle.setAttribute("r", String(RING_R));
  circle.setAttribute("fill", "none"); circle.setAttribute("stroke", "#fff"); circle.setAttribute("stroke-width", "3");
  circle.setAttribute("stroke-linecap", "round"); circle.setAttribute("stroke-dasharray", String(RING_C));
  circle.setAttribute("stroke-dashoffset", String(RING_C));
  circle.setAttribute("transform", "rotate(-90 83 83)");
  circle.id = "sos-ring-circle";
  svg.appendChild(circle);

  const sosEl = btn({ className: sosClass, id: "sos-btn", "aria-label": "Hold to activate emergency SOS" });
  sosEl.appendChild(innerContent);
  sosEl.appendChild(svg);

  setupSOSButton(sosEl, circle);
  soswrap.appendChild(sosEl);
  card.appendChild(soswrap);

  // Status message
  const statusMsg = div({ id: "sos-status", style:{ fontSize:"12px", color:"#34507a", minHeight:"18px" } });
  card.appendChild(statusMsg);

  return card;
}

function setupSOSButton(el, circle) {
  let startTime = 0;
  let animFrame = null;

  function onStart(e) {
    e.preventDefault();
    if (state.emergency) return;
    el.classList.add("hold");
    startTime = Date.now();
    animateSOS();
  }

  function animateSOS() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / HOLD_DURATION);
    const offset = RING_C * (1 - progress);
    circle.setAttribute("stroke-dashoffset", String(offset));
    const statusEl = document.getElementById("sos-status");
    if (statusEl) statusEl.textContent = progress < 1 ? `Hold for ${((HOLD_DURATION - elapsed) / 1000).toFixed(1)}s…` : "";
    if (progress < 1) {
      animFrame = requestAnimationFrame(animateSOS);
    } else {
      onSOSActivate();
    }
  }

  function onEnd() {
    if (state.emergency) return;
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    el.classList.remove("hold");
    circle.setAttribute("stroke-dashoffset", String(RING_C));
    const statusEl = document.getElementById("sos-status");
    if (statusEl) statusEl.textContent = "";
  }

  el.addEventListener("mousedown",  onStart);
  el.addEventListener("touchstart", onStart, { passive: false });
  el.addEventListener("mouseup",    onEnd);
  el.addEventListener("mouseleave", onEnd);
  el.addEventListener("touchend",   onEnd);
  el.addEventListener("touchcancel",onEnd);
}

function onSOSActivate() {
  const info = EMERGENCY_DB.sos;
  activateEmergency(info);
  const btn = document.getElementById("sos-btn");
  if (btn) {
    btn.classList.remove("hold");
    btn.classList.add("ok");
    btn.querySelector("div div:first-child").textContent = "✓ SENT";
    btn.querySelector("div div:last-child").textContent  = "RESPONDERS NOTIFIED";
  }
  const circle = document.getElementById("sos-ring-circle");
  if (circle) circle.setAttribute("stroke-dashoffset", "0");
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
  updateNavStatus();
  renderResultSection();
  renderServicesSection();
}

function activateSOS() {
  activateEmergency(EMERGENCY_DB.sos);
  updateNavStatus();
}

function activateEmergency(em) {
  state.emergency  = em;
  state.incidentId = makeIncidentId();
  if (!state.geo.lat) startGeo();
  renderResultSection();
  renderServicesSection();
  updateNavStatus();
  addToHistory(em);
}

function addToHistory(em) {
  const now = new Date();
  const entry = {
    id: state.incidentId,
    type: em.label,
    time: `${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`,
    location: state.geo.lat ? `${state.geo.lat.toFixed(4)}°N, ${state.geo.lng.toFixed(4)}°E` : "Location pending",
    severity: em.severity,
    category: em.category,
    status: "Active",
  };
  HISTORY_DATA.unshift(entry);
}

function updateNavStatus() {
  const dot  = document.getElementById("navLiveDot");
  const text = document.getElementById("navStatusText");
  if (!dot || !text) return;
  if (state.emergency) {
    dot.style.display  = "inline-block";
    text.textContent   = state.incidentId;
  } else {
    dot.style.display  = "none";
    text.textContent   = "";
  }
}

function buildVoiceSection() {
  const card = div({ className: "card" });
  card.appendChild(makeLbl("VOICE & TEXT CLASSIFICATION"));

  const row = div({ style:{ display:"flex", gap:"14px", alignItems:"flex-start" } });

  // Voice button area
  const voiceArea = div({ style:{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", flexShrink:"0" } });
  const vcwrap    = div({ style:{ position:"relative" } });

  const vcbtn = btn({
    className: "vcbtn", id:"vc-btn",
    "aria-label": "Activate voice recognition",
    onclick: toggleVoice
  }, "🎙️");
  const ring1 = div({ className: "vcring",    id:"vc-ring1" });
  const ring2 = div({ className: "vcring r2", id:"vc-ring2" });
  vcwrap.appendChild(ring1); vcwrap.appendChild(ring2); vcwrap.appendChild(vcbtn);
  voiceArea.appendChild(vcwrap);

  // Waveform
  const waveform = div({ style:{ display:"flex", gap:"3px", alignItems:"center", height:"24px" }, id:"vc-waveform" });
  [1,2,3,4,5,6,7].forEach((_, i) => {
    const bar = div({ className: "wvb", style:{ height:`${8 + Math.sin(i * 1.2) * 6}px` } });
    bar.id = `wvb-${i}`;
    waveform.appendChild(bar);
  });
  voiceArea.appendChild(waveform);
  voiceArea.appendChild(div({ id:"vc-status", style:{ fontSize:"10px", color:"#34507a", textAlign:"center" } }, "Click to speak"));
  row.appendChild(voiceArea);

  // Text input
  const inputArea = div({ style:{ flex:"1" } });
  const textarea  = h("textarea", {
    className: "inp", id:"desc-input",
    placeholder: "Describe your emergency (e.g. 'building on fire, people trapped')…",
    rows: "3",
    style: { marginBottom:"10px" }
  });
  inputArea.appendChild(textarea);
  const classifyBtn = btn({
    className: "bp",
    style: { width:"100%" },
    onclick: () => classifyText()
  });
  classifyBtn.id = "classify-btn";
  classifyBtn.innerHTML = "🧠 Classify Emergency";
  inputArea.appendChild(classifyBtn);
  row.appendChild(inputArea);
  card.appendChild(row);
  return card;
}

async function classifyText() {
  const input = document.getElementById("desc-input");
  const text  = input ? input.value.trim() : "";
  if (!text) return;

  const classBtn = document.getElementById("classify-btn");
  if (classBtn) classBtn.innerHTML = `<span class="spinner"></span> Classifying…`;

  const result = await aiClassify(text);
  activateEmergency(result);

  if (classBtn) classBtn.innerHTML = "🧠 Classify Emergency";
  renderResultSection();
  renderServicesSection();
}

function toggleVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setVoiceStatus("error", "Voice not supported in this browser");
    return;
  }
  if (state.voiceState === "listening") {
    state.voiceState = "idle";
    setVoiceStatus("idle", "Click to speak");
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.continuous    = false;
  recognition.interimResults = false;
  recognition.lang          = "en-IN";

  recognition.onstart   = () => { state.voiceState = "listening"; setVoiceStatus("lst", "Listening…"); startWaveform(); };
  recognition.onresult  = async e => {
    const text = e.results[0][0].transcript;
    const input = document.getElementById("desc-input");
    if (input) input.value = text;
    state.voiceState = "classifying";
    setVoiceStatus("prc", "Classifying…");
    const result = await aiClassify(text);
    activateEmergency(result);
    state.voiceState = "done";
    setVoiceStatus("idle", "Done! ✓");
    stopWaveform();
    renderResultSection();
    renderServicesSection();
    setTimeout(() => setVoiceStatus("idle", "Click to speak"), 2500);
  };
  recognition.onerror   = () => { state.voiceState = "error"; setVoiceStatus("error", "Error — try again"); stopWaveform(); };
  recognition.onend     = () => { if (state.voiceState === "listening") { state.voiceState = "idle"; setVoiceStatus("idle", "Click to speak"); stopWaveform(); } };
  recognition.start();
}

function setVoiceStatus(cls, text) {
  const btn  = document.getElementById("vc-btn");
  const stat = document.getElementById("vc-status");
  if (btn)  { btn.className = `vcbtn${cls === "lst" ? " lst" : cls === "prc" ? " prc" : ""}`; }
  if (stat) stat.textContent = text;
  const rings = [document.getElementById("vc-ring1"), document.getElementById("vc-ring2")];
  rings.forEach(r => { if (r) r.className = `vcring${r.id.includes("2") ? " r2" : ""}${cls === "lst" ? " lst" : ""}`; });
}

function startWaveform() {
  [0,1,2,3,4,5,6].forEach(i => {
    const bar = document.getElementById(`wvb-${i}`);
    if (bar) { bar.classList.add("on"); bar.style.animationDelay = `${i * 0.06}s`; }
  });
}
function stopWaveform() {
  [0,1,2,3,4,5,6].forEach(i => {
    const bar = document.getElementById(`wvb-${i}`);
    if (bar) bar.classList.remove("on");
  });
}

function buildMapSection() {
  const card = div({ className: "card" });
  card.appendChild(makeLbl("LIVE LOCATION MAP"));
  const mapwrap = div({ className: "mapwrap", id:"mapwrap" });
  const mapDiv  = div({ style:{ width:"100%", height:"100%" }, id:"leaflet-map" });
  mapwrap.appendChild(mapDiv);

  // OSM attribution overlay
  const attrib = div({ className:"tag tgr", style:{ position:"absolute", bottom:"10px", right:"10px", zIndex:"10", fontSize:"9px" } }, "OpenStreetMap — allow location for real view");
  mapwrap.appendChild(attrib);

  card.appendChild(mapwrap);

  // Geo status
  const geoStatus = div({ id:"geo-status", style:{ marginTop:"8px", fontSize:"11px", color:"#34507a" } });
  card.appendChild(geoStatus);
  return card;
}

function initLeafletMap() {
  const el = document.getElementById("leaflet-map");
  if (!el || state.leafletMap) return;
  if (typeof L === "undefined") { initFallbackMap(); return; }

  const lat = state.geo.lat || 13.0827;
  const lng = state.geo.lng || 80.2707;

  state.leafletMap = L.map("leaflet-map", { zoomControl: true, attributionControl: false }).setView([lat, lng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(state.leafletMap);

  const userIcon = L.divIcon({ className:"", html:`<div style="width:16px;height:16px;background:#e8112b;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(232,17,43,.7)"></div>`, iconSize:[16,16], iconAnchor:[8,8] });
  state.leafletUserMarker = L.marker([lat, lng], { icon: userIcon }).addTo(state.leafletMap).bindPopup("📍 Your Location");

  addMapServiceMarkers();
}

function updateMapUserMarker() {
  if (!state.leafletMap || !state.geo.lat) return;
  if (state.leafletUserMarker) {
    state.leafletUserMarker.setLatLng([state.geo.lat, state.geo.lng]);
    state.leafletMap.setView([state.geo.lat, state.geo.lng], 14);
  }
  addMapServiceMarkers();
}

function addMapServiceMarkers() {
  if (!state.leafletMap) return;
  state.leafletSvcMarkers.forEach(m => m.remove());
  state.leafletSvcMarkers = [];
  const svcs = state.services.length ? state.services : FALLBACK_SERVICES;
  svcs.slice(0,6).forEach(svc => {
    if (!svc.lat || !svc.lng) return;
    const color = svc.type === "hospital" ? "#00b4ff" : svc.type === "police" ? "#00e5ff" : "#ff9100";
    const icon  = svc.type === "hospital" ? "🏥" : svc.type === "police" ? "🚓" : "🚒";
    const divIc = L.divIcon({ className:"", html:`<div style="font-size:16px;filter:drop-shadow(0 0 4px ${color})">${icon}</div>`, iconSize:[24,24], iconAnchor:[12,12] });
    const marker = L.marker([svc.lat, svc.lng], { icon: divIc }).addTo(state.leafletMap).bindPopup(`${icon} ${svc.name}<br>${svc.distLabel} · ${svc.eta}`);
    state.leafletSvcMarkers.push(marker);
  });
}

function initFallbackMap() {
  const el = document.getElementById("leaflet-map");
  if (!el) return;
  el.id = "fallback-map";
  el.innerHTML = `
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(5,12,28,.98),rgba(10,20,50,.9));">
      <div style="position:absolute;inset:0;" class="mapgrid"></div>
      ${[60,100,140,190].map(r => `<div style="position:absolute;left:50%;top:50%;width:${r*2}px;height:${r*2}px;margin-left:-${r}px;margin-top:-${r}px;border-radius:50%;border:1px solid rgba(0,100,255,.065);"></div>`).join("")}
      <div style="position:absolute;left:50%;top:50%;width:160px;height:160px;margin-left:-80px;margin-top:-80px;border-radius:50%;overflow:hidden;pointer-events:none;"><div class="rdr"></div></div>
      <div style="position:absolute;bottom:10px;left:10px;" class="tag tgr" style="font-size:9px;">OSM Map — allow location for live view</div>
    </div>`;
}

function renderGeoStatus() {
  const el = document.getElementById("geo-status");
  if (!el) return;
  if (state.geo.loading) {
    el.textContent = "📡 Acquiring location…";
    el.style.color = "#ff9426";
  } else if (state.geo.error) {
    el.textContent = `⚠️ ${state.geo.error}`;
    el.style.color = "#ff3f62";
  } else if (state.geo.lat) {
    el.textContent = `📍 ${state.geo.lat.toFixed(4)}°N, ${state.geo.lng.toFixed(4)}°E · ±${state.geo.accuracy}m accuracy`;
    el.style.color = "#24d480";
  } else {
    el.textContent = "Click map area to get location";
    el.style.color = "#34507a";
  }
}

function buildResultSection() {
  const wrap = div({ id:"result-section" });
  renderResultSection(wrap);
  return wrap;
}

function renderResultSection(container) {
  const el = container || document.getElementById("result-section");
  if (!el) return;
  el.innerHTML = "";

  if (!state.emergency) {
    const placeholder = div({ className:"card", style:{ textAlign:"center", padding:"32px 20px" } });
    placeholder.appendChild(div({ style:{ fontSize:"32px", marginBottom:"12px" } }, "🤖"));
    placeholder.appendChild(div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"16px", color:"#34507a" } }, "AI CLASSIFICATION"));
    placeholder.appendChild(div({ style:{ fontSize:"12px", color:"#1c2d4a", marginTop:"6px" } }, "Hold SOS or describe your emergency"));
    el.appendChild(placeholder);
    return;
  }

  const em  = state.emergency;
  const risk = computeRiskScore(em.type || "sos", em.severity, em.confidence);

  const card = div({ className:"result-card" });

  // Header
  const hdr = div({ style:{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" } });
  hdr.appendChild(span({ style:{ fontSize:"28px" } }, em.icon));
  const hdrtxt = div();
  hdrtxt.appendChild(div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"18px", fontWeight:"700", color: em.color } }, em.label));
  hdrtxt.appendChild(div({ className:"lbl", style:{ marginBottom:"0" } }, em.category));
  hdr.appendChild(hdrtxt);
  if (state.incidentId) {
    hdr.appendChild(div({ style:{ marginLeft:"auto" } }, makeTag("tr", makeDot("l"), " LIVE")));
  }
  card.appendChild(hdr);

  // Incident ID
  if (state.incidentId) {
    card.appendChild(div({ style:{ fontFamily:"'Space Mono',monospace", fontSize:"10px", color:"#34507a", marginBottom:"12px" } }, state.incidentId));
  }

  // Metrics row
  const metrics = div({ style:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px", marginBottom:"14px" } });
  [
    { l:"SEVERITY",  v: em.severity + "/10", bar: em.severity * 10,  color:"#e8112b" },
    { l:"CONFIDENCE",v: em.confidence + "%", bar: em.confidence,     color:"#4096ff" },
    { l:"RISK SCORE",v: risk + "%",          bar: risk,              color:"#ff9426" },
  ].forEach(m => {
    const mc = div({ className:"card", style:{ padding:"10px" } });
    mc.appendChild(div({ className:"lbl" }, m.l));
    mc.appendChild(div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"20px", fontWeight:"700", color:m.color, marginBottom:"6px" } }, m.v));
    mc.appendChild(makeBar(m.bar, m.color));
    metrics.appendChild(mc);
  });
  card.appendChild(metrics);

  // Protocol
  card.appendChild(div({ className:"lbl" }, "PROTOCOL"));
  card.appendChild(div({ style:{ fontSize:"12px", color:"#8aabcc", lineHeight:"1.7", marginBottom:"10px", background:"rgba(0,100,255,.05)", padding:"10px", borderRadius:"8px", border:"1px solid rgba(0,100,255,.1)" } }, em.protocol));

  // First Aid
  card.appendChild(div({ className:"lbl" }, "FIRST AID"));
  card.appendChild(div({ style:{ fontSize:"12px", color:"#8aabcc", lineHeight:"1.7", marginBottom:"12px", background:"rgba(0,200,110,.04)", padding:"10px", borderRadius:"8px", border:"1px solid rgba(0,200,110,.1)" } }, em.firstAid));

  // Responders
  card.appendChild(div({ className:"lbl" }, "DISPATCHED RESPONDERS"));
  const respList = div({ style:{ display:"flex", flexDirection:"column", gap:"6px" } });
  (em.responders || []).forEach((r, i) => {
    const row = div({ style:{ display:"flex", alignItems:"center", gap:"8px", padding:"6px 10px", background:"rgba(0,200,110,.05)", borderRadius:"7px", border:"1px solid rgba(0,200,110,.1)", animation:`si .3s ease ${i*.1}s both` } });
    row.appendChild(span({ style:{ fontSize:"11px" } }, "🚑"));
    row.appendChild(span({ style:{ fontSize:"11px", color:"#24d480" } }, r));
    row.appendChild(div({ style:{ marginLeft:"auto" } }, makeTag("tg", "Dispatched")));
    respList.appendChild(row);
  });
  card.appendChild(respList);

  el.appendChild(card);
}

function buildServicesSection() {
  const wrap = div({ id:"services-section" });
  renderServicesSection(wrap);
  return wrap;
}

function renderServicesSection(container) {
  const el = container || document.getElementById("services-section");
  if (!el) return;
  el.innerHTML = "";

  const card = div({ className:"card" });
  card.appendChild(makeLbl("NEAREST SERVICES"));

  const svcs = state.services.length ? state.services : FALLBACK_SERVICES;
  svcs.slice(0,5).forEach((svc, i) => {
    const svcCard = div({ className:"svccard", style:{ animation:`si .25s ease ${i*.06}s both` } });

    const left = div({ style:{ display:"flex", alignItems:"center", gap:"10px", flex:"1", minWidth:"0" } });
    const icon = svc.type === "hospital" ? "🏥" : svc.type === "police" ? "🚓" : "🚒";
    left.appendChild(span({ style:{ fontSize:"18px", flexShrink:"0" } }, icon));
    const info = div({ style:{ minWidth:"0" } });
    info.appendChild(div({ style:{ fontSize:"13px", fontWeight:"600", color:"#dde6f4", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" } }, svc.name));
    info.appendChild(div({ style:{ fontSize:"10px", color:"#34507a" } }, `${svc.distLabel} · ETA: ${svc.eta}`));
    left.appendChild(info);
    svcCard.appendChild(left);

    const right = div({ style:{ display:"flex", alignItems:"center", gap:"8px", flexShrink:"0" } });
    right.appendChild(makeTag(state.emergency ? "tg" : "tb", state.emergency ? "Dispatched" : "Available"));
    right.appendChild(h("a", { href:`tel:${svc.phone}`, style:{ fontSize:"10px", color:"#4096ff", textDecoration:"none" } }, `📞 ${svc.phone}`));
    svcCard.appendChild(right);

    card.appendChild(svcCard);
  });

  if (!state.geo.lat) {
    card.appendChild(div({ style:{ fontSize:"11px", color:"#34507a", marginTop:"8px", padding:"8px", background:"rgba(0,0,0,.2)", borderRadius:"8px" } }, "📍 Enable location for real nearby services via OpenStreetMap"));
  }

  el.appendChild(card);
}

function renderServicesPanel() { renderServicesSection(); }

// ── COMMAND CENTER ───────────────────────────────────────────────
function renderCommand() {
  const el = document.getElementById("page-command");
  el.innerHTML = "";

  const wrap = div({ className:"command-wrap" });

  // Header
  const hdr = div({ style:{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"10px" } });
  const hdrtxt = div();
  hdrtxt.appendChild(makeLbl("MISSION CONTROL"));
  hdrtxt.appendChild(h("h1", { style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"24px", fontWeight:"700" } }, "Command Center"));
  hdr.appendChild(hdrtxt);
  if (state.emergency) {
    const lt = makeTag("tr");
    lt.style.animation = "bk 1s infinite";
    lt.appendChild(makeDot("l")); lt.appendChild(document.createTextNode(` ${state.incidentId} LIVE`));
    hdr.appendChild(lt);
  }
  wrap.appendChild(hdr);

  // Live counters
  const countersGrid = div({ className:"grid-4", style:{ marginBottom:"18px" } });
  const counters = [
    { l:"TOTAL RESPONSES", v:12847, c:"#4096ff", i:"🚨", s:"All time" },
    { l:"LIVES SAVED",     v:3291,  c:"#24d480", i:"❤️",  s:"All time" },
    { l:"AVG RESPONSE",    v:47,    c:"#ff9426", i:"⚡",  s:"Platform avg", u:"sec" },
    { l:"CITIES ACTIVE",   v:28,    c:"#b85aff", i:"🌆",  s:"India coverage" },
  ];
  counters.forEach((ct, i) => {
    const m = div({ className:"metric", style:{ animation:`cp .4s ease ${i*.08}s both` } });
    m.appendChild(div({ className:"lbl" }, ct.l));
    const valRow = div({ style:{ display:"flex", alignItems:"baseline", gap:"5px" } });
    const numEl  = h("div", { style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"28px", fontWeight:"700", color:ct.c } }, "0");
    valRow.appendChild(numEl);
    if (ct.u) valRow.appendChild(span({ style:{ fontSize:"11px", color:"#34507a" } }, ct.u));
    valRow.appendChild(span({ style:{ fontSize:"18px", marginLeft:"auto" } }, ct.i));
    m.appendChild(valRow);
    m.appendChild(div({ style:{ fontSize:"10px", color:"#34507a", marginTop:"2px" } }, ct.s));
    countersGrid.appendChild(m);
    setTimeout(() => animateCount(numEl, ct.v), 100 + i * 80);
  });
  wrap.appendChild(countersGrid);

  // Heatmap + System status
  const row1 = div({ className:"grid-3", style:{ marginBottom:"18px" } });

  // Heatmap (spans 2 cols)
  const heatCard = div({ className:"card", style:{ gridColumn:"1/3" } });
  heatCard.appendChild(makeLbl("INCIDENT HEATMAP — CHENNAI METRO"));
  const heatmap = div({ style:{ position:"relative", height:"180px", background:"rgba(0,0,0,.3)", borderRadius:"10px", overflow:"hidden" } });
  heatmap.appendChild(div({ className:"scanline" }));
  HEAT_DOTS.forEach(d => {
    const dot = div({ className:"heatdot", style:{ left:d.x, top:d.y, width:`${d.r*2}px`, height:`${d.r*2}px`, background:d.c, animationDelay:d.d, marginLeft:`-${d.r}px`, marginTop:`-${d.r}px` } });
    heatmap.appendChild(dot);
  });
  heatmap.appendChild(div({ style:{ position:"absolute", inset:"0", background:"linear-gradient(135deg,rgba(0,80,200,.08),rgba(0,0,0,.4))" } }));
  const legendRow = div({ style:{ position:"absolute", bottom:"8px", left:"8px", display:"flex", gap:"8px" } });
  legendRow.appendChild(makeTag("tr", "● High Risk"));
  legendRow.appendChild(makeTag("to", "● Medium"));
  legendRow.appendChild(makeTag("tg", "● Low"));
  heatmap.appendChild(legendRow);
  if (state.emergency) {
    const lt = div({ style:{ position:"absolute", top:"8px", right:"8px" } });
    lt.appendChild(makeTag("tr", makeDot("l"), " LIVE INCIDENT"));
    heatmap.appendChild(lt);
  }
  heatCard.appendChild(heatmap);
  row1.appendChild(heatCard);

  // System status
  const sysCard = div({ className:"card" });
  sysCard.appendChild(makeLbl("SYSTEM STATUS"));
  const sysItems = [
    { label:"AI Engine",     status:"Online",  color:"#24d480", dot:"r" },
    { label:"GPS Tracking",  status:"Active",  color:"#24d480", dot:"r" },
    { label:"Dispatch API",  status:"Ready",   color:"#24d480", dot:"r" },
    { label:"Map Service",   status:"Online",  color:"#24d480", dot:"r" },
    { label:"Voice Engine",  status:"Standby", color:"#ffc400", dot:"i" },
    { label:"Alert Gateway", status:"Online",  color:"#24d480", dot:"r" },
  ];
  const sysList = div({ style:{ display:"flex", flexDirection:"column", gap:"8px" } });
  sysItems.forEach(s => {
    const row = div({ style:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:"1px solid rgba(0,100,255,.06)" } });
    row.appendChild(span({ style:{ fontSize:"11px", color:"#8aabcc" } }, s.label));
    const sr = div({ style:{ display:"flex", alignItems:"center", gap:"5px" } });
    sr.appendChild(makeDot(s.dot));
    sr.appendChild(span({ style:{ fontSize:"10px", color:s.color } }, s.status));
    row.appendChild(sr);
    sysList.appendChild(row);
  });
  sysCard.appendChild(sysList);
  row1.appendChild(sysCard);
  wrap.appendChild(row1);

  // Radar + Active Units
  const row2 = div({ className:"grid-2", style:{ marginBottom:"18px" } });

  // Radar
  const radarCard = div({ className:"card" });
  radarCard.appendChild(makeLbl("RESPONDER RADAR"));
  const radarWrap = div({ style:{ position:"relative", width:"100%", paddingBottom:"60%", background:"rgba(0,0,0,.25)", borderRadius:"10px", overflow:"hidden" } });
  const radarInner = div({ style:{ position:"absolute", inset:"0", display:"flex", alignItems:"center", justifyContent:"center" } });
  [90,65,40].forEach(r => {
    radarInner.appendChild(div({ style:{ position:"absolute", width:`${r*2}px`, height:`${r*2}px`, border:"1px solid rgba(0,200,110,.12)", borderRadius:"50%" } }));
  });
  const radarRdr = div({ style:{ position:"absolute", width:"180px", height:"180px", borderRadius:"50%", overflow:"hidden" } });
  radarRdr.appendChild(div({ className:"rdr" }));
  radarInner.appendChild(radarRdr);
  // Center dot
  radarInner.appendChild(div({ style:{ width:"10px", height:"10px", background:"#e8112b", borderRadius:"50%", boxShadow:"0 0 8px rgba(232,17,43,.7)", zIndex:"5" } }));
  // Service dots
  const svcs = state.services.length ? state.services : FALLBACK_SERVICES;
  svcs.slice(0,6).forEach((s, i) => {
    const a = (i * 60 - 30) * Math.PI / 180, r = 30 + i * 12;
    const cx = Math.cos(a) * r, cy = Math.sin(a) * r;
    const c = s.type === "hospital" ? "#00b4ff" : s.type === "police" ? "#00e5ff" : "#ff9100";
    radarInner.appendChild(div({ style:{ position:"absolute", width:"8px", height:"8px", background:c, borderRadius:"50%", left:`calc(50% + ${cx}px)`, top:`calc(50% + ${cy}px)`, boxShadow:`0 0 5px ${c}` } }));
  });
  radarWrap.appendChild(radarInner);
  radarCard.appendChild(radarWrap);
  const legend = div({ style:{ display:"flex", gap:"8px", marginTop:"10px", justifyContent:"center" } });
  [{ c:"#00b4ff", l:"Hospital"}, {c:"#00e5ff",l:"Police"},{c:"#ff9100",l:"Fire"}].forEach(({ c, l }) => {
    const li = div({ style:{ display:"flex", alignItems:"center", gap:"4px", fontSize:"10px", color:"#6b87ae" } });
    li.appendChild(div({ style:{ width:"7px", height:"7px", background:c, borderRadius:"50%" } }));
    li.appendChild(document.createTextNode(l));
    legend.appendChild(li);
  });
  radarCard.appendChild(legend);
  row2.appendChild(radarCard);

  // Active units
  const unitsCard = div({ className:"card" });
  const unitHdr   = div({ style:{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"10px" } });
  unitHdr.appendChild(makeLbl("ACTIVE UNITS"));
  if (state.emergency) unitHdr.appendChild(makeTag("tg", "3/3 Dispatched"));
  unitsCard.appendChild(unitHdr);
  const unitsWrap = div({ style:{ display:"flex", flexDirection:"column", gap:"7px" } });
  svcs.slice(0,5).forEach((s, i) => {
    const rc = div({ className:"respcard" });
    const row = div({ style:{ display:"flex", alignItems:"center", gap:"9px" } });
    row.appendChild(span({ style:{ fontSize:"15px" } }, s.type==="hospital" ? "🏥" : s.type==="police" ? "🚓" : "🚒"));
    const info = div({ style:{ flex:"1", minWidth:"0" } });
    info.appendChild(div({ style:{ fontSize:"12px", fontWeight:"600", color:"#dde6f4" } }, s.name));
    info.appendChild(div({ style:{ fontSize:"10px", color:"#34507a" } }, `${s.distLabel} · ${s.eta}`));
    row.appendChild(info);
    row.appendChild(makeTag(state.emergency ? "tg" : "tb", state.emergency ? "Dispatched" : "Available"));
    rc.appendChild(row);
    unitsWrap.appendChild(rc);
  });
  unitsCard.appendChild(unitsWrap);
  row2.appendChild(unitsCard);
  wrap.appendChild(row2);

  // AI Probability matrix
  const matrixCard = div({ className:"card" });
  matrixCard.appendChild(makeLbl("AI CLASSIFICATION ENGINE — PROBABILITY MATRIX"));
  const matrixGrid = div({ className:"grid-4" });
  const matrixData = [
    { label:"Medical",  val: state.emergency?.category==="MEDICAL"?94:12,       color:"#F44336" },
    { label:"Fire",     val: state.emergency?.category==="FIRE"?91:9,           color:"#FF5722" },
    { label:"Crime",    val: state.emergency?.category==="CRIME"?88:14,         color:"#9C27B0" },
    { label:"Accident", val: state.emergency?.category==="ACCIDENT"?85:8,       color:"#FF9800" },
    { label:"Disaster", val: state.emergency?.category==="DISASTER"?89:6,       color:"#2196F3" },
    { label:"Women",    val: state.emergency?.category==="WOMENS_SAFETY"?93:5,  color:"#E91E63" },
    { label:"Child",    val: state.emergency?.category==="CHILD_SAFETY"?96:4,   color:"#FF5722" },
    { label:"SOS",      val: state.emergency?.category==="SOS"?82:7,            color:"#607D8B" },
  ];
  matrixData.forEach(p => {
    const mc = div();
    const prow = div({ style:{ display:"flex", justifyContent:"space-between", marginBottom:"4px" } });
    prow.appendChild(span({ style:{ fontSize:"11px", color:"#8aabcc" } }, p.label));
    prow.appendChild(span({ style:{ fontFamily:"'Space Mono',monospace", fontSize:"10px", color: p.val > 50 ? p.color : "#34507a" } }, `${p.val}%`));
    mc.appendChild(prow);
    mc.appendChild(makeBar(p.val, p.val > 50 ? p.color : "#162040"));
    matrixGrid.appendChild(mc);
  });
  matrixCard.appendChild(matrixGrid);
  wrap.appendChild(matrixCard);

  el.appendChild(wrap);
}

// ── SAFETY PAGE ──────────────────────────────────────────────────
function renderSafety() {
  const el = document.getElementById("page-safety");
  el.innerHTML = "";

  const wrap = div({ style:{ maxWidth:"900px", margin:"0 auto", padding:"70px 18px 36px" } });
  wrap.appendChild(makeLbl("SPECIAL SAFETY MODES"));
  wrap.appendChild(h("h1", { style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"22px", fontWeight:"700", marginBottom:"20px" } }, "Protection Protocols"));

  const grid = div({ className:"grid-2" });
  grid.appendChild(buildWomensSafety());
  grid.appendChild(buildChildSafety());
  wrap.appendChild(grid);

  // Helplines
  const helpCard = div({ className:"card", style:{ marginTop:"18px" } });
  helpCard.appendChild(makeLbl("EMERGENCY HELPLINES — INDIA"));
  const hlGrid = div({ style:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"10px", marginTop:"6px" } });
  [
    { n:"Police",           num:"100", c:"#4096ff" },
    { n:"Ambulance",        num:"108", c:"#e8112b" },
    { n:"Fire",             num:"101", c:"#FF5722" },
    { n:"Women's Helpline", num:"181", c:"#E91E63" },
    { n:"Child Helpline",   num:"1098",c:"#ff9426" },
    { n:"Emergency",        num:"112", c:"#24d480" },
  ].forEach(hl => {
    const card = div({ className:"card", style:{ padding:"12px", textAlign:"center" } });
    card.appendChild(h("a", { href:`tel:${hl.num}`, style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"24px", fontWeight:"700", color:hl.c, textDecoration:"none", display:"block" } }, hl.num));
    card.appendChild(div({ style:{ fontSize:"11px", color:"#6b87ae" } }, hl.n));
    hlGrid.appendChild(card);
  });
  helpCard.appendChild(hlGrid);
  wrap.appendChild(helpCard);

  el.appendChild(wrap);
}

function buildWomensSafety() {
  const panel = div({ className:"safepanel", id:"womens-panel" });
  renderWomensPanel(panel);
  return panel;
}

function renderWomensPanel(container) {
  const el = container || document.getElementById("womens-panel");
  if (!el) return;
  el.innerHTML = "";

  const hdr = div({ style:{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"18px" } });
  hdr.appendChild(span({ style:{ fontSize:"28px" } }, "🛡️"));
  const hdrtxt = div();
  hdrtxt.appendChild(div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"18px", fontWeight:"700", color:"#E91E63", letterSpacing:".8px" } }, "WOMEN'S SAFETY MODE"));
  hdrtxt.appendChild(div({ className:"lbl", style:{ marginBottom:"0" } }, "RAPID RESPONSE TOOLS"));
  hdr.appendChild(hdrtxt);
  el.appendChild(hdr);

  // Fake call UI if active
  if (state.fakeCallActive) {
    const fc = div({ className:"fakecall" });
    fc.appendChild(div({ style:{ fontSize:"36px", marginBottom:"8px" } }, "📱"));
    fc.appendChild(div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"22px", fontWeight:"700", color:"#24d480", marginBottom:"4px" } }, "Incoming Call"));
    fc.appendChild(div({ style:{ fontSize:"14px", color:"#8aabcc", marginBottom:"4px" } }, "Mom — Mobile"));
    const timerEl = div({ id:"fakecall-timer", style:{ fontFamily:"'Space Mono',monospace", fontSize:"13px", color:"#24d480", marginBottom:"14px" } });
    timerEl.textContent = formatCallTime(state.fakeCallTick);
    fc.appendChild(timerEl);
    const callBtns = div({ style:{ display:"flex", gap:"12px", justifyContent:"center" } });
    const endBtn = btn({ className:"bg", style:{ padding:"10px 18px", background:"rgba(232,17,43,.2)", borderColor:"rgba(232,17,43,.3)", color:"#ff3f62" }, onclick: stopFakeCall }, "End");
    callBtns.appendChild(endBtn);
    callBtns.appendChild(div({ style:{ padding:"10px 18px", borderRadius:"9px", background:"rgba(0,200,110,.2)", border:"1px solid rgba(0,200,110,.3)", color:"#24d480", fontSize:"13px" } }, "Connected"));
    fc.appendChild(callBtns);
    el.appendChild(fc);
  }

  const actGrid = div({ style:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" } });
  const rapidSos = btn({ className:"br", style:{ padding:"12px", flexDirection:"column", gap:"4px", height:"auto" }, onclick: () => { activateEmergency(EMERGENCY_DB.women); navigate("dashboard"); } });
  rapidSos.innerHTML = `<span style="font-size:20px">🆘</span><span>Rapid SOS</span>`;

  const fakeCall = btn({ className:"bg", style:{ padding:"12px", flexDirection:"column", gap:"4px", height:"auto", color:"#24d480", borderColor:"rgba(0,200,110,.25)" }, onclick: startFakeCall });
  fakeCall.innerHTML = `<span style="font-size:20px">📞</span><span style="font-size:12px">Fake Call</span>`;

  const alertContacts = btn({ className:"bg", style:{ padding:"12px", flexDirection:"column", gap:"4px", height:"auto" } });
  alertContacts.innerHTML = `<span style="font-size:20px">👥</span><span style="font-size:12px">Alert Contacts</span>`;

  const shareLocation = btn({ className:"bg", style:{ padding:"12px", flexDirection:"column", gap:"4px", height:"auto" }, onclick: () => { if (!state.geo.lat) startGeo(); alert("Location sharing activated. Link: https://lifelink.app/share/" + makeIncidentId()); } });
  shareLocation.innerHTML = `<span style="font-size:20px">📍</span><span style="font-size:12px">Share Location</span>`;

  actGrid.appendChild(rapidSos); actGrid.appendChild(fakeCall); actGrid.appendChild(alertContacts); actGrid.appendChild(shareLocation);
  el.appendChild(actGrid);

  el.appendChild(div({ style:{ marginTop:"12px", fontSize:"11px", color:"#6b87ae", padding:"8px 10px", background:"rgba(233,30,99,.06)", borderRadius:"8px", border:"1px solid rgba(233,30,99,.12)" } }, "📢 Women's Helpline: 181 · Police: 100 · Emergency: 112"));
}

function startFakeCall() {
  state.fakeCallActive = true;
  state.fakeCallTick = 0;
  clearInterval(state.fakeCallTimer);
  state.fakeCallTimer = setInterval(() => {
    state.fakeCallTick++;
    const el = document.getElementById("fakecall-timer");
    if (el) el.textContent = formatCallTime(state.fakeCallTick);
    if (state.fakeCallTick >= 60) stopFakeCall();
  }, 1000);
  renderWomensPanel();
}

function stopFakeCall() {
  clearInterval(state.fakeCallTimer);
  state.fakeCallActive = false;
  state.fakeCallTick = 0;
  renderWomensPanel();
}

function formatCallTime(t) {
  return `${String(Math.floor(t / 60)).padStart(2,"0")}:${String(t % 60).padStart(2,"0")}`;
}

function buildChildSafety() {
  const panel = div({ className:"childpanel", id:"child-panel" });
  renderChildPanel(panel);
  return panel;
}

function renderChildPanel(container) {
  const el = container || document.getElementById("child-panel");
  if (!el) return;
  el.innerHTML = "";

  const hdr = div({ style:{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"18px" } });
  hdr.appendChild(span({ style:{ fontSize:"28px" } }, "👶"));
  const hdrtxt = div();
  hdrtxt.appendChild(div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"18px", fontWeight:"700", color:"#FF5722", letterSpacing:".8px" } }, "CHILD SAFETY ALERT"));
  hdrtxt.appendChild(div({ className:"lbl", style:{ marginBottom:"0" } }, "MISSING CHILD PROTOCOL"));
  hdr.appendChild(hdrtxt);
  el.appendChild(hdr);

  if (state.childSubmitted) {
    const done = div({ style:{ textAlign:"center", padding:"24px 0" } });
    done.appendChild(div({ style:{ fontSize:"36px", marginBottom:"10px" } }, "✅"));
    done.appendChild(div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"18px", color:"#24d480", marginBottom:"6px" } }, "ALERT BROADCAST SENT"));
    done.appendChild(div({ style:{ fontSize:"12px", color:"#6b87ae" } }, "Child Welfare Officers and Police notified. Keep your phone active."));
    el.appendChild(done);
  } else {
    const form = div({ style:{ display:"flex", flexDirection:"column", gap:"9px" } });
    const nameIn  = h("input",    { className:"inp", placeholder:"Child's name",          type:"text",   maxlength:"50"  });
    const ageIn   = h("input",    { className:"inp", placeholder:"Age",                   type:"number", min:"0", max:"18" });
    const locIn   = h("input",    { className:"inp", placeholder:"Last seen location",    type:"text",   maxlength:"100" });
    const descIn  = h("textarea", { className:"inp", placeholder:"Description (clothing, features…)", rows:"2", maxlength:"300" });
    form.appendChild(nameIn); form.appendChild(ageIn); form.appendChild(locIn); form.appendChild(descIn);

    const broadcastBtn = btn({ className:"br", onclick: () => {
      if (!nameIn.value.trim()) { nameIn.focus(); return; }
      state.childSubmitted = true;
      activateEmergency(EMERGENCY_DB.child);
      renderChildPanel();
    } }, "📢 Broadcast Missing Child Alert");
    form.appendChild(broadcastBtn);

    const sosChildBtn = btn({ className:"bg", style:{ color:"#ff9426", borderColor:"rgba(255,150,0,.25)" }, onclick: () => { activateEmergency(EMERGENCY_DB.child); navigate("dashboard"); } }, "🆘 Immediate Emergency SOS");
    form.appendChild(sosChildBtn);
    el.appendChild(form);
  }

  el.appendChild(div({ style:{ marginTop:"12px", fontSize:"11px", color:"#6b87ae", padding:"8px 10px", background:"rgba(255,87,34,.06)", borderRadius:"8px", border:"1px solid rgba(255,87,34,.12)" } }, "📞 Child Helpline: 1098 · Police: 100 · Emergency: 112"));
}

// ── HISTORY PAGE ─────────────────────────────────────────────────
function renderHistory() {
  const el = document.getElementById("page-history");
  el.innerHTML = "";

  const wrap = div({ style:{ maxWidth:"900px", margin:"0 auto", padding:"70px 18px 36px" } });
  wrap.appendChild(makeLbl("INCIDENT LOG"));
  wrap.appendChild(h("h1", { style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"22px", fontWeight:"700", marginBottom:"20px" } }, "Response History"));

  const summaryGrid = div({ className:"grid-4", style:{ marginBottom:"18px" } });
  [
    { l:"TOTAL INCIDENTS",  v: HISTORY_DATA.length, c:"#4096ff" },
    { l:"CRITICAL (9-10)",  v: HISTORY_DATA.filter(h => h.severity >= 9).length, c:"#e8112b" },
    { l:"RESOLVED",         v: HISTORY_DATA.filter(h => h.status === "Resolved").length, c:"#24d480" },
    { l:"ACTIVE",           v: HISTORY_DATA.filter(h => h.status === "Active").length,   c:"#ff9426" },
  ].forEach(s => {
    const m = div({ className:"metric" });
    m.appendChild(div({ className:"lbl" }, s.l));
    m.appendChild(div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"26px", fontWeight:"700", color:s.c } }, String(s.v)));
    summaryGrid.appendChild(m);
  });
  wrap.appendChild(summaryGrid);

  const listCard = div({ className:"card" });
  HISTORY_DATA.forEach((item, i) => {
    const em       = Object.values(EMERGENCY_DB).find(e => e.category === item.category) || EMERGENCY_DB.sos;
    const tagCls   = categoryTag(item.category);
    const row      = div({ className:"histrow", style:{ animation:`si .3s ease ${i*.06}s both` } });

    // Left
    const left = div({ style:{ display:"flex", alignItems:"center", gap:"12px", flex:"1", minWidth:"0" } });
    left.appendChild(span({ style:{ fontSize:"20px", flexShrink:"0" } }, em.icon));
    const info = div({ style:{ minWidth:"0" } });
    info.appendChild(div({ style:{ fontSize:"13px", fontWeight:"600", color:"#dde6f4" } }, item.type));
    info.appendChild(div({ style:{ fontSize:"10px", color:"#34507a" } }, `${item.time} · ${item.location}`));
    info.appendChild(div({ style:{ fontFamily:"'Space Mono',monospace", fontSize:"9px", color:"#1c2d4a", marginTop:"2px" } }, item.id));
    left.appendChild(info);
    row.appendChild(left);

    // Right
    const right = div({ style:{ display:"flex", alignItems:"center", gap:"8px", flexShrink:"0" } });
    right.appendChild(makeTag(tagCls, item.category.replace("_"," ")));
    right.appendChild(makeTag(item.status === "Active" ? "tr" : "tg", item.status));
    const sevBadge = div({ style:{ fontFamily:"'Rajdhani',sans-serif", fontSize:"13px", fontWeight:"700", color: item.severity >= 9 ? "#e8112b" : item.severity >= 7 ? "#ff9426" : "#4096ff", minWidth:"30px", textAlign:"right" } }, `${item.severity}/10`);
    right.appendChild(sevBadge);
    row.appendChild(right);

    listCard.appendChild(row);
  });
  wrap.appendChild(listCard);
  el.appendChild(wrap);
}

// ── INIT ─────────────────────────────────────────────────────────
function init() {
  // Nav button listeners
  document.querySelectorAll(".nb[data-page]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.page));
  });

  // Render initial page
  renderHome();
}

document.addEventListener("DOMContentLoaded", init);
