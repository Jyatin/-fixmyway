import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IssueStatus } from '@/types/issue';
import { COLORS, RADIUS } from '@/constants/theme';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isActive = status === 'active';
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

  return (
    <View style={[styles.badge, isActive ? styles.active : styles.resolved, size === 'sm' && styles.small, size === 'lg' && styles.large]}>
      {isActive ? <AlertCircle size={iconSize} color={COLORS.primary} strokeWidth={2} /> : <CheckCircle2 size={iconSize} color={COLORS.resolved} strokeWidth={2} />}
      <Text style={[styles.text, { color: isActive ? COLORS.primary : COLORS.resolved }, size === 'sm' && styles.textSmall, size === 'lg' && styles.textLarge]}>
        {isActive ? 'Active' : 'Resolved'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  small: { paddingHorizontal: 7, paddingVertical: 4, gap: 3 },
  large: { paddingHorizontal: 12, paddingVertical: 7, gap: 5 },
  active: { backgroundColor: COLORS.primaryLight },
  resolved: { backgroundColor: COLORS.resolvedLight },
  text: { fontSize: 11, fontWeight: '600' },
  textSmall: { fontSize: 10 },
  textLarge: { fontSize: 12 },
});
