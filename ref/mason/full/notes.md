# masongarments.com 전체 구조 캡처 노트 (2026-11-08)
측정: Playwright 헤드리스 크롬. 모바일 390x844(DSF2, is_mobile, touch) / 데스크톱 1440x900. 쿠키(Cookiebot)는 Decline. 로그인·결제 안 함(장바구니는 사이즈 골라 담기만 함). 값은 getComputedStyle·:root·색 스킴 CSS에서 직접 읽음. 쇼피파이 테마. (추정)이라고 적은 것은 화면·클래스명으로 짐작한 것.

## 파일
- home_<desktop|mobile>_full.png 메인 전체 / home_<기기>_01~NN.png 900px씩 스크롤(데스크톱 8장, 모바일 9장)
- menu_mobile.png 햄버거 열림 / menu_desktop.png Footwear hover 메가메뉴
- collection_<기기>_full.png 컬렉션(/collections/atlantis, 메인 첫 컬렉션 링크) / product_<기기>_full.png 상품(/products/atlantis-canovaccio-blue) / cart_<기기>.png 장바구니(사이즈 선택 후 담기만)
- styles.json 원자료

## 1. 메인 섹션 순서 (데스크톱 높이 / 모바일 높이)
헤더 sticky 75 / 54. 배경 투명(페이지 크림색 그대로), 하단 선 없음.
1) slideshow 825 / 790. 전폭 풀블리드 영상. 좌하단에 'NEW ARRIVAL'(흰색 32px 자간 5.76px) + 버튼 'SHOP ATLANTIS'(크림 배경 버튼). 글 상자는 좌우 48px(모바일 20px) 안쪽, 아래 정렬.
2) featured-collections 745 / 647. 제목 'NEW ARRIVALS'(28px 자간 5.04px 가운데) 아래 탭 Men / Women(14px 자간 2.52px 텍스트 탭) + 'View all' 링크 + 좌우 Next 화살표(44x44). 상품 가로 캐러셀: 카드 351 x 480px, 카드 사이 3px, 화면에 4장 + 5번째가 잘려 보임. 모바일 카드 253px(한 장 반). 좌우 여백 없이 풀블리드.
3) slideshow_gUxQbp 825 / 790. 두 번째 풀블리드 영상. 'Atlantis sneakers' + 'SHOP NOW'.
4) featured-collections(2) 699 / 605. 'EXPLORE CLOTHING' + 같은 캐러셀(의류, 세일가 있음).
5) shop-the-look 755 / 560. 'SHOP OUR LOOKS'. 룩 사진(정사각 1200x1200, 모델 전신 착장) 위에 핫스팟 점(Go to item 1, 2) → 누르면 팝오버에 상품 + Choose options. 모바일은 가로 스냅 캐러셀 + 아래 선택된 룩의 상품. 콘텐츠 폭 1344px.
6) before-after 879 / 618. 'CHOOSE YOUR COLOR' (7번 참고).
7) spacer 30.
8) section_pillars 985 / 2270. 'DISCOVER OUR CLOTHING'. 데스크톱 3열 균등(480px x 3, 간격 0, 세로형 사진 3장), 모바일 1열 세로 쌓임(장당 약 750px).
9) 푸터 540 / 1272. 4열(Newsletter 입력 + SUBSCRIBE 검정 버튼 / Company / Customer Service / Terms and Privacy), 소셜 아이콘 5개, 로고, 결제수단 아이콘, 인증 배지.
전체 높이 데스크톱 6359px, 모바일 7636px. 섹션 위아래 여백 --section-vertical-spacing 3rem(48px). 제목과 본문 사이(section-stack) 데스크톱 60px / 모바일 40px.
메인에는 h2/h3 태그 없음. 섹션 제목은 전부 p.h2. h1은 로고 글씨(Mason Garments).

