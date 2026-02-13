// ============================================================================
// VerseExplanationModal - Modal con la reflexion/explicacion del versiculo
// ============================================================================

import { useState, useRef, useEffect } from 'react';
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
import { Image } from 'expo-image';
import { useColors } from '@/hooks';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import type { Affirmation } from '@/types';

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

interface VerseExplanationModalProps {
  visible: boolean;
  onClose: () => void;
  affirmation: Affirmation;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
  onShare: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function VerseExplanationModal({
  visible,
  onClose,
  affirmation,
  isPlayingAudio,
  onPlayAudio,
  onShare,
}: VerseExplanationModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // Parsear titulo y referencia biblica
  const titleParts = (affirmation.title || '').split(' — ');
  const mainText = titleParts[0];
  const bibleReference = titleParts.length > 1 ? titleParts[1] : null;

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

          {/* Titulo del versiculo */}
          <Text style={[styles.verseTitle, { color: colors.text }]}>
            {mainText}
          </Text>

          {/* Separador */}
          <View style={styles.separatorContainer}>
            <View style={[styles.separator, { backgroundColor: colors.primary }]} />
          </View>

          {/* Contenido scrolleable */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.explanationText, { color: colors.text }]}>
              {affirmation.text}
            </Text>
          </ScrollView>

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
          {affirmation.audioSource && (
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
                {affirmation.audioDuration && (
                  <Text style={[styles.audioDuration, { color: colors.textTertiary }]}>
                    {Math.ceil(affirmation.audioDuration / 60)} min
                  </Text>
                )}
              </View>
            </View>
          )}

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
});
