// 京东 OAuth 回调捕获（全站生效）
// 只要授权的 code 落在 mysqe.work 的任意页面上，就自动上报给 /api/jd-oauth，
// 避免"回调路径没登记对导致 code 丢失"。
(function () {
  try {
    var q = new URLSearchParams(window.location.search);
    var code = q.get('code');
    var error = q.get('error');
    if (!code && !error) return;

    function show(ok, msg) {
      var box = document.createElement('div');
      box.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:2147483647;'
        + 'padding:18vh 24px 0;font-family:-apple-system,"PingFang SC",sans-serif;line-height:1.8;text-align:center';
      box.innerHTML = ok
        ? '<div style="color:#0a7d33;font-size:22px;font-weight:600">✓ 授权已收到</div>'
          + '<p style="color:#444">' + msg + '</p>'
        : '<div style="color:#b00020;font-size:22px;font-weight:600">上报失败</div>'
          + '<p style="color:#444">' + msg + '</p>';
      document.body.appendChild(box);
    }

    fetch('/api/jd-oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code, error: error, state: q.get('state'), url: window.location.href }),
      keepalive: true
    }).then(function (r) {
      show(r.ok, r.ok ? '这个页面可以关掉了，我会收到并自动换取 token。'
                      : '请把地址栏整条链接复制发给我。');
    }).catch(function () {
      show(false, '请把地址栏整条链接复制发给我。');
    });
  } catch (e) { /* 静默：不影响站点正常浏览 */ }
})();
