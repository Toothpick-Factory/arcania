export type ItemCategory = 'ingredient' | 'food' | 'material' | 'equipment' | 'consumable';

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  stackable: boolean;
  maxStack: number;
  value: number; // gold value
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  minFloor: number;
}

export interface FoodEffect {
  healAmount?: number;
  maxHpBonus?: number;
  manaRegenBonus?: number;
  speedBonus?: number;
  damageBonus?: number;
  duration?: number; // seconds, 0 = permanent for run
}

export interface RecipeDef {
  id: string;
  name: string;
  ingredients: string[]; // item ids
  result: string; // item id
  resultCount: number;
  category: 'cooking' | 'crafting';
}

// Ingredients
export const INGREDIENTS: ItemDef[] = [
  { id: 'herb_green', name: 'Green Herb', description: 'A common healing herb', category: 'ingredient', stackable: true, maxStack: 20, value: 3, color: '#44aa44', rarity: 'common', minFloor: 1 },
  { id: 'herb_red', name: 'Red Herb', description: 'A spicy herb that invigorates', category: 'ingredient', stackable: true, maxStack: 20, value: 5, color: '#cc4444', rarity: 'common', minFloor: 1 },
  { id: 'mushroom', name: 'Cave Mushroom', description: 'A bioluminescent mushroom', category: 'ingredient', stackable: true, maxStack: 20, value: 4, color: '#ccaa88', rarity: 'common', minFloor: 1 },
  { id: 'meat_raw', name: 'Raw Meat', description: 'Fresh meat from dungeon creatures', category: 'ingredient', stackable: true, maxStack: 10, value: 8, color: '#cc6666', rarity: 'common', minFloor: 1 },
  { id: 'crystal_water', name: 'Water Crystal', description: 'Crystallized pure water', category: 'ingredient', stackable: true, maxStack: 15, value: 10, color: '#66aaff', rarity: 'uncommon', minFloor: 2 },
  { id: 'ember_root', name: 'Ember Root', description: 'A root that radiates heat', category: 'ingredient', stackable: true, maxStack: 15, value: 12, color: '#ff8844', rarity: 'uncommon', minFloor: 2 },
  { id: 'frost_berry', name: 'Frost Berry', description: 'An icy berry from deep caves', category: 'ingredient', stackable: true, maxStack: 15, value: 12, color: '#88ccff', rarity: 'uncommon', minFloor: 3 },
  { id: 'thunder_spice', name: 'Thunder Spice', description: 'A spice that crackles with energy', category: 'ingredient', stackable: true, maxStack: 10, value: 18, color: '#ffff44', rarity: 'rare', minFloor: 4 },
  { id: 'dragon_pepper', name: 'Dragon Pepper', description: 'Extremely hot and extremely rare', category: 'ingredient', stackable: true, maxStack: 5, value: 30, color: '#ff2200', rarity: 'rare', minFloor: 5 },
  { id: 'starlight_salt', name: 'Starlight Salt', description: 'Salt that glows with celestial light', category: 'ingredient', stackable: true, maxStack: 5, value: 50, color: '#ffeeaa', rarity: 'epic', minFloor: 6 },
];

