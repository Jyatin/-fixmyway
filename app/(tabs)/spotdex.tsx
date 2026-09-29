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
import { COLORS, RADIUS, SPACING, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { Wind, Droplets, ShieldCheck, Award, RefreshCw, ChevronRight, Layers, CircleDotDashed, Recycle, Construction } from 'lucide-react-native';

export default function SpotdexScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { issues, myReports, refreshIssues, isLoading } = useIssues();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [allBadgesVisible, setAllBadgesVisible] = useState(false);
  const [aqiVisible, setAqiVisible] = useState(false);
  const [rainfall, setRainfall] = useState(1845.8);
  const [aqi, setAqi] = useState<AirQualityData | null>(null);

  useEffect(() => {
    const load = async () => {
      const rep = await getUserReputation(user?.uid, myReports);
      setReputation(rep);
      try {
        const lat = issues[0]?.latitude || 28.6139;
        const lng = issues[0]?.longitude || 77.209;
        const rain = await fetchRealRainfallData(lat, lng, 730);
        if (rain?.totalRainfallMm) setRainfall(rain.totalRainfallMm);
        const live = await fetchLiveAirQuality(lat, lng);
        if (live) setAqi(live);
      } catch (error) {
        console.warn('[Spotdex telemetry]', error);
      }
    };
    load();
  }, [user, myReports, issues]);

  const active = issues.filter((i) => i.status === 'active').length;
  const resolved = issues.filter((i) => i.status === 'resolved').length;
  const verified = issues.filter((i) => (i.confirmationCount || 0) > 0 || i.status === 'resolved').length;
  const critical = issues.filter((i) => i.severity === 'high').length;
  const medium = issues.filter((i) => i.severity === 'medium').length;
  const healthScore = Math.max(18, Math.min(98, 100 - critical * 12 - medium * 4));
  const fixedRate = issues.length ? Math.round((resolved / issues.length) * 100) : 78;
  const potholes = issues.filter((i) => i.category === 'pothole').length;
  const waste = issues.filter((i) => i.category === 'garbage').length;
  const damage = issues.filter((i) => ['road_damage', 'streetlight', 'other'].includes(i.category)).length;
  const badges = reputation?.badges || [];
  const unlocked = badges.filter((b) => b.isUnlocked).length;
  const trust = reputation?.trustScore || 85;

  const aqiValue = aqi?.aqi || 146;
  const aqiProgress = Math.min(96, Math.max(5, Math.round((aqiValue / 300) * 100)));

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 12) }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 108 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshIssues} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}><Layers size={19} color={COLORS.primary} strokeWidth={1.9} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>SPOTDEX</Text>
            <Text style={styles.display}>Your city, at a glance.</Text>
            <Text style={styles.headerSub}>A calm view of hazards, air and community health.</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrowMuted}>DISTRICT HEALTH</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.score}>{healthScore}%</Text>
                <View style={styles.riskPill}>
                  <Text style={styles.riskPillText}>{healthScore > 75 ? 'Healthy' : healthScore > 50 ? 'Moderate risk' : 'Needs attention'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.fixedRate}>
              <Text style={styles.fixedValue}>{fixedRate}%</Text>
              <Text style={styles.fixedLabel}>fixed</Text>
            </View>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${healthScore}%` }]} /></View>
          <View style={styles.metricsRow}>
            <Metric value={active} label="Needs attention" />
            <View style={styles.metricDivider} />
            <Metric value={verified} label="Verified" accent />
            <View style={styles.metricDivider} />
            <Metric value={resolved} label="Recently fixed" success />
          </View>
          <View style={styles.categoryRow}>
            <CategoryMetric icon={<CircleDotDashed size={13} color={COLORS.pothole} />} value={potholes} label="Potholes" />
            <CategoryMetric icon={<Recycle size={13} color={COLORS.garbage} />} value={waste} label="Waste" />
            <CategoryMetric icon={<Construction size={13} color={COLORS.roadDamage} />} value={damage} label="Damage" />
          </View>
        </View>

        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setAqiVisible(true)}>
          <View style={styles.cardTop}>
            <View style={styles.titleWithIcon}><Wind size={18} color={COLORS.primary} /><Text style={styles.cardTitle}>Air quality</Text></View>
            <View style={styles.softPill}><Text style={styles.softPillText}>{aqi?.label || 'Moderate air'}</Text></View>
          </View>
          <View style={styles.aqiMain}>
            <View><Text style={styles.aqiNumber}>{aqiValue}</Text><Text style={styles.unit}>US AQI</Text></View>
            <View style={styles.pollutants}>
              <Pollutant label="PM 2.5" value={`${aqi?.pm2_5 || 20.8} μg/m³`} />
              <Pollutant label="PM 10" value={`${aqi?.pm10 || 21.6} μg/m³`} />
            </View>
          </View>
          <View style={styles.aqiTrack}>
            <LinearGradient colors={['#55B96A', '#E9C04B', '#E99A3B', '#D95C55', '#8C63D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject} />
            <View style={[styles.aqiThumb, { left: `${aqiProgress}%`, backgroundColor: aqi?.color || COLORS.warning }]} />
          </View>
          <View style={styles.cardFooter}><Text style={styles.footerText}>View air quality details</Text><ChevronRight size={16} color={COLORS.primary} /></View>
        </TouchableOpacity>

        <View style={styles.twoUp}>
          <View style={[styles.smallCard, { marginRight: 6 }]}>
            <View style={styles.titleWithIcon}><Droplets size={17} color={COLORS.pothole} /><Text style={styles.smallTitle}>Rainfall</Text></View>
            <Text style={styles.smallNumber}>{rainfall.toFixed(1)} <Text style={styles.smallUnit}>mm</Text></Text>
            <Text style={styles.smallSub}>{Math.round((rainfall / 1200) * 100)}% of monsoon threshold</Text>
            <View style={styles.smallTag}><Text style={styles.smallTagText}>Elevated road risk</Text></View>
            <TouchableOpacity onPress={async () => {
              try {
                const lat = issues[0]?.latitude || 28.6139;
                const lng = issues[0]?.longitude || 77.209;
                const rain = await fetchRealRainfallData(lat, lng, 730);
                if (rain?.totalRainfallMm) setRainfall(rain.totalRainfallMm);
              } catch {}
            }} style={styles.refreshButton}><RefreshCw size={13} color={COLORS.textMuted} /></TouchableOpacity>
          </View>
          <View style={[styles.smallCard, { marginLeft: 6 }]}>
            <View style={styles.titleWithIcon}><ShieldCheck size={17} color={COLORS.success} /><Text style={styles.smallTitle}>Community trust</Text></View>
            <Text style={[styles.smallNumber, { color: COLORS.success }]}>{trust}%</Text>
            <Text style={styles.smallSub}>{reputation?.trustTier || 'Verified Scout'} tier</Text>
            <View style={[styles.smallTag, { backgroundColor: COLORS.successLight }]}><Text style={[styles.smallTagText, { color: COLORS.success }]}>High reliability</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.titleWithIcon}><Award size={18} color={COLORS.primary} /><Text style={styles.cardTitle}>Your civic journey</Text></View>
            <TouchableOpacity onPress={() => setAllBadgesVisible(true)} style={styles.viewAll}><Text style={styles.viewAllText}>{unlocked}/{badges.length || 54}</Text><ChevronRight size={15} color={COLORS.primary} /></TouchableOpacity>
          </View>
          <Text style={styles.cardDescription}>Small actions add up. Keep building your contribution history.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
            {(badges.length ? badges.slice(0, 6) : []).map((badge) => (
              <TouchableOpacity key={badge.id} style={styles.badgeItem} onPress={() => setSelectedBadge(badge)} activeOpacity={0.8}>
                <RealBadgeEmblem id={badge.id} size={52} isUnlocked={badge.isUnlocked} />
                <Text style={[styles.badgeName, !badge.isUnlocked && { color: COLORS.textMuted }]} numberOfLines={1}>{badge.title}</Text>
              </TouchableOpacity>
            ))}
            {!badges.length && [
              ['First report', 'first'], ['Sharp eye', 'sharp'], ['Verifier', 'verify'], ['Community builder', 'community']
            ].map(([name, id]) => (
              <View key={id} style={styles.lockedBadge}><View style={styles.lockCircle}><Text style={styles.lockText}>×</Text></View><Text style={styles.badgeName}>{name}</Text></View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.eyebrowMuted}>TODAY'S SIGNAL</Text>
          <Text style={styles.insightTitle}>{healthScore >= 70 ? 'Your area is holding steady.' : 'Your area could use a little attention.'}</Text>
          <Text style={styles.insightBody}>Spotdex combines community reports and environmental telemetry to keep the picture easy to understand.</Text>
        </View>
      </ScrollView>

      <AirQualityModal data={aqi} visible={aqiVisible} onClose={() => setAqiVisible(false)} />
      <BadgeDetailModal visible={Boolean(selectedBadge)} badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      <AllBadgesModal visible={allBadgesVisible} badges={badges} onClose={() => setAllBadgesVisible(false)} />
    </View>
  );
}

function Metric({ value, label, accent, success }: { value: number; label: string; accent?: boolean; success?: boolean }) {
  return <View style={styles.metric}><Text style={[styles.metricValue, accent && { color: COLORS.primary }, success && { color: COLORS.success }]}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function CategoryMetric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <View style={styles.categoryMetric}>{icon}<Text style={styles.categoryValue}>{value}</Text><Text style={styles.categoryLabel}>{label}</Text></View>;
}

function Pollutant({ label, value }: { label: string; value: string }) {
  return <View style={styles.pollutant}><Text style={styles.pollutantLabel}>{label}</Text><Text style={styles.pollutantValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  eyebrow: { color: COLORS.textMuted, fontSize: 10.5, fontWeight: '600', letterSpacing: 1.3, marginBottom: 4 },
  eyebrowMuted: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1.1 },
  display: { ...TYPOGRAPHY.display, color: COLORS.textPrimary, maxWidth: 280 },
  headerSub: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 300 },
  heroCard: { marginHorizontal: 20, marginBottom: 14, padding: 20, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, ...SHADOWS.card },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 5 },
  score: { ...TYPOGRAPHY.metric, color: COLORS.textPrimary },
  riskPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryLight },
  riskPillText: { color: COLORS.primaryDark, fontSize: 11, fontWeight: '600' },
  fixedRate: { alignItems: 'flex-end' },
  fixedValue: { fontSize: 26, lineHeight: 30, fontWeight: '600', color: COLORS.textPrimary },
  fixedLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: COLORS.surfaceHighlight, overflow: 'hidden', marginTop: 18 },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: COLORS.primary },
  metricsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18, backgroundColor: COLORS.surfaceHighlight, borderRadius: RADIUS.lg, paddingVertical: 12 },
  metric: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  metricValue: { fontSize: 19, lineHeight: 22, fontWeight: '600', color: COLORS.textPrimary },
  metricLabel: { color: COLORS.textMuted, fontSize: 9.5, marginTop: 3, textAlign: 'center' },
  metricDivider: { width: 1, height: 28, backgroundColor: COLORS.border },
  categoryRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  categoryMetric: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingVertical: 8 },
  categoryValue: { fontSize: 12, fontWeight: '600', color: COLORS.textPrimary },
  categoryLabel: { fontSize: 9.5, color: COLORS.textMuted },
  card: { marginHorizontal: 20, marginBottom: 14, padding: 20, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, ...SHADOWS.card },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600' },
  cardDescription: { color: COLORS.textSecondary, fontSize: 12.5, lineHeight: 18, marginTop: 7 },
  softPill: { paddingHorizontal: 9, paddingVertical: 5, backgroundColor: COLORS.warningLight, borderRadius: RADIUS.full },
  softPillText: { color: COLORS.warning, fontSize: 10.5, fontWeight: '600' },
  aqiMain: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 17 },
  aqiNumber: { fontSize: 44, lineHeight: 48, fontWeight: '600', letterSpacing: -1.2, color: COLORS.textPrimary },
  unit: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  pollutants: { flexDirection: 'row', gap: 18, paddingBottom: 3 },
  pollutant: { alignItems: 'flex-end' },
  pollutantLabel: { color: COLORS.textMuted, fontSize: 10 },
  pollutantValue: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '600', marginTop: 2 },
  aqiTrack: { height: 7, borderRadius: 4, overflow: 'visible', marginTop: 18, position: 'relative' },
  aqiThumb: { position: 'absolute', top: -4, width: 15, height: 15, marginLeft: -7.5, borderRadius: 8, borderWidth: 2, borderColor: COLORS.surface },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 14, gap: 3 },
  footerText: { color: COLORS.primary, fontSize: 11.5, fontWeight: '600' },
  twoUp: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14 },
  smallCard: { flex: 1, padding: 17, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, minHeight: 168, ...SHADOWS.card },
  smallTitle: { color: COLORS.textSecondary, fontSize: 11.5, fontWeight: '600' },
  smallNumber: { color: COLORS.textPrimary, fontSize: 24, lineHeight: 29, fontWeight: '600', marginTop: 18 },
  smallUnit: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  smallSub: { color: COLORS.textMuted, fontSize: 10.5, lineHeight: 15, marginTop: 4 },
  smallTag: { alignSelf: 'flex-start', backgroundColor: COLORS.warningLight, paddingHorizontal: 8, paddingVertical: 5, borderRadius: RADIUS.full, marginTop: 11 },
  smallTagText: { color: COLORS.warning, fontSize: 9.5, fontWeight: '600' },
  refreshButton: { position: 'absolute', right: 14, top: 14, padding: 5 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  viewAllText: { color: COLORS.primary, fontSize: 11.5, fontWeight: '600' },
  badgesRow: { paddingTop: 18, gap: 18 },
  badgeItem: { width: 72, alignItems: 'center' },
  badgeName: { color: COLORS.textSecondary, fontSize: 9.5, textAlign: 'center', marginTop: 6 },
  lockedBadge: { width: 72, alignItems: 'center' },
  lockCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.surfaceHighlight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  lockText: { color: COLORS.textMuted, fontSize: 20 },
  insightCard: { marginHorizontal: 20, marginTop: 2, padding: 20, backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.xl },
  insightTitle: { color: COLORS.textPrimary, fontSize: 19, lineHeight: 24, fontWeight: '600', marginTop: 7 },
  insightBody: { color: COLORS.textSecondary, fontSize: 12.5, lineHeight: 19, marginTop: 7 },
});
