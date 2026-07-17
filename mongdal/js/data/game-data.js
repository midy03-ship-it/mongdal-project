// game-data.js - 게임 데이터 (fetch 불필요, 직접 내장)
const GAME_DATA = {
  companions: [
    { id:"dochi",    name:"장승 지킴이",        nameEn:"Jangseung Guardian",      role:"tank",     rarity:"uncommon", element:"earth", // [UPDATE 2026-07-11] 260711_MTOPC.md 1번: 검객 도치 → 장승 지킴이
      desc:"민첩한 움직임과 견고한 방어로 아군을 수호하는 든든한 호위.",
      descEn:"A steadfast guardian who protects allies with swift movements and iron defense.",
      color:"#4a90d9", spriteX:336, spriteY:0,   spriteW:168, spriteH:220,
      awakening:[
        { star:1, label:'공격속도 +15%',            labelEn:'Atk Speed +15%',              type:'atkSpeed',  val:0.15 },
        { star:2, label:'공격 범위 +30%',           labelEn:'Atk Range +30%',              type:'range',     val:0.30 },
        { star:3, label:'방어막 지속 +1초',         labelEn:'Shield Duration +1s',         type:'shieldDur', val:1.0  },
        { star:4, label:'연속 2타 공격',            labelEn:'Double Strike',               type:'doubleHit', val:true },
        { star:5, label:'처형기: HP 15% 이하 즉사', labelEn:'Execute: Instant Kill <15% HP', type:'execute', val:0.15 },
      ]},
    { id:"aram",     name:"매 사냥꾼 아람",      nameEn:"Falconer Aram",           role:"dps",      rarity:"uncommon", element:"wood",
      desc:"날카로운 눈과 빠른 사격으로 적의 약점을 찌르는 원거리 딜러.",
      descEn:"A ranged dealer who pierces enemy weak points with sharp eyes and rapid shots.",
      color:"#7ab648", spriteX:672, spriteY:0,   spriteW:168, spriteH:220,
      awakening:[
        { star:1, label:'화살 +1발',              labelEn:'+1 Arrow',              type:'projCount', val:1    },
        { star:2, label:'관통 +2',                labelEn:'Pierce +2',             type:'pierce',    val:2    },
        { star:3, label:'공격속도 +20%',          labelEn:'Atk Speed +20%',        type:'atkSpeed',  val:0.20 },
        { star:4, label:'유도 화살',              labelEn:'Homing Arrow',          type:'homing',    val:true },
        { star:5, label:'3연사 폭발 화살',        labelEn:'Triple Burst Arrow',    type:'rapidFire', val:true },
      ]},
    { id:"ggeogsoe", name:"도깨비 수리공 꺽쇠",  nameEn:"Goblin Mechanic Ggeoksoe", role:"support",  rarity:"common", element:"fire",
      desc:"기상천외한 발명품으로 아군을 지원하고 전장을 통제하는 괴짜.",
      descEn:"A quirky inventor who supports allies and controls the battlefield with outlandish gadgets.",
      color:"#e8a020", spriteX:0,   spriteY:350, spriteW:230, spriteH:280,
      awakening:[
        { star:1, label:'폭탄 범위 +25%',         labelEn:'Bomb Range +25%',       type:'range',     val:0.25 },
        { star:2, label:'폭탄 수 +1',             labelEn:'+1 Bomb',               type:'projCount', val:1    },
        { star:3, label:'둔화 지속 +2초',         labelEn:'Slow Duration +2s',     type:'slowDur',   val:2.0  },
        { star:4, label:'화염 폭탄',              labelEn:'Fire Bomb',             type:'fireBomb',  val:true },
        { star:5, label:'광역 대폭발',            labelEn:'Mega Explosion',        type:'superBomb', val:true },
      ]},
    // [UPDATE 2026-07-17] 도깨비 계열 신규 동료 2종 (박수/장구애비) — 히든 시너지: hidden.md 참고
    { id:"baksu",    name:"애기 도깨비 박수",     nameEn:"Baby Dokkaebi Shaman Baksu", role:"mage",    rarity:"common", element:"wood",
      desc:"말썽꾸러기 아기 도깨비 박수. 방울과 부적으로 서투른 굿을 흉내내지만 의외로 위력은 진짜다.",
      descEn:"A mischievous baby dokkaebi shaman who play-acts rituals with bells and talismans — clumsy, but surprisingly effective.",
      color:"#9060d0",
      awakening:[
        { star:1, label:'마법 투사체 +1발',      labelEn:'+1 Magic Projectile',   type:'projCount',  val:1    },
        { star:2, label:'관통 +2',              labelEn:'Pierce +2',             type:'pierce',     val:2    },
        { star:3, label:'공격속도 +20%',        labelEn:'Atk Speed +20%',        type:'atkSpeed',   val:0.20 },
        { star:4, label:'치명타율 +20%',        labelEn:'Crit Rate +20%',        type:'critRate',   val:0.20 },
        { star:5, label:'쿨타임 -30%',          labelEn:'Cooldown -30%',         type:'cooldown',   val:0.30 },
      ]},
    { id:"janggu_aebi", name:"응원 단장 장구애비", nameEn:"Cheer Captain Janggu-aebi", role:"support", rarity:"uncommon", element:"metal",
      desc:"장구와 꽹과리로 흥을 돋우는 응원단장. 신명나는 장단이 아군의 사기를 끌어올린다.",
      descEn:"A cheer captain who rouses the crowd with drum and gong — the beat lifts allies' morale.",
      color:"#d0a030",
      awakening:[
        { star:1, label:'공격 범위 +25%',        labelEn:'Atk Range +25%',        type:'range',      val:0.25 },
        { star:2, label:'공격력 +20%',           labelEn:'ATK +20%',              type:'dmg',        val:0.20 },
        { star:3, label:'공격속도 +15%',         labelEn:'Atk Speed +15%',        type:'atkSpeed',   val:0.15 },
        { star:4, label:'쿨타임 -20%',           labelEn:'Cooldown -20%',         type:'cooldown',   val:0.20 },
        { star:5, label:'최대 HP +25%',          labelEn:'Max HP +25%',           type:'hp',         val:0.25 },
      ]},
    { id:"danbi",    name:"단비 무당",            nameEn:"Shaman Danbi",            role:"healer",   rarity:"uncommon", element:"water",
      desc:"신비로운 주술과 치유로 아군을 보호하고 상태 이상을 회복하는 영매.",
      descEn:"A spirit medium who protects allies and cures status effects with mystic rituals and healing.",
      color:"#c060d0", spriteX:336, spriteY:350, spriteW:168, spriteH:280,
      awakening:[
        { star:1, label:'회복량 +30%',            labelEn:'Heal Amount +30%',      type:'healAmt',    val:0.30 },
        { star:2, label:'쿨타임 -20%',            labelEn:'Cooldown -20%',         type:'cooldown',   val:0.20 },
        { star:3, label:'상태 이상 해제',         labelEn:'Cleanse Status',        type:'statusCure', val:true },
        { star:4, label:'아군 공격력 +15% (15초)', labelEn:'Ally ATK +15% (15s)',  type:'teamAtkBuff',val:0.15 },
        { star:5, label:'광역 힐 + 무적 2초',    labelEn:'AoE Heal + Invincible 2s', type:'massHeal', val:true },
      ]},
    { id:"gaon",     name:"그림자 암살자 가온",   nameEn:"Shadow Assassin Gaon",    role:"assassin", rarity:"uncommon", element:"water",
      desc:"어둠 속에서 은밀하게 움직이며 치명적인 일격을 가하는 암살자.",
      descEn:"An assassin who moves in darkness and delivers lethal strikes.",
      color:"#6060a0", spriteX:672, spriteY:350, spriteW:168, spriteH:280,
      awakening:[
        { star:1, label:'치명타율 +20%',          labelEn:'Crit Rate +20%',        type:'critRate',   val:0.20 },
        { star:2, label:'암습 피해 +50%',         labelEn:'Ambush Dmg +50%',       type:'dmg',        val:0.50 },
        { star:3, label:'스킬 쿨타임 -30%',      labelEn:'Skill Cooldown -30%',   type:'cooldown',   val:0.30 },
        { star:4, label:'2연타 암습',            labelEn:'Double Ambush',         type:'doubleHit',  val:true },
        { star:5, label:'3연속 순간이동 암살',   labelEn:'Triple Blink Assassination', type:'shadowStep', val:true },
      ]},
    // ── 스페셜 동료 ──
    { id:"cheonga",  name:"용왕녀 청아",    nameEn:"Dragon Princess Cheonga", role:"mage",      rarity:"rare", element:"water", // [UPDATE 2026-07-11] 오행: 이름(용=木)보다 능력(빙결)을 우선해 水로 배정
      desc:"용궁 깊은 곳에서 온 물의 마법사. 빙결 주문으로 적을 얼어붙게 한다.",
      descEn:"A water mage from the depths of the Dragon Palace who freezes foes with ice spells.",
      color:"#40c0ff",
      awakening:[
        { star:1, label:'마법 투사체 +1발',      labelEn:'+1 Magic Projectile',   type:'projCount',  val:1    },
        { star:2, label:'빙결 확률 +25%',        labelEn:'Freeze Chance +25%',    type:'freeze',     val:0.25 },
        { star:3, label:'관통 +3',              labelEn:'Pierce +3',             type:'pierce',     val:3    },
        { star:4, label:'쿨타임 -25% + 범위 +30%', labelEn:'Cooldown -25% + Range +30%', type:'mageBoost', val:true },
        { star:5, label:'용왕 빔 (전방 관통)',  labelEn:'Dragon King Beam (pierce)', type:'dragonBeam', val:true },
      ]},
    { id:"geumgang",name:"생령 역사",       nameEn:"Saengryeong Warrior",     role:"berserker", rarity:"unique", element:"wood", // [UPDATE 2026-07-11] 천계 역사 금강 → 생령 역사 (오행 木 배정, 기존 스프라이트는 火 색상이라 추후 hue-shift 보정 필요)
      desc:"천계의 역사(力士). 분노가 쌓일수록 무적에 가까운 힘을 발휘한다.",
      descEn:"A heavenly strongman who unleashes near-invincible power as rage builds.",
      color:"#ff8020",
      awakening:[
        { star:1, label:'공격력 +20%',           labelEn:'ATK +20%',                           type:'dmg',         val:0.20 },
        { star:2, label:'피격 반격 (반사 50%)',  labelEn:'Counter (Reflect 50%)',               type:'counterDmg',  val:0.50 },
        { star:3, label:'분노 상태 (HP 50%이하 공격력 +50%)', labelEn:'Berserk (below 50% HP: ATK +50%)', type:'berserk', val:0.50 },
        { star:4, label:'기파 폭발 (주변 범위)',  labelEn:'Ki Burst (AoE)',                     type:'aoeShockwave',val:true },
        { star:5, label:'완전 분노 (3초 무적 + 공격력 3배)', labelEn:'Full Rage (3s Invincible + ATK ×3)', type:'fullRage', val:true },
      ]},
    { id:"baekho",  name:"백호신",          nameEn:"White Tiger Spirit",       role:"tank",      rarity:"unique", element:"metal",
      desc:"서방 수호신 백호. 강력한 돌진으로 적의 대열을 무너뜨린다.",
      descEn:"The guardian spirit of the West. Charges through enemy lines with overwhelming force.",
      color:"#f0f0e0",
      awakening:[
        { star:1, label:'최대 HP +30%',          labelEn:'Max HP +30%',           type:'hp',          val:0.30 },
        { star:2, label:'돌진 쿨타임 -20%',      labelEn:'Charge Cooldown -20%',  type:'cooldown',    val:0.20 },
        { star:3, label:'피해 감소 +20%',        labelEn:'Damage Reduction +20%', type:'dmgReduction',val:0.20},
        { star:4, label:'돌진 기절 (2초)',       labelEn:'Charge Stun (2s)',      type:'dashStun',    val:2.0  },
        { star:5, label:'아군 방어막 (3초)',     labelEn:'Ally Shield (3s)',      type:'teamShield',  val:3.0  },
      ]},
    { id:"sohee",   name:"봉황 소희",       nameEn:"Phoenix Sohee",            role:"dps",       rarity:"rare", element:"fire",
      desc:"불사조의 화염을 다루는 용맹한 여전사. 불꽃이 닿는 모든 것을 태운다.",
      descEn:"A valiant warrior who wields phoenix flames, burning everything in her path.",
      color:"#ff6030",
      awakening:[
        { star:1, label:'화염 도트 +30%',        labelEn:'Fire DoT +30%',              type:'fireDot',     val:0.30 },
        { star:2, label:'화살 +1발',             labelEn:'+1 Arrow',                   type:'projCount',   val:1    },
        { star:3, label:'이동속도 감소 +30%',    labelEn:'Move Speed Slow +30%',       type:'slow',        val:0.30 },
        { star:4, label:'폭발 범위 +40%',        labelEn:'Explosion Range +40%',       type:'range',       val:0.40 },
        { star:5, label:'봉황 폭발 (광역 대화염)', labelEn:'Phoenix Explosion (massive AoE fire)', type:'phoenixBlast', val:true },
      ]},
    { id:"mugsa",   name:"신검 무사",       nameEn:"Divine Blade Warrior",     role:"dps",       rarity:"uncommon", element:"metal",
      desc:"하늘이 내린 신검을 휘두르는 검호. 일검에 전장을 가른다.",
      descEn:"A master swordsman wielding a heavenly blade, cleaving the battlefield in a single stroke.",
      color:"#c0c0ff",
      awakening:[
        { star:1, label:'베기 범위 +20%',        labelEn:'Slash Range +20%',      type:'range',         val:0.20 },
        { star:2, label:'공격속도 +15%',         labelEn:'Atk Speed +15%',        type:'atkSpeed',      val:0.15 },
        { star:3, label:'치명타 피해 2배',       labelEn:'Crit Damage ×2',        type:'critDoubleDmg', val:true },
        { star:4, label:'검기 발사 (원거리)',    labelEn:'Sword Beam (ranged)',    type:'swordBeam',     val:true },
        { star:5, label:'전체 베기 (화면 범위)', labelEn:'Full-Screen Slash',     type:'screenSlash',   val:true },
      ]},
    { id:"cheolgap",name:"수호신",          nameEn:"Guardian Spirit",          role:"tank",      rarity:"uncommon", element:"earth", // [UPDATE 2026-07-11] 철갑 수호신 → 수호신
      desc:"철갑으로 온몸을 감싼 불굴의 수호신. 아군의 최후 방어선이 된다.",
      descEn:"An indomitable guardian clad in iron armor, becoming the last line of defense for allies.",
      color:"#8090a0",
      awakening:[
        { star:1, label:'방어막 HP +50%',        labelEn:'Shield HP +50%',             type:'shieldHp',       val:0.50 },
        { star:2, label:'방어막 쿨타임 -25%',    labelEn:'Shield Cooldown -25%',       type:'cooldown',       val:0.25 },
        { star:3, label:'피해 반사 20%',         labelEn:'Damage Reflect 20%',         type:'shieldReflect',  val:0.20},
        { star:4, label:'아군 피해 감소 15%',    labelEn:'Ally Dmg Reduction 15%',     type:'teamDmgReduction',val:0.15},
        { star:5, label:'철벽 (5초 불사신)',     labelEn:'Iron Wall (Invincible 5s)',   type:'ironWall',       val:5.0  },
      ]},
    // ── [UPDATE 2026-07-06] 시즌2 유명계 동료 ──
    { id:"haewonmaek", name:"해원맥",       nameEn:"Haewonmaek",              role:"tank",      rarity:"rare", element:"fire",
      desc:"유명계의 길잡이. 쌍망치로 원귀들을 명부로 돌려보내는 저승의 무관.",
      descEn:"Guide of the Underworld. A netherworld officer who sends vengeful spirits back to the registry with twin hammers.",
      color:"#a04060",
      awakening:[
        { star:1, label:'최대 HP +30%',          labelEn:'Max HP +30%',           type:'hp',          val:0.30 },
        { star:2, label:'공격력 +25%',           labelEn:'ATK +25%',              type:'dmg',         val:0.25 },
        { star:3, label:'피해 감소 +20%',        labelEn:'Damage Reduction +20%', type:'dmgReduction',val:0.20 },
        { star:4, label:'연속 2타 강타',         labelEn:'Double Smash',          type:'doubleHit',   val:true },
        { star:5, label:'명부의 철퇴 (아군 방어막 3초)', labelEn:'Mortuary Hammer (Ally Shield 3s)', type:'teamShield', val:3.0 },
      ]},
    { id:"gangnim",   name:"강림차사",      nameEn:"Gangnim Chasa",           role:"assassin",  rarity:"unique", element:"metal",
      desc:"오염에서 정화된 저승차사. 생사부에 이름을 적어 혼을 거둔다.",
      descEn:"A reaper purified from corruption who claims souls by writing names in the Book of Life and Death.",
      color:"#404058",
      awakening:[
        { star:1, label:'치명타율 +25%',         labelEn:'Crit Rate +25%',        type:'critRate',    val:0.25 },
        { star:2, label:'암습 피해 +60%',        labelEn:'Ambush Dmg +60%',       type:'dmg',         val:0.60 },
        { star:3, label:'스킬 쿨타임 -30%',      labelEn:'Skill Cooldown -30%',   type:'cooldown',    val:0.30 },
        { star:4, label:'2연타 암습',            labelEn:'Double Ambush',         type:'doubleHit',   val:true },
        { star:5, label:'강림의 심판 (HP 20% 이하 즉사)', labelEn:'Judgment of Gangnim (Execute <20% HP)', type:'execute', val:0.20 },
      ]},
  ],

  // ── 스테이지 (챕터별 10스테이지, 킬 목표 300→750) ──
  // [UPDATE 2026-07-16] STAGE_DUNGEON_RULES.md §1-2: 킬타겟 전면 재계산 — 기존엔 시즌1/2만 리셋되고
  // 시즌3은 리셋 없이 이어붙어(550→1045) 불일치했음. 이제 모든 시즌 동일 등차수열로 통일:
  // killTarget(n) = round(50 + (n-1) × 236/99), n = 시즌 내 순번(1~100) → 시즌마다 50→286
  // isMidBoss: 5번째 스테이지 (index 4)
  // isBoss:    10번째 스테이지 (index 9)
  // 보스 스테이지: 킬카운트 달성 후 보스 스폰 → 보스 처치까지 클리어
  stages: [
    {
      chapter:1, name:'잊혀진 무덤', nameEn:'Forgotten Tomb',
      stages:[
        {id:1,  name:'버려진 공동묘지',       nameEn:'Abandoned Cemetery',         difficulty:1, killTarget:50},
        {id:2,  name:'망자의 길',             nameEn:'Path of the Dead',           difficulty:1, killTarget:52},
        {id:3,  name:'원귀의 숲',             nameEn:'Forest of Vengeful Spirits', difficulty:1, killTarget:55},
        {id:4,  name:'묘지기의 거처',         nameEn:"Gravedigger's Dwelling",     difficulty:2, killTarget:57},
        {id:5,  name:'봉인된 무덤',           nameEn:'Sealed Tomb',                difficulty:2, killTarget:60, isMidBoss:true},
        {id:6,  name:'떠도는 혼의 늪',        nameEn:'Swamp of Wandering Souls',   difficulty:2, killTarget:62},
        {id:7,  name:'원귀장의 영역',         nameEn:'Domain of the Ghost Lord',   difficulty:3, killTarget:64},
        {id:8,  name:'해골 병사의 요새',      nameEn:'Skeleton Soldier Fortress',  difficulty:3, killTarget:67},
        {id:9,  name:'장군의 기억',           nameEn:"General's Memory",           difficulty:3, killTarget:69},
        {id:10, name:'타락한 무당의 제단',    nameEn:"Corrupted Shaman's Altar",   difficulty:4, killTarget:71, isBoss:true},
      ]
    },
    {
      chapter:2, name:'안개의 폐촌', nameEn:'Misty Ruined Village',
      stages:[
        {id:11, name:'안개 낀 마을 입구',     nameEn:'Foggy Village Entrance',     difficulty:2, killTarget:74},
        {id:12, name:'빈 집들의 거리',        nameEn:'Street of Empty Houses',     difficulty:2, killTarget:76},
        {id:13, name:'우물가의 속삭임',       nameEn:'Whispers by the Well',       difficulty:2, killTarget:79},
        {id:14, name:'굶주린 혼의 들판',      nameEn:'Field of Hungry Souls',      difficulty:3, killTarget:81},
        {id:15, name:'우물귀신의 영역',       nameEn:'Domain of the Well Ghost',   difficulty:3, killTarget:83, isMidBoss:true},
        {id:16, name:'곡성의 밤',             nameEn:'Night of Wailing',           difficulty:3, killTarget:86},
        {id:17, name:'그림자 아이들',         nameEn:'Shadow Children',            difficulty:4, killTarget:88},
        {id:18, name:'우물귀신의 깊이',       nameEn:'Depths of the Well Ghost',   difficulty:4, killTarget:91},
        {id:19, name:'마을의 기억',           nameEn:'Village Memories',           difficulty:4, killTarget:93},
        {id:20, name:'창귀의 안개',           nameEn:"Changwi's Fog",              difficulty:5, killTarget:95, isBoss:true},
      ]
    },
    {
      chapter:3, name:'타락한 서낭당', nameEn:'Corrupted Shrine',
      stages:[
        {id:21, name:'오염된 제단 입구',      nameEn:'Defiled Altar Entrance',           difficulty:3, killTarget:98},
        {id:22, name:'타락한 신도의 거리',    nameEn:'Street of Corrupted Devotees',     difficulty:3, killTarget:100},
        {id:23, name:'저주받은 마을',         nameEn:'Cursed Village',                   difficulty:3, killTarget:102},
        {id:24, name:'인형들의 숲',           nameEn:'Forest of Dolls',                  difficulty:4, killTarget:105},
        {id:25, name:'타락한 장승의 영역',    nameEn:'Domain of the Corrupted Totem',    difficulty:4, killTarget:107, isMidBoss:true},
        {id:26, name:'불타는 서낭당',         nameEn:'Burning Shrine',                   difficulty:4, killTarget:110},
        {id:27, name:'저주의 중심',           nameEn:'Heart of the Curse',               difficulty:5, killTarget:112},
        {id:28, name:'타락한 제사터',         nameEn:'Corrupted Ritual Ground',          difficulty:5, killTarget:114},
        {id:29, name:'마지막 장승',           nameEn:'Last Guardian Totem',              difficulty:5, killTarget:117},
        {id:30, name:'두억시니의 제단',       nameEn:"Dueoksini's Altar",                difficulty:6, killTarget:119, isBoss:true},
      ]
    },
    {
      chapter:4, name:'신령의 숲', nameEn:'Spirit Forest',
      stages:[
        {id:31, name:'신령의 숲 입구',        nameEn:'Spirit Forest Entrance',          difficulty:4, killTarget:122},
        {id:32, name:'정령들의 영역',         nameEn:'Domain of Nature Spirits',        difficulty:4, killTarget:124},
        {id:33, name:'나무 정령의 숲',        nameEn:'Forest of Tree Spirits',          difficulty:4, killTarget:126},
        {id:34, name:'가면 여우의 길',        nameEn:'Path of the Masked Fox',          difficulty:5, killTarget:129},
        {id:35, name:'흑호의 영역',           nameEn:'Domain of the Black Tiger',       difficulty:5, killTarget:131, isMidBoss:true},
        {id:36, name:'신목의 깊은 곳',        nameEn:'Depths of the Sacred Tree',       difficulty:5, killTarget:133},
        {id:37, name:'잠든 신령의 전당',      nameEn:'Hall of Sleeping Spirits',        difficulty:6, killTarget:136},
        {id:38, name:'산신의 꿈속',           nameEn:"Inside the Mountain God's Dream", difficulty:6, killTarget:138},
        {id:39, name:'기억의 숲',             nameEn:'Forest of Memories',              difficulty:6, killTarget:141},
        {id:40, name:'장산범의 영지',         nameEn:"Jangsan Tiger's Domain",          difficulty:7, killTarget:143, isBoss:true},
      ]
    },
    {
      chapter:5, name:'혼돈의 균열', nameEn:'Rift of Chaos',
      stages:[
        {id:41, name:'균열의 입구',           nameEn:'Rift Entrance',           difficulty:5, killTarget:145},
        {id:42, name:'심연의 평원',           nameEn:'Abyss Plains',            difficulty:5, killTarget:148},
        {id:43, name:'혼돈의 바다',           nameEn:'Sea of Chaos',            difficulty:5, killTarget:150},
        {id:44, name:'눈들의 영역',           nameEn:'Domain of the Eyes',      difficulty:6, killTarget:153},
        {id:45, name:'왜곡자의 공간',         nameEn:"Distorter's Space",       difficulty:6, killTarget:155, isMidBoss:true},
        {id:46, name:'붕괴된 현실',           nameEn:'Collapsed Reality',       difficulty:6, killTarget:157},
        {id:47, name:'외신의 발자국',         nameEn:"Outer God's Footsteps",   difficulty:7, killTarget:160},
        {id:48, name:'차원의 경계',           nameEn:'Dimensional Boundary',    difficulty:7, killTarget:162},
        {id:49, name:'혼돈의 심장부',         nameEn:'Heart of Chaos',          difficulty:7, killTarget:164},
        {id:50, name:'구미호의 왕좌',         nameEn:"Nine-Tailed Fox's Throne",difficulty:8, killTarget:167, isBoss:true},
      ]
    },
    {
      chapter:6, name:'저승의 문', nameEn:'Gate of the Underworld',
      stages:[
        {id:51, name:'황천의 강가',           nameEn:'Banks of the Underworld River',  difficulty:6, killTarget:169},
        {id:52, name:'망자들의 행렬',         nameEn:'Procession of the Dead',          difficulty:6, killTarget:172},
        {id:53, name:'저승 파수꾼의 길',      nameEn:'Path of Underworld Sentinels',    difficulty:6, killTarget:174},
        {id:54, name:'죄인들의 광장',         nameEn:'Square of Sinners',               difficulty:7, killTarget:176},
        {id:55, name:'염라의 첫 번째 문',     nameEn:"Yeomra's First Gate",             difficulty:7, killTarget:179, isMidBoss:true},
        {id:56, name:'지옥의 회랑',           nameEn:'Corridors of Hell',               difficulty:7, killTarget:181},
        {id:57, name:'저승 호위대의 진영',    nameEn:'Underworld Escort Camp',          difficulty:8, killTarget:183},
        {id:58, name:'심판의 청',             nameEn:'Hall of Judgment',                difficulty:8, killTarget:186},
        {id:59, name:'저승왕의 침전',         nameEn:"Underworld King's Chamber",       difficulty:8, killTarget:188},
        {id:60, name:'저승왕의 사자',         nameEn:"Underworld King's Emissary",      difficulty:9, killTarget:191, isBoss:true},
      ]
    },
    {
      chapter:7, name:'외신의 제단', nameEn:'Altar of the Outer God',
      stages:[
        {id:61, name:'오염된 성지 입구',      nameEn:'Defiled Holy Ground Entrance',  difficulty:7, killTarget:193},
        {id:62, name:'외신 신도의 거리',      nameEn:"Outer God Devotees' Street",    difficulty:7, killTarget:195},
        {id:63, name:'공허의 안개 지대',      nameEn:'Void Mist Zone',                difficulty:7, killTarget:198},
        {id:64, name:'제물의 제단',           nameEn:'Altar of Sacrifice',            difficulty:8, killTarget:200},
        {id:65, name:'외신 사제의 성소',      nameEn:"Outer God Priest's Sanctuary",  difficulty:8, killTarget:203, isMidBoss:true},
        {id:66, name:'공허가 스민 탑',        nameEn:'Void-Infused Tower',            difficulty:8, killTarget:205},
        {id:67, name:'촉수의 미로',           nameEn:'Tentacle Maze',                 difficulty:9, killTarget:207},
        {id:68, name:'외신의 숨결',           nameEn:'Breath of the Outer God',       difficulty:9, killTarget:210},
        {id:69, name:'제단의 심부',           nameEn:'Inner Sanctum of the Altar',    difficulty:9, killTarget:212},
        {id:70, name:'공허의 선구자',         nameEn:'Harbinger of the Void',         difficulty:10, killTarget:214, isBoss:true},
      ]
    },
    {
      chapter:8, name:'기억의 폐허', nameEn:'Ruins of Memory',
      stages:[
        {id:71, name:'잊혀진 마을',           nameEn:'Forgotten Village',              difficulty:8, killTarget:217},
        {id:72, name:'기억이 지워진 거리',    nameEn:'Street of Erased Memories',      difficulty:8, killTarget:219},
        {id:73, name:'흐릿한 꿈의 들판',      nameEn:'Field of Hazy Dreams',           difficulty:8, killTarget:222},
        {id:74, name:'약탈당한 신전',         nameEn:'Plundered Temple',               difficulty:9, killTarget:224},
        {id:75, name:'기억 파괴자의 소굴',    nameEn:"Memory Destroyer's Lair",        difficulty:9, killTarget:226, isMidBoss:true},
        {id:76, name:'공백의 도서관',         nameEn:'Library of Blank Pages',         difficulty:9, killTarget:229},
        {id:77, name:'사라진 얼굴들의 숲',    nameEn:'Forest of Vanished Faces',       difficulty:10, killTarget:231},
        {id:78, name:'왜곡된 기억의 탑',      nameEn:'Tower of Distorted Memories',    difficulty:10, killTarget:234},
        {id:79, name:'마지막 기억',           nameEn:'Last Memory',                    difficulty:10, killTarget:236},
        {id:80, name:'잊혀진 왕의 궁전',      nameEn:"Forgotten King's Palace",        difficulty:11, killTarget:238, isBoss:true},
      ]
    },
    {
      chapter:9, name:'신령의 무덤', nameEn:'Tomb of the Spirits',
      stages:[
        {id:81, name:'신령이 잠든 숲',        nameEn:'Forest Where Spirits Sleep',    difficulty:9, killTarget:241},
        {id:82, name:'타락한 신목',           nameEn:'Corrupted Sacred Tree',         difficulty:9, killTarget:243},
        {id:83, name:'반신령의 영역',         nameEn:'Domain of the Demi-Spirit',     difficulty:9, killTarget:245},
        {id:84, name:'무너진 신당',           nameEn:'Collapsed Shrine',              difficulty:10, killTarget:248},
        {id:85, name:'반신령 군주의 전당',    nameEn:'Hall of the Demi-Spirit Lord',  difficulty:10, killTarget:250, isMidBoss:true},
        {id:86, name:'신령의 눈물',           nameEn:'Tears of the Spirits',          difficulty:10, killTarget:253},
        {id:87, name:'봉인된 성지',           nameEn:'Sealed Holy Ground',            difficulty:11, killTarget:255},
        {id:88, name:'신령의 잠꼬대',         nameEn:"Spirits' Murmur",               difficulty:11, killTarget:257},
        {id:89, name:'깨어나는 어둠',         nameEn:'Awakening Darkness',            difficulty:11, killTarget:260},
        {id:90, name:'잠든 산신의 꿈',        nameEn:"Dream of the Sleeping Mountain God", difficulty:12, killTarget:262, isBoss:true},
      ]
    },
    {
      chapter:10, name:'혼돈의 왕좌', nameEn:'Throne of Chaos',
      stages:[
        {id:91,  name:'균열의 심장부',        nameEn:'Heart of the Rift',                difficulty:10, killTarget:265},
        {id:92,  name:'공허의 평원',          nameEn:'Plains of the Void',               difficulty:10, killTarget:267},
        {id:93,  name:'혼돈의 군단',          nameEn:'Legion of Chaos',                  difficulty:10, killTarget:269},
        {id:94,  name:'심연 기사의 요새',     nameEn:'Abyss Knight Fortress',            difficulty:11, killTarget:272},
        {id:95,  name:'혼돈의 선봉장',        nameEn:'Chaos Vanguard',                   difficulty:11, killTarget:274, isMidBoss:true},
        {id:96,  name:'붕괴하는 세계',        nameEn:'Crumbling World',                  difficulty:11, killTarget:276},
        {id:97,  name:'외신의 왕좌 앞길',     nameEn:"Road to the Outer God's Throne",   difficulty:12, killTarget:279},
        {id:98,  name:'마지막 경계',          nameEn:'Last Boundary',                    difficulty:12, killTarget:281},
        {id:99,  name:'기어오는 혼돈의 전실', nameEn:'Antechamber of Crawling Chaos',    difficulty:12, killTarget:284},
        {id:100, name:'기어오는 혼돈',        nameEn:'Crawling Chaos',                   difficulty:13, killTarget:286, isBoss:true},
      ]
    },

    // ── 시즌 2 — 유명계 (챕터 11~20, 스테이지 101~200) ──
    // killTarget: 시즌1 +50 (350→800)
    {
      chapter:11, name:'황천강 건너편', nameEn:'Banks of the Sanzu River', season:2,
      stages:[
        {id:101, name:'황천강 기슭',              nameEn:'Banks of the Underworld',             difficulty:11, killTarget:50},
        {id:102, name:'안개 낀 나루터',           nameEn:'Foggy Ferry Crossing',                difficulty:11, killTarget:52},
        {id:103, name:'떠도는 망자의 길',         nameEn:'Path of Wandering Souls',             difficulty:11, killTarget:55},
        {id:104, name:'강을 건너지 못한 자들',    nameEn:'Those Who Cannot Cross',              difficulty:12, killTarget:57},
        {id:105, name:'뱃사공의 심판',            nameEn:"Ferryman's Judgment",                 difficulty:12, killTarget:60, isMidBoss:true},
        {id:106, name:'황천강 심류',              nameEn:'Deep Current of the Sanzu',           difficulty:12, killTarget:62},
        {id:107, name:'물속의 원귀',              nameEn:'Vengeful Spirits of the Deep',        difficulty:13, killTarget:64},
        {id:108, name:'강변의 처형장',            nameEn:'Riverside Execution Ground',          difficulty:13, killTarget:67},
        {id:109, name:'침몰한 망자선',            nameEn:'Sunken Soul Barge',                   difficulty:13, killTarget:69},
        {id:110, name:'뱃사공의 왕좌',            nameEn:"Ferryman's Throne",                   difficulty:14, killTarget:71, isBoss:true},
      ]
    },
    {
      chapter:12, name:'망자의 거리', nameEn:'Street of the Dead', season:2,
      stages:[
        {id:111, name:'망자의 거리 입구',         nameEn:'Entrance to the Dead Street',         difficulty:12, killTarget:74},
        {id:112, name:'억울한 혼들의 시장',       nameEn:'Market of Wronged Souls',             difficulty:12, killTarget:76},
        {id:113, name:'포졸의 순찰로',            nameEn:'Underworld Guard Patrol',             difficulty:12, killTarget:79},
        {id:114, name:'지옥문 앞',                nameEn:'Before the Hell Gate',                difficulty:13, killTarget:81},
        {id:115, name:'포졸대장의 검문',          nameEn:"Captain's Checkpoint",                difficulty:13, killTarget:83, isMidBoss:true},
        {id:116, name:'죄인들의 감옥',            nameEn:'Prison of Sinners',                   difficulty:13, killTarget:86},
        {id:117, name:'고문의 방',                nameEn:'Chamber of Torment',                  difficulty:14, killTarget:88},
        {id:118, name:'망자의 법정',              nameEn:'Court of the Dead',                   difficulty:14, killTarget:91},
        {id:119, name:'붕괴하는 저승 성벽',       nameEn:'Crumbling Underworld Walls',          difficulty:14, killTarget:93},
        {id:120, name:'포졸대장의 처형장',        nameEn:"Captain's Execution Ground",          difficulty:15, killTarget:95, isBoss:true},
      ]
    },
    {
      chapter:13, name:'기억의 미궁', nameEn:'Labyrinth of Memory', season:2,
      stages:[
        {id:121, name:'기억이 흐르는 복도',       nameEn:'Corridor of Flowing Memories',        difficulty:13, killTarget:98},
        {id:122, name:'잊혀진 자들의 방',         nameEn:'Chamber of the Forgotten',            difficulty:13, killTarget:100},
        {id:123, name:'뒤틀린 기억의 숲',         nameEn:'Forest of Twisted Memories',          difficulty:13, killTarget:102},
        {id:124, name:'망각의 늪',                nameEn:'Swamp of Oblivion',                   difficulty:14, killTarget:105},
        {id:125, name:'기억귀의 먹이터',          nameEn:"Memory Devourer's Feeding Ground",    difficulty:14, killTarget:107, isMidBoss:true},
        {id:126, name:'지워진 이름들의 거리',     nameEn:'Street of Erased Names',              difficulty:14, killTarget:110},
        {id:127, name:'반복되는 악몽',            nameEn:'Recurring Nightmare',                 difficulty:15, killTarget:112},
        {id:128, name:'기억의 심연',              nameEn:'Abyss of Memory',                     difficulty:15, killTarget:114},
        {id:129, name:'붕괴하는 과거',            nameEn:'Collapsing Past',                     difficulty:15, killTarget:117},
        {id:130, name:'기억귀의 궁전',            nameEn:"Memory Devourer's Palace",            difficulty:16, killTarget:119, isBoss:true},
      ]
    },
    {
      chapter:14, name:'환생의 전당', nameEn:'Hall of Reincarnation', season:2,
      stages:[
        {id:131, name:'환생을 기다리는 영혼들',   nameEn:'Souls Awaiting Reincarnation',        difficulty:14, killTarget:122},
        {id:132, name:'업보의 저울',              nameEn:'Scales of Karma',                     difficulty:14, killTarget:124},
        {id:133, name:'전생의 회랑',              nameEn:'Corridor of Past Lives',              difficulty:14, killTarget:126},
        {id:134, name:'환생 거부된 자들의 구역',  nameEn:'Zone of the Reincarnation Denied',    difficulty:15, killTarget:129},
        {id:135, name:'심판관의 첫 번째 시험',    nameEn:"Judge's First Trial",                 difficulty:15, killTarget:131, isMidBoss:true},
        {id:136, name:'뒤틀린 업보의 방',         nameEn:'Chamber of Twisted Karma',            difficulty:15, killTarget:133},
        {id:137, name:'환생이 멈춘 곳',           nameEn:'Where Reincarnation Stopped',         difficulty:16, killTarget:136},
        {id:138, name:'저주받은 윤회의 고리',     nameEn:'Cursed Cycle of Rebirth',             difficulty:16, killTarget:138},
        {id:139, name:'심판관의 최후 선고 준비실', nameEn:'Antechamber of Final Judgment',      difficulty:16, killTarget:141},
        {id:140, name:'환생 심판관의 왕좌',       nameEn:"Reincarnation Judge's Throne",        difficulty:17, killTarget:143, isBoss:true},
      ]
    },
    {
      chapter:15, name:'명부의 심장', nameEn:'Heart of the Underworld', season:2,
      stages:[
        {id:141, name:'명부의 중심부',            nameEn:'Center of the Underworld',            difficulty:15, killTarget:145},
        {id:142, name:'시왕의 행렬',              nameEn:'Procession of the Ten Kings',         difficulty:15, killTarget:148},
        {id:143, name:'지옥도의 갈림길',          nameEn:'Crossroads of Hell',                  difficulty:15, killTarget:150},
        {id:144, name:'오관대왕의 영역 입구',     nameEn:"Entrance to Ogwan's Domain",          difficulty:16, killTarget:153},
        {id:145, name:'오관대왕의 시험',          nameEn:"Ogwan's Trial",                       difficulty:16, killTarget:155, isMidBoss:true},
        {id:146, name:'불타는 명부',              nameEn:'Burning Underworld Records',          difficulty:16, killTarget:157},
        {id:147, name:'시왕의 금지된 전각',       nameEn:'Forbidden Hall of the Ten Kings',     difficulty:17, killTarget:160},
        {id:148, name:'명부의 핵심',              nameEn:'Core of the Underworld',              difficulty:17, killTarget:162},
        {id:149, name:'오관대왕의 분노',          nameEn:'Wrath of Ogwan',                      difficulty:17, killTarget:164},
        {id:150, name:'명부의 심장부',            nameEn:'Heart of the Underworld Throne',      difficulty:18, killTarget:167, isBoss:true},
      ]
    },
    {
      chapter:16, name:'잠식된 유명계', nameEn:'Corrupted Shadow Realm', season:2,
      stages:[
        {id:151, name:'외신의 기운이 스미는 곳',  nameEn:'Where the Outer God Seeps In',        difficulty:16, killTarget:169},
        {id:152, name:'오염된 저승길',            nameEn:'Corrupted Underworld Path',           difficulty:16, killTarget:172},
        {id:153, name:'차사들의 반란',            nameEn:'Revolt of the Soul Reapers',          difficulty:16, killTarget:174},
        {id:154, name:'검은 도포의 행렬',         nameEn:'Procession of Black Robes',           difficulty:17, killTarget:176},
        {id:155, name:'강림의 첫 번째 강림',      nameEn:"Gangrim's First Descent",             difficulty:17, killTarget:179, isMidBoss:true},
        {id:156, name:'외신의 촉수가 뒤덮은 저승', nameEn:"Underworld Covered in Outer God's Tendrils", difficulty:17, killTarget:181},
        {id:157, name:'타락한 차사의 사냥터',     nameEn:"Corrupted Reaper's Hunting Ground",   difficulty:18, killTarget:183},
        {id:158, name:'강림도령의 오염된 무기고', nameEn:"Gangrim's Defiled Armory",            difficulty:18, killTarget:186},
        {id:159, name:'검은 오라의 폭풍',         nameEn:'Storm of Black Aura',                 difficulty:18, killTarget:188},
        {id:160, name:'오염된 강림도령',          nameEn:'Corrupted Gangrim',                   difficulty:19, killTarget:191, isBoss:true},
      ]
    },
    {
      chapter:17, name:'뒤틀린 저승길', nameEn:'Twisted Path of the Dead', season:2,
      stages:[
        {id:161, name:'뒤틀린 명부의 기록',       nameEn:'Twisted Underworld Records',          difficulty:17, killTarget:193},
        {id:162, name:'죄 없는 자를 죄인으로',    nameEn:'Innocent Judged Guilty',              difficulty:17, killTarget:195},
        {id:163, name:'오염된 저울의 방',         nameEn:'Chamber of the Corrupted Scales',     difficulty:17, killTarget:198},
        {id:164, name:'괴물이 된 망자들',         nameEn:'Souls Turned to Monsters',            difficulty:18, killTarget:200},
        {id:165, name:'판관의 첫 번째 심판',      nameEn:"Judge's First Corrupt Ruling",        difficulty:18, killTarget:203, isMidBoss:true},
        {id:166, name:'뒤집힌 지옥법',            nameEn:'Inverted Laws of Hell',               difficulty:18, killTarget:205},
        {id:167, name:'적라사자의 오염된 명부',   nameEn:'Defiled Records of Jeokna',           difficulty:19, killTarget:207},
        {id:168, name:'심판이 멈춘 법정',         nameEn:'Court Where Judgment Stopped',        difficulty:19, killTarget:210},
        {id:169, name:'타락한 판결의 폭풍',       nameEn:'Storm of Corrupt Verdicts',           difficulty:19, killTarget:212},
        {id:170, name:'타락한 판관의 법정',       nameEn:"Corrupt Judge's Court",               difficulty:20, killTarget:214, isBoss:true},
      ]
    },
    {
      chapter:18, name:'혼돈의 명부', nameEn:'Underworld in Chaos', season:2,
      stages:[
        {id:171, name:'저승의 법이 무너지다',     nameEn:'Laws of the Underworld Crumble',      difficulty:18, killTarget:217},
        {id:172, name:'생사의 경계가 흐려지다',   nameEn:'Boundary of Life and Death Blurs',    difficulty:18, killTarget:219},
        {id:173, name:'대별왕의 흔들리는 왕좌',   nameEn:"Daebyelwang's Trembling Throne",      difficulty:18, killTarget:222},
        {id:174, name:'창세의 기억이 오염되다',   nameEn:"Corruption of Creation's Memory",     difficulty:19, killTarget:224},
        {id:175, name:'대별왕의 마지막 저항',     nameEn:"Daebyelwang's Last Resistance",       difficulty:19, killTarget:226, isMidBoss:true},
        {id:176, name:'이승과 저승이 뒤섞이다',   nameEn:'Living and Dead Worlds Merge',        difficulty:19, killTarget:229},
        {id:177, name:'외신에 잠식된 법칙',       nameEn:'Laws Devoured by the Outer God',      difficulty:20, killTarget:231},
        {id:178, name:'혼돈의 명부 심연',         nameEn:'Abyss of the Chaotic Underworld',     difficulty:20, killTarget:234},
        {id:179, name:'대별왕의 절규',            nameEn:"Daebyelwang's Scream",                difficulty:20, killTarget:236},
        {id:180, name:'오염된 대별왕',            nameEn:'Corrupted Daebyelwang',               difficulty:21, killTarget:238, isBoss:true},
      ]
    },
    {
      chapter:19, name:'소멸의 경계', nameEn:'Edge of Annihilation', season:2,
      stages:[
        {id:181, name:'수명이 깎이는 땅',         nameEn:'Land Where Lifespan Is Consumed',     difficulty:19, killTarget:241},
        {id:182, name:'치부책이 불타다',           nameEn:'The Book of Life Burns',              difficulty:19, killTarget:243},
        {id:183, name:'태산대왕의 오염된 영역',   nameEn:"Taesan's Corrupted Domain",           difficulty:19, killTarget:245},
        {id:184, name:'수명을 난사하는 괴물들',   nameEn:'Monsters Draining Lifespans',         difficulty:20, killTarget:248},
        {id:185, name:'태산대왕의 첫 번째 눈',    nameEn:"Taesan's First Eye",                  difficulty:20, killTarget:250, isMidBoss:true},
        {id:186, name:'소멸 직전의 영혼들',       nameEn:'Souls on the Brink of Annihilation',  difficulty:20, killTarget:253},
        {id:187, name:'외신의 눈이 박힌 왕좌',    nameEn:"Throne Embedded with Outer God's Eyes", difficulty:21, killTarget:255},
        {id:188, name:'수명의 폭풍',              nameEn:'Storm of Lifespans',                  difficulty:21, killTarget:257},
        {id:189, name:'태산대왕의 마지막 변이',   nameEn:"Taesan's Final Mutation",             difficulty:21, killTarget:260},
        {id:190, name:'잠식된 태산대왕',          nameEn:'Devoured Taesan',                     difficulty:22, killTarget:262, isBoss:true},
      ]
    },
    {
      chapter:20, name:'유명계의 왕좌', nameEn:'Throne of the Shadow Realm', season:2,
      stages:[
        {id:191, name:'구원자의 발자국',          nameEn:'Footsteps of the Savior',             difficulty:20, killTarget:265},
        {id:192, name:'오염된 생명수의 강',       nameEn:'River of Corrupted Life Water',       difficulty:20, killTarget:267},
        {id:193, name:'바리공주의 성역이 무너지다', nameEn:"Bari's Sanctuary Crumbles",         difficulty:20, killTarget:269},
        {id:194, name:'망자를 부패시키는 물',     nameEn:'Soul-Rotting Waters',                 difficulty:21, killTarget:272},
        {id:195, name:'바리공주의 첫 번째 눈물',  nameEn:"Bari's First Tear",                   difficulty:21, killTarget:274, isMidBoss:true},
        {id:196, name:'성스러운 껍데기',          nameEn:'Holy Shell',                          difficulty:21, killTarget:276},
        {id:197, name:'외신의 그릇이 된 구원자',  nameEn:"Savior Become the Outer God's Vessel", difficulty:22, killTarget:279},
        {id:198, name:'부패한 생명수의 폭풍',     nameEn:'Storm of Corrupted Life Water',       difficulty:22, killTarget:281},
        {id:199, name:'바리공주의 마지막 노래',   nameEn:"Bari's Final Song",                   difficulty:22, killTarget:284},
        {id:200, name:'타락한 바리공주',          nameEn:'Fallen Bari-gongju',                  difficulty:23, killTarget:286, isBoss:true},
      ]
    },

    // ── 시즌 3 — 망랑계 (챕터 21~30, 스테이지 201~300) ──
    // [UPDATE 2026-07-14] 260713/260714_MTOPC.md + SEASON3_8_STAGES.md 기준 신규 등록.
    // 스테이지 이름은 SEASON3_8_STAGES.md(원본 설계문서, 6/29 작성) 그대로, killTarget/difficulty는 시즌2 패턴(+5/스테이지) 연장.
    {
      chapter:21, name:'혼돈의 입구', nameEn:'Gate of Chaos', season:3,
      stages:[
        {id:201, name:'망랑계의 첫 발걸음',       nameEn:'First Step into Chaos',               difficulty:21, killTarget:50},
        {id:202, name:'뒤틀린 하늘',              nameEn:'Twisted Sky',                         difficulty:21, killTarget:52},
        {id:203, name:'도깨비들의 행진',          nameEn:'March of the Dokkaebi',               difficulty:21, killTarget:55},
        {id:204, name:'요술이 넘치는 길',         nameEn:'Path Overflowing with Magic',         difficulty:22, killTarget:57},
        {id:205, name:'도깨비 대장의 시험',       nameEn:"Dokkaebi Captain's Trial",            difficulty:22, killTarget:60, isMidBoss:true},
        {id:206, name:'혼돈의 안개',              nameEn:'Fog of Chaos',                        difficulty:22, killTarget:62},
        {id:207, name:'도깨비불의 습격',          nameEn:'Dokkaebi Fire Assault',               difficulty:23, killTarget:64},
        {id:208, name:'뒤집힌 세계',              nameEn:'Inverted World',                      difficulty:23, killTarget:67},
        {id:209, name:'도깨비 왕의 포효',         nameEn:"Dokkaebi King's Roar",                difficulty:23, killTarget:69},
        {id:210, name:'도깨비 왕의 왕좌',         nameEn:"Dokkaebi King's Throne",              difficulty:24, killTarget:71, isBoss:true},
      ]
    },
    {
      chapter:22, name:'요술의 거리', nameEn:'Street of Illusions', season:3,
      stages:[
        {id:211, name:'환상의 거리',              nameEn:'Street of Illusions',                 difficulty:22, killTarget:74},
        {id:212, name:'구미호의 유혹',            nameEn:"Fox's Temptation",                    difficulty:22, killTarget:76},
        {id:213, name:'가짜 낙원',                nameEn:'False Paradise',                      difficulty:22, killTarget:79},
        {id:214, name:'술법에 홀린 망자',         nameEn:'Souls Enchanted by Fox Magic',        difficulty:23, killTarget:81},
        {id:215, name:'구미호 술사의 시험',       nameEn:"Fox Sorcerer's Trial",                difficulty:23, killTarget:83, isMidBoss:true},
        {id:216, name:'천 개의 가면',             nameEn:'Thousand Masks',                      difficulty:23, killTarget:86},
        {id:217, name:'뒤틀린 환상',              nameEn:'Twisted Illusion',                    difficulty:24, killTarget:88},
        {id:218, name:'구미호의 꼬리',            nameEn:'Nine Tails',                          difficulty:24, killTarget:91},
        {id:219, name:'여왕의 저주',              nameEn:"Queen's Curse",                       difficulty:24, killTarget:93},
        {id:220, name:'구미호 여왕의 궁전',       nameEn:"Fox Queen's Palace",                  difficulty:25, killTarget:95, isBoss:true},
      ]
    },
    {
      chapter:23, name:'글리치의 숲', nameEn:'Glitch Forest', season:3,
      stages:[
        {id:221, name:'오류가 난 세계',           nameEn:'World of Errors',                     difficulty:23, killTarget:98},
        {id:222, name:'깨진 현실',                nameEn:'Broken Reality',                      difficulty:23, killTarget:100},
        {id:223, name:'글리치 생명체의 서식지',   nameEn:'Habitat of Glitch Creatures',         difficulty:23, killTarget:102},
        {id:224, name:'반복되는 오류',            nameEn:'Repeating Error',                     difficulty:24, killTarget:105},
        {id:225, name:'글리치 사냥꾼의 영역',     nameEn:"Glitch Hunter's Territory",           difficulty:24, killTarget:107, isMidBoss:true},
        {id:226, name:'픽셀이 무너지는 곳',       nameEn:'Where Pixels Collapse',               difficulty:24, killTarget:110},
        {id:227, name:'존재하지 않는 길',         nameEn:"Path That Doesn't Exist",             difficulty:25, killTarget:112},
        {id:228, name:'오류의 심연',              nameEn:'Abyss of Errors',                     difficulty:25, killTarget:114},
        {id:229, name:'글리치 정령의 각성',       nameEn:"Glitch Spirit's Awakening",           difficulty:25, killTarget:117},
        {id:230, name:'글리치 정령의 핵',         nameEn:"Glitch Spirit's Core",                difficulty:26, killTarget:119, isBoss:true},
      ]
    },
    {
      chapter:24, name:'뒤틀린 시장', nameEn:'Twisted Market', season:3,
      stages:[
        {id:231, name:'혼돈 상인의 거리',         nameEn:"Chaos Merchant's Street",             difficulty:24, killTarget:122},
        {id:232, name:'저주받은 물건들',          nameEn:'Cursed Goods',                        difficulty:24, killTarget:124},
        {id:233, name:'거래의 함정',              nameEn:'Trap of the Deal',                    difficulty:24, killTarget:126},
        {id:234, name:'혼돈의 경매장',            nameEn:'Chaos Auction House',                 difficulty:25, killTarget:129},
        {id:235, name:'혼돈 경비대장의 검문',     nameEn:"Chaos Guard Captain's Checkpoint",    difficulty:25, killTarget:131, isMidBoss:true},
        {id:236, name:'뒤틀린 거래',              nameEn:'Twisted Transaction',                 difficulty:25, killTarget:133},
        {id:237, name:'저주 아이템의 폭발',       nameEn:'Cursed Item Explosion',               difficulty:26, killTarget:136},
        {id:238, name:'혼돈 상인의 비밀 창고',    nameEn:"Chaos Merchant's Secret Vault",       difficulty:26, killTarget:138},
        {id:239, name:'최후의 거래',              nameEn:'Final Transaction',                   difficulty:26, killTarget:141},
        {id:240, name:'혼돈 상인의 본거지',       nameEn:"Chaos Merchant's Hideout",            difficulty:27, killTarget:143, isBoss:true},
      ]
    },
    {
      chapter:25, name:'망랑계 심층', nameEn:'Deep Chaos Realm', season:3,
      stages:[
        {id:241, name:'망랑계의 심장',            nameEn:'Heart of the Chaos Realm',            difficulty:25, killTarget:145},
        {id:242, name:'대군주의 영역',            nameEn:'Domain of the Grand Lord',            difficulty:25, killTarget:148},
        {id:243, name:'혼돈의 군대',              nameEn:'Army of Chaos',                       difficulty:25, killTarget:150},
        {id:244, name:'망랑계의 법칙',            nameEn:'Laws of the Chaos Realm',             difficulty:26, killTarget:153},
        {id:245, name:'망랑 전위대장의 돌격',     nameEn:"Chaos Vanguard's Charge",             difficulty:26, killTarget:155, isMidBoss:true},
        {id:246, name:'혼돈의 핵',                nameEn:'Core of Chaos',                       difficulty:26, killTarget:157},
        {id:247, name:'대군주의 시험',            nameEn:"Grand Lord's Trial",                  difficulty:27, killTarget:160},
        {id:248, name:'망랑계의 근원',            nameEn:'Origin of the Chaos Realm',           difficulty:27, killTarget:162},
        {id:249, name:'대군주의 분노',            nameEn:"Grand Lord's Wrath",                  difficulty:27, killTarget:164},
        {id:250, name:'망랑 대군주의 왕좌',       nameEn:"Grand Lord's Throne",                 difficulty:28, killTarget:167, isBoss:true},
      ]
    },
    {
      chapter:26, name:'잠식된 망랑계', nameEn:'Corrupted Chaos Realm', season:3,
      stages:[
        {id:251, name:'외신의 기운이 혼돈을 삼키다', nameEn:'Outer God Devours Chaos',           difficulty:26, killTarget:169},
        {id:252, name:'타락한 도깨비',            nameEn:'Corrupted Dokkaebi',                  difficulty:26, killTarget:172},
        {id:253, name:'혼돈과 외신의 충돌',       nameEn:'Clash of Chaos and Outer God',        difficulty:26, killTarget:174},
        {id:254, name:'도깨비신의 균열',          nameEn:'Crack in the Dokkaebi God',           difficulty:27, killTarget:176},
        {id:255, name:'타락한 도깨비 무사의 습격', nameEn:"Corrupted Dokkaebi Warrior's Assault", difficulty:27, killTarget:179, isMidBoss:true},
        {id:256, name:'외신에 물든 혼돈',         nameEn:'Chaos Tainted by Outer God',          difficulty:27, killTarget:181},
        {id:257, name:'도깨비신의 절규',          nameEn:"Dokkaebi God's Scream",               difficulty:28, killTarget:183},
        {id:258, name:'오염된 도깨비불',          nameEn:'Corrupted Dokkaebi Fire',             difficulty:28, killTarget:186},
        {id:259, name:'도깨비신의 마지막 변이',   nameEn:"Dokkaebi God's Final Mutation",       difficulty:28, killTarget:188},
        {id:260, name:'오염된 도깨비신',          nameEn:'Corrupted Dokkaebi God',              difficulty:29, killTarget:191, isBoss:true},
      ]
    },
    {
      chapter:27, name:'요술에 홀린 세계', nameEn:'World Lost in Illusion', season:3,
      stages:[
        {id:261, name:'외신의 환상',              nameEn:"Outer God's Illusion",                difficulty:27, killTarget:193},
        {id:262, name:'구미호 선녀의 타락',       nameEn:"Fox Fairy's Corruption",              difficulty:27, killTarget:195},
        {id:263, name:'홀린 자들의 행렬',         nameEn:'Procession of the Enchanted',         difficulty:27, killTarget:198},
        {id:264, name:'뒤틀린 구원',              nameEn:'Twisted Salvation',                   difficulty:28, killTarget:200},
        {id:265, name:'홀린 술사의 마법진',       nameEn:"Enchanted Sorcerer's Magic Circle",   difficulty:28, killTarget:203, isMidBoss:true},
        {id:266, name:'환상이 현실을 삼키다',     nameEn:'Illusion Devours Reality',            difficulty:28, killTarget:205},
        {id:267, name:'타락한 선녀의 춤',         nameEn:"Corrupted Fairy's Dance",             difficulty:29, killTarget:207},
        {id:268, name:'구미호 선녀의 독',         nameEn:"Fox Fairy's Poison",                  difficulty:29, killTarget:210},
        {id:269, name:'선녀의 마지막 환상',       nameEn:"Fairy's Last Illusion",               difficulty:29, killTarget:212},
        {id:270, name:'타락한 구미호 선녀',       nameEn:'Fallen Fox Fairy',                    difficulty:30, killTarget:214, isBoss:true},
      ]
    },
    {
      chapter:28, name:'혼돈의 소용돌이', nameEn:'Vortex of Chaos', season:3,
      stages:[
        {id:271, name:'혼돈신의 균열',            nameEn:'Crack in the Chaos God',              difficulty:28, killTarget:217},
        {id:272, name:'소용돌이치는 외신의 힘',   nameEn:"Swirling Power of the Outer God",     difficulty:28, killTarget:219},
        {id:273, name:'혼돈과 질서의 충돌',       nameEn:'Clash of Chaos and Order',            difficulty:28, killTarget:222},
        {id:274, name:'혼돈신의 눈물',            nameEn:"Chaos God's Tears",                   difficulty:29, killTarget:224},
        {id:275, name:'혼돈의 파편의 습격',       nameEn:"Chaos Fragment's Assault",            difficulty:29, killTarget:226, isMidBoss:true},
        {id:276, name:'소용돌이의 심연',          nameEn:'Abyss of the Vortex',                 difficulty:29, killTarget:229},
        {id:277, name:'외신에 잠식된 혼돈',       nameEn:'Chaos Devoured by Outer God',         difficulty:30, killTarget:231},
        {id:278, name:'혼돈신의 마지막 저항',     nameEn:"Chaos God's Last Resistance",         difficulty:30, killTarget:234},
        {id:279, name:'혼돈신의 절규',            nameEn:"Chaos God's Scream",                  difficulty:30, killTarget:236},
        {id:280, name:'오염된 혼돈신',            nameEn:'Corrupted Chaos God',                 difficulty:31, killTarget:238, isBoss:true},
      ]
    },
    {
      chapter:29, name:'글리치 폭풍', nameEn:'Glitch Storm', season:3,
      stages:[
        {id:281, name:'현실이 무너지다',          nameEn:'Reality Collapses',                   difficulty:29, killTarget:241},
        {id:282, name:'글리치 폭풍의 시작',       nameEn:'Beginning of the Glitch Storm',       difficulty:29, killTarget:243},
        {id:283, name:'오류가 세계를 삼키다',     nameEn:'Errors Devour the World',             difficulty:29, killTarget:245},
        {id:284, name:'잠식된 글리치 생명체',     nameEn:'Corrupted Glitch Creatures',          difficulty:30, killTarget:248},
        {id:285, name:'글리치 폭풍의 눈',         nameEn:'Eye of the Glitch Storm',             difficulty:30, killTarget:250, isMidBoss:true},
        {id:286, name:'존재의 오류',              nameEn:'Error of Existence',                  difficulty:30, killTarget:253},
        {id:287, name:'글리치 왕의 변이',         nameEn:"Glitch King's Mutation",              difficulty:31, killTarget:255},
        {id:288, name:'폭풍의 심연',              nameEn:'Abyss of the Storm',                  difficulty:31, killTarget:257},
        {id:289, name:'글리치 왕의 마지막 오류',  nameEn:"Glitch King's Final Error",           difficulty:31, killTarget:260},
        {id:290, name:'잠식된 글리치 왕',         nameEn:'Corrupted Glitch King',               difficulty:32, killTarget:262, isBoss:true},
      ]
    },
    {
      chapter:30, name:'망랑계의 왕좌', nameEn:'Throne of the Chaos Realm', season:3,
      stages:[
        {id:291, name:'망랑대왕의 영역',          nameEn:"Domain of the Chaos King",            difficulty:30, killTarget:265},
        {id:292, name:'외신에 잠식된 왕좌',       nameEn:'Throne Devoured by Outer God',        difficulty:30, killTarget:267},
        {id:293, name:'망랑대왕의 분신들',        nameEn:"Chaos King's Doppelgangers",          difficulty:30, killTarget:269},
        {id:294, name:'혼돈의 정점',              nameEn:'Apex of Chaos',                       difficulty:31, killTarget:272},
        {id:295, name:'망랑대왕의 분신의 습격',   nameEn:"Chaos King's Doppelganger Assault",   difficulty:31, killTarget:274, isMidBoss:true},
        {id:296, name:'타락한 혼돈의 법칙',       nameEn:'Corrupted Laws of Chaos',             difficulty:31, killTarget:276},
        {id:297, name:'망랑대왕의 절규',          nameEn:"Chaos King's Scream",                 difficulty:32, killTarget:279},
        {id:298, name:'외신의 그릇이 된 왕',      nameEn:"King Become Outer God's Vessel",      difficulty:32, killTarget:281},
        {id:299, name:'망랑대왕의 마지막 변이',   nameEn:"Chaos King's Final Mutation",         difficulty:32, killTarget:284},
        {id:300, name:'타락한 망랑대왕',          nameEn:'Fallen Chaos King',                   difficulty:33, killTarget:286, isBoss:true},
      ]
    },

    // -- 시즌 4 -- 귀허계 (챕터 31~40, 스테이지 301~400) --
    // [UPDATE 2026-07-17] SEASON3_8_STAGES.md 기준 신규 등록. killTarget 곡선은 시즌2/3와 동일(시즌별 50->286 리셋), difficulty는 시즌3+10.
    {
      chapter:31, name:'소멸의 해안', nameEn:'Shore of Annihilation', season:4,
      stages:[
        {id:301, name:'귀허계의 첫 발걸음', nameEn:'First Step into the Void', difficulty:31, killTarget:50},
        {id:302, name:'소멸의 파도', nameEn:'Waves of Annihilation', difficulty:31, killTarget:52},
        {id:303, name:'사라져가는 존재들', nameEn:'Fading Existences', difficulty:31, killTarget:55},
        {id:304, name:'허무의 해안', nameEn:'Shore of Nothingness', difficulty:32, killTarget:57},
        {id:305, name:'소멸의 파수꾼의 시험', nameEn:'Void Sentinel\'s Trial', difficulty:32, killTarget:60, isMidBoss:true},
        {id:306, name:'소멸의 안개', nameEn:'Fog of Annihilation', difficulty:32, killTarget:62},
        {id:307, name:'사라지는 기억들', nameEn:'Vanishing Memories', difficulty:33, killTarget:64},
        {id:308, name:'소멸의 심류', nameEn:'Deep Current of Annihilation', difficulty:33, killTarget:67},
        {id:309, name:'수호자의 포효', nameEn:'Guardian\'s Roar', difficulty:33, killTarget:69},
        {id:310, name:'소멸의 수호자', nameEn:'Guardian of Annihilation', difficulty:34, killTarget:71, isBoss:true},
      ]
    },
    {
      chapter:32, name:'잊혀진 존재들의 바다', nameEn:'Sea of Forgotten Existences', season:4,
      stages:[
        {id:311, name:'잊혀진 자들의 바다', nameEn:'Sea of the Forgotten', difficulty:32, killTarget:74},
        {id:312, name:'망각의 파도', nameEn:'Waves of Oblivion', difficulty:32, killTarget:76},
        {id:313, name:'이름 없는 존재들', nameEn:'Nameless Existences', difficulty:32, killTarget:79},
        {id:314, name:'기억이 사라지는 곳', nameEn:'Where Memories Disappear', difficulty:33, killTarget:81},
        {id:315, name:'망각의 사자의 순찰', nameEn:'Oblivion Reaper\'s Patrol', difficulty:33, killTarget:83, isMidBoss:true},
        {id:316, name:'잊혀진 신들의 무덤', nameEn:'Tomb of Forgotten Gods', difficulty:33, killTarget:86},
        {id:317, name:'망각의 심연', nameEn:'Abyss of Oblivion', difficulty:34, killTarget:88},
        {id:318, name:'존재의 끝', nameEn:'End of Existence', difficulty:34, killTarget:91},
        {id:319, name:'망각의 군주의 분노', nameEn:'Lord of Oblivion\'s Wrath', difficulty:34, killTarget:93},
        {id:320, name:'망각의 군주', nameEn:'Lord of Oblivion', difficulty:35, killTarget:95, isBoss:true},
      ]
    },
    {
      chapter:33, name:'거듭남의 제단', nameEn:'Altar of Rebirth', season:4,
      stages:[
        {id:321, name:'거듭남을 기다리는 영혼들', nameEn:'Souls Awaiting Rebirth', difficulty:33, killTarget:98},
        {id:322, name:'소멸과 탄생의 경계', nameEn:'Boundary of Death and Birth', difficulty:33, killTarget:100},
        {id:323, name:'거듭남의 불꽃', nameEn:'Flame of Rebirth', difficulty:33, killTarget:102},
        {id:324, name:'순리의 흐름', nameEn:'Flow of Natural Order', difficulty:34, killTarget:105},
        {id:325, name:'환생의 수호자의 시험', nameEn:'Rebirth Guardian\'s Trial', difficulty:34, killTarget:107, isMidBoss:true},
        {id:326, name:'거듭남이 멈춘 제단', nameEn:'Altar Where Rebirth Stopped', difficulty:34, killTarget:110},
        {id:327, name:'뒤틀린 순리', nameEn:'Twisted Natural Order', difficulty:35, killTarget:112},
        {id:328, name:'거듭남의 심연', nameEn:'Abyss of Rebirth', difficulty:35, killTarget:114},
        {id:329, name:'환생의 신의 분노', nameEn:'Rebirth God\'s Wrath', difficulty:35, killTarget:117},
        {id:330, name:'환생의 신', nameEn:'God of Rebirth', difficulty:36, killTarget:119, isBoss:true},
      ]
    },
    {
      chapter:34, name:'허무의 심연', nameEn:'Abyss of Nothingness', season:4,
      stages:[
        {id:331, name:'허무의 시작', nameEn:'Beginning of Nothingness', difficulty:34, killTarget:122},
        {id:332, name:'아무것도 없는 곳', nameEn:'Place of Nothing', difficulty:34, killTarget:124},
        {id:333, name:'허무에 잠식된 영혼들', nameEn:'Souls Consumed by Nothingness', difficulty:34, killTarget:126},
        {id:334, name:'존재의 무게', nameEn:'Weight of Existence', difficulty:35, killTarget:129},
        {id:335, name:'허무의 파편의 습격', nameEn:'Void Fragment\'s Assault', difficulty:35, killTarget:131, isMidBoss:true},
        {id:336, name:'허무의 바다', nameEn:'Sea of Nothingness', difficulty:35, killTarget:133},
        {id:337, name:'모든 것이 사라지는 곳', nameEn:'Where Everything Disappears', difficulty:36, killTarget:136},
        {id:338, name:'허무의 심장', nameEn:'Heart of Nothingness', difficulty:36, killTarget:138},
        {id:339, name:'허무의 왕의 각성', nameEn:'Void King\'s Awakening', difficulty:36, killTarget:141},
        {id:340, name:'허무의 왕', nameEn:'King of Nothingness', difficulty:37, killTarget:143, isBoss:true},
      ]
    },
    {
      chapter:35, name:'귀허계 심층', nameEn:'Deep Void Realm', season:4,
      stages:[
        {id:341, name:'귀허계의 심장', nameEn:'Heart of the Void Realm', difficulty:35, killTarget:145},
        {id:342, name:'소멸대왕의 영역', nameEn:'Domain of the Annihilation King', difficulty:35, killTarget:148},
        {id:343, name:'소멸의 군대', nameEn:'Army of Annihilation', difficulty:35, killTarget:150},
        {id:344, name:'순리석이 흐르는 땅', nameEn:'Land Where Sunri Stones Flow', difficulty:36, killTarget:153},
        {id:345, name:'소멸대왕의 전위대', nameEn:'Annihilation King\'s Vanguard', difficulty:36, killTarget:155, isMidBoss:true},
        {id:346, name:'소멸의 핵', nameEn:'Core of Annihilation', difficulty:36, killTarget:157},
        {id:347, name:'소멸대왕의 시험', nameEn:'Annihilation King\'s Trial', difficulty:37, killTarget:160},
        {id:348, name:'귀허계의 근원', nameEn:'Origin of the Void Realm', difficulty:37, killTarget:162},
        {id:349, name:'소멸대왕의 분노', nameEn:'Annihilation King\'s Wrath', difficulty:37, killTarget:164},
        {id:350, name:'소멸대왕의 왕좌', nameEn:'Annihilation King\'s Throne', difficulty:38, killTarget:167, isBoss:true},
      ]
    },
    {
      chapter:36, name:'잠식된 귀허계', nameEn:'Corrupted Void Realm', season:4,
      stages:[
        {id:351, name:'외신의 기운이 허무를 삼키다', nameEn:'Outer God Devours the Void', difficulty:36, killTarget:169},
        {id:352, name:'소멸이 오염되다', nameEn:'Annihilation Corrupted', difficulty:36, killTarget:172},
        {id:353, name:'거듭남이 멈추다', nameEn:'Rebirth Stops', difficulty:36, killTarget:174},
        {id:354, name:'소멸신의 균열', nameEn:'Crack in the Annihilation God', difficulty:37, killTarget:176},
        {id:355, name:'타락한 소멸의 사자', nameEn:'Corrupted Annihilation Reaper', difficulty:37, killTarget:179, isMidBoss:true},
        {id:356, name:'오염된 허무의 바다', nameEn:'Corrupted Sea of Nothingness', difficulty:37, killTarget:181},
        {id:357, name:'소멸신의 절규', nameEn:'Annihilation God\'s Scream', difficulty:38, killTarget:183},
        {id:358, name:'외신에 물든 순리', nameEn:'Natural Order Tainted by Outer God', difficulty:38, killTarget:186},
        {id:359, name:'소멸신의 마지막 변이', nameEn:'Annihilation God\'s Final Mutation', difficulty:38, killTarget:188},
        {id:360, name:'오염된 소멸신', nameEn:'Corrupted Annihilation God', difficulty:39, killTarget:191, isBoss:true},
      ]
    },
    {
      chapter:37, name:'뒤틀린 거듭남', nameEn:'Twisted Rebirth', season:4,
      stages:[
        {id:361, name:'거듭남이 저주가 되다', nameEn:'Rebirth Becomes a Curse', difficulty:37, killTarget:193},
        {id:362, name:'뒤틀린 환생의 고리', nameEn:'Twisted Cycle of Rebirth', difficulty:37, killTarget:195},
        {id:363, name:'죽을 수 없는 자들', nameEn:'Those Who Cannot Die', difficulty:37, killTarget:198},
        {id:364, name:'환생신의 균열', nameEn:'Crack in the Rebirth God', difficulty:38, killTarget:200},
        {id:365, name:'오염된 환생의 수호자', nameEn:'Corrupted Rebirth Guardian', difficulty:38, killTarget:203, isMidBoss:true},
        {id:366, name:'거듭남의 오염', nameEn:'Corruption of Rebirth', difficulty:38, killTarget:205},
        {id:367, name:'타락한 순리의 흐름', nameEn:'Corrupted Flow of Natural Order', difficulty:39, killTarget:207},
        {id:368, name:'환생신의 마지막 저항', nameEn:'Rebirth God\'s Last Resistance', difficulty:39, killTarget:210},
        {id:369, name:'환생신의 절규', nameEn:'Rebirth God\'s Scream', difficulty:39, killTarget:212},
        {id:370, name:'타락한 환생신', nameEn:'Corrupted Rebirth God', difficulty:40, killTarget:214, isBoss:true},
      ]
    },
    {
      chapter:38, name:'혼돈의 허무', nameEn:'Chaotic Void', season:4,
      stages:[
        {id:371, name:'허무에 혼돈이 스미다', nameEn:'Chaos Seeps into the Void', difficulty:38, killTarget:217},
        {id:372, name:'소멸과 혼돈의 충돌', nameEn:'Clash of Annihilation and Chaos', difficulty:38, killTarget:219},
        {id:373, name:'허무신의 균열', nameEn:'Crack in the Void God', difficulty:38, killTarget:222},
        {id:374, name:'오염된 허무의 법칙', nameEn:'Corrupted Laws of the Void', difficulty:39, killTarget:224},
        {id:375, name:'허무의 오염된 파편', nameEn:'Corrupted Void Fragment', difficulty:39, killTarget:226, isMidBoss:true},
        {id:376, name:'혼돈에 삼켜진 허무', nameEn:'Void Swallowed by Chaos', difficulty:39, killTarget:229},
        {id:377, name:'허무신의 마지막 저항', nameEn:'Void God\'s Last Resistance', difficulty:40, killTarget:231},
        {id:378, name:'오염된 허무의 심연', nameEn:'Corrupted Abyss of the Void', difficulty:40, killTarget:234},
        {id:379, name:'허무신의 절규', nameEn:'Void God\'s Scream', difficulty:40, killTarget:236},
        {id:380, name:'오염된 허무신', nameEn:'Corrupted Void God', difficulty:41, killTarget:238, isBoss:true},
      ]
    },
    {
      chapter:39, name:'소멸의 경계', nameEn:'Edge of Annihilation', season:4,
      stages:[
        {id:381, name:'귀허대왕의 오염된 영역', nameEn:'Corrupted Domain of the Void King', difficulty:39, killTarget:241},
        {id:382, name:'소멸의 끝', nameEn:'End of Annihilation', difficulty:39, killTarget:243},
        {id:383, name:'귀허대왕의 변이', nameEn:'Void King\'s Mutation', difficulty:39, killTarget:245},
        {id:384, name:'외신의 눈이 박힌 왕좌', nameEn:'Throne Embedded with Outer God\'s Eyes', difficulty:40, killTarget:248},
        {id:385, name:'귀허대왕의 오염된 눈', nameEn:'Void King\'s Corrupted Eye', difficulty:40, killTarget:250, isMidBoss:true},
        {id:386, name:'소멸 직전의 세계', nameEn:'World on the Brink of Annihilation', difficulty:40, killTarget:253},
        {id:387, name:'귀허대왕의 절규', nameEn:'Void King\'s Scream', difficulty:41, killTarget:255},
        {id:388, name:'외신에 잠식된 순리', nameEn:'Natural Order Devoured by Outer God', difficulty:41, killTarget:257},
        {id:389, name:'귀허대왕의 마지막 변이', nameEn:'Void King\'s Final Mutation', difficulty:41, killTarget:260},
        {id:390, name:'잠식된 귀허대왕', nameEn:'Devoured Void King', difficulty:42, killTarget:262, isBoss:true},
      ]
    },
    {
      chapter:40, name:'귀허계의 왕좌', nameEn:'Throne of the Void Realm', season:4,
      stages:[
        {id:391, name:'소멸의 여신의 발자국', nameEn:'Annihilation Goddess\'s Footsteps', difficulty:40, killTarget:265},
        {id:392, name:'오염된 순리의 강', nameEn:'River of Corrupted Natural Order', difficulty:40, killTarget:267},
        {id:393, name:'소멸의 여신의 성역이 무너지다', nameEn:'Annihilation Goddess\'s Sanctuary Crumbles', difficulty:40, killTarget:269},
        {id:394, name:'거듭남을 부패시키는 힘', nameEn:'Power Corrupting Rebirth', difficulty:41, killTarget:272},
        {id:395, name:'소멸의 여신의 첫 번째 눈물', nameEn:'Annihilation Goddess\'s First Tear', difficulty:41, killTarget:274, isMidBoss:true},
        {id:396, name:'성스러운 소멸의 껍데기', nameEn:'Holy Shell of Annihilation', difficulty:41, killTarget:276},
        {id:397, name:'외신의 그릇이 된 여신', nameEn:'Goddess Become Outer God\'s Vessel', difficulty:42, killTarget:279},
        {id:398, name:'부패한 소멸의 폭풍', nameEn:'Storm of Corrupted Annihilation', difficulty:42, killTarget:281},
        {id:399, name:'소멸의 여신의 마지막 노래', nameEn:'Annihilation Goddess\'s Final Song', difficulty:42, killTarget:284},
        {id:400, name:'타락한 소멸의 여신', nameEn:'Fallen Annihilation Goddess', difficulty:43, killTarget:286, isBoss:true},
      ]
    },
  ],

  // [UPDATE 2026-07-11] 260711_MTOPC.md 4번 전면 개편: 7단계 등급 재배치 + 중복효과 약캐/강캐 페어링 +
  // 십이지신 6종 신규효과 교체(중복 해소) + 오행 배정(element 필드, 10번 태스크에서 사용)
  // ⚠️ 골드/던전재화/동료스탯 관련 6종 신규효과 수치는 문서에 구체적 %가 없어 유사 효과 규모 참고해 임의 책정 — 밸런스 조정 대상
  pets: [
    { id:'hoya',     name:'호야',         nameEn:'Hoya',               icon:'🐯', rarity:'uncommon', element:'metal', // [UPDATE 2026-07-11] 'gold'는 오행 체계에 없는 값(정상값은 metal) — 이 펫만 상생/상극/트리니티 계산에서 조용히 누락되던 버그 수정
      desc:'방어력 +20%. 주기적으로 주변 적을 위협해 이동속도 감소.',
      descEn:'DEF +20%. Periodically intimidates nearby enemies, reducing their movement speed.',
      color:'#c0d0ff', effect:'defense',  value:0.20 },
    { id:'crow',     name:'까마귀 삼신',  nameEn:'Three-God Crow',     icon:'🐦‍⬛', rarity:'uncommon', element:'metal',
      desc:'가까운 적 1명에게 약점 표식. 표식된 적은 받는 피해 +20%.',
      descEn:'Marks 1 nearby enemy as weak. Marked enemy takes 20% more damage.',
      color:'#404060', effect:'mark', markCount:1, value:0.20 },
    { id:'fox',      name:'여우령',       nameEn:'Fox Spirit',         icon:'🦊', rarity:'common', element:'fire',
      desc:'치명타 확률 +15%. 치명타 시 1.8배 피해.',
      descEn:'Crit Rate +15%. Crit hits deal 1.8× damage.',
      color:'#e08040', effect:'crit',     value:0.15 },
    { id:'turtle',   name:'거북령',       nameEn:'Turtle Spirit',      icon:'🐢', rarity:'common', element:'water',
      desc:'매 3초마다 HP 8 회복.',
      descEn:'Restores 8 HP every 3 seconds.',
      color:'#40a060', effect:'regen',    value:8 },
    { id:'chonggak', name:'총각신',       nameEn:'Chonggak Spirit',    icon:'👻', rarity:'common', element:'water',
      desc:'주기적으로 무작위 적에게 1.5초 혼란 부여.',
      descEn:'Periodically inflicts 1.5-second confusion on random enemies.',
      color:'#8080e0', effect:'confuse',  value:1.5 },
    { id:'tuju',     name:'터주신',       nameEn:'House Guardian',     icon:'🏠', rarity:'rare', element:'earth',
      desc:'XP 획득량 +30%.',
      descEn:'XP gain +30%.',
      color:'#d0a040', effect:'xp_boost', value:0.30 },
    { id:'dokkaebi', name:'도깨비',       nameEn:'Dokkaebi',           icon:'👺', rarity:'common', element:'metal',
      desc:'가까운 적을 주기적으로 밀쳐낸다.',
      descEn:'Periodically pushes back nearby enemies.',
      color:'#d04020', effect:'knockback', value:100 },
    { id:'rabbit',   name:'달토끼',       nameEn:'Moon Rabbit',        icon:'🐰', rarity:'rare', element:'water',
      desc:'무기 쿨타임 -22%.',
      descEn:'Weapon cooldown -22%.',
      color:'#f0c0e0', effect:'cooldown', value:0.22 },
    // [UPDATE 2026-07-17] 도깨비 계열 신규 펫 2종 (싸리/공이)
    { id:'ssari',    name:'싸리',         nameEn:'Ssari',              icon:'🧹', rarity:'common', element:'wood',
      desc:'주변 아이템을 대신 주워온다. 강다리보다 느리지만 훨씬 넓은 범위를 훑는다.',
      descEn:'Fetches nearby items. Slower than Barkley, but sweeps a much wider range.',
      color:'#c8a860', effect:'autoCollect', value:45, fetchRangeMult:5, pullRadius:160 },
    { id:'gongi',    name:'공이',         nameEn:'Gongi',              icon:'⚱️', rarity:'common', element:'earth',
      desc:'매 3초마다 HP 7 회복.',
      descEn:'Restores 7 HP every 3 seconds.',
      color:'#d8c8a0', effect:'regen', value:7 },
    // ── 십이지신 ──
    { id:'zodiac_rat',     name:'똘기',    nameEn:'Pip',    icon:'🐭', rarity:'uncommon', element:'water', // [UPDATE 2026-07-11] 십이지신 애칭
      desc:'동료 방어력(받는 피해 감소) +15%. 영리한 쥐신의 가호.',
      descEn:'Companion damage taken -15%. Blessing of the clever Rat God.',
      color:'#b090e0', effect:'compDef',  value:0.15 },
    { id:'zodiac_ox',      name:'떵이',    nameEn:'Barnaby',  icon:'🐂', rarity:'uncommon', element:'earth',
      desc:'동료 최대 HP +20%. 묵묵한 소신의 가호.',
      descEn:'Companion max HP +20%. Blessing of the steadfast Ox God.',
      color:'#a07850', effect:'compHp',   value:0.20 },
    { id:'zodiac_tiger',   name:'호치',    nameEn:'Stripes', icon:'🐯', rarity:'unique', element:'metal',
      desc:'치명타 확률 +25%. 맹렬한 범신의 기운.',
      descEn:'Crit Rate +25%. Ferocity of the Tiger God.',
      color:'#e06820', effect:'crit',      value:0.25 },
    { id:'zodiac_rabbit',  name:'새초미',  nameEn:'Pixie', icon:'🐇', rarity:'uncommon', element:'wood',
      desc:'무기 쿨타임 -15%. 날쌘 토끼신의 가호.',
      descEn:'Weapon cooldown -15%. Blessing of the nimble Rabbit God.',
      color:'#60d090', effect:'cooldown',  value:0.15 },
    { id:'zodiac_dragon',  name:'드라고',    nameEn:'Drake', icon:'🐲', rarity:'unique', element:'earth',
      desc:'주변 적을 강력하게 밀쳐낸다. 용신의 위엄.',
      descEn:'Powerfully pushes back nearby enemies. Dignity of the Dragon God.',
      color:'#40c8ff', effect:'knockback', value:180 },
    { id:'zodiac_snake',   name:'요롱이',    nameEn:'Slinky', icon:'🐍', rarity:'rare', element:'fire',
      desc:'가까운 적 3명에게 약점 표식. 표식된 적은 받는 피해 +15%. 뱀신의 독기.',
      descEn:'Marks 3 nearby enemies as weak, each taking 15% more damage. Venom of the Snake God.',
      color:'#50b840', effect:'mark', markCount:3, value:0.15 },
    { id:'zodiac_horse',   name:'마초',    nameEn:'Dash',  icon:'🐴', rarity:'rare', element:'fire',
      desc:'아이템 흡수 범위 +75. 빠른 말신의 가호.',
      descEn:'Item attraction range +75. Blessing of the swift Horse God.',
      color:'#80c0f0', effect:'magnet',    value:1.5 },
    { id:'zodiac_goat',    name:'미미',    nameEn:'Mimi',  icon:'🐑', rarity:'rare', element:'earth',
      desc:'골드 획득량 +25%. 온화한 양신의 가호.',
      descEn:'Gold gain +25%. Blessing of the gentle Goat God.',
      color:'#d8d8c0', effect:'goldBoost', value:0.25 },
    { id:'zodiac_monkey',  name:'뭉치', nameEn:'Scrappy', icon:'🐒', rarity:'rare', element:'metal',
      desc:'주기적으로 적 혼란 부여(2.5초, 범위 확대). 교활한 원숭이신.',
      descEn:'Periodically confuses enemies for 2.5s in a wider area. The crafty Monkey God.',
      color:'#c09050', effect:'confuse',   value:2.5, confuseRangeMult:1.4 },
    { id:'zodiac_rooster', name:'키키',    nameEn:'Feather', icon:'🐓', rarity:'rare', element:'metal',
      desc:'동료 공격력 +15%. 새벽을 여는 닭신의 가호.',
      descEn:'Companion ATK +15%. Blessing of the Rooster God who heralds the dawn.',
      color:'#e0c040', effect:'compAtk',  value:0.15 },
    { id:'zodiac_dog',     name:'강다리',    nameEn:'Barkley',  icon:'🐕', rarity:'unique', element:'earth',
      desc:'플레이어 주변 골드·경험치를 자동으로 찾아가 수집한다. 충직한 개신의 수호.',
      descEn:'Automatically seeks out and collects nearby gold/XP orbs. Protection of the loyal Dog God.',
      color:'#4060b0', effect:'autoCollect', value:70 },
    { id:'zodiac_pig',     name:'찡찡이',  nameEn:'Pudge', icon:'🐷', rarity:'uncommon', element:'water',
      desc:'특화 던전 재화 획득량 +25%. 풍요로운 돼지신.',
      descEn:'Special dungeon currency gain +25%. The bountiful Pig God.',
      color:'#f0a0b0', effect:'specialBoost', value:0.25 },
    // ── [UPDATE 2026-07-06] 시즌2 유명계 펫 ──
    { id:'jeoseung_nabi', name:'저승나비',   nameEn:'Netherworld Butterfly', icon:'🦋', rarity:'rare', element:'wood',
      desc:'영혼 조각/영혼석 획득량 +20%. 망자를 인도하는 나비.',
      descEn:'Soul Fragment/Stone gain +20%. A butterfly that guides the departed.',
      color:'#4060a0', effect:'soulBoost',  value:0.20, season2:true },
    { id:'sangsahwa',     name:'상사화',     nameEn:'Sangsahwa',             icon:'🌺', rarity:'unique', element:'wood',
      desc:'사망 시 1회 자동부활 (HP 50%). 바리공주의 애화(愛花).',
      descEn:'Auto-revive once on death (50% HP). The beloved flower of Bari-gongju.',
      color:'#c04060', effect:'autoRevive', value:1, season2:true, storyUnlock:200 },
  ],
};

