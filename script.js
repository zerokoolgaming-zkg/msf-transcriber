/* ZKG Counter Upload (Frontend v3 – verified JSON + CORS safe) */

const CONFIG = {
  backendUrl: "https://script.google.com/macros/s/AKfycbw6dPpNpeOb-nL1qSI3V00h9hWfTzvHkmoFXcBj0Lp_YW3PSOFiVomYIXlJaCRlA87wnw/exec",
  sheetId: "1Mq88NZUs6rIsbQFGmR_4koqxZofYeFS063-S81GtShk",
  sheetTab: "Counter"
};

// Shorthand for elements
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("statusBox");
const preview = document.getElementById("preview");

function showMessage(msg, type = "info") {
  if (!statusBox) return;
  statusBox.textContent = msg;
  statusBox.className = "status " + type;
  statusBox.style.display = "block";
}

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  showMessage("Uploading screenshot...", "info");

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    preview.innerHTML = `<img src="${base64Image}" alt="preview" />`;

    // Placeholder row data until detection logic added
    const row = [
      "Example Team Member 1", "Example Team Member 2", "Example Team Member 3", "Example Team Member 4", "Example Team Member 5",
      "Example Counter 1", "Example Counter 2", "Example Counter 3", "Example Counter 4", "Example Counter 5",
      "", "", "", "", "", "", "", "", "", "", "", ""
    ];

    const payload = {
      sheetId: CONFIG.sheetId,
      sheetTab: CONFIG.sheetTab,
      row,
      image: base64Image
    };

    try {
      console.log("Sending to:", CONFIG.backendUrl);
      const res = await fetch(CONFIG.backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      console.log("Response:", text);

      if (text.includes("ok")) {
        showMessage("✅ Upload successful! Data sent to Google Sheet.", "success");
      } else {
        showMessage("⚠️ Upload reached script but returned an error.", "error");
      }

    } catch (err) {
      console.error("Upload failed:", err);
      showMessage("❌ Upload failed: " + err.message, "error");
    }
  };

  reader.readAsDataURL(file);
});
