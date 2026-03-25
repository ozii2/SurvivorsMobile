import React, { useRef, useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, runOnJS, FrameInfo } from 'react-native-reanimated';

import { GameState, UpgradeOption, EnemyEntity, ProjectileEntity, XPGemEntity, ParticleEntity } from '../game/state/types';
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
  playerPhoto?: string | null;
  bodyColor?: string;
  glowRgb?: string;
}

export function GameCanvas({
  gameStateRef,
  joystickX,
  joystickY,
  screenW,
  screenH,
  onLevelUp,
  onGameOver,
  playerPhoto,
  bodyColor,
  glowRgb,
}: Props) {
  const syncStore = useGameStore(s => s.syncFromGameState);
  const setUpgradeChoices = useGameStore(s => s.setUpgradeChoices);

  const [, setTick] = useState(0);
  const accumulator = useRef(0);
  const syncTimer = useRef(0);

  // Pre-filtered active entity lists — updated once per frame in runLoop,
  // never allocated anew (length reset to 0, then push active items).
  // Passed to render components so React map() only sees active entities.
  const renderRef = useRef({
    enemies:     [] as EnemyEntity[],
    projectiles: [] as ProjectileEntity[],
    gems:        [] as XPGemEntity[],
    particles:   [] as ParticleEntity[],
  });

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
      if (gs.shakeTimer > 0) gs.shakeTimer -= step;

      accumulator.current -= step;

      if (gs.isGameOver || gs.pendingLevelUp) {
        accumulator.current = 0;
        break;
      }
    }

    // Build filtered render lists once per frame (no new arrays — reuse via length=0+push)
    const re = renderRef.current;
    re.enemies.length = 0;
    re.projectiles.length = 0;
    re.gems.length = 0;
    re.particles.length = 0;
    for (let i = 0; i < gs.enemies.length; i++)     { if (gs.enemies[i].active)     re.enemies.push(gs.enemies[i]); }
    for (let i = 0; i < gs.projectiles.length; i++) { if (gs.projectiles[i].active) re.projectiles.push(gs.projectiles[i]); }
    for (let i = 0; i < gs.xpGems.length; i++)      { if (gs.xpGems[i].active)      re.gems.push(gs.xpGems[i]); }
    for (let i = 0; i < gs.particles.length; i++)   { if (gs.particles[i].active)   re.particles.push(gs.particles[i]); }

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

  const re = renderRef.current;

  // Screen shake: offset render without touching game state worldOffset
  const shakeFactor = gs.shakeTimer > 0 ? gs.shakeTimer / 0.30 : 0;
  const shakeX = shakeFactor > 0 ? (Math.random() - 0.5) * 2 * gs.shakeMagnitude * shakeFactor : 0;
  const shakeY = shakeFactor > 0 ? (Math.random() - 0.5) * 2 * gs.shakeMagnitude * shakeFactor : 0;
  const renderOffset = {
    x: gs.worldOffset.x + shakeX,
    y: gs.worldOffset.y + shakeY,
  };

  return (
    <Canvas style={[styles.canvas, { width: screenW, height: screenH }]}>
      <RenderBackground worldOffset={renderOffset} screenW={screenW} screenH={screenH} />
      <RenderXPGems gems={re.gems} worldOffset={renderOffset} screenW={screenW} screenH={screenH} />
      <RenderEnemies enemies={re.enemies} worldOffset={renderOffset} screenW={screenW} screenH={screenH} />
      <RenderProjectiles projectiles={re.projectiles} worldOffset={renderOffset} screenW={screenW} screenH={screenH} />
      <RenderParticles particles={re.particles} worldOffset={renderOffset} screenW={screenW} screenH={screenH} />
      <RenderPlayer player={gs.player} worldOffset={renderOffset} photoUri={playerPhoto} bodyColor={bodyColor} glowRgb={glowRgb} />
      <RenderHUD player={gs.player} enemies={re.enemies} gameTime={gs.gameTime} screenW={screenW} screenH={screenH} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#0a0a12',
  },
});
