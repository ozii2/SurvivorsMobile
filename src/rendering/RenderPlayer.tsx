import React, { useMemo } from 'react';
import { Circle, Group, Image, useImage, Skia } from '@shopify/react-native-skia';
import { PlayerEntity, Vec2 } from '../game/state/types';

interface Props {
  player: PlayerEntity;
  worldOffset: Vec2;
  photoUri?: string | null;
  bodyColor?: string;   // preset body color, default '#4fc3f7'
  glowRgb?: string;     // 'r,g,b' string for glow, default '79,195,247'
}

export function RenderPlayer({ player, worldOffset, photoUri, bodyColor, glowRgb }: Props) {
  const sx = player.position.x - worldOffset.x;
  const sy = player.position.y - worldOffset.y;
  const r = player.radius;

  const isInvincible = player.invincibleTimer > 0;
  const flash = isInvincible && Math.floor(player.invincibleTimer * 10) % 2 === 0;

  const bc  = bodyColor ?? '#4fc3f7';
  const gr  = glowRgb   ?? '79,195,247';

  // Precompute glow color strings — only when glowRgb changes
  const glowOuter = useMemo(() => `rgba(${gr},0.05)`,  [gr]);
  const glowMid   = useMemo(() => `rgba(${gr},0.13)`,  [gr]);
  const glowInner = useMemo(() => `rgba(${gr},0.25)`,  [gr]);

  // Load photo — returns null if no URI
  const photo = useImage(photoUri ?? null);

  // Clip path for circular photo — recomputed only when radius changes
  const clipPath = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(0, 0, r);
    return path;
  }, [r]);

  return (
    <>
      <Circle cx={sx} cy={sy} r={r * 2.8} color={glowOuter} />
      <Circle cx={sx} cy={sy} r={r * 1.9} color={glowMid} />
      <Circle cx={sx} cy={sy} r={r * 1.35} color={glowInner} />
      <Circle cx={sx + 2} cy={sy + 3} r={r} color="rgba(0,0,0,0.35)" />

      {photo ? (
        <Group
          transform={[{ translateX: sx }, { translateY: sy }]}
          clip={clipPath}
          opacity={flash ? 0.4 : 1}
        >
          <Image image={photo} x={-r} y={-r} width={r * 2} height={r * 2} fit="cover" />
        </Group>
      ) : (
        <Circle cx={sx} cy={sy} r={r} color={flash ? '#ffffff' : bc} />
      )}
    </>
  );
}
