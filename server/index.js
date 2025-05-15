const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Statische Dateien aus dem public-Ordner ausliefern
app.use(express.static(path.join(__dirname, '../public')));

// Fallback: bei Aufruf von "/" lade index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server läuft auf: http://localhost:${PORT}`);
});
app.use('/src', express.static(path.join(__dirname, '../src')));