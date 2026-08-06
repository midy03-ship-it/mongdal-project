// achievement-scene.js
const AchievementScene = (() => {
  let saveData = null;

  const ACHIEVEMENT_DEFS = [
    { id:'first_win',       type:'once', icon:'⚔️', gems:3,
      check: sd => (sd.clearedStages||[]).length >= 1 },
    { id:'first_lose',      type:'once', icon:'💀', gems:1,
      check: sd => (sd.runs||0) >= 1 && ((sd.clearedStages||[]).length === 0 || (sd.runs||0) > (sd.clearedStages||[]).length) },
    { id:'first_boss',      type:'once', icon:'👹', gems:3,
      check: sd => (sd.clearedChapters||[]).length >= 1 },
    { id:'first_companion', type:'once', icon:'🤝', gems:2,
      check: sd => (sd.activeCompanions||[]).length >= 1 },
    { id:'first_pet',       type:'once', icon:'🐾', gems:2,
      check: sd => (sd.pets||[]).length >= 1 },
    { id:'first_building',  type:'once', icon:'🏗️', gems:2,
      check: sd => Object.keys(sd.buildings||{}).some(k => (sd.buildings[k]||0) >= 2) },
    { id:'first_evolve',    type:'once', icon:'✨', gems:5,
      check: sd => Object.values(sd.weaponLevels||{}).some(v => v >= 5) },
    { id:'all_chapters',    type:'once', icon:'🌟', gems:10,
      check: sd => (sd.clearedChapters||[]).length >= 10 },
    // [UPDATE 2026-07-26] 업적 대규모 확장 — 시즌 클리어/난이도/동료·펫 수집/선술/재화 등 다양한 카테고리
    { id:'season1_full', type:'once', icon:'🏮', gems:5,  check: sd => !!sd.season1Clear },
    { id:'season2_full', type:'once', icon:'👻', gems:6,  check: sd => !!sd.season2Clear },
    { id:'season3_full', type:'once', icon:'🌀', gems:7,  check: sd => !!sd.season3Clear },
    { id:'season4_full', type:'once', icon:'♻️', gems:8,  check: sd => !!sd.season4Clear },
    { id:'season5_full', type:'once', icon:'☁️', gems:9,  check: sd => !!sd.season5Clear },
    { id:'hard_clear',   type:'once', icon:'🔥', gems:6,  check: sd => (sd.clearedStagesHard||[]).length >= 1 },
    { id:'companion_5',  type:'once', icon:'🤝', gems:3,  check: sd => (sd.companions||[]).length >= 5 },
    { id:'companion_10', type:'once', icon:'🤝', gems:5,  check: sd => (sd.companions||[]).length >= 10 },
    { id:'companion_15', type:'once', icon:'🤝', gems:8,  check: sd => (sd.companions||[]).length >= 15 },
    { id:'pet_5',        type:'once', icon:'🐾', gems:3,  check: sd => (sd.pets||[]).length >= 5 },
    { id:'pet_10',       type:'once', icon:'🐾', gems:5,  check: sd => (sd.pets||[]).length >= 10 },
    { id:'pet_15',       type:'once', icon:'🐾', gems:8,  check: sd => (sd.pets||[]).length >= 15 },
    { id:'companion_4star',   type:'once', icon:'⭐', gems:5, check: sd => Object.values(sd.companionStars||{}).some(v => v >= 4) },
    { id:'companion_awakened',type:'once', icon:'💫', gems:6, check: sd => Object.values(sd.companionAwakening||{}).some(v => v >= 1) },
    { id:'seonsul_unlock',    type:'once', icon:'☯️', gems:5, check: sd => (sd.sinmokS5?.trees||[]).length >= 1 },
    { id:'seonsul_dual_tree', type:'once', icon:'☯️', gems:8, check: sd => (sd.sinmokS5?.trees||[]).length >= 2 },
    { id:'building_lv5', type:'once', icon:'🏗️', gems:4,  check: sd => Object.values(sd.buildings||{}).some(v => v >= 5) },
    { id:'gold_10k',     type:'once', icon:'💰', gems:3,  check: sd => (sd.gold||0) >= 10000 },
    { id:'gem_50',       type:'once', icon:'💎', gems:3,  check: sd => (sd.gems||0) >= 50 },
    { id:'kills_50000',  type:'once', icon:'☠️', gems:10, check: sd => (sd.totalKills||0) >= 50000 },
  ];

  // [UPDATE 2026-07-26] 무한 반복 마일스톤 4종 — 전부 "N 달성 후 수령하면 다음 목표가 N+increment로" 계속 늘어나며
  // 반복 수령 가능. saveData.achievementProgress[id]에 현재 티어(0부터)를 저장. 챕터 보스 처치도 여기 포함(10마다
  // 별도 일회성 업적을 만드는 대신, clearedChapters 개수 기준으로 10/20/30...을 무한히 반복하는 편이 더 일관적).
  // [UPDATE 2026-07-26] 다이아 보상 70% 삭감 — 누적치가 큰 세이브가 밀린 티어를 한꺼번에 수령(claimAll/claimInfiniteReward의
  // 백로그 소진 루프)하면서 다이아가 기하급수적으로 불어나던 문제(사용자 실측: 79만개). 기존 공식에 균일하게 ×0.3 적용.
  // [UPDATE 2026-07-26] 티어 비례 증가형 공식 전부 폐기 — 완전 고정값으로 재설계(사용자 확정치).
  // 끝없는 사냥: 1,000킬당 5개 / 보스 사냥꾼: 보스 1마리당 2개(단위를 10마리→1마리로 변경) /
  // 연승가도: 클리어 10회당 3개 / 불가항력: 출격 10회당 3개. 백로그 20티어 캡은 그대로 유지.
  const INFINITE_MILESTONE_DEFS = [
    { id:'total_kills_inf', icon:'⚔️', startTarget:1000, increment:1000,
      getValue: sd => sd.totalKills || 0,
      gemsForTier: tier => 5,
    },
    { id:'boss_chapters_inf', icon:'👹', startTarget:1, increment:1,
      getValue: sd => (sd.clearedChapters||[]).length,
      gemsForTier: tier => 2,
    },
    { id:'total_wins_inf', icon:'🏆', startTarget:10, increment:10,
      getValue: sd => (sd.clearedStages||[]).length,
      gemsForTier: tier => 3,
    },
    { id:'total_runs_inf', icon:'🎮', startTarget:10, increment:10,
      getValue: sd => sd.runs || 0,
      gemsForTier: tier => 3,
    },
  ];
  function _infTarget(def, tier) { return def.startTarget + tier * def.increment; }

  function checkAndUnlock(sd) {
    let changed = false;
    if (!sd.achievements) sd.achievements = {};
    for (const def of ACHIEVEMENT_DEFS) {
      if (!sd.achievements[def.id] && def.check(sd)) {
        sd.achievements[def.id] = true;
        changed = true;
      }
    }
    return changed;
  }

  function claimAll() {
    saveData = Save.load();
    if (!saveData.achievementRewards) saveData.achievementRewards = {};
    let totalGems = 0;

    for (const def of ACHIEVEMENT_DEFS) {
      if (saveData.achievements?.[def.id] && !saveData.achievementRewards[def.id]) {
        saveData.achievementRewards[def.id] = true;
        totalGems += def.gems;
      }
    }
    // [UPDATE 2026-07-26] 백로그 캡 — "한 번에 전부 몰아 수령"이 진짜 원흉이었음(실측: 누적킬 티어 2697까지 밀린 세이브).
    // 값을 아무리 깎아도 티어 수 자체가 수천 단위면 도루묵이라, 한 번의 전체수령에 최대 20티어까지만 소진하도록 캡.
    // 20티어 넘게 밀려있으면 여러 번 눌러야 다 받을 수 있음(의도된 동작).
    const MAX_TIERS_PER_CLAIM = 20;
    if (!saveData.achievementProgress) saveData.achievementProgress = {};
    for (const def of INFINITE_MILESTONE_DEFS) {
      const val = def.getValue(saveData);
      let tier = saveData.achievementProgress[def.id] || 0;
      let claimedTiers = 0;
      while (val >= _infTarget(def, tier) && claimedTiers < MAX_TIERS_PER_CLAIM) {
        totalGems += def.gemsForTier ? def.gemsForTier(tier) : 2;
        tier++;
        claimedTiers++;
      }
      saveData.achievementProgress[def.id] = tier;
    }

    if (totalGems > 0) {
      saveData.gems = (saveData.gems || 0) + totalGems;
      Save.save(saveData);
    }
    render(document.getElementById('app'));
  }

  // 무한 마일스톤 단일 티어 수령 — 누르면 현재 티어 하나만 수령하고 다음 티어로 넘어감
  function claimInfiniteReward(id) {
    saveData = Save.load();
    if (!saveData.achievementProgress) saveData.achievementProgress = {};
    const def = INFINITE_MILESTONE_DEFS.find(d => d.id === id);
    if (!def) return;
    const tier = saveData.achievementProgress[id] || 0;
    const val = def.getValue(saveData);
    if (val < _infTarget(def, tier)) return;
    const gems = def.gemsForTier ? def.gemsForTier(tier) : 2;
    saveData.gems = (saveData.gems || 0) + gems;
    saveData.achievementProgress[id] = tier + 1;
    Save.save(saveData);
    render(document.getElementById('app'));
  }

  function claimReward(id) {
    saveData = Save.load();
    if (!saveData.achievementRewards) saveData.achievementRewards = {};
    if (saveData.achievementRewards[id]) return;
    const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
    const gems = def?.gems || 0;

    saveData.gems = (saveData.gems || 0) + gems;
    saveData.achievementRewards[id] = true;
    Save.save(saveData);
    render(document.getElementById('app'));
  }

  function render(el) {
    saveData = Save.load();
    checkAndUnlock(saveData);
    Save.save(saveData);

    const achieved = saveData.achievements || {};
    const rewards = saveData.achievementRewards || {};

    const onceHTML = ACHIEVEMENT_DEFS.map(def => {
      const done = !!achieved[def.id];
      const claimed = !!rewards[def.id];
      const canClaim = done && !claimed;
      const name = Lang.t('achievement', def.id + '_name');
      const desc = Lang.t('achievement', def.id + '_desc');
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;
          background:${done ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'};
          border:1px solid ${done ? 'rgba(240,192,64,0.3)' : 'rgba(255,255,255,0.08)'};
          border-radius:10px;margin-bottom:8px;">
          <div style="font-size:22px;opacity:${done?1:0.3};">${def.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;color:${done?'#f0c040':'#6a5a4a'};font-weight:700;">${name}</div>
            <div style="font-size:10px;color:#5a4a3a;margin-top:1px;">${desc}</div>
          </div>
          <div style="flex-shrink:0;">
            ${canClaim
              ? `<button onclick="AchievementScene.claimReward('${def.id}')"
                  style="padding:6px 10px;background:rgba(112,64,192,0.6);border:1px solid #a060e0;
                  border-radius:8px;color:#e8dcc8;font-size:11px;cursor:pointer;font-family:inherit;">
                  💎+${def.gems} ${Lang.t('achievement','claim')}</button>`
              : claimed
              ? `<span style="font-size:11px;color:#4a8a4a;">✅ ${Lang.t('achievement','claimed')}</span>`
              : `<span style="font-size:11px;color:#3a3a3a;">🔒</span>`
            }
          </div>
        </div>`;
    }).join('');

    // 무한 반복 마일스톤 렌더 — 현재 티어 1개만 표시, 수령하면 다음 티어(목표+increment)로 자동 갱신
    const infiniteHTML = INFINITE_MILESTONE_DEFS.map(def => {
      const val = def.getValue(saveData);
      const tier = (saveData.achievementProgress||{})[def.id] || 0;
      const target = _infTarget(def, tier);
      const done = val >= target;
      const prog = Math.min(val / target * 100, 100);
      const gems = def.gemsForTier ? def.gemsForTier(tier) : 2;
      const defName = Lang.t('achievement', def.id + '_name');
      return `
        <div style="margin-bottom:14px;">
          <div style="font-size:12px;color:rgba(200,160,255,0.7);margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            ${def.icon} ${defName}
            <span style="font-size:11px;color:#6a5a4a;">(${Lang.t('achievement','tier')} ${tier + 1})</span>
          </div>
          <div style="margin-bottom:8px;padding:8px 10px;
            background:${done?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.02)'};
            border:1px solid ${done?'rgba(240,192,64,0.25)':'rgba(255,255,255,0.06)'};
            border-radius:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:11px;color:${done?'#c8a840':'#5a4a3a'};">${Format.num(val)} / ${Format.num(target)}</span>
              ${done
                ? `<button onclick="AchievementScene.claimInfiniteReward('${def.id}')"
                    style="padding:4px 8px;background:rgba(112,64,192,0.6);border:1px solid #a060e0;
                    border-radius:6px;color:#e8dcc8;font-size:10px;cursor:pointer;font-family:inherit;">
                    💎+${gems} ${Lang.t('achievement','claim')}</button>`
                : `<span style="font-size:10px;color:#3a3a3a;">🔒</span>`
              }
            </div>
            <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;">
              <div style="height:100%;width:${prog}%;background:${done?'#f0c040':'#4a6a4a'};border-radius:2px;transition:width .3s;"></div>
            </div>
          </div>
        </div>`;
    }).join('');

    el.innerHTML = `
      <div style="width:390px;height:844px;background:#0e0a1a;display:flex;flex-direction:column;font-family:'Noto Serif KR',serif;">
        <!-- 헤더 -->
        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;
          border-bottom:1px solid rgba(200,160,255,0.15);flex-shrink:0;">
          <button onclick="SceneManager.go('lobby')" style="padding:6px 12px;background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#8a7a6a;
            font-size:12px;cursor:pointer;font-family:inherit;">${Lang.getCurrent()==='en'?'← Back':'← 귀환'}</button>
          <span style="font-size:18px;color:#f0c040;font-weight:700;">${Lang.t('achievement','title')}</span>
          <span style="margin-left:auto;font-size:13px;color:#c8b8a0;">💎 ${saveData.gems||0}</span>
          ${(() => {
            let pending = 0;
            for (const def of ACHIEVEMENT_DEFS) {
              if (achieved[def.id] && !rewards[def.id]) pending += def.gems;
            }
            for (const def of INFINITE_MILESTONE_DEFS) {
              const val = def.getValue(saveData);
              let tier = (saveData.achievementProgress||{})[def.id] || 0;
              while (val >= _infTarget(def, tier)) {
                pending += def.gemsForTier ? def.gemsForTier(tier) : 2;
                tier++;
              }
            }
            return pending > 0
              ? `<button onclick="AchievementScene.claimAll()" style="padding:6px 10px;
                  background:rgba(112,64,192,0.6);border:1px solid #a060e0;border-radius:8px;
                  color:#e8dcc8;font-size:11px;cursor:pointer;font-family:inherit;margin-left:6px;">
                  💎+${pending} ${Lang.t('achievement','claimAll')}</button>`
              : '';
          })()}
        </div>

        <!-- 내용 -->
        <div class="scroll-pan-y" style="flex:1;overflow-y:auto;padding:14px 16px;">
          <div style="font-size:12px;color:rgba(200,160,255,0.6);letter-spacing:.1em;margin-bottom:10px;">
            ${Lang.t('achievement','onceSect')}
          </div>
          ${onceHTML}

          <div style="font-size:12px;color:rgba(200,160,255,0.6);letter-spacing:.1em;margin:16px 0 10px;">
            ${Lang.t('achievement','infiniteSect')}
          </div>
          ${infiniteHTML}
        </div>
      </div>`;
  }

  function enter(el) { render(el); }
  function exit() {}

  return { enter, exit, claimReward, claimAll, claimInfiniteReward, checkAndUnlock };
})();
