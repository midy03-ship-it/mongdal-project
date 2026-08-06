// player-scene.js - 캐릭터(플레이어) 화면
const PlayerScene = (() => {
  let saveData = null;
  let _statsOpen = false;         // [UPDATE 2026-07-12] 종합 능력치 확인 팝업 상태
  let _statsTab  = 'overview';    // 'overview' | 'detail' | 'synergy'
  let _statsExpandedRow = null;   // [UPDATE 2026-07-13] 상세 탭에서 탭한 스탯 행(브레이크다운 확대 표시)
  let _codexOpen = false;         // [UPDATE 2026-07-14] 260714_MTOPC.md 5번: 해금 도감 팝업 상태
  let _deckOpen = false;          // [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑥: 덱(무기셋) 저장/불러오기 팝업 상태
  let _seonsulOpen = false;       // [UPDATE 2026-07-22] 선술 스킬트리(시즌5) 팝업 상태
  let _seonsulResetConfirm = false; // 초기화 버튼 2단계 확인
  let _seonsulPending = null;     // [UPDATE 2026-07-23] 노드 클릭 시 뜨는 설명+Y/N 확인 팝업 상태
  let _currencyOpen = false;       // [UPDATE 2026-07-26] 재화 팝업 상태
  let _currencyExpandedKey = null; // [UPDATE 2026-07-26] 재화 창에서 탭한 재화(획득처 펼쳐보기)

  // [UPDATE 2026-07-26] 재화 획득처 정리 — 캐릭터 화면 상단 재화 창용. 코드에서 실제 지급 경로를 확인해서 작성
  // (dungeon-scene.js DUNGEON_DEFS, lobby.js 차원상인 제조, shop-scene.js 재화교환, game.js 드랍 로직 참고)
  const CURRENCY_INFO = [
    { key:'gold', icon:'gold', name:'골드', nameEn:'Gold',
      sources: ['몬스터 처치 시 기본 드랍', '스테이지 클리어 보상', '무한 던전(🌀, 서낭당 해금) 처치 드랍', '차원 상인(로비)/상점 재화교환: 다이아 1개 → 골드 500개'],
      sourcesEn: ['Basic drop from defeating monsters', 'Stage clear reward', 'Infinite Dungeon (🌀, unlocked at Guardian Shrine) kill drops', 'Dimension Merchant(Lobby)/Shop exchange: 1 Diamond → 500 Gold'] },
    { key:'gems', icon:'💎', name:'다이아', nameEn:'Diamond',
      sources: ['보스 러시 던전(👹, 서낭당 해금) 처치 보상', '일반 스테이지 챕터보스 처치 시 확정 +1', '하드 난이도 스테이지 클리어 보상', '업적 달성 보상(한번형/누적 마일스톤 모두)', '초보자 선물(스테이지 5~20 최초클리어)'],
      sourcesEn: ['Boss Rush Dungeon (👹, unlocked at Guardian Shrine) kill reward', 'Guaranteed +1 on defeating a chapter boss', 'Hard difficulty stage clear reward', 'Achievement rewards (one-time & infinite milestones)', 'Beginner gift (first clear of stage 5-20)'] },
    { key:'ganghwaseok', icon:'ganghwaseok', name:'강화석', nameEn:'Enhance Stone',
      sources: ['강화석 던전(🔧, 대장간 해금) — 골드 대신 드랍', '차원 상인/상점 재화교환: 다이아 1개 → 강화석 50개'],
      sourcesEn: ['Enhance Stone Dungeon (🔧, unlocked at Blacksmith) — drops instead of gold', 'Dimension Merchant/Shop exchange: 1 Diamond → 50 Enhance Stones'] },
    { key:'cheonunseok', icon:'cheonunseok', name:'천운석', nameEn:'Sky Stone',
      sources: ['천운석 던전(🪨, 장승당 해금) — 골드 대신 드랍', '차원 상인/상점 재화교환: 다이아 1개 → 천운석 40개'],
      sourcesEn: ['Sky Stone Dungeon (🪨, unlocked at Totem Hall) — drops instead of gold', 'Dimension Merchant/Shop exchange: 1 Diamond → 40 Sky Stones'] },
    { key:'cheonryeonggwa', icon:'cheonryeonggwa', name:'천령과', nameEn:'Spirit Fruit',
      sources: ['천령과 던전(🍑, 용왕 연못 해금) — 골드 대신 드랍', '차원 상인/상점 재화교환: 다이아 1개 → 천령과 35개'],
      sourcesEn: ['Spirit Fruit Dungeon (🍑, unlocked at Dragon King Pond) — drops instead of gold', 'Dimension Merchant/Shop exchange: 1 Diamond → 35 Spirit Fruits'] },
    { key:'taegeukseok', icon:'taegeukseok', name:'태극석', nameEn:'Taeguk Stone',
      sources: ['태극석 던전(💠, 신목 해금) — 골드 대신 드랍', '차원 상인/상점 재화교환: 다이아 1개 → 태극석 20개'],
      sourcesEn: ['Taeguk Stone Dungeon (💠, unlocked at Sacred Tree) — drops instead of gold', 'Dimension Merchant/Shop exchange: 1 Diamond → 20 Taeguk Stones'] },
    { key:'chaewonseok', icon:'chaewonseok', name:'차원석', nameEn:'Dimension Stone',
      sources: ['스테이지 101(시즌2) 이후 일반 스테이지에서 골드 대신 자연 드랍(10%)', '로비 차원 상인: 골드 1,000 → 차원석 1개 교환', '상점 재화교환: 다이아 1개 → 차원석 20개'],
      sourcesEn: ['From stage 101 (Season 2) onward, replaces gold drops in regular stages (10%)', 'Lobby Dimension Merchant: 1,000 Gold → 1 Dimension Stone', 'Shop exchange: 1 Diamond → 20 Dimension Stones'] },
    { key:'hondonseok', icon:'hondonseok', name:'혼돈석', nameEn:'Chaos Stone',
      sources: ['혼돈석 던전(🌪️, 시즌2 클리어 후 해금) — 골드 대신 드랍', '차원 상인/상점 재화교환: 다이아 1개 → 혼돈석 15개'],
      sourcesEn: ['Chaos Stone Dungeon (🌪️, unlocked after clearing Season 2) — drops instead of gold', 'Dimension Merchant/Shop exchange: 1 Diamond → 15 Chaos Stones'] },
    { key:'sullriseok', icon:'sullriseok', name:'순리석', nameEn:'Sunri Stone',
      sources: ['순리석 던전(🌊, 시즌3 클리어 후 해금) — 골드 대신 드랍', '시즌4 스토리 스테이지(301~400)에서 골드 대신 자연 드랍(12%)', '차원 상인/상점 재화교환: 다이아 1개 → 순리석 15개'],
      sourcesEn: ['Sunri Stone Dungeon (🌊, unlocked after clearing Season 3) — drops instead of gold', 'From Season 4 story stages (301-400), replaces gold drops (12%)', 'Dimension Merchant/Shop exchange: 1 Diamond → 15 Sunri Stones'] },
    { key:'soulStones', icon:'soulStones', name:'영혼석', nameEn:'Soul Stone',
      sources: ['스테이지 101(시즌2) 이후 "빅골드" 드랍이 영혼석으로 대체됨', '로비 차원 상인: 영혼조각 → 영혼석 제작(시즌1 클리어 후)', '로비 차원 상인: 차원석 ×5 → 영혼석 ×1 제작(시즌2 클리어 후)', '상점 재화교환: 다이아 1개 → 영혼석 10개'],
      sourcesEn: ['From stage 101 (Season 2) onward, replaces "big gold" drops', 'Lobby Dimension Merchant: craft Soul Fragments → Soul Stone (after clearing Season 1)', 'Lobby Dimension Merchant: craft Dimension Stone ×5 → Soul Stone ×1 (after clearing Season 2)', 'Shop exchange: 1 Diamond → 10 Soul Stones'] },
    { key:'sullgiseok', icon:'🔷', name:'선기석', nameEn:'Seongi Stone',
      sources: ['로비 차원 상인: 차원석 ×5 → 선기석 ×1 제작(시즌4 클리어 후 해금)'],
      sourcesEn: ['Lobby Dimension Merchant: craft Dimension Stone ×5 → Seongi Stone ×1 (unlocked after clearing Season 4)'] },
    { key:'gyulyulseok', icon:'gyulyulseok', name:'규율석', nameEn:'Rule Stone',
      sources: ['던전 드랍 없음 — 상점 "동료 파편 교환"에서 중복으로 쌓인 동료 파편을 규율석으로 교환하는 방식으로만 획득'],
      sourcesEn: ['No dungeon drop — obtained only by exchanging duplicate companion fragments for Rule Stones in the Shop'] },
    { key:'universalFragments', icon:'✨', name:'만능파편', nameEn:'Universal Fragment',
      sources: ['동료 뽑기에서 이미 보유한 동료가 중복으로 나오면 파편 ×10으로 전환', '상점 재화교환: 다이아 1개 → 만능파편 5개'],
      sourcesEn: ['Pulling a companion you already own converts it to ×10 Fragments', 'Shop exchange: 1 Diamond → 5 Universal Fragments'] },
  ];

  // [UPDATE 2026-07-14] 260714_MTOPC.md 5번: 해금 도감 10개 항목 — stageId는 4번(무지개 테두리)과 동일한 Unlock.cleared() 기준 재사용
  const CODEX_ITEMS = [
    { stageId:5,   icon:'⚒️',  ko:'대장간',            en:'Blacksmith',                descKo:'무기 구매·강화',            descEn:'Buy & upgrade weapons' },
    { stageId:10,  icon:'👥',  ko:'의원당',            en:'Uiwon Hall',                descKo:'동료 편성',                 descEn:'Recruit companions' },
    { stageId:15,  icon:'⛩️',  ko:'서낭당',            en:'Seonang Shrine',            descKo:'무한던전·보스러시',          descEn:'Infinite Dungeon & Boss Rush' },
    { stageId:20,  icon:'🗿',  ko:'장승당',            en:'Jangsang Hall',             descKo:'건물 업그레이드',            descEn:'Building upgrades' },
    { stageId:25,  icon:'🐉',  ko:'용왕연못',          en:'Dragon King Pond',          descKo:'펫',                        descEn:'Pets' },
    { stageId:30,  icon:'🌳',  ko:'신목',              en:'Sacred Tree',               descKo:'영구강화',                  descEn:'Permanent upgrades' },
    { stageId:100, icon:'🌀',  ko:'시즌1 완료',        en:'Season 1 Complete',         descKo:'차원석·차원상인 오픈',       descEn:'Chaewonseok & Dimensional Merchant unlocked' },
    { stageId:110, icon:'🗡️🦋', ko:'해원맥·저승나비',   en:'Haewonmaek & Jeoseung Nabi', descKo:'신규 동료·펫 오픈',          descEn:'New companion & pet unlocked' },
    { stageId:160, icon:'⚖️',  ko:'강림차사',          en:'Gangnim Chasa',             descKo:'신규 동료 오픈',             descEn:'New companion unlocked' },
    { stageId:200, icon:'🌺',  ko:'상사화·시즌2 완료', en:'Sangsahwa & Season 2 Complete', descKo:'상사화 펫 오픈',          descEn:'Sangsahwa pet unlocked' },
  ];

  // 일반 강화: 공격력/방어력만
  const STAT_INFO = () => [
    { key:'atk', label:Lang.t('player','stat_atk').label, icon:'⚔️',  desc:Lang.t('player','stat_atk').desc, unit:''  },
    { key:'def', label:Lang.t('player','stat_def').label, icon:'🛡️', desc:Lang.t('player','stat_def').desc, unit:''  },
    // [UPDATE 2026-07-16] 260716_MTOPC.md 3번: 백엔드(config.js/player.js)는 이미 완성돼있던 체력 강화 UI 노출 추가
    { key:'hp',  label:Lang.t('player','stat_hp').label,  icon:'❤️', desc:Lang.t('player','stat_hp').desc,  unit:''  },
  ];

  // 신목 강화 항목
  const SINMOK_INFO = () => {
    const isEn = Lang.getCurrent() === 'en';
    const perLv = isEn ? '/ lv' : '/ 단계';
    const base  = isEn ? 'base' : '기본';
    return [
      { key:'critChance', icon:'🎯', label:Lang.t('sinmok','stat_critChance'), desc:`+${CONFIG.SINMOK.PER_LV.critChance}% ${perLv}`, unit:'%', max:CONFIG.SINMOK.MAX_LV.critChance },
      { key:'critMult',   icon:'💥', label:Lang.t('sinmok','stat_critMult'),   desc:`+${CONFIG.SINMOK.PER_LV.critMult}${isEn?'x':' 배'} ${perLv} (${base} ${CONFIG.SINMOK.CRIT_BASE_MULT}${isEn?'x':'배'})`, unit:isEn?'x':'배', max:CONFIG.SINMOK.MAX_LV.critMult },
      { key:'atkSpd',     icon:'⚡', label:Lang.t('sinmok','stat_atkSpd'),     desc:`+${CONFIG.SINMOK.PER_LV.atkSpd}% ${perLv}`, unit:'', max:CONFIG.SINMOK.MAX_LV.atkSpd },
      { key:'movSpd',     icon:'💨', label:Lang.t('sinmok','stat_movSpd'),     desc:`+${CONFIG.SINMOK.PER_LV.movSpd}% ${perLv}`, unit:'', max:CONFIG.SINMOK.MAX_LV.movSpd },
      { key:'evasion',    icon:'🌀', label:Lang.t('sinmok','stat_evasion'),    desc:`+${CONFIG.SINMOK.PER_LV.evasion}% ${perLv}`, unit:'%', max:CONFIG.SINMOK.MAX_LV.evasion },
    ];
  };

  const BASE = CONFIG.BASE_STATS;

  // 강화 비용 (단계별 2배, 11단계=204,800골드부터 상한 고정)
  // [UPDATE 2026-07-17] 레벨당 상승치(STAT_UPGRADE_PER_LEVEL)는 고정값인데 비용만 지수적으로 무한히
  // 오르면 후반부에 의미가 없어짐 — 11단계 비용으로 캡을 걸어 그 이후는 전부 동일 비용 유지.
  const UPGRADE_COST_CAP_LV = 11; // 100 × 2^11 = 204,800
  function upgradeCost(lv) { return CONFIG.UPGRADE_BASE_COST * Math.pow(CONFIG.UPGRADE_COST_MULT, Math.min(lv, UPGRADE_COST_CAP_LV)); }
  // [UPDATE 2026-08-06] x1씩 누르기 힘들다는 피드백 — x1/x10/x100 일괄강화용 총 비용 미리보기(레벨 오를수록
  // 비용도 오르므로 단순 곱셈이 아니라 레벨별로 실제 합산). 표시용이며 실제 구매는 upgradeBulk()가 1개씩 처리.
  function upgradeCostBatch(startLv, count) {
    let total = 0;
    for (let i = 0; i < count; i++) total += upgradeCost(startLv + i);
    return total;
  }

  function render(el) {
    const upgrades = saveData.statUpgrades || {};
    const gold     = saveData.gold || 0;

    el.innerHTML = `
      <div class="char-root">
        <div class="char-header">
          <button class="back-btn" onclick="SceneManager.go('lobby')">${Lang.t('player','back')}</button>
          <h2 class="char-title">${Lang.t('player','title')}</h2>
          <span class="char-subtitle">${_cimg('gold')} ${Format.num(gold)}</span>
        </div>

        <!-- [UPDATE 2026-07-11] 캐릭터 화면 스크롤 통합 — 주무기/스탯 섹션이 각각 flex:1 독립 스크롤 박스라
             화면이 위아래로 쪼개져 있던 문제 수정. 스프라이트~설명까지 전체를 하나의 스크롤 컨테이너로 통합. -->
        <div class="companion-list">

        <!-- 캐릭터 스프라이트 -->
        <div style="display:flex;align-items:center;justify-content:center;
          padding:16px 0 8px;background:rgba(0,0,0,0.2);
          border-bottom:1px solid rgba(212,160,23,0.15);">
          <img src="${SPRITES?.player?.src || ''}" alt="애기씨"
            style="height:80px;image-rendering:pixelated;
              filter:drop-shadow(0 4px 12px rgba(112,64,192,0.6));">
          <div style="margin-left:16px;flex:1;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <div style="font-size:16px;color:#f0c040;font-weight:600;">${Lang.t('player','charName')}</div>
              <!-- [UPDATE 2026-07-26] 재화 획득처 안내 버튼 — 능력치확인 버튼보다 앞쪽(왼쪽)에 배치 -->
              <button onclick="PlayerScene.openCurrencyPopup()" style="
                padding:4px 10px;border-radius:8px;font-size:10px;font-family:inherit;cursor:pointer;
                background:rgba(240,192,64,0.2);border:1px solid rgba(240,192,64,0.5);color:#f0c860;">
                ${Lang.getCurrent()==='en'?'💰 Currency':'💰 재화'}
              </button>
              <button onclick="PlayerScene.openStatsPopup()" style="
                padding:4px 10px;border-radius:8px;font-size:10px;font-family:inherit;cursor:pointer;
                background:rgba(80,200,120,0.2);border:1px solid rgba(100,220,140,0.5);color:#90e8a0;">
                ${Lang.getCurrent()==='en'?'📊 Stats':'📊 능력치확인'}
              </button>
              <!-- [UPDATE 2026-07-14] 260714_MTOPC.md 5번: 해금 도감 버튼 -->
              <button onclick="PlayerScene.openCodexPopup()" style="
                padding:4px 10px;border-radius:8px;font-size:10px;font-family:inherit;cursor:pointer;
                background:rgba(200,160,80,0.2);border:1px solid rgba(220,180,100,0.5);color:#e8c890;">
                ${Lang.getCurrent()==='en'?'📖 Codex':'📖 해금도감'}
              </button>
              <!-- [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑥: 덱(무기셋) 저장/불러오기 버튼 -->
              <button onclick="PlayerScene.openDeckPopup()" style="
                padding:4px 10px;border-radius:8px;font-size:10px;font-family:inherit;cursor:pointer;
                background:rgba(120,140,220,0.2);border:1px solid rgba(140,160,240,0.5);color:#a8b8f0;">
                ${Lang.getCurrent()==='en'?'🗂️ Loadouts':'🗂️ 무기셋'}
              </button>
              <!-- [UPDATE 2026-07-22] 선술 스킬트리(시즌5) 전용 버튼 — 시즌4 클리어 전에도 버튼은 노출하되 팝업 안에서 잠금 안내 -->
              <button onclick="PlayerScene.openSeonsulPopup()" style="
                padding:4px 10px;border-radius:8px;font-size:10px;font-family:inherit;cursor:pointer;
                background:rgba(88,152,168,0.2);border:1px solid rgba(120,200,208,0.5);color:#a0d8e0;">
                ${Lang.getCurrent()==='en'?'☁️ Celestial Arts':'☁️ 선술'}
              </button>
            </div>
            <div style="font-size:11px;color:#8a7a6a;margin-top:2px;">${Lang.t('player','charSubtitle')}</div>
            <!-- [UPDATE 2026-07-16] 종합 전투력 노출 — 던전강화 카드에서만 보이던 computeBattlePower()를 캐릭터 창에도 표시 -->
            <div style="font-size:12px;color:#e0c0ff;margin-top:6px;font-weight:600;">
              🔮 ${Lang.getCurrent()==='en'?'Battle Power':'종합 전투력'} ${Format.num(computeBattlePower(saveData))}
            </div>
            <div style="font-size:10px;color:#6a5a4a;margin-top:4px;">
              ${Lang.t('player','upgradeHint')}
            </div>
          </div>
        </div>

        <!-- [UPDATE 2026-07-26] 재화 획득처 팝업 -->
        ${_currencyOpen ? _currencyPopupHTML() : ''}
        <!-- [UPDATE 2026-07-12] 종합 능력치 확인 팝업 -->
        ${_statsOpen ? _statsPopupHTML() : ''}
        <!-- [UPDATE 2026-07-14] 260714_MTOPC.md 5번: 해금 도감 팝업 -->
        ${_codexOpen ? _codexPopupHTML() : ''}
        <!-- [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑥: 덱(무기셋) 팝업 -->
        ${_deckOpen ? _deckPopupHTML() : ''}
        <!-- [UPDATE 2026-07-22] 선술 스킬트리(시즌5) 팝업 -->
        ${_seonsulOpen ? _seonsulPopupHTML() : ''}

        <!-- 주무기 선택 -->
        <div style="padding:12px;">
          <div class="list-section-title">${Lang.t('player','mainWeapon')}</div>
          ${(() => {
            const _mwUnlocked = Unlock.getUnlocked(saveData).has('mainWeaponSwitch');
            if (!_mwUnlocked) {
              return `<div style="padding:14px;text-align:center;color:#6a5a4a;font-size:11px;
                border:1px dashed rgba(255,255,255,0.12);border-radius:10px;">
                ${Lang.t('player','weaponLocked')}
              </div>`;
            }
            const _mwIds = ['talisman','sword','bow','staff','scythe_main'];
            const _ownedWpns = saveData.unlockedWeapons || ['talisman'];
            const _hasNormal = (saveData.clearedStagesNormal||[]).length > 0;
            const _hasHard   = (saveData.clearedStagesHard||[]).length > 0;
            // [UPDATE 2026-07-11] 이지 전용 슬롯 확장도 반영
            const _easySlots = (typeof StageSelectScene !== 'undefined') ? StageSelectScene.getEasySlotCount(saveData) : 1;
            const _slotCount = Math.max(_hasHard ? 3 : _hasNormal ? 2 : 1, _easySlots);
            const _selectedMains = saveData.selectedMainWeapons || [saveData.selectedMainWeapon||'talisman'];
            const _unlockLabels = ['', Lang.t('character','slotUnlockNormal'), Lang.t('character','slotUnlockHard')];
            const _diffColors = ['#60c060','#f0c040','#ff6040'];

            const slotsHTML = [0,1,2].map(si => {
              const cur = _selectedMains[si] || null;
              const locked = si >= _slotCount;
              return `<div style="margin-bottom:10px;opacity:${locked?0.4:1};">
                <div style="font-size:10px;color:#c8b8e8;margin-bottom:5px;letter-spacing:.05em;display:flex;align-items:center;gap:6px;">
                  <span style="color:${_diffColors[si]};">●</span> ${Lang.t('player','slotLabel')} ${si+1}
                  ${locked?`<span style="font-size:9px;color:#7a6a5a;">🔒 ${_unlockLabels[si]}</span>`:''}
                  ${!locked&&cur?`<span style="font-size:9px;color:#a090a0;">${Lang.t('player','slotDeselect')}</span>`:''}
                </div>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;">
                  ${_mwIds.map(wid => {
                    const def = MAIN_WEAPON_DEFS[wid];
                    const isSel = !locked && cur === wid;
                    const isOwned = _ownedWpns.includes(wid);
                    // 다른 슬롯에서 이미 사용 중이면 선택 불가
                    const usedInOther = _selectedMains.some((w,idx) => idx !== si && w === wid);
                    const canPick = !locked && isOwned && !usedInOther;
                    const img = CARD_IMGS[wid] || '';
                    return `<div onclick="${canPick?`PlayerScene.selectMainWeapon('${wid}',${si})`:''}"
                      style="cursor:${canPick?'pointer':'default'};border-radius:8px;padding:5px 3px;text-align:center;
                        background:${isSel?'rgba(220,160,20,0.18)':'rgba(255,255,255,0.04)'};
                        border:2px solid ${isSel?_diffColors[si]:'rgba(255,255,255,0.1)'};
                        opacity:${isOwned&&!usedInOther?1:0.25};">
                      ${img?`<img src="${img}" style="width:32px;height:32px;object-fit:contain;image-rendering:pixelated;">`
                           :`<div style="font-size:20px;">${def.icon}</div>`}
                      <div style="font-size:8px;color:${isSel?_diffColors[si]:'#8a7a6a'};margin-top:1px;">${wi18n(def.id,'name',def.name)}</div>
                    </div>`;
                  }).join('')}
                </div>
              </div>`;
            }).join('');

            return slotsHTML;
          })()}
        </div>

        <!-- 스탯 목록 -->
        <div style="padding:12px;">
          <div class="list-section-title">${Lang.t('player','statSection')}</div>

          ${STAT_INFO().map(s => {
            const upLv   = upgrades[s.key] || 0;
            const upAmt  = upLv * getUpgradePerLevel(s.key);
            // [UPDATE 2026-07-16] 260716_MTOPC.md 3번: hp는 BASE_STATS가 아니라 CONFIG.PLAYER.BASE_HP가 기준값
            const total  = (s.key==='hp' ? CONFIG.PLAYER.BASE_HP : BASE[s.key]) + upAmt;
            const cost   = upgradeCost(upLv);
            const canAfford = gold >= cost;
            // [UPDATE 2026-07-15] 스테이지1만 클리어한 신규 유저에게 공격력 강화 위치를 펄스+말풍선으로 안내
            const _allClearedIds = new Set([
              ...(saveData.clearedStagesEasy||[]), ...(saveData.clearedStagesNormal||[]), ...(saveData.clearedStagesHard||[]),
            ]);
            const isGuideTarget = s.key==='atk' && _allClearedIds.size===1 && _allClearedIds.has(1) && !saveData._atkGuideDismissed;

            return `
              <div class="${isGuideTarget?'onboard-pulse':''}" style="
                position:relative;
                display:flex;flex-direction:column;gap:8px;
                padding:10px 12px;margin-bottom:8px;
                background:rgba(255,255,255,0.03);
                border:1px solid rgba(255,255,255,0.07);
                border-radius:10px;">
                ${isGuideTarget ? `<span class="onboard-hint">${Lang.t('onboarding','atkUpgradeHint')}</span>` : ''}

                <!-- [UPDATE 2026-08-06] 버튼이 x1/x10/x100 3개로 늘면서 한 줄에 다 안 들어가 화면 밖으로
                     밀려나던 문제 — 위(아이콘+이름+수치) / 아래(버튼 3개, 카드 폭 꽉 채움) 두 줄로 분리. -->
                <div style="display:flex;align-items:center;gap:10px;">
                  <!-- 아이콘 + 이름 -->
                  <div style="font-size:20px;flex-shrink:0;">${s.icon}</div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;color:#e8dcc8;font-weight:600;">${s.label}</div>
                    <div style="font-size:9px;color:#6a5a4a;">${s.desc}</div>
                  </div>

                  <!-- 수치 -->
                  <div style="text-align:right;flex-shrink:0;">
                    <div style="font-size:16px;color:#f0c040;font-weight:700;">
                      ${total.toFixed(s.key==='eva'?1:0)}${s.unit}
                    </div>
                    ${upLv > 0 ? `<div style="font-size:9px;color:#60d060;">+${upAmt.toFixed(s.key==='eva'?1:0)} ${Lang.t('player','upgraded')}</div>` : ''}
                  </div>
                </div>

                <!-- 강화 버튼 x1/x10/x100 — 카드 폭을 3등분해서 채움(flex:1 each) -->
                <!-- [UPDATE 2026-08-06] "하나씩 누르기 힘들다" 피드백 — 일괄강화 버튼 추가. 표시 비용은 그 개수를
                     전부 살 때의 총액(레벨 오를수록 개당 비용도 오르므로 실합산)이고, 활성화는 최소 1개라도
                     살 수 있으면 켜둠 — 실제 구매는 upgradeBulk()가 돈 떨어지면 중간에 멈추는 부분구매 방식. -->
                <div style="display:flex;gap:6px;">
                  ${[1,10,100].map(n => {
                    const batchCost = upgradeCostBatch(upLv, n);
                    return `<button onclick="PlayerScene.${n===1?`upgrade('${s.key}')`:`upgradeBulk('${s.key}',${n})`}" style="
                      flex:1;padding:5px 4px;min-width:0;
                      background:${canAfford?'rgba(112,64,192,0.4)':'rgba(255,255,255,0.04)'};
                      border:1px solid ${canAfford?'#7040c0':'rgba(255,255,255,0.1)'};
                      border-radius:7px;cursor:${canAfford?'pointer':'default'};
                      color:${canAfford?'#e8dcc8':'#444'};font-family:inherit;font-size:9px;
                      display:flex;flex-direction:column;align-items:center;gap:1px;">
                      <span>×${n}</span>
                      <span style="color:${canAfford?'#f0c040':'#444'};font-size:8px;">${_cimg('gold')}${Format.num(batchCost)}</span>
                    </button>`;
                  }).join('')}
                </div>
              </div>`;
          }).join('')}
        </div>

        <!-- 신목 강화 섹션 -->
        ${(() => {
          const _smUnlocked = Unlock.getUnlocked(saveData).has('sinmok');
          const _sm = saveData.sinmokUpgrades || {};
          const _smGold = saveData.gold || 0;
          const _smTaegeuk = saveData.taegeukseok || 0;
          return '<div style="margin-top:8px;border-top:2px solid rgba(100,200,100,0.3);padding-top:12px;">'
            + `<div style="text-align:center;font-size:13px;color:#80e080;letter-spacing:.1em;margin-bottom:10px;">${Lang.t('sinmok','title')} `
            + (_smUnlocked ? '' : `<span style="font-size:10px;color:#555;">${Lang.t('sinmok','locked')}</span>`)
            + '</div>'
            + SINMOK_INFO().map(s => {
                const lv = _sm[s.key] || 0;
                const cost = Math.floor(CONFIG.SINMOK.BASE_COST * Math.pow(CONFIG.SINMOK.COST_MULT, lv));
                const tCost = sinmokTaegeukCost(lv);
                const maxed = lv >= s.max;
                const canBuy = _smUnlocked && !maxed && _smGold >= cost && _smTaegeuk >= tCost;
                const curVal = s.key === 'critMult'
                  ? (CONFIG.SINMOK.CRIT_BASE_MULT + lv * CONFIG.SINMOK.PER_LV.critMult).toFixed(1)
                  : (lv * CONFIG.SINMOK.PER_LV[s.key]);
                const btnLabel = maxed ? 'MAX' : _smUnlocked ? `${_cimg('gold')}${Format.num(cost)} ${_cimg('taegeukseok')}${tCost}` : '🔒';
                return `<div style="display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <span style="font-size:18px;">${s.icon}</span>
                  <div style="flex:1;">
                    <div style="font-size:12px;color:#c0e8c0;">${s.label} <span style="color:#80e080;font-size:11px;">Lv${lv}/${s.max}</span></div>
                    <div style="font-size:10px;color:#888;">${s.desc}</div>
                    ${lv > 0 ? `<div style="font-size:10px;color:#60d060;">${Lang.t('sinmok','current')}: +${curVal}${s.unit}</div>` : ''}
                  </div>
                  <button onclick="PlayerScene.sinmokUpgrade('${s.key}')" style="
                    padding:5px 10px;border-radius:8px;font-size:11px;font-family:inherit;
                    cursor:${(_smUnlocked&&!maxed)?'pointer':'default'};
                    background:${maxed?'rgba(60,60,60,0.2)':canBuy?'rgba(60,160,60,0.35)':'rgba(40,40,40,0.3)'};
                    border:1px solid ${maxed?'#333':canBuy?'rgba(100,200,100,0.6)':'#333'};
                    color:${maxed?'#444':canBuy?'#90e890':'#555'};">
                    ${btnLabel}
                  </button>
                </div>`;
              }).join('')
            + '</div>';
        })()}

        <!-- [UPDATE 2026-07-06] 명부 강화 섹션 (시즌2, 영혼석 소모) -->
        ${(() => {
          const isEn = Lang.getCurrent() === 'en';
          const _unlocked = !!saveData.season1Clear;
          const _s2 = saveData.sinmokS2 || {};
          const _stones = saveData.soulStones || 0;
          const _cfg = CONFIG.SINMOK_S2;
          const _items = [
            { key:'extraDmg',   icon:'☠️', label:isEn?'Extra Damage':'추가 데미지',
              desc:`+${_cfg.PER_LV.extraDmg}% ${isEn?'/ lv':'/ 단계'} (${isEn?'max':'최대'} +${_cfg.PER_LV.extraDmg*_cfg.MAX_LV.extraDmg}%)`, unit:'%' },
            { key:'reflectDmg', icon:'🔮', label:isEn?'Damage Reflect':'데미지 반사',
              desc:`+${_cfg.PER_LV.reflectDmg}% ${isEn?'/ lv':'/ 단계'} (${isEn?'max':'최대'} +${(_cfg.PER_LV.reflectDmg*_cfg.MAX_LV.reflectDmg).toFixed(0)}%)`, unit:'%' },
          ];
          return '<div style="margin-top:8px;border-top:2px solid rgba(160,100,255,0.3);padding-top:12px;">'
            + `<div style="text-align:center;font-size:13px;color:#c090ff;letter-spacing:.1em;margin-bottom:4px;">${isEn?'📖 Soul Registry':'📖 명부 강화'} `
            + (_unlocked ? '' : `<span style="font-size:10px;color:#555;">${isEn?'🔒 Clear Season 1':'🔒 시즌1 클리어 후 해금'}</span>`)
            + '</div>'
            + `<div style="text-align:center;font-size:10px;color:#8060a0;margin-bottom:10px;">${isEn?'Permanent upgrades using Soul Stones':'영혼석으로 영구 강화'} · 💜 ${Format.num(_stones)}</div>`
            + _items.map(s => {
                const lv = _s2[s.key] || 0;
                const max = _cfg.MAX_LV[s.key];
                const cost = _cfg.BASE_COST + Math.floor(lv / _cfg.COST_STEP);
                const maxed = lv >= max;
                const canBuy = _unlocked && !maxed && _stones >= cost;
                const curVal = (lv * _cfg.PER_LV[s.key]).toFixed(s.key==='reflectDmg'?1:0);
                const btnLabel = maxed ? 'MAX' : _unlocked ? `💜${cost}` : '🔒';
                return `<div style="display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid rgba(255,255,255,0.04);">
                  <span style="font-size:18px;">${s.icon}</span>
                  <div style="flex:1;">
                    <div style="font-size:12px;color:#d8c0f8;">${s.label} <span style="color:#c090ff;font-size:11px;">Lv${lv}/${max}</span></div>
                    <div style="font-size:10px;color:#888;">${s.desc}</div>
                    ${lv > 0 ? `<div style="font-size:10px;color:#b080e0;">${isEn?'Current':'현재'}: +${curVal}${s.unit}</div>` : ''}
                  </div>
                  <button onclick="PlayerScene.sinmokS2Upgrade('${s.key}')" style="
                    padding:5px 10px;border-radius:8px;font-size:11px;font-family:inherit;
                    cursor:${(_unlocked&&!maxed)?'pointer':'default'};
                    background:${maxed?'rgba(60,60,60,0.2)':canBuy?'rgba(120,60,200,0.35)':'rgba(40,40,40,0.3)'};
                    border:1px solid ${maxed?'#333':canBuy?'rgba(180,120,255,0.6)':'#333'};
                    color:${maxed?'#444':canBuy?'#d0a0ff':'#555'};">
                    ${btnLabel}
                  </button>
                </div>`;
              }).join('')
            + '</div>';
        })()}

        <!-- [UPDATE 2026-07-17] 명(命) 강화 섹션 (시즌4 특화, 순리석 소모, 단일 트랙 0~10) -->
        ${(() => {
          const isEn = Lang.getCurrent() === 'en';
          const _unlocked = !!saveData.season3Clear && isSeasonReleased(4);
          const _lv = saveData.myeongLv || 0;
          const _cfg = CONFIG.MYEONG;
          const _maxed = _lv >= _cfg.MAX_LV;
          const _stones = saveData.sullriseok || 0;
          const _cost = Math.floor(_cfg.BASE_COST * Math.pow(_cfg.COST_MULT, _lv));
          const _canBuy = _unlocked && !_maxed && _stones >= _cost;
          const _critHeal = Math.min(_lv, 3) * _cfg.CRIT_HEAL_PER_TIER;
          const _reviveChance = Math.max(0, Math.min(_lv, 6) - 3) * _cfg.REVIVE_CHANCE_PER_TIER;
          const _bossEvade = Math.max(0, Math.min(_lv, 9) - 6) * _cfg.BOSS_EVADE_PER_TIER;
          const _bossBonus = _lv >= _cfg.MAX_LV;
          const _rows = [
            { active: _critHeal > 0,    text: isEn ? `Crit heal +${_critHeal} HP`        : `크리티컬 시 HP +${_critHeal} 회복` },
            { active: _reviveChance > 0,text: isEn ? `Auto-revive ${_reviveChance}%`      : `사망 시 ${_reviveChance}% 확률 자동 생존` },
            { active: _bossEvade > 0,   text: isEn ? `+${_bossEvade}% evade vs bosses`    : `보스 앞 회피율 +${_bossEvade}%` },
            { active: _bossBonus,       text: isEn ? `Bonus reward on boss kill`          : `보스 처치 시 추가 보상` },
          ];
          const btnLabel = _maxed ? 'MAX' : _unlocked ? `🌊${_cost}` : '🔒';
          return `<div style="margin-top:8px;border-top:2px solid rgba(120,160,220,0.3);padding-top:12px;">
            <div style="text-align:center;font-size:13px;color:#90c0f0;letter-spacing:.1em;margin-bottom:4px;">${isEn?'☯️ Fate (Myeong)':'☯️ 명(命) 강화'} `
            + (_unlocked ? '' : `<span style="font-size:10px;color:#555;">${isEn?'🔒 Clear Season 3':'🔒 시즌3 클리어 후 해금'}</span>`)
            + `</div>
            <div style="text-align:center;font-size:10px;color:#6090b0;margin-bottom:10px;">${isEn?'Permanent upgrades using Sunri Stones':'순리석으로 영구 강화'} · 🌊 ${Format.num(_stones)}</div>
            <div style="display:flex;align-items:center;gap:8px;padding:7px 14px;border-bottom:1px solid rgba(255,255,255,0.04);">
              <span style="font-size:18px;">☯️</span>
              <div style="flex:1;">
                <div style="font-size:12px;color:#c0d8f8;">${isEn?'Fate':'명'} <span style="color:#90c0f0;font-size:11px;">Lv${_lv}/${_cfg.MAX_LV}</span></div>
                ${_rows.map(r => `<div style="font-size:10px;color:${r.active?'#90c0f0':'#555'};">${r.active?'✓':'—'} ${r.text}</div>`).join('')}
              </div>
              <button onclick="PlayerScene.myeongUpgrade()" style="
                padding:5px 10px;border-radius:8px;font-size:11px;font-family:inherit;
                cursor:${(_unlocked&&!_maxed)?'pointer':'default'};
                background:${_maxed?'rgba(60,60,60,0.2)':_canBuy?'rgba(60,120,200,0.35)':'rgba(40,40,40,0.3)'};
                border:1px solid ${_maxed?'#333':_canBuy?'rgba(120,180,255,0.6)':'#333'};
                color:${_maxed?'#444':_canBuy?'#a0d0ff':'#555'};">
                ${btnLabel}
              </button>
            </div>
          </div>`;
        })()}

        <!-- 설명 -->
        <div style="padding:10px 16px;font-size:10px;color:#555;
          border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
          ${Lang.t('player','upgradeHintFooter')}<br>
          ${Lang.t('player','upgradeFooter2')}
        </div>

        </div>
      </div>`;
  }

  function getUpgradePerLevel(key) { return CONFIG.STAT_UPGRADE_PER_LEVEL[key] || 5; }

  // [UPDATE 2026-07-16] 강화 버튼 누를 때마다 스크롤이 맨 위로 튕기던 버그 재발 수정 —
  // render()가 innerHTML을 통째로 교체해서 .companion-list 스크롤 위치가 매번 초기화됨.
  // 재렌더 전후로 스크롤 위치를 캡처/복원.
  function _rerender() {
    const el = document.getElementById('app');
    const scrollEl = el && el.querySelector('.companion-list');
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
    // [UPDATE 2026-07-23] 선술/덱/도감/스탯 팝업들이 전부 .scroll-pan-y 하나를 공유하는데
    // 재렌더 시 스크롤 위치가 안 지켜지던 고질적 버그 — 팝업 쪽도 같은 패턴으로 저장/복원
    const popupScrollEl = el && el.querySelector('.scroll-pan-y');
    const popupScrollTop = popupScrollEl ? popupScrollEl.scrollTop : 0;
    render(el);
    const app = document.getElementById('app');
    const newScrollEl = app.querySelector('.companion-list');
    if (newScrollEl) newScrollEl.scrollTop = scrollTop;
    const newPopupScrollEl = app.querySelector('.scroll-pan-y');
    if (newPopupScrollEl) newPopupScrollEl.scrollTop = popupScrollTop;
  }

  function upgrade(key) {
    // [UPDATE 2026-07-15] 공격력 강화 버튼을 한 번이라도 클릭하면(성공 여부 무관) 온보딩 펄스 안내를 영구히 끔
    if (key === 'atk' && !saveData._atkGuideDismissed) {
      saveData._atkGuideDismissed = true;
      Save.save(saveData);
    }
    const upLv = (saveData.statUpgrades?.[key] || 0);
    const cost = upgradeCost(upLv);
    if ((saveData.gold || 0) < cost) { _rerender(); return; }
    saveData.gold -= cost;
    if (!saveData.statUpgrades) saveData.statUpgrades = {};
    saveData.statUpgrades[key] = upLv + 1;
    Save.save(saveData);
    _rerender();
  }

  // [UPDATE 2026-08-06] x10/x100 일괄강화 — 1개씩 순서대로 사되, 골드가 떨어지면 그 시점에서 멈춤(부분구매 허용).
  // "count개 전부 살 수 있어야만 활성화"로 하면 애매하게 모자랄 때 아예 못 누르게 되어 더 답답해지므로,
  // 살 수 있는 만큼만이라도 사지도록 설계.
  function upgradeBulk(key, count) {
    if (key === 'atk' && !saveData._atkGuideDismissed) {
      saveData._atkGuideDismissed = true;
    }
    if (!saveData.statUpgrades) saveData.statUpgrades = {};
    for (let i = 0; i < count; i++) {
      const upLv = saveData.statUpgrades[key] || 0;
      const cost = upgradeCost(upLv);
      if ((saveData.gold || 0) < cost) break;
      saveData.gold -= cost;
      saveData.statUpgrades[key] = upLv + 1;
    }
    Save.save(saveData);
    _rerender();
  }

  function selectMainWeapon(weaponId, slotIdx) {
    if (!Unlock.getUnlocked(saveData).has('mainWeaponSwitch')) return;
    if (!MAIN_WEAPON_DEFS[weaponId]) return;
    const owned = saveData.unlockedWeapons || ['talisman'];
    if (!owned.includes(weaponId)) return;
    const si = slotIdx || 0;
    if (!saveData.selectedMainWeapons) saveData.selectedMainWeapons = [saveData.selectedMainWeapon||'talisman'];
    saveData.selectedMainWeapons[si] = weaponId;
    if (si === 0) saveData.selectedMainWeapon = weaponId; // 하위 호환
    checkTrinityToast(saveData); // [UPDATE 2026-07-13] 삼위일체 발동 토스트
    Save.save(saveData);
    _rerender();
  }

  function sinmokTaegeukCost(lv) { return (lv + 1) * 200; } // lv0→1: 200개, lv1→2: 400개 ...

  function sinmokUpgrade(key) {
    const lv = (saveData.sinmokUpgrades?.[key] || 0);
    const maxLv = CONFIG.SINMOK.MAX_LV[key] || 5;
    if (lv >= maxLv) return;
    const cost = Math.floor(CONFIG.SINMOK.BASE_COST * Math.pow(CONFIG.SINMOK.COST_MULT, lv));
    const tCost = sinmokTaegeukCost(lv);
    if ((saveData.gold || 0) < cost) return;
    if ((saveData.taegeukseok || 0) < tCost) return;
    saveData.gold -= cost;
    saveData.taegeukseok = (saveData.taegeukseok || 0) - tCost;
    if (!saveData.sinmokUpgrades) saveData.sinmokUpgrades = {};
    saveData.sinmokUpgrades[key] = lv + 1;
    Save.save(saveData);
    _rerender();
  }

  // [UPDATE 2026-07-06] 명부 강화 (시즌2, 영혼석 소모)
  function sinmokS2Upgrade(key) {
    if (!saveData.season1Clear) return;
    const cfg = CONFIG.SINMOK_S2;
    const lv = (saveData.sinmokS2?.[key] || 0);
    const maxLv = cfg.MAX_LV[key] || 100;
    if (lv >= maxLv) return;
    const cost = cfg.BASE_COST + Math.floor(lv / cfg.COST_STEP);
    if ((saveData.soulStones || 0) < cost) return;
    saveData.soulStones = (saveData.soulStones || 0) - cost;
    if (!saveData.sinmokS2) saveData.sinmokS2 = {};
    saveData.sinmokS2[key] = lv + 1;
    Save.save(saveData);
    _rerender();
  }

  // [UPDATE 2026-07-17] 명(命) 강화 (시즌4, 순리석) — 단일 트랙 0~10
  function myeongUpgrade() {
    if (!saveData.season3Clear || !isSeasonReleased(4)) return;
    const cfg = CONFIG.MYEONG;
    const lv = saveData.myeongLv || 0;
    if (lv >= cfg.MAX_LV) return;
    const cost = Math.floor(cfg.BASE_COST * Math.pow(cfg.COST_MULT, lv));
    if ((saveData.sullriseok || 0) < cost) return;
    saveData.sullriseok -= cost;
    saveData.myeongLv = lv + 1;
    Save.save(saveData);
    _rerender();
  }

  // [UPDATE 2026-07-22] 선술 스킬트리 전면 재설계 — 뿌리(1층/2층)→줄기(음/양)→가지(하위분기)→준필살기→필살기
  // [UPDATE 2026-07-23] 3강은 "다음 층이 열리는 기준"일 뿐 실제 상한(10강)은 아님 — 게이트 체크 전용 함수로 분리
  // [UPDATE 2026-07-23] 사용자 확인: "아무 노드 하나만 3강이면 다음 층 열림" (전부 다 X, 1개만 O)
  function _seonsulRootGateReady(layerObj, layerCfg) {
    return Object.keys(layerCfg).some(k => ((layerObj||{})[k] || 0) >= CONFIG.SEONSUL.ROOT_GATE_LV);
  }

  // [UPDATE 2026-07-23] 나무 여러 그루(trees[]) 지원 — 세이브 구조 헬퍼
  function _seonsulS5() {
    if (!saveData.sinmokS5) saveData.sinmokS5 = {};
    const s5 = saveData.sinmokS5;
    if (!s5.root1) s5.root1 = {};
    if (!s5.root2) s5.root2 = {};
    if (!Array.isArray(s5.trees)) {
      // 구버전 단일 path/branch 세이브 마이그레이션. subUnlocked/finalUnlocked(구 바이너리)는 subLv/finalLv(신 레벨제) 만렙으로 변환.
      s5.trees = (s5.path && s5.branch)
        ? [{ path:s5.path, branch:s5.branch, passiveLv:s5.passiveLv||0,
             subLv: s5.subUnlocked ? CONFIG.SEONSUL.ABILITY_MAX_LV : 0,
             finalLv: s5.finalUnlocked ? CONFIG.SEONSUL.ABILITY_MAX_LV : 0 }]
        : [];
    }
    return s5;
  }
  // 현재 조작 대상 나무의 인덱스 — 마지막 나무가 필살기까지 만렙 찍었고 자리가 남아있으면 다음 슬롯(새 나무)을 가리킴
  function _seonsulActiveIdx(s5) {
    const trees = s5.trees;
    if (!trees.length) return 0;
    const last = trees[trees.length - 1];
    const lastComplete = (last.finalLv || 0) >= CONFIG.SEONSUL.ABILITY_MAX_LV;
    return (lastComplete && trees.length < CONFIG.SEONSUL.MAX_TREES) ? trees.length : trees.length - 1;
  }
  function _seonsulHasProgress(s5) {
    const anyLv = (obj) => obj && Object.values(obj).some(v => (v||0) > 0);
    return anyLv(s5.root1) || anyLv(s5.root2) || (s5.trees && s5.trees.length > 0);
  }

  // ── 확인(Y/N) 팝업 공용 로직 ──
  function _seonsulRequest(kind, label, desc, cost, args) {
    _seonsulPending = { kind, label, desc, cost: cost||0, args: args||{} };
    _rerender();
  }
  function seonsulConfirmNo() { _seonsulPending = null; _rerender(); }
  function seonsulConfirmYes() {
    const p = _seonsulPending;
    if (!p) return;
    _seonsulPending = null;
    if (p.cost > 0 && (saveData.sullgiseok || 0) < p.cost) { _rerender(); return; }
    switch (p.kind) {
      case 'path':   _seonsulDoChoosePath(p.args.path); break;
      case 'newTreePath': _seonsulDoChooseNewTreePath(p.args.path, p.args.synergy); break;
    }
    _rerender();
  }

  // [UPDATE 2026-07-24] 음/양(첫 나무)·세컨 트리 선택 외에는 Y/N 확인 없이 클릭 즉시 반영
  function seonsulRequestRoot(layer, key) {
    if (!saveData.season4Clear || !isSeasonReleased(5)) return;
    const cfg = CONFIG.SEONSUL;
    if (layer === 2 && !_seonsulRootGateReady(_seonsulS5().root1, cfg.ROOT1)) return;
    _seonsulDoUpgradeRoot(layer, key);
    _rerender();
  }
  function seonsulRequestPath(path) {
    if (!saveData.season4Clear || !isSeasonReleased(5)) return;
    if (path !== 'yang' && path !== 'yin') return;
    const cfg = CONFIG.SEONSUL;
    const s5 = _seonsulS5();
    const idx = _seonsulActiveIdx(s5);
    if (s5.trees[idx]) return;
    const isEn = Lang.getCurrent() === 'en';
    const p = cfg.PATHS[path];
    if (idx === 0) {
      if (!_seonsulRootGateReady(s5.root2, cfg.ROOT2)) return;
      _seonsulRequest('path', isEn?p.labelEn:p.labelKo, isEn?p.descEn:p.descKo, 0, { path });
    } else {
      if (idx >= cfg.MAX_TREES) return;
      const firstPath = s5.trees[0].path;
      const synergy = (path === firstPath) ? 'extreme' : 'harmony';
      const syn = cfg.SYNERGY[synergy];
      _seonsulRequest('newTreePath', isEn?syn.labelEn:syn.labelKo,
        `${isEn?p.labelEn:p.labelKo} — ${isEn?syn.descEn:syn.descKo}`, 0, { path, synergy });
    }
  }
  function seonsulRequestBranch(branch) {
    if (!saveData.season4Clear || !isSeasonReleased(5)) return;
    _seonsulDoChooseBranch(branch);
    _rerender();
  }
  function seonsulRequestPassive() {
    if (!saveData.season4Clear || !isSeasonReleased(5)) return;
    _seonsulDoUpgradePassive();
    _rerender();
  }
  // [UPDATE 2026-07-23] 준필살기/필살기 레벨제 재설계 — 패시브가 ABILITY_GATE_PASSIVE_LV(5) 이상이면
  // 준필살기를 1~ABILITY_MAX_LV(5)강까지 올릴 수 있고, 준필살기가 만렙이면 필살기도 1~5강까지 올릴 수 있음.
  // 레벨마다 쿨타임 감소·범위/데미지 증가(CONFIG.seonsulAbilityAtLv로 계산).
  function seonsulRequestSub() {
    if (!saveData.season4Clear || !isSeasonReleased(5)) return;
    _seonsulDoUnlockSub();
    _rerender();
  }
  function seonsulRequestFinal() {
    if (!saveData.season4Clear || !isSeasonReleased(5)) return;
    _seonsulDoUnlockFinal();
    _rerender();
  }

  // ── 실제 반영 함수 (Y 눌렀을 때만 호출) ──
  function _seonsulDoUpgradeRoot(layer, key) {
    const cfg = CONFIG.SEONSUL;
    const s5 = _seonsulS5();
    const target = layer === 1 ? s5.root1 : s5.root2;
    const lv = target[key] || 0;
    if (lv >= cfg.ROOT_MAX_LV) return;
    const cost = cfg.ROOT_BASE_COST + lv * cfg.ROOT_COST_STEP;
    if ((saveData.sullgiseok || 0) < cost) return;
    saveData.sullgiseok -= cost;
    target[key] = lv + 1;
    Save.save(saveData);
  }
  function _seonsulDoChoosePath(path) {
    const s5 = _seonsulS5();
    const idx = _seonsulActiveIdx(s5);
    if (idx !== 0 || s5.trees[idx]) return;
    s5.trees[idx] = { path, branch:null, passiveLv:0, subLv:0, finalLv:0 };
    Save.save(saveData);
  }
  function _seonsulDoChooseNewTreePath(path, synergy) {
    const cfg = CONFIG.SEONSUL;
    const s5 = _seonsulS5();
    const idx = _seonsulActiveIdx(s5);
    if (idx === 0 || s5.trees[idx] || idx >= cfg.MAX_TREES) return;
    s5.trees[idx] = { path, branch:null, passiveLv:0, subLv:0, finalLv:0 };
    if (idx === 1) s5.synergy = synergy; // 시너지는 두 번째 나무 확정 시 1회만 저장
    Save.save(saveData);
  }
  function _seonsulDoChooseBranch(branch) {
    const s5 = _seonsulS5();
    const t = s5.trees[_seonsulActiveIdx(s5)];
    if (!t || t.branch) return;
    if (s5.trees.some(tt => tt.branch === branch)) return;
    t.branch = branch;
    Save.save(saveData);
  }
  function _seonsulDoUpgradePassive() {
    const cfg = CONFIG.SEONSUL;
    const s5 = _seonsulS5();
    const t = s5.trees[_seonsulActiveIdx(s5)];
    if (!t || !t.branch) return;
    const lv = t.passiveLv || 0;
    if (lv >= cfg.MAX_LV) return;
    const cost = cfg.BASE_COST + Math.floor(lv / cfg.COST_STEP);
    if ((saveData.sullgiseok || 0) < cost) return;
    saveData.sullgiseok -= cost;
    t.passiveLv = lv + 1;
    Save.save(saveData);
  }
  function _seonsulDoUnlockSub() {
    const cfg = CONFIG.SEONSUL;
    const s5 = _seonsulS5();
    const t = s5.trees[_seonsulActiveIdx(s5)];
    if (!t || !t.branch) return;
    if ((t.passiveLv || 0) < cfg.ABILITY_GATE_PASSIVE_LV) return;
    const lv = t.subLv || 0;
    if (lv >= cfg.ABILITY_MAX_LV) return;
    const cost = cfg.SUB_BASE_COST + lv * cfg.SUB_COST_STEP;
    if ((saveData.sullgiseok || 0) < cost) return;
    saveData.sullgiseok -= cost;
    t.subLv = lv + 1;
    Save.save(saveData);
  }
  function _seonsulDoUnlockFinal() {
    const cfg = CONFIG.SEONSUL;
    const s5 = _seonsulS5();
    const t = s5.trees[_seonsulActiveIdx(s5)];
    if (!t || (t.subLv || 0) < cfg.ABILITY_MAX_LV) return;
    const lv = t.finalLv || 0;
    if (lv >= cfg.ABILITY_MAX_LV) return;
    const cost = cfg.FINAL_BASE_COST + lv * cfg.FINAL_COST_STEP;
    if ((saveData.sullgiseok || 0) < cost) return;
    saveData.sullgiseok -= cost;
    t.finalLv = lv + 1;
    Save.save(saveData);
  }

  // [UPDATE 2026-07-24] 선술 초기화 시 투자한 선기석 전액 환불. 2단계 확인.
  function _seonsulTotalRefund(s5) {
    const cfg = CONFIG.SEONSUL;
    let total = 0;
    for (const key in (s5.root1 || {})) {
      const lv = s5.root1[key] || 0;
      for (let i = 0; i < lv; i++) total += cfg.ROOT_BASE_COST + i * cfg.ROOT_COST_STEP;
    }
    for (const key in (s5.root2 || {})) {
      const lv = s5.root2[key] || 0;
      for (let i = 0; i < lv; i++) total += cfg.ROOT_BASE_COST + i * cfg.ROOT_COST_STEP;
    }
    for (const t of (s5.trees || [])) {
      const pLv = t.passiveLv || 0;
      for (let i = 0; i < pLv; i++) total += cfg.BASE_COST + Math.floor(i / cfg.COST_STEP);
      const sLv = t.subLv || 0;
      for (let i = 0; i < sLv; i++) total += cfg.SUB_BASE_COST + i * cfg.SUB_COST_STEP;
      const fLv = t.finalLv || 0;
      for (let i = 0; i < fLv; i++) total += cfg.FINAL_BASE_COST + i * cfg.FINAL_COST_STEP;
    }
    return total;
  }
  function seonsulResetRequest() { _seonsulResetConfirm = true; _rerender(); }
  function seonsulResetCancel()  { _seonsulResetConfirm = false; _rerender(); }
  function seonsulReset() {
    if (!_seonsulResetConfirm) return;
    const s5 = _seonsulS5();
    const refund = _seonsulTotalRefund(s5);
    saveData.sullgiseok = (saveData.sullgiseok || 0) + refund;
    saveData.sinmokS5 = {};
    _seonsulResetConfirm = false;
    Save.save(saveData);
    _rerender();
  }

  function openSeonsulPopup()  { _seonsulOpen = true; _seonsulResetConfirm = false; _seonsulPending = null; _rerender(); }
  function closeSeonsulPopup() { _seonsulOpen = false; _seonsulResetConfirm = false; _seonsulPending = null; _rerender(); }

  function _seonsulPopupHTML() {
    const isEn = Lang.getCurrent() === 'en';
    const _unlocked = !!saveData.season4Clear && isSeasonReleased(5);
    const cfg = CONFIG.SEONSUL;
    const s5 = _seonsulS5();
    const gi = saveData.sullgiseok || 0;
    const root1 = s5.root1 || {}, root2 = s5.root2 || {};
    const root1Done = _seonsulRootGateReady(root1, cfg.ROOT1);
    const root2Done = _seonsulRootGateReady(root2, cfg.ROOT2);
    const trees = s5.trees;
    const activeIdx = _seonsulActiveIdx(s5);
    const activeTree = trees[activeIdx] || null;
    const canStartNewTree = trees.length > 0 && (trees[trees.length-1].finalLv||0) >= cfg.ABILITY_MAX_LV && trees.length < cfg.MAX_TREES;

    // [UPDATE 2026-07-22] 나무 그림 위에 직접 배치하는 알약형 버튼 — 이름만 표시, 상태별 색상(잠김/가능/선택·완료)
    const _pill = (x, y, label, color, state, onclick, w) => {
      const clickable = state === 'available' || state === 'selectable';
      const bg = state === 'locked' ? 'rgba(30,30,35,0.55)'
        : state === 'selected' || state === 'maxed' ? color
        : state === 'available' ? 'rgba(20,20,25,0.72)'
        : 'rgba(30,30,35,0.4)';
      const border = state === 'locked' ? 'rgba(255,255,255,0.08)'
        : state === 'selected' || state === 'maxed' ? color
        : color;
      const textColor = state === 'selected' || state === 'maxed' ? '#0a0a0a' : state === 'locked' ? '#666' : '#f0f0f0';
      return `<div onclick="${clickable ? onclick : ''}" style="
        position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);
        width:${w||58}px;padding:4px 3px;border-radius:14px;text-align:center;
        cursor:${clickable?'pointer':'default'};z-index:2;
        background:${bg};border:1.5px solid ${border};
        box-shadow:${state==='selected'||state==='maxed'?`0 0 8px ${color}`:'0 1px 3px rgba(0,0,0,0.6)'};
        font-size:9px;line-height:1.2;color:${textColor};font-weight:${state==='selected'||state==='maxed'?700:500};
        opacity:${state==='locked'?0.55:1};">${label}</div>`;
    };

    // ── 뿌리 8노드 좌표 (1층 하단, 2층 그 위) ──
    const rootPillsHTML = () => {
      const R1 = [['root_atk',22,90],['root_def',40,86],['root_hp',60,86],['root_mov',78,90]];
      const R2 = [['root_crit',22,74],['root_eva',40,70],['root_cd',60,70],['root_magnet',78,74]];
      const renderNode = (layer, key, x, y) => {
        const node = cfg[layer===1?'ROOT1':'ROOT2'][key];
        const target = layer === 1 ? root1 : root2;
        const locked = layer === 2 && !root1Done;
        const lv = Math.min(target[key] || 0, cfg.ROOT_MAX_LV);
        const maxed = lv >= cfg.ROOT_MAX_LV;
        const state = locked ? 'locked' : maxed ? 'maxed' : 'available';
        const label = `${isEn?node.nameEn:node.nameKo}<br>${lv}/${cfg.ROOT_MAX_LV}`;
        return _pill(x, y, label, '#78c8d0', state, `PlayerScene.seonsulRequestRoot(${layer},'${key}')`, 62);
      };
      return R1.map(([k,x,y]) => renderNode(1,k,x,y)).join('') + R2.map(([k,x,y]) => renderNode(2,k,x,y)).join('');
    };

    // ── 줄기(음/양) — 현재 조작 대상 나무 슬롯 기준 ──
    const trunkPillsHTML = () => {
      return ['yang','yin'].map(pKey => {
        const p = cfg.PATHS[pKey];
        let state;
        if (activeTree) state = activeTree.path === pKey ? 'selected' : 'locked';
        else if (!root2Done) state = 'locked';
        else if (activeIdx === 0 || canStartNewTree) state = 'available';
        else state = 'locked';
        const x = pKey === 'yang' ? 32 : 68;
        return _pill(x, 55, `${pKey==='yang'?'☀️':'🌙'} ${isEn?p.labelEn:p.labelKo}`, p.color, state, `PlayerScene.seonsulRequestPath('${pKey}')`, 66);
      }).join('');
    };

    // ── 가지(하위분기) 4개 — 이미 다른 나무가 쓴 가지는 잠금(이름은 계속 보임) ──
    const branchPillsHTML = () => {
      const positions = { quick:[16,38], fire:[38,33], bind:[62,33], ward:[84,38] };
      const usedBranches = new Set(trees.map(t => t.branch).filter(Boolean));
      const out = [];
      for (const pKey of ['yang','yin']) {
        for (const bKey of Object.keys(cfg.PATHS[pKey].BRANCHES)) {
          const b = cfg.PATHS[pKey].BRANCHES[bKey];
          const isActiveChosen = activeTree && activeTree.branch === bKey;
          const usedElsewhere = usedBranches.has(bKey) && !isActiveChosen;
          const selectable = activeTree && activeTree.path === pKey && !activeTree.branch && !usedElsewhere;
          const state = isActiveChosen ? 'selected' : usedElsewhere ? 'locked' : selectable ? 'available' : 'locked';
          const [x,y] = positions[bKey];
          out.push(_pill(x, y, isEn?b.labelEn:b.labelKo, b.color, state, `PlayerScene.seonsulRequestBranch('${bKey}')`, 60));
        }
      }
      return out.join('');
    };

    // ── 가지 안 패시브/준필살기/필살기 — 존재하는 모든 나무(진행중+완료)를 각자 위치에 렌더 ──
    const abilityPillsHTML = () => {
      const positions = { quick:16, fire:38, bind:62, ward:84 };
      let out = '';
      for (const t of trees) {
        if (!t.branch) continue;
        const isActiveSlot = (t === activeTree);
        const b = cfg.PATHS[t.path].BRANCHES[t.branch];
        const x = positions[t.branch];
        // [UPDATE 2026-07-23] 준필살기/필살기도 레벨제(1~ABILITY_MAX_LV) — 패시브는 10강까지, 게이트는 5강
        const pLv = Math.min(t.passiveLv || 0, cfg.MAX_LV);
        const pMaxed = pLv >= cfg.MAX_LV;
        const pGateReady = pLv >= cfg.ABILITY_GATE_PASSIVE_LV;
        const subLv = Math.min(t.subLv || 0, cfg.ABILITY_MAX_LV);
        const subMaxed = subLv >= cfg.ABILITY_MAX_LV;
        const finalLv = Math.min(t.finalLv || 0, cfg.ABILITY_MAX_LV);
        const finalMaxed = finalLv >= cfg.ABILITY_MAX_LV;
        const passiveState = pMaxed ? 'maxed' : isActiveSlot ? 'available' : 'locked';
        // [UPDATE 2026-07-24] lv>0이면 무조건 'selected'(클릭 불가)로 빠져서 1강 찍고 더 못 올리던 버그 수정 —
        // 활성 슬롯이고 게이트 조건 충족이면 만렙 전까지는 계속 'available' 유지
        const subState = subMaxed ? 'maxed' : (isActiveSlot && pGateReady) ? 'available' : subLv > 0 ? 'selected' : 'locked';
        const finalState = finalMaxed ? 'maxed' : (isActiveSlot && subMaxed) ? 'available' : finalLv > 0 ? 'selected' : 'locked';
        out += _pill(x, 22, `${b.passive.icon} ${isEn?b.passive.nameEn:b.passive.nameKo}<br>${pLv}/${cfg.MAX_LV}`, b.color, passiveState, isActiveSlot?`PlayerScene.seonsulRequestPassive()`:'', 66);
        out += _pill(x, 13, `${b.sub.icon} ${isEn?b.sub.nameEn:b.sub.nameKo}<br>${subLv}/${cfg.ABILITY_MAX_LV}`, b.color, subState, isActiveSlot?`PlayerScene.seonsulRequestSub()`:'', 66);
        out += _pill(x, 5, `⭐${b.final.icon} ${isEn?b.final.nameEn:b.final.nameKo}<br>${finalLv}/${cfg.ABILITY_MAX_LV}`, '#ffd090', finalState, isActiveSlot?`PlayerScene.seonsulRequestFinal()`:'', 66);
      }
      return out;
    };

    // ── 선택된 노드 상세설명 (그림 아래 고정 안내창) ──
    const _detailHTML = () => {
      if (!activeTree) {
        if (canStartNewTree || activeIdx === 0) return `<div style="text-align:center;font-size:10px;color:#a0c8d0;padding:6px 0;">
          ${trees.length ? (isEn?'⭐ A new tree is ready — choose Yin or Yang above!':'⭐ 새로운 나무를 시작할 수 있습니다 — 위에서 음/양을 선택하세요!') : (isEn?'Tap a pill to invest Seongi Stones.':'알약 버튼을 눌러 선기석을 투자하세요.')}
        </div>`;
        return `<div style="text-align:center;font-size:10px;color:#665;padding:6px 0;">${isEn?'All tree slots are complete.':'모든 나무를 다 완성했습니다.'}</div>`;
      }
      if (!activeTree.branch) return `<div style="text-align:center;font-size:10px;color:#a0c8d0;padding:6px 0;">${isEn?'Choose a branch to continue.':'가지를 선택해 계속하세요.'}</div>`;
      const b = cfg.PATHS[activeTree.path].BRANCHES[activeTree.branch];
      // [UPDATE 2026-07-24] 아직 투자 안 한(레벨 0) 단계는 자물쇠+(비활성) 표시로 구분 — 이미 활성화된 것처럼 보이던 혼란 해소
      const _tier = (unlocked, color, icon, name, desc) => unlocked
        ? `<b style="color:${color};">${icon}${name}</b>: ${desc}`
        : `<span style="opacity:0.45;">🔒 <b style="color:${color};">${icon}${name}</b> (${isEn?'inactive':'비활성'}): ${desc}</span>`;
      return `<div style="font-size:10px;color:#c8e8e0;text-align:center;padding:6px 4px;line-height:1.6;">
        ${_tier((activeTree.passiveLv||0)>0, b.color, '', isEn?b.passive.nameEn:b.passive.nameKo, isEn?b.passive.descEn:b.passive.descKo)}<br>
        ${_tier((activeTree.subLv||0)>0, b.color, '', isEn?b.sub.nameEn:b.sub.nameKo, isEn?b.sub.descEn:b.sub.descKo)}<br>
        ${_tier((activeTree.finalLv||0)>0, '#ffd090', '⭐', isEn?b.final.nameEn:b.final.nameKo, isEn?b.final.descEn:b.final.descKo)}
      </div>`;
    };

    // ── 확인(Y/N) 팝업 ──
    const _confirmHTML = () => {
      if (!_seonsulPending) return '';
      const p = _seonsulPending;
      const affordable = p.cost === 0 || gi >= p.cost;
      return `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.78);z-index:20;
        display:flex;align-items:center;justify-content:center;padding:16px;">
        <div style="background:rgba(10,16,20,0.98);border:1.5px solid rgba(120,200,208,0.5);border-radius:12px;padding:16px;max-width:260px;text-align:center;">
          <div style="font-size:13px;color:#a0d8e0;font-weight:700;margin-bottom:8px;">${p.label}</div>
          <div style="font-size:11px;color:#c8e8e0;line-height:1.5;margin-bottom:10px;">${p.desc}</div>
          ${p.cost>0 ? `<div style="font-size:11px;color:${affordable?'#f0d060':'#e89090'};margin-bottom:10px;">🔷 ${p.cost}${!affordable?(isEn?' (Not enough)':' (선기석 부족)'):''}</div>` : ''}
          <div style="display:flex;gap:8px;">
            <button onclick="PlayerScene.seonsulConfirmYes()" ${!affordable?'disabled':''} style="
              flex:1;padding:8px;border-radius:8px;font-size:12px;font-family:inherit;cursor:${affordable?'pointer':'not-allowed'};
              background:${affordable?'rgba(88,152,168,0.35)':'rgba(60,60,60,0.2)'};border:1px solid ${affordable?'rgba(120,200,208,0.6)':'#333'};
              color:${affordable?'#fff':'#555'};">${isEn?'Yes':'예'}</button>
            <button onclick="PlayerScene.seonsulConfirmNo()" style="
              flex:1;padding:8px;border-radius:8px;font-size:12px;font-family:inherit;cursor:pointer;
              background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:#aaa;">${isEn?'No':'아니오'}</button>
          </div>
        </div>
      </div>`;
    };

    // [UPDATE 2026-07-22] 음양 나무 아트 위에 알약형 버튼을 실제 좌표로 배치 — aspect-ratio 고정 박스라야
    // 화면 폭이 달라져도 %좌표가 그림이랑 어긋나지 않음(625:1302 원본 비율 그대로 유지)
    const _treeBgSrc = SPRITES?.ui?.seonsulTreeBg?.src || '';
    return `<div style="position:absolute;inset:0;background:rgba(0,0,10,0.82);z-index:50;
      display:flex;align-items:center;justify-content:center;padding:16px;" onclick="if(event.target===this)PlayerScene.closeSeonsulPopup()">
      <div style="position:relative;width:100%;max-height:90%;overflow-y:auto;background:rgba(6,14,18,0.98);
        border:1.5px solid rgba(88,152,168,0.5);border-radius:16px;padding:12px;
        box-shadow:0 0 30px rgba(88,152,168,0.2);" class="scroll-pan-y">
        ${_confirmHTML()}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <div style="font-size:14px;color:#78c8d0;font-weight:700;">${isEn?'☁️ Celestial Arts':'☁️ 선술 스킬트리'}</div>
          <button onclick="PlayerScene.closeSeonsulPopup()" style="background:none;border:none;color:#8a7a6a;font-size:18px;cursor:pointer;">✕</button>
        </div>
        ${!_unlocked ? `<div style="text-align:center;font-size:11px;color:#555;padding:20px 0;">
            🔒 ${isEn?'Unlock after clearing Season 4':'시즌4 클리어 후 해금'}
          </div>` : `
          <div style="font-size:10px;color:#5898a8;text-align:center;margin-bottom:8px;">
            🔷 ${Format.num(gi)} ${s5.synergy ? `· ✨ ${isEn?cfg.SYNERGY[s5.synergy].labelEn:cfg.SYNERGY[s5.synergy].labelKo}` : ''}
          </div>
          <div style="position:relative;width:100%;aspect-ratio:625/1302;border-radius:10px;overflow:hidden;
            ${_treeBgSrc ? `background-image:url('${_treeBgSrc}');background-size:100% 100%;` : `background:#0a1418;`}">
            ${rootPillsHTML()}
            ${trunkPillsHTML()}
            ${branchPillsHTML()}
            ${abilityPillsHTML()}
          </div>
          ${_detailHTML()}
          ${_seonsulHasProgress(s5) ? `<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:8px;text-align:center;">
            ${!_seonsulResetConfirm ? `
              <button onclick="PlayerScene.seonsulResetRequest()" style="
                padding:6px 14px;border-radius:8px;font-size:11px;font-family:inherit;cursor:pointer;
                background:rgba(200,80,80,0.1);border:1px solid rgba(220,100,100,0.35);color:#e89090;">
                ${isEn?'↺ Reset Everything':'↺ 선술 전체 초기화'}
              </button>` : `
              <div style="font-size:10px;color:#e89090;margin-bottom:6px;">
                ${isEn?`This clears roots, all trees, and synergy. Seongi Stones spent will be refunded: +${Format.num(_seonsulTotalRefund(s5))}. Are you sure?`:`뿌리·모든 나무·시너지가 전부 초기화됩니다. 투자한 선기석 +${Format.num(_seonsulTotalRefund(s5))} 환불됩니다. 정말 초기화할까요?`}
              </div>
              <button onclick="PlayerScene.seonsulReset()" style="
                padding:6px 14px;border-radius:8px;font-size:11px;font-family:inherit;cursor:pointer;margin-right:6px;
                background:rgba(200,80,80,0.25);border:1px solid rgba(220,100,100,0.6);color:#ffb0b0;">
                ${isEn?'Yes, reset':'예, 초기화'}
              </button>
              <button onclick="PlayerScene.seonsulResetCancel()" style="
                padding:6px 14px;border-radius:8px;font-size:11px;font-family:inherit;cursor:pointer;
                background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);color:#aaa;">
                ${isEn?'Cancel':'취소'}
              </button>`}
          </div>` : ''}
        `}
      </div>
    </div>`;
  }

  // [UPDATE 2026-07-26] 재화 팝업 — 탭하면 획득처가 펼쳐짐 (기존 종합능력치 상세 탭의 클릭-확장 UI 재사용)
  function openCurrencyPopup()  { _currencyOpen = true; _currencyExpandedKey = null; _rerender(); }
  function closeCurrencyPopup() { _currencyOpen = false; _rerender(); }
  function toggleCurrencyDetail(key) { _currencyExpandedKey = (_currencyExpandedKey===key) ? null : key; _rerender(); }
  function _currencyRow(info) {
    const isEn = Lang.getCurrent() === 'en';
    const amount = saveData[info.key] || 0;
    const expanded = _currencyExpandedKey === info.key;
    const iconHTML = info.icon.length > 2 ? _cimg(info.icon, 18) : `<span style="font-size:16px;">${info.icon}</span>`;
    const sources = isEn ? info.sourcesEn : info.sources;
    return `<div style="padding:7px 10px;margin-bottom:5px;
      background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;cursor:pointer;"
      onclick="PlayerScene.toggleCurrencyDetail('${info.key}')">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="flex-shrink:0;">${iconHTML}</div>
        <div style="flex:1;font-size:11px;color:#e8dcc8;">${isEn?info.nameEn:info.name} <span style="font-size:9px;color:#6a5a4a;">${expanded?'▲':'▼'}</span></div>
        <div style="font-size:13px;color:#f0c040;font-weight:700;">${Format.num(amount)}</div>
      </div>
      ${expanded ? `<div style="margin-top:7px;padding-top:7px;border-top:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:10px;color:#a090a0;margin-bottom:4px;">${isEn?'How to obtain:':'획득처:'}</div>
        ${sources.map(s => `<div style="font-size:11px;color:#d8c8b8;padding:2px 0 2px 10px;position:relative;">
          <span style="position:absolute;left:0;">·</span>${s}
        </div>`).join('')}
      </div>` : ''}
    </div>`;
  }
  function _currencyPopupHTML() {
    const isEn = Lang.getCurrent() === 'en';
    return `<div style="position:absolute;inset:0;background:rgba(0,0,10,0.82);z-index:50;
      display:flex;align-items:center;justify-content:center;padding:20px;" onclick="if(event.target===this)PlayerScene.closeCurrencyPopup()">
      <div style="width:100%;max-height:80%;overflow-y:auto;background:rgba(10,8,20,0.98);
        border:1.5px solid rgba(240,192,64,0.5);border-radius:16px;padding:16px;
        box-shadow:0 0 30px rgba(240,192,64,0.2);" class="scroll-pan-y">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:14px;color:#f0c860;font-weight:700;">${isEn?'💰 Currency':'💰 재화'}</div>
          <button onclick="PlayerScene.closeCurrencyPopup()" style="background:none;border:none;color:#8a7a6a;font-size:18px;cursor:pointer;">✕</button>
        </div>
        ${CURRENCY_INFO.map(_currencyRow).join('')}
      </div>
    </div>`;
  }

  // [UPDATE 2026-07-12] 종합 능력치 확인 팝업 — 종합/상세/시너지 3개 탭
  function openStatsPopup()  { _statsOpen = true; _statsTab = 'overview'; _statsExpandedRow = null; _rerender(); }
  function closeStatsPopup() { _statsOpen = false; _rerender(); }
  function setStatsTab(tab)  { _statsTab = tab; _statsExpandedRow = null; _rerender(); }
  // [UPDATE 2026-07-13] 상세 탭 스탯 행 탭 → 브레이크다운을 큰 글씨로 펼쳐서 표시
  function toggleStatDetail(key) { _statsExpandedRow = (_statsExpandedRow===key) ? null : key; _rerender(); }

  // [UPDATE 2026-07-14] 260714_MTOPC.md 5번: 해금 도감 팝업
  let _codexNewIds = new Set();
  function openCodexPopup() {
    const seen = new Set(saveData._codexSeen || []);
    _codexNewIds = new Set(CODEX_ITEMS.filter(it => Unlock.cleared(saveData, it.stageId) && !seen.has(it.stageId)).map(it=>it.stageId));
    _codexOpen = true;
    _rerender();
    // 반짝임은 이번 오픈에만 — seen 목록을 갱신해두면 다음에 열 때는 더 이상 NEW로 안 뜸
    saveData._codexSeen = CODEX_ITEMS.filter(it => Unlock.cleared(saveData, it.stageId)).map(it=>it.stageId);
    Save.save(saveData);
  }
  function closeCodexPopup() { _codexOpen = false; _rerender(); }
  function _codexItemRow(item) {
    const isEn = Lang.getCurrent()==='en';
    const unlocked = Unlock.cleared(saveData, item.stageId);
    if (!unlocked) {
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:6px;
        background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:8px;opacity:0.55;">
        <div style="font-size:18px;filter:grayscale(1);">❔</div>
        <div style="flex:1;font-size:11px;color:#4a4038;">???</div>
      </div>`;
    }
    const isNew = _codexNewIds.has(item.stageId);
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:6px;
      background:rgba(255,255,255,0.03);border:1px solid ${isNew?'rgba(255,224,112,0.7)':'rgba(255,255,255,0.07)'};border-radius:8px;
      ${isNew?'animation:codexNewGlow 1.2s ease-in-out 3;':''}">
      <div style="font-size:18px;">${item.icon}</div>
      <div style="flex:1;">
        <div style="font-size:12px;color:#e8dcc8;font-weight:600;">${isEn?item.en:item.ko}${isNew?` <span style="color:#ffe070;font-size:9px;">NEW</span>`:''}</div>
        <div style="font-size:10px;color:#8a7a6a;">${isEn?item.descEn:item.descKo}</div>
      </div>
    </div>`;
  }
  function _codexPopupHTML() {
    const isEn = Lang.getCurrent()==='en';
    const unlockedCount = CODEX_ITEMS.filter(it=>Unlock.cleared(saveData,it.stageId)).length;
    return `<div style="position:absolute;inset:0;background:rgba(0,0,10,0.82);z-index:50;
      display:flex;align-items:center;justify-content:center;padding:20px;" onclick="if(event.target===this)PlayerScene.closeCodexPopup()">
      <div style="width:100%;max-height:80%;overflow-y:auto;background:rgba(10,8,20,0.98);
        border:1.5px solid rgba(220,180,100,0.5);border-radius:16px;padding:16px;
        box-shadow:0 0 30px rgba(220,180,100,0.2);" class="scroll-pan-y">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:14px;color:#e8c890;font-weight:700;">${isEn?`📖 Unlock Codex (${unlockedCount}/${CODEX_ITEMS.length})`:`📖 해금 도감 (${unlockedCount}/${CODEX_ITEMS.length})`}</div>
          <button onclick="PlayerScene.closeCodexPopup()" style="background:none;border:none;color:#8a7a6a;font-size:18px;cursor:pointer;">✕</button>
        </div>
        ${CODEX_ITEMS.map(_codexItemRow).join('')}
      </div>
    </div>`;
  }

  // [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑥: 덱(무기셋) 저장/불러오기 — 5슬롯, 현재 편성(주무기/동료/펫)을 스냅샷으로 저장
  const DECK_SLOT_COUNT = 5;
  function openDeckPopup()  { _deckOpen = true; _rerender(); }
  function closeDeckPopup() { _deckOpen = false; _rerender(); }

  function saveDeck(slot) {
    if (!saveData.decks) saveData.decks = [];
    saveData.decks[slot] = {
      mainWeapons: [...(saveData.selectedMainWeapons || [])],
      companions:  [...(saveData.activeCompanions || [])],
      pets:        [...(saveData.activePets || [])],
    };
    Save.save(saveData);
    _rerender();
  }

  function loadDeck(slot) {
    const deck = (saveData.decks || [])[slot];
    if (!deck) return;
    const ownedWpns = saveData.unlockedWeapons || ['talisman'];
    const ownedComps = saveData.companions || [];
    const ownedPets = saveData.pets || [];
    saveData.selectedMainWeapons = deck.mainWeapons.filter(id => id && ownedWpns.includes(id));
    saveData.activeCompanions = deck.companions.filter(id => id && ownedComps.includes(id));
    saveData.activePets = deck.pets.filter(id => id && ownedPets.includes(id));
    if (saveData.selectedMainWeapons.length === 0) saveData.selectedMainWeapons = ['talisman'];
    Save.save(saveData);
    _rerender();
  }

  function deleteDeck(slot) {
    if (!saveData.decks) return;
    saveData.decks[slot] = null;
    Save.save(saveData);
    _rerender();
  }

  function _deckSlotSummaryHTML(deck, isEn) {
    if (!deck) return `<div style="font-size:11px;color:#5a5040;">${isEn?'(empty)':'(비어있음)'}</div>`;
    const wIcons = (deck.mainWeapons||[]).filter(Boolean).map(id => {
      const def = MAIN_WEAPON_DEFS[id];
      return def ? (CARD_IMGS[id] ? `<img src="${CARD_IMGS[id]}" style="width:20px;height:20px;object-fit:contain;image-rendering:pixelated;vertical-align:middle;">` : def.icon) : '';
    }).join(' ');
    const cIcons = (deck.companions||[]).filter(Boolean).map(id => {
      const def = GAME_DATA.companions.find(c=>c.id===id);
      return def ? `<span style="font-size:10px;color:${def.color||'#c8b8e8'};">●${isEn?(def.nameEn||def.name):def.name}</span>` : '';
    }).join(' ');
    const pIcons = (deck.pets||[]).filter(Boolean).map(id => {
      const def = GAME_DATA.pets.find(p=>p.id===id);
      return def ? (def.icon||'') : '';
    }).join(' ');
    return `<div style="font-size:11px;color:#c8b8a8;line-height:1.6;">
      <div>${wIcons || '-'}</div>
      <div>${cIcons || '-'}</div>
      <div>${pIcons || '-'}</div>
    </div>`;
  }

  function _deckPopupHTML() {
    const isEn = Lang.getCurrent() === 'en';
    const decks = saveData.decks || [];
    return `<div style="position:absolute;inset:0;background:rgba(0,0,10,0.82);z-index:50;
      display:flex;align-items:center;justify-content:center;padding:20px;" onclick="if(event.target===this)PlayerScene.closeDeckPopup()">
      <div style="width:100%;max-height:80%;overflow-y:auto;background:rgba(10,8,20,0.98);
        border:1.5px solid rgba(140,160,240,0.5);border-radius:16px;padding:16px;
        box-shadow:0 0 30px rgba(140,160,240,0.2);" class="scroll-pan-y">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:14px;color:#a8b8f0;font-weight:700;">${isEn?'🗂️ Loadouts':'🗂️ 무기셋'}</div>
          <button onclick="PlayerScene.closeDeckPopup()" style="background:none;border:none;color:#8a7a6a;font-size:18px;cursor:pointer;">✕</button>
        </div>
        <div style="font-size:10px;color:#7a6a5a;margin-bottom:12px;">
          ${isEn?'Save your current weapon/companion/pet loadout to a slot, and load it back anytime.'
                :'현재 주무기/동료/펫 편성을 슬롯에 저장하고, 언제든 다시 불러올 수 있습니다.'}
        </div>
        ${Array.from({length:DECK_SLOT_COUNT}, (_,i)=>i).map(slot => {
          const deck = decks[slot];
          return `<div style="padding:10px 12px;margin-bottom:8px;border-radius:10px;
            background:rgba(255,255,255,0.03);border:1px solid rgba(140,160,240,0.15);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <div style="font-size:12px;color:#e8dcc8;font-weight:600;">${isEn?'Slot':'슬롯'} ${slot+1}</div>
              <div style="display:flex;gap:6px;">
                <button onclick="PlayerScene.saveDeck(${slot})" style="
                  padding:3px 8px;border-radius:6px;font-size:10px;font-family:inherit;cursor:pointer;
                  background:rgba(80,200,120,0.18);border:1px solid rgba(100,220,140,0.5);color:#90e8a0;">
                  ${isEn?'Save':'저장'}
                </button>
                <button onclick="${deck?`PlayerScene.loadDeck(${slot})`:''}" ${deck?'':'disabled'} style="
                  padding:3px 8px;border-radius:6px;font-size:10px;font-family:inherit;cursor:${deck?'pointer':'not-allowed'};
                  background:${deck?'rgba(120,140,220,0.18)':'rgba(80,80,80,0.1)'};border:1px solid ${deck?'rgba(140,160,240,0.5)':'rgba(255,255,255,0.08)'};
                  color:${deck?'#a8b8f0':'rgba(255,255,255,0.25)'};">
                  ${isEn?'Load':'불러오기'}
                </button>
                <button onclick="${deck?`PlayerScene.deleteDeck(${slot})`:''}" ${deck?'':'disabled'} style="
                  padding:3px 8px;border-radius:6px;font-size:10px;font-family:inherit;cursor:${deck?'pointer':'not-allowed'};
                  background:rgba(200,80,80,0.12);border:1px solid rgba(220,100,100,0.3);color:${deck?'#e89090':'rgba(255,255,255,0.15)'};">
                  ${isEn?'Clear':'삭제'}
                </button>
              </div>
            </div>
            ${_deckSlotSummaryHTML(deck, isEn)}
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  // Player 클래스를 그대로 생성해서 실제 전투 계산식과 100% 동일한 값을 뽑아씀 (공식 중복 방지)
  function _buildPreviewPlayer() {
    return new Player(0, 0, saveData.statUpgrades || {}, saveData.sinmokUpgrades || {}, saveData.sinmokS2 || {}, saveData.myeongLv || 0, saveData.sinmokS5 || {});
  }

  // [UPDATE 2026-07-13] rowKey+breakdownLines(배열)를 넘기면 탭해서 브레이크다운을 큰 글씨로 펼쳐볼 수 있음 (Detail 탭용).
  // rowKey 없이 부르면(Overview 탭) 기존처럼 클릭 불가능한 단순 행.
  function _statRow(icon, label, total, rowKey, breakdownLines) {
    const clickable = !!(rowKey && breakdownLines && breakdownLines.length);
    const expanded = clickable && _statsExpandedRow === rowKey;
    return `<div style="padding:8px 12px;margin-bottom:6px;
      background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;
      ${clickable?'cursor:pointer;':''}"
      ${clickable?`onclick="PlayerScene.toggleStatDetail('${rowKey}')"`:''}>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:16px;flex-shrink:0;">${icon}</div>
        <div style="flex:1;font-size:12px;color:#e8dcc8;">${label}${clickable?` <span style="font-size:10px;color:#6a5a4a;">${expanded?'▲':'▼'}</span>`:''}</div>
        <div style="text-align:right;">
          <div style="font-size:14px;color:#f0c040;font-weight:700;">${total}</div>
        </div>
      </div>
      ${expanded ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1);">
        ${breakdownLines.map(l => `<div style="font-size:13px;color:#d8c8b8;padding:3px 0;">${l}</div>`).join('')}
      </div>` : ''}
    </div>`;
  }

  function _statsOverviewHTML() {
    const isEn = Lang.getCurrent() === 'en';
    const p = _buildPreviewPlayer();
    const rows = [
      ['⚔️', isEn?'ATK':'공격력',         p.totalAtk],
      ['🛡️', isEn?'DEF':'방어력',         p.totalDef],
      ['💨', isEn?'Move Speed':'이동속도', p.totalMov],
      ['⚡', isEn?'Atk Speed':'공격속도',  p.totalSpd],
      ['🌀', isEn?'Evasion':'회피율',      p.totalEva.toFixed(1)+'%'],
      ['🎯', isEn?'Crit Chance':'크리티컬 확률', (p._critChance||0).toFixed(1)+'%'],
      ['💥', isEn?'Crit Mult':'크리티컬 배율',   (p._critMult||0).toFixed(2)+'x'],
      ['☠️', isEn?'Extra DMG':'추가 데미지',     '+'+(p._extraDmgPct||0).toFixed(0)+'%'],
      ['🔮', isEn?'DMG Reflect':'피해 반사',     (p._reflectPct||0).toFixed(1)+'%'],
    ];
    return rows.map(([icon,label,val]) => _statRow(icon,label,val)).join('');
  }

  function _statsDetailHTML() {
    const isEn = Lang.getCurrent() === 'en';
    const upg = saveData.statUpgrades || {};
    const sm  = saveData.sinmokUpgrades || {};
    const sm2 = saveData.sinmokS2 || {};
    const s5  = saveData.sinmokS5 || {}; // [UPDATE 2026-07-22] 선술 스킬트리(시즌5) 브레이크다운 반영
    const upPerLv = CONFIG.STAT_UPGRADE_PER_LEVEL, smPerLv = CONFIG.SINMOK.PER_LV, sm2PerLv = CONFIG.SINMOK_S2.PER_LV;
    // [UPDATE 2026-07-22] 선술 뿌리+가지 재설계 반영 — 스탯별 총합(뿌리1층+뿌리2층+가지패시브)을 합산하는 헬퍼
    const _s5v = (stat) => {
      let total = 0;
      const r1 = s5.root1 || {}, r2 = s5.root2 || {};
      const R1 = CONFIG.SEONSUL.ROOT1, R2 = CONFIG.SEONSUL.ROOT2;
      const rootMap = { atk:'root_atk', def:'root_def', hp:'root_hp', mov:'root_mov' };
      const root2Map = { crit:'root_crit', eva:'root_eva', cd:'root_cd', magnet:'root_magnet' };
      if (rootMap[stat]) total += (r1[rootMap[stat]]||0) * R1[rootMap[stat]].perLv;
      if (root2Map[stat]) total += (r2[root2Map[stat]]||0) * R2[root2Map[stat]].perLv;
      // [UPDATE 2026-07-23] 나무 여러 그루 지원 — trees[] 전부 순회해서 합산 (구버전 단일 path/branch 세이브도 호환)
      const _trees = Array.isArray(s5.trees) ? s5.trees : ((s5.path && s5.branch) ? [{ path:s5.path, branch:s5.branch, passiveLv:s5.passiveLv||0 }] : []);
      for (const t of _trees) {
        if (!t.path || !t.branch) continue;
        const br = CONFIG.SEONSUL.PATHS[t.path].BRANCHES[t.branch];
        const lv = Math.min(t.passiveLv||0, CONFIG.SEONSUL.MAX_LV);
        if (br.passive.perLv[stat]) total += lv * br.passive.perLv[stat];
      }
      if (stat === 'atk' && (s5.synergy === 'harmony' || s5.synergy === 'extreme')) {
        total += CONFIG.SEONSUL.SYNERGY[s5.synergy].atkAdd;
      }
      return total;
    };
    // [UPDATE 2026-07-13] 탭 클릭 시 크게 펼쳐 보여주는 브레이크다운 — 한 줄 문장 대신 소스별 배열로 반환
    const bd = (base, ...parts) => [`${isEn?'Base':'기본'} ${base}`, ...parts.filter(Boolean)];
    // [UPDATE 2026-07-13] 공격력 최종값이 Player.totalAtk(명부 최종데미지% 배율 포함)와 불일치하던 버그 수정 —
    // 브레이크다운에 명부 배율 항목 추가 + 최종값에도 곱해서 종합(Overview) 탭 수치와 일치시킴
    const _atkBase = BASE.atk + (upg.atk||0)*upPerLv.atk + _s5v('atk');
    const _atkExtraDmgPct = (sm2.extraDmg||0)*sm2PerLv.extraDmg;
    const _atkFinal = Math.floor(_atkBase * (1 + _atkExtraDmgPct/100));
    const rows = [
      ['⚔️', isEn?'ATK':'공격력', _atkFinal, 'atk',
        bd(BASE.atk, upg.atk ? `${isEn?'Upgrade':'강화'}+${(upg.atk*upPerLv.atk)}` : '',
          _s5v('atk') ? `${isEn?'Celestial Arts':'선술'}+${_s5v('atk')}` : '',
          sm2.extraDmg ? `${isEn?'Soul Registry':'명부'} ×${(1+_atkExtraDmgPct/100).toFixed(2)}` : '')],
      ['🛡️', isEn?'DEF':'방어력', BASE.def + (upg.def||0)*upPerLv.def + _s5v('def'), 'def',
        bd(BASE.def, upg.def ? `${isEn?'Upgrade':'강화'}+${(upg.def*upPerLv.def)}` : '', _s5v('def')?`${isEn?'Celestial Arts':'선술'}+${_s5v('def')}`:'')],
      ['💨', isEn?'Move Speed':'이동속도', BASE.mov + (upg.mov||0)*upPerLv.mov + (sm.movSpd||0)*smPerLv.movSpd + _s5v('mov'), 'mov',
        bd(BASE.mov, upg.mov?`${isEn?'Upgrade':'강화'}+${upg.mov*upPerLv.mov}`:'', sm.movSpd?`${isEn?'Sacred Tree':'신목'}+${sm.movSpd*smPerLv.movSpd}`:'', _s5v('mov')?`${isEn?'Celestial Arts':'선술'}+${_s5v('mov')}`:'')],
      ['⚡', isEn?'Atk Speed':'공격속도', BASE.spd + (upg.spd||0)*upPerLv.spd + (sm.atkSpd||0)*smPerLv.atkSpd + _s5v('spd'), 'spd',
        bd(BASE.spd, upg.spd?`${isEn?'Upgrade':'강화'}+${upg.spd*upPerLv.spd}`:'', sm.atkSpd?`${isEn?'Sacred Tree':'신목'}+${sm.atkSpd*smPerLv.atkSpd}`:'', _s5v('spd')?`${isEn?'Celestial Arts':'선술'}+${_s5v('spd')}`:'')],
      ['🌀', isEn?'Evasion':'회피율', (BASE.eva + (upg.eva||0)*upPerLv.eva + (sm.evasion||0)*smPerLv.evasion + _s5v('eva')).toFixed(1)+'%', 'eva',
        bd(BASE.eva, upg.eva?`${isEn?'Upgrade':'강화'}+${(upg.eva*upPerLv.eva).toFixed(1)}`:'', sm.evasion?`${isEn?'Sacred Tree':'신목'}+${sm.evasion*smPerLv.evasion}`:'', _s5v('eva')?`${isEn?'Celestial Arts':'선술'}+${_s5v('eva')}`:'')],
      ['🎯', isEn?'Crit Chance':'크리티컬 확률', ((sm.critChance||0)*smPerLv.critChance + _s5v('crit')).toFixed(1)+'%', 'critChance',
        [sm.critChance ? `${isEn?'Sacred Tree':'신목'} ${sm.critChance*smPerLv.critChance}%` : '', _s5v('crit')?`${isEn?'Celestial Arts':'선술'} ${_s5v('crit')}%`:''].filter(Boolean).length
          ? [sm.critChance ? `${isEn?'Sacred Tree':'신목'} ${sm.critChance*smPerLv.critChance}%` : '', _s5v('crit')?`${isEn?'Celestial Arts':'선술'} ${_s5v('crit')}%`:''].filter(Boolean)
          : [isEn?'None':'없음']],
      ['💥', isEn?'Crit Mult':'크리티컬 배율', (CONFIG.SINMOK.CRIT_BASE_MULT + (sm.critMult||0)*smPerLv.critMult).toFixed(2)+'x', 'critMult',
        bd(CONFIG.SINMOK.CRIT_BASE_MULT+'x', sm.critMult?`${isEn?'Sacred Tree':'신목'}+${(sm.critMult*smPerLv.critMult).toFixed(1)}`:'')],
      ['☠️', isEn?'Extra DMG':'추가 데미지', '+'+((sm2.extraDmg||0)*sm2PerLv.extraDmg).toFixed(0)+'%', 'extraDmg',
        [sm2.extraDmg ? `${isEn?'Soul Registry':'명부'} +${(sm2.extraDmg*sm2PerLv.extraDmg).toFixed(0)}%` : (isEn?'None':'없음')]],
      ['🔮', isEn?'DMG Reflect':'피해 반사', ((sm2.reflectDmg||0)*sm2PerLv.reflectDmg).toFixed(1)+'%', 'reflect',
        [sm2.reflectDmg ? `${isEn?'Soul Registry':'명부'} +${(sm2.reflectDmg*sm2PerLv.reflectDmg).toFixed(1)}%` : (isEn?'None':'없음')]],
    ];
    return rows.map(([icon,label,val,key,parts]) => _statRow(icon,label,val,key,parts)).join('');
  }

  // [UPDATE 2026-07-12] WEAPON_SYNERGY_PAIRS/WEAPON_CLASH_PAIRS(weapons.js)를 그대로 참조 — 라벨만 이 화면 전용으로 로컬 정의
  const _SYN_LABELS = {
    'staff_bow':            { ko:'지팡이→신궁: 사거리+15%',       en:'Staff→Bow: Range+15%' },
    'bow_talisman':         { ko:'신궁→부적: 화상 부여',          en:'Bow→Talisman: Burn' },
    'talisman_scythe_main': { ko:'부적→영혼낫: 지속시간+15%',     en:'Talisman→Scythe: Duration+15%' },
    'scythe_main_sword':    { ko:'영혼낫→신검: 처치시 쿨감 스택', en:'Scythe→Sword: CDR Stack on Kill' },
    'sword_staff':          { ko:'신검→지팡이: 크리티컬시 오브 추가', en:'Sword→Staff: Bonus Orb on Crit' },
  };

  function _synListHTML(list, emptyText) {
    return list.length ? list.map(s => `<div style="display:flex;align-items:center;gap:8px;
        padding:7px 10px;margin-bottom:6px;border-radius:8px;
        background:${s.type==='gen'?'rgba(94,194,106,0.1)':'rgba(192,72,72,0.1)'};
        border:1px solid ${s.type==='gen'?'rgba(94,194,106,0.4)':'rgba(192,72,72,0.4)'};">
        <span style="font-size:14px;">${s.type==='gen'?'🟢':'🔴'}</span>
        <span style="font-size:11px;color:#e8dcc8;">${s.text}</span>
      </div>`).join('')
      : `<div style="text-align:center;font-size:11px;color:#6a5a4a;padding:10px;">${emptyText}</div>`;
  }
  function _synSection(title, pentagram, listHTML) {
    return `<div style="margin-bottom:18px;">
      <div style="font-size:11px;color:#c8b8e8;letter-spacing:.05em;margin-bottom:6px;">${title}</div>
      <div style="display:flex;flex-direction:column;align-items:center;">
        ${pentagram}
        <div style="width:100%;margin-top:10px;">${listHTML}</div>
      </div>
    </div>`;
  }

  function _statsSynergyHTML() {
    const isEn = Lang.getCurrent() === 'en';
    const _hasNormal = (saveData.clearedStagesNormal||[]).length > 0;
    const _hasHard   = (saveData.clearedStagesHard||[]).length > 0;
    const _easySlots = (typeof StageSelectScene !== 'undefined') ? StageSelectScene.getEasySlotCount(saveData) : 1;
    const _slotCount = Math.max(_hasHard ? 3 : _hasNormal ? 2 : 1, _easySlots);

    // ── 무기 ──
    const selected = (saveData.selectedMainWeapons || [saveData.selectedMainWeapon||'talisman']).slice(0,_slotCount).filter(Boolean);
    const wEls = selected.map(id => MAIN_WEAPON_DEFS[id]?.element).filter(Boolean);
    const wList = [];
    for (const syn of WEAPON_SYNERGY_PAIRS) {
      if (selected.includes(syn.from) && selected.includes(syn.to)) {
        const lbl = _SYN_LABELS[syn.from+'_'+syn.to];
        if (lbl) wList.push({ type:'gen', text: isEn?lbl.en:lbl.ko });
      }
    }
    let wClashCount = 0;
    for (const [a,b] of WEAPON_CLASH_PAIRS) if (selected.includes(a) && selected.includes(b)) wClashCount++;
    if (wClashCount > 0) {
      wList.push({ type:'clash', text: isEn
        ? `Clash x${wClashCount}: DMG+${8*wClashCount}%/Taken+${5*wClashCount}%`
        : `상극 x${wClashCount}: 공격력+${8*wClashCount}%/피해+${5*wClashCount}%` });
    }
    if (selected.length===3 && wEls.length===3 && _isElementGenerateChain3(wEls)) {
      wList.push({ type:'gen', text: isEn?'3-Chain: CDR+5% (all 3)':'3속성 연쇄: 쿨감+5% (전체)' });
    }

    // ── 동료 ──
    const activeComp = (saveData.activeCompanions||[]).slice(0,_slotCount);
    const cEls = activeComp.map(id => GAME_DATA.companions.find(c=>c.id===id)?.element).filter(Boolean);
    const cList = [];
    let cSyn = false;
    for (let i=0;i<cEls.length;i++) for (let j=0;j<cEls.length;j++) if (i!==j && ELEMENT_GENERATES[cEls[i]]===cEls[j]) cSyn = true;
    if (cSyn) cList.push({ type:'gen', text: isEn?'Synergy: ATK+6%':'상생: 공격력+6%' });
    if (activeComp.length===3 && cEls.length===3 && _isElementGenerateChain3(cEls)) {
      cList.push({ type:'gen', text: isEn?'3-Chain: CDR+4%':'3속성 연쇄: 쿨감+4%' });
    }

    // ── 펫 ──
    const activePets = (saveData.activePets||[]).slice(0,_slotCount);
    const pEls = activePets.map(id => GAME_DATA.pets.find(p=>p.id===id)?.element).filter(Boolean);
    const pList = [];
    let pSyn = false;
    for (let i=0;i<pEls.length;i++) for (let j=0;j<pEls.length;j++) if (i!==j && ELEMENT_GENERATES[pEls[i]]===pEls[j]) pSyn = true;
    if (pSyn) pList.push({ type:'gen', text: isEn?'Synergy: Effect+6%':'상생: 효과+6%' });
    if (activePets.length===3 && pEls.length===3 && _isElementGenerateChain3(pEls)) {
      pList.push({ type:'gen', text: isEn?'3-Chain: Effect+4%':'3속성 연쇄: 효과+4%' });
    }

    return `<div>
      ${_synSection(isEn?'⚔️ Main Weapons':'⚔️ 주무기', elementPentagramSVG(wEls, null, 170),
        _synListHTML(wList, isEn?'No active weapon synergy yet.':'아직 발동 중인 무기 시너지가 없습니다.'))}
      ${_synSection(isEn?'🤝 Companions':'🤝 동료', elementPentagramSVG(cEls, null, 170),
        _synListHTML(cList, isEn?'No active companion synergy yet.':'아직 발동 중인 동료 시너지가 없습니다.'))}
      ${_synSection(isEn?'🐾 Pets':'🐾 펫', elementPentagramSVG(pEls, null, 170),
        _synListHTML(pList, isEn?'No active pet synergy yet.':'아직 발동 중인 펫 시너지가 없습니다.'))}
    </div>`;
  }

  function _statsPopupHTML() {
    const isEn = Lang.getCurrent() === 'en';
    const tabs = [
      ['overview', isEn?'Overview':'종합'],
      ['detail',   isEn?'Detail':'상세'],
      ['synergy',  isEn?'Synergy':'시너지'],
    ];
    const body = _statsTab==='overview' ? _statsOverviewHTML()
      : _statsTab==='detail' ? _statsDetailHTML()
      : _statsSynergyHTML();
    return `<div style="position:absolute;inset:0;background:rgba(0,0,10,0.82);z-index:50;
      display:flex;align-items:center;justify-content:center;padding:20px;" onclick="if(event.target===this)PlayerScene.closeStatsPopup()">
      <div style="width:100%;max-height:80%;overflow-y:auto;background:rgba(10,8,20,0.98);
        border:1.5px solid rgba(100,220,140,0.5);border-radius:16px;padding:16px;
        box-shadow:0 0 30px rgba(80,200,120,0.2);" class="scroll-pan-y">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:14px;color:#90e8a0;font-weight:700;">${isEn?'📊 Stats Overview':'📊 종합 능력치'}</div>
          <button onclick="PlayerScene.closeStatsPopup()" style="background:none;border:none;color:#8a7a6a;font-size:18px;cursor:pointer;">✕</button>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:12px;">
          ${tabs.map(([id,label]) => `<button onclick="PlayerScene.setStatsTab('${id}')" style="
            flex:1;padding:7px 0;border-radius:8px;font-size:11px;font-family:inherit;cursor:pointer;
            background:${_statsTab===id?'rgba(80,200,120,0.3)':'rgba(255,255,255,0.04)'};
            border:1px solid ${_statsTab===id?'rgba(100,220,140,0.6)':'rgba(255,255,255,0.1)'};
            color:${_statsTab===id?'#a0f8b0':'#8a7a6a'};">${label}</button>`).join('')}
        </div>
        ${body}
      </div>
    </div>`;
  }

  function enter(el) { saveData = Save.load(); render(el); }
  function exit() {}

  return { enter, exit, upgrade, upgradeBulk, sinmokUpgrade, sinmokS2Upgrade, myeongUpgrade, selectMainWeapon,
    openCurrencyPopup, closeCurrencyPopup, toggleCurrencyDetail,
    openStatsPopup, closeStatsPopup, setStatsTab, toggleStatDetail,
    openCodexPopup, closeCodexPopup,
    openDeckPopup, closeDeckPopup, saveDeck, loadDeck, deleteDeck,
    openSeonsulPopup, closeSeonsulPopup,
    seonsulRequestRoot, seonsulRequestPath, seonsulRequestBranch, seonsulRequestPassive, seonsulRequestSub, seonsulRequestFinal,
    seonsulConfirmYes, seonsulConfirmNo,
    seonsulResetRequest, seonsulResetCancel, seonsulReset };
})();
