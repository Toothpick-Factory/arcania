import { describe, it, expect } from 'vitest';
import {
  createPlayer, damagePlayer, healPlayer, addXp, addSpellXp,
  addItemToInventory, removeItemFromInventory, getItemCount,
  unlockSpell, hasSpell, applyFoodEffect
} from './player';

describe('Player creation', () => {
  it('creates player with default stats', () => {
    const p = createPlayer();
    expect(p.hp).toBe(100);
    expect(p.maxHp).toBe(100);
    expect(p.mana).toBe(80);
    expect(p.level).toBe(1);
    expect(p.gold).toBe(0);
    expect(p.spells.length).toBe(1);
    expect(p.spells[0].element).toBe('fire');
  });
});

describe('Player damage/heal', () => {
  it('takes damage', () => {
    const p = createPlayer();
    damagePlayer(p, 30);
    expect(p.hp).toBe(70);
  });

  it('respects invincibility', () => {
    const p = createPlayer();
    damagePlayer(p, 30);
    expect(p.invincibleTimer).toBeGreaterThan(0);
    damagePlayer(p, 30); // should be blocked
    expect(p.hp).toBe(70);
  });

  it('reduces damage by defense', () => {
    const p = createPlayer();
    p.defense = 5;
    damagePlayer(p, 30);
    expect(p.hp).toBe(75); // 30-5=25 damage
  });

  it('heals correctly', () => {
    const p = createPlayer();
    p.hp = 50;
    healPlayer(p, 30);
    expect(p.hp).toBe(80);
  });

  it('does not overheal', () => {
    const p = createPlayer();
    p.hp = 90;
    healPlayer(p, 50);
    expect(p.hp).toBe(100);
  });
});

describe('Player XP and leveling', () => {
  it('adds XP', () => {
    const p = createPlayer();
    addXp(p, 20);
    expect(p.xp).toBe(20);
    expect(p.level).toBe(1);
  });

  it('levels up when XP threshold reached', () => {
    const p = createPlayer();
    const leveled = addXp(p, 50);
    expect(leveled).toBe(true);
    expect(p.level).toBe(2);
    expect(p.maxHp).toBeGreaterThan(100);
  });

  it('spell XP works', () => {
    const p = createPlayer();
    addSpellXp(p, 'fire', 30);
    expect(p.spells[0].level).toBe(2);
  });
});

describe('Player inventory', () => {
  it('adds items', () => {
    const p = createPlayer();
    addItemToInventory(p, 'herb_green', 5);
    expect(getItemCount(p, 'herb_green')).toBe(5);
  });

  it('stacks items', () => {
    const p = createPlayer();
    addItemToInventory(p, 'herb_green', 3);
    addItemToInventory(p, 'herb_green', 2);
    expect(getItemCount(p, 'herb_green')).toBe(5);
  });

  it('removes items', () => {
    const p = createPlayer();
    addItemToInventory(p, 'herb_green', 5);
    removeItemFromInventory(p, 'herb_green', 3);
    expect(getItemCount(p, 'herb_green')).toBe(2);
  });

  it('cannot remove more than available', () => {
    const p = createPlayer();
    addItemToInventory(p, 'herb_green', 2);
    expect(removeItemFromInventory(p, 'herb_green', 5)).toBe(false);
    expect(getItemCount(p, 'herb_green')).toBe(2);
  });

  it('removes item entry when count reaches 0', () => {
    const p = createPlayer();
    addItemToInventory(p, 'herb_green', 3);
    removeItemFromInventory(p, 'herb_green', 3);
    expect(p.inventory.length).toBe(0);
  });
});

describe('Player spells', () => {
  it('starts with fire spell', () => {
    const p = createPlayer();
    expect(hasSpell(p, 'fire')).toBe(true);
    expect(hasSpell(p, 'water')).toBe(false);
  });

  it('unlocks new spells', () => {
    const p = createPlayer();
    unlockSpell(p, 'water');
    expect(hasSpell(p, 'water')).toBe(true);
    expect(p.spells.length).toBe(2);
  });

  it('does not duplicate spells', () => {
    const p = createPlayer();
    unlockSpell(p, 'fire');
    expect(p.spells.length).toBe(1);
  });
});

describe('Food effects', () => {
  it('applies heal effect', () => {
    const p = createPlayer();
    p.hp = 50;
    applyFoodEffect(p, 'cooked_meat', { healAmount: 30 });
    expect(p.hp).toBe(80);
  });

  it('applies max HP bonus', () => {
    const p = createPlayer();
    applyFoodEffect(p, 'dragon_feast', { maxHpBonus: 50, duration: 60 });
    expect(p.maxHp).toBe(150);
    expect(p.hp).toBe(150);
  });

  it('creates a buff with duration', () => {
    const p = createPlayer();
    applyFoodEffect(p, 'spicy_stew', { damageBonus: 10, duration: 30 });
    expect(p.activeBuffs.length).toBe(1);
    expect(p.activeBuffs[0].remainingTime).toBe(30);
  });
});
