const historyService = require('../services/historyService');

async function getHistory(req, res) {
  const history = await historyService.listHistory(req.query.search || '');
  res.json({ history });
}

async function addHistory(req, res) {
  const entry = await historyService.createHistory(req.body);
  res.status(201).json({ entry });
}

async function deleteHistory(req, res) {
  const result = await historyService.clearHistory();
  res.json(result);
}

module.exports = { getHistory, addHistory, deleteHistory };
