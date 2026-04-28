import { GameState, EnemyType } from '../state/types';
import { WAVES, getCurrentWave } from '../config/WaveConfig';
import { spawnEnemy } from './EnemySystem';

// Per-group spawn accumulators (reuse across frames via closure in hook)
const spawnAccumulators = new Map<string, number>();

export function tickWaves(
  gs: GameState,
  dt: number,
  screenW: number,
  screenH: number
): void {
  // Combo timer decay
  if (gs.comboTimer > 0) {
    gs.comboTimer -= dt;
    if (gs.comboTimer <= 0) {
      gs.comboTimer = 0;
      gs.killCombo = 0;
    }
  }

  // Wave announce countdown
  if (gs.waveAnnounceTimer > 0) gs.waveAnnounceTimer -= dt;

  // Detect wave index change
  let newWaveIndex = 0;
  for (let i = 0; i < WAVES.length; i++) {
    if (gs.gameTime >= WAVES[i].startTime) newWaveIndex = i;
    else break;
  }

  if (newWaveIndex !== gs.currentWaveIndex) {
    // Check no-damage before wave 3 (index 3 = 2:30)
    if (newWaveIndex === 3 && gs.totalDamageTaken === 0) {
      gs.reachedWave3NoDamage = true;
    }
    gs.currentWaveIndex = newWaveIndex;
    gs.waveNumber = newWaveIndex + 1;

    const wave = WAVES[newWaveIndex];
    gs.waveAnnounceTimer = 2.5;
    gs.waveAnnounceText = wave.announceText;
    gs.waveAnnounceColor = wave.announceColor;
    gs.currentBiomeId = wave.biomeId;
  }

  const wave = getCurrentWave(gs.gameTime);

  for (const group of wave.groups) {
    const key = group.type;
    const accumulated = (spawnAccumulators.get(key) ?? 0) + group.rate * dt;

    let activeCount = 0;
    for (let i = 0; i < gs.enemies.length; i++) {
      if (gs.enemies[i].active && gs.enemies[i].type === group.type) activeCount++;
    }

    if (accumulated >= 1 && activeCount < group.max) {
      const toSpawn = Math.floor(accumulated);
      for (let s = 0; s < toSpawn; s++) {
        if (activeCount + s < group.max) {
          const isElite = gs.currentWaveIndex >= 5 && Math.random() < 0.05;
          spawnEnemy(gs, group.type as EnemyType, screenW, screenH, isElite);
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
