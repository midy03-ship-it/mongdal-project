// game.js - 메인 전투 씬 (아이템 드롭 + 스탯 시스템 통합)
const GameScene = (() => {
  let canvas, ctx, rafId, lastTime = 0;
  let state = 'playing';
  let player, companions, enemies, projectiles, xpOrbs, bgOrbs, weapons;
  // [UPDATE 2026-07-26] 히든 시너지 배치3용 프레임 누적 상태 (회전 포메이션/궤도) — 스테이지 진입마다 리셋
  let _gaonMugsaSpinAngle = 0, _soheeOrbitAngle = 0, _aramDanbiBickerT = 0;
  // [UPDATE 2026-07-26] 히든 시너지 배치4 — 카메오 난입(사신진/저승총출동) 상태. 스테이지 진입마다 리셋
  let _cameoState = [];
  // [UPDATE 2026-07-17] 시즌4(귀허계) 과거 잔상 시스템 — enemies와 별개 배열로 관리(충돌판정/타겟팅 완전 배제)
  let afterimages = [];
  let _afterimageSpawnTimer = 3;
  window.earnedGold = 0;
  window.earnedSpecial = 0;
  window.earnedSpecialtyCount = 0; // [UPDATE 2026-07-19] 보물 창고 특산품 — 이번 런에서 획득한 개수(스테이지당 시즌 1종류만 존재)
  window.earnedSpecialtyId = null;
  let _rewardMode = null;
  let _pendingEnding = false; // 시즌 1 최초 클리어 시 엔딩 씬으로 이동 // null=normal, 'ganghwaseok','cheonunseok','cheonryeonggwa','taegeukseok','bossrush'
  let _pendingEnding2 = false; // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌 2 최초 클리어 시 엔딩 씬으로 이동
  let _pendingEnding3 = false; // [UPDATE 2026-07-17] 시즌 3 최초 클리어 시 엔딩 씬으로 이동
  let _pendingEnding4 = false; // [UPDATE 2026-07-17] 시즌 4 최초 클리어 시 엔딩 씬으로 이동
  let _pendingEnding5 = false; // [UPDATE 2026-07-22] 시즌 5 최초 클리어 시 엔딩 씬으로 이동
  let _pendingEnding6 = false; // [UPDATE 2026-07-31] 시즌 6 최초 클리어 시 엔딩 씬으로 이동
  let _pendingEnding7 = false; // [UPDATE 2026-07-31] 시즌 7 최초 클리어 시 엔딩 씬으로 이동
  let _pendingEnding8 = false; // [UPDATE 2026-08-02] 시즌 8(황계, 최종) 최초 클리어 시 엔딩 씬으로 이동
  // [UPDATE 2026-07-15] 260715_MTOPC.md 4/9번: 혼돈석/순리석 던전 신설 — rollDrops()는 rewardMode truthy만 체크하므로 코드 변경 없이 그대로 작동
  const SPECIAL_REWARD_KEYS = { ganghwaseok:1, cheonunseok:1, cheonryeonggwa:1, taegeukseok:1, chaewonseok:1, hondonseok:1, sullriseok:1 };
  const SPECIAL_ICONS = { ganghwaseok:'🔧', cheonunseok:'🪨', cheonryeonggwa:'🍑', taegeukseok:'💠', bossrush:'💎', chaewonseok:'🔷', hondonseok:'🌪️', sullriseok:'🌊' };
  // [UPDATE 2026-07-18] 해금 마일스톤 스테이지 — 클리어 시 로비를 거쳐야 하는 스테이지 목록.
  // stage-select.js의 UNLOCK_PENDING_STAGE_IDS(5,10,15,20,25,30,100,110,160,200) + 시즌 클리어 스테이지(1,300,400).
  // 이 외의 보스 스테이지(40,50,60...)는 "다음 스테이지"로 바로 이어질 수 있음.
  // [UPDATE 2026-07-19] 자동재도전으로 같은 마일스톤 스테이지를 반복 파밍해도 매번 로비로 튕기던 문제 수정 —
  // 시즌 엔딩과 직결된 100/200/300/400은 항상 강제(엔딩 라우팅 안전 우선), 나머지(건물/동료 해금 안내)는
  // 최초 클리어일 때만 강제하도록 두 목록으로 분리.
  // [UPDATE 2026-07-31] 시즌6·7 엔딩 스테이지(600/700) 누락 — 시즌5까지만 등록돼 있어서
  // 원계·어계를 클리어해도 로비로 강제 복귀하지 않아 엔딩 연출로 이어지지 않을 수 있었음
  const LOBBY_CHANGE_STAGES_ALWAYS = [100,200,300,400,500,600,700,800];
  const LOBBY_CHANGE_STAGES_FIRST_ONLY = [1,5,10,15,20,25,30,110,160];
  const LOBBY_CHANGE_STAGES = [...LOBBY_CHANGE_STAGES_ALWAYS, ...LOBBY_CHANGE_STAGES_FIRST_ONLY];
  // [UPDATE 2026-07-19] 보물 창고 특산품 — 하드 난이도 스토리 스테이지 전용 드랍. 현재 스테이지가 속한 시즌의 특산품 id 반환
  // [UPDATE 2026-07-31] 시즌5~7이 계속 null이라 s5_immortalbreath / s6_lawproof / s7_unknown 세 종류가
  // 데이터·아이콘·효과까지 다 갖춰놓고도 영영 드랍되지 않고 있었음. 작성 당시엔 "콘텐츠 없는 시즌5+"가 맞았지만
  // 시즌5는 7/24, 시즌6은 7/29, 시즌7은 오늘 공개되면서 조건이 낡은 채로 남아 있던 것.
  // 시즌8(스테이지 701~800)은 아직 스테이지 자체가 없지만, 같은 누락을 반복하지 않도록 미리 넣어둔다.
  function _getSeasonSpecialtyId(sid) {
    if (sid >= 1   && sid <= 100) return 's1_soulwill';
    if (sid >= 101 && sid <= 200) return 's2_reincycle';
    if (sid >= 201 && sid <= 300) return 's3_fatetrick';
    if (sid >= 301 && sid <= 400) return 's4_providence';
    if (sid >= 401 && sid <= 500) return 's5_immortalbreath';
    if (sid >= 501 && sid <= 600) return 's6_lawproof';
    if (sid >= 601 && sid <= 700) return 's7_unknown';
    if (sid >= 701 && sid <= 800) return 's8_fatechoice';
    return null;
  }
  // [UPDATE 2026-07-19] 최적화: enemies.filter().sort()[0] 패턴(현혹 타겟팅/저승낫 바운스 유도)이
  // 매 프레임 O(n log n) 정렬+배열 할당을 발생시켜 적이 많을 때 렉의 주요 원인이었음 —
  // 어차피 최솟값 1개만 쓰므로 단일 순회 O(n)로 대체 (결과는 기존과 동일)
  function _findNearestEnemy(x, y, excludeFn) {
    let best = null, bestDist = Infinity;
    for (const e of enemies) {
      if (e.dead || (excludeFn && excludeFn(e))) continue;
      const d = Math.hypot(e.x - x, e.y - y);
      if (d < bestDist) { bestDist = d; best = e; }
    }
    return best;
  }
  // [UPDATE 2026-07-22] 선술 스킬트리 준필살기/필살기 자동시전 — 선택한 가지(quick/fire/bind/ward) 하나만 활성화.
  // 전부 기존 보조무기(도깨비불/번개장판/저주인형/정화소금/현혹부적) 이펙트를 화면 규모로 재활용, 신규 이미지 없음.
  function _updateSeonsulAbilities(dt) {
    const trees = player._seonsulTrees || [];
    if (!trees.length) return;

    // 명부낙인 — 낙인 찍힌 대상들 지연 후 동시 소멸 (포박 가지 전용, 어느 나무 슬롯이든 가지는 유일함)
    // [UPDATE 2026-07-23] dmgMult는 캐스트 시점의 레벨로 이미 스케일된 값을 _seonsulMarkedDmgMult에 저장해뒀다가 그대로 사용
    if (player._seonsulMarkedT != null) {
      player._seonsulMarkedT -= dt;
      if (player._seonsulMarkedT <= 0) {
        const dmg = Math.floor(player.totalAtk * (player._seonsulMarkedDmgMult || 6.0));
        for (const e of (player._seonsulMarkedEnemies || [])) if (e && !e.dead) e.takeDamage(dmg);
        player._seonsulMarkedEnemies = null;
        player._seonsulMarkedT = null;
      }
    }

    // 모래 어둠 — 암전 진행 중 정점에서 1회 폭딜 (결계 가지 전용)
    if (player._seonsulFlashT != null) {
      player._seonsulFlashT -= dt;
      if (!player._seonsulFlashDealt && player._seonsulFlashT <= player._seonsulFlashPeakAt) {
        player._seonsulFlashDealt = true;
        const dmg = Math.floor(player.totalAtk * (player._seonsulFlashMult || 1));
        for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
        if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.3));
      }
      if (player._seonsulFlashT <= 0) player._seonsulFlashT = null;
    }

    // [UPDATE 2026-07-23] 나무 여러 그루 + 레벨제 준필살기/필살기 — 레벨에 맞게 스케일된 설정으로 매번 재계산
    for (const t of trees) {
      const br = CONFIG.SEONSUL.PATHS[t.path].BRANCHES[t.branch];
      if (t.subLv > 0) {
        t.subT -= dt;
        if (t.subT <= 0) {
          const subCfg = CONFIG.seonsulAbilityAtLv(br.sub, t.subLv);
          t.subT = subCfg.interval;
          _castSeonsulAbility(t.branch, subCfg, false);
        }
      }
      if (t.finalLv > 0) {
        t.finalT -= dt;
        if (t.finalT <= 0) {
          const finalCfg = CONFIG.seonsulAbilityAtLv(br.final, t.finalLv);
          t.finalT = finalCfg.interval;
          _castSeonsulAbility(t.branch, finalCfg, true);
        }
      }
    }
  }

  // [UPDATE 2026-07-24] 시즌6(원계) 법칙 시스템 — 패시브·조건형(보유만 하면 상시 판정) +
  // 액티브(장착 슬롯만, 일반형은 선술과 동일한 주기 자동시전 / 조건형은 이벤트 트리거).
  function _updateLawEffects(dt) {
    if (!player._lawPassiveConditional?.length && !player._lawEquipped?.length) {
      player._lawDmgMult = 1; player._lawDefBonus = 0;
      return;
    }
    let dmgMult = 1, defBonus = 0;

    for (const lp of (player._lawPassiveConditional || [])) {
      const { id, def, lv } = lp;
      if (id === 'law_stillness') {
        player._lawStillT = player.isMoving ? 0 : (player._lawStillT || 0) + dt;
        if (player._lawStillT >= lawValueAtLv(def.stillSec, lv)) dmgMult *= 1 + lawValueAtLv(def.dmgMult, lv) / 100;
      } else if (id === 'law_sprint') {
        player._lawMoveT = player.isMoving ? (player._lawMoveT || 0) + dt : 0;
        const bonus = Math.min(lawValueAtLv(def.cap, lv), player._lawMoveT * lawValueAtLv(def.ratePerSec, lv));
        dmgMult *= 1 + bonus / 100;
      } else if (id === 'law_reflection') {
        if ((player._lawHitCount || 0) >= lawValueAtLv(def.hitThreshold, lv)) {
          const dmg = Math.floor(player.totalAtk * lawValueAtLv(def.reflectPct, lv) / 100);
          for (const e of enemies) if (!e.dead && Math.hypot(e.x-player.x, e.y-player.y) < 200) e.takeDamage(dmg);
          player._lawHitCount = 0;
        }
      } else if (id === 'law_absorption') {
        if ((player._lawHealAccum || 0) >= lawValueAtLv(def.healThreshold, lv)) {
          const dmg = Math.floor(player.totalAtk * lawValueAtLv(def.burstMult, lv));
          for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
          if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.3));
          player._lawHealAccum = 0;
        }
      } else if (id === 'law_endurance') {
        if (player.hp < player.maxHp * (def.hpBelowPct / 100)) defBonus += lawValueAtLv(def.defBonus, lv);
      } else if (id === 'law_excess') {
        if (player.hp >= player.maxHp) dmgMult *= 1 + lawValueAtLv(def.atkBonus, lv) / 100;
      }
    }

    for (const le of (player._lawEquipped || [])) {
      const { id, def, lv } = le;
      if (def.kind === 'plain') {
        if (le.t == null) le.t = CONFIG.seonsulAbilityAtLv(def, lv).interval;
        le.t -= dt;
        if (le.t <= 0) {
          const cfg = CONFIG.seonsulAbilityAtLv(def, lv);
          le.t = cfg.interval;
          _castLawAbility(id, cfg);
        }
      } else if (id === 'law_judgment') {
        if ((player._lawKillAccum || 0) >= lawValueAtLv(def.killThreshold, lv)) {
          const dmg = Math.floor(player.totalAtk * lawValueAtLv(def.dmgMult, lv));
          for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
          if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.3));
          player._lawKillAccum = 0;
          showFloatingText(player.x, player.y - 40, '⚖️심판의 법칙', '#e0a860');
          _spawnLawBurstEffect('law_judgment', 0.7);
        }
      } else if (id === 'law_ruin') {
        if (le.t == null) le.t = 0;
        le.t -= dt;
        const pct = lawValueAtLv(def.hpBelowPct, lv);
        if (player.hp <= player.maxHp * (pct / 100) && le.t <= 0) {
          const dmg = Math.floor(player.totalAtk * lawValueAtLv(def.dmgMult, lv));
          for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
          if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.3));
          le.t = lawValueAtLv(def.cooldown, lv);
          showFloatingText(player.x, player.y - 40, '💀파멸의 법칙', '#e0a860');
          _spawnLawBurstEffect('law_ruin', 0.7);
        }
      } else if (id === 'law_karma') {
        if ((player._lawDmgTakenAccum || 0) >= lawValueAtLv(def.dmgThreshold, lv)) {
          const dmg = Math.floor(player.totalAtk * lawValueAtLv(def.returnMult, lv));
          for (const e of enemies) if (!e.dead && Math.hypot(e.x-player.x, e.y-player.y) < 250) e.takeDamage(dmg);
          player._lawDmgTakenAccum = 0;
          showFloatingText(player.x, player.y - 40, '🔄인과응보의 법칙', '#e0a860');
          _spawnLawBurstEffect('law_karma', 0.7);
        }
      } else if (id === 'law_reversal') {
        if (le.t == null) le.t = Math.max(8, def.interval + (lv - 1) * def.perLvInterval);
        le.t -= dt;
        if (le.t <= 0) {
          le.t = Math.max(8, def.interval + (lv - 1) * def.perLvInterval);
          if (player._lawLastKillX != null) {
            const dmg = Math.floor(player.totalAtk * lawValueAtLv(def.dmgMult, lv));
            for (const e of enemies) if (!e.dead && Math.hypot(e.x-player._lawLastKillX, e.y-player._lawLastKillY) < 120) e.takeDamage(dmg);
            // [UPDATE 2026-07-28] 역행의 법칙은 유일하게 텍스트/이펙트가 전혀 없었음 — 다른 법칙들과 동일하게 추가
            showFloatingText(player._lawLastKillX, player._lawLastKillY - 40, '⏳역행의 법칙', '#e0a860');
            _spawnLawBurstEffect('law_reversal', 0.7);
          }
        }
      } else if (id === 'law_throne') {
        // [UPDATE 2026-07-24] 별도 "보스 전용 데미지" 필드는 실제로 어디서도 곱해지지 않는 죽은 필드가 될 위험이 있어서
        // (pierceAll과 같은 재발 패턴) 공용 dmgMult에 바로 합류시킴 — 보스 존재 시에만 전체 데미지 상승으로 대체 적용
        if (window._boss && !window._boss.dead) {
          dmgMult *= 1 + lawValueAtLv(def.bossDmgMultPct, lv) / 100;
          // [UPDATE 2026-07-28] 왕좌의 법칙은 상시 패시브라 딱히 "발동 순간"이 없었음 — 보스와 조우하는 순간에 한 번만 연출
          if (!player._lawThroneTriggered) {
            player._lawThroneTriggered = true;
            showFloatingText(player.x, player.y - 40, '👑왕좌의 법칙', '#ffe0a0');
            _spawnLawBurstEffect('law_throne', 0.7);
          }
        } else {
          player._lawThroneTriggered = false;
        }
      } else if (id === 'law_origin') {
        dmgMult *= 1 + lawValueAtLv(def.atkPct, lv) / 100;
        if (le.t == null) le.t = Math.max(8, def.interval + (lv - 1) * def.perLvInterval);
        le.t -= dt;
        if (le.t <= 0) {
          le.t = Math.max(8, def.interval + (lv - 1) * def.perLvInterval);
          const dmg = Math.floor(player.totalAtk * lawValueAtLv(def.dmgMult, lv));
          for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
          if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.4));
          showFloatingText(player.x, player.y - 40, '🌟태초의 법칙', '#ffe0a0');
          _spawnLawBurstEffect('law_origin', 0.9); // 시그니처답게 조금 더 오래 보여줌
        }
      }
    }

    player._lawDmgMult = dmgMult;
    player._lawDefBonus = defBonus;
  }

  // [UPDATE 2026-07-25] 법칙 액티브 6종 화면급 이펙트 — 기존 장판형 무기 텍스처를 law_ 접두사로 복사해 독립 사용.
  // _lawFieldEffects(오염/붕괴): 매우 낮은 알파로 화면 전체 크기까지 확대되며 3번 깜빡. _lawGravityEffects(중력): 위아래로 점점
  // 길어지며 페이드아웃. player._lawFlashT(절규): 화면 흰색 플래시. _lawDistortT/_lawDistortPatches(왜곡): 화면흔들림 +
  // 0.5초간 화면 군데군데 볼록렌즈 왜곡(캔버스 자기 자신을 확대 샘플링).
  let _lawFieldEffects = [];
  let _lawGravityEffects = [];
  let _lawDistortT = 0;
  let _lawDistortPatches = [];
  // [UPDATE 2026-07-28] 절규/왜곡(주기형) + 조건형 액티브 6종 전용 "발동 순간 한 번 뿜어져 나오는" 범용 버스트 이펙트.
  // 기존 field/gravity처럼 전용 연출을 새로 짤 필요 없이, 플레이어 위치에서 작게 시작해 커지며 페이드아웃하는 공용 애니메이션.
  let _lawBurstEffects = [];

  function _spawnLawFieldEffect(key, dur) { _lawFieldEffects.push({ key, t: 0, dur }); }
  function _spawnLawGravityEffect(dur) { _lawGravityEffects.push({ t: 0, dur }); }
  function _spawnLawBurstEffect(key, dur) { _lawBurstEffects.push({ key, t: 0, dur: dur || 0.6 }); }

  function _updateLawVisualEffects(dt) {
    for (const e of _lawFieldEffects) e.t += dt;
    _lawFieldEffects = _lawFieldEffects.filter(e => e.t < e.dur);
    for (const e of _lawGravityEffects) e.t += dt;
    _lawGravityEffects = _lawGravityEffects.filter(e => e.t < e.dur);
    for (const e of _lawBurstEffects) e.t += dt;
    _lawBurstEffects = _lawBurstEffects.filter(e => e.t < e.dur);
    if (player._lawFlashT > 0) player._lawFlashT = Math.max(0, player._lawFlashT - dt);
    if (_lawDistortT > 0) _lawDistortT = Math.max(0, _lawDistortT - dt);
  }

  // 조건형 액티브 6종 + 절규/왜곡 — 플레이어 머리 위에서 작게 시작해 커지며 페이드아웃하는 공용 버스트 연출
  function _drawLawBurstEffects(ctx, camX, camY) {
    for (const e of _lawBurstEffects) {
      const sc = SPRITES?.effects?.[e.key];
      const img = sc ? SpriteLoader.get(sc.src) : null;
      if (!(img?.complete && img.naturalWidth > 0)) continue;
      const p = Math.min(1, e.t / e.dur);
      const scale = 0.7 + p * 1.3;
      const alpha = Math.max(0, 1 - p);
      const sx = player.x - camX, sy = player.y - camY - 30;
      const w = sc.drawW * scale, h = sc.drawH * scale;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, sx - w / 2, sy - h / 2, w, h);
      ctx.restore();
    }
  }

  // 오염/붕괴 — 플레이어 중심, 매우 투명하게(알파 낮음) 화면을 덮을 크기까지 확대되며 3번 깜빡(사인파 절대값 3봉우리)
  function _drawLawFieldEffects(ctx, camX, camY) {
    for (const e of _lawFieldEffects) {
      const sc = SPRITES?.effects?.[e.key];
      const img = sc ? SpriteLoader.get(sc.src) : null;
      if (!(img?.complete && img.naturalWidth > 0)) continue;
      const p = Math.min(1, e.t / e.dur);
      const blink = Math.abs(Math.sin(p * 3 * Math.PI));
      const targetW = (canvas.width / zoom) * 1.4;
      const w = sc.drawW * 2 + (targetW - sc.drawW * 2) * p;
      const h = w * (sc.drawH / sc.drawW);
      const sx = player.x - camX, sy = player.y - camY;
      ctx.save();
      ctx.globalAlpha = 0.3 * blink;
      ctx.drawImage(img, sx - w / 2, sy - h / 2, w, h);
      ctx.restore();
    }
    for (const e of _lawGravityEffects) {
      const sc = SPRITES?.effects?.law_gravity;
      const img = sc ? SpriteLoader.get(sc.src) : null;
      if (!(img?.complete && img.naturalWidth > 0)) continue;
      const p = Math.min(1, e.t / e.dur);
      const w = sc.drawW * 1.6;
      const h = sc.drawH * 1.4 + p * 840; // [UPDATE 2026-07-25] 위아래로 점점 길어짐 — 기존 420에서 2배로 확대
      const alpha = Math.max(0, 1 - p) * 0.6;
      const sx = player.x - camX, sy = player.y - camY;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, sx - w / 2, sy - h / 2, w, h);
      ctx.restore();
    }
  }

  // 절규 화면 플래시 + 왜곡 렌즈 패치 — 줌 영향 안 받는 화면 좌표 기준(render()의 ctx.restore() 이후에서 호출)
  function _drawLawScreenEffects(ctx, W, H) {
    if (player._lawFlashT > 0) {
      const a = Math.min(1, player._lawFlashT / 0.4) * 0.45;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore();
    }
    if (_lawDistortT > 0 && _lawDistortPatches.length) {
      for (const pt of _lawDistortPatches) {
        const r = pt.r;
        ctx.save();
        ctx.beginPath(); ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2); ctx.clip();
        const srcR = r / 1.35; // 원본보다 작은 영역을 확대 샘플링 → 볼록렌즈처럼 보임
        ctx.drawImage(canvas, pt.x - srcR, pt.y - srcR, srcR * 2, srcR * 2, pt.x - r, pt.y - r, r * 2, r * 2);
        ctx.restore();
      }
    }
  }

  // [UPDATE 2026-07-26] 히든 시너지: 사신진(청아+백호+수호+봉황 중 3/4) 결집 시 화면 테두리에 은은하게 맥동하는 사신 문양 테두리
  function _drawSamsinBorderEffect(ctx, W, H) {
    if (!player._samsinTrinityActive) return;
    const pulse = 0.25 + Math.sin(Date.now() * 0.0015) * 0.12;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = '#a0c8ff';
    ctx.lineWidth = 10;
    ctx.shadowColor = '#a0c8ff';
    ctx.shadowBlur = 20;
    ctx.strokeRect(5, 5, W - 10, H - 10);
    ctx.restore();
  }

  // [UPDATE 2026-07-26] 히든 시너지 발견 토스트 — weapons.js의 showTrinityToast와 같은 DOM 오버레이 패턴,
  // 다만 어떤 조합/효과인지는 절대 밝히지 않고 "발견했다"는 사실과 개수만 알려줌(스포일러 방지)
  // [UPDATE 2026-08-02] 황계 첫 진입 시 오염도 자각 토스트 — 어계 엔딩(SLIDES_S7)이 이미 "짊어진 오염"을
  // 서사로 예고하지만, 엔딩을 넘기는 유저가 많아 실제로 스탯이 깎인다는 걸 전혀 모른 채 701에서 막히는 문제 대응.
  // 세이브당 1회만(ruinedCorruptionRevealSeen), 축복(오염도) 보유량이 0보다 클 때만 노출.
  function _showRuinedCorruptionToast(bl, multPct) {
    const isEn = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'en' : false;
    const el = document.createElement('div');
    el.innerHTML = isEn
      ? `<div style="font-size:15px;font-weight:800;color:#ffb0c0;margin-bottom:6px;">😱 The Blessing... became poison?!</div>
         <div style="font-size:12px;line-height:1.6;">Corruption held: <b style="color:#e0b8ff;">${bl}</b> → combat power <b style="color:#ff9ab0;">${multPct}%</b>.<br>Challenging any Ruined Realm stage purifies it — win or lose.</div>`
      : `<div style="font-size:15px;font-weight:800;color:#ffb0c0;margin-bottom:6px;">😱 축복이... 독이 된건가?!</div>
         <div style="font-size:12px;line-height:1.6;">보유 오염도 <b style="color:#e0b8ff;">${bl}</b> → 전투력 <b style="color:#ff9ab0;">${multPct}%</b>.<br>황계 어느 스테이지든 도전하면(승패 무관) 정화된다.</div>`;
    el.style.cssText = `position:fixed;left:50%;top:20%;transform:translateX(-50%);width:min(88vw,340px);
      background:rgba(20,8,16,0.94);border:1px solid #ff8a9a;color:#fff;text-align:center;
      padding:14px 18px;border-radius:12px;z-index:10000;pointer-events:none;opacity:0;
      box-shadow:0 0 24px rgba(255,90,110,0.25);transition:opacity .4s ease;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 6000);
  }

  // [UPDATE 2026-08-05] 파트2 "수호 부적" 첫 진입 안내 — 세이브당 1회만, 새로운 방어 메커니즘(파괴 시 패배)을
  // 아무 설명 없이 접하고 당황하는 일이 없도록. 톤은 _showRuinedCorruptionToast()와 통일.
  function _showTalismanTutorialToast() {
    const isEn = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'en' : false;
    const el = document.createElement('div');
    el.innerHTML = isEn
      ? `<div style="font-size:15px;font-weight:800;color:#ffd0dc;margin-bottom:6px;">📜 The Guardian Talisman</div>
         <div style="font-size:12px;line-height:1.6;">Aegissi's last trace stands where you began. Some enemies will
         ignore you and attack it instead — if it falls, it's over.<br>If it's off-screen, check the 📹 monitor
         in the corner. Strengthen it at the blacksmith.</div>`
      : `<div style="font-size:15px;font-weight:800;color:#ffd0dc;margin-bottom:6px;">📜 수호 부적</div>
         <div style="font-size:12px;line-height:1.6;">애기씨가 남긴 마지막 흔적이 시작 지점에 서 있다. 일부 몬스터는
         플레이어 대신 저것부터 노린다 — 파괴되면 그걸로 끝이다.<br>화면 밖으로 나가면 구석의 📹 화면으로 상태를
         확인할 수 있다. 대장간에서 강화할 수 있다.</div>`;
    el.style.cssText = `position:fixed;left:50%;top:20%;transform:translateX(-50%);width:min(88vw,340px);
      background:rgba(20,8,16,0.94);border:1px solid #ff9ab0;color:#fff;text-align:center;
      padding:14px 18px;border-radius:12px;z-index:10000;pointer-events:none;opacity:0;
      box-shadow:0 0 24px rgba(255,120,150,0.25);transition:opacity .4s ease;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 7500);
  }

  // [UPDATE 2026-08-05] 부적 HP 30% 이하로 처음 떨어지는 순간 세이브 아님, "스테이지당 1회" 경고 —
  // CCTV/튜토리얼로 존재는 알려도 "지금 위험하다"는 긴급 신호가 없어서 화면 밖에서 조용히 파괴당할 수 있었음.
  function _showTalismanLowHpToast() {
    const isEn = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'en' : false;
    const el = document.createElement('div');
    el.textContent = isEn ? '⚠️ The Guardian Talisman is in danger!' : '⚠️ 수호 부적이 위험하다!';
    el.style.cssText = `position:fixed;left:50%;top:16%;transform:translateX(-50%);
      background:rgba(40,6,10,0.92);border:1px solid #ff4050;color:#ffb0b8;
      padding:10px 20px;border-radius:10px;font-size:14px;font-weight:800;letter-spacing:.03em;
      z-index:10000;pointer-events:none;opacity:0;transition:opacity .3s ease;
      box-shadow:0 0 20px rgba(255,40,50,0.35);`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3000);
  }

  // [UPDATE 2026-08-05] 부적 피격 데미지 적용 공통 처리(근접/원거리 두 곳에서 재사용) — 무적/흔들림/저HP경고를
  // 한 곳에서만 관리해 두 경로가 따로 놀지 않게 함.
  function _applyTalismanDamage(dmg) {
    if (!talisman || talisman.hp <= 0) return;
    talisman.hp = Math.max(0, talisman.hp - dmg);
    talisman._iframe = 2.0;
    talisman._shakeT = 0.3;
    const pct = talisman.maxHp > 0 ? talisman.hp / talisman.maxHp : 0;
    if (pct <= 0.3 && pct > 0 && !talisman._lowHpWarned) {
      talisman._lowHpWarned = true;
      _showTalismanLowHpToast();
    }
  }

  // [UPDATE 2026-08-06] 파트2 보스 침공 타겟팅 — 보스는 기본적으로 부적을 노리다가,
  // 플레이어가 근접하면(BOSS_AGGRO_PLAYER_RANGE 이내) 그 순간만 플레이어로 옮겨감. 소환된 잡몹은
  // _invasionType 플래그로 기존 침공형 로직(대시/스파클/절반데미지)을 그대로 재사용.
  // boss.js는 update(dt, player, enemies)에서 넘겨받은 target 객체의 .x/.y/.takeDamage()만 쓰므로,
  // 부적 좌표 + 부적용 takeDamage를 가진 가짜 target을 넘기면 boss.js 내부는 전혀 안 건드려도 됨.
  const BOSS_AGGRO_PLAYER_RANGE = 180;
  function _resolveBossTarget(bossObj) {
    if (!talisman || talisman.hp <= 0) return player;
    const distToPlayer = Math.hypot(player.x - bossObj.x, player.y - bossObj.y);
    if (distToPlayer <= BOSS_AGGRO_PLAYER_RANGE) return player;
    return {
      x: talisman.x, y: talisman.y,
      takeDamage: (dmg) => { if ((talisman._iframe || 0) <= 0) _applyTalismanDamage(dmg * 0.5); },
      _controlReversed: 0, // boss.js가 참조는 하지만 부적 대상일 땐 의미 없는 값 — 버려짐
    };
  }

  // [UPDATE 2026-08-06] "건방진!" 인레이지 시퀀스 — boss.js 상태머신은 전혀 건드리지 않고, 이 함수가 활성인
  // 동안(boss._enrage != null)에는 game.js가 boss.x/y를 직접 조작하며 진행. 끝나면 boss._enrage=null로
  // 돌아가고 다음 프레임부터 정상적으로 boss.update()가 다시 패턴 로테이션을 이어감.
  // 넉백 데미지·번개 데미지 수치는 첫 반영치라 밸런스 미확정 — 플레이해보고 조정 필요.
  function _updateBossEnrage(boss, dt) {
    // 시퀀스 도중 보스가 죽으면(플레이어 공격) 즉시 정리하고 boss.js의 정상 update()로 되돌려줘야
    // deathT(사망 연출 타이머)가 멈추지 않음 — 안 그러면 사망 처리가 영원히 안 끝나는 소프트락 위험.
    if (boss.dead) { boss._enrage = null; boss._invisible = false; return; }
    const st = boss._enrage;
    st.t += dt;
    const _strike = () => {
      const a = Math.random() * Math.PI * 2;
      boss.x = talisman.x + Math.cos(a) * 50;
      boss.y = talisman.y + Math.sin(a) * 50;
      boss._invisible = false;
      const dmg = Math.max(1, Math.floor(boss.dmg * 1.5));
      _applyTalismanDamage(dmg); // 연속 2타 연출이 목적이라 일부러 무적틱(_iframe) 체크 없이 강제 적용
      screenShake = Math.max(screenShake, 4.5); // [UPDATE 2026-08-06] 보스의 분노 — 더 강하게 흔들림
      // [UPDATE 2026-08-06] "와자자장창창창" — 번개 한 발이 아니라 여러 발이 살짝 어긋난 위치/각도/타이밍으로
      // 동시다발 낙뢰해서, 정갈한 한 방이 아니라 분노에 찬 난사처럼 보이게.
      if (window._hitEffects) {
        const boltCount = 4;
        for (let i = 0; i < boltCount; i++) {
          window._hitEffects.push({
            x: talisman.x + (Math.random()-0.5)*70,
            y: talisman.y + (Math.random()-0.5)*30,
            t: -Math.random()*0.1, life: 0.3 + Math.random()*0.15,
            key: '_blackLightning', ox: 0, oy: 0,
            ang: (Math.random()-0.5)*0.5,
          });
        }
      }
    };
    switch (st.phase) {
      case 'shout':
        if (st.t >= 0.6) { st.phase = 'knockback'; st.t = 0; }
        break;
      case 'knockback':
        if (!st.done) {
          st.done = true;
          const dx = player.x - boss.x, dy = player.y - boss.y, d = Math.hypot(dx, dy) || 1;
          player.x += (dx / d) * 200;
          player.y += (dy / d) * 200;
          player.takeDamage(Math.max(1, Math.floor(boss.dmg * 0.3)));
          screenShake = Math.max(screenShake, 2.5);
          if (window._hitEffects) window._hitEffects.push({ x: boss.x, y: boss.y, t: 0, life: 0.4, key: '_bossShockwave', ox: 0, oy: 0 });
        }
        if (st.t >= 0.3) { st.phase = 'approach'; st.t = 0; delete st.done; }
        break;
      case 'approach': {
        if (talisman) boss._moveToward(dt, talisman.x, talisman.y, boss.baseSpd * 1.4);
        const distToTal = talisman ? Math.hypot(talisman.x - boss.x, talisman.y - boss.y) : 999;
        if (!talisman || talisman.hp <= 0) { boss._enrage = null; break; } // 그 사이 부적이 파괴됐으면 중단
        if (distToTal < 70 || st.t >= 2.5) { st.phase = 'vanish1'; st.t = 0; }
        break;
      }
      case 'vanish1':
        boss._invisible = true;
        if (st.t >= 0.25) { st.phase = 'strike1'; st.t = 0; }
        break;
      case 'strike1':
        if (!st.done) { st.done = true; if (talisman && talisman.hp > 0) _strike(); }
        if (st.t >= 0.35) { st.phase = 'vanish2'; st.t = 0; delete st.done; }
        break;
      case 'vanish2':
        boss._invisible = true;
        if (st.t >= 0.25) { st.phase = 'strike2'; st.t = 0; }
        break;
      case 'strike2':
        if (!st.done) { st.done = true; if (talisman && talisman.hp > 0) _strike(); }
        if (st.t >= 0.35) {
          boss._enrage = null;
          boss._invisible = false;
          boss.state = 'idle';
          boss.stateTimer = boss.curPhase.interval;
        }
        break;
      default:
        boss._enrage = null; boss._invisible = false;
    }
  }

  function _showHiddenSynergyToast(count) {
    const isEn = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'en' : false;
    const el = document.createElement('div');
    el.textContent = isEn
      ? `🔮 Hidden Synergy Discovered! (+${count})`
      : `🔮 숨겨진 시너지 발견! (+${count})`;
    el.style.cssText = `position:fixed;left:50%;top:16%;transform:translateX(-50%);
      background:rgba(20,10,30,0.92);border:1px solid #c090ff;color:#d8b0ff;
      padding:10px 20px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:.05em;
      z-index:10000;pointer-events:none;opacity:0;transition:opacity .3s ease;`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2400);
  }

  function _castLawAbility(id, cfg) {
    const dmgBase = player.totalAtk;
    if (id === 'law_corruption') {
      const dmg = Math.floor(dmgBase * (cfg.dot / 10));
      for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
      if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.3));
      showFloatingText(player.x, player.y - 40, '☣️오염의 법칙', '#78c8a0');
      _spawnLawFieldEffect('law_corruption', 1.6);
    } else if (id === 'law_collapse') {
      const dmg = Math.floor(dmgBase * cfg.dmgMult);
      for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
      if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.3));
      showFloatingText(player.x, player.y - 40, '💥붕괴의 법칙', '#e0a860');
      _spawnLawFieldEffect('law_collapse', 1.6);
    } else if (id === 'law_gravity') {
      const dmg = Math.floor(dmgBase * cfg.dmgMult);
      for (const e of enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x-player.x, e.y-player.y);
        if (d > cfg.pullRadius) continue;
        const ang = Math.atan2(player.y-e.y, player.x-e.x);
        e.x += Math.cos(ang) * 30; e.y += Math.sin(ang) * 30;
        e.takeDamage(dmg);
      }
      showFloatingText(player.x, player.y - 40, '🌌중력의 법칙', '#a8b8e8');
      _spawnLawGravityEffect(1.0);
    } else if (id === 'law_scream') {
      for (const e of enemies) if (!e.dead) e._stunned = Math.max(e._stunned || 0, cfg.stunDur);
      if (window._boss && !window._boss.dead) window._boss._stunned = Math.max(window._boss._stunned || 0, cfg.stunDur * 0.5);
      showFloatingText(player.x, player.y - 40, '😱절규의 법칙', '#e0a860');
      player._lawFlashT = 0.4;
      _spawnLawBurstEffect('law_scream', 0.7);
    } else if (id === 'law_extinction') {
      for (const e of enemies) {
        if (e.dead || e.hp > e.maxHp * (cfg.hpThresholdPct / 100)) continue;
        if (window._hitEffects) window._hitEffects.push({ x: e.x, y: e.y, t: 0, life: 0.4, key: 'law_extinction', ox: 0, oy: -8 });
        e.takeDamage(99999);
      }
      showFloatingText(player.x, player.y - 40, '☠️소멸의 법칙', '#78c8a0');
    } else if (id === 'law_distortion') {
      const dmg = Math.floor(dmgBase * cfg.dmgMult);
      const stunDur = Math.min(1.2, cfg.slowPct / 100); // [UPDATE 2026-07-24] 별도 slow 시스템이 없어 짧은 기절로 대체
      for (const e of enemies) if (!e.dead) { e.takeDamage(dmg); e._stunned = Math.max(e._stunned || 0, stunDur); }
      showFloatingText(player.x, player.y - 40, '🌀왜곡의 법칙', '#e0a860');
      screenShake = Math.max(screenShake, 2.2);
      _spawnLawBurstEffect('law_distortion', 0.7);
      _lawDistortT = 0.5;
      _lawDistortPatches = [];
      for (let i = 0; i < 5; i++) {
        _lawDistortPatches.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.7,
          y: canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.7,
          r: 35 + Math.random() * 35,
        });
      }
    }
  }

  function _castSeonsulAbility(branch, cfg, isFinal) {
    const dmgBase = player.totalAtk;
    if (branch === 'quick') {
      const dmg = Math.floor(dmgBase * cfg.dmgMult);
      if (isFinal) {
        // [UPDATE 2026-07-24] 필살기는 한번에 몰아치지 않고 화면 전체에 파바바박 흩뿌리듯 순차 발동(_updateSeonsulLightningQueue가 처리)
        const spreadDur = 1.4;
        for (let i = 0; i < cfg.strikes; i++) {
          _seonsulLightningQueue.push({ delay: (i / cfg.strikes) * spreadDur + Math.random() * 0.05, dmg, radius: cfg.radius });
        }
        showFloatingText(player.x, player.y - 40, '⚡벼락술!', '#f0d060');
      } else {
        // 뇌성벽력 — 변경 없음: 적 위치 기준 무작위 지점에 연쇄 낙뢰
        const targets = enemies.filter(e => !e.dead);
        for (let i = 0; i < cfg.strikes; i++) {
          const t = targets.length ? targets[Math.floor(Math.random() * targets.length)] : null;
          const sx = t ? t.x : player.x + (Math.random() - 0.5) * 400;
          const sy = t ? t.y : player.y + (Math.random() - 0.5) * 400;
          for (const e of enemies) if (!e.dead && Math.hypot(e.x - sx, e.y - sy) <= cfg.radius) e.takeDamage(dmg);
          if (window._boss && !window._boss.dead && Math.hypot(window._boss.x - sx, window._boss.y - sy) <= cfg.radius) window._boss.takeDamage(Math.floor(dmg * 0.3));
          _spawnSeonsulEffect('seonsul_lightning', sx, sy - 60, 0.35, { scale0:1.3, scale1:0.85 });
        }
        showFloatingText(player.x, player.y - 40, '🌩️뇌성벽력', '#f0d060');
      }
    } else if (branch === 'fire') {
      // 독안개 전역화/화염술 — 화면 전체 적에게 도트총량 즉시 적용
      const dmg = Math.floor(dmgBase * (cfg.dot / 10) * cfg.dur);
      for (const e of enemies) if (!e.dead) e.takeDamage(dmg);
      if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.3));
      showFloatingText(player.x, player.y - 40, isFinal ? '🔥화염술!' : '🌫️독안개', '#e86838');
      // [UPDATE 2026-07-24] 주인공 주위를 도는 연출 — 준필 2바퀴(크기 고정), 필살기 4바퀴(점점 커지며 2줄기)
      // [UPDATE 2026-07-24] 반경 더 확대 + 회전 중심을 발밑(player.y)에서 20px 위(몸통 높이)로 보정 +
      // 필살기는 반경도 같이 커져서(radius0→radius1) 칼이 커지며 밖으로 뻗어나가는 느낌(몸쪽으로 파고드는 느낌 제거)
      if (isFinal) {
        _spawnSeonsulEffect('seonsul_fire', 0, 0, cfg.dur, { scale0:1.0, scale1:2.2, orbit:{ radius0:120, radius1:260, loops:4, count:2, centerYOffset:-20 } });
      } else {
        _spawnSeonsulEffect('seonsul_fire', 0, 0, cfg.dur, { scale0:1.0, scale1:1.15, orbit:{ radius:200, loops:2, count:1, centerYOffset:-20 } });
      }
    } else if (branch === 'bind') {
      if (!isFinal) {
        // 현혹부적 대혼란 — 화면 전체 적 매혹 (평소 sealing_amulet의 동시 2명 제한 우회)
        for (const e of enemies) if (!e.dead && !e.isBoss) e._charmed = cfg.charmDur;
        showFloatingText(player.x, player.y - 40, '🔏대혼란!', '#a070c0');
      } else {
        // 명부낙인 — 낙인 후 지연 동시 소멸. 낙인 찍힌 적마다 표식 이펙트가 따라다님
        player._seonsulMarkedEnemies = enemies.filter(e => !e.dead);
        if (window._boss && !window._boss.dead) player._seonsulMarkedEnemies.push(window._boss);
        player._seonsulMarkedT = cfg.markDelay;
        player._seonsulMarkedDmgMult = cfg.dmgMult;
        for (const e of player._seonsulMarkedEnemies) {
          _spawnSeonsulEffect('seonsul_mark', 0, 0, cfg.markDelay, { scale0:0.7, scale1:0.7, follow:e });
        }
        showFloatingText(player.x, player.y - 40, '💀명부낙인', '#a070c0');
      }
    } else if (branch === 'ward') {
      if (!isFinal) {
        // 모래 어둠 — 화면 암전 시작(render()에서 오버레이 그림), 정점에서 폭딜
        player._seonsulFlashT = cfg.flashDur;
        player._seonsulFlashPeakAt = cfg.flashDur * 0.4;
        player._seonsulFlashDealt = false;
        player._seonsulFlashMult = cfg.dmgMult;
        showFloatingText(player.x, player.y - 40, '🌑어둠...', '#68a8a0');
      } else {
        // 정화 — 즉시 광역딜 + 기절. 소금 세례 느낌으로 화면 곳곳에 여러 번 흩뿌림
        const dmg = Math.floor(dmgBase * cfg.dmgMult);
        for (const e of enemies) if (!e.dead) { e.takeDamage(dmg); e._stunned = Math.max(e._stunned || 0, cfg.stunDur); }
        if (window._boss && !window._boss.dead) window._boss.takeDamage(Math.floor(dmg * 0.3));
        showFloatingText(player.x, player.y - 40, '🧂정화!', '#68a8a0');
        for (let i = 0; i < 7; i++) {
          const px = player.x + (Math.random() - 0.5) * 500;
          const py = player.y + (Math.random() - 0.5) * 500;
          _spawnSeonsulEffect('seonsul_purify', px, py, 0.5 + Math.random()*0.3, { scale0:0.6, scale1:1.1 });
        }
      }
    }
  }

  // [UPDATE 2026-07-23] 선술 필살기 전용 스프라이트 이펙트 — 그동안 전부 범용 spawnBombEffect(펑) 하나만
  // 재활용하던 걸 가지별로 실제 구분되는 그림으로 교체. { key, x,y, t, dur, scale0,scale1, follow(적 추적용) }
  let _seonsulEffects = [];
  function _spawnSeonsulEffect(key, x, y, dur, opts) {
    opts = opts || {};
    _seonsulEffects.push({ key, x, y, t:0, dur, scale0: opts.scale0!=null?opts.scale0:1, scale1: opts.scale1!=null?opts.scale1:1, follow: opts.follow||null, orbit: opts.orbit||null });
  }
  function _updateSeonsulEffects(dt) {
    if (!_seonsulEffects.length) return;
    for (const e of _seonsulEffects) e.t += dt;
    _seonsulEffects = _seonsulEffects.filter(e => e.t < e.dur && (!e.follow || !e.follow.dead));
  }
  function _drawSeonsulEffects(ctx, camX, camY) {
    for (const e of _seonsulEffects) {
      const sc = SPRITES?.effects?.[e.key];
      const img = sc ? SpriteLoader.get(sc.src) : null;
      if (!(img?.complete && img.naturalWidth > 0)) continue;
      const p = Math.min(1, e.t / e.dur);
      const scale = e.scale0 + (e.scale1 - e.scale0) * p;
      // [UPDATE 2026-07-24] orbit — 주인공 주위를 지정 바퀴 수만큼 회전하는 연출(화염 준필/필살기)
      // radius0→radius1이 있으면 회전하며 반경도 같이 커져서(칼이 커지며 밖으로 뻗어나가는 느낌), 몸쪽으로 파고드는 느낌을 없앰
      // centerYOffset — 발밑 기준 좌표(player.y)에서 위로 올려 몸통 높이에서 도는 것처럼 보정
      if (e.orbit) {
        const count = e.orbit.count || 1;
        const radius = e.orbit.radius0 != null ? e.orbit.radius0 + (e.orbit.radius1 - e.orbit.radius0) * p : e.orbit.radius;
        const cy0 = player.y + (e.orbit.centerYOffset || 0);
        for (let i = 0; i < count; i++) {
          const angle = p * e.orbit.loops * Math.PI * 2 + (i / count) * Math.PI * 2;
          const ex = player.x + Math.cos(angle) * radius, ey = cy0 + Math.sin(angle) * radius;
          const sx = ex - camX, sy = ey - camY;
          const w = sc.drawW * scale, h = sc.drawH * scale;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - p * 0.3);
          ctx.translate(sx, sy);
          ctx.rotate(angle + Math.PI / 2);
          ctx.drawImage(img, -w/2, -h/2, w, h);
          ctx.restore();
        }
        continue;
      }
      const ex = e.follow ? e.follow.x : e.x, ey = e.follow ? e.follow.y : e.y;
      const sx = ex - camX, sy = ey - camY;
      const w = sc.drawW * scale, h = sc.drawH * scale;
      ctx.save();
      ctx.globalAlpha = e.follow ? 0.85 : Math.max(0, 1 - p);
      ctx.drawImage(img, sx - w/2, sy - h/2, w, h);
      ctx.restore();
    }
  }

  // [UPDATE 2026-07-24] 벼락술(필살기) 전용 — 한번에 몰아치지 않고 화면 곳곳에 순차적으로 파바바박 낙뢰가 떨어지는 큐
  let _seonsulLightningQueue = [];
  function _updateSeonsulLightningQueue(dt) {
    if (!_seonsulLightningQueue.length) return;
    for (const q of _seonsulLightningQueue) q.delay -= dt;
    while (_seonsulLightningQueue.length && _seonsulLightningQueue[0].delay <= 0) {
      const q = _seonsulLightningQueue.shift();
      const targets = enemies.filter(e => !e.dead);
      const t = targets.length ? targets[Math.floor(Math.random() * targets.length)] : null;
      const sx = t ? t.x + (Math.random() - 0.5) * 60 : player.x + (Math.random() - 0.5) * 500;
      const sy = t ? t.y + (Math.random() - 0.5) * 60 : player.y + (Math.random() - 0.5) * 500;
      for (const e of enemies) if (!e.dead && Math.hypot(e.x - sx, e.y - sy) <= q.radius) e.takeDamage(q.dmg);
      if (window._boss && !window._boss.dead && Math.hypot(window._boss.x - sx, window._boss.y - sy) <= q.radius) window._boss.takeDamage(Math.floor(q.dmg * 0.3));
      _spawnSeonsulEffect('seonsul_lightning', sx, sy - 60, 0.35, { scale0:1.3, scale1:0.85 });
    }
  }

  let bigGoldDrops = [];
  let goldDrops = [], specialItems = [], enemyProjs = [], hitEffects = [], floatingTexts = [], bombEffects = [];
  let petEntities = [], activePetData = [];
  let boss = null;
  // [UPDATE 2026-08-03] 파트2 "수호 부적" 지킬 오브젝트 — 파트2 프로필의 일반 스테이지에서만 생성됨.
  // { x,y,hp,maxHp } — 침공형 몬스터(spawner.js가 스폰 시 e._invasionType=true로 표시)가 플레이어 대신 이걸 노림.
  let talisman = null;
  // [UPDATE 2026-08-05] 부적 파괴 연출용 — null이면 연출 중 아님. state='talismanBreak'일 때만 흐름.
  let _talismanDeathT = null;
  const TALISMAN_BREAK_DURATION = 1.6; // 카메라 이동+페이드아웃 총 재생시간(초)
  // [UPDATE 2026-08-05] 스테이지 시작 카메라 스윕(부적 위치 안내) 타이밍 — elapsed 기준(스테이지 진입 시 0부터 시작)
  const TALISMAN_INTRO_HOLD = 0.5; // 부적 위치에서 정지
  const TALISMAN_INTRO_PAN  = 0.9; // 플레이어 쪽으로 이동
  let rushBosses = [];      // 보스 러쉬 전용: 동시 다중 보스 배열
  let rushNextSpawnAt = 0;  // 보스 러쉬: 다음 보스 소환 시각(elapsed 기준)
  const BOSS_RUSH_INTERVAL = 30; // 보스 러쉬: 보스 스폰 간격(초), 이전 보스 생사 무관하게 항상 소환
  let stageId, isBossStage, bossType, currentChapter = 1;
  let gameMode = 'normal'; // normal | infinite | boss_rush
  let difficulty = 'easy'; // easy | normal | hard
  let _s2Debuff = false;   // 시즌2 차원석 없을 때 잠식 디버프
  let _s2CwsDrainTimer = 0; // 시즌2 차원석 시간 소모 타이머 (60초마다 2개 차감)
  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번①: 도깨비주사위 — 시즌3 스테이지 입장 시 1회 랜덤 롤
  let _dokkaebiDiceResult = null;
  const DOKKAEBI_DICE_TABLE = [
    { roll:1, icon:'💀', textKo:'저주 — 받는피해 +15%',         textEn:'Curse — Damage Taken +15%',
      apply: p => { p._diceDmgTakenMult = (p._diceDmgTakenMult||0) + 0.15; } },
    { roll:2, icon:'📉', textKo:'쇠약 — 공격력 -10%',            textEn:'Weakness — ATK -10%',
      apply: p => { p._diceAtkMult = (p._diceAtkMult||1) - 0.10; } },
    { roll:3, icon:'🌀', textKo:'꽝 — 아무 일도 없었다',          textEn:'Nothing — Nothing happens',
      apply: () => {} },
    { roll:4, icon:'💨', textKo:'날쌤 — 이동속도 +10%',          textEn:'Swift — Move Speed +10%',
      apply: p => { p.tempStats.mov += 10; } },
    { roll:5, icon:'🪙', textKo:'재물운 — 골드 획득량 +20%',      textEn:'Fortune — Gold Gain +20%',
      apply: p => { p._goldMult = (p._goldMult||1) * 1.2; } },
    { roll:6, icon:'🎇', textKo:'대박 — 공격력 +20%, 받는피해 -10%', textEn:'Jackpot — ATK +20%, Damage Taken -10%',
      apply: p => { p._diceAtkMult = (p._diceAtkMult||1) + 0.20; p._diceDmgTakenMult = (p._diceDmgTakenMult||0) - 0.10; } },
  ];
  function _rollDokkaebiDice(p) {
    const entry = DOKKAEBI_DICE_TABLE[Math.floor(Math.random() * 6)];
    entry.apply(p);
    return entry;
  }

  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 3종 — 즉시 발동, 30초 지속, 재드랍 쿨다운 없음
  let _transformType = null, _transformTimer = 0, _transformAtkCd = 0;
  const TRANSFORM_DURATION = 30;
  window._onTransformCardPickup = (type) => {
    _transformType = type;
    _transformTimer = TRANSFORM_DURATION;
    _transformAtkCd = 0;
    const sc = SPRITES?.transformPlayer?.[type];
    if (sc && player) { player.img = SpriteLoader.get(sc.src); player.spriteW=sc.drawW; player.spriteH=sc.drawH; player.spriteOX=sc.offsetX; player.spriteOY=sc.offsetY; }
  };
  function _revertTransform() {
    _transformType = null;
    if (player) {
      const sc = Player.getSpriteConfig();
      player.img = SpriteLoader.get(sc.src); player.spriteW=sc.drawW; player.spriteH=sc.drawH; player.spriteOX=sc.offsetX; player.spriteOY=sc.offsetY;
    }
  }
  // 변신 중 전투 로직 — 기존 무기는 그대로 두고(디자인 문서상 "즉시 사용" 강조라 별도 무기 해제 로직 없이 보너스 공격으로 얹음),
  // 카드별 전용 공격 패턴을 추가로 발동시켜 변신의 존재감을 살림
  function _updateTransform(dt, aliveList) {
    if (!_transformType) return;
    _transformTimer -= dt;
    if (_transformTimer <= 0) { _revertTransform(); return; }
    _transformAtkCd -= dt;
    if (_transformType === 'dokkaebi') {
      // 근접 강타(넉백 큰 광역): 1.2초마다 반경 90 내 전체 타격 + 큰 넉백
      if (_transformAtkCd <= 0) {
        _transformAtkCd = 1.2;
        const dmg = Math.floor(player.totalAtk * 2.5);
        const hit = aliveList.filter(e => Math.hypot(e.x-player.x,e.y-player.y) < 90);
        for (const e of hit) {
          e.takeDamage(dmg, false, 'transform_dokkaebi');
          const a = Math.atan2(e.y-player.y, e.x-player.x);
          e.x += Math.cos(a)*120; e.y += Math.sin(a)*120;
        }
        if (hit.length && window._hitEffects) window._hitEffects.push({x:player.x,y:player.y,t:0,life:0.3,key:'hit_explode',ox:0,oy:-8});
      }
    } else if (_transformType === 'gumiho') {
      // 원거리 화염구 연사: 0.4초마다 가장 가까운 적에게 관통 화염구 1발
      if (_transformAtkCd <= 0) {
        _transformAtkCd = 0.4;
        let nearest=null, nd=Infinity;
        for (const e of aliveList) { const d=Math.hypot(e.x-player.x,e.y-player.y); if(d<nd){nd=d;nearest=e;} }
        if (nearest) {
          const dist = nd||1;
          projectiles.push(new Projectile(
            player.x, player.y, (nearest.x-player.x)/dist*380, (nearest.y-player.y)/dist*380,
            Math.floor(player.totalAtk*0.6),
            { radius:10, pierce:2, life:1.5, type:'transform_gumiho', color:'#c060e0', glow:'rgba(192,96,224,.5)' }
          ));
        }
      }
    } else if (_transformType === 'gogolgwi') {
      // 빠른 이속 + 다중 히트 근접: 0.35초마다 반경 55 내 전체 타격(약한 개별 데미지, 높은 히트빈도)
      if (_transformAtkCd <= 0) {
        _transformAtkCd = 0.35;
        const dmg = Math.floor(player.totalAtk * 0.7);
        const hit = aliveList.filter(e => Math.hypot(e.x-player.x,e.y-player.y) < 55);
        for (const e of hit) e.takeDamage(dmg, false, 'transform_gogolgwi');
        if (hit.length && window._hitEffects) window._hitEffects.push({x:player.x,y:player.y,t:0,life:0.2,key:'hit_normal',ox:0,oy:-8});
      }
    }
  }

  // [UPDATE 2026-07-17] 260714/260715_MTOPC.md 8번: 시즌4(귀허계) 과거 잔상 시스템.
  // 시즌1~3 몬스터 잔상이 화면에 깜빡이며 떠돌다가(충돌판정 없음), 2체가 반경60 안에서 5초 이상 머무르면
  // 서로에게 수렴하며 합체 연출(1.2초) 후 "현재 챕터(시즌4) 몬스터"로 실체화(스탯×1.8, 순리석 확정드랍).
  // enemies와 별개 배열(afterimages)로 관리해서 무기 타겟팅/충돌판정 코드를 전혀 안 건드려도 자동으로 안전함.
  function _spawnAfterimage() {
    const ang = Math.random()*Math.PI*2, dist = 220+Math.random()*160;
    const x = player.x+Math.cos(ang)*dist, y = player.y+Math.sin(ang)*dist;
    const srcChapter = 1+Math.floor(Math.random()*30); // 시즌1~3(챕터1~30) 몬스터 중 랜덤
    const pool = MONSTERS.byChapter[srcChapter] || MONSTERS.byChapter[1];
    const typeName = pool[Math.floor(Math.random()*pool.length)];
    const e = new Enemy(x, y, typeName, Math.floor(elapsed/20), false, 1, null, null);
    e._isAfterimage = true;
    e._flickerT = Math.random()*10;
    e._nearTimer = 0; e._nearPartner = null;
    e._fusing = false; e._fuseT = 0; e._fusePartner = null;
    afterimages.push(e);
  }

  function _materializeAfterimages(x, y) {
    const pool = MONSTERS.byChapter[currentChapter] || MONSTERS.byChapter[31];
    const typeName = pool[Math.floor(Math.random()*pool.length)];
    const e = new Enemy(x, y, typeName, Math.floor(elapsed/20), false, 1, null, null);
    const mult = (typeof REINCARNATED_MONSTER_STAT_MULT!=='undefined') ? REINCARNATED_MONSTER_STAT_MULT : 1.8;
    e.hp = e.maxHp = Math.floor(e.hp*mult);
    e.damage   = Math.floor(e.damage*mult);
    e.xpValue  = Math.floor(e.xpValue*mult);
    e.goldValue= Math.floor(e.goldValue*mult);
    e._isReincarnated = true; // draw()에서 발광 아웃라인, 사망 시 순리석 확정드랍용 플래그
    enemies.push(e);
    const isKoM = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='ko');
    showFloatingText(x, y-20, isKoM?'✨거듭남':'✨Reborn', '#ffe8a0');
  }

  function _updateAfterimages(dt) {
    _afterimageSpawnTimer -= dt;
    if (_afterimageSpawnTimer <= 0 && afterimages.length < 6) {
      _afterimageSpawnTimer = 5+Math.random()*4;
      _spawnAfterimage();
    }
    // 이동만 반영(공격/투사체 리턴값은 버림 — 이 배열은 애초에 플레이어와 상호작용 안 함)
    for (const a of afterimages) {
      if (a._fusing) continue;
      a.update(dt, player.x, player.y);
      a._flickerT += dt;
    }
    // 근접 페어 판정 (반경 60, 5초 유지 시 합체 트리거)
    for (let i=0;i<afterimages.length;i++) {
      const a = afterimages[i];
      if (a._fusing) continue;
      let nearest=null, nearestD=60;
      for (let j=0;j<afterimages.length;j++) {
        if (i===j) continue;
        const b = afterimages[j];
        if (b._fusing) continue;
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d<nearestD) { nearest=b; nearestD=d; }
      }
      if (nearest && a._nearPartner===nearest) a._nearTimer += dt;
      else { a._nearPartner = nearest; a._nearTimer = nearest ? dt : 0; }
      if (nearest && a._nearTimer>=5 && !nearest._fusing) {
        a._fusing=true; nearest._fusing=true;
        a._fusePartner=nearest; nearest._fusePartner=a;
        a._fuseT=0; nearest._fuseT=0;
      }
    }
    // 합체 연출(서로 중간지점으로 수렴) 진행
    for (const a of afterimages) {
      if (!a._fusing || !a._fusePartner) continue;
      a._fuseT += dt;
      const b = a._fusePartner;
      const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
      a.x += (mx-a.x)*Math.min(1,dt*3);
      a.y += (my-a.y)*Math.min(1,dt*3);
    }
    // 합체 완료(1.2초) → 실체화, 페어당 한 번만 처리
    const done = new Set();
    for (const a of afterimages) {
      if (a._fusing && a._fuseT>=1.2 && a._fusePartner && !done.has(a) && !done.has(a._fusePartner)) {
        done.add(a); done.add(a._fusePartner);
        _materializeAfterimages((a.x+a._fusePartner.x)/2, (a.y+a._fusePartner.y)/2);
      }
    }
    if (done.size) afterimages = afterimages.filter(a=>!done.has(a));
  }

  let soulDrops = [];      // 시즌2 영혼 드랍 (영혼 조각 / 영혼석)
  let bossRushIndex = 0;   // 보스 러쉬 진행 인덱스
  let rushBossPool = [];   // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 무한 확장형 — 해금된 챕터의 보스를 반복 소환할 풀
  let infiniteWave = 0;    // 무한 모드 웨이브
  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번②: 복수 애기씨(분신) — 시즌3 한정, 혼돈석 30개/체(최대3체) 소모 소환
  let aegissiClones = [];
  let zoom = 1.0;  // 줌 레벨 (0.5 ~ 2.0)
  let killTarget = 300, kills = 0; // [UPDATE 2026-07-09] init()에서 즉시 덮어써지는 초기값 — 개발모드 축소 제거
  let killTargetReached = false, bossSpawned = false;
  let farmingTimer = 0;
  let elapsed = 0, timeLeft = 300;
  let levelUpChoices = { main:[], sub:[], stat:[] };
  let screenShake = 0, shakeX = 0, shakeY = 0;
  let companionImg = null, warningTimer = 0;
  let saveData = null;
  const WARNING_DUR = 2.2;

  function getStageInfo(id) {
    for (const ch of GAME_DATA.stages)
      for (const s of ch.stages)
        if (s.id === id) return s;
    return null;
  }

  // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 보스러시 무한 확장형 — 클리어한 챕터의 미들보스+챕터보스를 반복 소환하는 풀 구성
  function _buildBossRushPool(sd) {
    const cleared = (sd.clearedChapters || []).slice().sort((a,b)=>a-b);
    const chs = cleared.length ? cleared : [1]; // 안전장치: 클리어 기록이 없어도 최소 챕터1은 항상 포함
    const pool = [];
    for (const ch of chs) { pool.push({type:'mid_boss', ch}); pool.push({type:'chapter_boss', ch}); }
    return pool;
  }

  function init(el, params) {
    console.log('🎮 GameScene.init', params);
    AudioManager.play('battle');
    gameMode    = params?.mode || 'normal';
    stageId     = params?.stageId || 1;
    _rewardMode = params?.rewardMode || null;
    difficulty  = params?.difficulty || 'easy';
    window.gameDifficulty = difficulty;

    if (gameMode === 'infinite') {
      isBossStage=false; bossType=null; killTarget=99999;
      currentChapter=1; timeLeft=99999; infiniteWave=0;
    } else if (gameMode === 'boss_rush') {
      isBossStage=true; bossType='mid_boss'; killTarget=0;
      currentChapter=1; timeLeft=99999; bossRushIndex=0;
      rushBosses=[]; rushNextSpawnAt=0; // 첫 보스는 즉시(elapsed=0 도달 시) 소환
    } else {
      const si = getStageInfo(stageId);
      isBossStage = !!(si?.isBoss || si?.isMidBoss);
      bossType    = si?.isBoss ? 'chapter_boss' : si?.isMidBoss ? 'mid_boss' : null;
      // [UPDATE 2026-07-24] 노말/하드가 이지보다 킬타겟까지 더 많이 요구해서 난이도 올릴 때마다 "더 강한 적을 더 많이" 잡아야 했음
      // (사용자 피드백: 이지→노말→하드 전챕터 반복이 지나치게 고됨) — 난이도 무관하게 이지와 동일한 킬타겟으로 통일
      killTarget  = Math.floor((si?.killTarget || 300) * 0.7);
      currentChapter = MONSTERS.getChapterFromStage(stageId);
      timeLeft = CONFIG.GAME.TIME_LIMIT || 300;
    }

    kills = 0; elapsed = 0; window.earnedGold = 0; window.earnedSpecial = 0;
    // [UPDATE 2026-07-17] 이전 런의 잔여값이 결과화면에 그대로 새던 버그 수정 — 매 런 시작마다 초기화
    window.earnedSoulStones = 0; window.earnedSoulFragments = 0;
    window.earnedSpecialtyCount = 0; window.earnedSpecialtyId = null; // [UPDATE 2026-07-19]
    bigGoldDrops = []; soulDrops = [];
    killTargetReached = false; farmingTimer = 0; bossSpawned = false;
    state = 'playing'; warningTimer = 0;

    enemies=[]; projectiles=[]; xpOrbs=[]; bgOrbs=[];
    afterimages=[]; _afterimageSpawnTimer=3; // [UPDATE 2026-07-17] 시즌4 과거 잔상 상태 초기화
    goldDrops=[]; specialItems=[]; enemyProjs=[]; hitEffects=[]; floatingTexts=[]; bombEffects=[];
    aegissiClones=[];
    _lawFieldEffects=[]; _lawGravityEffects=[]; _lawDistortT=0; _lawDistortPatches=[]; // [UPDATE 2026-07-25] 법칙 화면급 이펙트 상태 초기화
    _transformType=null; _transformTimer=0; _transformAtkCd=0; // [UPDATE 2026-07-17] 변신카드 상태 초기화
    window._hitEffects = hitEffects;
    companions=[]; levelUpChoices={main:[],sub:[],stat:[]};
    _gaonMugsaSpinAngle=0; _soheeOrbitAngle=0; _aramDanbiBickerT=0; // [UPDATE 2026-07-26] 히든 시너지 배치3 상태 리셋
    _cameoState=[]; // [UPDATE 2026-07-26] 히든 시너지 배치4 상태 리셋
    petEntities=[]; activePetData=[];
    boss=null; rushBosses=[]; screenShake=0;
    zoom = 1.0;

    saveData = Save.load();
    // [UPDATE 2026-07-15] 260715_MTOPC.md 6번: 시즌5 첫 진입 시 삼신할매 태몽 회상 트리거 —
    // 시즌5(챕터41~) 콘텐츠 자체가 아직 없어서 당장은 도달 불가능하지만, 나중에 시즌5가 추가되면 바로 동작하도록 미리 배선.
    // 팝업은 로비의 기존 삼신할매 대화창을 재사용(다음 로비 방문 시 1회 노출) — 인게임 전용 팝업 UI를 새로 만들지 않음.
    if (gameMode === 'normal' && stageId === 401 && !saveData.samsinDreamSeen) {
      saveData.samsinDreamSeen = true;
      Save.save(saveData);
    }
    if (gameMode === 'boss_rush') rushBossPool = _buildBossRushPool(saveData); // [UPDATE 2026-07-14]
    // [UPDATE 2026-07-16] 260716_MTOPC.md 2번②③: 던전강화 — 무한던전 시작 킬수를 강화 레벨만큼 밀어줌
    // (kills가 Spawner.update()의 dungeonMult 계산에 그대로 쓰이므로, 시작값만 올려두면 별도 배선 불필요)
    if (gameMode === 'infinite') {
      kills = (saveData.dungeonUpgradeLv || 0) * CONFIG.DUNGEON_UPGRADE.KILLS_PER_LEVEL;
    }
    speedMult = saveData.speedMult || 1;
    autoMode  = saveData.autoMode  || 0;
    if (saveData.speedMult === undefined || saveData.autoMode === undefined) {
      saveData.speedMult = speedMult;
      saveData.autoMode  = autoMode;
      Save.save(saveData);
    }

    // [UPDATE 2026-07-13] 260713_MTOPC.md 20번: 줌 버튼 발견성 낮음 피드백 대응 — 스테이지1 최초 진입 시 1회만 스팟라이트
    const _showZoomTutorial = gameMode === 'normal' && stageId === 1 && !saveData.stage1TutorialSeen;
    if (_showZoomTutorial) { saveData.stage1TutorialSeen = true; Save.save(saveData); }

    // 플레이어 (저장된 강화 스탯 반영)
    player = new Player(0, 0, saveData.statUpgrades || {}, saveData.sinmokUpgrades || {}, saveData.sinmokS2 || {}, saveData.myeongLv || 0, saveData.sinmokS5 || {}, saveData.laws || {}, saveData.lawSlots || [], saveData.specialtyItems || {});
    player._invincible = 2.0; // 시작 2초 무적
    player._pendingLevelUps = 0; // [UPDATE 2026-07-31] 이전 런의 잔여 레벨업 대기열이 새 런으로 새지 않도록 초기화

    // [UPDATE 2026-08-03] 파트2 "수호 부적"(saveData.aegissiTalisman, 내부 필드명은 하위호환용으로 유지) —
    // 파트2 프로필의 일반 스테이지에서만 생성.
    // [UPDATE 2026-08-05] HP = 300 * 내구강화 레벨(hpLv) — 대장간에서 강화할 때마다 최대 HP가 300씩 증가.
    {
      const _hpLv = (saveData.aegissiTalisman && saveData.aegissiTalisman.hpLv) || 1;
      const _talismanMaxHp = 300 * _hpLv;
      talisman = (gameMode === 'normal' && typeof Save !== 'undefined' && Save.getActiveProfile() === 'part2')
        ? { x: 0, y: -150, hp: _talismanMaxHp, maxHp: _talismanMaxHp, _iframe: 0 }
        : null;
      // [UPDATE 2026-08-05] 세이브당 1회, 수호 부적이 뭔지/왜 지켜야 하는지 안내 토스트
      if (talisman && !saveData.talismanTutorialSeen) {
        saveData.talismanTutorialSeen = true;
        Save.save(saveData);
        setTimeout(() => _showTalismanTutorialToast(), 1600);
      }
    }

    // [UPDATE 2026-07-31] 슈브니구라스의 축복/오염도 — 런 전체에 걸리는 전투계수를 진입 시 1회 확정.
    // 어계(챕터61~70): 축복이 버프로 작동해 1+n배(최대 1001배). 이게 100배 파워커브를 뚫는 유일한 수단.
    // 황계(챕터71~80): 같은 수치가 오염도로 뒤집혀 전투계수를 깎는다(1000이면 0.1배만 남음).
    // 그 외 계에서는 축복을 아무리 들고 있어도 영향 없음(어계 돌파용 한정 자원이라는 설계).
    (() => {
      const _bl = Math.max(0, Math.min(saveData.blessings || 0, CONFIG.BLESSING.MAX));
      if (gameMode === 'normal' && currentChapter >= 61 && currentChapter <= 70) {
        player._blessingMult = 1 + _bl;
        // [UPDATE 2026-07-31] 축복 없이 어계를 도는 것 자체가 이득이 없도록 경험치를 축복량에 비례시킨다.
        // 적은 100배 강한데 보상만 정상이면 "축복 안 사고 버티기"가 성립해버려서 이 시스템의 존재 이유가 사라짐.
        // 축복 0 → XP 1/100, 축복 99 이상 → 정상. 상한 1이라 많이 산다고 이득이 더 커지진 않는다
        // (축복은 어디까지나 어계를 뚫는 열쇠이지 파밍 배율이 아니라는 설계).
        player._blessingXpMult = Math.min(1, (1 + _bl) / 100);
      } else if (gameMode === 'normal' && currentChapter >= 71 && currentChapter <= 80) {
        // [UPDATE 2026-07-31] 황계 = 오염도 페널티 × 반물질 페널티.
        // 반물질계에서는 애기씨 외의 존재가 형태를 유지하지 못한다 — 동료/펫을 데려갈수록 전투력이 깎인다.
        // 곱연산이라 0이 되지는 않지만 3+3 풀 편성이면 0.75^6 ≈ 0.178까지 떨어진다.
        const _nComp = (saveData.activeCompanions || []).length;
        const _nPet  = (saveData.activePets || []).length;
        const _antimatter = Math.pow(CONFIG.RUINED_REALM.COMPANION_MULT, _nComp)
                          * Math.pow(CONFIG.RUINED_REALM.PET_MULT, _nPet);
        player._ruinedAntimatterMult = _antimatter; // 일시정지 화면 표시용
        player._blessingMult = Math.max(
          CONFIG.BLESSING.MIN_RUINED_MULT,
          1 - _bl * CONFIG.BLESSING.RUINED_PENALTY_PER
        ) * _antimatter;
        player._blessingXpMult = 1; // 황계는 경험치 페널티 없음 — 전투계수만으로 충분히 가혹하다
        // [UPDATE 2026-08-02] 황계 첫 진입 + 오염도 보유 중일 때만, 세이브당 1회 자각 토스트
        if (_bl > 0 && !saveData.ruinedCorruptionRevealSeen) {
          saveData.ruinedCorruptionRevealSeen = true;
          Save.save(saveData);
          const _penaltyMult = Math.max(CONFIG.BLESSING.MIN_RUINED_MULT, 1 - _bl * CONFIG.BLESSING.RUINED_PENALTY_PER);
          setTimeout(() => _showRuinedCorruptionToast(_bl, Math.round(_penaltyMult * 100)), 1600);
        }
      } else {
        player._blessingMult = 1;
        player._blessingXpMult = 1;
        player._ruinedAntimatterMult = 1;
      }
    })();

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번①③: 도깨비주사위 + 혼돈시장 재고 — 시즌3 스테이지(201~300) 입장 시 갱신
    if (gameMode === 'normal' && stageId >= 201 && stageId <= 300) {
      _dokkaebiDiceResult = _rollDokkaebiDice(player);
      saveData._chaosMarketStock = rollChaosMarketStock();
      Save.save(saveData);
    } else {
      _dokkaebiDiceResult = null;
    }

    // [UPDATE 2026-07-17] 차원석 경제를 시즌2(101~200)로만 한정했던 것을 시즌2 이후 전체(101~)로 확장 —
    // "현계 밖에서 사는 동안은 계속 차원석이 필요하다"는 설정에 맞춰 시즌3 이후에도 동일 적용(사용자 지적)
    if (stageId >= 101) {
      const _diffCfgEntry = StageSelectScene.DIFF_CONFIG[difficulty] || StageSelectScene.DIFF_CONFIG.easy;
      const _entryCost = _diffCfgEntry.s2EntryCost || 1;
      saveData.chaewonseok = Math.max(0, (saveData.chaewonseok || 0) - _entryCost);
      Save.save(saveData);
    }
    _s2CwsDrainTimer = 0;

    // 차원석 디버프 감지 (stageId 101 이상, chaewonseok=0)
    _s2Debuff = (stageId >= 101 && (saveData.chaewonseok || 0) === 0);
    // [UPDATE 2026-07-18] 시즌별 잠식 디버프 세분화: 시즌2=HP회복불가(기존), 시즌3=랜덤조작반전, 시즌4=XP획득불가
    player._healBlocked = _s2Debuff && stageId <= 200;
    player._xpBlocked   = _s2Debuff && stageId >= 301 && stageId <= 400;
    const _unlockedWeapons = saveData.unlockedWeapons || ['talisman'];
    // [UPDATE 2026-07-11] 이지는 동적 슬롯수(챕터5클리어→2/시즌1클리어→3) 반영
    const _diffCfg = StageSelectScene.getDiffConfig(difficulty, saveData) || StageSelectScene.DIFF_CONFIG.easy;
    const _mainSlotCount = gameMode === 'normal' ? (_diffCfg.slotMain || 1) : 3;
    // 선택된 주무기 목록 (슬롯 수만큼, 없으면 talisman 폴백)
    const _selectedMains = (saveData.selectedMainWeapons || [saveData.selectedMainWeapon || 'talisman'])
      .filter(wid => _unlockedWeapons.includes(wid))
      .filter((wid, idx, arr) => arr.indexOf(wid) === idx) // 중복 제거
      .slice(0, _mainSlotCount);
    if (_selectedMains.length === 0) _selectedMains.push('talisman');

    function _makeMainWeapon(wid) {
      const bsLv = (saveData.weaponLevels || {})[wid] || 1;
      const g = computeWeaponGrowth(bsLv); // [UPDATE 2026-07-06] 대장간 누적 강화값을 통합 공식으로 변환
      const inst = new WeaponInstance(wid);
      inst.lv          = g.lv;
      inst._awakLv     = Math.min(g.awakLv, 5); // 5각 이상은 테이블 고정, 데미지만 _overAwkDmg로
      inst._awakSubLv  = g.awakSubLv;
      inst.ascendLv    = g.ascendLv;
      inst._overAwkDmg = g.overAwkDmg;
      const _tRank = (saveData.weaponTranscend || {})[wid] || 0; // [UPDATE 2026-07-08] 무기 초월 배율 적용
      inst._transcendRank = _tRank;
      inst._transcendMult = getTranscendMult(_tRank);
      return inst;
    }
    weapons = _selectedMains.map(_makeMainWeapon);
    window.mainWeapon  = weapons[0];
    window.mainWeapons = weapons; // 다중 주무기 배열
    // [UPDATE 2026-07-12] 무기 초월 발광 연출용 — 투사체 draw()는 WeaponInstance에 직접 접근 못 하므로 defId→초월랭크 조회 테이블을 별도로 둠.
    // 투사체 type 값은 scythe_main이 아니라 'scythe'로 쓰이므로 별칭 처리.
    window._transcendRankByType = {};
    const _TRANSCEND_TYPE_ALIAS = { scythe_main: 'scythe' };
    for (const w of weapons) window._transcendRankByType[_TRANSCEND_TYPE_ALIAS[w.defId] || w.defId] = w._transcendRank || 0;
    window.subWeapons  = [];
    window.statSlots   = [];
    player.weapons = weapons;
    // 이번 런 획득 재화 추적
    window._runGold = 0;
    window._runSpecial = 0;
    // [UPDATE 2026-07-10] 데미지 미터 초기화 (이전 런 잔여 데이터 방지) — 누적 총데미지 + 최근 3초 로그로 부드러운 DPS 계산
    window._dpsTotal = {};
    window._dpsBuckets = []; // [UPDATE 2026-07-31] 히트별 로그(_dpsLog) → 0.25초 시간 버킷으로 교체
    window._dpsDisplay = {};
    window._gameElapsed = 0;
    player._damageReduction = 0;
    // [UPDATE 2026-07-22] 신목/선술 영구 치명타·쿨감 스탯이 스테이지 진입마다 사라지던 버그 수정 —
    // 하드코딩된 0/1.5 대신 생성자에서 보관해둔 base 값(신목+선술 반영분)으로 리셋
    player._critChance = player._baseCritChance || 0; player._critMult = player._baseCritMult || 1.5;
    player._atkBuff=1; player._atkBuffTime=0;
    player._xpMult=1.0;
    player._cdrCd=0; player._cdrPet=0; // [UPDATE 2026-07-06] 쿨감 소스별 필드 리셋 // [UPDATE 2026-07-15] _cdrAtkSpd 제거(260715_MTOPC.md 11번, 공격속도는 totalSpd 경로로 분리)
    recalcCdReduction(player); // cdrSeonsul(선술 영구 쿨감)을 포함해 재계산
    player._shieldTime=0; player._shieldHp=0;
    window._boss = null;
    window._gaonMugsaSpin = false; window._aramDanbiBicker = false; window._soheeOrbit = false; // [UPDATE 2026-07-26] 히든 시너지 배치3 플래그 리셋
    window._player = player;
    window._enemies = enemies;

    // [UPDATE 2026-07-31] 황계(챕터71~80)는 반물질계 — 애기씨 외의 존재는 형태를 유지하지 못한다.
    // 편성해둔 동료·펫이 아예 소환되지 않고, 편성 자체는 반물질 페널티(전투계수 하락)로만 남는다.
    // 즉 황계에 들어갈 땐 전부 해제하고 혼자 가는 것이 정답 — "아무도 데려갈 수 없는 계"라는 설정의 게임적 구현.
    const _isRuinedRealm = (gameMode === 'normal' && currentChapter >= 71 && currentChapter <= 80);

    // 동료: 서낭당 해금(스테이지 10 클리어) 후에만 활성화
    const companionUnlocked = !_isRuinedRealm && Unlock.getUnlocked(saveData).has('companion');
    const _compSlotCount = gameMode === 'normal'
      ? (_diffCfg.slotComp || 1)
      : Math.max(1, (saveData.activeCompanions||[]).length);
    const activeIds = companionUnlocked ? (saveData.activeCompanions||[]).slice(0, _compSlotCount) : [];
    activeIds.forEach((id,i)=>{
      const d=GAME_DATA.companions.find(c=>c.id===id);
      if(d) companions.push(new CompanionEntity(d,i));
    });
    // 펫: 용왕 연못(스테이지 40) 해금 후에만 활성화
    const petUnlocked = !_isRuinedRealm && Unlock.getUnlocked(saveData).has('pet'); // [UPDATE 2026-07-31] 황계에선 펫도 소환 불가
    const _petSlotCount = gameMode === 'normal'
      ? (_diffCfg.slotPet || 1)
      : Math.max(1, (saveData.activePets||[]).length);
    if (petUnlocked) {
      (saveData.activePets||[]).slice(0, _petSlotCount).forEach((id,i)=>{
        const pd=GAME_DATA.pets.find(p=>p.id===id);
        if(pd){
          // [UPDATE 2026-07-11] 강화 레벨을 실제 효과치에 반영 (기존엔 petLevels가 전혀 안 쓰였음)
          const _petLv = (saveData.petLevels||{})[id] || 1;
          const scaledPd = { ...pd, value: scalePetValue(pd, _petLv) };
          if (pd.markCount) scaledPd.markCount = scalePetIntField(pd.markCount, _petLv); // [UPDATE 2026-07-11] 사신 표식 대상 수
          petEntities.push(new PetEntity(scaledPd,i)); activePetData.push(scaledPd);
        }
      });
    }
    // [UPDATE 2026-07-26] 히든 시너지 발견 토스트용 — 이번 스테이지에 실제로 활성화된 히든 시너지 id 목록.
    // 스포일러(효과 설명) 없이 "뭔가 발동했다"는 신호만 주기 위해, 어떤 시너지인지는 노출 안 하고 개수만 씀.
    const _hiddenActive = [];
    // [UPDATE 2026-07-26] 히든 시너지: 박수(애기 도깨비)+꺽쇠(도깨비 수리공) 부자 동시 편성 —
    // 서로를 알아보고 붙어다님(같은 대형 각도, 반경만 차등), 공격 쿨타임 각자 절반, 꺽쇠는 커지고 박수는 작아짐.
    // hidden.md #1(박수=꺽쇠의 아이) "향후 확장 여지"로 남겨뒀던 부분을 실제 구현.
    {
      const _baksu = companions.find(c => c.id === 'baksu');
      const _ggeogsoe = companions.find(c => c.id === 'ggeogsoe');
      if (_baksu && _ggeogsoe) {
        _baksu.atkInterval *= 0.5;
        _ggeogsoe.atkInterval *= 0.5;
        _ggeogsoe._sizeMult = 1.25;
        _baksu._sizeMult = 0.8;
        // 같은 대형 각도로 맞춰서 항상 붙어다니게, 반경만 살짝 차등을 둬서 완전히 겹치지 않게
        _baksu.orbitAngle = _baksu.formationAngle = _ggeogsoe.orbitAngle;
        _baksu.orbitRadius = _baksu.formationRadius = _ggeogsoe.formationRadius * 0.65;
        _hiddenActive.push('baksu_ggeogsoe');
      }
    }
    // [UPDATE 2026-07-17] 히든 시너지: 도깨비 계열 동료(꺽쇠/박수/장구애비) + 도깨비 계열 펫(싸리/공이) 동시 장착 시
    // 보조무기 도깨비불 지속시간·크기 2배 (hidden.md 참고, weapons.js goblin_fire.fire()에서 실사용)
    const _dokkaebiComps = ['ggeogsoe','baksu','janggu_aebi'];
    const _dokkaebiPets  = ['ssari','gongi'];
    player._dokkaebiFireBoost = activeIds.some(id=>_dokkaebiComps.includes(id))
      && activePetData.some(pd=>_dokkaebiPets.includes(pd.id));
    if (player._dokkaebiFireBoost) _hiddenActive.push('dokkaebi_fire');
    // [UPDATE 2026-07-26] 도깨비 대잔치 — 동료 3종+펫 3종 전부 풀장착(하드 난이도 3/3 슬롯 필요) 시 도깨비불 화면 전체 미니 폭발 추가
    player._dokkaebiFullSetBoost = ['ggeogsoe','baksu','janggu_aebi'].every(id=>activeIds.includes(id))
      && ['dokkaebi','ssari','gongi'].every(id=>activePetData.some(pd=>pd.id===id));
    if (player._dokkaebiFullSetBoost) _hiddenActive.push('dokkaebi_full_set');

    // [UPDATE 2026-07-26] 히든 시너지 배치2 — 보조무기 조건부 부스트 (weapons.js water_jet/scythe_sub/ghost_hand/goblin_fire에서 실사용)
    // 13. 청아×드라고 — 용왕 물줄기(회오리) 생성 개수 2배
    player._waterJetDoubleBoost = activeIds.includes('cheonga') && activePetData.some(pd=>pd.id==='zodiac_dragon');
    if (player._waterJetDoubleBoost) _hiddenActive.push('water_jet_double');
    // 15. (해원맥 or 강림차사) × (저승나비 or 상사화) — 저승낫이 튕길 때 작은 조각 분열 추가
    player._reaperSplitBoost = (activeIds.includes('haewonmaek') || activeIds.includes('gangnim'))
      && activePetData.some(pd=>pd.id==='jeoseung_nabi' || pd.id==='sangsahwa');
    if (player._reaperSplitBoost) _hiddenActive.push('reaper_split');
    // 16. 환생동자×영혼불씨 — 귀신손 크기(실제 판정 포함) 확대
    player._ghostHandSizeBoost = activeIds.includes('hwansaengdongja') && activePetData.some(pd=>pd.id==='bulssi');
    if (player._ghostHandSizeBoost) _hiddenActive.push('ghost_hand_size');

    // [UPDATE 2026-07-26] 히든 시너지 배치1 — 단순 스탯형 5종 (hidden.md 참고)
    {
      // 9. 선계 사문 — 백운선인(스승)과 매화검선(제자) 동시 편성 시 매화검선 공격속도 대폭 상승
      const _baekun = companions.find(c => c.id === 'baekunseonin');
      const _maehwa = companions.find(c => c.id === 'maehwageomseon');
      if (_baekun && _maehwa) { _maehwa.atkInterval *= 0.65; _hiddenActive.push('seonsul_master'); }

      // 10. 싸리×공이 — 둘 다 원 개체가 도깨비인 남매 펫. 서로를 알아보고 각자 특기가 강화됨
      const _ssariPet = petEntities.find(p => p.id === 'ssari');
      const _gongiPet = petEntities.find(p => p.id === 'gongi');
      if (_ssariPet && _gongiPet) {
        _ssariPet.fetchRangeMult *= 1.3;
        _ssariPet.pullRadius *= 1.3;
        _gongiPet.value *= 1.3;
        _hiddenActive.push('ssari_gongi');
      }

      // 11. 성린×청아 — 겉모습은 용이지만 원 개체는 기린인 성린이, 진짜 용족 청아 곁에서 동경하듯 반응
      const _cheonga = companions.find(c => c.id === 'cheonga');
      const _seongninPd = activePetData.find(pd => pd.id === 'seongnin');
      const _seongninPet = petEntities.find(p => p.id === 'seongnin');
      if (_cheonga && _seongninPd) {
        _seongninPd.value += 0.10; // applyPetPassives에서 이 값을 읽어 크리티컬 확률에 반영
        if (_seongninPet) _seongninPet.color = '#4a90e2'; // 용족 기운에 물든 파란빛
        _hiddenActive.push('seongnin_cheonga');
      }

      // 12. 강다리×저승나비 — 둘 다 "인도" 컨셉의 펫. 동시 장착 시 플레이어 이동속도 소폭 상승
      // (player.speed는 totalMov 기반 getter라 직접 대입이 안 먹힘 — tempStats.mov를 올려야 실제로 반영됨)
      const _gangdariPet = activePetData.find(pd => pd.id === 'zodiac_dog');
      const _nabiPet = activePetData.find(pd => pd.id === 'jeoseung_nabi');
      if (_gangdariPet && _nabiPet) { player.tempStats.mov += 8; _hiddenActive.push('gangdari_nabi'); }

      // 14. 백호×호야 — 백호가 호랑이 원개체 펫 호야를 쫓아다니며 쿨타임 추가 감소
      const _baekhoComp = companions.find(c => c.id === 'baekho');
      const _hoyaPet = activePetData.find(pd => pd.id === 'hoya');
      if (_baekhoComp && _hoyaPet) { _baekhoComp.skillInterval *= 0.8; _hiddenActive.push('baekho_hoya'); }
    }

    // [UPDATE 2026-07-26] 히든 시너지 배치3 — 강제발동 체인 + 회전 포메이션 5종 (hidden.md 참고)
    {
      // 1. 가온×무사 — 무사가 공격할 때마다 가온이 쿨타임 무시하고 추가 공격(단방향). 둘은 항상 플레이어 기준 대칭으로 시계방향 회전(도망 다니는 연출)
      const _gaon = companions.find(c => c.id === 'gaon');
      const _mugsa = companions.find(c => c.id === 'mugsa');
      if (_gaon && _mugsa) {
        _mugsa._chainLinks.push({ event: 'atk', targetId: 'gaon', targetAction: 'atk' });
        window._gaonMugsaSpin = true;
        _hiddenActive.push('gaon_mugsa');
      }

      // 3. 아람×단비 — 단비가 힐할 때 아람 강제공격, 아람이 공격할 때 단비 강제힐 (자매의 티키타카)
      const _aram = companions.find(c => c.id === 'aram');
      const _danbi = companions.find(c => c.id === 'danbi');
      if (_aram && _danbi) {
        _danbi._chainLinks.push({ event: 'heal', targetId: 'aram', targetAction: 'atk' });
        _aram._chainLinks.push({ event: 'atk', targetId: 'danbi', targetAction: 'heal' });
        window._aramDanbiBicker = true;
        _hiddenActive.push('aram_danbi');
      }

      // 4. 매화검선×허무검사 — 서로 공격 시 상대의 궁극기를 쿨타임 무시하고 강제 발동(형제의 합공). 포메이션은 항상 대칭
      const _maehwa4 = companions.find(c => c.id === 'maehwageomseon');
      const _heomu = companions.find(c => c.id === 'heomugeomsa');
      if (_maehwa4 && _heomu) {
        _maehwa4._chainLinks.push({ event: 'atk', targetId: 'heomugeomsa', targetAction: 'ult' });
        _heomu._chainLinks.push({ event: 'atk', targetId: 'maehwageomseon', targetAction: 'ult' });
        _heomu.formationAngle = _maehwa4.formationAngle + Math.PI;
        _hiddenActive.push('maehwa_heomu');
      }

      // 5. (해원맥/강림차사) × (상사화/저승나비) — 보스 등장 중에는 궁극기 쿨타임이 기존의 20%로 극단적으로 짧아짐
      const _reaperUltRush = activePetData.some(pd => pd.id === 'sangsahwa' || pd.id === 'jeoseung_nabi');
      if (_reaperUltRush) {
        const _haewonmaekC = companions.find(c => c.id === 'haewonmaek');
        const _gangnimC = companions.find(c => c.id === 'gangnim');
        if (_haewonmaekC) _haewonmaekC._bossRushBoost = true;
        if (_gangnimC) _gangnimC._bossRushBoost = true;
        if (_haewonmaekC || _gangnimC) _hiddenActive.push('reaper_ult_rush');
      }

      // 2. 생령×봉황 — 잊혀진 주작(생령)의 곁을 봉황이 계속 맴돎. 생령이 공격할 때마다 봉황 머리 위에 물음표
      const _saengryeong = companions.find(c => c.id === 'geumgang');
      const _bonghwang = companions.find(c => c.id === 'sohee');
      if (_saengryeong && _bonghwang) { window._soheeOrbit = true; _hiddenActive.push('saengryeong_bonghwang'); }
    }

    // [UPDATE 2026-07-26] 히든 시너지 배치4 — 카메오 난입(사신진/저승총출동). 동료는 3슬롯이 최대라 4명 중 3명만 있으면
    // 나머지 1명이 20초 간격으로 난입해 10초간 함께 싸우고 사라짐. 등장 시 그룹 전원(장착 3+카메오) 공격 쿨 초기화.
    {
      const _samsinIds = ['cheonga', 'baekho', 'cheolgap', 'sohee']; // 사신진: 청아(청룡)/백호/수호(현무)/봉황(준-주작)
      const _samsinHave = _samsinIds.filter(id => activeIds.includes(id));
      if (_samsinHave.length === 3) {
        _cameoState.push({ ids: _samsinIds, missingId: _samsinIds.find(id => !activeIds.includes(id)), phase: 'waiting', t: 0, entity: null });
        player._extraDmgPct = (player._extraDmgPct || 0) + 0.05; // 사신진 결집 — 전체 공격력 소폭 상승
        player._samsinTrinityActive = true; // 화면 테두리 이펙트용
        _hiddenActive.push('samsin_trinity');
      }
      const _jeoseungIds = ['haewonmaek', 'gangnim', 'heomugeomsa', 'hwansaengdongja']; // 저승 총출동
      const _jeoseungHave = _jeoseungIds.filter(id => activeIds.includes(id));
      if (_jeoseungHave.length === 3) {
        _cameoState.push({ ids: _jeoseungIds, missingId: _jeoseungIds.find(id => !activeIds.includes(id)), phase: 'waiting', t: 0, entity: null });
        _hiddenActive.push('jeoseung_all');
      }
    }

    // [UPDATE 2026-07-26] 히든 시너지 발견 토스트 — 스포일러 없이 "뭔가 됐다"는 신호만 준다.
    // 이번 세이브에서 처음 보는 조합만 골라서 축하 토스트, 이미 본 건 조용히 넘어감(매 판마다 반복 노출 방지).
    if (_hiddenActive.length) {
      const _hsSeen = new Set(saveData._hiddenSynergiesSeen || []);
      const _hsNew = _hiddenActive.filter(id => !_hsSeen.has(id));
      if (_hsNew.length) {
        _hsNew.forEach(id => _hsSeen.add(id));
        saveData._hiddenSynergiesSeen = Array.from(_hsSeen);
        Save.save(saveData);
        _showHiddenSynergyToast(_hsNew.length);
      }
    }

    // [UPDATE 2026-07-11] 오행 시너지는 펫 패시브 적용 전에 계산해야 펫 효과량 배율이 반영됨
    applyElementSynergies(window.mainWeapons, companions, activePetData, player);
    // [UPDATE 2026-07-11] 영혼낫 처치 → 신검 쿨감 스택 (오행 시너지) 처치 귀속 훅
    window._onEnemyKilled = (srcType) => {
      const sw = (window.mainWeapons||[]).find(w => w.defId==='sword');
      if (sw && sw._synKillStackEnabled && srcType==='scythe') {
        sw._killStacks = Math.min(5, (sw._killStacks||0)+1);
        sw._killStackTimer = 8.0;
      }
    };
    applyPetPassives(activePetData, player, weapons);
    window._cdReduction = player._cdReduction||0;

    // [UPDATE 2026-07-11] 펫발 동료 스탯 배율(유신/자신/축신) + 오행 동료 연쇄 쿨감 적용 — 패시브 적용 후라야 값이 확정됨
    if (player._compAtkMult || player._compHpMult || player._compCdBonus) {
      for (const c of companions) {
        if (player._compAtkMult) c.atkDmg = Math.floor(c.atkDmg * player._compAtkMult);
        if (player._compHpMult) { c.maxHp = Math.floor(c.maxHp * player._compHpMult); c.hp = c.maxHp; }
        if (player._compCdBonus) c.skillInterval *= (1 - player._compCdBonus);
      }
    }

    // ── 건물 효과 적용 ──
    BuildingEffects.applyAll(player, companions, saveData);

    // 서낭당: 런 시작 시 추가 무기
    const seonangBonus = BuildingEffects.getSeonangBonus(saveData);
    if (seonangBonus.count > 0) {
      const allWeaponIds = Object.keys(WEAPON_DEFS);
      for (let i = 0; i < seonangBonus.count; i++) {
        const alreadyHave = weapons.map(w => w.id);
        const pool = allWeaponIds.filter(id => !alreadyHave.includes(id));
        if (pool.length === 0) break;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        weapons.push(new WeaponInstance(pick));
      }
      player.weapons = weapons;
    }

    _tileCache = {};
    _tileCacheAttempts = {};
    _seonsulEffects = [];
    _seonsulLightningQueue = [];
    for(let i=0;i<18;i++) bgOrbs.push({
      x:(Math.random()-.5)*1400, y:(Math.random()-.5)*1400,
      r:3+Math.random()*4, t:Math.random()*Math.PI*2,
      spd:14+Math.random()*16, color:Math.random()<.5?'#40c0f0':'#a060e0'
    });

    // companionImg: removed legacy spritesheet (individual sprites used)
    Spawner.reset(currentChapter, stageId, gameMode !== 'normal');
    console.log('🎮 챕터:', currentChapter, '킬타겟:', killTarget, '보스스테이지:', isBossStage);

    el.innerHTML=`
      <div style="position:relative;width:100%;height:100%;">
        <canvas id="gameCanvas" style="display:block;width:390px;height:844px;background:#0a0814;image-rendering:pixelated;"></canvas>
        <div id="gameUI" style="position:absolute;inset:0;pointer-events:none;"></div>
        <button id="pauseBtn" onclick="GameScene.togglePause()" style="
          position:absolute;top:56px;right:10px;width:36px;height:36px;
          background:rgba(0,0,0,0.5);border:1px solid rgba(212,160,23,0.4);
          border-radius:8px;color:#e8dcc8;font-size:16px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;z-index:50;">⏸</button>
        <button id="speedBtn" onclick="GameScene.cycleSpeed()" style="
          position:absolute;top:56px;right:52px;width:42px;height:36px;
          background:rgba(0,0,0,0.5);border:1px solid rgba(212,160,23,0.4);
          border-radius:8px;color:#f0c040;font-size:13px;font-weight:700;cursor:pointer;
          display:flex;align-items:center;justify-content:center;z-index:50;font-family:inherit;">1x</button>
        <button id="autoBtn" onclick="GameScene.cycleAutoMode()" style="
          position:absolute;top:56px;right:100px;width:52px;height:36px;
          background:rgba(0,0,0,0.5);border:1px solid rgba(100,180,255,0.4);
          border-radius:8px;color:#80c8ff;font-size:11px;font-weight:700;cursor:pointer;
          display:flex;align-items:center;justify-content:center;z-index:50;font-family:inherit;">수동</button>
        ${((gameMode==='normal' && stageId>=201 && stageId<=300) || _rewardMode==='hondonseok') ? `
        <button id="cloneBtn" onclick="GameScene.summonClone()" style="
          position:absolute;top:56px;right:160px;width:52px;height:36px;
          background:rgba(20,10,40,0.7);border:1px solid rgba(160,96,224,0.5);
          border-radius:8px;color:#d0a0ff;font-size:9px;font-weight:700;cursor:pointer;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;z-index:50;font-family:inherit;">
          <span>👤${Lang.getCurrent()==='en'?'Clone':'분신'}</span><span id="cloneBtnCost" style="font-size:8px;">🌪️30</span>
        </button>` : ''}
        <div id="zoomBtnWrap" style="position:absolute;bottom:90px;right:10px;
          display:flex;flex-direction:column;gap:6px;z-index:50;">
          <button onclick="GameScene.zoomIn()" style="
            width:36px;height:36px;background:rgba(0,0,0,0.5);
            border:1px solid rgba(212,160,23,0.3);border-radius:8px;
            color:#e8dcc8;font-size:16px;cursor:pointer;">+</button>
          <button onclick="GameScene.zoomOut()" style="
            width:36px;height:36px;background:rgba(0,0,0,0.5);
            border:1px solid rgba(212,160,23,0.3);border-radius:8px;
            color:#e8dcc8;font-size:16px;cursor:pointer;">−</button>
          ${_showZoomTutorial ? `<span id="zoomTutorialHint" class="onboard-hint" style="display:none;white-space:normal;width:120px;text-align:center;">${Lang.t('onboarding','zoomHint')}</span>` : ''}
        </div>
      </div>`;
    canvas=document.getElementById('gameCanvas'); ctx=canvas.getContext('2d');

    // [UPDATE 2026-07-13] 260713_MTOPC.md 20번: 기존 스테이지 인트로 텍스트(0~1.5초) 종료 직후 → 줌 버튼 스팟라이트 노출,
    // 논블로킹으로 몇 초 뒤 자동 페이드아웃
    if (_showZoomTutorial) {
      setTimeout(() => {
        const wrap = document.getElementById('zoomBtnWrap');
        const hint = document.getElementById('zoomTutorialHint');
        if (wrap) wrap.classList.add('onboard-pulse');
        if (hint) hint.style.display = 'block';
      }, 1500);
      setTimeout(() => {
        const wrap = document.getElementById('zoomBtnWrap');
        const hint = document.getElementById('zoomTutorialHint');
        if (wrap) wrap.classList.remove('onboard-pulse');
        if (hint) {
          hint.style.transition = 'opacity .5s';
          hint.style.opacity = '0';
          setTimeout(() => hint.remove(), 500);
        }
      }, 1500 + 4500);
    }

    const _speedBtn = document.getElementById('speedBtn');
    if (_speedBtn) _speedBtn.textContent = speedMult + 'x';
    const _autoBtn = document.getElementById('autoBtn');
    if (_autoBtn) {
      _autoBtn.textContent = getAutoModeLabel(autoMode);
      _autoBtn.style.color = AUTO_MODE_COLORS[autoMode];
      _autoBtn.style.borderColor = AUTO_MODE_BORDERS[autoMode];
    }

    window._pauseKeyHandler=(e)=>{if(e.code==='Escape') GameScene.togglePause();};
    window.addEventListener('keydown',window._pauseKeyHandler);

    requestAnimationFrame(()=>{
      canvas.width=390;
      canvas.height=844;
      window.addEventListener('resize',onResize);
      Input.attachTouch(canvas);
      canvas.addEventListener('wheel', onWheel, {passive:false});
      canvas.addEventListener('touchstart', onTouchStart, {passive:true});
      canvas.addEventListener('touchmove', onTouchMove, {passive:true});
      lastTime=performance.now();
      rafId=requestAnimationFrame(loop);

      // 시즌2 잠식 디버프 경고 팝업
      if (_s2Debuff) {
        const isKo = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'ko' : true;
        const warn = document.createElement('div');
        warn.style.cssText = `
          position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
          background:rgba(10,5,25,0.93);border:1.5px solid rgba(100,60,200,0.7);
          border-radius:16px;padding:20px 24px;z-index:9990;
          font-family:'Noto Serif KR',serif;text-align:center;
          box-shadow:0 0 30px rgba(80,30,180,0.4);max-width:300px;
        `;
        warn.innerHTML = `
          <div style="font-size:22px;margin-bottom:8px;">💀</div>
          <div style="font-size:13px;color:#c090ff;font-weight:700;margin-bottom:8px;">
            ${isKo ? '유명계 잠식' : 'Shadow Realm Corruption'}
          </div>
          <div style="font-size:11px;color:#b090d0;line-height:1.7;">
            ${isKo
              ? '차원석이 없어 저승에 잠식됩니다.<br>HP 회복 불가 · 시간이 지날수록 HP 감소.'
              : 'No Dimensional Stones — corruption spreads.<br>Healing blocked · HP drains over time.'}
          </div>
          <div style="margin-top:12px;font-size:10px;color:rgba(160,120,220,0.5);">
            ${isKo ? '3초 후 자동으로 닫힘' : 'Closes in 3s'}
          </div>
        `;
        document.body.appendChild(warn);
        setTimeout(() => warn.remove(), 3000);
      }
    });
  }

  function onResize(){ /* 고정 해상도 1280x720 - 리사이즈 시 캔버스 크기 변경 안 함 */ }

  function togglePause(){
    if(['dead','victory','bossWarning','talismanBreak'].includes(state)) return;
    state==='paused'?resumeGame():pauseGame();
  }
  function pauseGame(){
    state='paused';
    document.getElementById('pauseBtn').textContent='▶';
    const ui=document.getElementById('gameUI'); if(!ui) return;
    ui.style.pointerEvents='auto';
    const isKo = Lang.getCurrent()==='ko';
    const volVal = AudioManager.isMuted() ? 0 : Math.round(AudioManager.getVolume()*100);
    const min=Math.floor(elapsed/60), sec=Math.floor(elapsed%60);
    const modeLabel = gameMode==='infinite'?(isKo?'무한던전':'Infinite')
      : gameMode==='boss_rush'?(isKo?'보스러시':'Boss Rush')
      : (isKo?'스테이지 ':'Stage ')+stageId;
    ui.innerHTML=`
      <div class="scroll-pan-y" style="position:absolute;inset:0;background:rgba(0,0,10,0.88);overflow-y:auto;
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:20px;">
        <div style="font-size:22px;color:#f0c040;font-weight:700;">⏸ ${isKo?'일시 정지':'Paused'}</div>
        <div style="font-size:11px;color:#6a5a4a;">
          ${modeLabel} · ${isKo?'처치':'Kills'} ${kills}/${killTarget} · Lv.${player.level} · ${min}:${sec.toString().padStart(2,'0')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;width:100%;max-width:300px;">
          ${[['⚔️',isKo?'공격':'ATK',player.totalAtk],
             ['🛡️',isKo?'방어':'DEF',player.totalDef],
             ['💨',isKo?'이동':'MOV',Math.round(player.totalSpd)],
             ['❤️',isKo?'체력':'HP',Math.ceil(player.hp)+'/'+player.maxHp],
             // [UPDATE 2026-07-31] 🔥 존재하지 않는 필드(_critRate)를 읽고 있어서 치명타를 아무리 올려도
             // 일시정지 화면에 항상 0%로 표시되던 버그. 실제 스탯명은 _critChance이고 이미 백분율(0~100)이라
             // ×100도 함께 제거해야 한다(안 그러면 25%가 2500%로 표시됨).
             ['✨',isKo?'치명':'CRIT',Math.round(player._critChance||0)+'%'],
             ['📦',isKo?'레벨':'Lv',player.level],
             // [UPDATE 2026-07-31] 슈브니구라스의 축복/오염도 배율 — 공격력에 곱하고 받는 피해를 같은 값으로 나누므로
             // 실질적으로 "체력 ×N"과 동일한 생존력을 주지만 HP 숫자 자체는 그대로라 플레이어가 알 방법이 없었음.
             // 배율이 1이 아닐 때(어계/황계)만 칸을 추가해 노출한다.
             ...(((player._blessingMult||1) !== 1)
                 ? [[(player._blessingMult>1?'🌀':'💀'), isKo?'축복':'BLESS',
                     (player._blessingMult>=1 ? '×'+Format.num(Math.round(player._blessingMult))
                                              : '×'+player._blessingMult.toFixed(3))]]
                 : []),
          ].map(([icon,label,val])=>`
            <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);
              border-radius:8px;padding:6px 4px;text-align:center;">
              <div style="font-size:14px;">${icon}</div>
              <div style="font-size:9px;color:#6a5a4a;">${label}</div>
              <div style="font-size:12px;color:#e8dcc8;font-weight:700;">${val}</div>
            </div>`).join('')}
        </div>
        <div style="width:100%;max-width:300px;background:rgba(255,255,255,0.05);
          border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:10px 14px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span id="pauseVolIcon" style="font-size:16px;">${volVal===0?'🔇':'🔊'}</span>
            <span style="font-size:11px;color:#8a7a6a;flex-shrink:0;">${isKo?'볼륨':'Vol'}</span>
            <input type="range" id="pauseVolSlider" min="0" max="100" value="${volVal}"
              style="flex:1;accent-color:#a060e0;"
              oninput="AudioManager.setVolume(this.value/100);AudioManager.setMuted(this.value==0);document.getElementById('pauseVolIcon').textContent=this.value==0?'🔇':'🔊';document.getElementById('pauseVolNum').textContent=this.value+'%';">
            <span id="pauseVolNum" style="font-size:11px;color:#8a7a6a;width:30px;text-align:right;">${volVal}%</span>
          </div>
        </div>
        <button onclick="GameScene.resumeGame()" style="width:240px;padding:13px;
          background:rgba(112,64,192,0.4);border:1px solid #7040c0;border-radius:12px;
          color:#e8dcc8;font-size:15px;cursor:pointer;font-family:inherit;">▶ ${isKo?'계속하기':'Resume'}</button>
        <button onclick="GameScene.goLobby()" style="width:240px;padding:13px;
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:12px;
          color:#8a7a6a;font-size:14px;cursor:pointer;font-family:inherit;">← ${isKo?'로비로 돌아가기':'Back to Lobby'}</button>
      </div>`;
  }
  function _collectSoulDrop(sd) {
    // [UPDATE 2026-07-06] 저승나비 펫: 영혼 획득량 배율 (초과분은 확률로 +1)
    const _mult = player?._soulMult || 1;
    let _gain = Math.floor(_mult);
    if (Math.random() < _mult - _gain) _gain++;
    if (sd.type === 'soulFragment') {
      saveData.soulFragments = (saveData.soulFragments || 0) + _gain;
      window.earnedSoulFragments = (window.earnedSoulFragments || 0) + _gain;
      showFloatingText(sd.x, sd.y - 10, '👻+' + _gain, '#80b0ff');
    } else if (sd.type === 'soulStone') {
      saveData.soulStones = (saveData.soulStones || 0) + _gain;
      window.earnedSoulStones = (window.earnedSoulStones || 0) + _gain;
      showFloatingText(sd.x, sd.y - 10, '💜+' + _gain, '#c080ff');
    }
    Save.save(saveData);
  }

  function _collectBigGold(b) {
    // [UPDATE 2026-07-19] 보물 창고 특산품(하드모드 드랍) — GAME_DATA.specialtyItems에 있는 spriteKey면 공통 처리
    const _specialtyDef = (GAME_DATA.specialtyItems || []).find(it => it.id === b.spriteKey);
    if (_specialtyDef) {
      if (!saveData.specialtyItems) saveData.specialtyItems = {};
      saveData.specialtyItems[b.spriteKey] = (saveData.specialtyItems[b.spriteKey] || 0) + 1;
      Save.save(saveData);
      window.earnedSpecialtyCount = (window.earnedSpecialtyCount || 0) + 1; // [UPDATE 2026-07-19] 인게임/결과화면 표시용 이번 런 획득 카운트
      window.earnedSpecialtyId = b.spriteKey;
      const _isEnDrop = (typeof Lang !== 'undefined' && Lang.getCurrent && Lang.getCurrent() === 'en');
      showFloatingText(b.x, b.y, `${_specialtyDef.icon}+1 ${_isEnDrop ? _specialtyDef.nameEn : _specialtyDef.name}`, '#f0d080');
      return;
    }
    // 시즌2 차원석 드랍: spriteKey로 직접 판별
    if (b.spriteKey === 'chaewonseok') {
      saveData.chaewonseok = (saveData.chaewonseok || 0) + 1;
      window.earnedSpecial = (window.earnedSpecial || 0) + 1;
      Save.save(saveData);
      showFloatingText(b.x, b.y, '🔷+1', '#80c8ff');
      return;
    }
    // [UPDATE 2026-07-17] 시즌4 실체화 몹(과거 잔상 합체) 확정 드랍 — 일반 % 드랍 경로와 별개
    if (b.spriteKey === 'sullriseok') {
      saveData.sullriseok = (saveData.sullriseok || 0) + 1;
      window.earnedSpecial = (window.earnedSpecial || 0) + 1;
      Save.save(saveData);
      showFloatingText(b.x, b.y, '🌊+1', '#a0c0ff');
      return;
    }
    // [UPDATE 2026-07-17] 던전 몬스터가 세지는 만큼 특화재화/골드뭉치 보상도 스케일 — 기존엔 몬스터만
    // 세지고 보상은 고정이라 던전강화로 더 강한 구간에 들어가도 위험만 늘고 이득은 그대로였음.
    // spawner.js와 동일하게 몬스터 배율(1천킬당 2배)의 1.5배로 보상은 더 후하게 지급.
    const _monsterMult = (gameMode === 'infinite') ? Math.max(1, Math.floor(kills / 1000) * 2) : 1;
    const _bgDungeonMult = (gameMode === 'infinite') ? _monsterMult * 1.5 : 1;
    if (_rewardMode && SPECIAL_REWARD_KEYS[_rewardMode]) {
      // [UPDATE 2026-07-11] 해신(돼지) 펫 specialBoost 반영 — 분수분은 확률로 처리
      const _specMult = player._specialMult || 1;
      const _specRaw = 1 * _specMult * _bgDungeonMult;
      let _specGain = Math.floor(_specRaw);
      if (Math.random() < _specRaw - _specGain) _specGain++;
      saveData[_rewardMode] = (saveData[_rewardMode] || 0) + _specGain;
      window.earnedSpecial = (window.earnedSpecial || 0) + _specGain;
      Save.save(saveData);
      showFloatingText(b.x, b.y, SPECIAL_ICONS[_rewardMode] + '+' + _specGain, '#c0e0ff');
    } else if (_rewardMode === 'bossrush') {
      // 보스러쉬: 다이아
      saveData.gems = (saveData.gems || 0) + 1;
      window.earnedSpecial = (window.earnedSpecial || 0) + 1;
      Save.save(saveData);
      showFloatingText(b.x, b.y, '💎+1', '#e080ff');
    } else {
      const goldMult = difficulty==='easy' ? 0.7 : difficulty==='hard' ? 1.5 : 1.0;
      const gained = Math.floor(b.value * goldMult * _bgDungeonMult);
      saveData.gold = (saveData.gold || 0) + gained;
      window.earnedGold += gained;
      Save.save(saveData);
      showFloatingText(b.x, b.y, '💰+'+gained, '#ffd700');
    }
  }
  function toggleMute(){
    const next = !AudioManager.isMuted();
    AudioManager.setMuted(next);
    if (!next) AudioManager.play('battle');
    const btn = document.getElementById('pauseMuteBtn');
    const _muteEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    if (btn) btn.textContent = next ? (_muteEn?'🔇 Music Off':'🔇 음악 꺼짐') : (_muteEn?'🔊 Music On':'🔊 음악 켜짐');
  }
  function resumeGame(){
    state='playing';
    lastTime=performance.now();
    const btn=document.getElementById('pauseBtn'); if(btn) btn.textContent='⏸';
    const ui=document.getElementById('gameUI'); if(ui){ui.innerHTML='';ui.style.pointerEvents='none';}
  }
  function goLobby(){ SceneManager.go('lobby'); }

  function triggerBossWarning(){
    state='bossWarning'; warningTimer=WARNING_DUR;
    const _bwEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    const _chBoss = MONSTERS?.bosses?.[currentChapter];
    const _chKey  = bossType==='chapter_boss' ? 'final' : 'mid';
    const _chDef  = _chBoss?.[_chKey];
    const _fallback = bossType==='chapter_boss'
      ? {name:'목 없는 장군', nameEn:'The Headless General', sub:'귀-인-국을 무너뜨린 전쟁의 화신', subEn:'The incarnation of war that shattered Gwi-In-Guk', color:'#c04010'}
      : {name:'원귀장',       nameEn:'Ghost Warlord',        sub:'분노한 원혼의 수장',              subEn:'Leader of the enraged vengeful spirits',         color:'#8040d0'};
    const bDef = {
      name:  _bwEn ? (_chDef?.nameEn || _fallback.nameEn) : (_chDef?.name  || _fallback.name),
      sub:   _bwEn ? (_chDef?.subEn  || _fallback.subEn)  : (_chDef?.sub   || _fallback.sub),
      color: _chDef?.color || _fallback.color,
    };
    const ui=document.getElementById('gameUI'); if(!ui) return;
    ui.style.pointerEvents='none';
    ui.innerHTML=`
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.72);
        display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;">
        <div style="font-size:13px;color:#ff4040;letter-spacing:.15em;animation:wP .5s infinite alternate;">
          ⚠️ ${_bwEn?'B O S S  A P P E A R S':'보 스 등 장'} ⚠️</div>
        <div style="font-size:28px;font-weight:700;color:${bDef.color};text-shadow:0 0 20px ${bDef.color};">
          ${bDef.name}</div>
        <div style="font-size:13px;color:#8a7a6a;">${bDef.sub}</div>
        <div style="width:200px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-top:6px;">
          <div id="warningBarFill" style="height:100%;background:${bDef.color};width:0%;"></div>
        </div>
      </div>
      <style>@keyframes wP{from{opacity:.5}to{opacity:1}}</style>`;
  }

  let _loopCount = 0;
  let speedMult = 1;
  let _tileCache = {}; // 모드별 캐시: { decos, texRotated }
  let _tileCacheAttempts = {}; // [UPDATE 2026-07-22] 캐시가 안 굳는 경우(이미지 하나라도 로드 실패) 매프레임 재시도로 렉나던 버그 방지용 시도 횟수
  let autoMode = 0; // 0=수동, 1=반자동, 2=자동, 3=자동재도전
  // [UPDATE 2026-07-18] 자동 재도전 모드 추가 — 하드모드 특산품 파밍용, 클리어/실패 무관하게 같은 스테이지 반복
  const AUTO_MODES_KO = ['수동', '반자동', '자동', '자동재도전'];
  const AUTO_MODES_EN = ['Manual', 'Semi-Auto', 'Auto', 'Auto-Retry'];
  const AUTO_MODE_COLORS  = ['#80c8ff','#80ffb0','#ffb080','#ff80c0'];
  const AUTO_MODE_BORDERS = ['rgba(100,180,255,0.4)','rgba(80,255,120,0.4)','rgba(255,140,80,0.4)','rgba(255,100,180,0.4)'];
  function getAutoModeLabel(idx) {
    return (Lang.getCurrent()==='ko' ? AUTO_MODES_KO : AUTO_MODES_EN)[idx];
  }
  const AUTO_EVADE_RADIUS = 60;

  function getAutoDir() {
    const manual = Input.getDir();
    if (manual.x !== 0 || manual.y !== 0) return manual;
    if (!enemies || enemies.length === 0) return { x: 0, y: 0 };
    let ex = 0, ey = 0, count = 0;
    for (const e of enemies) {
      if (e.dead) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < AUTO_EVADE_RADIUS) {
        ex += dx / (dist + 1);
        ey += dy / (dist + 1);
        count++;
      }
    }
    if (count === 0) return { x: 0, y: 0 };
    const len = Math.hypot(ex, ey);
    return len > 0 ? { x: -ex / len, y: -ey / len } : { x: 0, y: 0 };
  }

  function cycleSpeed() {
    speedMult = speedMult === 1 ? 2 : speedMult === 2 ? 3 : 1;
    const btn = document.getElementById('speedBtn');
    if (btn) btn.textContent = speedMult + 'x';
    saveData = Save.load();
    saveData.speedMult = speedMult;
    Save.save(saveData);
  }

  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번②: 복수 애기씨 소환 — 혼돈석 30개 소모, 최대 3체
  function summonClone() {
    if (aegissiClones.length >= 3) return;
    const sd = Save.load();
    if ((sd.hondonseok || 0) < 30) return;
    sd.hondonseok -= 30;
    Save.save(sd);
    saveData = sd;
    aegissiClones.push({ x: player.x + (Math.random()-0.5)*60, y: player.y + (Math.random()-0.5)*60, atkCd: 0 });
    const costEl = document.getElementById('cloneBtnCost');
    if (costEl) costEl.textContent = aegissiClones.length >= 3 ? 'MAX' : '🌪️30';
  }

  function cycleAutoMode() {
    autoMode = (autoMode + 1) % 4;
    const btn = document.getElementById('autoBtn');
    if (btn) {
      btn.textContent = getAutoModeLabel(autoMode);
      btn.style.color = AUTO_MODE_COLORS[autoMode];
      btn.style.borderColor = AUTO_MODE_BORDERS[autoMode];
    }
    saveData = Save.load();
    saveData.autoMode = autoMode;
    Save.save(saveData);
  }

  function loop(now){
    rafId=requestAnimationFrame(loop);
    if(document.hidden){ lastTime=now; return; }
    const rawDt=Math.min((now-lastTime)/1000,0.05); lastTime=now;
    const dt = rawDt * speedMult;
    _loopCount++;
    if (_loopCount === 1) console.log('🎮 게임 루프 시작 state=', state);
    try {
      if(state==='bossWarning') updateBossWarning(dt);
      else if(state==='playing'||state==='farming') update(dt);
      else if(state==='talismanBreak') updateTalismanBreak(dt);
      render();
    } catch(e) {
      console.error('🔥 게임 루프 에러:', e.message, e.stack?.split('\n')[1]);
      // state 강제 리셋 제거
    }
  }

  function updateBossWarning(dt){
    warningTimer-=dt;
    const fill=document.getElementById('warningBarFill');
    if(fill) fill.style.width=`${(1-warningTimer/WARNING_DUR)*100}%`;
    if(warningTimer<=0){
      const ui=document.getElementById('gameUI');
      if(ui){ui.innerHTML='';ui.style.pointerEvents='none';}
      boss=new Boss(player.x,player.y-220,bossType,Math.floor(elapsed/20),currentChapter);
      window._boss=boss; bossSpawned=true; state='playing';
    }
  }

  // [UPDATE 2026-08-05] 부적 파괴 연출 — 몹/전투 로직은 전부 멈춘 채 카메라만 부적 쪽으로 이동시키고
  // (render()의 camX/camY 계산 참고) 부적 스프라이트를 서서히 페이드아웃(_drawTalisman 참고)한 뒤 패배 처리.
  function updateTalismanBreak(dt){
    _talismanDeathT += dt;
    if(_talismanDeathT >= TALISMAN_BREAK_DURATION){
      endGame(false);
    }
  }

  function update(dt){
    if(state==='farming'){
      farmingTimer-=dt;
      // 파밍 중 - 플레이어 이동 + 아이템 수집만 허용
      if(farmingTimer<=0){ endGame(true); return; }
      const dir = autoMode > 0 ? getAutoDir() : Input.getDir();
      player.update(dt,dir);
      // [UPDATE 2026-07-13] 260713_MTOPC.md 20번: 파밍 구간(스폰 종료~결과화면 전) 왕복 이동이
      // 파밍 타임(5초)보다 오래 걸려 못 먹는 신고 대응 — 파밍 중에만 자석 범위 5배 적용
      // [UPDATE 2026-07-19] 3배 → 5배 상향
      const _farmMagnet = player.magnetRange * 5;
      // 골드/아이템 수집
      for(const g of goldDrops){ g.update(dt,player.x,player.y,_farmMagnet); }
      goldDrops=goldDrops.filter(g=>!g.dead);
      for(const b of bigGoldDrops){ b.update(dt,player.x,player.y,_farmMagnet);
        if(b.dead){ _collectBigGold(b); }
      }
      bigGoldDrops=bigGoldDrops.filter(b=>!b.dead);
      for(const s of specialItems){ s.update(dt,player.x,player.y); }
      specialItems=specialItems.filter(s=>!s.dead);
      // 영혼 드랍 (시즌2)
      for(const sd of soulDrops){ sd.update(dt,player.x,player.y,_farmMagnet);
        if(sd.dead){ _collectSoulDrop(sd); }
      }
      soulDrops=soulDrops.filter(sd=>!sd.dead);
      // XP 오브
      for(const o of xpOrbs){ o.update(dt,player.x,player.y,_farmMagnet);
        // [UPDATE 2026-07-31] 파밍 구간 XP 획득 경로에도 어계 축복 배율 동일 적용(빠뜨리면 여기로 우회 파밍 가능)
        if(o.dead&&player.gainXp) player.gainXp(Math.max(1,Math.floor((o.val||o.value||1)*(player._blessingXpMult||1))));
      }
      xpOrbs=xpOrbs.filter(o=>!o.dead);
      return;
    }
    if(state!=='playing') return;
    elapsed+=dt; timeLeft-=dt;

    // [UPDATE 2026-07-10] 무기별 데미지 미터 — 최근 3초 로그를 매 프레임 정리해서 부드러운 DPS 계산 (1초 단위로 뚝뚝 끊기지 않게)
    window._gameElapsed = elapsed;
    window._curChapterForEnemyScale = (gameMode==='normal') ? currentChapter : 0; // [UPDATE 2026-07-10] 초반 챕터 완화용 — 일반 스테이지에서만 적용(무한던전 등은 currentChapter=1 고정 버그라 제외)
    window._stage1DmgEase = (gameMode==='normal' && stageId===1); // [UPDATE 2026-07-15] 튜토리얼용 — 스테이지1 한정 몬스터 공격력 대폭 완화
    // [UPDATE 2026-07-31] 성능: 히트 1건마다 {t,k,d} 객체를 배열에 쌓고 매 프레임 그 전체를 다시 합산하던 구조를
    // "시간 버킷 누적"으로 교체. 적이 900마리인 구간에선 초당 수천 건이 쌓여서
    // (1) 객체 할당 폭주 → GC, (2) splice로 인한 O(n) 이동, (3) 매 프레임 수천 건 재합산이 겹쳤다.
    // 이제 0.25초 단위 버킷 12개만 유지하므로, 기록은 숫자 덧셈 한 번이고 합산도 12개만 돈다.
    // 결과값(_dpsDisplay: 최근 3초 평균 DPS)의 의미는 기존과 동일하다.
    const DPS_WINDOW = 3.0, DPS_BUCKET = 0.25;
    if (window._dpsBuckets && window._dpsBuckets.length) {
      const minIdx = Math.floor((elapsed - DPS_WINDOW) / DPS_BUCKET);
      const bs = window._dpsBuckets;
      while (bs.length && bs[0].i < minIdx) bs.shift(); // 최대 12개라 shift 비용도 무시할 수준
      const _sums = {};
      for (const b of bs) for (const k in b.s) _sums[k] = (_sums[k]||0) + b.s[k];
      const _disp = {};
      for (const k in _sums) _disp[k] = _sums[k] / DPS_WINDOW;
      window._dpsDisplay = _disp;
    }
    // [UPDATE 2026-07-10] hitEnemy() 우회 경로(체인/귀신손/신검 경로판정/장판aoe/독도트)용 DPS 기록 헬퍼
    // [UPDATE 2026-07-31] hitEnemy()도 이제 이 헬퍼를 통해 기록한다(중복 구현 제거)
    window._trackDps = window._trackDps || function(srcType, dmg) {
      if (!srcType || !dmg) return;
      if (!window._dpsTotal) window._dpsTotal = {};
      window._dpsTotal[srcType] = (window._dpsTotal[srcType]||0) + dmg;
      const bs = window._dpsBuckets || (window._dpsBuckets = []);
      const idx = Math.floor((window._gameElapsed||0) / DPS_BUCKET);
      let b = bs.length ? bs[bs.length-1] : null;
      if (!b || b.i !== idx) { b = { i: idx, s: {} }; bs.push(b); }
      b.s[srcType] = (b.s[srcType]||0) + dmg;
    };
    if(player._invincible > 0) player._invincible -= dt;
    if(player.dead){endGame(false);return;}
    if(timeLeft<=0){timeLeft=0;endGame(false);return;}

    // [UPDATE 2026-07-22] 선술 스킬트리 준필살기/필살기 자동시전
    _updateSeonsulAbilities(dt);
    _updateLawEffects(dt);
    _updateLawVisualEffects(dt);
    _updateSeonsulLightningQueue(dt);
    _updateSeonsulEffects(dt);

    // ── 차원석 시간 소모: 60초마다 2개 차감 (시즌2 이후 전체) ──
    if (stageId >= 101) {
      _s2CwsDrainTimer += dt;
      if (_s2CwsDrainTimer >= 60) {
        _s2CwsDrainTimer -= 60;
        saveData.chaewonseok = Math.max(0, (saveData.chaewonseok || 0) - 2);
        Save.save(saveData);
        showFloatingText(player.x, player.y - 40, '🔷-2', '#ff8080');
        // 차원석 0이면 디버프 발동
        if (saveData.chaewonseok <= 0 && !_s2Debuff) {
          _s2Debuff = true;
          player._healBlocked = stageId <= 200;
          player._xpBlocked   = stageId >= 301 && stageId <= 400;
          const isKo = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'ko' : true;
          showFloatingText(player.x, player.y - 60, isKo ? '💀 잠식 발동!' : '💀 Corrupted!', '#c060ff');
        }
      }
    }

    // ── 시즌2 잠식 디버프: 초당 최대HP 0.3% 감소 (시즌2 한정) ──
    if (_s2Debuff && stageId <= 200 && player._invincible <= 0) {
      player.hp = Math.max(1, player.hp - player.maxHp * 0.003 * dt);
    }
    // [UPDATE 2026-07-18] 시즌3(백사도) 잠식 디버프: 랜덤 조작 반전 (confuse_field 패턴과 동일한 타이머 재사용)
    if (_s2Debuff && stageId >= 201 && stageId <= 300) {
      player._controlReversed = Math.max(player._controlReversed || 0, dt + 0.1);
    }

    // ── 모드별 게임 로직 ──
    if (gameMode === 'infinite') {
      // 무한 모드: 200킬마다 챕터 +1 (최대 ch10)
      const newChapter = Math.min(10, 1 + Math.floor(kills / 200));
      if (newChapter > currentChapter) {
        currentChapter = newChapter;
        Spawner.setChapter(currentChapter);
        const isKo = Lang.getCurrent()==='ko';
        showFloatingText(player.x, player.y - 60,
          isKo ? `⚠️ 챕터 ${currentChapter} 몬스터 출현!` : `⚠️ Ch.${currentChapter} Monsters!`,
          '#f0c040');
      }
    } else if (gameMode === 'boss_rush') {
      // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 고정 10마리 시퀀스 폐기 → 해금 챕터 풀을 무한 반복,
      // 등장 순번(bossRushIndex)을 wave로 넘겨 보스 1마리 등장마다 소폭 복리 강화(HP×1+n*0.12, DMG×1+n*0.08 — Boss 생성자 기존 공식 재사용)
      if (elapsed >= rushNextSpawnAt && rushBossPool.length) {
        const b = rushBossPool[bossRushIndex % rushBossPool.length];
        const _ang = Math.random()*Math.PI*2; // 기존 보스와 안 겹치도록 스폰 위치 분산
        const newBoss = new Boss(
          player.x+Math.cos(_ang)*220, player.y+Math.sin(_ang)*220,
          b.type, bossRushIndex, b.ch
        );
        newBoss._rushBossNum = bossRushIndex; // 처치 보상 스케일링용
        rushBosses.push(newBoss);
        bossRushIndex++;
        rushNextSpawnAt = elapsed + BOSS_RUSH_INTERVAL;
      }
    } else {
      // 일반 모드: 킬카운트 체크
      if(!killTargetReached&&kills>=killTarget){
        killTargetReached=true;
        if(isBossStage&&!bossSpawned){triggerBossWarning();return;}
        else if(!isBossStage){
          state='farming';
          farmingTimer=5.0;
          // 몬스터 스폰 중단 - 기존 몬스터만 처리
          enemies.forEach(e=>{ if(!e.dead) e.dead=true; });
          return;
        }
      }
    }

    const dir = autoMode > 0 ? getAutoDir() : Input.getDir();
    player.update(dt,dir);

    if(screenShake>0){
      screenShake-=dt*8;
      shakeX=(Math.random()-.5)*screenShake*6; shakeY=(Math.random()-.5)*screenShake*6;
    } else {shakeX=0;shakeY=0;}

    for(const pe of petEntities) pe.update(dt,player,enemies,projectiles,{xpOrbs,goldDrops,bigGoldDrops,soulDrops}); // [UPDATE 2026-07-11] 강다리 자동수집 AI용 아이템 배열 전달
    updateEnemyDebuffs(enemies,dt);

    if(boss && gameMode!=='boss_rush'){
      // [UPDATE 2026-08-06] 파트2 "건방진!" 인레이지 — 플레이어가 보스 근접범위(BOSS_AGGRO_PLAYER_RANGE) 경계를
      // 3번 왔다갔다(=타겟이 플레이어↔부적으로 3번 전환)하면, 얕보인 걸 느낀 보스가 넉백+데미지로 견제한 뒤
      // 부적 근처로 이동해 사라졌다 나타나며 검은 번개로 부적을 2연타. 정상 패턴 로테이션은 그동안 정지.
      if (!boss._enrage && talisman && talisman.hp > 0) {
        const _distNow = Math.hypot(player.x-boss.x, player.y-boss.y);
        const _isPlayerNow = _distNow <= BOSS_AGGRO_PLAYER_RANGE;
        if (boss._enrageLastWasPlayer !== null && boss._enrageLastWasPlayer !== undefined && boss._enrageLastWasPlayer !== _isPlayerNow) {
          boss._enrageCrossCount = (boss._enrageCrossCount||0) + 1;
          if (boss._enrageCrossCount >= 3) {
            boss._enrageCrossCount = 0;
            const _isKoBoss = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en') ? false : true;
            showFloatingText(boss.x, boss.y-boss.size-20, _isKoBoss?'건방진!':'Insolent!', '#ff5050');
            boss._enrage = { phase:'shout', t:0 };
          }
        }
        boss._enrageLastWasPlayer = _isPlayerNow;
      }
      if (boss._enrage) {
        _updateBossEnrage(boss, dt);
      } else {
        projectiles.push(...boss.update(dt,_resolveBossTarget(boss),enemies));
      }
      if(boss._summonPending){
        boss._summonPending=false;
        // [UPDATE 2026-08-06] 파트2에서 보스 소환 잡몹도 부적을 우선 노리도록 기존 침공형 플래그 재사용
        const _bossInvasion = !!(talisman && talisman.hp > 0);
        for(const sp of boss.summonSpots){
          const _e = new Enemy(sp.x,sp.y,'ghost',Math.floor(elapsed/20),true);
          if (_bossInvasion) _e._invasionType = true;
          enemies.push(_e);
        }
      }
      if(boss.dead&&boss.deathT>0.8){
        for(let i=0;i<12;i++)
          xpOrbs.push(new XpOrb(boss.x+(Math.random()-.5)*80,boss.y+(Math.random()-.5)*80,Math.floor(boss.xpVal/12)));
        // 보스 확정 bigGold 드랍 1~3개
        for(let _bi=0;_bi<1+Math.floor(Math.random()*3);_bi++){
          bigGoldDrops.push(new BigGoldDrop(
            boss.x+(Math.random()-0.5)*80,
            boss.y+(Math.random()-0.5)*80
          ));
        }
        // 보스 처치 확정 💎+1
        saveData.gems = (saveData.gems || 0) + 1;
        Save.save(saveData);
        showFloatingText(boss.x, boss.y - 80, '💎+1', '#c080ff');
        // [UPDATE 2026-07-18] 시즌4(귀허계) 스토리 스테이지 순리석 획득 경로 ② — 보스 확정드랍 (미들보스 3~5개 / 챕터보스 8~12개)
        if (gameMode === 'normal' && stageId >= 301 && stageId <= 400) {
          const _ssMin = bossType === 'chapter_boss' ? 8 : 3;
          const _ssMax = bossType === 'chapter_boss' ? 12 : 5;
          const _ssCnt = _ssMin + Math.floor(Math.random() * (_ssMax - _ssMin + 1));
          for (let _si = 0; _si < _ssCnt; _si++) {
            bigGoldDrops.push(new BigGoldDrop(boss.x + (Math.random() - 0.5) * 100, boss.y + (Math.random() - 0.5) * 100, 'sullriseok'));
          }
          showFloatingText(boss.x, boss.y - 90, `🌊+${_ssCnt}`, '#8090e8');
        }
        // [UPDATE 2026-07-19] 보물 창고 특산품 — 하드 난이도 보스 확정드랍 (미들보스 1개 / 챕터보스 2개)
        if (gameMode === 'normal' && difficulty === 'hard') {
          const _spId = _getSeasonSpecialtyId(stageId);
          if (_spId) {
            const _spCnt = bossType === 'chapter_boss' ? 2 : 1;
            for (let _spi = 0; _spi < _spCnt; _spi++) {
              bigGoldDrops.push(new BigGoldDrop(boss.x + (Math.random() - 0.5) * 100, boss.y + (Math.random() - 0.5) * 100, _spId));
            }
          }
        }
        // [UPDATE 2026-07-17] 명(命) 10단계 — 보스 처치 시 추가 보상(빅골드 드랍 2개 추가)
        if (player._myeongBossBonus) {
          for (let _mi = 0; _mi < 2; _mi++) {
            bigGoldDrops.push(new BigGoldDrop(boss.x + (Math.random() - 0.5) * 100, boss.y + (Math.random() - 0.5) * 100));
          }
          showFloatingText(boss.x, boss.y - 100, (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en')?'☯ Fate Bonus!':'☯ 명(命)의 가호!', '#e0c8ff');
        }

        boss=null; window._boss=null; bossSpawned=false;

        // [UPDATE 2026-07-15] 보스 처치 직후에도 일반 스테이지의 킬타겟 달성과 동일하게 'farming' 상태로 전환.
        // 기존엔 setTimeout+state='playing' 유지라서, 보스가 흘린 XP를 먹으면 레벨업 카드가 또 뜨던 문제
        // (일반 스테이지 파밍 구간은 조용히 스탯만 오르도록 이미 설계돼 있었는데 보스 스테이지만 예외였음)
        enemies.forEach(e=>{ if(!e.dead) e.dead=true; });
        showFloatingText(player.x, player.y-60, (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en')?'🏆 Stage ends in 5s!':'🏆 5초 후 스테이지 종료!', '#f0d040');
        state='farming';
        farmingTimer=5.0;
        return;
      }
      for(const p of projectiles){
        if(!p.dead&&boss&&!boss.dead&&Math.hypot(boss.x-p.x,boss.y-p.y)<boss.size+p.radius){
          boss.takeDamage(p.damage); p.pierced++;
          if(p.pierced>(p.pierce||0)) p.dead=true;
          if(boss.dead) screenShake=2;
        }
      }
    }

    if(gameMode==='boss_rush' && rushBosses.length){
      // 보스 러쉬: 동시에 여러 마리 존재 가능. 처치해도 멈추지 않고 계속 진행.
      for(const rb of rushBosses){
        // 죽은 보스도 update()는 계속 호출해야 deathT(사망 연출 타이머)가 진행됨
        // [UPDATE 2026-08-06] 보스 러쉬는 gameMode!=='normal'이라 talisman이 항상 null이므로
        // _resolveBossTarget()은 실질적으로 항상 player를 반환함 — 다른 보스 경로와 코드 통일용.
        projectiles.push(...rb.update(dt,_resolveBossTarget(rb),enemies));
        if(rb.dead) continue; // 사망 후에는 소환/충돌판정 등 전투 로직만 건너뜀
        if(rb._summonPending){
          rb._summonPending=false;
          const _rbInvasion = !!(talisman && talisman.hp > 0);
          for(const sp of rb.summonSpots){
            const _e2 = new Enemy(sp.x,sp.y,'ghost',Math.floor(elapsed/20),true);
            if (_rbInvasion) _e2._invasionType = true;
            enemies.push(_e2);
          }
        }
        for(const p of projectiles){
          if(!p.dead&&!rb.dead&&Math.hypot(rb.x-p.x,rb.y-p.y)<rb.size+p.radius){
            rb.takeDamage(p.damage); p.pierced++;
            if(p.pierced>(p.pierce||0)) p.dead=true;
            if(rb.dead) screenShake=2;
          }
        }
      }
      // 사망 처리 (방금 죽은 보스만 - deathT가 막 넘어간 시점)
      for(const rb of rushBosses){
        if(rb.dead && rb.deathT>0.8 && !rb._rewarded){
          rb._rewarded=true;
          for(let i=0;i<12;i++)
            xpOrbs.push(new XpOrb(rb.x+(Math.random()-.5)*80,rb.y+(Math.random()-.5)*80,Math.floor(rb.xpVal/12)));
          // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 등장 순번 기준 소폭 복리 다이아 보상(20마리≈275개, 40마리≈600개 목표로 캘리브레이션)
          // + bigGold(→_collectBigGold에서 추가 💎, 랜덤 보너스)
          const _gemReward = Math.max(1, Math.floor(12 + (rb._rushBossNum||0)*0.15));
          saveData=Save.load();
          saveData.gems=(saveData.gems||0)+_gemReward;
          window.earnedSpecial=(window.earnedSpecial||0)+_gemReward;
          saveData.bossrushRecord=Math.max(saveData.bossrushRecord||0, bossRushIndex); // [UPDATE 2026-07-12] 대소문자 버그 수정(bossRushRecord→bossrushRecord)
          Save.save(saveData);
          showFloatingText(rb.x,rb.y-70,'💎+'+_gemReward,'#c080ff');
          // 추가 bigGold 드랍 (1~2개, _rewardMode='bossrush'로 인해 💎로 전환됨)
          for(let _bi=0;_bi<1+Math.floor(Math.random()*2);_bi++){
            bigGoldDrops.push(new BigGoldDrop(rb.x+(Math.random()-0.5)*80, rb.y+(Math.random()-0.5)*80));
          }
        }
      }
      // 완전히 죽어서 연출까지 끝난 보스는 배열에서 제거
      rushBosses = rushBosses.filter(rb=>!(rb.dead && rb.deathT>1.5));
      // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 무한 확장형이라 시퀀스 소진에 의한 자동 종료 없음 — 플레이어 사망/시간초과로만 종료
    }

    window._enemies = enemies;
    if (!killTargetReached) Spawner.update(dt,elapsed,player,enemies,canvas.width,canvas.height,kills,saveData.dungeonUpgradeLv||0);
    // [UPDATE 2026-07-17] 시즌4(귀허계) 특화: 과거 잔상 → 5초 합체 실체화
    if (gameMode==='normal' && !killTargetReached && currentChapter>=31 && currentChapter<=40) _updateAfterimages(dt);

    const alive=enemies.filter(e=>!e.dead);
    // 무기는 주/보조 구분 없이 전부 보스도 조준 대상에 포함 (일반/보스러시 모두)
    // [UPDATE 2026-07-14] 260714_MTOPC.md 1번: 서브무기만 alive(보스 제외)로 분리돼있던 방치 버그 수정 —
    // 귀신손/번개장판 등 타겟선정형 서브무기가 보스전에서 일반몹 전멸 시 헛발질하던 문제
    const aliveWithBoss = (gameMode==='boss_rush' && rushBosses.length)
      ? [...alive, ...rushBosses.filter(rb=>!rb.dead)]
      : (boss && !boss.dead) ? [...alive, boss] : alive;
    for(const w of weapons){
      const _ps=w.tick(dt,player,aliveWithBoss); if(_ps?.length) projectiles.push(..._ps.filter(p=>p!=null));
      // [UPDATE 2026-08-04] 박수 공격 모션 — 주무기가 실제로 발사한 프레임에만 트리거(보조무기는 제외)
      if(_ps?.length && w.isMain && player._pulseAttack) player._pulseAttack();
    }
    // [UPDATE 2026-07-26] 히든 시너지 배치3 사전 패스 — 회전 포메이션(가온×무사, 아람×단비)은 update() 전에 각도/반경을 미리 갱신해야 반영됨
    if (window._gaonMugsaSpin) {
      const _gaon = companions.find(c => c.id === 'gaon'), _mugsa = companions.find(c => c.id === 'mugsa');
      if (_gaon && _mugsa) {
        _gaonMugsaSpinAngle += dt * 1.1; // 시계방향
        _mugsa.formationAngle = _gaonMugsaSpinAngle;
        _gaon.formationAngle = _gaonMugsaSpinAngle + Math.PI; // 플레이어 기준 항상 대칭(안 잡히게 도망)
      }
    }
    if (window._aramDanbiBicker) {
      const _aram = companions.find(c => c.id === 'aram'), _danbi = companions.find(c => c.id === 'danbi');
      if (_aram && _danbi) {
        _aramDanbiBickerT += dt;
        const CYCLE = 3.3, SNAP = 0.35;
        const phase = _aramDanbiBickerT % CYCLE;
        const baseR = _aram.orbitRadius;
        const mult = phase < CYCLE - SNAP
          ? 1.6 - 0.6 * (phase / (CYCLE - SNAP))              // 천천히 붙는 구간
          : 1.0 + 0.6 * ((phase - (CYCLE - SNAP)) / SNAP);    // 훅 멀어지는 구간
        _aram.formationRadius = baseR * mult;
        _danbi.formationRadius = baseR * mult;
        _danbi.formationAngle = _aram.formationAngle + Math.PI; // 마주보는 구도
      }
    }

    for(const c of companions){const ps=c.update(dt,player,alive);if(ps?.length)projectiles.push(...ps.filter(p=>p!=null));}

    // [UPDATE 2026-07-26] 히든 시너지 배치3 사후 패스
    // 생령 곁을 도는 봉황 — 두 동료 모두 update 이후 위치를 직접 덮어씀(플레이어가 아닌 다른 동료를 궤도 중심으로 삼음)
    if (window._soheeOrbit) {
      const _saeng = companions.find(c => c.id === 'geumgang'), _bong = companions.find(c => c.id === 'sohee');
      if (_saeng && _bong) {
        // [UPDATE 2026-07-26] 사용자 피드백: 도는 속도 매우 느리게 + 생령을 바라보도록(오른쪽에 있으면 왼쪽을 보고, 왼쪽에 있으면 오른쪽을 봄)
        _soheeOrbitAngle += dt * 0.15;
        _bong.x = _saeng.x + Math.cos(_soheeOrbitAngle) * 50;
        _bong.y = _saeng.y + Math.sin(_soheeOrbitAngle) * 50;
        _bong.facing = (_bong.x >= _saeng.x) ? -1 : 1;
        if (_saeng._firedAtk) _bong._questionMarks.push({ t: 0 });
      }
    }
    // 강제발동 체인 트리거 (무사→가온 공격, 단비⇄아람 힐/공격, 매화검선⇄허무검사 궁극기)
    for (const c of companions) {
      if (!c._chainLinks || !c._chainLinks.length) continue;
      for (const link of c._chainLinks) {
        const fired = link.event === 'atk' ? c._firedAtk : link.event === 'ult' ? c._firedUlt : c._firedHeal;
        if (!fired) continue;
        const target = companions.find(t => t.id === link.targetId);
        if (!target) continue;
        let result = null;
        if (link.targetAction === 'atk') result = target.forceAtk(alive, player);
        else if (link.targetAction === 'ult') result = target.forceUlt(alive, player);
        else if (link.targetAction === 'heal') result = target.forceHeal(player);
        if (result) {
          if (Array.isArray(result)) projectiles.push(...result.filter(p => p != null));
          else projectiles.push(result);
        }
      }
    }

    // [UPDATE 2026-07-26] 히든 시너지 배치4 — 카메오 난입(사신진/저승총출동) 사이클 진행: 20초 대기 → 10초 참전 → 사라짐 반복
    for (const cs of _cameoState) {
      cs.t += dt;
      if (cs.phase === 'waiting' && cs.t >= 20) {
        cs.phase = 'active'; cs.t = 0;
        const _def = GAME_DATA.companions.find(c => c.id === cs.missingId);
        if (_def) {
          const _ent = new CompanionEntity(_def, companions.length, true); // forceBaseStats=true → 0성 고정(A안)
          // 화면 가장자리 바깥에서 난입해 포메이션으로 빨려들어오는 연출
          const _spawnAng = Math.random() * Math.PI * 2;
          _ent.x = player.x + Math.cos(_spawnAng) * 500;
          _ent.y = player.y + Math.sin(_spawnAng) * 500;
          companions.push(_ent);
          cs.entity = _ent;
          // 등장 시 그룹 전원(장착 3 + 카메오) 공격 쿨 초기화
          for (const gid of cs.ids) {
            const gc = companions.find(c => c.id === gid);
            if (gc) gc.atkCd = 0;
          }
        }
      } else if (cs.phase === 'active' && cs.t >= 10) {
        cs.phase = 'waiting'; cs.t = 0;
        if (cs.entity) {
          const idx = companions.indexOf(cs.entity);
          if (idx !== -1) companions.splice(idx, 1);
          cs.entity = null;
        }
      }
    }

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번②: 복수 애기씨(분신) — 체력 없음(피격 무시, enemies의 타겟 목록에
    // 애초에 포함 안 시켜서 자연히 무적), 본체 공격력의 40%로 가장 가까운 적을 공격
    for(const cl of aegissiClones){
      cl.atkCd = (cl.atkCd||0) - dt;
      let nearest=null, nd=Infinity;
      for(const e of alive){ const d=Math.hypot(e.x-cl.x,e.y-cl.y); if(d<nd){nd=d;nearest=e;} }
      if(nearest){
        const dist = nd||1;
        if(dist>60){ cl.x += (nearest.x-cl.x)/dist*140*dt; cl.y += (nearest.y-cl.y)/dist*140*dt; }
        else if(cl.atkCd<=0){
          cl.atkCd = 1.0;
          nearest.takeDamage(Math.max(1,Math.floor(player.totalAtk*0.4)), false, 'aegissi_clone');
          if(window._hitEffects) window._hitEffects.push({x:nearest.x,y:nearest.y,t:0,life:0.3,key:'hit_normal',ox:0,oy:-8});
        }
      } else {
        // 적 없으면 본체 근처로 배회 복귀
        const d2=Math.hypot(player.x-cl.x,player.y-cl.y);
        if(d2>80){ cl.x += (player.x-cl.x)/d2*100*dt; cl.y += (player.y-cl.y)/d2*100*dt; }
      }
    }

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 전투 로직
    _updateTransform(dt, alive);

    for(const e of enemies){
      if(!e.dead&&e._charmed>0){
        e._charmed-=dt;
        if(e._charmed<=0){ e._charmed=0; }
        else {
          // 현혹: 가장 가까운 비현혹 적을 타겟으로 이동
          const _ct = _findNearestEnemy(e.x, e.y, x => x._charmed || x === e);
          if(_ct){
            e.update(dt,_ct.x,_ct.y);
            if(e.hitTest(_ct.x,_ct.y,_ct.size)) _ct.takeDamage(e.damage*dt*3);
          } else {
            e.update(dt,e.x,e.y); // 타겟 없으면 제자리
          }
          continue; // 플레이어 공격 스킵
        }
      }
      // [UPDATE 2026-08-03] 파트2 침공형 — 부적을 타겟으로 이동/공격(플레이어 공격은 스킵)
      // [UPDATE 2026-08-05] 피격 1회당 2초 무적(talisman._iframe) — 다단히트로 순삭당하지 않도록.
      // 침공형 데미지는 원래 "플레이어용" 수치라 부적 상대로는 절반만 적용(밸런스 요청).
      // 원거리 몹의 투사체도 부적을 노리도록 _targetTalisman 플래그를 달아서 아래 enemyProjs 루프에서 구분.
      // [UPDATE 2026-08-05] "암살자처럼 반짝반짝 하며 샤샤샥" 요청 — 평소엔 그냥 걷다가, 주기적으로 잠깐 제자리에서
      // 반짝인 뒤(예열) 부적 쪽으로 순간 이동(대시)함. 신규 attackPattern을 만들지 않고 game.js 침공 전용 분기에서만
      // e.x/e.y를 직접 밀어서 처리 — 다른 몬스터 타입/일반 침공 안 하는 상황에는 전혀 영향 없음.
      if(e._invasionType && talisman){
        if(e._dashCd === undefined){ e._dashCd = 0.6 + Math.random()*0.8; e._dashWindup = 0; }
        const _distToTal = Math.hypot(talisman.x-e.x, talisman.y-e.y);
        if(e._dashWindup > 0){
          // 예열 중 — 제자리에서 반짝반짝
          e._dashWindup -= dt;
          if(Math.random() < dt*20 && window._hitEffects){
            window._hitEffects.push({x:e.x+(Math.random()-0.5)*18, y:e.y+(Math.random()-0.5)*18, t:0, life:0.22, key:'_invasionSparkle', ox:0, oy:0});
          }
          if(e._dashWindup <= 0 && _distToTal > 30){
            // 샤샥 — 순간이동 대시
            const dx=talisman.x-e.x, dy=talisman.y-e.y, d=_distToTal||1;
            const hop = Math.min(150, Math.max(0, d-24));
            const _fromX=e.x, _fromY=e.y;
            e.x += (dx/d)*hop; e.y += (dy/d)*hop;
            if(window._hitEffects){
              window._hitEffects.push({x:_fromX,y:_fromY,t:0,life:0.28,key:'_invasionDashTrail',ox:0,oy:0});
              window._hitEffects.push({x:e.x,y:e.y,t:0,life:0.24,key:'_invasionSparkle',ox:0,oy:0});
            }
            e._dashCd = 1.4 + Math.random()*0.9; // 다음 대시까지 대기
            e._dashWindup = 0;
          }
        } else {
          e._dashCd -= dt;
          if(e._dashCd <= 0 && _distToTal > 40) e._dashWindup = 0.32; // 예열 시작
        }
        // 예열 중엔 제자리(자체 애니메이션 타이머만 갱신), 아니면 평소처럼 걸어서 접근
        const _tp = (e._dashWindup > 0) ? e.update(dt,e.x,e.y) : e.update(dt,talisman.x,talisman.y);
        if(_tp && _tp.isEnemyProjectile){ _tp._targetTalisman = true; enemyProjs.push(_tp); }
        if(!e.dead && (talisman._iframe||0)<=0 && e.hitTest(talisman.x,talisman.y,20)){
          _applyTalismanDamage(e.damage*0.5); // 침공형 데미지 절반(밸런스 요청)
        }
        continue;
      }
      // [UPDATE 2026-07-15] 260715_MTOPC.md 1번: 원거리 몹(attackPattern:'ranged')이 리턴하는 투사체를 캐치 —
      // 기존엔 리턴값을 아예 안 받아서 원거리 공격이 통째로 무효화되던 버그
      const _ep = e.update(dt,player.x,player.y);
      if(_ep && _ep.isEnemyProjectile) enemyProjs.push(_ep);
      if(!e.dead&&e.hitTest(player.x,player.y,14)){
        player.takeDamage(e.damage, e); // [UPDATE 2026-07-06] 명부강화 반사용 공격자 전달
        if(player.iframe>0.5) screenShake=1;
      }
    }
    // [UPDATE 2026-08-05] 피격 무적/흔들림 타이머 감소 — 프레임당 1회만 감소해야 하므로 적 루프가 아닌 여기서 처리.
    if(talisman && talisman._iframe>0) talisman._iframe -= dt;
    if(talisman && talisman._shakeT>0) talisman._shakeT = Math.max(0, talisman._shakeT - dt);
    // [UPDATE 2026-08-03] 부적 자체 공격 — 원래 애기씨의 주무기(부적)였다는 설정이므로, 느리지만 스스로도
    // 가장 가까운 적을 때린다. 대장간 "수호 부적" 일반강화(aegissiTalisman.pwrLv)로 데미지 증가.
    // [UPDATE 2026-08-05] 기본 공격력 15 → 50으로 상향(밸런스 요청). 레벨당 증가폭(+3)은 유지.
    if(talisman && talisman.hp>0){
      talisman._atkCd = (talisman._atkCd||0) - dt;
      if(talisman._atkCd<=0){
        const _pwrLv = (saveData.aegissiTalisman && saveData.aegissiTalisman.pwrLv) || 1;
        talisman._atkCd = 2.2; // 플레이어 기본 부적(1.2초)보다 느림 — "지키는 입장"이라는 톤
        const _range = 260;
        const _tgt = findNearestEnemies(talisman.x,talisman.y,enemies,1)[0];
        if(_tgt && Math.hypot(_tgt.x-talisman.x,_tgt.y-talisman.y) <= _range){
          const dx=_tgt.x-talisman.x, dy=_tgt.y-talisman.y, d=Math.hypot(dx,dy)||1;
          const dmg = 50 + (_pwrLv-1)*3;
          projectiles.push(new Projectile(talisman.x,talisman.y,(dx/d)*260,(dy/d)*260,dmg,
            {pierce:0,radius:14,life:2.0,type:'talisman',srcType:'talisman',
             color:'#e04040',glow:'rgba(220,60,40,.5)'}));
        }
      }
    }
    // [UPDATE 2026-08-03] 파트2 부적 파괴 = 패배
    // [UPDATE 2026-08-05] 즉시 게임오버 대신, 부적 쪽으로 카메라 이동 + 페이드아웃 연출(_talismanDeathT) 후 패배 처리.
    // state를 'talismanBreak'로 바꾸면 update()가 더 이상 안 돌아서(loop()의 상태 분기 참고) 이후 로직은 전부 스킵됨.
    if(talisman && talisman.hp<=0 && state==='playing'){
      state = 'talismanBreak';
      _talismanDeathT = 0;
      return;
    }

    // [UPDATE 2026-07-15] 260715_MTOPC.md 1번: 원거리 몹 투사체 이동/충돌/수명 처리 —
    // 배열/드로잉은 이미 있었지만 이 처리 로직 자체가 통째로 누락돼 있었음
    for(const ep of enemyProjs){
      if(ep.dead) continue;
      ep.x += ep.vx*dt; ep.y += ep.vy*dt;
      ep.t += dt; ep.life -= dt;
      if(ep.life<=0){ ep.dead=true; continue; }
      // [UPDATE 2026-08-05] 침공형 몹의 원거리 공격은 부적을 노림(플레이어 무시) — 예전엔 근접만 부적을 보고
      // 원거리는 무조건 플레이어를 때려서, 원거리 침공형이 사실상 회피 수단이 되던 버그.
      if(ep._targetTalisman){
        if(talisman && talisman.hp>0 && Math.hypot(talisman.x-ep.x, talisman.y-ep.y) < ep.radius+20){
          if((talisman._iframe||0)<=0){
            _applyTalismanDamage(ep.damage*0.5); // 침공형 데미지 절반(밸런스 요청)
          }
          ep.dead = true;
        }
        continue;
      }
      if(Math.hypot(player.x-ep.x, player.y-ep.y) < ep.radius+14){
        player.takeDamage(ep.damage);
        if(player.iframe>0.5) screenShake=1;
        ep.dead=true;
      }
    }

    for(const p of projectiles){
      if(!p) continue; // undefined 방어
      // 저승낫 바운스: 맞으면 가장 가까운 미히트 적으로 튕김, 데미지 5% 감소
      if(p._bounce){
        // 독침 트레일: 날아가면서 독 웅덩이 생성
        if(p._poisonTrail){
          p._trailTimer=(p._trailTimer||0)+dt;
          if(p._trailTimer>=0.12){
            p._trailTimer=0;
            projectiles.push(new Projectile(p.x,p.y,0,0,0,
              {radius:14,life:0.3,aoe:14,type:'poison_mist',
               color:'#80e040',glow:'rgba(80,200,30,.4)'}));
          }
        }
        // 가장 가까운 미히트 적 향해 서서히 유도
        const _hmTgt = _findNearestEnemy(p.x, p.y, x => p.chainHit.has(x));
        if(_hmTgt){
          const _sp=Math.hypot(p.vx,p.vy)||320;
          const _tAng=Math.atan2(_hmTgt.y-p.y,_hmTgt.x-p.x);
          let _dAng=_tAng-Math.atan2(p.vy,p.vx);
          while(_dAng>Math.PI)_dAng-=Math.PI*2;
          while(_dAng<-Math.PI)_dAng+=Math.PI*2;
          const _nAng=Math.atan2(p.vy,p.vx)+Math.sign(_dAng)*Math.min(Math.abs(_dAng),6.0*dt);
          p.vx=Math.cos(_nAng)*_sp; p.vy=Math.sin(_nAng)*_sp;
        }
        p.update(dt);
        for(const e of enemies){
          if(e.dead||p.chainHit.has(e)) continue;
          if(Math.hypot(e.x-p.x,e.y-p.y)<p.radius+e.size){
            e.takeDamage(p.damage);
            window._trackDps(p._srcType||p.type, p.damage); // [UPDATE 2026-07-10]
            if(p.slow){ e._slowed=p.slowDur||2.0; e._slowFactor=(1-p.slow); }
            if(p.dotDmg){ e._poison=p.dotDmg; e._poisonTick=p.dotTick||0.5; e._poisonDur=p.dotDur||3.0; e._poisonTimer=0; e._poisonSrc=p._srcType||p.type; }
            p.chainHit.add(e);
            // [UPDATE 2026-07-26] 히든 시너지: (해원맥/강림차사)×(저승나비/상사화) — 튕길 때마다 작은 조각 2개 분열
            if(p._splitOnBounce){
              for(let i=0;i<2;i++){
                const _sAng=Math.random()*Math.PI*2;
                projectiles.push(new Projectile(e.x,e.y,Math.cos(_sAng)*220,Math.sin(_sAng)*220,
                  Math.max(1,Math.floor(p.damage*0.5)),
                  {radius:7,life:0.8,pierce:1,type:'scythe_sub',color:'#204040',glow:'rgba(30,80,60,.5)'}));
              }
            }
            p.damage=Math.max(1,Math.floor(p.damage*0.95));
            const _next = _findNearestEnemy(p.x, p.y, x => p.chainHit.has(x));
            if(_next){
              const _dx=_next.x-p.x,_dy=_next.y-p.y,_d=Math.hypot(_dx,_dy)||1;
              const _sp=Math.hypot(p.vx,p.vy)||320;
              p.vx=(_dx/_d)*_sp; p.vy=(_dy/_d)*_sp;
              p.life=p._initLife||2.0;
            }
            break;
          }
        }
        continue;
      }
      // 귀신손: 첫 프레임에 반경 내 적 전부 1회 타격
      if(p._ghostHand){
        if(!p._ghHitDone){
          p._ghHitDone=true;
          for(const e of enemies){
            if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<p.radius+e.size){
              e.takeDamage(p.damage);
              window._trackDps(p._srcType||p.type, p.damage); // [UPDATE 2026-07-10]
            }
          }
        }
        p.update(dt); continue;
      }
      // 투척형 신검: 출발점~현재 위치 선분 판정으로 경로 전체 커버
      if(p._throwSword){
        if(!p._throwStopped || p._maxAlpha!==undefined){
          const hitW=p._throwHitWidth||8;
          let ox=p._originX??p.x, oy=p._originY??p.y;
          let ex2=p.x, ey2=p.y;
          // 잔상 정지 후: baseAng 방향으로 시각 길이(drawScaleY*16)만큼 양방향 확장
          if(p._throwStopped && p._maxAlpha!==undefined && typeof p.baseAng==='number'){
            const halfLen=(p.drawScaleY||1)*16;
            ox=p.x-Math.cos(p.baseAng)*halfLen;
            oy=p.y-Math.sin(p.baseAng)*halfLen;
            ex2=p.x+Math.cos(p.baseAng)*halfLen;
            ey2=p.y+Math.sin(p.baseAng)*halfLen;
          }
          for(const e of enemies){
            if(e.dead||p.chainHit.has(e)) continue;
            const _ex=e.x-ox, _ey=e.y-oy;
            const dx=ex2-ox, dy=ey2-oy;
            const lenSq=dx*dx+dy*dy||1;
            const t=Math.max(0,Math.min(1,(_ex*dx+_ey*dy)/lenSq));
            if(Math.hypot(e.x-(ox+t*dx),e.y-(oy+t*dy))<hitW+e.size){
              e.takeDamage(p.damage);
              window._trackDps(p._srcType||p.type, p.damage); // [UPDATE 2026-07-10]
              p.chainHit.add(e);
            }
          }
        }
        p.update(dt);
        continue;
      }
      if(p.aoe>0){
        // 데미지 판정은 생성 즉시 최대 반경 적용 (시각 확산 효과는 draw()에서 별도 처리되므로 서로 독립적)
        p.radius=p.aoe;
        // [UPDATE 2026-07-26] 버그 수정: 보스가 만드는 AOE 투사체(충격파/순간이동 착지폭발/글리치난사 등)가
        // 여기서 enemies만 순회해서 플레이어에게 전혀 피해를 못 주고 있었음 — hostile 플래그로 분기 추가
        if(p.hostile){
          if(!p.dead&&Math.hypot(player.x-p.x,player.y-p.y)<p.radius+14){
            player.takeDamage(Math.floor(p.damage), boss);
            if(player.iframe>0.5) screenShake=1;
            p.dead=true;
          }
          p.update(dt); continue;
        }
        for(const e of enemies){
          if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<p.radius+e.size){
            if(p.damage>0){
              const _aoeDmg=p.damage*dt*3;
              e.takeDamage(_aoeDmg);
              window._trackDps(p._srcType||p.type, _aoeDmg); // [UPDATE 2026-07-10]
            }
            // 저주 인형: 범위 내 적에게 받는 데미지 증폭 디버프
            if(p.debuffMult&&p.debuffDur){
              e._markedDmgMult=p.debuffMult;
              e._markedDur=p.debuffDur;
            }
            if(p.charmDur&&!e.isBoss){
              // [UPDATE 2026-07-31] 성능: 개수만 필요한데 filter로 배열을 새로 만들고 있었음.
              // 상한이 2라 2개만 세면 바로 빠져나올 수 있어 전체 순회도 대부분 조기 종료된다.
              let _alreadyCharmed=0;
              for(const x of enemies){ if(!x.dead&&x._charmed>0&&++_alreadyCharmed>=2) break; }
              if(_alreadyCharmed<2) e._charmed=p.charmDur;
            }
          }
        }
        p.update(dt);continue;
      }
      // 호밍: 가장 가까운 적 방향으로 서서히 꺾임
      if(p._homing){
        // [UPDATE 2026-07-31] 성능: enemies.filter(e=>!e.dead) 제거.
        // findNearestEnemies가 내부에서 이미 dead를 건너뛰므로 완전히 중복인데,
        // 이 줄은 "호밍 투사체 1개당 매 프레임" 실행돼서 원계(적 800~960마리) 기준
        // 살아있는 호밍 투사체 수만큼 900개짜리 배열을 새로 만들고 있었음.
        // 활·부적처럼 호밍이 붙은 무기를 같이 들면 그 개수만큼 배로 늘어나 프레임이 무너지던 원인.
        const ht=findNearestEnemies(p.x,p.y,enemies,1)[0];
        if(ht){
          const hdx=ht.x-p.x,hdy=ht.y-p.y;
          const sp=Math.hypot(p.vx,p.vy);
          const tAng=Math.atan2(hdy,hdx);
          let dAng=tAng-Math.atan2(p.vy,p.vx);
          while(dAng>Math.PI)dAng-=Math.PI*2;
          while(dAng<-Math.PI)dAng+=Math.PI*2;
          const turnRate=p._homingVeryWeak?0.6:p._homingWeak?1.2:5.0; // [UPDATE 2026-07-09] 신궁 기본공격(아주 약함)/초월8성(약함) 단계별 회전 속도
          const turn=Math.sign(dAng)*Math.min(Math.abs(dAng),turnRate*dt);
          const nAng=Math.atan2(p.vy,p.vx)+turn;
          p.vx=Math.cos(nAng)*sp; p.vy=Math.sin(nAng)*sp;
        }
      }
      // [UPDATE 2026-07-26] 보스 유도 구슬(homing_orbs) — 플레이어를 향해 서서히 꺾임(적이 아니라 플레이어가 대상)
      if(p._bossHoming){
        const hdx=player.x-p.x,hdy=player.y-p.y;
        const sp=Math.hypot(p.vx,p.vy);
        const tAng=Math.atan2(hdy,hdx);
        let dAng=tAng-Math.atan2(p.vy,p.vx);
        while(dAng>Math.PI)dAng-=Math.PI*2;
        while(dAng<-Math.PI)dAng+=Math.PI*2;
        const turn=Math.sign(dAng)*Math.min(Math.abs(dAng),2.0*dt);
        const nAng=Math.atan2(p.vy,p.vx)+turn;
        p.vx=Math.cos(nAng)*sp; p.vy=Math.sin(nAng)*sp;
      }
      p.update(dt);
      // [UPDATE 2026-07-26] 버그 수정: 스파이럴/유도구슬/직선난사 등 보스의 비-AOE 투사체도 여기서 enemies만
      // 순회해서 플레이어에게 전혀 피해를 못 주고 있었음 — hostile 플래그로 분기 추가
      if(p.hostile){
        if(!p.dead&&Math.hypot(player.x-p.x,player.y-p.y)<p.radius+14){
          player.takeDamage(Math.floor(p.damage), boss);
          if(player.iframe>0.5) screenShake=1;
          p.dead=true;
        }
        continue;
      }
      for(const e of enemies){
        if(!e.dead){
          const hit = p.hitEnemy(e);
          // 신궁 특강: 명중 시 분열 (남은 분열 횟수만큼 반복 가능)
          if(hit && p._splitLevel>0){
            const sp=Math.hypot(p.vx,p.vy);
            // 가장 가까운 적 2개 찾아서 각각 조준
            const targets=findNearestEnemies(p.x,p.y,enemies,2); // [UPDATE 2026-07-31] 중복 filter 제거(위와 동일 이유)
            if(targets.length===0) targets.push({x:p.x,y:p.y-1});
            if(targets.length===1) targets.push({x:p.x+10,y:p.y-1});
            targets.forEach(tgt=>{
              const dx=tgt.x-p.x,dy=tgt.y-p.y,d=Math.hypot(dx,dy)||1;
              const child=new Projectile(p.x,p.y,
                (dx/d)*sp*0.9,(dy/d)*sp*0.9,
                Math.floor(p.damage*0.85),
                {pierce:1,radius:p.radius,life:1.2,type:'bow',
                 _splitLevel:p._splitLevel-1,
                 _maxAlpha:0.5+(p._splitLevel-1)*0.1,
                 color:'#ffe060',glow:'rgba(255,220,60,.6)'});
              projectiles.push(child);
            });
          }
          // 각성 무당지팡이: orb 명중 시 AOE 폭발
          if(hit && p._explodeOnOrbHit){
            const expl = new Projectile(p.x, p.y, 0, 0,
              Math.floor(p.damage*2.5),
              {aoe:70, life:0.4, type:'staff',
               color:'#c060ff', glow:'rgba(180,60,255,.8)'});
            projectiles.push(expl);
            p.dead = true;
          }
        }
        if(p.dead) break;
      }
    }

    for(const o of xpOrbs){
      o.update(dt,player.x,player.y,player.magnetRange);
      // [UPDATE 2026-07-31] _blessingXpMult — 어계에서 축복 보유량에 비례해 경험치가 깎인다(축복 0이면 1/100)
      // gainXp가 이제 "이번에 오른 레벨 수"를 반환한다. 오브 하나로 여러 레벨이 오를 수 있으므로
      // 첫 장은 바로 띄우고 나머지는 대기열에 넣어 카드 선택이 그 수만큼 이어지게 한다.
      if(o.dead){
        const _lv = player.gainXp(Math.max(1,Math.floor(o.value*(player._xpMult||1)*(player._blessingXpMult||1))));
        if(_lv > 0){
          player._pendingLevelUps = (player._pendingLevelUps||0) + _lv - 1;
          triggerLevelUp();
        }
      }
    }

    // ── 골드 업데이트 ──
    for(const b of bigGoldDrops){
      b.update(dt,player.x,player.y,player.magnetRange);
      if(b.dead){ _collectBigGold(b); }
    }
    bigGoldDrops=bigGoldDrops.filter(b=>!b.dead);

    for(const g of goldDrops){
      g.update(dt,player.x,player.y,player.magnetRange);
      if(g.dead) applyItemEffect(g,player,enemies,saveData,xpOrbs,goldDrops);
    }

    // [UPDATE 2026-07-11] 영혼 드랍(시즌2)이 일반 루프에선 전혀 업데이트 안 되던 버그 수정 — 자석/술신 자동수집이 안 먹히던 원인
    for(const sd of soulDrops){
      sd.update(dt,player.x,player.y,player.magnetRange);
      if(sd.dead) _collectSoulDrop(sd);
    }
    soulDrops=soulDrops.filter(sd=>!sd.dead);

    // ── 스페셜 아이템 업데이트 (자석 무효, 직접 밟기) ──
    for(const s of specialItems){
      s.update(dt,player.x,player.y);
      if(s.dead){
        applyItemEffect(s,player,enemies,saveData,xpOrbs,goldDrops);
        // 자석 발동 시 영혼 드랍도 흡수
        if(s.type==='magnet') for(const sd of soulDrops) sd.magnetPull();
      }
    }

    // 죽은 적 → 드롭 생성 (counted 플래그로 중복 방지)
    const newDead=enemies.filter(e=>e.dead&&!e._counted);
    for(const e of newDead){
      e._counted=true;  // 한 번만 카운트
      kills++;
      // [UPDATE 2026-07-24] 법칙(심판의 법칙/역행의 법칙) 트리거용
      player._lawKillAccum = (player._lawKillAccum || 0) + 1;
      player._lawLastKillX = e.x; player._lawLastKillY = e.y;
      // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 — 시즌3 스테이지 한정 드랍 (0.5% → 5%, 너무 안 나온다는 피드백)
      if (gameMode==='normal' && stageId>=201 && stageId<=300 && Math.random() < 0.05) {
        const cardType = ['card_dokkaebi','card_gumiho','card_gogolgwi'][Math.floor(Math.random()*3)];
        specialItems.push(new SpecialItem(e.x, e.y, cardType));
      }
      // [UPDATE 2026-07-19] 보물 창고 특산품 — 하드 난이도 스토리 스테이지 일반 몬스터 처치 20% 확률 드랍
      if (gameMode==='normal' && difficulty==='hard') {
        const _spId = _getSeasonSpecialtyId(stageId);
        if (_spId && Math.random() < 0.20) {
          bigGoldDrops.push(new BigGoldDrop(e.x, e.y, _spId));
        }
      }
      const drops=createDrops(e.x,e.y,e.xpValue,e.goldValue,_rewardMode);
      if(drops.xp){
        // [UPDATE 2026-07-31] 🔥 오브 개수에 상한을 건다(CONFIG.ITEM.MAX_XP_ORBS_PER_KILL).
        // 기존 ceil(xp/2)는 챕터가 오를수록 몬스터 xp를 따라 무한히 늘어나서, 선계 263개·원계 1,057개·
        // 어계 387,500개(!)씩 생성되고 있었다. 총 XP는 개당 값에 나눠 담아 그대로 유지된다.
        const cnt=Math.min(Math.ceil(e.xpValue/2), CONFIG.ITEM.MAX_XP_ORBS_PER_KILL);
        const per=Math.ceil(e.xpValue/cnt);
        // 바닥에 이미 너무 많이 깔려 있으면 새로 만들지 않고 기존 오브에 합쳐 넣는다(획득 XP 총량은 동일)
        if(xpOrbs.length>=CONFIG.ITEM.MAX_XP_ORBS_ALIVE){
          const _t=xpOrbs[xpOrbs.length-1];
          if(_t) _t.value+=per*cnt;
        } else {
          for(let i=0;i<cnt;i++)
            xpOrbs.push(new XpOrb(
              e.x+(Math.random()-.5)*20,
              e.y+(Math.random()-.5)*20,
              per
            ));
        }
      }
      // [UPDATE 2026-07-17] 시즌2 전용이던 특화 드랍(골드→차원석, 빅골드→영혼석, 영혼조각)을
      // 시즌2 이후 전체로 확장 — 시즌3에서 갑자기 평범한 골드 경제로 되돌아가던 문제 수정
      const _isSeason2Stage = (stageId >= 101);
      // [UPDATE 2026-07-18] 시즌4(귀허계) 스토리 스테이지 순리석 획득 경로 ① — 골드 드랍 슬롯 12% 확률로 순리석 대체
      const _isSeason4Stage = (gameMode === 'normal' && stageId >= 301 && stageId <= 400);
      if (_isSeason2Stage) {
        for (const g of drops.gold) {
          if (_isSeason4Stage && Math.random() < 0.12) bigGoldDrops.push(new BigGoldDrop(g.x, g.y, 'sullriseok'));
          else if (Math.random() < 0.10) bigGoldDrops.push(new BigGoldDrop(g.x, g.y, 'chaewonseok'));
          else if (Math.random() < 0.15) soulDrops.push(new SoulDrop(g.x, g.y, 'soulFragment'));
        }
        // 빅골드 슬롯 → 영혼석으로 대체
        if (drops.bigGold) for (const b of drops.bigGold)
          soulDrops.push(new SoulDrop(b.x, b.y, 'soulStone'));
      } else if (!_rewardMode || _rewardMode==='infinite') {
        for(const g of drops.gold) goldDrops.push(g);
        if(drops.bigGold) for(const b of drops.bigGold) bigGoldDrops.push(b);
      } else {
        if(drops.bigGold) for(const b of drops.bigGold) bigGoldDrops.push(b);
      }
      for(const s of drops.special) specialItems.push(s);

      // [UPDATE 2026-07-17] 시즌4 실체화 몹(과거 잔상 합체) 처치 시 순리석 확정 1개 드랍 (기존 %드랍 경로와 별개)
      if (e._isReincarnated) {
        bigGoldDrops.push(new BigGoldDrop(e.x, e.y, 'sullriseok'));
      }

      // [UPDATE 2026-07-17] 260713_MTOPC.md 9번④: 글리치 "분열" modifier — 처치 시 절반체력 미니 몬스터 2체로 분열(1회만)
      if (e._glitchSplit && !e._glitchSplitDone) {
        e._glitchSplitDone = true;
        for (let i = 0; i < 2; i++) {
          const mini = new Enemy(
            e.x + (Math.random()-0.5)*30, e.y + (Math.random()-0.5)*30,
            e.type, Math.max(0, Math.floor(elapsed/20)-1), gameMode !== 'normal', 1
          );
          mini.hp = mini.maxHp = Math.max(1, Math.floor(e.maxHp/2));
          mini.size = Math.floor(e.size*0.65);
          enemies.push(mini);
        }
      }
    }

    // 플로팅 텍스트 / 폭탄 이펙트
    floatingTexts=updateFloatingTexts(dt);
    bombEffects=updateBombEffects(dt);

    // ── 번개 연쇄 처리 ──
    const chainProjs=[];
    for(const p of projectiles){
      if(p.dead&&p.chain>0&&EVOLVED_WEAPON_DEFS.talisman_evo){
        // [UPDATE 2026-07-31] EVOLVED_WEAPON_DEFS는 빈 객체({})라 이 분기는 실행된 적이 없는 죽은 코드.
        // 나중에 진화무기를 실제로 채울 때 processChain 구현이 없으면 여기서 TypeError가 나므로 주의.
        const cp=EVOLVED_WEAPON_DEFS.talisman_evo.processChain(p,enemies);
        chainProjs.push(...cp);
      }
    }
    projectiles.push(...chainProjs);

    // ── 저주 인형 디버프 타이머 ──
    for(const e of enemies){
      if(e.dead||!e._markedDur) continue;
      e._markedDur-=dt;
      if(e._markedDur<=0){ e._markedDmgMult=1; e._markedDur=0; }
    }

    // ── 독 도트 데미지 ──
    for(const e of enemies){
      if(e.dead||!e._poison) continue;
      e._poisonTimer=(e._poisonTimer||0)+dt;
      e._poisonDur-=dt;
      if(e._poisonDur<=0){ e._poison=0; e._poisonTimer=0; continue; }
      if(e._poisonTimer>=e._poisonTick){
        e.takeDamage(e._poison);
        window._trackDps(e._poisonSrc||'poison', e._poison); // [UPDATE 2026-07-10]
        e._poisonTimer=0;
      }
    }

    // ── 토네이도 흡입 ──
    for(const p of projectiles){
      if(!p.dead&&p._tornado){
        p._elapsed=(p._elapsed||0)+dt;
        // travelTime 경과 후 정지
        if(p._elapsed>=p._travelTime){ p.vx=0; p.vy=0; }
        for(const e of enemies){
          if(e.dead) continue;
          const dx=p.x-e.x, dy=p.y-e.y;
          const dist=Math.hypot(dx,dy)||1;
          if(dist<p._pullRange&&dist>8){
            // 정지 후엔 2배 강하게
            const mult = p._elapsed>=p._travelTime ? 2.0 : 1.0;
            const force=p._pullForce*mult*(1-dist/p._pullRange)*dt;
            e.x+=dx/dist*force;
            e.y+=dy/dist*force;
          }
        }
      }
    }

    // ── 슬로우 적용 ──
    for(const e of enemies){
      if(e._slowed>0){
        e._slowed-=dt;
        const _baseSpd=ENEMY_TYPES[e.type]?.speed||55;
        e.speed=_baseSpd*(e._slowFactor??0.5);
      } else if(e._slowed<=0&&e._slowed!==undefined){
        e.speed=ENEMY_TYPES[e.type]?.speed||55;
        e._slowFactor=undefined;
      }
    }

    // [UPDATE 2026-07-08] 영혼낫 초월 8성: 소멸하는 낫에서 잔상 폭발 생성
    for(const p of projectiles){
      if(p&&p.dead&&p._transcendBurst){
        p._transcendBurst=false;
        projectiles.push(new Projectile(p.x,p.y,0,0,p._burstDmg||0,
          {orb:true,pierce:99,radius:(p.radius||20)*1.6,life:0.12,type:'scythe',
           color:'#a0ffc0',glow:'rgba(160,255,190,.8)'}));
      }
    }
    enemies=enemies.filter(e=>!(e.dead&&e.deathT>0.5));
    projectiles=projectiles.filter(p=>p&&!p.dead);
    xpOrbs=xpOrbs.filter(o=>!o.dead);
    goldDrops=goldDrops.filter(d=>!d.dead);
    specialItems=specialItems.filter(s=>!s.dead);
    enemyProjs=enemyProjs.filter(p=>!p.dead);
    // 피격 이펙트 업데이트
    if(window._hitEffects){
      for(const h of window._hitEffects) h.t+=dt;
      window._hitEffects=window._hitEffects.filter(h=>h.t<h.life);
    }

    for(const o of bgOrbs){o.t+=dt;o.x+=Math.sin(o.t*.7)*o.spd*dt;o.y+=Math.cos(o.t*.5)*o.spd*dt;}
  }

  function _getFloorColor() {
    // _rewardMode 먼저 체크 (재화 던전은 mode='infinite'라서 gameMode 체크보다 앞에 와야 함)
    if (_rewardMode === 'ganghwaseok') return '#1a1510';
    if (_rewardMode === 'cheonunseok') return '#001828';
    if (_rewardMode === 'cheonryeonggwa') return '#0a180a';
    if (_rewardMode === 'taegeukseok') return '#200e00';
    // [UPDATE 2026-07-17] 혼돈석 던전(시즌3 특화) — 그동안 전용 팔레트가 없어 무한던전과 같은 남색을 썼음
    if (_rewardMode === 'hondonseok') return '#2c1f38';
    // [UPDATE 2026-07-17] 순리석 던전(시즌4 특화) — 마찬가지로 전용 팔레트 없이 무한던전 남색을 쓰던 것 교체
    if (_rewardMode === 'sullriseok') return '#241c38';
    if (_rewardMode === 'infinite' || gameMode === 'infinite') return '#0a0030';
    if (_rewardMode === 'bossrush' || gameMode === 'boss_rush') return '#2a0000';
    // [UPDATE 2026-07-17] 시즌3(망랑계, 챕터21~30) 전용 팔레트 — 시즌2(유명계) 보라/자주와 구분되는 회갈-이끼빛 계열
    if (currentChapter >= 21 && currentChapter <= 30) {
      if (difficulty === 'hard') return '#241c30';
      if (difficulty === 'normal') return '#38304a';
      return '#4a4258'; // easy
    }
    // [UPDATE 2026-07-17] 시즌4(귀허계, 챕터31~40) 전용 팔레트 — 시즌3(이끼빛)와 구분되는 차가운 남색-인디고 계열
    if (currentChapter >= 31 && currentChapter <= 40) {
      if (difficulty === 'hard') return '#161228';
      if (difficulty === 'normal') return '#282440';
      return '#3a3550'; // easy
    }
    // [UPDATE 2026-07-22] 시즌5(선계, 챕터41~50) 전용 팔레트 — 시즌4(남색)와 구분되는 청록/옥빛 계열.
    // 이 분기가 빠져있어서 그동안 챕터41~50이 아래 "챕터11+" 분기(시즌2 보라색)로 잘못 새고 있었음 — 바닥소품은
    // s5_*로 이미 시즌5 전용이었는데 바닥 "색"만 시즌2 것을 쓰고 있던 버그.
    if (currentChapter >= 41 && currentChapter <= 50) {
      if (difficulty === 'hard') return '#0a1c1e';
      if (difficulty === 'normal') return '#123028';
      return '#1c4038'; // easy
    }
    // [UPDATE 2026-07-28] 시즌6(원계, 챕터51~60) 전용 팔레트 — 시즌5(청록)와 구분되는 보라/자홍 계열(법칙 이펙트 톤과 통일).
    // 시즌5 때와 똑같은 버그(분기 누락 → 아래 "챕터11+" 시즌2 보라색으로 샘)가 챕터51~60/61~70에서도 발생 중이던 것 발견해 수정.
    if (currentChapter >= 51 && currentChapter <= 60) {
      if (difficulty === 'hard') return '#180818';
      if (difficulty === 'normal') return '#2c1030';
      return '#402048'; // easy
    }
    // [UPDATE 2026-07-28] 시즌7(어계, 챕터61~70) 전용 팔레트 — 인식 밖의 영역답게 게임에서 가장 어둡고 이질적인
    // 암적-암흑 계열(보스 컬러 태모/■■■ 등과 통일).
    if (currentChapter >= 61 && currentChapter <= 70) {
      if (difficulty === 'hard') return '#0a0004';
      if (difficulty === 'normal') return '#180010';
      return '#280020'; // easy
    }
    // [UPDATE 2026-07-31] 시즌8(황계, 챕터71~80) — 반물질계. 색이 빠져나간 창백한 청백/은회 계열로
    // 어계(암적자색)와 정반대 톤을 잡아, 시간이 역행하며 모든 것이 옅어지는 세계라는 인상을 준다.
    if (currentChapter >= 71 && currentChapter <= 80) {
      if (difficulty === 'hard') return '#0e1418';
      if (difficulty === 'normal') return '#1c2a32';
      return '#2e4048'; // easy
    }
    // [UPDATE 2026-07-08] 시즌2(유명계, 챕터11+) 전용 팔레트 — 시즌1(현계) 갈색톤과 구분되는 보라/자주 계열
    if (currentChapter > 10) {
      if (difficulty === 'hard') return '#2a0f30';
      if (difficulty === 'normal') return '#362850';
      return '#4a3a6b'; // easy
    }
    if (difficulty === 'hard') return '#3d0f0f';
    if (difficulty === 'normal') return '#6b3d1a';
    return '#8b5a2b'; // easy
  }

  function render(){
    const W=canvas.width,H=canvas.height; if(!W||!H) return;
    const PANEL_W=46;
    ctx.save();
    ctx.beginPath(); ctx.rect(0,0,W,H); ctx.clip();
    const vw=W/zoom, vh=H/zoom;
    // [UPDATE 2026-08-05] 부적 파괴 연출 중엔 카메라 초점을 플레이어→부적으로 서서히 이동(첫 1초, 부드러운 이징)
    let _focusX=player.x, _focusY=player.y;
    if(state==='talismanBreak' && talisman){
      const _panT = Math.min(1, _talismanDeathT/1.0);
      const _ease = _panT*_panT*(3-2*_panT); // smoothstep
      _focusX = player.x + (talisman.x-player.x)*_ease;
      _focusY = player.y + (talisman.y-player.y)*_ease;
    } else if(talisman && elapsed < TALISMAN_INTRO_HOLD+TALISMAN_INTRO_PAN){
      // [UPDATE 2026-08-05] 스테이지 시작 시 부적 위치를 한 번 보여주는 카메라 스윕(매 스테이지) —
      // 부적에서 0.5초 정지 후 0.9초에 걸쳐 플레이어로 이동. 게임 로직 자체는 멈추지 않고 카메라만 연출.
      if(elapsed < TALISMAN_INTRO_HOLD){
        _focusX = talisman.x; _focusY = talisman.y;
      } else {
        const _t = (elapsed-TALISMAN_INTRO_HOLD)/TALISMAN_INTRO_PAN;
        const _ease = _t*_t*(3-2*_t); // smoothstep
        _focusX = talisman.x + (player.x-talisman.x)*_ease;
        _focusY = talisman.y + (player.y-talisman.y)*_ease;
      }
    }
    const camX=_focusX-vw/2+shakeX/zoom, camY=_focusY-vh/2+shakeY/zoom;
    ctx.fillStyle=_getFloorColor(); ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.scale(zoom,zoom);
    const sz=80,ox=((-camX)%sz+sz)%sz,oy=((-camY)%sz+sz)%sz;
    ctx.strokeStyle='rgba(255,255,255,0.022)';ctx.lineWidth=1;
    for(let x=ox;x<vw;x+=sz){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,vh);ctx.stroke();}
    for(let y=oy;y<vh;y+=sz){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(vw,y);ctx.stroke();}
    for(const o of bgOrbs){
      const sx=o.x-camX,sy=o.y-camY;
      if(sx<-60||sx>W+60||sy<-60||sy>H+60)continue;
      ctx.save();ctx.globalAlpha=.28+Math.sin(o.t*2)*.1;
      const g=ctx.createRadialGradient(sx,sy,0,sx,sy,o.r*3);
      g.addColorStop(0,o.color);g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,o.r*3,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    // ── 바닥 장식 소품 랜덤 배치 (맵별 스프라이트 세트) ──
    {
      const T = SPRITES.tiles;
      const S = SPRITES.stage || {};
      const DUNGEON_TEX = ['dirt_tex_light','dirt_tex_dark'];
      const _tileSetDef = (() => {
        // _rewardMode 먼저 체크 (재화 던전은 mode='infinite'라서 순서 중요)
        if (_rewardMode === 'ganghwaseok') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['forge_ember','forge_anvil','forge_soot'],
        };
        if (_rewardMode === 'cheonunseok') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['sky_star','sky_gem','sky_spark'],
        };
        if (_rewardMode === 'cheonryeonggwa') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['grove_leaf','grove_herb','grove_fruit'],
        };
        if (_rewardMode === 'taegeukseok') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['shrine_cloth','shrine_silk','shrine_incense'],
        };
        // [UPDATE 2026-07-17] 혼돈석 던전(시즌3 특화) — 그동안 전용 소품이 없어 무한던전 세트를 그대로 썼음.
        // 시즌3 바닥 소품 중 "이질적인" 것들(뒤엉킨 뿌리 부적, 허수아비, 덩굴돌) 위주로 구성해 스토리 스테이지와 결을 다르게.
        if (_rewardMode === 'hondonseok') return {
          texKey: null, texDecoKeys: ['dirt_common_1','dirt_common_2','dirt_common_3'], texDecoNS: T, decoNS: S,
          decoKeys: ['s3_tangled_root_charm','s3_scarecrow_red','s3_scarecrow_blue','s3_vine_stone_a','s3_vine_stone_b','s3_moss_rock_large'],
        };
        // [UPDATE 2026-07-17] 순리석 던전(시즌4 특화) — 환생란(거듭남)·영혼불씨(소멸) 소재 위주로 구성해 스토리 스테이지와 결을 다르게
        if (_rewardMode === 'sullriseok') return {
          texKey: null, texDecoKeys: ['dirt_common_1','dirt_common_2','dirt_common_3'], texDecoNS: T, decoNS: S,
          decoKeys: ['s4_rebirth_egg_1','s4_rebirth_egg_2','s4_rebirth_egg_3','s4_soul_ember_1','s4_soul_ember_2','s4_soul_ember_3','s4_soul_ember_4','s4_soul_ember_5'],
        };
        if (_rewardMode === 'infinite' || gameMode === 'infinite') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['inf_stone','inf_stones','inf_grass','inf_dark_grass','inf_blue_grass'],
        };
        if (_rewardMode === 'bossrush' || gameMode === 'boss_rush') return {
          texKey: null, texDecoKeys: DUNGEON_TEX, decoNS: T,
          decoKeys: ['boss_b','boss_chain','boss_skull','boss_crack'],
        };
        // 일반 스테이지 (난이도별 소품 세트)
        // [UPDATE 2026-07-08] 시즌2(유명계, 챕터11+) 전용 데코셋 — 시즌1(현계) 자연물과 구분되는 무덤/유골/도깨비불 테마
        const stageSets = {
          easy:   ['easy_a','easy_b','easy_c','easy_d','stone_tan','grass_blue'],
          normal: ['normal_a','normal_b','stone_dark','stone_cracked','grass_dark'],
          hard:   ['hard_a','hard_b','hard_c','hard_d','grass_black','stone_dark2','dirt_dark'],
        };
        const stageSets2 = {
          easy:   ['s2_easy_a','tombstone_gray','bone_pile'],
          normal: ['s2_normal_a','s2_normal_b','bone_pile2'],
          hard:   ['s2_hard_a','skull_pile','tombstone_gray','bone_pile2'],
        };
        // [UPDATE 2026-07-17] 시즌3(망랑계, 챕터21~30) 전용 데코셋 — 시즌1 자연물/시즌2 무덤과 구분되는
        // 뿌리정령·버섯·이끼바위 테마(원본: 이미지 모음/tiles_crop2/ss3 특화)
        const stageSets3 = {
          easy:   ['s3_sprout_stone','s3_mushroom_root_stone','s3_mushroom_hat_stone','s3_mushroom_char_a','s3_mushroom_char_hat','s3_mushroom_cluster','s3_pebble_small','s3_pebble_pair'],
          normal: ['s3_root_spirit','s3_stump_spirit','s3_vine_stone_a','s3_moss_rock_large'],
          hard:   ['s3_tangled_root_charm','s3_vine_stone_b','s3_scarecrow_red','s3_scarecrow_blue','s3_moss_rock_small'],
        };
        // [UPDATE 2026-07-17] 시즌4(귀허계, 챕터31~40) 전용 데코셋 — 음양/룬석판/수정군락/환생란/소멸소용돌이 테마
        // (원본: 이미지 모음/tiles_crop2/ss4 특화). 영혼불씨(s4_soul_ember_*)는 순리석 던전 전용으로 남겨둠.
        const stageSets4 = {
          easy:   ['s4_yinyang_1','s4_yinyang_2','s4_yinyang_3','s4_yinyang_4','s4_yinyang_5','s4_rune_stone_1','s4_rune_stone_2','s4_rune_stone_3'],
          normal: ['s4_rune_stone_4','s4_rune_stone_5','s4_crystal_1','s4_crystal_2','s4_crystal_3','s4_rebirth_egg_1','s4_rebirth_egg_2'],
          hard:   ['s4_crystal_4','s4_crystal_5','s4_void_swirl_1','s4_void_swirl_2','s4_void_swirl_3','s4_rebirth_egg_3','s4_rebirth_egg_4','s4_rebirth_egg_5'],
        };
        // [UPDATE 2026-07-22] 시즌5(선계, 챕터41~50) 전용 데코셋 — 구름/매화/연꽃/향로/두루마리/산/정자/대나무 테마
        // (원본: 이미지 모음/10. 바닥 모음/ss5 특화, 72종 중 대표 24종만 스폰 풀로 선별)
        const stageSets5 = {
          easy:   ['s5_cloud_1','s5_cloud_2','s5_cloud_3','s5_blossom_branch_1','s5_blossom_branch_2','s5_petal_1','s5_petal_2','s5_lotus_1'],
          normal: ['s5_lotus_2','s5_lotus_3','s5_incense_1','s5_incense_2','s5_scroll_1','s5_scroll_2','s5_bamboo_1','s5_windchime_1'],
          hard:   ['s5_mountain_1','s5_mountain_2','s5_pavilion_1','s5_feather_1','s5_feather_2','s5_bamboo_cluster_1','s5_cloud_alt_1','s5_lantern_1'],
        };
        // [UPDATE 2026-07-29] 시즌6(원계, 챕터51~60) 전용 데코셋 — 성운/수정/룬석/제단/매화/깃털/향로/종/대나무/연꽃 테마
        // (원본: 이미지 모음/10. 바닥 모음/ss6, 72종 중 대표 12종 선별)
        const stageSets6 = {
          easy:   ['s6_blossom_1','s6_feather_1','s6_lotus_1','s6_petal_1'],
          normal: ['s6_nebula_1','s6_incense_1','s6_bell_1','s6_bamboo_1'],
          hard:   ['s6_nebula_2','s6_altar_1','s6_rune_1','s6_crystal_1'],
        };
        // [UPDATE 2026-07-29] 시즌7(어계, 챕터61~70) 전용 데코셋 — 수정파편/성운/제단/기형성장/촉수눈 테마
        // (원본: 이미지 모음/10. 바닥 모음/ss7, 65종 중 대표 12종 선별)
        const stageSets7 = {
          easy:   ['s7_crystal_1','s7_crystal_2','s7_nebula_1','s7_rune_1'],
          normal: ['s7_crystal_3','s7_void_1','s7_altar_1','s7_growth_1'],
          hard:   ['s7_eye_1','s7_eye_2','s7_altar_2','s7_growth_2'],
        };
        // [UPDATE 2026-07-31] 시즌8(황계, 챕터71~80) 전용 데코셋 — 반물질 파편/거울/균열/유물/빛 테마
        // (원본: 이미지 모음/10. 바닥 모음/ss8, 66종 중 대표 12종 선별)
        const stageSets8 = {
          easy:   ['s8_light_1','s8_light_2','s8_shard_1','s8_mirror_1'],
          normal: ['s8_shard_2','s8_mirror_2','s8_relic_1','s8_relic_2'],
          hard:   ['s8_rift_1','s8_rift_2','s8_ruin_1','s8_ruin_2'],
        };
        const _isS3 = currentChapter >= 21 && currentChapter <= 30;
        const _isS4 = currentChapter >= 31 && currentChapter <= 40;
        const _isS5 = currentChapter >= 41 && currentChapter <= 50;
        const _isS6 = currentChapter >= 51 && currentChapter <= 60;
        const _isS7 = currentChapter >= 61 && currentChapter <= 70;
        const _isS8 = currentChapter >= 71 && currentChapter <= 80;
        // [UPDATE 2026-07-08] 시즌2 전용 흙 텍스처 분기 — 시즌1(현계) 갈색 텍스처와 색 충돌 해결
        // [UPDATE 2026-07-17] 시즌3/4는 무채색 공용 dirt_common 세트 사용(어느 팔레트에도 자연스럽게 얹힘)
        // [UPDATE 2026-07-22] 시즌5도 동일한 무채색 dirt_common 세트 재사용
        const STAGE_TEX = _isS3 ? ['dirt_common_4','dirt_common_5','dirt_common_6','dirt_common_7']
          : (_isS4 || _isS5 || _isS6 || _isS7 || _isS8) ? ['dirt_common_1','dirt_common_2','dirt_common_3','dirt_common_8']
          : (currentChapter > 10 ? ['s2_dirt_tex_light','s2_dirt_tex_dark'] : ['dirt_tex_light','dirt_tex_dark']);
        return {
          texKey: (currentChapter > 10 ? null : 'deco_dirt_texture'), decoNS: S, // [UPDATE 2026-07-08] 시즌2+는 흙질감 우선 레이어 미사용 (STAGE_TEX 소품만으로 충분, 사용자 확정)
          texDecoKeys: STAGE_TEX, texDecoNS: T,
          decoKeys: (_isS3 ? stageSets3[difficulty] : _isS4 ? stageSets4[difficulty] : _isS5 ? stageSets5[difficulty] : _isS6 ? stageSets6[difficulty] : _isS7 ? stageSets7[difficulty] : _isS8 ? stageSets8[difficulty] : currentChapter > 10 ? stageSets2[difficulty] : stageSets[difficulty]) || stageSets.easy,
        };
      })();

      // [UPDATE 2026-07-08] 시즌 구분 추가 (안 하면 시즌별 소품 캐시 충돌)
      // [UPDATE 2026-07-17] 시즌3/4 전용 데코셋 추가하면서 스테이지 분기의 '_s2' 접미사가 여러 시즌을 같은 캐시로
      // 뭉뚱그리던 버그 수정 — 챕터 범위 기준으로 시즌별 접미사를 명시적으로 분리
      // [UPDATE 2026-07-22] 시즌5 접미사 추가 누락 시 시즌2 타일 캐시와 충돌하는 버그 재발 방지
      // [UPDATE 2026-07-29] 시즌6/7 전용 데코(s6_*/s7_*) 완성 — 임시 '_s6s7' 통합 접미사를 '_s6'/'_s7'로 분리
      const _seasonSuffix = currentChapter >= 71 && currentChapter <= 80 ? '_s8'
        : currentChapter >= 61 && currentChapter <= 70 ? '_s7'
        : currentChapter >= 51 && currentChapter <= 60 ? '_s6'
        : currentChapter >= 41 && currentChapter <= 50 ? '_s5'
        : currentChapter >= 31 && currentChapter <= 40 ? '_s4'
        : currentChapter >= 21 && currentChapter <= 30 ? '_s3'
        : currentChapter > 10 ? '_s2' : '_s1';
      const cacheKey = gameMode + '_' + (_rewardMode || difficulty) + _seasonSuffix;
      if (!_tileCache[cacheKey]) {
        try {
          const _decoNS    = _tileSetDef.decoNS    || T;
          const _texDecoNS = _tileSetDef.texDecoNS || T;
          // decoKeys → decoNS, texDecoKeys → texDecoNS, texKey → 항상 T
          const getDecoImg = k => _decoNS[k]    ? SpriteLoader.get(_decoNS[k].src)    : null;
          const getTexImg  = k => T[k]           ? SpriteLoader.get(T[k].src)          : null;
          const getTexDecoImg = k => _texDecoNS[k] ? SpriteLoader.get(_texDecoNS[k].src) : null;
          const isLoaded = img => img && img.complete && img.naturalWidth > 0;
          const decos = _tileSetDef.decoKeys.map(getDecoImg).filter(isLoaded);
          const texDecos = (_tileSetDef.texDecoKeys || []).map(getTexDecoImg).filter(isLoaded);
          let texRotated = null;
          if (_tileSetDef.texKey && T[_tileSetDef.texKey]) {
            const dtex = getTexImg(_tileSetDef.texKey);
            if (isLoaded(dtex)) {
              texRotated = [0,1,2,3].map(r => {
                const oc = document.createElement('canvas');
                const side = Math.max(dtex.width, dtex.height); // [UPDATE 2026-07-08] 정사각형이 아닌 이미지가 90/270도 회전 시 잘리는 버그 수정 (긴 변 기준 정사각 캔버스)
                oc.width = side; oc.height = side;
                const c2 = oc.getContext('2d');
                c2.translate(side/2, side/2);
                c2.rotate(r * Math.PI / 2);
                c2.drawImage(dtex, -dtex.width/2, -dtex.height/2);
                return oc;
              });
            }
          }
          // 모든 이미지가 준비됐을 때만 캐시 확정 (일부만 로드된 상태로 굳는 버그 방지)
          const expectDecos = _tileSetDef.decoKeys.length;
          const expectTex   = (_tileSetDef.texDecoKeys || []).length;
          // [UPDATE 2026-07-22] 이미지 중 하나라도 끝까지 로드 실패하면 이 블록이 매 프레임 무한 재시도되며
          // 캔버스 회전 연산까지 계속 반복해 렉을 유발하던 버그 — 60프레임(약 1초) 넘게 시도해도 안 되면
          // 로드된 것만이라도 캐시 확정(완전 실패 시에만 스킵)해서 무한 재시도를 끊음
          _tileCacheAttempts[cacheKey] = (_tileCacheAttempts[cacheKey] || 0) + 1;
          const _giveUp = _tileCacheAttempts[cacheKey] > 60;
          if ((decos.length === expectDecos && texDecos.length === expectTex) || (_giveUp && (decos.length > 0 || expectDecos === 0))) {
            _tileCache[cacheKey] = { decos, texDecos, texRotated };
          } else if (_giveUp) {
            _tileCache[cacheKey] = false; // 아무 것도 못 불러왔으면 이 조합은 완전 포기(바닥색만 표시)
          }
        } catch(e) { _tileCache[cacheKey] = false; }
      }

      const isDungeon = _rewardMode !== null || gameMode === 'infinite' || gameMode === 'boss_rush';

      ctx.fillStyle = _getFloorColor();
      ctx.fillRect(0, 0, vw, vh);

      if (_tileCache[cacheKey]) {
        const { decos, texDecos, texRotated } = _tileCache[cacheKey];
        const CS = 96;
        const cx0 = Math.floor(camX/CS)-1, cy0 = Math.floor(camY/CS)-1;
        const cx1 = Math.ceil((camX+vw)/CS)+1, cy1 = Math.ceil((camY+vh)/CS)+1;
        for (let cy = cy0; cy <= cy1; cy++) {
          for (let cx = cx0; cx <= cx1; cx++) {
            let h = ((cx*1664525)+(cy*1013904223))>>>0;
            h = (h^(h>>>16))>>>0;
            h = ((h*2246822519)>>>0);
            h = (h^(h>>>13))>>>0;
            const ox = ((h>>>4)%48)-24;
            const oy = ((h>>>8)%48)-24;
            const dx = cx*CS+CS/2+ox-camX;
            const dy = cy*CS+CS/2+oy-camY;
            const roll = h & 0x1F; // 0~31
            if (texRotated && roll < 5) {
              // 스테이지: 흙질감 회전 타일 (5~200% 스케일)
              const tex = texRotated[(h>>>5)%4];
              const scale = 0.05 + ((h>>>20)%196)/100;
              const sw = tex.width*scale, sh = tex.height*scale;
              ctx.globalAlpha = currentChapter > 10 ? 0.5 : 0.7; // [UPDATE 2026-07-08] 시즌2는 바닥과 명도 대비가 커서 알파 낮춤
              ctx.drawImage(tex, dx-sw/2, dy-sh/2, sw, sh);
              ctx.globalAlpha = 1;
            } else if (texDecos.length > 0 && roll < (isDungeon ? 6 : 11)) {
              // 흙질감 소품 (던전: 5~80% 0.5알파 / 스테이지: 5~200% 0.65알파, 시즌2는 대비 완화를 위해 알파 하향)
              const td = texDecos[(h>>>6)%texDecos.length];
              const scale = isDungeon
                ? 0.05 + ((h>>>20)%76)/100
                : 0.05 + ((h>>>20)%196)/100;
              const sw = td.width*scale, sh = td.height*scale;
              ctx.globalAlpha = currentChapter > 10 ? (isDungeon ? 0.35 : 0.45) : (isDungeon ? 0.5 : 0.65); // [UPDATE 2026-07-08]
              ctx.drawImage(td, dx-sw/2, dy-sh/2, sw, sh);
              ctx.globalAlpha = 1;
            } else if (decos.length > 0 && roll < (isDungeon ? 16 : 19)) {
              // 소품 (던전: 5~80% 0.4알파 / 스테이지: 5~80% 0.75알파)
              const deco = decos[(h>>>10)%decos.length];
              const scale = 0.05 + ((h>>>20)%76)/100;
              const sw = deco.width*scale, sh = deco.height*scale;
              ctx.globalAlpha = isDungeon ? 0.4 : 0.75;
              ctx.drawImage(deco, dx-sw/2, dy-sh/2, sw, sh);
              ctx.globalAlpha = 1;
            }
          }
        }
      }
    }
    // 장판형 이펙트(도깨비불/독안개 등 aoe 보유)는 아이템보다 먼저 그려서 골드/영혼석이 안 가리게 함
    for(const p of projectiles) if(p&&p.aoe>0) p.draw(ctx,camX,camY);
    for(const o of xpOrbs)     o.draw(ctx,camX,camY);
    for(const b of bigGoldDrops) b.draw(ctx,camX,camY);
    for(const sd of soulDrops) sd.draw(ctx,camX,camY);
    for(const g of goldDrops)   g.draw(ctx,camX,camY);
    for(const s of specialItems) s.draw(ctx,camX,camY);
    for(const c of companions) c.draw(ctx,camX,camY,companionImg);
    for(const a of afterimages) a.draw(ctx,camX,camY); // [UPDATE 2026-07-17] 시즌4 과거 잔상 — 실제 몹보다 먼저 그려서 항상 배경처럼 깔림
    for(const e of enemies)    e.draw(ctx,camX,camY);
    if(boss) boss.draw(ctx,camX,camY);
    for(const rb of rushBosses) rb.draw(ctx,camX,camY);
    for(const p of projectiles) if(!p||!(p.aoe>0)) p.draw(ctx,camX,camY);
    for(const pe of petEntities) pe.draw(ctx,camX,camY);
    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번②: 복수 애기씨 분신 — 본체 스프라이트를 반투명 보라빛으로 재사용
    for(const cl of aegissiClones){
      const csx=cl.x-camX, csy=cl.y-camY;
      ctx.save();
      ctx.globalAlpha=0.55;
      if(player.img && player.img.complete && player.img.naturalWidth>0){
        ctx.filter='hue-rotate(220deg) saturate(1.4)';
        ctx.drawImage(player.img, csx+(player.spriteOX||-14), csy+(player.spriteOY||-28), player.spriteW||28, player.spriteH||36);
        ctx.filter='none';
      } else {
        ctx.fillStyle='#a060e0';
        ctx.beginPath(); ctx.arc(csx,csy,14,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
    player.draw(ctx,camX,camY);
    if(talisman) _drawTalisman(ctx,camX,camY);
    _drawElementTrinityOrbit(ctx,camX,camY); // [UPDATE 2026-07-11] 삼위일체 궤도 시각효과
    drawBombEffects(ctx,camX,camY,bombEffects);
    _drawHitEffects(ctx,camX,camY);
    _drawSeonsulEffects(ctx,camX,camY);
    _drawLawFieldEffects(ctx,camX,camY);
    _drawLawBurstEffects(ctx,camX,camY);
    _drawEnemyProjs(ctx,camX,camY);
    drawFloatingTexts(ctx,camX,camY,floatingTexts);
    // ── 줌 영역 끝 ──
    ctx.restore();

    // [UPDATE 2026-08-05] 부적이 화면 밖으로 나가면 우하단에 감시 카메라(CCTV) 패널을 띄워
    // 플레이어가 멀리 떨어져 있어도 부적 상태를 계속 확인할 수 있게 함(화면 좌표 기준, 줌 영향 안 받음).
    _drawTalismanCCTV(ctx, W, H, camX, camY, vw, vh);

    _drawLawScreenEffects(ctx, W, H);
    _drawSamsinBorderEffect(ctx, W, H);

    // [UPDATE 2026-07-22] 선술 "모래 어둠" 화면 암전 오버레이 — 줌 영향 안 받게 화면 좌표 기준으로 그림
    // [UPDATE 2026-07-24] 화면을 정확히 코너 대 코너(우상→좌하)로 가로지르는 고정된 대각선이 얇게 시작해서
    // 점점 벌어지며 위아래(대각선 기준 양쪽)로 화면이 드러나는 "베인 뒤 벌어지는" 연출로 재구성. 선이 이동/스윕하지 않음.
    if (player._seonsulFlashT != null) {
      const _dur = player._seonsulFlashPeakAt / 0.4; // flashDur 역산(캐스트 시 peakAt=dur*0.4로 저장했음)
      const _elapsed = _dur - player._seonsulFlashT;
      const _progress = Math.max(0, Math.min(1, _elapsed / _dur));
      const _alpha = _progress < 0.4 ? (_progress / 0.4) : Math.max(0, 1 - (_progress - 0.4) / 0.6);
      const _darkA = Math.min(1, _alpha) * 0.85;

      const diag = Math.hypot(W, H);
      const dx = -W / diag, dy = H / diag;   // 대각선 방향(우상→좌하), 코너 대 코너
      const nx = dy, ny = -dx;               // 대각선에 수직인 방향
      const cx = W / 2, cy = H / 2;          // 화면 정중앙 고정 — 코너 대 코너 대각선은 항상 중앙을 지남

      const half = diag * 0.6;
      const gx0 = cx - nx*half, gy0 = cy - ny*half;
      const gx1 = cx + nx*half, gy1 = cy + ny*half;
      const gradLen = 2 * half;
      const tAt = (distPx) => Math.max(0, Math.min(1, 0.5 + distPx / gradLen));

      // 벌어지는 정도 — 암전이 정점(progress 0.4)에 이르는 동안 얇은 선에서 점점 넓게 벌어지고, 이후엔 벌어진 채 암전과 함께 사라짐
      const openP = Math.min(1, _progress / 0.4);
      const gapHalfPx = 4 + openP * 90;
      const featherPx = 55;

      ctx.save();
      const grad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
      grad.addColorStop(0,                              `rgba(0,0,0,${_darkA})`);
      grad.addColorStop(tAt(-gapHalfPx - featherPx),     `rgba(0,0,0,${_darkA})`);
      grad.addColorStop(tAt(-gapHalfPx),                 'rgba(0,0,0,0)');
      grad.addColorStop(tAt(gapHalfPx),                  'rgba(0,0,0,0)');
      grad.addColorStop(tAt(gapHalfPx + featherPx),      `rgba(0,0,0,${_darkA})`);
      grad.addColorStop(1,                               `rgba(0,0,0,${_darkA})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // 벌어진 틈의 양쪽 가장자리 — 빛나는 절단면 하이라이트 2줄이 서로 멀어지며 벌어짐
      ctx.save();
      ctx.globalAlpha = Math.min(1, _alpha * 1.3);
      ctx.strokeStyle = '#e8f4ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#a8e0ff';
      ctx.shadowBlur = 16;
      for (const sgn of [-1, 1]) {
        const ex = cx + nx * gapHalfPx * sgn, ey = cy + ny * gapHalfPx * sgn;
        ctx.beginPath();
        ctx.moveTo(ex + dx*diag, ey + dy*diag);
        ctx.lineTo(ex - dx*diag, ey - dy*diag);
        ctx.stroke();
      }
      ctx.restore();
    }

    // HUD / 조이스틱은 줌 제외 (항상 같은 크기)
    Input.drawJoystick(ctx,W,H);
    ctx.restore();
    drawHUD(W,H);
    if(boss&&!boss.dead) drawBossHPBar(W,H,boss,0);
    if(gameMode==='boss_rush'){
      let _barY=0;
      for(const rb of rushBosses){
        if(rb.dead) continue;
        drawBossHPBar(W,H,rb,_barY);
        _barY+=48; // 다음 체력바를 아래로 이어서 표시
      }
    }
    if(state==='farming'){
      const _ft=Math.max(0,farmingTimer);
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(0,0,W,64);
      ctx.textAlign='center';
      ctx.font='bold 18px sans-serif';
      ctx.fillStyle='#f0d040';
      const _clrEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      ctx.fillText(_clrEn?'🏆 Stage Clear!':'🏆 스테이지 클리어!',W/2,26);
      ctx.font='13px sans-serif';
      ctx.fillStyle='#e8dcc8';
      ctx.fillText(_clrEn?`Back to lobby in ${Math.ceil(_ft)}s — loot up!`:Math.ceil(_ft)+'초 후 로비 이동 — 파밍하세요!',W/2,50);
      ctx.textAlign='left';
      ctx.restore();
      if(_ft<=0) endGame(true);
    }
    if(state==='dead')    drawResultOverlay(W,H,false);
    if(state==='victory') drawResultOverlay(W,H,true);

    // 스테이지 인트로 텍스트 (0~1.5초)
    if (gameMode === 'normal' && elapsed < 1.5 && stageId) {
      const alpha = elapsed < 0.5 ? elapsed/0.5 : elapsed > 1.2 ? (1.5-elapsed)/0.3 : 1;
      const si = getStageInfo(stageId);
      const chData = GAME_DATA.stages.find(c=>c.stages.some(s=>s.id===stageId));
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.textAlign = 'center';
      ctx.font = 'bold 13px sans-serif';
      const _isEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      ctx.fillStyle = 'rgba(200,160,255,0.8)';
      ctx.fillText((_isEn?(chData?.nameEn||chData?.name):chData?.name) || '', W/2, H/2 - 18);
      ctx.font = 'bold 20px sans-serif';
      ctx.fillStyle = '#f0e8c8';
      ctx.fillText((_isEn?(si?.nameEn||si?.name):si?.name) || '', W/2, H/2 + 6);
      ctx.restore();
    }

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번①: 도깨비주사위 결과 표시 (스테이지 인트로 텍스트 종료 직후 1.6~4.5초)
    if (_dokkaebiDiceResult && elapsed >= 1.6 && elapsed < 4.5) {
      const dAlpha = elapsed < 2.0 ? (elapsed-1.6)/0.4 : elapsed > 4.0 ? (4.5-elapsed)/0.5 : 1;
      const _isEnD = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      ctx.save();
      ctx.globalAlpha = Math.max(0, dAlpha);
      ctx.textAlign = 'center';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillStyle = '#ffd870';
      ctx.fillText(`🎲 ${_dokkaebiDiceResult.icon}`, W/2, H/2 + 50);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#f0e8c8';
      ctx.fillText(_isEnD ? _dokkaebiDiceResult.textEn : _dokkaebiDiceResult.textKo, W/2, H/2 + 74);
      ctx.restore();
    }

    // [UPDATE 2026-07-17] 도깨비주사위 효과가 런 내내 지속되는데 처음 몇 초만 보여주고 사라져서 뭘 먹었는지
    // 까먹기 쉽다는 피드백 — 우측 하단(줌 버튼 위)에 작게 상시 표시
    // [UPDATE 2026-07-17] 좌표가 줌 버튼 wrap(bottom:90px, 버튼2개+간격=78px → 하단기준 90~168px 구간)과
    // 겹쳐서(기존 하단기준 136~176px) 실기기에서 배지가 줌 버튼에 포개지는 버그 — 줌 버튼 위로 여유있게 이동
    if (_dokkaebiDiceResult) {
      const _isEnD2 = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      const bx = W - 74, by = H - 224, bw = 64, bh = 40;
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,216,112,0.4)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 8); ctx.stroke();
      ctx.textAlign = 'center';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#ffd870';
      ctx.fillText(`🎲${_dokkaebiDiceResult.icon}`, bx+bw/2, by+20);
      ctx.font = '8px sans-serif';
      ctx.fillStyle = 'rgba(240,232,200,0.85)';
      const _shortTxt = (_isEnD2 ? _dokkaebiDiceResult.textEn : _dokkaebiDiceResult.textKo).split(/[—-]/)[0].trim();
      ctx.fillText(_shortTxt, bx+bw/2, by+33);
      ctx.restore();
    }
  }



  function drawHUD(W,H){
    const _aliveRushBosses = gameMode==='boss_rush' ? rushBosses.filter(rb=>!rb.dead).length : 0;
    const topH=(boss&&!boss.dead)?92:(_aliveRushBosses>0?(58+_aliveRushBosses*48):58);
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,topH);
    const BAR=Math.min(72,W*.23);
    ctx.fillStyle='#300';ctx.fillRect(10,10,BAR,7);
    ctx.fillStyle=player.hp>player.maxHp*.3?'#c03020':'#ff2020';
    ctx.fillRect(10,10,BAR*(player.hp/player.maxHp),7);
    ctx.fillStyle='#e8dcc8';ctx.font='bold 9px sans-serif';
    ctx.fillText(`❤️ ${Math.ceil(player.hp)}/${player.maxHp}`,13,18);
    ctx.fillStyle='#001828';ctx.fillRect(10,21,BAR,4);
    ctx.fillStyle='#40c0ff';ctx.fillRect(10,21,BAR*(player.xp/player.xpNext),4);
    ctx.fillStyle='#f0c040';ctx.font='bold 12px sans-serif';
    ctx.fillText(`Lv.${player.level}`,BAR+10,21);
    const min=Math.floor(timeLeft/60),sec=Math.floor(timeLeft%60);
    ctx.textAlign='center';ctx.font='bold 16px sans-serif';
    ctx.fillStyle=timeLeft<30?'#ff4040':'#e8dcc8';
    ctx.fillText(`${min}:${sec.toString().padStart(2,'0')}`,W/2,20);
    // 스테이지/던전 이름 + 난이도 표시
    if (gameMode==='normal' && stageId) {
      const si = getStageInfo(stageId);
      const _isEnHud = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      const _chData = si ? GAME_DATA.stages.find(c=>c.stages.some(s=>s.id===stageId)) : null;
      const chName = _chData ? (_isEnHud?(_chData.nameEn||_chData.name):_chData.name) : '';
      const _siName = si ? (_isEnHud?(si.nameEn||si.name):si.name) : '';
      const diffLabel = _isEnHud
        ? {easy:'🌿Easy', normal:'⚔️Normal', hard:'🔥Hard'}[difficulty]||''
        : {easy:'🌿이지', normal:'⚔️노말',   hard:'🔥하드'}[difficulty]||'';
      const label = si ? `${stageId}. ${chName} · ${_siName}  ${diffLabel}` : ''; // [UPDATE 2026-07-10] 몇 번 맵인지 스테이지 번호 표시
      ctx.font='10px sans-serif';
      ctx.fillStyle='rgba(200,180,255,0.6)';
      ctx.fillText(label, W/2, 32);
    }
    ctx.textAlign='left';
    // 킬카운트 바
    const kR=Math.min(kills/killTarget,1),kBW=Math.min(180,W*.42),kBH=8,kBX=W/2-kBW/2,kBY=38;
    ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(kBX,kBY,kBW,kBH);
    ctx.fillStyle=killTargetReached&&isBossStage?(Math.floor(elapsed*4)%2===0?'#ff4040':'#ff8040')
      :(kR>=1?'#60ff60':'#f0c040');
    ctx.fillRect(kBX,kBY,kBW*kR,kBH);
    ctx.textAlign='center';ctx.font='bold 9px sans-serif';
    ctx.fillStyle=killTargetReached?'#60ff60':'#e8dcc8';
    ctx.fillText(killTargetReached&&isBossStage?(Lang.getCurrent()==='ko'?'⚔️ 보스를 처치하라!':'⚔️ Defeat the Boss!'):(Lang.getCurrent()==='ko'?`처치 ${kills} / ${killTarget}`:`Kills ${kills} / ${killTarget}`),W/2,kBY+kBH+9);
    ctx.textAlign='left';

    // ── 특화 재화 카운터 (특화 던전 전용) ──
    if (_rewardMode && SPECIAL_ICONS[_rewardMode]) {
      const icon = SPECIAL_ICONS[_rewardMode];
      const count = window.earnedSpecial || 0;
      const text = `${icon} ${count}`;
      ctx.font = 'bold 14px sans-serif';
      const tw = ctx.measureText(text).width;
      const rx = W - tw - 14, ry = 110; // 일시정지 버튼(top:56 + h:36 + gap:18) 아래
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath(); ctx.roundRect(rx - 6, ry - 13, tw + 12, 20, 6); ctx.fill();
      ctx.fillStyle = '#c0e0ff';
      ctx.textAlign = 'right';
      ctx.fillText(text, W - 8, ry);
      ctx.textAlign = 'left';
    }

    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 지속시간 배지
    if (_transformType) {
      const _tIcon = { dokkaebi:'👹', gumiho:'🦊', gogolgwi:'💀' }[_transformType] || '✨';
      const text = `${_tIcon} ${Math.ceil(_transformTimer)}s`;
      ctx.font = 'bold 13px sans-serif';
      const tw = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.roundRect(W/2 - tw/2 - 8, 96, tw+16, 20, 6); ctx.fill();
      ctx.fillStyle = '#ffd070';
      ctx.textAlign = 'center';
      ctx.fillText(text, W/2, 111);
      ctx.textAlign = 'left';
    }

    // ── 왼쪽 세로 슬롯 패널 ──
    const SLOT_W=38, SLOT_H=38, SLOT_X=4, SLOT_GAP=3;
    const slotImgMain = SpriteLoader.get(SPRITES.slots.main.src);
    const slotImgSub  = SpriteLoader.get(SPRITES.slots.sub.src);
    const slotImgStat = SpriteLoader.get(SPRITES.slots.stat.src);
    function drawSlot(sy, slotImg, weapon, isEmpty) {
      // 슬롯 프레임 이미지
      if(slotImg?.complete && slotImg.naturalWidth>0) {
        ctx.drawImage(slotImg, SLOT_X, sy, SLOT_W, SLOT_H);
      }
      if(!isEmpty && weapon) {
        const wImgSrc = (typeof CARD_IMGS!=='undefined'&&CARD_IMGS[weapon.defId]) || null;
        const wImg = wImgSrc ? SpriteLoader.get(wImgSrc) : null;
        if(wImg?.complete && wImg.naturalWidth>0) {
          ctx.drawImage(wImg, SLOT_X+3, sy+3, SLOT_W-6, SLOT_H-6);
        } else {
          ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(weapon.icon||'?', SLOT_X+SLOT_W/2, sy+SLOT_H/2);
          ctx.textBaseline='alphabetic'; ctx.textAlign='left';
        }
        ctx.fillStyle='rgba(0,0,0,0.75)';
        ctx.fillRect(SLOT_X+SLOT_W-16, sy+SLOT_H-11, 16, 11);
        ctx.fillStyle='#f0c040'; ctx.font='bold 8px sans-serif';
        ctx.textAlign='center';
        ctx.fillText('L'+weapon.lv, SLOT_X+SLOT_W-8, sy+SLOT_H-2);
        ctx.textAlign='left';
      }
    }

    // 주무기 슬롯 (난이도별 1~3개 가로로)
    let _sy = 56;
    const _mainWpns = window.mainWeapons || [window.mainWeapon];
    const _mainSlotN = Math.max(_mainWpns.filter(Boolean).length, 1);
    const MAIN_SLOT_W = _mainSlotN > 1 ? Math.floor((SLOT_W * 1 + SLOT_GAP) * (_mainSlotN === 2 ? 1.9 : 2.7) / _mainSlotN) : SLOT_W;
    const MAIN_SLOT_GAP = 2;
    for (let mi = 0; mi < _mainSlotN; mi++) {
      const mwi = _mainWpns[mi] || null;
      const msx = SLOT_X + mi * (MAIN_SLOT_W + MAIN_SLOT_GAP);
      // 주무기 슬롯 프레임
      if(slotImgMain?.complete && slotImgMain.naturalWidth>0) {
        ctx.drawImage(slotImgMain, msx, _sy, MAIN_SLOT_W, SLOT_H);
      }
      if (mwi) {
        const wImgSrc = (typeof CARD_IMGS!=='undefined'&&CARD_IMGS[mwi.defId]) || null;
        const wImg = wImgSrc ? SpriteLoader.get(wImgSrc) : null;
        if(wImg?.complete && wImg.naturalWidth>0) {
          ctx.drawImage(wImg, msx+3, _sy+3, MAIN_SLOT_W-6, SLOT_H-6);
        } else {
          ctx.font='14px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText(mwi.icon||'?', msx+MAIN_SLOT_W/2, _sy+SLOT_H/2);
          ctx.textBaseline='alphabetic'; ctx.textAlign='left';
        }
        ctx.fillStyle='rgba(0,0,0,0.75)';
        ctx.fillRect(msx+MAIN_SLOT_W-14, _sy+SLOT_H-11, 14, 11);
        ctx.fillStyle='#f0c040'; ctx.font='bold 7px sans-serif'; ctx.textAlign='center';
        ctx.fillText('L'+mwi.lv, msx+MAIN_SLOT_W-7, _sy+SLOT_H-2);
        ctx.textAlign='left';
      }
    }
    _sy += SLOT_H + SLOT_GAP;

    // [UPDATE 2026-07-06] 주무기별 전용 특수강화 미니 슬롯 (주무기 슬롯 바로 아래)
    // 일반 스탯 4칸과 분리되어 주무기 개수만큼(1~3개) 표시
    const SPEC_H = 15;
    for (let mi = 0; mi < _mainSlotN; mi++) {
      const mwi = _mainWpns[mi] || null;
      const msx = SLOT_X + mi * (MAIN_SLOT_W + MAIN_SLOT_GAP);
      const spec = mwi?.def?.specialStat;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(msx, _sy, MAIN_SLOT_W, SPEC_H);
      ctx.strokeStyle = 'rgba(212,160,23,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(msx + 0.5, _sy + 0.5, MAIN_SLOT_W - 1, SPEC_H - 1);
      if (spec) {
        const specLv = (window.statSlots || []).find(s => s.id === spec.id)?.lv || 0;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '9px sans-serif';
        ctx.fillStyle = specLv > 0 ? '#f0c040' : 'rgba(232,220,200,0.35)';
        ctx.fillText(spec.icon || '⭐', msx + MAIN_SLOT_W / 2 - 8, _sy + SPEC_H / 2);
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(specLv > 0 ? (specLv + '/' + (spec.max || 4)) : '-', msx + MAIN_SLOT_W / 2 + 9, _sy + SPEC_H / 2);
        ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
      }
    }
    _sy += SPEC_H + SLOT_GAP;

    // 구분선
    _sy += 4;

    // 보조무기 슬롯 (3개)
    const _sws = window.subWeapons || [];
    for(let _i=0; _i<3; _i++) {
      drawSlot(_sy, slotImgSub, _sws[_i], !_sws[_i]);
      _sy += SLOT_H + SLOT_GAP;
    }

    // 구분선
    _sy += 4;

    // [UPDATE 2026-07-06] 스탯 슬롯 (4개) - 일반 스탯만 표시 (특수강화는 주무기 슬롯 아래 전용 칸으로 분리됨)
    const _sts = (window.statSlots || []).filter(s => !s.isSpecial);
    for(let _i=0; _i<4; _i++) {
      const _st = _sts[_i];
      const _stIcon = _st ? ((STAT_UPGRADE_DEFS||[]).find(s=>s.id===_st.id)?.icon || '?') : '?';
      const _stWpn = _st ? {defId:_st.id, icon:_stIcon, lv:_st.lv} : null;
      drawSlot(_sy, slotImgStat, _stWpn, !_st);
      _sy += SLOT_H + SLOT_GAP;
    }

    // [UPDATE 2026-07-25] 시즌6(원계) 법칙 슬롯 3개 — 보조무기 슬롯과 동일하게 세로로 이어지는 풀너비 칸 3개로 표시
    // (기존엔 가로 1/3폭 3칸이었는데, 보조무기 슬롯과 개념이 같으므로(3개 중 장착) 같은 레이아웃으로 통일)
    if (isSeasonReleased(6)) {
      _sy += 4;
      const _lawSlotImg = SPRITES?.slots?.law ? SpriteLoader.get(SPRITES.slots.law.src) : null;
      const _equipped = player._lawEquipped || [];
      for (let i = 0; i < CONFIG.LAW.SLOT_COUNT; i++) {
        const le = _equipped[i];
        if (_lawSlotImg?.complete && _lawSlotImg.naturalWidth > 0) {
          ctx.drawImage(_lawSlotImg, SLOT_X, _sy, SLOT_W, SLOT_H);
        } else {
          ctx.save();
          ctx.fillStyle = 'rgba(160,96,224,0.18)';
          ctx.strokeStyle = 'rgba(208,160,255,0.5)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(SLOT_X, _sy, SLOT_W, SLOT_H, 4); ctx.fill(); ctx.stroke();
          ctx.restore();
        }
        if (le) {
          const lsc = SPRITES?.laws?.[le.id];
          const limg = lsc ? SpriteLoader.get(lsc.src) : null;
          if (limg?.complete && limg.naturalWidth > 0) ctx.drawImage(limg, SLOT_X+3, _sy+3, SLOT_W-6, SLOT_H-6);
        }
        _sy += SLOT_H + SLOT_GAP;
      }
    }

    // [UPDATE 2026-07-10] 좌측 하단 데미지 미터 — 무기별 누적 총데미지(도파민용) + 부드러운 최근 3초 DPS
    {
      const _dpsSrc = window._dpsDisplay || {};
      const _totalSrc = window._dpsTotal || {};
      // 투사체 type이 무기 defId와 다른 경우 매핑 (영혼낫: type='scythe' → defId='scythe_main')
      const DPS_KEY_ALIAS = { scythe_main: 'scythe' };
      // [UPDATE 2026-07-11] 소수점 2자리 반올림
      // [UPDATE 2026-08-05] 로그라이크 특성상 후반 데미지가 기하급수적으로 커져서 "3906218.27k"처럼 k 단위가
      // 안 넘어가고 그대로 불어나던 문제 — k(천)/m(백만)/b(십억)/t(조) 단위를 넘길 때마다 다음 단위로 승급.
      const _fmtNum = n => {
        if (n >= 1e12) return (n/1e12).toFixed(2)+'t';
        if (n >= 1e9)  return (n/1e9).toFixed(2)+'b';
        if (n >= 1e6)  return (n/1e6).toFixed(2)+'m';
        if (n >= 1e3)  return (n/1e3).toFixed(2)+'k';
        return n.toFixed(2);
      };
      const _dpsWeapons = [...(window.mainWeapons||[]).filter(Boolean), ...(window.subWeapons||[]).filter(Boolean)];
      const _dpsRows = _dpsWeapons.map(w => {
        const key = DPS_KEY_ALIAS[w.defId] || w.defId;
        return { w, total: _totalSrc[key] || 0, dps: _dpsSrc[key] || 0 };
      }).filter(r => r.total > 0).sort((a,b) => b.total - a.total);
      if (_dpsRows.length > 0) {
        const _grandTotal = _dpsRows.reduce((s,r) => s+r.total, 0) || 1;
        // 무기별 고정 색상 (정렬 순서 바뀌어도 같은 무기는 항상 같은 색)
        const DPS_COLORS = ['#ff6060','#60c0ff','#60ff90','#ffcc40','#c080ff','#ff9040','#40e0d0'];
        const _colorFor = defId => {
          let h=0; for(let c=0;c<defId.length;c++) h=(h*31+defId.charCodeAt(c))>>>0;
          return DPS_COLORS[h%DPS_COLORS.length];
        };
        const DR_H = 32, DR_W = 130, DR_X = 4;
        const panelH = _dpsRows.length * DR_H + 6;
        const panelY = H - panelH - 4;
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath(); ctx.roundRect(DR_X, panelY, DR_W, panelH, 6); ctx.fill();
        _dpsRows.forEach((r, i) => {
          const ry = panelY + 4 + i * DR_H;
          const wImgSrc = (typeof CARD_IMGS!=='undefined'&&CARD_IMGS[r.w.defId]) || null;
          const wImg = wImgSrc ? SpriteLoader.get(wImgSrc) : null;
          if (wImg?.complete && wImg.naturalWidth>0) {
            ctx.drawImage(wImg, DR_X+4, ry+2, 18, 18);
          } else {
            ctx.font='14px sans-serif'; ctx.fillText(r.w.icon||'?', DR_X+4, ry+15);
          }
          ctx.font='bold 12px sans-serif'; ctx.fillStyle='#ffd878';
          ctx.fillText(_fmtNum(r.total), DR_X+26, ry+10);
          ctx.font='9px sans-serif'; ctx.fillStyle='rgba(200,200,200,0.75)';
          ctx.fillText(`${_fmtNum(r.dps)}/s`, DR_X+26, ry+21); // [UPDATE 2026-07-11] 정수 반올림 제거 — 소수점 2자리로 표시
          // [UPDATE 2026-07-10] 무기별 데미지 점유율(%) 게이지 바
          const pct = r.total / _grandTotal;
          const barX = DR_X+4, barY = ry+24, barW = DR_W-38, barH = 5;
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          ctx.fillRect(barX, barY, barW, barH);
          ctx.fillStyle = _colorFor(r.w.defId);
          ctx.fillRect(barX, barY, barW*pct, barH);
          ctx.font='bold 8px sans-serif'; ctx.fillStyle='#fff'; ctx.textAlign='right';
          ctx.fillText(`${Math.round(pct*100)}%`, DR_X+DR_W-4, ry+21);
          ctx.textAlign='left';
        });
      }
    }

    // 우측 상단 재화 HUD
    ctx.textAlign='right'; ctx.font='bold 10px sans-serif';
    const _isSeason2Hud = (stageId >= 101); // [UPDATE 2026-07-17] 시즌2 이후 전체로 확장
    if (_isSeason2Hud) {
      // 시즌2: 차원석 잔량 + 이번 판 획득량 + 소모율
      const _cwsCur = saveData.chaewonseok || 0;
      const _cwsEarned = window.earnedSpecial || 0;
      const _cwsColor = _s2Debuff ? '#ff6060' : (_cwsCur <= 5 ? '#ffaa40' : '#80c8ff');
      ctx.fillStyle = _cwsColor;
      // [UPDATE 2026-07-26] 차원석 부족/잠식 경고 아이콘 — 그동안 숫자 색만 바뀌어서 눈치채기 어려웠음.
      // 잔량 5개 이하면 맥동하는 ⚠️, 잠식(디버프) 중이면 항상 켜진 💀 잠식중 라벨을 재화 표시 앞에 붙임.
      const _cwsWarnIcon = _s2Debuff ? '💀잠식중 ' : (_cwsCur <= 5 ? (Math.sin(Date.now()*0.006)>0 ? '⚠️ ' : '') : '');
      ctx.fillText(`${_cwsWarnIcon}🔷${_cwsCur} (+${_cwsEarned}) -2/min`, W-8, 20);
      // 영혼 조각 / 영혼석
      const _sf = saveData.soulFragments || 0;
      const _ss = saveData.soulStones || 0;
      const _sfEarned = window.earnedSoulFragments || 0;
      const _ssEarned = window.earnedSoulStones || 0;
      ctx.fillStyle = '#90b8ff';
      ctx.fillText(`👻${_sf} (+${_sfEarned})  💜${_ss} (+${_ssEarned})`, W-8, 34);
    } else {
      // 일반: 골드 표시
      ctx.fillStyle='#f0c040';
      const _hudGold = window.earnedGold || 0;
      ctx.fillText(`🪙+${Format.num(_hudGold)}`,W-8,20);
      // 특수 재화 아이콘 (특화 던전에서만)
      if(_rewardMode && _rewardMode!=='bossrush' && _rewardMode!=='infinite' && (window.earnedSpecial||0)>0){
        const _sIcon = SPECIAL_ICONS[_rewardMode]||'💠';
        ctx.fillStyle='#a0e8ff';
        ctx.fillText(`${_sIcon}+${window.earnedSpecial}`,W-8,34);
      }
    }
    // [UPDATE 2026-07-19] 보물 창고 특산품 — 이번 런에서 하나라도 얻었으면 재화 HUD 아래에 별도 표시
    if (gameMode==='normal' && difficulty==='hard' && window.earnedSpecialtyId) {
      const _spDef = (GAME_DATA.specialtyItems||[]).find(it=>it.id===window.earnedSpecialtyId);
      if (_spDef) {
        ctx.fillStyle = '#f0d080';
        ctx.fillText(`${_spDef.icon}+${window.earnedSpecialtyCount||0}`, W-8, 48);
      }
    }
    ctx.textAlign='left';

    // [UPDATE 2026-07-22] 선술 스킬트리 — 현재 선택한 음/양(+가지) 화면 우하단 표기
    // [UPDATE 2026-07-23] 나무 여러 그루 + 시너지 지원 — 한 줄(이름+쿨타임)씩 묶어서 표시
    // [UPDATE 2026-07-23] 사용자 피드백: 이름/쿨타임이 두 줄로 쪼개져 배지가 5개까지 쌓이던 걸
    // 나무당 1줄로 합치고, 전체를 감싸는 패널 하나로 묶어서 배경 잡음(XP오브 등)과 분리되게 정리
    if ((player._seonsulTrees || []).length) {
      const _isKoHud = !(typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      const _lines = [];
      for (const t of player._seonsulTrees) {
        const _bDef = CONFIG.SEONSUL.PATHS[t.path].BRANCHES[t.branch];
        const _icon = t.path === 'yang' ? '☀️' : '🌙';
        // [UPDATE 2026-07-24] 필살기 쿨타임만 표시하고 준필살기 쿨타임은 아예 표시가 안 되던 버그 수정 — 둘 다 표시
        let _cd = '';
        if (t.subLv > 0) {
          const _st = Math.max(0, Math.ceil(t.subT || 0));
          _cd += _st > 0 ? `  ${_bDef.sub.icon}${_st}s` : `  ${_bDef.sub.icon}${_isKoHud?'준비':'Rdy'}`;
        }
        if (t.finalLv > 0) {
          const _ft = Math.max(0, Math.ceil(t.finalT || 0));
          _cd += _ft > 0 ? `  ⭐${_ft}s` : `  ⭐${_isKoHud?'준비':'Rdy'}`;
        }
        const _ready = (t.subLv > 0 && (t.subT||0) <= 0) || (t.finalLv > 0 && (t.finalT||0) <= 0);
        _lines.push({ text: `${_icon} ${_isKoHud ? _bDef.labelKo : _bDef.labelEn}${_cd}`, color: _bDef.color, ready: _ready });
      }
      if (player._seonsulSynergy) {
        const syn = CONFIG.SEONSUL.SYNERGY[player._seonsulSynergy];
        _lines.push({ text: `✨ ${_isKoHud?syn.labelKo:syn.labelEn}`, color: '#ffd090', ready: false });
      }
      ctx.font = 'bold 11px sans-serif';
      const _panelW = Math.max(...(_lines.map(l => ctx.measureText(l.text).width))) + 20;
      const _lineH = 20;
      const _panelH = _lines.length * _lineH + 8;
      const _px = W - _panelW - 10, _py = H - _panelH - 10;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath(); ctx.roundRect(_px, _py, _panelW, _panelH, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(_px, _py, _panelW, _panelH, 8); ctx.stroke();
      ctx.textAlign = 'right';
      _lines.forEach((l, i) => {
        ctx.fillStyle = l.ready ? '#ffe0a0' : l.color;
        ctx.font = l.ready ? 'bold 11px sans-serif' : '11px sans-serif';
        ctx.fillText(l.text, _px + _panelW - 10, _py + 18 + i * _lineH);
      });
      ctx.textAlign = 'left';
    }

  }

  function drawBossHPBar(W,H,bossObj,yOffset){
    const b=bossObj||boss;
    const bw=Math.min(W-40,400),bh=14,bx=(W-bw)/2,by=60+(yOffset||0);
    const ratio=b.hp/b.maxHp,phase=b.phase;
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(bx-4,by-18,bw+8,bh+26);
    const _bIsEn=(typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    ctx.textAlign='center';ctx.font='bold 11px sans-serif';ctx.fillStyle=b.color;ctx.fillText(_bIsEn?(b.nameEn||b.name):b.name,W/2,by-4);
    ctx.fillStyle='#6a5a4a';ctx.font='9px sans-serif';ctx.fillText(_bIsEn?(b.subEn||b.sub):b.sub,W/2,by+bh+12);ctx.textAlign='left';
    ctx.fillStyle='#200';ctx.fillRect(bx,by,bw,bh);
    const cols=['#c04010','#e06010','#ff2020'];
    const grd=ctx.createLinearGradient(bx,by,bx+bw,by);
    grd.addColorStop(0,cols[Math.min(phase,2)]);grd.addColorStop(1,'#ff6040');
    ctx.fillStyle=grd;ctx.fillRect(bx,by,bw*ratio,bh);
    for(const ph of b.phases.slice(1)){
      const lx=bx+bw*ph.threshold;
      ctx.strokeStyle='rgba(255,255,255,0.4)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(lx,by);ctx.lineTo(lx,by+bh);ctx.stroke();
    }
    ctx.textAlign='center';ctx.font='bold 9px sans-serif';ctx.fillStyle='#e8dcc8';
    ctx.fillText(`${Math.ceil(b.hp)} / ${b.maxHp}`,W/2,by+bh-2);ctx.textAlign='left';
  }

  // catIdx: 'main_0', 'sub_0', 'sub_1' 등 (cat_숫자 형식)
  // cardW: 카드 width 스타일 문자열
  function cardHTML(ch, catIdx, cardW){
    const [cat,idxStr] = (catIdx||'main_0').split('_');
    const idx = parseInt(idxStr||'0');
    const isEvo=ch.type==='evolve', isNewSub=ch.type==='new_sub';
    const isStat=ch.type==='stat'||ch.type==='stat_up', isSpec=ch.type==='special';
    const isUpg=ch.type==='upgrade', isAscend=ch.type==='ascend';
    let name,icon,desc,badge,color,imgSrc='',category='';

    // 타입별 컬러 바 색상 (슬롯 패널과 동일)
    // 주무기: 금색, 보조무기: 파랑, 스탯: 초록, 진화: 주황
    let barColor='#4080a0', typeLabel='', typeLabelBg='rgba(40,80,160,0.8)';

    const _isEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
    const _tl = (k,ko,en) => _isEn ? en : ko; // typeLabel 헬퍼

    if(isEvo){
      const _evoName = wi18n(ch.weapon.defId+'_evo', 'name', null) || wi18n(ch.weapon.evolveInto||ch.weapon.defId,'name',ch.weapon.evolvedName);
      name=wi18n(ch.weapon.def?.evolveInto||ch.weapon.defId,'name',ch.weapon.evolvedName);
      icon='✨';
      desc=wi18n(ch.weapon.defId,'name',ch.weapon.name)+' → '+name;
      badge=_tl('evo','⚡진화!','⚡Evolve!'); color='#e0a020';
      barColor='#e0a020'; typeLabel=_tl('evo','⚡ 진화','⚡ Evolve'); typeLabelBg='rgba(160,80,0,0.9)';
      imgSrc=CARD_IMGS[ch.weapon.defId]||'';
    } else if(isSpec){
      name=wi18n(ch.statId,'name',ch.def.name); icon=ch.def.icon;
      desc=wi18n(ch.statId,'desc',ch.def.desc); badge=_tl('s','특화','Special'); color='#e06020';
      barColor='#e06020'; typeLabel=_tl('mw','주무기','Main Wpn'); typeLabelBg='rgba(160,60,0,0.9)';
      imgSrc=CARD_IMGS[ch.weapon?.defId]||'';
    } else if(isAscend){
      name=wi18n(ch.weapon.defId,'name',ch.weapon.name); icon=ch.weapon.icon;
      // [UPDATE 2026-07-06] 다음 픽 후 상태 표시 (현재 lv/각성 기준)
      const _w=ch.weapon, _curAwk=_w._awakLv||0, _curLv=_w.lv||1;
      let aStar, aText;
      if (_curAwk >= 5) {
        // 5각 이후: 데미지만 +8% (_awakLv=5 고정, _overAwkDmg로 단계 추적)
        const _overStep = Math.round(((_w._overAwkDmg||1) - 1) / 0.08) + 1;
        aStar = '★★★★★+'+_overStep;
        aText = _tl('','데미지 +'+(_overStep*8)+'%','Damage +'+(_overStep*8)+'%');
      } else if (_curLv < 4) {
        // 같은 각성 내 레벨업
        aStar = _curAwk > 0 ? '★'.repeat(_curAwk) : '☆';
        aText = _tl('',_curAwk+'각 Lv.'+(_curLv+1),_curAwk+' Awk Lv.'+(_curLv+1));
      } else if (_curAwk < 4) {
        // lv4에서 각성 진행
        aStar = '★'.repeat(_curAwk+1);
        aText = _tl('',(_curAwk+1)+'각성!',(_curAwk+1)+' Awaken!');
      } else {
        // 4각 lv4 → 5각 MAX
        aStar = '★★★★★';
        aText = _tl('','5각성 MAX!','5th Awaken MAX!');
      }
      desc = aText; // [UPDATE 2026-07-06] "쿨타임 × 0.9" 문구 제거 — 실제로 적용 안 되는 죽은 텍스트였음
      badge=aStar; color='#c060e0';
      barColor='#c060e0'; typeLabel=_tl('','★ 각성','★ Ascend'); typeLabelBg='rgba(120,0,180,0.9)';
      imgSrc=CARD_IMGS[ch.weapon.defId]||'';
    } else if(isUpg){
      name=wi18n(ch.weapon.defId,'name',ch.weapon.name); icon=ch.weapon.icon;
      desc='Lv '+ch.weapon.lv+' → '+(ch.weapon.lv+1);
      badge='Lv '+(ch.weapon.lv+1); color='#c08020';
      const isMainWpn = !!(typeof MAIN_WEAPON_DEFS !== 'undefined' && MAIN_WEAPON_DEFS[ch.weapon.defId]);
      barColor=isMainWpn?'#e0a020':'#4080e0';
      typeLabel=isMainWpn?_tl('mw','주무기','Main Wpn'):_tl('sw','보조무기','Sub Wpn');
      typeLabelBg=isMainWpn?'rgba(160,80,0,0.9)':'rgba(20,60,160,0.9)';
      imgSrc=CARD_IMGS[ch.weapon.defId]||'';
    } else if(isNewSub){
      name=wi18n(ch.weaponId,'name',ch.def.name); icon=ch.def.icon;
      desc=wi18n(ch.weaponId,'desc',ch.def.desc); badge=_tl('n','새 무기','New'); category=ch.def.category||'';
      color=ch.def.rarity==='rare'?'#a040e0':ch.def.rarity==='uncommon'?'#4080e0':'#40a060';
      barColor='#4080e0'; typeLabel=_tl('sw','보조무기','Sub Wpn'); typeLabelBg='rgba(20,60,160,0.9)';
      imgSrc=CARD_IMGS[ch.weaponId]||'';
    } else if(isStat){
      name=wi18n(ch.statId,'name',ch.def.name); icon=ch.def.icon;
      desc=wi18n(ch.statId,'desc',ch.def.desc);
      badge=ch.cur?'Lv '+(ch.cur.lv+1):_tl('new','신규','New'); color='#30a060';
      barColor='#30a060'; typeLabel=_tl('stat','스탯','Stat'); typeLabelBg='rgba(20,120,60,0.9)';
    }

    const catMap=_isEn?{attack:'Attack',area:'Area',debuff:'Debuff',support:'Support'}:{attack:'공격',area:'범위',debuff:'디버프',support:'서포트'};
    const catClr={attack:'#e04040',area:'#e08020',debuff:'#a040e0',support:'#20a060'};
    const catTag=category?`<span style="font-size:9px;background:${catClr[category]||'#666'};color:#fff;padding:1px 5px;border-radius:6px;margin-left:4px">${catMap[category]||''}</span>`:'';
    const bg=isEvo?'rgba(50,35,0,.96)':'rgba(12,8,24,.96)';
    const bgHov=isEvo?'rgba(70,50,0,.96)':'rgba(30,18,54,.96)';
    const glow=isEvo?'0 0 18px rgba(220,160,20,.5)':'';
    const imgHTML=imgSrc
      ?`<img src="${imgSrc}" style="width:52px;height:52px;object-fit:contain;image-rendering:pixelated;flex-shrink:0">`
      :`<div style="font-size:30px;width:52px;text-align:center;flex-shrink:0">${icon}</div>`;

    const _cw = cardW || 'width:100%;max-width:320px';
    return `<div id="lvup-card-${cat}-${idx}" onclick="GameScene.confirmPick(this,'${cat}',${idx})"
      onmouseenter="this.style.background='${bgHov}'"
      onmouseleave="this.style.background='${bg}'"
      style="${_cw};background:${bg};
        border:1.5px solid ${color};border-left:5px solid ${barColor};
        border-radius:12px;padding:10px 12px;cursor:pointer;
        display:flex;align-items:center;gap:12px;box-shadow:${glow};transition:background .15s;position:relative;overflow:hidden">
      ${imgHTML}
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span style="font-size:9px;background:${typeLabelBg};color:#fff;padding:1px 6px;border-radius:4px;font-weight:700;letter-spacing:.04em">${typeLabel}</span>
          ${catTag}
        </div>
        <div style="font-size:13px;color:${isEvo?'#f0c040':'#e8dcc8'};font-weight:700">${name}</div>
        <div style="font-size:10px;color:${isEvo?'#c08020':'#8a7a6a'};margin-top:2px;line-height:1.4">${desc}</div>
        ${isEvo?`<div style="font-size:9px;color:#e0a020;margin-top:3px">✨ ${_isEn?'Evolved to Legend!':'전설로 진화!'}</div>`:''}
      </div>
      <div style="font-size:10px;background:${color};color:#fff;padding:3px 9px;border-radius:10px;font-weight:700;flex-shrink:0;white-space:nowrap">${badge}</div>
    </div>`;
  }

  // [UPDATE 2026-07-25] 레벨업 자동선택 티어 정의 — triggerLevelUp(자동모드 즉시적용)과
  // 기존 카드UI 양쪽에서 공용으로 쓰도록 모듈 스코프로 분리 (기존엔 triggerLevelUp 내부에 갇혀 있었음)
  // 0: 피흡수 / 1: 치유향·도깨비불·독안개·번개장판 / 2: 저승낫·독침·천둥북·공격력·공속
  // 2.5: (조건부) 보조무기 슬롯 미충족 시 신규 보조무기 우선
  // 3: 쿨감 / 3.5: (조건부) 스탯 슬롯 미충족 시 신규 스탯 우선
  // 4: 특수강화·각성 / 5: 주무기 강화 / 6: 그 외
  const _LEVELUP_SUB_TIER  = {
    heal_incense:1, goblin_fire:1, poison_mist:1, lightning_trap:1,
    scythe_sub:2, poison_needle:2, thunder_drum:2,
  };
  const _LEVELUP_STAT_TIER = { vampire:0, atk:2, spd:2, cd:3 };
  function _levelUpTier(c) {
    const id = c.weaponId || c.weapon?.defId;
    // [UPDATE 2026-07-26] 히든 시너지 활성 시 관련 보조무기를 최우선(0순위)으로 승격 —
    // 도깨비불(goblin_fire)은 이미 고정 tier:1이라 항상 우선이었지만, 아래 3개는 조건부로만 우선해야 해서 여기서 처리.
    if (id === 'water_jet'  && player._waterJetDoubleBoost)  return 0; // 13. 청아×드라고
    if (id === 'scythe_sub' && player._reaperSplitBoost)     return 0; // 15. (해원맥/강림차사)×(저승나비/상사화)
    if (id === 'ghost_hand' && player._ghostHandSizeBoost)   return 0; // 16. 환생동자×영혼불씨
    if (id && _LEVELUP_SUB_TIER[id]!=null) return _LEVELUP_SUB_TIER[id];
    const _isStatLike = c.type==='stat' || c.type==='stat_up';
    if (_isStatLike && _LEVELUP_STAT_TIER[c.statId]!=null) return _LEVELUP_STAT_TIER[c.statId];
    if (_isStatLike && c.statId==='hp' && (window.statSlots||[]).some(s=>s.id==='vampire')) return 3.4;
    if (c.type==='special') return 4;
    if (c.type==='ascend')  return 4;
    if (c.type==='upgrade' && c._cat==='main') return 5;
    if (c.type==='new_sub' && (window.subWeapons||[]).length < 3) return 2.5;
    if (c.type==='stat') {
      const _statSlots = (window.statSlots||[]).filter(s=>!s.isSpecial);
      const _already = _statSlots.some(s=>s.id===c.statId);
      if (!_already && _statSlots.length < 4) return 3.5;
    }
    return 6;
  }
  function _autoBestPickChoice(choices) {
    const all = [
      ...choices.main.map((c,i)=>({...c,_cat:'main',_idx:i})),
      ...choices.sub.map((c,i)=>({...c,_cat:'sub', _idx:i})),
      ...choices.stat.map((c,i)=>({...c,_cat:'stat',_idx:i})),
    ];
    if (!all.length) return null;
    all.sort((a,b)=>_levelUpTier(a)-_levelUpTier(b));
    return all[0];
  }
  // [UPDATE 2026-07-25] pickLevelUp()과 triggerLevelUp()의 자동모드 즉시적용 경로가 공유하는 실제 적용 로직
  function _applyLevelUpChoice(c) {
    if(c.type==='evolve'){
      c.weapon.evolve(); spawnEvolveEffect();
    } else if(c.type==='upgrade'||c.type==='ascend'){
      c.weapon.upgrade();
    } else if(c.type==='new_sub'){
      if(!window.subWeapons) window.subWeapons=[];
      window.subWeapons.push(new WeaponInstance(c.weaponId));
      weapons=[...(window.mainWeapons||[window.mainWeapon].filter(Boolean)),...window.subWeapons];
      player.weapons=weapons;
    } else if(c.type==='stat'||c.type==='stat_up'){
      if(!window.statSlots) window.statSlots=[];
      const ex=window.statSlots.find(s=>s.id===c.statId&&!s.isSpecial);
      if(ex){ex.lv++;c.def.apply(player,ex.lv);}
      else{window.statSlots.push({id:c.statId,lv:1,isSpecial:false});c.def.apply(player,1);}
    } else if(c.type==='special'){
      if(!window.statSlots) window.statSlots=[];
      const ex=window.statSlots.find(s=>s.id===c.statId);
      if(ex){ex.lv++;}else{window.statSlots.push({id:c.statId,lv:1,isSpecial:true});}
      // 특수강화는 해당 무기 인스턴스에만 적용 (전역 공유 방지)
      c.weapon._bonus=(window.statSlots.find(s=>s.id===c.statId)?.lv||0);
    }
  }

  function triggerLevelUp(){
    try {
      levelUpChoices=getLevelUpChoices(window.mainWeapons||[window.mainWeapon||weapons[0]], window.subWeapons||[], window.statSlots||[], gameMode);
    } catch(e) { console.error('레벨업 선택지 오류:', e.message); levelUpChoices={main:[],sub:[],stat:[]}; }

    // [UPDATE 2026-07-25] 자동/자동재도전 모드: 티어 체계가 안정된 이후로는 카드 화면 자체를 띄우지 않고
    // 게임을 멈추지 않은 채(state 변경 없음) 즉시 최우선 선택지를 적용 — 몰입이 끊기지 않도록.
    if (autoMode >= 2) {
      const _best = _autoBestPickChoice(levelUpChoices);
      if (_best) _applyLevelUpChoice(_best);
      // [UPDATE 2026-07-31] 대기 중인 레벨업이 남아 있으면 즉시 이어서 처리(자동 모드는 화면을 안 띄우므로 그대로 소진)
      if (player._pendingLevelUps > 0) { player._pendingLevelUps--; triggerLevelUp(); }
      return;
    }

    // [UPDATE 2026-07-15] 260715_MTOPC.md 10번: 파밍 중 레벨업 시 상태 복귀 오류 수정 —
    // 파밍 중이었는지 기록해뒀다가 pickLevelUp()에서 원래 상태로 복귀시킴 (기존엔 무조건 'playing'으로 복귀돼
    // farmingTimer가 멈춘 채 방치, 최악의 경우 클리어했는데도 시간초과 패배 처리될 수 있었음)
    window._wasFarming = (state === 'farming');
    state='levelup';
    const ui=document.getElementById('gameUI');if(!ui)return;
    ui.style.pointerEvents='auto';
    const _lvIsEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');

    // 섹션 HTML 생성 헬퍼
    function sectionHTML(label, choices, cat) {
      if (!choices || choices.length === 0) return '';
      // 주무기: 1개 가로 / 보조무기·스탯: 세로 나열
      const isMain = cat === 'main';
      const rowStyle = isMain
        ? 'display:flex;justify-content:center;'
        : 'display:flex;flex-direction:column;gap:6px;align-items:center;';
      const cardsW = 'width:100%;max-width:320px';
      return `<div id="lvup-sec-${cat}" style="width:100%;max-width:320px;transition:opacity .3s">
        <div style="font-size:9px;color:#5a4a3a;font-weight:700;letter-spacing:.08em;margin-bottom:4px;padding-left:4px;">${label}</div>
        <div style="${rowStyle}">
          ${choices.map((ch,i)=>cardHTML(ch, cat+'_'+i, cardsW)).join('')}
        </div>
      </div>`;
    }

    const hasAny = levelUpChoices.main.length||levelUpChoices.sub.length||levelUpChoices.stat.length;
    const bodyHTML = hasAny
      ? [
          sectionHTML(_lvIsEn?'── MAIN WEAPON ──':'── 주 무 기 ──', levelUpChoices.main, 'main'),
          sectionHTML(_lvIsEn?'── SUB WEAPONS ──':'── 보 조 무 기 ──', levelUpChoices.sub, 'sub'),
          sectionHTML(_lvIsEn?'── STAT ──':'── 스   탯 ──', levelUpChoices.stat, 'stat'),
        ].filter(Boolean).join('')
      : `<div style="color:#8a7a6a;font-size:13px;text-align:center">${_lvIsEn?'Nothing available':'선택지 없음'}<br><br>
         <button onclick="GameScene.pickLevelUp('none',0)" style="padding:10px 24px;background:rgba(112,64,192,.5);border:1px solid #7040c0;color:#e8dcc8;border-radius:20px;cursor:pointer;font-family:inherit;">${_lvIsEn?'Continue':'계속하기'}</button></div>`;

    ui.innerHTML=`<div class="scroll-pan-y" style="position:absolute;inset:0;background:rgba(0,0,10,.85);
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:10px;padding:16px;overflow-y:auto">
      <div style="font-size:22px;color:#f0c040;font-weight:700;text-shadow:0 0 12px rgba(240,192,64,.5);margin-top:8px">✨ ${_lvIsEn?'Level Up!':'레벨 업!'} Lv.${player.level} ✨</div>
      <div style="font-size:10px;color:#5a4a3a;margin-bottom:4px">ATK+3 &nbsp;SPD+2 &nbsp;MOV+1 &nbsp;DEF+2</div>
      ${bodyHTML}
    </div>`;

    // [UPDATE 2026-07-25] 자동모드(2/3)는 이제 triggerLevelUp() 초입에서 카드 화면을 아예 안 띄우고 즉시 반환하므로
    // 여기까지 도달하지 않음(수동/반자동 모드만 이 UI를 봄) — 예전 "0.5초 후 자동선택" 지연 블록은 제거.
  }

  // [UPDATE 2026-07-10] 레벨업 카드 클릭 시 뭘 골랐는지 보이도록 깜빡임 확인 연출 후 실제 적용
  function confirmPick(el, cat, idx){
    // [UPDATE 2026-07-16] 260716_MTOPC.md 4번: 자동선택 타이머와 수동 클릭 타이밍이 겹치면 카드 2장이 한번에
    // 적용되던 버그 — state 가드 추가(이미 처리된 레벨업이면 완전히 무시) + 대기 중인 자동선택 타이머 취소
    if(!el || el.dataset.picked || state !== 'levelup') return; // 중복 클릭 방지
    if (window._levelupAutoTimeout) { clearTimeout(window._levelupAutoTimeout); window._levelupAutoTimeout = null; }
    el.dataset.picked = '1';
    // 나머지 카드는 흐리게 + 클릭 막기
    const container = document.getElementById('gameUI');
    if(container) container.style.pointerEvents='none';
    el.style.pointerEvents='none';
    el.style.animation = 'lvupPickFlash 0.35s ease-in-out 3';
    el.style.boxShadow = '0 0 0 3px #ffe070, 0 0 20px rgba(255,224,112,.8)';
    if(!document.getElementById('lvup-pick-flash-style')){
      const s=document.createElement('style'); s.id='lvup-pick-flash-style';
      s.textContent = `@keyframes lvupPickFlash{0%,100%{filter:brightness(1)}50%{filter:brightness(1.9)}}`;
      document.head.appendChild(s);
    }
    // 체크마크 오버레이
    const check=document.createElement('div');
    check.textContent='✓';
    check.style.cssText='position:absolute;top:4px;right:8px;font-size:20px;font-weight:900;color:#ffe070;text-shadow:0 0 6px rgba(0,0,0,.8);';
    el.appendChild(check);
    setTimeout(() => pickLevelUp(cat, idx), 420);
  }

  // cat: 'main'|'sub'|'stat'|'none', idx: 숫자
  function pickLevelUp(cat, idx){
    // [UPDATE 2026-07-16] 260716_MTOPC.md 4번: 이미 처리된 레벨업이 자동선택 타이머 등으로 재실행되는 것 방지
    if (state !== 'levelup') return;
    const c = (cat==='main'||cat==='sub'||cat==='stat') ? levelUpChoices[cat][idx] : null;
    if(c){
      _applyLevelUpChoice(c);

      // 선택한 카드 섹션에서 제거하고 UI 갱신 (다른 섹션 선택 대기)
      // 1개 선택 즉시 닫기
      const ui2=document.getElementById('gameUI');
      if(ui2){ui2.innerHTML='';ui2.style.pointerEvents='none';}
      // [UPDATE 2026-07-15] 260715_MTOPC.md 10번: 파밍 중이었으면 'farming'으로 복귀 (기존 무조건 'playing' 하드코딩 수정)
      state = window._wasFarming ? 'farming' : 'playing';
      window._wasFarming = false;
      // [UPDATE 2026-07-31] 오브 하나로 여러 레벨이 오른 경우, 남은 횟수만큼 카드 화면을 이어서 띄운다
      if (player._pendingLevelUps > 0) { player._pendingLevelUps--; triggerLevelUp(); }
      return;
    }
    const ui=document.getElementById('gameUI');
    if(ui){ui.innerHTML='';ui.style.pointerEvents='none';}
    state = window._wasFarming ? 'farming' : 'playing';
    window._wasFarming = false;
  }

  // ── 진화 이펙트 ──
  function spawnEvolveEffect(){
    screenShake=1.5;
    // 플레이어 주변 방사형 파티클
    for(let i=0;i<20;i++){
      const ang=(i/20)*Math.PI*2;
      floatingTexts.push({
        x:player.x+Math.cos(ang)*40,
        y:player.y+Math.sin(ang)*40,
        text:'⚡',color:'#f0c040',t:-Math.random()*0.3
      });
    }
    floatingTexts.push({x:player.x,y:player.y-20,text:'✨',color:'#f0c040',t:-0.2});
  }

  function endGame(victory){
    state=victory?'victory':'dead';
    const btn=document.getElementById('pauseBtn');if(btn)btn.style.display='none';
    saveData=Save.load();
    // [UPDATE 2026-07-15] 버그 수정: 이 두 배너 플래그가 victory 블록 안에서만 초기화돼서, 이전 런에서 승리해 배너가
    // 세팅된 뒤 다음 런에서 패배해도 window에 남은 값이 그대로 결과화면에 다시 뜨던 문제 — 승패 무관하게 매번 초기화
    window._s2UnlockMsg = null;
    window._beginnerGiftParts = null;
    // [UPDATE 2026-07-14] 초보자 선물(스테이지1~20 최초클리어 보너스) 판정용 — 클리어 기록 갱신 전 상태를 미리 기억
    const _wasStageClearedBefore = Unlock.cleared(saveData, stageId);
    // [UPDATE 2026-07-19] 마일스톤 스테이지(LOBBY_CHANGE_STAGES) 로비강제를 "최초 클리어일 때만"으로 좁히기 위해
    // showResultScreen()에서도 참조할 수 있도록 window에 노출 — 자동재도전으로 같은 마일스톤 스테이지를 반복
    // 파밍할 때마다 매번 로비로 튕기던 문제 수정용
    window._wasStageClearedBefore = _wasStageClearedBefore;
    // [UPDATE 2026-08-08] 파트2는 완전 별도 신규 세이브라 최초클리어/슬롯해금 안내가 매 마일스톤(1/5/10/15/20/25/30/110/160)마다
    // 다시 걸려서 자동진행이 계속 로비로 튕겨나가던 문제 — 파트1에서 이미 다 겪은 튜토리얼성 팝업이라 파트2는 전부 스킵.
    const _isPart2Profile = (typeof Save !== 'undefined' && Save.getActiveProfile && Save.getActiveProfile() === 'part2');
    if(gameMode==='normal'&&victory){
      const prevCleared = saveData.clearedStages || [];
      // [UPDATE 2026-08-06] 버그 수정: wasFirst가 레거시 clearedStages(노말 이상 전용)만 보고 있어서,
      // 이지 난이도만 플레이하는 유저는 이 배열이 영원히 비어있어 "생애 첫 클리어" 판정이 매 스테이지마다
      // true로 나옴 → _showFirstClearDialogue가 매번 세팅되어 "다음 스테이지" 버튼이 사라지고 로비로
      // 강제 이동되던 문제. 난이도 무관 클리어 이력(이지/노말/하드 전부)을 봐야 진짜 첫 클리어를 알 수 있음.
      const wasFirst = (saveData.clearedStagesEasy||[]).length === 0
                     && (saveData.clearedStagesNormal||[]).length === 0
                     && (saveData.clearedStagesHard||[]).length === 0;
      // 레거시 clearedStages는 노말 이상 클리어만 기록 (이지 클리어가 노말로 보이는 버그 방지)
      if (difficulty !== 'easy') saveData.clearedStages=[...new Set([...prevCleared,stageId])];
      if(wasFirst && !_isPart2Profile) saveData._showFirstClearDialogue = true;
      // 난이도별 클리어 기록
      if (!saveData.clearedStagesEasy)   saveData.clearedStagesEasy   = [];
      if (!saveData.clearedStagesNormal) saveData.clearedStagesNormal = [];
      if (!saveData.clearedStagesHard)   saveData.clearedStagesHard   = [];
      if (difficulty === 'easy'   && !saveData.clearedStagesEasy.includes(stageId)) {
        saveData.clearedStagesEasy.push(stageId);
        // [UPDATE 2026-07-11] 260711_MTOPC.md 3번: 이지 챕터5 클리어 → 이지 2슬롯 해금 알림
        if (stageId === 50 && !_isPart2Profile) saveData._showSlotUnlock = 'easy2';
      }
      if (difficulty === 'normal' && !saveData.clearedStagesNormal.includes(stageId)) {
        saveData.clearedStagesNormal.push(stageId);
        if (!saveData.clearedStagesEasy.includes(stageId)) saveData.clearedStagesEasy.push(stageId);
        // 처음 노말 클리어 → 슬롯 해금 알림
        if (saveData.clearedStagesNormal.length === 1 && !_isPart2Profile) saveData._showSlotUnlock = 'normal';
      }
      if (difficulty === 'hard'   && !saveData.clearedStagesHard.includes(stageId)) {
        saveData.clearedStagesHard.push(stageId);
        if (!saveData.clearedStagesNormal.includes(stageId)) saveData.clearedStagesNormal.push(stageId);
        if (!saveData.clearedStagesEasy.includes(stageId))   saveData.clearedStagesEasy.push(stageId);
        // 처음 하드 클리어 → 슬롯 해금 알림
        if (saveData.clearedStagesHard.length === 1 && !_isPart2Profile) saveData._showSlotUnlock = 'hard';
      }
      // 챕터 클리어 체크
      const si2 = getStageInfo(stageId);
      if (si2?.isBoss) {
        const ch2 = Math.ceil(stageId / 10);
        if (!saveData.clearedChapters) saveData.clearedChapters = [];
        const _wasChapterFirstClear = !saveData.clearedChapters.includes(ch2);
        if (_wasChapterFirstClear) saveData.clearedChapters.push(ch2);
        // [UPDATE 2026-07-18] 시즌4(귀허계) 순리석 획득 경로 ③ — 챕터보스 최초 클리어 시 20~30개 보너스
        if (_wasChapterFirstClear && ch2 >= 31 && ch2 <= 40) {
          const _ssBonus = 20 + Math.floor(Math.random() * 11);
          saveData.sullriseok = (saveData.sullriseok || 0) + _ssBonus;
          window._s2UnlockMsg = { icon:'🌊', ko:`순리석 +${_ssBonus} (챕터 최초 클리어 보너스)`, en:`Sullriseok +${_ssBonus} (First chapter clear bonus)` };
        }
      }
      // [UPDATE 2026-07-06] 시즌2 스토리 해금: 챕터16 클리어→강림차사, 챕터20 클리어→상사화
      if (stageId === 160 && !(saveData.companions || []).includes('gangnim')) {
        saveData.companions = [...(saveData.companions || []), 'gangnim'];
        window._s2UnlockMsg = { icon:'📖', ko:'새 동료 [강림차사]가 해금되었다!', en:'New companion [Gangnim Chasa] unlocked!' };
      }
      if (stageId === 200) saveData.season2Clear = true; // (기존에 설정하는 곳이 없던 버그 수정)
      // [UPDATE 2026-07-17] 순리석 던전 해금 조건(season3Clear)용 — 혼돈석 던전(hondonseok_dungeon)이
      // season2Clear로 열리는 것과 동일한 패턴
      if (stageId === 300) saveData.season3Clear = true;
      if (stageId === 400) saveData.season4Clear = true;
      if (stageId === 500) saveData.season5Clear = true; // [UPDATE 2026-07-22] 시즌6 던전/해금 조건용 — 시즌3/4와 동일 패턴
      // [UPDATE 2026-07-28] season6Clear/season7Clear가 그동안 어디서도 set되지 않던 버그 — 시즌7(어계) 해금 조건(stage-select.js)이
      // 영원히 통과 못 하는 상태였음. 시즌3/4/5와 동일 패턴으로 추가.
      if (stageId === 600) saveData.season6Clear = true;
      if (stageId === 700) saveData.season7Clear = true;
      if (stageId === 800) saveData.season8Clear = true; // [UPDATE 2026-07-31] 시즌8(황계)
      if (stageId === 200 && !(saveData.pets || []).includes('sangsahwa')) {
        saveData.pets = [...(saveData.pets || []), 'sangsahwa'];
        if (!saveData.petLevels) saveData.petLevels = {};
        saveData.petLevels.sangsahwa = 1;
        // [UPDATE 2026-07-14] 260713_MTOPC.md 18번: 해금 순간엔 원본 풀사이즈(39×52 ×2배)로 임팩트, 인게임에선 축소판(drawH44) 유지
        window._s2UnlockMsg = { icon:'🌺', spriteKey:'sangsahwa', popupW:78, popupH:104, ko:'새 펫 [상사화]가 해금되었다!', en:'New pet [Sangsahwa] unlocked!' };
      }
      // [UPDATE 2026-07-14] 초보자 선물 — 스테이지1~20 최초 클리어(난이도 무관 1회) 시 신규 유저 초반 가속용 재화 보너스
      // [UPDATE 2026-07-15] 공식을 beginnerGiftFor()로 추출(game-data.js) — 프로모 코드 소급지급과 공유
      if (!_wasStageClearedBefore && stageId >= 1 && stageId <= 20) {
        const parts = beginnerGiftFor(stageId);
        for (const p of parts) saveData[p.key] = (saveData[p.key]||0) + p.amount;
        window._beginnerGiftParts = parts;
      }
    }
    // [UPDATE 2026-07-12] 버그 수정: 강화석/천운석/천령과/태극석 던전이 전부 gameMode==='infinite'를 공유하는데
    // 어느 던전인지 구분 없이 항상 saveData.infiniteRecord 하나에만 기록해서, "무한 던전" 외 나머지는
    // 던전 목록 화면이 읽는 saveData[id+'Record'] 필드가 영원히 안 채워지던 문제. rewardMode 기준으로 분리해서 저장.
    if(gameMode==='infinite'){
      const _recKey = (_rewardMode || 'infinite') + 'Record';
      saveData[_recKey] = Math.max(saveData[_recKey]||0, Math.floor(elapsed));
    }
    // [UPDATE 2026-07-12] 버그 수정: 저장 키가 bossRushRecord(대문자 R)였는데 던전 목록 화면은 bossrushRecord(소문자)로 읽어서 항상 "기록 없음"이었음
    if(gameMode==='boss_rush')
      saveData.bossrushRecord=Math.max(saveData.bossrushRecord||0, bossRushIndex);
    saveData.totalKills=(saveData.totalKills||0)+kills;
    saveData.runs=(saveData.runs||0)+1;

    // 의원당: 런 종료 후 다음 런 HP 회복 적립
    const uiwonEff=BuildingEffects.getUiwonEffect(saveData);
    if(uiwonEff?.hp){ saveData.postRunHeal=(uiwonEff.hp); }
    if(uiwonEff?.revive){ saveData.reviveCount=(saveData.reviveCount||0)+1; }
    // 시즌 1 최초 클리어 감지 (이지 스테이지 100)
    _pendingEnding = false;
    if (gameMode==='normal' && victory && stageId===100 && difficulty==='easy' && !saveData.season1Clear) {
      saveData.season1Clear = true;
      _pendingEnding = true;
      saveData._showSlotUnlock = 'easy3'; // [UPDATE 2026-07-11] 이지 시즌1 전체클리어 → 이지 3슬롯 해금 알림
    }
    // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌 2 최초 클리어 감지 (이지 스테이지 200) — season2Clear와 별도 플래그로
    // "엔딩을 이미 봤는지"만 추적(season2Clear는 무기초월 등 다른 시스템의 해금 조건으로 이미 쓰이고 있어 분리)
    _pendingEnding2 = false;
    if (gameMode==='normal' && victory && stageId===200 && difficulty==='easy' && !saveData.season2ClearEnding) {
      saveData.season2ClearEnding = true;
      _pendingEnding2 = true;
    }
    // [UPDATE 2026-07-17] 시즌 3 최초 클리어 감지 (이지 스테이지 300) — season2ClearEnding과 동일 패턴
    _pendingEnding3 = false;
    if (gameMode==='normal' && victory && stageId===300 && difficulty==='easy' && !saveData.season3ClearEnding) {
      saveData.season3ClearEnding = true;
      _pendingEnding3 = true;
    }
    // [UPDATE 2026-07-17] 시즌 4 최초 클리어 감지 (이지 스테이지 400) — 동일 패턴
    _pendingEnding4 = false;
    if (gameMode==='normal' && victory && stageId===400 && difficulty==='easy' && !saveData.season4ClearEnding) {
      saveData.season4ClearEnding = true;
      _pendingEnding4 = true;
    }
    // [UPDATE 2026-07-22] 시즌 5 최초 클리어 감지 (이지 스테이지 500) — 동일 패턴
    _pendingEnding5 = false;
    if (gameMode==='normal' && victory && stageId===500 && difficulty==='easy' && !saveData.season5ClearEnding) {
      saveData.season5ClearEnding = true;
      _pendingEnding5 = true;
    }
    // [UPDATE 2026-07-31] 오염도 정화 — 황계는 "도전했다는 사실 자체"로 오염도가 깎인다.
    // 패배해도 유효 진행이라 오염도가 높아 즉사하는 구간에서도 계속 앞으로 나아간다는 게 이 설계의 핵심
    // (시즌7 엔딩 4장 "수천 번, 수만 번 스러지며 ... 다 깎아낼 때까지 덤벼주마"의 게임적 구현).
    // 오염도가 줄수록 이기기 시작하고, 승리는 정화량이 10배라 자연스럽게 가속된다.
    // [UPDATE 2026-08-02] 버그 수정: stageId===701로만 고정돼 있어서 702 이후 스테이지에서는
    // 승패 무관 정화가 전혀 안 되고 페널티만 계속 남는 사각지대가 있었음(실사용 중 재현 확인).
    // 701뿐 아니라 황계 전 구간(701~800)에서 동일하게 정화되도록 확장.
    if (gameMode === 'normal' && stageId >= 701 && stageId <= 800 && (saveData.blessings || 0) > 0) {
      // 남은 오염도에 비례해서 깎는다(기하급수) — 초반엔 크게 줄고, 최소값 덕에 끝도 질질 끌지 않는다.
      const _cur = saveData.blessings || 0;
      const _purify = victory
        ? Math.max(CONFIG.BLESSING.PURIFY_WIN_MIN,  Math.ceil(_cur * CONFIG.BLESSING.PURIFY_WIN_RATE))
        : Math.max(CONFIG.BLESSING.PURIFY_LOSE_MIN, Math.ceil(_cur * CONFIG.BLESSING.PURIFY_LOSE_RATE));
      saveData.blessings = Math.max(0, _cur - _purify);
      window.purifiedAmount = _purify;             // 결과 화면 표시용
      window.purifiedRemain = saveData.blessings;
    } else {
      window.purifiedAmount = 0;
    }
    // [UPDATE 2026-07-31] 시즌 6·7 최초 클리어 감지 — 그동안 이 감지 자체가 없어서 엔딩 슬라이드(SLIDES_S6)를
    // 다 만들어두고도 영영 재생되지 않던 버그. 시즌6은 v0.5.1로 이미 공개된 상태라 실제로 누락된 연출이었음.
    _pendingEnding6 = false;
    if (gameMode==='normal' && victory && stageId===600 && difficulty==='easy' && !saveData.season6ClearEnding) {
      saveData.season6ClearEnding = true;
      _pendingEnding6 = true;
    }
    _pendingEnding7 = false;
    if (gameMode==='normal' && victory && stageId===700 && difficulty==='easy' && !saveData.season7ClearEnding) {
      saveData.season7ClearEnding = true;
      _pendingEnding7 = true;
    }
    // [UPDATE 2026-08-02] 시즌8(황계) 최초 클리어 감지 — 최종보스(스테이지800) 처치가 사실상 게임 전체의 엔딩.
    // 다른 시즌과 달리 이지 난이도 한정이 아니라 난이도 무관 최초 1회 트리거(최종 엔딩이라 놓치면 안 됨).
    _pendingEnding8 = false;
    if (gameMode==='normal' && victory && stageId===800 && !saveData.season8ClearEnding) {
      saveData.season8ClearEnding = true;
      _pendingEnding8 = true;
      // [UPDATE 2026-08-02] 이 시점부터 박수는 동료가 아니라 주인공 본인 — 편성돼 있었다면 자동 해제
      // (player.js/character.js 스프라이트·목록 교체 조건과 동일 시점으로 맞춤)
      if (Array.isArray(saveData.activeCompanions)) {
        saveData.activeCompanions = saveData.activeCompanions.filter(id => id !== 'baksu');
      }
    }
    AchievementScene.checkAndUnlock(saveData);
    Save.save(saveData);

    setTimeout(()=>showResultScreen(victory), 800);
  }

  function drawResultOverlay(W,H,victory){
    // Canvas엔 아무것도 안 그림 — DOM 오버레이가 담당
  }

  function showResultScreen(victory) {
    if (document.getElementById('result-overlay')) return;
    const isKo = Lang.getCurrent() === 'ko';
    // [UPDATE 2026-07-18] 슬롯 해금 등 로비 전용 팝업은 특정 스테이지에 고정된 게 아니라(예: 이지 스테이지50
    // 클리어=easy2, 노말/하드 최초 클리어=아무 스테이지에서나 발생 가능) LOBBY_CHANGE_STAGES 고정 목록만으론
    // 못 잡음 — endGame()이 이미 세팅해 둔 saveData 플래그를 직접 확인해 로비 강제 여부에 반영
    const _hasPendingLobbyPopup = !!(saveData && (saveData._showSlotUnlock || saveData._showFirstClearDialogue));
    // [UPDATE 2026-07-19] 마일스톤 스테이지 로비강제 완화 — 기존엔 스테이지 번호만 보고 무조건 강제해서, 이미
    // 오래전에 다 해금한 스테이지를 자동재도전으로 반복 파밍해도 매번 로비로 튕겨나가 파밍 기능이 무력화되던 문제.
    // 시즌 엔딩과 직결된 100/200/300/400은 안전하게 항상 유지, 건물/동료 해금 안내(1/5/10/15/20/25/30/110/160)는
    // 최초 클리어(!_wasStageClearedBefore)일 때만 강제.
    // [UPDATE 2026-08-08] 파트2(완전 별도 신규 세이브)는 건물/동료 해금 안내용 마일스톤(FIRST_ONLY)을 파트1에서
    // 이미 다 봤으므로 강제하지 않음 — 시즌엔딩 직결 100/200/300/400 등(ALWAYS)은 파트2도 그대로 유지.
    const _isPart2Profile2 = (typeof Save !== 'undefined' && Save.getActiveProfile && Save.getActiveProfile() === 'part2');
    const _isFirstTimeMilestone =
      LOBBY_CHANGE_STAGES_ALWAYS.includes(stageId) ||
      (!_isPart2Profile2 && LOBBY_CHANGE_STAGES_FIRST_ONLY.includes(stageId) && !window._wasStageClearedBefore);

    // ── 타이틀 ──
    const title =
      gameMode==='infinite'
        ? (victory ? (isKo?'🌀 무한 도전 종료!':'🌀 Infinite Run End!') : (isKo?`💀 Wave ${infiniteWave} 전멸`:`💀 Wave ${infiniteWave} Defeated`))
        : gameMode==='boss_rush'
          // [UPDATE 2026-07-14] 260714_MTOPC.md 15번: 무한 확장형이라 "전체 클리어" 문구 제거, 처치 수만 표시
          ? (isKo?`💎 ${bossRushIndex}보스 처치`:`💎 Boss ${bossRushIndex} Slain`)
          : (victory
              ? (isBossStage ? (isKo?'⚔️ 보스 격파!':'⚔️ Boss Defeated!') : (isKo?'🏆 스테이지 클리어!':'🏆 Stage Clear!'))
              : (timeLeft<=0 ? (isKo?'⏰ 시간 초과':'⏰ Time Up') : (isKo?'💀 전멸':'💀 Defeated')));

    const earnedGold    = window.earnedGold || 0;
    const earnedSpecial = window.earnedSpecial || 0;
    const earnedSoulFragments = window.earnedSoulFragments || 0;
    const earnedSoulStones    = window.earnedSoulStones || 0;
    // [UPDATE 2026-07-17] 스토리 스테이지(시즌2 이후, 차원석 경제)의 earnedSpecial은 던전 특화재화가 아니라 차원석 —
    // 아이콘이 항상 비어보이던 버그 원인. _rewardMode 유무로 던전/스토리 문맥을 구분해서 아이콘을 정확히 매칭.
    const _isStoryDimStage = (gameMode==='normal' && !_rewardMode && stageId>=101);
    const specialIcon = _rewardMode ? (SPECIAL_ICONS[_rewardMode] || '💠') : (_isStoryDimStage ? '🔷' : '');
    const survivedComp = companions.filter(c=>!c.dead).length;
    const timeSec = Math.floor(elapsed);
    const timeStr = isKo ? `${Math.floor(timeSec/60)}분 ${timeSec%60}초` : `${Math.floor(timeSec/60)}m ${timeSec%60}s`;

    // ── 별점 (클리어 시만) ──
    let stars = 0;
    if (victory && gameMode==='normal') {
      if (player.hp > player.maxHp * 0.6) stars = 3;
      else if (player.hp > player.maxHp * 0.2) stars = 2;
      else stars = 1;
    }
    const starsHtml = victory && gameMode==='normal'
      ? `<div style="font-size:28px;margin:8px 0;letter-spacing:4px;">
          ${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}
        </div>` : '';

    // [UPDATE 2026-07-17] 이번 판에 얻은 재화가 1종류뿐이라는 가정이 틀렸음(골드+차원석+영혼조각/영혼석이 동시에
    // 나올 수 있음) — either/or 대신 0보다 큰 재화를 전부 나열하도록 재설계(사용자 지적)
    const earnedRows = [];
    if (earnedGold > 0) earnedRows.push({ icon:'🪙', label: isKo?'획득 골드':'Gold', val:`+${Format.num(earnedGold)}` });
    if (earnedSpecial > 0) earnedRows.push({ icon: specialIcon, label: isKo?(_isStoryDimStage?'획득 차원석':'획득 재화'):(_isStoryDimStage?'Dim. Stones':'Earned'), val:`+${earnedSpecial}` });
    if (earnedSoulFragments > 0) earnedRows.push({ icon:'👻', label: isKo?'영혼 조각':'Soul Frag.', val:`+${earnedSoulFragments}` });
    if (earnedSoulStones > 0) earnedRows.push({ icon:'💜', label: isKo?'영혼석':'Soul Stone', val:`+${earnedSoulStones}` });
    // [UPDATE 2026-07-19] 보물 창고 특산품(하드모드 드랍) — 이번 런에서 얻었으면 결과화면에도 표시
    if (window.earnedSpecialtyCount > 0 && window.earnedSpecialtyId) {
      const _spDef = (GAME_DATA.specialtyItems||[]).find(it=>it.id===window.earnedSpecialtyId);
      if (_spDef) earnedRows.push({ icon:_spDef.icon, label: isKo?_spDef.name:_spDef.nameEn, val:`+${window.earnedSpecialtyCount}` });
    }
    // [UPDATE 2026-08-02] 오염도 정화(701 스테이지 도전) — 값은 game.js 클리어 감지부에서 이미 계산해 두고 있었지만
    // "결과 화면 표시용"이라는 주석과 달리 실제로 화면에 표시하는 코드가 없어서 유저가 정화되고 있다는 걸 알 방법이 없었음.
    if (window.purifiedAmount > 0) {
      earnedRows.push({ icon:'🕊️', label: isKo?'오염도 정화':'Corruption Purified', val:`-${window.purifiedAmount} (${isKo?'남음':'left'} ${window.purifiedRemain})` });
    }
    if (!earnedRows.length) earnedRows.push({ icon:'🪙', label: isKo?'획득 골드':'Gold', val:'+0' });

    // ── 스탯 행 ──
    const statRows = [
      { icon:'⚔️', label: isKo?'처치':'Kills',   val: `${kills}` + (gameMode==='normal'?`/${killTarget}`:'') },
      { icon:'⏱️', label: isKo?'생존시간':'Time', val: timeStr },
      ...earnedRows,
      { icon:'❤️',  label: isKo?'남은 HP':'HP Left', val: `${Math.max(0,Math.floor(player.hp))} / ${Math.floor(player.maxHp)}` },
      ...(companions.length ? [{ icon:'🤝', label: isKo?'동료 생존':'Allies', val: `${survivedComp}/${companions.length}` }] : []),
      { icon:'⬆️',  label: isKo?'레벨':'Level', val: `${player.level}` },
    ];

    const canRetry = gameMode === 'normal';

    // 패배 시 player_fail 이미지 data URL 미리 추출
    let failImgSrc = '';
    if (!victory && SPRITES?.playerFail) {
      const _fi = SpriteLoader.get(SPRITES.playerFail.src);
      if (_fi?.src) failImgSrc = _fi.src;
    }

    const div = document.createElement('div');
    div.id = 'result-overlay';
    div.style.cssText = `
      position:absolute;inset:0;z-index:100;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      background:${victory?'rgba(0,20,0,0.85)':'#000'};
      font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
      opacity:0;transition:opacity 0.6s ease;
    `;

    const failImgHtml = (!victory && failImgSrc)
      ? `<img src="${failImgSrc}" style="
          width:220px;height:auto;object-fit:contain;
          margin-bottom:-16px;flex-shrink:0;
        ">`
      : '';

    div.innerHTML = `
      ${failImgHtml}
      <div style="
        width:340px;
        background:rgba(10,8,20,0.95);
        border:1.5px solid ${victory?'#f0c040':'#c04040'};
        border-radius:18px;padding:28px 24px;text-align:center;
        box-shadow:0 0 40px ${victory?'rgba(240,192,64,0.3)':'rgba(192,64,64,0.3)'};
        transform:translateY(20px);transition:transform 0.5s ease;
      " id="result-card">

        <div style="font-size:22px;font-weight:700;color:${victory?'#f0c040':'#ff5050'};
          margin-bottom:4px;letter-spacing:.05em;">
          ${title}
        </div>
        ${starsHtml}

        <div style="border-top:1px solid rgba(255,255,255,0.1);margin:14px 0 10px;"></div>

        <!-- 스탯 목록 -->
        <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:16px;">
          ${statRows.map(r=>`
            <div style="display:flex;align-items:center;justify-content:space-between;
              padding:5px 10px;background:rgba(255,255,255,0.04);border-radius:8px;">
              <span style="font-size:12px;color:#8a7a6a;">${r.icon} ${r.label}</span>
              <span style="font-size:13px;color:#e8dcc8;font-weight:600;">${r.val}</span>
            </div>
          `).join('')}
        </div>

        ${window._s2UnlockMsg ? `
        <!-- [UPDATE 2026-07-06] 시즌2 스토리 해금 배너 -->
        <!-- [UPDATE 2026-07-14] 260713_MTOPC.md 18번: spriteKey 있으면 원본 풀사이즈 이미지로 임팩트 강화 -->
        <div style="
          margin-bottom:14px;padding:10px 12px;border-radius:10px;text-align:center;
          background:rgba(140,60,255,0.15);border:1px solid rgba(180,120,255,0.5);
        ">
          ${(window._s2UnlockMsg.spriteKey && SPRITES?.pets?.[window._s2UnlockMsg.spriteKey]) ? `
            <img src="${SpriteLoader.get(SPRITES.pets[window._s2UnlockMsg.spriteKey].src).src}"
              style="width:${window._s2UnlockMsg.popupW||78}px;height:${window._s2UnlockMsg.popupH||104}px;
                object-fit:contain;image-rendering:pixelated;display:block;margin:0 auto 6px;">
          ` : ''}
          <div style="font-size:13px;color:#d8b8ff;font-weight:600;">${window._s2UnlockMsg.icon} ${isKo ? window._s2UnlockMsg.ko : window._s2UnlockMsg.en}</div>
        </div>
        ` : ''}
        ${window._beginnerGiftParts ? `
        <!-- [UPDATE 2026-07-14] 초보자 선물 배너 — 스테이지1~20 최초 클리어 보너스 -->
        <div style="
          margin-bottom:14px;padding:10px 12px;border-radius:10px;text-align:center;
          background:rgba(255,200,60,0.12);border:1px solid rgba(255,210,90,0.5);
        ">
          <div style="font-size:12px;color:#ffd870;font-weight:700;margin-bottom:6px;">🎁 ${isKo?'초보자 선물':'Beginner Gift'}</div>
          <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;font-size:12px;color:#f0e0c0;">
            ${window._beginnerGiftParts.map(p => {
              const _iconHTML = p.key==='gold' ? '🪙' : p.key==='gems' ? '💎' : _cimg(p.key,14);
              return `<span>${_iconHTML} +${Format.num(p.amount)}</span>`;
            }).join('')}
          </div>
        </div>
        ` : ''}
        <!-- 재화 카운트업 -->
        <div id="gold-reward" style="
          font-size:18px;color:${earnedSpecial>0?'#c0e0ff':'#f0c040'};font-weight:700;
          margin-bottom:16px;letter-spacing:.05em;
          opacity:0;transform:scale(0.8);
          transition:opacity 0.4s ease, transform 0.4s ease;
        ">${earnedSpecial>0 ? specialIcon : '🪙'} +<span id="gold-count">0</span></div>

        <!-- 버튼 -->
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          ${canRetry ? `
            <button id="result-retry" style="
              flex:1;padding:13px 0;border-radius:10px;font-size:13px;font-weight:600;
              background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.2);
              color:#c8b8a0;cursor:pointer;font-family:inherit;
            ">${isKo?'🔄 재도전':'🔄 Retry'}</button>
          ` : ''}
          ${victory && gameMode==='normal' && !_isFirstTimeMilestone && !_hasPendingLobbyPopup ? `
            <button id="result-next" style="
              flex:1;padding:13px 0;border-radius:10px;font-size:13px;font-weight:600;
              background:rgba(64,160,64,0.5);border:1px solid #40a040;
              color:#c0ffc0;cursor:pointer;font-family:inherit;
            ">${isKo?'▶ 다음 스테이지':'▶ Next Stage'}</button>
          ` : ''}
          <button id="result-lobby" class="${victory && gameMode==='normal' && stageId===1 ? 'onboard-pulse' : ''}" style="
            flex:1;padding:13px 0;border-radius:10px;font-size:13px;font-weight:600;
            background:${victory?'rgba(112,64,192,0.5)':'rgba(80,20,20,0.6)'};
            border:1px solid ${victory?'#a060e0':'#803030'};
            color:#e8dcc8;cursor:pointer;font-family:inherit;
          ">${isKo?'🏠 로비':'🏠 Lobby'}</button>
        </div>
      </div>`;

    // 게임 컨테이너에 붙임
    canvas.parentElement.appendChild(div);

    // 페이드인 + 카드 슬라이드
    requestAnimationFrame(()=>{
      div.style.opacity = '1';
      const card = document.getElementById('result-card');
      if (card) card.style.transform = 'translateY(0)';
    });

    // 재화 카운트업 애니메이션
    const rewardTotal = earnedSpecial > 0 ? earnedSpecial : earnedGold;
    if (rewardTotal > 0) {
      setTimeout(()=>{
        const goldEl = document.getElementById('gold-reward');
        const countEl = document.getElementById('gold-count');
        if (!goldEl || !countEl) return;
        goldEl.style.opacity = '1';
        goldEl.style.transform = 'scale(1)';
        let cur = 0;
        const step = Math.max(1, Math.ceil(rewardTotal / 30));
        const iv = setInterval(()=>{
          cur = Math.min(cur + step, rewardTotal);
          countEl.textContent = Format.num(cur);
          if (cur >= rewardTotal) clearInterval(iv);
        }, 40);
      }, 600);
    }

    // 버튼 이벤트
    document.getElementById('result-lobby')?.addEventListener('click', ()=>{
      document.getElementById('result-overlay')?.remove();
      canvas._retSet = false;
      if (_pendingEnding) { _pendingEnding = false; SceneManager.go('ending'); }
      else if (_pendingEnding2) { _pendingEnding2 = false; SceneManager.go('ending', { season:2 }); } // [UPDATE 2026-07-14] 260713_MTOPC.md 16번
      else if (_pendingEnding3) { _pendingEnding3 = false; SceneManager.go('ending', { season:3 }); } // [UPDATE 2026-07-17]
      else if (_pendingEnding4) { _pendingEnding4 = false; SceneManager.go('ending', { season:4 }); } // [UPDATE 2026-07-17]
      else if (_pendingEnding5) { _pendingEnding5 = false; SceneManager.go('ending', { season:5 }); } // [UPDATE 2026-07-22]
      else if (_pendingEnding6) { _pendingEnding6 = false; SceneManager.go('ending', { season:6 }); } // [UPDATE 2026-07-31]
      else if (_pendingEnding7) { _pendingEnding7 = false; SceneManager.go('ending', { season:7 }); } // [UPDATE 2026-07-31]
      else if (_pendingEnding8) { _pendingEnding8 = false; SceneManager.go('ending', { season:8 }); } // [UPDATE 2026-08-02]
      else SceneManager.go('lobby');
    });
    document.getElementById('result-retry')?.addEventListener('click', ()=>{
      document.getElementById('result-overlay')?.remove();
      canvas._retSet = false;
      SceneManager.go('game', { stageId, difficulty });
    });
    document.getElementById('result-next')?.addEventListener('click', ()=>{
      document.getElementById('result-overlay')?.remove();
      canvas._retSet = false;
      SceneManager.go('game', { stageId: stageId + 1, difficulty });
    });

    // 자동/반자동/자동재도전 모드: 5초 카운트다운 후 자동 진행
    if (autoMode > 0) {
      let countdown = 5;
      const cdEl = document.createElement('div');
      cdEl.id = 'result-countdown';
      cdEl.style.cssText = 'text-align:center;font-size:11px;color:rgba(200,180,255,0.6);margin-top:8px;';
      const _resEn = (typeof Lang!=='undefined'&&Lang.getCurrent&&Lang.getCurrent()==='en');
      // [UPDATE 2026-07-18] 자동재도전 모드는 문구를 구분 표시
      const _cdLabel = (n) => autoMode === 3
        ? (_resEn ? `Auto-retrying in ${n}s...` : `자동 재도전 ${n}초 후...`)
        : (_resEn ? `Auto-advancing in ${n}s...` : `자동 진행 ${n}초 후...`);
      cdEl.textContent = _cdLabel(countdown);
      const card = document.getElementById('result-card');
      if (card) card.appendChild(cdEl);
      const cdIv = setInterval(()=>{
        countdown--;
        if (!document.getElementById('result-overlay')) { clearInterval(cdIv); return; }
        if (countdown <= 0) {
          clearInterval(cdIv);
          document.getElementById('result-overlay')?.remove();
          canvas._retSet = false;
          if (autoMode === 3) {
            // [UPDATE 2026-07-18] 자동 재도전: 하드모드 특산품 파밍용 — 승패/스테이지 종류 무관하게 같은 스테이지(또는 같은 던전)를 반복.
            // 단, 시즌 최초 클리어로 엔딩이 걸린 경우만 예외로 우선 처리(1회성 이벤트라 씹으면 안 됨).
            if (gameMode === 'normal' && victory && _pendingEnding) { _pendingEnding = false; SceneManager.go('ending'); }
            else if (gameMode === 'normal' && victory && _pendingEnding2) { _pendingEnding2 = false; SceneManager.go('ending', { season:2 }); }
            else if (gameMode === 'normal' && victory && _pendingEnding3) { _pendingEnding3 = false; SceneManager.go('ending', { season:3 }); }
            else if (gameMode === 'normal' && victory && _pendingEnding4) { _pendingEnding4 = false; SceneManager.go('ending', { season:4 }); }
            else if (gameMode === 'normal' && victory && _pendingEnding5) { _pendingEnding5 = false; SceneManager.go('ending', { season:5 }); }
            else if (gameMode === 'normal' && victory && _pendingEnding6) { _pendingEnding6 = false; SceneManager.go('ending', { season:6 }); }
            else if (gameMode === 'normal' && victory && _pendingEnding7) { _pendingEnding7 = false; SceneManager.go('ending', { season:7 }); }
            else if (gameMode === 'normal' && victory && _pendingEnding8) { _pendingEnding8 = false; SceneManager.go('ending', { season:8 }); }
            else if (gameMode !== 'normal') SceneManager.go('game', { mode: gameMode, difficulty, rewardMode: _rewardMode });
            else SceneManager.go('game', { stageId, difficulty });
          } else if (gameMode !== 'normal') {
            // 던전/무한/보스러시: 패배 시 같은 모드로 재시작, 승리 시 로비
            // [UPDATE 2026-07-15] 260715_MTOPC.md 3번: rewardMode 누락 버그 수정 — 재도전 시 _rewardMode가 null로
            // 리셋되면서 다이아/특수재화 대신 골드가 나오던 문제 (6개 재화던전 전부 해당)
            if (!victory) SceneManager.go('game', { mode: gameMode, difficulty, rewardMode: _rewardMode });
            else SceneManager.go('lobby');
          } else if (!victory) {
            SceneManager.go('game', { stageId, difficulty });
          } else {
            // [UPDATE 2026-07-18] 자동/반자동 모드에서도 엔딩 트리거를 씹지 않도록 _pendingEnding 계열을 최우선 체크
            // (기존엔 로비 버튼 클릭 시에만 체크하고 있어, 자동진행 중 시즌 클리어를 하면 엔딩 컷씬이 통째로 스킵되던 버그)
            if (_pendingEnding) { _pendingEnding = false; SceneManager.go('ending'); }
            else if (_pendingEnding2) { _pendingEnding2 = false; SceneManager.go('ending', { season:2 }); }
            else if (_pendingEnding3) { _pendingEnding3 = false; SceneManager.go('ending', { season:3 }); }
            else if (_pendingEnding4) { _pendingEnding4 = false; SceneManager.go('ending', { season:4 }); }
            else if (_pendingEnding5) { _pendingEnding5 = false; SceneManager.go('ending', { season:5 }); }
            else if (_pendingEnding6) { _pendingEnding6 = false; SceneManager.go('ending', { season:6 }); }
            else if (_pendingEnding7) { _pendingEnding7 = false; SceneManager.go('ending', { season:7 }); }
            else if (_pendingEnding8) { _pendingEnding8 = false; SceneManager.go('ending', { season:8 }); }
            else if (_isFirstTimeMilestone || _hasPendingLobbyPopup) SceneManager.go('lobby');
            else SceneManager.go('game', { stageId: stageId + 1, difficulty });
          }
        } else {
          const el2 = document.getElementById('result-countdown');
          if (el2) el2.textContent = _cdLabel(countdown);
        }
      }, 1000);
    }
  }

  function enter(el,params){init(el,params);}
  function exit(){
    cancelAnimationFrame(rafId);
    document.getElementById('result-overlay')?.remove();
    window.removeEventListener('resize',onResize);
    if(window._pauseKeyHandler){window.removeEventListener('keydown',window._pauseKeyHandler);window._pauseKeyHandler=null;}
    window._cdReduction=0;window._boss=null;
    if(canvas){
      canvas._retSet=false;
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    }
  }

  // [UPDATE 2026-07-11] 260711_MTOPC.md 2-5: 삼위일체 달성 슬롯 수만큼 발광 구체가 캐릭터 주변을 궤도(반경50px, 발광15px, 5초/바퀴)
  function _drawElementTrinityOrbit(ctx,camX,camY){
    const slots = window._elementTrinitySlots;
    if (!slots || !slots.length) return;
    const sx = player.x-camX, sy = player.y-camY-20;
    const n = Math.min(3, slots.length);
    const baseAngle = (elapsed / 5.0) * Math.PI * 2; // 5초/바퀴
    for (let i=0; i<n; i++) {
      const el = slots[i];
      const meta = (typeof ELEMENT_META!=='undefined') ? ELEMENT_META[el] : null;
      if (!meta) continue;
      const ang = baseAngle + (Math.PI*2/n)*i;
      const ox = sx + Math.cos(ang)*50, oy = sy + Math.sin(ang)*50;
      ctx.save();
      const g = ctx.createRadialGradient(ox,oy,0,ox,oy,15);
      g.addColorStop(0, meta.bg); g.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.85; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ox,oy,15,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1; ctx.fillStyle = meta.bg;
      ctx.beginPath(); ctx.arc(ox,oy,6,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  }

  // [UPDATE 2026-08-03] 파트2 "수호 부적" — HP%에 따라 4단계 열화 스프라이트 교체 + 상단 HP바.
  // [UPDATE 2026-08-05] 피격 시 짧게 흔들리는 연출(talisman._shakeT) + 파괴 시 서서히 페이드아웃(_talismanDeathT) 추가.
  function _drawTalisman(ctx,camX,camY){
    const sx=talisman.x-camX, sy=talisman.y-camY;
    const pct=talisman.maxHp>0?talisman.hp/talisman.maxHp:0;
    const stageIdx = pct>0.75?0 : pct>0.5?1 : pct>0.25?2 : 3;
    const sc=SPRITES?.talismanDefense?.[stageIdx];
    const img=sc?SpriteLoader.get(sc.src):null;
    let shakeOx=0, shakeOy=0;
    if(talisman._shakeT>0){
      const s = talisman._shakeT/0.3; // 1→0으로 감쇠
      shakeOx = (Math.random()-0.5)*6*s;
      shakeOy = (Math.random()-0.5)*6*s;
    }
    let alpha = 1;
    if(state==='talismanBreak'){
      const fadeStart=0.9;
      alpha = 1 - Math.max(0, Math.min(1, (_talismanDeathT-fadeStart)/(TALISMAN_BREAK_DURATION-fadeStart)));
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    if(img?.complete&&img.naturalWidth>0&&sc){
      ctx.drawImage(img, sx+sc.offsetX+shakeOx, sy+sc.offsetY+shakeOy, sc.drawW, sc.drawH);
    } else {
      ctx.fillStyle='#a03060';
      ctx.fillRect(sx-16+shakeOx,sy-80+shakeOy,32,80);
    }
    ctx.restore();
    // HP바 (파괴 연출 중엔 hp가 이미 0이라 자연히 생략)
    if(talisman.hp>0){
      const barW=36, barY=sy-(sc?.drawH||50)-10;
      ctx.save();
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(sx-barW/2-1,barY-1,barW+2,7);
      ctx.fillStyle = pct>0.5?'#60d080':pct>0.25?'#e0c040':'#e04040';
      ctx.fillRect(sx-barW/2,barY,barW*pct,5);
      ctx.restore();
    }
  }

  // [UPDATE 2026-08-05] 부적이 카메라 시야 밖으로 나가면 우하단에 감시 카메라(CCTV) 미니뷰를 띄움 —
  // 화면 좌표 기준(줌 영역 밖에서 호출)이라 카메라가 아무리 멀어져도 패널 크기는 고정.
  function _drawTalismanCCTV(ctx,W,H,camX,camY,vw,vh){
    if(!talisman || talisman.hp<=0 || state==='talismanBreak') return;
    const sx=talisman.x-camX, sy=talisman.y-camY; // 부적의 월드→줌영역 좌표(0~vw/0~vh가 화면 안)
    const margin=40;
    if(sx>-margin && sx<vw+margin && sy>-margin && sy<vh+margin) return; // 이미 화면 안이면 안 그림

    // [UPDATE 2026-08-05] 우하단 고정 좌표는 줌(+/-) 버튼(zoomBtnWrap: bottom:90px,right:10px, 세로 78px)과
    // 겹쳐서, 그 자리는 선술 트리 HUD용으로 비워두고 CCTV는 줌 버튼 바로 위로 옮김.
    const pw=118, ph=92;
    const px = W-pw-10;               // 줌 버튼(right:10px)과 우측 정렬
    const py = H-ph-90-78-10;         // 줌 버튼 위(bottom:90px+버튼높이78px) + 여유간격 10px
    ctx.save();
    ctx.fillStyle='rgba(6,8,14,0.82)';
    ctx.strokeStyle='rgba(150,220,255,0.55)'; ctx.lineWidth=2;
    ctx.beginPath();
    if(ctx.roundRect) ctx.roundRect(px,py,pw,ph,6); else ctx.rect(px,py,pw,ph);
    ctx.fill(); ctx.stroke();

    const viewH=ph-22;
    ctx.save();
    ctx.beginPath(); ctx.rect(px+4,py+4,pw-8,viewH-4); ctx.clip();
    const mcx=px+pw/2, mcy=py+4+(viewH-4)/2;
    const pct=talisman.maxHp>0?talisman.hp/talisman.maxHp:0;
    const stageIdx = pct>0.75?0 : pct>0.5?1 : pct>0.25?2 : 3;
    const sc=SPRITES?.talismanDefense?.[stageIdx];
    const img=sc?SpriteLoader.get(sc.src):null;
    const miniScale=0.34;
    if(img?.complete&&img.naturalWidth>0&&sc){
      ctx.drawImage(img, mcx+sc.offsetX*miniScale, mcy+sc.offsetY*miniScale, sc.drawW*miniScale, sc.drawH*miniScale);
    } else {
      ctx.fillStyle='#a03060'; ctx.fillRect(mcx-6,mcy-16,12,16);
    }
    // 근처 침공형 몹을 작은 붉은 점으로 표시
    ctx.fillStyle='#ff5050';
    for(const e of enemies){
      if(!e._invasionType || e.dead) continue;
      const ex=(e.x-talisman.x)*miniScale+mcx, ey=(e.y-talisman.y)*miniScale+mcy;
      if(ex>px+4 && ex<px+pw-4 && ey>py+4 && ey<py+viewH){
        ctx.beginPath(); ctx.arc(ex,ey,2.4,0,Math.PI*2); ctx.fill();
      }
    }
    // 스캔라인
    ctx.globalAlpha=0.10; ctx.strokeStyle='#fff';
    for(let ly=py+4; ly<py+viewH; ly+=4){ ctx.beginPath(); ctx.moveTo(px+4,ly); ctx.lineTo(px+pw-4,ly); ctx.stroke(); }
    ctx.globalAlpha=1;
    ctx.restore();

    ctx.fillStyle='#80e8ff'; ctx.font='9px sans-serif'; ctx.textAlign='left';
    ctx.fillText('📹 수호 부적', px+6, py+viewH+11);
    const barW=pw-12, barY=py+ph-9;
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(px+6,barY,barW,5);
    ctx.fillStyle = pct>0.5?'#60d080':pct>0.25?'#e0c040':'#e04040';
    ctx.fillRect(px+6,barY,barW*pct,5);
    ctx.restore();
  }

  function _drawHitEffects(ctx,camX,camY){
    for(const h of (window._hitEffects||[])){
      const prog=h.t/h.life;
      const sx=h.x-camX+h.ox*prog, sy=h.y-camY+h.oy*prog;
      // [UPDATE 2026-08-05] 침공형 몹 대시 연출 전용 키(스프라이트 없이 프로시저럴로 그림 — SPRITES.effects에
      // 등록 안 된 키라 일반 폴백(흰 원)을 안 타고 여기서 먼저 분기).
      if(h.key==='_invasionSparkle'){
        ctx.save();
        ctx.globalAlpha=Math.max(0,1-prog);
        ctx.fillStyle='#e8f8ff';
        ctx.shadowColor='#80e0ff'; ctx.shadowBlur=8;
        const r=3*(1-prog*0.6);
        for(let i=0;i<4;i++){
          const ang=(Math.PI/2)*i + prog*2;
          ctx.beginPath();
          ctx.arc(sx+Math.cos(ang)*5, sy+Math.sin(ang)*5, r, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
        continue;
      }
      if(h.key==='_invasionDashTrail'){
        ctx.save();
        ctx.globalAlpha=Math.max(0,0.55-prog*0.55);
        ctx.strokeStyle='#a0e8ff'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(sx,sy,10+prog*14,0,Math.PI*2); ctx.stroke();
        ctx.restore();
        continue;
      }
      // [UPDATE 2026-08-06] 보스 "건방진!" 인레이지 — 검은 번개(부적 강타) + 넉백 충격파, 둘 다 이미지 없이 프로시저럴로.
      if(h.key==='_blackLightning'){
        // [UPDATE 2026-08-06] 손그림 절차적 선 대신, 실제 번개 이미지(천둥북/벼락낙하가 쓰는 lightning_bolt)를
        // 검보라색으로 필터 틴트해서 재사용. 한 발이 아니라 여러 발이 살짝 다른 위치/각도로 겹쳐 그려지도록
        // 호출 측(_strike())에서 여러 개를 한꺼번에 push해서 "와자자장창" 느낌의 낙뢰 다발을 표현.
        const _lsc = SPRITES?.effects?.lightning_bolt;
        const _limg = _lsc ? SpriteLoader.get(_lsc.src) : null;
        const _alpha = Math.max(0, Math.min(1, 1-prog)); // t가 음수로 시작하는 경우 대비 클램프
        ctx.save();
        ctx.globalAlpha=_alpha;
        ctx.translate(sx,sy);
        if (h.ang) ctx.rotate(h.ang);
        if(_limg?.complete && _limg.naturalWidth>0 && _lsc){
          ctx.filter='brightness(0.15) saturate(4) hue-rotate(240deg)';
          ctx.shadowColor='#8050ff'; ctx.shadowBlur=18;
          ctx.drawImage(_limg, -_lsc.drawW/2, -_lsc.drawH, _lsc.drawW, _lsc.drawH);
          ctx.filter='none';
        } else {
          // 이미지 로드 실패 시에만 폴백으로 절차적 선
          ctx.strokeStyle='#1a1a1a'; ctx.shadowColor='#8050ff'; ctx.shadowBlur=14; ctx.lineWidth=4;
          ctx.beginPath();
          let lx=0, ly=-70;
          ctx.moveTo(lx,ly);
          for(let i=0;i<5;i++){ lx+=(Math.random()-0.5)*22; ly+=14; ctx.lineTo(lx,ly); }
          ctx.stroke();
        }
        ctx.restore();
        ctx.save();
        ctx.globalAlpha=_alpha*0.5;
        ctx.fillStyle='rgba(120,80,220,0.35)';
        ctx.beginPath(); ctx.arc(sx,sy,28*(1-prog*0.4),0,Math.PI*2); ctx.fill();
        ctx.restore();
        continue;
      }
      if(h.key==='_bossShockwave'){
        ctx.save();
        ctx.globalAlpha=Math.max(0,0.6-prog*0.6);
        ctx.strokeStyle='#ff6040'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(sx,sy,20+prog*180,0,Math.PI*2); ctx.stroke();
        ctx.restore();
        continue;
      }
      const sc=SPRITES?.effects?.[h.key];
      const img=sc?SpriteLoader.get(sc.src):null;
      ctx.save();
      ctx.globalAlpha=Math.max(0,1-prog*1.5);
      const scale=0.7+prog*0.5;
      if(img?.complete&&img.naturalWidth>0&&sc){
        ctx.drawImage(img,sx-sc.drawW*scale/2,sy-sc.drawH*scale/2,sc.drawW*scale,sc.drawH*scale);
      } else {
        ctx.fillStyle='#fff';
        ctx.beginPath();ctx.arc(sx,sy,6*(1-prog),0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
  }

  function _drawEnemyProjs(ctx,camX,camY){
    for(const ep of enemyProjs){
      const sx=ep.x-camX,sy=ep.y-camY;
      ctx.save();ctx.globalAlpha=0.85;
      const g=ctx.createRadialGradient(sx,sy,0,sx,sy,ep.radius*2);
      g.addColorStop(0,ep.color||'#ff2020');g.addColorStop(1,'transparent');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,ep.radius*2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=ep.color||'#ff2020';ctx.beginPath();ctx.arc(sx,sy,ep.radius,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
  }

  // ── 줌 제어 ──
  function zoomIn()  { zoom = Math.min(2.0, +(zoom + 0.25).toFixed(2)); }
  function zoomOut() { zoom = Math.max(0.5, +(zoom - 0.25).toFixed(2)); }

  // 마우스 휠 줌 (PC)
  function onWheel(e) {
    e.preventDefault();
    if (state !== 'playing') return;
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }

  // 핀치줌 (모바일)
  let _pinchDist = 0;
  function onTouchStart(e) {
    if (e.touches.length === 2) {
      _pinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }
  function onTouchMove(e) {
    if (e.touches.length === 2 && _pinchDist > 0) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = newDist - _pinchDist;
      if (Math.abs(delta) > 8) {
        if (delta > 0) zoomIn();
        else zoomOut();
        _pinchDist = newDist;
      }
    }
  }

  return{enter,exit,pickLevelUp,confirmPick,togglePause,resumeGame,toggleMute,goLobby,zoomIn,zoomOut,cycleSpeed,cycleAutoMode,summonClone};
})();
