export type MagicType =
  | 'fire' | 'ice' | 'earth' | 'poison' | 'crystal'
  | 'thorns' | 'arcane' | 'holy' | 'blood' | 'necrotic'
  | 'minion' | 'lightning' | 'wind' | 'lunar' | 'illusion';

export const ALL_MAGIC_TYPES: MagicType[] = [
  'fire', 'ice', 'earth', 'poison', 'crystal',
  'thorns', 'arcane', 'holy', 'blood', 'necrotic',
  'minion', 'lightning', 'wind', 'lunar', 'illusion',
];

export type SpellTier = 1 | 2 | 3 | 4 | 5;

export const TIER_NAMES: Record<SpellTier, string> = {
  1: 'Basic',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Elite',
  5: 'Ultimate',
};

// XP required to unlock each tier (cumulative from tier 1)
export const TIER_XP_THRESHOLDS: Record<SpellTier, number> = {
  1: 0,
  2: 40,
  3: 120,
  4: 280,
  5: 600,
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
  // Special effects
  slowAmount?: number;      // movement speed reduction (0-1)
  slowDuration?: number;
  dotDamage?: number;        // damage over time per tick
  dotDuration?: number;
  dotTickRate?: number;
  healAmount?: number;       // heals player on hit/cast
  shieldAmount?: number;     // temporary shield HP
  shieldDuration?: number;
  lifesteal?: number;        // fraction of damage healed (0-1)
  stunDuration?: number;
  knockbackForce?: number;
  piercing?: boolean;
  chainTargets?: number;     // chains to N additional enemies
  minionCount?: number;
  minionDuration?: number;
}

export interface ComboSpellDef extends SpellDef {
  elements: [MagicType, MagicType];
}

// ============================================================
// SPELL DEFINITIONS — 15 Magic Types x 5 Tiers = 75 Spells
// ============================================================

const FIRE_SPELLS: SpellDef[] = [
  {
    id: 'ember_spark', name: 'Ember Spark', magicType: 'fire', tier: 1,
    description: 'A small burst of flame',
    baseDamage: 15, manaCost: 10, cooldown: 0.6, range: 280, projectileSpeed: 350,
    aoeRadius: 0, color: '#ff4400', secondaryColor: '#ff8800', behavior: 'projectile',
  },
  {
    id: 'flamethrower', name: 'Flamethrower', magicType: 'fire', tier: 2,
    description: 'A sustained cone of fire',
    baseDamage: 22, manaCost: 18, cooldown: 0.3, range: 180, projectileSpeed: 500,
    aoeRadius: 30, color: '#ff6600', secondaryColor: '#ffaa00', behavior: 'beam',
    dotDamage: 5, dotDuration: 2, dotTickRate: 0.5,
  },
  {
    id: 'magma_orb', name: 'Magma Orb', magicType: 'fire', tier: 3,
    description: 'A slow orb of magma that explodes on impact',
    baseDamage: 45, manaCost: 30, cooldown: 1.5, range: 300, projectileSpeed: 200,
    aoeRadius: 70, color: '#ff3300', secondaryColor: '#cc6600', behavior: 'projectile',
    dotDamage: 8, dotDuration: 3, dotTickRate: 0.5,
  },
  {
    id: 'inferno_column', name: 'Inferno Column', magicType: 'fire', tier: 4,
    description: 'A pillar of fire erupts at the target location',
    baseDamage: 70, manaCost: 45, cooldown: 2.5, range: 250, projectileSpeed: 0,
    aoeRadius: 90, color: '#ff2200', secondaryColor: '#ffcc00', behavior: 'zone',
    dotDamage: 12, dotDuration: 4, dotTickRate: 0.3,
  },
  {
    id: 'supernova', name: 'Supernova', magicType: 'fire', tier: 5,
    description: 'A cataclysmic explosion centered on the caster',
    baseDamage: 120, manaCost: 80, cooldown: 6.0, range: 0, projectileSpeed: 0,
    aoeRadius: 180, color: '#ffffff', secondaryColor: '#ff4400', behavior: 'aoe',
    knockbackForce: 400,
  },
];

const ICE_SPELLS: SpellDef[] = [
  {
    id: 'frost_bolt', name: 'Frost Bolt', magicType: 'ice', tier: 1,
    description: 'A chilling bolt that slows enemies',
    baseDamage: 12, manaCost: 10, cooldown: 0.7, range: 300, projectileSpeed: 320,
    aoeRadius: 0, color: '#88ddff', secondaryColor: '#ffffff', behavior: 'projectile',
    slowAmount: 0.3, slowDuration: 2,
  },
  {
    id: 'ice_shards', name: 'Ice Shards', magicType: 'ice', tier: 2,
    description: 'Fires a spread of piercing ice shards',
    baseDamage: 18, manaCost: 16, cooldown: 0.9, range: 250, projectileSpeed: 400,
    aoeRadius: 0, color: '#66ccff', secondaryColor: '#cceeFF', behavior: 'projectile',
    piercing: true, slowAmount: 0.2, slowDuration: 1.5,
  },
  {
    id: 'glacial_wall', name: 'Glacial Wall', magicType: 'ice', tier: 3,
    description: 'Creates a wall of ice that blocks and damages',
    baseDamage: 30, manaCost: 28, cooldown: 3.0, range: 200, projectileSpeed: 0,
    aoeRadius: 50, color: '#44aaff', secondaryColor: '#aaddff', behavior: 'zone',
    slowAmount: 0.6, slowDuration: 3, shieldAmount: 30, shieldDuration: 5,
  },
  {
    id: 'blizzard_zone', name: 'Blizzard Zone', magicType: 'ice', tier: 4,
    description: 'A raging blizzard that freezes everything in the area',
    baseDamage: 55, manaCost: 45, cooldown: 4.0, range: 250, projectileSpeed: 0,
    aoeRadius: 120, color: '#aaddff', secondaryColor: '#ffffff', behavior: 'zone',
    slowAmount: 0.7, slowDuration: 4, dotDamage: 10, dotDuration: 5, dotTickRate: 0.5,
  },
  {
    id: 'absolute_zero', name: 'Absolute Zero', magicType: 'ice', tier: 5,
    description: 'Freezes all nearby enemies solid',
    baseDamage: 90, manaCost: 70, cooldown: 8.0, range: 0, projectileSpeed: 0,
    aoeRadius: 160, color: '#ffffff', secondaryColor: '#88ddff', behavior: 'aoe',
    stunDuration: 3, slowAmount: 0.9, slowDuration: 5,
  },
];

