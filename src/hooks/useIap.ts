import { useEffect, useState } from 'react';
import { isIapAvailable, getRemoveAdsPrice } from '../services/IapService';

export interface RemoveAdsInfo {
  available: boolean;      // IAP hazır mı (bağlı + ürün yüklendi)
  price: string | null;    // yerelleştirilmiş fiyat metni (ör. "₺29,99")
}

/**
 * "Reklamları Kaldır" IAP durumunu reaktif olarak izler. Fiyat/ürün async
 * yüklendiği için, `active` iken kısa aralıklarla yoklar (ör. Ayarlar açıkken
 * buton hazır olunca görünsün diye). Kapalıyken CPU harcamaz.
 *
 * @param active yalnızca true iken poll eder.
 */
export function useRemoveAdsInfo(active: boolean): RemoveAdsInfo {
  const [info, setInfo] = useState<RemoveAdsInfo>(() => ({
    available: isIapAvailable(),
    price: getRemoveAdsPrice(),
  }));

  useEffect(() => {
    if (!active) return;
    const read = () => setInfo({ available: isIapAvailable(), price: getRemoveAdsPrice() });
    read();
    const id = setInterval(read, 800);
    return () => clearInterval(id);
  }, [active]);

  return info;
}
