# Mongdal Toemarok Patch Notes

## v0.2.5 (2026-07-17)

### New Features
- **Season 4 "Void Realm" Open**: Chapters 31-40, 100 new stages. 20 new regular monsters and 20 new bosses (10 mid-bosses + 10 chapter bosses).
- **Season 3 Ending Added**: Clearing Season 3 (Chaos Realm) now plays a dedicated ending sequence.
- **2 New Companions**: Baby Dokkaebi Shaman Baksu (mage-type) and Cheer Captain Janggu-aebi (support-type) have been added to the gacha pool.
- **2 New Pets**: Ssari (auto-collects items over a wider range but moves slower) and Gongi (HP regen).
- **Dungeon Upgrade Reward Scaling Improved**: Higher dungeon upgrade levels now always yield a larger reward at the same kill count, via a compounding bonus.
- Season 3 transformation card (Dokkaebi/Fox/Skeleton) drop rate increased (0.5% → 5%).

### Bug Fixes
- Fixed the Season 3 Dokkaebi Dice buff's persistent badge overlapping with the zoom buttons in the bottom-right corner.
- Fixed Soul Fragment/Soul Stone map drops rendering as plain glowing orbs instead of their dedicated icon art.

## v0.2.4.2 (2026-07-16)

### New Features
- **Dungeon Enhancement (Prestige) System**: A new upgrade card on the Infinite Dungeon screen lets you spend Cheonunseok + gold to permanently push forward the Infinite Dungeon's starting kill count. No level cap — you can keep upgrading indefinitely.
- **Battle Power Rating**: The same upgrade card now shows your current battle power alongside a Safe/Risky/Very Risky badge, so you can judge whether the next upgrade is still within a reasonable range.
- **Loadout (Deck) System**: A new "🗂️ Loadouts" button on the Character screen lets you save your main weapon/companion/pet loadout to any of 5 slots and load it back instantly.
- **HP Upgrade Stat Now Visible**: The Character screen's stat upgrade list now shows the HP row (the upgrade logic already existed but wasn't displayed).
- **Release Build Mode**: `build.py --release` now produces a separate deploy-only build (`mongdal-release.html`) with the developer tools (🛠) forced off, without touching the dev source config.

### Bug Fixes
- Fixed gold earned in the Infinite Dungeon not scaling with the dungeon's monster-strength multiplier at high kill counts — gold now scales along with it.
- Fixed a race condition where rapidly tapping a level-up card could apply its effect more than once.

## v0.2.4.1 (2026-07-15)

### New Features
- **Promo Code System**: You can now redeem codes from the Settings menu. The first code, `MONGDAL`, computes its reward based only on the stages (1-20) you've actually cleared, so players further along don't lose out relative to new players.
- **Stage 1 Onboarding**: Monster attack power is now drastically reduced on Stage 1 only. Clearing Stage 1 now highlights the Lobby button and the Character screen with a yellow prompt box reading "Attack upgrade available!" — the highlight clears automatically the first time you attack or tap an upgrade.
- Added new dialogue/text for the Sacred Tree's Crack event and Samsin Halmi's prophetic dream.

### Bug Fixes
- **Fixed ranged enemy projectiles doing nothing**: Enemies with the `ranged` attack pattern were firing projectiles that were never actually moved or checked for collision, effectively disabling ranged enemy attacks entirely. Fixed.
- Fixed a stale "Reward Received" banner incorrectly appearing on the result screen after a stage defeat, left over from a previous run (no reward was ever actually granted on defeat — this was purely a display bug).
- Fixed the farming window (after both normal stage clears and boss kills) incorrectly triggering the interactive level-up card instead of quietly leveling up as intended.
- Fixed the "Attack Speed" level-up stat card sharing the same reduction pool as the "Cooldown" card, making them functionally identical — Attack Speed is now rewired to its own separate attack-speed-multiplier path.
- Fixed English/Korean text mismatches in weapon descriptions (e.g. Divine Sword sub-option text).

## v0.2.4 (2026-07-14)

### New Features
- **Season 3 "Mangnyang Realm" Launch**: Added Chapters 21-30 with 100 new stages. 20 new regular monsters and 20 new bosses (10 mid-bosses + 10 chapter bosses).
- **4 New Boss Patterns**: Teleport Strike (a sudden ambush after blinking away), Clone Split (harmless decoy clones to obscure the real target), Confuse Field (briefly reverses player movement controls), and Glitch Barrage (a rapid volley of projectiles at random screen positions) — giving Season 3 bosses their own distinct identity.
- Clearing Season 2 now triggers new Samsin Halmi dialogue announcing the Season 3 unlock.
- **3-Tier Unlock-Preview UI**: Improves discoverability of what's coming next.
  - Stage Select: stage boxes that trigger an unlock (5, 10, 15, 20, 25, 30, 100, 110, 160, 200) now show a rotating rainbow border.
  - Character screen's new "📖 Codex" tab: lists all 10 unlock milestones at a glance — locked ones show as a "???" silhouette, unlocked ones reveal their icon and description.
  - Dimension Map: seasons not yet unlocked now show a 🔒 lock icon.
