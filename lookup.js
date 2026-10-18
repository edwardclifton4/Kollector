// Vercel serverless function: GET /api/lookup?upc=786936850383
// Calls UPCitemdb server-side (no browser CORS issues) and returns { title, source }.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const upc = String(req.query.upc || '').replace(/\D/g, '');
  if (!upc) {
    return res.status(400).json({ title: null, error: 'Missing or invalid upc' });
  }

  try {
    const r = await fetch('https://api.upcitemdb.com/prod/trial/lookup?upc=' + upc, {
      headers: { Accept: 'application/json' }
    });
    if (!r.ok) {
      return res.status(502).json({ title: null, error: 'UPCitemdb returned ' + r.status });
    }
    const j = await r.json();
    const title = (j.items && j.items[0] && j.items[0].title) || null;
    return res.status(200).json({ title, source: 'upcitemdb' });
  } catch (err) {
    return res.status(502).json({ title: null, error: 'Lookup failed' });
  }
}
