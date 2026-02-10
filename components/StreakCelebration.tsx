// ============================================================================
// Streak Celebration - Toast elegante de celebración de racha diaria
// ============================================================================

import { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors, useTheme } from '@/hooks';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import type { StreakData } from '@/types';

const DAYS_OF_WEEK = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// ============================================================================
// Types
// ============================================================================

interface StreakCelebrationProps {
  visible: boolean;
  streakData: StreakData | null;
  onClose: () => void;
  autoCloseDelay?: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatDateToLocalISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekStart = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
};

const generateWeekDays = (completedDays: string[]) => {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const todayString = formatDateToLocalISO(today);
  
  const normalizedCompletedDays = new Set(
    completedDays.map(day => {
      if (day.includes('T')) {
        return formatDateToLocalISO(new Date(day));
      }
      return day;
    })
  );
  
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const dateString = formatDateToLocalISO(date);
    
    return {
      dayOfWeek: index,
      dateString,
      isToday: dateString === todayString,
      isCompleted: normalizedCompletedDays.has(dateString),
      dayName: DAYS_OF_WEEK[index],
    };
  });
};

// ============================================================================
// Mini Day Dot Component
// ============================================================================

interface DayDotProps {
  isCompleted: boolean;
  isToday: boolean;
  index: number;
  primaryColor: string;
}

function DayDot({ isCompleted, isToday, index, primaryColor }: DayDotProps) {
  const scale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      100 + index * 40,
      withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) })
    );
    
    if (isCompleted) {
      checkOpacity.value = withDelay(200 + index * 40, withTiming(1, { duration: 200 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dayDot,
        {
          backgroundColor: isCompleted ? primaryColor : 'rgba(0,0,0,0.08)',
          borderWidth: isToday && !isCompleted ? 2 : 0,
          borderColor: primaryColor,
        },
        dotStyle,
      ]}
    >
      {isCompleted && (
        <Animated.View style={checkStyle}>
          <FontAwesome name="check" size={8} color="#FFFFFF" />
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function StreakCelebration({
  visible,
  streakData,
  onClose,
  autoCloseDelay = 3000,
}: StreakCelebrationProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isDark } = useTheme();
  
  // Animaciones
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const fireScale = useSharedValue(0);

  // Generar días de la semana
  const weekDays = useMemo(() => {
    return generateWeekDays(streakData?.completedDays ?? []);
  }, [streakData?.completedDays]);

  useEffect(() => {
    if (visible) {
      // Haptic sutil
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Animación de entrada suave
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
      scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      fireScale.value = withDelay(150, withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) }));

      // Auto-cerrar
      if (autoCloseDelay > 0) {
        const timeout = setTimeout(() => {
          // Animación de salida
          opacity.value = withTiming(0, { duration: 250 });
          translateY.value = withTiming(-100, { 
            duration: 300, 
            easing: Easing.in(Easing.cubic) 
          });
          scale.value = withTiming(0.9, { duration: 250 });
          
          setTimeout(onClose, 300);
        }, autoCloseDelay);
        
        return () => clearTimeout(timeout);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Estilos animados
  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  if (!visible) return null;

  const currentStreak = streakData?.currentStreak ?? 1;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + Spacing.m,
          backgroundColor: isDark ? '#2D2D2D' : '#FFFFFF',
          shadowColor: isDark ? '#000' : '#000',
        },
        containerStyle,
      ]}
      pointerEvents="none"
    >
      {/* Icono de fuego */}
      <Animated.View style={[styles.fireContainer, fireStyle]}>
        <Text style={styles.fireEmoji}>🔥</Text>
      </Animated.View>

      {/* Contenido */}
      <View style={styles.content}>
        <View style={styles.textRow}>
          <Text style={[styles.streakNumber, { color: colors.primary }]}>
            {currentStreak}
          </Text>
          <Text style={[styles.streakLabel, { color: isDark ? '#F9FAFB' : colors.text }]}>
            {currentStreak === 1 ? 'día' : 'días'} de racha
          </Text>
        </View>
        
        {/* Mini calendario */}
        <View style={styles.weekDots}>
          {weekDays.map((day, index) => (
            <DayDot
              key={day.dateString}
              isCompleted={day.isCompleted}
              isToday={day.isToday}
              index={index}
              primaryColor={colors.primary}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.l,
    right: Spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.l,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    gap: Spacing.m,
    zIndex: 1000,
  },
  fireContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireEmoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: Typography.fontFamily.heading,
  },
  streakLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  weekDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dayDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StreakCelebration;
