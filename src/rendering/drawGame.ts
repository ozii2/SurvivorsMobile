/**
 * drawGame — imperative Skia drawing functions.
 * No React, no JSX, no per-frame object allocation (except gradient shaders
 * for position-dependent gradients which must be recreated each draw).
 * canvas.rotate() takes DEGREES, not radians.
 */
import { SkCanvas, SkImage, SkShader } from '@shopify/react-native-skia';
import { GameState, Vec2, EnemyEntity } from '../game/state/types';
import { garlicEffectiveRadius, deathAuraEffectiveRadius } from '../game/systems/WeaponSystem';
import type { Settings } from '../services/SaveService';
import {
  Skia, TileMode,
  GRID_SIZE, NEBULAS, STARS,
  ENEMY_GLOW_COLS, ENEMY_BODY_COLS, HIT_FLASH_COL, HIGHLIGHT_COL,
  bgGradPaint, topVignettePaint, botVignettePaint,
  nebulaPaint, starPaint, gridLinePaint,
  enemyGlowPaint, enemyBodyPaint, enemyHPBgPaint, enemyHPFillPaint,
  highlightPaint, bossRingPaint1, bossRingPaint2, chestLidPaint,
  daggerGlowPaint, daggerBladePaint,
  fireballRingPaint, fireballGlowPaint, fireballBodyPaint, fireballCorePaint,
  whipGlowPaint, whipBodyPaint,
  crossGlowPaint, crossBarPaint, crossCorePaint,
  garlicAuraFillPaint, garlicAuraRingPaint, garlicAuraInnerPaint,
  deathAuraFillPaint, deathAuraRingPaint, deathAuraInnerPaint,
  bloodBladeGlowPaint, bloodBladePaint,
  hellfireRingPaint, hellfireGlowPaint, hellfireBodyPaint, hellfireCorePaint,
  divineGlowPaint, divineBladePaint, divineCorePaint,
  soulWhipGlowPaint, soulWhipBodyPaint,
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
  FONT, BOSS_FONT, DAMAGE_FONT, DAMAGE_FONT_CRIT, COMBO_FONT, ANNOUNCE_FONT, TIMER_FONT,
  HUD_PAD_X, HUD_ROW2_Y, HUD_RESERVED_RIGHT,
} from './GamePaints';

const RAD2DEG = 180 / Math.PI;

