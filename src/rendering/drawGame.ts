/**
 * drawGame — imperative Skia drawing functions.
 * No React, no JSX, no per-frame object allocation (except gradient shaders
 * for position-dependent gradients which must be recreated each draw).
 * canvas.rotate() takes DEGREES, not radians.
 */
import { SkCanvas, SkImage } from '@shopify/react-native-skia';
import { GameState, Vec2, EnemyEntity } from '../game/state/types';
import { GarlicConfig } from '../game/config/GameConfig';
import {
  Skia, TileMode,
  GRID_SIZE, NEBULAS, STARS,
  ENEMY_GLOW_COLS, ENEMY_BODY_COLS, HIT_FLASH_COL, HIGHLIGHT_COL,
  bgGradPaint, topVignettePaint, botVignettePaint,
  nebulaPaint, starPaint, gridLinePaint,
  enemyGlowPaint, enemyBodyPaint, enemyHPBgPaint, enemyHPFillPaint,
  highlightPaint, bossRingPaint1, bossRingPaint2,
  daggerGlowPaint, daggerBladePaint,
  fireballRingPaint, fireballGlowPaint, fireballBodyPaint, fireballCorePaint,
  whipGlowPaint, whipBodyPaint,
  crossGlowPaint, crossBarPaint, crossCorePaint,
  garlicAuraFillPaint, garlicAuraRingPaint, garlicAuraInnerPaint,
  fallbackGlowPaint, fallbackBodyPaint,
  gemGlowPaint, gemBodyPaint, gemCorePaint,
  playerGlowOutPaint, playerGlowMidPaint, playerGlowInPaint,
  playerBodyPaint, playerShadowPaint, playerPhotoPaint,
  ClipOp,
  particlePaint,
  dmgNumNormalPaint, dmgNumCritPaint, dmgNumBigPaint,
  comboTextPaint, announceTextPaint, announceBgPaint,
  hudHPGlowPaint, hudHPTrackPaint, hudHPFillPaint,
  hudXPGlowPaint, hudXPTrackPaint, hudXPFillPaint,
  hudTextPaint, hudBossTextPaint,
  hudBossBgPaint, hudBossBarBgPaint, hudBossBarFillPaint,
  nearDeathPaint,
  FONT, BOSS_FONT, DAMAGE_FONT, DAMAGE_FONT_CRIT, COMBO_FONT, ANNOUNCE_FONT,
} from './GamePaints';

const RAD2DEG = 180 / Math.PI;

// ── Public entry point ────────────────────────────────────────────────────────

export function drawFrame(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
  bodyColor?: string,
  glowRgb?: string,
  playerImage?: SkImage | null,
): void {
  drawBackground(canvas, worldOffset, screenW, screenH, gs.currentBiomeId);
  drawXPGems(canvas, gs, worldOffset, screenW, screenH);
  drawChests(canvas, gs, worldOffset, screenW, screenH);
  drawEnemies(canvas, gs, worldOffset, screenW, screenH);
  drawProjectiles(canvas, gs, worldOffset, screenW, screenH);
  drawParticles(canvas, gs, worldOffset, screenW, screenH);
  drawPlayer(canvas, gs, worldOffset, bodyColor, glowRgb, playerImage);
  drawDamageNumbers(canvas, gs, worldOffset, screenW, screenH);
  drawHUD(canvas, gs, screenW, screenH);
  drawWaveAnnounce(canvas, gs, screenW, screenH);
}

// ── Background ────────────────────────────────────────────────────────────────

const BIOME_PALETTE: Record<string, { grad: [string, string, string]; grid: string }> = {
  nebula:  { grad: ['#1a0b38', '#0f0a28', '#07060f'], grid: 'rgba(79,195,247,0.06)'   },
  dungeon: { grad: ['#1a0808', '#120404', '#080101'], grid: 'rgba(255,100,50,0.07)'   },
  void:    { grad: ['#030a0f', '#000508', '#000003'], grid: 'rgba(0,220,180,0.07)'    },
};

