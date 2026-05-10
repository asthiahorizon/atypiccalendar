import AsyncStorage from "@react-native-async-storage/async-storage";
import { rawLoadProduct, rawPurchase, rawRestore } from "./iap";

export const PRODUCT_ID = "com.asthiahorizon.atypiccalendar.monthly";
export const FREE_EVENT_LIMIT = 25;

const PREMIUM_KEY = "atypic.premium.active";
const FIRST_OPEN_KEY = "atypic.firstOpenSeen";

export interface SubscriptionStatus {
  premium: boolean;
  productId: string | null;
}

let cached: SubscriptionStatus | null = null;

export async function getStatus(): Promise<SubscriptionStatus> {
  if (cached) return cached;
  const v = await AsyncStorage.getItem(PREMIUM_KEY);
  cached = { premium: v === "1", productId: v === "1" ? PRODUCT_ID : null };
  return cached;
}

export async function setPremium(active: boolean) {
  cached = {
    premium: active,
    productId: active ? PRODUCT_ID : null,
  };
  await AsyncStorage.setItem(PREMIUM_KEY, active ? "1" : "0");
}

export async function isFirstOpenPending(): Promise<boolean> {
  const v = await AsyncStorage.getItem(FIRST_OPEN_KEY);
  return v !== "1";
}

export async function markFirstOpenSeen() {
  await AsyncStorage.setItem(FIRST_OPEN_KEY, "1");
}

export async function loadProduct() {
  return rawLoadProduct(PRODUCT_ID);
}

export async function purchase() {
  const res = await rawPurchase(PRODUCT_ID);
  if (res.ok) await setPremium(true);
  return res;
}

export async function restore() {
  const res = await rawRestore(PRODUCT_ID);
  if (res.ok && res.found) await setPremium(true);
  return res;
}
