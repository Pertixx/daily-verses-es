// ============================================================================
// Onboarding Complete Screen - Pantalla final del onboarding (Mejorada)
// ============================================================================

import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect, useRef, useMemo } from 'react';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing, BorderRadius, Typography, ThemeColors, BaseColors } from '@/constants/theme';
import { storageService, revenueCatService } from '@/services';
import { OnboardingContainer, AnimatedButton } from '@/components/onboarding';
import { useTheme } from '@/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Confetti particles data
const CONFETTI_COLORS = [
  BaseColors.primary,
  BaseColors.secondary,
  BaseColors.tertiary,
  BaseColors.accent,
  '#FFD700',
  '#FF6B6B',
];

const CONFETTI_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * SCREEN_WIDTH,
  delay: Math.random() * 500,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 8 + Math.random() * 8,
}));

export default function CompleteScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [isLoading, setIsLoading] = useState(false);

  // Trigger success haptic on mount
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleGetStarted = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // Obtener o crear userId usando RevenueCat
      const userId = await revenueCatService.getOrCreateUserId();

      // Obtener los datos del usuario o crear nuevos
      let userData = await storageService.getUserData();
      
      if (!userData) {
        userData = await storageService.initializeUserData(userId);
      }

      // Marcar onboarding como completado
      await storageService.completeOnboarding();

      // Navegar a la pantalla principal
      router.replace('/');
    } catch (error) {
      console.error('Error al completar onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingContainer
      currentStep={4}
      totalSteps={4}
      showProgress={false}
      footer={
        isLoading ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator color={colors.text} />
          </View>
        ) : (
          <AnimatedButton
            title="Comenzar mi camino"
            onPress={handleGetStarted}
            icon="✝️"
          />
        )
      }
    >
      {/* Confetti Animation */}
      <View style={confettiStyles.container}>
        {CONFETTI_PARTICLES.map((particle) => (
          <ConfettiParticle key={particle.id} {...particle} />
        ))}
      </View>

      {/* Success Icon with Celebration */}
      <Animated.View 
        entering={ZoomIn.duration(600).springify()}
        style={styles.iconContainer}
      >
        <View style={styles.iconGlow} />
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🎉</Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.Text 
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.title}
      >
        ¡Todo listo!
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text 
        entering={FadeInDown.duration(400).delay(300)}
        style={styles.subtitle}
      >
        Estás a punto de comenzar tu camino diario con la Palabra de Dios
      </Animated.Text>

      {/* What's Next */}
      <Animated.View 
        entering={FadeInDown.duration(400).delay(400)}
        style={styles.whatNextContainer}
      >
        <Text style={styles.whatNextTitle}>Qué sigue:</Text>
        
        <View style={styles.stepsList}>
          <StepItem
            number="1"
            text="Recibí tu primer versículo del día"
            color={colors.primary}
            delay={500}
            colors={colors}
          />
          <StepItem
            number="2"
            text="Construí tu racha diaria de lectura"
            color={colors.secondary}
            delay={600}
            colors={colors}
          />
          <StepItem
            number="3"
            text="Guardá tus versículos favoritos"
            color={colors.tertiary}
            delay={700}
            colors={colors}
          />
        </View>
      </Animated.View>

      {/* Motivational Quote */}
      <Animated.View 
        entering={FadeInUp.duration(400).delay(800)}
        style={styles.quoteContainer}
      >
        <Text style={styles.quoteIcon}>📖</Text>
        <Text style={styles.quoteText}>
          Lámpara es a mis pies tu palabra, y lumbrera a mi camino. — Salmos 119:105
        </Text>
      </Animated.View>
    </OnboardingContainer>
  );
}

function ConfettiParticle({ x, delay, color, size }: { x: number; delay: number; color: string; size: number }) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(400, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      )
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(20, { duration: 500 }),
          withTiming(-20, { duration: 500 })
        ),
        -1,
        true
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      )
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
  }, [delay, translateY, translateX, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        confettiStyles.particle,
        {
          left: x,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 4,
        },
        animatedStyle,
      ]}
    />
  );
}

interface StepItemProps {
  number: string;
  text: string;
  color: string;
  delay: number;
  colors: ThemeColors;
}

function StepItem({ number, text, color, delay, colors }: StepItemProps) {
  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(delay)}
      style={stepStyles.stepItem}
    >
      <View style={[stepStyles.stepNumber, { backgroundColor: color }]}>
        <Text style={[stepStyles.stepNumberText, { color: colors.text }]}>{number}</Text>
      </View>
      <Text style={[stepStyles.stepText, { color: colors.textSecondary }]}>{text}</Text>
    </Animated.View>
  );
}

const stepStyles = StyleSheet.create({
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.l,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
  },
  stepText: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    lineHeight: Typography.fontSize.body * Typography.lineHeight.body,
  },
});

// Static styles for confetti animation (doesn't depend on theme)
const confettiStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    top: -50,
  },
});

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    loadingButton: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.l,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
      marginTop: Spacing.xl,
    },
    iconGlow: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.badgePurpleBg,
      opacity: 0.5,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    icon: {
      fontSize: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.s,
    },
    subtitle: {
      fontSize: Typography.fontSize.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.fontSize.body * Typography.lineHeight.body,
      marginBottom: Spacing.xxl,
      paddingHorizontal: Spacing.l,
    },
    whatNextContainer: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      marginBottom: Spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    whatNextTitle: {
      fontSize: Typography.fontSize.h3,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
      marginBottom: Spacing.l,
    },
    stepsList: {
      gap: Spacing.m,
    },
    quoteContainer: {
      backgroundColor: colors.badgeAzulBg,
      padding: Spacing.xl,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      gap: Spacing.m,
    },
    quoteIcon: {
      fontSize: 32,
    },
    quoteText: {
      fontSize: Typography.fontSize.body,
      color: colors.badgeAzulText,
      textAlign: 'center',
      fontStyle: 'italic',
      lineHeight: Typography.fontSize.body * Typography.lineHeight.body,
    },
  });
