import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '@/constants/theme';
import { MapPin, Layers3, Plus, ScrollText, CircleUserRound } from 'lucide-react-native';

export default function FloatingTabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom + 20, 20);
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.tabBarInactive,
      tabBarStyle: { position: 'absolute', bottom: bottomOffset, left: 18, right: 18, height: 70, paddingTop: 7, paddingBottom: 5, paddingHorizontal: 5, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 35, borderWidth: 1, borderColor: COLORS.tabBarBorder, ...SHADOWS.floating },
      tabBarItemStyle: { minHeight: 58, justifyContent: 'center', alignItems: 'center' },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '500', marginTop: 2, letterSpacing: 0.05 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Map', tabBarIcon: ({ color, focused }) => <MapPin size={21} color={focused ? COLORS.primary : color} strokeWidth={1.7} /> }} />
      <Tabs.Screen name="spotdex" options={{ title: 'Spotdex', tabBarIcon: ({ color, focused }) => <Layers3 size={21} color={focused ? COLORS.primary : color} strokeWidth={1.7} /> }} />
      <Tabs.Screen name="report" options={{ title: '', tabBarIcon: () => <View style={styles.plusButton}><Plus size={29} color="#FFFFFF" strokeWidth={2.1} /></View>, tabBarItemStyle: { justifyContent: 'center', alignItems: 'center' } }} />
      <Tabs.Screen name="reports" options={{ title: 'Logbook', tabBarIcon: ({ color, focused }) => <ScrollText size={21} color={focused ? COLORS.primary : color} strokeWidth={1.7} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: ({ color, focused }) => <CircleUserRound size={21} color={focused ? COLORS.primary : color} strokeWidth={1.7} /> }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  plusButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center', marginTop: -11, ...SHADOWS.button },
});
