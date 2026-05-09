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
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  X,
  Brain,
  Users,
  Zap,
  Stethoscope,
  Utensils,
  ShoppingCart,
  Trees,
  Moon,
  Dumbbell,
  BookOpen,
  Flower2,
  Clock,
  Calendar as CalendarIcon,
  Check,
  Plus,
  Minus,
} from "lucide-react-native";
import { theme } from "../../lib/theme";
import { apiClient, Template, EventType } from "../../lib/api";
import { fromISODate, formatDateLong } from "../../lib/dates";

const ICONS: Record<string, any> = {
  stethoscope: Stethoscope,
  utensils: Utensils,
  brain: Brain,
  users: Users,
  "shopping-cart": ShoppingCart,
  trees: Trees,
  moon: Moon,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  lotus: Flower2,
};

export default function NewEventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const date = params.date || new Date().toISOString().slice(0, 10);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [type, setType] = useState<EventType>("task");
  const [cog, setCog] = useState(0);
  const [soc, setSoc] = useState(0);
  const [sen, setSen] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.getTemplates().then(setTemplates).catch(console.warn);
  }, []);

  const applyTemplate = (t: Template) => {
    setSelectedTemplate(t.id);
    setTitle(t.name);
    setType(t.type);
    setDuration(t.duration_minutes);
    setCog(t.cognitive_impact);
    setSoc(t.social_impact);
    setSen(t.sensory_impact);
  };

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Titre manquant", "Donnez un nom à votre événement.");
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert("Heure invalide", "Format attendu : HH:MM (ex. 09:30).");
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      date,
      start_time: time,
      duration_minutes: duration,
      type,
      cognitive_impact: cog,
      social_impact: soc,
      sensory_impact: sen,
      template_id: selectedTemplate,
    };

    try {
      const check = await apiClient.checkEvent(payload as any);
      if (check.blocked) {
        setSaving(false);
        Alert.alert(
          "Capacité dépassée",
          "Cette activité dépasse votre capacité énergétique actuelle.",
          [{ text: "Compris" }]
        );
        return;
      }
      await apiClient.createEvent(payload as any);
      router.back();
    } catch (e: any) {
      setSaving(false);
      Alert.alert("Impossible d'ajouter", e?.message || "Erreur inattendue.");
    }
  };

  const dateObj = useMemo(() => fromISODate(date), [date]);

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
          <Text style={styles.headerTitle}>Nouvel événement</Text>
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
            <Text style={styles.dateText}>{formatDateLong(dateObj)}</Text>
          </View>

          {/* Templates */}
          <View>
            <Text style={styles.label}>Templates rapides</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tplRow}
            >
              {templates.map((t) => {
                const Icon = ICONS[t.icon] || Brain;
                const active = selectedTemplate === t.id;
                const accent =
                  t.type === "resource"
                    ? theme.colors.success
                    : theme.colors.cognitive;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.tpl,
                      active && {
                        borderColor: accent,
                        backgroundColor: `${accent}15`,
                      },
                    ]}
                    onPress={() => applyTemplate(t)}
                    activeOpacity={0.85}
                    testID={`template-${t.id}`}
                  >
                    <View
                      style={[
                        styles.tplIcon,
                        { backgroundColor: `${accent}22` },
                      ]}
                    >
                      <Icon size={16} color={accent} strokeWidth={1.7} />
                    </View>
                    <Text style={styles.tplName}>{t.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Title */}
          <View>
            <Text style={styles.label}>Titre</Text>
            <TextInput
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                setSelectedTemplate(null);
              }}
              placeholder="Ex. Marche en forêt"
              placeholderTextColor={theme.colors.textTertiary}
              style={styles.input}
              testID="event-title-input"
            />
          </View>

          {/* Type */}
          <View>
            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              <TypePill
                active={type === "task"}
                label="Tâche"
                desc="Diminue l'énergie"
                color={theme.colors.cognitive}
                onPress={() => setType("task")}
                testID="type-task"
              />
              <TypePill
                active={type === "resource"}
                label="Ressource"
                desc="Recharge l'énergie"
                color={theme.colors.success}
                onPress={() => setType("resource")}
                testID="type-resource"
              />
            </View>
          </View>

          {/* Time + Duration */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Heure</Text>
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
              <Text style={styles.label}>Durée</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setDuration(Math.max(15, duration - 15))}
                  testID="duration-minus"
                >
                  <Minus size={16} color={theme.colors.text} strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.stepText}>{duration} min</Text>
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
            <Text style={styles.label}>Impact énergétique</Text>
            <Text style={styles.sub}>
              Glissez pour ajuster (entre -100 et +100).
            </Text>

            <ImpactRow
              Icon={Brain}
              label="Cognitif"
              value={cog}
              onChange={setCog}
              color={theme.colors.cognitive}
              testID="impact-cognitive"
            />
            <ImpactRow
              Icon={Users}
              label="Social"
              value={soc}
              onChange={setSoc}
              color={theme.colors.social}
              testID="impact-social"
            />
            <ImpactRow
              Icon={Zap}
              label="Sensoriel"
              value={sen}
              onChange={setSen}
              color={theme.colors.sensory}
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
                <Text style={styles.ctaText}>Ajouter l'événement</Text>
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

const ImpactRow: React.FC<{
  Icon: any;
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  testID?: string;
}> = ({ Icon, label, value, onChange, color, testID }) => {
  const STEPS = [-50, -25, -10, 0, 10, 25, 50];
  return (
    <View style={styles.impactRow} testID={testID}>
      <View style={styles.impactHead}>
        <View style={[styles.impactIcon, { backgroundColor: `${color}22` }]}>
          <Icon size={14} color={color} strokeWidth={1.8} />
        </View>
        <Text style={styles.impactLabel}>{label}</Text>
        <Text
          style={[
            styles.impactValue,
            {
              color: value > 0 ? theme.colors.success : value < 0 ? color : theme.colors.textSecondary,
            },
          ]}
        >
          {value > 0 ? `+${value}` : value}
        </Text>
      </View>
      <View style={styles.impactSteps}>
        {STEPS.map((s) => {
          const active = value === s;
          return (
            <TouchableOpacity
              key={s}
              style={[
                styles.stepChip,
                active && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => onChange(s)}
              activeOpacity={0.85}
              testID={`${testID}-step-${s}`}
            >
              <Text
                style={[
                  styles.stepChipText,
                  active && { color: theme.colors.bg },
                ]}
              >
                {s > 0 ? `+${s}` : s}
              </Text>
            </TouchableOpacity>
          );
        })}
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
  tplRow: { gap: 8, paddingRight: 8 },
  tpl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tplIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tplName: { color: theme.colors.text, fontSize: 13, fontWeight: "600" },
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
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 10,
    gap: 10,
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
  impactSteps: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  stepChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepChipText: {
    color: theme.colors.text,
    fontSize: 12,
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
