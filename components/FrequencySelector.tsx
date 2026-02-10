// ============================================================================
// FrequencySelector - Selector de frecuencia de afirmaciones
// ============================================================================

import { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks';

// ============================================================================
// Types
// ============================================================================

interface FrequencySelectorProps {
  /** Valor actual de frecuencia */
  value: number;
  /** Callback cuando cambia el valor */
  onChange: (value: number) => void;
  /** Valor mínimo permitido */
  min?: number;
  /** Valor máximo permitido */
  max?: number;
  /** Label singular (ej: "afirmación") */
  labelSingular?: string;
  /** Label plural (ej: "afirmaciones") */
  labelPlural?: string;
  /** Delay de animación */
  animationDelay?: number;
}

// ============================================================================
// Component
// ============================================================================

export function FrequencySelector({
  value,
  onChange,
  min = 1,
  max = 20,
  labelSingular = 'versículo',
  labelPlural = 'versículos',
  animationDelay = 0,
}: FrequencySelectorProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleIncrement = useCallback(() => {
    if (value < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(value + 1);
    }
  }, [value, max, onChange]);

  const handleDecrement = useCallback(() => {
    if (value > min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(value - 1);
    }
  }, [value, min, onChange]);

  const isMinDisabled = value <= min;
  const isMaxDisabled = value >= max;

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(animationDelay)}
      style={styles.container}
    >
      <Pressable 
        onPress={handleDecrement}
        style={[
          styles.button,
          isMinDisabled && styles.buttonDisabled
        ]}
        disabled={isMinDisabled}
      >
        <Ionicons 
          name="remove" 
          size={24} 
          color={isMinDisabled ? colors.textMuted : colors.primary} 
        />
      </Pressable>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>
          {value === 1 ? labelSingular : labelPlural}
        </Text>
      </View>
      
      <Pressable 
        onPress={handleIncrement}
        style={[
          styles.button,
          isMaxDisabled && styles.buttonDisabled
        ]}
        disabled={isMaxDisabled}
      >
        <Ionicons 
          name="add" 
          size={24} 
          color={isMaxDisabled ? colors.textMuted : colors.primary} 
        />
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.l,
      gap: Spacing.xl,
    },
    button: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    valueContainer: {
      alignItems: 'center',
      minWidth: 100,
    },
    value: {
      fontSize: 40,
      fontWeight: Typography.fontWeight.bold,
      color: colors.primary,
    },
    label: {
      fontSize: Typography.fontSize.caption,
      color: colors.textSecondary,
      marginTop: Spacing.xs,
    },
  });

export default FrequencySelector;
