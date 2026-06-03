const express = require('express');
const controller = require('../controllers/currencyController');

const router = express.Router();
router.get('/', controller.getRates);

module.exports = router;
