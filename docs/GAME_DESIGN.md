# Arcania — Game Design Reference

## Core Loop
Top-down action roguelike (Hades/Diablo style). Each run: explore procedural dungeon, fight enemies, collect spells, combine them, defeat bosses, go deeper. Death resets the run but permanent meta-progression carries over.

## Run Structure
- **4-6 dungeon levels** per run, target **~30 minutes** per run
- Each level has multiple rooms with mini-bosses of varying strength
- **Dungeon timer** per level — forces player toward the level boss when it expires
- Final level has a **super boss**
- **Boss rooms**: large, lock player in, themed after the spell element they hold

## Spells
- **11 magic types**: Fire, Ice, Earth, Poison, Crystal, Light, Blood, Necrotic, Minion, Lightning, Lunar
- **5 tiers** per type (T1 Basic → T5 Ultimate)
- **Spells are randomized each run** — you don't keep spells between runs
- Start with **1 random spell**, find 2nd within first **10 kills** (increasing chance)
- Earn additional spells from **boss fights** — bosses colored/named after their element
- **4 hotbar slots** for spells
- **Max 2 spells per combo** (not 3)

## Combo System
- **Order matters**: Fire→Ice ≠ Ice→Fire
- **All spells have a combo pair** — no fizzle
- Spell strength based on **1st spell** (primary); 2nd spell is **multiplicative** but lengthens cooldown if higher tier
- Combo cooldown only affects the **primary element's** CD, not the secondary
- Secondary elements don't go on cooldown even if used as primary elsewhere

## Combat
- **Dodge** (Space): i-frames to dodge any attack, 1.5s cooldown. Critical for boss fights.
- **Self-buff** (Shift+Click): casts a buff on yourself based on your spell combo
- **Line of sight**: spells cannot pass through walls
- **Shields**: visually displayed on character, appearance based on spell combo used

## Monsters
- Enemies only aware of player when in **line of sight**
- Enemies hidden in **fog of war**
- M key toggles fog for testing
- Boss projectiles respect line of sight (no shooting through walls)

## Inventory
- **Grid-based** inventory holding spells and items
- Works with **mouse** and keyboard
- Right-click food to cast spells on it (cooking via inventory)
- **4 hotbar slots** assignable from inventory (1-4 keys)

## Cooking & Crafting
- Combine spells + items in hotbar combo queue
- Fire + Meat = Cooked Meat, Fire + Herb + Meat = Spicy Stew, etc.
- Recipes discovered through experimentation

## Dungeon
- Larger rooms, less narrow corridors
- Fog of war with raycasting visibility
- Shop rooms, cooking stations, treasure rooms
- Boss rooms with elemental theming and rank signs

## HUD
- HP bar (no mana)
- Hotbar (4 slots)
- Combo queue display
- Minimap (+/- to zoom)
- Combo compendium for discovered combos

## Meta-Progression
- Permanent stat upgrades between runs (HP, damage, speed)
- Discovered combo recipes persist
- Run history tracking

## Pre-Run Lobby
- Area to run around in before starting
- Future: waiting area for multiplayer teammates

## Controls
- WASD: Move
- Mouse aim + Left Click: Cast spell toward cursor
- Space: Dodge roll (1.5s CD)
- Shift+Click: Self-buff
- 1-4: Queue hotbar slots for combo
- Q: Clear combo queue
- I: Inventory (grid)
- M: Toggle fog of war (debug)
- +/-: Zoom minimap
- ESC: Pause menu
- Right-click: Game context menu (browser right-click disabled)
