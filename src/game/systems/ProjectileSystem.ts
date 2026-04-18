import { GameState, ProjectileEntity, WeaponId } from '../state/types';
import { GameConfig } from '../config/GameConfig';

export function spawnProjectile(
  gs: GameState,
  x: number,
  y: number,
  vx: number,
  vy: number,
  damage: number,
  lifetime: number,
  radius: number,
  weaponId: WeaponId,
  isCrit = false,
): ProjectileEntity | null {
  for (let i = 0; i < gs.projectiles.length; i++) {
    const p = gs.projectiles[i];
    if (!p.active) {
      p.active = true;
      p.position.x = x;
      p.position.y = y;
      p.velocity.x = vx;
      p.velocity.y = vy;
      p.damage = damage;
      p.lifetime = lifetime;
      p.radius = radius;
      p.weaponId = weaponId;
      p.isCrit = isCrit;
      p.hitEnemyIds.clear();
      gs.idCounter++;
      p.id = gs.idCounter;
      return p;
    }
  }
  return null; // Pool full
}

export function tickProjectiles(gs: GameState, dt: number): void {
  const worldW = GameConfig.WORLD_WIDTH;
  const worldH = GameConfig.WORLD_HEIGHT;

  for (let i = 0; i < gs.projectiles.length; i++) {
    const p = gs.projectiles[i];
    if (!p.active) continue;
    // Fireballs are persistent — repositioned every frame by WeaponSystem
    if (p.weaponId === 'fireball') continue;

    p.position.x += p.velocity.x * dt;
    p.position.y += p.velocity.y * dt;
    p.lifetime -= dt;

    if (
      p.lifetime <= 0 ||
      p.position.x < -100 || p.position.x > worldW + 100 ||
      p.position.y < -100 || p.position.y > worldH + 100
    ) {
      p.active = false;
    }
  }
}