// Orta kalitede bu sayıdan fazla aktif düşman varsa düşman ayrıntısı (glow/parlama) kısılır
const ENEMY_LOD_THRESHOLD = 30;

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
  quality: Settings['graphicsQuality'] = 'medium',
): void {
  // Kalite bayrakları karede bir kez hesaplanır
  const lowQ = quality === 'low';
  let enemyDetail: boolean;
  if (quality === 'high') {
    enemyDetail = true;
  } else if (lowQ) {
    enemyDetail = false;
  } else {
    // Orta: kalabalıkta otomatik sadeleşme (eski davranış)
    let activeCount = 0;
    for (let i = 0; i < gs.enemies.length; i++) {
      if (gs.enemies[i].active) activeCount++;
    }
    enemyDetail = activeCount < ENEMY_LOD_THRESHOLD;
  }

  drawBackground(canvas, worldOffset, screenW, screenH, gs.currentBiomeId, lowQ);
  drawXPGems(canvas, gs, worldOffset, screenW, screenH, lowQ);
  drawChests(canvas, gs, worldOffset, screenW, screenH);
  drawEnemies(canvas, gs, worldOffset, screenW, screenH, enemyDetail, lowQ);
  drawProjectiles(canvas, gs, worldOffset, screenW, screenH);
  drawParticles(canvas, gs, worldOffset, screenW, screenH, lowQ);
  drawPlayer(canvas, gs, worldOffset, bodyColor, glowRgb, playerImage, lowQ);
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

// Biyom renkleri bir kez çözümlenir; her karede Skia.Color çağrılmasın
const BIOME_COLS: Record<string, { grad: Float32Array[]; flat: Float32Array; grid: Float32Array }> = {};
for (const id of Object.keys(BIOME_PALETTE)) {
  const pal = BIOME_PALETTE[id];
  BIOME_COLS[id] = {
    grad: [Skia.Color(pal.grad[0]), Skia.Color(pal.grad[1]), Skia.Color(pal.grad[2])],
    // Düşük kalite düz arka plan: palet orta rengi
    flat: Skia.Color(pal.grad[1]),
    grid: Skia.Color(pal.grid),
  };
}
const VIGNETTE_TOP_COLS = [Skia.Color('rgba(0,0,0,0.45)'), Skia.Color('rgba(0,0,0,0)')];
const VIGNETTE_BOT_COLS = [Skia.Color('rgba(0,0,0,0)'), Skia.Color('rgba(0,0,0,0.50)')];

// Arka plan shader önbelleği: yalnızca biyom veya ekran boyutu değişince yeniden oluşturulur
let _bgBiome = '';
let _bgW = -1;
let _bgH = -1;
let _bgShaderOnPaint = false;  // düşük kalite shader'ı null yapınca normal yola dönüşte yeniden ata
let _bgShader: SkShader | null = null;
let _topVigShader: SkShader | null = null;
let _botVigShader: SkShader | null = null;

function drawBackground(
  canvas: SkCanvas,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
  biomeId: string = 'nebula',
  lowQ = false,
): void {
  const cols = BIOME_COLS[biomeId] ?? BIOME_COLS.nebula;

  if (lowQ) {
    // Düşük: gradyan shader, vinyet, bulutsu ve yıldız yok; ızgara hareket hissi için kalır
    bgGradPaint.setShader(null);
    _bgShaderOnPaint = false;
    bgGradPaint.setColor(cols.flat);
    canvas.drawRect(Skia.XYWHRect(0, 0, screenW, screenH), bgGradPaint);
    drawGrid(canvas, worldOffset, screenW, screenH, cols.grid);
    return;
  }

  if (biomeId !== _bgBiome || screenW !== _bgW || screenH !== _bgH) {
    _bgBiome = biomeId;
    _bgW = screenW;
    _bgH = screenH;
    _bgShader = Skia.Shader.MakeLinearGradient(
      { x: 0, y: 0 }, { x: screenW, y: screenH }, cols.grad, null, TileMode.Clamp,
    );
    _topVigShader = Skia.Shader.MakeLinearGradient(
      { x: 0, y: 0 }, { x: 0, y: screenH * 0.35 }, VIGNETTE_TOP_COLS, null, TileMode.Clamp,
    );
    _botVigShader = Skia.Shader.MakeLinearGradient(
      { x: 0, y: screenH * 0.65 }, { x: 0, y: screenH }, VIGNETTE_BOT_COLS, null, TileMode.Clamp,
    );
    topVignettePaint.setShader(_topVigShader);
    botVignettePaint.setShader(_botVigShader);
    _bgShaderOnPaint = false;
  }
  if (!_bgShaderOnPaint) {
    bgGradPaint.setShader(_bgShader);
    _bgShaderOnPaint = true;
  }

  // 1. Diagonal base gradient
  canvas.drawRect(Skia.XYWHRect(0, 0, screenW, screenH), bgGradPaint);

  // 2. Top vignette
  canvas.drawRect(Skia.XYWHRect(0, 0, screenW, screenH * 0.35), topVignettePaint);

  // 3. Bottom vignette
  canvas.drawRect(Skia.XYWHRect(0, screenH * 0.65, screenW, screenH * 0.35), botVignettePaint);

  // 4. Nebulas (viewport-culled)
  for (let n = 0; n < NEBULAS.length; n++) {
    const neb = NEBULAS[n];
    const r  = neb.r;
    const sx = neb.wx - worldOffset.x;
    const sy = neb.wy - worldOffset.y;
    if (sx + r <= 0 || sx - r >= screenW || sy + r <= 0 || sy - r >= screenH) continue;
    nebulaPaint.setColor(neb.col);
    canvas.drawCircle(sx, sy, r, nebulaPaint);
  }

  // 5. Grid lines
  drawGrid(canvas, worldOffset, screenW, screenH, cols.grid);

  // 6. Stars (viewport-culled)
  for (let s = 0; s < STARS.length; s++) {
    const star = STARS[s];
    const sx = star.wx - worldOffset.x;
    const sy = star.wy - worldOffset.y;
    if (sx < -10 || sx > screenW + 10 || sy < -10 || sy > screenH + 10) continue;
    starPaint.setColor(star.col);
    canvas.drawCircle(sx, sy, star.r, starPaint);
  }
}

// Izgara her kalitede çizilir; iki dalda aynı kod olmasın diye ayrı
function drawGrid(
  canvas: SkCanvas,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
  gridColor: Float32Array,
): void {
  gridLinePaint.setColor(gridColor);
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
}

// ── XP Gems ───────────────────────────────────────────────────────────────────

const GEM_BODY_COL     = Skia.Color('#00e5aa');
const GEM_BODY_MAG_COL = Skia.Color('#00ffee');
const GEM_GLOW_COL     = Skia.Color('rgb(0,229,170)');  // alfa setAlphaf ile
const GEM_GLOW_MAG_COL = Skia.Color('rgb(0,255,220)');  // alfa setAlphaf ile

function drawXPGems(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
  lowQ = false,
): void {
  const gameTime = gs.gameTime;
  // Mıknatıslı taşların nabız alfası karede bir kez (hepsi aynı fazda)
  const magGlowAlpha = Math.round((0.28 + 0.18 * Math.sin(gameTime * 6)) * 100) / 100;
  for (let i = 0; i < gs.xpGems.length; i++) {
    const gem = gs.xpGems[i];
    if (!gem.active) continue;
    const sx = gem.position.x - worldOffset.x;
    const sy = gem.position.y - worldOffset.y;
    if (sx < -20 || sx > screenW + 20 || sy < -20 || sy > screenH + 20) continue;

    const r = gem.radius;
    const spinSpeed  = gem.isMagnetized ? 4.0 : 1.5;
    const angleDeg   = gameTime * spinSpeed * RAD2DEG;

    canvas.save();
    canvas.rotate(angleDeg, sx, sy);
    // Düşük kalitede glow atlanır; gövde ve çekirdek kalır
    if (!lowQ) {
      // Taban renk önceden çözümlü; nabız metin kurmadan setAlphaf ile (eski toFixed(2) yuvarlaması korunur)
      gemGlowPaint.setColor(gem.isMagnetized ? GEM_GLOW_MAG_COL : GEM_GLOW_COL);
      gemGlowPaint.setAlphaf(gem.isMagnetized ? magGlowAlpha : 0.18);
      canvas.drawRect(Skia.XYWHRect(sx - r * 1.4, sy - r * 1.4, r * 2.8, r * 2.8), gemGlowPaint);
    }
    gemBodyPaint.setColor(gem.isMagnetized ? GEM_BODY_MAG_COL : GEM_BODY_COL);
    canvas.drawRect(Skia.XYWHRect(sx - r * 0.7, sy - r * 0.7, r * 1.4, r * 1.4), gemBodyPaint);
    canvas.drawRect(Skia.XYWHRect(sx - r * 0.25, sy - r * 0.25, r * 0.5, r * 0.5), gemCorePaint);
    canvas.restore();
  }
}

// ── Enemies ───────────────────────────────────────────────────────────────────

const BOSS_RING1_COL = Skia.Color('rgb(255,50,50)');   // alfa setAlphaf ile
const BOSS_RING2_COL = Skia.Color('rgb(255,80,80)');   // alfa setAlphaf ile
const ELITE_RING_COL = Skia.Color('rgba(255,215,0,0.55)');
const ELITE_GLOW_COL = Skia.Color('rgba(255,200,0,0.30)');

function drawEnemies(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
  enemyDetail: boolean,
  lowQ: boolean,
): void {
  const enemies  = gs.enemies;
  const gameTime = gs.gameTime;

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
      // Taban renk önceden çözümlü; değişen alfa setAlphaf ile (eski toFixed(2) yuvarlaması korunur)
      bossRingPaint1.setColor(BOSS_RING1_COL);
      bossRingPaint1.setAlphaf(Math.round(ringAlpha * 100) / 100);
      bossRingPaint2.setColor(BOSS_RING2_COL);
      bossRingPaint2.setAlphaf(Math.round(ringAlpha * 0.5 * 100) / 100);
      canvas.drawCircle(sx, sy, ringR, bossRingPaint1);
      canvas.drawCircle(sx, sy, e.radius * 2.8, bossRingPaint2);
    }

    // Elite: gold outer ring + inner glow (halka oyun bilgisi, düşükte de kalır; glow kalmaz)
    if (isElite) {
      bossRingPaint2.setColor(ELITE_RING_COL);
      canvas.drawCircle(sx, sy, e.radius * 2.4, bossRingPaint2);
      if (!lowQ) {
        enemyGlowPaint.setColor(ELITE_GLOW_COL);
        canvas.drawCircle(sx, sy, e.radius * 1.8, enemyGlowPaint);
      }
    }

    // Glow halo (LOD: skip basic/fast in low-detail mode; elite already drew its glow)
    // Düşük kalitede hiçbir düşmanda glow yok
    if (!lowQ && !isElite && (enemyDetail || e.type === 'tank' || isBoss)) {
      enemyGlowPaint.setColor(ENEMY_GLOW_COLS[e.type]);
      canvas.drawCircle(sx, sy, e.radius * 2.0, enemyGlowPaint);
    }

    // Body (white on hit flash)
    enemyBodyPaint.setColor(e.hitFlashTimer > 0 ? HIT_FLASH_COL : ENEMY_BODY_COLS[e.type]);
    canvas.drawCircle(sx, sy, e.radius, enemyBodyPaint);

    // Highlight (high detail only)
    if (enemyDetail) {
      canvas.drawCircle(sx - 3, sy - 3, e.radius * 0.3, highlightPaint);
    }

    // HP bar (only when damaged)
    const hpRatio = e.hp / e.maxHp;
    if (hpRatio < 1) {
      const bx = sx - e.radius;
      const by = sy - e.radius - 7;
      const bw = e.radius * 2;
      canvas.drawRect(Skia.XYWHRect(bx, by, bw, 3), enemyHPBgPaint);
      // Tek renk dolgu: düşman başına gradyan shader oluşturmamak için
      canvas.drawRect(Skia.XYWHRect(bx, by, bw * hpRatio, 3), enemyHPFillPaint);
    }
  }
}

