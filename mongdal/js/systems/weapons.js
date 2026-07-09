// weapons.js - 무기 시스템 + 진화 무기

// ── 발사체 클래스 ──
class Projectile {
  constructor(x, y, vx, vy, dmg, cfg) {
    this.x=x; this.y=y; this.vx=vx; this.vy=vy;
    this.damage  = dmg;
    this.dead    = false;
    this.pierce  = cfg.pierce  || 0;
    this.pierced = 0;
    this.radius  = cfg.radius  || 6;
    this.color   = cfg.color   || '#f0c040';
    this.glow    = cfg.glow    || 'rgba(240,192,64,.5)';
    this.life    = cfg.life    || 2.5;
    this.maxLife = this.life;
    this.type    = cfg.type    || 'talisman';
    this.t       = 0;
    this.aoe     = cfg.aoe     || 0;
    this.baseAng    = cfg.baseAng;       // 고정 공격 방향 (없으면 진행방향 사용)
    this.pierceAll  = cfg.pierceAll||false; // 범위 내 모든 적 관통 타격
    this.drawScaleX = cfg.drawScaleX||1; // 도트 이미지 가로 배율
    this.drawScaleY = cfg.drawScaleY||1; // 도트 이미지 세로 배율
    // 이미지 소스 키: 동료 전용 type(companion_*)이 주인공 무기 이미지를 재사용할 때 사용.
    // srcType이 없으면 type 그대로 사용 (기존 동작과 100% 동일)
    this._srcType = cfg.srcType || this.type;
    // 인게임 이펙트 이미지: EFFECT_IMGS만 참조 (카드 이미지와 완전 분리됨)
    const _imgSrc=(typeof EFFECT_IMGS!=='undefined'&&EFFECT_IMGS[this._srcType])||null;
    this._weaponImg=_imgSrc?SpriteLoader.get(_imgSrc):null;
    // 번개 연쇄
    this.chain      = cfg.chain || 0;  // 남은 연쇄 횟수
    this.chainRange = cfg.chainRange || 120;
    this.chainHit   = cfg.chainHit   || new Set();
    // 압축 베기(근접 캐릭터의 "짧게 날아가 멈춘 후 흔들리는" 슬래시 연출)
    this._meleeSwing   = cfg.meleeSwing || false;
    this._swingDist    = cfg.swingDist  || 55;   // 멈추기까지 이동 거리
    this._swingTraveled= 0;                       // 누적 이동 거리
    this._swingStopped = false;                   // 도착해서 멈췄는지
    this._swingAng     = 0;                       // 멈춘 시점의 진행방향(흔들림 기준각)
    // 투척형 신검: 적 방향으로 날아가다 range에서 멈추고 페이드 아웃
    this._throwSword     = cfg.throwSword || false;
    this._throwRange     = cfg.throwRange || 60;   // 멈추는 거리
    this._throwTraveled  = 0;                       // 누적 이동 거리
    this._throwStopped   = false;                   // range 도달 후 정지 여부
    this._throwHideTime  = cfg.throwHideTime != null ? cfg.throwHideTime : 0.2; // 보이기 시작까지 지연
    this._throwHitWidth  = cfg.throwHitWidth || (cfg.radius||6); // 경로상 피격 반경
    this._throwFadeDur   = cfg.throwFadeDur || 0.15; // 정지 후 페이드아웃 시간
    this._maxAlpha       = cfg._maxAlpha != null ? cfg._maxAlpha : 1.0; // 최대 불투명도 (잔상 등)
    this._homing         = cfg._homing || false; // 호밍: 가장 가까운 적 방향으로 유도
    this._homingWeak     = cfg._homingWeak || false; // [UPDATE 2026-07-08] 약한 유도(신궁 초월 8성) — 회전 속도 대폭 하향
    // 바운스(저승낫 등): 맞으면 근처 적으로 튕김
    this._bounce         = cfg._bounce      || false;
    this._initLife       = cfg._initLife    || this.life;
    this.slow            = cfg.slow         || 0;
    this.slowDur         = cfg.slowDur      || 0;
    this.dotDmg          = cfg.dotDmg       || 0;
    this.dotTick         = cfg.dotTick      || 0.5;
    this.dotDur          = cfg.dotDur       || 0;
    this._poisonTrail    = cfg._poisonTrail || false;
    this.debuffMult      = cfg.debuffMult   || 0;
    this.debuffDur       = cfg.debuffDur    || 0;
    this.charmDur        = cfg.charmDur     || 0;
    // 각성 효과 플래그
    this._splitOnHit     = cfg._splitOnHit     || false; // 각성 신궁: 명중 시 분열
    this._explodeOnOrbHit= cfg._explodeOnOrbHit|| false; // 각성 무당지팡이: orb 착탄 폭발
    this._isSplit        = cfg._isSplit        || false; // 분열 화살 (재분열 방지)
    // 동료 레이저/장판 이펙트 플래그
    this.laser      = cfg.laser      || false;
    this.laserAngle = cfg.laserAngle || 0;
    this.laserLen   = cfg.laserLen   || 0;
    this.field      = cfg.field      || false;
  }

  update(dt) {
    if(this._boomerang&&!this._returned){
      this._boomerangTime-=dt;
      if(this._boomerangTime<=0){this.vx=-this.vx;this.vy=-this.vy;this._returned=true;}
    }
    // 토네이도: travelTime 후 정지
    if(this._tornado){
      this._elapsed+=dt;
      if(this._elapsed>=this._travelTime){
        this.vx=0; this.vy=0;
      }
    }
    // 압축 베기: 일정 거리만 이동 후 정지, 정지 시점 각도로 흔들림 연출
    if(this._meleeSwing && !this._swingStopped){
      const step=Math.hypot(this.vx,this.vy)*dt;
      this._swingTraveled+=step;
      if(this._swingTraveled>=this._swingDist){
        this._swingAng=Math.atan2(this.vy,this.vx);
        this.vx=0; this.vy=0;
        this._swingStopped=true;
      }
    }
    // 투척형 신검: range 거리까지 날아가다 도달하면 정지(이후 life 동안 페이드아웃)
    if(this._throwSword && !this._throwStopped){
      const step=Math.hypot(this.vx,this.vy)*dt;
      this._throwTraveled+=step;
      if(this._throwTraveled>=this._throwRange){
        this.vx=0; this.vy=0;
        this._throwStopped=true;
      }
    }
    this.x+=this.vx*dt; this.y+=this.vy*dt;
    this.t+=dt; this.life-=dt;
    if(this.life<=0) this.dead=true;
  }

  hitEnemy(enemy) {
    if(enemy.dead) return false;
    const d=Math.hypot(enemy.x-this.x,enemy.y-this.y);
    if(d>this.radius+enemy.size) return false;
    let dmg=this.damage*(enemy._markedDmgMult||1);
    // 치명타 판정
    const p=window._player;
    let isCrit=false;
    if(p&&p._critChance>0&&Math.random()*100<p._critChance){
      dmg*=p._critMult;
      isCrit=true;
    }
    const actualDmg=Math.floor(dmg);
    enemy.takeDamage(actualDmg);
    if(isCrit&&typeof showFloatingText==='function'){
      showFloatingText(enemy.x,enemy.y,'💥'+actualDmg,'#ffdd00');
    }
    if(p&&p._vampire>0&&!p._healBlocked){
      const heal=Math.max(1,Math.floor(actualDmg*p._vampire));
      p.hp=Math.min(p.hp+heal,p.maxHp);
    }
    this.pierced++;
    if(this.pierced>this.pierce) this.dead=true;
    return true;
  }

