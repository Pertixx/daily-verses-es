import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView 
} from 'react-native';
import { LEGAL_URLS } from '@/types';
import { router } from 'expo-router';
import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import { revenueCatService, storageService, notificationService, analytics } from '@/services';
import { useTheme } from '@/hooks';
import { AnimatedButton } from '@/components/onboarding';
import { FontAwesome } from '@expo/vector-icons';
import { APP_ICONS } from '@/components/AppIconSelector';
import { APP_BACKGROUNDS } from '@/components/AppBackgroundSelector';

// =============================================================================
// Timeline Step Component
// =============================================================================

interface TimelineStepProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  isLast?: boolean;
  delay: number;
  colors: {
    primary: string;
    text: string;
    textSecondary: string;
    cardBackground: string;
    border: string;
  };
}

function TimelineStep({ icon, title, subtitle, isLast = false, delay, colors }: TimelineStepProps) {
  return (
    <Animated.View 
      entering={FadeInLeft.delay(delay).duration(500).springify()}
      style={styles.timelineStep}
    >
      {/* Línea conectora vertical */}
      {!isLast && (
        <View style={[styles.timelineLine, { backgroundColor: colors.primary }]} />
      )}
      
      {/* Círculo con icono */}
      <View style={[styles.timelineIconContainer, { 
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
      }]}>
        {icon}
      </View>
      
      {/* Contenido del paso */}
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.timelineSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      </View>
    </Animated.View>
  );
}

// =============================================================================
// Main Screen Component
// =============================================================================

