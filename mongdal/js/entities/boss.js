// boss.js - 보스 엔티티

// ── 보스 정의 ──
const BOSS_DEFS = {
  mid_boss: {
    name: '원귀장',
    sub:  '분노한 원혼의 수장',
    hp:   900,
    dmg:  22,
    spd:  55,
    size: 34,
    xp:   100,
    color:     '#8040d0',
    glowColor: 'rgba(128,64,210,0.55)',
    // HP 비율별 페이즈 (내림차순)
    phases: [
      { threshold: 1.0, patterns: ['rush','shockwave','rush'],        interval: 3.2 },
      { threshold: 0.5, patterns: ['rush','rush','shockwave','spiral'], interval: 2.4 },
    ],
  },
  chapter_boss: {
    name: '목 없는 장군',
    sub:  '귀-인-국을 무너뜨린 전쟁의 화신',
    hp:   2200,
    dmg:  32,
    spd:  50,
    size: 44,
    xp:   250,
    color:     '#c04010',
    glowColor: 'rgba(200,64,16,0.55)',
    phases: [
      { threshold: 1.0, patterns: ['rush','sweep','summon'],               interval: 3.5 },
      { threshold: 0.6, patterns: ['rush','rush','sweep','spiral'],         interval: 2.6 },
      { threshold: 0.3, patterns: ['rush','spiral','spiral','sweep','rush'], interval: 1.8 },
    ],
  },
};

class Boss {
  constructor(x, y, bossType, wave, chapter) {
    const def = BOSS_DEFS[bossType] || BOSS_DEFS.mid_boss;
    this.bossType = bossType;

    // 챕터별 보스 이름/색상 오버라이드
    const ch = chapter || 1;
    const chBoss = MONSTERS?.bosses?.[ch];
    const chKey  = bossType === 'chapter_boss' ? 'final' : 'mid';
    const chDef  = chBoss?.[chKey];

    this.name   = chDef?.name   || def.name;
    this.nameEn = chDef?.nameEn || def.nameEn || this.name;
    this.sub    = chDef?.sub    || def.sub;
    this.subEn  = chDef?.subEn  || def.subEn  || this.sub;
    const baseHp  = chDef?.hp  || def.hp;
    const baseDmg = chDef?.dmg || def.dmg;
    const baseSpd = chDef?.spd || def.spd;
    // [UPDATE 2026-07-10] 초반 진입장벽 완화: 챕터1 대폭/챕터2 소폭/챕터3 아주 조금 하향 (일반 스테이지 전용, 보스러시 등 제외)
    const _bch = window._curChapterForEnemyScale || 0;
    const bossChapterEase = _bch===1 ? 0.5 : _bch===2 ? 0.75 : _bch===3 ? 0.9 : 1.0;
    this.hp    = Math.floor(baseHp  * (1 + wave * 0.12) * bossChapterEase); // [UPDATE 2026-07-09] 개발모드 체력 90% 감소 제거 — 실제 밸런스로 테스트
    this.maxHp = this.hp;
    this.dmg   = Math.floor(baseDmg * (1 + wave * 0.08) * bossChapterEase);
    this.baseSpd = baseSpd;
    this.spd   = baseSpd;
    this.size  = def.size;
    this.xpVal = def.xp;
    const baseColor = chDef?.color || def.color;
    this.color     = baseColor;
    this.glowColor = def.glowColor;
    this.phases    = chDef?.phases || def.phases;

    this.x = x; this.y = y;
    this.dead    = false;
    this.deathT  = 0;
    this.iframe  = 0;
    // 스프라이트: 챕터별 이미지 우선, 없으면 레거시 이미지 폴백
    const chSprKey = bossType === 'chapter_boss'
      ? `ch${ch}_boss`
      : `ch${ch}_midboss`;
    const sc = SPRITES?.bosses?.[chSprKey] || SPRITES?.bosses?.[bossType];
    this.img = sc ? SpriteLoader.get(sc.src) : null;
    this.sprCfg = sc || null;

    // 페이즈
    this.phase       = 0;
    this.phaseFlash  = 0; // 페이즈 전환 플래시

    // 패턴 상태머신
    //  'idle' → 'telegraphing' → 'attacking' → 'recovering' → 'idle'
    this.state       = 'idle';
    this.stateTimer  = 1.5;       // 첫 패턴까지 대기
    this.patternIdx  = 0;
    this.curPattern  = null;

    // 애니메이션
    this.t = 0;

    // 패턴별 임시 데이터
    this.chargeVx = 0; this.chargeVy = 0;
    this.telegraphAngle = 0;
    this.telegraphRadius = 0;
    this.spiralAngle = 0;

    // 소환 위치
    this.summonSpots = [];

    // 경고 표시
    this.showWarning = false;
    this.warningT    = 0;
  }

