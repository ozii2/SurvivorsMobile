import React, { useMemo } from 'react';
import { Rect, Circle, Line, vec, LinearGradient } from '@shopify/react-native-skia';
import { Vec2 } from '../game/state/types';

interface Props {
  worldOffset: Vec2;
  screenW: number;
  screenH: number;
}

const GRID_SIZE = 80;

// ── Precompute stars in world space (computed once at module load) ─────────────
const STAR_COUNT = 140;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => {
  const wx = ((i * 2017 + 311) % 5000) - 1000;
  const wy = ((i * 1483 + 97)  % 5000) - 1000;
  const r  = 0.5 + (i % 5) * 0.3;
  const a  = 0.25 + (i % 8) * 0.07;
  // pre-build color string to avoid per-frame string ops
  const ab = Math.round(a * 255).toString(16).padStart(2, '0');
  const color = `#ffffff${ab}`;
  return { wx, wy, r, color };
});

export function RenderBackground({ worldOffset, screenW, screenH }: Props) {
  // ── Grid lines — recompute only when crossing a grid cell boundary ──────────
  const gridTileX = Math.floor(worldOffset.x / GRID_SIZE);
  const gridTileY = Math.floor(worldOffset.y / GRID_SIZE);
  const gridLines = useMemo(() => {
    const ox = gridTileX * GRID_SIZE;
    const oy = gridTileY * GRID_SIZE;
    const lines: React.ReactElement[] = [];

    for (let wx = ox; wx < ox + screenW + GRID_SIZE * 2; wx += GRID_SIZE) {
      const sx = wx - ox;
      lines.push(
        <Line key={`v${wx}`} p1={vec(sx, 0)} p2={vec(sx, screenH)}
          color="rgba(110,80,200,0.12)" strokeWidth={1} />,
      );
    }
    for (let wy = oy; wy < oy + screenH + GRID_SIZE * 2; wy += GRID_SIZE) {
      const sy = wy - oy;
      lines.push(
        <Line key={`h${wy}`} p1={vec(0, sy)} p2={vec(screenW, sy)}
          color="rgba(110,80,200,0.12)" strokeWidth={1} />,
      );
    }
    return lines;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridTileX, gridTileY, screenW, screenH]);

  // ── Visible stars — recalculate only when player moves 150px+ ───────────────
  const starTileX = Math.floor(worldOffset.x / 150);
  const starTileY = Math.floor(worldOffset.y / 150);
  const visibleStars = useMemo(() => {
    const ox = starTileX * 150;
    const oy = starTileY * 150;
    return STARS.filter(s => {
      const sx = s.wx - ox;
      const sy = s.wy - oy;
      return sx > -50 && sx < screenW + 50 && sy > -50 && sy < screenH + 50;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [starTileX, starTileY, screenW, screenH]);

  return (
    <>
      {/* ── Base gradient: deep violet top → midnight blue → near-black ── */}
      <Rect x={0} y={0} width={screenW} height={screenH}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(screenW, screenH)}
          colors={['#1a0b38', '#0f0a28', '#07060f']}
        />
      </Rect>

      {/* ── Nebula blobs ─── large, soft, very transparent ────────────── */}
      {/* Top-left violet cloud */}
      <Circle cx={screenW * 0.15} cy={screenH * 0.18} r={screenW * 0.55}
        color="rgba(120,50,220,0.055)" />
      {/* Bottom-right blue cloud */}
      <Circle cx={screenW * 0.88} cy={screenH * 0.82} r={screenW * 0.50}
        color="rgba(40,80,200,0.05)" />
      {/* Centre warm glow */}
      <Circle cx={screenW * 0.5} cy={screenH * 0.45} r={screenW * 0.38}
        color="rgba(160,60,180,0.04)" />
      {/* Top-right cyan hint */}
      <Circle cx={screenW * 0.85} cy={screenH * 0.12} r={screenW * 0.30}
        color="rgba(40,180,200,0.035)" />

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      {gridLines}

      {/* ── Stars ────────────────────────────────────────────────────── */}
      {visibleStars.map((s, i) => (
        <Circle
          key={i}
          cx={s.wx - worldOffset.x}
          cy={s.wy - worldOffset.y}
          r={s.r}
          color={s.color}
        />
      ))}

      {/* ── Vignette: dark edges ──────────────────────────────────────── */}
      <Rect x={0} y={0} width={screenW} height={screenH}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, screenH * 0.35)}
          colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
        />
      </Rect>
      <Rect x={0} y={screenH * 0.65} width={screenW} height={screenH * 0.35}>
        <LinearGradient
          start={vec(0, screenH * 0.65)}
          end={vec(0, screenH)}
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.50)']}
        />
      </Rect>
    </>
  );
}
