# Sprint 1 — 2026-04-17 to 2026-05-15

## Sprint Goal

EAS Build pipeline kurulsun, oyun ilerlemesi kalıcı olarak kaydedilsin,
bilinen kritik bug'lar kapatılsın ve ayarlar menüsü eklensin.

## Capacity

- Toplam gün: 28 (4 hafta)
- Buffer (20%): ~6 gün (beklenmedik sorunlar için)
- Kullanılabilir: ~22 gün

## Tasks

### Must Have (Critical Path)

| ID  | Görev | Ajan/Sahip | Tahmini Gün | Bağımlılıklar | Kabul Kriteri |
|-----|-------|-----------|-------------|---------------|---------------|
| S1-01 | EAS Build kurulumu (`eas.json`, `app.json` güncelleme, EAS CLI) | devops-engineer | 2 | — | `eas build --platform android --profile development` başarılı APK üretiyor |
| S1-02 | Armor scaling bug fix — additive → multiplicative formül | gameplay-programmer | 1 | — | Boss'a karşı armor=12 iken hasar = max(1, 30×(1−12/100)) = ~26; eski additive ~18 değil |
| S1-03 | Enemy separation force normalization | gameplay-programmer | 1 | — | 100 düşmanla test: separation force overflow yok, pozisyon glitch yok |
| S1-04 | Save/Load sistemi — `AsyncStorage` ile `SaveSystem.ts` | gameplay-programmer | 3 | S1-01 (native build) | Uygulama kapatılıp açıldıktan sonra: en yüksek dalga, toplam oyun sayısı korunuyor |
| S1-05 | Ayarlar menüsü (ses açık/kapalı, grafik kalitesi) UI + hook | ui-programmer | 2 | S1-04 | Ayarlar kalıcı; ses toggle çalışıyor (Sprint 2'de ses entegre edilince aktif olacak) |

### Should Have

| ID  | Görev | Ajan/Sahip | Tahmini Gün | Bağımlılıklar | Kabul Kriteri |
|-----|-------|-----------|-------------|---------------|---------------|
| S1-06 | Game over ekranı iyileştirme — "Yeniden Oyna" + süre/dalga göster | ui-programmer | 1 | — | Game over'da süre (mm:ss) ve ulaşılan dalga görünüyor |
| S1-07 | TypeScript strict mode ihlallerini tara ve düzelt | lead-programmer | 1 | — | `npx tsc --noEmit` sıfır hata |
| S1-08 | Google Play Console hesabı aç ($25 ücret) | Kullanıcı (manuel) | — | — | Console erişimi var |

### Nice to Have

| ID  | Görev | Ajan/Sahip | Tahmini Gün | Bağımlılıklar | Kabul Kriteri |
|-----|-------|-----------|-------------|---------------|---------------|
| S1-09 | Post-game stats iskelet ekranı (içerik boş, yapı hazır) | ui-programmer | 1 | S1-06 | Ekran açılıyor, "Hasar", "Öldürülen", "Süre" placeholder alanları görünüyor |
| S1-10 | `production/session-state/active.md` oluştur | producer | 0.5 | — | Sprint 1 durumunu takip eden canlı dosya var |

## Carryover from Previous Sprint

Önceki sprint yok (bu Milestone 1'in ilk sprintidir).

## Risks

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| EAS Build native bağımlılık uyumsuzluğu (R1) | Orta | Yüksek | İlk günde EAS test build yap; sorun çıkarsa Expo docs'a bak |
| Armor fix oyun dengesini bozabilir (R5) | Orta | Orta | Fix sonrası 5 test oyun oyna, boss wave'de gözlemle |
| Google Play Console bölge/ödeme sorunu (R6) | Düşük | Kritik | Sprint başında aç, geciktirme |

## External Dependencies

- `@react-native-async-storage/async-storage` npm paketi (yeni bağımlılık)
- EAS CLI global kurulumu: `npm install -g eas-cli`
- Google Play Console geliştirici hesabı ($25 tek seferlik)
- `google-services.json` (Firebase projesi — Sprint 3 için şimdilik placeholder)

## Definition of Done

- [ ] S1-01: EAS development APK fiziksel cihazda kurulup çalışıyor
- [ ] S1-02: Armor multiplicative formula `CollisionSystem.ts`'de aktif, test oynanmış
- [ ] S1-03: EnemySystem separation force normalize edilmiş, 100 düşmanla test edilmiş
- [ ] S1-04: `SaveSystem.ts` yazıldı, uygulama restart sonrası veri korunuyor
- [ ] S1-05: Ayarlar menüsü açılıyor, tercihler `AsyncStorage`'a kaydediliyor
- [ ] S1-06: Game over ekranı süre + dalga gösteriyor
- [ ] S1-07: TypeScript sıfır hata
- [ ] Tüm Must Have görevler tamamlandı
- [ ] Yeni S1/S2 bug yok (kritik crash veya oynanamaz hata)
- [ ] Code gözden geçirildi

## Sprint Velocity Notu

Bu projedeki geliştirme solo (tek kişi) olduğundan "gün" = tam zamanlı çalışma saatleri
değil; yarı zamanlı varsayılarak 2-3 saat/gün üzerinden planlandı.
