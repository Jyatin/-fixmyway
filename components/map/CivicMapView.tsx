import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { CivicIssue } from '@/types/issue';
import { DEFAULT_REGION } from '@/constants/mockData';
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
  mapType?: 'standard' | 'satellite' | 'hybrid' | string;
  recenterTrigger?: number;
  showHotspots?: boolean;
  onSelectHotspot?: (hotspot: PotholePredictionHotspot) => void;
  selectedMapLocation?: { latitude: number; longitude: number } | null;
  onSelectMapLocation?: (coords: { latitude: number; longitude: number }) => void;
}

export const CivicMapView: React.FC<CivicMapViewProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  userCoords,
  mapType = 'standard',
  recenterTrigger,
  showHotspots = true,
  onSelectHotspot,
  selectedMapLocation,
  onSelectMapLocation,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [potholeAnalytics, setPotholeAnalytics] = useState<RainfallAnalyticsSummary | null>(null);

  const centerLat = userCoords?.latitude || DEFAULT_REGION.latitude;
  const centerLng = userCoords?.longitude || DEFAULT_REGION.longitude;

  useEffect(() => {
    async function loadPredictiveHotspots() {
      try {
        const summary = await predictPotholeHotspots(centerLat, centerLng, issues);
        setPotholeAnalytics(summary);
      } catch (e) {
        console.warn('Failed to load pothole predictions:', e);
      }
    }
    loadPredictiveHotspots();
  }, [centerLat, centerLng, issues.length]);

  const leafletHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: #F7F5F1;
    }
    .leaflet-bar {
      display: none !important;
    }
    .issue-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 17px;
      background: #1B4D3E;
      border: 2px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      color: #FFFFFF;
      font-size: 16px;
    }
    .issue-pin.selected {
      background: #E9A23B;
      transform: scale(1.25);
      z-index: 9999 !important;
    }
    .selected-location-pin {
      width: 36px;
      height: 36px;
      border-radius: 18px;
      background: #16955F;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(22,149,95,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .selected-location-pin::after {
      content: '';
      width: 8px;
      height: 8px;
      background: #FFFFFF;
      border-radius: 4px;
    }
    .user-location-dot {
      width: 20px;
      height: 20px;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 14px rgba(37,99,235,0.7);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.7); }
      70% { box-shadow: 0 0 0 14px rgba(37,99,235,0); }
      100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${centerLat}, ${centerLng}], 15);

    var tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    var currentTileLayer = L.tileLayer(tileUrl, { subdomains: ['a', 'b', 'c'], maxZoom: 19 }).addTo(map);

    var markersGroup = L.layerGroup().addTo(map);
    var hotspotsGroup = L.layerGroup().addTo(map);
    var userLocationMarker = null;
    var selectedLocationMarker = null;

    function sendToRN(type, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
      }
    }

    map.on('click', function(e) {
      sendToRN('map_click', { latitude: e.latlng.lat, longitude: e.latlng.lng });
    });

    window.updateMapData = function(payload) {
      if (!payload) return;

      if (payload.tileType) {
        map.removeLayer(currentTileLayer);
        var url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        if (payload.tileType === 'satellite' || payload.tileType === 'hybrid') {
          url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        }
        currentTileLayer = L.tileLayer(url, { subdomains: ['a', 'b', 'c'], maxZoom: 19 }).addTo(map);
      }

      if (payload.center) {
        map.flyTo([payload.center.latitude, payload.center.longitude], 15, { duration: 0.8 });
      }

      if (payload.userCoords) {
        if (userLocationMarker) map.removeLayer(userLocationMarker);
        var userIcon = L.divIcon({ className: 'user-location-dot', iconSize: [20, 20], iconAnchor: [10, 10] });
        userLocationMarker = L.marker([payload.userCoords.latitude, payload.userCoords.longitude], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
      }

      if (payload.selectedMapLocation) {
        if (selectedLocationMarker) map.removeLayer(selectedLocationMarker);
        var selectedIcon = L.divIcon({ className: 'selected-location-pin', iconSize: [36, 36], iconAnchor: [18, 18] });
        selectedLocationMarker = L.marker([payload.selectedMapLocation.latitude, payload.selectedMapLocation.longitude], { icon: selectedIcon, zIndexOffset: 3000 }).addTo(map);
      } else if (selectedLocationMarker) {
        map.removeLayer(selectedLocationMarker);
        selectedLocationMarker = null;
      }

      markersGroup.clearLayers();
      if (payload.issues && payload.issues.length) {
        payload.issues.forEach(function(issue) {
          var isSelected = issue.id === payload.selectedIssueId;
          var pinClass = isSelected ? 'issue-pin selected' : 'issue-pin';
          var icon = L.divIcon({
            className: pinClass,
            html: '📍',
            iconSize: [34, 34],
            iconAnchor: [17, 17]
          });
          var m = L.marker([issue.latitude, issue.longitude], { icon: icon });
          m.on('click', function(e) {
            L.DomEvent.stopPropagation(e);
            sendToRN('issue_select', issue);
          });
          markersGroup.addLayer(m);
        });
      }

      hotspotsGroup.clearLayers();
      if (payload.showHotspots && payload.hotspots && payload.hotspots.length) {
        payload.hotspots.forEach(function(hs) {
          var color = hs.riskLevel === 'CRITICAL' ? '#D95C55' : '#E9A23B';
          var circle = L.circle([hs.latitude, hs.longitude], {
            color: color,
            fillColor: color,
            fillOpacity: 0.18,
            radius: hs.radiusMeters || 120
          });
          hotspotsGroup.addLayer(circle);
        });
      }
    };

    setTimeout(function() {
      sendToRN('map_ready', {});
    }, 200);
  </script>
</body>
</html>
  `;

  useEffect(() => {
    if (isMapReady && webViewRef.current) {
      const payload = {
        tileType: mapType,
        center: userCoords || { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude },
        userCoords,
        selectedMapLocation,
        selectedIssueId,
        issues,
        showHotspots,
        hotspots: potholeAnalytics?.hotspots || [],
      };
      webViewRef.current.injectJavaScript(`
        if (window.updateMapData) {
          window.updateMapData(${JSON.stringify(payload)});
        }
        true;
      `);
    }
  }, [
    isMapReady,
    mapType,
    userCoords?.latitude,
    userCoords?.longitude,
    selectedMapLocation?.latitude,
    selectedMapLocation?.longitude,
    selectedIssueId,
    issues,
    showHotspots,
    potholeAnalytics,
  ]);

  useEffect(() => {
    if (isMapReady && recenterTrigger && webViewRef.current) {
      const target = userCoords || { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude };
      webViewRef.current.injectJavaScript(`
        if (window.map) {
          window.map.flyTo([${target.latitude}, ${target.longitude}], 15, { duration: 0.8 });
        }
        true;
      `);
    }
  }, [recenterTrigger, isMapReady]);

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'map_ready') {
        setIsMapReady(true);
      } else if (msg.type === 'map_click') {
        onSelectMapLocation?.(msg.data);
      } else if (msg.type === 'issue_select') {
        onSelectIssue(msg.data);
      } else if (msg.type === 'hotspot_select') {
        onSelectHotspot?.(msg.data);
      }
    } catch (e) {
      console.warn('Failed to parse map WebView message:', e);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        onMessage={handleMessage}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  map: { width: '100%', height: '100%', backgroundColor: '#F7F5F1' },
});
