// GET /api/whoami?t=<token>
// 校验业体专属 token，返回业体信息与今日打卡状态
const { list, get } = require('@vercel/blob');

function tokens() {
  try { return JSON.parse(process.env.SUPPLIER_TOKENS || '{}'); } catch (e) { return {}; }
}
function cnDate() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
}
async function readPrivate(pathname) {
  const r = await get(pathname, { access: 'private' });
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  return JSON.parse(await new Response(r.stream).text());
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const t = String((req.query && req.query.t) || '').trim();
  const info = tokens()[t];
  if (!info) return res.status(401).json({ error: 'invalid_token' });

  const date = cnDate();
  let checked = false, existing = null;
  try {
    const { blobs } = await list({ prefix: 'checkins/' + date + '/' + info.code });
    checked = blobs.length > 0;
    if (checked) existing = await readPrivate(blobs[0].pathname);
  } catch (e) { /* storage 未就绪时忽略 */ }

  res.status(200).json({ code: info.code, name: info.name, date, checked, existing });
};
