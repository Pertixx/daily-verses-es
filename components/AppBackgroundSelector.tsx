// ============================================================================
// AppBackgroundSelector - Selector de fondo de pantalla de la app
// ============================================================================

import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useMemo } from 'react';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks';
import type { AppBackgroundType } from '@/types';

// Configuración de los fondos disponibles
export interface BackgroundConfig {
  id: AppBackgroundType;
  name: string;
  isPremium: boolean;
  imageSource?: any;      // Imagen de fondo (para premium)
  imageMiniSource?: any;  // Imagen miniatura para la selección
  solidColor?: string;    // Color sólido (para default)
  textColor: string;      // Color del texto "Aa"
}

export const APP_BACKGROUNDS: BackgroundConfig[] = [
  { 
    id: 'default', 
    name: 'Clásico', 
    isPremium: false,
    solidColor: undefined, // Se usa el color del tema actual
    textColor: '#1F2937',  // Se ajusta según el tema
  },
  { 
    id: 'sunset', 
    name: 'Atardecer', 
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/sunset.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/sunset.jpg'),
    textColor: '#FFFFFF',
  },
  { 
    id: 'ocean', 
    name: 'Océano', 
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/ocean.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/ocean.jpg'),
    textColor: '#1F2937',
  },
  { 
    id: 'forest', 
    name: 'Bosque', 
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/forest.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/forest.jpg'),
    textColor: '#FFFFFF',
  },
  { 
    id: 'lavender', 
    name: 'Lavanda', 
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/lavender.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/lavender.jpg'),
    textColor: '#FFFFFF',
  },
  { 
    id: 'midnight', 
    name: 'Medianoche', 
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/midnight.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/midnight.jpg'),
    textColor: '#F9FAFB',
  },
  { 
    id: 'jesus-1', 
    name: 'Jesús 1', 
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/jesus-1.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/jesus-1.jpg'),
    textColor: '#FFFFFF',
  },
  {
    id: 'jesus-2',
    name: 'Jesús 2',
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/jesus-2.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/jesus-2.jpg'),
    textColor: '#FFFFFF',
  },
  {
    id: 'mountain',
    name: 'Montaña',
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/mountain.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/mountain.jpg'),
    textColor: '#FFFFFF',
  },
  {
    id: 'mountain-2',
    name: 'Montaña 2',
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/mountain-2.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/mountain-2.jpg'),
    textColor: '#000000',
  },
  {
    id: 'bible',
    name: 'Biblia',
    isPremium: true,
    imageSource: require('@/assets/images/backgrounds/bible.jpg'),
    imageMiniSource: require('@/assets/images/backgrounds/mini/bible.jpg'),
    textColor: '#FFFFFF',
  }
];

interface BackgroundOptionProps {
  background: BackgroundConfig;
  selected: boolean;
  onSelect: () => void;
  showPremiumBadge?: boolean;
  isDark: boolean;
  themeColors: ThemeColors;
}

function BackgroundOption({ 
  background, 
  selected, 
  onSelect, 
  showPremiumBadge = true,
  isDark,
  themeColors,
}: BackgroundOptionProps) {
  const styles = useMemo(() => createOptionStyles(themeColors), [themeColors]);
  
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Para el fondo "default", usar colores del tema actual
  const isDefault = background.id === 'default';
  const backgroundColor = isDefault 
    ? (isDark ? '#1A1A1A' : '#F8F9FA')
    : undefined;
  const textColor = isDefault
    ? (isDark ? '#F9FAFB' : '#1F2937')
    : background.textColor;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View 
        style={[
          styles.optionContainer,
          selected && styles.optionSelected,
          animatedStyle,
        ]}
      >
        {/* Phone frame */}
        <View style={styles.phoneFrame}>
          <View style={[styles.phoneScreen, backgroundColor ? { backgroundColor } : undefined]}>
            {/* Background image for premium variants */}
            {!isDefault && background.imageMiniSource && background.imageSource && (
              <Image
                source={background.imageMiniSource}
                style={styles.backgroundImage}
                contentFit="cover"
              />
            )}
            
            {/* Notch */}
            <View style={styles.notch} />
            
            {/* Preview text "Aa" */}
            <Text style={[styles.previewText, { color: textColor }]}>
              Aa
            </Text>
          </View>
        </View>
        
        {/* Premium badge */}
        {showPremiumBadge && background.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={8} color="#FFD700" />
          </View>
        )}

        {/* Selection checkmark */}
        {selected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={20} color={themeColors.primary} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

interface AppBackgroundSelectorProps {
  selectedBackground: AppBackgroundType;
  onSelectBackground: (backgroundId: AppBackgroundType) => void;
  showPremiumBadge?: boolean;
}

export function AppBackgroundSelector({ 
  selectedBackground, 
  onSelectBackground,
  showPremiumBadge = true,
}: AppBackgroundSelectorProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {APP_BACKGROUNDS.map((background) => (
        <BackgroundOption
          key={background.id}
          background={background}
          selected={selectedBackground === background.id}
          onSelect={() => onSelectBackground(background.id)}
          showPremiumBadge={showPremiumBadge}
          isDark={isDark}
          themeColors={colors}
        />
      ))}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.m,
      justifyContent: 'center',
    },
  });

const createOptionStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    optionContainer: {
      position: 'relative',
      padding: Spacing.xs,
      borderRadius: BorderRadius.md,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    optionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.selectedCardBg,
    },
    phoneFrame: {
      width: 70,
      height: 140,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.border,
      padding: 3,
      overflow: 'hidden',
    },
    phoneScreen: {
      flex: 1,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundImage: {
      ...StyleSheet.absoluteFillObject,
    },
    notch: {
      position: 'absolute',
      top: 4,
      width: 20,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    previewText: {
      fontSize: 24,
      fontWeight: '600',
      letterSpacing: 1,
      zIndex: 1,
    },
    premiumBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    checkmark: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      backgroundColor: colors.surface,
      borderRadius: 11,
    },
  });
