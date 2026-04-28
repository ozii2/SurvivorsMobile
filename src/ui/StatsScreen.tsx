import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSaveStore } from '../game/state/useSaveStore';
import { ALL_ACHIEVEMENTS } from '../services/AchievementService';

interface Props {
  onBack: () => void;
}

const CHAR_LABELS: Record<string, string> = {
  warrior: '⚔️ Savaşçı',
  mage:    '🔮 Büyücü',
  healer:  '💚 Şifacı',
  hunter:  '🏹 Avcı',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

type Tab = 'history' | 'achievements';

export function StatsScreen({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('history');
  const achievements = useSaveStore(s => s.achievements);
  const runHistory = useSaveStore(s => s.runHistory);
  const highestWave = useSaveStore(s => s.highestWave);
  const totalGames = useSaveStore(s => s.totalGames);
  const bestTime = useSaveStore(s => s.bestTime);
  const totalGold = useSaveStore(s => s.totalGold);

  const unlockedSet = new Set(achievements);
  const unlockedCount = ALL_ACHIEVEMENTS.filter(a => unlockedSet.has(a.id)).length;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>İSTATİSTİKLER</Text>

      {/* Özet istatistikler */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
          <Text style={styles.summaryValue}>{highestWave}</Text>
          <Text style={styles.summaryLabel}>En İyi Dalga</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryCell}>
          <Text style={styles.summaryValue}>{formatTime(bestTime)}</Text>
          <Text style={styles.summaryLabel}>En İyi Süre</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryCell}>
          <Text style={styles.summaryValue}>{totalGames}</Text>
          <Text style={styles.summaryLabel}>Toplam Oyun</Text>
        </View>
        <View style={styles.summarySep} />
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryValue, { color: '#ffe066' }]}>🪙{totalGold}</Text>
          <Text style={styles.summaryLabel}>Toplam Altın</Text>
        </View>
      </View>

      {/* Tab seçici */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'history' && styles.tabActive]}
          onPress={() => setTab('history')}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
            Son Oyunlar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'achievements' && styles.tabActive]}
          onPress={() => setTab('achievements')}
        >
          <Text style={[styles.tabText, tab === 'achievements' && styles.tabTextActive]}>
            Başarımlar {unlockedCount}/{ALL_ACHIEVEMENTS.length}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'history' && (
          runHistory.length === 0
            ? <Text style={styles.emptyText}>Henüz tamamlanan oyun yok.</Text>
            : runHistory.map((run, i) => (
              <View key={i} style={styles.runCard}>
                <View style={styles.runLeft}>
                  <Text style={styles.runChar}>{CHAR_LABELS[run.characterId] ?? run.characterId}</Text>
                  <Text style={styles.runDate}>{formatDate(run.date)}</Text>
                </View>
                <View style={styles.runStats}>
                  <Text style={styles.runStat}>🌊 Dalga <Text style={styles.runStatVal}>{run.wave}</Text></Text>
                  <Text style={styles.runStat}>⏱ <Text style={styles.runStatVal}>{formatTime(run.time)}</Text></Text>
                  <Text style={styles.runStat}>☠️ <Text style={styles.runStatVal}>{run.kills}</Text></Text>
                  <Text style={styles.runStat}>🪙 <Text style={[styles.runStatVal, { color: '#ffe066' }]}>{run.gold}</Text></Text>
                </View>
              </View>
            ))
        )}

        {tab === 'achievements' && ALL_ACHIEVEMENTS.map(a => {
          const unlocked = unlockedSet.has(a.id);
          return (
            <View key={a.id} style={[styles.achievementCard, !unlocked && styles.achievementLocked]}>
              <Text style={styles.achievementIcon}>{unlocked ? '🏆' : '🔒'}</Text>
              <View style={styles.achievementText}>
                <Text style={[styles.achievementName, !unlocked && styles.achievementNameLocked]}>
                  {unlocked ? a.name : '???'}
                </Text>
                <Text style={styles.achievementDesc}>
                  {unlocked ? a.description : 'Henüz kazanılmadı'}
                </Text>
              </View>
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffe066',
    letterSpacing: 4,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a5c',
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 420,
    marginBottom: 14,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryCell: {
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#7777aa',
    letterSpacing: 0.5,
  },
  summarySep: {
    width: 1,
    height: 32,
    backgroundColor: '#2a2a4a',
  },
  tabs: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 420,
    marginBottom: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  tabActive: {
    backgroundColor: '#2a2a4e',
    borderColor: '#ffe066',
  },
  tabText: {
    color: '#6666aa',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffe066',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#555577',
    fontSize: 14,
    marginTop: 30,
    fontStyle: 'italic',
  },
  runCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a5c',
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  runLeft: {
    gap: 4,
  },
  runChar: {
    fontSize: 14,
    color: '#ccccee',
    fontWeight: '600',
  },
  runDate: {
    fontSize: 11,
    color: '#555577',
  },
  runStats: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  runStat: {
    fontSize: 12,
    color: '#7777aa',
  },
  runStatVal: {
    color: '#ccccee',
    fontWeight: 'bold',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3a5c',
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  achievementLocked: {
    opacity: 0.45,
  },
  achievementIcon: {
    fontSize: 26,
  },
  achievementText: {
    flex: 1,
    gap: 3,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffe066',
  },
  achievementNameLocked: {
    color: '#555577',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#8888bb',
  },
});
