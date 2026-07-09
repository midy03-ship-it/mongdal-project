# 몽달퇴마록 — 개발 현황 & 설계 정리
> 마지막 업데이트: 2026-06-25
> 빌드 파일: `mongdal-fixed.html` (27.9 MB, 단일 번들)
> 빌드 방법: `python mongdal/build.py`

---

## 1. 게임 개요

| 항목 | 내용 |
|------|------|
| 장르 | Vampire Survivors 스타일 모바일 로그라이트 |
| 세계관 | 한국 무속·민화 (귀인국, 8계, 외신의 침략) |
| 플레이어 | 애기씨 (마지막 무당) |
| 플랫폼 목표 | itch.io (모바일 브라우저 우선) |
| 해상도 | 390×844 고정 |
| 언어 | 한국어 / 영어 전환 지원 |

---

## 2. 기술 구조

```
mongdal-project/
├── mongdal/
│   ├── build.py              ← 단일 HTML 번들 빌드 스크립트
│   ├── css/style.css
│   ├── js/
│   │   ├── data/             config.js · sprite-config.js · game-data.js · monsters.js
│   │   ├── core/             save.js · lang.js · audio.js · unlock.js · scene-manager.js · input.js
│   │   ├── entities/         player.js · enemy.js · companion-entity.js · boss.js · pet-entity.js
│   │   ├── systems/          weapons.js · spawner.js · items.js · building-effects.js
│   │   └── scenes/           game.js · lobby.js · intro-scene.js · stage-select.js
│   │                         character.js · shop-scene.js · blacksmith-scene.js
│   │                         building-scene.js · dungeon-scene.js · player-scene.js · pet.js
│   └── image_total/sprites/  ← 이미지 소스 (build.py가 base64 주입)
├── mongdal-fixed.html        ← 배포용 풀 빌드 (27.9 MB)
└── mongdal-light.html        ← 모바일 테스트용 경량 빌드 (0.4 MB, 이미지/BGM 없음)
```

### 빌드 방식
- JS 파일들을 `JS_ORDER` 순서로 연결
- `__IMG_xxx__` 플레이스홀더 → base64 data URL 교체
- `__BGM_xxx__` 플레이스홀더 → base64 MP3 교체 (light 빌드는 빈 문자열)
- `__MON_xxx__` 플레이스홀더 → 몬스터/보스 이미지 교체

### 빌드 명령어

```bash
# 경량 빌드 (모바일 테스트용, 빠름)
"C:/Users/MS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" mongdal/build.py --light

# 풀 빌드 (배포용)
"C:/Users/MS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe" mongdal/build.py
```

### 핵심 설계 원칙
- **EFFECT_IMGS 우선 분기**: `Projectile.draw()`는 `if(_weaponImg)` → `else if(simg)` 순서. EFFECT_IMGS에 키가 있으면 무조건 첫 분기
- **srcType 분리**: 동료 발사체의 `type`(로직용)과 `srcType`(이미지 조회용)을 분리
- **세이브**: localStorage JSON, `Save.load()` / `Save.save()`

---

## 3. 씬 구성 (SceneManager)

| 씬 키 | 파일 | 역할 |
|--------|------|------|
| `langSelect` | lang-select.js | 첫 실행 언어 선택 |
| `intro` | intro-scene.js | 스토리 슬라이드 (7장) |
| `lobby` | lobby.js | 메인 허브 (2D 탑뷰, WASD/조이스틱) |
| `stageSelect` | stage-select.js | 스테이지 맵 선택 |
| `game` | game.js | 인게임 전투 |
| `character` | character.js | 동료 편성·강화 |
| `shop` | shop-scene.js | 동료 뽑기 상점 |
| `blacksmith` | blacksmith-scene.js | 무기 구매·강화 |
| `building` | building-scene.js | 로비 건물 업그레이드 |
| `dungeon` | dungeon-scene.js | 던전 모드 선택 |
| `playerScene` | player-scene.js | 주인공 스탯 강화 + 신목 영구강화 |
| `pet` | pet.js | 펫 관리 |
| `dev` | dev-scene.js | 개발자 디버그 |

---

## 4. 콘텐츠 현황

### 4-1. 스테이지
- 총 **50스테이지** (10챕터 × 5스테이지)
- 제한시간 300초, 킬 목표 달성 후 보스 등장
- 클리어 기준: `clearedStages` 배열에 스테이지 번호 저장

### 4-2. 무기 시스템

**주무기 5종** (대장간에서 구매·교체):