// ── Projectiles ───────────────────────────────────────────────────────────────

// Kırbaç gradyanı konuma bağlı olduğu için çizimde oluşur; renk ve durak dizileri sabit
const WHIP_GRAD_COLS = [
  Skia.Color('rgba(160,60,255,0)'), Skia.Color('#cc44ff'), Skia.Color('rgba(160,60,255,0)'),
];
const SOUL_WHIP_GRAD_COLS = [
  Skia.Color('rgba(150,220,255,0)'), Skia.Color('#b3e5ff'), Skia.Color('rgba(150,220,255,0)'),
];
const WHIP_GRAD_POS = [0, 0.5, 1];

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
        WHIP_GRAD_COLS, WHIP_GRAD_POS, TileMode.Clamp,
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

    } else if (p.weaponId === 'blood_blade') {
      // Hançer şekli, 1,4 kat büyük ve kırmızı
      const angleDeg = (Math.atan2(p.velocity.y, p.velocity.x) + Math.PI / 2) * RAD2DEG;
      canvas.save();
      canvas.rotate(angleDeg, sx, sy);
      canvas.drawRect(Skia.XYWHRect(sx - 7, sy - 14, 14, 28), bloodBladeGlowPaint);
      canvas.drawRect(Skia.XYWHRect(sx - 2.8, sy - 11.2, 5.6, 22.4), bloodBladePaint);
      canvas.restore();

    } else if (p.weaponId === 'hellfire') {
      // Ateş topu şekli, pembe-kırmızı palet
      const pulseR = p.radius * 1.5 + Math.sin(gameTime * 8) * p.radius * 0.4;
      canvas.drawCircle(sx, sy, pulseR, hellfireRingPaint);
      canvas.drawCircle(sx, sy, p.radius * 2.0, hellfireGlowPaint);
      canvas.drawCircle(sx, sy, p.radius, hellfireBodyPaint);
      canvas.drawCircle(sx, sy, p.radius * 0.45, hellfireCorePaint);

    } else if (p.weaponId === 'divine_blade') {
      // Yörüngeye teğet bıçak: oyuncuya göre radyal açı + 90°
      const player = gs.player;
      const angleDeg = (Math.atan2(
        p.position.y - player.position.y,
        p.position.x - player.position.x,
      ) + Math.PI / 2) * RAD2DEG;
      const len   = p.radius * 2.4;
      const thick = p.radius * 0.5;
      canvas.drawCircle(sx, sy, p.radius * 1.8, divineGlowPaint);
      canvas.save();
      canvas.rotate(angleDeg, sx, sy);
      canvas.drawRect(Skia.XYWHRect(sx - len / 2, sy - thick / 2, len, thick), divineBladePaint);
      canvas.restore();
      canvas.drawCircle(sx, sy, thick * 0.6, divineCorePaint);

    } else if (p.weaponId === 'soul_whip') {
      // Kırbaç şekli, hız yönüne döndürülmüş; yarıçap 110 olduğu için daire değil bar çizilir
      const angleDeg = Math.atan2(p.velocity.y, p.velocity.x) * RAD2DEG;
      const wx = sx - p.radius;
      const ww = p.radius * 2;
      canvas.save();
      canvas.rotate(angleDeg, sx, sy);
      canvas.drawRect(Skia.XYWHRect(wx - 4, sy - 8, ww + 8, 16), soulWhipGlowPaint);
      soulWhipBodyPaint.setShader(Skia.Shader.MakeLinearGradient(
        { x: wx, y: sy }, { x: wx + ww, y: sy },
        SOUL_WHIP_GRAD_COLS, WHIP_GRAD_POS, TileMode.Clamp,
      ));
      canvas.drawRect(Skia.XYWHRect(wx, sy - 5, ww, 10), soulWhipBodyPaint);
      soulWhipBodyPaint.setShader(null);
      canvas.restore();

    } else {
      canvas.drawCircle(sx, sy, p.radius * 2.2, fallbackGlowPaint);
      canvas.drawCircle(sx, sy, p.radius, fallbackBodyPaint);
    }
  }
}

