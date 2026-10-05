import { GameState, WeaponInstance, ProjectileEntity, PlayerEntity, EnemyEntity } from '../state/types';
import { spawnProjectile } from './ProjectileSystem';
import { LightningConfig, GarlicConfig, CrossConfig, DeathAuraConfig } from '../config/GameConfig';
import { spawnParticle } from './ParticleSystem';
import { handleEnemyDeath } from './CollisionSystem';
import { spawnDamageNumber } from './DamageNumberSystem';

const TWO_PI = Math.PI * 2;

// ─── Module-level tamponlar: tick başına dizi/nesne ayırmamak için ──────────
// Yörünge silahlarının (fireball/hellfire/divine_blade) mermi yuvaları; her çağrıda length = 0
const _slotBuf: ProjectileEntity[] = [];
// _findNearestEnemies sonucu (en yakından uzağa) ve mesafe kareleri
const _nearBuf: EnemyEntity[] = [];
const _nearDistBuf: number[] = [];
// Sabit yön dizileri
const CROSS_DIRS: readonly (readonly [number, number])[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const WHIP_DIRS: readonly number[] = [-1, 1];

// ─── Dagger ──────────────────────────────────────────────────────────────────
function tickDagger(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const baseCooldown = Math.max(0.22, (0.65 - (weapon.level - 1) * 0.06) * gs.player.cooldownMultiplier);
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;
  weapon.cooldownTimer = baseCooldown;

  const dirCount = weapon.level + 1;
  const speed = 320 + weapon.level * 30;
  const baseDamage = Math.round((6 + weapon.level * 3) * gs.player.mightMultiplier);
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const damage = isCrit ? baseDamage * 2 : baseDamage;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  for (let i = 0; i < dirCount; i++) {
    const angle = (TWO_PI / dirCount) * i;
    spawnProjectile(gs, px, py,
      Math.cos(angle) * speed, Math.sin(angle) * speed,
      damage, 1.2, 5, 'dagger', isCrit);
  }
}

// ─── Fireball ─────────────────────────────────────────────────────────────────
function tickFireball(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const orbitSpeed  = 1.8 + weapon.level * 0.3;
  const orbitRadius = 60  + weapon.level * 10;
  const damage      = Math.round((12 + weapon.level * 4) * gs.player.mightMultiplier);
  const ballCount   = Math.max(1, weapon.level);
  const radius      = 12  + weapon.level * 2;

  weapon.angle = ((weapon.angle ?? 0) + orbitSpeed * dt) % TWO_PI;

  weapon.cooldownTimer -= dt;
  const resetHits = weapon.cooldownTimer <= 0;
  if (resetHits) weapon.cooldownTimer = 0.70;

  const slots = _slotBuf;
  slots.length = 0;
  for (let i = 0; i < gs.projectiles.length; i++) {
    const p = gs.projectiles[i];
    if (p.active && p.weaponId === 'fireball') slots.push(p);
  }

  while (slots.length < ballCount) {
    const slot = spawnProjectile(gs, 0, 0, 0, 0, damage, 99999, radius, 'fireball');
    if (!slot) break;
    slots.push(slot);
  }

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

  for (let i = ballCount; i < slots.length; i++) slots[i].active = false;
}

// ─── Whip ─────────────────────────────────────────────────────────────────────
function tickWhip(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const cooldown = Math.max(0.55, (1.30 - (weapon.level - 1) * 0.10) * gs.player.cooldownMultiplier);
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;
  weapon.cooldownTimer = cooldown;

  const baseDamage = Math.round((16 + weapon.level * 6) * gs.player.mightMultiplier);
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const damage = isCrit ? baseDamage * 2 : baseDamage;
  const length = 100 + weapon.level * 20;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  for (let d = 0; d < WHIP_DIRS.length; d++) {
    const dir = WHIP_DIRS[d];
    spawnProjectile(gs, px + dir * (length / 2), py,
      dir * 50, 0, damage, 0.2, length / 2, 'whip', isCrit);
  }
}

// ─── Lightning ────────────────────────────────────────────────────────────────
/**
 * En yakın `count` düşmanı _nearBuf'a (yakından uzağa) yazar, bulunan sayıyı döndürür.
 * Sort + nesne dizisi yerine sıralı ekleme: k küçük (≤ 8 + bonus), ayırma yok.
 */
function _findNearestEnemies(gs: GameState, count: number): number {
  if (count <= 0) return 0;
  const px = gs.player.position.x;
  const py = gs.player.position.y;
  let n = 0;
  for (let i = 0; i < gs.enemies.length; i++) {
    const e = gs.enemies[i];
    if (!e.active) continue;
    const dx = e.position.x - px;
    const dy = e.position.y - py;
    const d = dx * dx + dy * dy;

    let j: number;
    if (n < count) {
      j = n++;
    } else if (d < _nearDistBuf[n - 1]) {
      j = n - 1;  // en uzaktakini at
    } else {
      continue;
    }
    // Daha uzak olanları bir sağa kaydırıp doğru yere yerleştir
    while (j > 0 && _nearDistBuf[j - 1] > d) {
      _nearDistBuf[j] = _nearDistBuf[j - 1];
      _nearBuf[j] = _nearBuf[j - 1];
      j--;
    }
    _nearDistBuf[j] = d;
    _nearBuf[j] = e;
  }
  return n;
}

function _spawnLightningParticles(gs: GameState, from: { x: number; y: number }, to: { x: number; y: number }): void {
  const steps = 12;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const jitter  = (Math.random() - 0.5) * 20 + (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 20 + (Math.random() - 0.5) * 8;
    spawnParticle(gs, from.x + dx * t + jitter, from.y + dy * t + jitterY,
      (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, '#00ffff', 0.18, 6);
    spawnParticle(gs, from.x + dx * t + jitter, from.y + dy * t + jitterY,
      0, 0, '#ffffff', 0.12, 3);
  }
  for (let f = 0; f < 6; f++) {
    const angle = (Math.PI * 2 * f) / 6;
    const speed = 60 + Math.random() * 60;
    spawnParticle(gs, to.x, to.y,
      Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffffff', 0.20, 8);
  }
  spawnParticle(gs, to.x, to.y, 0, 0, '#00ffff', 0.25, 14);
  spawnParticle(gs, from.x, from.y, 0, 0, '#ffffff', 0.10, 8);
}

function tickLightning(gs: GameState, weapon: WeaponInstance, dt: number): void {
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;

  const level = Math.min(weapon.level, 8) as keyof typeof LightningConfig;
  const cfg = LightningConfig[level];
  weapon.cooldownTimer = cfg.cooldown * gs.player.cooldownMultiplier;

  const totalTargets = cfg.targets + gs.player.bonusLightningTargets;
  const targetCount = _findNearestEnemies(gs, totalTargets);
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const rawDmg = Math.round(cfg.damage * gs.player.mightMultiplier);
  const dmg = isCrit ? rawDmg * 2 : rawDmg;
  if (isCrit) gs.totalCritsThisRun++;

  for (let t = 0; t < targetCount; t++) {
    const enemy = _nearBuf[t];
    enemy.hp -= dmg;
    enemy.hitFlashTimer = 0.12;
    spawnDamageNumber(gs, enemy.position.x, enemy.position.y, Math.round(dmg), isCrit);
    _spawnLightningParticles(gs, gs.player.position, enemy.position);
    if (enemy.hp <= 0) handleEnemyDeath(gs, enemy);
  }
}

// ─── Garlic ───────────────────────────────────────────────────────────────────
/** Sarımsak hasar yarıçapı. Tick ve çizim aynı formülü kullansın diye tek yerde. */
export function garlicEffectiveRadius(p: PlayerEntity, level: number): number {
  const lv = Math.min(level, 8) as keyof typeof GarlicConfig;
  return GarlicConfig[lv].radius * (1 + p.bonusGarlicRadius);
}

/** Ölüm Bulutu hasar yarıçapı. Tick ve çizim aynı formülü kullansın diye tek yerde. */
export function deathAuraEffectiveRadius(p: PlayerEntity): number {
  return DeathAuraConfig.baseRadius * (1 + p.bonusGarlicRadius);
}

function tickGarlic(gs: GameState, weapon: WeaponInstance, dt: number): void {
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;

  const level = Math.min(weapon.level, 8) as keyof typeof GarlicConfig;
  const cfg = GarlicConfig[level];
  weapon.cooldownTimer = cfg.tickInterval * gs.player.cooldownMultiplier;

  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const rawDmg = Math.round(cfg.damage * gs.player.mightMultiplier);
  const dmg = isCrit ? rawDmg * 2 : rawDmg;
  if (isCrit) gs.totalCritsThisRun++;
  const effectiveRadius = garlicEffectiveRadius(gs.player, weapon.level);
  const radSq = effectiveRadius * effectiveRadius;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  for (let i = 0; i < gs.enemies.length; i++) {
    const enemy = gs.enemies[i];
    if (!enemy.active) continue;
    const dx = enemy.position.x - px;
    const dy = enemy.position.y - py;
    if (dx * dx + dy * dy > radSq) continue;

    enemy.hp -= dmg;
    enemy.hitFlashTimer = 0.10;
    spawnDamageNumber(gs, enemy.position.x, enemy.position.y, Math.round(dmg), isCrit);
    if (enemy.hp <= 0) handleEnemyDeath(gs, enemy);
  }
}

// ─── Cross ────────────────────────────────────────────────────────────────────
function tickCross(gs: GameState, weapon: WeaponInstance, dt: number): void {
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;

  const level = Math.min(weapon.level, 8) as keyof typeof CrossConfig;
  const cfg = CrossConfig[level];
  weapon.cooldownTimer = cfg.cooldown * gs.player.cooldownMultiplier;

  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const rawDmg = Math.round(cfg.damage * gs.player.mightMultiplier);
  const dmg = isCrit ? rawDmg * 2 : rawDmg;
  const lifetime = cfg.lifetime * (1 + gs.player.bonusPierceLifetime);
  const speed = 280;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  for (let d = 0; d < CROSS_DIRS.length; d++) {
    const dir = CROSS_DIRS[d];
    spawnProjectile(gs, px, py,
      dir[0] * speed, dir[1] * speed,
      dmg, lifetime, cfg.radius, 'cross', isCrit);
  }
}

// ─── Evolved: Blood Blade ─────────────────────────────────────────────────────
function tickBloodBlade(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const baseCooldown = Math.max(0.15, 0.45 * gs.player.cooldownMultiplier);
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;
  weapon.cooldownTimer = baseCooldown;

  const dirCount = 4;
  const speed = 350;
  const baseDamage = Math.round(52 * gs.player.mightMultiplier); // level-8 dagger base
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const damage = isCrit ? baseDamage * 2 : baseDamage;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  for (let i = 0; i < dirCount; i++) {
    const angle = (TWO_PI / dirCount) * i;
    spawnProjectile(gs, px, py,
      Math.cos(angle) * speed, Math.sin(angle) * speed,
      damage, 1.4, 6, 'blood_blade', isCrit);
  }
}

// ─── Evolved: Hellfire ────────────────────────────────────────────────────────
function tickHellfire(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const orbitSpeed  = 3.2;
  const orbitRadius = 80;
  const damage      = Math.round(65 * gs.player.mightMultiplier);
  const ballCount   = 6;
  const radius      = 16;

  weapon.angle = ((weapon.angle ?? 0) + orbitSpeed * dt) % TWO_PI;
  weapon.cooldownTimer -= dt;
  const resetHits = weapon.cooldownTimer <= 0;
  if (resetHits) weapon.cooldownTimer = 0.45 * gs.player.cooldownMultiplier;

  const slots = _slotBuf;
  slots.length = 0;
  for (let i = 0; i < gs.projectiles.length; i++) {
    const p = gs.projectiles[i];
    if (p.active && p.weaponId === 'hellfire') slots.push(p);
  }

  while (slots.length < ballCount) {
    const slot = spawnProjectile(gs, 0, 0, 0, 0, damage, 99999, radius, 'hellfire');
    if (!slot) break;
    slots.push(slot);
  }

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

  for (let i = ballCount; i < slots.length; i++) slots[i].active = false;
}

// ─── Evolved: Soul Whip ───────────────────────────────────────────────────────
function tickSoulWhip(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const cooldown = Math.max(0.35, 0.85 * gs.player.cooldownMultiplier);
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;
  weapon.cooldownTimer = cooldown;

  const baseDamage = Math.round(80 * gs.player.mightMultiplier);
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const damage = isCrit ? baseDamage * 2 : baseDamage;
  const length = 220;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  // Her vuruşta 90° dön: sabit yönlerde yukarısı hiç vurulmuyordu
  weapon.angle = ((weapon.angle ?? 0) + Math.PI / 2) % TWO_PI;

  // 270° süpürme: weapon.angle'dan başlayan 3 yay (dizi ayırmamak için döngüde hesaplanır)
  for (let k = 0; k < 3; k++) {
    const baseAngle = weapon.angle + k * (Math.PI / 2);
    const projX = px + Math.cos(baseAngle) * (length / 2);
    const projY = py + Math.sin(baseAngle) * (length / 2);
    const proj = spawnProjectile(gs, projX, projY,
      Math.cos(baseAngle) * 80, Math.sin(baseAngle) * 80,
      damage, 0.25, length / 2, 'soul_whip', isCrit);
    if (proj) {
      // Apply knockback to nearby enemies
      for (let i = 0; i < gs.enemies.length; i++) {
        const e = gs.enemies[i];
        if (!e.active) continue;
        const dx = e.position.x - projX;
        const dy = e.position.y - projY;
        const distSq = dx * dx + dy * dy;
        if (distSq < (length / 2 + e.radius) * (length / 2 + e.radius) && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          e.velocity.x += (dx / dist) * 80;
          e.velocity.y += (dy / dist) * 80;
        }
      }
    }
  }
}

// ─── Evolved: Thunder Storm ───────────────────────────────────────────────────
function tickThunderStorm(gs: GameState, weapon: WeaponInstance, dt: number): void {
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;
  weapon.cooldownTimer = 0.85 * gs.player.cooldownMultiplier;

  const maxTargets = 8;
  const targetCount = _findNearestEnemies(gs, maxTargets);
  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const rawDmg = Math.round(50 * gs.player.mightMultiplier);
  const dmg = isCrit ? rawDmg * 2 : rawDmg;
  if (isCrit) gs.totalCritsThisRun++;

  for (let t = 0; t < targetCount; t++) {
    const enemy = _nearBuf[t];
    enemy.hp -= dmg;
    enemy.hitFlashTimer = 0.12;
    spawnDamageNumber(gs, enemy.position.x, enemy.position.y, Math.round(dmg), isCrit);
    _spawnLightningParticles(gs, gs.player.position, enemy.position);
    if (enemy.hp <= 0) handleEnemyDeath(gs, enemy);
  }
}

// ─── Evolved: Death Aura ─────────────────────────────────────────────────────
function tickDeathAura(gs: GameState, weapon: WeaponInstance, dt: number): void {
  weapon.cooldownTimer -= dt;
  if (weapon.cooldownTimer > 0) return;

  // Eski 210 × 2 = 420 px tüm ekranı kaplıyordu; değerler artık DeathAuraConfig'te
  const effectiveRadius = deathAuraEffectiveRadius(gs.player);
  weapon.cooldownTimer = DeathAuraConfig.tickInterval * gs.player.cooldownMultiplier;

  const isCrit = gs.player.critChance > 0 && Math.random() < gs.player.critChance;
  const rawDmg = Math.round(DeathAuraConfig.damage * gs.player.mightMultiplier);
  const dmg = isCrit ? rawDmg * 2 : rawDmg;
  if (isCrit) gs.totalCritsThisRun++;
  const radSq = effectiveRadius * effectiveRadius;
  const px = gs.player.position.x;
  const py = gs.player.position.y;

  let totalDamageDealt = 0;
  for (let i = 0; i < gs.enemies.length; i++) {
    const enemy = gs.enemies[i];
    if (!enemy.active) continue;
    const dx = enemy.position.x - px;
    const dy = enemy.position.y - py;
    if (dx * dx + dy * dy > radSq) continue;

    enemy.hp -= dmg;
    enemy.hitFlashTimer = 0.10;
    totalDamageDealt += dmg;
    spawnDamageNumber(gs, enemy.position.x, enemy.position.y, Math.round(dmg), isCrit);
    if (enemy.hp <= 0) handleEnemyDeath(gs, enemy);
  }

  // Verilen hasarın bir kısmı kadar can çalma
  if (totalDamageDealt > 0) {
    const heal = Math.floor(totalDamageDealt * DeathAuraConfig.lifestealRatio);
    if (heal > 0) {
      gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + heal);
      gs.lifestealHealedThisRun += heal;
    }
  }
}

// ─── Evolved: Divine Blade ───────────────────────────────────────────────────
function tickDivineBlade(gs: GameState, weapon: WeaponInstance, dt: number): void {
  const orbitSpeed  = 2.2;
  const orbitRadius = 70;
  const damage      = Math.round(100 * gs.player.mightMultiplier);
  const bladeCount  = 3;
  const radius      = 20;
  const lifetime    = (1 + gs.player.bonusPierceLifetime) * 99999;

  weapon.angle = ((weapon.angle ?? 0) + orbitSpeed * dt) % TWO_PI;
  weapon.cooldownTimer -= dt;
  const resetHits = weapon.cooldownTimer <= 0;
  if (resetHits) weapon.cooldownTimer = 0.35 * gs.player.cooldownMultiplier;

  const slots = _slotBuf;
  slots.length = 0;
  for (let i = 0; i < gs.projectiles.length; i++) {
    const p = gs.projectiles[i];
    if (p.active && p.weaponId === 'divine_blade') slots.push(p);
  }

  while (slots.length < bladeCount) {
    const slot = spawnProjectile(gs, 0, 0, 0, 0, damage, lifetime, radius, 'divine_blade');
    if (!slot) break;
    slots.push(slot);
  }

  const px = gs.player.position.x;
  const py = gs.player.position.y;
  for (let i = 0; i < Math.min(slots.length, bladeCount); i++) {
    const angle = weapon.angle + (TWO_PI / bladeCount) * i;
    slots[i].position.x = px + Math.cos(angle) * orbitRadius;
    slots[i].position.y = py + Math.sin(angle) * orbitRadius;
    slots[i].velocity.x = 0;
    slots[i].velocity.y = 0;
    slots[i].lifetime   = 99999;
    slots[i].damage     = damage;
    slots[i].radius     = radius;
    if (resetHits) slots[i].hitEnemyIds.clear();
  }

  for (let i = bladeCount; i < slots.length; i++) slots[i].active = false;
}

// ─── Main dispatcher ─────────────────────────────────────────────────────────

export function tickWeapons(gs: GameState, dt: number): void {
  for (const weapon of gs.player.weapons) {
    switch (weapon.id) {
      case 'dagger':       tickDagger(gs, weapon, dt);       break;
      case 'fireball':     tickFireball(gs, weapon, dt);     break;
      case 'whip':         tickWhip(gs, weapon, dt);         break;
      case 'lightning':    tickLightning(gs, weapon, dt);    break;
      case 'garlic':       tickGarlic(gs, weapon, dt);       break;
      case 'cross':        tickCross(gs, weapon, dt);        break;
      // Evolved weapons
      case 'blood_blade':  tickBloodBlade(gs, weapon, dt);  break;
      case 'hellfire':     tickHellfire(gs, weapon, dt);     break;
      case 'soul_whip':    tickSoulWhip(gs, weapon, dt);    break;
      case 'thunder_storm':tickThunderStorm(gs, weapon, dt);break;
      case 'death_aura':   tickDeathAura(gs, weapon, dt);   break;
      case 'divine_blade': tickDivineBlade(gs, weapon, dt); break;
    }
  }
}
