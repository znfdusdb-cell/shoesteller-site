// 내 취향 찾기 질문 3개(taste.html) — 한 번에 한 질문, 뒤로 가기 가능. 원고: research shoesteller-site-sb7-copy-v2 10절.
// 답은 화면 안에서만 쓰고 저장하지 않는다(브라우저 저장소·쿠키·서버 호출 없음). 결과 단추 주소의 파라미터(story)로만 넘긴다.
// 결과 단추는 taste.html에 미리 있어서 track.js가 utm_*·ref를 이미 붙여 둔다 — 여기서는 그 주소에 story만 더한다.
(function () {
  'use strict';
  var S = window.ShoeArt, CFG = window.SHOESTELLER || {};
  var form = document.getElementById('taste-form');
  if (!form) return;
  var steps = [].slice.call(form.querySelectorAll('fieldset[data-q]'));
  var back = document.getElementById('t-back'), next = document.getElementById('t-next'), stepLine = document.getElementById('t-step');
  var ownWrap = document.getElementById('q1-own-wrap'), own = document.getElementById('q1-own');
  var result = document.getElementById('result'), quiz = document.getElementById('quiz-wrap');
  var cur = 0;
  // 숍 추천 2개 — 조용한 디테일(흰 바탕에 포인트 한두 곳). PRODUCTS에 없으면 앞의 2개.
  var QUIET_PICKS = ['d-first-brush', 'd-cobalt-night'];
  var LABEL = {
    animal: '함께 사는 동물', character: '좋아하는 캐릭터·작품', place: '기억하고 싶은 장소·여행', color: '좋아하는 색·무늬', phrase: '마음에 품은 한 문장',
    daily: '내가 매일', special: '특별한 날', gift: '선물',
    quiet: '조용히, 나만 아는 디테일', loud: '보자마자 "어디서 샀어?"', warm: '귀엽고 따뜻하게'
  };

  function val(n) { var x = form.querySelector('input[name=' + n + ']:checked'); return x ? x.value : ''; }
  function setErr(n, m) { document.getElementById('err-' + n).textContent = m; }

  function show(i) {
    cur = i;
    steps.forEach(function (f, k) { f.hidden = k !== i; });
    back.hidden = i === 0;
    next.textContent = i === steps.length - 1 ? '결과 보기' : '다음';
    stepLine.textContent = '질문 ' + (i + 1) + ' / ' + steps.length;
    steps[i].querySelector('legend').focus();
  }

  form.addEventListener('change', function (e) {
    if (e.target.name === 'q1') { ownWrap.hidden = e.target.value !== 'own'; if (!ownWrap.hidden) own.focus(); }
    if (/^q\d$/.test(e.target.name)) setErr(e.target.name, '');
  });

  back.addEventListener('click', function () { if (cur > 0) show(cur - 1); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = 'q' + (cur + 1), v = val(q);
    if (!v) { setErr(q, '하나 골라 주세요.'); var first = steps[cur].querySelector('input[type=radio]'); if (first) first.focus(); return; }
    if (q === 'q1' && v === 'own' && !own.value.trim()) { setErr(q, '좋아하는 걸 한 줄 적어 주세요.'); own.focus(); return; }
    if (cur < steps.length - 1) show(cur + 1); else finish();
  });

  // 답 요약 — 상담 폼 '원하는 느낌 한 줄' 칸에 미리 채워질 문장
  function story(a) {
    var like = a.q1 === 'own' ? own.value.trim().slice(0, 60) : LABEL[a.q1];
    return ('좋아하는 것: ' + like + ' / 신는 사람: ' + LABEL[a.q2] + ' / 느낌: ' + LABEL[a.q3]).slice(0, 200);
  }

  function withParam(a, k, v) {
    var u = new URL(a.getAttribute('href'), location.href);
    u.searchParams.set(k, v);
    a.setAttribute('href', './' + u.pathname.split('/').pop() + u.search);
  }

  function picks() {
    var all = CFG.PRODUCTS || [], out = [];
    QUIET_PICKS.forEach(function (sku) { all.forEach(function (p) { if (p.sku === sku) out.push(p); }); });
    return out.length === 2 ? out : all.slice(0, 2);
  }

  function renderPicks() {
    var grid = document.getElementById('r-picks');
    grid.innerHTML = '';
    picks().forEach(function (p, i) {
      var d = document.createElement('div'); d.className = 'item'; d.style.cursor = 'default';
      if (p.photo) { var im = document.createElement('img'); im.src = p.photo; im.alt = p.name; im.loading = 'lazy'; d.appendChild(im); }
      else {
        var st = S.applyColorway(S.defaultState(), typeof p.colorway === 'string' ? (S.COLORWAYS[p.colorway] || {}) : (p.colorway || {}));
        var sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('aria-hidden', 'true'); S.render(sv, st, 'tp' + i); d.appendChild(sv);
      }
      var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = p.name; d.appendChild(nm);
      if (p.desc) { var ds = document.createElement('span'); ds.className = 'pr'; ds.textContent = p.desc; d.appendChild(ds); }
      grid.appendChild(d);
    });
  }

  function finish() {
    var a = { q1: val('q1'), q2: val('q2'), q3: val('q3') };
    var existing = a.q1 === 'color' && a.q3 === 'quiet';
    document.getElementById('r-existing').hidden = !existing;
    document.getElementById('r-personal').hidden = existing;
    document.getElementById('r-gift').hidden = a.q2 !== 'gift';
    if (existing) renderPicks();
    else {
      var s = story(a);
      document.getElementById('r-story').textContent = s;
      withParam(document.getElementById('r-order'), 'story', s);
    }
    quiz.hidden = true; result.hidden = false;
    document.getElementById(existing ? 'r-h-existing' : 'r-h-personal').focus();
  }

  document.getElementById('t-again').addEventListener('click', function () {
    form.reset(); ownWrap.hidden = true;
    ['q1', 'q2', 'q3'].forEach(function (n) { setErr(n, ''); });
    result.hidden = true; quiz.hidden = false; show(0);
  });

  steps.forEach(function (f, k) { f.hidden = k !== 0; });
  stepLine.textContent = '질문 1 / ' + steps.length;
})();
