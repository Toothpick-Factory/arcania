import { Vec2, TILE_SIZE } from '../engine/types';
import { InputManager } from '../engine/input';
import { DungeonMap, isTileWalkable, worldToTile } from '../systems/dungeon';
import { FoodEffect } from '../data/items';
import { SpellElement } from '../data/spells';

export interface PlayerSpell {
  element: SpellElement;
  level: number;
  xp: number;
  xpToNext: number;
}

export interface InventoryItem {
  itemId: string;
  count: number;
}

export interface ActiveBuff {
  source: string;
  effect: FoodEffect;
  remainingTime: number;
}

export interface Player {
  position: Vec2;
  velocity: Vec2;
  width: number;
  height: number;
  // Stats
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
  speed: number;
  baseDamage: number;
  defense: number;
  // Progression
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  // Spells
  spells: PlayerSpell[];
  activeSpellIndex: number;
  comboSlot: SpellElement | null;
  comboSlotIndex: number | null;
  spellCooldowns: Map<string, number>;
  discoveredCombos: string[]; // combo spell ids that have been unlocked
  // Inventory
  inventory: InventoryItem[];
  // Buffs
  activeBuffs: ActiveBuff[];
  // Meta
  totalRuns: number;
  bestFloor: number;
  // Combat
  invincibleTimer: number;
  facing: Vec2;
}

export function createPlayer(): Player {
  return {
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    width: 20,
    height: 20,
    hp: 100,
    maxHp: 100,
    mana: 80,
    maxMana: 80,
    manaRegen: 2,
    speed: 150,
    baseDamage: 10,
    defense: 0,
    level: 1,
    xp: 0,
    xpToNext: 50,
    gold: 0,
    spells: [
      { element: 'fire', level: 1, xp: 0, xpToNext: 30 },
      { element: 'water', level: 1, xp: 0, xpToNext: 30 },
    ],
    activeSpellIndex: 0,
    comboSlot: null,
    comboSlotIndex: null,
    spellCooldowns: new Map(),
    discoveredCombos: [],
    inventory: [],
    activeBuffs: [],
    totalRuns: 0,
    bestFloor: 0,
    invincibleTimer: 0,
    facing: { x: 1, y: 0 },
  };
}

export function updatePlayer(player: Player, input: InputManager, dungeon: DungeonMap, dt: number): void {
  // Movement
  const move = input.getMovementVector();
  const buffSpeed = getBuffTotal(player, 'speedBonus');
  const totalSpeed = player.speed + buffSpeed;

  const newX = player.position.x + move.x * totalSpeed * dt;
  const newY = player.position.y + move.y * totalSpeed * dt;

  // Collision check with tiles
  const halfW = player.width / 2;
  const halfH = player.height / 2;

  // Check X movement
  const tileX1 = worldToTile(newX - halfW, player.position.y - halfH);
  const tileX2 = worldToTile(newX + halfW, player.position.y + halfH);
  let canMoveX = true;
  for (let ty = tileX1.y; ty <= tileX2.y; ty++) {
    for (let tx = tileX1.x; tx <= tileX2.x; tx++) {
      if (!isTileWalkable(dungeon, tx, ty)) canMoveX = false;
    }
  }
  if (canMoveX) player.position.x = newX;

  // Check Y movement
  const tileY1 = worldToTile(player.position.x - halfW, newY - halfH);
  const tileY2 = worldToTile(player.position.x + halfW, newY + halfH);
  let canMoveY = true;
  for (let ty = tileY1.y; ty <= tileY2.y; ty++) {
    for (let tx = tileY1.x; tx <= tileY2.x; tx++) {
      if (!isTileWalkable(dungeon, tx, ty)) canMoveY = false;
    }
  }
  if (canMoveY) player.position.y = newY;

  // Update facing direction
  if (move.x !== 0 || move.y !== 0) {
    player.facing = { x: move.x, y: move.y };
  }

  // Mana regeneration
  const buffManaRegen = getBuffTotal(player, 'manaRegenBonus');
  player.mana = Math.min(player.maxMana, player.mana + (player.manaRegen + buffManaRegen) * dt);

  // Update cooldowns
  for (const [key, val] of player.spellCooldowns.entries()) {
    const newVal = val - dt;
    if (newVal <= 0) {
      player.spellCooldowns.delete(key);
    } else {
      player.spellCooldowns.set(key, newVal);
    }
  }

  // Update buffs
  for (let i = player.activeBuffs.length - 1; i >= 0; i--) {
    player.activeBuffs[i].remainingTime -= dt;
    if (player.activeBuffs[i].remainingTime <= 0) {
      // Remove max hp bonus when buff expires
      if (player.activeBuffs[i].effect.maxHpBonus) {
        player.maxHp -= player.activeBuffs[i].effect.maxHpBonus!;
        player.hp = Math.min(player.hp, player.maxHp);
      }
      player.activeBuffs.splice(i, 1);
    }
  }

  // Update invincibility
  if (player.invincibleTimer > 0) {
    player.invincibleTimer -= dt;
  }

  // Spell cycling with Q/E
  if (input.isKeyJustPressed('KeyQ') && player.spells.length > 0) {
    player.activeSpellIndex = (player.activeSpellIndex - 1 + player.spells.length) % player.spells.length;
    player.comboSlot = null;
  }
  if (input.isKeyJustPressed('KeyE') && player.spells.length > 0) {
    player.activeSpellIndex = (player.activeSpellIndex + 1) % player.spells.length;
    player.comboSlot = null;
  }

  // Number keys for spell selection (only when Shift is NOT held — Shift+Number is for combos)
  if (!input.isKeyDown('ShiftLeft') && !input.isKeyDown('ShiftRight')) {
    for (let i = 0; i < 6; i++) {
      if (input.isKeyJustPressed(`Digit${i + 1}`) && i < player.spells.length) {
        player.activeSpellIndex = i;
        player.comboSlot = null;
      }
    }
  }
}

