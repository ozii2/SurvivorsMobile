# Risk Register — Google Play Launch Milestone

Son güncelleme: 2026-04-17

| # | Risk | Olasılık | Etki | Azaltma |
|---|------|----------|------|---------|
| R1 | EAS Build native modül uyumsuzluğu (Expo SDK 55 + react-native-google-mobile-ads) | Orta | Yüksek | Sprint 1'de erken test; uyumsuzlukta Expo managed workflow alternatifi araştır |
| R2 | AdMob politika ihlali (Play Store reddi) | Düşük | Yüksek | Google politikalarını önceden oku; frekans capping uygula; çocuklara yönelik içerik yok |
| R3 | Performans düşüşü native build'de (EAS debug vs. release farkı) | Orta | Orta | Release profile ile her sprintte APK test; Hermes engine aktif olduğunu doğrula |
| R4 | expo-av Expo Go → EAS geçişinde ses sorunları | Düşük | Düşük | EAS development build ile erken ses testi yap |
| R5 | Armor bug fix oyun dengesini bozabilir | Orta | Orta | Fix sonrası balance-check skill ile tüm hasar matrisini doğrula |
| R6 | Google Play Console hesabı açılamaması (ödeme/bölge sorunu) | Düşük | Kritik | Sprint 1 başında hesap aç; $25 one-time fee öde |
