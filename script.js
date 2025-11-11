const CONFIG = {
  backendUrl: "https://script.google.com/macros/s/AKfycbzXZ2Uq5AvxUsZNYsnkGYs8V2eb65kijBwpntXRTNoQZNNx2MOteEx3BfmS_rTjsBU8OQ/exec",
  sheetId: "1Mq88NZUs6rIsbQFGmR_4koqxZofYeFS063-S81GtShk",
  sheetTab: "Counter" // ensure tab name matches EXACTLY
};

// --------------- Helpers ---------------
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("statusBox");
const preview = document.getElementById("preview");

function showMessage(msg, type = "info") {
  statusBox.textContent = msg;
  statusBox.className = "status " + type;
  statusBox.style.display = "block";
}

// --------------- Upload Logic ---------------
uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  showMessage("Uploading...", "info");

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;

    // temporary data until OCR parsing is added
    const rowData = [
      "Test Team", "Blade", "Juggernaut", "Storm", "Venom", "Sabretooth",
      "Counter Example", "", "", "", "", "", "", "", "", "", "", "", "", "OK"
    ];

    const payload = {
      sheetId: CONFIG.sheetId,
      sheetTab: CONFIG.sheetTab,
      row: rowData,
      image: base64Image
    };

    try {
      const res = await fetch(CONFIG.backendUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      console.log("Server response:", text);

      showMessage("✅ Upload Successful — Data sent to Google Sheet!", "success");
      setTimeout(() => location.reload(), 5000);
    } catch (err) {
      console.error(err);
      showMessage("Upload failed: " + err, "error");
    }

    preview.innerHTML = `<img src="${base64Image}" />`;
  };

  reader.readAsDataURL(file);
});
