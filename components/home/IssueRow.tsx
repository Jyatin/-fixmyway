import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChevronRight, Construction, Droplets, Lightbulb } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

type Kind = 'roads' | 'lighting' | 'drainage';
type Props = { kind: Kind; title: string; subtitle: string; count: number; onPress?: () => void };

const iconFor = (kind: Kind) => kind === 'roads' ? Construction : kind === 'lighting' ? Lightbulb : Droplets;

export function IssueRow({ kind, title, subtitle, count, onPress }: Props) {
  const Icon = iconFor(kind);
  return (
    <View style={styles.row} accessible accessibilityRole="button" onTouchEnd={onPress}>
      <View style={styles.iconTile}><Icon size={22} color={COLORS.primary} strokeWidth={1.6} /></View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.countBox}><Text style={styles.count}>{count}</Text><Text style={styles.open}>OPEN</Text></View>
      <ChevronRight size={17} color={COLORS.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 82, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.border },
  iconTile: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginLeft: 14 },
  title: { color: COLORS.textPrimary, fontFamily: 'Georgia', fontSize: 18, lineHeight: 23 },
  subtitle: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  countBox: { width: 40, alignItems: 'flex-end', marginRight: 7 },
  count: { color: COLORS.textPrimary, fontFamily: 'Georgia', fontSize: 24, lineHeight: 28 },
  open: { color: COLORS.textMuted, fontSize: 10.5, letterSpacing: 0.8, marginTop: 1 },
});
