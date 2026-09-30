import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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
import { AirQualityModal } from '@/components/map/AirQualityModal';
import { HealthRing } from '@/components/home/HealthRing';
import { StatCard } from '@/components/home/StatCard';
import { IssueRow } from '@/components/home/IssueRow';
import { COLORS, SHADOWS } from '@/constants/theme';
import { Bell, ChevronRight } from 'lucide-react-native';

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
      const [rainRes, aqiRes] = await Promise.all([fetchRealRainfallData(lat, lng, 730), fetchLiveAirQuality(lat, lng)]);
      if (rainRes?.totalRainfallMm) setRealRainfallMm(rainRes.totalRainfallMm);
      if (aqiRes) setLiveAqi(aqiRes);
    } catch (e) { console.warn('[SpotDex telemetry error]', e); }
  };

  useEffect(() => { loadReputationData(); loadRealTelemetry(); }, [user, myReports, issues.length]);

  const activeCount = issues.filter((i) => i.status === 'active').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;
  const verifiedCount = issues.filter((i) => (i.confirmationCount || 0) > 0 || i.status === 'resolved').length;
  const criticalCount = issues.filter((i) => i.severity === 'high').length;
  const mediumCount = issues.filter((i) => i.severity === 'medium').length;
  const healthScore = Math.max(18, Math.min(98, 100 - criticalCount * 12 - mediumCount * 4));
  const communityCount = Math.max(issues.length, verifiedCount + resolvedCount);
  const resolutionRate = issues.length ? Math.round((resolvedCount / issues.length) * 100) : 0;
  const dayLabel = useMemo(() => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date()).toUpperCase(), []);
  const statusMessage = healthScore >= 70 ? `In good shape · up ${Math.max(1, Math.round(resolutionRate / 5))}% this week` : 'Some places need a little care';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshIssues} tintColor={COLORS.primary} />} contentContainerStyle={{ paddingBottom: insets.bottom + 112 }}>
        <LinearGradient colors={['#052F21', '#0C6B47', '#0F7A50', '#1E9A64', '#C4F0D6']} locations={[0, 0.25, 0.55, 0.78, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, { paddingTop: insets.top + 14 }]}>
          <View style={styles.heroHeader}>
            <Text style={styles.brand}>FixMyWay</Text>
            <View style={styles.bell}><Bell size={19} color="#FFFFFF" strokeWidth={1.7} /><View style={styles.bellDot} /></View>
          </View>
          <View style={styles.healthRow}>
            <View style={styles.sideStat}><Text style={styles.sideNumber}>{activeCount}</Text><Text style={styles.sideLabel}>NEEDS{`\n`}ATTENTION</Text></View>
            <HealthRing value={healthScore} />
            <View style={styles.sideStat}><Text style={styles.sideNumber}>{resolvedCount}</Text><Text style={styles.sideLabel}>RECENTLY{`\n`}FIXED</Text></View>
          </View>
          <View style={styles.statusPill}><View style={styles.statusDot} /><Text style={styles.statusText}>{statusMessage}</Text></View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.conditionsCard}>
            <StatCard label="Air quality" value={liveAqi?.aqi ?? 128} unit="AQI" progress={Math.min(100, ((liveAqi?.aqi ?? 128) / 300) * 100)} color={COLORS.warning} />
            <View style={styles.verticalRule} />
            <StatCard label="Rainfall" value={Math.round(realRainfallMm).toLocaleString()} unit="mm" progress={Math.min(100, (realRainfallMm / 2400) * 100)} color={COLORS.teal} />
            <View style={styles.verticalRule} />
            <StatCard label="Community" value={communityCount} progress={Math.min(100, communityCount / Math.max(1, issues.length + 10) * 62)} color={COLORS.primary} />
          </View>

          <View style={styles.sectionHeader}><Text style={styles.today}>TODAY · {dayLabel}</Text><TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity></View>
          <TouchableOpacity style={styles.insightCard} activeOpacity={0.9}>
            <View style={styles.insightIcon}><View style={styles.insightDot} /></View>
            <Text style={styles.insightText}>A few places nearby could use your attention.</Text>
            <ChevronRight size={19} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.issueCard}>
            <IssueRow kind="roads" title="Roads" subtitle={`${Math.max(0, resolvedCount)} fixed this week`} count={issues.filter((i) => i.category === 'road_damage' && i.status === 'active').length || activeCount} />
            <IssueRow kind="lighting" title="Street lighting" subtitle={`${issues.filter((i) => i.category === 'streetlight' && i.status === 'resolved').length} fixed this week`} count={issues.filter((i) => i.category === 'streetlight' && i.status === 'active').length} />
            <IssueRow kind="drainage" title="Drainage" subtitle={`${issues.filter((i) => i.severity === 'high').length} urgent · ${resolvedCount} fixed this week`} count={issues.filter((i) => i.category === 'other' && i.status === 'active').length} />
          </View>

          <View style={styles.smallTelemetry}>
            <TouchableOpacity style={styles.telemetryCard} activeOpacity={0.9} onPress={() => setAqiModalVisible(true)}>
              <Text style={styles.telemetryLabel}>AIR QUALITY</Text><Text style={styles.telemetryValue}>{liveAqi?.aqi ?? 128}<Text style={styles.telemetryUnit}> AQI</Text></Text><Text style={styles.telemetryHint}>{liveAqi?.label ?? 'Live local reading'}</Text>
            </TouchableOpacity>
            <View style={styles.telemetryCard}><Text style={styles.telemetryLabel}>COMMUNITY TRUST</Text><Text style={styles.telemetryValue}>{reputation?.trustScore ?? 60}<Text style={styles.telemetryUnit}>%</Text></Text><Text style={styles.telemetryHint}>{reputation?.trustTier ?? 'New Scout'}</Text></View>
          </View>

          <View style={styles.journeyCard}>
            <View style={styles.journeyHeader}><View><Text style={styles.today}>YOUR CIVIC JOURNEY</Text><Text style={styles.journeyTitle}>{reputation?.badges.filter((b) => b.isUnlocked).length ?? 0} / {reputation?.badges.length ?? 54} milestones</Text></View><TouchableOpacity onPress={() => setAllBadgesModalVisible(true)}><ChevronRight size={19} color={COLORS.textMuted} /></TouchableOpacity></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
              {(reputation?.badges || []).slice(0, 6).map((badge) => <TouchableOpacity key={badge.id} onPress={() => setSelectedBadge(badge)} style={styles.badge}><View style={[styles.badgeCircle, !badge.isUnlocked && styles.badgeLocked]}><Text style={styles.badgeInitial}>{badge.title.slice(0, 1)}</Text></View><Text style={styles.badgeText} numberOfLines={1}>{badge.title}</Text></TouchableOpacity>)}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
      <BadgeDetailModal badge={selectedBadge} visible={Boolean(selectedBadge)} onClose={() => setSelectedBadge(null)} />
      <AllBadgesModal visible={allBadgesModalVisible} badges={reputation?.badges || []} onClose={() => setAllBadgesModalVisible(false)} />
      <AirQualityModal data={liveAqi} visible={aqiModalVisible} onClose={() => setAqiModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { minHeight: 485, paddingHorizontal: 20, paddingBottom: 44 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#FFFFFF', fontFamily: 'Georgia', fontSize: 30, letterSpacing: -1 },
  bell: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 7, right: 8, width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.softGreen },
  healthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 54 },
  sideStat: { width: 68, alignItems: 'center' },
  sideNumber: { color: '#FFFFFF', fontFamily: 'Georgia', fontSize: 32, lineHeight: 36, letterSpacing: -1 },
  sideLabel: { color: 'rgba(255,255,255,0.76)', fontSize: 10, fontWeight: '500', letterSpacing: 1.5, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  statusPill: { alignSelf: 'center', marginTop: 32, paddingHorizontal: 17, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C4F0D6', marginRight: 9 },
  statusText: { color: '#FFFFFF', fontSize: 12 },
  body: { marginTop: -44, paddingHorizontal: 18 },
  conditionsCard: { minHeight: 156, borderRadius: 24, backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 27, flexDirection: 'row', alignItems: 'center', ...SHADOWS.card },
  verticalRule: { width: 1, height: 67, backgroundColor: COLORS.border, marginHorizontal: 11 },
  sectionHeader: { marginTop: 43, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  today: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '600', letterSpacing: 1.5 },
  seeAll: { color: COLORS.textMuted, fontSize: 12 },
  insightCard: { minHeight: 118, borderRadius: 24, backgroundColor: COLORS.surface, paddingHorizontal: 20, paddingVertical: 22, flexDirection: 'row', alignItems: 'center', ...SHADOWS.card },
  insightIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8F6EE', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  insightDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 5 },
  insightText: { flex: 1, color: COLORS.textPrimary, fontFamily: 'Georgia', fontSize: 16.5, lineHeight: 23 },
  issueCard: { marginTop: 12, borderRadius: 24, backgroundColor: COLORS.surface, paddingHorizontal: 20, ...SHADOWS.card },
  smallTelemetry: { flexDirection: 'row', gap: 12, marginTop: 12 },
  telemetryCard: { flex: 1, minHeight: 130, borderRadius: 24, backgroundColor: COLORS.surface, padding: 19, ...SHADOWS.card },
  telemetryLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1.3 },
  telemetryValue: { color: COLORS.textPrimary, fontFamily: 'Georgia', fontSize: 28, marginTop: 12, letterSpacing: -1 },
  telemetryUnit: { color: COLORS.textMuted, fontFamily: 'Georgia', fontSize: 12 },
  telemetryHint: { color: COLORS.textMuted, fontSize: 11, marginTop: 4, lineHeight: 16 },
  journeyCard: { marginTop: 12, borderRadius: 24, backgroundColor: COLORS.surface, padding: 20, ...SHADOWS.card },
  journeyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  journeyTitle: { color: COLORS.textPrimary, fontFamily: 'Georgia', fontSize: 19, marginTop: 6 },
  badgesRow: { gap: 17, paddingTop: 20, paddingRight: 10 },
  badge: { width: 72, alignItems: 'center' },
  badgeCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primaryMuted },
  badgeLocked: { opacity: 0.38, backgroundColor: COLORS.background },
  badgeInitial: { color: COLORS.primaryDark, fontFamily: 'Georgia', fontSize: 20 },
  badgeText: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: 7 },
});
