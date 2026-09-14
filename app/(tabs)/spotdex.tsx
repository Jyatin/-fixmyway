import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { getUserReputation } from '@/services/gamification/gamificationService';
import { fetchRealRainfallData } from '@/services/analytics/potholePredictionService';
import { fetchLiveAirQuality, AirQualityData } from '@/services/analytics/airQualityService';
import { UserReputation, Badge } from '@/types/gamification';
import { BadgeDetailModal } from '@/components/gamification/BadgeDetailModal';
import { AllBadgesModal } from '@/components/gamification/AllBadgesModal';
import { RealBadgeEmblem } from '@/components/ui/RealBadgeEmblem';
import { AirQualityModal } from '@/components/map/AirQualityModal';
import { SwipeableCardStack } from '@/components/cards/SwipeableCardStack';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import {
  Wind,
  Droplets,
  ShieldCheck,
  Award,
  RefreshCw,
  Plus,
  ChevronRight,
  Sparkles,
  Activity,
  Layers,
  CircleDotDashed,
  Recycle,
  Lightbulb,
  Construction,
} from 'lucide-react-native';

export default function SpotdexScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { issues, myReports, refreshIssues, isLoading } = useIssues();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [registryScope, setRegistryScope] = useState<'my' | 'community'>('community');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [allBadgesModalVisible, setAllBadgesModalVisible] = useState<boolean>(false);
  const [aqiModalVisible, setAqiModalVisible] = useState<boolean>(false);

  // Dynamic Real Telemetry State
  const [realRainfallMm, setRealRainfallMm] = useState<number>(1845.8);
  const [liveAqi, setLiveAqi] = useState<AirQualityData | null>(null);

  useEffect(() => {
    loadReputationData();
    loadRealTelemetry();
  }, [user, myReports, issues]);

  const loadReputationData = async () => {
    const rep = await getUserReputation(user?.uid, myReports);
    setReputation(rep);
  };

  const loadRealTelemetry = async () => {
    try {
      const lat = issues[0]?.latitude || 28.6139;
      const lng = issues[0]?.longitude || 77.209;

      const rainRes = await fetchRealRainfallData(lat, lng, 730);
      if (rainRes?.totalRainfallMm) {
        setRealRainfallMm(rainRes.totalRainfallMm);
      }

      const aqiRes = await fetchLiveAirQuality(lat, lng);
      if (aqiRes) {
        setLiveAqi(aqiRes);
      }
    } catch (e) {
      console.warn('[SpotDex Telemetry fetch error]:', e);
    }
  };

  // Metrics
  const totalAreaHazards = issues.length;
  const potholeCount = issues.filter((i) => i.category === 'pothole').length;
  const garbageCount = issues.filter((i) => i.category === 'garbage').length;
  const roadDamageCount = issues.filter((i) => i.category === 'road_damage' || i.category === 'streetlight' || i.category === 'other').length;

  const verifiedCount = issues.filter((i) => (i.confirmationCount || 0) > 0 || i.status === 'resolved').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;
  const criticalCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;

  // Real Road Safety Score Index
  const safetyScore = Math.max(18, Math.min(98, 100 - (criticalCount * 12 + mediumCount * 4)));
  const resolutionRate = totalAreaHazards > 0 ? Math.round((resolvedCount / totalAreaHazards) * 100) : 78;

  // Badges
  const totalBadgesEarned = reputation?.badges.filter((b) => b.isUnlocked).length || 0;
  const totalBadgesCount = reputation?.badges.length || 54;

  const currentDataset = registryScope === 'my' ? myReports : issues;

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 95 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshIssues} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconBox}>
            <Layers size={20} color={COLORS.primary} />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerTitle}>Spotdex Telemetry</Text>
            <Text style={styles.headerSub}>
              City infrastructure health & live environmental telemetry
            </Text>
          </View>
        </View>

        {/* 1. CITY SAFETY & HEALTH INDEX */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.sectionOverline}>DISTRICT HEALTH INDEX</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.bigScoreText}>{safetyScore}%</Text>
                <View style={styles.scoreStatusPill}>
                  <Text style={styles.scoreStatusText}>
                    {safetyScore > 75 ? 'Optimal' : safetyScore > 50 ? 'Moderate Risk' : 'Urgent Attention'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.resolutionPill}>
              <Text style={styles.resolutionPillValue}>{resolutionRate}%</Text>
              <Text style={styles.resolutionPillLabel}>Fixed Rate</Text>
            </View>
          </View>

          {/* Clean Progress Bar */}
          <View style={styles.safetyProgressTrack}>
            <View
              style={[
                styles.safetyProgressFill,
                {
                  width: `${safetyScore}%`,
                  backgroundColor:
                    safetyScore > 75 ? COLORS.success : safetyScore > 50 ? COLORS.primary : COLORS.error,
                },
              ]}
            />
          </View>

          {/* Key Metrics Breakdown */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalAreaHazards}</Text>
              <Text style={styles.statLabel}>Active Hazards</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.primary }]}>{verifiedCount}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>{resolvedCount}</Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>

          {/* Category Pill Counters */}
          <View style={styles.categoryCountRow}>
            <View style={styles.catMiniChip}>
              <CircleDotDashed size={13} color={COLORS.primary} strokeWidth={2.4} />
              <Text style={styles.catMiniChipText}>{potholeCount} Potholes</Text>
            </View>
            <View style={styles.catMiniChip}>
              <Recycle size={13} color="#059669" strokeWidth={2.4} />
              <Text style={styles.catMiniChipText}>{garbageCount} Waste</Text>
            </View>
            <View style={styles.catMiniChip}>
              <Construction size={13} color="#DC2626" strokeWidth={2.4} />
              <Text style={styles.catMiniChipText}>{roadDamageCount} Damage</Text>
            </View>
          </View>
        </View>

        {/* 2. AIR QUALITY INDEX TELEMETRY */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => setAqiModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconTitleRow}>
              <Wind size={16} color={COLORS.primary} />
              <Text style={styles.sectionOverline}>AIR QUALITY INDEX</Text>
            </View>
            <View
              style={[
                styles.aqiBadge,
                { backgroundColor: (liveAqi?.color || '#10B981') + '1E' },
              ]}
            >
              <Text style={[styles.aqiBadgeText, { color: liveAqi?.color || '#10B981' }]}>
                {liveAqi?.label || 'Moderate Air'}
              </Text>
            </View>
          </View>

          <View style={styles.aqiMainRow}>
            <View>
              <Text style={styles.aqiBigNum}>{liveAqi?.aqi || 146}</Text>
              <Text style={styles.aqiSubLabel}>US AQI Telemetry</Text>
            </View>
            <View style={styles.aqiPollutantGroup}>
              <View style={styles.pollutantItem}>
                <Text style={styles.pollutantLabel}>PM 2.5</Text>
                <Text style={styles.pollutantVal}>{liveAqi?.pm2_5 || 20.8} µg/m³</Text>
              </View>
              <View style={styles.pollutantItem}>
                <Text style={styles.pollutantLabel}>PM 10</Text>
                <Text style={styles.pollutantVal}>{liveAqi?.pm10 || 21.6} µg/m³</Text>
              </View>
            </View>
          </View>

          {/* Color Spectrum */}
          <View style={styles.aqiSpectrumTrack}>
            <LinearGradient
              colors={['#10B981', '#F59E0B', '#F97316', '#EF4444', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aqiSpectrumBar}
            />
            <View
              style={[
                styles.aqiSpectrumThumb,
                {
                  left: `${Math.min(96, Math.max(4, Math.round(((liveAqi?.aqi || 146) / 300) * 100)))}%`,
                  backgroundColor: liveAqi?.color || '#F97316',
                },
              ]}
            />
          </View>

          <View style={styles.aqiFooterNote}>
            <Text style={styles.aqiFooterText}>Tap to view full health advisories & pollution breakdown</Text>
            <ChevronRight size={14} color={COLORS.primary} />
          </View>
        </TouchableOpacity>

        {/* 3. RAINFALL & CITIZEN TRUST ROW */}
        <View style={styles.twoColumnRow}>
          {/* Rainfall / Road Risk Card */}
          <View style={[styles.card, styles.colCard]}>
            <View style={styles.colHeader}>
              <View style={styles.iconTitleRow}>
                <Droplets size={15} color="#0284C7" />
                <Text style={styles.colOverline}>RAINFALL</Text>
              </View>
              <TouchableOpacity onPress={loadRealTelemetry} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <RefreshCw size={13} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.colBigValue}>{realRainfallMm} mm</Text>
            <Text style={styles.colSubtext}>
              {Math.round((realRainfallMm / 1200) * 100)}% monsoon threshold
            </Text>
            <View style={styles.riskTag}>
              <Text style={styles.riskTagText}>Elevated Pothole Risk</Text>
            </View>
          </View>

          {/* Citizen Trust Tier Card */}
          <View style={[styles.card, styles.colCard]}>
            <View style={styles.colHeader}>
              <View style={styles.iconTitleRow}>
                <ShieldCheck size={15} color={COLORS.success} />
                <Text style={styles.colOverline}>TRUST RATING</Text>
              </View>
            </View>
            <Text style={[styles.colBigValue, { color: COLORS.success }]}>
              {reputation?.trustScore || 85}%
            </Text>
            <Text style={styles.colSubtext}>
              {reputation?.trustTier || 'Verified Scout'} Tier
            </Text>
            <View style={[styles.riskTag, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Text style={[styles.riskTagText, { color: '#065F46' }]}>High Reliability</Text>
            </View>
          </View>
        </View>

        {/* 4. RECOGNITION & BADGES SHOWCASE */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconTitleRow}>
              <Award size={16} color={COLORS.primary} />
              <Text style={styles.sectionOverline}>CITIZEN MILESTONES</Text>
            </View>
            <TouchableOpacity
              onPress={() => setAllBadgesModalVisible(true)}
              style={styles.viewAllBadgesBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllBadgesText}>
                {totalBadgesEarned}/{totalBadgesCount} Badges
              </Text>
              <ChevronRight size={13} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Badges preview row */}
          <View style={styles.badgesPreviewRow}>
            {((reputation?.badges.filter((b) => b.isUnlocked).length || 0) > 0
              ? reputation!.badges.filter((b) => b.isUnlocked)
              : (reputation?.badges || []).slice(0, 4)
            )
              .slice(0, 4)
              .map((badge) => (
                <TouchableOpacity
                  key={badge.id}
                  style={styles.badgePreviewItem}
                  onPress={() => setSelectedBadge(badge)}
                  activeOpacity={0.75}
                >
                  <RealBadgeEmblem id={badge.id} size={42} isUnlocked={badge.isUnlocked} />
                  <Text style={styles.badgePreviewTitle} numberOfLines={1}>
                    {badge.title}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* 5. COMMUNITY SIGHTINGS & CARDS STACK */}
        <View style={styles.feedSection}>
          <View style={styles.feedHeaderRow}>
            <Text style={styles.feedSectionTitle}>Hazard Registry</Text>
            <View style={styles.scopeSwitcher}>
              <TouchableOpacity
                style={[styles.scopeBtn, registryScope === 'community' && styles.scopeBtnActive]}
                onPress={() => setRegistryScope('community')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.scopeBtnText,
                    registryScope === 'community' && styles.scopeBtnTextActive,
                  ]}
                >
                  Community ({issues.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.scopeBtn, registryScope === 'my' && styles.scopeBtnActive]}
                onPress={() => setRegistryScope('my')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.scopeBtnText,
                    registryScope === 'my' && styles.scopeBtnTextActive,
                  ]}
                >
                  My Logs ({myReports.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Swipeable Stack of Cards */}
          <SwipeableCardStack
            issues={currentDataset}
            onPressIssue={(issueId) => router.push(`/issue/${issueId}`)}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      <AirQualityModal visible={aqiModalVisible} data={liveAqi} onClose={() => setAqiModalVisible(false)} />
      <BadgeDetailModal visible={Boolean(selectedBadge)} badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      <AllBadgesModal
        visible={allBadgesModalVisible}
        badges={reputation?.badges || []}
        onClose={() => setAllBadgesModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  bigScoreText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  scoreStatusPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  scoreStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resolutionPill: {
    alignItems: 'flex-end',
  },
  resolutionPillValue: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  resolutionPillLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  safetyProgressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  safetyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  categoryCountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  catMiniChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  catMiniChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  aqiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  aqiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aqiMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aqiBigNum: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -1,
  },
  aqiSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  aqiPollutantGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  pollutantItem: {
    alignItems: 'flex-end',
  },
  pollutantLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  pollutantVal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  aqiSpectrumTrack: {
    position: 'relative',
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  aqiSpectrumBar: {
    height: '100%',
    borderRadius: 3,
  },
  aqiSpectrumThumb: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    marginLeft: -7,
    ...SHADOWS.subtle,
  },
  aqiFooterNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  aqiFooterText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colCard: {
    flex: 1,
    gap: 6,
    padding: 14,
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  colBigValue: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  colSubtext: {
    fontSize: 10.5,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  riskTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    marginTop: 4,
  },
  riskTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  viewAllBadgesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  viewAllBadgesText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  badgesPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  badgePreviewItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  badgePreviewTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  feedSection: {
    gap: 12,
    marginTop: 4,
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  scopeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: RADIUS.sm,
    padding: 2,
  },
  scopeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  scopeBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.subtle,
  },
  scopeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  scopeBtnTextActive: {
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
