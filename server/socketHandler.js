const players = [];

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log("🔌 Spieler verbunden:", socket.id);

    socket.on('joinGame', (playerName) => {
      if (!players.includes(playerName)) {
        players.push(playerName);
      }

      io.emit('playerListUpdate', players);
      console.log("👥 Spielerliste:", players);
    });

    socket.on('disconnect', () => {
      // Optional: Später Spieler*innen entfernen
    });
  });
};
module.exports = function(io) {
  const players = [];

  io.on('connection', (socket) => {
    console.log("🔌 Spieler verbunden:", socket.id);

    socket.on('joinGame', (playerName) => {
      if (!players.includes(playerName)) {
        players.push(playerName);
      }
      io.emit('playerListUpdate', players);
    });

    socket.on('startGame', () => {
      console.log("🚀 Spiel wurde gestartet!");
      io.emit('gameStarted'); // broadcast an alle Clients
    });

    socket.on('disconnect', () => {
      // später: Spieler*innen entfernen
    });
  });
};
