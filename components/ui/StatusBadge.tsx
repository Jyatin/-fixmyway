import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IssueStatus } from '@/types/issue';
import { COLORS, RADIUS, SPACING } from '@/constants/theme';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const isActive = status === 'active';
  const iconSize = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;

  return (
    <View
      style={[
        styles.badge,
        isActive ? styles.activeBadge : styles.resolvedBadge,
        size === 'sm' && styles.badgeSm,
        size === 'lg' && styles.badgeLg,
      ]}
    >
      {isActive && <View style={[styles.liveDot, size === 'sm' && styles.liveDotSm]} />}
      {isActive ? (
        <AlertCircle size={iconSize} color={COLORS.primary} strokeWidth={2.2} />
      ) : (
        <CheckCircle2 size={iconSize} color={COLORS.resolved} strokeWidth={2.2} />
      )}
      <Text
        style={[
          styles.text,
          isActive ? styles.activeText : styles.resolvedText,
          size === 'sm' && styles.textSm,
          size === 'lg' && styles.textLg,
        ]}
      >
        {isActive ? 'Active' : 'Resolved'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    gap: 4,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  badgeLg: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 5,
  },
  activeBadge: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  resolvedBadge: {
    backgroundColor: COLORS.resolvedLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  text: {
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.1,
  },
  textSm: {
    fontSize: 10,
    fontWeight: '600',
  },
  textLg: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: COLORS.primary,
  },
  resolvedText: {
    color: COLORS.resolved,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
  liveDotSm: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

