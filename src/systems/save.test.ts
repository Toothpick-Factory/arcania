import { describe, it, expect } from 'vitest';
import { getDefaultMeta, updateMetaFromRun } from './save';
import { createPlayer, unlockMagic } from '../entities/player';

describe('Save system', () => {
  it('creates default meta with expected values', () => {
    const meta = getDefaultMeta();
    expect(meta.totalRuns).toBe(0);
    expect(meta.bestFloor).toBe(0);
    expect(meta.unlockedMagics).toHaveLength(0);
    expect(meta.discoveredCombos).toHaveLength(0);
    expect(meta.discoveredRecipes).toHaveLength(0);
  });

  it('updateMetaFromRun updates stats', () => {
    const meta = getDefaultMeta();
    const player = createPlayer();
    player.gold = 50;
    unlockMagic(player, 'ice');

    updateMetaFromRun(meta, player, 3);
    expect(meta.totalRuns).toBe(1);
    expect(meta.bestFloor).toBe(3);
    expect(meta.totalGoldEarned).toBe(50);
    expect(meta.unlockedMagics).toContain('ice');
  });

  it('bestFloor only increases', () => {
    const meta = getDefaultMeta();
    const player = createPlayer();

    updateMetaFromRun(meta, player, 5);
    expect(meta.bestFloor).toBe(5);

    updateMetaFromRun(meta, player, 3);
    expect(meta.bestFloor).toBe(5);
  });
});
