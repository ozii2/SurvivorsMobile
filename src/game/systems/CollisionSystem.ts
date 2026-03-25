import { GameState } from '../state/types';
import { GameConfig, EnemyConfig } from '../config/GameConfig';
import { spawnGem } from './XPGemSystem';
import { spawnDeathParticles } from './ParticleSystem';

export function tickCollisions(gs: GameState): void {
  const p = gs.player;

  // ─── Projectile vs Enemy ───────────────────────────────────────────────────
  for (let pi = 0; pi < gs.projectiles.length; pi++) {
    const proj = gs.projectiles[pi];
    if (!proj.active) continue;

    for (let ei = 0; ei < gs.enemies.length; ei++) {
      const enemy = gs.enemies[ei];
      if (!enemy.active) continue;
      if (proj.hitEnemyIds.has(enemy.id)) continue;

      const dx = proj.position.x - enemy.position.x;
      const dy = proj.position.y - enemy.position.y;
      const minDist = proj.radius + enemy.radius;
      if (dx * dx + dy * dy < minDist * minDist) {
        enemy.hp -= proj.damage;
        enemy.hitFlashTimer = 0.12;
        proj.hitEnemyIds.add(enemy.id);

        // Whip/fireball can pierce; dagger deactivates on first hit
        if (proj.weaponId === 'dagger') {
          proj.active = false;
        }

        if (enemy.hp <= 0) {
          const cfg = EnemyConfig[enemy.type];
          enemy.active = false;
          spawnGem(gs, enemy.position.x, enemy.position.y, enemy.xpValue);
          spawnDeathParticles(gs, enemy.position.x, enemy.position.y, cfg.color);
        }
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
        const dmg = Math.max(1, enemy.damage - p.armor);
        p.hp -= dmg;
        p.invincibleTimer = GameConfig.PLAYER_IFRAMES;
        gs.shakeTimer = 0.30;
        gs.shakeMagnitude = 7;
        enemy.contactTimer = 0.5;

        if (p.hp <= 0) {
          p.hp = 0;
          gs.isGameOver = true;
          gs.isPaused = true;
        }
        break; // one hit per frame is enough
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
      // Collect
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
      // Magnetize
      gem.isMagnetized = true;
    }
  }
}
