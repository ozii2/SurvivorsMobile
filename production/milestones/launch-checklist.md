# Google Play Launch Checklist — Ball Survive

**Uygulama**: Ball Survive (`com.oguzhan.ballsurvive`)
**Gelir modeli**: AdMob (ödüllü + geçiş) + IAP ("reklamsız yap")
**Platform**: Android / Google Play
**Sahip**: Oğuzhan Kandemir · oguzhan1kandemir@gmail.com
**Son güncelleme**: 2026-07-10

> Efsane: ✅ bitti · 🔄 devam · ⬜ başlanmadı · 👤 = senin yapman gereken · 🤖 = Claude yapabilir

---

## ⚠️ Kritik bağımlılık
Reklam + IAP kodu, mağazaya yüklenen üretim build'inin **içinde** olmak zorunda.
Yayınlanmış AAB'ye sonradan reklam eklenemez. Kritik yol:
`Ads+IAP kodu → Üretim build → İnceleme → Yayın → Gelir`

---

## A. Koddan bağımsız işler (şimdi paralel)

- [ ] 👤 **A1. Google Play Developer hesabı** — $25 tek seferlik, kart + kimlik doğrulama (~1-2 gün onay). https://play.google.com/console/signup
- [x] 🤖 **A2. Gizlilik politikası** — ✅ taslak yazıldı → `docs/legal/privacy-policy.md`
- [x] 👤 A2b. ✅ Politika yayında: https://ozii2.github.io/SurvivorsMobile/docs/legal/privacy-policy.html (GitHub Pages)
- [x] 🤖 **A3. Store metinleri** — ✅ TR+EN → `docs/store/play-store-listing.md`
- [x] 🤖 **A4. Data Safety formu** — ✅ taslak → `docs/store/data-safety.md`
- [x] 🤖 **A5. İçerik derecelendirme** — ✅ IARC cevapları → `docs/store/data-safety.md`

## B. Gelir motoru (kod işi — asıl para kazanma)

- [x] 🤖 **B1. AdMob entegrasyonu (KOD)** — ✅ `AdService.ts` (ödüllü revive + geçiş frekans-capped), `useAds.ts`, `reviveRun()` motorda, game over butonu, app.json plugin, package.json dep. TypeScript temiz (tek eksik: paket kurulumu).
- [ ] 👤 B1a. **Paketi kur**: `npx expo install react-native-google-mobile-ads`
- [ ] 🤖/👤 B1b. **EAS dev build'e geçiş** (AdMob native modül, Expo Go'da çalışmaz): `eas build --profile development --platform android`
- [ ] 👤 B1c. AdMob hesabı aç + gerçek App ID & reklam birimi ID'leri → `AdService.ts` + `app.json`'daki test ID'lerini değiştir (yayından önce)
- [x] 🤖 **B2. IAP (KOD)** — ✅ `react-native-iap`, `IapService.ts` (ürün `remove_ads`, satın alma + restore), Settings'te `adsRemoved` kalıcı, `SettingsModal`'da "Reklamları Kaldır" + "Geri Yükle" butonları, boot'ta init + AdService'e bağlı. TypeScript temiz (tek eksik: paket kurulumu).
- [ ] 👤 B2a. **Paketi kur**: `npx expo install react-native-iap`
- [ ] 👤 B2b. Play Console'da `remove_ads` non-consumable ürünü tanımla + fiyat + lisanslı test hesabı ekle (gerçek test için)

## C. Build & yayın

- [ ] 🤖 **C1. Hedef API 35** doğrula (Google zorunlu), versionCode/version kontrol
- [ ] 🤖 **C2. Üretim build** — `eas build --platform android --profile production` (AAB)
- [ ] 👤 C2b. google-play-service-account.json ekle (submit için)
- [ ] 🤖 **C3. Ekran görüntüleri** (çalışan build'den, 2-8 adet) + feature graphic 1024×500
- [ ] **C4. İç test → kapalı test → production** track ilerleme
- [ ] 👤 **C5. Play Console'da yayına al**

## D. Kalite kapısı (milestone success criteria)

- [ ] Crash rate < %1 fiziksel cihazda
- [ ] 60fps doğrulandı (fiziksel cihaz)
- [ ] Save/load çalışıyor ✅ (SaveService.ts mevcut)
- [ ] Ses sistemi entegre — durum doğrulanacak
- [ ] Tutorial — durum doğrulanacak

---

## Notlar / açık sorular
- ⚠️ `app.json`'da `RECORD_AUDIO` izni var ama **kodda mikrofon kullanımı YOK** → kaldırılmalı (Play reddi + gereksiz hassas veri beyanı riski). [ ] 🤖 düzeltilecek
- `expo-image-picker` galeri erişimi (avatar) gerçek, seçilen görsel cihazda kalıyor → Data Safety'de "Photos" olarak beyan edilecek
- Oyun şu an tamamen offline; veri çıkışı yalnızca AdMob eklenince başlayacak
- Milestone hedef tarihi: 2026-08-17