// [UPDATE 2026-07-15] 초보자 선물(스테이지1~20 최초클리어 보너스) 공식 — game.js(실제 클리어 지급)와
// promo-codes.js(소급보상 코드, 이미 클리어한 스테이지분만 합산 지급) 둘 다에서 공유해서 쓰는 순수 함수.
function beginnerGiftFor(stageId) {
  if (stageId < 1 || stageId > 20) return [];
  const parts = [{ key:'gold', amount: stageId * 10000 }];
  if (stageId >= 5)  parts.push({ key:'gems',           amount: 500 + (stageId-5)*100 });
  if (stageId >= 10) parts.push({ key:'ganghwaseok',    amount: 500 + (stageId-10)*100 });
  if (stageId >= 15) parts.push({ key:'cheonryeonggwa', amount: 500 + (stageId-15)*100 });
  return parts;
}

// [UPDATE 2026-07-17] 260713_MTOPC.md 9번③: 혼돈 시장 재고 롤 — 스테이지 입장마다(game.js) +
// 로비 시장 다이얼로그 최초 오픈 시(재고 없을 때, lobby.js) 양쪽에서 호출하는 순수 함수.
// 재고 풀: 낮은 확률로 다른 계 재화도 등장(혼돈=질서 없음 컨셉) — 가격은 혼돈석 기준 10~50 랜덤.
const CHAOS_MARKET_POOL = ['ganghwaseok','cheonunseok','cheonryeonggwa','taegeukseok','chaewonseok','soulStones','sullriseok'];
function rollChaosMarketStock() {
  const pool = [...CHAOS_MARKET_POOL];
  const stock = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const key = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    stock.push({ key, amount: 5 + Math.floor(Math.random() * 16), price: 10 + Math.floor(Math.random() * 41) });
  }
  return stock;
}