function drawBackground(
  canvas: SkCanvas,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
  biomeId: string = 'nebula',
): void {
  const palette = BIOME_PALETTE[biomeId] ?? BIOME_PALETTE.nebula;

  // 1. Diagonal base gradient
  bgGradPaint.setShader(Skia.Shader.MakeLinearGradient(
    { x: 0, y: 0 }, { x: screenW, y: screenH },
    [Skia.Color(palette.grad[0]), Skia.Color(palette.grad[1]), Skia.Color(palette.grad[2])],
    null, TileMode.Clamp,
  ));
  canvas.drawRect(Skia.XYWHRect(0, 0, screenW, screenH), bgGradPaint);

  // 2. Top vignette
  topVignettePaint.setShader(Skia.Shader.MakeLinearGradient(
    { x: 0, y: 0 }, { x: 0, y: screenH * 0.35 },
    [Skia.Color('rgba(0,0,0,0.45)'), Skia.Color('rgba(0,0,0,0)')],
    null, TileMode.Clamp,
  ));
  canvas.drawRect(Skia.XYWHRect(0, 0, screenW, screenH * 0.35), topVignettePaint);

  // 3. Bottom vignette
  botVignettePaint.setShader(Skia.Shader.MakeLinearGradient(
    { x: 0, y: screenH * 0.65 }, { x: 0, y: screenH },
    [Skia.Color('rgba(0,0,0,0)'), Skia.Color('rgba(0,0,0,0.50)')],
    null, TileMode.Clamp,
  ));
  canvas.drawRect(Skia.XYWHRect(0, screenH * 0.65, screenW, screenH * 0.35), botVignettePaint);

  // 4. Nebulas (viewport-culled)
  for (let n = 0; n < NEBULAS.length; n++) {
    const [wx, wy, r, color] = NEBULAS[n];
    const sx = wx - worldOffset.x;
    const sy = wy - worldOffset.y;
    if (sx + r <= 0 || sx - r >= screenW || sy + r <= 0 || sy - r >= screenH) continue;
    nebulaPaint.setColor(Skia.Color(color));
    canvas.drawCircle(sx, sy, r, nebulaPaint);
  }

  // 5. Grid lines
  gridLinePaint.setColor(Skia.Color(palette.grid));
  const startX = Math.floor(worldOffset.x / GRID_SIZE) * GRID_SIZE;
  const startY = Math.floor(worldOffset.y / GRID_SIZE) * GRID_SIZE;
  const endX   = worldOffset.x + screenW + GRID_SIZE;
  const endY   = worldOffset.y + screenH + GRID_SIZE;
  for (let wx = startX; wx < endX; wx += GRID_SIZE) {
    const sx = wx - worldOffset.x;
    canvas.drawLine(sx, 0, sx, screenH, gridLinePaint);
  }
  for (let wy = startY; wy < endY; wy += GRID_SIZE) {
    const sy = wy - worldOffset.y;
    canvas.drawLine(0, sy, screenW, sy, gridLinePaint);
  }

  // 6. Stars (viewport-culled)
  for (let s = 0; s < STARS.length; s++) {
    const star = STARS[s];
    const sx = star.wx - worldOffset.x;
    const sy = star.wy - worldOffset.y;
    if (sx < -10 || sx > screenW + 10 || sy < -10 || sy > screenH + 10) continue;
    starPaint.setColor(Skia.Color(star.color));
    canvas.drawCircle(sx, sy, star.r, starPaint);
  }
}

// ── XP Gems ───────────────────────────────────────────────────────────────────

function drawXPGems(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
): void {
  const gameTime = gs.gameTime;
  for (let i = 0; i < gs.xpGems.length; i++) {
    const gem = gs.xpGems[i];
    if (!gem.active) continue;
    const sx = gem.position.x - worldOffset.x;
    const sy = gem.position.y - worldOffset.y;
    if (sx < -20 || sx > screenW + 20 || sy < -20 || sy > screenH + 20) continue;

    const r = gem.radius;
    const spinSpeed  = gem.isMagnetized ? 4.0 : 1.5;
    const angleDeg   = gameTime * spinSpeed * RAD2DEG;
    const glowAlpha  = gem.isMagnetized
      ? (0.28 + 0.18 * Math.sin(gameTime * 6)).toFixed(2)
      : '0.18';
    const glowColor  = gem.isMagnetized
      ? `rgba(0,255,220,${glowAlpha})`
      : `rgba(0,229,170,${glowAlpha})`;
    const bodyColor  = gem.isMagnetized ? '#00ffee' : '#00e5aa';

    canvas.save();
    canvas.rotate(angleDeg, sx, sy);
    gemGlowPaint.setColor(Skia.Color(glowColor));
    canvas.drawRect(Skia.XYWHRect(sx - r * 1.4, sy - r * 1.4, r * 2.8, r * 2.8), gemGlowPaint);
    gemBodyPaint.setColor(Skia.Color(bodyColor));
    canvas.drawRect(Skia.XYWHRect(sx - r * 0.7, sy - r * 0.7, r * 1.4, r * 1.4), gemBodyPaint);
    canvas.drawRect(Skia.XYWHRect(sx - r * 0.25, sy - r * 0.25, r * 0.5, r * 0.5), gemCorePaint);
    canvas.restore();
  }
}

