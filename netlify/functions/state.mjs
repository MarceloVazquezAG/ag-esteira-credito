import { getStore } from '@netlify/blobs';

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'access-control-allow-origin': '*',
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  let store;
  try {
    store = getStore({ name: 'ag-esteira', consistency: 'strong' });
  } catch (e) {
    console.error('Blobs init error:', e.message);
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'storage_unavailable' }) };
  }

  if (event.httpMethod === 'GET') {
    try {
      const raw = await store.get('state');
      const state = raw ? JSON.parse(raw) : {};
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(state) };
    } catch (e) {
      console.error('Blobs GET error:', e.message);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({}) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const incoming = JSON.parse(event.body || '{}');
      const state = {
        DB:      Array.isArray(incoming.DB)      ? incoming.DB      : [],
        USERS:   Array.isArray(incoming.USERS)   ? incoming.USERS   : null,
        INVITES: Array.isArray(incoming.INVITES) ? incoming.INVITES : [],
        NOTIFS:  Array.isArray(incoming.NOTIFS)  ? incoming.NOTIFS  : [],
        updatedAt: new Date().toISOString(),
      };
      await store.set('state', JSON.stringify(state));
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      console.error('Blobs POST error:', e.message);
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: e.message }) };
    }
  }

  return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
};
