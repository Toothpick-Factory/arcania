import { Renderer } from '../engine/renderer';
import { InputManager } from '../engine/input';
import { Player, getItemCount, removeItemFromInventory } from '../entities/player';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../engine/types';
import { MetaSave } from '../systems/save';
import { Shop, buyItem } from '../systems/shop';
import { getItemDef, getFoodEffect, HOTBAR_SIZE, COOKING_RECIPES, RecipeDef } from '../data/items';
import { eatFood, canCook, cook, getAvailableRecipes } from '../systems/cooking';
import { MagicType, MAGIC_TYPE_COLORS, MAGIC_TYPE_NAMES, getActiveSpellForMagic, getHighestUnlockedTier, COMBO_SPELLS, getSpellById } from '../data/spells';

export type MenuType = 'none' | 'inventory' | 'shop' | 'cooking' | 'pause' | 'controls' | 'compendium' | 'boss_reward' | 'death' | 'victory' | 'hub';

export interface GridCell {
  kind: 'spell' | 'item' | 'empty';
  ref?: string;
  name?: string;
  color?: string;
  count?: number;
}

export interface MenuState {
  type: MenuType;
  selectedIndex: number;
  gridCursorX: number;
  gridCursorY: number;
  shop?: Shop;
  message?: string;
  messageTimer?: number;
  // Boss reward
  bossRewardSpell?: string;       // the element the boss drops
  bossRewardSecondary?: string;   // random secondary reward description
  bossRewardSecondaryType?: 'armor' | 'passive' | 'currency';
}

export function createMenuState(): MenuState {
  return { type: 'none', selectedIndex: 0, gridCursorX: 0, gridCursorY: 0 };
}

