# Arcania — Game Design Reference

## Core Loop
Top-down action roguelike (Hades/Diablo style). Each run: explore procedural dungeon, fight enemies, collect spells, combine them, defeat bosses, go deeper. Death resets the run but permanent meta-progression carries over.

## Run Structure
- **5 dungeon levels** per run, target **~30 minutes**
- Each level has multiple rooms: normal combat, mini-bosses, shops, cooking stations
- **Boss tiers**: 2 Entry bosses + 1 Elite boss + 1 Floor Boss per level
- **Dungeon timer**: 5 minutes per floor, teleports to boss at 0
- Floor Boss room has stairs — must kill boss to descend
- Final level has a **super boss**

## Boss System
- Bosses are **dormant** until player enters their room (won't move or take damage)
- Boss rooms **seal** when entered — player locked in until boss defeated
- **Torches** outside boss rooms indicate difficulty: Yellow=Entry, Red=Floor Boss
- Bosses **colored by their element** — they drop that spell type
- **Reward screen** on boss kill: choose Learn/Upgrade Spell OR random reward (HP/damage/gold)

## Spells
- **11 magic types**: Fire, Ice, Earth, Poison, Crystal, Light, Blood, Necrotic, Minion, Lightning, Lunar
- **5 tiers** per type (T1 Basic → T5 Ultimate), T5 has 45-90s cooldowns
- **Spells randomized each run** — start with 1, find 2nd within 10 kills
- Additional spells from **boss fights**
- **4 hotbar slots**
- **Max 2 spells per combo**
- **Shift+Number** cycles spell tier (T1→T2→...→max→T1)

## Combo System
- **Order matters**: Fire→Ice ≠ Ice→Fire
- **All combos produce a result** — no fizzle
- Spell strength based on **1st spell** (primary); 2nd is multiplicative but lengthens CD if higher tier
- Combo cooldown only affects **primary** element; secondary never gets CD

## Combat
- **Dodge** (Space): i-frames, 1.5s cooldown, short dash
- **Self-buff** (Shift+Click): creates element-themed shield, consumes spell cooldown
  - Tier scales shield strength (T1=25hp, T5=65hp)
  - Combo shields show dual-color swirl
- **Shields visible** on character with element color
- **Line of sight**: spells cannot pass through walls

## Monsters
- Only aware of player when in **line of sight** (3s alert after losing sight)
- **Wall-sliding pathfinding** — navigate around corners
- Hidden in **fog of war** (M key toggles for testing)
- Boss projectiles respect LOS

## Summoning
- Minion spells create companion creatures that follow player and attack enemies
- 5 tiers: Imp (1), Golem (1 tank), Horde (5), Monstrosity (1 elite), Legion (20)
- Minions have HP, damage, lifetime, green friendly indicator
- Minion kills grant XP and loot to player

## Inventory
- **Two-column grid**: Spells (left 4 cols) | Items (right 4 cols)
- Works with **mouse and keyboard**
- **Right-click**: Eat food, Inspect items, Queue spells for combo
- **1-4 keys** assign highlighted item/spell to hotbar
- Hotbar persists across floors (not across runs)

## Cooking
- Cooking stations show hint to use hotbar combos
- Fire + Meat = Cooked Meat, etc.
- Combo recipes: order-independent item+spell matching

## Dungeon
- 100x100+ base maps with 8-16 tile rooms, 3-wide corridors
- Extra corridor connections to avoid dead ends
- Fog of war with raycasting visibility
- Room types: normal, spawn, boss, miniboss, shop, cooking, treasure
- Sealed room barriers with pulsing red visual + "SEALED" text

## HUD
- HP bar, XP bar, level, gold
- 4-slot hotbar with tier indicators
- Combo queue display
- Dodge cooldown indicator
- Floor timer (color-coded: white→orange→red)
- Minimap with +/- zoom (centered on player)
- Shield HP above character

## Lobby
- Walkable room with campfire and portal
- Walk to portal and press F to start run
- Shows title, stats, controls
- Quit/death returns here

## Compendium
- In dungeon: shows combos discovered this run only
- In lobby: shows all combos ever discovered across all runs
- Accessible from pause menu

## Controls
| Key | Action |
|-----|--------|
| WASD/Arrows | Move |
| Left Click | Cast spell / execute combo |
| Shift+Click | Self-buff shield |
| Right Click | Context menu (inventory) |
| Space | Dodge roll |
| 1-4 | Queue hotbar for combo / select |
| Shift+1-4 | Cycle spell tier |
| Q | Clear combo queue |
| I | Inventory |
| F | Interact (portal, shops, stairs) |
| M | Toggle fog of war (debug) |
| +/- | Zoom minimap |
| ESC | Pause menu |
