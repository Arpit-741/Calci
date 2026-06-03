const currencyService = require('../services/currencyService');

async function getRates(req, res) {
  const rates = await currencyService.getRates(req.query.base || 'USD');
  res.json(rates);
}

module.exports = { getRates };
