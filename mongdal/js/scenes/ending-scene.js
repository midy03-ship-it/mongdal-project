// ending-scene.js - 시즌 1 엔딩 시퀀스
const EndingScene = (() => {

  let el = null;
  let seqTimer = null;
  let currentSlide = 0;
  let done = false;

  const SLIDES = [
    {
      img: 0,
      bg: '#050a08',
      color: '#c8e8d0',
      duration: 5500,
      linesKo: ['현계의 원혼들이 잠들었다.', '귀인국에 오랜만에 평화가 찾아왔다.'],
      linesEn: ['The restless spirits of the Living World are at rest.', 'Peace has returned to Gwi-In-Guk at last.'],
    },
    {
      img: 1,
      bg: '#04020a',
      color: '#c8b0ff',
      duration: 5500,
      accent: true,
      linesKo: ['그러나 혼돈은 더 깊은 곳에서 시작되고 있었다.', '이제 다른 차원을 도울 때다, 애기씨야.'],
      linesEn: ['But chaos was stirring in realms far deeper.', 'It is time to help the other dimensions, Aegissi.'],
    },
  ];

  function enter(container) {
    el = container;
    done = false;
    currentSlide = 0;

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
        ">${Lang.getCurrent()==='ko'?'건너뛰기':'Skip'}</div>

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
      if (next >= SLIDES.length) {
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
    if (idx >= SLIDES.length) { showFinal(); return; }
    currentSlide = idx;
    const s = SLIDES[idx];
    const isKo = Lang.getCurrent() === 'ko';
    const lines = isKo ? s.linesKo : s.linesEn;
    const slideEl = document.getElementById('ending-slide');
    if (!slideEl) return;

    slideEl.style.background = s.bg || '#000';
    if (typeof s.img === 'number' && SPRITES?.ending?.[s.img]) {
      const bgImg = SpriteLoader.get(SPRITES.ending[s.img].src);
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

  function showFinal() {
    done = true;
    clearTimeout(seqTimer);
    const isKo = Lang.getCurrent() === 'ko';
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
              ${isKo ? '시즌 1 완료' : 'Season 1 Complete'}
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,0.4);
              letter-spacing:.15em;margin-top:20px;
              opacity:0;animation:endingFadeUp 0.6s ease 1.2s forwards;">
              ${isKo ? '탭하여 계속' : 'Tap to continue'}
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
