require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
