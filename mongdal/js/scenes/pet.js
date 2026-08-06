// pet.js - 펫 관리 화면
const PetScene = (() => {
  let saveData = null;
  let _expandedId = null; // [UPDATE 2026-07-13] 탭하면 펫 설명을 큰 글씨로 펼쳐 보여주는 카드 id

  // [UPDATE 2026-07-11] 펫 카드에 등급 텍스트 라벨이 없어 커먼/언커먼 구분이 안 보이던 문제 수정 (character.js 패턴과 동일하게 rarity_* 키 재사용)
  function rarityLabel(r) { return Lang.t('character', 'rarity_' + r) || r; }

  function petImgTag(pd, size=40, grayscale=false) {
    const sc = SPRITES?.pets?.[pd.id] || SPRITES?.pets?.[pd.id + '_pet'];
    if (sc) {
      const filter = grayscale ? 'filter:grayscale(1) opacity(0.35);' : '';
      return `<img src="${SpriteLoader.get(sc.src).src}" style="width:${size}px;height:${size}px;object-fit:contain;${filter}">`;
    }
    return `<span style="font-size:${size*0.7}px;line-height:1;${grayscale?'filter:grayscale(1) opacity(0.35)':''}">${pd.icon}</span>`;
  }

  // [UPDATE 2026-07-11] 260711_MTOPC.md 4-5: 4단계 → 7단계 등급 사다리로 확장 (에픽/레전더리/미소스는 향후 콘텐츠용, 현재 펫은 커먼~유니크만 사용)
  const RARITY_COLOR = {
    common: '#aaa', uncommon: '#60a060', rare: '#4a90d9', unique: '#a040e0',
    epic: '#c060d0', legendary: '#e8a020', mythos: '#ff4060',
  };

  // 해금 비용 (천령과)
  const UNLOCK_COST = { common:10, uncommon:30, rare:40, unique:70, epic:110, legendary:180, mythos:290 };
  // 강화 비용 per 레벨 (골드, 천령과 동일값)
  const UPGRADE_COST = {
    common:    { gold:   350, cheonryeonggwa:   350 },
    uncommon:  { gold:  1000, cheonryeonggwa:  1000 },
    rare:      { gold:  1400, cheonryeonggwa:  1400 },
    unique:    { gold:  2500, cheonryeonggwa:  2500 },
    epic:      { gold:  4000, cheonryeonggwa:  4000 },
    legendary: { gold:  6000, cheonryeonggwa:  6000 },
    mythos:    { gold: 10000, cheonryeonggwa: 10000 },
  };
  const MAX_PET_LV = 5;

  function render(el) {
    const owned     = saveData.pets        || [];
    const active    = saveData.activePets  || [];
    const petLevels = saveData.petLevels   || {};
    const list      = GAME_DATA.pets;
    const MAX_SLOTS = 3;
    const isEn      = Lang.getCurrent() === 'en';
    const cheon     = saveData.cheonryeonggwa || 0;
    const gold      = saveData.gold           || 0;
    // [UPDATE 2026-07-11] 펜타그램/카드 테두리용 — 현재 편성된 펫들의 오행 목록
    const _activePetEls = active.map(id => list.find(p=>p.id===id)?.element).filter(Boolean);

    el.innerHTML = `
      <div class="char-root">
        <div class="char-header">
          <button class="back-btn" onclick="SceneManager.go('lobby')">${Lang.t('pet','back')}</button>
          <h2 class="char-title">${Lang.t('pet','title')}</h2>
          <span class="char-subtitle" style="font-size:11px;">
            ${_cimg('cheonryeonggwa')}${Format.num(cheon)} &nbsp; ${_cimg('gold')}${Format.num(gold)}
          </span>
        </div>

        <!-- 편성 슬롯 -->
        ${(() => {
          const _hasNormal = (saveData.clearedStagesNormal||[]).length > 0;
          const _hasHard   = (saveData.clearedStagesHard||[]).length > 0;
          // [UPDATE 2026-07-11] 이지 전용 슬롯 확장도 반영
          const _easySlots = (typeof StageSelectScene !== 'undefined') ? StageSelectScene.getEasySlotCount(saveData) : 1;
          const _slotCount = Math.max(_hasHard ? 3 : _hasNormal ? 2 : 1, _easySlots);
          const _diffLabels = ['🌿','⚔️','🔥'];
          const _diffColors = ['#60c060','#f0c040','#ff6040'];
          return `<div class="formation-bar">
            ${[0,1,2].map(i => {
              const pd = list.find(p => p.id === active[i]);
              const locked = i >= _slotCount;
              return `<div class="formation-slot ${pd?'filled':locked?'locked':'empty'}"
                           onclick="${!locked?`PetScene.removeSlot(${i})`:''}"
                           style="position:relative;${locked?'opacity:0.35;cursor:default;':''}">
                <span style="position:absolute;top:2px;left:4px;font-size:8px;color:${_diffColors[i]};z-index:1;">${_diffLabels[i]}</span>
                ${locked ? `<span style="font-size:18px;">🔒</span><span style="font-size:8px;color:#5a4a4a;">${Lang.t('character',i===1?'slotUnlockNormal':'slotUnlockHard')}</span>`
                : pd ? `
                  <div style="line-height:1">${petImgTag(pd, 36)}</div>
                  <span class="fm-name">${isEn?(pd.nameEn||pd.name):pd.name}</span>
                ` : `<span class="fm-empty-label">${Lang.t('pet','emptySlot')}</span>`}
              </div>`;
            }).join('')}
          </div>`;
        })()}

        <!-- 효과 요약 -->
        ${active.length > 0 ? `
          <div style="padding:8px 16px;background:rgba(112,64,192,0.1);
            border-bottom:1px solid rgba(212,160,23,0.15);">
            <div style="font-size:10px;color:#8a7a6a;margin-bottom:4px;">${Lang.t('pet','activeEffect')}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${active.map(id => {
                const pd = list.find(p => p.id === id);
                return pd ? `<span style="font-size:10px;color:#e8dcc8;
                  background:rgba(255,255,255,0.06);padding:2px 8px;border-radius:10px;display:flex;align-items:center;gap:4px;">
                  ${petImgTag(pd,20)} ${(isEn?(pd.descEn||pd.desc):pd.desc).split('.')[0]}
                </span>` : '';
              }).join('')}
            </div>
          </div>` : ''}

        <!-- [UPDATE 2026-07-11] 오행 펜타그램 — 현재 편성된 펫들의 속성을 색 링으로 표시 -->
        <div style="display:flex;flex-direction:column;align-items:center;padding:8px 16px;
          background:rgba(0,0,0,0.15);border-bottom:1px solid rgba(212,160,23,0.15);">
          <div style="font-size:9px;color:#8a7a6a;margin-bottom:2px;">
            ${isEn?'Element Relations (colored = deployed)':'오행 상생상극 (색상 = 편성 중)'}
          </div>
          ${elementPentagramSVG(_activePetEls, null, 150)}
        </div>

        <!-- 펫 목록 -->
        <div class="companion-list">
          <div class="list-section-title">${Lang.t('pet','owned')} (${owned.length}/${list.length})</div>
          <div class="companion-grid">
            ${list.map(pd => {
              const isOwned  = owned.includes(pd.id);
              const isActive = active.includes(pd.id);
              const rc       = RARITY_COLOR[pd.rarity] || '#aaa';
              const rl       = rarityLabel(pd.rarity);
              const lv       = petLevels[pd.id] || 1;
              const isMax    = lv >= MAX_PET_LV;
              const unlockCost = UNLOCK_COST[pd.rarity] || 5;
              const upgCost    = UPGRADE_COST[pd.rarity] || UPGRADE_COST.common;
              // [UPDATE 2026-07-06] 시즌2 펫 게이트: season2=시즌1클리어 필요, storyUnlock=해당 스테이지 클리어로만 획득
              // [UPDATE 2026-07-18] WORLDBUILDING.md 설계대로 저승나비는 "챕터11 클리어(시즌2 시작)"가 해금 시점 —
              // season1Clear(스테이지100)로 되어 있던 걸 실제 챕터11 보스(스테이지110) 클리어 기준으로 수정
              // [UPDATE 2026-07-19] 버그 수정: 싸리/공이(시즌3)·수정정령/영혼불씨(시즌4)에 시즌 게이트 필드 자체가
              // 없어서 게임 시작부터 천령과만 있으면 바로 구매 가능했음 — season3/season4 필드 추가 후 게이트 일반화
              const _seasonLockNum =
                (pd.season2 && !Unlock.cleared(saveData, 110)) ? 2 :
                (pd.season3 && !saveData.season2Clear) ? 3 :
                (pd.season4 && !(saveData.season3Clear && isSeasonReleased(4))) ? 4 :
                (pd.season5 && !(saveData.season4Clear && isSeasonReleased(5))) ? 5 :
                // [UPDATE 2026-07-31] 시즌7(어계) 펫 — 시즌6(원계) 클리어 + 시즌7 공개가 조건.
                // 시즌6은 신규 펫 없이 법칙 시스템이 그 자리를 대신했으므로 이 체인에 season6 항목은 없다.
                (pd.season7 && !(saveData.season6Clear && isSeasonReleased(7))) ? 7 : 0;
              const _s2Locked = _seasonLockNum > 0;
              const _storyLocked = pd.storyUnlock && !isOwned;
              const canUnlock  = !isOwned && !_s2Locked && !_storyLocked && cheon >= unlockCost;
              const canUpgrade = isOwned && !isMax && gold >= upgCost.gold && cheon >= upgCost.cheonryeonggwa;
              // [UPDATE 2026-07-11] 편성 중인 펫들과의 상생/상극 — 카드 테두리로 표시 (편성 안 된 카드에만)
              const _pRelation = (isOwned && !isActive) ? elementRelation(pd.element, _activePetEls) : null;
              const _pBorderStyle = _pRelation==='gen' ? 'border-color:rgba(94,194,106,0.7);'
                : _pRelation==='clash' ? 'border-color:rgba(192,72,72,0.7);' : '';

              const _expanded = _expandedId === pd.id;
              return `
                <div class="companion-card ${isOwned?'owned':'locked'} ${isActive?'active':''}" style="${_pBorderStyle}"
                  ${isOwned?`onclick="PetScene.toggleExpand('${pd.id}')"`:''}>
                  <div class="card-rarity-bar" style="background:${rc}"></div>
                  <div class="card-sprite-wrap" style="min-height:60px;position:relative;">
                    <div style="line-height:1;">
                      ${petImgTag(pd, 56, !isOwned)}
                    </div>
                    ${!isOwned ? '<div class="lock-overlay">🔒</div>' : ''}
                    ${isActive ? `<div class="active-badge">${Lang.t('pet','active')}</div>` : ''}
                    ${isOwned ? `<div style="position:absolute;bottom:0;right:0;font-size:9px;
                      background:${rc}33;border:1px solid ${rc};color:${rc};
                      border-radius:4px;padding:1px 4px;">${isMax?'MAX':Lang.getCurrent()==='en'?`Lv.${lv}`:lv+'강'}</div>` : ''}
                    ${isOwned ? `<div style="position:absolute;top:2px;right:2px;
                      font-size:9px;background:rgba(0,0,0,0.6);padding:1px 4px;border-radius:4px;color:${rc};">
                      ${rl}
                    </div>` : ''}
                    ${pd.element ? elementBadgeHTML(pd.element,14,'top:2px;left:2px;') : ''}
                  </div>
                  <div class="card-info">
                    <div class="card-name" style="color:${isOwned?rc:'#555'}">${isEn?(pd.nameEn||pd.name):pd.name}</div>
                    <!-- [UPDATE 2026-07-13] 카드 탭 시 큰 글씨로 펼쳐 보기 -->
                    <div class="card-role" style="font-size:${_expanded?13:9}px;line-height:${_expanded?1.6:1.3};color:#6a5a4a;margin-top:2px;">
                      ${isEn?(pd.descEn||pd.desc):pd.desc}
                    </div>
                    <!-- 버튼 영역 -->
                    <div style="margin-top:5px;display:flex;flex-direction:column;gap:3px;">
                      ${!isOwned ? (
                        _storyLocked ? `
                        <div style="text-align:center;font-size:9px;color:#806080;padding:4px 0;
                          border:1px solid #444;border-radius:5px;background:rgba(60,40,70,0.3);">
                          🔒 ${isEn?`Clear Chapter ${Math.ceil(pd.storyUnlock/10)}`:`챕터${Math.ceil(pd.storyUnlock/10)} 클리어 시 해금`}
                        </div>` : _s2Locked ? `
                        <div style="text-align:center;font-size:9px;color:#607090;padding:4px 0;
                          border:1px solid #444;border-radius:5px;background:rgba(40,50,70,0.3);">
                          🔒 ${isEn?`Unlock Season ${_seasonLockNum}`:`시즌${_seasonLockNum} 해금 필요`}
                        </div>` : `
                        <button onclick="PetScene.unlockPet('${pd.id}')" style="
                          width:100%;padding:4px 0;border-radius:5px;font-size:10px;font-weight:bold;
                          background:${canUnlock?'rgba(80,200,120,0.2)':'rgba(60,60,60,0.3)'};
                          border:1px solid ${canUnlock?'#50c878':'#444'};
                          color:${canUnlock?'#80e8a0':'#666'};
                          cursor:${canUnlock?'pointer':'default'};">
                          ${_cimg('cheonryeonggwa')}${Format.num(unlockCost)} ${isEn?'Unlock':'해금'}
                        </button>`) : ''}
                      ${isOwned && !isActive ? `
                        <button onclick="event.stopPropagation();PetScene.addPet('${pd.id}')" style="
                          width:100%;padding:3px 0;border-radius:5px;font-size:10px;
                          background:rgba(100,160,220,0.2);border:1px solid rgba(100,160,220,0.5);
                          color:#80b8f0;cursor:pointer;">
                          ${isEn?'Deploy':'편성'}
                        </button>` : ''}
                      ${isOwned && !isMax ? `
                        <button onclick="event.stopPropagation();PetScene.upgradePet('${pd.id}')" style="
                          width:100%;padding:3px 0;border-radius:5px;font-size:10px;
                          background:${canUpgrade?'rgba(200,160,40,0.2)':'rgba(60,60,60,0.3)'};
                          border:1px solid ${canUpgrade?'rgba(240,200,64,0.5)':'#444'};
                          color:${canUpgrade?'#f0d060':'#666'};
                          cursor:${canUpgrade?'pointer':'default'};">
                          ${_cimg('gold')}${Format.num(upgCost.gold)} ${_cimg('cheonryeonggwa')}${Format.num(upgCost.cheonryeonggwa)} ${isEn?'Upgrade':'강화'}
                        </button>` : ''}
                      ${isOwned && isMax ? `
                        <div style="text-align:center;font-size:10px;color:#c060d0;padding:3px 0;">✨MAX</div>
                      ` : ''}
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>

      </div>`;
  }

  function unlockPet(id) {
    const pd = GAME_DATA.pets.find(p => p.id === id);
    if (!pd) return;
    // [UPDATE 2026-07-06] 시즌2 게이트 / 스토리 해금 전용 펫은 구매 불가
    // [UPDATE 2026-07-18] 저승나비 해금 시점을 스테이지110(챕터11 보스) 클리어 기준으로 수정 (WORLDBUILDING.md 로드맵)
    // [UPDATE 2026-07-19] 버그 수정: 싸리/공이(시즌3)·수정정령/영혼불씨(시즌4) 시즌 게이트 누락 — season3/season4 필드 추가
    if (pd.season2 && !Unlock.cleared(saveData, 110)) return;
    if (pd.season3 && !saveData.season2Clear) return;
    if (pd.season4 && !(saveData.season3Clear && isSeasonReleased(4))) return;
    if (pd.season5 && !(saveData.season4Clear && isSeasonReleased(5))) return;
    if (pd.season7 && !(saveData.season6Clear && isSeasonReleased(7))) return; // [UPDATE 2026-07-31] 시즌7(어계) 펫
    if (pd.storyUnlock) return;
    const cost = UNLOCK_COST[pd.rarity] || 5;
    if ((saveData.cheonryeonggwa || 0) < cost) return;
    const owned = saveData.pets || [];
    if (owned.includes(id)) return;

    saveData.cheonryeonggwa -= cost;
    saveData.pets = [...owned, id];
    if (!saveData.petLevels) saveData.petLevels = {};
    saveData.petLevels[id] = 1;
    Save.save(saveData);
    refresh();
  }

  function upgradePet(id) {
    const pd = GAME_DATA.pets.find(p => p.id === id);
    if (!pd) return;
    const owned = saveData.pets || [];
    if (!owned.includes(id)) return;
    if (!saveData.petLevels) saveData.petLevels = {};
    const lv = saveData.petLevels[id] || 1;
    if (lv >= MAX_PET_LV) return;
    const cost = UPGRADE_COST[pd.rarity] || UPGRADE_COST.common;
    if ((saveData.gold || 0) < cost.gold) return;
    if ((saveData.cheonryeonggwa || 0) < cost.cheonryeonggwa) return;

    saveData.gold            -= cost.gold;
    saveData.cheonryeonggwa  -= cost.cheonryeonggwa;
    saveData.petLevels[id]    = lv + 1;
    Save.save(saveData);
    refresh();
  }

  function addPet(id) {
    const active = saveData.activePets || [];
    if (active.includes(id) || active.length >= 3) return;
    saveData.activePets = [...active, id];
    checkTrinityToast(saveData); // [UPDATE 2026-07-13] 삼위일체 발동 토스트
    Save.save(saveData);
    refresh();
  }

  function removeSlot(i) {
    const active = [...(saveData.activePets || [])];
    if (!active[i]) return;
    active.splice(i, 1);
    saveData.activePets = active;
    checkTrinityToast(saveData); // [UPDATE 2026-07-13] 삼위일체 발동 토스트
    Save.save(saveData);
    refresh();
  }

  function refresh() {
    const el = document.getElementById('app');
    if (!el) return;
    const scrollEl = el.querySelector('.companion-list');
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
    saveData = Save.load();
    render(el);
    const newScrollEl = el.querySelector('.companion-list');
    if (newScrollEl) newScrollEl.scrollTop = scrollTop;
  }

  function enter(el) { saveData = Save.load(); _expandedId = null; render(el); }
  function exit()    {}
  // [UPDATE 2026-07-13] 카드 탭 → 설명 확대/축소 토글
  function toggleExpand(id) { _expandedId = (_expandedId===id) ? null : id; refresh(); }

  return { enter, exit, unlockPet, upgradePet, addPet, removeSlot, refresh, toggleExpand };
})();
