import { Renderer } from '../engine/renderer';
import { Player, getActiveSpell } from '../entities/player';
import { GameState, CANVAS_WIDTH, CANVAS_HEIGHT } from '../engine/types';
import { DungeonMap } from '../systems/dungeon';
import {
  MagicType, MAGIC_TYPE_COLORS, MAGIC_TYPE_NAMES, COMBO_SPELLS,
  getSpellById, getActiveSpellForMagic, xpToNextTier, TIER_NAMES,
  getHighestUnlockedTier,
} from '../data/spells';
import { getItemDef } from '../data/items';

export function renderHUD(renderer: Renderer, player: Player, state: GameState): void {
  // Health bar
  renderer.drawBar(10, 10, 200, 20, player.hp / player.maxHp, '#cc2222', '#441111');
  renderer.drawText(`HP: ${player.hp}/${player.maxHp}`, 15, 12, '#ffffff', 14);

  // Shield bar (on top of health)
  if (player.shield > 0) {
    renderer.drawBar(10, 10, 200, 20, player.shield / (player.shield + player.maxHp), '#4488cc', '#224466');
    renderer.drawText(`Shield: ${player.shield}`, 15, 12, '#88ccff', 14);
  }

  // XP bar
  renderer.drawBar(10, 35, 200, 10, player.xp / player.xpToNext, '#22aa22', '#114411');

  // Combo queue display
  if (player.comboQueue.length > 0) {
    renderComboQueue(renderer, player);
  }

  // Level
  renderer.drawText(`Lv.${player.level}`, 215, 10, '#ffcc00', 16);

  // Gold
  renderer.drawText(`Gold: ${player.gold}`, 215, 30, '#ffdd44', 14);

  // Floor
  renderer.drawText(`Floor ${state.floor}`, CANVAS_WIDTH - 100, 10, '#aaaaaa', 14);

  // Magic spell bar
  renderMagicBar(renderer, player);

  // Active buffs
  renderBuffs(renderer, player);

  // Inventory count
  const totalItems = player.inventory.reduce((s, i) => s + i.count, 0);
  renderer.drawText(`Items: ${totalItems}`, CANVAS_WIDTH - 100, 30, '#aaaaaa', 12);

  // Magic types unlocked
  renderer.drawText(`Magic: ${player.magics.length}`, CANVAS_WIDTH - 100, 46, '#aaaaaa', 12);
}

function renderMagicBar(renderer: Renderer, player: Player): void {
  const barY = CANVAS_HEIGHT - 58;
  const slotSize = 36;
  const gap = 4;
  const totalWidth = player.magics.length * (slotSize + gap) - gap;
  const barX = CANVAS_WIDTH / 2 - totalWidth / 2;

  for (let i = 0; i < player.magics.length; i++) {
    const magic = player.magics[i];
    const mt = magic.magicType;
    const isCombo = COMBO_SPELLS.some((c) => c.id === mt);

    // Get the spell definition for display
    let spellDef;
    let color: string;
    let name: string;
    if (isCombo) {
      spellDef = getSpellById(mt);
      color = spellDef?.color || '#888888';
      name = spellDef?.name || mt;
    } else {
      spellDef = getActiveSpellForMagic(mt as MagicType, magic.xp);
      color = MAGIC_TYPE_COLORS[mt as MagicType] || '#888888';
      name = spellDef?.name || MAGIC_TYPE_NAMES[mt as MagicType] || mt;
    }

    const x = barX + i * (slotSize + gap);
    const isActive = i === player.activeMagicIndex;
    const onCooldown = spellDef ? player.spellCooldowns.has(spellDef.id) : false;

    // Background
    renderer.drawRect(x, barY, slotSize, slotSize, isActive ? '#333344' : '#1a1a22');
    renderer.drawRectOutline(x, barY, slotSize, slotSize, isActive ? '#ffffff' : (isCombo ? '#666699' : '#444444'), isActive ? 2 : 1);

    // Color fill
    renderer.drawRect(x + 3, barY + 3, slotSize - 6, slotSize - 6, onCooldown ? '#333333' : color);

    // Combo secondary color stripe
    if (isCombo && !onCooldown && spellDef) {
      renderer.ctx.globalAlpha = 0.4;
      renderer.drawRect(x + 3, barY + slotSize - 10, slotSize - 6, 7, spellDef.secondaryColor);
      renderer.ctx.globalAlpha = 1;
    }

    // Tier indicator for base magic
    if (!isCombo) {
      const tier = getHighestUnlockedTier(magic.xp);
      renderer.drawText(`T${tier}`, x + 2, barY + 2, '#ffffff', 9);

      // XP progress to next tier
      const tierInfo = xpToNextTier(magic.xp);
      if (tierInfo.nextTier) {
        renderer.drawBar(x + 3, barY + slotSize - 5, slotSize - 6, 3, tierInfo.progress, '#44ff44', '#114411');
      }
    }

    // Cooldown overlay
    if (onCooldown) {
      renderer.ctx.globalAlpha = 0.5;
      renderer.drawRect(x + 3, barY + 3, slotSize - 6, slotSize - 6, '#000000');
      renderer.ctx.globalAlpha = 1;
    }

    // Hotkey number
    if (i < 9) {
      renderer.drawText(`${i + 1}`, x + slotSize - 10, barY + slotSize - 12, '#888888', 9);
    }

    // Active spell name below bar
    if (isActive) {
      renderer.drawText(name, x + slotSize / 2, barY + slotSize + 2, '#ffffff', 9, 'center');
    }

    // Highlight if this magic type is in the combo queue
    const queueIdx = player.comboQueue.indexOf(magic.magicType);
    if (queueIdx >= 0) {
      renderer.drawRectOutline(x - 2, barY - 2, slotSize + 4, slotSize + 4, '#ffff00', 2);
      renderer.drawText(`#${queueIdx + 1}`, x + slotSize / 2, barY - 8, '#ffff00', 9, 'center');
    }
  }
}

