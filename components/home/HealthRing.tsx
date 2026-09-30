import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

type Props = { value: number; size?: number };

export function HealthRing({ value, size = 184 }: Props) {
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * Math.max(0, Math.min(100, value)) / 100;
  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`City health ${value} percent`}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
        <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#FFFFFF" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${progress} ${circumference}`} rotation="-90" origin={`${size / 2}, ${size / 2}`} />
      </Svg>
      <View style={styles.center}>
        <View style={styles.numberRow}>
          <Text style={styles.number}>{value}</Text>
          <Text style={styles.percent}>%</Text>
        </View>
        <Text style={styles.label}>CITY HEALTH</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  numberRow: { flexDirection: 'row', alignItems: 'flex-start' },
  number: { color: COLORS.textInverse, fontFamily: 'Georgia', fontSize: 64, fontWeight: '400', letterSpacing: -2.6, lineHeight: 70 },
  percent: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Georgia', fontSize: 20, marginTop: 5, marginLeft: 2 },
  label: { color: 'rgba(255,255,255,0.78)', fontSize: 10, fontWeight: '500', letterSpacing: 1.5, marginTop: 1 },
});
