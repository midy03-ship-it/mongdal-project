// building-scene.js - 건물 허브 (해금된 건물 목록 + 개별 강화)
const BuildingScene = (() => {
  let saveData = null;
  let selectedBuildingId = null;

  function getBuildingLevel(id) {
    return (saveData.buildings || {})[id] || 1;
  }

  function effectDesc(eff) {
    if (!eff) return Lang.getCurrent()==='en' ? 'No effect yet' : '효과 없음';
    switch (eff.type) {
      case 'weapon_discount':
      case 'companion_discount':
      case 'slot_discount':
        return (Lang.getCurrent()==='en' ? 'Upgrade cost -' : '강화 비용 -') + eff.pct + '%';
      case 'dungeon_income':
        return (Lang.getCurrent()==='en' ? 'Dungeon income +' : '던전 수익 +') + eff.pct + '%';
      default:
        return '';
    }
  }

  function enter(el) {
    saveData = Save.load();
    selectedBuildingId = null;
    render(el);
  }

  function exit() {}

  function render(el) {
    if (selectedBuildingId) {
      renderDetail(el, selectedBuildingId);
    } else {
      renderList(el);
    }
  }

  function renderList(el) {
    const unlocked = Unlock.getUnlocked(saveData);
    const isEn = Lang.getCurrent() === 'en';

    const unlockedBuildings = GAME_DATA.buildings.filter(b => unlocked.has(b.id) || unlocked.has('daejanggan'));
    // 실제로 unlock된 것만: UNLOCK_TABLE의 id 기준
    const unlockedIds = Unlock.UNLOCK_TABLE
      .filter(e => e.condition(saveData))
      .map(e => e.id);

    const buildings = GAME_DATA.buildings.filter(b => unlockedIds.includes(b.id));

    el.innerHTML = `
      <div style="
        height:844px;
        background:linear-gradient(180deg,#0a0610 0%,#12091e 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
        color:#e8d8ff;
        display:flex;flex-direction:column;
      ">
        <!-- 상단 바 -->
        <div style="
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 20px 12px;
          border-bottom:1px solid rgba(200,160,255,0.15);
        ">
          <button onclick="SceneManager.go('lobby')" style="
            background:none;border:none;color:rgba(200,160,255,0.7);
            font-size:22px;cursor:pointer;padding:4px 8px;
          ">←</button>
          <div style="font-size:17px;letter-spacing:.15em;color:#e0c8ff;">
            🏛️ ${isEn ? 'Buildings' : '건물'}
          </div>
          <div style="font-size:12px;color:#c8a0e0;">
            ${_cimg('cheonunseok')} ${(saveData.cheonunseok||0)}
          </div>
        </div>

        <!-- 건물 목록 -->
        <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;">
          ${buildings.length === 0
            ? `<div style="text-align:center;color:rgba(200,160,255,0.4);margin-top:60px;font-size:14px;">
                ${isEn ? 'No buildings unlocked yet.' : '아직 해금된 건물이 없습니다.'}
               </div>`
            : buildings.map(b => buildingCard(b, isEn)).join('')
          }
        </div>
      </div>
    `;
  }

  function buildingCard(b, isEn) {
    const lv = getBuildingLevel(b.id);
    const maxLv = b.levels.length;
    const curEff = b.levels.find(l => l.lv === lv)?.effect;
    const isMax = lv >= maxLv;

    const lvColors = ['#555','#4a90d9','#7ab648','#e8a020','#c060d0'];
    const lvColor = lvColors[Math.min(lv-1, lvColors.length-1)];
    const lvEntry = b.levels.find(l => l.lv === lv);
    const lvLabel = isEn ? (lvEntry?.labelEn || '') : (lvEntry?.label || '');

    const lobbyInfo = Unlock.LOBBY_BUILDINGS.find(lb => lb.id === b.id);
    const targetScene = lobbyInfo ? lobbyInfo.scene : 'lobby';

    return `
      <div style="
        background:rgba(255,255,255,0.04);
        border:1px solid rgba(200,160,255,0.2);
        border-radius:14px;padding:16px;
      ">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px;">
          <div style="font-size:36px;flex-shrink:0;">${b.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:15px;font-weight:bold;color:#e0c8ff;">${isEn ? (b.nameEn||b.name) : b.name}</span>
              <span style="font-size:10px;padding:2px 7px;border-radius:10px;
                background:${lvColor}33;border:1px solid ${lvColor};color:${lvColor};">
                ${isEn ? 'Lv.'+lv : lvLabel}
              </span>
            </div>
            <div style="font-size:11px;color:rgba(200,160,255,0.5);margin-bottom:2px;">${isEn ? (b.roleEn||b.role) : b.role}</div>
            <div style="font-size:11px;color:rgba(200,200,200,0.6);">
              ${curEff ? effectDesc(curEff) : (isEn ? 'No effect' : '효과 없음')}
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="SceneManager.go('${targetScene}')" style="
            flex:1;padding:9px 0;border-radius:10px;font-size:13px;font-weight:600;
            font-family:inherit;cursor:pointer;
            background:rgba(200,160,255,0.12);border:1px solid rgba(200,160,255,0.35);
            color:#d0b8f0;
          ">${isEn ? 'Enter' : '건물 가기'}</button>
          <button onclick="BuildingScene.selectBuilding('${b.id}')" style="
            flex:1;padding:9px 0;border-radius:10px;font-size:13px;font-weight:600;
            font-family:inherit;cursor:pointer;
            background:${isMax ? 'rgba(80,80,80,0.2)' : 'rgba(200,160,40,0.2)'};
            border:1px solid ${isMax ? 'rgba(255,255,255,0.1)' : 'rgba(240,200,64,0.4)'};
            color:${isMax ? 'rgba(255,255,255,0.25)' : '#f0c840'};
          ">${isMax ? (isEn ? '✨ MAX' : '✨ 최대') : (isEn ? 'Upgrade' : '강화')}</button>
        </div>
      </div>
    `;
  }

  function renderDetail(el, buildingId) {
    const b = GAME_DATA.buildings.find(x => x.id === buildingId);
    if (!b) { selectedBuildingId = null; renderList(el); return; }

    const lv = getBuildingLevel(buildingId);
    const maxLv = b.levels.length;
    const isMax = lv >= maxLv;
    const nextLvData = b.levels.find(l => l.lv === lv + 1);
    const isEn = Lang.getCurrent() === 'en';
    const gold = saveData.gold || 0;
    const cheonunseok = saveData.cheonunseok || 0;

    const canUpgrade = !isMax && nextLvData &&
      gold >= nextLvData.cost.gold &&
      cheonunseok >= nextLvData.cost.cheonunseok;

    const lvColors = ['#555','#4a90d9','#7ab648','#e8a020','#c060d0'];

    const levelsHtml = b.levels.map(l => {
      const isCur = l.lv === lv;
      const isPast = l.lv < lv;
      const color = lvColors[Math.min(l.lv-1, lvColors.length-1)];
      const label = isEn ? (l.labelEn || '') : (l.label || '');
      return `
        <div style="
          display:flex;align-items:center;gap:10px;padding:10px 12px;
          border-radius:10px;margin-bottom:6px;
          background:${isCur ? 'rgba(200,160,255,0.1)' : 'rgba(255,255,255,0.02)'};
          border:1px solid ${isCur ? 'rgba(200,160,255,0.4)' : 'rgba(255,255,255,0.06)'};
        ">
          <div style="width:28px;height:28px;border-radius:50%;
            background:${isPast||isCur ? color+'33' : 'rgba(80,80,80,0.2)'};
            border:1px solid ${isPast||isCur ? color : 'rgba(255,255,255,0.1)'};
            display:flex;align-items:center;justify-content:center;
            font-size:11px;color:${isPast||isCur ? color : 'rgba(255,255,255,0.2)'};">
            ${isPast||isCur ? '✓' : l.lv}
          </div>
          <div style="flex:1;">
            <div style="font-size:12px;color:${isCur ? '#e0c8ff' : isPast ? 'rgba(200,160,255,0.5)' : 'rgba(255,255,255,0.25)'};">
              Lv.${l.lv} ${label}
            </div>
            <div style="font-size:11px;color:rgba(200,200,200,0.4);">
              ${effectDesc(l.effect)}
            </div>
          </div>
          ${!isPast && !isCur && l.cost.gold > 0 ? `
          <div style="font-size:10px;color:rgba(200,200,200,0.35);text-align:right;">
            ${_cimg('gold')}${l.cost.gold.toLocaleString()}<br>${_cimg('cheonunseok')}${l.cost.cheonunseok}
          </div>` : ''}
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div style="
        height:844px;
        background:linear-gradient(180deg,#0a0610 0%,#12091e 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
        color:#e8d8ff;
        display:flex;flex-direction:column;
      ">
        <!-- 상단 바 -->
        <div style="
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 20px 12px;
          border-bottom:1px solid rgba(200,160,255,0.15);
        ">
          <button onclick="BuildingScene.backToList()" style="
            background:none;border:none;color:rgba(200,160,255,0.7);
            font-size:22px;cursor:pointer;padding:4px 8px;
          ">←</button>
          <div style="font-size:17px;letter-spacing:.1em;color:#e0c8ff;">
            ${b.icon} ${isEn ? (b.nameEn||b.name) : b.name}
          </div>
          <div style="font-size:12px;color:#f0c840;">
            ${_cimg('gold')}${gold.toLocaleString()} ${_cimg('cheonunseok')}${cheonunseok}
          </div>
        </div>

        <div style="flex:1;overflow-y:auto;padding:16px 16px 40px;">
          <!-- 역할 설명 -->
          <div style="
            background:rgba(200,160,255,0.06);
            border:1px solid rgba(200,160,255,0.15);
            border-radius:12px;padding:14px 16px;margin-bottom:16px;
          ">
            <div style="font-size:12px;color:rgba(200,160,255,0.5);margin-bottom:4px;">
              ${isEn ? 'Role' : '역할'}
            </div>
            <div style="font-size:13px;color:#d0b8f0;">${isEn ? (b.roleEn||b.role) : b.role}</div>
            <div style="font-size:11px;color:rgba(200,160,255,0.4);margin-top:6px;">${isEn ? (b.descEn||b.desc) : b.desc}</div>
          </div>

          <!-- 레벨 단계 -->
          <div style="margin-bottom:16px;">
            <div style="font-size:11px;color:rgba(200,160,255,0.5);letter-spacing:.1em;margin-bottom:8px;">
              ${isEn ? 'UPGRADE LEVELS' : '강화 단계'}
            </div>
            ${levelsHtml}
          </div>

          <!-- 강화 버튼 -->
          ${isMax
            ? `<div style="text-align:center;padding:14px;color:rgba(200,160,255,0.4);font-size:13px;">
                ${isEn ? '✨ Max Level' : '✨ 최대 강화 완료'}
               </div>`
            : `<button onclick="BuildingScene.upgrade('${buildingId}')" style="
                width:100%;padding:14px;border-radius:12px;font-size:14px;
                font-family:inherit;cursor:${canUpgrade?'pointer':'not-allowed'};
                background:${canUpgrade?'rgba(200,160,40,0.35)':'rgba(80,80,80,0.2)'};
                border:1px solid ${canUpgrade?'rgba(240,200,64,0.6)':'rgba(255,255,255,0.1)'};
                color:${canUpgrade?'#f0c840':'rgba(255,255,255,0.25)'};
                letter-spacing:.05em;
              ">
                ${isEn?'Upgrade':'강화'} Lv.${lv} → Lv.${lv+1}
                &nbsp;|&nbsp; ${_cimg('gold')}${nextLvData.cost.gold.toLocaleString()} + ${_cimg('cheonunseok')}${nextLvData.cost.cheonunseok}
              </button>`
          }
        </div>
      </div>
    `;
  }

  function selectBuilding(id) {
    selectedBuildingId = id;
    render(document.getElementById('app'));
  }

  function backToList() {
    selectedBuildingId = null;
    render(document.getElementById('app'));
  }

  function upgrade(buildingId) {
    const b = GAME_DATA.buildings.find(x => x.id === buildingId);
    if (!b) return;
    const lv = getBuildingLevel(buildingId);
    const nextLvData = b.levels.find(l => l.lv === lv + 1);
    if (!nextLvData) return;

    if ((saveData.gold||0) < nextLvData.cost.gold) return;
    if ((saveData.cheonunseok||0) < nextLvData.cost.cheonunseok) return;

    saveData.gold -= nextLvData.cost.gold;
    saveData.cheonunseok = (saveData.cheonunseok||0) - nextLvData.cost.cheonunseok;
    if (!saveData.buildings) saveData.buildings = {};
    saveData.buildings[buildingId] = lv + 1;
    Save.save(saveData);

    render(document.getElementById('app'));
  }

  return { enter, exit, selectBuilding, backToList, upgrade };
})();
