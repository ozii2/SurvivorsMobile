import React from 'react';
import { Circle, Rect } from '@shopify/react-native-skia';
import { ProjectileEntity, Vec2 } from '../game/state/types';

interface Props {
  projectiles: ProjectileEntity[];
  worldOffset: Vec2;
  screenW: number;
  screenH: number;
}

const COLORS: Record<string, { body: string; glow: string }> = {
  dagger:   { body: '#ffe066', glow: 'rgba(255,224,102,0.25)' },
  fireball: { body: '#ff8820', glow: 'rgba(255,136,32,0.28)' },
  whip:     { body: '#ddaaff', glow: 'rgba(221,170,255,0.22)' },
};

export function RenderProjectiles({ projectiles, worldOffset, screenW, screenH }: Props) {
  return (
    <>
      {projectiles.map(proj => {
        if (!proj.active) return null;
        const sx = proj.position.x - worldOffset.x;
        const sy = proj.position.y - worldOffset.y;
        const pad = proj.radius * 3 + 4;
        if (sx < -pad || sx > screenW + pad || sy < -pad || sy > screenH + pad) return null;
        const c = COLORS[proj.weaponId] ?? { body: '#ffffff', glow: 'rgba(255,255,255,0.2)' };

        if (proj.weaponId === 'whip') {
          return (
            <React.Fragment key={proj.id}>
              {/* Glow */}
              <Rect
                x={sx - proj.radius - 4}
                y={sy - 7}
                width={proj.radius * 2 + 8}
                height={14}
                color={c.glow}
              />
              {/* Body */}
              <Rect
                x={sx - proj.radius}
                y={sy - 3}
                width={proj.radius * 2}
                height={6}
                color={c.body}
              />
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={proj.id}>
            {/* Glow halo */}
            <Circle cx={sx} cy={sy} r={proj.radius * 2.2} color={c.glow} />
            {/* Body */}
            <Circle cx={sx} cy={sy} r={proj.radius} color={c.body} />
          </React.Fragment>
        );
      })}
    </>
  );
}
