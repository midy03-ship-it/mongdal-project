// save.js - 저장/불러오기 시스템
const Save = (() => {
  const KEY = 'mongdal_save';
  const KEY_PART2 = 'mongdal_save_part2'; // [UPDATE 2026-08-02] 파트2 전용 완전 별도 세이브 슬롯
  // [UPDATE 2026-07-31] 세이브 코드 붙여넣기 실수로 기존 진행도가 복구 불가능하게 날아가던 문제 대비용 백업 슬롯
  const BACKUP_KEY = 'mongdal_save_backup';

  // [UPDATE 2026-08-02] 활성 프로필 — "파트1"(기존 세이브) / "파트2"(완전 새 시작, 골드·무기·동료 전부 0부터).
  // 이 플래그 자체는 세이브 데이터 안이 아니라 별도 localStorage 키에 둔다(어느 세이브를 볼지 결정하는
  // 상위 스위치라 세이브 데이터 그 자체와 같이 저장/마이그레이션되면 안 됨).
  // load()/save()가 이 값만 보고 KEY/KEY_PART2 중 하나로 읽고 쓰므로, 나머지 코드(game.js 등 수십 개 파일)는
  // Save.load()/Save.save()만 그대로 쓰면 되고 어느 프로필인지 신경 쓸 필요가 전혀 없다.
  const PROFILE_KEY = 'mongdal_active_profile';
  function getActiveProfile() {
    return localStorage.getItem(PROFILE_KEY) === 'part2' ? 'part2' : 'part1';
  }
  function setActiveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, profile === 'part2' ? 'part2' : 'part1');
  }
  function _storageKey() { return getActiveProfile() === 'part2' ? KEY_PART2 : KEY; }
  // 어느 프로필을 보고 있든(파트1/파트2 둘 다 season8ClearEnding=true라 구분이 안 됨) "파트2를 이미
  // 시작했는가"만 따로 물을 수 있어야 로비 균열의 황금 이펙트를 1회성으로 숨길 수 있다.
  function hasPart2Save() {
    try { return !!localStorage.getItem(KEY_PART2); } catch (e) { return false; }
  }

  // [UPDATE 2026-07-31] 세이브 스키마 버전 — 기존엔 버전 개념이 없어서 마이그레이션을 매 로드마다
  // 무조건 돌리는 수밖에 없었고(아래 _migrateSeasonGates 주석 참고), 그래서 "일회성 정리"여야 할
  // 회수 로직이 영구히 상주하는 상태였음. 버전을 두면 (1) 과거 세이브에 한 번만 적용하고,
  // (2) 앞으로 진짜 구조 변경이 필요할 때 "이 버전 이하만 변환" 같은 조건부 처리가 가능해짐.
  //   v1 = 버전 필드가 없던 시절의 모든 세이브
  //   v2 = 시즌 게이트 회수를 1회 적용 완료한 상태
  const SCHEMA_VERSION = 2;

  const defaults = {
    schemaVersion: SCHEMA_VERSION,
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
    specialtyItems: {}, // [UPDATE 2026-07-19] 보물 창고 특산품 보유량 — { s1_soulwill: 3, ... }
    currentChapter: 1,
    buildings: {},
    totalKills: 0,
    runs: 0,
    selectedMainWeapons: ['talisman'],
    decks: [],  // [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑥: 무기셋(덱) 5슬롯 — { mainWeapons, companions, pets } 스냅샷
    unlockedWeapons: ['talisman'],
    weaponLevels: {},  // { talisman: 3, sword: 1, ... } 1~25강
    ganghwaseok: 0,   // 강화석 - 무기 강화 재료
    cheonunseok: 0,   // 천운석 - 건물 강화 재료
    cheonryeonggwa: 0, // 천령과 - 펫 강화 재료
    taegeukseok: 0,   // 태극석 - 무기 슬롯 재료
    chaewonseok: 0,   // 차원석 - 차원 상인 거래 재화
    // [UPDATE 2026-07-26] 버그 수정: 코드 곳곳에서 sd.hondonseok/sd.sullriseok를 ||0 폴백으로만 다루고 있어
    // 실제로는 잘 작동하고 있었지만 defaults 스키마 목록에서 누락되어 있던 걸 정식으로 추가 (문서/스키마 일관성)
    hondonseok: 0,    // 혼돈석 - 시즌3(망랑계) 던전 재화, 다중 애기씨 소환에도 사용
    sullriseok: 0,    // 순리석 - 시즌4(귀허계) 던전 재화, 명(命) 강화에 사용
    // [UPDATE 2026-07-17] yeongonseok(무기초월 재료, 획득경로 없어 영원히 0이던 유령 재화)를
    // soulStones(명부강화 재료, 드랍+차원상인 교환으로 실제 모을 수 있음)로 통합 — 필드 자체를 제거
    soulStones: 0,    // 영혼석 - 무기초월 + 명부강화 공용 재료
    weaponTranscend: {}, // [UPDATE 2026-07-08] 무기 초월 { talisman: 0~10, sword: 0~10, ... }
    companionFragments: {},  // { dochi: 3, aram: 7, ... }
    universalFragments: 0,   // 만능 파편
    companionStars: {},      // { dochi: 2, ... } 0-4 (5개 = 각성 1성)
    companionAwakening: {},  // { dochi: 1, ... } 0-5
    statUpgrades: {},
    sinmokUpgrades: {},
    myeongLv: 0, // [UPDATE 2026-07-17] 명(命) 강화 (시즌4, 순리석)
    // [UPDATE 2026-07-22] 선술 스킬트리 (시즌5, 선기석) 전면 재설계 — 뿌리(공용)→줄기(음/양 택1)→가지(하위분기 택1)→필살기
    // { root1:{root_atk:0~3,...}, root2:{root_crit:0~3,...}, path:'yang'|'yin'|null, branch:'quick'|'fire'|'bind'|'ward'|null,
    //   passiveLv:0~5, subUnlocked:bool, finalUnlocked:bool }
    sinmokS5: {},
    sullgiseok: 0,   // 선기석 - 선술 스킬트리 강화 재화 (차원상인에서 차원석 교환)
    // [UPDATE 2026-07-24] 시즌6(원계) 법칙 시스템 — 규율석은 동료 파편 교환 전용, 인게임/던전 드랍 없음
    gyulyulseok: 0,  // 규율석 - 법칙 해금/강화 재화 (동료 파편 교환 전용)
    laws: {},        // 보유 법칙 레벨 { law_sentinel: 3, ... } — 키가 있으면 보유(해금)한 것
    lawSlots: [null, null, null], // 장착 슬롯 3개 (law id 또는 null)
    // [UPDATE 2026-07-31] 시즌7(어계) — 슈브니구라스의 축복. 그레이트 이스에게 1골드에 사서 영구 누적된다.
    // 어계에서는 보유 수만큼 전투력 배율(1+n)로 작용하지만, 황계에서는 정체를 드러내 그대로 "오염도" 페널티가 됨.
    // 즉 이 한 필드가 버프이자 저주 — 자세한 설계는 WORLDBUILDING.md "어계→황계 전환 시스템" 참고.
    blessings: 0,
    speedMult: 1,
    autoMode: 0,
    achievements: {},
    achievementRewards: {},
    achievementProgress: {},
  };

  // [UPDATE 2026-07-24] 세이브 마이그레이션 — 예전에 시즌 게이트 자체가 빠져있던 버그(2026-07-19 수정)
  // 시절에 조건 안 갖추고 이미 획득된 펫/동료를 다시 검증해서 자격 미달이면 회수.
  // (신규 구매/뽑기를 막는 것만으로는 "이미 획득한 것"까지는 못 걸러서 별도로 필요)
  //
  // [UPDATE 2026-07-31] ⚠️ 이 함수는 보유 펫/동료를 "영구 삭제"한다. 판단 근거인 seasonXClear 플래그는
  // 과거에 두 번이나 설정 누락 버그가 났던 값이다(season2Clear: game.js:3635 주석 / season6·7Clear: 2026-07-29 수정).
  // 매 로드마다 무조건 돌던 기존 구조에서는 "플래그 버그 1회 = 정상 유저의 수집물 영구 소실"이 되어
  // 실수 대비 피해가 지나치게 컸음. 이제 _migrate()가 v1 세이브에 한해 1회만 호출하며,
  // 한 번 v2로 올라간 세이브에는 다시 적용되지 않는다(= 훗날 플래그 버그가 나도 소급 압수 없음).
  function _migrateSeasonGates(data) {
    if (typeof GAME_DATA === 'undefined' || typeof Unlock === 'undefined') return data;
    if (data.pets && data.pets.length) {
      data.pets = data.pets.filter(id => {
        const pd = GAME_DATA.pets.find(p => p.id === id);
        if (!pd) return true; // 정의 안 된 id는 건드리지 않음
        if (pd.season2 && !Unlock.cleared(data, 110)) return false;
        if (pd.season3 && !data.season2Clear) return false;
        if (pd.season4 && !(data.season3Clear && isSeasonReleased(4))) return false;
        if (pd.season5 && !(data.season4Clear && isSeasonReleased(5))) return false;
        if (pd.season7 && !(data.season6Clear && isSeasonReleased(7))) return false; // [UPDATE 2026-07-31] 시즌7 펫
        return true;
      });
      if (data.activePets) data.activePets = data.activePets.filter(id => data.pets.includes(id));
    }
    // 동료 — shop-scene.js의 시즌 게이트 뽑기풀과 동일한 규칙(하드코딩 목록, 동료 데이터엔 시즌 필드가 없어서 여기 직접 명시)
    const COMPANION_SEASON_GATE = {
      haewonmaek:      () => Unlock.cleared(data, 110),
      baksu:            () => !!data.season2Clear,
      janggu_aebi:      () => !!data.season2Clear,
      gangnim:          () => Unlock.cleared(data, 160),
      hwansaengdongja:  () => !!data.season3Clear && isSeasonReleased(4),
      heomugeomsa:      () => !!data.season3Clear && isSeasonReleased(4),
      baekunseonin:     () => !!data.season4Clear && isSeasonReleased(5),
      maehwageomseon:   () => !!data.season4Clear && isSeasonReleased(5),
      // [UPDATE 2026-07-31] 시즌7(어계) 영입 동료 — shop-scene.js의 S7_DIAMOND_WEIGHTS 게이트와 동일 조건
      mirinae:          () => !!data.season6Clear && isSeasonReleased(7),
      cheonja:          () => !!data.season6Clear && isSeasonReleased(7),
    };
    if (data.companions && data.companions.length) {
      data.companions = data.companions.filter(id => {
        const check = COMPANION_SEASON_GATE[id];
        return !check || check();
      });
      if (data.activeCompanions) data.activeCompanions = data.activeCompanions.filter(id => data.companions.includes(id));
    }
    return data;
  }

  // [UPDATE 2026-07-31] 스키마 버전 기반 마이그레이션 러너.
  // fromVersion(세이브에 기록돼 있던 버전) 기준으로 필요한 변환만 순서대로 적용한다.
  // 저장은 호출부에서 — load()/applyCode()가 각자 시점에 맞게 처리.
  function _migrate(data, fromVersion) {
    if (fromVersion < 2) _migrateSeasonGates(data);
    data.schemaVersion = SCHEMA_VERSION;
    return data;
  }

  // 세이브에 기록된 스키마 버전. 필드 자체가 없던 시절 세이브는 v1로 간주한다.
  // (주의: defaults와 병합한 뒤에 읽으면 defaults의 최신 버전값이 섞여서 항상 최신으로 보이므로,
  //  반드시 병합 전 원본에서 읽어야 한다)
  function _readVersion(rawObj) {
    return typeof rawObj.schemaVersion === 'number' ? rawObj.schemaVersion : 1;
  }

  function load() {
    try {
      const raw = localStorage.getItem(_storageKey());
      if (!raw) return { ...defaults };
      const parsed = JSON.parse(raw);
      const from = _readVersion(parsed);
      const data = { ...defaults, ...parsed };
      if (from < SCHEMA_VERSION) {
        _migrate(data, from);
        save(data); // 즉시 영속화 — 안 하면 다음 로드 때 마이그레이션이 또 돌아 "1회성"이 깨짐
      }
      return data;
    } catch (e) {
      console.warn('세이브 불러오기 실패:', e);
      return { ...defaults };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(_storageKey(), JSON.stringify(data));
    } catch (e) {
      console.warn('세이브 저장 실패:', e);
    }
  }

  function reset() {
    localStorage.removeItem(_storageKey());
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

  // ═══════════════════════════════════════════════════
  //  [UPDATE 2026-07-17] 세이브 코드 (내보내기/불러오기)
  //  PC↔모바일 간 itch.io는 세이브가 자동 동기화되지 않아서, 세이브데이터를 통째로
  //  텍스트 코드로 내보내/붙여넣기로 옮기는 기능. 압축은 하지 않음(문자열이 길어지면
  //  추후 LZString 등 추가 검토) — base64 인코딩만으로 우선 구현.
  // ═══════════════════════════════════════════════════
  // [UPDATE 2026-07-31] 0.3.1.4에서 갱신이 멈춰 있어 내보낸 코드가 전부 잘못된 버전을 표시하고 있었음.
  // 코드베이스 전체에서 게임 버전을 담는 곳이 여기뿐이라, 릴리즈할 때 이 상수도 같이 올릴 것.
  const SAVE_CODE_GAME_VERSION = '1.1.0'; // [UPDATE 2026-08-06] 파트2 오픈 — 릴리즈마다 갱신

  function _detectDevice() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ? 'mobile' : 'pc';
  }

  // 간단한 체크섬(오탈자/복사 잘림 감지용 — 치트 방지 목적 아님)
  function _checksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash.toString(36);
  }

  // 유니코드(한글 등) 포함 문자열을 안전하게 base64로
  function _b64Encode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function _b64Decode(b64) {
    return decodeURIComponent(escape(atob(b64)));
  }

  function exportCode(data) {
    const payload = {
      v: 1, // 세이브 코드 포맷 버전(saveData 스키마 버전 아님 — 마이그레이션 필요해지면 올림)
      gameVersion: SAVE_CODE_GAME_VERSION,
      savedAt: Date.now(), // UTC epoch ms — 표시할 땐 보는 기기의 로컬 시간대로 변환해서 렌더링
      device: _detectDevice(),
      data,
    };
    const b64 = _b64Encode(JSON.stringify(payload));
    const sum = _checksum(b64);
    return `MDL1.${sum}.${b64}`;
  }

  function _buildPreview(payload) {
    const d = payload.data;
    const allCleared = [
      ...(d.clearedStagesEasy || []),
      ...(d.clearedStagesNormal || []),
      ...(d.clearedStagesHard || []),
    ];
    return {
      gameVersion: payload.gameVersion,
      savedAt: payload.savedAt,
      device: payload.device,
      maxStage: allCleared.length ? Math.max(...allCleared) : 0,
      achievementsCount: Object.keys(d.achievements || {}).length,
      companionsCount: (d.companions || []).length,
      petsCount: (d.pets || []).length,
      buildingsCount: Object.keys(d.buildings || {}).length,
      gold: d.gold || 0,
      gems: d.gems || 0,
    };
  }

  // 코드 검증 + 미리보기 생성. 실제 적용은 applyCode()에서 별도로.
  function parseCode(code) {
    const trimmed = (code || '').trim();
    const parts = trimmed.split('.');
    if (parts.length !== 3 || parts[0] !== 'MDL1') {
      return { ok: false, error: 'format' };
    }
    const [, sum, b64] = parts;
    if (_checksum(b64) !== sum) {
      return { ok: false, error: 'checksum' };
    }
    let payload;
    try {
      payload = JSON.parse(_b64Decode(b64));
    } catch (e) {
      return { ok: false, error: 'parse' };
    }
    if (!payload || typeof payload !== 'object' || !payload.data) {
      return { ok: false, error: 'format' };
    }
    return { ok: true, payload, preview: _buildPreview(payload) };
  }

  // parseCode()로 검증된 payload를 실제로 적용(기본값과 병합 후 저장)
  // [UPDATE 2026-07-31] 덮어쓰기 전 기존 세이브를 백업 슬롯에 보관 — 코드를 잘못 붙여넣어
  // 수십 시간치 진행도가 되돌릴 수 없이 날아가던 위험 제거. 복구는 restoreBackup().
  // 또한 오래된 버전에서 내보낸 코드도 최신 스키마로 맞춰서 적용한다.
  function applyCode(payload) {
    try {
      const cur = localStorage.getItem(_storageKey());
      if (cur) localStorage.setItem(BACKUP_KEY, cur);
    } catch (e) {
      console.warn('세이브 백업 실패:', e); // 백업 실패가 적용 자체를 막지는 않음
    }
    const from = _readVersion(payload.data || {});
    const merged = { ...defaults, ...payload.data };
    if (from < SCHEMA_VERSION) _migrate(merged, from);
    save(merged);
    return merged;
  }

  function hasBackup() {
    try { return !!localStorage.getItem(BACKUP_KEY); } catch (e) { return false; }
  }

  // 백업 슬롯의 세이브를 현재 세이브로 되돌린다. 성공 시 복구된 saveData를, 실패 시 null을 반환.
  function restoreBackup() {
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      if (!raw) return null;
      localStorage.setItem(_storageKey(), raw);
      localStorage.removeItem(BACKUP_KEY); // 1회용 — 복구 후 남겨두면 어느 쪽이 최신인지 혼동됨
      return load();
    } catch (e) {
      console.warn('세이브 복구 실패:', e);
      return null;
    }
  }

  return { load, save, reset, calcLobbyLevel, getLang, setLang,
           addCompanionFragments, unlockCompanionWithFragments,
           exportCode, parseCode, applyCode, hasBackup, restoreBackup,
           getActiveProfile, setActiveProfile, hasPart2Save };
})();
