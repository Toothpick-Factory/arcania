import { Player, removeItemFromInventory, addItemToInventory, getItemCount, applyFoodEffect } from '../entities/player';
import { COOKING_RECIPES, RecipeDef, getFoodEffect } from '../data/items';
import { MetaSave } from './save';

export function getAvailableRecipes(player: Player, meta: MetaSave): RecipeDef[] {
  return COOKING_RECIPES.filter((recipe) => {
    // Player must have discovered this recipe or have all ingredients
    const discovered = meta.discoveredRecipes.includes(recipe.id);
    const hasAll = recipe.ingredients.every((ing) => {
      const needed = recipe.ingredients.filter((i) => i === ing).length;
      return getItemCount(player, ing) >= needed;
    });
    return discovered || hasAll;
  });
}

export function canCook(player: Player, recipe: RecipeDef): boolean {
  // Count required ingredients
  const counts = new Map<string, number>();
  for (const ing of recipe.ingredients) {
    counts.set(ing, (counts.get(ing) || 0) + 1);
  }
  for (const [itemId, needed] of counts) {
    if (getItemCount(player, itemId) < needed) return false;
  }
  return true;
}

export function cook(player: Player, recipe: RecipeDef, meta: MetaSave): boolean {
  if (!canCook(player, recipe)) return false;

  // Remove ingredients
  const counts = new Map<string, number>();
  for (const ing of recipe.ingredients) {
    counts.set(ing, (counts.get(ing) || 0) + 1);
  }
  for (const [itemId, needed] of counts) {
    removeItemFromInventory(player, itemId, needed);
  }

  // Add result
  addItemToInventory(player, recipe.result, recipe.resultCount);

  // Discover recipe
  if (!meta.discoveredRecipes.includes(recipe.id)) {
    meta.discoveredRecipes.push(recipe.id);
  }

  return true;
}

export function eatFood(player: Player, foodId: string): boolean {
  if (getItemCount(player, foodId) <= 0) return false;
  const effect = getFoodEffect(foodId);
  if (!effect) return false;

  removeItemFromInventory(player, foodId, 1);
  applyFoodEffect(player, foodId, effect);
  return true;
}