- **Boss Rush Redesigned as Infinite**: Replaced the old fixed sequence with a dynamic boss pool and compounding scaling for endless progression.

### Bug Fixes
- Fixed certain sub-weapons (Ghost Hand, Lightning Trap, and other "pick a target and act on its position" types) never attacking bosses at all — sub-weapons now share the same boss-inclusive target pool as main weapons. Previously, once regular monsters were cleared out during a boss fight, these weapons would just whiff at empty space.
- Fixed the Sangsahwa pet unlock popup not displaying it at full/original size.

## v0.2.3.2 (2026-07-13)

### New Features
- **Trinity Activation Toast**: When you change weapon/companion/pet slot loadouts on the Blacksmith/Character/Companion/Pet screens, a "Trinity (Slot N) Activated!" toast now appears the moment a slot's Five Elements newly align across all three (weapon/companion/pet). Previously this was only calculated at battle start, so there was no way to know from the equip screens.
- **Expandable Stat Breakdown**: On the Character screen's Stats popup, tapping a stat row in the "Detail" tab now expands a larger-font breakdown by source (base/upgrade/Sacred Tree/Soul Registry, etc).
- **Expandable Companion/Pet Card Descriptions**: Tapping an owned companion or pet card enlarges its awakening effects/description text for easier reading. Tap again to collapse.
- **New Sub-Weapon "Purifying Salt"**: Scatters salt particles radially around Aegissi, each individually dealing light damage and a brief stun to struck enemies. A control/CC-focused sub-weapon rather than a main damage dealer.
- **Blacksmith Soul-Tier (Rank 9-10) Weapon Art**: Weapons that reach Transcend Rank 9-10 now show their Soul-tier artwork in the Blacksmith slot bar and list cards too, with a glow effect scaled to transcend tier.
- **Stage 1 First-Entry Zoom Hint**: On your very first entry into Stage 1, the zoom +/− buttons get a brief spotlight highlight and speech-bubble hint before auto-fading (one-time only).
- **3x Magnet Range During Farming**: During the farming window (after kill target is reached, before the results screen), gold/XP/soul drop magnet range triples, addressing reports that players couldn't collect drops in time even after zooming out.

### Balance
- Divine Sword range increased 64 → 100.
- Divine Sword's simultaneous multi-blade launch (from awakening) is now staggered into a quick sequential burst instead of firing all at once; at high attack speed, bursts naturally overlap.
- Gangdari (Dog Zodiac) pet now has its own small passive magnet (radius 100).

### Bug Fixes
- Fixed the ATK row's final value in the Stats "Detail" tab not applying the Soul Registry "final damage +%" bonus, causing it to differ from the real combat value shown in the Overview tab.

## v0.2.3.1 (2026-07-12)

### New Features
- **Weapon Transcend Rank Glow**: Ranks 1-4 glow progressively brighter, ranks 5-8 glow constantly (slow pulse), and ranks 9-10 (Soul-tier) glow the strongest (fast pulse). Applies to both the weapon held in your character's hand and the actual projectiles.
- **Character Screen "Stats" Popup**: Check your build via 3 tabs — Overview (final totals), Detail (breakdown by base/upgrade/Sacred Tree/Soul Registry), and Synergy (weapon/companion/pet Five Elements relationships + active bonuses).
- **Five Elements Relation Pentagram**: The actual Five Elements chart artwork is now shown on the Blacksmith/Companion/Pet screens, highlighting whether your current loadout is in a generating or overcoming relationship with glowing rings and arrows.
- **Companion Wander Motion**: Companions now drift slightly around their formation position like pets, instead of holding perfectly still.

### Balance
- **Companion Range Overhaul**: Melee companions' range doubled. Ranged companions' basic attack range now starts at 200 (+10 per star). Ultimate skill range is now identical to basic attack range (previously ultimates had no range limit at all and could reach anywhere on screen).
- **Companion Ultimate Cooldown Increased**: 4-9s → 20-30s range, so ultimates fire less frequently.
- **Companion Attack Effect Size**: Reduced to 50% of the original so it blocks less of the screen.

### Bug Fixes
- Fixed weapons rendering behind the character's body (now drawn on top), and fixed the awkward angle that made it look like the weapon wasn't actually being held (individually tuned for all 5 main weapons).
- Fixed a bug where new stat cards kept appearing as "New" during level-up even after all 4 stat slots were full.
- Fixed a bug in the Blacksmith where selecting a weapon already equipped in another slot would silently empty that slot.
- Fixed dungeon best-time records: the Enhancement/Heavenly Stone/Spirit Fruit/Taeguk Stone dungeons were all being saved to the same "Infinite Dungeon" record field, and Boss Rush had a casing mismatch that prevented its record from ever saving. Each dungeon now tracks its own record correctly.
- Fixed rarity labels in the shop's pull results and fragment inventory showing Korean text even in English mode.
- Fixed touch-drag not working on empty space (only on clickable elements) across the Blacksmith, Achievement, Building, Dungeon, Shop, Stage Select, Dev Tools, and in-battle Pause/Level-Up screens.
- Fixed the Character screen's weapon/stat sections being split into separate scroll boxes instead of one continuous scroll.

