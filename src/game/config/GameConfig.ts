export const GameConfig = {
  // World
  WORLD_WIDTH: 3000,
  WORLD_HEIGHT: 3000,

  // Player
  PLAYER_RADIUS: 18,
  PLAYER_SPEED: 150,        // pixels/sec
  PLAYER_MAX_HP: 75,
  PLAYER_IFRAMES: 0.8,      // seconds of invincibility after hit
  PLAYER_MAGNET_RADIUS: 100,
  PLAYER_ARMOR: 0,

  // Camera
  CAMERA_LAG: 0.85,         // lerp factor: 1-lag per frame → smooth follow

  // XP
  XP_BASE: 5,               // XP needed for level 2
  XP_SCALE: 1.3,            // multiplier per level

  // Gems
  GEM_RADIUS: 7,
  GEM_MAGNET_SPEED: 300,

  // Collision spatial grid
  GRID_CELL_SIZE: 80,

  // Pool sizes — enlarged to fit swarm waves (max ~150 active)
  POOL_ENEMIES: 160,
  POOL_PROJECTILES: 160,
  POOL_GEMS: 200,
  POOL_PARTICLES: 220,
  POOL_DAMAGE_NUMBERS: 40,
  POOL_CHESTS: 4,

  // UI sync rate
  UI_SYNC_INTERVAL: 0.1,    // seconds

  // Fixed physics step
  FIXED_STEP: 1 / 60,
  MAX_DELTA: 0.05,           // cap at 50ms to prevent spiral of death
} as const;

export const LightningConfig: Record<number, { damage: number; targets: number; cooldown: number }> = {
  1: { damage:  9, targets: 1, cooldown: 2.20 },
  2: { damage: 12, targets: 1, cooldown: 2.00 },
  3: { damage: 14, targets: 2, cooldown: 1.75 },
  4: { damage: 17, targets: 2, cooldown: 1.55 },
  5: { damage: 21, targets: 3, cooldown: 1.40 },
  6: { damage: 25, targets: 3, cooldown: 1.25 },
  7: { damage: 30, targets: 4, cooldown: 1.15 },
  8: { damage: 36, targets: 4, cooldown: 1.05 },
};

// Garlic: radius and damage per level 1-8
export const GarlicConfig: Record<number, { radius: number; damage: number; tickInterval: number }> = {
  1: { radius:  80, damage:  6, tickInterval: 0.65 },
  2: { radius:  96, damage:  9, tickInterval: 0.60 },
  3: { radius: 112, damage: 13, tickInterval: 0.55 },
  4: { radius: 128, damage: 17, tickInterval: 0.50 },
  5: { radius: 144, damage: 22, tickInterval: 0.44 },
  6: { radius: 160, damage: 27, tickInterval: 0.38 },
  7: { radius: 175, damage: 32, tickInterval: 0.32 },
  8: { radius: 188, damage: 36, tickInterval: 0.27 },
};

// Cross: 4-directional piercing projectile per level 1-8
export const CrossConfig: Record<number, { damage: number; cooldown: number; radius: number; lifetime: number }> = {
  1: { damage:  19, cooldown: 2.70, radius:  9, lifetime: 1.6 },
  2: { damage:  26, cooldown: 2.45, radius: 10, lifetime: 1.8 },
  3: { damage:  34, cooldown: 2.20, radius: 11, lifetime: 2.0 },
  4: { damage:  43, cooldown: 2.00, radius: 12, lifetime: 2.1 },
  5: { damage:  52, cooldown: 1.75, radius: 14, lifetime: 2.2 },
  6: { damage:  62, cooldown: 1.50, radius: 15, lifetime: 2.3 },
  7: { damage:  71, cooldown: 1.25, radius: 16, lifetime: 2.5 },
  8: { damage:  79, cooldown: 1.05, radius: 18, lifetime: 2.6 },
};

export const EnemyConfig: Record<string, {
  radius: number;
  speed: number;
  hp: number;
  damage: number;
  xpValue: number;
  color: string;
}> = {
  basic:     { radius: 16, speed: 70,  hp: 20,  damage: 10, xpValue: 1,  color: '#e05050' },
  fast:      { radius: 12, speed: 130, hp: 10,  damage: 8,  xpValue: 2,  color: '#e0a030' },
  tank:      { radius: 24, speed: 40,  hp: 80,  damage: 20, xpValue: 5,  color: '#9040c0' },
  boss:      { radius: 40, speed: 30,  hp: 400, damage: 30, xpValue: 20, color: '#ff2020' },
  swarm:     { radius:  9, speed: 165, hp: 8,   damage: 5,  xpValue: 1,  color: '#55ff33' },
  explosive: { radius: 22, speed: 50,  hp: 50,  damage: 14, xpValue: 8,  color: '#ff7700' },
};

// Explosive death: AoE radius and damage to player
export const EXPLOSIVE_AOE_RADIUS = 70;
export const EXPLOSIVE_AOE_DAMAGE = 20;
