import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { Compass, Layers, Plus, ScrollText, CircleUserRound } from 'lucide-react-native';

export default function FloatingTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom + 8, 14);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomOffset,
          left: 16,
          right: 16,
          backgroundColor: COLORS.tabBar,
          borderRadius: 28,
          height: 68,
          paddingBottom: 5,
          paddingTop: 5,
          paddingHorizontal: 7,
          borderWidth: 1,
          borderColor: COLORS.tabBarBorder,
          ...SHADOWS.floating,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
          letterSpacing: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.icon, focused && styles.iconActive]}>
              <Compass size={21} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.3 : 1.7} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="spotdex"
        options={{
          title: 'Spotdex',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.icon, focused && styles.iconActive]}>
              <Layers size={20} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.3 : 1.7} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="report"
        options={{
          title: 'Spot',
          tabBarIcon: () => (
            <View style={styles.plusHalo}>
              <View style={styles.plusButton}>
                <Plus size={23} color="#FFFFFF" strokeWidth={2.6} />
              </View>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
            color: COLORS.primary,
          },
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Logbook',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.icon, focused && styles.iconActive]}>
              <ScrollText size={20} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.3 : 1.7} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.icon, focused && styles.iconActive]}>
              <CircleUserRound size={21} color={focused ? COLORS.primary : color} strokeWidth={focused ? 2.3 : 1.7} />
            </View>
          ),
        }}
      />

      <Tabs.Screen name="leaderboard" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    transform: [{ scale: 1.05 }],
  },
  plusHalo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    marginTop: -10,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
});
