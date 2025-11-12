const CONFIG = {
  backendUrl:
    "https://script.google.com/macros/s/AKfycbzXZ2Uq5AvxUsZNYsnkGYs8V2eb65kijBwpntXRTNoQZNNx2MOteEx3BfmS_rTjsBU8OQ/exec",
};

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("status");
const preview = document.getElementById("preview");

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview" />`;
  statusBox.textContent = "Uploading...";
  statusBox.style.color = "#00e5ff";

  try {
    const base64 = await toBase64(file);

    // 🔹 Placeholder data structure (you can later fill with OCR or manual entry)
    const payload = {
      teamMember1: "",
      teamMember2: "",
      teamMember3: "",
      teamMember4: "",
      teamMember5: "",
      counter1: "",
      counter2: "",
      counter3: "",
      counter4: "",
      counter5: "",
      season: "",
      room: "",
      punchType: "",
      tcpTeam: "",
      tcpCounter: "",
      tcpDiff: "",
      victoryPts: "",
      sacFirstWin: "",
      percentDiff: "",
      imageLink: base64, // send base64 screenshot
    };

    const body = new URLSearchParams();
    body.append("payload", JSON.stringify(payload));

    const res = await fetch(CONFIG.backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: body.toString(),
    });

    statusBox.textContent = "✅ Upload completed!";
    statusBox.style.color = "#00ff6a";
    setTimeout(() => location.reload(), 5000);
  } catch (err) {
    console.error(err);
    statusBox.textContent = "Upload failed: " + err.message;
    statusBox.style.color = "#ff5252";
  }
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
