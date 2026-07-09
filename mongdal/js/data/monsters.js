// monsters.js - 챕터별 몬스터 데이터

const MONSTERS = {

  // ── 챕터별 스폰 풀 (확률 반영: 가중치 많을수록 자주 나옴) ──
  byChapter: {
    1: ['mangryeong','mangryeong','mangryeong','wongwi','wongwi'],
    2: ['hungry_soul','hungry_soul','hungry_soul','hungry_soul','gokseong','gokseong'],
    3: ['corrupted','corrupted','corrupted','cursed_doll','cursed_doll','cursed_doll'],
    4: ['tree_spirit','tree_spirit','masked_fox','masked_fox','masked_fox'],
    5: ['abyss_worm','abyss_worm','abyss_worm','chaos_eye','chaos_eye'],
    6: ['underworld_soldier','underworld_soldier','underworld_soldier','soul_reaper','soul_reaper'],
    7: ['void_acolyte','void_acolyte','void_acolyte','void_tendril','void_tendril'],
    8: ['memory_thief','memory_thief','memory_thief','oblivion_shade','oblivion_shade'],
    9: ['fallen_spirit','fallen_spirit','fallen_spirit','spirit_shadow','spirit_shadow'],
    10: ['chaos_soldier','chaos_soldier','chaos_soldier','abyss_knight','abyss_knight'],
    // ── 시즌 2 ──
    11: ['hwangcheon_shade','hwangcheon_shade','hwangcheon_shade','ghost_barge','ghost_barge'],
    12: ['dead_wanderer','dead_wanderer','dead_wanderer','trapped_soul','trapped_soul'],
    13: ['memory_orb','memory_orb','dark_specter','dark_specter','dark_specter'],
    14: ['burning_tome','burning_tome','burning_tome','judgment_post','judgment_post'],
    15: ['infernal_brute','infernal_brute','black_flame_demon','black_flame_demon','black_flame_demon'],
    16: ['void_spider','void_spider','void_spider','stone_corpse','stone_corpse'],
    17: ['lost_mummy','lost_mummy','lost_mummy','cyclops_soldier','cyclops_soldier'],
    18: ['palace_demon','palace_demon','palace_demon','cursed_herald','cursed_herald'],
    19: ['fate_scales','fate_scales','tentacle_cursed','tentacle_cursed','tentacle_cursed'],
    20: ['death_tome','death_tome','death_tome','chaos_acrobat','chaos_acrobat'],
  },

  // ── 몬스터 정의 ──
  defs: {

    // ───────────────────────
    //  챕터 1: 잊혀진 무덤
    // ───────────────────────
    mangryeong: {
      name:'망령', chapter:1, type:'normal',
      hp:15, damage:7, speed:62, xp:2, gold:2, size:13,
      color:'#8088d8', glowColor:'rgba(100,110,210,0.4)',
      shape:'ghost', attackPattern:'melee',
      desc:'떠도는 망자의 영혼. 무리를 지어 플레이어를 에워싼다.',
    },
    wongwi: {
      name:'원귀', chapter:1, type:'normal',
      hp:30, damage:14, speed:80, xp:4, gold:4, size:15,
      color:'#6040c8', glowColor:'rgba(80,50,210,0.4)',
      shape:'brute', attackPattern:'rush',
      desc:'강한 원한을 품은 귀신. 주기적으로 플레이어를 향해 돌진한다.',
    },

    // ───────────────────────
    //  챕터 2: 안개의 폐촌
    // ───────────────────────
    hungry_soul: {
      name:'굶주린 혼', chapter:2, type:'normal',
      hp:12, damage:8, speed:90, xp:2, gold:2, size:10,
      color:'#4048a0', glowColor:'rgba(50,60,160,0.4)',
      shape:'orb', attackPattern:'swarm',
      desc:'배고픔으로 미쳐버린 영혼. 작고 빠르며 무리 지어 나타난다.',
    },
    gokseong: {
      name:'곡성귀', chapter:2, type:'normal',
      hp:50, damage:18, speed:38, xp:6, gold:6, size:20,
      color:'#5055a0', glowColor:'rgba(60,65,160,0.4)',
      shape:'blob', attackPattern:'melee',
      desc:'울음소리로 공포를 퍼뜨리는 귀신. 느리지만 피해가 크다.',
    },

    // ───────────────────────
    //  챕터 3: 타락한 서낭당
    // ───────────────────────
    corrupted: {
      name:'타락한 신도', chapter:3, type:'normal',
      hp:38, damage:12, speed:52, xp:5, gold:5, size:14,
      color:'#c04040', glowColor:'rgba(200,50,50,0.4)',
      shape:'ghost', attackPattern:'ranged',
      desc:'외신에 세뇌된 신도. 저주받은 부적을 원거리로 날린다.',
    },
    cursed_doll: {
      name:'저주 인형', chapter:3, type:'normal',
      hp:22, damage:25, speed:48, xp:4, gold:4, size:12,
      color:'#804030', glowColor:'rgba(130,50,30,0.4)',
      shape:'orb', attackPattern:'explode',
      desc:'저주가 깃든 인형. 죽을 때 주변에 폭발 피해를 입힌다.',
    },

    // ───────────────────────
    //  챕터 4: 신령의 숲
    // ───────────────────────
    tree_spirit: {
      name:'나무 정령', chapter:4, type:'normal',
      hp:90, damage:20, speed:28, xp:9, gold:9, size:22,
      color:'#409030', glowColor:'rgba(50,140,40,0.4)',
      shape:'brute', attackPattern:'melee',
      desc:'고목에 깃든 정령. 느리지만 체력이 매우 높다.',
    },
    masked_fox: {
      name:'가면 여우', chapter:4, type:'normal',
      hp:48, damage:16, speed:95, xp:7, gold:7, size:13,
      color:'#d08828', glowColor:'rgba(210,130,30,0.4)',
      shape:'ghost', attackPattern:'rush',
      desc:'가면을 쓴 여우 정령. 빠른 속도로 기습하고 도망간다.',
    },

    // ───────────────────────
    //  챕터 5: 혼돈의 균열
    // ───────────────────────
    abyss_worm: {
      name:'심연충', chapter:5, type:'normal',
      hp:65, damage:22, speed:68, xp:8, gold:8, size:17,
      color:'#300850', glowColor:'rgba(50,10,90,0.4)',
      shape:'blob', attackPattern:'melee',
      desc:'심연에서 기어나온 벌레. 질긴 생명력을 가진다.',
    },
    chaos_eye: {
      name:'혼돈의 눈', chapter:5, type:'normal',
      hp:35, damage:20, speed:42, xp:7, gold:7, size:15,
      color:'#900090', glowColor:'rgba(140,0,140,0.4)',
      shape:'orb', attackPattern:'ranged',
      desc:'혼돈 그 자체인 눈. 에너지 빔을 발사하여 원거리를 공격한다.',
    },

    // ───────────────────────
    //  챕터 6: 저승의 문
    // ───────────────────────
    underworld_soldier: {
      name:'저승 병사', chapter:6, type:'normal',
      hp:120, damage:28, speed:55, xp:10, gold:10, size:18,
      color:'#2040a0', glowColor:'rgba(30,50,170,0.4)',
      shape:'brute', attackPattern:'melee',
      desc:'저승왕을 섬기는 갑옷 병사. 높은 방어력과 묵직한 타격을 가진다.',
    },
    soul_reaper: {
      name:'혼 수확자', chapter:6, type:'normal',
      hp:80, damage:32, speed:72, xp:10, gold:10, size:15,
      color:'#103070', glowColor:'rgba(15,45,120,0.4)',
      shape:'ghost', attackPattern:'rush',
      desc:'낫을 들고 혼을 거두는 존재. 빠르게 접근해 단번에 베어낸다.',
    },

    // ───────────────────────
    //  챕터 7: 외신의 제단
    // ───────────────────────
    void_acolyte: {
      name:'공허 신도', chapter:7, type:'normal',
      hp:100, damage:30, speed:60, xp:12, gold:12, size:16,
      color:'#500080', glowColor:'rgba(80,0,140,0.4)',
      shape:'ghost', attackPattern:'ranged',
      desc:'외신에게 헌신한 광신도. 공허 에너지 구체를 원거리로 투척한다.',
    },
    void_tendril: {
      name:'공허의 촉수', chapter:7, type:'normal',
      hp:60, damage:35, speed:30, xp:11, gold:11, size:20,
      color:'#300050', glowColor:'rgba(50,0,90,0.4)',
      shape:'blob', attackPattern:'explode',
      desc:'땅에서 솟아오른 공허의 촉수. 느리지만 폭발적 피해를 입힌다.',
    },

    // ───────────────────────
    //  챕터 8: 기억의 폐허
    // ───────────────────────
    memory_thief: {
      name:'기억 약탈자', chapter:8, type:'normal',
      hp:90, damage:33, speed:88, xp:13, gold:13, size:14,
      color:'#606080', glowColor:'rgba(90,90,130,0.4)',
      shape:'ghost', attackPattern:'swarm',
      desc:'기억을 먹고 사는 존재. 빠르게 무리 지어 플레이어를 압박한다.',
    },
    oblivion_shade: {
      name:'망각의 유령', chapter:8, type:'normal',
      hp:150, damage:25, speed:35, xp:14, gold:14, size:22,
      color:'#404060', glowColor:'rgba(60,60,100,0.4)',
      shape:'brute', attackPattern:'melee',
      desc:'완전히 잊혀진 존재. 거대하고 느리지만 체력이 압도적이다.',
    },

    // ───────────────────────
    //  챕터 9: 신령의 무덤
    // ───────────────────────
    fallen_spirit: {
      name:'타락한 신령', chapter:9, type:'normal',
      hp:130, damage:38, speed:50, xp:16, gold:16, size:19,
      color:'#306050', glowColor:'rgba(40,100,70,0.4)',
      shape:'blob', attackPattern:'ranged',
      desc:'혼돈에 물든 신령. 신성한 힘이 독으로 변해 독성 장판을 깐다.',
    },
    spirit_shadow: {
      name:'신령의 그림자', chapter:9, type:'normal',
      hp:80, damage:42, speed:95, xp:15, gold:15, size:13,
      color:'#204030', glowColor:'rgba(30,70,50,0.4)',
      shape:'ghost', attackPattern:'rush',
      desc:'신령에서 분리된 어두운 그림자. 극도로 빠르며 기습에 특화됐다.',
    },

    // ───────────────────────
    //  챕터 10: 혼돈의 왕좌
    // ───────────────────────
    chaos_soldier: {
      name:'혼돈 병사', chapter:10, type:'normal',
      hp:180, damage:40, speed:62, xp:18, gold:18, size:20,
      color:'#601010', glowColor:'rgba(110,15,15,0.4)',
      shape:'brute', attackPattern:'melee',
      desc:'혼돈 자체로 만들어진 전사. 맞을수록 분노해 공격속도가 빨라진다.',
    },
    abyss_knight: {
      name:'심연 기사', chapter:10, type:'normal',
      hp:220, damage:45, speed:40, xp:20, gold:20, size:24,
      color:'#400010', glowColor:'rgba(80,0,20,0.4)',
      shape:'brute', attackPattern:'melee',
      desc:'심연에서 소환된 최강의 기사. 느리지만 광역 충격파로 주변을 쓸어버린다.',
    },

    // ───────────────────────
    //  챕터 11: 황천강 건너편
    // ───────────────────────
    hwangcheon_shade: {
      name:'황천 망령', chapter:11, type:'normal',
      hp:240, damage:48, speed:58, xp:22, gold:22, size:16,
      color:'#304080', glowColor:'rgba(40,60,140,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'황천강을 떠도는 망령. 강물의 기운을 머금어 움직임이 물처럼 유연하다.',
    },
    ghost_barge: {
      name:'유령 뱃길', chapter:11, type:'normal',
      hp:280, damage:42, speed:38, xp:24, gold:24, size:22,
      color:'#203060', glowColor:'rgba(25,45,110,0.5)',
      shape:'brute', attackPattern:'rush',
      desc:'황천강의 유령선. 느리지만 닿는 것을 모두 저승으로 끌어당긴다.',
    },

    // ───────────────────────
    //  챕터 12: 망자의 거리
    // ───────────────────────
    dead_wanderer: {
      name:'망자 방랑자', chapter:12, type:'normal',
      hp:260, damage:50, speed:62, xp:24, gold:24, size:15,
      color:'#506070', glowColor:'rgba(70,85,110,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'갈 곳 잃은 망자. 거리를 헤매며 산 자의 기운을 탐한다.',
    },
    trapped_soul: {
      name:'갇힌 혼', chapter:12, type:'normal',
      hp:200, damage:55, speed:85, xp:22, gold:22, size:12,
      color:'#304850', glowColor:'rgba(40,70,80,0.5)',
      shape:'orb', attackPattern:'swarm',
      desc:'자루 속에 갇힌 혼령. 작고 빠르며 고통의 울음으로 주변을 교란한다.',
    },

    // ───────────────────────
    //  챕터 13: 기억의 미궁
    // ───────────────────────
    memory_orb: {
      name:'기억 수정구', chapter:13, type:'normal',
      hp:230, damage:52, speed:50, xp:26, gold:26, size:14,
      color:'#506090', glowColor:'rgba(70,85,150,0.5)',
      shape:'orb', attackPattern:'melee',
      desc:'기억의 파편이 뭉쳐 만들어진 수정구. 닿으면 기억이 조각난다.',
    },
    dark_specter: {
      name:'어둠 망령', chapter:13, type:'normal',
      hp:270, damage:56, speed:70, xp:26, gold:26, size:17,
      color:'#502060', glowColor:'rgba(80,30,100,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'기억이 완전히 지워진 망령. 정체를 잃어 더욱 위험하다.',
    },

    // ───────────────────────
    //  챕터 14: 환생의 전당
    // ───────────────────────
    burning_tome: {
      name:'업화 서책', chapter:14, type:'normal',
      hp:250, damage:58, speed:55, xp:28, gold:28, size:16,
      color:'#804010', glowColor:'rgba(140,65,15,0.5)',
      shape:'blob', attackPattern:'ranged',
      desc:'업보의 기록이 불길에 휩싸인 서책. 불꽃 조각을 날려 공격한다.',
    },
    judgment_post: {
      name:'저승 이정표', chapter:14, type:'normal',
      hp:300, damage:50, speed:30, xp:28, gold:28, size:20,
      color:'#604020', glowColor:'rgba(100,65,30,0.4)',
      shape:'brute', attackPattern:'melee',
      desc:'저승길의 방향을 틀어버리는 이정표. 느리지만 엄청난 무게감으로 짓누른다.',
    },

    // ───────────────────────
    //  챕터 15: 명부의 심장
    // ───────────────────────
    infernal_brute: {
      name:'지옥 거인', chapter:15, type:'normal',
      hp:340, damage:60, speed:48, xp:30, gold:30, size:22,
      color:'#802020', glowColor:'rgba(140,30,30,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'명부의 심장부를 지키는 외눈 거인. 철퇴 일격으로 땅을 뒤흔든다.',
    },
    black_flame_demon: {
      name:'흑염 마귀', chapter:15, type:'normal',
      hp:280, damage:65, speed:72, xp:30, gold:30, size:16,
      color:'#101010', glowColor:'rgba(15,15,15,0.7)',
      shape:'ghost', attackPattern:'rush',
      desc:'검은 불꽃으로 이루어진 마귀. 그을린 자리마다 어둠이 번진다.',
    },

    // ───────────────────────
    //  챕터 16: 잠식된 유명계
    // ───────────────────────
    void_spider: {
      name:'외신 거미', chapter:16, type:'normal',
      hp:310, damage:62, speed:65, xp:32, gold:32, size:20,
      color:'#301840', glowColor:'rgba(50,25,70,0.5)',
      shape:'blob', attackPattern:'swarm',
      desc:'외신의 기운에 잠식된 거대 거미. 등에 새겨진 주문이 공포를 퍼트린다.',
    },
    stone_corpse: {
      name:'이끼 석시', chapter:16, type:'normal',
      hp:400, damage:55, speed:30, xp:32, gold:32, size:24,
      color:'#304020', glowColor:'rgba(45,65,30,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'오염된 땅에서 일어난 이끼 덮인 석상. 극도로 느리지만 거의 파괴되지 않는다.',
    },

    // ───────────────────────
    //  챕터 17: 뒤틀린 저승길
    // ───────────────────────
    lost_mummy: {
      name:'미라 방랑자', chapter:17, type:'normal',
      hp:330, damage:64, speed:52, xp:34, gold:34, size:18,
      color:'#806040', glowColor:'rgba(140,100,60,0.4)',
      shape:'brute', attackPattern:'melee',
      desc:'뒤틀린 저승길에서 길을 잃은 미라. 이정표를 들고 다니지만 방향을 모른다.',
    },
    cyclops_soldier: {
      name:'외눈 저승병', chapter:17, type:'normal',
      hp:360, damage:68, speed:55, xp:34, gold:34, size:20,
      color:'#603020', glowColor:'rgba(110,50,30,0.5)',
      shape:'brute', attackPattern:'rush',
      desc:'저승 질서가 무너져 폭주한 외눈 병사. 분노로 가득 차 닥치는 대로 공격한다.',
    },

    // ───────────────────────
    //  챕터 18: 혼돈의 명부
    // ───────────────────────
    palace_demon: {
      name:'궁궐 악귀', chapter:18, type:'normal',
      hp:370, damage:70, speed:58, xp:36, gold:36, size:20,
      color:'#602040', glowColor:'rgba(110,30,65,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'명부의 궁궐을 점거한 악귀. 쟁반에 담긴 저주를 던지며 공격한다.',
    },
    cursed_herald: {
      name:'저주 전령', chapter:18, type:'normal',
      hp:320, damage:74, speed:68, xp:36, gold:36, size:17,
      color:'#401840', glowColor:'rgba(70,25,70,0.5)',
      shape:'ghost', attackPattern:'ranged',
      desc:'혼돈의 명령을 전달하는 전령. 저주를 담은 선물 쟁반을 원거리에서 던진다.',
    },

    // ───────────────────────
    //  챕터 19: 소멸의 경계
    // ───────────────────────
    fate_scales: {
      name:'운명의 저울', chapter:19, type:'normal',
      hp:350, damage:72, speed:40, xp:38, gold:38, size:22,
      color:'#204040', glowColor:'rgba(30,65,65,0.5)',
      shape:'blob', attackPattern:'explode',
      desc:'수명을 측정하는 저주받은 저울. 균형이 기울면 주변에 폭발적인 저주가 퍼진다.',
    },
    tentacle_cursed: {
      name:'촉수 저주인', chapter:19, type:'normal',
      hp:390, damage:76, speed:60, xp:38, gold:38, size:19,
      color:'#403050', glowColor:'rgba(70,45,90,0.5)',
      shape:'brute', attackPattern:'rush',
      desc:'소멸의 저주에 먹힌 인간. 머리에서 뻗어나온 촉수가 생명을 빨아들인다.',
    },

    // ───────────────────────
    //  챕터 20: 유명계의 왕좌
    // ───────────────────────
    death_tome: {
      name:'죽음의 서책', chapter:20, type:'normal',
      hp:420, damage:78, speed:50, xp:40, gold:40, size:20,
      color:'#200820', glowColor:'rgba(35,12,35,0.6)',
      shape:'blob', attackPattern:'ranged',
      desc:'유명계의 모든 죽음을 기록한 서책. 마귀들을 소환하며 스스로를 지킨다.',
    },
    chaos_acrobat: {
      name:'혼돈 곡예사', chapter:20, type:'normal',
      hp:380, damage:82, speed:88, xp:40, gold:40, size:17,
      color:'#401010', glowColor:'rgba(70,15,15,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'혼돈에 몸을 맡긴 역사(力士). 역관절로 뒤집힌 채 도끼를 휘두른다.',
    },
  },

  // ── 엘리트 몬스터 정의 (챕터쌍별 1종, 30초마다 출현) ──
  elites: {
    elite_ch1_2: {
      name:'강령귀', chapter:1, type:'elite',
      hp:120, damage:22, speed:55, xp:15, gold:15, size:22,
      color:'#6040c8', glowColor:'rgba(100,60,210,0.6)',
      shape:'brute', attackPattern:'rush',
      desc:'원귀가 강령술로 각성한 형태.',
    },
    elite_ch3_4: {
      name:'구미호령', chapter:3, type:'elite',
      hp:150, damage:28, speed:50, xp:18, gold:18, size:22,
      color:'#c06020', glowColor:'rgba(200,90,30,0.6)',
      shape:'ghost', attackPattern:'rush',
      desc:'가면을 쓴 여우 정령의 강화체.',
    },
    elite_ch5_6: {
      name:'혼돈의 대안', chapter:5, type:'elite',
      hp:180, damage:32, speed:42, xp:22, gold:22, size:22,
      color:'#900090', glowColor:'rgba(160,0,160,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'혼돈의 눈이 완전히 각성한 형태.',
    },
    elite_ch7_8: {
      name:'심연 거충', chapter:7, type:'elite',
      hp:220, damage:38, speed:38, xp:28, gold:28, size:22,
      color:'#300850', glowColor:'rgba(80,20,130,0.6)',
      shape:'blob', attackPattern:'melee',
      desc:'심연의 벌레가 완전히 성장한 형태.',
    },
    elite_ch9_10: {
      name:'대망령', chapter:9, type:'elite',
      hp:280, damage:45, speed:48, xp:35, gold:35, size:22,
      color:'#8088d8', glowColor:'rgba(130,140,230,0.6)',
      shape:'ghost', attackPattern:'rush',
      desc:'수천의 망령이 하나로 합쳐진 존재.',
    },
  },

  // ── 챕터별 보스 정보 (hp/dmg/spd/phases 포함) ──
  bosses: {
    // ── 시즌 1: 현계 ──
    1: {
      mid:   { id:'mid_boss',
        name:'묘지기',           nameEn:'The Gravekeeer',
        sub:'무덤을 지키는 자',   subEn:'Guardian of the Ancient Graves',
        color:'#6040a0', hp:900, dmg:22, spd:55,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave'],               interval:3.2 },
          { threshold:0.5, patterns:['rush','rush','shockwave','spiral'],interval:2.4 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 무당',           nameEn:'The Fallen Mudang',
        sub:'부적 탄막과 저주 장판의 화신', subEn:'Master of cursed talismans and hex fields',
        color:'#8020c0', hp:2200, dmg:32, spd:50,
        phases:[
          { threshold:1.0, patterns:['rush','sweep','summon'],               interval:3.5 },
          { threshold:0.6, patterns:['rush','sweep','spiral'],               interval:2.6 },
          { threshold:0.3, patterns:['spiral','spiral','sweep','rush'],      interval:1.8 },
        ]},
    },
    2: {
      mid:   { id:'mid_boss',
        name:'우물귀신',             nameEn:'Well Wraith',
        sub:'우물 깊숙이 숨어 있는 원혼', subEn:'A vengeful spirit lurking in the depths of the well',
        color:'#3060b0', hp:1100, dmg:25, spd:57,
        phases:[
          { threshold:1.0, patterns:['spiral','rush'],                       interval:3.2 },
          { threshold:0.5, patterns:['spiral','spiral','rush','shockwave'],  interval:2.4 },
        ]},
      final: { id:'chapter_boss',
        name:'창귀',                  nameEn:'Changwi',
        sub:'망령을 소환하는 안개의 지배자', subEn:'Lord of the mist who commands the wandering dead',
        color:'#5050c0', hp:2700, dmg:36, spd:52,
        phases:[
          { threshold:1.0, patterns:['spiral','rush','summon'],              interval:3.5 },
          { threshold:0.6, patterns:['spiral','spiral','rush'],              interval:2.6 },
          { threshold:0.3, patterns:['spiral','shockwave','rush','summon'],  interval:1.8 },
        ]},
    },
    3: {
      mid:   { id:'mid_boss',
        name:'타락한 장승',           nameEn:'Corrupted Jangseung',
        sub:'서낭당을 오염시킨 수호신', subEn:'A sacred totem guardian twisted by corruption',
        color:'#804020', hp:1400, dmg:28, spd:58,
        phases:[
          { threshold:1.0, patterns:['summon','shockwave'],                  interval:3.0 },
          { threshold:0.5, patterns:['summon','rush','shockwave','spiral'],  interval:2.2 },
        ]},
      final: { id:'chapter_boss',
        name:'두억시니',              nameEn:'Duoksini',
        sub:'광폭화와 충격파의 거대 요괴', subEn:'A colossal demon of rage and shockwaves',
        color:'#c03030', hp:3400, dmg:41, spd:53,
        phases:[
          { threshold:1.0, patterns:['sweep','summon','shockwave'],          interval:3.3 },
          { threshold:0.6, patterns:['sweep','rush','shockwave'],            interval:2.4 },
          { threshold:0.3, patterns:['shockwave','shockwave','sweep','rush'],interval:1.7 },
        ]},
    },
    4: {
      mid:   { id:'mid_boss',
        name:'흑호',                  nameEn:'Black Tiger',
        sub:'숲 속을 지배하는 검은 호랑이', subEn:'A shadow tiger that reigns over the forest',
        color:'#204040', hp:1700, dmg:31, spd:60,
        phases:[
          { threshold:1.0, patterns:['rush','sweep','rush'],                 interval:3.0 },
          { threshold:0.5, patterns:['rush','rush','sweep','shockwave'],     interval:2.2 },
        ]},
      final: { id:'chapter_boss',
        name:'장산범',                nameEn:'Jangsanbeom',
        sub:'소리로 유인하는 산중의 지배자', subEn:'The mountain predator that lures prey with its cry',
        color:'#305050', hp:4200, dmg:46, spd:55,
        phases:[
          { threshold:1.0, patterns:['rush','rush','sweep'],                 interval:3.3 },
          { threshold:0.6, patterns:['rush','sweep','shockwave'],            interval:2.4 },
          { threshold:0.3, patterns:['rush','rush','sweep','spiral'],        interval:1.7 },
        ]},
    },
    5: {
      mid:   { id:'mid_boss',
        name:'왜곡자',                nameEn:'The Distorter',
        sub:'공간을 뒤틀어 플레이어를 혼란', subEn:'A being that warps space to disorient its prey',
        color:'#800080', hp:2100, dmg:35, spd:62,
        phases:[
          { threshold:1.0, patterns:['spiral','spiral','rush'],              interval:2.8 },
          { threshold:0.5, patterns:['spiral','shockwave','spiral','rush'],  interval:2.0 },
        ]},
      final: { id:'chapter_boss',
        name:'구미호',                nameEn:'Gumiho',
        sub:'9방향 레이저와 여우불의 네임드', subEn:'Nine-tailed fox of foxfire and nine-way laser beams',
        color:'#c04080', hp:5100, dmg:52, spd:56,
        phases:[
          { threshold:1.0, patterns:['spiral','spiral','summon'],            interval:3.2 },
          { threshold:0.6, patterns:['spiral','shockwave','summon'],         interval:2.3 },
          { threshold:0.3, patterns:['spiral','spiral','shockwave','rush'],  interval:1.6 },
        ]},
    },
    6: {
      mid:   { id:'mid_boss',
        name:'염라대왕의 문지기',     nameEn:"Yeomra's Gatekeeper",
        sub:'저승 입구를 지키는 철갑 거인', subEn:'An iron-clad giant guarding the gates of the underworld',
        color:'#2040c0', hp:2500, dmg:39, spd:63,
        phases:[
          { threshold:1.0, patterns:['shockwave','rush','shockwave'],            interval:2.8 },
          { threshold:0.5, patterns:['shockwave','shockwave','rush','sweep'],    interval:2.0 },
        ]},
      final: { id:'chapter_boss',
        name:'저승왕의 사자',         nameEn:"Envoy of the Underworld King",
        sub:'사슬과 낫으로 혼을 가두는 집행자', subEn:'An executioner that binds souls with chains and a scythe',
        color:'#1030a0', hp:6200, dmg:58, spd:58,
        phases:[
          { threshold:1.0, patterns:['shockwave','sweep','summon'],              interval:3.2 },
          { threshold:0.6, patterns:['shockwave','rush','sweep'],                interval:2.3 },
          { threshold:0.3, patterns:['shockwave','shockwave','spiral','rush'],   interval:1.6 },
        ]},
    },
    7: {
      mid:   { id:'mid_boss',
        name:'외신 대사제',           nameEn:'Outer God High Priest',
        sub:'공허 소환과 광역 저주의 지도자', subEn:'Leader of void summons and wide-range curses',
        color:'#6000a0', hp:3000, dmg:43, spd:65,
        phases:[
          { threshold:1.0, patterns:['summon','spiral','rush'],                  interval:2.8 },
          { threshold:0.5, patterns:['summon','summon','spiral','shockwave'],    interval:2.0 },
        ]},
      final: { id:'chapter_boss',
        name:'공허의 선구자',         nameEn:'Pioneer of the Void',
        sub:'차원 균열을 열어 촉수 군단을 소환', subEn:'Tears open dimensional rifts to unleash a tentacle horde',
        color:'#400080', hp:7500, dmg:64, spd:60,
        phases:[
          { threshold:1.0, patterns:['summon','summon','spiral'],                interval:3.2 },
          { threshold:0.6, patterns:['summon','spiral','shockwave'],             interval:2.2 },
          { threshold:0.3, patterns:['summon','spiral','spiral','rush'],         interval:1.5 },
        ]},
    },
    8: {
      mid:   { id:'mid_boss',
        name:'기억 파괴자',           nameEn:'Memory Destroyer',
        sub:'플레이어의 스킬을 일시 봉인하는 자', subEn:'A being that temporarily seals the player\'s skills',
        color:'#505070', hp:3600, dmg:47, spd:67,
        phases:[
          { threshold:1.0, patterns:['sweep','rush','spiral'],                   interval:2.6 },
          { threshold:0.5, patterns:['sweep','sweep','rush','spiral'],           interval:1.8 },
        ]},
      final: { id:'chapter_boss',
        name:'잊혀진 왕',             nameEn:'The Forgotten King',
        sub:'망각의 안개로 화면을 잠식하는 군주', subEn:'A monarch who devours the battlefield in mist of oblivion',
        color:'#303050', hp:9000, dmg:71, spd:62,
        phases:[
          { threshold:1.0, patterns:['sweep','shockwave','spiral'],              interval:3.0 },
          { threshold:0.6, patterns:['sweep','sweep','spiral'],                  interval:2.2 },
          { threshold:0.3, patterns:['sweep','shockwave','spiral','rush'],       interval:1.5 },
        ]},
    },
    9: {
      mid:   { id:'mid_boss',
        name:'반신령 군주',           nameEn:'Half-Divine Lord',
        sub:'신성과 어둠이 혼재한 타락한 수호신', subEn:'A fallen guardian where divinity and darkness collide',
        color:'#308060', hp:4300, dmg:52, spd:68,
        phases:[
          { threshold:1.0, patterns:['shockwave','summon','rush'],               interval:2.6 },
          { threshold:0.5, patterns:['summon','spiral','shockwave','rush'],      interval:1.8 },
        ]},
      final: { id:'chapter_boss',
        name:'잠든 산신',             nameEn:'The Sleeping Mountain God',
        sub:'깨어나는 순간 대지 전체를 진동시킴', subEn:'Its awakening shakes the very ground of the mortal realm',
        color:'#205040', hp:10800, dmg:79, spd:63,
        phases:[
          { threshold:1.0, patterns:['shockwave','summon','spiral'],             interval:3.0 },
          { threshold:0.6, patterns:['shockwave','spiral','rush'],               interval:2.0 },
          { threshold:0.3, patterns:['shockwave','shockwave','summon','spiral'], interval:1.4 },
        ]},
    },
    10: {
      mid:   { id:'mid_boss',
        name:'혼돈의 선봉장',         nameEn:'Vanguard of Chaos',
        sub:'혼돈의 의지를 집행하는 최강의 전위', subEn:'The mightiest enforcer of chaos\'s will',
        color:'#800020', hp:5000, dmg:58, spd:70,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','spiral','summon'],          interval:2.4 },
          { threshold:0.5, patterns:['rush','rush','shockwave','spiral','summon'],   interval:1.6 },
        ]},
      final: { id:'chapter_boss',
        name:'기어오는 혼돈',         nameEn:'The Creeping Chaos',
        sub:'모든 것의 끝. 존재 자체가 세계를 삼킨다', subEn:'The end of all things — its very existence consumes the world',
        color:'#400000', hp:13000, dmg:88, spd:65,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','spiral','summon'],          interval:2.8 },
          { threshold:0.6, patterns:['sweep','spiral','shockwave','summon'],         interval:2.0 },
          { threshold:0.3, patterns:['rush','rush','spiral','shockwave','summon'],   interval:1.3 },
        ]},
    },
    // ── 시즌 2: 유명계 ──
    11: {
      mid:   { id:'mid_boss',
        name:'뱃사공의 심판',         nameEn:"Ferryman's Judgment",
        sub:'황천강 망자들을 심판하는 사공', subEn:'The ferryman who judges souls crossing the Sanzu River',
        color:'#304060', hp:5800, dmg:63, spd:65,
        phases:[
          { threshold:1.0, patterns:['spiral','rush','shockwave'],             interval:2.8 },
          { threshold:0.5, patterns:['spiral','spiral','rush','shockwave'],    interval:2.0 },
        ]},
      final: { id:'chapter_boss',
        name:'황천 뱃사공',           nameEn:'Ferryman of the Sanzu River',
        sub:'황천강을 지배하는 망자의 인도자', subEn:'The ancient ferryman who rules the river of the dead',
        color:'#1a2a40', hp:14500, dmg:92, spd:60,
        phases:[
          { threshold:1.0, patterns:['summon','spiral','sweep'],               interval:3.0 },
          { threshold:0.6, patterns:['summon','rush','sweep','shockwave'],     interval:2.2 },
          { threshold:0.3, patterns:['spiral','rush','shockwave','summon'],    interval:1.5 },
        ]},
    },
    12: {
      mid:   { id:'mid_boss',
        name:'포졸대장의 검문',        nameEn:"Captain's Checkpoint",
        sub:'저승 관문을 지키는 검문관', subEn:'Underworld checkpoint enforcer blocking all passage',
        color:'#203060', hp:6500, dmg:68, spd:67,
        phases:[
          { threshold:1.0, patterns:['shockwave','rush','rush'],               interval:2.7 },
          { threshold:0.5, patterns:['shockwave','shockwave','rush','spiral'], interval:2.0 },
        ]},
      final: { id:'chapter_boss',
        name:'저승 포졸대장',         nameEn:'Underworld Guard Captain',
        sub:'사슬 속박과 처형의 집행자', subEn:'Commander of chains who executes judgment without mercy',
        color:'#102050', hp:16000, dmg:98, spd:62,
        phases:[
          { threshold:1.0, patterns:['summon','shockwave','rush'],             interval:2.9 },
          { threshold:0.6, patterns:['summon','shockwave','rush','sweep'],     interval:2.1 },
          { threshold:0.3, patterns:['shockwave','shockwave','spiral','rush'], interval:1.4 },
        ]},
    },
    13: {
      mid:   { id:'mid_boss',
        name:'기억귀의 먹이터',        nameEn:"Memory Devourer's Feeding Ground",
        sub:'기억을 뜯어먹는 먹이터의 주인', subEn:'Master of the ground where memories are consumed',
        color:'#403060', hp:7200, dmg:73, spd:68,
        phases:[
          { threshold:1.0, patterns:['sweep','spiral','rush'],                 interval:2.7 },
          { threshold:0.5, patterns:['sweep','sweep','spiral','rush'],         interval:1.9 },
        ]},
      final: { id:'chapter_boss',
        name:'기억귀',                nameEn:'The Memory Devourer',
        sub:'망각의 안개로 기억을 지워버리는 미궁의 지배자', subEn:'Ruler of the labyrinth who erases memories with mist of oblivion',
        color:'#2a1a50', hp:17800, dmg:105, spd:63,
        phases:[
          { threshold:1.0, patterns:['sweep','spiral','summon'],               interval:2.9 },
          { threshold:0.6, patterns:['sweep','spiral','shockwave'],            interval:2.0 },
          { threshold:0.3, patterns:['sweep','sweep','spiral','rush'],         interval:1.4 },
        ]},
    },
    14: {
      mid:   { id:'mid_boss',
        name:'심판관의 첫 번째 시험',  nameEn:"Judge's First Trial",
        sub:'업보를 저울질하는 첫 심판', subEn:'The opening judgment that weighs karmic debt',
        color:'#504010', hp:8000, dmg:78, spd:68,
        phases:[
          { threshold:1.0, patterns:['summon','shockwave','rush'],             interval:2.7 },
          { threshold:0.5, patterns:['summon','summon','shockwave','spiral'],  interval:1.9 },
        ]},
      final: { id:'chapter_boss',
        name:'환생 심판관',           nameEn:'Reincarnation Judge',
        sub:'영혼의 무게를 재는 환생 전당의 지배자', subEn:'Sovereign of the Hall of Reincarnation who weighs every soul',
        color:'#3a2a00', hp:19500, dmg:112, spd:64,
        phases:[
          { threshold:1.0, patterns:['summon','sweep','shockwave'],            interval:2.8 },
          { threshold:0.6, patterns:['summon','summon','spiral'],              interval:2.0 },
          { threshold:0.3, patterns:['summon','shockwave','spiral','rush'],    interval:1.3 },
        ]},
    },
    15: {
      mid:   { id:'mid_boss',
        name:'오관대왕의 시험',        nameEn:"Ogwan's Trial",
        sub:'명부의 다섯 관문을 지키는 시험관', subEn:'Overseer of the five gates of the underworld records',
        color:'#600010', hp:9000, dmg:84, spd:69,
        phases:[
          { threshold:1.0, patterns:['shockwave','summon','spiral'],           interval:2.6 },
          { threshold:0.5, patterns:['shockwave','summon','summon','rush'],    interval:1.8 },
        ]},
      final: { id:'chapter_boss',
        name:'오관대왕',              nameEn:'Ogwan, King of Five Gates',
        sub:'명부의 심장을 지배하는 시왕 중의 왕', subEn:'Greatest among the Ten Kings who rules the heart of the underworld',
        color:'#3a0008', hp:21500, dmg:120, spd:65,
        phases:[
          { threshold:1.0, patterns:['shockwave','summon','sweep'],            interval:2.8 },
          { threshold:0.6, patterns:['shockwave','summon','spiral'],           interval:2.0 },
          { threshold:0.3, patterns:['shockwave','shockwave','summon','rush'], interval:1.3 },
        ]},
    },
    16: {
      mid:   { id:'mid_boss',
        name:'강림의 첫 번째 강림',    nameEn:"Gangrim's First Descent",
        sub:'오염된 기운을 앞세워 강림하는 차사', subEn:'A soul reaper descending with the taint of the Outer God',
        color:'#200030', hp:10000, dmg:90, spd:70,
        phases:[
          { threshold:1.0, patterns:['rush','summon','spiral'],                interval:2.6 },
          { threshold:0.5, patterns:['rush','rush','summon','shockwave'],      interval:1.8 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 강림도령',        nameEn:'Corrupted Gangrim',
        sub:'외신에 잠식되어 타락한 저승사자', subEn:'The legendary soul reaper devoured and corrupted by the Outer God',
        color:'#100020', hp:23500, dmg:128, spd:66,
        phases:[
          { threshold:1.0, patterns:['rush','summon','shockwave'],             interval:2.7 },
          { threshold:0.6, patterns:['rush','rush','spiral','summon'],         interval:1.9 },
          { threshold:0.3, patterns:['rush','rush','shockwave','summon'],      interval:1.2 },
        ]},
    },
    17: {
      mid:   { id:'mid_boss',
        name:'판관의 첫 번째 심판',    nameEn:"Judge's First Corrupt Ruling",
        sub:'뒤틀린 저승법으로 죄를 날조하는 판관', subEn:'A judge who fabricates guilt using the twisted laws of the dead',
        color:'#301000', hp:11000, dmg:96, spd:70,
        phases:[
          { threshold:1.0, patterns:['sweep','shockwave','rush'],              interval:2.5 },
          { threshold:0.5, patterns:['sweep','sweep','shockwave','spiral'],    interval:1.7 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 판관',           nameEn:'The Corrupt Judge',
        sub:'저승법을 유린하는 혼돈의 집행자', subEn:'An executioner of chaos who tramples the laws of the underworld',
        color:'#200a00', hp:25500, dmg:136, spd:67,
        phases:[
          { threshold:1.0, patterns:['sweep','shockwave','summon'],            interval:2.7 },
          { threshold:0.6, patterns:['sweep','sweep','spiral'],                interval:1.9 },
          { threshold:0.3, patterns:['sweep','shockwave','spiral','rush'],     interval:1.2 },
        ]},
    },
    18: {
      mid:   { id:'mid_boss',
        name:'대별왕의 마지막 저항',   nameEn:"Daebyelwang's Last Resistance",
        sub:'오염에 저항하는 창세신의 마지막 의지', subEn:'The final will of a creation god resisting total corruption',
        color:'#002030', hp:12200, dmg:103, spd:71,
        phases:[
          { threshold:1.0, patterns:['shockwave','spiral','summon'],           interval:2.5 },
          { threshold:0.5, patterns:['shockwave','shockwave','spiral','rush'], interval:1.7 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 대별왕',         nameEn:'Corrupted Daebyelwang',
        sub:'이승과 저승의 법칙을 붕괴시키는 오염된 창세신', subEn:'A corrupted creation god who collapses the boundary between life and death',
        color:'#001520', hp:28000, dmg:145, spd:68,
        phases:[
          { threshold:1.0, patterns:['shockwave','spiral','summon'],           interval:2.6 },
          { threshold:0.6, patterns:['shockwave','shockwave','summon'],        interval:1.8 },
          { threshold:0.3, patterns:['shockwave','spiral','summon','rush'],    interval:1.1 },
        ]},
    },
    19: {
      mid:   { id:'mid_boss',
        name:'태산대왕의 첫 번째 눈',  nameEn:"Taesan's First Eye",
        sub:'수명을 갉아먹는 태산의 감시자', subEn:'Taesan\'s watchful eye that gnaws away at lifespan',
        color:'#1a0020', hp:13500, dmg:110, spd:72,
        phases:[
          { threshold:1.0, patterns:['spiral','shockwave','summon'],           interval:2.4 },
          { threshold:0.5, patterns:['spiral','spiral','shockwave','rush'],    interval:1.6 },
        ]},
      final: { id:'chapter_boss',
        name:'잠식된 태산대왕',        nameEn:'Devoured Taesan',
        sub:'수명 자체를 무기로 사용하는 변이한 시왕', subEn:'A mutated underworld king who weaponizes lifespan itself',
        color:'#100015', hp:31000, dmg:155, spd:69,
        phases:[
          { threshold:1.0, patterns:['spiral','shockwave','summon'],           interval:2.6 },
          { threshold:0.6, patterns:['spiral','spiral','shockwave'],           interval:1.8 },
          { threshold:0.3, patterns:['spiral','shockwave','summon','rush'],    interval:1.1 },
        ]},
    },
    20: {
      mid:   { id:'mid_boss',
        name:'바리공주의 첫 번째 눈물', nameEn:"Bari's First Tear",
        sub:'구원자가 흘리는 오염된 슬픔', subEn:'The corrupted grief of a savior who lost her way',
        color:'#2a0030', hp:15000, dmg:118, spd:72,
        phases:[
          { threshold:1.0, patterns:['sweep','spiral','shockwave'],            interval:2.4 },
          { threshold:0.5, patterns:['sweep','spiral','spiral','shockwave'],   interval:1.6 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 바리공주',        nameEn:'Fallen Bari-gongju',
        sub:'생명수가 독으로 변한 저승의 구원자', subEn:'The savior of the underworld whose life water has turned to poison',
        color:'#180020', hp:35000, dmg:165, spd:70,
        phases:[
          { threshold:1.0, patterns:['sweep','spiral','summon'],               interval:2.5 },
          { threshold:0.6, patterns:['sweep','sweep','spiral','summon'],       interval:1.7 },
          { threshold:0.3, patterns:['rush','sweep','spiral','shockwave','summon'], interval:1.0 },
        ]},
    },
  },

  // 스테이지 ID로 챕터 찾기
  getChapterFromStage(stageId) {
    for (const ch of GAME_DATA.stages) {
      if (ch.stages.some(s => s.id === stageId)) return ch.chapter;
    }
    return 1;
  },
};
