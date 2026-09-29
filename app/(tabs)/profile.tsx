import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Switch, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useIssues } from '@/contexts/IssuesContext';
import { getUserReputation, updatePrivacySettings } from '@/services/gamification/gamificationService';
import { checkAndApplyAppUpdate, getAppUpdateInfo } from '@/services/updates/updateService';
import { scheduleCivicNotification } from '@/services/notifications/notificationService';
import { UserReputation, UserPrivacySettings, Badge } from '@/types/gamification';
import { BadgeDetailModal } from '@/components/gamification/BadgeDetailModal';
import { AllBadgesModal } from '@/components/gamification/AllBadgesModal';
import { EditProfileModal, AVATAR_OPTIONS } from '@/components/profile/EditProfileModal';
import { ModernAlertModal, ModernAlertConfig } from '@/components/ui/ModernAlertModal';
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/theme';
import { Award, Bell, ChevronRight, Download, EyeOff, Lock, MapPin, Pencil, RefreshCw, Sparkles, LogOut, CircleUserRound } from 'lucide-react-native';

export default function ModernYouScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, loginDemo, updateProfile } = useAuth();
  const { myReports } = useIssues();
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [allBadgesModalVisible, setAllBadgesModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<ModernAlertConfig | null>(null);

  useEffect(() => {
    getUserReputation(user?.uid, myReports).then(setReputation);
  }, [user, myReports]);

  const avatar = AVATAR_OPTIONS.find((item) => item.id === user?.avatarKey) || AVATAR_OPTIONS[0];
  const AvatarIcon = avatar.Icon;
  const reports = myReports.length;
  const confirmed = reputation?.confirmationsCount || 0;
  const resolved = myReports.filter((report) => report.status === 'resolved').length;
  const impact = reputation?.impactRadiusKm || 0;
  const unlocked = reputation?.badges.filter((badge) => badge.isUnlocked) || [];

  const handleTogglePrivacy = async (key: keyof UserPrivacySettings) => {
    if (!reputation) return;
    const updated = await updatePrivacySettings({ [key]: !reputation.privacySettings[key] }, user?.uid);
    setReputation((prev) => prev ? { ...prev, privacySettings: updated } : prev);
  };

  const handleLogout = () => {
    setAlertConfig({
      visible: true,
      title: 'Leave FixMyWay?',
      message: 'You can sign back in whenever you are ready.',
      icon: 'logout',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: async () => { setAlertConfig(null); await logout(); router.replace('/(auth)/login'); },
      onCancel: () => setAlertConfig(null),
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'ios' ? 6 : 10) }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 105 }}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOU</Text>
          <Text style={styles.title}>Your civic profile.</Text>
          <Text style={styles.subtitle}>The places you've helped, the issues you've noticed, and the trust you've built.</Text>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.identityTop}>
            <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
              {'uri' in avatar && avatar.uri ? null : <AvatarIcon size={35} color={avatar.color} strokeWidth={2.1} />}
            </View>
            <View style={styles.identityText}>
              <Text style={styles.name}>{user?.displayName || 'Active Citizen'}</Text>
              <Text style={styles.role}>{reputation?.levelTitle || 'Community contributor'}</Text>
              <View style={styles.onlineRow}><View style={styles.onlineDot} /><Text style={styles.onlineText}>Making a difference nearby</Text></View>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}><Pencil size={17} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <View style={styles.identityDivider} />
          <View style={styles.metricsRow}>
            <View><Text style={styles.metricNumber}>{reports}</Text><Text style={styles.metricLabel}>reports</Text></View>
            <View><Text style={styles.metricNumber}>{confirmed}</Text><Text style={styles.metricLabel}>confirmed</Text></View>
            <View><Text style={[styles.metricNumber, { color: COLORS.success }]}>{resolved}</Text><Text style={styles.metricLabel}>resolved</Text></View>
            <View><Text style={styles.metricNumber}>{impact}</Text><Text style={styles.metricLabel}>km impact</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><View><Text style={styles.eyebrow}>MILESTONES</Text><Text style={styles.sectionTitle}>{unlocked.length} unlocked</Text></View><TouchableOpacity onPress={() => setAllBadgesModalVisible(true)}><ChevronRight size={19} color={COLORS.textMuted} /></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
            {(reputation?.badges || []).slice(0, 8).map((badge) => (
              <TouchableOpacity key={badge.id} style={styles.badgeItem} onPress={() => setSelectedBadge(badge)}>
                <View style={[styles.badgeCircle, !badge.isUnlocked && styles.badgeLocked]}><Award size={22} color={badge.isUnlocked ? COLORS.primary : COLORS.textMuted} /></View>
                <Text style={[styles.badgeText, !badge.isUnlocked && { color: COLORS.textMuted }]} numberOfLines={2}>{badge.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.eyebrow}>RECENT ACTIVITY</Text>
          <Text style={styles.sectionTitle}>Your contribution trail.</Text>
          <View style={styles.activityList}>
            {myReports.slice(0, 5).map((report, index) => (
              <TouchableOpacity key={report.id} style={styles.activityRow} onPress={() => router.push(`/issue/${report.id}`)}>
                <View style={[styles.activityDot, report.status === 'resolved' && styles.activityDotResolved]} />
                <View style={styles.activityCopy}><Text style={styles.activityCategory}>{report.category.replace('_', ' ')}</Text><Text style={styles.activityTitle} numberOfLines={1}>{report.description || 'Civic issue reported'}</Text><Text style={styles.activityLocation} numberOfLines={1}>{report.locationName || 'Nearby'}</Text></View>
                <ChevronRight size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
            {!myReports.length && <Text style={styles.emptyText}>Your activity will appear here after your first report.</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.eyebrow}>PRIVACY</Text>
          <Text style={styles.sectionTitle}>Keep your contribution comfortable.</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}><EyeOff size={18} color={COLORS.textPrimary} /></View>
              <View style={styles.settingCopy}><Text style={styles.settingTitle}>Anonymous public reporting</Text><Text style={styles.settingDescription}>Use “Verified Member” instead of your name in public views.</Text></View>
              <Switch value={reputation?.privacySettings.anonymousReporting || false} onValueChange={() => handleTogglePrivacy('anonymousReporting')} trackColor={{ false: '#D6D7D1', true: COLORS.primary }} />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}><MapPin size={18} color={COLORS.textPrimary} /></View>
              <View style={styles.settingCopy}><Text style={styles.settingTitle}>Location privacy</Text><Text style={styles.settingDescription}>Add a small privacy offset around sensitive locations.</Text></View>
              <Switch value={reputation?.privacySettings.locationJitter ?? true} onValueChange={() => handleTogglePrivacy('locationJitter')} trackColor={{ false: '#D6D7D1', true: COLORS.primary }} />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.eyebrow}>SETTINGS</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsRow} onPress={() => checkAndApplyAppUpdate(true)}><RefreshCw size={18} color={COLORS.primary} /><View style={styles.settingsCopy}><Text style={styles.settingsTitle}>Check for updates</Text><Text style={styles.settingsDescription}>Channel {getAppUpdateInfo().channel} · v{getAppUpdateInfo().runtimeVersion}</Text></View><ChevronRight size={17} color={COLORS.textMuted} /></TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={async () => { await scheduleCivicNotification({ title: 'FixMyWay test alert', body: 'Your civic notification channel is working.', data: { test: true } }); setAlertConfig({ visible: true, title: 'Test alert sent', message: 'A test notification was scheduled on this device.', icon: 'bell', confirmText: 'Done', confirmVariant: 'primary', onConfirm: () => setAlertConfig(null) }); }}><Bell size={18} color={COLORS.warning} /><View style={styles.settingsCopy}><Text style={styles.settingsTitle}>Test notifications</Text><Text style={styles.settingsDescription}>Verify local civic alerts on this device.</Text></View><ChevronRight size={17} color={COLORS.textMuted} /></TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={() => setExportModalVisible(true)}><Download size={18} color={COLORS.primary} /><View style={styles.settingsCopy}><Text style={styles.settingsTitle}>Export data summary</Text><Text style={styles.settingsDescription}>Review your personal activity data.</Text></View><ChevronRight size={17} color={COLORS.textMuted} /></TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={loginDemo}><Sparkles size={18} color={COLORS.primary} /><Text style={styles.settingsTitle}>Switch to demo account</Text><ChevronRight size={17} color={COLORS.textMuted} /></TouchableOpacity>
            <TouchableOpacity style={[styles.settingsRow, { borderBottomWidth: 0 }]} onPress={handleLogout}><LogOut size={18} color={COLORS.error} /><Text style={[styles.settingsTitle, { color: COLORS.error }]}>Sign out</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BadgeDetailModal visible={Boolean(selectedBadge)} badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      <AllBadgesModal visible={allBadgesModalVisible} badges={reputation?.badges || []} onClose={() => setAllBadgesModalVisible(false)} />
      {alertConfig && <ModernAlertModal {...alertConfig} visible={Boolean(alertConfig)} onConfirm={alertConfig.onConfirm || (() => setAlertConfig(null))} onCancel={alertConfig.onCancel || (() => setAlertConfig(null))} />}

      <Modal visible={exportModalVisible} transparent animationType="slide" onRequestClose={() => setExportModalVisible(false)}>
        <View style={styles.modalRoot}><View style={styles.exportCard}><View style={styles.modalHeader}><Text style={styles.sectionTitle}>Your data summary</Text><TouchableOpacity onPress={() => setExportModalVisible(false)}><Text style={styles.closeText}>Close</Text></TouchableOpacity></View><ScrollView style={styles.exportScroll}><Text style={styles.jsonText}>{JSON.stringify({ user: { displayName: user?.displayName, email: user?.email }, reports, confirmed, resolved, impact, privacy: reputation?.privacySettings }, null, 2)}</Text></ScrollView><TouchableOpacity style={styles.doneButton} onPress={() => setExportModalVisible(false)}><Text style={styles.doneText}>Done</Text></TouchableOpacity></View></View>
      </Modal>

      <EditProfileModal visible={editModalVisible} user={user} onClose={() => setEditModalVisible(false)} onSave={async (updates) => { await updateProfile(updates); setEditModalVisible(false); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 26 },
  eyebrow: { ...TYPOGRAPHY.label, color: COLORS.primaryDark, marginBottom: 9 },
  title: { ...TYPOGRAPHY.displaySmall, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 9, maxWidth: 345 },
  identityCard: { marginHorizontal: 20, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: 20, ...SHADOWS.card },
  identityTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center' },
  identityText: { flex: 1, marginLeft: 14 },
  name: { color: COLORS.textPrimary, fontSize: 21, fontWeight: '600' },
  role: { color: COLORS.textSecondary, fontSize: 13, marginTop: 3 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  onlineText: { color: COLORS.textMuted, fontSize: 10.5 },
  editButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.surfaceWarm, alignItems: 'center', justifyContent: 'center' },
  identityDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 20 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricNumber: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '600' },
  metricLabel: { color: COLORS.textMuted, fontSize: 10.5, marginTop: 3 },
  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 19, fontWeight: '600' },
  badgesRow: { gap: 18, paddingTop: 17, paddingRight: 20 },
  badgeItem: { width: 70, alignItems: 'center' },
  badgeCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
  badgeLocked: { backgroundColor: COLORS.surfaceHighlight },
  badgeText: { color: COLORS.textSecondary, fontSize: 10.5, textAlign: 'center', marginTop: 8 },
  activityList: { marginTop: 13, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: 16, ...SHADOWS.subtle },
  activityRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  activityDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary },
  activityDotResolved: { backgroundColor: COLORS.success },
  activityCopy: { flex: 1 },
  activityCategory: { color: COLORS.primaryDark, fontSize: 9.5, fontWeight: '700', letterSpacing: 0.8 },
  activityTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '500', marginTop: 3 },
  activityLocation: { color: COLORS.textMuted, fontSize: 10.5, marginTop: 2 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, paddingVertical: 18 },
  settingCard: { marginTop: 13, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: 16, ...SHADOWS.subtle },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 16 },
  settingIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.surfaceWarm, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1 },
  settingTitle: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  settingDescription: { color: COLORS.textMuted, fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  settingDivider: { height: 1, backgroundColor: COLORS.borderLight },
  settingsCard: { marginTop: 13, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, paddingHorizontal: 16, ...SHADOWS.subtle },
  settingsRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  settingsCopy: { flex: 1 },
  settingsTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  modalRoot: { flex: 1, backgroundColor: 'rgba(23,24,23,0.2)', justifyContent: 'flex-end' },
  exportCard: { backgroundColor: COLORS.surfaceWarm, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, minHeight: '58%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  closeText: { color: COLORS.primaryDark, fontSize: 13, fontWeight: '600' },
  exportScroll: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: 15 },
  jsonText: { color: COLORS.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 11, lineHeight: 17 },
  doneButton: { height: 54, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  doneText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
