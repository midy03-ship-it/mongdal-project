// player.js - 플레이어 (CONFIG 기반)
// [UPDATE 2026-08-02] 무기 스폰 앵커(손 위치) 계산을 캐릭터별로 완전히 분리된 함수로 둠 —
// 애기씨/박수는 체형 비율이 달라(박수는 모자 때문에 키가 커 보임) 같은 offset을 공유하면 어긋나 보임.
// 이동/충돌에 쓰는 실제 player.x/y는 절대 건드리지 않고, 무기 발사 지점 계산에서만 갈라진다.
function _aegissiWeaponAnchorY(player, baseOffset) {
  return player.y - baseOffset;
}
function _baksuWeaponAnchorY(player, baseOffset) {
  // [UPDATE 2026-08-02] 박수 전용 보정값 — window._baksuWeaponYAdjust로 브라우저 콘솔에서 실시간 조정 가능
  // (리빌드 없이 즉시 반영됨). -45는 머리 쪽으로 너무 많이 올라간다는 피드백으로 -25로 20 내림.
  const adj = (typeof window !== 'undefined' && typeof window._baksuWeaponYAdjust === 'number')
    ? window._baksuWeaponYAdjust : -25;
  return player.y - baseOffset + adj;
}

class Player {
  constructor(x, y, savedUpgrades, sinmokUpgrades, sinmokS2, myeongLv, sinmokS5, laws, lawSlots, specialtyItems) {
    this.x = x; this.y = y;
    // [UPDATE 2026-08-02] 현재 주인공이 박수인지 — weaponAnchorY()가 이 값으로 위 두 함수 중 하나를 고른다.
    this._isBaksu = !!(typeof Save !== 'undefined' && Save.load()?.season8ClearEnding);
    // [UPDATE 2026-08-04] 박수 공격 모션 재설계 — 실제 공격 속도에 맞추면 무기/레벨에 따라 너무 정신없어
    // 보인다는 피드백으로, 발사 이벤트와 완전히 분리된 자체 주기로 변경. _attackAnimT는 "전투 중이냐"만
    // 판정(2초 이상 공격 없으면 대기로 복귀), 준비↔공격 전환은 breatheT를 0.35초 주기로 나눠서 그냥 계속 반복.
    this._attackAnimT = null; // null이면 대기(0번) 프레임
    this.hp    = CONFIG.PLAYER.BASE_HP;
    this.maxHp = CONFIG.PLAYER.BASE_HP;
    this.level = 1;
    this.xp    = 0;
    this.xpNext = CONFIG.PLAYER.XP_NEXT_BASE;
    this.iframe = 0;
    this.facing = 1;
    this.dead   = false;
    this.walkT  = 0;
    this.w = 28; this.h = 36;

    // 로비 강화 스탯 반영
    const upg = savedUpgrades || {};
    const upPerLv = CONFIG.STAT_UPGRADE_PER_LEVEL;
    this.stats = {
      atk: CONFIG.BASE_STATS.atk + (upg.atk||0) * upPerLv.atk,
      spd: CONFIG.BASE_STATS.spd + (upg.spd||0) * upPerLv.spd,
      mov: CONFIG.BASE_STATS.mov + (upg.mov||0) * upPerLv.mov,
      def: CONFIG.BASE_STATS.def + (upg.def||0) * upPerLv.def,
      eva: CONFIG.BASE_STATS.eva + (upg.eva||0) * upPerLv.eva,
    };
    // 최대 HP 강화
    if (upg.hp) {
      const bonus = upg.hp * upPerLv.hp;
      this.hp    += bonus;
      this.maxHp += bonus;
    }

    // 신목 영구강화 반영
    const sm = sinmokUpgrades || {};
    const sml = CONFIG.SINMOK.PER_LV;
    this.stats.spd += (sm.atkSpd  || 0) * sml.atkSpd;
    this.stats.mov += (sm.movSpd  || 0) * sml.movSpd;
    this.stats.eva += (sm.evasion || 0) * sml.evasion;

    // [UPDATE 2026-07-06] 명부 영구강화 반영 (시즌2, 영혼석)
    const sm2 = sinmokS2 || {};
    const sml2 = CONFIG.SINMOK_S2.PER_LV;
    this._extraDmgPct = (sm2.extraDmg   || 0) * sml2.extraDmg;   // 최종 데미지 +% (totalAtk 배율)
    this._reflectPct  = (sm2.reflectDmg || 0) * sml2.reflectDmg; // 받은 데미지 반사 %

    // [UPDATE 2026-07-17] 명(命) 강화 반영 (시즌4, 순리석) — 단일 트랙 0~10, 구간별 효과 누적
    const mLv = Math.min(CONFIG.MYEONG.MAX_LV, myeongLv || 0);
    this._myeongCritHeal    = Math.min(mLv, 3) * CONFIG.MYEONG.CRIT_HEAL_PER_TIER;
    this._myeongReviveChance= Math.max(0, Math.min(mLv, 6) - 3) * CONFIG.MYEONG.REVIVE_CHANCE_PER_TIER;
    this._myeongBossEvade   = Math.max(0, Math.min(mLv, 9) - 6) * CONFIG.MYEONG.BOSS_EVADE_PER_TIER;
    this._myeongBossBonus   = mLv >= CONFIG.MYEONG.MAX_LV;

    // [UPDATE 2026-07-22] 선술 스킬트리 전면 재설계 반영 — 뿌리(공용, 항상 적용) + 가지(선택한 경로만 적용)
    const s5 = sinmokS5 || {};
    const SC = CONFIG.SEONSUL;
    let _s5HpBonus = 0;
    this._seonsulCritBonus = 0;
    this._cdrSeonsul = 0;
    this._seonsulMagnetBonus = 0;

    // 뿌리 1층/2층 — 공용, 조건 없이 항상 적용
    const r1 = s5.root1 || {}, r2 = s5.root2 || {};
    this.stats.atk += (r1.root_atk || 0) * SC.ROOT1.root_atk.perLv;
    this.stats.def += (r1.root_def || 0) * SC.ROOT1.root_def.perLv;
    _s5HpBonus += Math.floor(CONFIG.PLAYER.BASE_HP * ((r1.root_hp || 0) * SC.ROOT1.root_hp.perLv) / 100);
    this.stats.mov += (r1.root_mov || 0) * SC.ROOT1.root_mov.perLv;
    this._seonsulCritBonus += (r2.root_crit || 0) * SC.ROOT2.root_crit.perLv;
    this.stats.eva += (r2.root_eva || 0) * SC.ROOT2.root_eva.perLv;
    this._cdrSeonsul += (r2.root_cd || 0) * SC.ROOT2.root_cd.perLv / 100;
    this._seonsulMagnetBonus += (r2.root_magnet || 0) * SC.ROOT2.root_magnet.perLv;

    // [UPDATE 2026-07-23] 나무 여러 그루 지원 — 첫 나무 필살기까지 열면 두 번째 나무(가지 재선택) 시작 가능.
    // 각 나무는 독립된 패시브/준필살기/필살기를 가지며, 전부 동시에 적용·자동시전됨.
    const trees = Array.isArray(s5.trees) ? s5.trees : [];
    this._seonsulTrees = []; // 런타임용: 각 나무의 자동시전 타이머 포함
    // 하위호환: 구버전 단일 path/branch 필드만 있던 세이브도 나무 1개로 취급.
    // subUnlocked/finalUnlocked(구 바이너리)는 subLv/finalLv(신 레벨제) 만렙으로 변환.
    const legacyTree = (!trees.length && s5.path && s5.branch)
      ? [{ path:s5.path, branch:s5.branch, passiveLv:s5.passiveLv,
           subLv: s5.subUnlocked ? SC.ABILITY_MAX_LV : 0, finalLv: s5.finalUnlocked ? SC.ABILITY_MAX_LV : 0 }]
      : [];
    const allTrees = trees.length ? trees : legacyTree;
    for (const t of allTrees) {
      if (!t || !t.path || !t.branch) continue;
      const pathDef = SC.PATHS[t.path];
      if (!pathDef || !pathDef.BRANCHES[t.branch]) continue;
      const br = pathDef.BRANCHES[t.branch];
      const lv = Math.min(t.passiveLv || 0, SC.MAX_LV);
      for (const [stat, perLv] of Object.entries(br.passive.perLv)) {
        const amt = lv * perLv;
        if (stat === 'spd') this.stats.spd += amt;
        else if (stat === 'mov') this.stats.mov += amt;
        else if (stat === 'atk') this.stats.atk += amt;
        else if (stat === 'crit') this._seonsulCritBonus += amt;
        else if (stat === 'cd') this._cdrSeonsul += amt / 100;
        else if (stat === 'magnet') this._seonsulMagnetBonus += amt;
        else if (stat === 'def') this.stats.def += amt;
        else if (stat === 'eva') this.stats.eva += amt;
      }
      // [UPDATE 2026-07-23] 준필살기/필살기 레벨제 — subLv/finalLv(1~5)에 맞는 실제 쿨타임으로 타이머 초기화
      const subLv = Math.min(t.subLv || (t.subUnlocked ? SC.ABILITY_MAX_LV : 0), SC.ABILITY_MAX_LV);
      const finalLv = Math.min(t.finalLv || (t.finalUnlocked ? SC.ABILITY_MAX_LV : 0), SC.ABILITY_MAX_LV);
      const subInterval = subLv > 0 ? CONFIG.seonsulAbilityAtLv(br.sub, subLv).interval : br.sub.interval;
      const finalInterval = finalLv > 0 ? CONFIG.seonsulAbilityAtLv(br.final, finalLv).interval : br.final.interval;
      this._seonsulTrees.push({
        path: t.path, branch: t.branch,
        subLv, finalLv,
        subT: subInterval, finalT: finalInterval,
      });
    }
    // 첫 번째 나무 정보(UI/HUD 표시용, 하위호환)
    const _firstTree = allTrees[0];
    this._seonsulPath = _firstTree ? _firstTree.path : null;
    this._seonsulBranch = _firstTree ? _firstTree.branch : null;

    // 음양 시너지 — 두 번째 나무 줄기 선택 시 1회 확정된 값 반영
    this._seonsulSynergy = (s5.synergy === 'harmony' || s5.synergy === 'extreme') ? s5.synergy : null;
    if (this._seonsulSynergy) {
      const syn = SC.SYNERGY[this._seonsulSynergy];
      this.stats.atk += syn.atkAdd;
      if (syn.hpAddPct) _s5HpBonus += Math.floor(CONFIG.PLAYER.BASE_HP * syn.hpAddPct / 100);
    }
    this.maxHp += _s5HpBonus; this.hp += _s5HpBonus;

    // [UPDATE 2026-07-24] 시즌6(원계) 법칙 시스템 재설계 — 패시브는 슬롯 없이 "보유만 하면" 항상 적용,
    // 슬롯 3개는 액티브 전용(장착된 것만 자동시전). 패시브·일반형은 여기서 즉시 스탯 반영,
    // 패시브·조건형은 상시 판정이 필요해서 this._lawPassiveConditional에 등록, 액티브는 this._lawEquipped에 등록
    // (둘 다 실제 처리는 game.js 메인 루프에서).
    const _lawLevels = laws || {};
    const _lawSlotIds = (lawSlots || []).filter(Boolean).slice(0, CONFIG.LAW.SLOT_COUNT);
    this._lawPassiveConditional = [];
    this._lawEquipped = [];
    let _lawHpBonusPct = 0;
    for (const lawId of Object.keys(_lawLevels)) {
      const lv = _lawLevels[lawId];
      if (!lv) continue;
      const def = CONFIG.LAW.LIST.find(l => l.id === lawId);
      if (!def || def.category !== 'passive') continue;
      if (def.kind === 'plain') {
        const amt = def.base + (lv - 1) * def.perLv;
        if (def.stat === 'atk') this.stats.atk += amt;
        else if (def.stat === 'def') this.stats.def += amt;
        else if (def.stat === 'cd') this._cdrSeonsul = (this._cdrSeonsul || 0) + amt / 100; // 쿨감 공용 풀에 합류
        else if (def.stat === 'crit') this._seonsulCritBonus = (this._seonsulCritBonus || 0) + amt;
        else if (def.stat === 'hp') _lawHpBonusPct += amt;
        else if (def.stat === 'compAtk') this._lawCompAtkBonus = (this._lawCompAtkBonus || 0) + amt;
      } else {
        // 조건형 패시브 — game.js에서 lv/def를 참조해 상시 판정
        this._lawPassiveConditional.push({ id: lawId, def, lv });
      }
    }
    if (_lawHpBonusPct) {
      const bonus = Math.floor(CONFIG.PLAYER.BASE_HP * _lawHpBonusPct / 100);
      this.maxHp += bonus; this.hp += bonus;
    }
    for (const lawId of _lawSlotIds) {
      const def = CONFIG.LAW.LIST.find(l => l.id === lawId);
      if (!def || def.category !== 'active') continue; // 슬롯은 액티브 전용
      const lv = Math.max(1, _lawLevels[lawId] || 1);
      this._lawEquipped.push({ id: lawId, def, lv });
    }

    // [UPDATE 2026-07-26] 버그 수정: 보물창고 특산품(하드 난이도 전용 드랍)이 지금까지는 보유 개수만 세고
    // 실제 스탯 효과가 전혀 적용 안 되고 있었음. 보유 개수 × effectValue로 영구 보너스 적용.
    const spItems = specialtyItems || {};
    let _spAtkFlat = 0, _spHpFlatBonus = 0, _spMagnetFlat = 0, _spCdReduction = 0, _spHpPct = 0, _spAtkPctPoints = 0;
    for (const def of (GAME_DATA.specialtyItems || [])) {
      const cnt = spItems[def.id] || 0;
      if (!cnt) continue;
      const total = cnt * def.effectValue;
      if (def.effectType === 'atkFlat') _spAtkFlat += total;
      else if (def.effectType === 'hpFlat') _spHpFlatBonus += total;
      else if (def.effectType === 'magnetFlat') _spMagnetFlat += total;
      else if (def.effectType === 'cdFlat') _spCdReduction += Math.abs(total) / 100; // "-0.01%p" → 쿨감 풀에는 양수 비율로 합류
      else if (def.effectType === 'hpPct') _spHpPct += total;
      else if (def.effectType === 'atkPct') _spAtkPctPoints += total * 100; // 0.001(=0.1%) → _extraDmgPct 단위(퍼센트 숫자)로 변환
      else if (def.effectType === 'atkHpPct') { _spHpPct += total; _spAtkPctPoints += total * 100; }
    }
    this.stats.atk += _spAtkFlat;
    this._extraDmgPct = (this._extraDmgPct || 0) + _spAtkPctPoints;
    this._cdrSpecialty = _spCdReduction;
    if (_spHpFlatBonus) {
      this.maxHp += _spHpFlatBonus; this.hp += _spHpFlatBonus;
    }
    if (_spHpPct) {
      const bonus = Math.floor(CONFIG.PLAYER.BASE_HP * _spHpPct); // hpPct는 이미 소수 비율(0.001=0.1%)이라 ×100 불필요
      this.maxHp += bonus; this.hp += bonus;
    }
    this._specialtyMagnetBonus = _spMagnetFlat;

    // 인게임 레벨업으로 쌓이는 임시 스탯 (런 종료 시 초기화)
    this.tempStats = { atk:0, spd:0, mov:0, def:0, eva:0 };

    // 펫/아이템 패시브 (game.js에서 설정)
    this._damageReduction = 0;
    this._critChance  = (sm.critChance || 0) * sml.critChance + (this._seonsulCritBonus || 0);
    this._critMult    = CONFIG.SINMOK.CRIT_BASE_MULT + (sm.critMult || 0) * sml.critMult;
    // [UPDATE 2026-07-22] 신목/선술로 만든 영구 치명타 스탯이 game.js 스테이지 진입 시 0으로 리셋되던 버그 수정 —
    // 리셋 시 이 base 값으로 되돌리도록 별도 보관 (기존엔 신목 치명타 강화가 사실상 매 스테이지마다 사라지고 있었음)
    this._baseCritChance = this._critChance;
    this._baseCritMult   = this._critMult;
    this._xpMult      = 1.0;
    this._cdReduction = 0;
    this.magnetRange  = CONFIG.ITEM.PASSIVE_MAGNET_RANGE + (this._seonsulMagnetBonus || 0) + (this._specialtyMagnetBonus || 0); // 기본 자석 범위 + 선술 뿌리/가지 + 특산품

    const sc = Player.getSpriteConfig();
    this.img = SpriteLoader.get(sc.src);
    this.spriteW  = sc.drawW;
    this.spriteH  = sc.drawH;
    this.spriteOX = sc.offsetX;
    this.spriteOY = sc.offsetY;

    // 애니메이션
    this.breatheT = 0;
    this.tilt = 0;
    this.isMoving = false;
  }

