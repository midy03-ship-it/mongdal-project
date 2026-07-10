// lang.js - 언어 텍스트 중앙 관리
const Lang = (() => {

  let current = 'ko'; // 기본값

  const TEXT = {
    ko: {
      // ── 언어 선택 ──
      langSelect: {
        title: '언어를 선택하세요',
        ko: '한국어',
        en: 'English',
      },

      // ── 인트로 슬라이드 ──
      intro: [
        { lines: ['먼 옛날,', '인간과 귀신이 함께 살던 나라가 있었다.'] },
        { lines: ['귀-인-국 (鬼人國)', '신령이 균형을 잡고,', '귀인이 인간과 함께 살아가던 세상.'], accent: true },
        { lines: ['그러나...', '하늘 밖에서 정체불명의 존재가 왔다.'] },
        { lines: ['기어오는 혼돈.', '세상의 법칙을 뒤틀어버리는 외신.', '귀-인-국은 무너졌다.'], shake: true },
        { lines: ['모든 것이 폐허가 된 지금,', '삼신할머니가 마지막 무당을 깨웠다.'] },
        { lines: ['"애기씨,"', '"흩어진 귀-인을 모아라."', '"멸망한 나라를 되살려라."'], accent: true },
        { lines: ['기어오는 혼돈을 봉인하고,', '귀-인-국을 다시 세울 자.', '그것이 당신이다.'] },
      ],

      // ── 공통 UI ──
      ui: {
        skip:        'SKIP',
        tapToStart:  '✦ 터치하여 시작 ✦',
        settings:    '설정',
        language:    '언어',
        back:        '뒤로',
        confirm:     '확인',
        cancel:      '취소',
        gold:        '골드',
        gem:         '보석',
      },

      // ── 네비 ──
      nav: {
        stage:       '스테이지',
        daejanggan:  '대장간',
        companion:   '의원당',
        weapon:      '서낭당',
        building:    '장승당',
        pet:         '펫',
        petTooltip:  '용왕연못',
        player:      '캐릭터',
        sinmok:      '신목',
      },
      onboarding: { // [UPDATE 2026-07-09] 초반 온보딩 유도 문구
        tapStage: '여기를 눌러봐!',
        tapStage1: '스테이지 1을 눌러봐!',
      },
      currency: {
        gold:           '골드',
        gems:           '다이아',
        ganghwaseok:    '강화석',
        cheonunseok:    '천운석',
        cheonryeonggwa: '천령과',
        taegeukseok:    '태극석',
        chaewonseok:    '차원석',
      },
      dungeon: {
        ganghwaseok:    '강화석 던전',
        infinite:       '무한 던전',
        bossrush:       '보스러쉬',
        cheonunseok:    '천운석 던전',
        cheonryeonggwa: '천령과 던전',
        taegeukseok:    '태극석 던전',
        title:          '던전',
        infiniteTitle:  '무한 모드',
        infiniteDesc:   '끝없는 파도를 버텨라',
        infiniteDetail: '⏱️ 시간 무제한 · 🪙 골드 드롭 2배',
        infiniteDetail2:'파도가 지날수록 적이 강해진다. 얼마나 버틸 수 있을까?',
        bestRecord:     '최고 기록',
        noRecord:       '없음',
        enter:          '입장 →',
        bossRushTitle:  '보스 러쉬',
        bossRushDesc:   '역대 보스들과 연속 격돌',
        bossRushDetail: '💎 보스 처치마다 다이아 획득',
        bossRushDetail2:'10명의 보스가 기다린다. 쓰러지면 그게 끝.',
        bossRecord:     '보스',
        totalGem:       '총 획득',
        hint:           '던전은 스테이지 클리어와 별개로 언제든 도전 가능',
        back:           '← 귀환',
        minSec:         '분',
        sec:            '초',
      },

      // ── 로비 ──
      lobby: {
        enterBuilding:     '▲ 진입',
        locked:            '🔒',
        slotUnlockedTitle: '슬롯 해금!',
        slotExpandedMsg:   '{n}개로 늘어났어요!',
        slotExpandedBody:  '주무기 · 동료 · 펫 슬롯이',
        slotConfirm:       '확인!',
        diffEasy:          '이지',
        diffNormal:        '노말',
        diffHard:          '하드',
      },

      // ── 업적 ──
      achievement: {
        title:          '🏆 업적',
        onceSect:       '◆ 일회성 업적',
        milestoneSect:  '◆ 누적 마일스톤',
        claim:          '수령',
        claimed:        '수령완료',
        claimAll:       '일괄수령',
        current:        '현재',
        first_win_name:         '첫 승리',
        first_win_desc:         '처음으로 스테이지를 클리어했다',
        first_lose_name:        '첫 패배',
        first_lose_desc:        '처음으로 쓰러졌다',
        first_boss_name:        '첫 보스 처치',
        first_boss_desc:        '처음으로 보스를 물리쳤다',
        first_companion_name:   '첫 동료',
        first_companion_desc:   '처음으로 동료를 편성했다',
        first_pet_name:         '첫 펫',
        first_pet_desc:         '처음으로 펫을 획득했다',
        first_building_name:    '첫 건물 강화',
        first_building_desc:    '처음으로 건물을 강화했다',
        first_evolve_name:      '첫 각성',
        first_evolve_desc:      '처음으로 무기를 각성시켰다',
        all_chapters_name:      '전 챕터 정복',
        all_chapters_desc:      '모든 챕터를 클리어했다',
        total_kills_name:       '총 처치 수',
        total_wins_name:        '총 클리어 수',
        total_runs_name:        '총 출격 수',
      },

      // ── 스테이지 ──
      chapters: [
        '잊혀진 무덤',
        '안개의 폐촌',
        '타락한 서낭당',
        '신령의 숲',
        '혼돈의 균열',
        '저승의 문턱',
        '공허의 탑',
        '망각의 바다',
        '외신의 영역',
        '귀인국의 심장',
      ],

      // ── 설정 메뉴 ──
      settingsMenu: {
        title:    '설정',
        language: '언어 설정',
        sound:    '효과음',
        bgm:      '배경음악',
        version:  '버전',
        tutorial: '도움말',
      },

      // ── 튜토리얼 ──
      tutorial: {
        title:   '몽달퇴마록 입문',
        skip:    '건너뛰기',
        prev:    '이전',
        next:    '다음',
        close:   '시작하기!',
        slide1_title: '🎮 이동과 전투',
        slide1_body:  '모바일: 화면 왼쪽 조이스틱으로 이동\nPC: 방향키 또는 WASD\n\n애기씨는 가장 가까운 적을 자동으로 공격합니다.\n살아남아 귀신들을 모두 퇴마하세요!',
        slide2_title: '⚔️ 무기 & 레벨업',
        slide2_body:  '적을 처치하면 경험치를 얻습니다.\n레벨업 시 무기를 선택하거나 강화할 수 있어요.\n\n무기를 3번 강화하면 더욱 강력한 형태로 진화합니다!',
        slide3_title: '👥 동료 & 펫',
        slide3_body:  '로비에서 동료와 펫을 편성할 수 있어요.\n\n동료: 함께 싸우며 공격, 방어, 회복 등 역할 담당\n펫: 수동적 능력치 강화 또는 특수 능력 발동',
        slide4_title: '🏛️ 건물 업그레이드',
        slide4_body:  '로비의 건물을 클릭하면 골드로 업그레이드할 수 있어요.\n\n업그레이드하면 체력, 공격력, 골드 획득 등\n영구적으로 능력치가 강화됩니다!',
      },

      // ── 동료 화면 ──
      character: {
        title:       '동료',
        formation:   '편성',
        emptySlot:   '빈 슬롯',
        owned:       '보유 동료',
        active:      '편성됨',
        back:        '← 귀환',
        deploy:           '편성',
        shopBtn:          '🎪 동료 상점 (뽑기) →',
        nextAwakening:    '다음',
        fragCount:        '파편',
        canSummon:        '소환 가능!',
        summonBtn:        '🎴 파편 10개로 소환',
        uniFragBtn:       '✨ 만능파편 5개 → 별 추가',
        awoken:           '각성',
        slotUnlockNormal: '노말 해금',
        slotUnlockHard:   '하드 해금',
        rarity_common:    '커먼',
        rarity_rare:      '레어',
        rarity_epic:      '에픽',
        rarity_special:   '★스페셜',
        role_tank:      '탱커',
        role_dps:       '딜러',
        role_healer:    '힐러',
        role_support:   '서포터',
        role_assassin:  '암살자',
      },

      // ── 캐릭터(플레이어) 화면 ──
      player: {
        title:         '캐릭터',
        charName:      '애기씨',
        charSubtitle:  '마지막 무당',
        upgradeHint:   '로비에서 골드로 영구 강화 가능',
        mainWeapon:    '주무기',
        weaponLocked:  '🔒 스테이지 10 클리어 시 주무기를 변경할 수 있습니다.',
        equipped:      '장착중',
        statSection:   '스탯 & 강화',
        upgradeBtn:    '강화',
        upgraded:      '강화됨',
        upgradeHintFooter: '인게임 레벨업 시 스탯 자동 상승 · 런 종료 후 초기화',
        upgradeFooter2:    '골드 강화는 영구 적용',
        back:          '← 귀환',
        slotLabel:     '주무기 슬롯',
        slotDeselect:  '(클릭해서 해제)',
        stat_atk: { label:'공격력',   desc:'무기 피해량 증가' },
        stat_spd: { label:'공격속도', desc:'무기 쿨타임 단축' },
        stat_mov: { label:'이동속도', desc:'플레이어 이동 속도' },
        stat_def: { label:'방어력',   desc:'받는 피해 감소' },
        stat_eva: { label:'회피율',   desc:'피해 회피 확률 (최대 40%)' },
      },

      // ── 신목 강화 ──
      sinmok: {
        title:           '🌳 신목 영구강화',
        locked:          '(스테이지 30 클리어 해금)',
        current:         '현재',
        stat_critChance: '치명타 확률',
        stat_critMult:   '치명타 배율',
        stat_atkSpd:     '공격속도',
        stat_movSpd:     '이동속도',
        stat_evasion:    '회피율',
      },

      // ── 펫 화면 ──
      pet: {
        title:       '펫',
        formation:   '편성',
        emptySlot:   '빈 슬롯',
        activeEffect:'현재 적용 효과',
        owned:       '보유 펫',
        active:      '편성됨',
        back:        '← 귀환',
      },

      // ── 건물 화면 ──
      building: {
        title:        '건물',
        restoreStatus:'귀-인-국 복원 현황',
        current:      '현재',
        build:        '건설',
        maxLevel:     '✨ 신령화 완성 ✨',
        back:         '← 귀환',
        level_0: '폐허',
        level_1: '복구',
        level_2: '활성화',
        level_3: '축복',
        level_4: '신령화',
        noEffect:     '효과 없음',
        specialEffect:'특수 효과',
        eff_atk:      '공격력',
        eff_hp:       '최대HP',
        eff_xp:       '경험치',
        eff_weapon:   '런 시작 시 무기',
        eff_weaponRare:'(희귀 포함)',
        eff_select:   '개 선택',
        eff_afterRun: '런 종료 후 HP',
        eff_revive:   '부활권 지급',
        eff_autoRevive:'자동 부활',
        eff_compAtk:  '동료 공격력',
        eff_compHp:   '동료 HP',
        eff_petSlot:  '펫 슬롯',
        eff_petMult:  '펫 효과',
      },

      // ── 로비 다이얼로그 ──
      lobbyDialogue: {
        resolve:       '내가... 모두를... 반드시...!',
        firstClear:    '좋아! 이렇게 하나씩 하는거야!',
        unlock_5:      '대장간이 열렸어!',
        unlock_10:     '동료를 구했어!',
        unlock_15:     '미궁이 구했어!',
        unlock_20:     '건물 강화가 가능해!',
        unlock_25:     '동물 동료를 구했어!',
        unlock_30:     '마침내... 드디어.. 모두를!!!!',
      },

    },

    en: {
      // ── 언어 선택 ──
      langSelect: {
        title: 'Select Language',
        ko: '한국어',
        en: 'English',
      },

      // ── 인트로 슬라이드 ──
      intro: [
        { lines: ['Long ago,', 'there was a kingdom where humans and spirits lived together.'] },
        { lines: ['Gwi-In-Guk (鬼人國)', 'Where divine spirits kept the balance,', 'and the Gwi-In walked alongside the living.'], accent: true },
        { lines: ['But then...', 'An unknown force arrived from beyond the sky.'] },
        { lines: ['The Creeping Chaos.', 'A god that twists the very laws of existence.', 'Gwi-In-Guk fell.'], shake: true },
        { lines: ['Now, as all lies in ruin,', 'the Grandmother of Fate has awakened the last shaman.'] },
        { lines: ['"Aegissi,"', '"Gather the scattered Gwi-In."', '"Restore the fallen kingdom."'], accent: true },
        { lines: ['To seal the Creeping Chaos,', 'to rebuild Gwi-In-Guk —', 'that is your destiny.'] },
      ],

      // ── 공통 UI ──
      ui: {
        skip:        'SKIP',
        tapToStart:  '✦ Tap to Start ✦',
        settings:    'Settings',
        language:    'Language',
        back:        'Back',
        confirm:     'OK',
        cancel:      'Cancel',
        gold:        'Gold',
        gem:         'Gem',
      },

      // ── 네비 ──
      nav: {
        stage:       'Stage',
        daejanggan:  'Blacksmith',
        companion:   'Clinic',
        weapon:      'Shrine',
        building:    'Totem Hall',
        pet:         'Pet',
        petTooltip:  'Dragon Pond',
        player:      'Character',
        sinmok:      'Sacred Tree',
      },
      onboarding: { // [UPDATE 2026-07-09]
        tapStage: 'Tap here!',
        tapStage1: 'Try Stage 1!',
      },
      currency: {
        gold:           'Gold',
        gems:           'Diamonds',
        ganghwaseok:    'Enhancement Stone',
        cheonunseok:    'Heavenly Stone',
        cheonryeonggwa: 'Spirit Fruit',
        taegeukseok:    'Taeguk Stone',
        chaewonseok:    'Dimensional Stone',
      },
      dungeon: {
        ganghwaseok:    'Enhancement Dungeon',
        infinite:       'Infinite Dungeon',
        bossrush:       'Boss Rush',
        cheonunseok:    'Heavenly Stone Dungeon',
        cheonryeonggwa: 'Spirit Fruit Dungeon',
        taegeukseok:    'Taeguk Stone Dungeon',
        title:          'Dungeon',
        infiniteTitle:  'Endless Mode',
        infiniteDesc:   'Survive endless waves',
        infiniteDetail: '⏱️ No time limit · 🪙 2× Gold drop',
        infiniteDetail2:'Enemies grow stronger each wave. How long can you last?',
        bestRecord:     'Best',
        noRecord:       'None',
        enter:          'Enter →',
        bossRushTitle:  'Boss Rush',
        bossRushDesc:   'Face all bosses back-to-back',
        bossRushDetail: '💎 Earn Diamonds per boss defeated',
        bossRushDetail2:'10 bosses await. Fall once, and it\'s over.',
        bossRecord:     'bosses',
        totalGem:       'Total',
        hint:           'Dungeons can be challenged anytime, separate from Stages',
        back:           '← Back',
        minSec:         'm',
        sec:            's',
      },

      // ── 로비 ──
      lobby: {
        enterBuilding:     '▲ Enter',
        locked:            '🔒',
        slotUnlockedTitle: 'Slot Unlocked!',
        slotExpandedMsg:   'expanded to {n}!',
        slotExpandedBody:  'Weapon · Ally · Pet slots',
        slotConfirm:       'OK!',
        diffEasy:          'Easy',
        diffNormal:        'Normal',
        diffHard:          'Hard',
      },

      // ── 업적 ──
      achievement: {
        title:          '🏆 Achievements',
        onceSect:       '◆ One-time',
        milestoneSect:  '◆ Milestones',
        claim:          'Claim',
        claimed:        'Claimed',
        claimAll:       'Claim All',
        current:        'Current',
        first_win_name:         'First Victory',
        first_win_desc:         'Cleared a stage for the first time',
        first_lose_name:        'First Defeat',
        first_lose_desc:        'Fell in battle for the first time',
        first_boss_name:        'First Boss Kill',
        first_boss_desc:        'Defeated a boss for the first time',
        first_companion_name:   'First Companion',
        first_companion_desc:   'Deployed an ally for the first time',
        first_pet_name:         'First Pet',
        first_pet_desc:         'Obtained a pet for the first time',
        first_building_name:    'First Upgrade',
        first_building_desc:    'Upgraded a building for the first time',
        first_evolve_name:      'First Awakening',
        first_evolve_desc:      'Awakened a weapon for the first time',
        all_chapters_name:      'All Chapters',
        all_chapters_desc:      'Cleared all chapters',
        total_kills_name:       'Total Kills',
        total_wins_name:        'Total Clears',
        total_runs_name:        'Total Runs',
      },

      // ── 스테이지 ──
      chapters: [
        'The Forgotten Grave',
        'Village of Mist',
        'The Corrupted Shrine',
        'Forest of Spirits',
        'The Rift of Chaos',
        'Gates of the Underworld',
        'Tower of the Void',
        'Sea of Oblivion',
        'Realm of the Outer God',
        'Heart of Gwi-In-Guk',
      ],

      // ── 설정 메뉴 ──
      settingsMenu: {
        title:    'Settings',
        language: 'Language',
        sound:    'Sound FX',
        bgm:      'Music',
        version:  'Version',
        tutorial: 'Help',
      },

      // ── Tutorial ──
      tutorial: {
        title:   'How to Play',
        skip:    'Skip',
        prev:    'Back',
        next:    'Next',
        close:   "Let's Go!",
        slide1_title: '🎮 Movement & Combat',
        slide1_body:  'Mobile: Use the joystick on the left side\nPC: Arrow keys or WASD\n\nAegissi attacks the nearest enemy automatically.\nSurvive and exorcise all the spirits!',
        slide2_title: '⚔️ Weapons & Level Up',
        slide2_body:  'Defeating enemies grants experience points.\nOn level up, choose or upgrade a weapon.\n\nUpgrading a weapon 3 times makes it evolve into a more powerful form!',
        slide3_title: '👥 Allies & Pets',
        slide3_body:  'Form a party with allies and pets from the lobby.\n\nAllies: fight alongside you — attacking, defending, healing\nPets: grant passive stat boosts or trigger special abilities',
        slide4_title: '🏛️ Building Upgrades',
        slide4_body:  'Click any building in the lobby to upgrade it with gold.\n\nUpgrades permanently increase stats like\nHP, attack power, and gold earnings!',
      },

      // ── 동료 화면 ──
      character: {
        title:       'Allies',
        formation:   'Party',
        emptySlot:   'Empty',
        owned:       'Allies',
        active:      'Active',
        back:        '← Back',
        deploy:           'Deploy',
        shopBtn:          '🎪 Companion Shop (Gacha) →',
        nextAwakening:    'Next',
        fragCount:        'Shards',
        canSummon:        'Summon ready!',
        summonBtn:        '🎴 Summon (10 Shards)',
        uniFragBtn:       '✨ All-Frag ×5 → Star Up',
        awoken:           'Awoken',
        slotUnlockNormal: 'Normal Unlock',
        slotUnlockHard:   'Hard Unlock',
        rarity_common:    'Common',
        rarity_rare:      'Rare',
        rarity_epic:      'Epic',
        rarity_special:   '★Special',
        role_tank:      'Tank',
        role_dps:       'DPS',
        role_healer:    'Healer',
        role_support:   'Support',
        role_assassin:  'Assassin',
      },

      // ── 캐릭터(플레이어) 화면 ──
      player: {
        title:         'Character',
        charName:      'Aegissi',
        charSubtitle:  'The Last Shaman',
        upgradeHint:   'Permanently upgradeable with Gold in the Lobby',
        mainWeapon:    'Main Weapon',
        weaponLocked:  '🔒 Clear Stage 10 to change your main weapon.',
        equipped:      'Equipped',
        statSection:   'Stats & Upgrades',
        upgradeBtn:    'Upgrade',
        upgraded:      'upgraded',
        upgradeHintFooter: 'Stats auto-increase on level-up · Reset after each run',
        upgradeFooter2:    'Gold upgrades are permanent',
        back:          '← Back',
        stat_atk: { label:'ATK',    desc:'Increases weapon damage' },
        stat_spd: { label:'SPD',    desc:'Reduces weapon cooldown' },
        stat_mov: { label:'MOV',    desc:'Player movement speed' },
        stat_def: { label:'DEF',    desc:'Reduces damage taken' },
        stat_eva: { label:'EVA',    desc:'Chance to evade damage (max 40%)' },
        slotLabel:     'Weapon Slot',
        slotDeselect:  '(click to deselect)',
      },

      // ── 신목 강화 ──
      sinmok: {
        title:           '🌳 Sacred Tree Upgrades',
        locked:          '(Unlock: Clear Stage 30)',
        current:         'Current',
        stat_critChance: 'Crit Chance',
        stat_critMult:   'Crit Mult',
        stat_atkSpd:     'Atk Speed',
        stat_movSpd:     'Mov Speed',
        stat_evasion:    'Evasion',
      },

      // ── 펫 화면 ──
      pet: {
        title:       'Pets',
        formation:   'Party',
        emptySlot:   'Empty',
        activeEffect:'Active Effects',
        owned:       'Pets',
        active:      'Active',
        back:        '← Back',
      },

      // ── 건물 화면 ──
      building: {
        title:        'Buildings',
        restoreStatus:'Gwi-In-Guk Restoration',
        current:      'Current',
        build:        'Build',
        maxLevel:     '✨ Fully Restored ✨',
        back:         '← Back',
        level_0: 'Ruins',
        level_1: 'Repaired',
        level_2: 'Active',
        level_3: 'Blessed',
        level_4: 'Divine',
        noEffect:     'No Effect',
        specialEffect:'Special Effect',
        eff_atk:      'ATK',
        eff_hp:       'Max HP',
        eff_xp:       'EXP',
        eff_weapon:   'Start run with',
        eff_weaponRare:'(incl. rare)',
        eff_select:   'weapon(s)',
        eff_afterRun: 'HP after run',
        eff_revive:   'Revive token',
        eff_autoRevive:'Auto-revive',
        eff_compAtk:  'Ally ATK',
        eff_compHp:   'Ally HP',
        eff_petSlot:  'Pet slots',
        eff_petMult:  'Pet effects',
      },

      // ── 로비 다이얼로그 ──
      lobbyDialogue: {
        resolve:       "I'll protect them... every last one...!",
        firstClear:    'Yes! One down, many to go!',
        unlock_5:      'The Forge is open!',
        unlock_10:     'A companion joins me!',
        unlock_15:     'The Dungeon unlocked!',
        unlock_20:     'Village upgrades available!',
        unlock_25:     'A creature joins my side!',
        unlock_30:     'At last... I saved them all!!!!',
      },

    },
  };

  function set(lang) {
    if (TEXT[lang]) {
      current = lang;
      Save.setLang(lang);
    }
  }

  function get(path) {
    // 'intro.0.lines' 같은 점 표기법 지원
    const keys = path.split('.');
    let val = TEXT[current];
    for (const k of keys) {
      if (val === undefined) return path;
      val = isNaN(k) ? val[k] : val[parseInt(k)];
    }
    return val ?? path;
  }

  // 단축 접근
  function t(section, key) {
    return TEXT[current]?.[section]?.[key] ?? key;
  }

  function init() {
    current = Save.getLang() || 'ko';
  }

  function getCurrent() { return current; }
  function getSlides()  { return TEXT[current].intro; }

  return { set, get, t, init, getCurrent, getSlides };
})();