| ID | 이름 | 타입 |
|----|------|------|
| `talisman` | 부적 마법진 | 회전 발사, 관통 |
| `sword` | 신검 | 압축 베기 + 투척 |
| `bow` | 신궁 | 저격형, 관통 |
| `staff` | 무당 지팡이 | 오브 회전형 |
| `scythe_main` | 영혼낫 | 회전 낫 |

**각성 무기 5종** (주무기 최대강화 후 아이템 조합):

| ID | 이름 |
|----|------|
| `talisman_evo` | 각성 부적 (체인 번개) |
| `sword_evo` | 각성 신검 |
| `bow_evo` | 각성 신궁 |
| `staff_evo` | 각성 무당 지팡이 |
| `scythe_evo` | 각성 영혼낫 |

**서브무기 20종**:

| 카테고리 | 무기 |
|---------|------|
| attack | `bell` 무당방울 · `bead` 수행염주 · `thunder_drum` 천둥북 · `goblin_axe` 도깨비도끼 · `water_jet` 용왕물줄기 |
| area | `goblin_fire` 도깨비불 · `poison_mist` 독안개 · `holy_water` 성수웅덩이 · `ghost_hand` 귀신손 · `lightning_trap` 번개장판 |
| debuff | `scythe_sub` 저승낫 · `ice_amulet` 얼음부적 · `poison_needle` 독침 · `curse_doll` 저주인형 · `sealing_amulet` 봉인부적 |
| support | `heal_incense` 치유향 · `spirit_shield` 신령방패 · `hopaetag` 호패 · `karma_bead` 업구슬 · `shaman_drum` 무당북 |

### 4-3. 몬스터
**20종 설계**, 이미지: `sprites/enemies/`, `sprites/bosses/`

| 챕터 | 일반 몬스터 | 중간 보스 | 챕터 보스 |
|------|------------|---------|---------|
| 1 | 망령, 해골귀 | 도깨비대장 | 염라왕 |
| 2 | 구미호새끼, 해파리귀신 | 화염도깨비 | 수룡 |
| 3 | 설인, 독나방 | 독거미여왕 | 독왕 |
| 4 | 저주인형, 빙령 | 빙룡 | 빙신 |
| 5 | 돌귀신, 전기몬 | 번개신 | 폭풍귀왕 |
| 6~10 | 추가 예정 | | |

### 4-4. 플레이어 성장

- **인게임 레벨업**: XP → 스탯 자동 증가 + 무기 레벨업 선택지
- **로비 스탯 강화** (골드, 영구): ATK · DEF
- **신목 영구강화** (골드, 30스테이지 해금): 치명타확률 · 치명타배율 · 공격속도 · 이동속도 · 회피
- **의상 변화**: 5단계 (챕터 2/4/6/8 클리어 기준)

### 4-5. 동료 시스템

**총 11종** (커먼 1 / 레어 3 / 에픽 1 / 스페셜 6):

| ID | 이름 | 역할 | 등급 |
|----|------|------|------|
| `dochi` | 검객 도치 | 탱커 | rare |
| `aram` | 매 사냥꾼 아람 | 딜러 | rare |
| `ggeogsoe` | 도깨비 수리공 꺽쇠 | 서포터 | common |
| `danbi` | 단비 무당 | 힐러 | rare |
| `gaon` | 그림자 암살자 가온 | 암살자 | epic |
| `cheonga` | 용왕녀 청아 | 마법사 | special |
| `geumgang` | 금강 | 버서커 | special |
| `baekho` | 백호신 | 탱커 | special |
| `sohee` | 봉황 소희 | 딜러 | special |
| `mugsa` | 신검 무사 | 딜러 | special |
| `cheolgap` | 철갑 수호신 | 탱커 | special |

**각성 시스템**: 파편 5개 = 별 1개, 별 5개 = 각성 1성 (최대 5성)

### 4-6. 펫 시스템

**총 20종** (기존 8종 + 십이지신 12종):

기존 8종: `hoya` 호야 · `crow` 까마귀삼신 · `fox` 여우령 · `turtle` 거북령 · `chonggak` 총각신 · `tuju` 터주신 · `dokkaebi` 도깨비 · `rabbit` 달토끼