export default function TrialPaywallScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Color del icono: blanco en light mode, negro en dark mode
  const iconColor = isDark ? '#1F2937' : '#FFFFFF';
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [trialPackage, setTrialPackage] = useState<PurchasesPackage | null>(null);
  const [priceString, setPriceString] = useState('');
  const [showPremiumLossModal, setShowPremiumLossModal] = useState(false);
  const [premiumSelections, setPremiumSelections] = useState<string[]>([]);
  // Cargar ofertas de RevenueCat and 
  useEffect(() => {
    loadOfferings();
    analytics.track('paywall_viewed', { source: 'onboarding' });
  }, []);

  const loadOfferings = async () => {
    try {
      setIsLoading(true);
      
      // Verificar si RevenueCat está listo para usar
      if (!revenueCatService.canMakePurchases()) {
        console.log('⚠️ RevenueCat no disponible - usando datos mock');
        setPriceString('$0.99/mes');
        setIsLoading(false);
        return;
      }

      const offering = await revenueCatService.getOfferings();
      
      if (offering?.availablePackages?.length) {
        // Siempre usar suscripción mensual en el trial paywall (no confiar en el orden del array)
        const monthlyPkg = offering.availablePackages.find(p => p.packageType === PACKAGE_TYPE.MONTHLY);
        const pkg = monthlyPkg ?? offering.availablePackages[0];
        setTrialPackage(pkg);
        const product = pkg.product;
        setPriceString(product.priceString + '/mes');
      } else {
        console.log('No hay ofertas disponibles');
        setPriceString('$0.99/mes');
      }
    } catch (error) {
      console.error('Error cargando ofertas:', error);
      setPriceString('$0.99/mes');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cierre del modal
  const handleClose = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.track('paywall_dismissed', { source: 'onboarding' });
    await checkPremiumSelections();
  }, []);

  // Verificar si el usuario tiene selecciones premium
  const checkPremiumSelections = async () => {
    const profile = await storageService.getProfile();
    const selections: string[] = [];

    // Verificar si el icono seleccionado es premium
    if (profile?.appIcon) {
      const selectedIcon = APP_ICONS.find(icon => icon.id === profile.appIcon);
      if (selectedIcon?.isPremium) {
        selections.push('Ícono de app personalizado');
      }
    }

    // Verificar si el fondo seleccionado es premium
    if (profile?.appBackground) {
      const selectedBackground = APP_BACKGROUNDS.find(bg => bg.id === profile.appBackground);
      if (selectedBackground?.isPremium) {
        selections.push('Fondo de pantalla personalizado');
      }
    }

    if (selections.length > 0) {
      setPremiumSelections(selections);
      setShowPremiumLossModal(true);
    } else {
      router.replace('/(onboarding)/widget');
    }
  };

  // Continuar sin las personalizaciones premium
  const handleContinueWithoutPremium = async () => {
    // Resetear las selecciones premium a default
    await storageService.updateProfile({
      appIcon: 'default',
      appBackground: 'default',
    });
    setShowPremiumLossModal(false);
    router.replace('/(onboarding)/widget');
  };

  // Volver al paywall
  const handleBackToPaywall = () => {
    setShowPremiumLossModal(false);
  };

  // Manejar compra con trial
  const handleStartTrial = useCallback(async () => {
    if (!trialPackage && revenueCatService.canMakePurchases()) {
      Alert.alert('Error', 'No se pudo cargar la oferta. Intentá de nuevo.');
      return;
    }

    // Trackear intención de compra
    analytics.track('purchase_intent', {
      product_id: trialPackage?.identifier,
      source: 'onboarding',
      has_trial: true,
    });

    try {
      setIsPurchasing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Trackear inicio de trial
      analytics.track('trial_started', {
        product_id: trialPackage?.identifier,
        source: 'onboarding',
      });

      if (!revenueCatService.canMakePurchases()) {
        console.log('⚠️ RevenueCat no disponible - simulando compra exitosa');
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Programar notificación de recordatorio de trial (día 2 de 3)
        await notificationService.scheduleTrialReminder(3);
        router.replace('/(onboarding)/widget');
        return;
      }

      const success = await revenueCatService.purchasePackage(trialPackage);
      
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        analytics.track('purchase_completed', {
          product_id: trialPackage?.identifier,
          price: trialPackage?.product.price,
          source: 'onboarding',
          has_trial: true,
        });
        // Programar notificación de recordatorio de trial (día 2 de 3)
        await notificationService.scheduleTrialReminder(3);
        router.replace('/(onboarding)/widget');
      }
    } catch (error) {
      console.error('Error en la compra:', error);
      analytics.track('purchase_failed', {
        product_id: trialPackage?.identifier,
        source: 'onboarding',
        error: error instanceof Error ? error.message : 'unknown',
      });
      Alert.alert(
        'Error',
        'Hubo un problema al procesar tu compra. Por favor intentá de nuevo.'
      );
    } finally {
      setIsPurchasing(false);
    }
  }, [trialPackage]);

  // Restaurar compras
  const handleRestore = useCallback(async () => {
    try {
      setIsRestoring(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (!revenueCatService.canMakePurchases()) {
        console.log('⚠️ RevenueCat no disponible - simulando restauración');
        await new Promise(resolve => setTimeout(resolve, 1000));
        Alert.alert('Info', 'No hay compras para restaurar (modo demo)');
        setIsRestoring(false);
        return;
      }

      const restored = await revenueCatService.restorePurchases();
      
      if (restored) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        analytics.track('purchase_restored', { source: 'onboarding' });
        Alert.alert('¡Listo!', 'Tus compras fueron restauradas exitosamente.');
        router.replace('/(onboarding)/complete');
      } else {
        Alert.alert('Info', 'No encontramos compras anteriores para restaurar.');
      }
    } catch (error) {
      console.error('Error restaurando:', error);
      Alert.alert('Error', 'No pudimos restaurar tus compras. Intentá de nuevo.');
    } finally {
      setIsRestoring(false);
    }
  }, []);

  // Continuar sin suscripción
  const handleSkip = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await checkPremiumSelections();
  }, []);

  // Abrir términos de servicio
  const handleOpenTerms = useCallback(() => {
    Linking.openURL(LEGAL_URLS.termsOfService);
  }, []);

  // Abrir política de privacidad
  const handleOpenPrivacy = useCallback(() => {
    Linking.openURL(LEGAL_URLS.iOSEulaPolicy);
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header con botón de cerrar */}
      <View style={[styles.header, { paddingTop: 10}]}>
        <Pressable 
          onPress={handleClose} 
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cargando ofertas...
          </Text>
        </View>
      ) : (
        <Animated.View 
          entering={FadeIn.duration(400)}
          style={styles.content}
        >
          {/* Logo/Imagen */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <Image
              source={require('@/assets/icons/tito.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>

          {/* Título */}
          <Animated.Text 
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.title, { color: colors.text }]}
          >
            Así funciona tu prueba gratis
          </Animated.Text>

          {/* Subtítulo */}
          <Animated.View 
            entering={FadeInDown.delay(300).duration(500)}
            style={[styles.noChargeContainer, { backgroundColor: colors.cardBackground }]}
          >
            <Text style={styles.noChargeIcon}>💳</Text>
            <Text style={[styles.noChargeText, { color: colors.text }]}>
              No se te cobrará nada todavía
            </Text>
          </Animated.View>

          {/* Timeline */}
          <View style={styles.timelineContainer}>
            <TimelineStep
              icon={<FontAwesome name="unlock" size={22} color={iconColor} />}
              title="Hoy — Empieza tu camino"
              subtitle="3 días de acceso completo, totalmente gratis"
              delay={400}
              colors={colors}
            />
            <TimelineStep
              icon={<FontAwesome name="bell" size={22} color={iconColor} />}
              title="Día 2 — Recordatorio de prueba"
              subtitle="Tu prueba terminará pronto, te recordaremos con una notificación"
              delay={550}
              colors={colors}
            />
            <TimelineStep
              icon={<FontAwesome name="star" size={22} color={iconColor} />}
              title="Día 3 — Seguí creciendo"
              subtitle="Continúa con acceso completo o cancela en cualquier momento"
              isLast
              delay={700}
              colors={colors}
            />
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* CTA Button */}
          <Animated.View 
            entering={FadeInDown.delay(800).duration(500)}
            style={styles.ctaContainer}
          >
            <AnimatedButton
              title={isPurchasing ? 'Procesando...' : `Probar 3 días gratis, luego ${priceString}`}
              onPress={handleStartTrial}
              disabled={isPurchasing}
            />
          </Animated.View>

          {/* Skip link */}
          <Animated.View entering={FadeInDown.delay(850).duration(500)}>
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                Continuar sin premium
              </Text>
            </Pressable>
          </Animated.View>

          {/* Precio después del trial */}
          <Animated.Text 
            entering={FadeInDown.delay(900).duration(500)}
            style={[styles.priceText, { color: colors.text }]}
          >
            Después de los 3 días: {priceString}. Cancelá cuando quieras.
          </Animated.Text>

          {/* Links legales */}
          <Animated.View 
            entering={FadeInDown.delay(950).duration(500)}
            style={styles.legalLinksContainer}
          >
            <Pressable onPress={handleRestore} disabled={isRestoring}>
              <Text style={[styles.legalLink, { color: colors.textTertiary }]}>
                {isRestoring ? 'Restaurando...' : 'Restaurar Compras'}
              </Text>
            </Pressable>
            <Text style={[styles.legalLinkSeparator, { color: colors.textTertiary }]}>•</Text>
            <Pressable onPress={handleOpenTerms}>
              <Text style={[styles.legalLink, { color: colors.textTertiary }]}>
                Términos
              </Text>
            </Pressable>
            <Text style={[styles.legalLinkSeparator, { color: colors.textTertiary }]}>•</Text>
            <Pressable onPress={handleOpenPrivacy}>
              <Text style={[styles.legalLink, { color: colors.textTertiary }]}>
                Privacidad
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}

      {/* Modal de pérdida de personalizaciones premium */}
      <Modal
        visible={showPremiumLossModal}
        transparent
        animationType="fade"
        onRequestClose={handleBackToPaywall}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeIn.duration(200)}
            style={[styles.modalContainer, { backgroundColor: colors.surface }]}
          >
            {/* Icon */}
            <View style={[styles.modalIconContainer, { backgroundColor: colors.tertiary }]}>
              <Text style={styles.modalIcon}>✨</Text>
            </View>

            {/* Title */}
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Vas a perder tus personalizaciones
            </Text>

            {/* Description */}
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Sin premium, las siguientes opciones volverán a su configuración por defecto:
            </Text>

            {/* Premium selections list */}
            <View style={styles.modalSelectionsList}>
              {premiumSelections.map((selection, index) => (
                <View key={index} style={[styles.modalSelectionItem, { backgroundColor: colors.surfaceSecondary }]}>
                  <FontAwesome name="star" size={14} color={colors.primary} />
                  <Text style={[styles.modalSelectionText, { color: colors.text }]}>
                    {selection}
                  </Text>
                </View>
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.modalButtonsContainer}>
              <Pressable
                style={[styles.modalButtonSecondary, { borderColor: colors.border }]}
                onPress={handleContinueWithoutPremium}
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.textSecondary }]}>
                  Continuar sin los cambios
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleBackToPaywall}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  Obtener Premium
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingBottom: Spacing.s,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.m,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.l,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.m,
  },
  title: {
    fontSize: 26,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  noChargeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    borderRadius: BorderRadius.xl,
    gap: Spacing.s,
    marginBottom: Spacing.xl,
  },
  noChargeIcon: {
    fontSize: 20,
  },
  noChargeText: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
  },
  
  // Timeline styles
  timelineContainer: {
    width: '100%',
    paddingLeft: Spacing.s,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 22,
    top: 48,
    width: 3,
    height: 60,
    borderRadius: 2,
    opacity: 0.3,
  },
  timelineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 17,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 4,
  },
  timelineSubtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    lineHeight: 20,
  },
  
  spacer: {
    flex: 1,
    minHeight: Spacing.m,
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    textAlign: 'center',
    marginBottom: Spacing.m,
  },
  ctaContainer: {
    width: '100%',
    marginBottom: Spacing.m,
  },
  skipButton: {
    paddingVertical: Spacing.m,
    display: 'none',
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    textDecorationLine: 'underline',
  },
  legalLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingBottom: Spacing.xl,
  },
  legalLink: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  legalLinkSeparator: {
    fontSize: 12,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.l,
  },
  modalContainer: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: Typography.fontSize.h3,
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    marginBottom: Spacing.s,
  },
  modalDescription: {
    fontSize: Typography.fontSize.body,
    fontFamily: 'DMSans_500Medium',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.l,
  },
  modalSelectionsList: {
    width: '100%',
    gap: Spacing.s,
    marginBottom: Spacing.xl,
  },
  modalSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    padding: Spacing.m,
    borderRadius: BorderRadius.md,
  },
  modalSelectionText: {
    fontSize: Typography.fontSize.body,
    fontFamily: 'DMSans_600SemiBold',
  },
  modalButtonsContainer: {
    width: '100%',
    gap: Spacing.m,
  },
  modalButtonSecondary: {
    width: '100%',
    paddingVertical: Spacing.l,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: Typography.fontSize.button,
    fontFamily: 'DMSans_600SemiBold',
  },
  modalButtonPrimary: {
    width: '100%',
    paddingVertical: Spacing.l,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: Typography.fontSize.button,
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF',
  },
});
