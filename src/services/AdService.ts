/**
 * AdService — Google AdMob sarmalayıcı (rewarded + interstitial).
 *
 * Tasarım:
 *  - Reklamlar önceden yüklenir (preload) ve gösterimden sonra tekrar yüklenir.
 *  - Interstitial frekans limitlidir (spam olmasın, Play politikası).
 *  - `setAdsRemoved(true)` çağrılırsa TÜM reklamlar sessizce devre dışı kalır
 *    (IAP "reklamsız yap" satın alması buraya bağlanacak).
 *
 * NOT: `react-native-google-mobile-ads` native modüldür — Expo Go'da ÇALIŞMAZ.
 *      Test için EAS dev build gerekir (`eas build --profile development`).
 */
import mobileAds, {
  MaxAdContentRating,
  TestIds,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

// ─── Reklam birimi ID'leri ────────────────────────────────────────────────────
// USE_TEST_ADS true iken, build türü (debug/release, __DEV__) fark etmeksizin
// Google'ın resmî TEST reklamları gösterilir — gerçek gelir üretmez, hesabın
// banlanmaz. Böylece standalone (preview/release) APK'da da test reklamları
// görünür ve Metro'ya gerek kalmaz.
//
// YAYINA ÇIKMADAN ÖNCE (production build):
//   1) AdMob konsolundan gerçek reklam birimi ID'lerini al,
//   2) PROD_*_UNIT_ID değerlerine yaz,
//   3) USE_TEST_ADS = false yap.
// TODO(launch): production ID'lerini gir + USE_TEST_ADS = false.
const USE_TEST_ADS = true;
const PROD_INTERSTITIAL_UNIT_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
const PROD_REWARDED_UNIT_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';

const INTERSTITIAL_UNIT_ID = USE_TEST_ADS ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL_UNIT_ID;
const REWARDED_UNIT_ID = USE_TEST_ADS ? TestIds.REWARDED : PROD_REWARDED_UNIT_ID;

// ─── Frekans limiti (interstitial) ────────────────────────────────────────────
const MIN_INTERSTITIAL_INTERVAL_MS = 90_000; // en az 90 sn arayla göster
const RUNS_PER_INTERSTITIAL = 2; // her 2 run'ın sonunda bir

// ─── Modül durumu ─────────────────────────────────────────────────────────────
let adsRemoved = false;
let initialized = false;

let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
let lastInterstitialAt = 0;
let runsSinceInterstitial = 0;

let rewarded: RewardedAd | null = null;
let rewardedLoaded = false;

// ─── Init ─────────────────────────────────────────────────────────────────────
export async function initAds(): Promise<void> {
  if (initialized || adsRemoved) return;
  initialized = true;
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.T, // Teen — oyun içeriğine uygun
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
    preloadInterstitial();
    preloadRewarded();
  } catch (e) {
    // Reklam init hatası oyunu ASLA çökertmemeli — sessizce yut.
    if (__DEV__) console.warn('[AdService] init failed', e);
  }
}

/** IAP "reklamsız yap" satın alması buraya bağlanır. */
export function setAdsRemoved(value: boolean): void {
  adsRemoved = value;
}

export function areAdsRemoved(): boolean {
  return adsRemoved;
}

// ─── Interstitial ─────────────────────────────────────────────────────────────
function preloadInterstitial(): void {
  if (adsRemoved) return;
  interstitialLoaded = false;
  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });
  const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded = true;
  });
  const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    unsubLoaded();
    unsubClosed();
    unsubError();
    preloadInterstitial(); // sonraki için yeniden yükle
  });
  const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
    interstitialLoaded = false;
  });
  interstitial.load();
}

/**
 * Run sonunda çağır. Frekans limitine takılmazsa geçiş reklamı gösterir.
 * @returns reklam gösterildiyse true.
 */
export function maybeShowInterstitial(): boolean {
  if (adsRemoved) return false;
  runsSinceInterstitial++;

  const now = Date.now();
  const enoughRuns = runsSinceInterstitial >= RUNS_PER_INTERSTITIAL;
  const enoughTime = now - lastInterstitialAt >= MIN_INTERSTITIAL_INTERVAL_MS;

  if (!interstitialLoaded || !interstitial || !enoughRuns || !enoughTime) {
    return false;
  }

  try {
    interstitial.show();
    lastInterstitialAt = now;
    runsSinceInterstitial = 0;
    interstitialLoaded = false;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[AdService] interstitial show failed', e);
    return false;
  }
}

// ─── Rewarded (ödüllü — revive için) ──────────────────────────────────────────
function preloadRewarded(): void {
  if (adsRemoved) return;
  rewardedLoaded = false;
  rewarded = RewardedAd.createForAdRequest(REWARDED_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });
  const unsubLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewardedLoaded = true;
  });
  const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    unsubLoaded();
    unsubEarned();
    unsubClosed();
    unsubError();
    preloadRewarded(); // sonraki için yeniden yükle
  });
  const unsubEarned = rewarded.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    () => {
      /* ödül show() içindeki callback ile veriliyor */
    },
  );
  const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
    rewardedLoaded = false;
  });
  rewarded.load();
}

export function isRewardedReady(): boolean {
  return !adsRemoved && rewardedLoaded && rewarded != null;
}

/**
 * Ödüllü reklamı gösterir. Kullanıcı reklamı sonuna kadar izlerse `onReward`
 * çağrılır. İzlemez/kapatırsa `onReward` ÇAĞRILMAZ.
 * @returns reklam gösterime açıldıysa true (yüklü değilse false).
 */
export function showRewarded(onReward: () => void): boolean {
  if (!isRewardedReady() || !rewarded) return false;

  let rewardEarned = false;
  const unsubEarned = rewarded.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    () => {
      rewardEarned = true;
    },
  );
  const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    unsubEarned();
    unsubClosed();
    if (rewardEarned) onReward();
  });

  try {
    rewarded.show();
    rewardedLoaded = false;
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[AdService] rewarded show failed', e);
    unsubEarned();
    unsubClosed();
    return false;
  }
}
