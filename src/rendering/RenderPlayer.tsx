import React from 'react';
import { Circle } from '@shopify/react-native-skia';
import { PlayerEntity, Vec2 } from '../game/state/types';

interface Props {
  player: PlayerEntity;
  worldOffset: Vec2;
}

export function RenderPlayer({ player, worldOffset }: Props) {
  const sx = player.position.x - worldOffset.x;
  const sy = player.position.y - worldOffset.y;
  const r = player.radius;

  const isInvincible = player.invincibleTimer > 0;
  const flash = isInvincible && Math.floor(player.invincibleTimer * 10) % 2 === 0;
  const bodyColor = flash ? '#ffffff' : '#4fc3f7';

  return (
    <>
      {/* Outer glow halo */}
      <Circle cx={sx} cy={sy} r={r * 2.8} color="rgba(79,195,247,0.05)" />
      {/* Mid glow */}
      <Circle cx={sx} cy={sy} r={r * 1.9} color="rgba(79,195,247,0.13)" />
      {/* Inner glow */}
      <Circle cx={sx} cy={sy} r={r * 1.35} color="rgba(79,195,247,0.25)" />
      {/* Shadow */}
      <Circle cx={sx + 2} cy={sy + 3} r={r} color="rgba(0,0,0,0.35)" />
      {/* Body */}
      <Circle cx={sx} cy={sy} r={r} color={bodyColor} />
      {/* Highlight */}
      <Circle cx={sx - 5} cy={sy - 5} r={r * 0.35} color="rgba(255,255,255,0.4)" />
    </>
  );
}
