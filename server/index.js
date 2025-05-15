const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 3000;

// HTTP-Server erstellen (statt app.listen direkt)
const server = http.createServer(app);

// Socket.io initialisieren
const io = new Server(server);
require('./socketHandler')(io); // eigene Socket-Logik einbinden

// Statische Dateien ausliefern
app.use(express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(path.join(__dirname, '../src')));

// Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Server starten
server.listen(PORT, () => {
  console.log(`✅ Server läuft auf: http://localhost:${PORT}`);
});
