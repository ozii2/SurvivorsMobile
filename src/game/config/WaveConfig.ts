import { EnemyType } from '../state/types';

export interface SpawnGroup {
  type: EnemyType;
  rate: number;   // enemies per second
  max: number;    // max simultaneously active of this type
}

export interface WaveDefinition {
  startTime: number; // game seconds when this wave starts
  groups: SpawnGroup[];
}

export const WAVES: WaveDefinition[] = [
  {
    startTime: 0,
    groups: [{ type: 'basic', rate: 0.8, max: 20 }],
  },
  {
    startTime: 60,
    groups: [{ type: 'basic', rate: 1.5, max: 30 }],
  },
  {
    startTime: 90,
    groups: [
      { type: 'basic', rate: 1.2, max: 25 },
      { type: 'fast',  rate: 0.5, max: 15 },
    ],
  },
  {
    startTime: 150,
    groups: [
      { type: 'basic', rate: 2.0, max: 40 },
      { type: 'fast',  rate: 1.0, max: 20 },
    ],
  },
  {
    startTime: 200,
    groups: [
      { type: 'basic', rate: 2.0, max: 40 },
      { type: 'fast',  rate: 1.0, max: 20 },
      { type: 'tank',  rate: 0.2, max: 8 },
    ],
  },
  {
    startTime: 300,
    groups: [
      { type: 'basic', rate: 3.0, max: 60 },
      { type: 'fast',  rate: 1.5, max: 25 },
      { type: 'tank',  rate: 0.5, max: 12 },
    ],
  },
  {
    startTime: 480,
    groups: [
      { type: 'basic', rate: 3.0, max: 60 },
      { type: 'fast',  rate: 2.0, max: 30 },
      { type: 'tank',  rate: 0.8, max: 15 },
      { type: 'boss',  rate: 0.05, max: 2 },
    ],
  },
];

export function getCurrentWave(gameTime: number): WaveDefinition {
  let current = WAVES[0];
  for (const wave of WAVES) {
    if (gameTime >= wave.startTime) current = wave;
    else break;
  }
  return current;
}
