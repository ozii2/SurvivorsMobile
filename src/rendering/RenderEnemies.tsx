import React from 'react';
import { Circle, Rect } from '@shopify/react-native-skia';
import { EnemyEntity, Vec2 } from '../game/state/types';
import { EnemyConfig } from '../game/config/GameConfig';

interface Props {
  enemies: EnemyEntity[];
  worldOffset: Vec2;
  screenW: number;
  screenH: number;
}

// Pre-parse glow colors to avoid string ops per frame
const GLOW_COLORS: Record<string, string> = {
  basic: 'rgba(224,80,80,0.18)',
  fast:  'rgba(224,160,48,0.18)',
  tank:  'rgba(144,64,192,0.18)',
  boss:  'rgba(255,32,32,0.22)',
};

export function RenderEnemies({ enemies, worldOffset, screenW, screenH }: Props) {
  return (
    <>
      {enemies.map(enemy => {
        if (!enemy.active) return null;
        const sx = enemy.position.x - worldOffset.x;
        const sy = enemy.position.y - worldOffset.y;
        const pad = enemy.radius * 2 + 4;
        if (sx < -pad || sx > screenW + pad || sy < -pad || sy > screenH + pad) return null;
        const cfg = EnemyConfig[enemy.type];
        const hpRatio = enemy.hp / enemy.maxHp;
        const glowColor = GLOW_COLORS[enemy.type];
        const bodyColor = enemy.hitFlashTimer > 0 ? '#ffffff' : cfg.color;

        return (
          <React.Fragment key={enemy.id}>
            {/* Glow halo */}
            <Circle cx={sx} cy={sy} r={enemy.radius * 2.0} color={glowColor} />
            {/* Body */}
            <Circle cx={sx} cy={sy} r={enemy.radius} color={bodyColor} />
            {/* Highlight */}
            <Circle cx={sx - 3} cy={sy - 3} r={enemy.radius * 0.3} color="rgba(255,255,255,0.2)" />
            {/* HP bar background */}
            <Rect
              x={sx - enemy.radius}
              y={sy - enemy.radius - 7}
              width={enemy.radius * 2}
              height={3}
              color="rgba(0,0,0,0.6)"
            />
            {/* HP bar fill */}
            <Rect
              x={sx - enemy.radius}
              y={sy - enemy.radius - 7}
              width={enemy.radius * 2 * hpRatio}
              height={3}
              color="#44ff88"
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
