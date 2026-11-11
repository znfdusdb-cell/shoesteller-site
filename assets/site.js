/* 슈즈텔러 공통: 헤더·푸터·장바구니·검색·로그인·언어·카카오 버튼. 모든 페이지가 이 파일 하나를 쓴다. */
(function () {
  'use strict';
  var S = window.SHOES;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var won = function (n) { return Number(n).toLocaleString('ko-KR') + '원'; };
  var byId = function (id) { return S.products.filter(function (p) { return p.id === id; })[0]; };

  /* 언어 */
  var LANG = store.get('bium_lang', 'ko');
  var T = S.TEXT || {};
  function t(k) { var v = T[k]; return v ? (LANG === 'en' ? v[1] : v[0]) : k; }
  function applyLang(root) {
    $$('[data-t]', root).forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    $$('[data-tp]', root).forEach(function (el) { el.setAttribute('placeholder', t(el.getAttribute('data-tp'))); });
    document.documentElement.lang = LANG;
  }
  function setLang(l) { LANG = l; store.set('bium_lang', l); applyLang(document); renderCart(); $$('.langbtn').forEach(function (b) { b.textContent = LANG === 'ko' ? 'EN' : 'KO'; });
  }
  function nameOf(p) { return LANG === 'en' && p.en ? p.en : p.name; }

  /* 신발 종류 선 그림 */
  var ICON = {
    low:    '<path d="M4 40H116"/><path d="M4 34V40M116 32V40"/><path d="M4 34C40 35.5 80 35 116 32"/><path d="M5 34C5 28 9 26 16 25L34 23C42 22 48 18 54 13L60 8C63 6 67 6 70 7L74 9C80 14 92 19 104 22C111 24 115 28 116 32"/><path d="M5 31C12 31 18 29 22 25"/><path d="M50 17C56 14 62 10 68 8"/><path d="M53 18L57 12M57 17L61 10.5M61 15.5L65 9"/><path d="M70 7C75 12 83 13 90 12"/><path d="M38 31C58 31 80 27 101 21"/><path d="M104 22C108 19 108 15 105 12"/>',
    court:  '<path d="M4 40H116"/><path d="M4 35V40M116 33V40"/><path d="M4 35C40 36 80 35.5 116 33"/><path d="M5 35C5 30 9 28 17 27L36 25C44 24 50 20 56 15L62 10C65 8 69 8 72 9L76 11C82 16 94 20 106 23C112 25 115 29 116 33"/><path d="M5 32C13 32 19 30 24 27"/><path d="M52 19C58 16 64 12 70 10"/><path d="M55 20L59 14M59 19L63 12.5M63 17.5L67 11"/><path d="M42 30C54 32 66 30 76 22"/>',
    high:   '<path d="M4 40H116"/><path d="M4 34V40M116 32V40"/><path d="M4 34C40 35.5 80 35 116 32"/><path d="M5 34C5 28 9 26 16 25L32 23C40 21 46 17 50 12L54 3L78 2C79 10 83 16 92 19C104 23 114 26 116 32"/><path d="M5 31C12 31 18 29 22 25"/><path d="M47 16L54 3"/><path d="M50 17L56 15M51 13L57 11M53 9L59 7M54 5L60 4"/><circle cx="82" cy="12" r="3.2"/><path d="M100 24C104 20 104 16 100 14"/>',
    velcro: '<path d="M4 40H116"/><path d="M4 34V40M116 32V40"/><path d="M4 34C40 35.5 80 35 116 32"/><path d="M5 34C5 28 9 26 16 25L34 23C42 22 48 18 54 13L60 8C63 6 67 6 70 7L74 9C80 14 92 19 104 22C111 24 115 28 116 32"/><path d="M5 31C12 31 18 29 22 25"/><path d="M42 21L70 13L72 18L45 26Z"/><path d="M46 28L76 19L78 24L49 33Z"/><path d="M70 7C75 12 83 13 90 12"/>',
    slip:   '<path d="M4 40H116"/><path d="M4 34V40M116 32V40"/><path d="M4 34C40 35.5 80 35 116 32"/><path d="M5 34C5 28 9 26 16 25L40 22C50 20 58 16 64 14C70 13 76 14 82 16C92 19 108 22 116 32"/><path d="M5 31C12 31 18 29 22 25"/><path d="M60 15L64 22L68 14"/><path d="M64 14C72 17 82 18 92 19"/>',
    boot:   '<path d="M8 40H112"/><path d="M8 34V40M112 32V40"/><path d="M8 34C40 35.5 80 35 112 32"/><path d="M9 34C9 28 13 26 20 25L36 23C44 22 50 18 52 12L52 2H80V18C90 22 108 24 112 32"/><path d="M9 31C16 31 22 29 26 25"/><path d="M52 8H80"/><path d="M80 2C86 6 86 14 80 18"/>'
  };
  function icon(k) { return '<svg class="shoeicon" viewBox="0 0 120 44" aria-hidden="true">' + (ICON[k] || ICON.low) + '</svg>'; }
  function svgIcon(n) {
    if (n === 'user') return '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>';
    if (n === 'search') return '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
    if (n === 'bag') return '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
    if (n === 'menu') return '<svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>';
    if (n === 'x') return '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>';
    if (n === 'right') return '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
    if (n === 'left') return '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
    if (n === 'yt') return '<svg viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor"/></svg>';
    if (n === 'n') return '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8.5 16V8l7 8V8"/></svg>';
    if (n === 'i') return '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 10.5V16M12 7.6v.4"/></svg>';
    if (n === 'chat') return '<svg viewBox="0 0 24 24"><path d="M12 4C7 4 3 7.1 3 11c0 2.4 1.6 4.6 4 5.9L6.3 20l3.9-2.2c.6.1 1.2.2 1.8.2 5 0 9-3.1 9-7s-4-7-9-7z"/></svg>';
    if (n === 'kakao') return '<svg viewBox="0 0 24 24" fill="#191919"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.8 5.2 4.6 6.6L5.5 21l4.4-2.8c.7.1 1.4.2 2.1.2 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>';
    return '';
  }

  /* 헤더 — 메이슨 구조: 흰 바탕, 데스크톱 로고|메뉴|아이콘, 모바일 메뉴|로고|검색·가방 */
  var LINE = function (k) { return '<img class="lineart" src="assets/line/' + k + '.png" alt="">'; };
  var nm = function (x) { return LANG === 'en' ? x.en : x.ko; };
  var shoeCell = function (href, k, name) { return '<a class="mcell" href="' + href + '">' + LINE(k) + '<span>' + name + '</span></a>'; };
  var headerHtml =
    '<a class="skip" href="#main">본문으로 건너뛰기</a>' +
    '<header class="top"><div class="bar">' +
      '<div class="left"><button class="ico" type="button" aria-label="메뉴 열기" id="open-menu">' + svgIcon('menu') + '</button></div>' +
      '<a class="brand" href="index.html" aria-label="BIUM 처음으로"><img src="assets/brand/logo-black-160.png" alt=""><span class="wordmark">BIUM</span></a>' +
      '<ul class="menu">' +
        '<li><a href="shop.html">Custom</a><div class="mega"><div class="mega-in">' +
          '<div class="mlinks"><a href="shop.html"><b data-t="nav.all"></b></a><a href="shop.html" data-t="nav.new"></a><a href="index.html#looks" data-t="nav.lookbook"></a><hr>' +
            S.categories.map(function (c) { return '<a href="shop.html?cat=' + c.id + '">' + nm(c) + '</a>'; }).join('') + '<hr>' +
            '<a href="studio.html" data-t="studio.btn"></a><a href="book.html?type=order" data-t="foot.5"></a></div>' +
          '<div class="mgrp"><span class="mlbl" data-t="nav.base"></span><div class="mgrid c4">' + S.bases.map(function (b) { return shoeCell('shop.html?base=' + b.id, b.id, nm(b)); }).join('') + '</div></div>' +
          '<div class="mgrp"><span class="mlbl" data-t="nav.bystory"></span><div class="mgrid c3">' + S.categories.map(function (c) { return shoeCell('shop.html?cat=' + c.id, c.id, nm(c)); }).join('') + '</div></div>' +
        '</div></div></li>' +
        '<li><a href="studio.html">Studio</a></li>' +
        '<li><a href="class.html">Class</a><div class="mega"><div class="mega-in"><div class="mlinks"><a href="class.html#workshop" data-t="nav.c1"></a><a href="class.html#kit" data-t="nav.c2"></a><a href="class.html#online" data-t="nav.c3"></a><hr><a href="book.html?type=class" data-t="nav.c4"></a></div>' +
          '<a class="mpic" href="class.html#workshop"><img src="assets/p01.jpg" alt="" loading="lazy"><span data-t="nav.c1"></span></a><a class="mpic" href="class.html#kit"><img src="assets/09.jpg" alt="" loading="lazy"><span data-t="nav.c2"></span></a></div></div></li>' +
        '<li><a href="index.html#story">Story</a><div class="mega"><div class="mega-in"><div class="mlinks"><a href="index.html#story" data-t="nav.s1"></a><a href="https://www.youtube.com/@bium4581" data-t="nav.s2"></a><a href="https://www.idus.com/v2/artist/d1af8d8a-c43f-4ac4-aa1c-aeb1a04ba6c2/product" data-t="nav.s3"></a><hr><a href="index.html#faq" data-t="nav.s4"></a></div>' +
          '<a class="mpic" href="https://www.youtube.com/@bium4581"><img src="assets/video/poster.jpg" alt="" loading="lazy"><span>YouTube</span></a><a class="mpic" href="index.html#story"><img src="assets/05.jpg" alt="" loading="lazy"><span data-t="nav.s1"></span></a></div></div></li>' +
      '</ul>' +
      '<div class="util">' +
        '<a class="tlink dt" href="book.html?type=order" data-t="util.consult"></a>' +
        '<button type="button" class="langbtn dt" id="lang-btn" aria-label="language">EN</button>' +
        '<button type="button" class="ico dt" id="login-btn" aria-label="로그인">' + svgIcon('user') + '</button>' +
        '<button type="button" class="ico" id="search-btn" aria-label="검색">' + svgIcon('search') + '</button>' +
        '<button type="button" class="ico" id="cart-btn" aria-label="장바구니">' + svgIcon('bag') + '<span class="count" id="cart-count"></span></button>' +
      '</div></div></header>' +
    /* 모바일 메뉴: 전면, 대문자 항목 + 아래 계정·검색·가방 (메이슨) */
    '<div class="sheet full" id="menu-sheet"><div class="panel left drawer"><div class="dhead"><button class="ico" type="button" data-close="menu-sheet" aria-label="닫기">' + svgIcon('x') + '</button><a class="brand" href="index.html"><img src="assets/brand/logo-black-160.png" alt=""><span class="wordmark">BIUM</span></a><span></span></div>' +
      '<div class="body">' +
        '<div class="dpanel" id="dp-root">' +
          '<button type="button" class="drow nav" data-go="dp-custom"><span>Custom</span><i>' + svgIcon('right') + '</i></button>' +
          '<a class="drow nav" href="studio.html"><span>Studio</span></a>' +
          '<button type="button" class="drow nav" data-go="dp-class"><span>Class</span><i>' + svgIcon('right') + '</i></button>' +
          '<button type="button" class="drow nav" data-go="dp-story"><span>Story</span><i>' + svgIcon('right') + '</i></button>' +
          '<a class="drow nav" href="index.html#looks"><span>Lookbook</span></a>' +
        '</div>' +
        '<div class="dpanel" id="dp-custom" hidden><button type="button" class="dback" data-go="dp-root">' + svgIcon('left') + '<span>Custom</span></button>' +
          '<a class="dlink" href="shop.html" data-t="nav.all"></a><a class="dlink" href="shop.html" data-t="nav.new"></a>' +
          '<span class="mlbl" data-t="nav.bystory"></span><div class="mgrid c3">' + S.categories.map(function (c) { return shoeCell('shop.html?cat=' + c.id, c.id, nm(c)); }).join('') + '</div>' +
          '<span class="mlbl" data-t="nav.base"></span><div class="mgrid c3">' + S.bases.map(function (b) { return shoeCell('shop.html?base=' + b.id, b.id, nm(b)); }).join('') + '</div>' +
        '</div>' +
        '<div class="dpanel" id="dp-class" hidden><button type="button" class="dback" data-go="dp-root">' + svgIcon('left') + '<span>Class</span></button>' +
          '<a class="dlink" href="class.html#workshop" data-t="nav.c1"></a><a class="dlink" href="class.html#kit" data-t="nav.c2"></a><a class="dlink" href="class.html#online" data-t="nav.c3"></a><a class="dlink" href="book.html?type=class" data-t="nav.c4"></a>' +
        '</div>' +
        '<div class="dpanel" id="dp-story" hidden><button type="button" class="dback" data-go="dp-root">' + svgIcon('left') + '<span>Story</span></button>' +
          '<a class="dlink" href="index.html#story" data-t="nav.s1"></a><a class="dlink" href="https://www.youtube.com/@bium4581" data-t="nav.s2"></a><a class="dlink" href="https://www.idus.com/v2/artist/d1af8d8a-c43f-4ac4-aa1c-aeb1a04ba6c2/product" data-t="nav.s3"></a><a class="dlink" href="index.html#faq" data-t="nav.s4"></a>' +
        '</div>' +
      '</div>' +
      '<div class="dfoot"><a class="dutil" href="account.html">' + svgIcon('user') + '<span>Account</span></a><button type="button" class="dutil" id="search-btn-m">' + svgIcon('search') + '<span>Search</span></button><button type="button" class="dutil" id="cart-btn-m">' + svgIcon('bag') + '<span>Cart</span></button>' +
        '<div class="dlang"><button type="button" class="langbtn" id="lang-btn-m">EN</button><a href="' + S.KAKAO + '" target="_blank" rel="noopener" data-t="foot.8"></a></div></div></div></div>' +
    /* 장바구니 */
    '<div class="sheet" id="cart-sheet"><div class="panel cartp"><div class="head"><b data-t="cart.h"></b><button class="ico" type="button" data-close="cart-sheet" aria-label="닫기">' + svgIcon('x') + '</button></div><div class="body" id="cart-body"></div><div class="foot"><a class="btn wide" href="checkout.html" id="cart-go"><span data-t="cart.go"></span> · <span class="price" id="cart-total">0원</span></a><button class="ulink" type="button" data-close="cart-sheet" data-t="cart.cont"></button></div></div></div>' +
    /* 빠른 담기·룩 */
    '<div class="sheet" id="look-sheet"><div class="qa"><div class="head"><b>Shop the look</b><button class="close" type="button" data-close="look-sheet" aria-label="닫기">✕</button></div><div class="qa-body" id="look-body"></div></div></div>' +
    '<div class="sheet" id="qa-sheet"><div class="qa"><div class="head"><b data-t="qa.h"></b><button class="close" type="button" data-close="qa-sheet" aria-label="닫기">✕</button></div><div class="qa-body" id="qa-body"></div></div></div>' +
    /* 검색 */
    '<div class="sheet" id="search-sheet"><div class="search-box"><form id="search-form" role="search"><input id="search-input" type="search" data-tp="search.ph" autocomplete="off"><button class="ico" type="button" data-close="search-sheet" aria-label="닫기">' + svgIcon('x') + '</button></form><div class="hits" id="search-hits"></div><p class="none" id="search-none" hidden data-t="search.none"></p></div></div>' +
    '<div class="modal" id="login-modal"><form class="box" id="login-form"><b class="lbl" data-t="login.h"></b><p class="note" data-t="login.p"></p><label><span data-t="login.name"></span><input id="login-name" required autocomplete="name"></label><label><span data-t="login.email"></span><input id="login-email" type="email" required autocomplete="email"></label><button class="btn" type="submit" data-t="login.btn"></button><button class="btn line" type="button" data-close="login-modal">CLOSE</button></form></div>' +
    '<div class="toast" id="toast"></div>' +
    '<a class="kakao" href="' + S.KAKAO + '" target="_blank" rel="noopener" aria-label="카카오톡 문의">' + svgIcon('kakao') + '</a>';
  /* 꼬리말 — 메이슨: 소식 받기 | 회사 | 고객 | 약관, 아이콘, 로고·저작권·결제 */
  /* 사업자 정보(전자상거래법 표시 사항): products.js의 BIZ. 빈 칸은 안 보인다 */
  function bizHtml() {
    var Z = S.BIZ || {}, row = [['상호', Z.name], ['대표', Z.owner], ['사업자등록번호', Z.reg_no], ['통신판매업신고', Z.mail_order_no], ['주소', Z.address], ['전화', Z.tel], ['이메일', Z.email]]
      .filter(function (r) { return r[1]; }).map(function (r) { return '<span>' + r[0] + ' ' + r[1] + '</span>'; });
    return row.length ? '<p class="biz">' + row.join('') + (Z.reg_no ? '<a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=' + Z.reg_no.replace(/\D/g, '') + '" target="_blank" rel="noopener">사업자정보확인</a>' : '') + '</p>' : '';
  }
  var footerHtml =
    '<footer><div class="fwrap"><div class="cols">' +
      '<div class="fnews"><span class="flbl">BIUM</span><p>손으로 그리는 커스텀 신발, 슈즈텔러 비움.</p>' +
        '<div class="social"><a href="https://www.youtube.com/@bium4581" aria-label="YouTube">' + svgIcon('yt') + '</a><a href="https://smartstore.naver.com/bium4581" aria-label="스마트스토어">' + svgIcon('n') + '</a><a href="https://www.idus.com/v2/artist/d1af8d8a-c43f-4ac4-aa1c-aeb1a04ba6c2/product" aria-label="아이디어스">' + svgIcon('i') + '</a><a href="' + S.KAKAO + '" aria-label="카카오톡">' + svgIcon('chat') + '</a></div></div>' +
      '<div><span class="flbl" data-t="foot.company"></span><ul><li><a href="index.html#story" data-t="foot.1"></a></li><li><a href="https://www.youtube.com/@bium4581" data-t="foot.2"></a></li><li><a href="class.html" data-t="foot.3"></a></li><li><a href="studio.html" data-t="nav.studio"></a></li><li><a href="https://www.idus.com/v2/artist/d1af8d8a-c43f-4ac4-aa1c-aeb1a04ba6c2/product" data-t="foot.4"></a></li></ul></div>' +
      '<div><span class="flbl" data-t="foot.cs"></span><ul><li><a href="book.html?type=order" data-t="foot.5"></a></li><li><a href="book.html?type=class" data-t="foot.6"></a></li><li><a href="index.html#faq" data-t="foot.7"></a></li><li><a href="' + S.KAKAO + '" data-t="foot.8"></a></li></ul></div>' +
      '<div><span class="flbl" data-t="foot.terms"></span><ul><li><a href="privacy.html" data-t="foot.9"></a></li><li><a href="terms.html" data-t="foot.10"></a></li></ul></div>' +
    '</div><div class="bottom"><a class="brand" href="index.html"><img src="assets/brand/logo-black-160.png" alt=""><span class="wordmark">BIUM</span></a><span class="copy">© 2026 Custom BIUM · Shoesteller — Hand-painted in Seoul</span><span class="pays"><i>N Pay</i><i>계좌이체</i></span></div>' + bizHtml() + '</div></footer>';
  document.body.insertAdjacentHTML('afterbegin', headerHtml);
  document.body.insertAdjacentHTML('beforeend', footerHtml);

  /* 시트 열고 닫기 */
  function open(id) { $('#' + id).classList.add('open'); document.body.classList.add('lock'); }
  function close(id) { $('#' + id).classList.remove('open'); document.body.classList.remove('lock'); }
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', function () { close(b.getAttribute('data-close')); }); });
  $$('.sheet').forEach(function (s) { s.addEventListener('click', function (e) { if (e.target === s) close(s.id); }); });
  $('#login-modal').addEventListener('click', function (e) { if (e.target.id === 'login-modal') close('login-modal'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { $$('.sheet.open, .modal.open').forEach(function (s) { close(s.id); }); } });
  $('#open-menu').addEventListener('click', function () { dgo('dp-root'); open('menu-sheet'); });
  function dgo(id) { $$('.dpanel').forEach(function (p) { p.hidden = p.id !== id; }); }
  $$('[data-go]').forEach(function (b) { b.addEventListener('click', function () { dgo(b.getAttribute('data-go')); }); });
  $('#lang-btn-m').addEventListener('click', function () { setLang(LANG === 'ko' ? 'en' : 'ko'); });
  $('#search-btn-m').addEventListener('click', function () { close('menu-sheet'); $('#search-btn').click(); });
  $('#cart-btn-m').addEventListener('click', function () { close('menu-sheet'); $('#cart-btn').click(); });
  $$('#menu-sheet a').forEach(function (a) { a.addEventListener('click', function () { close('menu-sheet'); }); });
  $('#lang-btn').addEventListener('click', function () { setLang(LANG === 'ko' ? 'en' : 'ko'); });

  /* 장바구니 */
  var cart = store.get('bium_cart', []);
  function saveCart() { store.set('bium_cart', cart); renderCart(); }
  function addToCart(id, size, qty) {
    var p = byId(id); if (!p || !size) return;
    var hit = cart.filter(function (c) { return c.id === id && c.size === size; })[0];
    if (hit) hit.qty += (qty || 1); else cart.push({ id: id, size: size, qty: qty || 1 });
    saveCart(); toast(t('cart.added') + ' · ' + nameOf(p) + ' ' + size);
  }
  function cartTotal() { return cart.reduce(function (s, c) { var p = byId(c.id); return s + (p ? p.price * c.qty : 0); }, 0); }
  function renderCart() {
    var body = $('#cart-body'), n = cart.reduce(function (s, c) { return s + c.qty; }, 0);
    $('#cart-count').textContent = n ? String(n) : '';
    $('#cart-total').textContent = won(cartTotal());
    $('#cart-go').toggleAttribute('disabled', !cart.length);
    if (!cart.length) { body.innerHTML = '<p class="empty">' + t('cart.empty') + '</p>'; return; }
    body.innerHTML = cart.map(function (c, i) {
      var p = byId(c.id); if (!p) return '';
      return '<div class="cart-item"><a href="product.html?id=' + p.id + '"><img src="' + p.photos[0] + '" alt=""' + posAttr(p, 0) + '></a><div><b>' + nameOf(p) + '</b><span class="price">' + won(p.price * c.qty) + '</span><span class="meta">' + t('cart.size') + ': ' + c.size + '</span><div class="qrow"><div class="qty"><button type="button" data-q="-1" data-i="' + i + '" aria-label="빼기">−</button><span>' + c.qty + '</span><button type="button" data-q="1" data-i="' + i + '" aria-label="더하기">+</button></div><button class="rm" type="button" data-rm="' + i + '" data-t="cart.rm"></button></div></div></div>';
    }).join('');
    applyLang(body);
    $$('[data-q]', body).forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-i'); cart[i].qty = Math.max(1, cart[i].qty + (+b.getAttribute('data-q'))); saveCart(); }); });
    $$('[data-rm]', body).forEach(function (b) { b.addEventListener('click', function () { cart.splice(+b.getAttribute('data-rm'), 1); saveCart(); }); });
  }
  $('#cart-btn').addEventListener('click', function () { renderCart(); open('cart-sheet'); });
  var toastTimer;
  function toast(msg) { var el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('on'); }, 1800); }

  /* 상품 카드 */
  /* 사진 중심 위치: products.js의 pos[사진 순서] = 가로 0(왼쪽)~100(오른쪽). 꽉 채우기일 때 그림이 잘리지 않게 */
  function posAttr(p, i) { var v = p.pos && p.pos[i]; return (p.fit !== 'contain' && typeof v === 'number') ? ' style="object-position:' + v + '% 50%"' : ''; }
  /* 작품별 사이즈: products.js의 sizes(만들 수 있는 사이즈), soldout(품절 사이즈). 없으면 공통 SIZES */
  function sizesOf(p) { var list = (p && p.sizes && p.sizes.length) ? p.sizes : S.SIZES, out = (p && p.soldout) || []; return list.map(function (z) { return { z: z, out: out.indexOf(z) > -1 || out.indexOf(String(z)) > -1 }; }); }
  function allOut(p) { return sizesOf(p).every(function (x) { return x.out; }); }
  function sizeOpts(p) { return sizesOf(p).map(function (x) { return '<option' + (x.out ? ' disabled' : '') + ' value="' + x.z + '">' + x.z + (x.out ? ' (품절)' : '') + '</option>'; }).join(''); }
  function cardHtml(p) {
    var cls = p.fit === 'contain' ? 'contain' : '';
    var alt = p.photos[1] ? '<img class="alt ' + cls + '" src="' + p.photos[1] + '" alt="" loading="lazy"' + posAttr(p, 1) + '>' : '';
    return '<article class="card" data-id="' + p.id + '" data-cat="' + p.cat + '" data-base="' + p.base + '">' +
      '<a class="ph" href="product.html?id=' + p.id + '">' + (p.isNew ? '<span class="badge">New</span>' : '') +
        '<img class="' + cls + '" src="' + p.photos[0] + '" alt="' + p.name + '" loading="lazy"' + posAttr(p, 0) + '>' + alt + '</a>' +
      '<button type="button" class="qadd" data-qa="' + p.id + '" aria-label="' + p.name + ' 사이즈 골라 담기"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button>' +
      '<a class="meta" href="product.html?id=' + p.id + '"><span class="nm">' + nameOf(p) + '</span><span class="price">' + won(p.price) + '</span></a></article>';
  }
  function quickAdd(id) {
    var p = byId(id); if (!p) return;
    $('#qa-body').innerHTML = '<div class="qa-ph"><img src="' + p.photos[0] + '" alt="" class="' + (p.fit === 'contain' ? 'contain' : '') + '"' + posAttr(p, 0) + '></div><p class="qa-name">' + nameOf(p) + '</p><p class="qa-price price">' + won(p.price) + '</p>' +
      '<div class="qa-opt"><label for="qa-size">사이즈 (mm)</label><select id="qa-size"><option value="">사이즈를 골라 주세요</option>' + sizeOpts(p) + '</select>' +
      '<button class="btn wide" type="button" id="qa-go" disabled>사이즈를 골라 주세요</button><a class="link" href="product.html?id=' + p.id + '">자세히 보기</a></div>';
    var sel = $('#qa-size'), go = $('#qa-go');
    sel.addEventListener('change', function () { go.disabled = !sel.value; go.textContent = sel.value ? t('pd.add') : '사이즈를 골라 주세요'; });
    go.addEventListener('click', function () { addToCart(p.id, +sel.value, 1); close('qa-sheet'); });
    open('qa-sheet');
  }
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-qa]'); if (q) { e.preventDefault(); quickAdd(q.getAttribute('data-qa')); return; }
    var b = e.target.closest('[data-add]'); if (!b) return;
    e.preventDefault(); addToCart(b.getAttribute('data-add'), +b.getAttribute('data-size'), 1);
  });

  /* 검색 */
  function doSearch(q) {
    q = (q || '').trim().toLowerCase();
    var hits = q ? S.products.filter(function (p) { return (p.name + ' ' + (p.en || '') + ' ' + p.sub + ' ' + p.desc).toLowerCase().indexOf(q) >= 0; }) : S.products.slice(0, 5);
    $('#search-hits').innerHTML = hits.map(cardHtml).join('');
    $('#search-none').hidden = !!hits.length;
  }
  $('#search-btn').addEventListener('click', function () { open('search-sheet'); doSearch(''); setTimeout(function () { $('#search-input').focus(); }, 50); });
  $('#search-input').addEventListener('input', function (e) { doSearch(e.target.value); });
  $('#search-form').addEventListener('submit', function (e) { e.preventDefault(); });

  /* 로그인 */
  var user = store.get('bium_user', null);
  function renderUser() { $('#login-btn').setAttribute('aria-label', user ? user.name : t('util.login')); $('#login-btn').classList.toggle('on', !!user); }
  $('#login-btn').addEventListener('click', function () { location.href = 'account.html'; });
  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault(); user = { name: $('#login-name').value.trim(), email: $('#login-email').value.trim(), at: Date.now() };
    store.set('bium_user', user); renderUser(); close('login-modal'); toast(t('login.hi') + ', ' + user.name);
  });

  applyLang(document); renderUser(); renderCart(); $$('.langbtn').forEach(function (b) { b.textContent = LANG === 'ko' ? 'EN' : 'KO'; });

  /* 수업 예약: 네이버 플레이스가 연결되면 그쪽으로 */
  $$('a[href="book.html?type=class"]').forEach(function (a) { if (S.NAVER_BOOKING) { a.href = S.NAVER_BOOKING; a.target = '_blank'; a.rel = 'noopener'; } else { a.href = 'class.html#workshop'; } });

  /* 신청서 보내기: 서버(두뇌)가 받으면 서버로, 못 받으면(오픈 전·미리보기) 내용을 복사해 카카오톡으로 */
  function send(kind, payload, text, done) {
    var api = (S.API_BASE || '').replace(/\/$/, '') + '/s-api/shoesteller/' + kind;
    function viaKakao() {
      var copied = false;
      function fin() { done({ via: 'kakao', copied: copied, text: text }); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { copied = true; fin(); }, fin); else fin();
    }
    if (!S.API_BASE) return viaKakao();
    var ctl = window.AbortController ? new AbortController() : null; var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(timer); if (j && j.ok && j.collecting !== false) done({ via: 'server', data: j }); else viaKakao(); })
      .catch(function () { clearTimeout(timer); viaKakao(); });
  }
  window.BIUM = { setUser: function (u) { user = u; store.set('bium_user', u); renderUser(); }, send: send, KAKAO: S.KAKAO, t: t, lang: function () { return LANG; }, applyLang: applyLang, won: won, byId: byId, cardHtml: cardHtml, posAttr: posAttr, sizesOf: sizesOf, sizeOpts: sizeOpts, allOut: allOut, addToCart: addToCart, cart: function () { return cart; }, clearCart: function () { cart = []; saveCart(); }, user: function () { return user; }, toast: toast, nameOf: nameOf, openCart: function () { renderCart(); open('cart-sheet'); }, icon: icon, quickAdd: quickAdd, open: open, close: close };
})();
