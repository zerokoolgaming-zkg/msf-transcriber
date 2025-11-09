/**
 * 🧠 MSF Screenshot Transcriber - OCR Version
 * Automatically reads teams from screenshots and uploads to Google Sheets.
 */

const el = (id) => document.getElementById(id);
const log = (msg) => {
  const box = el("statusLog");
  box.innerHTML += `<div>${msg}</div>`;
  box.scrollTop = box.scrollHeight;
};

// === Save & Load Google Script URL ===
function saveGasUrl() {
  const url = el("scriptUrl").value.trim();
  if (!url.startsWith("https://script.google.com/macros/s/")) {
    alert("https://script.google.com/macros/s/AKfycbxfo3DEo1K1dC9ZlCQjjB8PX28-KAaJ2oKxeFxLBc5xrXSygvL4_77Mdc_S0d9YEFFx/exec");
    return;
  }
  localStorage.setItem("googleScriptUrl", url);
  alert("✅ Google Script URL saved!");
}
function getGasUrl() {
  return localStorage.getItem("googleScriptUrl") || "";
}

// === Process All Screenshots ===
async function processAllScreenshots() {
  const GAS_URL = getGasUrl();
  if (!GAS_URL) {
    alert("Please save your Google Script URL first.");
    return;
  }

  const input = el("fileInput");
  const files = input.files;
  if (!files.length) {
    alert("Please choose one or more screenshots first.");
    return;
  }

  log("🧠 Initializing OCR engine...");

  for (const file of files) {
    try {
      const payload = await extractTeamsFromScreenshot(file);
      log(`📸 ${file.name}: OCR complete, uploading...`);

      const fd = new FormData();
      fd.append("payload", JSON.stringify(payload));

      const res = await fetch(GAS_URL, { method: "POST", body: fd });
      const txt = await res.text();
      log(`✅ ${file.name}: ${txt}`);
    } catch (err) {
      log(`❌ ${file.name}: ${err.message}`);
    }
  }

  log("🎉 All screenshots processed!");
}

// === OCR and Data Extraction ===
async function extractTeamsFromScreenshot(file) {
  const { createWorker } = Tesseract;
  const worker = await createWorker("eng");
  const imageUrl = URL.createObjectURL(file);

  const { data: { text } } = await worker.recognize(imageUrl);
  await worker.terminate();

  // Simplified parsing logic
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l);
  const attack = lines.slice(0, 5);
  const defense = lines.slice(5, 10);

  const payload = {
    attack,
    defense,
    season: "Current",
    roomNum: "5",
    punch: "Auto",
    powerAtk: 0,
    powerDef: 0,
    diff: 0,
    victoryPoints: 0,
  };

  return payload;
}

// === Button Setup ===
window.addEventListener("DOMContentLoaded", () => {
  el("saveUrlBtn").onclick = saveGasUrl;
  el("processBtn").onclick = processAllScreenshots;
});
