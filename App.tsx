import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { UpgradeShopScreen } from './src/ui/UpgradeShopScreen';
import { StatsScreen } from './src/ui/StatsScreen';
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
      const gs = gameStateRef.current;
      const goldEarned = waveNumber * 10 + Math.floor(gs.totalKillsThisRun * 0.5);
      recordGame(waveNumber, gameTime, goldEarned, gs.bossKilledThisRun, gameTime >= 300, gs.player.characterId, gs.totalKillsThisRun);
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

      {/* Joystick overlay — tam ekran, dokunulan yerden başlar */}
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

          {/* Player inventory snapshot */}
          {(() => {
            const p = gameStateRef.current.player;
            return (
              <View style={styles.pauseInventory}>
                {/* Level */}
                <Text style={styles.pauseLevel}>Seviye {p.level}</Text>

                {/* Weapons */}
                <Text style={styles.pauseSectionLabel}>SİLAHLAR</Text>
                <View style={styles.pauseTagRow}>
                  {p.weapons.map(w => (
                    <View key={w.id} style={styles.pauseWeaponTag}>
                      <Text style={styles.pauseWeaponName}>
                        {WEAPON_LABELS[w.id] ?? w.id}
                      </Text>
                      <Text style={styles.pauseWeaponLevel}>Lv{w.level}</Text>
                    </View>
                  ))}
                </View>

                {/* Passive items */}
                {p.ownedPassiveItems.length > 0 && (
                  <>
                    <Text style={styles.pauseSectionLabel}>EŞYALAR</Text>
                    <View style={styles.pauseTagRow}>
                      {p.ownedPassiveItems.map(id => (
                        <View key={id} style={styles.pauseItemTag}>
                          <Text style={styles.pauseItemText}>
                            {PASSIVE_ITEM_LABELS[id] ?? id}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}
              </View>
            );
          })()}

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

// ─── Pause menu lookup tables ────────────────────────────────────────────────

const WEAPON_LABELS: Record<string, string> = {
  dagger:       '🗡️ Hançer',
  fireball:     '🔥 Ateş Topu',
  whip:         '⚡ Kırbaç',
  lightning:    '🌩️ Şimşek',
  garlic:       '🧄 Sarımsak',
  cross:        '✝️ Kutsal Haç',
  blood_blade:  '🩸 Kan Kılıcı',
  hellfire:     '🔥 Cehennem Alevi',
  soul_whip:    '💀 Ruh Kırbacı',
  thunder_storm:'⚡ Kıyamet Şimşeği',
  death_aura:   '☠️ Ölüm Bulutsu',
  divine_blade: '✨ İlahi Kılıç',
};

const PASSIVE_ITEM_LABELS: Record<string, string> = {
  blood_stone:    '🩸 Kan Taşı',
  spell_book:     '📖 Büyü Kitabı',
  power_stone:    '💎 Güç Taşı',
  storm_crystal:  '⚡ Fırtına Kristali',
  garlic_essence: '🧄 Sarımsak Özü',
  holy_relic:     '✝️ Kutsal Emanet',
};

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
  onShop,
  onStats,
  playerPhoto,
  presetId,
  onPhotoChange,
  onPresetChange,
}: {
  onStart: () => void;
  onShop: () => void;
  onStats: () => void;
  playerPhoto: string | null;
  presetId: string;
  onPhotoChange: (uri: string | null) => void;
  onPresetChange: (id: string) => void;
}) {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const highestWave = useSaveStore(s => s.highestWave);
  const totalGames = useSaveStore(s => s.totalGames);
  const currentGoldBalance = useSaveStore(s => s.currentGoldBalance);

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
      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />

      {/* ── Header ───────────────────────────────────── */}
      <View style={styles.menuHeader}>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setSettingsVisible(true)}
          accessibilityLabel="Ayarlar"
          accessibilityRole="button"
          activeOpacity={0.75}
        >
          <Ionicons name="settings-sharp" size={20} color="#8888bb" />
        </TouchableOpacity>
      </View>

      {/* ── Hero ─────────────────────────────────────── */}
      <View style={styles.heroSection}>
        <Text style={styles.heroEyebrow}>ROGUELITE  ACTION</Text>
        <Text style={styles.gameTitle}>VAMPIRE{'\n'}SURVIVORS</Text>
        <Text style={styles.heroTagline}>Hayatta Kal. Evrimleş. Ezil.</Text>
      </View>

      {/* ── Stats card ───────────────────────────────── */}
      {totalGames > 0 ? (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="trophy-outline" size={15} color="#ffe066" />
            <Text style={styles.statLabel}>En Yüksek Dalga</Text>
            <Text style={styles.statValue}>{highestWave}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="game-controller-outline" size={15} color="#8888bb" />
            <Text style={styles.statLabel}>Toplam Oyun</Text>
            <Text style={styles.statValue}>{totalGames}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="diamond-outline" size={15} color="#ffe066" />
            <Text style={styles.statLabel}>Altın</Text>
            <Text style={styles.statValue}>{currentGoldBalance}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.statsCardPlaceholder} />
      )}

      {/* ── Colour picker ────────────────────────────── */}
      <View style={styles.presetSection}>
        <Text style={styles.sectionLabel}>OYUNCU RENGİ</Text>
        <View style={styles.presetRow}>
          {PLAYER_PRESETS.map(p => {
            const selected = !playerPhoto && presetId === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.presetItem, selected && { borderColor: p.color }]}
                onPress={() => selectPreset(p.id)}
                accessibilityLabel={`${p.label} renk seç`}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.presetCircle,
                    { backgroundColor: p.color },
                    selected && {
                      shadowColor: p.color,
                      shadowOpacity: 0.85,
                      shadowRadius: 10,
                      elevation: 8,
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.presetItem, !!playerPhoto && { borderColor: '#ffe066' }]}
            onPress={pickPhoto}
            accessibilityLabel="Fotoğrafını seç"
            activeOpacity={0.75}
          >
            {playerPhoto ? (
              <Image source={{ uri: playerPhoto }} style={styles.presetCircle} />
            ) : (
              <View style={styles.presetPhotoCircle}>
                <Ionicons name="camera-outline" size={20} color="#5a5a8c" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Primary CTA ──────────────────────────────── */}
      <TouchableOpacity
        style={styles.btnPlay}
        onPress={onStart}
        activeOpacity={0.82}
        accessibilityLabel="Oyunu başlat"
        accessibilityRole="button"
      >
        <Ionicons name="play" size={22} color="#0a0a12" />
        <Text style={styles.btnPlayText}>OYNA</Text>
      </TouchableOpacity>

      {/* ── Secondary navigation ─────────────────────── */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity
          style={styles.btnNav}
          onPress={onShop}
          accessibilityLabel="Mağazaya git"
          accessibilityRole="button"
          activeOpacity={0.75}
        >
          <Ionicons name="storefront-outline" size={17} color="#ffe066" />
          <Text style={[styles.btnNavText, { color: '#ffe066' }]}>MAĞAZA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnNav}
          onPress={onStats}
          accessibilityLabel="İstatistiklere git"
          accessibilityRole="button"
          activeOpacity={0.75}
        >
          <Ionicons name="bar-chart-outline" size={17} color="#4fc3f7" />
          <Text style={[styles.btnNavText, { color: '#4fc3f7' }]}>İSTATİSTİK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'char_select' | 'game' | 'shop' | 'stats'>('menu');
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
          onShop={() => setScreen('shop')}
          onStats={() => setScreen('stats')}
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
      {screen === 'shop' && (
        <UpgradeShopScreen onBack={() => setScreen('menu')} />
      )}
      {screen === 'stats' && (
        <StatsScreen onBack={() => setScreen('menu')} />
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-evenly',
  },
  menuHeader: {
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 52 : 32,
    alignItems: 'flex-end',
  },
  heroSection: {
    alignItems: 'center',
    gap: 8,
  },
  heroEyebrow: {
    fontSize: 10,
    color: '#4a4a6c',
    letterSpacing: 3,
  },
  gameTitle: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#ffe066',
    textAlign: 'center',
    letterSpacing: 5,
    lineHeight: 54,
    textShadowColor: 'rgba(255,224,102,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  heroTagline: {
    fontSize: 13,
    color: '#6666aa',
    letterSpacing: 2,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141424',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2e2e4e',
    paddingVertical: 14,
    paddingHorizontal: 4,
    width: '100%',
    maxWidth: 380,
  },
  statsCardPlaceholder: {
    height: 68,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#2e2e4e',
  },
  statLabel: {
    fontSize: 10,
    color: '#5a5a8c',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffe066',
  },
  presetSection: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  presetPhotoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#3a3a5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffe066',
    borderRadius: 14,
    paddingVertical: 18,
    width: '100%',
    maxWidth: 380,
    gap: 10,
    shadowColor: '#ffe066',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  btnPlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a0a12',
    letterSpacing: 5,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    maxWidth: 380,
  },
  btnNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#141424',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2e2e4e',
    minHeight: 48,
  },
  btnNavText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  joystickArea: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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
  btnSecondary: {
    backgroundColor: '#252540',
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  sectionLabel: {
    color: '#4a4a6c',
    fontSize: 10,
    letterSpacing: 2.5,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#3a3a5c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  presetItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  pauseInventory: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a6c',
    padding: 14,
    width: '88%',
    maxWidth: 340,
    gap: 6,
    marginBottom: 8,
  },
  pauseLevel: {
    color: '#ffe066',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  pauseSectionLabel: {
    color: '#5a5a8c',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
  },
  pauseTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pauseWeaponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e3a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a7c',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  pauseWeaponName: {
    color: '#ccccee',
    fontSize: 13,
  },
  pauseWeaponLevel: {
    color: '#ffe066',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pauseItemTag: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7B68EE66',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pauseItemText: {
    color: '#aaaadd',
    fontSize: 13,
  },
});
