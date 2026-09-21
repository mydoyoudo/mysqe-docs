// 京东 OAuth 回调接收
//   GET  /api/jd-oauth?code=XXX&state=YYY    → 记录 code 到 Vercel Blob（浏览器跳转直接带参时用）
//   POST /api/jd-oauth  {code,state,url}     → 同上（全站捕获脚本用）
//   GET  /api/jd-oauth?read=<READ_KEY>       → 读取最近一次记录的 code（给我取用）
const { put, get } = require('@vercel/blob');

const READ_KEY = '10b26ba00f5f2b98767737efe14aae94';
const BLOB_PATH = 'jd-oauth/latest.json';

async function readLatest() {
  const r = await get(BLOB_PATH, { access: 'private' });
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  return JSON.parse(await new Response(r.stream).text());
}

function page(title, body) {
  return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>' + title + '</title><style>'
    + 'body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;'
    + 'max-width:640px;margin:15vh auto 0;padding:0 24px;color:#111;line-height:1.75}'
    + '.ok{color:#0a7d33;font-size:20px;font-weight:600;margin:0 0 12px}'
    + 'code{background:#f4f4f4;padding:2px 6px;border-radius:4px;font-size:13px;word-break:break-all}'
    + '</style></head><body>' + body + '</body></html>';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const q = req.query || {};
  const body = req.body || {};

  // —— 读取模式 ——
  const readKey = String(q.read || '').trim();
  if (readKey) {
    if (readKey !== READ_KEY) return res.status(403).json({ error: 'forbidden' });
    let latest = null, err = null;
    try { latest = await readLatest(); } catch (e) { err = String((e && e.message) || e); }
    return res.status(200).json({ ok: !err, storage_error: err, latest, now: new Date().toISOString() });
  }

  // —— 记录模式 ——
  const code = String(q.code || body.code || '').trim();
  const errParam = String(q.error || body.error || '').trim();
  const state = String(q.state || body.state || '').trim();
  const fullUrl = String(body.url || q.full_url || '').slice(0, 1000);

  if (!code && !errParam) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(page('未收到授权参数',
      '<p class="ok">没有拿到 code 参数</p><p>请确认打开的是京东授权后跳转过来的那条链接。</p>'));
  }

  const payload = {
    code: code || null,
    error: errParam || null,
    state: state || null,
    received_at: new Date().toISOString(),
    full_url: fullUrl || null,
    ua: String(req.headers['user-agent'] || '').slice(0, 200),
  };

  let stored = true, errMsg = null;
  try {
    await put(BLOB_PATH, JSON.stringify(payload, null, 2), {
      access: 'private', contentType: 'application/json',
      addRandomSuffix: false, allowOverwrite: true,
    });
  } catch (e) {
    stored = false;
    errMsg = String((e && e.message) || e);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(page('授权已收到',
    '<p class="ok">' + (stored ? '✓ 授权 code 已收到并保存' : '✓ 收到 code，但保存失败') + '</p>'
    + '<p>这个页面可以关掉了。</p>'
    + (code ? '<p>code 摘要：<code>' + code.slice(0, 10) + '…</code></p>' : '')
    + (errMsg ? '<p>存储错误：<code>' + errMsg + '</code></p>' : '')));
};
