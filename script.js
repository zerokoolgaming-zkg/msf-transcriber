/* ZKG Counter Upload — Portrait Matching (GitHub auto index, playable-only) */

const CONFIG = {
  // Google Apps Script Web App URL
  backendUrl: "https://script.google.com/macros/s/AKfycby8a0v-hUz5KEUFRPl9gHKQMpwR3m_-rgZi170OLNL1Kp9wAzV8aBAIUEXM7IaCDdYjdQ/exec",

  // Sheet destination
  sheetId: "1Mq88NZUs6rIsbQFGmR_4koqxZofYeFS063-S81GtShk",
  sheetTab: "Counter", // must match tab name exactly

  // GitHub repo (public)
  ghOwner: "zerokoolgaming-zkg",
  ghRepo: "msf-transcriber",
  ghBranch: "main",
  ghPortraitsPath: "portraits", // folder with playable portraits only
};

const $ = (s) => document.querySelector(s);
const uploadBtn = $("#uploadBtn");
const fileInput = $("#fileInput");
const statusBox = $("#statusBox");
const preview = $("#preview");

function showMessage(msg, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = msg;
  statusBox.className = "status " + type;
  statusBox.style.display = "block";
}

/* ---------------- Perceptual hash utilities (8×8 aHash) ---------------- */

async function imageToHash(url) {
  const img = await loadImage(url);
  const s = 8;
  const c = document.createElement("canvas");
  c.width = s; c.height = s;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, s, s);
  const { data } = ctx.getImageData(0, 0, s, s);
  const gray = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
  return gray.map((v) => (v > avg ? 1 : 0)).join("");
}

function hamming(a, b) {
  let d = 0;
  const L = Math.min(a.length, b.length);
  for (let i = 0; i < L; i++) if (a[i] !== b[i]) d++;
  return d + Math.abs(a.length - b.length);
}

function bestMatch(hash, db) {
  let best = { name: "", dist: 1e9 };
  for (const p of db) {
    const d = hamming(hash, p.hash);
    if (d < best.dist) best = { name: p.name, dist: d };
  }
  return best; // { name, dist }
}

function loadImage(url) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

/* ---------------- Crop helpers (percent-of-image boxes) ---------------- */

