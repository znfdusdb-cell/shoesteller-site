// 슈즈텔러 사이트 설정 — 주소·가격·상품·사진은 여기 한 곳에서만 바꾼다. 비밀값 금지(누구나 볼 수 있는 파일).
//   API_BASE: 같은 서버(brain.sauptycoon.com/s/shoesteller/)에서 열 때 ''. 공개 주소(github.io 등)에 올릴 때 서버가 'https://brain.sauptycoon.com'으로 바꿔 올린다.
//   PRICES: 확정 전에는 null → 화면에 '가격 확인 중'. 확정되면 숫자(원).
//   PRODUCTS: 숍에 보이는 완성 디자인. colorway는 shoe.js의 조합 이름 또는 부위별 색 객체. photo가 있으면 그림 대신 사진.
window.SHOESTELLER = {
  API_BASE: 'https://brain.sauptycoon.com',
  PRICES: { custom: null, class: null, kit: null },
  PRODUCTS: [
    { sku: 'd-first-brush', name: '첫 붓', colorway: '첫 붓', price: null, tag: '기존 디자인', desc: '앞코와 붓 자국 한 줄. 처음 커스텀하는 분이 가장 많이 고르는 조합.' },
    { sku: 'd-cobalt-night', name: '코발트 밤', colorway: '코발트 밤', price: null, tag: '기존 디자인', desc: '옆면과 혀를 코발트로, 밑창은 검정. 붓 자국은 노랑 한 줄.' },
    { sku: 'd-lemon', name: '레몬', colorway: '레몬', price: null, tag: '기존 디자인', desc: '발등과 앞코에 노랑. 끈 자리와 붓 자국은 검정으로 눌러줬어요.' },
    { sku: 'd-check-green', name: '체크 그린', colorway: '체크 그린', price: null, tag: '기존 디자인', desc: '옆면 체크 패턴. 손으로 그린 체크라 칸마다 조금씩 달라요.' },
    { sku: 'd-splash', name: '물감 튐', colorway: '물감 튐', price: null, tag: '기존 디자인', desc: '붓을 털어 튀긴 물감. 같은 디자인이어도 한 켤레마다 튄 자리가 달라요.' },
    { sku: 'd-pink-stripe', name: '핑크 줄', colorway: '핑크 줄', price: null, tag: '기존 디자인', desc: '연분홍 바탕에 분홍 줄무늬, 보라 붓 자국.' }
  ],
  // 사진: { src: '주소', alt: '설명' }. 비어 있으면 그림(신발 일러스트)을 쓴다. 가로 1600px 이하·webp 권장.
  PHOTOS: { hero: [], process: [], works: [], class: [], story: [] },
  // 바닥 사업자 정보(확정 후): { name, owner, reg, mail, addr }
  BUSINESS: {}
};
