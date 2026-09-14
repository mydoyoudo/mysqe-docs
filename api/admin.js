// POST /api/admin
// body: { key, action: "delete" | "delete_day", date, code }
// 受 ADMIN_KEY 保护：清理打卡数据（误提交回退 / 测试数据清理）
const { list, del } = require('@vercel/blob');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const body = req.body || {};
  const key = process.env.ADMIN_KEY;
  if (!key || String(body.key || '') !== key) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const date = String(body.date || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'bad_date' });

  const action = String(body.action || 'delete');
  try {
    if (action === 'delete_day') {
      const { blobs } = await list({ prefix: 'checkins/' + date + '/' });
      for (const b of blobs) await del(b.url);
      return res.status(200).json({ ok: true, action, date, deleted: blobs.length });
    }
    const code = String(body.code || '').trim();
    if (!code) return res.status(400).json({ error: 'bad_code' });
    await del('checkins/' + date + '/' + code + '.json');
    return res.status(200).json({ ok: true, action: 'delete', date, code });
  } catch (e) {
    return res.status(500).json({ error: 'delete_failed', message: String(e && e.message || e) });
  }
};
