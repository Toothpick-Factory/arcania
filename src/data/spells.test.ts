import { describe, it, expect } from 'vitest';
import {
  ALL_SPELLS, COMBO_SPELLS, SPELLS_BY_TYPE, ALL_MAGIC_TYPES,
  findComboSpell, getSpellForTier, getHighestUnlockedTier, xpToNextTier,
  getSpellById, TIER_XP_THRESHOLDS,
} from './spells';

describe('Spell data', () => {
  it('has 11 magic types', () => {
    expect(ALL_MAGIC_TYPES.length).toBe(11);
  });

  it('has 5 tiers per magic type (55 base spells)', () => {
    expect(ALL_SPELLS.length).toBe(55);
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

  it('has 110 T1 combo spells (11 bases x 10 modifiers)', () => {
    expect(COMBO_SPELLS.length).toBe(110);
  });

  it('all combo spells have unique ids', () => {
    const ids = COMBO_SPELLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('combo spells are order-dependent (Fire+Ice != Ice+Fire)', () => {
    const fireIce = findComboSpell('fire', 'ice');
    const iceFire = findComboSpell('ice', 'fire');
    expect(fireIce).toBeDefined();
    expect(iceFire).toBeDefined();
    expect(fireIce!.id).not.toBe(iceFire!.id);
    expect(fireIce!.name).toBe('Scalding Steam');
    expect(iceFire!.name).toBe('Flash Melt');
  });

  it('every magic type has 10 combos as base', () => {
    for (const mt of ALL_MAGIC_TYPES) {
      const combos = COMBO_SPELLS.filter((c) => c.baseElement === mt);
      expect(combos.length).toBe(10);
    }
  });

  it('returns undefined for same-element combo', () => {
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
    expect(getSpellForTier('fire', 1)?.id).toBe('ember_spark');
    expect(getSpellForTier('fire', 3)?.id).toBe('magma_orb');
    expect(getSpellForTier('light', 1)?.id).toBe('luminous_bolt');
  });

  it('getSpellById finds base and combo spells', () => {
    expect(getSpellById('ember_spark')).toBeDefined();
    expect(getSpellById('scalding_steam')).toBeDefined();
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
  });
});
