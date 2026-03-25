import { create } from 'zustand';
import { UIStore, GameState, UpgradeOption } from './types';

export const useGameStore = create<UIStore>((set) => ({
  hp: 100,
  maxHp: 100,
  xpPercent: 0,
  level: 1,
  gameTime: 0,
  waveNumber: 1,
  isPaused: false,
  isGameOver: false,
  pendingUpgradeChoices: [],

  syncFromGameState: (gs: GameState) =>
    set({
      hp: gs.player.hp,
      maxHp: gs.player.maxHp,
      xpPercent: gs.player.xp / gs.player.xpToNextLevel,
      level: gs.player.level,
      gameTime: gs.gameTime,
      waveNumber: gs.waveNumber,
      isPaused: gs.isPaused,
      isGameOver: gs.isGameOver,
    }),

  setPaused: (v: boolean) =>
    set((state) => {
      // Also update the game state ref — handled in hook
      return { isPaused: v };
    }),

  setUpgradeChoices: (choices: UpgradeOption[]) =>
    set({ pendingUpgradeChoices: choices }),

  clearUpgradeChoices: () => set({ pendingUpgradeChoices: [] }),

  resetUI: () =>
    set({
      hp: 100,
      maxHp: 100,
      xpPercent: 0,
      level: 1,
      gameTime: 0,
      waveNumber: 1,
      isPaused: false,
      isGameOver: false,
      pendingUpgradeChoices: [],
    }),
}));
