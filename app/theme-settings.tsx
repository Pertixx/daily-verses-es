// ============================================================================
// Theme Settings Screen - Configuración del tema
// ============================================================================

import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors, useTheme } from '@/hooks';
import { analytics } from '@/services';
import type { Theme } from '@/types';

interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
  icon: 'adjust' | 'sun-o' | 'moon-o';
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'auto',
    label: 'Automático',
    description: 'Sigue la configuración del sistema',
    icon: 'adjust',
  },
  {
    id: 'light',
    label: 'Claro',
    description: 'Siempre usar tema claro',
    icon: 'sun-o',
  },
  {
    id: 'dark',
    label: 'Oscuro',
    description: 'Siempre usar tema oscuro',
    icon: 'moon-o',
  },
];

export default function ThemeSettingsScreen() {
  const colors = useColors();
  const { themePreference, setThemePreference } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSelectTheme = (theme: Theme) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setThemePreference(theme);
    
    // Track theme change
    analytics.track('theme_changed', { theme });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + Spacing.m }]}
      >
        <Pressable style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="chevron-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Apariencia
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Content */}
      <View style={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <Animated.Text
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.sectionDescription, { color: colors.textSecondary }]}
        >
          Elegí cómo querés ver la app
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.optionsContainer}
        >
          {THEME_OPTIONS.map((option, index) => {
            const isSelected = themePreference === option.id;
            return (
              <Pressable
                key={option.id}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: isSelected
                      ? colors.selectedCardBg
                      : colors.cardBackground,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSelectTheme(option.id)}
              >
                <View style={styles.optionLeft}>
                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <FontAwesome
                      name={option.icon}
                      size={20}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: isSelected ? colors.primary : colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                      {option.description}
                    </Text>
                  </View>
                </View>
                {isSelected && (
                  <FontAwesome name="check" size={18} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.l,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: Spacing.m,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    fontSize: Typography.fontSize.caption,
  },
});
