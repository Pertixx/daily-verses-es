import { View, StyleSheet, Text } from 'react-native';
import { useMemo, useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Spacing, ThemeColors, Typography, BorderRadius } from '@/constants/theme';
import { ONBOARDING_PROGRESS_STEPS, ONBOARDING_STEP_MAP } from '@/constants/onboarding';
import { AnimatedButton, OnboardingContainer, OnboardingHeader } from '@/components/onboarding';
import { useTheme } from '@/hooks';
import { storageService, widgetService, analytics } from '@/services';

// =============================================================================
// Widget Preview Component
// =============================================================================

interface WidgetCardProps {
  size: 'small' | 'medium' | 'large';
  colors: ThemeColors;
  delay: number;
}

function WidgetCard({ size, colors, delay }: WidgetCardProps) {
  const getWidgetDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 72, height: 72 };
      case 'medium':
        return { width: 156, height: 72 };
      case 'large':
        return { width: 156, height: 156 };
    }
  };

  const dimensions = getWidgetDimensions();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      style={[
        widgetStyles.widgetCard,
        {
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: colors.primary,
        },
      ]}
    >
      <Text
        style={[
          widgetStyles.widgetText,
          size === 'small' && widgetStyles.widgetTextSmall,
        ]}
        numberOfLines={size === 'small' ? 3 : 4}
      >
        {size === 'small' ? '✝️\nTu versículo aquí' : '✝️ Tu versículo iría aquí'}
      </Text>
    </Animated.View>
  );
}

function IPhoneMockup({ colors }: { colors: ThemeColors }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(500).springify()}
      style={[widgetStyles.iphoneFrame, { borderColor: colors.border }]}
    >
      {/* Notch */}
      <View style={[widgetStyles.notch, { backgroundColor: '#000000' }]} />

      {/* Screen Content */}
      <LinearGradient
        colors={colors.background === '#1A1A1A' 
          ? ['#2D2D2D', '#1A1A1A'] 
          : ['#E8E8ED', '#D1D1D6']}
        style={widgetStyles.screen}
      >
        {/* Status Bar */}
        <View style={widgetStyles.statusBar}>
          <Text style={[widgetStyles.time, { color: colors.text }]}>9:41</Text>
        </View>

        {/* Widgets Grid */}
        <View style={widgetStyles.widgetsContainer}>
          {/* Row 1: Small + Medium */}
          <View style={widgetStyles.widgetRow}>
            <WidgetCard size="small" colors={colors} delay={400} />
            <WidgetCard size="medium" colors={colors} delay={500} />
          </View>

          {/* Row 2: Large + Column of 2 Smalls */}
          <View style={widgetStyles.widgetRow}>
            <WidgetCard size="large" colors={colors} delay={600} />
            <View style={widgetStyles.smallWidgetsColumn}>
              <WidgetCard size="small" colors={colors} delay={700} />
              <WidgetCard size="small" colors={colors} delay={800} />
            </View>
          </View>
        </View>

        {/* App Icons Row (placeholder) */}
        <View style={widgetStyles.appIconsRow}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                widgetStyles.appIcon,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            />
          ))}
        </View>

        {/* Home Indicator */}
        <View style={[widgetStyles.homeIndicator, { backgroundColor: colors.text }]} />
      </LinearGradient>
    </Animated.View>
  );
}

// =============================================================================
// Main Screen Component
// =============================================================================

export default function WidgetScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Marcar onboarding como completado en storage (con reintentos internos)
      const success = await storageService.completeOnboarding();
      
      if (!success) {
        console.error('⚠️ Primer intento falló, reintentando...');
        // Reintento adicional
        await new Promise(resolve => setTimeout(resolve, 300));
        await storageService.completeOnboarding();
      }

      // Trackear onboarding completado
      analytics.track('onboarding_completed');
      analytics.flush();

      // Sincronizar widget en background (no bloquear navegación)
      widgetService.syncVersesToWidget().catch(err => {
        console.error('Error sincronizando widget:', err);
      });

      // Navegar a complete
      router.push('/(onboarding)/complete');
    } catch (error) {
      console.error('Error al completar onboarding:', error);
      // Aún en caso de error, intentar navegar
      router.push('/(onboarding)/complete');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OnboardingContainer
      currentStep={ONBOARDING_STEP_MAP.widget}
      totalSteps={ONBOARDING_PROGRESS_STEPS}
      scrollable
      showProgress={false}
      footer={
        <View style={styles.footerContent}>
          <AnimatedButton
            title={isLoading ? "Cargando..." : "¡Listo!"}
            onPress={handleContinue}
            disabled={isLoading}
          />
        </View>
      }
    >
      <OnboardingHeader
        title="Agregá un widget a tu pantalla"
        subtitle="Empezá el día con un versículo que fortalezca tu fe apenas te despertás"
      />

      {/* iPhone Mockup with Widgets */}
      <View style={styles.mockupContainer}>
        <IPhoneMockup colors={colors} />
      </View>

      {/* Instructions */}
      <Animated.View
        entering={FadeInDown.delay(900).duration(400)}
        style={styles.instructionsContainer}
      >
        <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
          Mantené presionada la pantalla de inicio → Tocá el botón + → Buscá "Versículo"
        </Text>
      </Animated.View>
    </OnboardingContainer>
  );
}

// =============================================================================
// Widget Styles (static)
// =============================================================================

const widgetStyles = StyleSheet.create({
  iphoneFrame: {
    width: 240,
    height: 480,
    borderRadius: 40,
    borderWidth: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  notch: {
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -50,
    width: 100,
    height: 28,
    borderRadius: 20,
    zIndex: 10,
  },
  screen: {
    flex: 1,
    paddingTop: 44,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  time: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
  },
  widgetsContainer: {
    gap: 12,
    flex: 1,
  },
  widgetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallWidgetsColumn: {
    gap: 12,
  },
  widgetCard: {
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  widgetText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
    lineHeight: 14,
  },
  widgetTextSmall: {
    fontSize: 9,
    lineHeight: 12,
  },
  appIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    marginTop: 'auto',
    marginBottom: 8,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  homeIndicator: {
    width: 100,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    opacity: 0.3,
  },
});

// =============================================================================
// Dynamic Styles
// =============================================================================

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    mockupContainer: {
      alignItems: 'center',
      marginTop: Spacing.xl,
      marginBottom: Spacing.l,
    },
    footerContent: {
      gap: Spacing.s,
    },
    instructionsContainer: {
      backgroundColor: colors.surfaceSecondary,
      padding: Spacing.l,
      borderRadius: BorderRadius.lg,
      marginTop: Spacing.m,
    },
    instructionText: {
      textAlign: 'center',
      fontSize: Typography.fontSize.caption,
      fontFamily: 'Nunito_500Medium',
      lineHeight: 20,
    },
  });
