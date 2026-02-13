// ============================================================================
// Onboarding Name Screen - Pantalla de nombre
// ============================================================================

import { Text, TextInput, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { storageService, analytics } from '@/services';
import { OnboardingContainer, OnboardingHeader, AnimatedButton } from '@/components/onboarding';
import { useTheme } from '@/hooks';

export default function NameScreen() {
  const [name, setName] = useState('');
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleContinue = async () => {
    if (!name.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await storageService.updateProfile({ name: name.trim() });
    analytics.track('onboarding_step_completed', { step: 'name', step_number: ONBOARDING_STEP_MAP.name });
    router.push('/(onboarding)/theme');
  };

  const isValid = name.trim().length >= 2;

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.name}
      totalSteps={ONBOARDING_PROGRESS_STEPS}
      scrollable
      footer={
        <AnimatedButton
          title="Continuar"
          onPress={handleContinue}
          icon="→"
          disabled={!isValid}
        />
      }
    >
      {/* Header */}
      <OnboardingHeader
        icon={require('@/assets/icons/tito.png')}
        title="¿Cómo te llamas?"
        subtitle="Me gustaría conocerte mejor!"
      />

      {/* Input */}
      <Animated.View 
        entering={FadeInDown.duration(400).delay(100)}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="given-name"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={handleContinue}
        />
      </Animated.View>

      {/* Info */}
      <Animated.View 
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.infoBox}
      >
        <Text style={styles.infoIcon}>🔒</Text>
        <Text style={styles.infoText}>
          Tu información se guarda solo en tu dispositivo. Nunca la compartimos.
        </Text>
      </Animated.View>
    </OnboardingContainer>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    inputContainer: {
      marginBottom: Spacing.xl,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.l,
      fontSize: Typography.fontSize.h3,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
      textAlign: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    infoBox: {
      flexDirection: 'row',
      gap: Spacing.m,
      backgroundColor: colors.badgeInfoBg,
      padding: Spacing.l,
      borderRadius: BorderRadius.lg,
      display: "none",
    },
    infoIcon: {
      fontSize: 20,
    },
    infoText: {
      flex: 1,
      fontSize: Typography.fontSize.caption,
      color: colors.badgeInfoText,
      lineHeight: Typography.fontSize.caption * Typography.lineHeight.caption,
    },
  });
