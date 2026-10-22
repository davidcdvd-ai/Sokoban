(() => {
"use strict";

// ---------- Datos del juego ----------

const WORLD_META = {
  granja:  { name: "La Granja",       icon: "🐄", need: 0,  grad: "linear-gradient(120deg,#55efc4,#00b894)", bg: ["#c8f7c5", "#fff3b0"], wall: "#c49a5a", wallTop: "#e0bb7b", floor: "#e9f7d9", floor2: "#dcf0c8", goal: "#e17055" },
  selva:   { name: "La Selva",        icon: "🌴", need: 12, grad: "linear-gradient(120deg,#badc58,#6ab04c)", bg: ["#a8e6cf", "#dcedc1"], wall: "#2e7d32", wallTop: "#43a047", floor: "#f1e3c6", floor2: "#e8d6b0", goal: "#d63031" },
  hielo:   { name: "El Polo Norte",   icon: "❄️", need: 28, grad: "linear-gradient(120deg,#74b9ff,#0984e3)", bg: ["#dff3ff", "#b7d8ff"], wall: "#5d9cec", wallTop: "#8fbcf5", floor: "#f4fbff", floor2: "#e3f2fd", goal: "#e84393" },
  dulces:  { name: "País de Dulces",  icon: "🍭", need: 46, grad: "linear-gradient(120deg,#fd79a8,#e84393)", bg: ["#ffd6e8", "#ffeaa7"], wall: "#e84393", wallTop: "#fd79a8", floor: "#fff0f6", floor2: "#ffe3ef", goal: "#6c5ce7" },
  espacio: { name: "El Espacio",      icon: "🚀", need: 66, grad: "linear-gradient(120deg,#6c5ce7,#2d3436)", bg: ["#a29bfe", "#2d3436"], wall: "#4834d4", wallTop: "#686de0", floor: "#2f2b54", floor2: "#38336a", goal: "#fdcb6e" },
};

const WORLDS = window.WORLDS_DATA.map(w => ({ ...w, ...WORLD_META[w.id] }));

const HEROES = [
  { id: "panda", face: "🐼", name: "Panda", price: 0 },
  { id: "gato", face: "🐱", name: "Gatito", price: 0 },
  { id: "perro", face: "🐶", name: "Perrito", price: 0 },
  { id: "zorro", face: "🦊", name: "Zorro", price: 60 },
  { id: "rana", face: "🐸", name: "Rana", price: 90 },
  { id: "pinguino", face: "🐧", name: "Pingüino", price: 120 },
  { id: "mono", face: "🐵", name: "Mono", price: 160 },
  { id: "leon", face: "🦁", name: "León", price: 220 },
  { id: "pulpo", face: "🐙", name: "Pulpo", price: 280 },
  { id: "robot", face: "🤖", name: "Robot", price: 350 },
  { id: "unicornio", face: "🦄", name: "Unicornio", price: 450 },
  { id: "dino", face: "🦖", name: "Dino", price: 600 },
  { id: "dragon", face: "🐲", name: "Dragón", price: 800 },
  { id: "astronauta", face: "🧑‍🚀", name: "Astronauta", price: 1000 },
];

const BOXES = [
  { id: "madera", icon: "", color: "#e17055", name: "Madera", price: 0 },
  { id: "regalo", icon: "🎁", color: "#fab1a0", name: "Regalo", price: 40 },
  { id: "manzana", icon: "🍎", color: "#ffeaa7", name: "Manzanas", price: 70 },
  { id: "balon", icon: "⚽", color: "#81ecec", name: "Balón", price: 100 },
  { id: "estrella", icon: "⭐", color: "#a29bfe", name: "Estrella", price: 150 },
  { id: "donut", icon: "🍩", color: "#fd79a8", name: "Donut", price: 200 },
  { id: "pizza", icon: "🍕", color: "#ffeaa7", name: "Pizza", price: 260 },
  { id: "diamante", icon: "💎", color: "#74b9ff", name: "Diamante", price: 400 },
  { id: "planeta", icon: "🪐", color: "#2d3436", name: "Planeta", price: 600 },
];

const FACES = ["🐼", "🐱", "🐶", "🦊", "🐸", "🐧", "🐵", "🦁", "🐰", "🐨", "🐯", "🦄"];

// Pegatinas del álbum: se ganan con logros.
const STICKERS = [
  { id: "primer", icon: "🎉", name: "Primer nivel" },
  { id: "tres", icon: "🌟", name: "3 estrellas" },
  { id: "diez", icon: "🔟", name: "10 niveles" },
  { id: "veinte", icon: "🏅", name: "20 niveles" },
  { id: "todos", icon: "👑", name: "¡Todos!" },
  { id: "sinatras", icon: "🧠", name: "Sin deshacer" },
  { id: "compra", icon: "🛍️", name: "Primera compra" },
  { id: "rico", icon: "💰", name: "500 monedas" },
  { id: "racha3", icon: "🔥", name: "3 días seguidos" },
  { id: "racha7", icon: "🌈", name: "7 días seguidos" },
  { id: "reto", icon: "🎯", name: "Reto del día" },
  ...WORLDS.map(w => ({ id: "cofre-" + w.id, icon: w.icon, name: w.name })),
  ...WORLDS.map(w => ({ id: "oro-" + w.id, icon: "🏆", name: w.name + " ⭐x24", gold: true })),
];

// ---------- Guardado ----------

const SAVE_KEY = "empujacajas.v1";

function loadAll() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || { profiles: [], sound: true }; }
  catch (e) { return { profiles: [], sound: true }; }
}
let store = loadAll();
store.deleted = store.deleted || {}; // id de perfil -> cuándo se borró

