import { describe, it, expect } from 'vitest';
import {
  createPlayer, damagePlayer, healPlayer, addXp, addMagicXp,
  addItemToInventory, removeItemFromInventory, getItemCount,
  unlockMagic, hasMagic, applyFoodEffect, addShield,
} from './player';

describe('Player creation', () => {
  it('creates player with default stats', () => {
    const p = createPlayer();
    expect(p.hp).toBe(100);
    expect(p.maxHp).toBe(100);
    expect(p.mana).toBe(80);
    expect(p.level).toBe(1);
    expect(p.gold).toBe(0);
    expect(p.magics.length).toBe(2); // fire + arcane
    expect(p.magics[0].magicType).toBe('fire');
    expect(p.magics[1].magicType).toBe('arcane');
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
    damagePlayer(p, 30);
    expect(p.hp).toBe(70);
  });

  it('reduces damage by defense', () => {
    const p = createPlayer();
    p.defense = 5;
    damagePlayer(p, 30);
    expect(p.hp).toBe(75);
  });

  it('shield absorbs damage', () => {
    const p = createPlayer();
    addShield(p, 20, 5);
    damagePlayer(p, 15);
    expect(p.shield).toBe(5);
    expect(p.hp).toBe(100);
  });

  it('shield overflow goes to hp', () => {
    const p = createPlayer();
    addShield(p, 10, 5);
    damagePlayer(p, 25);
    expect(p.shield).toBe(0);
    expect(p.hp).toBe(85); // 25 - 10 shield = 15 damage
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

  it('magic XP accumulates', () => {
    const p = createPlayer();
    addMagicXp(p, 'fire', 20);
    expect(p.magics[0].xp).toBe(20);
  });

  it('magic XP triggers tier unlock', () => {
    const p = createPlayer();
    const result = addMagicXp(p, 'fire', 40); // threshold for tier 2
    expect(result.leveled).toBe(true);
    expect(result.newTier).toBe(2);
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

describe('Player magic types', () => {
  it('starts with fire and arcane', () => {
    const p = createPlayer();
    expect(hasMagic(p, 'fire')).toBe(true);
    expect(hasMagic(p, 'arcane')).toBe(true);
    expect(hasMagic(p, 'ice')).toBe(false);
  });

  it('unlocks new magic types', () => {
    const p = createPlayer();
    unlockMagic(p, 'ice');
    expect(hasMagic(p, 'ice')).toBe(true);
    expect(p.magics.length).toBe(3);
  });

  it('does not duplicate magic types', () => {
    const p = createPlayer();
    unlockMagic(p, 'fire');
    expect(p.magics.length).toBe(2);
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
