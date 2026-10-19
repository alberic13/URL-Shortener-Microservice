const urlService = require('../services/urlService');

async function createShortUrl(req, res) {
  const inputUrl = req.body && req.body.url;

  try {
    const validUrl = await urlService.validateUrl(inputUrl);
    const result = urlService.shortenUrl(validUrl);
    return res.json({
      original_url: result.original_url,
      short_url: result.short_url
    });
  } catch {
    return res.json({ error: 'invalid url' });
  }
}

function redirectToOriginalUrl(req, res) {
  const { short_url } = req.params;
  const entry = urlService.getOriginalUrl(short_url);

  if (!entry) {
    return res.status(404).json({ error: 'No short URL found for the given input' });
  }

  return res.redirect(entry.original_url);
}

module.exports = {
  createShortUrl,
  redirectToOriginalUrl
};
