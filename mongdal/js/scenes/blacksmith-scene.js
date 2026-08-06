// blacksmith-scene.js - 대장간: 무기 구매 · 강화
const BlacksmithScene = (() => {

  const WEAPON_PRICE = 500; // 골드
  // 무한 강화: MAX_LEVEL 없음. 4강마다 각성 (0각~∞각)

  let _activeSlot = 0; // 현재 선택된 슬롯 인덱스

  // [UPDATE 2026-08-06] 이름/설명 텍스트는 lang.js(TEXT.ko/en.blacksmith.weapons.<id>)로 이관 —
  // 여기엔 언어 무관 데이터(아이콘/기본제공 여부)만 남김.
  const WEAPON_LIST = [
    { id: 'talisman',    icon: '📜', free: true },
    { id: 'sword',       icon: '⚔️', free: false },
    { id: 'bow',         icon: '🏹', free: false },
    { id: 'staff',       icon: '🪄', free: false },
    { id: 'scythe_main', icon: '🌙', free: false },
  ];

  // [UPDATE 2026-07-06] 강화 비용: 누적 강화 단계(currentLv) 자체 기준으로 계속 상승
  // computeWeaponGrowth와 동일 공식 사용 → 각성 표시 방식이 바뀌어도 비용 곡선은 그대로 유지
  function upgradeCost(currentLv) {
    const tier  = currentLv;
    const ganghwa = tier * 50;
    const gold    = Math.round(tier * 150 * 1.5);
    return { ganghwa, gold };
  }

  // [UPDATE 2026-08-06] x1/x10 일괄강화 표시용 총비용(레벨별 실합산) — player-scene.js의 upgradeCostBatch와 동일 패턴.
  function upgradeCostBatch(startLv, count) {
    let ganghwa = 0, gold = 0;
    for (let i = 0; i < count; i++) {
      const c = upgradeCost(startLv + i);
      ganghwa += c.ganghwa;
      gold += c.gold;
    }
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

  // [UPDATE 2026-07-13] 260713_MTOPC.md 17번: 9~10성(완전체) 도달 시 대장간 목록/슬롯바 아이콘도 완전체 이미지로 교체
  function getWeaponImg(id, rank) {
    const soulKey = id + '_soul';
    const useSoul = (rank || 0) >= 9 && SPRITES?.weapons?.[soulKey];
    const sc = useSoul ? SPRITES.weapons[soulKey] : SPRITES?.weapons?.[id];
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
    // [UPDATE 2026-07-17] 무기초월 재료를 yeongonseok(획득 경로 없어 영원히 0이던 유령 재화)에서
    // soulStones(명부강화와 동일, 드랍+차원상인 교환으로 실제 모을 수 있는 재화)로 통합
    const yeongon        = saveData.soulStones || 0;
    const chaewon        = saveData.chaewonseok || 0;
    const levels         = saveData.weaponLevels || {};
    const transcend       = saveData.weaponTranscend || {};

    const _hasNormal  = (saveData.clearedStagesNormal || []).length > 0;
    const _hasHard    = (saveData.clearedStagesHard   || []).length > 0;
    // [UPDATE 2026-07-11] 이지 전용 슬롯 확장(챕터5/시즌1클리어)도 반영 — 노말/하드 안 거쳐도 이지로 슬롯 늘어난 만큼은 여기서도 풀어줘야 인게임 활성 슬롯수와 안 어긋남
    const _easySlots  = (typeof StageSelectScene !== 'undefined') ? StageSelectScene.getEasySlotCount(saveData) : 1;
    const _slotCount  = Math.max(_hasHard ? 3 : _hasNormal ? 2 : 1, _easySlots);
    const _unlockLabels = ['', Lang.t('character','slotUnlockNormal'), Lang.t('character','slotUnlockHard')];
    const _diffColors = ['#60c060', '#f0c040', '#ff6040'];

    // _activeSlot이 현재 슬롯 수를 벗어나지 않도록 보정
    if (_activeSlot >= _slotCount) _activeSlot = 0;

    // [UPDATE 2026-07-11] 오행 펜타그램용 — 지금 선택 중인 슬롯 원소(반전강조) vs 다른 슬롯들의 원소(비교 대상)
    const _activeSlotEl = selectedMains[_activeSlot] ? MAIN_WEAPON_DEFS[selectedMains[_activeSlot]]?.element : null;
    const _otherSlotEls = selectedMains
      .slice(0, _slotCount)
      .map((wid, i) => (i !== _activeSlot && wid) ? MAIN_WEAPON_DEFS[wid]?.element : null)
      .filter(Boolean);

    // 슬롯 바 HTML
    const slotBarHTML = (() => {
      return `<div style="display:flex;gap:8px;padding:10px 16px;
        border-bottom:1px solid rgba(200,160,255,0.15);background:rgba(0,0,0,0.15);">
        ${[0,1,2].map(i => {
          const locked  = i >= _slotCount;
          const active  = !locked && i === _activeSlot;
          const wid     = selectedMains[i];
          const wdef    = wid ? WEAPON_LIST.find(w => w.id === wid) : null;
          const img     = wid ? getWeaponImg(wid, transcend[wid]) : null;
          return `<div onclick="${!locked ? `BlacksmithScene.selectSlot(${i})` : ''}"
            style="flex:1;border-radius:10px;padding:6px 4px;text-align:center;cursor:${locked?'default':'pointer'};
              border:2px solid ${active ? _diffColors[i] : locked ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)'};
              background:${active ? `${_diffColors[i]}18` : 'rgba(0,0,0,0.2)'};
              opacity:${locked ? 0.35 : 1};position:relative;">
            <div style="font-size:8px;color:${_diffColors[i]};margin-bottom:3px;letter-spacing:.04em;">${Lang.get('blacksmith.slotLabel').replace('{n}', i+1)}</div>
            ${locked
              ? `<div style="font-size:18px;">🔒</div><div style="font-size:7px;color:#5a4a4a;">${_unlockLabels[i]}</div>`
              : wdef
                ? (img
                    ? `<img src="${img.src}" style="width:32px;height:32px;object-fit:contain;image-rendering:pixelated;">`
                    : `<div style="font-size:22px;">${wdef.icon}</div>`)
                  + `<div style="font-size:8px;color:#c8b8e8;margin-top:1px;">${Lang.get('blacksmith.weapons.' + wdef.id + '.name')}</div>`
                : `<div style="font-size:22px;opacity:0.3;">⬜</div><div style="font-size:8px;color:#555;">${Lang.get('blacksmith.empty')}</div>`
            }
            ${active && !locked ? `<div style="position:absolute;bottom:2px;right:4px;font-size:7px;color:${_diffColors[i]};">${Lang.get('blacksmith.active')}</div>` : ''}
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
            ⚒️ ${Lang.get('blacksmith.title')}
          </div>
          <div style="font-size:13px;color:#f0c840;display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;">
            <span>${_cimg('gold')} ${Format.num(gold)}</span>
            <span style="color:#c0e0ff;">${_cimg('ganghwaseok')} ${Format.num(ganghwa)}</span>
            <span style="color:#d0a0ff;">${_cimg('soulStones')} ${Format.num(yeongon)}</span>
          </div>
        </div>

        <!-- 슬롯 바 -->
        ${slotBarHTML}

        <!-- [UPDATE 2026-07-11] 오행 펜타그램 — 해쉬태그 리스트 대신 상생/상극 관계를 직관적으로 시각화 -->
        <div style="display:flex;flex-direction:column;align-items:center;padding:8px 16px;
          background:rgba(0,0,0,0.15);border-bottom:1px solid rgba(212,160,23,0.15);">
          <div style="font-size:9px;color:#8a7a6a;margin-bottom:2px;">
            ${Lang.get('blacksmith.elementRelations')}
          </div>
          ${elementPentagramSVG(_otherSlotEls, _activeSlotEl, 150)}
        </div>

        <!-- 무기 목록 -->
        <div id="bs-weapon-list" class="scroll-pan-y" style="flex:1;overflow-y:auto;padding:16px 16px 40px;display:flex;flex-direction:column;gap:12px;">
          ${WEAPON_LIST.map(w => weaponCard(w, unlocked, selectedMains, gold, ganghwa, levels, _slotCount, [1,2,3].map(n => Lang.get('blacksmith.slotLabel').replace('{n}', n)), _diffColors, transcend, yeongon, chaewon, _otherSlotEls)).join('')}
          ${saveData.season8ClearEnding ? aegissiTalismanCard(saveData, gold, ganghwa) : ''}
        </div>
      </div>
    `;
  }

  // [UPDATE 2026-08-02] 수호 부적(내부 필드명 aegissiTalisman은 하위호환용으로 유지) — 파트2 전용, "기록이 허락되지 않은" 별도 개체.
  // [UPDATE 2026-08-05] 이름 확정: 애기씨의 부적 → 수호 부적. HP는 300 * hpLv(내구 강화 레벨)로 스케일.
  // 이미지만 부적(talisman) 무기 스프라이트를 재사용할 뿐, 실제 장착/캐릭터 창과는 완전히 무관 —
  // selectedMainWeapons/unlockedWeapons를 전혀 건드리지 않는 독립 저장 필드(saveData.aegissiTalisman).
  // 강화 스킴은 기존 upgradeCost()를 그대로 재사용하되, 내구(HP)·일반(위력) 2개 트랙을 각자 독립 레벨로 운용.
  function aegissiTalismanCard(saveData, gold, ganghwa) {
    const t = saveData.aegissiTalisman || { hpLv: 1, pwrLv: 1 };
    const img = SPRITES?.weapons?.talisman ? SpriteLoader.get(SPRITES.weapons.talisman.src) : null;
    const hpCost  = upgradeCost(t.hpLv);
    const pwrCost = upgradeCost(t.pwrLv);
    const canHp  = ganghwa >= hpCost.ganghwa  && gold >= hpCost.gold;
    const canPwr = ganghwa >= pwrCost.ganghwa && gold >= pwrCost.gold;
    return `
      <div style="
        background:rgba(120,40,60,0.08);border:1px solid rgba(220,140,170,0.35);
        border-radius:14px;padding:12px 14px;margin-top:4px;
      ">
        <div style="font-size:10px;color:#ff9ab0;letter-spacing:.05em;margin-bottom:8px;">
          ⚠️ ${Lang.get('blacksmith.talismanCard.banner')}
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="flex-shrink:0;width:52px;height:52px;">
            ${img
              ? `<img src="${img.src}" style="width:52px;height:52px;object-fit:contain;image-rendering:pixelated;">`
              : `<div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:30px;">📜</div>`}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:bold;color:#ffd0dc;margin-bottom:3px;">
              ${Lang.get('blacksmith.talismanCard.title')}
            </div>
            <div style="font-size:11px;color:rgba(255,208,220,0.55);line-height:1.4;">
              ${Lang.get('blacksmith.talismanCard.desc')}
            </div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-size:11px;color:#ffb0c0;">${Lang.get('blacksmith.talismanCard.durability')} Lv.${t.hpLv} (HP ${300*t.hpLv})</span>
            <button onclick="BlacksmithScene.upgradeTalisman('hp')" style="
              font-size:11px;padding:5px 10px;border-radius:7px;cursor:${canHp?'pointer':'not-allowed'};
              font-family:inherit;
              background:${canHp?'rgba(255,150,170,0.18)':'rgba(80,80,80,0.2)'};
              border:1px solid ${canHp?'rgba(255,150,170,0.5)':'rgba(255,255,255,0.1)'};
              color:${canHp?'#ffb0c0':'rgba(255,255,255,0.25)'};
            ">${_cimg('ganghwaseok')}${Format.num(hpCost.ganghwa)} ${_cimg('gold')}${Format.num(hpCost.gold)} ${Lang.get('blacksmith.enhance')}</button>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-size:11px;color:#ffd0dc;">${Lang.get('blacksmith.talismanCard.power')} Lv.${t.pwrLv} (DMG ${50+(t.pwrLv-1)*3})</span>
            <button onclick="BlacksmithScene.upgradeTalisman('pwr')" style="
              font-size:11px;padding:5px 10px;border-radius:7px;cursor:${canPwr?'pointer':'not-allowed'};
              font-family:inherit;
              background:${canPwr?'rgba(255,180,200,0.18)':'rgba(80,80,80,0.2)'};
              border:1px solid ${canPwr?'rgba(255,180,200,0.5)':'rgba(255,255,255,0.1)'};
              color:${canPwr?'#ffd0dc':'rgba(255,255,255,0.25)'};
            ">${_cimg('ganghwaseok')}${Format.num(pwrCost.ganghwa)} ${_cimg('gold')}${Format.num(pwrCost.gold)} ${Lang.get('blacksmith.enhance')}</button>
          </div>
        </div>
      </div>
    `;
  }

  function upgradeTalisman(track) {
    const saveData = Save.load();
    if (!saveData.aegissiTalisman) saveData.aegissiTalisman = { hpLv: 1, pwrLv: 1 };
    const key = track === 'hp' ? 'hpLv' : 'pwrLv';
    const lv = saveData.aegissiTalisman[key] || 1;
    const cost = upgradeCost(lv);
    if ((saveData.ganghwaseok || 0) < cost.ganghwa) return;
    if ((saveData.gold || 0) < cost.gold) return;
    saveData.ganghwaseok -= cost.ganghwa;
    saveData.gold        -= cost.gold;
    saveData.aegissiTalisman[key] = lv + 1;
    Save.save(saveData);
    rerender(saveData);
  }

  function weaponCard(w, unlocked, selectedMains, gold, ganghwa, levels, slotCount, diffLabels, diffColors, transcend, yeongon, chaewon, otherSlotEls) {
    const isOwned    = unlocked.includes(w.id);
    const canBuy     = !isOwned && gold >= WEAPON_PRICE;
    const name       = Lang.get('blacksmith.weapons.' + w.id + '.name');
    const desc       = Lang.get('blacksmith.weapons.' + w.id + '.desc');
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

    const _wTRank = transcend[w.id] || 0;
    const img = getWeaponImg(w.id, _wTRank);
    // [UPDATE 2026-07-11] 오행 배지
    const _wElement = (typeof MAIN_WEAPON_DEFS!=='undefined' && MAIN_WEAPON_DEFS[w.id]?.element) || null;
    const _wBadge = _wElement ? elementBadgeHTML(_wElement) : '';
    // [UPDATE 2026-07-11] 다른 슬롯들과의 상생/상극 관계 — 카드 테두리 초록/빨강으로 직관적 표시
    const _wRelation = (!isEquippedInActive) ? elementRelation(_wElement, otherSlotEls) : null;
    // [UPDATE 2026-07-13] 260713_MTOPC.md 17번: 초월 랭크 구간별 카드 아이콘 발광 강도(1~4/5~8/9~10성)
    const _wGlow = _wTRank>=9 ? '0 0 14px 3px rgba(255,215,120,0.7)' : _wTRank>=5 ? '0 0 9px 1px rgba(255,215,120,0.4)' : _wTRank>=1 ? '0 0 5px 0px rgba(255,215,120,0.2)' : 'none';
    const imgHtml = `<div style="position:relative;width:52px;height:52px;flex-shrink:0;border-radius:8px;box-shadow:${_wGlow};">` + (img
      ? `<img src="${img.src}" style="width:52px;height:52px;object-fit:contain;image-rendering:pixelated;">`
      : `<div style="width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:30px;">${w.icon}</div>`
      ) + `${_wBadge}</div>`;

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
        color:#80f0a0;">✓ ${diffLabels[_activeSlot]} ${Lang.get('blacksmith.equipped')}</div>`;
    } else if (isOwned && equippedSlots.length > 0) {
      // [UPDATE 2026-07-11] 이미 다른 슬롯에 장착된 무기는 선택 불가 — 캐릭터 화면과 동일한 규칙.
      // (예전엔 여기서 선택 허용 → 원래 슬롯이 조용히 비워져서, 오행 슬롯매칭 시너지가 인덱스 밀림으로 꼬이는 원인이 됨)
      actionBtn = `<div style="font-size:10px;padding:5px 10px;border-radius:7px;
        background:rgba(80,80,80,0.15);border:1px solid rgba(255,255,255,0.08);color:#6a5a4a;">
        🔒 ${Lang.get('blacksmith.equippedIn').replace('{slot}', diffLabels[equippedSlots[0]])}</div>`;
    } else if (isOwned) {
      actionBtn = `<button onclick="BlacksmithScene.selectWeapon('${w.id}')" style="
        font-size:11px;padding:5px 10px;border-radius:7px;cursor:pointer;font-family:inherit;
        background:rgba(140,80,220,0.3);border:1px solid rgba(200,160,255,0.5);color:#e0c8ff;">
        ${Lang.get('blacksmith.equipTo').replace('{slot}', diffLabels[_activeSlot])}</button>`;
    } else if (w.free) {
      actionBtn = `<div style="font-size:11px;color:rgba(200,160,255,0.4);">${Lang.get('blacksmith.default')}</div>`;
    } else {
      actionBtn = `<button onclick="BlacksmithScene.buyWeapon('${w.id}')" style="
        font-size:11px;padding:5px 10px;border-radius:7px;cursor:pointer;font-family:inherit;
        background:${canBuy?'rgba(200,160,40,0.3)':'rgba(80,80,80,0.2)'};
        border:1px solid ${canBuy?'rgba(240,200,64,0.6)':'rgba(255,255,255,0.1)'};
        color:${canBuy?'#f0c840':'rgba(255,255,255,0.25)'};
        ${!canBuy?'cursor:not-allowed;':''}"> ${_cimg('gold')}${Format.num(WEAPON_PRICE)}</button>`;
    }

    // [UPDATE 2026-08-06] 강화 버튼 x1/x10 (보유 시만) — "하나씩 누르기 힘들다" 피드백, 캐릭터 스탯 강화와 동일 패턴.
    // 이미 액션버튼(장착/장착중 등)이 한 줄을 거의 채우고 있어서, 강화 버튼은 그 아래 별도 줄로 뺌(2열).
    const upgradeBtn = isOwned
      ? [1, 10].map(n => {
          const bc = upgradeCostBatch(lv, n);
          const canUp = ganghwa >= bc.ganghwa && gold >= bc.gold;
          return `<button onclick="BlacksmithScene.${n===1?`upgradeWeapon('${w.id}')`:`upgradeWeaponBulk('${w.id}',${n})`}" style="
              flex:1;font-size:11px;padding:5px 4px;border-radius:7px;cursor:${canUp?'pointer':'not-allowed'};
              font-family:inherit;
              background:${canUp?'rgba(192,224,255,0.15)':'rgba(80,80,80,0.2)'};
              border:1px solid ${canUp?'rgba(192,224,255,0.5)':'rgba(255,255,255,0.1)'};
              color:${canUp?'#c0e0ff':'rgba(255,255,255,0.25)'};
            ">×${n} ${_cimg('ganghwaseok')}${Format.num(bc.ganghwa)} ${_cimg('gold')}${Format.num(bc.gold)}</button>`;
        }).join('')
      : '';

    // [UPDATE 2026-07-08] 초월 섹션 (5각 Lv4 도달 후 노출)
    const tRank = _wTRank; // [UPDATE 2026-07-13] 위에서 이미 계산한 값 재사용
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
        ? `${_cimg('soulStones')}${Format.num(tCost.soul)} ${_cimg('gold')}${Format.num(tCost.gold)}`
          + (tCost.ganghwa ? ` ${_cimg('ganghwaseok')}${Format.num(tCost.ganghwa)}` : '')
          + (tCost.chaewon ? ` ${_cimg('chaewonseok')}${Format.num(tCost.chaewon)}` : '')
        : '';
      transcendHtml = `
        <div style="margin-top:8px;padding:8px 10px;border-radius:9px;
          background:rgba(255,215,120,0.06);border:1px solid rgba(255,215,120,0.25);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;">
            <span style="font-size:11px;color:#ffd878;">
              ✨ ${Lang.get('blacksmith.transcend')} ${tRank}/${TRANSCEND_MAX_RANK}
              <span style="color:rgba(255,216,120,0.6);">(+${TRANSCEND_CUM_PCT[tRank]}%${Lang.get('blacksmith.dmgSuffix')})</span>
              ${tRank >= 8 ? `<span style="color:#a0ffc0;">★${Lang.get('blacksmith.subMechanicActive')}</span>` : ''}
            </span>
            ${tMax
              ? `<span style="font-size:10px;color:#ffd878;">${Lang.get('blacksmith.transcendMax')}</span>`
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
          🔒 ${Lang.get('blacksmith.transcendLocked')}
        </div>`;
    }

    // [UPDATE 2026-07-11] 상생=초록/상극=빨강 테두리 (장착중인 슬롯 강조가 최우선)
    const _cardBorder = isEquippedInActive ? `${diffColors[_activeSlot]}55`
      : _wRelation==='gen'   ? 'rgba(94,194,106,0.7)'
      : _wRelation==='clash' ? 'rgba(192,72,72,0.7)'
      : isOwned ? 'rgba(200,160,255,0.2)' : 'rgba(255,255,255,0.07)';
    const _cardBg = isEquippedInActive ? 'rgba(100,200,120,0.06)'
      : _wRelation==='gen'   ? 'rgba(94,194,106,0.06)'
      : _wRelation==='clash' ? 'rgba(192,72,72,0.06)'
      : 'rgba(255,255,255,0.04)';
    return `
      <div style="
        background:${_cardBg};
        border:1px solid ${_cardBorder};
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
              ${Lang.get('blacksmith.next')}: ${getLvLabel(lv+1)} · ${_cimg('ganghwaseok')}${Format.num(cost.ganghwa)}${Lang.get('blacksmith.unitSuffix')} · ${_cimg('gold')}${Format.num(cost.gold)}
            </div>` : ''}
            ${transcendHtml}
          </div>
        </div>
        <!-- 하단: 버튼들 -->
        <!-- [UPDATE 2026-08-06] 강화가 x1/x10 두 버튼으로 늘면서 액션버튼(장착 등)과 한 줄에 다 못 들어가
             화면 밖으로 밀려날 수 있어서, 액션버튼 줄 / 강화버튼 줄로 2열 분리. -->
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div style="display:flex;justify-content:flex-end;align-items:center;">
            ${actionBtn}
          </div>
          ${isOwned ? `<div style="display:flex;gap:6px;">${upgradeBtn}</div>` : ''}
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
    checkTrinityToast(saveData); // [UPDATE 2026-07-13] 삼위일체 발동 토스트
    Save.save(saveData);
    rerender(saveData);
  }

  function selectWeapon(weaponId) {
    const saveData = Save.load();
    const unlocked = saveData.unlockedWeapons || ['talisman'];
    if (!unlocked.includes(weaponId)) return;
    if (!saveData.selectedMainWeapons) saveData.selectedMainWeapons = [saveData.selectedMainWeapon || 'talisman'];
    // [UPDATE 2026-07-11] 이미 다른 슬롯에 장착된 무기는 선택 불가 (캐릭터 화면과 동일 규칙) —
    // 예전처럼 조용히 다른 슬롯을 비우면 슬롯 인덱스가 밀려서 오행 슬롯매칭 시너지 계산이 꼬임
    const usedInOtherSlot = saveData.selectedMainWeapons.some((wid, i) => i !== _activeSlot && wid === weaponId);
    if (usedInOtherSlot) return;
    saveData.selectedMainWeapons[_activeSlot] = weaponId;
    if (_activeSlot === 0) saveData.selectedMainWeapon = weaponId;
    checkTrinityToast(saveData); // [UPDATE 2026-07-13] 삼위일체 발동 토스트
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

  // [UPDATE 2026-08-06] x10 일괄강화 — 1개씩 순서대로 사되 재화가 떨어지면 그 시점에서 멈춤(부분구매 허용).
  function upgradeWeaponBulk(weaponId, count) {
    const saveData = Save.load();
    const unlocked = saveData.unlockedWeapons || ['talisman'];
    if (!unlocked.includes(weaponId)) return;
    if (!saveData.weaponLevels) saveData.weaponLevels = {};
    for (let i = 0; i < count; i++) {
      const lv = saveData.weaponLevels[weaponId] || 1;
      const cost = upgradeCost(lv);
      if ((saveData.ganghwaseok || 0) < cost.ganghwa) break;
      if ((saveData.gold || 0) < cost.gold) break;
      saveData.ganghwaseok -= cost.ganghwa;
      saveData.gold        -= cost.gold;
      saveData.weaponLevels[weaponId] = lv + 1;
    }
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
    if ((saveData.soulStones || 0) < cost.soul) return;
    if ((saveData.gold || 0) < cost.gold) return;
    if ((saveData.ganghwaseok || 0) < cost.ganghwa) return;
    if ((saveData.chaewonseok || 0) < cost.chaewon) return;

    saveData.soulStones -= cost.soul;
    saveData.gold        -= cost.gold;
    saveData.ganghwaseok -= cost.ganghwa;
    saveData.chaewonseok -= cost.chaewon;
    saveData.weaponTranscend[weaponId] = rank + 1;
    Save.save(saveData);
    rerender(saveData);
  }

  return { enter, exit, buyWeapon, selectWeapon, upgradeWeapon, upgradeWeaponBulk, selectSlot, upgradeTranscend, upgradeTalisman };
})();
