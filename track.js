// 유입 추적: 첫 화면 주소의 utm_*·ref를 사이트 안 링크(가입·예약)에 그대로 붙인다. 저장소·쿠키 안 씀.
// [11-07] 방문 세기: 페이지를 열 때 한 번, 경로·들어온 곳만 서버로(쿠키·저장소 없음, 서버도 IP를 저장하지 않음).
(function () {
  'use strict';
  try {
    var base = ((window.SHOESTELLER || {}).API_BASE || '').replace(/\/$/, '');
    var q = new URLSearchParams(location.search);
    var body = JSON.stringify({ p: location.pathname, r: document.referrer || '', h: location.hostname, u: q.get('utm_source') || q.get('ref') || '' });
    var url = base + '/s-api/shoesteller/hit';
    if (navigator.sendBeacon) navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }));
    else fetch(url, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain' } });
  } catch (e) { /* 통계 실패는 조용히 */ }
})();
(function () {
  'use strict';
  var src = new URLSearchParams(location.search), keep = [];
  ['utm_source', 'utm_medium', 'utm_campaign', 'ref'].forEach(function (k) { if (src.get(k)) keep.push([k, src.get(k)]); });
  if (!keep.length) return;
  var links = document.querySelectorAll('a[href^="./"]');
  for (var i = 0; i < links.length; i++) {
    var u = new URL(links[i].getAttribute('href'), location.href);
    keep.forEach(function (kv) { if (!u.searchParams.has(kv[0])) u.searchParams.set(kv[0], kv[1]); });
    links[i].setAttribute('href', u.pathname + u.search + u.hash);
  }
})();
