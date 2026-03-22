import { Player, addItemToInventory, removeItemFromInventory, getItemCount } from '../entities/player';
import { ItemDef, getItemDef, getIngredientsForFloor, MATERIALS } from '../data/items';
import { randomChoice, randomInt } from '../utils/math';

export interface ShopItem {
  item: ItemDef;
  price: number;
  stock: number;
}

export interface Shop {
  items: ShopItem[];
  floor: number;
}

export function generateShop(floor: number): Shop {
  const ingredients = getIngredientsForFloor(floor);
  const items: ShopItem[] = [];

  // 3-5 ingredient offerings
  const count = randomInt(3, 5);
  const available = [...ingredients];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = randomInt(0, available.length - 1);
    const item = available.splice(idx, 1)[0];
    items.push({
      item,
      price: Math.round(item.value * (1 + floor * 0.1)),
      stock: randomInt(1, 3),
    });
  }

  // Maybe add a material
  const floorMats = MATERIALS.filter((m) => m.minFloor <= floor);
  if (floorMats.length > 0) {
    const mat = randomChoice(floorMats);
    items.push({
      item: mat,
      price: Math.round(mat.value * (1 + floor * 0.1)),
      stock: randomInt(1, 2),
    });
  }

  return { items, floor };
}

export function buyItem(player: Player, shop: Shop, index: number): boolean {
  if (index < 0 || index >= shop.items.length) return false;
  const shopItem = shop.items[index];
  if (shopItem.stock <= 0) return false;
  if (player.gold < shopItem.price) return false;

  player.gold -= shopItem.price;
  addItemToInventory(player, shopItem.item.id, 1);
  shopItem.stock--;
  return true;
}

export function sellItem(player: Player, itemId: string): boolean {
  const def = getItemDef(itemId);
  if (!def) return false;
  if (getItemCount(player, itemId) <= 0) return false;

  removeItemFromInventory(player, itemId, 1);
  player.gold += Math.floor(def.value * 0.5);
  return true;
}
