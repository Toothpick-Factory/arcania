# Arcania Spell System Reference

> Source: [Design Spreadsheet](https://docs.google.com/spreadsheets/d/1Yr9-kZu8VMDuTKYR51u1Tclez0QGOeYVu9qpbhEEpks/edit?gid=0#gid=0)
> Last synced: 2026-03-23

## Core Rules

1. **11 Base Magic Types**, each with 5 tiers (T1-T5)
2. **ORDER MATTERS**: Fire+Ice produces a different spell than Ice+Fire
3. **Base spell** determines the primary mechanic; **Modifier** changes its behavior
4. **110 combos per tier** (11 bases × 10 modifiers), **550 total combo spells**

---

## 11 Base Magic Types

| # | Type | Color | Theme | T1 | T2 | T3 | T4 | T5 |
|---|------|-------|-------|----|----|----|----|-----|
| 1 | Fire | #ff4400 | Burn, AoE, raw damage | Ember Spark | Fireball | Magma Orb | Inferno Column | Supernova |
| 2 | Ice | #88ddff | Slow, freeze, control | Frost Bolt | Ice Shards | Glacial Wall | Blizzard Zone | Absolute Zero |
| 3 | Earth | #886644 | Knockback, shields, stun | Pebble Shot | Earthen Aegis | Tremor | Boulder Rain | Continental Shift |
| 4 | Poison | #44cc22 | DoT, debuffs, spreading | Toxic Spit | Miasma Cloud | Venomous Lash | Contagion | Plague Breath |
| 5 | Crystal | #cc88ff | Pierce, reflect, bleed | Glass Shard | Quartz Shield | Prism Beam | Crystal Spire | Diamond Resonance |
| 6 | Light | #ffee88 | Heal, blind, anti-undead | Luminous Bolt | Radiant Flash | Solar Beam | Judgment Ray | Event Horizon |
| 7 | Blood | #cc0022 | Lifesteal, self-buff, HP cost | Siphon | Coagulate | Blood Spear | Hemorrhage | Crimson Pact |
| 8 | Necrotic | #445544 | Debuff, drain, reanimate | Decay | Bone Armor | Soul Reap | Death Fog | Wither & Rot |
| 9 | Minion | #cc6644 | Summons, minion buffs | Summon Imp | Summon Golem | Horde Call | Monstrosity | Undead Legion |
| 10 | Lightning | #ffff00 | Stun, chain, speed | Static Zap | Bolt Strike | Chain Lightning | Thunderclap | Storm Lord's Fury |
| 11 | Lunar | #8888ff | Stealth, gravity, boomerang | Crescent Blade | Moonbeam | Night Veil | Starfall | Eclipse |

---

## Base Spell Details

### Fire
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Ember Spark | A quick, low-cost spark that has a 20% chance to ignite the target |
| T2 | Fireball | A classic explosive projectile dealing moderate AOE fire damage |
| T3 | Magma Orb | A heavy, bouncing orb of lava that leaves a burning trail |
| T4 | Inferno Column | Summons a massive pillar of fire that traps and burns enemies within |
| T5 | Supernova | A screen-wide explosion dealing catastrophic fire damage to all. **Balance: 60s cooldown, costs 20% max HP** |

### Ice
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Frost Bolt | A single shard of ice that applies a minor slow (Chilled) |
| T2 | Ice Shards | Fires a fan of 3 shards that deal high piercing damage |
| T3 | Glacial Wall | Creates a solid barrier of ice that blocks movement and projectiles |
| T4 | Blizzard Zone | Creates a large area of extreme cold, periodically freezing enemies |
| T5 | Absolute Zero | Freezes all visible enemies and stops time for 2s. **Balance: 45s cooldown, once per floor** |

### Earth
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Pebble Shot | A high-velocity stone that deals physical damage and high knockback |
| T2 | Earthen Aegis | Surrounds the caster in stone plates, granting a temporary shield |
| T3 | Tremor | Slams the ground, dealing damage and staggering nearby enemies |
| T4 | Boulder Rain | Summons massive rocks from the sky to crush enemies in a large area |
| T5 | Continental Shift | Reorders the battlefield, dealing massive damage and trapping foes. **Balance: 60s cooldown** |

### Poison
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Toxic Spit | A short-range burst of acid that deals minor damage over time |
| T2 | Miasma Cloud | Creates a lingering cloud of toxic gas that drains enemy HP |
| T3 | Venomous Lash | A whip of poison that deals damage and pulls the target closer |
| T4 | Contagion | An infectious disease that spreads from target to target automatically |
| T5 | Plague Breath | A continuous stream of lethal gas that reduces enemy stats by 50%. **Balance: 45s cooldown, 5s duration** |

### Crystal
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Glass Shard | A fragile shard that shatters on impact, dealing bleeding damage |
| T2 | Quartz Shield | A transparent shield that reflects 10% of magic damage |
| T3 | Prism Beam | A continuous laser that gains damage the longer it stays on a target |
| T4 | Crystal Spire | Summons a tall crystal that fires lasers at the three nearest enemies |
| T5 | Diamond Resonance | Causes every crystal on the map to pulse with lethal sonic energy. **Balance: 50s cooldown** |

### Light
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Luminous Bolt | A bolt of pure energy that deals 2x damage to undead/demons |
| T2 | Radiant Flash | A quick burst of light that blinds all enemies in a 5m radius |
| T3 | Solar Beam | A powerful concentrated beam of light with high armor penetration |
| T4 | Judgment Ray | A vertical beam from the heavens that executes low-health mobs |
| T5 | Event Horizon | A sphere of holy light that makes player invulnerable while inside. **Balance: 60s cooldown, 4s duration, immobile** |

### Blood
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Siphon | Drains a small amount of HP from the target to heal the caster |
| T2 | Coagulate | Hardens the caster's blood, increasing armor for a short duration |
| T3 | Blood Spear | Throws a lance of blood that pierces through all enemies in a line |
| T4 | Hemorrhage | Causes the target to lose a percentage of health every time they move |
| T5 | Crimson Pact | Consumes 20% HP to grant 300% damage and 100% lifesteal. **Balance: 45s cooldown, 8s duration** |

### Necrotic
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Decay | A curse that slowly withers the target's physical defense |
| T2 | Bone Armor | Summons a cage of ribs that absorbs 3 heavy physical hits |
| T3 | Soul Reap | A wide scythe swing that restores energy for every enemy hit |
| T4 | Death Fog | A thick fog that conceals the player and drains enemy life |
| T5 | Wither & Rot | A massive zone where enemies lose 5% of their Max HP per second (reduced from 10%). **Balance: 60s cooldown, 6s duration** |

### Minion
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Summon Imp | Summons a small fire-spitting imp that lasts for 30 seconds |
| T2 | Summon Golem | Summons a sturdy stone golem to tank hits and taunt enemies |
| T3 | Horde Call | Summons a swarm of 5 temporary skeletons to rush the target |
| T4 | Monstrosity | Merges all active minions into one giant, elite horror |
| T5 | Undead Legion | Summons an army of 20 skeletons that last for 30s (not permanent). **Balance: 90s cooldown** |

### Lightning
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Static Zap | A quick spark that jump-starts the target, causing a short stagger |
| T2 | Bolt Strike | A precision lightning bolt that deals high single-target damage |
| T3 | Chain Lightning | Lightning that jumps between up to 5 targets within 10 meters |
| T4 | Thunderclap | A massive AOE blast of sound and electricity that stuns all foes |
| T5 | Storm Lord's Fury | Turns the player into a conduit, auto-striking all nearby enemies. **Balance: 60s cooldown, 6s duration** |

### Lunar
| Tier | Spell | Description |
|------|-------|-------------|
| T1 | Crescent Blade | A curved projectile that returns to the player like a boomerang |
| T2 | Moonbeam | A vertical beam that follows the target, dealing ticking damage |
| T3 | Night Veil | Grants the player invisibility for 5 seconds or until they attack |
| T4 | Starfall | Summons multiple small meteors that deal magic/lunar damage |
| T5 | Eclipse | Plunges the map into darkness, confusing and slowing all enemies. **Balance: 60s cooldown, 8s duration** |

---

## T5 Balance Rules

All Tier 5 (Ultimate) spells have:
- **Long cooldowns** (45-90 seconds)
- **Limited duration** (not permanent effects)
- Some require **HP cost** or have other trade-offs
- Some are **once per floor** for the most powerful effects

---

## Status Effects Reference

| Effect | Description | Primary Sources |
|--------|-------------|-----------------|
| Burn/Ignite | Fire DoT, ticks damage | Fire spells |
| Chilled | Movement speed reduction (minor) | Ice T1-T2 |
| Frozen | Complete movement stop | Ice T3+, many combos |
| Knockback | Push enemies away from impact | Earth, Wind combos |
| Shield | Temporary damage absorption | Earth T2, Crystal T2, Blood T2 |
| Bleed | Physical DoT | Crystal T1, Blood combos |
| Poison | Stacking damage over time | All Poison spells |
| Blind | Enemies can't target/see | Light T2, fire+light combos |
| Stun/Stagger | Brief inability to act | Earth T3, Lightning |
| Lifesteal | Heal from damage dealt | Blood spells |
| Silence | Enemies can't cast spells | Lunar+Light combos |
| Confusion | Enemies attack each other | Lunar/Poison combos |
| Armor Penetration | Ignore portion of defense | Crystal, beams |
| Chain | Damage jumps between targets | Lightning T3+ |
| Invisibility | Can't be targeted | Lunar T3 |
| Reanimate | Dead enemies become allies | Necrotic combos |
| Gravity Pull | Draw enemies to a point | Lunar+Earth combos |
| Reflect | Return damage to attacker | Crystal shield combos |
| Execute | Instant kill below HP threshold | Light T4, Necrotic combos |
| Taunt | Force enemies to attack target | Earth golems, Crystal spire |
| Haste | Increased attack/move speed | Lightning+Blood combos |

---

## Tier 1 Combo Spells (ORDER MATTERS)

Format: **Base + Modifier → Result** | Description

### Ember Spark (Fire) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Ice | Scalding Steam | AOE cloud that blinds and deals fire damage |
| Earth | Magma Shard | Impact damage plus a lingering lava pool |
| Poison | Toxic Smoke | Projectile that explodes into a poisonous gas |
| Crystal | Crystalline Flash | Spark reflects off armor, jumping to a 2nd foe at 50% damage |
| Light | Radiant Pyre | Holy fire that marks targets for extra damage |
| Blood | Boiling Blood | Damage increases as the target's HP drops |
| Necrotic | Ghostfire | Ethereal flame that bypasses physical armor |
| Minion | Fire Sprite | Imbues your minion with a temporary fire aura |
| Lightning | Plasma Bolt | High-speed projectile with 2x crit damage |
| Lunar | Nightflare | Flame that deals 50% more damage in darkness |

### Frost Bolt (Ice) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Flash Melt | Huge burst damage that removes the Frozen status |
| Earth | Permafrost | Slippery ground that applies Chilled status |
| Poison | Cryo-Toxin | Slows enemy movement and attack speed by 50% |
| Crystal | Frost Diamond | High-defense armor that returns cold damage |
| Light | Prismatic Frost | Frozen targets refract light to hit 3 nearby enemies |
| Blood | Frozen Veins | Stops all enemy healing and regeneration |
| Necrotic | Lich Touch | Drains life and slows target cooldowns |
| Minion | Snow Golem | Gives minions a chance to freeze on hit |
| Lightning | Storm Sleet | Massive knockback with freezing projectiles |
| Lunar | Midnight Frost | Ice damage that ignores a portion of magic armor |

### Pebble Shot (Earth) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Molten Pebble | Superheated stone that leaves a high-damage lava pool |
| Ice | Frost-Bound Soil | Hardened earth that shatters into freezing caltrops |
| Poison | Corrosive Mud | Reduces enemy physical armor on impact |
| Crystal | Quartz Spike | High physical damage with armor penetration |
| Light | Hallowed Ground | Small AOE that heals the player standing within it |
| Blood | Iron Blood | Increases player defense based on current HP |
| Necrotic | Fossilize | Briefly turns the enemy to stone (Stun) |
| Minion | Stone Skin | Grants minions 50% physical damage reduction |
| Lightning | Magnetic Pull | Pulls metal-armored enemies toward the impact |
| Lunar | Lunar Pull | The stone creates a localized gravity spike |

### Toxic Spit (Poison) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Soot Cloud | Caustic liquid ignites into blinding, choking smoke |
| Ice | Frost-Venom | Freezing toxin that drastically reduces attack speed |
| Earth | Sludge Bomb | Toxic mud that roots the target while ticking poison |
| Crystal | Venom Shard | Crystal that shatters and poisons nearby targets |
| Light | Illuminated Virus | Poisoned enemies are visible through walls |
| Blood | Septic Strike | Deals bonus damage if the target is bleeding |
| Necrotic | Wither | Reduces enemy attack damage by 25% |
| Minion | Plague Swarm | Minions spread poison to any enemy they touch |
| Lightning | Toxin Spark | Lightning that spreads poison via chain-hits |
| Lunar | Night Shade | Poison that reduces enemy line-of-sight |

### Glass Shard (Crystal) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Prism Laser | Fire reflects off crystals to hit multiple targets |
| Ice | Crystal Ice | Crystal coated in ice that slows and bleeds |
| Earth | Geo-Crystal | Crystal embeds in ground, creating a damage zone |
| Poison | Toxic Prism | Crystal refracts poison into a wide cone |
| Light | Refractive Beam | Light beam that splits when hitting a crystal |
| Blood | Blood Crystal | Restores a small amount of HP on crit |
| Necrotic | Soul Shard | Restores a small amount of energy on kill |
| Minion | Crystal Shell | Gives minions a reflective damage shield |
| Lightning | Conductive Prism | Crystals extend the range of chain lightning |
| Lunar | Moonstone Spike | High-crit crystal damage with silent cast |

### Luminous Bolt (Light) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Solar Bolt | Light-infused fire that blinds and burns on impact |
| Ice | Aurora Bolt | Bolt that freezes and creates a healing zone |
| Earth | Holy Stone | Bolt consecrates the ground on impact, damaging undead |
| Poison | Cleansing Light | Bolt purifies poison on the player, dealing it to enemies |
| Crystal | Refractive Bolt | Bolt splits into 3 on contact with any surface |
| Blood | Sacred Blood | Converts 10% of damage dealt into healing |
| Necrotic | Twilight | Deals damage and briefly blinds the target |
| Minion | Guardian Angel | Minions pulse with a healing aura |
| Lightning | Flashbolt | Lightning that blinds and staggers targets |
| Lunar | Lunar Eclipse | Silences all enemies in a large radius |

### Siphon (Blood) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Blood Flame | Life-draining fire that heals more the lower your HP |
| Ice | Frozen Veins | Stops all enemy healing and regeneration |
| Earth | Iron Blood | Increases player defense based on current HP |
| Poison | Septic Strike | Deals bonus damage if the target is bleeding |
| Crystal | Crimson Shard | Blood crystallizes into a piercing projectile with lifesteal |
| Light | Purifying Drain | Drains life and removes one debuff from the player |
| Necrotic | Vampirism | Next attack has 50% lifesteal |
| Minion | Frenzy | Increases minion attack speed when player is hit |
| Lightning | Cardiac Arrest | Lightning deals massive damage to bleeding targets |
| Lunar | Moon-Crazed | Increases physical damage at the cost of defense |

### Decay (Necrotic) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Ghostfire | Ethereal flame that bypasses physical armor |
| Ice | Lich Touch | Drains life and slows target cooldowns |
| Earth | Fossilize | Briefly turns the enemy to stone (Stun) |
| Poison | Blight Curse | Curse that amplifies all poison damage by 50% |
| Crystal | Soul Shard | Restores a small amount of energy on kill |
| Light | Fading Light | Curse that reduces enemy damage by 30% |
| Blood | Dark Pact | Curse that makes the next hit deal 3x damage but costs 10% HP |
| Minion | Reanimate | Chance to raise a small skeleton on kill |
| Lightning | Death Bolt | Purple lightning that prevents health regen |
| Lunar | Abyssal Rift | Opens a dark portal that deals heavy DOT |

### Summon Imp (Minion) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Fire Sprite | Imbues your minion with a permanent fire aura |
| Ice | Snow Golem | Gives minions a chance to freeze on hit |
| Earth | Stone Skin | Grants minions 50% physical damage reduction |
| Poison | Plague Swarm | Minions spread poison to any enemy they touch |
| Crystal | Crystal Shell | Gives minions a reflective damage shield |
| Light | Guardian Angel | Minions pulse with a healing aura |
| Blood | Frenzy | Increases minion attack speed when player is hit |
| Necrotic | Reanimate | Chance to raise a small skeleton on kill |
| Lightning | Battery | Minion acts as a mobile shock-aura for player |
| Lunar | Waxing Horde | Increases minion count for a limited time |

### Static Zap (Lightning) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Plasma Bolt | High-speed projectile with 2x crit damage |
| Ice | Storm Sleet | Massive knockback with freezing projectiles |
| Earth | Magnetic Pull | Pulls metal-armored enemies toward the impact |
| Poison | Toxin Spark | Lightning that spreads poison via chain-hits |
| Crystal | Conductive Prism | Crystals extend the range of chain lightning |
| Light | Flashbolt | Lightning that blinds and staggers targets |
| Blood | Cardiac Arrest | Lightning deals massive damage to bleeding targets |
| Necrotic | Death Bolt | Purple lightning that prevents health regen |
| Minion | Battery | Minion acts as a mobile shock-aura for player |
| Lunar | Short Circuit | Drains enemy stamina and prevents dashing |

### Crescent Blade (Lunar) + Modifier
| Modifier | Result | Effect |
|----------|--------|--------|
| Fire | Nightflare | Flame that deals 50% more damage in darkness |
| Ice | Midnight Frost | Ice damage that ignores a portion of magic armor |
| Earth | Gravity Well | Earth magic that pulls enemies toward a point |
| Poison | Night Shade | Poison that reduces enemy line-of-sight |
| Crystal | Moonstone Spike | High-crit crystal damage with silent cast |
| Light | Lunar Eclipse | Silences all enemies in a large radius |
| Blood | Moon-Crazed | Increases physical damage at the cost of defense |
| Necrotic | Abyssal Rift | Opens a dark portal that deals heavy DOT |
| Minion | Waxing Horde | Increases minion count for a limited time |
| Lightning | Short Circuit | Drains enemy stamina and prevents dashing |

---

## Duplicate Fix Tracking (Fix #1)

45 of 55 T1 combo pairs had identical results for A+B and B+A. The following pairs were **renamed** to create unique results. The "Base" version keeps the original name; the reversed version gets a new unique name and effect.

| Pair | Original (kept as-is) | Reversed (NEW unique spell) |
|------|----------------------|---------------------------|
| Light+Fire / Fire+Light | Fire+Light = Radiant Pyre | Light+Fire = Solar Bolt (light-infused fire, blinds+burns) |
| Blood+Fire / Fire+Blood | Fire+Blood = Boiling Blood | Blood+Fire = Blood Flame (life-draining fire, heals more at low HP) |
| Crystal+Ice / Ice+Crystal | Ice+Crystal = Frost Diamond | Crystal+Ice = Crystal Ice (ice-coated crystal, slows+bleeds) |
| Light+Ice / Ice+Light | Ice+Light = Prismatic Frost | Light+Ice = Aurora Bolt (freezes+creates healing zone) |
| Earth+Light / Light+Earth | Earth+Light = Hallowed Ground | Light+Earth = Holy Stone (consecrates ground vs undead) |
| Blood+Light / Light+Blood | Blood+Light = Sacred Blood (kept) | Light+Blood = Sacred Blood (kept - both healing-themed, same is OK) |
| Crystal+Earth / Earth+Crystal | Earth+Crystal = Quartz Spike | Crystal+Earth = Geo-Crystal (embeds in ground, damage zone) |
| Poison+Crystal / Crystal+Poison | Poison+Crystal = Venom Shard | Crystal+Poison = Toxic Prism (refracts poison in cone) |
| Light+Poison / Poison+Light | Poison+Light = Illuminated Virus | Light+Poison = Cleansing Light (purifies self, damages enemies) |
| Blood+Poison / Poison+Blood | Poison+Blood = Septic Strike (kept both) | Blood+Poison = Septic Strike (kept - synergy makes sense both ways) |
| Necrotic+Fire / Fire+Necrotic | Fire+Necrotic = Ghostfire (kept both) | Necrotic+Fire = Ghostfire (kept - ethereal fire works both ways) |
| Necrotic+Poison / Poison+Necrotic | Poison+Necrotic = Wither | Necrotic+Poison = Blight Curse (amplifies poison damage by 50%) |
| Necrotic+Blood / Blood+Necrotic | Blood+Necrotic = Vampirism (kept) | Necrotic+Blood = Dark Pact (3x next hit, costs 10% HP) |
| Necrotic+Light / Light+Necrotic | Light+Necrotic = Twilight (kept) | Necrotic+Light = Fading Light (curse reduces enemy damage 30%) |
| Blood+Crystal / Crystal+Blood | Crystal+Blood = Blood Crystal (kept) | Blood+Crystal = Crimson Shard (blood crystallizes, piercing+lifesteal) |

*Note: Some symmetric pairs were intentionally kept the same where the effect makes equal sense from both perspectives (e.g., Minion buffs, Sacred Blood). Full dedup of all 45 is a larger design task tracked for future spreadsheet updates.*

---

## Fire Defensive Combos Added (Fix #4)

Fire previously had almost no defensive options. These combos were added/adjusted:

| Combo | Name | Effect |
|-------|------|--------|
| Fire + Blood (T1) | Boiling Blood | Now also grants 10% damage reduction for 3s |
| Fire + Earth (T2) | Magma Shell | Shield deals fire damage to attackers AND grants fire immunity |
| Fire + Blood (T2) | Cauterize | Heals 20% HP (removed "removes offensive buffs" penalty) |
| Fire + Light (T3) | Solar Flare Orb | Now also creates a brief shield of light on cast |

---

## Notes for Implementation

- Current code has 15 magic types; needs to be reduced to 11 (remove arcane, thorns, wind, holy → replaced by light)
- Tier 2-5 combo tables follow the same structure as T1 (stored in spreadsheet tabs)
- T5 balance limits should be enforced as special cooldown rules in game logic
- The combo system currently treats order as irrelevant; needs to be updated to be order-dependent
