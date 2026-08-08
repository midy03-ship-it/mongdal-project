# 몽달퇴마록 패치노트

## v1.1.1 — 파트2 안정화 (2026-08-08)

### Bug Fixes / 버그 수정
- **Part 2's auto-progress kept getting interrupted.** Since Part 2 runs on a completely separate fresh save, the "first clear ever" and "slot unlocked" popups from Stages 1/5/10/15/20/25/30/110/160 fired all over again — even though every Part 2 player already saw them in Part 1 — kicking auto/semi-auto/auto-retry mode back to the lobby at every one of those stages. These milestone popups are now skipped for Part 2; the story-critical ones at Stage 100/200/300/400/500/600/700/800 still trigger as always.
  **파트2 자동진행이 계속 끊기던 문제를 수정했습니다.** 파트2가 완전 별도의 신규 세이브로 동작하다 보니, 스테이지 1/5/10/15/20/25/30/110/160의 "생애 첫 클리어"·"슬롯 해금" 안내 팝업이 파트1에서 이미 다 본 내용임에도 다시 떠서, 자동/반자동/자동재도전 모드가 매번 로비로 튕겨나갔습니다. 이제 파트2에서는 이 마일스톤 팝업들을 건너뛰며, 스토리 진행상 중요한 100/200/300/400/500/600/700/800 스테이지의 시즌엔딩 트리거는 그대로 유지됩니다.
- **A few UI labels stayed in Korean regardless of language setting.** Notably the Shop's gacha pull-count buttons (1-pull / 10-pull / 100-pull). Found and fixed while centralizing more screens' text (Building, Dungeon, Character, Pet, Vault, Shop) into the shared text system for easier future editing.
  **언어 설정과 무관하게 한국어로 고정 표시되던 일부 UI 라벨을 수정했습니다.** 대표적으로 상점의 뽑기 횟수 버튼(1회/10회/100회)입니다. 건물·던전·캐릭터·펫·금고·상점 화면의 텍스트를 공용 텍스트 시스템으로 옮기는 작업 중 함께 발견해 수정했습니다.

