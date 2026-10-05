/**
 * GamePaints — module-level SkPaint pool.
 * All paints are created once at module load and reused every frame.
 * Mutable paints (setColor / setShader before each draw) are intentional:
 * mutating an existing SkPaint is far cheaper than allocating a new one.
 */
import { Skia, PaintStyle, TileMode, matchFont, ClipOp } from '@shopify/react-native-skia';
export { ClipOp };

// ── HUD yerleşim sabitleri ───────────────────────────────────────────────────
export const HUD_PAD_X          = 20;  // sol/sağ kenar boşluğu
export const HUD_ROW2_Y         = 64;  // seviye/süre/kombo satırının taban çizgisi; duraklatma butonunun (alt kenar y=48) altında ~5 px boşluk bırakır
export const HUD_RESERVED_RIGHT = 72;  // RN duraklatma butonu (16 + 44) + boşluk; barlar altına girmesin

// ── Fonts ────────────────────────────────────────────────────────────────────
export const FONT           = matchFont({ fontFamily: 'System', fontSize: 13 });
export const BOSS_FONT      = matchFont({ fontFamily: 'System', fontSize: 12 });
export const DAMAGE_FONT    = matchFont({ fontFamily: 'System', fontSize: 11 });
export const DAMAGE_FONT_CRIT = matchFont({ fontFamily: 'System', fontSize: 14 });
export const COMBO_FONT     = matchFont({ fontFamily: 'System', fontSize: 15 });
export const ANNOUNCE_FONT  = matchFont({ fontFamily: 'System', fontSize: 26 });
export const TIMER_FONT     = matchFont({ fontFamily: 'System', fontSize: 16, fontWeight: 'bold' });

// ── Pre-parsed enemy colors (SkColor = Float32Array, parsed once) ─────────────
export const ENEMY_GLOW_COLS: Record<string, Float32Array> = {
  basic:     Skia.Color('rgba(255,60,60,0.20)'),
  fast:      Skia.Color('rgba(255,160,40,0.22)'),
  tank:      Skia.Color('rgba(160,60,220,0.22)'),
  boss:      Skia.Color('rgba(255,30,30,0.28)'),
  swarm:     Skia.Color('rgba(80,255,40,0.22)'),
  explosive: Skia.Color('rgba(255,120,0,0.28)'),
};
export const ENEMY_BODY_COLS: Record<string, Float32Array> = {
  basic:     Skia.Color('#e05050'),
  fast:      Skia.Color('#e0a030'),
  tank:      Skia.Color('#9040c0'),
  boss:      Skia.Color('#ff2020'),
  swarm:     Skia.Color('#55ff33'),
  explosive: Skia.Color('#ff7700'),
};
export const HIT_FLASH_COL  = Skia.Color('#ffffff');
export const HIGHLIGHT_COL  = Skia.Color('rgba(255,255,255,0.18)');

// ── Background scene data ─────────────────────────────────────────────────────
export const GRID_SIZE = 80;

// Renkler (col) burada bir kez çözümlenir; çizimde her karede Skia.Color çağrılmasın
const NEBULA_DEFS: [number, number, number, string][] = [
  [500,  500,  420, 'rgba(120,50,220,0.06)'],
  [2500, 2400, 480, 'rgba(40,80,200,0.055)'],
  [1500, 1500, 380, 'rgba(160,60,180,0.045)'],
  [2800, 400,  320, 'rgba(40,180,200,0.04)'],
  [300,  2600, 350, 'rgba(100,30,200,0.05)'],
  [1800, 800,  260, 'rgba(80,160,220,0.04)'],
];
export const NEBULAS = NEBULA_DEFS.map(([wx, wy, r, color]) => ({
  wx, wy, r, col: Skia.Color(color),
}));

const STAR_COUNT = 140;
export const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const wx = ((i * 2017 + 311) % 5000) - 1000;
  const wy = ((i * 1483 + 97)  % 5000) - 1000;
  const r  = 0.5 + (i % 5) * 0.3;
  const a  = 0.25 + (i % 8) * 0.07;
  const ab = Math.round(a * 255).toString(16).padStart(2, '0');
  const col = Skia.Color(`#ffffff${ab}`);
  return { wx, wy, r, col };
});

// ── Background paints ─────────────────────────────────────────────────────────
export const bgGradPaint      = _fill();   // shader önbellekten; biyom/ekran değişince yeniden atanır
export const topVignettePaint = _fill();   // shader önbellekten; ekran değişince yeniden atanır
export const botVignettePaint = _fill();   // shader önbellekten; ekran değişince yeniden atanır
export const nebulaPaint      = _fill();   // setColor per nebula
export const starPaint        = _fill();   // setColor per star
export const gridLinePaint    = _stroke('rgba(110,80,200,0.12)', 1);

// ── Enemy paints ──────────────────────────────────────────────────────────────
export const enemyGlowPaint   = _fill();   // setColor per enemy
export const enemyBodyPaint   = _fill();   // setColor per enemy
export const enemyHPBgPaint   = _fill('rgba(0,0,0,0.55)');
// Tek renk (eski gradyanın ortası): 3 px barda fark görünmez, düşman başına shader oluşmaz
export const enemyHPFillPaint = _fill('#ff3d5a');
export const highlightPaint   = _fill('rgba(255,255,255,0.18)');
export const bossRingPaint1   = _stroke(2);  // setColor per frame
export const bossRingPaint2   = _stroke(1);  // setColor per frame

