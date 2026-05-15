import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Brain,
  Users,
  Zap,
  Info,
  HeartHandshake,
  Moon,
  Globe,
  Sparkles,
} from "lucide-react-native";
import { theme } from "../../lib/theme";
import { t } from "../../lib/i18n";
import {
  ensurePermission,
  isEnabled,
  setEnabled,
} from "../../lib/notifications";

export default function SettingsScreen() {
  const [notifOn, setNotifOn] = useState(false);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    isEnabled().then((v) => {
      setNotifOn(v);
      setNotifLoading(false);
    });
  }, []);

  const onAbout = () => Alert.alert(t.about_title, t.about_body);
  const onEngagement = () => Alert.alert(t.engagement_title, t.engagement_body);

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.eyebrow}>{t.settings_eyebrow}</Text>
          <Text style={styles.title}>{t.settings_title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.premium_section}</Text>
          <TouchableOpacity
            style={styles.premiumCard}
            activeOpacity={0.85}
            onPress={() => router.push("/paywall")}
            testID="setting-premium"
          >
            <View
              style={[
                styles.rowIcon,
                { backgroundColor: "rgba(162, 136, 248, 0.18)" },
              ]}
            >
              <Sparkles
                size={18}
                color={theme.colors.cognitive}
                strokeWidth={1.7}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {premium ? t.premium_active : t.premium_inactive}
              </Text>
              {!premium && (
                <Text style={styles.rowDesc}>{t.upgrade_cta}</Text>
              )}
            </View>
            {!premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.reserves_section}</Text>
          <View style={styles.card}>
            <ReserveRow
              Icon={Brain}
              color={theme.colors.cognitive}
              title={t.donut_cog}
              desc={t.res_cog_desc}
            />
            <View style={styles.divider} />
            <ReserveRow
              Icon={Users}
              color={theme.colors.social}
              title={t.donut_soc}
              desc={t.res_soc_desc}
            />
            <View style={styles.divider} />
            <ReserveRow
              Icon={Zap}
              color={theme.colors.sensory}
              title={t.donut_sen}
              desc={t.res_sen_desc}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.app_section}</Text>
          <View style={styles.card}>
            <Row
              Icon={Moon}
              title={t.setting_theme}
              value={t.setting_theme_value}
              testID="setting-theme"
            />
            <View style={styles.divider} />
            <Row
              Icon={Globe}
              title={t.setting_language}
              value={t.language_name}
              testID="setting-language"
            />
            <View style={styles.divider} />
            <Row
              Icon={Info}
              title={t.setting_about}
              onPress={onAbout}
              testID="setting-about"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.care_section}</Text>
          <View style={styles.card}>
            <Row
              Icon={HeartHandshake}
              title={t.setting_engagement}
              onPress={onEngagement}
              testID="setting-engagement"
            />
          </View>
        </View>

        <Text style={styles.footer}>{t.footer}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const ReserveRow: React.FC<{
  Icon: any;
  color: string;
  title: string;
  desc: string;
}> = ({ Icon, color, title, desc }) => (
  <View style={styles.row}>
    <View style={[styles.rowIcon, { backgroundColor: `${color}22` }]}>
      <Icon size={18} color={color} strokeWidth={1.7} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowDesc}>{desc}</Text>
    </View>
  </View>
);

const Row: React.FC<{
  Icon: any;
  title: string;
  value?: string;
  onPress?: () => void;
  testID?: string;
}> = ({ Icon, title, value, onPress, testID }) => (
  <TouchableOpacity
    style={styles.row}
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    testID={testID}
    disabled={!onPress}
  >
    <View
      style={[styles.rowIcon, { backgroundColor: theme.colors.surfaceElevated }]}
    >
      <Icon size={16} color={theme.colors.textSecondary} strokeWidth={1.7} />
    </View>
    <Text style={[styles.rowTitle, { flex: 1 }]}>{title}</Text>
    {value ? <Text style={styles.rowValue}>{value}</Text> : null}
  </TouchableOpacity>
);

const ToggleRow_REMOVED = () => null;
void ToggleRow_REMOVED;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 120, gap: 24 },
  eyebrow: {
    color: theme.colors.cognitive,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  section: { gap: 10 },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { color: theme.colors.text, fontSize: 15, fontWeight: "600" },
  rowDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  rowValue: { color: theme.colors.textTertiary, fontSize: 13 },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(162, 136, 248, 0.25)",
  },
  premiumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: theme.colors.text,
  },
  premiumBadgeText: {
    color: theme.colors.bg,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: 64,
  },
  footer: {
    textAlign: "center",
    color: theme.colors.textTertiary,
    fontSize: 11,
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
