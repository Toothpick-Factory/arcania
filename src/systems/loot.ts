import { EnemyDef } from '../data/enemies';
import { ItemDef, INGREDIENTS, MATERIALS, getIngredientsForFloor } from '../data/items';
import { SpellElement } from '../data/spells';
import { randomInt, randomFloat, randomChoice } from '../utils/math';

export interface LootDrop {
  gold: number;
  items: { item: ItemDef; count: number }[];
  spellUnlock?: SpellElement;
}

const SPELL_UNLOCK_ORDER: SpellElement[] = ['water', 'ice', 'wind', 'earth', 'lightning'];

export function generateLoot(enemyDef: EnemyDef, floor: number, unlockedSpells: SpellElement[]): LootDrop {
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

  // Boss loot - always drops something good
  if (enemyDef.behavior === 'boss') {
    const available = getIngredientsForFloor(floor);
    items.push({ item: randomChoice(available), count: randomInt(2, 4) });

    const matAvail = MATERIALS.filter((m) => m.minFloor <= floor);
    if (matAvail.length > 0) {
      items.push({ item: randomChoice(matAvail), count: randomInt(1, 3) });
    }
  }

  // Chance to unlock a new spell from boss kills
  let spellUnlock: SpellElement | undefined;
  if (enemyDef.behavior === 'boss') {
    const nextSpell = SPELL_UNLOCK_ORDER.find((s) => !unlockedSpells.includes(s));
    if (nextSpell && randomFloat(0, 1) < 0.8) {
      spellUnlock = nextSpell;
    }
  } else if (randomFloat(0, 1) < 0.02) {
    // Very small chance from regular enemies
    const nextSpell = SPELL_UNLOCK_ORDER.find((s) => !unlockedSpells.includes(s));
    if (nextSpell) spellUnlock = nextSpell;
  }

  return { gold, items, spellUnlock };
}
