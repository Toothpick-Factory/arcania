import { Vec2, TILE_SIZE } from '../engine/types';
import { EnemyDef } from '../data/enemies';
import { DungeonMap, isTileWalkable, worldToTile, hasLineOfSight } from '../systems/dungeon';
import { vec2Sub, vec2Normalize, vec2Len, vec2Scale, generateId } from '../utils/math';

export interface Enemy {
  id: string;
  def: EnemyDef;
  position: Vec2;
  hp: number;
  maxHp: number;
  attackTimer: number;
  active: boolean;
  dormant: boolean;      // CSV3: boss stays inactive until player enters room
  aware: boolean;
  alertTimer: number;
  stunTimer: number;
  knockbackVel: Vec2;
  // For ranged enemies
  shootTimer: number;
}

export interface EnemyProjectile {
  id: string;
  position: Vec2;
  velocity: Vec2;
  damage: number;
  radius: number;
  lifetime: number;
  color: string;
}

export function createEnemy(def: EnemyDef, position: Vec2): Enemy {
  return {
    id: generateId(),
    def,
    position: { ...position },
    hp: def.hp,
    maxHp: def.hp,
    attackTimer: 0,
    active: true,
    dormant: false,
    aware: false,
    alertTimer: 0,
    stunTimer: 0,
    knockbackVel: { x: 0, y: 0 },
    shootTimer: def.attackCooldown,
  };
}

export function updateEnemy(
  enemy: Enemy,
  playerPos: Vec2,
  dungeon: DungeonMap,
  dt: number,
  enemies: Enemy[]
): EnemyProjectile | null {
  if (!enemy.active) return null;
  if (enemy.dormant) return null; // CSV3: dormant until player enters room

  // Line-of-sight awareness — enemy must see the player to engage
  const canSeePlayer = hasLineOfSight(dungeon, enemy.position, playerPos);
  if (canSeePlayer) {
    enemy.aware = true;
    enemy.alertTimer = 3; // stay aware for 3s after losing sight
  } else if (enemy.aware) {
    enemy.alertTimer -= dt;
    if (enemy.alertTimer <= 0) {
      enemy.aware = false;
    }
  }

  // If not aware, don't chase or attack
  if (!enemy.aware) return null;

  // Update stun
  if (enemy.stunTimer > 0) {
    enemy.stunTimer -= dt;
    return null;
  }

  // Apply knockback
  if (vec2Len(enemy.knockbackVel) > 5) {
    enemy.position.x += enemy.knockbackVel.x * dt;
    enemy.position.y += enemy.knockbackVel.y * dt;
    enemy.knockbackVel.x *= 0.9;
    enemy.knockbackVel.y *= 0.9;

    // Clamp to walkable tiles
    const tile = worldToTile(enemy.position.x, enemy.position.y);
    if (!isTileWalkable(dungeon, tile.x, tile.y)) {
      enemy.knockbackVel = { x: 0, y: 0 };
    }
    return null;
  }

  const toPlayer = vec2Sub(playerPos, enemy.position);
  const dist = vec2Len(toPlayer);
  const dir = vec2Normalize(toPlayer);

  // Update attack timer
  enemy.attackTimer -= dt;
  enemy.shootTimer -= dt;

  let projectile: EnemyProjectile | null = null;

  switch (enemy.def.behavior) {
    case 'melee': {
      // Move toward player
      if (dist > enemy.def.attackRange) {
        moveEnemy(enemy, dir, dungeon, dt, enemies);
      }
      break;
    }
    case 'ranged': {
      // Keep distance, shoot at player
      if (dist < 100) {
        // Too close, back away
        moveEnemy(enemy, vec2Scale(dir, -1), dungeon, dt, enemies);
      } else if (dist > enemy.def.attackRange) {
        moveEnemy(enemy, dir, dungeon, dt, enemies);
      }
      // Shoot
      if (enemy.shootTimer <= 0 && dist < enemy.def.attackRange) {
        projectile = {
          id: generateId(),
          position: { ...enemy.position },
          velocity: vec2Scale(dir, 250),
          damage: enemy.def.damage,
          radius: 5,
          lifetime: 2,
          color: '#ff4444',
        };
        enemy.shootTimer = enemy.def.attackCooldown;
      }
      break;
    }
    case 'charger': {
      // Charge at player when in range
      if (dist < 200 && dist > enemy.def.attackRange) {
        moveEnemy(enemy, dir, dungeon, dt, enemies, 1.8);
      } else if (dist > 200) {
        moveEnemy(enemy, dir, dungeon, dt, enemies);
      }
      break;
    }
    case 'boss': {
      // Boss alternates between approach and ranged attacks
      if (dist > 150) {
        moveEnemy(enemy, dir, dungeon, dt, enemies);
      }
      if (enemy.shootTimer <= 0) {
        // Boss shoots multiple projectiles
        const angleOffset = (Math.random() - 0.5) * 0.5;
        const projDir = {
          x: dir.x * Math.cos(angleOffset) - dir.y * Math.sin(angleOffset),
          y: dir.x * Math.sin(angleOffset) + dir.y * Math.cos(angleOffset),
        };
        projectile = {
          id: generateId(),
          position: { ...enemy.position },
          velocity: vec2Scale(projDir, 200),
          damage: enemy.def.damage,
          radius: 8,
          lifetime: 3,
          color: enemy.def.color,
        };
        enemy.shootTimer = enemy.def.attackCooldown;
      }
      break;
    }
  }

  return projectile;
}

