import React, { useRef, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, runOnJS, FrameInfo } from 'react-native-reanimated';

import { GameState, UpgradeOption } from '../game/state/types';
import { GameConfig } from '../game/config/GameConfig';

import { tickPlayer, updateCameraCenter } from '../game/systems/PlayerSystem';
import { tickEnemies } from '../game/systems/EnemySystem';
import { tickProjectiles } from '../game/systems/ProjectileSystem';
import { tickXPGems } from '../game/systems/XPGemSystem';
import { tickParticles } from '../game/systems/ParticleSystem';
import { tickCollisions } from '../game/systems/CollisionSystem';
import { tickWaves } from '../game/systems/WaveSystem';
import { tickWeapons } from '../game/systems/WeaponSystem';
import { generateUpgradeChoices } from '../game/systems/UpgradeSystem';
import { useGameStore } from '../game/state/useGameStore';

import { RenderBackground } from './RenderBackground';
import { RenderXPGems } from './RenderXPGems';
import { RenderEnemies } from './RenderEnemies';
import { RenderProjectiles } from './RenderProjectiles';
import { RenderPlayer } from './RenderPlayer';
import { RenderParticles } from './RenderParticles';
import { RenderHUD } from './RenderHUD';

interface Props {
  gameStateRef: React.MutableRefObject<GameState>;
  joystickX: ReturnType<typeof useSharedValue<number>>;
  joystickY: ReturnType<typeof useSharedValue<number>>;
  screenW: number;
  screenH: number;
  onLevelUp: (choices: UpgradeOption[]) => void;
  onGameOver: () => void;
}

export function GameCanvas({
  gameStateRef,
  joystickX,
  joystickY,
  screenW,
  screenH,
  onLevelUp,
  onGameOver,
}: Props) {
  const syncStore = useGameStore(s => s.syncFromGameState);
  const setUpgradeChoices = useGameStore(s => s.setUpgradeChoices);

  const [, setTick] = useState(0);
  const accumulator = useRef(0);
  const syncTimer = useRef(0);

  // Entire game loop runs on JS thread
  const runLoop = useCallback((timeSincePreviousFrame: number) => {
    const gs = gameStateRef.current;
    if (!gs || gs.isPaused) return;

    const rawDt = timeSincePreviousFrame / 1000;
    const dt = Math.min(rawDt, GameConfig.MAX_DELTA);

    // Read joystick from shared values (readable on JS thread)
    const jx = joystickX.value;
    const jy = joystickY.value;

    accumulator.current += dt;
    while (accumulator.current >= GameConfig.FIXED_STEP) {
      const step = GameConfig.FIXED_STEP;
      gs.gameTime += step;

      tickWaves(gs, step, screenW, screenH);
      tickPlayer(gs, step, { x: jx, y: jy });
      updateCameraCenter(gs, screenW / 2, screenH / 2);
      tickEnemies(gs, step);
      tickWeapons(gs, step);
      tickProjectiles(gs, step);
      tickXPGems(gs, step);
      tickParticles(gs, step);
      tickCollisions(gs);

      accumulator.current -= step;

      if (gs.isGameOver || gs.pendingLevelUp) {
        accumulator.current = 0;
        break;
      }
    }

    // UI sync (~10 Hz)
    syncTimer.current += dt;
    if (syncTimer.current >= GameConfig.UI_SYNC_INTERVAL) {
      syncTimer.current = 0;
      syncStore(gs);

      if (gs.pendingLevelUp) {
        gs.pendingLevelUp = false;
        gs.isPaused = true;
        const choices = generateUpgradeChoices(gs);
        setUpgradeChoices(choices);
        onLevelUp(choices);
      }

      if (gs.isGameOver) {
        onGameOver();
      }
    }

    // Force React re-render so Canvas reads fresh game state
    setTick(t => t + 1);
  }, [gameStateRef, joystickX, joystickY, screenW, screenH,
      syncStore, setUpgradeChoices, onLevelUp, onGameOver, setTick]);

  // Frame callback only dispatches to JS thread
  useFrameCallback((frameInfo: FrameInfo) => {
    runOnJS(runLoop)(frameInfo.timeSincePreviousFrame ?? 16);
  });

  const gs = gameStateRef.current;
  if (!gs) return null;

  return (
    <Canvas style={[styles.canvas, { width: screenW, height: screenH }]}>
      <RenderBackground worldOffset={gs.worldOffset} screenW={screenW} screenH={screenH} />
      <RenderXPGems gems={gs.xpGems} worldOffset={gs.worldOffset} screenW={screenW} screenH={screenH} />
      <RenderEnemies enemies={gs.enemies} worldOffset={gs.worldOffset} screenW={screenW} screenH={screenH} />
      <RenderProjectiles projectiles={gs.projectiles} worldOffset={gs.worldOffset} screenW={screenW} screenH={screenH} />
      <RenderParticles particles={gs.particles} worldOffset={gs.worldOffset} screenW={screenW} screenH={screenH} />
      <RenderPlayer player={gs.player} worldOffset={gs.worldOffset} />
      <RenderHUD player={gs.player} gameTime={gs.gameTime} screenW={screenW} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#0a0a12',
  },
});
