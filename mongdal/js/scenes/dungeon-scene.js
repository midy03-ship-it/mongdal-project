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
  ];

  function enter(el) { saveData = Save.load(); render(el); }
  function exit() {}

  function render(el) {
    const unlocked = Unlock.getUnlocked(saveData);
    const isEn = Lang.getCurrent() === 'en';
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
            ⛩️ ${isEn ? 'Dungeon' : '던전'}
          </div>
          <div style="font-size:12px;color:#f0c840;">${_cimg('gold')}${gold.toLocaleString()} 💎${gems}</div>
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
          ].map(c => {
            const cIcon = _cimg(c.spriteKey);
            return `
            <div style="
              padding:4px 10px;border-radius:8px;font-size:12px;
              background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
              color:rgba(220,200,255,0.7);display:flex;align-items:center;gap:4px;
            ">${cIcon} ${saveData[c.key]||0}</div>`;
          }).join('')}
        </div>

        <!-- 던전 목록 -->
        <div style="flex:1;overflow-y:auto;padding:12px 16px 40px;display:flex;flex-direction:column;gap:12px;">
          ${availableDungeons.length === 0
            ? `<div style="text-align:center;color:rgba(200,160,255,0.4);margin-top:60px;font-size:14px;">
                ${isEn ? 'No dungeons unlocked yet.\nClear Stage 5 to unlock.' : '스테이지 5 클리어 시\n강화석 던전이 해금됩니다.'}
               </div>`
            : availableDungeons.map(d => dungeonCard(d, isEn)).join('')
          }
        </div>
      </div>
    `;
  }

  function dungeonCard(d, isEn) {
    const nameKey = d.id;
    const name = isEn ? Lang.t('dungeon', nameKey) || d.id : Lang.t('dungeon', nameKey) || d.id;
    const record = saveData[d.id + 'Record'];
    const recordText = record
      ? (Math.floor(record/60) + (isEn?'m ':' 분 ') + (record%60) + (isEn?'s':'초'))
      : (isEn ? 'No record' : '기록 없음');

    const descMap = {
      ganghwaseok:    isEn ? 'Enhancement stones drop instead of gold.' : '골드 대신 강화석이 드랍됩니다.',
      infinite:       isEn ? 'Endless gold farming dungeon.' : '골드 파밍용 무한 모드 던전.',
      bossrush:       isEn ? 'Challenge 10 bosses for diamonds.' : '보스 10마리 연속 도전, 다이아 획득.',
      cheonunseok:    isEn ? 'Heavenly stones drop instead of gold.' : '골드 대신 천운석이 드랍됩니다.',
      cheonryeonggwa: isEn ? 'Spirit fruits drop instead of gold.' : '골드 대신 천령과가 드랍됩니다.',
      taegeukseok:    isEn ? 'Taeguk stones drop instead of gold.' : '골드 대신 태극석이 드랍됩니다.',
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
            ${isEn?'Best:':'최고:'}
            <span style="color:${d.color};">${recordText}</span>
          </div>
          <button onclick="DungeonScene.startDungeon('${d.id}')" style="
            padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;
            font-family:inherit;border-radius:10px;
            background:${d.color}22;border:1px solid ${d.color};color:${d.color};
          ">${isEn?'Enter':'입장'}</button>
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

  return { enter, exit, startDungeon, startInfinite, startBossRush };
})();
