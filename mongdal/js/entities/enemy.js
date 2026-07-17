// enemy.js - 챕터별 몬스터 시스템 (10종 + 공격 패턴)

// MONSTERS.defs에서 동적으로 ENEMY_TYPES 생성
function buildEnemyTypes() {
  const types = {};
  for (const [id, def] of Object.entries(MONSTERS.defs)) {
    types[id] = {
      name:      def.name,
      hp:        def.hp,
      damage:    def.damage,
      speed:     def.speed,
      xp:        def.xp,
      size:      def.size,
      color:     def.color,
      glowColor: def.glowColor,
      shape:     def.shape,
      attackPattern: def.attackPattern,
    };
  }
  // 레거시 타입 유지 (하위 호환)
  types.ghost    = types.mangryeong || { name:'몽달귀신', hp:18, damage:8, speed:55, xp:2, gold:2, size:14, color:'#7090d0', glowColor:'rgba(80,100,220,0.4)', shape:'ghost', attackPattern:'melee' };
  types.water    = types.hungry_soul || { name:'물귀신', hp:30, damage:12, speed:45, xp:4, gold:4, size:16, color:'#40b0d0', glowColor:'rgba(40,160,200,0.4)', shape:'blob', attackPattern:'melee' };
  types.dokkaebi = types.wongwi     || { name:'도깨비', hp:50, damage:18, speed:70, xp:7, gold:7, size:18, color:'#d04020', glowColor:'rgba(200,60,20,0.4)', shape:'brute', attackPattern:'rush' };
  types.soul     = types.gokseong   || { name:'원혼', hp:12, damage:6, speed:90, xp:3, gold:3, size:11, color:'#a060c0', glowColor:'rgba(140,60,180,0.4)', shape:'orb', attackPattern:'melee' };
  return types;
}

const ENEMY_TYPES = {};

