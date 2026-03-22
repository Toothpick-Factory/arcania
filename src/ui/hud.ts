import { Renderer } from '../engine/renderer';
import { Player } from '../entities/player';
import { GameState, CANVAS_WIDTH, CANVAS_HEIGHT } from '../engine/types';
import { DungeonMap } from '../systems/dungeon';
import { BASE_SPELLS, findComboSpell } from '../data/spells';
import { getItemDef } from '../data/items';

export function renderHUD(renderer: Renderer, player: Player, state: GameState): void {
  const ctx = renderer.ctx;

  // Health bar
  renderer.drawBar(10, 10, 200, 20, player.hp / player.maxHp, '#cc2222', '#441111');
  renderer.drawText(`HP: ${player.hp}/${player.maxHp}`, 15, 12, '#ffffff', 14);

  // Mana bar
  renderer.drawBar(10, 35, 200, 16, player.mana / player.maxMana, '#2244cc', '#111144');
  renderer.drawText(`MP: ${Math.floor(player.mana)}/${player.maxMana}`, 15, 37, '#ffffff', 12);

  // XP bar
  renderer.drawBar(10, 55, 200, 10, player.xp / player.xpToNext, '#22aa22', '#114411');

  // Level
  renderer.drawText(`Lv.${player.level}`, 215, 10, '#ffcc00', 16);

  // Gold
  renderer.drawText(`Gold: ${player.gold}`, 215, 35, '#ffdd44', 14);

  // Floor
  renderer.drawText(`Floor ${state.floor}`, CANVAS_WIDTH - 100, 10, '#aaaaaa', 14);

  // Active spells bar
  renderSpellBar(renderer, player);

  // Active buffs
  renderBuffs(renderer, player);

  // Inventory count
  const totalItems = player.inventory.reduce((s, i) => s + i.count, 0);
  renderer.drawText(`Items: ${totalItems}`, CANVAS_WIDTH - 100, 30, '#aaaaaa', 12);
}

function renderSpellBar(renderer: Renderer, player: Player): void {
  const barY = CANVAS_HEIGHT - 50;
  const barX = CANVAS_WIDTH / 2 - (player.spells.length * 44) / 2;

  for (let i = 0; i < player.spells.length; i++) {
    const spell = player.spells[i];
    const baseDef = BASE_SPELLS.find((s) => s.id === spell.element);
    if (!baseDef) continue;

    const x = barX + i * 44;
    const isActive = i === player.activeSpellIndex;
    const onCooldown = player.spellCooldowns.has(spell.element);

    // Background
    renderer.drawRect(x, barY, 40, 40, isActive ? '#333344' : '#222222');
    renderer.drawRectOutline(x, barY, 40, 40, isActive ? '#ffffff' : '#555555', isActive ? 2 : 1);

    // Spell color indicator
    renderer.drawRect(x + 4, barY + 4, 32, 32, onCooldown ? '#333333' : baseDef.color);

    // Cooldown overlay
    if (onCooldown) {
      renderer.ctx.globalAlpha = 0.5;
      renderer.drawRect(x + 4, barY + 4, 32, 32, '#000000');
      renderer.ctx.globalAlpha = 1;
    }

    // Level
    renderer.drawText(`${spell.level}`, x + 2, barY + 2, '#ffffff', 10);

    // Hotkey
    renderer.drawText(`${i + 1}`, x + 30, barY + 28, '#888888', 10);

    // Combo indicator
    if (player.comboSlot === spell.element) {
      renderer.drawRectOutline(x - 2, barY - 2, 44, 44, '#ffff00', 2);
    }
  }

  // Combo hint
  if (player.comboSlot) {
    renderer.drawText('COMBO: Select 2nd spell with Shift+Click', CANVAS_WIDTH / 2, barY - 15, '#ffff00', 11, 'center');
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

  // Background
  renderer.ctx.globalAlpha = 0.7;
  renderer.drawRect(mapX - 2, mapY - 2, mapSize + 4, mapSize + 4, '#111111');
  renderer.ctx.globalAlpha = 1;

  // Tiles
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

  // Player dot
  renderer.drawRect(
    mapX + playerTileX * scale - 1,
    mapY + playerTileY * scale - 1,
    3, 3, '#44ff44'
  );
}
