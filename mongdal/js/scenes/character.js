// character.js - 동료 편성 화면
const CharacterScene = (() => {
  let saveData = null;
  let _expandedId = null; // [UPDATE 2026-07-13] 탭하면 동료 설명을 큰 글씨로 펼쳐 보여주는 카드 id

  // [UPDATE 2026-07-11] 260711_MTOPC.md 1번: 4단계 → 7단계 등급 사다리로 확장 (에픽/레전더리/미소스는 향후 콘텐츠용)
  const RARITY_COLOR = {
    common:'#aaa', uncommon:'#60a060', rare:'#4a90d9', unique:'#a040e0',
    epic:'#c060d0', legendary:'#e8a020', mythos:'#ff4060', special:'#ffb020',
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
    // [UPDATE 2026-08-02] 시즌8 엔딩 감상 완료 시점부터 박수는 동료가 아니라 주인공 본인이므로 목록에서 제외
    // (player.js의 스프라이트 교체 조건과 동일 시점으로 맞춤 — part2.active가 아니라 season8ClearEnding)
    const list     = saveData.season8ClearEnding ? GAME_DATA.companions.filter(c => c.id !== 'baksu') : GAME_DATA.companions;
    // [UPDATE 2026-07-11] 펜타그램/카드 테두리용 — 현재 편성된 동료들의 오행 목록
    const _activeCompEls = active.map(id => list.find(c=>c.id===id)?.element).filter(Boolean);

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
          // [UPDATE 2026-07-11] 이지 전용 슬롯 확장도 반영
          const _easySlots = (typeof StageSelectScene !== 'undefined') ? StageSelectScene.getEasySlotCount(saveData) : 1;
          const _slotCount = Math.max(_hasHard ? 3 : _hasNormal ? 2 : 1, _easySlots);
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

        <!-- [UPDATE 2026-07-11] 오행 펜타그램 — 현재 편성된 동료들의 속성을 색 링으로 표시 -->
        <div style="display:flex;flex-direction:column;align-items:center;padding:8px 16px;
          background:rgba(0,0,0,0.15);border-bottom:1px solid rgba(212,160,23,0.15);">
          <div style="font-size:9px;color:#8a7a6a;margin-bottom:2px;">
            ${Lang.t('character','elementRelations')}
          </div>
          ${elementPentagramSVG(_activeCompEls, null, 150)}
        </div>

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
              // [UPDATE 2026-07-11] 편성 중인 동료들과의 상생/상극 — 카드 테두리로 표시 (편성 안 된 카드에만)
              const _cRelation = (isOwned && !isActive) ? elementRelation(c.element, _activeCompEls) : null;
              const _cBorderStyle = _cRelation==='gen' ? 'border-color:rgba(94,194,106,0.7);'
                : _cRelation==='clash' ? 'border-color:rgba(192,72,72,0.7);' : '';

              const _expanded = _expandedId === c.id;
              return `
                <div class="companion-card ${isOwned?'owned':'locked'} ${isActive?'active':''}" style="${_cBorderStyle}"
                  ${isOwned?`onclick="CharacterScene.toggleExpand('${c.id}')"`:''}>
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
                    ${c.element ? elementBadgeHTML(c.element,14,'top:2px;left:2px;') : ''}
                  </div>
                  <div class="card-info">
                    <div class="card-name" style="color:${isOwned?rc:'#555'}">${Lang.getCurrent()!=='ko'?(c.nameEn||c.name):c.name}</div>

                    ${isOwned ? `
                      <!-- 별/각성 표시 -->
                      <div style="margin:3px 0;display:flex;align-items:center;flex-wrap:wrap;gap:2px;">
                        ${starBar(st, awk)}
                      </div>
                      <!-- 각성 효과 전체 목록 (해금=분홍, 잠김=회색) -->
                      <!-- [UPDATE 2026-07-13] 카드 탭 시 큰 글씨로 펼쳐 보기 -->
                      <div style="font-size:${_expanded?13:9}px;line-height:1.6;margin-bottom:3px;">
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
                        <button onclick="event.stopPropagation();CharacterScene.addCompanion('${c.id}')" style="
                          width:100%;padding:3px 0;border-radius:6px;font-size:10px;
                          background:rgba(100,160,220,0.2);border:1px solid rgba(100,160,220,0.5);
                          color:#80b8f0;cursor:pointer;">
                          ${Lang.t('character','deploy')}
                        </button>` : ''}
                      ${isOwned && uniFrags >= 5 && awk < 5 ? `
                        <button onclick="event.stopPropagation();CharacterScene.useUniversalFragment('${c.id}')" style="
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
    checkTrinityToast(saveData); // [UPDATE 2026-07-13] 삼위일체 발동 토스트
    Save.save(saveData); render(document.getElementById('app'));
  }
  function removeSlot(i) {
    const active = [...(saveData.activeCompanions || [])];
    if (!active[i]) return;
    active.splice(i, 1);
    saveData.activeCompanions = active;
    checkTrinityToast(saveData); // [UPDATE 2026-07-13] 삼위일체 발동 토스트
    Save.save(saveData); render(document.getElementById('app'));
  }
  function enter(el) { saveData = Save.load(); _expandedId = null; render(el); }
  function exit() {}
  // [UPDATE 2026-07-13] 카드 탭 → 각성 설명 확대/축소 토글
  function toggleExpand(id) { _expandedId = (_expandedId===id) ? null : id; render(document.getElementById('app')); }

  return { enter, exit, addCompanion, removeSlot, unlockWithFragments, useUniversalFragment, toggleExpand };
})();
