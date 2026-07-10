// lobby.js - 2D 로비 (고정화면 + 가상 조이스틱)
const LobbyScene = (() => {

  // ── 상수 ──
  const PLAYER_SPEED = 5.0;   // px/frame
  const JOYSTICK_R   = 50;    // 조이스틱 외부 반지름(px) - 인게임 MAX_DIST와 동일
  const JOYSTICK_KR  = 22;    // 조이스틱 노브 반지름(px) - 인게임과 동일
  const PROX_R       = 65;    // 건물 근접 감지 반지름(px)
  const keys = {};

  // ── 상태 ──
  let saveData, lobbyLevel, unlocked;
  let screenW = 390, sceneH = 680;

  // 플레이어
  let playerX = 195, playerY = 400;
  let playerDir = 1;
  let playerMoving = false;

  // 조이스틱
  let joyActive = false, joyTouchId = null;
  let joyDX = 0, joyDY = 0;

  // RAF
  let rafId = null;

  // ── 렌더 ──
  function render(el) {
    el.innerHTML = `
      <div class="lobby-root bg-ruins" id="lobby-root" style="overflow:hidden;position:relative;">

        <!-- 상단 바 -->
        <div class="top-bar" style="position:relative;z-index:20;">
          <div class="currency-group">
            <div class="currency">
              <img class="cur-icon-img" src="${SPRITES.items.gold.src}">
              <span class="cur-val" id="goldVal">${saveData.gold.toLocaleString()}</span>
            </div>
            <div class="currency">
              <span class="cur-icon">💎</span>
              <span class="cur-val" id="gemVal">${saveData.gems.toLocaleString()}</span>
            </div>
            ${[
              { key:'ganghwaseok',    spriteKey:'ganghwaseok',    unlockId:'dungeon_ganghwaseok' },
              { key:'cheonunseok',    spriteKey:'cheonunseok',    unlockId:'daejanggan' },
              { key:'cheonryeonggwa', spriteKey:'cheonryeonggwa', unlockId:'dungeon_cheonryeonggwa' },
              { key:'taegeukseok',    spriteKey:'taegeukseok',    unlockId:'dungeon_taegeukseok' },
              { key:'chaewonseok',    spriteKey:'chaewonseok',    unlockId:'currency_chaewonseok' },
            ].filter(c => unlocked.has(c.unlockId)).map(c => {
              const imgSrc = (SPRITES.items[c.spriteKey] || {}).src || '';
              return `
              <div class="currency">
                <img class="cur-icon-img" src="${imgSrc}">
                <span class="cur-val">${(saveData[c.key]||0).toLocaleString()}</span>
              </div>`;
            }).join('')}
          </div>
          <div class="top-menu">
            <button class="icon-btn" title="동료 상점" onclick="SceneManager.go('shop')"><img src="${SPRITES.lobbyIcons.shop.src}" style="width:36px;height:36px;"></button>
            <button class="icon-btn" title="업적" onclick="SceneManager.go('achievement')"><img src="${SPRITES.lobbyIcons.achievement.src}" style="width:36px;height:36px;"></button>
            <button class="icon-btn" title="설정" onclick="LobbyScene.openSettings()"><img src="${SPRITES.lobbyIcons.settings.src}" style="width:36px;height:36px;"></button>
            ${CONFIG.DEV_MODE ? `<button class="icon-btn" title="개발자 도구" onclick="SceneManager.go('dev')" style="background:rgba(180,40,40,0.7);border-radius:6px;">🛠</button>` : ''}
          </div>
        </div>

        <!-- 씬 영역 -->
        <div id="scene-area" style="
          position:relative; flex:1; overflow:hidden; touch-action:none;
        ">
          <!-- 월드 (카메라 이동) -->
          <div id="world" style="position:absolute;top:0;left:0;will-change:transform;">

            <!-- 건물 핫스팟 레이어 (비가시 마커) -->
            <div id="buildings-layer" style="position:absolute;inset:0;pointer-events:none;z-index:2;"></div>

            <!-- 플레이어 -->
            <img id="player-sprite" style="
              position:absolute;
              image-rendering:pixelated;
              z-index:5;
              pointer-events:none;
              transform-origin: center bottom;
              display:none;
            ">

            <!-- 건물 근접 팝업 (건물 위에 작게 표시) -->
            <div id="building-prompt" style="
              display:none;position:absolute;
              background:rgba(10,8,20,0.88);border:1px solid rgba(255,200,100,0.6);
              border-radius:8px;padding:5px 12px;
              color:#f5dfa0;font-size:12px;font-family:serif;
              z-index:16;white-space:nowrap;cursor:pointer;
              box-shadow:0 2px 10px rgba(0,0,0,0.7);
            "></div>

          </div><!-- /world -->

          <!-- 가상 조이스틱 - #world 밖, scene-area 직속 (카메라 영향 없음) -->
          <div id="joystick-wrap" style="
            position:absolute;bottom:14px;left:14px;
            width:100px;height:100px;z-index:20;touch-action:none;
            opacity:0;transition:opacity 0.05s;pointer-events:none;
          ">
            <div style="
              position:absolute;inset:0;border-radius:50%;
              background:rgba(255,255,255,0.06);
              border:2px solid rgba(255,255,255,0.15);
            "></div>
            <div id="joystick-knob" style="
              position:absolute;width:44px;height:44px;border-radius:50%;
              background:rgba(212,160,23,0.35);
              border:2px solid rgba(212,160,23,0.6);
              left:28px;top:28px;pointer-events:none;
            "></div>
          </div>

        </div><!-- /scene-area -->

        <!-- 하단 네비: 해금 상태에 따라 동적 생성 -->
        <div class="bottom-nav" id="bottom-nav" style="position:absolute;bottom:0;left:0;right:0;z-index:25;">
        </div>


      </div>
    `;
  }

  // ── 월드 초기화 ──
  function buildWorld() {
    const sceneArea = document.getElementById('scene-area');
    if (!sceneArea) return;
    screenW = sceneArea.offsetWidth  || 390;
    sceneH  = sceneArea.offsetHeight || 680;

    buildBuildings();
    _buildSamshinNpc(sceneArea);
    _buildMerchantNpc(sceneArea);

    // 플레이어 초기 위치: 화면 중앙 하단
    playerX = Math.round(screenW * 0.50);
    playerY = Math.round(sceneH  * 0.62);

    positionPlayer();
  }

  // ── 건물 핫스팟 마커 (비가시 — 배경 이미지가 건물 표현) ──
  function buildBuildings() {
    const layer = document.getElementById('buildings-layer');
    if (!layer) return;
    layer.innerHTML = '';

    Unlock.LOBBY_BUILDINGS.forEach(b => {
      const isUnlocked = unlocked.has(b.unlockId);
      const bx = Math.round(b.px * screenW);
      const by = Math.round(b.py * sceneH);

      const marker = document.createElement('div');
      marker.dataset.buildingId = b.id;
      marker.dataset.bx = String(bx);
      marker.dataset.by = String(by);
      marker.style.cssText = `
        position:absolute;left:${bx-4}px;top:${by-4}px;
        width:8px;height:8px;opacity:0;pointer-events:none;
      `;
      layer.appendChild(marker);

      // 해금된 건물: 이름 라벨 항상 표시 + 클릭 영역
      if (isUnlocked) {
        // 건물 이름 라벨 (항상 표시)
        const lbl = document.createElement('div');
        lbl.textContent = b.label;
        lbl.style.cssText = `
          position:absolute;left:${bx}px;top:${by - 44}px;
          transform:translateX(-50%);
          background:rgba(10,6,20,0.78);
          border:1px solid rgba(255,200,100,0.5);
          border-radius:6px;padding:2px 8px;
          font-size:11px;color:#f0d080;
          pointer-events:none;z-index:7;
          white-space:nowrap;
          text-shadow:0 0 6px rgba(255,180,50,0.6);
        `;
        layer.appendChild(lbl);

        // 클릭 진입 영역
        const tap = document.createElement('div');
        tap.style.cssText = `
          position:absolute;left:${bx-32}px;top:${by-32}px;
          width:64px;height:64px;border-radius:50%;
          pointer-events:auto;cursor:pointer;z-index:6;
          background:transparent;
        `;
        tap.classList.add('lobby-interactive');
        tap.addEventListener('click', () => SceneManager.go(b.scene));
        layer.appendChild(tap);
      }
    });
  }

  // ── 차원 상인 NPC (시즌 1 클리어 후 등장, 용왕 연못 3시 방향) ──
  function _buildMerchantNpc(sceneArea) {
    const sd = (typeof Save !== 'undefined') ? Save.load() : null;
    if (!sd?.season1Clear) return;
    const isKo = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'ko' : true;
    const sc = SPRITES?.lobbyNpcs?.merchant;
    const imgSrc = sc ? SpriteLoader.get(sc.src).src : '';

    // 용왕 연못(px:0.50, py:0.58) 3시 방향
    const npcX = Math.round((sceneArea.offsetWidth || 390) * 0.72);
    const npcY = Math.round((sceneArea.offsetHeight || 680) * 0.63);

    const btn = document.createElement('button');
    btn.id = 'merchant-npc';
    btn.classList.add('lobby-interactive');
    btn.style.cssText = `
      position:absolute;left:${npcX}px;top:${npcY}px;transform:translateX(-50%);
      background:none;border:none;cursor:pointer;
      display:flex;flex-direction:column;align-items:center;gap:2px;
      z-index:8;padding:0;
    `;
    btn.innerHTML = `
      ${imgSrc ? `<img src="${imgSrc}" style="height:72px;width:auto;image-rendering:pixelated;">` : '🧙'}
      <div style="
        font-size:10px;color:#a0d0ff;
        background:rgba(10,6,20,0.78);border:1px solid rgba(100,180,255,0.5);
        border-radius:6px;padding:2px 8px;white-space:nowrap;
        text-shadow:0 0 6px rgba(100,180,255,0.6);
      ">${isKo ? '차원 상인' : 'Dim. Merchant'}</div>
    `;
    btn.addEventListener('click', () => _openMerchantDialog(isKo));
    sceneArea.appendChild(btn);
  }

  function _openMerchantDialog(isKo) {
    if (document.getElementById('merchant-dialog')) return;
    const sd = (typeof Save !== 'undefined') ? Save.load() : null;
    const overlay = document.createElement('div');
    overlay.id = 'merchant-dialog';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.75);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;font-family:'Noto Serif KR',serif;
    `;

    function _render() {
      const sd2 = (typeof Save !== 'undefined') ? Save.load() : {};
      const gold          = sd2.gold          || 0;
      const chaewonseok   = sd2.chaewonseok   || 0;
      const soulFragments = sd2.soulFragments || 0;
      const soulStones    = sd2.soulStones    || 0;
      const season1Clear  = !!sd2.season1Clear;
      const season2Clear  = !!sd2.season2Clear;
      // 영혼 조각 합성: 시즌2 진입 가능하면 해금 (차원석 보유 또는 시즌1 클리어)
      const canCraftSoul  = season1Clear;

      const sc = SPRITES?.lobbyNpcs?.merchant;
      const imgSrc = sc ? SpriteLoader.get(sc.src).src : '';

      // 골드 → 차원석: 1,000골드 = 차원석 1개
      const GOLD_PER_STONE = 1000;
      // 최대 한 번에 구매 가능한 수량 (골드 보유량 기준)
      const maxBuy = Math.floor(gold / GOLD_PER_STONE);

      // 상인 대사
      const greetKo = maxBuy > 0
        ? `골드 ${gold.toLocaleString()}개가 있군. 차원석으로 교환할 수 있네.`
        : gold >= 500
          ? `골드가 조금 모자라네. ${GOLD_PER_STONE.toLocaleString()}개가 있어야 차원석 하나를 주지.`
          : `골드가 없으면 거래가 안 된다네. 스테이지를 더 클리어해 보시게.`;
      const greetEn = maxBuy > 0
        ? `You have ${gold.toLocaleString()} Gold. I can exchange it for Dimensional Stones.`
        : gold >= 500
          ? `A bit short. You need ${GOLD_PER_STONE.toLocaleString()} Gold per Dimensional Stone.`
          : `No Gold, no deal. Clear more stages to earn some.`;

      overlay.innerHTML = `
        <div style="
          width:340px;max-height:80vh;overflow-y:auto;
          background:rgba(6,10,20,0.97);
          border:1.5px solid rgba(100,180,255,0.6);border-radius:18px;
          padding:20px;
          box-shadow:0 0 40px rgba(80,140,255,0.25);
        ">
          <!-- 상인 헤더 -->
          <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:16px;">
            ${imgSrc ? `<img src="${imgSrc}" style="height:64px;width:auto;image-rendering:pixelated;flex-shrink:0;">` : ''}
            <div style="flex:1;">
              <div style="font-size:12px;color:#a0d0ff;font-weight:700;margin-bottom:6px;">
                ${isKo ? '⬡ 차원 상인' : '⬡ Dimensional Merchant'}
              </div>
              <div style="font-size:12px;color:#c8dce8;line-height:1.7;letter-spacing:.03em;">
                ${isKo ? greetKo : greetEn}
              </div>
            </div>
          </div>

          <!-- 보유 재화 -->
          <div style="
            background:rgba(255,255,255,0.04);border:1px solid rgba(100,180,255,0.2);
            border-radius:10px;padding:10px 14px;margin-bottom:14px;
            display:grid;grid-template-columns:1fr 1px 1fr 1px 1fr 1px 1fr;gap:0;
          ">
            <div style="text-align:center;padding:0 4px;">
              <div style="font-size:9px;color:#a0b8c8;margin-bottom:3px;">${isKo ? '💰 골드' : '💰 Gold'}</div>
              <div style="font-size:13px;color:#f0d060;font-weight:700;">${gold.toLocaleString()}</div>
            </div>
            <div style="background:rgba(100,180,255,0.15);"></div>
            <div style="text-align:center;padding:0 4px;">
              <div style="font-size:9px;color:#a0b8c8;margin-bottom:3px;">${isKo ? '🔷 차원석' : '🔷 Dim.Stone'}</div>
              <div style="font-size:13px;color:#60c0ff;font-weight:700;">${chaewonseok.toLocaleString()}</div>
            </div>
            <div style="background:rgba(100,180,255,0.15);"></div>
            <div style="text-align:center;padding:0 4px;">
              <div style="font-size:9px;color:#a0b8c8;margin-bottom:3px;">${isKo ? '👻 영혼조각' : '👻 Fragments'}</div>
              <div style="font-size:13px;color:#90b8ff;font-weight:700;">${soulFragments.toLocaleString()}</div>
            </div>
            <div style="background:rgba(100,180,255,0.15);"></div>
            <div style="text-align:center;padding:0 4px;">
              <div style="font-size:9px;color:#a0b8c8;margin-bottom:3px;">${isKo ? '💜 영혼석' : '💜 Soul Stone'}</div>
              <div style="font-size:13px;color:#c080ff;font-weight:700;">${soulStones.toLocaleString()}</div>
            </div>
          </div>

          <!-- 교환 목록 -->
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">

            <!-- 골드 → 차원석 ×1 -->
            <div style="
              background:rgba(100,180,255,0.06);border:1px solid rgba(100,180,255,0.25);
              border-radius:10px;padding:10px 12px;
              display:flex;align-items:center;gap:10px;
            ">
              <div style="flex:1;">
                <div style="font-size:12px;color:#e0eeff;font-weight:600;">
                  ${isKo ? '💰 골드 1,000 → 🔷 차원석 ×1' : '💰 1,000 Gold → 🔷 Dim. Stone ×1'}
                </div>
                <div style="font-size:10px;color:#80a0b8;margin-top:2px;">
                  ${isKo ? `최대 ${maxBuy}개 구매 가능` : `Up to ${maxBuy} available`}
                </div>
              </div>
              <button id="merch-btn-1" ${maxBuy < 1 ? 'disabled' : ''} style="
                padding:7px 14px;border-radius:8px;cursor:${maxBuy >= 1 ? 'pointer' : 'not-allowed'};
                border:1px solid rgba(100,180,255,${maxBuy >= 1 ? '0.6' : '0.2'});
                background:rgba(80,140,255,${maxBuy >= 1 ? '0.18' : '0.04'});
                color:${maxBuy >= 1 ? '#a0d0ff' : '#506070'};
                font-size:12px;font-family:inherit;white-space:nowrap;
              ">${isKo ? '교환' : 'Exchange'}</button>
            </div>

            <!-- 골드 → 차원석 ×10 -->
            <div style="
              background:rgba(100,180,255,0.06);border:1px solid rgba(100,180,255,0.25);
              border-radius:10px;padding:10px 12px;
              display:flex;align-items:center;gap:10px;
            ">
              <div style="flex:1;">
                <div style="font-size:12px;color:#e0eeff;font-weight:600;">
                  ${isKo ? '💰 골드 10,000 → 🔷 차원석 ×10' : '💰 10,000 Gold → 🔷 Dim. Stone ×10'}
                </div>
                <div style="font-size:10px;color:#80a0b8;margin-top:2px;">
                  ${isKo ? '(골드 1,000당 차원석 1개)' : '(1 Stone per 1,000 Gold)'}
                </div>
              </div>
              <button id="merch-btn-10" ${maxBuy < 10 ? 'disabled' : ''} style="
                padding:7px 14px;border-radius:8px;cursor:${maxBuy >= 10 ? 'pointer' : 'not-allowed'};
                border:1px solid rgba(100,180,255,${maxBuy >= 10 ? '0.6' : '0.2'});
                background:rgba(80,140,255,${maxBuy >= 10 ? '0.18' : '0.04'});
                color:${maxBuy >= 10 ? '#a0d0ff' : '#506070'};
                font-size:12px;font-family:inherit;white-space:nowrap;
              ">${isKo ? '교환' : 'Exchange'}</button>
            </div>

            <!-- 차원석 → 영혼석 (시즌2 클리어 후 해금) -->
            <div style="
              background:${season2Clear ? 'rgba(160,80,255,0.06)' : 'rgba(60,60,80,0.06)'};
              border:1px solid ${season2Clear ? 'rgba(160,80,255,0.35)' : 'rgba(80,80,100,0.25)'};
              border-radius:10px;padding:10px 12px;
              display:flex;align-items:center;gap:10px;
            ">
              <div style="flex:1;">
                <div style="font-size:12px;color:${season2Clear ? '#d8b0ff' : '#606080'};font-weight:600;">
                  ${isKo ? '🔷 차원석 ×5 → 💜 영혼석 ×1' : '🔷 Dim. Stone ×5 → 💜 Soul Stone ×1'}
                </div>
                <div style="font-size:10px;color:${season2Clear ? '#9060c0' : '#404060'};margin-top:2px;">
                  ${season2Clear
                    ? (isKo ? `보유: ${chaewonseok}개 → 최대 ${Math.floor(chaewonseok/5)}개 제조 가능` : `Have ${chaewonseok} → up to ${Math.floor(chaewonseok/5)} craftable`)
                    : (isKo ? '🔒 시즌2 클리어 후 해금' : '🔒 Unlock after clearing Season 2')}
                </div>
              </div>
              <button id="merch-btn-soul" ${(!season2Clear || chaewonseok < 5) ? 'disabled' : ''} style="
                padding:7px 14px;border-radius:8px;cursor:${(season2Clear && chaewonseok >= 5) ? 'pointer' : 'not-allowed'};
                border:1px solid rgba(160,80,255,${(season2Clear && chaewonseok >= 5) ? '0.6' : '0.15'});
                background:rgba(140,60,255,${(season2Clear && chaewonseok >= 5) ? '0.18' : '0.04'});
                color:${(season2Clear && chaewonseok >= 5) ? '#d0a0ff' : '#505060'};
                font-size:12px;font-family:inherit;white-space:nowrap;
              ">${isKo ? '제조' : 'Craft'}</button>
            </div>

            <!-- 영혼 조각 → 영혼석 (시즌1 클리어 후 해금) -->
            <div style="
              background:${canCraftSoul ? 'rgba(80,100,255,0.06)' : 'rgba(60,60,80,0.06)'};
              border:1px solid ${canCraftSoul ? 'rgba(100,140,255,0.35)' : 'rgba(80,80,100,0.25)'};
              border-radius:10px;padding:10px 12px;
              display:flex;align-items:center;gap:10px;
            ">
              <div style="flex:1;">
                <div style="font-size:12px;color:${canCraftSoul ? '#a0c0ff' : '#606080'};font-weight:600;">
                  ${isKo ? '👻 영혼 조각 ×5 → 💜 영혼석 ×1' : '👻 Soul Fragment ×5 → 💜 Soul Stone ×1'}
                </div>
                <div style="font-size:10px;color:${canCraftSoul ? '#6080b0' : '#404060'};margin-top:2px;">
                  ${canCraftSoul
                    ? (isKo ? `보유: ${soulFragments}개 → 최대 ${Math.floor(soulFragments/5)}개 제조 가능` : `Have ${soulFragments} → up to ${Math.floor(soulFragments/5)} craftable`)
                    : (isKo ? '🔒 시즌1 클리어 후 해금' : '🔒 Unlock after clearing Season 1')}
                </div>
              </div>
              <button id="merch-btn-craft-soul" ${(!canCraftSoul || soulFragments < 5) ? 'disabled' : ''} style="
                padding:7px 14px;border-radius:8px;cursor:${(canCraftSoul && soulFragments >= 5) ? 'pointer' : 'not-allowed'};
                border:1px solid rgba(100,140,255,${(canCraftSoul && soulFragments >= 5) ? '0.6' : '0.15'});
                background:rgba(80,120,255,${(canCraftSoul && soulFragments >= 5) ? '0.18' : '0.04'});
                color:${(canCraftSoul && soulFragments >= 5) ? '#a0c0ff' : '#505060'};
                font-size:12px;font-family:inherit;white-space:nowrap;
              ">${isKo ? '제조' : 'Craft'}</button>
            </div>
          </div>

          <!-- 닫기 버튼 -->
          <button id="merch-close" style="
            width:100%;padding:9px;border-radius:10px;
            border:1px solid rgba(100,180,255,0.35);
            background:rgba(80,140,255,0.08);color:#80b0d8;
            font-size:13px;cursor:pointer;font-family:inherit;
          ">${isKo ? '떠나겠소' : 'Farewell'}</button>
        </div>
      `;

      // 버튼 이벤트
      document.getElementById('merch-close').addEventListener('click', () => overlay.remove());

      function doExchange(stoneAmt) {
        const cost = stoneAmt * GOLD_PER_STONE;
        const cur = (typeof Save !== 'undefined') ? Save.load() : {};
        if ((cur.gold || 0) < cost) return;
        cur.gold        = (cur.gold || 0) - cost;
        cur.chaewonseok = (cur.chaewonseok || 0) + stoneAmt;
        if (typeof Save !== 'undefined') Save.save(cur);
        _render();
      }

      const btn1 = document.getElementById('merch-btn-1');
      if (btn1 && maxBuy >= 1) btn1.addEventListener('click', () => doExchange(1));

      const btn10 = document.getElementById('merch-btn-10');
      if (btn10 && maxBuy >= 10) btn10.addEventListener('click', () => doExchange(10));

      const btnCraftSoul = document.getElementById('merch-btn-craft-soul');
      if (btnCraftSoul && canCraftSoul && soulFragments >= 5) {
        btnCraftSoul.addEventListener('click', () => {
          const cur3 = (typeof Save !== 'undefined') ? Save.load() : {};
          if ((cur3.soulFragments || 0) < 5) return;
          cur3.soulFragments = (cur3.soulFragments || 0) - 5;
          cur3.soulStones    = (cur3.soulStones    || 0) + 1;
          if (typeof Save !== 'undefined') Save.save(cur3);
          _render();
        });
      }

      const btnSoul = document.getElementById('merch-btn-soul');
      if (btnSoul && season2Clear) {
        const sd3 = (typeof Save !== 'undefined') ? Save.load() : {};
        const cws = sd3.chaewonseok || 0;
        if (cws >= 5) {
          btnSoul.addEventListener('click', () => {
            const cur2 = (typeof Save !== 'undefined') ? Save.load() : {};
            if ((cur2.chaewonseok || 0) < 5) return;
            cur2.chaewonseok = (cur2.chaewonseok || 0) - 5;
            cur2.soulStones = (cur2.soulStones || 0) + 1;
            if (typeof Save !== 'undefined') Save.save(cur2);
            _render();
          });
        }
      }
    }

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    _render();
  }

  // ── 삼신 할머니 NPC (시즌 1 클리어 후 등장) ──
  function _buildSamshinNpc(sceneArea) {
    const sd = (typeof Save !== 'undefined') ? Save.load() : null;
    if (!sd?.season1Clear) return;
    const isKo = (typeof Lang !== 'undefined') ? Lang.getCurrent() === 'ko' : true;
    const sc = SPRITES?.lobbyNpcs?.samshin;
    const imgSrc = sc ? SpriteLoader.get(sc.src).src : '';

    const btn = document.createElement('button');
    btn.id = 'samshin-npc';
    btn.classList.add('lobby-interactive');
    btn.style.cssText = `
      position:absolute;bottom:110px;left:50%;transform:translateX(-50%);
      background:none;border:none;cursor:pointer;
      display:flex;flex-direction:column;align-items:center;gap:2px;
      z-index:8;padding:0;
    `;
    btn.innerHTML = `
      ${imgSrc ? `<img src="${imgSrc}" style="height:72px;width:auto;image-rendering:pixelated;">` : '👵'}
      <div style="
        font-size:10px;color:#f0d080;
        background:rgba(10,6,20,0.78);border:1px solid rgba(255,200,100,0.5);
        border-radius:6px;padding:2px 8px;white-space:nowrap;
        text-shadow:0 0 6px rgba(255,180,50,0.6);
      ">${isKo ? '삼신 할머니' : 'Samshin Granny'}</div>
    `;
    btn.addEventListener('click', () => _openSamshinDialog(isKo));
    sceneArea.appendChild(btn);
  }

  function _openSamshinDialog(isKo) {
    if (document.getElementById('samshin-dialog')) return;
    const overlay = document.createElement('div');
    overlay.id = 'samshin-dialog';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.7);
      display:flex;align-items:flex-end;justify-content:center;
      z-index:9999;font-family:'Noto Serif KR',serif;
      padding-bottom:100px;
    `;
    const sc = SPRITES?.lobbyNpcs?.samshin;
    const imgSrc = sc ? SpriteLoader.get(sc.src).src : '';
    overlay.innerHTML = `
      <div style="
        width:340px;background:rgba(10,6,20,0.96);
        border:1.5px solid rgba(255,200,100,0.6);border-radius:18px;
        padding:20px 20px 18px;display:flex;gap:14px;align-items:flex-start;
        box-shadow:0 0 30px rgba(255,180,50,0.2);
      ">
        ${imgSrc ? `<img src="${imgSrc}" style="height:70px;width:auto;image-rendering:pixelated;flex-shrink:0;">` : ''}
        <div style="flex:1;">
          <div style="font-size:12px;color:#f0d080;font-weight:700;margin-bottom:8px;">
            ${isKo ? '삼신 할머니' : 'Samshin Granny'}
          </div>
          <div style="font-size:13px;color:#e8dcc8;line-height:1.8;letter-spacing:.04em;">
            ${isKo
              ? '다른 차원으로 갈 때 차원석이 없다면 매우 위험 하단다.<br>차원 상인에게 먼저 준비를 갖추거라.'
              : 'Venturing to another dimension without Dimensional Stones is very dangerous.<br>Visit the Dimensional Merchant to prepare yourself.'}
          </div>
          <div style="display:flex;gap:8px;margin-top:14px;">
            <button id="samshin-map-btn" style="
              flex:1;padding:8px 12px;
              border-radius:8px;border:1px solid rgba(120,160,255,0.6);
              background:rgba(80,100,200,0.18);color:#a0c0ff;
              font-size:12px;cursor:pointer;font-family:inherit;
            ">${isKo ? '차원 지도 보기' : 'View Dimensional Map'}</button>
            <button onclick="document.getElementById('samshin-dialog').remove()" style="
              padding:8px 14px;
              border-radius:8px;border:1px solid rgba(255,200,100,0.5);
              background:rgba(255,180,50,0.12);color:#f0d080;
              font-size:12px;cursor:pointer;font-family:inherit;
            ">${isKo ? '닫기' : 'Close'}</button>
          </div>
        </div>
      </div>
    `;
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });
    overlay.querySelector('#samshin-map-btn').addEventListener('click', () => {
      overlay.remove();
      _openDimensionalMap(isKo);
    });
    document.body.appendChild(overlay);
  }

  function _openDimensionalMap(isKo) {
    if (document.getElementById('dimensional-map-overlay')) return;
    const mapImg = SPRITES?.worldMap ? SpriteLoader.get(SPRITES.worldMap.src) : null;
    const mapSrc = mapImg?.src || '';

    const IMG_W = 219;
    const IMG_H = 640;

    const ZONES = [
      { x:110, y: 32, r:24, ko:'원계',   en:'Won-gye',   scene:null,          unlock:null,         color:'#00ffee' },
      { x: 44, y: 83, r:29, ko:'어계',   en:'Eo-gye',    scene:null,          unlock:null,         color:'#cc44ff' },
      { x:175, y:109, r:29, ko:'황계',   en:'Hwang-gye', scene:null,          unlock:null,         color:'#ffcc00' },
      { x:110, y:198, r:34, ko:'선계',   en:'Seon-gye',  scene:null,          unlock:'season2',    color:'#ffffff' },
      { x: 82, y:314, r:37, ko:'현계',   en:'Hyeon-gye', scene:'stageSelect', unlock:null,         color:'#80ff80', season:1 },
      { x:148, y:403, r:34, ko:'유명계', en:'Shadow Realm', scene:'stageSelect', unlock:'season1Clear', color:'#8080ff', season:2 },
      { x: 44, y:467, r:37, ko:'망랑계', en:'Mangrang',  scene:null,          unlock:'season2',    color:'#ff8800' },
      { x:110, y:563, r:42, ko:'귀허계', en:'Gwihe-gye', scene:null,          unlock:'chapter8',   color:'#ff4444' },
    ];

    const save = Save.load();
    const clearedChapters = save.clearedChapters || [];
    const season1Clear = save.season1Clear || false;

    function isUnlocked(z) {
      if (!z.unlock) return true;
      if (z.unlock === 'season1Clear') return season1Clear;
      if (z.unlock === 'season2') return season1Clear;
      if (z.unlock === 'chapter6') return clearedChapters.includes(6) || clearedChapters.includes(5);
      if (z.unlock === 'chapter8') return clearedChapters.includes(8) || clearedChapters.includes(7);
      return false;
    }

    const el = document.createElement('div');
    el.id = 'dimensional-map-overlay';
    el.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.95);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;font-family:'Noto Serif KR',serif;
    `;

    const container = document.createElement('div');
    container.style.cssText = `position:relative;width:${IMG_W}px;height:${IMG_H}px;flex-shrink:0;`;

    if (mapSrc) {
      const img = document.createElement('img');
      img.src = mapSrc;
      img.style.cssText = `position:absolute;inset:0;width:100%;height:100%;object-fit:fill;`;
      container.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.style.cssText = `position:absolute;inset:0;background:rgba(20,15,40,0.9);border:1px solid #334;`;
      ph.innerHTML = `<div style="color:#445;font-size:13px;text-align:center;margin-top:400px;">(지도 준비 중)</div>`;
      container.appendChild(ph);
    }

    ZONES.forEach(z => {
      const unlocked = isUnlocked(z);
      const canEnter = unlocked && z.scene;

      // 클릭 영역 (원형, 투명 — 시각적으로 안 보이지만 클릭은 됨)
      const tap = document.createElement('div');
      tap.style.cssText = `
        position:absolute;
        left:${z.x - z.r}px;top:${z.y - z.r}px;
        width:${z.r*2}px;height:${z.r*2}px;
        border-radius:50%;
        border:none;background:transparent;
        cursor:${canEnter ? 'pointer' : 'default'};
      `;
      if (canEnter) {
        tap.addEventListener('click', (e) => {
          e.stopPropagation();
          el.remove();
          if (z.season) StageSelectScene && (StageSelectScene._initSeason = z.season);
          SceneManager.go(z.scene);
        });
      }
      container.appendChild(tap);

      // 간판 라벨 (로비 건물 간판 스타일, 각 계 색상 유지)
      const lbl = document.createElement('div');
      lbl.textContent = (unlocked ? '' : '🔒 ') + (isKo ? z.ko : z.en);
      lbl.style.cssText = `
        position:absolute;
        left:${z.x}px;top:${z.y - z.r - 20}px;
        transform:translateX(-50%);
        background:rgba(10,6,20,0.85);
        border:1px solid ${unlocked ? z.color : 'rgba(255,255,255,0.15)'};
        border-radius:6px;padding:3px 10px;
        font-size:11px;font-family:'Noto Serif KR',serif;font-weight:700;
        color:${unlocked ? z.color : 'rgba(255,255,255,0.25)'};
        pointer-events:none;white-space:nowrap;
        box-shadow:${unlocked ? `0 0 8px ${z.color}55, inset 0 0 6px rgba(0,0,0,0.6)` : 'none'};
        text-shadow:${unlocked ? `0 0 6px ${z.color}99` : 'none'};
        letter-spacing:.05em;
        z-index:2;
      `;
      container.appendChild(lbl);
    });

    const closeBtn = document.createElement('div');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      position:absolute;top:16px;right:16px;
      width:32px;height:32px;line-height:32px;text-align:center;
      background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.2);
      border-radius:50%;color:rgba(255,255,255,0.5);font-size:14px;
      cursor:pointer;pointer-events:auto;z-index:10;
    `;
    closeBtn.addEventListener('click', () => el.remove());

    el.appendChild(container);
    el.appendChild(closeBtn);
    document.body.appendChild(el);
  }

  // ── 플레이어 위치 DOM 반영 ──
  let walkPhase = 0;
  function positionPlayer() {
    const el = document.getElementById('player-sprite');
    if (!el) return;

    const pH = Math.round(sceneH * 0.09);  // 작게
    const pW = Math.round(pH * (135/158));
    const bounce = playerMoving ? Math.round(Math.abs(Math.sin(walkPhase)) * 3) : 0;

    el.style.width  = pW + 'px';
    el.style.height = pH + 'px';
    el.style.left   = Math.round(playerX - pW/2) + 'px';
    el.style.top    = Math.round(playerY - pH - bounce) + 'px';
    el.style.animation = 'none';
    el.style.transform = `scaleX(${playerDir})`;

    if (!el._sprLoaded) {
      const sc = Player.getSpriteConfig();
      const img = SpriteLoader.get(sc.src);
      if (img?.src) {
        el.src = img.src;
        if (img.complete) { el._sprLoaded = true; el.style.display = 'block'; }
        else img.onload = () => { el._sprLoaded = true; el.style.display = 'block'; };
      }
    }
  }

  // ── 건물 근접 체크 ──
  function checkBuildingProximity() {
    const prompt = document.getElementById('building-prompt');
    if (!prompt) return;

    let near = null, nearDist = Infinity;
    Unlock.LOBBY_BUILDINGS.forEach(b => {
      if (!unlocked.has(b.unlockId)) return;
      const bx = Math.round(b.px * screenW);
      const by = Math.round(b.py * sceneH);
      const dist = Math.sqrt((playerX-bx)**2 + (playerY-by)**2);
      if (dist < PROX_R && dist < nearDist) { near = b; nearDist = dist; }
    });

    if (near) {
      const bx = Math.round(near.px * screenW);
      const by = Math.round(near.py * sceneH);
      prompt.textContent = `▲ ${near.label}`;
      prompt.style.display = 'block';
      prompt.style.left = (bx - 36) + 'px';
      prompt.style.top  = (by - 42) + 'px';
      prompt.onclick = () => SceneManager.go(near.scene);
    } else {
      prompt.style.display = 'none';
    }
  }

  // ── 게임 루프 ──
  function gameLoop() {
    if (!document.getElementById('player-sprite')) { rafId = null; return; }

    // 입력: 키보드 우선, 없으면 조이스틱
    const kbDX = (keys['ArrowRight']||keys['KeyD']) ? 1 : (keys['ArrowLeft']||keys['KeyA']) ? -1 : 0;
    const kbDY = (keys['ArrowDown'] ||keys['KeyS']) ? 1 : (keys['ArrowUp']  ||keys['KeyW']) ? -1 : 0;
    const usingJoy = Math.abs(kbDX) === 0 && Math.abs(kbDY) === 0 && joyActive;
    const dx = Math.abs(kbDX) > 0 ? kbDX : joyDX;
    const dy = Math.abs(kbDY) > 0 ? kbDY : joyDY;

    const len = Math.sqrt(dx*dx + dy*dy);
    if (len > 0.08) {
      const ndx = dx / Math.max(len, 1);
      const ndy = dy / Math.max(len, 1);
      const spd = usingJoy ? PLAYER_SPEED * 0.5 : PLAYER_SPEED;
      playerX += ndx * spd;
      playerY += ndy * spd;
      if (Math.abs(ndx) > 0.1) playerDir = ndx > 0 ? 1 : -1;
      playerMoving = true;
      walkPhase += 0.18;
    } else {
      playerMoving = false;
      walkPhase = 0;
    }

    // 화면 경계 클램프
    const pH = Math.round(sceneH * 0.09);
    const pW = Math.round(pH * 135/158);
    playerX = Math.max(pW/2 + 4, Math.min(screenW - pW/2 - 4, playerX));
    playerY = Math.max(pH + 10,  Math.min(sceneH - 10, playerY));

    positionPlayer();
    checkBuildingProximity();

    rafId = requestAnimationFrame(gameLoop);
  }

  // ── 조이스틱 + 키보드 바인딩 ──
  function bindControls() {
    // 키보드
    const _kd = e => { keys[e.code] = true; };
    const _ku = e => { delete keys[e.code]; };
    window.addEventListener('keydown', _kd);
    window.addEventListener('keyup',   _ku);
    window._lobbyKD = _kd; window._lobbyKU = _ku;

    // 가상 조이스틱
    const joyWrap = document.getElementById('joystick-wrap');
    const joyKnob = document.getElementById('joystick-knob');
    if (!joyWrap || !joyKnob) return;

    function moveKnob(tx, ty) {
      // touchmove 시점엔 wrap이 이미 제자리에 있으므로 getBoundingClientRect 정확함
      const r = joyWrap.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top  + r.height / 2;
      // wrap은 100 game px → r.width screen px → 1 game px = r.width/100 screen px
      const screenPerGame = r.width / 100;
      const R_px = JOYSTICK_R * screenPerGame;
      let dx_px = tx - cx;
      let dy_px = ty - cy;
      const dist = Math.hypot(dx_px, dy_px);
      if (dist > R_px) { dx_px = dx_px/dist*R_px; dy_px = dy_px/dist*R_px; }
      joyDX = dx_px / R_px;
      joyDY = dy_px / R_px;
      const dx_g = dx_px / screenPerGame;
      const dy_g = dy_px / screenPerGame;
      joyKnob.style.left = (JOYSTICK_R - JOYSTICK_KR + dx_g) + 'px';
      joyKnob.style.top  = (JOYSTICK_R - JOYSTICK_KR + dy_g) + 'px';
    }

    function resetKnob() {
      joyDX = 0; joyDY = 0;
      joyKnob.style.left = (JOYSTICK_R - JOYSTICK_KR) + 'px';
      joyKnob.style.top  = (JOYSTICK_R - JOYSTICK_KR) + 'px';
      joyWrap.style.opacity = '0';
    }
    function showJoy() { joyWrap.style.opacity = '1'; }

    // 조이스틱을 터치 위치 중앙으로 이동 (scene-area 기준)
    function moveJoyWrapTo(clientX, clientY) {
      const sa = document.getElementById('scene-area');
      if (!sa) return; // [UPDATE 2026-07-06] 로비 DOM 없으면 안전하게 무시
      const rect = sa.getBoundingClientRect();
      const scale = rect.width / 390;
      const sx = (clientX - rect.left) / scale;
      const sy = (clientY - rect.top)  / scale;
      const lx = Math.max(0, Math.min(390 - 100, sx - 50));
      const ly = Math.max(0, Math.min(rect.height / scale - 100, sy - 50));
      joyWrap.style.left   = lx + 'px';
      joyWrap.style.top    = ly + 'px';
      joyWrap.style.bottom = 'auto';
    }

    // 터치 - 화면 하단 60% 어디서나 부유형 조이스틱
    // 단, 버튼/링크/인터랙티브 요소 위에서는 조이스틱 비활성화
    document.addEventListener('touchstart', e => {
      // [UPDATE 2026-07-06] 로비 화면(#scene-area 존재)이 아니면 조이스틱 로직 무시
      if (!document.getElementById('scene-area')) return;
      const t = e.changedTouches[0];
      const tag = e.target?.tagName?.toUpperCase?.() || '';
      if (['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(tag)) return;
      if (e.target?.closest?.('button,a,[role="button"],[onclick],.lobby-interactive')) return;
      if (e.target?.closest?.('.companion-list')) return; // 동료/펫 목록 스크롤 허용
      e.preventDefault();
      joyActive = true;
      joyTouchId = t.identifier;
      moveJoyWrapTo(t.clientX, t.clientY);
      showJoy();
      joyDX = 0; joyDY = 0;
      joyKnob.style.left = (JOYSTICK_R - JOYSTICK_KR) + 'px';
      joyKnob.style.top  = (JOYSTICK_R - JOYSTICK_KR) + 'px';
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      if (!joyActive) return;
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) { moveKnob(t.clientX, t.clientY); break; }
      }
    }, { passive: true });

    const _te = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === joyTouchId) { resetKnob(); joyActive = false; break; }
      }
    };
    window.addEventListener('touchend',   _te);
    window.addEventListener('touchcancel',() => { resetKnob(); joyActive = false; });

    // 마우스 - 화면 하단 60% 어디서나 부유형 조이스틱 (PC 테스트용)
    const _md = e => {
      // [UPDATE 2026-07-06] 로비 화면이 아니면 무시 (터치 핸들러와 동일 가드)
      if (!document.getElementById('scene-area')) return;
      const tag = e.target?.tagName?.toUpperCase?.() || '';
      if (['BUTTON','A','INPUT','SELECT','TEXTAREA'].includes(tag)) return;
      if (e.target?.closest?.('button,a,[role="button"],[onclick],.lobby-interactive')) return;
      joyActive = true; joyTouchId = 'mouse';
      moveJoyWrapTo(e.clientX, e.clientY);
      showJoy();
      joyDX = 0; joyDY = 0;
      joyKnob.style.left = (JOYSTICK_R - JOYSTICK_KR) + 'px';
      joyKnob.style.top  = (JOYSTICK_R - JOYSTICK_KR) + 'px';
      e.preventDefault();
    };
    const _mm = e => { if (joyActive && joyTouchId==='mouse') moveKnob(e.clientX, e.clientY); };
    const _mu = () => { if (joyActive && joyTouchId==='mouse') { resetKnob(); joyActive = false; } };
    document.addEventListener('mousedown', _md);
    window.addEventListener('mousemove', _mm);
    window.addEventListener('mouseup',   _mu);
    window._lobbyMD = _md; window._lobbyMM = _mm; window._lobbyMU = _mu;
  }

  // ── 네비 버튼 빌드 ──
  function buildNav() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    // 항상 표시되는 버튼 정의
    const ALL_BTNS = [
      { id:'nav_stage',     imgKey:'stage',     get label(){ return Lang.t('nav','stage');     }, scene:'stageSelect', always:true,  main:true },
      { id:'nav_companion', imgKey:'companion',  get label(){ return Lang.t('nav','companion'); }, scene:'character',   always:false },
      { id:'nav_weapon',    imgKey:'dungeon',    get label(){ return Lang.t('nav','weapon');    }, scene:'dungeon',     always:false },
      { id:'nav_building',  imgKey:'building',   get label(){ return Lang.t('nav','building');  }, scene:'building',    always:false },
      { id:'nav_pet',       imgKey:'pet',        get label(){ return Lang.t('nav','pet');       }, scene:'pet',         always:false },
      { id:'nav_player',    imgKey:'character',  get label(){ return Lang.t('nav','player');    }, scene:'playerScene', always:true  },
    ];

    // [UPDATE 2026-07-09] 초반 온보딩: 전투 입장 이력 0회일 때 스테이지 버튼 펄스+말풍선으로 유도
    const _isFirstTime = (saveData.clearedStages||[]).length === 0 && (saveData.runs||0) === 0;

    nav.innerHTML = ALL_BTNS.map(btn => {
      const isUnlocked = btn.always || unlocked.has(btn.id);
      const imgSrc = SPRITES.lobbyIcons[btn.imgKey].src;
      const imgTag = `<img src="${imgSrc}" style="width:63px;height:63px;${!isUnlocked?'filter:grayscale(1) brightness(0.4)':''}">`;
      if (!isUnlocked) {
        return `<button class="nav-btn" style="opacity:0.5;pointer-events:none;">
          <span class="nav-icon">${imgTag}</span>
          <span class="nav-label">${btn.label}</span>
        </button>`;
      }
      const isGuideTarget = _isFirstTime && btn.id === 'nav_stage';
      return `<button class="nav-btn${btn.main?' nav-btn-stage':''}${isGuideTarget?' onboard-pulse':''}"
        onclick="SceneManager.go('${btn.scene}')">
        ${isGuideTarget ? `<span class="onboard-hint">${Lang.t('onboarding','tapStage')}</span>` : ''}
        <span class="nav-icon">${imgTag}</span>
        <span class="nav-label">${btn.label}</span>
      </button>`;
    }).join('');
  }

  // ── 설정 메뉴 ──
  function _showSlotUnlockPopup(diff) {
    const isNormal = diff === 'normal';
    const count = isNormal ? 2 : 3;
    const icon  = isNormal ? '⚔️' : '🔥';
    const color = isNormal ? '#f0c040' : '#ff6040';
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.7);
      display:flex;align-items:center;justify-content:center;z-index:9999;font-family:inherit;`;
    overlay.innerHTML = `
      <div style="background:#0e0a1a;border:2px solid ${color};border-radius:16px;
        padding:28px 24px;max-width:300px;width:88%;text-align:center;">
        <div style="font-size:36px;margin-bottom:10px;">${icon}</div>
        <div style="font-size:18px;color:${color};font-weight:700;margin-bottom:10px;">${Lang.t('lobby','slotUnlockedTitle')}</div>
        <div style="font-size:13px;color:#e8dcc8;line-height:1.7;margin-bottom:18px;">
          <b style="color:${color}">${isNormal?Lang.t('lobby','diffNormal'):Lang.t('lobby','diffHard')}</b>
          ${Lang.getCurrent()==='en'?' Clear Achieved!':' 클리어 달성!'}<br>
          ${Lang.t('lobby','slotExpandedBody')}<br>
          ${Lang.t('lobby','slotExpandedMsg').replace('{n}',`<b style="color:${color}">${count}</b>`)}
        </div>
        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px;">
          ${Array.from({length:3},(_,i)=>`<span style="font-size:13px;color:${i<count?['#60c060','#f0c040','#ff6040'][i]:'#3a2a3a'};">
            ${ ['🌿'+Lang.t('lobby','diffEasy'),'⚔️'+Lang.t('lobby','diffNormal'),'🔥'+Lang.t('lobby','diffHard')][i]}</span>`).join('')}
        </div>
        <button onclick="document.getElementById('slot-unlock-overlay').remove()" style="
          padding:10px 28px;border-radius:10px;border:1px solid ${color};
          background:rgba(${isNormal?'240,192,64':'255,96,64'},0.2);
          color:${color};font-size:14px;cursor:pointer;font-family:inherit;font-weight:700;">
          ${Lang.t('lobby','slotConfirm')}
        </button>
      </div>`;
    overlay.id = 'slot-unlock-overlay';
    document.body.appendChild(overlay);
  }

  function openSettings() {
    const existing = document.getElementById('settings-modal');
    if (existing) { existing.remove(); return; }

    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:100;
      background:rgba(0,0,0,0.75);
      display:flex;align-items:center;justify-content:center;
      font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
    `;

    const cur = Lang.getCurrent();
    modal.innerHTML = `
      <div style="
        background:#0e0a1a;
        border:1px solid rgba(200,160,255,0.3);
        border-radius:14px;
        padding:28px 24px;
        width:260px;
        box-shadow:0 8px 32px rgba(0,0,0,0.8);
      ">
        <!-- 제목 -->
        <div style="
          text-align:center;font-size:16px;
          color:#e0c8ff;letter-spacing:.15em;
          margin-bottom:24px;
          border-bottom:1px solid rgba(200,160,255,0.2);
          padding-bottom:14px;
        ">${Lang.t('settingsMenu','title')}</div>

        <!-- 언어 설정 -->
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;color:rgba(200,160,255,0.6);letter-spacing:.1em;margin-bottom:10px;">
            ${Lang.t('settingsMenu','language')}
          </div>
          <div style="display:flex;gap:10px;">
            <button onclick="LobbyScene.setLang('ko')" style="
              flex:1;padding:10px 0;border-radius:8px;font-size:14px;cursor:pointer;
              font-family:inherit;letter-spacing:.05em;
              background:${cur==='ko' ? 'rgba(128,64,192,0.5)' : 'rgba(128,64,192,0.1)'};
              border:1px solid rgba(200,160,255,${cur==='ko' ? '0.7' : '0.25'});
              color:${cur==='ko' ? '#e8d0ff' : 'rgba(200,160,255,0.5)'};
              transition:all 0.2s;
            ">🇰🇷 한국어</button>
            <button onclick="LobbyScene.setLang('en')" style="
              flex:1;padding:10px 0;border-radius:8px;font-size:14px;cursor:pointer;
              font-family:inherit;letter-spacing:.05em;
              background:${cur==='en' ? 'rgba(64,96,192,0.5)' : 'rgba(64,96,192,0.1)'};
              border:1px solid rgba(160,200,255,${cur==='en' ? '0.7' : '0.25'});
              color:${cur==='en' ? '#d0e4ff' : 'rgba(160,200,255,0.5)'};
              transition:all 0.2s;
            ">🇺🇸 English</button>
          </div>
        </div>

        <!-- 볼륨 슬라이더 -->
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;color:rgba(200,160,255,0.6);letter-spacing:.1em;margin-bottom:10px;">
            🔊 ${cur==='ko'?'볼륨':'Volume'}
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <input type="range" id="lobbyVolSlider" min="0" max="100"
              value="${AudioManager.isMuted()?0:Math.round(AudioManager.getVolume()*100)}"
              style="flex:1;accent-color:#a060e0;"
              oninput="AudioManager.setVolume(this.value/100);AudioManager.setMuted(this.value==0);document.getElementById('lobbyVolNum').textContent=this.value+'%';">
            <span id="lobbyVolNum" style="font-size:11px;color:#8a7a6a;width:32px;text-align:right;">
              ${AudioManager.isMuted()?0:Math.round(AudioManager.getVolume()*100)}%
            </span>
          </div>
        </div>

        <!-- 도움말 -->
        <div style="margin-bottom:20px;">
          <button onclick="document.getElementById('settings-modal').remove();LobbyScene.openTutorial();" style="
            width:100%;padding:10px 0;border-radius:8px;font-size:14px;cursor:pointer;
            font-family:inherit;
            background:rgba(64,96,160,0.25);
            border:1px solid rgba(160,200,255,0.3);
            color:rgba(160,200,255,0.8);
          ">❓ ${Lang.t('settingsMenu','tutorial')}</button>
        </div>

        <!-- 닫기 -->
        <button onclick="document.getElementById('settings-modal').remove()" style="
          width:100%;padding:12px 0;
          background:rgba(255,255,255,0.06);
          border:1px solid rgba(255,255,255,0.12);
          border-radius:8px;color:rgba(255,255,255,0.5);
          font-size:13px;font-family:inherit;cursor:pointer;
          letter-spacing:.08em;
        ">${Lang.t('ui','back')}</button>
      </div>
    `;

    // 모달 바깥 탭으로 닫기
    modal.addEventListener('click', e => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  }

  function setLang(lang) {
    Lang.set(lang);
    SceneManager.go('lobby');
  }

  function openTutorial() {
    const existing = document.getElementById('tutorial-modal');
    if (existing) { existing.remove(); return; }

    const L = k => Lang.t('tutorial', k);
    const slides = [
      { title: L('slide1_title'), body: L('slide1_body') },
      { title: L('slide2_title'), body: L('slide2_body') },
      { title: L('slide3_title'), body: L('slide3_body') },
      { title: L('slide4_title'), body: L('slide4_body') },
    ];
    let current = 0;

    const modal = document.createElement('div');
    modal.id = 'tutorial-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:200;
      background:rgba(0,0,0,0.85);
      display:flex;align-items:center;justify-content:center;
      font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
    `;

    function renderSlide() {
      const s = slides[current];
      const isLast = current === slides.length - 1;
      modal.innerHTML = `
        <div style="
          background:linear-gradient(160deg,#0e0a1a,#1a0e28);
          border:1px solid rgba(200,160,255,0.35);
          border-radius:18px;
          padding:32px 28px 24px;
          width:320px;
          box-shadow:0 12px 48px rgba(80,0,180,0.5);
          position:relative;
        ">
          <!-- 상단: 제목 + 진행 -->
          <div style="text-align:center;margin-bottom:20px;">
            <div style="font-size:11px;color:rgba(200,160,255,0.5);letter-spacing:.15em;margin-bottom:10px;">
              ${L('title')}
            </div>
            <div style="display:flex;justify-content:center;gap:6px;margin-bottom:16px;">
              ${slides.map((_,i) => `<div style="
                width:${i===current?24:8}px;height:8px;border-radius:4px;
                background:${i===current?'rgba(200,160,255,0.9)':'rgba(200,160,255,0.25)'};
                transition:all 0.3s;
              "></div>`).join('')}
            </div>
            <div style="font-size:18px;color:#e0c8ff;font-weight:bold;line-height:1.4;">
              ${s.title}
            </div>
          </div>

          <!-- 내용 -->
          <div style="
            font-size:13px;color:rgba(220,200,255,0.85);
            line-height:1.9;text-align:center;
            white-space:pre-line;
            min-height:130px;
            padding:0 4px;
          ">${s.body}</div>

          <!-- 버튼들 -->
          <div style="display:flex;gap:10px;margin-top:24px;">
            ${current > 0 ? `
            <button onclick="LobbyScene._tutorialPrev()" style="
              flex:1;padding:12px 0;border-radius:10px;
              background:rgba(100,80,160,0.2);
              border:1px solid rgba(200,160,255,0.2);
              color:rgba(200,160,255,0.6);
              font-size:13px;font-family:inherit;cursor:pointer;
            ">${L('prev')}</button>` : `
            <button onclick="document.getElementById('tutorial-modal').remove();if(window._afterTutorial){const cb=window._afterTutorial;window._afterTutorial=null;setTimeout(cb,400);}" style="
              flex:1;padding:12px 0;border-radius:10px;
              background:rgba(80,80,80,0.15);
              border:1px solid rgba(255,255,255,0.1);
              color:rgba(255,255,255,0.3);
              font-size:13px;font-family:inherit;cursor:pointer;
            ">${L('skip')}</button>`}
            <button onclick="LobbyScene._tutorialNext()" style="
              flex:2;padding:12px 0;border-radius:10px;
              background:${isLast?'rgba(100,200,120,0.35)':'rgba(140,80,220,0.4)'};
              border:1px solid ${isLast?'rgba(120,220,140,0.6)':'rgba(200,160,255,0.5)'};
              color:${isLast?'#90f0a8':'#e0c8ff'};
              font-size:14px;font-family:inherit;cursor:pointer;font-weight:bold;
            ">${isLast ? L('close') : L('next')}</button>
          </div>
        </div>
      `;
    }

    modal.addEventListener('click', e => {
      if (e.target === modal) {
        modal.remove();
        if (window._afterTutorial) {
          const cb = window._afterTutorial;
          window._afterTutorial = null;
          setTimeout(cb, 400);
        }
      }
    });
    document.body.appendChild(modal);
    renderSlide();

    window._tutorialRender = renderSlide;
    window._tutorialGetCurrent = () => current;
    window._tutorialSetCurrent = v => { current = v; };
    window._tutorialSlideCount = slides.length;
  }

  // ── 캐릭터 다이얼로그 (한 줄 말풍선) ──
  function showDialogue(text, duration = 3000) {
    const existing = document.getElementById('lobby-dialogue');
    if (existing) existing.remove();

    const d = document.createElement('div');
    d.id = 'lobby-dialogue';
    d.style.cssText = `
      position:fixed;bottom:120px;left:50%;transform:translateX(-50%);
      background:rgba(10,8,20,0.92);border:1px solid rgba(255,200,100,0.7);
      border-radius:12px;padding:10px 22px;
      color:#f5e8b0;font-size:14px;font-family:'Noto Serif KR','Apple SD Gothic Neo',serif;
      letter-spacing:.08em;line-height:1.6;
      z-index:300;white-space:nowrap;
      box-shadow:0 4px 20px rgba(0,0,0,0.8);
      animation:lobbyDlgIn 0.3s ease;
      pointer-events:none;
    `;
    d.textContent = text;

    if (!document.getElementById('lobby-dlg-css')) {
      const s = document.createElement('style');
      s.id = 'lobby-dlg-css';
      s.textContent = `@keyframes lobbyDlgIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
      document.head.appendChild(s);
    }

    document.body.appendChild(d);
    setTimeout(() => {
      d.style.transition = 'opacity 0.5s';
      d.style.opacity = '0';
      setTimeout(() => d.remove(), 500);
    }, duration);
  }

  function _tutorialNext() {
    const cur = window._tutorialGetCurrent();
    if (cur < window._tutorialSlideCount - 1) {
      window._tutorialSetCurrent(cur + 1);
      window._tutorialRender();
    } else {
      document.getElementById('tutorial-modal')?.remove();
      if (window._afterTutorial) {
        const cb = window._afterTutorial;
        window._afterTutorial = null;
        setTimeout(cb, 400);
      }
    }
  }

  function _tutorialPrev() {
    const cur = window._tutorialGetCurrent();
    if (cur > 0) {
      window._tutorialSetCurrent(cur - 1);
      window._tutorialRender();
    }
  }

  function toggleBgm(btn) {
    const muted = !AudioManager.isMuted();
    AudioManager.setMuted(muted);
    if (!muted) AudioManager.play('lobby');
    // 버튼 UI 즉시 갱신
    btn.textContent = muted ? '🔇 OFF' : '🎵 ON';
    btn.style.background = muted ? 'rgba(80,80,80,0.2)' : 'rgba(64,160,96,0.4)';
    btn.style.borderColor = muted ? 'rgba(255,255,255,0.15)' : 'rgba(100,220,140,0.6)';
    btn.style.color = muted ? 'rgba(255,255,255,0.35)' : '#80f0a0';
  }

  // ── enter / exit ──
  function enter(el) {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    AudioManager.play('lobby');
    saveData   = Save.load();
    lobbyLevel = Save.calcLobbyLevel(saveData);
    unlocked   = Unlock.getUnlocked(saveData);

    render(el);

    // 로비 배경 이미지 적용 (어느 난이도든 클리어 기준)
    requestAnimationFrame(() => {
      const lobbyRoot = document.getElementById('lobby-root');
      if (!lobbyRoot) return;
      const _allCleared = new Set([
        ...(saveData.clearedStages        || []),
        ...(saveData.clearedStagesEasy    || []),
        ...(saveData.clearedStagesNormal  || []),
        ...(saveData.clearedStagesHard    || []),
      ]);
      const has = n => _allCleared.has(n);
      let bgKey;
      if (has(30))      bgKey = 'bg7';
      else if (has(25)) bgKey = 'bg6';
      else if (has(20)) bgKey = 'bg5';
      else if (has(15)) bgKey = 'bg4';
      else if (has(10)) bgKey = 'bg3';
      else if (has(5))  bgKey = 'bg2';
      else if (_allCleared.size > 0) bgKey = 'bg1';
      else              bgKey = 'start';
      const bgSprite = SPRITES?.lobbyBg?.[bgKey];
      if (bgSprite) {
        const bgImg = SpriteLoader.get(bgSprite.src);
        if (bgImg?.src) {
          lobbyRoot.style.backgroundImage = `url('${bgImg.src}')`;
          lobbyRoot.style.backgroundSize = 'cover';
          lobbyRoot.style.backgroundPosition = 'top center';
        }
      }
    });

    // CSS: 걷기 바운스
    if (!document.getElementById('lobby-walk-css')) {
      const s = document.createElement('style');
      s.id = 'lobby-walk-css';
      s.textContent = ''; // keyframe 불필요 (JS에서 직접 제어)
      document.head.appendChild(s);
    }

    requestAnimationFrame(() => requestAnimationFrame(() => {
      buildWorld();
      buildNav();
      bindControls();
      rafId = requestAnimationFrame(gameLoop);

      const LD = k => Lang.t('lobbyDialogue', k);
      const MILESTONE_DIALOGUES = [
        { stage: 5,  text: LD('unlock_5')  },
        { stage: 10, text: LD('unlock_10') },
        { stage: 15, text: LD('unlock_15') },
        { stage: 20, text: LD('unlock_20') },
        { stage: 25, text: LD('unlock_25') },
        { stage: 30, text: LD('unlock_30') },
      ];

      // 우선순위: 튜토리얼 > 결의 다이얼로그 > 첫 클리어 > 마일스톤
      if (!saveData.tutorialDone) {
        saveData.tutorialDone = true;
        Save.save(saveData);
        setTimeout(() => {
          openTutorial();
          window._afterTutorial = () => showDialogue(LD('resolve'));
        }, 600);
      } else if ((saveData.clearedStages || []).length === 0 && !saveData._startDialogueDone) {
        saveData._startDialogueDone = true;
        Save.save(saveData);
        setTimeout(() => showDialogue(LD('resolve')), 800);
      } else if (saveData._showFirstClearDialogue) {
        delete saveData._showFirstClearDialogue;
        Save.save(saveData);
        setTimeout(() => showDialogue(LD('firstClear')), 800);
      } else if (saveData._showSlotUnlock) {
        const _unlockDiff = saveData._showSlotUnlock;
        delete saveData._showSlotUnlock;
        Save.save(saveData);
        setTimeout(() => _showSlotUnlockPopup(_unlockDiff), 600);
      } else {
        const clearedS = new Set([
          ...(saveData.clearedStages        || []),
          ...(saveData.clearedStagesEasy    || []),
          ...(saveData.clearedStagesNormal  || []),
          ...(saveData.clearedStagesHard    || []),
        ]);
        const shownMilestones = saveData._shownMilestones || [];
        const pending = MILESTONE_DIALOGUES.find(
          m => clearedS.has(m.stage) && !shownMilestones.includes(m.stage)
        );
        if (pending) {
          shownMilestones.push(pending.stage);
          saveData._shownMilestones = shownMilestones;
          Save.save(saveData);
          setTimeout(() => showDialogue(pending.text, 3500), 800);
        }
      }
    }));
  }

  function exit() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if(window._lobbyMD){document.removeEventListener('mousedown',window._lobbyMD);window._lobbyMD=null;}
    if(window._lobbyMM){window.removeEventListener('mousemove',window._lobbyMM);window._lobbyMM=null;}
    if(window._lobbyMU){window.removeEventListener('mouseup',window._lobbyMU);window._lobbyMU=null;}
    if(window._lobbyKD){window.removeEventListener('keydown',window._lobbyKD);window._lobbyKD=null;}
    if(window._lobbyKU){window.removeEventListener('keyup',window._lobbyKU);window._lobbyKU=null;}
    joyDX = 0; joyDY = 0; joyActive = false;
    Object.keys(keys).forEach(k => delete keys[k]);
  }

  function devClearChapter(ch) {
    const sd = Save.load();
    if (!sd.clearedChapters) sd.clearedChapters = [];
    if (!sd.clearedChapters.includes(ch)) sd.clearedChapters.push(ch);
    sd.clearedChapters.sort((a,b) => a-b);
    Save.save(sd);
    saveData = sd;
    // 플레이어 스프라이트 즉시 갱신
    const el = document.getElementById('player-sprite');
    if (el) { el._sprLoaded = false; positionPlayer(); }
    console.log('DEV: clearedChapters =', sd.clearedChapters);
  }

  function devResetChapters() {
    const sd = Save.load();
    sd.clearedChapters = [];
    Save.save(sd);
    saveData = sd;
    const el = document.getElementById('player-sprite');
    if (el) { el._sprLoaded = false; positionPlayer(); }
    console.log('DEV: clearedChapters reset');
  }

  return { enter, exit, openSettings, setLang, toggleBgm, openTutorial, _tutorialNext, _tutorialPrev, devClearChapter, devResetChapters };
})();