class Enemy {
  constructor(x, y, typeName, wave, isDungeon = false, dungeonMult = 1, glitchMods = null, rewardMult = null) {
    // 타입 데이터 (ENEMY_TYPES 초기화 전이면 직접 조회)
    const t = ENEMY_TYPES[typeName] || MONSTERS?.defs?.[typeName] || ENEMY_TYPES.ghost || { name:'몽달귀신', hp:18, damage:8, speed:55, xp:2, gold:2, size:14, color:'#7090d0', glowColor:'rgba(80,100,220,0.4)', shape:'ghost', attackPattern:'melee' };

    // 스테이지(느슨) vs 던전(빡빡) 스케일링 분리
    const hpScale    = isDungeon ? 0.667 : 0.4;
    const speedScale = isDungeon ? 9     : 5;

    // [UPDATE 2026-07-10] 초반 진입장벽 완화: 챕터1 대폭/챕터2 소폭/챕터3 아주 조금 하향 (일반 스테이지 전용, 던전류 제외)
    const _ch = isDungeon ? 0 : (window._curChapterForEnemyScale || 0);
    const chapterEase = _ch===1 ? 0.5 : _ch===2 ? 0.75 : _ch===3 ? 0.9 : 1.0;

    this.type     = typeName;
    this.name     = t.name;
    this.hp       = Math.floor(t.hp    * (1 + wave * hpScale) * dungeonMult * chapterEase);
    this.maxHp    = this.hp;
    // [UPDATE 2026-07-15] 튜토리얼용 — 스테이지1 한정 몬스터 공격력 ×0.1 (신규 유저 초반 사망 방지)
    const stage1DmgEase = (!isDungeon && window._stage1DmgEase) ? 0.1 : 1.0;
    this.damage   = Math.floor(t.damage* (1 + wave * 0.18)    * dungeonMult * chapterEase * stage1DmgEase);
    this.speed    = t.speed  + wave * speedScale;
    this.xpValue  = t.xp; // [UPDATE 2026-07-16] 260716_MTOPC.md 2번①: XP는 의도적으로 dungeonMult 미적용(레벨업 카드 과다 방지)
    // [UPDATE 2026-07-16] 260716_MTOPC.md 2번①: 버그 수정 — 무한던전 몬스터 HP/공격력이 세지는데 골드 보상은
    // 안 따라가서 파밍 효율이 떨어지던 문제. 골드도 dungeonMult 적용.
    // [UPDATE 2026-07-17] 몬스터가 세지는 배율보다 보상 배율을 1.5배 더 후하게 주도록 rewardMult 분리(사용자 요청)
    this.goldValue = Math.floor((t.gold||1)*(1+wave*0.10)*(rewardMult!=null?rewardMult:dungeonMult));
    this.size     = t.size;
    this.color    = t.color;
    this.glowColor= t.glowColor;
    this.shape    = t.shape    || 'ghost';
    this.attackPattern = t.attackPattern || 'melee';
    this.isElite  = t.isElite || false;

    this.x = x; this.y = y;
    this.dead    = false;
    this.deathT  = 0;
    this.wobble  = Math.random() * Math.PI * 2;
    this.t       = 0;

    // 공격 패턴별 상태
    this.rushCd    = 2 + Math.random() * 2;  // 돌진 쿨타임
    this.rushing   = false;
    this.rushVx    = 0; this.rushVy = 0;
    this.rushTimer = 0;

    this.shootCd   = 1.5 + Math.random();   // 원거리 쿨타임
    this.exploded  = false;

    // 마크/혼란 디버프
    this._marked       = 0;
    this._markedDmgMult= 1;
    this._confused     = 0;
    this._stunned       = 0; // [UPDATE 2026-07-13] 정화의 소금(salt_scatter) 등 CC용 — 혼란(반대이동)과 달리 완전 정지

    // 스프라이트 (없으면 캔버스 폴백)
    const sprKey = typeName;
    const sc = SPRITES?.enemies?.[sprKey];
    this.img    = sc ? SpriteLoader.get(sc.src) : null;
    this.sprCfg = sc || null;

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번④: 글리치 몬스터 modifier — 신규 이미지 없이 스탯 보정 + VFX로 표현
    this.glitchMods = glitchMods || null;
    this._glitchInvisTimer = 0; this._glitchInvisActive = false;
    this._glitchSplit = false; this._glitchSplitDone = false;
    if (this.glitchMods) {
      for (const m of this.glitchMods) {
        if (m === 'fast') { this.speed *= 1.4; }
        else if (m === 'slowGiant') {
          this.speed *= 0.7; this.size = Math.floor(this.size * 1.3);
          this.hp = Math.floor(this.hp * 1.5); this.maxHp = this.hp;
        }
        else if (m === 'split') { this._glitchSplit = true; }
        else if (m === 'invis') { this._glitchInvisTimer = 3.0; }
      }
    }
  }

  update(dt, px, py) {
    this.t += dt;
    if (this.dead) { this.deathT += dt; return null; }
    // [UPDATE 2026-07-13] 스턴 중엔 이동/공격 모두 정지 (혼란처럼 반대로 움직이지 않고 완전 멈춤)
    if (this._stunned > 0) { this._stunned -= dt; return null; }

    // [UPDATE 2026-07-17] 글리치 modifier "투명" — 3초 주기로 1초간 투명화(피격 불가)
    if (this.glitchMods && this.glitchMods.includes('invis')) {
      this._glitchInvisTimer -= dt;
      if (this._glitchInvisTimer <= 0) {
        this._glitchInvisActive = !this._glitchInvisActive;
        this._glitchInvisTimer = this._glitchInvisActive ? 1.0 : 3.0;
      }
    }

    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    switch (this.attackPattern) {

      case 'melee':
        this._moveToward(dt, px, py, dist, dx, dy);
        break;

      case 'rush':
        this._updateRush(dt, px, py, dist, dx, dy);
        break;

      case 'swarm':
        // 무리: 빠르게 접근
        this._moveToward(dt, px, py, dist, dx, dy, 1.1);
        break;

      case 'ranged':
        // 일정 거리 유지하며 사격
        if (dist > 200) {
          this._moveToward(dt, px, py, dist, dx, dy, 0.8);
        } else if (dist < 120) {
          // 너무 가까우면 후퇴
          this.x -= (dx/dist) * this.speed * 0.4 * dt;
          this.y -= (dy/dist) * this.speed * 0.4 * dt;
        }
        this.shootCd -= dt;
        if (this.shootCd <= 0 && dist < 350) {
          this.shootCd = 1.8 + Math.random();
          return this._fireProjectile(dx, dy, dist);
        }
        break;

      case 'explode':
        // 폭발형: 빠르게 돌진
        this._moveToward(dt, px, py, dist, dx, dy, 1.2);
        break;
    }
    return null;
  }

