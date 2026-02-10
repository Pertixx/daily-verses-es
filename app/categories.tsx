// ============================================================================
// Categories Screen - Pantalla de categorías de versículos
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors } from '@/hooks';
import { storageService, revenueCatService, notificationService, widgetService, analytics } from '@/services';
import { 
  VERSE_CATEGORIES, 
  MIX_LIMITS,
  type VerseCategory,
  type UserCustomMix,
  type ActiveMixReference,
  type MixType,
} from '@/types';
import { MixCard } from '@/components/MixCard';

// ============================================================================
// Constants
// ============================================================================

const PERSONALIZED_MIX_ID = 'personalized-mix';
const FAVORITES_MIX_ID = 'favorites-mix';
const CUSTOM_PHRASES_MIX_ID = 'custom-phrases-mix';

// ============================================================================
// SectionHeader Component
// ============================================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  delay?: number;
  rightElement?: React.ReactNode;
}

function SectionHeader({ title, subtitle, delay = 0, rightElement }: SectionHeaderProps) {
  const colors = useColors();

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(300)}
      style={styles.sectionHeader}
    >
      <View style={styles.sectionHeaderContent}>
        <View style={styles.sectionHeaderText}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
        {rightElement}
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Categorías asignadas al usuario (las del mix personalizado desde onboarding)
  const [mixCategories, setMixCategories] = useState<VerseCategory[]>([]);
  // Mixes custom creados por el usuario
  const [userCustomMixes, setUserCustomMixes] = useState<UserCustomMix[]>([]);
  // Mix activo
  const [activeMix, setActiveMix] = useState<ActiveMixReference | null>(null);
  // Contadores
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [customPhrasesCount, setCustomPhrasesCount] = useState(0);
  // Estado premium
  const [isPremium, setIsPremium] = useState(false);

  // Cargar datos cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [profile, favorites, customPhrases, customMixes, currentActiveMix, hasSubscription] = await Promise.all([
        storageService.getProfile(),
        storageService.getFavorites(),
        storageService.getCustomPhrases(),
        storageService.getUserCustomMixes(),
        storageService.getActiveMix(),
        revenueCatService.hasActiveSubscription(),
      ]);

      const userMixCategories = profile?.assignedCategories || ['faith', 'strength', 'love'];
      setMixCategories(userMixCategories);
      setUserCustomMixes(customMixes);
      setFavoritesCount(favorites?.length || 0);
      setCustomPhrasesCount(customPhrases?.length || 0);
      setIsPremium(hasSubscription);
      
      // Si no hay mix activo, establecer el personalizado por defecto
      if (currentActiveMix) {
        setActiveMix(currentActiveMix);
      } else {
        const defaultMix: ActiveMixReference = { mixId: PERSONALIZED_MIX_ID, mixType: 'personalized' };
        setActiveMix(defaultMix);
        await storageService.setActiveMix(defaultMix);
      }
    } catch (error) {
      console.error('Error loading categories data:', error);
    }
  };

  // Mixes de categorías "Para ti" (las del mix del usuario desde onboarding)
  const forYouCategoryMixes = useMemo(() => {
    return VERSE_CATEGORIES.filter(cat => mixCategories.includes(cat.id));
  }, [mixCategories]);

  // Mixes de categorías "Explorar" (las que no están en el mix)
  const exploreCategoryMixes = useMemo(() => {
    return VERSE_CATEGORIES.filter(cat => !mixCategories.includes(cat.id));
  }, [mixCategories]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Activar un mix
  const activateMix = useCallback(async (mixId: string, mixType: MixType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newActiveMix: ActiveMixReference = { mixId, mixType };
    setActiveMix(newActiveMix);
    await storageService.setActiveMix(newActiveMix);
    
    // Track mix activation
    analytics.track('mix_activated', {
      mix_id: mixId,
      mix_type: mixType,
    });
    
    // Actualizar notificaciones con versículos del nuevo mix
    await notificationService.updateNotificationsFromStorage();
    
    // Sincronizar widget con el nuevo mix
    await widgetService.syncVersesToWidget();
  }, []);

  // Verificar si un mix está activo
  const isMixActive = useCallback((mixId: string) => {
    return activeMix?.mixId === mixId;
  }, [activeMix]);

  // Handler para mix personalizado del onboarding
  const handlePersonalizedMixPress = useCallback(() => {
    activateMix(PERSONALIZED_MIX_ID, 'personalized');
  }, [activateMix]);

  // Handler para mix de favoritos
  const handleFavoritesMixPress = useCallback(() => {
    if (favoritesCount < MIX_LIMITS.MIN_FAVORITES_REQUIRED) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    activateMix(FAVORITES_MIX_ID, 'favorites');
  }, [activateMix, favoritesCount]);

  // Handler para mix de frases propias
  const handleCustomPhrasesMixPress = useCallback(() => {
    if (!isPremium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      analytics.track('paywall_viewed', { source: 'categories_custom_phrases' });
      router.push('/paywall');
      return;
    }
    if (customPhrasesCount === 0) {
      // Si no tiene frases, navegar a crearlas
      router.push('/custom-phrases');
      return;
    }
    activateMix(CUSTOM_PHRASES_MIX_ID, 'custom_phrases');
  }, [activateMix, isPremium, customPhrasesCount, router]);

  // Handler para mix de categoría individual
  const handleCategoryMixPress = useCallback((categoryId: VerseCategory, isPremiumCategory: boolean) => {
    if (isPremiumCategory && !isPremium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      analytics.track('paywall_viewed', { source: 'categories_premium_category', category: categoryId });
      router.push('/paywall');
      return;
    }
    activateMix(`category-${categoryId}`, 'category');
  }, [activateMix, isPremium, router]);

  // Handler para mix custom del usuario
  const handleUserCustomMixPress = useCallback((mix: UserCustomMix) => {
    activateMix(mix.id, 'user_custom');
  }, [activateMix]);

  // Handler para crear nuevo mix
  const handleCreateMixPress = useCallback(() => {
    if (!isPremium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      analytics.track('paywall_viewed', { source: 'categories_create_mix' });
      router.push('/paywall');
      return;
    }
    if (userCustomMixes.length >= MIX_LIMITS.MAX_USER_CUSTOM_MIXES) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // TODO: Mostrar alerta de límite alcanzado
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/create-mix');
  }, [isPremium, userCustomMixes.length, router]);

  // Handler para editar frases personalizadas
  const handleEditCustomPhrasesPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/custom-phrases');
  }, [router]);

  // Handler para ver favoritos
  const handleViewFavoritesPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/favorites');
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: Spacing.m }]}
      >
        <Pressable 
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]} 
          onPress={handleBack}
        >
          <FontAwesome name="times" size={18} color={colors.text} />
        </Pressable>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Categorías</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Explorá la Palabra de Dios
          </Text>
        </View>

        {/* Sección: Mis Mezclas (custom del usuario) */}
        {(userCustomMixes.length > 0 || isPremium) && (
          <>
            <SectionHeader 
              title="Mis mezclas" 
              subtitle={`${userCustomMixes.length}/${MIX_LIMITS.MAX_USER_CUSTOM_MIXES} mezclas creadas`}
              delay={0}
              rightElement={
                userCustomMixes.length < MIX_LIMITS.MAX_USER_CUSTOM_MIXES && (
                  <Pressable
                    style={[styles.createButton, { backgroundColor: colors.primary }]}
                    onPress={handleCreateMixPress}
                  >
                    <FontAwesome name="plus" size={14} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Crear</Text>
                  </Pressable>
                )
              }
            />
            <View style={styles.tilesGrid}>
              {userCustomMixes.map((mix, index) => (
                <MixCard
                  key={mix.id}
                  name={mix.name}
                  icon={mix.icon}
                  color={mix.color}
                  isActive={isMixActive(mix.id)}
                  count={mix.categories.length}
                  countSuffix="categorías"
                  onPress={() => handleUserCustomMixPress(mix)}
                  index={index}
                />
              ))}
            </View>
          </>
        )}

        {/* Botón para crear mezcla (solo si no es premium o no tiene mixes) */}
        {!isPremium && userCustomMixes.length === 0 && (
          <Animated.View entering={FadeInDown.delay(50).duration(300)}>
            <Pressable
              style={[styles.createMixBanner, { backgroundColor: colors.primary }]}
              onPress={handleCreateMixPress}
            >
              <View style={styles.createMixBannerContent}>
                <FontAwesome name="plus-circle" size={24} color="#FFFFFF" />
                <View style={styles.createMixBannerText}>
                  <Text style={styles.createMixBannerTitle}>Crear mi mezcla</Text>
                  <Text style={styles.createMixBannerSubtitle}>
                    Combiná tus categorías favoritas en una sola mezcla
                  </Text>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={14} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
        )}

        {/* Sección principal: Mix Personalizado, Favoritos, Frases propias */}
        <SectionHeader 
          title="Colecciones" 
          subtitle="Tus versículos especiales"
          delay={50}
        />
        <View style={styles.tilesGrid}>
          {/* Mix Personalizado (del onboarding) */}
          <MixCard
            name="Mix Personalizado"
            icon="magic"
            color={colors.primary}
            isActive={isMixActive(PERSONALIZED_MIX_ID)}
            count={mixCategories.length}
            countSuffix="categorías"
            onPress={handlePersonalizedMixPress}
            index={0}
          />

          {/* Mis Favoritos */}
          <MixCard
            name="Mis favoritos"
            icon="heart"
            color="#EF4444"
            isActive={isMixActive(FAVORITES_MIX_ID)}
            count={favoritesCount}
            countSuffix="versículos"
            isLocked={favoritesCount < MIX_LIMITS.MIN_FAVORITES_REQUIRED}
            lockMessage={`Mínimo ${MIX_LIMITS.MIN_FAVORITES_REQUIRED} favoritos`}
            onPress={handleFavoritesMixPress}
            index={1}
          />

          {/* Mis Propias Frases */}
          <MixCard
            name="Mis propios versículos"
            icon="pencil"
            color="#6366F1"
            isActive={isMixActive(CUSTOM_PHRASES_MIX_ID)}
            count={customPhrasesCount}
            countSuffix="versículos"
            isLocked={!isPremium}
            lockMessage="Premium"
            onPress={handleCustomPhrasesMixPress}
            index={2}
          />
        </View>

        {/* Acciones rápidas para favoritos y frases */}
        <View style={styles.quickActions}>
          <Pressable
            style={[styles.quickActionButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleViewFavoritesPress}
          >
            <FontAwesome name="heart-o" size={14} color={colors.textSecondary} />
            <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>Ver favoritos</Text>
          </Pressable>
          <Pressable
            style={[styles.quickActionButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={handleEditCustomPhrasesPress}
          >
            <FontAwesome name="pencil" size={14} color={colors.textSecondary} />
            <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>Editar versículos</Text>
          </Pressable>
        </View>

        {/* Para ti - Mixes de categorías del onboarding */}
        <SectionHeader 
          title="Para ti" 
          subtitle="Basado en tus preferencias"
          delay={150}
        />
        <View style={styles.tilesGrid}>
          {forYouCategoryMixes.map((category, index) => (
            <MixCard
              key={category.id}
              name={category.name}
              icon={category.icon}
              color={category.color}
              isActive={isMixActive(`category-${category.id}`)}
              isLocked={category.isPremium && !isPremium}
              lockMessage="Premium"
              onPress={() => handleCategoryMixPress(category.id, category.isPremium || false)}
              index={index}
            />
          ))}
        </View>

        {/* Explorar - Mixes de otras categorías */}
        {exploreCategoryMixes.length > 0 && (
          <>
            <SectionHeader 
              title="Explorar" 
              subtitle="Descubrí más categorías"
              delay={250}
            />
            <View style={styles.tilesGrid}>
              {exploreCategoryMixes.map((category, index) => (
                <MixCard
                  key={category.id}
                  name={category.name}
                  icon={category.icon}
                  color={category.color}
                  isActive={isMixActive(`category-${category.id}`)}
                  isLocked={category.isPremium && !isPremium}
                  lockMessage="Premium"
                  onPress={() => handleCategoryMixPress(category.id, category.isPremium || false)}
                  index={index}
                />
              ))}
            </View>
          </>
        )}

        {/* Banner Premium */}
        {!isPremium && (
          <Animated.View entering={FadeInDown.delay(350).duration(400)}>
            <Pressable
              style={[styles.premiumBanner, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                analytics.track('paywall_viewed', { source: 'categories_premium_banner' });
                router.push('/paywall');
              }}
            >
              <View style={styles.premiumBannerContent}>
                <FontAwesome name="star" size={20} color={colors.primary} />
                <View style={styles.premiumBannerText}>
                  <Text style={[styles.premiumBannerTitle, { color: colors.text }]}>
                    Desbloquea todo
                  </Text>
                  <Text style={[styles.premiumBannerSubtitle, { color: colors.textSecondary }]}>
                    Crea tus propias mezclas y accedé a todas las categorías bíblicas
                  </Text>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.m,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.l,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.body,
    marginTop: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.l,
  },

  // Section Header
  sectionHeader: {
    marginBottom: Spacing.m,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.caption,
    marginTop: 2,
  },

  // Create Button
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    borderRadius: BorderRadius.md,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Create Mix Banner
  createMixBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  createMixBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    flex: 1,
  },
  createMixBannerText: {
    flex: 1,
  },
  createMixBannerTitle: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  createMixBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Typography.fontSize.caption,
    marginTop: 2,
  },

  // Tiles Grid (2 columnas)
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginBottom: Spacing.xl,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.s,
    marginBottom: Spacing.xl,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.md,
  },
  quickActionText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
  },

  // Premium Banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginTop: Spacing.m,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    flex: 1,
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  premiumBannerSubtitle: {
    fontSize: Typography.fontSize.caption,
    marginTop: 2,
  },
});