// [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑤: 종합 전투력 지수 — 영구저장 데이터만 기준(런 중 임시 보조무기/스탯픽은
// 세이브에 없어 집계 불가). 가중치는 1차 추정치, 실플레이 데이터로 추후 튜닝 필요.
function computeBattlePower(saveData) {
  let power = 0;
  const mains = saveData.selectedMainWeapons || [saveData.selectedMainWeapon || 'talisman'];
  for (const wid of mains) {
    if (!wid) continue;
    const bsLv = (saveData.weaponLevels || {})[wid] || 1;
    const g = (typeof computeWeaponGrowth === 'function') ? computeWeaponGrowth(bsLv) : { lv:1, awakLv:0 };
    const tRank = (saveData.weaponTranscend || {})[wid] || 0;
    power += g.lv * 3 + g.awakLv * 20 + tRank * 40;
  }
  for (const cid of (saveData.activeCompanions || [])) {
    power += (saveData.companionStars?.[cid] || 0) * 15 + (saveData.companionAwakening?.[cid] || 0) * 30;
  }
  for (const pid of (saveData.activePets || [])) {
    power += (saveData.petLevels?.[pid] || 1) * 8;
  }
  power += Object.values(saveData.statUpgrades || {}).reduce((a,b) => a+b, 0) * 2;
  power += Object.values(saveData.sinmokUpgrades || {}).reduce((a,b) => a+b, 0) * 5;
  power += Object.values(saveData.sinmokS2 || {}).reduce((a,b) => a+b, 0) * 6;
  return Math.floor(power);
}

