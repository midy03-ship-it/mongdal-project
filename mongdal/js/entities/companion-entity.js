// companion-entity.js - 전투 중 동료 AI

// [UPDATE 2026-07-12] 궁극기 쿨타임이 4~9초로 너무 잦다는 피드백 — 20~30초대로 전체 상향(기존 값*2+12로 선형 변환, 상대적 빠르기 순서는 유지)
const COMPANION_CONFIGS = {
  tank: {
    hp: 150, dmg: 22, atkInterval: 0.47, range: 30,
    orbitRadius: 52, orbitSpd: 0.5,
    atkType: 'slash', pierce: 2,
    skillInterval: 28, skillType: 'shield',
    label: '⚔️ 탱커',
  },
  dps: {
    hp: 75, dmg: 20, atkInterval: 0.85, range: 200,
    orbitRadius: 68, orbitSpd: 0.6,
    atkType: 'arrow', pierce: 0,
    skillInterval: 22, skillType: 'rapidfire',
    label: '🏹 딜러',
  },
  healer: {
    hp: 65, dmg: 0, atkInterval: 0, range: 0,
    orbitRadius: 44, orbitSpd: 0.4,
    atkType: 'heal', pierce: 0,
    skillInterval: 20, skillType: 'heal',
    label: '💚 힐러',
  },
  support: {
    hp: 85, dmg: 28, atkInterval: 2.2, range: 160,
    orbitRadius: 62, orbitSpd: 0.55,
    atkType: 'bomb', pierce: 0,
    skillInterval: 30, skillType: 'slowfield',
    label: '🔧 서포터',
  },
  assassin: {
    hp: 68, dmg: 48, atkInterval: 1.1, range: 160,
    orbitRadius: 72, orbitSpd: 0.7,
    atkType: 'shuriken', pierce: 0,
    skillInterval: 24, skillType: 'execute',
    label: '🗡️ 암살자',
  },
  mage: {
    hp: 70, dmg: 35, atkInterval: 1.2, range: 220,
    orbitRadius: 74, orbitSpd: 0.6,
    atkType: 'magic', pierce: 2,
    skillInterval: 24, skillType: 'burst',
    label: '🪄 마법사',
  },
  berserker: {
    hp: 130, dmg: 40, atkInterval: 0.4, range: 45,
    orbitRadius: 56, orbitSpd: 0.55,
    atkType: 'slam', pierce: 1,
    skillInterval: 26, skillType: 'rage',
    label: '⚡ 버서커',
  },
  // ── 스페셜 동료 개별 스탯 ──
  tank_baekho: {   // 백호신: 돌진 탱커 (도치보다 HP·공격↑)
    hp: 180, dmg: 30, atkInterval: 0.55, range: 35,
    orbitRadius: 52, orbitSpd: 0.5,
    atkType: 'slash', pierce: 2,
    skillInterval: 28, skillType: 'shield',
    label: '🐯 돌진탱커',
  },
  dps_sohee: {     // 봉황 소희: 화염 딜러 (한방 묵직)
    hp: 70, dmg: 32, atkInterval: 1.0, range: 200,
    orbitRadius: 68, orbitSpd: 0.6,
    atkType: 'arrow', pierce: 0,
    skillInterval: 22, skillType: 'rapidfire',
    label: '🔥 화염딜러',
  },
  dps_mugsa: {     // 신검 무사: 근접 한방형
    hp: 90, dmg: 55, atkInterval: 1.4, range: 40,
    orbitRadius: 56, orbitSpd: 0.55,
    atkType: 'slash', pierce: 1,
    skillInterval: 24, skillType: 'rapidfire',
    label: '⚔️ 검호',
  },
  tank_cheolgap: { // 철갑 수호신: HP 최고 방어막 특화
    hp: 220, dmg: 18, atkInterval: 0.6, range: 30,
    orbitRadius: 52, orbitSpd: 0.45,
    atkType: 'slash', pierce: 2,
    skillInterval: 30, skillType: 'shield',
    label: '🛡️ 방어막탱커',
  },
  // [UPDATE 2026-07-06] 시즌2 동료
  tank_haewonmaek: { // 해원맥: 쌍망치 강타 탱커
    hp: 200, dmg: 34, atkInterval: 0.6, range: 38,
    orbitRadius: 52, orbitSpd: 0.5,
    atkType: 'slam', pierce: 1,
    skillInterval: 28, skillType: 'shield',
    label: '🔨 저승무관',
  },
  assassin_gangnim: { // 강림차사: 생사부 처형 암살자
    hp: 80, dmg: 60, atkInterval: 1.2, range: 170,
    orbitRadius: 72, orbitSpd: 0.7,
    atkType: 'shuriken', pierce: 0,
    skillInterval: 24, skillType: 'execute',
    label: '📖 저승차사',
  },
};

