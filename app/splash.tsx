import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MapPinCheck } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const DISPLAY_MS = 1700;

export default function SplashScreen() {
  const { user, isLoading } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(markOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 9,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [markOpacity, opacity, scale]);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      router.replace(user ? '/(tabs)' : '/(auth)/login');
    }, DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [isLoading, user]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <Animated.View style={[styles.mark, { opacity: markOpacity }]}>
          <MapPinCheck size={27} color={COLORS.primary} strokeWidth={1.8} />
        </Animated.View>

        <Text style={styles.wordmark}>FixMyWay</Text>
        <Text style={styles.tagline}>A little care for every street.</Text>

        <View style={styles.bottomNote}>
          <View style={styles.dot} />
          <Text style={styles.bottomText}>your city, one fix at a time</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    marginTop: -36,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  wordmark: {
    ...TYPOGRAPHY.display,
    color: COLORS.textPrimary,
    fontSize: 39,
    lineHeight: 46,
  },
  tagline: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
    fontFamily: 'cursive',
    fontSize: 20,
    fontStyle: 'italic',
    letterSpacing: 0.1,
  },
  bottomNote: {
    position: 'absolute',
    top: 220,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  bottomText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1.4,
  },
});
