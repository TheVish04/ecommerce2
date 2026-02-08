const express = require('express');
const router = express.Router();
const { getAllPublicServices } = require('../controllers/serviceController');

// Public Services Route
router.get('/', getAllPublicServices);

module.exports = router;
