document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const playerName = localStorage.getItem("playerName");
  const gameCode = localStorage.getItem("gameCode");
  const gameCodeDisplay = document.getElementById("lobbyGameCode");
  const playerList = document.getElementById("players");

  if (playerName) {
    socket.emit("joinGame", playerName);
  }

  if (gameCodeDisplay && gameCode) {
    gameCodeDisplay.textContent = gameCode;
  }

  socket.on("playerListUpdate", (players) => {
    if (playerList) {
      playerList.innerHTML = "";
      players.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        playerList.appendChild(li);
      });
    }
  });

  // 🔥 WICHTIG: auf Spielstart reagieren
  socket.on("gameStarted", () => {
    console.log("Spielstart empfangen – weiterleiten zu gamestarted.html");
    window.location.href = "gamestarted.html";
  });
});
