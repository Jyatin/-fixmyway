import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { ChevronRight, CircleCheck, CircleDot, Plus } from 'lucide-react-native';
import { formatRelativeTime } from '@/utils/formatters';

export default function ModernMyReportsScreen() {
  const insets = useSafeAreaInsets();
  const { myReports, refreshIssues, isLoading } = useIssues();
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'resolved'>('all');

  const activeCount = myReports.filter((r) => r.status === 'active').length;
  const resolvedCount = myReports.filter((r) => r.status === 'resolved').length;
  const filteredReports = useMemo(() => myReports.filter((report) => statusTab === 'all' || report.status === statusTab), [myReports, statusTab]);

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + (Platform.OS === 'android' ? 12 : 8), paddingBottom: insets.bottom + 110 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshIssues} tintColor={COLORS.primary} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>LOGBOOK</Text>
            <Text style={styles.title}>What you've{`\n`}contributed.</Text>
            <Text style={styles.subtitle}>A quiet record of the places you've helped your community notice.</Text>
            <View style={styles.statsRow}>
              <View><Text style={styles.statNumber}>{myReports.length}</Text><Text style={styles.statLabel}>reports</Text></View>
              <View><Text style={styles.statNumber}>{activeCount}</Text><Text style={styles.statLabel}>active</Text></View>
              <View><Text style={[styles.statNumber, { color: COLORS.success }]}>{resolvedCount}</Text><Text style={styles.statLabel}>resolved</Text></View>
            </View>
            <View style={styles.filters}>
              {([['all', 'All'], ['active', 'Needs attention'], ['resolved', 'Recently fixed']] as const).map(([value, label]) => (
                <TouchableOpacity key={value} style={[styles.filter, statusTab === value && styles.filterSelected]} onPress={() => setStatusTab(value)}>
                  <Text style={[styles.filterText, statusTab === value && styles.filterTextSelected]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sectionTitle}>Your activity</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity style={styles.timelineItem} activeOpacity={0.9} onPress={() => router.push(`/issue/${item.id}`)}>
            <View style={styles.timelineRail}>
              <View style={[styles.timelineDot, item.status === 'resolved' && styles.timelineDotResolved]}>
                {item.status === 'resolved' ? <CircleCheck size={13} color="#FFFFFF" /> : <CircleDot size={13} color="#FFFFFF" />}
              </View>
              {index < filteredReports.length - 1 && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.activityCard}>
              <View style={styles.activityTop}>
                <Text style={styles.activityDate}>{formatRelativeTime(item.createdAt).toUpperCase()}</Text>
                <ChevronRight size={16} color={COLORS.textMuted} />
              </View>
              <View style={styles.activityBody}>
                {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} /> : <View style={styles.thumbnailPlaceholder} />}
                <View style={styles.activityText}>
                  <Text style={styles.category}>{item.category.replace('_', ' ')}</Text>
                  <Text style={styles.activityTitle} numberOfLines={2}>{item.description || 'Civic issue reported'}</Text>
                  <Text style={styles.activityLocation} numberOfLines={1}>{item.locationName || 'Nearby location'}</Text>
                </View>
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: item.status === 'resolved' ? COLORS.success : COLORS.primary }]} />
                <Text style={styles.statusText}>{item.status === 'resolved' ? 'Recently fixed' : 'Needs attention'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your logbook is waiting.</Text>
            <Text style={styles.emptyText}>Spot something that needs fixing and make the first entry.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/report')}>
              <Plus size={18} color="#FFFFFF" /><Text style={styles.emptyButtonText}>Report an issue</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  eyebrow: { ...TYPOGRAPHY.label, color: COLORS.primaryDark, marginBottom: 10 },
  title: { ...TYPOGRAPHY.displaySmall, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 10, maxWidth: 335 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 27, paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statNumber: { color: COLORS.textPrimary, fontSize: 25, fontWeight: '600' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 20 },
  filter: { height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: COLORS.surface, justifyContent: 'center' },
  filterSelected: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 11.5, fontWeight: '500' },
  filterTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 19, fontWeight: '600', marginTop: 30 },
  timelineItem: { flexDirection: 'row', paddingHorizontal: 20 },
  timelineRail: { width: 26, alignItems: 'center' },
  timelineDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  timelineDotResolved: { backgroundColor: COLORS.success },
  timelineLine: { width: 1, flex: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  activityCard: { flex: 1, marginLeft: 12, marginBottom: 14, padding: 16, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, ...SHADOWS.card },
  activityTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityDate: { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontSize: 9.5 },
  activityBody: { flexDirection: 'row', marginTop: 12, gap: 12 },
  thumbnail: { width: 58, height: 58, borderRadius: 13, backgroundColor: COLORS.surfaceHighlight },
  thumbnailPlaceholder: { width: 58, height: 58, borderRadius: 13, backgroundColor: COLORS.primaryLight },
  activityText: { flex: 1 },
  category: { color: COLORS.primaryDark, fontSize: 9.5, fontWeight: '700', letterSpacing: 1 },
  activityTitle: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 19, fontWeight: '500', marginTop: 4 },
  activityLocation: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '500' },
  empty: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 55 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 21, fontWeight: '500', textAlign: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  emptyButton: { marginTop: 22, height: 52, paddingHorizontal: 20, borderRadius: 16, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', gap: 7 },
  emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
