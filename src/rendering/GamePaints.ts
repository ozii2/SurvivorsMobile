/**
 * GamePaints — module-level SkPaint pool.
 * All paints are created once at module load and reused every frame.
 * Mutable paints (setColor / setShader before each draw) are intentional:
 * mutating an existing SkPaint is far cheaper than allocating a new one.
 */
import { Skia, PaintStyle, TileMode, matchFont } from '@shopify/react-native-skia';

// ── Fonts ────────────────────────────────────────────────────────────────────
export const FONT      = matchFont({ fontFamily: 'System', fontSize: 13 });
export const BOSS_FONT = matchFont({ fontFamily: 'System', fontSize: 12 });

// ── Pre-parsed enemy colors (SkColor = Float32Array, parsed once) ─────────────
export const ENEMY_GLOW_COLS: Record<string, Float32Array> = {
  basic: Skia.Color('rgba(255,60,60,0.20)'),
  fast:  Skia.Color('rgba(255,160,40,0.22)'),
  tank:  Skia.Color('rgba(160,60,220,0.22)'),
  boss:  Skia.Color('rgba(255,30,30,0.28)'),
};
export const ENEMY_BODY_COLS: Record<string, Float32Array> = {
  basic: Skia.Color('#e05050'),
  fast:  Skia.Color('#e0a030'),
  tank:  Skia.Color('#9040c0'),
  boss:  Skia.Color('#ff2020'),
};
export const HIT_FLASH_COL  = Skia.Color('#ffffff');
export const HIGHLIGHT_COL  = Skia.Color('rgba(255,255,255,0.18)');

// ── Background scene data ─────────────────────────────────────────────────────
export const GRID_SIZE = 80;

export const NEBULAS: [number, number, number, string][] = [
  [500,  500,  420, 'rgba(120,50,220,0.06)'],
  [2500, 2400, 480, 'rgba(40,80,200,0.055)'],
  [1500, 1500, 380, 'rgba(160,60,180,0.045)'],
  [2800, 400,  320, 'rgba(40,180,200,0.04)'],
  [300,  2600, 350, 'rgba(100,30,200,0.05)'],
  [1800, 800,  260, 'rgba(80,160,220,0.04)'],
];

const STAR_COUNT = 140;
export const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const wx = ((i * 2017 + 311) % 5000) - 1000;
  const wy = ((i * 1483 + 97)  % 5000) - 1000;
  const r  = 0.5 + (i % 5) * 0.3;
  const a  = 0.25 + (i % 8) * 0.07;
  const ab = Math.round(a * 255).toString(16).padStart(2, '0');
  const color = `#ffffff${ab}`;
  return { wx, wy, r, color };
});

// ── Background paints ─────────────────────────────────────────────────────────
export const bgGradPaint      = _fill();   // shader set per frame
export const topVignettePaint = _fill();   // shader set per frame
export const botVignettePaint = _fill();   // shader set per frame
export const nebulaPaint      = _fill();   // setColor per nebula
export const starPaint        = _fill();   // setColor per star
export const gridLinePaint    = _stroke('rgba(110,80,200,0.12)', 1);

// ── Enemy paints ──────────────────────────────────────────────────────────────
export const enemyGlowPaint   = _fill();   // setColor per enemy
export const enemyBodyPaint   = _fill();   // setColor per enemy
export const enemyHPBgPaint   = _fill('rgba(0,0,0,0.55)');
export const enemyHPFillPaint = _fill();   // setShader per damaged enemy
export const highlightPaint   = _fill('rgba(255,255,255,0.18)');
export const bossRingPaint1   = _stroke(2);  // setColor per frame
export const bossRingPaint2   = _stroke(1);  // setColor per frame

// ── Projectile paints ─────────────────────────────────────────────────────────
export const daggerGlowPaint   = _fill('rgba(255,220,50,0.30)');
export const daggerBladePaint  = _fill('#FFD700');
export const fireballRingPaint = _stroke('rgba(255,120,0,0.35)', 1.5);
export const fireballGlowPaint = _fill('rgba(255,100,0,0.22)');
export const fireballBodyPaint = _fill('#ff8820');
export const fireballCorePaint = _fill('#ffcc66');
export const whipGlowPaint     = _fill('rgba(200,100,255,0.15)');
export const whipBodyPaint     = _fill();  // setShader per whip draw
export const fallbackGlowPaint = _fill('rgba(255,255,255,0.15)');
export const fallbackBodyPaint = _fill('#ffffff');

// ── XP gem paints ─────────────────────────────────────────────────────────────
export const gemGlowPaint = _fill();  // setColor per gem
export const gemBodyPaint = _fill();  // setColor per gem
export const gemCorePaint = _fill('rgba(255,255,255,0.55)');

// ── Player paints ─────────────────────────────────────────────────────────────
export const playerGlowOutPaint = _fill();  // setColor from glowRgb
export const playerGlowMidPaint = _fill();
export const playerGlowInPaint  = _fill();
export const playerBodyPaint    = _fill();  // setColor (flash or bodyColor)
export const playerShadowPaint  = _fill('rgba(0,0,0,0.35)');

// ── Particle paint ────────────────────────────────────────────────────────────
export const particlePaint = _fill();  // setColor + setAlphaf per particle

// ── HUD paints ────────────────────────────────────────────────────────────────
export const hudHPGlowPaint       = _fill('rgba(255,50,50,0.12)');
export const hudHPTrackPaint      = _fill('rgba(180,30,30,0.45)');
export const hudHPFillPaint       = _fill();  // setShader per frame
export const hudXPGlowPaint       = _fill('rgba(0,180,220,0.10)');
export const hudXPTrackPaint      = _fill('rgba(0,80,120,0.45)');
export const hudXPFillPaint       = _fill();  // setShader per frame
export const hudTextPaint         = _fill('#ffffffcc');
export const hudBossTextPaint     = _fill('#ff6060');
export const hudBossBgPaint       = _fill('rgba(0,0,0,0.75)');
export const hudBossBarBgPaint    = _fill('rgba(255,30,30,0.25)');
export const hudBossBarFillPaint  = _fill('#ff2020');
export const nearDeathPaint       = _fill();  // setShader per near-death frame

// Re-export for convenience in drawGame.ts
export { Skia, TileMode };

// ── Paint factory helpers (private) ──────────────────────────────────────────
function _fill(color?: string) {
  const p = Skia.Paint();
  p.setAntiAlias(true);
  if (color) p.setColor(Skia.Color(color));
  return p;
}

function _stroke(colorOrWidth: string | number, width?: number) {
  const p = Skia.Paint();
  p.setAntiAlias(true);
  p.setStyle(PaintStyle.Stroke);
  if (typeof colorOrWidth === 'string') {
    p.setColor(Skia.Color(colorOrWidth));
    p.setStrokeWidth(width!);
  } else {
    p.setStrokeWidth(colorOrWidth);
  }
  return p;
}
