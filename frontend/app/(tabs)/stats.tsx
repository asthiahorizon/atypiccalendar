import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { theme } from "../../lib/theme";
import { apiClient } from "../../lib/api";
import { addDays, dayShort, toISODate } from "../../lib/dates";
import { EnergyHeader } from "../../components/EnergyHeader";
import { t, lang } from "../../lib/i18n";

type Range = 7 | 30;

interface StatsData {
  start_date: string;
  end_date: string;
  days: any[];
  averages: {
    cognitive: number;
    social: number;
    sensory: number;
    fatigue_score: number;
  };
  overload_days: number;
  total_events: number;
}

export default function StatsScreen() {
  const [range, setRange] = useState<Range>(7);
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const end = new Date();
    const start = addDays(end, -(range - 1));
    const res = await apiClient.getStats(toISODate(start), toISODate(end));
    setData(res);
    setLoading(false);
  }, [range]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const fatigueLabel = (() => {
    if (!data) return "—";
    const f = data.averages.fatigue_score;
    if (f >= 60) return t.fatigue_high;
    if (f >= 35) return t.fatigue_med;
    return t.fatigue_low;
  })();

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.textSecondary}
          />
        }
      >
        <View>
          <Text style={styles.eyebrow}>{t.stats_eyebrow}</Text>
          <Text style={styles.title}>{t.stats_title}</Text>
          <Text style={styles.subtitle}>{t.stats_subtitle}</Text>
        </View>

        <View style={styles.modeRow}>
          {([7, 30] as Range[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.modeBtn, range === r && styles.modeBtnActive]}
              onPress={() => setRange(r)}
              activeOpacity={0.85}
              testID={`stats-range-${r}`}
            >
              <Text
                style={[styles.modeText, range === r && styles.modeTextActive]}
              >
                {r === 7 ? t.range_7 : t.range_30}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading || !data ? (
          <View style={{ paddingVertical: 80 }}>
            <ActivityIndicator color={theme.colors.text} />
          </View>
        ) : (
          <>
            {/* KPI cards */}
            <View style={styles.kpiRow}>
              <KpiCard
                label={t.kpi_avg_fatigue}
                value={`${data.averages.fatigue_score}%`}
                sub={fatigueLabel}
                color={theme.colors.cognitive}
              />
              <KpiCard
                label={t.kpi_overload}
                value={`${data.overload_days}`}
                sub={`/${data.days.length}`}
                color={theme.colors.social}
              />
            </View>
            <View style={styles.kpiRow}>
              <KpiCard
                label={t.kpi_events}
                value={`${data.total_events}`}
                sub={range === 7 ? t.this_week : t.this_month}
                color={theme.colors.sensory}
              />
              <KpiCard
                label={t.kpi_remaining}
                value={`${Math.round(
                  (data.averages.cognitive +
                    data.averages.social +
                    data.averages.sensory) /
                    3
                )}%`}
                sub={t.avg_label}
                color={theme.colors.success}
              />
            </View>

            {/* Avg donuts */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.avg_reserves}</Text>
              <View style={{ marginTop: 16 }}>
                <EnergyHeader
                  cognitive={data.averages.cognitive}
                  social={data.averages.social}
                  sensory={data.averages.sensory}
                  size={88}
                />
              </View>
            </View>

            {/* Fatigue chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.fatigue_trend}</Text>
              <Text style={styles.cardSub}>{t.fatigue_trend_sub}</Text>
              <FatigueChart days={data.days} />
            </View>

            {/* Energy balance chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t.energy_balance}</Text>
              <Text style={styles.cardSub}>{t.energy_balance_sub}</Text>
              <EnergyChart days={data.days} />
              <View style={styles.legendRow}>
                <Legend color={theme.colors.cognitive} label={t.donut_cog} />
                <Legend color={theme.colors.social} label={t.donut_soc} />
                <Legend color={theme.colors.sensory} label={t.donut_sen} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const KpiCard: React.FC<{
  label: string;
  value: string;
  sub: string;
  color: string;
}> = ({ label, value, sub, color }) => (
  <View style={styles.kpi}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    <Text style={styles.kpiSub}>{sub}</Text>
  </View>
);

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={styles.legend}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const FatigueChart: React.FC<{ days: any[] }> = ({ days }) => {
  return (
    <View style={styles.chart}>
      {days.map((d, i) => {
        const h = Math.max(4, (d.fatigue_score / 100) * 110);
        const color =
          d.fatigue_score >= 60
            ? "#E879A6"
            : d.fatigue_score >= 35
            ? theme.colors.social
            : theme.colors.success;
        const date = new Date(`${d.date}T00:00:00`);
        return (
          <View key={d.date} style={styles.chartCol}>
            <View style={styles.chartTrack}>
              <View
                style={[
                  styles.chartBar,
                  {
                    height: h,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
            <Text style={styles.chartLabel}>
              {days.length <= 10 ? dayShort(date, lang) : i % 3 === 0 ? `${date.getDate()}` : ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const EnergyChart: React.FC<{ days: any[] }> = ({ days }) => {
  return (
    <View style={styles.energyChart}>
      {days.map((d, i) => {
        const date = new Date(`${d.date}T00:00:00`);
        return (
          <View key={d.date} style={styles.energyChartCol}>
            <View style={styles.energyChartTrack}>
              <View
                style={[
                  styles.energyChartBar,
                  { height: `${d.cognitive}%`, backgroundColor: theme.colors.cognitive },
                ]}
              />
            </View>
            <View style={styles.energyChartTrack}>
              <View
                style={[
                  styles.energyChartBar,
                  { height: `${d.social}%`, backgroundColor: theme.colors.social },
                ]}
              />
            </View>
            <View style={styles.energyChartTrack}>
              <View
                style={[
                  styles.energyChartBar,
                  { height: `${d.sensory}%`, backgroundColor: theme.colors.sensory },
                ]}
              />
            </View>
            <Text style={styles.chartLabel}>
              {days.length <= 10 ? dayShort(date, lang) : i % 3 === 0 ? `${date.getDate()}` : ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 120, gap: 20 },
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
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 6,
  },
  modeRow: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: theme.colors.surfaceElevated },
  modeText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600" },
  modeTextActive: { color: theme.colors.text },
  kpiRow: { flexDirection: "row", gap: 12 },
  kpi: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  kpiLabel: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -1,
    marginTop: 8,
  },
  kpiSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "600" },
  cardSub: { color: theme.colors.textTertiary, fontSize: 12, marginTop: 4 },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 150,
    marginTop: 16,
    gap: 6,
  },
  chartCol: { flex: 1, alignItems: "center", gap: 6 },
  chartTrack: {
    height: 110,
    width: "100%",
    justifyContent: "flex-end",
  },
  chartBar: { width: "100%", borderRadius: 6 },
  chartLabel: {
    color: theme.colors.textTertiary,
    fontSize: 10,
    fontWeight: "600",
  },
  energyChart: {
    flexDirection: "row",
    height: 150,
    marginTop: 16,
    gap: 6,
    alignItems: "flex-end",
  },
  energyChartCol: { flex: 1, alignItems: "center", gap: 3 },
  energyChartTrack: {
    width: "100%",
    height: 36,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  energyChartBar: { width: "100%", borderRadius: 4 },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 16,
  },
  legend: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: theme.colors.textSecondary, fontSize: 12 },
});
