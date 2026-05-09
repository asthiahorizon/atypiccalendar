import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../lib/theme";

interface Props {
  score: number; // 0..100 (higher = more fatigue)
}

export const FatigueIndicator: React.FC<Props> = ({ score }) => {
  let label = "Fatigue faible";
  let color = theme.colors.success;
  if (score >= 60) {
    label = "Fatigue élevée";
    color = "#E879A6";
  } else if (score >= 35) {
    label = "Fatigue modérée";
    color = "#FFB07F";
  }

  const segments = 12;
  const filled = Math.round((score / 100) * segments);

  return (
    <View style={styles.wrap} testID="fatigue-indicator">
      <View style={styles.row}>
        <Text style={styles.label}>État du jour</Text>
        <Text style={[styles.score, { color }]}>{label}</Text>
      </View>
      <View style={styles.bars}>
        {Array.from({ length: segments }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                backgroundColor:
                  i < filled ? color : "rgba(255,255,255,0.06)",
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.sub}>
        Score moyen · {score}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  score: {
    fontSize: 14,
    fontWeight: "700",
  },
  bars: {
    flexDirection: "row",
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  sub: {
    marginTop: theme.spacing.md,
    color: theme.colors.textTertiary,
    fontSize: 12,
  },
});
