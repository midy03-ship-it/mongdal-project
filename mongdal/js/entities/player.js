// player.js - 플레이어 (CONFIG 기반)
class Player {
  constructor(x, y, savedUpgrades, sinmokUpgrades, sinmokS2) {
    this.x = x; this.y = y;
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

    // 인게임 레벨업으로 쌓이는 임시 스탯 (런 종료 시 초기화)
    this.tempStats = { atk:0, spd:0, mov:0, def:0, eva:0 };

    // 펫/아이템 패시브 (game.js에서 설정)
    this._damageReduction = 0;
    this._critChance  = (sm.critChance || 0) * sml.critChance;
    this._critMult    = CONFIG.SINMOK.CRIT_BASE_MULT + (sm.critMult || 0) * sml.critMult;
    this._xpMult      = 1.0;
    this._cdReduction = 0;
    this.magnetRange  = CONFIG.ITEM.PASSIVE_MAGNET_RANGE; // 기본 자석 범위

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
  get totalAtk() { return Math.floor((this.stats.atk + this.tempStats.atk) * (this._atkBuffTime>0 ? (this._atkBuff||1) : 1) * (1 + (this._extraDmgPct||0)/100) * (this._diceAtkMult||1)); }
  get totalSpd() { return this.stats.spd + this.tempStats.spd; }
  get totalMov() { return this.stats.mov + this.tempStats.mov; }
  get totalDef() { return this.stats.def + this.tempStats.def; }
  get totalEva() { return Math.min(this.stats.eva + this.tempStats.eva, CONFIG.EVA.MAX_PERCENT); }
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
    const finalDmg  = Math.max(1, Math.floor(dmg * (1 - Math.min(reduction, 0.9))));
    this.hp    -= finalDmg;
    this.iframe = CONFIG.PLAYER.IFRAME_SEC;
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
      this.hp = 0; this.dead = true;
    }
  }

  gainXp(amount) {
    this.xp += amount;
    if (this.xp >= this.xpNext) {
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
      return true;
    }
    return false;
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
    if (this.img.complete && this.img.naturalWidth > 0) {
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
      const wPositions = [
        { x: 28, y: -18 },   // 주무기: 오른쪽 옆
      ];
      // [UPDATE 2026-07-12] 정정: 어제 각도/위치/좌우반전 튜닝(신검 60도, 신궁 반전 등)은 전부 "완전체(초월 9~10성)"를
      // 보면서 맞춘 값이었음 — 일반(비초월) 무기에는 적용된 적이 없었는데 코드가 공유하고 있어서 일반 무기가 망가져 보였던 것.
      // 그래서 튜닝값은 전부 "_soul" 키로 옮기고, 일반 무기는 깃허브(최신 push)에 있던 원래 방식(회전/반전 없이 중앙-바닥 기준 배치)으로 되돌림.
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
        const pos = wPositions[i];
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

  // 클리어 챕터 수에 따라 플레이어 스프라이트 단계 반환
  // ch2=1단계, ch4=2단계, ch6=3단계, ch8=4단계, ch10=5단계(최종)
  static getSpriteConfig() {
    const save = (typeof Save !== 'undefined') ? Save.load() : null;
    const cleared = save?.clearedChapters || [];
    let stage = 0;
    if (cleared.includes(2))  stage = 1;
    if (cleared.includes(4))  stage = 2;
    if (cleared.includes(6))  stage = 3;
    if (cleared.includes(8))  stage = 4;
    return SPRITES.player[Math.min(stage, SPRITES.player.length - 1)];
  }
}
