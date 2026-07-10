/**
 * IapService — Google Play IAP sarmalayıcı (tek non-consumable ürün).
 *
 * Ürün: "remove_ads" — tek seferlik satın alma, tüm reklamları kapatır.
 *
 * Akış:
 *  - initIap(): bağlantıyı kurar, satın alma dinleyicilerini bağlar,
 *    mevcut sahiplikleri geri yükler. Ürün sahipse `onOwned()` çağrılır.
 *  - purchaseRemoveAds(): satın alma penceresini açar. Sonuç dinleyiciden gelir.
 *  - restorePurchases(): önceki satın almayı geri yükler (yeni cihaz / silme sonrası).
 *
 * NOT: react-native-iap native modüldür — Expo Go'da ÇALIŞMAZ (EAS dev build gerekir).
 *      Gerçek test için Play Console'da `remove_ads` ürünü tanımlanmalı ve lisanslı
 *      test hesabı eklenmelidir. Bu dosya react-native-iap v12 API'sine göredir;
 *      farklı bir sürüm kurarsan çağrıları o sürümün dokümanıyla teyit et.
 */
import type { EmitterSubscription } from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Product,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';

export const PRODUCT_REMOVE_ADS = 'remove_ads';

let connected = false;
let purchaseUpdateSub: EmitterSubscription | null = null;
let purchaseErrorSub: EmitterSubscription | null = null;
let onOwnedCallback: (() => void) | null = null;
let localizedPrice: string | null = null;

/** Bir satın almanın "reklamsız" ürünü olup olmadığını kontrol eder. */
function isRemoveAds(p: Purchase): boolean {
  // v12: productId (bazı sürümlerde ids dizisi)
  return p.productId === PRODUCT_REMOVE_ADS;
}

/** Ürün sahipliğini onaylar: işlemi kapatır ve callback'i tetikler. */
async function grantRemoveAds(purchase: Purchase): Promise<void> {
  try {
    await finishTransaction({ purchase, isConsumable: false });
  } catch (e) {
    if (__DEV__) console.warn('[IapService] finishTransaction failed', e);
  }
  onOwnedCallback?.();
}

/**
 * IAP bağlantısını başlatır, dinleyicileri bağlar ve mevcut satın almaları
 * geri yükler. `onOwned` ürün sahipse (satın alma veya restore) çağrılır.
 */
export async function initIap(onOwned: () => void): Promise<void> {
  onOwnedCallback = onOwned;
  if (connected) return;

  try {
    await initConnection();
    connected = true;
  } catch (e) {
    if (__DEV__) console.warn('[IapService] initConnection failed', e);
    return; // IAP yoksa oyun yine de çalışır
  }

  purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
    if (isRemoveAds(purchase)) {
      await grantRemoveAds(purchase);
    }
  });

  purchaseErrorSub = purchaseErrorListener((error: PurchaseError) => {
    // Kullanıcı iptali dahil — sessizce yut (E_USER_CANCELLED)
    if (__DEV__) console.warn('[IapService] purchase error', error?.code, error?.message);
  });

  // Fiyatı önden çek (buton etiketinde göstermek için) — başarısız olursa sorun değil
  try {
    const products: Product[] = await getProducts({ skus: [PRODUCT_REMOVE_ADS] });
    if (products.length > 0) localizedPrice = products[0].localizedPrice ?? null;
  } catch (e) {
    if (__DEV__) console.warn('[IapService] getProducts failed', e);
  }

  // Önceki satın almaları geri yükle (kalıcı sahiplik)
  await restorePurchases();
}

/** Play mağaza fiyatı (ör. "₺29,99") — yoksa null. */
export function getRemoveAdsPrice(): string | null {
  return localizedPrice;
}

/**
 * "Reklamları Kaldır" satın alma akışını başlatır.
 * Sonuç purchaseUpdatedListener üzerinden gelir (başarılıysa onOwned tetiklenir).
 */
export async function purchaseRemoveAds(): Promise<void> {
  if (!connected) return;
  try {
    // v12 Android: skus dizisi bekler
    await requestPurchase({ skus: [PRODUCT_REMOVE_ADS] });
  } catch (e) {
    if (__DEV__) console.warn('[IapService] requestPurchase failed', e);
  }
}

/**
 * Önceki satın almaları geri yükler (yeni cihaz / uygulama silinip kurulunca).
 * @returns "remove_ads" sahipse true.
 */
export async function restorePurchases(): Promise<boolean> {
  if (!connected) return false;
  try {
    const purchases = await getAvailablePurchases();
    const owned = purchases.find(isRemoveAds);
    if (owned) {
      await grantRemoveAds(owned);
      return true;
    }
  } catch (e) {
    if (__DEV__) console.warn('[IapService] restorePurchases failed', e);
  }
  return false;
}

/** Bağlantıyı kapatır (genelde gerekmez; app kapanınca sistem toplar). */
export async function endIap(): Promise<void> {
  purchaseUpdateSub?.remove();
  purchaseErrorSub?.remove();
  purchaseUpdateSub = null;
  purchaseErrorSub = null;
  if (connected) {
    try { await endConnection(); } catch {}
    connected = false;
  }
}
