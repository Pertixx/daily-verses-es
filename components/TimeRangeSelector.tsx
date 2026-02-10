// ============================================================================
// TimeRangeSelector - Selector de rango horario
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

interface TimeRangeSelectorProps {
  /** Hora de inicio (0-23) */
  startHour: number;
  /** Hora de fin (0-23) */
  endHour: number;
  /** Callback cuando cambia la hora de inicio */
  onStartHourChange: (hour: number) => void;
  /** Callback cuando cambia la hora de fin */
  onEndHourChange: (hour: number) => void;
  /** Delay de animación */
  animationDelay?: number;
  /** Mostrar hint informativo */
  showHint?: boolean;
  /** Frecuencia para el hint */
  frequency?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

// ============================================================================
// Component
// ============================================================================

export function TimeRangeSelector({
  startHour,
  endHour,
  onStartHourChange,
  onEndHourChange,
  animationDelay = 0,
  showHint = false,
  frequency = 3,
}: TimeRangeSelectorProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleStartHourChange = useCallback((direction: 'prev' | 'next') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let newHour = direction === 'next' ? startHour + 1 : startHour - 1;
    
    // Wrap around
    if (newHour < 0) newHour = 23;
    if (newHour > 23) newHour = 0;
    
    // Validar que sea menor que endHour
    if (newHour < endHour) {
      onStartHourChange(newHour);
    }
  }, [startHour, endHour, onStartHourChange]);

  const handleEndHourChange = useCallback((direction: 'prev' | 'next') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    let newHour = direction === 'next' ? endHour + 1 : endHour - 1;
    
    // Wrap around
    if (newHour < 0) newHour = 23;
    if (newHour > 23) newHour = 0;
    
    // Validar que sea mayor que startHour
    if (newHour > startHour) {
      onEndHourChange(newHour);
    }
  }, [startHour, endHour, onEndHourChange]);

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(animationDelay)}
    >
      <View style={styles.container}>
        {/* Start Time */}
        <View style={styles.timePickerWrapper}>
          <Text style={styles.timeLabel}>Desde</Text>
          <View style={styles.timePicker}>
            <Pressable 
              onPress={() => handleStartHourChange('prev')}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </Pressable>
            
            <Text style={styles.timeValue}>{formatHour(startHour)}</Text>
            
            <Pressable 
              onPress={() => handleStartHourChange('next')}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <Ionicons name="arrow-forward" size={20} color={colors.textMuted} />
        </View>

        {/* End Time */}
        <View style={styles.timePickerWrapper}>
          <Text style={styles.timeLabel}>Hasta</Text>
          <View style={styles.timePicker}>
            <Pressable 
              onPress={() => handleEndHourChange('prev')}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-back" size={20} color={colors.primary} />
            </Pressable>
            
            <Text style={styles.timeValue}>{formatHour(endHour)}</Text>
            
            <Pressable 
              onPress={() => handleEndHourChange('next')}
              style={styles.arrowButton}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Info hint */}
      {showHint && (
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={styles.hintText}>
            Recibirás {frequency} {frequency === 1 ? 'versículo' : 'versículos'} distribuidas entre las {formatHour(startHour)} y las {formatHour(endHour)}
          </Text>
        </View>
      )}
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
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.l,
    },
    timePickerWrapper: {
      flex: 1,
      alignItems: 'center',
    },
    timeLabel: {
      fontSize: Typography.fontSize.caption,
      color: colors.textSecondary,
      marginBottom: Spacing.s,
    },
    timePicker: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.s,
    },
    arrowButton: {
      width: 32,
      height: 32,
      borderRadius: BorderRadius.sm,
      backgroundColor: colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeValue: {
      fontSize: Typography.fontSize.h3,
      fontWeight: Typography.fontWeight.bold,
      color: colors.text,
      minWidth: 60,
      textAlign: 'center',
    },
    separator: {
      paddingHorizontal: Spacing.s,
      paddingTop: Spacing.l,
    },
    hint: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.s,
      marginTop: Spacing.m,
      paddingHorizontal: Spacing.s,
    },
    hintText: {
      flex: 1,
      fontSize: Typography.fontSize.caption,
      color: colors.textMuted,
      lineHeight: 20,
    },
  });

export default TimeRangeSelector;
