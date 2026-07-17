// unlock.js - 해금 시스템
// 스테이지 클리어 → 건물/시스템 순차 해금

const Unlock = (() => {

  // 해금 정의: 조건 → 해금되는 것
  // 이지/노말/하드 어느 난이도든 해당 스테이지 클리어 시 해금
  function cleared(save, stageId) {
    return (save.clearedStages        || []).includes(stageId)
        || (save.clearedStagesEasy    || []).includes(stageId)
        || (save.clearedStagesNormal  || []).includes(stageId)
        || (save.clearedStagesHard    || []).includes(stageId);
  }

  const UNLOCK_TABLE = [
    {
      id: 'daejanggan',
      name: '대장간',
      condition: (save) => cleared(save, 5),
      unlocks: ['daejanggan', 'nav_daejanggan', 'mainWeaponSwitch', 'dungeon_ganghwaseok'],
      message: '대장간이 열렸습니다.\n무기를 구매하고 주무기를 변경할 수 있습니다.\n강화석 던전이 해금되었습니다.',
      icon: '⚒️',
    },
    {
      id: 'uiwon',
      name: '의원당',
      condition: (save) => cleared(save, 10),
      unlocks: ['uiwon', 'companion', 'nav_companion', 'nav_shop'],
      message: '의원당이 세워졌습니다.\n동료를 모집할 수 있습니다.',
      icon: '👥',
    },
    {
      id: 'seonang',
      name: '서낭당',
      condition: (save) => cleared(save, 15),
      unlocks: ['seonang', 'weapon', 'nav_weapon', 'dungeon_infinite', 'dungeon_bossrush'],
      message: '서낭당이 세워졌습니다.\n무한 던전과 보스러쉬가 해금되었습니다.',
      icon: '⛩️',
    },
    {
      id: 'jangsang',
      name: '장승당',
      condition: (save) => cleared(save, 20),
      unlocks: ['jangsang', 'building', 'nav_building', 'dungeon_cheonunseok'],
      message: '장승당이 세워졌습니다.\n건물 업그레이드와 천운석 던전이 해금되었습니다.',
      icon: '🗿',
    },
    {
      id: 'yongwang',
      name: '용왕 연못',
      condition: (save) => cleared(save, 25),
      unlocks: ['yongwang', 'pet', 'nav_pet', 'dungeon_cheonryeonggwa'],
      message: '용왕 연못이 생겼습니다.\n펫을 키울 수 있습니다.\n천령과 던전이 해금되었습니다.',
      icon: '🐉',
    },
    {
      id: 'sinmok',
      name: '신목',
      condition: (save) => cleared(save, 30),
      unlocks: ['sinmok', 'nav_sinmok', 'dungeon_taegeukseok'],
      message: '신목이 깨어났습니다.\n영구 강화가 가능합니다.\n태극석 던전이 해금되었습니다.',
      icon: '🌳',
    },
    {
      id: 'season1_end',
      name: '시즌 1 완료',
      condition: (save) => !!save.season1Clear,
      unlocks: ['currency_chaewonseok', 'merchant_npc'],
      message: '',
      icon: '🌀',
    },
    // [UPDATE 2026-07-15] 260715_MTOPC.md 4/9번: 시즌별 특화재화 전용 던전 해금
    // [UPDATE 2026-07-17] 조건을 "그 시즌 전체 클리어" → "그 시즌이 열리는 시점"으로 변경.
    // 기존엔 시즌3을 다 깨야 시즌3 전용 재화(혼돈석)를 파밍할 수 있어서, 정작 시즌3을 플레이하는
    // 동안엔 못 쓰는 구조였음(강화석/태극석 등 다른 던전들은 전부 그 시즌 진행 도중에 열림).
    {
      id: 'hondonseok_dungeon',
      name: '혼돈석 던전',
      condition: (save) => !!save.season2Clear, // 시즌3(망랑계) 진입 시점
      unlocks: ['dungeon_hondonseok'],
      message: '혼돈석 던전이 해금되었습니다.',
      icon: '🌪️',
    },
    {
      id: 'sullriseok_dungeon',
      name: '순리석 던전',
      condition: (save) => !!save.season3Clear, // 시즌4(귀허계) 진입 시점 — 시즌4 콘텐츠 자체가 아직 없어 당분간 잠김 상태 유지
      unlocks: ['dungeon_sullriseok'],
      message: '순리석 던전이 해금되었습니다.',
      icon: '🌊',
    },
  ];

  // 현재 해금된 항목 목록 반환
  function getUnlocked(save) {
    const result = new Set(['stage', 'nav_stage']);
    for (const entry of UNLOCK_TABLE) {
      if (entry.condition(save)) {
        entry.unlocks.forEach(u => result.add(u));
      }
    }
    return result;
  }

  // 새로 해금된 항목 감지 (이전 세이브와 비교)
  function getNewlyUnlocked(prevSave, nextSave) {
    const newItems = [];
    for (const entry of UNLOCK_TABLE) {
      if (!entry.condition(prevSave) && entry.condition(nextSave)) {
        newItems.push(entry);
      }
    }
    return newItems;
  }

  // 건물 목록 (로비에 표시할 순서대로)
  // px, py: 390×(sceneH) 화면 비율 좌표 (lobby_7.jpg 기준)
  const LOBBY_BUILDINGS = [
    {
      id: 'daejanggan',
      get label() { return Lang.t('nav','daejanggan'); },
      scene: 'blacksmith',
      x: 0.12, px: 0.22, py: 0.46,
      unlockId: 'daejanggan',
    },
    {
      id: 'uiwon',
      get label() { return Lang.t('nav','companion'); },
      scene: 'character',
      x: 0.26, px: 0.74, py: 0.32,
      unlockId: 'uiwon',
    },
    {
      id: 'seonang',
      get label() { return Lang.t('nav','weapon'); },
      scene: 'dungeon',
      x: 0.42, px: 0.26, py: 0.31,
      unlockId: 'seonang',
    },
    {
      id: 'jangsang',
      get label() { return Lang.t('nav','building'); },
      scene: 'building',
      x: 0.58, px: 0.78, py: 0.46,
      unlockId: 'jangsang',
    },
    {
      id: 'yongwang',
      get label() { return Lang.t('nav','petTooltip'); },
      scene: 'pet',
      x: 0.74, px: 0.50, py: 0.58,
      unlockId: 'yongwang',
    },
    {
      id: 'sinmok',
      get label() { return Lang.t('nav','sinmok'); },
      scene: 'playerScene',
      x: 0.88, px: 0.50, py: 0.23,
      unlockId: 'sinmok',
    },
  ];

  return { getUnlocked, getNewlyUnlocked, UNLOCK_TABLE, LOBBY_BUILDINGS, cleared }; // [UPDATE 2026-07-14] 260714_MTOPC.md 4번: 스테이지 선택 화면 무지개 테두리용으로 cleared() 재사용 노출
})();
