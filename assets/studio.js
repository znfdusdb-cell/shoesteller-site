/* BIUM 커스텀 스튜디오 — 신발 선화 위에 칸 칠하기·붓·그림·글자. 외부 라이브러리 없음. */
(function () {
  'use strict';
  var S = window.SHOES, B = window.BIUM;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var W = 1600, H = 800;
  var cv = $('#cv'), ctx = cv.getContext('2d');
  function mk() { var c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  var lineCv = mk(), insideCv = mk(), paintCv = mk(), itemCv = mk();

  /* 11/11 회장: 고를 신발은 6개 모델(흰색·검정), 가격은 공식 판매가(회사가 한 달에 한 번 확인) */
  var MODELS = S.STUDIO_MODELS || [];
  var MATCH = [
    [/에어\s*포스|air\s*force|af\s*1|에포/i, 'af1'], [/테니스|tennis/i, 'tennis'],
    [/올드\s*스쿨|old\s*skool/i, 'oldskool'], [/어센틱|authentic/i, 'authentic'],
    [/(척|chuck|컨버스|converse|올스타|all\s*star).*(하이|high|hi)|(하이|high).*(척|chuck|컨버스|converse)/i, 'chuckhi'],
    [/척|chuck|컨버스|converse|올스타|all\s*star/i, 'chuck'], [/반스|vans/i, 'oldskool'], [/나이키|nike/i, 'af1']
  ];
  function modelById(id) { return MODELS.filter(function (m) { return m.id === id; })[0]; }
  var PAINTS = ['#ffffff', '#111111', '#c8102e', '#e94e1b', '#f5c400', '#2f8f3a', '#0a4ea2', '#5a3fb8', '#f4a6c0', '#8fd3f4', '#b8e08a', '#8a5a3b', '#c9c1b6', '#6b6b6b', '#0b1f3a', '#7a0019'];

  var st = { base: null, photo: null, ops: [], items: [], sel: -1, tool: 'fill', color: '#c8102e', bsize: 16 };
  var boundary = null, outside = null, hist = [], redo = [], dirtyFlag = false;

  /* ---------- 신발 고르기 ---------- */
  function won(n) { return B.won ? B.won(n) : n.toLocaleString() + '원'; }
  $('#models').innerHTML = MODELS.map(function (m) {
    var p = (m.colors.white || m.colors[Object.keys(m.colors)[0]]).price;
    return '<button type="button" data-model="' + m.id + '"><img src="assets/line/' + m.line + '.png" alt=""><b>' + m.ko + '</b><small>' + Object.keys(m.colors).map(function (c) { return m.colors[c].ko; }).join(' · ') + ' · ' + won(p) + '</small></button>';
  }).join('');
  $$('#models button').forEach(function (b) { b.onclick = function () { pickModel(b.getAttribute('data-model')); }; });
  function pickModel(id, color) {
    var m = modelById(id); if (!m) return;
    var c = color && m.colors[color] ? color : (st.model === id && m.colors[st.color0] ? st.color0 : Object.keys(m.colors)[0]);
    if (st.base === m.line && st.model !== id && !st.photo) { st.model = id; st.color0 = c; afterModel(); return; }
    st.model = id; st.color0 = c; pickBase(m.line);
  }
  function afterModel() {
    var m = modelById(st.model), keys = m ? Object.keys(m.colors) : [];
    $('#colors').hidden = keys.length < 2;
    $('#colors').innerHTML = keys.map(function (k) { return '<button type="button" data-color="' + k + '"' + (k === st.color0 ? ' class="on"' : '') + '><i style="background:' + (k === 'black' ? '#111' : '#fff') + '"></i>' + m.colors[k].ko + '</button>'; }).join('');
    $$('#colors button').forEach(function (b) { b.onclick = function () { st.color0 = b.getAttribute('data-color'); afterModel(); }; });
    $('#model-note').textContent = m ? m.ko + ' ' + m.colors[st.color0].ko + ' · 새 신발 ' + won(m.colors[st.color0].price) + (S.STUDIO_PRICE_CHECKED ? ' (' + S.STUDIO_PRICE_CHECKED.slice(5).replace('-', '/') + ' 공식 판매가)' : '') : '';
    markBases(); quote();
  }
  function label(id) { var m = modelById(st.model); return m ? m.ko + ' ' + m.colors[st.color0].ko : id; }

  function pickBase(id) {
    if (st.base === id && !st.photo) { afterModel(); return; }
    if (dirtyFlag && !confirm('신발을 바꾸면 칠한 것은 지워져요(올린 그림·글자는 남아요). 바꿀까요?')) return;
    var img = new Image();
    img.onload = function () {
      st.base = id; st.photo = null; st.ops = [];
      var lc = lineCv.getContext('2d'); lc.clearRect(0, 0, W, H);
      var s = Math.min(W / img.width, H / img.height) * 0.94, w = img.width * s, h = img.height * s;
      lc.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      buildMasks(); rebuildPaint(); draw(); afterModel(); setHint();
      if (pendingLoad) { var d = pendingLoad; pendingLoad = null; applySaved(d); }
    };
    img.src = 'assets/line/' + id + '.png';
  }
  function markBases() { $$('#models button').forEach(function (b) { b.classList.toggle('on', !st.photo && b.getAttribute('data-model') === st.model); }); $('.st-photo').classList.toggle('on', !!st.photo); }

  $('#photo').onchange = function () {
    var f = this.files[0]; if (!f) return;
    loadImg(f, 1600, function (img) {
      st.photo = img; st.base = 'photo'; st.ops = [];
      lineCv.getContext('2d').clearRect(0, 0, W, H);
      boundary = null; outside = null;
      var ic = insideCv.getContext('2d'); ic.clearRect(0, 0, W, H); ic.fillStyle = '#000'; ic.fillRect(0, 0, W, H);
      if (st.tool === 'fill') setTool('brush');
      rebuildPaint(); draw(); markBases(); setHint();
    });
    this.value = '';
  };

  /* 선화의 선(경계)과 바깥 영역 */
  function buildMasks() {
    var d = lineCv.getContext('2d').getImageData(0, 0, W, H).data, n = W * H, b = new Uint8Array(n), i;
    for (i = 0; i < n; i++) b[i] = d[i * 4 + 3] > 60 ? 1 : 0;
    var b2 = new Uint8Array(b);
    for (var y = 1; y < H - 1; y++) for (var x = 1; x < W - 1; x++) { i = y * W + x; if (b[i]) { b2[i - 1] = b2[i + 1] = b2[i - W] = b2[i + W] = 1; } }
    boundary = b2;
    outside = flood(0, 0, boundary);
    var o2 = flood(W - 1, H - 1, boundary); for (i = 0; i < n; i++) if (o2[i]) outside[i] = 1;
    var ic = insideCv.getContext('2d'), id = ic.createImageData(W, H), a = id.data;
    for (i = 0; i < n; i++) if (!outside[i]) a[i * 4 + 3] = 255;
    ic.putImageData(id, 0, 0);
  }
  function flood(sx, sy, wall) {
    var seen = new Uint8Array(W * H), stack = [sx, sy];
    while (stack.length) {
      var y = stack.pop(), x = stack.pop(), i = y * W + x;
      if (x < 0 || y < 0 || x >= W || y >= H || seen[i] || wall[i]) continue;
      var l = x, r = x;
      while (l > 0 && !seen[y * W + l - 1] && !wall[y * W + l - 1]) l--;
      while (r < W - 1 && !seen[y * W + r + 1] && !wall[y * W + r + 1]) r++;
      for (var k = l; k <= r; k++) {
        seen[y * W + k] = 1;
        if (y > 0 && !seen[(y - 1) * W + k] && !wall[(y - 1) * W + k]) stack.push(k, y - 1);
        if (y < H - 1 && !seen[(y + 1) * W + k] && !wall[(y + 1) * W + k]) stack.push(k, y + 1);
      }
    }
    return seen;
  }
  function fillMask(op) {
    if (op._m) return op._m;
    var reg = flood(op.x, op.y, boundary), c = mk(), g = c.getContext('2d'), id = g.createImageData(W, H), a = id.data, n = W * H, i, j;
    var rgb = hex(op.color);
    var grow = new Uint8Array(reg);
    for (var pass = 0; pass < 3; pass++) {
      var nx = new Uint8Array(grow);
      for (i = W; i < n - W; i++) if (grow[i]) for (j = 0; j < 4; j++) { var q = i + [1, -1, W, -W][j]; if (boundary[q] && !outside[q]) nx[q] = 1; }
      grow = nx;
    }
    for (i = 0; i < n; i++) if (grow[i]) { a[i * 4] = rgb[0]; a[i * 4 + 1] = rgb[1]; a[i * 4 + 2] = rgb[2]; a[i * 4 + 3] = 255; }
    g.putImageData(id, 0, 0);
    op._m = c; return c;
  }
  function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }

  /* ---------- 그리기 ---------- */
  function rebuildPaint() {
    var g = paintCv.getContext('2d'); g.clearRect(0, 0, W, H);
    st.ops.forEach(function (op) { if (op.type === 'fill') g.drawImage(fillMask(op), 0, 0); else strokeOn(g, op); });
    if (!st.photo && st.base) { g.globalCompositeOperation = 'destination-in'; g.drawImage(insideCv, 0, 0); g.globalCompositeOperation = 'source-over'; }
  }
  function strokeOn(g, op) {
    g.lineCap = g.lineJoin = 'round'; g.strokeStyle = op.color; g.lineWidth = op.size;
    g.beginPath(); op.pts.forEach(function (p, k) { k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); });
    if (op.pts.length === 1) g.lineTo(op.pts[0][0] + 0.1, op.pts[0][1]);
    g.stroke();
  }
  function itemSize(it) {
    if (it.type === 'img') return [it.w * it.s, it.h * it.s];
    ctx.font = it.font.replace('1px', Math.round(100 * it.s) + 'px');
    return [ctx.measureText(it.text).width, 100 * it.s * 1.1];
  }
  function drawItem(g, it) {
    g.save(); g.translate(it.x, it.y); g.rotate(it.r * Math.PI / 180);
    if (it.type === 'img') g.drawImage(it.img, -it.w * it.s / 2, -it.h * it.s / 2, it.w * it.s, it.h * it.s);
    else { g.font = it.font.replace('1px', Math.round(100 * it.s) + 'px'); g.fillStyle = it.color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(it.text, 0, 0); }
    g.restore();
  }
  function draw(forExport) {
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    if (st.photo) { var p = st.photo, s = Math.min(W / p.width, H / p.height), w = p.width * s, h = p.height * s; ctx.drawImage(p, (W - w) / 2, (H - h) / 2, w, h); }
    ctx.drawImage(paintCv, 0, 0);
    var g = itemCv.getContext('2d'); g.clearRect(0, 0, W, H);
    st.items.forEach(function (it) { drawItem(g, it); });
    if (!st.photo && st.base) { g.globalCompositeOperation = 'destination-in'; g.drawImage(insideCv, 0, 0); g.globalCompositeOperation = 'source-over'; }
    ctx.drawImage(itemCv, 0, 0);
    if (!st.photo && st.base) { ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(lineCv, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(lineCv, 0, 0); }
    if (!forExport && st.items[st.sel]) {
      var it = st.items[st.sel], sz = itemSize(it);
      ctx.translate(it.x, it.y); ctx.rotate(it.r * Math.PI / 180);
      ctx.setLineDash([12, 8]); ctx.lineWidth = 3; ctx.strokeStyle = '#111'; ctx.strokeRect(-sz[0] / 2 - 8, -sz[1] / 2 - 8, sz[0] + 16, sz[1] + 16);
    }
    ctx.restore();
    $('#empty').hidden = !!st.base;
    if (!qPend) { qPend = true; requestAnimationFrame(function () { qPend = false; quote(); }); }
  }
  var qPend = false;

  /* ---------- 되돌리기 ---------- */
  function snap() { return { ops: st.ops.slice(), items: st.items.map(function (i) { return Object.assign({}, i); }) }; }
  function push() { hist.push(snap()); if (hist.length > 50) hist.shift(); redo = []; dirtyFlag = true; syncUndo(); }
  function restore(s) { st.ops = s.ops; st.items = s.items; st.sel = -1; rebuildPaint(); draw(); syncSel(); }
  function syncUndo() { $('#undo').disabled = !hist.length; $('#redo').disabled = !redo.length; }
  $('#undo').onclick = function () { if (!hist.length) return; redo.push(snap()); restore(hist.pop()); syncUndo(); };
  $('#redo').onclick = function () { if (!redo.length) return; hist.push(snap()); restore(redo.pop()); syncUndo(); };
  $('#clear').onclick = function () { if (!st.ops.length && !st.items.length) return; if (!confirm('칠한 것과 올린 것을 모두 지울까요?')) return; push(); st.ops = []; st.items = []; st.sel = -1; rebuildPaint(); draw(); syncSel(); };
  $('#dl').onclick = function () { saveDesign(); };
  function exportUrl(w, q) { draw(true); var c = document.createElement('canvas'); c.width = w; c.height = w / 2; c.getContext('2d').drawImage(cv, 0, 0, c.width, c.height); draw(); return c.toDataURL('image/jpeg', q); }

  /* ---------- 도구 ---------- */
  function setTool(t) {
    st.tool = t;
    $$('.st-tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tool') === t); });
    $('[data-pane=color]').hidden = !(t === 'fill' || t === 'brush' || t === 'text');
    $('[data-pane=brush]').hidden = t !== 'brush';
    $('[data-pane=image]').hidden = t !== 'image';
    $('[data-pane=text]').hidden = t !== 'text';
    setHint();
  }
  function setHint() {
    var h = !st.base ? '먼저 1번에서 신발을 골라 주세요' :
      st.tool === 'fill' ? (st.photo ? '사진 위에서는 붓으로 칠해 주세요' : '신발 안쪽 칸을 누르면 고른 색으로 칠해져요') :
      st.tool === 'brush' ? '손가락이나 마우스로 그려요' :
      st.tool === 'image' ? '올린 그림을 끌어서 옮기고, 두 손가락으로 크기·각도를 바꿔요' : '글자를 쓰고 올리기를 누르세요. 끌어서 옮겨요';
    $('#hint').textContent = h;
  }
  $$('.st-tabs button').forEach(function (b) { b.onclick = function () { var t = b.getAttribute('data-tool'); if (t === 'fill' && st.photo) { B.toast('사진 위에서는 붓으로 칠해 주세요'); t = 'brush'; } setTool(t); }; });
  $('#sw').innerHTML = PAINTS.map(function (c) { return '<button type="button" data-c="' + c + '" style="background:' + c + '" aria-label="' + c + '"></button>'; }).join('');
  function setColor(c) {
    st.color = c; $$('#sw button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-c') === c); });
    var it = st.items[st.sel]; if (it && it.type === 'text') { push(); it.color = c; draw(); }
  }
  $$('#sw button').forEach(function (b) { b.onclick = function () { setColor(b.getAttribute('data-c')); }; });
  $('#pick').oninput = function () { setColor(this.value); };
  $('#bsize').oninput = function () { st.bsize = +this.value; };
  setColor(st.color);

  function loadImg(file, max, cb) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); cb(c);
    };
    img.onerror = function () { B.toast('이 사진은 열 수 없어요. JPG나 PNG로 올려 주세요.'); };
    img.src = url;
  }
  $('#img').onchange = function () {
    var f = this.files[0]; if (!f) return; this.value = '';
    if (!st.base) return B.toast('먼저 신발을 골라 주세요');
    loadImg(f, 1000, function (img) {
      push(); var w = img.width, h = img.height, s = Math.min(420 / w, 300 / h);
      st.items.push({ type: 'img', img: img, w: w, h: h, x: W / 2, y: H / 2 + 40, s: s, r: 0 });
      st.sel = st.items.length - 1; draw(); syncSel();
    });
  };
  $('#txt-add').onclick = function () {
    var t = $('#txt').value.trim(); if (!t) return;
    if (!st.base) return B.toast('먼저 신발을 골라 주세요');
    push(); st.items.push({ type: 'text', text: t, font: $('#font').value, color: st.color === '#ffffff' ? '#111111' : st.color, x: W / 2, y: H / 2 + 60, s: 0.8, r: 0 });
    st.sel = st.items.length - 1; $('#txt').value = ''; draw(); syncSel();
  };
  function syncSel() {
    var it = st.items[st.sel]; $('#sel').hidden = !it;
    if (it) { $('#scale').value = Math.round(it.s * 100 / base0(it)); $('#rot').value = Math.round(it.r); }
  }
  function base0(it) { return it.type === 'img' ? Math.min(420 / it.w, 300 / it.h) : 0.8; }
  var sliding = false;
  $('#scale').oninput = function () { var it = st.items[st.sel]; if (!it) return; if (!sliding) { push(); sliding = true; } it.s = base0(it) * this.value / 100; draw(); };
  $('#rot').oninput = function () { var it = st.items[st.sel]; if (!it) return; if (!sliding) { push(); sliding = true; } it.r = +this.value; draw(); };
  $('#scale').onchange = $('#rot').onchange = function () { sliding = false; };
  $('#del').onclick = function () { if (st.sel < 0) return; push(); st.items.splice(st.sel, 1); st.sel = -1; draw(); syncSel(); };
  $('#front').onclick = function () { if (st.sel < 0) return; push(); st.items.push(st.items.splice(st.sel, 1)[0]); st.sel = st.items.length - 1; draw(); };

  /* ---------- 손가락·마우스 ---------- */
  var ptrs = {}, drag = null, cur = null;
  function pt(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
  function hit(p) {
    for (var k = st.items.length - 1; k >= 0; k--) {
      var it = st.items[k], sz = itemSize(it), a = -it.r * Math.PI / 180, dx = p[0] - it.x, dy = p[1] - it.y;
      var lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
      if (Math.abs(lx) <= sz[0] / 2 + 16 && Math.abs(ly) <= sz[1] / 2 + 16) return k;
    }
    return -1;
  }
  cv.addEventListener('pointerdown', function (e) {
    if (!st.base) return B.toast('먼저 신발을 골라 주세요');
    cv.setPointerCapture(e.pointerId); var p = pt(e); ptrs[e.pointerId] = p;
    var ids = Object.keys(ptrs);
    if (ids.length === 2 && st.items[st.sel]) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]], it = st.items[st.sel];
      drag = { pinch: true, d0: Math.hypot(a[0] - b[0], a[1] - b[1]), a0: Math.atan2(b[1] - a[1], b[0] - a[0]), s0: it.s, r0: it.r }; cur = null; return;
    }
    var k = (st.tool === 'image' || st.tool === 'text') ? hit(p) : -1;
    if (k >= 0) { push(); st.sel = k; var it2 = st.items[k]; drag = { dx: p[0] - it2.x, dy: p[1] - it2.y }; draw(); syncSel(); return; }
    if (st.tool === 'image' || st.tool === 'text') { st.sel = -1; draw(); syncSel(); return; }
    if (st.tool === 'fill') {
      if (st.photo) return;
      var x = Math.round(p[0]), y = Math.round(p[1]), i = y * W + x;
      if (outside[i]) return B.toast('신발 안쪽을 눌러 주세요');
      if (boundary[i]) return;
      push(); st.ops.push({ type: 'fill', x: x, y: y, color: st.color }); rebuildPaint(); draw(); return;
    }
    if (st.tool === 'brush') { push(); cur = { type: 'stroke', color: st.color, size: st.bsize, pts: [p] }; st.ops.push(cur); rebuildPaint(); draw(); }
  });
  cv.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return; var p = pt(e); ptrs[e.pointerId] = p;
    var ids = Object.keys(ptrs), it = st.items[st.sel];
    if (drag && drag.pinch && ids.length === 2 && it) {
      var a = ptrs[ids[0]], b = ptrs[ids[1]];
      it.s = Math.max(0.05, drag.s0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / drag.d0);
      it.r = drag.r0 + (Math.atan2(b[1] - a[1], b[0] - a[0]) - drag.a0) * 180 / Math.PI; draw(); return;
    }
    if (drag && it && !drag.pinch) { it.x = p[0] - drag.dx; it.y = p[1] - drag.dy; draw(); return; }
    if (cur) { cur.pts.push(p); var g = paintCv.getContext('2d'); strokeOn(g, { color: cur.color, size: cur.size, pts: cur.pts.slice(-2) }); if (!st.photo) { g.globalCompositeOperation = 'destination-in'; g.drawImage(insideCv, 0, 0); g.globalCompositeOperation = 'source-over'; } draw(); }
  });
  function up(e) { delete ptrs[e.pointerId]; if (!Object.keys(ptrs).length) { drag = null; if (cur) { cur = null; rebuildPaint(); draw(); } syncSel(); } }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  window.addEventListener('beforeunload', function (e) { if (dirtyFlag && !sent) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- 견적·저장·견적 받기 (11/11 회장) ---------- */
  var sent = false, pendingLoad = null;
  function src() { var b = $('#q-src .on'); return b ? b.getAttribute('data-v') : 'new'; }
  $$('#q-src button').forEach(function (b) { b.onclick = function () { $$('#q-src button').forEach(function (x) { x.classList.toggle('on', x === b); }); quote(); }; });
  function counts() {
    var regions = {}, fills = 0, strokes = 0;
    st.ops.forEach(function (op) { if (op.type === 'fill') { fills++; regions[op.x + ',' + op.y] = 1; } else strokes++; });
    return { fills: fills, strokes: strokes, imgs: st.items.filter(function (i) { return i.type === 'img'; }).length, texts: st.items.filter(function (i) { return i.type === 'text'; }).length };
  }
  function paintEstimate() {
    var Q = S.QUOTE || {}, c = counts(), sum = 0, rows = [];
    if (c.fills) { var t = (Q.fill_tiers || []).filter(function (x) { return c.fills <= x[0]; })[0]; if (t) { sum += t[1]; rows.push(['색 칠하기 ' + c.fills + '칸', t[1]]); } }
    if (c.strokes && Q.brush) { sum += Q.brush; rows.push(['붓으로 그리기', Q.brush]); }
    if (c.imgs && Q.image_each) { sum += c.imgs * Q.image_each; rows.push(['그림 ' + c.imgs + '개', c.imgs * Q.image_each]); }
    if (c.texts && Q.text_each) { sum += c.texts * Q.text_each; rows.push(['글자 ' + c.texts + '개', c.texts * Q.text_each]); }
    return { sum: sum, rows: rows };
  }
  function r1000(n) { return Math.round(n / 1000) * 1000; }
  function quote() {
    var box = $('#q-box'); if (!box) return;
    var Q = S.QUOTE || {}, m = modelById(st.model), shoe = (src() === 'new' && m && !st.photo) ? m.colors[st.color0].price : 0, pe = paintEstimate();
    var h = '';
    if (src() === 'new') h += '<div class="qr"><span>' + (m && !st.photo ? label() : '새 신발') + '</span><span>' + (shoe ? won(shoe) : '작가가 확인') + '</span></div>';
    else h += '<div class="qr"><span>내 신발</span><span>신발값 없음</span></div>';
    if (Q.approved) {
      pe.rows.forEach(function (r) { h += '<div class="qr"><span>' + r[0] + '</span><span>' + won(r[1]) + '</span></div>'; });
      if (!pe.rows.length) h += '<div class="qr"><span>그림 비용</span><span>꾸미면 계산돼요</span></div>';
      var lo = r1000((shoe + pe.sum * (Q.range || [1, 1])[0])), hi = r1000(shoe + pe.sum * (Q.range || [1, 1])[1]);
      h += '<div class="qr qt"><span>대략적인 견적</span><span>' + (pe.sum ? won(lo) + ' ~ ' + won(hi) : won(shoe)) + '</span></div>';
    } else {
      h += '<div class="qr"><span>그림 비용</span><span>작가가 확인 후 안내</span></div>';
    }
    h += '<p class="qn">' + (Q.note || '대략적인 견적이에요. 작가가 확인한 뒤 실제 견적은 조금 다를 수 있어요.') + (src() === 'mine' && Q.mine_note ? ' ' + Q.mine_note : '') + '</p>';
    box.innerHTML = h;
  }
  function stateOf() {
    return { model: st.model, color0: st.color0, base: st.base,
      ops: st.ops.map(function (o) { var c = Object.assign({}, o); delete c._m; return c; }),
      items: st.items.map(function (it) { var c = Object.assign({}, it); if (it.type === 'img') { c.src = it.img.toDataURL('image/jpeg', 0.8); delete c.img; } return c; }) };
  }
  function applySaved(d) {
    var s0 = d.state || {}; st.ops = s0.ops || []; st.items = [];
    var waits = (s0.items || []).map(function (it) {
      return new Promise(function (res) {
        if (it.type !== 'img') { st.items.push(it); return res(); }
        var im = new Image(); im.onload = function () { var c = document.createElement('canvas'); c.width = it.w; c.height = it.h; c.getContext('2d').drawImage(im, 0, 0, it.w, it.h); var x = Object.assign({}, it); delete x.src; x.img = c; st.items.push(x); res(); }; im.onerror = res; im.src = it.src;
      });
    });
    Promise.all(waits).then(function () { st.sel = -1; rebuildPaint(); draw(); syncSel(); quote(); dirtyFlag = false; editingId = d.id; });
  }
  var editingId = null;
  function designs() { try { return JSON.parse(localStorage.getItem('bium_studio') || '[]'); } catch (e) { return []; } }
  function saveDesign() {
    if (!st.base) return B.toast('먼저 신발을 골라 주세요');
    var u = B.user();
    var item = { id: editingId || ('d' + Date.now().toString(36)), at: new Date().toISOString(), model: label(), src: src(), thumb: exportUrl(640, 0.78), state: stateOf() };
    if (!u || !u.email) {
      try { sessionStorage.setItem('bium_studio_pending', JSON.stringify(item)); } catch (e) {}
      B.toast('로그인하면 내 스튜디오에 저장돼요');
      setTimeout(function () { location.href = 'account.html?next=studio'; }, 900); return;
    }
    var list = designs().filter(function (x) { return x.id !== item.id; }); list.unshift(item);
    for (var n = list.length; n > 0; n--) {
      try { localStorage.setItem('bium_studio', JSON.stringify(list.slice(0, n))); editingId = item.id; dirtyFlag = false; B.toast('내 스튜디오에 저장했어요'); return; }
      catch (e) { if (n === 1) { item.state.items = item.state.items.filter(function (i) { return i.type !== 'img'; }); try { localStorage.setItem('bium_studio', JSON.stringify([item])); B.toast('저장했어요(올린 사진은 용량 때문에 빠졌어요)'); } catch (e2) { B.toast('저장 공간이 꽉 찼어요. 내 스튜디오에서 안 쓰는 디자인을 지워 주세요'); } return; } }
    }
  }
  $('#q-save').onclick = saveDesign;
  /* 견적 받기: 작가에게 디자인 그림과 함께 보냄 */
  $('#o-size').innerHTML = '<option value="">사이즈를 골라 주세요</option>' + (S.SIZES || []).map(function (s) { return '<option>' + s + '</option>'; }).join('');
  (function () { var u = B.user(); if (u) { $('#o-name').value = u.name || ''; $('#o-phone').value = u.phone || ''; } })();
  $('#of').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = { size: $('#o-size').value, name: $('#o-name').value.trim(), phone: $('#o-phone').value.trim(), memo: $('#o-memo').value.trim(), src: src() };
    var ok = true;
    function chk(id, bad, msg) { $('#e-' + id).textContent = bad ? msg : ''; if (bad) ok = false; }
    chk('size', !v.size, '사이즈를 골라 주세요.');
    chk('name', !v.name, '이름을 적어 주세요.');
    chk('phone', !/^01[0-9]-?\d{3,4}-?\d{4}$/.test(v.phone), '010-0000-0000 형식으로 적어 주세요.');
    chk('agree', !$('#o-agree').checked, '동의에 체크해 주세요.');
    if (!st.base) { B.toast('신발을 먼저 골라 꾸며 주세요'); ok = false; }
    if (!ok) return;
    var design = exportUrl(1000, 0.82), pe = paintEstimate(), m = modelById(st.model);
    var shape = st.photo ? '내 신발 사진' : label();
    var text = ['[BIUM 스튜디오 견적 요청]', '신발: ' + shape + ' / ' + (v.src === 'mine' ? '내 신발 보내기' : '새 신발(작가가 준비)'), '사이즈: ' + v.size, '꾸밈: ' + (pe.rows.map(function (r) { return r[0]; }).join(', ') || '없음'), '이름: ' + v.name, '연락처: ' + v.phone, '요청: ' + (v.memo || '-')].join('\n');
    $('#o-send').disabled = true; $('#o-send').textContent = '보내는 중…';
    B.send('apply', { type: 'studio', product_id: '', shoe_model: shape, base: st.model || st.base, shoe_source: v.src, size: v.size, name: v.name, phone: v.phone, message: v.memo, design_image: design, est_paint: pe.sum, est_shoe: (v.src === 'new' && m && !st.photo) ? m.colors[st.color0].price : 0, agree_required: true, website: '' }, text, function (r) {
      sent = true;
      $('#of').hidden = true; $('#o-done').hidden = false;
      $('#o-done').innerHTML = r.via === 'server'
        ? '<span class="lbl">Received</span><h3>견적 요청이 접수됐어요</h3><p>디자인 그림까지 받았어요. 작가가 확인하고 실제 견적과 일정을 연락드릴게요.</p>'
        : '<span class="lbl">One more step</span><h3>카카오톡으로 보내 주세요</h3><p>' + (r.copied ? '요청서를 복사했어요.' : '아래 요청서를 길게 눌러 복사해 주세요.') + ' 카카오톡 채팅창에 붙여 넣고, 저장한 디자인 그림도 같이 보내 주세요.</p><a class="btn wide" href="' + B.KAKAO + '" target="_blank" rel="noopener">카카오톡 열기</a>';
    });
  });

  /* 링크로 들어온 모델·모양 (예: studio.html?model=에어포스1) */
  var q = new URLSearchParams(location.search);
  (function hdr() { var t = document.querySelector('header.top'); if (t) document.documentElement.style.setProperty('--hdr', Math.round(t.getBoundingClientRect().height) + 'px'); })();
  setTool('fill'); syncUndo(); draw();
  var pend = null; try { pend = JSON.parse(sessionStorage.getItem('bium_studio_pending') || 'null'); } catch (e) {}
  var openId = q.get('d'), saved = openId ? designs().filter(function (x) { return x.id === openId; })[0] : null;
  if (!saved && pend && q.get('resume') === '1') { saved = pend; try { sessionStorage.removeItem('bium_studio_pending'); } catch (e) {} }
  if (saved && saved.state && saved.state.model) { pendingLoad = saved; pickModel(saved.state.model, saved.state.color0); if (q.get('resume') === '1') setTimeout(saveDesign, 1200); }
  else if (q.get('model')) { var mq = q.get('model'), hit = MATCH.filter(function (m) { return m[0].test(mq); })[0]; pickModel(hit ? hit[1] : 'af1'); if (!hit) $('#model-note').textContent = '"' + mq + '"은 아직 고를 수 없어서 에어포스1로 열었어요. 다른 신발은 위에서 바꾸거나 "내 신발 사진으로 하기"를 써 주세요.'; }
  else pickModel(q.get('m') || 'af1');
  dirtyFlag = false;
})();
