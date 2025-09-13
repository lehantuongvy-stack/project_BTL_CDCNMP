// Tạo server & mount routes
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const foodsRoutes = require('./routes/foods.routes');
const ingredientsRoutes = require('./routes/ingredients.routes');
const receiptsRoutes = require('./routes/receipts.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/foods', foodsRoutes);
app.use('/api/ingredients', ingredientsRoutes);
app.use('/api/receipts', receiptsRoutes);
app.use('/api/reports', reportsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
