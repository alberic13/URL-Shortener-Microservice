const dns = require('dns');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'urls.json');

let urls = [];
let nextId = 1;

function initStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      urls = JSON.parse(data);
      if (Array.isArray(urls) && urls.length > 0) {
        const maxId = Math.max(...urls.map(u => (typeof u.short_url === 'number' ? u.short_url : 0)));
        nextId = maxId + 1;
      }
    }
  } catch {
    urls = [];
    nextId = 1;
  }
}

function persistStore() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(urls, null, 2), 'utf8');
  } catch {
    // Graceful fallback if filesystem is read-only
  }
}

initStore();

function validateUrl(inputUrl) {
  return new Promise((resolve, reject) => {
    if (!inputUrl || typeof inputUrl !== 'string') {
      return reject(new Error('Invalid URL'));
    }

    const trimmed = inputUrl.trim();
    const PROTOCOL_REGEX = /^https?:\/\//i;
    if (!PROTOCOL_REGEX.test(trimmed)) {
      return reject(new Error('Invalid protocol'));
    }

    let parsed;
    try {
      parsed = new URL(trimmed);
    } catch {
      return reject(new Error('Malformed URL'));
    }

    if (!parsed.hostname) {
      return reject(new Error('Missing hostname'));
    }

    dns.lookup(parsed.hostname, (err, address) => {
      if (err || !address) {
        return reject(new Error('Host lookup failed'));
      }
      resolve(trimmed);
    });
  });
}

function shortenUrl(originalUrl) {
  const existing = urls.find(u => u.original_url === originalUrl);
  if (existing) {
    return existing;
  }

  const newEntry = {
    original_url: originalUrl,
    short_url: nextId++
  };
  urls.push(newEntry);
  persistStore();
  return newEntry;
}

function getOriginalUrl(shortUrlParam) {
  const numericId = parseInt(shortUrlParam, 10);
  return urls.find(u => u.short_url === numericId || String(u.short_url) === String(shortUrlParam));
}

module.exports = {
  validateUrl,
  shortenUrl,
  getOriginalUrl
};