// 동료별 공격/궁극기 형태 (레이저형/발사형/장판형)
const COMPANION_ATK_STYLES = {
  dochi:    { atk:'laser', ult:'field'  },
  aram:     { atk:'shot',  ult:'shot'   },
  ggeogsoe: { atk:'field', ult:'field'  },
  danbi:    { atk:'heal',  ult:'field'  },
  gaon:     { atk:'shot',  ult:'field'  },
  cheonga:  { atk:'laser', ult:'laser'  },
  geumgang: { atk:'laser', ult:'field'  },
  baekho:   { atk:'laser', ult:'field'  },
  sohee:    { atk:'shot',  ult:'field'  },
  mugsa:    { atk:'laser', ult:'field'  },
  cheolgap: { atk:'laser', ult:'field'  },
  // [UPDATE 2026-07-06] 시즌2 — 해원맥: 망치 임팩트가 대상 위치에 찍히는 field형 / 강림차사: 생사부 투사체(가로로 긴 이미지라 스케일 지정)
  haewonmaek: { atk:'field', ult:'field' },
  gangnim:    { atk:'shot',  ult:'field', atkScaleX:2.4, atkScaleY:1.1 },
  // [UPDATE 2026-07-17] 도깨비 계열 신규 동료
  baksu:        { atk:'shot',  ult:'field' },
  janggu_aebi:  { atk:'field', ult:'field' },
};

// 역할별 색상 (발사체 / 이펙트)
const ROLE_COLORS = {
  tank:      { main:'#4a90d9', glow:'rgba(74,144,217,.5)'   },
  dps:       { main:'#7ab648', glow:'rgba(122,182,72,.5)'   },
  healer:    { main:'#60d060', glow:'rgba(80,210,80,.5)'    },
  support:   { main:'#e8a020', glow:'rgba(232,160,32,.5)'   },
  assassin:  { main:'#a060c0', glow:'rgba(160,96,192,.5)'   },
  mage:      { main:'#40c0ff', glow:'rgba(64,192,255,.5)'   },
  berserker: { main:'#ff8020', glow:'rgba(255,128,32,.5)'   },
};

