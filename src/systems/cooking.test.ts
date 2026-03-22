import { describe, it, expect } from 'vitest';
import { canCook, cook, eatFood } from './cooking';
import { createPlayer, addItemToInventory, getItemCount } from '../entities/player';
import { COOKING_RECIPES } from '../data/items';
import { getDefaultMeta } from './save';

describe('Cooking system', () => {
  it('can cook when ingredients available', () => {
    const p = createPlayer();
    addItemToInventory(p, 'meat_raw', 1);
    const recipe = COOKING_RECIPES.find((r) => r.id === 'r_cooked_meat')!;
    expect(canCook(p, recipe)).toBe(true);
  });

  it('cannot cook without ingredients', () => {
    const p = createPlayer();
    const recipe = COOKING_RECIPES.find((r) => r.id === 'r_cooked_meat')!;
    expect(canCook(p, recipe)).toBe(false);
  });

  it('cooking consumes ingredients and produces result', () => {
    const p = createPlayer();
    const meta = getDefaultMeta();
    addItemToInventory(p, 'meat_raw', 2);
    const recipe = COOKING_RECIPES.find((r) => r.id === 'r_cooked_meat')!;

    const success = cook(p, recipe, meta);
    expect(success).toBe(true);
    expect(getItemCount(p, 'meat_raw')).toBe(1);
    expect(getItemCount(p, 'cooked_meat')).toBe(1);
  });

  it('cooking discovers recipe in meta', () => {
    const p = createPlayer();
    const meta = getDefaultMeta();
    addItemToInventory(p, 'meat_raw', 1);
    const recipe = COOKING_RECIPES.find((r) => r.id === 'r_cooked_meat')!;

    cook(p, recipe, meta);
    expect(meta.discoveredRecipes).toContain('r_cooked_meat');
  });

  it('eating food heals player', () => {
    const p = createPlayer();
    p.hp = 50;
    addItemToInventory(p, 'cooked_meat', 1);

    const success = eatFood(p, 'cooked_meat');
    expect(success).toBe(true);
    expect(p.hp).toBe(80); // cooked_meat heals 30
    expect(getItemCount(p, 'cooked_meat')).toBe(0);
  });

  it('cannot eat food you do not have', () => {
    const p = createPlayer();
    expect(eatFood(p, 'cooked_meat')).toBe(false);
  });
});
