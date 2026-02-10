// ============================================================================
// FeatureCard - Card animada para mostrar features
// ============================================================================

import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { BorderRadius, Spacing, Typography, ThemeColors } from '@/constants/theme';
import { useColors, useTheme } from '@/hooks';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  backgroundColor?: string;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  backgroundColor,
  delay = 0,
}: FeatureCardProps) {
  const colors = useColors();
  const { isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  
  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(delay).springify()}
      style={[styles.container, { backgroundColor: backgroundColor ?? colors.surface }]}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.l,
      borderRadius: BorderRadius.lg,
      gap: Spacing.l,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 28,
    },
    content: {
      flex: 1,
      gap: Spacing.xs,
    },
    title: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
    },
    description: {
      fontSize: Typography.fontSize.caption,
      color: colors.textSecondary,
      lineHeight: Typography.fontSize.caption * Typography.lineHeight.caption,
    },
  });