const EARTH_SPELLS: SpellDef[] = [
  {
    id: 'pebble_shot', name: 'Pebble Shot', magicType: 'earth', tier: 1,
    description: 'Launches a small rock at the enemy',
    baseDamage: 18, manaCost: 10, cooldown: 0.8, range: 220, projectileSpeed: 280,
    aoeRadius: 0, color: '#886644', secondaryColor: '#aa8866', behavior: 'projectile',
    knockbackForce: 100,
  },
  {
    id: 'earthen_aegis', name: 'Earthen Aegis', magicType: 'earth', tier: 2,
    description: 'Raises a stone shield around the caster',
    baseDamage: 0, manaCost: 20, cooldown: 5.0, range: 0, projectileSpeed: 0,
    aoeRadius: 0, color: '#997755', secondaryColor: '#bbaa88', behavior: 'self',
    shieldAmount: 50, shieldDuration: 8,
  },
  {
    id: 'tremor', name: 'Tremor', magicType: 'earth', tier: 3,
    description: 'Shakes the ground, stunning nearby enemies',
    baseDamage: 35, manaCost: 30, cooldown: 2.5, range: 0, projectileSpeed: 0,
    aoeRadius: 100, color: '#775533', secondaryColor: '#aa8855', behavior: 'aoe',
    stunDuration: 1.5, knockbackForce: 150,
  },
  {
    id: 'boulder_rain', name: 'Boulder Rain', magicType: 'earth', tier: 4,
    description: 'Calls down a barrage of boulders on the target area',
    baseDamage: 65, manaCost: 45, cooldown: 3.5, range: 280, projectileSpeed: 0,
    aoeRadius: 100, color: '#664422', secondaryColor: '#886644', behavior: 'zone',
    stunDuration: 1, knockbackForce: 200,
  },
  {
    id: 'continental_shift', name: 'Continental Shift', magicType: 'earth', tier: 5,
    description: 'Tears the ground apart in a massive earthquake',
    baseDamage: 110, manaCost: 75, cooldown: 7.0, range: 0, projectileSpeed: 0,
    aoeRadius: 200, color: '#553311', secondaryColor: '#886644', behavior: 'aoe',
    stunDuration: 2.5, knockbackForce: 350,
  },
];

const POISON_SPELLS: SpellDef[] = [
  {
    id: 'toxic_spit', name: 'Toxic Spit', magicType: 'poison', tier: 1,
    description: 'Spits a glob of poison',
    baseDamage: 8, manaCost: 8, cooldown: 0.5, range: 260, projectileSpeed: 300,
    aoeRadius: 0, color: '#44cc22', secondaryColor: '#88ff44', behavior: 'projectile',
    dotDamage: 4, dotDuration: 4, dotTickRate: 0.5,
  },
  {
    id: 'miasma_cloud', name: 'Miasma Cloud', magicType: 'poison', tier: 2,
    description: 'Creates a lingering poison cloud',
    baseDamage: 10, manaCost: 18, cooldown: 2.0, range: 200, projectileSpeed: 0,
    aoeRadius: 60, color: '#33aa11', secondaryColor: '#66dd33', behavior: 'zone',
    dotDamage: 6, dotDuration: 5, dotTickRate: 0.5,
  },
  {
    id: 'venomous_lash', name: 'Venomous Lash', magicType: 'poison', tier: 3,
    description: 'A whip of pure venom that pierces enemies',
    baseDamage: 28, manaCost: 24, cooldown: 1.2, range: 200, projectileSpeed: 450,
    aoeRadius: 0, color: '#22bb00', secondaryColor: '#aaff66', behavior: 'beam',
    piercing: true, dotDamage: 8, dotDuration: 4, dotTickRate: 0.3,
  },
  {
    id: 'contagion', name: 'Contagion', magicType: 'poison', tier: 4,
    description: 'Infects an enemy with a spreading disease',
    baseDamage: 20, manaCost: 40, cooldown: 4.0, range: 250, projectileSpeed: 350,
    aoeRadius: 80, color: '#119900', secondaryColor: '#44ff22', behavior: 'projectile',
    dotDamage: 15, dotDuration: 8, dotTickRate: 0.5, chainTargets: 3,
  },
  {
    id: 'plague_gods_breath', name: "Plague God's Breath", magicType: 'poison', tier: 5,
    description: 'A devastating wave of pestilence',
    baseDamage: 50, manaCost: 70, cooldown: 8.0, range: 0, projectileSpeed: 0,
    aoeRadius: 170, color: '#008800', secondaryColor: '#44ff00', behavior: 'aoe',
    dotDamage: 20, dotDuration: 10, dotTickRate: 0.3, slowAmount: 0.5, slowDuration: 5,
  },
];

