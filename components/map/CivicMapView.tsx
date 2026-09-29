import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
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

/**
 * Real map styling — this is still the live Google/Apple map canvas and
 * real road/building geometry, not an illustrated or generated background.
 * The styling only reduces visual noise so the FixMyWay UI can sit above it.
 */
const REALISTIC_LIGHT_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F3F2EE' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6E746F' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F3F2EE' }, { weight: 2 }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#D4D6D1' }] },
  { featureType: 'administrative.land_parcel', elementType: 'geometry.stroke', stylers: [{ color: '#E4E3DE' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#E5EFE3' }] },
  { featureType: 'landscape.natural.landcover', elementType: 'geometry', stylers: [{ color: '#E8F0E5' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#E7ECE4' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#8A918A' }] },
  { featureType: 'poi.business', elementType: 'labels.text.fill', stylers: [{ color: '#8A918A' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E1E1DC' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6F746F' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#FBFAF7' }] },
  { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#DCDDD7' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F4E7C7' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#DECDA6' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#6C6E68' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#E8E8E2' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#858A85' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D9E7E7' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7D9291' }] },
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
        // Android uses the configured Google Maps provider. iOS keeps its
        // native provider unless Google Maps is explicitly configured there.
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        mapType={mapType}
        customMapStyle={mapType === 'standard' ? REALISTIC_LIGHT_MAP_STYLE : undefined}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation={Boolean(userCoords)}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings
        showsTraffic={false}
        showsIndoors={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        pitchEnabled
        rotateEnabled
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
