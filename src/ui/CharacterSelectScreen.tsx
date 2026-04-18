import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { CHARACTERS } from '../game/config/CharacterConfig';
import { CharacterId } from '../game/state/types';

interface Props {
  onSelect: (characterId: CharacterId) => void;
}

const WEAPON_LABELS: Record<string, string> = {
  dagger:   'Hançer',
  fireball: 'Ateş Topu',
  whip:     'Kırbaç',
  lightning:'Şimşek',
  garlic:   'Sarımsak',
  cross:    'Kutsal Haç',
};

export function CharacterSelectScreen({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>KARAKTER SEÇ</Text>
      <Text style={styles.subtitle}>Oyun stilini belirle</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CHARACTERS.map(char => (
          <TouchableOpacity
            key={char.id}
            style={styles.card}
            onPress={() => onSelect(char.id)}
            activeOpacity={0.75}
          >
            <View style={[styles.stripe, { backgroundColor: char.color }]} />
            <Text style={styles.icon}>{char.icon}</Text>
            <View style={styles.textBlock}>
              <Text style={[styles.charName, { color: char.color }]}>{char.name}</Text>
              <Text style={styles.charDesc}>{char.description}</Text>
              <View style={styles.tagsRow}>
                <View style={[styles.tag, { borderColor: char.color }]}>
                  <Text style={[styles.tagText, { color: char.color }]}>
                    {WEAPON_LABELS[char.startingWeaponId] ?? char.startingWeaponId}
                  </Text>
                </View>
                <View style={[styles.tag, styles.tagBonus]}>
                  <Text style={styles.tagBonusText}>{char.bonusLine}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
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
    marginBottom: 20,
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    gap: 14,
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
    overflow: 'hidden',
  },
  stripe: {
    width: 6,
    alignSelf: 'stretch',
  },
  icon: {
    fontSize: 34,
    paddingHorizontal: 14,
  },
  textBlock: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 12,
    gap: 4,
  },
  charName: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  charDesc: {
    fontSize: 12,
    color: '#9999bb',
    lineHeight: 17,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  tag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagBonus: {
    borderColor: '#5a5a8c',
    backgroundColor: 'rgba(90,90,140,0.15)',
  },
  tagBonusText: {
    fontSize: 11,
    color: '#aaaacc',
  },
});
