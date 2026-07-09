// shop-scene.js - 상점 허브
const ShopScene = (() => {
  let saveData = null;
  let currentView = 'main';  // 'main' | 'gacha' | 'exchange'
  let activeTab   = 'gold';  // gacha 내 탭: 'gold' | 'diamond'
  let lastResults = [];

  // ── 비용 ──
  const GOLD_COST_1   = 1000;
  const GOLD_COST_10  = 10000;
  const GEM_COST_1    = 80;
  const GEM_COST_10   = 800;

  // ── 뽑기 풀 ──
  const GOLD_FULL_WEIGHTS = [
    { id:'ggeogsoe', rarity:'common', weight:50 },
    { id:'dochi',    rarity:'rare',   weight:20 },
    { id:'aram',     rarity:'rare',   weight:20 },
    { id:'danbi',    rarity:'rare',   weight:20 },
    { id:'gaon',     rarity:'epic',   weight:10 },
  ];
  const DIAMOND_FULL_WEIGHTS = [
    { id:'dochi',    rarity:'rare',    weight:20 },
    { id:'aram',     rarity:'rare',    weight:20 },
    { id:'danbi',    rarity:'rare',    weight:20 },
    { id:'gaon',     rarity:'epic',    weight:10 },
    { id:'cheonga',  rarity:'special', weight:4  },
    { id:'geumgang', rarity:'special', weight:4  },
    { id:'baekho',   rarity:'special', weight:4  },
    { id:'sohee',    rarity:'special', weight:4  },
    { id:'mugsa',    rarity:'special', weight:4  },
    { id:'cheolgap', rarity:'special', weight:4  },
  ];
  // [UPDATE 2026-07-06] 시즌2 해금(시즌1 클리어) 후 다이아 풀에 추가되는 동료
  const S2_DIAMOND_WEIGHTS = [
    { id:'haewonmaek', rarity:'special', weight:4 },
  ];
  function diamondPool() {
    return saveData?.season1Clear ? [...DIAMOND_FULL_WEIGHTS, ...S2_DIAMOND_WEIGHTS] : DIAMOND_FULL_WEIGHTS;
  }
  const GOLD_FRAG_WEIGHTS = [
    { rarity:'common',    weight:45 },
    { rarity:'rare',      weight:30 },
    { rarity:'epic',      weight:10 },
    { rarity:'universal', weight:5  },
  ];
  const DIAMOND_FRAG_WEIGHTS = [
    { rarity:'rare',      weight:40 },
    { rarity:'epic',      weight:25 },
    { rarity:'special',   weight:10 },
    { rarity:'universal', weight:5  },
  ];

  const RARITY_LABEL = {
    common:'커먼', rare:'레어', epic:'에픽', special:'★스페셜', universal:'만능'
  };
  const RARITY_COLOR = {
    common:'#aaa', rare:'#4a90d9', epic:'#c060d0', special:'#ffb020', universal:'#60c8ff'
  };

  // ── 유틸 ──
  function weightedRandom(list) {
    const total = list.reduce((s, x) => s + x.weight, 0);
    let r = Math.random() * total;
    for (const x of list) { r -= x.weight; if (r <= 0) return x; }
    return list[list.length - 1];
  }
  function poolByRarity(fullPool, rarity) {
    return fullPool.filter(x => x.rarity === rarity);
  }
  function doPull(isGold) {
    const fullPool = isGold ? GOLD_FULL_WEIGHTS : diamondPool();
    const fragPool = isGold ? GOLD_FRAG_WEIGHTS : DIAMOND_FRAG_WEIGHTS;
    if (Math.random() < 0.2) {
      const picked = weightedRandom(fullPool);
      return { type:'companion', id:picked.id, rarity:picked.rarity };
    } else {
      const rarityPick = weightedRandom(fragPool);
      const amount = Math.floor(Math.random() * 3) + 2;
      if (rarityPick.rarity === 'universal') return { type:'universal_frag', amount };
      const companions = poolByRarity(fullPool, rarityPick.rarity);
      if (!companions.length) return { type:'universal_frag', amount: 1 };
      const comp = companions[Math.floor(Math.random() * companions.length)];
      return { type:'frag', id:comp.id, rarity:rarityPick.rarity, amount };
    }
  }
  function applyResult(result) {
    if (!saveData.companionFragments) saveData.companionFragments = {};
    if (!saveData.companions)         saveData.companions = [];
    if (result.type === 'companion') {
      if (saveData.companions.includes(result.id)) {
        Save.addCompanionFragments(saveData, result.id, 10);
        return { ...result, converted: true };
      } else {
        saveData.companions = [...saveData.companions, result.id];
        if (saveData.companionFragments[result.id]) _processStarsLocal(result.id);
      }
    } else if (result.type === 'universal_frag') {
      saveData.universalFragments = (saveData.universalFragments || 0) + result.amount;
    } else if (result.type === 'frag') {
      Save.addCompanionFragments(saveData, result.id, result.amount);
    }
    return result;
  }
  function _processStarsLocal(id) {
    if (!saveData.companionStars)     saveData.companionStars    = {};
    if (!saveData.companionAwakening) saveData.companionAwakening = {};
    let frags = saveData.companionFragments[id] || 0;
    let stars = saveData.companionStars[id]     || 0;
    let awk   = saveData.companionAwakening[id] || 0;
    while (frags >= 5 && awk < 5) {
      frags -= 5; stars++;
      if (stars >= 5) { stars = 0; awk++; }
    }
    saveData.companionFragments[id] = frags;
    saveData.companionStars[id]     = stars;
    saveData.companionAwakening[id] = awk;
  }
  function pullN(n, isGold) {
    const cost = isGold
      ? (n === 1 ? GOLD_COST_1 : GOLD_COST_10)
      : (n === 1 ? GEM_COST_1  : GEM_COST_10);
    if (isGold  && (saveData.gold || 0) < cost) return;
    if (!isGold && (saveData.gems || 0) < cost) return;
    if (isGold) saveData.gold -= cost;
    else        saveData.gems -= cost;
    const count = n === 1 ? 1 : 11;
    const results = [];
    for (let i = 0; i < count; i++) results.push(applyResult(doPull(isGold)));
    lastResults = results;
    Save.save(saveData);
    render(document.getElementById('app'));
  }

  // ── 헤더 공통 ──
  function headerHTML(title, onBack) {
    const gold = saveData.gold || 0;
    const gems = saveData.gems || 0;
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:14px 18px 10px;border-bottom:1px solid rgba(200,160,255,0.15);flex-shrink:0;">
        <button onclick="${onBack}" style="
          background:none;border:none;color:rgba(200,160,255,0.7);font-size:22px;cursor:pointer;padding:4px 8px;">←</button>
        <div style="font-size:16px;letter-spacing:.12em;color:#e0c8ff;">${title}</div>
        <div style="font-size:12px;display:flex;gap:10px;">
          <span style="color:#f0c840;">${_cimg('gold')} ${gold.toLocaleString()}</span>
          <span style="color:#60b8ff;">💎 ${gems.toLocaleString()}</span>
        </div>
      </div>`;
  }

  // ── 메인 허브 ──
  function renderMain(el) {
    const isEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    // 상점 카테고리 목록 — 추후 항목 추가 시 여기에만 추가
    const SHOP_CATEGORIES = [
      {
        id: 'gacha',
        icon: '🎪',
        label: isEn ? 'Companion Gacha' : '동료 뽑기',
        desc: isEn ? 'Spend Gold or Diamonds to get companion fragments and summons.' : '골드 또는 다이아로 동료 파편/완전체를 획득합니다.',
        color: '#c080ff',
        bg: 'rgba(180,100,255,0.12)',
        border: 'rgba(200,140,255,0.35)',
      },
      {
        id: 'exchange',
        icon: '🔄',
        label: isEn ? 'Currency Exchange' : '재화 교환',
        desc: isEn ? 'Exchange Diamonds for various resources.' : '다이아몬드로 각종 재화를 교환합니다.',
        color: '#60d8ff',
        bg: 'rgba(60,180,255,0.10)',
        border: 'rgba(80,200,255,0.30)',
      },
      // 추후 카테고리 예시:
      // { id:'blackmarket', icon:'🕵️', label: isEn?'Black Market':'암시장', ... },
    ];

    el.innerHTML = `
      <div style="height:844px;background:linear-gradient(180deg,#080614 0%,#10091a 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;color:#e8d8ff;
        display:flex;flex-direction:column;overflow:hidden;">
        ${headerHTML(isEn?'🏪 Shop':'🏪 상점', "SceneManager.go('lobby')")}
        <div style="flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:12px;">
          ${SHOP_CATEGORIES.map(cat => `
            <button onclick="ShopScene.goView('${cat.id}')" style="
              width:100%;padding:20px 18px;border-radius:16px;font-family:inherit;cursor:pointer;
              background:${cat.bg};border:1px solid ${cat.border};
              display:flex;align-items:center;gap:16px;text-align:left;">
              <span style="font-size:36px;flex-shrink:0;">${cat.icon}</span>
              <div>
                <div style="font-size:16px;color:${cat.color};font-weight:700;margin-bottom:4px;">${cat.label}</div>
                <div style="font-size:11px;color:rgba(200,160,255,0.55);line-height:1.4;">${cat.desc}</div>
              </div>
              <span style="margin-left:auto;font-size:20px;color:${cat.color};opacity:0.7;">›</span>
            </button>`).join('')}
        </div>
      </div>`;
  }

  // ── 동료 뽑기 ──
  function renderGacha(el) {
    const isEn  = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    const gold    = saveData.gold || 0;
    const gems    = saveData.gems || 0;
    const uniFrags= saveData.universalFragments || 0;
    const owned   = saveData.companions || [];
    const allComp = GAME_DATA.companions;
    const frags   = saveData.companionFragments || {};
    const isGold  = activeTab === 'gold';
    const canGold1  = gold >= GOLD_COST_1;
    const canGold10 = gold >= GOLD_COST_10;
    const canGem1   = gems >= GEM_COST_1;
    const canGem10  = gems >= GEM_COST_10;
    const can1  = isGold ? canGold1  : canGem1;
    const can10 = isGold ? canGold10 : canGem10;

    el.innerHTML = `
      <div style="height:844px;background:linear-gradient(180deg,#080614 0%,#10091a 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;color:#e8d8ff;
        display:flex;flex-direction:column;overflow:hidden;">
        ${headerHTML(isEn?'🎪 Companion Gacha':'🎪 동료 뽑기', "ShopScene.goView('main')")}

        <!-- 탭 -->
        <div style="display:flex;border-bottom:1px solid rgba(200,160,255,0.15);flex-shrink:0;">
          ${[[`gold`,isEn?`${_cimg('gold',14)} Gold Gacha`:`${_cimg('gold',14)} 골드 뽑기`],[`diamond`,isEn?'💎 Diamond Gacha':'💎 다이아 뽑기']].map(([tab,label]) => `
            <button onclick="ShopScene.setTab('${tab}')" style="
              flex:1;padding:10px 0;border:none;font-size:13px;cursor:pointer;
              font-family:inherit;letter-spacing:.05em;
              background:${activeTab===tab?'rgba(180,140,255,0.12)':'transparent'};
              color:${activeTab===tab?'#e0c8ff':'rgba(200,160,255,0.4)'};
              border-bottom:2px solid ${activeTab===tab?'#c080ff':'transparent'};">
              ${label}
            </button>`).join('')}
        </div>

        <div style="flex:1;overflow-y:auto;padding:14px 16px 32px;">
          <!-- 뽑기 패널 -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(200,160,255,0.15);
            border-radius:14px;padding:14px;margin-bottom:14px;">
            <div style="font-size:11px;color:rgba(200,160,255,0.5);margin-bottom:8px;">
              ${isGold
                ? (isEn?'Common~Epic companion fragments & summons (80% frag / 20% full)':'커먼~에픽 동료 파편 · 완전체 (80% 파편 / 20% 완전체)')
                : (isEn?'Rare~Special companion fragments & summons (80% frag / 20% full)':'레어~스페셜 동료 파편 · 완전체 (80% 파편 / 20% 완전체)')}
            </div>
            <div style="display:flex;gap:8px;">
              <button onclick="ShopScene.pull(1)" style="
                flex:1;padding:10px 0;border-radius:10px;font-size:13px;font-weight:bold;
                cursor:${can1?'pointer':'not-allowed'};font-family:inherit;
                background:${can1?'rgba(180,100,255,0.25)':'rgba(60,60,60,0.3)'};
                border:1px solid ${can1?'rgba(200,140,255,0.6)':'rgba(255,255,255,0.1)'};
                color:${can1?'#e0c8ff':'#555'};">
                1회<br>
                <span style="font-size:11px;">${isGold?`${_cimg('gold',13)}${GOLD_COST_1.toLocaleString()}`:`💎${GEM_COST_1}`}</span>
              </button>
              <button onclick="ShopScene.pull(10)" style="
                flex:1;padding:10px 0;border-radius:10px;font-size:13px;font-weight:bold;
                cursor:${can10?'pointer':'not-allowed'};font-family:inherit;
                background:${can10?'rgba(255,160,40,0.2)':'rgba(60,60,60,0.3)'};
                border:1px solid ${can10?'rgba(255,200,80,0.5)':'rgba(255,255,255,0.1)'};
                color:${can10?'#f0d060':'#555'};">
                10+1회<br>
                <span style="font-size:11px;">${isGold?`${_cimg('gold',13)}${GOLD_COST_10.toLocaleString()}`:`💎${GEM_COST_10}`}</span>
              </button>
            </div>
          </div>

          <!-- 뽑기 결과 -->
          ${lastResults.length > 0 ? `
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(200,160,255,0.15);
              border-radius:14px;padding:12px;margin-bottom:14px;">
              <div style="font-size:11px;color:rgba(200,160,255,0.5);margin-bottom:8px;">
                ══ ${isEn?`Results (${lastResults.length})`:`뽑기 결과 (${lastResults.length}개)`} ══
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto;">
                ${lastResults.map(r => resultRow(r, allComp)).join('')}
              </div>
            </div>` : ''}

          <!-- 파편 현황 -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(200,160,255,0.1);
            border-radius:14px;padding:12px;">
            <div style="font-size:11px;color:rgba(200,160,255,0.5);margin-bottom:10px;">── ${isEn?'Fragment Inventory':'파편 보유 현황'}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;
              padding:6px 8px;background:rgba(96,200,255,0.08);border-radius:8px;
              border:1px solid rgba(96,200,255,0.2);">
              <span style="font-size:18px;">✨</span>
              <div style="flex:1;">
                <div style="font-size:11px;color:#60c8ff;font-weight:bold;">${isEn?'Universal Fragment':'만능 파편'}</div>
                <div style="font-size:10px;color:rgba(96,200,255,0.6);">${isEn?'5 = 1 Companion Star':'5개 = 동료 별 1개'}</div>
              </div>
              <div style="font-size:14px;color:#60c8ff;font-weight:bold;">${uniFrags}개</div>
            </div>
            ${allComp.map(c => {
              const rc = RARITY_COLOR[c.rarity] || '#aaa';
              const f  = frags[c.id] || 0;
              const isOwned = owned.includes(c.id);
              if (f === 0 && !isOwned) return '';
              const pct = Math.min(f / 10 * 100, 100);
              return `
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;
                  padding:5px 8px;background:rgba(255,255,255,0.03);border-radius:8px;">
                  <div style="width:6px;height:36px;border-radius:3px;background:${rc};flex-shrink:0;"></div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:10px;color:${rc};font-weight:bold;margin-bottom:2px;">
                      ${isEn?(c.nameEn||c.name):c.name} <span style="color:#888;font-weight:normal;">${RARITY_LABEL[c.rarity]||''}</span>
                    </div>
                    ${!isOwned
                      ? `<div style="height:5px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
                           <div style="height:100%;width:${pct}%;background:${rc};border-radius:3px;transition:width .3s;"></div>
                         </div>`
                      : `<div style="font-size:9px;color:rgba(200,160,255,0.5);">${isEn?'Owned':'보유중'}</div>`}
                  </div>
                  <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:12px;color:${rc};font-weight:bold;">${f}${!isOwned?'/10':''}</div>
                    ${!isOwned && f >= 10 ? `<div style="font-size:9px;color:#80e8a0;">${isEn?'Can Summon':'소환 가능'}</div>` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;
  }

  // ── 재화 교환 ──
  function renderExchange(el) {
    const isEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    const EXCHANGE_ITEMS = [
      { icon:'🪙', spriteKey:'gold',           name:'골드',    nameEn:'Gold',              key:'gold',              cost:1, amount:500  },
      { icon:'🔧', spriteKey:'ganghwaseok',     name:'강화석',  nameEn:'Enhance Stone',     key:'ganghwaseok',        cost:2, amount:1   },
      { icon:'☁️', spriteKey:'cheonunseok',     name:'천운석',  nameEn:'Sky Stone',         key:'cheonunseok',        cost:5, amount:1   },
      { icon:'✨',                               name:'만능파편', nameEn:'Universal Fragment',key:'universalFragments', cost:3, amount:1   },
      { icon:'🍇', spriteKey:'cheonryeonggwa',  name:'천령과',  nameEn:'Spirit Fruit',      key:'cheonryeonggwa',     cost:4, amount:1   },
    ];

    el.innerHTML = `
      <div style="height:844px;background:linear-gradient(180deg,#080614 0%,#10091a 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;color:#e8d8ff;
        display:flex;flex-direction:column;overflow:hidden;">
        ${headerHTML(isEn?'🔄 Currency Exchange':'🔄 재화 교환', "ShopScene.goView('main')")}
        <div style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;">
          <div style="font-size:11px;color:rgba(200,160,255,0.5);padding:0 4px;">
            ${isEn?`💎 Exchange Diamonds for resources · Have 💎 ${saveData.gems||0}`:`💎 다이아몬드로 재화를 교환합니다 · 보유 💎 ${saveData.gems||0}`}
          </div>
          ${EXCHANGE_ITEMS.map(item => {
            const canBuy = (saveData.gems||0) >= item.cost;
            const dispName = isEn ? item.nameEn : item.name;
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;
                background:rgba(255,255,255,0.04);border:1px solid rgba(200,160,255,0.15);
                border-radius:14px;">
                <div style="font-size:28px;display:flex;align-items:center;">
                  ${item.spriteKey ? _cimg(item.spriteKey, 32) : item.icon}
                </div>
                <div style="flex:1;">
                  <div style="font-size:14px;color:#e8dcc8;font-weight:700;">${dispName}</div>
                  <div style="font-size:10px;color:#5a4a3a;margin-top:2px;">
                    ${item.key==='gold'?`${_cimg('gold',12)} +500`:`×${item.amount} ${isEn?'each':'획득'}`}
                  </div>
                </div>
                <button onclick="ShopScene.exchange('${item.key}',${item.cost},${item.amount})"
                  style="padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;
                  cursor:${canBuy?'pointer':'not-allowed'};font-family:inherit;
                  background:${canBuy?'rgba(112,64,192,0.5)':'rgba(60,60,60,0.3)'};
                  border:1px solid ${canBuy?'#a060e0':'rgba(255,255,255,0.1)'};
                  color:${canBuy?'#e8dcc8':'#555'};">
                  💎 ${item.cost}
                </button>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  // ── 라우터 ──
  function render(el) {
    if (currentView === 'gacha')    renderGacha(el);
    else if (currentView === 'exchange') renderExchange(el);
    else                            renderMain(el);
  }

  function resultRow(r, allComp) {
    const isEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    if (r.type === 'universal_frag') {
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
        <span style="font-size:16px;">✨</span>
        <span style="font-size:11px;color:#60c8ff;">${isEn?'Universal Fragment':'만능 파편'} ×${r.amount}</span>
      </div>`;
    }
    const c  = allComp.find(x => x.id === r.id);
    const rc = RARITY_COLOR[r.rarity] || '#aaa';
    const name = c ? (isEn?(c.nameEn||c.name):c.name) : r.id;
    if (r.type === 'companion') {
      return `<div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
        <span style="font-size:18px;">💫</span>
        <span style="font-size:12px;color:${rc};font-weight:bold;">
          ${name} ${isEn?'Summoned!':'완전체!'}
          ${r.converted ? `<span style="font-size:9px;color:#888;">${isEn?'(Dupe→Frag×10)':'(중복→파편×10)'}</span>` : '🎉'}
        </span>
        <span style="font-size:9px;padding:1px 5px;border-radius:6px;
          background:${rc}22;border:1px solid ${rc};color:${rc};">
          ${RARITY_LABEL[r.rarity]||''}
        </span>
      </div>`;
    }
    return `<div style="display:flex;align-items:center;gap:8px;padding:3px 0;">
      <span style="font-size:14px;">🎴</span>
      <span style="font-size:11px;color:${rc};">${name} ${isEn?'Frag':'파편'} ×${r.amount}</span>
      <span style="font-size:9px;padding:1px 4px;border-radius:5px;
        background:${rc}18;border:1px solid ${rc}55;color:${rc};">${RARITY_LABEL[r.rarity]||''}</span>
    </div>`;
  }

  function goView(view) {
    currentView = view;
    if (view !== 'gacha') lastResults = [];
    render(document.getElementById('app'));
  }
  function setTab(tab) {
    activeTab = tab;
    render(document.getElementById('app'));
  }
  function exchange(key, cost, amount) {
    saveData = Save.load();
    if ((saveData.gems || 0) < cost) return;
    saveData.gems -= cost;
    saveData[key] = (saveData[key] || 0) + amount;
    Save.save(saveData);
    render(document.getElementById('app'));
  }
  function pull(n) {
    pullN(n, activeTab === 'gold');
  }

  function enter(el) {
    saveData    = Save.load();
    currentView = 'main';
    lastResults = [];
    render(el);
  }
  function exit() {}

  return { enter, exit, goView, setTab, pull, exchange };
})();
