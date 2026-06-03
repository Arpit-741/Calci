const express = require('express');
const controller = require('../controllers/historyController');

const router = express.Router();
router.get('/', controller.getHistory);
router.post('/', controller.addHistory);
router.delete('/', controller.deleteHistory);

module.exports = router;
