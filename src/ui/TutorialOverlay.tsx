import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useGameStore } from '../game/state/useGameStore';
import { useSaveStore } from '../game/state/useSaveStore';

// ─── Tutorial steps ───────────────────────────────────────────────────────────

type Trigger = 'time' | 'xp' | 'level';

interface Step {
  icon: string;
  title: string;
  desc: string;
  trigger: Trigger;
  autoMs: number; // max ms before auto-advancing regardless of trigger
}

const STEPS: Step[] = [
  {
    icon: '🕹️',
    title: 'Hareket Et',
    desc: 'Sağ alttaki joystick\'i kullanarak karakterini yönlendir.',
    trigger: 'time',
    autoMs: 5000,
  },
  {
    icon: '⚔️',
    title: 'Otomatik Saldırı',
    desc: 'Silahların otomatik ateşlenir — düşmanlara doğru koş!',
    trigger: 'time',
    autoMs: 4000,
  },
  {
    icon: '💎',
    title: 'XP Taşı Topla',
    desc: 'Öldürülen düşmanlar XP taşı bırakır. Üzerinden geçerek topla.',
    trigger: 'xp',
    autoMs: 10000,
  },
  {
    icon: '⬆️',
    title: 'Level Atla',
    desc: 'Yeterli XP toplayınca level atlarsın. 3 yetenek arasından seçim yap!',
    trigger: 'level',
    autoMs: 20000,
  },
  {
    icon: '💀',
    title: 'Hayatta Kal!',
    desc: '8 dakika boyunca hayatta kalmaya çalış. İyi şanslar!',
    trigger: 'time',
    autoMs: 2500,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  onDone: () => void;
}

export function TutorialOverlay({ onDone }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const xpPercent = useGameStore(s => s.xpPercent);
  const level     = useGameStore(s => s.level);
  const isGameOver = useGameStore(s => s.isGameOver);
  const pendingChoices = useGameStore(s => s.pendingUpgradeChoices);

  const markTutorialDone = useSaveStore(s => s.markTutorialDone);

  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(30);

  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasXpRef   = useRef(false);
  const hasLevelRef = useRef(false);

  // ─── Animate card in/out ─────────────────────────────────────────────────

  const animIn = useCallback(() => {
    opacity.value    = withTiming(1, { duration: 250 });
    translateY.value = withSpring(0, { damping: 16, stiffness: 140 });
  }, [opacity, translateY]);

  const animOut = useCallback((cb: () => void) => {
    opacity.value    = withTiming(0, { duration: 200 });
    translateY.value = withTiming(20, { duration: 200 });
    setTimeout(cb, 210);
  }, [opacity, translateY]);

  // ─── Advance to next step ────────────────────────────────────────────────

  const advance = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);

    animOut(() => {
      setStepIdx(prev => {
        const next = prev + 1;
        if (next >= STEPS.length) {
          setVisible(false);
          markTutorialDone();
          onDone();
          return prev;
        }
        return next;
      });
    });
  }, [animOut, markTutorialDone, onDone]);

  // ─── Animate in when step changes ────────────────────────────────────────

  useEffect(() => {
    if (!visible) return;
    translateY.value = 30;
    opacity.value    = 0;
    animIn();

    const step = STEPS[stepIdx];
    autoTimerRef.current = setTimeout(advance, step.autoMs);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  // advance and animIn are stable; only stepIdx and visible matter here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, visible]);

  // ─── Event triggers ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!visible) return;
    const step = STEPS[stepIdx];

    if (step.trigger === 'xp' && xpPercent > 0 && !hasXpRef.current) {
      hasXpRef.current = true;
      advance();
    }
  }, [xpPercent, stepIdx, visible, advance]);

  useEffect(() => {
    if (!visible) return;
    const step = STEPS[stepIdx];

    if (step.trigger === 'level' && level > 1 && !hasLevelRef.current) {
      hasLevelRef.current = true;
      advance();
    }
  }, [level, stepIdx, visible, advance]);

  // ─── Skip (via tap) ──────────────────────────────────────────────────────

  const skip = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    animOut(() => {
      setVisible(false);
      markTutorialDone();
      onDone();
    });
  }, [animOut, markTutorialDone, onDone]);

  // ─── Animation style (must be declared before any conditional return) ───────

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // ─── Hide during level-up modal or game over ─────────────────────────────

  if (!visible || isGameOver || pendingChoices.length > 0) return null;

  const step = STEPS[stepIdx];

  return (
    <Animated.View style={[styles.card, animStyle]} pointerEvents="box-none">
      <View style={styles.header}>
        <Text style={styles.icon}>{step.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.desc}>{step.desc}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {/* Progress dots */}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === stepIdx && styles.dotActive]}
            />
          ))}
        </View>

        {/* Skip */}
        <TouchableOpacity onPress={skip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipText}>Atla</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 160,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(12, 12, 30, 0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3a6c',
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  icon: {
    fontSize: 34,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: '#ffe066',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  desc: {
    color: '#aaaacc',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3a3a6c',
  },
  dotActive: {
    backgroundColor: '#ffe066',
    width: 18,
  },
  skipText: {
    color: '#666688',
    fontSize: 13,
    fontWeight: '500',
  },
});
