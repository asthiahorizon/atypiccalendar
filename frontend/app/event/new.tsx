import React, { useMemo, useState } from "react";
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
} from "lucide-react-native";
import { theme } from "../../lib/theme";
import { apiClient, EventType } from "../../lib/api";
import { fromISODate, formatDateLong } from "../../lib/dates";
import { t, lang } from "../../lib/i18n";

const STEP = 5;
const MAX = 75;

export default function NewEventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date || new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState<EventType>("task");
  const [cogMag, setCogMag] = useState(15);
  const [socMag, setSocMag] = useState(0);
  const [senMag, setSenMag] = useState(0);
  const [saving, setSaving] = useState(false);

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
      const check = await apiClient.checkEvent(payload as any);
      if (check.blocked) {
        setSaving(false);
        Alert.alert(t.err_capacity_t, t.err_capacity_m, [{ text: t.understood }]);
        return;
      }
      await apiClient.createEvent(payload as any);
      router.back();
    } catch (e: any) {
      setSaving(false);
      Alert.alert(t.err_cant_add, e?.message || t.err_unexpected);
    }
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
          <Text style={styles.headerTitle}>{t.new_event}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date */}
          <View style={styles.dateBlock}>
            <CalendarIcon
              size={14}
              color={theme.colors.textSecondary}
              strokeWidth={1.7}
            />
            <Text style={styles.dateText}>{dateText}</Text>
          </View>

          {/* Title */}
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

          {/* Type */}
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

          {/* Time + Duration */}
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

          {/* Impacts */}
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

          <View style={{ height: 12 }} />
        </ScrollView>

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
                <Text style={styles.ctaText}>{t.cta_save}</Text>
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
      active && {
        borderColor: color,
        backgroundColor: `${color}15`,
      },
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
  headerTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: {
    padding: 20,
    gap: 22,
  },
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
  typeLabel: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  typeDesc: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    marginTop: 2,
  },
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
  slider: {
    width: "100%",
    height: 36,
  },
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
