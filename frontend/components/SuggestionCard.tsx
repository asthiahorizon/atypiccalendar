import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Sparkles, Wind, Brain, Users, Zap, HeartHandshake } from "lucide-react-native";
import { theme } from "../lib/theme";

interface Props {
  type: string;
  message: string;
}

const iconFor = (t: string) => {
  switch (t) {
    case "cognitive":
      return Brain;
    case "social":
      return Users;
    case "sensory":
      return Zap;
    case "pause":
      return Wind;
    case "resource":
      return HeartHandshake;
    default:
      return Sparkles;
  }
};

const colorFor = (t: string) => {
  switch (t) {
    case "cognitive":
      return theme.colors.cognitive;
    case "social":
      return theme.colors.social;
    case "sensory":
      return theme.colors.sensory;
    default:
      return theme.colors.text;
  }
};

export const SuggestionCard: React.FC<Props> = ({ type, message }) => {
  const Icon = iconFor(type);
  const color = colorFor(type);
  return (
    <View style={styles.card} testID={`suggestion-${type}`}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}22` }]}>
        <Icon size={18} color={color} strokeWidth={1.6} />
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderMedium,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});