export function updateMenu(
  menu: MenuState,
  input: InputManager,
  player: Player,
  meta: MetaSave
): string | null {
  if (menu.messageTimer && menu.messageTimer > 0) {
    menu.messageTimer -= 1 / 60;
    if (menu.messageTimer <= 0) {
      menu.message = undefined;
      menu.messageTimer = undefined;
    }
  }

  // ESC to close menus or open pause
  if (input.isKeyJustPressed('Escape')) {
    if (menu.type === 'cooking') {
      menu.type = 'none';
      return null;
    }
    if (menu.type === 'controls' || menu.type === 'compendium') {
      menu.type = 'pause';
      menu.selectedIndex = 0;
      return null;
    }
    if (menu.type !== 'none' && menu.type !== 'death' && menu.type !== 'victory') {
      menu.type = 'none';
      return null;
    }
    if (menu.type === 'none') {
      menu.type = 'pause';
      menu.selectedIndex = 0;
      return null;
    }
  }

  // I for inventory
  if (input.isKeyJustPressed('KeyI')) {
    if (menu.type === 'none') {
      menu.type = 'inventory';
      menu.selectedIndex = 0;
      menu.gridCursorX = 0;
      menu.gridCursorY = 0;
      return null;
    } else if (menu.type === 'inventory') {
      menu.type = 'none';
      return null;
    }
  }

  // Navigate — inventory uses grid cursor, others use list index
  if (menu.type === 'inventory') {
    const GRID_COLS = 8;
    const GRID_ROWS = 5;
    if (input.isKeyJustPressed('ArrowUp') || input.isKeyJustPressed('KeyW')) {
      menu.gridCursorY = Math.max(0, menu.gridCursorY - 1);
    }
    if (input.isKeyJustPressed('ArrowDown') || input.isKeyJustPressed('KeyS')) {
      menu.gridCursorY = Math.min(GRID_ROWS - 1, menu.gridCursorY + 1);
    }
    if (input.isKeyJustPressed('ArrowLeft') || input.isKeyJustPressed('KeyA')) {
      menu.gridCursorX = Math.max(0, menu.gridCursorX - 1);
    }
    if (input.isKeyJustPressed('ArrowRight') || input.isKeyJustPressed('KeyD')) {
      menu.gridCursorX = Math.min(GRID_COLS - 1, menu.gridCursorX + 1);
    }

    // Mouse-based grid navigation (two-column layout)
    const mousePos = input.getMousePos();
    const mPanelW = 470;
    const mPanelX = CANVAS_WIDTH / 2 - mPanelW / 2;
    const mCellSize = 42;
    const mGap = 3;
    const mGridY = 30 + 55;
    const mGridXLeft = mPanelX + 10;
    const mGridXRight = mPanelX + mPanelW / 2 + 10;
    const my = mousePos.y - mGridY;
    if (my >= 0) {
      const row = Math.floor(my / (mCellSize + mGap));
      if (row >= 0 && row < GRID_ROWS) {
        menu.gridCursorY = row;
        // Check left column
        const mlx = mousePos.x - mGridXLeft;
        if (mlx >= 0 && mlx < 4 * (mCellSize + mGap)) {
          menu.gridCursorX = Math.floor(mlx / (mCellSize + mGap));
        }
        // Check right column
        const mrx = mousePos.x - mGridXRight;
        if (mrx >= 0 && mrx < 4 * (mCellSize + mGap)) {
          menu.gridCursorX = 4 + Math.floor(mrx / (mCellSize + mGap));
        }
      }
    }

    // R11: Mouse click acts as Enter in inventory
    if (input.isMouseJustClicked()) {
      const cells = buildInventoryGrid(player);
      const idx = menu.gridCursorY * GRID_COLS + menu.gridCursorX;
      const cell = cells[idx];
      if (cell && cell.kind === 'item' && cell.ref) {
        const effect = getFoodEffect(cell.ref);
        if (effect) {
          eatFood(player, cell.ref);
          menu.message = 'Consumed!';
          menu.messageTimer = 1.5;
        }
      }
      return null;
    }

    // CSV8: Right-click context menu — Eat, Inspect, Drop, or queue for combo
    if (input.isRightMouseJustClicked()) {
      const cells = buildInventoryGrid(player);
      const idx = menu.gridCursorY * GRID_COLS + menu.gridCursorX;
      const cell = cells[idx];
      if (cell && cell.kind !== 'empty' && cell.ref) {
        if (cell.kind === 'item') {
          const def = getItemDef(cell.ref);
          const effect = getFoodEffect(cell.ref);
          if (effect) {
            // Food item — eat it
            eatFood(player, cell.ref);
            menu.message = `Ate ${def?.name || cell.ref}!`;
            menu.messageTimer = 1.5;
          } else if (def) {
            // Non-food item — inspect it
            menu.message = `${def.name}: ${def.description}`;
            menu.messageTimer = 3;
          }
        } else if (cell.kind === 'spell') {
          // Spell — add to combo queue
          if (player.comboQueue.length < 2) {
            player.comboQueue.push({ kind: 'spell', ref: cell.ref });
            menu.message = `Added ${cell.name} to combo queue`;
            menu.messageTimer = 1.5;
          }
        }
      }
      return null;
    }

    // Number keys 1-4 assign highlighted cell to hotbar
    for (let i = 0; i < HOTBAR_SIZE; i++) {
      if (input.isKeyJustPressed(`Digit${i + 1}`)) {
        const cells = buildInventoryGrid(player);
        const idx = menu.gridCursorY * GRID_COLS + menu.gridCursorX;
        const cell = cells[idx];
        if (cell && cell.kind !== 'empty') {
          player.hotbar[i] = { kind: cell.kind, ref: cell.ref };
          menu.message = `Assigned ${cell.name} to slot ${i + 1}`;
          menu.messageTimer = 1.5;
        }
        return null;
      }
    }
  } else {
    if (input.isKeyJustPressed('ArrowUp') || input.isKeyJustPressed('KeyW')) {
      if (menu.type !== 'none') menu.selectedIndex = Math.max(0, menu.selectedIndex - 1);
    }
    if (input.isKeyJustPressed('ArrowDown') || input.isKeyJustPressed('KeyS')) {
      if (menu.type !== 'none') menu.selectedIndex++;
    }

    // FB11: Mouse click support for list menus (pause, hub, etc.)
    if (menu.type === 'pause' && input.isMouseJustClicked()) {
      const mPos = input.getMousePos();
      const panelY = CANVAS_HEIGHT / 2 - 100;
      for (let i = 0; i < 4; i++) {
        const optY = panelY + 60 + i * 35;
        if (mPos.y >= optY - 5 && mPos.y <= optY + 20 && mPos.x > CANVAS_WIDTH / 2 - 100 && mPos.x < CANVAS_WIDTH / 2 + 100) {
          menu.selectedIndex = i;
          return handleMenuAction(menu, player, meta);
        }
      }
    }
    // Cooking menu mouse hover + click
    if (menu.type === 'cooking') {
      const mPos = input.getMousePos();
      const recipes = getAvailableRecipes(player, meta);
      const panelY = 60;
      for (let i = 0; i < recipes.length; i++) {
        const optY = panelY + 65 + i * 55;
        if (mPos.y >= optY && mPos.y <= optY + 48 && mPos.x > CANVAS_WIDTH / 2 - 195 && mPos.x < CANVAS_WIDTH / 2 + 195) {
          menu.selectedIndex = i;
          if (input.isMouseJustClicked()) {
            return handleMenuAction(menu, player, meta);
          }
        }
      }
    }
    // Boss reward mouse hover + click
    if (menu.type === 'boss_reward') {
      const mPos = input.getMousePos();
      const panelX = CANVAS_WIDTH / 2 - 200;
      const panelY = CANVAS_HEIGHT / 2 - 120;
      for (let i = 0; i < 2; i++) {
        const optY = panelY + 80 + i * 55;
        if (mPos.y >= optY && mPos.y <= optY + 45 && mPos.x > panelX + 20 && mPos.x < panelX + 380) {
          menu.selectedIndex = i;
          if (input.isMouseJustClicked()) {
            return handleMenuAction(menu, player, meta);
          }
        }
      }
    }
    if (menu.type === 'hub' && input.isMouseJustClicked()) {
      const mPos = input.getMousePos();
      if (mPos.y >= 310 && mPos.y <= 360 && mPos.x > CANVAS_WIDTH / 2 - 150 && mPos.x < CANVAS_WIDTH / 2 + 150) {
        menu.selectedIndex = 0;
        return handleMenuAction(menu, player, meta);
      }
    }
  }

  // Actions
  if (input.isKeyJustPressed('Enter') || input.isKeyJustPressed('Space')) {
    return handleMenuAction(menu, player, meta);
  }

  return null;
}