  draw(ctx,camX,camY) {
    const sx=this.x-camX, sy=this.y-camY;
    const r=this.radius;
    // 투척형 신검: 등장 전(hideTime)에는 발광/도트 모두 그리지 않음
    if(this._throwSword && this.t<this._throwHideTime) return;
    // 발광
    const grd=ctx.createRadialGradient(sx,sy,0,sx,sy,r*2.5);
    grd.addColorStop(0,this.glow); grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(sx,sy,r*2.5,0,Math.PI*2); ctx.fill();

    // ── 스프라이트 이펙트 매핑 ──
    const PROJ_SPRITES = {
      talisman:'proj_talisman', talisman_evo:'proj_lightning',
      bell_evo:'proj_circle',
      bead:'proj_circle',       bead_evo:'proj_beam',
      fan:'proj_fire',          fan_evo:'proj_beam',
      drum:'proj_circle',       lightning:'proj_lightning',
      thunder_drum:'proj_lightning', lightning_fall:'proj_lightning', goblin_axe:'proj_axe',
      bow:'proj_beam',    sword:'proj_ghost',
      water_jet:'proj_beam',    goblin_fire:'proj_fire',
      poison_mist:'proj_ghost', holy_water:'proj_circle',
      ghost_hand:'proj_ghost',
      scythe_sub:'proj_talisman', ice_amulet:'proj_ice',
      poison_needle:'proj_talisman', curse_doll:'proj_ghost',
      sealing_amulet:'proj_talisman', heal_incense:'proj_circle',
      spirit_shield:'proj_circle', hopaetag:'proj_talisman',
      karma_bead:'proj_circle',
    };
    const sprKey = PROJ_SPRITES[this._srcType];
    const sc = sprKey ? SPRITES?.effects?.[sprKey] : null;
    const simg = sc ? SpriteLoader.get(sc.src) : null;

    // 장판형 타입은 _weaponImg(레벨업카드 이미지)만 무시, PROJ_SPRITES(simg)는 정상 사용
    // EFFECT_IMGS는 장판형 무기 키를 포함하지 않으므로 _weaponImg는 자동으로 null
    // (더 이상 수동 skip 리스트가 필요 없음 - 구조적으로 분리됨)
    // ── 동료 레이저형 이펙트 ──
    if(this.laser&&this._weaponImg?.complete&&this._weaponImg.naturalWidth>0){
      ctx.save();
      ctx.translate(sx,sy-20);
      ctx.rotate(this.laserAngle);
      ctx.globalAlpha=Math.min(1,this.life*10)*0.9;
      const _lw=this.laserLen;
      const _lh=Math.round(this._weaponImg.naturalHeight/this._weaponImg.naturalWidth*_lw*0.55);
      ctx.drawImage(this._weaponImg,0,-_lh/2,_lw,_lh);
      ctx.restore();
      return;
    }
    // ── 동료 장판형 이펙트 ──
    if(this.field&&this._weaponImg?.complete&&this._weaponImg.naturalWidth>0){
      ctx.save();
      ctx.translate(sx,sy);
      const _prog=1-Math.max(0,this.life/this.maxLife);
      const _fs=0.85+_prog*0.3;
      ctx.globalAlpha=Math.min(1,this.life*3)*0.88;
      const _fw=this.aoe*2.2*_fs;
      const _fh=_fw*(this._weaponImg.naturalHeight/this._weaponImg.naturalWidth);
      ctx.drawImage(this._weaponImg,-_fw/2,-_fh/2,_fw,_fh);
      ctx.restore();
      return;
    }
    if(this._weaponImg?.complete&&this._weaponImg.naturalWidth>0){
      ctx.save();ctx.translate(sx,sy);
      // 이미지 원본 방향 보정: bow(화살)는 세로로 그려진 원본이라 +90도
      // scythe_sub: 새 이미지(저승낫 이미지.png)는 이미 오른쪽 기준 → 보정 없음
      // 이미지 원본 방향 보정: bow는 세로(위쪽)로 그려진 원본 → +90도
      // staff 날아가는 오브도 이미지가 위쪽 기준이므로 +90도 보정
      const _imgRotOffset = (this._srcType==='bow'||this._srcType==='staff') ? Math.PI/2
                          : (this.type==='scythe') ? Math.PI : 0;
      // 장판형 이펙트(도깨비불/독안개/동료폭탄/성수) 전용 스케일·밝기·페이드 계산
      const _isFire = this.type==='goblin_fire';
      const _isMist = this.type==='poison_mist';
      const _isCompanionBomb = this.type==='companion_bomb';
      const _isHolyWater = this.type==='holy_water';
      let _fieldScaleX=1, _fieldScaleY=1, _fieldBrightness=1, _fieldAlpha=null;
      if(_isCompanionBomb){
        // 동료(꺽쇠) 폭탄: 빠르게 확 커졌다가 사그라드는 폭발 모션
        const _explodeProg = 1 - Math.max(0, this.life/this.maxLife);
        _fieldScaleX = _fieldScaleY = 1.5 + _explodeProg*1.0; // 1.5배 → 2.5배
        _fieldBrightness = 1.0 - _explodeProg*0.5;
        _fieldAlpha = Math.max(0, 1 - _explodeProg*1.2) * 0.85; // 골드/영혼석 가림 완화를 위해 살짝 낮춤
      } else if(_isFire){
        // 도깨비불: 처음부터 가로4배 세로4배 크게 시작, 시간이 지날수록 점점 어두워짐 (잔류 1초간 불씨로 남아 지속 데미지)
        _fieldScaleX = _fieldScaleY = 4.0;
        const _ageProg = Math.min(1, (this.maxLife-this.life)/Math.max(0.4,this.maxLife-1.0));
        _fieldBrightness = 1.0 - _ageProg*0.6; // 1.0(밝음) → 0.4(어두움)
        _fieldAlpha = (this.life<1.0 ? Math.max(0,this.life) : 1) * 0.8; // 골드/영혼석 가림 완화를 위해 살짝 낮춤
      } else if(_isMist){
        // 독안개: 가로6배 세로4배까지 점점 커지며 서서히 투명해지다가, 잔류 1초간 안개로 남아 지속 데미지
        const _growProg = Math.min(1, (this.maxLife-this.life)/Math.max(0.4,this.maxLife-1.0));
        _fieldScaleX = 1 + _growProg*5.0; // 1배 → 6배 (가로)
        _fieldScaleY = 1 + _growProg*3.0; // 1배 → 4배 (세로)
        _fieldAlpha = (this.life<1.0 ? Math.max(0,this.life) : (1 - _growProg*0.5)) * 0.8; // 골드/영혼석 가림 완화를 위해 살짝 낮춤
      } else if(_isHolyWater){
        // 성수 웅덩이: 가로4배 세로2.5배 고정(옆으로 긴 웅덩이), 50% 알파로 시작해서 점점 페이드아웃
        _fieldScaleX = 4.0; _fieldScaleY = 2.5;
        _fieldAlpha = 0.5 * Math.min(1, Math.max(0, this.life/this.maxLife));
      } else if(this.type==='water_jet'){
        // 토네이도: 날아가며 1배 → 2.5배로 성장, 끝에 서서히 페이드아웃
        const _growProg = Math.min(1, 1 - this.life/this.maxLife);
        _fieldScaleX = _fieldScaleY = 1 + _growProg * 1.5; // 1배 → 2.5배
        _fieldAlpha = Math.min(1, this.life * 2) * 0.9;
      }
      if(_fieldScaleX!==1||_fieldScaleY!==1) ctx.scale(_fieldScaleX,_fieldScaleY);
      // 신검 등 baseAng 지정 무기는 baseAng 방향, 압축 베기는 정지 각도+흔들림, 나머지는 진행방향 회전
      if(this._meleeSwing && this._swingStopped){
        const _wig=Math.sin(this.t*40)*0.25; // 좌우로 살짝 흔들리는 베기 모션
        ctx.rotate(this._swingAng+_wig+_imgRotOffset);
      }
      else if(typeof this.baseAng==='number') ctx.rotate(this.baseAng+_imgRotOffset);
      else if(!_isFire&&!_isMist&&!_isCompanionBomb&&!_isHolyWater&&(this.vx||this.vy)&&this.type!=='water_jet'&&this.type!=='thunder_drum'&&this.type!=='lightning_fall')ctx.rotate(Math.atan2(this.vy,this.vx)+_imgRotOffset);
      // 자체 스핀 (발사된 지팡이 오브 등): _selfSpin 속도로 빙글빙글
      if(this._selfSpin) ctx.rotate(this.t * this._selfSpin);
      // 투척형 신검: 처음 throwHideTime 동안 투명 → 등장 → range 도달 후 짧게 페이드아웃
      if(this._throwSword){
        const elapsed=this.t;
        if(elapsed<this._throwHideTime){
          ctx.globalAlpha=0;
        } else if(this._throwStopped){
          ctx.globalAlpha=Math.max(0,Math.min(1,this.life/this._throwFadeDur))*this._maxAlpha;
        } else {
          ctx.globalAlpha=this._maxAlpha;
        }
      } else if(_fieldAlpha!==null){
        ctx.globalAlpha=_fieldAlpha;
      } else {
        ctx.globalAlpha=Math.min(1,this.life*3);
      }
      if(_isFire||_isCompanionBomb){
        ctx.filter = `brightness(${_fieldBrightness})`;
      }
      // 무기별 크기 배율 (기본 32x32, sword는 가로2배 세로3배)
      const _baseW=32, _baseH=32;
      const _iw=_baseW*(this.drawScaleX||1);
      const _ih=_baseH*(this.drawScaleY||1);
      ctx.drawImage(this._weaponImg,-_iw/2,-_ih/2,_iw,_ih);
      ctx.filter = 'none';
      ctx.restore();
    } else if(simg?.complete&&simg.naturalWidth>0&&sc){
      // 장판형 타입별 개별 이펙트 (goblin_fire/poison_mist/companion_bomb는 EFFECT_IMGS 우선순위로 위쪽 _weaponImg 분기에서 처리됨)
      const _isHoly = this.type==='holy_water';
      const _isHand = this.type==='ghost_hand';
      const _isCurse = this.type==='curse_doll';
      const _isFieldType = _isHoly||_isHand||_isCurse;
      let _jx=0, _jy=0, _fadeAlpha=Math.min(1,this.life*3);
      let _scaleX=1, _scaleY=1;

      if(_isFieldType){
        const _inResidual = this.life < 1.0;

        if(_isHoly){
          // 성수: 가로3배 세로1.5배 고정, 미세 떨림
          _scaleX = 3.0; _scaleY = 1.5;
          _jx = Math.sin(this.t*14 + this.x*0.7)*1.6;
          _jy = Math.cos(this.t*11 + this.y*0.9)*1.6;
          _fadeAlpha = _inResidual ? Math.max(0,this.life) : 1;
        } else if(_isCurse){
          // 저주인형: 소환(팝업) → 점멸 → 사라짐(장판 느낌)
          const _summonT = this.maxLife - this.life;
          if(_summonT < 0.15){
            // 소환 팝업: 작게 시작해서 튀어오르듯 커짐
            const _p = _summonT/0.15;
            _scaleX = _scaleY = 0.3 + _p*0.9;
            _fadeAlpha = _p;
          } else if(_inResidual){
            // 점멸하며 사라짐
            _fadeAlpha = Math.max(0,this.life) * (0.5+Math.abs(Math.sin(this.t*10))*0.5);
          } else {
            // 점멸 유지 (천천히)
            _fadeAlpha = 0.75 + Math.sin(this.t*5)*0.25;
          }
        } else {
          // 귀신손: 기존 미세 떨림 유지
          _jx = Math.sin(this.t*14 + this.x*0.7)*1.6;
          _jy = Math.cos(this.t*11 + this.y*0.9)*1.6;
          _fadeAlpha = _inResidual ? Math.max(0,this.life) : 1;
        }
        if(!_isCurse && this.maxLife - this.life < 0.2) _fadeAlpha = Math.min(_fadeAlpha, (this.maxLife-this.life)/0.2);
      }

      ctx.save();ctx.translate(sx+_jx,sy+_jy);
      if(_scaleX!==1||_scaleY!==1) ctx.scale(_scaleX,_scaleY);
      if(!_isFieldType && (this.vx||this.vy))ctx.rotate(Math.atan2(this.vy,this.vx));
      ctx.globalAlpha=_fadeAlpha;
      ctx.drawImage(simg,-sc.drawW/2,-sc.drawH/2,sc.drawW,sc.drawH);
      ctx.restore();
    } else if(this.type==='talisman'||this.type==='talisman_evo'){
      ctx.save(); ctx.translate(sx,sy);
      ctx.rotate(Math.atan2(this.vy,this.vx)+Math.PI/2);
      ctx.fillStyle=this.type==='talisman_evo'?'#2040e0':'#c02020';
      ctx.fillRect(-r*.6,-r,r*1.2,r*2);
      ctx.strokeStyle=this.type==='talisman_evo'?'#80c0ff':'#f0c040';
      ctx.lineWidth=1.5; ctx.strokeRect(-r*.6,-r,r*1.2,r*2);
      ctx.restore();
    } else if(this.type==='lightning') {
      // 번개 - 지그재그 선
      ctx.save(); ctx.strokeStyle=this.color; ctx.lineWidth=3;
      ctx.shadowColor=this.color; ctx.shadowBlur=8;
      ctx.beginPath();
      const len=r*3;
      const ang=Math.atan2(this.vy,this.vx);
      ctx.moveTo(sx,sy);
      for(let i=1;i<=4;i++){
        const zx=sx+Math.cos(ang)*len*(i/4)+(i%2?r:-r)*0.5;
        const zy=sy+Math.sin(ang)*len*(i/4)+(i%2?-r:r)*0.5;
        ctx.lineTo(zx,zy);
      }
      ctx.stroke(); ctx.restore();
    } else if(this.type==='bell'||this.type==='bell_evo') {
      // 무당방울: 확장하는 충격파 링 이펙트 (도트 없음)
      const _bellProg = 1 - Math.max(0, this.life/this.maxLife);
      const _bellR = r * (1 + _bellProg*2.5);
      const _bellAlpha = Math.max(0, 1-_bellProg);
      ctx.save();
      ctx.globalAlpha = _bellAlpha;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3 * (1-_bellProg*0.6);
      ctx.shadowColor = this.glow || this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(sx,sy,_bellR,0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha = _bellAlpha*0.4;
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    } else if(this.type==='bead'||this.type==='bead_evo') {
      ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2);
      ctx.fillStyle=this.color; ctx.fill();
    } else if(this.type==='lightning_trap'){
      // 바닥 전기 장판 이미지 - 1.5배 크기 + 번쩍번쩍 밝기 + 1초 잔류 페이드아웃
      const elecSc = SPRITES?.effects?.elec_effect;
      const elecImg = elecSc ? SpriteLoader.get(elecSc.src) : null;
      const _ew = (elecSc?.drawW||80)*1.5, _eh = (elecSc?.drawH||54)*1.5;
      // 번쩍임: 빠른 펄스로 밝기 on/off
      const _flicker = 0.5 + Math.abs(Math.sin(this.t*9))*0.5; // 0.5~1.0 사이 빠르게 깜빡
      let _alpha = this.life > 1 ? 1 : Math.max(0, this.life);
      if(this.maxLife - this.life < 0.15) _alpha = Math.min(_alpha, (this.maxLife-this.life)/0.15);
      ctx.save();
      ctx.globalAlpha = _alpha;
      if(elecImg?.complete && elecImg.naturalWidth>0 && elecSc){
        ctx.filter = `brightness(${1+_flicker*0.8})`;
        ctx.drawImage(elecImg, sx-_ew/2, sy-_eh/2, _ew, _eh);
        ctx.filter = 'none';
      } else {
        ctx.beginPath(); ctx.arc(sx,sy,r*1.5,0,Math.PI*2);
        ctx.fillStyle='#4080ff'; ctx.fill();
      }
      ctx.restore()
    } else {
      ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2);
      ctx.fillStyle=this.color; ctx.fill();
    }
  }
}

// ── 헬퍼: 가장 가까운 적 ──
function findNearestEnemies(px,py,enemies,n) {
  return enemies.filter(e=>!e.dead)
    .sort((a,b)=>Math.hypot(a.x-px,a.y-py)-Math.hypot(b.x-px,b.y-py))
    .slice(0,n);
}

// ══════════════════════════════════════════
//  기본 무기 정의
// ══════════════════════════════════════════
// ── 무기 이미지 ──
const MAIN_WEAPON_IMGS = {};
const SUB_WEAPON_IMGS = {};

