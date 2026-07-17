// player-scene.js - 캐릭터(플레이어) 화면
const PlayerScene = (() => {
  let saveData = null;
  let _statsOpen = false;         // [UPDATE 2026-07-12] 종합 능력치 확인 팝업 상태
  let _statsTab  = 'overview';    // 'overview' | 'detail' | 'synergy'
  let _statsExpandedRow = null;   // [UPDATE 2026-07-13] 상세 탭에서 탭한 스탯 행(브레이크다운 확대 표시)
  let _codexOpen = false;         // [UPDATE 2026-07-14] 260714_MTOPC.md 5번: 해금 도감 팝업 상태
  let _deckOpen = false;          // [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑥: 덱(무기셋) 저장/불러오기 팝업 상태

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

  function render(el) {
    const upgrades = saveData.statUpgrades || {};
    const gold     = saveData.gold || 0;

    el.innerHTML = `
      <div class="char-root">
        <div class="char-header">
          <button class="back-btn" onclick="SceneManager.go('lobby')">${Lang.t('player','back')}</button>
          <h2 class="char-title">${Lang.t('player','title')}</h2>
          <span class="char-subtitle">${_cimg('gold')} ${gold.toLocaleString()}</span>
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
            </div>
            <div style="font-size:11px;color:#8a7a6a;margin-top:2px;">${Lang.t('player','charSubtitle')}</div>
            <!-- [UPDATE 2026-07-16] 종합 전투력 노출 — 던전강화 카드에서만 보이던 computeBattlePower()를 캐릭터 창에도 표시 -->
            <div style="font-size:12px;color:#e0c0ff;margin-top:6px;font-weight:600;">
              🔮 ${Lang.getCurrent()==='en'?'Battle Power':'종합 전투력'} ${computeBattlePower(saveData).toLocaleString()}
            </div>
            <div style="font-size:10px;color:#6a5a4a;margin-top:4px;">
              ${Lang.t('player','upgradeHint')}
            </div>
          </div>
        </div>

        <!-- [UPDATE 2026-07-12] 종합 능력치 확인 팝업 -->
        ${_statsOpen ? _statsPopupHTML() : ''}
        <!-- [UPDATE 2026-07-14] 260714_MTOPC.md 5번: 해금 도감 팝업 -->
        ${_codexOpen ? _codexPopupHTML() : ''}
        <!-- [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑥: 덱(무기셋) 팝업 -->
        ${_deckOpen ? _deckPopupHTML() : ''}

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
                display:flex;align-items:center;gap:10px;
                padding:10px 12px;margin-bottom:8px;
                background:rgba(255,255,255,0.03);
                border:1px solid rgba(255,255,255,0.07);
                border-radius:10px;">
                ${isGuideTarget ? `<span class="onboard-hint">${Lang.t('onboarding','atkUpgradeHint')}</span>` : ''}

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

                <!-- 강화 버튼 -->
                <button onclick="PlayerScene.upgrade('${s.key}')" style="
                  flex-shrink:0;padding:6px 10px;
                  background:${canAfford?'rgba(112,64,192,0.4)':'rgba(255,255,255,0.04)'};
                  border:1px solid ${canAfford?'#7040c0':'rgba(255,255,255,0.1)'};
                  border-radius:8px;cursor:${canAfford?'pointer':'default'};
                  color:${canAfford?'#e8dcc8':'#444'};font-family:inherit;font-size:10px;
                  display:flex;flex-direction:column;align-items:center;gap:1px;">
                  <span>${Lang.t('player','upgradeBtn')}</span>
                  <span style="color:${canAfford?'#f0c040':'#444'};">${_cimg('gold')}${cost.toLocaleString()}</span>
                </button>
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
                const btnLabel = maxed ? 'MAX' : _smUnlocked ? `${_cimg('gold')}${cost.toLocaleString()} ${_cimg('taegeukseok')}${tCost}` : '🔒';
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
            + `<div style="text-align:center;font-size:10px;color:#8060a0;margin-bottom:10px;">${isEn?'Permanent upgrades using Soul Stones':'영혼석으로 영구 강화'} · 💜 ${_stones.toLocaleString()}</div>`
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
    render(el);
    const newScrollEl = document.getElementById('app').querySelector('.companion-list');
    if (newScrollEl) newScrollEl.scrollTop = scrollTop;
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
    return new Player(0, 0, saveData.statUpgrades || {}, saveData.sinmokUpgrades || {}, saveData.sinmokS2 || {});
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
    const upPerLv = CONFIG.STAT_UPGRADE_PER_LEVEL, smPerLv = CONFIG.SINMOK.PER_LV, sm2PerLv = CONFIG.SINMOK_S2.PER_LV;
    // [UPDATE 2026-07-13] 탭 클릭 시 크게 펼쳐 보여주는 브레이크다운 — 한 줄 문장 대신 소스별 배열로 반환
    const bd = (base, ...parts) => [`${isEn?'Base':'기본'} ${base}`, ...parts.filter(Boolean)];
    // [UPDATE 2026-07-13] 공격력 최종값이 Player.totalAtk(명부 최종데미지% 배율 포함)와 불일치하던 버그 수정 —
    // 브레이크다운에 명부 배율 항목 추가 + 최종값에도 곱해서 종합(Overview) 탭 수치와 일치시킴
    const _atkBase = BASE.atk + (upg.atk||0)*upPerLv.atk;
    const _atkExtraDmgPct = (sm2.extraDmg||0)*sm2PerLv.extraDmg;
    const _atkFinal = Math.floor(_atkBase * (1 + _atkExtraDmgPct/100));
    const rows = [
      ['⚔️', isEn?'ATK':'공격력', _atkFinal, 'atk',
        bd(BASE.atk, upg.atk ? `${isEn?'Upgrade':'강화'}+${(upg.atk*upPerLv.atk)}` : '',
          sm2.extraDmg ? `${isEn?'Soul Registry':'명부'} ×${(1+_atkExtraDmgPct/100).toFixed(2)}` : '')],
      ['🛡️', isEn?'DEF':'방어력', BASE.def + (upg.def||0)*upPerLv.def, 'def',
        bd(BASE.def, upg.def ? `${isEn?'Upgrade':'강화'}+${(upg.def*upPerLv.def)}` : '')],
      ['💨', isEn?'Move Speed':'이동속도', BASE.mov + (upg.mov||0)*upPerLv.mov + (sm.movSpd||0)*smPerLv.movSpd, 'mov',
        bd(BASE.mov, upg.mov?`${isEn?'Upgrade':'강화'}+${upg.mov*upPerLv.mov}`:'', sm.movSpd?`${isEn?'Sacred Tree':'신목'}+${sm.movSpd*smPerLv.movSpd}`:'')],
      ['⚡', isEn?'Atk Speed':'공격속도', BASE.spd + (upg.spd||0)*upPerLv.spd + (sm.atkSpd||0)*smPerLv.atkSpd, 'spd',
        bd(BASE.spd, upg.spd?`${isEn?'Upgrade':'강화'}+${upg.spd*upPerLv.spd}`:'', sm.atkSpd?`${isEn?'Sacred Tree':'신목'}+${sm.atkSpd*smPerLv.atkSpd}`:'')],
      ['🌀', isEn?'Evasion':'회피율', (BASE.eva + (upg.eva||0)*upPerLv.eva + (sm.evasion||0)*smPerLv.evasion).toFixed(1)+'%', 'eva',
        bd(BASE.eva, upg.eva?`${isEn?'Upgrade':'강화'}+${(upg.eva*upPerLv.eva).toFixed(1)}`:'', sm.evasion?`${isEn?'Sacred Tree':'신목'}+${sm.evasion*smPerLv.evasion}`:'')],
      ['🎯', isEn?'Crit Chance':'크리티컬 확률', ((sm.critChance||0)*smPerLv.critChance).toFixed(1)+'%', 'critChance',
        [sm.critChance ? `${isEn?'Sacred Tree':'신목'} ${sm.critChance*smPerLv.critChance}%` : (isEn?'None':'없음')]],
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

  return { enter, exit, upgrade, sinmokUpgrade, sinmokS2Upgrade, selectMainWeapon,
    openStatsPopup, closeStatsPopup, setStatsTab, toggleStatDetail,
    openCodexPopup, closeCodexPopup,
    openDeckPopup, closeDeckPopup, saveDeck, loadDeck, deleteDeck };
})();
