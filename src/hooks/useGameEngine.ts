import { useRef, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { GameState, UpgradeOption } from '../game/state/types';
import { createInitialGameState } from '../game/state/GameState';
import { applyUpgrade } from '../game/systems/UpgradeSystem';
import { resetWaveAccumulators } from '../game/systems/WaveSystem';
import { useGameStore } from '../game/state/useGameStore';

export function useGameEngine() {
  const gameStateRef = useRef<GameState>(createInitialGameState());
  const joystickX = useSharedValue(0);
  const joystickY = useSharedValue(0);

  const resetGame = useGameStore(s => s.resetUI);
  const clearChoices = useGameStore(s => s.clearUpgradeChoices);
  const setPaused = useGameStore(s => s.setPaused);

  const handleLevelUp = useCallback((choices: UpgradeOption[]) => {
    // Canvas already paused the game state and pushed choices via store
    // This callback is for any additional imperative logic
  }, []);

  const chooseUpgrade = useCallback((choice: UpgradeOption) => {
    const gs = gameStateRef.current;
    applyUpgrade(gs, choice);
    gs.isPaused = false;
    clearChoices();
  }, [clearChoices]);

  const pauseGame = useCallback(() => {
    const gs = gameStateRef.current;
    const next = !gs.isPaused;
    gs.isPaused = next;
    setPaused(next); // Zustand'ı anında güncelle — game loop paused'da sync etmiyor
  }, [setPaused]);

  const restartGame = useCallback(() => {
    resetWaveAccumulators();
    gameStateRef.current = createInitialGameState();
    resetGame();
  }, [resetGame]);

  return {
    gameStateRef,
    joystickX,
    joystickY,
    handleLevelUp,
    chooseUpgrade,
    pauseGame,
    restartGame,
  };
}
