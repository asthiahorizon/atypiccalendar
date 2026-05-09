import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
} from "lucide-react-native";
import { theme } from "../../lib/theme";
import {
  apiClient,
  AtypicEvent,
  DayEnergy,
  Suggestion,
} from "../../lib/api";
import {
  addDays,
  dayShort,
  endOfMonth,
  formatDateLong,
  formatMonthYear,
  isSameDay,
  isToday,
  monthName,
  startOfMonth,
  startOfWeek,
  toISODate,
} from "../../lib/dates";
import { EnergyHeader } from "../../components/EnergyHeader";
import { EventCard } from "../../components/EventCard";
import { FatigueIndicator } from "../../components/FatigueIndicator";
import { SuggestionCard } from "../../components/SuggestionCard";
import { t, lang, sugByType } from "../../lib/i18n";

type ViewMode = "day" | "week" | "month";

const WEEK_HEADERS: Record<string, string[]> = {
  en: ["M", "T", "W", "T", "F", "S", "S"],
  fr: ["L", "M", "M", "J", "V", "S", "D"],
  it: ["L", "M", "M", "G", "V", "S", "D"],
  de: ["M", "D", "M", "D", "F", "S", "S"],
};

export default function CalendarScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<AtypicEvent[]>([]);
  const [energy, setEnergy] = useState<DayEnergy | null>(null);
  const [weekEnergy, setWeekEnergy] = useState<DayEnergy[]>([]);
  const [monthEnergy, setMonthEnergy] = useState<DayEnergy[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dateISO = toISODate(selectedDate);

  const loadDay = useCallback(async () => {
    try {
      const [evs, sugg] = await Promise.all([
        apiClient.eventsByDate(dateISO),
        apiClient.getSuggestions(dateISO),
      ]);
      setEvents(evs);
      setEnergy(sugg.energy);
      setSuggestions(sugg.suggestions);
    } catch (e) {
      console.warn("loadDay error", e);
    }
  }, [dateISO]);

  const loadWeek = useCallback(async () => {
    const start = startOfWeek(selectedDate);
    const end = addDays(start, 6);
    try {
      const res = await apiClient.getRangeEnergy(toISODate(start), toISODate(end));
      setWeekEnergy(res.days);
    } catch (e) {
      console.warn("loadWeek error", e);
    }
  }, [selectedDate]);

  const loadMonth = useCallback(async () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    try {
      const res = await apiClient.getRangeEnergy(toISODate(start), toISODate(end));
      setMonthEnergy(res.days);
    } catch (e) {
      console.warn("loadMonth error", e);
    }
  }, [selectedDate]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadDay(), loadWeek(), loadMonth()]);
    setLoading(false);
  }, [loadDay, loadWeek, loadMonth]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await apiClient.deleteEvent(id);
    loadAll();
  };
  void handleDelete;

  const navigatePrev = () => {
    if (mode === "day") setSelectedDate(addDays(selectedDate, -1));
    else if (mode === "week") setSelectedDate(addDays(selectedDate, -7));
    else
      setSelectedDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
      );
  };
  const navigateNext = () => {
    if (mode === "day") setSelectedDate(addDays(selectedDate, 1));
    else if (mode === "week") setSelectedDate(addDays(selectedDate, 7));
    else
      setSelectedDate(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
      );
  };

  const headerTitle = useMemo(() => {
    if (mode === "day") return formatDateLong(selectedDate, lang);
    if (mode === "week") {
      const s = startOfWeek(selectedDate);
      const e = addDays(s, 6);
      return `${s.getDate()} – ${e.getDate()} ${monthName(e, lang)}`;
    }
    return formatMonthYear(selectedDate, lang);
  }, [mode, selectedDate]);

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
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              {isToday(selectedDate) ? t.today : t.day_label}
            </Text>
            <Text style={styles.title} numberOfLines={1}>
              {headerTitle}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.todayBtn}
            onPress={() => setSelectedDate(new Date())}
            testID="today-btn"
          >
            <CalendarDays
              size={16}
              color={theme.colors.textSecondary}
              strokeWidth={1.7}
            />
          </TouchableOpacity>
        </View>

        {/* View mode segmented */}
        <View style={styles.modeRow}>
          {(["day", "week", "month"] as ViewMode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
              onPress={() => setMode(m)}
              activeOpacity={0.8}
              testID={`mode-${m}`}
            >
              <Text
                style={[styles.modeText, mode === m && styles.modeTextActive]}
              >
                {m === "day" ? t.view_day : m === "week" ? t.view_week : t.view_month}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={navigatePrev}
            testID="prev-btn"
          >
            <ChevronLeft size={18} color={theme.colors.text} strokeWidth={1.8} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={navigateNext}
            testID="next-btn"
          >
            <ChevronRight
              size={18}
              color={theme.colors.text}
              strokeWidth={1.8}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 80 }}>
            <ActivityIndicator color={theme.colors.text} />
          </View>
        ) : mode === "day" ? (
          <DayView
            energy={energy}
            events={events}
            suggestions={suggestions}
            onAdd={() =>
              router.push({
                pathname: "/event/new",
                params: { date: dateISO },
              })
            }
          />
        ) : mode === "week" ? (
          <WeekView
            days={weekEnergy}
            selected={selectedDate}
            onSelectDay={(d) => {
              setSelectedDate(d);
              setMode("day");
            }}
          />
        ) : (
          <MonthView
            days={monthEnergy}
            currentMonth={selectedDate}
            onSelectDay={(d) => {
              setSelectedDate(d);
              setMode("day");
            }}
          />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() =>
          router.push({ pathname: "/event/new", params: { date: dateISO } })
        }
        testID="add-event-fab"
      >
        <Plus size={22} color={theme.colors.bg} strokeWidth={2.4} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const DayView: React.FC<{
  energy: DayEnergy | null;
  events: AtypicEvent[];
  suggestions: Suggestion[];
  onAdd: () => void;
}> = ({ energy, events, suggestions, onAdd }) => {
  const router = useRouter();
  return (
  <View style={{ gap: 24 }}>
    <View style={styles.donutsCard}>
      <EnergyHeader
        cognitive={energy?.cognitive ?? 100}
        social={energy?.social ?? 100}
        sensory={energy?.sensory ?? 100}
      />
    </View>

    {energy && <FatigueIndicator score={energy.fatigue_score} />}

    {suggestions.length > 0 && (
      <View style={{ gap: 10 }}>
        <Text style={styles.sectionTitle}>{t.suggestions_title}</Text>
        {suggestions.map((s, i) => (
          <SuggestionCard key={i} type={s.type} message={sugByType(s.type)} />
        ))}
      </View>
    )}

    <View style={{ gap: 12 }}>
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {t.events_title}{" "}
          <Text style={styles.sectionCount}>· {events.length}</Text>
        </Text>
      </View>
      {events.length === 0 ? (
        <TouchableOpacity
          style={styles.emptyCard}
          onPress={onAdd}
          activeOpacity={0.85}
          testID="empty-add-event"
        >
          <View style={styles.emptyIcon}>
            <Plus size={20} color={theme.colors.text} strokeWidth={1.8} />
          </View>
          <Text style={styles.emptyTitle}>{t.empty_title}</Text>
          <Text style={styles.emptySub}>{t.empty_sub}</Text>
        </TouchableOpacity>
      ) : (
        events.map((ev) => (
          <EventCard
            key={ev.id}
            event={ev}
            onPress={(e) =>
              router.push({
                pathname: "/event/new",
                params: { id: e.id, date: e.date },
              })
            }
          />
        ))
      )}
    </View>
  </View>
  );
};

