// ─── Core ───────────────────────────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

// ─── Entities ────────────────────────────────────────────────────────────────

export interface Entity {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  active: boolean;
}

export type WeaponId = 'dagger' | 'fireball' | 'whip' | 'lightning';

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
  invincibleTimer: number; // iframes after being hit
  weapons: WeaponInstance[];
  magnetRadius: number;
  armor: number;
  critChance: number;   // 0.0 – 1.0 (default 0)
  lifesteal: number;    // HP per kill (default 0)
}

export type EnemyType = 'basic' | 'fast' | 'tank' | 'boss';

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
}

export interface XPGemEntity extends Entity {
  value: number;
  isMagnetized: boolean;
}

export interface ParticleEntity extends Entity {
  lifetime: number;     // seconds remaining
  maxLifetime: number;
  color: string;
}

// ─── Central Game State (lives in useRef — never in React state) ─────────────

export interface GameState {
  player: PlayerEntity;
  enemies: EnemyEntity[];          // fixed pool: 128 slots
  projectiles: ProjectileEntity[]; // fixed pool: 256 slots
  xpGems: XPGemEntity[];           // fixed pool: 200 slots
  particles: ParticleEntity[];     // fixed pool: 300 slots
  worldOffset: Vec2;
  shakeTimer: number;     // seconds remaining for screen shake
  shakeMagnitude: number; // peak shake in pixels           // camera position (top-left world coord)
  waveTimer: number;           // seconds until next spawn
  waveNumber: number;
  gameTime: number;            // total elapsed seconds
  isPaused: boolean;
  pendingLevelUp: boolean;
  lastUISyncTime: number;      // for throttling Zustand updates
  isGameOver: boolean;
  idCounter: number;
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
  | 'lifesteal';

export interface UpgradeOption {
  id: string;
  type: UpgradeType;
  label: string;
  description: string;
  weaponId?: WeaponId;
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
  // actions
  syncFromGameState: (gs: GameState) => void;
  setPaused: (v: boolean) => void;
  setUpgradeChoices: (choices: UpgradeOption[]) => void;
  clearUpgradeChoices: () => void;
  resetUI: () => void;
}
