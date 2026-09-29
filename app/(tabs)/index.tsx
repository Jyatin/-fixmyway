import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapType } from 'react-native-maps';
import { useIssues } from '@/contexts/IssuesContext';
import { CivicMapView } from '@/components/map/CivicMapView';
import { MapIssueCarousel, MapIssueCarouselRef } from '@/components/map/MapIssueCarousel';
import { CATEGORY_LIST } from '@/constants/categories';
import { getCurrentLocation, getLastKnownLocation, LocationResult } from '@/services/location/locationService';
import { CivicIssue } from '@/types/issue';
import { COLORS, RADIUS, SHADOWS } from '@/constants/theme';
import { PotholeHotspotModal } from '@/components/map/PotholeHotspotModal';
import { AirQualityModal } from '@/components/map/AirQualityModal';
import { PotholePredictionHotspot } from '@/services/analytics/potholePredictionService';
import { fetchLiveAirQuality, AirQualityData } from '@/services/analytics/airQualityService';
import { DEFAULT_REGION } from '@/constants/mockData';
import { Search, Layers, LocateFixed, CloudRain, Flame, SlidersHorizontal, X } from 'lucide-react-native';

export default function ModernMapScreen() {
  const insets = useSafeAreaInsets();
  const { issues } = useIssues();
  const carouselRef = useRef<MapIssueCarouselRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [showHotspots, setShowHotspots] = useState(true);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<PotholePredictionHotspot | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [showAqi, setShowAqi] = useState(false);

  useEffect(() => {
    const init = async () => {
      const cached = await getLastKnownLocation();
      if (cached) setUserLocation(cached);
      const current = await getCurrentLocation();
      if (current.location) setUserLocation(current.location);
    };
    init();
  }, []);

  useEffect(() => {
    const loadAqi = async () => {
      const lat = userLocation?.latitude || DEFAULT_REGION.latitude;
      const lng = userLocation?.longitude || DEFAULT_REGION.longitude;
      const result = await fetchLiveAirQuality(lat, lng);
      if (result) setAirQuality(result);
    };
    loadAqi();
  }, [userLocation?.latitude, userLocation?.longitude]);

  const filteredIssues = issues.filter((issue) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || issue.description.toLowerCase().includes(q) || issue.locationName.toLowerCase().includes(q) || issue.category.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const urgent = (issue.priorityScore || 50) >= 80 || issue.severity === 'high';
    return matchesSearch && matchesCategory && (!urgentOnly || urgent);
  });

  const selectIssue = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    carouselRef.current?.scrollToIssue(issue.id);
  };

  return (
    <View style={styles.container}>
      <CivicMapView
        issues={filteredIssues}
        selectedIssueId={selectedIssueId}
        onSelectIssue={selectIssue}
        userCoords={userLocation}
        mapType={mapType}
        recenterTrigger={recenterTrigger}
        showHotspots={showHotspots}
        onSelectHotspot={setSelectedHotspot}
      />

      <View style={[styles.topArea, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchShell}>
          <Search size={19} color={COLORS.textSecondary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your city"
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchAction}>
              <X size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : airQuality ? (
            <TouchableOpacity style={styles.aqiPill} onPress={() => setShowAqi(true)}>
              <View style={[styles.aqiDot, { backgroundColor: airQuality.color }]} />
              <Text style={styles.aqiText}>{airQuality.aqi}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          <FilterChip label={`All ${issues.length}`} active={selectedCategory === 'all'} onPress={() => setSelectedCategory('all')} />
          {CATEGORY_LIST.map((category) => (
            <FilterChip
              key={category.id}
              label={`${category.shortLabel} ${issues.filter((i) => i.category === category.id).length}`}
              active={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.mapControls, { top: insets.top + (Platform.OS === 'ios' ? 126 : 132) }]}>
        <MapControl icon={<Layers size={18} color={COLORS.textPrimary} />} onPress={() => setMapType((current) => current === 'standard' ? 'satellite' : current === 'satellite' ? 'hybrid' : 'standard')} label="Map layers" />
        <MapControl icon={<LocateFixed size={18} color={COLORS.primary} />} onPress={() => setRecenterTrigger(Date.now())} label="My location" />
        <MapControl icon={<CloudRain size={18} color={showHotspots ? COLORS.primary : COLORS.textMuted} />} active={showHotspots} onPress={() => setShowHotspots((value) => !value)} label="Environmental risk" />
        <MapControl icon={<Flame size={18} color={urgentOnly ? '#FFFFFF' : COLORS.error} />} active={urgentOnly} urgent={urgentOnly} onPress={() => setUrgentOnly((value) => !value)} label="Urgent hazards" />
      </View>

      {filteredIssues.length > 0 ? (
        <MapIssueCarousel
          ref={carouselRef}
          issues={filteredIssues}
          userCoords={userLocation}
          onPressIssue={(id) => router.push(`/issue/${id}`)}
          onActiveIssueChange={(issue) => setSelectedIssueId(issue.id)}
        />
      ) : (
        <View style={[styles.emptyCard, { bottom: insets.bottom + 86 }]}>
          <Text style={styles.emptyTitle}>Nothing needs your attention here.</Text>
          <Text style={styles.emptySub}>Try another area or clear your filters.</Text>
          <TouchableOpacity onPress={() => { setSelectedCategory('all'); setUrgentOnly(false); setSearchQuery(''); }}><Text style={styles.reset}>Clear filters</Text></TouchableOpacity>
        </View>
      )}

      <PotholeHotspotModal
        hotspot={selectedHotspot}
        visible={Boolean(selectedHotspot)}
        onClose={() => setSelectedHotspot(null)}
        onReportEarlyHazard={(hs) => router.push({ pathname: '/report', params: { category: 'pothole', locationName: hs.locationName, latitude: String(hs.latitude), longitude: String(hs.longitude) } })}
      />
      <AirQualityModal data={airQuality} visible={showAqi} onClose={() => setShowAqi(false)} />
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.filterChip, active && styles.filterChipActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{label}</Text></TouchableOpacity>;
}

function MapControl({ icon, active, urgent, onPress, label }: { icon: React.ReactNode; active?: boolean; urgent?: boolean; onPress: () => void; label: string }) {
  return <TouchableOpacity accessibilityLabel={label} onPress={onPress} activeOpacity={0.85} style={[styles.mapControl, active && (urgent ? styles.urgentControl : styles.activeControl)]}>{icon}</TouchableOpacity>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topArea: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, zIndex: 30 },
  searchShell: { height: 54, backgroundColor: COLORS.surfaceGlass, borderRadius: RADIUS.lg, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, ...SHADOWS.floating },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15, fontWeight: '400', paddingVertical: 0 },
  searchAction: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  aqiPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceHighlight },
  aqiDot: { width: 7, height: 7, borderRadius: 4 },
  aqiText: { fontSize: 11, color: COLORS.textPrimary, fontWeight: '600' },
  filters: { gap: 8, paddingTop: 10, paddingBottom: 4, paddingHorizontal: 1 },
  filterChip: { backgroundColor: COLORS.surfaceGlass, paddingHorizontal: 14, paddingVertical: 9, borderRadius: RADIUS.full, ...SHADOWS.small },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 11.5, fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  mapControls: { position: 'absolute', right: 14, gap: 8, zIndex: 20 },
  mapControl: { width: 46, height: 46, borderRadius: 16, backgroundColor: COLORS.surfaceGlass, alignItems: 'center', justifyContent: 'center', ...SHADOWS.card },
  activeControl: { backgroundColor: COLORS.primaryLight },
  urgentControl: { backgroundColor: COLORS.error },
  emptyCard: { position: 'absolute', left: 18, right: 18, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: 20, alignItems: 'center', ...SHADOWS.floating },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  emptySub: { color: COLORS.textSecondary, fontSize: 12.5, marginTop: 5 },
  reset: { color: COLORS.primary, fontSize: 12, fontWeight: '600', marginTop: 12 },
});
