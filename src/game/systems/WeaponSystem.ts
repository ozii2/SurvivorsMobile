import { GameState, WeaponInstance, ProjectileEntity } from '../state/types';
import { spawnProjectile } from './ProjectileSystem';

const TWO_PI = Math.PI * 2;

// ─── Dagger ──────────────────────────────────────────────────────────────────
// Fires projectiles in N directions based on level
function tickDagger(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const baseCooldown = Math.max(0.15, 0.5 - (weapon.level - 1) * 0.05);
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;
  weapon.cooldownTimer = baseCooldown;

  const dirCount = weapon.level + 1; // level 1 → 2 dirs, level 2 → 3, etc.
  const speed = 320 + weapon.level * 30;
  const damage = 8 + weapon.level * 4;
  const lifetime = 1.2;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  for (let i = 0; i < dirCount; i++) {
    const angle = (TWO_PI / dirCount) * i;
    spawnProjectile(
      gs,
      px, py,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      damage, lifetime, 5, 'dagger'
    );
  }
}

// ─── Fireball ─────────────────────────────────────────────────────────────────
// Persistent orbiting fireballs — repositioned every frame, never respawned.
// hitEnemyIds cleared every 0.5 s so they can re-hit enemies periodically.
function tickFireball(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const orbitSpeed  = 1.8 + weapon.level * 0.3; // rad/sec
  const orbitRadius = 60  + weapon.level * 10;
  const damage      = 15  + weapon.level * 5;
  const ballCount   = Math.max(1, weapon.level);
  const radius      = 12  + weapon.level * 2;

  weapon.angle = ((weapon.angle ?? 0) + orbitSpeed * dt) % TWO_PI;

  // Hit-reset timer: clear hitEnemyIds every 0.5 s so fireball re-damages enemies
  weapon.cooldownTimer -= dt;
  const resetHits = weapon.cooldownTimer <= 0;
  if (resetHits) weapon.cooldownTimer = 0.5;

  // Collect existing persistent fireball slots
  const slots: ProjectileEntity[] = [];
  for (let i = 0; i < gs.projectiles.length; i++) {
    const p = gs.projectiles[i];
    if (p.active && p.weaponId === 'fireball') slots.push(p);
  }

  // Spawn any missing slots (only on first use or after level-up)
  while (slots.length < ballCount) {
    const slot = spawnProjectile(gs, 0, 0, 0, 0, damage, 99999, radius, 'fireball');
    if (!slot) break;
    slots.push(slot);
  }

  // Reposition each slot to its exact orbit position — no velocity drift
  const px = gs.player.position.x;
  const py = gs.player.position.y;
  for (let i = 0; i < Math.min(slots.length, ballCount); i++) {
    const angle = weapon.angle + (TWO_PI / ballCount) * i;
    slots[i].position.x = px + Math.cos(angle) * orbitRadius;
    slots[i].position.y = py + Math.sin(angle) * orbitRadius;
    slots[i].velocity.x = 0;
    slots[i].velocity.y = 0;
    slots[i].lifetime   = 99999;
    slots[i].damage     = damage;
    slots[i].radius     = radius;
    if (resetHits) slots[i].hitEnemyIds.clear();
  }

  // Remove excess slots (level-down not possible but keep as safety)
  for (let i = ballCount; i < slots.length; i++) slots[i].active = false;
}

// ─── Whip ─────────────────────────────────────────────────────────────────────
// Horizontal sweep that hits all enemies in an arc
function tickWhip(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const cooldown = Math.max(0.4, 1.0 - (weapon.level - 1) * 0.1);
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;
  weapon.cooldownTimer = cooldown;

  const damage = 20 + weapon.level * 8;
  const length = 100 + weapon.level * 20;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  // Spawn two thin, wide projectiles left and right
  for (const dir of [-1, 1]) {
    spawnProjectile(
      gs, px + dir * (length / 2), py,
      dir * 50, 0,
      damage, 0.2, length / 2, 'whip'
    );
  }
}

// ─── Main dispatcher ─────────────────────────────────────────────────────────

export function tickWeapons(gs: GameState, dt: number): void {
  for (const weapon of gs.player.weapons) {
    switch (weapon.id) {
      case 'dagger':   tickDagger(gs, weapon, dt); break;
      case 'fireball': tickFireball(gs, weapon, dt); break;
      case 'whip':     tickWhip(gs, weapon, dt); break;
    }
  }
}
