import { create } from 'zustand';
import { loadSave, writeSave, SaveData } from '../../services/SaveService';

interface SaveStore extends SaveData {
  isLoaded: boolean;
  load: () => Promise<void>;
  recordGame: (wave: number, time: number) => Promise<void>;
  markTutorialDone: () => Promise<void>;
  unlockAchievements: (ids: string[]) => Promise<void>;
}

export const useSaveStore = create<SaveStore>((set, get) => ({
  highestWave: 0,
  totalGames: 0,
  bestTime: 0,
  tutorialCompleted: false,
  achievements: [],
  isLoaded: false,

  load: async () => {
    const s = await loadSave();
    set({ ...s, isLoaded: true });
  },

  recordGame: async (wave: number, time: number) => {
    const cur = get();
    const next: SaveData = {
      highestWave: Math.max(cur.highestWave, wave),
      totalGames: cur.totalGames + 1,
      bestTime: Math.max(cur.bestTime, time),
      tutorialCompleted: cur.tutorialCompleted,
      achievements: cur.achievements,
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
}));