function handleMenuAction(menu: MenuState, player: Player, meta: MetaSave): string | null {
  switch (menu.type) {
    case 'cooking': {
      const recipes = getAvailableRecipes(player, meta);
      if (menu.selectedIndex < recipes.length) {
        const recipe = recipes[menu.selectedIndex];
        if (canCook(player, recipe)) {
          cook(player, recipe, meta);
          menu.message = `Cooked ${recipe.name}!`;
          menu.messageTimer = 2;
        } else {
          menu.message = 'Missing ingredients!';
          menu.messageTimer = 1.5;
        }
      }
      return null;
    }
    case 'shop': {
      if (menu.shop && menu.selectedIndex < menu.shop.items.length) {
        const success = buyItem(player, menu.shop, menu.selectedIndex);
        if (success) {
          menu.message = 'Purchased!';
          menu.messageTimer = 1.5;
        } else {
          menu.message = 'Not enough gold!';
          menu.messageTimer = 1.5;
        }
      }
      return null;
    }
    case 'inventory': {
      // Enter on a food item consumes it
      const cells = buildInventoryGrid(player);
      const idx = menu.gridCursorY * 8 + menu.gridCursorX;
      const cell = cells[idx];
      if (cell && cell.kind === 'item' && cell.ref) {
        const effect = getFoodEffect(cell.ref);
        if (effect) {
          eatFood(player, cell.ref);
          menu.message = 'Consumed!';
          menu.messageTimer = 1.5;
        }
      }
      return null;
    }
    case 'death':
      return 'restart';
    case 'victory':
      return 'restart';
    case 'pause':
      if (menu.selectedIndex === 0) { menu.type = 'none'; return null; }
      if (menu.selectedIndex === 1) { menu.type = 'controls'; menu.selectedIndex = 0; return null; }
      if (menu.selectedIndex === 2) { menu.type = 'compendium'; menu.selectedIndex = 0; return null; }
      if (menu.selectedIndex === 3) return 'restart';
      return null;
    case 'controls':
    case 'compendium':
      menu.type = 'pause';
      menu.selectedIndex = 0;
      return null;
    case 'boss_reward':
      if (menu.selectedIndex === 0) return 'boss_reward_spell';
      if (menu.selectedIndex === 1) return 'boss_reward_secondary';
      return null;
    case 'hub':
      if (menu.selectedIndex === 0) return 'start_run';
      return null;
    default:
      return null;
  }
}

export function renderMenu(renderer: Renderer, menu: MenuState, player: Player, meta: MetaSave): void {
  if (menu.type === 'none') return;

  // Darken background
  renderer.ctx.globalAlpha = 0.7;
  renderer.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, '#000000');
  renderer.ctx.globalAlpha = 1;

  switch (menu.type) {
    case 'inventory': renderInventory(renderer, menu, player); break;
    case 'cooking': renderCooking(renderer, menu, player, meta); break;
    case 'shop': renderShop(renderer, menu, player); break;
    case 'pause': renderPause(renderer, menu); break;
    case 'controls': renderControls(renderer); break;
    case 'compendium': renderCompendium(renderer, player, meta); break;
    case 'boss_reward': renderBossReward(renderer, menu); break;
    case 'death': renderDeath(renderer, player, meta); break;
    case 'victory': renderVictory(renderer, player, meta); break;
    case 'hub': renderHub(renderer, menu, player, meta); break;
  }

  // Toast message
  if (menu.message) {
    renderer.drawText(menu.message, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80, '#ffff44', 16, 'center');
  }
}

const GRID_COLS = 8;
const GRID_ROWS = 5;

function buildInventoryGrid(player: Player): GridCell[] {
  // CSV4: Spells in columns 0-3, Items in columns 4-7
  const spells: GridCell[] = [];
  for (const magic of player.magics) {
    const mt = magic.magicType;
    const color = MAGIC_TYPE_COLORS[mt as MagicType] || '#888888';
    const name = MAGIC_TYPE_NAMES[mt as MagicType] || mt;
    spells.push({ kind: 'spell', ref: mt, name, color });
  }

  const items: GridCell[] = [];
  for (const inv of player.inventory) {
    const def = getItemDef(inv.itemId);
    items.push({
      kind: 'item',
      ref: inv.itemId,
      name: def?.name || inv.itemId,
      color: def?.color || '#886644',
      count: inv.count,
    });
  }

  // Build the grid row by row: left 4 cols = spells, right 4 cols = items
  const cells: GridCell[] = [];
  const colWidth = 4;
  for (let row = 0; row < GRID_ROWS; row++) {
    // Left: spells
    for (let col = 0; col < colWidth; col++) {
      const spellIdx = row * colWidth + col;
      cells.push(spellIdx < spells.length ? spells[spellIdx] : { kind: 'empty' });
    }
    // Right: items
    for (let col = 0; col < colWidth; col++) {
      const itemIdx = row * colWidth + col;
      cells.push(itemIdx < items.length ? items[itemIdx] : { kind: 'empty' });
    }
  }

  while (cells.length < GRID_COLS * GRID_ROWS) {
    cells.push({ kind: 'empty' });
  }

  return cells.slice(0, GRID_COLS * GRID_ROWS);
}

