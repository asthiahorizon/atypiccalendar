// Native (iOS/Android) implementation of IAP using react-native-iap
import {
  initConnection,
  getSubscriptions,
  getProducts,
  requestSubscription,
  finishTransaction,
  getAvailablePurchases,
} from "react-native-iap";

export interface RawProductInfo {
  price: string | null;
  title: string | null;
  available: boolean;
}

export async function rawLoadProduct(sku: string): Promise<RawProductInfo> {
  try {
    await initConnection();
    const subs = await getSubscriptions({ skus: [sku] });
    if (subs && subs.length > 0) {
      const s: any = subs[0];
      const price =
        s.localizedPrice ||
        s.subscriptionOfferDetails?.[0]?.pricingPhases?.pricingPhaseList?.[0]
          ?.formattedPrice ||
        null;
      const title = s.title || s.name || null;
      return { price, title, available: true };
    }
    const prods = await getProducts({ skus: [sku] });
    if (prods && prods.length > 0) {
      const p: any = prods[0];
      return {
        price: p.localizedPrice || null,
        title: p.title || null,
        available: true,
      };
    }
    return { price: null, title: null, available: false };
  } catch (e) {
    console.warn("[iap] rawLoadProduct failed", e);
    return { price: null, title: null, available: false };
  }
}

export async function rawPurchase(
  sku: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await initConnection();
    const result: any = await requestSubscription({ sku } as any);
    const purchases = Array.isArray(result) ? result : [result];
    for (const p of purchases) {
      if (p) {
        try {
          await finishTransaction({ purchase: p, isConsumable: false });
        } catch {}
      }
    }
    return { ok: true };
  } catch (e: any) {
    const msg = e?.message || String(e);
    if (/cancel/i.test(msg)) return { ok: false, error: "cancelled" };
    return { ok: false, error: msg };
  }
}

export async function rawRestore(
  sku: string
): Promise<{ ok: boolean; found: boolean; error?: string }> {
  try {
    await initConnection();
    const purchases: any[] = await getAvailablePurchases();
    const found = purchases.some(
      (p) => p?.productId === sku || p?.sku === sku
    );
    return { ok: true, found };
  } catch (e: any) {
    return { ok: false, found: false, error: e?.message || String(e) };
  }
}
