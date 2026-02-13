// ============================================================================
// Onboarding Notifications Missing Screen - Lo que te perdés sin notificaciones
// ============================================================================

import { View, Text, StyleSheet, Linking, Platform, AppState, AppStateStatus } from 'react-native';
import { router } from 'expo-router';
import { useMemo, useCallback, useEffect, useRef } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { AnimatedButton, OnboardingContainer, OnboardingHeader } from '@/components/onboarding';
import { useTheme } from '@/hooks';
import { notificationService, storageService } from '@/services';

// =============================================================================
// Feature Item Component
// =============================================================================

interface FeatureItemProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  delay: number;
  colors: ThemeColors;
  isDark: boolean;
}

function FeatureItem({ icon, iconColor, title, description, delay, colors, isDark }: FeatureItemProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      style={[
        featureStyles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          featureStyles.iconContainer,
          { backgroundColor: isDark ? 'rgba(255, 154, 86, 0.15)' : 'rgba(255, 154, 86, 0.1)' },
        ]}
      >
        <Text style={featureStyles.icon}>{icon}</Text>
      </View>
      <View style={featureStyles.textContainer}>
        <Text style={[featureStyles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[featureStyles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </Animated.View>
  );
}

const featureStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.l,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.body,
    fontFamily: 'DMSans_700Bold',
  },
  description: {
    fontSize: Typography.fontSize.caption,
    fontFamily: 'DMSans_500Medium',
    lineHeight: 20,
  },
});

// =============================================================================
// Main Screen Component
// =============================================================================

export default function NotificationsMissingScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const appState = useRef(AppState.currentState);
  const wentToSettings = useRef(false);

  // Escuchar cuando la app vuelve a primer plano para verificar permisos
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Si la app vuelve a primer plano y el usuario fue a ajustes
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        wentToSettings.current
      ) {
        wentToSettings.current = false;
        
        // Verificar si ahora tiene permisos
        const hasPermission = await notificationService.requestPermissions();
        
        if (hasPermission) {
          // Habilitar notificaciones y navegar a configuración
          await storageService.setNotificationsEnabled(true);
          router.push('/(onboarding)/dailyAffirmations');
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const handleOpenSettings = useCallback(async () => {
    wentToSettings.current = true;
    // Abrir ajustes de la app (app-settings: abre la configuración específica de la app en iOS)
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  }, []);

  const handleSkip = useCallback(() => {
    router.push('/(onboarding)/dailyAffirmations');
  }, []);

  const features = [
    {
      icon: '⏰',
      title: 'Horarios personalizados',
      description: 'Afirmaciones en tus momentos ideales, no a cualquier hora',
    },
    {
      icon: '🔥',
      title: 'Protección de racha',
      description: 'Recordatorios suaves para mantener el impulso cuando la vida se complica',
    },
    {
      icon: '✨',
      title: 'Momentos sorpresa',
      description: 'Positividad inesperada a lo largo del día, justo cuando más la necesitás',
    },
  ];

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.notifications}
      totalSteps={ONBOARDING_PROGRESS_STEPS}
      showProgress={false}
      scrollable
      footer={
        <View style={styles.footerContent}>
          <AnimatedButton
            title="Ir a ajustes"
            onPress={handleOpenSettings}
          />
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <Text
              style={styles.skipText}
              onPress={handleSkip}
            >
              Continuar sin notificaciones
            </Text>
          </Animated.View>
        </View>
      }
    >
      <OnboardingHeader
        icon={require('@/assets/icons/tito.png')}
        title="Te vas a perder..."
        subtitle="Sin notificaciones, no podrás aprovechar estas funciones diseñadas para tu bienestar"
      />

      {/* Features List */}
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <FeatureItem
            key={feature.title}
            icon={feature.icon}
            iconColor={colors.primary}
            title={feature.title}
            description={feature.description}
            delay={200 + index * 100}
            colors={colors}
            isDark={isDark}
          />
        ))}
      </View>

      {/* Encouragement message */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={styles.encouragementContainer}
      >
        <FontAwesome name="heart" size={16} color={colors.primary} />
        <Text style={[styles.encouragementText, { color: colors.textSecondary }]}>
          Podés activar las notificaciones cuando quieras desde los ajustes de tu dispositivo
        </Text>
      </Animated.View>
    </OnboardingContainer>
  );
}

// =============================================================================
// Styles
// =============================================================================

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    featuresContainer: {
      gap: Spacing.m,
      marginTop: Spacing.l,
    },
    footerContent: {
      gap: Spacing.m,
      alignItems: 'center',
    },
    skipText: {
      fontSize: Typography.fontSize.caption,
      fontFamily: 'DMSans_600SemiBold',
      color: colors.textSecondary,
      textDecorationLine: 'underline',
      paddingVertical: Spacing.s,
    },
    encouragementContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.s,
      marginTop: Spacing.xl,
      paddingHorizontal: Spacing.m,
    },
    encouragementText: {
      fontSize: Typography.fontSize.caption,
      fontFamily: 'DMSans_500Medium',
      textAlign: 'center',
      flex: 1,
    },
  });
