// ─── Core ───────────────────────────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

// ─── Character & Item types ───────────────────────────────────────────────────

export type BiomeId = 'nebula' | 'dungeon' | 'void';

export type CharacterId = 'warrior' | 'mage' | 'healer' | 'hunter';

export type PassiveItemId =
  | 'blood_stone'
  | 'spell_book'
  | 'power_stone'
  | 'storm_crystal'
  | 'garlic_essence'
  | 'holy_relic';

export type EvolvedWeaponId =
  | 'blood_blade'
  | 'hellfire'
  | 'soul_whip'
  | 'thunder_storm'
  | 'death_aura'
  | 'divine_blade';

// ─── Entities ────────────────────────────────────────────────────────────────

export interface Entity {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  active: boolean;
}

export type WeaponId =
  | 'dagger' | 'fireball' | 'whip' | 'lightning' | 'garlic' | 'cross'
  | EvolvedWeaponId;

export interface WeaponInstance {
  id: WeaponId;
  level: number;
  cooldownTimer: number; // seconds until next fire
  angle?: number;        // for orbiting weapons (fireball)
}

export interface PlayerEntity extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  xp: number;
  level: number;
  xpToNextLevel: number;
  invincibleTimer: number;
  weapons: WeaponInstance[];
  magnetRadius: number;
  armor: number;
  critChance: number;
  lifesteal: number;
  // Character & item stat modifiers
  characterId: CharacterId;
  ownedPassiveItems: PassiveItemId[];
  mightMultiplier: number;        // damage multiplier (1.0 = normal)
  cooldownMultiplier: number;     // cooldown multiplier (1.0 = normal, 0.9 = 10% faster)
  bonusGarlicRadius: number;      // additive fraction (0.2 = +20% radius)
  bonusPierceLifetime: number;    // additive fraction (0.25 = +25% lifetime)
  bonusLightningTargets: number;  // integer extra targets
}

export type EnemyType = 'basic' | 'fast' | 'tank' | 'boss' | 'swarm' | 'explosive';

export interface EnemyEntity extends Entity {
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  type: EnemyType;
  contactTimer: number; // prevents dealing damage every frame
  hitFlashTimer: number; // seconds remaining for white flash on hit
  isElite: boolean;
}

export interface ProjectileEntity extends Entity {
  damage: number;
  lifetime: number;
  hitEnemyIds: Set<number>;
  weaponId: WeaponId;
  isCrit: boolean;
}

export interface XPGemEntity extends Entity {
  value: number;
  isMagnetized: boolean;
}

export interface ChestEntity extends Entity {
  fromBoss: boolean;  // true = boss drop (bigger glow), false = elite drop
  lifetime: number;   // seconds remaining before despawn
}

export interface ParticleEntity extends Entity {
  lifetime: number;     // seconds remaining
  maxLifetime: number;
  color: string;
}

export interface DamageNumber {
  x: number;
  y: number;
  value: number;
  isCrit: boolean;
  lifetime: number;
  maxLifetime: number;
  active: boolean;
}

// ─── Central Game State (lives in useRef — never in React state) ─────────────

export interface GameState {
  player: PlayerEntity;
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  xpGems: XPGemEntity[];
  particles: ParticleEntity[];
  damageNumbers: DamageNumber[];
  chests: ChestEntity[];           // fixed pool: 4 slots
  worldOffset: Vec2;
  shakeTimer: number;
  shakeMagnitude: number;
  waveTimer: number;
  waveNumber: number;
  gameTime: number;
  isPaused: boolean;
  pendingLevelUp: boolean;
  pendingChestOpen: boolean;       // chest collected, waiting for modal
  lastUISyncTime: number;
  isGameOver: boolean;
  idCounter: number;
  // Combo
  killCombo: number;
  comboTimer: number;
  maxComboThisRun: number;
  // Wave announce
  waveAnnounceTimer: number;
  waveAnnounceText: string;
  waveAnnounceColor: string;
  currentWaveIndex: number;
  currentBiomeId: BiomeId;
  // Achievement tracking
  totalKillsThisRun: number;
  totalCritsThisRun: number;
  lifestealHealedThisRun: number;
  totalDamageTaken: number;
  bossKilledThisRun: boolean;
  reachedWave3NoDamage: boolean;
  runAchievements: string[];
}

// ─── Upgrade system ──────────────────────────────────────────────────────────

export type UpgradeType =
  | 'weapon_new'
  | 'weapon_upgrade'
  | 'max_hp'
  | 'speed'
  | 'armor'
  | 'magnet'
  | 'crit'
  | 'lifesteal'
  | 'passive_item'
  | 'weapon_evolve';

export interface UpgradeOption {
  id: string;
  type: UpgradeType;
  label: string;
  description: string;
  weaponId?: WeaponId;
  passiveItemId?: PassiveItemId;
}

// ─── Zustand UI Store (React components only, updated ~10Hz) ─────────────────

export interface UIStore {
  hp: number;
  maxHp: number;
  xpPercent: number;
  level: number;
  gameTime: number;
  waveNumber: number;
  isPaused: boolean;
  isGameOver: boolean;
  pendingUpgradeChoices: UpgradeOption[];
  maxComboThisRun: number;
  // actions
  syncFromGameState: (gs: GameState) => void;
  setPaused: (v: boolean) => void;
  setUpgradeChoices: (choices: UpgradeOption[]) => void;
  clearUpgradeChoices: () => void;
  resetUI: () => void;
}