export function damagePlayer(player: Player, damage: number): void {
  if (player.invincibleTimer > 0) return;
  const actualDamage = Math.max(1, damage - player.defense);
  player.hp -= actualDamage;
  player.invincibleTimer = 0.5;
  if (player.hp < 0) player.hp = 0;
}

export function healPlayer(player: Player, amount: number): void {
  player.hp = Math.min(player.maxHp, player.hp + amount);
}

export function addXp(player: Player, amount: number): boolean {
  player.xp += amount;
  if (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level++;
    player.xpToNext = Math.floor(player.xpToNext * 1.4);
    player.maxHp += 10;
    player.hp = player.maxHp;
    player.maxMana += 5;
    player.mana = player.maxMana;
    player.baseDamage += 2;
    return true; // leveled up
  }
  return false;
}

export function addSpellXp(player: Player, element: SpellElement, amount: number): boolean {
  const spell = player.spells.find((s) => s.element === element);
  if (!spell) return false;
  spell.xp += amount;
  if (spell.xp >= spell.xpToNext) {
    spell.xp -= spell.xpToNext;
    spell.level++;
    spell.xpToNext = Math.floor(spell.xpToNext * 1.5);
    return true;
  }
  return false;
}

export function addItemToInventory(player: Player, itemId: string, count: number = 1): boolean {
  const existing = player.inventory.find((i) => i.itemId === itemId);
  if (existing) {
    existing.count += count;
    return true;
  }
  player.inventory.push({ itemId, count });
  return true;
}

export function removeItemFromInventory(player: Player, itemId: string, count: number = 1): boolean {
  const existing = player.inventory.find((i) => i.itemId === itemId);
  if (!existing || existing.count < count) return false;
  existing.count -= count;
  if (existing.count <= 0) {
    player.inventory = player.inventory.filter((i) => i.itemId !== itemId);
  }
  return true;
}

export function getItemCount(player: Player, itemId: string): number {
  const item = player.inventory.find((i) => i.itemId === itemId);
  return item ? item.count : 0;
}

export function applyFoodEffect(player: Player, foodId: string, effect: FoodEffect): void {
  if (effect.healAmount) {
    healPlayer(player, effect.healAmount);
  }
  if (effect.maxHpBonus) {
    player.maxHp += effect.maxHpBonus;
    player.hp += effect.maxHpBonus;
  }
  if (effect.duration && effect.duration > 0) {
    player.activeBuffs.push({
      source: foodId,
      effect,
      remainingTime: effect.duration,
    });
  }
}

function getBuffTotal(player: Player, stat: keyof FoodEffect): number {
  let total = 0;
  for (const buff of player.activeBuffs) {
    const val = buff.effect[stat];
    if (typeof val === 'number') total += val;
  }
  return total;
}

export function getPlayerDamageBonus(player: Player): number {
  return getBuffTotal(player, 'damageBonus');
}

export function hasSpell(player: Player, element: SpellElement): boolean {
  return player.spells.some((s) => s.element === element);
}

export function unlockSpell(player: Player, element: SpellElement): void {
  if (!hasSpell(player, element)) {
    player.spells.push({ element, level: 1, xp: 0, xpToNext: 30 });
  }
}
