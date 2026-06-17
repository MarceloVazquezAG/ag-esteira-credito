const headers = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

exports.handler = async (event) => {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore('ag-esteira-credito');

  if (event.httpMethod === 'GET') {
    const state = await store.get('state', { type: 'json' });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(state || {}),
    };
  }

  if (event.httpMethod === 'POST') {
    const state = JSON.parse(event.body || '{}');
    await store.setJSON('state', {
      DB: Array.isArray(state.DB) ? state.DB : [],
      USERS: Array.isArray(state.USERS) ? state.USERS : null,
      INVITES: Array.isArray(state.INVITES) ? state.INVITES : [],
      NOTIFS: Array.isArray(state.NOTIFS) ? state.NOTIFS : [],
      updatedAt: new Date().toISOString(),
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};
