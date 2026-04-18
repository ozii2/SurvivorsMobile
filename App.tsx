import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useKeepAwake } from 'expo-keep-awake';

import { GameCanvas } from './src/rendering/GameCanvas';
import { VirtualJoystick } from './src/ui/VirtualJoystick';
import { LevelUpModal } from './src/ui/LevelUpModal';
import { HUDOverlay } from './src/ui/HUDOverlay';
import { SettingsModal } from './src/ui/SettingsModal';
import { PostGameStats } from './src/ui/PostGameStats';
import { TutorialOverlay } from './src/ui/TutorialOverlay';
import { CharacterSelectScreen } from './src/ui/CharacterSelectScreen';
import { useGameEngine } from './src/hooks/useGameEngine';
import { useGameStore } from './src/game/state/useGameStore';
import { useSaveStore } from './src/game/state/useSaveStore';
import { useSettingsStore } from './src/game/state/useSettingsStore';
import { UpgradeOption, CharacterId } from './src/game/state/types';
import {
  initAudio, playBgMusic, stopBgMusic, pauseBgMusic, resumeBgMusic,
  playSfxHit, playSfxLevelUp, setSoundEnabled, setMusicEnabled,
  hapticSuccess, hapticSelection,
} from './src/services/AudioService';
import { checkAchievements } from './src/services/AchievementService';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Game Screen ─────────────────────────────────────────────────────────────

