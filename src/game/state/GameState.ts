import { GameState, PlayerEntity, EnemyEntity, ProjectileEntity, XPGemEntity, ParticleEntity, DamageNumber, ChestEntity, CharacterId } from './types';
import { GameConfig } from '../config/GameConfig';
import { getCharacter } from '../config/CharacterConfig';

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
    isCrit: false,
  };
}

function makeDamageNumber(): DamageNumber {
  return { x: 0, y: 0, value: 0, isCrit: false, lifetime: 0, maxLifetime: 0, active: false };
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

function makeChest(id: number): ChestEntity {
  return {
    id,
    active: false,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 18,
    fromBoss: false,
    lifetime: 0,
  };
}

export function createInitialGameState(characterId: CharacterId = 'warrior'): GameState {
  const char = getCharacter(characterId);
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
    weapons: [{ id: char.startingWeaponId, level: 1, cooldownTimer: 0 }],
    magnetRadius: GameConfig.PLAYER_MAGNET_RADIUS,
    armor: GameConfig.PLAYER_ARMOR,
    critChance: 0,
    lifesteal: 0,
    characterId,
    ownedPassiveItems: [],
    mightMultiplier: 1.0,
    cooldownMultiplier: 1.0,
    bonusGarlicRadius: 0,
    bonusPierceLifetime: 0,
    bonusLightningTargets: 0,
  };
  char.applyBonus(player);

  return {
    player,
    enemies: makeEntityPool(GameConfig.POOL_ENEMIES, makeEnemy),
    projectiles: makeEntityPool(GameConfig.POOL_PROJECTILES, makeProjectile),
    xpGems: makeEntityPool(GameConfig.POOL_GEMS, makeGem),
    particles: makeEntityPool(GameConfig.POOL_PARTICLES, makeParticle),
    damageNumbers: Array.from({ length: GameConfig.POOL_DAMAGE_NUMBERS }, makeDamageNumber),
    chests: makeEntityPool(GameConfig.POOL_CHESTS, makeChest),
    worldOffset: {
      x: player.position.x - 200,
      y: player.position.y - 400,
    },
    waveTimer: 0,
    waveNumber: 1,
    gameTime: 0,
    shakeTimer: 0,
    shakeMagnitude: 0,
    isPaused: false,
    pendingLevelUp: false,
    pendingChestOpen: false,
    lastUISyncTime: 0,
    isGameOver: false,
    idCounter: 1000,
    killCombo: 0,
    comboTimer: 0,
    maxComboThisRun: 0,
    waveAnnounceTimer: 0,
    waveAnnounceText: '',
    waveAnnounceColor: '#ffffff',
    currentWaveIndex: 0,
    currentBiomeId: 'nebula',
    totalKillsThisRun: 0,
    totalCritsThisRun: 0,
    lifestealHealedThisRun: 0,
    totalDamageTaken: 0,
    bossKilledThisRun: false,
    reachedWave3NoDamage: false,
    runAchievements: [],
  };
}