// ── Enemies ───────────────────────────────────────────────────────────────────

function drawEnemies(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
): void {
  const enemies  = gs.enemies;
  const gameTime = gs.gameTime;

  // LOD: count active enemies once for this frame
  let activeCount = 0;
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].active) activeCount++;
  }
  const highDetail = activeCount < 30;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (!e.active) continue;
    const sx  = e.position.x - worldOffset.x;
    const sy  = e.position.y - worldOffset.y;
    const pad = e.radius * 2 + 4;
    if (sx < -pad || sx > screenW + pad || sy < -pad || sy > screenH + pad) continue;

    const isBoss  = e.type === 'boss';
    const isElite = e.isElite && !isBoss;

    // Boss: animated energy rings
    if (isBoss) {
      const ringAlpha = Math.sin(gameTime * 3) * 0.15 + 0.30;
      const ringR     = e.radius * 1.9 + Math.sin(gameTime * 2) * 3;
      bossRingPaint1.setColor(Skia.Color(`rgba(255,50,50,${ringAlpha.toFixed(2)})`));
      bossRingPaint2.setColor(Skia.Color(`rgba(255,80,80,${(ringAlpha * 0.5).toFixed(2)})`));
      canvas.drawCircle(sx, sy, ringR, bossRingPaint1);
      canvas.drawCircle(sx, sy, e.radius * 2.8, bossRingPaint2);
    }

    // Elite: gold outer ring + inner glow
    if (isElite) {
      bossRingPaint2.setColor(Skia.Color('rgba(255,215,0,0.55)'));
      canvas.drawCircle(sx, sy, e.radius * 2.4, bossRingPaint2);
      enemyGlowPaint.setColor(Skia.Color('rgba(255,200,0,0.30)'));
      canvas.drawCircle(sx, sy, e.radius * 1.8, enemyGlowPaint);
    }

    // Glow halo (LOD: skip basic/fast in low-detail mode; elite already drew its glow)
    if (!isElite && (highDetail || e.type === 'tank' || isBoss)) {
      enemyGlowPaint.setColor(ENEMY_GLOW_COLS[e.type]);
      canvas.drawCircle(sx, sy, e.radius * 2.0, enemyGlowPaint);
    }

    // Body (white on hit flash)
    enemyBodyPaint.setColor(e.hitFlashTimer > 0 ? HIT_FLASH_COL : ENEMY_BODY_COLS[e.type]);
    canvas.drawCircle(sx, sy, e.radius, enemyBodyPaint);

    // Highlight (high detail only)
    if (highDetail) {
      canvas.drawCircle(sx - 3, sy - 3, e.radius * 0.3, highlightPaint);
    }

    // HP bar (only when damaged)
    const hpRatio = e.hp / e.maxHp;
    if (hpRatio < 1) {
      const bx = sx - e.radius;
      const by = sy - e.radius - 7;
      const bw = e.radius * 2;
      canvas.drawRect(Skia.XYWHRect(bx, by, bw, 3), enemyHPBgPaint);
      enemyHPFillPaint.setShader(Skia.Shader.MakeLinearGradient(
        { x: bx, y: by }, { x: bx + bw, y: by },
        [Skia.Color('#ff8a80'), Skia.Color('#ff1744')],
        null, TileMode.Clamp,
      ));
      canvas.drawRect(Skia.XYWHRect(bx, by, bw * hpRatio, 3), enemyHPFillPaint);
      enemyHPFillPaint.setShader(null);
    }
  }
}

// ── Projectiles ───────────────────────────────────────────────────────────────

