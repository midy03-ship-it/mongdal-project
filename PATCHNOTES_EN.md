# Mongdal Toemarok Patch Notes

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
