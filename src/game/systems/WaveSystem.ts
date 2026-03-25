import { GameState, EnemyType } from '../state/types';
import { getCurrentWave } from '../config/WaveConfig';
import { spawnEnemy } from './EnemySystem';

// Per-group spawn accumulators (reuse across frames via closure in hook)
const spawnAccumulators = new Map<string, number>();

export function tickWaves(
  gs: GameState,
  dt: number,
  screenW: number,
  screenH: number
): void {
  const wave = getCurrentWave(gs.gameTime);

  for (const group of wave.groups) {
    const key = group.type;
    const accumulated = (spawnAccumulators.get(key) ?? 0) + group.rate * dt;

    // Count active enemies of this type
    let activeCount = 0;
    for (let i = 0; i < gs.enemies.length; i++) {
      if (gs.enemies[i].active && gs.enemies[i].type === group.type) {
        activeCount++;
      }
    }

    if (accumulated >= 1 && activeCount < group.max) {
      const toSpawn = Math.floor(accumulated);
      for (let s = 0; s < toSpawn; s++) {
        if (activeCount + s < group.max) {
          spawnEnemy(gs, group.type as EnemyType, screenW, screenH);
        }
      }
      spawnAccumulators.set(key, accumulated - toSpawn);
    } else {
      spawnAccumulators.set(key, accumulated);
    }
  }
}

export function resetWaveAccumulators(): void {
  spawnAccumulators.clear();
}