class CompanionEntity {
  constructor(data, slotIdx) {
    this.id   = data.id;
    this.name = data.name;
    this.role = data.role;

    // 스프라이트
    this.spriteX = data.spriteX;
    this.spriteY = data.spriteY;
    this.spriteW = data.spriteW;
    this.spriteH = data.spriteH;

    // 스페셜 동료는 개별 설정 우선
    const _specialCfgKey = { baekho:'tank_baekho', sohee:'dps_sohee', mugsa:'dps_mugsa', cheolgap:'tank_cheolgap', haewonmaek:'tank_haewonmaek', gangnim:'assassin_gangnim' }[this.id];
    const cfg   = (_specialCfgKey && COMPANION_CONFIGS[_specialCfgKey]) || COMPANION_CONFIGS[this.role] || COMPANION_CONFIGS.dps;
    const colors = ROLE_COLORS[this.role]      || ROLE_COLORS.dps;
    this.mainColor = colors.main;
    this.glowColor = colors.glow;

    // 별/각성 데이터 (세이브에서 로드)
    const _sd = (typeof Save !== 'undefined') ? Save.load() : null;
    this.stars     = _sd?.companionStars?.[this.id]     || 0;
    this.awakening = _sd?.companionAwakening?.[this.id] || 0;

    // 전투 스탯 (별 1개당 ATK+8%, HP+6%)
    const starAtkMult = 1 + this.stars * 0.08;
    const starHpMult  = 1 + this.stars * 0.06;
    this.maxHp = Math.floor(cfg.hp  * starHpMult);
    this.hp    = this.maxHp;
    this.atkDmg      = Math.floor(cfg.dmg * starAtkMult);
    this.atkInterval = cfg.atkInterval;
    this.atkType     = cfg.atkType;
    this.pierce      = cfg.pierce;
    this.skillInterval = cfg.skillInterval;
    // [UPDATE 2026-07-12] 근접 사거리 ×2 유지, 궁극기 사거리는 평타 사거리와 동일하게 통일(별도 공식 제거)
    const _isMeleeType = this.atkType === 'slash' || this.atkType === 'slam';
    this.atkRange    = (_isMeleeType ? cfg.range : (100 + this.stars * 5)) * 2;
    this.ultRange    = this.atkRange;
    // [UPDATE 2026-07-12] 강림차사로 40% 테스트해보고 "50%가 딱"이라고 확인됨 — 전체 동료에 50% 시작으로 적용
    this.atkEffectScale = 0.50 + this.stars * 0.05;

    // 각성 스탯 적용
    const awakeList = data.awakening || [];
    for (let i = 0; i < this.awakening; i++) {
      const awk = awakeList[i];
      if (!awk) break;
      switch (awk.type) {
        case 'atkSpeed':  this.atkInterval *= (1 - awk.val); break;
        case 'range':     this.atkRange    *= (1 + awk.val); break;
        case 'hp':        this.maxHp = Math.floor(this.maxHp * (1 + awk.val)); this.hp = this.maxHp; break;
        case 'dmg':       this.atkDmg      = Math.floor(this.atkDmg * (1 + awk.val)); break;
        case 'pierce':    this.pierce      += awk.val; break;
        case 'projCount': this.projCount    = (this.projCount || 1) + awk.val; break;
        case 'critRate':  this.critRate     = (this.critRate  || 0) + awk.val; break;
        case 'cooldown':  this.skillInterval *= (1 - awk.val); break;
        case 'healAmt':   this.healBonus    = (this.healBonus || 0) + awk.val; break;
        // 복합형은 플래그만 저장 (game.js / update에서 처리 예정)
        default: this['awk_' + awk.type] = awk.val; break;
      }
    }

    // 궤도
    this.orbitAngle  = slotIdx * (Math.PI * 2 / 3) + Math.PI * 0.25;
    this.orbitRadius = cfg.orbitRadius + slotIdx * 6;
    this.orbitSpd    = cfg.orbitSpd + slotIdx * 0.05;

    // ── 관성 이동 시스템 ──
    this.vx = 0; this.vy = 0;          // 속도 벡터
    this.formationAngle = slotIdx * (Math.PI * 2 / 3) + Math.PI * 0.3;
    this.formationRadius = this.orbitRadius;

    // [UPDATE 2026-07-12] 펫처럼 조금씩 배회하는 느낌 추가 — 고정 대형 위치에서 살짝씩 벗어났다 돌아왔다 함
    this._wanderAngleOfs = 0;
    this._wanderRadiusOfs = 0;
    this._wanderTimer = Math.random() * 2;

    // 위치/애니
    this.x = 0; this.y = 0;
    this.facing = 1;
    this.walkT  = 0;
    this.breatheT = Math.random() * Math.PI * 2; // [UPDATE 2026-07-11] 정지 시 숨쉬기 모션용 (기존엔 정지하면 walkT가 안 늘어서 완전히 멈춰 보였음)

    // 스프라이트
    const sc = SPRITES?.companions?.[this.id];
    this.img = sc ? SpriteLoader.get(sc.src) : null;
    this.sprCfg = sc || null;

    // 상태
    this.atkCd      = Math.random() * this.atkInterval;
    this.skillCd    = this.skillInterval * 0.4;
    this.iframe     = 0;
    this.dead       = false;
    this.reviveTimer = 0;

    // 힐러 이펙트 목록
    this.healEffects = [];
  }

