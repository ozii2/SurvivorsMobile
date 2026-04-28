import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSaveStore, upgradeCost } from '../game/state/useSaveStore';
import { PurchasedUpgrades } from '../services/SaveService';

interface Props {
  onBack: () => void;
}

const UPGRADE_INFO: {
  key: keyof PurchasedUpgrades;
  label: string;
  icon: string;
  effectText: (level: number) => string;
  color: string;
}[] = [
  {
    key: 'maxHp',
    label: 'Maksimum Can',
    icon: '❤️',
    effectText: (l) => `+${l * 10} Max HP`,
    color: '#ff6666',
  },
  {
    key: 'damage',
    label: 'Hasar Gücü',
    icon: '⚔️',
    effectText: (l) => `+${l * 8}% Hasar`,
    color: '#ffaa44',
  },
  {
    key: 'armor',
    label: 'Zırh',
    icon: '🛡️',
    effectText: (l) => `+${l} Zırh`,
    color: '#44aaff',
  },
  {
    key: 'speed',
    label: 'Hareket Hızı',
    icon: '👟',
    effectText: (l) => `+${l * 5}% Hız`,
    color: '#44ff88',
  },
];

const MAX_LEVEL = 5;

export function UpgradeShopScreen({ onBack }: Props) {
  const purchasedUpgrades = useSaveStore(s => s.purchasedUpgrades);
  const currentGoldBalance = useSaveStore(s => s.currentGoldBalance);
  const buyUpgrade = useSaveStore(s => s.buyUpgrade);
  const [feedback, setFeedback] = useState<string>('');

  const handleBuy = async (key: keyof PurchasedUpgrades) => {
    const success = await buyUpgrade(key);
    if (success) {
      setFeedback('Yükseltme satın alındı!');
    } else {
      const level = purchasedUpgrades[key];
      if (level >= MAX_LEVEL) {
        setFeedback('Maksimum seviyeye ulaşıldı!');
      } else {
        setFeedback('Yeterli altın yok!');
      }
    }
    setTimeout(() => setFeedback(''), 2000);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>MAĞAZA</Text>
      <Text style={styles.subtitle}>Kalıcı güçlenmeler satın al</Text>

      <View style={styles.goldRow}>
        <Text style={styles.goldIcon}>🪙</Text>
        <Text style={styles.goldAmount}>{currentGoldBalance}</Text>
        <Text style={styles.goldLabel}> altın</Text>
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {UPGRADE_INFO.map(info => {
          const level = purchasedUpgrades[info.key];
          const isMax = level >= MAX_LEVEL;
          const cost = isMax ? 0 : upgradeCost(info.key, level);
          const canAfford = currentGoldBalance >= cost;

          return (
            <View key={info.key} style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: info.color + '22' }]}>
                <Text style={styles.cardIcon}>{info.icon}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardLabel, { color: info.color }]}>{info.label}</Text>
                <Text style={styles.cardEffect}>
                  {level > 0 ? info.effectText(level) : 'Henüz yükseltilmedi'}
                </Text>
                <View style={styles.levelDots}>
                  {Array.from({ length: MAX_LEVEL }).map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i < level && { backgroundColor: info.color }]}
                    />
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.buyBtn,
                  isMax && styles.buyBtnMax,
                  !isMax && !canAfford && styles.buyBtnDisabled,
                ]}
                onPress={() => handleBuy(info.key)}
                disabled={isMax}
              >
                {isMax ? (
                  <Text style={styles.buyBtnTextMax}>MAX</Text>
                ) : (
                  <>
                    <Text style={styles.buyBtnIcon}>🪙</Text>
                    <Text style={[styles.buyBtnCost, !canAfford && styles.buyBtnCostDisabled]}>
                      {cost}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 20,
  },
  backBtn: {
    position: 'absolute',
    top: 55,
    left: 20,
  },
  backBtnText: {
    color: '#8888bb',
    fontSize: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffe066',
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#8888bb',
    letterSpacing: 1,
    marginBottom: 12,
  },
  goldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffe06644',
  },
  goldIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  goldAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffe066',
  },
  goldLabel: {
    fontSize: 14,
    color: '#aaa880',
  },
  feedback: {
    fontSize: 13,
    color: '#88ff88',
    marginBottom: 6,
    height: 18,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a5c',
    width: '100%',
    maxWidth: 400,
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardEffect: {
    fontSize: 12,
    color: '#9999bb',
  },
  levelDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333355',
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe066',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    minWidth: 60,
    justifyContent: 'center',
  },
  buyBtnMax: {
    backgroundColor: '#2a2a4a',
  },
  buyBtnDisabled: {
    backgroundColor: '#2a2a3a',
  },
  buyBtnIcon: {
    fontSize: 13,
  },
  buyBtnCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  buyBtnCostDisabled: {
    color: '#666688',
  },
  buyBtnTextMax: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555577',
    letterSpacing: 1,
  },
});