function saveLocal() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(store)); } catch (e) { /* sin guardado */ }
}

// Guarda y, si se indica un perfil, lo marca como cambiado para subirlo a la nube.
function save(changed = P) {
  if (changed) {
    changed.updated = Date.now();
    cloud.push(changed);
  }
  saveLocal();
}

// ---------- Guardado en la nube (solo cuando el juego se abre en claude.ai) ----------
// Cada perfil es un documento privado del usuario: así el progreso de cada niño
// se comparte entre el móvil y la tablet. Gana siempre la versión más reciente.

const cloud = (() => {
  let col = null;
  const timers = {}, chains = {};

  function write(id, body) {
    // Una escritura a la vez por documento.
    chains[id] = (chains[id] || Promise.resolve())
      .then(() => col.doc("p-" + id).set(body))
      .catch(() => { /* se reintentará en el próximo guardado */ });
  }

  function push(p) {
    if (!col) return;
    clearTimeout(timers[p.id]);
    timers[p.id] = setTimeout(() => {
      write(p.id, { id: p.id, updated: p.updated || 0, profile: JSON.parse(JSON.stringify(p)) });
    }, 1200);
  }

  function remove(id) {
    store.deleted[id] = Date.now();
    clearTimeout(timers[id]);
    if (col) write(id, { id, updated: store.deleted[id], deleted: true });
  }

  // Aplica un documento remoto si es más nuevo que lo que hay aquí.
  function merge(b) {
    if (!b || !b.id) return false;
    const i = store.profiles.findIndex(p => p.id === b.id);
    const local = store.profiles[i];
    const localTs = local ? local.updated || 0 : store.deleted[b.id] || 0;
    if ((b.updated || 0) <= localTs) return false;
    if (b.deleted) {
      if (local) store.profiles.splice(i, 1);
      if (P === local) P = null;
      store.deleted[b.id] = b.updated;
      return true;
    }
    if (!b.profile) return false;
    const fresh = JSON.parse(JSON.stringify(b.profile));
    if (local) {
      // Mantener el mismo objeto para que P siga apuntando a él.
      Object.keys(local).forEach(k => delete local[k]);
      Object.assign(local, fresh);
    } else {
      store.profiles.push(fresh);
    }
    return true;
  }

  function refreshView() {
    saveLocal();
    if (!P && !$("screen-profiles").classList.contains("active")) { renderProfiles(); show("screen-profiles"); return; }
    if ($("screen-profiles").classList.contains("active")) renderProfiles();
    else if ($("screen-map").classList.contains("active")) renderMap();
    else if ($("screen-levels").classList.contains("active")) renderLevels();
    else if ($("screen-shop").classList.contains("active")) renderShop();
    else if ($("screen-album").classList.contains("active")) renderAlbum();
  }

  async function connect() {
    if (!window.claude || typeof window.claude.use !== "function") return;
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    if (!db || !user) return;
    const uid = await user.id();
    if (!uid) return;
    const c = db.collection("data/users/" + uid);
    let remote;
    try { remote = await c.get(); } catch (e) { return; }
    col = c;

    // Primera vez: traer lo más nuevo de la nube y subir lo que solo está aquí.
    const remoteTs = {};
    let changed = false;
    remote.docs.forEach(d => {
      const b = d.data();
      if (!b || !b.id) return;
      remoteTs[b.id] = b.updated || 0;
      changed = merge(b) || changed;
    });
    store.profiles.forEach(p => { if ((p.updated || 0) > (remoteTs[p.id] || 0)) push(p); });
    Object.entries(store.deleted).forEach(([id, ts]) => {
      if (id in remoteTs && ts > remoteTs[id]) write(id, { id, updated: ts, deleted: true });
    });
    $("cloud-note").hidden = false;
    if (changed) refreshView();

    // Después: cambios en vivo desde otros dispositivos.
    c.onSnapshot(snap => {
      let any = false;
      snap.docChanges().forEach(ch => { if (ch.type !== "removed") any = merge(ch.doc.data()) || any; });
      if (any) refreshView();
    }, () => { /* sin nube: el juego sigue guardando en este dispositivo */ });
  }

  return { push, remove, connect };
})();

function newProfile(name, face) {
  return {
    id: Date.now().toString(36),
    name, face,
    coins: 20,
    stars: {},            // "mundo-nivel": estrellas
    chests: {},           // mundo: true
    heroes: ["panda", "gato", "perro"],
    boxes: ["madera"],
    hero: HEROES.find(h => h.face === face) ? HEROES.find(h => h.face === face).id : "panda",
    box: "madera",
    stickers: [],
    streak: 0,
    lastDay: "",
    dailyDone: "",
  };
}

let P = null; // perfil activo

// ---------- Utilidades ----------

const $ = id => document.getElementById(id);
const today = () => new Date().toISOString().slice(0, 10);
const key = (w, l) => w + "-" + l;

