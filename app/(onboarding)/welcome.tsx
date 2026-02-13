// ============================================================================
// Onboarding Welcome Screen - Primera pantalla (sin progress bar)
// ============================================================================

import { View, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useEffect, useMemo } from 'react';
import { AnimatedButton } from '@/components/onboarding';
import { Spacing, Typography, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks';
import { analytics } from '@/services';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const floatY = useSharedValue(0);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(12, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [floatY]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const handleContinue = () => {
    analytics.track('onboarding_started');
    router.push('/(onboarding)/name');
  };

  return (
    <View style={styles.container}>
      {/* Background decorations */}
      <View style={styles.backgroundContainer}>
        {/* Top blob */}
        <View style={[styles.blob, styles.blobTop]} />
        {/* Bottom blob */}
        <View style={[styles.blob, styles.blobBottom]} />
        {/* Accent circles */}
        <View style={[styles.circle, styles.circleTopLeft]} />
        <View style={[styles.circle, styles.circleBottomRight]} />
        <View style={[styles.circle, styles.circleMiddle]} />
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + Spacing.xxl }]}>
        {/* Tito Image */}
        <View style={styles.heroContainer}>
          <Animated.View
            entering={ZoomIn.duration(800).springify()}
            style={floatingStyle}
          >
            <View style={styles.imageGlow} />
            <Image
              source={require('@/assets/icons/titoGreetings.png')}
              style={styles.heroImage}
              contentFit="contain"
            />
          </Animated.View>
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Animated.Text
            entering={FadeInUp.duration(600).delay(300)}
            style={styles.greeting}
          >
            ¡Hola, soy Tito!
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.duration(600).delay(450)}
            style={styles.description}
          >
            Estoy aquí para acompañarte cada día con versículos diarios que te ayudarán a sentirte mejor contigo mismo.
          </Animated.Text>
        </View>
      </View>

      {/* Footer */}
      <Animated.View
        entering={FadeInDown.duration(500).delay(600)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <AnimatedButton
          title="Comenzar ahora"
          onPress={handleContinue}
        />
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    backgroundContainer: {
      ...StyleSheet.absoluteFillObject,
      overflow: 'hidden',
    },
    blob: {
      position: 'absolute',
      borderRadius: 999,
    },
    blobTop: {
      width: SCREEN_WIDTH * 1.2,
      height: SCREEN_HEIGHT * 0.45,
      backgroundColor: colors.primary,
      opacity: isDark ? 0.25 : 0.4,
      top: -SCREEN_HEIGHT * 0.15,
      left: -SCREEN_WIDTH * 0.2,
      transform: [{ rotate: '-15deg' }],
    },
    blobBottom: {
      width: SCREEN_WIDTH * 1.1,
      height: SCREEN_HEIGHT * 0.35,
      backgroundColor: colors.secondary,
      opacity: isDark ? 0.2 : 0.35,
      bottom: -SCREEN_HEIGHT * 0.1,
      right: -SCREEN_WIDTH * 0.3,
      transform: [{ rotate: '20deg' }],
    },
    circle: {
      position: 'absolute',
      borderRadius: 999,
    },
    circleTopLeft: {
      width: 120,
      height: 120,
      backgroundColor: colors.accent,
      opacity: isDark ? 0.2 : 0.3,
      top: SCREEN_HEIGHT * 0.08,
      left: -40,
    },
    circleBottomRight: {
      width: 80,
      height: 80,
      backgroundColor: colors.tertiary,
      opacity: isDark ? 0.25 : 0.4,
      bottom: SCREEN_HEIGHT * 0.25,
      right: 20,
    },
    circleMiddle: {
      width: 60,
      height: 60,
      backgroundColor: colors.primary,
      opacity: isDark ? 0.15 : 0.25,
      top: SCREEN_HEIGHT * 0.35,
      right: -20,
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      justifyContent: 'center',
    },
    heroContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xxl,
    },
    imageGlow: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.surface,
      opacity: isDark ? 0.3 : 0.6,
      top: -15,
      left: -15,
    },
    heroImage: {
      width: 250,
      height: 250,
    },
    textContainer: {
      alignItems: 'center',
      paddingHorizontal: Spacing.m,
    },
    greeting: {
      fontSize: 28,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.l,
      fontFamily: Typography.fontFamily.heading
    },
    description: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.regular,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: Typography.fontSize.body * Typography.lineHeight.body,
      fontFamily: Typography.fontFamily.body
    },
    footer: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.l,
    },
  });
