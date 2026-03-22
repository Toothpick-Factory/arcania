import { describe, it, expect } from 'vitest';
import { generateShop, buyItem, sellItem } from './shop';
import { createPlayer, addItemToInventory, getItemCount } from '../entities/player';

describe('Shop system', () => {
  it('generates shop with items', () => {
    const shop = generateShop(1);
    expect(shop.items.length).toBeGreaterThan(0);
  });

  it('shop items have prices', () => {
    const shop = generateShop(1);
    for (const item of shop.items) {
      expect(item.price).toBeGreaterThan(0);
      expect(item.stock).toBeGreaterThan(0);
    }
  });

  it('buying reduces gold and adds item', () => {
    const p = createPlayer();
    p.gold = 100;
    const shop = generateShop(1);

    const success = buyItem(p, shop, 0);
    expect(success).toBe(true);
    expect(p.gold).toBeLessThan(100);
    expect(getItemCount(p, shop.items[0].item.id)).toBe(1);
    expect(shop.items[0].stock).toBeLessThan(generateShop(1).items[0]?.stock || Infinity);
  });

  it('cannot buy without enough gold', () => {
    const p = createPlayer();
    p.gold = 0;
    const shop = generateShop(1);

    expect(buyItem(p, shop, 0)).toBe(false);
  });

  it('selling gives gold', () => {
    const p = createPlayer();
    addItemToInventory(p, 'herb_green', 1);

    const success = sellItem(p, 'herb_green');
    expect(success).toBe(true);
    expect(p.gold).toBeGreaterThan(0);
    expect(getItemCount(p, 'herb_green')).toBe(0);
  });
});
