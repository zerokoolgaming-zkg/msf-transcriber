/* ZKG Counter Upload – Frontend v4 (final) */

const CONFIG = {
  backendUrl: "https://script.google.com/macros/s/AKfycbyunwriD4T0byTXZZUlJn7cRcF-JcDhqWaMQjNl5dBMBu2mI1oHWUnsWs9PU8cWlNcDjQ/exec",
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

fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    preview.innerHTML = `<img src="${base64Image}" style="max-width:90%;border:1px solid #555;" />`;
    showMessage("Uploading…", "info");

    const payload = {
      sheetId: CONFIG.sheetId,
      sheetTab: CONFIG.sheetTab,
      row: ["Screenshot Upload", new Date().toISOString()],
      image: base64Image
    };

    try {
      console.log("Sending to:", CONFIG.backendUrl);
      const res = await fetch(CONFIG.backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors"   // prevents CORS block
      });

      showMessage("✅ Upload request sent! (check Sheet + Drive)", "success");
      console.log("Response (no-CORS mode):", res);
    } catch (err) {
      console.error("Upload failed:", err);
      showMessage("❌ Upload failed: " + err.message, "error");
    }
  };
  reader.readAsDataURL(file);
});
