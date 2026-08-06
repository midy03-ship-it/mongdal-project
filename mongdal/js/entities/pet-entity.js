// pet-entity.js - 펫 시스템 (CONFIG 기반)
class PetEntity {
  constructor(data, slotIdx) {
    this.id=data.id; this.name=data.name; this.icon=data.icon;
    this.color=data.color; this.effect=data.effect; this.value=data.value;
    this.markCount=data.markCount||1; this.confuseRangeMult=data.confuseRangeMult||1; // [UPDATE 2026-07-11]
    // [UPDATE 2026-07-17] autoCollect 펫별 범위 커스터마이징(싸리=강다리보다 느리지만 더 넓게 주움). 미지정시 기존 강다리 수치로 폴백
    this.fetchRangeMult=data.fetchRangeMult||3; this.pullRadius=data.pullRadius||100;
    this.seekMode=data.seekMode||'nearest'; // [UPDATE 2026-07-24] 'nearest'(강다리) / 'cluster'(싸리)
    this.orbitRadius=28+slotIdx*12;
    this.orbitAngle=slotIdx*(Math.PI*2/3)+Math.PI;
    this.orbitSpd=1.2+slotIdx*0.3;
    this.x=0;this.y=0;this.t=Math.random()*Math.PI*2;
    const PC=CONFIG.PET;
    const intervals={regen:PC.REGEN_INTERVAL,confuse:PC.CONFUSE_INTERVAL,knockback:PC.KNOCKBACK_INTERVAL,mark:PC.MARK_INTERVAL};
    this.effectTimer=1.0+slotIdx*0.5;
    this.baseInterval=intervals[this.effect]||99;
    this.sparkles=[]; this.triggerFlash=0;
    // 스프라이트
    const petSprMap = {hoya:'hoya',crow:'crow',fox:'fox',turtle:'turtle',
      chonggak:'chonggak',tuju:'tuju',dokkaebi:'dokkaebi_pet',rabbit:'rabbit',
      zodiac_rat:'zodiac_rat',zodiac_ox:'zodiac_ox',zodiac_tiger:'zodiac_tiger',
      zodiac_rabbit:'zodiac_rabbit',zodiac_dragon:'zodiac_dragon',zodiac_snake:'zodiac_snake',
      zodiac_horse:'zodiac_horse',zodiac_goat:'zodiac_goat',zodiac_monkey:'zodiac_monkey',
      zodiac_rooster:'zodiac_rooster',zodiac_dog:'zodiac_dog',zodiac_pig:'zodiac_pig',
      jeoseung_nabi:'jeoseung_nabi',sangsahwa:'sangsahwa', // [UPDATE 2026-07-06] 시즌2 펫
      ssari:'ssari',gongi:'gongi', // [UPDATE 2026-07-17] 도깨비 계열 신규 펫
      sujeong:'sujeong',bulssi:'bulssi'}; // [UPDATE 2026-07-17] 시즌4(귀허계) 신규 펫
    const sk = petSprMap[this.id];
    const sc = sk && SPRITES?.pets?.[sk];
    this.img = sc ? SpriteLoader.get(sc.src) : null;
    this.sprCfg = sc || null;

    // ── 관성 방랑 ──
    this.vx = 0; this.vy = 0;
    this.wanderX = 0; this.wanderY = 0;
    this.wanderTimer = Math.random() * 2;
    this.wanderAngle = slotIdx * (Math.PI * 2 / 3);
    this.wanderRadius = 38 + slotIdx * 10;
    this.breatheT = Math.random() * Math.PI * 2;
  }

