import { Renderer } from '../engine/renderer';
import { InputManager } from '../engine/input';
import { Player, getItemCount, removeItemFromInventory } from '../entities/player';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../engine/types';
import { MetaSave, PermanentUpgrades } from '../systems/save';
import { Shop, buyItem } from '../systems/shop';
import { COOKING_RECIPES, getItemDef, getFoodEffect } from '../data/items';
import { canCook, cook, eatFood, getAvailableRecipes } from '../systems/cooking';

export type MenuType = 'none' | 'inventory' | 'shop' | 'cooking' | 'pause' | 'controls' | 'death' | 'victory' | 'hub';

export interface MenuState {
  type: MenuType;
  selectedIndex: number;
  shop?: Shop;
  message?: string;
  messageTimer?: number;
}

export function createMenuState(): MenuState {
  return { type: 'none', selectedIndex: 0 };
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
    if (menu.type === 'controls') {
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
  if (input.isKeyJustPressed('KeyI') && menu.type === 'none') {
    menu.type = 'inventory';
    menu.selectedIndex = 0;
    return null;
  }

  // Navigate
  if (input.isKeyJustPressed('ArrowUp') || input.isKeyJustPressed('KeyW')) {
    if (menu.type !== 'none') menu.selectedIndex = Math.max(0, menu.selectedIndex - 1);
  }
  if (input.isKeyJustPressed('ArrowDown') || input.isKeyJustPressed('KeyS')) {
    if (menu.type !== 'none') menu.selectedIndex++;
  }

  // Actions
  if (input.isKeyJustPressed('Enter') || input.isKeyJustPressed('Space')) {
    return handleMenuAction(menu, player, meta);
  }

  return null;
}

function handleMenuAction(menu: MenuState, player: Player, meta: MetaSave): string | null {
  switch (menu.type) {
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
    case 'cooking': {
      const recipes = getAvailableRecipes(player, meta);
      if (menu.selectedIndex < recipes.length) {
        const success = cook(player, recipes[menu.selectedIndex], meta);
        if (success) {
          menu.message = 'Cooked!';
          menu.messageTimer = 1.5;
        } else {
          menu.message = 'Missing ingredients!';
          menu.messageTimer = 1.5;
        }
      }
      return null;
    }
    case 'inventory': {
      if (menu.selectedIndex < player.inventory.length) {
        const item = player.inventory[menu.selectedIndex];
        const effect = getFoodEffect(item.itemId);
        if (effect) {
          eatFood(player, item.itemId);
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
      if (menu.selectedIndex === 2) return 'restart';
      return null;
    case 'controls':
      menu.type = 'pause';
      menu.selectedIndex = 0;
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
    case 'shop': renderShop(renderer, menu, player); break;
    case 'cooking': renderCooking(renderer, menu, player, meta); break;
    case 'pause': renderPause(renderer, menu); break;
    case 'controls': renderControls(renderer); break;
    case 'death': renderDeath(renderer, player, meta); break;
    case 'victory': renderVictory(renderer, player, meta); break;
    case 'hub': renderHub(renderer, menu, player, meta); break;
  }

  // Toast message
  if (menu.message) {
    renderer.drawText(menu.message, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80, '#ffff44', 16, 'center');
  }
}

function renderInventory(renderer: Renderer, menu: MenuState, player: Player): void {
  const panelX = CANVAS_WIDTH / 2 - 200;
  const panelY = 60;

  renderer.drawRect(panelX, panelY, 400, 450, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, 400, 450, '#444466');
  renderer.drawText('INVENTORY', CANVAS_WIDTH / 2, panelY + 10, '#ffffff', 20, 'center');
  renderer.drawText(`Gold: ${player.gold}`, panelX + 10, panelY + 40, '#ffdd44', 14);

  if (player.inventory.length === 0) {
    renderer.drawText('Empty', CANVAS_WIDTH / 2, panelY + 80, '#888888', 14, 'center');
    return;
  }

  menu.selectedIndex = Math.min(menu.selectedIndex, player.inventory.length - 1);

  for (let i = 0; i < player.inventory.length; i++) {
    const item = player.inventory[i];
    const def = getItemDef(item.itemId);
    if (!def) continue;

    const y = panelY + 65 + i * 24;
    const isSelected = i === menu.selectedIndex;

    if (isSelected) {
      renderer.drawRect(panelX + 5, y - 2, 390, 22, '#333355');
    }

    renderer.drawRect(panelX + 10, y + 2, 10, 10, def.color);
    renderer.drawText(`${def.name} x${item.count}`, panelX + 28, y, isSelected ? '#ffffff' : '#aaaaaa', 13);

    const effect = getFoodEffect(item.itemId);
    if (effect && isSelected) {
      renderer.drawText('[Enter] to consume', panelX + 280, y, '#44ff44', 11);
    }
  }

  renderer.drawText('[ESC] Close  [I] Close', CANVAS_WIDTH / 2, panelY + 430, '#666666', 11, 'center');
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

  renderer.drawRect(panelX, panelY, 400, 400, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, 400, 400, '#ff8844');
  renderer.drawText('COOKING', CANVAS_WIDTH / 2, panelY + 10, '#ff8844', 20, 'center');

  const recipes = getAvailableRecipes(player, meta);
  if (recipes.length === 0) {
    renderer.drawText('No recipes available', CANVAS_WIDTH / 2, panelY + 80, '#888888', 14, 'center');
    renderer.drawText('Find ingredients to discover recipes!', CANVAS_WIDTH / 2, panelY + 100, '#666666', 12, 'center');
    return;
  }

  menu.selectedIndex = Math.min(menu.selectedIndex, recipes.length - 1);

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const y = panelY + 50 + i * 36;
    const isSelected = i === menu.selectedIndex;
    const canMake = canCook(player, recipe);

    if (isSelected) renderer.drawRect(panelX + 5, y - 2, 390, 34, '#333355');

    const resultDef = getItemDef(recipe.result);
    renderer.drawText(recipe.name, panelX + 10, y, canMake ? '#ffffff' : '#666666', 14);

    // Ingredients list
    const ingNames = recipe.ingredients.map((id) => {
      const def = getItemDef(id);
      const has = getItemCount(player, id);
      const need = recipe.ingredients.filter((x) => x === id).length;
      return `${def?.name || id}(${has}/${need})`;
    });
    const uniqueIngs = [...new Set(ingNames)];
    renderer.drawText(uniqueIngs.join(', '), panelX + 10, y + 16, '#888888', 10);

    if (resultDef) {
      renderer.drawRect(panelX + 360, y + 4, 10, 10, resultDef.color);
    }
  }

  renderer.drawText('[Enter] Cook  [ESC] Close', CANVAS_WIDTH / 2, panelY + 380, '#666666', 11, 'center');
}

function renderPause(renderer: Renderer, menu: MenuState): void {
  const panelX = CANVAS_WIDTH / 2 - 140;
  const panelY = CANVAS_HEIGHT / 2 - 100;

  renderer.drawRect(panelX, panelY, 280, 200, '#1a1a2e');
  renderer.drawRectOutline(panelX, panelY, 280, 200, '#666688');
  renderer.drawText('PAUSED', CANVAS_WIDTH / 2, panelY + 15, '#ffffff', 24, 'center');

  const options = ['Resume', 'Controls', 'Quit Run'];
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
  row('Left Click', 'Cast active spell toward cursor');
  row('Q', 'Previous spell');
  row('E', 'Next spell');
  row('1 - 6', 'Select spell by slot');
  row('Shift + Number', '1st element, then Shift + another = combo');

  section('INTERACTION');
  row('F', 'Interact (shops, cooking, stairs)');

  section('MENUS');
  row('I', 'Open / close inventory');
  row('ESC', 'Pause menu / close current menu');
  row('W/S or Up/Down', 'Navigate menu options');
  row('Enter / Space', 'Confirm selection');

  section('TIPS');
  renderer.drawText('Hold Shift + press two different spell numbers to', leftX, y, '#888888', 11);
  y += 16;
  renderer.drawText('DISCOVER new combo spells! They get added to your', leftX, y, '#888888', 11);
  y += 16;
  renderer.drawText('spell bar permanently. Cook food at cooking stations', leftX, y, '#888888', 11);
  y += 16;
  renderer.drawText('for buffs. Defeat the boss on each floor to descend!', leftX, y, '#888888', 11);

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
  renderer.drawText(`Spells Unlocked: ${meta.unlockedSpells.length}/6`, CANVAS_WIDTH / 2, 240, '#aaaaaa', 14, 'center');
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
  renderer.drawText('Q/E or 1-6 to switch spells | Shift+Num+Num to discover combos | I for inventory', CANVAS_WIDTH / 2, 460, '#555555', 12, 'center');
  renderer.drawText('F to interact | ESC to pause', CANVAS_WIDTH / 2, 480, '#555555', 12, 'center');
}
