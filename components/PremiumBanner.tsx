// ============================================================================
// Premium Banner - Banner para usuarios no premium
// ============================================================================

import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';

// ============================================================================
// Types
// ============================================================================

interface PremiumBannerProps {
  /** Callback cuando se presiona el banner */
  onPress?: () => void;
  /** Delay de animación */
  animationDelay?: number;
}

interface PremiumFeature {
  icon: string;
  text: string;
}

// ============================================================================
// Constants
// ============================================================================

const PREMIUM_FEATURES: PremiumFeature[] = [
  { icon: 'book', text: '+1500 versículos' },
  { icon: 'th-large', text: 'Todas las categorías' },
  { icon: 'volume-up', text: 'Audio ilimitado' },
  { icon: 'magic', text: 'Mixes personalizados' },
  { icon: 'paint-brush', text: 'Temas exclusivos' },
];

// ============================================================================
// Component
// ============================================================================

export function PremiumBanner({ onPress, animationDelay = 150 }: PremiumBannerProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <Animated.View entering={FadeInDown.delay(animationDelay).duration(400)}>
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={['#8B6F4E', '#A67C52']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {/* Header del banner */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <FontAwesome name="star" size={20} color="#FFFFFF" />
              <Text style={styles.title}>Desbloquea todo</Text>
            </View>
            <View style={styles.arrowContainer}>
              <FontAwesome name="chevron-right" size={14} color="#FFFFFF" />
            </View>
          </View>

          {/* Lista de features */}
          <View style={styles.featuresContainer}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <FontAwesome 
                    name={feature.icon as any} 
                    size={12} 
                    color="#FFFFFF" 
                  />
                </View>
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>Comenzar prueba gratis</Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.l,
    marginBottom: Spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  title: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    color: '#FFFFFF',
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginBottom: Spacing.m,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.s,
    borderRadius: BorderRadius.xl,
    gap: Spacing.xs,
  },
  featureIconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    color: '#FFFFFF',
  },
  ctaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.m,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    color: '#8B6F4E',
  },
});