// ══════════════════════════════════════════
//  주무기 정의 (5종)
// ══════════════════════════════════════════
const MAIN_WEAPON_DEFS = {

  talisman: {
    id:'talisman', name:'부적', icon:'📜', rarity:'common',
    desc:'귀신을 봉인하는 부적을 가장 가까운 적에게 날린다.',
    specialStat:{ id:'talisman_tadak', name:'특수 강화', icon:'📜+', desc:'0.12초 후 부적 +1발', max:4 },
    maxLevel:4,
    levels:[
      {cooldown:0, mainCd:1.2, damage:12, pierce:0, speed:280, radius:7, life:2.0},
      {cooldown:0, mainCd:1.0, damage:16, pierce:0, speed:300, radius:7, life:2.0},
      {cooldown:0, mainCd:1.0, damage:18, pierce:0, speed:300, radius:7, life:2.2},
      {cooldown:0, mainCd:0.85,damage:22, pierce:1, speed:320, radius:8, life:2.5},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const awk=this._awakLv||0;
      const bonus=this._bonus||0; // 타닥 추가 발사 수
      const spdScale=(player.totalSpd||100)/100;
      const cdr=player._cdReduction||0;
      const dmg=Math.floor(lvl.damage*(player.totalAtk/100)*(this._overAwkDmg||1)*(this._transcendMult||1)); // [UPDATE 2026-07-08] 무기 초월 데미지 배율 적용
      const t8Pierce=(this._transcendRank||0)>=8?1:0; // [UPDATE 2026-07-08] 초월 8성: 전 발사체 관통 +1
      // 일반 부적 수: lv + (각성 있으면 awk+1 추가)
      const count=this.lv+(awk>0?awk+1:0);
      const _cx=player.x+8, _cy=player.y-30;

      // ── 초기화 ──
      if(!this._mainCd) this._mainCd=0;
      if(!this._tadakQueue) this._tadakQueue=[];
      if(!this._whirlActive) this._whirlActive=[];
      if(this._whirlCd===undefined){this._whirlCd=0;this._whirlIdx=0;}

      const dt=0.016;
      this._mainCd-=dt;

      const projs=[];

      // ── 타닥 큐 처리 (매 프레임) ──
      for(let i=this._tadakQueue.length-1;i>=0;i--){
        this._tadakQueue[i].delay-=dt;
        if(this._tadakQueue[i].delay<=0){
          const q=this._tadakQueue.splice(i,1)[0];
          q.targets.forEach(t=>{
            const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy)||1;
            projs.push(new Projectile(player.x,player.y-30,(dx/d)*lvl.speed,(dy/d)*lvl.speed,dmg,
              {pierce:lvl.pierce+t8Pierce,radius:lvl.radius,life:lvl.life,type:'talisman',color:'#e04040',glow:'rgba(220,60,40,.5)'}));
          });
        }
      }

      // ── 회오리 부적 업데이트 (매 프레임) ──
      if(awk>0){
        this._whirlCd-=dt;
        for(const w of this._whirlActive){
          w.t+=dt;
          w.angle+=Math.PI*2*dt*0.9; // 0.9회전/초 시계방향
          w.radius=Math.min(100,w.t*38); // 3초에 걸쳐 0→100px
        }
        this._whirlActive=this._whirlActive.filter(w=>w.t<4.0);

        // 살아있는 회오리 렌더링
        for(const w of this._whirlActive){
          const wp=new Projectile(
            _cx+Math.cos(w.angle)*w.radius,
            _cy+Math.sin(w.angle)*w.radius,
            0,0,Math.floor(dmg*0.3),
            {orb:true,pierce:99,radius:lvl.radius+1,life:0.08,
             type:'talisman',color:'#ff8040',glow:'rgba(255,100,40,.7)'});
          wp._selfSpin=Math.PI*5; // 부적 이미지 빙글빙글 회전
          projs.push(wp);
        }

        // 새 회오리 발사
        if(this._whirlCd<=0){
          this._whirlActive.push({t:0,angle:0,radius:0});
          this._whirlIdx++;
          if(this._whirlIdx>=awk){
            this._whirlIdx=0;
            this._whirlCd=(4.0-(awk-1)*0.5)*(1-cdr); // 첫 회오리가 소멸할 때 다음 사이클 시작
          } else {
            this._whirlCd=0.5;
          }
        }
      }

      // ── 메인 발사 ──
      if(this._mainCd<=0){
        this._mainCd=lvl.mainCd/spdScale;
        const targets=findNearestEnemies(player.x,player.y,enemies,count);
        if(!targets.length) targets.push({x:player.x,y:player.y-1});
        targets.forEach(e=>{
          const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy)||1;
          projs.push(new Projectile(player.x,player.y-30,(dx/d)*lvl.speed,(dy/d)*lvl.speed,dmg,
            {pierce:lvl.pierce,radius:lvl.radius,life:lvl.life,type:'talisman',color:'#e04040',glow:'rgba(220,60,40,.5)'}));
        });
        // 타닥 큐 추가 (메인 발사 시점 기준, 0.12초 간격)
        if(bonus>0){
          const snap=targets.map(e=>({x:e.x,y:e.y}));
          for(let i=0;i<bonus;i++){
            this._tadakQueue.push({delay:0.12*(i+1), targets:snap});
          }
        }
      }

      return projs;
    },
  },

  sword:{
    id:'sword', name:'신검', icon:'⚔️', rarity:'common',
    desc:'사거리 내 적을 향해 베는 강력한 신의 검.',
    specialStat:{ id:'sword_range', name:'특수 강화', icon:'✨', desc:'잔상 +1개 (3초마다)', max:4 },
    maxLevel:4,
    levels:[
      {cooldown:0,mainCd:1.00,damage:28,range:64},
      {cooldown:0,mainCd:0.67,damage:36,range:64},
      {cooldown:0,mainCd:0.50,damage:46,range:64},
      {cooldown:0,mainCd:0.33,damage:60,range:64}, // [UPDATE 2026-07-08] ⚠️ 실효 주기는 fire()의 클램프 0.5s가 지배 (테이블값 0.33은 미도달)
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const bonus=this._bonus||0;
      const awk=this._awakLv||0;
      const spdScale=player.totalSpd/100;
      const cdr=player._cdReduction||0;
      const dt=0.016;
      const projs=[];
      if(this._mainCd===undefined) this._mainCd=0;
      if(this._afterimageCd===undefined) this._afterimageCd=3.0;
      this._mainCd-=dt;
      if(bonus>0) this._afterimageCd-=dt;

      // ── 잔상 발사 (3초마다, 쿨감 적용) ──
      if(bonus>0 && this._afterimageCd<=0){
        this._afterimageCd=3.0*(1-cdr);
        const angleStep=Math.PI*2/bonus;
        const tgt=findNearestEnemies(player.x,player.y,enemies,1)[0];
        const baseAng=tgt?Math.atan2(tgt.y-player.y,tgt.x-player.x):(player.facing>=0?0:Math.PI);
        const _spd=lvl.range/0.25;
        for(let i=0;i<bonus;i++){
          const ang=baseAng+angleStep*i;
          const _ap=new Projectile(player.x,player.y-30,
            Math.cos(ang)*_spd,Math.sin(ang)*_spd,
            Math.floor(lvl.damage*(player.totalAtk/100)*0.3),
            {radius:8,life:1.25,type:'sword',
             baseAng:ang,
             throwSword:true,throwRange:lvl.range,throwHideTime:0,throwFadeDur:1.0,
             throwHitWidth:60,drawScaleX:7.92,drawScaleY:27.32,
             _maxAlpha:0.18,
             color:'#d8d8ff',glow:'rgba(180,180,255,.08)'});
          _ap._originX=player.x; _ap._originY=player.y-30;
          projs.push(_ap);
        }
      }

      // ── 메인 검 발사 (각성에 따라 다방향) ──
      if(this._mainCd<=0){
        this._mainCd=Math.max(0.5, lvl.mainCd/spdScale); // [UPDATE 2026-07-08] 최소 0.5s (초당 2회 상한) — 5각 DPS 1091→720 밸런스 조정 (낫 538과 격차 축소)
        const swordCount=awk+1;
        const tgt=findNearestEnemies(player.x,player.y,enemies,1)[0];
        const baseAng=tgt?Math.atan2(tgt.y-player.y,tgt.x-player.x):(player.facing>=0?0:Math.PI);
        const angleStep=Math.PI*2/swordCount;
        const _spd=lvl.range/0.25;
        const t8HitWidth=35*((this._transcendRank||0)>=8?1.5:1); // [UPDATE 2026-07-08] 초월 8성: 히트 판정 폭 +50%
        for(let i=0;i<swordCount;i++){
          const ang=baseAng+angleStep*i;
          const _mp=new Projectile(player.x,player.y-30,
            Math.cos(ang)*_spd,Math.sin(ang)*_spd,
            Math.floor(lvl.damage*(player.totalAtk/100)*(this._overAwkDmg||1)*(this._transcendMult||1)), // [UPDATE 2026-07-08] 신검 메인 발사도 6각+ 데미지 보너스·초월 배율 반영 (기존엔 누락)
            {radius:8,life:0.6,type:'sword',
             baseAng:ang,
             throwSword:true,throwRange:lvl.range,throwHideTime:0.2,throwFadeDur:0.15,
             throwHitWidth:t8HitWidth,drawScaleX:2.77,drawScaleY:2.28,
             color:'#c0e0ff',glow:'rgba(180,220,255,.6)'});
          _mp._originX=player.x; _mp._originY=player.y-30;
          projs.push(_mp);
        }
      }

      return projs;
    },
  },

  bow:{
    id:'bow', name:'신궁', icon:'🏹', rarity:'common',
    desc:'정면으로 화살을 쏜다. 레벨업 시 연사, 각성 시 다발 발사.',
    specialStat:{ id:'bow_split', name:'특수 강화', icon:'🎯', desc:'3초마다 유도 분열 화살', max:4 },
    maxLevel:4,
    levels:[
      {cooldown:0,mainCd:1.0,damage:20,speed:480,radius:6,life:1.6},
      {cooldown:0,mainCd:0.9,damage:26,speed:500,radius:6,life:1.6},
      {cooldown:0,mainCd:0.8,damage:34,speed:520,radius:7,life:1.8},
      {cooldown:0,mainCd:0.7,damage:44,speed:550,radius:8,life:2.0},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const bonus=this._bonus||0;
      const awk=this._awakLv||0;
      const spdScale=player.totalSpd/100;
      const cdr=player._cdReduction||0;
      const dt=0.016;
      const projs=[];
      if(this._mainCd===undefined) this._mainCd=0;
      if(this._splitCd===undefined) this._splitCd=3.0;
      if(this._burstQueue===undefined) this._burstQueue=[];
      this._mainCd-=dt;
      if(bonus>0) this._splitCd-=dt;

      // 부채꼴 화살 묶음 발사 (인라인 헬퍼)
      const fireVolley=(baseAng)=>{
        const count=awk*2+1;          // 0각=1, 1각=3, 2각=5, 3각=7, 4각=9
        const spread=awk*30*Math.PI/180; // 각성마다 좌우 15°씩 추가
        const dmg=Math.floor(lvl.damage*(player.totalAtk/100)*(this._overAwkDmg||1)*(this._transcendMult||1)); // [UPDATE 2026-07-08] 무기 초월 데미지 배율 적용
        const t8Homing=(this._transcendRank||0)>=8; // [UPDATE 2026-07-08] 초월 8성: 화살에 약한 유도 부여
        const arr=[];
        for(let i=0;i<count;i++){
          const ang=count===1?baseAng:baseAng-spread/2+spread/(count-1)*i;
          arr.push(new Projectile(player.x,player.y-30,
            Math.cos(ang)*lvl.speed,Math.sin(ang)*lvl.speed,dmg,
            {pierce:1,radius:lvl.radius,life:lvl.life,type:'bow',
             _homing:t8Homing,_homingWeak:true,
             color:'#f0e040',glow:'rgba(240,220,60,.5)'}));
        }
        return arr;
      };

      // 타닥 큐 처리 (지연 연사)
      for(let i=this._burstQueue.length-1;i>=0;i--){
        this._burstQueue[i].delay-=dt;
        if(this._burstQueue[i].delay<=0){
          const q=this._burstQueue.splice(i,1)[0];
          projs.push(...fireVolley(q.baseAng));
        }
      }

      // 특강: 3초마다 유도 분열 화살 (쿨감 적용)
      if(bonus>0 && this._splitCd<=0){
        this._splitCd=3.0*(1-cdr);
        const tgt=findNearestEnemies(player.x,player.y,enemies,1)[0];
        if(tgt){
          const dx=tgt.x-player.x,dy=tgt.y-player.y,d=Math.hypot(dx,dy)||1;
          projs.push(new Projectile(player.x,player.y-30,
            (dx/d)*lvl.speed,(dy/d)*lvl.speed,
            Math.floor(lvl.damage*(player.totalAtk/100)),
            {pierce:99,radius:lvl.radius,life:lvl.life+0.5,type:'bow',
             _splitLevel:bonus,_homing:true,_maxAlpha:0.55,
             color:'#ffffff',glow:'rgba(255,255,200,.9)'}));
        }
      }

      // 메인 발사
      if(this._mainCd<=0){
        this._mainCd=lvl.mainCd/spdScale; // [UPDATE 2026-07-08] 다른 4무기(부적/신검/낫/지팡이)와 통일 — 메인 공격엔 쿨감 미적용, 공속만 적용 (기존엔 신궁만 쿨감+공속 이중 혜택)
        const tgt=findNearestEnemies(player.x,player.y,enemies,1)[0]||{x:player.x,y:player.y-1};
        const baseAng=Math.atan2(tgt.y-player.y,tgt.x-player.x);
        projs.push(...fireVolley(baseAng));
        for(let i=0;i<this.lv-1;i++){
          this._burstQueue.push({delay:0.12*(i+1),baseAng});
        }
      }

      return projs;
    },
  },

  staff:{
    id:'staff', name:'무당 지팡이', icon:'🪄', rarity:'common',
    desc:'주변을 맴도는 오브를 소환한다. 각성 시 오브를 발사한다.',
    specialStat:{ id:'staff_orbs', name:'특수 강화', icon:'🔮', desc:'외부 궤도 오브 +1', max:4 },
    maxLevel:4,
    levels:[
      {cooldown:0,damage:14,rotSpeed:1.8,orbRadius:70,hitRadius:9},
      {cooldown:0,damage:18,rotSpeed:2.0,orbRadius:80,hitRadius:9},
      {cooldown:0,damage:24,rotSpeed:2.2,orbRadius:90,hitRadius:10},
      {cooldown:0,damage:30,rotSpeed:2.4,orbRadius:100,hitRadius:11},
    ],
    _angle:0,
    _staffShootCd:0,
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const awk=this._awakLv||0;
      const bonus=this._bonus||0;
      // 내부 궤도 오브 수 = 각성단계 + 2 + (lv-1)
      const rotCount=awk+2+(this.lv-1);
      // 외부 궤도 오브 수 = 특강 횟수 (별도 반경)
      const outerCount=bonus;
      // 발사 오브 수 = 각성단계 (고정)
      const shootCount=awk;

      // 공속(totalSpd) 반영하여 회전 속도 스케일
      const spdScale=(player.totalSpd||100)/100;
      const cdr=player._cdReduction||0;
      this._angle=(this._angle||0)+lvl.rotSpeed*0.016*spdScale;
      // 외부 오브 전용 각도: 쿨감만큼 추가 가속 (cdr=0.6이면 1.6배 빠름)
      this._outerAngle=(this._outerAngle||0)+lvl.rotSpeed*0.016*spdScale*(1+cdr);

      const _cx=player.x+8, _cy=player.y-30;
      const dmg=Math.floor(lvl.damage*(player.totalAtk/100)*(this._overAwkDmg||1)*(this._transcendMult||1)); // [UPDATE 2026-07-08] 무기 초월 데미지 배율 적용
      const projs=[];

      // 미싱 슬롯 타이머 감소: 날아간 슬롯이 0.4초 후 다시 궤도에 나타남
      if(!this._staffMissingSlots) this._staffMissingSlots={};
      for(const slot in this._staffMissingSlots){
        this._staffMissingSlots[slot]-=0.016;
        if(this._staffMissingSlots[slot]<=0) delete this._staffMissingSlots[slot];
      }

      // 내부 궤도 (기본 회전 오브) — 날아간 슬롯은 빈 자리로 표시
      for(let i=0;i<rotCount;i++){
        if(this._staffMissingSlots[i]!==undefined) continue; // 날아가서 빈 자리
        const ang=this._angle+(i/rotCount)*Math.PI*2;
        projs.push(new Projectile(
          _cx+Math.cos(ang)*lvl.orbRadius,
          _cy+Math.sin(ang)*lvl.orbRadius,0,0,dmg,
          {orb:true,radius:lvl.hitRadius,life:0.08,type:'staff',color:'#a080ff',glow:'rgba(150,100,255,.6)'}));
      }

      // [UPDATE 2026-07-08] 초월 8성: 내부 궤도 오브가 스친 자리에 잔류 데미지 장판 생성 (0.3초마다 1개)
      if((this._transcendRank||0)>=8 && rotCount>0){
        if(this._staffFieldCd===undefined) this._staffFieldCd=0;
        this._staffFieldCd-=0.016;
        if(this._staffFieldCd<=0){
          this._staffFieldCd=0.3;
          const fAng=this._angle;
          projs.push(new Projectile(
            _cx+Math.cos(fAng)*lvl.orbRadius,
            _cy+Math.sin(fAng)*lvl.orbRadius,0,0,0,
            {orb:true,pierce:99,radius:lvl.hitRadius+6,life:1.5,type:'staff',
             dotDmg:Math.floor(dmg*0.15),dotTick:0.5,dotDur:1.5,
             _maxAlpha:0.35,color:'#7040c0',glow:'rgba(120,60,200,.5)'}));
        }
      }

      // 외부 궤도 (특강 오브 — 내부보다 40px 넓은 반경, 쿨감으로 가속)
      if(outerCount>0){
        const outerRadius=lvl.orbRadius+40;
        for(let i=0;i<outerCount;i++){
          const ang=this._outerAngle+(i/outerCount)*Math.PI*2;
          projs.push(new Projectile(
            _cx+Math.cos(ang)*outerRadius,
            _cy+Math.sin(ang)*outerRadius,0,0,dmg,
            {orb:true,radius:lvl.hitRadius+2,life:0.08,type:'staff',color:'#e0c0ff',glow:'rgba(220,170,255,.9)'}));
        }
      }

      // 발사 오브: 0.5초마다 1개씩 순서대로 발사 (오브 궤도 위치에서 출발)
      if(shootCount>0){
        if(this._staffSubCd===undefined){this._staffSubCd=0;this._staffShootIdx=0;}
        this._staffSubCd-=0.016;
        if(this._staffSubCd<=0){
          // 현재 차례 슬롯 (이미 날아가고 있으면 다음 슬롯으로)
          let orbSlot=this._staffShootIdx%rotCount;
          const tgt=findNearestEnemies(player.x,player.y,enemies,1)[0]||{x:player.x,y:player.y-100};
          const orbAng=this._angle+(orbSlot/rotCount)*Math.PI*2;
          const ox=_cx+Math.cos(orbAng)*lvl.orbRadius;
          const oy=_cy+Math.sin(orbAng)*lvl.orbRadius;
          const dx=tgt.x-ox,dy=tgt.y-oy,d=Math.hypot(dx,dy)||1;
          // 발사 → 해당 슬롯 0.4초 동안 빈 자리로 표시
          this._staffMissingSlots[orbSlot]=0.4;
          // 발사체 생성 + 스핀 플래그 (_selfSpin: 빠르게 회전)
          const flyProj=new Projectile(ox,oy,(dx/d)*160,(dy/d)*160,
            Math.floor(dmg*0.3),
            {pierce:99,radius:lvl.hitRadius,life:1.8,type:'staff',
             color:'#c0a0ff',glow:'rgba(180,140,255,.7)'});
          flyProj._selfSpin=Math.PI*6; // 초당 3회전 스핀
          projs.push(flyProj);
          this._staffShootIdx++;
          // shootCount개 다 쐈으면 나머지 쿨다운으로 2초 사이클 유지
          if(this._staffShootIdx>=shootCount){
            this._staffShootIdx=0;
            this._staffSubCd=Math.max(0.5, 2.0-(shootCount-1)*0.5) / spdScale;
          } else {
            this._staffSubCd=0.5 / spdScale;
          }
        }
      }
      return projs;
    },
  },

  scythe_main:{
    id:'scythe_main', name:'영혼낫', icon:'🌙', rarity:'common',
    desc:'주변에 낫 이펙트를 뿌린다. 낫이 자체 회전하며 사라진다.',
    specialStat:{ id:'scythe_speed', name:'특수 강화', icon:'🌀', desc:'회오리 낫 (2.5초)', max:4 },
    maxLevel:4,
    levels:[
      {cooldown:0,damage:16,orbRadius:75,hitRadius:22},
      {cooldown:0,damage:22,orbRadius:85,hitRadius:25},
      {cooldown:0,damage:28,orbRadius:95,hitRadius:28},
      {cooldown:0,damage:36,orbRadius:105,hitRadius:32},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const bonus=this._bonus||0;
      const awk=this._awakLv||0;
      const spdScale=player.totalSpd/100;
      const dt=0.016;
      const projs=[];
      const _cx=player.x, _cy=player.y-30;
      if(this._scytheCd===undefined) this._scytheCd=0;
      if(this._whirlActive===undefined) this._whirlActive=[];
      if(this._whirlSpawnCd===undefined) this._whirlSpawnCd=0;

      const cdr=player._cdReduction||0;
      const count=awk*2+this.lv;              // [UPDATE 2026-07-08] 각성당 +2 (기존 +1은 주기 증가와 상쇄되어 DPS 역성장) — 0각Lv4=4, 5각=14
      const scytheLife=0.5+awk*0.15;          // 각성마다 유지력 증가
      const scaleBase=1.0+awk*0.35;           // 각성마다 크기 증가
      const dmg=Math.floor(lvl.damage*(player.totalAtk/100)*(this._overAwkDmg||1)*(this._transcendMult||1)); // [UPDATE 2026-07-08] 무기 초월 데미지 배율 적용

      this._scytheCd-=dt;

      // ── 낫 뿌리기 (몸에서 바깥으로 방사형 발사) ──
      if(this._scytheCd<=0){
        this._scytheCd=scytheLife*0.75/spdScale;
        const baseOffset=Math.random()*Math.PI*2; // 매번 다른 기준 각도
        for(let i=0;i<count;i++){
          // 균등 각도 + 랜덤 오프셋 ±20°
          const ang=baseOffset+Math.PI*2/count*i+(Math.random()-0.5)*0.7;
          // 속도도 약간 랜덤 (160~220px/s)
          const spd=(160+Math.random()*60)*spdScale;
          const p=new Projectile(
            _cx,_cy,
            Math.cos(ang)*spd,Math.sin(ang)*spd,
            dmg,
            {radius:Math.round(lvl.hitRadius*scaleBase),life:scytheLife,type:'scythe', // [UPDATE 2026-07-08] 판정도 비주얼 크기에 비례 (기존엔 그림만 커지고 히트박스 고정)
             drawScaleX:scaleBase,drawScaleY:scaleBase,
             color:'#60d080',glow:'rgba(80,200,100,.5)'});
          p._selfSpin=Math.PI*0.4;
          // [UPDATE 2026-07-08] 초월 8성: 소멸 시 잔상 폭발 (스팸 방지로 배치당 1개만 표시)
          if(i===0 && (this._transcendRank||0)>=8){ p._transcendBurst=true; p._burstDmg=Math.floor(dmg*0.6); }
          projs.push(p);
        }
      }

      // ── 회오리 낫 (특강: 나선형 확장, 3.5s 쿨 + 쿨감 적용) ──
      if(bonus>0){
        const whirlLife=2.5+(bonus-1)*0.5;
        const whirlCooldown=3.5*(1-cdr);
        this._whirlSpawnCd-=dt;
        // 살아있는 회오리 렌더링
        for(const w of this._whirlActive){
          w.t+=dt;
          w.angle+=Math.PI*2*dt*1.5;
          w.radius=Math.min(220,w.t*50);
          const wScale=1.0+w.t*0.9;
          const wp=new Projectile(
            _cx+Math.cos(w.angle)*w.radius,
            _cy+Math.sin(w.angle)*w.radius,
            0,0,Math.floor(dmg*0.3),
            {orb:true,pierce:99,radius:Math.round(lvl.hitRadius*wScale),life:0.08, // [UPDATE 2026-07-08] 회오리도 커지는 그림에 판정 비례
             type:'scythe',drawScaleX:wScale,drawScaleY:wScale,
             color:'#40ff80',glow:'rgba(60,255,100,.6)'});
          wp._selfSpin=Math.PI*5;
          projs.push(wp);
        }
        this._whirlActive=this._whirlActive.filter(w=>w.t<whirlLife);
        // 쿨타임 만료 시 새 회오리 소환
        if(this._whirlSpawnCd<=0){
          this._whirlActive.push({t:0,angle:0,radius:0});
          this._whirlSpawnCd=whirlCooldown;
        }
      }

      return projs;
    },
  },
};

