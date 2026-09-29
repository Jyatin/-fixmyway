import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CivicIssue } from '@/types/issue';
import { CATEGORIES } from '@/constants/categories';
import { COLORS, SHADOWS } from '@/constants/theme';
import { Lightbulb, TriangleAlert, BadgeCheck, CircleDotDashed, Recycle, Construction } from 'lucide-react-native';

interface IssueMarkerProps { issue: CivicIssue; isSelected?: boolean; zoomScale?: number; }

export const IssueMarker: React.FC<IssueMarkerProps> = ({ issue, isSelected = false, zoomScale = 1 }) => {
  const resolved = issue.status === 'resolved';
  const meta = CATEGORIES[issue.category] || CATEGORIES.other;
  const critical = (issue.priorityScore || 50) >= 80 && !resolved;
  const color = resolved ? COLORS.success : critical ? COLORS.error : meta.color || COLORS.primary;
  const size = Math.max(13, Math.min(19, Math.round(15 * Math.min(1.22, Math.max(0.9, zoomScale)))));

  const icon = () => {
    if (resolved) return <BadgeCheck size={size} color="#FFFFFF" strokeWidth={2.2} />;
    switch (issue.category) {
      case 'pothole': return <CircleDotDashed size={size} color="#FFFFFF" strokeWidth={2.2} />;
      case 'garbage': return <Recycle size={size} color="#FFFFFF" strokeWidth={2.1} />;
      case 'streetlight': return <Lightbulb size={size} color="#FFFFFF" strokeWidth={2.1} />;
      case 'road_damage': return <Construction size={size} color="#FFFFFF" strokeWidth={2.1} />;
      default: return <TriangleAlert size={size} color="#FFFFFF" strokeWidth={2.1} />;
    }
  };

  return (
    <View style={styles.container}>
      {isSelected && <View style={[styles.halo, { borderColor: color }]} />}
      <View style={[styles.marker, { backgroundColor: color, width: isSelected ? 38 : 32, height: isSelected ? 38 : 32, borderRadius: isSelected ? 19 : 16 }]}>
        {icon()}
        {critical && <View style={styles.urgentDot} />}
      </View>
      <View style={[styles.tail, { borderTopColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 54, height: 54, borderRadius: 27, borderWidth: 2, backgroundColor: COLORS.primaryGlow },
  marker: { alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#FFFFFF', ...SHADOWS.medium },
  tail: { width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
  urgentDot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: COLORS.error },
});