function totalStars(p = P) { return Object.values(p.stars).reduce((a, b) => a + b, 0); }
function worldStars(wid) { return WORLDS.find(w => w.id === wid).levels.reduce((a, _, i) => a + (P.stars[key(wid, i)] || 0), 0); }
function worldDone(wid) { return WORLDS.find(w => w.id === wid).levels.filter((_, i) => P.stars[key(wid, i)]).length; }
function levelsDone() { return Object.keys(P.stars).length; }
function worldUnlocked(w) { return totalStars() >= w.need; }
function levelUnlocked(wid, i) { return i === 0 || !!P.stars[key(wid, i - 1)]; }

function starThresholds(best) {
  return [Math.ceil(best * 1.2) + 2, Math.ceil(best * 1.8) + 6];
}
function starsFor(moves, best) {
  const [t3, t2] = starThresholds(best);
  return moves <= t3 ? 3 : moves <= t2 ? 2 : 1;
}

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
}

function setTheme(w) {
  const r = document.documentElement.style;
  const t = w || { bg: ["#8ec5ff", "#e0c3fc"] };
  r.setProperty("--bg1", t.bg[0]);
  r.setProperty("--bg2", t.bg[1]);
  if (w) {
    r.setProperty("--wall", w.wall);
    r.setProperty("--wall-top", w.wallTop);
    r.setProperty("--floor", w.floor);
    r.setProperty("--floor2", w.floor2);
    r.setProperty("--goal", w.goal);
  }
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

function modal(html, onReady) {
  $("modal-card").innerHTML = html;
  $("modal").classList.add("show");
  if (onReady) onReady($("modal-card"));
}
function closeModal() { $("modal").classList.remove("show"); }

function bump(id) {
  const el = $(id);
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

// ---------- Sonido (sintetizado, sin archivos) ----------

let actx = null;
function tone(freq, dur = 0.08, type = "square", vol = 0.06, delay = 0) {
  if (!store.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t = actx.currentTime + delay;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(actx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch (e) { /* sin audio */ }
}
const sfx = {
  step: () => tone(320, 0.04, "triangle", 0.04),
  push: () => tone(140, 0.09, "square", 0.05),
  bonk: () => tone(90, 0.08, "sawtooth", 0.04),
  goal: () => { tone(660, 0.08, "triangle", 0.08); tone(990, 0.12, "triangle", 0.08, 0.07); },
  undo: () => tone(260, 0.05, "triangle", 0.04),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.09, i * 0.12)),
  coin: () => { tone(988, 0.06, "square", 0.05); tone(1319, 0.15, "square", 0.05, 0.06); },
  star: i => tone(700 + i * 200, 0.15, "triangle", 0.09),
  chest: () => [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.2, "triangle", 0.08, i * 0.09)),
};

// ---------- Confeti ----------

const confetti = (() => {
  const c = $("confetti");
  const ctx = c.getContext("2d");
  let parts = [], running = false;
  const colors = ["#ff7675", "#fdcb6e", "#55efc4", "#74b9ff", "#a29bfe", "#fd79a8"];
  function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.color; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    });
    parts = parts.filter(p => p.y < c.height + 20);
    if (parts.length) requestAnimationFrame(frame); else { running = false; ctx.clearRect(0, 0, c.width, c.height); }
  }
  return (n = 140) => {
    c.width = innerWidth; c.height = innerHeight;
    for (let i = 0; i < n; i++) {
      parts.push({
        x: c.width / 2 + (Math.random() - 0.5) * 80, y: c.height / 3,
        vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 3,
        r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        s: 8 + Math.random() * 8, color: colors[i % colors.length],
      });
    }
    if (!running) { running = true; requestAnimationFrame(frame); }
  };
})();

// ---------- Perfiles ----------

function renderProfiles() {
  setTheme(null);
  const list = $("profile-list");
  list.innerHTML = "";
  store.profiles.forEach((p, idx) => {
    const d = document.createElement("div");
    d.className = "profile";
    d.innerHTML = `<div class="face">${p.face}</div><div class="name"></div>
      <div class="meta">⭐ ${totalStars(p)} · 🪙 ${p.coins}</div>
      <button class="del" aria-label="Borrar">✖</button>`;
    d.querySelector(".name").textContent = p.name;
    d.onclick = () => { P = p; store.last = p.id; saveLocal(); enterMap(); };
    d.querySelector(".del").onclick = ev => {
      ev.stopPropagation();
      modal(`<h2>¿Borrar a ${p.face}?</h2><p>Se perderá todo su progreso.</p>
        <div class="row"><button class="btn ghost" id="m-no">No</button><button class="btn" style="background:var(--accent2)" id="m-yes">Sí, borrar</button></div>`, card => {
        card.querySelector("#m-no").onclick = closeModal;
        card.querySelector("#m-yes").onclick = () => { store.profiles.splice(idx, 1); cloud.remove(p.id); saveLocal(); closeModal(); renderProfiles(); };
      });
    };
    list.appendChild(d);
  });
  if (!store.profiles.length) list.innerHTML = `<p class="subtitle small" style="grid-column:1/-1">¡Crea tu jugador para empezar!</p>`;
}

