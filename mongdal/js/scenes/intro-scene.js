// intro-scene.js - 서사 인트로 시퀀스
const IntroScene = (() => {

  let el = null;
  let autoTimer = null;
  let seqTimer = null;
  let currentSlide = 0;
  let skipped = false;
  // [UPDATE 2026-07-31] 명부전(기억의 공간)에서 서막을 다시 볼 때 쓰는 플래그.
  // 실제 첫 실행 인트로(lang-select.js)는 그대로 7장 + 타이틀 로고로 끝나지만,
  // 명부전 재생은 로고 없이 7장만 보여주고 곧장 로비로 돌아간다(params.skipTitle = true로 호출).
  let _skipTitleScreen = false;

  // ── 슬라이드 배경/색상 설정 (언어 무관) ──
  const SLIDE_STYLES = [
    { bg:'#000',    color:'#e8dcc8',  duration:3800, img:0 },
    { bg:'#0a0510', color:'#c8a8ff',  duration:4200, accent:true, img:1 },
    { bg:'#0d0008', color:'#cc8888',  duration:3500, img:2 },
    { bg:'#150005', color:'#e06060',  duration:4000, shake:true,  img:3 },
    { bg:'#000',    color:'#d4a0ff',  duration:3800, img:4 },
    { bg:'#04020a', color:'#e8c8ff',  duration:4500, accent:true, img:5 },
    { bg:'#000',    color:'#f0d880',  duration:4200, img:6 },
  ];

  function getSlides() {
    const textSlides = Lang.getSlides();
    return textSlides.map((s, i) => ({
      ...SLIDE_STYLES[i],
      lines:  s.lines,
      accent: s.accent  || SLIDE_STYLES[i]?.accent,
      shake:  s.shake   || SLIDE_STYLES[i]?.shake,
    }));
  }

  // ── 렌더 ──
  function enter(container, params) {
    el = container;
    skipped = false;
    currentSlide = 0;
    _skipTitleScreen = !!params?.skipTitle;
    AudioManager.play('intro');

    el.innerHTML = `
      <div id="intro-root" style="
        position:relative;width:100%;height:100%;
        overflow:hidden;background:#000;cursor:pointer;
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
      ">
        <!-- 서사 슬라이드 -->
        <div id="intro-slide" style="
          position:absolute;inset:0;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          padding:40px 32px;text-align:center;
          transition:background 1.2s ease;
        "></div>

        <!-- 타이틀 화면 (마지막) — 명부전 재생(_skipTitleScreen)일 땐 아예 쓰이지 않고 지나감 -->
        <div id="intro-title" style="
          position:absolute;inset:0;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          opacity:0;pointer-events:none;
          transition:opacity 1s ease;
        ">
          <img id="intro-img" alt="몽달퇴마록"
            style="width:100%;height:100%;
              object-fit:cover;opacity:0;
              position:absolute;inset:0;
              transition:opacity 1s ease;">
          <div id="intro-tap" style="
            position:absolute;bottom:60px;left:0;right:0;
            text-align:center;opacity:0;
            transition:opacity 0.5s ease;
          ">
            <div style="
              font-size:14px;color:#f0e0a0;letter-spacing:.18em;
              text-shadow:0 0 12px rgba(240,192,64,.9);
              animation:tapPulse 1.6s ease-in-out infinite;
            ">${Lang.t('ui','tapToStart')}</div>
          </div>
        </div>

        <!-- 전체 페이드 오버레이 -->
        <div id="intro-fade" style="
          position:absolute;inset:0;background:#000;opacity:1;
          pointer-events:none;transition:opacity 0.9s ease;
        "></div>

        <!-- 스킵 버튼 -->
        <div id="intro-skip" style="
          position:absolute;top:16px;right:16px;
          font-size:11px;color:rgba(255,255,255,0.35);
          letter-spacing:.1em;padding:6px 10px;
          border:1px solid rgba(255,255,255,0.15);border-radius:4px;
          cursor:pointer;
        ">${Lang.t('ui','skip')}</div>

        <style>
          @keyframes tapPulse {
            0%,100% { opacity:.4; transform:scale(1); }
            50%      { opacity:1;  transform:scale(1.05); }
          }
          @keyframes fadeInUp {
            from { opacity:0; transform:translateY(14px); }
            to   { opacity:1; transform:translateY(0); }
          }
          @keyframes shakeX {
            0%,100% { transform:translateX(0); }
            20%     { transform:translateX(-6px); }
            40%     { transform:translateX(6px); }
            60%     { transform:translateX(-4px); }
            80%     { transform:translateX(4px); }
          }
        </style>
      </div>`;

    // 스킵
    document.getElementById('intro-skip').addEventListener('click', e => {
      e.stopPropagation();
      skipToTitle();
    });

    // 탭으로 스킵(타이틀 화면이 이미 떠 있으면 그대로 로비로)
    document.getElementById('intro-root').addEventListener('click', () => {
      if (document.getElementById('intro-title').style.opacity === '1') {
        goLobby();
      } else {
        skipToTitle();
      }
    });

    // 페이드 인 후 시퀀스 시작
    setTimeout(() => {
      document.getElementById('intro-fade').style.opacity = '0';
      setTimeout(() => showSlide(0), 900);
    }, 300);
  }

  // ── 슬라이드 표시 ──
  function showSlide(idx) {
    if (skipped) return;
    const SLIDES = getSlides();
    // [UPDATE 2026-07-31] 명부전 재생(_skipTitleScreen)이면 로고 없이 바로 로비로, 실제 첫 인트로는 그대로 타이틀 화면으로.
    if (idx >= SLIDES.length) {
      if (_skipTitleScreen) { skipped = true; goLobby(); } else { showTitle(); }
      return;
    }
    currentSlide = idx;
    const slide = SLIDES[idx];
    const slideEl = document.getElementById('intro-slide');
    if (!slideEl) return;

    // 배경 전환
    slideEl.style.background = slide.bg || '#000';
    // 배경 이미지 (SPRITES.intro 배열 인덱스)
    if (typeof slide.img === 'number' && SPRITES?.intro?.[slide.img]) {
      const bgSrc = SpriteLoader.get(SPRITES.intro[slide.img].src);
      if (bgSrc?.src) {
        slideEl.style.backgroundImage = `url('${bgSrc.src}')`;
        slideEl.style.backgroundSize = 'cover';
        slideEl.style.backgroundPosition = 'center';
      }
    } else {
      slideEl.style.backgroundImage = '';
    }
    if (slide.shake) {
      slideEl.style.animation = 'shakeX 0.5s ease 0.5s';
      setTimeout(() => { if (slideEl) slideEl.style.animation = ''; }, 1100);
    }

    // 텍스트 생성
    const color = slide.color || '#e8dcc8';
    const isAccent = slide.accent;

    const overlayDiv = typeof slide.img === 'number'
      ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);pointer-events:none;"></div>`
      : '';
    slideEl.innerHTML = overlayDiv + `<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 32px;text-align:center;">` +
    slide.lines.map((line, i) => {
      const isFirst = i === 0;
      const size = isAccent && isFirst ? '20px' : isFirst ? '15px' : '14px';
      const weight = isAccent && isFirst ? '700' : '400';
      const delay = 0.4 + i * 0.55;
      const letterSpacing = isAccent && isFirst ? '.2em' : '.08em';
      return `<div style="
        color:${color};
        font-size:${size};
        font-weight:${weight};
        line-height:1.9;
        letter-spacing:${letterSpacing};
        text-shadow:0 0 20px ${color}66;
        opacity:0;
        animation:fadeInUp 0.7s ease ${delay}s forwards;
        margin-bottom:${isFirst && slide.lines.length > 1 ? '8px' : '0'};
      ">${line}</div>`;
    }).join('') + `</div>`;

    // 다음 슬라이드로 전환
    seqTimer = setTimeout(() => {
      // 페이드 아웃
      slideEl.style.transition = 'opacity 0.6s ease';
      slideEl.style.opacity = '0';
      setTimeout(() => {
        if (skipped) return;
        slideEl.style.opacity = '1';
        slideEl.style.transition = '';
        showSlide(idx + 1);
      }, 650);
    }, slide.duration);
  }

  // ── 타이틀 화면 ──
  function showTitle() {
    skipped = true;
    const slideEl = document.getElementById('intro-slide');
    const titleEl = document.getElementById('intro-title');
    if (!slideEl || !titleEl) return;

    slideEl.style.transition = 'opacity 0.8s ease';
    slideEl.style.opacity = '0';

    setTimeout(() => {
      titleEl.style.pointerEvents = 'auto';
      titleEl.style.opacity = '1';

      const imgEl = document.getElementById('intro-img');
      const src = SPRITES?.title?.src || '';
      const onTitleLoaded = () => {
        imgEl.style.opacity = '1';
        setTimeout(() => {
          const tap = document.getElementById('intro-tap');
          if (tap) tap.style.opacity = '1';
          autoTimer = setTimeout(goLobby, 15000);
        }, 800);
      };
      if (!src) {
        onTitleLoaded();
      } else {
        imgEl.onload = onTitleLoaded;
        imgEl.src = src;
        if (imgEl.complete) onTitleLoaded();
      }
    }, 500);
  }

  // [UPDATE 2026-07-31] 명부전 재생(_skipTitleScreen)일 땐 타이틀 화면 없이 바로 로비로,
  // 실제 첫 인트로는 원래대로 타이틀 화면으로 스킵한다.
  function skipToTitle() {
    clearTimeout(seqTimer);
    clearTimeout(autoTimer);
    if (_skipTitleScreen) { skipped = true; goLobby(); } else { showTitle(); }
  }

  function goLobby() {
    if (SceneManager.getCurrent() !== 'intro') return;
    clearTimeout(seqTimer);
    clearTimeout(autoTimer);
    const fade = document.getElementById('intro-fade');
    if (!fade) { SceneManager.go('lobby'); return; }
    fade.style.transition = 'opacity 0.5s ease';
    fade.style.opacity = '1';
    setTimeout(() => SceneManager.go('lobby'), 520);
  }

  function exit() {
    clearTimeout(seqTimer);
    clearTimeout(autoTimer);
    skipped = true;
    el = null;
  }

  return { enter, exit, goLobby };
})();
