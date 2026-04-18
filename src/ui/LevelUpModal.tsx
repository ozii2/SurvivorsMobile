import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { UpgradeOption, UpgradeType } from '../game/state/types';
import { playSfxLevelUp, hapticSuccess } from '../services/AudioService';

interface Props {
  visible: boolean;
  choices: UpgradeOption[];
  onChoose: (choice: UpgradeOption) => void;
}

const UPGRADE_STYLE: Record<UpgradeType, { icon: string; color: string }> = {
  weapon_new:     { icon: '⚔️',  color: '#FF6B35' },
  weapon_upgrade: { icon: '⬆️',  color: '#FFC107' },
  max_hp:         { icon: '❤️',  color: '#FF4444' },
  speed:          { icon: '💨',  color: '#4FC3F7' },
  armor:          { icon: '🛡️',  color: '#AB47BC' },
  magnet:         { icon: '🧲',  color: '#26C6DA' },
  crit:           { icon: '💥',  color: '#FF9800' },
  lifesteal:      { icon: '🩸',  color: '#E91E63' },
  passive_item:   { icon: '💠',  color: '#7B68EE' },
  weapon_evolve:  { icon: '✨',  color: '#FFD700' },
};

export function LevelUpModal({ visible, choices, onChoose }: Props) {
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 180 });
      playSfxLevelUp();
      hapticSuccess();
    } else {
      translateY.value = 60;
      opacity.value = 0;
    }
  }, [visible, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, animStyle]}>
          {choices.length === 1 && choices[0]?.type === 'weapon_evolve' ? (
            <>
              <Text style={[styles.title, { color: '#FFD700' }]}>EVRİM!</Text>
              <Text style={styles.subtitle}>Silahın dönüşüme hazır:</Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>SEVİYE ATLADI!</Text>
              <Text style={styles.subtitle}>Bir yetenek seç:</Text>
            </>
          )}
          {choices.map(choice => {
            const style = UPGRADE_STYLE[choice.type] ?? { icon: '✨', color: '#ffffff' };
            return (
              <TouchableOpacity
                key={choice.id}
                style={[styles.card, { borderColor: `${style.color}66` }]}
                onPress={() => onChoose(choice)}
                activeOpacity={0.75}
              >
                {/* Colored left stripe */}
                <View style={[styles.stripe, { backgroundColor: style.color }]} />
                {/* Icon */}
                <Text style={styles.icon}>{style.icon}</Text>
                {/* Text content */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{choice.label}</Text>
                  <Text style={styles.cardDesc}>{choice.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.80)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: '88%',
    backgroundColor: '#12122a',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#3a3a6a',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffe066',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#8888aa',
    textAlign: 'center',
    marginBottom: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e40',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stripe: {
    width: 4,
    alignSelf: 'stretch',
  },
  icon: {
    fontSize: 26,
    marginHorizontal: 14,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: '#8888bb',
    lineHeight: 17,
  },
});