const CRYSTAL_SPELLS: SpellDef[] = [
  {
    id: 'glass_shard', name: 'Glass Shard', magicType: 'crystal', tier: 1,
    description: 'Flings a razor-sharp crystal shard',
    baseDamage: 16, manaCost: 10, cooldown: 0.5, range: 300, projectileSpeed: 420,
    aoeRadius: 0, color: '#ccddff', secondaryColor: '#eeeeff', behavior: 'projectile',
    piercing: true,
  },
  {
    id: 'quartz_shield', name: 'Quartz Shield', magicType: 'crystal', tier: 2,
    description: 'Forms a crystalline barrier',
    baseDamage: 0, manaCost: 18, cooldown: 4.0, range: 0, projectileSpeed: 0,
    aoeRadius: 0, color: '#ddccff', secondaryColor: '#ffddff', behavior: 'self',
    shieldAmount: 40, shieldDuration: 6,
  },
  {
    id: 'prism_beam', name: 'Prism Beam', magicType: 'crystal', tier: 3,
    description: 'A focused beam of refracted light',
    baseDamage: 40, manaCost: 28, cooldown: 1.8, range: 320, projectileSpeed: 600,
    aoeRadius: 0, color: '#ff88ff', secondaryColor: '#88ffff', behavior: 'beam',
    chainTargets: 2,
  },
  {
    id: 'crystal_spire', name: 'Crystal Spire', magicType: 'crystal', tier: 4,
    description: 'Erupts a crystal formation that damages and traps',
    baseDamage: 55, manaCost: 40, cooldown: 3.0, range: 250, projectileSpeed: 0,
    aoeRadius: 70, color: '#cc88ff', secondaryColor: '#ffccff', behavior: 'zone',
    stunDuration: 2, shieldAmount: 20, shieldDuration: 4,
  },
  {
    id: 'diamond_resonance', name: 'Diamond Resonance', magicType: 'crystal', tier: 5,
    description: 'Shatters all nearby crystals in a devastating resonance',
    baseDamage: 100, manaCost: 65, cooldown: 7.0, range: 0, projectileSpeed: 0,
    aoeRadius: 150, color: '#ffffff', secondaryColor: '#cc88ff', behavior: 'aoe',
    shieldAmount: 60, shieldDuration: 8, stunDuration: 1.5,
  },
];

const THORNS_SPELLS: SpellDef[] = [
  {
    id: 'bramble_whip', name: 'Bramble Whip', magicType: 'thorns', tier: 1,
    description: 'Lashes out with thorny vines',
    baseDamage: 14, manaCost: 8, cooldown: 0.6, range: 150, projectileSpeed: 400,
    aoeRadius: 0, color: '#448822', secondaryColor: '#66aa44', behavior: 'beam',
    dotDamage: 3, dotDuration: 2, dotTickRate: 0.5,
  },
  {
    id: 'briar_armor', name: 'Briar Armor', magicType: 'thorns', tier: 2,
    description: 'Wraps the caster in thorny vines that damage attackers',
    baseDamage: 0, manaCost: 16, cooldown: 5.0, range: 0, projectileSpeed: 0,
    aoeRadius: 30, color: '#336611', secondaryColor: '#558833', behavior: 'self',
    shieldAmount: 35, shieldDuration: 10,
  },
  {
    id: 'root_snare', name: 'Root Snare', magicType: 'thorns', tier: 3,
    description: 'Roots erupt from the ground, immobilizing enemies',
    baseDamage: 20, manaCost: 24, cooldown: 2.5, range: 220, projectileSpeed: 0,
    aoeRadius: 60, color: '#225500', secondaryColor: '#448822', behavior: 'zone',
    stunDuration: 2, dotDamage: 6, dotDuration: 3, dotTickRate: 0.5,
  },
  {
    id: 'tangled_thicket', name: 'Tangled Thicket', magicType: 'thorns', tier: 4,
    description: 'A massive area becomes a deadly thorn maze',
    baseDamage: 40, manaCost: 42, cooldown: 4.0, range: 250, projectileSpeed: 0,
    aoeRadius: 110, color: '#114400', secondaryColor: '#338822', behavior: 'zone',
    slowAmount: 0.7, slowDuration: 5, dotDamage: 10, dotDuration: 6, dotTickRate: 0.3,
  },
  {
    id: 'natures_wrath', name: "Nature's Wrath", magicType: 'thorns', tier: 5,
    description: 'The entire room is consumed by furious plant life',
    baseDamage: 85, manaCost: 65, cooldown: 8.0, range: 0, projectileSpeed: 0,
    aoeRadius: 200, color: '#22aa00', secondaryColor: '#114400', behavior: 'aoe',
    dotDamage: 15, dotDuration: 8, dotTickRate: 0.3, stunDuration: 2,
  },
];

const ARCANE_SPELLS: SpellDef[] = [
  {
    id: 'mana_bolt', name: 'Mana Bolt', magicType: 'arcane', tier: 1,
    description: 'A bolt of pure magical energy',
    baseDamage: 14, manaCost: 8, cooldown: 0.4, range: 320, projectileSpeed: 450,
    aoeRadius: 0, color: '#aa44ff', secondaryColor: '#dd88ff', behavior: 'projectile',
  },
  {
    id: 'arcane_surge', name: 'Arcane Surge', magicType: 'arcane', tier: 2,
    description: 'A burst of arcane energy that restores mana on kill',
    baseDamage: 25, manaCost: 14, cooldown: 0.8, range: 280, projectileSpeed: 400,
    aoeRadius: 40, color: '#8833dd', secondaryColor: '#bb66ff', behavior: 'projectile',
  },
  {
    id: 'phase_shift', name: 'Phase Shift', magicType: 'arcane', tier: 3,
    description: 'Blink through enemies, damaging them',
    baseDamage: 35, manaCost: 25, cooldown: 2.0, range: 200, projectileSpeed: 0,
    aoeRadius: 40, color: '#7722cc', secondaryColor: '#aa44ff', behavior: 'self',
  },
  {
    id: 'rift_collapse', name: 'Rift Collapse', magicType: 'arcane', tier: 4,
    description: 'Opens a rift that pulls enemies in and damages them',
    baseDamage: 60, manaCost: 45, cooldown: 3.5, range: 280, projectileSpeed: 0,
    aoeRadius: 90, color: '#5500aa', secondaryColor: '#aa44ff', behavior: 'zone',
    slowAmount: 0.8, slowDuration: 3,
  },
  {
    id: 'cosmic_singularity', name: 'Cosmic Singularity', magicType: 'arcane', tier: 5,
    description: 'Creates a miniature black hole that consumes everything',
    baseDamage: 130, manaCost: 85, cooldown: 10.0, range: 300, projectileSpeed: 0,
    aoeRadius: 140, color: '#220066', secondaryColor: '#aa44ff', behavior: 'zone',
    slowAmount: 0.9, slowDuration: 4, dotDamage: 20, dotDuration: 5, dotTickRate: 0.3,
  },
];

