// 주문 시트 — 스튜디오(내 디자인)와 숍(완성 디자인)이 같이 쓴다. 결제는 없다: 주문 요청을 서버(/s-api/shoesteller/order)에 남기고 확인 연락 때 결제 안내.
(function () {
  'use strict';
  var S = window.ShoeArt, CFG = window.SHOESTELLER || {}, PHONE = /^010-\d{4}-\d{4}$/, params = new URLSearchParams(location.search);
  var sheet = document.createElement('div');
  sheet.className = 'sheet'; sheet.id = 'order-sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'os-h'); sheet.hidden = true;
  sheet.innerHTML = '<div class="dim" data-close></div><div class="panel">' +
    '<button class="close" type="button" aria-label="닫기" data-close>×</button>' +
    '<h2 id="os-h">주문하기</h2><p class="lead" id="os-sub"></p><svg id="os-shoe" aria-hidden="true"></svg>' +
    '<form class="form" id="os-form" novalidate>' +
    '<fieldset><legend>사이즈 (mm) <span class="req">(필수)</span></legend><div class="sizes" id="os-sizes"></div><p class="err" id="os-err-size" aria-live="polite"></p></fieldset>' +
    '<fieldset><label class="label" for="os-name">이름 <span class="req">(필수)</span></label><input type="text" id="os-name" name="name" autocomplete="name"><p class="err" id="os-err-name" aria-live="polite"></p></fieldset>' +
    '<fieldset><label class="label" for="os-phone">휴대폰 번호 <span class="req">(필수)</span></label><input type="tel" id="os-phone" name="phone" inputmode="numeric" placeholder="010-0000-0000" autocomplete="tel"><p class="err" id="os-err-phone" aria-live="polite"></p></fieldset>' +
    '<fieldset><label class="label" for="os-note">요청사항 (선택)</label><textarea id="os-note" name="note" maxlength="300" placeholder="신발 보유 여부, 원하는 느낌, 받고 싶은 날"></textarea></fieldset>' +
    '<fieldset><label class="label" for="os-coupon">쿠폰 코드 (있으면)</label><input type="text" id="os-coupon" name="coupon" maxlength="12" placeholder="ST-XXXXXX" autocomplete="off"></fieldset>' +
    '<div aria-hidden="true" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden"><label for="os-website">비워 두세요</label><input type="text" id="os-website" name="website" tabindex="-1" autocomplete="off"></div>' +
    '<fieldset class="consent"><label class="choice"><input type="checkbox" name="agree_required" id="os-agree"><span><span class="req">[필수]</span> 개인정보 수집·이용 동의: 주문 확인과 제작·배송 안내를 위해 이름·휴대폰 번호를 수집·이용합니다. <a href="./privacy.html" target="_blank" rel="noopener">처리방침 보기</a></span></label><p class="err" id="os-err-agree_required" aria-live="polite"></p>' +
    '<label class="choice"><input type="checkbox" name="marketing_opt_in" id="os-mkt"><span>[선택] 슈즈텔러 소식과 혜택(광고성 정보)을 문자·카카오로 받겠습니다.</span></label></fieldset>' +
    '<div class="price-line"><span id="os-item"></span><span class="big" id="os-price"></span></div>' +
    '<p class="err" id="os-err-form" aria-live="polite"></p>' +
    '<button class="btn" type="submit">주문 요청 보내기</button>' +
    '<p class="note" style="margin-top:10px">보내시면 하루 안에 확인 연락을 드리고, 그때 결제 방법을 안내해요. 결제 전까지는 비용이 들지 않아요.</p></form>' +
    '<div class="done" id="os-done" hidden tabindex="-1"><h2 id="os-done-title"></h2><p class="lead" id="os-done-msg"></p><p style="margin-top:20px"><a class="btn ghost" href="./index.html">처음으로</a></p></div></div>';
  document.body.appendChild(sheet);
  var form = sheet.querySelector('#os-form'), sizes = sheet.querySelector('#os-sizes'), cur = null;
  for (var mm = 220; mm <= 290; mm += 5) { var l = document.createElement('label'); l.innerHTML = '<input type="radio" name="size" value="' + mm + '"><span>' + mm + '</span>'; sizes.appendChild(l); }
  function $(id) { return sheet.querySelector('#' + id); }
  function won(v) { return v ? Number(v).toLocaleString('ko-KR') + '원' : '가격 확인 중'; }
  function close() { sheet.classList.remove('open'); sheet.hidden = true; document.body.style.overflow = ''; }
  [].forEach.call(sheet.querySelectorAll('[data-close]'), function (x) { x.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) close(); });
  $('os-phone').addEventListener('blur', function () { var d = this.value.replace(/\D/g, ''); if (d.length === 11) this.value = d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7); });
  function setErr(n, m) { var p = $('os-err-' + n); if (p) p.textContent = m; var el = form.elements[n]; if (el && el.classList) el.classList.toggle('invalid', !!m); }

  // open({ sku, name, price, state(신발 그림 상태), design(주문에 실을 디자인 JSON|null), sub(한 줄) })
  function open(o) {
    cur = o; sheet.hidden = false; sheet.classList.add('open'); document.body.style.overflow = 'hidden';
    form.hidden = false; $('os-done').hidden = true; form.reset(); [].forEach.call(form.querySelectorAll('.err'), function (e) { e.textContent = ''; });
    $('os-h').textContent = o.title || '주문하기'; $('os-sub').textContent = o.sub || '';
    $('os-item').textContent = o.name; $('os-price').textContent = won(o.price);
    if (o.state) S.render($('os-shoe'), o.state, 'os'); else $('os-shoe').innerHTML = '';
    $('os-name').focus();
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var ok = true;
    function check(n, bad, m) { setErr(n, bad ? m : ''); if (bad) ok = false; }
    var size = form.querySelector('input[name=size]:checked');
    check('size', !size, '사이즈를 골라 주세요.');
    check('name', !form.elements.name.value.trim(), '이름을 적어 주세요.');
    check('phone', !PHONE.test(form.elements.phone.value.trim()), '휴대폰 번호를 010-0000-0000 형식으로 적어 주세요.');
    check('agree_required', !form.elements.agree_required.checked, '필수 동의에 체크해 주셔야 보내드릴 수 있어요.');
    if (!ok) { var f = form.querySelector('.invalid'); if (f) f.focus(); return; }
    var btn = form.querySelector('button[type=submit]'); btn.disabled = true; $('os-err-form').textContent = '';
    var design = cur.design ? JSON.parse(JSON.stringify(cur.design)) : null;
    if (design && design.stickers) design.stickers = design.stickers.map(function (s) { return s.src && s.src.length > 120000 ? Object.assign({}, s, { src: '(큰 그림 — 확인 연락 때 받습니다)' }) : s; });
    var body = { name: form.elements.name.value.trim(), phone: form.elements.phone.value.trim(), agree_required: true, marketing_opt_in: form.elements.marketing_opt_in.checked, website: form.elements.website.value,
      items: [{ sku: cur.sku, name: cur.name, size: +size.value, qty: 1, price: cur.price || null }], coupon: form.elements.coupon.value.trim(), note: form.elements.note.value.trim(), design: design };
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref'].forEach(function (k) { if (params.get(k)) body[k] = params.get(k); });
    fetch((CFG.API_BASE || '').replace(/\/$/, '') + '/s-api/shoesteller/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (j) {
        btn.disabled = false;
        if (j.errors) { for (var k in j.errors) setErr(k, j.errors[k]); return; }
        if (!j.ok) { $('os-err-form').textContent = j.error || '보내지 못했어요. 잠시 후 다시 시도해 주세요.'; return; }
        form.hidden = true; var d = $('os-done'); d.hidden = false;
        if (j.collecting === false) { $('os-done-title').textContent = '오픈 준비 중이에요'; $('os-done-msg').textContent = '지금은 주문을 받기 전이라 저장되지 않았어요. 곧 열면 다시 보내 주세요.'; }
        else { $('os-done-title').textContent = '주문 요청을 받았어요'; $('os-done-msg').textContent = '주문번호 ' + (j.order_code || '') + '. 하루 안에 확인 연락을 드리고 결제 방법을 안내해요.' + (design ? ' 디자인은 그대로 비움 작가에게 전달됐어요.' : ''); }
        d.focus();
        if (cur.onDone) cur.onDone(j);
      }).catch(function () { btn.disabled = false; $('os-err-form').textContent = '인터넷 연결을 확인하고 다시 시도해 주세요.'; });
  });
  window.OrderSheet = { open: open, close: close, won: won };
})();
