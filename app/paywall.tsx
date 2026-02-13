// ============================================================================
// Paywall Screen - Pantalla de suscripción premium
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PurchasesPackage, PACKAGE_TYPE } from 'react-native-purchases';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks';
import { revenueCatService, notificationService, analytics } from '@/services';
import { LEGAL_URLS } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface PremiumFeature {
  icon: string;
  title: string;
  description: string;
}

/** Mapea el tipo de paquete a nombre amigable en español */
function getPackageDisplayName(pkg: PurchasesPackage): string {
  switch (pkg.packageType) {
    case PACKAGE_TYPE.MONTHLY:
      return 'Plan Mensual';
    case PACKAGE_TYPE.ANNUAL:
      return 'Plan Anual';
    case PACKAGE_TYPE.WEEKLY:
      return 'Plan Semanal';
    case PACKAGE_TYPE.SIX_MONTH:
      return 'Plan 6 meses';
    case PACKAGE_TYPE.THREE_MONTH:
      return 'Plan 3 meses';
    case PACKAGE_TYPE.TWO_MONTH:
      return 'Plan 2 meses';
    case PACKAGE_TYPE.LIFETIME:
      return 'Acceso de por vida';
    default:
      return 'Premium';
  }
}

/** Obtiene la descripción de periodicidad (ej: "/mes", "/año") */
function getPackagePeriodSuffix(pkg: PurchasesPackage): string {
  switch (pkg.packageType) {
    case PACKAGE_TYPE.MONTHLY:
    case PACKAGE_TYPE.TWO_MONTH:
    case PACKAGE_TYPE.THREE_MONTH:
    case PACKAGE_TYPE.SIX_MONTH:
      return '/mes';
    case PACKAGE_TYPE.ANNUAL:
      return '/año';
    case PACKAGE_TYPE.WEEKLY:
      return '/semana';
    case PACKAGE_TYPE.LIFETIME:
      return 'único';
    default:
      return '';
  }
}

// ============================================================================
// Constants
// ============================================================================

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    icon: 'book',
    title: '+1500 versículos',
    description: 'Accedé a más de 1500 versículos bíblicos',
  },
  {
    icon: 'th-large',
    title: 'Todas las categorías',
    description: 'Desbloquea las 18 categorías de versículos',
  },
  {
    icon: 'volume-up',
    title: 'Audio ilimitado',
    description: 'Escuchá todos los versículos narrados',
  },
  {
    icon: 'magic',
    title: 'Mixes personalizados',
    description: 'Creá tus propias listas de versículos',
  },
  {
    icon: 'paint-brush',
    title: 'Temas personalizados',
    description: 'Fondos e íconos exclusivos para tu app',
  },
];

// ============================================================================
// Feature Card Component
// ============================================================================

interface FeatureCardProps {
  feature: PremiumFeature;
  index: number;
  colors: any;
}

