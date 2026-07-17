// spawner.js - 챕터 인식 스폰 시스템

const Spawner = (() => {
  let spawnTimer = 0;
  let eliteTimer = 0;
  let currentChapter = 1;
  let currentStage = 1;
  let _isDungeon = false;
  let _dungeonKills = 0;

  function reset(chapter, stage, isDungeon = false) {
    spawnTimer = 0;
    eliteTimer = 0;
    currentChapter = chapter || 1;
    currentStage = stage || 1;
    _isDungeon = isDungeon;
    _dungeonKills = 0;
  }

  // 현재 챕터의 몬스터 풀
  function getTypePool(elapsed) {
    const chapterPool = MONSTERS.byChapter[currentChapter] || MONSTERS.byChapter[1];
    if (elapsed < 30) return [chapterPool[0]];                   // 초반: 1번 몬스터만
    if (elapsed < 90) return chapterPool;                         // 중반: 챕터 전체
    return [...chapterPool, ...chapterPool, chapterPool[1]];      // 후반: 2번 몬스터 가중치 증가
  }

  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번④: 글리치 몬스터 modifier — 시즌3(챕터21~30) 한정,
  // 스폰마다 20% 확률로 "글리치 몬스터"가 되어 1~2개 랜덤 modifier를 받음(확률은 설계 문서에 수치 없어 자체 결정)
  const GLITCH_MOD_POOL = ['fast', 'slowGiant', 'split', 'invis'];
  function _rollGlitchMods() {
    if (currentChapter < 21 || currentChapter > 30) return null;
    if (Math.random() >= 0.2) return null;
    const n = Math.random() < 0.7 ? 1 : 2;
    const pool = [...GLITCH_MOD_POOL];
    const mods = [];
    for (let i = 0; i < n && pool.length; i++) {
      mods.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return mods;
  }

  // 화면 바깥 랜덤 위치
  function spawnPos(px, py, vw, vh) {
    const margin = 90;
    const side   = Math.floor(Math.random() * 4);
    const hw = vw/2 + margin, hh = vh/2 + margin;
    switch (side) {
      case 0: return { x: px + (Math.random()*vw - vw/2)*1.2, y: py - hh };
      case 1: return { x: px + (Math.random()*vw - vw/2)*1.2, y: py + hh };
      case 2: return { x: px - hw, y: py + (Math.random()*vh - vh/2)*1.2 };
      case 3: return { x: px + hw, y: py + (Math.random()*vh - vh/2)*1.2 };
    }
  }

  function update(dt, elapsed, player, enemies, vw, vh, kills = 0, dungeonUpgradeLv = 0) {
    const stageInChapter2=((currentStage-1)%10);
    const maxEnemies = CONFIG.GAME.MAX_ENEMIES+(currentChapter-1)*15+stageInChapter2*3;
    const alive = enemies.filter(e => !e.dead).length;
    if (alive >= maxEnemies) return;

    const wave = Math.floor(elapsed / 20);
    // [UPDATE 2026-07-17] 던전 전용 배율 곡선 완화 — 기존엔 1만킬 지점에서 1배→200배로 계단식 절벽이라
    // 던전강화로 그 지점부터 시작하면 사실상 즉사 난이도였음. 1천킬마다 5배 → 50배(1만킬)도 너무 힘들다는
    // 피드백으로 2배씩으로 재조정(1천킬=2배, 1만킬=20배, 2만킬=40배). 보상은 몬스터 강함 대비 1.5배로 더 후하게.
    // [UPDATE 2026-07-17] 던전강화 프레스티지 보너스: 레벨당 ×1.2 복리로 보상에 추가 가산.
    // "같은 킬수 기준이면 강화 레벨이 높을수록 항상 마리당 보상이 더 크다"를 보장하기 위한 설계
    // (고정 결승선 대비 총량 비교가 아니라, 순간 보상률 비교로 프레이밍을 바꿔 레벨 상한 없이도 안정적으로 성립).
    const dungeonMult = _isDungeon ? Math.max(1, Math.floor(kills / 1000) * 2) : 1;
    const prestigeBonus = _isDungeon ? Math.pow(1.2, dungeonUpgradeLv || 0) : 1;
    const rewardMult  = _isDungeon ? dungeonMult * 1.5 * prestigeBonus : 1;
    const stageInChapter = ((currentStage-1)%10);
    const decayBonus = (currentChapter-1)*0.003 + stageInChapter*0.001;
    const spawnInterval = Math.max(
      CONFIG.GAME.SPAWN_INTERVAL_MIN,
      CONFIG.GAME.SPAWN_INTERVAL_INIT - elapsed * (CONFIG.GAME.SPAWN_INTERVAL_DECAY + decayBonus)
    );
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
      spawnTimer = 0;
      const count = 1 + Math.floor(elapsed / 30);
      const pool  = getTypePool(elapsed);
      for (let i = 0; i < count; i++) {
        const typeName = pool[Math.floor(Math.random() * pool.length)];
        const pos = spawnPos(player.x, player.y, vw, vh);
        enemies.push(new Enemy(pos.x, pos.y, typeName, wave, _isDungeon, dungeonMult, _rollGlitchMods(), rewardMult));
      }
    }

    // ── 엘리트 스폰 (45초마다, 챕터쌍별 전용 이미지) ──
    eliteTimer += dt;
    if (eliteTimer >= 45 && elapsed > 30 && alive < maxEnemies - 3) {
      eliteTimer = 0;
      const eliteType =
        currentChapter <= 2  ? 'elite_ch1_2'   :
        currentChapter <= 4  ? 'elite_ch3_4'   :
        currentChapter <= 6  ? 'elite_ch5_6'   :
        currentChapter <= 8  ? 'elite_ch7_8'   :
        currentChapter <= 10 ? 'elite_ch9_10'  :
        currentChapter <= 14 ? 'elite_ch11_14' :
        currentChapter <= 17 ? 'elite_ch15_17' : 'elite_ch18_20';
      const pos = spawnPos(player.x, player.y, vw, vh);
      enemies.push(new Enemy(pos.x, pos.y, eliteType, wave, _isDungeon, dungeonMult, null, rewardMult));
    }
  }

  function setChapter(ch) { currentChapter = ch; }

  return { update, reset, setChapter };
})();
