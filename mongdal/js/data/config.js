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

  // [UPDATE 2026-07-06] 명부 영구강화 (시즌2 확장판, 영혼석 소모)
  SINMOK_S2: {
    BASE_COST: 3,   // 시작 비용 (영혼석)
    COST_STEP: 5,   // 5레벨마다 비용 +1 (lv0~4=3개, lv95~99=22개)
    MAX_LV: { extraDmg: 100, reflectDmg: 100 },
    PER_LV: { extraDmg: 3, reflectDmg: 0.2 }, // 추가데미지 +3%/렙(최대300%), 반사 +0.2%/렙(최대20%)
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
};
