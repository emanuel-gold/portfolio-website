import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..', '..');
const siteDataPath = path.resolve(projectRoot, 'src/_data/site.js');
const publicDir = path.resolve(__dirname, 'public');
const port = process.env.PORT ? Number(process.env.PORT) : 3333;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);

    if (url.pathname === '/api/site') {
      if (req.method === 'GET') {
        return handleGetSite(res);
      }
      if (req.method === 'POST') {
        return handleSaveSite(req, res);
      }
    }

    if (req.method === 'GET') {
      if (await serveStatic(url.pathname, res)) {
        return;
      }
      return serveIndex(res);
    }

    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
  } catch (error) {
    console.error('Unhandled error', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(port, () => {
  console.log(`Site editor running at http://localhost:${port}`);
});

async function handleGetSite(res) {
  try {
    const siteData = await loadSiteData();
    const body = JSON.stringify(siteData);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(body);
  } catch (error) {
    console.error('Failed to load site data', error);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Failed to load site data.' }));
  }
}

async function handleSaveSite(req, res) {
  try {
    const body = await readRequestBody(req);
    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Invalid JSON payload.' }));
      return;
    }
    if (!isPlainObject(payload)) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ message: 'Site data must be a plain object.' }));
      return;
    }
    await writeSiteData(payload);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    console.error('Failed to save site data', error);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Failed to save site data.' }));
  }
}

async function serveStatic(urlPath, res) {
  const safePath = path.normalize(decodeURIComponent(urlPath)).replace(/^[/\\]+/, '');
  let filePath = path.join(publicDir, safePath);
  let stats;
  try {
    stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    return false;
  }

  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return true;
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';
  const data = await fs.readFile(resolved);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(data);
  return true;
}

async function serveIndex(res) {
  try {
    const indexPath = path.join(publicDir, 'index.html');
    const data = await fs.readFile(indexPath);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  } catch (error) {
    console.error('Failed to serve index.html', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Failed to serve editor UI');
  }
}

async function loadSiteData() {
  const fileUrl = pathToFileURL(siteDataPath).href;
  const moduleUrl = `${fileUrl}?update=${Date.now()}`;
  const module = await import(moduleUrl);
  return deepClone(module.default);
}

async function writeSiteData(data) {
  const serialized = `const site = ${JSON.stringify(data, null, 2)};\n\nexport default site;\n`;
  await fs.writeFile(siteDataPath, serialized, 'utf8');
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  );
}

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;
    req.on('data', (chunk) => {
      chunks.push(chunk);
      totalLength += chunk.length;
      if (totalLength > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}
