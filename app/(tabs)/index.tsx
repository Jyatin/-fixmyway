import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { CivicMapView } from '@/components/map/CivicMapView';
import { MapIssueCarousel, MapIssueCarouselRef } from '@/components/map/MapIssueCarousel';
import { IssueBottomSheet } from '@/components/map/IssueBottomSheet';
import { CATEGORY_LIST } from '@/constants/categories';
import { getCurrentLocation, getLastKnownLocation, LocationResult } from '@/services/location/locationService';
import { CivicIssue } from '@/types/issue';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { MapType } from 'react-native-maps';
import { PotholeHotspotModal } from '@/components/map/PotholeHotspotModal';
import { AirQualityModal } from '@/components/map/AirQualityModal';
import { PotholePredictionHotspot } from '@/services/analytics/potholePredictionService';
import { fetchLiveAirQuality, AirQualityData } from '@/services/analytics/airQualityService';
import { openGoogleStreetView } from '@/services/location/streetViewService';
import { DEFAULT_REGION } from '@/constants/mockData';
import {
  Search,
  Layers,
  LocateFixed,
  Flame,
  ChevronDown,
  Plus,
  Check,
  Filter,
  Activity,
  CloudRain,
  Wind,
  Eye,
} from 'lucide-react-native';

export default function ModernMapScreen() {
  const insets = useSafeAreaInsets();
  const { issues, activeIssues } = useIssues();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'urgent' | 'active' | 'resolved'>('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationResult | null>(null);

  // Map Controls State
  const [mapType, setMapType] = useState<MapType>('standard');
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);

  // Rain & Pothole Predictive Hotspots State
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<PotholePredictionHotspot | null>(null);

  // Live Air Quality (AQI) State
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [showAqiModal, setShowAqiModal] = useState<boolean>(false);

  useEffect(() => {
    async function loadAqi() {
      const lat = userLocation?.latitude || DEFAULT_REGION.latitude;
      const lng = userLocation?.longitude || DEFAULT_REGION.longitude;
      const data = await fetchLiveAirQuality(lat, lng);
      setAirQuality(data);
    }
    loadAqi();
  }, [userLocation?.latitude, userLocation?.longitude]);

  const carouselRef = useRef<MapIssueCarouselRef>(null);

  useEffect(() => {
    async function initLocation() {
      // 1. Instant cache load
      const cached = await getLastKnownLocation();
      if (cached) {
        setUserLocation(cached);
      }

      // 2. High-precision live GPS
      const res = await getCurrentLocation();
      if (res.location) {
        setUserLocation(res.location);
      }
    }
    initLocation();
  }, []);

  // Top Left Button 1: Cycle Map Type
  const handleToggleMapLayers = () => {
    setMapType((prev) => (prev === 'standard' ? 'satellite' : prev === 'satellite' ? 'hybrid' : 'standard'));
  };

  // Top Left Button 2: Re-center to live GPS
  const handleRecenterGPS = () => {
    setRecenterTrigger(Date.now());
  };

  // Top Left Button 3: Toggle Urgent filter
  const handleToggleUrgent = () => {
    setUrgentOnly((prev) => !prev);
  };

  // Filter issues based on search, category, status, and urgent toggle
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      !searchQuery.trim() ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      selectedCategory === 'all' || issue.category === selectedCategory;

    const isUrgent = (issue.priorityScore || 50) >= 80;
    if (urgentOnly && !isUrgent) return false;

    if (statusFilter === 'urgent' && !isUrgent) return false;
    if (statusFilter === 'active' && issue.status !== 'active') return false;
    if (statusFilter === 'resolved' && issue.status !== 'resolved') return false;

    return matchesSearch && matchesCategory;
  });

  // Calculate live telemetry counts
  const activeCount = issues.filter((i) => i.status === 'active').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  const handleSelectIssueFromMap = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
    if (carouselRef.current) {
      carouselRef.current.scrollToIssue(issue.id);
    }
  };

  const handleActiveIssueChangeFromCarousel = (issue: CivicIssue) => {
    setSelectedIssueId(issue.id);
  };

  const handleViewDetails = (issueId: string) => {
    router.push(`/issue/${issueId}`);
  };

  return (
    <View style={styles.container}>
      {/* Full-Screen Vector Map */}
      <CivicMapView
        issues={filteredIssues}
        selectedIssueId={selectedIssueId}
        onSelectIssue={handleSelectIssueFromMap}
        userCoords={userLocation}
        mapType={mapType}
        recenterTrigger={recenterTrigger}
        showHotspots={showHotspots}
        onSelectHotspot={(hs) => setSelectedHotspot(hs)}
      />

      {/* Floating Top Search & Category HUD */}
      <View
        style={[
          styles.floatingTopContainer,
          { paddingTop: insets.top + (Platform.OS === 'ios' ? 6 : 10) },
        ]}
      >
        {/* Unified Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textSecondary} style={styles.searchIcon} />

          <TextInput
            style={styles.searchInput}
            placeholder="Search area, road, or issue..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />

          {/* Live Air Quality Chip */}
          {airQuality && (
            <TouchableOpacity
              style={styles.aqiChip}
              onPress={() => setShowAqiModal(true)}
              activeOpacity={0.8}
            >
              <View style={[styles.aqiDot, { backgroundColor: airQuality.color }]} />
              <Text style={styles.aqiText}>AQI {airQuality.aqi}</Text>
            </TouchableOpacity>
          )}

          {/* Status Filter Toggle Button */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              statusFilter !== 'all' && styles.filterBtnActive,
            ]}
            onPress={() => setShowStatusDropdown((prev) => !prev)}
            activeOpacity={0.8}
          >
            <Filter
              size={16}
              color={statusFilter !== 'all' ? COLORS.primary : COLORS.textSecondary}
            />
            {statusFilter !== 'all' && <View style={styles.filterActiveDot} />}
          </TouchableOpacity>
        </View>

        {/* Status Filter Dropdown Menu */}
        {showStatusDropdown && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={[styles.dropdownItem, statusFilter === 'all' && styles.dropdownItemActive]}
              onPress={() => {
                setStatusFilter('all');
                setShowStatusDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, statusFilter === 'all' && styles.dropdownItemTextActive]}>
                All Reports ({issues.length})
              </Text>
              {statusFilter === 'all' && <Check size={14} color={COLORS.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, statusFilter === 'urgent' && styles.dropdownItemActive]}
              onPress={() => {
                setStatusFilter('urgent');
                setShowStatusDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, statusFilter === 'urgent' && styles.dropdownItemTextActive]}>
                Urgent Only
              </Text>
              {statusFilter === 'urgent' && <Check size={14} color={COLORS.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, statusFilter === 'active' && styles.dropdownItemActive]}
              onPress={() => {
                setStatusFilter('active');
                setShowStatusDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, statusFilter === 'active' && styles.dropdownItemTextActive]}>
                Active ({activeCount})
              </Text>
              {statusFilter === 'active' && <Check size={14} color={COLORS.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownItem, statusFilter === 'resolved' && styles.dropdownItemActive]}
              onPress={() => {
                setStatusFilter('resolved');
                setShowStatusDropdown(false);
              }}
            >
              <Text style={[styles.dropdownItemText, statusFilter === 'resolved' && styles.dropdownItemTextActive]}>
                Resolved ({resolvedCount})
              </Text>
              {statusFilter === 'resolved' && <Check size={14} color={COLORS.primary} />}
            </TouchableOpacity>
          </View>
        )}

        {/* Horizontal Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'all' && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === 'all' && styles.categoryChipTextActive,
              ]}
            >
              All ({issues.length})
            </Text>
          </TouchableOpacity>

          {CATEGORY_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = issues.filter((i) => i.category === cat.id).length;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Floating Map Controls (Right Side Tool Stack) */}
      <View
        style={[
          styles.mapToolStack,
          { top: insets.top + (Platform.OS === 'ios' ? 116 : 124) },
        ]}
      >
        <TouchableOpacity
          style={styles.mapToolBtn}
          onPress={handleToggleMapLayers}
          activeOpacity={0.8}
          accessibilityLabel="Toggle Map Layers"
        >
          <Layers size={17} color={COLORS.textPrimary} strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapToolBtn}
          onPress={handleRecenterGPS}
          activeOpacity={0.8}
          accessibilityLabel="Recenter GPS"
        >
          <LocateFixed size={17} color={COLORS.primary} strokeWidth={2.2} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mapToolBtn,
            showHotspots && styles.mapToolBtnActive,
          ]}
          onPress={() => setShowHotspots(!showHotspots)}
          activeOpacity={0.8}
          accessibilityLabel="Toggle Rain and Hazard Predictions"
        >
          <CloudRain
            size={17}
            color={showHotspots ? COLORS.primary : COLORS.textMuted}
            strokeWidth={2}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mapToolBtn,
            urgentOnly && styles.mapToolBtnActiveUrgent,
          ]}
          onPress={handleToggleUrgent}
          activeOpacity={0.8}
          accessibilityLabel="Filter Urgent Hazards"
        >
          <Flame
            size={17}
            color={urgentOnly ? '#FFFFFF' : COLORS.error}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Issue Carousel */}
      {filteredIssues.length > 0 ? (
        <MapIssueCarousel
          ref={carouselRef}
          issues={filteredIssues}
          userCoords={userLocation}
          onPressIssue={handleViewDetails}
          onActiveIssueChange={handleActiveIssueChangeFromCarousel}
        />
      ) : (
        <View style={[styles.emptyFilterCard, { bottom: insets.bottom + 84 }]}>
          <Text style={styles.emptyFilterText}>No issues match your current filters</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory('all');
              setStatusFilter('all');
              setUrgentOnly(false);
              setSearchQuery('');
            }}
          >
            <Text style={styles.emptyFilterAction}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Predictive Hotspot Modal */}
      <PotholeHotspotModal
        hotspot={selectedHotspot}
        visible={Boolean(selectedHotspot)}
        onClose={() => setSelectedHotspot(null)}
        onReportEarlyHazard={(hs) => {
          router.push({
            pathname: '/report',
            params: {
              category: 'pothole',
              locationName: hs.locationName,
              latitude: String(hs.latitude),
              longitude: String(hs.longitude),
            },
          });
        }}
      />

      {/* Air Quality Modal */}
      <AirQualityModal
        data={airQuality}
        visible={showAqiModal}
        onClose={() => setShowAqiModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  floatingTopContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 10,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: COLORS.textPrimary,
    fontWeight: '400',
    paddingVertical: 0,
  },
  aqiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 5,
    marginRight: 6,
  },
  aqiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aqiText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  filterBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: '#BFDBFE',
  },
  filterActiveDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.large,
    gap: 2,
    zIndex: 50,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: RADIUS.xs,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  dropdownItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoryPillsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.subtle,
  },
  categoryChipActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mapToolStack: {
    position: 'absolute',
    right: 16,
    gap: 6,
    zIndex: 20,
  },
  mapToolBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.xs,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  mapToolBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: '#BFDBFE',
  },
  mapToolBtnActiveUrgent: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  emptyFilterCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.medium,
    zIndex: 25,
  },
  emptyFilterText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyFilterAction: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
