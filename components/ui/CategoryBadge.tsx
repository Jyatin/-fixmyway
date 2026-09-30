import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IssueCategory } from '@/types/issue';
import { CATEGORIES } from '@/constants/categories';
import { RADIUS, SPACING } from '@/constants/theme';
import {
  CircleDotDashed,
  Recycle,
  Lightbulb,
  Construction,
  TriangleAlert,
} from 'lucide-react-native';

interface CategoryBadgeProps {
  category: IssueCategory;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  size = 'md',
}) => {
  const meta = CATEGORIES[category] || CATEGORIES.other;
  const iconSize = size === 'sm' ? 10 : 12;

  const renderIcon = () => {
    switch (category) {
      case 'pothole':
        return <CircleDotDashed size={iconSize} color={meta.color} strokeWidth={2.2} />;
      case 'garbage':
        return <Recycle size={iconSize} color={meta.color} strokeWidth={2.2} />;
      case 'streetlight':
        return <Lightbulb size={iconSize} color={meta.color} strokeWidth={2.2} />;
      case 'road_damage':
        return <Construction size={iconSize} color={meta.color} strokeWidth={2.2} />;
      default:
        return <TriangleAlert size={iconSize} color={meta.color} strokeWidth={2.2} />;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: meta.backgroundColor, borderColor: `${meta.color}30` },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      {showIcon && renderIcon()}
      <Text
        style={[
          styles.text,
          { color: meta.color },
          size === 'sm' && styles.textSm,
        ]}
      >
        {meta.shortLabel}
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
    borderWidth: 1,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  textSm: {
    fontSize: 10,
    fontWeight: '600',
  },
});

