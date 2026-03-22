export type SpellElement = 'fire' | 'water' | 'ice' | 'lightning' | 'earth' | 'wind';

export interface SpellDef {
  id: string;
  name: string;
  element: SpellElement;
  description: string;
  baseDamage: number;
  manaCost: number;
  cooldown: number; // seconds
  range: number;
  projectileSpeed: number;
  aoeRadius: number; // 0 = single target projectile
  color: string;
  secondaryColor: string;
}

export interface ComboSpellDef extends SpellDef {
  elements: [SpellElement, SpellElement];
}

export const BASE_SPELLS: SpellDef[] = [
  {
    id: 'fire', name: 'Fireball', element: 'fire',
    description: 'Hurls a ball of fire',
    baseDamage: 25, manaCost: 15, cooldown: 0.8, range: 300,
    projectileSpeed: 350, aoeRadius: 0, color: '#ff4400', secondaryColor: '#ff8800',
  },
  {
    id: 'water', name: 'Water Bolt', element: 'water',
    description: 'Shoots a pressurized water bolt',
    baseDamage: 18, manaCost: 12, cooldown: 0.5, range: 350,
    projectileSpeed: 400, aoeRadius: 0, color: '#0088ff', secondaryColor: '#44bbff',
  },
  {
    id: 'ice', name: 'Ice Shard', element: 'ice',
    description: 'Launches a piercing ice shard that slows',
    baseDamage: 20, manaCost: 14, cooldown: 0.7, range: 280,
    projectileSpeed: 320, aoeRadius: 0, color: '#88ddff', secondaryColor: '#ffffff',
  },
  {
    id: 'lightning', name: 'Lightning Bolt', element: 'lightning',
    description: 'A fast bolt of lightning',
    baseDamage: 30, manaCost: 20, cooldown: 1.0, range: 250,
    projectileSpeed: 600, aoeRadius: 0, color: '#ffff00', secondaryColor: '#ffffaa',
  },
  {
    id: 'earth', name: 'Rock Throw', element: 'earth',
    description: 'Throws a heavy rock',
    baseDamage: 22, manaCost: 16, cooldown: 0.9, range: 200,
    projectileSpeed: 250, aoeRadius: 0, color: '#886644', secondaryColor: '#aa8866',
  },
  {
    id: 'wind', name: 'Wind Slash', element: 'wind',
    description: 'Sends a cutting gust of wind',
    baseDamage: 15, manaCost: 10, cooldown: 0.4, range: 320,
    projectileSpeed: 450, aoeRadius: 0, color: '#aaffaa', secondaryColor: '#ddffdd',
  },
];

export const COMBO_SPELLS: ComboSpellDef[] = [
  {
    id: 'steam', name: 'Steam Burst', element: 'fire', elements: ['fire', 'water'],
    description: 'Explodes in a cloud of scalding steam',
    baseDamage: 35, manaCost: 25, cooldown: 1.2, range: 200,
    projectileSpeed: 300, aoeRadius: 60, color: '#cccccc', secondaryColor: '#ffccaa',
  },
  {
    id: 'blizzard', name: 'Blizzard', element: 'ice', elements: ['ice', 'wind'],
    description: 'A freezing whirlwind that damages and slows all nearby',
    baseDamage: 28, manaCost: 30, cooldown: 2.0, range: 0,
    projectileSpeed: 0, aoeRadius: 100, color: '#aaddff', secondaryColor: '#ffffff',
  },
  {
    id: 'magma', name: 'Magma Eruption', element: 'fire', elements: ['fire', 'earth'],
    description: 'Erupts molten rock from the ground',
    baseDamage: 40, manaCost: 35, cooldown: 2.5, range: 250,
    projectileSpeed: 0, aoeRadius: 80, color: '#ff4400', secondaryColor: '#886644',
  },
  {
    id: 'thunderstorm', name: 'Thunderstorm', element: 'lightning', elements: ['lightning', 'water'],
    description: 'Electrified water chains between enemies',
    baseDamage: 45, manaCost: 40, cooldown: 3.0, range: 300,
    projectileSpeed: 500, aoeRadius: 50, color: '#4488ff', secondaryColor: '#ffff00',
  },
  {
    id: 'sandstorm', name: 'Sandstorm', element: 'earth', elements: ['earth', 'wind'],
    description: 'A blinding sandstorm that damages and reduces accuracy',
    baseDamage: 30, manaCost: 28, cooldown: 2.0, range: 0,
    projectileSpeed: 0, aoeRadius: 120, color: '#ccaa66', secondaryColor: '#886644',
  },
  {
    id: 'frost_bolt', name: 'Frost Bolt', element: 'ice', elements: ['ice', 'water'],
    description: 'A freezing bolt that shatters on impact',
    baseDamage: 32, manaCost: 22, cooldown: 1.0, range: 320,
    projectileSpeed: 380, aoeRadius: 40, color: '#4488ff', secondaryColor: '#88ddff',
  },
  {
    id: 'chain_lightning', name: 'Chain Lightning', element: 'lightning', elements: ['lightning', 'wind'],
    description: 'Lightning carried by wind, jumping between foes',
    baseDamage: 38, manaCost: 32, cooldown: 1.8, range: 350,
    projectileSpeed: 550, aoeRadius: 0, color: '#ffff44', secondaryColor: '#aaffaa',
  },
  {
    id: 'geyser', name: 'Geyser', element: 'water', elements: ['water', 'earth'],
    description: 'A pressurized geyser bursts from the ground',
    baseDamage: 34, manaCost: 26, cooldown: 1.5, range: 250,
    projectileSpeed: 0, aoeRadius: 70, color: '#0088ff', secondaryColor: '#886644',
  },
  {
    id: 'firestorm', name: 'Firestorm', element: 'fire', elements: ['fire', 'wind'],
    description: 'Fire whipped into a devastating tornado',
    baseDamage: 42, manaCost: 38, cooldown: 2.5, range: 0,
    projectileSpeed: 0, aoeRadius: 110, color: '#ff6600', secondaryColor: '#aaffaa',
  },
  {
    id: 'quake', name: 'Earthquake', element: 'earth', elements: ['earth', 'lightning'],
    description: 'Lightning strikes the ground causing a shockwave',
    baseDamage: 50, manaCost: 45, cooldown: 3.5, range: 0,
    projectileSpeed: 0, aoeRadius: 140, color: '#886644', secondaryColor: '#ffff00',
  },
  {
    id: 'frozen_flame', name: 'Frozen Flame', element: 'fire', elements: ['fire', 'ice'],
    description: 'Paradoxical flame that burns and freezes',
    baseDamage: 36, manaCost: 30, cooldown: 1.5, range: 280,
    projectileSpeed: 350, aoeRadius: 45, color: '#ff4488', secondaryColor: '#88ddff',
  },
  {
    id: 'static_ice', name: 'Static Ice', element: 'ice', elements: ['ice', 'lightning'],
    description: 'Electrically charged ice that stuns on impact',
    baseDamage: 33, manaCost: 28, cooldown: 1.3, range: 300,
    projectileSpeed: 400, aoeRadius: 0, color: '#88ddff', secondaryColor: '#ffff00',
  },
];

export function findComboSpell(el1: SpellElement, el2: SpellElement): ComboSpellDef | undefined {
  return COMBO_SPELLS.find(
    (s) =>
      (s.elements[0] === el1 && s.elements[1] === el2) ||
      (s.elements[0] === el2 && s.elements[1] === el1)
  );
}
