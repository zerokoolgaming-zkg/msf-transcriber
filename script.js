
function getGasUrl() {
  if (typeof GOOGLE_SCRIPT_URL !== 'undefined' && GOOGLE_SCRIPT_URL) return GOOGLE_SCRIPT_URL;
  const saved = localStorage.getItem('GAS_URL');
  return saved || "";
}

(function initSettings(){
  const input = document.getElementById('apiUrl');
  const saved = getGasUrl();
  if (saved) input.value = saved;
  document.getElementById('saveUrlBtn').onclick = () => {
    const val = input.value.trim();
    if (!val.startsWith('http')) {
      document.getElementById('urlStatus').textContent = '❌ Enter a valid URL ending in /exec';
      document.getElementById('urlStatus').className = 'error';
      return;
    }
    localStorage.setItem('GAS_URL', val);
    document.getElementById('urlStatus').textContent = '✅ Saved';
    document.getElementById('urlStatus').className = 'success';
  };
})();

async function processImage(file, index, worker) {
  const entry = document.createElement('div');
  entry.className = "file-entry";
  entry.textContent = `📸 Processing ${file.name}...`;
  document.getElementById('status').appendChild(entry);

  try {
    const result = await worker.recognize(file);
    const text = result.data.text;

    const powerMatches = [...text.matchAll(/Power:\s?([\d,]+)/g)];
    const powerAtk = powerMatches?.[0]?.[1]?.replace(/,/g, '') || '';
    const powerDef = powerMatches?.[1]?.[1]?.replace(/,/g, '') || '';
    const vpMatch = text.match(/([\d,]+)VP/);
    const victoryPoints = vpMatch ? vpMatch[1].replace(/,/g, '') : '';

    const attackTeam = ["Green Goblin", "Lizard", "Sandman", "Symbiote Spider-Man", "Rhino"];
    const defenseTeam = ["Silver Sable", "Shang-Chi", "Ghost Spider", "Spider-Woman", "Spider-Man (2099)"];

    const atk = Number(powerAtk);
    const def = Number(powerDef);
    const diff = Math.abs(atk - def);
    const punch = def > atk ? "Punch-Up" : "Punch-Down";
    const season = "Current";
    const roomNum = "5";

    const payload = {
      attack: attackTeam,
      defense: defenseTeam,
      season,
      roomNum,
      punch,
      powerAtk: atk,
      powerDef: def,
      diff,
      victoryPoints
    };
async function sendToGoogleSheet(payload) {
  const GAS_URL = getGasUrl(); // your /exec URL from step 2
  if (!GAS_URL) {
    alert("Missing Google Script URL");
    return;
  }

  const form = new FormData();
  form.append("payload", JSON.stringify(payload)); // must be named 'payload'

  const response = await fetch(GAS_URL, {
    method: "POST",
    body: form,
  });

  const text = await response.text();
  console.log("Google Apps Script response:", text);
}




    if (res.ok) {
      entry.innerHTML = `✅ <span class="success">${file.name}</span> uploaded successfully.`;
    } else {
      const txt = await res.text();
      entry.innerHTML = `❌ <span class="error">${file.name}</span> upload failed: ${res.status} ${txt}`;
    }
  } catch (err) {
    console.error(err);
    entry.innerHTML = `❌ <span class="error">${file.name}</span> failed: ${err.message}`;
  }
}

document.getElementById('processBtn').onclick = async () => {
  const files = Array.from(document.getElementById('uploadInput').files);
  const status = document.getElementById('status');
  status.innerHTML = "";

  if (files.length === 0) {
    status.textContent = "⚠️ Please select at least one screenshot.";
    return;
  }

  status.textContent = `🧠 Initializing OCR engine...`;
  const { createWorker } = Tesseract;
  const worker = await createWorker('eng');

  for (let i = 0; i < files.length; i++) {
    await processImage(files[i], i, worker);
  }

  await worker.terminate();
  const doneMsg = document.createElement('div');
  doneMsg.className = "success";
  doneMsg.textContent = "🎉 All screenshots processed!";
  status.appendChild(doneMsg);
};
