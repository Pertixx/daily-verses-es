// ============================================================================
// OnboardingContainer - Container principal para pantallas de onboarding
// ============================================================================

import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { Spacing, ThemeColors } from '@/constants/theme';
import { ReactNode, useMemo, useCallback } from 'react';
import { useColors } from '@/hooks';
import { analytics } from '@/services';

interface OnboardingContainerProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  showProgress?: boolean;
  footer?: ReactNode;
  scrollable?: boolean;
  /** Texto del botón de saltar (si no se pasa, no se muestra) */
  skipLabel?: string;
  /** Callback cuando se presiona saltar */
  onSkip?: () => void;
  /** Ocultar botón de retroceso (útil para la primera pantalla) */
  hideBackButton?: boolean;
  /** Nombre del paso actual para analytics */
  stepName?: string;
}

export function OnboardingContainer({
  children,
  currentStep,
  totalSteps,
  showProgress = true,
  footer,
  scrollable = false,
  skipLabel,
  onSkip,
  hideBackButton = false,
  stepName,
}: OnboardingContainerProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Wrapper para trackear skips
  const handleSkipWithTracking = useCallback(() => {
    if (onSkip) {
      analytics.track('onboarding_skipped', {
        step: stepName || `step_${currentStep}`,
        step_number: currentStep,
      });
      onSkip();
    }
  }, [onSkip, stepName, currentStep]);

  const ContentWrapper = scrollable ? ScrollView : View;
  const contentWrapperProps = scrollable
    ? {
        showsVerticalScrollIndicator: false,
        contentContainerStyle: styles.scrollContent,
        keyboardShouldPersistTaps: 'always' as const,
        keyboardDismissMode: 'none' as const,
      }
    : {};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Progress Bar */}
        {showProgress && (
          <OnboardingProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            showStepIndicators={false}
            skipLabel={skipLabel}
            onSkip={onSkip ? handleSkipWithTracking : undefined}
            hideBackButton={hideBackButton}
          />
        )}

        {/* Content */}
        <Animated.View
          entering={FadeIn.duration(400).delay(100)}
          style={styles.contentContainer}
        >
          <ContentWrapper style={styles.content} {...contentWrapperProps}>
            {children}
          </ContentWrapper>
        </Animated.View>

        {/* Footer */}
        {footer && (
          <Animated.View
            entering={FadeIn.duration(300).delay(200)}
            style={[styles.footer, { paddingBottom: insets.bottom + Spacing.l }]}
          >
            {footer}
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.s,
      paddingTop: Spacing.xl,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.s,
      paddingTop: Spacing.xl,
    },
    footer: {
      paddingHorizontal: Spacing.l,
      paddingTop: Spacing.l,
    },
  });
