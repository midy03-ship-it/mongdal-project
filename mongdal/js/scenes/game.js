// game.js - 메인 전투 씬 (아이템 드롭 + 스탯 시스템 통합)
const GameScene = (() => {
  let canvas, ctx, rafId, lastTime = 0;
  let state = 'playing';
  let player, companions, enemies, projectiles, xpOrbs, bgOrbs, weapons;
  window.earnedGold = 0;
  window.earnedSpecial = 0;
  let _rewardMode = null;
  let _pendingEnding = false; // 시즌 1 최초 클리어 시 엔딩 씬으로 이동 // null=normal, 'ganghwaseok','cheonunseok','cheonryeonggwa','taegeukseok','bossrush'
  let _pendingEnding2 = false; // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌 2 최초 클리어 시 엔딩 씬으로 이동
  let _pendingEnding3 = false; // [UPDATE 2026-07-17] 시즌 3 최초 클리어 시 엔딩 씬으로 이동
  // [UPDATE 2026-07-15] 260715_MTOPC.md 4/9번: 혼돈석/순리석 던전 신설 — rollDrops()는 rewardMode truthy만 체크하므로 코드 변경 없이 그대로 작동
  const SPECIAL_REWARD_KEYS = { ganghwaseok:1, cheonunseok:1, cheonryeonggwa:1, taegeukseok:1, chaewonseok:1, hondonseok:1, sullriseok:1 };
  const SPECIAL_ICONS = { ganghwaseok:'🔧', cheonunseok:'🪨', cheonryeonggwa:'🍑', taegeukseok:'💠', bossrush:'💎', chaewonseok:'🔷', hondonseok:'🌪️', sullriseok:'🌊' };
  let bigGoldDrops = [];
  let goldDrops = [], specialItems = [], enemyProjs = [], hitEffects = [], floatingTexts = [], bombEffects = [];
  let petEntities = [], activePetData = [];
  let boss = null;
  let rushBosses = [];      // 보스 러쉬 전용: 동시 다중 보스 배열
  let rushNextSpawnAt = 0;  // 보스 러쉬: 다음 보스 소환 시각(elapsed 기준)
  const BOSS_RUSH_INTERVAL = 30; // 보스 러쉬: 보스 스폰 간격(초), 이전 보스 생사 무관하게 항상 소환
  let stageId, isBossStage, bossType, currentChapter = 1;
  let gameMode = 'normal'; // normal | infinite | boss_rush
  let difficulty = 'easy'; // easy | normal | hard
  let _s2Debuff = false;   // 시즌2 차원석 없을 때 잠식 디버프
  let _s2CwsDrainTimer = 0; // 시즌2 차원석 시간 소모 타이머 (60초마다 2개 차감)
  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번①: 도깨비주사위 — 시즌3 스테이지 입장 시 1회 랜덤 롤
  let _dokkaebiDiceResult = null;
  const DOKKAEBI_DICE_TABLE = [
    { roll:1, icon:'💀', textKo:'저주 — 받는피해 +15%',         textEn:'Curse — Damage Taken +15%',
      apply: p => { p._diceDmgTakenMult = (p._diceDmgTakenMult||0) + 0.15; } },
    { roll:2, icon:'📉', textKo:'쇠약 — 공격력 -10%',            textEn:'Weakness — ATK -10%',
      apply: p => { p._diceAtkMult = (p._diceAtkMult||1) - 0.10; } },
    { roll:3, icon:'🌀', textKo:'꽝 — 아무 일도 없었다',          textEn:'Nothing — Nothing happens',
      apply: () => {} },
    { roll:4, icon:'💨', textKo:'날쌤 — 이동속도 +10%',          textEn:'Swift — Move Speed +10%',
      apply: p => { p.tempStats.mov += 10; } },
    { roll:5, icon:'🪙', textKo:'재물운 — 골드 획득량 +20%',      textEn:'Fortune — Gold Gain +20%',
      apply: p => { p._goldMult = (p._goldMult||1) * 1.2; } },
    { roll:6, icon:'🎇', textKo:'대박 — 공격력 +20%, 받는피해 -10%', textEn:'Jackpot — ATK +20%, Damage Taken -10%',
      apply: p => { p._diceAtkMult = (p._diceAtkMult||1) + 0.20; p._diceDmgTakenMult = (p._diceDmgTakenMult||0) - 0.10; } },
  ];
  function _rollDokkaebiDice(p) {
    const entry = DOKKAEBI_DICE_TABLE[Math.floor(Math.random() * 6)];
    entry.apply(p);
    return entry;
  }

  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 3종 — 즉시 발동, 30초 지속, 재드랍 쿨다운 없음
  let _transformType = null, _transformTimer = 0, _transformAtkCd = 0;
  const TRANSFORM_DURATION = 30;
  window._onTransformCardPickup = (type) => {
    _transformType = type;
    _transformTimer = TRANSFORM_DURATION;
    _transformAtkCd = 0;
    const sc = SPRITES?.transformPlayer?.[type];
    if (sc && player) { player.img = SpriteLoader.get(sc.src); player.spriteW=sc.drawW; player.spriteH=sc.drawH; player.spriteOX=sc.offsetX; player.spriteOY=sc.offsetY; }
  };
  function _revertTransform() {
    _transformType = null;
    if (player) {
      const sc = Player.getSpriteConfig();
      player.img = SpriteLoader.get(sc.src); player.spriteW=sc.drawW; player.spriteH=sc.drawH; player.spriteOX=sc.offsetX; player.spriteOY=sc.offsetY;
    }
  }
  // 변신 중 전투 로직 — 기존 무기는 그대로 두고(디자인 문서상 "즉시 사용" 강조라 별도 무기 해제 로직 없이 보너스 공격으로 얹음),
  // 카드별 전용 공격 패턴을 추가로 발동시켜 변신의 존재감을 살림
  function _updateTransform(dt, aliveList) {
    if (!_transformType) return;
    _transformTimer -= dt;
    if (_transformTimer <= 0) { _revertTransform(); return; }
    _transformAtkCd -= dt;
    if (_transformType === 'dokkaebi') {
      // 근접 강타(넉백 큰 광역): 1.2초마다 반경 90 내 전체 타격 + 큰 넉백
      if (_transformAtkCd <= 0) {
        _transformAtkCd = 1.2;
        const dmg = Math.floor(player.totalAtk * 2.5);
        const hit = aliveList.filter(e => Math.hypot(e.x-player.x,e.y-player.y) < 90);
        for (const e of hit) {
          e.takeDamage(dmg, false, 'transform_dokkaebi');
          const a = Math.atan2(e.y-player.y, e.x-player.x);
          e.x += Math.cos(a)*120; e.y += Math.sin(a)*120;
        }
        if (hit.length && window._hitEffects) window._hitEffects.push({x:player.x,y:player.y,t:0,life:0.3,key:'hit_explode',ox:0,oy:-8});
      }
    } else if (_transformType === 'gumiho') {
      // 원거리 화염구 연사: 0.4초마다 가장 가까운 적에게 관통 화염구 1발
      if (_transformAtkCd <= 0) {
        _transformAtkCd = 0.4;
        let nearest=null, nd=Infinity;
        for (const e of aliveList) { const d=Math.hypot(e.x-player.x,e.y-player.y); if(d<nd){nd=d;nearest=e;} }
        if (nearest) {
          const dist = nd||1;
          projectiles.push(new Projectile(
            player.x, player.y, (nearest.x-player.x)/dist*380, (nearest.y-player.y)/dist*380,
            Math.floor(player.totalAtk*0.6),
            { radius:10, pierce:2, life:1.5, type:'transform_gumiho', color:'#c060e0', glow:'rgba(192,96,224,.5)' }
          ));
        }
      }
    } else if (_transformType === 'gogolgwi') {
      // 빠른 이속 + 다중 히트 근접: 0.35초마다 반경 55 내 전체 타격(약한 개별 데미지, 높은 히트빈도)
      if (_transformAtkCd <= 0) {
        _transformAtkCd = 0.35;
        const dmg = Math.floor(player.totalAtk * 0.7);
        const hit = aliveList.filter(e => Math.hypot(e.x-player.x,e.y-player.y) < 55);
        for (const e of hit) e.takeDamage(dmg, false, 'transform_gogolgwi');
        if (hit.length && window._hitEffects) window._hitEffects.push({x:player.x,y:player.y,t:0,life:0.2,key:'hit_normal',ox:0,oy:-8});
      }
    }
  }
  let soulDrops = [];      // 시즌2 영혼 드랍 (영혼 조각 / 영혼석)
  let bossRushIndex = 0;   // 보스 러쉬 진행 인덱스
  let rushBossPool = [];   // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 무한 확장형 — 해금된 챕터의 보스를 반복 소환할 풀
  let infiniteWave = 0;    // 무한 모드 웨이브
  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번②: 복수 애기씨(분신) — 시즌3 한정, 혼돈석 30개/체(최대3체) 소모 소환
  let aegissiClones = [];
  let zoom = 1.0;  // 줌 레벨 (0.5 ~ 2.0)
  let killTarget = 300, kills = 0; // [UPDATE 2026-07-09] init()에서 즉시 덮어써지는 초기값 — 개발모드 축소 제거
  let killTargetReached = false, bossSpawned = false;
  let farmingTimer = 0;
  let elapsed = 0, timeLeft = 300;
  let levelUpChoices = { main:[], sub:[], stat:[] };
  let screenShake = 0, shakeX = 0, shakeY = 0;
  let companionImg = null, warningTimer = 0;
  let saveData = null;
  const WARNING_DUR = 2.2;

  function getStageInfo(id) {
    for (const ch of GAME_DATA.stages)
      for (const s of ch.stages)
        if (s.id === id) return s;
    return null;
  }

  // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 보스러시 무한 확장형 — 클리어한 챕터의 미들보스+챕터보스를 반복 소환하는 풀 구성
  function _buildBossRushPool(sd) {
    const cleared = (sd.clearedChapters || []).slice().sort((a,b)=>a-b);
    const chs = cleared.length ? cleared : [1]; // 안전장치: 클리어 기록이 없어도 최소 챕터1은 항상 포함
    const pool = [];
    for (const ch of chs) { pool.push({type:'mid_boss', ch}); pool.push({type:'chapter_boss', ch}); }
    return pool;
  }

  function init(el, params) {
    console.log('🎮 GameScene.init', params);
    AudioManager.play('battle');
    gameMode    = params?.mode || 'normal';
    stageId     = params?.stageId || 1;
    _rewardMode = params?.rewardMode || null;
    difficulty  = params?.difficulty || 'easy';
    window.gameDifficulty = difficulty;

    if (gameMode === 'infinite') {
      isBossStage=false; bossType=null; killTarget=99999;
      currentChapter=1; timeLeft=99999; infiniteWave=0;
    } else if (gameMode === 'boss_rush') {
      isBossStage=true; bossType='mid_boss'; killTarget=0;
      currentChapter=1; timeLeft=99999; bossRushIndex=0;
      rushBosses=[]; rushNextSpawnAt=0; // 첫 보스는 즉시(elapsed=0 도달 시) 소환
    } else {
      const si = getStageInfo(stageId);
      isBossStage = !!(si?.isBoss || si?.isMidBoss);
      bossType    = si?.isBoss ? 'chapter_boss' : si?.isMidBoss ? 'mid_boss' : null;
      killTarget  = Math.floor((si?.killTarget || 300) // [UPDATE 2026-07-09] 개발모드 킬수 10% 축소 제거 — 실제 밸런스로 테스트
        * (difficulty==='easy'?0.7:difficulty==='hard'?1.5:1.0));
      currentChapter = MONSTERS.getChapterFromStage(stageId);
      timeLeft = CONFIG.GAME.TIME_LIMIT || 300;
    }

    kills = 0; elapsed = 0; window.earnedGold = 0; window.earnedSpecial = 0;
    // [UPDATE 2026-07-17] 이전 런의 잔여값이 결과화면에 그대로 새던 버그 수정 — 매 런 시작마다 초기화
    window.earnedSoulStones = 0; window.earnedSoulFragments = 0;
    bigGoldDrops = []; soulDrops = [];
    killTargetReached = false; farmingTimer = 0; bossSpawned = false;
    state = 'playing'; warningTimer = 0;

    enemies=[]; projectiles=[]; xpOrbs=[]; bgOrbs=[];
    goldDrops=[]; specialItems=[]; enemyProjs=[]; hitEffects=[]; floatingTexts=[]; bombEffects=[];
    aegissiClones=[];
    _transformType=null; _transformTimer=0; _transformAtkCd=0; // [UPDATE 2026-07-17] 변신카드 상태 초기화
    window._hitEffects = hitEffects;
    companions=[]; levelUpChoices={main:[],sub:[],stat:[]};
    petEntities=[]; activePetData=[];
    boss=null; rushBosses=[]; screenShake=0;
    zoom = 1.0;

    saveData = Save.load();
    // [UPDATE 2026-07-15] 260715_MTOPC.md 6번: 시즌5 첫 진입 시 삼신할매 태몽 회상 트리거 —
    // 시즌5(챕터41~) 콘텐츠 자체가 아직 없어서 당장은 도달 불가능하지만, 나중에 시즌5가 추가되면 바로 동작하도록 미리 배선.
    // 팝업은 로비의 기존 삼신할매 대화창을 재사용(다음 로비 방문 시 1회 노출) — 인게임 전용 팝업 UI를 새로 만들지 않음.
    if (gameMode === 'normal' && stageId === 401 && !saveData.samsinDreamSeen) {
      saveData.samsinDreamSeen = true;
      Save.save(saveData);
    }
    if (gameMode === 'boss_rush') rushBossPool = _buildBossRushPool(saveData); // [UPDATE 2026-07-14]
    // [UPDATE 2026-07-16] 260716_MTOPC.md 2번②③: 던전강화 — 무한던전 시작 킬수를 강화 레벨만큼 밀어줌
    // (kills가 Spawner.update()의 dungeonMult 계산에 그대로 쓰이므로, 시작값만 올려두면 별도 배선 불필요)
    if (gameMode === 'infinite') {
      kills = (saveData.dungeonUpgradeLv || 0) * CONFIG.DUNGEON_UPGRADE.KILLS_PER_LEVEL;
    }
    speedMult = saveData.speedMult || 1;
    autoMode  = saveData.autoMode  || 0;
    if (saveData.speedMult === undefined || saveData.autoMode === undefined) {
      saveData.speedMult = speedMult;
      saveData.autoMode  = autoMode;
      Save.save(saveData);
    }

    // [UPDATE 2026-07-13] 260713_MTOPC.md 20번: 줌 버튼 발견성 낮음 피드백 대응 — 스테이지1 최초 진입 시 1회만 스팟라이트
    const _showZoomTutorial = gameMode === 'normal' && stageId === 1 && !saveData.stage1TutorialSeen;
    if (_showZoomTutorial) { saveData.stage1TutorialSeen = true; Save.save(saveData); }

    // 플레이어 (저장된 강화 스탯 반영)
    player = new Player(0, 0, saveData.statUpgrades || {}, saveData.sinmokUpgrades || {}, saveData.sinmokS2 || {});
    player._invincible = 2.0; // 시작 2초 무적

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번①③: 도깨비주사위 + 혼돈시장 재고 — 시즌3 스테이지(201~300) 입장 시 갱신
    if (gameMode === 'normal' && stageId >= 201 && stageId <= 300) {
      _dokkaebiDiceResult = _rollDokkaebiDice(player);
      saveData._chaosMarketStock = rollChaosMarketStock();
      Save.save(saveData);
    } else {
      _dokkaebiDiceResult = null;
    }

    // [UPDATE 2026-07-17] 차원석 경제를 시즌2(101~200)로만 한정했던 것을 시즌2 이후 전체(101~)로 확장 —
    // "현계 밖에서 사는 동안은 계속 차원석이 필요하다"는 설정에 맞춰 시즌3 이후에도 동일 적용(사용자 지적)
    if (stageId >= 101) {
      const _diffCfgEntry = StageSelectScene.DIFF_CONFIG[difficulty] || StageSelectScene.DIFF_CONFIG.easy;
      const _entryCost = _diffCfgEntry.s2EntryCost || 1;
      saveData.chaewonseok = Math.max(0, (saveData.chaewonseok || 0) - _entryCost);
      Save.save(saveData);
    }
    _s2CwsDrainTimer = 0;

    // 차원석 디버프 감지 (stageId 101 이상, chaewonseok=0)
    _s2Debuff = (stageId >= 101 && (saveData.chaewonseok || 0) === 0);
    player._healBlocked = _s2Debuff;
    const _unlockedWeapons = saveData.unlockedWeapons || ['talisman'];
    // [UPDATE 2026-07-11] 이지는 동적 슬롯수(챕터5클리어→2/시즌1클리어→3) 반영
    const _diffCfg = StageSelectScene.getDiffConfig(difficulty, saveData) || StageSelectScene.DIFF_CONFIG.easy;
    const _mainSlotCount = gameMode === 'normal' ? (_diffCfg.slotMain || 1) : 3;
    // 선택된 주무기 목록 (슬롯 수만큼, 없으면 talisman 폴백)
    const _selectedMains = (saveData.selectedMainWeapons || [saveData.selectedMainWeapon || 'talisman'])
      .filter(wid => _unlockedWeapons.includes(wid))
      .filter((wid, idx, arr) => arr.indexOf(wid) === idx) // 중복 제거
      .slice(0, _mainSlotCount);
    if (_selectedMains.length === 0) _selectedMains.push('talisman');

    function _makeMainWeapon(wid) {
      const bsLv = (saveData.weaponLevels || {})[wid] || 1;
      const g = computeWeaponGrowth(bsLv); // [UPDATE 2026-07-06] 대장간 누적 강화값을 통합 공식으로 변환
      const inst = new WeaponInstance(wid);
      inst.lv          = g.lv;
      inst._awakLv     = Math.min(g.awakLv, 5); // 5각 이상은 테이블 고정, 데미지만 _overAwkDmg로
      inst._awakSubLv  = g.awakSubLv;
      inst.ascendLv    = g.ascendLv;
      inst._overAwkDmg = g.overAwkDmg;
      const _tRank = (saveData.weaponTranscend || {})[wid] || 0; // [UPDATE 2026-07-08] 무기 초월 배율 적용
      inst._transcendRank = _tRank;
      inst._transcendMult = getTranscendMult(_tRank);
      return inst;
    }
    weapons = _selectedMains.map(_makeMainWeapon);
    window.mainWeapon  = weapons[0];
    window.mainWeapons = weapons; // 다중 주무기 배열
    // [UPDATE 2026-07-12] 무기 초월 발광 연출용 — 투사체 draw()는 WeaponInstance에 직접 접근 못 하므로 defId→초월랭크 조회 테이블을 별도로 둠.
    // 투사체 type 값은 scythe_main이 아니라 'scythe'로 쓰이므로 별칭 처리.
    window._transcendRankByType = {};
    const _TRANSCEND_TYPE_ALIAS = { scythe_main: 'scythe' };
    for (const w of weapons) window._transcendRankByType[_TRANSCEND_TYPE_ALIAS[w.defId] || w.defId] = w._transcendRank || 0;
    window.subWeapons  = [];
    window.statSlots   = [];
    player.weapons = weapons;
    // 이번 런 획득 재화 추적
    window._runGold = 0;
    window._runSpecial = 0;
    // [UPDATE 2026-07-10] 데미지 미터 초기화 (이전 런 잔여 데이터 방지) — 누적 총데미지 + 최근 3초 로그로 부드러운 DPS 계산
    window._dpsTotal = {};
    window._dpsLog = [];
    window._dpsDisplay = {};
    window._gameElapsed = 0;
    player._damageReduction = 0;
    player._critChance=0; player._critMult=1.5;
    player._atkBuff=1; player._atkBuffTime=0;
    player._xpMult=1.0; player._cdReduction=0;
    player._cdrCd=0; player._cdrPet=0; // [UPDATE 2026-07-06] 쿨감 소스별 필드 리셋 // [UPDATE 2026-07-15] _cdrAtkSpd 제거(260715_MTOPC.md 11번, 공격속도는 totalSpd 경로로 분리)
    player._shieldTime=0; player._shieldHp=0;
    window._boss = null;
    window._player = player;
    window._enemies = enemies;

    // 동료: 서낭당 해금(스테이지 10 클리어) 후에만 활성화
    const companionUnlocked = Unlock.getUnlocked(saveData).has('companion');
    const _compSlotCount = gameMode === 'normal'
      ? (_diffCfg.slotComp || 1)
      : Math.max(1, (saveData.activeCompanions||[]).length);
    const activeIds = companionUnlocked ? (saveData.activeCompanions||[]).slice(0, _compSlotCount) : [];
    activeIds.forEach((id,i)=>{
      const d=GAME_DATA.companions.find(c=>c.id===id);
      if(d) companions.push(new CompanionEntity(d,i));
    });
    // 펫: 용왕 연못(스테이지 40) 해금 후에만 활성화
    const petUnlocked = Unlock.getUnlocked(saveData).has('pet');
    const _petSlotCount = gameMode === 'normal'
      ? (_diffCfg.slotPet || 1)
      : Math.max(1, (saveData.activePets||[]).length);
    if (petUnlocked) {
      (saveData.activePets||[]).slice(0, _petSlotCount).forEach((id,i)=>{
        const pd=GAME_DATA.pets.find(p=>p.id===id);
        if(pd){
          // [UPDATE 2026-07-11] 강화 레벨을 실제 효과치에 반영 (기존엔 petLevels가 전혀 안 쓰였음)
          const _petLv = (saveData.petLevels||{})[id] || 1;
          const scaledPd = { ...pd, value: scalePetValue(pd, _petLv) };
          if (pd.markCount) scaledPd.markCount = scalePetIntField(pd.markCount, _petLv); // [UPDATE 2026-07-11] 사신 표식 대상 수
          petEntities.push(new PetEntity(scaledPd,i)); activePetData.push(scaledPd);
        }
      });
    }
    // [UPDATE 2026-07-17] 히든 시너지: 도깨비 계열 동료(꺽쇠/박수/장구애비) + 도깨비 계열 펫(싸리/공이) 동시 장착 시
    // 보조무기 도깨비불 지속시간·크기 2배 (hidden.md 참고, weapons.js goblin_fire.fire()에서 실사용)
    const _dokkaebiComps = ['ggeogsoe','baksu','janggu_aebi'];
    const _dokkaebiPets  = ['ssari','gongi'];
    player._dokkaebiFireBoost = activeIds.some(id=>_dokkaebiComps.includes(id))
      && activePetData.some(pd=>_dokkaebiPets.includes(pd.id));
    // [UPDATE 2026-07-11] 오행 시너지는 펫 패시브 적용 전에 계산해야 펫 효과량 배율이 반영됨
    applyElementSynergies(window.mainWeapons, companions, activePetData, player);
    // [UPDATE 2026-07-11] 영혼낫 처치 → 신검 쿨감 스택 (오행 시너지) 처치 귀속 훅
    window._onEnemyKilled = (srcType) => {
      const sw = (window.mainWeapons||[]).find(w => w.defId==='sword');
      if (sw && sw._synKillStackEnabled && srcType==='scythe') {
        sw._killStacks = Math.min(5, (sw._killStacks||0)+1);
        sw._killStackTimer = 8.0;
      }
    };
    applyPetPassives(activePetData, player, weapons);
    window._cdReduction = player._cdReduction||0;

    // [UPDATE 2026-07-11] 펫발 동료 스탯 배율(유신/자신/축신) + 오행 동료 연쇄 쿨감 적용 — 패시브 적용 후라야 값이 확정됨
    if (player._compAtkMult || player._compHpMult || player._compCdBonus) {
      for (const c of companions) {
        if (player._compAtkMult) c.atkDmg = Math.floor(c.atkDmg * player._compAtkMult);
        if (player._compHpMult) { c.maxHp = Math.floor(c.maxHp * player._compHpMult); c.hp = c.maxHp; }
        if (player._compCdBonus) c.skillInterval *= (1 - player._compCdBonus);
      }
    }

    // ── 건물 효과 적용 ──
    BuildingEffects.applyAll(player, companions, saveData);

    // 서낭당: 런 시작 시 추가 무기
    const seonangBonus = BuildingEffects.getSeonangBonus(saveData);
    if (seonangBonus.count > 0) {
      const allWeaponIds = Object.keys(WEAPON_DEFS);
      for (let i = 0; i < seonangBonus.count; i++) {
        const alreadyHave = weapons.map(w => w.id);
        const pool = allWeaponIds.filter(id => !alreadyHave.includes(id));
        if (pool.length === 0) break;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        weapons.push(new WeaponInstance(pick));
      }
      player.weapons = weapons;
    }

    _tileCache = {};
    for(let i=0;i<18;i++) bgOrbs.push({
      x:(Math.random()-.5)*1400, y:(Math.random()-.5)*1400,
      r:3+Math.random()*4, t:Math.random()*Math.PI*2,
      spd:14+Math.random()*16, color:Math.random()<.5?'#40c0f0':'#a060e0'
    });

    // companionImg: removed legacy spritesheet (individual sprites used)
    Spawner.reset(currentChapter, stageId, gameMode !== 'normal');
    console.log('🎮 챕터:', currentChapter, '킬타겟:', killTarget, '보스스테이지:', isBossStage);

    el.innerHTML=`
      <div style="position:relative;width:100%;height:100%;">
        <canvas id="gameCanvas" style="display:block;width:390px;height:844px;background:#0a0814;image-rendering:pixelated;"></canvas>
        <div id="gameUI" style="position:absolute;inset:0;pointer-events:none;"></div>
        <button id="pauseBtn" onclick="GameScene.togglePause()" style="
          position:absolute;top:56px;right:10px;width:36px;height:36px;
          background:rgba(0,0,0,0.5);border:1px solid rgba(212,160,23,0.4);
          border-radius:8px;color:#e8dcc8;font-size:16px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;z-index:50;">⏸</button>
        <button id="speedBtn" onclick="GameScene.cycleSpeed()" style="
          position:absolute;top:56px;right:52px;width:42px;height:36px;
          background:rgba(0,0,0,0.5);border:1px solid rgba(212,160,23,0.4);
          border-radius:8px;color:#f0c040;font-size:13px;font-weight:700;cursor:pointer;
          display:flex;align-items:center;justify-content:center;z-index:50;font-family:inherit;">1x</button>
        <button id="autoBtn" onclick="GameScene.cycleAutoMode()" style="
          position:absolute;top:56px;right:100px;width:52px;height:36px;
          background:rgba(0,0,0,0.5);border:1px solid rgba(100,180,255,0.4);
          border-radius:8px;color:#80c8ff;font-size:11px;font-weight:700;cursor:pointer;
          display:flex;align-items:center;justify-content:center;z-index:50;font-family:inherit;">수동</button>
        ${((gameMode==='normal' && stageId>=201 && stageId<=300) || _rewardMode==='hondonseok') ? `
        <button id="cloneBtn" onclick="GameScene.summonClone()" style="
          position:absolute;top:56px;right:160px;width:52px;height:36px;
          background:rgba(20,10,40,0.7);border:1px solid rgba(160,96,224,0.5);
          border-radius:8px;color:#d0a0ff;font-size:9px;font-weight:700;cursor:pointer;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;z-index:50;font-family:inherit;">
          <span>👤${Lang.getCurrent()==='en'?'Clone':'분신'}</span><span id="cloneBtnCost" style="font-size:8px;">🌪️30</span>
        </button>` : ''}
        <div id="zoomBtnWrap" style="position:absolute;bottom:90px;right:10px;
          display:flex;flex-direction:column;gap:6px;z-index:50;">
          <button onclick="GameScene.zoomIn()" style="
            width:36px;height:36px;background:rgba(0,0,0,0.5);
            border:1px solid rgba(212,160,23,0.3);border-radius:8px;
            color:#e8dcc8;font-size:16px;cursor:pointer;">+</button>
          <button onclick="GameScene.zoomOut()" style="
            width:36px;height:36px;background:rgba(0,0,0,0.5);
            border:1px solid rgba(212,160,23,0.3);border-radius:8px;
            color:#e8dcc8;font-size:16px;cursor:pointer;">−</button>
          ${_showZoomTutorial ? `<span id="zoomTutorialHint" class="onboard-hint" style="display:none;white-space:normal;width:120px;text-align:center;">${Lang.t('onboarding','zoomHint')}</span>` : ''}
        </div>
      </div>`;
    canvas=document.getElementById('gameCanvas'); ctx=canvas.getContext('2d');

    // [UPDATE 2026-07-13] 260713_MTOPC.md 20번: 기존 스테이지 인트로 텍스트(0~1.5초) 종료 직후 → 줌 버튼 스팟라이트 노출,
    // 논블로킹으로 몇 초 뒤 자동 페이드아웃
    if (_showZoomTutorial) {
      setTimeout(() => {
        const wrap = document.getElementById('zoomBtnWrap');
        const hint = document.getElementById('zoomTutorialHint');
        if (wrap) wrap.classList.add('onboard-pulse');
        if (hint) hint.style.display = 'block';
      }, 1500);
      setTimeout(() => {
        const wrap = document.getElementById('zoomBtnWrap');
        const hint = document.getElementById('zoomTutorialHint');
        if (wrap) wrap.classList.remove('onboard-pulse');
        if (hint) {
          hint.style.transition = 'opacity .5s';
          hint.style.opacity = '0';
          setTimeout(() => hint.remove(), 500);
        }
      }, 1500 + 4500);
    }

    const _speedBtn = document.getElementById('speedBtn');
    if (_speedBtn) _speedBtn.textContent = speedMult + 'x';
    const _autoBtn = document.getElementById('autoBtn');
    if (_autoBtn) {
      _autoBtn.textContent = getAutoModeLabel(autoMode);
      _autoBtn.style.color = ['#80c8ff','#80ffb0','#ffb080'][autoMode];
      _autoBtn.style.borderColor = ['rgba(100,180,255,0.4)','rgba(80,255,120,0.4)','rgba(255,140,80,0.4)'][autoMode];
    }

    window._pauseKeyHandler=(e)=>{if(e.code==='Escape') GameScene.togglePause();};
    window.addEventListener('keydown',window._pauseKeyHandler);

    requestAnimationFrame(()=>{
      canvas.width=390;
      canvas.height=844;
      window.addEventListener('resize',onResize);
      Input.attachTouch(canvas);
      canvas.addEventListener('wheel', onWheel, {passive:false});
      canvas.addEventListener('touchstart', onTouchStart, {passive:true});
      canvas.addEventListener('touchmove', onTouchMove, {passive:true});
      lastTime=performance.now();
      rafId=requestAnimationFrame(loop);

      // 시즌2 잠식 디버프 경고 팝업
      if (_s2Debuff) {
        const isKo = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'ko' : true;
        const warn = document.createElement('div');
        warn.style.cssText = `
          position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
          background:rgba(10,5,25,0.93);border:1.5px solid rgba(100,60,200,0.7);
          border-radius:16px;padding:20px 24px;z-index:9990;
          font-family:'Noto Serif KR',serif;text-align:center;
          box-shadow:0 0 30px rgba(80,30,180,0.4);max-width:300px;
        `;
        warn.innerHTML = `
          <div style="font-size:22px;margin-bottom:8px;">💀</div>
          <div style="font-size:13px;color:#c090ff;font-weight:700;margin-bottom:8px;">
            ${isKo ? '유명계 잠식' : 'Shadow Realm Corruption'}
          </div>
          <div style="font-size:11px;color:#b090d0;line-height:1.7;">
            ${isKo
              ? '차원석이 없어 저승에 잠식됩니다.<br>HP 회복 불가 · 시간이 지날수록 HP 감소.'
              : 'No Dimensional Stones — corruption spreads.<br>Healing blocked · HP drains over time.'}
          </div>
          <div style="margin-top:12px;font-size:10px;color:rgba(160,120,220,0.5);">
            ${isKo ? '3초 후 자동으로 닫힘' : 'Closes in 3s'}
          </div>
        `;
        document.body.appendChild(warn);
        setTimeout(() => warn.remove(), 3000);
      }
    });
  }

  function onResize(){ /* 고정 해상도 1280x720 - 리사이즈 시 캔버스 크기 변경 안 함 */ }

  function togglePause(){
    if(['dead','victory','bossWarning'].includes(state)) return;
    state==='paused'?resumeGame():pauseGame();
  }
  function pauseGame(){
    state='paused';
    document.getElementById('pauseBtn').textContent='▶';
    const ui=document.getElementById('gameUI'); if(!ui) return;
    ui.style.pointerEvents='auto';
    const isKo = Lang.getCurrent()==='ko';
    const volVal = AudioManager.isMuted() ? 0 : Math.round(AudioManager.getVolume()*100);
    const min=Math.floor(elapsed/60), sec=Math.floor(elapsed%60);
    const modeLabel = gameMode==='infinite'?(isKo?'무한던전':'Infinite')
      : gameMode==='boss_rush'?(isKo?'보스러시':'Boss Rush')
      : (isKo?'스테이지 ':'Stage ')+stageId;
    ui.innerHTML=`
      <div class="scroll-pan-y" style="position:absolute;inset:0;background:rgba(0,0,10,0.88);overflow-y:auto;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;">
        <div style="font-size:22px;color:#f0c040;font-weight:700;">⏸ ${isKo?'일시 정지':'Paused'}</div>
        <div style="font-size:11px;color:#6a5a4a;">
          ${modeLabel} · ${isKo?'처치':'Kills'} ${kills}/${killTarget} · Lv.${player.level} · ${min}:${sec.toString().padStart(2,'0')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;width:100%;max-width:300px;">
          ${[['⚔️',isKo?'공격':'ATK',player.totalAtk],
             ['🛡️',isKo?'방어':'DEF',player.totalDef],
             ['💨',isKo?'이동':'MOV',Math.round(player.totalSpd)],
             ['❤️',isKo?'체력':'HP',Math.ceil(player.hp)+'/'+player.maxHp],
             ['✨',isKo?'치명':'CRIT',Math.round((player._critRate||0)*100)+'%'],
             ['📦',isKo?'레벨':'Lv',player.level],
          ].map(([icon,label,val])=>`
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
              border-radius:8px;padding:6px 4px;text-align:center;">
              <div style="font-size:14px;">${icon}</div>
              <div style="font-size:9px;color:#6a5a4a;">${label}</div>
              <div style="font-size:12px;color:#e8dcc8;font-weight:700;">${val}</div>
            </div>`).join('')}
        </div>
        <div style="width:100%;max-width:300px;background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span id="pauseVolIcon" style="font-size:16px;">${volVal===0?'🔇':'🔊'}</span>
            <span style="font-size:11px;color:#8a7a6a;flex-shrink:0;">${isKo?'볼륨':'Vol'}</span>
            <input type="range" id="pauseVolSlider" min="0" max="100" value="${volVal}"
              style="flex:1;accent-color:#a060e0;"
              oninput="AudioManager.setVolume(this.value/100);AudioManager.setMuted(this.value==0);document.getElementById('pauseVolIcon').textContent=this.value==0?'🔇':'🔊';document.getElementById('pauseVolNum').textContent=this.value+'%';">
            <span id="pauseVolNum" style="font-size:11px;color:#8a7a6a;width:30px;text-align:right;">${volVal}%</span>
          </div>
        </div>
        <button onclick="GameScene.resumeGame()" style="width:240px;padding:13px;
          background:rgba(112,64,192,0.4);border:1px solid #7040c0;border-radius:12px;
          color:#e8dcc8;font-size:15px;cursor:pointer;font-family:inherit;">▶ ${isKo?'계속하기':'Resume'}</button>
        <button onclick="GameScene.goLobby()" style="width:240px;padding:13px;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:12px;
          color:#8a7a6a;font-size:14px;cursor:pointer;font-family:inherit;">← ${isKo?'로비로 돌아가기':'Back to Lobby'}</button>
      </div>`;
  }
  function _collectSoulDrop(sd) {
    // [UPDATE 2026-07-06] 저승나비 펫: 영혼 획득량 배율 (초과분은 확률로 +1)
    const _mult = player?._soulMult || 1;
    let _gain = Math.floor(_mult);
    if (Math.random() < _mult - _gain) _gain++;
    if (sd.type === 'soulFragment') {
      saveData.soulFragments = (saveData.soulFragments || 0) + _gain;
      window.earnedSoulFragments = (window.earnedSoulFragments || 0) + _gain;
      showFloatingText(sd.x, sd.y - 10, '👻+' + _gain, '#80b0ff');
    } else if (sd.type === 'soulStone') {
      saveData.soulStones = (saveData.soulStones || 0) + _gain;
      window.earnedSoulStones = (window.earnedSoulStones || 0) + _gain;
      showFloatingText(sd.x, sd.y - 10, '💜+' + _gain, '#c080ff');
    }
    Save.save(saveData);
  }

  function _collectBigGold(b) {
    // 시즌2 차원석 드랍: spriteKey로 직접 판별
    if (b.spriteKey === 'chaewonseok') {
      saveData.chaewonseok = (saveData.chaewonseok || 0) + 1;
      window.earnedSpecial = (window.earnedSpecial || 0) + 1;
      Save.save(saveData);
      showFloatingText(b.x, b.y, '🔷+1', '#80c8ff');
      return;
    }
    // [UPDATE 2026-07-17] 던전 몬스터가 세지는 만큼 특화재화/골드뭉치 보상도 스케일 — 기존엔 몬스터만
    // 세지고 보상은 고정이라 던전강화로 더 강한 구간에 들어가도 위험만 늘고 이득은 그대로였음.
    // spawner.js와 동일하게 몬스터 배율(1천킬당 2배)의 1.5배로 보상은 더 후하게 지급.
    const _monsterMult = (gameMode === 'infinite') ? Math.max(1, Math.floor(kills / 1000) * 2) : 1;
    const _bgDungeonMult = (gameMode === 'infinite') ? _monsterMult * 1.5 : 1;
    if (_rewardMode && SPECIAL_REWARD_KEYS[_rewardMode]) {
      // [UPDATE 2026-07-11] 해신(돼지) 펫 specialBoost 반영 — 분수분은 확률로 처리
      const _specMult = player._specialMult || 1;
      const _specRaw = 1 * _specMult * _bgDungeonMult;
      let _specGain = Math.floor(_specRaw);
      if (Math.random() < _specRaw - _specGain) _specGain++;
      saveData[_rewardMode] = (saveData[_rewardMode] || 0) + _specGain;
      window.earnedSpecial = (window.earnedSpecial || 0) + _specGain;
      Save.save(saveData);
      showFloatingText(b.x, b.y, SPECIAL_ICONS[_rewardMode] + '+' + _specGain, '#c0e0ff');
    } else if (_rewardMode === 'bossrush') {
      // 보스러쉬: 다이아
      saveData.gems = (saveData.gems || 0) + 1;
      window.earnedSpecial = (window.earnedSpecial || 0) + 1;
      Save.save(saveData);
      showFloatingText(b.x, b.y, '💎+1', '#e080ff');
    } else {
      const goldMult = difficulty==='easy' ? 0.7 : difficulty==='hard' ? 1.5 : 1.0;
      const gained = Math.floor(b.value * goldMult * _bgDungeonMult);
      saveData.gold = (saveData.gold || 0) + gained;
      window.earnedGold += gained;
      Save.save(saveData);
      showFloatingText(b.x, b.y, '💰+'+gained, '#ffd700');
    }
  }
  function toggleMute(){
    const next = !AudioManager.isMuted();
    AudioManager.setMuted(next);
    if (!next) AudioManager.play('battle');
    const btn = document.getElementById('pauseMuteBtn');
    const _muteEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    if (btn) btn.textContent = next ? (_muteEn?'🔇 Music Off':'🔇 음악 꺼짐') : (_muteEn?'🔊 Music On':'🔊 음악 켜짐');
  }
  function resumeGame(){
    state='playing';
    lastTime=performance.now();
    const btn=document.getElementById('pauseBtn'); if(btn) btn.textContent='⏸';
    const ui=document.getElementById('gameUI'); if(ui){ui.innerHTML='';ui.style.pointerEvents='none';}
  }
  function goLobby(){ SceneManager.go('lobby'); }

  function triggerBossWarning(){
    state='bossWarning'; warningTimer=WARNING_DUR;
    const _bwEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    const _chBoss = MONSTERS?.bosses?.[currentChapter];
    const _chKey  = bossType==='chapter_boss' ? 'final' : 'mid';
    const _chDef  = _chBoss?.[_chKey];
    const _fallback = bossType==='chapter_boss'
      ? {name:'목 없는 장군', nameEn:'The Headless General', sub:'귀-인-국을 무너뜨린 전쟁의 화신', subEn:'The incarnation of war that shattered Gwi-In-Guk', color:'#c04010'}
      : {name:'원귀장',       nameEn:'Ghost Warlord',        sub:'분노한 원혼의 수장',              subEn:'Leader of the enraged vengeful spirits',         color:'#8040d0'};
    const bDef = {
      name:  _bwEn ? (_chDef?.nameEn || _fallback.nameEn) : (_chDef?.name  || _fallback.name),
      sub:   _bwEn ? (_chDef?.subEn  || _fallback.subEn)  : (_chDef?.sub   || _fallback.sub),
      color: _chDef?.color || _fallback.color,
    };
    const ui=document.getElementById('gameUI'); if(!ui) return;
    ui.style.pointerEvents='none';
    ui.innerHTML=`
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.72);
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;">
        <div style="font-size:13px;color:#ff4040;letter-spacing:.15em;animation:wP .5s infinite alternate;">
          ⚠️ ${_bwEn?'B O S S  A P P E A R S':'보 스 등 장'} ⚠️</div>
        <div style="font-size:28px;font-weight:700;color:${bDef.color};text-shadow:0 0 20px ${bDef.color};">
          ${bDef.name}</div>
        <div style="font-size:13px;color:#8a7a6a;">${bDef.sub}</div>
        <div style="width:200px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:6px;">
          <div id="warningBarFill" style="height:100%;background:${bDef.color};width:0%;"></div>
        </div>
      </div>
      <style>@keyframes wP{from{opacity:.5}to{opacity:1}}</style>`;
  }

  let _loopCount = 0;
  let speedMult = 1;
  let _tileCache = {}; // 모드별 캐시: { decos, texRotated }
  let autoMode = 0; // 0=수동, 1=반자동, 2=자동
  const AUTO_MODES_KO = ['수동', '반자동', '자동'];
  const AUTO_MODES_EN = ['Manual', 'Semi-Auto', 'Auto'];
  function getAutoModeLabel(idx) {
    return (Lang.getCurrent()==='ko' ? AUTO_MODES_KO : AUTO_MODES_EN)[idx];
  }
  const AUTO_EVADE_RADIUS = 60;

  function getAutoDir() {
    const manual = Input.getDir();
    if (manual.x !== 0 || manual.y !== 0) return manual;
    if (!enemies || enemies.length === 0) return { x: 0, y: 0 };
    let ex = 0, ey = 0, count = 0;
    for (const e of enemies) {
      if (e.dead) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < AUTO_EVADE_RADIUS) {
        ex += dx / (dist + 1);
        ey += dy / (dist + 1);
        count++;
      }
    }
    if (count === 0) return { x: 0, y: 0 };
    const len = Math.hypot(ex, ey);
    return len > 0 ? { x: -ex / len, y: -ey / len } : { x: 0, y: 0 };
  }

  function cycleSpeed() {
    speedMult = speedMult === 1 ? 2 : speedMult === 2 ? 3 : 1;
    const btn = document.getElementById('speedBtn');
    if (btn) btn.textContent = speedMult + 'x';
    saveData = Save.load();
    saveData.speedMult = speedMult;
    Save.save(saveData);
  }

  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번②: 복수 애기씨 소환 — 혼돈석 30개 소모, 최대 3체
  function summonClone() {
    if (aegissiClones.length >= 3) return;
    const sd = Save.load();
    if ((sd.hondonseok || 0) < 30) return;
    sd.hondonseok -= 30;
    Save.save(sd);
    saveData = sd;
    aegissiClones.push({ x: player.x + (Math.random()-0.5)*60, y: player.y + (Math.random()-0.5)*60, atkCd: 0 });
    const costEl = document.getElementById('cloneBtnCost');
    if (costEl) costEl.textContent = aegissiClones.length >= 3 ? 'MAX' : '🌪️30';
  }

  function cycleAutoMode() {
    autoMode = (autoMode + 1) % 3;
    const btn = document.getElementById('autoBtn');
    if (btn) {
      btn.textContent = getAutoModeLabel(autoMode);
      btn.style.color = ['#80c8ff','#80ffb0','#ffb080'][autoMode];
      btn.style.borderColor = ['rgba(100,180,255,0.4)','rgba(80,255,120,0.4)','rgba(255,140,80,0.4)'][autoMode];
    }
    saveData = Save.load();
    saveData.autoMode = autoMode;
    Save.save(saveData);
  }

  function loop(now){
    rafId=requestAnimationFrame(loop);
    if(document.hidden){ lastTime=now; return; }
    const rawDt=Math.min((now-lastTime)/1000,0.05); lastTime=now;
    const dt = rawDt * speedMult;
    _loopCount++;
    if (_loopCount === 1) console.log('🎮 게임 루프 시작 state=', state);
    try {
      if(state==='bossWarning') updateBossWarning(dt);
      else if(state==='playing'||state==='farming') update(dt);
      render();
    } catch(e) {
      console.error('🔥 게임 루프 에러:', e.message, e.stack?.split('\n')[1]);
      // state 강제 리셋 제거
    }
  }

  function updateBossWarning(dt){
    warningTimer-=dt;
    const fill=document.getElementById('warningBarFill');
    if(fill) fill.style.width=`${(1-warningTimer/WARNING_DUR)*100}%`;
    if(warningTimer<=0){
      const ui=document.getElementById('gameUI');
      if(ui){ui.innerHTML='';ui.style.pointerEvents='none';}
      boss=new Boss(player.x,player.y-220,bossType,Math.floor(elapsed/20),currentChapter);
      window._boss=boss; bossSpawned=true; state='playing';
    }
  }

  function update(dt){
    if(state==='farming'){
      farmingTimer-=dt;
      // 파밍 중 - 플레이어 이동 + 아이템 수집만 허용
      if(farmingTimer<=0){ endGame(true); return; }
      const dir = autoMode > 0 ? getAutoDir() : Input.getDir();
      player.update(dt,dir);
      // [UPDATE 2026-07-13] 260713_MTOPC.md 20번: 파밍 구간(스폰 종료~결과화면 전) 왕복 이동이
      // 파밍 타임(5초)보다 오래 걸려 못 먹는 신고 대응 — 파밍 중에만 자석 범위 3배 적용
      const _farmMagnet = player.magnetRange * 3;
      // 골드/아이템 수집
      for(const g of goldDrops){ g.update(dt,player.x,player.y,_farmMagnet); }
      goldDrops=goldDrops.filter(g=>!g.dead);
      for(const b of bigGoldDrops){ b.update(dt,player.x,player.y,_farmMagnet);
        if(b.dead){ _collectBigGold(b); }
      }
      bigGoldDrops=bigGoldDrops.filter(b=>!b.dead);
      for(const s of specialItems){ s.update(dt,player.x,player.y); }
      specialItems=specialItems.filter(s=>!s.dead);
      // 영혼 드랍 (시즌2)
      for(const sd of soulDrops){ sd.update(dt,player.x,player.y,_farmMagnet);
        if(sd.dead){ _collectSoulDrop(sd); }
      }
      soulDrops=soulDrops.filter(sd=>!sd.dead);
      // XP 오브
      for(const o of xpOrbs){ o.update(dt,player.x,player.y,_farmMagnet);
        if(o.dead&&player.gainXp) player.gainXp(Math.floor(o.val||o.value||1));
      }
      xpOrbs=xpOrbs.filter(o=>!o.dead);
      return;
    }
    if(state!=='playing') return;
    elapsed+=dt; timeLeft-=dt;

    // [UPDATE 2026-07-10] 무기별 데미지 미터 — 최근 3초 로그를 매 프레임 정리해서 부드러운 DPS 계산 (1초 단위로 뚝뚝 끊기지 않게)
    window._gameElapsed = elapsed;
    window._curChapterForEnemyScale = (gameMode==='normal') ? currentChapter : 0; // [UPDATE 2026-07-10] 초반 챕터 완화용 — 일반 스테이지에서만 적용(무한던전 등은 currentChapter=1 고정 버그라 제외)
    window._stage1DmgEase = (gameMode==='normal' && stageId===1); // [UPDATE 2026-07-15] 튜토리얼용 — 스테이지1 한정 몬스터 공격력 대폭 완화
    if (window._dpsLog && window._dpsLog.length) {
      const DPS_WINDOW = 3.0;
      const cutoff = elapsed - DPS_WINDOW;
      let _li = 0;
      while (_li < window._dpsLog.length && window._dpsLog[_li].t < cutoff) _li++;
      if (_li > 0) window._dpsLog.splice(0, _li);
      const _sums = {};
      for (const e of window._dpsLog) _sums[e.k] = (_sums[e.k]||0) + e.d;
      const _disp = {};
      for (const k in _sums) _disp[k] = _sums[k] / DPS_WINDOW;
      window._dpsDisplay = _disp;
    }
    // [UPDATE 2026-07-10] hitEnemy() 우회 경로(체인/귀신손/신검 경로판정/장판aoe/독도트)용 DPS 기록 헬퍼
    window._trackDps = window._trackDps || function(srcType, dmg) {
      if (!srcType || !dmg) return;
      if (!window._dpsTotal) window._dpsTotal = {};
      window._dpsTotal[srcType] = (window._dpsTotal[srcType]||0) + dmg;
      if (!window._dpsLog) window._dpsLog = [];
      window._dpsLog.push({ t: window._gameElapsed||0, k: srcType, d: dmg });
    };
    if(player._invincible > 0) player._invincible -= dt;
    if(player.dead){endGame(false);return;}
    if(timeLeft<=0){timeLeft=0;endGame(false);return;}

    // ── 차원석 시간 소모: 60초마다 2개 차감 (시즌2 이후 전체) ──
    if (stageId >= 101) {
      _s2CwsDrainTimer += dt;
      if (_s2CwsDrainTimer >= 60) {
        _s2CwsDrainTimer -= 60;
        saveData.chaewonseok = Math.max(0, (saveData.chaewonseok || 0) - 2);
        Save.save(saveData);
        showFloatingText(player.x, player.y - 40, '🔷-2', '#ff8080');
        // 차원석 0이면 디버프 발동
        if (saveData.chaewonseok <= 0 && !_s2Debuff) {
          _s2Debuff = true;
          player._healBlocked = true;
          const isKo = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'ko' : true;
          showFloatingText(player.x, player.y - 60, isKo ? '💀 잠식 발동!' : '💀 Corrupted!', '#c060ff');
        }
      }
    }

    // ── 시즌2 잠식 디버프: 초당 최대HP 0.3% 감소 ──
    if (_s2Debuff && player._invincible <= 0) {
      player.hp = Math.max(1, player.hp - player.maxHp * 0.003 * dt);
    }

    // ── 모드별 게임 로직 ──
    if (gameMode === 'infinite') {
      // 무한 모드: 200킬마다 챕터 +1 (최대 ch10)
      const newChapter = Math.min(10, 1 + Math.floor(kills / 200));
      if (newChapter > currentChapter) {
        currentChapter = newChapter;
        Spawner.setChapter(currentChapter);
        const isKo = Lang.getCurrent()==='ko';
        showFloatingText(player.x, player.y - 60,
          isKo ? `⚠️ 챕터 ${currentChapter} 몬스터 출현!` : `⚠️ Ch.${currentChapter} Monsters!`,
          '#f0c040');
      }
    } else if (gameMode === 'boss_rush') {
      // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 고정 10마리 시퀀스 폐기 → 해금 챕터 풀을 무한 반복,
      // 등장 순번(bossRushIndex)을 wave로 넘겨 보스 1마리 등장마다 소폭 복리 강화(HP×1+n*0.12, DMG×1+n*0.08 — Boss 생성자 기존 공식 재사용)
      if (elapsed >= rushNextSpawnAt && rushBossPool.length) {
        const b = rushBossPool[bossRushIndex % rushBossPool.length];
        const _ang = Math.random()*Math.PI*2; // 기존 보스와 안 겹치도록 스폰 위치 분산
        const newBoss = new Boss(
          player.x+Math.cos(_ang)*220, player.y+Math.sin(_ang)*220,
          b.type, bossRushIndex, b.ch
        );
        newBoss._rushBossNum = bossRushIndex; // 처치 보상 스케일링용
        rushBosses.push(newBoss);
        bossRushIndex++;
        rushNextSpawnAt = elapsed + BOSS_RUSH_INTERVAL;
      }
    } else {
      // 일반 모드: 킬카운트 체크
      if(!killTargetReached&&kills>=killTarget){
        killTargetReached=true;
        if(isBossStage&&!bossSpawned){triggerBossWarning();return;}
        else if(!isBossStage){
          state='farming';
          farmingTimer=5.0;
          // 몬스터 스폰 중단 - 기존 몬스터만 처리
          enemies.forEach(e=>{ if(!e.dead) e.dead=true; });
          return;
        }
      }
    }

    const dir = autoMode > 0 ? getAutoDir() : Input.getDir();
    player.update(dt,dir);

    if(screenShake>0){
      screenShake-=dt*8;
      shakeX=(Math.random()-.5)*screenShake*6; shakeY=(Math.random()-.5)*screenShake*6;
    } else {shakeX=0;shakeY=0;}

    for(const pe of petEntities) pe.update(dt,player,enemies,projectiles,{xpOrbs,goldDrops,bigGoldDrops,soulDrops}); // [UPDATE 2026-07-11] 강다리 자동수집 AI용 아이템 배열 전달
    updateEnemyDebuffs(enemies,dt);

    if(boss && gameMode!=='boss_rush'){
      projectiles.push(...boss.update(dt,player,enemies));
      if(boss._summonPending){
        boss._summonPending=false;
        for(const sp of boss.summonSpots)
          enemies.push(new Enemy(sp.x,sp.y,'ghost',Math.floor(elapsed/20),true));
      }
      if(boss.dead&&boss.deathT>0.8){
        for(let i=0;i<12;i++)
          xpOrbs.push(new XpOrb(boss.x+(Math.random()-.5)*80,boss.y+(Math.random()-.5)*80,Math.floor(boss.xpVal/12)));
        // 보스 확정 bigGold 드랍 1~3개
        for(let _bi=0;_bi<1+Math.floor(Math.random()*3);_bi++){
          bigGoldDrops.push(new BigGoldDrop(
            boss.x+(Math.random()-0.5)*80,
            boss.y+(Math.random()-0.5)*80
          ));
        }
        // 보스 처치 확정 💎+1
        saveData.gems = (saveData.gems || 0) + 1;
        Save.save(saveData);
        showFloatingText(boss.x, boss.y - 80, '💎+1', '#c080ff');

        boss=null; window._boss=null; bossSpawned=false;

        // [UPDATE 2026-07-15] 보스 처치 직후에도 일반 스테이지의 킬타겟 달성과 동일하게 'farming' 상태로 전환.
        // 기존엔 setTimeout+state='playing' 유지라서, 보스가 흘린 XP를 먹으면 레벨업 카드가 또 뜨던 문제
        // (일반 스테이지 파밍 구간은 조용히 스탯만 오르도록 이미 설계돼 있었는데 보스 스테이지만 예외였음)
        enemies.forEach(e=>{ if(!e.dead) e.dead=true; });
        showFloatingText(player.x, player.y-60, (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en')?'🏆 Stage ends in 5s!':'🏆 5초 후 스테이지 종료!', '#f0d040');
        state='farming';
        farmingTimer=5.0;
        return;
      }
      for(const p of projectiles){
        if(!p.dead&&boss&&!boss.dead&&Math.hypot(boss.x-p.x,boss.y-p.y)<boss.size+p.radius){
          boss.takeDamage(p.damage); p.pierced++;
          if(p.pierced>(p.pierce||0)) p.dead=true;
          if(boss.dead) screenShake=2;
        }
      }
    }

    if(gameMode==='boss_rush' && rushBosses.length){
      // 보스 러쉬: 동시에 여러 마리 존재 가능. 처치해도 멈추지 않고 계속 진행.
      for(const rb of rushBosses){
        // 죽은 보스도 update()는 계속 호출해야 deathT(사망 연출 타이머)가 진행됨
        projectiles.push(...rb.update(dt,player,enemies));
        if(rb.dead) continue; // 사망 후에는 소환/충돌판정 등 전투 로직만 건너뜀
        if(rb._summonPending){
          rb._summonPending=false;
          for(const sp of rb.summonSpots)
            enemies.push(new Enemy(sp.x,sp.y,'ghost',Math.floor(elapsed/20),true));
        }
        for(const p of projectiles){
          if(!p.dead&&!rb.dead&&Math.hypot(rb.x-p.x,rb.y-p.y)<rb.size+p.radius){
            rb.takeDamage(p.damage); p.pierced++;
            if(p.pierced>(p.pierce||0)) p.dead=true;
            if(rb.dead) screenShake=2;
          }
        }
      }
      // 사망 처리 (방금 죽은 보스만 - deathT가 막 넘어간 시점)
      for(const rb of rushBosses){
        if(rb.dead && rb.deathT>0.8 && !rb._rewarded){
          rb._rewarded=true;
          for(let i=0;i<12;i++)
            xpOrbs.push(new XpOrb(rb.x+(Math.random()-.5)*80,rb.y+(Math.random()-.5)*80,Math.floor(rb.xpVal/12)));
          // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 등장 순번 기준 소폭 복리 다이아 보상(20마리≈275개, 40마리≈600개 목표로 캘리브레이션)
          // + bigGold(→_collectBigGold에서 추가 💎, 랜덤 보너스)
          const _gemReward = Math.max(1, Math.floor(12 + (rb._rushBossNum||0)*0.15));
          saveData=Save.load();
          saveData.gems=(saveData.gems||0)+_gemReward;
          window.earnedSpecial=(window.earnedSpecial||0)+_gemReward;
          saveData.bossrushRecord=Math.max(saveData.bossrushRecord||0, bossRushIndex); // [UPDATE 2026-07-12] 대소문자 버그 수정(bossRushRecord→bossrushRecord)
          Save.save(saveData);
          showFloatingText(rb.x,rb.y-70,'💎+'+_gemReward,'#c080ff');
          // 추가 bigGold 드랍 (1~2개, _rewardMode='bossrush'로 인해 💎로 전환됨)
          for(let _bi=0;_bi<1+Math.floor(Math.random()*2);_bi++){
            bigGoldDrops.push(new BigGoldDrop(rb.x+(Math.random()-0.5)*80, rb.y+(Math.random()-0.5)*80));
          }
        }
      }
      // 완전히 죽어서 연출까지 끝난 보스는 배열에서 제거
      rushBosses = rushBosses.filter(rb=>!(rb.dead && rb.deathT>1.5));
      // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 무한 확장형이라 시퀀스 소진에 의한 자동 종료 없음 — 플레이어 사망/시간초과로만 종료
    }

    window._enemies = enemies;
    if (!killTargetReached) Spawner.update(dt,elapsed,player,enemies,canvas.width,canvas.height,kills,saveData.dungeonUpgradeLv||0);

    const alive=enemies.filter(e=>!e.dead);
    // 무기는 주/보조 구분 없이 전부 보스도 조준 대상에 포함 (일반/보스러시 모두)
    // [UPDATE 2026-07-14] 260714_MTOPC.md 1번: 서브무기만 alive(보스 제외)로 분리돼있던 방치 버그 수정 —
    // 귀신손/번개장판 등 타겟선정형 서브무기가 보스전에서 일반몹 전멸 시 헛발질하던 문제
    const aliveWithBoss = (gameMode==='boss_rush' && rushBosses.length)
      ? [...alive, ...rushBosses.filter(rb=>!rb.dead)]
      : (boss && !boss.dead) ? [...alive, boss] : alive;
    for(const w of weapons){
      const _ps=w.tick(dt,player,aliveWithBoss); if(_ps?.length) projectiles.push(..._ps.filter(p=>p!=null));
    }
    for(const c of companions){const ps=c.update(dt,player,alive);if(ps?.length)projectiles.push(...ps.filter(p=>p!=null));}

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번②: 복수 애기씨(분신) — 체력 없음(피격 무시, enemies의 타겟 목록에
    // 애초에 포함 안 시켜서 자연히 무적), 본체 공격력의 40%로 가장 가까운 적을 공격
    for(const cl of aegissiClones){
      cl.atkCd = (cl.atkCd||0) - dt;
      let nearest=null, nd=Infinity;
      for(const e of alive){ const d=Math.hypot(e.x-cl.x,e.y-cl.y); if(d<nd){nd=d;nearest=e;} }
      if(nearest){
        const dist = nd||1;
        if(dist>60){ cl.x += (nearest.x-cl.x)/dist*140*dt; cl.y += (nearest.y-cl.y)/dist*140*dt; }
        else if(cl.atkCd<=0){
          cl.atkCd = 1.0;
          nearest.takeDamage(Math.max(1,Math.floor(player.totalAtk*0.4)), false, 'aegissi_clone');
          if(window._hitEffects) window._hitEffects.push({x:nearest.x,y:nearest.y,t:0,life:0.3,key:'hit_normal',ox:0,oy:-8});
        }
      } else {
        // 적 없으면 본체 근처로 배회 복귀
        const d2=Math.hypot(player.x-cl.x,player.y-cl.y);
        if(d2>80){ cl.x += (player.x-cl.x)/d2*100*dt; cl.y += (player.y-cl.y)/d2*100*dt; }
      }
    }

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 전투 로직
    _updateTransform(dt, alive);

    for(const e of enemies){
      if(!e.dead&&e._charmed>0){
        e._charmed-=dt;
        if(e._charmed<=0){ e._charmed=0; }
        else {
          // 현혹: 가장 가까운 비현혹 적을 타겟으로 이동
          const _ct=enemies.filter(x=>!x.dead&&!x._charmed&&x!==e)
            .sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];
          if(_ct){
            e.update(dt,_ct.x,_ct.y);
            if(e.hitTest(_ct.x,_ct.y,_ct.size)) _ct.takeDamage(e.damage*dt*3);
          } else {
            e.update(dt,e.x,e.y); // 타겟 없으면 제자리
          }
          continue; // 플레이어 공격 스킵
        }
      }
      // [UPDATE 2026-07-15] 260715_MTOPC.md 1번: 원거리 몹(attackPattern:'ranged')이 리턴하는 투사체를 캐치 —
      // 기존엔 리턴값을 아예 안 받아서 원거리 공격이 통째로 무효화되던 버그
      const _ep = e.update(dt,player.x,player.y);
      if(_ep && _ep.isEnemyProjectile) enemyProjs.push(_ep);
      if(!e.dead&&e.hitTest(player.x,player.y,14)){
        player.takeDamage(e.damage, e); // [UPDATE 2026-07-06] 명부강화 반사용 공격자 전달
        if(player.iframe>0.5) screenShake=1;
      }
    }

    // [UPDATE 2026-07-15] 260715_MTOPC.md 1번: 원거리 몹 투사체 이동/충돌/수명 처리 —
    // 배열/드로잉은 이미 있었지만 이 처리 로직 자체가 통째로 누락돼 있었음
    for(const ep of enemyProjs){
      if(ep.dead) continue;
      ep.x += ep.vx*dt; ep.y += ep.vy*dt;
      ep.t += dt; ep.life -= dt;
      if(ep.life<=0){ ep.dead=true; continue; }
      if(Math.hypot(player.x-ep.x, player.y-ep.y) < ep.radius+14){
        player.takeDamage(ep.damage);
        if(player.iframe>0.5) screenShake=1;
        ep.dead=true;
      }
    }

    for(const p of projectiles){
      if(!p) continue; // undefined 방어
      // 저승낫 바운스: 맞으면 가장 가까운 미히트 적으로 튕김, 데미지 5% 감소
      if(p._bounce){
        // 독침 트레일: 날아가면서 독 웅덩이 생성
        if(p._poisonTrail){
          p._trailTimer=(p._trailTimer||0)+dt;
          if(p._trailTimer>=0.12){
            p._trailTimer=0;
            projectiles.push(new Projectile(p.x,p.y,0,0,0,
              {radius:14,life:0.3,aoe:14,type:'poison_mist',
               color:'#80e040',glow:'rgba(80,200,30,.4)'}));
          }
        }
        // 가장 가까운 미히트 적 향해 서서히 유도
        const _hmTgt=enemies.filter(x=>!x.dead&&!p.chainHit.has(x))
          .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
        if(_hmTgt){
          const _sp=Math.hypot(p.vx,p.vy)||320;
          const _tAng=Math.atan2(_hmTgt.y-p.y,_hmTgt.x-p.x);
          let _dAng=_tAng-Math.atan2(p.vy,p.vx);
          while(_dAng>Math.PI)_dAng-=Math.PI*2;
          while(_dAng<-Math.PI)_dAng+=Math.PI*2;
          const _nAng=Math.atan2(p.vy,p.vx)+Math.sign(_dAng)*Math.min(Math.abs(_dAng),6.0*dt);
          p.vx=Math.cos(_nAng)*_sp; p.vy=Math.sin(_nAng)*_sp;
        }
        p.update(dt);
        for(const e of enemies){
          if(e.dead||p.chainHit.has(e)) continue;
          if(Math.hypot(e.x-p.x,e.y-p.y)<p.radius+e.size){
            e.takeDamage(p.damage);
            window._trackDps(p._srcType||p.type, p.damage); // [UPDATE 2026-07-10]
            if(p.slow){ e._slowed=p.slowDur||2.0; e._slowFactor=(1-p.slow); }
            if(p.dotDmg){ e._poison=p.dotDmg; e._poisonTick=p.dotTick||0.5; e._poisonDur=p.dotDur||3.0; e._poisonTimer=0; e._poisonSrc=p._srcType||p.type; }
            p.chainHit.add(e);
            p.damage=Math.max(1,Math.floor(p.damage*0.95));
            const _next=enemies.filter(x=>!x.dead&&!p.chainHit.has(x))
              .sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
            if(_next){
              const _dx=_next.x-p.x,_dy=_next.y-p.y,_d=Math.hypot(_dx,_dy)||1;
              const _sp=Math.hypot(p.vx,p.vy)||320;
              p.vx=(_dx/_d)*_sp; p.vy=(_dy/_d)*_sp;
              p.life=p._initLife||2.0;
            }
            break;
          }
        }
        continue;
      }
      // 귀신손: 첫 프레임에 반경 내 적 전부 1회 타격
      if(p._ghostHand){
        if(!p._ghHitDone){
          p._ghHitDone=true;
          for(const e of enemies){
            if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<p.radius+e.size){
              e.takeDamage(p.damage);
              window._trackDps(p._srcType||p.type, p.damage); // [UPDATE 2026-07-10]
            }
          }
        }
        p.update(dt); continue;
      }
      // 투척형 신검: 출발점~현재 위치 선분 판정으로 경로 전체 커버
      if(p._throwSword){
        if(!p._throwStopped || p._maxAlpha!==undefined){
          const hitW=p._throwHitWidth||8;
          let ox=p._originX??p.x, oy=p._originY??p.y;
          let ex2=p.x, ey2=p.y;
          // 잔상 정지 후: baseAng 방향으로 시각 길이(drawScaleY*16)만큼 양방향 확장
          if(p._throwStopped && p._maxAlpha!==undefined && typeof p.baseAng==='number'){
            const halfLen=(p.drawScaleY||1)*16;
            ox=p.x-Math.cos(p.baseAng)*halfLen;
            oy=p.y-Math.sin(p.baseAng)*halfLen;
            ex2=p.x+Math.cos(p.baseAng)*halfLen;
            ey2=p.y+Math.sin(p.baseAng)*halfLen;
          }
          for(const e of enemies){
            if(e.dead||p.chainHit.has(e)) continue;
            const _ex=e.x-ox, _ey=e.y-oy;
            const dx=ex2-ox, dy=ey2-oy;
            const lenSq=dx*dx+dy*dy||1;
            const t=Math.max(0,Math.min(1,(_ex*dx+_ey*dy)/lenSq));
            if(Math.hypot(e.x-(ox+t*dx),e.y-(oy+t*dy))<hitW+e.size){
              e.takeDamage(p.damage);
              window._trackDps(p._srcType||p.type, p.damage); // [UPDATE 2026-07-10]
              p.chainHit.add(e);
            }
          }
        }
        p.update(dt);
        continue;
      }
      if(p.aoe>0){
        // 데미지 판정은 생성 즉시 최대 반경 적용 (시각 확산 효과는 draw()에서 별도 처리되므로 서로 독립적)
        p.radius=p.aoe;
        for(const e of enemies){
          if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<p.radius+e.size){
            if(p.damage>0){
              const _aoeDmg=p.damage*dt*3;
              e.takeDamage(_aoeDmg);
              window._trackDps(p._srcType||p.type, _aoeDmg); // [UPDATE 2026-07-10]
            }
            // 저주 인형: 범위 내 적에게 받는 데미지 증폭 디버프
            if(p.debuffMult&&p.debuffDur){
              e._markedDmgMult=p.debuffMult;
              e._markedDur=p.debuffDur;
            }
            if(p.charmDur&&!e.isBoss){
              const _alreadyCharmed=enemies.filter(x=>!x.dead&&x._charmed>0).length;
              if(_alreadyCharmed<2) e._charmed=p.charmDur;
            }
          }
        }
        p.update(dt);continue;
      }
      // 호밍: 가장 가까운 적 방향으로 서서히 꺾임
      if(p._homing){
        const ht=findNearestEnemies(p.x,p.y,enemies.filter(e=>!e.dead),1)[0];
        if(ht){
          const hdx=ht.x-p.x,hdy=ht.y-p.y;
          const sp=Math.hypot(p.vx,p.vy);
          const tAng=Math.atan2(hdy,hdx);
          let dAng=tAng-Math.atan2(p.vy,p.vx);
          while(dAng>Math.PI)dAng-=Math.PI*2;
          while(dAng<-Math.PI)dAng+=Math.PI*2;
          const turnRate=p._homingVeryWeak?0.6:p._homingWeak?1.2:5.0; // [UPDATE 2026-07-09] 신궁 기본공격(아주 약함)/초월8성(약함) 단계별 회전 속도
          const turn=Math.sign(dAng)*Math.min(Math.abs(dAng),turnRate*dt);
          const nAng=Math.atan2(p.vy,p.vx)+turn;
          p.vx=Math.cos(nAng)*sp; p.vy=Math.sin(nAng)*sp;
        }
      }
      p.update(dt);
      for(const e of enemies){
        if(!e.dead){
          const hit = p.hitEnemy(e);
          // 신궁 특강: 명중 시 분열 (남은 분열 횟수만큼 반복 가능)
          if(hit && p._splitLevel>0){
            const sp=Math.hypot(p.vx,p.vy);
            // 가장 가까운 적 2개 찾아서 각각 조준
            const targets=findNearestEnemies(p.x,p.y,enemies.filter(e=>!e.dead),2);
            if(targets.length===0) targets.push({x:p.x,y:p.y-1});
            if(targets.length===1) targets.push({x:p.x+10,y:p.y-1});
            targets.forEach(tgt=>{
              const dx=tgt.x-p.x,dy=tgt.y-p.y,d=Math.hypot(dx,dy)||1;
              const child=new Projectile(p.x,p.y,
                (dx/d)*sp*0.9,(dy/d)*sp*0.9,
                Math.floor(p.damage*0.85),
                {pierce:1,radius:p.radius,life:1.2,type:'bow',
                 _splitLevel:p._splitLevel-1,
                 _maxAlpha:0.5+(p._splitLevel-1)*0.1,
                 color:'#ffe060',glow:'rgba(255,220,60,.6)'});
              projectiles.push(child);
            });
          }
          // 각성 무당지팡이: orb 명중 시 AOE 폭발
          if(hit && p._explodeOnOrbHit){
            const expl = new Projectile(p.x, p.y, 0, 0,
              Math.floor(p.damage*2.5),
              {aoe:70, life:0.4, type:'staff',
               color:'#c060ff', glow:'rgba(180,60,255,.8)'});
            projectiles.push(expl);
            p.dead = true;
          }
        }
        if(p.dead) break;
      }
    }

    for(const o of xpOrbs){
      o.update(dt,player.x,player.y,player.magnetRange);
      if(o.dead&&player.gainXp(Math.floor(o.value*(player._xpMult||1)))) triggerLevelUp();
    }

    // ── 골드 업데이트 ──
    for(const b of bigGoldDrops){
      b.update(dt,player.x,player.y,player.magnetRange);
      if(b.dead){ _collectBigGold(b); }
    }
    bigGoldDrops=bigGoldDrops.filter(b=>!b.dead);

    for(const g of goldDrops){
      g.update(dt,player.x,player.y,player.magnetRange);
      if(g.dead) applyItemEffect(g,player,enemies,saveData,xpOrbs,goldDrops);
    }

    // [UPDATE 2026-07-11] 영혼 드랍(시즌2)이 일반 루프에선 전혀 업데이트 안 되던 버그 수정 — 자석/술신 자동수집이 안 먹히던 원인
    for(const sd of soulDrops){
      sd.update(dt,player.x,player.y,player.magnetRange);
      if(sd.dead) _collectSoulDrop(sd);
    }
    soulDrops=soulDrops.filter(sd=>!sd.dead);

    // ── 스페셜 아이템 업데이트 (자석 무효, 직접 밟기) ──
    for(const s of specialItems){
      s.update(dt,player.x,player.y);
      if(s.dead){
        applyItemEffect(s,player,enemies,saveData,xpOrbs,goldDrops);
        // 자석 발동 시 영혼 드랍도 흡수
        if(s.type==='magnet') for(const sd of soulDrops) sd.magnetPull();
      }
    }

    // 죽은 적 → 드롭 생성 (counted 플래그로 중복 방지)
    const newDead=enemies.filter(e=>e.dead&&!e._counted);
    for(const e of newDead){
      e._counted=true;  // 한 번만 카운트
      kills++;
      // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 — 시즌3 스테이지 한정 드랍 (0.5% → 5%, 너무 안 나온다는 피드백)
      if (gameMode==='normal' && stageId>=201 && stageId<=300 && Math.random() < 0.05) {
        const cardType = ['card_dokkaebi','card_gumiho','card_gogolgwi'][Math.floor(Math.random()*3)];
        specialItems.push(new SpecialItem(e.x, e.y, cardType));
      }
      const drops=createDrops(e.x,e.y,e.xpValue,e.goldValue,_rewardMode);
      if(drops.xp){
        const cnt=Math.ceil(e.xpValue/2);
        for(let i=0;i<cnt;i++)
          xpOrbs.push(new XpOrb(
            e.x+(Math.random()-.5)*20,
            e.y+(Math.random()-.5)*20,
            Math.ceil(e.xpValue/cnt)
          ));
      }
      // [UPDATE 2026-07-17] 시즌2 전용이던 특화 드랍(골드→차원석, 빅골드→영혼석, 영혼조각)을
      // 시즌2 이후 전체로 확장 — 시즌3에서 갑자기 평범한 골드 경제로 되돌아가던 문제 수정
      const _isSeason2Stage = (stageId >= 101);
      if (_isSeason2Stage) {
        for (const g of drops.gold) {
          if (Math.random() < 0.10) bigGoldDrops.push(new BigGoldDrop(g.x, g.y, 'chaewonseok'));
          else if (Math.random() < 0.15) soulDrops.push(new SoulDrop(g.x, g.y, 'soulFragment'));
        }
        // 빅골드 슬롯 → 영혼석으로 대체
        if (drops.bigGold) for (const b of drops.bigGold)
          soulDrops.push(new SoulDrop(b.x, b.y, 'soulStone'));
      } else if (!_rewardMode || _rewardMode==='infinite') {
        for(const g of drops.gold) goldDrops.push(g);
        if(drops.bigGold) for(const b of drops.bigGold) bigGoldDrops.push(b);
      } else {
        if(drops.bigGold) for(const b of drops.bigGold) bigGoldDrops.push(b);
      }
      for(const s of drops.special) specialItems.push(s);

      // [UPDATE 2026-07-17] 260713_MTOPC.md 9번④: 글리치 "분열" modifier — 처치 시 절반체력 미니 몬스터 2체로 분열(1회만)
      if (e._glitchSplit && !e._glitchSplitDone) {
        e._glitchSplitDone = true;
        for (let i = 0; i < 2; i++) {
          const mini = new Enemy(
            e.x + (Math.random()-0.5)*30, e.y + (Math.random()-0.5)*30,
            e.type, Math.max(0, Math.floor(elapsed/20)-1), gameMode !== 'normal', 1
          );
          mini.hp = mini.maxHp = Math.max(1, Math.floor(e.maxHp/2));
          mini.size = Math.floor(e.size*0.65);
          enemies.push(mini);
        }
      }
    }

    // 플로팅 텍스트 / 폭탄 이펙트
    floatingTexts=updateFloatingTexts(dt);
    bombEffects=updateBombEffects(dt);

    // ── 번개 연쇄 처리 ──
    const chainProjs=[];
    for(const p of projectiles){
      if(p.dead&&p.chain>0&&EVOLVED_WEAPON_DEFS.talisman_evo){
        const cp=EVOLVED_WEAPON_DEFS.talisman_evo.processChain(p,enemies.filter(e=>!e.dead));
        chainProjs.push(...cp);
      }
    }
    projectiles.push(...chainProjs);

    // ── 저주 인형 디버프 타이머 ──
    for(const e of enemies){
      if(e.dead||!e._markedDur) continue;
      e._markedDur-=dt;
      if(e._markedDur<=0){ e._markedDmgMult=1; e._markedDur=0; }
    }

    // ── 독 도트 데미지 ──
    for(const e of enemies){
      if(e.dead||!e._poison) continue;
      e._poisonTimer=(e._poisonTimer||0)+dt;
      e._poisonDur-=dt;
      if(e._poisonDur<=0){ e._poison=0; e._poisonTimer=0; continue; }
      if(e._poisonTimer>=e._poisonTick){
        e.takeDamage(e._poison);
        window._trackDps(e._poisonSrc||'poison', e._poison); // [UPDATE 2026-07-10]
        e._poisonTimer=0;
      }
    }

    // ── 토네이도 흡입 ──
    for(const p of projectiles){
      if(!p.dead&&p._tornado){
        p._elapsed=(p._elapsed||0)+dt;
        // travelTime 경과 후 정지
        if(p._elapsed>=p._travelTime){ p.vx=0; p.vy=0; }
        for(const e of enemies){
          if(e.dead) continue;
          const dx=p.x-e.x, dy=p.y-e.y;
          const dist=Math.hypot(dx,dy)||1;
          if(dist<p._pullRange&&dist>8){
            // 정지 후엔 2배 강하게
            const mult = p._elapsed>=p._travelTime ? 2.0 : 1.0;
            const force=p._pullForce*mult*(1-dist/p._pullRange)*dt;
            e.x+=dx/dist*force;
            e.y+=dy/dist*force;
          }
        }
      }
    }

    // ── 슬로우 적용 ──
    for(const e of enemies){
      if(e._slowed>0){
        e._slowed-=dt;
        const _baseSpd=ENEMY_TYPES[e.type]?.speed||55;
        e.speed=_baseSpd*(e._slowFactor??0.5);
      } else if(e._slowed<=0&&e._slowed!==undefined){
        e.speed=ENEMY_TYPES[e.type]?.speed||55;
        e._slowFactor=undefined;
      }
    }

    // [UPDATE 2026-07-08] 영혼낫 초월 8성: 소멸하는 낫에서 잔상 폭발 생성
    for(const p of projectiles){
      if(p&&p.dead&&p._transcendBurst){
        p._transcendBurst=false;
        projectiles.push(new Projectile(p.x,p.y,0,0,p._burstDmg||0,
          {orb:true,pierce:99,radius:(p.radius||20)*1.6,life:0.12,type:'scythe',
           color:'#a0ffc0',glow:'rgba(160,255,190,.8)'}));
      }
    }
    enemies=enemies.filter(e=>!(e.dead&&e.deathT>0.5));
    projectiles=projectiles.filter(p=>p&&!p.dead);
    xpOrbs=xpOrbs.filter(o=>!o.dead);
    goldDrops=goldDrops.filter(d=>!d.dead);
    specialItems=specialItems.filter(s=>!s.dead);
    enemyProjs=enemyProjs.filter(p=>!p.dead);
    // 피격 이펙트 업데이트
    if(window._hitEffects){
      for(const h of window._hitEffects) h.t+=dt;
      window._hitEffects=window._hitEffects.filter(h=>h.t<h.life);
    }

    for(const o of bgOrbs){o.t+=dt;o.x+=Math.sin(o.t*.7)*o.spd*dt;o.y+=Math.cos(o.t*.5)*o.spd*dt;}
  }

  function _getFloorColor() {
    // _rewardMode 먼저 체크 (재화 던전은 mode='infinite'라서 gameMode 체크보다 앞에 와야 함)
    if (_rewardMode === 'ganghwaseok') return '#1a1510';
    if (_rewardMode === 'cheonunseok') return '#001828';
    if (_rewardMode === 'cheonryeonggwa') return '#0a180a';
    if (_rewardMode === 'taegeukseok') return '#200e00';
    if (_rewardMode === 'infinite' || gameMode === 'infinite') return '#0a0030';
    if (_rewardMode === 'bossrush' || gameMode === 'boss_rush') return '#2a0000';
    // [UPDATE 2026-07-08] 시즌2(유명계, 챕터11+) 전용 팔레트 — 시즌1(현계) 갈색톤과 구분되는 보라/자주 계열
    if (currentChapter > 10) {
      if (difficulty === 'hard') return '#2a0f30';
      if (difficulty === 'normal') return '#362850';
      return '#4a3a6b'; // easy
    }
    if (difficulty === 'hard') return '#3d0f0f';
    if (difficulty === 'normal') return '#6b3d1a';
    return '#8b5a2b'; // easy
  }

  function render(){
    const W=canvas.width,H=canvas.height; if(!W||!H) return;
    const PANEL_W=46;
    ctx.save();
    ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip();
    const vw=W/zoom, vh=H/zoom;
    const camX=player.x-vw/2+shakeX/zoom, camY=player.y-vh/2+shakeY/zoom;
    ctx.fillStyle=_getFloorColor(); ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.scale(zoom,zoom);
    const sz=80,ox=((-camX)%sz+sz)%sz,oy=((-camY)%sz+sz)%sz;
    ctx.strokeStyle='rgba(255,255,255,0.022)';ctx.lineWidth=1;
    for(let x=ox;x<vw;x+=sz){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,vh);ctx.stroke();}
    for(let y=oy;y<vh;y+=sz){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(vw,y);ctx.stroke();}
    for(const o of bgOrbs){
      const sx=o.x-camX,sy=o.y-camY;
      if(sx<-60||sx>W+60||sy<-60||sy>H+60)continue;
      ctx.save();ctx.globalAlpha=.28+Math.sin(o.t*2)*.1;
      const g=ctx.createRadialGradient(sx,sy,0,sx,sy,o.r*3);
      g.addColorStop(0,o.color);g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,o.r*3,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    // ── 바닥 장식 소품 랜덤 배치 (맵별 스프라이트 세트) ──
    {
      const T = SPRITES.tiles;
      const S = SPRITES.stage || {};
      const DUNGEON_TEX = ['dirt_tex_light','dirt_tex_dark'];
      const _tileSetDef = (() => {
        // _rewardMode 먼저 체크 (재화 던전은 mode='infinite'라서 순서 중요)
        if (_rewardMode === 'ganghwaseok') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['forge_ember','forge_anvil','forge_soot'],
        };
        if (_rewardMode === 'cheonunseok') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['sky_star','sky_gem','sky_spark'],
        };
        if (_rewardMode === 'cheonryeonggwa') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['grove_leaf','grove_herb','grove_fruit'],
        };
        if (_rewardMode === 'taegeukseok') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['shrine_cloth','shrine_silk','shrine_incense'],
        };
        if (_rewardMode === 'infinite' || gameMode === 'infinite') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['inf_stone','inf_stones','inf_grass','inf_dark_grass','inf_blue_grass'],
        };
        if (_rewardMode === 'bossrush' || gameMode === 'boss_rush') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['boss_b','boss_chain','boss_skull','boss_crack'],
        };
        // 일반 스테이지 (난이도별 소품 세트)
        // [UPDATE 2026-07-08] 시즌2(유명계, 챕터11+) 전용 데코셋 — 시즌1(현계) 자연물과 구분되는 무덤/유골/도깨비불 테마
        const stageSets = {
          easy:   ['easy_a','easy_b','easy_c','easy_d','stone_tan','grass_blue'],
          normal: ['normal_a','normal_b','stone_dark','stone_cracked','grass_dark'],
          hard:   ['hard_a','hard_b','hard_c','hard_d','grass_black','stone_dark2','dirt_dark'],
        };
        const stageSets2 = {
          easy:   ['s2_easy_a','tombstone_gray','bone_pile'],
          normal: ['s2_normal_a','s2_normal_b','bone_pile2'],
          hard:   ['s2_hard_a','skull_pile','tombstone_gray','bone_pile2'],
        };
        // [UPDATE 2026-07-08] 시즌2 전용 흙 텍스처 분기 — 시즌1(현계) 갈색 텍스처와 색 충돌 해결
        const STAGE_TEX = (currentChapter > 10 ? ['s2_dirt_tex_light','s2_dirt_tex_dark'] : ['dirt_tex_light','dirt_tex_dark']);
        return {
          texKey: (currentChapter > 10 ? null : 'deco_dirt_texture'), decoNS: S, // [UPDATE 2026-07-08] 시즌2는 흙질감 우선 레이어 미사용 (STAGE_TEX 소품만으로 충분, 사용자 확정)
          texDecoKeys: STAGE_TEX, texDecoNS: T,
          decoKeys: (currentChapter > 10 ? stageSets2[difficulty] : stageSets[difficulty]) || stageSets.easy,
        };
      })();

      const cacheKey = gameMode + '_' + (_rewardMode || difficulty) + (currentChapter > 10 ? '_s2' : '_s1'); // [UPDATE 2026-07-08] 시즌 구분 추가 (안 하면 시즌1/2 소품 캐시 충돌)
      if (!_tileCache[cacheKey]) {
        try {
          const _decoNS    = _tileSetDef.decoNS    || T;
          const _texDecoNS = _tileSetDef.texDecoNS || T;
          // decoKeys → decoNS, texDecoKeys → texDecoNS, texKey → 항상 T
          const getDecoImg = k => _decoNS[k]    ? SpriteLoader.get(_decoNS[k].src)    : null;
          const getTexImg  = k => T[k]           ? SpriteLoader.get(T[k].src)          : null;
          const getTexDecoImg = k => _texDecoNS[k] ? SpriteLoader.get(_texDecoNS[k].src) : null;
          const isLoaded = img => img && img.complete && img.naturalWidth > 0;
          const decos = _tileSetDef.decoKeys.map(getDecoImg).filter(isLoaded);
          const texDecos = (_tileSetDef.texDecoKeys || []).map(getTexDecoImg).filter(isLoaded);
          let texRotated = null;
          if (_tileSetDef.texKey && T[_tileSetDef.texKey]) {
            const dtex = getTexImg(_tileSetDef.texKey);
            if (isLoaded(dtex)) {
              texRotated = [0,1,2,3].map(r => {
                const oc = document.createElement('canvas');
                const side = Math.max(dtex.width, dtex.height); // [UPDATE 2026-07-08] 정사각형이 아닌 이미지가 90/270도 회전 시 잘리는 버그 수정 (긴 변 기준 정사각 캔버스)
                oc.width = side; oc.height = side;
                const c2 = oc.getContext('2d');
                c2.translate(side/2, side/2);
                c2.rotate(r * Math.PI / 2);
                c2.drawImage(dtex, -dtex.width/2, -dtex.height/2);
                return oc;
              });
            }
          }
          // 모든 이미지가 준비됐을 때만 캐시 확정 (일부만 로드된 상태로 굳는 버그 방지)
          const expectDecos = _tileSetDef.decoKeys.length;
          const expectTex   = (_tileSetDef.texDecoKeys || []).length;
          if (decos.length === expectDecos && texDecos.length === expectTex)
            _tileCache[cacheKey] = { decos, texDecos, texRotated };
        } catch(e) { _tileCache[cacheKey] = false; }
      }

      const isDungeon = _rewardMode !== null || gameMode === 'infinite' || gameMode === 'boss_rush';

      ctx.fillStyle = _getFloorColor();
      ctx.fillRect(0, 0, vw, vh);

      if (_tileCache[cacheKey]) {
        const { decos, texDecos, texRotated } = _tileCache[cacheKey];
        const CS = 96;
        const cx0 = Math.floor(camX/CS)-1, cy0 = Math.floor(camY/CS)-1;
        const cx1 = Math.ceil((camX+vw)/CS)+1, cy1 = Math.ceil((camY+vh)/CS)+1;
        for (let cy = cy0; cy <= cy1; cy++) {
          for (let cx = cx0; cx <= cx1; cx++) {
            let h = ((cx*1664525)+(cy*1013904223))>>>0;
            h = (h^(h>>>16))>>>0;
            h = ((h*2246822519)>>>0);
            h = (h^(h>>>13))>>>0;
            const ox = ((h>>>4)%48)-24;
            const oy = ((h>>>8)%48)-24;
            const dx = cx*CS+CS/2+ox-camX;
            const dy = cy*CS+CS/2+oy-camY;
            const roll = h & 0x1F; // 0~31
            if (texRotated && roll < 5) {
              // 스테이지: 흙질감 회전 타일 (5~200% 스케일)
              const tex = texRotated[(h>>>5)%4];
              const scale = 0.05 + ((h>>>20)%196)/100;
              const sw = tex.width*scale, sh = tex.height*scale;
              ctx.globalAlpha = currentChapter > 10 ? 0.5 : 0.7; // [UPDATE 2026-07-08] 시즌2는 바닥과 명도 대비가 커서 알파 낮춤
              ctx.drawImage(tex, dx-sw/2, dy-sh/2, sw, sh);
              ctx.globalAlpha = 1;
            } else if (texDecos.length > 0 && roll < (isDungeon ? 6 : 11)) {
              // 흙질감 소품 (던전: 5~80% 0.5알파 / 스테이지: 5~200% 0.65알파, 시즌2는 대비 완화를 위해 알파 하향)
              const td = texDecos[(h>>>6)%texDecos.length];
              const scale = isDungeon
                ? 0.05 + ((h>>>20)%76)/100
                : 0.05 + ((h>>>20)%196)/100;
              const sw = td.width*scale, sh = td.height*scale;
              ctx.globalAlpha = currentChapter > 10 ? (isDungeon ? 0.35 : 0.45) : (isDungeon ? 0.5 : 0.65); // [UPDATE 2026-07-08]
              ctx.drawImage(td, dx-sw/2, dy-sh/2, sw, sh);
              ctx.globalAlpha = 1;
            } else if (decos.length > 0 && roll < (isDungeon ? 16 : 19)) {
              // 소품 (던전: 5~80% 0.4알파 / 스테이지: 5~80% 0.75알파)
              const deco = decos[(h>>>10)%decos.length];
              const scale = 0.05 + ((h>>>20)%76)/100;
              const sw = deco.width*scale, sh = deco.height*scale;
              ctx.globalAlpha = isDungeon ? 0.4 : 0.75;
              ctx.drawImage(deco, dx-sw/2, dy-sh/2, sw, sh);
              ctx.globalAlpha = 1;
            }
          }
        }
      }
    }
    // 장판형 이펙트(도깨비불/독안개 등 aoe 보유)는 아이템보다 먼저 그려서 골드/영혼석이 안 가리게 함
    for(const p of projectiles) if(p&&p.aoe>0) p.draw(ctx,camX,camY);
    for(const o of xpOrbs)     o.draw(ctx,camX,camY);
    for(const b of bigGoldDrops) b.draw(ctx,camX,camY);
    for(const sd of soulDrops) sd.draw(ctx,camX,camY);
    for(const g of goldDrops)   g.draw(ctx,camX,camY);
    for(const s of specialItems) s.draw(ctx,camX,camY);
    for(const c of companions) c.draw(ctx,camX,camY,companionImg);
    for(const e of enemies)    e.draw(ctx,camX,camY);
    if(boss) boss.draw(ctx,camX,camY);
    for(const rb of rushBosses) rb.draw(ctx,camX,camY);
    for(const p of projectiles) if(!p||!(p.aoe>0)) p.draw(ctx,camX,camY);
    for(const pe of petEntities) pe.draw(ctx,camX,camY);
    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번②: 복수 애기씨 분신 — 본체 스프라이트를 반투명 보라빛으로 재사용
    for(const cl of aegissiClones){
      const csx=cl.x-camX, csy=cl.y-camY;
      ctx.save();
      ctx.globalAlpha=0.55;
      if(player.img && player.img.complete && player.img.naturalWidth>0){
        ctx.filter='hue-rotate(220deg) saturate(1.4)';
        ctx.drawImage(player.img, csx+(player.spriteOX||-14), csy+(player.spriteOY||-28), player.spriteW||28, player.spriteH||36);
        ctx.filter='none';
      } else {
        ctx.fillStyle='#a060e0';
        ctx.beginPath(); ctx.arc(csx,csy,14,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
    player.draw(ctx,camX,camY);
    _drawElementTrinityOrbit(ctx,camX,camY); // [UPDATE 2026-07-11] 삼위일체 궤도 시각효과
    drawBombEffects(ctx,camX,camY,bombEffects);
    _drawHitEffects(ctx,camX,camY);
    _drawEnemyProjs(ctx,camX,camY);
    drawFloatingTexts(ctx,camX,camY,floatingTexts);
    // ── 줌 영역 끝 ──
    ctx.restore();

    // HUD / 조이스틱은 줌 제외 (항상 같은 크기)
    Input.drawJoystick(ctx,W,H);
    ctx.restore();
    drawHUD(W,H);
    if(boss&&!boss.dead) drawBossHPBar(W,H,boss,0);
    if(gameMode==='boss_rush'){
      let _barY=0;
      for(const rb of rushBosses){
        if(rb.dead) continue;
        drawBossHPBar(W,H,rb,_barY);
        _barY+=48; // 다음 체력바를 아래로 이어서 표시
      }
    }
    if(state==='farming'){
      const _ft=Math.max(0,farmingTimer);
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,W,64);
      ctx.textAlign='center';
      ctx.font='bold 18px sans-serif';
      ctx.fillStyle='#f0d040';
      const _clrEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      ctx.fillText(_clrEn?'🏆 Stage Clear!':'🏆 스테이지 클리어!',W/2,26);
      ctx.font='13px sans-serif';
      ctx.fillStyle='#e8dcc8';
      ctx.fillText(_clrEn?`Back to lobby in ${Math.ceil(_ft)}s — loot up!`:Math.ceil(_ft)+'초 후 로비 이동 — 파밍하세요!',W/2,50);
      ctx.textAlign='left';
      ctx.restore();
      if(_ft<=0) endGame(true);
    }
    if(state==='dead')    drawResultOverlay(W,H,false);
    if(state==='victory') drawResultOverlay(W,H,true);

    // 스테이지 인트로 텍스트 (0~1.5초)
    if (gameMode === 'normal' && elapsed < 1.5 && stageId) {
      const alpha = elapsed < 0.5 ? elapsed/0.5 : elapsed > 1.2 ? (1.5-elapsed)/0.3 : 1;
      const si = getStageInfo(stageId);
      const chData = GAME_DATA.stages.find(c=>c.stages.some(s=>s.id===stageId));
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px sans-serif';
      const _isEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      ctx.fillStyle = 'rgba(200,160,255,0.8)';
      ctx.fillText((_isEn?(chData?.nameEn||chData?.name):chData?.name) || '', W/2, H/2 - 18);
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#f0e8c8';
      ctx.fillText((_isEn?(si?.nameEn||si?.name):si?.name) || '', W/2, H/2 + 6);
      ctx.restore();
    }

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번①: 도깨비주사위 결과 표시 (스테이지 인트로 텍스트 종료 직후 1.6~4.5초)
    if (_dokkaebiDiceResult && elapsed >= 1.6 && elapsed < 4.5) {
      const dAlpha = elapsed < 2.0 ? (elapsed-1.6)/0.4 : elapsed > 4.0 ? (4.5-elapsed)/0.5 : 1;
      const _isEnD = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      ctx.save();
      ctx.globalAlpha = Math.max(0, dAlpha);
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#ffd870';
      ctx.fillText(`🎲 ${_dokkaebiDiceResult.icon}`, W/2, H/2 + 50);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#f0e8c8';
      ctx.fillText(_isEnD ? _dokkaebiDiceResult.textEn : _dokkaebiDiceResult.textKo, W/2, H/2 + 74);
      ctx.restore();
    }

    // [UPDATE 2026-07-17] 도깨비주사위 효과가 런 내내 지속되는데 처음 몇 초만 보여주고 사라져서 뭘 먹었는지
    // 까먹기 쉽다는 피드백 — 우측 하단(줌 버튼 위)에 작게 상시 표시
    // [UPDATE 2026-07-17] 좌표가 줌 버튼 wrap(bottom:90px, 버튼2개+간격=78px → 하단기준 90~168px 구간)과
    // 겹쳐서(기존 하단기준 136~176px) 실기기에서 배지가 줌 버튼에 포개지는 버그 — 줌 버튼 위로 여유있게 이동
    if (_dokkaebiDiceResult) {
      const _isEnD2 = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      const bx = W - 74, by = H - 224, bw = 64, bh = 40;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,216,112,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#ffd870';
      ctx.fillText(`🎲${_dokkaebiDiceResult.icon}`, bx+bw/2, by+20);
      ctx.font = '8px sans-serif';
      ctx.fillStyle = 'rgba(240,232,200,0.85)';
      const _shortTxt = (_isEnD2 ? _dokkaebiDiceResult.textEn : _dokkaebiDiceResult.textKo).split(/[—-]/)[0].trim();
      ctx.fillText(_shortTxt, bx+bw/2, by+33);
      ctx.restore();
    }
  }



  function drawHUD(W,H){
    const _aliveRushBosses = gameMode==='boss_rush' ? rushBosses.filter(rb=>!rb.dead).length : 0;
    const topH=(boss&&!boss.dead)?92:(_aliveRushBosses>0?(58+_aliveRushBosses*48):58);
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,topH);
    const BAR=Math.min(72,W*.23);
    ctx.fillStyle='#300';ctx.fillRect(10,10,BAR,7);
    ctx.fillStyle=player.hp>player.maxHp*.3?'#c03020':'#ff2020';
    ctx.fillRect(10,10,BAR*(player.hp/player.maxHp),7);
    ctx.fillStyle='#e8dcc8';ctx.font='bold 9px sans-serif';
    ctx.fillText(`❤️ ${Math.ceil(player.hp)}/${player.maxHp}`,13,18);
    ctx.fillStyle='#001828';ctx.fillRect(10,21,BAR,4);
    ctx.fillStyle='#40c0ff';ctx.fillRect(10,21,BAR*(player.xp/player.xpNext),4);
    ctx.fillStyle='#f0c040';ctx.font='bold 12px sans-serif';
    ctx.fillText(`Lv.${player.level}`,BAR+10,21);
    const min=Math.floor(timeLeft/60),sec=Math.floor(timeLeft%60);
    ctx.textAlign='center';ctx.font='bold 16px sans-serif';
    ctx.fillStyle=timeLeft<30?'#ff4040':'#e8dcc8';
    ctx.fillText(`${min}:${sec.toString().padStart(2,'0')}`,W/2,20);
    // 스테이지/던전 이름 + 난이도 표시
    if (gameMode==='normal' && stageId) {
      const si = getStageInfo(stageId);
      const _isEnHud = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      const _chData = si ? GAME_DATA.stages.find(c=>c.stages.some(s=>s.id===stageId)) : null;
      const chName = _chData ? (_isEnHud?(_chData.nameEn||_chData.name):_chData.name) : '';
      const _siName = si ? (_isEnHud?(si.nameEn||si.name):si.name) : '';
      const diffLabel = _isEnHud
        ? {easy:'🌿Easy', normal:'⚔️Normal', hard:'🔥Hard'}[difficulty]||''
        : {easy:'🌿이지', normal:'⚔️노말',   hard:'🔥하드'}[difficulty]||'';
      const label = si ? `${stageId}. ${chName} · ${_siName}  ${diffLabel}` : ''; // [UPDATE 2026-07-10] 몇 번 맵인지 스테이지 번호 표시
      ctx.font='10px sans-serif';
      ctx.fillStyle='rgba(200,180,255,0.6)';
      ctx.fillText(label, W/2, 32);
    }
    ctx.textAlign='left';
    // 킬카운트 바
    const kR=Math.min(kills/killTarget,1),kBW=Math.min(180,W*.42),kBH=8,kBX=W/2-kBW/2,kBY=38;
    ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(kBX,kBY,kBW,kBH);
    ctx.fillStyle=killTargetReached&&isBossStage?(Math.floor(elapsed*4)%2===0?'#ff4040':'#ff8040')
      :(kR>=1?'#60ff60':'#f0c040');
    ctx.fillRect(kBX,kBY,kBW*kR,kBH);
    ctx.textAlign='center';ctx.font='bold 9px sans-serif';
    ctx.fillStyle=killTargetReached?'#60ff60':'#e8dcc8';
    ctx.fillText(killTargetReached&&isBossStage?(Lang.getCurrent()==='ko'?'⚔️ 보스를 처치하라!':'⚔️ Defeat the Boss!'):(Lang.getCurrent()==='ko'?`처치 ${kills} / ${killTarget}`:`Kills ${kills} / ${killTarget}`),W/2,kBY+kBH+9);
    ctx.textAlign='left';

    // ── 특화 재화 카운터 (특화 던전 전용) ──
    if (_rewardMode && SPECIAL_ICONS[_rewardMode]) {
      const icon = SPECIAL_ICONS[_rewardMode];
      const count = window.earnedSpecial || 0;
      const text = `${icon} ${count}`;
      ctx.font = 'bold 14px sans-serif';
      const tw = ctx.measureText(text).width;
      const rx = W - tw - 14, ry = 110; // 일시정지 버튼(top:56 + h:36 + gap:18) 아래
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath(); ctx.roundRect(rx - 6, ry - 13, tw + 12, 20, 6); ctx.fill();
      ctx.fillStyle = '#c0e0ff';
      ctx.textAlign = 'right';
      ctx.fillText(text, W - 8, ry);
      ctx.textAlign = 'left';
    }

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 지속시간 배지
    if (_transformType) {
      const _tIcon = { dokkaebi:'👹', gumiho:'🦊', gogolgwi:'💀' }[_transformType] || '✨';
      const text = `${_tIcon} ${Math.ceil(_transformTimer)}s`;
      ctx.font = 'bold 13px sans-serif';
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.roundRect(W/2 - tw/2 - 8, 96, tw+16, 20, 6); ctx.fill();
      ctx.fillStyle = '#ffd070';
      ctx.textAlign = 'center';
      ctx.fillText(text, W/2, 111);
      ctx.textAlign = 'left';
    }

    // ── 왼쪽 세로 슬롯 패널 ──
    const SLOT_W=38, SLOT_H=38, SLOT_X=4, SLOT_GAP=3;
    const slotImgMain = SpriteLoader.get(SPRITES.slots.main.src);
    const slotImgSub  = SpriteLoader.get(SPRITES.slots.sub.src);
    const slotImgStat = SpriteLoader.get(SPRITES.slots.stat.src);
    function drawSlot(sy, slotImg, weapon, isEmpty) {
      // 슬롯 프레임 이미지
      if(slotImg?.complete && slotImg.naturalWidth>0) {
        ctx.drawImage(slotImg, SLOT_X, sy, SLOT_W, SLOT_H);
      }
      if(!isEmpty && weapon) {
        const wImgSrc = (typeof CARD_IMGS!=='undefined'&&CARD_IMGS[weapon.defId]) || null;
        const wImg = wImgSrc ? SpriteLoader.get(wImgSrc) : null;
        if(wImg?.complete && wImg.naturalWidth>0) {
          ctx.drawImage(wImg, SLOT_X+3, sy+3, SLOT_W-6, SLOT_H-6);
        } else {
          ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(weapon.icon||'?', SLOT_X+SLOT_W/2, sy+SLOT_H/2);
          ctx.textBaseline='alphabetic'; ctx.textAlign='left';
        }
        ctx.fillStyle='rgba(0,0,0,0.75)';
        ctx.fillRect(SLOT_X+SLOT_W-16, sy+SLOT_H-11, 16, 11);
        ctx.fillStyle='#f0c040'; ctx.font='bold 8px sans-serif';
        ctx.textAlign='center';
        ctx.fillText('L'+weapon.lv, SLOT_X+SLOT_W-8, sy+SLOT_H-2);
        ctx.textAlign='left';
      }
    }

    // 주무기 슬롯 (난이도별 1~3개 가로로)
    let _sy = 56;
    const _mainWpns = window.mainWeapons || [window.mainWeapon];
    const _mainSlotN = Math.max(_mainWpns.filter(Boolean).length, 1);
    const MAIN_SLOT_W = _mainSlotN > 1 ? Math.floor((SLOT_W * 1 + SLOT_GAP) * (_mainSlotN === 2 ? 1.9 : 2.7) / _mainSlotN) : SLOT_W;
    const MAIN_SLOT_GAP = 2;
    for (let mi = 0; mi < _mainSlotN; mi++) {
      const mwi = _mainWpns[mi] || null;
      const msx = SLOT_X + mi * (MAIN_SLOT_W + MAIN_SLOT_GAP);
      // 주무기 슬롯 프레임
      if(slotImgMain?.complete && slotImgMain.naturalWidth>0) {
        ctx.drawImage(slotImgMain, msx, _sy, MAIN_SLOT_W, SLOT_H);
      }
      if (mwi) {
        const wImgSrc = (typeof CARD_IMGS!=='undefined'&&CARD_IMGS[mwi.defId]) || null;
        const wImg = wImgSrc ? SpriteLoader.get(wImgSrc) : null;
        if(wImg?.complete && wImg.naturalWidth>0) {
          ctx.drawImage(wImg, msx+3, _sy+3, MAIN_SLOT_W-6, SLOT_H-6);
        } else {
          ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(mwi.icon||'?', msx+MAIN_SLOT_W/2, _sy+SLOT_H/2);
          ctx.textBaseline='alphabetic'; ctx.textAlign='left';
        }
        ctx.fillStyle='rgba(0,0,0,0.75)';
        ctx.fillRect(msx+MAIN_SLOT_W-14, _sy+SLOT_H-11, 14, 11);
        ctx.fillStyle='#f0c040'; ctx.font='bold 7px sans-serif'; ctx.textAlign='center';
        ctx.fillText('L'+mwi.lv, msx+MAIN_SLOT_W-7, _sy+SLOT_H-2);
        ctx.textAlign='left';
      }
    }
    _sy += SLOT_H + SLOT_GAP;

    // [UPDATE 2026-07-06] 주무기별 전용 특수강화 미니 슬롯 (주무기 슬롯 바로 아래)
    // 일반 스탯 4칸과 분리되어 주무기 개수만큼(1~3개) 표시
    const SPEC_H = 15;
    for (let mi = 0; mi < _mainSlotN; mi++) {
      const mwi = _mainWpns[mi] || null;
      const msx = SLOT_X + mi * (MAIN_SLOT_W + MAIN_SLOT_GAP);
      const spec = mwi?.def?.specialStat;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(msx, _sy, MAIN_SLOT_W, SPEC_H);
      ctx.strokeStyle = 'rgba(212,160,23,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(msx + 0.5, _sy + 0.5, MAIN_SLOT_W - 1, SPEC_H - 1);
      if (spec) {
        const specLv = (window.statSlots || []).find(s => s.id === spec.id)?.lv || 0;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '9px sans-serif';
        ctx.fillStyle = specLv > 0 ? '#f0c040' : 'rgba(232,220,200,0.35)';
        ctx.fillText(spec.icon || '⭐', msx + MAIN_SLOT_W / 2 - 8, _sy + SPEC_H / 2);
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(specLv > 0 ? (specLv + '/' + (spec.max || 4)) : '-', msx + MAIN_SLOT_W / 2 + 9, _sy + SPEC_H / 2);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      }
    }
    _sy += SPEC_H + SLOT_GAP;

    // 구분선
    _sy += 4;

    // 보조무기 슬롯 (3개)
    const _sws = window.subWeapons || [];
    for(let _i=0; _i<3; _i++) {
      drawSlot(_sy, slotImgSub, _sws[_i], !_sws[_i]);
      _sy += SLOT_H + SLOT_GAP;
    }

    // 구분선
    _sy += 4;

    // [UPDATE 2026-07-06] 스탯 슬롯 (4개) - 일반 스탯만 표시 (특수강화는 주무기 슬롯 아래 전용 칸으로 분리됨)
    const _sts = (window.statSlots || []).filter(s => !s.isSpecial);
    for(let _i=0; _i<4; _i++) {
      const _st = _sts[_i];
      const _stIcon = _st ? ((STAT_UPGRADE_DEFS||[]).find(s=>s.id===_st.id)?.icon || '?') : '?';
      const _stWpn = _st ? {defId:_st.id, icon:_stIcon, lv:_st.lv} : null;
      drawSlot(_sy, slotImgStat, _stWpn, !_st);
      _sy += SLOT_H + SLOT_GAP;
    }

    // [UPDATE 2026-07-10] 좌측 하단 데미지 미터 — 무기별 누적 총데미지(도파민용) + 부드러운 최근 3초 DPS
    {
      const _dpsSrc = window._dpsDisplay || {};
      const _totalSrc = window._dpsTotal || {};
      // 투사체 type이 무기 defId와 다른 경우 매핑 (영혼낫: type='scythe' → defId='scythe_main')
      const DPS_KEY_ALIAS = { scythe_main: 'scythe' };
      const _fmtNum = n => n >= 1000 ? (n/1000).toFixed(2)+'k' : n.toFixed(2); // [UPDATE 2026-07-11] 소수점 2자리 반올림
      const _dpsWeapons = [...(window.mainWeapons||[]).filter(Boolean), ...(window.subWeapons||[]).filter(Boolean)];
      const _dpsRows = _dpsWeapons.map(w => {
        const key = DPS_KEY_ALIAS[w.defId] || w.defId;
        return { w, total: _totalSrc[key] || 0, dps: _dpsSrc[key] || 0 };
      }).filter(r => r.total > 0).sort((a,b) => b.total - a.total);
      if (_dpsRows.length > 0) {
        const _grandTotal = _dpsRows.reduce((s,r) => s+r.total, 0) || 1;
        // 무기별 고정 색상 (정렬 순서 바뀌어도 같은 무기는 항상 같은 색)
        const DPS_COLORS = ['#ff6060','#60c0ff','#60ff90','#ffcc40','#c080ff','#ff9040','#40e0d0'];
        const _colorFor = defId => {
          let h=0; for(let c=0;c<defId.length;c++) h=(h*31+defId.charCodeAt(c))>>>0;
          return DPS_COLORS[h%DPS_COLORS.length];
        };
        const DR_H = 32, DR_W = 130, DR_X = 4;
        const panelH = _dpsRows.length * DR_H + 6;
        const panelY = H - panelH - 4;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath(); ctx.roundRect(DR_X, panelY, DR_W, panelH, 6); ctx.fill();
        _dpsRows.forEach((r, i) => {
          const ry = panelY + 4 + i * DR_H;
          const wImgSrc = (typeof CARD_IMGS!=='undefined'&&CARD_IMGS[r.w.defId]) || null;
          const wImg = wImgSrc ? SpriteLoader.get(wImgSrc) : null;
          if (wImg?.complete && wImg.naturalWidth>0) {
            ctx.drawImage(wImg, DR_X+4, ry+2, 18, 18);
          } else {
            ctx.font='14px sans-serif'; ctx.fillText(r.w.icon||'?', DR_X+4, ry+15);
          }
          ctx.font='bold 12px sans-serif'; ctx.fillStyle='#ffd878';
          ctx.fillText(_fmtNum(r.total), DR_X+26, ry+10);
          ctx.font='9px sans-serif'; ctx.fillStyle='rgba(200,200,200,0.75)';
          ctx.fillText(`${_fmtNum(r.dps)}/s`, DR_X+26, ry+21); // [UPDATE 2026-07-11] 정수 반올림 제거 — 소수점 2자리로 표시
          // [UPDATE 2026-07-10] 무기별 데미지 점유율(%) 게이지 바
          const pct = r.total / _grandTotal;
          const barX = DR_X+4, barY = ry+24, barW = DR_W-38, barH = 5;
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(barX, barY, barW, barH);
          ctx.fillStyle = _colorFor(r.w.defId);
          ctx.fillRect(barX, barY, barW*pct, barH);
          ctx.font='bold 8px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='right';
          ctx.fillText(`${Math.round(pct*100)}%`, DR_X+DR_W-4, ry+21);
          ctx.textAlign='left';
        });
      }
    }

    // 우측 상단 재화 HUD
    ctx.textAlign='right'; ctx.font='bold 10px sans-serif';
    const _isSeason2Hud = (stageId >= 101); // [UPDATE 2026-07-17] 시즌2 이후 전체로 확장
    if (_isSeason2Hud) {
      // 시즌2: 차원석 잔량 + 이번 판 획득량 + 소모율
      const _cwsCur = saveData.chaewonseok || 0;
      const _cwsEarned = window.earnedSpecial || 0;
      const _cwsColor = _s2Debuff ? '#ff6060' : (_cwsCur <= 5 ? '#ffaa40' : '#80c8ff');
      ctx.fillStyle = _cwsColor;
      ctx.fillText(`🔷${_cwsCur} (+${_cwsEarned}) -2/min`, W-8, 20);
      // 영혼 조각 / 영혼석
      const _sf = saveData.soulFragments || 0;
      const _ss = saveData.soulStones || 0;
      const _sfEarned = window.earnedSoulFragments || 0;
      const _ssEarned = window.earnedSoulStones || 0;
      ctx.fillStyle = '#90b8ff';
      ctx.fillText(`👻${_sf} (+${_sfEarned})  💜${_ss} (+${_ssEarned})`, W-8, 34);
    } else {
      // 일반: 골드 표시
      ctx.fillStyle='#f0c040';
      const _hudGold = window.earnedGold || 0;
      ctx.fillText(`🪙+${_hudGold.toLocaleString()}`,W-8,20);
      // 특수 재화 아이콘 (특화 던전에서만)
      if(_rewardMode && _rewardMode!=='bossrush' && _rewardMode!=='infinite' && (window.earnedSpecial||0)>0){
        const _sIcon = SPECIAL_ICONS[_rewardMode]||'💠';
        ctx.fillStyle='#a0e8ff';
        ctx.fillText(`${_sIcon}+${window.earnedSpecial}`,W-8,34);
      }
    }
    ctx.textAlign='left';

  }

  function drawBossHPBar(W,H,bossObj,yOffset){
    const b=bossObj||boss;
    const bw=Math.min(W-40,400),bh=14,bx=(W-bw)/2,by=60+(yOffset||0);
    const ratio=b.hp/b.maxHp,phase=b.phase;
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(bx-4,by-18,bw+8,bh+26);
    const _bIsEn=(typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    ctx.textAlign='center';ctx.font='bold 11px sans-serif';ctx.fillStyle=b.color;ctx.fillText(_bIsEn?(b.nameEn||b.name):b.name,W/2,by-4);
    ctx.fillStyle='#6a5a4a';ctx.font='9px sans-serif';ctx.fillText(_bIsEn?(b.subEn||b.sub):b.sub,W/2,by+bh+12);ctx.textAlign='left';
    ctx.fillStyle='#200';ctx.fillRect(bx,by,bw,bh);
    const cols=['#c04010','#e06010','#ff2020'];
    const grd=ctx.createLinearGradient(bx,by,bx+bw,by);
    grd.addColorStop(0,cols[Math.min(phase,2)]);grd.addColorStop(1,'#ff6040');
    ctx.fillStyle=grd;ctx.fillRect(bx,by,bw*ratio,bh);
    for(const ph of b.phases.slice(1)){
      const lx=bx+bw*ph.threshold;
      ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(lx,by);ctx.lineTo(lx,by+bh);ctx.stroke();
    }
    ctx.textAlign='center';ctx.font='bold 9px sans-serif';ctx.fillStyle='#e8dcc8';
    ctx.fillText(`${Math.ceil(b.hp)} / ${b.maxHp}`,W/2,by+bh-2);ctx.textAlign='left';
  }

  // catIdx: 'main_0', 'sub_0', 'sub_1' 등 (cat_숫자 형식)
  // cardW: 카드 width 스타일 문자열
  function cardHTML(ch, catIdx, cardW){
    const [cat,idxStr] = (catIdx||'main_0').split('_');
    const idx = parseInt(idxStr||'0');
    const isEvo=ch.type==='evolve', isNewSub=ch.type==='new_sub';
    const isStat=ch.type==='stat'||ch.type==='stat_up', isSpec=ch.type==='special';
    const isUpg=ch.type==='upgrade', isAscend=ch.type==='ascend';
    let name,icon,desc,badge,color,imgSrc='',category='';

    // 타입별 컬러 바 색상 (슬롯 패널과 동일)
    // 주무기: 금색, 보조무기: 파랑, 스탯: 초록, 진화: 주황
    let barColor='#4080a0', typeLabel='', typeLabelBg='rgba(40,80,160,0.8)';

    const _isEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    const _tl = (k,ko,en) => _isEn ? en : ko; // typeLabel 헬퍼

    if(isEvo){
      const _evoName = wi18n(ch.weapon.defId+'_evo', 'name', null) || wi18n(ch.weapon.evolveInto||ch.weapon.defId,'name',ch.weapon.evolvedName);
      name=wi18n(ch.weapon.def?.evolveInto||ch.weapon.defId,'name',ch.weapon.evolvedName);
      icon='✨';
      desc=wi18n(ch.weapon.defId,'name',ch.weapon.name)+' → '+name;
      badge=_tl('evo','⚡진화!','⚡Evolve!'); color='#e0a020';
      barColor='#e0a020'; typeLabel=_tl('evo','⚡ 진화','⚡ Evolve'); typeLabelBg='rgba(160,80,0,0.9)';
      imgSrc=CARD_IMGS[ch.weapon.defId]||'';
    } else if(isSpec){
      name=wi18n(ch.statId,'name',ch.def.name); icon=ch.def.icon;
      desc=wi18n(ch.statId,'desc',ch.def.desc); badge=_tl('s','특화','Special'); color='#e06020';
      barColor='#e06020'; typeLabel=_tl('mw','주무기','Main Wpn'); typeLabelBg='rgba(160,60,0,0.9)';
      imgSrc=CARD_IMGS[ch.weapon?.defId]||'';
    } else if(isAscend){
      name=wi18n(ch.weapon.defId,'name',ch.weapon.name); icon=ch.weapon.icon;
      // [UPDATE 2026-07-06] 다음 픽 후 상태 표시 (현재 lv/각성 기준)
      const _w=ch.weapon, _curAwk=_w._awakLv||0, _curLv=_w.lv||1;
      let aStar, aText;
      if (_curAwk >= 5) {
        // 5각 이후: 데미지만 +8% (_awakLv=5 고정, _overAwkDmg로 단계 추적)
        const _overStep = Math.round(((_w._overAwkDmg||1) - 1) / 0.08) + 1;
        aStar = '★★★★★+'+_overStep;
        aText = _tl('','데미지 +'+(_overStep*8)+'%','Damage +'+(_overStep*8)+'%');
      } else if (_curLv < 4) {
        // 같은 각성 내 레벨업
        aStar = _curAwk > 0 ? '★'.repeat(_curAwk) : '☆';
        aText = _tl('',_curAwk+'각 Lv.'+(_curLv+1),_curAwk+' Awk Lv.'+(_curLv+1));
      } else if (_curAwk < 4) {
        // lv4에서 각성 진행
        aStar = '★'.repeat(_curAwk+1);
        aText = _tl('',(_curAwk+1)+'각성!',(_curAwk+1)+' Awaken!');
      } else {
        // 4각 lv4 → 5각 MAX
        aStar = '★★★★★';
        aText = _tl('','5각성 MAX!','5th Awaken MAX!');
      }
      desc = aText; // [UPDATE 2026-07-06] "쿨타임 × 0.9" 문구 제거 — 실제로 적용 안 되는 죽은 텍스트였음
      badge=aStar; color='#c060e0';
      barColor='#c060e0'; typeLabel=_tl('','★ 각성','★ Ascend'); typeLabelBg='rgba(120,0,180,0.9)';
      imgSrc=CARD_IMGS[ch.weapon.defId]||'';
    } else if(isUpg){
      name=wi18n(ch.weapon.defId,'name',ch.weapon.name); icon=ch.weapon.icon;
      desc='Lv '+ch.weapon.lv+' → '+(ch.weapon.lv+1);
      badge='Lv '+(ch.weapon.lv+1); color='#c08020';
      const isMainWpn = !!(typeof MAIN_WEAPON_DEFS !== 'undefined' && MAIN_WEAPON_DEFS[ch.weapon.defId]);
      barColor=isMainWpn?'#e0a020':'#4080e0';
      typeLabel=isMainWpn?_tl('mw','주무기','Main Wpn'):_tl('sw','보조무기','Sub Wpn');
      typeLabelBg=isMainWpn?'rgba(160,80,0,0.9)':'rgba(20,60,160,0.9)';
      imgSrc=CARD_IMGS[ch.weapon.defId]||'';
    } else if(isNewSub){
      name=wi18n(ch.weaponId,'name',ch.def.name); icon=ch.def.icon;
      desc=wi18n(ch.weaponId,'desc',ch.def.desc); badge=_tl('n','새 무기','New'); category=ch.def.category||'';
      color=ch.def.rarity==='rare'?'#a040e0':ch.def.rarity==='uncommon'?'#4080e0':'#40a060';
      barColor='#4080e0'; typeLabel=_tl('sw','보조무기','Sub Wpn'); typeLabelBg='rgba(20,60,160,0.9)';
      imgSrc=CARD_IMGS[ch.weaponId]||'';
    } else if(isStat){
      name=wi18n(ch.statId,'name',ch.def.name); icon=ch.def.icon;
      desc=wi18n(ch.statId,'desc',ch.def.desc);
      badge=ch.cur?'Lv '+(ch.cur.lv+1):_tl('new','신규','New'); color='#30a060';
      barColor='#30a060'; typeLabel=_tl('stat','스탯','Stat'); typeLabelBg='rgba(20,120,60,0.9)';
    }

    const catMap=_isEn?{attack:'Attack',area:'Area',debuff:'Debuff',support:'Support'}:{attack:'공격',area:'범위',debuff:'디버프',support:'서포트'};
    const catClr={attack:'#e04040',area:'#e08020',debuff:'#a040e0',support:'#20a060'};
    const catTag=category?`<span style="font-size:9px;background:${catClr[category]||'#666'};color:#fff;padding:1px 5px;border-radius:6px;margin-left:4px">${catMap[category]||''}</span>`:'';
    const bg=isEvo?'rgba(50,35,0,.96)':'rgba(12,8,24,.96)';
    const bgHov=isEvo?'rgba(70,50,0,.96)':'rgba(30,18,54,.96)';
    const glow=isEvo?'0 0 18px rgba(220,160,20,.5)':'';
    const imgHTML=imgSrc
      ?`<img src="${imgSrc}" style="width:52px;height:52px;object-fit:contain;image-rendering:pixelated;flex-shrink:0">`
      :`<div style="font-size:30px;width:52px;text-align:center;flex-shrink:0">${icon}</div>`;

    const _cw = cardW || 'width:100%;max-width:320px';
    return `<div id="lvup-card-${cat}-${idx}" onclick="GameScene.confirmPick(this,'${cat}',${idx})"
      onmouseenter="this.style.background='${bgHov}'"
      onmouseleave="this.style.background='${bg}'"
      style="${_cw};background:${bg};
        border:1.5px solid ${color};border-left:5px solid ${barColor};
        border-radius:12px;padding:10px 12px;cursor:pointer;
        display:flex;align-items:center;gap:12px;box-shadow:${glow};transition:background .15s;position:relative;overflow:hidden">
      ${imgHTML}
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="font-size:9px;background:${typeLabelBg};color:#fff;padding:1px 6px;border-radius:4px;font-weight:700;letter-spacing:.04em">${typeLabel}</span>
          ${catTag}
        </div>
        <div style="font-size:13px;color:${isEvo?'#f0c040':'#e8dcc8'};font-weight:700">${name}</div>
        <div style="font-size:10px;color:${isEvo?'#c08020':'#8a7a6a'};margin-top:2px;line-height:1.4">${desc}</div>
        ${isEvo?`<div style="font-size:9px;color:#e0a020;margin-top:3px">✨ ${_isEn?'Evolved to Legend!':'전설로 진화!'}</div>`:''}
      </div>
      <div style="font-size:10px;background:${color};color:#fff;padding:3px 9px;border-radius:10px;font-weight:700;flex-shrink:0;white-space:nowrap">${badge}</div>
    </div>`;
  }

  function triggerLevelUp(){
    // [UPDATE 2026-07-15] 260715_MTOPC.md 10번: 파밍 중 레벨업 시 상태 복귀 오류 수정 —
    // 파밍 중이었는지 기록해뒀다가 pickLevelUp()에서 원래 상태로 복귀시킴 (기존엔 무조건 'playing'으로 복귀돼
    // farmingTimer가 멈춘 채 방치, 최악의 경우 클리어했는데도 시간초과 패배 처리될 수 있었음)
    window._wasFarming = (state === 'farming');
    state='levelup';
    try {
      levelUpChoices=getLevelUpChoices(window.mainWeapons||[window.mainWeapon||weapons[0]], window.subWeapons||[], window.statSlots||[], gameMode);
    } catch(e) { console.error('레벨업 선택지 오류:', e.message); levelUpChoices={main:[],sub:[],stat:[]}; }
    const ui=document.getElementById('gameUI');if(!ui)return;
    ui.style.pointerEvents='auto';
    const _lvIsEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');

    // 섹션 HTML 생성 헬퍼
    function sectionHTML(label, choices, cat) {
      if (!choices || choices.length === 0) return '';
      // 주무기: 1개 가로 / 보조무기·스탯: 세로 나열
      const isMain = cat === 'main';
      const rowStyle = isMain
        ? 'display:flex;justify-content:center;'
        : 'display:flex;flex-direction:column;gap:6px;align-items:center;';
      const cardsW = 'width:100%;max-width:320px';
      return `<div id="lvup-sec-${cat}" style="width:100%;max-width:320px;transition:opacity .3s">
        <div style="font-size:9px;color:#5a4a3a;font-weight:700;letter-spacing:.08em;margin-bottom:4px;padding-left:4px;">${label}</div>
        <div style="${rowStyle}">
          ${choices.map((ch,i)=>cardHTML(ch, cat+'_'+i, cardsW)).join('')}
        </div>
      </div>`;
    }

    const hasAny = levelUpChoices.main.length||levelUpChoices.sub.length||levelUpChoices.stat.length;
    const bodyHTML = hasAny
      ? [
          sectionHTML(_lvIsEn?'── MAIN WEAPON ──':'── 주 무 기 ──', levelUpChoices.main, 'main'),
          sectionHTML(_lvIsEn?'── SUB WEAPONS ──':'── 보 조 무 기 ──', levelUpChoices.sub, 'sub'),
          sectionHTML(_lvIsEn?'── STAT ──':'── 스   탯 ──', levelUpChoices.stat, 'stat'),
        ].filter(Boolean).join('')
      : `<div style="color:#8a7a6a;font-size:13px;text-align:center">${_lvIsEn?'Nothing available':'선택지 없음'}<br><br>
         <button onclick="GameScene.pickLevelUp('none',0)" style="padding:10px 24px;background:rgba(112,64,192,.5);border:1px solid #7040c0;color:#e8dcc8;border-radius:20px;cursor:pointer;font-family:inherit;">${_lvIsEn?'Continue':'계속하기'}</button></div>`;

    ui.innerHTML=`<div class="scroll-pan-y" style="position:absolute;inset:0;background:rgba(0,0,10,.85);
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:10px;padding:16px;overflow-y:auto">
      <div style="font-size:22px;color:#f0c040;font-weight:700;text-shadow:0 0 12px rgba(240,192,64,.5);margin-top:8px">✨ ${_lvIsEn?'Level Up!':'레벨 업!'} Lv.${player.level} ✨</div>
      <div style="font-size:10px;color:#5a4a3a;margin-bottom:4px">ATK+3 &nbsp;SPD+2 &nbsp;MOV+1 &nbsp;DEF+2</div>
      ${bodyHTML}
    </div>`;

    // [UPDATE 2026-07-14] 자동 모드: 정해진 우선순위대로 뽑으니 카운트다운 없이 0.5초 후 바로 선택(뭘 골랐는지만 깜빡임으로 표시)
    if (autoMode === 2) {
      // 티어 정의 (낮을수록 우선)
      // [UPDATE 2026-07-10] 실제 무기 id와 안 맞던 오타 수정 (healing_incense→heal_incense, karma_orb→karma_bead,
      // divine_shield→spirit_shield, passport→hopaetag) — 의도한 우선순위가 실제로는 전혀 적용 안 되고 있었음.
      // lightning은 어느 무기를 뜻했는지 불명확해 thunder_drum으로 추정 매핑 (필요시 조정)
      // [UPDATE 2026-07-10] 사용자 지정 세부 티어 (0=최우선 ~ 6=그 외)
      // 0: 피흡수 / 1: 치유향·도깨비불·독안개·번개장판 / 2: 저승낫·독침·천둥북·공격력·공속
      // 2.5: (조건부) 보조무기 슬롯 미충족 시 신규 보조무기 우선
      // 3: 쿨감 / 3.5: (조건부) 스탯 슬롯 미충족 시 신규 스탯 우선
      // 4: 특수강화·각성 / 5: 주무기 강화 / 6: 그 외
      const _SUB_TIER  = {
        heal_incense:1, goblin_fire:1, poison_mist:1, lightning_trap:1,
        scythe_sub:2, poison_needle:2, thunder_drum:2,
      };
      const _STAT_TIER = { vampire:0, atk:2, spd:2, cd:3 };
      function _getTier(c) {
        const id = c.weaponId || c.weapon?.defId;
        if (id && _SUB_TIER[id]!=null) return _SUB_TIER[id];
        if (c.type==='stat' && _STAT_TIER[c.statId]!=null) return _STAT_TIER[c.statId];
        if (c.type==='special') return 4;       // 특수강화
        if (c.type==='ascend')  return 4;       // 각성
        if (c.type==='upgrade' && c._cat==='main') return 5; // 주무기 강화
        // [UPDATE 2026-07-10] 보조무기 슬롯이 비어있으면 신규 보조무기 우선(2~3티어 사이, DPS상 항상 이득)
        if (c.type==='new_sub' && (window.subWeapons||[]).length < 3) return 2.5;
        // [UPDATE 2026-07-10] 스탯 슬롯이 비어있으면(4칸 미만) 신규 스탯 종류 획득 우선(3~4티어 사이) —
        // 이미 보유한 스탯 강화(=슬롯을 새로 안 채움)는 여기 해당 안 되고 그 외(6티어)로 감
        if (c.type==='stat') {
          const _statSlots = (window.statSlots||[]).filter(s=>!s.isSpecial);
          const _already = _statSlots.some(s=>s.id===c.statId);
          if (!_already && _statSlots.length < 4) return 3.5;
        }
        return 6;
      }
      function _autoBestPick(choices) {
        const all = [
          ...choices.main.map((c,i)=>({...c,_cat:'main',_idx:i})),
          ...choices.sub.map((c,i)=>({...c,_cat:'sub', _idx:i})),
          ...choices.stat.map((c,i)=>({...c,_cat:'stat',_idx:i})),
        ];
        if (!all.length) return null;
        all.sort((a,b)=>_getTier(a)-_getTier(b));
        return all[0];
      }
      // [UPDATE 2026-07-16] 260716_MTOPC.md 4번: 수동 클릭 시 이 타이머를 취소할 수 있도록 전역 참조 보관
      window._levelupAutoTimeout = setTimeout(() => {
        window._levelupAutoTimeout = null;
        const _best = _autoBestPick(levelUpChoices);
        if (_best) {
          // [UPDATE 2026-07-10] 자동 선택도 어떤 카드가 뽑혔는지 깜빡임으로 표시
          const _bestEl = document.getElementById(`lvup-card-${_best._cat}-${_best._idx}`);
          if (_bestEl) confirmPick(_bestEl, _best._cat, _best._idx);
          else pickLevelUp(_best._cat, _best._idx);
        }
        else pickLevelUp('none', 0);
      }, 500);
    }
  }

  // [UPDATE 2026-07-10] 레벨업 카드 클릭 시 뭘 골랐는지 보이도록 깜빡임 확인 연출 후 실제 적용
  function confirmPick(el, cat, idx){
    // [UPDATE 2026-07-16] 260716_MTOPC.md 4번: 자동선택 타이머와 수동 클릭 타이밍이 겹치면 카드 2장이 한번에
    // 적용되던 버그 — state 가드 추가(이미 처리된 레벨업이면 완전히 무시) + 대기 중인 자동선택 타이머 취소
    if(!el || el.dataset.picked || state !== 'levelup') return; // 중복 클릭 방지
    if (window._levelupAutoTimeout) { clearTimeout(window._levelupAutoTimeout); window._levelupAutoTimeout = null; }
    el.dataset.picked = '1';
    // 나머지 카드는 흐리게 + 클릭 막기
    const container = document.getElementById('gameUI');
    if(container) container.style.pointerEvents='none';
    el.style.pointerEvents='none';
    el.style.animation = 'lvupPickFlash 0.35s ease-in-out 3';
    el.style.boxShadow = '0 0 0 3px #ffe070, 0 0 20px rgba(255,224,112,.8)';
    if(!document.getElementById('lvup-pick-flash-style')){
      const s=document.createElement('style'); s.id='lvup-pick-flash-style';
      s.textContent = `@keyframes lvupPickFlash{0%,100%{filter:brightness(1)}50%{filter:brightness(1.9)}}`;
      document.head.appendChild(s);
    }
    // 체크마크 오버레이
    const check=document.createElement('div');
    check.textContent='✓';
    check.style.cssText='position:absolute;top:4px;right:8px;font-size:20px;font-weight:900;color:#ffe070;text-shadow:0 0 6px rgba(0,0,0,.8);';
    el.appendChild(check);
    setTimeout(() => pickLevelUp(cat, idx), 420);
  }

  // cat: 'main'|'sub'|'stat'|'none', idx: 숫자
  function pickLevelUp(cat, idx){
    // [UPDATE 2026-07-16] 260716_MTOPC.md 4번: 이미 처리된 레벨업이 자동선택 타이머 등으로 재실행되는 것 방지
    if (state !== 'levelup') return;
    const c = (cat==='main'||cat==='sub'||cat==='stat') ? levelUpChoices[cat][idx] : null;
    if(c){
      if(c.type==='evolve'){
        c.weapon.evolve(); spawnEvolveEffect();
      } else if(c.type==='upgrade'||c.type==='ascend'){
        c.weapon.upgrade();
      } else if(c.type==='new_sub'){
        if(!window.subWeapons) window.subWeapons=[];
        window.subWeapons.push(new WeaponInstance(c.weaponId));
        weapons=[...(window.mainWeapons||[window.mainWeapon].filter(Boolean)),...window.subWeapons];
        player.weapons=weapons;
      } else if(c.type==='stat'||c.type==='stat_up'){
        if(!window.statSlots) window.statSlots=[];
        const ex=window.statSlots.find(s=>s.id===c.statId&&!s.isSpecial);
        if(ex){ex.lv++;c.def.apply(player,ex.lv);}
        else{window.statSlots.push({id:c.statId,lv:1,isSpecial:false});c.def.apply(player,1);}
      } else if(c.type==='special'){
        if(!window.statSlots) window.statSlots=[];
        const ex=window.statSlots.find(s=>s.id===c.statId);
        if(ex){ex.lv++;}else{window.statSlots.push({id:c.statId,lv:1,isSpecial:true});}
        // 특수강화는 해당 무기 인스턴스에만 적용 (전역 공유 방지)
        c.weapon._bonus=(window.statSlots.find(s=>s.id===c.statId)?.lv||0);
      }

      // 선택한 카드 섹션에서 제거하고 UI 갱신 (다른 섹션 선택 대기)
      // 1개 선택 즉시 닫기
      const ui2=document.getElementById('gameUI');
      if(ui2){ui2.innerHTML='';ui2.style.pointerEvents='none';}
      // [UPDATE 2026-07-15] 260715_MTOPC.md 10번: 파밍 중이었으면 'farming'으로 복귀 (기존 무조건 'playing' 하드코딩 수정)
      state = window._wasFarming ? 'farming' : 'playing';
      window._wasFarming = false;
      return;
    }
    const ui=document.getElementById('gameUI');
    if(ui){ui.innerHTML='';ui.style.pointerEvents='none';}
    state = window._wasFarming ? 'farming' : 'playing';
    window._wasFarming = false;
  }

  // ── 진화 이펙트 ──
  function spawnEvolveEffect(){
    screenShake=1.5;
    // 플레이어 주변 방사형 파티클
    for(let i=0;i<20;i++){
      const ang=(i/20)*Math.PI*2;
      floatingTexts.push({
        x:player.x+Math.cos(ang)*40,
        y:player.y+Math.sin(ang)*40,
        text:'⚡',color:'#f0c040',t:-Math.random()*0.3
      });
    }
    floatingTexts.push({x:player.x,y:player.y-20,text:'✨',color:'#f0c040',t:-0.2});
  }

  function endGame(victory){
    state=victory?'victory':'dead';
    const btn=document.getElementById('pauseBtn');if(btn)btn.style.display='none';
    saveData=Save.load();
    // [UPDATE 2026-07-15] 버그 수정: 이 두 배너 플래그가 victory 블록 안에서만 초기화돼서, 이전 런에서 승리해 배너가
    // 세팅된 뒤 다음 런에서 패배해도 window에 남은 값이 그대로 결과화면에 다시 뜨던 문제 — 승패 무관하게 매번 초기화
    window._s2UnlockMsg = null;
    window._beginnerGiftParts = null;
    // [UPDATE 2026-07-14] 초보자 선물(스테이지1~20 최초클리어 보너스) 판정용 — 클리어 기록 갱신 전 상태를 미리 기억
    const _wasStageClearedBefore = Unlock.cleared(saveData, stageId);
    if(gameMode==='normal'&&victory){
      const prevCleared = saveData.clearedStages || [];
      const wasFirst = prevCleared.length === 0;
      // 레거시 clearedStages는 노말 이상 클리어만 기록 (이지 클리어가 노말로 보이는 버그 방지)
      if (difficulty !== 'easy') saveData.clearedStages=[...new Set([...prevCleared,stageId])];
      if(wasFirst) saveData._showFirstClearDialogue = true;
      // 난이도별 클리어 기록
      if (!saveData.clearedStagesEasy)   saveData.clearedStagesEasy   = [];
      if (!saveData.clearedStagesNormal) saveData.clearedStagesNormal = [];
      if (!saveData.clearedStagesHard)   saveData.clearedStagesHard   = [];
      if (difficulty === 'easy'   && !saveData.clearedStagesEasy.includes(stageId)) {
        saveData.clearedStagesEasy.push(stageId);
        // [UPDATE 2026-07-11] 260711_MTOPC.md 3번: 이지 챕터5 클리어 → 이지 2슬롯 해금 알림
        if (stageId === 50) saveData._showSlotUnlock = 'easy2';
      }
      if (difficulty === 'normal' && !saveData.clearedStagesNormal.includes(stageId)) {
        saveData.clearedStagesNormal.push(stageId);
        if (!saveData.clearedStagesEasy.includes(stageId)) saveData.clearedStagesEasy.push(stageId);
        // 처음 노말 클리어 → 슬롯 해금 알림
        if (saveData.clearedStagesNormal.length === 1) saveData._showSlotUnlock = 'normal';
      }
      if (difficulty === 'hard'   && !saveData.clearedStagesHard.includes(stageId)) {
        saveData.clearedStagesHard.push(stageId);
        if (!saveData.clearedStagesNormal.includes(stageId)) saveData.clearedStagesNormal.push(stageId);
        if (!saveData.clearedStagesEasy.includes(stageId))   saveData.clearedStagesEasy.push(stageId);
        // 처음 하드 클리어 → 슬롯 해금 알림
        if (saveData.clearedStagesHard.length === 1) saveData._showSlotUnlock = 'hard';
      }
      // 챕터 클리어 체크
      const si2 = getStageInfo(stageId);
      if (si2?.isBoss) {
        const ch2 = Math.ceil(stageId / 10);
        if (!saveData.clearedChapters) saveData.clearedChapters = [];
        if (!saveData.clearedChapters.includes(ch2)) saveData.clearedChapters.push(ch2);
      }
      // [UPDATE 2026-07-06] 시즌2 스토리 해금: 챕터16 클리어→강림차사, 챕터20 클리어→상사화
      if (stageId === 160 && !(saveData.companions || []).includes('gangnim')) {
        saveData.companions = [...(saveData.companions || []), 'gangnim'];
        window._s2UnlockMsg = { icon:'📖', ko:'새 동료 [강림차사]가 해금되었다!', en:'New companion [Gangnim Chasa] unlocked!' };
      }
      if (stageId === 200) saveData.season2Clear = true; // (기존에 설정하는 곳이 없던 버그 수정)
      // [UPDATE 2026-07-17] 순리석 던전 해금 조건(season3Clear)용 — 혼돈석 던전(hondonseok_dungeon)이
      // season2Clear로 열리는 것과 동일한 패턴
      if (stageId === 300) saveData.season3Clear = true;
      if (stageId === 200 && !(saveData.pets || []).includes('sangsahwa')) {
        saveData.pets = [...(saveData.pets || []), 'sangsahwa'];
        if (!saveData.petLevels) saveData.petLevels = {};
        saveData.petLevels.sangsahwa = 1;
        // [UPDATE 2026-07-14] 260713_MTOPC.md 18번: 해금 순간엔 원본 풀사이즈(39×52 ×2배)로 임팩트, 인게임에선 축소판(drawH44) 유지
        window._s2UnlockMsg = { icon:'🌺', spriteKey:'sangsahwa', popupW:78, popupH:104, ko:'새 펫 [상사화]가 해금되었다!', en:'New pet [Sangsahwa] unlocked!' };
      }
      // [UPDATE 2026-07-14] 초보자 선물 — 스테이지1~20 최초 클리어(난이도 무관 1회) 시 신규 유저 초반 가속용 재화 보너스
      // [UPDATE 2026-07-15] 공식을 beginnerGiftFor()로 추출(game-data.js) — 프로모 코드 소급지급과 공유
      if (!_wasStageClearedBefore && stageId >= 1 && stageId <= 20) {
        const parts = beginnerGiftFor(stageId);
        for (const p of parts) saveData[p.key] = (saveData[p.key]||0) + p.amount;
        window._beginnerGiftParts = parts;
      }
    }
    // [UPDATE 2026-07-12] 버그 수정: 강화석/천운석/천령과/태극석 던전이 전부 gameMode==='infinite'를 공유하는데
    // 어느 던전인지 구분 없이 항상 saveData.infiniteRecord 하나에만 기록해서, "무한 던전" 외 나머지는
    // 던전 목록 화면이 읽는 saveData[id+'Record'] 필드가 영원히 안 채워지던 문제. rewardMode 기준으로 분리해서 저장.
    if(gameMode==='infinite'){
      const _recKey = (_rewardMode || 'infinite') + 'Record';
      saveData[_recKey] = Math.max(saveData[_recKey]||0, Math.floor(elapsed));
    }
    // [UPDATE 2026-07-12] 버그 수정: 저장 키가 bossRushRecord(대문자 R)였는데 던전 목록 화면은 bossrushRecord(소문자)로 읽어서 항상 "기록 없음"이었음
    if(gameMode==='boss_rush')
      saveData.bossrushRecord=Math.max(saveData.bossrushRecord||0, bossRushIndex);
    saveData.totalKills=(saveData.totalKills||0)+kills;
    saveData.runs=(saveData.runs||0)+1;

    // 의원당: 런 종료 후 다음 런 HP 회복 적립
    const uiwonEff=BuildingEffects.getUiwonEffect(saveData);
    if(uiwonEff?.hp){ saveData.postRunHeal=(uiwonEff.hp); }
    if(uiwonEff?.revive){ saveData.reviveCount=(saveData.reviveCount||0)+1; }
    // 시즌 1 최초 클리어 감지 (이지 스테이지 100)
    _pendingEnding = false;
    if (gameMode==='normal' && victory && stageId===100 && difficulty==='easy' && !saveData.season1Clear) {
      saveData.season1Clear = true;
      _pendingEnding = true;
      saveData._showSlotUnlock = 'easy3'; // [UPDATE 2026-07-11] 이지 시즌1 전체클리어 → 이지 3슬롯 해금 알림
    }
    // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌 2 최초 클리어 감지 (이지 스테이지 200) — season2Clear와 별도 플래그로
    // "엔딩을 이미 봤는지"만 추적(season2Clear는 무기초월 등 다른 시스템의 해금 조건으로 이미 쓰이고 있어 분리)
    _pendingEnding2 = false;
    if (gameMode==='normal' && victory && stageId===200 && difficulty==='easy' && !saveData.season2ClearEnding) {
      saveData.season2ClearEnding = true;
      _pendingEnding2 = true;
    }
    // [UPDATE 2026-07-17] 시즌 3 최초 클리어 감지 (이지 스테이지 300) — season2ClearEnding과 동일 패턴
    _pendingEnding3 = false;
    if (gameMode==='normal' && victory && stageId===300 && difficulty==='easy' && !saveData.season3ClearEnding) {
      saveData.season3ClearEnding = true;
      _pendingEnding3 = true;
    }
    AchievementScene.checkAndUnlock(saveData);
    Save.save(saveData);

    setTimeout(()=>showResultScreen(victory), 800);
  }

  function drawResultOverlay(W,H,victory){
    // Canvas엔 아무것도 안 그림 — DOM 오버레이가 담당
  }

  function showResultScreen(victory) {
    if (document.getElementById('result-overlay')) return;
    const isKo = Lang.getCurrent() === 'ko';

    // ── 타이틀 ──
    const title =
      gameMode==='infinite'
        ? (victory ? (isKo?'🌀 무한 도전 종료!':'🌀 Infinite Run End!') : (isKo?`💀 Wave ${infiniteWave} 전멸`:`💀 Wave ${infiniteWave} Defeated`))
        : gameMode==='boss_rush'
          // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 무한 확장형이라 "전체 클리어" 문구 제거, 처치 수만 표시
          ? (isKo?`💎 ${bossRushIndex}보스 처치`:`💎 Boss ${bossRushIndex} Slain`)
          : (victory
              ? (isBossStage ? (isKo?'⚔️ 보스 격파!':'⚔️ Boss Defeated!') : (isKo?'🏆 스테이지 클리어!':'🏆 Stage Clear!'))
              : (timeLeft<=0 ? (isKo?'⏰ 시간 초과':'⏰ Time Up') : (isKo?'💀 전멸':'💀 Defeated')));

    const earnedGold    = window.earnedGold || 0;
    const earnedSpecial = window.earnedSpecial || 0;
    const earnedSoulFragments = window.earnedSoulFragments || 0;
    const earnedSoulStones    = window.earnedSoulStones || 0;
    // [UPDATE 2026-07-17] 스토리 스테이지(시즌2 이후, 차원석 경제)의 earnedSpecial은 던전 특화재화가 아니라 차원석 —
    // 아이콘이 항상 비어보이던 버그 원인. _rewardMode 유무로 던전/스토리 문맥을 구분해서 아이콘을 정확히 매칭.
    const _isStoryDimStage = (gameMode==='normal' && !_rewardMode && stageId>=101);
    const specialIcon = _rewardMode ? (SPECIAL_ICONS[_rewardMode] || '💠') : (_isStoryDimStage ? '🔷' : '');
    const survivedComp = companions.filter(c=>!c.dead).length;
    const timeSec = Math.floor(elapsed);
    const timeStr = isKo ? `${Math.floor(timeSec/60)}분 ${timeSec%60}초` : `${Math.floor(timeSec/60)}m ${timeSec%60}s`;

    // ── 별점 (클리어 시만) ──
    let stars = 0;
    if (victory && gameMode==='normal') {
      if (player.hp > player.maxHp * 0.6) stars = 3;
      else if (player.hp > player.maxHp * 0.2) stars = 2;
      else stars = 1;
    }
    const starsHtml = victory && gameMode==='normal'
      ? `<div style="font-size:28px;margin:8px 0;letter-spacing:4px;">
          ${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}
        </div>` : '';

    // [UPDATE 2026-07-17] 이번 판에 얻은 재화가 1종류뿐이라는 가정이 틀렸음(골드+차원석+영혼조각/영혼석이 동시에
    // 나올 수 있음) — either/or 대신 0보다 큰 재화를 전부 나열하도록 재설계(사용자 지적)
    const earnedRows = [];
    if (earnedGold > 0) earnedRows.push({ icon:'🪙', label: isKo?'획득 골드':'Gold', val:`+${earnedGold.toLocaleString()}` });
    if (earnedSpecial > 0) earnedRows.push({ icon: specialIcon, label: isKo?(_isStoryDimStage?'획득 차원석':'획득 재화'):(_isStoryDimStage?'Dim. Stones':'Earned'), val:`+${earnedSpecial}` });
    if (earnedSoulFragments > 0) earnedRows.push({ icon:'👻', label: isKo?'영혼 조각':'Soul Frag.', val:`+${earnedSoulFragments}` });
    if (earnedSoulStones > 0) earnedRows.push({ icon:'💜', label: isKo?'영혼석':'Soul Stone', val:`+${earnedSoulStones}` });
    if (!earnedRows.length) earnedRows.push({ icon:'🪙', label: isKo?'획득 골드':'Gold', val:'+0' });

    // ── 스탯 행 ──
    const statRows = [
      { icon:'⚔️', label: isKo?'처치':'Kills',   val: `${kills}` + (gameMode==='normal'?`/${killTarget}`:'') },
      { icon:'⏱️', label: isKo?'생존시간':'Time', val: timeStr },
      ...earnedRows,
      { icon:'❤️',  label: isKo?'남은 HP':'HP Left', val: `${Math.max(0,Math.floor(player.hp))} / ${Math.floor(player.maxHp)}` },
      ...(companions.length ? [{ icon:'🤝', label: isKo?'동료 생존':'Allies', val: `${survivedComp}/${companions.length}` }] : []),
      { icon:'⬆️',  label: isKo?'레벨':'Level', val: `${player.level}` },
    ];

    const canRetry = gameMode === 'normal';

    // 패배 시 player_fail 이미지 data URL 미리 추출
    let failImgSrc = '';
    if (!victory && SPRITES?.playerFail) {
      const _fi = SpriteLoader.get(SPRITES.playerFail.src);
      if (_fi?.src) failImgSrc = _fi.src;
    }

    const div = document.createElement('div');
    div.id = 'result-overlay';
    div.style.cssText = `
      position:absolute;inset:0;z-index:100;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:${victory?'rgba(0,20,0,0.85)':'#000'};
      font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
      opacity:0;transition:opacity 0.6s ease;
    `;

    const failImgHtml = (!victory && failImgSrc)
      ? `<img src="${failImgSrc}" style="
          width:220px;height:auto;object-fit:contain;
          margin-bottom:-16px;flex-shrink:0;
        ">`
      : '';

    div.innerHTML = `
      ${failImgHtml}
      <div style="
        width:340px;
        background:rgba(10,8,20,0.95);
        border:1.5px solid ${victory?'#f0c040':'#c04040'};
        border-radius:18px;padding:28px 24px;text-align:center;
        box-shadow:0 0 40px ${victory?'rgba(240,192,64,0.3)':'rgba(192,64,64,0.3)'};
        transform:translateY(20px);transition:transform 0.5s ease;
      " id="result-card">

        <div style="font-size:22px;font-weight:700;color:${victory?'#f0c040':'#ff5050'};
          margin-bottom:4px;letter-spacing:.05em;">
          ${title}
        </div>
        ${starsHtml}

        <div style="border-top:1px solid rgba(255,255,255,0.1);margin:14px 0 10px;"></div>

        <!-- 스탯 목록 -->
        <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:16px;">
          ${statRows.map(r=>`
            <div style="display:flex;align-items:center;justify-content:space-between;
              padding:5px 10px;background:rgba(255,255,255,0.04);border-radius:8px;">
              <span style="font-size:12px;color:#8a7a6a;">${r.icon} ${r.label}</span>
              <span style="font-size:13px;color:#e8dcc8;font-weight:600;">${r.val}</span>
            </div>
          `).join('')}
        </div>

        ${window._s2UnlockMsg ? `
        <!-- [UPDATE 2026-07-06] 시즌2 스토리 해금 배너 -->
        <!-- [UPDATE 2026-07-14] 260713_MTOPC.md 18번: spriteKey 있으면 원본 풀사이즈 이미지로 임팩트 강화 -->
        <div style="
          margin-bottom:14px;padding:10px 12px;border-radius:10px;text-align:center;
          background:rgba(140,60,255,0.15);border:1px solid rgba(180,120,255,0.5);
        ">
          ${(window._s2UnlockMsg.spriteKey && SPRITES?.pets?.[window._s2UnlockMsg.spriteKey]) ? `
            <img src="${SpriteLoader.get(SPRITES.pets[window._s2UnlockMsg.spriteKey].src).src}"
              style="width:${window._s2UnlockMsg.popupW||78}px;height:${window._s2UnlockMsg.popupH||104}px;
                object-fit:contain;image-rendering:pixelated;display:block;margin:0 auto 6px;">
          ` : ''}
          <div style="font-size:13px;color:#d8b8ff;font-weight:600;">${window._s2UnlockMsg.icon} ${isKo ? window._s2UnlockMsg.ko : window._s2UnlockMsg.en}</div>
        </div>
        ` : ''}
        ${window._beginnerGiftParts ? `
        <!-- [UPDATE 2026-07-14] 초보자 선물 배너 — 스테이지1~20 최초 클리어 보너스 -->
        <div style="
          margin-bottom:14px;padding:10px 12px;border-radius:10px;text-align:center;
          background:rgba(255,200,60,0.12);border:1px solid rgba(255,210,90,0.5);
        ">
          <div style="font-size:12px;color:#ffd870;font-weight:700;margin-bottom:6px;">🎁 ${isKo?'초보자 선물':'Beginner Gift'}</div>
          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;font-size:12px;color:#f0e0c0;">
            ${window._beginnerGiftParts.map(p => {
              const _iconHTML = p.key==='gold' ? '🪙' : p.key==='gems' ? '💎' : _cimg(p.key,14);
              return `<span>${_iconHTML} +${p.amount.toLocaleString()}</span>`;
            }).join('')}
          </div>
        </div>
        ` : ''}
        <!-- 재화 카운트업 -->
        <div id="gold-reward" style="
          font-size:18px;color:${earnedSpecial>0?'#c0e0ff':'#f0c040'};font-weight:700;
          margin-bottom:16px;letter-spacing:.05em;
          opacity:0;transform:scale(0.8);
          transition:opacity 0.4s ease, transform 0.4s ease;
        ">${earnedSpecial>0 ? specialIcon : '🪙'} +<span id="gold-count">0</span></div>

        <!-- 버튼 -->
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          ${canRetry && !victory ? `
            <button id="result-retry" style="
              flex:1;padding:13px 0;border-radius:10px;font-size:13px;font-weight:600;
              background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.2);
              color:#c8b8a0;cursor:pointer;font-family:inherit;
            ">${isKo?'🔄 재도전':'🔄 Retry'}</button>
          ` : ''}
          ${victory && gameMode==='normal' && stageId % 10 !== 0 ? `
            <button id="result-next" style="
              flex:1;padding:13px 0;border-radius:10px;font-size:13px;font-weight:600;
              background:rgba(64,160,64,0.5);border:1px solid #40a040;
              color:#c0ffc0;cursor:pointer;font-family:inherit;
            ">${isKo?'▶ 다음 스테이지':'▶ Next Stage'}</button>
          ` : ''}
          <button id="result-lobby" class="${victory && gameMode==='normal' && stageId===1 ? 'onboard-pulse' : ''}" style="
            flex:1;padding:13px 0;border-radius:10px;font-size:13px;font-weight:600;
            background:${victory?'rgba(112,64,192,0.5)':'rgba(80,20,20,0.6)'};
            border:1px solid ${victory?'#a060e0':'#803030'};
            color:#e8dcc8;cursor:pointer;font-family:inherit;
          ">${isKo?'🏠 로비':'🏠 Lobby'}</button>
        </div>
      </div>`;

    // 게임 컨테이너에 붙임
    canvas.parentElement.appendChild(div);

    // 페이드인 + 카드 슬라이드
    requestAnimationFrame(()=>{
      div.style.opacity = '1';
      const card = document.getElementById('result-card');
      if (card) card.style.transform = 'translateY(0)';
    });

    // 재화 카운트업 애니메이션
    const rewardTotal = earnedSpecial > 0 ? earnedSpecial : earnedGold;
    if (rewardTotal > 0) {
      setTimeout(()=>{
        const goldEl = document.getElementById('gold-reward');
        const countEl = document.getElementById('gold-count');
        if (!goldEl || !countEl) return;
        goldEl.style.opacity = '1';
        goldEl.style.transform = 'scale(1)';
        let cur = 0;
        const step = Math.max(1, Math.ceil(rewardTotal / 30));
        const iv = setInterval(()=>{
          cur = Math.min(cur + step, rewardTotal);
          countEl.textContent = cur.toLocaleString();
          if (cur >= rewardTotal) clearInterval(iv);
        }, 40);
      }, 600);
    }

    // 버튼 이벤트
    document.getElementById('result-lobby')?.addEventListener('click', ()=>{
      document.getElementById('result-overlay')?.remove();
      canvas._retSet = false;
      if (_pendingEnding) { _pendingEnding = false; SceneManager.go('ending'); }
      else if (_pendingEnding2) { _pendingEnding2 = false; SceneManager.go('ending', { season:2 }); } // [UPDATE 2026-07-14] 260713_MTOPC.md 16번
      else if (_pendingEnding3) { _pendingEnding3 = false; SceneManager.go('ending', { season:3 }); } // [UPDATE 2026-07-17]
      else SceneManager.go('lobby');
    });
    document.getElementById('result-retry')?.addEventListener('click', ()=>{
      document.getElementById('result-overlay')?.remove();
      canvas._retSet = false;
      SceneManager.go('game', { stageId, difficulty });
    });
    document.getElementById('result-next')?.addEventListener('click', ()=>{
      document.getElementById('result-overlay')?.remove();
      canvas._retSet = false;
      SceneManager.go('game', { stageId: stageId + 1, difficulty });
    });

    // 자동/반자동 모드: 5초 카운트다운 후 자동 진행
    if (autoMode > 0) {
      let countdown = 5;
      const cdEl = document.createElement('div');
      cdEl.id = 'result-countdown';
      cdEl.style.cssText = 'text-align:center;font-size:11px;color:rgba(200,180,255,0.6);margin-top:8px;';
      const _resEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      cdEl.textContent = _resEn?`Auto-advancing in ${countdown}s...`:`자동 진행 ${countdown}초 후...`;
      const card = document.getElementById('result-card');
      if (card) card.appendChild(cdEl);
      const cdIv = setInterval(()=>{
        countdown--;
        if (!document.getElementById('result-overlay')) { clearInterval(cdIv); return; }
        if (countdown <= 0) {
          clearInterval(cdIv);
          document.getElementById('result-overlay')?.remove();
          canvas._retSet = false;
          if (gameMode !== 'normal') {
            // 던전/무한/보스러시: 패배 시 같은 모드로 재시작, 승리 시 로비
            // [UPDATE 2026-07-15] 260715_MTOPC.md 3번: rewardMode 누락 버그 수정 — 재도전 시 _rewardMode가 null로
            // 리셋되면서 다이아/특수재화 대신 골드가 나오던 문제 (6개 재화던전 전부 해당)
            if (!victory) SceneManager.go('game', { mode: gameMode, difficulty, rewardMode: _rewardMode });
            else SceneManager.go('lobby');
          } else if (!victory) {
            SceneManager.go('game', { stageId, difficulty });
          } else {
            // [UPDATE 2026-07-17] 버그 수정: "stageId >= 50"이 붙어있어서 스테이지50 이후 전체(시즌1 후반~시즌3 전부)가
            // 자동/반자동 모드에서 절대 자동 진행되지 않고 매번 로비로 튕기던 문제 — 해금 트리거 스테이지에서만
            // 로비로 돌아가도록 UNLOCK_PENDING_STAGE_IDS(stage-select.js) 기준 목록으로 교체
            const LOBBY_CHANGE_STAGES = [1,5,10,15,20,25,30,100,110,160,200,300];
            const goLobbyAfter = LOBBY_CHANGE_STAGES.includes(stageId);
            if (goLobbyAfter) SceneManager.go('lobby');
            else SceneManager.go('game', { stageId: stageId + 1, difficulty });
          }
        } else {
          const el2 = document.getElementById('result-countdown');
          if (el2) el2.textContent = _resEn?`Auto-advancing in ${countdown}s...`:`자동 진행 ${countdown}초 후...`;
        }
      }, 1000);
    }
  }

  function enter(el,params){init(el,params);}
  function exit(){
    cancelAnimationFrame(rafId);
    document.getElementById('result-overlay')?.remove();
    window.removeEventListener('resize',onResize);
    if(window._pauseKeyHandler){window.removeEventListener('keydown',window._pauseKeyHandler);window._pauseKeyHandler=null;}
    window._cdReduction=0;window._boss=null;
    if(canvas){
      canvas._retSet=false;
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    }
  }

  // [UPDATE 2026-07-11] 260711_MTOPC.md 2-5: 삼위일체 달성 슬롯 수만큼 발광 구체가 캐릭터 주변을 궤도(반경50px, 발광15px, 5초/바퀴)
  function _drawElementTrinityOrbit(ctx,camX,camY){
    const slots = window._elementTrinitySlots;
    if (!slots || !slots.length) return;
    const sx = player.x-camX, sy = player.y-camY-20;
    const n = Math.min(3, slots.length);
    const baseAngle = (elapsed / 5.0) * Math.PI * 2; // 5초/바퀴
    for (let i=0; i<n; i++) {
      const el = slots[i];
      const meta = (typeof ELEMENT_META!=='undefined') ? ELEMENT_META[el] : null;
      if (!meta) continue;
      const ang = baseAngle + (Math.PI*2/n)*i;
      const ox = sx + Math.cos(ang)*50, oy = sy + Math.sin(ang)*50;
      ctx.save();
      const g = ctx.createRadialGradient(ox,oy,0,ox,oy,15);
      g.addColorStop(0, meta.bg); g.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.85; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ox,oy,15,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = meta.bg;
      ctx.beginPath(); ctx.arc(ox,oy,6,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  function _drawHitEffects(ctx,camX,camY){
    for(const h of (window._hitEffects||[])){
      const sc=SPRITES?.effects?.[h.key];
      const img=sc?SpriteLoader.get(sc.src):null;
      const prog=h.t/h.life;
      const sx=h.x-camX+h.ox*prog, sy=h.y-camY+h.oy*prog;
      ctx.save();
      ctx.globalAlpha=Math.max(0,1-prog*1.5);
      const scale=0.7+prog*0.5;
      if(img?.complete&&img.naturalWidth>0&&sc){
        ctx.drawImage(img,sx-sc.drawW*scale/2,sy-sc.drawH*scale/2,sc.drawW*scale,sc.drawH*scale);
      } else {
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(sx,sy,6*(1-prog),0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
  }

  function _drawEnemyProjs(ctx,camX,camY){
    for(const ep of enemyProjs){
      const sx=ep.x-camX,sy=ep.y-camY;
      ctx.save();ctx.globalAlpha=0.85;
      const g=ctx.createRadialGradient(sx,sy,0,sx,sy,ep.radius*2);
      g.addColorStop(0,ep.color||'#ff2020');g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,ep.radius*2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=ep.color||'#ff2020';ctx.beginPath();ctx.arc(sx,sy,ep.radius,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
  }

  // ── 줌 제어 ──
  function zoomIn()  { zoom = Math.min(2.0, +(zoom + 0.25).toFixed(2)); }
  function zoomOut() { zoom = Math.max(0.5, +(zoom - 0.25).toFixed(2)); }

  // 마우스 휠 줌 (PC)
  function onWheel(e) {
    e.preventDefault();
    if (state !== 'playing') return;
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }

  // 핀치줌 (모바일)
  let _pinchDist = 0;
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      _pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }
  function onTouchMove(e) {
    if (e.touches.length === 2 && _pinchDist > 0) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = newDist - _pinchDist;
      if (Math.abs(delta) > 8) {
        if (delta > 0) zoomIn();
        else zoomOut();
        _pinchDist = newDist;
      }
    }
  }

  return{enter,exit,pickLevelUp,confirmPick,togglePause,resumeGame,toggleMute,goLobby,zoomIn,zoomOut,cycleSpeed,cycleAutoMode,summonClone};
})();