function drawProjectiles(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
): void {
  const projectiles = gs.projectiles;
  const gameTime    = gs.gameTime;

  for (let i = 0; i < projectiles.length; i++) {
    const p = projectiles[i];
    if (!p.active) continue;
    const sx  = p.position.x - worldOffset.x;
    const sy  = p.position.y - worldOffset.y;
    const pad = p.radius * 3 + 4;
    if (sx < -pad || sx > screenW + pad || sy < -pad || sy > screenH + pad) continue;

    if (p.weaponId === 'dagger') {
      const angleDeg = (Math.atan2(p.velocity.y, p.velocity.x) + Math.PI / 2) * RAD2DEG;
      canvas.save();
      canvas.rotate(angleDeg, sx, sy);
      canvas.drawRect(Skia.XYWHRect(sx - 5, sy - 10, 10, 20), daggerGlowPaint);
      canvas.drawRect(Skia.XYWHRect(sx - 2, sy - 8,  4,  16), daggerBladePaint);
      canvas.restore();

    } else if (p.weaponId === 'fireball') {
      const pulseR = p.radius * 1.5 + Math.sin(gameTime * 8) * p.radius * 0.4;
      canvas.drawCircle(sx, sy, pulseR, fireballRingPaint);
      canvas.drawCircle(sx, sy, p.radius * 2.0, fireballGlowPaint);
      canvas.drawCircle(sx, sy, p.radius, fireballBodyPaint);
      canvas.drawCircle(sx, sy, p.radius * 0.45, fireballCorePaint);

    } else if (p.weaponId === 'whip') {
      const wx = sx - p.radius;
      const ww = p.radius * 2;
      canvas.drawRect(Skia.XYWHRect(wx - 4, sy - 8, ww + 8, 16), whipGlowPaint);
      whipBodyPaint.setShader(Skia.Shader.MakeLinearGradient(
        { x: wx, y: sy }, { x: wx + ww, y: sy },
        [
          Skia.Color('rgba(160,60,255,0)'),
          Skia.Color('#cc44ff'),
          Skia.Color('rgba(160,60,255,0)'),
        ],
        [0, 0.5, 1], TileMode.Clamp,
      ));
      canvas.drawRect(Skia.XYWHRect(wx, sy - 3, ww, 6), whipBodyPaint);
      whipBodyPaint.setShader(null);

    } else if (p.weaponId === 'cross') {
      const bar = p.radius;
      const angleDeg = gameTime * 1.2 * RAD2DEG;
      canvas.save();
      canvas.rotate(angleDeg, sx, sy);
      canvas.drawCircle(sx, sy, bar * 2.4, crossGlowPaint);
      // horizontal bar
      canvas.drawRect(Skia.XYWHRect(sx - bar * 2, sy - bar * 0.45, bar * 4, bar * 0.9), crossBarPaint);
      // vertical bar
      canvas.drawRect(Skia.XYWHRect(sx - bar * 0.45, sy - bar * 2, bar * 0.9, bar * 4), crossBarPaint);
      canvas.drawCircle(sx, sy, bar * 0.5, crossCorePaint);
      canvas.restore();

    } else {
      canvas.drawCircle(sx, sy, p.radius * 2.2, fallbackGlowPaint);
      canvas.drawCircle(sx, sy, p.radius, fallbackBodyPaint);
    }
  }
}

// ── Particles ─────────────────────────────────────────────────────────────────

function drawParticles(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
): void {
  const particles = gs.particles;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!p.active) continue;
    const sx = p.position.x - worldOffset.x;
    const sy = p.position.y - worldOffset.y;
    if (sx < -8 || sx > screenW + 8 || sy < -8 || sy > screenH + 8) continue;

    const alpha = Math.max(0, p.lifetime / p.maxLifetime);
    if (alpha < 0.05) continue;

    particlePaint.setColor(Skia.Color(p.color));
    particlePaint.setAlphaf(alpha);
    canvas.drawCircle(sx, sy, p.radius * alpha + 0.5, particlePaint);
  }
}

// ── Player ────────────────────────────────────────────────────────────────────