  // ── 최종 스탯 ──
  // [UPDATE 2026-07-17] 도깨비주사위(_diceAtkMult) — 시즌3 스테이지 입장 시 런 전체에 적용되는 배율
  // [UPDATE 2026-07-31] _blessingMult — 슈브니구라스의 축복/오염도로 인한 런 전체 전투계수(game.js 진입 시 1회 설정).
  // 어계에서는 1+축복수(최대 1001배), 황계에서는 오염도만큼 깎인 값(최소 0.001배), 그 외 계에서는 1.
  // 공격력에 곱하고 받는 피해에 나누는 대칭 구조라 "N배 강해짐"이 그대로 성립한다(takeDamage 참고).
  get totalAtk() { return Math.floor((this.stats.atk + this.tempStats.atk) * (this._atkBuffTime>0 ? (this._atkBuff||1) : 1) * (1 + (this._extraDmgPct||0)/100) * (this._diceAtkMult||1) * (this._lawDmgMult||1) * (this._blessingMult||1)); }
  get totalSpd() { return this.stats.spd + this.tempStats.spd; }
  get totalMov() { return this.stats.mov + this.tempStats.mov; }
  get totalDef() { return this.stats.def + this.tempStats.def + (this._lawDefBonus||0); }
  // [UPDATE 2026-07-17] 명(命) 7~9단계 — 보스 앞에서만 추가 회피율 발동(window._boss 존재 시)
  get totalEva() {
    const bossBonus = (typeof window !== 'undefined' && window._boss) ? (this._myeongBossEvade || 0) : 0;
    return Math.min(this.stats.eva + this.tempStats.eva + bossBonus, CONFIG.EVA.MAX_PERCENT);
  }
  get speed()    { return CONFIG.PLAYER.BASE_SPEED * (this.totalMov / 100); }

