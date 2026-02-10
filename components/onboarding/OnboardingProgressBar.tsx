// ============================================================================
// OnboardingProgressBar - Barra de progreso animada con Reanimated
// ============================================================================

import { View, StyleSheet, Text, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { useColors } from '@/hooks';
import { useMemo } from 'react';

interface OnboardingProgressBarProps {
  /** Paso actual (1-based) */
  currentStep: number;
  /** Total de pasos */
  totalSteps: number;
  /** Mostrar indicadores de paso individuales */
  showStepIndicators?: boolean;
  /** Texto del botón de saltar */
  skipLabel?: string;
  /** Callback cuando se presiona saltar */
  onSkip?: () => void;
  /** Ocultar botón de retroceso (útil para la primera pantalla) */
  hideBackButton?: boolean;
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
  showStepIndicators = true,
  skipLabel,
  onSkip,
  hideBackButton = false,
}: OnboardingProgressBarProps) {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const progress = currentStep / totalSteps;
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progress * 100}%`, {
        damping: 15,
        stiffness: 100,
        mass: 0.5,
      }),
    };
  }, [progress]);

  return (
    <View style={styles.container}>
      {/* Barra de progreso principal con back y skip */}
      <View style={styles.progressRow}>
        {/* Botón de retroceso */}
        {!hideBackButton ? (
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBarFill, progressStyle]} />
          </View>
        </View>
        
        {skipLabel && onSkip ? (
          <Pressable onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>{skipLabel}</Text>
          </Pressable>
        ) : (
          <View style={styles.skipButtonPlaceholder} />
        )}
      </View>

      {/* Indicadores de pasos */}
      {showStepIndicators && (
        <View style={styles.stepsContainer}>
          {Array.from({ length: totalSteps }, (_, index) => (
            <StepIndicator
              key={index}
              stepNumber={index + 1}
              isActive={index + 1 === currentStep}
              isCompleted={index + 1 < currentStep}
              colors={colors}
            />
          ))}
        </View>
      )}
    </View>
  );
}

interface StepIndicatorProps {
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  colors: ThemeColors;
}

function StepIndicator({ stepNumber, isActive, isCompleted, colors }: StepIndicatorProps) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  const indicatorStyle = useAnimatedStyle(() => {
    const scale = isActive ? 1.2 : 1;
    const opacity = isActive || isCompleted ? 1 : 0.4;

    return {
      transform: [
        {
          scale: withSpring(scale, {
            damping: 12,
            stiffness: 150,
          }),
        },
      ],
      opacity: withTiming(opacity, { duration: 200 }),
    };
  }, [isActive, isCompleted]);

  const innerDotStyle = useAnimatedStyle(() => {
    const scale = isCompleted ? 1 : 0;

    return {
      transform: [
        {
          scale: withSpring(scale, {
            damping: 12,
            stiffness: 200,
          }),
        },
      ],
    };
  }, [isCompleted]);

  return (
    <Animated.View
      style={[
        styles.stepIndicator,
        isActive && styles.stepIndicatorActive,
        isCompleted && styles.stepIndicatorCompleted,
        indicatorStyle,
      ]}
    >
      {isCompleted ? (
        <Animated.View style={[styles.checkmark, innerDotStyle]}>
          <View style={styles.checkmarkIcon} />
        </Animated.View>
      ) : (
        <View
          style={[
            styles.stepDot,
            isActive && styles.stepDotActive,
          ]}
        />
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: Spacing.l,
      paddingTop: Spacing.l,
      gap: Spacing.m,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.m,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButtonPlaceholder: {
      width: 40,
    },
    progressBarContainer: {
      flex: 1,
    },
    progressBarBackground: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    skipButton: {
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.m,
      minWidth: 60,
      alignItems: 'flex-end',
    },
    skipButtonPlaceholder: {
      width: 60,
    },
    skipText: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.textSecondary,
      fontFamily: Typography.fontFamily.body,
    },
    stepsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.m,
    },
    stepIndicator: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepIndicatorActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    stepIndicatorCompleted: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    stepDotActive: {
      backgroundColor: colors.surface,
    },
    checkmark: {
      width: 14,
      height: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmarkIcon: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.surface,
    },
  });
