import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t, lang } from "./i18n";

const ENABLED_KEY = "atypic.notifications.enabled";
const MORNING_ID_KEY = "atypic.notifications.morningId";

export const notificationsEnabledKey = ENABLED_KEY;

// Set behavior so notifications show even in foreground (best-effort)
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.warn("setNotificationHandler unavailable", e);
}

const morningTitleByLang: Record<string, string> = {
  en: "Good morning",
  fr: "Bonjour",
  it: "Buongiorno",
  de: "Guten Morgen",
};
const morningBodyByLang: Record<string, string> = {
  en: "Your three reserves are full. Take care of yourself today.",
  fr: "Vos trois réserves sont pleines. Prenez soin de vous aujourd'hui.",
  it: "Le tue tre riserve sono piene. Prenditi cura di te oggi.",
  de: "Deine drei Reserven sind voll. Pass heute gut auf dich auf.",
};
const reminderTitleByLang: Record<string, string> = {
  en: "In {m} min",
  fr: "Dans {m} min",
  it: "Tra {m} minuti",
  de: "In {m} Min",
};

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === "web") return true;
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const { status: ask } = await Notifications.requestPermissionsAsync();
  return ask === "granted";
}

export async function isEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ENABLED_KEY);
  return v === "1";
}

export async function setEnabled(enabled: boolean) {
  await AsyncStorage.setItem(ENABLED_KEY, enabled ? "1" : "0");
  if (enabled) {
    await scheduleMorning();
  } else {
    await cancelAll();
  }
}

async function scheduleMorning() {
  if (Platform.OS === "web") return;
  // Cancel previous
  const prev = await AsyncStorage.getItem(MORNING_ID_KEY);
  if (prev) {
    try {
      await Notifications.cancelScheduledNotificationAsync(prev);
    } catch {}
  }
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: morningTitleByLang[lang] || morningTitleByLang.en,
      body: morningBodyByLang[lang] || morningBodyByLang.en,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    } as any,
  });
  await AsyncStorage.setItem(MORNING_ID_KEY, id);
}

export async function cancelAll() {
  if (Platform.OS === "web") return;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(MORNING_ID_KEY);
}

/**
 * Schedule a reminder for an event at `minutesBefore` minutes before the start time.
 * Returns notification id (or null if skipped).
 */
export async function scheduleEventReminder(opts: {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  minutesBefore: number;
}): Promise<string | null> {
  if (Platform.OS === "web") return null;
  if (!opts.minutesBefore || opts.minutesBefore <= 0) return null;
  const granted = await ensurePermission();
  if (!granted) return null;
  const [y, m, d] = opts.date.split("-").map(Number);
  const [hh, mm] = opts.time.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm);
  const fireAt = new Date(dt.getTime() - opts.minutesBefore * 60 * 1000);
  if (fireAt.getTime() <= Date.now() + 30 * 1000) {
    return null; // in the past or too close
  }
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title:
          (reminderTitleByLang[lang] || reminderTitleByLang.en).replace(
            "{m}",
            String(opts.minutesBefore)
          ),
        body: opts.title,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      } as any,
    });
    return id;
  } catch (e) {
    console.warn("scheduleEventReminder failed", e);
    return null;
  }
}

export async function cancelEventReminder(id: string | null | undefined) {
  if (!id || Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
}
