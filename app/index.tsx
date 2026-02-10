// ============================================================================
// Home Screen - Versículos Full Screen con swipe vertical
// ============================================================================

import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
  ViewToken,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography } from '@/constants/theme';
import { useTheme, useColors } from '@/hooks';
import { storageService, verseService, useVerseAudio, revenueCatService, deepLinkService, analytics, notificationService } from '@/services';
import { AppBackground, getTextColorForBackground } from '@/components/AppBackground';
import { StreakCelebration } from '@/components/StreakCelebration';
import type { Verse, AppBackgroundType, ActiveMixReference, VerseCategory, UserCustomMix, StreakData } from '@/types';
import { VERSE_CATEGORIES, MIX_LIMITS, AUDIO_LIMITS } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();

  // Estado
  const [affirmations, setAffirmations] = useState<Verse[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userBackground, setUserBackground] = useState<AppBackgroundType>('default');
  const [isPremium, setIsPremium] = useState(true); // Default true para no mostrar mientras carga
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);

  // Ref para el FlatList
  const flatListRef = useRef<Animated.FlatList<Verse>>(null);
  
  // Ref para trackear si ya se cargaron los versículos inicialmente
  const hasLoadedInitially = useRef(false);
  // Ref para el mix activo actual (para detectar cambios)
  const currentMixRef = useRef<string | null>(null);
  // Ref para el ID de versículo del deep link
  const pendingDeepLinkAffirmationId = useRef<string | null>(null);

  // Hook de audio
  const { isPlaying, currentAudioUrl, togglePlay, stop } = useVerseAudio();

  // Color de texto según el fondo
  const textColor = useMemo(
    () => getTextColorForBackground(userBackground, isDark),
    [userBackground, isDark]
  );

  // Ref para acceder a los versículos actuales desde el handler
  const affirmationsRef = useRef<Verse[]>([]);

  // Mantener el ref actualizado
  useEffect(() => {
    affirmationsRef.current = affirmations;
  }, [affirmations]);

  // Manejar deep links (widget y notificaciones)
  useEffect(() => {
    // Verificar si hay un deep link pendiente al montar
    const pendingId = deepLinkService.getPendingVerseId();
    if (pendingId) {
      console.log('📱 HomeScreen: Deep link pendiente encontrado:', pendingId);
      pendingDeepLinkAffirmationId.current = pendingId;
      deepLinkService.clearPendingVerseId();
    }

    // Registrar handler para deep links futuros
    const handleDeepLink = (affirmationId: string) => {
      console.log('📱 Procesando deep link en HomeScreen:', affirmationId);
      console.log('📱 Versículos actuales:', affirmationsRef.current.length);

      // Si ya tenemos versículos, reordenar para mostrar este primero
      if (affirmationsRef.current.length > 0) {
        const currentAffirmations = affirmationsRef.current;
        const affirmationIndex = currentAffirmations.findIndex(a => a.id === affirmationId);

        if (affirmationIndex !== -1) {
          console.log('📱 Versículo encontrado en índice:', affirmationIndex);
          const reordered = [...currentAffirmations];
          const [targetAffirmation] = reordered.splice(affirmationIndex, 1);
          reordered.unshift(targetAffirmation);
          setAffirmations(reordered);
          setCurrentIndex(0);
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        } else {
          console.log('📱 Versículo no encontrado en el array actual, guardando como pendiente');
          pendingDeepLinkAffirmationId.current = affirmationId;
        }
      } else {
        // Guardar para procesar cuando se carguen los versículos
        console.log('📱 No hay versículos cargados, guardando como pendiente');
        pendingDeepLinkAffirmationId.current = affirmationId;
      }
    };

    deepLinkService.registerHandler(handleDeepLink);

    return () => {
      deepLinkService.unregisterHandler();
    };
  }, []); // Sin dependencias - solo se ejecuta al montar

  // Función para cargar versículos según el mix activo
  const loadAffirmationsForMix = async (
    activeMix: ActiveMixReference | null,
    defaultCategories: VerseCategory[],
    userFavorites: { id: string; text: string; category: string }[],
    isPremiumUser: boolean
  ): Promise<Verse[]> => {
    // Helper para filtrar categorías según acceso premium
    const filterCategoriesByAccess = (categories: VerseCategory[]): VerseCategory[] => {
      if (isPremiumUser) return categories;
      // Si no es premium, solo incluir categorías gratuitas
      return categories.filter(catId => {
        const catConfig = VERSE_CATEGORIES.find(c => c.id === catId);
        return catConfig && !catConfig.isPremium;
      });
    };

    // Si no hay mix activo, usar el mix personalizado (categorías del onboarding)
    if (!activeMix) {
      const accessibleCategories = filterCategoriesByAccess(defaultCategories);
      return verseService.getVersesByCategories(accessibleCategories);
    }

    switch (activeMix.mixType) {
      case 'personalized': {
        // Mix del onboarding - filtra según acceso premium
        const accessibleCategories = filterCategoriesByAccess(defaultCategories);
        return verseService.getVersesByCategories(accessibleCategories);
      }

      case 'category': {
        // Mix de una sola categoría - extraer categoryId del mixId
        const categoryId = activeMix.mixId.replace('category-', '') as VerseCategory;
        // Verificar si tiene acceso a esta categoría
        const catConfig = VERSE_CATEGORIES.find(c => c.id === categoryId);
        if (catConfig?.isPremium && !isPremiumUser) {
          // No tiene acceso, usar categorías por defecto filtradas
          const accessibleCategories = filterCategoriesByAccess(defaultCategories);
          return verseService.getVersesByCategories(accessibleCategories);
        }
        return verseService.getVersesByCategory(categoryId);
      }

      case 'favorites': {
        // Mix de favoritos - convertir favoritos a formato Verse
        return userFavorites.map((fav) => ({
          id: fav.id,
          text: fav.text,
          audioSource: undefined,
          audioDuration: undefined,
        }));
      }

      case 'custom_phrases': {
        // Mix de frases propias
        if (!isPremiumUser) {
          return verseService.getVersesByCategories(defaultCategories);
        }
        const customPhrases = await storageService.getCustomPhrases();
        return customPhrases.map((phrase) => ({
          id: phrase.id,
          text: phrase.text,
          audioSource: undefined,
          audioDuration: undefined,
        }));
      }

      case 'user_custom': {
        // Mix custom del usuario - obtener categorías del mix guardado
        if (!isPremiumUser) {
          const accessibleCategories = filterCategoriesByAccess(defaultCategories);
          return verseService.getVersesByCategories(accessibleCategories);
        }
        const userMixes = await storageService.getUserCustomMixes();
        const userMix = userMixes.find((m: UserCustomMix) => m.id === activeMix.mixId);
        if (userMix && userMix.categories.length > 0) {
          // Premium users tienen acceso a todas las categorías de su mix custom
          return verseService.getVersesByCategories(userMix.categories);
        }
        return verseService.getVersesByCategories(defaultCategories);
      }

      default: {
        const accessibleCategories = filterCategoriesByAccess(defaultCategories);
        return verseService.getVersesByCategories(accessibleCategories);
      }
    }
  };

  // Cargar datos cuando la pantalla obtiene foco
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          // Verificar si el usuario es premium
          let hasSubscription = false;
          try {
            hasSubscription = await revenueCatService.hasActiveSubscription();
            setIsPremium(hasSubscription);
          } catch (error) {
            console.error('Error checking premium status:', error);
            setIsPremium(false);
          }

          // Obtener datos del usuario
          const userData = await storageService.getUserData();
          if (!userData) return;

          const { profile, favorites: userFavorites } = userData;

          // Guardar el background seleccionado
          setUserBackground(profile.appBackground || 'default');

          // Registrar la visita de hoy para la racha
          const previousStreak = await storageService.getStreakData();
          const previousLastActivity = previousStreak?.lastActivityDate 
            ? new Date(previousStreak.lastActivityDate) 
            : null;
          
          // Formatear fecha a local ISO para comparar
          const formatToLocalISO = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          const todayLocal = formatToLocalISO(new Date());
          const lastActivityLocal = previousLastActivity 
            ? formatToLocalISO(previousLastActivity)
            : null;
          
          // Verificar si es un nuevo día (debemos mostrar celebración)
          const isNewDay = lastActivityLocal !== todayLocal;
          
          const updatedStreak = await storageService.incrementStreak();
          
          // Cancelar la notificación de recordatorio de racha (ya completó hoy)
          notificationService.cancelStreakReminder().catch(() => {});
          
          if (updatedStreak) {
            setStreakData(updatedStreak);
            
            // Mostrar celebración solo si es un nuevo día
            if (isNewDay) {
              // Verificar si alcanzó un milestone (3, 7, 14, 21, 30, 60, 90, 100, 180, 365 días)
              const milestones = [3, 7, 14, 21, 30, 60, 90, 100, 180, 365];
              if (milestones.includes(updatedStreak.currentStreak)) {
                analytics.track('streak_milestone_reached', { 
                  streak_days: updatedStreak.currentStreak,
                  is_longest_streak: updatedStreak.currentStreak === updatedStreak.longestStreak
                });
              }
              
              // Pequeño delay para que la pantalla cargue primero
              setTimeout(() => {
                setShowStreakCelebration(true);
              }, 500);
            }
          }

          // Guardar favoritos como Set para búsqueda O(1)
          setFavorites(new Set(userFavorites.map((f) => f.id)));

          // Obtener el mix activo
          const activeMix = await storageService.getActiveMix();
          const activeMixId = activeMix ? `${activeMix.mixType}-${activeMix.mixId}` : 'personalized';
          
          // Solo recargar versículos si:
          // 1. Es la primera carga (hasLoadedInitially es false)
          // 2. El mix cambió desde la última carga
          const shouldReloadAffirmations = !hasLoadedInitially.current || currentMixRef.current !== activeMixId;
          
          if (shouldReloadAffirmations) {
            setIsLoading(true);
            
            // Cargar versículos según el mix activo
            const loadedAffirmations = await loadAffirmationsForMix(
              activeMix,
              profile.assignedCategories || ['faith', 'strength', 'love'],
              userFavorites,
              hasSubscription
            );
            
            let shuffled = shuffleArray([...loadedAffirmations]);
            
            // Si hay un deep link pendiente, mover ese versículo al inicio
            if (pendingDeepLinkAffirmationId.current) {
              const deepLinkId = pendingDeepLinkAffirmationId.current;
              const affirmationIndex = shuffled.findIndex(a => a.id === deepLinkId);
              if (affirmationIndex !== -1) {
                console.log('📱 Mostrando versículo del deep link primero:', deepLinkId);
                const [targetAffirmation] = shuffled.splice(affirmationIndex, 1);
                shuffled.unshift(targetAffirmation);
              }
              pendingDeepLinkAffirmationId.current = null;
            }
            
            setAffirmations(shuffled);
            
            // Resetear al primer slide cuando cambian los versículos
            setCurrentIndex(0);
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            
            // Marcar que ya cargamos y guardar el mix actual
            hasLoadedInitially.current = true;
            currentMixRef.current = activeMixId;
            
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error cargando datos:', error);
          setIsLoading(false);
        }
      };
      
      loadData();
    }, [])
  );

  // Toggle favorito
  const handleToggleFavorite = useCallback(async (affirmation: Verse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isFavorite = favorites.has(affirmation.id);

    if (isFavorite) {
      await storageService.removeFavorite(affirmation.id);
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(affirmation.id);
        return next;
      });
      
      // Track unfavorite
      const unfavoriteCategory = verseService.getCategoryForVerse(affirmation.id);
      analytics.track('verse_unfavorited', {
        verse_id: affirmation.id,
        category: unfavoriteCategory || 'custom',
      });
    } else {
      const favoriteCategory = verseService.getCategoryForVerse(affirmation.id);
      await storageService.addFavorite({
        id: affirmation.id,
        text: affirmation.text,
        reference: affirmation.reference || '',
        category: favoriteCategory || 'custom',
      });
      setFavorites((prev) => new Set(prev).add(affirmation.id));
      
      // Track favorite
      analytics.track('verse_favorited', {
        verse_id: affirmation.id,
        category: favoriteCategory || 'custom',
      });
    }
  }, [favorites]);

  // Compartir versículo
  const handleShare = useCallback((affirmation: Verse) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const shareCategory = verseService.getCategoryForVerse(affirmation.id);
    router.push({
      pathname: '/share',
      params: {
        text: affirmation.text,
        reference: affirmation.reference || '',
        backgroundType: userBackground,
        affirmationId: affirmation.id,
        category: shareCategory || 'custom',
      },
    });
  }, [router, userBackground]);

  // Play audio
  const handlePlayAudio = useCallback(async (affirmation: Verse) => {
    if (!affirmation.audioSource) return;

    // Si es premium, reproducir sin restricciones
    if (isPremium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      togglePlay(affirmation.audioSource);
      
      // Track audio played
      const audioCategory = verseService.getCategoryForVerse(affirmation.id);
      analytics.track('verse_audio_played', {
        verse_id: affirmation.id,
        category: audioCategory || 'custom',
        is_premium: true,
      });
      return;
    }

    // Verificar si ya reprodujo este versículo antes
    const alreadyPlayed = await storageService.hasPlayedAffirmation(affirmation.id);
    
    if (alreadyPlayed) {
      // Si ya la reprodujo antes, puede reproducirla de nuevo
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      togglePlay(affirmation.audioSource);
      
      // Track audio played
      const alreadyPlayedCategory = verseService.getCategoryForVerse(affirmation.id);
      analytics.track('verse_audio_played', {
        verse_id: affirmation.id,
        category: alreadyPlayedCategory || 'custom',
        is_premium: false,
      });
      return;
    }

    // Verificar límite de reproducciones
    const playedCount = await storageService.getPlayedAudioCount();
    
    if (playedCount >= AUDIO_LIMITS.MAX_FREE_AUDIO_PLAYS) {
      // Alcanzó el límite
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Límite de reproducciones alcanzado',
        `Ya escuchaste ${AUDIO_LIMITS.MAX_FREE_AUDIO_PLAYS} versículos diferentes. Hacéte premium para escuchar todos los versículos sin límites.`,
        [
          { text: 'Cerrar', style: 'cancel' },
          { 
            text: 'Ser Premium', 
            onPress: () => {
              analytics.track('paywall_viewed', { source: 'audio_limit' });
              router.push('/paywall');
            },
            style: 'default'
          },
        ]
      );
      return;
    }

    // Registrar la reproducción y reproducir
    await storageService.addPlayedAudioAffirmation(affirmation.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    togglePlay(affirmation.audioSource);
    
    // Track audio played
    const newPlayCategory = verseService.getCategoryForVerse(affirmation.id);
    analytics.track('verse_audio_played', {
      verse_id: affirmation.id,
      category: newPlayCategory || 'custom',
      is_premium: false,
    });
  }, [togglePlay, isPremium, router]);

  // Detener audio cuando cambia el slide
  useEffect(() => {
    // Detenemos el audio al cambiar de slide
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Callback cuando cambia el item visible
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      
      // Track verse viewed
      const viewedItem = viewableItems[0].item as Verse;
      if (viewedItem) {
        const viewedCategory = verseService.getCategoryForVerse(viewedItem.id);
        analytics.track('verse_viewed', {
          verse_id: viewedItem.id,
          category: viewedCategory || 'custom',
          index: viewableItems[0].index,
        });
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Render de cada versículo
  const renderItem = useCallback(
    ({ item, index }: { item: Affirmation; index: number }) => (
      <AffirmationSlide
        affirmation={item}
        isFavorite={favorites.has(item.id)}
        isPlayingAudio={isPlaying && currentAudioUrl === item.audioSource}
        onToggleFavorite={() => handleToggleFavorite(item)}
        onShare={() => handleShare(item)}
        onPlayAudio={() => handlePlayAudio(item)}
        textColor={textColor}
        insets={insets}
        isActive={index === currentIndex}
      />
    ),
    [favorites, handleToggleFavorite, handleShare, handlePlayAudio, textColor, insets, currentIndex, isPlaying, currentAudioUrl]
  );

  const keyExtractor = useCallback((item: Affirmation) => item.id, []);

  if (isLoading) {
    return (
      <AppBackground backgroundType={userBackground}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={textColor} />
        </View>
      </AppBackground>
    );
  }

  return (
    <AppBackground backgroundType={userBackground}>
      <Animated.FlatList
        ref={flatListRef}
        data={affirmations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        // Optimizaciones
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
      />

      {/* Botón premium (solo si no es premium) */}
      {!isPremium && (
        <Pressable
          style={[styles.premiumButton, { top: insets.top + Spacing.s, backgroundColor: colors.backgroundSecondary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            analytics.track('paywall_viewed', { source: 'home_premium_button' });
            router.push('/paywall');
          }}
        >
          <FontAwesome name="star" size={16} color={colors.primary} />
          <Text style={[styles.premiumButtonText, { color: colors.primary }]}>Premium</Text>
        </Pressable>
      )}

      {/* Indicador de progreso de favoritos */}
      <FavoritesProgress 
        current={favorites.size} 
        required={MIX_LIMITS.MIN_FAVORITES_REQUIRED}
        top={insets.top + Spacing.s}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/categories');
        }}
      />

      {/* Indicador de swipe (solo en el primer versículo) */}
      {currentIndex === 0 && (
        <SwipeHint textColor={textColor} bottom={insets.bottom + 40} />
      )}

      {/* Botón de categorías - abajo izquierda */}
      <Pressable
        style={[styles.bottomButtonLeft, { bottom: insets.bottom + Spacing.l, backgroundColor: colors.backgroundSecondary }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/categories');
        }}
      >
        <FontAwesome name="th-large" size={18} color={colors.primary} />
      </Pressable>

      {/* Botones derechos - perfil arriba, temas abajo */}
      <View style={[styles.bottomButtonsRight, { bottom: insets.bottom + Spacing.l }]}>
        {/* Botón de perfil */}
        <Pressable
          style={[styles.bottomButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/profile');
          }}
        >
          <FontAwesome name="user" size={20} color={colors.primary} />
        </Pressable>

        {/* Botón de temas */}
        <Pressable
          style={[styles.bottomButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/theme-explore');
          }}
        >
          <FontAwesome name="paint-brush" size={18} color={colors.primary} />
        </Pressable>
      </View>

      {/* Streak Celebration Toast */}
      <StreakCelebration
        visible={showStreakCelebration}
        streakData={streakData}
        onClose={() => {
          setShowStreakCelebration(false);
        }}
        autoCloseDelay={3000}
      />
    </AppBackground>
  );
}

// ============================================================================
// FavoritesProgress - Indicador de progreso para desbloquear mix de favoritos
// ============================================================================

interface FavoritesProgressProps {
  current: number;
  required: number;
  top: number;
  onPress: () => void;
}

function FavoritesProgress({ current, required, top, onPress }: FavoritesProgressProps) {
  const colors = useColors();
  const progress = Math.min(current / required, 1);
  const remaining = Math.max(required - current, 0);
  const isComplete = current >= required;
  
  // Animaciones - deben estar ANTES del return condicional
  const scale = useSharedValue(1);
  const progressWidth = useSharedValue(0);
  const heartScale = useSharedValue(1);

  // Animar la barra de progreso
  useEffect(() => {
    if (!isComplete) {
      progressWidth.value = withDelay(
        300,
        withSpring(progress, { damping: 15, stiffness: 100 })
      );
    }
  }, [progress, isComplete, progressWidth]);

  // Animación del corazón cuando cambia el número de favoritos
  useEffect(() => {
    if (current > 0 && !isComplete) {
      heartScale.value = withSequence(
        withTiming(1.3, { duration: 150, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
      );
    }
  }, [current, isComplete, heartScale]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  // No mostrar si ya tiene suficientes favoritos
  if (isComplete) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(500).duration(400).springify()}
      exiting={FadeOut.duration(300)}
      style={[styles.favoritesProgressContainer, { top }]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.favoritesProgressPill,
            { backgroundColor: colors.backgroundSecondary },
            containerAnimatedStyle,
          ]}
        >
          {/* Corazón animado */}
          <Animated.View style={heartAnimatedStyle}>
            <FontAwesome name="heart" size={14} color={colors.primary} />
          </Animated.View>

          {/* Texto de progreso */}
          <View style={styles.favoritesProgressTextContainer}>
            <Text style={[styles.favoritesProgressCount, { color: colors.text }]}>
              {current}/{required}
            </Text>
            <Text style={[styles.favoritesProgressLabel, { color: colors.textSecondary }]}>
              {remaining === 1 ? 'falta 1 más' : `faltan ${remaining} más`}
            </Text>
          </View>

          {/* Barra de progreso */}
          <View style={[styles.favoritesProgressBarBg, { backgroundColor: colors.border }]}>
            <Animated.View
              style={[
                styles.favoritesProgressBarFill,
                { backgroundColor: colors.primary },
                progressBarStyle,
              ]}
            />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// AffirmationSlide - Componente de cada slide de versículo
// ============================================================================

interface AffirmationSlideProps {
  affirmation: Affirmation;
  isFavorite: boolean;
  isPlayingAudio: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  onPlayAudio: () => void;
  textColor: string;
  insets: { top: number; bottom: number };
  isActive: boolean;
}

function AffirmationSlide({
  affirmation,
  isFavorite,
  isPlayingAudio,
  onToggleFavorite,
  onShare,
  onPlayAudio,
  textColor,
  insets,
  isActive,
}: AffirmationSlideProps) {
  const colors = useColors();
  
  // Animación del corazón
  const heartScale = useSharedValue(1);

  const handleFavoritePress = () => {
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 100, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 150, easing: Easing.inOut(Easing.ease) })
    );
    onToggleFavorite();
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  return (
    <View style={styles.slideContainer}>
      {/* Contenido principal centrado */}
      <View style={styles.contentContainer}>
        {/* Texto del versículo */}
        <Animated.Text
          entering={isActive ? FadeIn.delay(200).duration(500) : undefined}
          style={[styles.affirmationText, { color: textColor }]}
        >
          {affirmation.text}
        </Animated.Text>

        {/* Referencia bíblica */}
        {affirmation.reference && (
          <Animated.Text
            entering={isActive ? FadeIn.delay(400).duration(400) : undefined}
            style={[styles.referenceText, { color: textColor }]}
          >
            — {affirmation.reference}
          </Animated.Text>
        )}
      </View>

      {/* Botones de acción - debajo del versículo */}
      <View style={styles.actionsContainer}>
        {/* Botón de audio (si tiene) */}
        {affirmation.audioSource && (
          <ActionButton
            icon={isPlayingAudio ? 'pause' : 'volume-up'}
            onPress={onPlayAudio}
            color={textColor}
            isActive={isPlayingAudio}
          />
        )}

        {/* Botón de favorito */}
        <Animated.View style={heartAnimatedStyle}>
          <ActionButton
            icon={isFavorite ? 'heart' : 'heart-o'}
            onPress={handleFavoritePress}
            color={isFavorite ? colors.primary : textColor}
            isActive={isFavorite}
          />
        </Animated.View>

        {/* Botón de compartir */}
        <ActionButton
          icon="share"
          onPress={onShare}
          color={textColor}
        />
      </View>
    </View>
  );
}

// ============================================================================
// ActionButton - Botón de acción circular
// ============================================================================

interface ActionButtonProps {
  icon: string;
  onPress: () => void;
  color: string;
  isActive?: boolean;
}

function ActionButton({ icon, onPress, color, isActive }: ActionButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Determinar el color de fondo basado en si el texto es claro u oscuro
  // Si el color del texto es claro (ej: blanco), usar fondo oscuro transparente
  // Si el color del texto es oscuro (ej: negro), usar fondo claro transparente
  const isLightColor = color === '#FFFFFF' || color === '#F9FAFB' || color.toLowerCase().startsWith('#f');
  const buttonBackground = isLightColor 
    ? 'rgba(0, 0, 0, 0.25)' 
    : 'rgba(255, 255, 255, 0.7)';

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.actionButton, animatedStyle, { backgroundColor: buttonBackground }]}>
        <FontAwesome name={icon as any} size={20} color={color} />
      </Animated.View>
    </Pressable>
  );
}

