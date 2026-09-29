import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CivicIssue } from '@/types/issue';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { formatDistance, formatRelativeTime } from '@/utils/formatters';
import { calculateDistance } from '@/utils/distance';
import { calculatePriorityScore } from '@/utils/priority';
import { MapPin, Users, Flame, ChevronRight } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CivicIssueCardProps {
  issue: CivicIssue;
  userCoords?: { latitude: number; longitude: number } | null;
  onPress: (issueId: string) => void;
  variant?: 'featured' | 'standard' | 'mapOverlay';
  onConfirm?: (issueId: string) => void;
}

export function CivicIssueCard({ issue, userCoords, onPress, variant = 'standard' }: CivicIssueCardProps) {
  const distance = userCoords
    ? calculateDistance(userCoords.latitude, userCoords.longitude, issue.latitude, issue.longitude)
    : null;

  const priorityScore = issue.priorityScore || calculatePriorityScore(
    issue.severity,
    issue.trafficLevel || 'medium',
    issue.confirmationCount || 0,
    issue.gettingWorseCount || 0,
    issue.createdAt
  ).total;

  const isUrgent = issue.severity === 'high' || priorityScore >= 75;
  const title = issue.description || `${issue.category.replace('_', ' ')} detected`;
  const location = issue.locationName || `${issue.latitude.toFixed(3)}, ${issue.longitude.toFixed(3)}`;

  if (variant === 'mapOverlay') {
    return (
      <TouchableOpacity style={styles.mapCard} onPress={() => onPress(issue.id)} activeOpacity={0.94}>
        <Image
          source={{ uri: issue.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80' }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <View style={styles.mapBody}>
          <View style={styles.badgeRow}>
            <CategoryBadge category={issue.category} size="sm" />
            <StatusBadge status={issue.status} size="sm" />
            {isUrgent && (
              <View style={styles.urgentPill}>
                <Flame size={10} color={COLORS.error} />
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>
          <Text style={styles.mapTitle} numberOfLines={2}>{title}</Text>
          <View style={styles.metaRow}>
            <MapPin size={12} color={COLORS.textMuted} />
            <Text style={styles.meta} numberOfLines={1}>{location}</Text>
            {distance !== null && <Text style={styles.distance}>• {formatDistance(distance)}</Text>}
          </View>
          <View style={styles.footer}>
            <View style={styles.confirmations}>
              <Users size={12} color={COLORS.primary} />
              <Text style={styles.confirmText}>{issue.confirmationCount || 0} confirmations</Text>
            </View>
            <View style={styles.detailsLink}>
              <Text style={styles.detailsText}>View report</Text>
              <ChevronRight size={14} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={() => onPress(issue.id)} activeOpacity={0.92}>
        <Image
          source={{ uri: issue.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80' }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <View style={styles.featuredBody}>
          <View style={styles.badgeRow}>
            <CategoryBadge category={issue.category} size="sm" />
            <StatusBadge status={issue.status} size="sm" />
          </View>
          <Text style={styles.featuredTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.featuredLocation} numberOfLines={1}>{location}</Text>
          <View style={styles.footer}>
            <Text style={styles.time}>{formatRelativeTime(issue.createdAt)}</Text>
            <View style={styles.confirmations}>
              <Users size={12} color={COLORS.primary} />
              <Text style={styles.confirmText}>{issue.confirmationCount || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.standardCard} onPress={() => onPress(issue.id)} activeOpacity={0.9}>
      <Image
        source={{ uri: issue.imageUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80' }}
        style={styles.standardImage}
        resizeMode="cover"
      />
      <View style={styles.standardBody}>
        <View style={styles.badgeRow}>
          <CategoryBadge category={issue.category} size="sm" />
          <StatusBadge status={issue.status} size="sm" />
        </View>
        <Text style={styles.standardTitle} numberOfLines={2}>{title}</Text>
        <View style={styles.metaRow}>
          <MapPin size={11} color={COLORS.textMuted} />
          <Text style={styles.meta} numberOfLines={1}>{location}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.time}>{formatRelativeTime(issue.createdAt)}</Text>
          <View style={styles.confirmations}>
            <Users size={11} color={COLORS.primary} />
            <Text style={styles.confirmText}>{issue.confirmationCount || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    width: SCREEN_WIDTH - 36,
    minHeight: 112,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    ...SHADOWS.floating,
  },
  mapImage: {
    width: 82,
    height: 92,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceHighlight,
  },
  mapBody: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  mapTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginTop: 3,
  },
  featuredCard: {
    width: SCREEN_WIDTH * 0.74,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  featuredImage: {
    width: '100%',
    height: 132,
    backgroundColor: COLORS.surfaceHighlight,
  },
  featuredBody: {
    padding: 16,
    gap: 6,
  },
  featuredTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
  },
  featuredLocation: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  standardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 10,
    flexDirection: 'row',
    gap: 12,
    ...SHADOWS.card,
  },
  standardImage: {
    width: 78,
    height: 78,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceHighlight,
  },
  standardBody: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  standardTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.errorLight,
  },
  urgentText: {
    color: COLORS.error,
    fontSize: 9.5,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  meta: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  distance: {
    color: COLORS.textMuted,
    fontSize: 10.5,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  confirmations: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confirmText: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    fontWeight: '500',
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  detailsText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 10.5,
  },
});
