import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onPause: () => void;
}

// Oyun bilgisi (süre, seviye, dalga, kombo) Skia'daki drawHUD'da çizilir;
// burada yalnızca dokunma gerektiren duraklatma butonu kalır.
export function HUDOverlay({ onPause }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Pause button — sağ üst; kutu sabit, drawHUD bu alanı boş bırakıyor */}
      <TouchableOpacity
        style={styles.pauseBtn}
        onPress={onPause}
        accessibilityLabel="Duraklat"
        accessibilityRole="button"
      >
        <Text style={styles.pauseText}>⏸</Text>
      </TouchableOpacity>
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
  },
  pauseBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 44,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
  },
  pauseText: {
    fontSize: 18,
    color: '#fff',
  },
});
