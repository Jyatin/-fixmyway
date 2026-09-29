import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CivicIssue } from '@/types/issue';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { formatDistance, formatRelativeTime } from '@/utils/formatters';
import { calculateDistance } from '@/utils/distance';
import { MapPin, Users, ChevronRight } from 'lucide-react-native';

interface IssuePreviewCardProps {
  issue: CivicIssue;
  userCoords?: { latitude: number; longitude: number } | null;
  onPress: (issueId: string) => void;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';

const labels: Record<string, string> = {
  pothole: 'POTHOLE',
  garbage: 'WASTE',
  road_damage: 'ROAD DAMAGE',
  streetlight: 'STREETLIGHT',
  other: 'CIVIC ISSUE',
};

export function IssuePreviewCard({ issue, userCoords, onPress }: IssuePreviewCardProps) {
  const distance = userCoords
    ? calculateDistance(userCoords.latitude, userCoords.longitude, issue.latitude, issue.longitude)
    : null;
  const statusLabel = issue.status === 'resolved' ? 'Recently fixed' : 'Needs attention';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.94} onPress={() => onPress(issue.id)}>
      <Image source={{ uri: issue.imageUrl || FALLBACK_IMAGE }} style={styles.image} resizeMode="cover" />
      <View style={styles.content}>
        <Text style={styles.category}>{labels[issue.category] || 'CIVIC ISSUE'}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {issue.description || `${labels[issue.category] || 'Civic issue'} reported nearby`}
        </Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color={COLORS.textMuted} strokeWidth={1.8} />
          <Text style={styles.location} numberOfLines={1}>{issue.locationName || 'Nearby'}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.metaGroup}>
            <View style={styles.metaItem}>
              <Users size={13} color={COLORS.primary} strokeWidth={1.8} />
              <Text style={styles.metaText}>{issue.confirmationCount || 0} confirmations</Text>
            </View>
            {distance !== null && <Text style={styles.distance}>· {formatDistance(distance)}</Text>}
          </View>
          <View style={styles.action}>
            <Text style={styles.actionText}>View report</Text>
            <ChevronRight size={15} color={COLORS.primary} strokeWidth={2} />
          </View>
        </View>
        <Text style={styles.status}>{statusLabel} · {formatRelativeTime(issue.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.floating,
  },
  image: { width: '100%', height: 132, backgroundColor: COLORS.surfaceHighlight },
  content: { padding: 18, paddingBottom: 17 },
  category: { color: COLORS.primaryDark, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  title: { color: COLORS.textPrimary, fontSize: 18, lineHeight: 23, fontWeight: '500', letterSpacing: -0.2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 11 },
  location: { flex: 1, color: COLORS.textSecondary, fontSize: 12 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 },
  metaGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '500' },
  distance: { color: COLORS.textMuted, fontSize: 11 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '600' },
  status: { color: COLORS.textMuted, fontSize: 10.5, marginTop: 10 },
});
