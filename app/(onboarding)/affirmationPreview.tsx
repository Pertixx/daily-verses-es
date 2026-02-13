// ============================================================================
// Onboarding Affirmation Preview - Vista previa del estilo elegido
// ============================================================================

import { View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import { ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { storageService, analytics } from '@/services';
import { AnimatedButton } from '@/components/onboarding';
import { APP_BACKGROUNDS } from '@/components/AppBackgroundSelector';
import { useTheme } from '@/hooks';
import type { AppBackgroundType } from '@/types';

const SAMPLE_AFFIRMATION = "Porque yo sé los planes que tengo para ustedes, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza.";

export default function AffirmationPreviewScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [selectedBackground, setSelectedBackground] = useState<AppBackgroundType>('default');

  useEffect(() => {
    const loadBackground = async () => {
      const profile = await storageService.getProfile();
      if (profile?.appBackground) {
        setSelectedBackground(profile.appBackground);
      }
    };
    loadBackground();
  }, []);

  const handleContinue = () => {
    analytics.track('onboarding_step_completed', { step: 'affirmation_preview', step_number: ONBOARDING_STEP_MAP.affirmation_preview });
    router.push('/(onboarding)/notifications');
  };

  // Obtener configuración del fondo seleccionado
  const backgroundConfig = APP_BACKGROUNDS.find(bg => bg.id === selectedBackground) || APP_BACKGROUNDS[0];
  const isDefault = selectedBackground === 'default';
  
  // Colores según el fondo
  const backgroundColor = isDefault 
    ? (isDark ? '#1A1A1A' : '#F8F9FA')
    : undefined;
  const textColor = isDefault
    ? (isDark ? '#F9FAFB' : '#1F2937')
    : backgroundConfig.textColor;

  return (
    <View style={styles.container}>
      {/* Background */}
      {isDefault ? (
        <View style={[styles.backgroundFill, { backgroundColor }]} />
      ) : (
        <Image
          source={backgroundConfig.imageSource}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      )}

      {/* Overlay para mejorar legibilidad si es necesario */}
      {!isDefault && (
        <View style={styles.overlay} />
      )}

      {/* Content */}
      <Animated.View 
        entering={FadeIn.duration(500)}
        style={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.l }
        ]}
      >
        {/* Affirmation */}
        <View style={styles.affirmationContainer}>
          <Animated.Text 
            entering={FadeInDown.delay(300).duration(600)}
            style={[styles.affirmationText, { color: textColor }]}
          >
            {SAMPLE_AFFIRMATION}
          </Animated.Text>
        </View>

        {/* Button */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.buttonContainer}
        >
          <AnimatedButton
            title="Se ve hermoso"
            onPress={handleContinue}
            variant="primary"
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundFill: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
  },
  affirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  affirmationText: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: Typography.fontSize.h2 * Typography.lineHeight.body,
    paddingHorizontal: Spacing.m,
    fontFamily: Typography.fontFamily.heading,
  },
  buttonContainer: {
    paddingVertical: Spacing.m,
  },
});