// 하위 호환: 기존 코드가 WEAPON_DEFS 참조하는 경우 대비
const WEAPON_DEFS = MAIN_WEAPON_DEFS;

// ══════════════════════════════════════════
//  보조무기 정의 (20종)
// ══════════════════════════════════════════
const SUB_WEAPON_DEFS = {

  // ── 공격형 ──
  bell:{
    id:'bell', name:'무당 방울', icon:'🔔', category:'attack', rarity:'common',
    desc:'주변에 충격파를 발생시킨다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:20,radius:70},
      {cooldown:4.0,damage:28,radius:85},
      {cooldown:4.0,damage:36,radius:100},
      {cooldown:4.0,damage:46,radius:120},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      return [new Projectile(player.x,player.y,0,0,
        Math.floor(lvl.damage*(player.totalAtk/100)),
        {aoe:lvl.radius,radius:lvl.radius,life:0.28,type:'bell',color:'#60c0f0',glow:'rgba(80,180,240,.5)'})];
    },
  },

  bead:{
    id:'bead', name:'수행 염주', icon:'📿', category:'attack', rarity:'common',
    desc:'직선으로 꿰뚫는 염주알을 날린다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:18,speed:350,pierce:2,radius:6,life:1.8},
      {cooldown:4.0,damage:24,speed:360,pierce:3,radius:6,life:1.8},
      {cooldown:4.0,damage:30,speed:380,pierce:4,radius:7,life:2.0},
      {cooldown:4.0,damage:38,speed:400,pierce:99,radius:8,life:2.2},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const t=findNearestEnemies(player.x,player.y,enemies,1)[0]||{x:player.x,y:player.y-1};
      const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy)||1;
      return [new Projectile(player.x,player.y-30,(dx/d)*lvl.speed,(dy/d)*lvl.speed,
        Math.floor(lvl.damage*(player.totalAtk/100)),
        {pierce:lvl.pierce,radius:lvl.radius,life:lvl.life,type:'bead',color:'#a060e0',glow:'rgba(140,80,220,.5)'})];
    },
  },

  thunder_drum:{
    id:'thunder_drum', name:'천둥북', icon:'🥁', category:'attack', rarity:'uncommon',
    desc:'가장 가까운 적에게 번개를 내리친다. 레벨업 시 대상 수 증가.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:24,count:1},
      {cooldown:4.0,damage:32,count:2},
      {cooldown:4.0,damage:42,count:3},
      {cooldown:4.0,damage:54,count:4},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const dmg=Math.floor(lvl.damage*(player.totalAtk/100)*(this._overAwkDmg||1));
      const targets=findNearestEnemies(player.x,player.y,enemies,lvl.count);
      return targets.map(t=>{
        const p=new Projectile(
          t.x, t.y-130,
          0, 650,
          dmg,
          {radius:18,life:0.22,type:'thunder_drum',
           drawScaleX:0.8,drawScaleY:5.0,
           color:'#f0e040',glow:'rgba(240,220,60,.9)'}
        );
        return p;
      });
    },
  },

  goblin_axe:{
    id:'goblin_axe', name:'도깨비 도끼', icon:'🪓', category:'attack', rarity:'uncommon',
    desc:'도끼가 주인공을 중심으로 왕복 진동한다. 레벨업마다 축이 추가된다.',
    maxLevel:4,
    levels:[
      {cooldown:0,damage:30,speed:350,range:195,hitRadius:14},
      {cooldown:0,damage:42,speed:370,range:208,hitRadius:15},
      {cooldown:0,damage:56,speed:390,range:221,hitRadius:16},
      {cooldown:0,damage:74,speed:410,range:234,hitRadius:17},
    ],
    fire(player,enemies){
      const lvl=this.curLevel;
      const dt=0.016;
      const dmg=Math.floor(lvl.damage*(player.totalAtk/100)*(this._overAwkDmg||1));
      const AXE_ANGS=[0, Math.PI/2, Math.PI/4, Math.PI*3/4];
      if(!this._axeStates) this._axeStates=[];
      while(this._axeStates.length<this.lv){
        const i=this._axeStates.length;
        this._axeStates.push({theta:Math.PI/2, ang:AXE_ANGS[i], spinAng:0});
      }
      const omega=lvl.speed/lvl.range;
      const cx=player.x, cy=player.y-30;
      const projs=[];
      for(const ax of this._axeStates){
        ax.theta+=omega*dt;
        ax.spinAng+=Math.PI*dt; // 0.5회전/s 누적
        const pos=lvl.range*Math.sin(ax.theta);
        const vel=lvl.range*omega*Math.cos(ax.theta);
        const px=cx+Math.cos(ax.ang)*pos;
        const py=cy+Math.sin(ax.ang)*pos;
        const p=new Projectile(px,py,
          Math.cos(ax.ang)*vel,Math.sin(ax.ang)*vel,
          dmg,{orb:true,pierce:99,radius:lvl.hitRadius,life:0.08,
               baseAng:ax.spinAng,
               type:'goblin_axe',drawScaleX:3.75,drawScaleY:3.75,
               color:'#c07820',glow:'rgba(200,120,30,.38)'});
        projs.push(p);
      }
      return projs;
    },
  },

  water_jet:{
    id:'water_jet', name:'용왕 물줄기', icon:'💧', category:'attack', rarity:'uncommon',
    desc:'토네이도가 날아가며 적을 빨아들인다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:20,speed:200,pullRange:200,pullForce:120,travelTime:2.0,stayTime:1.0,radius:40},
      {cooldown:4.0,damage:28,speed:217,pullRange:230,pullForce:150,travelTime:2.0,stayTime:1.2,radius:45},
      {cooldown:4.0,damage:38,speed:233,pullRange:260,pullForce:180,travelTime:2.0,stayTime:1.4,radius:50},
      {cooldown:4.0,damage:50,speed:250,pullRange:300,pullForce:220,travelTime:2.0,stayTime:1.6,radius:55},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const t=findNearestEnemies(player.x,player.y,enemies,1)[0]||{x:player.x,y:player.y-1};
      const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy)||1;
      const p=new Projectile(player.x,player.y-30,(dx/d)*lvl.speed,(dy/d)*lvl.speed,
        Math.floor(lvl.damage*(player.totalAtk/100)),
        {pierce:99,radius:lvl.radius,life:lvl.travelTime+lvl.stayTime,
         type:'water_jet',color:'#40c0ff',glow:'rgba(60,180,255,.6)'});
      p._tornado=true; p._travelTime=lvl.travelTime; p._stayTime=lvl.stayTime;
      p._pullRange=lvl.pullRange; p._pullForce=lvl.pullForce; p._elapsed=0;
      return [p];
    },
  },
  goblin_fire:{
    id:'goblin_fire', name:'도깨비불', icon:'🔥', category:'area', rarity:'common',
    desc:'주인공 주변에 불꽃 장판을 생성한다.',
    maxLevel:4,
    levels:[
      {cooldown:7.0,damage:12,radius:35,count:1,life:2.5},
      {cooldown:7.0,damage:16,radius:38,count:2,life:2.5},
      {cooldown:7.0,damage:22,radius:40,count:3,life:3.0},
      {cooldown:7.0,damage:30,radius:45,count:4,life:3.0},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      const spawnR=400;
      return Array.from({length:lvl.count},()=>{
        const ang=Math.random()*Math.PI*2;
        const dist=Math.random()*spawnR;
        const tx=player.x+Math.cos(ang)*dist;
        const ty=player.y+Math.sin(ang)*dist;
        return new Projectile(tx,ty,0,0,
          Math.floor(lvl.damage*(player.totalAtk/100)),
          {aoe:lvl.radius,radius:lvl.radius,life:lvl.life,dot:true,type:'goblin_fire',color:'#ff6020',glow:'rgba(255,80,20,.6)'});
      });
    },
  },

  poison_mist:{
    id:'poison_mist', name:'독안개', icon:'🌫️', category:'area', rarity:'common',
    desc:'주변에 독 안개 장판을 생성한다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:6, radius:80, life:6.0},
      {cooldown:4.0,damage:9, radius:95, life:7.0},
      {cooldown:4.0,damage:12,radius:110,life:8.0},
      {cooldown:4.0,damage:16,radius:130,life:9.0},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const _t=findNearestEnemies(player.x,player.y,enemies,1)[0]||player;
      return [new Projectile(_t.x,_t.y,0,0,
        Math.floor(lvl.damage*(player.totalAtk/100)),
        {aoe:lvl.radius,radius:lvl.radius,life:lvl.life,dot:true,type:'poison_mist',color:'#60c040',glow:'rgba(80,180,50,.5)'})];
    },
  },

  holy_water:{
    id:'holy_water', name:'정화수 뿌리기', icon:'💦', category:'area', rarity:'uncommon',
    desc:'발 밑에 정화수 장판을 깐다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:10,radius:100,life:4.0},
      {cooldown:4.0,damage:14,radius:120,life:4.5},
      {cooldown:4.0,damage:18,radius:140,life:5.0},
      {cooldown:4.0,damage:24,radius:160,life:6.0},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      return [new Projectile(player.x,player.y,0,0,
        Math.floor(lvl.damage*(player.totalAtk/100)),
        {aoe:lvl.radius,radius:lvl.radius,life:lvl.life,dot:true,type:'holy_water',color:'#80d0ff',glow:'rgba(100,200,255,.5)'})];
    },
  },

  ghost_hand:{
    id:'ghost_hand', name:'귀신 손', icon:'👻', category:'area', rarity:'uncommon',
    desc:'랜덤 위치 땅에서 귀신 손이 솟아오른다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:22,radius:28,count:2,life:1.5},
      {cooldown:4.0,damage:30,radius:30,count:4,life:1.6},
      {cooldown:4.0,damage:40,radius:32,count:6,life:1.8},
      {cooldown:4.0,damage:52,radius:35,count:8,life:2.0},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const _targets=findNearestEnemies(player.x,player.y,enemies,lvl.count);
      return Array.from({length:lvl.count},(_,i)=>{
        const t=_targets[i]||enemies.filter(e=>!e.dead)[0]||player;
        const p=new Projectile(
          t.x+(Math.random()-0.5)*20,t.y+(Math.random()-0.5)*20,0,0,
          Math.floor(lvl.damage*(player.totalAtk/100)),
          {radius:lvl.radius,life:lvl.life,type:'ghost_hand',
           drawScaleX:2.5,drawScaleY:2.5,
           color:'#c0ffc0',glow:'rgba(150,255,150,.5)'});
        p._ghostHand=true;
        return p;
      });
    },
  },

  lightning_trap:{
    id:'lightning_trap', name:'번개 장판', icon:'⚡', category:'area', rarity:'rare',
    desc:'범위 내 랜덤 위치에 번개가 떨어진다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:6, radius:20,range:150,count:2,life:1.5},
      {cooldown:4.0,damage:8, radius:22,range:170,count:3,life:1.6},
      {cooldown:4.0,damage:10,radius:24,range:190,count:3,life:1.8},
      {cooldown:4.0,damage:14,radius:26,range:210,count:4,life:2.0},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const _ltTargets=findNearestEnemies(player.x,player.y,enemies,lvl.count);
      const result=[];
      for(let i=0;i<lvl.count;i++){
        const _lt=_ltTargets[i]||null;
        const ang=Math.random()*Math.PI*2,dist=Math.random()*(lvl.range*0.5);
        const ltx=_lt?_lt.x+Math.cos(ang)*dist:player.x+Math.cos(ang)*lvl.range;
        const lty=_lt?_lt.y+Math.sin(ang)*dist:player.y+Math.sin(ang)*lvl.range;
        // 낙뢰 이펙트 (시각만, 데미지 0)
        result.push(new Projectile(ltx,lty-130,0,650,Math.floor(lvl.damage*(player.totalAtk/100)*0.3),
          {radius:10,life:0.22,type:'lightning_fall',
           drawScaleX:1.0,drawScaleY:5.5,
           color:'#f0e040',glow:'rgba(240,220,60,.9)'}));
        // 바닥 장판 (실제 데미지)
        result.push(new Projectile(ltx,lty,0,0,
          Math.floor(lvl.damage*(player.totalAtk/100)),
          {radius:lvl.radius,life:lvl.life||1.5,type:'lightning_trap',aoe:lvl.radius,
           drawScaleX:3.5,drawScaleY:3.5,
           color:'#a0c0ff',glow:'rgba(120,160,255,.7)'}));
      }
      return result;
    },
  },

  // ── 디버프형 ──
  scythe_sub:{
    id:'scythe_sub', name:'저승낫', icon:'☠️', category:'debuff', rarity:'common',
    desc:'맞은 적의 이동속도를 감소시킨다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:16,speed:300,radius:10,life:2.0,slow:0.3,slowDur:2.0},
      {cooldown:4.0,damage:22,speed:320,radius:11,life:2.0,slow:0.35,slowDur:2.5},
      {cooldown:4.0,damage:30,speed:340,radius:12,life:2.0,slow:0.4,slowDur:3.0},
      {cooldown:4.0,damage:40,speed:360,radius:13,life:2.0,slow:0.5,slowDur:4.0},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const t=findNearestEnemies(player.x,player.y,enemies,1)[0]||{x:player.x,y:player.y-1};
      const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy)||1;
      return [new Projectile(player.x,player.y-30,(dx/d)*lvl.speed,(dy/d)*lvl.speed,
        Math.floor(lvl.damage*(player.totalAtk/100)),
        {radius:lvl.radius,life:lvl.life,slow:lvl.slow,slowDur:lvl.slowDur,
         pierce:999,_bounce:true,_initLife:2.0,
         type:'scythe_sub',color:'#204040',glow:'rgba(30,80,60,.6)'})];
    },
  },

  ice_amulet:{
    id:'ice_amulet', name:'얼음 부적', icon:'🧊', category:'debuff', rarity:'uncommon',
    desc:'범위 내 적을 잠시 빙결시킨다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,radius:80, freezeDur:1.2},
      {cooldown:4.0,radius:95, freezeDur:1.5},
      {cooldown:4.0,radius:110,freezeDur:1.8},
      {cooldown:4.0,radius:130,freezeDur:2.5},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      return [new Projectile(player.x,player.y,0,0,0,
        {aoe:lvl.radius,radius:lvl.radius,life:0.3,freeze:lvl.freezeDur,type:'ice_amulet',color:'#a0e0ff',glow:'rgba(150,220,255,.7)'})];
    },
  },

  poison_needle:{
    id:'poison_needle', name:'독 침', icon:'🪡', category:'debuff', rarity:'common',
    desc:'도트 독 데미지를 입힌다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,damage:8, speed:360,radius:7,life:1.6,dotDmg:4, dotTick:0.5,dotDur:1.5},
      {cooldown:4.0,damage:10,speed:380,radius:7,life:1.6,dotDmg:6, dotTick:0.5,dotDur:1.7},
      {cooldown:4.0,damage:13,speed:400,radius:8,life:1.8,dotDmg:9, dotTick:0.4,dotDur:2.0},
      {cooldown:4.0,damage:16,speed:420,radius:8,life:1.8,dotDmg:12,dotTick:0.4,dotDur:2.3},
    ],
    fire(player,enemies){
      const lvl=this.levels[this.lv-1];
      const t=findNearestEnemies(player.x,player.y,enemies,1)[0]||{x:player.x,y:player.y-1};
      const dx=t.x-player.x,dy=t.y-player.y,d=Math.hypot(dx,dy)||1;
      return [new Projectile(player.x,player.y-30,(dx/d)*lvl.speed,(dy/d)*lvl.speed,
        Math.floor(lvl.damage*(player.totalAtk/100)),
        {radius:lvl.radius,life:lvl.life,
         dotDmg:lvl.dotDmg,dotTick:lvl.dotTick,dotDur:lvl.dotDur,
         pierce:999,_bounce:true,_initLife:lvl.life,_poisonTrail:true,
         type:'poison_needle',color:'#80e040',glow:'rgba(100,220,50,.5)'})];
    },
  },

  curse_doll:{
    id:'curse_doll', name:'저주 인형', icon:'🪆', category:'debuff', rarity:'rare',
    desc:'범위 내 적이 받는 데미지를 증가시킨다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,radius:200,debuffMult:1.2,debuffDur:2.0},
      {cooldown:4.0,radius:230,debuffMult:1.3,debuffDur:2.5},
      {cooldown:4.0,radius:260,debuffMult:1.4,debuffDur:3.0},
      {cooldown:4.0,radius:300,debuffMult:1.5,debuffDur:3.5},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      return [new Projectile(player.x,player.y,0,0,0,
        {aoe:lvl.radius,radius:lvl.radius,life:0.6,debuffMult:lvl.debuffMult,debuffDur:lvl.debuffDur,type:'curse_doll',color:'#e040a0',glow:'rgba(220,50,150,.6)'})];
    },
  },

  sealing_amulet:{
    id:'sealing_amulet', name:'현혹 부적', icon:'🔏', category:'debuff', rarity:'rare',
    desc:'범위 내 적을 잠시 아군으로 현혹시킨다. (보스 제외)',
    maxLevel:4,
    levels:[
      {cooldown:4.0,radius:240,charmDur:3.0},
      {cooldown:4.0,radius:280,charmDur:4.0},
      {cooldown:4.0,radius:320,charmDur:5.0},
      {cooldown:4.0,radius:360,charmDur:6.0},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      return [new Projectile(player.x,player.y,0,0,0,
        {aoe:lvl.radius,radius:lvl.radius,life:0.6,charmDur:lvl.charmDur,
         type:'sealing_amulet',color:'#ff80c0',glow:'rgba(255,100,180,.7)'})];
    },
  },

  // ── 서포트형 ──
  heal_incense:{
    id:'heal_incense', name:'치유 향', icon:'🪔', category:'support', rarity:'common',
    desc:'주기적으로 소량 HP를 회복한다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,heal:8},
      {cooldown:4.0,heal:13},
      {cooldown:4.0,heal:20},
      {cooldown:4.0,heal:30},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      if(!player._healBlocked) player.hp=Math.min(player.maxHp,player.hp+lvl.heal);
      return [];
    },
  },

  spirit_shield:{
    id:'spirit_shield', name:'신령 방패', icon:'🛡️', category:'support', rarity:'rare',
    desc:'주기적으로 잠시 무적이 된다.',
    maxLevel:4,
    levels:[
      {cooldown:10.0,iframeDur:1.0},
      {cooldown:10.0,iframeDur:1.3},
      {cooldown:10.0,iframeDur:1.6},
      {cooldown:10.0,iframeDur:2.0},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      player.iframe=Math.max(player.iframe,lvl.iframeDur);
      return [];
    },
  },

  hopaetag:{
    id:'hopaetag', name:'호패', icon:'🪬', category:'support', rarity:'uncommon',
    desc:'골드·경험치 획득량이 증가한다. (패시브)',
    maxLevel:4,
    levels:[
      {cooldown:999,goldMult:1.1,xpMult:1.0},
      {cooldown:999,goldMult:1.2,xpMult:1.1},
      {cooldown:999,goldMult:1.3,xpMult:1.2},
      {cooldown:999,goldMult:1.4,xpMult:1.3},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      player._goldMult=lvl.goldMult;
      player._xpMult=lvl.xpMult;
      return [];
    },
  },

  karma_bead:{
    id:'karma_bead', name:'업 구슬', icon:'🔮', category:'support', rarity:'uncommon',
    desc:'공격력이 패시브로 증가한다.',
    maxLevel:4,
    levels:[
      {cooldown:999,atkBonus:10},
      {cooldown:999,atkBonus:15},
      {cooldown:999,atkBonus:20},
      {cooldown:999,atkBonus:30},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      if(!player._karmaBaseAtk) player._karmaBaseAtk=player.stats.atk;
      player.stats.atk=Math.floor(player._karmaBaseAtk*(1+lvl.atkBonus/100));
      return [];
    },
  },

  shaman_drum:{
    id:'shaman_drum', name:'무당 북', icon:'🪘', category:'support', rarity:'uncommon',
    desc:'주기적으로 공격력을 일시 증가시킨다.',
    maxLevel:4,
    levels:[
      {cooldown:4.0,buffMult:1.3,buffDur:3.0},
      {cooldown:4.0,buffMult:1.4,buffDur:3.5},
      {cooldown:4.0,buffMult:1.5,buffDur:4.0},
      {cooldown:4.0,buffMult:1.7,buffDur:5.0},
    ],
    fire(player){
      const lvl=this.levels[this.lv-1];
      player._atkBuff=lvl.buffMult;
      player._atkBuffTime=lvl.buffDur;
      return [];
    },
  },
};

