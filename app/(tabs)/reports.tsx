import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { IssueCompactCard } from '@/components/cards/IssueCompactCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { CivicIssue } from '@/types/issue';
import { COLORS, RADIUS, SPACING, SHADOWS } from '@/constants/theme';
import { ScrollText, Plus } from 'lucide-react-native';

export default function ModernMyReportsScreen() {
  const insets = useSafeAreaInsets();
  const { myReports, refreshIssues, isLoading } = useIssues();
  const { user } = useAuth();
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'resolved'>('all');

  const activeCount = myReports.filter((r) => r.status === 'active').length;
  const resolvedCount = myReports.filter((r) => r.status === 'resolved').length;

  const filteredReports = myReports.filter((report) => {
    if (statusTab === 'all') return true;
    if (statusTab === 'active') return report.status === 'active';
    return report.status === statusTab;
  });

  const handleOpenIssue = (issueId: string) => {
    router.push(`/issue/${issueId}`);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 4) }]}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <ScrollText size={18} color={COLORS.primary} strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.title}>Civic Logbook</Text>
            <Text style={styles.subtitle}>Your submitted road and infrastructure reports</Text>
          </View>
        </View>

        {/* Telemetry Summary Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{myReports.length}</Text>
            <Text style={styles.statLabel}>Total Logged</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#0284C7' }]}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#059669' }]}>{resolvedCount}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Segmented Filter Control */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, statusTab === 'all' && styles.segmentBtnActive]}
            onPress={() => setStatusTab('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, statusTab === 'all' && styles.segmentTextActive]}>
              All ({myReports.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, statusTab === 'active' && styles.segmentBtnActive]}
            onPress={() => setStatusTab('active')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, statusTab === 'active' && styles.segmentTextActive]}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, statusTab === 'resolved' && styles.segmentBtnActive]}
            onPress={() => setStatusTab('resolved')}
            activeOpacity={0.8}
          >
            <Text style={[styles.segmentText, statusTab === 'resolved' && styles.segmentTextActive]}>
              Resolved ({resolvedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <IssueCompactCard
            issue={item}
            onPress={handleOpenIssue}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshIssues}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <EmptyState
              title={statusTab === 'all' ? 'No Reports Logged' : `No ${statusTab} reports found`}
              description={
                statusTab === 'all'
                  ? 'You have not submitted any civic issue reports yet. Spot an issue on the road and tap Spot to report it.'
                  : `You have no ${statusTab} issues in your logbook.`
              }
              actionTitle="Report an Issue"
              onAction={() => router.push('/(tabs)/report')}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.sm,
    padding: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.small,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
});

