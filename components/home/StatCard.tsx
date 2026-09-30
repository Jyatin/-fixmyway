import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '@/constants/theme';

type Props = { label: string; value: string | number; unit?: string; progress?: number; color?: string };

export function StatCard({ label, value, unit, progress = 0, color = COLORS.primary }: Props) {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}><Text style={styles.value}>{value}</Text>{unit ? <Text style={styles.unit}>{unit}</Text> : null}</View>
      <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(100, progress))}%`, backgroundColor: color }]} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  label: { color: COLORS.textMuted, fontSize: 12, lineHeight: 16, marginBottom: 7 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  value: { color: COLORS.textPrimary, fontFamily: 'Georgia', fontSize: 26, lineHeight: 31, letterSpacing: -0.9 },
  unit: { color: COLORS.textMuted, fontSize: 11, marginLeft: 3 },
  track: { height: 3, borderRadius: RADIUS.full, backgroundColor: '#ECEAE4', marginTop: 10, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: RADIUS.full },
});