function drawPlayer(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  bodyColor?: string,
  glowRgb?: string,
  playerImage?: SkImage | null,
): void {
  const player = gs.player;
  const sx = player.position.x - worldOffset.x;
  const sy = player.position.y - worldOffset.y;
  const r  = player.radius;

  const flash = player.invincibleTimer > 0 &&
    Math.floor(player.invincibleTimer * 10) % 2 === 0;

  // Garlic aura (rendered behind player glow)
  const garlicWeapon = player.weapons.find(w => w.id === 'garlic');
  if (garlicWeapon) {
    const level = Math.min(garlicWeapon.level, 8) as keyof typeof GarlicConfig;
    const baseR = GarlicConfig[level].radius;
    const auraR = baseR + Math.sin(gs.gameTime * 3.5) * baseR * 0.05;
    canvas.drawCircle(sx, sy, auraR, garlicAuraFillPaint);
    canvas.drawCircle(sx, sy, auraR, garlicAuraRingPaint);
    canvas.drawCircle(sx, sy, auraR * 0.85, garlicAuraInnerPaint);
  }

  const gr = glowRgb ?? '79,195,247';
  playerGlowOutPaint.setColor(Skia.Color(`rgba(${gr},0.05)`));
  canvas.drawCircle(sx, sy, r * 2.8, playerGlowOutPaint);

  playerGlowMidPaint.setColor(Skia.Color(`rgba(${gr},0.13)`));
  canvas.drawCircle(sx, sy, r * 1.9, playerGlowMidPaint);

  playerGlowInPaint.setColor(Skia.Color(`rgba(${gr},0.25)`));
  canvas.drawCircle(sx, sy, r * 1.35, playerGlowInPaint);

  canvas.drawCircle(sx + 2, sy + 3, r, playerShadowPaint);

  if (playerImage) {
    const clipPath = Skia.Path.Make();
    clipPath.addCircle(sx, sy, r);
    canvas.save();
    canvas.clipPath(clipPath, ClipOp.Intersect, true);
    playerPhotoPaint.setAlphaf(flash ? 0.4 : 1.0);
    canvas.drawImageRect(
      playerImage,
      Skia.XYWHRect(0, 0, playerImage.width(), playerImage.height()),
      Skia.XYWHRect(sx - r, sy - r, r * 2, r * 2),
      playerPhotoPaint,
    );
    canvas.restore();
  } else {
    playerBodyPaint.setColor(flash ? HIT_FLASH_COL : Skia.Color(bodyColor ?? '#4fc3f7'));
    canvas.drawCircle(sx, sy, r, playerBodyPaint);
  }
}

// ── Damage Numbers ────────────────────────────────────────────────────────────

function drawDamageNumbers(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
): void {
  const pool = gs.damageNumbers;
  for (let i = 0; i < pool.length; i++) {
    const dn = pool[i];
    if (!dn.active) continue;
    const progress = 1 - dn.lifetime / dn.maxLifetime;
    const sx = dn.x - worldOffset.x;
    const sy = dn.y - worldOffset.y - progress * 32;
    if (sx < -20 || sx > screenW + 20 || sy < -20 || sy > screenH + 20) continue;

    const alpha = Math.max(0, dn.lifetime / dn.maxLifetime);
    const label = String(dn.value);

    if (dn.value >= 50) {
      dmgNumBigPaint.setAlphaf(alpha);
      if (DAMAGE_FONT_CRIT) canvas.drawText(label, sx - label.length * 4, sy, dmgNumBigPaint, DAMAGE_FONT_CRIT);
    } else if (dn.isCrit) {
      dmgNumCritPaint.setAlphaf(alpha);
      if (DAMAGE_FONT_CRIT) canvas.drawText(label, sx - label.length * 4, sy, dmgNumCritPaint, DAMAGE_FONT_CRIT);
    } else {
      dmgNumNormalPaint.setAlphaf(alpha);
      if (DAMAGE_FONT) canvas.drawText(label, sx - label.length * 3, sy, dmgNumNormalPaint, DAMAGE_FONT);
    }
  }
  // Reset alpha
  dmgNumBigPaint.setAlphaf(1);
  dmgNumCritPaint.setAlphaf(1);
  dmgNumNormalPaint.setAlphaf(1);
}

// ── Wave Announce ─────────────────────────────────────────────────────────────

