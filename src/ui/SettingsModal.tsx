import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../game/state/useSettingsStore';
import { Settings } from '../services/SaveService';
import { purchaseRemoveAds, restorePurchases, getRemoveAdsPrice, isIapAvailable } from '../services/IapService';

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
  const adsRemoved = useSettingsStore(s => s.adsRemoved);
  const [busy, setBusy] = useState(false);

  const price = getRemoveAdsPrice();

  const handleRemoveAds = async () => {
    if (busy) return;
    setBusy(true);
    await purchaseRemoveAds(); // sonuç store'a listener üzerinden yansır
    setBusy(false);
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy(true);
    const found = await restorePurchases();
    setBusy(false);
    Alert.alert(
      found ? 'Geri Yüklendi' : 'Satın Alma Bulunamadı',
      found
        ? 'Reklamsız sürüm geri yüklendi. Teşekkürler!'
        : 'Bu hesaba bağlı bir satın alma bulunamadı.',
    );
  };

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

          {/* ── Reklamları Kaldır (IAP) — expo-iap eklenince görünür ── */}
          {isIapAvailable() && (
          <View style={styles.iapSection}>
            {adsRemoved ? (
              <View style={styles.iapOwned}>
                <Text style={styles.iapOwnedText}>✓ Reklamlar Kaldırıldı</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.iapBtn, busy && styles.iapBtnDisabled]}
                  onPress={handleRemoveAds}
                  disabled={busy}
                >
                  <Text style={styles.iapBtnText}>
                    {busy ? 'İşleniyor…' : `📺🚫 Reklamları Kaldır${price ? `  ${price}` : ''}`}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRestore} disabled={busy}>
                  <Text style={styles.restoreText}>Satın Alımları Geri Yükle</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          )}

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
  iapSection: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4c',
    paddingTop: 16,
  },
  iapBtn: {
    backgroundColor: '#2a7d46',
    borderWidth: 1,
    borderColor: '#3fd67a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  iapBtnDisabled: {
    opacity: 0.5,
  },
  iapBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  restoreText: {
    color: '#8888bb',
    fontSize: 13,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  iapOwned: {
    backgroundColor: 'rgba(63,214,122,0.12)',
    borderWidth: 1,
    borderColor: '#2a7d46',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  iapOwnedText: {
    color: '#3fd67a',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
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
