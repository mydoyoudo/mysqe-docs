// POST /api/checkin
// body: { t, m1e:{Man,Machine,Material,Method,Measurement,Environment}, lot_issue, lot_detail, remark }
// 供应商负责人打卡：写入 Vercel Blob
const { put } = require('@vercel/blob');

const KEYS = ['Man', 'Machine', 'Material', 'Method', 'Measurement', 'Environment'];

function tokens() {
  try { return JSON.parse(process.env.SUPPLIER_TOKENS || '{}'); } catch (e) { return {}; }
}
function cnParts() {
  const now = new Date();
  const date = now.toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });
  const time = now.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false });
  return { date, time };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const body = req.body || {};
  const info = tokens()[String(body.t || '').trim()];
  if (!info) return res.status(401).json({ error: 'invalid_token' });

  const m1e = {};
  KEYS.forEach(k => { m1e[k] = !!(body.m1e && body.m1e[k]); });

  const { date, time } = cnParts();
  const payload = {
    code: info.code,
    name: info.name,
    replied: true,
    replied_at: time,
    m1e,
    lot: { issue: !!body.lot_issue, detail: (body.lot_detail || '').trim() || null },
    detail: (body.remark || '').trim() || null,
    source: 'checkin',
  };

  try {
    await put('checkins/' + date + '/' + info.code + '.json',
      JSON.stringify(payload, null, 2),
      { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true });
  } catch (e) {
    return res.status(500).json({ error: 'storage_error', message: String(e && e.message || e) });
  }

  res.status(200).json({ ok: true, code: info.code, name: info.name, date, time, payload });
};
