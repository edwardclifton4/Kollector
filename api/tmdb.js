// Vercel serverless function: proxies a small set of TMDb requests.
// Reads the key from the TMDB_KEY environment variable (never sent to the browser).
// Allowed: GET /api/tmdb?path=search/movie&query=TITLE
//          GET /api/tmdb?path=movie/{id}

export default async function handler(req, res) {
  const key = process.env.TMDB_KEY;
  if (!key) {
    return res.status(500).json({ error: 'TMDB_KEY is not set on Vercel.' });
  }

  const path = String(req.query.path || '');
  let url;

  if (path === 'search/movie') {
    const q = String(req.query.query || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing query.' });
    url = 'https://api.themoviedb.org/3/search/movie?query=' + encodeURIComponent(q);
  } else if (/^movie\/\d+$/.test(path)) {
    url = 'https://api.themoviedb.org/3/' + path + '?';
  } else {
    return res.status(400).json({ error: 'Unsupported path.' });
  }

  try {
    const r = await fetch(url + (url.endsWith('?') ? '' : '&') + 'api_key=' + encodeURIComponent(key));
    if (!r.ok) {
      return res.status(r.status).json({ error: 'TMDb returned ' + r.status + '.' });
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: 'Could not reach TMDb.' });
  }
}