### In Progress / 진행 중
- Part 2's season-ending cutscenes are being reworked for Baksu's perspective (Part 1's endings are all written from Aegissi's viewpoint, which doesn't fit a character who already knows the full truth). Not yet included in this patch.
  파트2 시즌 엔딩 컷씬을 박수 시점으로 새로 다듬는 작업을 진행 중입니다(파트1 엔딩은 전부 애기씨 시점이라, 이미 모든 사실을 아는 박수에게는 맞지 않습니다). 이번 패치에는 아직 포함되지 않았습니다.

## v1.1.0 — 파트2 오픈 (2026-08-06)

### Story / 스토리
- **Part 2 has begun.** Clear every one of the 8 dungeon types once and unlock all 5 main weapons, and a new crack appears in the lobby. What's on the other side, we'll leave for you to find out.
  **파트2가 시작되었습니다.** 8종 던전을 전부 한 번씩 클리어하고 주무기 5종을 모두 해금하면 로비에 새로운 균열이 나타납니다. 그 너머에 무엇이 있는지는 직접 확인해보세요.

### New Systems / 신규 시스템
- **Guardian Talisman.** Part 2 introduces a stationary object planted near your starting point — some enemies ignore you entirely and go straight for it instead. If it falls, the run ends immediately. Strengthen its durability and power at the Blacksmith. When it drifts off-screen, a corner monitor (📹) keeps you posted on its status, and a warning appears the first time its HP drops below 30%.
  **수호 부적.** 파트2에서는 시작 지점 근처에 고정된 오브젝트가 등장하며, 일부 몬스터는 플레이어를 무시하고 이것부터 노립니다. 파괴되면 그 즉시 패배 처리됩니다. 대장간에서 내구도와 위력을 강화할 수 있고, 화면 밖으로 나가면 구석에 감시 카메라(📹)가 떠서 상태를 계속 알려주며, HP가 30% 밑으로 처음 떨어지면 경고가 뜹니다.

### Quality of Life / 편의성 개선
- **Bulk upgrades.** Character stat upgrades (ATK/DEF/HP...) now offer ×1/×10/×100 buttons, and Blacksmith weapon enhancement offers ×1/×10 — grinding a stat up many levels no longer means tapping the same button dozens of times.
  **일괄 강화.** 캐릭터 스탯 강화(ATK/DEF/HP 등)에 ×1/×10/×100 버튼이, 대장간 무기 강화에 ×1/×10 버튼이 추가되었습니다 — 레벨을 여러 번 올리려고 같은 버튼을 수십 번 누를 필요가 없어졌습니다.
- **Large numbers now compress (k/m/b/t).** Gold, every other currency, and the damage meter switch to compact notation (e.g. 20.48m) once they pass 1,000, instead of growing into long strings of digits that could run off the edge of the screen.
  **큰 숫자가 k/m/b/t 단위로 압축 표시됩니다.** 골드를 비롯한 모든 재화와 데미지 미터가 1,000을 넘으면 축약 표기(예: 20.48m)로 바뀌어, 자릿수가 계속 늘어나며 화면 밖으로 밀려나던 문제가 없어졌습니다.
- **Companion Gacha: new 100+10 pull.** Joins the existing 1-pull and 10+1-pull options, at the same rate (10× the cost of a 10-pull).
  **동료 뽑기 100+10회 추가.** 기존 1회·10+1회 옵션에 이어서, 10회 뽑기와 동일한 비율(10배 비용)로 추가되었습니다.
- Smoother idle/attack animation for Part 2's new playable character.
  파트2 신규 플레이 캐릭터의 대기/공격 모션이 더 자연스러워졌습니다.

## v1.0.0 — 파트1 완결 (2026-08-02)

### Story / 스토리
- 🎊 **Part 1 is complete.** The Ruined Realm (황계, Season 8) now has its true ending — a 10-scene finale that carries directly from "In all the cosmos, she alone had been alone" through to the epilogue, closing the story that began with the Prologue. Plays automatically on your first clear, and can be revisited anytime from the crack near the Sacred Tree in the lobby.
  🎊 **파트1이 완결되었습니다.** 황계(시즌8)에 진짜 결말이 생겼습니다 — "전 우주를 통틀어, 혼자만이 혼자였다"에서 이어지는 10장짜리 엔딩이 서막에서 시작된 이야기를 마무리합니다. 최초 클리어 시 자동 재생되며, 로비 신목 옆 균열(기억의 공간)에서 언제든 다시 볼 수 있습니다.
- A new memory fragment for Season 8 has been added to the Memory Hall.
  기억의 공간(로비 균열)에 시즌8 기억 조각이 추가되었습니다.
- We don't know yet what comes next — but the ending leaves a door open. Thank you for playing this far.
  다음 이야기가 어떻게 될지는 아직 정해지지 않았습니다 — 다만 엔딩은 문을 하나 열어두고 끝납니다. 여기까지 플레이해주셔서 감사합니다.

### Changes / 변경사항
- **"Season Complete" is back for real playthroughs, gone for Memory Hall replays.** Clearing a season in-game shows the "Season N Complete / Tap to continue" card again; replaying an ending from the lobby's Memory Hall skips straight to the lobby, same as before.
  **실제 클리어 엔딩에는 "시즌 N 완료" 카드가 돌아오고, 기억의 공간 재생에는 계속 안 뜹니다.** 인게임에서 시즌을 클리어하면 "시즌 N 완료 / 탭하여 계속" 카드가 다시 표시되고, 로비 기억의 공간에서 엔딩을 다시 볼 때는 이전처럼 카드 없이 바로 로비로 돌아갑니다.

### Bug Fixes / 버그 수정
- **The Ruined Realm (황계) never appeared as its own dimension.** All 10 of its chapters (71–80) were missing the tag that assigns them to Season 8, so the dimension map's Season 8 tab showed nothing, and those chapters were silently miscounted as part of Season 1. Fixed.
  **황계가 독립된 계로 표시되지 않고 있었습니다.** 챕터 71~80 전부에 시즌8 소속 태그가 빠져 있어, 차원 지도의 시즌8 탭이 텅 비어 보이고 해당 챕터들은 시즌1로 잘못 집계되고 있었습니다. 수정했습니다.
- **Ruined Realm elites got stronger deeper in, backwards from every other enemy there.** Regular monsters follow the intended reversed curve (hardest at Stage 701, easing off toward 800), but the 5 elites did the opposite — climbing from Stage 701 to 800. Their stats are now flipped to match: strongest at 701, weakest at 800.
  **황계 엘리트만 다른 몬스터와 반대로, 깊이 들어갈수록 강해지고 있었습니다.** 일반 몬스터는 의도한 대로 701이 최고난도이고 800으로 갈수록 쉬워지는데, 엘리트 5종만 701에서 800으로 갈수록 오히려 강해지고 있었습니다. 701이 가장 강하고 800이 가장 약하도록 스탯을 뒤집었습니다.
- **Ruined Realm monsters were calibrated for a buff that no longer exists there.** Stage 701's stats continued directly from the Outer Realm's deliberate ×100 power spike (needed there because of the Blessing buff), but the Blessing provides no buff at all in the Ruined Realm — only a penalty, at best neutral at 0 corruption. So even with corruption fully purified, monster stats were still ~100× beyond what permanent (non-blessed) progression could reach. All Stage 701–800 monster/boss/elite stats have been rescaled to the curve's pre-spike baseline, preserving the existing peak-at-701-declining-to-800 shape.
  **황계 몬스터 스탯이 이제는 없는 버프를 기준으로 짜여 있었습니다.** 701 스테이지 수치가 어계의 의도적 ×100 스파이크(축복 버프가 있어야 상대 가능했던 구간)를 그대로 이어받고 있었는데, 정작 황계에서는 축복이 버프를 전혀 주지 않고(오염도 0이어도 그냥 1배) 페널티로만 작동합니다. 그래서 오염도를 완전히 정화해도 몬스터 스탯은 여전히 순수 성장으로 도달 불가능한 어계 말기 수준이었습니다. 701~800 전 구간의 몬스터·보스·엘리트 스탯을 스파이크 이전 기준으로 재조정했습니다(701이 정점, 800으로 갈수록 약해지는 기존 곡선 형태는 그대로 유지).
- **Corruption only purified on Stage 701 — every other Ruined Realm stage was a dead zone.** Once you moved past 701, wins and losses stopped reducing corruption entirely, so any leftover corruption became a permanent, unremovable penalty for the rest of the Ruined Realm. Purification now applies across all of Stage 701–800, win or lose, exactly as originally intended.
  **오염도 정화가 701 스테이지에만 걸려 있어, 그 이후 스테이지에서는 승패와 무관하게 전혀 정화되지 않고 있었습니다.** 701을 넘어간 순간부터 남은 오염도는 황계 끝까지 지워지지 않는 영구 페널티가 되고 있었습니다. 이제 701~800 전 구간에서 승패와 무관하게 정화됩니다.
- **Corruption was invisible.** The penalty from the Outer Realm's Blessing turning into corruption in the Ruined Realm was fully working under the hood, but nothing on screen ever told you it was there or that it was being purified. The Ruined Realm's stage-select screen now shows how much corruption you're carrying and its effect on your combat power, and clearing (or even losing) Stage 701 now shows exactly how much was purified. A one-time notice also appears on your first step into the Ruined Realm while still carrying corruption, for players who skip cutscenes and missed the Outer Realm ending's warning.
  **오염도가 보이지 않고 있었습니다.** 어계의 축복이 황계에서 오염도로 뒤집혀 전투력을 깎는 시스템 자체는 내부적으로 정상 동작하고 있었지만, 화면 어디에도 이를 알려주는 표시가 없었습니다. 이제 황계 스테이지 선택 화면에서 보유 오염도와 그로 인한 전투력 감소를, 701 스테이지 도전(승패 무관) 후에는 실제 정화량을 확인할 수 있습니다. 엔딩을 넘겨서 어계 엔딩의 경고를 놓친 플레이어를 위해, 오염도를 보유한 채 황계에 처음 발을 들이면 1회 안내 토스트도 뜹니다.

## v0.6.0 (2026-07-31)

### New Features / 신규 기능
- 🎉 **Season 7, the Outer Realm (어계), is now open** — 10 new chapters (61–70) with 20 monsters, 10 mid-bosses, 10 chapter bosses, 5 elites, dedicated terrain, and a 5-slide ending. Every boss and monster has its own artwork.
  🎉 **시즌7 어계가 공개되었습니다** — 챕터 61~70에 몬스터 20종, 중간보스 10종, 챕터보스 10종, 엘리트 5종, 전용 지형, 엔딩 5장이 포함됩니다. 보스와 몬스터 전부 전용 일러스트를 갖췄습니다.
- **The Blessing of Shub-Niggurath.** The Outer Realm sits roughly 100× beyond the normal power curve — ordinary growth will not carry you through its first stage. A new NPC, **Great Ith**, sells blessings for a single gold each, up to 1,000. Each one multiplies your combat coefficient, and it is the only way in.
  **슈브니구라스의 축복.** 어계는 기존 성장 곡선의 약 100배 구간이라 정상적인 육성으로는 1스테이지도 넘기 어렵습니다. 신규 NPC **그레이트 이스**가 축복을 개당 단돈 1골드에, 최대 1,000개까지 팝니다. 하나마다 전투 계수가 곱해지며, 이것이 어계를 뚫는 유일한 수단입니다.
- ...but the blessing never leaves you. It accumulates in your save as **corruption**, and in the realm beyond the Outer Realm it inverts into a penalty on the very same scale. Farming the Outer Realm without blessings is pointless too — the experience gained there scales with how many you hold. Buy what you need.
  ...다만 축복은 사라지지 않습니다. 세이브에 **오염도**로 영구히 쌓이고, 어계 너머의 계에서는 같은 크기의 페널티로 뒤집힙니다. 축복 없이 어계를 도는 것도 의미가 없습니다 — 그곳의 획득 경험치가 보유량에 비례하기 때문입니다. 필요한 만큼만 사십시오.
- **Two new companions and two new pets**, including the game's first **Mythos**-grade units — Cheonja, one of the Great Mother's thousand young, and the Nameless, a small thing no one manages to remember.
  **신규 동료 2종·펫 2종.** 게임 최초의 **미소스** 등급이 포함됩니다 — 태모의 천 마리 새끼 중 하나인 천자, 그리고 아무도 기억하지 못하는 작은 것 무명입니다.
- **15 new elite monsters** across chapters 51–80, each with dedicated artwork. Previously a single elite covered an entire 10-chapter span.
  챕터 51~80 구간에 **엘리트 몬스터 15종**을 전용 일러스트와 함께 추가했습니다. 기존에는 엘리트 1종이 10개 챕터를 통째로 담당했습니다.

### Performance / 성능
- **Fixed the freeze that struck around 130 kills in the Celestial and Primal Realms.** The number of XP orbs dropped per kill was tied to the monster's experience value, so it grew without any limit as chapters advanced — 263 orbs per kill in the Celestial Realm, 1,057 in the Primal Realm, 387,500 in the Outer Realm. Every one of them was updated and drawn each frame. Orbs per kill are now capped; the experience you receive is unchanged.
  **선계·원계에서 130킬 부근부터 발생하던 멈춤 현상을 수정했습니다.** 처치 시 생성되는 경험치 오브 개수가 몬스터의 경험치 값에 비례해 상한 없이 늘어나고 있었습니다 — 선계 263개, 원계 1,057개, 어계는 387,500개였습니다. 이 오브 전부가 매 프레임 갱신·렌더 대상이었습니다. 이제 처치당 오브 개수에 상한을 두며, 획득 경험치 총량은 그대로입니다.
- Rebuilt the projectile–enemy hit test: **5.3× faster with identical results.** With around 900 enemies on screen this test runs tens of thousands of times per frame.
  투사체–적 충돌 판정을 재작성했습니다 — **5.3배 빨라졌고 판정 결과는 동일**합니다. 적이 900마리 규모일 때 이 판정은 프레임당 수만 번 실행됩니다.
- Homing weapons (Bow, Talisman) were rebuilding a full enemy array every frame, for every projectile in flight. Removed. The damage meter's per-hit logging was also replaced with time-bucketed accumulation.
  유도가 붙은 무기(활·부적)가 비행 중인 투사체마다 매 프레임 적 배열을 통째로 새로 만들고 있었습니다. 제거했습니다. 데미지 미터의 히트별 기록도 시간 단위 누적으로 교체했습니다.

### Bug Fixes / 버그 수정
- **Critical hits never worked as displayed — in four separate ways.** The pause screen read a stat that does not exist, so it always showed 0%. Pet crit bonuses were applied at 1/100 of their stated value, meaning a pet reading "+25% Crit" actually granted +0.25%. And the crit awakening on five companions (Baksu, Void Swordsman, Gaon, Gangnim, Plum Blossom Sword Immortal) was stored but never rolled, leaving that entire awakening tier without effect. All four are fixed.
  **치명타가 네 가지 경로에서 제대로 동작하지 않았습니다.** 일시정지 화면이 존재하지 않는 스탯을 읽어 항상 0%로 표시되었고, 펫의 치명타 보너스는 표기값의 1/100로 적용되어 "+25%" 펫이 실제로는 +0.25%만 주고 있었습니다. 동료 5종(박수·허무검사·가온·강림차사·매화검선)의 치명타 각성은 저장만 되고 판정에 쓰이지 않아 해당 각성 단계가 아무 효과가 없었습니다. 네 가지 모두 수정했습니다.
- **Chapters 51–70 were spawning Season 1's monsters.** The per-chapter spawn table stopped at chapter 50, so the Primal Realm — already released in v0.5.1 — was filling with wraiths and vengeful spirits from the opening chapters. All 20 chapters now spawn their intended monsters.
  **챕터 51~70에서 시즌1 몬스터가 나오고 있었습니다.** 챕터별 스폰 표가 챕터50에서 끊겨 있어, v0.5.1로 이미 공개된 원계가 초반부의 망령·원귀로 채워지고 있었습니다. 20개 챕터 전부 의도한 몬스터가 나오도록 수정했습니다.
- **The Primal Realm's ending never played.** Its five slides were fully written and illustrated, but nothing ever triggered them — clearing Season 6 simply returned you to the lobby. Fixed for Seasons 6 and 7 both.
  **원계 엔딩이 재생되지 않았습니다.** 5장의 슬라이드가 대사·원화까지 완성돼 있었는데 이를 실행시키는 부분이 없어, 시즌6을 클리어해도 그냥 로비로 돌아갔습니다. 시즌6·7 모두 수정했습니다.
- The XP bar could read several thousand percent. Gaining experience only ever granted one level per pickup, so any surplus stayed in the bar instead of converting. Level-ups now resolve fully, and a level-up card appears for each level gained.
  경험치 바가 수천 %로 표시될 수 있었습니다. 경험치 획득 시 한 번에 한 레벨만 오르도록 되어 있어 초과분이 레벨로 전환되지 않고 바에 남았습니다. 이제 레벨업이 끝까지 처리되며, 오른 레벨 수만큼 레벨업 카드가 나옵니다.
- The Outer Realm's first stage opened at a kill target of 201 rather than resetting to the usual season-opening value, and its monsters granted 100× the experience of the previous chapter — enough for one kill to blow past dozens of levels. Both now follow the curve every other season uses.
  어계 첫 스테이지의 킬 목표가 시즌 시작값으로 초기화되지 않고 201에서 시작했고, 몬스터 경험치도 직전 챕터의 100배여서 한 마리만 잡아도 수십 레벨이 한꺼번에 올랐습니다. 둘 다 다른 시즌과 동일한 곡선을 따르도록 맞췄습니다.
- Vault specialty items for Seasons 5, 6 and 7 never dropped. All three were fully defined with icons and stat effects, but the drop table stopped at Season 4 — leaving the Celestial, Primal and Outer Realms with nothing to collect.
  시즌5·6·7의 보물창고 특산품이 드랍되지 않았습니다. 세 종류 모두 아이콘·효과까지 완비돼 있었지만 드랍 판정이 시즌4에서 끊겨 있어, 선계·원계·어계 전부 모을 수 있는 특산품이 없었습니다.
- Companion fragments above Legendary could never be exchanged — the exchange table only covered five grades, so higher-grade fragments silently became dead weight. Extended to all seven grades.
  레전더리 위 등급의 동료 파편이 교환 자체가 불가능했습니다 — 교환표가 5단계까지만 있어서 그 위 등급 파편은 조용히 사장되었습니다. 7단계 전부로 확장했습니다.
- Importing a save code overwrote your progress with no way back. Your previous save is now backed up automatically, and can be restored once from Settings.
  세이브 코드를 불러오면 기존 진행도가 되돌릴 수 없이 덮어써졌습니다. 이제 덮어쓰기 직전에 자동 백업되며, 설정에서 1회 복구할 수 있습니다.
- The exported save code had been reporting version 0.3.1.4 regardless of the actual game version.
  내보낸 세이브 코드가 실제 버전과 무관하게 계속 0.3.1.4로 표시되던 문제를 수정했습니다.

### UI / 화면
- XP orbs now show their three visual tiers as intended. Because of the orb-count bug above, every orb in the game had always been worth the same small amount — so the crystal and flame variants had literally never appeared on screen until now.
  경험치 오브의 3단계 시각 등급이 의도대로 표시됩니다. 위의 오브 개수 문제 때문에 그동안 모든 오브의 값이 똑같이 낮았고, 그 결과 크리스탈·불꽃 형태는 지금까지 화면에 한 번도 나온 적이 없었습니다.
- While the Blessing is active, the pause screen shows your current combat coefficient. It multiplies attack and divides incoming damage by the same amount, so your HP number does not change even though your survivability does.
  축복이 적용 중이면 일시정지 화면에 현재 전투 계수가 표시됩니다. 공격력을 곱하고 받는 피해를 같은 값으로 나누는 방식이라, 생존력이 올라가도 체력 숫자 자체는 변하지 않기 때문입니다.

## v0.5.1 (2026-07-29)

### New Features / 신규 기능
- 🎉 Season 6, the Primordial Realm (원계), is now officially open!
  🎉 시즌6 원계가 정식으로 공개되었습니다!
- Added 15 new elite monsters spanning chapters 51–80 (Primordial Realm, Outer Realm, and the not-yet-released final season), each with dedicated artwork, replacing the old catch-all single elite that covered a full 10-chapter span.
  챕터 51~80(원계·어계·아직 미공개인 최종 시즌)에 걸쳐 전용 일러스트를 갖춘 엘리트 몬스터 15종을 신규 추가했습니다 — 기존엔 10챕터를 통째로 엘리트 1종이 담당하던 것을 세분화했습니다.
- Added 24 new dedicated floor decorations for the Primordial Realm and Outer Realm — previously these seasons temporarily borrowed Season 4's decoration set.
  원계·어계 전용 바닥 장식 24종을 신규 추가했습니다 — 기존엔 두 시즌 모두 시즌4의 장식 세트를 임시로 재사용하고 있었습니다.

### Bug Fixes / 버그 수정
- Clearing Season 6 or 7 never actually flagged them as cleared in the save file, which meant Season 7's unlock condition could never be satisfied even with a complete Season 6 clear. Fixed.
  시즌6·7을 클리어해도 세이브에 클리어 여부가 기록되지 않아, 시즌6을 완주해도 시즌7 잠금 해제 조건이 영원히 충족될 수 없었던 문제를 수정했습니다.
- Floor tint for chapters 51 and beyond was silently falling back to Season 2's palette instead of getting its own colors. Fixed.
  챕터51 이후 바닥 색상이 전용 팔레트 없이 시즌2 색상으로 새고 있던 문제를 수정했습니다.
- Elites for chapters 51 and beyond kept falling back to Season 5's elite (the Vermilion Bird) instead of spawning anything season-appropriate. Fixed (see New Features above).
  챕터51 이후 엘리트 몬스터가 시즌5의 엘리트(주작)로 계속 폴백되던 문제를 수정했습니다(위 신규 기능 항목 참고).

## v0.5.0 (2026-07-28)

### New Features / 신규 기능
- The Law system (Primordial Realm) is now fully realized — all 12 Laws have their own dedicated visual effects (previously 6 had none, and the other 4 borrowed effects from unrelated weapons). Every Law now shows a distinct burst effect when it triggers.
  법칙 시스템(원계)이 완성되었습니다 — 12종 법칙 전부 전용 이펙트를 갖췄습니다(기존엔 6종은 아무 연출이 없었고, 나머지 4종은 관계없는 무기 이펙트를 재활용하고 있었습니다). 이제 모든 법칙이 발동 시 고유한 이펙트를 보여줍니다.

### Balance / 밸런스
- Auto mode now prioritizes the subweapon tied to an active hidden synergy (e.g. picks the Dragon King's Whirlpool first when the Cheonga×Drago combo is active) — previously it had no special priority even when that combo was live.
  자동 모드가 활성화된 히든 시너지와 연동된 보조무기를 최우선으로 선택하도록 했습니다(예: 청아×드라고 조합이 켜져 있으면 용왕 물줄기를 최우선 선택) — 기존엔 해당 조합이 켜져 있어도 우선순위가 없었습니다.
- Increased Ghost Hand's hidden-synergy size bonus (Hwansaengdongja × Soul Ember) from ×1.4 to ×2.1.
  귀신손의 히든 시너지 크기 보너스(환생동자×영혼불씨)를 ×1.4에서 ×2.1로 늘렸습니다.
- The Saengryeong×Sohee hidden synergy now orbits much more slowly and always faces toward Saengryeong instead of a fixed direction.
  생령×봉황 히든 시너지에서 봉황이 도는 속도를 훨씬 느리게 하고, 고정된 방향 대신 항상 생령 쪽을 바라보도록 했습니다.

### Bug Fixes / 버그 수정
- Companion attack and ultimate effects could render far too small at low star levels (as small as 4px), making some hidden-synergy effects (like Haewonmaek/Gangnim's boss-rush ultimate spam) nearly invisible. All companion effects now have a guaranteed minimum size regardless of star level.
  동료의 공격/궁극기 이펙트가 별 레벨이 낮으면 지나치게 작게(4px까지) 그려져서, 일부 히든 시너지(해원맥/강림차사의 보스 러시 궁극기 남발 등)가 사실상 안 보이는 문제가 있었습니다. 이제 모든 동료 이펙트가 별 레벨과 무관하게 최소 크기를 보장합니다.

## v0.4.3 (2026-07-26)

### Balance / 밸런스
- Reworked achievement infinite-milestone rewards to flat, predictable rates instead of ever-growing tier scaling (1,000 kills = 5 diamonds, 1 boss kill = 2 diamonds, every 10 clears = 3 diamonds, every 10 runs = 3 diamonds). Also capped backlog claims at 20 tiers per press, so a long-neglected save can't cash out a huge lump sum in one click.
  업적 무한 마일스톤 보상을 티어에 따라 계속 커지는 방식 대신 완전 고정값으로 재설계했습니다(누적킬 1,000당 다이아 5개, 보스 1마리당 2개, 클리어/출격 10회당 각 3개). 또한 한 번에 최대 20티어까지만 몰아 받도록 캡을 걸어서, 오래 밀린 세이브가 한 방에 폭발적으로 받는 일이 없도록 했습니다.

### UI / 화면
- Redesigned the Dimensional Merchant — the old fixed-quantity exchange buttons are now 3 slider+keypad widgets (Dimension Stones, Soul Stones, Seongi Stones) where you type or drag to the exact amount you want and buy it all in one go. Removed the Dimension Stone → Soul Stone exchange (Soul Fragments now drop generously across every season, making it redundant).
  차원 상인 UI를 개편했습니다 — 고정 수량 교환 버튼 대신, 원하는 개수를 직접 입력하거나 드래그해서 한 번에 구매하는 슬라이더+키패드 위젯 3종(차원석/영혼석/선기석)으로 바뀌었습니다. 차원석→영혼석 교환은 삭제했습니다(영혼조각이 이제 전 시즌에서 넉넉히 드랍되어 중복이라 판단했습니다).
- Added a warning indicator to the Dimension Stone HUD counter — a pulsing ⚠️ when running low, and a persistent 💀 label while the corruption penalty is active, so it's no longer a mystery why you're suddenly being punished mid-run.
  차원석 HUD 표시에 경고 아이콘을 추가했습니다 — 잔량이 부족하면 맥동하는 ⚠️, "잠식" 디버프가 실제로 발동 중이면 상시 💀 라벨이 뜹니다. 플레이 중 갑자기 불이익을 받는 이유를 더 이상 모르실 일 없게 했습니다.
- Discovering a hidden synergy for the first time now shows a small "🔮 Hidden Synergy Discovered!" toast — no spoilers on what it does, just a nudge that something happened.
  히든 시너지를 처음 발견하면 "🔮 숨겨진 시너지 발견!" 토스트가 살짝 뜹니다 — 어떤 효과인지는 알려주지 않고, 뭔가 발동했다는 신호만 줍니다.

[원계를 열심히 만들고 있습니다! 완성되면 공개할게요! 조금만 기다려 주세요! 원계에서는 다양한 법칙 아티팩트를 장착하는 시스템이 적용됩니다!]
[Working hard on the Primordial Realm (원계)! I'll reveal it once it's ready — hang tight! It'll bring a whole system for equipping various Law artifacts.]

## v0.4.2.1 (2026-07-26) — 긴급 패치

- The new infinite-milestone achievements were paying out way too many diamonds, especially on save files with a lot of accumulated progress. Toned the reward down. Diamonds you've already earned are untouched.
  신규 무한 반복 업적의 다이아 보상이 과도하게 지급되고 있었습니다(누적 진행도가 큰 세이브일수록 특히). 보상량을 낮췄습니다. 이미 지급받은 다이아는 그대로 유지됩니다.

## v0.4.2 (2026-07-26)

### New Features / 신규 기능
- 🕵️ Did you know hidden content was already in the game? This update quietly makes it even richer. What triggers what? You'll have to find out yourself 😏
  🕵️ 히든이 원래 있었던 거 아세요? 아무도 모르게 조용히 심어둔 히든 시너지들이 이번 업데이트로 훨씬 더 풍부해졌습니다. 어떤 조합이 어떤 효과를 낼지는... 직접 찾아보셔야 합니다 😏
- Bosses gained 4 new attack patterns (expanding ring burst, homing orbs, spread shot, chain lightning), distributed across seasons by difficulty.
  보스에게 신규 공격 패턴 4종(고리형 폭발, 유도 구슬, 직선 산탄, 연쇄 낙뢰)이 추가되었습니다. 난이도에 맞춰 시즌별로 배분했습니다.
- Achievements have been reworked: alongside the existing one-time achievements, 4 new "infinite milestone" tracks (total kills, chapter bosses defeated, total clears, total runs) keep raising their own bar and paying out again every time you clear it.
  업적 시스템을 개편했습니다: 기존 일회성 업적에 더해, 클리어할 때마다 목표가 계속 올라가며 계속 보상을 주는 "무한 반복형" 마일스톤 4종(누적 처치 수, 챕터 보스 처치, 총 클리어, 총 출격)이 추가되었습니다.

### Balance / 밸런스
- Renamed 12 companions to their shorter, more familiar forms in menus and UI (e.g. "Baby Dokkaebi Shaman Baksu" → "Baksu"). Also rebalanced the elemental affinity of 3 companions (Heomugeomsa, Janggu-aebi, Hwansaengdongja) to better fit their kit.
  동료 12종의 표기를 더 짧고 익숙한 이름으로 바꿨습니다(예: "애기 도깨비 박수" → "박수"). 동료 3종(허무검사, 장구애비, 환생 동자)의 오행 속성도 각자의 스타일에 맞게 재조정했습니다.

### Bug Fixes / 버그 수정
- Ranged boss attacks (shockwave, spiral, glitch barrage, teleport strike, and more) were structurally incapable of damaging the player — only melee contact ever worked. All of them now deal damage correctly.
  보스의 원거리 공격(충격파, 나선탄, 글리치 난사, 순간이동 습격 등)이 구조적으로 플레이어에게 데미지를 줄 수 없었습니다 — 근접 접촉 판정만 실제로 작동하고 있었습니다. 이제 전부 정상적으로 데미지를 입힙니다.
- A crash in the new boss patterns' telegraph rendering could leave the camera zoom stacking every frame, visually collapsing the whole screen toward one corner and eventually failing the stage. Fixed at the source.
  신규 보스 패턴의 예고 동작(텔레그래프) 렌더링 중 발생하던 크래시로 인해 화면 줌이 매 프레임 누적되어 한쪽 구석으로 화면이 통째로 빨려 들어가다 결국 스테이지가 실패하던 문제를 근본 원인부터 수정했습니다.
- The Vault's Specialty Items unlocked all seasons at once regardless of actual progress — clearing Season 1 was enough to see Season 5's item unlocked. Each item now correctly stays locked until its own season is cleared.
  보물창고의 특산품이 실제 진행도와 무관하게 전 시즌이 한꺼번에 해금되어 있었습니다 — 시즌1만 클리어해도 시즌5 특산품까지 열려 보였습니다. 이제 각 특산품은 해당 시즌을 클리어해야만 정상적으로 해금됩니다.
- Specialty Items had no actual effect on stats despite being earnable and displayed as owned — attack/HP/magnet range/cooldown bonuses are now correctly applied.
  보물창고 특산품을 모으고 보유 개수도 표시되고 있었지만 실제 스탯에는 전혀 반영되지 않고 있었습니다 — 이제 공격력/HP/자석 범위/쿨타임 감소 보너스가 정상적으로 적용됩니다.

### UI / 화면
- Added a "💰 Currency" button to the character screen — tap it to see every currency you own and, per currency, exactly where to earn more of it.
  캐릭터 화면에 "💰 재화" 버튼을 추가했습니다 — 누르면 보유 중인 모든 재화와, 재화별 실제 획득처를 확인할 수 있습니다.

## v0.4.1 (2026-07-25)

### Balance / 밸런스
- Auto and Auto-Retry mode no longer pause the game or show the level-up card screen — the same priority-based selection now applies instantly in the background so gameplay never stops.
  자동/자동재도전 모드에서는 레벨업 시 게임이 멈추거나 카드 화면이 뜨지 않습니다 — 기존과 동일한 우선순위 로직으로 화면 전환 없이 즉시 적용됩니다.
- Normal and Hard difficulty no longer require more kills per chapter than Easy — enemies already get tougher on higher difficulty, so requiring extra kills on top of that was piling on. All three difficulties now share the same (lower) kill target.
  노말·하드 난이도가 이지보다 챕터당 더 많은 처치 수를 요구하던 걸 없앴습니다 — 어차피 난이도가 높아지면 몬스터 자체가 강해지는데 처치 수까지 더 많이 요구하는 건 과했습니다. 이제 세 난이도 모두 동일한(더 낮아진) 처치 목표를 씁니다.

### Bug Fixes / 버그 수정
- The Vault's Specialty Items tab had a hardcoded season cap that never updated when Season 5 launched, keeping its Season 5 item locked even though the season itself was already live. It now unlocks correctly whenever its season actually releases.
  보물창고의 특산품 탭이 시즌 오픈 여부와 무관하게 고정된 값으로 잠금을 판정하고 있어, 시즌5가 이미 열렸는데도 해당 특산품이 계속 잠긴 상태였습니다. 이제 시즌이 실제로 열리면 정상적으로 함께 해금됩니다.
- Save files could carry over pets/companions unlocked by an old season-gating bug from before v0.3.1.4. Loading a save now re-validates every owned pet/companion against the current season gates and strips out anything that shouldn't have been unlocked.
  v0.3.1.4 이전의 시즌 게이트 버그로 인해 잘못 해금된 펫/동료가 저장 데이터에 그대로 남아있을 수 있었습니다. 이제 저장 데이터를 불러올 때마다 보유 중인 모든 펫/동료를 현재 시즌 게이트 기준으로 재검증해서, 정상적으로 해금되지 않았어야 할 항목은 제거합니다.
- Elite monsters were missing their dedicated art/stats for Chapters 11-50 and silently fell back to a generic ghost enemy instead — the elite spawn table simply never had entries for those chapters. All of them now have their proper elite art and stats.
  챕터11~50 구간의 정예(엘리트) 몬스터가 전용 그림/능력치 없이 그냥 평범한 유령으로 대체되어 나오고 있었습니다 — 해당 챕터들의 정예 스폰 데이터 자체가 아예 빠져있었습니다. 이제 전 구간 정예 몬스터가 정상적인 전용 그림/능력치로 등장합니다.
- Zodiac Dog and Ssari (both auto-collecting pets) played almost identically despite being meant to feel different — widened the speed gap between them and split their targeting behavior (nearest target vs. cluster-seeking).
  강다리(자동수집)와 싸리가 원래는 다르게 느껴져야 하는데 거의 똑같이 동작하고 있었습니다 — 둘 사이 이동속도 차이를 벌리고, 타겟팅 방식도 각각 다르게(가장 가까운 대상 우선 / 밀집된 곳 우선) 분리했습니다.

### UI / 화면
- Law slots moved to match the Sub-Weapon slot layout (one full-width row each) instead of three narrow slots side by side, for visual consistency.
  법칙 슬롯을 보조무기 슬롯과 동일한 레이아웃(세로로 이어지는 풀너비 3칸)으로 통일했습니다.

### Technical / 기타
- Reduced the game's overall file size by re-compressing dozens of oversized image assets (ending art, companion effect sprites, monster sprites, pet icons, Law icons, stage cards) down to the resolution they're actually displayed at — no visual difference, smaller download.
  다수의 과대 용량 이미지(엔딩 아트, 동료 이펙트, 몬스터 스프라이트, 펫 아이콘, 법칙 아이콘, 스테이지 카드)를 실제 표시 해상도에 맞게 재압축해 전체 용량을 크게 줄였습니다 — 화질 차이는 없습니다.

## v0.4.0 (2026-07-24)

[늦어서 죄송합니다. 본업이 너무 바빠 업데이트가 너무 늦었습니다.]
[Sorry for the late update — my day job has kept me too busy.]

### New Features / 신규 기능
- Season 5 "Celestial Realm" (선계) is now fully built out — Chapters 41-50 with dedicated bosses, monsters, floor decoration, stage-select art, and a 6-slide ending sequence, plus 2 new companions (Baekunseonin, Maehwageomseon) with their own attack/ultimate effects.
  시즌5 "선계"가 완전히 구축되었습니다 — 전용 보스·몬스터·바닥 소품·스테이지 선택 아트를 갖춘 챕터41~50, 6슬라이드 엔딩, 신규 동료 2종(백운선인, 매화검선)과 전용 공격/궁극기 이펙트까지 추가했습니다.
- Added the **Seonsul (仙術) Skill Tree** — a dedicated Yin/Yang skill tree accessible from the character screen. Pick one root path, branch into one of two specializations per side, and level up a passive plus two auto-cast abilities (up to 5★ each) with unique screen-wide visual effects (lightning, fire, curses, purification). A second tree can be unlocked later for a Harmony/Extreme synergy bonus, and everything can be reset with a full refund.
  캐릭터 화면에서 접근하는 전용 음양 스킬트리 **선술(仙術)**을 추가했습니다. 뿌리 하나를 정하고 음/양 중 하나의 가지로 특화한 뒤, 패시브와 자동시전 액티브 2종(각 5강까지)을 성장시킬 수 있으며, 벼락·화염·저주·정화 등 화면 전체를 뒤덮는 전용 이펙트가 붙어 있습니다. 이후 두 번째 나무를 열어 조화/극한 시너지 보너스를 받을 수 있고, 전체 초기화 시 투자한 재화를 전액 환불합니다.

### Balance / 밸런스
- Melee weapons (Soul Scythe, Shaman Staff) now actually hit every enemy they graze instead of vanishing after their first hit — a dead "pierce all" flag from the projectile system had never been wired up. The Divine Sword was already correct.
  영혼낫과 무당지팡이가 첫 번째 적을 맞추면 그대로 사라지던 문제를 수정했습니다 — 투사체 시스템에 있던 "전체 관통" 플래그가 실제로는 한 번도 연결되어 있지 않았습니다. 신검은 원래부터 정상 작동하고 있었습니다.
- Melee companions' ultimates now reach as far as ranged companions' basic attacks — their normal attacks are still short-range, but their ultimates no longer fail to find a target almost every time.
  근접형 동료의 궁극기 사거리를 원거리 동료의 평타 수준으로 확장했습니다 — 평타는 여전히 근접이지만, 궁극기가 대상을 못 찾아 거의 발동 안 되던 문제가 해소됩니다.
- Heomugeomsa's and Janggu-aebi's ultimates now fly from the companion toward enemies instead of dropping in place at the target — a clearer "sword flies under its own will" feel.
  허무검사·장구애비의 궁극기가 대상 위치에 바로 떨어지는 대신 동료로부터 적에게 날아가는 방식으로 바뀌어, "이기어검"에 가까운 연출이 됐습니다.

### Bug Fixes / 버그 수정
- Seonsul Skill Tree: the "next layer unlocks once ANY one root stat reaches 3★" gate had been coded as "ALL 4 stats must reach 3★," silently blocking progress for most players.
  선술 스킬트리: "뿌리 노드 중 아무거나 3강이면 다음 층 해금"이어야 할 조건이 "4개 전부 3강"으로 잘못 구현되어 있어, 대부분의 플레이어의 진행을 막고 있었습니다.
- Seonsul Skill Tree: sub/ultimate ability upgrade buttons became permanently unclickable after the very first level invested, capping them at 1/5 forever.
  선술 스킬트리: 준필살기/필살기 강화 버튼이 1강만 찍으면 클릭 불가 상태가 되어 영구히 1/5에 고정되던 문제를 수정했습니다.
- Seonsul Skill Tree popup scrolled back to the top on every single click.
  선술 스킬트리 팝업이 아무 버튼이나 누를 때마다 스크롤이 맨 위로 초기화되던 문제를 수정했습니다.
- Season 5 story stage floors were rendering with Season 2's purple palette instead of their own color scheme.
  시즌5 스토리 스테이지 바닥이 전용 색상 대신 시즌2의 보라색 팔레트로 표시되던 문제를 수정했습니다.
- Sinmok/Seonsul's permanent crit-chance and cooldown-reduction bonuses were being silently wiped back to their hardcoded defaults on every single stage entry.
  신목·선술의 영구 치명타율/쿨타임 감소 보너스가 스테이지에 입장할 때마다 하드코딩된 기본값으로 조용히 초기화되던 문제를 수정했습니다.

## v0.3.1.4 (2026-07-19)

### Bug Fixes / 버그 수정
- Fixed 6 Season 3/4 companions and pets (Baksu, Janggu-aebi, Ssari, Gongi, Crystal Spirit, Soul Ember) missing their season-gate entirely — they were pullable/purchasable from the very start of the game instead of only after reaching their intended season.
  시즌3/4 동료·펫 6종(박수, 장구애비, 싸리, 공이, 수정정령, 영혼불씨)에 시즌 게이트 자체가 빠져 있던 문제를 수정했습니다 — 원래 해당 시즌에 도달해야 뽑히거나 구매 가능해야 하는데, 게임 시작부터 가능했습니다.

### Balance / 밸런스
- Rarity rework for those same 6 companions/pets, plus the 2 already-gated Season 4 companions: each Season 3 pair now has one Legendary and one Rare, and each Season 4 pair has one Legendary and one Unique. Stats were scaled up to match their new tier.
  같은 6종 동료·펫과 기존에 이미 게이트되어 있던 시즌4 동료 2종까지 포함해 등급을 재조정했습니다: 시즌3 동료/펫 쌍은 각각 레전더리 1 + 레어 1, 시즌4 동료/펫 쌍은 각각 레전더리 1 + 유니크 1로 구성됩니다. 능력치도 새 등급에 맞춰 상향했습니다.
- This introduces the game's first Legendary-tier companions and pets (Janggu-aebi, Ssari, Heomugeomsa, Soul Ember).
  이번에 게임 최초로 레전더리 등급 동료/펫(장구애비, 싸리, 허무검사, 영혼불씨)이 생겼습니다.

## v0.3.1.2 (2026-07-19)

### New Features / 신규 기능
- The Dimensional Map (opened via Samshin Granny) now scales up to fill the screen instead of rendering at a fixed small size — labels stay crisp and undistorted while the artwork stretches to fit.
  삼신할머니를 통해 여는 차원 지도가 고정된 작은 크기 대신 화면을 꽉 채우도록 확대됩니다 — 라벨 글자는 찌그러지지 않고 또렷하게 유지되면서 그림만 화면에 맞춰 늘어납니다.
- Clearing Easy Season 1 (stage 100) now also raises Normal difficulty's weapon/companion/pet slots from 2 to 3 (full), not just Easy's. Normal was the one difficulty stuck at a fixed slot count regardless of progress — this gives players who found Normal too tight some relief once they've proven themselves on Easy.
  이지 시즌1(스테이지100) 클리어 시, 이지뿐 아니라 노말 난이도의 무기/동료/펫 슬롯도 2개 → 3개(풀)로 함께 상향됩니다. 노말은 진행도와 무관하게 슬롯 수가 고정돼 있던 유일한 난이도였는데, 이지를 완주한 플레이어에게는 노말도 조금 더 여유를 주기 위한 변경입니다.

## v0.3.1.1 (2026-07-19)

### Performance / 성능 개선
- Fixed a major hot-path inefficiency: `findNearestEnemies()` (used by every weapon fire, including the default Talisman) was fully sorting the entire alive-enemy list even when only the single nearest target was needed. Replaced with a partial top-N selection — cost now scales with the number of targets needed, not total enemy count.
  무기 발사마다(기본 부적 포함) 호출되는 `findNearestEnemies()`가 가장 가까운 적 1마리만 필요할 때도 생존한 적 전체를 매번 정렬하고 있던 비효율을 수정했습니다. 필요한 개수만 유지하는 부분선택 방식으로 바꿔, 비용이 전체 적 수가 아니라 필요한 타겟 수에 비례하게 됩니다.
- Removed two more per-frame full-array sorts (Scythe bounce targeting, Charm retargeting), replaced with a single-pass nearest search.
  저승낫 바운스 유도, 현혹 재타겟팅에서도 매 프레임 전체 배열을 정렬하던 부분을 단일 순회 탐색으로 교체했습니다.
- Enemies, XP orbs, gold drops, and treasure drops were each re-generating a radial gradient glow effect from scratch every single frame. These are now pre-rendered once per color/size and reused as cached sprites — this mattered most for XP orbs, since a single kill can spawn several at once and they linger on screen until collected.
  적, XP오브, 골드 드랍, 재화 드랍이 각각 매 프레임 발광 그라디언트를 새로 생성하던 것을, 색상/크기별로 한 번만 미리 그려두고 재사용하도록 바꿨습니다. 킬 하나당 여러 개씩 쏟아지고 자석에 끌려오기 전까지 화면에 계속 남아있는 XP오브에서 특히 효과가 컸습니다.
- These changes should reduce stutter when a lot of enemies/drops pile up (e.g. Infinite Dungeon runs), and ease GPU load enough to stop it from affecting other apps/tabs running alongside the game.
  적/드랍이 많이 쌓일 때(무한 던전 등) 버벅임이 줄고, 게임과 같이 켜둔 다른 탭/프로그램에 영향을 주던 GPU 부하도 완화될 것으로 기대됩니다.

### Bug Fixes / 버그 수정
- Fixed a regression that locked Seasons 1-3 on the Dimensional Map (accessed via Samshin Granny) in release builds, even after actually clearing them — the content-release flag list was missing entries for already-shipped seasons, so it defaulted them to "not released." Stage Select was unaffected since it uses a different unlock check.
  릴리즈 빌드에서 삼신할머니를 통해 여는 차원 지도가, 실제로 클리어한 시즌1~3까지도 전부 잠김으로 표시되던 회귀 버그를 수정했습니다 — 이미 출시된 시즌들이 콘텐츠 배포 플래그 목록에 빠져 있어 기본값(미배포)으로 처리되고 있었습니다. 스테이지 선택 화면은 다른 해금 조건을 쓰기 때문에 영향받지 않았습니다.

## v0.3.1 (2026-07-19)

### New Features / 신규 기능
- Added the **Vault** — a new lobby building unlocked alongside Samshin Granny/the Dimensional Merchant after clearing Season 1. Collect 8 seasonal Specialty Items (one per season, Hard difficulty only) for small permanent stat bonuses; a locked "Law Artifact" tab hints at more to come.
  로비 신규 건물 **보물 창고**를 추가했습니다 — 시즌1 클리어 시 삼신할머니/차원상인과 함께 해금됩니다. 시즌별 특산품 8종(하드 난이도 전용)을 모으면 소량의 영구 스탯 보너스를 얻으며, 잠긴 "법칙-유물" 탭은 향후 콘텐츠를 암시합니다.
- Specialty Items now drop on Hard difficulty story stages: a 20% chance per regular kill, plus a guaranteed drop from bosses (1 from mid-bosses, 2 from chapter bosses). Your haul this run shows up in the top-right HUD and on the result screen.
  하드 난이도 스토리 스테이지에서 특산품이 드랍됩니다: 일반 몬스터 처치 시 20% 확률, 보스는 확정 드랍(미들보스 1개/챕터보스 2개). 이번 판에 얻은 수량은 우측 상단 HUD와 결과 화면에 표시됩니다.
- Added a 4th auto-play mode, **Auto-Retry** — repeats the same stage automatically regardless of win or loss, ideal for Hard-mode farming.
  자동 진행 모드에 4단계 **자동재도전**을 추가했습니다 — 승패와 무관하게 같은 스테이지를 자동으로 반복해, 하드모드 파밍에 특화되어 있습니다.
- The "Retry" button now also appears after a stage **clear**, not just on failure.
  "재도전" 버튼이 이제 스테이지 **클리어** 시에도 표시됩니다(기존엔 실패 시에만 표시).
- The farming-time magnet range after clearing a stage was increased from 3x to 5x, so leftover drops are easier to sweep up.
  스테이지 클리어 후 파밍 타임의 자석 범위를 3배 → 5배로 늘려, 남은 드랍을 더 쉽게 쓸어 담을 수 있습니다.

### Bug Fixes / 버그 수정
- Fixed the auto-pick level-up logic: re-leveling an already-owned stat (like Vampire) was being silently treated as the lowest priority instead of keeping its intended rank, so Auto mode often skipped re-leveling Vampire in favor of filling sub-weapon slots.
  자동선택 레벨업 로직 버그 수정: 흡혈처럼 이미 보유 중인 스탯을 재레벨업할 때 의도한 우선순위 대신 최하위로 처리되고 있어, 자동 모드가 흡혈 재레벨업 대신 보조무기 슬롯 채우기를 택하는 경우가 잦았습니다.
- If you already have Vampire, HP now jumps to a much higher auto-pick priority, since the two stack well together.
  흡혈을 보유 중이면 체력(HP)이 자동선택 우선순위에서 크게 앞당겨집니다 — 두 스탯의 시너지가 좋기 때문입니다.
- Fixed the stage-select "unlock-pending" rainbow border missing on stage 50 (Easy 2-slot unlock).
  스테이지 선택 화면에서 스테이지50(이지 2슬롯 해금)에 표시되어야 할 무지개 테두리가 빠져 있던 문제를 수정했습니다.
- Haewonmaek and Jeoseung-nabi (Season 2 companion/pet) now unlock on clearing stage 110 (Chapter 11 boss) as originally designed, instead of unlocking a chapter early on Season 1 clear.
  해원맥·저승나비(시즌2 동료/펫)의 해금 시점을 원래 설계대로 스테이지110(챕터11 보스) 클리어로 수정했습니다(기존엔 시즌1 클리어 시점에 한 챕터 일찍 풀리고 있었음).

## v0.3.0 (2026-07-18)

### New Features / 신규 기능
- Season 4 "Void Realm" is now fully playable — fixed a bug where it couldn't actually be entered from either the stage select screen or the dimensional map.
  시즌4 "귀허계"가 이제 완전히 플레이 가능합니다 — 스테이지 선택과 차원 지도 어느 쪽에서도 실제로는 진입이 안 되던 버그를 수정했습니다.
- Added mouse-wheel scroll and arrow buttons to the season card row, so desktop/mouse players can actually reach the Season 4 card.
  시즌 카드 목록에 마우스 휠 스크롤과 화살표 버튼을 추가해, PC/마우스 환경에서도 시즌4 카드까지 스크롤할 수 있습니다.
- New Season 4 systems: **Fate (命) Enhancement** (Lv.0-10 track using Sullriseok, granting tiered crit-heal / auto-revive / boss-evasion / boss-kill bonus effects) and **Afterimage Fusion** (wandering afterimages that fuse into a stronger materialized enemy after 5 seconds together).
  시즌4 전용 시스템 신설: **명(命) 강화**(순리석으로 0~10레벨, 단계별 치명타 회복/자동부활/보스회피/보스처치보너스 효과), **잔상 합체 실체화**(필드를 떠돌던 잔상들이 5초간 붙어있으면 강화된 몬스터로 실체화).
- 2 new Season 4 companions (Hwansaengdongja, Heomugeomsa) and 2 new pets (Sujeong, Bulssi), each with dedicated attack-effect art.
  시즌4 신규 동료 2종(환생동자/허무검사), 펫 2종(수정정령/영혼불씨) 추가 — 전용 공격 이펙트 이미지 포함.
- Season 4 ending sequence (6 slides) added.
  시즌4 엔딩 연출(6슬라이드) 추가.
- Season 3 and 4 story stages now use their own map colors and ground decoration instead of reusing Season 2's.
  시즌3·4 스토리 스테이지가 시즌2 것을 그대로 재사용하던 맵 색상·바닥 소품 대신, 전용 팔레트와 데코를 사용합니다.
- Added a Sullriseok (Season 4 currency) earning path in story stages: a chance drop on regular kills, a guaranteed drop on boss kills, and a bonus on first chapter-boss clear.
  순리석(시즌4 재화)의 스토리 스테이지 획득 경로 추가: 몬스터 처치 시 확률 드랍, 보스 처치 확정 드랍, 챕터 최초 클리어 보너스.
- The Dimensional Rift "corruption" debuff (when Chaewonseok runs out) is now season-specific: Season 2 keeps the old HP-regen block, Season 3 randomly reverses your controls, Season 4 blocks XP gain.
  차원석이 바닥나면 발동하는 "잠식" 디버프가 시즌별로 분화되었습니다: 시즌2는 기존처럼 회복 불가, 시즌3은 랜덤 조작 반전, 시즌4는 경험치 획득 불가.
- Added a Save Code system — export/import your full save as a text code, so you can carry progress between PC and mobile (itch.io doesn't sync saves across devices).
  세이브 코드 시스템 추가 — 저장 데이터를 문자열 코드로 내보내기/불러오기 할 수 있습니다. itch.io는 기기 간 저장 동기화가 안 되기 때문에, PC와 모바일 사이에 진행 상황을 옮길 때 사용하세요.
- Optimized game art assets — total build size cut roughly in half (~60MB → ~31MB), for faster loading.
  게임 이미지 리소스 최적화 — 빌드 용량이 절반 가까이(약 60MB → 31MB) 줄어 로딩이 빨라집니다.

## v0.2.5 (2026-07-17)

### 신규 기능
- **시즌4 "귀허계" 오픈**: 챕터31~40, 신규 스테이지 100개가 추가되었습니다. 신규 몬스터 20종, 신규 보스 20종(미들보스 10 + 챕터보스 10)이 등장합니다.
- **시즌3 엔딩 연출 추가**: 시즌3(망랑계)를 클리어하면 전용 엔딩 슬라이드가 재생됩니다.
- **신규 동료 2종**: 애기 도깨비 박수(마법형), 응원 단장 장구애비(버프형)가 뽑기 풀에 추가되었습니다.
- **신규 펫 2종**: 싸리(아이템 자동 수집형, 범위가 넓은 대신 이동은 느림), 공이(체력 회복형)가 추가되었습니다.
- **던전강화 보상 배율 개선**: 던전강화 레벨이 높을수록 같은 킬수 기준 보상이 항상 더 커지도록 복리 보너스가 적용됩니다.
- 시즌3 변신 카드(도깨비/구미호/해골귀) 드랍 확률 상향(0.5% → 5%).

### 버그 수정
- 시즌3 도깨비 주사위 버프 상시 표시 배지가 화면 우측 하단 줌 버튼과 겹쳐 보이던 문제 수정.
- 영혼조각/영혼석이 맵에 드랍될 때 도트 이미지 대신 단순 발광 원으로만 표시되던 문제 수정 — 전용 아이콘이 반영됩니다.

## v0.2.4.2 (2026-07-16)

### 신규 기능
- **던전강화(프레스티지) 시스템**: 무한던전 화면에 강화 카드가 추가되어, 천운석+골드를 소모해 무한던전 시작 킬수를 영구히 밀어줄 수 있습니다. 레벨 상한 없이 계속 이어서 강화 가능합니다.
- **종합 전투력 지수**: 던전강화 카드에 현재 전투력 수치와 함께 적정/위험/매우위험 등급 배지가 표시되어, 다음 강화를 진행해도 안전한지 가늠할 수 있습니다.
- **무기셋(덱) 시스템**: 캐릭터 화면의 "🗂️ 무기셋" 버튼으로 주무기·동료·펫 편성을 5개 슬롯에 저장해두고, 상황에 맞게 즉시 불러올 수 있습니다.
- **체력(HP) 강화 스탯 UI**: 캐릭터 화면 스탯 강화 목록에 체력 항목이 노출됩니다(강화 로직 자체는 이미 있었으나 화면에 표시되지 않고 있었습니다).
- **배포용 빌드 모드 추가**: `build.py --release`로 개발자 도구(🛠)가 꺼진 배포 전용 산출물(`mongdal-release.html`)을 별도로 생성할 수 있습니다. 개발용 소스 설정은 그대로 유지됩니다.

### 버그 수정
- 무한던전에서 골드 획득량이 던전 배율(하이킬 구간 몬스터 강화 배율)을 반영하지 못하던 문제 수정 — 이제 골드도 몬스터 강화 배율만큼 함께 늘어납니다.
- 레벨업 카드를 빠르게 연속으로 탭하면 카드 효과가 중복 적용되던 문제 수정.

## v0.2.4.1 (2026-07-15)

### 신규 기능
- **프로모 코드 시스템**: 설정 메뉴에서 코드를 입력해 보상을 받을 수 있습니다. 최초 코드 `MONGDAL`은 유저가 실제로 클리어해둔 1~20스테이지 기준으로만 보상을 계산해 지급하여, 이미 진행을 많이 한 유저도 손해 보지 않도록 설계했습니다.
- **스테이지1 온보딩 강화**: 스테이지1 한정으로 몬스터 공격력을 대폭 낮췄고, 스테이지1을 클리어하면 로비 이동 버튼과 캐릭터 화면에 노란색 박스로 "공격력 강화가 가능합니다" 안내가 표시됩니다. 안내는 실제로 한 번이라도 조작(공격 또는 강화 클릭)하면 자동으로 사라집니다.
- 신목의 균열, 삼신할매 태몽 관련 대사·텍스트 신규 추가.

### 버그 수정
- **원거리 몬스터 투사체 무효화 버그 수정**: 원거리 공격 패턴(`ranged`)을 가진 몬스터가 투사체를 던져도 실제로는 이동·충돌 처리가 전혀 되지 않아, 원거리 공격이 사실상 통째로 무효화되어 있던 문제를 수정했습니다.
- 스테이지 클리어에 실패(패배)했는데도 이전 판의 "보상 획득" 배너가 잘못 남아 표시되던 문제 수정(실제 보상은 원래도 지급되지 않았고, 화면 표시만 잘못돼 있었습니다).
- 파밍 구간(일반 클리어·보스 클리어 공통) 중 레벨업하면 조용히 넘어가야 하는데도 인터랙티브 레벨업 카드가 뜨던 버그 수정.
- 레벨업 스탯 카드 "공격속도"가 "쿨타임" 카드와 같은 감소 풀을 공유하고 있어 사실상 동일한 효과였던 문제 수정 — 공격속도는 별도의 공격속도 배율 경로로 재배선했습니다.
- 무기 설명 텍스트의 영어/한국어 불일치 수정(신검 서브옵션 설명 등).

## v0.2.4 (2026-07-14)

### 신규 기능
- **시즌3 "망랑계" 오픈**: 챕터21~30, 신규 스테이지 100개가 추가되었습니다. 신규 몬스터 20종, 신규 보스 20종(미들보스 10 + 챕터보스 10)이 등장합니다.
- **보스 신규 패턴 4종**: 순간이동습격(기습 타격), 분신(시야교란용 허상), 조작반전(플레이어 이동 일시 반전), 글리치난사(화면 랜덤 위치 연속 폭발형 투사체) — 시즌3 보스들의 개성을 살리는 전용 패턴입니다.
- 시즌2를 클리어하면 삼신할매가 시즌3 오픈을 알리는 대사를 전달합니다.
- **해금 예고 UI 3종 세트**: 앞으로 무엇이 풀릴지 미리 알 수 있도록 발견성을 개선했습니다.
  - 스테이지 선택 화면: 해금 트리거 스테이지(5·10·15·20·25·30·100·110·160·200) 박스에 무지개색 순환 테두리 표시.
  - 캐릭터 화면 "📖 해금도감" 탭: 위 10개 해금 항목을 한눈에 정리 — 미해금은 물음표 실루엣, 해금되면 아이콘+설명이 공개됩니다.
  - 차원 지도: 아직 열리지 않은 계(season)에 🔒 자물쇠 표시.
- **보스러시 무한 확장형 재설계**: 기존 고정 순서 방식을 폐기하고, 동적 보스 풀 + 복리 스케일링으로 끝없이 이어지는 방식으로 변경했습니다.

### 버그 수정
- 일부 서브무기(귀신손·번개장판 등 "적을 골라 그 위치에 발동"하는 타입)가 보스전에서 보스를 전혀 공격하지 못하던 버그 수정 — 서브무기도 주무기와 동일하게 보스를 타겟 후보에 포함하도록 통일했습니다. 보스전에서 일반 몬스터가 전멸하면 헛발질만 하던 문제였습니다.
- 상사화 펫 해금 팝업에서 원본 크기로 표시되지 않던 문제 수정.

## v0.2.3.2 (2026-07-13)

### 신규 기능
- **삼위일체 발동 토스트**: 대장간/캐릭터/동료/펫 화면에서 무기·동료·펫 슬롯 편성을 바꿀 때, 같은 슬롯의 오행이 3종 일치(삼위일체)로 새로 켜지는 순간 "삼위일체 (N슬롯) 발동!" 토스트가 뜹니다. 기존엔 전투 시작 시에만 계산되어 장비창에서는 알 방법이 없었습니다.
- **스탯 상세 브레이크다운 확대 보기**: 캐릭터 화면 능력치확인 팝업의 "상세" 탭에서 각 스탯 행을 탭하면 기여 소스별(기본/강화/신목/명부 등)로 큰 글씨 브레이크다운이 펼쳐집니다.
- **동료/펫 카드 설명 확대 보기**: 보유 중인 동료·펫 카드를 탭하면 각성 효과/설명 글씨가 커져서 읽기 편해집니다. 다시 탭하면 원래대로 줄어듭니다.
- **신규 서브무기 "정화의 소금"**: 애기씨 주변으로 소금 파티클을 방사형으로 흩뿌려 맞은 적마다 개별로 약한 데미지 + 짧은 경직을 입힙니다. 메인 딜이 아닌 견제·CC용 서브무기입니다.
- **대장간 완전체(9~10성) 무기 이미지**: 초월 9~10성에 도달한 무기는 대장간 슬롯바/목록 카드 아이콘도 완전체 그래픽으로 바뀌고, 초월 구간별로 카드에 발광 효과가 붙습니다.
- **스테이지1 최초 진입 줌 안내**: 처음 스테이지1에 입장하면 줌 +/− 버튼에 스팟라이트와 말풍선 안내가 잠깐 떴다가 자동으로 사라집니다(1회성).
- **파밍 구간 자석 범위 3배**: 킬타겟 달성 후 결과화면 이동 전 파밍 구간 동안 골드/XP/영혼 드랍 자석 범위가 3배로 늘어나, 화면을 넓혀도 왕복 이동 시간 안에 다 못 먹던 문제를 완화했습니다.

### 밸런스
- 신검 사거리 64 → 100으로 확대.
- 신검 다중 검(각성) 동시 발사 → "샤사사사삭!" 처럼 살짝 시차를 두고 순차 발사되도록 변경, 공속이 빠르면 자연스럽게 겹쳐 나갑니다.
- 강다리(술신) 펫에 자체 소형 자석(반경 100) 추가.

### 버그 수정
- 스탯 상세 탭의 공격력 최종값이 명부(영혼석) "최종 데미지 +%" 강화를 반영하지 않아, 종합 탭의 실제 전투 수치와 달라 보이던 문제 수정.

## v0.2.3.1 (2026-07-12)

### 신규 기능
- **무기 초월 등급별 발광 연출**: 1~4성은 랭크가 오를수록 점점 밝아지고, 5~8성은 상시 발광(느린 맥동), 9~10성(완전체)은 가장 강한 발광(빠른 맥동)으로 표시됩니다. 캐릭터가 손에 든 무기와 실제 투사체 양쪽 다 적용됩니다.
- **캐릭터 화면 "능력치확인" 팝업**: 종합(최종 수치) / 상세(기본·강화·신목·명부 출처별 분해) / 시너지(무기·동료·펫 오행 관계 + 발동 목록) 3탭으로 확인 가능합니다.
- **오행 상성 펜타그램**: 실제 오행상성표 아트워크를 대장간/동료/펫 화면에 적용해, 지금 장착·편성한 조합이 상생인지 상극인지 링 강조 + 발광 화살표로 보여줍니다.
- **동료 배회(wander) 모션**: 펫처럼 대형 위치에서 살짝씩 벗어났다 돌아오며 자연스럽게 움직입니다.

### 밸런스
- **동료 사거리 전면 재조정**: 근접형은 기존 사거리의 2배로, 원거리 평타는 200부터 별 1개당 +10, 궁극기 사거리는 평타와 동일하게 통일했습니다(예전엔 궁극기에 사거리 제한이 아예 없어서 화면 전체에 도달했음).
- **동료 궁극기 쿨타임 상향**: 4~9초 → 20~30초대로 늘려 남발되지 않도록 조정했습니다.
- **동료 공격 이펙트 크기**: 기존의 50%로 축소해 화면을 덜 가리도록 했습니다.

### 버그 수정
- 무기가 캐릭터 몸 뒤에 가려져 보이던 문제, 손에 안 쥔 것처럼 각도가 어긋나던 문제 수정 (5개 주무기 개별 보정).
- 레벨업 시 스탯 슬롯이 4칸 다 찼는데도 새 스탯이 계속 "New"로 나오던 버그 수정.
- 대장간에서 이미 다른 슬롯에 장착된 무기를 선택하면 조용히 원래 슬롯이 비워지던 버그 수정.
- 강화석/천운석/천령과/태극석 던전이 전부 "무한 던전" 기록 한 곳에만 몰아서 저장되고, 보스러시는 대소문자 불일치로 기록이 저장되던 버그 수정 — 이제 던전별로 각자 최고기록이 정상 표시됩니다.
- 상점 뽑기 결과·파편함의 등급 라벨이 영어 모드에서도 한글로 나오던 문제 수정.
- 대장간/업적/건물/던전/상점/스테이지선택/개발자도구/일시정지·레벨업 화면 등에서 클릭 가능한 요소 외의 빈 공간은 드래그가 안 먹던 문제 수정.
- 캐릭터 화면의 주무기/스탯 섹션이 각각 독립 스크롤 박스로 쪼개져 있던 문제 수정.

### 이미지 교체
- 건물 목록 6개(대장간/의원당/서낭당/장승당/용왕연못/신목) 이모지 → 실제 이미지로 교체.
- 강림차사/해원맥 동료 일러스트 신규 이미지로 교체.

## v0.2.3 (2026-07-11)

### 신규 기능
- **오행(五行) 시너지 시스템 추가**: 주무기(부적/신검/신궁/지팡이/영혼낫), 동료, 펫에 각각 오행 속성(金木水火土)이 부여됩니다. 상생 관계인 주무기 조합은 서로 고유 효과(사거리 증가, 화상 DoT, 지속시간 증가, 처치 시 쿨감 스택, 크리티컬 시 임시 오브 추가)를 얻고, 상극 관계는 서로 공격력이 오르는 대신 받는 피해도 함께 늘어납니다. 무기·동료·펫 슬롯이 같은 속성으로 3개 이상 맞춰지면 삼위일체 보너스와 함께 캐릭터 주위를 도는 궤도 이펙트가 나타납니다.
- **펫 등급 체계 확장 및 십이지신 재설계**: 펫 등급을 4단계에서 7단계(커먼~미소스, 상위 3단계는 향후 콘텐츠용)로 확장하고, 중복되던 십이지신 효과 6종을 골드/특수 획득량 증가, 자동 수집, 동료 공격력/방어력/체력 보정 등으로 새롭게 설계했습니다.
- **술신(강다리) 자동 수집 AI**: 근처 아이템(골드/경험치/영혼)을 직접 이동해서 주우러 가는 방식으로 재구현했습니다. 레벨이 오르면 이동 속도도 함께 빨라집니다.
- **동료 개편**: 동료 3종의 이름을 변경(장승 지킴이/수호신/생령 역사)하고, 등급 체계를 7단계로 재배치했으며 뽑기 확률도 함께 조정했습니다.
- **이지 난이도 슬롯 확장**: 진행도에 따라 이지 난이도의 전투 슬롯이 1개 → 2개 → 3개로 늘어나며, 관련된 모든 화면(대장간/동료/펫/캐릭터)의 슬롯 수 계산을 일치시켰습니다.
- **십이지신 애칭 변경**: 12종 펫 모두 귀여운 한글/영문 애칭으로 이름을 변경했습니다.

### 개선
- **대기 중 캐릭터 애니메이션 보정**: 전투 화면에서 가만히 있어도 동료가 전혀 움직이지 않던 문제를 수정해, 주인공·펫과 마찬가지로 살짝 숨쉬는 듯한 움직임이 재생됩니다.
- **데미지 미터 소수점 2자리 표시**로 변경.
- **오행 속성 배지 표시 버그 수정**: 동료·펫 화면에서 속성 배지가 카드 밖으로 잘려 안 보이던 문제를 수정했습니다.
- **펫 등급 텍스트 라벨 추가**: 펫 카드에 등급을 나타내는 색 줄만 있고 텍스트가 없어 커먼/언커먼 구분이 어려웠던 문제를 수정, 동료 화면과 동일하게 등급 텍스트를 표시합니다.

### 버그 수정
- 펫 강화 시 레벨 스케일링이 의도대로 적용되지 않던 문제 수정.
- 땅에 떨어진 영혼 조각/영혼석이 자석 범위에 들어와도 플레이어 쪽으로 이동하지 않던 문제 수정(메인 루프에서 업데이트가 누락되어 있었음).

## v0.2.2 (2026-07-10)

### 신규 기능
- **초반 스테이지 선택 튜토리얼 추가**: 전투 입장 경험이 없는 신규 플레이어를 위해, 기본 조작 튜토리얼이 끝난 뒤 로비 "스테이지" 버튼과 스테이지 1 카드에 펄스 애니메이션 + 말풍선 안내를 표시합니다.
- **데미지 미터 시스템 구현**: 전투 화면 좌측 하단에 장착한 무기별 누적 총데미지, 최근 3초 평균 DPS, 전체 데미지 대비 점유율(%) 게이지를 실시간으로 표시합니다. 장판형(독안개 등)·도트 데미지(중독 등)를 포함한 모든 데미지 경로를 집계합니다.

### 밸런스
- **초반 진입장벽 완화**: 챕터 1(대폭 하향) / 챕터 2(소폭 하향) / 챕터 3(아주 조금 하향) 구간의 몬스터·보스 체력·공격력을 낮췄습니다. 더 많은 분들이 초반 고비를 넘기고 게임을 즐기실 수 있도록 조정했습니다.
- **자동모드 레벨업 선택 로직 재점검**: 우선순위 체계를 세분화하고, 실제 무기 ID와 맞지 않던 오류를 다수 수정해 의도한 우선순위가 정상 작동하도록 고쳤습니다.

### 개선
- **무기 판정 범위와 그림 크기 불일치 수정**: 부적·신궁·지팡이·신검 등 주무기와 일부 보조무기(도깨비도끼, 귀신손, 번개장판)의 공격 판정 범위를 실제 그림 크기에 맞게 확대해, "맞은 것처럼 보이는데 안 맞는" 현상을 줄였습니다.
- **레벨업 선택 시 확인 연출 추가**: 카드를 고르면 깜빡임 애니메이션과 체크마크로 무엇을 선택했는지 명확히 표시됩니다(자동모드 포함).
- **신궁·부적에 미세한 유도 기능 추가**: 이동하며 발사할 때 조준이 어긋나 빗나가는 현상을 완화했습니다.
- **스테이지 화면에 스테이지 번호 표시** 추가.

### 버그 수정
- 도깨비도끼가 맵에서 거의 안 보이던 투명도 문제 수정.
- 부적 메인 발사에 초월 8성 관통 효과가 누락되어 있던 문제 수정.
- 개발자도구 "영혼석 추가" 버튼이 잘못된 저장 필드를 채우던 문제 수정.
- 대장간 화면에서 강화 버튼을 누르면 스크롤이 맨 위로 초기화되던 문제 수정.

---

*이전 버전 패치노트는 추후 정리 예정입니다.*
