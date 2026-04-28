import React, { useRef, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Picture, Skia, SkPicture } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, runOnJS, FrameInfo } from 'react-native-reanimated';

import { GameState, UpgradeOption } from '../game/state/types';
import { GameConfig } from '../game/config/GameConfig';

import { tickPlayer, updateCameraCenter } from '../game/systems/PlayerSystem';
import { tickEnemies } from '../game/systems/EnemySystem';
import { tickProjectiles } from '../game/systems/ProjectileSystem';
import { tickXPGems } from '../game/systems/XPGemSystem';
import { tickParticles } from '../game/systems/ParticleSystem';
import { tickDamageNumbers } from '../game/systems/DamageNumberSystem';
import { tickCollisions } from '../game/systems/CollisionSystem';
import { tickWaves } from '../game/systems/WaveSystem';
import { tickWeapons } from '../game/systems/WeaponSystem';
import { generateUpgradeChoices, generateChestChoices } from '../game/systems/UpgradeSystem';
import { tickChests } from '../game/systems/ChestSystem';
import { useGameStore } from '../game/state/useGameStore';
import { drawFrame } from './drawGame';

// ── Module-level recorder: created once, never reallocated ───────────────────
const _recorder = Skia.PictureRecorder();
const _emptyPic: SkPicture = (() => {
  const r = Skia.PictureRecorder();
  r.beginRecording();
  return r.finishRecordingAsPicture();
})();

// ── Props ─────────────────────────────────────────────────────────────────────
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
  bodyColor,
  glowRgb,
}: Props) {
  const syncStore        = useGameStore(s => s.syncFromGameState);
  const setUpgradeChoices = useGameStore(s => s.setUpgradeChoices);

  // SharedValue<SkPicture>: Skia reads this directly on the UI thread —
  // no React reconciliation happens when picture.value is updated.
  const picture = useSharedValue<SkPicture>(_emptyPic);

  const accumulator = useRef(0);
  const syncTimer   = useRef(0);

  const runLoop = useCallback((timeSincePreviousFrame: number) => {
    const gs = gameStateRef.current;
    if (!gs || gs.isPaused) return;

    const rawDt = timeSincePreviousFrame / 1000;
    const dt    = Math.min(rawDt, GameConfig.MAX_DELTA);
    const jx    = joystickX.value;
    const jy    = joystickY.value;

    // ── Fixed-timestep game tick ──
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
      tickDamageNumbers(gs, step);
      tickCollisions(gs);
      tickChests(gs, step);
      if (gs.shakeTimer > 0) gs.shakeTimer -= step;

      accumulator.current -= step;

      if (gs.isGameOver || gs.pendingLevelUp || gs.pendingChestOpen) {
        accumulator.current = 0;
        break;
      }
    }

    // ── Screen shake ──
    const shakeFactor = gs.shakeTimer > 0 ? gs.shakeTimer / 0.30 : 0;
    const shakeX = shakeFactor > 0
      ? (Math.random() - 0.5) * 2 * gs.shakeMagnitude * shakeFactor : 0;
    const shakeY = shakeFactor > 0
      ? (Math.random() - 0.5) * 2 * gs.shakeMagnitude * shakeFactor : 0;
    const renderOffset = {
      x: gs.worldOffset.x + shakeX,
      y: gs.worldOffset.y + shakeY,
    };

    // ── Imperative frame recording ──
    // beginRecording returns an SkCanvas scoped to this recorder invocation.
    // finishRecordingAsPicture() seals it; setting picture.value pushes it to
    // the UI thread where Skia renders it — without React reconciling anything.
    const skCanvas = _recorder.beginRecording(Skia.XYWHRect(0, 0, screenW, screenH));
    drawFrame(skCanvas, gs, renderOffset, screenW, screenH, bodyColor, glowRgb);
    picture.value = _recorder.finishRecordingAsPicture();

    // ── UI sync (~10 Hz) ──
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

      if (gs.pendingChestOpen) {
        gs.pendingChestOpen = false;
        gs.isPaused = true;
        const choices = generateChestChoices(gs);
        setUpgradeChoices(choices);
        onLevelUp(choices);
      }

      if (gs.isGameOver) {
        onGameOver();
      }
    }
  }, [
    gameStateRef, joystickX, joystickY, screenW, screenH,
    bodyColor, glowRgb, picture,
    syncStore, setUpgradeChoices, onLevelUp, onGameOver,
  ]);

  // Frame callback dispatches game loop to JS thread
  useFrameCallback((frameInfo: FrameInfo) => {
    runOnJS(runLoop)(frameInfo.timeSincePreviousFrame ?? 16);
  });

  // Single <Picture> child: Skia reconciles exactly 1 node per frame.
  // If SharedValue<SkPicture> doesn't propagate at runtime, the cast can be
  // replaced with useRef<SkPicture> + a minimal setTick (still 1-node reconcile).
  return (
    <Canvas style={[styles.canvas, { width: screenW, height: screenH }]}>
      <Picture picture={picture as unknown as SkPicture} />
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    backgroundColor: '#0a0a12',
  },
});
