// ============================================================================
// Onboarding Notifications Screen - Configuración de notificaciones
// ============================================================================

import { View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useMemo } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { notificationService, storageService, analytics } from '@/services';
import { OnboardingContainer, OnboardingHeader } from '@/components/onboarding';
import { useTheme } from '@/hooks';
import { Image } from 'expo-image';

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleAllow = async () => {
    const granted = await notificationService.requestPermissions();
    
    if (granted) {
      // Solo habilitamos las notificaciones, la configuración detallada se hace en dailyAffirmations
      await storageService.setNotificationsEnabled(true);
      analytics.track('onboarding_step_completed', { step: 'notifications', step_number: ONBOARDING_STEP_MAP.notifications, notifications_allowed: true });
      router.push('/(onboarding)/dailyAffirmations');
    } else {
      Alert.alert(
        'Permisos necesarios',
        'Para recibir versículos diarios, necesitamos tu permiso para enviar notificaciones. Puedes cambiar esto después en Configuración.',
        [
          { text: 'Continuar sin notificaciones', style: 'cancel', onPress: handleSkip },
          { text: 'Reintentar', onPress: handleAllow },
        ]
      );
    }
  };

  const handleDontAllow = async () => {
    // Solo deshabilitamos las notificaciones
    await storageService.setNotificationsEnabled(false);
    analytics.track('onboarding_step_completed', { step: 'notifications', step_number: ONBOARDING_STEP_MAP.notifications, notifications_allowed: false });
    // Mostrar pantalla de lo que se pierde
    router.push('/(onboarding)/notificationsMissing');
  };

  const handleSkip = async () => {
    await storageService.setNotificationsEnabled(false);
    router.push('/(onboarding)/notificationsMissing');
  };

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.notifications}
      totalSteps={ONBOARDING_PROGRESS_STEPS}
      showProgress={false}
      scrollable
    >
      <OnboardingHeader
        title="Alcanzá tus objetivos con notificaciones"
        subtitle='Tito usa notificaciones diarias para ayudarte a mantenerte en camino hacia tus objetivos y convertirte en tu mejor versión'
      />

      {/* Permission Dialog */}
      <Animated.View 
        entering={FadeInDown.duration(500).delay(200).springify()}
        style={styles.dialogContainer}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogBox}>
            {/* Header with Icon and Title */}
            <View style={styles.dialogHeader}>
              <View style={styles.appIconContainer}>
                <View style={styles.appIconInner}>
                  <Image style={styles.appIcon} source={require('@/assets/icons/Tito.png')} />
                </View>
              </View>
              
              <View style={styles.dialogTitleContainer}>
                <Text style={styles.dialogTitle}>
                  "Tito" quiere enviarte notificaciones
                </Text>
              </View>
            </View>
            
            {/* Skeleton lines */}
            <View style={styles.skeletonContainer}>
              <View style={[styles.skeletonLine, styles.skeletonLine1]} />
              <View style={[styles.skeletonLine, styles.skeletonLine2]} />
              <View style={[styles.skeletonLine, styles.skeletonLine3]} />
            </View>
            
            {/* Buttons */}
            <View style={styles.dialogButtonsContainer}>
              <View style={styles.buttonSecondary} onTouchEnd={handleDontAllow}>
                <Text style={styles.buttonSecondaryText}>
                  No permitir
                </Text>
              </View>
              <View style={styles.buttonPrimary} onTouchEnd={handleAllow}>
                <Text style={styles.buttonPrimaryText}>
                  Permitir
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Hint arrow pointing to Allow button */}
        <View style={styles.hintContainer}>
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>Quienes activan las notificaciones tienen un 80% más de probabilidades de tener éxito</Text>
          </View>
        </View>
      </Animated.View>
    </OnboardingContainer>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    dialogContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.s,
    },
    dialogBackdrop: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialogBox: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.15,
      shadowRadius: 20,
      elevation: 10,
    },
    dialogHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.l,
      marginBottom: Spacing.xl,
    },
    appIconContainer: {
      flexShrink: 0,
    },
    appIconInner: {
      width: 56,
      height: 56,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.tertiary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    appIcon: {
      width: 45,
      height: 45,
    },
    dialogTitleContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    dialogTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 22,
      letterSpacing: -0.2,
    },
    skeletonContainer: {
      gap: Spacing.s,
      marginBottom: Spacing.xl,
    },
    skeletonLine: {
      height: 12,
      borderRadius: 6,
      backgroundColor: isDark 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(0, 0, 0, 0.08)',
    },
    skeletonLine1: {
      width: '100%',
    },
    skeletonLine2: {
      width: '90%',
    },
    skeletonLine3: {
      width: '75%',
    },
    dialogButtonsContainer: {
      flexDirection: 'row',
      gap: Spacing.m,
    },
    buttonSecondary: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: Spacing.l,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonSecondaryText: {
      fontSize: Typography.fontSize.button,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.textSecondary,
    },
    buttonPrimary: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.l,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    buttonPrimaryText: {
      fontSize: Typography.fontSize.button,
      fontWeight: Typography.fontWeight.bold,
      color: colors.buttonPrimaryText,
    },
    hintContainer: {
      marginTop: Spacing.l,
      alignItems: 'center',
      width: '100%',
    },
    hintPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.s,
      backgroundColor: isDark 
        ? 'rgba(255, 255, 255, 0.08)' 
        : 'rgba(0, 0, 0, 0.04)',
      paddingHorizontal: Spacing.l,
      paddingVertical: Spacing.m,
      borderRadius: BorderRadius.xl,
    },
    hintText: {
      fontSize: Typography.fontSize.caption,
      color: colors.textSecondary,
      fontFamily: Typography.fontFamily.body,
    },
  });
