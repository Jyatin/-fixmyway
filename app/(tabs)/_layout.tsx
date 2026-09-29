import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import {
  Compass,
  Layers3,
  Plus,
  ScrollText,
  CircleUserRound,
} from 'lucide-react-native';

export default function FloatingTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom + 8, 14);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomOffset,
          left: 16,
          right: 16,
          height: 72,
          paddingTop: 7,
          paddingBottom: 6,
          paddingHorizontal: 7,
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderRadius: RADIUS.lg,
          borderWidth: 0,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 7 },
          shadowOpacity: 0.055,
          shadowRadius: 20,
          elevation: 7,
        },
        tabBarItemStyle: {
          minHeight: 58,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
          letterSpacing: 0.1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconBox}>
              <Compass size={21} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.1 : 1.7} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="spotdex"
        options={{
          title: 'Spotdex',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconBox}>
              <Layers3 size={20} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.1 : 1.7} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.plusButton}>
              <Plus size={28} color="#FFFFFF" strokeWidth={2.2} />
            </View>
          ),
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Logbook',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconBox}>
              <ScrollText size={20} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.1 : 1.7} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconBox}>
              <CircleUserRound size={21} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.1 : 1.7} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      />

      <Tabs.Screen name="leaderboard" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
    ...SHADOWS.button,
  },
});
