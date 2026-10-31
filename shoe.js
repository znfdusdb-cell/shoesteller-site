// 슈즈텔러 신발 그림판 — 흰 캔버스 운동화 한 켤레(옆모습)를 SVG로 그린다.
// 첫 화면 미리보기, 스튜디오(내 디자인 만들기), 숍(색 조합) 셋이 같은 그림을 쓴다. 외부 라이브러리 없음.
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  // 부위 — 순서가 곧 그려지는 순서(아래부터). name은 화면에 보이는 이름.
  var PARTS = [
    { id: 'sole',    name: '밑창',    d: 'M28 296C28 276 50 270 90 272L540 272C590 272 614 278 614 296L614 306C614 322 594 332 560 332L82 332C50 332 28 318 28 304Z', def: '#f3f0e8' },
    { id: 'quarter', name: '옆면',    d: 'M300 136L452 96C486 86 524 88 550 100C590 118 608 186 608 262L300 262Z', def: '#ffffff' },
    { id: 'heel',    name: '뒤꿈치',  d: 'M548 100C590 118 608 186 608 262L560 262C560 200 554 148 536 104Z', def: '#ffffff' },
    { id: 'vamp',    name: '발등',    d: 'M172 212C214 206 240 196 262 160C270 148 282 140 300 136L300 262L172 262Z', def: '#ffffff' },
    { id: 'toecap',  name: '앞코',    d: 'M58 262C54 236 84 214 128 208C146 206 160 208 172 212L172 262Z', def: '#ffffff' },
    { id: 'tongue',  name: '혀',      d: 'M290 142C330 96 420 70 476 72C478 84 474 96 468 104C410 110 350 128 304 164Z', def: '#ffffff' },
    { id: 'collar',  name: '발목',    d: 'M450 98C486 86 524 88 550 100C532 114 488 118 456 118Z', def: '#ffffff' },
    { id: 'eyestay', name: '끈 자리', d: 'M290 140C340 120 400 106 456 96L466 116C410 126 352 140 304 162Z', def: '#ffffff' },
    { id: 'stripe',  name: '붓 자국', d: 'M176 236C260 234 350 214 430 186C486 166 536 154 590 152C560 174 510 194 440 216C360 242 270 258 182 256Z', def: 'transparent' },
    { id: 'laces',   name: '끈',      laces: true, def: '#ffffff' },
    { id: 'foxing',  name: '고무테',  d: 'M34 290C34 272 52 262 90 262L556 262C586 262 606 268 610 290Z', def: '#ffffff' },
    { id: 'bumper',  name: '앞코 고무', d: 'M40 288C36 256 56 232 92 226C118 222 140 232 148 250L148 262L96 262C92 274 90 282 90 288Z', def: '#ffffff' }
  ];
  var EYELETS = [[312, 146], [340, 136], [368, 127], [396, 118], [424, 110], [450, 104]];
  var PART_BY_ID = {};
  PARTS.forEach(function (p) { PART_BY_ID[p.id] = p; });

  // 패턴 — 기본색 위에 두 번째 색으로 찍는다.
  var PATTERNS = {
    none:    { name: '없음' },
    dots:    { name: '물방울', w: 22, h: 22, draw: function (g, c) { circ(g, 11, 11, 4.5, c); } },
    stripes: { name: '줄무늬', w: 20, h: 20, draw: function (g, c) { rect(g, 0, 0, 20, 7, c); } },
    check:   { name: '체크',   w: 28, h: 28, draw: function (g, c) { rect(g, 0, 0, 14, 14, c); rect(g, 14, 14, 14, 14, c); } },
    splash:  { name: '물감 튐', w: 60, h: 60, draw: function (g, c) { [[8,12,3],[30,8,5],[50,22,2.5],[18,40,6],[44,48,3.5],[56,38,2],[6,54,2.5],[36,30,2]].forEach(function (p) { circ(g, p[0], p[1], p[2], c); }); } },
    grid:    { name: '격자',   w: 24, h: 24, draw: function (g, c) { rect(g, 0, 0, 24, 2, c); rect(g, 0, 0, 2, 24, c); } }
  };

  // 물감 — 슈즈텔러 팔레트(화면 어디서나 같은 색)
  var PAINT = [
    ['#ffffff', '화이트'], ['#111111', '블랙'], ['#e4322b', '레드'], ['#1f4fd8', '코발트'], ['#f2c400', '옐로'], ['#1f8a4c', '그린'],
    ['#ff7a1a', '오렌지'], ['#ff8fb1', '핑크'], ['#7b5cff', '바이올렛'], ['#7fd8ff', '스카이'], ['#8b5a2b', '브라운'], ['#c9c2b4', '샌드'],
    ['#2b2f6b', '네이비'], ['#9be37a', '라임'], ['#ffd1dc', '베이비핑크'], ['#6b6b6b', '그레이']
  ];

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function circ(g, cx, cy, r, c) { el('circle', { cx: cx, cy: cy, r: r, fill: c }, g); }
  function rect(g, x, y, w, h, c) { el('rect', { x: x, y: y, width: w, height: h, fill: c }, g); }

  function defaultState() {
    var parts = {};
    PARTS.forEach(function (p) { parts[p.id] = { color: p.def, pattern: 'none', pcolor: '#111111' }; });
    return { parts: parts, texts: [], stickers: [] };
  }

  // state → <svg> 채우기. svg는 비어 있어도 되고, 있으면 다시 그린다. uid는 패턴 id 충돌 방지.
  function render(svg, state, uid) {
    uid = uid || 's';
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', '0 0 640 360');
    var defs = el('defs', {}, svg);
    // 그림자
    var f = el('filter', { id: uid + '-shadow', x: '-10%', y: '-10%', width: '120%', height: '140%' }, defs);
    el('feDropShadow', { dx: 0, dy: 14, stdDeviation: 10, 'flood-color': '#000', 'flood-opacity': 0.14 }, f);
    var clip = el('clipPath', { id: uid + '-upper' }, defs);
    // 붓 자국·글자·스티커는 갑피 밖으로 나가지 않게
    el('path', { d: 'M58 262C54 236 84 214 128 208C190 200 230 190 262 160C270 148 282 140 300 136L452 96C486 86 524 88 550 100C590 118 608 186 608 262Z' }, clip);

    var body = el('g', { filter: 'url(#' + uid + '-shadow)' }, svg);
    PARTS.forEach(function (p) {
      var st = state.parts[p.id] || { color: p.def, pattern: 'none' };
      var fill = st.color;
      if (st.pattern && st.pattern !== 'none' && PATTERNS[st.pattern]) {
        var pt = PATTERNS[st.pattern], pid = uid + '-pat-' + p.id;
        var pat = el('pattern', { id: pid, width: pt.w, height: pt.h, patternUnits: 'userSpaceOnUse' }, defs);
        rect(pat, 0, 0, pt.w, pt.h, st.color === 'transparent' ? 'none' : st.color);
        pt.draw(pat, st.pcolor || '#111');
        fill = 'url(#' + pid + ')';
      }
      if (p.laces) {
        var lg = el('g', { 'data-part': 'laces' }, body);
        EYELETS.slice(0, 5).forEach(function (e) {
          var cx = e[0] - 9, cy = e[1] - 14;   // 끈이 혀 위로 넘어가는 방향(왼쪽 위)
          el('rect', { x: cx - 17, y: cy - 4.5, width: 34, height: 9, rx: 4.5, fill: fill === 'transparent' ? '#fff' : fill, stroke: '#141414', 'stroke-width': 1.4,
            transform: 'rotate(-58 ' + cx + ' ' + cy + ')', 'data-part': 'laces' }, lg);
        });
        return;
      }
      var attrs = { d: p.d, fill: fill, 'data-part': p.id, stroke: '#141414', 'stroke-width': 2, 'stroke-linejoin': 'round' };
      if (p.id === 'stripe') { attrs.stroke = 'none'; attrs['clip-path'] = 'url(#' + uid + '-upper)'; if (fill === 'transparent') attrs.fill = 'none'; }
      el('path', attrs, body);
    });
    // 끈 구멍·뒤꿈치 선
    EYELETS.forEach(function (c) { el('circle', { cx: c[0], cy: c[1], r: 2.6, fill: '#141414', opacity: 0.7 }, body); });
    el('path', { d: 'M566 124C586 148 598 182 602 222', fill: 'none', stroke: '#141414', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.4 }, body);
    el('path', { d: 'M46 300C70 294 110 292 150 292', fill: 'none', stroke: '#141414', 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.35 }, body);

    var deco = el('g', { 'clip-path': 'url(#' + uid + '-upper)', 'data-layer': 'deco' }, svg);
    (state.stickers || []).forEach(function (s, i) {
      var g = el('g', { transform: 'translate(' + s.x + ' ' + s.y + ') rotate(' + (s.rot || 0) + ') scale(' + (s.s || 1) + ')', 'data-sticker': i, cursor: 'move' }, deco);
      if (s.src) el('image', { href: s.src, x: -40, y: -40, width: 80, height: 80, preserveAspectRatio: 'xMidYMid meet' }, g);
      else if (STICKERS[s.kind]) STICKERS[s.kind](g, s.color || '#e4322b');
    });
    (state.texts || []).forEach(function (t, i) {
      var tx = el('text', { x: t.x, y: t.y, fill: t.color || '#111', 'font-size': t.size || 28, 'font-family': t.font || 'Black Han Sans, Noto Sans KR, sans-serif', 'font-weight': t.font ? 400 : 400,
        'text-anchor': 'middle', 'dominant-baseline': 'middle', transform: 'rotate(' + (t.rot || 0) + ' ' + t.x + ' ' + t.y + ')', 'data-text': i, cursor: 'move', 'paint-order': 'stroke', stroke: t.outline || 'none', 'stroke-width': 3 }, deco);
      tx.textContent = t.t || '';
    });
    return svg;
  }

  // 스티커 — 단순한 도형(브랜드·캐릭터 아님)
  var STICKERS = {
    star:   function (g, c) { el('path', { d: 'M0-34L10-10 36-8 17 8 23 34 0 20-23 34-17 8-36-8-10-10Z', fill: c }, g); },
    heart:  function (g, c) { el('path', { d: 'M0 30C-30 8-36-10-26-22-18-30-6-28 0-18 6-28 18-30 26-22 36-10 30 8 0 30Z', fill: c }, g); },
    bolt:   function (g, c) { el('path', { d: 'M8-36L-22 6H-2L-8 36 22-10H2Z', fill: c }, g); },
    flower: function (g, c) { for (var i = 0; i < 6; i++) el('ellipse', { cx: 0, cy: -18, rx: 10, ry: 18, fill: c, transform: 'rotate(' + (i * 60) + ')' }, g); el('circle', { cx: 0, cy: 0, r: 8, fill: '#f2c400' }, g); },
    smile:  function (g, c) { el('circle', { cx: 0, cy: 0, r: 30, fill: c }, g); el('circle', { cx: -10, cy: -8, r: 4, fill: '#111' }, g); el('circle', { cx: 10, cy: -8, r: 4, fill: '#111' }, g); el('path', { d: 'M-14 8Q0 22 14 8', fill: 'none', stroke: '#111', 'stroke-width': 4, 'stroke-linecap': 'round' }, g); },
    dot:    function (g, c) { el('circle', { cx: 0, cy: 0, r: 26, fill: c }, g); },
    wave:   function (g, c) { el('path', { d: 'M-40 0Q-30-20-20 0T0 0T20 0T40 0', fill: 'none', stroke: c, 'stroke-width': 8, 'stroke-linecap': 'round' }, g); },
    drip:   function (g, c) { el('path', { d: 'M-30-20H30V0C30 10 22 10 20 2 18 26 10 26 8 6 6 34-4 34-6 8-8 14-14 14-16 4-18 10-30 10-30 0Z', fill: c }, g); }
  };

  // 미리 만든 색 조합(숍·첫 화면)
  var COLORWAYS = {
    '첫 붓':   { toecap: '#e4322b', stripe: '#e4322b', laces: '#111111' },
    '코발트 밤': { quarter: '#1f4fd8', heel: '#1f4fd8', tongue: '#1f4fd8', sole: '#111111', stripe: '#f2c400' },
    '레몬':     { vamp: '#f2c400', toecap: '#f2c400', eyestay: '#111111', stripe: '#111111' },
    '체크 그린': { quarter: { color: '#ffffff', pattern: 'check', pcolor: '#1f8a4c' }, heel: '#1f8a4c', stripe: '#1f8a4c', laces: '#1f8a4c' },
    '물감 튐':  { vamp: { color: '#ffffff', pattern: 'splash', pcolor: '#e4322b' }, quarter: { color: '#ffffff', pattern: 'splash', pcolor: '#1f4fd8' }, toecap: '#111111', stripe: 'transparent' },
    '핑크 줄':  { quarter: { color: '#ffd1dc', pattern: 'stripes', pcolor: '#ff8fb1' }, vamp: '#ffd1dc', toecap: '#ffffff', stripe: '#7b5cff', sole: '#ffffff' }
  };

  function applyColorway(state, cw) {
    var s = JSON.parse(JSON.stringify(state));
    for (var k in cw) {
      var v = cw[k];
      if (typeof v === 'string') s.parts[k] = { color: v, pattern: 'none', pcolor: '#111111' };
      else s.parts[k] = { color: v.color, pattern: v.pattern || 'none', pcolor: v.pcolor || '#111111' };
    }
    return s;
  }

  // SVG → PNG 데이터 주소(저장·주문서 첨부용). 외부 이미지가 섞이면 실패할 수 있어 콜백에 null.
  function toPNG(svg, width, cb) {
    try {
      var clone = svg.cloneNode(true);
      clone.setAttribute('xmlns', NS); clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      var bg = document.createElementNS(NS, 'rect'); bg.setAttribute('width', 640); bg.setAttribute('height', 360); bg.setAttribute('fill', '#fff');
      clone.insertBefore(bg, clone.firstChild);
      var xml = new XMLSerializer().serializeToString(clone);
      var img = new Image();
      img.onload = function () {
        var c = document.createElement('canvas'); c.width = width || 1280; c.height = Math.round(c.width * 360 / 640);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        try { cb(c.toDataURL('image/png')); } catch (e) { cb(null); }
      };
      img.onerror = function () { cb(null); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    } catch (e) { cb(null); }
  }

  window.ShoeArt = { PARTS: PARTS, PART_BY_ID: PART_BY_ID, PATTERNS: PATTERNS, PAINT: PAINT, STICKERS: Object.keys(STICKERS), COLORWAYS: COLORWAYS,
    defaultState: defaultState, render: render, applyColorway: applyColorway, toPNG: toPNG };
})();
