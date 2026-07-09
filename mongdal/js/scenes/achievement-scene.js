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
  ];

  const MILESTONE_DEFS = [
    { id:'total_kills', icon:'⚔️',
      steps:[
        { target:100,   gems:1, labelKo:'100마리 처치', labelEn:'100 kills' },
        { target:500,   gems:1, labelKo:'500마리 처치', labelEn:'500 kills' },
        { target:1000,  gems:2, labelKo:'1000마리 처치', labelEn:'1000 kills' },
        { target:5000,  gems:3, labelKo:'5000마리 처치', labelEn:'5000 kills' },
        { target:10000, gems:5, labelKo:'10000마리 처치', labelEn:'10000 kills' },
      ],
      getValue: sd => sd.totalKills || 0,
    },
    { id:'total_wins', icon:'🏆',
      steps:[
        { target:10,  gems:1, labelKo:'10회 클리어', labelEn:'10 clears' },
        { target:50,  gems:2, labelKo:'50회 클리어', labelEn:'50 clears' },
        { target:100, gems:3, labelKo:'100회 클리어', labelEn:'100 clears' },
      ],
      getValue: sd => (sd.clearedStages||[]).length,
    },
    { id:'total_runs', icon:'🎮',
      steps:[
        { target:10,  gems:1, labelKo:'10회 출격', labelEn:'10 runs' },
        { target:50,  gems:2, labelKo:'50회 출격', labelEn:'50 runs' },
        { target:100, gems:3, labelKo:'100회 출격', labelEn:'100 runs' },
      ],
      getValue: sd => sd.runs || 0,
    },
  ];

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
    for (const def of MILESTONE_DEFS) {
      const val = def.getValue(saveData);
      def.steps.forEach((step, idx) => {
        const key = `${def.id}_${idx}`;
        if (val >= step.target && !saveData.achievementRewards[key]) {
          saveData.achievementRewards[key] = true;
          totalGems += step.gems;
        }
      });
    }

    if (totalGems > 0) {
      saveData.gems = (saveData.gems || 0) + totalGems;
      Save.save(saveData);
    }
    render(document.getElementById('app'));
  }

  function claimReward(id, stepIdx) {
    saveData = Save.load();
    if (!saveData.achievementRewards) saveData.achievementRewards = {};
    const key = stepIdx !== undefined ? `${id}_${stepIdx}` : id;
    if (saveData.achievementRewards[key]) return;

    let gems = 0;
    if (stepIdx !== undefined) {
      const def = MILESTONE_DEFS.find(d => d.id === id);
      gems = def?.steps[stepIdx]?.gems || 0;
    } else {
      const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
      gems = def?.gems || 0;
    }

    saveData.gems = (saveData.gems || 0) + gems;
    saveData.achievementRewards[key] = true;
    Save.save(saveData);
    render(document.getElementById('app'));
  }

  function render(el) {
    saveData = Save.load();
    checkAndUnlock(saveData);
    Save.save(saveData);

    const achieved = saveData.achievements || {};
    const rewards = saveData.achievementRewards || {};
    const isEn = Lang.getCurrent() === 'en';

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

    const milestoneHTML = MILESTONE_DEFS.map(def => {
      const val = def.getValue(saveData);
      const defName = Lang.t('achievement', def.id + '_name');
      const stepsHTML = def.steps.map((step, idx) => {
        const done = val >= step.target;
        const key = `${def.id}_${idx}`;
        const claimed = !!rewards[key];
        const canClaim = done && !claimed;
        const prog = Math.min(val / step.target * 100, 100);
        const stepLabel = isEn ? step.labelEn : step.labelKo;
        return `
          <div style="margin-bottom:8px;padding:8px 10px;
            background:${done?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.02)'};
            border:1px solid ${done?'rgba(240,192,64,0.25)':'rgba(255,255,255,0.06)'};
            border-radius:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:11px;color:${done?'#c8a840':'#5a4a3a'};">${stepLabel}</span>
              ${canClaim
                ? `<button onclick="AchievementScene.claimReward('${def.id}',${idx})"
                    style="padding:4px 8px;background:rgba(112,64,192,0.6);border:1px solid #a060e0;
                    border-radius:6px;color:#e8dcc8;font-size:10px;cursor:pointer;font-family:inherit;">
                    💎+${step.gems} ${Lang.t('achievement','claim')}</button>`
                : claimed
                ? `<span style="font-size:10px;color:#4a8a4a;">✅</span>`
                : `<span style="font-size:10px;color:#3a3a3a;">${val.toLocaleString()}/${step.target.toLocaleString()}</span>`
              }
            </div>
            <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;">
              <div style="height:100%;width:${prog}%;background:${done?'#f0c040':'#4a6a4a'};border-radius:2px;transition:width .3s;"></div>
            </div>
          </div>`;
      }).join('');

      return `
        <div style="margin-bottom:14px;">
          <div style="font-size:12px;color:rgba(200,160,255,0.7);margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            ${def.icon} ${defName}
            <span style="font-size:11px;color:#6a5a4a;">(${Lang.t('achievement','current')}: ${def.getValue(saveData).toLocaleString()})</span>
          </div>
          ${stepsHTML}
        </div>`;
    }).join('');

    el.innerHTML = `
      <div style="width:390px;height:844px;background:#0e0a1a;display:flex;flex-direction:column;font-family:'Noto Serif KR',serif;">
        <!-- 헤더 -->
        <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;
          border-bottom:1px solid rgba(200,160,255,0.15);flex-shrink:0;">
          <button onclick="SceneManager.go('lobby')" style="padding:6px 12px;background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#8a7a6a;
            font-size:12px;cursor:pointer;font-family:inherit;">${isEn?'← Back':'← 귀환'}</button>
          <span style="font-size:18px;color:#f0c040;font-weight:700;">${Lang.t('achievement','title')}</span>
          <span style="margin-left:auto;font-size:13px;color:#c8b8a0;">💎 ${saveData.gems||0}</span>
          ${(() => {
            let pending = 0;
            for (const def of ACHIEVEMENT_DEFS) {
              if (achieved[def.id] && !rewards[def.id]) pending += def.gems;
            }
            for (const def of MILESTONE_DEFS) {
              const val = def.getValue(saveData);
              def.steps.forEach((step, idx) => {
                if (val >= step.target && !rewards[`${def.id}_${idx}`]) pending += step.gems;
              });
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
        <div style="flex:1;overflow-y:auto;padding:14px 16px;">
          <div style="font-size:12px;color:rgba(200,160,255,0.6);letter-spacing:.1em;margin-bottom:10px;">
            ${Lang.t('achievement','onceSect')}
          </div>
          ${onceHTML}

          <div style="font-size:12px;color:rgba(200,160,255,0.6);letter-spacing:.1em;margin:16px 0 10px;">
            ${Lang.t('achievement','milestoneSect')}
          </div>
          ${milestoneHTML}
        </div>
      </div>`;
  }

  function enter(el) { render(el); }
  function exit() {}

  return { enter, exit, claimReward, claimAll, checkAndUnlock };
})();
