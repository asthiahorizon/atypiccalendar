import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { theme } from "../lib/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  value: number; // 0..100
  size?: number;
  strokeWidth?: number;
  color: string;
  gradientFrom?: string;
  gradientTo?: string;
  label?: string;
  testID?: string;
  compact?: boolean;
}

export const EnergyDonut: React.FC<Props> = ({
  value,
  size = 120,
  strokeWidth = 12,
  color,
  gradientFrom,
  gradientTo,
  label,
  testID,
  compact,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(circumference);
  const gradId = `g-${color.replace(/[^a-z0-9]/gi, "")}-${size}`;

  useEffect(() => {
    const clamped = Math.max(0, Math.min(100, value));
    progress.value = withTiming(circumference * (1 - clamped / 100), {
      duration: 900,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [value, circumference, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: progress.value,
  }));

  return (
    <View style={[styles.wrap, { width: size }]} testID={testID}>
      <Svg width={size} height={size}>
        {gradientFrom && gradientTo && (
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradientFrom} />
              <Stop offset="1" stopColor={gradientTo} />
            </LinearGradient>
          </Defs>
        )}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={"rgba(255,255,255,0.06)"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gradientFrom && gradientTo ? `url(#${gradId})` : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text
          style={[
            compact ? styles.percentSm : styles.percent,
            { color: theme.colors.text },
          ]}
        >
          {Math.round(Math.max(0, Math.min(100, value)))}
        </Text>
        <Text
          style={[
            compact ? styles.unitSm : styles.unit,
            { color: theme.colors.textSecondary },
          ]}
        >
          %
        </Text>
      </View>
      {label && (
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  percent: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -1,
  },
  percentSm: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 13,
    marginLeft: 2,
    marginTop: 8,
  },
  unitSm: {
    fontSize: 10,
    marginLeft: 1,
    marginTop: 4,
  },
  label: {
    marginTop: 10,
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});