function FeatureCard({ feature, index, colors }: FeatureCardProps) {
  return (
    <Animated.View
      entering={SlideInRight.delay(300 + index * 100).duration(400).springify()}
      style={[styles.featureCard, { backgroundColor: colors.cardBackground }]}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: colors.tertiary }]}>
        <FontAwesome name={feature.icon as any} size={18} color={colors.primary} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>
          {feature.title}
        </Text>
        <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
          {feature.description}
        </Text>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function PaywallScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  // Cargar ofertas de RevenueCat
  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setIsLoading(true);
      
      // Verificar si RevenueCat está listo para usar
      if (!revenueCatService.canMakePurchases()) {
        console.log('⚠️ RevenueCat no disponible - usando datos mock');
        setIsLoading(false);
        return;
      }

      const offering = await revenueCatService.getOfferings();
      console.log('📦 RevenueCat offerings:', offering);
      if (offering?.availablePackages?.length) {
        console.log('📦 Packages:', offering.availablePackages.map(p => ({
          identifier: p.identifier,
          packageType: p.packageType,
          price: p.product.priceString,
        })));
        setPackages(offering.availablePackages);
        // Seleccionar el primero por defecto
        setSelectedPackage(offering.availablePackages[0]);
      } else {
        console.log('No hay ofertas disponibles');
      }
    } catch (error) {
      console.error('Error cargando ofertas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cerrar paywall
  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    analytics.track('paywall_dismissed', { source: 'in_app' });
    router.back();
  }, [router]);

  // Manejar compra
  const handlePurchase = useCallback(async () => {
    if (!selectedPackage && revenueCatService.canMakePurchases()) {
      Alert.alert('Error', 'No se pudo cargar la oferta. Intentá de nuevo.');
      return;
    }

    const pkgToPurchase = selectedPackage;

    // Trackear intención de compra
    analytics.track('purchase_intent', {
      product_id: pkgToPurchase?.identifier,
      source: 'in_app',
    });

    try {
      setIsPurchasing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Trackear inicio de compra
      analytics.track('purchase_started', {
        product_id: pkgToPurchase?.identifier,
        source: 'in_app',
      });

      if (!revenueCatService.canMakePurchases()) {
        console.log('⚠️ RevenueCat no disponible - simulando compra exitosa');
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Programar notificación de recordatorio de trial
        await notificationService.scheduleTrialReminder(3);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('¡Éxito!', 'Tu suscripción ha sido activada.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      const success = await revenueCatService.purchasePackage(pkgToPurchase!);
      
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        analytics.track('purchase_completed', {
          product_id: pkgToPurchase?.identifier,
          price: pkgToPurchase?.product.price,
          source: 'in_app',
        });
        if (pkgToPurchase?.packageType === PACKAGE_TYPE.MONTHLY) {
          // Programar notificación de recordatorio
          await notificationService.scheduleTrialReminder(3);
        }
        Alert.alert('¡Éxito!', 'Tu suscripción ha sido activada.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error en la compra:', error);
      analytics.track('purchase_failed', {
        product_id: pkgToPurchase?.identifier,
        source: 'in_app',
        error: error instanceof Error ? error.message : 'unknown',
      });
      Alert.alert(
        'Error',
        'Hubo un problema al procesar tu compra. Por favor intentá de nuevo.'
      );
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedPackage, router]);

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
        analytics.track('purchase_restored', { source: 'in_app' });
        Alert.alert('¡Listo!', 'Tus compras fueron restauradas exitosamente.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Info', 'No encontramos compras anteriores para restaurar.');
      }
    } catch (error) {
      console.error('Error restaurando:', error);
      Alert.alert('Error', 'No pudimos restaurar tus compras. Intentá de nuevo.');
    } finally {
      setIsRestoring(false);
    }
  }, [router]);

  // Abrir términos de servicio
  const handleOpenTerms = useCallback(() => {
    Linking.openURL(LEGAL_URLS.termsOfService);
  }, []);

  // Abrir política de privacidad
  const handleOpenPrivacy = useCallback(() => {
    Linking.openURL(LEGAL_URLS.iOSEulaPolicy);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header compacto */}
      <View style={[styles.header, { paddingTop: Spacing.m }]}>
        {/* Row con botón cerrar */}
        <View style={styles.headerRow}>
          <Animated.View entering={FadeIn.delay(100).duration(300)}>
            <Pressable 
              onPress={handleClose} 
              style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome name="times" size={18} color={colors.text} />
            </Pressable>
          </Animated.View>
        </View>

        {/* Logo y badge */}
        <Animated.View 
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.headerContent}
        >
          <Image
            source={require('@/assets/icons/tito.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>

        {/* Título */}
        <Animated.Text 
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.headerTitle, { color: colors.text }]}
        >
          Desbloquea todo
        </Animated.Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.mainContent}>
          {/* Features scrolleables */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {PREMIUM_FEATURES.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                feature={feature} 
                index={index} 
                colors={colors}
              />
            ))}
          </ScrollView>

          {/* Footer fijo con precios y CTA */}
          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
            {/* Package Cards - todas las ofertas de RevenueCat */}
            {packages.map((pkg, index) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const periodSuffix = getPackagePeriodSuffix(pkg);
              const hasTrial = pkg.packageType === PACKAGE_TYPE.MONTHLY;
              
              return (
                <Animated.View
                  key={pkg.identifier}
                  entering={FadeInUp.delay(300 + index * 50).duration(400)}
                >
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedPackage(pkg);
                    }}
                    style={[
                      styles.pricingCard,
                      { 
                        backgroundColor: colors.cardBackground,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      }
                    ]}
                  >
                    <View style={styles.pricingContent}>
                      <View style={styles.pricingLeft}>
                        <View style={styles.planNameRow}>
                          <Text style={[styles.planName, { color: colors.text }]}>
                            {getPackageDisplayName(pkg)}
                          </Text>
                          {hasTrial && (
                            <View style={[styles.trialBadge, { backgroundColor: colors.successLight }]}>
                              <Text style={[styles.trialBadgeText, { color: colors.success }]}>3 días gratis</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.planDescription, { color: colors.textSecondary }]}>
                          {pkg.packageType === PACKAGE_TYPE.LIFETIME 
                            ? `${pkg.product.priceString} único • Pago único`
                            : `Después ${pkg.product.priceString}${periodSuffix} • Cancela cuando quieras`
                          }
                        </Text>
                      </View>
                      <View style={[styles.radioOuter, { borderColor: colors.primary }]}>
                        {isSelected && (
                          <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}

            {/* CTA Button */}
            <Animated.View entering={FadeInUp.delay(400).duration(400)}>
              <Pressable 
                style={[
                  styles.ctaButton, 
                  { backgroundColor: colors.primary },
                  isPurchasing && styles.ctaButtonDisabled
                ]}
                onPress={handlePurchase}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.ctaText}>Comenzar prueba gratis</Text>
                    <FontAwesome name="arrow-right" size={16} color="#FFFFFF" />
                  </>
                )}
              </Pressable>
            </Animated.View>

            {/* Legal Links */}
            <View style={styles.legalContainer}>
              <Pressable onPress={handleRestore} disabled={isRestoring}>
                <Text style={[styles.legalLink, { color: colors.textTertiary }]}>
                  {isRestoring ? 'Restaurando...' : 'Restaurar compras'}
                </Text>
              </Pressable>
              <Text style={[styles.legalSeparator, { color: colors.textTertiary }]}>•</Text>
              <Pressable onPress={handleOpenTerms}>
                <Text style={[styles.legalLink, { color: colors.textTertiary }]}>
                  Términos
                </Text>
              </Pressable>
              <Text style={[styles.legalSeparator, { color: colors.textTertiary }]}>•</Text>
              <Pressable onPress={handleOpenPrivacy}>
                <Text style={[styles.legalLink, { color: colors.textTertiary }]}>
                  Privacidad
                </Text>
              </Pressable>
            </View>

            {/* Bottom spacing */}
            <View style={{ height: insets.bottom }} />
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header styles
  header: {
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.m,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: Spacing.s,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: Spacing.s,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.m,
    borderRadius: BorderRadius.xl,
    gap: Spacing.xs,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    textAlign: 'center',
    marginTop: Spacing.s,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main content
  mainContent: {
    flex: 1,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.s,
    paddingBottom: Spacing.m,
  },

  // Feature Card
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.s,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.regular,
  },

  // Footer
  footer: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
  },

  // Pricing Card
  pricingCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.m,
    marginBottom: Spacing.s,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pricingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLeft: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  planName: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  trialBadge: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.s,
    borderRadius: BorderRadius.sm,
  },
  trialBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
  },
  planDescription: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.regular,
    marginTop: 2,
  },

  // CTA
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingVertical: Spacing.l,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.m,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: Typography.fontSize.button,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    color: '#FFFFFF',
  },

  // Legal
  legalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.s,
    marginBottom: Spacing.s,
  },
  legalLink: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
  },
  legalSeparator: {
    fontSize: 12,
  },
});