// ══════════════════════════════════════════
// [UPDATE 2026-07-06] 무기 성장(강화+각성) 통합 계산 함수
// 규칙: 0각Lv1~4 → 1각Lv1~4 → ... → 4각Lv1~4(총 20픽) → 5각Lv1(1픽, MAX) → 6각+(데미지+8%/픽)
function computeWeaponGrowth(totalLv) {
  totalLv = Math.max(1, totalLv || 1);
  if (totalLv <= 20) {
    const awakLv   = Math.floor((totalLv - 1) / 4);
    const lv       = ((totalLv - 1) % 4) + 1;
    return { lv, ascendLv: totalLv - 1, awakLv, awakSubLv: lv - 1, overSteps: 0, overAwkDmg: 1 };
  }
  // totalLv=21 → 5각성(MAX, Lv4 테이블 고정), 22+ → 6각,7각... 데미지 +8%/픽
  const overSteps  = totalLv - 21;
  const awakLv     = 5 + overSteps; // 표시용 (효과는 5각에서 캡)
  return { lv: 4, ascendLv: 20, awakLv, awakSubLv: 0, overSteps, overAwkDmg: 1 + overSteps * 0.08 };
}

// ══════════════════════════════════════════
// [UPDATE 2026-07-08] 무기 초월 시스템 (260707_MTOPC.md 5번/8번 확정안 기준)
// 랭크 0~10. 누적 데미지%: 1~4성 30%/랭크, 5~8성 40%/랭크, 9성 90%(독립), 10성 130%(독립)
// → 0,30,60,90,120,160,200,240,280,370,500 (%)
const TRANSCEND_MAX_RANK = 10;
const TRANSCEND_CUM_PCT = [0,30,60,90,120,160,200,240,280,370,500];

