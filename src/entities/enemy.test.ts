import { describe, it, expect } from 'vitest';
import { createEnemy, updateEnemy, Enemy } from './enemy';
import { EnemyDef, ENEMIES } from '../data/enemies';
import { generateDungeon, getRoomCenterWorld, worldToTile, tileToWorld } from '../systems/dungeon';

const makeDef = (overrides: Partial<EnemyDef> = {}): EnemyDef => ({
  id: 'test_rat',
  name: 'Test Rat',
  hp: 30,
  damage: 5,
  speed: 100,
  xpReward: 10,
  goldDrop: [1, 3],
  color: '#888866',
  size: 12,
  attackRange: 20,
  attackCooldown: 1.0,
  behavior: 'melee',
  minFloor: 1,
  ...overrides,
});

describe('createEnemy', () => {
  it('creates enemy with default values', () => {
    const def = makeDef();
    const enemy = createEnemy(def, { x: 100, y: 200 });
    expect(enemy.hp).toBe(30);
    expect(enemy.maxHp).toBe(30);
    expect(enemy.position).toEqual({ x: 100, y: 200 });
    expect(enemy.active).toBe(true);
    expect(enemy.dormant).toBe(false);
    expect(enemy.aware).toBe(false);
  });

  it('isBoss defaults to false', () => {
    const def = makeDef();
    const enemy = createEnemy(def, { x: 0, y: 0 });
    expect(enemy.isBoss).toBe(false);
  });

  it('roomBounds is undefined by default', () => {
    const def = makeDef();
    const enemy = createEnemy(def, { x: 0, y: 0 });
    expect(enemy.roomBounds).toBeUndefined();
  });

  it('copies position so original is not mutated', () => {
    const pos = { x: 50, y: 50 };
    const enemy = createEnemy(makeDef(), pos);
    enemy.position.x = 999;
    expect(pos.x).toBe(50);
  });
});

describe('updateEnemy roomBounds clamping', () => {
  it('clamps enemy position to roomBounds during knockback', () => {
    const dungeon = generateDungeon(1);
    const center = getRoomCenterWorld(dungeon.spawnRoom);
    const def = makeDef();
    const enemy = createEnemy(def, { x: center.x, y: center.y });

    // Set roomBounds tightly around the enemy
    const bounds = {
      left: center.x - 10,
      right: center.x + 10,
      top: center.y - 10,
      bottom: center.y + 10,
    };
    enemy.roomBounds = bounds;
    enemy.active = true;
    enemy.aware = true;
    // Apply strong knockback to push enemy outside bounds
    enemy.knockbackVel = { x: 500, y: 500 };

    const playerPos = { x: center.x + 5, y: center.y + 5 };
    updateEnemy(enemy, playerPos, dungeon, 0.5, [enemy]);

    // Enemy should be clamped within bounds
    expect(enemy.position.x).toBeLessThanOrEqual(bounds.right);
    expect(enemy.position.x).toBeGreaterThanOrEqual(bounds.left);
    expect(enemy.position.y).toBeLessThanOrEqual(bounds.bottom);
    expect(enemy.position.y).toBeGreaterThanOrEqual(bounds.top);
  });

  it('does not clamp when roomBounds is not set', () => {
    const dungeon = generateDungeon(1);
    const center = getRoomCenterWorld(dungeon.spawnRoom);
    const def = makeDef();
    const enemy = createEnemy(def, { x: center.x, y: center.y });

    enemy.active = true;
    enemy.aware = true;
    enemy.alertTimer = 5; // keep aware even without direct LoS
    // No roomBounds set — should move freely (within walkable tiles)
    expect(enemy.roomBounds).toBeUndefined();

    const origX = enemy.position.x;
    // Place player nearby within same room (close enough for LoS)
    const playerPos = { x: center.x + 50, y: center.y };
    updateEnemy(enemy, playerPos, dungeon, 0.5, [enemy]);

    // Enemy should have moved toward player
    expect(enemy.position.x).not.toBe(origX);
  });
});
