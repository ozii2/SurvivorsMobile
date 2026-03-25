import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../game/state/useGameStore';

interface Props {
  onPause: () => void;
}

export function HUDOverlay({ onPause }: Props) {
  const level = useGameStore(s => s.level);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity style={styles.pauseBtn} onPress={onPause}>
        <Text style={styles.pauseText}>⏸</Text>
      </TouchableOpacity>
      <Text style={styles.waveText}>Seviye {level}</Text>
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
    paddingTop: 60,
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
  waveText: {
    position: 'absolute',
    top: 60,
    right: 16,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});
