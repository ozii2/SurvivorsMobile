/**
 * IapService — Google Play / App Store satın alma sarmalayıcı (expo-iap).
 *
 * Tek ürün: `remove_ads` (non-consumable) — "Reklamları Kaldır".
 *
 * Tasarım:
 *  - Boot'ta `initIap(onOwned)` çağrılır: bağlantı kurar, ürünü/fiyatı çeker,
 *    satın alma listener'larını bağlar.
 *  - Satın alma sonucu event tabanlıdır: `purchaseUpdatedListener` üzerinden gelir,
 *    `finishTransaction` ile onaylanır, sonra `onOwned` callback'i tetiklenir
 *    (App.tsx bunu reklamları kapatıp `adsRemoved`'ı kalıcı kaydetmeye bağlar).
 *  - IAP hatası ASLA boot'u/oyunu çökertmez — her şey try/catch içinde (AdService deseni).
 *
 * NOT: expo-iap native modüldür — Expo Go'da ÇALIŞMAZ. Ayrıca satın almalar yalnızca
 *      Play'e (en az internal testing track'ine) yüklenmiş, lisanslı test hesabıyla
 *      Play üzerinden kurulmuş build'de gerçekleşir; yan-yüklenen düz APK'da
 *      `fetchProducts` boş döner (fiyat gelmez → arayüz gizli kalır).
 */
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Purchase,
} from 'expo-iap';

export const PRODUCT_REMOVE_ADS = 'remove_ads';

// ─── Modül durumu ─────────────────────────────────────────────────────────────
let connected = false;
let priceText: string | null = null;     // fetchProducts'tan gelen yerelleştirilmiş fiyat
let adsOwned = false;
let onOwnedCb: (() => void) | null = null;

let purchaseUpdateSub: { remove: () => void } | null = null;
let purchaseErrorSub: { remove: () => void } | null = null;

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
/** Bir satın alma kaydının hangi ürüne ait olduğunu güvenli şekilde çıkarır. */
function productIdOf(p: Purchase): string | null {
  return p.productId ?? p.ids?.[0] ?? null;
}

/** Sahipliği ver: yerel bayrağı işaretle + boot'ta verilen callback'i tetikle. */
function grantOwnership(): void {
  if (adsOwned) return;
  adsOwned = true;
  onOwnedCb?.();
}

/** purchaseUpdatedListener'dan gelen satın almayı işle: onayla + sahiplik ver. */
async function handlePurchase(purchase: Purchase): Promise<void> {
  if (productIdOf(purchase) !== PRODUCT_REMOVE_ADS) return;
  try {
    // Non-consumable: isConsumable=false (token tüketilmez, tekrar satın alınamaz).
    await finishTransaction({ purchase, isConsumable: false });
  } catch (e) {
    if (__DEV__) console.warn('[IapService] finishTransaction failed', e);
    // Onaylanamasa bile kullanıcıya sahipliği ver — Play kaydı zaten var,
    // bir sonraki başlatmada restore/replay ile onaylanır.
  }
  grantOwnership();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** IAP altyapısı hazır mı? (bağlı + ürün/fiyat yüklenmiş) */
export function isIapAvailable(): boolean {
  return connected && priceText != null;
}

export async function initIap(onOwned: () => void): Promise<void> {
  onOwnedCb = onOwned;
  try {
    // Listener'ları bağlantıdan ÖNCE kur ki uygulama açılışındaki bekleyen
    // (replay) satın almaları kaçırmayalım.
    purchaseUpdateSub = purchaseUpdatedListener((p: Purchase) => {
      void handlePurchase(p);
    });
    purchaseErrorSub = purchaseErrorListener(err => {
      if (__DEV__) console.warn('[IapService] purchase error', err?.code, err?.message);
    });

    connected = await initConnection();

    const products = await fetchProducts({ skus: [PRODUCT_REMOVE_ADS], type: 'in-app' });
    const product = Array.isArray(products)
      ? products.find(p => p.id === PRODUCT_REMOVE_ADS)
      : undefined;
    if (product && 'displayPrice' in product) {
      priceText = product.displayPrice ?? null;
    }
  } catch (e) {
    if (__DEV__) console.warn('[IapService] init failed', e);
  }
}

export function getRemoveAdsPrice(): string | null {
  return priceText;
}

export async function purchaseRemoveAds(): Promise<void> {
  try {
    // Sonuç purchaseUpdatedListener üzerinden akar (event tabanlı).
    await requestPurchase({
      request: {
        apple: { sku: PRODUCT_REMOVE_ADS },
        google: { skus: [PRODUCT_REMOVE_ADS] },
      },
      type: 'in-app',
    });
  } catch (e) {
    if (__DEV__) console.warn('[IapService] purchase failed', e);
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    const owned = Array.isArray(purchases)
      && purchases.some(p => productIdOf(p) === PRODUCT_REMOVE_ADS);
    if (owned) {
      grantOwnership();
      return true;
    }
    return false;
  } catch (e) {
    if (__DEV__) console.warn('[IapService] restore failed', e);
    return false;
  }
}

export async function endIap(): Promise<void> {
  try {
    purchaseUpdateSub?.remove();
    purchaseErrorSub?.remove();
    purchaseUpdateSub = null;
    purchaseErrorSub = null;
    await endConnection();
    connected = false;
  } catch (e) {
    if (__DEV__) console.warn('[IapService] end failed', e);
  }
}
