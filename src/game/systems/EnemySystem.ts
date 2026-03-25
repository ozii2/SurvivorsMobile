import { GameState, EnemyEntity, EnemyType } from '../state/types';
import { GameConfig, EnemyConfig } from '../config/GameConfig';

function findFreeSlot(enemies: EnemyEntity[]): EnemyEntity | null {
  for (let i = 0; i < enemies.length; i++) {
    if (!enemies[i].active) return enemies[i];
  }
  return null;
}

export function spawnEnemy(
  gs: GameState,
  type: EnemyType,
  screenW: number,
  screenH: number
): void {
  const slot = findFreeSlot(gs.enemies);
  if (!slot) return;

  const cfg = EnemyConfig[type];
  const spawnDist = Math.sqrt(screenW * screenW + screenH * screenH) * 0.5 + 60;

  // Random angle around player
  const angle = Math.random() * Math.PI * 2;
  const px = gs.player.position.x + Math.cos(angle) * spawnDist;
  const py = gs.player.position.y + Math.sin(angle) * spawnDist;

  slot.active = true;
  slot.type = type;
  slot.position.x = Math.max(0, Math.min(GameConfig.WORLD_WIDTH, px));
  slot.position.y = Math.max(0, Math.min(GameConfig.WORLD_HEIGHT, py));
  slot.velocity.x = 0;
  slot.velocity.y = 0;
  slot.radius = cfg.radius;
  slot.hp = cfg.hp;
  slot.maxHp = cfg.hp;
  slot.speed = cfg.speed;
  slot.damage = cfg.damage;
  slot.xpValue = cfg.xpValue;
  slot.contactTimer = 0;
  gs.idCounter++;
  slot.id = gs.idCounter;
}

// ── Reusable spatial grid (no new Map / no string keys per frame) ─────────────
const _grid = new Map<number, EnemyEntity[]>();
const _cellArrayPool: EnemyEntity[][] = [];
let _poolIdx = 0;

function _getCell(): EnemyEntity[] {
  if (_poolIdx < _cellArrayPool.length) {
    const c = _cellArrayPool[_poolIdx++];
    c.length = 0;
    return c;
  }
  const c: EnemyEntity[] = [];
  _cellArrayPool.push(c);
  _poolIdx++;
  return c;
}

// Encode two 15-bit signed ints into one 32-bit number (no string allocation)
function _cellKey(cx: number, cy: number): number {
  return ((cx & 0x7FFF) | ((cy & 0x7FFF) << 15));
}

export function tickEnemies(gs: GameState, dt: number): void {
  const px = gs.player.position.x;
  const py = gs.player.position.y;
  const cellSize = GameConfig.GRID_CELL_SIZE;

  // Rebuild reusable grid (clear without GC)
  _grid.clear();
  _poolIdx = 0;

  for (let i = 0; i < gs.enemies.length; i++) {
    const e = gs.enemies[i];
    if (!e.active) continue;
    const cx = Math.floor(e.position.x / cellSize);
    const cy = Math.floor(e.position.y / cellSize);
    const key = _cellKey(cx, cy);
    let cell = _grid.get(key);
    if (!cell) { cell = _getCell(); _grid.set(key, cell); }
    cell.push(e);
  }

  for (let i = 0; i < gs.enemies.length; i++) {
    const e = gs.enemies[i];
    if (!e.active) continue;

    if (e.contactTimer > 0) e.contactTimer -= dt;

    // Seek player
    const dx = px - e.position.x;
    const dy = py - e.position.y;
    const distSq = dx * dx + dy * dy;
    const dist = distSq > 0.001 ? Math.sqrt(distSq) : 0.001;
    let vx = (dx / dist) * e.speed;
    let vy = (dy / dist) * e.speed;

    // Separation from nearby enemies
    const cx = Math.floor(e.position.x / cellSize);
    const cy = Math.floor(e.position.y / cellSize);
    let sepX = 0, sepY = 0, sepCount = 0;
    for (let nx = cx - 1; nx <= cx + 1; nx++) {
      for (let ny = cy - 1; ny <= cy + 1; ny++) {
        const neighbors = _grid.get(_cellKey(nx, ny));
        if (!neighbors) continue;
        for (let ni = 0; ni < neighbors.length; ni++) {
          const n = neighbors[ni];
          if (n === e) continue;
          const sdx = e.position.x - n.position.x;
          const sdy = e.position.y - n.position.y;
          const sdistSq = sdx * sdx + sdy * sdy;
          const minDist = e.radius + n.radius;
          if (sdistSq < minDist * minDist && sdistSq > 0.001) {
            const sdist = Math.sqrt(sdistSq);
            sepX += sdx / sdist;
            sepY += sdy / sdist;
            sepCount++;
          }
        }
      }
    }

    if (sepCount > 0) {
      vx = vx * 0.8 + (sepX / sepCount) * e.speed * 0.2;
      vy = vy * 0.8 + (sepY / sepCount) * e.speed * 0.2;
    }

    const accel = Math.min(1, 8 * dt);
    e.velocity.x += (vx - e.velocity.x) * accel;
    e.velocity.y += (vy - e.velocity.y) * accel;

    e.position.x += e.velocity.x * dt;
    e.position.y += e.velocity.y * dt;

    e.position.x = Math.max(e.radius, Math.min(GameConfig.WORLD_WIDTH  - e.radius, e.position.x));
    e.position.y = Math.max(e.radius, Math.min(GameConfig.WORLD_HEIGHT - e.radius, e.position.y));
  }
}
