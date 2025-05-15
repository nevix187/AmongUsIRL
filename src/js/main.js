// Zahnrad klickbar machen
document.addEventListener('DOMContentLoaded', () => {
  const settingsIcon = document.getElementById('settingsIcon');
  const adminArea = document.getElementById('adminArea');

  settingsIcon.addEventListener('click', () => {
    adminArea.classList.toggle('hidden');
  });

  document.getElementById('submitBtn').addEventListener('click', () => {
    const code = document.getElementById('codeInput').value.trim();
    const errorBox = document.getElementById('errorMsg');

    if (!code) {
      errorBox.textContent = "Bitte einen gültigen Code eingeben.";
      return;
    }

    if (code.startsWith("G-")) {
      localStorage.setItem("gameCode", code);
      window.location.href = "lobby.html";
    } else if (code.startsWith("D-")) {
      localStorage.setItem("deviceCode", code);
      window.location.href = "gamestarted.html";
    } else {
      errorBox.textContent = "Ungültiger Code.";
    }
  });

  document.getElementById('adminBtn').addEventListener('click', () => {
    const adminCode = document.getElementById('adminCode').value.trim();
    if (adminCode === "1871") {
      window.location.href = "lobby.html";
    } else {
      alert("Falscher Admin-Code!");
    }
  });
});
