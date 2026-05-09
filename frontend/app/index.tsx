import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ArrowRight, Brain, Users, Zap } from "lucide-react-native";
import { theme } from "../lib/theme";
import { t } from "../lib/i18n";

const { width } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const subOpacity = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);
  const cardsY = useSharedValue(30);
  const ctaOpacity = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.bezier(0.25, 1, 0.5, 1);
    titleOpacity.value = withTiming(1, { duration: 800, easing: ease });
    titleY.value = withTiming(0, { duration: 800, easing: ease });
    subOpacity.value = withDelay(200, withTiming(1, { duration: 800, easing: ease }));
    cardsOpacity.value = withDelay(400, withTiming(1, { duration: 800, easing: ease }));
    cardsY.value = withDelay(400, withTiming(0, { duration: 800, easing: ease }));
    ctaOpacity.value = withDelay(700, withTiming(1, { duration: 800, easing: ease }));
  }, [titleOpacity, titleY, subOpacity, cardsOpacity, cardsY, ctaOpacity]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value }));
  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
    transform: [{ translateY: cardsY.value }],
  }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <View style={styles.root}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1777703304105-9977e87124a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwYWJzdHJhY3QlMjBzbW9vdGglMjBzaGFwZXN8ZW58MHx8fHwxNzc4MzU1MTM2fDA&ixlib=rb-4.1.0&q=85",
        }}
        style={styles.bg}
        imageStyle={{ opacity: 0.55 }}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.content}>
            <Animated.View style={titleStyle}>
              <Text style={styles.eyebrow}>{t.brand}</Text>
              <Text style={styles.title}>{t.onboarding_title}</Text>
            </Animated.View>

            <Animated.View style={subStyle}>
              <Text style={styles.subtitle}>{t.onboarding_subtitle}</Text>
            </Animated.View>

            <Animated.View style={[styles.pillars, cardsStyle]}>
              <Pillar
                Icon={Brain}
                color={theme.colors.cognitive}
                title={t.pillar_cog}
                desc={t.pillar_cog_desc}
              />
              <Pillar
                Icon={Users}
                color={theme.colors.social}
                title={t.pillar_soc}
                desc={t.pillar_soc_desc}
              />
              <Pillar
                Icon={Zap}
                color={theme.colors.sensory}
                title={t.pillar_sen}
                desc={t.pillar_sen_desc}
              />
            </Animated.View>

            <Animated.View style={[styles.ctaWrap, ctaStyle]}>
              <TouchableOpacity
                style={styles.cta}
                activeOpacity={0.85}
                onPress={() => router.replace("/(tabs)/calendar")}
                testID="onboarding-start-btn"
              >
                <Text style={styles.ctaText}>{t.cta_start}</Text>
                <ArrowRight size={20} color={theme.colors.bg} strokeWidth={2.2} />
              </TouchableOpacity>
              <Text style={styles.ctaSub}>{t.cta_no_account}</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const Pillar: React.FC<{
  Icon: any;
  color: string;
  title: string;
  desc: string;
}> = ({ Icon, color, title, desc }) => (
  <View style={styles.pillar}>
    <View style={[styles.pillarIcon, { backgroundColor: `${color}22` }]}>
      <Icon size={18} color={color} strokeWidth={1.7} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.pillarTitle}>{title}</Text>
      <Text style={styles.pillarDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  bg: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11,14,20,0.7)",
  },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  eyebrow: {
    color: theme.colors.cognitive,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    marginBottom: 18,
  },
  title: {
    color: theme.colors.text,
    fontSize: width < 380 ? 36 : 42,
    fontWeight: "700",
    letterSpacing: -1.5,
    lineHeight: width < 380 ? 42 : 48,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 24,
    maxWidth: 360,
  },
  pillars: {
    gap: 12,
    marginTop: 32,
  },
  pillar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.glass,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
  },
  pillarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pillarTitle: { color: theme.colors.text, fontWeight: "600", fontSize: 15 },
  pillarDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  ctaWrap: { marginTop: 24, alignItems: "center", gap: 10 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: theme.colors.text,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 9999,
    minWidth: 220,
    justifyContent: "center",
  },
  ctaText: {
    color: theme.colors.bg,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  ctaSub: {
    color: theme.colors.textTertiary,
    fontSize: 12,
  },
});