function getTranscendMult(rank) {
  rank = Math.max(0, Math.min(TRANSCEND_MAX_RANK, rank || 0));
  return 1 + TRANSCEND_CUM_PCT[rank] / 100;
}

// ⚠️ 재료 수량은 260707_MTOPC.md 8번 "임시 제안치" 기준 (영혼석 5·10·15·20·25·30·35·40·60·80, 합 320개/무기).
// 골드/강화석/차원석 수량은 이번 구현에서 처음 정한 잠정치 — 밸런스 확정 전까지 조정 대상.
const TRANSCEND_COST = [
  null, // 0랭크(미시작)는 비용 없음
  { soul: 5,  gold: 3000,  ganghwa: 0,  chaewon: 0 },
  { soul: 10, gold: 6000,  ganghwa: 0,  chaewon: 0 },
  { soul: 15, gold: 9000,  ganghwa: 0,  chaewon: 0 },
  { soul: 20, gold: 12000, ganghwa: 0,  chaewon: 0 },
  { soul: 25, gold: 15000, ganghwa: 20, chaewon: 0 },
  { soul: 30, gold: 18000, ganghwa: 40, chaewon: 0 },
  { soul: 35, gold: 21000, ganghwa: 60, chaewon: 0 },
  { soul: 40, gold: 24000, ganghwa: 80, chaewon: 0 },
  { soul: 60, gold: 30000, ganghwa: 100, chaewon: 5  },
  { soul: 80, gold: 40000, ganghwa: 150, chaewon: 10 },
];

