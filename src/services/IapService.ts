/**
 * IapService — GEÇİCİ STUB.
 *
 * `react-native-iap` 12.x, React Native 0.81 ile derlenmiyor (kaldırılan
 * `currentActivity` API'sini kullanıyor → Gradle hatası). Ads build'ini
 * bloklamamak için IAP katmanı geçici olarak devre dışı bırakıldı.
 *
 * IAP, Play Console hazır olunca `expo-iap` (RN 0.81 / Yeni Mimari uyumlu,
 * aynı yazarın Expo için önerdiği kütüphane) ile geri eklenecek. O zamana
 * kadar `isIapAvailable()` false döner ve "Reklamları Kaldır" arayüzü gizlenir.
 *
 * Diğer modüllerin (App.tsx boot, SettingsModal, useSettingsStore) kod akışını
 * bozmamak için aynı public API korunmuştur — hepsi güvenli no-op'tur.
 */
export const PRODUCT_REMOVE_ADS = 'remove_ads';

/** IAP altyapısı şu an aktif mi? (expo-iap eklenince true olacak) */
export function isIapAvailable(): boolean {
  return false;
}

export async function initIap(_onOwned: () => void): Promise<void> {
  // no-op — IAP geçici olarak devre dışı
}

export function getRemoveAdsPrice(): string | null {
  return null;
}

export async function purchaseRemoveAds(): Promise<void> {
  // no-op
}

export async function restorePurchases(): Promise<boolean> {
  return false;
}

export async function endIap(): Promise<void> {
  // no-op
}
