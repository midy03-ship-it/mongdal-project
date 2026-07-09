// lang-select.js - 인트로 전 언어 선택 화면
const LangSelectScene = (() => {

  function enter(el) {
    Lang.init(); // 저장된 언어 불러오기
    el.innerHTML = `
      <div style="
        position:relative;width:100%;height:100%;
        background:#000;
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        gap:0;
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
        overflow:hidden;
      ">
        <!-- 배경 미세 텍스처 -->
        <div style="
          position:absolute;inset:0;
          background:radial-gradient(ellipse at 50% 40%, #0d0820 0%, #000 70%);
          pointer-events:none;
        "></div>

        <!-- 장식선 -->
        <div style="
          position:absolute;top:0;left:0;right:0;
          height:2px;
          background:linear-gradient(90deg,transparent,#8040c0,transparent);
        "></div>
        <div style="
          position:absolute;bottom:0;left:0;right:0;
          height:2px;
          background:linear-gradient(90deg,transparent,#8040c0,transparent);
        "></div>

        <!-- 제목 -->
        <div style="
          position:relative;
          font-size:13px;color:rgba(200,160,255,0.7);
          letter-spacing:.25em;margin-bottom:40px;
          text-transform:uppercase;
        ">Language / 언어</div>

        <!-- 버튼들 -->
        <div style="
          position:relative;
          display:flex;flex-direction:column;
          gap:16px;width:240px;
        ">
          <button id="btn-ko" onclick="LangSelectScene.select('ko')" style="
            background:${Lang.getCurrent()==='ko' ? 'rgba(128,64,192,0.4)' : 'rgba(128,64,192,0.15)'};
            border:1px solid rgba(200,160,255,${Lang.getCurrent()==='ko' ? '0.8' : '0.4'});
            border-radius:10px;
            padding:18px 0;
            color:#e8d0ff;
            font-size:17px;
            font-family:inherit;
            letter-spacing:.12em;
            cursor:pointer;
            transition:all 0.2s;
            display:flex;align-items:center;justify-content:center;gap:10px;
          ">
            <span style="font-size:20px">🇰🇷</span> 한국어
          </button>

          <button id="btn-en" onclick="LangSelectScene.select('en')" style="
            background:${Lang.getCurrent()==='en' ? 'rgba(64,96,192,0.4)' : 'rgba(64,96,192,0.15)'};
            border:1px solid rgba(160,200,255,${Lang.getCurrent()==='en' ? '0.8' : '0.4'});
            border-radius:10px;
            padding:18px 0;
            color:#d0e4ff;
            font-size:17px;
            font-family:inherit;
            letter-spacing:.12em;
            cursor:pointer;
            transition:all 0.2s;
            display:flex;align-items:center;justify-content:center;gap:10px;
          ">
            <span style="font-size:20px">🇺🇸</span> English
          </button>
        </div>

        <!-- 페이드 오버레이 -->
        <div id="lang-fade" style="
          position:absolute;inset:0;background:#000;opacity:1;
          pointer-events:none;transition:opacity 0.6s ease;
        "></div>
      </div>
    `;

    // 버튼 hover 효과
    ['btn-ko','btn-en'].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('mouseenter', () => {
        btn.style.background = id === 'btn-ko'
          ? 'rgba(128,64,192,0.35)'
          : 'rgba(64,96,192,0.35)';
        btn.style.transform = 'scale(1.03)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = id === 'btn-ko'
          ? 'rgba(128,64,192,0.15)'
          : 'rgba(64,96,192,0.15)';
        btn.style.transform = 'scale(1)';
      });
    });

    // 페이드 인
    requestAnimationFrame(() => {
      setTimeout(() => {
        const fade = document.getElementById('lang-fade');
        if (fade) fade.style.opacity = '0';
      }, 100);
    });
  }

  function select(lang) {
    Lang.set(lang);

    const fade = document.getElementById('lang-fade');
    if (fade) {
      fade.style.transition = 'opacity 0.4s ease';
      fade.style.opacity = '1';
    }
    setTimeout(() => SceneManager.go('intro'), 420);
  }

  function exit() {}

  return { enter, exit, select };
})();
