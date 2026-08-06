// shop-scene.js - 상점 허브
const ShopScene = (() => {
  let saveData = null;
  let currentView = 'main';  // 'main' | 'gacha' | 'exchange'
  let activeTab   = 'gold';  // gacha 내 탭: 'gold' | 'diamond'
  let lastResults = [];

  // ── 비용 ──
  const GOLD_COST_1   = 1000;
  const GOLD_COST_10  = 10000;
  const GOLD_COST_100 = 100000; // [UPDATE 2026-08-06] 100회 뽑기 추가 — 10회와 동일 비율(×10)로 스케일
  const GEM_COST_1    = 80;
  const GEM_COST_10   = 800;
  const GEM_COST_100  = 8000;

  // ── 뽑기 풀 ── [UPDATE 2026-07-11] 260711_MTOPC.md 1번: 정성굿(골드)=커먼·언커먼·레어 / 대신굿(다이아)=레어·유니크, 레어는 양쪽에 겹쳐 포함
  const GOLD_FULL_WEIGHTS = [
    { id:'ggeogsoe', rarity:'common',   weight:24 },
    { id:'dochi',    rarity:'uncommon', weight:8  },
    { id:'aram',     rarity:'uncommon', weight:8  },
    { id:'danbi',    rarity:'uncommon', weight:8  },
    { id:'gaon',     rarity:'uncommon', weight:8  },
    { id:'cheolgap', rarity:'uncommon', weight:8  },
    { id:'mugsa',    rarity:'uncommon', weight:8  },
    { id:'cheonga',  rarity:'rare',     weight:4  },
    { id:'sohee',    rarity:'rare',     weight:4  },
  ];
  // [UPDATE 2026-07-17] 도깨비 계열 신규 동료(박수/장구애비) — 원래 GOLD_FULL_WEIGHTS에 무조건 포함돼 있어서
  // 게임 시작부터 뽑혔던 버그. [UPDATE 2026-07-19] 시즌3 진입(season2Clear) 이후에만 골드 풀에 추가되도록 분리.
  // [UPDATE 2026-07-19] 등급 재조정: 박수=레어, 장구애비=레전더리(첫 레전더리 동료 — 골드 풀 최상위 희귀도라 가중치 최저)
  const S3_GOLD_WEIGHTS = [
    { id:'baksu',       rarity:'rare',      weight:4 },
    { id:'janggu_aebi', rarity:'legendary', weight:1 },
  ];
  const DIAMOND_FULL_WEIGHTS = [
    { id:'cheonga',  rarity:'rare',   weight:10 },
    { id:'sohee',    rarity:'rare',   weight:10 },
    { id:'geumgang', rarity:'unique', weight:20 },
    { id:'baekho',   rarity:'unique', weight:20 },
  ];
  // [UPDATE 2026-07-06] 시즌2 해금(시즌1 클리어) 후 다이아 풀에 추가되는 동료
  const S2_DIAMOND_WEIGHTS = [
    { id:'haewonmaek', rarity:'rare', weight:10 },
  ];
  // [UPDATE 2026-07-17] 시즌4 해금(시즌3 클리어) 후 다이아 풀에 추가되는 동료
  // [UPDATE 2026-07-19] 등급 재조정: 환생동자=유니크, 허무검사=레전더리 — 다이아 풀 최상위 희귀도라 가중치 최저
  const S4_DIAMOND_WEIGHTS = [
    { id:'hwansaengdongja', rarity:'unique',    weight:20 },
    { id:'heomugeomsa',     rarity:'legendary', weight:8  },
  ];
  // [UPDATE 2026-07-16] 강림차사는 스테이지160 클리어 시 스토리로 확정 지급되는 동료(game.js) — 그 전엔
  // 뽑기 풀에 아예 없어야 하는데 조건 없이 항상 풀에 있어서 스토리 해금 전에도 뽑혀버리던 버그 수정.
  // 해금 이후엔(이미 보유 중) 다른 동료처럼 중복 뽑기 시 파편으로 전환되도록 그때만 풀에 포함.
  const GANGNIM_DIAMOND_WEIGHTS = [
    { id:'gangnim',  rarity:'unique', weight:20 },
  ];
  // [UPDATE 2026-07-22] 시즌5 해금(시즌4 클리어) 후 다이아 풀에 추가되는 동료
  const S5_DIAMOND_WEIGHTS = [
    { id:'baekunseonin',   rarity:'legendary', weight:8  },
    { id:'maehwageomseon', rarity:'unique',    weight:20 },
  ];
  // [UPDATE 2026-07-31] 시즌7(어계) 해금 후 다이아 풀에 추가되는 동료.
  // 천자는 게임 최초의 미소스 등급이라 레전더리(8)보다도 확실히 낮은 가중치(3)를 준다.
  // (시즌6은 신규 동료 없이 법칙 시스템이 그 자리를 대신했으므로 S6 풀은 존재하지 않음)
  const S7_DIAMOND_WEIGHTS = [
    { id:'mirinae', rarity:'legendary', weight:8 },
    { id:'cheonja', rarity:'mythos',    weight:3 },
  ];
  // [UPDATE 2026-07-19] diamondPool()과 동일 패턴 — 골드 풀도 시즌 게이트 동료를 조건부로 추가
  function goldPool() {
    let pool = [...GOLD_FULL_WEIGHTS];
    if (saveData?.season2Clear) pool = pool.concat(S3_GOLD_WEIGHTS);
    return pool;
  }
  function diamondPool() {
    let pool = [...DIAMOND_FULL_WEIGHTS];
    // [UPDATE 2026-07-18] WORLDBUILDING.md 설계대로 해원맥 해금 시점을 "챕터11 클리어(스테이지110)"로 수정
    // (이전엔 season1Clear=스테이지100 기준이라 저승나비와 함께 "길잡이" 컨셉인데 스토리보다 1챕터 일찍 풀리고 있었음)
    if (Unlock.cleared(saveData, 110)) pool = pool.concat(S2_DIAMOND_WEIGHTS);
    // [UPDATE 2026-07-17] 콘텐츠 배포 플래그(CONFIG.CONTENT_RELEASE) 추가 — 스토리 조건 충족해도 플래그가 꺼져있으면 풀에서 제외
    if (saveData?.season3Clear && isSeasonReleased(4)) pool = pool.concat(S4_DIAMOND_WEIGHTS);
    if (Unlock.cleared(saveData, 160)) pool = pool.concat(GANGNIM_DIAMOND_WEIGHTS);
    if (saveData?.season4Clear && isSeasonReleased(5)) pool = pool.concat(S5_DIAMOND_WEIGHTS);
    if (saveData?.season6Clear && isSeasonReleased(7)) pool = pool.concat(S7_DIAMOND_WEIGHTS); // [UPDATE 2026-07-31]
    return pool;
  }
  // [UPDATE 2026-07-19] 장구애비(레전더리) 추가로 레전더리 등급 동료가 처음 생겨서, 파편 보상 버킷에도 추가
  // (없으면 골드풀 레전더리는 직접 뽑기 성공 시 중복전환(+10)으로만 파편을 얻을 수 있어 다른 등급보다 불리했음)
  const GOLD_FRAG_WEIGHTS = [
    { rarity:'common',    weight:45 },
    { rarity:'uncommon',  weight:30 },
    { rarity:'rare',      weight:10 },
    { rarity:'legendary', weight:2  },
    { rarity:'universal', weight:5  },
  ];
  // [UPDATE 2026-07-19] 허무검사(레전더리) 추가로 다이아 풀도 레전더리 파편 버킷 추가
  const DIAMOND_FRAG_WEIGHTS = [
    { rarity:'rare',      weight:55 },
    { rarity:'unique',    weight:20 },
    { rarity:'legendary', weight:5  },
    { rarity:'universal', weight:5  },
  ];

  // [UPDATE 2026-07-11] 7단계 등급 라벨/색상 추가
  const RARITY_LABEL = {
    common:'커먼', uncommon:'언커먼', rare:'레어', unique:'유니크',
    epic:'에픽', legendary:'레전더리', mythos:'미소스', special:'★스페셜', universal:'만능'
  };
  // [UPDATE 2026-07-12] 영어 모드에서도 한글 등급 라벨이 그대로 보이던 버그 수정 — 영어 라벨 추가
  const RARITY_LABEL_EN = {
    common:'Common', uncommon:'Uncommon', rare:'Rare', unique:'Unique',
    epic:'Epic', legendary:'Legendary', mythos:'Mythos', special:'★Special', universal:'Universal'
  };
  const _rarityLabel = (rarity, isEn) => (isEn ? RARITY_LABEL_EN : RARITY_LABEL)[rarity] || '';
  const RARITY_COLOR = {
    common:'#aaa', uncommon:'#60a060', rare:'#4a90d9', unique:'#a040e0',
    epic:'#c060d0', legendary:'#e8a020', mythos:'#ff4060', special:'#ffb020', universal:'#60c8ff'
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
    const fullPool = isGold ? goldPool() : diamondPool();
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
  // [UPDATE 2026-08-06] 100회 뽑기 추가 — 10회(=10+1 보너스)와 동일한 10% 보너스 비율로 100+10.
  function pullN(n, isGold) {
    const cost = isGold
      ? (n === 1 ? GOLD_COST_1 : n === 10 ? GOLD_COST_10 : GOLD_COST_100)
      : (n === 1 ? GEM_COST_1  : n === 10 ? GEM_COST_10  : GEM_COST_100);
    if (isGold  && (saveData.gold || 0) < cost) return;
    if (!isGold && (saveData.gems || 0) < cost) return;
    if (isGold) saveData.gold -= cost;
    else        saveData.gems -= cost;
    const count = n === 1 ? 1 : n === 10 ? 11 : 110;
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
          <span style="color:#f0c840;">${_cimg('gold')} ${Format.num(gold)}</span>
          <span style="color:#60b8ff;">💎 ${Format.num(gems)}</span>
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
      // [UPDATE 2026-07-24] 시즌6(원계) 법칙 시스템 — 동료 파편을 규율석으로 교환. 시즌6 해금 전엔 목록엔 보이되
      // 눌러보면 "시즌6 오픈 필요" 안내만 뜨게(goView에서 게이트 체크).
      {
        id: 'lawExchange',
        icon: '⚖️',
        label: isEn ? 'Fragment → Rule Stone' : '동료 파편 상점',
        desc: isEn ? 'Exchange companion fragments for Rule Stones (used for Laws).' : '동료 파편을 규율석(법칙 재화)으로 교환합니다.',
        color: '#a8b8e8',
        bg: 'rgba(136,152,200,0.10)',
        border: 'rgba(168,184,232,0.30)',
      },
      // 추후 카테고리 예시:
      // { id:'blackmarket', icon:'🕵️', label: isEn?'Black Market':'암시장', ... },
    ];

    el.innerHTML = `
      <div style="height:844px;background:linear-gradient(180deg,#080614 0%,#10091a 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;color:#e8d8ff;
        display:flex;flex-direction:column;overflow:hidden;">
        ${headerHTML(isEn?'🏪 Shop':'🏪 상점', "SceneManager.go('lobby')")}
        <div class="scroll-pan-y" style="flex:1;overflow-y:auto;padding:20px 16px;display:flex;flex-direction:column;gap:12px;">
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
    const canGold1   = gold >= GOLD_COST_1;
    const canGold10  = gold >= GOLD_COST_10;
    const canGold100 = gold >= GOLD_COST_100;
    const canGem1    = gems >= GEM_COST_1;
    const canGem10   = gems >= GEM_COST_10;
    const canGem100  = gems >= GEM_COST_100;
    const can1   = isGold ? canGold1   : canGem1;
    const can10  = isGold ? canGold10  : canGem10;
    const can100 = isGold ? canGold100 : canGem100;

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

        <div class="scroll-pan-y" style="flex:1;overflow-y:auto;padding:14px 16px 32px;">
          <!-- 뽑기 패널 -->
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(200,160,255,0.15);
            border-radius:14px;padding:14px;margin-bottom:14px;">
            <div style="font-size:11px;color:rgba(200,160,255,0.5);margin-bottom:8px;">
              ${isGold
                ? (isEn?'Common~Epic companion fragments & summons (80% frag / 20% full)':'커먼~에픽 동료 파편 · 완전체 (80% 파편 / 20% 완전체)')
                : (isEn?'Rare~Special companion fragments & summons (80% frag / 20% full)':'레어~스페셜 동료 파편 · 완전체 (80% 파편 / 20% 완전체)')}
            </div>
            <!-- [UPDATE 2026-08-06] 100회 뽑기(100+10 보너스) 추가 — 버튼 3개라 flex:1로 균등폭 유지 -->
            <div style="display:flex;gap:6px;">
              <button onclick="ShopScene.pull(1)" style="
                flex:1;padding:10px 0;border-radius:10px;font-size:12px;font-weight:bold;
                cursor:${can1?'pointer':'not-allowed'};font-family:inherit;
                background:${can1?'rgba(180,100,255,0.25)':'rgba(60,60,60,0.3)'};
                border:1px solid ${can1?'rgba(200,140,255,0.6)':'rgba(255,255,255,0.1)'};
                color:${can1?'#e0c8ff':'#555'};">
                1회<br>
                <span style="font-size:10px;">${isGold?`${_cimg('gold',13)}${Format.num(GOLD_COST_1)}`:`💎${Format.num(GEM_COST_1)}`}</span>
              </button>
              <button onclick="ShopScene.pull(10)" style="
                flex:1;padding:10px 0;border-radius:10px;font-size:12px;font-weight:bold;
                cursor:${can10?'pointer':'not-allowed'};font-family:inherit;
                background:${can10?'rgba(255,160,40,0.2)':'rgba(60,60,60,0.3)'};
                border:1px solid ${can10?'rgba(255,200,80,0.5)':'rgba(255,255,255,0.1)'};
                color:${can10?'#f0d060':'#555'};">
                10+1회<br>
                <span style="font-size:10px;">${isGold?`${_cimg('gold',13)}${Format.num(GOLD_COST_10)}`:`💎${Format.num(GEM_COST_10)}`}</span>
              </button>
              <button onclick="ShopScene.pull(100)" style="
                flex:1;padding:10px 0;border-radius:10px;font-size:12px;font-weight:bold;
                cursor:${can100?'pointer':'not-allowed'};font-family:inherit;
                background:${can100?'rgba(255,80,120,0.2)':'rgba(60,60,60,0.3)'};
                border:1px solid ${can100?'rgba(255,120,150,0.5)':'rgba(255,255,255,0.1)'};
                color:${can100?'#ff9ab0':'#555'};">
                100+10회<br>
                <span style="font-size:10px;">${isGold?`${_cimg('gold',13)}${Format.num(GOLD_COST_100)}`:`💎${Format.num(GEM_COST_100)}`}</span>
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
              <div class="scroll-pan-y" style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto;">
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
                      ${isEn?(c.nameEn||c.name):c.name} <span style="color:#888;font-weight:normal;">${_rarityLabel(c.rarity,isEn)}</span>
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
    // [UPDATE 2026-07-16] 재화 교환 비율 전면 개편 — 기존엔 다이아 2~5개로 재화 겨우 1개를 주는 구조라
    // "다이아로 재화를 대량 교환"이라는 취지와 반대였음(사용자 지적). 다이아 1개 = 재화 10~50개로 재설계,
    // 흔한(파밍 쉬운) 재화일수록 많이, 희귀한 재화일수록 적게 주도록 티어링. 누락돼있던 태극석/차원석/
    // 영혼석/혼돈석/순리석도 교환 목록에 추가.
    const EXCHANGE_ITEMS = [
      { icon:'🪙', spriteKey:'gold',           name:'골드',     nameEn:'Gold',               key:'gold',              cost:1, amount:500 },
      { icon:'🔧', spriteKey:'ganghwaseok',    name:'강화석',   nameEn:'Enhance Stone',      key:'ganghwaseok',       cost:1, amount:50  },
      { icon:'☁️', spriteKey:'cheonunseok',    name:'천운석',   nameEn:'Sky Stone',          key:'cheonunseok',       cost:1, amount:40  },
      { icon:'🍇', spriteKey:'cheonryeonggwa', name:'천령과',   nameEn:'Spirit Fruit',       key:'cheonryeonggwa',    cost:1, amount:35  },
      { icon:'🔷', spriteKey:'taegeukseok',    name:'태극석',   nameEn:'Taeguk Stone',       key:'taegeukseok',       cost:1, amount:20  },
      { icon:'🌀', spriteKey:'chaewonseok',    name:'차원석',   nameEn:'Dimension Stone',    key:'chaewonseok',       cost:1, amount:20  },
      // [UPDATE 2026-07-17] 전용 아이콘 반입
      { icon:'🌪️', spriteKey:'hondonseok', name:'혼돈석',       nameEn:'Chaos Stone',        key:'hondonseok',        cost:1, amount:15  },
      { icon:'🌊', spriteKey:'sullriseok', name:'순리석',        nameEn:'Sunri Stone',        key:'sullriseok',        cost:1, amount:15  },
      // [UPDATE 2026-07-17] yeongonseok(유령 재화) → soulStones로 통합
      { icon:'💜', name:'영혼석',               nameEn:'Soul Stone',                         key:'soulStones',        cost:1, amount:10  },
      { icon:'✨', name:'만능파편',              nameEn:'Universal Fragment',                 key:'universalFragments',cost:1, amount:5   },
    ];

    el.innerHTML = `
      <div style="height:844px;background:linear-gradient(180deg,#080614 0%,#10091a 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;color:#e8d8ff;
        display:flex;flex-direction:column;overflow:hidden;">
        ${headerHTML(isEn?'🔄 Currency Exchange':'🔄 재화 교환', "ShopScene.goView('main')")}
        <div class="scroll-pan-y" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;">
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
    else if (currentView === 'lawExchange') renderLawExchange(el);
    else                            renderMain(el);
  }

  // [UPDATE 2026-07-24] 동료 파편 → 규율석 교환 (시즌6 법칙 시스템 재화). 등급별로 보유 파편을 합산해서
  // 교환비(FRAGMENT_EXCHANGE_RATE)만큼씩 규율석으로 바꿈. 시즌6 해금 전엔 안내만 표시.
  function renderLawExchange(el) {
    const isEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    if (!isSeasonReleased(6)) {
      el.innerHTML = `
        <div style="height:844px;background:linear-gradient(180deg,#080614 0%,#10091a 100%);
          font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;color:#e8d8ff;
          display:flex;flex-direction:column;overflow:hidden;">
          ${headerHTML(isEn?'⚖️ Fragment Exchange':'⚖️ 동료 파편 상점', "ShopScene.goView('main')")}
          <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:20px;text-align:center;">
            <span style="font-size:40px;">🔒</span>
            <div style="font-size:14px;color:#a8b8e8;font-weight:700;">${isEn?'Requires Season 6':'시즌6 오픈 필요'}</div>
            <div style="font-size:11px;color:rgba(200,160,255,0.5);">${isEn?'This shop unlocks once the Primal Realm arrives.':'원계(시즌6)가 열리면 이용할 수 있습니다.'}</div>
          </div>
        </div>`;
      return;
    }
    const RATES = CONFIG.LAW.FRAGMENT_EXCHANGE_RATE;
    const frags = saveData.companionFragments || {};
    // 등급별 파편 총합 계산 (동료 데이터에서 id→rarity 조회)
    const byRarity = {};
    for (const [id, cnt] of Object.entries(frags)) {
      if (!cnt) continue;
      const c = GAME_DATA.companions.find(x => x.id === id);
      if (!c) continue;
      byRarity[c.rarity] = (byRarity[c.rarity] || 0) + cnt;
    }
    // [UPDATE 2026-07-31] 여기서 5단계짜리 지역 RARITY_LABEL을 새로 만들어 모듈 상단의 7단계 맵을 가리고 있었음
    // (에픽/미소스 파편은 라벨이 undefined로 표시됨). 상단의 _rarityLabel 헬퍼를 그대로 쓰도록 정리.
    // 아울러 교환비표를 7단계로 넓히면서 "해당 등급 동료가 아직 하나도 없는" 줄까지 보이게 됐으므로,
    // 실제로 존재하는 등급만 노출한다(에픽 동료가 생기면 자동으로 줄이 늘어남).
    const _existingRarities = new Set(GAME_DATA.companions.map(c => c.rarity));
    const _rarityRows = Object.keys(RATES).filter(r => _existingRarities.has(r));

    el.innerHTML = `
      <div style="height:844px;background:linear-gradient(180deg,#080614 0%,#10091a 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;color:#e8d8ff;
        display:flex;flex-direction:column;overflow:hidden;">
        ${headerHTML(isEn?'⚖️ Fragment Exchange':'⚖️ 동료 파편 상점', "ShopScene.goView('main')")}
        <div class="scroll-pan-y" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;">
          <div style="font-size:11px;color:rgba(200,160,255,0.5);padding:0 4px;">
            ${isEn?`Exchange duplicate companion fragments for Rule Stones · Have ${_cimg('gyulyulseok',14)}${Format.num(saveData.gyulyulseok||0)}`
                  :`중복으로 쌓인 동료 파편을 규율석으로 교환합니다 · 보유 ${_cimg('gyulyulseok',14)}${Format.num(saveData.gyulyulseok||0)}`}
          </div>
          ${_rarityRows.map(rarity => {
            const have = byRarity[rarity] || 0;
            const rate = RATES[rarity];
            const canExchangeCount = Math.floor(have / rate);
            const rc = RARITY_COLOR[rarity] || '#aaa';
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;
                background:rgba(255,255,255,0.04);border:1px solid ${rc}55;border-radius:14px;">
                <div style="flex:1;">
                  <div style="font-size:14px;color:${rc};font-weight:700;">${_rarityLabel(rarity, isEn)}</div>
                  <div style="font-size:10px;color:#5a4a3a;margin-top:2px;">
                    ${isEn?`Have ${Format.num(have)} · ${rate} → ${_cimg('gyulyulseok',10)}1`:`보유 ${Format.num(have)}개 · ${rate}개당 ${_cimg('gyulyulseok',10)}1개`}
                  </div>
                </div>
                <button onclick="ShopScene.exchangeFragmentsForLaw('${rarity}')"
                  style="padding:10px 16px;border-radius:10px;font-size:13px;font-weight:700;
                  cursor:${canExchangeCount>0?'pointer':'not-allowed'};font-family:inherit;
                  background:${canExchangeCount>0?'rgba(136,152,200,0.35)':'rgba(60,60,60,0.3)'};
                  border:1px solid ${canExchangeCount>0?'#a8b8e8':'rgba(255,255,255,0.1)'};
                  color:${canExchangeCount>0?'#e8dcc8':'#555'};">
                  ${isEn?'Exchange':'전부 교환'} ${canExchangeCount>0?`(+${canExchangeCount})`:''}
                </button>
              </div>`;
          }).join('')}
        </div>
      </div>`;
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
          ${_rarityLabel(r.rarity,isEn)}
        </span>
      </div>`;
    }
    return `<div style="display:flex;align-items:center;gap:8px;padding:3px 0;">
      <span style="font-size:14px;">🎴</span>
      <span style="font-size:11px;color:${rc};">${name} ${isEn?'Frag':'파편'} ×${r.amount}</span>
      <span style="font-size:9px;padding:1px 4px;border-radius:5px;
        background:${rc}18;border:1px solid ${rc}55;color:${rc};">${_rarityLabel(r.rarity,isEn)}</span>
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

  // [UPDATE 2026-07-24] 등급별 동료 파편을 규율석으로 일괄 교환 — 어떤 동료 파편인지는 안 가리고
  // 해당 등급 파편들에서 순서대로 소비(등급 내에서는 완전히 상호교환 가능한 재화 취급).
  function exchangeFragmentsForLaw(rarity) {
    saveData = Save.load();
    if (!isSeasonReleased(6)) return;
    const rate = CONFIG.LAW.FRAGMENT_EXCHANGE_RATE[rarity];
    if (!rate) return;
    const frags = saveData.companionFragments || {};
    const ids = GAME_DATA.companions.filter(c => c.rarity === rarity).map(c => c.id);
    let total = ids.reduce((sum, id) => sum + (frags[id] || 0), 0);
    const units = Math.floor(total / rate);
    if (units <= 0) return;
    let toConsume = units * rate;
    for (const id of ids) {
      if (toConsume <= 0) break;
      const have = frags[id] || 0;
      const take = Math.min(have, toConsume);
      frags[id] = have - take;
      toConsume -= take;
    }
    saveData.companionFragments = frags;
    saveData.gyulyulseok = (saveData.gyulyulseok || 0) + units;
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

  return { enter, exit, goView, setTab, pull, exchange, exchangeFragmentsForLaw };
})();