function askNewProfile() {
  let face = FACES[0];
  modal(`<h2>Nuevo jugador</h2>
    <input id="m-name" maxlength="12" placeholder="¿Cómo te llamas?" autocomplete="off">
    <p>Elige tu cara:</p>
    <div class="face-pick">${FACES.map((f, i) => `<button data-f="${f}" class="${i ? "" : "sel"}">${f}</button>`).join("")}</div>
    <div class="row"><button class="btn ghost" id="m-cancel">Cancelar</button><button class="btn green" id="m-ok">¡A jugar!</button></div>`, card => {
    const input = card.querySelector("#m-name");
    setTimeout(() => input.focus(), 50);
    card.querySelectorAll(".face-pick button").forEach(b => b.onclick = () => {
      card.querySelectorAll(".face-pick button").forEach(x => x.classList.remove("sel"));
      b.classList.add("sel"); face = b.dataset.f;
    });
    card.querySelector("#m-cancel").onclick = closeModal;
    const ok = () => {
      const name = input.value.trim();
      if (!name) { input.focus(); input.classList.add("shake"); setTimeout(() => input.classList.remove("shake"), 600); return; }
      const p = newProfile(name, face);
      // Si su cara es un personaje de la tienda, se lo regalamos.
      const h = HEROES.find(x => x.face === face);
      if (h && !p.heroes.includes(h.id)) p.heroes.push(h.id);
      store.profiles.push(p); save(p); closeModal();
      P = p; enterMap();
    };
    card.querySelector("#m-ok").onclick = ok;
    input.onkeydown = e => { if (e.key === "Enter") ok(); };
  });
}

// ---------- Logros ----------

function award(id) {
  if (P.stickers.includes(id)) return false;
  P.stickers.push(id);
  save();
  const s = STICKERS.find(x => x.id === id);
  setTimeout(() => toast(`¡Nueva pegatina! ${s.icon} ${s.name}`), 600);
  return true;
}

function checkAchievements(extra = {}) {
  const n = levelsDone();
  if (n >= 1) award("primer");
  if (n >= 10) award("diez");
  if (n >= 20) award("veinte");
  if (n >= WORLDS.reduce((a, w) => a + w.levels.length, 0)) award("todos");
  if (Object.values(P.stars).includes(3)) award("tres");
  if (P.coins >= 500) award("rico");
  if (P.streak >= 3) award("racha3");
  if (P.streak >= 7) award("racha7");
  if (extra.noUndo) award("sinatras");
  WORLDS.forEach(w => { if (worldStars(w.id) >= w.levels.length * 3) award("oro-" + w.id); });
}

function addCoins(n) {
  P.coins += n;
  save();
  ["map-coins", "shop-coins"].forEach(id => { if ($(id)) $(id).textContent = "🪙 " + P.coins; });
}

// ---------- Premio diario ----------

function dailyLogin() {
  const t = today();
  if (P.lastDay === t) return;
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  P.streak = P.lastDay === yesterday ? P.streak + 1 : 1;
  P.lastDay = t;
  const prize = 10 * Math.min(P.streak, 7);
  addCoins(prize);
  checkAchievements();
  save();
  const days = [1, 2, 3, 4, 5, 6, 7].map(d => d <= Math.min(P.streak, 7) ? "🔥" : "⚪").join("");
  modal(`<div class="big-emoji">🎁</div><h2>¡Premio diario!</h2>
    <p>Llevas <b>${P.streak}</b> ${P.streak === 1 ? "día" : "días"} seguidos jugando</p>
    <p style="font-size:1.6rem">${days}</p>
    <p class="reward">+${prize} 🪙</p>
    <p class="small">¡Vuelve mañana para ganar más!</p>
    <div class="row"><button class="btn gold" id="m-ok">¡Genial!</button></div>`, card => {
    sfx.coin(); confetti(60);
    card.querySelector("#m-ok").onclick = () => { closeModal(); renderMap(); };
  });
}

function dailyLevel() {
  // Un nivel ya superado elegido según la fecha: igual para todos los jugadores ese día.
  const pool = [];
  WORLDS.forEach(w => w.levels.forEach((_, i) => { if (P.stars[key(w.id, i)]) pool.push([w.id, i]); }));
  if (!pool.length) return null;
  const seed = today().split("-").reduce((a, b) => a * 31 + +b, 7);
  return pool[seed % pool.length];
}

// ---------- Mapa ----------

function enterMap() {
  renderMap();
  show("screen-map");
  dailyLogin();
}

