import { Renderer } from '../engine/renderer';
import { Player } from '../entities/player';
import { GameState, CANVAS_WIDTH, CANVAS_HEIGHT } from '../engine/types';
import { DungeonMap } from '../systems/dungeon';
import {
  MagicType, MAGIC_TYPE_COLORS, MAGIC_TYPE_NAMES, COMBO_SPELLS,
  getSpellById, getActiveSpellForMagic, xpToNextTier,
  getHighestUnlockedTier,
} from '../data/spells';
import { getItemDef, HotbarSlot, QueueEntry, HOTBAR_SIZE } from '../data/items';

export function renderHUD(renderer: Renderer, player: Player, state: GameState): void {
  // Health bar
  renderer.drawBar(10, 10, 200, 20, player.hp / player.maxHp, '#cc2222', '#441111');
  renderer.drawText(`HP: ${player.hp}/${player.maxHp}`, 15, 12, '#ffffff', 14);

  // Shield
  if (player.shield > 0) {
    renderer.drawBar(10, 10, 200, 20, player.shield / (player.shield + player.maxHp), '#4488cc', '#224466');
    renderer.drawText(`Shield: ${player.shield}`, 15, 12, '#88ccff', 14);
  }

  // XP bar
  renderer.drawBar(10, 35, 200, 10, player.xp / player.xpToNext, '#22aa22', '#114411');

  // Level
  renderer.drawText(`Lv.${player.level}`, 215, 10, '#ffcc00', 16);
  renderer.drawText(`Gold: ${player.gold}`, 215, 30, '#ffdd44', 14);

  // Dodge cooldown indicator
  if (player.dodgeCooldown > 0) {
    renderer.drawText(`Dodge: ${player.dodgeCooldown.toFixed(1)}s`, 10, CANVAS_HEIGHT - 14, '#888888', 10);
  } else {
    renderer.drawText('Dodge: Ready', 10, CANVAS_HEIGHT - 14, '#44ff44', 10);
  }

  // Floor info
  renderer.drawText(`Floor ${state.floor}`, CANVAS_WIDTH - 100, 10, '#aaaaaa', 14);
  const totalItems = player.inventory.reduce((s, i) => s + i.count, 0);
  renderer.drawText(`Items: ${totalItems}`, CANVAS_WIDTH - 100, 30, '#aaaaaa', 12);

  // Combo queue display
  if (player.comboQueue.length > 0) {
    renderComboQueue(renderer, player);
  }

  // Hotbar
  renderHotbar(renderer, player);

  // Active buffs
  renderBuffs(renderer, player);
}

function getSlotDisplay(slot: HotbarSlot | QueueEntry, player: Player): { color: string; name: string; count?: number } {
  if (slot.kind === 'spell') {
    const color = MAGIC_TYPE_COLORS[slot.ref as MagicType] || '#888888';
    const magic = player.magics.find((m) => m.magicType === slot.ref);
    let name = MAGIC_TYPE_NAMES[slot.ref as MagicType] || slot.ref || '?';
    // Check if it's a combo spell
    const comboSpell = COMBO_SPELLS.find((c) => c.id === slot.ref);
    if (comboSpell) {
      return { color: comboSpell.color, name: comboSpell.name };
    }
    if (magic) {
      const spellDef = getActiveSpellForMagic(slot.ref as MagicType, magic.xp);
      if (spellDef) name = spellDef.name;
    }
    return { color, name };
  } else if (slot.kind === 'item') {
    const def = getItemDef(slot.ref!);
    const count = player.inventory.find((i) => i.itemId === slot.ref)?.count || 0;
    return {
      color: def?.color || '#886644',
      name: def?.name || slot.ref || '?',
      count,
    };
  }
  return { color: '#333333', name: 'Empty' };
}