  // ── 업데이트: 반환값 = 발사할 Projectile 배열 (null 허용) ──
  update(dt, player, enemies) {
    const projs = [];

    // 부활 처리
    if (this.dead) {
      this.reviveTimer -= dt;
      if (this.reviveTimer <= 0) {
        this.dead = false;
        this.hp   = Math.floor(this.maxHp * 0.5);
      }
      return projs;
    }

    if (this.iframe > 0) this.iframe -= dt;

    // ── 관성 포메이션 이동 ──
    // 포메이션 각도는 플레이어 이동 방향의 반대쪽으로 자연스럽게 흘러감
    const playerMoving = Math.hypot(player.x - (this._lastPx||player.x), player.y - (this._lastPy||player.y)) > 0.1;
    this._lastPx = player.x; this._lastPy = player.y;

    // [UPDATE 2026-07-12] 배회(wander) — 주기적으로 대형 위치에서 살짝 벗어난 목표를 새로 잡아 항상 미세하게 움직이게 함
    this._wanderTimer -= dt;
    if (this._wanderTimer <= 0) {
      this._wanderTimer = 1.4 + Math.random() * 1.8;
      this._wanderAngleOfs = (Math.random() - 0.5) * 0.5;   // ±0.25 라디안
      this._wanderRadiusOfs = (Math.random() - 0.5) * 16;   // ±8px
    }
    const formX = player.x + Math.cos(this.formationAngle + this._wanderAngleOfs) * (this.formationRadius + this._wanderRadiusOfs);
    const formY = player.y + Math.sin(this.formationAngle + this._wanderAngleOfs) * (this.formationRadius + this._wanderRadiusOfs);

    const dx = formX - this.x, dy = formY - this.y;
    const dist = Math.hypot(dx, dy) || 0.001;

    // 스프링 + 댐핑 (관성 느낌)
    const spring = 5.5;
    const damp   = 0.82;
    this.vx = (this.vx + dx * spring * dt) * damp;
    this.vy = (this.vy + dy * spring * dt) * damp;
    this.x += this.vx;
    this.y += this.vy;

    if (Math.abs(this.vx) > 0.5) this.facing = this.vx > 0 ? 1 : -1;
    else this.facing = player.facing;
    if (Math.hypot(this.vx, this.vy) > 1) this.walkT += dt * 6;
    this.breatheT += dt * 1.3; // [UPDATE 2026-07-11] 정지 여부와 무관하게 항상 증가

    // ── 적 충돌 ──
    for (const e of enemies) {
      if (!e.dead && Math.hypot(e.x - this.x, e.y - this.y) < e.size + 15) {
        if (this.iframe <= 0) {
          // [UPDATE 2026-07-11] 자신(쥐) 펫 compDef 반영 — 동료가 받는 피해 감소
          this.hp -= e.damage * 0.4 * (1 - Math.min(0.8, player._compDefMult||0));
          this.iframe = 0.6;
          if (this.hp <= 0) { this.hp = 0; this.dead = true; this.reviveTimer = 12; }
        }
      }
    }

    // ── 힐러: 플레이어 회복 ──
    if (this.role === 'healer') {
      this.skillCd -= dt;
      if (this.skillCd <= 0) {
        this.skillCd = this.skillInterval;
        if (!player._healBlocked) {
          const heal = 18 + Math.floor(player.level * 1.5);
          player.hp = Math.min(player.hp + heal, player.maxHp);
          this.healEffects.push({ x: this.x, y: this.y, tx: player.x, ty: player.y, t: 0 });
        }
      }
      this.healEffects = this.healEffects.filter(h => h.t < 0.6);
      for (const h of this.healEffects) h.t += dt;
      return projs;
    }

    // ── 일반 공격 ──
    this.atkCd -= dt;
    const aliveEnemies = enemies.filter(e => !e.dead);

    if (this.atkCd <= 0 && aliveEnemies.length > 0) {
      this.atkCd = this.atkInterval;
      const p = this._createProjectile(aliveEnemies, player);
      if (p) projs.push(p);
    }

    // ── 스킬 ──
    this.skillCd -= dt;
    if (this.skillCd <= 0 && aliveEnemies.length > 0) {
      this.skillCd = this.skillInterval;
      const sp = this._useSkill(aliveEnemies, player);
      if (sp) projs.push(...(Array.isArray(sp) ? sp : [sp]));
    }

    return projs;
  }

  _getTarget(enemies) {
    const alive = enemies.filter(e => !e.dead);
    if (alive.length === 0) return null;

    if (this.role === 'assassin') {
      // 체력 최저 우선
      return alive.reduce((a, b) => a.hp < b.hp ? a : b);
    }
    // 가장 가까운 적
    return alive.reduce((a, b) =>
      Math.hypot(a.x-this.x, a.y-this.y) < Math.hypot(b.x-this.x, b.y-this.y) ? a : b);
  }

