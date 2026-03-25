import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  joystickX: ReturnType<typeof useSharedValue<number>>;
  joystickY: ReturnType<typeof useSharedValue<number>>;
}

const OUTER_R = 70;
const INNER_R = 28;
const MAX_DIST = OUTER_R - INNER_R;

export function VirtualJoystick({ joystickX, joystickY }: Props) {
  const nubX = useSharedValue(0);
  const nubY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const dist = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
      const scale = dist > MAX_DIST ? MAX_DIST / dist : 1;
      const clampX = e.translationX * scale;
      const clampY = e.translationY * scale;
      nubX.value = clampX;
      nubY.value = clampY;
      joystickX.value = clampX / MAX_DIST;
      joystickY.value = clampY / MAX_DIST;
    })
    .onEnd(() => {
      nubX.value = withSpring(0, { damping: 20, stiffness: 300 });
      nubY.value = withSpring(0, { damping: 20, stiffness: 300 });
      joystickX.value = 0;
      joystickY.value = 0;
    });

  const nubStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nubX.value }, { translateY: nubY.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.outer}>
        <Animated.View style={[styles.inner, nubStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: OUTER_R * 2,
    height: OUTER_R * 2,
    borderRadius: OUTER_R,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: INNER_R * 2,
    height: INNER_R * 2,
    borderRadius: INNER_R,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});
