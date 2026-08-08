// dungeon-scene.js - 던전 탭
const DungeonScene = (() => {
  let saveData = null;

  // 던전 정의
  const DUNGEON_DEFS = [
    {
      id: 'ganghwaseok',
      unlockId: 'dungeon_ganghwaseok',
      icon: '🔧', spriteKey: 'ganghwaseok',
      reward: 'ganghwaseok',
      rewardIcon: '🔧', rewardSpriteKey: 'ganghwaseok',
      color: '#e08020',
      borderColor: 'rgba(224,128,32,0.5)',
      bg: 'linear-gradient(135deg,rgba(40,20,5,.9),rgba(60,30,10,.9))',
      mode: 'infinite',
      rewardMode: 'ganghwaseok',
    },
    {
      id: 'infinite',
      unlockId: 'dungeon_infinite',
      icon: '🌀',
      reward: 'gold',
      rewardIcon: '🪙', rewardSpriteKey: 'gold',
      color: '#f0c040',
      borderColor: 'rgba(240,192,64,0.5)',
      bg: 'linear-gradient(135deg,rgba(30,15,60,.9),rgba(60,30,20,.9))',
      mode: 'infinite',
      rewardMode: 'infinite',
    },
    {
      id: 'bossrush',
      unlockId: 'dungeon_bossrush',
      icon: '👹',
      reward: 'gems',
      rewardIcon: '💎',
      color: '#c060d0',
      borderColor: 'rgba(192,64,192,0.5)',
      bg: 'linear-gradient(135deg,rgba(60,10,10,.9),rgba(80,20,80,.9))',
      mode: 'boss_rush',
      rewardMode: 'bossrush',
    },
    {
      id: 'cheonunseok',
      unlockId: 'dungeon_cheonunseok',
      icon: '🪨', spriteKey: 'cheonunseok',
      reward: 'cheonunseok',
      rewardIcon: '🪨', rewardSpriteKey: 'cheonunseok',
      color: '#80c0ff',
      borderColor: 'rgba(128,192,255,0.5)',
      bg: 'linear-gradient(135deg,rgba(5,20,40,.9),rgba(10,30,60,.9))',
      mode: 'infinite',
      rewardMode: 'cheonunseok',
    },
    {
      id: 'cheonryeonggwa',
      unlockId: 'dungeon_cheonryeonggwa',
      icon: '🍑', spriteKey: 'cheonryeonggwa',
      reward: 'cheonryeonggwa',
      rewardIcon: '🍑', rewardSpriteKey: 'cheonryeonggwa',
      color: '#ff8080',
      borderColor: 'rgba(255,128,128,0.5)',
      bg: 'linear-gradient(135deg,rgba(40,5,5,.9),rgba(60,10,10,.9))',
      mode: 'infinite',
      rewardMode: 'cheonryeonggwa',
    },
    {
      id: 'taegeukseok',
      unlockId: 'dungeon_taegeukseok',
      icon: '💠', spriteKey: 'taegeukseok',
      reward: 'taegeukseok',
      rewardIcon: '💠', rewardSpriteKey: 'taegeukseok',
      color: '#60e0c0',
      borderColor: 'rgba(96,224,192,0.5)',
      bg: 'linear-gradient(135deg,rgba(5,30,25,.9),rgba(10,50,40,.9))',
      mode: 'infinite',
      rewardMode: 'taegeukseok',
    },
    // [UPDATE 2026-07-15] 260715_MTOPC.md 4/9번: 시즌별 특화재화 전용 던전 — 기존 재화던전과 동일 패턴, 드랍률도 공통 8% 그대로 재사용
    {
      id: 'hondonseok',
      unlockId: 'dungeon_hondonseok',
      icon: '🌪️', spriteKey: 'hondonseok', // [UPDATE 2026-07-17] 전용 아이콘 반입
      reward: 'hondonseok',
      rewardIcon: '🌪️', rewardSpriteKey: 'hondonseok',
      color: '#a060e0',
      borderColor: 'rgba(160,96,224,0.5)',
      bg: 'linear-gradient(135deg,rgba(25,10,40,.9),rgba(45,15,60,.9))',
      mode: 'infinite',
      rewardMode: 'hondonseok',
    },
    {
      id: 'sullriseok',
      unlockId: 'dungeon_sullriseok',
      icon: '🌊', spriteKey: 'sullriseok', // [UPDATE 2026-07-17] 전용 아이콘 반입
      reward: 'sullriseok',
      rewardIcon: '🌊', rewardSpriteKey: 'sullriseok',
      color: '#40a0e0',
      borderColor: 'rgba(64,160,224,0.5)',
      bg: 'linear-gradient(135deg,rgba(5,20,40,.9),rgba(10,35,55,.9))',
      mode: 'infinite',
      rewardMode: 'sullriseok',
    },
  ];

  function enter(el) { saveData = Save.load(); render(el); }
  function exit() {}

  function render(el) {
    const unlocked = Unlock.getUnlocked(saveData);
    const gold = saveData.gold || 0;
    const gems = saveData.gems || 0;
    const L = (k) => Lang.t('dungeon', k);

    const availableDungeons = DUNGEON_DEFS.filter(d => unlocked.has(d.unlockId));

    el.innerHTML = `
      <div style="
        height:844px;
        background:linear-gradient(180deg,#0a0610 0%,#12091e 100%);
        font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
        color:#e8d8ff;
        display:flex;flex-direction:column;
      ">
        <!-- 상단 바 -->
        <div style="
          display:flex;align-items:center;justify-content:space-between;
          padding:16px 20px 12px;
          border-bottom:1px solid rgba(200,160,255,0.15);
        ">
          <button onclick="SceneManager.go('lobby')" style="
            background:none;border:none;color:rgba(200,160,255,0.7);
            font-size:22px;cursor:pointer;padding:4px 8px;">←</button>
          <div style="font-size:17px;letter-spacing:.15em;color:#e0c8ff;">
            ⛩️ ${L('title')}
          </div>
          <div style="font-size:12px;color:#f0c840;">${_cimg('gold')}${Format.num(gold)} 💎${gems}</div>
        </div>

        <!-- 재화 현황 -->
        <div style="
          display:flex;gap:8px;flex-wrap:wrap;padding:12px 16px 4px;
        ">
          ${[
            { spriteKey:'ganghwaseok',    key:'ganghwaseok' },
            { spriteKey:'cheonunseok',    key:'cheonunseok' },
            { spriteKey:'cheonryeonggwa', key:'cheonryeonggwa' },
            { spriteKey:'taegeukseok',    key:'taegeukseok' },
            { spriteKey:'hondonseok', key:'hondonseok' }, // [UPDATE 2026-07-17] 전용 아이콘 반입
            { spriteKey:'sullriseok', key:'sullriseok' },
          ].map(c => {
            const cIcon = c.spriteKey ? _cimg(c.spriteKey) : c.icon;
            return `
            <div style="
              padding:4px 10px;border-radius:8px;font-size:12px;
              background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
              color:rgba(220,200,255,0.7);display:flex;align-items:center;gap:4px;
            ">${cIcon} ${saveData[c.key]||0}</div>`;
          }).join('')}
        </div>

        <!-- [UPDATE 2026-07-16] 260716_MTOPC.md 2번②③⑤: 던전강화 프레스티지 -->
        ${unlocked.has('dungeon_infinite') ? dungeonUpgradeCard() : ''}

        <!-- 던전 목록 -->
        <div class="scroll-pan-y" style="flex:1;overflow-y:auto;padding:12px 16px 40px;display:flex;flex-direction:column;gap:12px;">
          ${availableDungeons.length === 0
            ? `<div style="text-align:center;color:rgba(200,160,255,0.4);margin-top:60px;font-size:14px;">
                ${L('noDungeonsUnlocked')}
               </div>`
            : availableDungeons.map(d => dungeonCard(d)).join('')
          }
        </div>
      </div>
    `;
  }

  // [UPDATE 2026-07-16] 260716_MTOPC.md 2번②③⑤: 던전강화 카드 — 무한던전 시작 킬수를 밀어주는 프레스티지 강화 +
  // 종합 전투력 지수 대비 적정/위험/매우위험 안내
  function _dungeonUpgradeCost(lv) {
    const C = CONFIG.DUNGEON_UPGRADE;
    return {
      gold: Math.floor(C.BASE_COST_GOLD * Math.pow(C.COST_MULT, lv)),
      cheonunseok: Math.floor(C.BASE_COST_CHEONUNSEOK * Math.pow(C.CHEONUNSEOK_COST_MULT, lv)),
    };
  }

  function dungeonUpgradeCard() {
    const lv = saveData.dungeonUpgradeLv || 0;
    const cost = _dungeonUpgradeCost(lv);
    const gold = saveData.gold || 0;
    const cheonunseok = saveData.cheonunseok || 0;
    const canAfford = gold >= cost.gold && cheonunseok >= cost.cheonunseok;
    const startKills = lv * CONFIG.DUNGEON_UPGRADE.KILLS_PER_LEVEL;
    const power = computeBattlePower(saveData);
    const rating = battlePowerRatingFor(power, lv);
    const ratingInfo = {
      safe:   { label: Lang.t('dungeon','ratingSafe'),   color:'#60e080' },
      risky:  { label: Lang.t('dungeon','ratingRisky'),  color:'#f0c040' },
      danger: { label: Lang.t('dungeon','ratingDanger'), color:'#ff6060' },
    }[rating];

    return `
      <div style="
        margin:0 16px 12px;padding:14px 16px;border-radius:14px;
        background:linear-gradient(135deg,rgba(40,20,60,.9),rgba(20,10,35,.9));
        border:1.5px solid rgba(200,140,255,0.4);
      ">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div style="font-size:14px;color:#e0c0ff;font-weight:700;">
            🔮 ${Lang.t('dungeon','upgradeTitle')} Lv.${lv}
          </div>
          <div style="font-size:11px;padding:3px 8px;border-radius:8px;
            background:${ratingInfo.color}22;border:1px solid ${ratingInfo.color}88;color:${ratingInfo.color};">
            ${Lang.t('dungeon','power')} ${power} · ${ratingInfo.label}
          </div>
        </div>
        <div style="font-size:11px;color:rgba(220,200,255,0.6);margin-bottom:10px;">
          ${Lang.t('dungeon','startFromKillTpl').replace('{n}',Format.num(startKills))}
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="DungeonScene.downgradeDungeon()" ${lv<=0?'disabled':''} style="
            padding:9px 12px;border-radius:9px;font-size:12px;cursor:${lv<=0?'not-allowed':'pointer'};
            font-family:inherit;font-weight:700;white-space:nowrap;
            background:${lv<=0?'rgba(80,80,80,0.15)':'rgba(255,100,100,0.15)'};
            border:1px solid ${lv<=0?'rgba(255,255,255,0.08)':'rgba(255,140,140,0.5)'};
            color:${lv<=0?'rgba(255,255,255,0.25)':'#ffb0b0'};
          ">▼ Lv.${Math.max(0,lv-1)}</button>
          <button onclick="DungeonScene.upgradeDungeon()" ${canAfford?'':'disabled'} style="
            flex:1;padding:9px 0;border-radius:9px;font-size:12px;cursor:${canAfford?'pointer':'not-allowed'};
            font-family:inherit;font-weight:700;
            background:${canAfford?'rgba(200,140,255,0.25)':'rgba(80,80,80,0.2)'};
            border:1px solid ${canAfford?'rgba(220,170,255,0.6)':'rgba(255,255,255,0.1)'};
            color:${canAfford?'#e8d0ff':'rgba(255,255,255,0.3)'};
          ">${_cimg('gold')}${Format.num(cost.gold)} ${_cimg('cheonunseok')}${Format.num(cost.cheonunseok)} → Lv.${lv+1}</button>
        </div>
        ${lv>0 ? `<div style="font-size:9px;color:rgba(220,200,255,0.4);margin-top:6px;text-align:center;">
          ${Lang.t('dungeon','downgradeRefundTpl')
            .replace('{gold}',Format.num(_dungeonUpgradeCost(lv-1).gold))
            .replace('{stone}',Format.num(_dungeonUpgradeCost(lv-1).cheonunseok))}
        </div>` : ''}
      </div>`;
  }

  function upgradeDungeon() {
    const lv = saveData.dungeonUpgradeLv || 0;
    const cost = _dungeonUpgradeCost(lv);
    if ((saveData.gold||0) < cost.gold || (saveData.cheonunseok||0) < cost.cheonunseok) return;
    saveData.gold -= cost.gold;
    saveData.cheonunseok -= cost.cheonunseok;
    saveData.dungeonUpgradeLv = lv + 1;
    Save.save(saveData);
    render(document.getElementById('app'));
  }

  // [UPDATE 2026-07-17] 던전강화 레벨 다운 — "너무 세게 올려버렸다" 되돌리기용. 그 레벨을 올릴 때 낸 비용을 전액 환급.
  function downgradeDungeon() {
    const lv = saveData.dungeonUpgradeLv || 0;
    if (lv <= 0) return;
    const refund = _dungeonUpgradeCost(lv - 1);
    saveData.gold = (saveData.gold||0) + refund.gold;
    saveData.cheonunseok = (saveData.cheonunseok||0) + refund.cheonunseok;
    saveData.dungeonUpgradeLv = lv - 1;
    Save.save(saveData);
    render(document.getElementById('app'));
  }

  function dungeonCard(d) {
    const name = Lang.t('dungeon', d.id) || d.id;
    const record = saveData[d.id + 'Record'];
    const recordText = record
      ? Lang.t('dungeon','recordTimeTpl').replace('{m}',Math.floor(record/60)).replace('{s}',record%60)
      : Lang.t('dungeon','noRecordText');

    // [UPDATE 2026-08-06] 텍스트 중앙화 — desc_<id> 키로 이관
    const descMap = {
      ganghwaseok:    Lang.t('dungeon','desc_ganghwaseok'),
      infinite:       Lang.t('dungeon','desc_infinite'),
      bossrush:       Lang.t('dungeon','desc_bossrush'),
      cheonunseok:    Lang.t('dungeon','desc_cheonunseok'),
      cheonryeonggwa: Lang.t('dungeon','desc_cheonryeonggwa'),
      taegeukseok:    Lang.t('dungeon','desc_taegeukseok'),
      hondonseok:     Lang.t('dungeon','desc_hondonseok'),
      sullriseok:     Lang.t('dungeon','desc_sullriseok'),
    };

    return `
      <div style="
        background:${d.bg};
        border:1.5px solid ${d.borderColor};
        border-radius:16px;padding:16px;
      ">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <div style="font-size:28px;display:flex;align-items:center;">
            ${d.spriteKey ? _cimg(d.spriteKey, 32) : d.icon}
          </div>
          <div style="flex:1;">
            <div style="font-size:15px;color:${d.color};font-weight:700;">${name}</div>
            <div style="font-size:11px;color:rgba(200,200,200,0.5);margin-top:2px;">
              ${descMap[d.id] || ''}
            </div>
          </div>
          <div style="font-size:20px;display:flex;align-items:center;">
            ${d.rewardSpriteKey ? _cimg(d.rewardSpriteKey, 24) : d.rewardIcon}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="flex:1;font-size:10px;color:#555;">
            ${Lang.t('dungeon','bestLabel')}
            <span style="color:${d.color};">${recordText}</span>
          </div>
          <button onclick="DungeonScene.startDungeon('${d.id}')" style="
            padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;
            font-family:inherit;border-radius:10px;
            background:${d.color}22;border:1px solid ${d.color};color:${d.color};
          ">${Lang.t('dungeon','enterPlain')}</button>
        </div>
      </div>
    `;
  }

  function startDungeon(id) {
    const d = DUNGEON_DEFS.find(x => x.id === id);
    if (!d) return;
    SceneManager.go('game', { mode: d.mode, rewardMode: d.rewardMode });
  }

  // 하위 호환
  function startInfinite()  { startDungeon('infinite'); }
  function startBossRush()  { startDungeon('bossrush'); }

  return { enter, exit, startDungeon, startInfinite, startBossRush, upgradeDungeon, downgradeDungeon };
})();
