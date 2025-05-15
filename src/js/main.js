console.log("✅ main.js wird geladen");

const settingsIcon = document.getElementById('settingsIcon');
const adminArea = document.getElementById('adminArea');

console.log("settingsIcon:", settingsIcon);
console.log("adminArea:", adminArea);

document.addEventListener('DOMContentLoaded', () => {
  const settingsIcon = document.getElementById('settingsIcon');
  const adminArea = document.getElementById('adminArea');

  if (settingsIcon && adminArea) {
    settingsIcon.addEventListener('click', () => {
      adminArea.classList.toggle('hidden');
    });
  }

  const submitBtn = document.getElementById('submitBtn');
  const codeInput = document.getElementById('codeInput');
  const errorMsg = document.getElementById('errorMsg');

  if (submitBtn && codeInput && errorMsg) {
    submitBtn.addEventListener('click', () => {
      const code = codeInput.value.trim();

      if (!code) {
        errorMsg.textContent = "Bitte einen gültigen Code eingeben.";
        return;
      }

      if (code.startsWith("G-")) {
        localStorage.setItem("gameCode", code);
        window.location.href = "lobby.html";
      } else if (code.startsWith("D-")) {
        localStorage.setItem("deviceCode", code);
        window.location.href = "gamestarted.html";
      } else {
        errorMsg.textContent = "Ungültiger Code.";
      }
    });
  }

  const adminBtn = document.getElementById('adminBtn');
  const adminCode = document.getElementById('adminCode');

  if (adminBtn && adminCode) {
    adminBtn.addEventListener('click', () => {
      if (adminCode.value.trim() === "1871") {
        window.location.href = "lobby.html";
      } else {
        alert("Falscher Admin-Code!");
      }
    });
  }
});
