// 가입(쿠폰)·문의/예약 폼. 서버 API_BASE + /s-api/shoesteller/signup·apply로 보낸다.
// 서버 .env SITE_COLLECT_ON=1일 때만 저장되고, 꺼져 있으면 '오픈 준비 중'을 보여준다.
// 입력값을 localStorage·쿠키·콘솔에 남기지 않는다. 결제는 없다(쿠폰은 스마트스토어에서 사용).
(function () {
  'use strict';
  var form = document.querySelector('form[data-form]');
  if (!form) return;
  var kind = form.getAttribute('data-form');
  var params = new URLSearchParams(location.search);
  var PHONE = /^010-\d{4}-\d{4}$/;
  // 서버 주소는 config.js의 API_BASE 한 곳에서. 없으면 같은 서버(상대 주소).
  var BASE = ((window.SHOESTELLER || {}).API_BASE || '').replace(/\/$/, '');
  var API = BASE + '/s-api/shoesteller/' + (kind === 'join' ? 'signup' : 'apply');

  function setErr(name, msg) {
    var p = document.getElementById('err-' + name);
    if (p) p.textContent = msg;
    var el = form.elements[name];
    if (el && el.classList) el.classList.toggle('invalid', !!msg);
  }

  // 숫자만 입력해도 010-0000-0000 모양으로 맞춘다
  var phone = form.elements.phone;
  phone.addEventListener('blur', function () {
    var d = phone.value.replace(/\D/g, '');
    if (d.length === 11) phone.value = d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  });

  // '기타'를 고르면 직접 적는 칸이 보인다
  var source = form.elements.source, etcWrap = document.getElementById('source-etc-wrap');
  source.addEventListener('change', function () { etcWrap.hidden = source.value !== '기타'; });

  // 예약: 고른 유형의 칸만 보인다
  function showType(type) {
    var blocks = form.querySelectorAll('[data-for]');
    for (var i = 0; i < blocks.length; i++) blocks[i].hidden = blocks[i].getAttribute('data-for') !== type;
  }

  if (kind === 'join') {
    var interest = params.get('interest');
    if (/^(kit|online|class|premium)$/.test(interest || '')) {
      var box = form.querySelector('input[name=interest][value=' + interest + ']');
      if (box) box.checked = true;
    }
  } else if (kind === 'book') {
    var t = params.get('type');
    if (t === 'class' || t === 'premium') {
      form.querySelector('input[name=type][value=' + t + ']').checked = true;
      showType(t);
    }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'type') { showType(e.target.value); setErr('type', ''); }
    });
  }

  function payload() {
    var el = form.elements, b = {
      name: el.name.value.trim(), phone: phone.value.trim(), source: source.value,
      source_etc: el.source_etc.value.trim(), agree_required: el.agree_required.checked,
      marketing_opt_in: el.marketing_opt_in.checked, website: el.website.value
    };
    ['utm_source', 'utm_medium', 'utm_campaign', 'ref'].forEach(function (k) { if (params.get(k)) b[k] = params.get(k); });
    if (kind === 'join') {
      b.interest = [].map.call(form.querySelectorAll('input[name=interest]:checked'), function (x) { return x.value; });
    } else {
      var ty = form.querySelector('input[name=type]:checked'), de = form.querySelector('input[name=design]:checked');
      b.type = ty ? ty.value : '';
      b.design = de ? de.value : '';
      ['date', 'people', 'shoe', 'feel', 'message'].forEach(function (k) { b[k] = el[k].value.trim(); });
    }
    return b;
  }

  function show(title, msg, coupon) {
    document.getElementById('form-wrap').hidden = true;
    document.getElementById('done-title').textContent = title;
    document.getElementById('done-msg').textContent = msg;
    var c = document.getElementById('coupon');
    if (c) { c.hidden = !coupon; document.getElementById('coupon-code').textContent = coupon || ''; }
    var done = document.getElementById('done');
    done.hidden = false;
    done.focus();
  }

  var btn = form.querySelector('button[type=submit]'), formErr = document.getElementById('err-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    function check(name, bad, msg) { setErr(name, bad ? msg : ''); if (bad) ok = false; }
    if (kind === 'book') check('type', !form.querySelector('input[name=type]:checked'), '무엇을 도와드릴지 골라 주세요.');
    check('name', !form.elements.name.value.trim(), '이름을 적어 주세요.');
    check('phone', !PHONE.test(phone.value.trim()), '휴대폰 번호를 010-0000-0000 형식으로 적어 주세요.');
    check('agree_required', !form.elements.agree_required.checked, '필수 동의에 체크해 주셔야 보내드릴 수 있어요.');
    formErr.textContent = '';
    if (!ok) {
      var first = form.querySelector('.invalid');
      if (first) first.focus();
      return;
    }
    btn.disabled = true;
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._status = r.status; return j; }); })
      .then(function (j) {
        btn.disabled = false;
        if (j.errors) { for (var k in j.errors) setErr(k, j.errors[k]); return; }
        if (!j.ok) { formErr.textContent = j.error || '보내지 못했어요. 잠시 후 다시 시도해 주세요.'; return; }
        form.reset();
        if (j.collecting === false) {
          show('오픈 준비 중이에요', '지금은 신청을 받기 전이라 저장되지 않았어요. 곧 열면 다시 찾아 주세요.');
        } else if (j.duplicate) {
          show('이미 가입하셨어요', '쿠폰 코드를 잃어버리셨다면 스마트스토어 톡톡으로 문의해 주세요.');
        } else if (kind === 'join') {
          show('가입 완료! 첫 수업 쿠폰이에요', '아래 코드를 저장해 두세요. 스마트스토어에서 쓸 수 있어요.', j.coupon_code);
        } else {
          show('확인 후 연락드릴게요', '예약 확정과 결제는 연락드린 뒤 안내해 드려요.');
        }
      })
      .catch(function () { btn.disabled = false; formErr.textContent = '인터넷 연결을 확인하고 다시 시도해 주세요.'; });
  });
})();
