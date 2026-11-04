// 문의 채팅창 — 전 페이지 오른쪽 아래 말풍선. 자주 묻는 질문은 바로 답하고, 연락처를 남기면 /sapi/shoesteller/inquiry로.
// 답의 사실은 두뇌 자료(슈즈텔러 1년 미션·사이트 원고)만. 자료가 없는 건 '확인 후 답드릴게요'.
(function () {
  'use strict';
  var LATER = '확인 후 답드릴게요. 아래에 연락처를 남겨 주시면 비움 작가가 직접 연락드려요.';
  var FAQ = [
    { k: /가격|얼마|비용|금액/, q: '가격', a: LATER },
    { k: /기간|며칠|언제 받|제작/, q: '제작 기간', a: LATER },
    { k: /수업|일정|클래스|공방/, q: '수업 일정', a: '홍대 공방 커스텀 수업은 11월에 소수 정원으로 열 예정이에요. 날짜·시간은 ' + LATER },
    { k: /배송|택배|받아/, q: '배송', a: LATER }
  ];
  var css = '#stc-b{position:fixed;right:16px;bottom:var(--chat-bottom,16px);z-index:50;height:46px;padding:0 20px;border-radius:999px;border:1px solid var(--brass-soft,#d9bf93);background:var(--brass-soft,#d9bf93);color:var(--ink,#171512);font:500 14px "Noto Sans KR",system-ui,sans-serif;letter-spacing:.04em;cursor:pointer;box-shadow:0 6px 18px rgba(20,18,16,.18);transition:transform .16s cubic-bezier(.23,1,.32,1)}#stc-b:active{transform:scale(.96)}' +
    '#stc-p{position:fixed;right:12px;bottom:calc(var(--chat-bottom,16px) + 58px);z-index:50;width:min(360px,calc(100vw - 24px));max-height:70vh;overflow:auto;background:var(--surface,#fbfaf8);border:1px solid var(--line,rgba(23,21,18,.14));border-radius:14px;padding:16px;font:15px/1.6 "Noto Sans KR",system-ui,sans-serif;color:var(--ink,#171512);box-shadow:0 18px 48px rgba(20,18,16,.18);transform-origin:bottom right;transition:opacity .2s cubic-bezier(.23,1,.32,1),transform .2s cubic-bezier(.23,1,.32,1)}' +
    '@starting-style{#stc-p{opacity:0;transform:scale(.96) translateY(6px)}}' +
    '#stc-p .m{margin:6px 0;padding:10px 12px;background:var(--tone,#e9e5df);border-radius:12px 12px 12px 4px}#stc-p .u{background:var(--stage,#141210);color:var(--on-stage,#efe9df);margin-left:36px;border-radius:12px 12px 4px 12px}' +
    '#stc-p .tag{display:block;font-size:11px;letter-spacing:.06em;color:var(--ink-3,#8f8880)}#stc-p button.q{margin:4px 4px 0 0;padding:6px 14px;border:1px solid #cfc9c0;border-radius:999px;background:transparent;font:inherit;font-size:13px;cursor:pointer}' +
    '#stc-p input,#stc-p textarea{width:100%;box-sizing:border-box;margin:6px 0;padding:10px 12px;font:inherit;border:1px solid #cfc9c0;border-radius:4px;background:#fff}#stc-p summary{cursor:pointer;font-size:14px;color:var(--ink-2,#57524c);margin-top:6px}#stc-p label{display:flex;gap:6px;font-size:13px;color:var(--ink-2,#57524c)}' +
    '#stc-p .send{width:100%;margin-top:6px;padding:12px;border:0;border-radius:999px;background:var(--stage,#141210);color:var(--on-stage,#efe9df);font:inherit;font-weight:500;cursor:pointer}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var b = document.createElement('button'); b.id = 'stc-b'; b.type = 'button'; b.setAttribute('aria-label', '문의 채팅 열기'); b.textContent = '문의';
  var p = document.createElement('div'); p.id = 'stc-p'; p.hidden = true; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', '문의 채팅');
  p.innerHTML = '<div id="stc-log"><div class="m">안녕하세요, 슈즈텔러예요. 궁금한 걸 골라 주시거나 적어 주세요.</div></div>' +
    '<div id="stc-qs"></div><input id="stc-in" maxlength="200" placeholder="질문을 적어 주세요" aria-label="질문">' +
    '<details><summary>연락처 남기고 답 받기</summary><input id="stc-name" placeholder="이름" autocomplete="name">' +
    '<input id="stc-phone" placeholder="010-0000-0000" inputmode="numeric" autocomplete="tel"><textarea id="stc-msg" maxlength="500" placeholder="문의 내용"></textarea>' +
    '<label><input type="checkbox" id="stc-agree" style="width:auto">[필수] 답변 연락을 위해 이름·연락처 수집·이용에 동의합니다.</label>' +
    '<button type="button" class="send" id="stc-send">남기기</button></details>';
  document.body.appendChild(b); document.body.appendChild(p);
  var log = p.querySelector('#stc-log'), first = true, lastTopic = '';
  function say(text, me) {
    var d = document.createElement('div'); d.className = 'm' + (me ? ' u' : '');
    if (!me && first) { var t = document.createElement('span'); t.className = 'tag'; t.textContent = '자동 응답입니다'; d.appendChild(t); first = false; }
    d.appendChild(document.createTextNode(text)); log.appendChild(d); p.scrollTop = p.scrollHeight;
  }
  function ask(text) {
    say(text, true);
    var hit = FAQ.filter(function (f) { return f.k.test(text); })[0];
    lastTopic = hit ? hit.q : text.slice(0, 40);
    say(hit ? hit.a : LATER);
  }
  FAQ.forEach(function (f) {
    var q = document.createElement('button'); q.type = 'button'; q.className = 'q'; q.textContent = f.q;
    q.addEventListener('click', function () { ask(f.q); }); p.querySelector('#stc-qs').appendChild(q);
  });
  p.querySelector('#stc-in').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && this.value.trim()) { ask(this.value.trim()); this.value = ''; }
  });
  b.addEventListener('click', function () { p.hidden = !p.hidden; });
  p.querySelector('#stc-send').addEventListener('click', function () {
    var ph = p.querySelector('#stc-phone').value.replace(/\D/g, '');
    if (ph.length === 11) ph = ph.slice(0, 3) + '-' + ph.slice(3, 7) + '-' + ph.slice(7);
    var body = { name: p.querySelector('#stc-name').value.trim(), phone: ph, message: p.querySelector('#stc-msg').value,
                 topic: lastTopic, agree_required: p.querySelector('#stc-agree').checked };
    if (!body.name || !/^010-\d{4}-\d{4}$/.test(ph) || !body.agree_required) { say('이름, 010-0000-0000 번호, 필수 동의를 확인해 주세요.'); return; }
    fetch(((window.SHOESTELLER || {}).API_BASE || '').replace(/\/$/, '') + '/sapi/shoesteller/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (d) { say(d.saved ? '문의를 받았어요. 확인 후 연락드릴게요.' : d.ok ? '지금은 문의 저장을 준비 중이에요. 인스타그램 DM으로 남겨 주시면 답드릴게요.' : '보내지 못했어요. 다시 시도해 주세요.'); })
      .catch(function () { say('연결이 잠시 끊겼어요. 다시 시도해 주세요.'); });
  });
})();
