import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useIssues } from '@/contexts/IssuesContext';
import { useAuth } from '@/contexts/AuthContext';
import { ImageSelector } from '@/components/report/ImageSelector';
import { AiSuggestionCard } from '@/components/report/AiSuggestionCard';
import { LocationPreviewCard } from '@/components/report/LocationPreviewCard';
import { DuplicateAlertModal } from '@/components/report/DuplicateAlertModal';
import { AchievementModal } from '@/components/gamification/AchievementModal';
import { ModernAlertModal, ModernAlertConfig } from '@/components/ui/ModernAlertModal';
import { CATEGORY_LIST } from '@/constants/categories';
import { SEVERITY_LIST } from '@/constants/severities';
import { getCurrentLocation, LocationResult } from '@/services/location/locationService';
import { analyzeCivicImage, AiVisionAnalysis } from '@/services/ai/visionService';
import { logUserCivicAction } from '@/services/gamification/gamificationService';
import { sendHazardReportSubmittedEmail } from '@/services/email/emailService';
import { sendHazardAlertPushNotification, sendBadgeUnlockedPushNotification } from '@/services/notifications/notificationService';
import { Badge } from '@/types/gamification';
import { IssueCategory, IssueSeverity, NearbyDuplicate } from '@/types/issue';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { Check, ChevronLeft, ChevronRight, CircleDotDashed, Construction, Lightbulb, MapPin, Recycle, Send, Sparkles, TriangleAlert } from 'lucide-react-native';

const STEP_COUNT = 5;

