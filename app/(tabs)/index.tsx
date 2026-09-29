import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { CivicMapView } from '@/components/map/CivicMapView';
import { MapIssueCarousel, MapIssueCarouselRef } from '@/components/map/MapIssueCarousel';
import { CATEGORY_LIST } from '@/constants/categories';
import { getCurrentLocation, getLastKnownLocation, LocationResult } from '@/services/location/locationService';
import { CivicIssue } from '@/types/issue';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { MapType } from 'react-native-maps';
import { PotholeHotspotModal } from '@/components/map/PotholeHotspotModal';
import { AirQualityModal } from '@/components/map/AirQualityModal';
import { PotholePredictionHotspot } from '@/services/analytics/potholePredictionService';
import { fetchLiveAirQuality, AirQualityData } from '@/services/analytics/airQualityService';
import { DEFAULT_REGION } from '@/constants/mockData';
import { Search, Layers, LocateFixed, CloudSun, SlidersHorizontal, Check, ChevronRight } from 'lucide-react-native';

export default function ModernMapScreen() {
  const insets = useSafeAreaInsets();
  const { issues } = useIssues();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'urgent' | 'active' | 'resolved'>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<PotholePredictionHotspot | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [showAqiModal, setShowAqiModal] = useState(false);
  const carouselRef = useRef<MapIssueCarouselRef>(null);

  useEffect(() => {
    async function initLocation() {
      const cached = await getLastKnownLocation();
      if (cached) setUserLocation(cached);
      const res = await getCurrentLocation();
      if (res.location) setUserLocation(res.location);
    }
    initLocation();
  }, []);

  useEffect(() => {
    async function loadAqi() {
      const lat = userLocation?.latitude || DEFAULT_REGION.latitude;
      const lng = userLocation?.longitude || DEFAULT_REGION.longitude;
      const data = await fetchLiveAirQuality(lat, lng);
      setAirQuality(data);
    }
    loadAqi();
  }, [userLocation?.latitude, userLocation?.longitude]);

  const filteredIssues = issues.filter((issue) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || issue.description.toLowerCase().includes(query) || issue.locationName.toLowerCase().includes(query) || issue.category.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const isUrgent = (issue.priorityScore || 50) >= 80;
    if (statusFilter === 'urgent' && !isUrgent) return false;
    if (statusFilter === 'active' && issue.status !== 'active') return false;
    if (statusFilter === 'resolved' && issue.status !== 'resolved') return false;
    return matchesSearch && matchesCategory;
  });

  const activeCount = issues.filter((i) => i.status === 'active').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  const handleSelectIssueFromMap = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    carouselRef.current?.scrollToIssue(issue.id);
  };

  return (
    <View style={styles.container}>
      <CivicMapView
        issues={filteredIssues}
        selectedIssueId={selectedIssueId}
        onSelectIssue={handleSelectIssueFromMap}
        userCoords={userLocation}
        mapType={mapType}
        recenterTrigger={recenterTrigger}
        showHotspots={showHotspots}
        onSelectHotspot={setSelectedHotspot}
      />

      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]}>
        <View style={styles.searchRow}>
          <View style={styles.searchSurface}>
            <Search size={19} color={COLORS.textSecondary} strokeWidth={1.8} />
            <TextInput style={styles.searchInput} placeholder="Search area, road or issue" placeholderTextColor={COLORS.textMuted} value={searchQuery} onChangeText={setSearchQuery} returnKeyType="search" accessibilityLabel="Search area, road or issue" />
            {airQuality && (
              <TouchableOpacity style={styles.aqiMini} onPress={() => setShowAqiModal(true)} accessibilityLabel={`Air quality index ${airQuality.aqi}`}>
                <View style={[styles.aqiDot, { backgroundColor: airQuality.color }]} />
                <Text style={styles.aqiMiniText}>{airQuality.aqi}</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[styles.filterButton, statusFilter !== 'all' && styles.filterButtonActive]} onPress={() => setShowFilterSheet(true)} accessibilityLabel="Open map filters">
            <SlidersHorizontal size={20} color={statusFilter !== 'all' ? COLORS.primary : COLORS.textPrimary} strokeWidth={1.8} />
            {statusFilter !== 'all' && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          <TouchableOpacity style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipSelected]} onPress={() => setSelectedCategory('all')}>
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextSelected]}>All</Text>
          </TouchableOpacity>
          {CATEGORY_LIST.map((cat) => {
            const selected = selectedCategory === cat.id;
            return (
              <TouchableOpacity key={cat.id} style={[styles.categoryChip, selected && styles.categoryChipSelected]} onPress={() => setSelectedCategory(cat.id)}>
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.mapControls, { top: insets.top + 132 }]}>
        <TouchableOpacity style={styles.mapControl} onPress={() => setMapType((prev) => prev === 'standard' ? 'satellite' : prev === 'satellite' ? 'hybrid' : 'standard')} accessibilityLabel="Map layers">
          <Layers size={21} color={COLORS.textPrimary} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapControl} onPress={() => setRecenterTrigger(Date.now())} accessibilityLabel="Center on your location">
          <LocateFixed size={21} color={COLORS.primary} strokeWidth={1.8} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.mapControl, showHotspots && styles.mapControlSelected]} onPress={() => setShowHotspots((value) => !value)} accessibilityLabel="Toggle environmental predictions">
          <CloudSun size={21} color={showHotspots ? COLORS.primary : COLORS.textSecondary} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {filteredIssues.length > 0 ? (
        <MapIssueCarousel ref={carouselRef} issues={filteredIssues} userCoords={userLocation} onPressIssue={(id) => router.push(`/issue/${id}`)} onActiveIssueChange={(issue) => setSelectedIssueId(issue.id)} />
      ) : (
        <View style={[styles.emptyCard, { bottom: insets.bottom + 92 }]}>
          <Text style={styles.emptyTitle}>Nothing needs attention here.</Text>
          <Text style={styles.emptyText}>Try another area or clear the filters.</Text>
          <TouchableOpacity style={styles.resetButton} onPress={() => { setSelectedCategory('all'); setStatusFilter('all'); setSearchQuery(''); }}>
            <Text style={styles.resetText}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <PotholeHotspotModal hotspot={selectedHotspot} visible={Boolean(selectedHotspot)} onClose={() => setSelectedHotspot(null)} onReportEarlyHazard={(hs) => router.push({ pathname: '/report', params: { category: 'pothole', locationName: hs.locationName, latitude: String(hs.latitude), longitude: String(hs.longitude) } })} />
      <AirQualityModal data={airQuality} visible={showAqiModal} onClose={() => setShowAqiModal(false)} />

      <Modal visible={showFilterSheet} transparent animationType="slide" onRequestClose={() => setShowFilterSheet(false)}>
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowFilterSheet(false)} />
          <View style={[styles.filterSheet, { paddingBottom: Math.max(insets.bottom + 20, 32) }]}>
            <View style={styles.dragHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>What should we show?</Text>
                <Text style={styles.sheetSubtitle}>Refine the map without leaving it.</Text>
              </View>
              <TouchableOpacity onPress={() => setShowFilterSheet(false)} style={styles.closeSheetButton}><Check size={18} color={COLORS.primary} /></TouchableOpacity>
            </View>
            <Text style={styles.sheetLabel}>STATUS</Text>
            {([
              ['all', `Everything · ${issues.length}`],
              ['active', `Needs attention · ${activeCount}`],
              ['resolved', `Recently fixed · ${resolvedCount}`],
              ['urgent', 'Urgent only'],
            ] as const).map(([value, label]) => {
              const selected = statusFilter === value;
              return (
                <TouchableOpacity key={value} style={[styles.filterRow, selected && styles.filterRowSelected]} onPress={() => setStatusFilter(value)}>
                  <Text style={[styles.filterRowText, selected && styles.filterRowTextSelected]}>{label}</Text>
                  {selected ? <Check size={18} color={COLORS.primary} /> : <ChevronRight size={17} color={COLORS.textMuted} />}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={styles.sheetDone} onPress={() => setShowFilterSheet(false)}><Text style={styles.sheetDoneText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topOverlay: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 20, gap: 10, zIndex: 20 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchSurface: { flex: 1, height: 52, borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 10, ...SHADOWS.floating },
  searchInput: { flex: 1, paddingVertical: 0, color: COLORS.textPrimary, fontSize: 14, fontWeight: '400' },
  aqiMini: { minWidth: 40, height: 32, borderRadius: 16, paddingHorizontal: 9, backgroundColor: COLORS.surfaceWarm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  aqiDot: { width: 7, height: 7, borderRadius: 4 },
  aqiMiniText: { fontSize: 11, fontWeight: '600', color: COLORS.textPrimary },
  filterButton: { width: 52, height: 52, borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', ...SHADOWS.floating },
  filterButtonActive: { backgroundColor: COLORS.primaryLight },
  filterDot: { position: 'absolute', top: 12, right: 12, width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  categoryScroll: { gap: 8, paddingRight: 20 },
  categoryChip: { height: 38, paddingHorizontal: 15, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.88)', alignItems: 'center', justifyContent: 'center', ...SHADOWS.subtle },
  categoryChipSelected: { backgroundColor: COLORS.primary },
  categoryText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  categoryTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  mapControls: { position: 'absolute', right: 20, gap: 10, zIndex: 20 },
  mapControl: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center', ...SHADOWS.floating },
  mapControlSelected: { backgroundColor: COLORS.primaryLight },
  emptyCard: { position: 'absolute', left: 20, right: 20, padding: 22, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOWS.floating, zIndex: 25 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '600' },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 5 },
  resetButton: { marginTop: 16 },
  resetText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '600' },
  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(23,24,23,0.18)' },
  filterSheet: { backgroundColor: COLORS.surfaceWarm, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 10, ...SHADOWS.large },
  dragHandle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: '#D8D8D2', marginBottom: 22 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  sheetTitle: { ...TYPOGRAPHY.subheading, color: COLORS.textPrimary },
  sheetSubtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 3 },
  closeSheetButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  sheetLabel: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginBottom: 8 },
  filterRow: { minHeight: 56, borderRadius: RADIUS.md, paddingHorizontal: 16, marginBottom: 7, backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterRowSelected: { backgroundColor: COLORS.primaryLight },
  filterRowText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '500' },
  filterRowTextSelected: { color: COLORS.primaryDark, fontWeight: '600' },
  sheetDone: { height: 54, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  sheetDoneText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
