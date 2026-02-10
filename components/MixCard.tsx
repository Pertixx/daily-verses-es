// ============================================================================
// MixCard Component - Tile para mixes de afirmaciones (2 columnas)
// ============================================================================

import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors } from '@/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.s;
const IS_IPAD = Platform.OS === 'ios' && Platform.isPad;
// Full width on iPad, 2 columns on iPhone
const CARD_WIDTH = IS_IPAD 
  ? SCREEN_WIDTH - Spacing.l * 8 
  : (SCREEN_WIDTH - Spacing.l * 2 - CARD_GAP) / 2;

// ============================================================================
// Types
// ============================================================================

export interface MixCardProps {
  /** Nombre del mix */
  name: string;
  /** Nombre del icono de FontAwesome */
  icon: string;
  /** Color principal (usado solo para referencia, icono siempre usa primary) */
  color: string;
  /** Si es el mix activo */
  isActive: boolean;
  /** Si está bloqueado (premium o requisitos no cumplidos) */
  isLocked?: boolean;
  /** Mensaje de bloqueo (ej: "7 favoritos mínimo") */
  lockMessage?: string;
  /** Contador opcional (ej: cantidad de afirmaciones/categorías) */
  count?: number;
  /** Sufijo del contador (ej: "frases", "categorías") */
  countSuffix?: string;
  /** Callback al presionar */
  onPress: () => void;
  /** Índice para animación escalonada */
  index?: number;
}

// ============================================================================
// Component
// ============================================================================

export function MixCard({ 
  name, 
  icon, 
  isActive, 
  isLocked = false, 
  lockMessage,
  count,
  countSuffix = 'frases',
  onPress, 
  index = 0 
}: MixCardProps) {
  const colors = useColors();

  return (
    <Animated.View 
      entering={FadeInRight.delay(100 + index * 30).duration(300)}
      style={styles.tileWrapper}
    >
      <Pressable
        style={[
          styles.mixTile,
          { 
            backgroundColor: colors.cardBackground,
            borderColor: isActive ? colors.primary : colors.border,
            borderWidth: isActive ? 2 : 1,
            opacity: isLocked ? 0.7 : 1,
          },
        ]}
        onPress={onPress}
      >
        {/* Nombre arriba a la izquierda */}
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text style={[styles.tileName, { color: colors.text }]} numberOfLines={2}>
              {name}
            </Text>
            {/* Contador o mensaje de bloqueo debajo del nombre */}
            {isLocked && lockMessage ? (
              <Text style={[styles.tileLockMessage, { color: colors.textTertiary }]}>
                {lockMessage}
              </Text>
            ) : count !== undefined ? (
              <Text style={[styles.tileCount, { color: colors.textSecondary }]}>
                {count} {countSuffix}
              </Text>
            ) : null}
          </View>

          {/* Check o Lock arriba a la derecha */}
          {isActive ? (
            <View style={[styles.tileCheckmark, { backgroundColor: colors.primary }]}>
              <FontAwesome name="check" size={10} color="#FFFFFF" />
            </View>
          ) : isLocked ? (
            <View style={[styles.tileLock, { backgroundColor: colors.textTertiary }]}>
              <FontAwesome name="lock" size={10} color="#FFFFFF" />
            </View>
          ) : <View style={styles.checkPlaceholder} />}
        </View>

        {/* Icono abajo a la derecha */}
        <View style={styles.bottomRow}>
          <FontAwesome name={icon as any} size={28} color={colors.primary} />
        </View>
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
  mixTile: {
    borderRadius: BorderRadius.md,
    padding: Spacing.m,
    height: 100,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
    marginRight: Spacing.s,
  },
  tileName: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  tileCount: {
    fontSize: 11,
    marginTop: 2,
  },
  tileLockMessage: {
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  },
  tileCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLock: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkPlaceholder: {
    width: 20,
    height: 20,
  },
  bottomRow: {
    alignItems: 'flex-end',
  },
});

export default MixCard;