const HOLY_SPELLS: SpellDef[] = [
  {
    id: 'guiding_light', name: 'Guiding Light', magicType: 'holy', tier: 1,
    description: 'A beam of holy light that heals and damages',
    baseDamage: 12, manaCost: 12, cooldown: 0.8, range: 280, projectileSpeed: 380,
    aoeRadius: 0, color: '#ffee88', secondaryColor: '#ffffff', behavior: 'projectile',
    healAmount: 5,
  },
  {
    id: 'purge_evil', name: 'Purge Evil', magicType: 'holy', tier: 2,
    description: 'Smites enemies with holy fire',
    baseDamage: 28, manaCost: 20, cooldown: 1.2, range: 250, projectileSpeed: 350,
    aoeRadius: 40, color: '#ffdd44', secondaryColor: '#ffffff', behavior: 'projectile',
    healAmount: 8,
  },
  {
    id: 'celestial_ward', name: 'Celestial Ward', magicType: 'holy', tier: 3,
    description: 'A divine shield that heals over time',
    baseDamage: 0, manaCost: 30, cooldown: 5.0, range: 0, projectileSpeed: 0,
    aoeRadius: 0, color: '#ffffaa', secondaryColor: '#ffffff', behavior: 'self',
    shieldAmount: 60, shieldDuration: 8, healAmount: 30,
  },
  {
    id: 'judgment_ray', name: 'Judgment Ray', magicType: 'holy', tier: 4,
    description: 'A devastating ray of divine judgment',
    baseDamage: 70, manaCost: 45, cooldown: 3.0, range: 350, projectileSpeed: 700,
    aoeRadius: 50, color: '#ffff00', secondaryColor: '#ffffff', behavior: 'beam',
    healAmount: 15,
  },
  {
    id: 'divine_intervention', name: 'Divine Intervention', magicType: 'holy', tier: 5,
    description: 'Full heal and massive holy explosion',
    baseDamage: 100, manaCost: 80, cooldown: 12.0, range: 0, projectileSpeed: 0,
    aoeRadius: 180, color: '#ffffff', secondaryColor: '#ffee88', behavior: 'aoe',
    healAmount: 100, shieldAmount: 50, shieldDuration: 5,
  },
];

const BLOOD_SPELLS: SpellDef[] = [
  {
    id: 'siphon', name: 'Siphon', magicType: 'blood', tier: 1,
    description: 'Drains life from an enemy',
    baseDamage: 12, manaCost: 8, cooldown: 0.7, range: 200, projectileSpeed: 350,
    aoeRadius: 0, color: '#cc0022', secondaryColor: '#ff4466', behavior: 'projectile',
    lifesteal: 0.3,
  },
  {
    id: 'coagulate', name: 'Coagulate', magicType: 'blood', tier: 2,
    description: 'Hardens blood into a protective barrier',
    baseDamage: 0, manaCost: 15, cooldown: 4.0, range: 0, projectileSpeed: 0,
    aoeRadius: 0, color: '#880011', secondaryColor: '#cc4444', behavior: 'self',
    shieldAmount: 45, shieldDuration: 6,
  },
  {
    id: 'blood_spear', name: 'Blood Spear', magicType: 'blood', tier: 3,
    description: 'A spear of crystallized blood that pierces and heals',
    baseDamage: 38, manaCost: 25, cooldown: 1.5, range: 300, projectileSpeed: 500,
    aoeRadius: 0, color: '#aa0022', secondaryColor: '#ff2244', behavior: 'projectile',
    piercing: true, lifesteal: 0.4,
  },
  {
    id: 'hemorrhage', name: 'Hemorrhage', magicType: 'blood', tier: 4,
    description: 'Causes all nearby enemies to bleed profusely',
    baseDamage: 30, manaCost: 40, cooldown: 3.5, range: 0, projectileSpeed: 0,
    aoeRadius: 120, color: '#660011', secondaryColor: '#cc0022', behavior: 'aoe',
    dotDamage: 12, dotDuration: 6, dotTickRate: 0.3, lifesteal: 0.25,
  },
  {
    id: 'crimson_pact', name: 'Crimson Pact', magicType: 'blood', tier: 5,
    description: 'Sacrifices HP to unleash devastating blood magic',
    baseDamage: 140, manaCost: 50, cooldown: 6.0, range: 0, projectileSpeed: 0,
    aoeRadius: 160, color: '#440000', secondaryColor: '#ff0022', behavior: 'aoe',
    lifesteal: 0.5,
  },
];

