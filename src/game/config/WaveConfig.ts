import { EnemyType } from '../state/types';

export type BiomeId = 'nebula' | 'dungeon' | 'void';

export interface SpawnGroup {
  type: EnemyType;
  rate: number;   // enemies per second
  max: number;    // max simultaneously active of this type
}

export interface WaveDefinition {
  startTime: number; // game seconds when this wave starts
  groups: SpawnGroup[];
  announceText: string;
  announceColor: string;
  biomeId: BiomeId;
}

export const WAVES: WaveDefinition[] = [
  // 0:00 — sadece basic
  {
    startTime: 0,
    announceText: 'OYUN BAŞLADI!',
    announceColor: '#4fc3f7',
    biomeId: 'nebula',
    groups: [{ type: 'basic', rate: 0.8, max: 20 }],
  },
  // 1:00 — basic yoğunlaşır
  {
    startTime: 60,
    announceText: 'DÜŞMANLAR YAKLAŞIYOR!',
    announceColor: '#aaaaff',
    biomeId: 'nebula',
    groups: [{ type: 'basic', rate: 1.5, max: 30 }],
  },
  // 1:30 — fast girer
  {
    startTime: 90,
    announceText: 'HIZ CANAVARLARI!',
    announceColor: '#ff9900',
    biomeId: 'nebula',
    groups: [
      { type: 'basic', rate: 1.2, max: 25 },
      { type: 'fast',  rate: 0.5, max: 15 },
    ],
  },
  // 2:30 — hız artar
  {
    startTime: 150,
    announceText: 'SALDIRI HIZLANIYOR!',
    announceColor: '#ffcc44',
    biomeId: 'nebula',
    groups: [
      { type: 'basic', rate: 2.0, max: 40 },
      { type: 'fast',  rate: 1.0, max: 20 },
    ],
  },
  // 3:20 — tank girer
  {
    startTime: 200,
    announceText: 'TANKLAR GELİYOR!',
    announceColor: '#cc44ff',
    biomeId: 'nebula',
    groups: [
      { type: 'basic', rate: 2.0, max: 40 },
      { type: 'fast',  rate: 1.0, max: 20 },
      { type: 'tank',  rate: 0.2, max: 8  },
    ],
  },
  // 5:00 — swarm girer (yeni düşman)
  {
    startTime: 300,
    announceText: 'SÜRÜ SALDIRISI!',
    announceColor: '#44ff66',
    biomeId: 'dungeon',
    groups: [
      { type: 'basic', rate: 2.5, max: 50 },
      { type: 'fast',  rate: 1.2, max: 22 },
      { type: 'tank',  rate: 0.4, max: 10 },
      { type: 'swarm', rate: 0.8, max: 25 },
    ],
  },
  // 6:00 — swarm yoğun dalga
  {
    startTime: 360,
    announceText: 'SÜRÜ KABARIYYOR!',
    announceColor: '#44ff66',
    biomeId: 'dungeon',
    groups: [
      { type: 'basic', rate: 2.0, max: 40 },
      { type: 'fast',  rate: 1.5, max: 25 },
      { type: 'swarm', rate: 2.5, max: 50 },
      { type: 'tank',  rate: 0.5, max: 10 },
    ],
  },
  // 7:00 — explosive girer
  {
    startTime: 420,
    announceText: 'PATLAYICI TEHDİT!',
    announceColor: '#ff6622',
    biomeId: 'dungeon',
    groups: [
      { type: 'basic',     rate: 2.5, max: 45 },
      { type: 'fast',      rate: 1.5, max: 25 },
      { type: 'swarm',     rate: 2.0, max: 40 },
      { type: 'tank',      rate: 0.6, max: 12 },
      { type: 'explosive', rate: 0.3, max: 6  },
    ],
  },
  // 8:00 — final yoğun dalga + boss
  {
    startTime: 480,
    announceText: 'PATRON GELİYOR!',
    announceColor: '#ff2222',
    biomeId: 'void',
    groups: [
      { type: 'basic',     rate: 3.0, max: 55 },
      { type: 'fast',      rate: 2.0, max: 30 },
      { type: 'swarm',     rate: 3.0, max: 55 },
      { type: 'tank',      rate: 0.8, max: 15 },
      { type: 'explosive', rate: 0.5, max: 8  },
      { type: 'boss',      rate: 0.05, max: 2 },
    ],
  },
  // 9:00 — kaos dalgası
  {
    startTime: 540,
    announceText: 'KAOS MODU!',
    announceColor: '#ff0000',
    biomeId: 'void',
    groups: [
      { type: 'basic',     rate: 4.0, max: 60 },
      { type: 'fast',      rate: 3.0, max: 40 },
      { type: 'swarm',     rate: 4.0, max: 60 },
      { type: 'tank',      rate: 1.2, max: 18 },
      { type: 'explosive', rate: 0.8, max: 12 },
      { type: 'boss',      rate: 0.08, max: 3 },
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
