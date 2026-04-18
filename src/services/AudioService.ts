import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// ─── Konfigürasyon ────────────────────────────────────────────────────────────
// assets/audio/ klasörüne ses dosyalarını ekledikten sonra true yap
const AUDIO_READY = false;

// ─── Ses dosyaları (AUDIO_READY = true olduğunda aktif) ──────────────────────
// const SOUNDS = {
//   bgMusic:    require('../../assets/audio/bgmusic.mp3'),
//   hit:        require('../../assets/audio/hit.mp3'),
//   levelUp:    require('../../assets/audio/levelup.mp3'),
//   kill:       require('../../assets/audio/kill.mp3'),
//   gemCollect: require('../../assets/audio/gemcollect.mp3'),
// };

// ─── State ───────────────────────────────────────────────────────────────────
let bgMusic: Audio.Sound | null = null;
let sfxPool: Record<string, Audio.Sound | null> = {};
let soundEnabled = true;
let musicEnabled = true;
let initialized = false;

export async function initAudio(
  opts: { soundEnabled: boolean; musicEnabled: boolean }
): Promise<void> {
  if (!AUDIO_READY) return;
  if (initialized) return;

  soundEnabled = opts.soundEnabled;
  musicEnabled = opts.musicEnabled;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    initialized = true;
  } catch {}
}

export async function playBgMusic(): Promise<void> {
  if (!AUDIO_READY || !musicEnabled) return;
  try {
    if (bgMusic) {
      await bgMusic.playAsync();
      return;
    }
    // const { sound } = await Audio.Sound.createAsync(SOUNDS.bgMusic, {
    //   isLooping: true, volume: 0.4,
    // });
    // bgMusic = sound;
    // await sound.playAsync();
  } catch {}
}

export async function stopBgMusic(): Promise<void> {
  if (!bgMusic) return;
  try {
    await bgMusic.stopAsync();
  } catch {}
}

export async function pauseBgMusic(): Promise<void> {
  if (!bgMusic) return;
  try {
    await bgMusic.pauseAsync();
  } catch {}
}

export async function resumeBgMusic(): Promise<void> {
  if (!AUDIO_READY || !musicEnabled) return;
  if (!bgMusic) return;
  try {
    await bgMusic.playAsync();
  } catch {}
}

export function setSoundEnabled(v: boolean): void {
  soundEnabled = v;
}

export function setMusicEnabled(v: boolean): void {
  musicEnabled = v;
  if (!v) stopBgMusic();
  else resumeBgMusic();
}

export async function unloadAll(): Promise<void> {
  try {
    if (bgMusic) { await bgMusic.unloadAsync(); bgMusic = null; }
    for (const key in sfxPool) {
      if (sfxPool[key]) { await sfxPool[key]!.unloadAsync(); sfxPool[key] = null; }
    }
  } catch {}
}

// ─── SFX (one-shot, pool of Sound objects) ───────────────────────────────────

async function playSfx(_asset: unknown, volume = 1.0): Promise<void> {
  if (!AUDIO_READY || !soundEnabled) return;
  try {
    // const { sound } = await Audio.Sound.createAsync(_asset as AVPlaybackSource, {
    //   volume, shouldPlay: true,
    // });
    // sound.setOnPlaybackStatusUpdate(status => {
    //   if (status.isLoaded && status.didJustFinish) sound.unloadAsync();
    // });
  } catch {}
}

export function playSfxHit():        void { playSfx(null, 0.7); }
export function playSfxLevelUp():    void { playSfx(null, 1.0); }
export function playSfxKill():       void { playSfx(null, 0.5); }
export function playSfxGemCollect(): void { playSfx(null, 0.4); }

// ─── Haptics ──────────────────────────────────────────────────────────────────
export function hapticHeavy():     void { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {}); }
export function hapticMedium():    void { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); }
export function hapticSelection(): void { Haptics.selectionAsync().catch(() => {}); }
export function hapticSuccess():   void { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); }