const NECROTIC_SPELLS: SpellDef[] = [
  {
    id: 'decay', name: 'Decay', magicType: 'necrotic', tier: 1,
    description: 'A bolt of necrotic energy that withers',
    baseDamage: 10, manaCost: 10, cooldown: 0.6, range: 260, projectileSpeed: 300,
    aoeRadius: 0, color: '#445544', secondaryColor: '#778877', behavior: 'projectile',
    dotDamage: 5, dotDuration: 3, dotTickRate: 0.5,
  },
  {
    id: 'bone_armor', name: 'Bone Armor', magicType: 'necrotic', tier: 2,
    description: 'Surrounds the caster with orbiting bones',
    baseDamage: 8, manaCost: 18, cooldown: 5.0, range: 0, projectileSpeed: 0,
    aoeRadius: 40, color: '#ddddaa', secondaryColor: '#eeeecc', behavior: 'self',
    shieldAmount: 40, shieldDuration: 10,
  },
  {
    id: 'soul_reap', name: 'Soul Reap', magicType: 'necrotic', tier: 3,
    description: 'Rips the soul from enemies, dealing massive damage',
    baseDamage: 50, manaCost: 30, cooldown: 2.0, range: 220, projectileSpeed: 350,
    aoeRadius: 0, color: '#336633', secondaryColor: '#88aa88', behavior: 'projectile',
    lifesteal: 0.2,
  },
  {
    id: 'death_fog', name: 'Death Fog', magicType: 'necrotic', tier: 4,
    description: 'A creeping fog that drains life from everything',
    baseDamage: 25, manaCost: 42, cooldown: 4.0, range: 250, projectileSpeed: 0,
    aoeRadius: 110, color: '#223322', secondaryColor: '#556655', behavior: 'zone',
    dotDamage: 15, dotDuration: 7, dotTickRate: 0.3, lifesteal: 0.15,
  },
  {
    id: 'wither_and_rot', name: 'Wither & Rot', magicType: 'necrotic', tier: 5,
    description: 'Everything around the caster decays to nothing',
    baseDamage: 80, manaCost: 70, cooldown: 8.0, range: 0, projectileSpeed: 0,
    aoeRadius: 180, color: '#112211', secondaryColor: '#445544', behavior: 'aoe',
    dotDamage: 25, dotDuration: 8, dotTickRate: 0.3, slowAmount: 0.6, slowDuration: 5,
  },
];

const MINION_SPELLS: SpellDef[] = [
  {
    id: 'summon_imp', name: 'Summon Imp', magicType: 'minion', tier: 1,
    description: 'Summons a small imp to fight for you',
    baseDamage: 8, manaCost: 15, cooldown: 3.0, range: 100, projectileSpeed: 0,
    aoeRadius: 0, color: '#cc6644', secondaryColor: '#ff8866', behavior: 'summon',
    minionCount: 1, minionDuration: 15,
  },
  {
    id: 'summon_golem', name: 'Summon Golem', magicType: 'minion', tier: 2,
    description: 'Summons a stone golem to tank damage',
    baseDamage: 15, manaCost: 25, cooldown: 6.0, range: 100, projectileSpeed: 0,
    aoeRadius: 0, color: '#888877', secondaryColor: '#aaaaaa', behavior: 'summon',
    minionCount: 1, minionDuration: 20,
  },
  {
    id: 'horde_call', name: 'Horde Call', magicType: 'minion', tier: 3,
    description: 'Summons a swarm of small creatures',
    baseDamage: 6, manaCost: 30, cooldown: 5.0, range: 100, projectileSpeed: 0,
    aoeRadius: 0, color: '#aa7744', secondaryColor: '#cc9966', behavior: 'summon',
    minionCount: 4, minionDuration: 12,
  },
  {
    id: 'monstrosity', name: 'Monstrosity', magicType: 'minion', tier: 4,
    description: 'Summons a powerful abomination',
    baseDamage: 30, manaCost: 50, cooldown: 10.0, range: 100, projectileSpeed: 0,
    aoeRadius: 0, color: '#664433', secondaryColor: '#886655', behavior: 'summon',
    minionCount: 1, minionDuration: 25,
  },
  {
    id: 'undead_legion', name: 'Undead Legion', magicType: 'minion', tier: 5,
    description: 'Raises an army of undead warriors',
    baseDamage: 20, manaCost: 75, cooldown: 15.0, range: 100, projectileSpeed: 0,
    aoeRadius: 0, color: '#445544', secondaryColor: '#778877', behavior: 'summon',
    minionCount: 6, minionDuration: 20,
  },
];

const LIGHTNING_SPELLS: SpellDef[] = [
  {
    id: 'static_zap', name: 'Static Zap', magicType: 'lightning', tier: 1,
    description: 'A quick jolt of electricity',
    baseDamage: 14, manaCost: 10, cooldown: 0.4, range: 260, projectileSpeed: 600,
    aoeRadius: 0, color: '#ffff00', secondaryColor: '#ffffaa', behavior: 'projectile',
    stunDuration: 0.3,
  },
  {
    id: 'bolt_strike', name: 'Bolt Strike', magicType: 'lightning', tier: 2,
    description: 'A powerful lightning bolt from the sky',
    baseDamage: 30, manaCost: 18, cooldown: 1.0, range: 280, projectileSpeed: 0,
    aoeRadius: 30, color: '#ffdd00', secondaryColor: '#ffffff', behavior: 'zone',
    stunDuration: 0.5,
  },
  {
    id: 'chain_lightning', name: 'Chain Lightning', magicType: 'lightning', tier: 3,
    description: 'Lightning that jumps between enemies',
    baseDamage: 35, manaCost: 28, cooldown: 1.5, range: 300, projectileSpeed: 550,
    aoeRadius: 0, color: '#ffff44', secondaryColor: '#ffffaa', behavior: 'projectile',
    chainTargets: 3, stunDuration: 0.4,
  },
  {
    id: 'thunderclap', name: 'Thunderclap', magicType: 'lightning', tier: 4,
    description: 'A massive thunderbolt that stuns everything',
    baseDamage: 60, manaCost: 42, cooldown: 3.0, range: 0, projectileSpeed: 0,
    aoeRadius: 110, color: '#ffff00', secondaryColor: '#ffffff', behavior: 'aoe',
    stunDuration: 1.5, knockbackForce: 250,
  },
  {
    id: 'storm_lords_fury', name: "Storm Lord's Fury", magicType: 'lightning', tier: 5,
    description: 'Become the storm — chain lightning everywhere',
    baseDamage: 100, manaCost: 75, cooldown: 8.0, range: 0, projectileSpeed: 0,
    aoeRadius: 200, color: '#ffffff', secondaryColor: '#ffff00', behavior: 'aoe',
    chainTargets: 5, stunDuration: 2,
  },
];

