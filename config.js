// 슈즈텔러 사이트 설정 — 주소·사진은 여기 한 곳에서만 바꾼다.
// 새 링크(호스팅)로 옮길 때: 이 폴더를 통째로 복사하고 API_BASE만 서버 주소로 바꾸면 된다.
//   같은 서버(brain.sauptycoon.com/s/shoesteller/)에서 열 때: ''  (상대 주소)
//   다른 주소에서 열 때: 'https://brain.sauptycoon.com'  (서버가 그 주소의 요청을 받도록 CORS 허용 필요)
// 결제는 없다. 비밀값을 넣지 말 것(이 파일은 누구나 볼 수 있다).
window.SHOESTELLER = {
  API_BASE: 'https://brain.sauptycoon.com',
  STORE_URL: 'https://smartstore.naver.com/bium4581',
  // 사진: { src: '주소', alt: '설명' }. 비어 있으면 자리표시가 보인다. 가로 사진 기준 1600px 이하·webp 권장.
  PHOTOS: {
    hero: [],     // 첫 화면 가로 사진(1장 쓰고, 여러 장이면 첫 장)
    process: [],  // 나만의 신발 3단계: 고르기·그리기·신고 나가기
    works: [],    // 작품 6장
    class: [],    // 수업 장면 3장
    story: []     // 고객·완성 사진 3장
  }
};
