import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  Brain,
  Users,
  Zap,
  Calendar as CalendarIcon,
  Check,
  Plus,
  Minus,
  Trash2,
} from "lucide-react-native";
import { theme } from "../../lib/theme";
import { apiClient, EventType, AtypicEvent } from "../../lib/api";
import { fromISODate, formatDateLong } from "../../lib/dates";
import { t, lang } from "../../lib/i18n";
import {
  scheduleEventReminder,
  cancelEventReminder,
} from "../../lib/notifications";
import {
  getStatus,
  FREE_EVENT_LIMIT,
} from "../../lib/subscription";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STEP = 5;
const MAX = 75;

const reminderKey = (id: string) => `atypic.reminder.${id}`;

export default function EventFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string; id?: string }>();
  const isEdit = !!params.id;
  const editId = params.id as string | undefined;
  const initialDate = params.date || new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState<EventType>("task");
  const [cogMag, setCogMag] = useState(15);
  const [socMag, setSocMag] = useState(0);
  const [senMag, setSenMag] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Load event when editing
  useEffect(() => {
    if (!isEdit || !editId) return;
    (async () => {
      try {
        const all = await apiClient.eventsByDate(initialDate);
        const ev = all.find((e: AtypicEvent) => e.id === editId);
        if (ev) {
          setDate(ev.date);
          setTitle(ev.title);
          setTime(ev.start_time);
          setDuration(ev.duration_minutes);
          setType(ev.type);
          setCogMag(Math.abs(ev.cognitive_impact));
          setSocMag(Math.abs(ev.social_impact));
          setSenMag(Math.abs(ev.sensory_impact));
        }
      } catch (e) {
        console.warn("load event failed", e);
      }
      setLoading(false);
    })();
  }, [isEdit, editId, initialDate]);

  const sign = type === "task" ? -1 : 1;

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t.err_title_missing_t, t.err_title_missing_m);
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert(t.err_time_invalid_t, t.err_time_invalid_m);
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      date,
      start_time: time,
      duration_minutes: duration,
      type,
      cognitive_impact: cogMag * sign,
      social_impact: socMag * sign,
      sensory_impact: senMag * sign,
    };

    try {
      if (isEdit && editId) {
        await apiClient.updateEvent(editId, payload);
        // Reschedule reminder (notifications are best-effort)
        try {
          const oldRid = await AsyncStorage.getItem(reminderKey(editId));
          if (oldRid) await cancelEventReminder(oldRid);
          const newRid = await scheduleEventReminder({
            title: payload.title,
            date: payload.date,
            time: payload.start_time,
          });
          if (newRid) await AsyncStorage.setItem(reminderKey(editId), newRid);
          else await AsyncStorage.removeItem(reminderKey(editId));
        } catch (notifErr) {
          console.warn("notif reschedule failed", notifErr);
        }
      } else {
        // Free-tier limit check
        const sub = await getStatus();
        if (!sub.premium) {
          try {
            const cnt = await apiClient.eventsCount();
            if (cnt.count >= FREE_EVENT_LIMIT) {
              setSaving(false);
              router.replace("/paywall");
              return;
            }
          } catch (cntErr) {
            console.warn("count failed", cntErr);
          }
        }
        const check = await apiClient.checkEvent(payload as any);
        if (check.blocked) {
          setSaving(false);
          Alert.alert(t.err_capacity_t, t.err_capacity_m, [
            { text: t.understood },
          ]);
          return;
        }
        const created = await apiClient.createEvent(payload as any);
        // Notifications best-effort
        try {
          const rid = await scheduleEventReminder({
            title: created.title,
            date: created.date,
            time: created.start_time,
          });
          if (rid) await AsyncStorage.setItem(reminderKey(created.id), rid);
        } catch (notifErr) {
          console.warn("notif schedule failed", notifErr);
        }
      }
      router.back();
    } catch (e: any) {
      setSaving(false);
      console.error("save event failed", e);
      Alert.alert(t.err_cant_add, e?.message || t.err_unexpected);
    }
  };

  const onDelete = () => {
    if (!editId) return;
    const performDelete = async () => {
      const rid = await AsyncStorage.getItem(reminderKey(editId));
      if (rid) await cancelEventReminder(rid);
      await AsyncStorage.removeItem(reminderKey(editId));
      await apiClient.deleteEvent(editId);
      router.back();
    };
    if (Platform.OS === "web") {
      // eslint-disable-next-line no-alert
      const ok = typeof window !== "undefined"
        ? window.confirm(`${t.delete_event_title}\n\n${t.delete_event_body}`)
        : true;
      if (ok) performDelete();
      return;
    }
    Alert.alert(t.delete_event_title, t.delete_event_body, [
      { text: t.cancel, style: "cancel" },
      { text: t.delete, style: "destructive", onPress: performDelete },
    ]);
  };

  const dateObj = useMemo(() => fromISODate(date), [date]);
  const dateText = useMemo(() => formatDateLong(dateObj, lang), [dateObj]);

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconBtn}
            testID="close-modal-btn"
          >
            <X size={20} color={theme.colors.text} strokeWidth={1.7} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? t.edit_event : t.new_event}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator color={theme.colors.text} />
          </View>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.dateBlock}>
              <CalendarIcon
                size={14}
                color={theme.colors.textSecondary}
                strokeWidth={1.7}
              />
              <Text style={styles.dateText}>{dateText}</Text>
            </View>

            <View>
              <Text style={styles.label}>{t.field_title}</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={t.field_title_placeholder}
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.input}
                testID="event-title-input"
              />
            </View>

            <View>
              <Text style={styles.label}>{t.field_type}</Text>
              <View style={styles.typeRow}>
                <TypePill
                  active={type === "task"}
                  label={t.type_task}
                  desc={t.type_task_desc}
                  color={theme.colors.cognitive}
                  onPress={() => setType("task")}
                  testID="type-task"
                />
                <TypePill
                  active={type === "resource"}
                  label={t.type_resource}
                  desc={t.type_resource_desc}
                  color={theme.colors.success}
                  onPress={() => setType("resource")}
                  testID="type-resource"
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t.field_time}</Text>
                <TextInput
                  value={time}
                  onChangeText={setTime}
                  placeholder="09:00"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="numbers-and-punctuation"
                  style={styles.input}
                  testID="event-time-input"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{t.field_duration}</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setDuration(Math.max(15, duration - 15))}
                    testID="duration-minus"
                  >
                    <Minus size={16} color={theme.colors.text} strokeWidth={2} />
                  </TouchableOpacity>
                  <Text style={styles.stepText}>
                    {duration} {t.duration_unit}
                  </Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => setDuration(Math.min(480, duration + 15))}
                    testID="duration-plus"
                  >
                    <Plus size={16} color={theme.colors.text} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.label}>{t.field_impact}</Text>
              <Text style={styles.sub}>
                {type === "task"
                  ? t.field_impact_sub_task
                  : t.field_impact_sub_resource}
              </Text>

              <ImpactSlider
                Icon={Brain}
                label={t.donut_cog}
                mag={cogMag}
                onChange={setCogMag}
                color={theme.colors.cognitive}
                sign={sign}
                testID="impact-cognitive"
              />
              <ImpactSlider
                Icon={Users}
                label={t.donut_soc}
                mag={socMag}
                onChange={setSocMag}
                color={theme.colors.social}
                sign={sign}
                testID="impact-social"
              />
              <ImpactSlider
                Icon={Zap}
                label={t.donut_sen}
                mag={senMag}
                onChange={setSenMag}
                color={theme.colors.sensory}
                sign={sign}
                testID="impact-sensory"
              />
            </View>

            {isEdit && (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={onDelete}
                activeOpacity={0.85}
                testID="delete-event-btn"
              >
                <Trash2 size={16} color={theme.colors.danger} strokeWidth={1.8} />
                <Text style={styles.deleteBtnText}>{t.delete_event_btn}</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 12 }} />
          </ScrollView>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.cta, saving && { opacity: 0.6 }]}
            disabled={saving}
            onPress={onSubmit}
            activeOpacity={0.85}
            testID="save-event-btn"
          >
            {saving ? (
              <ActivityIndicator color={theme.colors.bg} />
            ) : (
              <>
                <Check size={18} color={theme.colors.bg} strokeWidth={2.4} />
                <Text style={styles.ctaText}>
                  {isEdit ? t.save_changes : t.cta_save}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const TypePill: React.FC<{
  active: boolean;
  label: string;
  desc: string;
  color: string;
  onPress: () => void;
  testID?: string;
}> = ({ active, label, desc, color, onPress, testID }) => (
  <TouchableOpacity
    style={[
      styles.typePill,
      active && { borderColor: color, backgroundColor: `${color}15` },
    ]}
    onPress={onPress}
    activeOpacity={0.85}
    testID={testID}
  >
    <Text style={[styles.typeLabel, active && { color }]}>{label}</Text>
    <Text style={styles.typeDesc}>{desc}</Text>
  </TouchableOpacity>
);

const ImpactSlider: React.FC<{
  Icon: any;
  label: string;
  mag: number;
  onChange: (v: number) => void;
  color: string;
  sign: number;
  testID?: string;
}> = ({ Icon, label, mag, onChange, color, sign, testID }) => {
  const signedDisplay =
    mag === 0 ? "0" : sign > 0 ? `+${mag}` : `-${mag}`;
  const valueColor =
    mag === 0
      ? theme.colors.textSecondary
      : sign > 0
      ? theme.colors.success
      : color;

  return (
    <View style={styles.impactRow} testID={testID}>
      <View style={styles.impactHead}>
        <View style={[styles.impactIcon, { backgroundColor: `${color}22` }]}>
          <Icon size={14} color={color} strokeWidth={1.8} />
        </View>
        <Text style={styles.impactLabel}>{label}</Text>
        <Text style={[styles.impactValue, { color: valueColor }]}>
          {signedDisplay}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={MAX}
        step={STEP}
        value={mag}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={"rgba(255,255,255,0.08)"}
        thumbTintColor={color}
        testID={`${testID}-slider`}
      />
      <View style={styles.scaleRow}>
        <Text style={styles.scaleText}>0</Text>
        <Text style={styles.scaleText}>25</Text>
        <Text style={styles.scaleText}>50</Text>
        <Text style={styles.scaleText}>75</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "600" },
  scroll: { padding: 20, gap: 22 },
  dateBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  sub: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    marginTop: -6,
    marginBottom: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    color: theme.colors.text,
    fontSize: 15,
  },
  typeRow: { flexDirection: "row", gap: 12 },
  typePill: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeLabel: { color: theme.colors.text, fontSize: 15, fontWeight: "700" },
  typeDesc: { color: theme.colors.textTertiary, fontSize: 12, marginTop: 2 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    height: 50,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceElevated,
  },
  stepText: { color: theme.colors.text, fontWeight: "600", fontSize: 14 },
  impactRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    gap: 4,
  },
  impactHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  impactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  impactLabel: {
    flex: 1,
    color: theme.colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  impactValue: { fontWeight: "700", fontSize: 14 },
  slider: { width: "100%", height: 36 },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: -4,
    marginBottom: 4,
  },
  scaleText: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "600",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(248,113,113,0.10)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.25)",
  },
  deleteBtnText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.text,
    paddingVertical: 16,
    borderRadius: 9999,
  },
  ctaText: {
    color: theme.colors.bg,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