function drawWaveAnnounce(
  canvas: SkCanvas,
  gs: GameState,
  screenW: number,
  screenH: number,
): void {
  if (gs.waveAnnounceTimer <= 0 || !gs.waveAnnounceText) return;

  const t = gs.waveAnnounceTimer;
  // fade-in first 0.3s, hold, fade-out last 0.3s
  let alpha: number;
  if (t > 1.7) alpha = (2.0 - t) / 0.3;
  else if (t < 0.3) alpha = t / 0.3;
  else alpha = 1.0;
  alpha = Math.max(0, Math.min(1, alpha));

  const text = gs.waveAnnounceText;
  const cx = screenW / 2;
  const cy = screenH * 0.38;

  // Background pill
  announceBgPaint.setAlphaf(alpha * 0.85);
  canvas.drawRect(Skia.XYWHRect(cx - 160, cy - 28, 320, 44), announceBgPaint);

  // Text
  announceTextPaint.setColor(Skia.Color(gs.waveAnnounceColor));
  announceTextPaint.setAlphaf(alpha);
  if (ANNOUNCE_FONT) {
    canvas.drawText(text, cx - text.length * 7.5, cy, announceTextPaint, ANNOUNCE_FONT);
  }
  announceBgPaint.setAlphaf(1);
  announceTextPaint.setAlphaf(1);
}

// ── HUD ───────────────────────────────────────────────────────────────────────

function drawHUD(
  canvas: SkCanvas,
  gs: GameState,
  screenW: number,
  screenH: number,
): void {
  const player  = gs.player;
  const barW    = Math.min(200, screenW - 40);
  const hpRatio = player.hp / player.maxHp;
  const xpRatio = player.xp / player.xpToNextLevel;

  // ── HP bar ──
  canvas.drawRect(Skia.XYWHRect(18, 14, barW + 4, 14), hudHPGlowPaint);
  canvas.drawRect(Skia.XYWHRect(20, 16, barW, 10), hudHPTrackPaint);
  if (hpRatio > 0) {
    hudHPFillPaint.setShader(Skia.Shader.MakeLinearGradient(
      { x: 20, y: 16 }, { x: 20 + barW, y: 16 },
      [Skia.Color('#ff8a80'), Skia.Color('#ff1744')],
      null, TileMode.Clamp,
    ));
    canvas.drawRect(Skia.XYWHRect(20, 16, barW * hpRatio, 10), hudHPFillPaint);
    hudHPFillPaint.setShader(null);
  }

  // ── XP bar ──
  canvas.drawRect(Skia.XYWHRect(18, 29, barW + 4, 10), hudXPGlowPaint);
  canvas.drawRect(Skia.XYWHRect(20, 30, barW, 6), hudXPTrackPaint);
  if (xpRatio > 0) {
    hudXPFillPaint.setShader(Skia.Shader.MakeLinearGradient(
      { x: 20, y: 30 }, { x: 20 + barW, y: 30 },
      [Skia.Color('#80d8ff'), Skia.Color('#0288d1')],
      null, TileMode.Clamp,
    ));
    canvas.drawRect(Skia.XYWHRect(20, 30, barW * xpRatio, 6), hudXPFillPaint);
    hudXPFillPaint.setShader(null);
  }

  // ── Timer + Level ──
  const minutes = Math.floor(gs.gameTime / 60).toString().padStart(2, '0');
  const seconds = Math.floor(gs.gameTime % 60).toString().padStart(2, '0');
  if (FONT) {
    canvas.drawText(`${minutes}:${seconds}`, screenW / 2 - 24, 50, hudTextPaint, FONT);
    canvas.drawText(`Lv ${player.level}`, 20, 55, hudTextPaint, FONT);
  }

  // ── Combo counter ──
  if (gs.killCombo >= 2 && COMBO_FONT) {
    const combo = gs.killCombo;
    const color = combo >= 50 ? '#ff2222'
      : combo >= 25 ? '#ff8833'
      : combo >= 10 ? '#FFD700'
      : '#ffffff';
    comboTextPaint.setColor(Skia.Color(color));
    const label = `x${combo} COMBO`;
    canvas.drawText(label, screenW - label.length * 8 - 10, 50, comboTextPaint, COMBO_FONT);
  }

  // ── Near-death vignette ──
  if (hpRatio < 0.30) {
    _drawNearDeathVignette(canvas, screenW, screenH);
  }

  // ── Boss HP bar ──
  let boss: EnemyEntity | null = null;
  for (let i = 0; i < gs.enemies.length; i++) {
    if (gs.enemies[i].active && gs.enemies[i].type === 'boss') {
      boss = gs.enemies[i];
      break;
    }
  }
  if (boss) {
    const bossBarW = screenW * 0.6;
    const bossBarX = (screenW - bossBarW) / 2;
    const bossBarY = screenH - 36;
    canvas.drawRect(Skia.XYWHRect(bossBarX - 4, bossBarY - 20, bossBarW + 8, 32), hudBossBgPaint);
    canvas.drawRect(Skia.XYWHRect(bossBarX, bossBarY, bossBarW, 10), hudBossBarBgPaint);
    canvas.drawRect(
      Skia.XYWHRect(bossBarX, bossBarY, bossBarW * (boss.hp / boss.maxHp), 10),
      hudBossBarFillPaint,
    );
    if (BOSS_FONT) {
      canvas.drawText('PATRON', bossBarX, bossBarY - 6, hudBossTextPaint, BOSS_FONT);
    }
  }
}