function getTranscendCost(nextRank) {
  return TRANSCEND_COST[Math.max(1, Math.min(TRANSCEND_MAX_RANK, nextRank))];
}

// 8성 이상에서 활성화되는 무기별 서브 메커닉 (부적:관통+1 / 신검:판정폭+50% / 신궁:약한유도 / 지팡이:잔류장판 / 낫:소멸폭발)
function hasTranscend8(weaponId, rank) {
  return (rank || 0) >= 8;
}

//  인게임 스탯 강화 정의 (패시브 슬롯 최대 4개)
// [UPDATE 2026-07-06] 쿨감 통합 재계산: 스탯(공속/쿨타임) + 펫 효과를 합산해 상한 60% 적용
function recalcCdReduction(p) {
  p._cdReduction = Math.min(0.6, (p._cdrAtkSpd||0) + (p._cdrCd||0) + (p._cdrPet||0));
}

// ══════════════════════════════════════════
const STAT_UPGRADE_DEFS = [
  { id:'atk',     name:'공격력',   icon:'⚔️',  desc:'공격력 +8%',       maxLevel:5, apply(p,lv){ p.tempStats.atk+=lv*8; } },
  { id:'hp',      name:'체력',     icon:'❤️',  desc:'최대 체력 +10%',    maxLevel:5, apply(p,lv){ const b=Math.floor(p.maxHp*0.10); p.maxHp+=b; p.hp=Math.min(p.hp+b,p.maxHp); } },
  { id:'mov',     name:'이동속도', icon:'👟',  desc:'이동속도 +8%',      maxLevel:5, apply(p,lv){ p.tempStats.mov+=lv*8; } },
  { id:'atkSpd',  name:'공격속도', icon:'💨',  desc:'공격속도 +8%',      maxLevel:5, apply(p,lv){ p._cdrAtkSpd=lv*0.08; recalcCdReduction(p); } },
  { id:'cd',      name:'쿨타임',   icon:'⏱️',  desc:'쿨타임 감소 -6%',   maxLevel:5, apply(p,lv){ p._cdrCd=lv*0.06; recalcCdReduction(p); } },
  { id:'vampire', name:'흡혈',     icon:'🩸',  desc:'공격 시 HP 흡수',   maxLevel:5, apply(p,lv){ p._vampire=lv*0.03; } },
  { id:'magnet',  name:'자석',     icon:'🧲',  desc:'경험치 범위 +40',   maxLevel:5, apply(p,lv){ p.magnetRange+=40; } },
];



const WEAPON_I18N = {
  en: {
    bell: { name:'Spirit Bell', desc:'Releases a shockwave around the caster.' },
    bead: { name:'Prayer Beads', desc:'Fires a piercing bead in a straight line.' },
    thunder_drum: { name:'Thunder Drum', desc:'Fires a shockwave in a frontal arc.' },
    goblin_axe: { name:'Goblin Axe', desc:'Throws an axe that flies out and boomerangs back.' },
    water_jet: { name:'Dragon\'s Whirlpool', desc:'A tornado flies forward, pulling in enemies.' },
    goblin_fire: { name:'Goblin Fire', desc:'Creates flame fields at random locations.' },
    poison_mist: { name:'Poison Mist', desc:'Creates a poisonous mist field around the caster.' },
    holy_water: { name:'Sacred Water Rite', desc:'Spreads purifying water beneath your feet.' },
    ghost_hand: { name:'Ghost Hand', desc:'Ghostly hands rise from random ground locations.' },
    lightning_trap: { name:'Lightning Field', desc:'Lightning strikes random locations in range.' },
    scythe_sub: { name:'Reaper\'s Scythe', desc:'Slows the movement speed of struck enemies.' },
    ice_amulet: { name:'Ice Amulet', desc:'Briefly freezes enemies in range.' },
    poison_needle: { name:'Poison Needle', desc:'Inflicts damage-over-time poison.' },
    curse_doll: { name:'Cursed Doll', desc:'Increases damage taken by enemies in range.' },
    sealing_amulet: { name:'Beguiling Talisman', desc:'Charms nearby enemies to fight for you temporarily. (Bosses immune)' },
    heal_incense: { name:'Healing Incense', desc:'Periodically restores a small amount of HP.' },
    spirit_shield: { name:'Spirit Shield', desc:'Periodically grants brief invincibility.' },
    hopaetag: { name:'Identity Tag', desc:'Passively increases gold and XP gained.' },
    karma_bead: { name:'Karma Orb', desc:'Passively increases attack power.' },
    shaman_drum: { name:'Shaman\'s Drum', desc:'Periodically boosts attack power temporarily.' },
    talisman: { name:'Talisman', desc:'Throws a sealing talisman at the nearest enemy.' },
    talisman_count: { name:'Special Upgrade', desc:'+1 Follow-up Talisman' },
    talisman_tadak: { name:'Special Upgrade', desc:'+1 Follow-up Talisman' },
    sword: { name:'Divine Sword', desc:'A powerful divine sword that slashes in a frontal arc.' },
    sword_range: { name:'Special Upgrade', desc:'Range +15%' },
    bow: { name:'Divine Bow', desc:'Fires arrows in a fan. Level up for rapid fire, awaken for multi-shot.' },
    bow_pierce: { name:'Special Upgrade', desc:'Pierce +1' },
    bow_split: { name:'Special Upgrade', desc:'Homing arrow that splits on hit every 3s' },
    staff: { name:'Shaman\'s Staff', desc:'Summons orbs that orbit around you.' },
    staff_orbs: { name:'Special Upgrade', desc:'+1 Outer Orb' },
    scythe_main: { name:'Soul Reaper\'s Scythe', desc:'Scatters spinning scythe effects around you.' },
    scythe_speed: { name:'Special Upgrade', desc:'Whirl scythe spirals outward (2.5s+)' },
    atk: { name:'Attack', desc:'Attack power +8%' },
    hp: { name:'Health', desc:'Max HP +10%' },
    mov: { name:'Move Speed', desc:'Move speed +8%' },
    atkSpd: { name:'Attack Speed', desc:'Attack speed +8%' },
    cd: { name:'Cooldown', desc:'Cooldown reduction -6%' },
    vampire: { name:'Lifesteal', desc:'Heal HP on attack' },
    magnet: { name:'Magnet', desc:'XP pickup range +40' },
  }
};

function wi18n(id, field, fallback) {
  if (typeof Lang !== 'undefined' && Lang.getCurrent && Lang.getCurrent() === 'en') {
    const t = WEAPON_I18N.en[id];
    if (t && t[field]) return t[field];
  }
  return fallback;
}

// 진화 시스템 삭제 — 각성은 대장간 ⭐ 시스템으로 통합
const EVOLVED_WEAPON_DEFS = {};
const _DELETED_EVOLVED = {  // 참고용 보관 (실제 사용 안 함)
  talisman_evo: {
    id:'talisman_evo', name:'각성 부적', icon:'🌀',
    cooldown: 1.6,
    fire(player) {
      const count = 8;
      return Array.from({length:count}, (_,i) => {
        const ang = (i/count)*Math.PI*2;
        return new Projectile(player.x, player.y,
          Math.cos(ang)*380, Math.sin(ang)*380,
          Math.floor(52*(player.totalAtk/100)),
          {pierce:4, radius:9, life:2.6, type:'talisman',
           color:'#ff4040', glow:'rgba(255,60,30,.8)'});
      });
    }
  },

  // ── 신검 각성: 전방 3방향 동시 발사 ──
  sword_evo: {
    id:'sword_evo', name:'각성 신검', icon:'⚔️',
    cooldown: 0.65,
    fire(player, enemies) {
      const target = findNearestEnemies(player.x,player.y,enemies,1)[0];
      const baseAng = target
        ? Math.atan2(target.y-player.y, target.x-player.x)
        : (player.facing>=0 ? 0 : Math.PI);
      const _cy = player.y-30;
      const _speed = 110/0.28;
      return [-28, 0, 28].map(deg => {
        const ang = baseAng + deg*Math.PI/180;
        return new Projectile(player.x, _cy,
          Math.cos(ang)*_speed, Math.sin(ang)*_speed,
          Math.floor(78*(player.totalAtk/100)),
          {radius:11, life:0.63, type:'sword', baseAng:ang,
           throwSword:true, throwRange:110, throwHideTime:0.13, throwFadeDur:0.15,
           throwHitWidth:11, drawScaleX:2.8, drawScaleY:4.0,
           color:'#ffffff', glow:'rgba(200,240,255,.9)'});
      });
    }
  },

  // ── 신궁 각성: 명중 시 분열/복제 (기본 화살 3발, 적 맞으면 2갈래 분열) ──
  bow_evo: {
    id:'bow_evo', name:'각성 신궁', icon:'🏹',
    cooldown: 0.85,
    fire(player, enemies) {
      const t = findNearestEnemies(player.x,player.y,enemies,1)[0]
                || {x:player.x, y:player.y-1};
      const baseAng = Math.atan2(t.y-player.y, t.x-player.x);
      return [-12,0,12].map(deg => {
        const ang = baseAng + deg*Math.PI/180;
        return new Projectile(player.x, player.y,
          Math.cos(ang)*560, Math.sin(ang)*560,
          Math.floor(62*(player.totalAtk/100)),
          {pierce:2, radius:8, life:2.1, type:'bow',
           _splitOnHit:true,
           color:'#ffff40', glow:'rgba(255,255,40,.7)'});
      });
    }
  },

  // ── 무당지팡이 각성: 오브 착탄 시 AOE 폭발 ──
  staff_evo: {
    id:'staff_evo', name:'각성 무당 지팡이', icon:'🪄',
    cooldown: 0,
    _angle: 0,
    fire(player) {
      const count = 4;
      this._angle = (this._angle||0) + 2.6*0.016;
      const _cx = player.x+8, _cy = player.y-30;
      return Array.from({length:count}, (_,i) => {
        const ang = this._angle + (i/count)*Math.PI*2;
        return new Projectile(
          _cx + Math.cos(ang)*100,
          _cy + Math.sin(ang)*100, 0, 0,
          Math.floor(28*(player.totalAtk/100)),
          {pierce:0, radius:12, life:0.06, type:'staff',
           _explodeOnOrbHit:true,
           color:'#c060ff', glow:'rgba(180,60,255,.7)'});
      });
    }
  },

  // ── 영혼낫 각성: 초록 궤적 AOE 잔상 남기며 회전 ──
  scythe_evo: {
    id:'scythe_evo', name:'각성 영혼낫', icon:'🌙',
    cooldown: 0,
    _angle: 0,
    _trailTimer: 0,
    fire(player) {
      this._angle = (this._angle||0) + 3.5*0.016;
      this._trailTimer = (this._trailTimer||0) + 0.016;
      const _cx = player.x+8, _cy = player.y-30;
      const result = [0, Math.PI].map(offset => {
        const ang = this._angle+offset;
        return new Projectile(
          _cx + Math.cos(ang)*120,
          _cy + Math.sin(ang)*120, 0, 0,
          Math.floor(55*(player.totalAtk/100)),
          {radius:30, life:0.06, type:'scythe',
           color:'#00ff88', glow:'rgba(0,255,120,.8)'});
      });
      // 0.12초마다 궤적 AOE 잔상 생성
      if(this._trailTimer >= 0.12){
        this._trailTimer = 0;
        [0, Math.PI].forEach(offset => {
          const ang = this._angle+offset;
          result.push(new Projectile(
            _cx + Math.cos(ang)*120,
            _cy + Math.sin(ang)*120, 0, 0,
            Math.floor(18*(player.totalAtk/100)),
            {aoe:55, life:0.5, type:'scythe',
             color:'#00ff88', glow:'rgba(0,255,120,.5)'}));
        });
      }
      return result;
    }
  },
};  // _DELETED_EVOLVED 끝