function moveEnemy(
  enemy: Enemy,
  dir: Vec2,
  dungeon: DungeonMap,
  dt: number,
  enemies: Enemy[],
  speedMult: number = 1
): void {
  const speed = enemy.def.speed * speedMult;
  const halfSize = enemy.def.size / 2;

  // Try direct movement first
  const newX = enemy.position.x + dir.x * speed * dt;
  const newY = enemy.position.y + dir.y * speed * dt;

  const canMoveX = isTileWalkable(dungeon,
    worldToTile(newX + (dir.x > 0 ? halfSize : -halfSize), enemy.position.y).x,
    worldToTile(newX + (dir.x > 0 ? halfSize : -halfSize), enemy.position.y).y
  );
  const canMoveY = isTileWalkable(dungeon,
    worldToTile(enemy.position.x, newY + (dir.y > 0 ? halfSize : -halfSize)).x,
    worldToTile(enemy.position.x, newY + (dir.y > 0 ? halfSize : -halfSize)).y
  );

  if (canMoveX) enemy.position.x = newX;
  if (canMoveY) enemy.position.y = newY;

  // Wall-sliding: if blocked in both directions, try perpendicular movement
  if (!canMoveX && !canMoveY) {
    // Try sliding along walls — pick the perpendicular direction
    const slideX = enemy.position.x + (dir.y > 0 ? 1 : -1) * speed * dt * 0.5;
    const slideY = enemy.position.y + (dir.x > 0 ? 1 : -1) * speed * dt * 0.5;
    const canSlideX = isTileWalkable(dungeon,
      worldToTile(slideX + halfSize, enemy.position.y).x,
      worldToTile(slideX + halfSize, enemy.position.y).y
    ) && isTileWalkable(dungeon,
      worldToTile(slideX - halfSize, enemy.position.y).x,
      worldToTile(slideX - halfSize, enemy.position.y).y
    );
    const canSlideY = isTileWalkable(dungeon,
      worldToTile(enemy.position.x, slideY + halfSize).x,
      worldToTile(enemy.position.x, slideY + halfSize).y
    ) && isTileWalkable(dungeon,
      worldToTile(enemy.position.x, slideY - halfSize).x,
      worldToTile(enemy.position.x, slideY - halfSize).y
    );
    if (canSlideX) enemy.position.x = slideX;
    else if (canSlideY) enemy.position.y = slideY;
  }

  // Simple separation from other enemies
  for (const other of enemies) {
    if (other.id === enemy.id || !other.active) continue;
    const diff = vec2Sub(enemy.position, other.position);
    const d = vec2Len(diff);
    const minDist = (enemy.def.size + other.def.size) / 2;
    if (d < minDist && d > 0) {
      const push = vec2Scale(vec2Normalize(diff), (minDist - d) * 0.5);
      enemy.position.x += push.x;
      enemy.position.y += push.y;
    }
  }
}

export function damageEnemy(enemy: Enemy, damage: number, knockbackDir?: Vec2): boolean {
  if (enemy.dormant) return false; // CSV3: can't damage dormant bosses
  enemy.hp -= damage;
  if (knockbackDir) {
    enemy.knockbackVel = vec2Scale(knockbackDir, 200);
  }
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.active = false;
    return true; // killed
  }
  return false;
}