function _drawNearDeathVignette(canvas: SkCanvas, screenW: number, screenH: number): void {
  // Top
  nearDeathPaint.setShader(Skia.Shader.MakeLinearGradient(
    { x: 0, y: 0 }, { x: 0, y: screenH * 0.30 },
    [Skia.Color('rgba(200,0,0,0.18)'), Skia.Color('rgba(200,0,0,0)')],
    null, TileMode.Clamp,
  ));
  canvas.drawRect(Skia.XYWHRect(0, 0, screenW, screenH * 0.30), nearDeathPaint);

  // Bottom
  nearDeathPaint.setShader(Skia.Shader.MakeLinearGradient(
    { x: 0, y: screenH * 0.70 }, { x: 0, y: screenH },
    [Skia.Color('rgba(200,0,0,0)'), Skia.Color('rgba(200,0,0,0.18)')],
    null, TileMode.Clamp,
  ));
  canvas.drawRect(Skia.XYWHRect(0, screenH * 0.70, screenW, screenH * 0.30), nearDeathPaint);

  // Left
  nearDeathPaint.setShader(Skia.Shader.MakeLinearGradient(
    { x: 0, y: 0 }, { x: screenW * 0.18, y: 0 },
    [Skia.Color('rgba(200,0,0,0.18)'), Skia.Color('rgba(200,0,0,0)')],
    null, TileMode.Clamp,
  ));
  canvas.drawRect(Skia.XYWHRect(0, 0, screenW * 0.18, screenH), nearDeathPaint);

  // Right
  nearDeathPaint.setShader(Skia.Shader.MakeLinearGradient(
    { x: screenW * 0.82, y: 0 }, { x: screenW, y: 0 },
    [Skia.Color('rgba(200,0,0,0)'), Skia.Color('rgba(200,0,0,0.18)')],
    null, TileMode.Clamp,
  ));
  canvas.drawRect(Skia.XYWHRect(screenW * 0.82, 0, screenW * 0.18, screenH), nearDeathPaint);

  nearDeathPaint.setShader(null);
}

// ── Chests ───────────────────────────────────────────────────────────────────

function drawChests(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
): void {
  for (let i = 0; i < gs.chests.length; i++) {
    const chest = gs.chests[i];
    if (!chest.active) continue;

    const sx = chest.position.x - worldOffset.x;
    const sy = chest.position.y - worldOffset.y;
    if (sx < -40 || sx > screenW + 40 || sy < -40 || sy > screenH + 40) continue;

    const size = chest.fromBoss ? 22 : 16;
    const glowSize = size + 8;

    // Glow ring
    enemyGlowPaint.setColor(Skia.Color(chest.fromBoss ? 'rgba(255,200,0,0.35)' : 'rgba(200,180,0,0.25)'));
    canvas.drawCircle(sx, sy, glowSize, enemyGlowPaint);

    // Chest body (golden rectangle)
    enemyBodyPaint.setColor(Skia.Color(chest.fromBoss ? '#ffd700' : '#cc9900'));
    canvas.drawRect(Skia.XYWHRect(sx - size / 2, sy - size / 2, size, size), enemyBodyPaint);

    // Lid highlight
    highlightPaint.setColor(Skia.Color('rgba(255,255,200,0.5)'));
    canvas.drawRect(Skia.XYWHRect(sx - size / 2, sy - size / 2, size, size / 3), highlightPaint);
  }
}
