import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  X,
  Infinity as InfinityIcon,
  Bell,
  TrendingUp,
  HeartHandshake,
  Sparkles,
  Check,
} from "lucide-react-native";
import { theme } from "../lib/theme";
import { t } from "../lib/i18n";
import {
  loadProduct,
  purchase,
  restore,
  markFirstOpenSeen,
} from "../lib/subscription";

export default function Paywall() {
  const router = useRouter();
  const [price, setPrice] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await markFirstOpenSeen();
      } catch {}
      const info = await loadProduct();
      if (!mounted) return;
      setPrice(info.price);
      setAvailable(info.available);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/calendar");
  };

  const onPurchase = async () => {
    if (!available) {
      Alert.alert(t.paywall_unavailable_t, t.paywall_unavailable_m);
      return;
    }
    setBusy(true);
    const res = await purchase();
    setBusy(false);
    if (res.ok) {
      Alert.alert(t.paywall_thanks_t, t.paywall_thanks_m, [
        { text: t.ok, onPress: onClose },
      ]);
    } else if (res.error !== "cancelled") {
      Alert.alert(
        t.paywall_purchase_failed_t,
        res.error || t.paywall_purchase_failed_m
      );
    }
  };

  const onRestore = async () => {
    if (!available) {
      Alert.alert(t.paywall_unavailable_t, t.paywall_unavailable_m);
      return;
    }
    setBusy(true);
    const res = await restore();
    setBusy(false);
    if (res.ok && res.found) {
      Alert.alert(t.paywall_thanks_t, t.paywall_thanks_m, [
        { text: t.ok, onPress: onClose },
      ]);
    } else if (res.ok) {
      Alert.alert(t.paywall_restore_none_t, t.paywall_restore_none_m);
    } else {
      Alert.alert(
        t.paywall_purchase_failed_t,
        res.error || t.paywall_purchase_failed_m
      );
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.iconBtn}
          testID="paywall-close-btn"
        >
          <X size={20} color={theme.colors.text} strokeWidth={1.7} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIcon}>
          <Sparkles size={28} color={theme.colors.cognitive} strokeWidth={1.8} />
        </View>
        <Text style={styles.eyebrow}>{t.paywall_eyebrow}</Text>
        <Text style={styles.title}>{t.paywall_title}</Text>
        <Text style={styles.subtitle}>{t.paywall_subtitle}</Text>

        <View style={styles.features}>
          <Feature
            Icon={InfinityIcon}
            title={t.paywall_feature_unlimited}
            desc={t.paywall_feature_unlimited_desc}
            color={theme.colors.cognitive}
          />
          <Feature
            Icon={Bell}
            title={t.paywall_feature_notifications}
            desc={t.paywall_feature_notifications_desc}
            color={theme.colors.social}
          />
          <Feature
            Icon={TrendingUp}
            title={t.paywall_feature_stats}
            desc={t.paywall_feature_stats_desc}
            color={theme.colors.sensory}
          />
          <Feature
            Icon={HeartHandshake}
            title={t.paywall_feature_support}
            desc={t.paywall_feature_support_desc}
            color={theme.colors.success}
          />
        </View>

        <View style={styles.priceCard}>
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <>
              <Text style={styles.priceValue}>
                {price || t.paywall_price_fallback}
              </Text>
              {price ? (
                <Text style={styles.priceUnit}>{t.paywall_per_month}</Text>
              ) : null}
            </>
          )}
        </View>

        <Text style={styles.terms}>{t.paywall_terms}</Text>
        {Platform.OS === "web" && (
          <Text style={[styles.terms, { color: theme.colors.warning }]}>
            {t.paywall_unavailable_m}
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, busy && { opacity: 0.6 }]}
          onPress={onPurchase}
          disabled={busy}
          activeOpacity={0.85}
          testID="paywall-cta"
        >
          {busy ? (
            <ActivityIndicator color={theme.colors.bg} />
          ) : (
            <>
              <Check size={18} color={theme.colors.bg} strokeWidth={2.4} />
              <Text style={styles.ctaText}>
                {loading ? t.paywall_cta_loading : t.paywall_cta}
              </Text>
            </>
          )}
        </TouchableOpacity>
        <View style={styles.subRow}>
          <TouchableOpacity onPress={onRestore} testID="paywall-restore">
            <Text style={styles.subLink}>{t.paywall_restore}</Text>
          </TouchableOpacity>
          <Text style={styles.subDot}>·</Text>
          <TouchableOpacity onPress={onClose} testID="paywall-later">
            <Text style={styles.subLink}>{t.paywall_close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const Feature: React.FC<{
  Icon: any;
  title: string;
  desc: string;
  color: string;
}> = ({ Icon, title, desc, color }) => (
  <View style={styles.feature}>
    <View style={[styles.featureIcon, { backgroundColor: `${color}22` }]}>
      <Icon size={18} color={color} strokeWidth={1.7} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 8,
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
  scroll: { paddingHorizontal: 24, paddingBottom: 24, gap: 18 },
  heroIcon: {
    alignSelf: "center",
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(162, 136, 248, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  eyebrow: {
    color: theme.colors.cognitive,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textAlign: "center",
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -1,
    lineHeight: 36,
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: -6,
  },
  features: { gap: 12, marginTop: 8 },
  feature: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "flex-start",
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { color: theme.colors.text, fontWeight: "600", fontSize: 14 },
  featureDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  priceCard: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priceValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  priceUnit: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  terms: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
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
  subRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  subLink: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  subDot: { color: theme.colors.textTertiary },
});