  _createProjectile(enemies, player) {
    const target = this._getTarget(enemies);
    if (!target) return null;

    const dist = Math.hypot(target.x - this.x, target.y - this.y);
    if (dist > this.atkRange + 40) return null;

    const dx = target.x - this.x, dy = target.y - this.y;
    const d  = Math.hypot(dx, dy) || 1;

    const style   = COMPANION_ATK_STYLES[this.id]?.atk || 'shot';
    const srcType = `c_${this.id}_atk`;
    const base    = { srcType, color: this.mainColor, glow: this.glowColor };

    // [UPDATE 2026-07-12] 공격 이펙트(도트) 크기 배율 — 별 레벨에 비례해 커짐 (atkEffectScale)
    const _es = this.atkEffectScale != null ? this.atkEffectScale : 1;

    if (style === 'laser') {
      // 즉시 빔 데미지 (경로 내 모든 적)
      const beamW = 22 * _es;
      const ux = dx / d, uy = dy / d;
      for (const e of enemies) {
        if (e.dead) continue;
        const ex = e.x - this.x, ey = e.y - this.y;
        const proj = ex * ux + ey * uy;
        if (proj < 0 || proj > d + e.size) continue;
        if (Math.abs(ex * uy - ey * ux) < beamW + e.size) e.takeDamage(this.atkDmg);
      }
      return new Projectile(this.x, this.y - 20, 0, 0, 0, {
        ...base, type: `companion_${this.id}_atk`,
        radius: 0, pierce: 999, life: 0.35,
        laser: true, laserAngle: Math.atan2(dy, dx), laserLen: d, laserThickness: 0.55*_es,
      });
    }

    if (style === 'field') {
      return new Projectile(target.x, target.y, 0, 0, this.atkDmg, {
        ...base, type: `companion_${this.id}_atk`,
        radius: 8*_es, pierceAll: true, aoe: 80*_es, life: 0.8, field: true,
      });
    }

    // shot (발사형) — [UPDATE 2026-07-06] ATK_STYLES에 atkScaleX/Y 지정 시 이미지 크기 배율 적용
    const _st = COMPANION_ATK_STYLES[this.id] || {};
    return new Projectile(this.x, this.y, (dx/d)*320, (dy/d)*320, this.atkDmg, {
      ...base, type: `companion_${this.id}_atk`,
      radius: 6*_es, pierce: this.pierce, life: 1.5,
      drawScaleX: (_st.atkScaleX || 1) * _es, drawScaleY: (_st.atkScaleY || 1) * _es,
    });
  }



  _useSkill(enemies, player) {
    const ultStyle = COMPANION_ATK_STYLES[this.id]?.ult;
    const srcType  = `c_${this.id}_ult`;
    // [UPDATE 2026-07-12] 궁극기 사거리 제한 신설 — 예전엔 맵 전체 아무 적이나 대상이 될 수 있었음
    const _ultRange = this.ultRange != null ? this.ultRange : 120;
    const alive = enemies.filter(e => !e.dead && Math.hypot(e.x-this.x, e.y-this.y) <= _ultRange);
    if (alive.length === 0) return null;

    const target = this._getTarget(alive);
    if (!target) return null;
    const dx = target.x - this.x, dy = target.y - this.y;
    const d  = Math.hypot(dx, dy) || 1;
    const base = { srcType, color: this.mainColor, glow: this.glowColor };
    // [UPDATE 2026-07-12] 궁극기도 평타와 동일하게 atkEffectScale만큼 이펙트 크기 축소
    const _es = this.atkEffectScale != null ? this.atkEffectScale : 1;

    if (ultStyle === 'laser') {
      const beamW = 30 * _es;
      const ux = dx / d, uy = dy / d;
      for (const e of alive) {
        const ex = e.x - this.x, ey = e.y - this.y;
        const proj = ex * ux + ey * uy;
        if (proj < 0 || proj > d + e.size) continue;
        if (Math.abs(ex * uy - ey * ux) < beamW + e.size) e.takeDamage(this.atkDmg * 2.5);
      }
      return new Projectile(this.x, this.y - 20, 0, 0, 0, {
        ...base, type: `companion_${this.id}_ult`,
        radius: 0, pierce: 999, life: 0.6,
        laser: true, laserAngle: Math.atan2(dy, dx), laserLen: d, laserThickness: 0.55*_es,
      });
    }

    if (ultStyle === 'shot') {
      return alive.slice(0, 3).map(e => {
        const ex = e.x - this.x, ey = e.y - this.y;
        const ed = Math.hypot(ex, ey) || 1;
        return new Projectile(this.x, this.y, (ex/ed)*380, (ey/ed)*380, this.atkDmg * 2, {
          ...base, type: `companion_${this.id}_ult`,
          radius: 8*_es, pierce: this.pierce, life: 1.8,
        });
      });
    }

    // field (장판형 궁극기)
    return new Projectile(target.x, target.y, 0, 0, this.atkDmg * 2, {
      ...base, type: `companion_${this.id}_ult`,
      radius: 8*_es, pierceAll: true, aoe: 120*_es, life: 1.5, field: true,
    });
  }