const WIND_SPELLS: SpellDef[] = [
  {
    id: 'gust', name: 'Gust', magicType: 'wind', tier: 1,
    description: 'A cutting blast of wind',
    baseDamage: 10, manaCost: 7, cooldown: 0.3, range: 280, projectileSpeed: 500,
    aoeRadius: 0, color: '#aaffaa', secondaryColor: '#ddffdd', behavior: 'projectile',
    knockbackForce: 80,
  },
  {
    id: 'air_shield', name: 'Air Shield', magicType: 'wind', tier: 2,
    description: 'A swirling barrier of wind that deflects projectiles',
    baseDamage: 0, manaCost: 14, cooldown: 4.0, range: 0, projectileSpeed: 0,
    aoeRadius: 0, color: '#88ffaa', secondaryColor: '#ccffdd', behavior: 'self',
    shieldAmount: 30, shieldDuration: 6,
  },
  {
    id: 'cyclone', name: 'Cyclone', magicType: 'wind', tier: 3,
    description: 'A whirling cyclone that pulls enemies in',
    baseDamage: 30, manaCost: 25, cooldown: 2.5, range: 250, projectileSpeed: 0,
    aoeRadius: 80, color: '#66dd88', secondaryColor: '#aaffcc', behavior: 'zone',
    slowAmount: 0.5, slowDuration: 3, knockbackForce: -150,
  },
  {
    id: 'vacuum_vortex', name: 'Vacuum Vortex', magicType: 'wind', tier: 4,
    description: 'Creates a vortex that crushes enemies together',
    baseDamage: 50, manaCost: 40, cooldown: 3.5, range: 280, projectileSpeed: 0,
    aoeRadius: 100, color: '#44cc66', secondaryColor: '#88ffaa', behavior: 'zone',
    slowAmount: 0.8, slowDuration: 4, knockbackForce: -250,
  },
  {
    id: 'hurricane_edge', name: 'Hurricane Edge', magicType: 'wind', tier: 5,
    description: 'Razor-sharp winds shred everything in a massive area',
    baseDamage: 90, manaCost: 65, cooldown: 7.0, range: 0, projectileSpeed: 0,
    aoeRadius: 180, color: '#22aa44', secondaryColor: '#aaffaa', behavior: 'aoe',
    knockbackForce: 300, dotDamage: 10, dotDuration: 4, dotTickRate: 0.2,
  },
];

const LUNAR_SPELLS: SpellDef[] = [
  {
    id: 'crescent_blade', name: 'Crescent Blade', magicType: 'lunar', tier: 1,
    description: 'A crescent-shaped blade of moonlight',
    baseDamage: 16, manaCost: 10, cooldown: 0.6, range: 280, projectileSpeed: 380,
    aoeRadius: 0, color: '#aaaaff', secondaryColor: '#ddddff', behavior: 'projectile',
    piercing: true,
  },
  {
    id: 'moonbeam', name: 'Moonbeam', magicType: 'lunar', tier: 2,
    description: 'A concentrated beam of lunar energy',
    baseDamage: 24, manaCost: 16, cooldown: 1.0, range: 320, projectileSpeed: 500,
    aoeRadius: 30, color: '#8888ff', secondaryColor: '#ccccff', behavior: 'beam',
    healAmount: 5,
  },
  {
    id: 'night_veil', name: 'Night Veil', magicType: 'lunar', tier: 3,
    description: 'Cloaks the caster in shadow, reducing damage taken',
    baseDamage: 0, manaCost: 25, cooldown: 5.0, range: 0, projectileSpeed: 0,
    aoeRadius: 0, color: '#4444aa', secondaryColor: '#8888dd', behavior: 'self',
    shieldAmount: 50, shieldDuration: 8,
  },
  {
    id: 'starfall', name: 'Starfall', magicType: 'lunar', tier: 4,
    description: 'Stars rain down from the sky on target area',
    baseDamage: 65, manaCost: 45, cooldown: 3.5, range: 300, projectileSpeed: 0,
    aoeRadius: 100, color: '#6666ff', secondaryColor: '#ffffff', behavior: 'zone',
    stunDuration: 1,
  },
  {
    id: 'eclipse', name: 'Eclipse', magicType: 'lunar', tier: 5,
    description: 'Plunges the area into darkness, devastating all enemies',
    baseDamage: 110, manaCost: 75, cooldown: 9.0, range: 0, projectileSpeed: 0,
    aoeRadius: 200, color: '#220044', secondaryColor: '#8866ff', behavior: 'aoe',
    slowAmount: 0.7, slowDuration: 5, dotDamage: 15, dotDuration: 5, dotTickRate: 0.5,
  },
];

