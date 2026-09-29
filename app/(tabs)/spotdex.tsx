import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { Wind, Droplets, ShieldCheck, Award, RefreshCw, ChevronRight, CircleDotDashed, Recycle, Construction } from 'lucide-react-native';

export default function SpotdexScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { issues, myReports, refreshIssues, isLoading } = useIssues();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [allBadgesModalVisible, setAllBadgesModalVisible] = useState(false);
  const [aqiModalVisible, setAqiModalVisible] = useState(false);
  const [realRainfallMm, setRealRainfallMm] = useState(1838);
  const [liveAqi, setLiveAqi] = useState<AirQualityData | null>(null);

  const loadReputationData = async () => setReputation(await getUserReputation(user?.uid, myReports));

  const loadRealTelemetry = async () => {
    try {
      const lat = issues[0]?.latitude || 28.6139;
      const lng = issues[0]?.longitude || 77.209;
      const rainRes = await fetchRealRainfallData(lat, lng, 730);
      if (rainRes?.totalRainfallMm) setRealRainfallMm(rainRes.totalRainfallMm);
      const aqiRes = await fetchLiveAirQuality(lat, lng);
      if (aqiRes) setLiveAqi(aqiRes);
    } catch (e) {
      console.warn('[SpotDex telemetry error]', e);
    }
  };

  useEffect(() => { loadReputationData(); loadRealTelemetry(); }, [user, myReports, issues]);

  const activeIssues = issues.filter((i) => i.status === 'active');
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;
  const verifiedCount = issues.filter((i) => (i.confirmationCount || 0) > 0 || i.status === 'resolved').length;
  const criticalCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;
  const healthScore = Math.max(18, Math.min(98, 100 - criticalCount * 12 - mediumCount * 4));
  const resolutionRate = issues.length ? Math.round((resolvedCount / issues.length) * 100) : 0;
  const potholes = issues.filter((i) => i.category === 'pothole').length;
  const waste = issues.filter((i) => i.category === 'garbage').length;
  const damage = issues.filter((i) => ['road_damage', 'streetlight', 'other'].includes(i.category)).length;
  const unlockedBadges = reputation?.badges.filter((b) => b.isUnlocked) || [];
  const totalBadges = reputation?.badges.length || 54;
  const displayBadges = unlockedBadges.length ? unlockedBadges : (reputation?.badges || []).slice(0, 4);

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 4 : 8) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshIssues} tintColor={COLORS.primary} />}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SPOTDEX</Text>
          <Text style={styles.title}>Your city's{`\n`}health at a glance.</Text>
          <Text style={styles.subtitle}>A quieter way to understand what is happening around you.</Text>
        </View>

        <View style={styles.healthCard}>
          <View style={styles.healthTop}><View><Text style={styles.cardLabel}>CITY HEALTH SCORE</Text><View style={styles.scoreLine}><Text style={styles.score}>{healthScore}%</Text><Text style={styles.scoreStatus}>{healthScore > 75 ? 'Healthy area' : healthScore > 50 ? 'Moderate risk' : 'Needs attention'}</Text></View></View><Text style={styles.fixedRate}>{resolutionRate}%{`\n`}fixed</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${healthScore}%` }]} /></View>
          <View style={styles.healthStats}><View><Text style={styles.statNumber}>{activeIssues.length}</Text><Text style={styles.statLabel}>needs attention</Text></View><View><Text style={styles.statNumber}>{verifiedCount}</Text><Text style={styles.statLabel}>verified</Text></View><View><Text style={[styles.statNumber, { color: COLORS.success }]}>{resolvedCount}</Text><Text style={styles.statLabel}>recently fixed</Text></View></View>
        </View>

        <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={() => setAqiModalVisible(true)}>
          <View style={styles.cardHeader}><View style={styles.cardHeaderLeft}><Wind size={19} color={COLORS.primary} strokeWidth={1.7} /><Text style={styles.cardLabel}>AIR QUALITY</Text></View><ChevronRight size={18} color={COLORS.textMuted} /></View>
          <Text style={styles.metricValue}>{liveAqi?.aqi || 139}</Text>
          <Text style={styles.metricDescription}>{liveAqi?.label || 'Unhealthy for sensitive groups'}</Text>
          <View style={styles.aqiScale}><LinearGradient colors={['#62C47A', '#E9C35A', '#E79B53', '#D95C55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.aqiGradient} /><View style={[styles.aqiThumb, { left: `${Math.min(96, Math.max(4, ((liveAqi?.aqi || 139) / 250) * 100))}%` }]} /></View>
          <View style={styles.aqiLabels}><Text style={styles.scaleText}>Good</Text><Text style={styles.scaleText}>Unhealthy</Text></View>
          <View style={styles.pollutants}><View><Text style={styles.pollutantLabel}>PM2.5</Text><Text style={styles.pollutantValue}>{liveAqi?.pm2_5 || 28.8} µg/m³</Text></View><View><Text style={styles.pollutantLabel}>PM10</Text><Text style={styles.pollutantValue}>{liveAqi?.pm10 || 29.7} µg/m³</Text></View></View>
          <Text style={styles.linkText}>View air quality details →</Text>
        </TouchableOpacity>

        <View style={styles.twoColumn}><View style={styles.smallCard}><View style={styles.smallHeader}><Droplets size={17} color={COLORS.blue} /><Text style={styles.cardLabel}>RAINFALL</Text></View><Text style={styles.smallValue}>{Math.round(realRainfallMm).toLocaleString()} mm</Text><Text style={styles.smallDescription}>{Math.round((realRainfallMm / 1200) * 100)}% of seasonal threshold</Text><View style={styles.softIndicator}><View style={[styles.softIndicatorFill, { width: `${Math.min(100, (realRainfallMm / 1200) * 100)}%` }]} /></View><Text style={styles.riskText}>Elevated pothole risk</Text></View><View style={styles.smallCard}><View style={styles.smallHeader}><ShieldCheck size={17} color={COLORS.success} /><Text style={styles.cardLabel}>COMMUNITY TRUST</Text></View><Text style={[styles.smallValue, { color: COLORS.success }]}>{reputation?.trustScore || 60}%</Text><Text style={styles.smallDescription}>{reputation?.trustTier || 'New Scout'}</Text><View style={styles.trustRow}><View style={styles.trustDot} /><Text style={styles.riskText}>High reliability</Text></View></View></View>

        <View style={styles.card}><View style={styles.cardHeader}><View><Text style={styles.cardLabel}>WHAT WE'RE SEEING</Text><Text style={styles.sectionTitle}>Around your area</Text></View><TouchableOpacity onPress={loadRealTelemetry}><RefreshCw size={18} color={COLORS.textMuted} /></TouchableOpacity></View><View style={styles.categorySummary}><View style={styles.categoryItem}><View style={[styles.categoryIcon, { backgroundColor: COLORS.potholeLight }]}><CircleDotDashed size={18} color={COLORS.pothole} /></View><Text style={styles.categoryNumber}>{potholes}</Text><Text style={styles.categoryName}>Potholes</Text></View><View style={styles.categoryItem}><View style={[styles.categoryIcon, { backgroundColor: COLORS.garbageLight }]}><Recycle size={18} color={COLORS.garbage} /></View><Text style={styles.categoryNumber}>{waste}</Text><Text style={styles.categoryName}>Waste</Text></View><View style={styles.categoryItem}><View style={[styles.categoryIcon, { backgroundColor: COLORS.roadDamageLight }]}><Construction size={18} color={COLORS.roadDamage} /></View><Text style={styles.categoryNumber}>{damage}</Text><Text style={styles.categoryName}>Damage</Text></View></View></View>

        <View style={styles.card}><View style={styles.cardHeader}><View><Text style={styles.cardLabel}>YOUR CIVIC JOURNEY</Text><Text style={styles.sectionTitle}>{unlockedBadges.length} / {totalBadges} milestones</Text></View><TouchableOpacity onPress={() => setAllBadgesModalVisible(true)}><ChevronRight size={19} color={COLORS.textMuted} /></TouchableOpacity></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>{displayBadges.slice(0, 6).map((badge) => <TouchableOpacity key={badge.id} style={styles.badgeItem} onPress={() => setSelectedBadge(badge)}><RealBadgeEmblem id={badge.id} size={54} isUnlocked={badge.isUnlocked} /><Text style={styles.badgeTitle} numberOfLines={1}>{badge.title}</Text></TouchableOpacity>)}</ScrollView></View>
      </ScrollView>

      <BadgeDetailModal badge={selectedBadge} visible={Boolean(selectedBadge)} onClose={() => setSelectedBadge(null)} />
      <AllBadgesModal visible={allBadgesModalVisible} badges={reputation?.badges || []} onClose={() => setAllBadgesModalVisible(false)} />
      <AirQualityModal data={liveAqi} visible={aqiModalVisible} onClose={() => setAqiModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28 },
  eyebrow: { ...TYPOGRAPHY.label, color: COLORS.primaryDark, marginBottom: 10 },
  title: { ...TYPOGRAPHY.displaySmall, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 10, maxWidth: 330 },
  card: { marginHorizontal: 20, marginBottom: 16, padding: 20, borderRadius: RADIUS.xl, backgroundColor: COLORS.surface, ...SHADOWS.card },
  healthCard: { marginHorizontal: 20, marginBottom: 16, padding: 22, borderRadius: RADIUS.xl, backgroundColor: COLORS.textPrimary, ...SHADOWS.card },
  healthTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  cardLabel: { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  scoreLine: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 7 },
  score: { fontSize: 36, lineHeight: 40, color: '#FFFFFF', fontWeight: '500', letterSpacing: -1 },
  scoreStatus: { color: '#D5D8D3', fontSize: 12 },
  fixedRate: { color: COLORS.primary, fontSize: 13, lineHeight: 19, fontWeight: '600', textAlign: 'right' },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#363936', marginTop: 22, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.primary },
  healthStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  statNumber: { fontSize: 21, color: '#FFFFFF', fontWeight: '500' },
  statLabel: { color: '#AEB3AC', fontSize: 11, marginTop: 3 },
  metricValue: { ...TYPOGRAPHY.number, color: COLORS.textPrimary },
  metricDescription: { color: COLORS.textSecondary, fontSize: 14, marginTop: 2 },
  aqiScale: { height: 8, marginTop: 21, position: 'relative' },
  aqiGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 4 },
  aqiThumb: { position: 'absolute', top: -4, marginLeft: -6, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.textPrimary, borderWidth: 3, borderColor: COLORS.surface },
  aqiLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  scaleText: { color: COLORS.textMuted, fontSize: 10.5 },
  pollutants: { flexDirection: 'row', gap: 42, marginTop: 20, paddingTop: 17, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  pollutantLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 4 },
  pollutantValue: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '500' },
  linkText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '600', marginTop: 18 },
  twoColumn: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 4 },
  smallCard: { flex: 1, minHeight: 176, padding: 17, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOWS.card },
  smallHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 15 },
  smallValue: { fontSize: 26, color: COLORS.textPrimary, fontWeight: '600', letterSpacing: -0.6 },
  smallDescription: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  softIndicator: { height: 6, backgroundColor: COLORS.surfaceHighlight, borderRadius: 3, marginTop: 16, overflow: 'hidden' },
  softIndicatorFill: { height: '100%', backgroundColor: COLORS.warning, borderRadius: 3 },
  riskText: { color: COLORS.textSecondary, fontSize: 10.5, marginTop: 9 },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 },
  trustDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 3 },
  categorySummary: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2 },
  categoryItem: { alignItems: 'center', flex: 1 },
  categoryIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 9 },
  categoryNumber: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '600' },
  categoryName: { color: COLORS.textMuted, fontSize: 11, marginTop: 3 },
  badgesRow: { gap: 22, paddingTop: 2, paddingRight: 20 },
  badgeItem: { width: 72, alignItems: 'center' },
  badgeTitle: { color: COLORS.textSecondary, fontSize: 10.5, textAlign: 'center', marginTop: 8 },
});
