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
import Animated, {
  useSharedValue, withTiming, withDelay, useAnimatedStyle,
} from 'react-native-reanimated';
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

// ─── Menu Design Tokens ───────────────────────────────────────────────────────

const MG = {
  bg:       '#050510',
  surface:  '#0e0e1e',
  surface2: '#161628',
  border:   '#252542',
  gold:     '#ffe066',
  red:      '#ff3355',
  blue:     '#4fc3f7',
  white:    '#ffffff',
  muted:    '#7070a0',
  faint:    '#3a3a58',
} as const;

const mStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MG.bg,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  bgTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: '55%', backgroundColor: '#0d0420', opacity: 0.7,
  },
  bgBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '40%', backgroundColor: '#160308', opacity: 0.6,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goldBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: MG.surface2,
    borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,224,102,0.22)',
  },
  goldText: { color: MG.gold, fontSize: 15, fontWeight: '700' },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: MG.surface2, borderWidth: 1, borderColor: MG.border,
    alignItems: 'center', justifyContent: 'center',
  },
  // Hero
  hero: { alignItems: 'center', gap: 4 },
  eyebrow: {
    fontSize: 10, color: MG.faint, letterSpacing: 4, fontWeight: '700',
    marginBottom: 4,
  },
  title1: {
    fontSize: 54, fontWeight: '900', color: MG.red,
    letterSpacing: 8, lineHeight: 60,
    textShadowColor: 'rgba(255,51,85,0.65)',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 28,
  },
  title2: {
    fontSize: 38, fontWeight: '900', color: MG.gold,
    letterSpacing: 5, lineHeight: 46, marginTop: -6,
    textShadowColor: 'rgba(255,224,102,0.55)',
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 22,
  },
  titleLine: {
    width: 60, height: 1.5, backgroundColor: MG.red,
    marginTop: 10, opacity: 0.5,
  },
  tagline: { fontSize: 11, color: MG.muted, letterSpacing: 3, marginTop: 6 },
  // Stats card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: MG.surface, borderRadius: 16,
    borderWidth: 1, borderColor: MG.border,
    paddingVertical: 16, overflow: 'hidden',
  },
  statsTopBorder: {
    position: 'absolute', top: 0, left: 24, right: 24,
    height: 1, backgroundColor: MG.gold, opacity: 0.25,
  },
  statBlock: { flex: 1, alignItems: 'center', gap: 3 },
  statNum: { fontSize: 22, fontWeight: '800', color: MG.gold, letterSpacing: 1 },
  statLbl: { fontSize: 9, color: MG.faint, letterSpacing: 1.5, fontWeight: '600' },
  statSep: { width: 1, marginVertical: 6, backgroundColor: MG.border },
  statBlank: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statBlankText: { fontSize: 11, color: MG.faint, letterSpacing: 1 },
  // Color picker
  pickerSection: { alignItems: 'center', gap: 10 },
  pickerLabel: { fontSize: 9, color: MG.faint, letterSpacing: 3.5, fontWeight: '700' },
  pickerRow: {
    flexDirection: 'row', gap: 6,
    flexWrap: 'wrap', justifyContent: 'center',
  },
  dotWrap: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 38, height: 38, borderRadius: 19 },
  dotRing: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25,
    borderWidth: 2, borderColor: 'transparent',
  },
  photoDot: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: MG.surface2, borderWidth: 1.5,
    borderColor: MG.border, alignItems: 'center', justifyContent: 'center',
  },
  // Play button
  playBtn: {
    backgroundColor: MG.gold, borderRadius: 16,
    paddingVertical: 20, alignItems: 'center', justifyContent: 'center',
    shadowColor: MG.gold, shadowOpacity: 0.55, shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 }, elevation: 18,
    overflow: 'hidden',
  },
  playBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playText: {
    fontSize: 26, fontWeight: '900', color: MG.bg, letterSpacing: 10,
  },
  playShimmer: {
    position: 'absolute', top: 0, left: -60, width: 80, height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ skewX: '-18deg' }],
  },
  // Nav row
  navRow: {
    flexDirection: 'row',
    backgroundColor: MG.surface, borderRadius: 14,
    borderWidth: 1, borderColor: MG.border, overflow: 'hidden',
  },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 15, minHeight: 52,
  },
  navText: { fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  navSep: { width: 1, marginVertical: 10, backgroundColor: MG.border },
  // Footer
  version: { textAlign: 'center', fontSize: 10, color: MG.faint, letterSpacing: 1 },
});

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
  const highestWave      = useSaveStore(s => s.highestWave);
  const totalGames       = useSaveStore(s => s.totalGames);
  const currentGoldBalance = useSaveStore(s => s.currentGoldBalance);

  // ── Entrance animations (staggered fade + translate) ──────────────────────
  const aHeader  = useSharedValue(0);
  const aHero    = useSharedValue(0);
  const aCard    = useSharedValue(0);
  const aCta     = useSharedValue(0);

  useEffect(() => {
    aHeader.value = withTiming(1, { duration: 380 });
    aHero.value   = withDelay(120, withTiming(1, { duration: 480 }));
    aCard.value   = withDelay(260, withTiming(1, { duration: 480 }));
    aCta.value    = withDelay(380, withTiming(1, { duration: 500 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sHeader = useAnimatedStyle(() => ({
    opacity: aHeader.value,
    transform: [{ translateY: (1 - aHeader.value) * -16 }],
  }));
  const sHero = useAnimatedStyle(() => ({
    opacity: aHero.value,
    transform: [{ translateY: (1 - aHero.value) * 32 }],
  }));
  const sCard = useAnimatedStyle(() => ({
    opacity: aCard.value,
    transform: [{ translateY: (1 - aCard.value) * 20 }],
  }));
  const sCta = useAnimatedStyle(() => ({
    opacity: aCta.value,
    transform: [{ scale: 0.92 + aCta.value * 0.08 }],
  }));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const pickPhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) onPhotoChange(result.assets[0].uri);
  }, [onPhotoChange]);

  const selectPreset = useCallback((id: string) => {
    hapticSelection();
    onPhotoChange(null);
    onPresetChange(id);
  }, [onPhotoChange, onPresetChange]);

  const handlePlay = useCallback(() => {
    hapticSuccess();
    onStart();
  }, [onStart]);

  return (
    <View style={mStyles.container}>
      {/* ── Atmospheric background layers ──────────────── */}
      <View style={mStyles.bgTop} pointerEvents="none" />
      <View style={mStyles.bgBottom} pointerEvents="none" />

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />

      {/* ── Header: gold balance + settings ──────────── */}
      <Animated.View style={[mStyles.header, sHeader]}>
        <View style={mStyles.goldBadge}>
          <Ionicons name="diamond" size={13} color={MG.gold} />
          <Text style={mStyles.goldText}>{currentGoldBalance}</Text>
        </View>
        <TouchableOpacity
          style={mStyles.settingsBtn}
          onPress={() => setSettingsVisible(true)}
          accessibilityLabel="Ayarlar"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Ionicons name="settings-sharp" size={18} color={MG.muted} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Hero: title + tagline ─────────────────────── */}
      <Animated.View style={[mStyles.hero, sHero]}>
        <Text style={mStyles.eyebrow}>— ROGUELITE  ·  ACTION —</Text>
        <Text style={mStyles.title1}>BALL</Text>
        <Text style={mStyles.title2}>SURVIVE</Text>
        <View style={mStyles.titleLine} />
        <Text style={mStyles.tagline}>Hayatta Kal  ·  Evrimleş  ·  Ezil</Text>
      </Animated.View>

      {/* ── Stats card ────────────────────────────────── */}
      <Animated.View style={sCard}>
        <View style={mStyles.statsCard}>
          <View style={mStyles.statsTopBorder} />
          {totalGames > 0 ? (
            <>
              <View style={mStyles.statBlock}>
                <Ionicons name="trophy" size={16} color={MG.gold} />
                <Text style={mStyles.statNum}>{highestWave}</Text>
                <Text style={mStyles.statLbl}>EN YÜKSEK DALGA</Text>
              </View>
              <View style={mStyles.statSep} />
              <View style={mStyles.statBlock}>
                <Ionicons name="game-controller" size={16} color={MG.muted} />
                <Text style={mStyles.statNum}>{totalGames}</Text>
                <Text style={mStyles.statLbl}>TOPLAM OYUN</Text>
              </View>
              <View style={mStyles.statSep} />
              <View style={mStyles.statBlock}>
                <Ionicons name="skull" size={16} color={MG.red} />
                <Text style={[mStyles.statNum, { color: MG.red }]}>{currentGoldBalance}</Text>
                <Text style={mStyles.statLbl}>ALTIN</Text>
              </View>
            </>
          ) : (
            <View style={mStyles.statBlank}>
              <Text style={mStyles.statBlankText}>İlk oyununu oyna ve istatistiklerini gör</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* ── Colour picker ─────────────────────────────── */}
      <Animated.View style={[mStyles.pickerSection, sCard]}>
        <Text style={mStyles.pickerLabel}>KAHRAMAN RENGİ</Text>
        <View style={mStyles.pickerRow}>
          {PLAYER_PRESETS.map(p => {
            const sel = !playerPhoto && presetId === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={mStyles.dotWrap}
                onPress={() => selectPreset(p.id)}
                accessibilityLabel={`${p.label} renk seç`}
                activeOpacity={0.7}
              >
                <View style={[
                  mStyles.dot,
                  { backgroundColor: p.color },
                  sel && {
                    shadowColor: p.color, shadowOpacity: 1,
                    shadowRadius: 14, elevation: 14,
                  },
                ]} />
                {sel && <View style={[mStyles.dotRing, { borderColor: p.color }]} />}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={mStyles.dotWrap}
            onPress={pickPhoto}
            accessibilityLabel="Fotoğraf seç"
            activeOpacity={0.7}
          >
            {playerPhoto ? (
              <>
                <Image source={{ uri: playerPhoto }} style={mStyles.dot} />
                <View style={[mStyles.dotRing, { borderColor: MG.gold }]} />
              </>
            ) : (
              <View style={mStyles.photoDot}>
                <Ionicons name="camera" size={16} color={MG.faint} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── Primary CTA: Play ─────────────────────────── */}
      <Animated.View style={sCta}>
        <TouchableOpacity
          style={mStyles.playBtn}
          onPress={handlePlay}
          activeOpacity={0.82}
          accessibilityLabel="Oyunu başlat"
          accessibilityRole="button"
        >
          <View style={mStyles.playBtnInner}>
            <Ionicons name="play" size={26} color={MG.bg} />
            <Text style={mStyles.playText}>OYNA</Text>
          </View>
          <View style={mStyles.playShimmer} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Secondary navigation ──────────────────────── */}
      <Animated.View style={[mStyles.navRow, sCta]}>
        <TouchableOpacity
          style={mStyles.navBtn}
          onPress={onShop}
          accessibilityLabel="Mağazaya git"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Ionicons name="storefront" size={18} color={MG.gold} />
          <Text style={[mStyles.navText, { color: MG.gold }]}>MAĞAZA</Text>
        </TouchableOpacity>
        <View style={mStyles.navSep} />
        <TouchableOpacity
          style={mStyles.navBtn}
          onPress={onStats}
          accessibilityLabel="İstatistiklere git"
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Ionicons name="bar-chart" size={18} color={MG.blue} />
          <Text style={[mStyles.navText, { color: MG.blue }]}>İSTATİSTİK</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Footer ────────────────────────────────────── */}
      <Text style={mStyles.version}>v1.0.0</Text>
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
