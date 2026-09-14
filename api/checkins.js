// GET /api/checkins?date=YYYY-MM-DD
// 返回某日全部业体的打卡状态（已打卡的含明细，未打卡的标记 replied:false）
const { list, get } = require('@vercel/blob');

function roster() {
  try {
    const t = JSON.parse(process.env.SUPPLIER_TOKENS || '{}');
    const seen = new Map();
    Object.values(t).forEach(v => { if (v && v.code) seen.set(v.code, v.name || ''); });
    return Array.from(seen, ([code, name]) => ({ code, name }));
  } catch (e) { return []; }
}
async function readPrivate(pathname) {
  const r = await get(pathname, { access: 'private' });
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  return JSON.parse(await new Response(r.stream).text());
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const date = String((req.query && req.query.date) || '').trim() ||
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });

  let items = [];
  let storage = 'ok';
  try {
    const { blobs } = await list({ prefix: 'checkins/' + date + '/' });
    for (const b of blobs) {
      try {
        const j = await readPrivate(b.pathname);
        if (j) items.push(j);
      } catch (e) { /* skip */ }
    }
  } catch (e) { storage = 'unavailable'; }

  const map = {};
  items.forEach(i => { if (i && i.code) map[i.code] = i; });

  const list_ = roster();
  const suppliers = list_.map(r => map[r.code] || {
    code: r.code, name: r.name, replied: false, replied_at: null });
  Object.keys(map).forEach(c => { if (!list_.some(r => r.code === c)) suppliers.push(map[c]); });

  const replied = suppliers.filter(s => s.replied).length;
  res.status(200).json({ date, count: suppliers.length, replied, storage, suppliers });
};
