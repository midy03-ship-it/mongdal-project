// items.js - 아이템 시스템
// GoldDrop: 자동 흡수 (XP처럼 단순하게)
// SpecialItem: 바닥 고정, 직접 밟아서 획득, 자석 무효

// ── 드롭 확률 (독립 판정) ──
const INDEPENDENT_DROP_RATES = { gold:40, magnet:0.5, bomb:0.4, potion:0.1, bigGold:0.3 };
function rollDrops(rewardMode) {
  const rates = { ...INDEPENDENT_DROP_RATES };
  if (rewardMode === 'infinite') {
    rates.bigGold = 3;    // 무한 던전: bigGold 추가 드랍 (골드는 유지)
  } else if (rewardMode) {
    rates.gold = 0;       // 특화 던전: 골드 드랍 차단
    rates.bigGold = 8;    // 특화 재화 드랍률 8%
  }
  const results = [];
  for (const [type, chance] of Object.entries(rates)) {
    if (Math.random() * 100 < chance) results.push(type);
  }
  return results;
}

// ══════════════════════════════
//  골드 드롭 (XP처럼 자동 흡수)
// ══════════════════════════════
class GoldDrop {
  constructor(x, y, value) {
    this.x = x; this.y = y;
    this.value = value;
    this.dead  = false;
    this.t     = Math.random() * Math.PI * 2;
    this.attractState = 'none';
  }

  magnetPull() { this.attractState = 'magnet'; }

  update(dt, px, py, playerMagnetRange) {
    this.t += dt * 2.5;
    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const range = playerMagnetRange || CONFIG.ITEM.GOLD_ATTRACT_RANGE;

    if (this.attractState === 'none' && dist < range) {
      this.attractState = 'passive';
    }

    if (this.attractState !== 'none') {
      const spd = this.attractState === 'magnet'
        ? CONFIG.ITEM.MAGNET_PULL_SPEED
        : Math.min(CONFIG.ITEM.NORMAL_PULL_SPEED_MAX, 150 + (1 - dist / 250) * 180);
      const move = spd * dt;
      if (dist <= move) { this.x = px; this.y = py; }
      else { this.x += (dx / dist) * move; this.y += (dy / dist) * move; }
    }

    if (dist < CONFIG.ITEM.ABSORB_DIST) this.dead = true;
  }