  _moveToward(dt, px, py, dist, dx, dy, speedMult = 1) {
    if (this._confused > 0) {
      // 혼란: 반대 방향
      this.x -= (dx/dist) * this.speed * speedMult * 0.5 * dt;
      this.y -= (dy/dist) * this.speed * speedMult * 0.5 * dt;
    } else {
      this.x += (dx/dist) * this.speed * speedMult * dt;
      this.y += (dy/dist) * this.speed * speedMult * dt;
    }
  }

  _updateRush(dt, px, py, dist, dx, dy) {
    if (this.rushing) {
      this.x += this.rushVx * dt;
      this.y += this.rushVy * dt;
      this.rushTimer -= dt;
      if (this.rushTimer <= 0) this.rushing = false;
    } else {
      this._moveToward(dt, px, py, dist, dx, dy, 0.6);
      this.rushCd -= dt;
      if (this.rushCd <= 0 && dist < 300) {
        this.rushCd    = 2.5 + Math.random();
        this.rushing   = true;
        this.rushTimer = 0.45;
        const spd      = this.speed * 3.5;
        this.rushVx    = (dx/dist) * spd;
        this.rushVy    = (dy/dist) * spd;
      }
    }
  }

  _fireProjectile(dx, dy, dist) {
    const spd = 190;
    return {
      isEnemyProjectile: true,
      x: this.x, y: this.y,
      vx: (dx/dist)*spd, vy: (dy/dist)*spd,
      // [UPDATE 2026-07-16] 원거리 몹 여러 마리가 겹쳐 쏠 때 피해가 과했다는 피드백 — 0.6 → 0.4로 너프
      damage: Math.floor(this.damage * 0.4),
      radius: 5, life: 2.2, dead: false, t: 0,
      color: this.color,
    };
  }

  takeDamage(dmg, isCritical, srcType) {
    if (this.dead) return;
    if (this._glitchInvisActive) return; // [UPDATE 2026-07-17] 글리치 "투명" — 투명화 중 피격 무효
    if (this._markedDmgMult && this._markedDmgMult > 1)
      dmg = Math.floor(dmg * this._markedDmgMult);
    this.hp -= dmg;
    // 피격 이펙트 스폰
    if (window._hitEffects) {
      const key = isCritical ? 'hit_critical' : 'hit_normal';
      window._hitEffects.push({
        x: this.x + (Math.random()-.5)*this.size,
        y: this.y + (Math.random()-.5)*this.size,
        t: 0, life: 0.35, key,
        ox: (Math.random()-.5)*10, oy: -8-Math.random()*6,
      });
    }
    if (this.hp <= 0) {
      this.hp = 0; this.dead = true;
      // [UPDATE 2026-07-11] 오행 시너지(영혼낫 처치→신검 쿨감 스택 등) 처치 귀속용 훅
      if (typeof window!=='undefined' && typeof window._onEnemyKilled==='function') window._onEnemyKilled(srcType);
    }
  }

