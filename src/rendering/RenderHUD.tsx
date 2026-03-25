import React from 'react';
import { Rect, Text, matchFont } from '@shopify/react-native-skia';
import { PlayerEntity } from '../game/state/types';

interface Props {
  player: PlayerEntity;
  gameTime: number;
  screenW: number;
}

export function RenderHUD({ player, gameTime, screenW }: Props) {
  const barW = Math.min(200, screenW - 40);
  const hpRatio = player.hp / player.maxHp;
  const xpRatio = player.xp / player.xpToNextLevel;

  const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
  const seconds = Math.floor(gameTime % 60).toString().padStart(2, '0');

  const font = matchFont({ fontFamily: 'System', fontSize: 13 });

  return (
    <>
      {/* HP bar background */}
      <Rect x={20} y={16} width={barW} height={10} color="rgba(255,60,60,0.3)" />
      {/* HP bar fill */}
      <Rect x={20} y={16} width={barW * hpRatio} height={10} color="#ff4444" />

      {/* XP bar background */}
      <Rect x={20} y={30} width={barW} height={6} color="rgba(0,200,120,0.25)" />
      {/* XP bar fill */}
      <Rect x={20} y={30} width={barW * xpRatio} height={6} color="#00e5aa" />

      {/* Timer */}
      {font && (
        <Text
          x={screenW / 2 - 24}
          y={50}
          text={`${minutes}:${seconds}`}
          font={font}
          color="#ffffffcc"
        />
      )}
      {/* Level */}
      {font && (
        <Text
          x={20}
          y={55}
          text={`Lv ${player.level}`}
          font={font}
          color="#ffffffcc"
        />
      )}
    </>
  );
}
