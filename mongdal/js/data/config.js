// config.js - 게임 전체 설정값 중앙 관리
// 여기서 값을 바꾸면 게임 전체에 반영됩니다.

const CONFIG = {

  // ── 플레이어 기본 스탯 ──
  PLAYER: {
    BASE_HP:       100,
    BASE_SPEED:    130,     // px/sec (MOV 100 기준)
    IFRAME_SEC:    0.65,    // 피격 후 무적 시간(초)
    XP_NEXT_BASE:  6,       // 첫 레벨업에 필요한 XP
    XP_NEXT_SCALE: 1.25,    // 레벨업마다 XP 요구량 × 배율
    XP_NEXT_ADD:   4,       // 레벨업마다 추가
    HP_ON_LEVEL:   8,       // 레벨업 시 maxHp 증가
    HEAL_ON_LEVEL: 25,      // 레벨업 시 즉시 회복
  },

  // ── 기본 스탯 ──
  BASE_STATS: {
    atk: 100,   // 공격력 (무기 피해 곱연산)
    spd: 100,   // 공격속도 (쿨타임 단축)
    mov: 100,   // 이동속도
    def: 0,     // 방어력 (피해 감소)
    eva: 0,     // 회피율 % (최대 40%)
  },

  // 레벨업당 자동 스탯 상승
  LEVEL_STAT_GAIN: {
    atk: 3,
    spd: 2,
    mov: 1,
    def: 2,
    eva: 0.3,
  },

  // 로비 골드 강화 스탯 상승
  STAT_UPGRADE_PER_LEVEL: {
    atk: 5,
    spd: 3,
    mov: 2,
    def: 5,
    eva: 1,
    hp:  10,
  },

  // 강화 비용 (기본 × 2^단계)
  UPGRADE_BASE_COST: 100,
  UPGRADE_COST_MULT: 2,

  // 신목 영구강화 설정
  SINMOK: {
    BASE_COST: 300,
    COST_MULT: 2.2,
    MAX_LV: { critChance:10, critMult:5, atkSpd:10, movSpd:10, evasion:10 },
    PER_LV:  { critChance:5, critMult:0.1, atkSpd:5, movSpd:3, evasion:3 },
    CRIT_BASE_MULT: 1.2,  // 치명타 기본 배율
  },

  // [UPDATE 2026-07-16] 260716_MTOPC.md 2번②③: 던전강화 프레스티지 — 무한던전 시작 킬수를 밀어서
  // "1만킬 이후 ×200배 몬스터" 구간부터 바로 시작 가능하게 하는 영구강화. 상한 없음(계속 이어짐).
  // [UPDATE 2026-07-16] 비용 재화를 강화석→천운석(건물강화 재화)으로 변경 — 사용자 지시
  DUNGEON_UPGRADE: {
    KILLS_PER_LEVEL: 1000,   // 강화 1레벨당 시작 킬수 +1000
    BASE_COST_GOLD: 5000,
    COST_MULT: 1.5,
    BASE_COST_CHEONUNSEOK: 50,
    CHEONUNSEOK_COST_MULT: 1.35,
  },

  // [UPDATE 2026-07-06] 명부 영구강화 (시즌2 확장판, 영혼석 소모)
  SINMOK_S2: {
    BASE_COST: 3,   // 시작 비용 (영혼석)
    COST_STEP: 5,   // 5레벨마다 비용 +1 (lv0~4=3개, lv95~99=22개)
    MAX_LV: { extraDmg: 100, reflectDmg: 100 },
    PER_LV: { extraDmg: 3, reflectDmg: 0.2 }, // 추가데미지 +3%/렙(최대300%), 반사 +0.2%/렙(최대20%)
  },

  // [UPDATE 2026-07-17] 명(命) 강화 — 시즌4(귀허계) 특화 시스템, 신목에 순리석으로 강화.
  // 단일 트랙(0~10)으로, 구간마다 새 효과가 열리고 이전 구간 효과는 유지됨(중첩).
  // 명1~3: 치명타 시 HP 회복 / 명4~6: 사망 시 확률 자동생존 / 명7~9: 보스 앞 회피율 추가 / 명10: 보스 처치 추가 보상
  MYEONG: {
    BASE_COST: 20,   // 순리석
    COST_MULT: 1.35,
    MAX_LV: 10,
    CRIT_HEAL_PER_TIER: 3,      // 명1~3: 크리티컬 시 HP 회복 (레벨×3, 최대 lv3=9)
    REVIVE_CHANCE_PER_TIER: 10, // 명4~6: 사망 시 확률 자동생존 확률% ((lv-3)×10, 최대 lv6=30%)
    BOSS_EVADE_PER_TIER: 5,     // 명7~9: 보스 앞 회피율 추가% ((lv-6)×5, 최대 lv9=15%)
  },

  // [UPDATE 2026-07-22] 선술 스킬트리 전면 재설계 — 뿌리(공용) → 줄기(음/양 택1) → 가지(하위분기 택1) → 필살기.
  // [UPDATE 2026-07-23] 사용자 피드백 반영 — "로그라이크는 시간 투자하면 끝도 없이 강해져야 한다":
  //   - 뿌리: 3강은 다음 층이 "열리는" 기준일 뿐, 실제 상한은 10강까지 계속 투자 가능(ROOT_GATE_LV vs ROOT_MAX_LV 분리)
  //   - 가지 패시브: 5강 → 10강으로 상한 상향(5강이면 준필살기 해금 자격 생김, 이후에도 10강까지 계속 강화 가능)
  //   - 준필살기/필살기: 1회성 바이너리 해금이 아니라 1~5강까지 레벨업 가능 — 레벨마다 쿨타임 감소·범위/데미지 증가
  SEONSUL: {
    ROOT_GATE_LV: 3,       // 다음 층(또는 줄기)이 열리는 기준 강화 단계
    ROOT_MAX_LV: 10,       // 뿌리 노드 1개당 실제 상한
    ROOT_BASE_COST: 3,     // 뿌리 노드 시작 비용(선기석)
    ROOT_COST_STEP: 3,     // 레벨당 비용 증가폭
    ROOT1: {
      root_atk: { icon:'⚔️', perLv:6,  nameKo:'근본 공격력', nameEn:'Root Attack',  unit:'%' },
      root_def: { icon:'🛡️', perLv:12, nameKo:'근본 방어력', nameEn:'Root Defense', unit:''  },
      root_hp:  { icon:'❤️', perLv:5,  nameKo:'근본 체력',   nameEn:'Root HP',      unit:'%' },
      root_mov: { icon:'👟', perLv:5,  nameKo:'근본 속도',   nameEn:'Root Speed',   unit:'%' },
    },
    ROOT2: {
      root_crit:   { icon:'🎯', perLv:5,  nameKo:'치명타율',   nameEn:'Crit Chance',  unit:'%' },
      root_eva:    { icon:'🌫️', perLv:4,  nameKo:'회피율',     nameEn:'Evasion',      unit:'%' },
      root_cd:     { icon:'⏱️', perLv:4,  nameKo:'쿨타임 감소', nameEn:'Cooldown',     unit:'%' },
      root_magnet: { icon:'🧲', perLv:18, nameKo:'자석 범위',  nameEn:'Magnet Range', unit:''  },
    },
    BASE_COST: 5, COST_STEP: 2, MAX_LV: 10,        // 가지 패시브 노드용 (뿌리와 별개, 상한 10강)
    ABILITY_MAX_LV: 5,             // 준필살기/필살기 자체 레벨 상한
    ABILITY_GATE_PASSIVE_LV: 5,    // 패시브가 이 레벨 이상이어야 준필살기 강화 가능(패시브는 계속 10강까지 올라감)
    SUB_BASE_COST: 25, SUB_COST_STEP: 15,     // 준필살기 레벨당 비용
    FINAL_BASE_COST: 50, FINAL_COST_STEP: 30, // 필살기 레벨당 비용 — 준필살기 만렙(5) 필요
    PATHS: {
      yang: {
        labelKo:'양(陽)', labelEn:'Yang', color:'#e8a850',
        descKo:'공세의 길 — 빠르고 강하게 몰아친다.', descEn:'The path of offense — strike fast and hard.',
        BRANCHES: {
          quick: {
            labelKo:'쾌속의 가지', labelEn:'Path of Swiftness', color:'#f0d060',
            passive: { key:'quick_passive', icon:'⚡', nameKo:'전광석화', nameEn:'Lightning Speed',
              descKo:'공격속도·이동속도 강화', descEn:'Boosts attack and movement speed', perLv:{ spd:5, mov:5 } },
            // [UPDATE 2026-07-23] perLvXxx 필드 = 레벨당 증가/감소폭 (interval은 음수 = 빨라짐). 최소 쿨타임은 캐스트 시 8초로 하한.
            sub: { key:'quick_sub', icon:'🌩️', nameKo:'뇌성벽력', nameEn:'Thunder Roar',
              interval:20, radius:110, dmgMult:1.2, strikes:5,
              perLvInterval:-1.5, perLvRadius:10, perLvDmgMult:0.3, perLvStrikes:1,
              descKo:'화면 곳곳에 연쇄 낙뢰(레벨↑ = 더 자주, 더 세게)', descEn:'Chain lightning strikes across the screen (higher level = faster & stronger)' },
            final: { key:'quick_final', icon:'⚡', nameKo:'벼락술', nameEn:'Lightning Art',
              interval:40, radius:140, dmgMult:2.2, strikes:12, dur:2.0,
              perLvInterval:-2.5, perLvRadius:15, perLvDmgMult:0.5, perLvStrikes:2,
              descKo:'화면 전체에 거대한 낙뢰 폭격(레벨↑ = 더 자주, 더 세게)', descEn:'Massive lightning barrage across the whole screen (higher level = faster & stronger)' },
          },
          fire: {
            labelKo:'거화의 가지', labelEn:'Path of Blazing Fire', color:'#e86838',
            passive: { key:'fire_passive', icon:'🔥', nameKo:'도깨비 강화', nameEn:'Dokkaebi Empowerment',
              descKo:'공격력·치명타율 강화', descEn:'Boosts attack and crit chance', perLv:{ atk:5, crit:3 } },
            sub: { key:'fire_sub', icon:'🌫️', nameKo:'독안개 전역화', nameEn:'Miasma Spread',
              interval:20, dot:8, dur:3.0,
              perLvInterval:-1.5, perLvDot:2, perLvDur:0.3,
              descKo:'화면 전체에 독안개 확산, 지속 피해(레벨↑ = 더 자주, 더 세게)', descEn:'Poison mist spreads across the whole screen (higher level = faster & stronger)' },
            final: { key:'fire_final', icon:'🔥', nameKo:'화염술', nameEn:'Fire Art',
              interval:40, dot:18, dur:2.5,
              perLvInterval:-2.5, perLvDot:4, perLvDur:0.4,
              descKo:'몸에서 시작해 화면 전체를 휩쓰는 화염(레벨↑ = 더 자주, 더 세게)', descEn:'Fire spreads from you to engulf the whole screen (higher level = faster & stronger)' },
          },
        },
      },
      yin: {
        labelKo:'음(陰)', labelEn:'Yin', color:'#7890c8',
        descKo:'수호의 길 — 굳건히 버티고 오래 살아남는다.', descEn:'The path of defense — endure and outlast.',
        BRANCHES: {
          bind: {
            labelKo:'포박의 가지', labelEn:'Path of Binding', color:'#a070c0',
            passive: { key:'bind_passive', icon:'👻', nameKo:'귀신손 강화', nameEn:'Ghost Hand Empowerment',
              descKo:'쿨타임 감소·자석 범위 강화', descEn:'Boosts cooldown reduction and magnet range', perLv:{ cd:2, magnet:10 } },
            sub: { key:'bind_sub', icon:'🌀', nameKo:'현혹부적 대혼란', nameEn:'Grand Confusion', // [UPDATE 2026-07-24] 🔏(자물쇠)가 '잠김' 상태로 오인되기 쉬워 혼란 테마 아이콘으로 교체
              interval:25, charmDur:3.0,
              perLvInterval:-2, perLvCharmDur:0.4,
              descKo:'화면 전체 적을 잠시 서로 공격하게 함(레벨↑ = 더 자주, 더 길게)', descEn:'Charms all enemies to attack each other (higher level = faster & longer)' },
            final: { key:'bind_final', icon:'💀', nameKo:'명부낙인', nameEn:'Mark of the Ledger',
              interval:45, markDelay:3.0, dmgMult:6.0,
              perLvInterval:-3, perLvDmgMult:1.5,
              descKo:'화면 전체 적에게 낙인, 3초 뒤 동시 소멸(레벨↑ = 더 자주, 더 세게)', descEn:'Marks all enemies; they perish together after 3s (higher level = faster & stronger)' },
          },
          ward: {
            labelKo:'결계의 가지', labelEn:'Path of Warding', color:'#68a8a0',
            passive: { key:'ward_passive', icon:'🔮', nameKo:'업구슬 강화', nameEn:'Karma Bead Empowerment',
              descKo:'방어력·회피율 강화', descEn:'Boosts defense and evasion', perLv:{ def:8, eva:3 } },
            sub: { key:'ward_sub', icon:'🌑', nameKo:'모래 어둠', nameEn:'Sand Darkness',
              interval:25, dmgMult:1.6, flashDur:1.2,
              perLvInterval:-2, perLvDmgMult:0.3,
              descKo:'화면 암전 후 광역 폭딜(레벨↑ = 더 자주, 더 세게)', descEn:'Screen darkens then bursts with AoE damage (higher level = faster & stronger)' },
            final: { key:'ward_final', icon:'🧂', nameKo:'정화', nameEn:'Purification',
              interval:45, dmgMult:2.8, stunDur:1.5,
              perLvInterval:-3, perLvDmgMult:0.6, perLvStunDur:0.2,
              descKo:'화면 전체에 소금 세례, 광역딜+적 기절(레벨↑ = 더 자주, 더 세게, 더 길게 기절)', descEn:'Salt showers the whole screen, AoE damage + stun (higher level = faster, stronger & longer stun)' },
          },
        },
      },
    },
    MAX_TREES: 2, // [UPDATE 2026-07-23] 첫 번째 나무의 필살기까지 열면 두 번째 나무(가지 재선택)를 시작할 수 있음
    // 두 번째 나무의 줄기(음/양) 선택 시, 첫 번째 나무와 비교해 시너지 확정 — 환불 불가, 1회 선택
    SYNERGY: {
      harmony: { atkAdd:100, hpAddPct:100, labelKo:'조화의 음양', labelEn:'Harmony of Yin-Yang',
        descKo:'서로 다른 음양을 모두 품어 조화를 이룬다. 공격력 +100%, 최대체력 +100%.',
        descEn:'Embraces both opposing forces in harmony. ATK +100%, Max HP +100%.' },
      extreme: { atkAdd:200, hpAddPct:0, labelKo:'극한의 음양', labelEn:'Extreme Yin-Yang',
        descKo:'같은 극을 두 번 파고들어 극한에 이른다. 공격력 +200%.',
        descEn:'Delves twice into the same pole, reaching an extreme. ATK +200%.' },
    },
  },

  // [UPDATE 2026-07-23] 선술 준필살기/필살기 레벨 스케일링 헬퍼 — base 설정 + perLvXxx 필드를 받아
  // 레벨에 맞는 실제 수치(interval/radius/dmgMult/strikes/dot/dur/charmDur/markDelay/flashDur/stunDur)를 계산.
  // config.js/game.js/player-scene.js 어디서든 공용으로 씀(쿨타임 계산·데미지 계산·UI 미리보기 전부 동일 공식 사용).
  seonsulAbilityAtLv(base, lv) {
    const out = {};
    const L = Math.max(1, lv || 1);
    for (const k in base) {
      if (k.indexOf('perLv') === 0 || typeof base[k] !== 'number') { out[k] = base[k]; continue; }
      const perKey = 'perLv' + k[0].toUpperCase() + k.slice(1);
      const per = base[perKey];
      out[k] = (per != null) ? base[k] + (L - 1) * per : base[k];
    }
    if (out.interval != null) out.interval = Math.max(8, out.interval); // 쿨타임 하한 8초
    return out;
  },

  // ── 아이템 드롭 ──
  DROP_TABLE: [
    { type: 'gold',   weight: 40.0 },
    { type: 'xp',     weight: 55.0 },
    { type: 'magnet', weight:  2.5 },
    { type: 'bomb',   weight:  2.0 },
    { type: 'potion', weight:  0.5 },
  ],

  // 아이템 흡수 범위 (px)
  ITEM: {
    PASSIVE_MAGNET_RANGE: 120,   // 기본 자동 흡수 범위
    GOLD_ATTRACT_RANGE:   160,
    XP_ATTRACT_RANGE:     120,
    MAGNET_PULL_SPEED:    900,   // 자석 발동 시 흡수 속도
    NORMAL_PULL_SPEED_MAX:320,   // 일반 흡수 최대 속도
    ABSORB_DIST:          16,    // 이 거리 이하면 즉시 획득
    // [UPDATE 2026-07-31] 🔥 XP 오브 개수 상한 — 기존엔 마리당 ceil(xp/2)개를 무제한으로 생성했다.
    // 몬스터 xp가 챕터에 비례해 커지는 구조라 선계(챕터41)에서 263개/마리, 원계(챕터51)에서 1,057개/마리,
    // 어계(챕터61)에선 387,500개/마리가 튀어나왔다. 오브 하나하나가 매 프레임 update+draw 대상이라
    // "선계·원계부터 갑자기 버벅인다"의 직접 원인이었고, 어계는 한 마리만 죽여도 브라우저가 멈추는 수준이었음.
    // 총 XP는 오브 하나당 값을 나눠 담아 그대로 보존한다.
    MAX_XP_ORBS_PER_KILL: 6,
    // 바닥에 남은 오브 총량 상한 — 넘으면 새 오브를 만들지 않고 기존 오브에 값을 합쳐 넣는다(XP 손실 없음)
    MAX_XP_ORBS_ALIVE:    400,
    POTION_HEAL:          10,
    BOMB_DAMAGE_MULT:     1,     // 플레이어 공격력 × N배
    GOLD_DROP_MIN:        1,
    GOLD_DROP_MAX:        3,
    GOLD_ELITE_MIN:       8,
    GOLD_ELITE_MAX:       15,
    GOLD_BOSS_MIN:        150,
    GOLD_BOSS_MAX:        200,
  },

  // ── 펫 효과 ──
  PET: {
    REGEN_AMOUNT:     8,
    REGEN_INTERVAL:   3.0,
    CONFUSE_DURATION: 2.0,
    CONFUSE_INTERVAL: 4.0,
    KNOCKBACK_RANGE:  150,
    KNOCKBACK_FORCE:  120,
    KNOCKBACK_INTERVAL: 3.5,
    MARK_DAMAGE_MULT: 1.25,
    MARK_INTERVAL:    5.0,
    MARK_DURATION:    4.0,
  },

  // ── 게임 규칙 ──
  GAME: {
    TIME_LIMIT:           300,    // 스테이지 제한 시간(초)
    BOSS_WARNING_DURATION: 2.2,
    MAX_ENEMIES:          150,
    SPAWN_INTERVAL_MIN:   0.4,
    SPAWN_INTERVAL_INIT:  2.5,   // 초반 적응 시간
    SPAWN_INTERVAL_DECAY: 0.008,  // 초당 감소량
  },

  // ── 방어력 공식 ──
  DEF: {
    DIVISOR:  1000,    // def / DIVISOR = 감소율
    MAX_REDUCTION: 0.8, // 최대 80% 감소
  },

  EVA: {
    MAX_PERCENT: 40,   // 회피율 최대 40%
  },

  // ── 개발자 모드 ──
  // true 로 설정 시: 로비에 개발자 도구(🛠) 버튼 노출 [UPDATE 2026-07-09] 킬수/보스체력 축소는 제거됨
  DEV_MODE: true,

  // [UPDATE 2026-07-17] 콘텐츠 배포 플래그 — 시즌 데이터(스테이지/몬스터/보스/맵)를 미리 커밋해둬도
  // 특화 시스템 등이 아직 미완성이면 여기서 false로 막아두면 플레이어에게는 노출 안 됨(개발 모드에선
  // isSeasonReleased()가 DEV_MODE를 우선 체크하므로 항상 확인 가능). 시즌 완성되면 true로 전환 후 배포.
  // [UPDATE 2026-07-19] 버그 수정: 시즌1~3은 이미 정식 출시된 콘텐츠인데 플래그 목록에 없어서
  // isSeasonReleased()가 전부 false를 반환 — 릴리즈 빌드(DEV_MODE:false)에서 차원 지도의 현계/유명계/망랑계까지
  // 전부 잠김으로 표시되던 버그(스테이지 선택 화면은 이 플래그를 안 써서 영향 없었음). 이미 출시된 시즌은 명시적으로 true 등록.
  CONTENT_RELEASE: {
    season1: true,
    season2: true,
    season3: true,
    season4: true,
    season5: true, // [UPDATE 2026-07-24] 시즌5 콘텐츠(스테이지/스킬트리/엔딩) 완성 — 정식 공개
    season6: true, // [UPDATE 2026-07-29] 시즌6(원계) 정식 공개
    season7: true,
    season8: true, // [UPDATE 2026-07-31] 시즌8(황계) 정식 공개 — 스토리 최종장 // [UPDATE 2026-07-31] 시즌7(어계) 정식 공개 — 스테이지·몬스터·보스·엘리트·바닥·엔딩·오염도 시스템·신규 동료/펫 완료
  },

  // [UPDATE 2026-07-24] 시즌6(원계) 전용 "법칙" 시스템 — 3슬롯 장착형 유물.
  // 규율석(동료 파편 교환 전용, 인게임 드랍 없음)으로 해금·강화. 슬롯 장착 여부와 무관하게 보유만 하면 강화 가능,
  // 전투 효과는 장착된 3개만 적용됨.
  // [UPDATE 2026-07-31] 슈브니구라스의 축복 / 오염도 (시즌7 어계 → 시즌8 황계 전환 시스템)
  // 어계는 의도적으로 기존 파워커브의 100배 구간이라 정상 성장으로는 1스테이지도 못 뚫는다.
  // 유일한 돌파구가 그레이트 이스가 파는 이 "축복"이고, 최대 1000개까지 사면 전투력 1001배가 되어 어계를 뚫는다.
  // 대신 세이브에 영구 누적되어 황계에서는 같은 수치가 페널티로 뒤집힌다 —
  // 1000개면 전투계수 -99.9%(0.1%만 남음). 황계 1스테이지에 도전하는 것만으로 조금씩 정화된다(승패 무관).
  BLESSING: {
    MAX: 1000,             // 최대 보유량 = 최대 배율(1001배)
    PRICE_GOLD: 1,         // 개당 골드. 터무니없이 싼 게 이 거래의 정체(그리고 함정)
    // 황계 진입 시 오염도 1당 깎이는 전투계수 비율. 1000 × 0.000999 = 0.999 → 전투력 0.1%만 남음.
    // 0.001로 잡으면 1000개에서 정확히 0이 되어 전투력이 소멸(0 나눗셈/즉사)하므로 의도적으로 그보다 낮게 잡음.
    RUINED_PENALTY_PER: 0.000999,
    MIN_RUINED_MULT: 0.001, // 위 계산의 하한 — 어떤 경우에도 전투력이 0이 되지는 않게
    // 정화량은 "남은 오염도에 비례"하는 기하급수 방식.
    // 고정값(패배 -1 / 승리 -10)이면 오염도 1000에서 완전 정화까지 약 865회 도전이 필요해 현실적으로 불가능했음.
    // 비율제로 바꾸면 오염도가 높을수록 많이 깎여서 초반 진행이 시원하고, 총 도전 횟수도 100회 안팎으로 들어온다
    // (시뮬레이션: 승리 가능 시점을 보수적으로 잡아 약 105회, 낙관적으로 잡으면 약 73회).
    // 최소값이 있는 이유 — 비율만 쓰면 오염도가 낮을 때 정화량이 0에 수렴해 끝이 한없이 늘어짐.
    PURIFY_LOSE_RATE: 0.02, PURIFY_LOSE_MIN: 1,  // 패배: 남은 오염도의 2% (최소 1)
    PURIFY_WIN_RATE:  0.08, PURIFY_WIN_MIN:  8,  // 승리: 남은 오염도의 8% (최소 8) — 이기기 시작하면 4배속
  },

  // [UPDATE 2026-07-31] 황계(시즌8) 반물질 페널티.
  // 황계는 반물질계라 애기씨 본인 외에는 그 어떤 존재도 형태를 유지하지 못한다는 설정 —
  // 동료나 펫을 데려갈수록 전투력이 급격히 깎인다. "혼자 갈수록 강해지는 계"라는 뒤집힌 구조.
  // 곱연산이라 아무리 많이 데려가도 0이 되지는 않지만, 3+3 풀 편성이면 전투력이 18%까지 떨어진다.
  RUINED_REALM: {
    COMPANION_MULT: 0.75, // 편성된 동료 1명당 곱해지는 전투 계수
    PET_MULT:       0.75, // 편성된 펫 1마리당
  },

  LAW: {
    SLOT_COUNT: 3,
    PASSIVE_MAX_LV: 10, PASSIVE_UNLOCK_COST: 20, PASSIVE_BASE_COST: 10, PASSIVE_COST_STEP: 4,
    ACTIVE_MAX_LV: 5,   ACTIVE_UNLOCK_COST: 50,  ACTIVE_BASE_COST: 30,  ACTIVE_COST_STEP: 15,
    // 동료 파편 N개 = 규율석 1개 교환 비율 (등급별)
    // [UPDATE 2026-07-31] 시즌7(어계) 동료가 에픽/미소스 등급으로 들어오면서 5단계 → 7단계로 확장.
    // 기존엔 이 표에 없는 등급의 파편이 교환 목록에 아예 안 뜨고 exchangeFragmentsForLaw()의
    // `if (!rate) return;`에 걸려 영구히 쓸 수 없는 사장(死藏) 자원이 되던 문제.
    // 미소스는 최고 등급이지만 교환비 하한이 1(파편 1개=규율석 1개)이라 레전더리와 같은 값 —
    // 그 이상 우대하려면 "파편 1개당 규율석 N개" 구조로 바꿔야 해서, 실익 대비 과한 변경이라 보류.
    FRAGMENT_EXCHANGE_RATE: { common:20, uncommon:15, rare:10, unique:5, epic:3, legendary:1, mythos:1 },
    LIST: [
      // ── 패시브 · 일반형 (Lv1~10, 상시 적용) ──
      { id:'law_sentinel',       name:'법칙의 파수꾼', nameEn:'Law Sentinel',           category:'passive', kind:'plain',
        stat:'atk',    base:8,  perLv:2,
        descKo:'공격력 증가', descEn:'Increases attack power' },
      { id:'law_electromagnetism', name:'전자기의 법칙', nameEn:'Law of Electromagnetism', category:'passive', kind:'plain',
        stat:'cd',     base:6,  perLv:1.5,
        descKo:'쿨타임 감소', descEn:'Reduces weapon cooldown' },
      { id:'law_nuclear',        name:'핵력의 법칙',   nameEn:'Law of Nuclear Force',    category:'passive', kind:'plain',
        stat:'def',    base:10, perLv:3,
        descKo:'방어력 증가', descEn:'Increases defense' },
      { id:'law_causality',      name:'인과의 법칙',   nameEn:'Law of Causality',        category:'passive', kind:'plain',
        stat:'crit',   base:5,  perLv:1.5,
        descKo:'치명타율 증가', descEn:'Increases crit chance' },
      { id:'law_relation',       name:'관계의 법칙',   nameEn:'Law of Relations',        category:'passive', kind:'plain',
        stat:'compAtk', base:10, perLv:3,
        descKo:'동료 공격력 증가', descEn:'Increases companion attack power' },
      { id:'law_primal',         name:'원계의 법칙',   nameEn:'Law of the Primal Realm', category:'passive', kind:'plain',
        stat:'hp',     base:8,  perLv:2.5,
        descKo:'최대 체력 증가', descEn:'Increases max HP' },

      // ── 패시브 · 조건형 (Lv1~10, 상시 판정) ──
      { id:'law_stillness',   name:'정지의 법칙',   nameEn:'Law of Stillness',   category:'passive', kind:'conditional',
        condition:'stillness', stillSec:{base:5, perLv:-0.2, min:3}, dmgMult:{base:50, perLv:15},
        descKo:'일정 시간 이상 정지하면 데미지 증가', descEn:'Deal more damage after standing still' },
      { id:'law_sprint',      name:'질주의 법칙',   nameEn:'Law of the Sprint',  category:'passive', kind:'conditional',
        condition:'movement', ratePerSec:{base:2, perLv:0.3}, cap:{base:30, perLv:7},
        descKo:'이동을 지속할수록 데미지가 누적 증가(상한 있음)', descEn:'Damage builds up the longer you keep moving (capped)' },
      { id:'law_reflection',  name:'반사의 법칙',   nameEn:'Law of Reflection',  category:'passive', kind:'conditional',
        condition:'hitCount', hitThreshold:{base:10, perLv:-0.5, min:5}, reflectPct:{base:5, perLv:1.5},
        descKo:'일정 횟수 피격 시 반사 데미지', descEn:'Reflects damage after being hit enough times' },
      { id:'law_absorption',  name:'흡수의 법칙',   nameEn:'Law of Absorption',  category:'passive', kind:'conditional',
        condition:'healAccum', healThreshold:{base:100, perLv:-6, min:40}, burstMult:{base:3, perLv:0.5},
        descKo:'회복량이 누적되면 폭발 데미지', descEn:'Unleashes a burst once healing accumulates enough' },
      { id:'law_endurance',   name:'인내의 법칙',   nameEn:'Law of Endurance',   category:'passive', kind:'conditional',
        condition:'lowHp', hpBelowPct:30, defBonus:{base:20, perLv:5},
        descKo:'체력이 낮을수록 방어력 증가', descEn:'Gain more defense at low HP' },
      { id:'law_excess',      name:'과잉의 법칙',   nameEn:'Law of Excess',      category:'passive', kind:'conditional',
        condition:'fullHp', atkBonus:{base:15, perLv:4},
        descKo:'체력이 가득 차 있으면 공격력 증가', descEn:'Gain more attack power while at full HP' },

      // ── 액티브 · 일반형 (Lv1~5, 주기적 자동시전 — 선술 패턴 재사용) ──
      { id:'law_corruption', name:'오염의 법칙', nameEn:'Law of Corruption', category:'active', kind:'plain',
        interval:25, perLvInterval:-3, dot:8, perLvDot:2,
        descKo:'주기적으로 화면 전체에 독 살포', descEn:'Periodically spreads poison across the screen' },
      { id:'law_collapse',   name:'붕괴의 법칙', nameEn:'Law of Collapse',   category:'active', kind:'plain',
        interval:30, perLvInterval:-4, dmgMult:2, perLvDmgMult:0.5,
        descKo:'주기적으로 광역 붕괴 폭발', descEn:'Periodically triggers an AoE collapse explosion' },
      { id:'law_gravity',    name:'중력의 법칙', nameEn:'Law of Gravity',    category:'active', kind:'plain',
        interval:28, perLvInterval:-3.5, pullRadius:150, perLvPullRadius:20, dmgMult:1.5, perLvDmgMult:0.4,
        descKo:'주기적으로 적을 끌어당기며 데미지', descEn:'Periodically pulls enemies in and deals damage' },
      { id:'law_scream',     name:'절규의 법칙', nameEn:'Law of the Scream', category:'active', kind:'plain',
        interval:35, perLvInterval:-4.5, stunDur:1.0, perLvStunDur:0.3,
        descKo:'주기적으로 화면 전체 적 기절', descEn:'Periodically stuns all enemies on screen' },
      { id:'law_extinction', name:'소멸의 법칙', nameEn:'Law of Extinction', category:'active', kind:'plain',
        interval:40, perLvInterval:-5, hpThresholdPct:10, perLvHpThresholdPct:3,
        descKo:'주기적으로 저체력 적을 즉시 소멸', descEn:'Periodically annihilates low-HP enemies instantly' },
      { id:'law_distortion', name:'왜곡의 법칙', nameEn:'Law of Distortion', category:'active', kind:'plain',
        interval:32, perLvInterval:-4, slowPct:30, perLvSlowPct:8, dmgMult:1.8, perLvDmgMult:0.4,
        descKo:'주기적으로 적을 둔화시키며 데미지', descEn:'Periodically slows enemies and deals damage' },

      // ── 액티브 · 조건형 (Lv1~5, 이벤트로 발동) ──
      { id:'law_judgment', name:'심판의 법칙',     nameEn:'Law of Judgment',   category:'active', kind:'conditional',
        condition:'killCount', killThreshold:{base:50, perLv:-8, min:18}, dmgMult:{base:3, perLv:0.8},
        descKo:'처치 수가 누적되면 광역 폭발', descEn:'Triggers an AoE burst once enough kills accumulate' },
      { id:'law_ruin',      name:'파멸의 법칙',     nameEn:'Law of Ruin',       category:'active', kind:'conditional',
        condition:'lowHpTrigger', hpBelowPct:{base:30, perLv:2.5}, cooldown:{base:60, perLv:-7.5}, dmgMult:{base:5, perLv:1.2},
        descKo:'체력이 낮아지면 강력한 일격 발동(쿨다운)', descEn:'Unleashes a powerful strike when HP drops low (on cooldown)' },
      { id:'law_karma',     name:'인과응보의 법칙', nameEn:'Law of Karma',      category:'active', kind:'conditional',
        condition:'dmgTakenAccum', dmgThreshold:{base:500, perLv:-60, min:200}, returnMult:{base:1.0, perLv:0.3},
        descKo:'받은 피해가 누적되면 되돌려줌', descEn:'Returns accumulated damage taken back at enemies' },
      { id:'law_reversal',  name:'역행의 법칙',     nameEn:'Law of Reversal',   category:'active', kind:'conditional',
        condition:'onKillEcho', interval:20, perLvInterval:-2.5, dmgMult:{base:2.5, perLv:0.6},
        descKo:'주기적으로 최근 처치 지점에 낙뢰', descEn:'Periodically strikes lightning at recently defeated enemies\' positions' },
      { id:'law_throne',    name:'왕좌의 법칙',     nameEn:'Law of the Throne', category:'active', kind:'conditional',
        condition:'bossOnly', bossDmgMultPct:{base:15, perLv:4},
        descKo:'보스전에서만 추가 데미지', descEn:'Deals bonus damage against bosses only' },
      { id:'law_origin',    name:'태초의 법칙',     nameEn:'Law of the Origin', category:'active', kind:'conditional', flagship:true,
        condition:'complex', atkPct:{base:5, perLv:3}, interval:45, perLvInterval:-5, dmgMult:{base:4, perLv:1},
        descKo:'[시그니처] 공격력 상시 증가 + 주기적으로 강력한 초신성 폭발', descEn:'[Signature] Passive ATK boost plus a periodic supernova burst' },
    ],
  },
};

// [UPDATE 2026-07-24] 법칙 레벨별 수치 계산 — 선술의 seonsulAbilityAtLv와 동일한 base+perLv 공식.
// 필드가 {base,perLv} 객체면 스케일링, 숫자/문자열이면 그대로 반환. min이 있으면 하한 적용.
function lawValueAtLv(field, lv) {
  if (field == null || typeof field !== 'object') return field;
  const L = Math.max(1, lv || 1);
  let v = field.base + (L - 1) * (field.perLv || 0);
  if (field.min != null) v = Math.max(field.min, v); // min은 항상 하한(감소형 필드용)
  return v;
}

// 시즌 콘텐츠가 실제로 플레이어에게 열려도 되는지 — 개발 모드에서는 플래그 무관하게 항상 true
function isSeasonReleased(seasonNum) {
  if (CONFIG.DEV_MODE) return true;
  return !!CONFIG.CONTENT_RELEASE[`season${seasonNum}`];
}
