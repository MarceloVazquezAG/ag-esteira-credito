const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT      = process.env.PORT || 3001;
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'state.json');

const STATIC = {
  '.html': 'text/html; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
};

// ── data helpers ──────────────────────────────────────────────────────────────

function readState() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return { DB: [], USERS: null, INVITES: [], NOTIFS: [] };
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state), 'utf8');
}

// ── request handler ───────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // CORS headers for same-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── API ──────────────────────────────────────────────────────────────────
  if (url === '/api/state') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(readState()));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body);
          const state = {
            DB:      Array.isArray(incoming.DB)      ? incoming.DB      : [],
            USERS:   Array.isArray(incoming.USERS)   ? incoming.USERS   : null,
            INVITES: Array.isArray(incoming.INVITES) ? incoming.INVITES : [],
            NOTIFS:  Array.isArray(incoming.NOTIFS)  ? incoming.NOTIFS  : [],
            updatedAt: new Date().toISOString(),
          };
          writeState(state);
          res.writeHead(200);
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'invalid json' }));
        }
      });
      return;
    }

    res.writeHead(405);
    res.end(JSON.stringify({ error: 'method not allowed' }));
    return;
  }

  // ── static files ─────────────────────────────────────────────────────────
  const filePath = url === '/' ? '/index.html' : url;
  const absPath  = path.join(__dirname, filePath);

  fs.readFile(absPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(absPath);
    res.setHeader('Content-Type', STATIC[ext] || 'application/octet-stream');
    res.writeHead(200);
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`AG Esteira de Crédito — http://localhost:${PORT}`);
});