function renderComboQueue(renderer: Renderer, player: Player): void {
  const queueX = CANVAS_WIDTH / 2;
  const queueY = 55;

  // Background
  const totalW = player.comboQueue.length * 32 + (player.comboQueue.length - 1) * 8 + 20;
  renderer.ctx.globalAlpha = 0.8;
  renderer.drawRect(queueX - totalW / 2, queueY - 4, totalW, 32, '#111122');
  renderer.drawRectOutline(queueX - totalW / 2, queueY - 4, totalW, 32, '#ffff44');
  renderer.ctx.globalAlpha = 1;

  renderer.drawText('COMBO:', queueX - totalW / 2 - 50, queueY + 2, '#ffff44', 12);

  for (let i = 0; i < player.comboQueue.length; i++) {
    const mt = player.comboQueue[i];
    const color = MAGIC_TYPE_COLORS[mt as MagicType] || '#888888';
    const name = MAGIC_TYPE_NAMES[mt as MagicType] || mt;
    const x = queueX - totalW / 2 + 10 + i * 40;

    renderer.drawRect(x, queueY, 24, 24, color);
    renderer.drawRectOutline(x, queueY, 24, 24, '#ffffff');
    renderer.drawText(name.substring(0, 3), x + 12, queueY + 6, '#ffffff', 9, 'center');

    if (i < player.comboQueue.length - 1) {
      renderer.drawText('+', x + 30, queueY + 4, '#ffff44', 14);
    }
  }

  if (player.comboQueue.length === 1) {
    renderer.drawText('Press another number or click to cast', queueX, queueY + 30, '#888888', 10, 'center');
  } else if (player.comboQueue.length >= 2) {
    renderer.drawText('Click to cast combo!', queueX, queueY + 30, '#ffff44', 10, 'center');
  }
}

function renderBuffs(renderer: Renderer, player: Player): void {
  const startX = 10;
  const startY = 75;
  for (let i = 0; i < player.activeBuffs.length; i++) {
    const buff = player.activeBuffs[i];
    const def = getItemDef(buff.source);
    const name = def?.name || buff.source;
    const timeLeft = Math.ceil(buff.remainingTime);
    renderer.drawText(`${name} (${timeLeft}s)`, startX, startY + i * 16, '#44ff44', 11);
  }
}

export function renderMinimap(renderer: Renderer, dungeon: DungeonMap, playerTileX: number, playerTileY: number): void {
  const mapSize = 120;
  const mapX = CANVAS_WIDTH - mapSize - 10;
  const mapY = CANVAS_HEIGHT - mapSize - 10;
  const scale = mapSize / Math.max(dungeon.width, dungeon.height);

  renderer.ctx.globalAlpha = 0.7;
  renderer.drawRect(mapX - 2, mapY - 2, mapSize + 4, mapSize + 4, '#111111');
  renderer.ctx.globalAlpha = 1;

  for (let y = 0; y < dungeon.height; y++) {
    for (let x = 0; x < dungeon.width; x++) {
      const tile = dungeon.tiles[y][x];
      if (!tile.explored) continue;

      const px = mapX + x * scale;
      const py = mapY + y * scale;

      let color = '#000000';
      if (tile.type === 'floor') color = tile.visible ? '#334433' : '#222222';
      else if (tile.type === 'wall') color = tile.visible ? '#666655' : '#333322';
      else if (tile.type === 'stairs') color = '#ffff00';
      else if (tile.type === 'shop') color = '#4488ff';
      else if (tile.type === 'cooking_station') color = '#ff8844';

      if (color !== '#000000') {
        renderer.drawRect(px, py, Math.max(scale, 1), Math.max(scale, 1), color);
      }
    }
  }

  renderer.drawRect(mapX + playerTileX * scale - 1, mapY + playerTileY * scale - 1, 3, 3, '#44ff44');
}
