import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useKeepAwake } from 'expo-keep-awake';

import { GameCanvas } from './src/rendering/GameCanvas';
import { VirtualJoystick } from './src/ui/VirtualJoystick';
import { LevelUpModal } from './src/ui/LevelUpModal';
import { HUDOverlay } from './src/ui/HUDOverlay';
import { useGameEngine } from './src/hooks/useGameEngine';
import { useGameStore } from './src/game/state/useGameStore';
import { UpgradeOption } from './src/game/state/types';

// ─── Game Screen ─────────────────────────────────────────────────────────────

function GameScreen({ onExit }: { onExit: () => void }) {
  useKeepAwake();
  const { width, height } = useWindowDimensions();
  const {
    gameStateRef,
    joystickX,
    joystickY,
    handleLevelUp,
    chooseUpgrade,
    pauseGame,
    restartGame,
  } = useGameEngine();

  const pendingChoices = useGameStore(s => s.pendingUpgradeChoices);
  const isGameOver = useGameStore(s => s.isGameOver);
  const isPaused = useGameStore(s => s.isPaused);
  const level = useGameStore(s => s.level);

  const handleGameOver = useCallback(() => {
    // State already updated via Zustand sync
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
      />

      {/* Joystick overlay */}
      <View style={styles.joystickArea} pointerEvents="box-none">
        <VirtualJoystick joystickX={joystickX} joystickY={joystickY} />
      </View>

      {/* HUD overlay (pause button & wave counter) */}
      <HUDOverlay onPause={pauseGame} />

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
            <Text style={styles.btnText}>Devam Et</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={handleRestart}>
            <Text style={styles.btnText}>Yeniden Başla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={onExit}>
            <Text style={styles.btnText}>Ana Menü</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game over overlay */}
      {isGameOver && (
        <View style={styles.overlay}>
          <Text style={[styles.overlayTitle, { color: '#ff4444' }]}>ÖLDÜN</Text>
          <Text style={styles.overlaySubtitle}>Seviye {level}</Text>
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

// ─── Menu Screen ─────────────────────────────────────────────────────────────

function MenuScreen({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.menuContainer}>
      <Text style={styles.gameTitle}>VAMPIRE{'\n'}SURVIVORS</Text>
      <Text style={styles.gameSubtitle}>React Native Edition</Text>
      <TouchableOpacity style={[styles.btn, styles.btnLarge]} onPress={onStart}>
        <Text style={[styles.btnText, styles.btnTextLarge]}>OYNA</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar hidden />
      {screen === 'menu' && (
        <MenuScreen onStart={() => setScreen('game')} />
      )}
      {screen === 'game' && (
        <GameScreen onExit={() => setScreen('menu')} />
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
  gameSubtitle: {
    fontSize: 14,
    color: '#6666aa',
    marginBottom: 40,
    letterSpacing: 2,
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
});
