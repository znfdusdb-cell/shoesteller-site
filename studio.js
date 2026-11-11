// 스튜디오 — 부위 색·패턴, 글자, 그림(스티커·내 사진)을 올려 디자인하고 그대로 주문 요청. 상태는 이 기기(localStorage)에만 임시 저장.
(function () {
  'use strict';
  var S = window.ShoeArt, CFG = window.SHOESTELLER || {};
  var svg = document.getElementById('shoe');
  var state = S.defaultState(), hist = [], fut = [], sel = { part: 'quarter', text: -1, sticker: -1 };
  try { var saved = JSON.parse(localStorage.getItem('st-design') || 'null'); if (saved && saved.parts) state = saved; } catch (e) {}

  function $(id) { return document.getElementById(id); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function push() { hist.push(clone(state)); if (hist.length > 60) hist.shift(); fut = []; }
  function persist() { try { var s = clone(state); s.stickers = s.stickers.map(function (x) { return x.src && x.src.length > 200000 ? Object.assign({}, x, { src: '' }) : x; }); localStorage.setItem('st-design', JSON.stringify(s)); } catch (e) {} }
  function draw() {
    S.render(svg, state, 'st');
    var p = svg.querySelector('[data-part="' + sel.part + '"]'); if (p) { if (p.tagName === 'g') [].forEach.call(p.children, function (c) { c.classList.add('sel'); }); else p.classList.add('sel'); }
    if (sel.text >= 0) { var t = svg.querySelector('[data-text="' + sel.text + '"]'); if (t) t.setAttribute('stroke', '#1f4fd8'); }
    if (sel.sticker >= 0) { var g = svg.querySelector('[data-sticker="' + sel.sticker + '"]'); if (g) { var r = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); r.setAttribute('r', 46); r.setAttribute('fill', 'none'); r.setAttribute('stroke', '#1f4fd8'); r.setAttribute('stroke-dasharray', '6 5'); r.setAttribute('stroke-width', 2 / (state.stickers[sel.sticker].s || 1)); g.appendChild(r); } }
    $('undo').disabled = !hist.length; $('redo').disabled = !fut.length;
    renderLayers(); persist();
  }

  // ---- 탭
  var tabs = document.querySelectorAll('[role=tab]');
  [].forEach.call(tabs, function (t) {
    t.addEventListener('click', function () {
      [].forEach.call(tabs, function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      [].forEach.call(document.querySelectorAll('[data-pane]'), function (p) { p.hidden = p.getAttribute('data-pane') !== t.getAttribute('data-tab'); });
      $('hint').textContent = { color: '부위를 누르고 색을 고르세요', pattern: '부위를 고르고 패턴을 올리세요', text: '글자를 적고 신발 위에서 끌어 옮기세요', sticker: '그림을 고르고 신발 위에서 끌어 옮기세요', preset: '조합을 고른 뒤 마음대로 바꾸세요' }[t.getAttribute('data-tab')];
    });
  });

  // ---- 부위
  function partsUI(id) {
    var box = $(id); box.innerHTML = '';
    S.PARTS.forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = p.name; b.setAttribute('aria-pressed', p.id === sel.part ? 'true' : 'false');
      b.addEventListener('click', function () { sel.part = p.id; sel.text = -1; sel.sticker = -1; partsUI('parts'); partsUI('parts2'); syncSwatches(); draw(); });
      box.appendChild(b);
    });
  }
  svg.addEventListener('pointerdown', function (e) {
    var t = e.target.closest('[data-text]'), st = e.target.closest('[data-sticker]'), p = e.target.closest('[data-part]');
    if (t) { sel.text = +t.getAttribute('data-text'); sel.sticker = -1; startDrag(e, 'text'); draw(); showTextEdit(); return; }
    if (st) { sel.sticker = +st.getAttribute('data-sticker'); sel.text = -1; startDrag(e, 'sticker'); draw(); showStickerEdit(); return; }
    if (p) { sel.part = p.getAttribute('data-part'); sel.text = -1; sel.sticker = -1; partsUI('parts'); partsUI('parts2'); syncSwatches(); draw(); }
  });

  // ---- 끌어 옮기기
  var drag = null;
  function pt(e) { var m = svg.getScreenCTM().inverse(), p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(m); }
  function startDrag(e, kind) { var o = pt(e), it = kind === 'text' ? state.texts[sel.text] : state.stickers[sel.sticker]; drag = { kind: kind, dx: it.x - o.x, dy: it.y - o.y, moved: false }; svg.setPointerCapture(e.pointerId); }
  svg.addEventListener('pointermove', function (e) {
    if (!drag) return; var o = pt(e), it = drag.kind === 'text' ? state.texts[sel.text] : state.stickers[sel.sticker]; if (!it) return;
    if (!drag.moved) { push(); drag.moved = true; }
    it.x = Math.round(Math.max(40, Math.min(610, o.x + drag.dx))); it.y = Math.round(Math.max(70, Math.min(300, o.y + drag.dy))); draw();
  });
  svg.addEventListener('pointerup', function () { drag = null; }); svg.addEventListener('pointercancel', function () { drag = null; });

  // ---- 물감
  function swatchUI(id, onPick, current) {
    var box = $(id); box.innerHTML = '';
    S.PAINT.forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.style.background = c[0]; b.title = c[1]; b.setAttribute('aria-label', c[1]);
      b.setAttribute('aria-pressed', current && current.toLowerCase() === c[0] ? 'true' : 'false'); b.addEventListener('click', function () { onPick(c[0]); }); box.appendChild(b);
    });
    var inp = document.createElement('input'); inp.type = 'color'; inp.value = current && /^#/.test(current) ? current : '#e4322b'; inp.setAttribute('aria-label', '직접 고르기');
    inp.addEventListener('input', function () { onPick(inp.value); }); box.appendChild(inp);
  }
  function syncSwatches() {
    var st = state.parts[sel.part] || {};
    swatchUI('swatches', function (c) { push(); state.parts[sel.part] = Object.assign({ pattern: 'none', pcolor: '#111111' }, state.parts[sel.part], { color: c }); syncSwatches(); draw(); }, st.color);
    swatchUI('pswatches', function (c) { push(); state.parts[sel.part] = Object.assign({ color: '#ffffff', pattern: 'none' }, state.parts[sel.part], { pcolor: c }); syncSwatches(); draw(); }, st.pcolor);
    patsUI();
  }
  function patsUI() {
    var box = $('pats'); box.innerHTML = ''; var st = state.parts[sel.part] || {};
    Object.keys(S.PATTERNS).forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', (st.pattern || 'none') === k ? 'true' : 'false');
      var mini = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); mini.setAttribute('viewBox', '0 0 44 30');
      var tmp = S.defaultState(); tmp.parts.quarter = { color: '#ffffff', pattern: k, pcolor: st.pcolor || '#111111' };
      var big = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); S.render(big, tmp, 'p' + k);
      var pat = big.querySelector('pattern'); if (pat) { var d = document.createElementNS('http://www.w3.org/2000/svg', 'defs'); pat.setAttribute('id', 'mini-' + k); d.appendChild(pat); mini.appendChild(d); var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); r.setAttribute('width', 44); r.setAttribute('height', 30); r.setAttribute('fill', 'url(#mini-' + k + ')'); r.setAttribute('stroke', '#000'); mini.appendChild(r); }
      else { var r2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); r2.setAttribute('width', 44); r2.setAttribute('height', 30); r2.setAttribute('fill', '#fff'); r2.setAttribute('stroke', '#000'); mini.appendChild(r2); }
      b.appendChild(mini); b.appendChild(document.createTextNode(S.PATTERNS[k].name));
      b.addEventListener('click', function () { push(); state.parts[sel.part] = Object.assign({ color: '#ffffff', pcolor: '#111111' }, state.parts[sel.part], { pattern: k }); if (state.parts[sel.part].color === 'transparent') state.parts[sel.part].color = '#ffffff'; patsUI(); draw(); });
      box.appendChild(b);
    });
  }

  // ---- 글자
  var tcolor = '#111111';
  swatchUI('tswatches', function (c) { tcolor = c; swatchUI('tswatches', arguments.callee, c); if (sel.text >= 0) { push(); state.texts[sel.text].color = c; draw(); } }, tcolor);
  $('addtext').addEventListener('click', function () {
    var v = $('txt').value.trim(); if (!v) { $('txt').focus(); return; }
    push(); state.texts.push({ t: v, x: 470, y: 205, size: 30, font: $('tfont').value, color: tcolor, rot: -8 }); sel.text = state.texts.length - 1; sel.sticker = -1; $('txt').value = ''; draw(); showTextEdit();
  });
  function showTextEdit() { var t = state.texts[sel.text]; $('tedit').hidden = !t; if (t) { $('tsize').value = t.size; $('trot').value = t.rot || 0; } }
  $('tsize').addEventListener('input', function () { var t = state.texts[sel.text]; if (t) { t.size = +this.value; draw(); } });
  $('tsize').addEventListener('change', push);
  $('trot').addEventListener('input', function () { var t = state.texts[sel.text]; if (t) { t.rot = +this.value; draw(); } });
  $('tdel').addEventListener('click', function () { if (sel.text < 0) return; push(); state.texts.splice(sel.text, 1); sel.text = -1; draw(); showTextEdit(); });
  $('tfont').addEventListener('change', function () { var t = state.texts[sel.text]; if (t) { push(); t.font = this.value; draw(); } });

  // ---- 그림
  var scolor = '#e4322b';
  swatchUI('sswatches', function (c) { scolor = c; swatchUI('sswatches', arguments.callee, c); if (sel.sticker >= 0 && !state.stickers[sel.sticker].src) { push(); state.stickers[sel.sticker].color = c; draw(); } }, scolor);
  (function () {
    var box = $('stickers');
    S.STICKERS.forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', k);
      var mini = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); mini.setAttribute('viewBox', '-44 -44 88 88');
      var tmp = S.defaultState(); tmp.stickers = [{ kind: k, x: 0, y: 0, s: 1, color: '#111' }];
      var big = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); S.render(big, tmp, 'sk' + k);
      var g = big.querySelector('[data-sticker]'); if (g) { g.removeAttribute('transform'); mini.appendChild(g); }
      b.appendChild(mini);
      b.addEventListener('click', function () { push(); state.stickers.push({ kind: k, x: 230, y: 215, s: 0.8, rot: 0, color: scolor }); sel.sticker = state.stickers.length - 1; sel.text = -1; draw(); showStickerEdit(); });
      box.appendChild(b);
    });
  })();
  $('upload').addEventListener('change', function () {
    var f = this.files && this.files[0]; if (!f) return;
    var img = new Image(), url = URL.createObjectURL(f);
    img.onload = function () {
      var c = document.createElement('canvas'), m = 320, r = Math.min(1, m / Math.max(img.width, img.height)); c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      push(); state.stickers.push({ src: c.toDataURL('image/png'), x: 230, y: 215, s: 1, rot: 0 }); sel.sticker = state.stickers.length - 1; sel.text = -1; draw(); showStickerEdit();
    };
    img.src = url; this.value = '';
  });
  function showStickerEdit() { var s = state.stickers[sel.sticker]; $('sedit').hidden = !s; if (s) { $('ssize').value = s.s || 1; $('srot').value = s.rot || 0; } }
  $('ssize').addEventListener('input', function () { var s = state.stickers[sel.sticker]; if (s) { s.s = +this.value; draw(); } });
  $('srot').addEventListener('input', function () { var s = state.stickers[sel.sticker]; if (s) { s.rot = +this.value; draw(); } });
  $('sdel').addEventListener('click', function () { if (sel.sticker < 0) return; push(); state.stickers.splice(sel.sticker, 1); sel.sticker = -1; draw(); showStickerEdit(); });

  function renderLayers() {
    var tl = $('tlayers'); tl.innerHTML = '';
    state.texts.forEach(function (t, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', i === sel.text ? 'true' : 'false'); b.innerHTML = '<span></span><span>' + Math.round(t.size) + 'px</span>'; b.firstChild.textContent = t.t; b.addEventListener('click', function () { sel.text = i; sel.sticker = -1; draw(); showTextEdit(); }); tl.appendChild(b); });
    var sl = $('slayers'); sl.innerHTML = '';
    state.stickers.forEach(function (s, i) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-pressed', i === sel.sticker ? 'true' : 'false'); b.textContent = s.src ? '내 그림 ' + (i + 1) : '그림 ' + (i + 1); b.addEventListener('click', function () { sel.sticker = i; sel.text = -1; draw(); showStickerEdit(); }); sl.appendChild(b); });
  }

  // ---- 조합
  (function () {
    var box = $('presets');
    Object.keys(S.COLORWAYS).forEach(function (n, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'item';
      var sv = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); S.render(sv, S.applyColorway(S.defaultState(), S.COLORWAYS[n]), 'pre' + i);
      b.appendChild(sv); var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = n; b.appendChild(nm);
      b.addEventListener('click', function () { push(); var keep = { texts: state.texts, stickers: state.stickers }; state = S.applyColorway(S.defaultState(), S.COLORWAYS[n]); state.texts = keep.texts; state.stickers = keep.stickers; syncSwatches(); draw(); });
      box.appendChild(b);
    });
  })();

  // ---- 되돌리기·저장
  $('undo').addEventListener('click', function () { if (!hist.length) return; fut.push(clone(state)); state = hist.pop(); sel.text = -1; sel.sticker = -1; syncSwatches(); draw(); });
  $('redo').addEventListener('click', function () { if (!fut.length) return; hist.push(clone(state)); state = fut.pop(); syncSwatches(); draw(); });
  $('reset').addEventListener('click', function () { push(); state = S.defaultState(); sel.text = -1; sel.sticker = -1; syncSwatches(); draw(); });
  $('save').addEventListener('click', function () {
    S.toPNG(svg, 1600, function (url) {
      if (!url) { $('hint').textContent = '그림 저장이 막혔어요. 화면을 캡처해 주세요.'; return; }
      var a = document.createElement('a'); a.href = url; a.download = 'shoesteller-my-design.png'; document.body.appendChild(a); a.click(); a.remove();
    });
  });

  // ---- 가격·주문(공용 시트)
  var price = CFG.PRICES && CFG.PRICES.custom;
  $('price').textContent = window.OrderSheet.won(price);
  $('order').addEventListener('click', function () {
    window.OrderSheet.open({ sku: 'custom', name: '커스텀 제작(내 디자인) 1켤레', price: price, state: state, design: clone(state), title: '내 디자인으로 주문', sub: '완성한 디자인 그대로 비움 작가가 그려요.' });
  });

  partsUI('parts'); partsUI('parts2'); syncSwatches(); draw();
})();
