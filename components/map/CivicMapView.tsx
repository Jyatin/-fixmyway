import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region, MapType } from 'react-native-maps';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { CivicIssue } from '@/types/issue';
import { IssueMarker } from './IssueMarker';
import { DEFAULT_REGION } from '@/constants/mockData';
import { predictPotholeHotspots, PotholePredictionHotspot, RainfallAnalyticsSummary } from '@/services/analytics/potholePredictionService';

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
  { elementType: 'labels.text.fill', stylers: [{ color: '#7A807A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F1F3EE' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#DDE2DA' }] },
  { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ color: '#DDEFE1' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'on' }, { color: '#D7ECD9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FAF9F5' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E6E5DF' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#E9E7DF' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#DAD8D0' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D8ECEA' }] },
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
  const [zoomScale, setZoomScale] = useState(1);
  const [potholeAnalytics, setPotholeAnalytics] = useState<RainfallAnalyticsSummary | null>(null);
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient || Constants.appOwnership === 'expo';

  useEffect(() => {
    const load = async () => {
      const lat = userCoords?.latitude || DEFAULT_REGION.latitude;
      const lng = userCoords?.longitude || DEFAULT_REGION.longitude;
      try { setPotholeAnalytics(await predictPotholeHotspots(lat, lng, issues)); } catch (error) { console.warn('Failed to load pothole predictions:', error); }
    };
    load();
  }, [userCoords?.latitude, userCoords?.longitude, issues.length]);

  const initialRegion: Region = {
    latitude: userCoords?.latitude || DEFAULT_REGION.latitude,
    longitude: userCoords?.longitude || DEFAULT_REGION.longitude,
    latitudeDelta: DEFAULT_REGION.latitudeDelta,
    longitudeDelta: DEFAULT_REGION.longitudeDelta,
  };

  const centered = useRef(false);
  useEffect(() => {
    if (userCoords && mapRef.current && !centered.current) {
      centered.current = true;
      mapRef.current.animateToRegion({ latitude: userCoords.latitude, longitude: userCoords.longitude, latitudeDelta: 0.018, longitudeDelta: 0.018 }, 700);
    }
  }, [userCoords?.latitude, userCoords?.longitude]);

  useEffect(() => {
    if (recenterTrigger && mapRef.current) {
      const target = userCoords || { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude };
      mapRef.current.animateToRegion({ latitude: target.latitude, longitude: target.longitude, latitudeDelta: 0.018, longitudeDelta: 0.018 }, 600);
    }
  }, [recenterTrigger]);

  useEffect(() => {
    if (selectedIssueId && mapRef.current) {
      const issue = issues.find((item) => item.id === selectedIssueId);
      if (issue) mapRef.current.animateToRegion({ latitude: issue.latitude, longitude: issue.longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 }, 450);
    }
  }, [selectedIssueId]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        mapType={mapType}
        customMapStyle={Platform.OS === 'android' && mapType === 'standard' && !isExpoGo ? PREMIUM_MAP_STYLE : undefined}
        onRegionChangeComplete={(region) => setZoomScale(region.latitudeDelta < 0.012 ? 1.4 : region.latitudeDelta < 0.025 ? 1.15 : region.latitudeDelta < 0.055 ? 1 : 0.82)}
        showsUserLocation={Boolean(userCoords)}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        rotateEnabled
      >
        {showHotspots && potholeAnalytics?.hotspots.map((hs) => {
          const critical = hs.riskLevel === 'CRITICAL';
          const high = hs.riskLevel === 'HIGH';
          const strokeColor = critical ? '#D95C55' : high ? '#E9A23B' : '#D6B54C';
          const fillColor = critical ? 'rgba(217,92,85,0.12)' : high ? 'rgba(233,162,59,0.10)' : 'rgba(214,181,76,0.08)';
          return (
            <React.Fragment key={hs.id}>
              <Circle center={{ latitude: hs.latitude, longitude: hs.longitude }} radius={hs.radiusMeters} fillColor={fillColor} strokeColor={strokeColor} strokeWidth={1.5} />
              <Marker coordinate={{ latitude: hs.latitude, longitude: hs.longitude }} onPress={() => onSelectHotspot?.(hs)} zIndex={90}>
                <View style={[styles.hotspotBadge, { backgroundColor: strokeColor }]}><Text style={styles.hotspotText}>{hs.riskScore}% risk</Text></View>
              </Marker>
            </React.Fragment>
          );
        })}
        {issues.map((issue) => {
          const selected = issue.id === selectedIssueId;
          return (
            <Marker key={issue.id} coordinate={{ latitude: issue.latitude, longitude: issue.longitude }} onPress={() => onSelectIssue(issue)} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={selected} zIndex={selected ? 999 : issue.status === 'resolved' ? 10 : (issue.priorityScore || 50)}>
              <IssueMarker issue={issue} isSelected={selected} zoomScale={zoomScale} />
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
  hotspotBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, alignItems: 'center', justifyContent: 'center', shadowColor: '#171817', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 7, elevation: 4 },
  hotspotText: { fontSize: 9.5, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.1 },
});
