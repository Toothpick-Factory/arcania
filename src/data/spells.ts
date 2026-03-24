// ============================================================
// 11 Magic Types — from docs/SPELLS.md
// Removed: thorns, arcane, holy, wind, illusion
// Added: light (replaces holy)
// ============================================================

export type MagicType =
  | 'fire' | 'ice' | 'earth' | 'poison' | 'crystal'
  | 'light' | 'blood' | 'necrotic'
  | 'minion' | 'lightning' | 'lunar';

export const ALL_MAGIC_TYPES: MagicType[] = [
  'fire', 'ice', 'earth', 'poison', 'crystal',
  'light', 'blood', 'necrotic',
  'minion', 'lightning', 'lunar',
];

export type SpellTier = 1 | 2 | 3 | 4 | 5;

export const TIER_NAMES: Record<SpellTier, string> = {
  1: 'Basic', 2: 'Intermediate', 3: 'Advanced', 4: 'Elite', 5: 'Ultimate',
};

export const TIER_XP_THRESHOLDS: Record<SpellTier, number> = {
  1: 0, 2: 40, 3: 120, 4: 280, 5: 600,
};

export type SpellBehavior = 'projectile' | 'aoe' | 'beam' | 'shield' | 'summon' | 'self' | 'zone';

export interface SpellDef {
  id: string;
  name: string;
  magicType: MagicType;
  tier: SpellTier;
  description: string;
  baseDamage: number;
  manaCost: number;
  cooldown: number;
  range: number;
  projectileSpeed: number;
  aoeRadius: number;
  color: string;
  secondaryColor: string;
  behavior: SpellBehavior;
  slowAmount?: number;
  slowDuration?: number;
  dotDamage?: number;
  dotDuration?: number;
  dotTickRate?: number;
  healAmount?: number;
  shieldAmount?: number;
  shieldDuration?: number;
  lifesteal?: number;
  stunDuration?: number;
  knockbackForce?: number;
  piercing?: boolean;
  chainTargets?: number;
  minionCount?: number;
  minionDuration?: number;
}

export interface ComboSpellDef extends SpellDef {
  baseElement: MagicType;   // the spell cast first (primary)
  modElement: MagicType;    // the modifier (secondary) — ORDER MATTERS
}

// ============================================================
// BASE SPELLS — 11 types × 5 tiers = 55 spells
// ============================================================

const FIRE: SpellDef[] = [
  { id: 'ember_spark', name: 'Ember Spark', magicType: 'fire', tier: 1, description: 'A quick spark with 20% chance to ignite', baseDamage: 15, manaCost: 10, cooldown: 0.6, range: 280, projectileSpeed: 350, aoeRadius: 0, color: '#ff4400', secondaryColor: '#ff8800', behavior: 'projectile' },
  { id: 'fireball', name: 'Fireball', magicType: 'fire', tier: 2, description: 'Explosive projectile dealing moderate AOE fire damage', baseDamage: 28, manaCost: 18, cooldown: 1.0, range: 300, projectileSpeed: 300, aoeRadius: 50, color: '#ff5500', secondaryColor: '#ffaa00', behavior: 'projectile', dotDamage: 4, dotDuration: 2, dotTickRate: 0.5 },
  { id: 'magma_orb', name: 'Magma Orb', magicType: 'fire', tier: 3, description: 'Bouncing lava orb that leaves a burning trail', baseDamage: 45, manaCost: 30, cooldown: 1.5, range: 300, projectileSpeed: 200, aoeRadius: 70, color: '#ff3300', secondaryColor: '#cc6600', behavior: 'projectile', dotDamage: 8, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'inferno_column', name: 'Inferno Column', magicType: 'fire', tier: 4, description: 'Massive pillar of fire that traps and burns', baseDamage: 70, manaCost: 45, cooldown: 2.5, range: 250, projectileSpeed: 0, aoeRadius: 90, color: '#ff2200', secondaryColor: '#ffcc00', behavior: 'zone', dotDamage: 12, dotDuration: 4, dotTickRate: 0.3 },
  { id: 'supernova', name: 'Supernova', magicType: 'fire', tier: 5, description: 'Screen-wide catastrophic fire explosion', baseDamage: 120, manaCost: 80, cooldown: 60, range: 0, projectileSpeed: 0, aoeRadius: 200, color: '#ffffff', secondaryColor: '#ff4400', behavior: 'aoe', knockbackForce: 400 },
];

const ICE: SpellDef[] = [
  { id: 'frost_bolt', name: 'Frost Bolt', magicType: 'ice', tier: 1, description: 'Ice shard that applies Chilled (minor slow)', baseDamage: 12, manaCost: 10, cooldown: 0.7, range: 300, projectileSpeed: 320, aoeRadius: 0, color: '#88ddff', secondaryColor: '#ffffff', behavior: 'projectile', slowAmount: 0.3, slowDuration: 2 },
  { id: 'ice_shards', name: 'Ice Shards', magicType: 'ice', tier: 2, description: 'Fan of 3 piercing shards', baseDamage: 18, manaCost: 16, cooldown: 0.9, range: 250, projectileSpeed: 400, aoeRadius: 0, color: '#66ccff', secondaryColor: '#cceeff', behavior: 'projectile', piercing: true, slowAmount: 0.2, slowDuration: 1.5 },
  { id: 'glacial_wall', name: 'Glacial Wall', magicType: 'ice', tier: 3, description: 'Barrier of ice that blocks movement and projectiles', baseDamage: 30, manaCost: 28, cooldown: 3.0, range: 200, projectileSpeed: 0, aoeRadius: 50, color: '#44aaff', secondaryColor: '#aaddff', behavior: 'zone', slowAmount: 0.6, slowDuration: 3, shieldAmount: 30, shieldDuration: 5 },
  { id: 'blizzard_zone', name: 'Blizzard Zone', magicType: 'ice', tier: 4, description: 'Extreme cold area that periodically freezes enemies', baseDamage: 55, manaCost: 45, cooldown: 4.0, range: 250, projectileSpeed: 0, aoeRadius: 120, color: '#aaddff', secondaryColor: '#ffffff', behavior: 'zone', slowAmount: 0.7, slowDuration: 4, dotDamage: 10, dotDuration: 5, dotTickRate: 0.5 },
  { id: 'absolute_zero', name: 'Absolute Zero', magicType: 'ice', tier: 5, description: 'Freezes all visible enemies, stops time for 2s', baseDamage: 90, manaCost: 70, cooldown: 45, range: 0, projectileSpeed: 0, aoeRadius: 200, color: '#ffffff', secondaryColor: '#88ddff', behavior: 'aoe', stunDuration: 2, slowAmount: 0.9, slowDuration: 5 },
];

