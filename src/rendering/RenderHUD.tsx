import React, { useMemo } from 'react';
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

  // Near-death vignette — layout only changes when screen size changes
  const nearDeathVignette = useMemo(() => (
    <>
      <Rect x={0} y={0} width={screenW} height={screenH * 0.30}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, screenH * 0.30)}
          colors={['rgba(200,0,0,0.18)', 'rgba(200,0,0,0)']}
        />
      </Rect>
      <Rect x={0} y={screenH * 0.70} width={screenW} height={screenH * 0.30}>
        <LinearGradient
          start={vec(0, screenH * 0.70)}
          end={vec(0, screenH)}
          colors={['rgba(200,0,0,0)', 'rgba(200,0,0,0.18)']}
        />
      </Rect>
      <Rect x={0} y={0} width={screenW * 0.18} height={screenH}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(screenW * 0.18, 0)}
          colors={['rgba(200,0,0,0.18)', 'rgba(200,0,0,0)']}
        />
      </Rect>
      <Rect x={screenW * 0.82} y={0} width={screenW * 0.18} height={screenH}>
        <LinearGradient
          start={vec(screenW * 0.82, 0)}
          end={vec(screenW, 0)}
          colors={['rgba(200,0,0,0)', 'rgba(200,0,0,0.18)']}
        />
      </Rect>
    </>
  ), [screenW, screenH]);

  return (
    <>
      {/* HP bar — glow container + gradient fill */}
      <Rect x={18} y={14} width={barW + 4} height={14} color="rgba(255,50,50,0.12)" />
      <Rect x={20} y={16} width={barW} height={10} color="rgba(180,30,30,0.45)" />
      <Rect x={20} y={16} width={barW * hpRatio} height={10}>
        <LinearGradient
          start={vec(20, 16)} end={vec(20 + barW, 16)}
          colors={['#ff8a80', '#ff1744']}
        />
      </Rect>

      {/* XP bar — glow container + gradient fill */}
      <Rect x={18} y={29} width={barW + 4} height={10} color="rgba(0,180,220,0.10)" />
      <Rect x={20} y={30} width={barW} height={6} color="rgba(0,80,120,0.45)" />
      <Rect x={20} y={30} width={barW * xpRatio} height={6}>
        <LinearGradient
          start={vec(20, 30)} end={vec(20 + barW, 30)}
          colors={['#80d8ff', '#0288d1']}
        />
      </Rect>

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
      {nearDeath && nearDeathVignette}

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