// Cooked foods
export const FOODS: (ItemDef & { effect: FoodEffect })[] = [
  { id: 'cooked_meat', name: 'Cooked Meat', description: 'Simple but nourishing', category: 'food', stackable: true, maxStack: 5, value: 15, color: '#aa6644', rarity: 'common', minFloor: 1, effect: { healAmount: 30 } },
  { id: 'herb_soup', name: 'Herb Soup', description: 'A restorative soup', category: 'food', stackable: true, maxStack: 5, value: 20, color: '#66aa66', rarity: 'common', minFloor: 1, effect: { healAmount: 50, manaRegenBonus: 1, duration: 30 } },
  { id: 'spicy_stew', name: 'Spicy Stew', description: 'A fiery stew that boosts attack', category: 'food', stackable: true, maxStack: 3, value: 35, color: '#cc6633', rarity: 'uncommon', minFloor: 1, effect: { healAmount: 40, damageBonus: 10, duration: 45 } },
  { id: 'frost_salad', name: 'Frost Salad', description: 'Chilling salad that quickens reflexes', category: 'food', stackable: true, maxStack: 3, value: 40, color: '#88ccdd', rarity: 'uncommon', minFloor: 1, effect: { healAmount: 30, speedBonus: 20, duration: 40 } },
  { id: 'thunder_cake', name: 'Thunder Cake', description: 'Electrifying dessert', category: 'food', stackable: true, maxStack: 2, value: 60, color: '#ffdd44', rarity: 'rare', minFloor: 1, effect: { healAmount: 60, damageBonus: 15, speedBonus: 10, duration: 60 } },
  { id: 'dragon_feast', name: 'Dragon Feast', description: 'A legendary meal of immense power', category: 'food', stackable: true, maxStack: 1, value: 150, color: '#ff4400', rarity: 'epic', minFloor: 1, effect: { healAmount: 100, maxHpBonus: 50, damageBonus: 20, speedBonus: 15, duration: 120 } },
];

// Crafting materials
export const MATERIALS: ItemDef[] = [
  { id: 'iron_ore', name: 'Iron Ore', description: 'Common metal ore', category: 'material', stackable: true, maxStack: 20, value: 5, color: '#888888', rarity: 'common', minFloor: 1 },
  { id: 'leather', name: 'Leather', description: 'Tanned hide', category: 'material', stackable: true, maxStack: 20, value: 6, color: '#886644', rarity: 'common', minFloor: 1 },
  { id: 'magic_dust', name: 'Magic Dust', description: 'Residue of spent magic', category: 'material', stackable: true, maxStack: 20, value: 10, color: '#cc88ff', rarity: 'uncommon', minFloor: 2 },
  { id: 'mithril_ore', name: 'Mithril Ore', description: 'Rare and strong metal', category: 'material', stackable: true, maxStack: 10, value: 25, color: '#aaccff', rarity: 'rare', minFloor: 4 },
  { id: 'dragon_scale', name: 'Dragon Scale', description: 'Nearly indestructible', category: 'material', stackable: true, maxStack: 5, value: 80, color: '#cc2222', rarity: 'epic', minFloor: 6 },
];

// Recipes
export const COOKING_RECIPES: RecipeDef[] = [
  { id: 'r_cooked_meat', name: 'Cooked Meat', ingredients: ['meat_raw'], result: 'cooked_meat', resultCount: 1, category: 'cooking' },
  { id: 'r_herb_soup', name: 'Herb Soup', ingredients: ['herb_green', 'herb_green', 'crystal_water'], result: 'herb_soup', resultCount: 1, category: 'cooking' },
  { id: 'r_spicy_stew', name: 'Spicy Stew', ingredients: ['meat_raw', 'herb_red', 'ember_root'], result: 'spicy_stew', resultCount: 1, category: 'cooking' },
  { id: 'r_frost_salad', name: 'Frost Salad', ingredients: ['herb_green', 'frost_berry', 'crystal_water'], result: 'frost_salad', resultCount: 1, category: 'cooking' },
  { id: 'r_thunder_cake', name: 'Thunder Cake', ingredients: ['mushroom', 'thunder_spice', 'crystal_water'], result: 'thunder_cake', resultCount: 1, category: 'cooking' },
  { id: 'r_dragon_feast', name: 'Dragon Feast', ingredients: ['meat_raw', 'dragon_pepper', 'starlight_salt', 'ember_root'], result: 'dragon_feast', resultCount: 1, category: 'cooking' },
];

export const ALL_ITEMS: ItemDef[] = [
  ...INGREDIENTS,
  ...FOODS,
  ...MATERIALS,
];

export function getItemDef(id: string): ItemDef | undefined {
  return ALL_ITEMS.find((item) => item.id === id);
}

export function getFoodEffect(id: string): FoodEffect | undefined {
  const food = FOODS.find((f) => f.id === id);
  return food?.effect;
}

export function getIngredientsForFloor(floor: number): ItemDef[] {
  return INGREDIENTS.filter((i) => i.minFloor <= floor);
}
