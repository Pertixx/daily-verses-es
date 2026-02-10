// ============================================================================
// AppIconSelector - Componente reutilizable para seleccionar el ícono de la app
// ============================================================================

import { View, StyleSheet, Pressable } from 'react-native';
import { useMemo } from 'react';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks';
import type { AppIconType } from '@/types';

// Configuración de los íconos disponibles
export const APP_ICONS: { 
  id: AppIconType; 
  name: string; 
  isPremium: boolean;
  iconSource: any;
}[] = [
  { 
    id: 'default', 
    name: 'Versículo Original', 
    isPremium: false,
    iconSource: require('@/assets/icons/MimoIcon.png'),
  },
  { 
    id: 'variant-1', 
    name: 'Versículo Sunset', 
    isPremium: true,
    iconSource: require('@/assets/icons/MimoIconVariant1Flat.png'),
  },
  { 
    id: 'variant-2', 
    name: 'Versículo Azul', 
    isPremium: true,
    iconSource: require('@/assets/icons/MimoIconVariant2Flat.png'),
  },
  { 
    id: 'variant-3', 
    name: 'Versículo Dorado', 
    isPremium: true,
    iconSource: require('@/assets/icons/MimoIconVariant3Flat.png'),
  },
  { 
    id: 'variant-4', 
    name: 'Versículo Sereno', 
    isPremium: true,
    iconSource: require('@/assets/icons/MimoIconVariant4Flat.png'),
  },
  { 
    id: 'variant-5', 
    name: 'Versículo Clásico', 
    isPremium: true,
    iconSource: require('@/assets/icons/MimoIconVariant5Flat.png'),
  },
];

interface AppIconOptionProps {
  icon: typeof APP_ICONS[0];
  selected: boolean;
  onSelect: () => void;
  showPremiumBadge?: boolean;
}

function AppIconOption({ 
  icon, 
  selected, 
  onSelect, 
  showPremiumBadge = true,
}: AppIconOptionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createOptionStyles(colors), [colors]);
  
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
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
        <Image 
          source={icon.iconSource} 
          style={styles.iconPreview}
          contentFit="cover"
        />
        
        {/* Premium badge */}
        {showPremiumBadge && icon.isPremium && (
          <View style={styles.premiumBadge}>
            <Ionicons name="star" size={8} color="#FFD700" />
          </View>
        )}

        {/* Selection checkmark */}
        {selected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

interface AppIconSelectorProps {
  selectedIcon: AppIconType;
  onSelectIcon: (iconId: AppIconType) => void;
  showPremiumBadge?: boolean;
}

export function AppIconSelector({ 
  selectedIcon, 
  onSelectIcon,
  showPremiumBadge = true,
}: AppIconSelectorProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      {APP_ICONS.map((icon) => (
        <AppIconOption
          key={icon.id}
          icon={icon}
          selected={selectedIcon === icon.id}
          onSelect={() => onSelectIcon(icon.id)}
          showPremiumBadge={showPremiumBadge}
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
    },
  });

const createOptionStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    optionContainer: {
      position: 'relative',
      padding: Spacing.xs,
      borderRadius: BorderRadius.lg,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    optionSelected: {
      borderColor: colors.primary,
    },
    iconPreview: {
      width: 72,
      height: 72,
      borderRadius: 18,
    },
    premiumBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 8,
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderRadius: 11,
    },
  });
