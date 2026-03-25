export const GameConfig = {
  // World
  WORLD_WIDTH: 3000,
  WORLD_HEIGHT: 3000,

  // Player
  PLAYER_RADIUS: 18,
  PLAYER_SPEED: 150,        // pixels/sec
  PLAYER_MAX_HP: 100,
  PLAYER_IFRAMES: 1.2,      // seconds of invincibility after hit
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

  // Pool sizes
  POOL_ENEMIES: 128,
  POOL_PROJECTILES: 256,
  POOL_GEMS: 200,
  POOL_PARTICLES: 300,

  // UI sync rate
  UI_SYNC_INTERVAL: 0.1,    // seconds

  // Fixed physics step
  FIXED_STEP: 1 / 60,
  MAX_DELTA: 0.05,           // cap at 50ms to prevent spiral of death
} as const;

export const EnemyConfig: Record<string, {
  radius: number;
  speed: number;
  hp: number;
  damage: number;
  xpValue: number;
  color: string;
}> = {
  basic: { radius: 16, speed: 70,  hp: 20,  damage: 10, xpValue: 1, color: '#e05050' },
  fast:  { radius: 12, speed: 130, hp: 10,  damage: 8,  xpValue: 2, color: '#e0a030' },
  tank:  { radius: 24, speed: 40,  hp: 80,  damage: 20, xpValue: 5, color: '#9040c0' },
  boss:  { radius: 40, speed: 30,  hp: 400, damage: 30, xpValue: 20, color: '#ff2020' },
};