  // ── 현재 페이즈 데이터 ──
  get curPhase() {
    // hp 비율에 따라 가장 낮은 threshold 선택
    const ratio = this.hp / this.maxHp;
    let p = this.phases[0];
    for (const ph of this.phases) {
      if (ratio <= ph.threshold) p = ph;
    }
    return p;
  }

  // ── 업데이트 ──
  // 반환: 생성할 발사체 배열
  update(dt, player, enemies) {
    if (this.dead) { this.deathT += dt; return []; }
    if (this.iframe > 0) this.iframe -= dt;
    if (this.phaseFlash > 0) this.phaseFlash -= dt;

    this.t += dt;

    // 페이즈 전환 체크
    const ph = this.curPhase;
    const newPhaseIdx = this.phases.indexOf(ph);
    if (newPhaseIdx > this.phase) {
      this.phase      = newPhaseIdx;
      this.phaseFlash = 0.5;
      this.spd        = this.baseSpd + newPhaseIdx * 15;
    }

    // 플레이어 충돌
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    if (distToPlayer < this.size + 14 && this.iframe <= 0) {
      player.takeDamage(this.dmg, this); // [UPDATE 2026-07-06] 명부강화 반사용 공격자 전달
    }

    return this._runStateMachine(dt, player, enemies, ph);
  }

  _runStateMachine(dt, player, enemies, ph) {
    const projs = [];
    this.stateTimer -= dt;

    switch (this.state) {

      case 'idle':
        // 플레이어 방향으로 천천히 이동
        this._moveToward(dt, player.x, player.y, this.spd * 0.6);
        if (this.stateTimer <= 0) {
          this.curPattern = ph.patterns[this.patternIdx % ph.patterns.length];
          this.patternIdx++;
          this.state = 'telegraphing';
          this.stateTimer = 0.9;
          this._setupTelegraph(player);
        }
        break;

      case 'telegraphing':
        this.showWarning = true;
        this.warningT    = 1 - this.stateTimer / 0.9;
        if (this.stateTimer <= 0) {
          this.showWarning = false;
          this.state = 'attacking';
          this.stateTimer = this._getAttackDuration();
        }
        break;

      case 'attacking':
        projs.push(...this._executePattern(dt, player, enemies));
        if (this.stateTimer <= 0) {
          this.state = 'recovering';
          this.stateTimer = 0.5;
        }
        break;

      case 'recovering':
        // 잠깐 멈춤
        if (this.stateTimer <= 0) {
          this.state = 'idle';
          this.stateTimer = ph.interval;
        }
        break;
    }

    return projs;
  }

  _moveToward(dt, tx, ty, spd) {
    const dx = tx - this.x, dy = ty - this.y;
    const d  = Math.hypot(dx, dy) || 1;
    if (d > this.size + 20) {
      this.x += (dx/d) * spd * dt;
      this.y += (dy/d) * spd * dt;
    }
  }

