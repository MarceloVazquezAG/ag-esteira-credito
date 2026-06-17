import { getStore } from '@netlify/blobs';

const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export default async (request) => {
  const store = getStore('ag-esteira-credito');

  if (request.method === 'GET') {
    const state = await store.get('state', { type: 'json' });
    return new Response(JSON.stringify(state || {}), {
      status: 200,
      headers,
    });
  }

  if (request.method === 'POST') {
    const state = await request.json();
    await store.setJSON('state', {
      DB: Array.isArray(state.DB) ? state.DB : [],
      USERS: Array.isArray(state.USERS) ? state.USERS : null,
      INVITES: Array.isArray(state.INVITES) ? state.INVITES : [],
      NOTIFS: Array.isArray(state.NOTIFS) ? state.NOTIFS : [],
      updatedAt: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers,
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers,
  });
}
