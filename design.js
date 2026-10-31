// 기존 디자인 갤러리. 사진(img)·이름·상품 링크(store)는 회장 자료가 오면 채운다. 비어 있으면 자리표시.
// 입력값은 어디에도 보내거나 저장하지 않는다. 결제는 스마트스토어에서.
(function () {
  'use strict';
  var STORE_HOME = 'https://smartstore.naver.com/bium4581';
  var DESIGNS = [1, 2, 3, 4, 5, 6].map(function (n) {
    return { id: 'd' + n, name: '[회장 자료: 디자인 ' + n + ' 이름]', img: '', store: '' };
  });
  var picked = null;
  var g = document.getElementById('gallery');
  DESIGNS.forEach(function (d) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    var pic;
    if (d.img) {
      pic = document.createElement('img');
      pic.src = d.img; pic.alt = d.name; pic.loading = 'lazy'; pic.decoding = 'async';
    } else {
      pic = document.createElement('div');
      pic.className = 'ph'; pic.textContent = '[회장 자료: 사진]';
    }
    var n = document.createElement('span');
    n.className = 'n'; n.textContent = d.name;
    b.appendChild(pic); b.appendChild(n);
    b.addEventListener('click', function () {
      picked = d;
      var all = g.querySelectorAll('button');
      for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-pressed', all[i] === b ? 'true' : 'false');
      document.getElementById('err-design').textContent = '';
    });
    g.appendChild(b);
  });
  var size = document.getElementById('size');
  for (var s = 220; s <= 300; s += 5) {
    var o = document.createElement('option'); o.value = o.textContent = String(s); size.appendChild(o);
  }
  document.getElementById('go').addEventListener('click', function () {
    document.getElementById('err-design').textContent = picked ? '' : '디자인을 하나 골라 주세요.';
    document.getElementById('err-size').textContent = size.value ? '' : '사이즈를 골라 주세요.';
    if (!picked || !size.value) return;
    var memo = document.getElementById('memo').value.trim();
    document.getElementById('summary').textContent =
      '[슈즈텔러 기존 디자인] ' + picked.id + ' ' + picked.name + '\n사이즈: ' + size.value + 'mm' + (memo ? '\n요청: ' + memo : '');
    document.getElementById('store').href = picked.store || STORE_HOME;
    var next = document.getElementById('next');
    next.hidden = false; next.focus();
  });
  document.getElementById('copy').addEventListener('click', function () {
    var t = document.getElementById('summary').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { alert('복사했어요.'); });
  });
})();
