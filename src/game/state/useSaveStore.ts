import { create } from 'zustand';
import { loadSave, writeSave, SaveData, PurchasedUpgrades, RunRecord } from '../../services/SaveService';
import { CharacterId } from './types';

const UPGRADE_BASE_COST = { maxHp: 80, damage: 100, armor: 120, speed: 90 };
const UPGRADE_INCREASE  = { maxHp: 40, damage: 50,  armor: 60,  speed: 45 };
const UPGRADE_MAX_LEVEL = 5;

export function upgradeCost(key: keyof PurchasedUpgrades, currentLevel: number): number {
  return UPGRADE_BASE_COST[key] + currentLevel * UPGRADE_INCREASE[key];
}

interface SaveStore extends SaveData {
  isLoaded: boolean;
  load: () => Promise<void>;
  recordGame: (wave: number, time: number, gold: number, bossKilled: boolean, survived300: boolean, characterId: CharacterId, kills: number) => Promise<void>;
  markTutorialDone: () => Promise<void>;
  unlockAchievements: (ids: string[]) => Promise<void>;
  buyUpgrade: (key: keyof PurchasedUpgrades) => Promise<boolean>;
}

export const useSaveStore = create<SaveStore>((set, get) => ({
  highestWave: 0,
  totalGames: 0,
  bestTime: 0,
  tutorialCompleted: false,
  achievements: [],
  totalGold: 0,
  currentGoldBalance: 0,
  purchasedUpgrades: { maxHp: 0, damage: 0, armor: 0, speed: 0 },
  unlockedCharacters: ['warrior'],
  runHistory: [],
  isLoaded: false,

  load: async () => {
    const s = await loadSave();
    set({ ...s, isLoaded: true });
  },

  recordGame: async (wave, time, gold, bossKilled, survived300, characterId, kills) => {
    const cur = get();
    const newUnlocked: CharacterId[] = [];

    if (wave >= 4 && !cur.unlockedCharacters.includes('mage')) newUnlocked.push('mage');
    if (bossKilled && !cur.unlockedCharacters.includes('healer')) newUnlocked.push('healer');
    if (survived300 && !cur.unlockedCharacters.includes('hunter')) newUnlocked.push('hunter');

    const newRun: RunRecord = { wave, time, characterId, kills, gold, date: Date.now() };
    const runHistory = [newRun, ...cur.runHistory].slice(0, 5);

    const next: SaveData = {
      highestWave: Math.max(cur.highestWave, wave),
      totalGames: cur.totalGames + 1,
      bestTime: Math.max(cur.bestTime, time),
      tutorialCompleted: cur.tutorialCompleted,
      achievements: cur.achievements,
      totalGold: cur.totalGold + gold,
      currentGoldBalance: cur.currentGoldBalance + gold,
      purchasedUpgrades: cur.purchasedUpgrades,
      unlockedCharacters: [...cur.unlockedCharacters, ...newUnlocked],
      runHistory,
    };
    set(next);
    await writeSave(next);
  },

  markTutorialDone: async () => {
    const cur = get();
    if (cur.tutorialCompleted) return;
    const next: SaveData = { ...cur, tutorialCompleted: true };
    set({ tutorialCompleted: true });
    await writeSave(next);
  },

  unlockAchievements: async (ids: string[]) => {
    if (ids.length === 0) return;
    const cur = get();
    const merged = Array.from(new Set([...cur.achievements, ...ids]));
    const next: SaveData = { ...cur, achievements: merged };
    set({ achievements: merged });
    await writeSave(next);
  },

  buyUpgrade: async (key) => {
    const cur = get();
    const level = cur.purchasedUpgrades[key];
    if (level >= UPGRADE_MAX_LEVEL) return false;
    const cost = upgradeCost(key, level);
    if (cur.currentGoldBalance < cost) return false;

    const next: SaveData = {
      ...cur,
      currentGoldBalance: cur.currentGoldBalance - cost,
      purchasedUpgrades: { ...cur.purchasedUpgrades, [key]: level + 1 },
    };
    set(next);
    await writeSave(next);
    return true;
  },
}));
