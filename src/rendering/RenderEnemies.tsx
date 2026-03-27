import React from 'react';
import { Circle, Rect, LinearGradient, vec } from '@shopify/react-native-skia';
import { EnemyEntity, Vec2 } from '../game/state/types';
import { EnemyConfig } from '../game/config/GameConfig';

interface Props {
  enemies: EnemyEntity[];
  worldOffset: Vec2;
  screenW: number;
  screenH: number;
  gameTime: number;
  activeEnemyCount: number;
}

// Pre-parsed glow colors — neon cyberpunk palette
const GLOW_COLORS: Record<string, string> = {
  basic: 'rgba(255,60,60,0.20)',
  fast:  'rgba(255,160,40,0.22)',
  tank:  'rgba(160,60,220,0.22)',
  boss:  'rgba(255,30,30,0.28)',
};

export function RenderEnemies({ enemies, worldOffset, screenW, screenH, gameTime, activeEnemyCount }: Props) {
  // LOD: skip non-essential visuals when many enemies are active
  const highDetail = activeEnemyCount < 30;

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
        const bx = sx - enemy.radius;
        const by = sy - enemy.radius - 7;
        const bw = enemy.radius * 2;

        const isBoss = enemy.type === 'boss';

        return (
          <React.Fragment key={enemy.id}>
            {/* Boss: animated energy rings */}
            {isBoss && (() => {
              const ringAlpha = (Math.sin(gameTime * 3) * 0.15 + 0.30).toFixed(2);
              const ringR = enemy.radius * 1.9 + Math.sin(gameTime * 2) * 3;
              const outerAlpha = (Number(ringAlpha) * 0.5).toFixed(2);
              return (
                <>
                  <Circle cx={sx} cy={sy} r={enemy.radius * 2.8}
                    color={`rgba(255,80,80,${outerAlpha})`} style="stroke" strokeWidth={1} />
                  <Circle cx={sx} cy={sy} r={ringR}
                    color={`rgba(255,50,50,${ringAlpha})`} style="stroke" strokeWidth={2} />
                </>
              );
            })()}

            {/* Glow halo — skipped for basic/fast in low-detail mode */}
            {(highDetail || enemy.type === 'tank' || isBoss) && (
              <Circle cx={sx} cy={sy} r={enemy.radius * 2.0} color={glowColor} />
            )}

            {/* Body */}
            <Circle cx={sx} cy={sy} r={enemy.radius} color={bodyColor} />

            {/* Highlight — only in high detail */}
            {highDetail && (
              <Circle cx={sx - 3} cy={sy - 3} r={enemy.radius * 0.3} color="rgba(255,255,255,0.18)" />
            )}

            {/* HP bar — only when damaged */}
            {hpRatio < 1 && (
              <>
                <Rect x={bx} y={by} width={bw} height={3} color="rgba(0,0,0,0.55)" />
                <Rect x={bx} y={by} width={bw * hpRatio} height={3}>
                  <LinearGradient
                    start={vec(bx, by)}
                    end={vec(bx + bw, by)}
                    colors={['#ff8a80', '#ff1744']}
                  />
                </Rect>
              </>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
