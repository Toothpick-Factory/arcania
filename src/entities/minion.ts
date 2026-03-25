import { Vec2 } from '../engine/types';
import { DungeonMap, isTileWalkable, worldToTile } from '../systems/dungeon';
import { vec2Sub, vec2Normalize, vec2Len, vec2Scale, generateId } from '../utils/math';
import { Enemy, damageEnemy } from './enemy';

export interface Minion {
  id: string;
  position: Vec2;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  size: number;
  color: string;
  lifetime: number;    // seconds remaining
  attackTimer: number;
  attackCooldown: number;
  attackRange: number;
}

export function createMinion(
  position: Vec2,
  damage: number,
  duration: number,
  color: string,
  count: number = 1
): Minion[] {
  const minions: Minion[] = [];
  for (let i = 0; i < count; i++) {
    const offset = {
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
    };
    minions.push({
      id: generateId(),
      position: { x: position.x + offset.x, y: position.y + offset.y },
      hp: 30 + damage * 2,
      maxHp: 30 + damage * 2,
      damage,
      speed: 120,
      size: 10,
      color,
      lifetime: duration,
      attackTimer: 0,
      attackCooldown: 1.0,
      attackRange: 25,
    });
  }
  return minions;
}

export function updateMinion(
  minion: Minion,
  playerPos: Vec2,
  enemies: Enemy[],
  dungeon: DungeonMap,
  dt: number
): boolean {
  // Decrease lifetime
  minion.lifetime -= dt;
  if (minion.lifetime <= 0 || minion.hp <= 0) return true; // dead

  // Find nearest active enemy within 200px
  let nearestEnemy: Enemy | null = null;
  let nearestDist = 200;
  for (const enemy of enemies) {
    if (!enemy.active) continue;
    const dist = vec2Len(vec2Sub(enemy.position, minion.position));
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestEnemy = enemy;
    }
  }

  const halfSize = minion.size / 2;

  if (nearestEnemy) {
    // Chase and attack nearest enemy
    const toEnemy = vec2Sub(nearestEnemy.position, minion.position);
    const dist = vec2Len(toEnemy);

    if (dist > minion.attackRange) {
      // Move toward enemy
      const dir = vec2Normalize(toEnemy);
      const newX = minion.position.x + dir.x * minion.speed * dt;
      const newY = minion.position.y + dir.y * minion.speed * dt;
      const tileX = worldToTile(newX + (dir.x > 0 ? halfSize : -halfSize), minion.position.y);
      if (isTileWalkable(dungeon, tileX.x, tileX.y)) minion.position.x = newX;
      const tileY = worldToTile(minion.position.x, newY + (dir.y > 0 ? halfSize : -halfSize));
      if (isTileWalkable(dungeon, tileY.x, tileY.y)) minion.position.y = newY;
    }

    // Attack
    minion.attackTimer -= dt;
    if (dist <= minion.attackRange + nearestEnemy.def.size / 2 && minion.attackTimer <= 0) {
      const knockDir = vec2Normalize(toEnemy);
      damageEnemy(nearestEnemy, minion.damage, knockDir);
      minion.attackTimer = minion.attackCooldown;
    }
  } else {
    // Follow the player (stay within 60px)
    const toPlayer = vec2Sub(playerPos, minion.position);
    const playerDist = vec2Len(toPlayer);
    if (playerDist > 60) {
      const dir = vec2Normalize(toPlayer);
      const newX = minion.position.x + dir.x * minion.speed * dt;
      const newY = minion.position.y + dir.y * minion.speed * dt;
      const tileX = worldToTile(newX + (dir.x > 0 ? halfSize : -halfSize), minion.position.y);
      if (isTileWalkable(dungeon, tileX.x, tileX.y)) minion.position.x = newX;
      const tileY = worldToTile(minion.position.x, newY + (dir.y > 0 ? halfSize : -halfSize));
      if (isTileWalkable(dungeon, tileY.x, tileY.y)) minion.position.y = newY;
    }
  }

  return false; // still alive
}
