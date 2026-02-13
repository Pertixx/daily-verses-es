// ============================================================================
// Onboarding App Icon Screen - Selección de ícono de la app
// ============================================================================

import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Spacing } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { storageService, analytics } from '@/services';
import { OnboardingContainer, OnboardingHeader, AnimatedButton } from '@/components/onboarding';

import type { AppIconType } from '@/types';
import { AppIconSelector } from '@/components/AppIconSelector';

export default function AppIconScreen() {
  const [selectedIcon, setSelectedIcon] = useState<AppIconType>('default');

  useEffect(() => {
    // Cargar el ícono previamente seleccionado si existe
    const loadCurrentIcon = async () => {
      const profile = await storageService.getProfile();
      if (profile?.appIcon) {
        setSelectedIcon(profile.appIcon);
      }
    };
    loadCurrentIcon();
  }, []);

  const handleSelectIcon = (iconId: AppIconType) => {
    setSelectedIcon(iconId);
  };

  const handleContinue = async () => {
    // Guardar la preferencia del ícono (se aplicará si el usuario tiene premium)
    await storageService.updateProfile({ appIcon: selectedIcon });
    analytics.track('onboarding_step_completed', { step: 'app_icon', step_number: ONBOARDING_STEP_MAP.app_icon });
    router.push('/(onboarding)/vibe');
  };

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.app_icon}
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
        title="Elegí tu ícono de Tito"
        subtitle="Personalizá cómo se ve Tito en tu pantalla de inicio"
      />

      {/* Icon Selector */}
      <View style={styles.selectorContainer}>
        <AppIconSelector
          selectedIcon={selectedIcon}
          onSelectIcon={handleSelectIcon}
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
