// /api/jielong
//   GET  → 返回已导入的接龙打卡数据（只读，公开）
//   POST → 导入/覆盖数据，需 header: x-import-key = env IMPORT_KEY
const { put, get } = require('@vercel/blob');

const MAX_BYTES = 3 * 1024 * 1024;

async function readPrivate(pathname) {
  const r = await get(pathname, { access: 'private' });
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  return JSON.parse(await new Response(r.stream).text());
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    try {
      const data = await readPrivate('jielong/latest.json');
      if (!data) return res.status(404).json({ error: 'not_imported' });
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'storage_error', message: String((e && e.message) || e) });
    }
  }

  if (req.method === 'POST') {
    const key = String(req.headers['x-import-key'] || '');
    const expect = process.env.IMPORT_KEY || '';
    if (!expect) return res.status(503).json({ error: 'import_disabled' });
    if (key !== expect) return res.status(401).json({ error: 'invalid_key' });

    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ error: 'bad_json' }); }
    }
    if (!body || !Array.isArray(body.dates) || !Array.isArray(body.people)) {
      return res.status(400).json({ error: 'bad_payload', need: ['dates', 'people'] });
    }
    const bad = body.people.find(p => !p || typeof p.name !== 'string' || !Array.isArray(p.cells)
      || p.cells.length !== body.dates.length);
    if (bad) return res.status(400).json({ error: 'bad_row', name: bad && bad.name });

    const s = JSON.stringify(body);
    if (s.length > MAX_BYTES) return res.status(413).json({ error: 'too_large', bytes: s.length });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const opts = {
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    };
    try {
      await put('jielong/latest.json', s, opts);
      await put('jielong/archive/' + stamp + '.json', s, opts);
    } catch (e) {
      return res.status(500).json({ error: 'storage_error', message: String((e && e.message) || e) });
    }

    res.status(200).json({
      ok: true,
      bytes: s.length,
      people: body.people.length,
      dates: body.dates.length,
      updated_at: body.updated_at || null,
      archive: 'jielong/archive/' + stamp + '.json',
    });
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
};
