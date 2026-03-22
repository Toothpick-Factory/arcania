import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDefaultMeta, updateMetaFromRun } from './save';
import { createPlayer, unlockSpell } from '../entities/player';

describe('Save system', () => {
  it('creates default meta with expected values', () => {
    const meta = getDefaultMeta();
    expect(meta.totalRuns).toBe(0);
    expect(meta.bestFloor).toBe(0);
    expect(meta.unlockedSpells).toContain('fire');
    expect(meta.discoveredRecipes).toHaveLength(0);
  });

  it('updateMetaFromRun updates stats', () => {
    const meta = getDefaultMeta();
    const player = createPlayer();
    player.gold = 50;
    unlockSpell(player, 'water');

    updateMetaFromRun(meta, player, 3);
    expect(meta.totalRuns).toBe(1);
    expect(meta.bestFloor).toBe(3);
    expect(meta.totalGoldEarned).toBe(50);
    expect(meta.unlockedSpells).toContain('water');
  });

  it('bestFloor only increases', () => {
    const meta = getDefaultMeta();
    const player = createPlayer();

    updateMetaFromRun(meta, player, 5);
    expect(meta.bestFloor).toBe(5);

    updateMetaFromRun(meta, player, 3);
    expect(meta.bestFloor).toBe(5); // should not decrease
  });
});
