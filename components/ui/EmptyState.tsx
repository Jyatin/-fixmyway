import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '@/constants/theme';
import { CheckCircle, AlertTriangle, FileText, Plus } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  type?: 'reports' | 'filter' | 'success';
  actionTitle?: string;
  buttonTitle?: string;
  onAction?: () => void;
  onButtonPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  type = 'reports',
  actionTitle,
  buttonTitle,
  onAction,
  onButtonPress,
}) => {
  const effectiveActionTitle = actionTitle || buttonTitle;
  const effectiveOnAction = onAction || onButtonPress;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={28} color={COLORS.success} strokeWidth={2} />;
      case 'filter':
        return <AlertTriangle size={28} color={COLORS.warning} strokeWidth={2} />;
      default:
        return <FileText size={28} color={COLORS.primary} strokeWidth={2} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>{renderIcon()}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {effectiveActionTitle && effectiveOnAction && (
        <TouchableOpacity
          style={styles.btn}
          onPress={effectiveOnAction}
          activeOpacity={0.85}
        >
          <Plus size={14} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.btnText}>{effectiveActionTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: SPACING.lg,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
    ...SHADOWS.button,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});

