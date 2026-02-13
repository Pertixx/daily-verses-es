// ============================================================================
// Onboarding Layout - Stack navigator para las pantallas de onboarding
// ============================================================================

import { Stack } from 'expo-router';
import { useColors } from '@/hooks';

export default function OnboardingLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'fade',
        gestureEnabled: true,
      }}
    >
      {/* Welcome - Pantalla inicial */}
      <Stack.Screen name="welcome" />

      {/* Perfil del usuario */}
      <Stack.Screen name="name" />

      {/* Configuración visual */}
      <Stack.Screen name="theme" />
      <Stack.Screen name="appIcon" />
      <Stack.Screen name="vibe" />
      <Stack.Screen name="affirmationPreview" />

      {/* Notificaciones */}
      <Stack.Screen name="notifications" />
      <Stack.Screen name="notificationsMissing" />
      <Stack.Screen name="dailyAffirmations" />

      {/* Premium / Trial */}
      <Stack.Screen name="freeTrial" />
      <Stack.Screen name="freeTrialReminder" />
      <Stack.Screen
        name="trialPaywall"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: true,
        }}
      />

      {/* Widget y completar */}
      <Stack.Screen name="widget" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
