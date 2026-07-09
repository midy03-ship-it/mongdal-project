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

  function update(dt, elapsed, player, enemies, vw, vh, kills = 0) {
    const stageInChapter2=((currentStage-1)%10);
    const maxEnemies = CONFIG.GAME.MAX_ENEMIES+(currentChapter-1)*15+stageInChapter2*3;
    const alive = enemies.filter(e => !e.dead).length;
    if (alive >= maxEnemies) return;

    const wave = Math.floor(elapsed / 20);
    // 던전 전용: 1만 킬마다 ×200 배율 (1만킬=×200, 2만킬=×400, ...)
    const dungeonMult = _isDungeon ? Math.max(1, Math.floor(kills / 10000) * 200) : 1;
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
        enemies.push(new Enemy(pos.x, pos.y, typeName, wave, _isDungeon, dungeonMult));
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
      enemies.push(new Enemy(pos.x, pos.y, eliteType, wave, _isDungeon, dungeonMult));
    }
  }

  function setChapter(ch) { currentChapter = ch; }

  return { update, reset, setChapter };
})();
