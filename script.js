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

    const body = {
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

    const res = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(body)
    });

    if (res.ok) {
      entry.innerHTML = `✅ <span class="success">${file.name}</span> uploaded successfully. (VP ${victoryPoints})`;
    } else {
      entry.innerHTML = `❌ <span class="error">${file.name}</span> upload failed.`;
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
await fetch(GOOGLE_SCRIPT_URL, {
  method: "POST",
  mode: "cors",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify(body)
);

  await worker.terminate();
  const doneMsg = document.createElement('div');
  doneMsg.className = "success";
  doneMsg.textContent = "🎉 All screenshots processed!";
  status.appendChild(doneMsg);
};
