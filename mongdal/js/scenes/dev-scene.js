// dev-scene.js - 개발자 도구 씬 (DEV_MODE=true 일 때만 접근 가능)
const DevScene = (() => {

  let devDifficulty = 'easy';

  function setDifficulty(diff) {
    devDifficulty = diff;
    refresh();
  }

  function getAllStageIds() {
    const ids = [];
    for (const ch of GAME_DATA.stages) {
      for (const s of ch.stages) ids.push({ id: s.id, name: s.name, chapter: ch.chapter });
    }
    return ids;
  }

  function render(el) {
    const sd = Save.load();
    const allStages = getAllStageIds();

    el.innerHTML = `
      <div class="scroll-pan-y" style="
        position:absolute;inset:0;background:#0a0814;color:#e0d8f0;
        font-family:serif;overflow-y:auto;padding:12px;box-sizing:border-box;
        z-index:999;
      ">
        <!-- 헤더 -->
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;position:sticky;top:0;background:#0a0814;padding-bottom:8px;z-index:10;">
          <button onclick="SceneManager.go('lobby')" style="
            background:#2a1a3a;border:1px solid #6040a0;color:#c0a0f0;
            padding:6px 12px;border-radius:6px;cursor:pointer;font-size:13px;
          ">← 로비</button>
          <span style="font-size:16px;font-weight:bold;color:#ff8080;">🛠 개발자 도구</span>
        </div>

        <!-- ① 초기화 -->
        <section style="margin-bottom:16px;">
          <div style="font-size:13px;color:#a090c0;margin-bottom:6px;border-bottom:1px solid #2a1a3a;padding-bottom:4px;">초기화</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${[
              { label:'전체 초기화',   color:'#c02020', fn:'DevScene.resetAll()' },
              { label:'재화만',        color:'#a06020', fn:'DevScene.resetCurrency()' },
              { label:'진행도만',      color:'#206080', fn:'DevScene.resetProgress()' },
              { label:'해금만',        color:'#605020', fn:'DevScene.resetUnlocks()' },
              { label:'건물만',        color:'#204060', fn:'DevScene.resetBuildings()' },
              { label:'무기만',        color:'#602060', fn:'DevScene.resetWeapons()' },
              { label:'오염도0',       color:'#802040', fn:'DevScene.clearBlessings()' },
            ].map(b => `
              <button onclick="${b.fn}" style="
                background:${b.color};border:none;color:#fff;
                padding:7px 14px;border-radius:6px;cursor:pointer;font-size:13px;
              ">${b.label}</button>
            `).join('')}
          </div>
        </section>

        <!-- ①-2 파트2 프로필 전환 -->
        <!-- [UPDATE 2026-08-05] 요청: 요구조건(전 던전+전 무기 해금)/3단계 확인창 없이 바로 파트2 진입 테스트용 -->
        <section style="margin-bottom:16px;">
          <div style="font-size:13px;color:#a090c0;margin-bottom:6px;border-bottom:1px solid #2a1a3a;padding-bottom:4px;">
            파트2 프로필 &nbsp;
            <span style="font-size:11px;color:#706080;">현재: ${Save.getActiveProfile()==='part2' ? '파트2' : '파트1'}${Save.hasPart2Save() ? ' (파트2 세이브 있음)' : ''}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            <button onclick="DevScene.forcePart2Entry()" style="background:#a04070;border:none;color:#fff;padding:7px 14px;border-radius:6px;cursor:pointer;font-size:13px;">🌀 파트2 즉시 진입(신규)</button>
            <button onclick="DevScene.switchProfile('part1')" style="background:#204060;border:none;color:#fff;padding:7px 14px;border-radius:6px;cursor:pointer;font-size:13px;">파트1로 전환</button>
            <button onclick="DevScene.switchProfile('part2')" style="background:#204060;border:none;color:#fff;padding:7px 14px;border-radius:6px;cursor:pointer;font-size:13px;" ${Save.hasPart2Save()?'':'disabled'}>파트2로 전환(기존)</button>
            <button onclick="DevScene.wipePart2Save()" style="background:#602020;border:none;color:#fff;padding:7px 14px;border-radius:6px;cursor:pointer;font-size:13px;">파트2 세이브 삭제</button>
          </div>
        </section>

        <!-- ② 스테이지 클리어 -->
        <section style="margin-bottom:16px;">
          <div style="font-size:13px;color:#a090c0;margin-bottom:6px;border-bottom:1px solid #2a1a3a;padding-bottom:4px;">
            스테이지 클리어 &nbsp;
            <span style="font-size:11px;color:#706080;">${(() => {
              const diffKey = devDifficulty==='hard'?'clearedStagesHard':devDifficulty==='normal'?'clearedStagesNormal':'clearedStagesEasy';
              return `현재(${devDifficulty}) 클리어: ${(sd[diffKey]||[]).length}개 / 챕터: ${JSON.stringify(sd.clearedChapters || [])}`;
            })()}</span>
          </div>
          <!-- 난이도 선택 -->
          <div style="display:flex;gap:4px;margin-bottom:8px;align-items:center;">
            ${['easy','normal','hard'].map(d => {
              const colors = {easy:'#206040',normal:'#604020',hard:'#602020'};
              const labels = {easy:'🌿이지',normal:'⚔️노말',hard:'🔥하드'};
              return `<button onclick="DevScene.setDifficulty('${d}')" id="dev-diff-${d}" style="
                padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;
                background:${colors[d]};color:#fff;border:2px solid ${d===devDifficulty?'#fff':'transparent'};font-family:inherit;">
                ${labels[d]}</button>`;
            }).join('')}
          </div>
          <div style="display:flex;gap:6px;margin-bottom:8px;">
            <button onclick="DevScene.clearStagesUpTo(100)" style="background:#206040;border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">전체 클리어(1~100)</button>
            <button onclick="DevScene.resetProgress()" style="background:#602020;border:none;color:#fff;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">전체 초기화</button>
          </div>
          ${GAME_DATA.stages.map(ch => `
            <div style="margin-bottom:8px;">
              <div style="font-size:11px;color:#8070a0;margin-bottom:4px;">챕터 ${ch.chapter}: ${ch.name}</div>
              <div style="display:flex;flex-wrap:wrap;gap:3px;">
                ${ch.stages.map(s => {
                  const doneEasy   = (sd.clearedStagesEasy   || []).includes(s.id);
                  const doneNormal = (sd.clearedStagesNormal || []).includes(s.id);
                  const doneHard   = (sd.clearedStagesHard   || []).includes(s.id);
                  const done = devDifficulty==='hard' ? doneHard : devDifficulty==='normal' ? doneNormal : doneEasy;
                  const color = done ? (devDifficulty==='hard'?'#ff6040':devDifficulty==='normal'?'#f0c040':'#60d080') : '#a090c0';
                  const bg    = done ? (devDifficulty==='hard'?'#301010':devDifficulty==='normal'?'#302010':'#204030') : '#1a1030';
                  const bd    = done ? (devDifficulty==='hard'?'#ff6040':devDifficulty==='normal'?'#a06020':'#40a060') : '#3a2850';
                  return `<button onclick="DevScene.clearStagesUpTo(${s.id})" style="
                    background:${bg};border:1px solid ${bd};color:${color};
                    padding:3px 7px;border-radius:4px;cursor:pointer;font-size:11px;
                    ${s.isBoss?'font-weight:bold;':''}${s.isMidBoss?'border-style:dashed;':''}
                  ">${s.id}${s.isBoss?'👑':s.isMidBoss?'⚠':''}</button>`;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </section>

        <!-- ③ 재화 추가 -->
        <section style="margin-bottom:16px;">
          <div style="font-size:13px;color:#a090c0;margin-bottom:6px;border-bottom:1px solid #2a1a3a;padding-bottom:4px;">재화 추가</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            ${[
              // [UPDATE 2026-07-22] 사용자 요청: 개발 도구 재화 추가량 전부 1000배 상향 (테스트 편의)
              { key:'gold',           icon:'🪙', name:'골드',    amounts:[1000000,10000000,100000000] },
              { key:'gems',           icon:'💎', name:'다이아',  amounts:[100000,1000000,5000000] },
              { key:'ganghwaseok',    icon:'🔧', name:'강화석',  amounts:[100000,500000,2000000] },
              { key:'cheonunseok',    icon:'🪨', name:'천운석',  amounts:[100000,500000,2000000] },
              { key:'cheonryeonggwa', icon:'🍑', name:'천령과',  amounts:[100000,500000,2000000] },
              { key:'taegeukseok',    icon:'💠', name:'태극석',  amounts:[50000,200000,1000000] },
              { key:'chaewonseok',    icon:'🌀', name:'차원석',  amounts:[10000,50000,200000] },
              { key:'soulFragments',  icon:'👻', name:'영혼 조각', amounts:[10000,50000,200000] },
              // [UPDATE 2026-07-17] yeongonseok(획득경로 없던 유령 재화)을 soulStones로 통합 — 명부강화/무기초월 공용
              { key:'soulStones',     icon:'💜', name:'영혼석',  amounts:[10000,50000,200000] },
              { key:'sullriseok',     icon:'🌊', name:'순리석',  amounts:[10000,50000,200000] },
              // [UPDATE 2026-07-22] 선기석 (시즌5, 선술 스킬트리 강화 재화) 개발 도구 추가
              { key:'sullgiseok',     icon:'🔷', name:'선기석',  amounts:[10000,50000,200000] },
            ].map(c => `
              <div style="background:#1a1030;border:1px solid #2a1a3a;border-radius:8px;padding:8px;">
                <div style="font-size:12px;margin-bottom:5px;">${c.icon} ${c.name}: <span style="color:#f0d060;">${(sd[c.key]||0).toLocaleString()}</span></div>
                <div style="display:flex;gap:4px;">
                  ${c.amounts.map(a => `
                    <button onclick="DevScene.addCurrency('${c.key}',${a})" style="
                      flex:1;background:#2a2040;border:1px solid #4a3060;color:#c0a0f0;
                      padding:4px 2px;border-radius:4px;cursor:pointer;font-size:11px;
                    ">+${a>=1000?(a/1000)+'k':a}</button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>

      </div>
    `;
  }

  // ── 초기화 함수들 ──
  function resetAll() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.75);
      display:flex;align-items:center;justify-content:center;z-index:9999;`;
    overlay.innerHTML = `
      <div style="background:#1a1020;border:1px solid #a060e0;border-radius:14px;
        padding:24px 20px;max-width:280px;width:90%;text-align:center;font-family:inherit;">
        <div style="font-size:16px;color:#f0c040;font-weight:700;margin-bottom:10px;">⚠️ 전체 초기화</div>
        <div style="font-size:13px;color:#c8b8a0;margin-bottom:20px;line-height:1.5;">
          모든 세이브 데이터가 삭제됩니다.<br>계속하시겠습니까?
        </div>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button id="_confirm-cancel" style="flex:1;padding:10px;border-radius:8px;
            background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.2);
            color:#c8b8a0;cursor:pointer;font-family:inherit;font-size:13px;">취소</button>
          <button id="_confirm-ok" style="flex:1;padding:10px;border-radius:8px;
            background:rgba(180,40,40,0.6);border:1px solid #c04040;
            color:#ffe8e8;cursor:pointer;font-family:inherit;font-size:13px;font-weight:700;">초기화</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('_confirm-cancel').onclick = () => overlay.remove();
    document.getElementById('_confirm-ok').onclick = () => {
      overlay.remove();
      Save.reset();
      refresh();
    };
  }

  function resetCurrency() {
    const sd = Save.load();
    sd.gold = 0; sd.gems = 0;
    sd.ganghwaseok = 0; sd.cheonunseok = 0;
    sd.cheonryeonggwa = 0; sd.taegeukseok = 0;
    Save.save(sd);
    refresh();
  }

  function resetProgress() {
    const sd = Save.load();
    sd.clearedStages = []; sd.clearedChapters = [];
    sd.clearedStagesEasy = []; sd.clearedStagesNormal = []; sd.clearedStagesHard = [];
    sd.currentChapter = 1;
    delete sd._shownMilestones;
    delete sd._showFirstClearDialogue;
    delete sd._startDialogueDone;
    Save.save(sd);
    refresh();
  }

  function resetUnlocks() {
    const sd = Save.load();
    sd.companions = []; sd.activeCompanions = [];
    sd.pets = []; sd.weapons = [];
    sd.unlockedWeapons = ['talisman'];
    sd.weaponLevels = {};
    Save.save(sd);
    refresh();
  }

  function resetBuildings() {
    const sd = Save.load();
    sd.buildings = {};
    Save.save(sd);
    refresh();
  }

  // [UPDATE 2026-07-09] 무기만 초기화 (강화/각성/초월/장착 전부 리셋, 동료·펫은 그대로)
  function resetWeapons() {
    const sd = Save.load();
    sd.unlockedWeapons = ['talisman'];
    sd.weaponLevels = {};
    sd.weaponTranscend = {};
    sd.selectedMainWeapons = ['talisman'];
    sd.selectedMainWeapon = 'talisman';
    Save.save(sd);
    refresh();
  }

  function clearStagesUpTo(targetId) {
    const sd = Save.load();
    if (!sd.clearedStages) sd.clearedStages = [];
    if (!sd.clearedChapters) sd.clearedChapters = [];
    if (!sd.clearedStagesEasy)   sd.clearedStagesEasy   = [];
    if (!sd.clearedStagesNormal) sd.clearedStagesNormal = [];
    if (!sd.clearedStagesHard)   sd.clearedStagesHard   = [];

    for (const ch of GAME_DATA.stages) {
      for (const s of ch.stages) {
        if (s.id <= targetId) {
          if (!sd.clearedStages.includes(s.id)) sd.clearedStages.push(s.id);
          const diffKey = devDifficulty === 'hard' ? 'clearedStagesHard'
                        : devDifficulty === 'normal' ? 'clearedStagesNormal'
                        : 'clearedStagesEasy';
          if (!sd[diffKey].includes(s.id)) sd[diffKey].push(s.id);
          if (devDifficulty === 'normal' && !sd.clearedStagesEasy.includes(s.id))
            sd.clearedStagesEasy.push(s.id);
          if (devDifficulty === 'hard') {
            if (!sd.clearedStagesEasy.includes(s.id))   sd.clearedStagesEasy.push(s.id);
            if (!sd.clearedStagesNormal.includes(s.id)) sd.clearedStagesNormal.push(s.id);
          }
        }
        if (s.id <= targetId && s.isBoss && !sd.clearedChapters.includes(ch.chapter)) {
          sd.clearedChapters.push(ch.chapter);
        }
      }
    }
    sd.clearedChapters.sort((a,b)=>a-b);
    Save.save(sd);
    refresh();
  }

  function addCurrency(key, amount) {
    const sd = Save.load();
    sd[key] = (sd[key] || 0) + amount;
    Save.save(sd);
    refresh();
  }

  // [UPDATE 2026-08-02] 개발 테스트용 — 오염도(슈브니구라스의 축복 잔여량)를 즉시 0으로.
  // 황계 엔딩 확인 등 정화 그라인드를 건너뛰고 싶을 때 사용.
  function clearBlessings() {
    const sd = Save.load();
    sd.blessings = 0;
    Save.save(sd);
    refresh();
  }

  // [UPDATE 2026-08-05] 개발 테스트용 — 파트2 요구조건(전 던전+전 무기 해금)/3단계 확인창을 건너뛰고
  // 곧바로 파트2 신규 세이브(별도 프로필)로 전환. 로직은 lobby.js의 _activatePart2()와 동일.
  function forcePart2Entry() {
    Save.setActiveProfile('part2');
    const freshP2 = Save.load(); // 프로필 전환 직후라 파트2의 새 세이브(비어있음)를 반환
    freshP2.season8ClearEnding = true; // 박수 스프라이트/동료목록 제외 로직이 이 플래그로 동작
    Save.save(freshP2);
    SceneManager.go('lobby');
  }

  // 파트1/파트2 세이브 프로필 전환만 (신규 시작 아님 — 기존 세이브 그대로 불러옴)
  function switchProfile(profile) {
    Save.setActiveProfile(profile);
    SceneManager.go('lobby');
  }

  // 파트2 세이브만 완전히 삭제(파트1 세이브는 그대로) — 재테스트용
  function wipePart2Save() {
    const wasPart2 = Save.getActiveProfile() === 'part2';
    try { localStorage.removeItem('mongdal_save_part2'); } catch (e) {}
    if (wasPart2) Save.setActiveProfile('part1');
    refresh();
  }

  function refresh() {
    const el = document.getElementById('app');
    if (!el) return;
    const scrollEl = el.querySelector('div[style*="overflow-y:auto"]');
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
    render(el);
    const newScrollEl = el.querySelector('div[style*="overflow-y:auto"]');
    if (newScrollEl) newScrollEl.scrollTop = scrollTop;
  }

  function enter(el) { render(el); }
  function exit() {}

  return { enter, exit, resetAll, resetCurrency, resetProgress, resetUnlocks, resetBuildings, resetWeapons, clearStagesUpTo, addCurrency, setDifficulty, clearBlessings, forcePart2Entry, switchProfile, wipePart2Save };
})();