  update(dt, dir) {
    // [UPDATE 2026-07-15] 260714_MTOPC.md 시즌3 confuse_field 패턴 — 필드 내 조작 일시 반전
    if (this._controlReversed > 0) {
      this._controlReversed -= dt;
      dir = { x: -dir.x, y: -dir.y };
    }
    const moving = dir.x !== 0 || dir.y !== 0;
    this.isMoving = moving;
    this.x += dir.x * this.speed * dt;
    this.y += dir.y * this.speed * dt;
    if (dir.x !== 0) this.facing = dir.x > 0 ? 1 : -1;
    if (moving) this.walkT += dt * 8;
    if (this.iframe > 0) this.iframe -= dt;

    // 숨쉬기 타이머 (항상 업데이트)
    this.breatheT += dt;
    // 상하 이동 기울기 (부드럽게)
    const targetTilt = dir.y < 0 ? -0.07 : dir.y > 0 ? 0.05 : 0;
    this.tilt += (targetTilt - this.tilt) * Math.min(1, dt * 7);

    // [UPDATE 2026-08-04] 박수 공격 모션 — "전투 중"인지만 판정(2초 넘게 공격 안 하면 대기로 복귀).
    // 준비↔공격 전환 자체는 발사 이벤트와 무관하게 breatheT 기반 고정 주기로 따로 돎(아래 draw() 참고).
    if (this._attackAnimT != null) {
      this._attackAnimT += dt;
      if (this._attackAnimT > 2.0) this._attackAnimT = null;
    }
  }