async function cropHash(imgUrl, xPct, yPct, wPct, hPct) {
  const img = await loadImage(imgUrl);
  const W = img.naturalWidth, H = img.naturalHeight;
  const x = Math.round((xPct / 100) * W);
  const y = Math.round((yPct / 100) * H);
  const w = Math.round((wPct / 100) * W);
  const h = Math.round((hPct / 100) * H);
  const c = document.createElement("canvas");
  c.width = 32; c.height = 32;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, x, y, w, h, 0, 0, 32, 32);

  const s = document.createElement("canvas");
  s.width = 8; s.height = 8;
  const sctx = s.getContext("2d", { willReadFrequently: true });
  sctx.drawImage(c, 0, 0, 8, 8);
  const { data } = sctx.getImageData(0, 0, 8, 8);

  const gray = [];
  for (let i = 0; i < data.length; i += 4) {
    gray.push(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
  const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
  return gray.map((v) => (v > avg ? 1 : 0)).join("");
}

/* ---------------- GitHub loader: list portraits from folder ---------------- */

// Display name exceptions (filename -> exact in-game name)
const NAME_OVERRIDES = {
  Blackbolt: "Black Bolt",
  MsMarvel: "Ms. Marvel",
  DrDoom: "Doctor Doom",
  Spiderman: "Spider-Man",
  SpiderMan: "Spider-Man",
  SpiderMan2099: "Spider-Man (2099)",
  IronFistWWII: "Iron Fist (WWII)",
  CaptainAmericaWWII: "Captain America (WWII)",
  NickFury: "Nick Fury",
  WarMachine: "War Machine",
  LadyDeathstrike: "Lady Deathstrike",
  Antman: "Antman",
  // add more exceptions as needed
};

// Turn a filename like "BlackBolt.png" into a nice display name "Black Bolt"
function filenameToDisplay(base) {
  if (NAME_OVERRIDES[base]) return NAME_OVERRIDES[base];
  // Insert spaces before capitals: "BlackBolt" -> "Black Bolt"
  const spaced = base.replace(/([a-z])([A-Z0-9])/g, "$1 $2");
  // Handle suffix patterns like WWII -> (WWII)
  return spaced
    .replace(/\bWWII\b/g, "(WWII)")
    .replace(/\bII\b/g, "II")
    .trim();
}

// Will hold [{ name, url, hash }]
let PORTRAITS_DB = [];

async function loadPortraitsFromGitHub() {
  if (PORTRAITS_DB.length) return PORTRAITS_DB;

  const apiUrl = `https://api.github.com/repos/${CONFIG.ghOwner}/${CONFIG.ghRepo}/contents/${CONFIG.ghPortraitsPath}?ref=${CONFIG.ghBranch}`;
  const res = await fetch(apiUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot list portraits folder via GitHub API.");
  const list = await res.json(); // array of {name, download_url, type}

  // Filter PNGs only (and assume this folder contains only playable characters)
  const pngs = list.filter((item) => item.type === "file" && /\.png$/i.test(item.name));

  // Build DB with raw URLs and display names
  PORTRAITS_DB = [];
  for (const it of pngs) {
    const base = it.name.replace(/\.png$/i, "");
    const name = filenameToDisplay(base);
    const url = it.download_url; // direct raw URL
    try {
      const hash = await imageToHash(url);
      PORTRAITS_DB.push({ name, url, hash });
    } catch (e) {
      console.warn("Portrait hash failed:", it.name, e);
    }
  }
  return PORTRAITS_DB;
}

/* ---------------- Boxes tuned for your screenshot layout ---------------- */

const ATTACK_BOXES = [
  [11.0, 44.0, 6.8, 15.0],
  [19.2, 44.0, 6.8, 15.0],
  [27.4, 44.0, 6.8, 15.0],
  [35.6, 44.0, 6.8, 15.0],
  [43.8, 44.0, 6.8, 15.0],
];

const COUNTER_BOXES = [
  [57.6, 44.0, 6.8, 15.0],
  [65.8, 44.0, 6.8, 15.0],
  [74.0, 44.0, 6.8, 15.0],
  [82.2, 44.0, 6.8, 15.0],
  [90.4, 44.0, 6.8, 15.0],
];

/* ---------------- Detect 5+5 names from a screenshot ---------------- */

async function detectTeams(imgUrl) {
  await loadPortraitsFromGitHub();

  const attack = [];
  const counter = [];
  const conf = []; // hamming distances; lower = better

  for (const box of ATTACK_BOXES) {
    const h = await cropHash(imgUrl, ...box);
    const { name, dist } = bestMatch(h, PORTRAITS_DB);
    attack.push(name || "");
    conf.push(dist);
  }
  for (const box of COUNTER_BOXES) {
    const h = await cropHash(imgUrl, ...box);
    const { name, dist } = bestMatch(h, PORTRAITS_DB);
    counter.push(name || "");
    conf.push(dist);
  }

  return { attack, counter, conf };
}

/* ---------------- UI + Upload flow ---------------- */

uploadBtn?.addEventListener("click", () => fileInput.click());

fileInput?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  showMessage("Uploading…", "info");

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    preview.innerHTML = `<img src="${base64Image}" alt="preview" />`;

    try {
      // Create a temporary object URL to crop locally
      const blobUrl = URL.createObjectURL(file);
      const { attack, counter, conf } = await detectTeams(blobUrl);

      // Row format: A–E attack, F–J counter, T (col 20) is Drive link set by backend
      // Put confidence diagnostics into U (21) and V (22)
      const row = [
        ...attack.slice(0, 5),                // A..E
        ...counter.slice(0, 5),               // F..J
        "", "", "", "", "", "", "", "",       // K..R (season/room/totals spare)
        "",                                   // S (unused)
        "",                                   // T set by backend to Drive URL
        `dist: ${conf.slice(0,5).join(",")}`, // U
        `dist: ${conf.slice(5).join(",")}`,   // V
      ];

      const payload = {
        sheetId: CONFIG.sheetId,
        sheetTab: CONFIG.sheetTab,
        row,
        image: base64Image,
      };

      // text/plain + no-cors to avoid preflight/CORS headaches
      await fetch(CONFIG.backendUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      showMessage("✅ Upload Successful — Names sent to Google Sheet!", "success");
      setTimeout(() => location.reload(), 6000);
    } catch (err) {
      console.error(err);
      showMessage("Upload failed: " + err.message, "error");
    }
  };

  reader.readAsDataURL(file);
});
