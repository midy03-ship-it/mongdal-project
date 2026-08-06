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
    // ── 시즌 3 (망랑계) ── [UPDATE 2026-07-14] 260713/260714_MTOPC.md 8번 — attackPattern은 1단계 임시로 기존 패턴 재사용, 2단계에서 신규 패턴(teleport_strike 등) 교체 예정
    21: ['kkomadokkaebi','kkomadokkaebi','kkomadokkaebi','heotgaebi','heotgaebi'],
    22: ['yeoubul','yeoubul','yeoubul','hollinbyeongsa','hollinbyeongsa'],
    23: ['oryuryeong','oryuryeong','oryuryeong','kkaejingeurimja','kkaejingeurimja'],
    24: ['jujubatsangpumryeong','jujubatsangpumryeong','jujubatsangpumryeong','geurimjasangin','geurimjasangin'],
    25: ['simcheungdokkaebi','simcheungdokkaebi','simcheungdokkaebi','geurimjajimseung','geurimjajimseung'],
    26: ['oyeomdokkaebi','oyeomdokkaebi','oyeomdokkaebi','jamsikryeong','jamsikryeong'],
    27: ['hollinyeou','hollinyeou','hollinyeou','jujusulsa','jujusulsa'],
    28: ['sovoldolgwi','sovoldolgwi','sovoldolgwi','hondonpaphyeonche','hondonpaphyeonche'],
    29: ['pokpungglitch','pokpungglitch','pokpungglitch','oryupokpungche','oryupokpungche'],
    30: ['bunsindokkaebi','bunsindokkaebi','bunsindokkaebi','wangjwasuhobyeong','wangjwasuhobyeong'],
    // ── 시즌 4 (귀허계) ── [UPDATE 2026-07-17] 260714/260715_MTOPC.md 8번 — 시즌3와 동일하게 attackPattern은 기존 패턴 임시 매핑
    31: ['padogwi','padogwi','padogwi','baseojinhyeongche','baseojinhyeongche'],
    32: ['ikmyeonggwi','ikmyeonggwi','ikmyeonggwi','chimmukhaneunja','chimmukhaneunja'],
    33: ['hwansaengpapyeon','hwansaengpapyeon','hwansaengpapyeon','miwanuijaa','miwanuijaa'],
    34: ['gongheogwi','gongheogwi','gongheogwi','teongbingapju','teongbingapju'],
    35: ['simcheungsomyeolsu','simcheungsomyeolsu','simcheungsomyeolsu','chimsikgwi','chimsikgwi'],
    36: ['oyeomdoenpadogwi','oyeomdoenpadogwi','oyeomdoenpadogwi','jamsikdoenhyeongche','jamsikdoenhyeongche'],
    37: ['dwitteullinhwansaengche','dwitteullinhwansaengche','dwitteullinhwansaengche','yeokhaenghaneunja','yeokhaenghaneunja'],
    38: ['heomujogak','heomujogak','heomujogak','bunggoehaneunjanyeong','bunggoehaneunjanyeong'],
    39: ['gyeonggyegwi','gyeonggyegwi','gyeonggyegwi','somyeoljikjeonja','somyeoljikjeonja'],
    40: ['wangjwapapyeonche','wangjwapapyeonche','wangjwapapyeonche','majimakjaa','majimakjaa'],
    // ── 시즌 5 (선계) ── [UPDATE 2026-07-22] SEASON3_8_STAGES.md 기준. 시즌3/4와 동일하게 attackPattern은 기존 패턴으로 임시 매핑
    41: ['gureumwonhon','gureumwonhon','gureumwonhon','seoribyeongsa','seoribyeongsa'],
    42: ['bullohwajeong','bullohwajeong','bullohwajeong','jeongwonjigi','jeongwonjigi'],
    43: ['bujeokgwi','bujeokgwi','bujeokgwi','dosulsuryeonja','dosulsuryeonja'],
    44: ['gohaengjahon','gohaengjahon','gohaengjahon','jinripapyeon','jinripapyeon'],
    45: ['seongyesumunjang','seongyesumunjang','seongyesumunjang','simcheungseonbyeong','simcheungseonbyeong'],
    46: ['jamsikdoensinseon','jamsikdoensinseon','jamsikdoensinseon','oyeomdoenbit','oyeomdoenbit'],
    47: ['dwitteullinbujeok','dwitteullinbujeok','dwitteullinbujeok','jujudosa','jujudosa'],
    48: ['oyeomdoenjilli','oyeomdoenjilli','oyeomdoenjilli','tarakhangohaengja','tarakhangohaengja'],
    49: ['tarakhansinseon','tarakhansinseon','tarakhansinseon','jamsikdoennun','jamsikdoennun'],
    50: ['tarakhancheonin','tarakhancheonin','tarakhancheonin','majimaknunmul','majimaknunmul'],
    // [UPDATE 2026-07-31] 🔥 챕터51~70이 이 표에 통째로 빠져 있던 치명적 버그 수정.
    // 몬스터 정의(defs)와 스프라이트 등록은 시즌6/7 작업 때 다 해뒀는데 이 스폰 표만 챕터50에서 끊겨 있어서,
    // spawner.js의 `MONSTERS.byChapter[currentChapter] || MONSTERS.byChapter[1]` 폴백에 걸려
    // 원계·어계 전 구간에서 시즌1 잡몹(망령/원귀)이 스폰되고 있었음. 크래시가 없어 조용히 넘어간 케이스.
    // 특히 원계(챕터51~60)는 v0.5.1로 이미 정식 공개된 상태라 실제 플레이에 영향을 주고 있었음.
    // 배열 규약은 기존과 동일: 1번 몬스터 ×3, 2번 몬스터 ×2 가중치.
    // ── 시즌6: 원계 (챕터 51~60) ──
    51: ['beopchikpapyeon','beopchikpapyeon','beopchikpapyeon','wonchoemeari','wonchoemeari'],
    52: ['jeonjagijanjae','jeonjagijanjae','jeonjagijanjae','haekryeokgyeoljeongche','haekryeokgyeoljeongche'],
    53: ['ingwauigeurimja','ingwauigeurimja','ingwauigeurimja','pagoeuisado','pagoeuisado'],
    54: ['jiltueuipapyeon','jiltueuipapyeon','jiltueuipapyeon','gyeongoeuijanyeong','gyeongoeuijanyeong'],
    55: ['wongyeuipasubyeong','wongyeuipasubyeong','wongyeuipasubyeong','beopchiksuhosu','beopchiksuhosu'],
    56: ['oyeomdoenbeopchikche','oyeomdoenbeopchikche','oyeomdoenbeopchikche','jamsikuichokso','jamsikuichokso'],
    57: ['dwijipyinwonin','dwijipyinwonin','dwijipyinwonin','gyeolgwaeobsneungeurimja','gyeolgwaeobsneungeurimja'],
    58: ['bunggoehaneunpapyeon','bunggoehaneunpapyeon','bunggoehaneunpapyeon','changjoeujanhae','changjoeujanhae'],
    59: ['somyeolhaneunnun','somyeolhaneunnun','somyeolhaneunnun','geunwoneuipapyeon','geunwoneuipapyeon'],
    60: ['jungryeokuipapyeon','jungryeokuipapyeon','jungryeokuipapyeon','wangjwaeuigeurimja','wangjwaeuigeurimja'],
    // ── 시즌7: 어계 (챕터 61~70) ──
    61: ['kkumpapyeon','kkumpapyeon','kkumpapyeon','gyunyeolgwi','gyunyeolgwi'],
    62: ['muhyeongche','muhyeongche','muhyeongche','simyeonchoksu','simyeonchoksu'],
    63: ['cheongaenunjogak','cheongaenunjogak','cheongaenunjogak','eungsija','eungsija'],
    64: ['geumgisokssagim','geumgisokssagim','geumgisokssagim','ireumeopsneunja','ireumeopsneunja'],
    65: ['nagaksindo','nagaksindo','nagaksindo','jamdeunjaujong','jamdeunjaujong'],
    66: ['ojeomaegissi','ojeomaegissi','ojeomaegissi','gangrimgeurimja','gangrimgeurimja'],
    67: ['gwanggipado','gwanggipado','gwanggipado','joryugwi','joryugwi'],
    68: ['nunkkeopulgyunyeol','nunkkeopulgyunyeol','nunkkeopulgyunyeol','jamkkaeneunja','jamkkaeneunja'],
    69: ['chimmukgwi','chimmukgwi','chimmukgwi','malhaeseonandoelgeot','malhaeseonandoelgeot'],
    70: ['taechojasik','taechojasik','taechojasik','eomeonipapyeon','eomeonipapyeon'],
    // [UPDATE 2026-07-31] 시즌8: 황계 (챕터 71~80)
    71: ['jongmalpapyeon','jongmalpapyeon','jongmalpapyeon','bunggoeja','bunggoeja'],
    72: ['geoulpapyeon','geoulpapyeon','geoulpapyeon','bansache','bansache'],
    73: ['yeokhaenggwi','yeokhaenggwi','yeokhaenggwi','gwageoui_janjae','gwageoui_janjae'],
    74: ['ssangsomyeolche','ssangsomyeolche','ssangsomyeolche','banmuljilgu','banmuljilgu'],
    75: ['hwanggyebyeongjol','hwanggyebyeongjol','hwanggyebyeongjol','banmuljilseok_sujipga','banmuljilseok_sujipga'],
    76: ['geouljaa_bunsin','geouljaa_bunsin','geouljaa_bunsin','gakseong_jeonjo','gakseong_jeonjo'],
    77: ['hapchiui_sado','hapchiui_sado','hapchiui_sado','yeoneonui_jogak','yeoneonui_jogak'],
    78: ['taechoui_janhyang','taechoui_janhyang','taechoui_janhyang','gwihwanhaneun_geot','gwihwanhaneun_geot'],
    79: ['jaaui_papyeon','jaaui_papyeon','jaaui_papyeon','sunsuhan_geurimja','sunsuhan_geurimja'],
    80: ['taechoui_bit','taechoui_bit','taechoui_bit','eorin_useum','eorin_useum'],
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

    // ═══════════════════════════════════════════════════
    //  시즌 3 — 망랑계 (챕터 21~30)
    // [UPDATE 2026-07-14] 260713/260714_MTOPC.md 8번. HP/공격력은 챕터 기준값 ±6.7% 배분(문서 예시값과 동일 비율),
    // XP/골드는 시즌2와 동일하게 hp÷10.5. attackPattern은 1단계 임시 매핑 — 2단계에서 teleport_strike 등 신규 패턴으로 교체.
    // ═══════════════════════════════════════════════════

    // ── 챕터 21: 혼돈의 입구 ──
    kkomadokkaebi: {
      name:'꼬마도깨비', chapter:21, type:'normal',
      hp:420, damage:86, speed:95, xp:40, gold:40, size:20,
      color:'#c05820', glowColor:'rgba(220,110,30,0.5)',
      shape:'brute', attackPattern:'rush', // 근접 돌진
      desc:'혼돈이 빚어낸 작은 도깨비. 앞뒤 안 가리고 몸통 박치기로 돌진한다.',
    },
    heotgaebi: {
      name:'헛개비', chapter:21, type:'normal',
      hp:480, damage:98, speed:70, xp:46, gold:46, size:21,
      color:'#a0a8b0', glowColor:'rgba(180,190,200,0.4)',
      shape:'ghost', attackPattern:'rush', // (임시) 순간이동 후 기습
      desc:'실체가 흐릿한 헛것. 눈을 깜빡이면 어느새 옆에 와 있다.',
    },

    // ── 챕터 22: 요술의 거리 ──
    yeoubul: {
      name:'여우불', chapter:22, type:'normal',
      hp:476, damage:93, speed:60, xp:45, gold:45, size:19,
      color:'#e07020', glowColor:'rgba(255,140,30,0.6)',
      shape:'orb', attackPattern:'ranged', // 원거리 화염구
      desc:'요사스러운 도깨비불. 멀리서 화염구를 날려 태운다.',
    },
    hollinbyeongsa: {
      name:'홀린 병사', chapter:22, type:'normal',
      hp:544, damage:107, speed:78, xp:52, gold:52, size:22,
      color:'#8050a0', glowColor:'rgba(150,90,190,0.5)',
      shape:'brute', attackPattern:'melee', // 근접+가끔 랜덤 방향 이동(홀림)
      desc:'구미호의 술법에 홀린 병사. 가끔 넋이 나간 듯 엉뚱한 방향으로 휘청인다.',
    },

    // ── 챕터 23: 글리치의 숲 ──
    oryuryeong: {
      name:'오류령', chapter:23, type:'normal',
      hp:541, damage:101, speed:100, xp:52, gold:52, size:19,
      color:'#20c0b0', glowColor:'rgba(40,220,200,0.6)',
      shape:'ghost', attackPattern:'rush', // (임시) 순간 텔레포트 이동
      desc:'글리치가 낳은 오류의 영혼. 화면이 깨지듯 순간적으로 위치를 바꾼다.',
    },
    kkaejingeurimja: {
      name:'깨진 그림자', chapter:23, type:'normal',
      hp:619, damage:115, speed:65, xp:59, gold:59, size:23,
      color:'#106858', glowColor:'rgba(20,120,100,0.5)',
      shape:'blob', attackPattern:'melee', // (임시) 투명화 반복
      desc:'깨진 픽셀처럼 명멸하는 그림자. 반투명해질 때는 공격이 통하지 않는다.',
    },

    // ── 챕터 24: 뒤틀린 시장 ──
    jujubatsangpumryeong: {
      name:'저주받은 상품령', chapter:24, type:'normal',
      hp:607, damage:110, speed:110, xp:58, gold:58, size:18,
      color:'#a07830', glowColor:'rgba(190,150,60,0.5)',
      shape:'brute', attackPattern:'explode', // 자폭 돌진
      desc:'혼돈 시장에서 팔리던 저주받은 물건에 깃든 원혼. 몸을 던져 폭발한다.',
    },
    geurimjasangin: {
      name:'그림자 상인', chapter:24, type:'normal',
      hp:694, damage:126, speed:52, xp:66, gold:66, size:24,
      color:'#3a2050', glowColor:'rgba(70,40,90,0.5)',
      shape:'ghost', attackPattern:'ranged', // 거리유지 원거리
      desc:'정체를 알 수 없는 상인의 그림자. 거리를 유지하며 저주받은 물건을 던진다.',
    },

    // ── 챕터 25: 망랑계 심층 ──
    simcheungdokkaebi: {
      name:'심층 도깨비', chapter:25, type:'normal',
      hp:690, damage:119, speed:58, xp:66, gold:66, size:24,
      color:'#902020', glowColor:'rgba(200,40,40,0.5)',
      shape:'brute', attackPattern:'melee', // 근접 강타(넉백)
      desc:'망랑계 깊은 곳에서 자란 도깨비. 육중한 몸으로 강하게 내리친다.',
    },
    geurimjajimseung: {
      name:'그림자 짐승', chapter:25, type:'normal',
      hp:790, damage:137, speed:118, xp:75, gold:75, size:22,
      color:'#282830', glowColor:'rgba(50,50,60,0.5)',
      shape:'blob', attackPattern:'swarm', // 빠른 이속 추격형
      desc:'짐승의 형상을 한 그림자 무리. 무서운 속도로 쫓아온다.',
    },

    // ── 챕터 26: 잠식된 망랑계 ──
    oyeomdokkaebi: {
      name:'오염 도깨비', chapter:26, type:'normal',
      hp:774, damage:131, speed:90, xp:74, gold:74, size:21,
      color:'#607020', glowColor:'rgba(120,150,40,0.5)',
      shape:'brute', attackPattern:'melee', // (임시) 처치 시 소형 폭발
      desc:'외신의 기운에 오염된 도깨비. 쓰러지는 순간까지 위험하다.',
    },
    jamsikryeong: {
      name:'잠식령', chapter:26, type:'normal',
      hp:886, damage:149, speed:55, xp:84, gold:84, size:25,
      color:'#405818', glowColor:'rgba(90,130,30,0.5)',
      shape:'blob', attackPattern:'melee', // 근접 데미지 도트(오염 확산)
      desc:'잠식이 퍼져나가는 영혼체. 스치기만 해도 오염이 옮는다.',
    },

    // ── 챕터 27: 요술에 홀린 세계 ──
    hollinyeou: {
      name:'홀린 여우', chapter:27, type:'normal',
      hp:868, damage:142, speed:85, xp:83, gold:83, size:20,
      color:'#c04888', glowColor:'rgba(220,90,150,0.5)',
      shape:'blob', attackPattern:'melee', // 플레이어 조작 반전 유발(근접)
      desc:'요술에 취한 구미호. 스치면 잠시 정신이 아득해진다.',
    },
    jujusulsa: {
      name:'저주 술사', chapter:27, type:'normal',
      hp:993, damage:162, speed:48, xp:95, gold:95, size:23,
      color:'#502870', glowColor:'rgba(100,50,140,0.5)',
      shape:'ghost', attackPattern:'ranged', // 원거리 디버프 투사체
      desc:'저주받은 술사의 원혼. 멀리서 약화의 저주를 날린다.',
    },

    // ── 챕터 28: 혼돈의 소용돌이 ──
    sovoldolgwi: {
      name:'소용돌이귀', chapter:28, type:'normal',
      hp:980, damage:154, speed:40, xp:93, gold:93, size:26,
      color:'#402888', glowColor:'rgba(90,60,190,0.5)',
      shape:'orb', attackPattern:'melee', // 주변 넉백 소용돌이 지속
      desc:'혼돈이 뒤엉켜 만들어진 소용돌이. 주변을 계속 끌어당기고 밀쳐낸다.',
    },
    hondonpaphyeonche: {
      name:'혼돈 파편체', chapter:28, type:'normal',
      hp:1121, damage:176, speed:75, xp:107, gold:107, size:19,
      color:'#a02838', glowColor:'rgba(200,50,60,0.5)',
      shape:'blob', attackPattern:'melee', // (임시) 분열(처치 시 2체로 분열, 1회)
      desc:'혼돈신의 파편. 쓰러뜨려도 조각나 다시 일어난다.',
    },

    // ── 챕터 29: 글리치 폭풍 ──
    pokpungglitch: {
      name:'폭풍 글리치', chapter:29, type:'normal',
      hp:1101, damage:168, speed:130, xp:105, gold:105, size:18,
      color:'#18b8d0', glowColor:'rgba(30,210,230,0.6)',
      shape:'orb', attackPattern:'rush', // (임시) 빠른 순간이동 연속
      desc:'폭풍처럼 몰아치는 글리치 파편. 예측할 수 없이 깜빡이며 접근한다.',
    },
    oryupokpungche: {
      name:'오류 폭풍체', chapter:29, type:'normal',
      hp:1259, damage:192, speed:58, xp:120, gold:120, size:25,
      color:'#106878', glowColor:'rgba(20,130,150,0.5)',
      shape:'blob', attackPattern:'explode', // 광역 자폭
      desc:'오류가 응축된 폭풍의 덩어리. 임계점에 달하면 크게 터진다.',
    },

    // ── 챕터 30: 망랑계의 왕좌 ──
    bunsindokkaebi: {
      name:'분신 도깨비', chapter:30, type:'normal',
      hp:1241, damage:182, speed:80, xp:118, gold:118, size:20,
      color:'#c07030', glowColor:'rgba(220,140,60,0.5)',
      shape:'brute', attackPattern:'melee', // (임시) 소환형(주기적 미니 도깨비 소환)
      desc:'왕좌를 지키는 분신. 본체가 어디인지 알 수 없다.',
    },
    wangjwasuhobyeong: {
      name:'왕좌 수호병', chapter:30, type:'normal',
      hp:1419, damage:208, speed:35, xp:135, gold:135, size:27,
      color:'#585858', glowColor:'rgba(120,120,120,0.5)',
      shape:'brute', attackPattern:'melee', // 탱커형(체력高, 저속)
      desc:'망랑대왕의 왕좌를 지키는 수호병. 굳건히 버티며 물러서지 않는다.',
    },

    // ═══════════════════════════════════════════════════
    //  시즌 4 — 귀허계 (챕터 31~40)
    // [UPDATE 2026-07-17] 260714/260715_MTOPC.md 설계 확정 데이터 코드화. HP/공격력은 챕터 기준값 ±1/15(6.7%) 배분,
    // XP/골드는 시즌2/3와 동일하게 hp÷10.5. attackPattern은 시즌3와 동일하게 신규 패턴(fade_strike 등) 없이 기존 패턴으로 임시 매핑
    // (시즌3도 실제로는 신규 패턴을 몬스터에 적용하지 않고 rush/melee/explode로 임시 매핑한 채 출시됨 — 동일 관례 유지).
    // ═══════════════════════════════════════════════════

    // ── 챕터 31 ──
    padogwi: {
      name:'파도귀', chapter:31, type:'normal',
      hp:1400, damage:205, speed:98, xp:133, gold:133, size:19,
      color:'#5878a0', glowColor:'rgba(90,130,170,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'소멸의 파도에 휩쓸린 원혼. 파도처럼 밀려들어 몸을 부딪는다.',
    },
    baseojinhyeongche: {
      name:'바스러진 형체', chapter:31, type:'normal',
      hp:1600, damage:235, speed:60, xp:152, gold:152, size:23,
      color:'#a0a8b0', glowColor:'rgba(170,180,190,0.4)',
      shape:'brute', attackPattern:'explode',
      desc:'형체가 바스러지기 직전인 존재. 부풀어 오르다 터지듯 자폭한다.',
    },

    // ── 챕터 32 ──
    ikmyeonggwi: {
      name:'익명귀', chapter:32, type:'normal',
      hp:1587, damage:224, speed:90, xp:151, gold:151, size:20,
      color:'#4a5a7a', glowColor:'rgba(80,100,140,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'이름을 잊은 혼. 예고 없이 사라졌다 다른 곳에서 나타난다. (임시: 돌진으로 대체)',
    },
    chimmukhaneunja: {
      name:'침묵하는 자', chapter:32, type:'normal',
      hp:1813, damage:256, speed:40, xp:173, gold:173, size:24,
      color:'#707888', glowColor:'rgba(130,140,155,0.4)',
      shape:'blob', attackPattern:'melee',
      desc:'말을 잃고 침묵하는 존재. 아주 느리지만 꾸준히 다가온다.',
    },

    // ── 챕터 33 ──
    hwansaengpapyeon: {
      name:'환생 파편', chapter:33, type:'normal',
      hp:1792, damage:245, speed:70, xp:171, gold:171, size:17,
      color:'#8878b0', glowColor:'rgba(150,130,210,0.5)',
      shape:'orb', attackPattern:'melee',
      desc:'거듭남에서 떨어져 나온 파편. 끈질기게 다시 일어선다. (임시: 근접으로 대체)',
    },
    miwanuijaa: {
      name:'미완의 자아', chapter:33, type:'normal',
      hp:2048, damage:279, speed:64, xp:195, gold:195, size:19,
      color:'#6858a0', glowColor:'rgba(110,90,190,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'아직 완성되지 못한 자아. 스치면 짧게 기억을 빨아들인다. (임시: 근접으로 대체)',
    },

    // ── 챕터 34 ──
    gongheogwi: {
      name:'공허귀', chapter:34, type:'normal',
      hp:2025, damage:267, speed:95, xp:193, gold:193, size:19,
      color:'#405070', glowColor:'rgba(70,90,130,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'허무 속에서 태어난 혼. 순간 자취를 감췄다 기습한다. (임시: 돌진으로 대체)',
    },
    teongbingapju: {
      name:'텅빈 갑주', chapter:34, type:'normal',
      hp:2315, damage:305, speed:48, xp:220, gold:220, size:25,
      color:'#303848', glowColor:'rgba(60,70,90,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'안이 텅 빈 갑주. 묵직하게 버티고 서서 내리친다.',
    },

    // ── 챕터 35 ──
    simcheungsomyeolsu: {
      name:'심층 소멸수', chapter:35, type:'normal',
      hp:2287, damage:291, speed:58, xp:218, gold:218, size:24,
      color:'#304860', glowColor:'rgba(50,90,130,0.5)',
      shape:'brute', attackPattern:'explode',
      desc:'귀허계 심층에서 자란 소멸의 짐승. 부풀었다 터지며 주변을 지운다.',
    },
    chimsikgwi: {
      name:'침식귀', chapter:35, type:'normal',
      hp:2613, damage:333, speed:68, xp:249, gold:249, size:20,
      color:'#405858', glowColor:'rgba(70,110,110,0.4)',
      shape:'blob', attackPattern:'melee',
      desc:'존재를 조금씩 갉아먹는 혼. 스치면 짧게 기억을 빨아들인다. (임시: 근접으로 대체)',
    },

    // ── 챕터 36 ──
    oyeomdoenpadogwi: {
      name:'오염된 파도귀', chapter:36, type:'normal',
      hp:2585, damage:318, speed:88, xp:246, gold:246, size:20,
      color:'#607040', glowColor:'rgba(110,140,70,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'외신의 기운에 물든 파도귀. 닿으면 독기가 스민다.',
    },
    jamsikdoenhyeongche: {
      name:'잠식된 형체', chapter:36, type:'normal',
      hp:2955, damage:364, speed:55, xp:281, gold:281, size:23,
      color:'#584870', glowColor:'rgba(110,90,150,0.5)',
      shape:'brute', attackPattern:'explode',
      desc:'잠식되어 불안정해진 형체. 사라졌다 나타나며 약하게 폭발한다. (임시: 자폭으로 대체)',
    },

    // ── 챕터 37 ──
    dwitteullinhwansaengche: {
      name:'뒤틀린 환생체', chapter:37, type:'normal',
      hp:2921, damage:347, speed:72, xp:278, gold:278, size:18,
      color:'#906858', glowColor:'rgba(180,130,110,0.5)',
      shape:'orb', attackPattern:'melee',
      desc:'거듭남이 뒤틀려버린 존재. 쓰러져도 곧 다시 일어난다. (임시: 근접으로 대체)',
    },
    yeokhaenghaneunja: {
      name:'역행하는 자', chapter:37, type:'normal',
      hp:3339, damage:397, speed:76, xp:318, gold:318, size:19,
      color:'#486878', glowColor:'rgba(90,140,160,0.4)',
      shape:'ghost', attackPattern:'melee',
      desc:'시간을 거스르듯 움직이는 혼. 예측과 반대로 움직인다. (임시: 근접으로 대체)',
    },

    // ── 챕터 38 ──
    heomujogak: {
      name:'허무 조각', chapter:38, type:'normal',
      hp:3304, damage:379, speed:54, xp:315, gold:315, size:25,
      color:'#282838', glowColor:'rgba(50,50,70,0.6)',
      shape:'brute', attackPattern:'explode',
      desc:'허무가 뭉쳐진 조각. 광역으로 부풀어 오르다 터진다.',
    },
    bunggoehaneunjanyeong: {
      name:'붕괴하는 잔영', chapter:38, type:'normal',
      hp:3776, damage:433, speed:100, xp:360, gold:360, size:18,
      color:'#585868', glowColor:'rgba(110,110,140,0.4)',
      shape:'ghost', attackPattern:'rush',
      desc:'붕괴 직전의 잔영. 연달아 자취를 감췄다 나타난다. (임시: 돌진으로 대체)',
    },

    // ── 챕터 39 ──
    gyeonggyegwi: {
      name:'경계귀', chapter:39, type:'normal',
      hp:3733, damage:413, speed:66, xp:356, gold:356, size:19,
      color:'#785860', glowColor:'rgba(150,100,110,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'소멸의 경계에 선 혼. 스치면 강하게 기억을 빨아들인다. (임시: 근접으로 대체)',
    },
    somyeoljikjeonja: {
      name:'소멸 직전자', chapter:39, type:'normal',
      hp:4267, damage:473, speed:62, xp:406, gold:406, size:24,
      color:'#583838', glowColor:'rgba(120,70,70,0.5)',
      shape:'brute', attackPattern:'explode',
      desc:'소멸 직전의 존재. 강타 후 부풀어 터진다.',
    },

    // ── 챕터 40 ──
    wangjwapapyeonche: {
      name:'왕좌 파편체', chapter:40, type:'normal',
      hp:4219, damage:452, speed:92, xp:402, gold:402, size:20,
      color:'#a04858', glowColor:'rgba(210,90,110,0.6)',
      shape:'orb', attackPattern:'rush',
      desc:'왕좌에서 떨어져 나온 파편. 사라졌다 나타나 기억을 빨아들인다. (임시: 돌진으로 대체)',
    },
    majimakjaa: {
      name:'마지막 자아', chapter:40, type:'normal',
      hp:4821, damage:516, speed:70, xp:459, gold:459, size:21,
      color:'#705878', glowColor:'rgba(140,110,160,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'마지막까지 남은 자아. 쓰러지며 잔영을 소환한다. (임시: 근접으로 대체)',
    },

    // ═══════════════════════════════════════════════════
    //  시즌 5 (선계) 몬스터 20종 — 챕터 41~50
    //  [UPDATE 2026-07-22] SEASON3_8_STAGES.md 기준 신규 등록. hp/dmg/xp는 시즌4(챕터31~40) 20단계 증가율을
    //  그대로 이어 붙여 계산(시즌 경계에서 난이도 곡선이 끊기지 않게). attackPattern은 시즌3/4와 동일하게
    //  기존 구현된 8종 패턴으로 임시 매핑.
    // ═══════════════════════════════════════════════════

    // ── 챕터 41 — 선계의 관문 ──
    gureumwonhon: {
      name:'구름원혼', chapter:41, type:'normal',
      hp:5510, damage:592, speed:95, xp:525, gold:525, size:18,
      color:'#7898c0', glowColor:'rgba(120,160,200,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'선계 관문을 떠도는 구름 형상의 혼. 바람처럼 밀려든다.',
    },
    seoribyeongsa: {
      name:'서리병사', chapter:41, type:'normal',
      hp:5465, damage:564, speed:50, xp:522, gold:522, size:24,
      color:'#a8c8d8', glowColor:'rgba(180,210,230,0.4)',
      shape:'brute', attackPattern:'melee',
      desc:'서리로 뒤덮인 문지기 병사. 묵직하게 내리친다.',
    },

    // ── 챕터 42 — 신선들의 정원 ──
    bullohwajeong: {
      name:'불로화정', chapter:42, type:'normal',
      hp:6243, damage:645, speed:66, xp:598, gold:598, size:17,
      color:'#c8a868', glowColor:'rgba(220,190,130,0.5)',
      shape:'orb', attackPattern:'melee',
      desc:'불로초에서 태어난 화정. 닿으면 짧게 기력을 흡수한다. (임시: 근접으로 대체)',
    },
    jeongwonjigi: {
      name:'정원지기', chapter:42, type:'normal',
      hp:6171, damage:617, speed:42, xp:591, gold:591, size:25,
      color:'#789058', glowColor:'rgba(140,170,110,0.4)',
      shape:'blob', attackPattern:'melee',
      desc:'신선의 정원을 지키는 존재. 느리지만 꾸준히 다가온다.',
    },

    // ── 챕터 43 — 도술의 전당 ──
    bujeokgwi: {
      name:'부적귀', chapter:43, type:'normal',
      hp:7053, damage:703, speed:100, xp:674, gold:674, size:18,
      color:'#b04840', glowColor:'rgba(210,90,80,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'도술에 깃든 부적이 폭주한 혼. 순식간에 돌진한다.',
    },
    dosulsuryeonja: {
      name:'도술수련자', chapter:43, type:'normal',
      hp:6974, damage:673, speed:58, xp:667, gold:667, size:20,
      color:'#6858a0', glowColor:'rgba(120,100,190,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'도술을 익히다 잘못된 존재. 스치면 기력을 빨아들인다. (임시: 근접으로 대체)',
    },

    // ── 챕터 44 — 깨달음의 산 ──
    gohaengjahon: {
      name:'고행자혼', chapter:44, type:'normal',
      hp:7973, damage:769, speed:60, xp:760, gold:760, size:19,
      color:'#a09060', glowColor:'rgba(190,170,110,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'깨달음을 좇다 스러진 고행자의 혼. (임시: 근접으로 대체)',
    },
    jinripapyeon: {
      name:'진리파편', chapter:44, type:'normal',
      hp:7877, damage:734, speed:48, xp:753, gold:753, size:22,
      color:'#d0c090', glowColor:'rgba(230,210,150,0.6)',
      shape:'orb', attackPattern:'explode',
      desc:'진리에서 떨어져 나온 파편. 부풀었다 터진다.',
    },

    // ── 챕터 45 — 선계 심층 ──
    seongyesumunjang: {
      name:'선계수문장', chapter:45, type:'normal',
      hp:9000, damage:840, speed:52, xp:860, gold:860, size:24,
      color:'#6890c0', glowColor:'rgba(110,150,210,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'선계 심층을 지키는 수문장. 묵직하게 버티고 선다.',
    },
    simcheungseonbyeong: {
      name:'심층선병', chapter:45, type:'normal',
      hp:8904, damage:802, speed:92, xp:850, gold:850, size:20,
      color:'#4868a0', glowColor:'rgba(90,120,190,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'선계 심층에 잠든 선병. 예고 없이 돌진한다.',
    },

    // ── 챕터 46 — 잠식된 선계 ──
    jamsikdoensinseon: {
      name:'잠식된 신선', chapter:46, type:'normal',
      hp:10178, damage:918, speed:64, xp:971, gold:971, size:19,
      color:'#605078', glowColor:'rgba(110,90,150,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'외신의 기운에 잠식된 신선. 닿으면 독기가 스민다.',
    },
    oyeomdoenbit: {
      name:'오염된 빛', chapter:46, type:'normal',
      hp:10061, damage:875, speed:86, xp:961, gold:961, size:18,
      color:'#806890', glowColor:'rgba(150,120,170,0.5)',
      shape:'orb', attackPattern:'rush',
      desc:'오염되어 뒤틀린 신성한 빛. 번쩍이며 달려든다.',
    },

    // ── 챕터 47 — 뒤틀린 도술 ──
    dwitteullinbujeok: {
      name:'뒤틀린 부적', chapter:47, type:'normal',
      hp:11501, damage:1001, speed:98, xp:1099, gold:1099, size:18,
      color:'#904838', glowColor:'rgba(180,90,70,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'뒤틀려버린 부적의 혼. 통제 불능으로 돌진한다.',
    },
    jujudosa: {
      name:'저주도사', chapter:47, type:'normal',
      hp:11380, damage:956, speed:50, xp:1089, gold:1089, size:25,
      color:'#503048', glowColor:'rgba(100,60,90,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'저주에 물든 도사. 무겁게 내리친다.',
    },

    // ── 챕터 48 — 깨달음의 오염 ──
    oyeomdoenjilli: {
      name:'오염된 진리', chapter:48, type:'normal',
      hp:13006, damage:1092, speed:46, xp:1245, gold:1245, size:23,
      color:'#705838', glowColor:'rgba(140,110,70,0.6)',
      shape:'orb', attackPattern:'explode',
      desc:'오염되어 뒤틀린 진리의 파편. 부풀어 터진다.',
    },
    tarakhangohaengja: {
      name:'타락한 고행자', chapter:48, type:'normal',
      hp:12858, damage:1042, speed:62, xp:1231, gold:1231, size:20,
      color:'#584030', glowColor:'rgba(110,80,60,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'타락해버린 고행자의 잔영. (임시: 근접으로 대체)',
    },

    // ── 챕터 49 — 신선들의 타락 ──
    tarakhansinseon: {
      name:'타락한 신선', chapter:49, type:'normal',
      hp:14697, damage:1193, speed:58, xp:1404, gold:1404, size:21,
      color:'#483858', glowColor:'rgba(90,70,110,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'타락해버린 신선. 스치면 강하게 기력을 빨아들인다. (임시: 근접으로 대체)',
    },
    jamsikdoennun: {
      name:'잠식된 눈', chapter:49, type:'normal',
      hp:14532, damage:1140, speed:70, xp:1390, gold:1390, size:17,
      color:'#684078', glowColor:'rgba(130,80,150,0.6)',
      shape:'orb', attackPattern:'rush',
      desc:'선계대왕의 오염된 눈에서 떨어져 나온 파편. 번뜩이며 달려든다.',
    },

    // ── 챕터 50 — 선계의 왕좌 ──
    tarakhancheonin: {
      name:'타락한 천인', chapter:50, type:'normal',
      hp:16606, damage:1301, speed:54, xp:1587, gold:1587, size:24,
      color:'#402838', glowColor:'rgba(90,50,70,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'타락한 천존을 따르던 천인. 묵직하게 내리친다.',
    },
    majimaknunmul: {
      name:'마지막 눈물', chapter:50, type:'normal',
      hp:18978, damage:1491, speed:64, xp:1814, gold:1814, size:19,
      color:'#386080', glowColor:'rgba(70,120,160,0.5)',
      shape:'ghost', attackPattern:'explode',
      desc:'천존의 마지막 눈물이 맺힌 혼. 스러지며 주변을 지운다. (임시: 자폭으로 대체)',
    },

    // ═══════════════════════════════════════════════════
    //  시즌 6 (원계) 몬스터 20종 — 챕터 51~60
    //  [UPDATE 2026-07-24] SEASON3_8_STAGES.md 기준 신규 등록. hp/dmg는 시즌 경계 없이 게임 전체에서
    //  일관되게 관측되는 챕터당 ×1.13~1.15 기하급수 곡선을 그대로 이어 붙여 계산(hp÷10.5=xp=gold, 시즌2~5와 동일 공식).
    //  attackPattern은 기존 구현된 패턴(melee/rush/ranged/swarm/explode)으로 임시 매핑.
    // ═══════════════════════════════════════════════════

    // ── 챕터 51: 법칙의 시작 ──
    beopchikpapyeon: {
      name:'법칙 파편', chapter:51, type:'normal',
      hp:22200, damage:1720, speed:70, xp:2114, gold:2114, size:16,
      color:'#a8c0e0', glowColor:'rgba(170,190,220,0.5)',
      shape:'orb', attackPattern:'ranged',
      desc:'원계에 흩어진 법칙의 파편. 스치기만 해도 존재가 뒤틀린다.',
    },
    wonchoemeari: {
      name:'원초의 메아리', chapter:51, type:'normal',
      hp:21000, damage:1610, speed:88, xp:2000, gold:2000, size:14,
      color:'#8898c8', glowColor:'rgba(140,150,200,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'태초의 소리가 남긴 메아리. 잔상처럼 빠르게 달려든다.',
    },

    // ── 챕터 52: 물리 법칙의 전당 ──
    jeonjagijanjae: {
      name:'전자기 잔재', chapter:52, type:'normal',
      hp:25300, damage:1895, speed:76, xp:2410, gold:2410, size:16,
      color:'#40c0e0', glowColor:'rgba(60,190,220,0.5)',
      shape:'orb', attackPattern:'ranged',
      desc:'전자기력의 흐름에서 떨어져 나온 잔재. 지지직 스파크를 튄다.',
    },
    haekryeokgyeoljeongche: {
      name:'핵력 결정체', chapter:52, type:'normal',
      hp:23900, damage:1780, speed:40, xp:2276, gold:2276, size:22,
      color:'#8040c0', glowColor:'rgba(130,60,190,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'핵력이 응축된 결정체. 단단하게 버티며 짓누른다.',
    },

    // ── 챕터 53: 신적 법칙의 영역 ──
    ingwauigeurimja: {
      name:'인과의 그림자', chapter:53, type:'normal',
      hp:28850, damage:2090, speed:95, xp:2748, gold:2748, size:15,
      color:'#c0a040', glowColor:'rgba(210,170,60,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'원인 없이 나타난 결과의 그림자. 예고 없이 들이닥친다.',
    },
    pagoeuisado: {
      name:'파괴의 사도', chapter:53, type:'normal',
      hp:27250, damage:1965, speed:60, xp:2595, gold:2595, size:20,
      color:'#a02030', glowColor:'rgba(200,50,60,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'파괴신을 섬기는 사도. 닿는 모든 법칙을 무너뜨린다.',
    },

    // ── 챕터 54: 관계 법칙의 미궁 ──
    jiltueuipapyeon: {
      name:'질투의 파편', chapter:54, type:'normal',
      hp:32900, damage:2305, speed:82, xp:3133, gold:3133, size:15,
      color:'#d070a0', glowColor:'rgba(220,120,170,0.5)',
      shape:'orb', attackPattern:'ranged',
      desc:'뒤틀린 관계에서 태어난 질투의 파편. 날카로운 시선을 쏘아 보낸다.',
    },
    gyeongoeuijanyeong: {
      name:'경외의 잔영', chapter:54, type:'normal',
      hp:31000, damage:2165, speed:55, xp:2952, gold:2952, size:19,
      color:'#608040', glowColor:'rgba(100,140,70,0.5)',
      shape:'ghost', attackPattern:'swarm',
      desc:'경외의 감정이 남긴 잔영. 무리 지어 몰려든다.',
    },

    // ── 챕터 55: 원계 심층 ──
    wongyeuipasubyeong: {
      name:'원계의 파수병', chapter:55, type:'normal',
      hp:37500, damage:2540, speed:48, xp:3571, gold:3571, size:23,
      color:'#4030a0', glowColor:'rgba(70,50,180,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'원계 심층을 지키는 파수병. 법칙 그 자체로 무장했다.',
    },
    beopchiksuhosu: {
      name:'법칙 수호수', chapter:55, type:'normal',
      hp:35350, damage:2390, speed:66, xp:3367, gold:3367, size:21,
      color:'#308878', glowColor:'rgba(50,150,130,0.5)',
      shape:'blob', attackPattern:'melee',
      desc:'법칙을 지키도록 빚어진 짐승. 원초적인 힘으로 밀어붙인다.',
    },

    // ── 챕터 56: 잠식된 원계 ──
    oyeomdoenbeopchikche: {
      name:'오염된 법칙체', chapter:56, type:'normal',
      hp:42750, damage:2800, speed:74, xp:4071, gold:4071, size:20,
      color:'#a03878', glowColor:'rgba(200,70,150,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'외신의 기운에 잠식된 법칙의 화신. 오염된 채로 폭주한다.',
    },
    jamsikuichokso: {
      name:'잠식의 촉수', chapter:56, type:'normal',
      hp:40250, damage:2635, speed:52, xp:3833, gold:3833, size:24,
      color:'#301850', glowColor:'rgba(60,30,100,0.5)',
      shape:'blob', attackPattern:'explode',
      desc:'원계를 잠식해가는 촉수 덩어리. 다가가면 터진다.',
    },

    // ── 챕터 57: 뒤틀린 인과 ──
    dwijipyinwonin: {
      name:'뒤집힌 원인', chapter:57, type:'normal',
      hp:48700, damage:3090, speed:90, xp:4638, gold:4638, size:16,
      color:'#7828a0', glowColor:'rgba(150,60,190,0.5)',
      shape:'orb', attackPattern:'ranged',
      desc:'결과가 먼저 온 원인. 시간의 순서를 거슬러 공격한다.',
    },
    gyeolgwaeobsneungeurimja: {
      name:'결과 없는 그림자', chapter:57, type:'normal',
      hp:45900, damage:2905, speed:100, xp:4371, gold:4371, size:14,
      color:'#584868', glowColor:'rgba(110,90,130,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'원인만 있고 결과가 사라진 그림자. 붙잡을 수 없이 빠르다.',
    },

    // ── 챕터 58: 법칙의 붕괴 ──
    bunggoehaneunpapyeon: {
      name:'붕괴하는 파편', chapter:58, type:'normal',
      hp:55500, damage:3405, speed:58, xp:5286, gold:5286, size:22,
      color:'#a06840', glowColor:'rgba(200,130,80,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'무너져 내리는 법칙의 파편. 붕괴의 여파를 흩뿌린다.',
    },
    changjoeujanhae: {
      name:'창조의 잔해', chapter:58, type:'normal',
      hp:52300, damage:3205, speed:44, xp:4981, gold:4981, size:25,
      color:'#c0b0a0', glowColor:'rgba(220,200,180,0.4)',
      shape:'blob', attackPattern:'explode',
      desc:'멈춰버린 창조가 남긴 잔해. 최후의 발악처럼 터져나간다.',
    },

    // ── 챕터 59: 근원의 소멸 ──
    somyeolhaneunnun: {
      name:'소멸하는 눈', chapter:59, type:'normal',
      hp:63200, damage:3755, speed:64, xp:6019, gold:6019, size:18,
      color:'#8898a8', glowColor:'rgba(160,180,190,0.4)',
      shape:'orb', attackPattern:'ranged',
      desc:'스러져가는 원계대왕의 눈. 사그라지기 직전 마지막 빛을 쏜다.',
    },
    geunwoneuipapyeon: {
      name:'근원의 파편', chapter:59, type:'normal',
      hp:59600, damage:3535, speed:50, xp:5676, gold:5676, size:21,
      color:'#401870', glowColor:'rgba(80,30,140,0.5)',
      shape:'ghost', attackPattern:'swarm',
      desc:'근원이 소멸하며 흩어진 파편. 서로를 향해 몰려든다.',
    },

    // ── 챕터 60: 원계의 왕좌 ──
    jungryeokuipapyeon: {
      name:'중력의 파편', chapter:60, type:'normal',
      hp:72000, damage:4140, speed:46, xp:6857, gold:6857, size:23,
      color:'#701828', glowColor:'rgba(150,40,60,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'왕좌 주변에 흩어진 중력의 파편. 짓누르듯 무겁게 짓쳐든다.',
    },
    wangjwaeuigeurimja: {
      name:'왕좌의 그림자', chapter:60, type:'normal',
      hp:67900, damage:3895, speed:78, xp:6467, gold:6467, size:19,
      color:'#201018', glowColor:'rgba(40,20,30,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'타락한 왕좌가 드리운 그림자. 마지막 관문을 지킨다.',
    },

    // ═══════════════════════════════════════════════════
    //  시즌 7 (어계) 몬스터 20종 — 챕터 61~70
    //  [UPDATE 2026-07-28] SEASON3_8_STAGES.md 기준 신규 등록. 사용자 확정 설계: 어계는 시즌1~6의 연속 곡선(챕터당
    //  ×1.13)과 단절 — 챕터60 값에 ×1.13(스무스커브 상 챕터61 값) × 100을 챕터61 기준으로 잡고, 이후 챕터62~70은
    //  다시 챕터당 ×1.13로 진행(계산: eogye_calc.py). xp=gold=hp÷10.5 공식은 그대로 유지.
    // ═══════════════════════════════════════════════════

    // ── 챕터 61: 인식의 균열 ──
    kkumpapyeon: {
      name:'꿈의 파편', chapter:61, type:'normal',
      hp:8140000, damage:468000, speed:60, xp:7810, gold:7810, size:16,
      color:'#a0b0e0', glowColor:'rgba(160,176,224,0.5)',
      shape:'orb', attackPattern:'ranged',
      desc:'인식의 균열 사이로 흘러나온 꿈의 파편. 스치면 잠에 빠뜨린다.',
    },
    gyunyeolgwi: {
      name:'균열귀', chapter:61, type:'normal',
      hp:7670000, damage:440000, speed:95, xp:7340, gold:7340, size:18,
      color:'#606890', glowColor:'rgba(100,110,150,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'인식의 틈으로 뛰쳐나온 혼. 순식간에 거리를 좁힌다.',
    },

    // ── 챕터 62: 형태 없는 바다 ──
    muhyeongche: {
      name:'무형체', chapter:62, type:'normal',
      hp:9190000, damage:529000, speed:44, xp:8900, gold:8900, size:27,
      color:'#286858', glowColor:'rgba(40,110,90,0.5)',
      shape:'blob', attackPattern:'melee',
      desc:'형체를 갖지 못한 존재. 닿기 전까지 그 크기를 가늠할 수 없다.',
    },
    simyeonchoksu: {
      name:'심연촉수', chapter:62, type:'normal',
      hp:8670000, damage:497000, speed:52, xp:8370, gold:8370, size:20,
      color:'#144038', glowColor:'rgba(20,70,60,0.5)',
      shape:'orb', attackPattern:'explode',
      desc:'심연에서 뻗어나온 촉수. 부풀었다 터지며 먹물을 흩뿌린다.',
    },

    // ── 챕터 63: 만목의 감시 ──
    cheongaenunjogak: {
      name:'천개의 눈 조각', chapter:63, type:'normal',
      hp:10400000, damage:597000, speed:58, xp:10130, gold:10130, size:15,
      color:'#a060c0', glowColor:'rgba(170,110,210,0.5)',
      shape:'orb', attackPattern:'ranged',
      desc:'만목에서 떨어져 나온 눈 조각. 시선이 닿으면 정신이 흐트러진다.',
    },
    eungsija: {
      name:'응시자', chapter:63, type:'normal',
      hp:9800000, damage:562000, speed:90, xp:9520, gold:9520, size:19,
      color:'#701890', glowColor:'rgba(130,30,150,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'그저 바라보기만 하는 존재. 그러나 그 시선은 죽음보다 무겁다.',
    },

    // ── 챕터 64: 금기의 이름 ──
    geumgisokssagim: {
      name:'금기의 속삭임', chapter:64, type:'normal',
      hp:11700000, damage:675000, speed:48, xp:11540, gold:11540, size:17,
      color:'#402040', glowColor:'rgba(70,35,70,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'발음해서는 안 될 말을 속삭이는 혼. 들으면 존재가 뒤틀린다.',
    },
    ireumeopsneunja: {
      name:'이름없는자', chapter:64, type:'normal',
      hp:11100000, damage:635000, speed:40, xp:10850, gold:10850, size:24,
      color:'#180818', glowColor:'rgba(30,15,30,0.5)',
      shape:'blob', attackPattern:'explode',
      desc:'이름을 잃어 존재조차 희미한 것. 사라지며 주변을 함께 지운다.',
    },

    // ── 챕터 65: 어계 심층 ──
    nagaksindo: {
      name:'나각신도', chapter:65, type:'normal',
      hp:13300000, damage:763000, speed:54, xp:13140, gold:13140, size:23,
      color:'#801818', glowColor:'rgba(150,30,30,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'잠든 신 나각을 섬기는 광신도. 묵직하게 짓쳐든다.',
    },
    jamdeunjaujong: {
      name:'잠든자의 종', chapter:65, type:'normal',
      hp:12500000, damage:718000, speed:70, xp:12350, gold:12350, size:18,
      color:'#601010', glowColor:'rgba(110,20,20,0.5)',
      shape:'ghost', attackPattern:'swarm',
      desc:'잠든 신의 종. 무리 지어 다가온다.',
    },

    // ── 챕터 66: 외신화의 절정 ──
    ojeomaegissi: {
      name:'오염된 애기씨의 잔영', chapter:66, type:'normal',
      hp:15000000, damage:862000, speed:88, xp:14970, gold:14970, size:16,
      color:'#907098', glowColor:'rgba(160,130,170,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'오염을 감당하지 못한 또 다른 애기씨의 잔영. 낯설고도 익숙하다.',
    },
    gangrimgeurimja: {
      name:'강림의 그림자', chapter:66, type:'normal',
      hp:14100000, damage:811000, speed:46, xp:14070, gold:14070, size:25,
      color:'#503858', glowColor:'rgba(90,60,100,0.5)',
      shape:'blob', attackPattern:'melee',
      desc:'외신이 강림하기 직전 드리우는 그림자. 짙어질수록 무거워진다.',
    },

    // ── 챕터 67: 광기의 조류 ──
    gwanggipado: {
      name:'광기의 파도', chapter:67, type:'normal',
      hp:16900000, damage:974000, speed:62, xp:17050, gold:17050, size:20,
      color:'#209878', glowColor:'rgba(30,170,140,0.5)',
      shape:'orb', attackPattern:'swarm',
      desc:'밀려드는 광기의 파도. 닿으면 이성이 쓸려나간다.',
    },
    joryugwi: {
      name:'조류귀', chapter:67, type:'normal',
      hp:16000000, damage:916000, speed:98, xp:16030, gold:16030, size:17,
      color:'#106050', glowColor:'rgba(20,110,90,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'조류를 타고 밀려온 혼. 파도보다 빠르게 덮친다.',
    },

    // ── 챕터 68: 나각이 깨어나다 ──
    nunkkeopulgyunyeol: {
      name:'눈꺼풀의 균열', chapter:68, type:'normal',
      hp:19100000, damage:1100000, speed:42, xp:19420, gold:19420, size:22,
      color:'#304878', glowColor:'rgba(50,80,140,0.5)',
      shape:'orb', attackPattern:'explode',
      desc:'잠든 신의 눈꺼풀에 생긴 균열. 벌어질 때마다 세상이 흔들린다.',
    },
    jamkkaeneunja: {
      name:'잠깨는자', chapter:68, type:'normal',
      hp:18100000, damage:1040000, speed:50, xp:18250, gold:18250, size:26,
      color:'#182848', glowColor:'rgba(30,50,90,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'잠에서 반쯤 깨어난 존재. 움직임 하나하나가 재앙이다.',
    },

    // ── 챕터 69: 말할 수 없는 것 ──
    chimmukgwi: {
      name:'침묵귀', chapter:69, type:'normal',
      hp:21600000, damage:1240000, speed:66, xp:22120, gold:22120, size:16,
      color:'#280010', glowColor:'rgba(50,0,20,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'존재 자체가 침묵을 강요하는 혼. 이름을 알아도 부를 수 없다.',
    },
    malhaeseonandoelgeot: {
      name:'말해선안될것', chapter:69, type:'normal',
      hp:20400000, damage:1170000, speed:40, xp:20790, gold:20790, size:24,
      color:'#140008', glowColor:'rgba(30,0,15,0.5)',
      shape:'blob', attackPattern:'melee',
      desc:'언급하는 것조차 금기인 존재. 침묵 속에서만 안전하다.',
    },

    // ── 챕터 70: 어계의 왕좌 ──
    taechojasik: {
      name:'태초의 자식', chapter:70, type:'normal',
      hp:24400000, damage:1410000, speed:56, xp:25200, gold:25200, size:23,
      color:'#901830', glowColor:'rgba(160,30,50,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'태모가 낳은 수많은 자식 중 하나. 왕좌를 지킨다.',
    },
    eomeonipapyeon: {
      name:'어머니의 파편', chapter:70, type:'normal',
      hp:23000000, damage:1320000, speed:68, xp:23690, gold:23690, size:18,
      color:'#601020', glowColor:'rgba(110,20,40,0.5)',
      shape:'orb', attackPattern:'explode',
      desc:'태모에게서 떨어져 나온 파편. 흩어지며 근원의 힘을 흘린다.',
    },
    // ── 시즌8: 황계 (챕터 71~80) ──
    // 반물질계 — 챕터71이 정점이고 챕터80으로 갈수록 약해지는 역방향 곡선(SEASON3_8_STAGES.md 설계).
    jongmalpapyeon: {
      name:'종말파편', nameEn:'End Shard', chapter:71, type:'normal',
      hp:276000, damage:15900, speed:60, xp:285, gold:285, size:22,
      color:'#5a3a6a', glowColor:'rgba(120,80,150,0.5)',
      shape:'blob', attackPattern:'explode',
      desc:'반물질이 무너지며 떨어져 나온 조각.',
    },
    bunggoeja: {
      name:'붕괴자', nameEn:'Collapser', chapter:71, type:'normal',
      hp:259000, damage:15000, speed:67, xp:268, gold:268, size:25,
      color:'#4a2a5a', glowColor:'rgba(100,60,130,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'닿는 모든 것을 함께 무너뜨린다.',
    },
    geoulpapyeon: {
      name:'거울파편', nameEn:'Mirror Shard', chapter:72, type:'normal',
      hp:244000, damage:14100, speed:46, xp:252, gold:252, size:19,
      color:'#7090b0', glowColor:'rgba(140,180,220,0.5)',
      shape:'orb', attackPattern:'ranged',
      desc:'깨진 거울 조각이 스스로 움직인다.',
    },
    bansache: {
      name:'반사체', nameEn:'Reflector', chapter:72, type:'normal',
      hp:229000, damage:13300, speed:53, xp:237, gold:237, size:21,
      color:'#90b0d0', glowColor:'rgba(180,210,240,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'공격을 되비추는 표면.',
    },
    yeokhaenggwi: {
      name:'역행귀', nameEn:'Reversal Wraith', chapter:73, type:'normal',
      hp:216000, damage:12500, speed:72, xp:223, gold:223, size:20,
      color:'#6a5a8a', glowColor:'rgba(140,120,180,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'시간을 거슬러 걷는 혼.',
    },
    gwageoui_janjae: {
      name:'과거의 잔재', nameEn:'Remnant of the Past', chapter:73, type:'normal',
      hp:203000, damage:11700, speed:79, xp:210, gold:210, size:18,
      color:'#5a4a7a', glowColor:'rgba(120,100,160,0.5)',
      shape:'blob', attackPattern:'swarm',
      desc:'이미 지나간 것이 남긴 자국.',
    },
    ssangsomyeolche: {
      name:'쌍소멸체', nameEn:'Annihilator', chapter:74, type:'normal',
      hp:191000, damage:11000, speed:52, xp:197, gold:197, size:23,
      color:'#a04060', glowColor:'rgba(200,80,120,0.6)',
      shape:'orb', attackPattern:'explode',
      desc:'물질과 만나면 함께 사라진다.',
    },
    banmuljilgu: {
      name:'반물질구', nameEn:'Antimatter Orb', chapter:74, type:'normal',
      hp:180000, damage:10400, speed:59, xp:186, gold:186, size:20,
      color:'#c05070', glowColor:'rgba(220,100,140,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'불안정하게 진동하는 구체.',
    },
    hwanggyebyeongjol: {
      name:'황계병졸', nameEn:'Ruined Soldier', chapter:75, type:'normal',
      hp:169000, damage:9770, speed:40, xp:175, gold:175, size:24,
      color:'#8a7040', glowColor:'rgba(180,150,90,0.5)',
      shape:'brute', attackPattern:'melee',
      desc:'황계대왕의 이름으로 움직이는 병졸.',
    },
    banmuljilseok_sujipga: {
      name:'반물질석 수집가', nameEn:'Antimatter Collector', chapter:75, type:'normal',
      hp:159000, damage:9190, speed:47, xp:164, gold:164, size:22,
      color:'#a08850', glowColor:'rgba(200,170,110,0.5)',
      shape:'brute', attackPattern:'rush',
      desc:'반물질석을 그러모으는 것.',
    },
    geouljaa_bunsin: {
      name:'거울자아 분신', nameEn:'Mirror Self Fragment', chapter:76, type:'normal',
      hp:150000, damage:8650, speed:66, xp:155, gold:155, size:21,
      color:'#b0a0c0', glowColor:'rgba(210,190,230,0.6)',
      shape:'ghost', attackPattern:'rush',
      desc:'애기씨의 얼굴을 한 무언가.',
    },
    gakseong_jeonjo: {
      name:'각성의 전조', nameEn:'Omen of Awakening', chapter:76, type:'normal',
      hp:141000, damage:8130, speed:73, xp:145, gold:145, size:19,
      color:'#c0b0d0', glowColor:'rgba(220,200,240,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'무언가가 깨어나기 직전의 떨림.',
    },
    hapchiui_sado: {
      name:'합치의 사도', nameEn:'Apostle of Convergence', chapter:77, type:'normal',
      hp:132000, damage:7650, speed:55, xp:137, gold:137, size:22,
      color:'#d0b060', glowColor:'rgba(230,200,120,0.6)',
      shape:'ghost', attackPattern:'ranged',
      desc:'둘이 하나가 되기를 갈망한다.',
    },
    yeoneonui_jogak: {
      name:'예언의 조각', nameEn:'Fragment of Prophecy', chapter:77, type:'normal',
      hp:124000, damage:7190, speed:62, xp:129, gold:129, size:18,
      color:'#c0a050', glowColor:'rgba(220,190,110,0.5)',
      shape:'blob', attackPattern:'swarm',
      desc:'적혀 있던 결말의 일부.',
    },
    taechoui_janhyang: {
      name:'태초의 잔향', nameEn:'Echo of the Origin', chapter:78, type:'normal',
      hp:117000, damage:6770, speed:48, xp:121, gold:121, size:20,
      color:'#a0c0b0', glowColor:'rgba(190,220,210,0.5)',
      shape:'ghost', attackPattern:'swarm',
      desc:'가장 처음의 소리가 남긴 울림.',
    },
    gwihwanhaneun_geot: {
      name:'귀환하는 것', nameEn:'The Returning', chapter:78, type:'normal',
      hp:110000, damage:6370, speed:55, xp:114, gold:114, size:19,
      color:'#90b0a0', glowColor:'rgba(170,210,190,0.5)',
      shape:'blob', attackPattern:'rush',
      desc:'왔던 길을 되짚어 돌아간다.',
    },
    jaaui_papyeon: {
      name:'자아의 파편', nameEn:'Shard of Self', chapter:79, type:'normal',
      hp:104000, damage:5990, speed:78, xp:107, gold:107, size:18,
      color:'#e0d0a0', glowColor:'rgba(240,225,180,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'누군가의 자아에서 떨어져 나온 조각.',
    },
    sunsuhan_geurimja: {
      name:'순수한 그림자', nameEn:'Pure Shadow', chapter:79, type:'normal',
      hp:97500, damage:5630, speed:85, xp:101, gold:101, size:17,
      color:'#d0c090', glowColor:'rgba(230,215,160,0.6)',
      shape:'ghost', attackPattern:'rush',
      desc:'자아만 남아 그림자가 된 것.',
    },
    taechoui_bit: {
      name:'태초의 빛', nameEn:'Primordial Light', chapter:80, type:'normal',
      hp:91800, damage:5300, speed:44, xp:95, gold:95, size:16,
      color:'#f0e8c0', glowColor:'rgba(250,245,210,0.7)',
      shape:'orb', attackPattern:'ranged',
      desc:'해치려는 뜻이 없는 빛.',
    },
    eorin_useum: {
      name:'어린 웃음', nameEn:'Little Laughter', chapter:80, type:'normal',
      hp:86300, damage:4990, speed:51, xp:89, gold:89, size:15,
      color:'#f0e0d0', glowColor:'rgba(250,230,220,0.7)',
      shape:'blob', attackPattern:'swarm',
      desc:'어디선가 아이가 웃는 소리.',
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

    // [UPDATE 2026-07-24] 시즌2~4(챕터11~40) 엘리트 완전 누락 버그 수정 — spawner.js가 존재하지 않는
    // elite_ch11_14/15_17/18_20 키를 참조해 조용히 기본 몬스터(ghost)로 폴백되고 있었음.
    // 시즌1과 동일하게 2챕터당 1종, 시즌 끝 값이 다음 시즌 시작 챕터의 일반 몬스터 체력과 비슷해지도록 보간.
    // ── 시즌2: 유명계 (챕터11~20) ──
    elite_ch11_12: {
      name:'곤봉귀', chapter:11, type:'elite',
      hp:800, damage:65, speed:46, xp:85, gold:85, size:22,
      color:'#7040a0', glowColor:'rgba(140,80,190,0.6)',
      shape:'brute', attackPattern:'rush',
      desc:'황천강가를 떠도는 곤봉 든 도깨비. 무자비하게 내리찍는다.',
    },
    elite_ch13_14: {
      name:'여우불 환영', chapter:13, type:'elite',
      hp:900, damage:80, speed:52, xp:100, gold:100, size:22,
      color:'#8050b0', glowColor:'rgba(160,100,200,0.6)',
      shape:'ghost', attackPattern:'ranged',
      desc:'유명계를 떠도는 여우 정령의 환영. 도깨비불을 흩뿌린다.',
    },
    elite_ch15_16: {
      name:'명부 파수병', chapter:15, type:'elite',
      hp:1000, damage:92, speed:34, xp:110, gold:110, size:22,
      color:'#4858a0', glowColor:'rgba(90,110,190,0.6)',
      shape:'brute', attackPattern:'melee',
      desc:'명부의 관문을 지키는 석상 파수병. 굳건히 버틴다.',
    },
    elite_ch17_18: {
      name:'도깨비불 삼혼', chapter:17, type:'elite',
      hp:1100, damage:102, speed:48, xp:120, gold:120, size:22,
      color:'#a04828', glowColor:'rgba(220,110,60,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'세 혼불이 뭉쳐 하나가 된 존재. 번갈아 화염구를 날린다.',
    },
    elite_ch19_20: {
      name:'저승 문지기', chapter:19, type:'elite',
      hp:1200, damage:115, speed:44, xp:135, gold:135, size:22,
      color:'#3050a0', glowColor:'rgba(70,100,210,0.6)',
      shape:'brute', attackPattern:'rush',
      desc:'저승 문턱을 지키는 오니. 산 자를 절대 들여보내지 않는다.',
    },

    // ── 시즌3: 망랑계 (챕터21~30) ──
    elite_ch21_22: {
      name:'파편 원혼', chapter:21, type:'elite',
      hp:1350, damage:138, speed:58, xp:150, gold:150, size:22,
      color:'#3868c0', glowColor:'rgba(80,130,220,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'혼돈에 산산조각난 원혼의 파편들이 뭉쳐 떠돈다.',
    },
    elite_ch23_24: {
      name:'통곡의 사당', chapter:23, type:'elite',
      hp:1950, damage:173, speed:20, xp:215, gold:215, size:24,
      color:'#586878', glowColor:'rgba(110,130,150,0.6)',
      shape:'brute', attackPattern:'ranged',
      desc:'세 얼굴로 통곡하는 사당의 석상. 제자리에서 저주를 흩뿌린다.',
    },
    elite_ch25_26: {
      name:'저주받은 두루마리', chapter:25, type:'elite',
      hp:2500, damage:207, speed:50, xp:280, gold:280, size:22,
      color:'#5858a0', glowColor:'rgba(110,110,200,0.6)',
      shape:'ghost', attackPattern:'ranged',
      desc:'구름을 두른 유령이 저주받은 두루마리를 펼쳐 든다.',
    },
    elite_ch27_28: {
      name:'성운 골렘', chapter:27, type:'elite',
      hp:3100, damage:242, speed:36, xp:345, gold:345, size:24,
      color:'#383868', glowColor:'rgba(70,70,130,0.6)',
      shape:'brute', attackPattern:'melee',
      desc:'별빛 조각이 뭉쳐 이루어진 골렘. 느리지만 압도적이다.',
    },
    elite_ch29_30: {
      name:'역병 덩어리', chapter:29, type:'elite',
      hp:3700, damage:276, speed:40, xp:410, gold:410, size:24,
      color:'#308050', glowColor:'rgba(60,160,100,0.6)',
      shape:'blob', attackPattern:'explode',
      desc:'망랑계를 떠도는 역병 덩어리. 다가가면 터진다.',
    },

    // ── 시즌4: 귀허계 (챕터31~40) ──
    elite_ch31_32: {
      name:'다안충', chapter:31, type:'elite',
      hp:4500, damage:330, speed:44, xp:500, gold:500, size:24,
      color:'#5030a0', glowColor:'rgba(110,70,210,0.6)',
      shape:'blob', attackPattern:'ranged',
      desc:'수많은 눈이 달린 촉수 괴물. 모든 방향을 동시에 노려본다.',
    },
    elite_ch33_34: {
      name:'육편더미', chapter:33, type:'elite',
      hp:6500, damage:420, speed:22, xp:725, gold:725, size:26,
      color:'#701828', glowColor:'rgba(150,40,60,0.6)',
      shape:'blob', attackPattern:'explode',
      desc:'귀허계에 쌓인 살점 더미. 가까이 가면 부풀어 터진다.',
    },
    elite_ch35_36: {
      name:'천안성', chapter:35, type:'elite',
      hp:8500, damage:505, speed:38, xp:950, gold:950, size:24,
      color:'#6828a0', glowColor:'rgba(140,60,210,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'수많은 눈을 가진 별의 형상. 시선이 닿는 곳마다 저주를 내린다.',
    },
    elite_ch37_38: {
      name:'공허의 균열', chapter:37, type:'elite',
      hp:10500, damage:595, speed:30, xp:1170, gold:1170, size:26,
      color:'#201040', glowColor:'rgba(50,25,90,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'허공에 갈라진 균열. 그 너머에서 무언가 계속 새어나온다.',
    },
    elite_ch39_40: {
      name:'내장 방황자', chapter:39, type:'elite',
      hp:12500, damage:680, speed:42, xp:1395, gold:1395, size:24,
      color:'#385858', glowColor:'rgba(70,110,110,0.6)',
      shape:'ghost', attackPattern:'rush',
      desc:'귀허계를 헤매는 좀비. 끊임없이 무언가를 찾아 헤맨다.',
    },

    // ── 시즌5: 선계 (챕터41~50) — 사신(四神) 4종. 그림이 4장뿐이라 4구간으로 재분배(마지막만 3챕터).
    elite_ch41_42: {
      name:'현무 수호령', chapter:41, type:'elite',
      hp:16500, damage:870, speed:34, xp:1830, gold:1830, size:24,
      color:'#3868a0', glowColor:'rgba(70,130,190,0.6)',
      shape:'brute', attackPattern:'melee',
      desc:'선계 관문을 지키는 북방의 수호령. 굳건한 등껍질로 모든 공격을 막아낸다.',
    },
    elite_ch43_44: {
      name:'청룡', chapter:43, type:'elite',
      hp:28800, damage:1280, speed:56, xp:3200, gold:3200, size:26,
      color:'#2860a0', glowColor:'rgba(50,110,190,0.6)',
      shape:'ghost', attackPattern:'rush',
      desc:'동방을 다스리는 푸른 용. 구름을 가르며 쏜살같이 달려든다.',
    },
    elite_ch45_47: {
      name:'백호', chapter:45, type:'elite',
      hp:41000, damage:1690, speed:64, xp:4550, gold:4550, size:25,
      color:'#c0c8d0', glowColor:'rgba(220,230,240,0.5)',
      shape:'brute', attackPattern:'rush',
      desc:'서방을 다스리는 흰 호랑이. 날카로운 발톱으로 순식간에 베어낸다.',
    },
    elite_ch48_50: {
      name:'주작', chapter:48, type:'elite',
      hp:49500, damage:1960, speed:50, xp:5500, gold:5500, size:25,
      color:'#a83828', glowColor:'rgba(220,90,50,0.6)',
      shape:'orb', attackPattern:'ranged',
      desc:'남방을 다스리는 붉은 봉황. 불의 깃털을 흩뿌려 태운다.',
    },
    // [UPDATE 2026-07-29] 챕터51 이후(원계/어계/황계) 엘리트 밀도 상향 — 기존엔 51~60/61~70을
    // 통짜 1종씩으로 때웠으나(elite_ch51_60/elite_ch61_70), 41~50 구간의 2~3챕터 단위 밀도에 맞춰
    // 51~80을 2챕터 단위 15종으로 세분화. 사용자 제공 신규 일러스트(이미지 모음/19. 엘리트 몹) 반영.
    // 시즌8(챕터71~80)은 아직 스테이지/몬스터/보스 데이터가 없어 실제로 도달 불가하지만, 추후 시즌8
    // 제작 시 바로 쓸 수 있도록 미리 등록해둠(스폰 로직도 동일하게 미리 확장).
    elite_ch51_52: {
      name:'결정 파수병', chapter:51, type:'elite',
      hp:150000, damage:6000, speed:40, xp:14300, gold:14300, size:24,
      color:'#6838a0', glowColor:'rgba(140,80,200,0.6)',
      shape:'brute', attackPattern:'melee',
      desc:'원계의 법칙이 결정화되어 갑주를 이룬 파수병.',
    },
    elite_ch53_54: {
      name:'균열거미', chapter:53, type:'elite',
      hp:191500, damage:7660, speed:46, xp:18240, gold:18240, size:25,
      color:'#682850', glowColor:'rgba(150,50,90,0.6)',
      shape:'brute', attackPattern:'rush',
      desc:'법칙의 틈새에서 기어나온 다리 많은 결정체.',
    },
    elite_ch55_56: {
      name:'공허 결정체', chapter:55, type:'elite',
      hp:244600, damage:9780, speed:42, xp:23300, gold:23300, size:25,
      color:'#380818', glowColor:'rgba(180,20,50,0.6)',
      shape:'brute', attackPattern:'melee',
      desc:'가슴에 뚫린 공허가 모든 빛을 집어삼킨다.',
    },
    elite_ch57_58: {
      name:'붕괴하는 소용돌이', chapter:57, type:'elite',
      hp:312300, damage:12490, speed:54, xp:29740, gold:29740, size:25,
      color:'#a01838', glowColor:'rgba(220,30,60,0.7)',
      shape:'orb', attackPattern:'ranged',
      desc:'법칙이 붕괴하며 생긴 소용돌이. 닿으면 찢겨나간다.',
    },
    elite_ch59_60: {
      name:'법칙의 파편체', chapter:59, type:'elite',
      hp:398800, damage:15950, speed:44, xp:37980, gold:37980, size:26,
      color:'#701020', glowColor:'rgba(200,20,50,0.7)',
      shape:'brute', attackPattern:'melee',
      desc:'원계의 법칙이 응집되어 하나의 존재가 된 파편체. 원계 최강의 엘리트.',
    },
    elite_ch61_62: {
      name:'성운을 삼킨 뱀', chapter:61, type:'elite',
      hp:52000000, damage:3000000, speed:60, xp:4952380, gold:4952380, size:25,
      color:'#302868', glowColor:'rgba(90,70,180,0.6)',
      shape:'ghost', attackPattern:'rush',
      desc:'별의 죽음을 몸에 두르고 소리 없이 미끄러진다.',
    },
    elite_ch63_64: {
      name:'심연의 촉수괴', chapter:63, type:'elite',
      hp:66399000, damage:3831000, speed:50, xp:6323710, gold:6323710, size:26,
      color:'#301850', glowColor:'rgba(120,60,160,0.6)',
      shape:'brute', attackPattern:'melee',
      desc:'셀 수 없는 촉수로 인식 밖에서 붙잡아온다.',
    },
    elite_ch65_66: {
      name:'천안의 심연체', chapter:65, type:'elite',
      hp:84785000, damage:4891000, speed:54, xp:8074760, gold:8074760, size:26,
      color:'#201840', glowColor:'rgba(100,70,170,0.55)',
      shape:'blob', attackPattern:'ranged',
      desc:'수천 개의 눈이 동시에 플레이어를 겨눈다.',
    },
    elite_ch67_68: {
      name:'다안의 유영자', chapter:67, type:'elite',
      hp:108261000, damage:6246000, speed:58, xp:10310570, gold:10310570, size:27,
      color:'#181030', glowColor:'rgba(80,50,140,0.55)',
      shape:'ghost', attackPattern:'swarm',
      desc:'허공을 헤엄치며 존재 자체로 인식을 좀먹는다.',
    },
    elite_ch69_70: {
      name:'미명의 감시안', chapter:69, type:'elite',
      hp:138239000, damage:7975000, speed:52, xp:13165610, gold:13165610, size:27,
      color:'#100818', glowColor:'rgba(140,60,180,0.65)',
      shape:'orb', attackPattern:'ranged',
      desc:'어계의 신격들을 대신해 지켜보는 이름 없는 눈.',
    },
    // [UPDATE 2026-08-02] 일반 몬스터는 701(챕터71)이 정점, 800(챕터80)으로 갈수록 약해지는
    // 역방향 곡선인데 엘리트만 반대로(챕터가 올라갈수록 강해지게) 설계돼 있던 불일치 수정 —
    // 스탯 수치를 71↔79, 73↔77 사이에서 맞바꿔 동일한 역방향 곡선으로 통일(75는 중앙이라 그대로).
    elite_ch71_72: {
      name:'황계의 사자', chapter:71, type:'elite',
      hp:4692620, damage:270730, speed:44, xp:446916, gold:446916, size:28,
      color:'#282038', glowColor:'rgba(90,60,150,0.5)',
      shape:'ghost', attackPattern:'melee',
      desc:'황계의 뜻을 전하러 온 어두운 사자. 시즌8 최강의 엘리트.',
    },
    elite_ch73_74: {
      name:'잔영의 해골병', chapter:73, type:'elite',
      hp:3675010, damage:212020, speed:58, xp:350001, gold:350001, size:27,
      color:'#181020', glowColor:'rgba(70,50,110,0.5)',
      shape:'ghost', attackPattern:'rush',
      desc:'존재가 다한 뒤에도 남은 잔영이 뼈째로 움직인다.',
    },
    elite_ch75_76: {
      name:'타천의 파수', chapter:75, type:'elite',
      hp:2878070, damage:166040, speed:50, xp:274102, gold:274102, size:27,
      color:'#201018', glowColor:'rgba(100,30,50,0.55)',
      shape:'brute', attackPattern:'rush',
      desc:'날개 꺾인 파수꾼이 마지막 관문을 지킨다.',
    },
    elite_ch77_78: {
      name:'은하를 삼킨 자', chapter:77, type:'elite',
      hp:2253950, damage:130040, speed:56, xp:214662, gold:214662, size:26,
      color:'#301848', glowColor:'rgba(110,60,170,0.6)',
      shape:'ghost', attackPattern:'ranged',
      desc:'은하 하나를 통째로 몸속에 품고 있다.',
    },
    elite_ch79_80: {
      name:'황계 최후의 파편', chapter:79, type:'elite',
      hp:1765180, damage:101840, speed:46, xp:168112, gold:168112, size:26,
      color:'#382048', glowColor:'rgba(150,90,210,0.65)',
      shape:'brute', attackPattern:'melee',
      desc:'황계로 향하는 마지막 관문에 선 결정체. 옛 위세는 이미 다했다.',
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
          { threshold:1.0, patterns:['spiral','rush','shockwave','ring_burst'],             interval:2.8 },
          { threshold:0.5, patterns:['spiral','spiral','rush','shockwave','ring_burst'],    interval:2.0 },
        ]},
      final: { id:'chapter_boss',
        name:'황천 뱃사공',           nameEn:'Ferryman of the Sanzu River',
        sub:'황천강을 지배하는 망자의 인도자', subEn:'The ancient ferryman who rules the river of the dead',
        color:'#1a2a40', hp:14500, dmg:92, spd:60,
        phases:[
          { threshold:1.0, patterns:['summon','spiral','sweep','ring_burst'],               interval:3.0 },
          { threshold:0.6, patterns:['summon','rush','sweep','shockwave','ring_burst'],     interval:2.2 },
          { threshold:0.3, patterns:['spiral','rush','shockwave','summon','ring_burst'],    interval:1.5 },
        ]},
    },
    12: {
      mid:   { id:'mid_boss',
        name:'포졸대장의 검문',        nameEn:"Captain's Checkpoint",
        sub:'저승 관문을 지키는 검문관', subEn:'Underworld checkpoint enforcer blocking all passage',
        color:'#203060', hp:6500, dmg:68, spd:67,
        phases:[
          { threshold:1.0, patterns:['shockwave','rush','rush','ring_burst'],               interval:2.7 },
          { threshold:0.5, patterns:['shockwave','shockwave','rush','spiral','ring_burst'], interval:2.0 },
        ]},
      final: { id:'chapter_boss',
        name:'저승 포졸대장',         nameEn:'Underworld Guard Captain',
        sub:'사슬 속박과 처형의 집행자', subEn:'Commander of chains who executes judgment without mercy',
        color:'#102050', hp:16000, dmg:98, spd:62,
        phases:[
          { threshold:1.0, patterns:['summon','shockwave','rush','ring_burst'],             interval:2.9 },
          { threshold:0.6, patterns:['summon','shockwave','rush','sweep','ring_burst'],     interval:2.1 },
          { threshold:0.3, patterns:['shockwave','shockwave','spiral','rush','ring_burst'], interval:1.4 },
        ]},
    },
    13: {
      mid:   { id:'mid_boss',
        name:'기억귀의 먹이터',        nameEn:"Memory Devourer's Feeding Ground",
        sub:'기억을 뜯어먹는 먹이터의 주인', subEn:'Master of the ground where memories are consumed',
        color:'#403060', hp:7200, dmg:73, spd:68,
        phases:[
          { threshold:1.0, patterns:['sweep','spiral','rush','ring_burst'],                 interval:2.7 },
          { threshold:0.5, patterns:['sweep','sweep','spiral','rush','ring_burst'],         interval:1.9 },
        ]},
      final: { id:'chapter_boss',
        name:'기억귀',                nameEn:'The Memory Devourer',
        sub:'망각의 안개로 기억을 지워버리는 미궁의 지배자', subEn:'Ruler of the labyrinth who erases memories with mist of oblivion',
        color:'#2a1a50', hp:17800, dmg:105, spd:63,
        phases:[
          { threshold:1.0, patterns:['sweep','spiral','summon','ring_burst'],               interval:2.9 },
          { threshold:0.6, patterns:['sweep','spiral','shockwave','ring_burst'],            interval:2.0 },
          { threshold:0.3, patterns:['sweep','sweep','spiral','rush','ring_burst'],         interval:1.4 },
        ]},
    },
    14: {
      mid:   { id:'mid_boss',
        name:'심판관의 첫 번째 시험',  nameEn:"Judge's First Trial",
        sub:'업보를 저울질하는 첫 심판', subEn:'The opening judgment that weighs karmic debt',
        color:'#504010', hp:8000, dmg:78, spd:68,
        phases:[
          { threshold:1.0, patterns:['summon','shockwave','rush','ring_burst'],             interval:2.7 },
          { threshold:0.5, patterns:['summon','summon','shockwave','spiral','ring_burst'],  interval:1.9 },
        ]},
      final: { id:'chapter_boss',
        name:'환생 심판관',           nameEn:'Reincarnation Judge',
        sub:'영혼의 무게를 재는 환생 전당의 지배자', subEn:'Sovereign of the Hall of Reincarnation who weighs every soul',
        color:'#3a2a00', hp:19500, dmg:112, spd:64,
        phases:[
          { threshold:1.0, patterns:['summon','sweep','shockwave','ring_burst'],            interval:2.8 },
          { threshold:0.6, patterns:['summon','summon','spiral','ring_burst'],              interval:2.0 },
          { threshold:0.3, patterns:['summon','shockwave','spiral','rush','ring_burst'],    interval:1.3 },
        ]},
    },
    15: {
      mid:   { id:'mid_boss',
        name:'오관대왕의 시험',        nameEn:"Ogwan's Trial",
        sub:'명부의 다섯 관문을 지키는 시험관', subEn:'Overseer of the five gates of the underworld records',
        color:'#600010', hp:9000, dmg:84, spd:69,
        phases:[
          { threshold:1.0, patterns:['shockwave','summon','spiral','ring_burst'],           interval:2.6 },
          { threshold:0.5, patterns:['shockwave','summon','summon','rush','ring_burst'],    interval:1.8 },
        ]},
      final: { id:'chapter_boss',
        name:'오관대왕',              nameEn:'Ogwan, King of Five Gates',
        sub:'명부의 심장을 지배하는 시왕 중의 왕', subEn:'Greatest among the Ten Kings who rules the heart of the underworld',
        color:'#3a0008', hp:21500, dmg:120, spd:65,
        phases:[
          { threshold:1.0, patterns:['shockwave','summon','sweep','ring_burst'],            interval:2.8 },
          { threshold:0.6, patterns:['shockwave','summon','spiral','ring_burst'],           interval:2.0 },
          { threshold:0.3, patterns:['shockwave','shockwave','summon','rush','ring_burst'], interval:1.3 },
        ]},
    },
    16: {
      mid:   { id:'mid_boss',
        name:'강림의 첫 번째 강림',    nameEn:"Gangrim's First Descent",
        sub:'오염된 기운을 앞세워 강림하는 차사', subEn:'A soul reaper descending with the taint of the Outer God',
        color:'#200030', hp:10000, dmg:90, spd:70,
        phases:[
          { threshold:1.0, patterns:['rush','summon','spiral','ring_burst'],                interval:2.6 },
          { threshold:0.5, patterns:['rush','rush','summon','shockwave','ring_burst'],      interval:1.8 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 강림도령',        nameEn:'Corrupted Gangrim',
        sub:'외신에 잠식되어 타락한 저승사자', subEn:'The legendary soul reaper devoured and corrupted by the Outer God',
        color:'#100020', hp:23500, dmg:128, spd:66,
        phases:[
          { threshold:1.0, patterns:['rush','summon','shockwave','ring_burst'],             interval:2.7 },
          { threshold:0.6, patterns:['rush','rush','spiral','summon','ring_burst'],         interval:1.9 },
          { threshold:0.3, patterns:['rush','rush','shockwave','summon','ring_burst'],      interval:1.2 },
        ]},
    },
    17: {
      mid:   { id:'mid_boss',
        name:'판관의 첫 번째 심판',    nameEn:"Judge's First Corrupt Ruling",
        sub:'뒤틀린 저승법으로 죄를 날조하는 판관', subEn:'A judge who fabricates guilt using the twisted laws of the dead',
        color:'#301000', hp:11000, dmg:96, spd:70,
        phases:[
          { threshold:1.0, patterns:['sweep','shockwave','rush','ring_burst'],              interval:2.5 },
          { threshold:0.5, patterns:['sweep','sweep','shockwave','spiral','ring_burst'],    interval:1.7 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 판관',           nameEn:'The Corrupt Judge',
        sub:'저승법을 유린하는 혼돈의 집행자', subEn:'An executioner of chaos who tramples the laws of the underworld',
        color:'#200a00', hp:25500, dmg:136, spd:67,
        phases:[
          { threshold:1.0, patterns:['sweep','shockwave','summon','ring_burst'],            interval:2.7 },
          { threshold:0.6, patterns:['sweep','sweep','spiral','ring_burst'],                interval:1.9 },
          { threshold:0.3, patterns:['sweep','shockwave','spiral','rush','ring_burst'],     interval:1.2 },
        ]},
    },
    18: {
      mid:   { id:'mid_boss',
        name:'대별왕의 마지막 저항',   nameEn:"Daebyelwang's Last Resistance",
        sub:'오염에 저항하는 창세신의 마지막 의지', subEn:'The final will of a creation god resisting total corruption',
        color:'#002030', hp:12200, dmg:103, spd:71,
        phases:[
          { threshold:1.0, patterns:['shockwave','spiral','summon','ring_burst'],           interval:2.5 },
          { threshold:0.5, patterns:['shockwave','shockwave','spiral','rush','ring_burst'], interval:1.7 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 대별왕',         nameEn:'Corrupted Daebyelwang',
        sub:'이승과 저승의 법칙을 붕괴시키는 오염된 창세신', subEn:'A corrupted creation god who collapses the boundary between life and death',
        color:'#001520', hp:28000, dmg:145, spd:68,
        phases:[
          { threshold:1.0, patterns:['shockwave','spiral','summon','ring_burst'],           interval:2.6 },
          { threshold:0.6, patterns:['shockwave','shockwave','summon','ring_burst'],        interval:1.8 },
          { threshold:0.3, patterns:['shockwave','spiral','summon','rush','ring_burst'],    interval:1.1 },
        ]},
    },
    19: {
      mid:   { id:'mid_boss',
        name:'태산대왕의 첫 번째 눈',  nameEn:"Taesan's First Eye",
        sub:'수명을 갉아먹는 태산의 감시자', subEn:'Taesan\'s watchful eye that gnaws away at lifespan',
        color:'#1a0020', hp:13500, dmg:110, spd:72,
        phases:[
          { threshold:1.0, patterns:['spiral','shockwave','summon','ring_burst'],           interval:2.4 },
          { threshold:0.5, patterns:['spiral','spiral','shockwave','rush','ring_burst'],    interval:1.6 },
        ]},
      final: { id:'chapter_boss',
        name:'잠식된 태산대왕',        nameEn:'Devoured Taesan',
        sub:'수명 자체를 무기로 사용하는 변이한 시왕', subEn:'A mutated underworld king who weaponizes lifespan itself',
        color:'#100015', hp:31000, dmg:155, spd:69,
        phases:[
          { threshold:1.0, patterns:['spiral','shockwave','summon','ring_burst'],           interval:2.6 },
          { threshold:0.6, patterns:['spiral','spiral','shockwave','ring_burst'],           interval:1.8 },
          { threshold:0.3, patterns:['spiral','shockwave','summon','rush','ring_burst'],    interval:1.1 },
        ]},
    },
    20: {
      mid:   { id:'mid_boss',
        name:'바리공주의 첫 번째 눈물', nameEn:"Bari's First Tear",
        sub:'구원자가 흘리는 오염된 슬픔', subEn:'The corrupted grief of a savior who lost her way',
        color:'#2a0030', hp:15000, dmg:118, spd:72,
        phases:[
          { threshold:1.0, patterns:['sweep','spiral','shockwave','ring_burst'],            interval:2.4 },
          { threshold:0.5, patterns:['sweep','spiral','spiral','shockwave','ring_burst'],   interval:1.6 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 바리공주',        nameEn:'Fallen Bari-gongju',
        sub:'생명수가 독으로 변한 저승의 구원자', subEn:'The savior of the underworld whose life water has turned to poison',
        color:'#180020', hp:35000, dmg:165, spd:70,
        phases:[
          { threshold:1.0, patterns:['sweep','spiral','summon','ring_burst'],               interval:2.5 },
          { threshold:0.6, patterns:['sweep','sweep','spiral','summon','ring_burst'],       interval:1.7 },
          { threshold:0.3, patterns:['rush','sweep','spiral','shockwave','summon','ring_burst'], interval:1.0 },
        ]},
    },

    // ── 시즌 3: 망랑계 ── [UPDATE 2026-07-14] 260713/260714_MTOPC.md + SEASON3_8_STAGES.md 기준 신규 등록.
    // 미들보스 이름은 SEASON3_8_STAGES.md(원본), 챕터보스 이름·HP/DMG·패턴은 260714_MTOPC.md 표 그대로.
    // [UPDATE 2026-07-15] 2단계: 신규 패턴 4종(teleport_strike/clone_split/confuse_field/glitch_barrage) boss.js 구현 완료 — 실제 패턴명으로 교체.
    21: {
      mid:   { id:'mid_boss',
        name:'도깨비 대장',         nameEn:'Dokkaebi Captain',
        sub:'혼돈의 입구를 지키는 첫 시험', subEn:'The first trial guarding the Gate of Chaos',
        color:'#c05820', hp:13500, dmg:202, spd:75,
        phases:[
          { threshold:1.0, patterns:['rush','glitch_barrage'],             interval:2.2 },
          { threshold:0.5, patterns:['rush','rush','glitch_barrage'],      interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'도깨비 왕',           nameEn:'Dokkaebi King',
        sub:'망랑계 혼돈을 다스리는 첫 번째 왕', subEn:'The first king to rule the chaos of the Chaos Realm',
        color:'#902810', hp:29250, dmg:294, spd:70,
        phases:[
          { threshold:1.0, patterns:['rush','sweep','summon'],              interval:2.3 },
          { threshold:0.6, patterns:['rush','rush','sweep','summon'],       interval:1.5 },
          { threshold:0.3, patterns:['rush','sweep','summon','glitch_barrage'], interval:0.9 },
        ]},
    },
    22: {
      mid:   { id:'mid_boss',
        name:'구미호 술사',         nameEn:'Fox Sorcerer',
        sub:'요술의 거리에서 홀림을 걸다', subEn:'Casts enchantment on the Street of Illusions',
        color:'#a04888', hp:15300, dmg:220, spd:68,
        phases:[
          { threshold:1.0, patterns:['spiral','confuse_field'],              interval:2.2 },
          { threshold:0.5, patterns:['spiral','confuse_field','spiral'],     interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'구미호 여왕',         nameEn:'Fox Queen',
        sub:'천 개의 가면 뒤에 숨은 여왕', subEn:'A queen hidden behind a thousand masks',
        color:'#c060a0', hp:33150, dmg:320, spd:72,
        phases:[
          { threshold:1.0, patterns:['spiral','teleport_strike','confuse_field'],             interval:2.3 },
          { threshold:0.6, patterns:['spiral','teleport_strike','confuse_field','spiral'],    interval:1.5 },
          { threshold:0.3, patterns:['spiral','teleport_strike','confuse_field','teleport_strike'], interval:0.9 },
        ]},
    },
    23: {
      mid:   { id:'mid_boss',
        name:'글리치 사냥꾼',       nameEn:'Glitch Hunter',
        sub:'픽셀이 무너지는 숲의 포식자', subEn:'A predator in the forest where pixels collapse',
        color:'#18b8c0', hp:17400, dmg:238, spd:85,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','glitch_barrage'],             interval:2.0 },
          { threshold:0.5, patterns:['teleport_strike','teleport_strike','glitch_barrage'], interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'글리치 정령',         nameEn:'Glitch Spirit',
        sub:'오류의 심연에서 태어난 핵', subEn:'A core born from the abyss of errors',
        color:'#20d8e0', hp:37700, dmg:346, spd:80,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','clone_split','glitch_barrage'],              interval:2.1 },
          { threshold:0.6, patterns:['teleport_strike','clone_split','glitch_barrage','teleport_strike'], interval:1.3 },
          { threshold:0.3, patterns:['teleport_strike','clone_split','glitch_barrage','glitch_barrage'], interval:0.8 },
        ]},
    },
    24: {
      mid:   { id:'mid_boss',
        name:'혼돈 경비대장',       nameEn:'Chaos Guard Captain',
        sub:'뒤틀린 시장의 문지기', subEn:'Gatekeeper of the Twisted Market',
        color:'#a07830', hp:19500, dmg:260, spd:65,
        phases:[
          { threshold:1.0, patterns:['sweep','confuse_field'],               interval:2.2 },
          { threshold:0.5, patterns:['sweep','sweep','confuse_field'],       interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'혼돈 상인',           nameEn:'Chaos Merchant',
        sub:'거래의 이름으로 모든 것을 삼키다', subEn:'Devours everything in the name of the deal',
        color:'#705020', hp:42250, dmg:378, spd:68,
        phases:[
          { threshold:1.0, patterns:['summon','sweep','teleport_strike'],               interval:2.3 },
          { threshold:0.6, patterns:['summon','sweep','sweep','teleport_strike'],       interval:1.5 },
          { threshold:0.3, patterns:['summon','sweep','teleport_strike','teleport_strike'], interval:0.9 },
        ]},
    },
    25: {
      mid:   { id:'mid_boss',
        name:'망랑 전위대장',       nameEn:'Chaos Vanguard',
        sub:'망랑계 심층으로 향하는 돌격대', subEn:'The vanguard charging into the Deep Chaos Realm',
        color:'#503080', hp:22200, dmg:282, spd:82,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave'],             interval:2.0 },
          { threshold:0.5, patterns:['rush','rush','shockwave'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'망랑 대군주',         nameEn:'Chaos Grand Lord',
        sub:'혼돈의 근원을 다스리는 대군주', subEn:'The grand lord ruling the origin of chaos',
        color:'#301858', hp:48100, dmg:410, spd:74,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','sweep'],              interval:2.1 },
          { threshold:0.6, patterns:['rush','rush','shockwave','sweep'],       interval:1.3 },
          { threshold:0.3, patterns:['rush','shockwave','sweep','summon'],     interval:0.8 },
        ]},
    },
    26: {
      mid:   { id:'mid_boss',
        name:'타락한 도깨비 무사',   nameEn:'Corrupted Dokkaebi Warrior',
        sub:'외신의 기운에 잠식된 무사', subEn:'A warrior consumed by the Outer God’s power',
        color:'#688020', hp:24900, dmg:308, spd:78,
        phases:[
          { threshold:1.0, patterns:['rush','glitch_barrage'],             interval:2.0 },
          { threshold:0.5, patterns:['rush','rush','glitch_barrage'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 도깨비신',     nameEn:'Corrupted Dokkaebi God',
        sub:'도깨비신의 마지막 변이', subEn:'The final mutation of the Dokkaebi God',
        color:'#405818', hp:53950, dmg:448, spd:76,
        phases:[
          { threshold:1.0, patterns:['rush','summon','glitch_barrage'],              interval:2.1 },
          { threshold:0.6, patterns:['rush','rush','summon','glitch_barrage'],       interval:1.3 },
          { threshold:0.3, patterns:['rush','summon','glitch_barrage','glitch_barrage'], interval:0.8 },
        ]},
    },
    27: {
      mid:   { id:'mid_boss',
        name:'홀린 술사',           nameEn:'Enchanted Sorcerer',
        sub:'요술에 홀린 세계의 마법진', subEn:'The magic circle of a world lost in illusion',
        color:'#602878', hp:27900, dmg:334, spd:66,
        phases:[
          { threshold:1.0, patterns:['spiral','clone_split'],              interval:2.2 },
          { threshold:0.5, patterns:['spiral','clone_split','spiral'],     interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 구미호 선녀',   nameEn:'Fallen Fox Fairy',
        sub:'선녀의 마지막 환상이 흩어지다', subEn:'The fairy’s last illusion scatters',
        color:'#e0d8f0', hp:60450, dmg:486, spd:78,
        phases:[
          { threshold:1.0, patterns:['spiral','clone_split','confuse_field'],              interval:2.1 },
          { threshold:0.6, patterns:['spiral','clone_split','confuse_field','spiral'],     interval:1.3 },
          { threshold:0.3, patterns:['spiral','clone_split','confuse_field','clone_split'], interval:0.8 },
        ]},
    },
    28: {
      mid:   { id:'mid_boss',
        name:'혼돈의 파편',         nameEn:'Chaos Fragment',
        sub:'혼돈신의 균열에서 떨어져나온 조각', subEn:'A shard fallen from a crack in the Chaos God',
        color:'#a02030', hp:31500, dmg:363, spd:70,
        phases:[
          { threshold:1.0, patterns:['shockwave','teleport_strike'],             interval:2.0 },
          { threshold:0.5, patterns:['shockwave','shockwave','teleport_strike'], interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 혼돈신',       nameEn:'Corrupted Chaos God',
        sub:'질서와 부딪혀 삼켜진 혼돈', subEn:'Chaos devoured after clashing with order',
        color:'#601028', hp:68250, dmg:528, spd:72,
        phases:[
          { threshold:1.0, patterns:['shockwave','spiral','teleport_strike'],              interval:2.1 },
          { threshold:0.6, patterns:['shockwave','shockwave','spiral','teleport_strike'], interval:1.3 },
          { threshold:0.3, patterns:['shockwave','spiral','teleport_strike','teleport_strike'], interval:0.8 },
        ]},
    },
    29: {
      mid:   { id:'mid_boss',
        name:'글리치 폭풍의 눈',     nameEn:'Eye of the Glitch Storm',
        sub:'폭풍의 중심에서 깜빡이는 오류', subEn:'An error flickering at the heart of the storm',
        color:'#18d0e8', hp:35400, dmg:396, spd:90,
        phases:[
          { threshold:1.0, patterns:['glitch_barrage','teleport_strike'],             interval:1.9 },
          { threshold:0.5, patterns:['glitch_barrage','teleport_strike','teleport_strike'], interval:1.1 },
        ]},
      final: { id:'chapter_boss',
        name:'잠식된 글리치 왕',     nameEn:'Corrupted Glitch King',
        sub:'현실을 삼킨 마지막 오류', subEn:'The final error that devoured reality',
        color:'#0888c8', hp:76700, dmg:576, spd:82,
        phases:[
          { threshold:1.0, patterns:['glitch_barrage','clone_split','teleport_strike'],              interval:2.0 },
          { threshold:0.6, patterns:['glitch_barrage','clone_split','teleport_strike','teleport_strike'], interval:1.2 },
          { threshold:0.3, patterns:['glitch_barrage','clone_split','teleport_strike','glitch_barrage'], interval:0.7 },
        ]},
    },
    30: {
      mid:   { id:'mid_boss',
        name:'망랑대왕의 분신',     nameEn:"Chaos King's Doppelganger",
        sub:'왕좌를 지키는 그림자 분신', subEn:'A shadow doppelganger guarding the throne',
        color:'#a05018', hp:39900, dmg:429, spd:80,
        phases:[
          { threshold:1.0, patterns:['rush','sweep','summon'],             interval:1.9 },
          { threshold:0.5, patterns:['rush','sweep','summon','summon'],    interval:1.1 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 망랑대왕',     nameEn:'Fallen Chaos King',
        sub:'외신의 그릇이 된 혼돈의 지배자', subEn:'The ruler of chaos, now a vessel of the Outer God',
        color:'#180808', hp:86450, dmg:624, spd:76,
        phases:[
          { threshold:1.0, patterns:['rush','sweep','summon'],                                    interval:2.0 },
          { threshold:0.5, patterns:['rush','sweep','summon','summon','clone_split'],              interval:1.2 },
          { threshold:0.25,patterns:['rush','sweep','summon','clone_split','confuse_field'],       interval:0.8 },
        ]},
    },

    // ── 시즌 4 (귀허계) ──
    // [UPDATE 2026-07-17] 260714_MTOPC.md 패턴표 기준. fade_strike->teleport_strike, memory_drain->confuse_field,
    // hollow_burst->shockwave(필요시 sweep) 매핑 — 시즌3와 동일하게 신규 패턴명 대신 기존 구현된 8종 패턴 재사용.
    31: {
      mid:   { id:'mid_boss',
        name:'소멸의 파수꾼',         nameEn:'Void Sentinel',
        sub:'소멸의 해안을 지키는 첫 시험',   subEn:'The first trial guarding the Shore of Annihilation',
        color:'#5878a0', hp:45090, dmg:485, spd:80,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['rush','rush','shockwave','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'소멸의 수호자',           nameEn:'Guardian of Annihilation',
        sub:'귀허계 첫 관문을 지키는 소멸의 화신', subEn:'The avatar of annihilation guarding the first gate of the Void Realm',
        color:'#3a5878', hp:97690, dmg:705, spd:76,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','sweep','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['rush','rush','shockwave','sweep','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['rush','shockwave','sweep','sweep','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    32: {
      mid:   { id:'mid_boss',
        name:'망각의 사자',         nameEn:'Oblivion Reaper',
        sub:'잊혀진 자들의 바다를 순찰하는 사자',   subEn:'A reaper patrolling the Sea of Forgotten Existences',
        color:'#4a5a7a', hp:50950, dmg:548, spd:74,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','confuse_field','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['teleport_strike','teleport_strike','confuse_field','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'망각의 군주',           nameEn:'Lord of Oblivion',
        sub:'존재의 이름마저 지우는 망각의 지배자', subEn:'The ruler of oblivion who erases even the names of the living',
        color:'#303850', hp:110390, dmg:797, spd:70,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','confuse_field','sweep','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['teleport_strike','teleport_strike','confuse_field','sweep','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['teleport_strike','confuse_field','sweep','sweep','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    33: {
      mid:   { id:'mid_boss',
        name:'환생의 수호자',         nameEn:'Rebirth Guardian',
        sub:'거듭남의 제단을 지키는 자',   subEn:'The guardian of the Altar of Rebirth',
        color:'#8878b0', hp:57570, dmg:619, spd:72,
        phases:[
          { threshold:1.0, patterns:['confuse_field','summon','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['confuse_field','confuse_field','summon','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'환생의 신',           nameEn:'God of Rebirth',
        sub:'소멸과 탄생의 경계를 다스리는 신', subEn:'The god who governs the boundary of death and birth',
        color:'#6858a0', hp:124740, dmg:901, spd:68,
        phases:[
          { threshold:1.0, patterns:['summon','shockwave','confuse_field','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['summon','summon','shockwave','confuse_field','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['summon','shockwave','confuse_field','confuse_field','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    34: {
      mid:   { id:'mid_boss',
        name:'허무의 파편',         nameEn:'Void Fragment',
        sub:'허무의 심연에서 떨어져 나온 파편',   subEn:'A fragment fallen from the Abyss of Nothingness',
        color:'#405070', hp:65060, dmg:699, spd:78,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','shockwave','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['teleport_strike','teleport_strike','shockwave','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'허무의 왕',           nameEn:'King of Nothingness',
        sub:'모든 것이 사라지는 곳을 다스리는 왕', subEn:'The king who rules where everything disappears',
        color:'#283050', hp:140950, dmg:1018, spd:74,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','shockwave','sweep','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['teleport_strike','teleport_strike','shockwave','sweep','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['teleport_strike','shockwave','sweep','sweep','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    35: {
      mid:   { id:'mid_boss',
        name:'소멸대왕의 전위대',         nameEn:'Annihilation King\'s Vanguard',
        sub:'귀허계 심층을 지키는 전위대',   subEn:'The vanguard guarding the Deep Void Realm',
        color:'#304860', hp:73510, dmg:790, spd:70,
        phases:[
          { threshold:1.0, patterns:['shockwave','rush','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['shockwave','shockwave','rush','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'소멸대왕',           nameEn:'Annihilation King',
        sub:'귀허계의 심장을 다스리는 소멸의 대왕', subEn:'The great king of annihilation who rules the heart of the Void Realm',
        color:'#182838', hp:159280, dmg:1150, spd:66,
        phases:[
          { threshold:1.0, patterns:['sweep','rush','shockwave','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['sweep','sweep','rush','shockwave','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['sweep','rush','shockwave','shockwave','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    36: {
      mid:   { id:'mid_boss',
        name:'타락한 소멸의 사자',         nameEn:'Corrupted Annihilation Reaper',
        sub:'외신의 기운에 물든 소멸의 사자',   subEn:'A reaper of annihilation tainted by the Outer God',
        color:'#607040', hp:83070, dmg:893, spd:82,
        phases:[
          { threshold:1.0, patterns:['rush','confuse_field','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['rush','rush','confuse_field','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 소멸신',           nameEn:'Corrupted Annihilation God',
        sub:'소멸신의 마지막 변이, 잠식된 귀허계의 정점', subEn:'The final mutation of the Annihilation God, apex of the Corrupted Void Realm',
        color:'#384818', hp:180980, dmg:1300, spd:78,
        phases:[
          { threshold:1.0, patterns:['rush','confuse_field','shockwave','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['rush','rush','confuse_field','shockwave','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['rush','confuse_field','shockwave','shockwave','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    37: {
      mid:   { id:'mid_boss',
        name:'오염된 환생의 수호자',         nameEn:'Corrupted Rebirth Guardian',
        sub:'거듭남의 저주에 잠식된 수호자',   subEn:'A guardian consumed by the curse of rebirth',
        color:'#906858', hp:93870, dmg:1009, spd:76,
        phases:[
          { threshold:1.0, patterns:['summon','teleport_strike','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['summon','summon','teleport_strike','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 환생신',           nameEn:'Corrupted Rebirth God',
        sub:'뒤틀린 거듭남의 고리를 다스리는 타락한 신', subEn:'The fallen god ruling the twisted cycle of rebirth',
        color:'#684838', hp:204510, dmg:1469, spd:72,
        phases:[
          { threshold:1.0, patterns:['summon','teleport_strike','confuse_field','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['summon','summon','teleport_strike','confuse_field','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['summon','teleport_strike','confuse_field','confuse_field','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    38: {
      mid:   { id:'mid_boss',
        name:'허무의 오염된 파편',         nameEn:'Corrupted Void Fragment',
        sub:'혼돈에 삼켜진 허무의 파편',   subEn:'A void fragment swallowed by chaos',
        color:'#282838', hp:106070, dmg:1140, spd:68,
        phases:[
          { threshold:1.0, patterns:['shockwave','teleport_strike','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['shockwave','shockwave','teleport_strike','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 허무신',           nameEn:'Corrupted Void God',
        sub:'혼돈의 허무를 다스리는 오염된 신', subEn:'The corrupted god who rules the chaotic void',
        color:'#181828', hp:231100, dmg:1660, spd:64,
        phases:[
          { threshold:1.0, patterns:['sweep','teleport_strike','shockwave','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['sweep','sweep','teleport_strike','shockwave','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['sweep','teleport_strike','shockwave','shockwave','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    39: {
      mid:   { id:'mid_boss',
        name:'귀허대왕의 오염된 눈',         nameEn:'Void King\'s Corrupted Eye',
        sub:'소멸의 경계를 감시하는 오염된 눈',   subEn:'A corrupted eye watching over the Edge of Annihilation',
        color:'#785860', hp:119860, dmg:1288, spd:74,
        phases:[
          { threshold:1.0, patterns:['confuse_field','sweep','ring_burst','homing_orbs'],             interval:2.0 },
          { threshold:0.5, patterns:['confuse_field','confuse_field','sweep','ring_burst','homing_orbs'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'잠식된 귀허대왕',           nameEn:'Devoured Void King',
        sub:'외신의 눈이 박힌 왕좌의 지배자', subEn:'The ruler of the throne embedded with the Outer God\'s eyes',
        color:'#503038', hp:261140, dmg:1876, spd:70,
        phases:[
          { threshold:1.0, patterns:['confuse_field','sweep','teleport_strike','ring_burst','homing_orbs'],              interval:2.1 },
          { threshold:0.6, patterns:['confuse_field','confuse_field','sweep','teleport_strike','ring_burst','homing_orbs'],       interval:1.3 },
          { threshold:0.3, patterns:['confuse_field','sweep','teleport_strike','teleport_strike','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },
    40: {
      mid:   { id:'mid_boss',
        name:'소멸의 여신의 첫 번째 눈물',         nameEn:'Annihilation Goddess\'s First Tear',
        sub:'귀허계의 왕좌 앞에 흐르는 첫 눈물',   subEn:'The first tear shed before the Throne of the Void Realm',
        color:'#a04858', hp:135400, dmg:1455, spd:80,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','shockwave','summon','ring_burst','homing_orbs'],             interval:1.9 },
          { threshold:0.5, patterns:['teleport_strike','shockwave','summon','teleport_strike','ring_burst','homing_orbs'],      interval:1.1 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 소멸의 여신',           nameEn:'Fallen Annihilation Goddess',
        sub:'외신의 그릇이 된 귀허계 최후의 지배자', subEn:'The final ruler of the Void Realm, now a vessel of the Outer God',
        color:'#601828', hp:294990, dmg:2120, spd:76,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','confuse_field','shockwave','ring_burst','homing_orbs'],                                    interval:2.0 },
          { threshold:0.5, patterns:['teleport_strike','confuse_field','shockwave','summon','ring_burst','homing_orbs'],              interval:1.2 },
          { threshold:0.25,patterns:['teleport_strike','confuse_field','shockwave','summon','sweep','ring_burst','homing_orbs'],       interval:0.8 },
        ]},
    },

    // ── 시즌 5 (선계) ──
    // [UPDATE 2026-07-22] SEASON3_8_STAGES.md 챕터41~50 보스 라인업 기준 신규 등록.
    // hp/dmg는 시즌4 챕터31~40의 챕터당 배율(정확히 ×1.13, 미들/최종 공통)을 그대로 이어붙여 계산.
    // attackPattern은 시즌3/4와 동일하게 기존 구현된 8종 패턴으로 매핑.
    41: {
      mid:   { id:'mid_boss',
        name:'선계 문지기',           nameEn:'Celestial Gatekeeper',
        sub:'선계의 관문을 지키는 첫 시험', subEn:'The first trial guarding the Gate of the Celestial Realm',
        color:'#a8c8d8', hp:153000, dmg:1644, spd:80,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','ring_burst','homing_orbs','line_barrage','chain_lightning'],             interval:2.0 },
          { threshold:0.5, patterns:['rush','rush','shockwave','ring_burst','homing_orbs','line_barrage','chain_lightning'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'선계의 수호신',           nameEn:'Guardian God of the Celestial Realm',
        sub:'선계 첫 관문을 지키는 빛의 화신', subEn:'The avatar of light guarding the first gate of the Celestial Realm',
        color:'#7898c0', hp:333340, dmg:2396, spd:76,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','sweep','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.1 },
          { threshold:0.6, patterns:['rush','rush','shockwave','sweep','ring_burst','homing_orbs','line_barrage','chain_lightning'],       interval:1.3 },
          { threshold:0.3, patterns:['rush','shockwave','sweep','summon','ring_burst','homing_orbs','line_barrage','chain_lightning'],     interval:0.8 },
        ]},
    },
    42: {
      mid:   { id:'mid_boss',
        name:'신선 원로',             nameEn:'Immortal Elder',
        sub:'신선들의 정원을 지키는 노현자', subEn:'The wise elder guarding the Garden of Immortals',
        color:'#a09060', hp:172890, dmg:1858, spd:60,
        phases:[
          { threshold:1.0, patterns:['sweep','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'],               interval:2.2 },
          { threshold:0.5, patterns:['sweep','sweep','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'],       interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'신선 대장로',           nameEn:'Grand Elder of the Immortals',
        sub:'불로초의 정원을 다스리는 대장로', subEn:'The grand elder who rules the Garden of Eternal Herbs',
        color:'#c8a868', hp:376670, dmg:2707, spd:62,
        phases:[
          { threshold:1.0, patterns:['sweep','confuse_field','summon','ring_burst','homing_orbs','line_barrage','chain_lightning'],               interval:2.3 },
          { threshold:0.6, patterns:['sweep','sweep','confuse_field','summon','ring_burst','homing_orbs','line_barrage','chain_lightning'],       interval:1.5 },
          { threshold:0.3, patterns:['sweep','confuse_field','summon','summon','ring_burst','homing_orbs','line_barrage','chain_lightning'],      interval:0.9 },
        ]},
    },
    43: {
      mid:   { id:'mid_boss',
        name:'도술 대사제',           nameEn:'High Priest of Celestial Arts',
        sub:'도술의 전당을 지키는 사제', subEn:'The priest guarding the Hall of Celestial Arts',
        color:'#6858a0', hp:195370, dmg:2100, spd:70,
        phases:[
          { threshold:1.0, patterns:['spiral','teleport_strike','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.0 },
          { threshold:0.5, patterns:['spiral','teleport_strike','spiral','ring_burst','homing_orbs','line_barrage','chain_lightning'],     interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'도술의 신',             nameEn:'God of Celestial Arts',
        sub:'선술의 근원을 다스리는 신', subEn:'The god who governs the source of celestial skill',
        color:'#8868c8', hp:425640, dmg:3059, spd:72,
        phases:[
          { threshold:1.0, patterns:['spiral','teleport_strike','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'],             interval:2.1 },
          { threshold:0.6, patterns:['spiral','teleport_strike','confuse_field','spiral','ring_burst','homing_orbs','line_barrage','chain_lightning'],    interval:1.3 },
          { threshold:0.3, patterns:['spiral','teleport_strike','confuse_field','teleport_strike','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:0.8 },
        ]},
    },
    44: {
      mid:   { id:'mid_boss',
        name:'깨달음의 수호자',       nameEn:'Guardian of Enlightenment',
        sub:'진리의 문 앞을 지키는 수호자', subEn:'The guardian standing before the Gate of Truth',
        color:'#d0c090', hp:220770, dmg:2373, spd:56,
        phases:[
          { threshold:1.0, patterns:['shockwave','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'],             interval:2.2 },
          { threshold:0.5, patterns:['shockwave','shockwave','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'깨달음의 신',           nameEn:'God of Enlightenment',
        sub:'깨달음의 정상에 좌정한 신', subEn:'The god seated at the summit of enlightenment',
        color:'#e0d0a0', hp:480970, dmg:3457, spd:58,
        phases:[
          { threshold:1.0, patterns:['shockwave','confuse_field','spiral','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.3 },
          { threshold:0.6, patterns:['shockwave','shockwave','confuse_field','spiral','ring_burst','homing_orbs','line_barrage','chain_lightning'],  interval:1.5 },
          { threshold:0.3, patterns:['shockwave','confuse_field','spiral','spiral','ring_burst','homing_orbs','line_barrage','chain_lightning'],     interval:0.9 },
        ]},
    },
    45: {
      mid:   { id:'mid_boss',
        name:'선계대왕의 전위대',     nameEn:"Celestial King's Vanguard",
        sub:'선계 심층을 지키는 전위대', subEn:'The vanguard guarding the Celestial Depths',
        color:'#6890c0', hp:249470, dmg:2681, spd:74,
        phases:[
          { threshold:1.0, patterns:['rush','sweep','ring_burst','homing_orbs','line_barrage','chain_lightning'],             interval:2.0 },
          { threshold:0.5, patterns:['rush','rush','sweep','ring_burst','homing_orbs','line_barrage','chain_lightning'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'선계대왕',             nameEn:'Celestial King',
        sub:'선계 심층 왕좌에 앉은 대왕', subEn:'The great king seated on the throne of the Celestial Depths',
        color:'#4868a0', hp:543500, dmg:3906, spd:70,
        phases:[
          { threshold:1.0, patterns:['rush','sweep','summon','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.1 },
          { threshold:0.6, patterns:['rush','rush','sweep','summon','ring_burst','homing_orbs','line_barrage','chain_lightning'],       interval:1.3 },
          { threshold:0.3, patterns:['rush','sweep','summon','summon','ring_burst','homing_orbs','line_barrage','chain_lightning'],     interval:0.8 },
        ]},
    },
    46: {
      mid:   { id:'mid_boss',
        name:'타락한 선계 수호자',     nameEn:'Corrupted Celestial Guardian',
        sub:'외신의 기운에 잠식된 수호자', subEn:'The guardian consumed by the Outer God’s power',
        color:'#605078', hp:281900, dmg:3030, spd:66,
        phases:[
          { threshold:1.0, patterns:['rush','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'],             interval:2.0 },
          { threshold:0.5, patterns:['rush','rush','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'],      interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 선신',           nameEn:'Corrupted Celestial God',
        sub:'빛을 잃고 잠식된 선계의 신', subEn:'The celestial god consumed and stripped of its light',
        color:'#806890', hp:614160, dmg:4414, spd:68,
        phases:[
          { threshold:1.0, patterns:['rush','summon','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.1 },
          { threshold:0.6, patterns:['rush','rush','summon','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'],       interval:1.3 },
          { threshold:0.3, patterns:['rush','summon','glitch_barrage','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:0.8 },
        ]},
    },
    47: {
      mid:   { id:'mid_boss',
        name:'오염된 도술 대사제',     nameEn:'Corrupted High Priest',
        sub:'뒤틀린 도술에 잠식된 사제', subEn:'The priest consumed by twisted celestial arts',
        color:'#904838', hp:318550, dmg:3424, spd:72,
        phases:[
          { threshold:1.0, patterns:['spiral','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.0 },
          { threshold:0.5, patterns:['spiral','spiral','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'],     interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 도술신',         nameEn:'Corrupted Art God',
        sub:'선술이 저주로 뒤바뀐 신', subEn:'The god whose celestial skill has turned to curse',
        color:'#b04840', hp:694000, dmg:4988, spd:74,
        phases:[
          { threshold:1.0, patterns:['spiral','glitch_barrage','teleport_strike','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.1 },
          { threshold:0.6, patterns:['spiral','spiral','glitch_barrage','teleport_strike','ring_burst','homing_orbs','line_barrage','chain_lightning'],     interval:1.3 },
          { threshold:0.3, patterns:['spiral','glitch_barrage','teleport_strike','teleport_strike','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:0.8 },
        ]},
    },
    48: {
      mid:   { id:'mid_boss',
        name:'깨달음의 오염된 파편',   nameEn:'Corrupted Enlightenment Fragment',
        sub:'진리가 뒤틀려 남은 파편', subEn:'A fragment left behind as truth grew twisted',
        color:'#705838', hp:359960, dmg:3869, spd:58,
        phases:[
          { threshold:1.0, patterns:['shockwave','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'],             interval:2.2 },
          { threshold:0.5, patterns:['shockwave','shockwave','glitch_barrage','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 깨달음의 신',     nameEn:'Corrupted God of Enlightenment',
        sub:'진리를 잃고 오염된 깨달음의 신', subEn:'The god of enlightenment, corrupted and stripped of truth',
        color:'#584030', hp:784220, dmg:5636, spd:60,
        phases:[
          { threshold:1.0, patterns:['shockwave','glitch_barrage','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.3 },
          { threshold:0.6, patterns:['shockwave','shockwave','glitch_barrage','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'],  interval:1.5 },
          { threshold:0.3, patterns:['shockwave','glitch_barrage','confuse_field','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:0.9 },
        ]},
    },
    49: {
      mid:   { id:'mid_boss',
        name:'선계대왕의 오염된 눈',   nameEn:"Celestial King's Corrupted Eye",
        sub:'선계대왕의 몸에서 떨어져나온 눈', subEn:"A corrupted eye torn from the Celestial King's own body",
        color:'#684078', hp:406750, dmg:4372, spd:76,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'],             interval:2.0 },
          { threshold:0.5, patterns:['teleport_strike','teleport_strike','confuse_field','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'잠식된 선계대왕',       nameEn:'Devoured Celestial King',
        sub:'외신의 그릇이 된 선계의 대왕', subEn:'The Celestial King, now a vessel of the Outer God',
        color:'#483858', hp:886170, dmg:6369, spd:72,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','confuse_field','rush','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:2.1 },
          { threshold:0.6, patterns:['teleport_strike','confuse_field','rush','rush','ring_burst','homing_orbs','line_barrage','chain_lightning'],       interval:1.3 },
          { threshold:0.3, patterns:['teleport_strike','confuse_field','rush','clone_split','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:0.8 },
        ]},
    },
    50: {
      mid:   { id:'mid_boss',
        name:'천존의 첫 번째 눈물',   nameEn:"Heavenly Lord's First Tear",
        sub:'타락하기 전 마지막으로 흘린 눈물', subEn:'The last tear shed before the fall',
        color:'#5878a0', hp:459630, dmg:4940, spd:64,
        phases:[
          { threshold:1.0, patterns:['confuse_field','shockwave','ring_burst','homing_orbs','line_barrage','chain_lightning'],             interval:2.2 },
          { threshold:0.5, patterns:['confuse_field','confuse_field','shockwave','ring_burst','homing_orbs','line_barrage','chain_lightning'], interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 천존',           nameEn:'Fallen Heavenly Lord',
        sub:'외신의 그릇이 된 선계 최후의 지배자', subEn:'The final ruler of the Celestial Realm, now a vessel of the Outer God',
        color:'#402838', hp:1001370, dmg:7197, spd:70,
        phases:[
          { threshold:1.0, patterns:['confuse_field','shockwave','clone_split','ring_burst','homing_orbs','line_barrage','chain_lightning'],                                    interval:2.0 },
          { threshold:0.5, patterns:['confuse_field','shockwave','clone_split','summon','ring_burst','homing_orbs','line_barrage','chain_lightning'],              interval:1.2 },
          { threshold:0.25,patterns:['confuse_field','shockwave','clone_split','summon','teleport_strike','ring_burst','homing_orbs','line_barrage','chain_lightning'],       interval:0.8 },
        ]},
    },

    // ═══════════════════════════════════════════════════
    //  시즌 6 (원계) 보스 10쌍 — 챕터 51~60
    //  [UPDATE 2026-07-24] SEASON3_8_STAGES.md 기준. hp/dmg는 게임 전체에서 일관되게 관측되는
    //  챕터당 ×1.13 기하급수(시즌 경계 없이 연속)를 그대로 이어 붙임. mid=final×0.459, mid_dmg=final_dmg×0.686
    //  (시즌4/5 경계에서 실측된 비율 그대로 유지).
    // ── 시즌6: 원계 ──
    51: {
      mid:   { id:'mid_boss',
        name:'법칙의 파수꾼',           nameEn:'Sentinel of the Laws',
        sub:'원계 첫 관문을 지키는 감시자', subEn:'The watcher guarding the first gate of the Primal Realm',
        color:'#8898c8', hp:519500, dmg:5580, spd:82,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave'],                    interval:2.0 },
          { threshold:0.5, patterns:['rush','rush','shockwave','spiral'],    interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'법칙의 수호자',           nameEn:'Guardian of Laws',
        sub:'원계의 근원 법칙을 지키는 최초의 화신', subEn:'The first avatar guarding the Primal Realm\'s foundational laws',
        color:'#a8c0e0', hp:1131500, dmg:8130, spd:78,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','sweep'],                       interval:2.0 },
          { threshold:0.5, patterns:['rush','shockwave','sweep','summon'],              interval:1.2 },
          { threshold:0.25,patterns:['rush','shockwave','sweep','summon','spiral'],     interval:0.8 },
        ]},
    },
    52: {
      mid:   { id:'mid_boss',
        name:'핵력의 수호자',           nameEn:'Guardian of Nuclear Force',
        sub:'핵력의 결속을 지키는 파수병', subEn:'The sentinel guarding the bond of nuclear force',
        color:'#8040c0', hp:587200, dmg:6300, spd:70,
        phases:[
          { threshold:1.0, patterns:['shockwave','sweep'],                   interval:1.9 },
          { threshold:0.5, patterns:['shockwave','shockwave','sweep','rush'],interval:1.1 },
        ]},
      final: { id:'chapter_boss',
        name:'전자기력의 신',           nameEn:'God of Electromagnetic Force',
        sub:'물리 법칙의 전당을 다스리는 신격', subEn:'The deity ruling the Hall of Physical Laws',
        color:'#40c0e0', hp:1278600, dmg:9190, spd:76,
        phases:[
          { threshold:1.0, patterns:['shockwave','sweep','rush'],                       interval:1.9 },
          { threshold:0.5, patterns:['shockwave','sweep','rush','summon'],              interval:1.1 },
          { threshold:0.25,patterns:['shockwave','sweep','rush','summon','spiral'],     interval:0.7 },
        ]},
    },
    53: {
      mid:   { id:'mid_boss',
        name:'파괴신의 사자',           nameEn:"Destruction God's Reaper",
        sub:'파괴신을 대리하는 인과의 사자', subEn:'The reaper who acts on the Destruction God\'s behalf',
        color:'#a02030', hp:663400, dmg:7120, spd:74,
        phases:[
          { threshold:1.0, patterns:['rush','spiral'],                      interval:1.8 },
          { threshold:0.5, patterns:['rush','rush','spiral','shockwave'],   interval:1.0 },
        ]},
      final: { id:'chapter_boss',
        name:'인과신',                  nameEn:'God of Causality',
        sub:'원인과 결과를 지배하는 신적 법칙의 정점', subEn:'The god who governs cause and effect, apex of divine law',
        color:'#c0a040', hp:1444900, dmg:10385, spd:80,
        phases:[
          { threshold:1.0, patterns:['rush','spiral','shockwave'],                      interval:1.8 },
          { threshold:0.5, patterns:['rush','spiral','shockwave','summon'],             interval:1.0 },
          { threshold:0.25,patterns:['rush','spiral','shockwave','summon','sweep'],     interval:0.7 },
        ]},
    },
    54: {
      mid:   { id:'mid_boss',
        name:'경외의 수호자',           nameEn:'Guardian of Reverence',
        sub:'관계 법칙의 미궁을 지키는 파수병', subEn:'The sentinel guarding the Labyrinth of Relational Laws',
        color:'#608040', hp:749600, dmg:8050, spd:68,
        phases:[
          { threshold:1.0, patterns:['sweep','summon'],                     interval:1.9 },
          { threshold:0.5, patterns:['sweep','summon','summon','rush'],     interval:1.1 },
        ]},
      final: { id:'chapter_boss',
        name:'관계의 신',               nameEn:'God of Relations',
        sub:'사랑과 질투, 경외를 다스리는 신격', subEn:'The deity ruling love, jealousy, and reverence',
        color:'#d070a0', hp:1632700, dmg:11735, spd:74,
        phases:[
          { threshold:1.0, patterns:['sweep','summon','rush'],                          interval:1.9 },
          { threshold:0.5, patterns:['sweep','summon','rush','confuse_field'],          interval:1.1 },
          { threshold:0.25,patterns:['sweep','summon','rush','confuse_field','spiral'], interval:0.7 },
        ]},
    },
    55: {
      mid:   { id:'mid_boss',
        name:'원계대왕의 전위대',       nameEn:"Primal King's Vanguard",
        sub:'원계 심층을 지키는 왕의 선봉', subEn:'The vanguard guarding the depths of the Primal Realm',
        color:'#4030a0', hp:847100, dmg:9100, spd:86,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','sweep'],           interval:1.8 },
          { threshold:0.5, patterns:['rush','rush','shockwave','sweep'],    interval:1.0 },
        ]},
      final: { id:'chapter_boss',
        name:'원계대왕',                nameEn:'Primal King',
        sub:'원계 그 자체를 다스리는 지배자', subEn:'The sovereign who rules the Primal Realm itself',
        color:'#308878', hp:1845000, dmg:13260, spd:80,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','sweep','summon'],                interval:1.8 },
          { threshold:0.5, patterns:['rush','shockwave','sweep','summon','spiral'],       interval:1.0 },
          { threshold:0.25,patterns:['rush','shockwave','sweep','summon','spiral','confuse_field'], interval:0.6 },
        ]},
    },
    56: {
      mid:   { id:'mid_boss',
        name:'타락한 법칙의 수호자',     nameEn:'Corrupted Law Guardian',
        sub:'외신에게 잠식당한 법칙의 수호자', subEn:'The law guardian devoured by the Outer God',
        color:'#301850', hp:957300, dmg:10280, spd:72,
        phases:[
          { threshold:1.0, patterns:['confuse_field','shockwave'],                       interval:1.8 },
          { threshold:0.5, patterns:['confuse_field','confuse_field','shockwave','rush'],interval:1.0 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 법칙신',           nameEn:'Corrupted Law God',
        sub:'외신의 기운에 잠식된 원계의 법칙신', subEn:'The Primal Realm\'s law god, devoured by the Outer God\'s influence',
        color:'#a03878', hp:2084800, dmg:14985, spd:78,
        phases:[
          { threshold:1.0, patterns:['confuse_field','shockwave','rush'],                          interval:1.7 },
          { threshold:0.5, patterns:['confuse_field','shockwave','rush','summon'],                 interval:1.0 },
          { threshold:0.25,patterns:['confuse_field','shockwave','rush','summon','clone_split'],   interval:0.6 },
        ]},
    },
    57: {
      mid:   { id:'mid_boss',
        name:'오염된 인과의 사자',       nameEn:'Corrupted Causality Reaper',
        sub:'뒤틀린 인과를 대리하는 오염된 사자', subEn:'The reaper of twisted causality, now corrupted',
        color:'#584868', hp:1081300, dmg:11615, spd:90,
        phases:[
          { threshold:1.0, patterns:['spiral','rush'],                     interval:1.7 },
          { threshold:0.5, patterns:['spiral','spiral','rush','teleport_strike'], interval:0.9 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 인과신',           nameEn:'Corrupted God of Causality',
        sub:'원인과 결과가 뒤집힌 인과신의 타락체', subEn:'The fallen causality god whose cause and effect are inverted',
        color:'#7828a0', hp:2355600, dmg:16930, spd:82,
        phases:[
          { threshold:1.0, patterns:['spiral','rush','teleport_strike'],                          interval:1.7 },
          { threshold:0.5, patterns:['spiral','rush','teleport_strike','summon'],                 interval:0.9 },
          { threshold:0.25,patterns:['spiral','rush','teleport_strike','summon','confuse_field'], interval:0.6 },
        ]},
    },
    58: {
      mid:   { id:'mid_boss',
        name:'창조신의 오염된 파편',     nameEn:'Corrupted Creation Fragment',
        sub:'멈춰버린 창조가 남긴 파편', subEn:'A fragment left behind by creation come to a halt',
        color:'#c0b0a0', hp:1222400, dmg:13125, spd:66,
        phases:[
          { threshold:1.0, patterns:['shockwave','sweep'],                  interval:1.7 },
          { threshold:0.5, patterns:['shockwave','sweep','sweep','summon'], interval:0.9 },
        ]},
      final: { id:'chapter_boss',
        name:'오염된 창조신',           nameEn:'Corrupted God of Creation',
        sub:'파괴가 창조를 집어삼킨 결과', subEn:'The result of destruction consuming creation entirely',
        color:'#a06840', hp:2661900, dmg:19135, spd:72,
        phases:[
          { threshold:1.0, patterns:['shockwave','sweep','summon'],                       interval:1.6 },
          { threshold:0.5, patterns:['shockwave','sweep','summon','clone_split'],         interval:0.9 },
          { threshold:0.25,patterns:['shockwave','sweep','summon','clone_split','rush'],  interval:0.6 },
        ]},
    },
    59: {
      mid:   { id:'mid_boss',
        name:'원계대왕의 오염된 눈',     nameEn:"Primal King's Corrupted Eye",
        sub:'외신의 기운이 박힌 왕의 눈', subEn:'The king\'s eye, embedded with the Outer God\'s influence',
        color:'#401870', hp:1381600, dmg:14830, spd:84,
        phases:[
          { threshold:1.0, patterns:['confuse_field','spiral'],                        interval:1.6 },
          { threshold:0.5, patterns:['confuse_field','spiral','spiral','teleport_strike'], interval:0.8 },
        ]},
      final: { id:'chapter_boss',
        name:'잠식된 원계대왕',         nameEn:'Devoured Primal King',
        sub:'외신에게 완전히 잠식된 원계의 마지막 지배자', subEn:'The Primal Realm\'s last ruler, fully devoured by the Outer God',
        color:'#8898a8', hp:3007900, dmg:21620, spd:78,
        phases:[
          { threshold:1.0, patterns:['confuse_field','spiral','teleport_strike'],                          interval:1.6 },
          { threshold:0.5, patterns:['confuse_field','spiral','teleport_strike','summon'],                 interval:0.9 },
          { threshold:0.25,patterns:['confuse_field','spiral','teleport_strike','summon','clone_split'],   interval:0.6 },
        ]},
    },
    60: {
      mid:   { id:'mid_boss',
        name:'중력신의 첫 번째 눈물',   nameEn:"Gravity God's First Tear",
        sub:'타락하기 전 마지막으로 흘린 눈물', subEn:'The last tear shed before the fall',
        color:'#701828', hp:1561200, dmg:16760, spd:66,
        phases:[
          { threshold:1.0, patterns:['shockwave','rush'],                          interval:1.6 },
          { threshold:0.5, patterns:['shockwave','shockwave','rush','sweep'],      interval:0.8 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 중력신',           nameEn:'Fallen Gravity God',
        sub:'외신의 그릇이 된 원계 최후의 지배자', subEn:'The final ruler of the Primal Realm, now a vessel of the Outer God',
        color:'#201018', hp:3398900, dmg:24430, spd:72,
        phases:[
          { threshold:1.0, patterns:['shockwave','rush','clone_split'],                                     interval:1.6 },
          { threshold:0.5, patterns:['shockwave','rush','clone_split','summon'],                            interval:0.9 },
          { threshold:0.25,patterns:['shockwave','rush','clone_split','summon','teleport_strike'],          interval:0.6 },
        ]},
    },

    // ═══════════════════════════════════════════════════
    //  시즌 7 (어계) 보스 10쌍 — 챕터 61~70
    //  [UPDATE 2026-07-28] SEASON3_8_STAGES.md 기준. 사용자 확정 설계: 챕터60 값에 ×1.13(스무스커브 상
    //  챕터61 값) × 100을 챕터61 기준으로, 이후 챕터62~70은 다시 챕터당 ×1.13(계산: eogye_calc.py).
    //  mid=final×0.459, mid_dmg=final_dmg×0.686 비율은 시즌4~6과 동일하게 유지.
    //  5대 신격(나각/무형/만목/■■■/태모) 순환 — SEASON3_8_STAGES.md "어계 5대 신격" 참고.
    // ═══════════════════════════════════════════════════
    61: {
      mid:   { id:'mid_boss',
        name:'꿈의 파수꾼',           nameEn:'Dream Sentinel',
        sub:'잠든 나각의 꿈 언저리를 지키는 파수꾼', subEn:'The sentinel guarding the edges of the sleeping Nagak\'s dream',
        color:'#7888b0', hp:176000000, dmg:1890000, spd:74,
        phases:[
          { threshold:1.0, patterns:['rush','confuse_field'],                          interval:2.2 },
          { threshold:0.5, patterns:['rush','confuse_field','confuse_field','teleport_strike'], interval:1.4 },
        ]},
      final: { id:'chapter_boss',
        name:'문지기 나각의 꿈',       nameEn:"Nagak's Dream Gatekeeper",
        sub:'인식의 균열 너머, 잠든 신의 꿈이 빚어낸 문지기', subEn:'A gatekeeper woven from the sleeping god\'s dream, beyond the crack in perception',
        color:'#3d4570', hp:384000000, dmg:2760000, spd:80,
        phases:[
          { threshold:1.0, patterns:['rush','confuse_field','shockwave'],                                   interval:2.0 },
          { threshold:0.5, patterns:['rush','confuse_field','shockwave','teleport_strike'],                 interval:1.2 },
          { threshold:0.25,patterns:['rush','confuse_field','shockwave','teleport_strike','summon'],        interval:0.8 },
        ]},
    },
    62: {
      mid:   { id:'mid_boss',
        name:'무형의 촉수',           nameEn:'The Formless Appendage',
        sub:'형태 없는 바다 밑에서 뻗어나온 촉수', subEn:'An appendage reaching up from beneath the formless sea',
        color:'#204858', hp:199000000, dmg:2140000, spd:60,
        phases:[
          { threshold:1.0, patterns:['spiral','sweep'],                                interval:2.1 },
          { threshold:0.5, patterns:['spiral','sweep','sweep','confuse_field'],        interval:1.3 },
        ]},
      final: { id:'chapter_boss',
        name:'무형의 현현',           nameEn:'Manifestation of the Formless',
        sub:'인식하는 순간 무너지는, 형태 없는 것의 현현', subEn:'The formless made manifest — to perceive it is to collapse',
        color:'#0c1c28', hp:434000000, dmg:3120000, spd:64,
        phases:[
          { threshold:1.0, patterns:['spiral','sweep','shockwave'],                                         interval:1.9 },
          { threshold:0.5, patterns:['spiral','sweep','shockwave','clone_split'],                           interval:1.1 },
          { threshold:0.25,patterns:['spiral','sweep','shockwave','clone_split','confuse_field'],           interval:0.7 },
        ]},
    },
    63: {
      mid:   { id:'mid_boss',
        name:'만목의 눈동자',         nameEn:"Manmok's Pupil",
        sub:'천개의 눈 중 하나, 그러나 그 무게는 전부와 같다', subEn:'One of a thousand eyes — yet its weight equals them all',
        color:'#8850a0', hp:225000000, dmg:2420000, spd:70,
        phases:[
          { threshold:1.0, patterns:['homing_orbs','ring_burst'],                      interval:2.0 },
          { threshold:0.5, patterns:['homing_orbs','ring_burst','ring_burst','confuse_field'], interval:1.2 },
        ]},
      final: { id:'chapter_boss',
        name:'만목(萬目)',            nameEn:'Manmok, the Ten Thousand Eyes',
        sub:'모든 것을 보지만 아무것도 이해하지 못하는 신격', subEn:'A god that sees everything and understands nothing',
        color:'#601878', hp:490000000, dmg:3520000, spd:66,
        phases:[
          { threshold:1.0, patterns:['homing_orbs','ring_burst','line_barrage'],                            interval:1.8 },
          { threshold:0.5, patterns:['homing_orbs','ring_burst','line_barrage','clone_split'],               interval:1.0 },
          { threshold:0.25,patterns:['homing_orbs','ring_burst','line_barrage','clone_split','confuse_field'], interval:0.65 },
        ]},
    },
    64: {
      mid:   { id:'mid_boss',
        name:'■■■ 의 파편',          nameEn:'Fragment of ???',
        sub:'이름조차 발음할 수 없는 것의 조각', subEn:'A shard of something whose name cannot even be spoken',
        color:'#301830', hp:255000000, dmg:2730000, spd:68,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','confuse_field'],               interval:1.9 },
          { threshold:0.5, patterns:['teleport_strike','confuse_field','confuse_field','shockwave'], interval:1.1 },
        ]},
      final: { id:'chapter_boss',
        name:'■■■ 의 현신',          nameEn:'Manifestation of ???',
        sub:'금기의 이름이 현실에 새겨진 순간', subEn:'The moment the forbidden name is carved into reality',
        color:'#180818', hp:554000000, dmg:3980000, spd:72,
        phases:[
          { threshold:1.0, patterns:['teleport_strike','confuse_field','shockwave'],                        interval:1.7 },
          { threshold:0.5, patterns:['teleport_strike','confuse_field','shockwave','summon'],               interval:0.95 },
          { threshold:0.25,patterns:['teleport_strike','confuse_field','shockwave','summon','clone_split'], interval:0.6 },
        ]},
    },
    65: {
      mid:   { id:'mid_boss',
        name:'나각의 전위',           nameEn:'Vanguard of Nagak',
        sub:'잠든 신을 대신해 어계 심층을 지키는 선봉', subEn:'A vanguard guarding the Outer Realm\'s depths in the sleeping god\'s stead',
        color:'#701818', hp:288000000, dmg:3090000, spd:84,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave'],                              interval:1.8 },
          { threshold:0.5, patterns:['rush','rush','shockwave','sweep'],               interval:1.0 },
        ]},
      final: { id:'chapter_boss',
        name:'나각의 사도',           nameEn:'Apostle of Nagak',
        sub:'잠든 신을 섬기며 그 꿈을 대신 실현하는 자', subEn:'One who serves the sleeping god and enacts its dream in its stead',
        color:'#380808', hp:626000000, dmg:4500000, spd:78,
        phases:[
          { threshold:1.0, patterns:['rush','shockwave','summon'],                                          interval:1.6 },
          { threshold:0.5, patterns:['rush','shockwave','summon','clone_split'],                            interval:0.9 },
          { threshold:0.25,patterns:['rush','shockwave','summon','clone_split','teleport_strike'],          interval:0.55 },
        ]},
    },
    66: {
      mid:   { id:'mid_boss',
        name:'외신 강림의 전조',       nameEn:"Omen of the Outer God's Descent",
        sub:'애기씨의 오염도가 임계에 달했음을 알리는 전조', subEn:'A sign that Aegissi\'s corruption has reached its critical point',
        color:'#605090', hp:325000000, dmg:3490000, spd:76,
        phases:[
          { threshold:1.0, patterns:['chain_lightning','ring_burst'],                  interval:1.7 },
          { threshold:0.5, patterns:['chain_lightning','ring_burst','ring_burst','confuse_field'], interval:0.95 },
        ]},
      final: { id:'chapter_boss',
        name:'외신 강림체',           nameEn:'Outer God Incarnate',
        sub:'외신화가 절정에 달해 형체를 갖춘 강림체', subEn:'A form given to the Outer God transformation at its peak',
        color:'#382058', hp:708000000, dmg:5090000, spd:82,
        phases:[
          { threshold:1.0, patterns:['chain_lightning','ring_burst','clone_split'],                         interval:1.5 },
          { threshold:0.5, patterns:['chain_lightning','ring_burst','clone_split','summon'],                interval:0.85 },
          { threshold:0.25,patterns:['chain_lightning','ring_burst','clone_split','summon','teleport_strike'], interval:0.5 },
        ]},
    },
    67: {
      mid:   { id:'mid_boss',
        name:'만목의 오염된 눈동자',   nameEn:"Manmok's Corrupted Pupil",
        sub:'광기의 조류에 잠식되어 이지를 잃은 만목의 눈', subEn:'One of Manmok\'s eyes, devoured by the tide of madness and stripped of reason',
        color:'#308878', hp:367000000, dmg:3940000, spd:88,
        phases:[
          { threshold:1.0, patterns:['homing_orbs','confuse_field'],                   interval:1.6 },
          { threshold:0.5, patterns:['homing_orbs','confuse_field','confuse_field','line_barrage'], interval:0.9 },
        ]},
      final: { id:'chapter_boss',
        name:'타락한 만목',           nameEn:'Fallen Manmok',
        sub:'천 개의 눈이 전부 광기로 물든 신격', subEn:'A god whose thousand eyes have all been dyed with madness',
        color:'#185048', hp:800000000, dmg:5750000, spd:84,
        phases:[
          { threshold:1.0, patterns:['homing_orbs','confuse_field','line_barrage'],                         interval:1.4 },
          { threshold:0.5, patterns:['homing_orbs','confuse_field','line_barrage','ring_burst'],            interval:0.8 },
          { threshold:0.25,patterns:['homing_orbs','confuse_field','line_barrage','ring_burst','clone_split'], interval:0.45 },
        ]},
    },
    68: {
      mid:   { id:'mid_boss',
        name:'나각의 첫 번째 눈',     nameEn:"Nagak's First Eye",
        sub:'잠든 신의 눈꺼풀이 처음으로 열린 순간', subEn:'The moment the sleeping god\'s eyelid first opens',
        color:'#283868', hp:415000000, dmg:4460000, spd:70,
        phases:[
          { threshold:1.0, patterns:['shockwave','rush','ring_burst'],                 interval:1.5 },
          { threshold:0.5, patterns:['shockwave','rush','ring_burst','ring_burst','teleport_strike'], interval:0.85 },
        ]},
      final: { id:'chapter_boss',
        name:'각성하는 나각',         nameEn:'Nagak, Awakening',
        sub:'깨어나면 우주가 끝난다는, 잠든 외신의 각성', subEn:'The awakening of the sleeping outer god — whose waking ends the universe',
        color:'#141c38', hp:904000000, dmg:6490000, spd:76,
        phases:[
          { threshold:1.0, patterns:['shockwave','rush','ring_burst','summon'],                             interval:1.3 },
          { threshold:0.5, patterns:['shockwave','rush','ring_burst','summon','clone_split'],                interval:0.75 },
          { threshold:0.25,patterns:['shockwave','rush','ring_burst','summon','clone_split','teleport_strike'], interval:0.42 },
        ]},
    },
    69: {
      mid:   { id:'mid_boss',
        name:'■■■ 의 오염된 현신',    nameEn:"???'s Corrupted Manifestation",
        sub:'말할 수 없는 것이 광기로 물들어 다시 태어난 모습', subEn:'The unspeakable thing, reborn tainted with madness',
        color:'#180010', hp:469000000, dmg:5030000, spd:90,
        phases:[
          { threshold:1.0, patterns:['chain_lightning','line_barrage','confuse_field'], interval:1.3 },
          { threshold:0.5, patterns:['chain_lightning','line_barrage','confuse_field','summon'], interval:0.75 },
        ]},
      final: { id:'chapter_boss',
        name:'■■■ 의 완전체',        nameEn:'???, Complete Form',
        sub:'언급하는 것조차 존재를 위협하는, 완전해진 금기', subEn:'A completed taboo — to even mention it is to risk one\'s existence',
        color:'#0c0008', hp:1020000000, dmg:7340000, spd:86,
        phases:[
          { threshold:1.0, patterns:['chain_lightning','line_barrage','confuse_field','summon'],            interval:1.15 },
          { threshold:0.5, patterns:['chain_lightning','line_barrage','confuse_field','summon','clone_split'], interval:0.65 },
          { threshold:0.25,patterns:['chain_lightning','line_barrage','confuse_field','summon','clone_split','teleport_strike'], interval:0.38 },
        ]},
    },
    70: {
      mid:   { id:'mid_boss',
        name:'태모의 첫 번째 울음',   nameEn:"Taemo's First Cry",
        sub:'모든 외신을 낳은 어머니가 처음으로 흘린 울음', subEn:'The first cry of the mother who birthed every outer god',
        color:'#901830', hp:530000000, dmg:5690000, spd:80,
        phases:[
          { threshold:1.0, patterns:['homing_orbs','ring_burst','chain_lightning'],    interval:1.2 },
          { threshold:0.5, patterns:['homing_orbs','ring_burst','chain_lightning','confuse_field','teleport_strike'], interval:0.7 },
        ]},
      final: { id:'chapter_boss',
        name:'태모(太母)',            nameEn:'Taemo, Mother of All',
        sub:'모든 외신의 근원, 어계의 왕좌에 앉은 최후의 신격', subEn:'The origin of every outer god, seated upon the Outer Realm\'s final throne',
        color:'#400010', hp:1150000000, dmg:8290000, spd:88,
        phases:[
          { threshold:1.0, patterns:['homing_orbs','ring_burst','chain_lightning','clone_split'],                                        interval:1.0 },
          { threshold:0.5, patterns:['homing_orbs','ring_burst','chain_lightning','clone_split','summon','line_barrage'],                 interval:0.6 },
          { threshold:0.25,patterns:['homing_orbs','ring_burst','chain_lightning','clone_split','summon','line_barrage','teleport_strike','confuse_field'], interval:0.35 },
        ]},
    },
    // ── 시즌8: 황계 (챕터 71~80) ──
    71: {
      mid: {
        id:'mid_boss', name:'종말의 파수꾼', nameEn:'Mid Boss',
        sub:'반물질의 종말', subEn:'Ruined Realm',
        color:'#8060a0', hp:5990000, dmg:64300, spd:52,
        phases:[
          { threshold:1.0, patterns:['rush'], interval:2.6 },
          { threshold:0.5, patterns:['rush','shockwave'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'종말의 수호자', nameEn:'Chapter Boss',
        sub:'반물질의 종말', subEn:'Ruined Realm',
        color:'#a070c0', hp:13000000, dmg:93700, spd:56,
        phases:[
          { threshold:1.0, patterns:['rush'], interval:2.4 },
          { threshold:0.5, patterns:['rush','shockwave'], interval:1.9 },
          { threshold:0.25, patterns:['rush','shockwave','summon'], interval:1.5 },
        ],
      },
    },
    72: {
      mid: {
        id:'mid_boss', name:'거울의 사자', nameEn:'Mid Boss',
        sub:'거울의 바다', subEn:'Ruined Realm',
        color:'#8060a0', hp:5300000, dmg:56900, spd:52,
        phases:[
          { threshold:1.0, patterns:['spiral'], interval:2.6 },
          { threshold:0.5, patterns:['spiral','clone_split'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'거울의 군주', nameEn:'Chapter Boss',
        sub:'거울의 바다', subEn:'Ruined Realm',
        color:'#a070c0', hp:11500000, dmg:82900, spd:56,
        phases:[
          { threshold:1.0, patterns:['spiral'], interval:2.4 },
          { threshold:0.5, patterns:['spiral','clone_split'], interval:1.9 },
          { threshold:0.25, patterns:['spiral','clone_split','summon'], interval:1.5 },
        ],
      },
    },
    73: {
      mid: {
        id:'mid_boss', name:'시간의 수호자', nameEn:'Mid Boss',
        sub:'시간 역행의 전당', subEn:'Ruined Realm',
        color:'#8060a0', hp:4690000, dmg:50400, spd:52,
        phases:[
          { threshold:1.0, patterns:['teleport_strike'], interval:2.6 },
          { threshold:0.5, patterns:['teleport_strike','ring_burst'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'시간역행의 신', nameEn:'Chapter Boss',
        sub:'시간 역행의 전당', subEn:'Ruined Realm',
        color:'#a070c0', hp:10200000, dmg:73400, spd:56,
        phases:[
          { threshold:1.0, patterns:['teleport_strike'], interval:2.4 },
          { threshold:0.5, patterns:['teleport_strike','ring_burst'], interval:1.9 },
          { threshold:0.25, patterns:['teleport_strike','ring_burst','summon'], interval:1.5 },
        ],
      },
    },
    74: {
      mid: {
        id:'mid_boss', name:'반물질의 수호자', nameEn:'Mid Boss',
        sub:'반물질의 폭풍', subEn:'Ruined Realm',
        color:'#8060a0', hp:4150000, dmg:44600, spd:52,
        phases:[
          { threshold:1.0, patterns:['homing_orbs'], interval:2.6 },
          { threshold:0.5, patterns:['homing_orbs','line_barrage'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'반물질의 신', nameEn:'Chapter Boss',
        sub:'반물질의 폭풍', subEn:'Ruined Realm',
        color:'#a070c0', hp:9010000, dmg:64900, spd:56,
        phases:[
          { threshold:1.0, patterns:['homing_orbs'], interval:2.4 },
          { threshold:0.5, patterns:['homing_orbs','line_barrage'], interval:1.9 },
          { threshold:0.25, patterns:['homing_orbs','line_barrage','summon'], interval:1.5 },
        ],
      },
    },
    75: {
      mid: {
        id:'mid_boss', name:'황계대왕의 전위대', nameEn:'Mid Boss',
        sub:'황계 심층', subEn:'Ruined Realm',
        color:'#8060a0', hp:3670000, dmg:39400, spd:52,
        phases:[
          { threshold:1.0, patterns:['summon'], interval:2.6 },
          { threshold:0.5, patterns:['summon','sweep'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'황계대왕', nameEn:'Chapter Boss',
        sub:'황계 심층', subEn:'Ruined Realm',
        color:'#a070c0', hp:7970000, dmg:57500, spd:56,
        phases:[
          { threshold:1.0, patterns:['summon'], interval:2.4 },
          { threshold:0.5, patterns:['summon','sweep'], interval:1.9 },
          { threshold:0.25, patterns:['summon','sweep','summon'], interval:1.5 },
        ],
      },
    },
    76: {
      mid: {
        id:'mid_boss', name:'거울 자아의 분신', nameEn:'Mid Boss',
        sub:'거울 자아의 각성', subEn:'Ruined Realm',
        color:'#8060a0', hp:3250000, dmg:34900, spd:52,
        phases:[
          { threshold:1.0, patterns:['clone_split'], interval:2.6 },
          { threshold:0.5, patterns:['clone_split','confuse_field'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'각성한 거울 자아', nameEn:'Chapter Boss',
        sub:'거울 자아의 각성', subEn:'Ruined Realm',
        color:'#a070c0', hp:7050000, dmg:50800, spd:56,
        phases:[
          { threshold:1.0, patterns:['clone_split'], interval:2.4 },
          { threshold:0.5, patterns:['clone_split','confuse_field'], interval:1.9 },
          { threshold:0.25, patterns:['clone_split','confuse_field','summon'], interval:1.5 },
        ],
      },
    },
    77: {
      mid: {
        id:'mid_boss', name:'합치의 수호자', nameEn:'Mid Boss',
        sub:'합치의 예언', subEn:'Ruined Realm',
        color:'#8060a0', hp:2880000, dmg:30900, spd:52,
        phases:[
          { threshold:1.0, patterns:['chain_lightning'], interval:2.6 },
          { threshold:0.5, patterns:['chain_lightning','ring_burst'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'합치의 신', nameEn:'Chapter Boss',
        sub:'합치의 예언', subEn:'Ruined Realm',
        color:'#a070c0', hp:6240000, dmg:45000, spd:56,
        phases:[
          { threshold:1.0, patterns:['chain_lightning'], interval:2.4 },
          { threshold:0.5, patterns:['chain_lightning','ring_burst'], interval:1.9 },
          { threshold:0.25, patterns:['chain_lightning','ring_burst','summon'], interval:1.5 },
        ],
      },
    },
    78: {
      mid: {
        id:'mid_boss', name:'태초의 파수꾼', nameEn:'Mid Boss',
        sub:'태초로의 귀환', subEn:'Ruined Realm',
        color:'#8060a0', hp:2550000, dmg:27300, spd:52,
        phases:[
          { threshold:1.0, patterns:['spiral'], interval:2.6 },
          { threshold:0.5, patterns:['spiral','homing_orbs'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'태초의 수호자', nameEn:'Chapter Boss',
        sub:'태초로의 귀환', subEn:'Ruined Realm',
        color:'#a070c0', hp:5520000, dmg:39800, spd:56,
        phases:[
          { threshold:1.0, patterns:['spiral'], interval:2.4 },
          { threshold:0.5, patterns:['spiral','homing_orbs'], interval:1.9 },
          { threshold:0.25, patterns:['spiral','homing_orbs','summon'], interval:1.5 },
        ],
      },
    },
    79: {
      mid: {
        id:'mid_boss', name:'자아의 파편', nameEn:'Mid Boss',
        sub:'순수한 자아', subEn:'Ruined Realm',
        color:'#8060a0', hp:2250000, dmg:24200, spd:52,
        phases:[
          { threshold:1.0, patterns:['sweep'], interval:2.6 },
          { threshold:0.5, patterns:['sweep','teleport_strike'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'자아의 수호자', nameEn:'Chapter Boss',
        sub:'순수한 자아', subEn:'Ruined Realm',
        color:'#a070c0', hp:4890000, dmg:35200, spd:56,
        phases:[
          { threshold:1.0, patterns:['sweep'], interval:2.4 },
          { threshold:0.5, patterns:['sweep','teleport_strike'], interval:1.9 },
          { threshold:0.25, patterns:['sweep','teleport_strike','summon'], interval:1.5 },
        ],
      },
    },
    80: {
      mid: {
        id:'mid_boss', name:'순수한 자아의 첫 번째 눈물', nameEn:'Mid Boss',
        sub:'태초의 애기씨', subEn:'Ruined Realm',
        color:'#8060a0', hp:1990000, dmg:21400, spd:52,
        phases:[
          { threshold:1.0, patterns:['ring_burst'], interval:2.6 },
          { threshold:0.5, patterns:['ring_burst','summon'], interval:2.1 },
        ],
      },
      final: {
        id:'chapter_boss', name:'어린 애기씨 (최종보스)', nameEn:'Chapter Boss',
        sub:'태초의 애기씨', subEn:'Ruined Realm',
        color:'#a070c0', hp:4330000, dmg:31200, spd:56,
        phases:[
          { threshold:1.0, patterns:['ring_burst'], interval:2.4 },
          { threshold:0.5, patterns:['ring_burst','summon'], interval:1.9 },
          { threshold:0.25, patterns:['ring_burst','summon','summon'], interval:1.5 },
        ],
      },
    },
  },

  // 스테이지 ID로 챕터 찾기
  getChapterFromStage(stageId) {
    for (const ch of GAME_DATA.stages) {
      if (ch.stages.some(s => s.id === stageId)) return ch.chapter;
    }
    return 1;
  },

  // [UPDATE 2026-08-03] 파트2 전용 — 챕터당 2종(가중치로 섞인 배열) 중 "뒤쪽(두 번째로 등장하는) 종"을
  // 침공형(부적을 노리는) 몬스터로 고정 지정. byChapter가 항상 "A...A,B...B" 형태로 그룹져 있어
  // 배열에서 마지막에 등장하는 고유 id를 뽑으면 항상 두 번째 종이 나옴(다수/소수 가중치와 무관하게 결정적).
  getInvasionMonsterId(chapter) {
    const pool = this.byChapter[chapter];
    if (!pool || !pool.length) return null;
    const unique = [...new Set(pool)];
    return unique.length >= 2 ? unique[unique.length - 1] : null;
  },
};

// [UPDATE 2026-07-17] 260715_MTOPC.md 7/8번 — 시즌4(귀허계, 챕터31~40) 몬스터 HP/공격력 곡선 참조용 상수.
// 스테이지301~400/일반몹20종/보스20종은 위 defs·bosses에 이미 코드화 완료(이 표의 값 그대로 반영됨, 이 상수는 참고용으로만 남겨둠).
// [UPDATE 2026-07-26] 낡은 주석 정정: "잔상 5초 합체 실체화" 메커닉은 이후 game.js에 완전히 구현됨
// (_spawnAfterimage/_updateAfterimages/_materializeAfterimages, game.js:583~662). fade_strike/memory_drain/
// hollow_burst 전용 패턴 자체는 여전히 미착수 — 몬스터 defs에 남아있으면 attackPattern 폴백으로 동작.
// XP/골드는 시즌3와 동일하게 hp÷10.5 비율.
const SEASON4_MONSTER_CURVE = {
  31:{hp:15,dmg:2,xpGold:143}, 32:{hp:17,dmg:2,xpGold:162}, 33:{hp:19,dmg:3,xpGold:183},
  34:{hp:22,dmg:3,xpGold:207}, 35:{hp:24,dmg:3,xpGold:233}, 36:{hp:28,dmg:3,xpGold:264},
  37:{hp:31,dmg:4,xpGold:298}, 38:{hp:35,dmg:4,xpGold:337}, 39:{hp:40,dmg:4,xpGold:381},
  40:{hp:45,dmg:5,xpGold:430},
};

// [UPDATE 2026-07-15] 260715_MTOPC.md 8번 — 잔상 5초 합체로 실체화된 몬스터의 스탯 배율 확정값(HP/공격력/XP·골드 동일 적용).
// 최초 설계 ×1.3 → "순리석 확정 획득에 비해 리스크가 너무 약함" 재검토 후 ×1.8로 상향(진짜 위험을 감수해야 하는 수준).
// 처치 시 순리석 확정 1개(기존 12% 확률 드랍과 별개 경로), 시각적으로 옅은 발광 아웃라인으로 일반 몹과 구분.
const REINCARNATED_MONSTER_STAT_MULT = 1.8;
