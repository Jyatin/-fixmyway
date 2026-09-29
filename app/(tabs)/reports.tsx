import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { IssueCompactCard } from '@/components/cards/IssueCompactCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { ScrollText, Plus, CircleCheck, Circle } from 'lucide-react-native';

export default function ModernMyReportsScreen() {
  const insets = useSafeAreaInsets();
  const { myReports, refreshIssues, isLoading } = useIssues();
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'resolved'>('all');

  const activeCount = myReports.filter((r) => r.status === 'active').length;
  const resolvedCount = myReports.filter((r) => r.status === 'resolved').length;
  const filtered = myReports.filter((r) => statusTab === 'all' || r.status === statusTab);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 6) }]}>
        <View style={styles.topLine}>
          <View style={styles.icon}><ScrollText size={19} color={COLORS.primary} strokeWidth={1.9} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>LOGBOOK</Text>
            <Text style={styles.title}>Your civic trail.</Text>
            <Text style={styles.subtitle}>Everything you've noticed, reported and helped move forward.</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/report')} activeOpacity={0.85}><Plus size={20} color="#FFFFFF" /></TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View><Text style={styles.summaryNumber}>{myReports.length}</Text><Text style={styles.summaryLabel}>reports</Text></View>
          <View style={styles.summaryDivider} />
          <View><Text style={[styles.summaryNumber, { color: COLORS.primary }]}>{activeCount}</Text><Text style={styles.summaryLabel}>in progress</Text></View>
          <View style={styles.summaryDivider} />
          <View><Text style={[styles.summaryNumber, { color: COLORS.success }]}>{resolvedCount}</Text><Text style={styles.summaryLabel}>fixed</Text></View>
        </View>

        <View style={styles.filters}>
          {(['all', 'active', 'resolved'] as const).map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setStatusTab(tab)} style={[styles.filter, statusTab === tab && styles.filterActive]}>
              <Text style={[styles.filterText, statusTab === tab && styles.filterTextActive]}>{tab === 'all' ? `All ${myReports.length}` : tab === 'active' ? `Active ${activeCount}` : `Fixed ${resolvedCount}`}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.timelineItem}>
            <View style={styles.timelineRail}>
              {item.status === 'resolved' ? <CircleCheck size={18} color={COLORS.success} /> : <Circle size={18} color={COLORS.primary} />}
              {index < filtered.length - 1 && <View style={styles.railLine} />}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineLabel}>{item.status === 'resolved' ? 'RECENTLY FIXED' : 'NEEDS ATTENTION'}</Text>
              <IssueCompactCard issue={item} onPress={(id) => router.push(`/issue/${id}`)} />
            </View>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 108 }]}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshIssues} tintColor={COLORS.primary} />}
        ListEmptyComponent={<View style={styles.empty}><EmptyState title={statusTab === 'all' ? 'Your trail starts here.' : `No ${statusTab} reports`} description={statusTab === 'all' ? 'Spot something that needs attention and add your first report.' : 'Nothing is currently in this part of your logbook.'} actionTitle="Report an issue" onAction={() => router.push('/(tabs)/report')} /></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  topLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 1.2 },
  title: { ...TYPOGRAPHY.display, fontSize: 30, lineHeight: 36, color: COLORS.textPrimary, marginTop: 2 },
  subtitle: { color: COLORS.textSecondary, fontSize: 12.5, lineHeight: 18, marginTop: 5, maxWidth: 285 },
  addButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
  summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 20, paddingVertical: 14, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, ...SHADOWS.card },
  summaryNumber: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '600', textAlign: 'center' },
  summaryLabel: { color: COLORS.textMuted, fontSize: 10.5, marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  filters: { flexDirection: 'row', gap: 7, marginTop: 12 },
  filter: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: RADIUS.full, backgroundColor: COLORS.surface },
  filterActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textSecondary, fontSize: 10.5, fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  timelineItem: { flexDirection: 'row', gap: 11 },
  timelineRail: { width: 20, alignItems: 'center' },
  railLine: { flex: 1, width: 1, backgroundColor: COLORS.border, marginTop: 5 },
  timelineContent: { flex: 1, paddingBottom: 18 },
  timelineLabel: { color: COLORS.textMuted, fontSize: 9.5, fontWeight: '600', letterSpacing: 0.9, marginBottom: 7 },
  empty: { paddingTop: 35, alignItems: 'center' },
});
