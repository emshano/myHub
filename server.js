// server.js  (CommonJS version)
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ==== NOW PLAYING STORE (in-memory) ====
let nowPlaying = null;

// ---- iPhone Shortcut POSTs here ----
app.post('/api/now-playing', (req, res) => {
  if (API_KEY && req.headers['x-api-key'] !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, artist, album, artworkDataUrl } = req.body;

  nowPlaying = {
    title: title || null,
    artist: artist || null,
    album: album || null,
    artworkDataUrl: artworkDataUrl || null,
    updatedAt: new Date().toISOString(),
  };

  console.log('Updated now playing:', nowPlaying);
  res.json({ status: 'ok' });
});

// ---- React app GETs here ----
app.get('/api/now-playing', (req, res) => {
  res.json({ nowPlaying });
});

// ===== STATIC REACT BUILD SERVING =====

// In CommonJS, __dirname is available automatically
const buildPath = path.join(__dirname, 'build');

app.use(express.static(buildPath));

app.get('/*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
