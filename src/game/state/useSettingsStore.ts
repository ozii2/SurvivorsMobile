import { create } from 'zustand';
import { loadSettings, writeSettings, Settings } from '../../services/SaveService';

interface SettingsStore extends Settings {
  isLoaded: boolean;
  load: () => Promise<void>;
  setSoundEnabled: (v: boolean) => void;
  setMusicEnabled: (v: boolean) => void;
  setGraphicsQuality: (v: Settings['graphicsQuality']) => void;
  setAdsRemoved: (v: boolean) => void;
}

function persist(s: Settings): void {
  writeSettings({
    soundEnabled: s.soundEnabled,
    musicEnabled: s.musicEnabled,
    graphicsQuality: s.graphicsQuality,
    adsRemoved: s.adsRemoved,
  });
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  soundEnabled: true,
  musicEnabled: true,
  graphicsQuality: 'medium',
  adsRemoved: false,
  isLoaded: false,

  load: async () => {
    const s = await loadSettings();
    set({ ...s, isLoaded: true });
  },

  setSoundEnabled: (v: boolean) => {
    set({ soundEnabled: v });
    persist(get());
  },

  setMusicEnabled: (v: boolean) => {
    set({ musicEnabled: v });
    persist(get());
  },

  setGraphicsQuality: (v: Settings['graphicsQuality']) => {
    set({ graphicsQuality: v });
    persist(get());
  },

  setAdsRemoved: (v: boolean) => {
    set({ adsRemoved: v });
    persist(get());
  },
}));
