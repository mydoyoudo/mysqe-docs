// /api/pba?p=...  → 反向代理到本机 PBA 后端（Tailscale Funnel）
// 浏览器同源访问，避开 Public→Private 网络限制；数据存在本机 SQLite。
const UPSTREAM = process.env.PBA_UPSTREAM || 'https://robins-mac-mini.taile08105.ts.net:8443';

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const p = String(req.query.p || '');
  const url = `${UPSTREAM}/api/pba?p=${encodeURIComponent(p)}`;

  const init = { method: req.method, headers: { 'Content-Type': 'application/json' } };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  init.signal = ctrl.signal;

  try {
    const r = await fetch(url, init);
    const text = await r.text();
    clearTimeout(timer);
    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.send(text);
  } catch (e) {
    clearTimeout(timer);
    return res.status(502).json({
      error: 'upstream_unreachable',
      message: String((e && e.message) || e),
      hint: '确认 Mac 上的 PBA 后端与 Tailscale Funnel 正在运行',
    });
  }
};
