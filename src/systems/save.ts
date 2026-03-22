import { Player } from '../entities/player';
import { MagicType } from '../data/spells';

const SAVE_KEY = 'arcania_save';

export interface MetaSave {
  totalRuns: number;
  bestFloor: number;
  totalGoldEarned: number;
  unlockedMagics: MagicType[];
  discoveredCombos: string[];
  discoveredRecipes: string[];
  permanentUpgrades: PermanentUpgrades;
  lastSaveTime: number;
}

export interface PermanentUpgrades {
  maxHpBonus: number;
  maxManaBonus: number;
  damageBonus: number;
  speedBonus: number;
  manaRegenBonus: number;
}

export function getDefaultMeta(): MetaSave {
  return {
    totalRuns: 0,
    bestFloor: 0,
    totalGoldEarned: 0,
    unlockedMagics: ['fire', 'arcane'],
    discoveredCombos: [],
    discoveredRecipes: [],
    permanentUpgrades: {
      maxHpBonus: 0,
      maxManaBonus: 0,
      damageBonus: 0,
      speedBonus: 0,
      manaRegenBonus: 0,
    },
    lastSaveTime: Date.now(),
  };
}

export function saveMetaProgress(meta: MetaSave): void {
  try {
    meta.lastSaveTime = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(meta));
  } catch {
    console.warn('Failed to save progress');
  }
}

export function loadMetaProgress(): MetaSave {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
      return { ...getDefaultMeta(), ...JSON.parse(data) };
    }
  } catch {
    console.warn('Failed to load save, starting fresh');
  }
  return getDefaultMeta();
}

export function updateMetaFromRun(meta: MetaSave, player: Player, floor: number): void {
  meta.totalRuns++;
  meta.bestFloor = Math.max(meta.bestFloor, floor);
  meta.totalGoldEarned += player.gold;

  for (const magic of player.magics) {
    if (!meta.unlockedMagics.includes(magic.magicType as MagicType)) {
      meta.unlockedMagics.push(magic.magicType as MagicType);
    }
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
