// AI 맞춤 디자인 의뢰. 답변은 서버 API로만 보내고 브라우저에 남기지 않는다.
(function () {
  'use strict';
  var f = document.getElementById('custom-form');
  var err = document.getElementById('err');
  var PHONE = /^010-\d{4}-\d{4}$/;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var el = f.elements, btn = f.querySelector('button');
    var body = { color: el.color.value, mood: el.mood.value, likes: el.likes.value, use: el.use.value, ref: el.ref.value,
                 name: el.name.value.trim(), phone: el.phone.value.trim(),
                 agree_required: el.agree_required.checked, agree_ads: el.agree_ads.checked };
    if (!(body.color + body.mood + body.likes + body.use).trim()) { err.textContent = '질문 하나 이상 답해 주세요.'; return; }
    if ((body.name || body.phone) && (!PHONE.test(body.phone) || !body.agree_required)) {
      err.textContent = '의뢰서를 남기려면 010-0000-0000 형식 번호와 필수 동의가 필요해요.'; return;
    }
    err.textContent = ''; btn.disabled = true; btn.textContent = '방향을 만드는 중…';
    fetch(((window.SHOESTELLER || {}).API_BASE || '').replace(/\/$/, '') + '/sapi/shoesteller/custom-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var box = document.getElementById('dirs');
        box.textContent = '';
        (d.directions || []).forEach(function (x, i) {
          var a = document.createElement('article'); a.className = 'dir';
          [['h3', (i + 1) + '안. ' + x.title], ['p', '색: ' + x.colors], ['p', '분위기: ' + x.mood], ['p', x.point]].forEach(function (t) {
            var n = document.createElement(t[0]); n.textContent = t[1]; a.appendChild(n);
          });
          box.appendChild(a);
        });
        if (!(d.directions || []).length) box.textContent = '지금은 AI 초안을 만들 수 없어요(오늘 이용이 많았어요). 아래 문의 채팅으로 남겨 주시면 비움 작가가 직접 답드릴게요.';
        document.getElementById('saved').textContent = d.saved ? '의뢰서를 받았어요. 확인 후 연락드릴게요.' :
          (body.name ? '지금은 의뢰서 저장 준비 중이에요. 문의 채팅으로 연락처를 남겨 주세요.' : '');
        var res = document.getElementById('result'); res.hidden = false; res.focus();
      })
      .catch(function () { err.textContent = '연결이 잠시 끊겼어요. 다시 눌러 주세요.'; })
      .then(function () { btn.disabled = false; btn.textContent = '디자인 방향 3안 보기'; });
  });
})();
