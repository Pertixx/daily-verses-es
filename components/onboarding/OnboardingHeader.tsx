// ============================================================================
// OnboardingHeader - Header reutilizable para pantallas de onboarding
// ============================================================================

import { Text, StyleSheet, ImageSourcePropType } from 'react-native';
import Animated, { FadeInDown, SharedValue } from 'react-native-reanimated';
import { Spacing, Typography, ThemeColors } from '@/constants/theme';
import { useColors } from '@/hooks';
import { useMemo } from 'react';

interface OnboardingHeaderProps {
  icon?: ImageSourcePropType | SharedValue<ImageSourcePropType | undefined>;
  title?: string;
  subtitle?: string;
  delay?: number;
}

export function OnboardingHeader({
  icon,
  title,
  subtitle,
  delay = 0,
}: OnboardingHeaderProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(delay)} 
      style={styles.header}
    >
      {icon && (
        <Animated.Image source={icon} style={styles.icon} />
      )}
      {title && <Text style={styles.title}>{title}</Text>}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    header: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.badgePrimaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.l,
    },
    icon: {
      width: 150,
      height: 150,
    },
    title: {
      fontSize: Typography.fontSize.h1,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.s,
      fontFamily: Typography.fontFamily.heading
    },
    subtitle: {
      fontSize: Typography.fontSize.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.fontSize.body * Typography.lineHeight.body,
      paddingHorizontal: Spacing.l,
      fontFamily: Typography.fontFamily.body
    },
  });