  draw(ctx, camX, camY) {
    const bob = Math.sin(this.t) * 2.5;
    const sx = this.x - camX, sy = this.y - camY + bob;
    const sc = SPRITES?.items?.gold;
    const img = sc ? SpriteLoader.get(sc.src) : null;

    // 발광
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(this.t) * 0.15;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
    g.addColorStop(0, 'rgba(255,210,50,.8)'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 12, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    if (img?.complete && img.naturalWidth > 0 && sc) {
      ctx.drawImage(img, sx - sc.drawW/2, sy - sc.drawH/2, sc.drawW, sc.drawH);
    }
    // 폴백 이모지 제거
  }
}

// ══════════════════════════════
//  대박 엽전 (500골드 확정)
// ══════════════════════════════
class BigGoldDrop {
  constructor(x, y, spriteKey) {
    this.x = x; this.y = y;
    this.value = 500;
    this.dead = false;
    this.t = Math.random() * Math.PI * 2;
    this.attractState = 'none';
    this.spriteKey = spriteKey || 'bigGold'; // 특화 던전용 커스텀 스프라이트
  }
  magnetPull() { this.attractState = 'magnet'; }
  update(dt, px, py, playerMagnetRange) {
    this.t += dt * 2;
    const dx = px-this.x, dy = py-this.y;
    const dist = Math.hypot(dx,dy)||0.001;
    const range = playerMagnetRange || CONFIG.ITEM.GOLD_ATTRACT_RANGE;
    if(this.attractState==='none'&&dist<range) this.attractState='passive';
    if(this.attractState!=='none'){
      const spd = this.attractState==='magnet'?CONFIG.ITEM.MAGNET_PULL_SPEED
        :Math.min(CONFIG.ITEM.NORMAL_PULL_SPEED_MAX,150+(1-dist/250)*200);
      const move=spd*dt;
      if(dist<=move){this.x=px;this.y=py;}
      else{this.x+=dx/dist*move;this.y+=dy/dist*move;}
    }
    if(dist<CONFIG.ITEM.ABSORB_DIST) this.dead=true;
  }
  draw(ctx, camX, camY) {
    const sx=this.x-camX, sy=this.y-camY+Math.sin(this.t*2)*3;
    const sc=SPRITES?.items?.[this.spriteKey];
    const img=sc?SpriteLoader.get(sc.src):null;
    // 발광 (재화 종류별 색)
    const glowColors = {
      bigGold:'rgba(255,180,0,0.5)', ganghwaseok:'rgba(192,224,255,0.5)',
      cheonunseok:'rgba(128,200,255,0.5)', cheonryeonggwa:'rgba(255,128,128,0.5)',
      taegeukseok:'rgba(96,224,192,0.5)', chaewonseok:'rgba(80,160,255,0.6)'
    };
    const glowColor = glowColors[this.spriteKey] || 'rgba(255,180,0,0.5)';
    const g=ctx.createRadialGradient(sx,sy,0,sx,sy,24);
    g.addColorStop(0,glowColor);g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,24,0,Math.PI*2);ctx.fill();
    if(img?.complete&&img.naturalWidth>0){
      ctx.drawImage(img,sx-14,sy-14,28,28);
    } else {
      const fallbackIcons = { ganghwaseok:'🔧', cheonunseok:'🪨', cheonryeonggwa:'🍑', taegeukseok:'💠', chaewonseok:'🔷' };
      ctx.font='20px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(fallbackIcons[this.spriteKey]||'💰',sx,sy);
    }
  }
}

