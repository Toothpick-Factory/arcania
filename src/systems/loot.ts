import { EnemyDef } from '../data/enemies';
import { ItemDef, INGREDIENTS, MATERIALS, getIngredientsForFloor } from '../data/items';
import { MagicType, ALL_MAGIC_TYPES } from '../data/spells';
import { randomInt, randomFloat, randomChoice } from '../utils/math';

export interface LootDrop {
  gold: number;
  items: { item: ItemDef; count: number }[];
  magicUnlock?: MagicType;
}

// Order in which magic types are unlocked through gameplay
const MAGIC_UNLOCK_ORDER: MagicType[] = [
  'ice', 'earth', 'lightning', 'poison',
  'blood', 'crystal', 'necrotic',
  'lunar', 'minion',
];

export function generateLoot(enemyDef: EnemyDef, floor: number, unlockedMagics: MagicType[]): LootDrop {
  const gold = randomInt(enemyDef.goldDrop[0], enemyDef.goldDrop[1]);
  const items: { item: ItemDef; count: number }[] = [];

  // 30% chance to drop an ingredient
  if (randomFloat(0, 1) < 0.3) {
    const available = getIngredientsForFloor(floor);
    if (available.length > 0) {
      items.push({ item: randomChoice(available), count: 1 });
    }
  }

  // 15% chance to drop a material
  if (randomFloat(0, 1) < 0.15) {
    const available = MATERIALS.filter((m) => m.minFloor <= floor);
    if (available.length > 0) {
      items.push({ item: randomChoice(available), count: 1 });
    }
  }

  // Boss loot
  if (enemyDef.behavior === 'boss') {
    const available = getIngredientsForFloor(floor);
    items.push({ item: randomChoice(available), count: randomInt(2, 4) });

    const matAvail = MATERIALS.filter((m) => m.minFloor <= floor);
    if (matAvail.length > 0) {
      items.push({ item: randomChoice(matAvail), count: randomInt(1, 3) });
    }
  }

  // Magic type unlock
  let magicUnlock: MagicType | undefined;
  if (enemyDef.behavior === 'boss') {
    const nextMagic = MAGIC_UNLOCK_ORDER.find((m) => !unlockedMagics.includes(m));
    if (nextMagic && randomFloat(0, 1) < 0.9) {
      magicUnlock = nextMagic;
    }
  } else if (randomFloat(0, 1) < 0.015) {
    const nextMagic = MAGIC_UNLOCK_ORDER.find((m) => !unlockedMagics.includes(m));
    if (nextMagic) magicUnlock = nextMagic;
  }

  return { gold, items, magicUnlock };
}
