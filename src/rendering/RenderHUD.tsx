import React from 'react';
import { Rect, Text, matchFont, LinearGradient, vec } from '@shopify/react-native-skia';
import { PlayerEntity, EnemyEntity } from '../game/state/types';

// Computed once at module load — never recreated
const FONT      = matchFont({ fontFamily: 'System', fontSize: 13 });
const BOSS_FONT = matchFont({ fontFamily: 'System', fontSize: 12 });

interface Props {
  player: PlayerEntity;
  enemies: EnemyEntity[];
  gameTime: number;
  screenW: number;
  screenH: number;
}

export function RenderHUD({ player, enemies, gameTime, screenW, screenH }: Props) {
  const barW = Math.min(200, screenW - 40);
  const hpRatio = player.hp / player.maxHp;
  const xpRatio = player.xp / player.xpToNextLevel;

  const minutes = Math.floor(gameTime / 60).toString().padStart(2, '0');
  const seconds = Math.floor(gameTime % 60).toString().padStart(2, '0');

  // ── Near-death red vignette ────────────────────────────────────────────────
  const nearDeath = hpRatio < 0.30;
  const vigColor = nearDeath
    ? `rgba(200,0,0,${(0.13 + 0.07 * Math.sin(gameTime * 5)).toFixed(3)})`
    : 'rgba(200,0,0,0)';

  // ── Boss health bar ────────────────────────────────────────────────────────
  let boss: EnemyEntity | null = null;
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].active && enemies[i].type === 'boss') {
      boss = enemies[i];
      break;
    }
  }
  const bossBarW = screenW * 0.6;
  const bossBarX = (screenW - bossBarW) / 2;
  const bossBarY = screenH - 36;

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
      {FONT && (
        <Text
          x={screenW / 2 - 24}
          y={50}
          text={`${minutes}:${seconds}`}
          font={FONT}
          color="#ffffffcc"
        />
      )}
      {/* Level */}
      {FONT && (
        <Text
          x={20}
          y={55}
          text={`Lv ${player.level}`}
          font={FONT}
          color="#ffffffcc"
        />
      )}

      {/* ── Near-death vignette ───────────────────────────────────────────── */}
      {nearDeath && (
        <>
          <Rect x={0} y={0} width={screenW} height={screenH * 0.30}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, screenH * 0.30)}
              colors={[vigColor, 'rgba(200,0,0,0)']}
            />
          </Rect>
          <Rect x={0} y={screenH * 0.70} width={screenW} height={screenH * 0.30}>
            <LinearGradient
              start={vec(0, screenH * 0.70)}
              end={vec(0, screenH)}
              colors={['rgba(200,0,0,0)', vigColor]}
            />
          </Rect>
          <Rect x={0} y={0} width={screenW * 0.18} height={screenH}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(screenW * 0.18, 0)}
              colors={[vigColor, 'rgba(200,0,0,0)']}
            />
          </Rect>
          <Rect x={screenW * 0.82} y={0} width={screenW * 0.18} height={screenH}>
            <LinearGradient
              start={vec(screenW * 0.82, 0)}
              end={vec(screenW, 0)}
              colors={['rgba(200,0,0,0)', vigColor]}
            />
          </Rect>
        </>
      )}

      {/* ── Boss health bar ───────────────────────────────────────────────── */}
      {boss && (
        <>
          {/* Background strip */}
          <Rect x={bossBarX - 4} y={bossBarY - 20} width={bossBarW + 8} height={32} color="rgba(0,0,0,0.75)" />
          {/* Bar background */}
          <Rect x={bossBarX} y={bossBarY} width={bossBarW} height={10} color="rgba(255,30,30,0.25)" />
          {/* Bar fill */}
          <Rect x={bossBarX} y={bossBarY} width={bossBarW * (boss.hp / boss.maxHp)} height={10} color="#ff2020" />
          {/* Label */}
          {BOSS_FONT && (
            <Text
              x={bossBarX}
              y={bossBarY - 6}
              text="PATRON"
              font={BOSS_FONT}
              color="#ff6060"
            />
          )}
        </>
      )}
    </>
  );
}