  hitTest(px, py, pr) {
    return Math.hypot(this.x-px, this.y-py) < this.size + pr;
  }

  draw(ctx, camX, camY) {
    const sx = this.x - camX, sy = this.y - camY;
    const s  = this.size;

    // ── 사망 이펙트 ──
    if (this.dead) {
      const alpha = Math.max(0, 1 - this.deathT * 2.5);
      const scale = 1 + this.deathT * 3;
      ctx.save();
      ctx.globalAlpha = alpha;
      const g = ctx.createRadialGradient(sx,sy,0,sx,sy,s*scale*2);
      g.addColorStop(0,this.color); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,s*scale*1.5,0,Math.PI*2); ctx.fill();
      ctx.restore();
      return;
    }

    // ── 발광 오라 ──
    const grd = ctx.createRadialGradient(sx,sy,0,sx,sy,s*1.9);
    grd.addColorStop(0, this.glowColor); grd.addColorStop(1, 'transparent');
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(sx,sy,s*1.9,0,Math.PI*2); ctx.fill();

    // ── 엘리트 금색 외곽선 ──
    if (this.isElite) {
      ctx.save();
      ctx.strokeStyle = `rgba(255,200,50,${0.5 + Math.sin(this.t * 3) * 0.3})`;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ffc830';
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(sx, sy, s + 8, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    // ── 돌진 예고 이펙트 ──
    if (this.attackPattern==='rush' && !this.rushing && this.rushCd < 0.6) {
      ctx.save(); ctx.globalAlpha = (0.6 - this.rushCd) * 1.5;
      ctx.strokeStyle = '#ff4020'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx,sy,s+6+Math.sin(this.t*15)*3,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }

    // ── 스프라이트 or 폴백 도형 ──
    ctx.save();
    ctx.translate(sx, sy + Math.sin(this.t*2+this.wobble)*2.5);
    // [UPDATE 2026-07-17] 글리치 "투명" modifier — 투명화 중엔 희미하게만 보이도록(완전 비가시는 UX상 위험해서 반투명 처리)
    if (this._glitchInvisActive) ctx.globalAlpha = 0.2;

    if (this.img && this.img.complete && this.img.naturalWidth > 0 && this.sprCfg) {
      const sc = this.sprCfg;
      ctx.drawImage(this.img, sc.offsetX||(-s), sc.offsetY||(-s*1.5), sc.drawW||(s*2), sc.drawH||(s*2.5));
    } else {
      this._drawShape(ctx, s);
    }
    ctx.restore();

    // ── HP 바 ──
    if (this.hp < this.maxHp) {
      const bw=s*2.6, bh=3;
      ctx.fillStyle='#400'; ctx.fillRect(sx-bw/2,sy-s-8,bw,bh);
      ctx.fillStyle=this.color; ctx.fillRect(sx-bw/2,sy-s-8,bw*(this.hp/this.maxHp),bh);
    }

    // ── 상태이상 표기 ──
    if(this._charmed>0){
      // 현혹: 분홍 하트 아우라 + 깜빡임
      ctx.save();
      ctx.globalAlpha=0.55+Math.sin(this.t*6)*0.25;
      ctx.strokeStyle='#ff60c0'; ctx.lineWidth=2.5;
      ctx.shadowColor='#ff80d0'; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(sx,sy,s+5,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#ff60c0'; ctx.font=`${Math.round(s*0.9)}px serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('♥',sx,sy-s-14);
      ctx.restore();
    }
    if(this._markedDur>0){
      // 저주 인형: 보라색 X 표기
      ctx.save();
      ctx.globalAlpha=0.5+Math.sin(this.t*5)*0.2;
      ctx.strokeStyle='#c040e0'; ctx.lineWidth=2;
      ctx.shadowColor='#c040e0'; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(sx,sy,s+4,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='#c040e0'; ctx.font=`${Math.round(s*0.9)}px serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('✦',sx,sy-s-14);
      ctx.restore();
    }

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번④: 글리치 modifier 배지 — 별도 이미지 없이 아이콘으로 표기
    if (this.glitchMods && this.glitchMods.length) {
      const _badgeIcon = { fast:'💨', slowGiant:'🐢', split:'🔀', invis:'👻' };
      ctx.save();
      ctx.font = `${Math.round(s*0.7)}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      this.glitchMods.forEach((m, i) => {
        ctx.fillText(_badgeIcon[m] || '', sx + s*0.9 + i*(s*0.6), sy - s - 6);
      });
      ctx.restore();
    }
  }

  _drawShape(ctx, s) {
    const t = this.t;
    switch (this.shape) {
      case 'ghost':   this._drawGhost(ctx, s, t); break;
      case 'brute':   this._drawBrute(ctx, s, t); break;
      case 'blob':    this._drawBlob(ctx, s, t);  break;
      case 'orb':     this._drawOrb(ctx, s);       break;
      default:        this._drawGhost(ctx, s, t);
    }
  }

  _drawGhost(ctx, s, t) {
    ctx.fillStyle=this.color;
    ctx.beginPath(); ctx.arc(0,-s*.3,s,0,Math.PI);
    ctx.lineTo(-s,s*.5);
    for(let i=0;i<3;i++){const bx=-s+(i*s*2/2);ctx.quadraticCurveTo(bx+s/3,s,bx+s*.67,s*.5);}
    ctx.lineTo(s,s*.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(0,10,40,0.6)';
    ctx.beginPath();ctx.arc(-s*.3,-s*.2,s*.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc( s*.3,-s*.2,s*.2,0,Math.PI*2);ctx.fill();
  }
  _drawBrute(ctx, s, t) {
    ctx.fillStyle=this.color;
    ctx.beginPath(); ctx.ellipse(0,0,s*.85,s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=this.color+'aa';
    ctx.beginPath();ctx.moveTo(-s*.5,-s*.8);ctx.lineTo(-s*.25,-s*1.4);ctx.lineTo(0,-s*.8);ctx.fill();
    ctx.beginPath();ctx.moveTo( s*.5,-s*.8);ctx.lineTo( s*.25,-s*1.4);ctx.lineTo(0,-s*.8);ctx.fill();
    ctx.fillStyle='#ff8020';
    ctx.beginPath();ctx.arc(-s*.3,-s*.1,s*.25,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc( s*.3,-s*.1,s*.25,0,Math.PI*2);ctx.fill();
  }
  _drawBlob(ctx, s, t) {
    ctx.fillStyle=this.color;
    ctx.beginPath(); ctx.ellipse(0,0,s*1.1,s*.85,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.45)';
    ctx.beginPath();ctx.arc(-s*.3,-s*.15,s*.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc( s*.3,-s*.15,s*.2,0,Math.PI*2);ctx.fill();
  }
  _drawOrb(ctx, s) {
    const g = ctx.createRadialGradient(-s*.3,-s*.3,0,0,0,s);
    g.addColorStop(0,'#ffffff'); g.addColorStop(0.3,this.color); g.addColorStop(1,'#10002a');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,s,0,Math.PI*2); ctx.fill();
  }
}

// MONSTERS 로드 후 ENEMY_TYPES 채우기
function initEnemyTypes() {
  const built = buildEnemyTypes();
  // 엘리트 타입 추가
  for (const [id, def] of Object.entries(MONSTERS.elites || {})) {
    built[id] = {
      name: def.name, hp: def.hp, damage: def.damage, speed: def.speed,
      xp: def.xp, gold: def.gold, size: def.size,
      color: def.color, glowColor: def.glowColor,
      shape: def.shape, attackPattern: def.attackPattern,
      isElite: true,
    };
  }
  Object.assign(ENEMY_TYPES, built);
}