export default function ReportIssueScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string; locationName?: string; latitude?: string; longitude?: string }>();
  const { reportIssue, checkDuplicates } = useIssues();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiVisionAnalysis | null>(null);
  const [aiAccepted, setAiAccepted] = useState(false);
  const [category, setCategory] = useState<IssueCategory>((params.category as IssueCategory) || 'pothole');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);
  const [gpsPermissionGranted, setGpsPermissionGranted] = useState(true);
  const [duplicateModalVisible, setDuplicateModalVisible] = useState(false);
  const [foundDuplicate, setFoundDuplicate] = useState<NearbyDuplicate | null>(null);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  const [leveledUp, setLeveledUp] = useState(false);
  const [alertConfig, setAlertConfig] = useState<ModernAlertConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGPSLocation();
  }, []);

  useEffect(() => {
    if (params.latitude && params.longitude) {
      setLocation({
        latitude: Number(params.latitude),
        longitude: Number(params.longitude),
        locationName: params.locationName || 'Selected location',
        permissionGranted: true,
      } as LocationResult);
    }
  }, [params.latitude, params.longitude, params.locationName]);

  const fetchGPSLocation = async () => {
    setIsLoadingGPS(true);
    try {
      const res = await getCurrentLocation();
      setLocation(res.location);
      setGpsPermissionGranted(res.permissionGranted);
    } catch (err: any) {
      console.warn('[Report] GPS fetch error:', err?.message);
      setGpsPermissionGranted(false);
    } finally {
      setIsLoadingGPS(false);
    }
  };

  const handleImageSelected = async (uri: string) => {
    setImageUri(uri);
    setAiAccepted(false);
    setAiSuggestion(null);
    setIsAnalyzingImage(true);
    try {
      const analysis = await analyzeCivicImage(uri);
      if (analysis) {
        setAiSuggestion(analysis);
        if (analysis.isValidCivicIssue && analysis.category) {
          setCategory(analysis.category);
          if (analysis.suggestedSeverity) setSeverity(analysis.suggestedSeverity);
          if (analysis.suggestedDescription) setDescription(analysis.suggestedDescription);
          setAiAccepted(true);
        }
      }
    } catch (err) {
      console.warn('[Report] AI Vision failed:', err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageRemoved = () => {
    setImageUri(null);
    setAiSuggestion(null);
    setAiAccepted(false);
  };

  const handleAcceptAiSuggestion = (suggestedCat: IssueCategory, suggestedSev?: IssueSeverity, suggestedDesc?: string) => {
    setCategory(suggestedCat);
    if (suggestedSev) setSeverity(suggestedSev);
    if (suggestedDesc) setDescription(suggestedDesc);
    setAiAccepted(true);
  };

  const handleNext = () => {
    if (step === 2 && !imageUri) {
      setAlertConfig({ visible: true, title: 'Show us the issue', message: 'A photo helps the community understand and verify what you found.', icon: 'camera', confirmText: 'Got it', confirmVariant: 'primary', onConfirm: () => setAlertConfig(null) });
      return;
    }
    if (step === 3 && (!description.trim() || description.trim().length < 5)) {
      setAlertConfig({ visible: true, title: 'Tell us a little more', message: 'Add at least a few words describing what is happening and why it matters.', icon: 'warning', confirmText: 'Understood', confirmVariant: 'primary', onConfirm: () => setAlertConfig(null) });
      return;
    }
    if (step < STEP_COUNT - 1) setStep((current) => current + 1);
    else handlePreSubmit();
  };

  const handlePreSubmit = () => {
    if (!imageUri) return setStep(2);
    if (aiSuggestion && !aiSuggestion.isValidCivicIssue) {
      setAlertConfig({ visible: true, title: 'That photo does not look like a civic issue', message: aiSuggestion.rejectionReason || 'Please take a photo of the actual issue.', icon: 'warning', confirmText: 'Retake photo', confirmVariant: 'danger', onConfirm: () => { setAlertConfig(null); handleImageRemoved(); setStep(2); } });
      return;
    }
    if (!description.trim() || description.trim().length < 5) return setStep(3);
    if (!location || location.latitude === null || location.longitude === null) {
      setAlertConfig({ visible: true, title: 'We need your location', message: 'A location pin is required to place the report accurately on the community map.', icon: 'warning', confirmText: 'Refresh GPS', confirmVariant: 'primary', onConfirm: () => { setAlertConfig(null); fetchGPSLocation(); } });
      return;
    }
    const nearby = checkDuplicates(location.latitude, location.longitude, category);
    if (nearby.length > 0) {
      setFoundDuplicate(nearby[0]);
      setDuplicateModalVisible(true);
      return;
    }
    handleSubmitIssue();
  };

  const handleSubmitIssue = async () => {
    if (!imageUri || !location || location.latitude === null || location.longitude === null) return;
    setIsSubmitting(true);
    try {
      await reportIssue({ category, description: description.trim(), imageUri, latitude: location.latitude, longitude: location.longitude, locationName: location.locationName, severity, aiSuggestedCategory: aiSuggestion?.category, aiConfidence: aiSuggestion?.confidence });

      const gamificationRes = await logUserCivicAction('submit_report', category, description.trim(), location.locationName || 'Local Road', { aiUsed: Boolean(aiSuggestion), hasPhotoProof: true, userId: user?.uid });
      if (gamificationRes.unlockedBadge) {
        setUnlockedBadge(gamificationRes.unlockedBadge);
        sendBadgeUnlockedPushNotification(gamificationRes.unlockedBadge.title).catch((e) => console.warn(e));
      }
      setLeveledUp(gamificationRes.leveledUp || false);
      setAchievementModalVisible(true);
      sendHazardAlertPushNotification(category, location.locationName || 'Local Road', severity === 'high').catch((e) => console.warn(e));
      if (user?.email) {
        sendHazardReportSubmittedEmail(user, { category, locationName: location.locationName || 'Local Road', priorityScore: 75 }).catch((e) => console.warn('Email notify error:', e));
      }
    } catch (error) {
      console.error('Submission error:', error);
      setAlertConfig({ visible: true, title: 'Could not send that yet', message: 'Please check your connection and try again.', icon: 'warning', confirmText: 'OK', confirmVariant: 'danger', onConfirm: () => setAlertConfig(null) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = [
    ['What did you notice?', 'Start with the thing that needs attention.'],
    ['Where did you spot it?', 'We will place it on the community map.'],
    ['Can you show us?', 'A clear photo helps us understand it faster.'],
    ['Anything else we should know?', 'A few words can make a report much more useful.'],
    ['Ready to send?', 'Take one last look before it becomes part of FixMyWay.'],
  ][step];

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => step > 0 ? setStep(step - 1) : router.back()} accessibilityLabel="Go back">
              <ChevronLeft size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.progressTrack}>
              {Array.from({ length: STEP_COUNT }).map((_, index) => <View key={index} style={[styles.progressSegment, index <= step && styles.progressSegmentActive]} />)}
            </View>
            <Text style={styles.stepCount}>{step + 1}/{STEP_COUNT}</Text>
          </View>

          <View style={styles.questionBlock}>
            <Text style={styles.eyebrow}>FIXMYWAY REPORT</Text>
            <Text style={styles.question}>{question[0]}</Text>
            <Text style={styles.questionSub}>{question[1]}</Text>
          </View>

          {step === 0 && (
            <View>
              <View style={styles.categoryGrid}>
                {CATEGORY_LIST.map((cat) => {
                  const selected = category === cat.id;
                  const Icon = cat.id === 'pothole' ? CircleDotDashed : cat.id === 'garbage' ? Recycle : cat.id === 'streetlight' ? Lightbulb : cat.id === 'road_damage' ? Construction : TriangleAlert;
                  const iconColor = cat.id === 'pothole' ? COLORS.pothole : cat.id === 'garbage' ? COLORS.garbage : cat.id === 'streetlight' ? COLORS.streetlight : cat.id === 'road_damage' ? COLORS.roadDamage : COLORS.purple;
                  return (
                    <TouchableOpacity key={cat.id} style={[styles.categoryCard, selected && styles.categoryCardSelected]} onPress={() => { setCategory(cat.id); setAiAccepted(false); }} activeOpacity={0.86}>
                      <View style={[styles.categoryIcon, { backgroundColor: selected ? 'rgba(255,255,255,0.18)' : `${iconColor}16` }]}><Icon size={23} color={selected ? '#FFFFFF' : iconColor} strokeWidth={1.8} /></View>
                      <Text style={[styles.categoryTitle, selected && styles.categoryTitleSelected]}>{cat.label}</Text>
                      {selected && <Check size={17} color="#FFFFFF" strokeWidth={2.2} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {step === 1 && (
            <View style={styles.locationSection}>
              <View style={styles.locationIcon}><MapPin size={30} color={COLORS.primary} strokeWidth={1.6} /></View>
              <Text style={styles.locationTitle}>{location?.locationName || 'Finding your location…'}</Text>
              <Text style={styles.locationHint}>Your location stays tied to this report so neighbours know exactly where to look.</Text>
              <View style={styles.locationCard}><LocationPreviewCard latitude={location?.latitude || null} longitude={location?.longitude || null} locationName={location?.locationName} isLoading={isLoadingGPS} onRefreshLocation={fetchGPSLocation} permissionGranted={gpsPermissionGranted} /></View>
            </View>
          )}

          {step === 2 && (
            <View>
              <View style={styles.photoCard}><ImageSelector imageUri={imageUri} onImageSelected={handleImageSelected} onImageRemoved={handleImageRemoved} isLoading={isAnalyzingImage} /></View>
              {isAnalyzingImage && <View style={styles.aiLoading}><ActivityIndicator size="small" color={COLORS.primary} /><Text style={styles.aiLoadingText}>Looking at your photo…</Text></View>}
              {aiSuggestion && imageUri && <AiSuggestionCard isValidCivicIssue={aiSuggestion.isValidCivicIssue} rejectionReason={aiSuggestion.rejectionReason} category={aiSuggestion.category || category} confidence={aiSuggestion.confidence} label={aiSuggestion.label} suggestedSeverity={aiSuggestion.suggestedSeverity} suggestedDescription={aiSuggestion.suggestedDescription} dimensionsText={aiSuggestion.dimensionsText} estimatedDepthCm={aiSuggestion.estimatedDepthCm} estimatedWidthCm={aiSuggestion.estimatedWidthCm} onAccept={handleAcceptAiSuggestion} onReject={() => setAiAccepted(false)} onRetakePhoto={handleImageRemoved} isAccepted={aiAccepted} />}
            </View>
          )}

          {step === 3 && (
            <View>
              <View style={styles.inputCard}>
                <TextInput style={styles.descriptionInput} placeholder="Tell us what happened…" placeholderTextColor={COLORS.textMuted} multiline numberOfLines={6} textAlignVertical="top" value={description} onChangeText={setDescription} />
                {aiSuggestion?.suggestedDescription && <TouchableOpacity style={styles.aiFill} onPress={() => setDescription(aiSuggestion.suggestedDescription || '')}><Sparkles size={14} color={COLORS.primaryDark} /><Text style={styles.aiFillText}>Use AI suggestion</Text></TouchableOpacity>}
              </View>
              <Text style={styles.fieldLabel}>HOW SERIOUS DOES IT FEEL?</Text>
              <View style={styles.severityRow}>
                {SEVERITY_LIST.map((sev) => {
                  const selected = severity === sev.id;
                  return <TouchableOpacity key={sev.id} style={[styles.severityOption, selected && styles.severityOptionSelected]} onPress={() => setSeverity(sev.id)}><View style={[styles.severityDot, { backgroundColor: sev.id === 'high' ? COLORS.error : sev.id === 'medium' ? COLORS.warning : COLORS.success }]} /><Text style={[styles.severityText, selected && styles.severityTextSelected]}>{sev.label}</Text></TouchableOpacity>;
                })}
              </View>
            </View>
          )}

          {step === 4 && (
            <View>
              <View style={styles.reviewCard}>
                {imageUri && <View style={styles.reviewImage}><ImageSelector imageUri={imageUri} onImageSelected={handleImageSelected} onImageRemoved={handleImageRemoved} isLoading={false} /></View>}
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>WHAT</Text><Text style={styles.reviewValue}>{CATEGORY_LIST.find((item) => item.id === category)?.label || category}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>WHERE</Text><Text style={styles.reviewValue}>{location?.locationName || 'Current location'}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>DETAILS</Text><Text style={styles.reviewValue} numberOfLines={3}>{description}</Text></View>
                <View style={styles.reviewRow}><Text style={styles.reviewLabel}>SEVERITY</Text><Text style={styles.reviewValue}>{severity}</Text></View>
              </View>
              <View style={styles.readyNote}><Check size={19} color={COLORS.success} /><Text style={styles.readyText}>Your report is ready to join the local map.</Text></View>
            </View>
          )}

          <TouchableOpacity style={[styles.nextButton, isSubmitting && { opacity: 0.7 }]} onPress={handleNext} disabled={isSubmitting} activeOpacity={0.9}>
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={styles.nextButtonText}>{step === STEP_COUNT - 1 ? 'Send report' : 'Continue'}</Text><ChevronRight size={19} color="#FFFFFF" /></>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <DuplicateAlertModal visible={duplicateModalVisible} duplicate={foundDuplicate} onViewExisting={() => { setDuplicateModalVisible(false); if (foundDuplicate) router.push({ pathname: '/issue/[id]', params: { id: foundDuplicate.issue.id } }); }} onReportAnyway={() => { setDuplicateModalVisible(false); handleSubmitIssue(); }} onClose={() => setDuplicateModalVisible(false)} />
      <AchievementModal visible={achievementModalVisible} unlockedBadge={unlockedBadge} leveledUp={leveledUp} newLevelTitle="Road Guardian" onClose={() => { setAchievementModalVisible(false); setImageUri(null); setDescription(''); setAiSuggestion(null); router.replace('/(tabs)'); }} />
      {alertConfig && <ModernAlertModal {...alertConfig} visible={Boolean(alertConfig)} onConfirm={alertConfig.onConfirm || (() => setAlertConfig(null))} onCancel={alertConfig.onCancel || (() => setAlertConfig(null))} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 34 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOWS.subtle },
  progressTrack: { flex: 1, flexDirection: 'row', gap: 5 },
  progressSegment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E2E2DC' },
  progressSegmentActive: { backgroundColor: COLORS.primary },
  stepCount: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  questionBlock: { marginBottom: 30 },
  eyebrow: { ...TYPOGRAPHY.label, color: COLORS.primaryDark, marginBottom: 10 },
  question: { ...TYPOGRAPHY.display, color: COLORS.textPrimary, maxWidth: 340 },
  questionSub: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 10, maxWidth: 340 },
  categoryGrid: { gap: 10 },
  categoryCard: { minHeight: 76, borderRadius: RADIUS.lg, backgroundColor: COLORS.surface, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 13, ...SHADOWS.subtle },
  categoryCardSelected: { backgroundColor: COLORS.primary },
  categoryIcon: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  categoryTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 15, fontWeight: '500' },
  categoryTitleSelected: { color: '#FFFFFF', fontWeight: '600' },
  locationSection: { alignItems: 'center' },
  locationIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  locationTitle: { ...TYPOGRAPHY.heading, color: COLORS.textPrimary, textAlign: 'center' },
  locationHint: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: 9, maxWidth: 320 },
  locationCard: { width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: 14, marginTop: 24, ...SHADOWS.card },
  photoCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: 10, ...SHADOWS.card },
  aiLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, justifyContent: 'center' },
  aiLoadingText: { color: COLORS.textSecondary, fontSize: 13 },
  inputCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: 18, minHeight: 220, ...SHADOWS.card },
  descriptionInput: { flex: 1, color: COLORS.textPrimary, fontSize: 17, lineHeight: 25, minHeight: 170 },
  aiFill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 9, paddingHorizontal: 11, borderRadius: 12, backgroundColor: COLORS.primaryLight },
  aiFillText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: '600' },
  fieldLabel: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginTop: 28, marginBottom: 10 },
  severityRow: { flexDirection: 'row', gap: 8 },
  severityOption: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  severityOptionSelected: { backgroundColor: COLORS.textPrimary },
  severityDot: { width: 7, height: 7, borderRadius: 4 },
  severityText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  severityTextSelected: { color: '#FFFFFF' },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: 20, ...SHADOWS.card },
  reviewImage: { marginBottom: 12 },
  reviewRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  reviewLabel: { ...TYPOGRAPHY.label, color: COLORS.textMuted, marginBottom: 5 },
  reviewValue: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 21, fontWeight: '500' },
  readyNote: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 18, paddingHorizontal: 3 },
  readyText: { color: COLORS.textSecondary, fontSize: 13 },
  nextButton: { height: 58, borderRadius: 18, backgroundColor: COLORS.primary, marginTop: 28, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, ...SHADOWS.button },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
