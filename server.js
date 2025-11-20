// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY || '';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ==== NOW PLAYING STORE ====
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

// ---- Your React app GETs here ----
app.get('/api/now-playing', (req, res) => {
  res.json({ nowPlaying });
});

// ===== STATIC REACT BUILD SERVING =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
