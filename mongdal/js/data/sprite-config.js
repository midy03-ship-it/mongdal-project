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

  // [UPDATE 2026-08-02] 파트2 주인공 박수 전용 스프라이트 (무기 없는 비-동료 버전).
  // 시즌8 엔딩 이후 로비/인게임에서 주인공 교체 시 player.js가 이 키를 사용 (companions.baksu 재사용 아님).
  // [UPDATE 2026-08-02] 인게임(캔버스)에선 원래 정상 비율로 잘 나왔음 — "뚱뚱해 보인다"는 실제로는
  // 로비(lobby.js positionPlayer)가 135:158(애기씨 비율)로 강제 리사이즈해서 생긴 문제였음(아래 lobby.js 수정 참고).
  // 그래서 여기 drawW는 원래 값(50)으로 되돌림 — 인게임 렌더링은 건드릴 필요 없었음.
  baksuProtagonist: { src:'__IMG_player_baksu_part2__', drawW:50, drawH:100, offsetX:-25, offsetY:-100 },

  // [UPDATE 2026-08-04] 박수 파츠 분리 애니메이션(몸통+왼팔+오른팔, tools/anim-preview.html 기반)은
  // 조정이 너무 손이 많이 가서 폐기 — 대신 풀프레임 3장(서있는/공격준비/공격)으로 교체.
  // 박수는 칼을 휘두르거나 활을 당기는 액션 없이 "마법력을 뻗는" 동작만 있다는 설정(원거리 캐스팅류).
  // 3프레임 전부 원본에서 동일한 유니온 bbox로 크롭해서 캔버스 크기가 같음 — 프레임 전환 시 캐릭터가
  // 화면에서 들썩이지 않고 제자리에서 자연스럽게 전환됨.
  // [UPDATE 2026-08-05] 2번(공격 준비) 프레임에 더 역동적인 후보 에셋을 잠깐 넣었다가, 애기씨 쪽 반응이
  // 안 좋아서 박수도 같이 "직전"(이 교체 이전) 버전으로 원복 — 1/2/3 유니온 bbox도 원본 기준으로 재크롭(크기 동일).
  // [UPDATE 2026-08-05] 3프레임(대기/준비/공격) → 5프레임(대기1~4 + 공격)으로 확장 — 준비 동작을 더 부드럽게
  // 나눈 새 에셋으로 교체. 재생 타이밍은 player.js draw()의 _BAKSU_MOTION_DURS 참고(대기1~4 각 0.3초, 공격 0.8초).
  baksuMotion: [
    { src:'__IMG_player_parts_baksu_motion_1__', drawW:67, drawH:100, offsetX:-33, offsetY:-100 }, // 0: 대기1(서있는)
    { src:'__IMG_player_parts_baksu_motion_2__', drawW:67, drawH:100, offsetX:-33, offsetY:-100 }, // 1: 대기2
    { src:'__IMG_player_parts_baksu_motion_3__', drawW:67, drawH:100, offsetX:-33, offsetY:-100 }, // 2: 대기3
    { src:'__IMG_player_parts_baksu_motion_4__', drawW:67, drawH:100, offsetX:-33, offsetY:-100 }, // 3: 대기4
    { src:'__IMG_player_parts_baksu_motion_5__', drawW:67, drawH:100, offsetX:-33, offsetY:-100 }, // 4: 공격(마법 발출)
  ],

  // [UPDATE 2026-08-05] 애기씨 3프레임 모션 통일 시도는 "어색하다"는 피드백으로 철회 — 예전 5단계 성장
  // 정지 이미지(player[0~4])로 완전 원복(player.js의 draw()/getSpriteConfig() 참고). 이 배열은 더 이상
  // 코드에서 참조되지 않지만, 나중에 다시 시도할 경우를 대비해 정의만 남겨둠(프리로드 목록에선 제외).
  aegissiMotion: [
    { src:'__IMG_player_parts_aegissi_motion_1__', drawW:54, drawH:80, offsetX:-27, offsetY:-80 }, // 0: 서있는(대기)
    { src:'__IMG_player_parts_aegissi_motion_2__', drawW:54, drawH:80, offsetX:-27, offsetY:-80 }, // 1: 공격 준비
    { src:'__IMG_player_parts_aegissi_motion_3__', drawW:54, drawH:80, offsetX:-27, offsetY:-80 }, // 2: 공격
  ],

  // [UPDATE 2026-08-03] 파트2 "애기씨의 부적" 지킬 오브젝트 — HP 구간별 열화 4단계.
  // 인덱스 0=최상(76~100%) ~ 3=최악(0~25%), talismanDefense-scene(가칭)에서 HP% 보고 이 배열 인덱스 선택.
  // [UPDATE 2026-08-03] 주인공(박수, drawH:100)보다도 커 보인다는 피드백 — 주인공 절반 크기(drawH:50)로 재조정
  talismanDefense: [
    { src:'__IMG_talisman_talisman_hp1__', drawW:29, drawH:50, offsetX:-15, offsetY:-50 },
    { src:'__IMG_talisman_talisman_hp2__', drawW:29, drawH:50, offsetX:-15, offsetY:-50 },
    { src:'__IMG_talisman_talisman_hp3__', drawW:30, drawH:50, offsetX:-15, offsetY:-50 },
    { src:'__IMG_talisman_talisman_hp4__', drawW:30, drawH:50, offsetX:-15, offsetY:-50 },
  ],

  // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 3종 — 방향 반전은 기존 player.js facing 로직(좌우 스케일) 재사용,
  // 별도 방향별 애니메이션 불필요(기본 캐릭터 스프라이트와 동일한 단일 정지 포즈 + 좌우 플립 방식)
  transformPlayer: {
    dokkaebi: { src:'__IMG_player_transform_dokkaebi__', drawW:50, drawH:90, offsetX:-25, offsetY:-90 },
    gumiho:   { src:'__IMG_player_transform_gumiho__',   drawW:90, drawH:84, offsetX:-45, offsetY:-84 },
    gogolgwi: { src:'__IMG_player_transform_gogolgwi__', drawW:68, drawH:90, offsetX:-34, offsetY:-90 },
  },

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
    // [UPDATE 2026-07-12] 신규 이미지(쌍망치/갓 쓴 저승차사)로 교체, 실측 비율에 맞춰 크기 재조정
    haewonmaek: { src:'__IMG_companions_haewonmaek__', drawW:83, drawH:75, offsetX:-42, offsetY:-75 },
    gangnim:    { src:'__IMG_companions_gangnim__',    drawW:72, drawH:80, offsetX:-36, offsetY:-80 },
    // [UPDATE 2026-07-17] 도깨비 계열 신규 동료 2종 (박수/장구애비)
    baksu:        { src:'__IMG_companions_baksu__',        drawW:44, drawH:78, offsetX:-22, offsetY:-78 },
    janggu_aebi:  { src:'__IMG_companions_janggu_aebi__',  drawW:44, drawH:78, offsetX:-22, offsetY:-78 },
    // [UPDATE 2026-07-17] 시즌4(귀허계) 신규 동료 2종 (환생동자/허무검사)
    hwansaengdongja: { src:'__IMG_companions_hwansaengdongja__', drawW:44, drawH:80, offsetX:-22, offsetY:-80 },
    heomugeomsa:     { src:'__IMG_companions_heomugeomsa__',     drawW:51, drawH:82, offsetX:-26, offsetY:-82 },
    // [UPDATE 2026-07-22] 시즌5(선계) 신규 동료 2종 (백운선인/매화검선) — 이미지 모음/03. 동료 관련/ss5 동료 원본
    baekunseonin:   { src:'__IMG_companions_baekunseonin__',   drawW:71, drawH:80, offsetX:-36, offsetY:-80 },
    maehwageomseon: { src:'__IMG_companions_maehwageomseon__', drawW:80, drawH:80, offsetX:-40, offsetY:-80 },
    // [UPDATE 2026-07-31] 시즌7(어계) 영입 동료 — 미리내(레전더리), 천자(미소스, 첫 미소스 동료)
    mirinae: { src:'__IMG_companions_mirinae__', drawW:88, drawH:80, offsetX:-44, offsetY:-80 },
    cheonja: { src:'__IMG_companions_cheonja__', drawW:92, drawH:80, offsetX:-46, offsetY:-80 },
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
    // [UPDATE 2026-07-16] 시즌3(망랑계) 몬스터 20종 이미지 — 이미지 모음/monsters/ss3 mon 원본, 배경 이미 제거된 상태로 제공됨
    // 챕터 21 — 망랑계의 첫 발걸음
    kkomadokkaebi:  { src:'__MON_ch21_mon1__', drawW:55, drawH:51, offsetX:-28, offsetY:-51 },
    heotgaebi:      { src:'__MON_ch21_mon2__', drawW:52, drawH:55, offsetX:-26, offsetY:-55 },
    // 챕터 22 — 요술의 거리
    yeoubul:        { src:'__MON_ch22_mon1__', drawW:55, drawH:51, offsetX:-28, offsetY:-51 },
    hollinbyeongsa: { src:'__MON_ch22_mon2__', drawW:49, drawH:55, offsetX:-25, offsetY:-55 },
    // 챕터 23 — 픽셀이 무너지는 숲
    oryuryeong:     { src:'__MON_ch23_mon1__', drawW:55, drawH:51, offsetX:-28, offsetY:-51 },
    kkaejingeurimja:{ src:'__MON_ch23_mon2__', drawW:55, drawH:53, offsetX:-28, offsetY:-53 },
    // 챕터 24 — 뒤틀린 시장
    jujubatsangpumryeong: { src:'__MON_ch24_mon1__', drawW:47, drawH:55, offsetX:-24, offsetY:-55 },
    geurimjasangin:       { src:'__MON_ch24_mon2__', drawW:55, drawH:46, offsetX:-28, offsetY:-46 },
    // 챕터 25 — 망랑계 심층
    simcheungdokkaebi: { src:'__MON_ch25_mon1__', drawW:53, drawH:55, offsetX:-27, offsetY:-55 },
    geurimjajimseung:  { src:'__MON_ch25_mon2__', drawW:55, drawH:44, offsetX:-28, offsetY:-44 },
    // 챕터 26 — 외신에 잠식된 땅
    oyeomdokkaebi: { src:'__MON_ch26_mon1__', drawW:55, drawH:52, offsetX:-28, offsetY:-52 },
    jamsikryeong:  { src:'__MON_ch26_mon2__', drawW:53, drawH:55, offsetX:-27, offsetY:-55 },
    // 챕터 27 — 세계를 홀린 요술
    hollinyeou: { src:'__MON_ch27_mon1__', drawW:55, drawH:49, offsetX:-28, offsetY:-49 },
    jujusulsa:  { src:'__MON_ch27_mon2__', drawW:55, drawH:51, offsetX:-28, offsetY:-51 },
    // 챕터 28 — 혼돈신의 균열
    sovoldolgwi:       { src:'__MON_ch28_mon1__', drawW:55, drawH:55, offsetX:-28, offsetY:-55 },
    hondonpaphyeonche: { src:'__MON_ch28_mon2__', drawW:55, drawH:51, offsetX:-28, offsetY:-51 },
    // 챕터 29 — 글리치 폭풍의 중심
    pokpungglitch:  { src:'__MON_ch29_mon1__', drawW:53, drawH:55, offsetX:-27, offsetY:-55 },
    oryupokpungche: { src:'__MON_ch29_mon2__', drawW:55, drawH:52, offsetX:-28, offsetY:-52 },
    // 챕터 30 — 망랑계의 왕좌
    bunsindokkaebi:    { src:'__MON_ch30_mon1__', drawW:48, drawH:55, offsetX:-24, offsetY:-55 },
    wangjwasuhobyeong: { src:'__MON_ch30_mon2__', drawW:55, drawH:53, offsetX:-28, offsetY:-53 },
    // [UPDATE 2026-07-17] 시즌4(귀허계) 몬스터 20종 이미지 — 이미지 모음/monsters/ss4mon 원본, 배경 이미 제거된 상태로 제공됨
    // 챕터 31 — 소멸의 해안
    padogwi:              { src:'__MON_ch31_mon1__', drawW:53, drawH:44, offsetX:-27, offsetY:-44 },
    baseojinhyeongche:    { src:'__MON_ch31_mon2__', drawW:53, drawH:38, offsetX:-27, offsetY:-38 },
    // 챕터 32 — 잊혀진 존재들의 바다
    ikmyeonggwi:          { src:'__MON_ch32_mon1__', drawW:53, drawH:43, offsetX:-27, offsetY:-43 },
    chimmukhaneunja:      { src:'__MON_ch32_mon2__', drawW:53, drawH:42, offsetX:-27, offsetY:-42 },
    // 챕터 33 — 거듭남의 제단
    hwansaengpapyeon:     { src:'__MON_ch33_mon1__', drawW:53, drawH:42, offsetX:-27, offsetY:-42 },
    miwanuijaa:           { src:'__MON_ch33_mon2__', drawW:53, drawH:41, offsetX:-27, offsetY:-41 },
    // 챕터 34 — 허무의 심연
    gongheogwi:           { src:'__MON_ch34_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    teongbingapju:        { src:'__MON_ch34_mon2__', drawW:53, drawH:41, offsetX:-27, offsetY:-41 },
    // 챕터 35 — 귀허계 심층
    simcheungsomyeolsu:   { src:'__MON_ch35_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    chimsikgwi:           { src:'__MON_ch35_mon2__', drawW:53, drawH:37, offsetX:-27, offsetY:-37 },
    // 챕터 36 — 잠식된 귀허계
    oyeomdoenpadogwi:     { src:'__MON_ch36_mon1__', drawW:53, drawH:44, offsetX:-27, offsetY:-44 },
    jamsikdoenhyeongche:  { src:'__MON_ch36_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    // 챕터 37 — 뒤틀린 거듭남
    dwitteullinhwansaengche: { src:'__MON_ch37_mon1__', drawW:53, drawH:39, offsetX:-27, offsetY:-39 },
    yeokhaenghaneunja:       { src:'__MON_ch37_mon2__', drawW:53, drawH:42, offsetX:-27, offsetY:-42 },
    // 챕터 38 — 혼돈의 허무
    heomujogak:           { src:'__MON_ch38_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    bunggoehaneunjanyeong:{ src:'__MON_ch38_mon2__', drawW:53, drawH:46, offsetX:-27, offsetY:-46 },
    // 챕터 39 — 소멸의 경계
    gyeonggyegwi:         { src:'__MON_ch39_mon1__', drawW:53, drawH:44, offsetX:-27, offsetY:-44 },
    somyeoljikjeonja:     { src:'__MON_ch39_mon2__', drawW:50, drawH:53, offsetX:-25, offsetY:-53 },
    // 챕터 40 — 귀허계의 왕좌
    wangjwapapyeonche:    { src:'__MON_ch40_mon1__', drawW:53, drawH:41, offsetX:-27, offsetY:-41 },
    majimakjaa:           { src:'__MON_ch40_mon2__', drawW:53, drawH:42, offsetX:-27, offsetY:-42 },
    // [UPDATE 2026-07-22] 시즌5(선계) 몬스터 20종 이미지 — 이미지 모음/01. monsters and bosses/ss5 mon 원본, 배경 이미 제거된 상태로 제공됨
    gureumwonhon:         { src:'__MON_ch41_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    seoribyeongsa:        { src:'__MON_ch41_mon2__', drawW:53, drawH:42, offsetX:-27, offsetY:-42 },
    bullohwajeong:        { src:'__MON_ch42_mon1__', drawW:53, drawH:44, offsetX:-27, offsetY:-44 },
    jeongwonjigi:         { src:'__MON_ch42_mon2__', drawW:53, drawH:45, offsetX:-27, offsetY:-45 },
    bujeokgwi:            { src:'__MON_ch43_mon1__', drawW:53, drawH:50, offsetX:-27, offsetY:-50 },
    dosulsuryeonja:       { src:'__MON_ch43_mon2__', drawW:53, drawH:46, offsetX:-27, offsetY:-46 },
    gohaengjahon:         { src:'__MON_ch44_mon1__', drawW:53, drawH:43, offsetX:-27, offsetY:-43 },
    jinripapyeon:         { src:'__MON_ch44_mon2__', drawW:53, drawH:43, offsetX:-27, offsetY:-43 },
    seongyesumunjang:     { src:'__MON_ch45_mon1__', drawW:53, drawH:45, offsetX:-27, offsetY:-45 },
    simcheungseonbyeong:  { src:'__MON_ch45_mon2__', drawW:53, drawH:49, offsetX:-27, offsetY:-49 },
    jamsikdoensinseon:    { src:'__MON_ch46_mon1__', drawW:53, drawH:41, offsetX:-27, offsetY:-41 },
    oyeomdoenbit:         { src:'__MON_ch46_mon2__', drawW:53, drawH:44, offsetX:-27, offsetY:-44 },
    dwitteullinbujeok:    { src:'__MON_ch47_mon1__', drawW:53, drawH:39, offsetX:-27, offsetY:-39 },
    jujudosa:             { src:'__MON_ch47_mon2__', drawW:53, drawH:44, offsetX:-27, offsetY:-44 },
    oyeomdoenjilli:       { src:'__MON_ch48_mon1__', drawW:53, drawH:46, offsetX:-27, offsetY:-46 },
    tarakhangohaengja:    { src:'__MON_ch48_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    tarakhansinseon:      { src:'__MON_ch49_mon1__', drawW:53, drawH:42, offsetX:-27, offsetY:-42 },
    jamsikdoennun:        { src:'__MON_ch49_mon2__', drawW:53, drawH:35, offsetX:-27, offsetY:-35 },
    tarakhancheonin:      { src:'__MON_ch50_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    majimaknunmul:        { src:'__MON_ch50_mon2__', drawW:53, drawH:39, offsetX:-27, offsetY:-39 },
    // [UPDATE 2026-07-24] 시즌6(원계) 몬스터 20종 — 챕터51~60
    beopchikpapyeon:       { src:'__MON_ch51_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    wonchoemeari:          { src:'__MON_ch51_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    jeonjagijanjae:        { src:'__MON_ch52_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    haekryeokgyeoljeongche:{ src:'__MON_ch52_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    ingwauigeurimja:       { src:'__MON_ch53_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    pagoeuisado:           { src:'__MON_ch53_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    jiltueuipapyeon:       { src:'__MON_ch54_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    gyeongoeuijanyeong:    { src:'__MON_ch54_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    wongyeuipasubyeong:    { src:'__MON_ch55_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    beopchiksuhosu:        { src:'__MON_ch55_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    oyeomdoenbeopchikche:  { src:'__MON_ch56_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    jamsikuichokso:        { src:'__MON_ch56_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    dwijipyinwonin:        { src:'__MON_ch57_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    gyeolgwaeobsneungeurimja: { src:'__MON_ch57_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    bunggoehaneunpapyeon:  { src:'__MON_ch58_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    changjoeujanhae:       { src:'__MON_ch58_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    somyeolhaneunnun:      { src:'__MON_ch59_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    geunwoneuipapyeon:     { src:'__MON_ch59_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    jungryeokuipapyeon:    { src:'__MON_ch60_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    wangjwaeuigeurimja:    { src:'__MON_ch60_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    // [UPDATE 2026-07-31] 시즌7(어계) 몬스터 20종 — 챕터61~70. 원본: 이미지 모음/01. monsters and bosses/ss7 mon
    // (사용분은 `쓴것` 하위로 이동). 렌더 크기는 시즌6과 동일 규약(53×40) 유지.
    kkumpapyeon:           { src:'__MON_ch61_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    gyunyeolgwi:           { src:'__MON_ch61_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    muhyeongche:           { src:'__MON_ch62_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    simyeonchoksu:         { src:'__MON_ch62_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    cheongaenunjogak:      { src:'__MON_ch63_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    eungsija:              { src:'__MON_ch63_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    geumgisokssagim:       { src:'__MON_ch64_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    ireumeopsneunja:       { src:'__MON_ch64_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    nagaksindo:            { src:'__MON_ch65_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    jamdeunjaujong:        { src:'__MON_ch65_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    ojeomaegissi:          { src:'__MON_ch66_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    gangrimgeurimja:       { src:'__MON_ch66_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    gwanggipado:           { src:'__MON_ch67_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    joryugwi:              { src:'__MON_ch67_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    nunkkeopulgyunyeol:    { src:'__MON_ch68_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    jamkkaeneunja:         { src:'__MON_ch68_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    chimmukgwi:            { src:'__MON_ch69_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    malhaeseonandoelgeot:  { src:'__MON_ch69_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    taechojasik:           { src:'__MON_ch70_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    eomeonipapyeon:        { src:'__MON_ch70_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    // [UPDATE 2026-07-31] 시즌8(황계) 몬스터 20종 — 챕터71~80. 렌더 규약은 시즌6·7과 동일(53×40).
    jongmalpapyeon:         { src:'__MON_ch71_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    bunggoeja:              { src:'__MON_ch71_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    geoulpapyeon:           { src:'__MON_ch72_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    bansache:               { src:'__MON_ch72_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    yeokhaenggwi:           { src:'__MON_ch73_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    gwageoui_janjae:        { src:'__MON_ch73_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    ssangsomyeolche:        { src:'__MON_ch74_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    banmuljilgu:            { src:'__MON_ch74_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    hwanggyebyeongjol:      { src:'__MON_ch75_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    banmuljilseok_sujipga:  { src:'__MON_ch75_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    geouljaa_bunsin:        { src:'__MON_ch76_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    gakseong_jeonjo:        { src:'__MON_ch76_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    hapchiui_sado:          { src:'__MON_ch77_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    yeoneonui_jogak:        { src:'__MON_ch77_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    taechoui_janhyang:      { src:'__MON_ch78_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    gwihwanhaneun_geot:     { src:'__MON_ch78_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    jaaui_papyeon:          { src:'__MON_ch79_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    sunsuhan_geurimja:      { src:'__MON_ch79_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    taechoui_bit:           { src:'__MON_ch80_mon1__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    eorin_useum:            { src:'__MON_ch80_mon2__', drawW:53, drawH:40, offsetX:-27, offsetY:-40 },
    // 엘리트 몬스터 (챕터쌍별 1종)
    elite_ch1_2:  { src:'__MON_elite_ch1_2__',  drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch3_4:  { src:'__MON_elite_ch3_4__',  drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch5_6:  { src:'__MON_elite_ch5_6__',  drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch7_8:  { src:'__MON_elite_ch7_8__',  drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch9_10: { src:'__MON_elite_ch9_10__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    // [UPDATE 2026-07-24] 시즌2~4(챕터11~40) 엘리트 15종 — 미사용 원화("이미지 모음/00. 종합 안쓴거/몬스터, 보스 안쓴거") 활용
    elite_ch11_12: { src:'__MON_elite_ch11_12__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch13_14: { src:'__MON_elite_ch13_14__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch15_16: { src:'__MON_elite_ch15_16__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch17_18: { src:'__MON_elite_ch17_18__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch19_20: { src:'__MON_elite_ch19_20__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch21_22: { src:'__MON_elite_ch21_22__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch23_24: { src:'__MON_elite_ch23_24__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch25_26: { src:'__MON_elite_ch25_26__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch27_28: { src:'__MON_elite_ch27_28__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch29_30: { src:'__MON_elite_ch29_30__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch31_32: { src:'__MON_elite_ch31_32__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch33_34: { src:'__MON_elite_ch33_34__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch35_36: { src:'__MON_elite_ch35_36__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch37_38: { src:'__MON_elite_ch37_38__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch39_40: { src:'__MON_elite_ch39_40__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    // [UPDATE 2026-07-24] 시즌5(선계) 엘리트 — 사신(四神) 4종
    elite_ch41_42: { src:'__MON_elite_ch41_42__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch43_44: { src:'__MON_elite_ch43_44__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch45_47: { src:'__MON_elite_ch45_47__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch48_50: { src:'__MON_elite_ch48_50__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    // [UPDATE 2026-07-29] 시즌6~8(원계/어계/황계) 엘리트 15종 — 그동안 등록이 누락되어 있었음(항상 절차적 폴백)
    elite_ch51_52: { src:'__MON_elite_ch51_52__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch53_54: { src:'__MON_elite_ch53_54__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch55_56: { src:'__MON_elite_ch55_56__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch57_58: { src:'__MON_elite_ch57_58__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch59_60: { src:'__MON_elite_ch59_60__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch61_62: { src:'__MON_elite_ch61_62__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch63_64: { src:'__MON_elite_ch63_64__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch65_66: { src:'__MON_elite_ch65_66__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch67_68: { src:'__MON_elite_ch67_68__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch69_70: { src:'__MON_elite_ch69_70__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch71_72: { src:'__MON_elite_ch71_72__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch73_74: { src:'__MON_elite_ch73_74__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch75_76: { src:'__MON_elite_ch75_76__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch77_78: { src:'__MON_elite_ch77_78__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
    elite_ch79_80: { src:'__MON_elite_ch79_80__', drawW:72, drawH:72, offsetX:-36, offsetY:-72 },
  },

  lobbyNpcs: {
    samshin:  { src: '__IMG_lobbyNpcs_samshin__',  drawW: 60, drawH: 80, offsetX: -30, offsetY: -80 },
    merchant: { src: '__IMG_lobbyNpcs_merchant__', drawW: 72, drawH: 90, offsetX: -36, offsetY: -90 },
    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번③ 혼돈시장 NPC 전용 이미지 반입 — 그동안 이모지(🎪)로 대체하던 것 교체
    chaosMerchant: { src: '__IMG_lobbyNpcs_chaosMerchant__', drawW: 71, drawH: 90, offsetX: -36, offsetY: -90 },
    // [UPDATE 2026-07-19] 시즌1 클리어 시 삼신할머니/차원상인과 같이 등장하는 보물 창고(Vault)
    vault: { src: '__IMG_lobbyNpcs_vault__', drawW: 64, drawH: 66, offsetX: -32, offsetY: -66 },
    // [UPDATE 2026-07-31] 시즌7(어계) NPC "그레이트 이스" — 슈브니구라스의 축복을 1골드에 파는 이계의 상인
    greatIth: { src: '__IMG_lobbyNpcs_greatIth__', drawW: 95, drawH: 90, offsetX: -47, offsetY: -90 },
  },

  worldMap: { src: '__IMG_worldMap_world_map__' },

  ending: [
    { src: '__IMG_ending_ending_1__' },
    { src: '__IMG_ending_ending_2__' },
  ],

  // [UPDATE 2026-07-14] 260713_MTOPC.md 16번: 시즌2 엔딩 5슬라이드 — 시즌1용(0,1)과 인덱스 안 겹치게 별도 배열로 분리
  endingS2: [
    { src: '__IMG_ending_ending_s2_1__' },
    { src: '__IMG_ending_ending_s2_2__' },
    { src: '__IMG_ending_ending_s2_3__' },
    { src: '__IMG_ending_ending_s2_4__' },
    { src: '__IMG_ending_ending_s2_5__' },
  ],

  // [UPDATE 2026-07-17] 시즌3 엔딩 4슬라이드 (5장 각본에서 마지막 2장을 1장으로 합쳐 4장으로 확정)
  endingS3: [
    { src: '__IMG_ending_ending_s3_1__' },
    { src: '__IMG_ending_ending_s3_2__' },
    { src: '__IMG_ending_ending_s3_3__' },
    { src: '__IMG_ending_ending_s3_4__' },
  ],

  // [UPDATE 2026-07-17] 시즌4 엔딩 6슬라이드 (마지막 5-2→5-1 두 장으로 점층적 반전 연출)
  endingS4: [
    { src: '__IMG_ending_ending_s4_1__' },
    { src: '__IMG_ending_ending_s4_2__' },
    { src: '__IMG_ending_ending_s4_3__' },
    { src: '__IMG_ending_ending_s4_4__' },
    { src: '__IMG_ending_ending_s4_5_2__' },
    { src: '__IMG_ending_ending_s4_5_1__' },
  ],

  // [UPDATE 2026-07-24] 시즌5 엔딩 5슬라이드
  endingS5: [
    { src: '__IMG_ending_ending_s5_1__' },
    { src: '__IMG_ending_ending_s5_2__' },
    { src: '__IMG_ending_ending_s5_3__' },
    { src: '__IMG_ending_ending_s5_4__' },
    { src: '__IMG_ending_ending_s5_5__' },
  ],

  // [UPDATE 2026-07-25] 시즌6(원계) 엔딩 5슬라이드 — 아트만 미리 반영, CONTENT_RELEASE.season6는 아직 false라 실제 노출은 안 됨
  // [UPDATE 2026-07-31] 시즌6 정식 공개(v0.5.1) + 엔딩 트리거 연결 완료로 이제 실제로 재생됨
  endingS6: [
    { src: '__IMG_ending_ending_s6_1__' },
    { src: '__IMG_ending_ending_s6_2__' },
    { src: '__IMG_ending_ending_s6_3__' },
    { src: '__IMG_ending_ending_s6_4__' },
    { src: '__IMG_ending_ending_s6_5__' },
  ],

  // [UPDATE 2026-07-31] 시즌7(어계) 엔딩 5슬라이드 — 오염의 멍에 / 거울 저편의 나 / 짊어진 오염 / 등 뒤의 인연들 / 황계의 문으로
  // 원본: 이미지 모음/05. 시즌 엔딩 모음/ss7 end (사용분은 `쓴것` 하위로 이동)
  endingS7: [
    { src: '__IMG_ending_ending_s7_1__' },
    { src: '__IMG_ending_ending_s7_2__' },
    { src: '__IMG_ending_ending_s7_3__' },
    { src: '__IMG_ending_ending_s7_4__' },
    { src: '__IMG_ending_ending_s7_5__' },
  ],

  // [UPDATE 2026-08-02] 시즌8(황계) 최종 엔딩 10슬라이드 — 원본: 이미지 모음/16. 엔딩 모음 r1~r10
  // (사용분은 `쓴것` 하위로 이동). 클라이맥스(자아 합일/아카식 소거)에 "아카식과 부적" 공식 에필로그가
  // 곧바로 이어지는 구조 — WORLDBUILDING.md "7. 최종 엔딩 — 아카식과 부적" 참고.
  endingS8: [
    { src: '__IMG_ending_ending_s8_1__' },
    { src: '__IMG_ending_ending_s8_2__' },
    { src: '__IMG_ending_ending_s8_3__' },
    { src: '__IMG_ending_ending_s8_4__' },
    { src: '__IMG_ending_ending_s8_5__' },
    { src: '__IMG_ending_ending_s8_6__' },
    { src: '__IMG_ending_ending_s8_7__' },
    { src: '__IMG_ending_ending_s8_8__' },
    { src: '__IMG_ending_ending_s8_9__' },
    { src: '__IMG_ending_ending_s8_10__' },
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
    // [UPDATE 2026-07-23] 선술 스킬트리 필살기 전용 이펙트 4종 — 이미지 모음/00. 종합 안쓴거/인겜에 적용 했다가 지금은 안쓰이는 이미지 모음
    seonsul_lightning: { src:'__IMG_effects_seonsul_lightning__', drawW:119, drawH:180 }, // 벼락술
    seonsul_fire:      { src:'__IMG_effects_seonsul_fire__',      drawW:94,  drawH:130 }, // 화염술
    seonsul_mark:      { src:'__IMG_effects_seonsul_mark__',      drawW:90,  drawH:71  }, // 명부낙인
    seonsul_purify:    { src:'__IMG_effects_seonsul_purify__',    drawW:67,  drawH:110 }, // 정화
    // [UPDATE 2026-07-25] 법칙(원계) 액티브 6종 전용 화면급 이펙트
    // [UPDATE 2026-07-28] 재활용 텍스처(독안개/도깨비불/토네이도/히트폭발)를 전부 전용 신규 원화로 교체 —
    // 나머지 8종과 출처를 통일(이미지 모음/18. 법칙 만들기/법칙 이펙트, 쓴거 하위로 이동됨)
    law_corruption: { src:'__IMG_effects_law_corruption__', drawW:48, drawH:36 }, // 오염의 법칙 (초록/보라 얼룩)
    law_collapse:   { src:'__IMG_effects_law_collapse__',   drawW:52, drawH:39 }, // 붕괴의 법칙 (방사형 파쇄)
    law_gravity:    { src:'__IMG_effects_law_gravity__',    drawW:48, drawH:36 }, // 중력의 법칙 (와이어프레임 큐브, 공간 왜곡)
    law_extinction: { src:'__IMG_effects_law_extinction__', drawW:44, drawH:33 }, // 소멸의 법칙 (텅 빈 중심의 암흑 폭발)
    // [UPDATE 2026-07-28] 절규/왜곡(주기형) + 조건형 액티브 6종(심판/파멸/인과응보/역행/왕좌/태초) 전용 신규 이펙트 —
    // 그동안 텍스트 팝업뿐이거나 무연출이던 문제 해결. 사용자 제공 원화(이미지 모음/18. 법칙 만들기/법칙 이펙트) 사용.
    law_scream:     { src:'__IMG_effects_law_scream__',     drawW:52, drawH:39 }, // 절규의 법칙 (절규하는 얼굴들)
    law_distortion: { src:'__IMG_effects_law_distortion__', drawW:48, drawH:36 }, // 왜곡의 법칙 (보라/금 소용돌이)
    law_judgment:   { src:'__IMG_effects_law_judgment__',   drawW:52, drawH:39 }, // 심판의 법칙 (황금 음양 + 율법 두루마리)
    law_ruin:       { src:'__IMG_effects_law_ruin__',       drawW:48, drawH:36 }, // 파멸의 법칙 (불타는 봉황형 화염)
    law_karma:      { src:'__IMG_effects_law_karma__',      drawW:52, drawH:39 }, // 인과응보의 법칙 (음양이 감도는 소용돌이)
    law_reversal:   { src:'__IMG_effects_law_reversal__',   drawW:48, drawH:36 }, // 역행의 법칙 (어두운 웜홀+고리)
    law_throne:     { src:'__IMG_effects_law_throne__',     drawW:48, drawH:36 }, // 왕좌의 법칙 (옥좌/문 형상)
    law_origin:     { src:'__IMG_effects_law_origin__',     drawW:56, drawH:42 }, // 태초의 법칙 ⭐시그니처 (가장 화려한 파스텔 크리스탈)
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
    law:  { src:'__IMG_slots_law__',  w:34, h:34 }, // [UPDATE 2026-07-24] 시즌6 법칙 슬롯
  },

  // [UPDATE 2026-07-24] 시즌6(원계) 법칙 24종 아이콘 — 이미지 모음/18. 법칙 만들기/법칙 - 중복 제거 원본
  laws: {
    law_sentinel:         { src:'__IMG_laws_law_sentinel__',         drawW:32, drawH:32 },
    law_electromagnetism: { src:'__IMG_laws_law_electromagnetism__', drawW:32, drawH:32 },
    law_nuclear:          { src:'__IMG_laws_law_nuclear__',          drawW:32, drawH:32 },
    law_causality:        { src:'__IMG_laws_law_causality__',        drawW:32, drawH:32 },
    law_relation:         { src:'__IMG_laws_law_relation__',         drawW:32, drawH:32 },
    law_primal:           { src:'__IMG_laws_law_primal__',           drawW:32, drawH:32 },
    law_stillness:        { src:'__IMG_laws_law_stillness__',        drawW:32, drawH:32 },
    law_sprint:           { src:'__IMG_laws_law_sprint__',           drawW:32, drawH:32 },
    law_reflection:       { src:'__IMG_laws_law_reflection__',       drawW:32, drawH:32 },
    law_absorption:       { src:'__IMG_laws_law_absorption__',       drawW:32, drawH:32 },
    law_endurance:        { src:'__IMG_laws_law_endurance__',        drawW:32, drawH:32 },
    law_excess:           { src:'__IMG_laws_law_excess__',           drawW:32, drawH:32 },
    law_corruption:       { src:'__IMG_laws_law_corruption__',       drawW:32, drawH:32 },
    law_collapse:         { src:'__IMG_laws_law_collapse__',         drawW:32, drawH:32 },
    law_gravity:          { src:'__IMG_laws_law_gravity__',          drawW:32, drawH:32 },
    law_scream:           { src:'__IMG_laws_law_scream__',           drawW:32, drawH:32 },
    law_extinction:       { src:'__IMG_laws_law_extinction__',       drawW:32, drawH:32 },
    law_distortion:       { src:'__IMG_laws_law_distortion__',       drawW:32, drawH:32 },
    law_judgment:         { src:'__IMG_laws_law_judgment__',         drawW:32, drawH:32 },
    law_ruin:             { src:'__IMG_laws_law_ruin__',             drawW:32, drawH:32 },
    law_karma:            { src:'__IMG_laws_law_karma__',            drawW:32, drawH:32 },
    law_reversal:         { src:'__IMG_laws_law_reversal__',         drawW:32, drawH:32 },
    law_throne:           { src:'__IMG_laws_law_throne__',           drawW:32, drawH:32 },
    law_origin:           { src:'__IMG_laws_law_origin__',           drawW:32, drawH:32 },
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
    gyulyulseok:   { src:'__IMG_items_gyulyulseok__',   drawW:28, drawH:28 }, // [UPDATE 2026-07-24] 규율석(법칙 시스템 재화)
    taegeukseok:   { src:'__IMG_items_taegeukseok__',   drawW:28, drawH:28 },
    chaewonseok:   { src:'__IMG_items_chaewonseok__',   drawW:28, drawH:28 },
    // [UPDATE 2026-07-17] 혼돈석/순리석 전용 아이콘 반입 — 그동안 이모지(🌪️/🌊)로 대체하던 것 교체
    hondonseok:    { src:'__IMG_items_hondonseok__',    drawW:18, drawH:28 },
    sullriseok:    { src:'__IMG_items_sullriseok__',    drawW:16, drawH:28 },
    // [UPDATE 2026-07-17] 영혼석(soulStones) 전용 아이콘 반입 — 카오스 마켓 등에서 이모지(💜) 대체하던 것 교체
    soulStones:    { src:'__IMG_items_soulStones__',    drawW:19, drawH:28 },
    // [UPDATE 2026-07-17] 영혼조각(soulFragment) 전용 아이콘 반입 — 그동안 맵 드랍이 순수 도형(발광 원)이었던 것 교체
    soulFragment:  { src:'__IMG_items_soulFragment__',  drawW:15, drawH:22 },
    // [UPDATE 2026-07-19] 보물 창고(Vault) 특산품 8종 전용 아이콘 — 이모지 플레이스홀더 교체
    s1_soulwill:      { src:'__IMG_items_s1_soulwill__',      drawW:28, drawH:28 },
    s2_reincycle:     { src:'__IMG_items_s2_reincycle__',     drawW:28, drawH:28 },
    s3_fatetrick:     { src:'__IMG_items_s3_fatetrick__',     drawW:28, drawH:28 },
    s4_providence:    { src:'__IMG_items_s4_providence__',    drawW:28, drawH:28 },
    s5_immortalbreath:{ src:'__IMG_items_s5_immortalbreath__',drawW:28, drawH:28 },
    s6_lawproof:      { src:'__IMG_items_s6_lawproof__',      drawW:28, drawH:28 },
    s7_unknown:       { src:'__IMG_items_s7_unknown__',       drawW:28, drawH:28 },
    s8_fatechoice:    { src:'__IMG_items_s8_fatechoice__',    drawW:28, drawH:28 },
  },

  // [UPDATE 2026-07-11] 오행 상성표 아트(사용자 제공) — 대장간 등 장착화면 시너지 시각화용
  ui: {
    elementChart: { src:'__IMG_ui_element_chart__' },
    // [UPDATE 2026-07-16] 신목의 균열 "기록의 공간" 배경 — 회전 소용돌이 아트(사용자 제공)
    memoryHallBg: { src:'__IMG_ui_memory_hall_bg__' },
    // [UPDATE 2026-07-17] 260713_MTOPC.md 9번⑤: 변신카드 3종 공용 액자 프레임(3개 후보 중 0001 채택)
    transformCardFrame: { src:'__IMG_ui_transform_card_frame__' },
    // [UPDATE 2026-07-22] 선술 스킬트리 팝업 배경 — 음양 나무 아트(625×1302, 사용자 제공)
    seonsulTreeBg: { src:'__IMG_ui_seonsul_tree_bg__' },
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
    // [UPDATE 2026-07-16] 시즌3(망랑계) 미들보스 10종 — 이미지 모음/monsters/ss3 boss 원본
    ch21_midboss: { src:'__MON_ch21_midboss__', drawW:130, drawH:126, offsetX:-65, offsetY:-126 },
    ch22_midboss: { src:'__MON_ch22_midboss__', drawW:130, drawH:119, offsetX:-65, offsetY:-119 },
    ch23_midboss: { src:'__MON_ch23_midboss__', drawW:130, drawH:109, offsetX:-65, offsetY:-109 },
    ch24_midboss: { src:'__MON_ch24_midboss__', drawW:128, drawH:130, offsetX:-64, offsetY:-130 },
    ch25_midboss: { src:'__MON_ch25_midboss__', drawW:130, drawH:124, offsetX:-65, offsetY:-124 },
    ch26_midboss: { src:'__MON_ch26_midboss__', drawW:130, drawH: 99, offsetX:-65, offsetY: -99 },
    ch27_midboss: { src:'__MON_ch27_midboss__', drawW:130, drawH:112, offsetX:-65, offsetY:-112 },
    ch28_midboss: { src:'__MON_ch28_midboss__', drawW:130, drawH:108, offsetX:-65, offsetY:-108 },
    ch29_midboss: { src:'__MON_ch29_midboss__', drawW:130, drawH:101, offsetX:-65, offsetY:-101 },
    ch30_midboss: { src:'__MON_ch30_midboss__', drawW:130, drawH: 95, offsetX:-65, offsetY: -95 },
    // [UPDATE 2026-07-17] 시즌4(귀허계) 미들보스 10종 — 이미지 모음/monsters/ss4 boss 원본
    ch31_midboss: { src:'__MON_ch31_midboss__', drawW:128, drawH:121, offsetX:-64, offsetY:-121 },
    ch32_midboss: { src:'__MON_ch32_midboss__', drawW:128, drawH:118, offsetX:-64, offsetY:-118 },
    ch33_midboss: { src:'__MON_ch33_midboss__', drawW:128, drawH:126, offsetX:-64, offsetY:-126 },
    ch34_midboss: { src:'__MON_ch34_midboss__', drawW:125, drawH:128, offsetX:-63, offsetY:-128 },
    ch35_midboss: { src:'__MON_ch35_midboss__', drawW:128, drawH:116, offsetX:-64, offsetY:-116 },
    ch36_midboss: { src:'__MON_ch36_midboss__', drawW:108, drawH:128, offsetX:-54, offsetY:-128 },
    ch37_midboss: { src:'__MON_ch37_midboss__', drawW:101, drawH:128, offsetX:-51, offsetY:-128 },
    ch38_midboss: { src:'__MON_ch38_midboss__', drawW:100, drawH:128, offsetX:-50, offsetY:-128 },
    ch39_midboss: { src:'__MON_ch39_midboss__', drawW:106, drawH:128, offsetX:-53, offsetY:-128 },
    ch40_midboss: { src:'__MON_ch40_midboss__', drawW: 95, drawH:128, offsetX:-48, offsetY:-128 },
    // [UPDATE 2026-07-22] 시즌5(선계) 미들보스 10종 — 이미지 모음/01. monsters and bosses/ss5 boss-여유분 있음 원본
    ch41_midboss: { src:'__MON_ch41_midboss__', drawW: 91, drawH:120, offsetX:-46, offsetY:-120 },
    ch42_midboss: { src:'__MON_ch42_midboss__', drawW: 99, drawH:120, offsetX:-50, offsetY:-120 },
    ch43_midboss: { src:'__MON_ch43_midboss__', drawW:118, drawH:120, offsetX:-59, offsetY:-120 },
    ch44_midboss: { src:'__MON_ch44_midboss__', drawW:107, drawH:120, offsetX:-54, offsetY:-120 },
    ch45_midboss: { src:'__MON_ch45_midboss__', drawW:102, drawH:120, offsetX:-51, offsetY:-120 },
    ch46_midboss: { src:'__MON_ch46_midboss__', drawW:107, drawH:120, offsetX:-54, offsetY:-120 },
    ch47_midboss: { src:'__MON_ch47_midboss__', drawW:104, drawH:120, offsetX:-52, offsetY:-120 },
    ch48_midboss: { src:'__MON_ch48_midboss__', drawW:104, drawH:120, offsetX:-52, offsetY:-120 },
    ch49_midboss: { src:'__MON_ch49_midboss__', drawW:114, drawH:120, offsetX:-57, offsetY:-120 },
    ch50_midboss: { src:'__MON_ch50_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    // [UPDATE 2026-07-24] 시즌6(원계) 미들보스 10종 — 챕터51~60
    ch51_midboss: { src:'__MON_ch51_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch52_midboss: { src:'__MON_ch52_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch53_midboss: { src:'__MON_ch53_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch54_midboss: { src:'__MON_ch54_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch55_midboss: { src:'__MON_ch55_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch56_midboss: { src:'__MON_ch56_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch57_midboss: { src:'__MON_ch57_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch58_midboss: { src:'__MON_ch58_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch59_midboss: { src:'__MON_ch59_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
    ch60_midboss: { src:'__MON_ch60_midboss__', drawW:106, drawH:120, offsetX:-53, offsetY:-120 },
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
    // [UPDATE 2026-07-16] 시즌3(망랑계) 챕터보스 10종 — 이미지 모음/monsters/ss3 boss 원본
    ch21_boss: { src:'__MON_ch21_boss__', drawW:150, drawH:111, offsetX:-75, offsetY:-111 },
    ch22_boss: { src:'__MON_ch22_boss__', drawW:150, drawH:144, offsetX:-75, offsetY:-144 },
    ch23_boss: { src:'__MON_ch23_boss__', drawW:150, drawH:106, offsetX:-75, offsetY:-106 },
    ch24_boss: { src:'__MON_ch24_boss__', drawW:150, drawH:142, offsetX:-75, offsetY:-142 },
    ch25_boss: { src:'__MON_ch25_boss__', drawW:150, drawH:117, offsetX:-75, offsetY:-117 },
    ch26_boss: { src:'__MON_ch26_boss__', drawW:150, drawH:139, offsetX:-75, offsetY:-139 },
    ch27_boss: { src:'__MON_ch27_boss__', drawW:150, drawH:132, offsetX:-75, offsetY:-132 },
    ch28_boss: { src:'__MON_ch28_boss__', drawW:150, drawH:128, offsetX:-75, offsetY:-128 },
    ch29_boss: { src:'__MON_ch29_boss__', drawW:150, drawH:131, offsetX:-75, offsetY:-131 },
    ch30_boss: { src:'__MON_ch30_boss__', drawW:150, drawH:125, offsetX:-75, offsetY:-125 },
    // [UPDATE 2026-07-17] 시즌4(귀허계) 챕터보스 10종 — 이미지 모음/monsters/ss4 boss 원본
    ch31_boss: { src:'__MON_ch31_boss__', drawW:148, drawH:145, offsetX:-74, offsetY:-145 },
    ch32_boss: { src:'__MON_ch32_boss__', drawW:148, drawH:145, offsetX:-74, offsetY:-145 },
    ch33_boss: { src:'__MON_ch33_boss__', drawW:148, drawH:146, offsetX:-74, offsetY:-146 },
    ch34_boss: { src:'__MON_ch34_boss__', drawW:141, drawH:148, offsetX:-71, offsetY:-148 },
    ch35_boss: { src:'__MON_ch35_boss__', drawW:141, drawH:148, offsetX:-71, offsetY:-148 },
    ch36_boss: { src:'__MON_ch36_boss__', drawW:148, drawH:148, offsetX:-74, offsetY:-148 },
    ch37_boss: { src:'__MON_ch37_boss__', drawW:140, drawH:148, offsetX:-70, offsetY:-148 },
    ch38_boss: { src:'__MON_ch38_boss__', drawW:139, drawH:148, offsetX:-70, offsetY:-148 },
    ch39_boss: { src:'__MON_ch39_boss__', drawW:141, drawH:148, offsetX:-71, offsetY:-148 },
    ch40_boss: { src:'__MON_ch40_boss__', drawW:137, drawH:148, offsetX:-69, offsetY:-148 },
    // [UPDATE 2026-07-22] 시즌5(선계) 챕터보스 10종 — 이미지 모음/01. monsters and bosses/ss5 boss-여유분 있음 원본
    ch41_boss: { src:'__MON_ch41_boss__', drawW:106, drawH:145, offsetX:-53, offsetY:-145 },
    ch42_boss: { src:'__MON_ch42_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch43_boss: { src:'__MON_ch43_boss__', drawW:113, drawH:145, offsetX:-57, offsetY:-145 },
    ch44_boss: { src:'__MON_ch44_boss__', drawW:122, drawH:145, offsetX:-61, offsetY:-145 },
    ch45_boss: { src:'__MON_ch45_boss__', drawW:114, drawH:145, offsetX:-57, offsetY:-145 },
    ch46_boss: { src:'__MON_ch46_boss__', drawW:156, drawH:145, offsetX:-78, offsetY:-145 },
    ch47_boss: { src:'__MON_ch47_boss__', drawW:120, drawH:145, offsetX:-60, offsetY:-145 },
    ch48_boss: { src:'__MON_ch48_boss__', drawW:148, drawH:145, offsetX:-74, offsetY:-145 },
    ch49_boss: { src:'__MON_ch49_boss__', drawW:130, drawH:145, offsetX:-65, offsetY:-145 },
    ch50_boss: { src:'__MON_ch50_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    // [UPDATE 2026-07-24] 시즌6(원계) 챕터보스 10종 — 챕터51~60
    ch51_boss: { src:'__MON_ch51_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch52_boss: { src:'__MON_ch52_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch53_boss: { src:'__MON_ch53_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch54_boss: { src:'__MON_ch54_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch55_boss: { src:'__MON_ch55_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch56_boss: { src:'__MON_ch56_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch57_boss: { src:'__MON_ch57_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch58_boss: { src:'__MON_ch58_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch59_boss: { src:'__MON_ch59_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },
    ch60_boss: { src:'__MON_ch60_boss__', drawW:133, drawH:145, offsetX:-67, offsetY:-145 },

    // [UPDATE 2026-07-31] 시즌7(어계) 보스/중간보스 20종 — 그동안 이미지가 없어 절차적 렌더링(색+도형)으로만 나왔음.
    // 원본: 이미지 모음/01. monsters and bosses/ss7 boss (사용분은 `쓴것` 하위로 이동).
    // 시즌6까지와 달리 원본 종횡비가 제각각이라 균일값 대신 이미지별로 폭을 계산(높이 기준: 챕터보스 145 / 중간보스 120).
    // [UPDATE 2026-07-31] 시즌8(황계) 보스/중간보스 20종 — 원본: 이미지 모음/01. monsters and bosses/ss8 boss, ss8 mon or boss
    // 챕터보스는 챕터 테마에 맞춰 개별 배정(챕터80 = 어린 애기씨, 최종보스).
    ch71_boss:    { src:'__MON_ch71_boss__',    drawW:123, drawH:145, offsetX:-61, offsetY:-145 },
    ch71_midboss: { src:'__MON_ch71_midboss__', drawW:136, drawH:120, offsetX:-68, offsetY:-120 },
    ch72_boss:    { src:'__MON_ch72_boss__',    drawW:125, drawH:145, offsetX:-62, offsetY:-145 },
    ch72_midboss: { src:'__MON_ch72_midboss__', drawW:103, drawH:120, offsetX:-51, offsetY:-120 },
    ch73_boss:    { src:'__MON_ch73_boss__',    drawW:143, drawH:145, offsetX:-71, offsetY:-145 },
    ch73_midboss: { src:'__MON_ch73_midboss__', drawW:120, drawH:120, offsetX:-60, offsetY:-120 },
    ch74_boss:    { src:'__MON_ch74_boss__',    drawW:119, drawH:145, offsetX:-59, offsetY:-145 },
    ch74_midboss: { src:'__MON_ch74_midboss__', drawW:109, drawH:120, offsetX:-54, offsetY:-120 },
    ch75_boss:    { src:'__MON_ch75_boss__',    drawW:134, drawH:145, offsetX:-67, offsetY:-145 },
    ch75_midboss: { src:'__MON_ch75_midboss__', drawW:122, drawH:120, offsetX:-61, offsetY:-120 },
    ch76_boss:    { src:'__MON_ch76_boss__',    drawW:124, drawH:145, offsetX:-62, offsetY:-145 },
    ch76_midboss: { src:'__MON_ch76_midboss__', drawW:101, drawH:120, offsetX:-50, offsetY:-120 },
    ch77_boss:    { src:'__MON_ch77_boss__',    drawW:146, drawH:145, offsetX:-73, offsetY:-145 },
    ch77_midboss: { src:'__MON_ch77_midboss__', drawW:104, drawH:120, offsetX:-52, offsetY:-120 },
    ch78_boss:    { src:'__MON_ch78_boss__',    drawW:123, drawH:145, offsetX:-61, offsetY:-145 },
    ch78_midboss: { src:'__MON_ch78_midboss__', drawW:117, drawH:120, offsetX:-58, offsetY:-120 },
    ch79_boss:    { src:'__MON_ch79_boss__',    drawW:118, drawH:145, offsetX:-59, offsetY:-145 },
    ch79_midboss: { src:'__MON_ch79_midboss__', drawW:137, drawH:120, offsetX:-68, offsetY:-120 },
    ch80_boss:    { src:'__MON_ch80_boss__',    drawW:125, drawH:145, offsetX:-62, offsetY:-145 },
    ch80_midboss: { src:'__MON_ch80_midboss__', drawW:113, drawH:120, offsetX:-56, offsetY:-120 },
    ch61_midboss: { src:'__MON_ch61_midboss__', drawW:103, drawH:120, offsetX:-51, offsetY:-120 },
    ch61_boss:    { src:'__MON_ch61_boss__',    drawW:153, drawH:145, offsetX:-76, offsetY:-145 },
    ch62_midboss: { src:'__MON_ch62_midboss__', drawW:108, drawH:120, offsetX:-54, offsetY:-120 },
    ch62_boss:    { src:'__MON_ch62_boss__',    drawW:117, drawH:145, offsetX:-58, offsetY:-145 },
    ch63_midboss: { src:'__MON_ch63_midboss__', drawW:113, drawH:120, offsetX:-56, offsetY:-120 },
    ch63_boss:    { src:'__MON_ch63_boss__',    drawW:161, drawH:145, offsetX:-80, offsetY:-145 },
    ch64_midboss: { src:'__MON_ch64_midboss__', drawW:107, drawH:120, offsetX:-53, offsetY:-120 },
    ch64_boss:    { src:'__MON_ch64_boss__',    drawW:147, drawH:145, offsetX:-73, offsetY:-145 },
    ch65_midboss: { src:'__MON_ch65_midboss__', drawW:114, drawH:120, offsetX:-57, offsetY:-120 },
    ch65_boss:    { src:'__MON_ch65_boss__',    drawW:155, drawH:145, offsetX:-77, offsetY:-145 },
    ch66_midboss: { src:'__MON_ch66_midboss__', drawW:128, drawH:120, offsetX:-64, offsetY:-120 },
    ch66_boss:    { src:'__MON_ch66_boss__',    drawW:156, drawH:145, offsetX:-78, offsetY:-145 },
    ch67_midboss: { src:'__MON_ch67_midboss__', drawW:117, drawH:120, offsetX:-58, offsetY:-120 },
    ch67_boss:    { src:'__MON_ch67_boss__',    drawW:134, drawH:145, offsetX:-67, offsetY:-145 },
    ch68_midboss: { src:'__MON_ch68_midboss__', drawW:103, drawH:120, offsetX:-51, offsetY:-120 },
    ch68_boss:    { src:'__MON_ch68_boss__',    drawW:133, drawH:145, offsetX:-66, offsetY:-145 },
    ch69_midboss: { src:'__MON_ch69_midboss__', drawW:104, drawH:120, offsetX:-52, offsetY:-120 },
    ch69_boss:    { src:'__MON_ch69_boss__',    drawW:137, drawH:145, offsetX:-68, offsetY:-145 },
    ch70_midboss: { src:'__MON_ch70_midboss__', drawW:107, drawH:120, offsetX:-53, offsetY:-120 },
    ch70_boss:    { src:'__MON_ch70_boss__',    drawW:150, drawH:145, offsetX:-75, offsetY:-145 },
  },

  pets: {
    // [UPDATE 2026-07-06] 시즌2 펫
    jeoseung_nabi: { src:'__IMG_pets_jeoseung_nabi__', drawW:46, drawH:36, offsetX:-23, offsetY:-36 },
    // [UPDATE 2026-07-14] 260713_MTOPC.md 18번: 상사화 사이즈 확정 — 원본 비율 유지해 drawH 44px로 축소(펫 범위 32~52px 중 상위권)
    sangsahwa:     { src:'__IMG_pets_sangsahwa__',     drawW:33, drawH:44, offsetX:-17, offsetY:-44 },
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
    // [UPDATE 2026-07-17] 도깨비 계열 신규 펫 2종 (싸리/공이)
    ssari: { src:'__IMG_pets_ssari__', drawW:29, drawH:38, offsetX:-15, offsetY:-38 },
    gongi: { src:'__IMG_pets_gongi__', drawW:18, drawH:38, offsetX:-9,  offsetY:-38 },
    // [UPDATE 2026-07-17] 시즌4(귀허계) 신규 펫 2종 (수정정령/영혼불씨)
    sujeong: { src:'__IMG_pets_sujeong__', drawW:38, drawH:42, offsetX:-19, offsetY:-42 },
    bulssi:  { src:'__IMG_pets_bulssi__',  drawW:40, drawH:40, offsetX:-20, offsetY:-40 },
    // [UPDATE 2026-07-22] 시즌5(선계) 신규 펫 2종 (성린/금관학) — 이미지 모음/12. 펫/ss5 원본
    seongnin:    { src:'__IMG_pets_seongnin__',    drawW:35, drawH:40, offsetX:-18, offsetY:-40 },
    geumgwanhak: { src:'__IMG_pets_geumgwanhak__', drawW:39, drawH:40, offsetX:-20, offsetY:-40 },
    // [UPDATE 2026-07-31] 시즌7(어계) 신규 펫 2종 — 별똥이(레전더리), 무명(미소스)
    byeoldong: { src:'__IMG_pets_byeoldong__', drawW:48, drawH:44, offsetX:-24, offsetY:-44 },
    mumyeong:  { src:'__IMG_pets_mumyeong__',  drawW:65, drawH:44, offsetX:-32, offsetY:-44 },
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
    // [UPDATE 2026-07-17] 무채색 더티 질감 9종 — 이미지 모음/tiles_crop2/dirt 원본. 색이 없어 어느 시즌 팔레트에도
    // 그대로 얹어 쓸 수 있는 공용 텍스처(현재는 시즌3에 사용, 추후 다른 시즌에도 재사용 가능)
    dirt_common_1: { src: '__IMG_tiles_dirt_common_1__' },
    dirt_common_2: { src: '__IMG_tiles_dirt_common_2__' },
    dirt_common_3: { src: '__IMG_tiles_dirt_common_3__' },
    dirt_common_4: { src: '__IMG_tiles_dirt_common_4__' },
    dirt_common_5: { src: '__IMG_tiles_dirt_common_5__' },
    dirt_common_6: { src: '__IMG_tiles_dirt_common_6__' },
    dirt_common_7: { src: '__IMG_tiles_dirt_common_7__' },
    dirt_common_8: { src: '__IMG_tiles_dirt_common_8__' },
    dirt_common_9: { src: '__IMG_tiles_dirt_common_9__' },
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
    // [UPDATE 2026-07-17] 시즌3(망랑계) 전용 바닥 장식 소품 17종 — 이미지 모음/tiles_crop2/ss3 특화 원본
    // (시즌1 자연물/시즌2 무덤·유골과 구분되는 뿌리정령·버섯·이끼바위·허수아비 도깨비 테마)
    s3_root_spirit:         { src: '__IMG_stage_s3_root_spirit__',         w: 65, h: 64 },
    s3_tangled_root_charm:  { src: '__IMG_stage_s3_tangled_root_charm__',  w: 65, h: 54 },
    s3_stump_spirit:        { src: '__IMG_stage_s3_stump_spirit__',        w: 42, h: 65 },
    s3_sprout_stone:        { src: '__IMG_stage_s3_sprout_stone__',        w: 60, h: 60 },
    s3_vine_stone_a:        { src: '__IMG_stage_s3_vine_stone_a__',        w: 58, h: 60 },
    s3_vine_stone_b:        { src: '__IMG_stage_s3_vine_stone_b__',        w: 60, h: 49 },
    s3_mushroom_root_stone: { src: '__IMG_stage_s3_mushroom_root_stone__', w: 60, h: 59 },
    s3_mushroom_hat_stone:  { src: '__IMG_stage_s3_mushroom_hat_stone__',  w: 58, h: 60 },
    s3_pebble_small:        { src: '__IMG_stage_s3_pebble_small__',        w: 40, h: 45 },
    s3_pebble_pair:         { src: '__IMG_stage_s3_pebble_pair__',         w: 45, h: 16 },
    s3_scarecrow_red:       { src: '__IMG_stage_s3_scarecrow_red__',       w: 44, h: 90 },
    s3_scarecrow_blue:      { src: '__IMG_stage_s3_scarecrow_blue__',      w: 47, h: 90 },
    s3_mushroom_char_a:     { src: '__IMG_stage_s3_mushroom_char_a__',     w: 55, h: 54 },
    s3_mushroom_char_hat:   { src: '__IMG_stage_s3_mushroom_char_hat__',   w: 48, h: 55 },
    s3_mushroom_cluster:    { src: '__IMG_stage_s3_mushroom_cluster__',    w: 53, h: 55 },
    s3_moss_rock_large:     { src: '__IMG_stage_s3_moss_rock_large__',     w: 60, h: 59 },
    s3_moss_rock_small:     { src: '__IMG_stage_s3_moss_rock_small__',     w: 55, h: 53 },
    // [UPDATE 2026-07-17] 시즌4(귀허계) 전용 바닥 장식 소품 30종 — 이미지 모음/tiles_crop2/ss4 특화 원본
    // (음양/룬석판/수정군락/환생란/소멸소용돌이/영혼불씨 6개 테마 × 5개 변형)
    s4_yinyang_1: { src: '__IMG_stage_s4_yinyang_1__', w: 62, h: 61 },
    s4_yinyang_2: { src: '__IMG_stage_s4_yinyang_2__', w: 62, h: 60 },
    s4_yinyang_3: { src: '__IMG_stage_s4_yinyang_3__', w: 62, h: 61 },
    s4_yinyang_4: { src: '__IMG_stage_s4_yinyang_4__', w: 61, h: 62 },
    s4_yinyang_5: { src: '__IMG_stage_s4_yinyang_5__', w: 62, h: 61 },
    s4_rune_stone_1: { src: '__IMG_stage_s4_rune_stone_1__', w: 46, h: 62 },
    s4_rune_stone_2: { src: '__IMG_stage_s4_rune_stone_2__', w: 46, h: 62 },
    s4_rune_stone_3: { src: '__IMG_stage_s4_rune_stone_3__', w: 44, h: 62 },
    s4_rune_stone_4: { src: '__IMG_stage_s4_rune_stone_4__', w: 45, h: 62 },
    s4_rune_stone_5: { src: '__IMG_stage_s4_rune_stone_5__', w: 45, h: 62 },
    s4_crystal_1: { src: '__IMG_stage_s4_crystal_1__', w: 54, h: 62 },
    s4_crystal_2: { src: '__IMG_stage_s4_crystal_2__', w: 53, h: 62 },
    s4_crystal_3: { src: '__IMG_stage_s4_crystal_3__', w: 58, h: 62 },
    s4_crystal_4: { src: '__IMG_stage_s4_crystal_4__', w: 60, h: 62 },
    s4_crystal_5: { src: '__IMG_stage_s4_crystal_5__', w: 50, h: 62 },
    s4_rebirth_egg_1: { src: '__IMG_stage_s4_rebirth_egg_1__', w: 50, h: 62 },
    s4_rebirth_egg_2: { src: '__IMG_stage_s4_rebirth_egg_2__', w: 50, h: 62 },
    s4_rebirth_egg_3: { src: '__IMG_stage_s4_rebirth_egg_3__', w: 50, h: 62 },
    s4_rebirth_egg_4: { src: '__IMG_stage_s4_rebirth_egg_4__', w: 49, h: 62 },
    s4_rebirth_egg_5: { src: '__IMG_stage_s4_rebirth_egg_5__', w: 49, h: 62 },
    s4_void_swirl_1: { src: '__IMG_stage_s4_void_swirl_1__', w: 55, h: 54 },
    s4_void_swirl_2: { src: '__IMG_stage_s4_void_swirl_2__', w: 55, h: 55 },
    s4_void_swirl_3: { src: '__IMG_stage_s4_void_swirl_3__', w: 55, h: 54 },
    s4_void_swirl_4: { src: '__IMG_stage_s4_void_swirl_4__', w: 51, h: 55 },
    s4_void_swirl_5: { src: '__IMG_stage_s4_void_swirl_5__', w: 54, h: 55 },
    s4_soul_ember_1: { src: '__IMG_stage_s4_soul_ember_1__', w: 29, h: 40 },
    s4_soul_ember_2: { src: '__IMG_stage_s4_soul_ember_2__', w: 39, h: 40 },
    s4_soul_ember_3: { src: '__IMG_stage_s4_soul_ember_3__', w: 30, h: 40 },
    s4_soul_ember_4: { src: '__IMG_stage_s4_soul_ember_4__', w: 40, h: 38 },
    s4_soul_ember_5: { src: '__IMG_stage_s4_soul_ember_5__', w: 36, h: 40 },
    // [UPDATE 2026-07-22] 시즌5(선계) 전용 바닥 장식 소품 72종 — 이미지 모음/10. 바닥 모음/ss5 특화 원본
    // (구름/대나무/연꽃/매화가지/깃털/향로/파고다등롱/산/두루마리/등롱/정자/꽃잎/풍경/연잎/변형 구름·매화·산 테마)
    s5_cloud_1: { src: '__IMG_stage_s5_cloud_1__', w: 62, h: 35 },
    s5_cloud_2: { src: '__IMG_stage_s5_cloud_2__', w: 62, h: 31 },
    s5_cloud_3: { src: '__IMG_stage_s5_cloud_3__', w: 62, h: 33 },
    s5_cloud_4: { src: '__IMG_stage_s5_cloud_4__', w: 62, h: 42 },
    s5_cloud_5: { src: '__IMG_stage_s5_cloud_5__', w: 62, h: 48 },
    s5_cloud_6: { src: '__IMG_stage_s5_cloud_6__', w: 62, h: 48 },
    s5_bamboo_1: { src: '__IMG_stage_s5_bamboo_1__', w: 62, h: 46 },
    s5_bamboo_2: { src: '__IMG_stage_s5_bamboo_2__', w: 44, h: 62 },
    s5_bamboo_3: { src: '__IMG_stage_s5_bamboo_3__', w: 50, h: 62 },
    s5_bamboo_4: { src: '__IMG_stage_s5_bamboo_4__', w: 49, h: 62 },
    s5_bamboo_5: { src: '__IMG_stage_s5_bamboo_5__', w: 52, h: 62 },
    s5_bamboo_6: { src: '__IMG_stage_s5_bamboo_6__', w: 51, h: 62 },
    s5_lotus_1: { src: '__IMG_stage_s5_lotus_1__', w: 37, h: 62 },
    s5_lotus_2: { src: '__IMG_stage_s5_lotus_2__', w: 43, h: 62 },
    s5_lotus_3: { src: '__IMG_stage_s5_lotus_3__', w: 62, h: 59 },
    s5_lotus_4: { src: '__IMG_stage_s5_lotus_4__', w: 62, h: 53 },
    s5_lotus_5: { src: '__IMG_stage_s5_lotus_5__', w: 62, h: 50 },
    s5_lotus_6: { src: '__IMG_stage_s5_lotus_6__', w: 62, h: 56 },
    s5_blossom_branch_1: { src: '__IMG_stage_s5_blossom_branch_1__', w: 62, h: 55 },
    s5_blossom_branch_2: { src: '__IMG_stage_s5_blossom_branch_2__', w: 49, h: 62 },
    s5_blossom_branch_3: { src: '__IMG_stage_s5_blossom_branch_3__', w: 62, h: 46 },
    s5_blossom_branch_4: { src: '__IMG_stage_s5_blossom_branch_4__', w: 62, h: 40 },
    s5_blossom_branch_5: { src: '__IMG_stage_s5_blossom_branch_5__', w: 62, h: 59 },
    s5_blossom_branch_6: { src: '__IMG_stage_s5_blossom_branch_6__', w: 58, h: 62 },
    s5_feather_1: { src: '__IMG_stage_s5_feather_1__', w: 55, h: 62 },
    s5_feather_2: { src: '__IMG_stage_s5_feather_2__', w: 54, h: 62 },
    s5_feather_3: { src: '__IMG_stage_s5_feather_3__', w: 56, h: 62 },
    s5_feather_4: { src: '__IMG_stage_s5_feather_4__', w: 55, h: 62 },
    s5_incense_1: { src: '__IMG_stage_s5_incense_1__', w: 53, h: 62 },
    s5_incense_2: { src: '__IMG_stage_s5_incense_2__', w: 62, h: 57 },
    s5_incense_3: { src: '__IMG_stage_s5_incense_3__', w: 59, h: 62 },
    s5_incense_4: { src: '__IMG_stage_s5_incense_4__', w: 62, h: 48 },
    s5_lantern_pagoda_1: { src: '__IMG_stage_s5_lantern_pagoda_1__', w: 41, h: 62 },
    s5_mountain_1: { src: '__IMG_stage_s5_mountain_1__', w: 52, h: 62 },
    s5_mountain_2: { src: '__IMG_stage_s5_mountain_2__', w: 62, h: 47 },
    s5_mountain_3: { src: '__IMG_stage_s5_mountain_3__', w: 55, h: 62 },
    s5_scroll_1: { src: '__IMG_stage_s5_scroll_1__', w: 62, h: 52 },
    s5_scroll_2: { src: '__IMG_stage_s5_scroll_2__', w: 62, h: 57 },
    s5_scroll_3: { src: '__IMG_stage_s5_scroll_3__', w: 59, h: 62 },
    s5_scroll_4: { src: '__IMG_stage_s5_scroll_4__', w: 61, h: 62 },
    s5_scroll_5: { src: '__IMG_stage_s5_scroll_5__', w: 62, h: 61 },
    s5_lantern_1: { src: '__IMG_stage_s5_lantern_1__', w: 42, h: 62 },
    s5_lantern_2: { src: '__IMG_stage_s5_lantern_2__', w: 42, h: 62 },
    s5_lantern_3: { src: '__IMG_stage_s5_lantern_3__', w: 45, h: 62 },
    s5_lantern_4: { src: '__IMG_stage_s5_lantern_4__', w: 56, h: 62 },
    s5_pavilion_1: { src: '__IMG_stage_s5_pavilion_1__', w: 57, h: 62 },
    s5_pavilion_2: { src: '__IMG_stage_s5_pavilion_2__', w: 55, h: 62 },
    s5_pavilion_3: { src: '__IMG_stage_s5_pavilion_3__', w: 55, h: 62 },
    s5_petal_1: { src: '__IMG_stage_s5_petal_1__', w: 62, h: 59 },
    s5_petal_2: { src: '__IMG_stage_s5_petal_2__', w: 62, h: 58 },
    s5_petal_3: { src: '__IMG_stage_s5_petal_3__', w: 60, h: 62 },
    s5_petal_4: { src: '__IMG_stage_s5_petal_4__', w: 62, h: 61 },
    s5_petal_5: { src: '__IMG_stage_s5_petal_5__', w: 58, h: 50 },
    s5_petal_6: { src: '__IMG_stage_s5_petal_6__', w: 30, h: 27 },
    s5_windchime_1: { src: '__IMG_stage_s5_windchime_1__', w: 55, h: 62 },
    s5_windchime_2: { src: '__IMG_stage_s5_windchime_2__', w: 54, h: 62 },
    s5_lotus_pad_1: { src: '__IMG_stage_s5_lotus_pad_1__', w: 62, h: 52 },
    s5_lotus_pad_2: { src: '__IMG_stage_s5_lotus_pad_2__', w: 62, h: 50 },
    s5_lotus_pad_3: { src: '__IMG_stage_s5_lotus_pad_3__', w: 62, h: 60 },
    s5_lotus_pad_4: { src: '__IMG_stage_s5_lotus_pad_4__', w: 62, h: 55 },
    s5_bamboo_cluster_1: { src: '__IMG_stage_s5_bamboo_cluster_1__', w: 50, h: 62 },
    s5_bamboo_cluster_2: { src: '__IMG_stage_s5_bamboo_cluster_2__', w: 50, h: 62 },
    s5_bamboo_cluster_3: { src: '__IMG_stage_s5_bamboo_cluster_3__', w: 53, h: 62 },
    s5_cloud_alt_1: { src: '__IMG_stage_s5_cloud_alt_1__', w: 62, h: 46 },
    s5_cloud_alt_2: { src: '__IMG_stage_s5_cloud_alt_2__', w: 62, h: 47 },
    s5_cloud_alt_3: { src: '__IMG_stage_s5_cloud_alt_3__', w: 62, h: 46 },
    s5_cloud_alt_4: { src: '__IMG_stage_s5_cloud_alt_4__', w: 62, h: 52 },
    s5_blossom_branch_alt_1: { src: '__IMG_stage_s5_blossom_branch_alt_1__', w: 57, h: 62 },
    s5_blossom_branch_alt_2: { src: '__IMG_stage_s5_blossom_branch_alt_2__', w: 60, h: 62 },
    s5_blossom_branch_alt_3: { src: '__IMG_stage_s5_blossom_branch_alt_3__', w: 57, h: 62 },
    s5_mountain_alt_1: { src: '__IMG_stage_s5_mountain_alt_1__', w: 62, h: 49 },
    s5_mountain_alt_2: { src: '__IMG_stage_s5_mountain_alt_2__', w: 55, h: 62 },
    // [UPDATE 2026-07-29] 시즌6(원계) 전용 데코셋 — 성운/수정/룬석/제단/매화/깃털/향로/종/대나무/연꽃/꽃잎 테마
    // (원본: 이미지 모음/10. 바닥 모음/ss6, 72종 중 대표 12종 선별)
    s6_nebula_1: { src: '__IMG_stage_s6_nebula_1__', w: 57, h: 62 },
    s6_nebula_2: { src: '__IMG_stage_s6_nebula_2__', w: 57, h: 62 },
    s6_blossom_1: { src: '__IMG_stage_s6_blossom_1__', w: 57, h: 62 },
    s6_feather_1: { src: '__IMG_stage_s6_feather_1__', w: 57, h: 62 },
    s6_incense_1: { src: '__IMG_stage_s6_incense_1__', w: 57, h: 62 },
    s6_rune_1: { src: '__IMG_stage_s6_rune_1__', w: 57, h: 62 },
    s6_altar_1: { src: '__IMG_stage_s6_altar_1__', w: 57, h: 62 },
    s6_bamboo_1: { src: '__IMG_stage_s6_bamboo_1__', w: 57, h: 62 },
    s6_crystal_1: { src: '__IMG_stage_s6_crystal_1__', w: 57, h: 62 },
    s6_petal_1: { src: '__IMG_stage_s6_petal_1__', w: 57, h: 62 },
    s6_lotus_1: { src: '__IMG_stage_s6_lotus_1__', w: 57, h: 62 },
    s6_bell_1: { src: '__IMG_stage_s6_bell_1__', w: 57, h: 62 },
    // [UPDATE 2026-07-29] 시즌7(어계) 전용 데코셋 — 수정파편/성운/제단/기형성장/촉수눈 테마
    // (원본: 이미지 모음/10. 바닥 모음/ss7, 65종 중 대표 12종 선별)
    s7_crystal_1: { src: '__IMG_stage_s7_crystal_1__', w: 57, h: 62 },
    s7_crystal_2: { src: '__IMG_stage_s7_crystal_2__', w: 57, h: 62 },
    s7_crystal_3: { src: '__IMG_stage_s7_crystal_3__', w: 57, h: 62 },
    s7_nebula_1: { src: '__IMG_stage_s7_nebula_1__', w: 57, h: 62 },
    s7_rune_1: { src: '__IMG_stage_s7_rune_1__', w: 57, h: 62 },
    s7_void_1: { src: '__IMG_stage_s7_void_1__', w: 57, h: 62 },
    s7_altar_1: { src: '__IMG_stage_s7_altar_1__', w: 57, h: 62 },
    s7_growth_1: { src: '__IMG_stage_s7_growth_1__', w: 57, h: 62 },
    s7_eye_1: { src: '__IMG_stage_s7_eye_1__', w: 57, h: 62 },
    s7_eye_2: { src: '__IMG_stage_s7_eye_2__', w: 57, h: 62 },
    s7_altar_2: { src: '__IMG_stage_s7_altar_2__', w: 57, h: 62 },
    s7_growth_2: { src: '__IMG_stage_s7_growth_2__', w: 57, h: 62 },
    // 스테이지 선택 카드 프레임
    card_normal:    { src: '__IMG_stage_card_normal__' },
    card_midboss:   { src: '__IMG_stage_card_midboss__' },
    card_boss:      { src: '__IMG_stage_card_boss__' },
    card_s2_normal: { src: '__IMG_stage_card_s2_normal__' },
    // [UPDATE 2026-07-22] 시즌2만 전용 카드 프레임이 있던 걸 시즌1/3/4/5로 확장 — 이미지 모음/스테이지 선택 아이콘/st_slimages 원본
    card_s1_normal: { src: '__IMG_stage_card_s1_normal__' },
    card_s3_normal: { src: '__IMG_stage_card_s3_normal__' },
    // [UPDATE 2026-07-31] 시즌8(황계) 전용 데코셋 — 반물질 파편/거울/균열/유물/빛 테마
    // (원본: 이미지 모음/10. 바닥 모음/ss8, 66종 중 대표 12종 선별)
    s8_shard_1: { src: '__IMG_stage_s8_shard_1__', w: 56, h: 62 },
    s8_shard_2: { src: '__IMG_stage_s8_shard_2__', w: 55, h: 62 },
    s8_mirror_1: { src: '__IMG_stage_s8_mirror_1__', w: 52, h: 62 },
    s8_mirror_2: { src: '__IMG_stage_s8_mirror_2__', w: 45, h: 62 },
    s8_rift_1: { src: '__IMG_stage_s8_rift_1__', w: 62, h: 36 },
    s8_rift_2: { src: '__IMG_stage_s8_rift_2__', w: 61, h: 62 },
    s8_relic_1: { src: '__IMG_stage_s8_relic_1__', w: 62, h: 52 },
    s8_relic_2: { src: '__IMG_stage_s8_relic_2__', w: 62, h: 35 },
    s8_light_1: { src: '__IMG_stage_s8_light_1__', w: 56, h: 62 },
    s8_light_2: { src: '__IMG_stage_s8_light_2__', w: 38, h: 62 },
    s8_ruin_1: { src: '__IMG_stage_s8_ruin_1__', w: 62, h: 46 },
    s8_ruin_2: { src: '__IMG_stage_s8_ruin_2__', w: 62, h: 34 },
    card_s4_normal: { src: '__IMG_stage_card_s4_normal__' },
    card_s5_normal: { src: '__IMG_stage_card_s5_normal__' },
    // [UPDATE 2026-07-24] 시즌6(원계, 사신 문양) 카드 프레임 등록. 시즌7(장승 문양)은 스테이지 데이터 자체가
    // 아직 없어 미리 등록만 해둠(시즌8과 동일 패턴) — 나중에 wiring 필요.
    card_s6_normal: { src: '__IMG_stage_card_s6_normal__' },
    card_s7_normal: { src: '__IMG_stage_card_s7_normal__' },
    // [UPDATE 2026-07-22] 시즌8용으로 미리 등록 (시즌8 스테이지 데이터 자체는 아직 없음 — 나중에 wiring 필요)
    card_s8_normal: { src: '__IMG_stage_card_s8_normal__' },
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
      SPRITES.baksuProtagonist, // [UPDATE 2026-08-02] 파트2 주인공 스프라이트 프리로드
      ...SPRITES.baksuMotion, // [UPDATE 2026-08-04] 박수 3프레임 모션(대기/공격준비/공격) 프리로드
      // [UPDATE 2026-08-05] 애기씨 3프레임 모션 프리로드는 철회(위 aegissiMotion 정의 주석 참고) — 더 이상 로드 안 함
      ...SPRITES.talismanDefense, // [UPDATE 2026-08-03] 애기씨의 부적 열화 4단계 프리로드
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
      ...(SPRITES.endingS2 || []),
      ...(SPRITES.endingS3 || []),
      ...(SPRITES.endingS4 || []),
      ...(SPRITES.endingS5 || []),
      ...(SPRITES.endingS6 || []),
      ...(SPRITES.endingS7 || []), // [UPDATE 2026-07-31] 시즌7 엔딩 프리로드 누락 방지
      ...(SPRITES.endingS8 || []), // [UPDATE 2026-08-02] 시즌8(최종) 엔딩 프리로드
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




