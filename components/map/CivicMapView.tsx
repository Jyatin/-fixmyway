import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { CivicIssue } from '@/types/issue';
import { IssueMarker } from './IssueMarker';
import { DEFAULT_REGION } from '@/constants/mockData';
import { COLORS, SHADOWS } from '@/constants/theme';
import {
  predictPotholeHotspots,
  PotholePredictionHotspot,
  RainfallAnalyticsSummary,
} from '@/services/analytics/potholePredictionService';

interface CivicMapViewProps {
  issues: CivicIssue[];
  selectedIssueId?: string | null;
  onSelectIssue: (issue: CivicIssue) => void;
  userCoords?: { latitude: number; longitude: number } | null;
  mapType?: MapType;
  recenterTrigger?: number;
  showHotspots?: boolean;
  onSelectHotspot?: (hotspot: PotholePredictionHotspot) => void;
}

const PREMIUM_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F1F3EE' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#777C76' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F1F3EE' }, { weight: 2 }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#D9DDD6' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#E6F0E5' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E5E7E2' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F6F4EF' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#E2E3DE' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#DCE9E8' }] },
];

export const CivicMapView: React.FC<CivicMapViewProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  userCoords,
  mapType = 'standard',
  recenterTrigger,
  showHotspots = true,
  onSelectHotspot,
}) => {
  const mapRef = useRef<MapView>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [potholeAnalytics, setPotholeAnalytics] = useState<RainfallAnalyticsSummary | null>(null);

  useEffect(() => {
    async function loadPredictiveHotspots() {
      const lat = userCoords?.latitude || DEFAULT_REGION.latitude;
      const lng = userCoords?.longitude || DEFAULT_REGION.longitude;
      try {
        const summary = await predictPotholeHotspots(lat, lng, issues);
        setPotholeAnalytics(summary);
      } catch (e) {
        console.warn('Failed to load pothole predictions:', e);
      }
    }
    loadPredictiveHotspots();
  }, [userCoords?.latitude, userCoords?.longitude, issues.length]);

  const isExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
    Constants.appOwnership === 'expo';
  void isExpoGo;

  const initialRegion: Region = {
    latitude: userCoords?.latitude || DEFAULT_REGION.latitude,
    longitude: userCoords?.longitude || DEFAULT_REGION.longitude,
    latitudeDelta: DEFAULT_REGION.latitudeDelta,
    longitudeDelta: DEFAULT_REGION.longitudeDelta,
  };

  const hasAutoCentered = useRef<boolean>(false);

  useEffect(() => {
    if (userCoords && mapRef.current && !hasAutoCentered.current) {
      hasAutoCentered.current = true;
      mapRef.current.animateToRegion({
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.018,
        longitudeDelta: 0.018,
      }, 700);
    }
  }, [userCoords?.latitude, userCoords?.longitude]);

  useEffect(() => {
    if (recenterTrigger && mapRef.current) {
      const target = userCoords || {
        latitude: DEFAULT_REGION.latitude,
        longitude: DEFAULT_REGION.longitude,
      };
      mapRef.current.animateToRegion({
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: 0.018,
        longitudeDelta: 0.018,
      }, 600);
    }
  }, [recenterTrigger]);

  useEffect(() => {
    if (selectedIssueId && mapRef.current) {
      const targetIssue = issues.find((i) => i.id === selectedIssueId);
      if (targetIssue) {
        mapRef.current.animateToRegion({
          latitude: targetIssue.latitude,
          longitude: targetIssue.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }, 450);
      }
    }
  }, [selectedIssueId]);

  const handleRegionChangeComplete = (region: Region) => {
    const delta = region.latitudeDelta;
    if (delta < 0.012) setZoomScale(1.4);
    else if (delta < 0.025) setZoomScale(1.15);
    else if (delta < 0.055) setZoomScale(1.0);
    else if (delta < 0.12) setZoomScale(0.8);
    else setZoomScale(0.65);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        mapType={mapType}
        customMapStyle={mapType === 'standard' ? PREMIUM_MAP_STYLE : undefined}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={Boolean(userCoords)}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
      >
        {showHotspots && potholeAnalytics?.hotspots.map((hs) => {
          const isCritical = hs.riskLevel === 'CRITICAL';
          const isHigh = hs.riskLevel === 'HIGH';
          const strokeColor = isCritical ? COLORS.error : isHigh ? COLORS.warning : COLORS.warning;
          const fillColor = isCritical
            ? 'rgba(217,92,85,0.12)'
            : isHigh
              ? 'rgba(233,162,59,0.12)'
              : 'rgba(233,162,59,0.08)';

          return (
            <React.Fragment key={hs.id}>
              <Circle
                center={{ latitude: hs.latitude, longitude: hs.longitude }}
                radius={hs.radiusMeters}
                fillColor={fillColor}
                strokeColor={strokeColor}
                strokeWidth={1}
              />
              <Marker
                coordinate={{ latitude: hs.latitude, longitude: hs.longitude }}
                onPress={() => onSelectHotspot?.(hs)}
                zIndex={90}
              >
                <View style={styles.hotspotBadge}>
                  <View style={[styles.hotspotDot, { backgroundColor: strokeColor }]} />
                  <Text style={styles.hotspotText}>{hs.riskScore}% risk</Text>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}

        {issues.map((issue) => {
          const isSelected = issue.id === selectedIssueId;
          return (
            <Marker
              key={issue.id}
              coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
              onPress={() => onSelectIssue(issue)}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={isSelected}
              zIndex={isSelected ? 999 : issue.status === 'resolved' ? 10 : (issue.priorityScore || 50)}
            >
              <IssueMarker issue={issue} isSelected={isSelected} zoomScale={zoomScale} />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
  hotspotBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...SHADOWS.small,
  },
  hotspotDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  hotspotText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
