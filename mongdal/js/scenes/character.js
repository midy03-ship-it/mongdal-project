// character.js - 동료 편성 화면
const CharacterScene = (() => {
  let saveData = null;

  const RARITY_COLOR = {
    common:'#aaa', rare:'#4a90d9', epic:'#c060d0', special:'#ffb020'
  };
  function rarityLabel(r) { return Lang.t('character', 'rarity_' + r) || r; }

  function spriteSrc(id) {
    const sc = SPRITES?.companions?.[id];
    return sc ? sc.src : `assets/sprites/companions/${id}.png`;
  }

  function starBar(stars, awakening) {
    // 각성 수만큼 노란별, 나머지는 회색 (5칸 고정)
    const filled = Math.max(stars, awakening);
    let html = '';
    for (let i = 0; i < 5; i++) {
      const sc = i < filled ? '#ffd040' : 'rgba(255,255,255,0.22)';
      html += `<span style="color:${sc};font-size:11px;">★</span>`;
    }
    return html;
  }

  function render(el) {
    const scrollTop = el.querySelector('.companion-list')?.scrollTop || 0;
    const owned    = saveData.companions         || [];
    const active   = saveData.activeCompanions   || [];
    const frags    = saveData.companionFragments || {};
    const stars    = saveData.companionStars     || {};
    const awakenings = saveData.companionAwakening || {};
    const uniFrags = saveData.universalFragments || 0;
    const list     = GAME_DATA.companions;

    el.innerHTML = `
      <div class="char-root">
        <div class="char-header">
          <button class="back-btn" onclick="SceneManager.go('lobby')">${Lang.t('character','back')}</button>
          <h2 class="char-title">${Lang.t('character','title')}</h2>
          <span class="char-subtitle" style="font-size:11px;">
            ✨${uniFrags} &nbsp; ${Lang.t('character','formation')} ${active.length}/3
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
              const c = list.find(x => x.id === active[i]);
              const locked = i >= _slotCount;
              return `<div class="formation-slot ${c?'filled':locked?'locked':'empty'}"
                           onclick="${!locked?`CharacterScene.removeSlot(${i})`:''}"
                           style="position:relative;${locked?'opacity:0.35;cursor:default;':''}" >
                <span style="position:absolute;top:2px;left:4px;font-size:8px;color:${_diffColors[i]};z-index:1;">${_diffLabels[i]}</span>
                ${locked ? `<span style="font-size:18px;">🔒</span><span style="font-size:8px;color:#5a4a4a;">${Lang.t('character',i===1?'slotUnlockNormal':'slotUnlockHard')}</span>`
                : c ? `
                  <img src="${spriteSrc(c.id)}" alt="${c.name}"
                    style="max-height:52px;max-width:52px;object-fit:contain;display:block;margin:0 auto;image-rendering:pixelated;">
                  <span class="fm-name">${Lang.getCurrent()!=='ko'?(c.nameEn||c.name):c.name}</span>
                ` : `<span class="fm-empty-label">${Lang.t('character','emptySlot')}</span>`}
              </div>`;
            }).join('')}
          </div>`;
        })()}

        <!-- 상점 바로가기 -->
        <div style="padding:8px 14px;border-bottom:1px solid rgba(200,160,255,0.1);">
          <button onclick="SceneManager.go('shop')" style="
            width:100%;padding:8px 0;border-radius:10px;font-size:12px;cursor:pointer;
            background:rgba(180,100,255,0.2);border:1px solid rgba(200,140,255,0.4);
            color:#d8b8ff;font-family:inherit;letter-spacing:.05em;">
            ${Lang.t('character','shopBtn')}
          </button>
        </div>

        <!-- 동료 목록 -->
        <div class="companion-list">
          <div class="list-section-title">${Lang.t('character','owned')} (${owned.length}/${list.length})</div>
          <div class="companion-grid">
            ${list.map(c => {
              const isOwned  = owned.includes(c.id);
              const isActive = active.includes(c.id);
              const rc       = RARITY_COLOR[c.rarity] || '#aaa';
              const rl       = rarityLabel(c.rarity);
              const f        = frags[c.id] || 0;
              const st       = stars[c.id] || 0;
              const awk      = awakenings[c.id] || 0;
              const canUnlock = !isOwned && f >= 10;
              const pct      = isOwned ? 100 : Math.min(f / 10 * 100, 100);

              return `
                <div class="companion-card ${isOwned?'owned':'locked'} ${isActive?'active':''}">
                  <div class="card-rarity-bar" style="background:${rc}"></div>
                  <div class="card-sprite-wrap" style="height:110px;display:flex;align-items:center;
                    justify-content:center;overflow:hidden;position:relative;">
                    <img src="${spriteSrc(c.id)}" alt="${c.name}"
                      style="max-height:110px;max-width:100%;object-fit:contain;image-rendering:pixelated;
                        ${!isOwned?'filter:grayscale(1) brightness(0.25)':''}">
                    ${!isOwned ? '<div class="lock-overlay">🔒</div>' : ''}
                    ${isActive ? `<div class="active-badge">${Lang.t('character','active')}</div>` : ''}
                    ${isOwned ? `<div style="position:absolute;top:2px;right:2px;
                      font-size:9px;background:rgba(0,0,0,0.6);padding:1px 4px;border-radius:4px;color:${rc};">
                      ${rl}
                    </div>` : ''}
                  </div>
                  <div class="card-info">
                    <div class="card-name" style="color:${isOwned?rc:'#555'}">${Lang.getCurrent()!=='ko'?(c.nameEn||c.name):c.name}</div>

                    ${isOwned ? `
                      <!-- 별/각성 표시 -->
                      <div style="margin:3px 0;display:flex;align-items:center;flex-wrap:wrap;gap:2px;">
                        ${starBar(st, awk)}
                      </div>
                      <!-- 각성 효과 전체 목록 (해금=분홍, 잠김=회색) -->
                      <div style="font-size:9px;line-height:1.5;margin-bottom:3px;">
                        ${(c.awakening||[]).map((a,i) => {
                          const lbl = Lang.getCurrent()!=='ko'?(a.labelEn||a.label):a.label;
                          return i < Math.max(st, awk)
                            ? `<span style="color:#ff80c0;">• ${lbl}</span>`
                            : `<span style="color:rgba(180,140,220,0.35);">• ★${i+1} ${lbl}</span>`;
                        }).join('<br>')}
                      </div>
                    ` : `
                      <!-- 파편 진행도 -->
                      <div style="margin:4px 0;">
                        <div style="font-size:9px;color:#888;margin-bottom:2px;">
                          ${Lang.t('character','fragCount')} ${f}/10 ${canUnlock?`<span style="color:#80e8a0;">${Lang.t('character','canSummon')}</span>`:''}
                        </div>
                        <div style="height:5px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
                          <div style="height:100%;width:${pct}%;background:${rc};border-radius:3px;"></div>
                        </div>
                      </div>
                    `}

                    <!-- 버튼 영역 -->
                    <div style="margin-top:5px;display:flex;flex-direction:column;gap:3px;">
                      ${!isOwned ? `
                        <button onclick="CharacterScene.unlockWithFragments('${c.id}')" style="
                          width:100%;padding:4px 0;border-radius:6px;font-size:10px;font-weight:bold;
                          background:${canUnlock?'rgba(80,200,120,0.2)':'rgba(60,60,60,0.3)'};
                          border:1px solid ${canUnlock?'#50c878':'#444'};
                          color:${canUnlock?'#80e8a0':'#666'};
                          cursor:${canUnlock?'pointer':'default'};">
                          ${Lang.t('character','summonBtn')}
                        </button>` : ''}
                      ${isOwned && !isActive ? `
                        <button onclick="CharacterScene.addCompanion('${c.id}')" style="
                          width:100%;padding:3px 0;border-radius:6px;font-size:10px;
                          background:rgba(100,160,220,0.2);border:1px solid rgba(100,160,220,0.5);
                          color:#80b8f0;cursor:pointer;">
                          ${Lang.t('character','deploy')}
                        </button>` : ''}
                      ${isOwned && uniFrags >= 5 && awk < 5 ? `
                        <button onclick="CharacterScene.useUniversalFragment('${c.id}')" style="
                          width:100%;padding:3px 0;border-radius:6px;font-size:10px;
                          background:rgba(96,200,255,0.15);border:1px solid rgba(96,200,255,0.4);
                          color:#60c8ff;cursor:pointer;">
                          ${Lang.t('character','uniFragBtn')}
                        </button>` : ''}
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
    const listEl = el.querySelector('.companion-list');
    if (listEl) listEl.scrollTop = scrollTop;
  }

  function unlockWithFragments(id) {
    if (Save.unlockCompanionWithFragments(saveData, id)) {
      Save.save(saveData);
      render(document.getElementById('app'));
    }
  }

  function useUniversalFragment(id) {
    if ((saveData.universalFragments || 0) < 5) return;
    const owned = saveData.companions || [];
    if (!owned.includes(id)) return;
    const awk = (saveData.companionAwakening || {})[id] || 0;
    if (awk >= 5) return;
    saveData.universalFragments -= 5;
    Save.addCompanionFragments(saveData, id, 5);
    Save.save(saveData);
    render(document.getElementById('app'));
  }

  function addCompanion(id) {
    const active = saveData.activeCompanions || [];
    if (active.includes(id) || active.length >= 3) return;
    saveData.activeCompanions = [...active, id];
    Save.save(saveData); render(document.getElementById('app'));
  }
  function removeSlot(i) {
    const active = [...(saveData.activeCompanions || [])];
    if (!active[i]) return;
    active.splice(i, 1);
    saveData.activeCompanions = active;
    Save.save(saveData); render(document.getElementById('app'));
  }
  function enter(el) { saveData = Save.load(); render(el); }
  function exit() {}

  return { enter, exit, addCompanion, removeSlot, unlockWithFragments, useUniversalFragment };
})();
