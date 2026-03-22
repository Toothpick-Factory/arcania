import { describe, it, expect } from 'vitest';
import { ENEMIES, BOSSES, getEnemiesForFloor, getBossForFloor, scaleEnemyForFloor } from './enemies';

describe('Enemies data', () => {
  it('has multiple enemy types', () => {
    expect(ENEMIES.length).toBeGreaterThan(5);
  });

  it('has bosses', () => {
    expect(BOSSES.length).toBeGreaterThan(0);
  });

  it('final boss exists', () => {
    const final = BOSSES.find((b) => b.id === 'boss_final');
    expect(final).toBeDefined();
    expect(final!.name).toBe('Malachar the Undying');
  });

  it('getEnemiesForFloor filters by minFloor', () => {
    const floor1 = getEnemiesForFloor(1);
    const floor5 = getEnemiesForFloor(5);
    expect(floor5.length).toBeGreaterThanOrEqual(floor1.length);

    for (const e of floor1) {
      expect(e.minFloor).toBeLessThanOrEqual(1);
    }
  });

  it('getBossForFloor returns appropriate boss', () => {
    const boss = getBossForFloor(2);
    expect(boss).toBeDefined();
    expect(boss!.behavior).toBe('boss');
  });

  it('scaling increases stats', () => {
    const base = ENEMIES[0];
    const scaled = scaleEnemyForFloor(base, 5);
    expect(scaled.hp).toBeGreaterThan(base.hp);
    expect(scaled.damage).toBeGreaterThan(base.damage);
  });
});