const WeekView: React.FC<{
  days: DayEnergy[];
  selected: Date;
  onSelectDay: (d: Date) => void;
}> = ({ days, selected, onSelectDay }) => (
  <View style={{ gap: 12 }}>
    <Text style={styles.sectionTitle}>{t.week_view_title}</Text>
    {days.map((d) => {
      const date = new Date(`${d.date}T00:00:00`);
      const isSel = isSameDay(date, selected);
      const avg = Math.round(
        (d.cognitive + d.social + d.sensory) / 3
      );
      return (
        <TouchableOpacity
          key={d.date}
          style={[styles.weekRow, isSel && styles.weekRowActive]}
          activeOpacity={0.85}
          onPress={() => onSelectDay(date)}
          testID={`week-day-${d.date}`}
        >
          <View style={styles.weekDay}>
            <Text style={styles.weekDayLabel}>{dayShort(date, lang)}</Text>
            <Text style={[styles.weekDayNum, isToday(date) && styles.weekDayToday]}>
              {date.getDate()}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <View style={styles.tripleBars}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${d.cognitive}%`,
                      backgroundColor: theme.colors.cognitive,
                    },
                  ]}
                />
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${d.social}%`,
                      backgroundColor: theme.colors.social,
                    },
                  ]}
                />
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${d.sensory}%`,
                      backgroundColor: theme.colors.sensory,
                    },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.weekMeta}>
              {d.events_count}{" "}
              {d.events_count > 1 ? t.events_count_other : t.events_count_one} ·{" "}
              {t.energy_short} {avg}%
            </Text>
          </View>
        </TouchableOpacity>
      );
    })}
  </View>
);

const MonthView: React.FC<{
  days: DayEnergy[];
  currentMonth: Date;
  onSelectDay: (d: Date) => void;
}> = ({ days, currentMonth, onSelectDay }) => {
  const first = startOfMonth(currentMonth);
  const last = endOfMonth(currentMonth);
  const startPad = (first.getDay() + 6) % 7; // Monday-first
  const cells: (DayEnergy | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    const iso = toISODate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
    const found = days.find((x) => x.date === iso);
    cells.push(
      found || {
        date: iso,
        cognitive: 100,
        social: 100,
        sensory: 100,
        fatigue_score: 0,
        overload: false,
        events_count: 0,
      }
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.sectionTitle}>{t.month_view_title}</Text>
      <View style={styles.monthHeader}>
        {WEEK_HEADERS[lang].map((d, i) => (
          <Text key={i} style={styles.monthHeaderDay}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.monthGrid}>
        {cells.map((cell, i) => {
          if (!cell) return <View key={i} style={styles.monthCellEmpty} />;
          const date = new Date(`${cell.date}T00:00:00`);
          const avg = Math.round(
            (cell.cognitive + cell.social + cell.sensory) / 3
          );
          let bg = "rgba(255,255,255,0.04)";
          if (cell.events_count > 0) {
            if (avg >= 70) bg = "rgba(52, 211, 153, 0.18)";
            else if (avg >= 45) bg = "rgba(255, 176, 127, 0.18)";
            else bg = "rgba(232, 121, 166, 0.18)";
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.monthCell, { backgroundColor: bg }]}
              activeOpacity={0.8}
              onPress={() => onSelectDay(date)}
              testID={`month-day-${cell.date}`}
            >
              <Text
                style={[
                  styles.monthCellNum,
                  isToday(date) && styles.weekDayToday,
                ]}
              >
                {date.getDate()}
              </Text>
              {cell.events_count > 0 && (
                <View style={styles.monthDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    color: theme.colors.cognitive,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.7,
    textTransform: "capitalize",
  },
  todayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
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
  modeBtnActive: {
    backgroundColor: theme.colors.surfaceElevated,
  },
  modeText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  modeTextActive: { color: theme.colors.text },
  navRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  donutsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  sectionCount: {
    color: theme.colors.textTertiary,
    fontWeight: "500",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  emptySub: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 110,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.text,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  weekRowActive: {
    borderColor: theme.colors.borderMedium,
    backgroundColor: theme.colors.surfaceElevated,
  },
  weekDay: {
    width: 50,
    alignItems: "center",
    gap: 2,
  },
  weekDayLabel: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  weekDayNum: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  weekDayToday: {
    color: theme.colors.cognitive,
  },
  tripleBars: { gap: 4 },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  weekMeta: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    fontWeight: "500",
  },
  monthHeader: {
    flexDirection: "row",
    paddingHorizontal: 4,
  },
  monthHeaderDay: {
    flex: 1,
    textAlign: "center",
    color: theme.colors.textTertiary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  monthCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 2,
  },
  monthCellEmpty: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  monthCellNum: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  monthDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.text,
    marginTop: 2,
    opacity: 0.7,
  },
});