### Art Updates
- Replaced all 6 building list emoji icons (Blacksmith/Companion Hall/Guardian Shrine/Totem Hall/Dragon King Pond/Sacred Tree) with real artwork.
- Replaced Gangnim Chasa/Haewonmaek companion illustrations with new artwork.

## v0.2.3 (2026-07-11)

### New Features
- **Added Five Elements (Oheng) Synergy System**: Main weapons (Talisman/Sword/Bow/Staff/Scythe), companions, and pets now each carry one of five elements (Metal/Wood/Water/Fire/Earth). Main weapons in a "generating" relationship grant each other unique effects (range boost, burn DoT, extended duration, on-kill cooldown stacks, temporary bonus orb on crit), while weapons in an "overcoming" relationship both gain damage at the cost of increased damage taken. Matching the same element across 3+ weapon/companion/pet slots triggers a Trinity bonus plus an orbiting glow effect around your character.
- **Expanded pet rarity tiers and redesigned the 12 Zodiac pets**: Pet rarity expanded from 4 to 7 tiers (Common through Mythos; the top 3 are reserved for future content). Reworked 6 previously-overlapping Zodiac pet effects into gold/special-drop boosts, auto-collection, and companion ATK/DEF/HP buffs.
- **Added fetch AI for the Dog Zodiac pet (Barkley)**: Now walks over to nearby gold/XP/soul items and picks them up directly, with move speed increasing as it levels up.
- **Companion rework**: Renamed 3 companions (Jangseung Guardian / Guardian Spirit / Saengryeong Warrior), remapped rarity to the new 7-tier scheme, and adjusted gacha rates accordingly.
- **Expanded Easy-mode loadout slots**: Easy-mode battle slots now grow from 1 to 2 to 3 based on progress, and slot-count logic was synced across the Blacksmith, Companion, Pet, and Character screens.
- **Renamed all 12 Zodiac pets** with cute Korean and English nicknames.

### Improvements
- **Fixed idle animation for companions**: Companions previously stood completely still during battle; they now have a subtle breathing motion matching the player and pets.
- **Damage Meter now shows 2 decimal places**.
- **Fixed element badges being clipped/invisible** on the Companion and Pet screens.
- **Added a rarity text label to Pet cards**: Previously only a thin color bar indicated rarity, making Common vs. Uncommon hard to distinguish; now shows text like the Companion screen.

### Bug Fixes
- Fixed pet level-up scaling not applying as intended.
- Fixed dropped soul fragments/stones not moving toward the player within magnet range (their update call was missing from the main loop).

## v0.2.2 (2026-07-10)

### New Features
- **Added early-game stage-select tutorial**: For players who haven't entered a battle yet, a pulsing highlight + speech bubble now guides them to the lobby's "Stage" button and to Stage 1, right after the basic controls tutorial.
- **Added Damage Meter**: A new panel in the bottom-left of the battle screen shows each equipped weapon's cumulative total damage, a smoothed 3-second rolling DPS, and a percentage-share bar in real time. Covers all damage paths, including area-of-effect (e.g. Poison Mist) and damage-over-time (e.g. poison) effects.

### Balance
- **Reduced early difficulty spikes**: Lowered monster and boss HP/damage in Chapter 1 (major reduction), Chapter 2 (moderate), and Chapter 3 (slight), so more players can get past the early hurdle and enjoy the game.
- **Reworked Auto-Mode level-up priority logic**: Refined the tier system and fixed several mismatched weapon IDs that were silently preventing the intended priorities from taking effect.

### Improvements
- **Fixed mismatch between weapon hitboxes and their sprites**: Enlarged the hit radius of the Talisman, Bow, Staff, Sword, and several sub-weapons (Goblin Axe, Ghost Hand, Lightning Trap) to better match their visual size, reducing "that should have hit" moments.
- **Added pick confirmation feedback for level-up choices**: Selected cards now flash and show a checkmark so it's clear what was chosen (including in Auto-Mode).
- **Added light homing to Bow and Talisman**: Reduces missed shots caused by aiming drift while moving.
- **Added stage number to the in-battle stage label**.

### Bug Fixes
- Fixed Goblin Axe being nearly invisible on the map due to an alpha rendering bug.
- Fixed Talisman's main shot missing the Transcend Rank 8 pierce bonus.
- Fixed the dev-tools "Add Soul Stone" button writing to the wrong save field.
- Fixed the Blacksmith screen's weapon list scrolling back to the top after tapping Enhance.

---

*Notes for earlier versions will be backfilled later.*