  // ── 렌더 ──
  draw(ctx, camX, camY, img) {
    if (this.dead) {
      // 사망 표시
      const sx = this.x - camX, sy = this.y - camY;
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#800';
      ctx.beginPath(); ctx.arc(sx, sy - 20, 14, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // 부활 게이지
      const prog = 1 - this.reviveTimer / 12;
      ctx.fillStyle = '#400'; ctx.fillRect(sx-20, sy-38, 40, 4);
      ctx.fillStyle = '#f04040'; ctx.fillRect(sx-20, sy-38, 40*prog, 4);
      ctx.textAlign='center'; ctx.fillStyle='#aaa'; ctx.font='8px sans-serif';
      ctx.fillText('🕐', sx, sy-42); ctx.textAlign='left';
      return;
    }

    const sx = this.x - camX, sy = this.y - camY;
    // [UPDATE 2026-07-11] 이동 중엔 걷기모션, 정지 중엔 숨쉬기모션 (기존엔 정지 시 walkT가 안 늘어 완전 정지로 보였음)
    const _isMoving = Math.hypot(this.vx, this.vy) > 1;
    const bob = _isMoving ? Math.sin(this.walkT) * 2.5 : Math.sin(this.breatheT) * 1.6;
    const H = 52, W = this.spriteW * (H / this.spriteH);

    // 발광
    ctx.save();
    ctx.globalAlpha = 0.3;
    const g = ctx.createRadialGradient(sx, sy-H*0.5, 0, sx, sy-H*0.5, H*0.7);
    g.addColorStop(0, this.mainColor); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy-H*0.5, H*0.7, 0, Math.PI*2); ctx.fill();
    ctx.restore();



    ctx.save();
    ctx.translate(sx, sy + bob);
    if (this.facing < 0) ctx.scale(-1, 1);

    // ① 개별 스프라이트 파일 우선
    if (this.img && this.img.complete && this.img.naturalWidth > 0 && this.sprCfg) {
      const sc = this.sprCfg;
      ctx.drawImage(this.img, sc.offsetX, sc.offsetY, sc.drawW, sc.drawH);
    // ② 구 스프라이트 시트 폴백
    } else if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, this.spriteX, this.spriteY, this.spriteW, this.spriteH, -W/2, -H, W, H);
    // ③ 캔버스 폴백
    } else {
      ctx.fillStyle = this.mainColor;
      ctx.beginPath(); ctx.arc(0, -H*0.55, 14, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e8dcc8'; ctx.font='9px sans-serif'; ctx.textAlign='center';
      ctx.fillText(this.name[0], 0, -H*0.51);
    }
    ctx.restore();

    // 머리 위 HP바 (항상 표시)
    const _hbw = 28, _hbh = 3;
    ctx.fillStyle = '#300';
    ctx.fillRect(sx - _hbw/2, sy - H - 6, _hbw, _hbh);
    if (!this.dead) {
      ctx.fillStyle = this.mainColor;
      ctx.fillRect(sx - _hbw/2, sy - H - 6, _hbw * (this.hp/this.maxHp), _hbh);
    }
    ctx.textAlign = 'left';

    // 힐러 이펙트
    if (this.role === 'healer') this._drawHealEffects(ctx, camX, camY);
  }

  _drawHealEffects(ctx, camX, camY) {
    for (const h of this.healEffects) {
      const prog = h.t / 0.6;
      const cx = h.x + (h.tx - h.x) * prog;
      const cy = h.y + (h.ty - h.y) * prog;
      const sx = cx - camX, sy = cy - camY;
      ctx.save();
      ctx.globalAlpha = 1 - prog;
      ctx.fillStyle = '#60ff60';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💚', sx, sy);
      ctx.restore();
    }
  }
}
