import React from "react";
import { Tabs } from "expo-router";
import { Calendar, BarChart3, Settings as SettingsIcon } from "lucide-react-native";
import { theme } from "../../lib/theme";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: "rgba(11, 14, 20, 0.96)",
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.4,
        },
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendrier",
          tabBarIcon: ({ color }) => (
            <Calendar size={22} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistiques",
          tabBarIcon: ({ color }) => (
            <BarChart3 size={22} color={color} strokeWidth={1.7} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color }) => (
            <SettingsIcon size={22} color={color} strokeWidth={1.7} />
          ),
        }}
      />
    </Tabs>
  );
}
