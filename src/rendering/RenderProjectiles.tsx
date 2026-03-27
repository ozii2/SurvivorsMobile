import React from 'react';
import { Circle, Rect, Group, RoundedRect, LinearGradient, vec } from '@shopify/react-native-skia';
import { ProjectileEntity, Vec2 } from '../game/state/types';

interface Props {
  projectiles: ProjectileEntity[];
  worldOffset: Vec2;
  screenW: number;
  screenH: number;
  gameTime: number;
}

export function RenderProjectiles({ projectiles, worldOffset, screenW, screenH, gameTime }: Props) {
  return (
    <>
      {projectiles.map(proj => {
        if (!proj.active) return null;
        const sx = proj.position.x - worldOffset.x;
        const sy = proj.position.y - worldOffset.y;
        const pad = proj.radius * 3 + 4;
        if (sx < -pad || sx > screenW + pad || sy < -pad || sy > screenH + pad) return null;

        // ── Dagger: rotated blade toward velocity direction ───────────────────
        if (proj.weaponId === 'dagger') {
          const angle = Math.atan2(proj.velocity.y, proj.velocity.x) + Math.PI / 2;
          return (
            <Group key={proj.id} transform={[{ rotate: angle }]} origin={{ x: sx, y: sy }}>
              {/* Glow */}
              <RoundedRect
                x={sx - 5} y={sy - 10} width={10} height={20} r={3}
                color="rgba(255,220,50,0.30)"
              />
              {/* Blade */}
              <RoundedRect
                x={sx - 2} y={sy - 8} width={4} height={16} r={2}
                color="#FFD700"
              />
            </Group>
          );
        }

        // ── Fireball: pulsing orbit orb ───────────────────────────────────────
        if (proj.weaponId === 'fireball') {
          const pulseR = proj.radius * 1.5 + Math.sin(gameTime * 8) * proj.radius * 0.4;
          return (
            <React.Fragment key={proj.id}>
              {/* Outer pulsing ring */}
              <Circle cx={sx} cy={sy} r={pulseR}
                color="rgba(255,120,0,0.35)" style="stroke" strokeWidth={1.5} />
              {/* Core glow */}
              <Circle cx={sx} cy={sy} r={proj.radius * 2.0} color="rgba(255,100,0,0.22)" />
              {/* Core body */}
              <Circle cx={sx} cy={sy} r={proj.radius} color="#ff8820" />
              {/* Bright center */}
              <Circle cx={sx} cy={sy} r={proj.radius * 0.45} color="#ffcc66" />
            </React.Fragment>
          );
        }

        // ── Whip: center-bright gradient arc ─────────────────────────────────
        if (proj.weaponId === 'whip') {
          const wx = sx - proj.radius;
          const wy = sy;
          const ww = proj.radius * 2;
          return (
            <React.Fragment key={proj.id}>
              {/* Outer glow */}
              <Rect x={wx - 4} y={wy - 8} width={ww + 8} height={16}
                color="rgba(200,100,255,0.15)" />
              {/* Body with center-bright gradient */}
              <Rect x={wx} y={wy - 3} width={ww} height={6}>
                <LinearGradient
                  start={vec(wx, wy)}
                  end={vec(wx + ww, wy)}
                  colors={['rgba(160,60,255,0)', '#cc44ff', 'rgba(160,60,255,0)']}
                  positions={[0, 0.5, 1]}
                />
              </Rect>
            </React.Fragment>
          );
        }

        // ── Fallback ──────────────────────────────────────────────────────────
        return (
          <React.Fragment key={proj.id}>
            <Circle cx={sx} cy={sy} r={proj.radius * 2.2} color="rgba(255,255,255,0.15)" />
            <Circle cx={sx} cy={sy} r={proj.radius} color="#ffffff" />
          </React.Fragment>
        );
      })}
    </>
  );
}
