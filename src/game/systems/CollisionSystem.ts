import { GameState, EnemyEntity } from '../state/types';
import { GameConfig, EnemyConfig, EXPLOSIVE_AOE_RADIUS, EXPLOSIVE_AOE_DAMAGE } from '../config/GameConfig';
import { spawnGem } from './XPGemSystem';
import { spawnDeathParticles, spawnParticle } from './ParticleSystem';
import { spawnDamageNumber } from './DamageNumberSystem';
import { spawnChest } from './ChestSystem';
import { hapticHeavy } from '../../services/AudioService';

// Module-level buffer — reused each frame, avoids per-call allocation
const _activeEnemyBuf: number[] = [];

// ─── Shared death handler (used by CollisionSystem + WeaponSystem) ────────────
export function handleEnemyDeath(gs: GameState, enemy: EnemyEntity): void {
  const cfg = EnemyConfig[enemy.type];
  enemy.active = false;
  spawnGem(gs, enemy.position.x, enemy.position.y, enemy.xpValue);
  spawnDeathParticles(gs, enemy.position.x, enemy.position.y, cfg.color);

  // Combo + kill tracking
  gs.killCombo++;
  gs.comboTimer = 3.0;
  if (gs.killCombo > gs.maxComboThisRun) gs.maxComboThisRun = gs.killCombo;
  gs.totalKillsThisRun++;
  if (enemy.type === 'boss') gs.bossKilledThisRun = true;

  if (gs.player.lifesteal > 0 && Math.random() < gs.player.lifesteal) {
    gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 1);
    gs.lifestealHealedThisRun++;
  }

  // Boss or elite drops a chest
  if (enemy.type === 'boss' || enemy.isElite) {
    spawnChest(gs, enemy.position.x, enemy.position.y, enemy.type === 'boss');
  }

  // Explosive: AoE blast on death
  if (enemy.type === 'explosive') {
    const dx = gs.player.position.x - enemy.position.x;
    const dy = gs.player.position.y - enemy.position.y;
    if (dx * dx + dy * dy < EXPLOSIVE_AOE_RADIUS * EXPLOSIVE_AOE_RADIUS) {
      gs.player.hp = Math.max(0, gs.player.hp - EXPLOSIVE_AOE_DAMAGE);
      gs.totalDamageTaken += EXPLOSIVE_AOE_DAMAGE;
      if (gs.player.hp <= 0) {
        gs.player.hp = 0;
        gs.isGameOver = true;
        gs.isPaused = true;
      }
      gs.shakeTimer = 0.45;
      gs.shakeMagnitude = 14;
      hapticHeavy();
    }
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16;
      const speed = 100 + Math.random() * 120;
      spawnParticle(gs, enemy.position.x, enemy.position.y,
        Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff8800', 0.55, 7);
    }
    spawnParticle(gs, enemy.position.x, enemy.position.y, 0, 0, '#ffdd00', 0.35, 20);
  }
}

export function tickCollisions(gs: GameState): void {
  const p = gs.player;

  // Build compact active-enemy index
  _activeEnemyBuf.length = 0;
  for (let ei = 0; ei < gs.enemies.length; ei++) {
    if (gs.enemies[ei].active) _activeEnemyBuf.push(ei);
  }
  const aLen = _activeEnemyBuf.length;

  // ─── Projectile vs Enemy ───────────────────────────────────────────────────
  for (let pi = 0; pi < gs.projectiles.length; pi++) {
    const proj = gs.projectiles[pi];
    if (!proj.active) continue;

    for (let ai = 0; ai < aLen; ai++) {
      const enemy = gs.enemies[_activeEnemyBuf[ai]];
      if (!enemy.active) continue;
      if (proj.hitEnemyIds.has(enemy.id)) continue;

      const dx = proj.position.x - enemy.position.x;
      const dy = proj.position.y - enemy.position.y;
      const minDist = proj.radius + enemy.radius;
      if (dx * dx + dy * dy < minDist * minDist) {
        enemy.hp -= proj.damage;
        enemy.hitFlashTimer = 0.12;
        proj.hitEnemyIds.add(enemy.id);
        if (proj.isCrit) gs.totalCritsThisRun++;
        spawnDamageNumber(gs, enemy.position.x, enemy.position.y, Math.round(proj.damage), proj.isCrit);

        if (proj.weaponId === 'dagger') proj.active = false;

        // blood_blade: 50% chance to heal 1 HP on hit
        if (proj.weaponId === 'blood_blade' && Math.random() < 0.5) {
          gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 1);
          gs.lifestealHealedThisRun++;
        }

        if (enemy.hp <= 0) handleEnemyDeath(gs, enemy);
      }
    }
  }

  // ─── Player vs Enemy ───────────────────────────────────────────────────────
  if (p.invincibleTimer <= 0) {
    for (let ei = 0; ei < gs.enemies.length; ei++) {
      const enemy = gs.enemies[ei];
      if (!enemy.active || enemy.contactTimer > 0) continue;

      const dx = p.position.x - enemy.position.x;
      const dy = p.position.y - enemy.position.y;
      const minDist = p.radius + enemy.radius;
      if (dx * dx + dy * dy < minDist * minDist) {
        const armorReduction = p.armor / (p.armor + 20);
        const dmg = Math.max(1, Math.round(enemy.damage * (1 - armorReduction)));
        p.hp -= dmg;
        p.invincibleTimer = GameConfig.PLAYER_IFRAMES;
        gs.shakeTimer = 0.30;
        gs.shakeMagnitude = 7;
        enemy.contactTimer = 0.5;
        // Reset combo on taking damage
        gs.killCombo = 0;
        gs.totalDamageTaken += dmg;
        hapticHeavy();

        if (p.hp <= 0) {
          p.hp = 0;
          gs.isGameOver = true;
          gs.isPaused = true;
        }
        break;
      }
    }
  }

  // ─── Player vs XP Gems ─────────────────────────────────────────────────────
  const magnetRadiusSq = p.magnetRadius * p.magnetRadius;
  const collectRadiusSq = (p.radius + 12) * (p.radius + 12);

  for (let gi = 0; gi < gs.xpGems.length; gi++) {
    const gem = gs.xpGems[gi];
    if (!gem.active) continue;

    const dx = p.position.x - gem.position.x;
    const dy = p.position.y - gem.position.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < collectRadiusSq) {
      gem.active = false;
      p.xp += gem.value;
      if (p.xp >= p.xpToNextLevel) {
        p.xp -= p.xpToNextLevel;
        p.level++;
        p.xpToNextLevel = Math.floor(
          GameConfig.XP_BASE * Math.pow(GameConfig.XP_SCALE, p.level - 1)
        );
        gs.pendingLevelUp = true;
      }
    } else if (distSq < magnetRadiusSq) {
      gem.isMagnetized = true;
    }
  }
}
