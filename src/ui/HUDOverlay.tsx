import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../game/state/useGameStore';

interface Props {
  onPause: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function HUDOverlay({ onPause }: Props) {
  const level = useGameStore(s => s.level);
  const waveNumber = useGameStore(s => s.waveNumber);
  const gameTime = useGameStore(s => s.gameTime);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Pause button — sağ üst */}
      <TouchableOpacity style={styles.pauseBtn} onPress={onPause}>
        <Text style={styles.pauseText}>⏸</Text>
      </TouchableOpacity>

      {/* Süre + dalga — sol üst */}
      <View style={styles.infoBlock}>
        <Text style={styles.timerText}>{formatTime(gameTime)}</Text>
        <Text style={styles.waveText}>Dalga {waveNumber}  ·  Sv {level}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  pauseBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pauseText: {
    fontSize: 18,
    color: '#fff',
  },
  infoBlock: {
    position: 'absolute',
    top: 12,
    left: 16,
    alignItems: 'flex-start',
    gap: 2,
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.90)',
    letterSpacing: 1,
  },
  waveText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.5,
  },
});