십이지신 12종: `zodiac_rat` 자신(쥐) · `zodiac_ox` 축신(소) · `zodiac_tiger` 인신(범) · `zodiac_rabbit` 묘신(토끼) · `zodiac_dragon` 진신(용) · `zodiac_snake` 사신(뱀) · `zodiac_horse` 오신(말) · `zodiac_goat` 미신(양) · `zodiac_monkey` 신신(원숭이) · `zodiac_rooster` 유신(닭) · `zodiac_dog` 술신(개) · `zodiac_pig` 해신(돼지)

**패시브 효과**: defense · crit · xp_boost · cooldown · magnet
**능동 효과**: regen · confuse · knockback · mark

### 4-7. 던전 모드

| 던전 | 해금 조건 | 재화 |
|------|---------|------|
| 강화석 던전 | 스테이지 5 | 강화석 |
| 무한 던전 | 스테이지 15 | 골드 |
| 보스러시 | 스테이지 15 | 골드 |
| 천운석 던전 | 스테이지 20 | 천운석 |
| 천령과 던전 | 스테이지 25 | 천령과 |
| 태극석 던전 | 스테이지 30 | 태극석 |

### 4-8. 건물 해금 구조

| 스테이지 | 건물 | 해금 내용 |
|---------|------|---------|
| 5 클리어 | 대장간 | 무기 구매·강화, 강화석 던전 |
| 10 클리어 | 의원당 | 동료 편성, 동료 상점 |
| 15 클리어 | 서낭당 | 무한던전, 보스러시 |
| 20 클리어 | 장승당 | 건물 업그레이드, 천운석 던전 |
| 25 클리어 | 용왕 연못 | 펫, 천령과 던전 |
| 30 클리어 | 신목 | 영구강화(신목), 태극석 던전 |

---

## 5. 세이브 데이터 구조

```javascript
{
  gold: 0,
  gems: 0,
  lobbyLevel: 1,
  companions: [],
  activeCompanions: [],
  pets: [],
  petLevels: {},
  activePets: [],
  weapons: [],
  clearedStages: [],
  clearedChapters: [],
  currentChapter: 1,
  buildings: {},
  totalKills: 0,
  runs: 0,
  unlockedWeapons: ['talisman'],
  weaponLevels: {},
  ganghwaseok: 0,
  cheonunseok: 0,
  cheonryeonggwa: 0,
  taegeukseok: 0,
  companionFragments: {},
  universalFragments: 0,
  companionStars: {},
  companionAwakening: {},
  statUpgrades: {},
  sinmokUpgrades: {},
}
```

---

## 6. 알려진 버그 패턴 (재발 방지)

| 패턴 | 원인 | 확인법 |
|------|------|--------|
| 엉뚱한 이미지로 폴백 | EFFECT_IMGS에 키 없음 → 다른 매핑 사용 | EFFECT_IMGS 키 먼저 확인 |
| draw() 분기 미실행 | `_weaponImg` 있으면 첫 분기 → simg 분기 도달 안 함 | EFFECT_IMGS 키 확인 후 위치 결정 |
| 이미지 회전 오류 | 원본이 "위쪽 기준"으로 그려진 경우 +90도 보정 필요 | Python으로 여러 각도 렌더링 비교 |
| 동료 사망 후 연출 멈춤 | `dead=true`일 때 update() skip 시 deathT 타이머 멈춤 | 죽은 객체도 update 호출, 전투 로직만 skip |
| 좌표 기준 오류 | `player.x/y`는 발밑 → 무기/이펙트는 `y-20` 보정 | |
| BGM light 빌드 SyntaxError | `'__BGM_xxx__'` 치환 시 따옴표 중복(`''''`) | build.py regex에 따옴표 포함해서 매칭 |

---

## 7. 앞으로 해야 할 것

### 🔴 즉시
- [ ] DEV_MODE → `false` 변경 후 배포 테스트
- [ ] 챕터별 진입 한 줄 텍스트 팝업 구현 (챕터 첫 스테이지 진입 시)

### 🟡 단기
- [ ] 일시정지 화면 개선 (현재 스탯 표시 + BGM/SFX 볼륨 슬라이더)
- [ ] 업적 시스템 구현 (섹션 11 스펙)
- [ ] 상점 다이아 교환 탭 추가 (섹션 12 스펙)
- [ ] 난이도 시스템 구현 (섹션 13 스펙)
- [ ] 인트로 슬라이드 배경 이미지 연결 (1~7.png)
- [ ] 로비 배경 단계별 이미지 연결
- [ ] 애기씨 5단계 의상 연결
- [ ] NPC 이미지 로비에 배치

### 🟢 중기
- [ ] 엔딩 씬 (챕터 10 클리어)
- [ ] 동료 각성 데이터 최신 테이블 업데이트
- [ ] 스페셜 동료 statMult 추가

