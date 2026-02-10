// ============================================================================
// CategoryCard - Tarjeta de categoría de versículos
// ============================================================================

import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks';
import type { CategoryConfig } from '@/types';
import { FontAwesome } from '@expo/vector-icons';

interface CategoryCardProps {
  category: CategoryConfig;
  delay?: number;
}

export function CategoryCard({ category, delay = 0 }: CategoryCardProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark, category.color), [colors, isDark, category.color]);

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(delay).springify()}
      style={styles.container}
    >
      {/* Icon with colored background */}
      <View style={styles.iconContainer}>
        <FontAwesome name={category.icon as any} size={28} color={colors.primary} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {category.description}
        </Text>
      </View>

      {/* Checkmark */}
      <View style={styles.checkContainer}>
        <Text style={styles.check}>✓</Text>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean, accentColor: string) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.l,
      gap: Spacing.m,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 24,
    },
    content: {
      flex: 1,
      gap: Spacing.xs,
    },
    name: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
    },
    description: {
      fontSize: Typography.fontSize.caption,
      fontWeight: Typography.fontWeight.regular,
      color: colors.textSecondary,
      lineHeight: Typography.fontSize.caption * Typography.lineHeight.caption,
    },
    checkContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    check: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: Typography.fontWeight.bold,
    },
  });