  update(dt,player,enemies,projectiles,items){
    this.t+=dt;
    this.breatheT+=dt*1.3;

    // [UPDATE 2026-07-11] 강다리(술신) 자동수집: 방랑 대신 실제로 가장 가까운 드랍을 향해 달려가서 주움
    if(this.effect==='autoCollect' && items){
      // [UPDATE 2026-07-13] 순차 fetch와 별개로, 강다리 자신 주위 반경 100 안에 있는 아이템은
      // 매 프레임 같이 끌어당김 (완전히 1개씩만 줍는 게 아니라 작은 자석 범위도 추가) — 40으로는 효과 체감 안 돼서 100으로 상향
      const _petMagnetR=this.pullRadius;
      for(const arr of [items.xpOrbs,items.goldDrops,items.bigGoldDrops,items.soulDrops]){
        if(!arr) continue;
        for(const it of arr){
          if(it.dead||it.attractState==='magnet') continue;
          if(Math.hypot(it.x-this.x,it.y-this.y)<_petMagnetR) it.magnetPull();
        }
      }
      if(!this._fetchTarget || this._fetchTarget.dead){
        // [UPDATE 2026-07-24] 강다리(nearest)/싸리(cluster) 타겟팅 분리 —
        // 예전엔 둘 다 "플레이어 기준 최근접 1개"로 완전히 동일하게 동작해서 범위/속도 숫자만 다르고 행동 차이가 없었음.
        // cluster 모드는 반경 내 아이템끼리 뭉친 정도(주변 70px 내 개수)를 우선시해서 "가장 많이 모인 곳"으로 향함.
        const range=(player.magnetRange||60)*this.fetchRangeMult;
        const candidates=[];
        for(const arr of [items.xpOrbs,items.goldDrops,items.bigGoldDrops,items.soulDrops]){
          if(!arr) continue;
          for(const it of arr){
            if(it.dead||it.attractState==='magnet') continue;
            if(Math.hypot(it.x-player.x,it.y-player.y)<range) candidates.push(it);
          }
        }
        let best=null;
        if(this.seekMode==='cluster' && candidates.length){
          const clusterR=70;
          let bestScore=-1, bestD=Infinity;
          for(const it of candidates){
            let cnt=0;
            for(const other of candidates) if(other!==it && Math.hypot(other.x-it.x,other.y-it.y)<clusterR) cnt++;
            const d=Math.hypot(it.x-player.x,it.y-player.y);
            if(cnt>bestScore || (cnt===bestScore && d<bestD)){ bestScore=cnt; bestD=d; best=it; }
          }
        } else {
          let bestD=Infinity;
          for(const it of candidates){ const d=Math.hypot(it.x-player.x,it.y-player.y); if(d<bestD){ bestD=d; best=it; } }
        }
        this._fetchTarget=best;
      }
      if(this._fetchTarget && !this._fetchTarget.dead){
        const t=this._fetchTarget;
        const dx=t.x-this.x, dy=t.y-this.y, d=Math.hypot(dx,dy)||1;
        const spd=this.value||70; // 레벨 스케일링된 값 그대로 이동속도로 사용(펫마다 기본값 다름)
        if(d<16){ t.magnetPull(); this._fetchTarget=null; this._sparkle('#ffe070',5); this.triggerFlash=1; }
        else { this.x+=(dx/d)*spd*dt; this.y+=(dy/d)*spd*dt; }
        this.sparkles=this.sparkles.filter(s=>s.life>0);
        for(const s of this.sparkles){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt*2;}
        if(this.triggerFlash>0) this.triggerFlash-=dt*4;
        return false; // 방랑/트리거 로직 건너뜀
      }
      // 주울 대상이 없으면 아래 일반 방랑 로직으로 자연스럽게 이어짐
    }

    // ── 관성 방랑 이동 ──
    this.wanderTimer-=dt;
    if(this.wanderTimer<=0){
      // 새 방랑 목표: 플레이어 주변 랜덤 위치
      this.wanderTimer=1.2+Math.random()*2.0;
      this.wanderAngle+=0.4+(Math.random()-0.5)*1.2;
      const r=this.wanderRadius*(0.5+Math.random()*0.8);
      this.wanderX=player.x+Math.cos(this.wanderAngle)*r;
      this.wanderY=player.y+Math.sin(this.wanderAngle)*r;
    }
    // 스프링 + 댐핑 (관성)
    const dx=this.wanderX-this.x, dy=this.wanderY-this.y;
    const spring=4.5, damp=0.78;
    this.vx=(this.vx+dx*spring*dt)*damp;
    this.vy=(this.vy+dy*spring*dt)*damp;
    this.x+=this.vx;
    this.y+=this.vy;
    this.sparkles=this.sparkles.filter(s=>s.life>0);
    for(const s of this.sparkles){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt*2;}
    if(this.triggerFlash>0) this.triggerFlash-=dt*4;
    this.effectTimer-=dt;
    if(this.effectTimer>0) return false;
    this.effectTimer=this.baseInterval;
    return this._trigger(player,enemies,projectiles);
  }

