// save.js - 저장/불러오기 시스템
const Save = (() => {
  const KEY = 'mongdal_save';

  const defaults = {
    gold: 0,
    gems: 0,
    lobbyLevel: 1,
    companions: [],        // 보유 동료 id 목록
    activeCompanions: [],  // 편성된 동료 (최대 3)
    pets: [],
    petLevels: {},
    activePets: [],
    weapons: [],
    clearedStages: [],
    clearedStagesEasy: [],
    clearedStagesNormal: [],
    clearedStagesHard: [],
    clearedChapters: [],
    currentChapter: 1,
    buildings: {},
    totalKills: 0,
    runs: 0,
    selectedMainWeapons: ['talisman'],
    unlockedWeapons: ['talisman'],
    weaponLevels: {},  // { talisman: 3, sword: 1, ... } 1~25강
    ganghwaseok: 0,   // 강화석 - 무기 강화 재료
    cheonunseok: 0,   // 천운석 - 건물 강화 재료
    cheonryeonggwa: 0, // 천령과 - 펫 강화 재료
    taegeukseok: 0,   // 태극석 - 무기 슬롯 재료
    chaewonseok: 0,   // 차원석 - 차원 상인 거래 재화
    yeongonseok: 0,   // 영혼석 - 무기 초월 재료 (시즌2 클리어 후 해금)
    weaponTranscend: {}, // [UPDATE 2026-07-08] 무기 초월 { talisman: 0~10, sword: 0~10, ... }
    companionFragments: {},  // { dochi: 3, aram: 7, ... }
    universalFragments: 0,   // 만능 파편
    companionStars: {},      // { dochi: 2, ... } 0-4 (5개 = 각성 1성)
    companionAwakening: {},  // { dochi: 1, ... } 0-5
    statUpgrades: {},
    sinmokUpgrades: {},
    speedMult: 1,
    autoMode: 0,
    achievements: {},
    achievementRewards: {},
    achievementProgress: {},
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch (e) {
      console.warn('세이브 불러오기 실패:', e);
      return { ...defaults };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('세이브 저장 실패:', e);
    }
  }

  function reset() {
    localStorage.removeItem(KEY);
    return { ...defaults };
  }

  // 로비 레벨 계산 (동료 수 기반)
  function calcLobbyLevel(data) {
    const count = (data.companions || []).length;
    if (count === 0) return 1;
    if (count === 1) return 2;
    if (count <= 2) return 3;
    if (count <= 4) return 4;
    return 5;
  }

  // ── 동료 파편 관련 유틸 ──
  function addCompanionFragments(data, id, amount) {
    if (!data.companionFragments) data.companionFragments = {};
    data.companionFragments[id] = (data.companionFragments[id] || 0) + amount;
    if ((data.companions || []).includes(id)) _processStars(data, id);
  }

  function _processStars(data, id) {
    if (!data.companionStars)     data.companionStars    = {};
    if (!data.companionAwakening) data.companionAwakening = {};
    let frags = data.companionFragments[id] || 0;
    let stars = data.companionStars[id]     || 0;
    let awk   = data.companionAwakening[id] || 0;
    while (frags >= 5 && awk < 5) {
      frags -= 5;
      stars++;
      if (stars >= 5) { stars = 0; awk++; }
    }
    data.companionFragments[id] = frags;
    data.companionStars[id]     = stars;
    data.companionAwakening[id] = awk;
  }

  function unlockCompanionWithFragments(data, id) {
    if (!data.companionFragments) data.companionFragments = {};
    if ((data.companionFragments[id] || 0) < 10) return false;
    if ((data.companions || []).includes(id)) return false;
    data.companionFragments[id] -= 10;
    data.companions = [...(data.companions || []), id];
    _processStars(data, id);
    return true;
  }

  const LANG_KEY = 'mongdal_lang';
  function getLang()     { return localStorage.getItem(LANG_KEY) || null; }
  function setLang(lang) { localStorage.setItem(LANG_KEY, lang); }

  return { load, save, reset, calcLobbyLevel, getLang, setLang,
           addCompanionFragments, unlockCompanionWithFragments };
})();
