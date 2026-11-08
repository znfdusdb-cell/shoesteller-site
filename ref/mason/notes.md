# Mason Garments "SHOP OUR LOOKS" 섹션 분석 (2026-11-08)

대상: https://masongarments.com/ (Shopify 테마, 커스텀 웹컴포넌트). 쿠키 배너(Cookiebot)는 Decline으로 닫음. 로그인·구매 없음.
캡처: Playwright(playwright-core + 로컬 chromium). 모바일 390x844 DSF2 is_mobile+touch / 데스크톱 1440x900 DSF2.

## 파일
- mobile_1_section / desktop_1_section : 섹션 화면
- mobile_2_next_look / desktop_2_next_look : 다음 룩으로 넘김 (모바일=scroll-snap 컨테이너를 scrollTo로 2번째 항목에 이동, 손가락 드래그 아님. 데스크톱=오른쪽 화살표 클릭)
- mobile_3_hotspot / desktop_3_hotspot : 핫스팟 점 클릭 (모바일=하단 시트 "Shop the look" 열림, 데스크톱=오른쪽 상품 패널이 해당 상품으로 전환)
- mobile_4_view_products : VIEW PRODUCTS 버튼 클릭 → 같은 하단 시트가 첫 상품으로 열림
- mobile_5_popup_closed : X 탭해서 팝업 닫은 상태
- desktop_4_view_products : 데스크톱에는 VIEW PRODUCTS 팝업이 없음(링크형 VIEW PRODUCT 버튼이 상품 페이지로 이동). 이동하지 않고 3번과 같은 상태만 캡처. 의도적 미실행.
- theme-rules-shop-the-look.css : theme.css에서 추출한 관련 규칙 원문

## DOM 구조 (section.shopify-section--shop-the-look)
section > div.section-spacing.color-scheme > div.container > div.section-stack
- div.section-header > p.h2 "SHOP OUR LOOKS"
- 모바일 블록 div.md:hidden (>=md에서 숨김)
  - div.v-stack.gap-6
    - shop-the-look-mobile-carousel.shop-the-look__carousel.scroll-area.snap-x.bleed
      - div.shop-the-look__item.snap-start.w-full (룩 4개; is-selected가 현재)
        - div.shop-the-look__image-wrapper > img.image-cover + carousel-navigation.shop-the-look__hot-spot-list > button.shop-the-look__hot-spot x N (aria-label "Go to item n", aria-current)
        - shop-the-look-popover.shop-the-look__popover.popover[role=dialog] > p.h4[slot=header] "Shop the look" + scroll-carousel.shop-the-look__item-carousel.snap-x > div.shop-the-look__item-product.snap-center (상품 카드 product-card, 가로 스와이프)
    - button.button.w-full[aria-controls=팝오버 id][aria-haspopup=dialog] "View products"
- 데스크톱 블록 div.md-max:hidden
  - div.floating-controls-container
    - shop-the-look-desktop-carousel.shop-the-look__carousel
      - div.shop-the-look__item.snap-start (룩 4개, 전부 같은 그리드 셀에 겹침, 선택 안 된 것은 visibility:hidden)
        - div.shop-the-look__image-wrapper (이미지 + 핫스팟)
        - div.shop-the-look__item-content > shop-the-look-product-list-carousel + a.button "View product" + carousel-navigation.page-dots(button.tap-area x 상품수)
    - button.prev-next-button--prev / --next .circle-button.circle-button--lg (좌우 화살표 50x50 흰 원)
- 룩 4개, 핫스팟 수는 룩마다 2~4개(점 수 = 상품 수 = 하단 점/슬라이드 수).

## CSS 핵심 값 (theme.css 실측)
슬라이드(모바일)
- .shop-the-look__carousel: display:grid; grid:auto / auto-flow 100%; gap:.625rem(10px); position:relative; overflow:visible
- 모바일 실측: 컨테이너 390px(margin 0 -20px, padding 0 20px = bleed), 항목 350x350, scroll-snap-type:x mandatory, scroll-snap-align:start, scroll-padding 20px, overflow-x:auto, scrollbar 숨김. 다음 항목이 오른쪽에 살짝 보임(peek).
- 이미지 래퍼: position:relative; overflow:hidden; border-radius:3px; 이미지 1200x1200 정사각 object-fit cover