function renderInventory(renderer: Renderer, menu: MenuState, player: Player): void {
  const panelW = 470;
  const panelH = 500;
  const panelX = CANVAS_WIDTH / 2 - panelW / 2;
  const panelY = 30;

  renderer.drawRect(panelX, panelY, panelW, panelH, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, panelW, panelH, '#444466');
  renderer.drawText('INVENTORY', CANVAS_WIDTH / 2, panelY + 10, '#ffffff', 20, 'center');
  renderer.drawText(`Gold: ${player.gold}`, panelX + 10, panelY + 35, '#ffdd44', 12);

  // CSV4: Two-column layout — Spells left, Items right
  const spellCount = player.magics.length;
  const itemCount = player.inventory.length;

  const cells = buildInventoryGrid(player);
  const cellSize = 42;
  const gap = 3;
  const colWidth = 4; // 4 cells per column
  const gridY = panelY + 55;

  // Column headers
  renderer.drawText('SPELLS', panelX + 10, panelY + 42, '#8866aa', 11);
  renderer.drawText('ITEMS', panelX + panelW / 2 + 10, panelY + 42, '#886644', 11);

  // Divider line
  const divX = panelX + panelW / 2 - 2;
  renderer.drawRect(divX, gridY - 5, 2, GRID_ROWS * (cellSize + gap), '#333355');

  const gridXLeft = panelX + 10;
  const gridXRight = panelX + panelW / 2 + 10;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const idx = row * GRID_COLS + col;
      const cell = cells[idx];
      // Left column (0-3) = spells, Right column (4-7) = items
      const isRightCol = col >= colWidth;
      const colInSection = isRightCol ? col - colWidth : col;
      const baseX = isRightCol ? gridXRight : gridXLeft;
      const x = baseX + colInSection * (cellSize + gap);
      const y = gridY + row * (cellSize + gap);
      const isCursor = col === menu.gridCursorX && row === menu.gridCursorY;

      // Background
      renderer.drawRect(x, y, cellSize, cellSize, cell.kind === 'empty' ? '#111118' : '#222233');

      if (cell.kind !== 'empty') {
        // Color fill
        renderer.drawRect(x + 3, y + 3, cellSize - 6, cellSize - 6, cell.color || '#444444');

        // Name (abbreviated)
        const abbr = (cell.name || '').substring(0, 5);
        renderer.drawText(abbr, x + cellSize / 2, y + cellSize / 2 - 5, '#ffffff', 8, 'center');

        // Kind indicator
        if (cell.kind === 'spell') {
          renderer.drawText('S', x + 2, y + 2, '#cc88ff', 8);
        }

        // Stack count for items
        if (cell.kind === 'item' && cell.count !== undefined) {
          renderer.drawText(`${cell.count}`, x + cellSize - 14, y + cellSize - 14, '#ffffff', 9);
        }

        // Border color
        const borderColor = cell.kind === 'spell' ? '#8866aa' : '#886644';
        renderer.drawRectOutline(x, y, cellSize, cellSize, borderColor, 1);
      } else {
        renderer.drawRectOutline(x, y, cellSize, cellSize, '#222233', 1);
      }

      // Cursor highlight
      if (isCursor) {
        renderer.drawRectOutline(x - 2, y - 2, cellSize + 4, cellSize + 4, '#ffffff', 2);
      }
    }
  }

  // Detail panel below grid
  const detailY = gridY + GRID_ROWS * (cellSize + gap) + 8;
  const cursorIdx = menu.gridCursorY * GRID_COLS + menu.gridCursorX;
  const selected = cells[cursorIdx];

  if (selected && selected.kind !== 'empty') {
    renderer.drawText(selected.name || '', panelX + 10, detailY, '#ffffff', 14);

    if (selected.kind === 'item') {
      const def = getItemDef(selected.ref!);
      if (def) renderer.drawText(def.description, panelX + 10, detailY + 18, '#888888', 11);
      const effect = getFoodEffect(selected.ref!);
      if (effect) renderer.drawText('[Enter] Consume', panelX + 10, detailY + 34, '#44ff44', 11);
    } else if (selected.kind === 'spell') {
      const magic = player.magics.find((m) => m.magicType === selected.ref);
      if (magic) {
        const tier = getHighestUnlockedTier(magic.xp);
        const spellDef = getActiveSpellForMagic(selected.ref as MagicType, magic.xp);
        renderer.drawText(`Tier ${tier}: ${spellDef?.name || '?'}`, panelX + 10, detailY + 18, '#888888', 11);
        if (spellDef) renderer.drawText(spellDef.description, panelX + 10, detailY + 34, '#666666', 10);
      }
    }

    renderer.drawText('[1-5] Assign to hotbar', panelX + panelW - 150, detailY, '#aaaaaa', 11);
  }

  // Hotbar strip at bottom
  const hotbarY = detailY + 55;
  renderer.drawText('HOTBAR:', panelX + 10, hotbarY, '#888888', 11);
  for (let i = 0; i < HOTBAR_SIZE; i++) {
    const slot = player.hotbar[i];
    const hx = panelX + 80 + i * 52;
    renderer.drawRect(hx, hotbarY - 2, 44, 24, '#222233');
    if (slot.kind !== 'empty' && slot.ref) {
      const color = slot.kind === 'spell'
        ? (MAGIC_TYPE_COLORS[slot.ref as MagicType] || '#888888')
        : (getItemDef(slot.ref)?.color || '#886644');
      renderer.drawRect(hx + 2, hotbarY, 40, 20, color);
      const name = slot.kind === 'spell'
        ? (MAGIC_TYPE_NAMES[slot.ref as MagicType] || slot.ref).substring(0, 4)
        : (getItemDef(slot.ref)?.name || slot.ref).substring(0, 4);
      renderer.drawText(name, hx + 22, hotbarY + 4, '#ffffff', 9, 'center');
    }
    renderer.drawText(`${i + 1}`, hx + 2, hotbarY + 1, '#666666', 8);
    renderer.drawRectOutline(hx, hotbarY - 2, 44, 24, '#444444', 1);
  }

  renderer.drawText('[I/ESC] Close  [Arrows] Navigate  [1-5] Assign  [Enter] Use', CANVAS_WIDTH / 2, panelY + panelH - 14, '#555555', 10, 'center');
}