// ── Particles ─────────────────────────────────────────────────────────────────

// Metin → SkColor önbelleği. Parçacık ve dalga duyurusu renkleri sabit ve az sayıda; önbellek sınırlı kalır
const _colorCache = new Map<string, Float32Array>();
function cachedColor(css: string): Float32Array {
  let col = _colorCache.get(css);
  if (col === undefined) {
    col = Skia.Color(css);
    _colorCache.set(css, col);
  }
  return col;
}

function drawParticles(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  screenW: number,
  screenH: number,
  lowQ = false,
): void {
  const particles = gs.particles;
  for (let i = 0; i < particles.length; i++) {
    // Düşük kalitede yalnızca çift index'liler çizilir: çizim maliyeti yarıya iner, mantık etkilenmez
    if (lowQ && (i & 1) === 1) continue;
    const p = particles[i];
    if (!p.active) continue;
    const sx = p.position.x - worldOffset.x;
    const sy = p.position.y - worldOffset.y;
    if (sx < -8 || sx > screenW + 8 || sy < -8 || sy > screenH + 8) continue;

    const alpha = Math.max(0, p.lifetime / p.maxLifetime);
    if (alpha < 0.05) continue;

    particlePaint.setColor(cachedColor(p.color));
    particlePaint.setAlphaf(alpha);
    canvas.drawCircle(sx, sy, p.radius * alpha + 0.5, particlePaint);
  }
}

