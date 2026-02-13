// ============================================================================
// VerseExplanationModal - Modal con la reflexion/explicacion del versiculo
// ============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useColors } from '@/hooks';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import { affirmationService, storageService, analytics } from '@/services';
import { getAvailableCategories } from '@/services/category.service';
import type { Affirmation, CategoryConfig } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AMEN_FILL_DURATION = 2500; // ms para llenar el botón
const PARTICLE_COUNT = 10;

// ============================================================================
// TitoParticle - Partícula de Tito Praying que sale del botón Amen
// ============================================================================

interface TitoParticleData {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  rotation: number;
}

function TitoParticle({ particle }: { particle: TitoParticleData }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const targetX = Math.cos(particle.angle) * particle.distance;
    const targetY = Math.sin(particle.angle) * particle.distance;

    translateX.value = withDelay(
      particle.delay,
      withTiming(targetX, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      particle.delay,
      withTiming(targetY, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
    scale.value = withDelay(
      particle.delay,
      withSequence(
        withSpring(1, { damping: 6, stiffness: 180 }),
        withDelay(150, withTiming(0, { duration: 400 }))
      )
    );
    opacity.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(500, withTiming(0, { duration: 300 }))
      )
    );
    rotation.value = withDelay(
      particle.delay,
      withTiming(particle.rotation, { duration: 900 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.titoParticle, animatedStyle]}>
      <Image
        source={require('@/assets/icons/titoPraying.png')}
        style={{ width: particle.size, height: particle.size }}
        contentFit="contain"
      />
    </Animated.View>
  );
}

// ============================================================================
// Types
// ============================================================================

interface Suggestion {
  affirmation: Affirmation;
  category: CategoryConfig;
}

interface VerseExplanationModalProps {
  visible: boolean;
  onClose: () => void;
  affirmation: Affirmation;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
  onShare: () => void;
  isPremium: boolean;
  onCategoryActivated?: (categoryId: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export function VerseExplanationModal({
  visible,
  onClose,
  affirmation: initialAffirmation,
  isPlayingAudio,
  onPlayAudio,
  onShare,
  isPremium,
  onCategoryActivated,
}: VerseExplanationModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  // State local para el versículo actual (permite navegar entre sugerencias)
  const [currentAffirmation, setCurrentAffirmation] = useState(initialAffirmation);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [contentKey, setContentKey] = useState(0); // para re-trigger animaciones

  // Sincronizar con el prop cuando cambia externamente
  useEffect(() => {
    setCurrentAffirmation(initialAffirmation);
  }, [initialAffirmation]);

  // Parsear titulo y referencia biblica
  const titleParts = (currentAffirmation.title || '').split(' — ');
  const mainText = titleParts[0];
  const bibleReference = titleParts.length > 1 ? titleParts[1] : null;

  // Cargar sugerencias cuando se abre el modal o cambia el versículo
  const loadSuggestions = useCallback(async () => {
    try {
      const categories = await getAvailableCategories();

      // Buscar una categoría free y una premium, distintas entre sí
      const freeCategories = categories.filter(c => !c.isPremium);
      const premiumCategories = categories.filter(c => c.isPremium);

      // Shuffle cada lista
      const shuffledFree = [...freeCategories].sort(() => Math.random() - 0.5);
      const shuffledPremium = [...premiumCategories].sort(() => Math.random() - 0.5);

      // Helper: buscar la primera categoría que tenga versículos
      const findSuggestion = async (cats: CategoryConfig[]): Promise<Suggestion | null> => {
        for (const cat of cats) {
          const aff = await affirmationService.getRandomAffirmation([cat.id]);
          if (aff) return { affirmation: aff, category: cat };
        }
        return null;
      };

      const [freeSuggestion, premiumSuggestion] = await Promise.all([
        findSuggestion(shuffledFree),
        findSuggestion(shuffledPremium),
      ]);

      const newSuggestions: Suggestion[] = [];
      if (freeSuggestion) newSuggestions.push(freeSuggestion);
      if (premiumSuggestion) newSuggestions.push(premiumSuggestion);

      setSuggestions(newSuggestions);
    } catch (error) {
      console.warn('[VerseExplanationModal] Error loading suggestions:', error);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [visible, currentAffirmation.id, loadSuggestions]);

  // Handler para tocar una sugerencia
  const handleSuggestionPress = useCallback(async (suggestion: Suggestion) => {
    // Si es premium y el user es free → paywall
    if (suggestion.category.isPremium && !isPremium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      analytics.track('paywall_viewed', { source: 'profundiza_suggestion', category: suggestion.category.id });
      onClose();
      router.push('/paywall');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Activar la categoría como mix activo
    await storageService.setActiveMix({
      mixId: `category-${suggestion.category.id}`,
      mixType: 'category',
    });

    analytics.track('affirmation_suggestion_tapped', {
      from_affirmation: currentAffirmation.id,
      to_affirmation: suggestion.affirmation.id,
      to_category: suggestion.category.id,
    });

    // Notificar al home
    onCategoryActivated?.(suggestion.category.id);

    // Actualizar el versículo mostrado
    setCurrentAffirmation(suggestion.affirmation);
    setContentKey(prev => prev + 1);

    // Scroll to top
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [isPremium, currentAffirmation.id, onClose, onCategoryActivated, router]);

  // Animaciones de botones
  const closeScale = useSharedValue(1);
  const playScale = useSharedValue(1);

  const closeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: closeScale.value }],
  }));

  const playAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  // Amen progress fill
  const [amenParticles, setAmenParticles] = useState<TitoParticleData[]>([]);
  const amenProgress = useSharedValue(0);
  const amenFillActive = useRef(false);

  const amenFillStyle = useAnimatedStyle(() => ({
    width: `${amenProgress.value * 100}%`,
  }));

  const onAmenComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const particles: TitoParticleData[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: Date.now() + i,
      angle: (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() - 0.5) * 0.5,
      distance: 60 + Math.random() * 100,
      size: 28 + Math.random() * 16,
      delay: Math.random() * 150,
      rotation: (Math.random() - 0.5) * 40,
    }));
    setAmenParticles(particles);
    setTimeout(() => {
      setAmenParticles([]);
      amenProgress.value = 0;
    }, 1500);
  };

  const handleAmenPressIn = () => {
    amenFillActive.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    amenProgress.value = withTiming(1, { duration: AMEN_FILL_DURATION, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(onAmenComplete)();
      }
    });
  };

  const handleAmenPressOut = () => {
    amenFillActive.current = false;
    if (amenProgress.value < 1) {
      amenProgress.value = withTiming(0, { duration: 200 });
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handlePlayAudio = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlayAudio();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShare();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop - cierra al tocar */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        {/* Card del modal */}
        <Animated.View
          entering={FadeInDown.duration(350).springify()}
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              maxHeight: SCREEN_HEIGHT * 0.85,
              marginBottom: insets.bottom,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {bibleReference && (
                <Text
                  style={[styles.bibleReference, { color: colors.primary }]}
                  numberOfLines={1}
                >
                  {bibleReference}
                </Text>
              )}
            </View>
            <Pressable
              onPress={handleClose}
              onPressIn={() => { closeScale.value = withSpring(0.9); }}
              onPressOut={() => { closeScale.value = withSpring(1); }}
            >
              <Animated.View
                style={[
                  styles.closeButton,
                  { backgroundColor: colors.surfaceSecondary },
                  closeAnimatedStyle,
                ]}
              >
                <FontAwesome name="times" size={14} color={colors.textSecondary} />
              </Animated.View>
            </Pressable>
          </View>

          {/* Contenido scrolleable */}
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Titulo del versiculo */}
            <Animated.Text
              key={`title-${contentKey}`}
              entering={FadeIn.duration(300)}
              style={[styles.verseTitle, { color: colors.text }]}
            >
              {mainText}
            </Animated.Text>

            {/* Separador */}
            <View style={styles.separatorContainer}>
              <View style={[styles.separator, { backgroundColor: colors.primary }]} />
            </View>

            {/* Texto de la reflexión */}
            <Animated.Text
              key={`text-${contentKey}`}
              entering={FadeIn.delay(100).duration(300)}
              style={[styles.explanationText, { color: colors.text }]}
            >
              {currentAffirmation.text}
            </Animated.Text>

            {/* Botones de accion: Compartir y Amen */}
            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.modalActionButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={handleShare}
              >
                <FontAwesome name="share" size={16} color={colors.text} />
                <Text style={[styles.modalActionText, { color: colors.text }]}>Compartir</Text>
              </Pressable>

              <View style={styles.amenButtonWrapper}>
                <Pressable
                  onPressIn={handleAmenPressIn}
                  onPressOut={handleAmenPressOut}
                  style={[styles.amenButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                  {/* Fill overlay */}
                  <Animated.View style={[styles.amenFillOverlay, { backgroundColor: colors.primary }, amenFillStyle]} />
                  <Text style={styles.amenEmoji}>{'\u{1F64F}'}</Text>
                  <Text style={[styles.modalActionText, { color: colors.text }]}>Amen</Text>
                </Pressable>
                <Text style={[styles.amenHint, { color: colors.textTertiary }]}>Mantené presionado</Text>
              </View>
            </View>

            {/* Footer con audio (solo si hay audioSource) */}
            {currentAffirmation.audioSource && (
              <View style={[styles.audioFooter, { borderTopColor: colors.border }]}>
                <Pressable
                  onPress={handlePlayAudio}
                  onPressIn={() => { playScale.value = withSpring(0.9); }}
                  onPressOut={() => { playScale.value = withSpring(1); }}
                >
                  <Animated.View
                    style={[
                      styles.playButton,
                      { backgroundColor: colors.primary },
                      playAnimatedStyle,
                    ]}
                  >
                    <FontAwesome
                      name={isPlayingAudio ? 'pause' : 'play'}
                      size={18}
                      color="#FFFFFF"
                      style={!isPlayingAudio ? { marginLeft: 2 } : undefined}
                    />
                  </Animated.View>
                </Pressable>
                <View style={styles.audioTextContainer}>
                  <Text style={[styles.audioLabel, { color: colors.text }]}>
                    {isPlayingAudio ? 'Reproduciendo...' : 'Escuchar reflexion'}
                  </Text>
                  {currentAffirmation.audioDuration && (
                    <Text style={[styles.audioDuration, { color: colors.textTertiary }]}>
                      {Math.ceil(currentAffirmation.audioDuration / 60)} min
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Sugerencias: Seguí leyendo */}
            {suggestions.length > 0 && (
              <Animated.View
                key={`suggestions-${contentKey}`}
                entering={FadeInDown.delay(200).duration(300)}
              >
                <View style={[styles.suggestionsSeparator, { borderTopColor: colors.border }]}>
                  <Text style={[styles.suggestionsTitle, { color: colors.textSecondary }]}>
                    Seguí leyendo
                  </Text>
                </View>
                <View style={styles.suggestionsRow}>
                  {suggestions.map((s) => (
                    <Pressable
                      key={s.affirmation.id}
                      style={[styles.suggestionCard, { backgroundColor: colors.surfaceSecondary }]}
                      onPress={() => handleSuggestionPress(s)}
                    >
                      {/* Badge de categoría */}
                      <View style={[styles.suggestionBadge, { backgroundColor: s.category.color + '20' }]}>
                        <FontAwesome name={s.category.icon as any} size={10} color={s.category.color} />
                        <Text style={[styles.suggestionBadgeText, { color: s.category.color }]} numberOfLines={1}>
                          {s.category.name}
                        </Text>
                        {s.category.isPremium && !isPremium && (
                          <FontAwesome name="lock" size={9} color={s.category.color} />
                        )}
                      </View>
                      {/* Título del versículo */}
                      <Text
                        style={[styles.suggestionText, { color: colors.text }]}
                        numberOfLines={2}
                      >
                        {(s.affirmation.title || s.affirmation.text).split(' — ')[0]}
                      </Text>
                      {/* Flecha */}
                      <FontAwesome name="chevron-right" size={10} color={colors.textTertiary} style={styles.suggestionArrow} />
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Tito Praying particles */}
          {amenParticles.length > 0 && (
            <View style={styles.particlesContainer} pointerEvents="none">
              {amenParticles.map((p) => (
                <TitoParticle key={p.id} particle={p} />
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.l,
  },
  card: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: Spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.m,
  },
  bibleReference: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    fontStyle: 'italic',
    fontFamily: Typography.fontFamily.body,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Verse title
  verseTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    lineHeight: Typography.fontSize.h3 * 1.3,
    marginBottom: Spacing.m,
  },

  // Separator
  separatorContainer: {
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  separator: {
    width: 40,
    height: 2,
    borderRadius: 1,
    opacity: 0.3,
  },

  // Scrollable content
  scrollView: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.m,
  },
  explanationText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.regular,
    fontFamily: Typography.fontFamily.body,
    lineHeight: 26,
  },

  // Actions row (Share + Amen)
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginTop: Spacing.m,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.md,
  },
  modalActionText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.heading,
  },
  amenEmoji: {
    fontSize: 18,
  },

  // Amen fill
  amenButtonWrapper: {
    flex: 1,
  },
  amenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  amenFillOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    opacity: 0.2,
    borderRadius: BorderRadius.md,
  },
  amenHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },

  // Tito Praying particles
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 60,
    zIndex: 100,
  },
  titoParticle: {
    position: 'absolute',
  },

  // Audio footer
  audioFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.l,
    marginTop: Spacing.m,
    gap: Spacing.m,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  audioTextContainer: {
    flex: 1,
  },
  audioLabel: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.heading,
  },
  audioDuration: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.regular,
    marginTop: 2,
  },

  // Suggestions
  suggestionsSeparator: {
    borderTopWidth: 1,
    paddingTop: Spacing.l,
    marginTop: Spacing.l,
  },
  suggestionsTitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.heading,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.m,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  suggestionCard: {
    flex: 1,
    padding: Spacing.m,
    borderRadius: BorderRadius.md,
  },
  suggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: Spacing.s,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.s,
  },
  suggestionBadgeText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.heading,
  },
  suggestionText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    fontFamily: Typography.fontFamily.body,
    lineHeight: 18,
  },
  suggestionArrow: {
    marginTop: Spacing.s,
    alignSelf: 'flex-end',
  },
});
