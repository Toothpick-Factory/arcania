import { describe, it, expect } from 'vitest';
import { canCook, cook, eatFood, getAvailableRecipes } from './cooking';
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

describe('getAvailableRecipes', () => {
  it('returns recipes when player has all ingredients', () => {
    const p = createPlayer();
    const meta = getDefaultMeta();
    addItemToInventory(p, 'meat_raw', 1);

    const available = getAvailableRecipes(p, meta);
    const ids = available.map((r) => r.id);
    expect(ids).toContain('r_cooked_meat');
  });

  it('returns no recipes when player has no ingredients and none discovered', () => {
    const p = createPlayer();
    const meta = getDefaultMeta();

    const available = getAvailableRecipes(p, meta);
    expect(available.length).toBe(0);
  });

  it('returns discovered recipes even without ingredients', () => {
    const p = createPlayer();
    const meta = getDefaultMeta();
    meta.discoveredRecipes.push('r_cooked_meat');

    const available = getAvailableRecipes(p, meta);
    const ids = available.map((r) => r.id);
    expect(ids).toContain('r_cooked_meat');
  });

  it('canCook returns false for discovered recipe without ingredients', () => {
    const p = createPlayer();
    const recipe = COOKING_RECIPES.find((r) => r.id === 'r_cooked_meat')!;
    expect(canCook(p, recipe)).toBe(false);
  });

  it('cook returns false when ingredients are missing', () => {
    const p = createPlayer();
    const meta = getDefaultMeta();
    const recipe = COOKING_RECIPES.find((r) => r.id === 'r_cooked_meat')!;
    expect(cook(p, recipe, meta)).toBe(false);
  });

  it('handles multi-ingredient recipes correctly', () => {
    const p = createPlayer();
    const meta = getDefaultMeta();
    // herb_soup needs 2x herb_green + 1x crystal_water
    addItemToInventory(p, 'herb_green', 2);
    addItemToInventory(p, 'crystal_water', 1);

    const recipe = COOKING_RECIPES.find((r) => r.id === 'r_herb_soup')!;
    expect(canCook(p, recipe)).toBe(true);

    const success = cook(p, recipe, meta);
    expect(success).toBe(true);
    expect(getItemCount(p, 'herb_green')).toBe(0);
    expect(getItemCount(p, 'crystal_water')).toBe(0);
    expect(getItemCount(p, 'herb_soup')).toBe(1);
  });

  it('canCook fails with insufficient quantity of duplicate ingredients', () => {
    const p = createPlayer();
    // herb_soup needs 2x herb_green, only have 1
    addItemToInventory(p, 'herb_green', 1);
    addItemToInventory(p, 'crystal_water', 1);

    const recipe = COOKING_RECIPES.find((r) => r.id === 'r_herb_soup')!;
    expect(canCook(p, recipe)).toBe(false);
  });
});