function renderMap() {
  setTheme(null);
  $("map-who").textContent = P.face + " " + P.name;
  $("map-stars").textContent = "⭐ " + totalStars();
  $("map-coins").textContent = "🪙 " + P.coins;
  $("btn-sound").innerHTML = (store.sound ? "🔊" : "🔇") + "<span>Sonido</span>";

  const dl = dailyLevel();
  const box = $("daily-box");
  if (!dl) {
    box.innerHTML = `<div class="big">👋</div><div class="txt">¡Hola, ${escapeHtml(P.name)}!<small>Empuja las cajas hasta los círculos.</small></div>`;
  } else if (P.dailyDone === today()) {
    box.innerHTML = `<div class="big">✅</div><div class="txt">Reto del día superado<small>Mañana habrá otro. Racha: ${P.streak} 🔥</small></div>`;
  } else {
    const w = WORLDS.find(x => x.id === dl[0]);
    box.innerHTML = `<div class="big">🎯</div><div class="txt">Reto del día<small>${w.icon} ${w.name} ${dl[1] + 1} en 3 estrellas → +40 🪙</small></div><button class="btn gold" id="btn-daily">¡Ir!</button>`;
    $("btn-daily").onclick = () => startLevel(dl[0], dl[1], true);
  }

  const list = $("world-list");
  list.innerHTML = "";
  WORLDS.forEach(w => {
    const unlocked = worldUnlocked(w);
    const done = worldDone(w.id);
    const b = document.createElement("button");
    b.className = "world" + (unlocked ? "" : " locked");
    b.style.background = w.grad;
    b.innerHTML = unlocked
      ? `<div class="icon">${w.icon}</div><div class="info"><div class="title">${w.name}</div>
         <div class="count">${done}/${w.levels.length} niveles · ⭐ ${worldStars(w.id)}/${w.levels.length * 3}</div>
         <div class="progress"><div style="width:${100 * done / w.levels.length}%"></div></div></div>
         ${P.chests[w.id] ? "<div class='lock'>🏆</div>" : done === w.levels.length ? "<div class='lock chest ready'>🎁</div>" : ""}`
      : `<div class="icon">${w.icon}</div><div class="info"><div class="title">${w.name}</div>
         <div class="count">Consigue ⭐ ${w.need} para abrir (te faltan ${w.need - totalStars()})</div></div><div class="lock">🔒</div>`;
    b.onclick = () => {
      if (unlocked) openWorld(w.id);
      else { sfx.bonk(); toast(`¡Necesitas ${w.need} ⭐! Repite niveles para sacar 3 estrellas.`); }
    };
    list.appendChild(b);
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Niveles ----------

let currentWorld = null;

function openWorld(wid) {
  currentWorld = WORLDS.find(w => w.id === wid);
  setTheme(currentWorld);
  renderLevels();
  show("screen-levels");
}

function renderLevels() {
  const w = currentWorld;
  $("levels-title").textContent = w.icon + " " + w.name;
  $("levels-stars").textContent = `⭐ ${worldStars(w.id)}/${w.levels.length * 3}`;
  const grid = $("level-grid");
  grid.innerHTML = "";
  let nextMarked = false;
  w.levels.forEach((_, i) => {
    const s = P.stars[key(w.id, i)] || 0;
    const open = levelUnlocked(w.id, i);
    const b = document.createElement("button");
    b.className = "lvl" + (open ? "" : " locked");
    if (open && !s && !nextMarked) { b.classList.add("next"); nextMarked = true; }
    b.innerHTML = open ? `${i + 1}<div class="stars">${"⭐".repeat(s)}${"<span style='opacity:.25'>⭐</span>".repeat(3 - s)}</div>` : "🔒";
    b.onclick = () => open ? startLevel(w.id, i) : (sfx.bonk(), toast("Supera el nivel anterior primero"));
    grid.appendChild(b);
  });

  const cb = $("chest-box");
  const done = worldDone(w.id);
  if (P.chests[w.id]) {
    cb.innerHTML = `<div class="chest">🏆</div><p class="subtitle small">¡Cofre abierto! ${worldStars(w.id) < w.levels.length * 3 ? "Saca todas las estrellas para la pegatina de oro." : "¡Mundo perfecto!"}</p>`;
  } else if (done === w.levels.length) {
    cb.innerHTML = `<button class="chest ready" id="btn-chest">🎁</button><p class="subtitle small">¡Toca el cofre!</p>`;
    $("btn-chest").onclick = () => openChest(w);
  } else {
    cb.innerHTML = `<div class="chest" style="filter:grayscale(1);opacity:.6">🎁</div><p class="subtitle small">Termina los ${w.levels.length} niveles para abrir el cofre (${done}/${w.levels.length})</p>`;
  }
}

function openChest(w) {
  P.chests[w.id] = true;
  const prize = 100;
  addCoins(prize);
  award("cofre-" + w.id);
  checkAchievements();
  sfx.chest(); confetti(220);
  modal(`<div class="big-emoji">🎉</div><h2>¡Cofre de ${w.name}!</h2>
    <p class="reward">+${prize} 🪙</p><p>¡Pegatina nueva: ${w.icon}!</p>
    <p class="small">Gasta tus monedas en la tienda 🛍️</p>
    <div class="row"><button class="btn gold" id="m-ok">¡Bien!</button></div>`, card => {
    card.querySelector("#m-ok").onclick = () => { closeModal(); renderLevels(); };
  });
}

// ---------- Juego ----------

const DIRS = { u: [-1, 0], d: [1, 0], l: [0, -1], r: [0, 1] };
let G = null; // estado de la partida

function parseLevel(rows) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const walls = new Set(), goals = new Set(), boxes = [];
  let player = null;
  rows.forEach((row, r) => [...row.padEnd(w)].forEach((ch, c) => {
    const k = r * w + c;
    if (ch === "#") walls.add(k);
    if (ch === "." || ch === "*" || ch === "+") goals.add(k);
    if (ch === "$" || ch === "*") boxes.push(k);
    if (ch === "@" || ch === "+") player = k;
  }));
  // Suelo = lo que el jugador puede alcanzar sin atravesar muros.
  const floor = new Set([player]);
  const q = [player];
  while (q.length) {
    const k = q.pop();
    for (const [dr, dc] of Object.values(DIRS)) {
      const r = Math.floor(k / w) + dr, c = (k % w) + dc;
      if (r < 0 || c < 0 || r >= h || c >= w) continue;
      const n = r * w + c;
      if (!walls.has(n) && !floor.has(n)) { floor.add(n); q.push(n); }
    }
  }
  return { h, w, walls, goals, boxes, player, floor };
}

function startLevel(wid, idx, isDaily = false) {
  const world = WORLDS.find(w => w.id === wid);
  currentWorld = world;
  setTheme(world);
  const lvl = world.levels[idx];
  const m = parseLevel(lvl.map);
  G = {
    world, idx, lvl, isDaily, ...m,
    boxes: m.boxes.slice(),
    history: [],      // {player, boxIndex, from, to, dir}
    path: "",         // movimientos hechos, para las pistas
    moves: 0,
    undos: 0,
    won: false,
    face: "r",
  };
  $("game-title").textContent = `${world.icon} ${isDaily ? "Reto del día" : "Nivel " + (idx + 1)}`;
  const [t3] = starThresholds(lvl.best);
  $("star-goal").textContent = `⭐⭐⭐ si lo haces en ${t3} pasos o menos`;
  updateHintLabel();
  show("screen-game");
  buildBoard();
}

function buildBoard() {
  const board = $("board");
  board.innerHTML = "";
  const { h, w } = G;
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    const k = r * w + c;
    let cls = null;
    if (G.walls.has(k)) cls = "wall";
    else if (G.floor.has(k)) cls = "floor" + ((r + c) % 2 ? " alt" : "") + (G.goals.has(k) ? " goal" : "");
    if (!cls) continue;
    const d = document.createElement("div");
    d.className = "cell " + cls;
    d.style.left = `calc(var(--tile) * ${c})`;
    d.style.top = `calc(var(--tile) * ${r})`;
    board.appendChild(d);
  }
  const skin = BOXES.find(b => b.id === P.box) || BOXES[0];
  G.boxEls = G.boxes.map(() => {
    const d = document.createElement("div");
    d.className = "piece box";
    d.style.setProperty("--box-bg", skin.color);
    d.innerHTML = `<span>${skin.icon}</span>`;
    board.appendChild(d);
    return d;
  });
  const hero = HEROES.find(x => x.id === P.hero) || HEROES[0];
  G.playerEl = document.createElement("div");
  G.playerEl.className = "piece player";
  G.playerEl.innerHTML = `<span>${hero.face}</span>`;
  board.appendChild(G.playerEl);
  fitBoard();
  render(true);
}

function fitBoard() {
  if (!G) return;
  const wrap = $("board-wrap");
  const size = Math.floor(Math.min(wrap.clientWidth / G.w, wrap.clientHeight / G.h, 72));
  document.documentElement.style.setProperty("--tile", Math.max(size, 20) + "px");
  $("board").style.width = `calc(var(--tile) * ${G.w})`;
  $("board").style.height = `calc(var(--tile) * ${G.h})`;
}

function place(el, k) {
  const r = Math.floor(k / G.w), c = k % G.w;
  el.style.transform = `translate(calc(var(--tile) * ${c}), calc(var(--tile) * ${r}))`;
}

function render(instant) {
  const els = [G.playerEl, ...G.boxEls];
  if (instant) els.forEach(e => e.style.transition = "none");
  place(G.playerEl, G.player);
  G.playerEl.classList.toggle("face-l", G.face === "l");
  G.boxes.forEach((k, i) => {
    place(G.boxEls[i], k);
    G.boxEls[i].classList.toggle("on", G.goals.has(k));
  });
  $("game-moves").textContent = "👣 " + G.moves;
  if (instant) requestAnimationFrame(() => els.forEach(e => e.style.transition = ""));
}

function step(k, dir) {
  const [dr, dc] = DIRS[dir];
  const r = Math.floor(k / G.w) + dr, c = (k % G.w) + dc;
  if (r < 0 || c < 0 || r >= G.h || c >= G.w) return -1;
  return r * G.w + c;
}

function isCornerDead(k) {
  if (G.goals.has(k)) return false;
  const wall = d => { const n = step(k, d); return n < 0 || G.walls.has(n); };
  return (wall("u") || wall("d")) && (wall("l") || wall("r"));
}

function move(dir) {
  if (!G || G.won || $("modal").classList.contains("show")) return;
  if (dir === "l" || dir === "r") G.face = dir;
  const next = step(G.player, dir);
  if (next < 0 || G.walls.has(next)) { bonk(); return; }
  const bi = G.boxes.indexOf(next);
  if (bi >= 0) {
    const beyond = step(next, dir);
    if (beyond < 0 || G.walls.has(beyond) || G.boxes.includes(beyond)) { bonk(); return; }
    G.history.push({ player: G.player, bi, from: next, dir });
    G.boxes[bi] = beyond;
    G.player = next;
    G.path += dir.toUpperCase();
    G.moves++;
    if (G.goals.has(beyond)) {
      sfx.goal();
      const el = G.boxEls[bi];
      el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
    } else {
      sfx.push();
      if (isCornerDead(beyond)) setTimeout(() => toast("¡Uy! Esa caja se ha atascado. Pulsa ↩️ Atrás"), 200);
    }
  } else {
    G.history.push({ player: G.player, bi: -1, dir });
    G.player = next;
    G.path += dir;
    G.moves++;
    sfx.step();
  }
  clearHint();
  render();
  if (G.boxes.every(b => G.goals.has(b))) win();
}

function bonk() {
  sfx.bonk();
  const el = G.playerEl;
  el.classList.remove("bonk"); void el.offsetWidth; el.classList.add("bonk");
  render();
}

function undo() {
  if (!G || G.won || !G.history.length) return;
  const h = G.history.pop();
  G.player = h.player;
  if (h.bi >= 0) G.boxes[h.bi] = h.from;
  G.path = G.path.slice(0, -1);
  G.moves--;
  G.undos++;
  sfx.undo();
  clearHint();
  render();
}

function restart() {
  if (!G || G.won) return;
  startLevel(G.world.id, G.idx, G.isDaily);
}

// ---------- Pistas ----------

const HINT_COST = 5;

function updateHintLabel() {
  $("hint-label").textContent = `Pista ${HINT_COST}🪙`;
}

function clearHint() {
  document.querySelectorAll(".pad.hint").forEach(p => { p.classList.remove("hint"); p.style.background = ""; });
}

// Busca la siguiente jugada desde la posición actual (BFS con límite).
function solveFrom() {
  if (G.lvl.sol.startsWith(G.path)) return G.lvl.sol[G.path.length].toLowerCase();
  const W = G.w, goals = G.goals, walls = G.walls;
  const dead = new Set([...G.floor].filter(k => isCornerDead(k)));
  const enc = (p, bx) => p + ":" + bx.slice().sort((a, b) => a - b).join(",");
  const start = { p: G.player, bx: G.boxes.slice(), first: null };
  const seen = new Set([enc(start.p, start.bx)]);
  let frontier = [start];
  let count = 0;
  while (frontier.length) {
    const next = [];
    for (const s of frontier) {
      for (const d of "udlr") {
        const np = step(s.p, d);
        if (np < 0 || walls.has(np)) continue;
        let bx = s.bx;
        const bi = bx.indexOf(np);
        if (bi >= 0) {
          const nb = step(np, d);
          if (nb < 0 || walls.has(nb) || bx.includes(nb) || dead.has(nb)) continue;
          bx = bx.slice(); bx[bi] = nb;
        }
        const e = enc(np, bx);
        if (seen.has(e)) continue;
        seen.add(e);
        const first = s.first || d;
        if (bx.every(b => goals.has(b))) return first;
        next.push({ p: np, bx, first });
        if (++count > 300000) return null;
      }
    }
    frontier = next;
  }
  return null;
}

function hint() {
  if (!G || G.won) return;
  if (P.coins < HINT_COST) { sfx.bonk(); toast("No tienes monedas suficientes 🪙"); return; }
  const d = solveFrom();
  if (!d) {
    toast("Hay una caja atascada. Pulsa ↩️ Atrás o 🔄");
    return;
  }
  addCoins(-HINT_COST);
  const pad = document.querySelector(`.pad[data-dir="${d}"]`);
  pad.classList.add("hint");
  pad.style.background = "var(--gold)";
  toast({ u: "⬆️ Prueba hacia arriba", d: "⬇️ Prueba hacia abajo", l: "⬅️ Prueba a la izquierda", r: "➡️ Prueba a la derecha" }[d]);
}

// ---------- Victoria ----------

function win() {
  G.won = true;
  const k = key(G.world.id, G.idx);
  const before = P.stars[k] || 0;
  const stars = starsFor(G.moves, G.lvl.best);
  const newStars = Math.max(0, stars - before);
  P.stars[k] = Math.max(before, stars);
  let coins = before ? 3 : 10;
  coins += newStars * 10;
  let dailyMsg = "";
  if (G.isDaily && stars === 3 && P.dailyDone !== today()) {
    P.dailyDone = today();
    coins += 40;
    award("reto");
    dailyMsg = "<p>🎯 ¡Reto del día superado! +40</p>";
  }
  addCoins(coins);
  checkAchievements({ noUndo: G.undos === 0 && G.lvl.best >= 15 });
  save();

  const w = G.world, idx = G.idx;
  const hasNext = idx + 1 < w.levels.length;
  const worldComplete = worldDone(w.id) === w.levels.length && !P.chests[w.id];
  const cheers = ["¡Genial!", "¡Lo has logrado!", "¡Increíble!", "¡Eres un crack!", "¡Fenomenal!", "¡Bravo!"];
  const [t3, t2] = starThresholds(G.lvl.best);
  const tip = stars < 3 ? `<p class="small">Para ${stars === 1 ? "⭐⭐" : "⭐⭐⭐"} hazlo en ${stars === 1 ? t2 : t3} pasos o menos</p>` : "";

  setTimeout(() => {
    sfx.win(); confetti();
    modal(`<h2>${cheers[Math.floor(Math.random() * cheers.length)]}</h2>
      <div class="big-stars"><span>⭐</span><span>⭐</span><span>⭐</span></div>
      <p>👣 ${G.moves} pasos</p>${tip}
      <p class="reward">+${coins} 🪙</p>${dailyMsg}
      ${newStars ? `<p>¡${newStars} ${newStars === 1 ? "estrella nueva" : "estrellas nuevas"}!</p>` : ""}
      <div class="row">
        <button class="btn ghost" id="m-retry">🔄</button>
        <button class="btn ghost" id="m-menu">📋</button>
        ${worldComplete ? `<button class="btn gold" id="m-chest">🎁 ¡Cofre!</button>`
          : hasNext && !G.isDaily ? `<button class="btn green" id="m-next">Siguiente ▶</button>` : ""}
      </div>`, card => {
      card.querySelectorAll(".big-stars span").forEach((s, i) => {
        if (i < stars) setTimeout(() => { s.classList.add("on"); sfx.star(i); }, 350 + i * 300);
      });
      card.querySelector("#m-retry").onclick = () => { closeModal(); startLevel(w.id, idx, G.isDaily); };
      card.querySelector("#m-menu").onclick = () => { closeModal(); G = null; openWorld(w.id); };
      const n = card.querySelector("#m-next");
      if (n) n.onclick = () => { closeModal(); startLevel(w.id, idx + 1); };
      const c = card.querySelector("#m-chest");
      if (c) c.onclick = () => { closeModal(); G = null; openWorld(w.id); openChest(w); };
    });
  }, 250);
}

// ---------- Tienda ----------

function renderShop() {
  $("shop-coins").textContent = "🪙 " + P.coins;
  const grid = (el, items, owned, selected, onPick, preview) => {
    el.innerHTML = "";
    items.forEach(it => {
      const has = owned.includes(it.id);
      const d = document.createElement("button");
      d.className = "item" + (has ? "" : " locked") + (selected === it.id ? " selected" : "");
      d.innerHTML = `${preview(it)}<div class="name">${it.name}</div>
        <div class="price">${selected === it.id ? "✅ Puesto" : has ? "Usar" : "🪙 " + it.price}</div>`;
      d.onclick = () => onPick(it, has);
      el.appendChild(d);
    });
  };
  const buy = (it, list, setSel) => {
    if (P.coins < it.price) { sfx.bonk(); toast(`Te faltan ${it.price - P.coins} 🪙. ¡Sigue jugando!`); return; }
    modal(`<div class="big-emoji">${it.face || it.icon || "📦"}</div><h2>¿Comprar ${it.name}?</h2>
      <p class="reward">🪙 ${it.price}</p>
      <div class="row"><button class="btn ghost" id="m-no">No</button><button class="btn green" id="m-yes">¡Sí!</button></div>`, card => {
      card.querySelector("#m-no").onclick = closeModal;
      card.querySelector("#m-yes").onclick = () => {
        addCoins(-it.price);
        list.push(it.id);
        setSel(it.id);
        award("compra");
        save(); sfx.coin(); confetti(80); closeModal(); renderShop();
      };
    });
  };
  grid($("shop-heroes"), HEROES, P.heroes, P.hero,
    (it, has) => has ? (P.hero = it.id, save(), sfx.step(), renderShop()) : buy(it, P.heroes, id => P.hero = id),
    it => `<div class="face">${it.face}</div>`);
  grid($("shop-boxes"), BOXES, P.boxes, P.box,
    (it, has) => has ? (P.box = it.id, save(), sfx.step(), renderShop()) : buy(it, P.boxes, id => P.box = id),
    it => `<div class="boxprev" style="background:${it.color}">${it.icon}</div>`);
}

// ---------- Álbum ----------

function renderAlbum() {
  $("album-count").textContent = `${P.stickers.length}/${STICKERS.length}`;
  const g = $("album-grid");
  g.innerHTML = "";
  STICKERS.forEach(s => {
    const got = P.stickers.includes(s.id);
    const d = document.createElement("div");
    d.className = "sticker" + (got ? " got" : "") + (got && s.gold ? " gold" : "");
    d.innerHTML = got ? `${s.icon}<small>${s.name}</small>` : `❔<small>${s.name}</small>`;
    g.appendChild(d);
  });
}

// ---------- Controles ----------

$("btn-new-profile").onclick = askNewProfile;
$("btn-map-back").onclick = () => { renderProfiles(); show("screen-profiles"); };
$("btn-levels-back").onclick = () => { renderMap(); show("screen-map"); };
$("btn-game-back").onclick = () => { const w = G && G.world; G = null; if (w) openWorld(w.id); };
$("btn-shop").onclick = () => { renderShop(); show("screen-shop"); };
$("btn-shop-back").onclick = () => { renderMap(); show("screen-map"); };
$("btn-album").onclick = () => { renderAlbum(); show("screen-album"); };
$("btn-album-back").onclick = () => { renderMap(); show("screen-map"); };
$("btn-sound").onclick = () => { store.sound = !store.sound; saveLocal(); renderMap(); };
$("btn-undo").onclick = undo;
$("btn-restart").onclick = restart;
$("btn-hint").onclick = hint;
$("modal").addEventListener("click", e => { if (e.target.id === "modal" && !(G && G.won)) closeModal(); });

document.querySelectorAll(".pad").forEach(b => {
  // pointerdown responde más rápido que click en pantallas táctiles
  b.addEventListener("pointerdown", e => { e.preventDefault(); move(b.dataset.dir); });
});

document.addEventListener("keydown", e => {
  if (!$("screen-game").classList.contains("active")) return;
  if (e.target.tagName === "INPUT") return;
  const map = { ArrowUp: "u", ArrowDown: "d", ArrowLeft: "l", ArrowRight: "r", w: "u", s: "d", a: "l", d: "r" };
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (map[k]) { e.preventDefault(); move(map[k]); }
  else if (k === "z" || k === "Backspace") { e.preventDefault(); undo(); }
  else if (k === "r") restart();
});

// Deslizar el dedo sobre el tablero
(() => {
  let sx = 0, sy = 0, active = false;
  const wrap = $("board-wrap");
  wrap.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; active = true; });
  wrap.addEventListener("pointerup", e => {
    if (!active) return;
    active = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "d" : "u"));
  });
})();

window.addEventListener("resize", fitBoard);

// ---------- Inicio ----------

renderProfiles();
const last = store.profiles.find(p => p.id === store.last);
if (last && store.profiles.length === 1) { P = last; enterMap(); }
cloud.connect().catch(() => { /* sin nube */ });

})();
