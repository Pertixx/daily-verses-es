// ============================================================================
// Onboarding Vibe Screen - Selección de fondo de pantalla
// ============================================================================

import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Spacing } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { storageService, analytics } from '@/services';
import { OnboardingContainer, OnboardingHeader, AnimatedButton } from '@/components/onboarding';
import { AppBackgroundSelector } from '@/components/AppBackgroundSelector';
import type { AppBackgroundType } from '@/types';

export default function VibeScreen() {
  const [selectedBackground, setSelectedBackground] = useState<AppBackgroundType>('default');

  useEffect(() => {
    // Cargar el fondo previamente seleccionado si existe
    const loadCurrentBackground = async () => {
      const profile = await storageService.getProfile();
      if (profile?.appBackground) {
        setSelectedBackground(profile.appBackground);
      }
    };
    loadCurrentBackground();
  }, []);

  const handleSelectBackground = (backgroundId: AppBackgroundType) => {
    setSelectedBackground(backgroundId);
  };

  const handleContinue = async () => {
    // Guardar la preferencia del fondo (se aplicará si el usuario tiene premium)
    await storageService.updateProfile({ appBackground: selectedBackground });
    analytics.track('onboarding_step_completed', { step: 'vibe', step_number: ONBOARDING_STEP_MAP.vibe });
    router.push('/(onboarding)/affirmationPreview');
  };

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.vibe}
      totalSteps={ONBOARDING_PROGRESS_STEPS}
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
        icon={require('@/assets/icons/tito.png')}
        title="Elegí tu estilo"
        subtitle="Personalizá el fondo de tus versículos diarios"
      />

      {/* Background Selector */}
      <View style={styles.selectorContainer}>
        <AppBackgroundSelector
          selectedBackground={selectedBackground}
          onSelectBackground={handleSelectBackground}
          showPremiumBadge={false}
        />
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  selectorContainer: {
    marginBottom: Spacing.l,
  },
});
