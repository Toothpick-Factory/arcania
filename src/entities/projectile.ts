import { Vec2 } from '../engine/types';
import { generateId, vec2Len, vec2Sub } from '../utils/math';
import { SpellDef } from '../data/spells';

export interface Projectile {
  id: string;
  position: Vec2;
  velocity: Vec2;
  damage: number;
  radius: number;
  lifetime: number;
  color: string;
  secondaryColor: string;
  aoeRadius: number;
  spellId: string;
  piercing: boolean;
  hitEnemies: Set<string>;
}

export function createProjectile(
  spell: SpellDef,
  origin: Vec2,
  direction: Vec2,
  damageBonus: number,
  spellLevel: number
): Projectile {
  const levelMult = 1 + (spellLevel - 1) * 0.15;
  const speed = spell.projectileSpeed;

  return {
    id: generateId(),
    position: { ...origin },
    velocity: { x: direction.x * speed, y: direction.y * speed },
    damage: Math.round((spell.baseDamage + damageBonus) * levelMult),
    radius: spell.aoeRadius > 0 ? 8 : 6,
    lifetime: spell.range / speed,
    color: spell.color,
    secondaryColor: spell.secondaryColor,
    aoeRadius: spell.aoeRadius,
    spellId: spell.id,
    piercing: spell.id === 'ice', // Ice shard pierces
    hitEnemies: new Set(),
  };
}

export function updateProjectile(proj: Projectile, dt: number): boolean {
  proj.position.x += proj.velocity.x * dt;
  proj.position.y += proj.velocity.y * dt;
  proj.lifetime -= dt;
  return proj.lifetime <= 0;
}

export interface AoeEffect {
  id: string;
  position: Vec2;
  radius: number;
  damage: number;
  duration: number;
  elapsed: number;
  color: string;
  spellId: string;
  tickInterval: number;
  tickTimer: number;
  hitEnemies: Set<string>;
}

export function createAoeEffect(
  spell: SpellDef,
  position: Vec2,
  damageBonus: number,
  spellLevel: number
): AoeEffect {
  const levelMult = 1 + (spellLevel - 1) * 0.15;
  return {
    id: generateId(),
    position: { ...position },
    radius: spell.aoeRadius,
    damage: Math.round((spell.baseDamage + damageBonus) * levelMult * 0.3),
    duration: 2,
    elapsed: 0,
    color: spell.color,
    spellId: spell.id,
    tickInterval: 0.5,
    tickTimer: 0,
    hitEnemies: new Set(),
  };
}

export function updateAoeEffect(aoe: AoeEffect, dt: number): boolean {
  aoe.elapsed += dt;
  aoe.tickTimer += dt;
  if (aoe.tickTimer >= aoe.tickInterval) {
    aoe.tickTimer = 0;
    aoe.hitEnemies.clear(); // Allow re-hitting each tick
  }
  return aoe.elapsed >= aoe.duration;
}
