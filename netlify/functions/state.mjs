import { getStore } from '@netlify/blobs';

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: HEADERS });
  }

  const store = getStore('ag-esteira');

  if (req.method === 'GET') {
    try {
      const raw = await store.get('state');
      return new Response(raw || '{}', { status: 200, headers: HEADERS });
    } catch (e) {
      console.error('GET error:', e.message);
      return new Response('{}', { status: 200, headers: HEADERS });
    }
  }

  if (req.method === 'POST') {
    try {
      const text = await req.text();
      const incoming = JSON.parse(text || '{}');
      const state = {
        DB:      Array.isArray(incoming.DB)      ? incoming.DB      : [],
        USERS:   Array.isArray(incoming.USERS)   ? incoming.USERS   : null,
        INVITES: Array.isArray(incoming.INVITES) ? incoming.INVITES : [],
        NOTIFS:  Array.isArray(incoming.NOTIFS)  ? incoming.NOTIFS  : [],
        updatedAt: new Date().toISOString(),
      };
      await store.set('state', JSON.stringify(state));
      return new Response('{"ok":true}', { status: 200, headers: HEADERS });
    } catch (e) {
      console.error('POST error:', e.message);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: HEADERS });
    }
  }

  return new Response('{"error":"method not allowed"}', { status: 405, headers: HEADERS });
};

export const config = { path: '/api/state' };