function renderShop(renderer: Renderer, menu: MenuState, player: Player): void {
  const panelX = CANVAS_WIDTH / 2 - 200;
  const panelY = 60;

  renderer.drawRect(panelX, panelY, 400, 400, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, 400, 400, '#4488ff');
  renderer.drawText('SHOP', CANVAS_WIDTH / 2, panelY + 10, '#4488ff', 20, 'center');
  renderer.drawText(`Your Gold: ${player.gold}`, panelX + 10, panelY + 40, '#ffdd44', 14);

  if (!menu.shop || menu.shop.items.length === 0) {
    renderer.drawText('Nothing for sale', CANVAS_WIDTH / 2, panelY + 80, '#888888', 14, 'center');
    return;
  }

  menu.selectedIndex = Math.min(menu.selectedIndex, menu.shop.items.length - 1);

  for (let i = 0; i < menu.shop.items.length; i++) {
    const shopItem = menu.shop.items[i];
    const y = panelY + 65 + i * 28;
    const isSelected = i === menu.selectedIndex;
    const canAfford = player.gold >= shopItem.price && shopItem.stock > 0;

    if (isSelected) renderer.drawRect(panelX + 5, y - 2, 390, 26, '#333355');

    renderer.drawRect(panelX + 10, y + 4, 10, 10, shopItem.item.color);
    const nameColor = shopItem.stock <= 0 ? '#555555' : isSelected ? '#ffffff' : '#aaaaaa';
    renderer.drawText(`${shopItem.item.name}`, panelX + 28, y, nameColor, 13);
    renderer.drawText(`${shopItem.price}g`, panelX + 280, y, canAfford ? '#ffdd44' : '#884444', 13);
    renderer.drawText(`x${shopItem.stock}`, panelX + 340, y, '#888888', 12);

    if (isSelected) {
      renderer.drawText(shopItem.item.description, panelX + 28, y + 14, '#888888', 10);
    }
  }

  renderer.drawText('[Enter] Buy  [ESC] Close', CANVAS_WIDTH / 2, panelY + 380, '#666666', 11, 'center');
}


