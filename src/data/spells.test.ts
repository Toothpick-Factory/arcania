import { describe, it, expect } from 'vitest';
import { BASE_SPELLS, COMBO_SPELLS, findComboSpell } from './spells';

describe('Spells data', () => {
  it('has 6 base spells', () => {
    expect(BASE_SPELLS.length).toBe(6);
  });

  it('all base spells have unique ids', () => {
    const ids = BASE_SPELLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all base spells have positive damage and mana cost', () => {
    for (const spell of BASE_SPELLS) {
      expect(spell.baseDamage).toBeGreaterThan(0);
      expect(spell.manaCost).toBeGreaterThan(0);
      expect(spell.cooldown).toBeGreaterThan(0);
    }
  });

  it('has combo spells', () => {
    expect(COMBO_SPELLS.length).toBeGreaterThan(0);
  });

  it('findComboSpell works in both orders', () => {
    const steam1 = findComboSpell('fire', 'water');
    const steam2 = findComboSpell('water', 'fire');
    expect(steam1).toBeDefined();
    expect(steam1?.id).toBe('steam');
    expect(steam2?.id).toBe('steam');
  });

  it('returns undefined for non-existent combo', () => {
    // fire + fire is not a combo
    expect(findComboSpell('fire', 'fire')).toBeUndefined();
  });

  it('combo spells cost more than base spells on average', () => {
    const avgBase = BASE_SPELLS.reduce((s, sp) => s + sp.manaCost, 0) / BASE_SPELLS.length;
    const avgCombo = COMBO_SPELLS.reduce((s, sp) => s + sp.manaCost, 0) / COMBO_SPELLS.length;
    expect(avgCombo).toBeGreaterThan(avgBase);
  });
});
