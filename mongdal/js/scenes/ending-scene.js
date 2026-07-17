// ending-scene.js - 시즌 1/2 엔딩 시퀀스
const EndingScene = (() => {

  let el = null;
  let seqTimer = null;
  let currentSlide = 0;
  let done = false;
  let _activeSlides = null;   // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌별 슬라이드 배열 전환용
  let _activeSpriteKey = 'ending';
  let _activeSeason = 1;

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

  // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌2 엔딩 5슬라이드 확정
  const SLIDES_S2 = [
    {
      img: 0,
      bg: '#0a0818',
      color: '#a0d8ff',
      duration: 5500,
      linesKo: ['멈춰있던 넋들이, 다시 강을 따라 흐르기 시작했다.', '저승나비가 그 위를 조용히 맴돈다.'],
      linesEn: ['The souls that had been frozen began to flow along the river once more.', 'The Jeoseung Butterfly quietly circles above them.'],
    },
    {
      img: 1,
      bg: '#140a18',
      color: '#ffb0c0',
      duration: 5500,
      linesKo: ['타락에서 돌아온 바리공주가 상사화 한 송이를 건넨다.', '"이 꽃처럼... 나도 누군가를 다시 만날 수 있을까."'],
      linesEn: ['Princess Bari, returned from corruption, offers a single sangsahwa flower.', '"Like this flower... could I meet someone again too?"'],
    },
    {
      img: 2,
      bg: '#0a0e08',
      color: '#c0e080',
      duration: 5000,
      linesKo: ['그러나 어딘가에서, 실눈 하나가 천천히 떠졌다.'],
      linesEn: ['But somewhere, a single slitted eye slowly opened.'],
    },
    {
      img: 3,
      bg: '#0a0e08',
      color: '#c0e080',
      duration: 5000,
      accent: true,
      linesKo: ['숲 곳곳에서 낄낄거리는 기척이 느껴진다.', '누군가... 지켜보고 있다.'],
      linesEn: ['Snickering presences stir throughout the forest.', 'Someone... is watching.'],
    },
    {
      img: 4,
      bg: '#1a1208',
      color: '#ffd090',
      duration: 6000,
      accent: true,
      linesKo: ['먼동이 트고 있었다.', '"망랑계의 문이... 열리고 있어."'],
      linesEn: ['Dawn was breaking.', '"The gate to the Chaos Realm... is opening."'],
    },
  ];

  // [UPDATE 2026-07-17] 시즌3 엔딩 4슬라이드 — "코믹한 액시던트형" (망랑계=선악없이 그냥 독특함 톤, 시즌2의 음산함과 대비)
  // 실제 삽화 4장(ss3 end 1~4)에 맞춰 5장 각본의 마지막 2장(하늘이 깊어짐/애기씨 홀로 응시)을 4번째 슬라이드 하나로 합침
  const SLIDES_S3 = [
    {
      img: 0,
      bg: '#1a1008',
      color: '#ffd8a0',
      duration: 5500,
      linesKo: ['망랑계의 혼란이 서서히 가라앉았다.', '그런데 도깨비들은... 여전히 웃고 있었다.'],
      linesEn: ['The chaos of the Illusion Realm slowly settled.', 'And yet the dokkaebi... were still laughing.'],
    },
    {
      img: 1,
      bg: '#241428',
      color: '#ffb0e0',
      duration: 5500,
      accent: true,
      linesKo: ['"애기씨가 이겼다아아!!"', '박수와 장구애비가 대뜸 뒤풀이를 선포했다.'],
      linesEn: ['"Aegissi won! Aegissi WON!!"', 'Baksu and Janggu-aebi immediately declared an after-party.'],
    },
    {
      img: 2,
      bg: '#140c10',
      color: '#e8b880',
      duration: 5000,
      linesKo: ['꺽쇠는 저 멀리서 그 광경을 가만히 지켜보았다.', '"...저 녀석한테도, 언젠가는 말해줘야겠지."'],
      linesEn: ['Ggeoksoe watched the scene quietly from afar.', '"...I suppose I\'ll have to tell him, someday."'],
    },
    {
      img: 3,
      bg: '#08060f',
      color: '#c0a0ff',
      duration: 6500,
      accent: true,
      linesKo: ['흥겨운 등불 사이로, 밤하늘 한쪽이 소리없이 갈라져 있었다.', '"...귀허계도, 뭔가 이상해." 애기씨 홀로, 조용히 그 틈을 바라보았다.'],
      linesEn: ['Amid the festive lanterns, a silent crack split the night sky.', '"...Something\'s off, in the Void Realm too." Alone, Aegissi quietly gazed at the rift.'],
    },
  ];

  function enter(container, params) {
    el = container;
    done = false;
    currentSlide = 0;
    // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: params.season===2면 시즌2 엔딩 슬라이드/스프라이트로 전환
    // [UPDATE 2026-07-17] params.season===3 시즌3 엔딩 추가
    _activeSeason = params?.season === 3 ? 3 : params?.season === 2 ? 2 : 1;
    _activeSlides = _activeSeason === 3 ? SLIDES_S3 : _activeSeason === 2 ? SLIDES_S2 : SLIDES;
    _activeSpriteKey = _activeSeason === 3 ? 'endingS3' : _activeSeason === 2 ? 'endingS2' : 'ending';

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
    const isKo = Lang.getCurrent() === 'ko';
    const lines = isKo ? s.linesKo : s.linesEn;
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
              ${_activeSeason === 2 ? (isKo ? '시즌 2 완료' : 'Season 2 Complete') : (isKo ? '시즌 1 완료' : 'Season 1 Complete')}
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
