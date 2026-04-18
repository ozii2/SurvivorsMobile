import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSettingsStore } from '../game/state/useSettingsStore';
import { Settings } from '../services/SaveService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const QUALITY_OPTIONS: Settings['graphicsQuality'][] = ['low', 'medium', 'high'];
const QUALITY_LABELS: Record<Settings['graphicsQuality'], string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
};

export function SettingsModal({ visible, onClose }: Props) {
  const soundEnabled = useSettingsStore(s => s.soundEnabled);
  const musicEnabled = useSettingsStore(s => s.musicEnabled);
  const graphicsQuality = useSettingsStore(s => s.graphicsQuality);
  const setSoundEnabled = useSettingsStore(s => s.setSoundEnabled);
  const setMusicEnabled = useSettingsStore(s => s.setMusicEnabled);
  const setGraphicsQuality = useSettingsStore(s => s.setGraphicsQuality);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.panel}>
          <Text style={styles.title}>AYARLAR</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Ses Efektleri</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#333355', true: '#5a5aff' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Müzik</Text>
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              trackColor={{ false: '#333355', true: '#5a5aff' }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.qualitySection}>
            <Text style={styles.label}>Grafik Kalitesi</Text>
            <View style={styles.qualityRow}>
              {QUALITY_OPTIONS.map(q => (
                <TouchableOpacity
                  key={q}
                  style={[styles.qualityBtn, graphicsQuality === q && styles.qualityBtnActive]}
                  onPress={() => setGraphicsQuality(q)}
                >
                  <Text style={[styles.qualityBtnText, graphicsQuality === q && styles.qualityBtnTextActive]}>
                    {QUALITY_LABELS[q]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3a6c',
    padding: 28,
    width: 320,
    gap: 20,
  },
  title: {
    color: '#ffe066',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#ccccee',
    fontSize: 15,
    fontWeight: '500',
  },
  qualitySection: {
    gap: 10,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  qualityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a6c',
    backgroundColor: '#252540',
    alignItems: 'center',
  },
  qualityBtnActive: {
    borderColor: '#ffe066',
    backgroundColor: 'rgba(255,224,102,0.12)',
  },
  qualityBtnText: {
    color: '#8888bb',
    fontSize: 13,
    fontWeight: '600',
  },
  qualityBtnTextActive: {
    color: '#ffe066',
  },
  closeBtn: {
    backgroundColor: '#3a3a6c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
