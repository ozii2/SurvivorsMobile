import React from 'react';
import { Group, Rect } from '@shopify/react-native-skia';
import { XPGemEntity, Vec2 } from '../game/state/types';

interface Props {
  gems: XPGemEntity[];
  worldOffset: Vec2;
  screenW: number;
  screenH: number;
  gameTime: number;
}

export function RenderXPGems({ gems, worldOffset, screenW, screenH, gameTime }: Props) {
  return (
    <>
      {gems.map(gem => {
        if (!gem.active) return null;
        const sx = gem.position.x - worldOffset.x;
        const sy = gem.position.y - worldOffset.y;
        if (sx < -20 || sx > screenW + 20 || sy < -20 || sy > screenH + 20) return null;

        const r = gem.radius;
        // Continuous rotation — faster when magnetized
        const spinSpeed = gem.isMagnetized ? 4.0 : 1.5;
        const angle = gameTime * spinSpeed;
        // Magnetized: pulsing cyan glow
        const glowAlpha = gem.isMagnetized
          ? 0.28 + 0.18 * Math.sin(gameTime * 6)
          : 0.18;
        const glowColor = gem.isMagnetized
          ? `rgba(0,255,220,${glowAlpha.toFixed(2)})`
          : `rgba(0,229,170,${glowAlpha.toFixed(2)})`;
        const bodyColor = gem.isMagnetized ? '#00ffee' : '#00e5aa';

        return (
          <Group key={gem.id} transform={[{ rotate: angle }]} origin={{ x: sx, y: sy }}>
            {/* Outer glow */}
            <Rect
              x={sx - r * 1.4} y={sy - r * 1.4}
              width={r * 2.8} height={r * 2.8}
              color={glowColor}
            />
            {/* Inner body */}
            <Rect
              x={sx - r * 0.7} y={sy - r * 0.7}
              width={r * 1.4} height={r * 1.4}
              color={bodyColor}
            />
            {/* Bright core facet */}
            <Rect
              x={sx - r * 0.25} y={sy - r * 0.25}
              width={r * 0.5} height={r * 0.5}
              color="rgba(255,255,255,0.55)"
            />
          </Group>
        );
      })}
    </>
  );
}
