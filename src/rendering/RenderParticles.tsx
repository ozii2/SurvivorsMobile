import React from 'react';
import { Circle } from '@shopify/react-native-skia';
import { ParticleEntity, Vec2 } from '../game/state/types';

interface Props {
  particles: ParticleEntity[];
  worldOffset: Vec2;
  screenW: number;
  screenH: number;
}

// Pre-built hex alpha lookup table — avoids toString(16) per frame per particle
const ALPHA_HEX = Array.from({ length: 256 }, (_, i) =>
  i.toString(16).padStart(2, '0'),
);

const CULL_PAD = 8;

export function RenderParticles({ particles, worldOffset, screenW, screenH }: Props) {
  return (
    <>
      {particles.map(p => {
        if (!p.active) return null;
        const sx = p.position.x - worldOffset.x;
        const sy = p.position.y - worldOffset.y;
        if (sx < -CULL_PAD || sx > screenW + CULL_PAD ||
            sy < -CULL_PAD || sy > screenH + CULL_PAD) return null;

        const alpha = Math.max(0, p.lifetime / p.maxLifetime);
        if (alpha < 0.05) return null; // skip near-invisible particles
        const color = `${p.color}${ALPHA_HEX[Math.floor(alpha * 255)]}`;
        return (
          <Circle
            key={p.id}
            cx={sx}
            cy={sy}
            r={p.radius * alpha + 0.5}
            color={color}
          />
        );
      })}
    </>
  );
}
