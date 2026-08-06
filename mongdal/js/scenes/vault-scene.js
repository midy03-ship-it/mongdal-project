// vault-scene.js - 보물 창고(Vault): 계(시즌)별 특산품 보관소
// [UPDATE 2026-07-19] 로비 신규 건물 — 시즌1 클리어 시 삼신할머니/차원상인과 함께 해금.
// 특산품 탭(하드 난이도 전용 드랍, 보유량 비례 영구 보너스)과 잠긴 법칙-유물 탭 2개로 구성.
// 이번 단계는 UI 뼈대만 — 실제 하드모드 드랍 경제/스탯 적용은 후속 작업.
const VaultScene = (() => {
  let saveData = null;
  let activeTab = 'specialty'; // 'specialty' | 'law'
  let lawSubTab = 'passive'; // 'passive' | 'active' — [UPDATE 2026-07-24] 패시브(슬롯 없이 보유만 하면 적용) / 액티브(슬롯 3개 장착) 분리

  function render(el) {
    const isEn = Lang.getCurrent() === 'en';
    const items = GAME_DATA.specialtyItems || [];
    const owned = saveData.specialtyItems || {};
    // [UPDATE 2026-07-25] 버그 수정: 시즌 오픈 여부와 무관하게 4로 하드코딩되어 있어서 시즌5가 정식 공개된 뒤에도
    // 특산품이 계속 잠긴 채로 남아있었음 — CONFIG.CONTENT_RELEASE 기준 실시간 판정으로 교체 (시즌6~8도 오픈되면 자동 해금)
    // [UPDATE 2026-07-26] 버그 수정: 위 수정이 "빌드에 콘텐츠가 존재하는지"만 봐서, 플레이어가 아직 시즌3(망랑계)인데
    // 시즌5(선계) 특산품까지 전부 해금 표시되던 문제 — 실제로는 "그 시즌을 클리어했는지"(seasonNClear) 기준이어야 함

    el.innerHTML = `
      <div class="char-root">
        <div class="char-header">
          <button class="back-btn" onclick="SceneManager.go('lobby')">${Lang.t('vault','back')}</button>
          <h2 class="char-title">🗝️ ${Lang.t('vault','title')}</h2>
        </div>

        <!-- 탭 -->
        <div style="display:flex;gap:6px;padding:10px 16px 0;">
          <button onclick="VaultScene.setTab('specialty')" style="
            flex:1;padding:9px 0;border-radius:10px 10px 0 0;font-size:12px;font-weight:600;
            cursor:pointer;font-family:inherit;
            background:${activeTab==='specialty'?'rgba(212,160,23,0.18)':'rgba(255,255,255,0.04)'};
            border:1px solid ${activeTab==='specialty'?'rgba(212,160,23,0.6)':'rgba(255,255,255,0.1)'};
            border-bottom:none;
            color:${activeTab==='specialty'?'#f0d080':'#8a7a6a'};
          ">${Lang.t('vault','tabSpecialty')}</button>
          <button onclick="VaultScene.setTab('law')" style="
            flex:1;padding:9px 0;border-radius:10px 10px 0 0;font-size:12px;font-weight:600;
            cursor:pointer;font-family:inherit;
            background:${activeTab==='law'?'rgba(160,96,224,0.18)':'rgba(255,255,255,0.04)'};
            border:1px solid ${activeTab==='law'?'rgba(160,96,224,0.6)':'rgba(255,255,255,0.1)'};
            border-bottom:none;
            color:${activeTab==='law'?'#d0a0ff':'#8a7a6a'};
          ">${isSeasonReleased(6)?'':'🔒 '}${Lang.t('vault','tabLaw')}</button>
        </div>

        <div class="scroll-pan-y" style="flex:1;overflow-y:auto;padding:14px 16px;">
          ${activeTab === 'specialty' ? `
            <div style="font-size:10px;color:#8a7a6a;text-align:center;margin-bottom:12px;">
              🗡️ ${Lang.t('vault','hardOnly')}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              ${items.map(it => {
                const isLocked = !isSeasonReleased(it.season) || !saveData[`season${it.season}Clear`];
                const cnt = owned[it.id] || 0;
                // [UPDATE 2026-07-19] 이모지 플레이스홀더 → 전용 아이콘 이미지로 교체 (없으면 이모지 폴백)
                const _sc = SPRITES?.items?.[it.id];
                const _imgSrc = _sc ? SpriteLoader.get(_sc.src).src : '';
                const iconHTML = isLocked ? '🔒'
                  : _imgSrc ? `<img src="${_imgSrc}" style="width:28px;height:28px;object-fit:contain;image-rendering:pixelated;">`
                  : it.icon;
                return `
                <div style="
                  position:relative;padding:12px 10px;border-radius:12px;text-align:center;
                  background:rgba(12,8,24,0.9);
                  border:1px solid ${isLocked?'rgba(255,255,255,0.08)':'rgba(212,160,23,0.35)'};
                  ${isLocked?'opacity:0.45;':''}
                ">
                  <div style="font-size:9px;color:#8a7a6a;margin-bottom:4px;">S${it.season}</div>
                  <div style="font-size:28px;line-height:1;margin-bottom:6px;display:flex;align-items:center;justify-content:center;">${iconHTML}</div>
                  <div style="font-size:12px;color:#e8dcc8;font-weight:600;margin-bottom:2px;">
                    ${isEn ? it.nameEn : it.name}
                  </div>
                  <div style="font-size:10px;color:#a0906a;margin-bottom:6px;">
                    ${isEn ? it.descEn : it.desc}
                  </div>
                  <div style="font-size:11px;color:${cnt>0?'#f0d080':'#5a4a3a'};font-weight:700;">
                    ${Lang.t('vault','owned')} ${cnt}
                  </div>
                </div>`;
              }).join('')}
            </div>
          ` : !isSeasonReleased(6) ? `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
              padding:60px 20px;color:#8a7a6a;">
              <div style="font-size:48px;margin-bottom:14px;">🔒</div>
              <div style="font-size:13px;text-align:center;">${Lang.t('vault','lawLocked')}</div>
            </div>
          ` : _lawTabHTML(isEn)}
        </div>
      </div>`;
  }

  // [UPDATE 2026-07-24] 시즌6(원계) 법칙 시스템 — 3슬롯 장착 + 24종 해금/강화
  // [UPDATE 2026-07-24] 패시브/액티브 탭 분리 — 패시브는 슬롯 없이 보유만 하면 항상 적용,
  // 액티브만 3슬롯 장착 대상. equipLaw는 active 카테고리에만 허용.
  function _lawTabHTML(isEn) {
    const LC = CONFIG.LAW;
    const laws = saveData.laws || {};
    const slots = saveData.lawSlots || [null, null, null];
    const gi = saveData.gyulyulseok || 0;
    const KIND_LABEL = { plain: isEn?'Plain':'일반', conditional: isEn?'Conditional':'조건형' };
    const CAT_COLOR = { passive:'#78c8a0', active:'#e0a860' };
    const isPassiveTab = lawSubTab === 'passive';

    const subTabBar = `
      <div style="display:flex;gap:6px;margin-bottom:10px;">
        <button onclick="VaultScene.setLawSubTab('passive')" style="
          flex:1;padding:7px 0;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;
          background:${isPassiveTab?'rgba(120,200,160,0.18)':'rgba(255,255,255,0.04)'};
          border:1px solid ${isPassiveTab?'rgba(120,200,160,0.6)':'rgba(255,255,255,0.1)'};
          color:${isPassiveTab?'#78c8a0':'#8a7a6a'};">
          ${isEn?'Passive (auto — no slot needed)':'패시브 (슬롯 불필요, 보유만 해도 적용)'}
        </button>
        <button onclick="VaultScene.setLawSubTab('active')" style="
          flex:1;padding:7px 0;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;
          background:${!isPassiveTab?'rgba(224,168,96,0.18)':'rgba(255,255,255,0.04)'};
          border:1px solid ${!isPassiveTab?'rgba(224,168,96,0.6)':'rgba(255,255,255,0.1)'};
          color:${!isPassiveTab?'#e0a860':'#8a7a6a'};">
          ${isEn?'Active (equip 3 slots)':'액티브 (3슬롯 장착)'}
        </button>
      </div>`;

    const slotBar = isPassiveTab ? '' : `
      <div style="display:flex;gap:8px;justify-content:center;padding:4px 0 14px;">
        ${[0,1,2].map(i => {
          const id = slots[i];
          const def = id ? LC.LIST.find(l=>l.id===id) : null;
          const sc = def ? SPRITES?.laws?.[def.id] : null;
          const img = sc ? SpriteLoader.get(sc.src).src : '';
          return `<div onclick="${def?`VaultScene.unequipLawSlot(${i})`:''}" style="
            width:64px;height:64px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;
            background:rgba(160,96,224,0.08);border:1px solid rgba(160,96,224,0.3);cursor:${def?'pointer':'default'};position:relative;">
            ${def ? `
              <img src="${img}" style="width:30px;height:30px;object-fit:contain;image-rendering:pixelated;">
              <span style="font-size:8px;color:#d0a0ff;margin-top:2px;text-align:center;padding:0 2px;">${isEn?(def.nameEn||def.name):def.name}</span>
              <span style="position:absolute;top:2px;right:4px;font-size:8px;color:#888;">✕</span>
            ` : `<span style="font-size:20px;color:#5a4a6a;">⚖️</span><span style="font-size:8px;color:#5a4a6a;">${isEn?'Empty':'빈 슬롯'}</span>`}
          </div>`;
        }).join('')}
      </div>`;

    const list = LC.LIST.filter(d => d.category === (isPassiveTab ? 'passive' : 'active'));
    const cards = list.map(def => {
      const lv = laws[def.id] || 0;
      const isOwned = lv > 0;
      const isEquipped = slots.includes(def.id);
      const maxLv = def.category === 'passive' ? LC.PASSIVE_MAX_LV : LC.ACTIVE_MAX_LV;
      const isMax = lv >= maxLv;
      const unlockCost = def.category === 'passive' ? LC.PASSIVE_UNLOCK_COST : LC.ACTIVE_UNLOCK_COST;
      const upgCost = def.category === 'passive' ? LC.PASSIVE_BASE_COST + LC.PASSIVE_COST_STEP*lv : LC.ACTIVE_BASE_COST + LC.ACTIVE_COST_STEP*lv;
      const canUnlock = !isOwned && gi >= unlockCost;
      const canUpgrade = isOwned && !isMax && gi >= upgCost;
      const canEquip = isOwned && !isEquipped && slots.filter(Boolean).length < LC.SLOT_COUNT;
      const cc = CAT_COLOR[def.category];
      const sc = SPRITES?.laws?.[def.id];
      const img = sc ? SpriteLoader.get(sc.src).src : '';
      return `
        <div style="position:relative;padding:10px;border-radius:12px;text-align:center;
          background:rgba(12,8,24,0.9);border:1px solid ${isEquipped?'#d0a0ff':isOwned?cc+'55':'rgba(255,255,255,0.08)'};
          ${!isOwned?'opacity:0.65;':''}">
          <div style="display:flex;gap:4px;justify-content:center;margin-bottom:4px;">
            <span style="font-size:8px;padding:1px 5px;border-radius:5px;background:${cc}22;border:1px solid ${cc};color:${cc};">
              ${def.category==='passive'?(isEn?'Passive':'패시브'):(isEn?'Active':'액티브')}
            </span>
            <span style="font-size:8px;padding:1px 5px;border-radius:5px;background:rgba(255,255,255,0.06);color:#999;">${KIND_LABEL[def.kind]}</span>
            ${isOwned && def.category==='passive' ? `<span style="font-size:8px;padding:1px 5px;border-radius:5px;background:rgba(120,200,160,0.15);border:1px solid #78c8a0;color:#78c8a0;">${isEn?'✓ Active':'✓ 적용 중'}</span>` : ''}
          </div>
          <div style="font-size:26px;line-height:1;margin:4px 0;display:flex;align-items:center;justify-content:center;">
            ${img ? `<img src="${img}" style="width:30px;height:30px;object-fit:contain;image-rendering:pixelated;filter:${isOwned?'none':'grayscale(1)'};">` : '⚖️'}
          </div>
          <div style="font-size:11px;color:${isOwned?'#e8dcc8':'#665'};font-weight:600;">${isEn?(def.nameEn||def.name):def.name}</div>
          <div style="font-size:9px;color:#8a7a6a;margin:3px 0 6px;line-height:1.4;">${isEn?def.descEn:def.descKo}</div>
          <div style="font-size:10px;color:${isOwned?'#f0d080':'#5a4a3a'};font-weight:700;margin-bottom:6px;">
            ${isOwned ? (isMax?(isEn?'MAX':'만렙'):`Lv.${lv}`) : (isEn?'Locked':'미해금')}
          </div>
          ${!isOwned ? `
            <button onclick="VaultScene.unlockLaw('${def.id}')" style="
              width:100%;padding:5px 0;border-radius:7px;font-size:10px;font-weight:700;font-family:inherit;
              cursor:${canUnlock?'pointer':'default'};
              background:${canUnlock?'rgba(160,96,224,0.25)':'rgba(60,60,60,0.3)'};
              border:1px solid ${canUnlock?'#a060e0':'rgba(255,255,255,0.1)'};
              color:${canUnlock?'#d0a0ff':'#666'};">
              ${_cimg('gyulyulseok',10)} ${Format.num(unlockCost)} ${isEn?'Unlock':'해금'}
            </button>` : `
            <div style="display:flex;flex-direction:column;gap:4px;">
              ${!isMax ? `<button onclick="VaultScene.upgradeLaw('${def.id}')" style="
                width:100%;padding:5px 0;border-radius:7px;font-size:10px;font-weight:700;font-family:inherit;
                cursor:${canUpgrade?'pointer':'default'};
                background:${canUpgrade?'rgba(240,208,128,0.18)':'rgba(60,60,60,0.3)'};
                border:1px solid ${canUpgrade?'#f0d080':'rgba(255,255,255,0.1)'};
                color:${canUpgrade?'#f0d080':'#666'};">
                ${_cimg('gyulyulseok',10)} ${Format.num(upgCost)} ${isEn?'Enhance':'강화'}
              </button>` : ''}
              ${def.category==='active' ? (!isEquipped ? `<button onclick="VaultScene.equipLaw('${def.id}')" style="
                width:100%;padding:5px 0;border-radius:7px;font-size:10px;font-weight:700;font-family:inherit;
                cursor:${canEquip?'pointer':'default'};
                background:${canEquip?'rgba(100,160,220,0.2)':'rgba(60,60,60,0.3)'};
                border:1px solid ${canEquip?'rgba(100,160,220,0.5)':'rgba(255,255,255,0.1)'};
                color:${canEquip?'#80b8f0':'#666'};">
                ${isEn?'Equip':'장착'}
              </button>` : `<div style="font-size:9px;color:#d0a0ff;padding:3px 0;">${isEn?'✓ Equipped':'✓ 장착 중'}</div>`) : ''}
            </div>`}
        </div>`;
    }).join('');

    return `
      ${subTabBar}
      <div style="font-size:10px;color:rgba(200,160,255,0.5);text-align:center;margin-bottom:2px;">
        ${isEn?`Have ${_cimg('gyulyulseok',12)}${Format.num(gi)}`:`보유 ${_cimg('gyulyulseok',12)}${Format.num(gi)}`}
      </div>
      ${slotBar}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">${cards}</div>`;
  }

  function setTab(tab) {
    activeTab = tab;
    refresh();
  }

  // [UPDATE 2026-07-24] 법칙 해금/강화/장착 — 규율석 소비
  function unlockLaw(id) {
    saveData = Save.load();
    if (!isSeasonReleased(6)) return;
    const def = CONFIG.LAW.LIST.find(l => l.id === id);
    if (!def) return;
    if (!saveData.laws) saveData.laws = {};
    if (saveData.laws[id]) return;
    const cost = def.category === 'passive' ? CONFIG.LAW.PASSIVE_UNLOCK_COST : CONFIG.LAW.ACTIVE_UNLOCK_COST;
    if ((saveData.gyulyulseok || 0) < cost) return;
    saveData.gyulyulseok -= cost;
    saveData.laws[id] = 1;
    Save.save(saveData);
    refresh();
  }
  function upgradeLaw(id) {
    saveData = Save.load();
    const def = CONFIG.LAW.LIST.find(l => l.id === id);
    if (!def) return;
    const lv = (saveData.laws || {})[id] || 0;
    if (!lv) return;
    const maxLv = def.category === 'passive' ? CONFIG.LAW.PASSIVE_MAX_LV : CONFIG.LAW.ACTIVE_MAX_LV;
    if (lv >= maxLv) return;
    const cost = def.category === 'passive' ? CONFIG.LAW.PASSIVE_BASE_COST + CONFIG.LAW.PASSIVE_COST_STEP*lv : CONFIG.LAW.ACTIVE_BASE_COST + CONFIG.LAW.ACTIVE_COST_STEP*lv;
    if ((saveData.gyulyulseok || 0) < cost) return;
    saveData.gyulyulseok -= cost;
    saveData.laws[id] = lv + 1;
    Save.save(saveData);
    refresh();
  }
  function setLawSubTab(tab) {
    lawSubTab = tab;
    refresh();
  }
  function equipLaw(id) {
    saveData = Save.load();
    if (!(saveData.laws || {})[id]) return;
    const def = CONFIG.LAW.LIST.find(l => l.id === id);
    if (!def || def.category !== 'active') return; // [UPDATE 2026-07-24] 슬롯은 액티브 전용
    const slots = [...(saveData.lawSlots || [null, null, null])];
    if (slots.includes(id)) return;
    const emptyIdx = slots.findIndex(s => !s);
    if (emptyIdx === -1) return;
    slots[emptyIdx] = id;
    saveData.lawSlots = slots;
    Save.save(saveData);
    refresh();
  }
  function unequipLawSlot(i) {
    saveData = Save.load();
    const slots = [...(saveData.lawSlots || [null, null, null])];
    slots[i] = null;
    saveData.lawSlots = slots;
    Save.save(saveData);
    refresh();
  }

  // [UPDATE 2026-07-24] 법칙 해금/강화/장착 버튼 누를 때마다 스크롤이 맨 위로 튕기던 버그 수정 —
  // player-scene.js와 동일한 패턴(.scroll-pan-y 위치 캡처/복원)
  function refresh() {
    const el = document.getElementById('app');
    if (!el) return;
    const scrollEl = el.querySelector('.scroll-pan-y');
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
    saveData = Save.load();
    render(el);
    const newScrollEl = document.getElementById('app')?.querySelector('.scroll-pan-y');
    if (newScrollEl) newScrollEl.scrollTop = scrollTop;
  }

  function enter(el) {
    saveData = Save.load();
    // 시즌1 클리어 전에는 접근 불가(건물 자체가 로비에 안 보이지만 방어적으로 재확인)
    if (!saveData.season1Clear) { SceneManager.go('lobby'); return; }
    activeTab = 'specialty';
    render(el);
  }
  function exit() {}

  return { enter, exit, setTab, setLawSubTab, unlockLaw, upgradeLaw, equipLaw, unequipLawSlot };
})();