// ── Chest paints ──────────────────────────────────────────────────────────────
export const chestLidPaint    = _fill('rgba(255,255,200,0.5)');  // ayrı paint: highlightPaint'i kirletmesin

// ── Projectile paints ─────────────────────────────────────────────────────────
export const daggerGlowPaint   = _fill('rgba(255,220,50,0.30)');
export const daggerBladePaint  = _fill('#FFD700');
export const fireballRingPaint = _stroke('rgba(255,120,0,0.35)', 1.5);
export const fireballGlowPaint = _fill('rgba(255,100,0,0.22)');
export const fireballBodyPaint = _fill('#ff8820');
export const fireballCorePaint = _fill('#ffcc66');
export const whipGlowPaint     = _fill('rgba(200,100,255,0.15)');
export const whipBodyPaint     = _fill();  // setShader per whip draw
export const crossGlowPaint    = _fill('rgba(255,220,80,0.18)');
export const crossBarPaint     = _fill('#FFD700');
export const crossCorePaint    = _fill('#fffacc');
// Evrimli silahlar: ana silahın şekli, yeni renk paleti
export const bloodBladeGlowPaint = _fill('rgba(255,40,60,0.35)');
export const bloodBladePaint     = _fill('#ff2a44');
export const hellfireRingPaint   = _stroke('rgba(255,40,140,0.40)', 1.5);
export const hellfireGlowPaint   = _fill('rgba(200,30,110,0.25)');
export const hellfireBodyPaint   = _fill('#ff3377');
export const hellfireCorePaint   = _fill('#ffd1e6');
export const divineGlowPaint     = _fill('rgba(255,240,180,0.30)');
export const divineBladePaint    = _fill('#fff6d5');
export const divineCorePaint     = _fill('#ffd700');
export const soulWhipGlowPaint   = _fill('rgba(150,220,255,0.15)');
export const soulWhipBodyPaint   = _fill();  // setShader per soul whip draw
export const fallbackGlowPaint = _fill('rgba(255,255,255,0.15)');
export const fallbackBodyPaint = _fill('#ffffff');

// ── XP gem paints ─────────────────────────────────────────────────────────────
export const gemGlowPaint = _fill();  // setColor per gem
export const gemBodyPaint = _fill();  // setColor per gem
export const gemCorePaint = _fill('rgba(255,255,255,0.55)');

// ── Garlic aura paints ────────────────────────────────────────────────────────
export const garlicAuraFillPaint = _fill('rgba(120,255,60,0.06)');
export const garlicAuraRingPaint = _stroke('rgba(120,255,60,0.40)', 1.5);
export const garlicAuraInnerPaint = _fill('rgba(80,220,40,0.04)');

// ── Death aura paints (evrimli Sarımsak) ──────────────────────────────────────
export const deathAuraFillPaint  = _fill('rgba(120,40,200,0.10)');
export const deathAuraRingPaint  = _stroke('rgba(170,80,255,0.55)', 2);
export const deathAuraInnerPaint = _fill('rgba(90,20,160,0.06)');

// ── Player paints ─────────────────────────────────────────────────────────────
export const playerGlowOutPaint = _fill();  // setColor from glowRgb
export const playerGlowMidPaint = _fill();
export const playerGlowInPaint  = _fill();
export const playerBodyPaint    = _fill();  // setColor (flash or bodyColor)
export const playerShadowPaint  = _fill('rgba(0,0,0,0.35)');
export const playerPhotoPaint   = _fill('#ffffff');  // setAlphaf per frame

// ── Damage number paints ──────────────────────────────────────────────────────
export const dmgNumNormalPaint = _fill('#ffffff');
export const dmgNumCritPaint   = _fill('#FFD700');
export const dmgNumBigPaint    = _fill('#ff5555');

// ── Combo + wave announce paints ──────────────────────────────────────────────
export const comboTextPaint    = _fill('#ffffff');  // setColor dynamically
export const announceTextPaint = _fill('#ffffff');  // setColor + setAlphaf dynamically
export const announceBgPaint   = _fill('rgba(0,0,0,0.45)');

// ── Particle paint ────────────────────────────────────────────────────────────
export const particlePaint = _fill();  // setColor + setAlphaf per particle

// ── HUD paints ────────────────────────────────────────────────────────────────
export const hudHPGlowPaint       = _fill('rgba(255,50,50,0.12)');
export const hudHPTrackPaint      = _fill('rgba(180,30,30,0.45)');
export const hudHPFillPaint       = _fill();  // shader önbellekten; bar genişliği değişince yeniden atanır
export const hudXPGlowPaint       = _fill('rgba(0,180,220,0.10)');
export const hudXPTrackPaint      = _fill('rgba(0,80,120,0.45)');
export const hudXPFillPaint       = _fill();  // shader önbellekten; bar genişliği değişince yeniden atanır
export const hudTextPaint         = _fill('#ffffffcc');
export const hudBossTextPaint     = _fill('#ff6060');
export const hudBossBgPaint       = _fill('rgba(0,0,0,0.75)');
export const hudBossBarBgPaint    = _fill('rgba(255,30,30,0.25)');
export const hudBossBarFillPaint  = _fill('#ff2020');
export const nearDeathPaint       = _fill();  // 4 önbellekli shader sırayla atanır

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
