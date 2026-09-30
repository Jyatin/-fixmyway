import React, { useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { View, FlatList, StyleSheet, Dimensions, ViewToken } from 'react-native';
import { CivicIssue } from '@/types/issue';
import { IssuePreviewCard } from './IssuePreviewCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

export interface MapIssueCarouselRef {
  scrollToIssue: (issueId: string) => void;
  scrollToIndex: (index: number) => void;
}

interface MapIssueCarouselProps {
  issues: CivicIssue[];
  userCoords?: { latitude: number; longitude: number } | null;
  onPressIssue: (issueId: string) => void;
  onActiveIssueChange?: (issue: CivicIssue) => void;
}

export const MapIssueCarousel = forwardRef<MapIssueCarouselRef, MapIssueCarouselProps>(
  ({ issues, userCoords, onPressIssue, onActiveIssueChange }, ref) => {
    const flatListRef = useRef<FlatList<CivicIssue>>(null);

    useImperativeHandle(ref, () => ({
      scrollToIssue: (issueId: string) => {
        const index = issues.findIndex((i) => i.id === issueId);
        if (index !== -1) flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      },
      scrollToIndex: (index: number) => {
        if (index >= 0 && index < issues.length) flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      },
    }));

    const onActiveIssueChangeRef = useRef(onActiveIssueChange);
    onActiveIssueChangeRef.current = onActiveIssueChange;

    const onViewableItemsChanged = useRef(
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        const activeItem = viewableItems[0]?.item as CivicIssue | undefined;
        if (activeItem) onActiveIssueChangeRef.current?.(activeItem);
      }
    ).current;

    const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 65 }).current;
    if (!issues?.length) return null;

    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={issues}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="center"
          decelerationRate="fast"
          contentContainerStyle={styles.contentContainer}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <IssuePreviewCard issue={item} userCoords={userCoords} onPress={onPressIssue} />
            </View>
          )}
          getItemLayout={(_, index) => ({ length: SNAP_INTERVAL, offset: SNAP_INTERVAL * index, index })}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 94,
    zIndex: 90,
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: CARD_MARGIN,
  },
  cardWrapper: { width: CARD_WIDTH },
});
