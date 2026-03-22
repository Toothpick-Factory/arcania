import { Vec2, TILE_SIZE } from '../engine/types';
import { InputManager } from '../engine/input';
import { DungeonMap, isTileWalkable, worldToTile } from '../systems/dungeon';
import { FoodEffect } from '../data/items';
import {
  MagicType, SpellTier, STARTING_MAGIC_TYPES,
  getHighestUnlockedTier, getActiveSpellForMagic, getSpellById, SpellDef,
} from '../data/spells';

export interface PlayerMagic {
  magicType: MagicType;
  xp: number;
  selectedTier?: SpellTier; // player can choose to cast a lower tier
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
  speed: number;
  baseDamage: number;
  defense: number;
  shield: number;
  shieldTimer: number;
  // Progression
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  // Magic
  magics: PlayerMagic[];
  activeMagicIndex: number;  // last selected base magic (for solo cast)
  comboQueue: MagicType[];   // queued magic types for combo casting
  spellCooldowns: Map<string, number>;
  discoveredCombos: string[];
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
    speed: 150,
    baseDamage: 10,
    defense: 0,
    shield: 0,
    shieldTimer: 0,
    level: 1,
    xp: 0,
    xpToNext: 50,
    gold: 0,
    magics: STARTING_MAGIC_TYPES.map((mt) => ({ magicType: mt, xp: 0 })),
    activeMagicIndex: 0,
    comboQueue: [],
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

  // Update cooldowns
  for (const [key, val] of player.spellCooldowns.entries()) {
    const newVal = val - dt;
    if (newVal <= 0) {
      player.spellCooldowns.delete(key);
    } else {
      player.spellCooldowns.set(key, newVal);
    }
  }

  // Update shield
  if (player.shieldTimer > 0) {
    player.shieldTimer -= dt;
    if (player.shieldTimer <= 0) {
      player.shield = 0;
      player.shieldTimer = 0;
    }
  }

  // Update buffs
  for (let i = player.activeBuffs.length - 1; i >= 0; i--) {
    player.activeBuffs[i].remainingTime -= dt;
    if (player.activeBuffs[i].remainingTime <= 0) {
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

  // Number keys queue magic types for combo casting
  for (let i = 0; i < 9; i++) {
    if (input.isKeyJustPressed(`Digit${i + 1}`) && i < player.magics.length) {
      const mt = player.magics[i].magicType;
      // Add to combo queue (max 2 elements for now)
      if (player.comboQueue.length < 2) {
        player.comboQueue.push(mt);
      }
      // Always update the active magic index to the last pressed
      player.activeMagicIndex = i;
    }
  }

  // Q clears the combo queue
  if (input.isKeyJustPressed('KeyQ')) {
    player.comboQueue = [];
  }
}

export function getActiveSpell(player: Player): SpellDef | undefined {
  const magic = player.magics[player.activeMagicIndex];
  if (!magic) return undefined;

  // Check if this is a combo spell (discoveredCombos stores combo spell ids as "magic type")
  const comboSpell = getSpellById(magic.magicType);
  if (comboSpell) return comboSpell;

  return getActiveSpellForMagic(magic.magicType, magic.xp, magic.selectedTier);
}

export function damagePlayer(player: Player, damage: number): void {
  if (player.invincibleTimer > 0) return;
  let actualDamage = Math.max(1, damage - player.defense);

  // Shield absorbs damage first
  if (player.shield > 0) {
    if (player.shield >= actualDamage) {
      player.shield -= actualDamage;
      actualDamage = 0;
    } else {
      actualDamage -= player.shield;
      player.shield = 0;
      player.shieldTimer = 0;
    }
  }

  player.hp -= actualDamage;
  player.invincibleTimer = 0.5;
  if (player.hp < 0) player.hp = 0;
}

export function healPlayer(player: Player, amount: number): void {
  player.hp = Math.min(player.maxHp, player.hp + amount);
}

export function addShield(player: Player, amount: number, duration: number): void {
  player.shield = Math.max(player.shield, amount);
  player.shieldTimer = Math.max(player.shieldTimer, duration);
}

export function addXp(player: Player, amount: number): boolean {
  player.xp += amount;
  if (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level++;
    player.xpToNext = Math.floor(player.xpToNext * 1.4);
    player.maxHp += 10;
    player.hp = player.maxHp;
    player.baseDamage += 2;
    return true;
  }
  return false;
}

export function addMagicXp(player: Player, magicType: MagicType | string, amount: number): { leveled: boolean; newTier?: number } {
  const magic = player.magics.find((m) => m.magicType === magicType);
  if (!magic) return { leveled: false };
  const oldTier = getHighestUnlockedTier(magic.xp);
  magic.xp += amount;
  const newTier = getHighestUnlockedTier(magic.xp);
  if (newTier > oldTier) {
    return { leveled: true, newTier };
  }
  return { leveled: false };
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

export function hasMagic(player: Player, magicType: MagicType | string): boolean {
  return player.magics.some((m) => m.magicType === magicType);
}

export function unlockMagic(player: Player, magicType: MagicType): void {
  if (!hasMagic(player, magicType)) {
    player.magics.push({ magicType, xp: 0 });
  }
}