// 투사체 전용 이미지 (손 무기 이미지와 분리)
const PROJ_WEAPON_IMGS = {};

const CARD_IMGS = {
  // 주무기 (sprites/weapons/ - 대장간과 동일한 이미지)
  talisman:      '__IMG_weapons_talisman__',
  sword:         '__IMG_weapons_sword__',
  bow:           '__IMG_weapons_bow__',
  staff:         '__IMG_weapons_staff__',
  scythe_main:   '__IMG_weapons_scythe_main__',
  // 보조무기 (sprites/icons/ 스프라이트시트 크롭)
  scythe_sub:    '__IMG_icons_scythe_sub__',
  poison_needle: '__IMG_icons_poison_needle__',
  holy_water:    '__IMG_icons_holy_water__',
  goblin_axe:    '__IMG_icons_goblin_axe__',
  goblin_fire:   '__IMG_icons_goblin_fire__',
  poison_mist:   '__IMG_icons_poison_mist__',
  curse_doll:    '__IMG_icons_curse_doll__',
  ghost_hand:    '__IMG_icons_ghost_hand__',
  water_jet:     '__IMG_icons_water_jet__',
  bell:          '__IMG_icons_bell__',
  bead:          '__IMG_icons_bead__',
  thunder_drum:  '__IMG_icons_thunder_drum__',
  lightning_trap:'__IMG_icons_lightning_trap__',
  ice_amulet:    '__IMG_icons_ice_amulet__',
  sealing_amulet:'__IMG_icons_sealing_amulet__',
  heal_incense:  '__IMG_icons_heal_incense__',
  spirit_shield: '__IMG_icons_spirit_shield__',
  hopaetag:      '__IMG_icons_hopaetag__',
  karma_bead:    '__IMG_icons_karma_bead__',
  shaman_drum:   '__IMG_icons_shaman_drum__',
};

const EFFECT_IMGS = {
  'poison_needle': '__IMG_effects_poison_needle__',
  'holy_water': '__IMG_effects_holy_water__',
  'goblin_axe': '__IMG_effects_goblin_axe__',
  'goblin_fire': '__IMG_effects_goblin_fire__',
  'poison_mist': '__IMG_effects_poison_mist__',
  'curse_doll':  '__IMG_effects_curse_doll__',
  'ghost_hand':  '__IMG_effects_ghost_hand__',
  'scythe': '__IMG_effects_scythe__',
  'scythe_sub': '__IMG_effects_scythe_sub__',
  'talisman': '__IMG_effects_talisman__',
  'bow': '__IMG_effects_bow__',
  'staff': '__IMG_effects_staff__',
  'scythe_main': '__IMG_effects_scythe_main__',
  'sword': '__IMG_effects_sword__',
  'water_jet': '__IMG_effects_water_jet__',
  'thunder_drum': '__IMG_effects_lightning_bolt__',
  'lightning_fall': '__IMG_effects_lightning_bolt__',
  // 동료 전용 이펙트 이미지 (주인공 무기와 완전 분리)
  'c_dochi_atk':    '__IMG_companion_effects_c_dochi_atk__',
  'c_dochi_ult':    '__IMG_companion_effects_c_dochi_ult__',
  'c_aram_atk':     '__IMG_companion_effects_c_aram_atk__',
  'c_aram_ult':     '__IMG_companion_effects_c_aram_ult__',
  'c_ggeogsoe_atk': '__IMG_companion_effects_c_ggeogsoe_atk__',
  'c_ggeogsoe_ult': '__IMG_companion_effects_c_ggeogsoe_ult__',
  'c_danbi_atk':    '__IMG_companion_effects_c_danbi_atk__',
  'c_danbi_ult':    '__IMG_companion_effects_c_danbi_ult__',
  'c_gaon_atk':     '__IMG_companion_effects_c_gaon_atk__',
  'c_gaon_ult':     '__IMG_companion_effects_c_gaon_ult__',
  'c_cheonga_atk':  '__IMG_companion_effects_c_cheonga_atk__',
  'c_cheonga_ult':  '__IMG_companion_effects_c_cheonga_ult__',
  'c_geumgang_atk': '__IMG_companion_effects_c_geumgang_atk__',
  'c_geumgang_ult': '__IMG_companion_effects_c_geumgang_ult__',
  'c_baekho_atk':   '__IMG_companion_effects_c_baekho_atk__',
  'c_baekho_ult':   '__IMG_companion_effects_c_baekho_ult__',
  'c_sohee_atk':    '__IMG_companion_effects_c_sohee_atk__',
  'c_sohee_ult':    '__IMG_companion_effects_c_sohee_ult__',
  'c_mugsa_atk':    '__IMG_companion_effects_c_mugsa_atk__',
  'c_mugsa_ult':    '__IMG_companion_effects_c_mugsa_ult__',
  'c_cheolgap_atk': '__IMG_companion_effects_c_cheolgap_atk__',
  'c_cheolgap_ult': '__IMG_companion_effects_c_cheolgap_ult__',
  // [UPDATE 2026-07-06] 시즌2 동료 이펙트
  'c_haewonmaek_atk': '__IMG_companion_effects_c_haewonmaek_atk__',
  'c_haewonmaek_ult': '__IMG_companion_effects_c_haewonmaek_ult__',
  'c_gangnim_atk':    '__IMG_companion_effects_c_gangnim_atk__',
  'c_gangnim_ult':    '__IMG_companion_effects_c_gangnim_ult__',
};


class WeaponInstance {
  constructor(defId) {
    this.defId    = defId;
    this.lv       = 1;
    this.cd       = 0;
    this.ascendLv = 0; // 4렙 이후 각성 강화 횟수
  }

  get def()      { return MAIN_WEAPON_DEFS[this.defId] || SUB_WEAPON_DEFS[this.defId] || WEAPON_DEFS[this.defId]; }
  get levels()   { return this.def.levels; }
  get id()       { return this.defId; }
  get name()     { return this.def.name; }
  get icon()     { return this.def.icon; }
  get maxLevel() { return this.def.maxLevel||4; }
  get isMaxLv()  { return false; } // 무한 강화: 항상 false
  get isMain()   { return !!(typeof MAIN_WEAPON_DEFS!=='undefined' && MAIN_WEAPON_DEFS[this.defId]); }

  upgrade() {
    const curAwk = this._awakLv || 0;
    // [UPDATE 2026-07-06] 5각성 이후: 표시 각성만 오르고(6각,7각...) 데미지 +8% — lv/테이블은 5각L4 고정
    if (curAwk >= 5) {
      this._overAwkDmg = (this._overAwkDmg || 1) + 0.08;
      return;
    }
    // 4렙 미만: 레벨업
    if (this.lv < 4) { this.lv++; return; }
    // 4렙에서 강화 → 각성 +1
    this._awakLv = curAwk + 1;
    // 0~3각→다음 각성: 레벨 1로 리셋 / 4각→5각(MAX): 마지막 테이블(Lv4) 유지
    if (this._awakLv < 5) this.lv = 1;
  }

  // 현재 레벨 데이터 (maxLevel 이상이면 마지막 레벨 기준)
  get curLevel() {
    const idx = Math.min(this.lv - 1, this.maxLevel - 1);
    return this.def.levels[idx];
  }

  // 각성 강화 쿨타임 보정 (ascendLv회 × 0.9 적용)
  get ascendCdMult() {
    return Math.pow(0.9, this.ascendLv);
  }

  tick(dt, player, enemies) {
    const cdReduction = player._cdReduction || window._cdReduction || 0;
    const spdMult = player.totalSpd / 100;

    this.cd -= dt * spdMult;
    if (this.cd > 0) return [];

    const lvl = this.curLevel;
    const baseCd = lvl.cooldown * this.ascendCdMult;
    const rawCd = baseCd * (1 - cdReduction);
    // cooldown=0인 무기(영혼낫 등)는 매 프레임 호출이므로 클램프 적용 안 함
    this.cd = baseCd === 0 ? 0 : Math.max(0.3, rawCd);
    return this.def.fire.call(this, player, enemies);
  }
}


// ── 레벨업 선택지 생성 ──
// 반환: { main: [선택지 1개], sub: [선택지 최대 3개], stat: [선택지 2개] }
// mode: 'normal'(스테이지) | 'infinite'(무한던전) | 'boss_rush'(보스러시)
function getLevelUpChoices(mainWeapon, subWeapons, statSlots, mode) {
  subWeapons = subWeapons || [];
  statSlots  = statSlots  || [];
  mode       = mode || 'normal';
  const subIds = subWeapons.map(w => w.defId);
  const mainWeapons = Array.isArray(mainWeapon) ? mainWeapon.filter(Boolean) : (mainWeapon ? [mainWeapon] : []);

  function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

  // ── 슬롯1: 주무기 ──
  // 강화(각성) or 특수강화 중 1개 랜덤 표시
  const mainPool = [];
  for (const mw of mainWeapons) {
    // 강화 or 각성강화 (항상 가능 — 무한 강화)
    if (mw.lv < mw.maxLevel) {
      mainPool.push({ type:'upgrade', weapon:mw });
    } else {
      mainPool.push({ type:'ascend', weapon:mw }); // 각성 강화
    }
    // 특수강화 (maxLevel 있는 경우 제한)
    const spec = MAIN_WEAPON_DEFS[mw.defId]?.specialStat;
    if (spec) {
      const cur = statSlots.find(s=>s.id===spec.id);
      if (!cur || cur.lv < (spec.max||4))
        mainPool.push({ type:'special', statId:spec.id, def:spec, weapon:mw });
    }
  }
  shuffle(mainPool);
  const mainResult = mainPool.length > 0 ? [mainPool[0]] : [];

  // ── 슬롯2: 보조무기 ──
  // 슬롯 미충족 시 미보유 중 랜덤, 충족 시 보유한 것 강화만
  const subResult = [];
  if (subWeapons.length < 3) {
    const _DEBUG_WEIGHT = {};
    const newSubPool = shuffle(
      Object.keys(SUB_WEAPON_DEFS)
        .filter(id => !subIds.includes(id))
        .flatMap(id => Array(_DEBUG_WEIGHT[id]||1).fill(null).map(()=>({ type:'new_sub', weaponId:id, def:SUB_WEAPON_DEFS[id] })))
    );
    const upgrSubPool = shuffle(
      subWeapons
        .filter(w => w.lv < w.maxLevel)
        .flatMap(w => Array(_DEBUG_WEIGHT[w.defId]||1).fill(null).map(()=>({ type:'upgrade', weapon:w })))
    );
    // 신규 최대 3개 채우되 보유 강화도 포함
    const combined = shuffle([...newSubPool, ...upgrSubPool]);
    const pickedIds = new Set();
    for (const c of combined) {
      const key = c.weaponId || c.weapon?.defId;
      if (!pickedIds.has(key)) { pickedIds.add(key); subResult.push(c); }
      if (subResult.length >= 3) break;
    }
  } else {
    // 슬롯 가득 → 보유한 것만 강화
    const upgradeable = subWeapons.filter(w => w.lv < w.maxLevel);
    shuffle(upgradeable).slice(0, 3).forEach(w => subResult.push({ type:'upgrade', weapon:w }));
  }

  // ── 슬롯3: 스탯 ──
  // 7종 중 2종 랜덤 (만렙 제외)
  const statPool = [];
  for (const def of STAT_UPGRADE_DEFS) {
    const cur = statSlots.find(s=>s.id===def.id&&!s.isSpecial);
    if (!cur) statPool.push({ type:'stat', statId:def.id, def });
    else if (cur.lv < (def.maxLevel||5)) statPool.push({ type:'stat_up', statId:def.id, def, cur });
  }
  shuffle(statPool);
  const statResult = statPool.slice(0, 2);

  return { main: mainResult, sub: subResult, stat: statResult };
}
