// GET /api/checkins?date=YYYY-MM-DD
// 返回某日全部打卡记录（看板 / 催办用）
const { list } = require('@vercel/blob');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const date = String((req.query && req.query.date) || '').trim() ||
    new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Shanghai' });

  try {
    const { blobs } = await list({ prefix: 'checkins/' + date + '/' });
    const items = [];
    for (const b of blobs) {
      try {
        const r = await fetch(b.url, { cache: 'no-store' });
        items.push(await r.json());
      } catch (e) { /* 跳过坏文件 */ }
    }
    items.sort((a, b) => String(a.code).localeCompare(String(b.code)));
    res.status(200).json({ date, count: items.length, suppliers: items });
  } catch (e) {
    res.status(200).json({ date, count: 0, suppliers: [], note: 'storage_unavailable' });
  }
};
