// 공통 틀 — 상단 메뉴·바닥·모바일 고정 단추를 한 곳에서 그린다. 각 페이지 <body data-page="home|studio|shop|classes|request|join|book|privacy">.
(function () {
  'use strict';
  var page = document.body.getAttribute('data-page') || '';
  var LINKS = [['studio', '스튜디오', './studio.html'], ['shop', '숍', './shop.html'], ['classes', '클래스', './classes.html'], ['request', '맞춤 의뢰', './custom.html'], ['story', '이야기', './index.html#story']];
  var nav = document.createElement('header');
  nav.className = 'nav';
  nav.innerHTML = '<div class="wrap"><a class="logo" href="./index.html">슈즈텔러</a>' +
    '<nav class="nav-links" aria-label="메뉴">' + LINKS.map(function (l) { return '<a href="' + l[2] + '"' + (l[0] === page ? ' aria-current="page"' : '') + '>' + l[1] + '</a>'; }).join('') + '</nav>' +
    '<a class="btn small ghost nav-cta" href="./join.html">가입하고 쿠폰 받기</a>' +
    '<button class="menu-btn" type="button" aria-label="메뉴 열기" aria-expanded="false"><span></span><span></span><span></span></button></div>';
  document.body.insertBefore(nav, document.body.firstChild);
  var mb = nav.querySelector('.menu-btn');
  mb.addEventListener('click', function () { var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); });

  if (page !== 'studio') {
    var foot = document.createElement('footer');
    var biz = (window.SHOESTELLER || {}).BUSINESS || {};
    foot.innerHTML = '<div class="wrap"><a class="logo" href="./index.html">슈즈텔러</a>' +
      '<p>흰 신발 한 켤레를, 세상에 하나뿐인 내 신발로. 홍대 공방에서 직접 그리거나, 스튜디오에서 디자인해 주문하세요.</p>' +
      '<p>' + (biz.name ? [biz.name, biz.owner && '대표 ' + biz.owner, biz.reg && '사업자등록 ' + biz.reg, biz.mail && '통신판매업 ' + biz.mail, biz.addr].filter(Boolean).join(' / ') : '<span class="todo">사업자 정보(상호·대표·사업자등록번호·통신판매업 신고번호·주소)는 확정 후 표시</span>') + '</p>' +
      '<p><a href="./privacy.html">개인정보 처리방침</a></p></div>';
    document.body.appendChild(foot);
    if (page !== 'join' && page !== 'book' && page !== 'checklist' && page !== 'taste') {
      var s = document.createElement('div');
      s.className = 'sticky-cta';
      s.innerHTML = page === 'shop' ? '<a class="btn" href="./studio.html">내 디자인 직접 만들기</a>' : '<a class="btn" href="./studio.html">내 디자인 만들기</a>';
      document.body.appendChild(s);
    }
  }
})();
