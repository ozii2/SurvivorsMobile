import { GameState, PlayerEntity, EnemyEntity, ProjectileEntity, XPGemEntity, ParticleEntity } from './types';
import { GameConfig } from '../config/GameConfig';

function makeEntityPool<T extends { active: boolean }>(
  size: number,
  factory: (i: number) => T
): T[] {
  return Array.from({ length: size }, (_, i) => factory(i));
}

function makeEnemy(id: number): EnemyEntity {
  return {
    id,
    active: false,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 16,
    hp: 0,
    maxHp: 0,
    speed: 0,
    damage: 0,
    xpValue: 0,
    type: 'basic',
    contactTimer: 0,
    hitFlashTimer: 0,
    isElite: false,
  };
}

function makeProjectile(id: number): ProjectileEntity {
  return {
    id,
    active: false,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 6,
    damage: 0,
    lifetime: 0,
    hitEnemyIds: new Set(),
    weaponId: 'dagger',
  };
}

function makeParticle(id: number): ParticleEntity {
  return {
    id,
    active: false,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 4,
    lifetime: 0,
    maxLifetime: 0,
    color: '#ffffff',
  };
}

function makeGem(id: number): XPGemEntity {
  return {
    id,
    active: false,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: GameConfig.GEM_RADIUS,
    value: 1,
    isMagnetized: false,
  };
}

export function createInitialGameState(startingWeaponId: string = 'dagger'): GameState {
  const player: PlayerEntity = {
    id: 0,
    active: true,
    position: {
      x: GameConfig.WORLD_WIDTH / 2,
      y: GameConfig.WORLD_HEIGHT / 2,
    },
    velocity: { x: 0, y: 0 },
    radius: GameConfig.PLAYER_RADIUS,
    hp: GameConfig.PLAYER_MAX_HP,
    maxHp: GameConfig.PLAYER_MAX_HP,
    speed: GameConfig.PLAYER_SPEED,
    xp: 0,
    level: 1,
    xpToNextLevel: GameConfig.XP_BASE,
    invincibleTimer: 0,
    weapons: [{ id: startingWeaponId as import('./types').WeaponId, level: 1, cooldownTimer: 0 }],
    magnetRadius: GameConfig.PLAYER_MAGNET_RADIUS,
    armor: GameConfig.PLAYER_ARMOR,
    critChance: 0,
    lifesteal: 0,
  };

  return {
    player,
    enemies: makeEntityPool(GameConfig.POOL_ENEMIES, makeEnemy),
    projectiles: makeEntityPool(GameConfig.POOL_PROJECTILES, makeProjectile),
    xpGems: makeEntityPool(GameConfig.POOL_GEMS, makeGem),
    particles: makeEntityPool(GameConfig.POOL_PARTICLES, makeParticle),
    worldOffset: {
      x: player.position.x - 200, // rough screen center
      y: player.position.y - 400,
    },
    waveTimer: 0,
    waveNumber: 1,
    gameTime: 0,
    shakeTimer: 0,
    shakeMagnitude: 0,
    isPaused: false,
    pendingLevelUp: false,
    lastUISyncTime: 0,
    isGameOver: false,
    idCounter: 1000,
  };
}
