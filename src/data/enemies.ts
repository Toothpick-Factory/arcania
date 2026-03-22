export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  damage: number;
  speed: number;
  xpReward: number;
  goldDrop: [number, number]; // min, max
  color: string;
  size: number;
  attackRange: number;
  attackCooldown: number;
  behavior: 'melee' | 'ranged' | 'charger' | 'boss';
  minFloor: number;
}

export const ENEMIES: EnemyDef[] = [
  {
    id: 'rat', name: 'Dungeon Rat', hp: 30, damage: 5, speed: 100,
    xpReward: 10, goldDrop: [1, 3], color: '#888866', size: 12,
    attackRange: 20, attackCooldown: 1.0, behavior: 'melee', minFloor: 1,
  },
  {
    id: 'slime', name: 'Slime', hp: 45, damage: 8, speed: 60,
    xpReward: 15, goldDrop: [2, 5], color: '#44cc44', size: 16,
    attackRange: 18, attackCooldown: 1.2, behavior: 'melee', minFloor: 1,
  },
  {
    id: 'skeleton', name: 'Skeleton', hp: 60, damage: 12, speed: 90,
    xpReward: 25, goldDrop: [3, 8], color: '#ddddaa', size: 14,
    attackRange: 22, attackCooldown: 0.9, behavior: 'melee', minFloor: 2,
  },
  {
    id: 'bat', name: 'Cave Bat', hp: 25, damage: 7, speed: 150,
    xpReward: 12, goldDrop: [1, 4], color: '#664466', size: 10,
    attackRange: 16, attackCooldown: 0.6, behavior: 'charger', minFloor: 1,
  },
  {
    id: 'goblin_archer', name: 'Goblin Archer', hp: 40, damage: 15, speed: 70,
    xpReward: 20, goldDrop: [3, 7], color: '#448844', size: 13,
    attackRange: 200, attackCooldown: 1.5, behavior: 'ranged', minFloor: 2,
  },
  {
    id: 'golem', name: 'Stone Golem', hp: 120, damage: 20, speed: 40,
    xpReward: 40, goldDrop: [5, 12], color: '#888888', size: 22,
    attackRange: 28, attackCooldown: 1.8, behavior: 'melee', minFloor: 3,
  },
  {
    id: 'wraith', name: 'Wraith', hp: 50, damage: 18, speed: 110,
    xpReward: 30, goldDrop: [4, 10], color: '#8844aa', size: 15,
    attackRange: 150, attackCooldown: 1.2, behavior: 'ranged', minFloor: 3,
  },
  {
    id: 'fire_imp', name: 'Fire Imp', hp: 55, damage: 22, speed: 120,
    xpReward: 35, goldDrop: [5, 11], color: '#ff6622', size: 12,
    attackRange: 180, attackCooldown: 1.0, behavior: 'ranged', minFloor: 4,
  },
  {
    id: 'ogre', name: 'Ogre', hp: 200, damage: 30, speed: 50,
    xpReward: 60, goldDrop: [8, 20], color: '#668844', size: 26,
    attackRange: 32, attackCooldown: 2.0, behavior: 'melee', minFloor: 4,
  },
  {
    id: 'dark_knight', name: 'Dark Knight', hp: 150, damage: 25, speed: 80,
    xpReward: 50, goldDrop: [7, 15], color: '#334455', size: 18,
    attackRange: 26, attackCooldown: 1.0, behavior: 'melee', minFloor: 5,
  },
];

export const BOSSES: EnemyDef[] = [
  {
    id: 'boss_slime_king', name: 'Slime King', hp: 300, damage: 20, speed: 50,
    xpReward: 150, goldDrop: [30, 50], color: '#22ee22', size: 40,
    attackRange: 35, attackCooldown: 1.5, behavior: 'boss', minFloor: 2,
  },
  {
    id: 'boss_bone_lord', name: 'Bone Lord', hp: 500, damage: 30, speed: 70,
    xpReward: 300, goldDrop: [50, 80], color: '#eeddaa', size: 36,
    attackRange: 200, attackCooldown: 1.0, behavior: 'boss', minFloor: 4,
  },
  {
    id: 'boss_archmage', name: 'The Archmage', hp: 800, damage: 45, speed: 60,
    xpReward: 500, goldDrop: [80, 120], color: '#aa22ff', size: 32,
    attackRange: 250, attackCooldown: 0.8, behavior: 'boss', minFloor: 6,
  },
  {
    id: 'boss_final', name: 'Malachar the Undying', hp: 1500, damage: 60, speed: 80,
    xpReward: 1000, goldDrop: [150, 250], color: '#ff0044', size: 44,
    attackRange: 280, attackCooldown: 0.7, behavior: 'boss', minFloor: 8,
  },
];

export function getEnemiesForFloor(floor: number): EnemyDef[] {
  return ENEMIES.filter((e) => e.minFloor <= floor);
}

export function getBossForFloor(floor: number): EnemyDef | undefined {
  const eligible = BOSSES.filter((b) => b.minFloor <= floor);
  return eligible.length > 0 ? eligible[eligible.length - 1] : undefined;
}

export function scaleEnemyForFloor(def: EnemyDef, floor: number): EnemyDef {
  const scale = 1 + (floor - 1) * 0.15;
  return {
    ...def,
    hp: Math.round(def.hp * scale),
    damage: Math.round(def.damage * scale),
    speed: def.speed + floor * 2,
    xpReward: Math.round(def.xpReward * scale),
    goldDrop: [
      Math.round(def.goldDrop[0] * scale),
      Math.round(def.goldDrop[1] * scale),
    ],
  };
}
