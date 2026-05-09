import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Trash2, ArrowDownRight, ArrowUpRight } from "lucide-react-native";
import { theme } from "../lib/theme";
import type { AtypicEvent } from "../lib/api";

interface Props {
  event: AtypicEvent;
  onDelete?: (id: string) => void;
  onPress?: (event: AtypicEvent) => void;
}

export const EventCard: React.FC<Props> = ({ event, onDelete, onPress }) => {
  const isResource = event.type === "resource";
  const accent = isResource ? theme.colors.success : theme.colors.cognitive;

  const totalImpact =
    event.cognitive_impact + event.social_impact + event.sensory_impact;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(event)}
      style={styles.card}
      testID={`event-card-${event.id}`}
    >
      <View style={[styles.bar, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.time}>{event.start_time}</Text>
          <View
            style={[
              styles.tag,
              {
                backgroundColor: isResource
                  ? "rgba(52, 211, 153, 0.12)"
                  : "rgba(162, 136, 248, 0.12)",
              },
            ]}
          >
            {isResource ? (
              <ArrowUpRight size={11} color={theme.colors.success} strokeWidth={2} />
            ) : (
              <ArrowDownRight size={11} color={theme.colors.cognitive} strokeWidth={2} />
            )}
            <Text
              style={[
                styles.tagText,
                { color: isResource ? theme.colors.success : theme.colors.cognitive },
              ]}
            >
              {isResource ? "Ressource" : "Tâche"}
            </Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={styles.impacts}>
          <ImpactPill label="Cog" value={event.cognitive_impact} color={theme.colors.cognitive} />
          <ImpactPill label="Soc" value={event.social_impact} color={theme.colors.social} />
          <ImpactPill label="Sen" value={event.sensory_impact} color={theme.colors.sensory} />
          <Text style={styles.duration}>{event.duration_minutes} min</Text>
        </View>
      </View>
      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(event.id)}
          style={styles.deleteBtn}
          testID={`delete-event-${event.id}`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={16} color={theme.colors.textTertiary} strokeWidth={1.6} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const ImpactPill: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => {
  if (value === 0) return null;
  return (
    <View style={[styles.pill, { borderColor: `${color}55` }]}>
      <Text style={[styles.pillLabel, { color }]}>{label}</Text>
      <Text style={[styles.pillValue, { color }]}>
        {value > 0 ? `+${value}` : value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "stretch",
  },
  bar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  time: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  impacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
    marginTop: 2,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  pillValue: {
    fontSize: 11,
    fontWeight: "700",
  },
  duration: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    marginLeft: "auto",
    fontWeight: "500",
  },
  deleteBtn: {
    paddingHorizontal: theme.spacing.lg,
    justifyContent: "center",
  },
});