const EARTH: SpellDef[] = [
  { id: 'pebble_shot', name: 'Pebble Shot', magicType: 'earth', tier: 1, description: 'High-velocity stone with knockback', baseDamage: 18, manaCost: 10, cooldown: 0.8, range: 220, projectileSpeed: 280, aoeRadius: 0, color: '#886644', secondaryColor: '#aa8866', behavior: 'projectile', knockbackForce: 100 },
  { id: 'earthen_aegis', name: 'Earthen Aegis', magicType: 'earth', tier: 2, description: 'Stone plates grant a temporary shield', baseDamage: 0, manaCost: 20, cooldown: 5.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#997755', secondaryColor: '#bbaa88', behavior: 'self', shieldAmount: 50, shieldDuration: 8 },
  { id: 'tremor', name: 'Tremor', magicType: 'earth', tier: 3, description: 'Ground slam dealing damage and staggering enemies', baseDamage: 35, manaCost: 30, cooldown: 2.5, range: 0, projectileSpeed: 0, aoeRadius: 100, color: '#775533', secondaryColor: '#aa8855', behavior: 'aoe', stunDuration: 1.5, knockbackForce: 150 },
  { id: 'boulder_rain', name: 'Boulder Rain', magicType: 'earth', tier: 4, description: 'Massive rocks from the sky crush enemies', baseDamage: 65, manaCost: 45, cooldown: 3.5, range: 280, projectileSpeed: 0, aoeRadius: 100, color: '#664422', secondaryColor: '#886644', behavior: 'zone', stunDuration: 1, knockbackForce: 200 },
  { id: 'continental_shift', name: 'Continental Shift', magicType: 'earth', tier: 5, description: 'Reorders the battlefield, massive damage and trapping', baseDamage: 110, manaCost: 75, cooldown: 60, range: 0, projectileSpeed: 0, aoeRadius: 200, color: '#553311', secondaryColor: '#886644', behavior: 'aoe', stunDuration: 2.5, knockbackForce: 350 },
];

const POISON: SpellDef[] = [
  { id: 'toxic_spit', name: 'Toxic Spit', magicType: 'poison', tier: 1, description: 'Short-range acid dealing minor DoT', baseDamage: 8, manaCost: 8, cooldown: 0.5, range: 260, projectileSpeed: 300, aoeRadius: 0, color: '#44cc22', secondaryColor: '#88ff44', behavior: 'projectile', dotDamage: 4, dotDuration: 4, dotTickRate: 0.5 },
  { id: 'miasma_cloud', name: 'Miasma Cloud', magicType: 'poison', tier: 2, description: 'Lingering toxic gas that drains HP', baseDamage: 10, manaCost: 18, cooldown: 2.0, range: 200, projectileSpeed: 0, aoeRadius: 60, color: '#33aa11', secondaryColor: '#66dd33', behavior: 'zone', dotDamage: 6, dotDuration: 5, dotTickRate: 0.5 },
  { id: 'venomous_lash', name: 'Venomous Lash', magicType: 'poison', tier: 3, description: 'Poison whip that damages and pulls the target', baseDamage: 28, manaCost: 24, cooldown: 1.2, range: 200, projectileSpeed: 450, aoeRadius: 0, color: '#22bb00', secondaryColor: '#aaff66', behavior: 'beam', piercing: true, dotDamage: 8, dotDuration: 4, dotTickRate: 0.3 },
  { id: 'contagion', name: 'Contagion', magicType: 'poison', tier: 4, description: 'Infectious disease spreading target to target', baseDamage: 20, manaCost: 40, cooldown: 4.0, range: 250, projectileSpeed: 350, aoeRadius: 80, color: '#119900', secondaryColor: '#44ff22', behavior: 'projectile', dotDamage: 15, dotDuration: 8, dotTickRate: 0.5, chainTargets: 3 },
  { id: 'plague_breath', name: 'Plague Breath', magicType: 'poison', tier: 5, description: 'Lethal gas stream reducing enemy stats by 50%', baseDamage: 50, manaCost: 70, cooldown: 45, range: 0, projectileSpeed: 0, aoeRadius: 170, color: '#008800', secondaryColor: '#44ff00', behavior: 'aoe', dotDamage: 20, dotDuration: 5, dotTickRate: 0.3, slowAmount: 0.5, slowDuration: 5 },
];

const CRYSTAL: SpellDef[] = [
  { id: 'glass_shard', name: 'Glass Shard', magicType: 'crystal', tier: 1, description: 'Razor shard that shatters on impact causing bleed', baseDamage: 16, manaCost: 10, cooldown: 0.5, range: 300, projectileSpeed: 420, aoeRadius: 0, color: '#ccddff', secondaryColor: '#eeeeff', behavior: 'projectile', piercing: true },
  { id: 'quartz_shield', name: 'Quartz Shield', magicType: 'crystal', tier: 2, description: 'Transparent shield reflecting 10% magic damage', baseDamage: 0, manaCost: 18, cooldown: 4.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#ddccff', secondaryColor: '#ffddff', behavior: 'self', shieldAmount: 40, shieldDuration: 6 },
  { id: 'prism_beam', name: 'Prism Beam', magicType: 'crystal', tier: 3, description: 'Laser gaining damage the longer it stays on target', baseDamage: 40, manaCost: 28, cooldown: 1.8, range: 320, projectileSpeed: 600, aoeRadius: 0, color: '#ff88ff', secondaryColor: '#88ffff', behavior: 'beam', chainTargets: 2 },
  { id: 'crystal_spire', name: 'Crystal Spire', magicType: 'crystal', tier: 4, description: 'Tall crystal firing lasers at 3 nearest enemies', baseDamage: 55, manaCost: 40, cooldown: 3.0, range: 250, projectileSpeed: 0, aoeRadius: 70, color: '#cc88ff', secondaryColor: '#ffccff', behavior: 'zone', stunDuration: 2, shieldAmount: 20, shieldDuration: 4 },
  { id: 'diamond_resonance', name: 'Diamond Resonance', magicType: 'crystal', tier: 5, description: 'Every crystal pulses with lethal sonic energy', baseDamage: 100, manaCost: 65, cooldown: 50, range: 0, projectileSpeed: 0, aoeRadius: 150, color: '#ffffff', secondaryColor: '#cc88ff', behavior: 'aoe', shieldAmount: 60, shieldDuration: 8, stunDuration: 1.5 },
];

const LIGHT: SpellDef[] = [
  { id: 'luminous_bolt', name: 'Luminous Bolt', magicType: 'light', tier: 1, description: 'Pure energy bolt, 2x damage to undead', baseDamage: 14, manaCost: 12, cooldown: 0.8, range: 280, projectileSpeed: 380, aoeRadius: 0, color: '#ffee88', secondaryColor: '#ffffff', behavior: 'projectile', healAmount: 5 },
  { id: 'radiant_flash', name: 'Radiant Flash', magicType: 'light', tier: 2, description: 'Burst of light blinding all enemies in 5m', baseDamage: 20, manaCost: 20, cooldown: 2.0, range: 0, projectileSpeed: 0, aoeRadius: 80, color: '#ffdd44', secondaryColor: '#ffffff', behavior: 'aoe', stunDuration: 1, healAmount: 8 },
  { id: 'solar_beam', name: 'Solar Beam', magicType: 'light', tier: 3, description: 'Concentrated light beam with armor penetration', baseDamage: 50, manaCost: 30, cooldown: 1.5, range: 350, projectileSpeed: 700, aoeRadius: 0, color: '#ffff00', secondaryColor: '#ffffff', behavior: 'beam', healAmount: 10 },
  { id: 'judgment_ray', name: 'Judgment Ray', magicType: 'light', tier: 4, description: 'Beam from the heavens that executes low-HP mobs', baseDamage: 70, manaCost: 45, cooldown: 3.0, range: 350, projectileSpeed: 700, aoeRadius: 50, color: '#ffff00', secondaryColor: '#ffffff', behavior: 'beam', healAmount: 15 },
  { id: 'event_horizon', name: 'Event Horizon', magicType: 'light', tier: 5, description: 'Sphere of holy light, player invulnerable inside (4s)', baseDamage: 100, manaCost: 80, cooldown: 60, range: 0, projectileSpeed: 0, aoeRadius: 180, color: '#ffffff', secondaryColor: '#ffee88', behavior: 'aoe', healAmount: 100, shieldAmount: 50, shieldDuration: 4 },
];

const BLOOD: SpellDef[] = [
  { id: 'siphon', name: 'Siphon', magicType: 'blood', tier: 1, description: 'Drains HP from target to heal caster', baseDamage: 12, manaCost: 8, cooldown: 0.7, range: 200, projectileSpeed: 350, aoeRadius: 0, color: '#cc0022', secondaryColor: '#ff4466', behavior: 'projectile', lifesteal: 0.3 },
  { id: 'coagulate', name: 'Coagulate', magicType: 'blood', tier: 2, description: 'Hardens blood to increase armor', baseDamage: 0, manaCost: 15, cooldown: 4.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#880011', secondaryColor: '#cc4444', behavior: 'self', shieldAmount: 45, shieldDuration: 6 },
  { id: 'blood_spear', name: 'Blood Spear', magicType: 'blood', tier: 3, description: 'Lance of blood that pierces all enemies', baseDamage: 38, manaCost: 25, cooldown: 1.5, range: 300, projectileSpeed: 500, aoeRadius: 0, color: '#aa0022', secondaryColor: '#ff2244', behavior: 'projectile', piercing: true, lifesteal: 0.4 },
  { id: 'hemorrhage', name: 'Hemorrhage', magicType: 'blood', tier: 4, description: 'Enemies lose HP% every time they move', baseDamage: 30, manaCost: 40, cooldown: 3.5, range: 0, projectileSpeed: 0, aoeRadius: 120, color: '#660011', secondaryColor: '#cc0022', behavior: 'aoe', dotDamage: 12, dotDuration: 6, dotTickRate: 0.3, lifesteal: 0.25 },
  { id: 'crimson_pact', name: 'Crimson Pact', magicType: 'blood', tier: 5, description: 'Consume 20% HP for 300% damage and 100% lifesteal (8s)', baseDamage: 140, manaCost: 50, cooldown: 45, range: 0, projectileSpeed: 0, aoeRadius: 160, color: '#440000', secondaryColor: '#ff0022', behavior: 'aoe', lifesteal: 1.0 },
];

const NECROTIC: SpellDef[] = [
  { id: 'decay', name: 'Decay', magicType: 'necrotic', tier: 1, description: 'Curse that withers physical defense', baseDamage: 10, manaCost: 10, cooldown: 0.6, range: 260, projectileSpeed: 300, aoeRadius: 0, color: '#445544', secondaryColor: '#778877', behavior: 'projectile', dotDamage: 5, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'bone_armor', name: 'Bone Armor', magicType: 'necrotic', tier: 2, description: 'Cage of ribs absorbing 3 heavy hits', baseDamage: 8, manaCost: 18, cooldown: 5.0, range: 0, projectileSpeed: 0, aoeRadius: 40, color: '#ddddaa', secondaryColor: '#eeeecc', behavior: 'self', shieldAmount: 40, shieldDuration: 10 },
  { id: 'soul_reap', name: 'Soul Reap', magicType: 'necrotic', tier: 3, description: 'Scythe swing restoring energy per enemy hit', baseDamage: 50, manaCost: 30, cooldown: 2.0, range: 150, projectileSpeed: 0, aoeRadius: 80, color: '#336633', secondaryColor: '#88aa88', behavior: 'aoe', lifesteal: 0.2 },
  { id: 'death_fog', name: 'Death Fog', magicType: 'necrotic', tier: 4, description: 'Thick fog concealing player and draining life', baseDamage: 25, manaCost: 42, cooldown: 4.0, range: 250, projectileSpeed: 0, aoeRadius: 110, color: '#223322', secondaryColor: '#556655', behavior: 'zone', dotDamage: 15, dotDuration: 7, dotTickRate: 0.3, lifesteal: 0.15 },
  { id: 'wither_rot', name: 'Wither & Rot', magicType: 'necrotic', tier: 5, description: 'Zone where enemies lose 5% Max HP per second (6s)', baseDamage: 80, manaCost: 70, cooldown: 60, range: 0, projectileSpeed: 0, aoeRadius: 180, color: '#112211', secondaryColor: '#445544', behavior: 'aoe', dotDamage: 25, dotDuration: 6, dotTickRate: 0.3, slowAmount: 0.6, slowDuration: 5 },
];

const MINION: SpellDef[] = [
  { id: 'summon_imp', name: 'Summon Imp', magicType: 'minion', tier: 1, description: 'Small fire-spitting imp for 30 seconds', baseDamage: 8, manaCost: 15, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#cc6644', secondaryColor: '#ff8866', behavior: 'summon', minionCount: 1, minionDuration: 30 },
  { id: 'summon_golem', name: 'Summon Golem', magicType: 'minion', tier: 2, description: 'Sturdy stone golem to tank and taunt', baseDamage: 15, manaCost: 25, cooldown: 6.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#888877', secondaryColor: '#aaaaaa', behavior: 'summon', minionCount: 1, minionDuration: 20 },
  { id: 'horde_call', name: 'Horde Call', magicType: 'minion', tier: 3, description: 'Swarm of 5 skeletons to rush the target', baseDamage: 6, manaCost: 30, cooldown: 5.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#aa7744', secondaryColor: '#cc9966', behavior: 'summon', minionCount: 5, minionDuration: 12 },
  { id: 'monstrosity', name: 'Monstrosity', magicType: 'minion', tier: 4, description: 'Merges all minions into one giant elite horror', baseDamage: 30, manaCost: 50, cooldown: 10.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#664433', secondaryColor: '#886655', behavior: 'summon', minionCount: 1, minionDuration: 25 },
  { id: 'undead_legion', name: 'Undead Legion', magicType: 'minion', tier: 5, description: 'Army of 20 skeletons for 30 seconds', baseDamage: 20, manaCost: 75, cooldown: 90, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#445544', secondaryColor: '#778877', behavior: 'summon', minionCount: 20, minionDuration: 30 },
];

const LIGHTNING: SpellDef[] = [
  { id: 'static_zap', name: 'Static Zap', magicType: 'lightning', tier: 1, description: 'Quick jolt causing a short stagger', baseDamage: 14, manaCost: 10, cooldown: 0.4, range: 260, projectileSpeed: 600, aoeRadius: 0, color: '#ffff00', secondaryColor: '#ffffaa', behavior: 'projectile', stunDuration: 0.3 },
  { id: 'bolt_strike', name: 'Bolt Strike', magicType: 'lightning', tier: 2, description: 'Precision bolt with high single-target damage', baseDamage: 30, manaCost: 18, cooldown: 1.0, range: 280, projectileSpeed: 0, aoeRadius: 30, color: '#ffdd00', secondaryColor: '#ffffff', behavior: 'zone', stunDuration: 0.5 },
  { id: 'chain_lightning', name: 'Chain Lightning', magicType: 'lightning', tier: 3, description: 'Lightning jumping between up to 5 targets', baseDamage: 35, manaCost: 28, cooldown: 1.5, range: 300, projectileSpeed: 550, aoeRadius: 0, color: '#ffff44', secondaryColor: '#ffffaa', behavior: 'projectile', chainTargets: 5, stunDuration: 0.4 },
  { id: 'thunderclap', name: 'Thunderclap', magicType: 'lightning', tier: 4, description: 'Massive AOE blast stunning all foes', baseDamage: 60, manaCost: 42, cooldown: 3.0, range: 0, projectileSpeed: 0, aoeRadius: 110, color: '#ffff00', secondaryColor: '#ffffff', behavior: 'aoe', stunDuration: 1.5, knockbackForce: 250 },
  { id: 'storm_lords_fury', name: "Storm Lord's Fury", magicType: 'lightning', tier: 5, description: 'Become a conduit, auto-striking all nearby (6s)', baseDamage: 100, manaCost: 75, cooldown: 60, range: 0, projectileSpeed: 0, aoeRadius: 200, color: '#ffffff', secondaryColor: '#ffff00', behavior: 'aoe', chainTargets: 5, stunDuration: 2 },
];

const LUNAR: SpellDef[] = [
  { id: 'crescent_blade', name: 'Crescent Blade', magicType: 'lunar', tier: 1, description: 'Curved boomerang projectile', baseDamage: 16, manaCost: 10, cooldown: 0.6, range: 280, projectileSpeed: 380, aoeRadius: 0, color: '#aaaaff', secondaryColor: '#ddddff', behavior: 'projectile', piercing: true },
  { id: 'moonbeam', name: 'Moonbeam', magicType: 'lunar', tier: 2, description: 'Vertical beam following the target with tick damage', baseDamage: 24, manaCost: 16, cooldown: 1.0, range: 320, projectileSpeed: 500, aoeRadius: 30, color: '#8888ff', secondaryColor: '#ccccff', behavior: 'beam', healAmount: 5 },
  { id: 'night_veil', name: 'Night Veil', magicType: 'lunar', tier: 3, description: 'Invisibility for 5s or until attacking', baseDamage: 0, manaCost: 25, cooldown: 5.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#4444aa', secondaryColor: '#8888dd', behavior: 'self', shieldAmount: 50, shieldDuration: 5 },
  { id: 'starfall', name: 'Starfall', magicType: 'lunar', tier: 4, description: 'Multiple meteors dealing magic/lunar damage', baseDamage: 65, manaCost: 45, cooldown: 3.5, range: 300, projectileSpeed: 0, aoeRadius: 100, color: '#6666ff', secondaryColor: '#ffffff', behavior: 'zone', stunDuration: 1 },
  { id: 'eclipse', name: 'Eclipse', magicType: 'lunar', tier: 5, description: 'Plunges map into darkness, confusing and slowing all (8s)', baseDamage: 110, manaCost: 75, cooldown: 60, range: 0, projectileSpeed: 0, aoeRadius: 200, color: '#220044', secondaryColor: '#8866ff', behavior: 'aoe', slowAmount: 0.7, slowDuration: 8, dotDamage: 15, dotDuration: 8, dotTickRate: 0.5 },
];

// ============================================================
// All base spells
// ============================================================

export const ALL_SPELLS: SpellDef[] = [
  ...FIRE, ...ICE, ...EARTH, ...POISON, ...CRYSTAL,
  ...LIGHT, ...BLOOD, ...NECROTIC, ...MINION, ...LIGHTNING, ...LUNAR,
];

export const SPELLS_BY_TYPE: Record<MagicType, SpellDef[]> = {
  fire: FIRE, ice: ICE, earth: EARTH, poison: POISON, crystal: CRYSTAL,
  light: LIGHT, blood: BLOOD, necrotic: NECROTIC, minion: MINION,
  lightning: LIGHTNING, lunar: LUNAR,
};

export const MAGIC_TYPE_COLORS: Record<MagicType, string> = {
  fire: '#ff4400', ice: '#88ddff', earth: '#886644', poison: '#44cc22',
  crystal: '#cc88ff', light: '#ffee88', blood: '#cc0022', necrotic: '#445544',
  minion: '#cc6644', lightning: '#ffff00', lunar: '#8888ff',
};

export const MAGIC_TYPE_NAMES: Record<MagicType, string> = {
  fire: 'Fire', ice: 'Ice', earth: 'Earth', poison: 'Poison',
  crystal: 'Crystal', light: 'Light', blood: 'Blood', necrotic: 'Necrotic',
  minion: 'Minion', lightning: 'Lightning', lunar: 'Lunar',
};

export const STARTING_MAGIC_TYPES: MagicType[] = ['fire', 'light'];

// ============================================================
// T1 COMBO SPELLS — ORDER MATTERS (110 combos)
// Base + Modifier → unique result
// ============================================================

export const COMBO_SPELLS: ComboSpellDef[] = [
  // --- EMBER SPARK (Fire) + Modifier ---
  { id: 'scalding_steam', name: 'Scalding Steam', baseElement: 'fire', modElement: 'ice', magicType: 'fire', tier: 1, description: 'AOE cloud that blinds and deals fire damage', baseDamage: 22, manaCost: 16, cooldown: 1.0, range: 200, projectileSpeed: 300, aoeRadius: 60, color: '#cccccc', secondaryColor: '#ff8800', behavior: 'projectile', stunDuration: 1 },
  { id: 'magma_shard', name: 'Magma Shard', baseElement: 'fire', modElement: 'earth', magicType: 'fire', tier: 1, description: 'Impact damage plus a lingering lava pool', baseDamage: 25, manaCost: 16, cooldown: 1.0, range: 250, projectileSpeed: 300, aoeRadius: 40, color: '#ff4400', secondaryColor: '#886644', behavior: 'projectile', dotDamage: 6, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'toxic_smoke', name: 'Toxic Smoke', baseElement: 'fire', modElement: 'poison', magicType: 'fire', tier: 1, description: 'Projectile exploding into poisonous gas', baseDamage: 18, manaCost: 14, cooldown: 1.0, range: 220, projectileSpeed: 350, aoeRadius: 50, color: '#88aa00', secondaryColor: '#ff4400', behavior: 'projectile', dotDamage: 5, dotDuration: 4, dotTickRate: 0.5 },
  { id: 'crystalline_flash', name: 'Crystalline Flash', baseElement: 'fire', modElement: 'crystal', magicType: 'fire', tier: 1, description: 'Spark reflects off armor, jumping to a 2nd foe', baseDamage: 20, manaCost: 14, cooldown: 0.7, range: 280, projectileSpeed: 400, aoeRadius: 0, color: '#ffccdd', secondaryColor: '#ff4400', behavior: 'projectile', chainTargets: 1 },
  { id: 'radiant_pyre', name: 'Radiant Pyre', baseElement: 'fire', modElement: 'light', magicType: 'fire', tier: 1, description: 'Holy fire that marks targets for extra damage', baseDamage: 20, manaCost: 16, cooldown: 0.9, range: 280, projectileSpeed: 350, aoeRadius: 30, color: '#ffcc44', secondaryColor: '#ff4400', behavior: 'projectile', dotDamage: 4, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'boiling_blood', name: 'Boiling Blood', baseElement: 'fire', modElement: 'blood', magicType: 'fire', tier: 1, description: 'Damage increases as target HP drops, grants 10% DR', baseDamage: 18, manaCost: 14, cooldown: 0.8, range: 250, projectileSpeed: 350, aoeRadius: 0, color: '#ff2244', secondaryColor: '#ff4400', behavior: 'projectile', lifesteal: 0.1, shieldAmount: 10, shieldDuration: 3 },
  { id: 'ghostfire', name: 'Ghostfire', baseElement: 'fire', modElement: 'necrotic', magicType: 'fire', tier: 1, description: 'Ethereal flame bypassing physical armor', baseDamage: 22, manaCost: 16, cooldown: 0.8, range: 280, projectileSpeed: 350, aoeRadius: 0, color: '#88ff88', secondaryColor: '#44aa44', behavior: 'projectile' },
  { id: 'fire_sprite', name: 'Fire Sprite', baseElement: 'fire', modElement: 'minion', magicType: 'fire', tier: 1, description: 'Imbues your minion with a fire aura', baseDamage: 10, manaCost: 14, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 40, color: '#ff6644', secondaryColor: '#ff8866', behavior: 'summon', minionCount: 1, minionDuration: 15, dotDamage: 3, dotDuration: 15, dotTickRate: 1 },
  { id: 'plasma_bolt', name: 'Plasma Bolt', baseElement: 'fire', modElement: 'lightning', magicType: 'fire', tier: 1, description: 'High-speed projectile with 2x crit damage', baseDamage: 24, manaCost: 16, cooldown: 0.6, range: 300, projectileSpeed: 550, aoeRadius: 0, color: '#ffff88', secondaryColor: '#ff4400', behavior: 'projectile' },
  { id: 'nightflare', name: 'Nightflare', baseElement: 'fire', modElement: 'lunar', magicType: 'fire', tier: 1, description: 'Flame dealing 50% more damage in darkness', baseDamage: 20, manaCost: 14, cooldown: 0.7, range: 280, projectileSpeed: 380, aoeRadius: 0, color: '#ff8844', secondaryColor: '#4444aa', behavior: 'projectile' },

  // --- FROST BOLT (Ice) + Modifier ---
  { id: 'flash_melt', name: 'Flash Melt', baseElement: 'ice', modElement: 'fire', magicType: 'ice', tier: 1, description: 'Huge burst damage removing Frozen status', baseDamage: 28, manaCost: 16, cooldown: 1.0, range: 280, projectileSpeed: 350, aoeRadius: 40, color: '#ff8844', secondaryColor: '#88ddff', behavior: 'projectile' },
  { id: 'permafrost', name: 'Permafrost', baseElement: 'ice', modElement: 'earth', magicType: 'ice', tier: 1, description: 'Slippery ground applying Chilled status', baseDamage: 15, manaCost: 14, cooldown: 2.0, range: 200, projectileSpeed: 0, aoeRadius: 60, color: '#aaccdd', secondaryColor: '#886644', behavior: 'zone', slowAmount: 0.5, slowDuration: 4 },
  { id: 'cryo_toxin', name: 'Cryo-Toxin', baseElement: 'ice', modElement: 'poison', magicType: 'ice', tier: 1, description: 'Slows movement and attack speed by 50%', baseDamage: 14, manaCost: 14, cooldown: 0.9, range: 280, projectileSpeed: 320, aoeRadius: 0, color: '#44ddaa', secondaryColor: '#88ddff', behavior: 'projectile', slowAmount: 0.5, slowDuration: 3 },
  { id: 'frost_diamond', name: 'Frost Diamond', baseElement: 'ice', modElement: 'crystal', magicType: 'ice', tier: 1, description: 'High-defense armor returning cold damage', baseDamage: 0, manaCost: 16, cooldown: 4.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#aaddff', secondaryColor: '#ccccff', behavior: 'self', shieldAmount: 35, shieldDuration: 6 },
  { id: 'prismatic_frost', name: 'Prismatic Frost', baseElement: 'ice', modElement: 'light', magicType: 'ice', tier: 1, description: 'Frozen targets refract light hitting 3 nearby enemies', baseDamage: 18, manaCost: 16, cooldown: 1.0, range: 280, projectileSpeed: 350, aoeRadius: 0, color: '#ffddff', secondaryColor: '#88ddff', behavior: 'projectile', chainTargets: 3 },
  { id: 'frozen_veins', name: 'Frozen Veins', baseElement: 'ice', modElement: 'blood', magicType: 'ice', tier: 1, description: 'Stops all enemy healing and regeneration', baseDamage: 16, manaCost: 14, cooldown: 1.0, range: 260, projectileSpeed: 320, aoeRadius: 0, color: '#cc4466', secondaryColor: '#88ddff', behavior: 'projectile', dotDamage: 4, dotDuration: 4, dotTickRate: 0.5 },
  { id: 'lich_touch', name: 'Lich Touch', baseElement: 'ice', modElement: 'necrotic', magicType: 'ice', tier: 1, description: 'Drains life and slows target cooldowns', baseDamage: 16, manaCost: 14, cooldown: 0.9, range: 220, projectileSpeed: 300, aoeRadius: 0, color: '#66aa88', secondaryColor: '#88ddff', behavior: 'projectile', lifesteal: 0.2, slowAmount: 0.3, slowDuration: 2 },
  { id: 'snow_golem', name: 'Snow Golem', baseElement: 'ice', modElement: 'minion', magicType: 'ice', tier: 1, description: 'Minions gain chance to freeze on hit', baseDamage: 10, manaCost: 14, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#ccddff', secondaryColor: '#88ddff', behavior: 'summon', minionCount: 1, minionDuration: 15, stunDuration: 0.5 },
  { id: 'storm_sleet', name: 'Storm Sleet', baseElement: 'ice', modElement: 'lightning', magicType: 'ice', tier: 1, description: 'Massive knockback with freezing projectiles', baseDamage: 20, manaCost: 16, cooldown: 1.0, range: 280, projectileSpeed: 400, aoeRadius: 30, color: '#aaffff', secondaryColor: '#ffff00', behavior: 'projectile', knockbackForce: 200, slowAmount: 0.4, slowDuration: 2 },
  { id: 'midnight_frost', name: 'Midnight Frost', baseElement: 'ice', modElement: 'lunar', magicType: 'ice', tier: 1, description: 'Ice damage ignoring magic armor', baseDamage: 20, manaCost: 14, cooldown: 0.8, range: 280, projectileSpeed: 350, aoeRadius: 0, color: '#6666dd', secondaryColor: '#88ddff', behavior: 'projectile' },

  // --- PEBBLE SHOT (Earth) + Modifier ---
  { id: 'molten_pebble', name: 'Molten Pebble', baseElement: 'earth', modElement: 'fire', magicType: 'earth', tier: 1, description: 'Superheated stone leaving a lava pool', baseDamage: 22, manaCost: 14, cooldown: 0.9, range: 220, projectileSpeed: 280, aoeRadius: 30, color: '#ff6644', secondaryColor: '#886644', behavior: 'projectile', dotDamage: 5, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'frost_bound_soil', name: 'Frost-Bound Soil', baseElement: 'earth', modElement: 'ice', magicType: 'earth', tier: 1, description: 'Hardened earth shattering into freezing caltrops', baseDamage: 18, manaCost: 14, cooldown: 1.5, range: 200, projectileSpeed: 0, aoeRadius: 50, color: '#8899aa', secondaryColor: '#886644', behavior: 'zone', slowAmount: 0.4, slowDuration: 3, dotDamage: 3, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'corrosive_mud', name: 'Corrosive Mud', baseElement: 'earth', modElement: 'poison', magicType: 'earth', tier: 1, description: 'Reduces enemy physical armor on impact', baseDamage: 16, manaCost: 12, cooldown: 0.9, range: 220, projectileSpeed: 280, aoeRadius: 0, color: '#668844', secondaryColor: '#886644', behavior: 'projectile', dotDamage: 3, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'quartz_spike', name: 'Quartz Spike', baseElement: 'earth', modElement: 'crystal', magicType: 'earth', tier: 1, description: 'High physical damage with armor penetration', baseDamage: 24, manaCost: 14, cooldown: 0.8, range: 220, projectileSpeed: 350, aoeRadius: 0, color: '#ccaadd', secondaryColor: '#886644', behavior: 'projectile', piercing: true },
  { id: 'hallowed_ground', name: 'Hallowed Ground', baseElement: 'earth', modElement: 'light', magicType: 'earth', tier: 1, description: 'Small AOE that heals player standing within', baseDamage: 10, manaCost: 16, cooldown: 3.0, range: 200, projectileSpeed: 0, aoeRadius: 50, color: '#ffddaa', secondaryColor: '#886644', behavior: 'zone', healAmount: 20 },
  { id: 'iron_blood', name: 'Iron Blood', baseElement: 'earth', modElement: 'blood', magicType: 'earth', tier: 1, description: 'Increases defense based on current HP', baseDamage: 0, manaCost: 14, cooldown: 4.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#884444', secondaryColor: '#886644', behavior: 'self', shieldAmount: 30, shieldDuration: 6 },
  { id: 'fossilize', name: 'Fossilize', baseElement: 'earth', modElement: 'necrotic', magicType: 'earth', tier: 1, description: 'Turns enemy to stone briefly (Stun)', baseDamage: 18, manaCost: 16, cooldown: 2.0, range: 200, projectileSpeed: 280, aoeRadius: 0, color: '#998877', secondaryColor: '#886644', behavior: 'projectile', stunDuration: 2 },
  { id: 'stone_skin', name: 'Stone Skin', baseElement: 'earth', modElement: 'minion', magicType: 'earth', tier: 1, description: 'Minions gain 50% physical damage reduction', baseDamage: 0, manaCost: 14, cooldown: 5.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#aa9988', secondaryColor: '#886644', behavior: 'self', shieldAmount: 25, shieldDuration: 10 },
  { id: 'magnetic_pull', name: 'Magnetic Pull', baseElement: 'earth', modElement: 'lightning', magicType: 'earth', tier: 1, description: 'Pulls armored enemies toward impact', baseDamage: 16, manaCost: 14, cooldown: 1.5, range: 220, projectileSpeed: 280, aoeRadius: 40, color: '#aaaacc', secondaryColor: '#886644', behavior: 'projectile', knockbackForce: -150 },
  { id: 'lunar_pull', name: 'Lunar Pull', baseElement: 'earth', modElement: 'lunar', magicType: 'earth', tier: 1, description: 'Creates a localized gravity spike', baseDamage: 16, manaCost: 14, cooldown: 1.5, range: 220, projectileSpeed: 280, aoeRadius: 50, color: '#8888cc', secondaryColor: '#886644', behavior: 'projectile', knockbackForce: -200 },

  // --- TOXIC SPIT (Poison) + Modifier ---
  { id: 'soot_cloud', name: 'Soot Cloud', baseElement: 'poison', modElement: 'fire', magicType: 'poison', tier: 1, description: 'Caustic liquid igniting into blinding smoke', baseDamage: 14, manaCost: 12, cooldown: 1.0, range: 200, projectileSpeed: 300, aoeRadius: 50, color: '#886622', secondaryColor: '#44cc22', behavior: 'projectile', stunDuration: 1, dotDamage: 4, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'frost_venom', name: 'Frost-Venom', baseElement: 'poison', modElement: 'ice', magicType: 'poison', tier: 1, description: 'Freezing toxin drastically reducing attack speed', baseDamage: 12, manaCost: 12, cooldown: 0.8, range: 260, projectileSpeed: 300, aoeRadius: 0, color: '#44aaaa', secondaryColor: '#44cc22', behavior: 'projectile', slowAmount: 0.5, slowDuration: 3, dotDamage: 3, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'sludge_bomb', name: 'Sludge Bomb', baseElement: 'poison', modElement: 'earth', magicType: 'poison', tier: 1, description: 'Toxic mud rooting target while ticking poison', baseDamage: 14, manaCost: 12, cooldown: 1.2, range: 200, projectileSpeed: 250, aoeRadius: 30, color: '#667744', secondaryColor: '#44cc22', behavior: 'projectile', stunDuration: 1.5, dotDamage: 5, dotDuration: 4, dotTickRate: 0.5 },
  { id: 'venom_shard', name: 'Venom Shard', baseElement: 'poison', modElement: 'crystal', magicType: 'poison', tier: 1, description: 'Crystal shattering and poisoning nearby targets', baseDamage: 16, manaCost: 12, cooldown: 0.7, range: 260, projectileSpeed: 400, aoeRadius: 30, color: '#88cc88', secondaryColor: '#ccddff', behavior: 'projectile', dotDamage: 4, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'illuminated_virus', name: 'Illuminated Virus', baseElement: 'poison', modElement: 'light', magicType: 'poison', tier: 1, description: 'Poisoned enemies visible through walls', baseDamage: 12, manaCost: 12, cooldown: 0.8, range: 260, projectileSpeed: 300, aoeRadius: 0, color: '#aaff44', secondaryColor: '#ffee88', behavior: 'projectile', dotDamage: 5, dotDuration: 5, dotTickRate: 0.5 },
  { id: 'septic_strike', name: 'Septic Strike', baseElement: 'poison', modElement: 'blood', magicType: 'poison', tier: 1, description: 'Bonus damage if target is bleeding', baseDamage: 18, manaCost: 12, cooldown: 0.7, range: 240, projectileSpeed: 350, aoeRadius: 0, color: '#884422', secondaryColor: '#44cc22', behavior: 'projectile', dotDamage: 4, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'wither', name: 'Wither', baseElement: 'poison', modElement: 'necrotic', magicType: 'poison', tier: 1, description: 'Reduces enemy attack damage by 25%', baseDamage: 10, manaCost: 12, cooldown: 1.0, range: 260, projectileSpeed: 300, aoeRadius: 0, color: '#335533', secondaryColor: '#44cc22', behavior: 'projectile', dotDamage: 4, dotDuration: 5, dotTickRate: 0.5 },
  { id: 'plague_swarm', name: 'Plague Swarm', baseElement: 'poison', modElement: 'minion', magicType: 'poison', tier: 1, description: 'Minions spread poison to any enemy they touch', baseDamage: 6, manaCost: 14, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#66aa44', secondaryColor: '#44cc22', behavior: 'summon', minionCount: 2, minionDuration: 12, dotDamage: 3, dotDuration: 10, dotTickRate: 0.5 },
  { id: 'toxin_spark', name: 'Toxin Spark', baseElement: 'poison', modElement: 'lightning', magicType: 'poison', tier: 1, description: 'Lightning spreading poison via chain-hits', baseDamage: 16, manaCost: 14, cooldown: 0.8, range: 280, projectileSpeed: 500, aoeRadius: 0, color: '#88ff44', secondaryColor: '#ffff00', behavior: 'projectile', chainTargets: 2, dotDamage: 3, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'night_shade', name: 'Night Shade', baseElement: 'poison', modElement: 'lunar', magicType: 'poison', tier: 1, description: 'Poison reducing enemy line-of-sight', baseDamage: 12, manaCost: 12, cooldown: 0.9, range: 260, projectileSpeed: 300, aoeRadius: 0, color: '#446644', secondaryColor: '#8888ff', behavior: 'projectile', dotDamage: 5, dotDuration: 4, dotTickRate: 0.5 },

  // --- GLASS SHARD (Crystal) + Modifier ---
  { id: 'prism_laser', name: 'Prism Laser', baseElement: 'crystal', modElement: 'fire', magicType: 'crystal', tier: 1, description: 'Fire reflects off crystals hitting multiple targets', baseDamage: 20, manaCost: 14, cooldown: 0.7, range: 300, projectileSpeed: 450, aoeRadius: 0, color: '#ff88cc', secondaryColor: '#ccddff', behavior: 'projectile', chainTargets: 2 },
  { id: 'crystal_ice', name: 'Crystal Ice', baseElement: 'crystal', modElement: 'ice', magicType: 'crystal', tier: 1, description: 'Ice-coated crystal that slows and bleeds', baseDamage: 18, manaCost: 14, cooldown: 0.6, range: 300, projectileSpeed: 420, aoeRadius: 0, color: '#aaddff', secondaryColor: '#ccddff', behavior: 'projectile', piercing: true, slowAmount: 0.3, slowDuration: 2 },
  { id: 'geo_crystal', name: 'Geo-Crystal', baseElement: 'crystal', modElement: 'earth', magicType: 'crystal', tier: 1, description: 'Crystal embeds in ground creating a damage zone', baseDamage: 14, manaCost: 14, cooldown: 2.0, range: 250, projectileSpeed: 0, aoeRadius: 50, color: '#aa9988', secondaryColor: '#ccddff', behavior: 'zone', dotDamage: 5, dotDuration: 4, dotTickRate: 0.5 },
  { id: 'toxic_prism', name: 'Toxic Prism', baseElement: 'crystal', modElement: 'poison', magicType: 'crystal', tier: 1, description: 'Crystal refracts poison into a wide cone', baseDamage: 14, manaCost: 12, cooldown: 0.8, range: 280, projectileSpeed: 400, aoeRadius: 40, color: '#88ff88', secondaryColor: '#ccddff', behavior: 'projectile', dotDamage: 4, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'refractive_beam', name: 'Refractive Beam', baseElement: 'crystal', modElement: 'light', magicType: 'crystal', tier: 1, description: 'Light beam splitting when hitting a crystal', baseDamage: 22, manaCost: 16, cooldown: 1.0, range: 320, projectileSpeed: 500, aoeRadius: 0, color: '#ffffcc', secondaryColor: '#ccddff', behavior: 'beam', chainTargets: 2 },
  { id: 'blood_crystal', name: 'Blood Crystal', baseElement: 'crystal', modElement: 'blood', magicType: 'crystal', tier: 1, description: 'Restores HP on critical hits', baseDamage: 18, manaCost: 12, cooldown: 0.6, range: 300, projectileSpeed: 420, aoeRadius: 0, color: '#cc4466', secondaryColor: '#ccddff', behavior: 'projectile', lifesteal: 0.15 },
  { id: 'soul_shard', name: 'Soul Shard', baseElement: 'crystal', modElement: 'necrotic', magicType: 'crystal', tier: 1, description: 'Restores energy on kill', baseDamage: 18, manaCost: 12, cooldown: 0.6, range: 300, projectileSpeed: 420, aoeRadius: 0, color: '#88aa88', secondaryColor: '#ccddff', behavior: 'projectile' },
  { id: 'crystal_shell', name: 'Crystal Shell', baseElement: 'crystal', modElement: 'minion', magicType: 'crystal', tier: 1, description: 'Minions get a reflective damage shield', baseDamage: 0, manaCost: 14, cooldown: 5.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#ddccff', secondaryColor: '#ccddff', behavior: 'self', shieldAmount: 25, shieldDuration: 8 },
  { id: 'conductive_prism', name: 'Conductive Prism', baseElement: 'crystal', modElement: 'lightning', magicType: 'crystal', tier: 1, description: 'Crystals extend chain lightning range', baseDamage: 20, manaCost: 14, cooldown: 0.7, range: 320, projectileSpeed: 500, aoeRadius: 0, color: '#ffffaa', secondaryColor: '#ccddff', behavior: 'projectile', chainTargets: 3 },
  { id: 'moonstone_spike', name: 'Moonstone Spike', baseElement: 'crystal', modElement: 'lunar', magicType: 'crystal', tier: 1, description: 'High-crit crystal with silent cast', baseDamage: 22, manaCost: 14, cooldown: 0.6, range: 300, projectileSpeed: 420, aoeRadius: 0, color: '#aaaaff', secondaryColor: '#ccddff', behavior: 'projectile' },

  // --- LUMINOUS BOLT (Light) + Modifier ---
  { id: 'solar_bolt', name: 'Solar Bolt', baseElement: 'light', modElement: 'fire', magicType: 'light', tier: 1, description: 'Light-infused fire that blinds and burns', baseDamage: 20, manaCost: 16, cooldown: 0.9, range: 280, projectileSpeed: 380, aoeRadius: 30, color: '#ffaa44', secondaryColor: '#ffee88', behavior: 'projectile', stunDuration: 0.5, dotDamage: 4, dotDuration: 2, dotTickRate: 0.5 },
  { id: 'aurora_bolt', name: 'Aurora Bolt', baseElement: 'light', modElement: 'ice', magicType: 'light', tier: 1, description: 'Bolt that freezes and creates a healing zone', baseDamage: 16, manaCost: 16, cooldown: 1.2, range: 280, projectileSpeed: 380, aoeRadius: 40, color: '#88ffcc', secondaryColor: '#ffee88', behavior: 'projectile', slowAmount: 0.4, slowDuration: 2, healAmount: 10 },
  { id: 'holy_stone', name: 'Holy Stone', baseElement: 'light', modElement: 'earth', magicType: 'light', tier: 1, description: 'Consecrates ground on impact, damages undead', baseDamage: 18, manaCost: 14, cooldown: 1.0, range: 250, projectileSpeed: 300, aoeRadius: 40, color: '#ffddaa', secondaryColor: '#ffee88', behavior: 'projectile', healAmount: 8 },
  { id: 'cleansing_light', name: 'Cleansing Light', baseElement: 'light', modElement: 'poison', magicType: 'light', tier: 1, description: 'Purifies poison on player, deals it to enemies', baseDamage: 16, manaCost: 14, cooldown: 1.0, range: 280, projectileSpeed: 380, aoeRadius: 30, color: '#ccff88', secondaryColor: '#ffee88', behavior: 'projectile', healAmount: 10 },
  { id: 'refractive_bolt', name: 'Refractive Bolt', baseElement: 'light', modElement: 'crystal', magicType: 'light', tier: 1, description: 'Bolt splits into 3 on contact with surfaces', baseDamage: 14, manaCost: 14, cooldown: 0.8, range: 280, projectileSpeed: 400, aoeRadius: 0, color: '#ffccff', secondaryColor: '#ffee88', behavior: 'projectile', chainTargets: 2 },
  { id: 'sacred_blood', name: 'Sacred Blood', baseElement: 'light', modElement: 'blood', magicType: 'light', tier: 1, description: 'Converts 10% of damage dealt into healing', baseDamage: 16, manaCost: 14, cooldown: 0.8, range: 280, projectileSpeed: 380, aoeRadius: 0, color: '#ffaaaa', secondaryColor: '#ffee88', behavior: 'projectile', lifesteal: 0.1, healAmount: 5 },
  { id: 'twilight', name: 'Twilight', baseElement: 'light', modElement: 'necrotic', magicType: 'light', tier: 1, description: 'Deals damage and briefly blinds the target', baseDamage: 18, manaCost: 14, cooldown: 0.9, range: 280, projectileSpeed: 380, aoeRadius: 0, color: '#888888', secondaryColor: '#ffee88', behavior: 'projectile', stunDuration: 0.8 },
  { id: 'guardian_angel', name: 'Guardian Angel', baseElement: 'light', modElement: 'minion', magicType: 'light', tier: 1, description: 'Minions pulse with a healing aura', baseDamage: 5, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#ffffaa', secondaryColor: '#ffee88', behavior: 'summon', minionCount: 1, minionDuration: 15, healAmount: 3 },
  { id: 'flashbolt', name: 'Flashbolt', baseElement: 'light', modElement: 'lightning', magicType: 'light', tier: 1, description: 'Lightning that blinds and staggers targets', baseDamage: 20, manaCost: 14, cooldown: 0.7, range: 280, projectileSpeed: 500, aoeRadius: 0, color: '#ffffff', secondaryColor: '#ffee88', behavior: 'projectile', stunDuration: 0.8 },
  { id: 'lunar_eclipse', name: 'Lunar Eclipse', baseElement: 'light', modElement: 'lunar', magicType: 'light', tier: 1, description: 'Silences all enemies in a large radius', baseDamage: 15, manaCost: 20, cooldown: 3.0, range: 0, projectileSpeed: 0, aoeRadius: 100, color: '#4444aa', secondaryColor: '#ffee88', behavior: 'aoe', stunDuration: 2 },

  // --- SIPHON (Blood) + Modifier ---
  { id: 'blood_flame', name: 'Blood Flame', baseElement: 'blood', modElement: 'fire', magicType: 'blood', tier: 1, description: 'Life-draining fire, heals more at low HP', baseDamage: 16, manaCost: 12, cooldown: 0.8, range: 220, projectileSpeed: 350, aoeRadius: 0, color: '#ff4422', secondaryColor: '#cc0022', behavior: 'projectile', lifesteal: 0.35, dotDamage: 3, dotDuration: 2, dotTickRate: 0.5 },
  { id: 'blood_frozen_veins', name: 'Frozen Veins', baseElement: 'blood', modElement: 'ice', magicType: 'blood', tier: 1, description: 'Stops healing and slows regeneration', baseDamage: 14, manaCost: 12, cooldown: 0.9, range: 220, projectileSpeed: 350, aoeRadius: 0, color: '#8844aa', secondaryColor: '#cc0022', behavior: 'projectile', lifesteal: 0.2, slowAmount: 0.3, slowDuration: 3 },
  { id: 'blood_iron_blood', name: 'Iron Blood', baseElement: 'blood', modElement: 'earth', magicType: 'blood', tier: 1, description: 'Defense boost based on current HP', baseDamage: 0, manaCost: 12, cooldown: 4.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#884444', secondaryColor: '#cc0022', behavior: 'self', shieldAmount: 30, shieldDuration: 6 },
  { id: 'blood_septic_strike', name: 'Septic Strike', baseElement: 'blood', modElement: 'poison', magicType: 'blood', tier: 1, description: 'Bonus damage to bleeding targets', baseDamage: 18, manaCost: 12, cooldown: 0.7, range: 220, projectileSpeed: 350, aoeRadius: 0, color: '#884422', secondaryColor: '#cc0022', behavior: 'projectile', lifesteal: 0.15, dotDamage: 4, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'crimson_shard', name: 'Crimson Shard', baseElement: 'blood', modElement: 'crystal', magicType: 'blood', tier: 1, description: 'Blood crystallizes into piercing projectile with lifesteal', baseDamage: 20, manaCost: 14, cooldown: 0.7, range: 260, projectileSpeed: 400, aoeRadius: 0, color: '#cc4466', secondaryColor: '#cc0022', behavior: 'projectile', piercing: true, lifesteal: 0.25 },
  { id: 'purifying_drain', name: 'Purifying Drain', baseElement: 'blood', modElement: 'light', magicType: 'blood', tier: 1, description: 'Drains life and removes one debuff from player', baseDamage: 14, manaCost: 14, cooldown: 1.0, range: 220, projectileSpeed: 350, aoeRadius: 0, color: '#ffaaaa', secondaryColor: '#cc0022', behavior: 'projectile', lifesteal: 0.3, healAmount: 8 },
  { id: 'vampirism', name: 'Vampirism', baseElement: 'blood', modElement: 'necrotic', magicType: 'blood', tier: 1, description: 'Next attack has 50% lifesteal', baseDamage: 16, manaCost: 12, cooldown: 1.5, range: 220, projectileSpeed: 350, aoeRadius: 0, color: '#443333', secondaryColor: '#cc0022', behavior: 'projectile', lifesteal: 0.5 },
  { id: 'frenzy', name: 'Frenzy', baseElement: 'blood', modElement: 'minion', magicType: 'blood', tier: 1, description: 'Increases minion attack speed when player is hit', baseDamage: 0, manaCost: 14, cooldown: 5.0, range: 0, projectileSpeed: 0, aoeRadius: 0, color: '#cc4444', secondaryColor: '#cc0022', behavior: 'self', shieldAmount: 15, shieldDuration: 8 },
  { id: 'cardiac_arrest', name: 'Cardiac Arrest', baseElement: 'blood', modElement: 'lightning', magicType: 'blood', tier: 1, description: 'Lightning deals massive damage to bleeding targets', baseDamage: 24, manaCost: 16, cooldown: 1.0, range: 250, projectileSpeed: 500, aoeRadius: 0, color: '#ff4400', secondaryColor: '#ffff00', behavior: 'projectile', stunDuration: 0.5 },
  { id: 'moon_crazed', name: 'Moon-Crazed', baseElement: 'blood', modElement: 'lunar', magicType: 'blood', tier: 1, description: 'Increases physical damage at cost of defense', baseDamage: 22, manaCost: 12, cooldown: 0.6, range: 220, projectileSpeed: 380, aoeRadius: 0, color: '#aa44aa', secondaryColor: '#cc0022', behavior: 'projectile' },

  // --- DECAY (Necrotic) + Modifier ---
  { id: 'decay_ghostfire', name: 'Ghostfire', baseElement: 'necrotic', modElement: 'fire', magicType: 'necrotic', tier: 1, description: 'Ethereal flame bypassing physical armor', baseDamage: 20, manaCost: 14, cooldown: 0.8, range: 260, projectileSpeed: 300, aoeRadius: 0, color: '#88ff88', secondaryColor: '#445544', behavior: 'projectile', dotDamage: 5, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'decay_lich_touch', name: 'Lich Touch', baseElement: 'necrotic', modElement: 'ice', magicType: 'necrotic', tier: 1, description: 'Drains life and slows target cooldowns', baseDamage: 14, manaCost: 14, cooldown: 0.9, range: 240, projectileSpeed: 300, aoeRadius: 0, color: '#66aa88', secondaryColor: '#445544', behavior: 'projectile', lifesteal: 0.2, slowAmount: 0.3, slowDuration: 3 },
  { id: 'decay_fossilize', name: 'Fossilize', baseElement: 'necrotic', modElement: 'earth', magicType: 'necrotic', tier: 1, description: 'Turns enemy to stone (Stun)', baseDamage: 16, manaCost: 16, cooldown: 2.0, range: 240, projectileSpeed: 280, aoeRadius: 0, color: '#998877', secondaryColor: '#445544', behavior: 'projectile', stunDuration: 2 },
  { id: 'blight_curse', name: 'Blight Curse', baseElement: 'necrotic', modElement: 'poison', magicType: 'necrotic', tier: 1, description: 'Curse amplifying all poison damage by 50%', baseDamage: 12, manaCost: 14, cooldown: 1.5, range: 260, projectileSpeed: 300, aoeRadius: 0, color: '#448844', secondaryColor: '#445544', behavior: 'projectile', dotDamage: 6, dotDuration: 5, dotTickRate: 0.5 },
  { id: 'decay_soul_shard', name: 'Soul Shard', baseElement: 'necrotic', modElement: 'crystal', magicType: 'necrotic', tier: 1, description: 'Restores energy on kill', baseDamage: 16, manaCost: 12, cooldown: 0.7, range: 260, projectileSpeed: 350, aoeRadius: 0, color: '#88aa88', secondaryColor: '#445544', behavior: 'projectile' },
  { id: 'fading_light', name: 'Fading Light', baseElement: 'necrotic', modElement: 'light', magicType: 'necrotic', tier: 1, description: 'Curse reducing enemy damage by 30%', baseDamage: 12, manaCost: 14, cooldown: 1.5, range: 260, projectileSpeed: 300, aoeRadius: 40, color: '#888866', secondaryColor: '#445544', behavior: 'projectile', dotDamage: 3, dotDuration: 5, dotTickRate: 0.5 },
  { id: 'dark_pact', name: 'Dark Pact', baseElement: 'necrotic', modElement: 'blood', magicType: 'necrotic', tier: 1, description: 'Next hit deals 3x damage, costs 10% HP', baseDamage: 30, manaCost: 10, cooldown: 3.0, range: 240, projectileSpeed: 350, aoeRadius: 0, color: '#440022', secondaryColor: '#445544', behavior: 'projectile', lifesteal: -0.1 },
  { id: 'reanimate', name: 'Reanimate', baseElement: 'necrotic', modElement: 'minion', magicType: 'necrotic', tier: 1, description: 'Chance to raise a small skeleton on kill', baseDamage: 10, manaCost: 14, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#aabb99', secondaryColor: '#445544', behavior: 'summon', minionCount: 1, minionDuration: 20 },
  { id: 'death_bolt', name: 'Death Bolt', baseElement: 'necrotic', modElement: 'lightning', magicType: 'necrotic', tier: 1, description: 'Purple lightning preventing health regen', baseDamage: 18, manaCost: 14, cooldown: 0.8, range: 280, projectileSpeed: 500, aoeRadius: 0, color: '#884488', secondaryColor: '#445544', behavior: 'projectile', dotDamage: 4, dotDuration: 4, dotTickRate: 0.5 },
  { id: 'abyssal_rift', name: 'Abyssal Rift', baseElement: 'necrotic', modElement: 'lunar', magicType: 'necrotic', tier: 1, description: 'Dark portal dealing heavy DOT', baseDamage: 14, manaCost: 18, cooldown: 2.5, range: 250, projectileSpeed: 0, aoeRadius: 60, color: '#220044', secondaryColor: '#445544', behavior: 'zone', dotDamage: 8, dotDuration: 5, dotTickRate: 0.3 },

  // --- SUMMON IMP (Minion) + Modifier ---
  { id: 'minion_fire_sprite', name: 'Fire Sprite', baseElement: 'minion', modElement: 'fire', magicType: 'minion', tier: 1, description: 'Minion with permanent fire aura', baseDamage: 10, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#ff6644', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 1, minionDuration: 20, dotDamage: 4, dotDuration: 20, dotTickRate: 1 },
  { id: 'minion_snow_golem', name: 'Snow Golem', baseElement: 'minion', modElement: 'ice', magicType: 'minion', tier: 1, description: 'Minions freeze on hit', baseDamage: 10, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#ccddff', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 1, minionDuration: 20, stunDuration: 0.5 },
  { id: 'minion_stone_skin', name: 'Stone Skin', baseElement: 'minion', modElement: 'earth', magicType: 'minion', tier: 1, description: 'Minions get 50% physical damage reduction', baseDamage: 12, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#aa9988', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 1, minionDuration: 20 },
  { id: 'minion_plague_swarm', name: 'Plague Swarm', baseElement: 'minion', modElement: 'poison', magicType: 'minion', tier: 1, description: 'Minions spread poison on touch', baseDamage: 6, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#66aa44', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 2, minionDuration: 15, dotDamage: 3, dotDuration: 10, dotTickRate: 0.5 },
  { id: 'minion_crystal_shell', name: 'Crystal Shell', baseElement: 'minion', modElement: 'crystal', magicType: 'minion', tier: 1, description: 'Minions get reflective damage shield', baseDamage: 8, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#ddccff', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 1, minionDuration: 20, shieldAmount: 20, shieldDuration: 20 },
  { id: 'minion_guardian_angel', name: 'Guardian Angel', baseElement: 'minion', modElement: 'light', magicType: 'minion', tier: 1, description: 'Minions pulse healing aura', baseDamage: 5, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#ffffaa', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 1, minionDuration: 15, healAmount: 2 },
  { id: 'minion_frenzy', name: 'Frenzy', baseElement: 'minion', modElement: 'blood', magicType: 'minion', tier: 1, description: 'Minion attack speed increases when player is hit', baseDamage: 12, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#cc4444', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 1, minionDuration: 20 },
  { id: 'minion_reanimate', name: 'Reanimate', baseElement: 'minion', modElement: 'necrotic', magicType: 'minion', tier: 1, description: 'Raise small skeleton on kill', baseDamage: 8, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#aabb99', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 1, minionDuration: 25 },
  { id: 'battery', name: 'Battery', baseElement: 'minion', modElement: 'lightning', magicType: 'minion', tier: 1, description: 'Minion acts as mobile shock-aura', baseDamage: 10, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#ffff88', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 1, minionDuration: 15, stunDuration: 0.3 },
  { id: 'waxing_horde', name: 'Waxing Horde', baseElement: 'minion', modElement: 'lunar', magicType: 'minion', tier: 1, description: 'Increases minion count temporarily', baseDamage: 6, manaCost: 18, cooldown: 4.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#8888cc', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 3, minionDuration: 12 },

  // --- STATIC ZAP (Lightning) + Modifier ---
  { id: 'lightning_plasma_bolt', name: 'Plasma Bolt', baseElement: 'lightning', modElement: 'fire', magicType: 'lightning', tier: 1, description: 'High-speed 2x crit projectile', baseDamage: 22, manaCost: 14, cooldown: 0.5, range: 280, projectileSpeed: 600, aoeRadius: 0, color: '#ffaa44', secondaryColor: '#ffff00', behavior: 'projectile' },
  { id: 'lightning_storm_sleet', name: 'Storm Sleet', baseElement: 'lightning', modElement: 'ice', magicType: 'lightning', tier: 1, description: 'Knockback with freezing projectiles', baseDamage: 18, manaCost: 14, cooldown: 0.8, range: 280, projectileSpeed: 500, aoeRadius: 0, color: '#88ddff', secondaryColor: '#ffff00', behavior: 'projectile', knockbackForce: 180, slowAmount: 0.3, slowDuration: 2 },
  { id: 'lightning_magnetic_pull', name: 'Magnetic Pull', baseElement: 'lightning', modElement: 'earth', magicType: 'lightning', tier: 1, description: 'Pulls armored enemies toward impact', baseDamage: 16, manaCost: 14, cooldown: 1.2, range: 260, projectileSpeed: 500, aoeRadius: 30, color: '#aaaacc', secondaryColor: '#ffff00', behavior: 'projectile', knockbackForce: -150 },
  { id: 'lightning_toxin_spark', name: 'Toxin Spark', baseElement: 'lightning', modElement: 'poison', magicType: 'lightning', tier: 1, description: 'Lightning spreading poison via chains', baseDamage: 16, manaCost: 14, cooldown: 0.6, range: 280, projectileSpeed: 600, aoeRadius: 0, color: '#88ff44', secondaryColor: '#ffff00', behavior: 'projectile', chainTargets: 2, dotDamage: 3, dotDuration: 3, dotTickRate: 0.5 },
  { id: 'lightning_conductive_prism', name: 'Conductive Prism', baseElement: 'lightning', modElement: 'crystal', magicType: 'lightning', tier: 1, description: 'Crystals extend chain lightning range', baseDamage: 18, manaCost: 14, cooldown: 0.6, range: 300, projectileSpeed: 600, aoeRadius: 0, color: '#ffffcc', secondaryColor: '#ffff00', behavior: 'projectile', chainTargets: 3 },
  { id: 'lightning_flashbolt', name: 'Flashbolt', baseElement: 'lightning', modElement: 'light', magicType: 'lightning', tier: 1, description: 'Blinds and staggers targets', baseDamage: 18, manaCost: 14, cooldown: 0.6, range: 280, projectileSpeed: 600, aoeRadius: 0, color: '#ffffff', secondaryColor: '#ffff00', behavior: 'projectile', stunDuration: 0.8 },
  { id: 'lightning_cardiac_arrest', name: 'Cardiac Arrest', baseElement: 'lightning', modElement: 'blood', magicType: 'lightning', tier: 1, description: 'Massive damage to bleeding targets', baseDamage: 22, manaCost: 16, cooldown: 0.8, range: 260, projectileSpeed: 600, aoeRadius: 0, color: '#ff4400', secondaryColor: '#ffff00', behavior: 'projectile', stunDuration: 0.3 },
  { id: 'lightning_death_bolt', name: 'Death Bolt', baseElement: 'lightning', modElement: 'necrotic', magicType: 'lightning', tier: 1, description: 'Purple lightning preventing health regen', baseDamage: 18, manaCost: 14, cooldown: 0.7, range: 280, projectileSpeed: 600, aoeRadius: 0, color: '#884488', secondaryColor: '#ffff00', behavior: 'projectile', dotDamage: 4, dotDuration: 4, dotTickRate: 0.5 },
  { id: 'lightning_battery', name: 'Battery', baseElement: 'lightning', modElement: 'minion', magicType: 'lightning', tier: 1, description: 'Minion gets mobile shock-aura', baseDamage: 10, manaCost: 16, cooldown: 3.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#ffff88', secondaryColor: '#ffff00', behavior: 'summon', minionCount: 1, minionDuration: 15, stunDuration: 0.3 },
  { id: 'short_circuit', name: 'Short Circuit', baseElement: 'lightning', modElement: 'lunar', magicType: 'lightning', tier: 1, description: 'Drains stamina and prevents dashing', baseDamage: 16, manaCost: 14, cooldown: 0.8, range: 260, projectileSpeed: 600, aoeRadius: 0, color: '#8888ff', secondaryColor: '#ffff00', behavior: 'projectile', slowAmount: 0.6, slowDuration: 3 },

  // --- CRESCENT BLADE (Lunar) + Modifier ---
  { id: 'lunar_nightflare', name: 'Nightflare', baseElement: 'lunar', modElement: 'fire', magicType: 'lunar', tier: 1, description: '50% more damage in darkness', baseDamage: 20, manaCost: 14, cooldown: 0.7, range: 280, projectileSpeed: 380, aoeRadius: 0, color: '#ff8844', secondaryColor: '#8888ff', behavior: 'projectile', piercing: true },
  { id: 'lunar_midnight_frost', name: 'Midnight Frost', baseElement: 'lunar', modElement: 'ice', magicType: 'lunar', tier: 1, description: 'Ice damage ignoring magic armor', baseDamage: 18, manaCost: 14, cooldown: 0.7, range: 280, projectileSpeed: 380, aoeRadius: 0, color: '#6666dd', secondaryColor: '#8888ff', behavior: 'projectile', piercing: true },
  { id: 'gravity_well', name: 'Gravity Well', baseElement: 'lunar', modElement: 'earth', magicType: 'lunar', tier: 1, description: 'Pulls enemies toward a point', baseDamage: 14, manaCost: 16, cooldown: 2.0, range: 250, projectileSpeed: 0, aoeRadius: 60, color: '#886688', secondaryColor: '#8888ff', behavior: 'zone', knockbackForce: -200 },
  { id: 'lunar_night_shade', name: 'Night Shade', baseElement: 'lunar', modElement: 'poison', magicType: 'lunar', tier: 1, description: 'Poison reducing enemy sight', baseDamage: 14, manaCost: 12, cooldown: 0.8, range: 280, projectileSpeed: 380, aoeRadius: 0, color: '#446644', secondaryColor: '#8888ff', behavior: 'projectile', piercing: true, dotDamage: 4, dotDuration: 4, dotTickRate: 0.5 },
  { id: 'lunar_moonstone_spike', name: 'Moonstone Spike', baseElement: 'lunar', modElement: 'crystal', magicType: 'lunar', tier: 1, description: 'High-crit with silent cast', baseDamage: 22, manaCost: 14, cooldown: 0.6, range: 300, projectileSpeed: 420, aoeRadius: 0, color: '#aaaaff', secondaryColor: '#ccddff', behavior: 'projectile', piercing: true },
  { id: 'lunar_lunar_eclipse', name: 'Lunar Eclipse', baseElement: 'lunar', modElement: 'light', magicType: 'lunar', tier: 1, description: 'Silences enemies in large radius', baseDamage: 14, manaCost: 20, cooldown: 3.0, range: 0, projectileSpeed: 0, aoeRadius: 100, color: '#4444aa', secondaryColor: '#ffee88', behavior: 'aoe', stunDuration: 2 },
  { id: 'lunar_moon_crazed', name: 'Moon-Crazed', baseElement: 'lunar', modElement: 'blood', magicType: 'lunar', tier: 1, description: 'More physical damage at cost of defense', baseDamage: 24, manaCost: 12, cooldown: 0.6, range: 280, projectileSpeed: 400, aoeRadius: 0, color: '#aa44aa', secondaryColor: '#8888ff', behavior: 'projectile', piercing: true },
  { id: 'lunar_abyssal_rift', name: 'Abyssal Rift', baseElement: 'lunar', modElement: 'necrotic', magicType: 'lunar', tier: 1, description: 'Dark portal dealing heavy DOT', baseDamage: 14, manaCost: 18, cooldown: 2.5, range: 250, projectileSpeed: 0, aoeRadius: 60, color: '#220044', secondaryColor: '#8888ff', behavior: 'zone', dotDamage: 8, dotDuration: 5, dotTickRate: 0.3 },
  { id: 'lunar_waxing_horde', name: 'Waxing Horde', baseElement: 'lunar', modElement: 'minion', magicType: 'lunar', tier: 1, description: 'Increases minion count temporarily', baseDamage: 6, manaCost: 16, cooldown: 4.0, range: 100, projectileSpeed: 0, aoeRadius: 0, color: '#8888cc', secondaryColor: '#cc6644', behavior: 'summon', minionCount: 3, minionDuration: 12 },
  { id: 'lunar_short_circuit', name: 'Short Circuit', baseElement: 'lunar', modElement: 'lightning', magicType: 'lunar', tier: 1, description: 'Drains stamina, prevents dashing', baseDamage: 18, manaCost: 14, cooldown: 0.8, range: 280, projectileSpeed: 400, aoeRadius: 0, color: '#ffff88', secondaryColor: '#8888ff', behavior: 'projectile', piercing: true, slowAmount: 0.5, slowDuration: 3 },
];

// ============================================================
// Lookup helpers
// ============================================================

export function getSpellsForType(magicType: MagicType): SpellDef[] {
  return SPELLS_BY_TYPE[magicType] || [];
}

export function getSpellForTier(magicType: MagicType, tier: SpellTier): SpellDef | undefined {
  return SPELLS_BY_TYPE[magicType]?.find((s) => s.tier === tier);
}

export function getSpellById(id: string): SpellDef | undefined {
  return ALL_SPELLS.find((s) => s.id === id) || COMBO_SPELLS.find((s) => s.id === id);
}

export function getHighestUnlockedTier(xp: number): SpellTier {
  if (xp >= TIER_XP_THRESHOLDS[5]) return 5;
  if (xp >= TIER_XP_THRESHOLDS[4]) return 4;
  if (xp >= TIER_XP_THRESHOLDS[3]) return 3;
  if (xp >= TIER_XP_THRESHOLDS[2]) return 2;
  return 1;
}

export function getActiveSpellForMagic(magicType: MagicType, xp: number, selectedTier?: SpellTier): SpellDef | undefined {
  const highestTier = getHighestUnlockedTier(xp);
  const useTier = selectedTier && selectedTier <= highestTier ? selectedTier : highestTier;
  return getSpellForTier(magicType, useTier);
}

/**
 * ORDER-DEPENDENT combo lookup.
 * baseElement is the spell cast first, modElement is the modifier.
 * Fire+Ice gives a DIFFERENT result than Ice+Fire.
 */
export function findComboSpell(baseElement: MagicType, modElement: MagicType): ComboSpellDef | undefined {
  return COMBO_SPELLS.find(
    (s) => s.baseElement === baseElement && s.modElement === modElement
  );
}

export function xpToNextTier(currentXp: number): { currentTier: SpellTier; nextTier: SpellTier | null; xpNeeded: number; progress: number } {
  const currentTier = getHighestUnlockedTier(currentXp);
  if (currentTier >= 5) return { currentTier: 5, nextTier: null, xpNeeded: 0, progress: 1 };
  const nextTier = (currentTier + 1) as SpellTier;
  const currentThreshold = TIER_XP_THRESHOLDS[currentTier];
  const nextThreshold = TIER_XP_THRESHOLDS[nextTier];
  return { currentTier, nextTier, xpNeeded: nextThreshold - currentXp, progress: (currentXp - currentThreshold) / (nextThreshold - currentThreshold) };
}
