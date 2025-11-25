require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = 3000;
const API_KEY = process.env.GIPHY_API_KEY;

// Na starcie - aktualizuj config.json z .env
if (API_KEY) {
    const configPath = path.join(__dirname, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify({ apiKey: API_KEY }, null, 2));
}

// Serwuj pliki statyczne
app.use(express.static(path.join(__dirname)));

// Endpoint do pobierania klucza API
app.get('/api/key', (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }
    res.json({ key: API_KEY });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
