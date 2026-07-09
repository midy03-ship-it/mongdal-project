// blacksmith-scene.js - 대장간: 무기 구매 · 강화
const BlacksmithScene = (() => {

  const WEAPON_PRICE = 500; // 골드
  // 무한 강화: MAX_LEVEL 없음. 4강마다 각성 (0각~∞각)

  let _activeSlot = 0; // 현재 선택된 슬롯 인덱스

  const WEAPON_LIST = [
    { id: 'talisman',    name: '부적',        nameEn: 'Talisman', icon: '📜', free: true,
      desc: '귀신을 봉인하는 부적을 날린다.',       descEn: 'Launches a sealing talisman.' },
    { id: 'sword',       name: '신검',        nameEn: 'Sword',    icon: '⚔️', free: false,
      desc: '신령한 검으로 적을 베어낸다.',          descEn: 'Slash enemies with a divine sword.' },
    { id: 'bow',         name: '신궁',        nameEn: 'Bow',      icon: '🏹', free: false,
      desc: '정확한 화살로 적을 꿰뚫는다.',          descEn: 'Pierce enemies with precise arrows.' },
    { id: 'staff',       name: '무당 지팡이',  nameEn: 'Staff',   icon: '🪄', free: false,
      desc: '영혼체가 주변을 선회하며 공격한다.',     descEn: 'Spirit orbs orbit and strike foes.' },
    { id: 'scythe_main', name: '영혼낫',      nameEn: 'Scythe',  icon: '🌙', free: false,
      desc: '초승달 낫이 주변을 회전하며 베어낸다.',  descEn: 'A crescent scythe rotates and slashes.' },
  ];

  // [UPDATE 2026-07-06] 강화 비용: 누적 강화 단계(currentLv) 자체 기준으로 계속 상승
  // computeWeaponGrowth와 동일 공식 사용 → 각성 표시 방식이 바뀌어도 비용 곡선은 그대로 유지
  function upgradeCost(currentLv) {
    const tier  = currentLv;
    const ganghwa = tier * 50;
    const gold    = Math.round(tier * 150 * 1.5);
    return { ganghwa, gold };
  }

  // [UPDATE 2026-07-06] 각성 단계: computeWeaponGrowth 위임
  function getAwakening(lv) {
    return computeWeaponGrowth(lv).awakLv;
  }
  function getAwakeningDisplay(lv) {
    return computeWeaponGrowth(lv).awakLv;
  }

  // 티어 내 레벨
  function getLvInTier(lv) {
    return computeWeaponGrowth(lv).lv;
  }

  // 표시용 레벨 라벨 — 별 개수 + (n/4) 진행도 + 데미지 보너스
  function getLvLabel(lv) {
    const g = computeWeaponGrowth(lv);
    const awakLv = g.awakLv;
    let starStr = '';
    if (awakLv === 0) {
      starStr = ''; // 0각 = 별 없이 Lv만 표시
    } else if (awakLv <= 4) {
      starStr = '⭐'.repeat(awakLv) + ' ';
    } else if (awakLv === 5) {
      starStr = `<span style="font-size:12px;font-weight:700;
        background:linear-gradient(90deg,#ff6060,#ff9900,#ffe000,#60ff60,#60c0ff);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        background-clip:text;">★MAX</span> `;
    } else {
      const overStep = awakLv - 5;
      starStr = `<span style="font-size:12px;font-weight:700;
        background:linear-gradient(90deg,#ff6060,#ff9900,#ffe000,#60ff60,#60c0ff);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        background-clip:text;">★MAX</span><span style="font-size:10px;color:#ff8844;">+${overStep}</span> `;
    }
    const dmgBonus = g.overSteps > 0
      ? `<span style="font-size:10px;color:#ff8844;">+${g.overSteps*8}%dmg</span> `
      : '';
    return `${starStr}${dmgBonus}Lv.${g.lv}`;
  }

  function getWeaponImg(id) {
    const sc = SPRITES?.weapons?.[id];
    if (!sc) return null;
    return SpriteLoader.get(sc.src);
  }

  function enter(el) {
    _activeSlot = 0;
    const saveData = Save.load();
    render(el, saveData);
  }

  function exit() {}

  // [UPDATE 2026-07-08] 버튼 클릭 후 재렌더 시 무기 목록 스크롤 위치 유지 (기존엔 매번 맨 위로 초기화됨)
  function rerender(saveData) {
    const list = document.getElementById('bs-weapon-list');
    const scrollTop = list ? list.scrollTop : 0;
    render(document.getElementById('app'), saveData);
    const newList = document.getElementById('bs-weapon-list');
    if (newList) newList.scrollTop = scrollTop;
  }

  function selectSlot(idx) {
    _activeSlot = idx;
    const saveData = Save.load();
    rerender(saveData);
  }

  // [UPDATE 2026-07-08] 무기 초월 해금 조건: 5각 Lv4 도달(총 21강) — 미확정 임시 기준, 추후 조정 가능
  function isTranscendUnlocked(lv) {
    return computeWeaponGrowth(lv).awakLv >= 5;
  }

  function render(el, saveData) {
    const unlocked       = saveData.unlockedWeapons || ['talisman'];
    const selectedMains  = saveData.selectedMainWeapons || [saveData.selectedMainWeapon || 'talisman'];
    const gold           = saveData.gold        || 0;
    const ganghwa        = saveData.ganghwaseok || 0;
    const yeongon        = saveData.yeongonseok || 0;
    const chaewon        = saveData.chaewonseok || 0;
    const levels         = saveData.weaponLevels || {};
    const transcend       = saveData.weaponTranscend || {};
    const isEn           = Lang.getCurrent() === 'en';

    const _hasNormal  = (saveData.clearedStagesNormal || []).length > 0;
    const _hasHard    = (saveData.clearedStagesHard   || []).length > 0;
    const _slotCount  = _hasHard ? 3 : _hasNormal ? 2 : 1;
    const _unlockLabels = ['', Lang.t('character','slotUnlockNormal'), Lang.t('character','slotUnlockHard')];
    const _diffColors = ['#60c060', '#f0c040', '#ff6040'];

    // _activeSlot이 현재 슬롯 수를 벗어나지 않도록 보정
    if (_activeSlot >= _slotCount) _activeSlot = 0;

    // 슬롯 바 HTML
    const slotBarHTML = (() => {
      return `<div style="display:flex;gap:8px;padding:10px 16px;
        border-bottom:1px solid rgba(200,160,255,0.15);background:rgba(0,0,0,0.15);">
        ${[0,1,2].map(i => {
          const locked  = i >= _slotCount;
          const active  = !locked && i === _activeSlot;
          const wid     = selectedMains[i];
          const wdef    = wid ? WEAPON_LIST.find(w => w.id === wid) : null;
          const img     = wid ? getWeaponImg(wid) : null;
          return `<div onclick="${!locked ? `BlacksmithScene.selectSlot(${i})` : ''}"
            style="flex:1;border-radius:10px;padding:6px 4px;text-align:center;cursor:${locked?'default':'pointer'};
              border:2px solid ${active ? _diffColors[i] : locked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)'};
              background:${active ? `${_diffColors[i]}18` : 'rgba(0,0,0,0.2)'};
              opacity:${locked ? 0.35 : 1};position:relative;">
            <div style="font-size:8px;color:${_diffColors[i]};margin-bottom:3px;letter-spacing:.04em;">${isEn?`Slot ${i+1}`:`슬롯 ${i+1}`}</div>
            ${locked
              ? `<div style="font-size:18px;">🔒</div><div style="font-size:7px;color:#5a4a4a;">${_unlockLabels[i]}</div>`
              : wdef
                ? (img
                    ? `<img src="${img.src}" style="width:32px;height:32px;object-fit:contain;image-rendering:pixelated;">`
                    : `<div style="font-size:22px;">${wdef.icon}</div>`)
                  + `<div style="font-size:8px;color:#c8b8e8;margin-top:1px;">${isEn?wdef.nameEn:wdef.name}</div>`
                : `<div style="font-size:22px;opacity:0.3;">⬜</div><div style="font-size:8px;color:#555;">${isEn?'Empty':'비어있음'}</div>`
            }
            ${active && !locked ? `<div style="position:absolute;bottom:2px;right:4px;font-size:7px;color:${_diffColors[i]};">${isEn?'▶Active':'▶선택중'}</div>` : ''}
          </div>`;
        }).join('')}
      </div>`;
    })();

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
            ⚒️ ${isEn ? 'Blacksmith' : '대장간'}
          </div>
          <div style="font-size:13px;color:#f0c840;display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;">
            <span>${_cimg('gold')} ${gold.toLocaleString()}</span>
            <span style="color:#c0e0ff;">${_cimg('ganghwaseok')} ${ganghwa}</span>
            <span style="color:#d0a0ff;">${_cimg('yeongonseok')} ${yeongon}</span>
          </div>
        </div>

        <!-- 슬롯 바 -->
        ${slotBarHTML}

        <!-- 무기 목록 -->
        <div id="bs-weapon-list" style="flex:1;overflow-y:auto;padding:16px 16px 40px;display:flex;flex-direction:column;gap:12px;">
          ${WEAPON_LIST.map(w => weaponCard(w, unlocked, selectedMains, gold, ganghwa, levels, isEn, _slotCount, isEn?['Slot 1','Slot 2','Slot 3']:['슬롯 1','슬롯 2','슬롯 3'], _diffColors, transcend, yeongon, chaewon)).join('')}
        </div>
      </div>
    `;
  }

  function weaponCard(w, unlocked, selectedMains, gold, ganghwa, levels, isEn, slotCount, diffLabels, diffColors, transcend, yeongon, chaewon) {
    const isOwned    = unlocked.includes(w.id);
    const canBuy     = !isOwned && gold >= WEAPON_PRICE;
    const name       = isEn ? w.nameEn : w.name;
    const desc       = isEn ? w.descEn : w.desc;
    const lv         = (levels[w.id] || 1);
    const awakening  = getAwakening(lv);
    const lvLabel    = getLvLabel(lv);
    const cost       = upgradeCost(lv);
    const canUpgrade = isOwned && ganghwa >= cost.ganghwa && gold >= cost.gold;

    // 어느 슬롯에 장착 중인지 (여러 슬롯 가능)
    const equippedSlots = selectedMains
      .slice(0, slotCount)
      .map((wid, i) => wid === w.id ? i : -1)
      .filter(i => i >= 0);
    const isEquippedInActive = equippedSlots.includes(_activeSlot);

    const img = getWeaponImg(w.id);
    const imgHtml = img
      ? `<img src="${img.src}" style="width:52px;height:52px;object-fit:contain;image-rendering:pixelated;">`
      : `<div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:30px;">${w.icon}</div>`;

    // 각성 색상
    const awakeColors = ['#888','#4a90d9','#7ab648','#e8a020','#c060d0','#ff4060'];
    const awakeColor  = awakeColors[Math.min(awakening, awakeColors.length-1)];

    // 슬롯 뱃지 (장착된 슬롯 표시)
    const slotBadges = equippedSlots.length > 0
      ? equippedSlots.map(i => `<span style="font-size:9px;padding:1px 5px;border-radius:6px;
          background:${diffColors[i]}22;border:1px solid ${diffColors[i]};color:${diffColors[i]};">
          ${diffLabels[i]}
        </span>`).join('')
      : '';

    // 구매/장착 버튼
    let actionBtn = '';
    if (isEquippedInActive) {
      actionBtn = `<div style="font-size:11px;padding:5px 10px;border-radius:7px;
        background:rgba(100,200,120,0.2);border:1px solid rgba(120,220,140,0.5);
        color:#80f0a0;">✓ ${diffLabels[_activeSlot]} ${isEn?'Equipped':'장착중'}</div>`;
    } else if (isOwned) {
      actionBtn = `<button onclick="BlacksmithScene.selectWeapon('${w.id}')" style="
        font-size:11px;padding:5px 10px;border-radius:7px;cursor:pointer;font-family:inherit;
        background:rgba(140,80,220,0.3);border:1px solid rgba(200,160,255,0.5);color:#e0c8ff;">
        ${isEn?`Equip: ${diffLabels[_activeSlot]}`:`${diffLabels[_activeSlot]}에 장착`}</button>`;
    } else if (w.free) {
      actionBtn = `<div style="font-size:11px;color:rgba(200,160,255,0.4);">${isEn?'Default':'기본 제공'}</div>`;
    } else {
      actionBtn = `<button onclick="BlacksmithScene.buyWeapon('${w.id}')" style="
        font-size:11px;padding:5px 10px;border-radius:7px;cursor:pointer;font-family:inherit;
        background:${canBuy?'rgba(200,160,40,0.3)':'rgba(80,80,80,0.2)'};
        border:1px solid ${canBuy?'rgba(240,200,64,0.6)':'rgba(255,255,255,0.1)'};
        color:${canBuy?'#f0c840':'rgba(255,255,255,0.25)'};
        ${!canBuy?'cursor:not-allowed;':''}"> ${_cimg('gold')}${WEAPON_PRICE.toLocaleString()}</button>`;
    }

    // 강화 버튼 (보유 시만)
    const upgradeBtn = isOwned
      ? `<button onclick="BlacksmithScene.upgradeWeapon('${w.id}')" style="
          font-size:11px;padding:5px 10px;border-radius:7px;cursor:${canUpgrade?'pointer':'not-allowed'};
          font-family:inherit;
          background:${canUpgrade?'rgba(192,224,255,0.15)':'rgba(80,80,80,0.2)'};
          border:1px solid ${canUpgrade?'rgba(192,224,255,0.5)':'rgba(255,255,255,0.1)'};
          color:${canUpgrade?'#c0e0ff':'rgba(255,255,255,0.25)'};
        ">${_cimg('ganghwaseok')}${cost.ganghwa} ${_cimg('gold')}${cost.gold.toLocaleString()} ${isEn?'Enhance':'강화'}</button>`
      : '';

    // [UPDATE 2026-07-08] 초월 섹션 (5각 Lv4 도달 후 노출)
    const tRank = transcend[w.id] || 0;
    const tUnlocked = isOwned && isTranscendUnlocked(lv);
    let transcendHtml = '';
    if (tUnlocked) {
      const tMult = 1 + TRANSCEND_CUM_PCT[tRank] / 100;
      const tMax = tRank >= TRANSCEND_MAX_RANK;
      const tCost = tMax ? null : getTranscendCost(tRank + 1);
      const tCanUp = !tMax && tCost &&
        yeongon >= tCost.soul && gold >= tCost.gold &&
        ganghwa >= tCost.ganghwa && chaewon >= tCost.chaewon;
      const tCostLabel = tCost
        ? `${_cimg('yeongonseok')}${tCost.soul} ${_cimg('gold')}${tCost.gold.toLocaleString()}`
          + (tCost.ganghwa ? ` ${_cimg('ganghwaseok')}${tCost.ganghwa}` : '')
          + (tCost.chaewon ? ` ${_cimg('chaewonseok')}${tCost.chaewon}` : '')
        : '';
      transcendHtml = `
        <div style="margin-top:8px;padding:8px 10px;border-radius:9px;
          background:rgba(255,215,120,0.06);border:1px solid rgba(255,215,120,0.25);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">
            <span style="font-size:11px;color:#ffd878;">
              ✨ ${isEn?'Transcend':'초월'} ${tRank}/${TRANSCEND_MAX_RANK}
              <span style="color:rgba(255,216,120,0.6);">(+${TRANSCEND_CUM_PCT[tRank]}%${isEn?' dmg':'데미지'})</span>
              ${tRank >= 8 ? `<span style="color:#a0ffc0;">★${isEn?'Sub-mechanic active':'서브 메커닉 발동'}</span>` : ''}
            </span>
            ${tMax
              ? `<span style="font-size:10px;color:#ffd878;">MAX</span>`
              : `<button onclick="BlacksmithScene.upgradeTranscend('${w.id}')" style="
                  font-size:10px;padding:4px 8px;border-radius:6px;cursor:${tCanUp?'pointer':'not-allowed'};
                  font-family:inherit;
                  background:${tCanUp?'rgba(255,215,120,0.18)':'rgba(80,80,80,0.2)'};
                  border:1px solid ${tCanUp?'rgba(255,215,120,0.6)':'rgba(255,255,255,0.1)'};
                  color:${tCanUp?'#ffd878':'rgba(255,255,255,0.25)'};
                ">${tCostLabel}</button>`
            }
          </div>
        </div>`;
    } else if (isOwned) {
      transcendHtml = `
        <div style="margin-top:8px;font-size:10px;color:rgba(255,255,255,0.25);">
          🔒 ${isEn?'Transcend unlocks at ★MAX (5-awaken Lv4)':'초월은 5각 Lv4(★MAX) 도달 시 해금'}
        </div>`;
    }

    return `
      <div style="
        background:${isEquippedInActive?'rgba(100,200,120,0.06)':'rgba(255,255,255,0.04)'};
        border:1px solid ${isEquippedInActive?`${diffColors[_activeSlot]}55`:isOwned?'rgba(200,160,255,0.2)':'rgba(255,255,255,0.07)'};
        border-radius:14px;padding:12px 14px;
        opacity:${isOwned?1:0.75};
      ">
        <!-- 상단: 이미지 + 이름/설명 -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="flex-shrink:0;">${imgHtml}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;">
              <span style="font-size:14px;font-weight:bold;color:${isOwned?'#e0c8ff':'rgba(200,160,255,0.4)'};">
                ${isOwned?'':'🔒 '}${name}
              </span>
              ${isOwned ? `<span style="font-size:10px;padding:2px 6px;border-radius:8px;
                background:${awakeColor}22;border:1px solid ${awakeColor};color:${awakeColor};">
                ${lvLabel}
              </span>` : ''}
              ${slotBadges}
            </div>
            <div style="font-size:11px;color:rgba(200,160,255,0.5);line-height:1.4;">${desc}</div>
            ${isOwned ? `<div style="font-size:10px;color:rgba(192,224,255,0.4);margin-top:3px;">
              ${isEn?`Next: ${getLvLabel(lv+1)} · ${_cimg('ganghwaseok')}${cost.ganghwa} · ${_cimg('gold')}${cost.gold.toLocaleString()}`:`다음: ${getLvLabel(lv+1)} · ${_cimg('ganghwaseok')}${cost.ganghwa}개 · ${_cimg('gold')}${cost.gold.toLocaleString()}`}
            </div>` : ''}
            ${transcendHtml}
          </div>
        </div>
        <!-- 하단: 버튼들 -->
        <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center;">
          ${actionBtn}
          ${upgradeBtn}
        </div>
      </div>
    `;
  }

  function buyWeapon(weaponId) {
    const saveData = Save.load();
    if ((saveData.gold || 0) < WEAPON_PRICE) return;
    const unlocked = saveData.unlockedWeapons || ['talisman'];
    if (unlocked.includes(weaponId)) return;

    saveData.gold -= WEAPON_PRICE;
    saveData.unlockedWeapons = [...unlocked, weaponId];
    if (!saveData.selectedMainWeapons) saveData.selectedMainWeapons = [saveData.selectedMainWeapon || 'talisman'];
    saveData.selectedMainWeapons[_activeSlot] = weaponId;
    if (_activeSlot === 0) saveData.selectedMainWeapon = weaponId;
    if (!saveData.weaponLevels) saveData.weaponLevels = {};
    saveData.weaponLevels[weaponId] = saveData.weaponLevels[weaponId] || 1;
    Save.save(saveData);
    rerender(saveData);
  }

  function selectWeapon(weaponId) {
    const saveData = Save.load();
    const unlocked = saveData.unlockedWeapons || ['talisman'];
    if (!unlocked.includes(weaponId)) return;
    if (!saveData.selectedMainWeapons) saveData.selectedMainWeapons = [saveData.selectedMainWeapon || 'talisman'];
    // 다른 슬롯에 이미 같은 무기가 있으면 그 슬롯을 비움
    saveData.selectedMainWeapons = saveData.selectedMainWeapons.map((wid, i) =>
      i !== _activeSlot && wid === weaponId ? null : wid
    );
    saveData.selectedMainWeapons[_activeSlot] = weaponId;
    if (_activeSlot === 0) saveData.selectedMainWeapon = weaponId;
    Save.save(saveData);
    rerender(saveData);
  }

  function upgradeWeapon(weaponId) {
    const saveData = Save.load();
    const unlocked = saveData.unlockedWeapons || ['talisman'];
    if (!unlocked.includes(weaponId)) return;
    if (!saveData.weaponLevels) saveData.weaponLevels = {};
    const lv = saveData.weaponLevels[weaponId] || 1;
    const cost = upgradeCost(lv);
    if ((saveData.ganghwaseok || 0) < cost.ganghwa) return;
    if ((saveData.gold || 0) < cost.gold) return;

    saveData.ganghwaseok -= cost.ganghwa;
    saveData.gold        -= cost.gold;
    saveData.weaponLevels[weaponId] = lv + 1;
    Save.save(saveData);
    rerender(saveData);
  }

  // [UPDATE 2026-07-08] 무기 초월: 재료 소모 후 랭크 +1
  function upgradeTranscend(weaponId) {
    const saveData = Save.load();
    const unlocked = saveData.unlockedWeapons || ['talisman'];
    if (!unlocked.includes(weaponId)) return;
    const lv = (saveData.weaponLevels || {})[weaponId] || 1;
    if (!isTranscendUnlocked(lv)) return;
    if (!saveData.weaponTranscend) saveData.weaponTranscend = {};
    const rank = saveData.weaponTranscend[weaponId] || 0;
    if (rank >= TRANSCEND_MAX_RANK) return;
    const cost = getTranscendCost(rank + 1);
    if ((saveData.yeongonseok || 0) < cost.soul) return;
    if ((saveData.gold || 0) < cost.gold) return;
    if ((saveData.ganghwaseok || 0) < cost.ganghwa) return;
    if ((saveData.chaewonseok || 0) < cost.chaewon) return;

    saveData.yeongonseok -= cost.soul;
    saveData.gold        -= cost.gold;
    saveData.ganghwaseok -= cost.ganghwa;
    saveData.chaewonseok -= cost.chaewon;
    saveData.weaponTranscend[weaponId] = rank + 1;
    Save.save(saveData);
    rerender(saveData);
  }

  return { enter, exit, buyWeapon, selectWeapon, upgradeWeapon, selectSlot, upgradeTranscend };
})();