const ILLUSION_SPELLS: SpellDef[] = [
  {
    id: 'blur', name: 'Blur', magicType: 'illusion', tier: 1,
    description: 'Briefly become harder to hit',
    baseDamage: 0, manaCost: 8, cooldown: 3.0, range: 0, projectileSpeed: 0,
    aoeRadius: 0, color: '#ff88cc', secondaryColor: '#ffaadd', behavior: 'self',
    shieldAmount: 20, shieldDuration: 4,
  },
  {
    id: 'mirror_image', name: 'Mirror Image', magicType: 'illusion', tier: 2,
    description: 'Creates decoy images that confuse enemies',
    baseDamage: 10, manaCost: 18, cooldown: 4.0, range: 0, projectileSpeed: 0,
    aoeRadius: 60, color: '#dd66aa', secondaryColor: '#ff88cc', behavior: 'self',
    shieldAmount: 30, shieldDuration: 6,
  },
  {
    id: 'hallucination', name: 'Hallucination', magicType: 'illusion', tier: 3,
    description: 'Causes enemies to attack each other',
    baseDamage: 25, manaCost: 28, cooldown: 3.0, range: 250, projectileSpeed: 350,
    aoeRadius: 60, color: '#cc44aa', secondaryColor: '#ff66cc', behavior: 'projectile',
    stunDuration: 2,
  },
  {
    id: 'mind_trick', name: 'Mind Trick', magicType: 'illusion', tier: 4,
    description: 'Dominates the minds of nearby enemies',
    baseDamage: 40, manaCost: 40, cooldown: 4.0, range: 0, projectileSpeed: 0,
    aoeRadius: 100, color: '#aa2288', secondaryColor: '#dd44aa', behavior: 'aoe',
    stunDuration: 3, slowAmount: 0.5, slowDuration: 4,
  },
  {
    id: 'reality_fracture', name: 'Reality Fracture', magicType: 'illusion', tier: 5,
    description: 'Shatters the fabric of reality itself',
    baseDamage: 95, manaCost: 70, cooldown: 9.0, range: 0, projectileSpeed: 0,
    aoeRadius: 170, color: '#880066', secondaryColor: '#ff88cc', behavior: 'aoe',
    stunDuration: 2.5, slowAmount: 0.8, slowDuration: 5,
  },
];

// ============================================================
// All spells combined
// ============================================================

export const ALL_SPELLS: SpellDef[] = [
  ...FIRE_SPELLS, ...ICE_SPELLS, ...EARTH_SPELLS, ...POISON_SPELLS,
  ...CRYSTAL_SPELLS, ...THORNS_SPELLS, ...ARCANE_SPELLS, ...HOLY_SPELLS,
  ...BLOOD_SPELLS, ...NECROTIC_SPELLS, ...MINION_SPELLS, ...LIGHTNING_SPELLS,
  ...WIND_SPELLS, ...LUNAR_SPELLS, ...ILLUSION_SPELLS,
];

export const SPELLS_BY_TYPE: Record<MagicType, SpellDef[]> = {
  fire: FIRE_SPELLS, ice: ICE_SPELLS, earth: EARTH_SPELLS, poison: POISON_SPELLS,
  crystal: CRYSTAL_SPELLS, thorns: THORNS_SPELLS, arcane: ARCANE_SPELLS, holy: HOLY_SPELLS,
  blood: BLOOD_SPELLS, necrotic: NECROTIC_SPELLS, minion: MINION_SPELLS, lightning: LIGHTNING_SPELLS,
  wind: WIND_SPELLS, lunar: LUNAR_SPELLS, illusion: ILLUSION_SPELLS,
};

export const MAGIC_TYPE_COLORS: Record<MagicType, string> = {
  fire: '#ff4400', ice: '#88ddff', earth: '#886644', poison: '#44cc22',
  crystal: '#cc88ff', thorns: '#448822', arcane: '#aa44ff', holy: '#ffee88',
  blood: '#cc0022', necrotic: '#445544', minion: '#cc6644', lightning: '#ffff00',
  wind: '#aaffaa', lunar: '#8888ff', illusion: '#ff88cc',
};

export const MAGIC_TYPE_NAMES: Record<MagicType, string> = {
  fire: 'Fire', ice: 'Ice', earth: 'Earth', poison: 'Poison',
  crystal: 'Crystal', thorns: 'Thorns', arcane: 'Arcane', holy: 'Holy',
  blood: 'Blood', necrotic: 'Necrotic', minion: 'Minion', lightning: 'Lightning',
  wind: 'Wind', lunar: 'Lunar', illusion: 'Illusion',
};

// Starting magic types the player begins with
export const STARTING_MAGIC_TYPES: MagicType[] = ['fire', 'arcane'];

// ============================================================
// Combo spells (discovering combinations of two magic types)
// ============================================================

