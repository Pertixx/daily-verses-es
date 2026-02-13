// ============================================================================
// Onboarding Daily Affirmations Screen - Configuración de frecuencia y horarios
// ============================================================================

import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { Spacing, Typography, ThemeColors } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { storageService, notificationService, analytics } from '@/services';
import { OnboardingContainer, OnboardingHeader, AnimatedButton } from '@/components/onboarding';
import { FrequencySelector } from '@/components/FrequencySelector';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { useTheme } from '@/hooks';

const formatHour = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export default function DailyAffirmationsScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  // Estados para la configuración
  const [frequency, setFrequency] = useState(3);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(22);

  const handleContinue = async () => {
    // Guardar la configuración
    await storageService.updateNotificationSchedule({
      frequency,
      startTime: formatHour(startHour),
      endTime: formatHour(endHour),
      dailyStreakReminder: true,
      streakReminderTime: '20:00',
    });

    // Programar las notificaciones
    const settings = await storageService.getNotificationSettings();
    if (settings) {
      await notificationService.scheduleAffirmationNotifications(settings);
      await notificationService.scheduleStreakReminder(settings);
    }

    analytics.track('onboarding_step_completed', { step: 'daily_affirmations', step_number: ONBOARDING_STEP_MAP.daily_affirmations });
    router.push('/(onboarding)/freeTrial');
  };

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.daily_affirmations}
      totalSteps={ONBOARDING_PROGRESS_STEPS}
      showProgress={false}
      scrollable
      footer={
        <AnimatedButton
          title="Continuar"
          onPress={handleContinue}
          variant="primary"
        />
      }
    >
      <OnboardingHeader
        title="Recibí versículos a lo largo del día"
        subtitle="Decime cuántos querés recibir y en qué horario"
      />

      {/* Lottie Animation */}
      <Animated.View 
        entering={FadeInDown.duration(400).delay(100)}
        style={styles.animationContainer}
      >
        <LottieView
          source={require('@/assets/animations/notification.json')}
          autoPlay
          loop={false}
          style={styles.animation}
        />
      </Animated.View>

      {/* Frequency Selector */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>¿Cuántos versículos por día?</Text>
        <FrequencySelector
          value={frequency}
          onChange={setFrequency}
          min={1}
          max={20}
          animationDelay={200}
        />
      </View>

      {/* Time Range Selector */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>¿Entre qué horarios?</Text>
        <TimeRangeSelector
          startHour={startHour}
          endHour={endHour}
          onStartHourChange={setStartHour}
          onEndHourChange={setEndHour}
          animationDelay={300}
          showHint
          frequency={frequency}
        />
      </View>
    </OnboardingContainer>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    animationContainer: {
      alignItems: 'center',
      marginBottom: Spacing.l,
    },
    animation: {
      width: '100%',
      height: 180,
    },
    sectionContainer: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
      marginBottom: Spacing.m,
      textAlign: 'center',
    },
  });