// ============================================================================
// SwipeHint - Indicador animado de swipe
// ============================================================================

interface SwipeHintProps {
  textColor: string;
  bottom: number;
}

function SwipeHint({ textColor, bottom }: SwipeHintProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Animación de rebote infinita
    translateY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Repetir infinitamente
      false // No reverse
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.delay(1000).duration(500)}
      style={[styles.swipeHint, { bottom }]}
    >
      <Animated.View style={animatedStyle}>
        <FontAwesome name="chevron-up" size={20} color={textColor} style={{ opacity: 0.6 }} />
      </Animated.View>
      <Text style={[styles.swipeHintText, { color: textColor }]}>
        Deslizá para otro versículo
      </Text>
    </Animated.View>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  contentContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.9,
  },
  affirmationText: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    lineHeight: 40,
    fontFamily: Typography.fontFamily.heading,
  },
  referenceText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: Spacing.l,
    opacity: 0.7,
    fontStyle: 'italic',
    fontFamily: Typography.fontFamily.body,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxxl,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  swipeHintText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    opacity: 0.5,
  },
  counter: {
    position: 'absolute',
    left: Spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  counterText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  bottomButtonLeft: {
    position: 'absolute',
    left: Spacing.l,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomButtonsRight: {
    position: 'absolute',
    right: Spacing.l,
    gap: Spacing.m,
    alignItems: 'center',
  },
  bottomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumButton: {
    position: 'absolute',
    right: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: 20,
  },
  premiumButtonText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Favorites Progress
  favoritesProgressContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
    left: Spacing.xl,
  },
  favoritesProgressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    paddingVertical: Spacing.s,
    paddingHorizontal: Spacing.m,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoritesProgressTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  favoritesProgressCount: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.bold,
  },
  favoritesProgressLabel: {
    fontSize: Typography.fontSize.caption - 1,
    fontWeight: Typography.fontWeight.medium,
  },
  favoritesProgressBarBg: {
    width: 40,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  favoritesProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  // ⚠️ DEBUG - QUITAR DESPUÉS
  debugButton: {
    position: 'absolute',
    right: Spacing.l,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
