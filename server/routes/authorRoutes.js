const express = require('express');
const router = express.Router();
const { getAuthors } = require('../controllers/authorController');

router.get('/', getAuthors);

module.exports = router;