  _setupTelegraph(player) {
    const dx = player.x - this.x, dy = player.y - this.y;
    this.telegraphAngle  = Math.atan2(dy, dx);
    this.telegraphRadius = 0;

    if (this.curPattern === 'rush' || this.curPattern === 'sweep') {
      const spd = (this.curPattern === 'rush') ? 340 : 220;
      this.chargeVx = Math.cos(this.telegraphAngle) * spd;
      this.chargeVy = Math.sin(this.telegraphAngle) * spd;
    }
    if (this.curPattern === 'summon') {
      this.summonSpots = [];
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        this.summonSpots.push({
          x: this.x + Math.cos(a) * 120,
          y: this.y + Math.sin(a) * 120,
        });
      }
    }
    if (this.curPattern === 'spiral') {
      this.spiralAngle = 0;
    }
  }

  _getAttackDuration() {
    return {
      rush:      0.55,
      sweep:     0.70,
      shockwave: 0.40,
      spiral:    1.20,
      summon:    0.30,
    }[this.curPattern] || 0.5;
  }

  _executePattern(dt, player, enemies) {
    const projs = [];
    switch (this.curPattern) {

      case 'rush':
        // 빠른 돌진
        this.x += this.chargeVx * dt;
        this.y += this.chargeVy * dt;
        break;

      case 'sweep':
        // 느린 돌진 + 폭넓은 피해범위
        this.x += this.chargeVx * dt;
        this.y += this.chargeVy * dt;
        // 주변 적 밀쳐내기
        for (const e of enemies) {
          const d = Math.hypot(e.x-this.x, e.y-this.y);
          if (!e.dead && d < this.size + 60) {
            const ang = Math.atan2(e.y-this.y, e.x-this.x);
            e.x += Math.cos(ang) * 80 * dt;
            e.y += Math.sin(ang) * 80 * dt;
          }
        }
        break;

      case 'shockwave': {
        // 충격파 발사체 (AOE)
        const p = new Projectile(this.x, this.y, 0, 0, this.dmg * 1.5, {
          aoe: 160, radius: 160, life: 0.35,
          type: 'bell', color: this.color, glow: this.glowColor,
        });
        projs.push(p);
        break;
      }

      case 'spiral': {
        // 나선형 발사체
        this.spiralAngle += dt * 5;
        const N = this.bossType === 'chapter_boss' ? 8 : 6;
        for (let i = 0; i < N; i++) {
          const a = this.spiralAngle + (i / N) * Math.PI * 2;
          projs.push(new Projectile(
            this.x, this.y,
            Math.cos(a)*200, Math.sin(a)*200,
            this.dmg * 0.7,
            { type:'talisman', color:this.color, glow:this.glowColor, radius:8, life:2.0 }
          ));
        }
        // 한 번만 발사하도록 상태 변경
        this.curPattern = '_spiral_done';
        break;
      }

      case 'summon':
        // 소환 위치에서 적 생성 (game.js에서 처리)
        this._summonPending = true;
        break;
    }
    return projs;
  }

  takeDamage(dmg) {
    if (this.dead || this.iframe > 0) return;
    this.hp -= dmg;
    this.iframe = 0.08;
    if (this.hp <= 0) { this.hp = 0; this.dead = true; }
  }

  hitTest(px, py, pr) {
    return Math.hypot(this.x-px, this.y-py) < this.size + pr;
  }

  // ── 렌더 ──
  draw(ctx, camX, camY) {
    const sx = this.x - camX;
    const sy = this.y - camY;
    const s  = this.size;

    // 사망 연출
    if (this.dead) {
      const alpha = Math.max(0, 1 - this.deathT * 1.5);
      const scale = 1 + this.deathT * 3;
      ctx.save();
      ctx.globalAlpha = alpha;
      const g = ctx.createRadialGradient(sx,sy,0,sx,sy,s*scale*2);
      g.addColorStop(0,'#ffffff'); g.addColorStop(0.3,this.color); g.addColorStop(1,'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(sx,sy,Math.max(0.01,s*scale*2),0,Math.PI*2); ctx.fill();
      ctx.restore();
      return;
    }

    // 페이즈 전환 플래시
    if (this.phaseFlash > 0) {
      ctx.save(); ctx.globalAlpha = this.phaseFlash * 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(sx,sy,s*3,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // 발광 오라
    const pulse = 1 + Math.sin(this.t * 3) * 0.12;
    const grd = ctx.createRadialGradient(sx,sy,0,sx,sy,s*2.5*pulse);
    grd.addColorStop(0, this.glowColor);
    grd.addColorStop(0.5, this.glowColor.replace('0.55','0.15'));
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(sx,sy,Math.max(0.01,s*2.5*pulse),0,Math.PI*2); ctx.fill();

    // 피격 깜빡임
    if (this.iframe > 0 && Math.floor(this.iframe*16)%2===0) return;

    // 보스 본체 드로잉
    if (this.bossType === 'mid_boss') {
      this._drawMidBoss(ctx, sx, sy, s);
    } else {
      this._drawChapterBoss(ctx, sx, sy, s);
    }

    // 텔레그래프 (공격 예고)
    if (this.showWarning) this._drawTelegraph(ctx, sx, sy, s);
  }

  _drawMidBoss(ctx, sx, sy, s) {
    if (this.img && this.img.complete && this.img.naturalWidth > 0 && this.sprCfg) {
      const sc=this.sprCfg; const bob=Math.sin(this.t*1.8)*4;
      ctx.save(); ctx.translate(sx,sy+bob);
      ctx.drawImage(this.img, sc.offsetX, sc.offsetY, sc.drawW, sc.drawH);
      ctx.restore(); return;
    }
    const t = this.t;
    const bob = Math.sin(t*1.8)*4;
    ctx.save(); ctx.translate(sx, sy+bob);

    // 몸통
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, -s*0.2, s, 0, Math.PI);
    ctx.lineTo(-s, s*0.5);
    for (let i=0; i<4; i++) {
      const bx = -s + i*(s*2/3);
      ctx.quadraticCurveTo(bx+s/4, s*0.9+Math.sin(t*3+i)*5, bx+s*0.5, s*0.5);
    }
    ctx.lineTo(s, s*0.5);
    ctx.closePath(); ctx.fill();

    // 눈 (붉게 빛나는)
    const eyeGlow = ctx.createRadialGradient(-s*.3,-s*.1,0,-s*.3,-s*.1,s*.25);
    eyeGlow.addColorStop(0,'#ff2020'); eyeGlow.addColorStop(1,'transparent');
    ctx.fillStyle=eyeGlow; ctx.beginPath(); ctx.arc(-s*.3,-s*.1,s*.25,0,Math.PI*2); ctx.fill();
    eyeGlow.addColorStop(0,'#ff2020');
    const eg2 = ctx.createRadialGradient(s*.3,-s*.1,0,s*.3,-s*.1,s*.25);
    eg2.addColorStop(0,'#ff2020'); eg2.addColorStop(1,'transparent');
    ctx.fillStyle=eg2; ctx.beginPath(); ctx.arc(s*.3,-s*.1,s*.25,0,Math.PI*2); ctx.fill();

    // 이름 글자
    ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font=`bold ${Math.floor(s*0.35)}px sans-serif`;
    ctx.textAlign='center'; ctx.fillText(this.name, 0, s*1.5);
    ctx.restore();
  }

  _drawChapterBoss(ctx, sx, sy, s) {
    if (this.img && this.img.complete && this.img.naturalWidth > 0 && this.sprCfg) {
      const sc=this.sprCfg;
      ctx.save(); ctx.translate(sx,sy);
      ctx.drawImage(this.img, sc.offsetX, sc.offsetY, sc.drawW, sc.drawH);
      ctx.restore(); return;
    }
    const t = this.t;
    ctx.save(); ctx.translate(sx, sy);

    // 갑옷 몸통
    ctx.fillStyle='#3a1808';
    ctx.beginPath(); ctx.ellipse(0,0,s*0.85,s,0,0,Math.PI*2); ctx.fill();

    // 어깨 갑옷
    ctx.fillStyle='#602010';
    ctx.beginPath(); ctx.ellipse(-s*.8,-s*.2,s*.35,s*.25,-.3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( s*.8,-s*.2,s*.35,s*.25, .3,0,Math.PI*2); ctx.fill();

    // 목 잘린 부분 (빛나는)
    const neckGrd = ctx.createRadialGradient(0,-s*.75,0,0,-s*.75,s*.35);
    neckGrd.addColorStop(0,'#ff6020'); neckGrd.addColorStop(0.6,'#c02000'); neckGrd.addColorStop(1,'transparent');
    ctx.fillStyle=neckGrd; ctx.beginPath(); ctx.arc(0,-s*.75,s*.35,0,Math.PI*2); ctx.fill();

    // 불꽃 파티클 (목에서)
    for (let i=0; i<5; i++) {
      const a = i/5*Math.PI*2 + t*2;
      const r = s*.2+Math.sin(t*3+i)*.1*s;
      ctx.save(); ctx.globalAlpha=0.6-i*.08;
      ctx.fillStyle='#ff8030';
      ctx.beginPath(); ctx.arc(Math.cos(a)*r, -s*.75+Math.sin(t*4+i)*s*.08, 4+i*1.5,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // 검 (오른손)
    ctx.save(); ctx.translate(s*.55, s*.1); ctx.rotate(-.4+Math.sin(t*1.5)*.15);
    ctx.fillStyle='#8090a0'; ctx.fillRect(-4,-s*.9,8,s*.9);
    ctx.fillStyle='#f0d060'; ctx.fillRect(-10,-s*.05,20,8);
    ctx.restore();

    // 이름
    ctx.fillStyle='rgba(255,200,100,0.95)'; ctx.font=`bold ${Math.floor(s*0.3)}px sans-serif`;
    ctx.textAlign='center'; ctx.fillText(this.name, 0, s*1.4);
    ctx.restore();
  }

  _drawTelegraph(ctx, sx, sy, s) {
    const p = this.warningT;
    ctx.save(); ctx.globalAlpha = 0.6 + Math.sin(p * Math.PI * 6) * 0.3;

    if (this.curPattern === 'rush' || this.curPattern === 'sweep') {
      // 돌진 방향 화살표
      const len = 200;
      const ax = sx + Math.cos(this.telegraphAngle) * len;
      const ay = sy + Math.sin(this.telegraphAngle) * len;
      ctx.strokeStyle = '#ff4020'; ctx.lineWidth = 8 * p;
      ctx.lineCap = 'round';
      ctx.setLineDash([20,10]);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ax, ay); ctx.stroke();
      ctx.setLineDash([]);
      // 화살촉
      ctx.fillStyle='#ff4020';
      ctx.save(); ctx.translate(ax,ay); ctx.rotate(this.telegraphAngle);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-20,-12); ctx.lineTo(-20,12); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    else if (this.curPattern === 'shockwave') {
      // 범위 원
      const r = 160 * p;
      ctx.strokeStyle='#ff8020'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.stroke();
    }
    else if (this.curPattern === 'spiral') {
      // 보스 주변 회전
      ctx.strokeStyle=this.color; ctx.lineWidth=2;
      for (let i=0; i<6; i++) {
        const a = (i/6)*Math.PI*2 + p*Math.PI*4;
        const r = s + 20*p;
        ctx.beginPath(); ctx.arc(sx+Math.cos(a)*r, sy+Math.sin(a)*r, 6,0,Math.PI*2);
        ctx.fillStyle=this.color; ctx.fill();
      }
    }
    else if (this.curPattern === 'summon') {
      // 소환 위치 표시
      for (const sp of this.summonSpots) {
        const x=sp.x-ctx._camX||sx+(sp.x-this.x), y=sp.y-ctx._camY||sy+(sp.y-this.y);
        // 근사값 사용
        const spx=sx+(sp.x-this.x), spy=sy+(sp.y-this.y);
        ctx.strokeStyle='#e0a020'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(spx,spy,20*p,0,Math.PI*2); ctx.stroke();
      }
    }
    ctx.restore();
  }
}

