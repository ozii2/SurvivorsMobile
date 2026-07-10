import { useEffect, useState } from 'react';
import { isRewardedReady, areAdsRemoved } from '../services/AdService';

/**
 * Ödüllü reklamın gösterime hazır olup olmadığını reaktif olarak izler.
 * Reklamlar async yüklendiği için, `active` iken kısa aralıklarla kontrol eder
 * (ör. game over ekranı açıkken buton aktif/pasif olsun diye).
 *
 * @param active yalnızca true iken poll eder (kapalıyken CPU harcamaz).
 */
export function useRewardedReady(active: boolean): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active || areAdsRemoved()) {
      setReady(false);
      return;
    }
    setReady(isRewardedReady());
    const id = setInterval(() => setReady(isRewardedReady()), 500);
    return () => clearInterval(id);
  }, [active]);

  return ready;
}