  takeDamage(dmg, attacker) {
    if (this.iframe > 0 || this.dead) return;
    if (Math.random() * 100 < this.totalEva) return;
    // 보호막 처리 - 횟수만큼 막고 소진되면 깨짐
    if (this._shieldHp > 0) {
      this._shieldHp--;
      if (this._shieldHp <= 0) this._shieldTime = 0;
      this.iframe = 0.3;
      return;
    }
    const reduction = Math.min(this.totalDef / CONFIG.DEF.DIVISOR, CONFIG.DEF.MAX_REDUCTION)
                    + this._damageReduction;
    dmg = dmg * (1 + (this._elementClashDmgTaken||0)); // [UPDATE 2026-07-11] 오행 상극 조합 장착 시 받는 피해 증가
    dmg = dmg * (1 + (this._diceDmgTakenMult||0)); // [UPDATE 2026-07-17] 도깨비주사위(저주/대박) 받는피해 보정
    // [UPDATE 2026-07-31] 축복/오염도는 공격력에 곱해지는 만큼 받는 피해에서도 나눠준다.
    // 이게 없으면 어계에서 100배 몬스터에게 한 대만 맞아도 즉사해서 축복을 아무리 사도 못 뚫음.
    dmg = dmg / Math.max(this._blessingMult || 1, 0.0001);
    const finalDmg  = Math.max(1, Math.floor(dmg * (1 - Math.min(reduction, 0.9))));
    this.hp    -= finalDmg;
    this.iframe = CONFIG.PLAYER.IFRAME_SEC;
    // [UPDATE 2026-07-24] 법칙(반사의 법칙/인과응보의 법칙) 트리거용 누적 카운터 — game.js에서 소비 후 리셋
    this._lawHitCount = (this._lawHitCount || 0) + 1;
    this._lawDmgTakenAccum = (this._lawDmgTakenAccum || 0) + finalDmg;
    // [UPDATE 2026-07-06] 명부강화 데미지 반사: 실제로 받은 데미지의 반사율%만큼 공격자에게 반환
    if (this._reflectPct > 0 && attacker && !attacker.dead && typeof attacker.takeDamage === 'function') {
      attacker.takeDamage(Math.max(1, Math.round(finalDmg * this._reflectPct / 100)));
    }
    if (this.hp <= 0) {
      // [UPDATE 2026-07-06] 상사화 펫: 사망 시 1회 자동부활 (HP 50%)
      if ((this._autoReviveCharges || 0) > 0) {
        this._autoReviveCharges--;
        this.hp = Math.floor(this.maxHp * 0.5);
        this.iframe = 2.0;
        return;
      }
      // [UPDATE 2026-07-17] 명(命) 4~6단계 — 사망 시 확률로 자동 생존(횟수 제한 없이 매번 확률 판정, 상사화 충전식과 별개)
      if ((this._myeongReviveChance || 0) > 0 && Math.random() * 100 < this._myeongReviveChance) {
        this.hp = Math.floor(this.maxHp * 0.5);
        this.iframe = 2.0;
        return;
      }
      this.hp = 0; this.dead = true;
    }
  }

