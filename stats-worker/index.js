const VALID_TYPES = new Set([
  'WTHG','WTHS','WTDG','WTDS',
  'WNHG','WNHS','WNDG','WNDS',
  'CTHG','CTHS','CTDG','CTDS',
  'CNHG','CNHS','CNDG','CNDS'
]);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    // GET /stats — returner alle tellere (for dashboard)
    if (url.pathname === '/stats') {
      const entries = await Promise.all(
        [...VALID_TYPES].map(async t => [t, +(await env.STATS.get(t) || 0)])
      );
      const counts = Object.fromEntries(entries);
      const total = Object.values(counts).reduce((s, n) => s + n, 0);
      return new Response(JSON.stringify({ total, counts }), { headers: CORS });
    }

    // GET /ping?type=WTHG — øk teller med 1
    if (!type || !VALID_TYPES.has(type)) {
      return new Response(JSON.stringify({ error: 'ugyldig type' }), { status: 400, headers: CORS });
    }

    const n = +(await env.STATS.get(type) || 0);
    await env.STATS.put(type, String(n + 1));
    return new Response(JSON.stringify({ type, count: n + 1 }), { headers: CORS });
  },
};
