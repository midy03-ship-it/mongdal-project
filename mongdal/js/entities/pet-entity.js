// pet-entity.js - 펫 시스템 (CONFIG 기반)
class PetEntity {
  constructor(data, slotIdx) {
    this.id=data.id; this.name=data.name; this.icon=data.icon;
    this.color=data.color; this.effect=data.effect; this.value=data.value;
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
      jeoseung_nabi:'jeoseung_nabi',sangsahwa:'sangsahwa'}; // [UPDATE 2026-07-06] 시즌2 펫
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

  update(dt,player,enemies,projectiles){
    this.t+=dt;
    this.breatheT+=dt*1.3;

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
          this._sparkle('#60ff60',6);this.triggerFlash=1;
        }
        return true;
      case 'confuse':{
        const alive=enemies.filter(e=>!e.dead);if(!alive.length)return false;
        const t=alive[Math.floor(Math.random()*alive.length)];
        t._confused=PC.CONFUSE_DURATION;
        this._sparkle('#8080ff',8);this.triggerFlash=1;return true;
      }
      case 'knockback':{
        const alive=enemies.filter(e=>!e.dead&&Math.hypot(e.x-player.x,e.y-player.y)<PC.KNOCKBACK_RANGE);
        for(const e of alive){const a=Math.atan2(e.y-player.y,e.x-player.x);e.x+=Math.cos(a)*PC.KNOCKBACK_FORCE;e.y+=Math.sin(a)*PC.KNOCKBACK_FORCE;}
        if(alive.length){this._sparkle('#ff6020',10);this.triggerFlash=1;}
        return alive.length>0;
      }
      case 'mark':{
        const alive=enemies.filter(e=>!e.dead);if(!alive.length)return false;
        const sorted=alive.sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y));
        for(const e of sorted.slice(0,3)){e._marked=PC.MARK_DURATION;e._markedDmgMult=PC.MARK_DAMAGE_MULT;}
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

function applyPetPassives(activePetData,player,weapons){
  for(const pd of activePetData){
    switch(pd.effect){
      case 'defense':    player._damageReduction=(player._damageReduction||0)+pd.value; break;
      case 'crit':       player._critChance=(player._critChance||0)+pd.value; player._critMult=Math.max(player._critMult||1.5,1.8); break;
      case 'xp_boost':   player._xpMult=(player._xpMult||1)+pd.value; break;
      // [UPDATE 2026-07-06] 전용 필드(_cdrPet)에 누적 후 통합 재계산 — 스탯 픽이 펫 효과 덮어쓰는 버그 방지
      case 'cooldown':   player._cdrPet=(player._cdrPet||0)+pd.value; recalcCdReduction(player); break;
      // [UPDATE 2026-07-06] 시즌2 펫 효과
      case 'soulBoost':  player._soulMult=(player._soulMult||1)+pd.value; break;
      case 'autoRevive': player._autoReviveCharges=(player._autoReviveCharges||0)+pd.value; break;
      case 'magnet':     player.magnetRange=(player.magnetRange||CONFIG.ITEM.PASSIVE_MAGNET_RANGE)+pd.value*50; break;
    }
  }
}

function updateEnemyDebuffs(enemies,dt){
  for(const e of enemies){
    if(e._marked>0){e._marked-=dt;}else{e._markedDmgMult=1;}
    if(e._confused>0) e._confused-=dt;
  }
}