// ══════════════════════════════
//  영혼 드랍 (시즌2 전용)
//  영혼 조각 / 영혼석 자동 흡수
// ══════════════════════════════
class SoulDrop {
  constructor(x, y, type) {
    // type: 'soulFragment'(조각) | 'soulStone'(영혼석)
    this.x = x; this.y = y;
    this.type = type;
    this.dead = false;
    this.t = Math.random() * Math.PI * 2;
    this.attractState = 'none';
  }
  magnetPull() { this.attractState = 'magnet'; }
  update(dt, px, py, playerMagnetRange) {
    this.t += dt * 3;
    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const range = playerMagnetRange || CONFIG.ITEM.XP_ATTRACT_RANGE;
    if (this.attractState === 'none' && dist < range) this.attractState = 'passive';
    if (this.attractState !== 'none') {
      const spd = this.attractState === 'magnet'
        ? CONFIG.ITEM.MAGNET_PULL_SPEED
        : Math.min(CONFIG.ITEM.NORMAL_PULL_SPEED_MAX, 120 + (1 - dist / 200) * 160);
      const move = spd * dt;
      if (dist <= move) { this.x = px; this.y = py; }
      else { this.x += (dx / dist) * move; this.y += (dy / dist) * move; }
    }
    if (dist < CONFIG.ITEM.ABSORB_DIST) this.dead = true;
  }
  draw(ctx, camX, camY) {
    const bob = Math.sin(this.t * 1.5) * 2;
    const sx = this.x - camX, sy = this.y - camY + bob;
    const isStone = this.type === 'soulStone';
    const r = isStone ? 9 : 5;
    const pulse = 0.6 + Math.sin(this.t * 2) * 0.2;
    // 외부 글로우
    ctx.save();
    ctx.globalAlpha = pulse * 0.5;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.5);
    g.addColorStop(0, isStone ? 'rgba(140,80,255,0.9)' : 'rgba(80,160,255,0.8)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // [UPDATE 2026-07-17] 도트 이미지가 있으면 이미지로, 없으면 기존 발광 원(도형) 폴백
    ctx.save();
    ctx.globalAlpha = pulse * 0.9;
    const sc = SPRITES?.items?.[isStone ? 'soulStones' : 'soulFragment'];
    const img = sc ? SpriteLoader.get(sc.src) : null;
    if (img?.complete && img.naturalWidth > 0) {
      ctx.shadowColor = isStone ? '#a040ff' : '#4090ff';
      ctx.shadowBlur = isStone ? 10 : 6;
      ctx.drawImage(img, sx - sc.drawW/2, sy - sc.drawH/2, sc.drawW, sc.drawH);
    } else {
      // 오브 본체
      ctx.shadowColor = isStone ? '#a040ff' : '#4090ff';
      ctx.shadowBlur = isStone ? 12 : 8;
      ctx.fillStyle = isStone ? '#c070ff' : '#60b0ff';
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
      // 내부 하이라이트
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = isStone ? '#e0b0ff' : '#a0d0ff';
      ctx.beginPath(); ctx.arc(sx - r * 0.3, sy - r * 0.3, r * 0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ══════════════════════════════
//  스페셜 아이템 (자석/폭탄/포션)
//  바닥 고정, 직접 밟아서 획득
// ══════════════════════════════
const SPECIAL_CONFIGS = {
  magnet: { icon: '🧲', color: '#e040c0', glow: 'rgba(220,64,180,.6)', label: '자석', lifetime: 12 },
  bomb:   { icon: '💣', color: '#e04020', glow: 'rgba(220,64,32,.6)',  label: '폭탄', lifetime: 12 },
  potion: { icon: '🧪', color: '#40d060', glow: 'rgba(64,200,80,.6)',  label: '포션', lifetime: 15 },
  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 3종 — 처치 시 0.5% 드랍, 밟으면 즉시 30초 변신
  card_dokkaebi: { icon: '👹', color: '#c05820', glow: 'rgba(192,88,32,.7)', label: '도깨비 카드', lifetime: 20 },
  card_gumiho:   { icon: '🦊', color: '#a04888', glow: 'rgba(160,72,136,.7)', label: '구미호 카드', lifetime: 20 },
  card_gogolgwi: { icon: '💀', color: '#888888', glow: 'rgba(160,160,160,.7)', label: '해골귀 카드', lifetime: 20 },
};

class SpecialItem {
  constructor(x, y, type) {
    this.x = x; this.y = y;
    this.type = type;
    this.dead = false;
    this.t    = Math.random() * Math.PI * 2;
    const cfg = SPECIAL_CONFIGS[type];
    this.pickupRadius = 22;
  }

  // 자석 효과 무효 (magnetPull 없음)

  update(dt, px, py) {
    this.t += dt * 2;
    const dist = Math.hypot(px - this.x, py - this.y);
    const attractRange = 60;
    if (dist < attractRange && dist > 36) {
      const speed = 180;
      this.x += (px - this.x) / dist * speed * dt;
      this.y += (py - this.y) / dist * speed * dt;
    }
    if (dist < 36) this.dead = true;
  }

  draw(ctx, camX, camY) {
    const sx = this.x - camX, sy = this.y - camY;
    const cfg = SPECIAL_CONFIGS[this.type];
    if (!cfg) return;

    const pulse = 0.5 + Math.sin(this.t * 3) * 0.3;
    const r = 16;

    // 수명 경고 (3초 이하 남으면 깜빡임)
    if (this.lifetime < 3 && Math.floor(this.t * 4) % 2 === 0) return;

    // 발광 링
    ctx.save();
    ctx.globalAlpha = pulse * 0.6;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2);
    g.addColorStop(0, cfg.glow); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(sx, sy, r * 2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 아이콘 배경 원
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.arc(sx, sy, r * 0.9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // 도트 이미지 or 이모지 폴백
    const itemSprKey = { magnet:'magnet', bomb:'bomb', potion:'potion' }[this.type];
    const isc = itemSprKey ? SPRITES?.items?.[itemSprKey] : null;
    const iimg = isc ? SpriteLoader.get(isc.src) : null;
    if (iimg?.complete && iimg.naturalWidth > 0 && isc) {
      ctx.drawImage(iimg, sx - isc.drawW/2, sy - isc.drawH/2, isc.drawW, isc.drawH);
    }
    // 폴백/라벨 텍스트 모두 제거
  }
}

// ══════════════════════════════
//  XP 오브 (기존 유지)
// ══════════════════════════════
class XpOrb {
  constructor(x, y, value) {
    this.x = x; this.y = y;
    this.value = value;
    this.dead  = false;
    this.attractState = 'none';
    this.t = Math.random() * Math.PI * 2;
  }

  magnetPull() { this.attractState = 'magnet'; }

  update(dt, px, py, playerMagnetRange) {
    this.t += dt * 3;
    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const range = playerMagnetRange || CONFIG.ITEM.XP_ATTRACT_RANGE;

    if (this.attractState === 'none' && dist < range) this.attractState = 'passive';

    if (this.attractState !== 'none') {
      const spd = this.attractState === 'magnet'
        ? CONFIG.ITEM.MAGNET_PULL_SPEED
        : Math.min(CONFIG.ITEM.NORMAL_PULL_SPEED_MAX, 150 + (1 - dist / 250) * 200);
      const move = spd * dt;
      if (dist <= move) { this.x = px; this.y = py; }
      else { this.x += (dx / dist) * move; this.y += (dy / dist) * move; }
    }
    if (dist < CONFIG.ITEM.ABSORB_DIST) this.dead = true;
  }

  draw(ctx, camX, camY) {
    const sx = this.x - camX, sy = this.y - camY + Math.sin(this.t) * 3;
    const r = Math.max(2, 5 + this.value * 0.5);
    // 발광
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r*2);
    g.addColorStop(0,'rgba(120,220,255,0.5)'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r*2,0,Math.PI*2); ctx.fill();

    const _xpKey = this.value>=10?'xp_flame':this.value>=4?'xp_crystal':'xp_orb';
    const sc = SPRITES?.items?.[_xpKey];
    const img = sc ? SpriteLoader.get(sc.src) : null;
    if (img?.complete && img.naturalWidth > 0 && sc) {
      const _xpSize = this.value>=10?28:this.value>=4?24:18;
      ctx.drawImage(img, sx-_xpSize/2, sy-_xpSize/2, _xpSize, _xpSize);
    } else {
      ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fillStyle='#80e0ff'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath();
      ctx.arc(sx-r*0.3,sy-r*0.3,Math.max(0.1,r*0.35),0,Math.PI*2); ctx.fill();
    }
  }
}

// ══════════════════════════════
//  드롭 생성
// ══════════════════════════════
function createDrops(x, y, enemyXp, enemyGold, rewardMode) {
  const types = rollDrops(rewardMode);
  const drops = { gold: [], special: [], xp: true };
  // 특화 던전이면 해당 재화 스프라이트, 무한/일반은 bigGold
  const isSpecial = rewardMode && rewardMode !== 'bossrush' && rewardMode !== 'infinite';
  const bigGoldSprite = isSpecial ? rewardMode : 'bigGold';
  for (const type of types) {
    if (type === 'gold') {
      const base = enemyGold || CONFIG.ITEM.GOLD_DROP_MIN;
      const max  = base + (CONFIG.ITEM.GOLD_DROP_MAX - CONFIG.ITEM.GOLD_DROP_MIN);
      const amt  = Math.floor(base + Math.random() * (max - base + 1));
      drops.gold.push(new GoldDrop(x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 20, amt));
    } else if (type === 'bigGold') {
      drops.bigGold = drops.bigGold || [];
      drops.bigGold.push(new BigGoldDrop(x + (Math.random()-0.5)*20, y + (Math.random()-0.5)*20, bigGoldSprite));
    } else {
      drops.special.push(new SpecialItem(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, type));
    }
  }
  return drops;
}

// ══════════════════════════════
//  아이템 효과 적용
// ══════════════════════════════
function applyItemEffect(item, player, enemies, saveData, xpOrbs, goldDrops) {
  if (item instanceof GoldDrop) {
    const _gMult = (window.gameDifficulty==='easy' ? 0.7 : window.gameDifficulty==='hard' ? 1.5 : 1.0) * (player._goldMult||1.0);
    const _gained = Math.max(1, Math.floor(item.value * _gMult));
    saveData.gold = (saveData.gold || 0) + _gained;
    if(typeof window.earnedGold !== 'undefined') window.earnedGold += _gained;
    Save.save(saveData);
    showFloatingText(item.x, item.y, `+${_gained}`, '#f0c040');
    return;
  }

  if (item instanceof SpecialItem) {
    switch (item.type) {
      case 'magnet':
        for (const o of xpOrbs)   o.magnetPull();
        for (const d of goldDrops) d.magnetPull();
        showFloatingText(item.x, item.y, '🧲', '#e040c0');
        break;
      case 'bomb': {
        const dmg = Math.floor(player.totalAtk * CONFIG.ITEM.BOMB_DAMAGE_MULT);
        for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
        if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.2));
        showFloatingText(item.x, item.y, '💣', '#e04020');
        spawnBombEffect(item.x, item.y);
        break;
      }
      case 'potion':
        if (!player._healBlocked) {
          player.hp = Math.min(player.hp + CONFIG.ITEM.POTION_HEAL, player.maxHp);
          showFloatingText(item.x, item.y, `+${CONFIG.ITEM.POTION_HEAL}❤️`, '#40d060');
        } else {
          showFloatingText(item.x, item.y, '💀회복 불가', '#9060d0');
        }
        break;
      // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 — 실제 변신 처리는 game.js 훅에 위임(전투루프 상태 필요)
      case 'card_dokkaebi': case 'card_gumiho': case 'card_gogolgwi':
        if (typeof window !== 'undefined' && typeof window._onTransformCardPickup === 'function')
          window._onTransformCardPickup(item.type.replace('card_',''));
        showFloatingText(item.x, item.y, SPECIAL_CONFIGS[item.type].icon, SPECIAL_CONFIGS[item.type].color);
        break;
    }
  }
}

// ══════════════════════════════
//  플로팅 텍스트 / 폭탄 이펙트
// ══════════════════════════════
const _floatingTexts = [];
function showFloatingText(x, y, text, color) { _floatingTexts.push({ x, y, text, color, t: 0 }); }
function updateFloatingTexts(dt) { for (const f of _floatingTexts) f.t += dt; return _floatingTexts.filter(f => f.t < 1.0); }
function drawFloatingTexts(ctx, camX, camY, texts) {
  for (const f of texts) {
    ctx.save(); ctx.globalAlpha = 1 - f.t;
    ctx.font = 'bold 13px sans-serif'; ctx.fillStyle = f.color; ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x - camX, f.y - camY - f.t * 40);
    ctx.restore();
  }
  ctx.textAlign = 'left';
}

const _bombEffects = [];
function spawnBombEffect(x, y) { _bombEffects.push({ x, y, t: 0 }); }
function updateBombEffects(dt) { for (const b of _bombEffects) b.t += dt; return _bombEffects.filter(b => b.t < 0.6); }
function drawBombEffects(ctx, camX, camY, effects) {
  for (const b of effects) {
    const sx = b.x - camX, sy = b.y - camY, r = b.t * 300;
    ctx.save(); ctx.globalAlpha = Math.max(0, 0.6 - b.t);
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#ff8020'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
