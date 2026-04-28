import React from 'react';
import { StyleSheet } from 'react-native';
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
  const visible  = useSharedValue(0);
  const originX  = useSharedValue(0);
  const originY  = useSharedValue(0);
  const nubX     = useSharedValue(0);
  const nubY     = useSharedValue(0);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      originX.value = e.absoluteX;
      originY.value = e.absoluteY;
      nubX.value    = 0;
      nubY.value    = 0;
      visible.value = 1;
    })
    .onUpdate((e) => {
      const dist  = Math.sqrt(e.translationX ** 2 + e.translationY ** 2);
      const scale = dist > MAX_DIST ? MAX_DIST / dist : 1;
      nubX.value = e.translationX * scale;
      nubY.value = e.translationY * scale;
      joystickX.value = (e.translationX * scale) / MAX_DIST;
      joystickY.value = (e.translationY * scale) / MAX_DIST;
    })
    .onEnd(() => {
      nubX.value      = withSpring(0, { damping: 20, stiffness: 300 });
      nubY.value      = withSpring(0, { damping: 20, stiffness: 300 });
      joystickX.value = 0;
      joystickY.value = 0;
      visible.value   = 0;
    });

  const outerStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    left: originX.value - OUTER_R,
    top:  originY.value - OUTER_R,
  }));

  const nubStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nubX.value }, { translateY: nubY.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={styles.fullscreen}>
        <Animated.View style={[styles.outer, outerStyle]}>
          <Animated.View style={[styles.inner, nubStyle]} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  outer: {
    position: 'absolute',
    width:  OUTER_R * 2,
    height: OUTER_R * 2,
    borderRadius: OUTER_R,
    backgroundColor: 'rgba(79,195,247,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(79,195,247,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width:  INNER_R * 2,
    height: INNER_R * 2,
    borderRadius: INNER_R,
    backgroundColor: 'rgba(79,195,247,0.60)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.50)',
  },
});
