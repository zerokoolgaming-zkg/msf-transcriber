/* ZKG Counter Upload – Sheet + Drive Integration (v2.1) */

const CONFIG = {
  backendUrl: "https://script.google.com/macros/s/AKfycbyEiMNBv-95eJhKa6Lt010J8vbJ_7BrQEZb8WtRvLYaT9O7WYKoBkMTFOO633UblsvZ0w/exec",
  sheetId: "1Mq88NZUs6rIsbQFGmR_4koqxZofYeFS063-S81GtShk",
  sheetTab: "Counter"
};

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("statusBox");
const preview   = document.getElementById("preview");

function showMessage(msg, type = "info") {
  statusBox.textContent = msg;
  statusBox.className = "status " + type;
}

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    preview.innerHTML = `<img src="${base64Image}" style="max-width:90%;border:1px solid #555;" />`;
    showMessage("Uploading and logging to sheet…", "info");

    const payload = {
      sheetId: CONFIG.sheetId,
      sheetTab: CONFIG.sheetTab,
      image: base64Image,
      textExtracted: "Screenshot uploaded",  // placeholder for OCR text
      source: "Website Upload"
    };

    try {
      console.log("POSTing to backend:", CONFIG.backendUrl);
      const res = await fetch(CONFIG.backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      console.log("Response:", text);

      let json = {};
      try { json = JSON.parse(text); } catch {}
      if (json.ok) {
        showMessage("✅ Logged to sheet & saved to Drive!", "success");
      } else {
        showMessage("⚠️ Upload ok but sheet append failed.", "error");
      }

    } catch (err) {
      console.error("Upload failed:", err);
      showMessage("❌ Upload failed: " + err.message, "error");
    }
  };

  reader.readAsDataURL(file);
});
