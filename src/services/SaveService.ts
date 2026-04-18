import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVE_KEY = '@mygame_save';
const SETTINGS_KEY = '@mygame_settings';

export interface SaveData {
  highestWave: number;
  totalGames: number;
  bestTime: number; // seconds
  tutorialCompleted: boolean;
  achievements: string[];
}

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
}

const DEFAULT_SAVE: SaveData = {
  highestWave: 0,
  totalGames: 0,
  bestTime: 0,
  tutorialCompleted: false,
  achievements: [],
};
const DEFAULT_SETTINGS: Settings = { soundEnabled: true, musicEnabled: true, graphicsQuality: 'medium' };

export async function loadSave(): Promise<SaveData> {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    return raw ? { ...DEFAULT_SAVE, ...JSON.parse(raw) } : DEFAULT_SAVE;
  } catch {
    return DEFAULT_SAVE;
  }
}

export async function writeSave(data: SaveData): Promise<void> {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {}
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function writeSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