function renderCooking(renderer: Renderer, menu: MenuState, player: Player, meta: MetaSave): void {
  const panelX = CANVAS_WIDTH / 2 - 200;
  const panelY = 60;
  const panelW = 400;
  const panelH = 480;

  renderer.drawRect(panelX, panelY, panelW, panelH, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, panelW, panelH, '#ff8844');
  renderer.drawText('COOKING', CANVAS_WIDTH / 2, panelY + 12, '#ff8844', 22, 'center');

  // Show player's ingredients
  const ingredients = player.inventory.filter((inv) => {
    const def = getItemDef(inv.itemId);
    return def?.category === 'ingredient';
  });
  if (ingredients.length > 0) {
    renderer.drawText('Ingredients:', panelX + 10, panelY + 38, '#888888', 11);
    let ix = panelX + 90;
    for (const inv of ingredients) {
      const def = getItemDef(inv.itemId);
      if (def) {
        renderer.drawRect(ix, panelY + 36, 10, 10, def.color);
        renderer.drawText(`${def.name.substring(0, 8)} x${inv.count}`, ix + 14, panelY + 36, '#cccccc', 9);
        ix += 90;
        if (ix > panelX + panelW - 40) break;
      }
    }
  } else {
    renderer.drawText('No ingredients', panelX + 10, panelY + 38, '#666666', 11);
  }

  // Show recipes
  const recipes = getAvailableRecipes(player, meta);
  if (recipes.length === 0) {
    renderer.drawText('No recipes available', CANVAS_WIDTH / 2, panelY + 100, '#888888', 14, 'center');
    renderer.drawText('Gather ingredients to discover recipes!', CANVAS_WIDTH / 2, panelY + 120, '#666666', 11, 'center');
  } else {
    menu.selectedIndex = Math.min(menu.selectedIndex, recipes.length - 1);
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const y = panelY + 65 + i * 55;
      const isSelected = i === menu.selectedIndex;
      const hasIngredients = canCook(player, recipe);

      renderer.drawRect(panelX + 10, y, panelW - 20, 48, isSelected ? '#333344' : '#222233');
      renderer.drawRectOutline(panelX + 10, y, panelW - 20, 48, isSelected ? '#ff8844' : '#444444', isSelected ? 2 : 1);

      // Result item color indicator
      const resultDef = getItemDef(recipe.result);
      if (resultDef) {
        renderer.drawRect(panelX + 16, y + 6, 14, 14, resultDef.color);
      }

      // Recipe name
      renderer.drawText(
        recipe.name,
        panelX + 38, y + 4,
        isSelected ? '#ffffff' : '#aaaaaa', 14
      );

      // Ingredients list
      const ingNames = recipe.ingredients.map((id) => {
        const def = getItemDef(id);
        return def?.name || id;
      }).join(' + ');
      renderer.drawText(ingNames, panelX + 38, y + 22, '#888888', 9);

      // Status
      if (hasIngredients) {
        renderer.drawText(isSelected ? '[Enter] Cook' : 'Ready', panelX + panelW - 90, y + 8, '#44ff44', 10);
      } else {
        renderer.drawText('Missing items', panelX + panelW - 100, y + 8, '#ff4444', 10);
      }

      // Food effect preview
      const effect = getFoodEffect(recipe.result);
      if (effect && isSelected) {
        const parts: string[] = [];
        if (effect.healAmount) parts.push(`Heal ${effect.healAmount}`);
        if (effect.damageBonus) parts.push(`+${effect.damageBonus} Dmg`);
        if (effect.speedBonus) parts.push(`+${effect.speedBonus} Spd`);
        if (effect.maxHpBonus) parts.push(`+${effect.maxHpBonus} Max HP`);
        if (effect.duration) parts.push(`${effect.duration}s`);
        renderer.drawText(parts.join(' | '), panelX + 38, y + 34, '#ffdd44', 8);
      }
    }
  }

  renderer.drawText('[Enter/Click] Cook  [ESC] Close  [W/S] Navigate', CANVAS_WIDTH / 2, panelY + panelH - 16, '#555555', 10, 'center');
}

function renderBossReward(renderer: Renderer, menu: MenuState): void {
  const panelX = CANVAS_WIDTH / 2 - 200;
  const panelY = CANVAS_HEIGHT / 2 - 120;
  const panelW = 400;
  const panelH = 240;

  renderer.drawRect(panelX, panelY, panelW, panelH, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, panelW, panelH, '#ffdd44');
  renderer.drawText('BOSS DEFEATED!', CANVAS_WIDTH / 2, panelY + 15, '#ffdd44', 24, 'center');
  renderer.drawText('Choose your reward:', CANVAS_WIDTH / 2, panelY + 45, '#aaaaaa', 14, 'center');

  const options = [
    { label: menu.bossRewardSpell || 'Learn New Spell', color: '#cc88ff' },
    { label: menu.bossRewardSecondary || 'Random Reward', color: '#44ff44' },
  ];

  for (let i = 0; i < options.length; i++) {
    const y = panelY + 80 + i * 55;
    const isSelected = i === menu.selectedIndex;

    renderer.drawRect(panelX + 20, y, panelW - 40, 45, isSelected ? '#333355' : '#222233');
    renderer.drawRectOutline(panelX + 20, y, panelW - 40, 45, isSelected ? '#ffffff' : '#555555', isSelected ? 2 : 1);

    renderer.drawText(
      `${isSelected ? '> ' : '  '}${options[i].label}`,
      CANVAS_WIDTH / 2, y + 14,
      isSelected ? '#ffffff' : '#888888', 16, 'center'
    );
  }

  renderer.drawText('[Enter] or Click to choose', CANVAS_WIDTH / 2, panelY + panelH - 20, '#555555', 11, 'center');
}

