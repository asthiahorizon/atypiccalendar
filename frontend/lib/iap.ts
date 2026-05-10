// Web stub: react-native-iap is native-only, return safe fallbacks on web
export interface RawProductInfo {
  price: string | null;
  title: string | null;
  available: boolean;
}

export async function rawLoadProduct(_sku: string): Promise<RawProductInfo> {
  return { price: null, title: null, available: false };
}

export async function rawPurchase(
  _sku: string
): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: "IAP unavailable on web" };
}

export async function rawRestore(
  _sku: string
): Promise<{ ok: boolean; found: boolean; error?: string }> {
  return { ok: false, found: false, error: "IAP unavailable on web" };
}
