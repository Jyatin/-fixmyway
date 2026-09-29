import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CivicIssue } from '@/types/issue';
import { CATEGORIES } from '@/constants/categories';
import { COLORS, SHADOWS } from '@/constants/theme';
import {
  Lightbulb,
  TriangleAlert,
  BadgeCheck,
  CircleDotDashed,
  Recycle,
  Construction,
} from 'lucide-react-native';

interface IssueMarkerProps {
  issue: CivicIssue;
  isSelected?: boolean;
  zoomScale?: number;
}

export const IssueMarker: React.FC<IssueMarkerProps> = ({
  issue,
  isSelected = false,
  zoomScale = 1,
}) => {
  const isResolved = issue.status === 'resolved';
  const meta = CATEGORIES[issue.category] || CATEGORIES.other;
  const isCritical = (issue.priorityScore || 50) >= 80 && !isResolved;
  const pinColor = isResolved
    ? COLORS.success
    : isCritical
      ? COLORS.error
      : meta.color || COLORS.primary;
  const scale = Math.min(1.18, Math.max(0.9, zoomScale));
  const size = Math.round((isSelected ? 42 : 34) * scale);
  const iconSize = Math.round((isSelected ? 19 : 15) * scale);

  const renderIcon = () => {
    if (isResolved) return <BadgeCheck size={iconSize} color="#FFFFFF" strokeWidth={2.1} />;

    switch (issue.category) {
      case 'pothole':
        return <CircleDotDashed size={iconSize} color="#FFFFFF" strokeWidth={2.1} />;
      case 'garbage':
        return <Recycle size={iconSize} color="#FFFFFF" strokeWidth={2.1} />;
      case 'streetlight':
        return <Lightbulb size={iconSize} color="#FFFFFF" strokeWidth={2.1} />;
      case 'road_damage':
        return <Construction size={iconSize} color="#FFFFFF" strokeWidth={2.1} />;
      default:
        return <TriangleAlert size={iconSize} color="#FFFFFF" strokeWidth={2.1} />;
    }
  };

  return (
    <View style={styles.container}>
      {isSelected && <View style={[styles.halo, { width: size + 22, height: size + 22, borderRadius: (size + 22) / 2 }]} />}
      <View
        style={[
          styles.marker,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: pinColor,
            borderColor: '#FFFFFF',
          },
          isSelected && styles.selectedMarker,
        ]}
      >
        {renderIcon()}
        {isCritical && <View style={styles.urgentDot} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    backgroundColor: COLORS.primaryGlow,
    borderWidth: 1,
    borderColor: 'rgba(33,184,58,0.24)',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    ...SHADOWS.small,
  },
  selectedMarker: {
    borderWidth: 3,
    ...SHADOWS.medium,
  },
  urgentDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