function renderCompendium(renderer: Renderer, player: Player, meta: MetaSave): void {
  const panelX = CANVAS_WIDTH / 2 - 240;
  const panelY = 30;
  const panelW = 480;
  const panelH = 560;

  renderer.drawRect(panelX, panelY, panelW, panelH, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, panelW, panelH, '#ffdd44');
  renderer.drawText('SPELL COMPENDIUM', CANVAS_WIDTH / 2, panelY + 12, '#ffdd44', 20, 'center');

  // CSV10: Show per-run in dungeon, all-time in lobby
  const runCombos = player.discoveredCombos;
  const allTimeCombos = meta.discoveredCombos || [];
  const inRun = player.magics.length > 0; // in lobby, player has no magics
  const discovered = inRun ? runCombos : allTimeCombos;
  const label = inRun ? `This Run: ${discovered.length}` : `All Time: ${discovered.length}`;
  renderer.drawText(label, CANVAS_WIDTH / 2, panelY + 38, '#aaaaaa', 12, 'center');

  if (discovered.length === 0) {
    renderer.drawText('No combos discovered yet!', CANVAS_WIDTH / 2, panelY + 80, '#888888', 14, 'center');
    renderer.drawText('Queue two different spells and click to discover combos', CANVAS_WIDTH / 2, panelY + 100, '#666666', 11, 'center');
  } else {
    let y = panelY + 60;
    for (let i = 0; i < discovered.length && y < panelY + panelH - 30; i++) {
      const comboId = discovered[i];
      const combo = COMBO_SPELLS.find((c) => c.id === comboId);
      if (!combo) continue;

      const baseColor = MAGIC_TYPE_COLORS[combo.baseElement] || '#888888';
      const modColor = MAGIC_TYPE_COLORS[combo.modElement] || '#888888';
      const baseName = MAGIC_TYPE_NAMES[combo.baseElement] || combo.baseElement;
      const modName = MAGIC_TYPE_NAMES[combo.modElement] || combo.modElement;

      // Color indicators
      renderer.drawRect(panelX + 10, y + 2, 12, 12, baseColor);
      renderer.drawText('+', panelX + 26, y, '#888888', 12);
      renderer.drawRect(panelX + 36, y + 2, 12, 12, modColor);

      // Combo name
      renderer.drawText(combo.name, panelX + 58, y, combo.color, 13);

      // Formula with tier
      const baseMagic = player.magics.find((m) => m.magicType === combo.baseElement);
      const baseTier = baseMagic ? getHighestUnlockedTier(baseMagic.xp) : 1;
      renderer.drawText(`T${baseTier} ${baseName} + ${modName}`, panelX + 280, y, '#888888', 10);

      // Description
      renderer.drawText(combo.description, panelX + 58, y + 15, '#666666', 9);

      y += 30;
    }
  }

  renderer.drawText('[ESC] Back', CANVAS_WIDTH / 2, panelY + panelH - 16, '#555555', 11, 'center');
}

function renderPause(renderer: Renderer, menu: MenuState): void {
  const panelX = CANVAS_WIDTH / 2 - 140;
  const panelY = CANVAS_HEIGHT / 2 - 100;

  renderer.drawRect(panelX, panelY, 280, 200, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, 280, 200, '#666688');
  renderer.drawText('PAUSED', CANVAS_WIDTH / 2, panelY + 15, '#ffffff', 24, 'center');

  const options = ['Resume', 'Controls', 'Compendium', 'Return to Lobby'];
  menu.selectedIndex = Math.min(menu.selectedIndex, options.length - 1);

  for (let i = 0; i < options.length; i++) {
    const y = panelY + 60 + i * 35;
    const isSelected = i === menu.selectedIndex;
    renderer.drawText(
      `${isSelected ? '> ' : '  '}${options[i]}`,
      CANVAS_WIDTH / 2, y,
      isSelected ? '#ffffff' : '#888888', 16, 'center'
    );
  }

  renderer.drawText('[ESC] Resume', CANVAS_WIDTH / 2, panelY + 178, '#555555', 11, 'center');
}

function renderControls(renderer: Renderer): void {
  const panelX = CANVAS_WIDTH / 2 - 240;
  const panelY = 40;
  const panelW = 480;
  const panelH = 560;

  renderer.drawRect(panelX, panelY, panelW, panelH, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, panelW, panelH, '#cc88ff');
  renderer.drawText('CONTROLS', CANVAS_WIDTH / 2, panelY + 12, '#cc88ff', 22, 'center');

  const leftX = panelX + 20;
  const rightX = panelX + 200;
  let y = panelY + 50;
  const lineH = 22;

  function section(title: string): void {
    y += 6;
    renderer.drawText(title, CANVAS_WIDTH / 2, y, '#cc88ff', 14, 'center');
    y += lineH + 2;
  }

  function row(key: string, desc: string): void {
    renderer.drawText(key, leftX, y, '#ffdd44', 12);
    renderer.drawText(desc, rightX, y, '#cccccc', 12);
    y += lineH;
  }

  section('MOVEMENT');
  row('W / Arrow Up', 'Move up');
  row('A / Arrow Left', 'Move left');
  row('S / Arrow Down', 'Move down');
  row('D / Arrow Right', 'Move right');

  section('COMBAT');
  row('1 - 9', 'Queue magic type for combo (or set active)');
  row('Left Click', 'Cast queued combo or active spell');
  row('Q', 'Clear combo queue');

  section('INTERACTION');
  row('F', 'Interact (shops, cooking, stairs)');

  section('MENUS');
  row('I', 'Open / close inventory');
  row('ESC', 'Pause menu / close current menu');
  row('W/S or Up/Down', 'Navigate menu options');
  row('Enter / Space', 'Confirm selection');

  section('TIPS');
  renderer.drawText('Press two number keys to queue a combo, then click', leftX, y, '#888888', 11);
  y += 16;
  renderer.drawText('to cast. Valid combos discover new spells! Invalid', leftX, y, '#888888', 11);
  y += 16;
  renderer.drawText('combos fizzle. Press Q to clear the queue. Cook food', leftX, y, '#888888', 11);
  y += 16;
  renderer.drawText('at stations for buffs. Defeat bosses to go deeper!', leftX, y, '#888888', 11);

  renderer.drawText('[ESC] or [Enter] Back', CANVAS_WIDTH / 2, panelY + panelH - 18, '#555555', 11, 'center');
}

