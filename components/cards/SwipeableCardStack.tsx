import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { CivicIssue } from '@/types/issue';
import { StatusBadge } from '../ui/StatusBadge';
import { CategoryBadge } from '../ui/CategoryBadge';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/formatters';
import {
  MapPin,
  Users,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Flame,
  ShieldCheck,
  Compass,
  Sparkles,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface SwipeableCardStackProps {
  issues: CivicIssue[];
  onPressIssue: (issueId: string) => void;
}

export function SwipeableCardStack({ issues, onPressIssue }: SwipeableCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!issues || issues.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Compass size={32} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Hazards Logged Yet</Text>
        <Text style={styles.emptySub}>Switch tabs or report a new hazard to view cards here.</Text>
      </View>
    );
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % issues.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + issues.length) % issues.length);
  };

  const activeIssue = issues[currentIndex] || issues[0];
  const nextIssue = issues[(currentIndex + 1) % issues.length];

  const hazardTitle =
    activeIssue.locationName ||
    `${activeIssue.category.replace('_', ' ').toUpperCase()} HAZARD`;

  return (
    <View style={styles.stackContainer}>
      {/* Stack Deck Header Controls */}
      <View style={styles.stackControlsHeader}>
        <View style={styles.counterPill}>
          <Sparkles size={11} color="#007AFF" />
          <Text style={styles.counterPillText}>
            HAZARD {currentIndex + 1} OF {issues.length}
          </Text>
        </View>

        <View style={styles.controlsBtnGroup}>
          <TouchableOpacity style={styles.navArrowBtn} onPress={handlePrev} activeOpacity={0.7}>
            <ChevronLeft size={16} color="#007AFF" strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navArrowBtn} onPress={handleNext} activeOpacity={0.7}>
            <ChevronRight size={16} color="#007AFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stack Deck Wrapper */}
      <View style={styles.deckContainer}>
        {/* Background Stack Card (Depth Layer 2) */}
        {issues.length > 1 && nextIssue && (
          <View style={styles.bgCardLayer}>
            <Image
              source={{
                uri:
                  nextIssue.imageUrl ||
                  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
              }}
              style={styles.bgCardImage}
              resizeMode="cover"
            />
            <View style={styles.bgCardOverlay} />
          </View>
        )}

        {/* Top Active Swipable Card (Depth Layer 1) */}
        <TouchableOpacity
          style={styles.activeCardLayer}
          onPress={() => onPressIssue(activeIssue.id)}
          activeOpacity={0.94}
        >
          {/* TOP SECTION: PHOTO IMAGE ONLY (Unobstructed Visibility) */}
          <View style={styles.photoContainer}>
            <Image
              source={{
                uri:
                  activeIssue.imageUrl ||
                  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
              }}
              style={styles.heroPhoto}
              resizeMode="cover"
            />

            {/* Floating Top Badges over photo */}
            <View style={styles.photoTopBadgesStrip}>
              <CategoryBadge category={activeIssue.category} size="sm" />
              <StatusBadge status={activeIssue.status} size="sm" />
            </View>
          </View>

          {/* BOTTOM SECTION: DESCRIPTION & DETAILS (Clean White Card) */}
          <View style={styles.cardDetailsSection}>
            {/* Title & Small View Details Button */}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitleText} numberOfLines={1}>
                {hazardTitle}
              </Text>
              
              <View style={styles.smallViewBtn}>
                <Text style={styles.smallViewBtnText}>View Details</Text>
                <ArrowRight size={10} color="#007AFF" strokeWidth={2.5} />
              </View>
            </View>

            {activeIssue.description ? (
              <Text style={styles.cardDescText} numberOfLines={1}>
                {activeIssue.description}
              </Text>
            ) : null}

            {/* Location & Verifications Meta Row */}
            <View style={styles.metaRowContainer}>
              <View style={styles.metaPill}>
                <MapPin size={10} color="#007AFF" />
                <Text style={styles.metaPillText} numberOfLines={1}>
                  {activeIssue.locationName || `${activeIssue.latitude.toFixed(3)}, ${activeIssue.longitude.toFixed(3)}`}
                </Text>
              </View>

              <View style={styles.metaPill}>
                <Flame size={10} color="#F97316" />
                <Text style={styles.metaPillText}>
                  {activeIssue.confirmationCount || 0} Verified
                </Text>
              </View>

              <Text style={styles.timeAgoText}>
                {formatRelativeTime(activeIssue.createdAt)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stackContainer: {
    gap: 8,
    marginTop: 2,
  },
  stackControlsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  counterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
  },
  counterPillText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#007AFF',
    letterSpacing: 0.6,
  },
  controlsBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navArrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  deckContainer: {
    position: 'relative',
    height: 225,
    width: '100%',
    alignItems: 'center',
  },
  bgCardLayer: {
    position: 'absolute',
    top: 8,
    width: CARD_WIDTH - 20,
    height: 205,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    opacity: 0.6,
    borderWidth: 1,
    borderColor: 'rgba(210, 210, 215, 0.6)',
  },
  bgCardImage: {
    width: '100%',
    height: 110,
  },
  bgCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  activeCardLayer: {
    position: 'absolute',
    top: 0,
    width: CARD_WIDTH,
    height: 220,
    borderRadius: RADIUS.xl,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  photoContainer: {
    width: '100%',
    height: 125,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroPhoto: {
    width: '100%',
    height: '100%',
  },
  photoTopBadgesStrip: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDetailsSection: {
    padding: 12,
    gap: 6,
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  smallViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  smallViewBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardDescText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    lineHeight: 15,
  },
  metaRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    maxWidth: 130,
  },
  metaPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timeAgoText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: 28,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
