import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSaveStore } from '../game/state/useSaveStore';
import { ALL_ACHIEVEMENTS } from '../services/AchievementService';

interface Props {
  wave: number;
  time: number;
  level: number;
  maxCombo: number;
  newAchievements: string[];
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function PostGameStats({ wave, time, level, maxCombo, newAchievements }: Props) {
  const bestTime = useSaveStore(s => s.bestTime);
  const highestWave = useSaveStore(s => s.highestWave);
  const totalGames = useSaveStore(s => s.totalGames);

  const isNewBestTime = time >= bestTime && bestTime > 0;
  const isNewBestWave = wave >= highestWave && highestWave > 0;

  const achievementDefs = newAchievements
    .map(id => ALL_ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean) as typeof ALL_ACHIEVEMENTS;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatBox label="Seviye" value={String(level)} isRecord={false} />
        <StatBox label="Dalga"  value={String(wave)}  isRecord={isNewBestWave} />
        <StatBox label="Süre"   value={formatTime(time)} isRecord={isNewBestTime} />
        {maxCombo >= 2 && (
          <StatBox label="Kombo" value={`x${maxCombo}`} isRecord={false} highlight />
        )}
      </View>

      {totalGames > 1 && (
        <View style={styles.records}>
          <Text style={styles.recordsTitle}>EN İYİ</Text>
          <Text style={styles.recordText}>
            Dalga <Text style={styles.recordValue}>{highestWave}</Text>
            {'  ·  '}
            Süre <Text style={styles.recordValue}>{formatTime(bestTime)}</Text>
            {'  ·  '}
            {totalGames} oyun
          </Text>
        </View>
      )}

      {achievementDefs.length > 0 && (
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>BAŞARIM AÇILDI!</Text>
          {achievementDefs.map(a => (
            <View key={a.id} style={styles.achievementRow}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <View>
                <Text style={styles.achievementName}>{a.name}</Text>
                <Text style={styles.achievementDesc}>{a.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function StatBox({
  label, value, isRecord, highlight,
}: { label: string; value: string; isRecord: boolean; highlight?: boolean }) {
  return (
    <View style={[styles.statBox, isRecord && styles.statBoxRecord, highlight && styles.statBoxHighlight]}>
      <Text style={[styles.statValue, isRecord && styles.statValueRecord, highlight && styles.statValueHighlight]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      {isRecord && <Text style={styles.newRecord}>YENİ!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#1e1e3a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a6c',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 72,
    gap: 2,
  },
  statBoxRecord: { borderColor: '#ffe066', backgroundColor: 'rgba(255,224,102,0.08)' },
  statBoxHighlight: { borderColor: '#ff9900', backgroundColor: 'rgba(255,153,0,0.08)' },
  statValue: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  statValueRecord: { color: '#ffe066' },
  statValueHighlight: { color: '#ffaa33' },
  statLabel: { color: '#8888bb', fontSize: 10, letterSpacing: 1 },
  newRecord: { color: '#ffe066', fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginTop: 2 },
  records: { alignItems: 'center', gap: 4 },
  recordsTitle: { color: '#555577', fontSize: 10, letterSpacing: 2 },
  recordText: { color: '#666688', fontSize: 12 },
  recordValue: { color: '#aaaacc', fontWeight: '600' },
  achievementsSection: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,200,0,0.07)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,200,0,0.25)',
    padding: 12,
    gap: 8,
    width: '100%',
    maxWidth: 300,
  },
  achievementsTitle: { color: '#ffe066', fontSize: 11, fontWeight: 'bold', letterSpacing: 2, alignSelf: 'center' },
  achievementRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  achievementIcon: { fontSize: 18 },
  achievementName: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
  achievementDesc: { color: '#888899', fontSize: 11 },
});