슬라이드(데스크톱 >=1000px)
- .shop-the-look__carousel: grid:none; align-items:center
- .shop-the-look__item: grid-template-columns:1fr 1fr(min(550px,60%) minmax(0,1fr) 지정 후 덮어씀); grid-area:1 / -1(전부 겹침); gap:.3125rem(5px); margin-inline:auto; 선택 안 됨 → visibility:hidden. 실측 항목 1196px, 이미지 595.5px 정사각, 상품 패널 596x480.
- .shop-the-look__item-product: grid-area:1 / -1; max-width:70%; 비선택 visibility:hidden
- 상품 카드 figure: background #faf7f1; max-height 400px (>=1400px는 760px)
- 가운데 컨테이너 1344px(container), 좌우 화살표는 컨테이너 바깥쪽에 absolute

핫스팟 점
- .shop-the-look__hot-spot: --hot-spot-size:1rem(16px); 위치 top/left = (인라인 --shop-the-look-hot-spot-top/left %) - 크기/2; border-radius full(원); 흰색(--background 255 255 255); position:absolute; transition:transform .2s ease-in-out
- 선택(aria-current=true): transform:scale(1.3) (데스크톱은 :hover에서도 scale 1.3, pointer:fine)
- ::after 후광: 크기 2.5배(40px) 원, radial-gradient(투명 → 흰 30%), animation: 2s ease-in-out infinite alternate ping
- @keyframes ping { 0% {transform:scale(1)} 100% {transform:scale(.8)} }  (맥박처럼 숨쉬는 효과)
- 선택된 점은 21x21(1.3배), 나머지 16x16

VIEW PRODUCTS / VIEW PRODUCT 버튼
- 모바일 button.button.w-full: 350x55px, border-radius 4px, 13px, letter-spacing 2.34px(0.18em), uppercase, 흰 글씨, 어두운 갈색 계열 배경(스크린샷상 거의 검정), 하단 1px 선 느낌
- 데스크톱 a.button: 195x55px 같은 스타일, 상품 패널 아래 중앙. 간격 gap 1.5rem(24px)

페이지 점(상품 슬라이드 인디케이터, 데스크톱)
- .page-dots: display:flex; flex-wrap:wrap; justify-content:center; gap:.5rem 1rem
- 점 하나: 32x3px 막대, border-radius full; ::after 흰색 opacity .5, aria-current=true면 opacity 1 (배경이 밝은 곳에선 .page-dots-mobile 변형이 검정)

화살표 버튼
- .prev-next-button.circle-button--lg: 50x50, 흰 원, 가운데 얇은 꺾쇠 SVG(16x18), 좌우 가운데 세로 정렬(top 약 50%), hover:animate-icon-inline(아이콘 살짝 이동)

모바일 팝업(하단 시트)
- shop-the-look-popover, ::part(base){height:auto; inset:auto auto 0 0}, ::part(overlay){display:none} → 오버레이 없이 하단 고정 시트. 헤더 "Shop the look" 중앙 + 우측 X
- 시트 안 상품 이미지 figure width:80%, margin-inline:auto; 상품 카드는 가로 snap-x 스와이프
- 열리면 .shop-the-look__carousel.is-expanded → overflow:hidden, 섹션 ::before(고정 배경 레이어)가 opacity 0→1, transition .4s (max-width:699px)
- 핫스팟 탭 = 시트를 열고 해당 상품 슬라이드로 이동(aria-controls로 scroll-carousel 연결)

애니메이션 요약
- 핫스팟: ping 2s alternate infinite(후광), scale 1.3 transform .2s
- 모바일 시트/배경: opacity .4s
- 룩 전환: 모바일은 CSS scroll-snap 네이티브 스크롤, 데스크톱은 is-selected 토글 + visibility(셀 겹침) 방식. JS 커스텀 엘리먼트(shop-the-look-*-carousel, carousel-navigation, scroll-carousel)가 선택 상태·aria-current 관리.

## 알아둘 것(한계)
- 모바일 "다음 룩"은 터치 드래그가 아니라 scrollTo로 재현.
- 데스크톱의 룩 전환 애니메이션 프레임(페이드 여부)은 측정 안 함. item-content는 opacity:0에서 시작(JS가 올림).
- 버튼 배경색 정확한 hex는 computed가 투명(배경이 색상 스킴 변수/그라디언트)이라 못 뽑음.
- 사이트 이미지·상품 사진은 Mason Garments 저작물: 참고용, 재사용 금지.
