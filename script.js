/* ZKG Counter Upload – MarvelStrikeForce Styled */

const CONFIG = {
  backendUrl: "https://script.google.com/macros/s/AKfycbxZgyANYMa69bmDmKXziNu5_zsab5I3vKCZFz2VHwMxyboHxtkvOrkHIWdY39U8ItK7Ng/exec",
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
}

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    preview.innerHTML = `<img src="${base64Image}" class="previewImg" />`;
    showMessage("Uploading screenshot to Drive...", "info");

    const payload = {
      sheetId: CONFIG.sheetId,
      sheetTab: CONFIG.sheetTab,
      image: base64Image,
      comment: "Screenshot uploaded successfully"
    };

    try {
      const res = await fetch(CONFIG.backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.ok) {
        showMessage(`✅ Upload complete — row ${json.row} logged!`, "success");
        console.log("Drive URL:", json.imageUrl);
      } else {
        showMessage("⚠️ Upload failed: " + (json.error || "Unknown error"), "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("❌ Upload failed: " + err.message, "error");
    }
  };
  reader.readAsDataURL(file);
});
