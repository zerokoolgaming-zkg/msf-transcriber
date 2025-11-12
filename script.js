/* ZKG Counter Upload (Frontend v2 — JSON POST fix) */

const CONFIG = {
  backendUrl: "https://script.google.com/macros/s/AKfycbwk9kc_UGbfJeXU_27B1vhZmSK4D50ZOEdmKdGQk9oCi8ezwB-zMxR9xMYieDHcPh6IRw/exec",
  sheetId: "1Mq88NZUs6rIsbQFGmR_4koqxZofYeFS063-S81GtShk",
  sheetTab: "Counter"
};

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("statusBox");
const preview = document.getElementById("preview");

function showMessage(msg, type = "info") {
  statusBox.textContent = msg;
  statusBox.className = "status " + type;
  statusBox.style.display = "block";
}

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  showMessage("Uploading…", "info");

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    preview.innerHTML = `<img src="${base64Image}" alt="preview" />`;

    try {
      // (Placeholder) Demo data — your actual detection populates this:
      const row = [
        "Example Team Member 1", "Example Team Member 2", "Example Team Member 3", "Example Team Member 4", "Example Team Member 5",
        "Example Counter 1", "Example Counter 2", "Example Counter 3", "Example Counter 4", "Example Counter 5",
        "", "", "", "", "", "", "", "", "", "", "", "", ""
      ];

      const payload = {
        sheetId: CONFIG.sheetId,
        sheetTab: CONFIG.sheetTab,
        row,
        image: base64Image
      };

      const response = await fetch(CONFIG.backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
      console.log("Response:", text);

      showMessage("✅ Upload successful! Data sent to Google Sheet.", "success");
      setTimeout(() => location.reload(), 5000);

    } catch (err) {
      console.error(err);
      showMessage("❌ Upload failed: " + err.message, "error");
    }
  };

  reader.readAsDataURL(file);
});