function renderDeath(renderer: Renderer, player: Player, meta: MetaSave): void {
  renderer.drawText('YOU DIED', CANVAS_WIDTH / 2, 150, '#cc2222', 40, 'center');
  renderer.drawText(`Reached Floor ${meta.bestFloor}`, CANVAS_WIDTH / 2, 210, '#aaaaaa', 18, 'center');
  renderer.drawText(`Level ${player.level}`, CANVAS_WIDTH / 2, 240, '#aaaaaa', 16, 'center');
  renderer.drawText(`Gold Earned: ${player.gold}`, CANVAS_WIDTH / 2, 265, '#ffdd44', 14, 'center');
  renderer.drawText(`Total Runs: ${meta.totalRuns}`, CANVAS_WIDTH / 2, 290, '#888888', 14, 'center');
  renderer.drawText('[Enter] Try Again', CANVAS_WIDTH / 2, 350, '#ffffff', 16, 'center');
}

function renderVictory(renderer: Renderer, player: Player, meta: MetaSave): void {
  renderer.drawText('VICTORY!', CANVAS_WIDTH / 2, 120, '#ffdd44', 44, 'center');
  renderer.drawText('You defeated Malachar the Undying!', CANVAS_WIDTH / 2, 180, '#ffffff', 18, 'center');
  renderer.drawText(`Level ${player.level}  |  Floor ${meta.bestFloor}`, CANVAS_WIDTH / 2, 220, '#aaaaaa', 16, 'center');
  renderer.drawText(`Total Runs: ${meta.totalRuns}`, CANVAS_WIDTH / 2, 250, '#888888', 14, 'center');
  renderer.drawText('[Enter] Play Again', CANVAS_WIDTH / 2, 330, '#ffffff', 16, 'center');
}

function renderHub(renderer: Renderer, menu: MenuState, player: Player, meta: MetaSave): void {
  renderer.drawText('ARCANIA', CANVAS_WIDTH / 2, 80, '#cc88ff', 48, 'center');
  renderer.drawText('The Endless Dungeon', CANVAS_WIDTH / 2, 130, '#8866aa', 18, 'center');

  renderer.drawText(`Best Floor: ${meta.bestFloor}`, CANVAS_WIDTH / 2, 200, '#aaaaaa', 14, 'center');
  renderer.drawText(`Total Runs: ${meta.totalRuns}`, CANVAS_WIDTH / 2, 220, '#aaaaaa', 14, 'center');
  renderer.drawText(`Magic Types: ${meta.unlockedMagics.length}/15`, CANVAS_WIDTH / 2, 240, '#aaaaaa', 14, 'center');
  renderer.drawText(`Combos Discovered: ${meta.discoveredCombos.length}`, CANVAS_WIDTH / 2, 258, '#aaaaaa', 14, 'center');
  renderer.drawText(`Recipes Discovered: ${meta.discoveredRecipes.length}`, CANVAS_WIDTH / 2, 260, '#aaaaaa', 14, 'center');

  const options = ['Enter the Dungeon'];
  menu.selectedIndex = Math.min(menu.selectedIndex, options.length - 1);

  for (let i = 0; i < options.length; i++) {
    const y = 320 + i * 35;
    const isSelected = i === menu.selectedIndex;
    renderer.drawText(
      `${isSelected ? '> ' : '  '}${options[i]}`,
      CANVAS_WIDTH / 2, y,
      isSelected ? '#ffffff' : '#888888', 20, 'center'
    );
  }

  renderer.drawText('WASD to move | Mouse to aim | Click to cast', CANVAS_WIDTH / 2, 440, '#555555', 12, 'center');
  renderer.drawText('1-9 to queue magic types | Click to cast combo | Q to clear | I for inventory', CANVAS_WIDTH / 2, 460, '#555555', 12, 'center');
  renderer.drawText('F to interact | ESC to pause', CANVAS_WIDTH / 2, 480, '#555555', 12, 'center');
}
