document.addEventListener('DOMContentLoaded', () => {
  const createBtn = document.getElementById('createGameBtn');
  const startBtn = document.getElementById('startGameBtn');
  const gameCodeDisplay = document.getElementById('gameCodeDisplay');
  const generatedSection = document.getElementById('generatedGameCode');

  createBtn.addEventListener('click', () => {
    const impostors = document.getElementById('impostorCount').value;
    const time = document.getElementById('gameTime').value;

    // Spielcode generieren
    const code = "G-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    localStorage.setItem('gameCode', code);

    gameCodeDisplay.textContent = code;
    generatedSection.classList.remove('hidden');
    startBtn.classList.remove('hidden');

    console.log(`Spiel erstellt: ${code} | ${impostors} Impostor(s) | ${time} Min`);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const startBtn = document.getElementById('startGameBtn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      socket.emit('startGame');
      window.location.href = "gamestartedadmin.html";
    });
  }
});
