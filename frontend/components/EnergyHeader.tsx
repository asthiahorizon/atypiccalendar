import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { EnergyDonut } from "./EnergyDonut";
import { theme } from "../lib/theme";
import { t } from "../lib/i18n";

interface Props {
  cognitive: number;
  social: number;
  sensory: number;
  size?: number;
}

export const EnergyHeader: React.FC<Props> = ({
  cognitive,
  social,
  sensory,
  size = 96,
}) => {
  return (
    <View style={styles.row} testID="energy-header">
      <View style={styles.item}>
        <EnergyDonut
          value={cognitive}
          size={size}
          strokeWidth={10}
          color={theme.colors.cognitive}
          gradientFrom="#8B93FF"
          gradientTo="#A288F8"
          testID="donut-cognitive"
        />
        <Text style={[styles.label, { color: theme.colors.cognitive }]}>
          {t.donut_cog}
        </Text>
      </View>
      <View style={styles.item}>
        <EnergyDonut
          value={social}
          size={size}
          strokeWidth={10}
          color={theme.colors.social}
          gradientFrom="#FF9A62"
          gradientTo="#FFB07F"
          testID="donut-social"
        />
        <Text style={[styles.label, { color: theme.colors.social }]}>
          {t.donut_soc}
        </Text>
      </View>
      <View style={styles.item}>
        <EnergyDonut
          value={sensory}
          size={size}
          strokeWidth={10}
          color={theme.colors.sensory}
          gradientFrom="#26C6DA"
          gradientTo="#4DD0E1"
          testID="donut-sensory"
        />
        <Text style={[styles.label, { color: theme.colors.sensory }]}>
          {t.donut_sen}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  item: {
    alignItems: "center",
    flex: 1,
  },
  label: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
