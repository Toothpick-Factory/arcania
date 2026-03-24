import { Vec2, TILE_SIZE } from '../engine/types';
import { InputManager } from '../engine/input';
import { DungeonMap, isTileWalkable, worldToTile } from '../systems/dungeon';
import { FoodEffect, HotbarSlot, QueueEntry, HOTBAR_SIZE } from '../data/items';
import {
  MagicType, SpellTier, STARTING_MAGIC_TYPES,
  getHighestUnlockedTier, getActiveSpellForMagic, getSpellById, SpellDef, COMBO_SPELLS,
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
  // Magic & Hotbar
  magics: PlayerMagic[];
  hotbar: HotbarSlot[];       // 5 slots holding spells or items
  activeHotbarIndex: number;  // last pressed hotbar slot
  comboQueue: QueueEntry[];   // queued entries for combo casting (max 3)
  spellCooldowns: Map<string, number>;
  discoveredCombos: string[];
  discoveredComboRecipes: string[];
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
  // Dodge
  dodgeCooldown: number;
  dodgeTimer: number;      // time remaining in dodge roll (0 = not dodging)
  dodgeDir: Vec2;
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
    hotbar: [
      { kind: 'spell', ref: 'fire' },
      { kind: 'spell', ref: 'light' },
      { kind: 'empty' },
      { kind: 'empty' },
      { kind: 'empty' },
    ],
    activeHotbarIndex: 0,
    comboQueue: [],
    spellCooldowns: new Map(),
    discoveredCombos: [],
    discoveredComboRecipes: [],
    inventory: [],
    activeBuffs: [],
    totalRuns: 0,
    bestFloor: 0,
    invincibleTimer: 0,
    facing: { x: 1, y: 0 },
    dodgeCooldown: 0,
    dodgeTimer: 0,
    dodgeDir: { x: 0, y: 0 },
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

  // Dodge roll
  const DODGE_DURATION = 0.2;  // seconds of dash
  const DODGE_SPEED = 450;     // pixels/sec during dodge
  const DODGE_COOLDOWN = 1.5;
  const DODGE_IFRAMES = 0.25;  // slightly longer than the dash

  if (player.dodgeTimer > 0) {
    // Currently dodging — move in dodge direction at high speed
    player.dodgeTimer -= dt;
    const dodgeX = player.position.x + player.dodgeDir.x * DODGE_SPEED * dt;
    const dodgeY = player.position.y + player.dodgeDir.y * DODGE_SPEED * dt;
    const dtX = worldToTile(dodgeX + (player.dodgeDir.x > 0 ? halfW : -halfW), player.position.y);
    if (isTileWalkable(dungeon, dtX.x, dtX.y)) player.position.x = dodgeX;
    const dtY = worldToTile(player.position.x, dodgeY + (player.dodgeDir.y > 0 ? halfH : -halfH));
    if (isTileWalkable(dungeon, dtY.x, dtY.y)) player.position.y = dodgeY;
  } else if (input.isKeyJustPressed('Space') && player.dodgeCooldown <= 0) {
    // Start dodge — use movement direction or facing
    const dodgeDir = (move.x !== 0 || move.y !== 0)
      ? { x: move.x, y: move.y }
      : { ...player.facing };
    const len = Math.sqrt(dodgeDir.x * dodgeDir.x + dodgeDir.y * dodgeDir.y);
    if (len > 0) {
      player.dodgeDir = { x: dodgeDir.x / len, y: dodgeDir.y / len };
      player.dodgeTimer = DODGE_DURATION;
      player.dodgeCooldown = DODGE_COOLDOWN;
      player.invincibleTimer = Math.max(player.invincibleTimer, DODGE_IFRAMES);
    }
  }

  if (player.dodgeCooldown > 0) {
    player.dodgeCooldown -= dt;
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

  // Number keys 1-5 queue hotbar slot contents into combo queue
  for (let i = 0; i < HOTBAR_SIZE; i++) {
    if (input.isKeyJustPressed(`Digit${i + 1}`)) {
      const slot = player.hotbar[i];
      if (slot.kind !== 'empty' && slot.ref) {
        if (player.comboQueue.length < 3) {
          player.comboQueue.push({ kind: slot.kind as 'spell' | 'item', ref: slot.ref });
        }
      }
      player.activeHotbarIndex = i;
    }
  }

  // Q clears the combo queue
  if (input.isKeyJustPressed('KeyQ')) {
    player.comboQueue = [];
  }
}

export function getActiveSpell(player: Player): SpellDef | undefined {
  const slot = player.hotbar[player.activeHotbarIndex];
  if (!slot || slot.kind !== 'spell' || !slot.ref) return undefined;

  // Check if it's a discovered combo spell
  const isCombo = COMBO_SPELLS.some((c) => c.id === slot.ref);
  if (isCombo) return getSpellById(slot.ref);

  // Base magic type — find XP from magics array
  const magic = player.magics.find((m) => m.magicType === slot.ref);
  if (!magic) return undefined;

  return getActiveSpellForMagic(magic.magicType as MagicType, magic.xp, magic.selectedTier);
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