### ⚪ 장기 (시즌1 완성 후)
- [ ] SFX 효과음 전체
- [ ] 시즌2 — 망랑계/선계 콘텐츠
- [ ] itch.io 정식 배포

### 필요한 이미지 에셋

**✅ 완성:**
```
로비 배경 8장 (lobby_1~8.png)
NPC 이미지 7종
애기씨 5단계 의상 (aegissi_stage1~5.png)
aegissi_gameover.png
인트로 슬라이드 배경 7장
```

**🔜 시즌2 이후:**
```
망랑계/선계 스테이지 배경, 몬스터, NPC
```

---

## 8. 파일 크기 현황

| 파일 | 용량 | 용도 |
|------|------|------|
| `mongdal-fixed.html` | 27.9 MB | 배포용 풀 빌드 |
| `mongdal-light.html` | 0.4 MB | 모바일 테스트용 (이미지/BGM 없음) |

| 구성 요소 | 용량 |
|----------|------|
| JS 전체 로직 | ~400 KB |
| CSS | ~30 KB |
| 이미지 (base64) | ~27 MB |

---

## 9. 개발 워크플로

```
평일 낮 (모바일)
  └─ mongdal-light.html 열어서 플레이/버그 확인
  └─ DEVLOG.md "변경 메모" 섹션에 발견한 것 기록

평일 저녁 / 주말 (PC + Claude Code)
  └─ 변경 메모 → JS 소스 수정
  └─ python build.py --light  → 빠른 확인
  └─ python build.py          → 최종 빌드
  └─ PATCHNOTES.md 업데이트
```

---

## 10. 문서 현황

| 문서 | 용도 |
|------|------|
| `CLAUDE.md` | Claude Code 운영 매뉴얼 |
| `DEVLOG.md` | 개발 현황 & 설계 정리 (이 파일) |
| `PATCHNOTES.md` | 버전별 패치 내역 |
| `WORLDBUILDING.md` | 세계관 설정집 (8계, 캐릭터, 시즌 서사) |

---

## 11. 업적 시스템 스펙

### 1회성 업적

| id | 조건 | 보상 |
|----|------|------|
| `first_win` | 최초 스테이지 클리어 | 다이아 3 |
| `first_lose` | 최초 패배 | 다이아 1 |
| `first_boss` | 최초 보스 처치 | 다이아 3 |
| `first_companion` | 최초 동료 편성 | 다이아 2 |
| `first_pet` | 최초 펫 획득 | 다이아 2 |
| `first_building` | 최초 건물 강화 | 다이아 2 |
| `first_evolve` | 최초 무기 각성 | 다이아 5 |
| `all_chapters` | 전 챕터 (1~10) 클리어 | 다이아 10 |

### 누적 마일스톤

| id | 단계별 조건 | 단계별 보상 |
|----|------------|------------|
| `total_kills` | 100 / 500 / 1000 / 5000 / 10000 | 다이아 1/1/2/3/5 |
| `total_wins` | 10 / 50 / 100 | 다이아 1/2/3 |
| `total_runs` | 10 / 50 / 100 | 다이아 1/2/3 |

---

## 12. 상점 다이아 교환 탭 스펙

| 교환 | 비용 | 획득 |
|------|------|------|
| 골드 교환 | 다이아 1 | 골드 500 |
| 강화석 교환 | 다이아 2 | 강화석 1 |
| 천운석 교환 | 다이아 5 | 천운석 1 |
| 만능파편 교환 | 다이아 3 | 만능파편 1 |
| 천령과 교환 | 다이아 4 | 천령과 1 |

---

## 13. 난이도 시스템 스펙

```
이지    주무기 1 / 서브 3 / 동료 1 / 펫 1  + 몹 × 0.7
노말    주무기 2 / 서브 3 / 동료 2 / 펫 1  + 몹 × 1.0
하드    주무기 3 / 서브 3 / 동료 3 / 펫 1  + 몹 × 1.5
```

보상: 이지 골드×0.7 / 노말 골드×1.0 / 하드 골드×1.5 + 다이아
해금: 이지/노말 처음부터, 하드는 해당 챕터 노말 클리어 후

---

## 14. 변경 메모 (모바일에서 기록)

> 평일 낮 모바일 테스트 중 발견한 것을 간단히 적는 공간.

- 2026-06-25: DEV_MODE 여전히 true — PC에서 수정 필요
