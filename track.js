// 유입 추적: 첫 화면 주소의 utm_*·ref를 사이트 안 링크(가입·예약)에 그대로 붙인다. 저장소·쿠키 안 씀.
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