  gainXp(amount) {
    // [UPDATE 2026-07-18] 시즌4(귀허계) 차원석 잠식 디버프 — XP 획득 불가
    if (this._xpBlocked) return false;
    this.xp += amount;
    // [UPDATE 2026-07-31] 🔥 한 번 호출에 레벨업을 1회만 처리하던 것을 while 루프로 변경.
    // 예전엔 오브 하나가 항상 2 XP라 문제가 드러나지 않았지만, 오브 개수에 상한을 걸면서 개당 값이 커지자
    // (원계 353 / 어계 7,810) 남은 XP가 xpNext를 훨씬 넘긴 채로 남아 경험치 바가 수백~수만 %로 표시됐다.
    // 이제 xp < xpNext가 항상 성립하고, 한 번에 오른 레벨 수를 반환해 카드 선택도 그만큼 이어서 뜬다.
    let gained = 0;
    // 상한은 xpNext가 어떤 이유로 0/NaN이 됐을 때 무한 루프를 막는 안전장치
    while (this.xp >= this.xpNext && this.xpNext > 0 && gained < 500) {
      this.xp    -= this.xpNext;
      this.xpNext = Math.floor(this.xpNext * CONFIG.PLAYER.XP_NEXT_SCALE + CONFIG.PLAYER.XP_NEXT_ADD);
      this.level++;
      this.maxHp += CONFIG.PLAYER.HP_ON_LEVEL;
      this.hp = Math.min(this.hp + CONFIG.PLAYER.HEAL_ON_LEVEL, this.maxHp);
      const g = CONFIG.LEVEL_STAT_GAIN;
      this.tempStats.atk += g.atk;
      this.tempStats.spd += g.spd;
      this.tempStats.mov += g.mov;
      this.tempStats.def += g.def;
      this.tempStats.eva += g.eva;
      gained++;
    }
    return gained; // 0이면 falsy라 기존 `if(player.gainXp(...))` 호출부와 호환된다
  }