// [UPDATE 2026-07-16] 260716_MTOPC.md 2번⑤: 던전강화 레벨 대비 전투력 등급 — 1차 추정 임계값
// [UPDATE 2026-07-17] 실플레이 캘리브레이션: 전투력 2376 기준 던전강화 레벨8("7000킬")이 "딱 적정" 체감이라는
// 피드백으로 기준 상수를 150→245로 상향(2376/8/1.2≈247.5 → 딱 "적정" 경계에 걸리도록 245로 반올림).
// 기존 상수(150)는 레벨8에서 ratio 1.98로 여유롭게 "적정"이 나와서 실제 체감(빠듯함)과 안 맞았음.
function battlePowerRatingFor(power, dungeonLv) {
  if (!dungeonLv) return 'safe';
  const expected = dungeonLv * 245;
  const ratio = power / Math.max(1, expected);
  if (ratio >= 1.2) return 'safe';
  if (ratio >= 0.7) return 'risky';
  return 'danger';
}

// ── 건물 데이터 ──
// 건물 강화 비용: { gold, cheonunseok } 형태
GAME_DATA.buildings = [
  {
    id: 'daejanggan', name: '대장간', nameEn: 'Blacksmith', icon: '⚒️',
    desc: '무기를 제련하는 곳. 강화할수록 무기 강화 비용이 할인된다.',
    descEn: 'A forge for weapons. Higher levels discount weapon upgrade costs.',
    role: '주무기 해금 및 강화',
    roleEn: 'Weapon unlock & upgrade',
    levels: [
      { lv:1, label:'폐허',   labelEn:'Ruins',       cost:{ gold:0,    cheonunseok:0 }, effect: null },
      { lv:2, label:'복구',   labelEn:'Restored',    cost:{ gold:300,  cheonunseok:200  }, effect: { type:'weapon_discount', pct:5  } },
      { lv:3, label:'활성화', labelEn:'Active',      cost:{ gold:800,  cheonunseok:600  }, effect: { type:'weapon_discount', pct:10 } },
      { lv:4, label:'축복',   labelEn:'Blessed',     cost:{ gold:2000, cheonunseok:1600 }, effect: { type:'weapon_discount', pct:20 } },
      { lv:5, label:'신령화', labelEn:'Spiritized',  cost:{ gold:5000, cheonunseok:4000 }, effect: { type:'weapon_discount', pct:30 } },
    ],
  },
  {
    id: 'uiwon', name: '의원당', nameEn: 'Companion Hall', icon: '👥',
    desc: '동료들이 모이는 곳. 강화할수록 동료 강화 비용이 할인된다.',
    descEn: 'A gathering place for companions. Higher levels discount companion upgrade costs.',
    role: '동료 해금 및 강화',
    roleEn: 'Companion unlock & upgrade',
    levels: [
      { lv:1, label:'폐허',   labelEn:'Ruins',       cost:{ gold:0,    cheonunseok:0 }, effect: null },
      { lv:2, label:'복구',   labelEn:'Restored',    cost:{ gold:400,  cheonunseok:200  }, effect: { type:'companion_discount', pct:5  } },
      { lv:3, label:'활성화', labelEn:'Active',      cost:{ gold:1000, cheonunseok:600  }, effect: { type:'companion_discount', pct:10 } },
      { lv:4, label:'축복',   labelEn:'Blessed',     cost:{ gold:2500, cheonunseok:1600 }, effect: { type:'companion_discount', pct:20 } },
      { lv:5, label:'신령화', labelEn:'Spiritized',  cost:{ gold:6000, cheonunseok:4000 }, effect: { type:'companion_discount', pct:30 } },
    ],
  },
  {
    id: 'seonang', name: '서낭당', nameEn: 'Guardian Shrine', icon: '⛩️',
    desc: '던전의 문을 여는 곳. 강화할수록 던전 수익이 증가한다.',
    descEn: 'The gateway to dungeons. Higher levels increase dungeon rewards.',
    role: '무한 던전 · 보스러쉬 해금',
    roleEn: 'Infinite Dungeon & Boss Rush unlock',
    levels: [
      { lv:1, label:'폐허',   labelEn:'Ruins',       cost:{ gold:0,    cheonunseok:0 }, effect: null },
      { lv:2, label:'복구',   labelEn:'Restored',    cost:{ gold:500,  cheonunseok:400  }, effect: { type:'dungeon_income', pct:5  } },
      { lv:3, label:'활성화', labelEn:'Active',      cost:{ gold:1200, cheonunseok:1000 }, effect: { type:'dungeon_income', pct:10 } },
      { lv:4, label:'축복',   labelEn:'Blessed',     cost:{ gold:3000, cheonunseok:2000 }, effect: { type:'dungeon_income', pct:20 } },
      { lv:5, label:'신령화', labelEn:'Spiritized',  cost:{ gold:7000, cheonunseok:5000 }, effect: { type:'dungeon_income', pct:35 } },
    ],
  },
  {
    id: 'jangsang', name: '장승당', nameEn: 'Totem Hall', icon: '🗿',
    desc: '강화석과 천운석을 캐는 던전의 수호신. 강화할수록 던전 수익이 증가한다.',
    descEn: 'Guardian deity of dungeons that mine Forge Stones and Luck Stones. Higher levels increase dungeon rewards.',
    role: '강화석·천운석 던전 해금',
    roleEn: 'Forge Stone & Luck Stone dungeon unlock',
    levels: [
      { lv:1, label:'폐허',   labelEn:'Ruins',       cost:{ gold:0,    cheonunseok:0 }, effect: null },
      { lv:2, label:'복구',   labelEn:'Restored',    cost:{ gold:600,  cheonunseok:400  }, effect: { type:'dungeon_income', pct:5  } },
      { lv:3, label:'활성화', labelEn:'Active',      cost:{ gold:1500, cheonunseok:1000 }, effect: { type:'dungeon_income', pct:10 } },
      { lv:4, label:'축복',   labelEn:'Blessed',     cost:{ gold:3500, cheonunseok:2400 }, effect: { type:'dungeon_income', pct:20 } },
      { lv:5, label:'신령화', labelEn:'Spiritized',  cost:{ gold:8000, cheonunseok:6000 }, effect: { type:'dungeon_income', pct:35 } },
    ],
  },
  {
    id: 'yongwang', name: '용왕 연못', nameEn: 'Dragon King Pond', icon: '🐉',
    desc: '용왕의 기운이 깃든 연못. 펫들의 능력을 강화한다.',
    descEn: "A pond imbued with the Dragon King's power. Enhances pet abilities.",
    role: '펫 해금·강화, 천령과 던전',
    roleEn: 'Pet unlock & upgrade, Spirit Fruit dungeon',
    levels: [
      { lv:1, label:'폐허',   labelEn:'Ruins',       cost:{ gold:0,    cheonunseok:0 }, effect: null },
      { lv:2, label:'복구',   labelEn:'Restored',    cost:{ gold:700,  cheonunseok:600  }, effect: { type:'dungeon_income', pct:5  } },
      { lv:3, label:'활성화', labelEn:'Active',      cost:{ gold:1800, cheonunseok:1400 }, effect: { type:'dungeon_income', pct:10 } },
      { lv:4, label:'축복',   labelEn:'Blessed',     cost:{ gold:4000, cheonunseok:3000 }, effect: { type:'dungeon_income', pct:20 } },
      { lv:5, label:'신령화', labelEn:'Spiritized',  cost:{ gold:9000, cheonunseok:7000 }, effect: { type:'dungeon_income', pct:35 } },
    ],
  },
  {
    id: 'sinmok', name: '신목', nameEn: 'Sacred Tree', icon: '🌳',
    desc: '귀인국의 신성한 나무. 주무기 슬롯을 늘리고 태극석 던전을 해금한다.',
    descEn: 'The sacred tree of Gwi-In-Guk. Increases weapon slots and unlocks the Taegeuk Stone dungeon.',
    role: '주무기 슬롯 증가, 태극석 던전',
    roleEn: 'Weapon slot increase, Taegeuk Stone dungeon',
    levels: [
      { lv:1, label:'폐허',   labelEn:'Ruins',       cost:{ gold:0,     cheonunseok:0 }, effect: null },
      { lv:2, label:'복구',   labelEn:'Restored',    cost:{ gold:800,   cheonunseok:600  }, effect: { type:'slot_discount', pct:5  } },
      { lv:3, label:'활성화', labelEn:'Active',      cost:{ gold:2000,  cheonunseok:1600 }, effect: { type:'slot_discount', pct:10 } },
      { lv:4, label:'축복',   labelEn:'Blessed',     cost:{ gold:5000,  cheonunseok:4000 }, effect: { type:'slot_discount', pct:20 } },
      { lv:5, label:'신령화', labelEn:'Spiritized',  cost:{ gold:10000, cheonunseok:10000}, effect: { type:'slot_discount', pct:30 } },
    ],
  },
];
