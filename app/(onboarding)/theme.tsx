// ============================================================================
// Onboarding Theme Screen - Selección de tema (Mejorada)
// ============================================================================

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { storageService, analytics } from '@/services';
import { OnboardingContainer, OnboardingHeader, AnimatedButton } from '@/components/onboarding';
import { useTheme } from '@/hooks';
import type { Theme } from '@/types';

const THEME_OPTIONS: { theme: Theme; icon: string; title: string; description: string; preview: string }[] = [
  {
    theme: 'light',
    icon: '☀️',
    title: 'Claro',
    description: 'Colores brillantes y suaves para el día',
    preview: '#FFFFFF',
  },
  {
    theme: 'dark',
    icon: '🌙',
    title: 'Oscuro',
    description: 'Ideal para tus ojos de noche',
    preview: '#1A202C',
  },
  {
    theme: 'auto',
    icon: '✨',
    title: 'Automático',
    description: 'Sigue la configuración de tu dispositivo',
    preview: 'linear',
  },
];

export default function ThemeScreen() {
  const { colors, isDark, setThemePreference } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [selectedTheme, setSelectedTheme] = useState<Theme>('auto');

  const handleContinue = async () => {
    analytics.track('onboarding_step_completed', { step: 'theme', step_number: ONBOARDING_STEP_MAP.theme });
    router.push('/(onboarding)/vibe');
  };

  const handleThemeSelect = async (theme: Theme) => {
    Haptics.selectionAsync();
    setSelectedTheme(theme);
    await setThemePreference(theme);
  };

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.theme}
      totalSteps={ONBOARDING_PROGRESS_STEPS}
      scrollable
      footer={
        <AnimatedButton
          title="Continuar"
          onPress={handleContinue}
          icon="→"
        />
      }
    >
      <OnboardingHeader
        title="Personaliza tu experiencia"
        subtitle="Elige el tema que más te guste"
      />

      {/* Theme Options */}
      <View style={styles.themesContainer}>
        {THEME_OPTIONS.map((option, index) => (
          <ThemeOptionCard
            key={option.theme}
            {...option}
            selected={selectedTheme === option.theme}
            onSelect={() => handleThemeSelect(option.theme)}
            delay={100 + index * 100}
            colors={colors}
            isDark={isDark}
          />
        ))}
      </View>

      {/* Info */}
      <Animated.View 
        entering={FadeInDown.duration(400).delay(400)}
        style={styles.infoBox}
      >
        <Text style={styles.infoIcon}>💡</Text>
        <Text style={styles.infoText}>
          Puedes cambiar el tema en cualquier momento desde Configuración.
        </Text>
      </Animated.View>
    </OnboardingContainer>
  );
}

interface ThemeOptionCardProps {
  theme: Theme;
  icon: string;
  title: string;
  description: string;
  preview: string;
  selected: boolean;
  onSelect: () => void;
  delay: number;
  colors: ThemeColors;
  isDark: boolean;
}

function ThemeOptionCard({
  icon,
  title,
  description,
  preview,
  selected,
  onSelect,
  delay,
  colors,
  isDark,
}: ThemeOptionCardProps) {
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15 }) }],
  }));

  const handlePressIn = () => {
    scale.value = 0.98;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <Pressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.themeOption,
            selected && styles.themeOptionSelected,
            animatedStyle,
          ]}
        >
          {/* Preview */}
          <View style={styles.previewContainer}>
            {preview === 'linear' ? (
              <View style={styles.autoPreview}>
                <View style={styles.autoPreviewLight} />
                <View style={styles.autoPreviewDark} />
              </View>
            ) : (
              <View style={[styles.previewCircle, { backgroundColor: preview }]} />
            )}
          </View>

          {/* Content */}
          <View style={styles.themeOptionContent}>
            <View style={styles.titleRow}>
              <Text style={styles.themeIcon}>{icon}</Text>
              <Text style={styles.themeOptionTitle}>{title}</Text>
            </View>
            <Text style={styles.themeOptionDescription}>{description}</Text>
          </View>

          {/* Radio */}
          <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && (
              <Animated.View style={styles.radioInner} />
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    themesContainer: {
      gap: Spacing.m,
      marginBottom: Spacing.xl,
    },
    themeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.l,
      backgroundColor: colors.surface,
      padding: Spacing.l,
      borderRadius: BorderRadius.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    themeOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? `${colors.primary}20` : colors.badgeAzulBg,
    },
    previewContainer: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
      backgroundColor: colors.surfaceElevated,
    },
    previewCircle: {
      width: '100%',
      height: '100%',
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    autoPreview: {
      flex: 1,
      flexDirection: 'row',
    },
    autoPreviewLight: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    autoPreviewDark: {
      flex: 1,
      backgroundColor: '#1A202C',
    },
    themeOptionContent: {
      flex: 1,
      gap: Spacing.xs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.s,
    },
    themeIcon: {
      fontSize: 18,
    },
    themeOptionTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
    },
    themeOptionDescription: {
      fontSize: Typography.fontSize.caption,
      color: colors.textSecondary,
      lineHeight: Typography.fontSize.caption * Typography.lineHeight.caption,
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    infoBox: {
      flexDirection: 'row',
      gap: Spacing.m,
      backgroundColor: colors.badgePurpleBg,
      padding: Spacing.l,
      borderRadius: BorderRadius.lg,
    },
    infoIcon: {
      fontSize: 20,
    },
    infoText: {
      flex: 1,
      fontSize: Typography.fontSize.caption,
      color: colors.textSecondary,
      lineHeight: Typography.fontSize.caption * Typography.lineHeight.caption,
    },
  });
