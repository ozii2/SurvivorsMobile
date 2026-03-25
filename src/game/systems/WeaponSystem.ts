import { GameState, WeaponInstance } from '../state/types';
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
// Orbiting fireballs that rotate around the player
function tickFireball(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const orbitSpeed = 1.8 + weapon.level * 0.3; // rad/sec
  const orbitRadius = 60 + weapon.level * 10;
  const damage = 15 + weapon.level * 5;
  const ballCount = weapon.level;

  weapon.angle = ((weapon.angle ?? 0) + orbitSpeed * dt) % TWO_PI;
  const cooldown = 0.05; // just for spawning — we track via angle
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;
  weapon.cooldownTimer = cooldown;

  // Spawn burst of orbs positioned in a circle (they stay still for 1 frame)
  // Actually fireball is better modeled as persistent, but for pool approach:
  // Spawn short-lifetime orbs that are re-spawned each frame at orbit position
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  for (let i = 0; i < ballCount; i++) {
    const baseAngle = weapon.angle + (TWO_PI / ballCount) * i;
    const ox = px + Math.cos(baseAngle) * orbitRadius;
    const oy = py + Math.sin(baseAngle) * orbitRadius;
    // Velocity perpendicular to radius for circular motion look
    spawnProjectile(
      gs, ox, oy,
      Math.cos(baseAngle + Math.PI / 2) * 20,
      Math.sin(baseAngle + Math.PI / 2) * 20,
      damage, 0.08, 12 + weapon.level * 2, 'fireball'
    );
  }
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
