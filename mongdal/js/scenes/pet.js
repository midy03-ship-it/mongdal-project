// pet.js - 펫 관리 화면
const PetScene = (() => {
  let saveData = null;

  function petImgTag(pd, size=40, grayscale=false) {
    const sc = SPRITES?.pets?.[pd.id] || SPRITES?.pets?.[pd.id + '_pet'];
    if (sc) {
      const filter = grayscale ? 'filter:grayscale(1) opacity(0.35);' : '';
      return `<img src="${SpriteLoader.get(sc.src).src}" style="width:${size}px;height:${size}px;object-fit:contain;${filter}">`;
    }
    return `<span style="font-size:${size*0.7}px;line-height:1;${grayscale?'filter:grayscale(1) opacity(0.35)':''}">${pd.icon}</span>`;
  }

  const RARITY_COLOR = {
    common: '#aaa', rare: '#4a90d9', epic: '#c060d0', legendary: '#e8a020'
  };

  // 해금 비용 (천령과)
  const UNLOCK_COST = { common: 5, rare: 15, epic: 40, legendary: 80 };
  // 강화 비용 per 레벨 (골드, 천령과)
  const UPGRADE_COST = {
    common:    { gold:  200, cheonryeonggwa:   200 },
    rare:      { gold:  500, cheonryeonggwa:   500 },
    epic:      { gold: 1200, cheonryeonggwa:  1200 },
    legendary: { gold: 3000, cheonryeonggwa:  3000 },
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

    el.innerHTML = `
      <div class="char-root">
        <div class="char-header">
          <button class="back-btn" onclick="SceneManager.go('lobby')">${Lang.t('pet','back')}</button>
          <h2 class="char-title">${Lang.t('pet','title')}</h2>
          <span class="char-subtitle" style="font-size:11px;">
            ${_cimg('cheonryeonggwa')}${cheon} &nbsp; ${_cimg('gold')}${gold.toLocaleString()}
          </span>
        </div>

        <!-- 편성 슬롯 -->
        ${(() => {
          const _hasNormal = (saveData.clearedStagesNormal||[]).length > 0;
          const _hasHard   = (saveData.clearedStagesHard||[]).length > 0;
          const _slotCount = _hasHard ? 3 : _hasNormal ? 2 : 1;
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

        <!-- 펫 목록 -->
        <div class="companion-list">
          <div class="list-section-title">${Lang.t('pet','owned')} (${owned.length}/${list.length})</div>
          <div class="companion-grid">
            ${list.map(pd => {
              const isOwned  = owned.includes(pd.id);
              const isActive = active.includes(pd.id);
              const rc       = RARITY_COLOR[pd.rarity] || '#aaa';
              const lv       = petLevels[pd.id] || 1;
              const isMax    = lv >= MAX_PET_LV;
              const unlockCost = UNLOCK_COST[pd.rarity] || 5;
              const upgCost    = UPGRADE_COST[pd.rarity] || UPGRADE_COST.common;
              // [UPDATE 2026-07-06] 시즌2 펫 게이트: season2=시즌1클리어 필요, storyUnlock=해당 스테이지 클리어로만 획득
              const _s2Locked    = pd.season2 && !saveData.season1Clear;
              const _storyLocked = pd.storyUnlock && !isOwned;
              const canUnlock  = !isOwned && !_s2Locked && !_storyLocked && cheon >= unlockCost;
              const canUpgrade = isOwned && !isMax && gold >= upgCost.gold && cheon >= upgCost.cheonryeonggwa;

              return `
                <div class="companion-card ${isOwned?'owned':'locked'} ${isActive?'active':''}" >
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
                  </div>
                  <div class="card-info">
                    <div class="card-name" style="color:${isOwned?rc:'#555'}">${isEn?(pd.nameEn||pd.name):pd.name}</div>
                    <div class="card-role" style="font-size:9px;line-height:1.3;color:#6a5a4a;margin-top:2px;">
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
                          🔒 ${isEn?'Unlock Season 2':'시즌2 해금 필요'}
                        </div>` : `
                        <button onclick="PetScene.unlockPet('${pd.id}')" style="
                          width:100%;padding:4px 0;border-radius:5px;font-size:10px;font-weight:bold;
                          background:${canUnlock?'rgba(80,200,120,0.2)':'rgba(60,60,60,0.3)'};
                          border:1px solid ${canUnlock?'#50c878':'#444'};
                          color:${canUnlock?'#80e8a0':'#666'};
                          cursor:${canUnlock?'pointer':'default'};">
                          ${_cimg('cheonryeonggwa')}${unlockCost} ${isEn?'Unlock':'해금'}
                        </button>`) : ''}
                      ${isOwned && !isActive ? `
                        <button onclick="PetScene.addPet('${pd.id}')" style="
                          width:100%;padding:3px 0;border-radius:5px;font-size:10px;
                          background:rgba(100,160,220,0.2);border:1px solid rgba(100,160,220,0.5);
                          color:#80b8f0;cursor:pointer;">
                          ${isEn?'Deploy':'편성'}
                        </button>` : ''}
                      ${isOwned && !isMax ? `
                        <button onclick="PetScene.upgradePet('${pd.id}')" style="
                          width:100%;padding:3px 0;border-radius:5px;font-size:10px;
                          background:${canUpgrade?'rgba(200,160,40,0.2)':'rgba(60,60,60,0.3)'};
                          border:1px solid ${canUpgrade?'rgba(240,200,64,0.5)':'#444'};
                          color:${canUpgrade?'#f0d060':'#666'};
                          cursor:${canUpgrade?'pointer':'default'};">
                          ${_cimg('gold')}${upgCost.gold.toLocaleString()} ${_cimg('cheonryeonggwa')}${upgCost.cheonryeonggwa} ${isEn?'Upgrade':'강화'}
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
    if (pd.season2 && !saveData.season1Clear) return;
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
    Save.save(saveData);
    refresh();
  }

  function removeSlot(i) {
    const active = [...(saveData.activePets || [])];
    if (!active[i]) return;
    active.splice(i, 1);
    saveData.activePets = active;
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

  function enter(el) { saveData = Save.load(); render(el); }
  function exit()    {}

  return { enter, exit, unlockPet, upgradePet, addPet, removeSlot, refresh };
})();
