import { getStore } from '@netlify/blobs';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export default async (req) => {
  const store = getStore('ag-esteira-files');
  const url = new URL(req.url);
  const segments = url.pathname.replace(/^\/api\/file\/?/, '');
  const key = segments || null;

  // POST /api/file — upload
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const fileKey = 'f' + Date.now() + Math.random().toString(36).slice(2, 8);
      await store.set(fileKey, JSON.stringify({
        data: body.data,
        name: body.name,
        type: body.type,
        size: body.size,
      }));
      return new Response(JSON.stringify({ key: fileKey }), { headers: JSON_HEADERS });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: JSON_HEADERS });
    }
  }

  // GET /api/file/:key — download
  if (req.method === 'GET' && key) {
    try {
      const raw = await store.get(key);
      if (!raw) return new Response('{"error":"not found"}', { status: 404, headers: JSON_HEADERS });
      return new Response(raw, { headers: JSON_HEADERS });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: JSON_HEADERS });
    }
  }

  // DELETE /api/file/:key
  if (req.method === 'DELETE' && key) {
    try {
      await store.delete(key);
      return new Response('{"ok":true}', { headers: JSON_HEADERS });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: JSON_HEADERS });
    }
  }

  return new Response('{"error":"bad request"}', { status: 400, headers: JSON_HEADERS });
};

export const config = { path: ['/api/file', '/api/file/:key'] };
