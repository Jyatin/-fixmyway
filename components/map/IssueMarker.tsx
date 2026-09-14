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
  zoomScale = 1.0,
}) => {
  const isResolved = issue.status === 'resolved';
  const meta = CATEGORIES[issue.category] || CATEGORIES.other;
  const isCritical = (issue.priorityScore || 50) >= 80 && !isResolved;

  const pinColor = isResolved ? COLORS.success : isCritical ? COLORS.error : (meta.color || COLORS.primary);
  const iconSize = Math.max(12, Math.min(18, Math.round(14 * Math.min(1.2, Math.max(0.85, zoomScale)))));

  const renderIcon = () => {
    if (isResolved) {
      return <BadgeCheck size={iconSize} color="#FFFFFF" strokeWidth={2.4} />;
    }

    switch (issue.category) {
      case 'pothole':
        return <CircleDotDashed size={iconSize} color="#FFFFFF" strokeWidth={2.4} />;
      case 'garbage':
        return <Recycle size={iconSize} color="#FFFFFF" strokeWidth={2.2} />;
      case 'streetlight':
        return <Lightbulb size={iconSize} color="#FFFFFF" strokeWidth={2.2} />;
      case 'road_damage':
        return <Construction size={iconSize} color="#FFFFFF" strokeWidth={2.2} />;
      default:
        return <TriangleAlert size={iconSize} color="#FFFFFF" strokeWidth={2.2} />;
    }
  };

  return (
    <View style={styles.markerContainer}>
      {/* Subtle Selected Outer Ring */}
      {isSelected && <View style={styles.selectedHalo} />}

      {/* Main Pin Head */}
      <View style={[styles.pinHead, { backgroundColor: pinColor }]}>
        {renderIcon()}

        {/* Urgent Indicator */}
        {isCritical && <View style={styles.urgentDot} />}
      </View>

      {/* Pin Stem Anchor */}
      <View style={[styles.pinTail, { borderTopColor: pinColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedHalo: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(29, 78, 216, 0.12)',
    top: -4,
  },
  pinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...SHADOWS.small,
  },
  pinTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  urgentDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});

