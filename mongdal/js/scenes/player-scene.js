// player-scene.js - 캐릭터(플레이어) 화면
const PlayerScene = (() => {
  let saveData = null;

  // 일반 강화: 공격력/방어력만
  const STAT_INFO = () => [
    { key:'atk', label:Lang.t('player','stat_atk').label, icon:'⚔️',  desc:Lang.t('player','stat_atk').desc, unit:''  },
    { key:'def', label:Lang.t('player','stat_def').label, icon:'🛡️', desc:Lang.t('player','stat_def').desc, unit:''  },
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

  // 강화 비용 (단계별 2배)
  function upgradeCost(lv) { return CONFIG.UPGRADE_BASE_COST * Math.pow(CONFIG.UPGRADE_COST_MULT, lv); }

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

        <!-- 캐릭터 스프라이트 -->
        <div style="display:flex;align-items:center;justify-content:center;
          padding:16px 0 8px;background:rgba(0,0,0,0.2);
          border-bottom:1px solid rgba(212,160,23,0.15);">
          <img src="${SPRITES?.player?.src || ''}" alt="애기씨"
            style="height:80px;image-rendering:pixelated;
              filter:drop-shadow(0 4px 12px rgba(112,64,192,0.6));">
          <div style="margin-left:16px;">
            <div style="font-size:16px;color:#f0c040;font-weight:600;">${Lang.t('player','charName')}</div>
            <div style="font-size:11px;color:#8a7a6a;margin-top:2px;">${Lang.t('player','charSubtitle')}</div>
            <div style="font-size:10px;color:#6a5a4a;margin-top:4px;">
              ${Lang.t('player','upgradeHint')}
            </div>
          </div>
        </div>

        <!-- 주무기 선택 -->
        <div class="companion-list" style="padding:12px;">
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
            const _slotCount = _hasHard ? 3 : _hasNormal ? 2 : 1;
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
        <div class="companion-list" style="padding:12px;">
          <div class="list-section-title">${Lang.t('player','statSection')}</div>

          ${STAT_INFO().map(s => {
            const upLv   = upgrades[s.key] || 0;
            const upAmt  = upLv * getUpgradePerLevel(s.key);
            const total  = BASE[s.key] + upAmt;
            const cost   = upgradeCost(upLv);
            const canAfford = gold >= cost;

            return `
              <div style="
                display:flex;align-items:center;gap:10px;
                padding:10px 12px;margin-bottom:8px;
                background:rgba(255,255,255,0.03);
                border:1px solid rgba(255,255,255,0.07);
                border-radius:10px;">

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
      </div>`;
  }

  function getUpgradePerLevel(key) { return CONFIG.STAT_UPGRADE_PER_LEVEL[key] || 5; }

  function upgrade(key) {
    const upLv = (saveData.statUpgrades?.[key] || 0);
    const cost = upgradeCost(upLv);
    if ((saveData.gold || 0) < cost) return;
    saveData.gold -= cost;
    if (!saveData.statUpgrades) saveData.statUpgrades = {};
    saveData.statUpgrades[key] = upLv + 1;
    Save.save(saveData);
    render(document.getElementById('app'));
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
    Save.save(saveData);
    render(document.getElementById('app'));
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
    render(document.getElementById('app'));
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
    render(document.getElementById('app'));
  }

  function enter(el) { saveData = Save.load(); render(el); }
  function exit() {}

  return { enter, exit, upgrade, sinmokUpgrade, sinmokS2Upgrade, selectMainWeapon };
})();