  draw(ctx, cx, cy) {
    const sx = this.x - cx, sy = this.y - cy;

    // 보호막 이펙트 (푸른 원) - return 전에 그려야 함
    if (this._shieldHp > 0 || this._shieldTime > 0) {
      const _sp = Math.sin(Date.now()*0.005)*0.2+0.8;
      ctx.save();
      ctx.globalAlpha = _sp * 0.85;
      ctx.strokeStyle = '#40c0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#40c0ff';
      ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(sx, sy-20, 28, 0, Math.PI*2); ctx.stroke();
      ctx.globalAlpha = _sp * 0.15;
      ctx.fillStyle = '#40c0ff';
      ctx.fill();
      ctx.restore();
      // 남은 보호막 횟수
      if(this._shieldHp > 0){
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#40c0ff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🛡️'+this._shieldHp, sx, sy-46);
        ctx.textAlign = 'left';
        ctx.restore();
      }
      if(this._shieldTime > 0) this._shieldTime -= 0.016;
    }

    // 무당북 공격력 버프 이펙트 (도트 없이 코드로만)
    if (this._atkBuffTime > 0) {
      const _bp = Math.sin(Date.now()*0.008)*0.25+0.75;
      ctx.save();
      ctx.globalAlpha = _bp*0.7;
      ctx.strokeStyle = '#ff6020';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ff8040';
      ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.arc(sx, sy-20, 22, 0, Math.PI*2); ctx.stroke();
      // 작은 불티 파티클 느낌
      for(let _i=0;_i<3;_i++){
        const _ang = Date.now()*0.003 + _i*2.1;
        const _px = sx + Math.cos(_ang)*24;
        const _py = sy-20 + Math.sin(_ang)*24;
        ctx.globalAlpha = _bp*0.6;
        ctx.fillStyle = '#ffaa40';
        ctx.beginPath(); ctx.arc(_px,_py,2,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
      this._atkBuffTime -= 0.016;
    }

    // 무적 깜빡임 (보호막 없을 때만)
    if (this._shieldHp <= 0 && this.iframe > 0 && Math.floor(this.iframe*12)%2===0) return;

    // 숨쉬기(정지) vs 걷기(이동) 모션
    const breathe = this.isMoving ? 0 : Math.sin(this.breatheT * 1.4) * 1.6;
    const bob = this.isMoving ? Math.sin(this.walkT) * 2 : breathe;

    ctx.save();
    ctx.translate(sx, sy);
    if (this.facing < 0) ctx.scale(-1, 1);

    // 상하 이동 기울기 (캐릭터 중심 기준 회전)
    if (Math.abs(this.tilt) > 0.002) {
      ctx.translate(0, -28);       // 중심점으로 이동
      ctx.rotate(this.tilt * (this.facing > 0 ? 1 : -1));
      ctx.translate(0, 28);        // 다시 원위치
    }
    const ox=this.spriteOX||(-22), oy=this.spriteOY||(-44);
    const sw=this.spriteW||(44),  sh=this.spriteH||(50);
    // [UPDATE 2026-08-04] 모션(대기/공격준비/공격) — 박수 전용.
    // 실제 발사 속도와 완전히 분리된 고정 주기로 계속 돎 — 무기/레벨에 따라 공속이 빨라져도 모션이
    // 정신없어지지 않도록. 전투 중(_attackAnimT != null)일 때만 순환.
    // [UPDATE 2026-08-05] 애기씨는 모션이 어색하다는 피드백 — 예전 방식(챕터별 5단계 정지 이미지)으로 완전 원복.
    // [UPDATE 2026-08-05] 3프레임(대기/준비/공격) → 5프레임(대기1~4+공격)으로 확장. 프레임별 유지시간이 서로
    // 달라서(대기 0.3초씩, 공격 0.8초) 균등분할 대신 누적시간표로 현재 프레임을 찾음(1배속 기준, 총 2.0초 반복).
    const _BAKSU_MOTION_DURS = [0.3, 0.3, 0.3, 0.3, 0.8];
    const _motionSet = (typeof SPRITES !== 'undefined' && this._isBaksu) ? SPRITES.baksuMotion : null;
    let _motionFrame = null;
    if (_motionSet) {
      if (this._attackAnimT == null) {
        _motionFrame = _motionSet[0];
      } else {
        const _cycleLen = _BAKSU_MOTION_DURS.reduce((a,b) => a+b, 0);
        const _cyclePos = this.breatheT % _cycleLen;
        let _acc = 0, _idx = _BAKSU_MOTION_DURS.length - 1;
        for (let i = 0; i < _BAKSU_MOTION_DURS.length; i++) {
          _acc += _BAKSU_MOTION_DURS[i];
          if (_cyclePos < _acc) { _idx = i; break; }
        }
        _motionFrame = _motionSet[_idx] || _motionSet[0];
      }
    }
    const _motionImg = _motionFrame ? SpriteLoader.get(_motionFrame.src) : null;
    if (_motionImg?.complete && _motionImg.naturalWidth > 0) {
      ctx.drawImage(_motionImg, _motionFrame.offsetX, _motionFrame.offsetY+bob, _motionFrame.drawW, _motionFrame.drawH);
    } else if (this.img.complete && this.img.naturalWidth > 0) {
      ctx.drawImage(this.img, ox, oy+bob, sw, sh);
    } else {
      ctx.fillStyle='#d0c8f0'; ctx.fillRect(-10,-36+bob,20,28);
      ctx.beginPath(); ctx.arc(0,-42+bob,10,0,Math.PI*2);
      ctx.fillStyle='#e8dcc8'; ctx.fill();
    }

    // ── 무기: [UPDATE 2026-07-12] 캐릭터 위에 보이도록 몸 그림 다음으로 이동 (예전엔 몸 뒤라 가려짐) ──
    // 주무기만 손에 그림 (보조무기는 제외)
    const _mainOnly = window.mainWeapon ? [window.mainWeapon] : [];
    if (_mainOnly.length) {
      // [UPDATE 2026-08-02] 무기별 손 위치(y) — 애기씨/박수 완전히 분리된 테이블. 절대 서로 안 건드림.
      // 박수는 애기씨 대비 전 무기 균일하게 -20(더 위로) — 체형 비율상 손 위치가 더 높기 때문.
      // 각 무기별 개별 조정 가능하도록 구조는 무기 단위로 분리해둠(지금은 다섯 다 -18/-38로 동일해도 나중에 무기별로 따로 뺄 수 있음).
      const _WEAPON_BASE_Y = {
        aegissi: { talisman: -18, sword: -18, bow: -18, staff: -18, scythe_main: -18 },
        baksu:   { talisman: -38, sword: -38, bow: -38, staff: -38, scythe_main: -38 },
      };
      const wPositions = [
        { x: 28, y: -18 },   // 주무기: 오른쪽 옆 (y는 아래에서 캐릭터별로 다시 계산해 덮어씀)
      ];
      // [UPDATE 2026-07-12] 정정: 어제 각도/위치/좌우반전 튜닝(신검 60도, 신궁 반전 등)은 전부 "완전체(초월 9~10성)"를
      // 보면서 맞춘 값이었음 — 일반(비초월) 무기에는 적용된 적이 없었는데 코드가 공유하고 있어서 일반 무기가 망가져 보였던 것.
      // 그래서 튜닝값은 전부 "_soul" 키로 옮기고, 일반 무기는 깃허브(최신 push)에 있던 원래 방식(회전/반전 없이 중앙-바닥 기준 배치)으로 되돌림.
      // [UPDATE 2026-08-02] dx/dy는 "기본 위치 대비 상대값"이라 애기씨/박수 기본 y가 똑같이 -20만큼 같이 밀리면
      // 이 상대 오프셋은 그대로 재사용해도 결과적으로 초월 위치도 같이 -20 밀린 값이 나옴(수학적으로 동일) — 그래서 공용 유지.
      const _WEAPON_HOLD_TWEAK = {
        // ── 완전체(초월 9~10성) 전용 — 어제 실제로 확인하며 튜닝한 값 ──
        sword_soul:        { angle: Math.PI/3, dx: 19, dy: -25 },
        talisman_soul:      { dx: 12, dy: -15 },
        bow_soul:           { flip: true, dy: -10 },
        staff_soul:         { dy: -18 },
        scythe_main_soul:   { angle: Math.PI/6, dy: -10 },
      };
      // [UPDATE 2026-07-12] 일반(비초월) 무기 손 표시 크기 배율 — 신검이 너무 얇아서(drawW:10) 잘 안 보인다는 피드백
      const _REGULAR_WEAPON_SCALE = { sword: 1.8 };
      for (let i = 0; i < Math.min(_mainOnly.length, 1); i++) {
        const w = _mainOnly[i];
        const _baseWid = w.defId || w.id;
        const _tRank = w._transcendRank || 0;
        // [UPDATE 2026-07-08] 초월 9성 이상이면 완전체 그래픽으로 교체
        const _isSoul = _tRank>=9 && !!SPRITES?.weapons?.[_baseWid+'_soul'];
        const ws = (_isSoul && SPRITES.weapons[_baseWid+'_soul'])
          || SPRITES?.weapons?.[_baseWid] || SPRITES?.weapons?.[w.id];
        if (!ws) continue;
        const wImg = SpriteLoader.get(ws.src);
        if (!wImg?.complete || !wImg.naturalWidth) continue;
        // [UPDATE 2026-08-02] y는 캐릭터별 무기별 개별 테이블에서 가져옴 (x는 공용, 좌우는 문제없다고 확인됨)
        const _baseY = (_WEAPON_BASE_Y[this._isBaksu ? 'baksu' : 'aegissi'][_baseWid]) ?? wPositions[i].y;
        const pos = { x: wPositions[i].x, y: _baseY };
        const _tweak = _isSoul ? _WEAPON_HOLD_TWEAK[_baseWid+'_soul'] : null;

        if (!_tweak) {
          // [UPDATE 2026-07-12] 일반 무기(튜닝 없음) — 깃허브 원본 방식 그대로: 회전/반전 없이 중앙-바닥 기준 배치
          // (1~8성 발광은 여기서도 그대로 유지 — 완전체 전용 분기가 아니라고 발광까지 같이 없어지면 안 됨)
          const _regScale = _REGULAR_WEAPON_SCALE[_baseWid] || 1;
          const _rw = ws.drawW*_regScale, _rh = ws.drawH*_regScale;
          if (_tRank > 0 && typeof _drawTranscendGlow === 'function') {
            _drawTranscendGlow(ctx, pos.x, pos.y - _rh/2 + bob, _tRank, this.breatheT);
          }
          ctx.save();
          ctx.globalAlpha = 0.95;
          ctx.drawImage(wImg, pos.x - _rw/2, pos.y - _rh + bob, _rw, _rh);
          ctx.restore();
          continue;
        }

        // 완전체 전용 — 어제 튜닝한 회전/피벗 방식
        const _rankScale = _tRank>=9 ? 1.35 : _tRank>=5 ? 1.15 : _tRank>=1 ? 1.05 : 1;
        const _holdAngle = _tweak.angle != null ? _tweak.angle : 0;
        const _px = pos.x + (_tweak.dx || 0), _py = pos.y + (_tweak.dy || 0);
        const _hx = (ws.drawW/2) * _rankScale;
        const _hy = (ws.drawH/2) * _rankScale;
        if (_tRank > 0 && typeof _drawTranscendGlow === 'function') {
          _drawTranscendGlow(ctx, _px, _py + bob, _tRank, this.breatheT);
        }
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.translate(_px, _py + bob);
        ctx.rotate(_holdAngle);
        if (_tweak.flip) ctx.scale(-1, 1);
        ctx.drawImage(wImg, -_hx, -_hy, ws.drawW*_rankScale, ws.drawH*_rankScale);
        ctx.restore();
      }
    }

    ctx.restore();
    // 보호막 중엔 빨간 피격 타원 표시 안 함
    if (this.iframe > 0.5 && this._shieldHp <= 0) {
      ctx.save(); ctx.globalAlpha=0.35; ctx.fillStyle='#ff2020';
      ctx.beginPath(); ctx.ellipse(sx,sy-20,18,28,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  // [UPDATE 2026-08-02] 무기 스폰 y좌표 — 캐릭터별 전용 함수(_aegissiWeaponAnchorY/_baksuWeaponAnchorY)로 분기.
  // weapons.js의 모든 발사 지점(player.y-30, player.y-20 등)이 이 메서드 하나만 거치도록 통일.
  weaponAnchorY(baseOffset) {
    return this._isBaksu ? _baksuWeaponAnchorY(this, baseOffset) : _aegissiWeaponAnchorY(this, baseOffset);
  }

  // [UPDATE 2026-08-04] 박수 공격 모션 트리거 — weapons.js가 실제로 투사체를 발사한 프레임에 game.js가 호출.
  // "전투 중" 표시만 갱신(2초 넘게 안 불리면 대기로 복귀) — 준비↔공격 전환 자체는 이 호출 빈도와 무관하게
  // 고정 주기로 따로 돈다(위 draw() 참고). 애기씨는 이 값 자체를 안 쓰므로 호출돼도 무해.
  _pulseAttack() {
    this._attackAnimT = 0;
  }

  // 클리어 챕터 수에 따라 플레이어 스프라이트 단계 반환
  // ch2=1단계, ch4=2단계, ch6=3단계, ch8=4단계, ch10=5단계(최종)
  static getSpriteConfig() {
    const save = (typeof Save !== 'undefined') ? Save.load() : null;
    // [UPDATE 2026-08-02] 주인공 교체 시점 — 파트2 "진입 확정"(part2.active)이 아니라 시즌8 엔딩 감상
    // 완료(season8ClearEnding) 시점으로 앞당김. 엔딩 클라이맥스 자체가 "존재했다는 사실 그 자체가
    // 조용히 지워졌다"는 내용이라, 애기씨는 균열 컨펌을 누르기 전에 이미 사라진 상태이기 때문.
    // 로비(lobby.js)·인게임(game.js) 모두 이 함수 하나로 스프라이트를 정하므로 여기서 분기하면 자동 반영됨.
    if (save?.season8ClearEnding && typeof SPRITES !== 'undefined' && SPRITES.baksuProtagonist) {
      return SPRITES.baksuProtagonist;
    }
    // [UPDATE 2026-08-05] 애기씨는 모션이 어색하다는 피드백으로 3프레임 모션 통일을 철회 —
    // 예전 방식(챕터별 5단계 성장 정지 이미지, player[0~4])으로 완전 원복.
    const cleared = save?.clearedChapters || [];
    let stage = 0;
    if (cleared.includes(2))  stage = 1;
    if (cleared.includes(4))  stage = 2;
    if (cleared.includes(6))  stage = 3;
    if (cleared.includes(8))  stage = 4;
    return SPRITES.player[Math.min(stage, SPRITES.player.length - 1)];
  }
}