function renderHotbar(renderer: Renderer, player: Player): void {
  const barY = CANVAS_HEIGHT - 58;
  const slotSize = 44;
  const gap = 4;
  const totalWidth = HOTBAR_SIZE * (slotSize + gap) - gap;
  const barX = CANVAS_WIDTH / 2 - totalWidth / 2;

  for (let i = 0; i < HOTBAR_SIZE; i++) {
    const slot = player.hotbar[i];
    const x = barX + i * (slotSize + gap);
    const isActive = i === player.activeHotbarIndex;
    const display = getSlotDisplay(slot, player);

    // Background
    renderer.drawRect(x, barY, slotSize, slotSize, isActive ? '#333344' : '#1a1a22');

    if (slot.kind !== 'empty') {
      // Color fill
      const onCooldown = slot.kind === 'spell' && slot.ref ? !!player.spellCooldowns.has(
        (() => {
          const magic = player.magics.find((m) => m.magicType === slot.ref);
          if (magic) {
            const sd = getActiveSpellForMagic(slot.ref as MagicType, magic.xp);
            return sd?.id || '';
          }
          return slot.ref || '';
        })()
      ) : false;

      renderer.drawRect(x + 3, barY + 3, slotSize - 6, slotSize - 6, onCooldown ? '#333333' : display.color);

      // Cooldown overlay
      if (onCooldown) {
        renderer.ctx.globalAlpha = 0.5;
        renderer.drawRect(x + 3, barY + 3, slotSize - 6, slotSize - 6, '#000000');
        renderer.ctx.globalAlpha = 1;
      }

      // Item count
      if (slot.kind === 'item' && display.count !== undefined) {
        renderer.drawText(`${display.count}`, x + slotSize - 12, barY + slotSize - 14, display.count > 0 ? '#ffffff' : '#ff4444', 10);
        if (display.count <= 0) {
          renderer.ctx.globalAlpha = 0.5;
          renderer.drawRect(x + 3, barY + 3, slotSize - 6, slotSize - 6, '#000000');
          renderer.ctx.globalAlpha = 1;
        }
      }

      // Spell tier indicator
      if (slot.kind === 'spell' && slot.ref) {
        const magic = player.magics.find((m) => m.magicType === slot.ref);
        if (magic) {
          const tier = getHighestUnlockedTier(magic.xp);
          renderer.drawText(`T${tier}`, x + 2, barY + 2, '#ffffff', 9);
        }
      }

      // Border color: purple for spells, brown for items
      const borderColor = slot.kind === 'spell' ? '#8866aa' : '#886644';
      renderer.drawRectOutline(x, barY, slotSize, slotSize, isActive ? '#ffffff' : borderColor, isActive ? 2 : 1);
    } else {
      // Empty slot
      renderer.drawRectOutline(x, barY, slotSize, slotSize, '#333333', 1);
    }

    // Hotkey number
    renderer.drawText(`${i + 1}`, x + 2, barY + slotSize - 12, '#666666', 10);

    // Active name below
    if (isActive && slot.kind !== 'empty') {
      renderer.drawText(display.name, x + slotSize / 2, barY + slotSize + 2, '#ffffff', 9, 'center');
    }

    // Combo queue highlight
    const queueIdx = player.comboQueue.findIndex(
      (q) => q.kind === slot.kind && q.ref === slot.ref
    );
    if (queueIdx >= 0) {
      renderer.drawRectOutline(x - 2, barY - 2, slotSize + 4, slotSize + 4, '#ffff00', 2);
    }
  }
}

function renderComboQueue(renderer: Renderer, player: Player): void {
  const queueX = CANVAS_WIDTH / 2;
  const queueY = 55;

  const totalW = player.comboQueue.length * 36 + (player.comboQueue.length - 1) * 8 + 20;
  renderer.ctx.globalAlpha = 0.85;
  renderer.drawRect(queueX - totalW / 2, queueY - 4, totalW, 36, '#111122');
  renderer.drawRectOutline(queueX - totalW / 2, queueY - 4, totalW, 36, '#ffff44');
  renderer.ctx.globalAlpha = 1;

  renderer.drawText('COMBO:', queueX - totalW / 2 - 55, queueY + 6, '#ffff44', 12);

  for (let i = 0; i < player.comboQueue.length; i++) {
    const entry = player.comboQueue[i];
    const display = getSlotDisplay(entry, player);
    const x = queueX - totalW / 2 + 10 + i * 44;

    // Color box
    renderer.drawRect(x, queueY, 28, 28, display.color);
    renderer.drawRectOutline(x, queueY, 28, 28, entry.kind === 'spell' ? '#8866aa' : '#886644');

    // Abbreviated name
    const abbr = display.name.substring(0, 4);
    renderer.drawText(abbr, x + 14, queueY + 8, '#ffffff', 9, 'center');

    // Kind icon (S or I)
    renderer.drawText(entry.kind === 'spell' ? 'S' : 'I', x + 2, queueY + 2, '#aaaaaa', 7);

    if (i < player.comboQueue.length - 1) {
      renderer.drawText('+', x + 33, queueY + 6, '#ffff44', 14);
    }
  }

  const hint = player.comboQueue.length < 3
    ? 'Press more keys or click to cast'
    : 'Click to execute combo!';
  renderer.drawText(hint, queueX, queueY + 34, player.comboQueue.length >= 2 ? '#ffff44' : '#888888', 10, 'center');
}

function renderBuffs(renderer: Renderer, player: Player): void {
  const startX = 10;
  const startY = 55;
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
