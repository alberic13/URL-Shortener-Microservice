const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

process.env.NODE_ENV = 'test';
const app = require('../index');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('POST /api/shorturl with valid URL returns original_url and short_url', async () => {
  const res = await fetch(`${baseUrl}/api/shorturl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://freecodecamp.org' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.original_url, 'https://freecodecamp.org');
  assert.equal(typeof data.short_url, 'number');
});

test('POST /api/shorturl with form urlencoded body works properly', async () => {
  const params = new URLSearchParams();
  params.append('url', 'https://www.google.com');

  const res = await fetch(`${baseUrl}/api/shorturl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.original_url, 'https://www.google.com');
  assert.equal(typeof data.short_url, 'number');
});

test('GET /api/shorturl/:short_url redirects to original URL', async () => {
  // First create a short url
  const postRes = await fetch(`${baseUrl}/api/shorturl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://freecodecamp.org' })
  });
  const { short_url, original_url } = await postRes.json();

  // Test redirect without following redirect automatically
  const redirectRes = await fetch(`${baseUrl}/api/shorturl/${short_url}`, {
    redirect: 'manual'
  });

  assert.equal(redirectRes.status, 302);
  assert.equal(redirectRes.headers.get('location'), original_url);
});

test('POST /api/shorturl with invalid URL (ftp:/invalid-url.com) returns error', async () => {
  const res = await fetch(`${baseUrl}/api/shorturl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'ftp:/invalid-url.com' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.deepEqual(data, { error: 'invalid url' });
});

test('POST /api/shorturl with invalid format (http:/invalid-url.com) returns error', async () => {
  const res = await fetch(`${baseUrl}/api/shorturl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'http:/invalid-url.com' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.deepEqual(data, { error: 'invalid url' });
});

test('POST /api/shorturl with non-existent domain returns error', async () => {
  const res = await fetch(`${baseUrl}/api/shorturl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://non-existent-domain-xyz-987654321.org' })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.deepEqual(data, { error: 'invalid url' });
});

test('GET /api/shorturl/:short_url with non-existent id returns 404', async () => {
  const res = await fetch(`${baseUrl}/api/shorturl/999999`);
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.ok(data.error);
});
