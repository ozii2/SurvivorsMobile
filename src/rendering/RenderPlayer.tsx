import React, { useMemo } from 'react';
import { Circle, Group, Image, useImage, Skia } from '@shopify/react-native-skia';
import { PlayerEntity, Vec2 } from '../game/state/types';
import { GarlicConfig } from '../game/config/GameConfig';

interface Props {
  player: PlayerEntity;
  worldOffset: Vec2;
  photoUri?: string | null;
  bodyColor?: string;
  glowRgb?: string;
  gameTime?: number;
}

export function RenderPlayer({ player, worldOffset, photoUri, bodyColor, glowRgb, gameTime = 0 }: Props) {
  const sx = player.position.x - worldOffset.x;
  const sy = player.position.y - worldOffset.y;
  const r = player.radius;

  const isInvincible = player.invincibleTimer > 0;
  const flash = isInvincible && Math.floor(player.invincibleTimer * 10) % 2 === 0;

  const bc = bodyColor ?? '#4fc3f7';
  const gr = glowRgb   ?? '79,195,247';

  const glowOuter = useMemo(() => `rgba(${gr},0.05)`, [gr]);
  const glowMid   = useMemo(() => `rgba(${gr},0.13)`, [gr]);
  const glowInner = useMemo(() => `rgba(${gr},0.25)`, [gr]);

  const photo = useImage(photoUri ?? null);

  const clipPath = useMemo(() => {
    const path = Skia.Path.Make();
    path.addCircle(0, 0, r);
    return path;
  }, [r]);

  // Garlic aura — find garlic weapon level
  const garlicWeapon = player.weapons.find(w => w.id === 'garlic');
  const garlicRadius = garlicWeapon
    ? GarlicConfig[Math.min(garlicWeapon.level, 8) as keyof typeof GarlicConfig].radius
    : 0;

  // Pulsing aura: base + small sine wave
  const auraR = garlicRadius > 0
    ? garlicRadius + Math.sin(gameTime * 3.5) * garlicRadius * 0.05
    : 0;

  return (
    <>
      {/* Garlic aura (rendered behind player) */}
      {auraR > 0 && (
        <>
          <Circle cx={sx} cy={sy} r={auraR} color="rgba(120,255,60,0.06)" />
          <Circle cx={sx} cy={sy} r={auraR}
            color="rgba(120,255,60,0.40)" style="stroke" strokeWidth={1.5} />
          <Circle cx={sx} cy={sy} r={auraR * 0.85} color="rgba(80,220,40,0.04)" />
        </>
      )}

      {/* Player glow + body */}
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
