# Data Safety & İçerik Derecelendirme — Ball Survive

Play Console'da doldurulacak iki formun cevap taslağı. Reklam SDK'sının (AdMob)
gerçekte topladığı veriyi Google'ın resmî rehberiyle son kez teyit et:
https://support.google.com/admob/answer/9760862 (AdMob Data Safety rehberi)

---

## 1) Data Safety formu

### Önemli ilke
Google'ın tanımında "toplanan veri" = **cihazdan dışarı gönderilen** veri.
Ball Survive'ın kendi verisi (oyun ilerlemesi, ayarlar, avatar görseli)
**yalnızca cihazda** tutulur → **"toplanan" sayılmaz, beyan edilmez.**
Cihazdan çıkan tek şey **AdMob reklam SDK'sının** topladığı veridir.

### Sorular ve önerilen cevaplar

**Uygulamanız kullanıcı verisi topluyor mu / paylaşıyor mu?**
→ **Evet** (AdMob reklamları nedeniyle)

**Toplanan veri türleri (AdMob kaynaklı):**

| Veri türü | Toplanıyor | Paylaşılıyor | Amaç | Kimliğe bağlı mı |
|-----------|-----------|--------------|------|------------------|
| Cihaz veya diğer kimlikler (advertising ID) | Evet | Evet | Reklam/pazarlama, Analitik, Dolandırıcılık önleme | Hayır |
| Yaklaşık konum (IP'den) | Evet* | Evet* | Reklam/pazarlama | Hayır |
| Uygulama etkinliği (reklam etkileşimi) | Evet* | Evet* | Reklam/pazarlama, Analitik | Hayır |

*AdMob yapılandırmasına göre değişebilir — resmî rehberden teyit et. Muhafazakâr
olmak için yukarıdaki üçünü de işaretlemek güvenlidir.

**Güvenlik uygulamaları:**
- Veri aktarımda şifreleniyor mu? → **Evet** (AdMob HTTPS kullanır)
- Kullanıcı veri silme talep edebilir mi? → **Evet** — advertising ID cihaz
  ayarlarından sıfırlanabilir; iletişim: oguzhan1kandemir@gmail.com

**BEYAN EDİLMEYECEKLER (cihazda kalır, dışarı gitmez):**
- Oyun ilerlemesi / skorlar / yükseltmeler (AsyncStorage, local)
- Ayarlar (ses/müzik)
- Avatar görseli (galeriden seçilir, cihazda kalır)

**İzinler:**
- Foto/galeri: yalnızca avatar seçiminde, görsel cihazdan çıkmaz
- İnternet: yalnızca reklam yüklemek için

---

## 2) İçerik derecelendirmesi (IARC anketi)

**Kategori:** Oyun

| Soru | Cevap |
|------|-------|
| Şiddet | **Evet — hafif/fantastik.** Stilize toplar/düşmanlar; gerçekçi kan/gore yok. (Not: "Kan Kılıcı/Kan Taşı" gibi tematik isimler var ama görsel gerçekçi kan içermez.) |
| Cinsellik / çıplaklık | Hayır |
| Küfür / kaba dil | Hayır |
| Kontrollü maddeler (uyuşturucu/alkol) | Hayır |
| Kumar (gerçek veya simüle) | Hayır |
| Korku / korkutucu içerik | Hafif (aksiyon temelli, dehşet yok) |
| Kullanıcı etkileşimi (chat vb.) | Hayır (çevrimiçi sosyal özellik yok) |
| Konum paylaşımı | Hayır |
| **Reklam içeriyor mu** | **Evet** (AdMob) |
| **Dijital satın alma** | **Evet** ("Reklamsız yap" IAP — eklenince) |

**Beklenen sonuç:** Everyone / PEGI 3–7 / ESRB E civarı (hafif fantastik şiddet).

---

## 3) Reklam & hedef kitle beyanları (Play Console → App content)

- **Ads declaration:** "Yes, my app contains ads" → **Evet**
- **Target audience:** 13+ (çocuklara yönelik DEĞİL). Bu, AdMob'da
  `tagForChildDirectedTreatment: false` ile tutarlı (bkz `AdService.ts`).
- **Government app / News / COVID:** Hayır
- **Data safety:** yukarıdaki bölüm
- **Financial features:** Hayır
