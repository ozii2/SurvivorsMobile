import React from 'react';
import { Group, Rect } from '@shopify/react-native-skia';
import { XPGemEntity, Vec2 } from '../game/state/types';

interface Props {
  gems: XPGemEntity[];
  worldOffset: Vec2;
  screenW: number;
  screenH: number;
}

export function RenderXPGems({ gems, worldOffset, screenW, screenH }: Props) {
  return (
    <>
      {gems.map(gem => {
        if (!gem.active) return null;
        const sx = gem.position.x - worldOffset.x;
        const sy = gem.position.y - worldOffset.y;
        if (sx < -20 || sx > screenW + 20 || sy < -20 || sy > screenH + 20) return null;
        const r = gem.radius;
        const bodyColor = gem.isMagnetized ? '#00ffcc' : '#00e5aa';
        return (
          <Group key={gem.id} transform={[{ rotate: Math.PI / 4 }]} origin={{ x: sx, y: sy }}>
            {/* Outer glow */}
            <Rect
              x={sx - r * 1.3}
              y={sy - r * 1.3}
              width={r * 2.6}
              height={r * 2.6}
              color="rgba(0,229,170,0.2)"
            />
            {/* Inner body */}
            <Rect
              x={sx - r * 0.7}
              y={sy - r * 0.7}
              width={r * 1.4}
              height={r * 1.4}
              color={bodyColor}
            />
          </Group>
        );
      })}
    </>
  );
}
