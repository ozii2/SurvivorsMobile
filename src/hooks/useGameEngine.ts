import { useRef, useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { GameState, UpgradeOption, CharacterId } from '../game/state/types';
import { createInitialGameState } from '../game/state/GameState';
import { applyUpgrade } from '../game/systems/UpgradeSystem';
import { resetWaveAccumulators } from '../game/systems/WaveSystem';
import { useGameStore } from '../game/state/useGameStore';
import { useSaveStore } from '../game/state/useSaveStore';
import { PurchasedUpgrades } from '../services/SaveService';

function applyPermanentUpgrades(gs: GameState, upgrades: PurchasedUpgrades): void {
  const p = gs.player;
  if (upgrades.maxHp > 0) {
    const bonus = upgrades.maxHp * 10;
    p.maxHp += bonus;
    p.hp += bonus;
  }
  if (upgrades.damage > 0)  p.mightMultiplier  *= 1 + upgrades.damage * 0.08;
  if (upgrades.armor > 0)   p.armor            += upgrades.armor;
  if (upgrades.speed > 0)   p.speed            *= 1 + upgrades.speed * 0.05;
}

export function useGameEngine(characterId: CharacterId = 'warrior') {
  const purchasedUpgrades = useSaveStore(s => s.purchasedUpgrades);

  const makeState = useCallback(() => {
    const gs = createInitialGameState(characterId);
    applyPermanentUpgrades(gs, purchasedUpgrades);
    return gs;
  }, [characterId, purchasedUpgrades]);

  const gameStateRef = useRef<GameState>(makeState());
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
    gameStateRef.current = makeState();
    resetGame();
  }, [resetGame, makeState]);

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
