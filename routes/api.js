const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

// freeCodeCamp challenge endpoints
router.post('/shorturl', urlController.createShortUrl);
router.get('/shorturl/:short_url', urlController.redirectToOriginalUrl);

// Boilerplate sample endpoint
router.get('/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

module.exports = router;