export const COMBO_SPELLS: ComboSpellDef[] = [
  {
    id: 'steam_burst', name: 'Steam Burst', magicType: 'fire', tier: 2, elements: ['fire', 'ice'],
    description: 'Scalding steam that burns and slows',
    baseDamage: 35, manaCost: 22, cooldown: 1.2, range: 200, projectileSpeed: 300,
    aoeRadius: 60, color: '#cccccc', secondaryColor: '#ffccaa', behavior: 'projectile',
    dotDamage: 6, dotDuration: 3, dotTickRate: 0.5, slowAmount: 0.3, slowDuration: 2,
  },
  {
    id: 'toxic_flame', name: 'Toxic Flame', magicType: 'fire', tier: 3, elements: ['fire', 'poison'],
    description: 'Green fire that poisons and burns',
    baseDamage: 40, manaCost: 28, cooldown: 1.5, range: 250, projectileSpeed: 350,
    aoeRadius: 50, color: '#88cc00', secondaryColor: '#ff6600', behavior: 'projectile',
    dotDamage: 12, dotDuration: 5, dotTickRate: 0.3,
  },
  {
    id: 'magma_wall', name: 'Magma Wall', magicType: 'earth', tier: 3, elements: ['fire', 'earth'],
    description: 'A wall of molten rock',
    baseDamage: 45, manaCost: 32, cooldown: 2.5, range: 200, projectileSpeed: 0,
    aoeRadius: 80, color: '#ff4400', secondaryColor: '#886644', behavior: 'zone',
    dotDamage: 10, dotDuration: 4, dotTickRate: 0.5, slowAmount: 0.4, slowDuration: 3,
  },
  {
    id: 'thunderstorm', name: 'Thunderstorm', magicType: 'lightning', tier: 3, elements: ['lightning', 'wind'],
    description: 'A raging storm of wind and lightning',
    baseDamage: 50, manaCost: 35, cooldown: 3.0, range: 0, projectileSpeed: 0,
    aoeRadius: 120, color: '#ffff44', secondaryColor: '#aaffaa', behavior: 'aoe',
    chainTargets: 3, stunDuration: 1, knockbackForce: 150,
  },
  {
    id: 'crystal_ice', name: 'Crystal Ice', magicType: 'ice', tier: 3, elements: ['ice', 'crystal'],
    description: 'Razor shards of crystallized ice',
    baseDamage: 42, manaCost: 26, cooldown: 1.3, range: 300, projectileSpeed: 450,
    aoeRadius: 0, color: '#aaddff', secondaryColor: '#ccccff', behavior: 'projectile',
    piercing: true, slowAmount: 0.5, slowDuration: 3,
  },
  {
    id: 'blood_thorns', name: 'Blood Thorns', magicType: 'blood', tier: 3, elements: ['blood', 'thorns'],
    description: 'Vampiric thorns that drain life',
    baseDamage: 35, manaCost: 28, cooldown: 2.0, range: 0, projectileSpeed: 0,
    aoeRadius: 80, color: '#882211', secondaryColor: '#448822', behavior: 'aoe',
    lifesteal: 0.35, dotDamage: 8, dotDuration: 4, dotTickRate: 0.5,
  },
  {
    id: 'holy_arcane', name: 'Astral Judgment', magicType: 'holy', tier: 3, elements: ['holy', 'arcane'],
    description: 'Divine arcane energy that heals and destroys',
    baseDamage: 55, manaCost: 35, cooldown: 2.5, range: 300, projectileSpeed: 500,
    aoeRadius: 50, color: '#ffddff', secondaryColor: '#aa44ff', behavior: 'beam',
    healAmount: 20,
  },
  {
    id: 'dark_eclipse', name: 'Dark Eclipse', magicType: 'necrotic', tier: 4, elements: ['necrotic', 'lunar'],
    description: 'A dark moon rises, withering all life',
    baseDamage: 65, manaCost: 50, cooldown: 5.0, range: 0, projectileSpeed: 0,
    aoeRadius: 150, color: '#220033', secondaryColor: '#445544', behavior: 'aoe',
    dotDamage: 18, dotDuration: 6, dotTickRate: 0.3, lifesteal: 0.2,
  },
  {
    id: 'phantom_army', name: 'Phantom Army', magicType: 'minion', tier: 4, elements: ['minion', 'illusion'],
    description: 'Summons illusory warriors that deal real damage',
    baseDamage: 15, manaCost: 45, cooldown: 6.0, range: 100, projectileSpeed: 0,
    aoeRadius: 0, color: '#dd66aa', secondaryColor: '#cc6644', behavior: 'summon',
    minionCount: 5, minionDuration: 12,
  },
  {
    id: 'poison_crystal', name: 'Venomous Prism', magicType: 'poison', tier: 3, elements: ['poison', 'crystal'],
    description: 'Toxic crystals that shatter and spread poison',
    baseDamage: 38, manaCost: 30, cooldown: 2.0, range: 280, projectileSpeed: 400,
    aoeRadius: 60, color: '#88ff44', secondaryColor: '#cc88ff', behavior: 'projectile',
    dotDamage: 10, dotDuration: 5, dotTickRate: 0.5, piercing: true,
  },
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
  let tier: SpellTier = 1;
  if (xp >= TIER_XP_THRESHOLDS[5]) tier = 5;
  else if (xp >= TIER_XP_THRESHOLDS[4]) tier = 4;
  else if (xp >= TIER_XP_THRESHOLDS[3]) tier = 3;
  else if (xp >= TIER_XP_THRESHOLDS[2]) tier = 2;
  return tier;
}

export function getActiveSpellForMagic(magicType: MagicType, xp: number, selectedTier?: SpellTier): SpellDef | undefined {
  const highestTier = getHighestUnlockedTier(xp);
  const useTier = selectedTier && selectedTier <= highestTier ? selectedTier : highestTier;
  return getSpellForTier(magicType, useTier);
}

export function findComboSpell(el1: MagicType, el2: MagicType): ComboSpellDef | undefined {
  return COMBO_SPELLS.find(
    (s) =>
      (s.elements[0] === el1 && s.elements[1] === el2) ||
      (s.elements[0] === el2 && s.elements[1] === el1)
  );
}

export function xpToNextTier(currentXp: number): { currentTier: SpellTier; nextTier: SpellTier | null; xpNeeded: number; progress: number } {
  const currentTier = getHighestUnlockedTier(currentXp);
  if (currentTier >= 5) return { currentTier: 5, nextTier: null, xpNeeded: 0, progress: 1 };
  const nextTier = (currentTier + 1) as SpellTier;
  const currentThreshold = TIER_XP_THRESHOLDS[currentTier];
  const nextThreshold = TIER_XP_THRESHOLDS[nextTier];
  const xpNeeded = nextThreshold - currentXp;
  const progress = (currentXp - currentThreshold) / (nextThreshold - currentThreshold);
  return { currentTier, nextTier, xpNeeded, progress };
}
