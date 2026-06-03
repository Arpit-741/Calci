const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const historyRoutes = require('./routes/historyRoutes');
const currencyRoutes = require('./routes/currencyRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..')));
app.use('/api/history', historyRoutes);
app.use('/api/rates', currencyRoutes);

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

if (require.main === module) {
  app.listen(port, () => console.log(`CalcMaster Pro running at http://localhost:${port}`));
}

module.exports = app;
