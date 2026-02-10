// ============================================================================
// CategoryCard Component - Tile cuadrado para categorías (2 columnas)
// ============================================================================

import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors } from '@/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.s;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.l * 2 - CARD_GAP) / 2;

// ============================================================================
// Types
// ============================================================================

export interface CategoryCardProps {
  /** Nombre de la categoría/colección */
  name: string;
  /** Nombre del icono de FontAwesome */
  icon: string;
  /** Color principal */
  color: string;
  /** Si está seleccionada */
  isSelected: boolean;
  /** Si está bloqueada (premium) */
  isLocked?: boolean;
  /** Contador opcional (ej: cantidad de afirmaciones) */
  count?: number;
  /** Callback al presionar */
  onPress: () => void;
  /** Índice para animación escalonada */
  index?: number;
}

// ============================================================================
// Component
// ============================================================================

export function CategoryCard({ 
  name, 
  icon, 
  color, 
  isSelected, 
  isLocked = false, 
  count,
  onPress, 
  index = 0 
}: CategoryCardProps) {
  const colors = useColors();

  return (
    <Animated.View 
      entering={FadeInRight.delay(100 + index * 30).duration(300)}
      style={styles.tileWrapper}
    >
      <Pressable
        style={[
          styles.categoryTile,
          { 
            backgroundColor: colors.cardBackground,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={onPress}
      >
        {/* Check o Lock arriba a la derecha */}
        {isSelected ? (
          <View style={[styles.tileCheckmark, { backgroundColor: colors.primary }]}>
            <FontAwesome name="check" size={10} color="#FFFFFF" />
          </View>
        ) : isLocked ? (
          <View style={[styles.tileLock, { backgroundColor: colors.textTertiary }]}>
            <FontAwesome name="lock" size={10} color="#FFFFFF" />
          </View>
        ) : null}

        <View style={[styles.tileIcon, { backgroundColor: `${color}20` }]}>
          <FontAwesome name={icon as any} size={24} color={color} />
        </View>
        
        <Text style={[styles.tileName, { color: colors.text }]} numberOfLines={2}>
          {name}
        </Text>

        {/* Contador opcional */}
        {count !== undefined && (
          <Text style={[styles.tileCount, { color: colors.textSecondary }]}>
            {count} {count === 1 ? 'frase' : 'frases'}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  tileWrapper: {
    width: CARD_WIDTH,
  },
  categoryTile: {
    borderRadius: BorderRadius.md,
    padding: Spacing.m,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tileCheckmark: {
    position: 'absolute',
    top: Spacing.s,
    right: Spacing.s,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLock: {
    position: 'absolute',
    top: Spacing.s,
    right: Spacing.s,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.s,
  },
  tileName: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  tileCount: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default CategoryCard;
