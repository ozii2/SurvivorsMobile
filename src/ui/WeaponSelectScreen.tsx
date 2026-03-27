import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WEAPONS = [
  {
    id: 'dagger',
    label: 'Hançer',
    icon: '🗡️',
    color: '#FFD700',
    description: 'Her yöne otomatik hançer fırlatır. Hızlı ve çok yönlü.',
  },
  {
    id: 'fireball',
    label: 'Ateş Topu',
    icon: '🔥',
    color: '#ff8820',
    description: 'Etrafında dönen ateş topları. Sürekli hasar verir.',
  },
  {
    id: 'whip',
    label: 'Kırbaç',
    icon: '⚡',
    color: '#cc44ff',
    description: 'Yatay yay hareketi. Geniş alan hasarı.',
  },
];

interface Props {
  onSelect: (weaponId: string) => void;
}

export function WeaponSelectScreen({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SİLAH SEÇ</Text>
      <Text style={styles.subtitle}>Başlangıç silahını seç</Text>

      {WEAPONS.map(w => (
        <TouchableOpacity
          key={w.id}
          style={styles.card}
          onPress={() => onSelect(w.id)}
          activeOpacity={0.75}
        >
          <View style={[styles.stripe, { backgroundColor: w.color }]} />
          <Text style={styles.icon}>{w.icon}</Text>
          <View style={styles.textBlock}>
            <Text style={[styles.weaponLabel, { color: w.color }]}>{w.label}</Text>
            <Text style={styles.weaponDesc}>{w.description}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffe066',
    letterSpacing: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8888bb',
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a5c',
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
  },
  stripe: {
    width: 6,
    alignSelf: 'stretch',
  },
  icon: {
    fontSize: 32,
    paddingHorizontal: 16,
  },
  textBlock: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 12,
    gap: 4,
  },
  weaponLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  weaponDesc: {
    fontSize: 13,
    color: '#9999bb',
    lineHeight: 18,
  },
});
