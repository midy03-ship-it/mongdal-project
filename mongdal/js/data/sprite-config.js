// sprite-config.js
const SPRITES = {

  title: { src: '__IMG_title_title__' },

  intro: [
    { src:'__IMG_intro_intro_1__' },
    { src:'__IMG_intro_intro_2__' },
    { src:'__IMG_intro_intro_3__' },
    { src:'__IMG_intro_intro_4__' },
    { src:'__IMG_intro_intro_5__' },
    { src:'__IMG_intro_intro_6__' },
    { src:'__IMG_intro_intro_7__' },
  ],

  lobbyBg: {
    wide:  { src: '__IMG_lobbyBg_wide__' },
    start: { src: '__IMG_lobbyBg_lobby_start__' },
    bg1:   { src: '__IMG_lobbyBg_lobby_1__' },
    bg2:   { src: '__IMG_lobbyBg_lobby_2__' },
    bg3:   { src: '__IMG_lobbyBg_lobby_3__' },
    bg4:   { src: '__IMG_lobbyBg_lobby_4__' },
    bg5:   { src: '__IMG_lobbyBg_lobby_5__' },
    bg6:   { src: '__IMG_lobbyBg_lobby_6__' },
    bg7:   { src: '__IMG_lobbyBg_lobby_7__' },
  },

  playerFail: { src: '__IMG_player_player_fail__' },

  // 챕터 2,4,6,8,10 클리어 시 순서대로 성장 (기본=1단계)
  player: [
    { src:'__IMG_player_player_1__', drawW:51,  drawH:70,  offsetX:-26, offsetY:-70  }, // 기본
    { src:'__IMG_player_player_2__', drawW:58,  drawH:78,  offsetX:-29, offsetY:-78  }, // ch2 클리어
    { src:'__IMG_player_player_3__', drawW:62,  drawH:82,  offsetX:-31, offsetY:-82  }, // ch4 클리어
    { src:'__IMG_player_player_4__', drawW:68,  drawH:88,  offsetX:-34, offsetY:-88  }, // ch6 클리어
    { src:'__IMG_player_player_5__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 }, // ch8 클리어
  ],

  companions: {
    dochi:    { src:'__IMG_companions_dochi__',    drawW:51, drawH:60, offsetX:-26, offsetY:-60 },
    aram:     { src:'__IMG_companions_aram__',     drawW:58, drawH:60, offsetX:-29, offsetY:-60 },
    ggeogsoe: { src:'__IMG_companions_ggeogsoe__', drawW:63, drawH:60, offsetX:-32, offsetY:-60 },
    danbi:    { src:'__IMG_companions_danbi__',    drawW:52, drawH:60, offsetX:-26, offsetY:-60 },
    gaon:     { src:'__IMG_companions_gaon__',     drawW:50, drawH:60, offsetX:-25, offsetY:-60 },
    cheonga:  { src:'__IMG_companions_cheonga__',  drawW:62, drawH:80, offsetX:-31, offsetY:-80 },
    geumgang: { src:'__IMG_companions_geumgang__', drawW:70, drawH:75, offsetX:-35, offsetY:-75 },
    baekho:   { src:'__IMG_companions_baekho__',   drawW:72, drawH:66, offsetX:-36, offsetY:-66 },
    sohee:    { src:'__IMG_companions_sohee__',    drawW:60, drawH:72, offsetX:-30, offsetY:-72 },
    mugsa:    { src:'__IMG_companions_mugsa__',    drawW:60, drawH:70, offsetX:-30, offsetY:-70 },
    cheolgap: { src:'__IMG_companions_cheolgap__', drawW:62, drawH:80, offsetX:-31, offsetY:-80 },
    // [UPDATE 2026-07-06] 시즌2 동료
    haewonmaek: { src:'__IMG_companions_haewonmaek__', drawW:55, drawH:75, offsetX:-28, offsetY:-75 },
    gangnim:    { src:'__IMG_companions_gangnim__',    drawW:45, drawH:80, offsetX:-23, offsetY:-80 },
  },

  enemies: {
    // 챕터 1
    mangryeong:  { src:'__MON_ch1_mon1__',    drawW:47, drawH:55, offsetX:-24, offsetY:-55 },
    wongwi:      { src:'__MON_ch1_mon2__', drawW:50, drawH:50, offsetX:-25, offsetY:-50 },
    // 챕터 2
    hungry_soul: { src:'__MON_ch2_mon1__',     drawW:43, drawH:50, offsetX:-22, offsetY:-50 },
    gokseong:    { src:'__MON_ch2_mon2__',    drawW:50, drawH:42, offsetX:-25, offsetY:-42 },
    // 챕터 3
    corrupted:   { src:'__MON_ch3_mon1__',    drawW:47, drawH:55, offsetX:-24, offsetY:-55 },
    cursed_doll: { src:'__MON_ch3_mon2__',     drawW:38, drawH:45, offsetX:-19, offsetY:-45 },
    // 챕터 4
    tree_spirit: { src:'__MON_ch4_mon1__', drawW:58, drawH:58, offsetX:-29, offsetY:-58 },
    masked_fox:  { src:'__MON_ch4_mon2__',  drawW:52, drawH:52, offsetX:-26, offsetY:-52 },
    // 챕터 5
    abyss_worm:  { src:'__MON_ch5_mon1__',    drawW:50, drawH:42, offsetX:-25, offsetY:-42 },
    chaos_eye:   { src:'__MON_ch5_mon2__',     drawW:43, drawH:50, offsetX:-22, offsetY:-50 },
    // 챕터 6
    underworld_soldier: { src:'__MON_ch6_mon1__', drawW:50, drawH:58, offsetX:-25, offsetY:-58 },
    soul_reaper:        { src:'__MON_ch6_mon2__', drawW:47, drawH:55, offsetX:-24, offsetY:-55 },
    // 챕터 7
    void_acolyte:  { src:'__MON_ch7_mon1__', drawW:47, drawH:55, offsetX:-24, offsetY:-55 },
    void_tendril:  { src:'__MON_ch7_mon2__', drawW:52, drawH:52, offsetX:-26, offsetY:-52 },
    // 챕터 8
    memory_thief:   { src:'__MON_ch8_mon1__', drawW:43, drawH:50, offsetX:-22, offsetY:-50 },
    oblivion_shade: { src:'__MON_ch8_mon2__', drawW:58, drawH:58, offsetX:-29, offsetY:-58 },
    // 챕터 9
    fallen_spirit:  { src:'__MON_ch9_mon1__', drawW:50, drawH:55, offsetX:-25, offsetY:-55 },
    spirit_shadow:  { src:'__MON_ch9_mon2__', drawW:43, drawH:50, offsetX:-22, offsetY:-50 },
    // 챕터 10
    chaos_soldier: { src:'__MON_ch10_mon1__', drawW:52, drawH:58, offsetX:-26, offsetY:-58 },
    abyss_knight:  { src:'__MON_ch10_mon2__', drawW:58, drawH:62, offsetX:-29, offsetY:-62 },
    // 챕터 11 — 황천강 건너편
    hwangcheon_shade: { src:'__MON_ch11_mon1__', drawW:50, drawH:58, offsetX:-25, offsetY:-58 },
    ghost_barge:      { src:'__MON_ch11_mon2__', drawW:60, drawH:50, offsetX:-30, offsetY:-50 },
    // 챕터 12 — 망자의 거리
    dead_wanderer: { src:'__MON_ch12_mon1__', drawW:45, drawH:55, offsetX:-23, offsetY:-55 },
    trapped_soul:  { src:'__MON_ch12_mon2__', drawW:42, drawH:42, offsetX:-21, offsetY:-42 },
    // 챕터 13 — 기억의 미궁
    memory_orb:      { src:'__MON_ch13_mon1__', drawW:48, drawH:48, offsetX:-24, offsetY:-48 },
    dark_specter:    { src:'__MON_ch13_mon2__', drawW:48, drawH:58, offsetX:-24, offsetY:-58 },
    // 챕터 14 — 환생의 전당
    burning_tome:    { src:'__MON_ch14_mon1__', drawW:52, drawH:52, offsetX:-26, offsetY:-52 },
    judgment_post:   { src:'__MON_ch14_mon2__', drawW:45, drawH:58, offsetX:-23, offsetY:-58 },
    // 챕터 15 — 명부의 심장
    infernal_brute:    { src:'__MON_ch15_mon1__', drawW:52, drawH:58, offsetX:-26, offsetY:-58 },
    black_flame_demon: { src:'__MON_ch15_mon2__', drawW:45, drawH:52, offsetX:-23, offsetY:-52 },
    // 챕터 16 — 잠식된 유명계
    void_spider:   { src:'__MON_ch16_mon1__', drawW:58, drawH:50, offsetX:-29, offsetY:-50 },
    stone_corpse:  { src:'__MON_ch16_mon2__', drawW:58, drawH:58, offsetX:-29, offsetY:-58 },
    // 챕터 17 — 뒤틀린 저승길
    lost_mummy:     { src:'__MON_ch17_mon1__', drawW:48, drawH:58, offsetX:-24, offsetY:-58 },
    cyclops_soldier:{ src:'__MON_ch17_mon2__', drawW:50, drawH:56, offsetX:-25, offsetY:-56 },
    // 챕터 18 — 혼돈의 명부
    palace_demon:   { src:'__MON_ch18_mon1__', drawW:50, drawH:60, offsetX:-25, offsetY:-60 },
    cursed_herald:  { src:'__MON_ch18_mon2__', drawW:45, drawH:58, offsetX:-23, offsetY:-58 },
    // 챕터 19 — 소멸의 경계
    fate_scales:    { src:'__MON_ch19_mon1__', drawW:58, drawH:52, offsetX:-29, offsetY:-52 },
    tentacle_cursed:{ src:'__MON_ch19_mon2__', drawW:48, drawH:58, offsetX:-24, offsetY:-58 },
    // 챕터 20 — 유명계의 왕좌
    death_tome:     { src:'__MON_ch20_mon1__', drawW:52, drawH:55, offsetX:-26, offsetY:-55 },
    chaos_acrobat:  { src:'__MON_ch20_mon2__', drawW:48, drawH:58, offsetX:-24, offsetY:-58 },
    // 엘리트 몬스터 (챕터쌍별 1종)
    elite_ch1_2:  { src:'__MON_elite_ch1_2__',  drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch3_4:  { src:'__MON_elite_ch3_4__',  drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch5_6:  { src:'__MON_elite_ch5_6__',  drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch7_8:  { src:'__MON_elite_ch7_8__',  drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch9_10: { src:'__MON_elite_ch9_10__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
  },

  lobbyNpcs: {
    samshin:  { src: '__IMG_lobbyNpcs_samshin__',  drawW: 60, drawH: 80, offsetX: -30, offsetY: -80 },
    merchant: { src: '__IMG_lobbyNpcs_merchant__', drawW: 72, drawH: 90, offsetX: -36, offsetY: -90 },
  },

  worldMap: { src: '__IMG_worldMap_world_map__' },

  ending: [
    { src: '__IMG_ending_ending_1__' },
    { src: '__IMG_ending_ending_2__' },
  ],

  lobbyBuildings: {
    daejanggan: { src:'__IMG_lobbyBuildings_daejanggan__' },
    seonang:  { src:'__IMG_lobbyBuildings_seonang__'  },
    uiwon:    { src:'__IMG_lobbyBuildings_uiwon__'    },
    jangsang: { src:'__IMG_lobbyBuildings_jangsang__' },
    yongwang: { src:'__IMG_lobbyBuildings_yongwang__' },
    sinmok:   { src:'__IMG_lobbyBuildings_sinmok__'   },
  },


  effects: {
    proj_talisman:  { src:'__IMG_effects_proj_talisman__',  drawW:44, drawH:30 },
    proj_lightning: { src:'__IMG_effects_proj_lightning__', drawW:44, drawH:30 },
    proj_fire:      { src:'__IMG_effects_proj_fire__',      drawW:44, drawH:30 },
    proj_ice:       { src:'__IMG_effects_proj_ice__',       drawW:44, drawH:30 },
    proj_beam:      { src:'__IMG_effects_proj_beam__',      drawW:52, drawH:28 },
    proj_ghost:     { src:'__IMG_effects_proj_ghost__',     drawW:48, drawH:28 },
    proj_circle:    { src:'__IMG_effects_proj_circle__',    drawW:52, drawH:28 },
    lightning_bolt: { src:'__IMG_effects_lightning_bolt__', drawW:40, drawH:250 },
    elec_effect:    { src:'__IMG_effects_elec_effect__', drawW:80, drawH:54 },
    hit_normal:     { src:'__IMG_effects_hit_normal__',     drawW:32, drawH:23 },
    hit_explode:    { src:'__IMG_effects_hit_explode__',    drawW:32, drawH:23 },
    hit_freeze:     { src:'__IMG_effects_hit_freeze__',     drawW:32, drawH:23 },
    hit_burn:       { src:'__IMG_effects_hit_burn__',       drawW:32, drawH:23 },
    hit_critical:   { src:'__IMG_effects_hit_critical__',   drawW:32, drawH:23 },
    // 보조무기 카드 이미지
    bell:           { src:'__IMG_effects_bell__',           drawW:52, drawH:52 },
    bead:           { src:'__IMG_effects_bead__',           drawW:52, drawH:52 },
    thunder_drum:   { src:'__IMG_effects_thunder_drum__',   drawW:52, drawH:52 },
    lightning_trap: { src:'__IMG_effects_lightning_trap__', drawW:52, drawH:52 },
    ice_amulet:     { src:'__IMG_effects_ice_amulet__',     drawW:52, drawH:52 },
    sealing_amulet: { src:'__IMG_effects_sealing_amulet__', drawW:52, drawH:52 },
    heal_incense:   { src:'__IMG_effects_heal_incense__',   drawW:52, drawH:52 },
    spirit_shield:  { src:'__IMG_effects_spirit_shield__',  drawW:52, drawH:52 },
    hopaetag:       { src:'__IMG_effects_hopaetag__',       drawW:52, drawH:52 },
    karma_bead:     { src:'__IMG_effects_karma_bead__',     drawW:52, drawH:52 },
    shaman_drum:    { src:'__IMG_effects_shaman_drum__',    drawW:52, drawH:52 },
  },

  slots: {
    main: { src:'__IMG_slots_main__', w:34, h:34 },
    sub:  { src:'__IMG_slots_sub__',  w:34, h:34 },
    stat: { src:'__IMG_slots_stat__', w:34, h:34 },
  },

  items: {
    xp_orb:     { src:'__IMG_items_xp_orb__',     drawW:22, drawH:15 },
    xp_crystal: { src:'__IMG_items_xp_crystal__', drawW:22, drawH:15 },
    xp_flame:   { src:'__IMG_items_xp_flame__',   drawW:20, drawH:15 },
    gold:       { src:'__IMG_items_gold__',    drawW:24, drawH:24 },
    magnet:     { src:'__IMG_items_magnet__',  drawW:24, drawH:24 },
    bomb:       { src:'__IMG_items_bomb__',drawW:24, drawH:24 },
    potion:     { src:'__IMG_items_potion__',     drawW:22, drawH:24 },
    bigGold:       { src:'__IMG_items_bigGold__',       drawW:28, drawH:28 },
    ganghwaseok:   { src:'__IMG_items_ganghwaseok__',   drawW:28, drawH:28 },
    cheonunseok:   { src:'__IMG_items_cheonunseok__',   drawW:28, drawH:28 },
    cheonryeonggwa:{ src:'__IMG_items_cheonryeonggwa__',drawW:28, drawH:28 },
    taegeukseok:   { src:'__IMG_items_taegeukseok__',   drawW:28, drawH:28 },
    chaewonseok:   { src:'__IMG_items_chaewonseok__',   drawW:28, drawH:28 },
  },

  weapons: {
    scythe_main: { src:'__IMG_weapons_scythe_main__', drawW:30, drawH:46, handX:18, handY:-24 },
    bow:         { src:'__IMG_weapons_bow__', drawW:30, drawH:44, handX:18, handY:-22 },
    staff:       { src:'__IMG_weapons_staff__', drawW:28, drawH:42, handX:18, handY:-22 },
    talisman:     { src:'__IMG_weapons_talisman__',     drawW:22, drawH:34, handX:16, handY:-22 },
    bell:         { src:'__IMG_weapons_bell__',         drawW:28, drawH:34, handX:16, handY:-22 },
    talisman_evo: { src:'__IMG_weapons_talisman_evo__', drawW:30, drawH:34, handX:16, handY:-22 },
    fan:          { src:'__IMG_weapons_fan__',          drawW:32, drawH:28, handX:14, handY:-22 },
    drum:         { src:'__IMG_weapons_drum__',         drawW:26, drawH:30, handX:16, handY:-22 },
    sword:        { src:'__IMG_weapons_sword__',     drawW:10, drawH:36, handX:18, handY:-22 },
    // [UPDATE 2026-07-08] 무기 초월 9~10성 전용 완전체 그래픽 (원본: 이미지 모음/주무기 관련/soul_wp_1~5)
    talisman_soul:    { src:'__IMG_weapons_talisman_soul__',    drawW:36, drawH:58, handX:16, handY:-22 },
    sword_soul:       { src:'__IMG_weapons_sword_soul__',       drawW:14, drawH:58, handX:18, handY:-22 },
    bow_soul:         { src:'__IMG_weapons_bow_soul__',         drawW:30, drawH:58, handX:18, handY:-22 },
    staff_soul:       { src:'__IMG_weapons_staff_soul__',       drawW:19, drawH:58, handX:18, handY:-22 },
    scythe_main_soul: { src:'__IMG_weapons_scythe_main_soul__', drawW:28, drawH:58, handX:18, handY:-24 },
  },

  bosses: {
    // 챕터별 중간보스
    ch1_midboss: { src:'__MON_ch1_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch2_midboss: { src:'__MON_ch2_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch3_midboss: { src:'__MON_ch3_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch4_midboss: { src:'__MON_ch4_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch5_midboss: { src:'__MON_ch5_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch6_midboss: { src:'__MON_ch6_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch7_midboss: { src:'__MON_ch7_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch8_midboss: { src:'__MON_ch8_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch9_midboss: { src:'__MON_ch9_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch10_midboss: { src:'__MON_ch10_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch11_midboss: { src:'__MON_ch11_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch12_midboss: { src:'__MON_ch12_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch13_midboss: { src:'__MON_ch13_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch14_midboss: { src:'__MON_ch14_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch15_midboss: { src:'__MON_ch15_midboss__', drawW:110, drawH:120, offsetX:-55, offsetY:-120 },
    ch16_midboss: { src:'__MON_ch16_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch17_midboss: { src:'__MON_ch17_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    ch18_midboss: { src:'__MON_ch18_midboss__', drawW:110, drawH:110, offsetX:-55, offsetY:-110 },
    ch19_midboss: { src:'__MON_ch19_midboss__', drawW:110, drawH:115, offsetX:-55, offsetY:-115 },
    ch20_midboss: { src:'__MON_ch20_midboss__', drawW:100, drawH:110, offsetX:-50, offsetY:-110 },
    // 챕터별 최종보스
    ch1_boss:  { src:'__MON_ch1_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch2_boss:  { src:'__MON_ch2_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch3_boss:  { src:'__MON_ch3_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch4_boss:  { src:'__MON_ch4_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch5_boss:  { src:'__MON_ch5_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch6_boss:  { src:'__MON_ch6_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch7_boss:  { src:'__MON_ch7_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch8_boss:  { src:'__MON_ch8_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch9_boss:  { src:'__MON_ch9_boss__',  drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch10_boss: { src:'__MON_ch10_boss__', drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch11_boss: { src:'__MON_ch11_boss__', drawW:130, drawH:130, offsetX:-65, offsetY:-130 },
    ch12_boss: { src:'__MON_ch12_boss__', drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch13_boss: { src:'__MON_ch13_boss__', drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch14_boss: { src:'__MON_ch14_boss__', drawW:130, drawH:135, offsetX:-65, offsetY:-135 },
    ch15_boss: { src:'__MON_ch15_boss__', drawW:150, drawH:150, offsetX:-75, offsetY:-150 },
    ch16_boss: { src:'__MON_ch16_boss__', drawW:120, drawH:130, offsetX:-60, offsetY:-130 },
    ch17_boss: { src:'__MON_ch17_boss__', drawW:130, drawH:130, offsetX:-65, offsetY:-130 },
    ch18_boss: { src:'__MON_ch18_boss__', drawW:130, drawH:130, offsetX:-65, offsetY:-130 },
    ch19_boss: { src:'__MON_ch19_boss__', drawW:150, drawH:140, offsetX:-75, offsetY:-140 },
    ch20_boss: { src:'__MON_ch20_boss__', drawW:130, drawH:140, offsetX:-65, offsetY:-140 },
  },

  pets: {
    // [UPDATE 2026-07-06] 시즌2 펫
    jeoseung_nabi: { src:'__IMG_pets_jeoseung_nabi__', drawW:46, drawH:36, offsetX:-23, offsetY:-36 },
    sangsahwa:     { src:'__IMG_pets_sangsahwa__',     drawW:39, drawH:52, offsetX:-20, offsetY:-52 },
    hoya:         { src:'__IMG_pets_hoya__',         drawW:34, drawH:36, offsetX:-17, offsetY:-36 },
    crow:         { src:'__IMG_pets_crow__',         drawW:33, drawH:36, offsetX:-17, offsetY:-36 },
    fox:          { src:'__IMG_pets_fox__',          drawW:34, drawH:36, offsetX:-17, offsetY:-36 },
    turtle:       { src:'__IMG_pets_turtle__',       drawW:32, drawH:36, offsetX:-16, offsetY:-36 },
    chonggak:     { src:'__IMG_pets_chonggak__',     drawW:32, drawH:36, offsetX:-16, offsetY:-36 },
    tuju:         { src:'__IMG_pets_tuju__',         drawW:32, drawH:36, offsetX:-16, offsetY:-36 },
    dokkaebi_pet: { src:'__IMG_pets_dokkaebi_pet__', drawW:42, drawH:36, offsetX:-21, offsetY:-36 },
    rabbit:       { src:'__IMG_pets_rabbit__',       drawW:31, drawH:36, offsetX:-16, offsetY:-36 },
    zodiac_rat:     { src:'__IMG_pets_zodiac_rat__',     drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_ox:      { src:'__IMG_pets_zodiac_ox__',      drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_tiger:   { src:'__IMG_pets_zodiac_tiger__',   drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_rabbit:  { src:'__IMG_pets_zodiac_rabbit__',  drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_dragon:  { src:'__IMG_pets_zodiac_dragon__',  drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_snake:   { src:'__IMG_pets_zodiac_snake__',   drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_horse:   { src:'__IMG_pets_zodiac_horse__',   drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_goat:    { src:'__IMG_pets_zodiac_goat__',    drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_monkey:  { src:'__IMG_pets_zodiac_monkey__',  drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_rooster: { src:'__IMG_pets_zodiac_rooster__', drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_dog:     { src:'__IMG_pets_zodiac_dog__',     drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
    zodiac_pig:     { src:'__IMG_pets_zodiac_pig__',     drawW:52, drawH:50, offsetX:-26, offsetY:-50 },
  },

  lobbyIcons: {
    shop:        { src: '__IMG_icons_icon_shop__' },
    achievement: { src: '__IMG_icons_icon_achievement__' },
    settings:    { src: '__IMG_icons_icon_settings__' },
    stage:       { src: '__IMG_icons_icon_stage__' },
    companion:   { src: '__IMG_icons_icon_companion__' },
    dungeon:     { src: '__IMG_icons_icon_dungeon__' },
    building:    { src: '__IMG_icons_icon_building__' },
    pet:         { src: '__IMG_icons_icon_pet__' },
    character:   { src: '__IMG_icons_icon_character__' },
  },

  tiles: {
    // 기존 이지 소품
    deco_stone_large_a:   { src: '__IMG_tiles_deco_stone_large_a__' },
    deco_stone_large_b:   { src: '__IMG_tiles_deco_stone_large_b__' },
    deco_stone_pair:      { src: '__IMG_tiles_deco_stone_pair__' },
    deco_stone_small_cluster: { src: '__IMG_tiles_deco_stone_small_cluster__' },
    deco_stone_small_a:   { src: '__IMG_tiles_deco_stone_small_a__' },
    deco_stone_small_c:   { src: '__IMG_tiles_deco_stone_small_c__' },
    deco_stone_flat:      { src: '__IMG_tiles_deco_stone_flat__' },
    deco_grass_a:         { src: '__IMG_tiles_deco_grass_a__' },
    deco_dirt_texture:    { src: '__IMG_tiles_deco_dirt_texture__' },
    // 흙질감 공용 (던전 전체에 랜덤 뿌림용)
    dirt_tex_light:       { src: '__IMG_tiles_dirt_tex_light__' },
    dirt_tex_dark:        { src: '__IMG_tiles_dirt_tex_dark__' },
    // [UPDATE 2026-07-08] 시즌2(유명계) 전용 흙질감 — 시즌1 갈색과 색 충돌 해결용 (원본: 이미지 모음/시즌 2 관련/바닥)
    s2_dirt_tex_light:    { src: '__IMG_tiles_s2_dirt_tex_light__' },
    s2_dirt_tex_dark:     { src: '__IMG_tiles_s2_dirt_tex_dark__' },
    // 이지 추가
    easy_flower:          { src: '__IMG_tiles_easy_flower__' },
    easy_mushroom:        { src: '__IMG_tiles_easy_mushroom__' },
    easy_ystone:          { src: '__IMG_tiles_easy_ystone__' },
    // 무한 던전
    inf_tex:              { src: '__IMG_tiles_inf_tex__' },
    inf_stone:            { src: '__IMG_tiles_inf_stone__' },
    inf_stones:           { src: '__IMG_tiles_inf_stones__' },
    inf_grass:            { src: '__IMG_tiles_inf_grass__' },
    inf_dark_grass:       { src: '__IMG_tiles_inf_dark_grass__' },
    inf_blue_grass:       { src: '__IMG_tiles_inf_blue_grass__' },
    // 보스 러쉬
    boss_b:               { src: '__IMG_tiles_boss_b__' },
    boss_chain:           { src: '__IMG_tiles_boss_chain__' },
    boss_skull:           { src: '__IMG_tiles_boss_skull__' },
    boss_crack:           { src: '__IMG_tiles_boss_crack__' },
    // 강화석 던전
    forge_ember:          { src: '__IMG_tiles_forge_ember__' },
    forge_anvil:          { src: '__IMG_tiles_forge_anvil__' },
    forge_soot:           { src: '__IMG_tiles_forge_soot__' },
    // 천운석 던전
    sky_star:             { src: '__IMG_tiles_sky_star__' },
    sky_gem:              { src: '__IMG_tiles_sky_gem__' },
    sky_spark:            { src: '__IMG_tiles_sky_spark__' },
    // 천령과 던전
    grove_leaf:           { src: '__IMG_tiles_grove_leaf__' },
    grove_herb:           { src: '__IMG_tiles_grove_herb__' },
    grove_fruit:          { src: '__IMG_tiles_grove_fruit__' },
    // 태극석 던전
    shrine_cloth:         { src: '__IMG_tiles_shrine_cloth__' },
    shrine_silk:          { src: '__IMG_tiles_shrine_silk__' },
    shrine_incense:       { src: '__IMG_tiles_shrine_incense__' },
  },

  // 스테이지 전용 소품 (난이도별)
  stage: {
    // 이지 세트
    easy_a:        { src: '__IMG_stage_easy_a__',        w: 65, h: 54 },
    easy_b:        { src: '__IMG_stage_easy_b__',        w: 66, h: 53 },
    easy_c:        { src: '__IMG_stage_easy_c__',        w: 67, h: 45 },
    easy_d:        { src: '__IMG_stage_easy_d__',        w: 61, h: 49 },
    // 노말 세트
    normal_a:      { src: '__IMG_stage_normal_a__',      w: 63, h: 53 },
    normal_b:      { src: '__IMG_stage_normal_b__',      w: 63, h: 54 },
    normal_c:      { src: '__IMG_stage_normal_c__',      w: 62, h: 53 },
    normal_d:      { src: '__IMG_stage_normal_d__',      w: 57, h: 55 },
    // 하드 세트
    hard_a:        { src: '__IMG_stage_hard_a__',        w: 65, h: 60 },
    hard_b:        { src: '__IMG_stage_hard_b__',        w: 63, h: 54 },
    hard_c:        { src: '__IMG_stage_hard_c__',        w: 58, h: 53 },
    hard_d:        { src: '__IMG_stage_hard_d__',        w: 62, h: 56 },
    // 공통 분위기 소품
    stone_cracked: { src: '__IMG_stage_stone_cracked__', w: 48, h: 48 },
    grass_black:   { src: '__IMG_stage_grass_black__',   w: 66, h: 54 },
    stone_dark2:   { src: '__IMG_stage_stone_dark2__',   w: 75, h: 75 },
    stone_dark:    { src: '__IMG_stage_stone_dark__',    w: 88, h: 88 },
    grass_dark:    { src: '__IMG_stage_grass_dark__',    w: 76, h: 136 },
    dirt_dark:     { src: '__IMG_stage_dirt_dark__',     w: 128, h: 96 },
    grass_blue:    { src: '__IMG_stage_grass_blue__',    w: 106, h: 63 },
    stone_tan:     { src: '__IMG_stage_stone_tan__',     w: 48, h: 48 },
    // [UPDATE 2026-07-08] 시즌2(유명계) 전용 바닥 장식 소품 8종 (원본: 이미지 모음/시즌 2 관련/바닥/slice_00xx.png)
    s2_easy_a:      { src: '__IMG_stage_s2_easy_a__',      w: 46, h: 56 }, // 파란 버섯 (slice_0055)
    tombstone_gray: { src: '__IMG_stage_tombstone_gray__', w: 45, h: 58 }, // 둥근 묘비 (slice_0016)
    bone_pile:      { src: '__IMG_stage_bone_pile__',      w: 44, h: 52 }, // 뼈 교차 (slice_0032)
    s2_normal_a:    { src: '__IMG_stage_s2_normal_a__',    w: 45, h: 62 }, // 고사목 (slice_0036)
    s2_normal_b:    { src: '__IMG_stage_s2_normal_b__',    w: 45, h: 56 }, // 검은 꽃다발 (slice_0053)
    bone_pile2:     { src: '__IMG_stage_bone_pile2__',     w: 53, h: 54 }, // 뼈 무더기 (slice_0033)
    s2_hard_a:      { src: '__IMG_stage_s2_hard_a__',      w: 55, h: 64 }, // 가시덤불 (slice_0042)
    skull_pile:     { src: '__IMG_stage_skull_pile__',     w: 56, h: 42 }, // 해골 더미 (slice_0031)
    // 스테이지 선택 카드 프레임
    card_normal:    { src: '__IMG_stage_card_normal__' },
    card_midboss:   { src: '__IMG_stage_card_midboss__' },
    card_boss:      { src: '__IMG_stage_card_boss__' },
    card_s2_normal: { src: '__IMG_stage_card_s2_normal__' },
  },
};

const SpriteLoader = (() => {
  const cache = {};
  function load(src) {
    if (cache[src]) return cache[src];
    const img = new Image();
    img.src = src;
    cache[src] = img;
    return img;
  }
  function preloadAll() {
    const all = [
      ...SPRITES.player,
      ...(SPRITES.intro || []),
      ...Object.values(SPRITES.companions),
      ...Object.values(SPRITES.enemies),
      ...Object.values(SPRITES.bosses),
      ...Object.values(SPRITES.pets),
      ...Object.values(SPRITES.slots   || {}),
      ...Object.values(SPRITES.items   || {}),
      ...Object.values(SPRITES.effects || {}),
      ...Object.values(SPRITES.weapons || {}),
      ...Object.values(SPRITES.tiles   || {}),
      ...(SPRITES.ending || []),
      ...Object.values(SPRITES.lobbyNpcs || {}),
    ];
    for (const s of all) if (s?.src) load(s.src);
    console.log(`🎨 스프라이트 ${all.length}개 프리로드`);
  }
  function get(src) { return cache[src] || load(src); }
  return { load, get, preloadAll };
})();

// 재화 아이콘 img 태그 헬퍼 (전역)
// key: SPRITES.items의 키 ('gold','ganghwaseok','cheonunseok','cheonryeonggwa','taegeukseok','chaewonseok')
function _cimg(key, size) {
  const sz = size || 16;
  const src = (SPRITES.items[key] || {}).src || '';
  return src
    ? `<img src="${src}" style="width:${sz}px;height:${sz}px;object-fit:contain;image-rendering:pixelated;vertical-align:middle;">`
    : '';
}




