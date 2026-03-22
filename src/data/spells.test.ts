import { describe, it, expect } from 'vitest';
import {
  ALL_SPELLS, COMBO_SPELLS, SPELLS_BY_TYPE, ALL_MAGIC_TYPES,
  findComboSpell, getSpellForTier, getHighestUnlockedTier, xpToNextTier,
  getSpellById, TIER_XP_THRESHOLDS,
} from './spells';

describe('Spell data', () => {
  it('has 15 magic types', () => {
    expect(ALL_MAGIC_TYPES.length).toBe(15);
  });

  it('has 5 tiers per magic type (75 base spells)', () => {
    expect(ALL_SPELLS.length).toBe(75);
    for (const mt of ALL_MAGIC_TYPES) {
      const spells = SPELLS_BY_TYPE[mt];
      expect(spells.length).toBe(5);
      for (let tier = 1; tier <= 5; tier++) {
        expect(spells.find((s) => s.tier === tier)).toBeDefined();
      }
    }
  });

  it('all spells have unique ids', () => {
    const ids = ALL_SPELLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all spells have positive damage or utility', () => {
    for (const spell of ALL_SPELLS) {
      const hasOffense = spell.baseDamage > 0 || (spell.dotDamage && spell.dotDamage > 0);
      const hasUtility = (spell.shieldAmount && spell.shieldAmount > 0) || (spell.healAmount && spell.healAmount > 0);
      expect(Boolean(hasOffense || hasUtility)).toBe(true);
    }
  });

  it('higher tiers cost more mana', () => {
    for (const mt of ALL_MAGIC_TYPES) {
      const spells = SPELLS_BY_TYPE[mt];
      for (let i = 1; i < spells.length; i++) {
        expect(spells[i].manaCost).toBeGreaterThanOrEqual(spells[i - 1].manaCost);
      }
    }
  });

  it('has combo spells', () => {
    expect(COMBO_SPELLS.length).toBeGreaterThan(0);
  });

  it('findComboSpell works in both orders', () => {
    const combo = findComboSpell('fire', 'ice');
    const comboReverse = findComboSpell('ice', 'fire');
    expect(combo).toBeDefined();
    expect(combo?.id).toBe(comboReverse?.id);
  });

  it('returns undefined for non-existent combo', () => {
    expect(findComboSpell('fire', 'fire')).toBeUndefined();
  });
});

describe('Tier progression', () => {
  it('getHighestUnlockedTier returns 1 at 0 xp', () => {
    expect(getHighestUnlockedTier(0)).toBe(1);
  });

  it('getHighestUnlockedTier returns correct tiers', () => {
    expect(getHighestUnlockedTier(TIER_XP_THRESHOLDS[2])).toBe(2);
    expect(getHighestUnlockedTier(TIER_XP_THRESHOLDS[3])).toBe(3);
    expect(getHighestUnlockedTier(TIER_XP_THRESHOLDS[5])).toBe(5);
  });

  it('getSpellForTier returns correct spell', () => {
    const spell = getSpellForTier('fire', 1);
    expect(spell?.id).toBe('ember_spark');
    const spell3 = getSpellForTier('fire', 3);
    expect(spell3?.id).toBe('magma_orb');
  });

  it('getSpellById finds base and combo spells', () => {
    expect(getSpellById('ember_spark')).toBeDefined();
    expect(getSpellById('steam_burst')).toBeDefined();
    expect(getSpellById('nonexistent')).toBeUndefined();
  });

  it('xpToNextTier calculates progress', () => {
    const info = xpToNextTier(0);
    expect(info.currentTier).toBe(1);
    expect(info.nextTier).toBe(2);
    expect(info.progress).toBe(0);

    const maxInfo = xpToNextTier(600);
    expect(maxInfo.currentTier).toBe(5);
    expect(maxInfo.nextTier).toBeNull();
    expect(maxInfo.progress).toBe(1);
  });
});