function GameScreen({
  onExit,
  playerPhoto,
  bodyColor,
  glowRgb,
  startCharacter,
}: {
  onExit: () => void;
  playerPhoto: string | null;
  bodyColor: string;
  glowRgb: string;
  startCharacter: CharacterId;
}) {
  useKeepAwake();
  const { width, height } = useWindowDimensions();
  const {
    gameStateRef,
    joystickX,
    joystickY,
    handleLevelUp,
    chooseUpgrade: _chooseUpgrade,
    pauseGame,
    restartGame,
  } = useGameEngine(startCharacter);

  const chooseUpgrade = useCallback((choice: UpgradeOption) => {
    hapticSelection();
    playSfxLevelUp();
    _chooseUpgrade(choice);
  }, [_chooseUpgrade]);

  const pendingChoices = useGameStore(s => s.pendingUpgradeChoices);
  const isGameOver = useGameStore(s => s.isGameOver);
  const isPaused = useGameStore(s => s.isPaused);
  const level = useGameStore(s => s.level);
  const waveNumber = useGameStore(s => s.waveNumber);
  const gameTime = useGameStore(s => s.gameTime);
  const maxComboFromStore = useGameStore(s => s.maxComboThisRun);
  const hp = useGameStore(s => s.hp);
  const recordGame = useSaveStore(s => s.recordGame);
  const unlockAchievements = useSaveStore(s => s.unlockAchievements);
  const saveData = useSaveStore(s => s);
  const tutorialCompleted = useSaveStore(s => s.tutorialCompleted);
  const isLoaded = useSaveStore(s => s.isLoaded);

  const [runAchievements, setRunAchievements] = useState<string[]>([]);
  const soundOn = useSettingsStore(s => s.soundEnabled);
  const musicOn = useSettingsStore(s => s.musicEnabled);

  const showTutorial = isLoaded && !tutorialCompleted;

  // Sync audio settings
  useEffect(() => { setSoundEnabled(soundOn); }, [soundOn]);
  useEffect(() => { setMusicEnabled(musicOn); }, [musicOn]);

  // Start music on mount, stop on unmount
  useEffect(() => {
    playBgMusic();
    return () => { stopBgMusic(); };
  }, []);

  // Pause/resume music with game pause
  useEffect(() => {
    if (isPaused) pauseBgMusic();
    else resumeBgMusic();
  }, [isPaused]);

  // Hit sound on HP decrease
  const prevHpRef = React.useRef(hp);
  useEffect(() => {
    if (hp < prevHpRef.current && !isGameOver) playSfxHit();
    prevHpRef.current = hp;
  }, [hp, isGameOver]);

  // Save stats + check achievements on game over
  useEffect(() => {
    if (isGameOver) {
      recordGame(waveNumber, gameTime);
      const gs = gameStateRef.current;
      const newAchievements = checkAchievements(gs, saveData);
      if (newAchievements.length > 0) {
        unlockAchievements(newAchievements);
        setRunAchievements(newAchievements);
      } else {
        setRunAchievements([]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameOver]);

  const handleGameOver = useCallback(() => {
    // Zustand sync zaten game over state'ini güncelledi; overlay buna göre gösterilir
  }, []);

  const handleRestart = useCallback(() => {
    restartGame();
  }, [restartGame]);

  return (
    <View style={styles.gameContainer}>
      <GameCanvas
        gameStateRef={gameStateRef}
        joystickX={joystickX}
        joystickY={joystickY}
        screenW={width}
        screenH={height}
        onLevelUp={handleLevelUp}
        onGameOver={handleGameOver}
        playerPhoto={playerPhoto}
        bodyColor={bodyColor}
        glowRgb={glowRgb}
      />

      {/* Joystick overlay */}
      <View style={styles.joystickArea} pointerEvents="box-none">
        <VirtualJoystick joystickX={joystickX} joystickY={joystickY} />
      </View>

      {/* HUD overlay (pause button & wave counter) */}
      <HUDOverlay onPause={pauseGame} />

      {/* Tutorial — sadece ilk oyunda gösterilir */}
      {showTutorial && (
        <TutorialOverlay onDone={() => {}} />
      )}

      {/* Level-up modal */}
      <LevelUpModal
        visible={pendingChoices.length > 0}
        choices={pendingChoices}
        onChoose={chooseUpgrade}
      />

      {/* Pause menu */}
      {isPaused && !isGameOver && pendingChoices.length === 0 && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>DURAKLATILDI</Text>
          <TouchableOpacity style={styles.btn} onPress={pauseGame}>
            <Text style={styles.btnText}>Oyuna Devam Et</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleRestart}>
            <Text style={styles.btnText}>Yeniden Başla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onExit}>
            <Text style={styles.btnText}>Ana Menüye Dön</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game over overlay */}
      {isGameOver && (
        <View style={styles.overlay}>
          <Text style={[styles.overlayTitle, { color: '#ff4444' }]}>ÖLDÜN</Text>
          <PostGameStats
            wave={waveNumber}
            time={gameTime}
            level={level}
            maxCombo={maxComboFromStore}
            newAchievements={runAchievements}
          />
          <TouchableOpacity style={styles.btn} onPress={handleRestart}>
            <Text style={styles.btnText}>Tekrar Oyna</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onExit}>
            <Text style={styles.btnText}>Ana Menü</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Preset tanımları ─────────────────────────────────────────────────────────

const PLAYER_PRESETS = [
  { id: 'blue',   color: '#4fc3f7', rgb: '79,195,247',  label: 'Mavi'     },
  { id: 'red',    color: '#ff5566', rgb: '255,85,102',   label: 'Kırmızı'  },
  { id: 'green',  color: '#44ff88', rgb: '68,255,136',   label: 'Yeşil'    },
  { id: 'purple', color: '#cc77ff', rgb: '204,119,255',  label: 'Mor'      },
  { id: 'gold',   color: '#ffe066', rgb: '255,224,102',  label: 'Altın'    },
  { id: 'pink',   color: '#ff88cc', rgb: '255,136,204',  label: 'Pembe'    },
];

// ─── Menu Screen ─────────────────────────────────────────────────────────────

function MenuScreen({
  onStart,
  playerPhoto,
  presetId,
  onPhotoChange,
  onPresetChange,
}: {
  onStart: () => void;
  playerPhoto: string | null;
  presetId: string;
  onPhotoChange: (uri: string | null) => void;
  onPresetChange: (id: string) => void;
}) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const highestWave = useSaveStore(s => s.highestWave);
  const totalGames = useSaveStore(s => s.totalGames);

  const pickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      onPhotoChange(result.assets[0].uri);
    }
  }, [onPhotoChange]);

  const selectPreset = useCallback((id: string) => {
    onPhotoChange(null);
    onPresetChange(id);
  }, [onPhotoChange, onPresetChange]);

  return (
    <View style={styles.menuContainer}>
      {/* Settings button */}
      <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsVisible(true)}>
        <Text style={styles.settingsBtnText}>⚙</Text>
      </TouchableOpacity>

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />

      <Text style={styles.gameTitle}>VAMPIRE{'\n'}SURVIVORS</Text>

      {/* Player stats */}
      {totalGames > 0 && (
        <View style={styles.menuStatsRow}>
          <Text style={styles.menuStatText}>En Yüksek Dalga: <Text style={styles.menuStatValue}>{highestWave}</Text></Text>
          <Text style={styles.menuStatSep}>|</Text>
          <Text style={styles.menuStatText}>Toplam Oyun: <Text style={styles.menuStatValue}>{totalGames}</Text></Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>Oyuncu Seç</Text>

      {/* Preset baloncuklar */}
      <View style={styles.presetRow}>
        {PLAYER_PRESETS.map(p => {
          const selected = !playerPhoto && presetId === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.presetItem, selected && styles.presetSelected]}
              onPress={() => selectPreset(p.id)}
            >
              <View style={[styles.presetCircle, { backgroundColor: p.color,
                shadowColor: p.color, shadowOpacity: 0.8, shadowRadius: 6, elevation: 6 }]} />
              <Text style={[styles.presetLabel, selected && { color: '#fff' }]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Fotoğraf seçeneği */}
        <TouchableOpacity
          style={[styles.presetItem, !!playerPhoto && styles.presetSelected]}
          onPress={pickPhoto}
        >
          {playerPhoto ? (
            <Image source={{ uri: playerPhoto }} style={styles.presetPhoto} />
          ) : (
            <View style={[styles.presetCircle, styles.presetPhotoPlaceholder]}>
              <Text style={{ fontSize: 20 }}>📷</Text>
            </View>
          )}
          <Text style={[styles.presetLabel, !!playerPhoto && { color: '#fff' }]}>
            {playerPhoto ? 'Fotoğraf' : 'Ekle'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.btn, styles.btnLarge]} onPress={onStart}>
        <Text style={[styles.btnText, styles.btnTextLarge]}>OYNA</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'char_select' | 'game'>('menu');
  const [playerPhoto, setPlayerPhoto] = useState<string | null>(null);
  const [presetId, setPresetId] = useState('blue');
  const [startCharacter, setStartCharacter] = useState<CharacterId>('warrior');

  const loadSave = useSaveStore(s => s.load);
  const loadSettings = useSettingsStore(s => s.load);
  const soundOn = useSettingsStore(s => s.soundEnabled);
  const musicOn = useSettingsStore(s => s.musicEnabled);

  useEffect(() => {
    async function boot() {
      await loadSettings();
      await loadSave();
      await initAudio({ soundEnabled: soundOn, musicEnabled: musicOn });
    }
    boot();
  // loadSettings/loadSave are stable Zustand actions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preset = PLAYER_PRESETS.find(p => p.id === presetId) ?? PLAYER_PRESETS[0];
  const bodyColor = preset.color;
  const glowRgb   = preset.rgb;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar hidden={true} translucent={true} />
      {screen === 'menu' && (
        <MenuScreen
          onStart={() => setScreen('char_select')}
          playerPhoto={playerPhoto}
          presetId={presetId}
          onPhotoChange={setPlayerPhoto}
          onPresetChange={setPresetId}
        />
      )}
      {screen === 'char_select' && (
        <CharacterSelectScreen
          onSelect={(charId) => {
            setStartCharacter(charId);
            setScreen('game');
          }}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          onExit={() => setScreen('menu')}
          playerPhoto={playerPhoto}
          bodyColor={bodyColor}
          glowRgb={glowRgb}
          startCharacter={startCharacter}
        />
      )}
    </GestureHandlerRootView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#0a0a12',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  gameTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffe066',
    textAlign: 'center',
    letterSpacing: 4,
    lineHeight: 50,
    marginBottom: 8,
  },
  photoBtn: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4fc3f7',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#3a3a6c',
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 28,
  },
  photoLabel: {
    color: '#8888bb',
    fontSize: 13,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  joystickArea: {
    position: 'absolute',
    bottom: 50,
    right: 30,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  overlayTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffe066',
    letterSpacing: 4,
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 18,
    color: '#aaaacc',
    marginBottom: 16,
  },
  btn: {
    backgroundColor: '#3a3a6c',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#5a5a9c',
    minWidth: 180,
    alignItems: 'center',
  },
  btnLarge: {
    paddingHorizontal: 48,
    paddingVertical: 18,
    minWidth: 220,
  },
  btnSecondary: {
    backgroundColor: '#252540',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  btnTextLarge: {
    fontSize: 22,
    letterSpacing: 3,
  },
  sectionLabel: {
    color: '#8888bb',
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 4,
  },
  settingsBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#3a3a6c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtnText: {
    fontSize: 20,
  },
  menuStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  menuStatText: {
    color: '#8888bb',
    fontSize: 13,
  },
  menuStatValue: {
    color: '#ffe066',
    fontWeight: '700',
  },
  menuStatSep: {
    color: '#3a3a6c',
    fontSize: 16,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  presetItem: {
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetSelected: {
    borderColor: '#ffe066',
    backgroundColor: 'rgba(255,224,102,0.08)',
  },
  presetCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  presetLabel: {
    color: '#8888bb',
    fontSize: 11,
  },
  presetPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  presetPhotoPlaceholder: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#3a3a6c',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
