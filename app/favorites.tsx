// ============================================================================
// Favorites Screen - Lista de versículos favoritos
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors } from '@/hooks';
import { storageService, analytics } from '@/services';
import type { FavoriteAffirmation } from '@/types';

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [favorites, setFavorites] = useState<FavoriteAffirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await storageService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleRemoveFavorite = useCallback(async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Get the favorite before removing to track its category
    const favorite = favorites.find(f => f.id === id);
    
    await storageService.removeFavorite(id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    
    // Track unfavorite
    analytics.track('affirmation_unfavorited', {
      affirmation_id: id,
      category: favorite?.category || 'general',
      source: 'favorites_screen',
    });
  }, [favorites]);

  const renderFavoriteItem = useCallback(
    ({ item, index }: { item: FavoriteAffirmation; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(300)}
        exiting={FadeOut.duration(200)}
        style={[styles.favoriteItem, { backgroundColor: colors.cardBackground }]}
      >
        <Text style={[styles.favoriteText, { color: colors.text }]}>
          &ldquo;{item.text}&rdquo;
        </Text>
        <View style={styles.favoriteFooter}>
          <Text style={[styles.favoriteDate, { color: colors.textTertiary }]}>
            {new Date(item.favoritedAt).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
          <Pressable
            style={[styles.removeButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <FontAwesome name="heart" size={16} color={colors.primary} />
          </Pressable>
        </View>
      </Animated.View>
    ),
    [colors, handleRemoveFavorite]
  );

  const keyExtractor = useCallback((item: FavoriteAffirmation) => item.id, []);

  const EmptyState = () => (
    <Animated.View
      entering={FadeIn.delay(200).duration(400)}
      style={styles.emptyContainer}
    >
      <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
        <FontAwesome name="heart-o" size={40} color={colors.textTertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Sin favoritos aún
      </Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
        Tocá el corazón en cualquier versículo para guardarlo aquí
      </Text>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: Spacing.m }]}
      >
        <Pressable style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="chevron-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mis favoritos
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Counter */}
      {favorites.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(100).duration(300)}
          style={styles.counterContainer}
        >
          <Text style={[styles.counterText, { color: colors.textSecondary }]}>
            {favorites.length} {favorites.length === 1 ? 'versículo guardado' : 'versículos guardados'}
          </Text>
        </Animated.View>
      )}

      {/* List */}
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
          favorites.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!isLoading ? EmptyState : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.m,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  headerSpacer: {
    width: 40,
  },
  counterContainer: {
    paddingHorizontal: Spacing.l,
    marginBottom: Spacing.m,
  },
  counterText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
  },
  listContent: {
    paddingHorizontal: Spacing.l,
  },
  emptyListContent: {
    flex: 1,
  },
  favoriteItem: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.l,
    marginBottom: Spacing.m,
  },
  favoriteText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    lineHeight: Typography.fontSize.body * 1.5,
    marginBottom: Spacing.m,
    fontFamily: Typography.fontFamily.body,
  },
  favoriteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteDate: {
    fontSize: Typography.fontSize.caption,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: Typography.fontSize.body,
    textAlign: 'center',
    lineHeight: Typography.fontSize.body * 1.5,
  },
});
