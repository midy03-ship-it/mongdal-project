// ending-scene.js - 시즌 1/2 엔딩 시퀀스
const EndingScene = (() => {

  let el = null;
  let seqTimer = null;
  let currentSlide = 0;
  let done = false;
  let _activeSlides = null;   // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌별 슬라이드 배열 전환용
  let _activeSpriteKey = 'ending';
  let _activeSeason = 1;
  let _isReplay = false; // [UPDATE 2026-08-02] 기억의 공간(균열) 재생이면 true — "시즌 N 완료" 카드 생략

  // [UPDATE 2026-08-06] 대사(linesKo/linesEn)는 lang.js(TEXT.ko/en.ending.season1~8)로 이관 —
  // 여기엔 연출용 메타데이터(배경/글자색/노출시간/삽화 인덱스/강조여부)만 남김. showSlide()에서
  // Lang.get('ending.season'+_activeSeason+'.'+idx)로 해당 슬라이드의 대사 배열을 조회.
  const SLIDES = [
    { img: 0, bg: '#050a08', color: '#c8e8d0', duration: 5500 },
    { img: 1, bg: '#04020a', color: '#c8b0ff', duration: 5500, accent: true },
  ];

  // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌2 엔딩 5슬라이드 확정
  const SLIDES_S2 = [
    { img: 0, bg: '#0a0818', color: '#a0d8ff', duration: 5500 },
    { img: 1, bg: '#140a18', color: '#ffb0c0', duration: 5500 },
    { img: 2, bg: '#0a0e08', color: '#c0e080', duration: 5000 },
    { img: 3, bg: '#0a0e08', color: '#c0e080', duration: 5000, accent: true },
    { img: 4, bg: '#1a1208', color: '#ffd090', duration: 6000, accent: true },
  ];

  // [UPDATE 2026-07-17] 시즌3 엔딩 4슬라이드 — "코믹한 액시던트형" (망랑계=선악없이 그냥 독특함 톤, 시즌2의 음산함과 대비)
  // 실제 삽화 4장(ss3 end 1~4)에 맞춰 5장 각본의 마지막 2장(하늘이 깊어짐/애기씨 홀로 응시)을 4번째 슬라이드 하나로 합침
  const SLIDES_S3 = [
    { img: 0, bg: '#1a1008', color: '#ffd8a0', duration: 5500 },
    { img: 1, bg: '#241428', color: '#ffb0e0', duration: 5500, accent: true },
    { img: 2, bg: '#140c10', color: '#e8b880', duration: 5000 },
    { img: 3, bg: '#08060f', color: '#c0a0ff', duration: 6500, accent: true },
  ];

  // [UPDATE 2026-07-17] 시즌4 엔딩 6슬라이드 — 넋을 인도해 귀허계의 문을 열고 선계를 처음 발견하지만,
  // 마지막 5-2→5-1 두 장으로 평온함이 점층적으로 무너지며 시즌5(선계도 이미 타격을 입었다는 떡밥)를 예고
  const SLIDES_S4 = [
    { img: 0, bg: '#0a0810', color: '#f0d8a0', duration: 5500 },
    { img: 1, bg: '#0a0810', color: '#f0d8a0', duration: 5500 },
    { img: 2, bg: '#181008', color: '#ffe8b0', duration: 5500, accent: true },
    { img: 3, bg: '#201828', color: '#ffd0e0', duration: 5500 },
    { img: 4, bg: '#181820', color: '#c8d0e0', duration: 5500 },
    { img: 5, bg: '#100810', color: '#d8a0c0', duration: 6500, accent: true },
  ];

  // [UPDATE 2026-07-22] 시즌5 엔딩 5슬라이드 — 시즌4 엔딩의 "어쩌면... 전 차원이......" 떡밥을 직접 회수.
  // 선계도 이미 상처 입어있었다는 사실을 확인하고, 더 깊은 원계(시즌6)의 이상 징후로 다시 다음 시즌을 예고.
  // [UPDATE 2026-07-24] 전용 삽화 5장 제작 완료 — SPRITES.endingS5에 연결
  const SLIDES_S5 = [
    { bg: '#081418', color: '#a0e0e0', duration: 5500, img: 0 },
    { bg: '#0a1418', color: '#c8e8e0', duration: 5500, img: 1 },
    { bg: '#100c18', color: '#d8c8ff', duration: 5500, accent: true, img: 2 },
    { bg: '#080810', color: '#a0a8d0', duration: 5500, img: 3 },
    { bg: '#04040c', color: '#c0a0ff', duration: 6500, accent: true, img: 4 },
  ];

  // [UPDATE 2026-07-25] 시즌6(원계) 엔딩 5슬라이드 — 각성 2단계(부정) 서사: 표방원계에서 법칙의 파편을 얻지만
  // 자신의 본질에 대한 진실은 스스로 부정한다. 마지막 슬라이드에서 어계(시즌7)로 예고.
  // CONTENT_RELEASE.season6가 아직 false라 실제로 트리거되진 않음 — 아트/대사만 미리 반영.
  const SLIDES_S6 = [
    { bg: '#06081a', color: '#a8b8e8', duration: 5500, img: 0 },
    { bg: '#080a1c', color: '#a8b8e8', duration: 5500, img: 1 },
    { bg: '#0a0818', color: '#c8b0ff', duration: 6000, accent: true, img: 2 },
    { bg: '#06081a', color: '#d0b868', duration: 5500, img: 3 },
    { bg: '#04040c', color: '#8898d0', duration: 6500, accent: true, img: 4 },
  ];

  // [UPDATE 2026-07-31] 시즌7(어계) 엔딩 5슬라이드 — 각성 3단계(수용) 서사.
  // 시즌6에서 스스로 부정했던 진실("거울 속 낯익은 얼굴")을 여기서 마침내 받아들이고,
  // 어계를 뚫기 위해 삼킨 슈브니구라스의 축복이 곧 오염이었음을 자각한다.
  // 마지막 슬라이드가 황계(시즌8)의 오염도 정화 시스템을 서사적으로 예고하는 역할.
  // 대사 원본: 이미지 모음/05. 시즌 엔딩 모음/ss7 end/설명.txt
  const SLIDES_S7 = [
    { bg: '#0a0410', color: '#c890d0', duration: 6000, img: 0 },
    { bg: '#080610', color: '#a8b0e8', duration: 6500, accent: true, img: 1 },
    { bg: '#100418', color: '#e07890', duration: 6500, img: 2 },
    { bg: '#0c0a18', color: '#d0b868', duration: 7000, img: 3 },
    { bg: '#040208', color: '#ffcc60', duration: 7000, accent: true, img: 4 },
  ];

  // [UPDATE 2026-08-02] 시즌8(황계) 최종 엔딩 10슬라이드 — 각성 4단계(합일)이자 게임 전체의 최종 엔딩.
  // 앞부분(1~7)은 클라이맥스(자아 합일 → 아카식의 기록 소거), 뒷부분(8~10)은 곧바로 이어지는 공식
  // 에필로그("아카식과 부적" — WORLDBUILDING.md "7." 참고). 별개 엔딩이 아니라 한 호흡의 마무리.
  // 원본 그림: 이미지 모음/16. 엔딩 모음 r1~r10.
  const SLIDES_S8 = [
    { bg: '#000000', color: '#e8dcc8', duration: 6000, img: 0 },
    { bg: '#08040c', color: '#c0a8d8', duration: 5500, img: 1 },
    { bg: '#04040a', color: '#88b0e8', duration: 6000, img: 2 },
    { bg: '#050308', color: '#e8d8b0', duration: 6500, accent: true, img: 3 },
    { bg: '#06040a', color: '#ffe0a0', duration: 6500, accent: true, img: 4 },
    { bg: '#000000', color: '#d8c8ff', duration: 7000, accent: true, img: 5 },
    { bg: '#020204', color: '#a0c0ff', duration: 6500, img: 6 },
    { bg: '#100a06', color: '#f0c080', duration: 6000, img: 7 },
    { bg: '#08060a', color: '#e0a8a0', duration: 6500, img: 8 },
    { bg: '#050508', color: '#c8d8ff', duration: 7500, accent: true, img: 9 },
  ];

  function enter(container, params) {
    el = container;
    done = false;
    currentSlide = 0;
    // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: params.season===2면 시즌2 엔딩 슬라이드/스프라이트로 전환
    // [UPDATE 2026-07-17] params.season===3/4 시즌3/4 엔딩 추가
    // [UPDATE 2026-07-22] params.season===5 시즌5 엔딩 추가
    // [UPDATE 2026-07-25] params.season===6 시즌6 엔딩 추가 (아트/대사만 반영, 아직 트리거되진 않음)
    // [UPDATE 2026-07-31] params.season===7 시즌7(어계) 엔딩 추가.
    // 이 삼항 체인은 새 시즌을 추가할 때마다 세 줄 전부 같이 늘려야 하는 구조라 누락이 잦음 —
    // 실제로 시즌7이 빠져 있어 어계를 클리어해도 시즌1(현계) 엔딩이 재생되는 상태였음.
    // 표 기반으로 정리해 한 곳만 고치면 되도록 바꿈.
    const _SEASON_ENDINGS = {
      2: { slides: SLIDES_S2, sprite: 'endingS2' },
      3: { slides: SLIDES_S3, sprite: 'endingS3' },
      4: { slides: SLIDES_S4, sprite: 'endingS4' },
      5: { slides: SLIDES_S5, sprite: 'endingS5' },
      6: { slides: SLIDES_S6, sprite: 'endingS6' },
      7: { slides: SLIDES_S7, sprite: 'endingS7' },
      8: { slides: SLIDES_S8, sprite: 'endingS8' },
    };
    const _def = _SEASON_ENDINGS[params?.season];
    _activeSeason    = _def ? params.season : 1;
    _activeSlides    = _def ? _def.slides : SLIDES;
    _activeSpriteKey = _def ? _def.sprite : 'ending';
    _isReplay        = !!params?.replay;

    el.innerHTML = `
      <div id="ending-root" style="
        position:relative;width:100%;height:100%;
        overflow:hidden;background:#000;cursor:pointer;
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
      ">
        <div id="ending-slide" style="
          position:absolute;inset:0;
          display:flex;flex-direction:column;
          align-items:center;justify-content:flex-end;
          padding-bottom:60px;text-align:center;
        "></div>

        <div id="ending-fade" style="
          position:absolute;inset:0;background:#000;opacity:1;
          pointer-events:none;transition:opacity 0.9s ease;
        "></div>

        <div id="ending-skip" style="
          position:absolute;top:16px;right:16px;
          font-size:11px;color:rgba(255,255,255,0.35);
          letter-spacing:.1em;padding:6px 10px;
          border:1px solid rgba(255,255,255,0.15);border-radius:4px;
          cursor:pointer;z-index:10;
        ">${Lang.get('ending.ui.skip')}</div>

        <style>
          @keyframes endingFadeUp {
            from { opacity:0; transform:translateY(14px); }
            to   { opacity:1; transform:translateY(0); }
          }
        </style>
      </div>`;

    document.getElementById('ending-skip').addEventListener('click', e => {
      e.stopPropagation();
      goLobby();
    });
    document.getElementById('ending-root').addEventListener('click', () => {
      if (done) { goLobby(); return; }
      // 탭하면 다음 슬라이드로 스킵
      clearTimeout(seqTimer);
      const next = currentSlide + 1;
      if (next >= _activeSlides.length) {
        showFinal();
      } else {
        fadeAndShow(next);
      }
    });

    setTimeout(() => {
      document.getElementById('ending-fade').style.opacity = '0';
      setTimeout(() => showSlide(0), 900);
    }, 300);
  }

  function showSlide(idx) {
    if (idx >= _activeSlides.length) { showFinal(); return; }
    currentSlide = idx;
    const s = _activeSlides[idx];
    // [UPDATE 2026-08-06] 대사는 lang.js(ending.season1~8) 조회로 변경 — Lang.get()의 점 표기법이
    // 배열 인덱스도 지원해서(core/lang.js get() 참고) 'ending.season1.0'처럼 바로 접근 가능.
    const lines = Lang.get('ending.season' + _activeSeason + '.' + idx);
    const slideEl = document.getElementById('ending-slide');
    if (!slideEl) return;

    slideEl.style.background = s.bg || '#000';
    if (typeof s.img === 'number' && SPRITES?.[_activeSpriteKey]?.[s.img]) {
      const bgImg = SpriteLoader.get(SPRITES[_activeSpriteKey][s.img].src);
      if (bgImg?.src) {
        slideEl.style.backgroundImage = `url('${bgImg.src}')`;
        slideEl.style.backgroundSize = 'cover';
        slideEl.style.backgroundPosition = 'center top';
      }
    } else {
      slideEl.style.backgroundImage = '';
    }

    const color = s.color || '#e8dcc8';
    slideEl.innerHTML =
      `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);pointer-events:none;"></div>` +
      `<div style="position:relative;z-index:1;padding:0 32px 0;">` +
      lines.map((line, i) => {
        const isFirst = i === 0;
        const size = s.accent && isFirst ? '18px' : '15px';
        const weight = s.accent && isFirst ? '700' : '400';
        const delay = 0.5 + i * 0.7;
        return `<div style="
          color:${color};font-size:${size};font-weight:${weight};
          line-height:2;letter-spacing:.1em;
          text-shadow:0 0 20px ${color}88;
          opacity:0;animation:endingFadeUp 0.8s ease ${delay}s forwards;
          margin-bottom:6px;
        ">${line}</div>`;
      }).join('') + `</div>`;

    seqTimer = setTimeout(() => fadeAndShow(idx + 1), s.duration);
  }

  function fadeAndShow(next) {
    const slideEl = document.getElementById('ending-slide');
    if (!slideEl) return;
    slideEl.style.transition = 'opacity 0.7s ease';
    slideEl.style.opacity = '0';
    setTimeout(() => {
      if (!document.getElementById('ending-slide')) return;
      slideEl.style.opacity = '1';
      slideEl.style.transition = '';
      showSlide(next);
    }, 720);
  }

  // [UPDATE 2026-07-31] 마지막 슬라이드 뒤에 뜨던 "시즌 N 완료 / 탭하여 계속" 카드를 제거.
  // 이제 마지막 슬라이드가 끝나면(자동 진행이든 탭 스킵이든) 바로 페이드아웃하며 로비로 돌아간다.
  // [UPDATE 2026-08-02] "시즌 N 완료" 카드 복원 — 실제 인게임 클리어 엔딩에는 다시 표시하되,
  // 기억의 공간(균열) 재생(_isReplay)에서는 이전처럼 카드 없이 바로 로비로. 시즌1~8 공통으로 동작하도록
  // 기존 시즌1/2 전용 삼항 라벨을 `_activeSeason` 템플릿 문자열로 일반화.
  function showFinal() {
    done = true;
    clearTimeout(seqTimer);
    if (_isReplay) { goLobby(); return; }
    const slideEl = document.getElementById('ending-slide');
    if (slideEl) {
      slideEl.style.transition = 'opacity 0.7s ease';
      slideEl.style.opacity = '0';
      setTimeout(() => {
        if (!slideEl) return;
        slideEl.style.backgroundImage = '';
        slideEl.style.background = '#000';
        slideEl.style.opacity = '1';
        slideEl.style.alignItems = 'center';
        slideEl.style.justifyContent = 'center';
        slideEl.innerHTML = `
          <div style="text-align:center;position:relative;z-index:1;">
            <div style="font-size:22px;color:#f0c040;font-weight:700;
              letter-spacing:.2em;margin-bottom:12px;
              text-shadow:0 0 20px #f0c04088;
              opacity:0;animation:endingFadeUp 0.8s ease 0.3s forwards;">
              ${Lang.get('ending.ui.seasonComplete').replace('{n}', _activeSeason)}
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,0.4);
              letter-spacing:.15em;margin-top:20px;
              opacity:0;animation:endingFadeUp 0.6s ease 1.2s forwards;">
              ${Lang.get('ending.ui.tapToContinue')}
            </div>
          </div>`;
      }, 730);
    }
  }

  function goLobby() {
    if (SceneManager.getCurrent() !== 'ending') return;
    clearTimeout(seqTimer);
    const fade = document.getElementById('ending-fade');
    if (!fade) { SceneManager.go('lobby'); return; }
    fade.style.transition = 'opacity 0.6s ease';
    fade.style.opacity = '1';
    setTimeout(() => SceneManager.go('lobby'), 640);
  }

  function exit() {
    clearTimeout(seqTimer);
    done = true;
    el = null;
  }

  return { enter, exit };
})();
