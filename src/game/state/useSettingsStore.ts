import { create } from 'zustand';
import { loadSettings, writeSettings, Settings } from '../../services/SaveService';

interface SettingsStore extends Settings {
  isLoaded: boolean;
  load: () => Promise<void>;
  setSoundEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setGraphicsQuality: (v: Settings['graphicsQuality']) => void;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  soundEnabled: true,
  musicEnabled: true,
  graphicsQuality: 'medium',
  isLoaded: false,

  load: async () => {
    const s = await loadSettings();
    set({ ...s, isLoaded: true });
  },

  setSoundEnabled: (v: boolean) => {
    set({ soundEnabled: v });
    const s = get();
    writeSettings({ soundEnabled: v, musicEnabled: s.musicEnabled, graphicsQuality: s.graphicsQuality });
  },

  setMusicEnabled: (v: boolean) => {
    set({ musicEnabled: v });
    const s = get();
    writeSettings({ soundEnabled: s.soundEnabled, musicEnabled: v, graphicsQuality: s.graphicsQuality });
  },

  setGraphicsQuality: (v: Settings['graphicsQuality']) => {
    set({ graphicsQuality: v });
    const s = get();
    writeSettings({ soundEnabled: s.soundEnabled, musicEnabled: s.musicEnabled, graphicsQuality: v });
  },
}));
