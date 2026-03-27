import { GameState, WeaponInstance, ProjectileEntity, Vec2 } from '../state/types';
import { spawnProjectile } from './ProjectileSystem';
import { LightningConfig } from '../config/GameConfig';
import { spawnParticle } from './ParticleSystem';

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
  const baseDamage = 8 + weapon.level * 4;
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const damage = isCrit ? baseDamage * 2 : baseDamage;
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

  const baseDamage = 20 + weapon.level * 8;
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const damage = isCrit ? baseDamage * 2 : baseDamage;
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

// ─── Lightning ────────────────────────────────────────────────────────────────
// Instant-hit: finds N nearest enemies and damages them immediately.

function _findNearestEnemies(gs: GameState, count: number): typeof gs.enemies {
  // Collect active enemies sorted by distance
  const px = gs.player.position.x;
  const py = gs.player.position.y;
  const withDist: { e: (typeof gs.enemies)[0]; d: number }[] = [];
  for (let i = 0; i < gs.enemies.length; i++) {
    const e = gs.enemies[i];
    if (!e.active) continue;
    const dx = e.position.x - px;
    const dy = e.position.y - py;
    withDist.push({ e, d: dx * dx + dy * dy });
  }
  withDist.sort((a, b) => a.d - b.d);
  return withDist.slice(0, count).map(x => x.e);
}

function _spawnLightningParticles(gs: GameState, from: Vec2, to: Vec2): void {
  const steps = 12;
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // İç içe iki zikzak: büyük + küçük titreşim
    const jitter = (Math.random() - 0.5) * 20 + (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 20 + (Math.random() - 0.5) * 8;
    const px = from.x + dx * t + jitter;
    const py = from.y + dy * t + jitterY;

    // Hafif dışa hız (yıldırım dağılıyor gibi)
    const vx = (Math.random() - 0.5) * 30;
    const vy = (Math.random() - 0.5) * 30;

    // Dış katman: büyük cyan
    spawnParticle(gs, px, py, vx, vy, '#00ffff', 0.18, 6);
    // İç çekirdek: küçük beyaz
    spawnParticle(gs, px, py, vx * 0.5, vy * 0.5, '#ffffff', 0.12, 3);
  }

  // Impact flash: büyük parlak patlama hedef noktada
  for (let f = 0; f < 6; f++) {
    const angle = (Math.PI * 2 * f) / 6;
    const speed = 60 + Math.random() * 60;
    spawnParticle(
      gs,
      to.x, to.y,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      '#ffffff', 0.20, 8
    );
  }
  spawnParticle(gs, to.x, to.y, 0, 0, '#00ffff', 0.25, 14);

  // Kaynak noktada küçük flaş
  spawnParticle(gs, from.x, from.y, 0, 0, '#ffffff', 0.10, 8);
}

function tickLightning(gs: GameState, weapon: WeaponInstance, dt: number): void {
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;

  const level = Math.min(weapon.level, 8) as keyof typeof LightningConfig;
  const cfg = LightningConfig[level];
  weapon.cooldownTimer = cfg.cooldown;

  const targets = _findNearestEnemies(gs, cfg.targets);
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const dmg = isCrit ? cfg.damage * 2 : cfg.damage;

  for (const enemy of targets) {
    enemy.hp -= dmg;
    enemy.hitFlashTimer = 0.12;
    _spawnLightningParticles(gs, gs.player.position, enemy.position);

    if (enemy.hp <= 0) {
      // Let CollisionSystem handle kill cleanup via inactive flag check;
      // set inactive here so it's picked up this frame.
      enemy.active = false;
      if (gs.player.lifesteal > 0 && Math.random() < gs.player.lifesteal) {
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 1);
      }
      // Spawn death particles inline (import would be circular via CollisionSystem)
    }
  }
}

// ─── Main dispatcher ─────────────────────────────────────────────────────────

export function tickWeapons(gs: GameState, dt: number): void {
  for (const weapon of gs.player.weapons) {
    switch (weapon.id) {
      case 'dagger':    tickDagger(gs, weapon, dt); break;
      case 'fireball':  tickFireball(gs, weapon, dt); break;
      case 'whip':      tickWhip(gs, weapon, dt); break;
      case 'lightning': tickLightning(gs, weapon, dt); break;
    }
  }
}
