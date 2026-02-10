// ============================================================================
// AffirmationCard - Tarjeta de versículo con favoritos y audio
// ============================================================================

import { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius, ThemeColors } from '@/constants/theme';
import { useColors, useTheme } from '@/hooks';
import type { Verse } from '@/types';

interface AffirmationCardProps {
  affirmation: Verse;
  isFavorite: boolean;
  onToggleFavorite: (affirmation: Verse) => void;
  onPlayAudio?: (affirmation: Verse) => void;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AffirmationCardComponent({
  affirmation,
  isFavorite,
  onToggleFavorite,
  onPlayAudio,
  index = 0,
}: AffirmationCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const styles = createStyles(colors);

  // Animación de escala para el botón de favorito
  const favoriteScale = useSharedValue(1);

  const handleToggleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    favoriteScale.value = withSpring(1.3, { damping: 10 }, () => {
      favoriteScale.value = withSpring(1);
    });
    onToggleFavorite(affirmation);
  }, [affirmation, onToggleFavorite, favoriteScale]);

  const handlePlayAudio = useCallback(() => {
    if (affirmation.audioSource && onPlayAudio) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPlayAudio(affirmation);
    }
  }, [affirmation, onPlayAudio]);

  const favoriteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favoriteScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(index * 50).duration(400)}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Texto del versículo */}
        <Text style={styles.affirmationText}>“{affirmation.text}”</Text>

        {/* Referencia bíblica */}
        {affirmation.reference && (
          <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
            — {affirmation.reference}
          </Text>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          {/* Botón de audio (solo si tiene audioSource) */}
          {affirmation.audioSource && (
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={handlePlayAudio}
            >
              <FontAwesome
                name="volume-up"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          )}

          {/* Botón de favorito */}
          <AnimatedPressable
            style={[styles.actionButton, favoriteAnimatedStyle]}
            onPress={handleToggleFavorite}
          >
            <FontAwesome
              name={isFavorite ? 'heart' : 'heart-o'}
              size={18}
              color={isFavorite ? colors.primary : colors.textSecondary}
            />
          </AnimatedPressable>
        </View>
      </View>
    </Animated.View>
  );
}

// Memo para evitar re-renders innecesarios
export const AffirmationCard = memo(AffirmationCardComponent, (prev, next) => {
  return (
    prev.affirmation.id === next.affirmation.id &&
    prev.isFavorite === next.isFavorite
  );
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.cardBackground,
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing.l,
      marginBottom: Spacing.m,
      flexDirection: 'row',
      overflow: 'hidden',
      // Sombra sutil
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    categoryIndicator: {
      width: 4,
    },
    content: {
      flex: 1,
      padding: Spacing.l,
    },
    categoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: Spacing.m,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.m,
    },
    categoryText: {
      fontSize: Typography.fontSize.caption,
      fontWeight: Typography.fontWeight.semibold,
    },
    affirmationText: {
      fontSize: Typography.fontSize.h3,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
      lineHeight: Typography.fontSize.h3 * 1.4,
      marginBottom: Spacing.l,
      fontFamily: Typography.fontFamily.heading,
    },
    referenceText: {
      fontSize: Typography.fontSize.caption,
      fontWeight: Typography.fontWeight.medium,
      fontStyle: 'italic',
      marginBottom: Spacing.l,
      fontFamily: Typography.fontFamily.body,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: Spacing.m,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionButtonPressed: {
      opacity: 0.7,
    },
  });
