console.log("✅ main.js wird geladen");

document.addEventListener('DOMContentLoaded', () => {
  // ⚙️ Zahnrad-Icon / Adminbereich
  const settingsIcon = document.getElementById('settingsIcon');
  const adminArea = document.getElementById('adminArea');

  console.log("settingsIcon:", settingsIcon);
  console.log("adminArea:", adminArea);

  if (settingsIcon && adminArea) {
    settingsIcon.addEventListener('click', () => {
      adminArea.classList.toggle('hidden');
    });
  }

  // 🎮 Formular-Eingabe (Name + Spiel-/Gerätecode)
  const form = document.getElementById('joinForm');
  const codeInput = document.getElementById('codeInput');
  const nameInput = document.getElementById('playerNameInput');
  const errorMsg = document.getElementById('errorMsg');

  if (form && codeInput && nameInput && errorMsg) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const code = codeInput.value.trim();
      const name = nameInput.value.trim();

      if (!name) {
        errorMsg.textContent = "Bitte gib deinen Namen ein.";
        return;
      }

      if (!code) {
        errorMsg.textContent = "Bitte gib einen gültigen Code ein.";
        return;
      }

      localStorage.setItem("playerName", name);

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

  // 🔐 Admin-Code
  const adminBtn = document.getElementById('adminBtn');
  const adminCode = document.getElementById('adminCode');

  if (adminBtn && adminCode) {
    adminBtn.addEventListener('click', () => {
      if (adminCode.value.trim() === "1871") {
        window.location.href = "admin.html";
      } else {
        alert("Falscher Admin-Code!");
      }
    });
  }

  // 📱 Gerätecode direkt im Admin-Menü
  const deviceBtn = document.getElementById('deviceJoinBtn');
  const deviceInput = document.getElementById('deviceCodeInput');

  if (deviceBtn && deviceInput) {
    deviceBtn.addEventListener('click', () => {
      const deviceCode = deviceInput.value.trim();
      if (deviceCode.startsWith("D-")) {
        localStorage.setItem("deviceCode", deviceCode);
        window.location.href = "gamestarted.html";
      } else {
        alert("Ungültiger Gerätecode (muss mit D- beginnen)");
      }
    });
  }
});
