import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Image, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as SplashScreenNative from 'expo-splash-screen';
import { useAuth } from '@/contexts/AuthContext';

SplashScreenNative.preventAutoHideAsync().catch(() => {});

const DISPLAY_MS = 1600;

export default function SplashScreen() {
  const { user, isLoading } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    SplashScreenNative.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        router.replace(user ? '/(tabs)' : '/(auth)/login');
      });
    }, DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [isLoading, user, fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Animated.View style={[styles.animatedWrapper, { opacity: fadeAnim }]}>
        <Image
          source={require('@/assets/splash-fixmyway.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#034C36',
  },
  animatedWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});