// ── Player ────────────────────────────────────────────────────────────────────

// Oyuncu renk önbelleği: son anahtar tutulur, değişince yeniden çözümlenir
let _glowKey = '';
let _glowOutCol: Float32Array = HIT_FLASH_COL;
let _glowMidCol: Float32Array = HIT_FLASH_COL;
let _glowInCol:  Float32Array = HIT_FLASH_COL;
let _bodyKey = '';
let _bodyCol: Float32Array = HIT_FLASH_COL;
const _photoClipPath = Skia.Path.Make();

function drawPlayer(
  canvas: SkCanvas,
  gs: GameState,
  worldOffset: Vec2,
  bodyColor?: string,
  glowRgb?: string,
  playerImage?: SkImage | null,
  lowQ = false,
): void {
  const player = gs.player;
  const sx = player.position.x - worldOffset.x;
  const sy = player.position.y - worldOffset.y;
  const r  = player.radius;

  const flash = player.invincibleTimer > 0 &&
    Math.floor(player.invincibleTimer * 10) % 2 === 0;

  // Garlic / death aura (rendered behind player glow)
  // Tek döngüde ikisini de bul; her karede iki ayrı find çalışmasın
  let garlicLevel = 0;
  let hasDeathAura = false;
  for (let i = 0; i < player.weapons.length; i++) {
    const w = player.weapons[i];
    if (w.id === 'garlic') garlicLevel = w.level;
    else if (w.id === 'death_aura') hasDeathAura = true;
  }
  const pulse = Math.sin(gs.gameTime * 3.5) * 0.05;
  if (garlicLevel > 0) {
    // Tick ile aynı yarıçap (Sarımsak Özü bonusu dahil); görünen alan = hasar alanı
    const baseR = garlicEffectiveRadius(player, garlicLevel);
    const auraR = baseR + pulse * baseR;
    canvas.drawCircle(sx, sy, auraR, garlicAuraFillPaint);
    canvas.drawCircle(sx, sy, auraR, garlicAuraRingPaint);
    canvas.drawCircle(sx, sy, auraR * 0.85, garlicAuraInnerPaint);
  }
  if (hasDeathAura) {
    const baseR = deathAuraEffectiveRadius(player);
    const auraR = baseR + pulse * baseR;
    canvas.drawCircle(sx, sy, auraR, deathAuraFillPaint);
    canvas.drawCircle(sx, sy, auraR, deathAuraRingPaint);
    canvas.drawCircle(sx, sy, auraR * 0.85, deathAuraInnerPaint);
  }

  // Düşük kalitede 3 katmanlı glow atlanır; gölge ve gövde kalır
  if (!lowQ) {
    const gr = glowRgb ?? '79,195,247';
    // Renkler yalnızca glowRgb değişince yeniden çözümlenir
    if (gr !== _glowKey) {
      _glowKey    = gr;
      _glowOutCol = Skia.Color(`rgba(${gr},0.05)`);
      _glowMidCol = Skia.Color(`rgba(${gr},0.13)`);
      _glowInCol  = Skia.Color(`rgba(${gr},0.25)`);
    }
    playerGlowOutPaint.setColor(_glowOutCol);
    canvas.drawCircle(sx, sy, r * 2.8, playerGlowOutPaint);

    playerGlowMidPaint.setColor(_glowMidCol);
    canvas.drawCircle(sx, sy, r * 1.9, playerGlowMidPaint);

    playerGlowInPaint.setColor(_glowInCol);
    canvas.drawCircle(sx, sy, r * 1.35, playerGlowInPaint);
  }

  canvas.drawCircle(sx + 2, sy + 3, r, playerShadowPaint);

  if (playerImage) {
    // Tek path yeniden kullanılır; her karede Path nesnesi oluşmasın
    _photoClipPath.reset();
    _photoClipPath.addCircle(sx, sy, r);
    canvas.save();
    canvas.clipPath(_photoClipPath, ClipOp.Intersect, true);
    playerPhotoPaint.setAlphaf(flash ? 0.4 : 1.0);
    canvas.drawImageRect(
      playerImage,
      Skia.XYWHRect(0, 0, playerImage.width(), playerImage.height()),
      Skia.XYWHRect(sx - r, sy - r, r * 2, r * 2),
      playerPhotoPaint,
    );
    canvas.restore();
  } else {
    const bc = bodyColor ?? '#4fc3f7';
    // Gövde rengi de yalnızca değişince çözümlenir
    if (bc !== _bodyKey) {
      _bodyKey = bc;
      _bodyCol = Skia.Color(bc);
    }
    playerBodyPaint.setColor(flash ? HIT_FLASH_COL : _bodyCol);
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
  announceTextPaint.setColor(cachedColor(gs.waveAnnounceColor));
  announceTextPaint.setAlphaf(alpha);
  if (ANNOUNCE_FONT) {
    canvas.drawText(text, cx - text.length * 7.5, cy, announceTextPaint, ANNOUNCE_FONT);
  }
  announceBgPaint.setAlphaf(1);
  announceTextPaint.setAlphaf(1);
}

// ── HUD ───────────────────────────────────────────────────────────────────────

const HUD_HP_GRAD_COLS = [Skia.Color('#ff8a80'), Skia.Color('#ff1744')];
const HUD_XP_GRAD_COLS = [Skia.Color('#80d8ff'), Skia.Color('#0288d1')];
let _hudBarW = -1;  // bar gradyanlarının oluşturulduğu genişlik

const COMBO_COL_50   = Skia.Color('#ff2222');
const COMBO_COL_25   = Skia.Color('#ff8833');
const COMBO_COL_10   = Skia.Color('#FFD700');
const COMBO_COL_BASE = Skia.Color('#ffffff');

function drawHUD(
  canvas: SkCanvas,
  gs: GameState,
  screenW: number,
  screenH: number,
): void {
  const player  = gs.player;
  // Sağdaki RN duraklatma butonuna yer bırak; dar ekranda barlar butonun altına girmesin
  const barW    = Math.min(200, screenW - HUD_PAD_X - HUD_RESERVED_RIGHT);
  const hpRatio = player.hp / player.maxHp;
  const xpRatio = player.xp / player.xpToNextLevel;

  // Bar gradyanları hep tam bar genişliğinde; yalnızca barW değişince yeniden oluşturulur.
  // Paint'ler yalnızca HUD'da kullanıldığı için shader üzerlerinde kalır.
  if (barW !== _hudBarW) {
    _hudBarW = barW;
    hudHPFillPaint.setShader(Skia.Shader.MakeLinearGradient(
      { x: 20, y: 16 }, { x: 20 + barW, y: 16 }, HUD_HP_GRAD_COLS, null, TileMode.Clamp,
    ));
    hudXPFillPaint.setShader(Skia.Shader.MakeLinearGradient(
      { x: 20, y: 30 }, { x: 20 + barW, y: 30 }, HUD_XP_GRAD_COLS, null, TileMode.Clamp,
    ));
  }

  // ── HP bar ──
  canvas.drawRect(Skia.XYWHRect(18, 14, barW + 4, 14), hudHPGlowPaint);
  canvas.drawRect(Skia.XYWHRect(20, 16, barW, 10), hudHPTrackPaint);
  if (hpRatio > 0) {
    canvas.drawRect(Skia.XYWHRect(20, 16, barW * hpRatio, 10), hudHPFillPaint);
  }

  // ── XP bar ──
  canvas.drawRect(Skia.XYWHRect(18, 29, barW + 4, 10), hudXPGlowPaint);
  canvas.drawRect(Skia.XYWHRect(20, 30, barW, 6), hudXPTrackPaint);
  if (xpRatio > 0) {
    canvas.drawRect(Skia.XYWHRect(20, 30, barW * xpRatio, 6), hudXPFillPaint);
  }

  // ── Satır 2: seviye/dalga (sol) · süre (orta) · kombo (sağ) ──
  // Tüm oyun bilgisi burada; RN katmanında yalnızca duraklatma butonu var
  if (FONT) {
    canvas.drawText(`Sv ${player.level} · Dalga ${gs.waveNumber}`, HUD_PAD_X, HUD_ROW2_Y, hudTextPaint, FONT);
  }

  if (TIMER_FONT) {
    const minutes = Math.floor(gs.gameTime / 60).toString().padStart(2, '0');
    const seconds = Math.floor(gs.gameTime % 60).toString().padStart(2, '0');
    const timeText = `${minutes}:${seconds}`;
    // Ölçülen genişlikle tam ortala; karakter sayısı tahmini fonta göre kayıyordu
    const timeW = TIMER_FONT.measureText(timeText).width;
    canvas.drawText(timeText, (screenW - timeW) / 2, HUD_ROW2_Y, hudTextPaint, TIMER_FONT);
  }

  // ── Combo counter ──
  if (gs.killCombo >= 2 && COMBO_FONT) {
    const combo = gs.killCombo;
    const color = combo >= 50 ? COMBO_COL_50
      : combo >= 25 ? COMBO_COL_25
      : combo >= 10 ? COMBO_COL_10
      : COMBO_COL_BASE;
    comboTextPaint.setColor(color);
    const label = `x${combo} KOMBO`;
    // Sağ kenarı sabit hizada kalsın; sayı büyüdükçe metin sola doğru uzar
    const labelW = COMBO_FONT.measureText(label).width;
    canvas.drawText(label, screenW - HUD_PAD_X - labelW, HUD_ROW2_Y, comboTextPaint, COMBO_FONT);
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

// Yakın ölüm vinyeti: 4 shader ekran boyutuna göre önbellekte; her çizimde sırayla atanır
const NEAR_DEATH_IN_COLS  = [Skia.Color('rgba(200,0,0,0.18)'), Skia.Color('rgba(200,0,0,0)')];
const NEAR_DEATH_OUT_COLS = [Skia.Color('rgba(200,0,0,0)'), Skia.Color('rgba(200,0,0,0.18)')];
let _ndW = -1;
let _ndH = -1;
let _ndTop: SkShader | null = null;
let _ndBot: SkShader | null = null;
let _ndLeft: SkShader | null = null;
let _ndRight: SkShader | null = null;

function _drawNearDeathVignette(canvas: SkCanvas, screenW: number, screenH: number): void {
  if (screenW !== _ndW || screenH !== _ndH) {
    _ndW = screenW;
    _ndH = screenH;
    _ndTop = Skia.Shader.MakeLinearGradient(
      { x: 0, y: 0 }, { x: 0, y: screenH * 0.30 }, NEAR_DEATH_IN_COLS, null, TileMode.Clamp,
    );
    _ndBot = Skia.Shader.MakeLinearGradient(
      { x: 0, y: screenH * 0.70 }, { x: 0, y: screenH }, NEAR_DEATH_OUT_COLS, null, TileMode.Clamp,
    );
    _ndLeft = Skia.Shader.MakeLinearGradient(
      { x: 0, y: 0 }, { x: screenW * 0.18, y: 0 }, NEAR_DEATH_IN_COLS, null, TileMode.Clamp,
    );
    _ndRight = Skia.Shader.MakeLinearGradient(
      { x: screenW * 0.82, y: 0 }, { x: screenW, y: 0 }, NEAR_DEATH_OUT_COLS, null, TileMode.Clamp,
    );
  }

  // Top
  nearDeathPaint.setShader(_ndTop);
  canvas.drawRect(Skia.XYWHRect(0, 0, screenW, screenH * 0.30), nearDeathPaint);

  // Bottom
  nearDeathPaint.setShader(_ndBot);
  canvas.drawRect(Skia.XYWHRect(0, screenH * 0.70, screenW, screenH * 0.30), nearDeathPaint);

  // Left
  nearDeathPaint.setShader(_ndLeft);
  canvas.drawRect(Skia.XYWHRect(0, 0, screenW * 0.18, screenH), nearDeathPaint);

  // Right
  nearDeathPaint.setShader(_ndRight);
  canvas.drawRect(Skia.XYWHRect(screenW * 0.82, 0, screenW * 0.18, screenH), nearDeathPaint);

  nearDeathPaint.setShader(null);
}

// ── Chests ───────────────────────────────────────────────────────────────────

const CHEST_GLOW_BOSS_COL = Skia.Color('rgba(255,200,0,0.35)');
const CHEST_GLOW_COL      = Skia.Color('rgba(200,180,0,0.25)');
const CHEST_BODY_BOSS_COL = Skia.Color('#ffd700');
const CHEST_BODY_COL      = Skia.Color('#cc9900');

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
    enemyGlowPaint.setColor(chest.fromBoss ? CHEST_GLOW_BOSS_COL : CHEST_GLOW_COL);
    canvas.drawCircle(sx, sy, glowSize, enemyGlowPaint);

    // Chest body (golden rectangle)
    enemyBodyPaint.setColor(chest.fromBoss ? CHEST_BODY_BOSS_COL : CHEST_BODY_COL);
    canvas.drawRect(Skia.XYWHRect(sx - size / 2, sy - size / 2, size, size), enemyBodyPaint);

    // Lid highlight — kendi paint'i: ortak highlightPaint'i boyamak düşman parlamasını bozuyordu
    canvas.drawRect(Skia.XYWHRect(sx - size / 2, sy - size / 2, size, size / 3), chestLidPaint);
  }
}
