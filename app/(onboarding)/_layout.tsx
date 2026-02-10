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
      
      {/* Perfil básico */}
      <Stack.Screen name="name" />
      
      {/* Personalización */}
      <Stack.Screen name="theme" />
      <Stack.Screen name="appIcon" />
      
      {/* Notificaciones */}
      <Stack.Screen name="notifications" />
      <Stack.Screen name="notificationsMissing" />
      
      {/* Widget y cierre */}
      <Stack.Screen name="widget" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