## 2. 글꼴
- 본문·헤더 메뉴·버튼·상품 이름: "Instrument Sans", sans-serif (--text-font-family, --heading-font-family 모두).
- 섹션 제목·문단(p): 커스텀 hankengrotesk(light/regular). 로고 글씨는 세리프(EB Garamond 계열 웹폰트가 로드됨).
- 섹션 제목 p.h2: hankengrotestlight 28px, weight 400, 자간 0.18em(5.04px), 글자는 원문이 대문자, 가운데. 슬라이드 큰 문구 32px 자간 5.76px 흰색.
- 테마 변수: h1 22~32px / h2 20~28px / h3 18~22px / h4 16~18px(clamp 반응형), h5 14px, h6 12px. 제목 자간 0.18em, weight 400, 변환 없음.
- 본문 body: 14px / 줄간격 23.1px / weight 400 / 자간 0 / 색 rgb(28,28,28). 문단 p 15px / 24px / 자간 0.1px.
- 헤더 메뉴: 12px 자간 2.16px(0.18em). 데스크톱은 'Footwear'처럼 소문자 섞인 표기, 모바일 사이드 메뉴는 FOOTWEAR 전부 대문자·자간 넓은 큰 글씨.
- 버튼: 13px weight 400 자간 2.34px(0.18em) 대문자.
- 라벨(NEW 뱃지): 10px(모바일 8px) 자간 1.8px 대문자. 상품 이름 12px 자간 2.16px(원문 표기). 가격 14px 자간 0, '250 EUR' 형식.

