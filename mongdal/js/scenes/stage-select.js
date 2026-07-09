// stage-select.js
const StageSelectScene = (() => {
  let saveData = null;
  let selectedDiff = 'easy';
  let selectedSeason = 1;

  const SEASON_DATA = [
    {
      season: 1,
      nameKo: '현계', nameEn: 'Living World',
      subtitleKo: '귀인국을 되살려라', subtitleEn: 'Restore the Kingdom',
      chaptersKo: '챕터 1~10', chaptersEn: 'Ch. 1~10',
      color: '#60c0a0', icon: '⛩️',
      locked: false,
    },
    {
      season: 2,
      nameKo: '유명계', nameEn: 'Shadow Realm',
      subtitleKo: '저승의 질서를 되찾아라', subtitleEn: 'Restore Order to the Underworld',
      chaptersKo: '챕터 11~20', chaptersEn: 'Ch. 11~20',
      color: '#8080ff', icon: '💀',
      lockedFn: (save) => !(save.season1Clear),
    },
    {
      season: 3,
      nameKo: '원계 · 어계 · 황계', nameEn: 'Primordial Realms',
      chaptersKo: '챕터 21~30', chaptersEn: 'Ch. 21~30',
      color: '#c06040', icon: '☯️',
      locked: true,
    },
  ];

  const CHAPTER_COLORS = [
    'rgba(80,60,30,0.35)',
    'rgba(40,60,80,0.35)',
    'rgba(80,30,30,0.35)',
    'rgba(40,70,40,0.35)',
    'rgba(60,20,80,0.35)',
  ];

  // 시즌별 테마
  const SEASON_THEME = {
    1: {
      bg:         '#0e0a1a',
      headerBorder: 'rgba(200,160,255,0.1)',
      accent:     '#f0c040',
      chapterColors: [
        'rgba(80,60,30,0.35)','rgba(40,60,80,0.35)','rgba(80,30,30,0.35)',
        'rgba(40,70,40,0.35)','rgba(60,20,80,0.35)',
      ],
      diff: {
        easy:   { color:'#60c060', icon:'🌿', ko:'이지',  en:'Easy'   },
        normal: { color:'#f0c040', icon:'⚔️', ko:'노말',  en:'Normal' },
        hard:   { color:'#ff6040', icon:'🔥', ko:'하드',  en:'Hard'   },
      },
      chapterLabel: 'rgba(200,160,255,0.5)',
      chNameColor:  '#e8dcc8',
      gridBg:       'rgba(255,255,255,0.02)',
      gridBorder:   'rgba(255,255,255,0.05)',
      stageNumColor:'#fff',
    },
    2: {
      bg:         '#04060d',
      headerBorder: 'rgba(80,100,200,0.15)',
      accent:     '#8090d0',
      chapterColors: [
        'rgba(20,25,60,0.5)','rgba(15,20,50,0.5)','rgba(25,15,55,0.5)',
        'rgba(10,20,45,0.5)','rgba(30,15,50,0.5)',
      ],
      diff: {
        easy:   { color:'#4a7fa0', icon:'🌒', ko:'이지',  en:'Easy'   },
        normal: { color:'#7060b0', icon:'💀', ko:'노말',  en:'Normal' },
        hard:   { color:'#203070', icon:'☠️', ko:'하드',  en:'Hard'   },
      },
      chapterLabel: 'rgba(100,120,200,0.6)',
      chNameColor:  '#c0c8e8',
      gridBg:       'rgba(10,15,40,0.4)',
      gridBorder:   'rgba(60,80,160,0.15)',
      stageNumColor:'#a0b0d0',
    },
  };

  const DIFF_CONFIG = {
    easy:   { label:'이지', labelEn:'Easy',   icon:'🌿', color:'#60c060', slotMain:1, slotSub:3, slotComp:1, slotPet:1, mobMult:0.7, goldMult:0.7, s2EntryCost:1 },
    normal: { label:'노말', labelEn:'Normal', icon:'⚔️', color:'#f0c040', slotMain:2, slotSub:3, slotComp:2, slotPet:2, mobMult:1.0, goldMult:1.0, s2EntryCost:2 },
    hard:   { label:'하드', labelEn:'Hard',   icon:'🔥', color:'#ff6040', slotMain:3, slotSub:3, slotComp:3, slotPet:3, mobMult:1.5, goldMult:1.5, gemReward:true, s2EntryCost:3 },
  };

  function getBossStageId(chapter) {
    return chapter * 10;
  }

  // 해당 챕터에서 선택된 난이도를 플레이할 수 있는지
  function isChapterUnlocked(chapter, diff) {
    const clearedEasy   = saveData.clearedStagesEasy   || [];
    const clearedNormal = saveData.clearedStagesNormal  || [];
    const clearedLegacy = saveData.clearedStages        || [];
    const prevBoss = getBossStageId(chapter - 1);
    const thisBoss = getBossStageId(chapter);
    if (diff === 'easy')   return chapter === 1 || clearedEasy.includes(prevBoss);
    if (diff === 'normal') {
      const easyOk = clearedEasy.includes(thisBoss) || clearedLegacy.includes(thisBoss);
      const normalPrevOk = chapter === 1 || clearedNormal.includes(prevBoss);
      return easyOk && normalPrevOk;
    }
    if (diff === 'hard') {
      const clearedHard = saveData.clearedStagesHard || [];
      const normalOk = clearedNormal.includes(thisBoss);
      const hardPrevOk = chapter === 1 || clearedHard.includes(prevBoss);
      return normalOk && hardPrevOk;
    }
    return false;
  }

  function isCleared(stageId, diff) {
    if (diff === 'easy')   return (saveData.clearedStagesEasy   || []).includes(stageId);
    if (diff === 'normal') return (saveData.clearedStagesNormal || []).includes(stageId);
    if (diff === 'hard')   return (saveData.clearedStagesHard   || []).includes(stageId);
    return false;
  }

  function isStageUnlocked(stageId, diff, chapter) {
    if (!isChapterUnlocked(chapter, diff)) return false;
    if (diff === 'normal') {
      const maxEasy = Math.max(0, ...(saveData.clearedStagesEasy || []));
      if (stageId > maxEasy) return false;
    }
    if (diff === 'hard') {
      const maxNormal = Math.max(0, ...(saveData.clearedStagesNormal || []));
      if (stageId > maxNormal) return false;
    }
    const firstOfChapter = (chapter - 1) * 10 + 1;
    if (stageId === firstOfChapter) return true;
    return isCleared(stageId - 1, diff);
  }

  function render(el) {
    saveData = Save.load();
    const stages = GAME_DATA.stages;
    const isKo   = Lang.getCurrent() === 'ko';
    const dc     = DIFF_CONFIG[selectedDiff];
    const _hexRgb = hex => { const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `${r},${g},${b}`; };
    // lockedFn이 있으면 동적 평가, 없으면 locked 필드 사용
    const seasonList = SEASON_DATA.map(s => ({
      ...s,
      locked: s.lockedFn ? s.lockedFn(saveData) : (s.locked ?? false),
    }));

    const T = SEASON_THEME[selectedSeason] || SEASON_THEME[1];
    const tDiff = T.diff[selectedDiff] || T.diff.easy;

    el.innerHTML = `
      <div style="
        width:390px;height:844px;background:${T.bg};
        display:flex;flex-direction:column;
        font-family:'Noto Serif KR',serif;
      ">
        <!-- 헤더 -->
        <div style="
          display:flex;align-items:center;gap:10px;
          padding:14px 16px 10px;flex-shrink:0;
          border-bottom:1px solid ${T.headerBorder};
        ">
          <button onclick="SceneManager.go('lobby')" style="
            padding:6px 12px;background:rgba(255,255,255,0.05);
            border:1px solid rgba(255,255,255,0.15);border-radius:8px;
            color:#8a7a6a;font-size:12px;cursor:pointer;font-family:inherit;
          ">${isKo?'← 귀환':'← Back'}</button>
          <span style="font-size:17px;color:${T.accent};font-weight:700;">⚔️ ${isKo?'스테이지 선택':'Stage Select'}</span>
        </div>

        <!-- 시즌 카드 -->
        <div style="
          display:flex;gap:8px;padding:10px 14px;flex-shrink:0;
          overflow-x:auto;border-bottom:1px solid ${T.headerBorder};
          scrollbar-width:none;
        ">
          ${seasonList.map(s => {
            const active = s.season === selectedSeason;
            const name   = isKo ? s.nameKo : s.nameEn;
            const chs    = isKo ? s.chaptersKo : s.chaptersEn;
            return `<button onclick="${s.locked?'':'StageSelectScene.setSeason('+s.season+')'}" style="
              flex-shrink:0;width:116px;padding:10px 8px;border-radius:10px;cursor:${s.locked?'default':'pointer'};
              font-family:inherit;text-align:left;
              background:${active?'rgba('+_hexRgb(s.color)+',0.15)':'rgba(255,255,255,0.03)'};
              border:1.5px solid ${active?s.color:(s.locked?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.12)')};
              opacity:${s.locked?0.5:1};
              transition:all .15s;
            ">
              <div style="font-size:14px;margin-bottom:3px;">${s.locked?'🔒':s.icon}</div>
              <div style="font-size:11px;font-weight:700;color:${s.locked?'#4a4a5a':s.color};line-height:1.3;">${name}</div>
              ${!s.locked && s.subtitleKo ? `<div style="font-size:9px;color:#7a6a8a;margin-top:2px;">${isKo?s.subtitleKo:s.subtitleEn}</div>` : ''}
              <div style="font-size:9px;color:#5a5a6a;margin-top:4px;">${chs}</div>
            </button>`;
          }).join('')}
        </div>

        <!-- 난이도 탭 -->
        <div style="
          display:flex;gap:0;flex-shrink:0;
          border-bottom:2px solid ${T.headerBorder};
        ">
          ${['easy','normal','hard'].map(diff => {
            const d = DIFF_CONFIG[diff];
            const td = T.diff[diff];
            const active = diff === selectedDiff;
            return `<button onclick="StageSelectScene.setDiff('${diff}')" style="
              flex:1;padding:10px 0;border:none;cursor:pointer;font-family:inherit;
              font-size:13px;font-weight:${active?700:400};
              background:${active?`rgba(${_hexRgb(td.color)},0.12)`:'transparent'};
              color:${active?td.color:'#5a4a6a'};
              border-bottom:3px solid ${active?td.color:'transparent'};
              transition:all .15s;
            ">${td.icon} ${isKo?td.ko:td.en}</button>`;
          }).join('')}
        </div>

        <!-- 난이도 정보 바 -->
        <div style="
          padding:7px 16px;flex-shrink:0;
          background:rgba(${_hexRgb(tDiff.color)},0.08);
          border-bottom:1px solid ${T.headerBorder};
          font-size:10px;color:#7a6a8a;
          display:flex;gap:10px;align-items:center;
        ">
          <span style="color:${tDiff.color};font-weight:700;">${tDiff.icon} ${isKo?tDiff.ko:tDiff.en}</span>
          <span>${isKo?`주무기 ${dc.slotMain}슬롯 · 동료 ${dc.slotComp}명`:`Main×${dc.slotMain} · Comp×${dc.slotComp}`}</span>
          <span>${isKo?'몹':'Mob'}×${dc.mobMult}</span>
          <span>${isKo?'골드':'Gold'}×${dc.goldMult}${dc.gemReward?(isKo?' · 💎보너스':' · 💎Bonus'):''}</span>
        </div>

        <!-- 스테이지 목록 -->
        <div style="flex:1;overflow-y:auto;padding:12px 14px;">
          ${stages.filter(ch => {
            const s = ch.season || 1;
            return s === selectedSeason;
          }).map((chapter, ci) => {
            const chUnlocked = isChapterUnlocked(chapter.chapter, selectedDiff);
            const chName = (isKo ? chapter.name : chapter.nameEn) || `Chapter ${chapter.chapter}`;
            const bossCleared = isCleared(getBossStageId(chapter.chapter), selectedDiff);
            const chColor = (T.chapterColors[ci % T.chapterColors.length]);
            const chBorder = chUnlocked
              ? (selectedSeason===2 ? 'rgba(80,100,200,0.25)' : 'rgba(200,160,255,0.2)')
              : 'rgba(255,255,255,0.05)';

            // 챕터 보스 이름 (보스 스테이지 = 마지막 스테이지)
            const bossStage   = chapter.stages.find(s => s.isBoss);
            const midBossStage = chapter.stages.find(s => s.isMidBoss);
            const bossName    = bossStage   ? (isKo ? bossStage.name   : bossStage.nameEn)   : '';
            const midBossName = midBossStage ? (isKo ? midBossStage.name : midBossStage.nameEn) : '';

            return `
            <div style="margin-bottom:14px;">
              <!-- 챕터 헤더 -->
              <div style="
                background:${chColor};
                border:1px solid ${chBorder};
                border-radius:10px 10px 0 0;
                padding:8px 12px;
              ">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:10px;color:${T.chapterLabel};letter-spacing:.1em;">
                    Ch.${chapter.chapter}
                  </span>
                  <span style="font-size:13px;color:${chUnlocked?T.chNameColor:'#4a3a4a'};font-weight:700;">
                    ${chName}
                  </span>
                  ${bossCleared ? `<span style="margin-left:auto;font-size:11px;color:${tDiff.color};">✓ ${isKo?'클리어':'Cleared'}</span>` : ''}
                  ${!chUnlocked ? `<span style="margin-left:auto;font-size:10px;color:#4a3a4a;">🔒 ${isKo?'잠김':'Locked'}</span>` : ''}
                </div>
                ${chUnlocked && (bossName||midBossName) ? `
                <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;">
                  ${midBossName ? `<span style="font-size:9px;color:${selectedSeason===2?'#7080c0':'#c0a040'};background:rgba(0,0,0,0.3);padding:1px 6px;border-radius:4px;">⚔️ ${isKo?'미들':'Mid'}: ${midBossName}</span>` : ''}
                  ${bossName    ? `<span style="font-size:9px;color:${selectedSeason===2?'#9060d0':'#d04040'};background:rgba(0,0,0,0.3);padding:1px 6px;border-radius:4px;">💀 ${isKo?'보스':'Boss'}: ${bossName}</span>` : ''}
                </div>` : ''}
              </div>

              <!-- 스테이지 그리드 -->
              <div style="
                display:grid;grid-template-columns:repeat(5,1fr);gap:5px;
                padding:8px;
                background:${T.gridBg};
                border:1px solid ${T.gridBorder};border-top:none;
                border-radius:0 0 10px 10px;
              ">
                ${chapter.stages.map(stage => {
                  const unlocked = chUnlocked && isStageUnlocked(stage.id, selectedDiff, chapter.chapter);
                  const cleared  = chUnlocked && isCleared(stage.id, selectedDiff);
                  const ch = chapter.chapter;
                  const isSeason2Stage = (selectedSeason === 2);
                  const entryCost = isSeason2Stage ? (dc.s2EntryCost || 1) : 0;
                  const ownedCws = saveData.chaewonseok || 0;
                  const canAfford = !isSeason2Stage || ownedCws >= entryCost;

                  // 카드 프레임 이미지
                  const cardSrc = stage.isBoss    ? (SPRITES?.stage?.card_boss?.src    || '')
                                : stage.isMidBoss ? (SPRITES?.stage?.card_midboss?.src || '')
                                : selectedSeason===2 ? (SPRITES?.stage?.card_s2_normal?.src || '')
                                :                   (SPRITES?.stage?.card_normal?.src  || '');

                  // 보스/미들보스 초상화
                  const portraitKey = stage.isBoss    ? `ch${ch}_boss`
                                    : stage.isMidBoss ? `ch${ch}_midboss`
                                    : null;
                  const portraitSrc = portraitKey ? (SPRITES?.bosses?.[portraitKey]?.src || '') : '';

                  // 이미지 없을 때 폴백 배경 (시즌별 색상)
                  const fallbackBg = stage.isBoss
                    ? (selectedSeason===2 ? 'rgba(40,20,80,0.8)' : 'rgba(80,20,20,0.7)')
                    : stage.isMidBoss
                    ? (selectedSeason===2 ? 'rgba(20,20,60,0.7)' : 'rgba(60,40,10,0.7)')
                    : (selectedSeason===2 ? 'rgba(10,15,35,0.6)' : 'rgba(20,15,40,0.5)');

                  const stageIcon = stage.isBoss    ? (selectedSeason===2?'💀':'👹')
                                  : stage.isMidBoss ? (selectedSeason===2?'☠️':'⚔️')
                                  : '';

                  // 잠금/클리어 오버레이
                  const overlayColor = !unlocked ? 'rgba(0,0,0,0.65)'
                                     : cleared   ? `rgba(${_hexRgb(tDiff.color)},0.2)`
                                     : 'transparent';

                  const canEnter = unlocked && canAfford;
                  return `
                    <button
                      onclick="${canEnter ? `StageSelectScene.startStage(${stage.id})` : ''}"
                      ${!canEnter ? 'disabled' : ''}
                      style="
                        position:relative;padding:0;min-height:${stage.isBoss||stage.isMidBoss?68:56}px;
                        background:${cardSrc?'transparent':fallbackBg};
                        border:1px solid ${stage.isBoss?(selectedSeason===2?'rgba(100,60,180,0.5)':'rgba(180,40,40,0.4)'):stage.isMidBoss?(selectedSeason===2?'rgba(60,60,160,0.4)':'rgba(160,120,20,0.4)'):'rgba(255,255,255,0.04)'};
                        border-radius:6px;cursor:${canEnter?'pointer':'default'};
                        overflow:hidden;font-family:inherit;
                      ">
                      ${cardSrc ? `<img src="${cardSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block;">` : ''}
                      ${portraitSrc && (stage.isBoss||stage.isMidBoss) ? `<img src="${portraitSrc}" style="position:absolute;bottom:9px;left:50%;transform:translateX(-50%);height:${stage.isBoss?82:68}%;width:auto;object-fit:contain;image-rendering:pixelated;">` : ''}
                      ${stageIcon && !portraitSrc ? `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);font-size:${stage.isBoss?20:16}px;z-index:1;">${stageIcon}</span>` : ''}
                      <div style="position:absolute;inset:0;background:${overlayColor};border-radius:6px;"></div>
                      <span style="position:absolute;bottom:0px;left:0;right:0;text-align:center;z-index:1;font-size:9px;color:${unlocked?T.stageNumColor:'rgba(255,255,255,0.25)'};font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,0.9);padding-bottom:2px;">${stage.id}</span>
                      ${cleared ? `<span style="position:absolute;top:2px;right:3px;font-size:9px;color:${tDiff.color};z-index:2;text-shadow:0 1px 2px #000;">✓</span>` : ''}
                      ${!unlocked ? `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:12px;z-index:2;">🔒</span>` : ''}
                      ${unlocked && isSeason2Stage ? `<span style="position:absolute;top:2px;left:2px;font-size:8px;font-weight:700;color:${canAfford?'#80c8ff':'#ff6060'};text-shadow:0 1px 2px #000;z-index:2;line-height:1;">🔷${entryCost}</span>` : ''}
                      ${unlocked && !canAfford ? `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;z-index:3;background:rgba(0,0,0,0.5);">🔷부족</span>` : ''}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  function setDiff(diff) {
    selectedDiff = diff;
    const el = document.getElementById('app');
    if (el) render(el);
  }

  function setSeason(season) {
    selectedSeason = season;
    const el = document.getElementById('app');
    if (el) render(el);
  }

  function startStage(id) {
    SceneManager.go('game', { stageId: id, difficulty: selectedDiff });
  }

  function enter(el) {
    saveData = Save.load();
    if (StageSelectScene._initSeason) {
      selectedSeason = StageSelectScene._initSeason;
      StageSelectScene._initSeason = null;
    }
    render(el);
  }

  function exit() {}

  return { enter, exit, setDiff, setSeason, startStage, DIFF_CONFIG };
})();