  _trigger(player,enemies,projectiles){
    const PC=CONFIG.PET;
    switch(this.effect){
      case 'regen':
        if(!player._healBlocked){
          player.hp=Math.min(player.hp+(this.value||PC.REGEN_AMOUNT),player.maxHp);
          player._lawHealAccum = (player._lawHealAccum || 0) + (this.value||PC.REGEN_AMOUNT); // [UPDATE 2026-07-24] 흡수의 법칙 트리거용
          this._sparkle('#60ff60',6);this.triggerFlash=1;
        }
        return true;
      case 'confuse':{
        // [UPDATE 2026-07-11] pd.value=지속시간(초), confuseRangeMult 있으면 범위 내 여러 명 혼란(신신 원숭이)
        const alive=enemies.filter(e=>!e.dead);if(!alive.length)return false;
        const dur=this.value||PC.CONFUSE_DURATION;
        if(this.confuseRangeMult>1){
          const range=180*this.confuseRangeMult;
          const near=alive.filter(e=>Math.hypot(e.x-player.x,e.y-player.y)<range)
            .sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y)).slice(0,3);
          if(!near.length)return false;
          for(const e of near) e._confused=dur;
        } else {
          const t=alive[Math.floor(Math.random()*alive.length)];
          t._confused=dur;
        }
        this._sparkle('#8080ff',8);this.triggerFlash=1;return true;
      }
      case 'knockback':{
        const force=this.value||PC.KNOCKBACK_FORCE; // [UPDATE 2026-07-11] pd.value=넉백 세기(도깨비100/진신180)
        const alive=enemies.filter(e=>!e.dead&&Math.hypot(e.x-player.x,e.y-player.y)<PC.KNOCKBACK_RANGE);
        for(const e of alive){const a=Math.atan2(e.y-player.y,e.x-player.x);e.x+=Math.cos(a)*force;e.y+=Math.sin(a)*force;}
        if(alive.length){this._sparkle('#ff6020',10);this.triggerFlash=1;}
        return alive.length>0;
      }
      case 'mark':{
        // [UPDATE 2026-07-11] markCount=표식 대상 수(까마귀삼신1/사신3), value=받는피해 증가율
        const alive=enemies.filter(e=>!e.dead);if(!alive.length)return false;
        const sorted=alive.sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y));
        const mult=1+(this.value!=null?this.value:(PC.MARK_DAMAGE_MULT-1));
        for(const e of sorted.slice(0,this.markCount||1)){e._marked=PC.MARK_DURATION;e._markedDmgMult=mult;}
        this._sparkle('#ff40ff',8);this.triggerFlash=1;return true;
      }
      default:return false;
    }
  }

  _sparkle(color,count){
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2,spd=30+Math.random()*60;
      this.sparkles.push({x:this.x,y:this.y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,life:1.0,color});
    }
  }

  draw(ctx,camX,camY){
    const sx=this.x-camX,sy=this.y-camY+Math.sin(this.t*2.5)*3;
    const flash=0.15+this.triggerFlash*0.35;
    const grd=ctx.createRadialGradient(sx,sy,0,sx,sy,16);
    grd.addColorStop(0,this.color+'cc');grd.addColorStop(1,'transparent');
    ctx.save();ctx.globalAlpha=flash;ctx.fillStyle=grd;ctx.beginPath();ctx.arc(sx,sy,16,0,Math.PI*2);ctx.fill();ctx.restore();
    // 숨쉬기: sin파로 부드럽게 위아래
    const breathe = Math.sin(this.breatheT) * 1.8;
    ctx.save();
    ctx.translate(sx, sy + breathe);
    if(this.img&&this.img.complete&&this.img.naturalWidth>0&&this.sprCfg){
      const sc=this.sprCfg;
      ctx.drawImage(this.img, sc.offsetX, sc.offsetY, sc.drawW, sc.drawH);
    } else {
      ctx.font='14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(this.icon, 0, 0);  // translate 후엔 (0,0)
      ctx.textBaseline='alphabetic';ctx.textAlign='left';
    }
    ctx.restore();
    for(const s of this.sparkles){
      ctx.save();ctx.globalAlpha=s.life*0.8;ctx.fillStyle=s.color;
      const sr=Math.max(0.01,3*s.life);
      ctx.beginPath();ctx.arc(s.x-camX,s.y-camY,sr,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
}

// [UPDATE 2026-07-11] 펫 레벨 스케일링 (260711_MTOPC.md 4-7) — 그동안 강화해도 효과가 전혀 안 올랐던 버그 수정
// 연속값: Lv1(100%)~Lv5(130%), 레벨당 +7.5%p. 정수형(개수) 효과는 Lv1~4 고정, Lv5 도달 시에만 +1
function scalePetValue(pd, lv) {
  lv = Math.max(1, Math.min(5, lv || 1));
  // 상사화 부활횟수는 value 필드 자체가 정수형 개수
  if (pd.id === 'sangsahwa' && pd.effect === 'autoRevive') {
    return lv >= 5 ? pd.value + 1 : pd.value;
  }
  return pd.value * (1 + 0.30 * (lv - 1) / 4);
}
// 사신(뱀) markCount(표식 대상 수)처럼 value와 별개인 정수형 필드 스케일링
function scalePetIntField(base, lv) {
  lv = Math.max(1, Math.min(5, lv || 1));
  return lv >= 5 ? base + 1 : base;
}

function applyPetPassives(activePetData,player,weapons){
  for(const pd of activePetData){
    switch(pd.effect){
      case 'defense':    player._damageReduction=(player._damageReduction||0)+pd.value; break;
      // [UPDATE 2026-07-31] 🔥 스케일 불일치 수정 — 펫 데이터의 crit value는 0~1 비율(0.25 = 25%)인데
      // player._critChance는 0~100 백분율 스케일이다(weapons.js의 `Math.random()*100 < _critChance` 판정 기준,
      // 신목 PER_LV.critChance:5 · 선술 perLv:5 · 오행 금 +8 전부 백분율). 그대로 더하고 있어서
      // "치명타 확률 +25%"라고 적힌 펫이 실제로는 +0.25%p만 주고 있었음 — 100배 약하게 적용되던 버그.
      case 'crit':       player._critChance=(player._critChance||0)+pd.value*100; player._critMult=Math.max(player._critMult||1.5,1.8); break;
      case 'xp_boost':   player._xpMult=(player._xpMult||1)+pd.value; break;
      // [UPDATE 2026-07-06] 전용 필드(_cdrPet)에 누적 후 통합 재계산 — 스탯 픽이 펫 효과 덮어쓰는 버그 방지
      case 'cooldown':   player._cdrPet=(player._cdrPet||0)+pd.value; recalcCdReduction(player); break;
      // [UPDATE 2026-07-06] 시즌2 펫 효과
      case 'soulBoost':  player._soulMult=(player._soulMult||1)+pd.value; break;
      case 'autoRevive': player._autoReviveCharges=(player._autoReviveCharges||0)+pd.value; break;
      case 'magnet':     player.magnetRange=(player.magnetRange||CONFIG.ITEM.PASSIVE_MAGNET_RANGE)+pd.value*50; break;
      // [UPDATE 2026-07-11] 260711_MTOPC.md 4-3 십이지신 신규효과
      case 'goldBoost':    player._goldMult=(player._goldMult||1)+pd.value; break; // 미신(양)
      case 'specialBoost': player._specialMult=(player._specialMult||1)+pd.value; break; // 해신(돼지) — 특화 던전 재화 전용
      case 'compAtk':      player._compAtkMult=(player._compAtkMult||1)+pd.value; break; // 유신(닭)
      case 'compDef':      player._compDefMult=(player._compDefMult||0)+pd.value; break; // 자신(쥐) — 받는 피해 감소율(가산)
      case 'compHp':       player._compHpMult=(player._compHpMult||1)+pd.value; break; // 축신(소)
      // 강다리(술신) 자동수집: player 플래그 대신 PetEntity 본인이 직접 뛰어가서 줍는 전용 AI로 처리 (update() 참고)
    }
  }
}

function updateEnemyDebuffs(enemies,dt){
  for(const e of enemies){
    if(e._marked>0){e._marked-=dt;}else{e._markedDmgMult=1;}
    if(e._confused>0) e._confused-=dt;
  }
}