## 3. 색 (:root가 아니라 .color-scheme--scheme-N 클래스에 RGB 삼중수로 정의됨)
- scheme-1(기본): --background 250 247 241 (#FAF7F1 크림) / --text-color 28 28 28 (#1C1C1C) / --accent·--button-background 31 21 17 (#1F1511 진한 갈색 검정) / --button-text 255 255 255 / --border-color 217 214 209 (#D9D6D1)
- scheme-2: 배경 248 240 226 (#F8F0E2), 글자 0 0 0, 버튼 28 28 28, 선 211 204 192
- scheme-3(어두운): 배경 31 21 17, 글자 250 247 241, 버튼 크림
- scheme-4: 투명 배경, 글자 28 28 28, 버튼 흰색. 영상 위 스킴: 글자 크림 250 247 241
- 그 외: 흰색 스킴 255 255 255, 짙은 초록 스킴 배경 18 45 3(#122D03)
- :root 고정값: 세일 128 0 0, 성공 초록 48 122 7, 경고 237 138 0, 오류 128 0 0, 품절·커스텀 뱃지 배경 31 21 17 / 글자 흰색. --button-border-radius 0.25rem(4px), --input-border-radius 0. 그림자 거의 없음(0 5px 15px rgb(0 0 0/.05)).
- 상품 사진 배경은 사진 자체에 들어 있는 연한 크림 회색.

## 4. 컨테이너·여백·헤더
- --container-gutter 1.25rem(20px) = 모바일 좌우 여백. 데스크톱 안쪽 콘텐츠 폭 1344px(1440에서 좌우 48px). --container-max-width는 100%(최대폭 제한 없음, xl 85rem 변수만 존재). 영상·캐러셀·필러 사진은 풀블리드(여백 0).
- 헤더: 데스크톱 75px, 3칸 그리드(로고 230 / 메뉴 790 / 우측 244). 로고 좌 48px, 메뉴 Footwear·Clothing·Accessories(12px 자간 2.16px, 간격 약 40px), 우측 Lodge · EN ▾ · 계정 · 검색 · 가방 아이콘. 모바일 54px: 좌 햄버거 / 가운데 로고(160px) / 우 검색·가방.
- 모바일 사이드 메뉴(햄버거): 전면 크림 배경, 상단 X + 로고, 항목 FOOTWEAR > / CLOTHING > / ACCESSORIES > / LODGE(항목 간격 약 52px), 하단 ACCOUNT / SEARCH / CART, 맨 아래 EN ▾.
- 데스크톱 메가메뉴(Footwear hover): 헤더 아래 풀폭 크림 패널(높이 약 640px), 열린 메뉴 아래 검정 밑줄. 왼쪽 세로 링크 열(View all / Bestsellers / New Arrivals | Men Women Kids | Date Wedding Work Weekend Other occasions, 구분선) + 'SNEAKERS (CITTÁ)' 4열 그리드(칸마다 신발 라인아트 65px 폭 + 이름 12px 대문자) + 'BOOTS (SCALARE)' 3열 + 'LOAFERS (AMALFI)' 3열. 카테고리 그림이 사진이 아니라 얇은 선 라인아트 — 우리 '카테고리는 AI 라인아트' 기준과 같은 방식.

## 5. 버튼 모양
- .button: 높이 55px, padding 16px 32px, radius 4px, 13px 대문자 자간 2.34px, 테두리 1px. 영상 위는 크림 배경+검정 글자, 밝은 배경 위는 #1F1511 배경+흰 글자. 모바일 풀폭(350px) 'VIEW PRODUCTS'. 상품 상세 큰 버튼은 #1F1511 풀폭, 사이즈 미선택 'SELECT YOUR SIZE' → 선택 후 'ADD TO CART'. 장바구니 'CHECKOUT · 250 EUR'.
- 보조: 밑줄 텍스트 링크('Or continue shopping', 'Remove', 'View all').

## 6. 상품 카드 구조
- 사진 정사각 1:1(351x351 데스크톱 / 253x253 모바일 / 컬렉션 327x327). 좌상단 24px(모바일 10px) 안쪽에 'NEW' 뱃지(#1F1511 배경 흰 글자). 사진 점(glide__bullet)이 있어 사진 2~4장 넘김 구조.
- 사진 아래 한 줄: 왼쪽 상품 이름(12px 자간 2.16px) / 오른쪽 끝 가격(14px). 카드 안쪽 좌우 24px. 카드 높이 480 = 사진 351 + 텍스트 영역 129.
- '+' 버튼: 모바일은 사진 우하단 32x32 퀵애드 버튼(product-card__quick-add-button)이 보임, 누르면 사이즈 36~47 선택 후 담기. 데스크톱은 hover 때 나오는 구조(추정, 평소엔 크기 0으로 숨김).
- 카드 배경은 사진과 같은 연크림, 테두리 없음, 카드 사이 3px.
- 컬렉션 페이지: 카드 폭으로 보아 데스크톱 4열(카드 327px), 모바일 2열(180px)(추정).
- 상품 상세 데스크톱: 왼쪽 사진 열(세로로 사진 4장+영상, 폭 약 790px) + 오른쪽 정보 열: 제목(자간 넓음) → 짧은 설명+Read more → 가격 '250 EUR' → COLOR: 정사각 썸네일 2개(선택=검정 테두리) → 사이즈 추천 문구 → SIZE: 36~47 숫자 한 줄(모바일은 'Select your size' 드롭다운) → 검정 큰 버튼 → 신뢰 3줄(Buy Now, Pay Later! / Ethically Sourced Materials Only / Handmade in Italy) → 아코디언 5개(PRODUCT DETAILS / SIZE AND FIT / PRODUCT CARE / SHIPPING AND PAYMENT / RETURNS) → 'YOU MAY ALSO LIKE' 4장 캐러셀 → 푸터.
- 장바구니 드로어: 데스크톱은 오른쪽 폭 약 576px 패널(뒤 40% 어둡게), 모바일은 전면. 'Cart' + X / 상품 줄(120px 썸네일, 이름, 가격, 사이즈, 수량 −1+, Remove) / 'Complete with' 추천 3~4개(100px 썸네일 + ADD TO CART 테두리 버튼) / 하단 고정: Add order note, 세금 문구, 검정 CHECKOUT, 'Or continue shopping'.

## 7. 비포/애프터·색 고르기
있음. 섹션 'CHOOSE YOUR COLOR'. 커스텀 요소 <before-after class="before-after--horizontal">. 구조: 제목(가운데) → 같은 틀 안에 Before 이미지(.before-after__before-image)와 After 이미지를 겹치고 가운데 세로 분할선+핸들을 좌우로 끌어 드러내는 방식. 시작 위치 50%(--before-after-initial-cursor-position), 핸들 배경 크림 250 247 241. 같은 신발의 두 색(Atlantis Canovaccio Beige / Blue). 각 색 이름 아래 'View product' 버튼. 모바일은 세로형(소스 1200x1500, 699px 이하에서 모바일용 이미지로 교체), 섹션 높이 618. 핸들을 실제로 끌어 보진 않음(구조는 HTML로 확인).
그 밖의 슬라이더: 상품 캐러셀(Next 버튼), shop-the-look 핫스팟 캐러셀.

## 8. 슈즈텔러에 적용할 것
- 색 3개(#FAF7F1 / #1C1C1C / #1F1511) + 4px 버튼 + 대문자 자간 0.18em이 분위기의 핵심.
- 리듬: 풀블리드 영상 → 정사각 상품 캐러셀(3px 간격) → 영상 → 룩북 핫스팟 → 색 비교 슬라이더 → 3열 사진.
- 카테고리는 메가메뉴 라인아트 그리드(우리 기준과 일치).
