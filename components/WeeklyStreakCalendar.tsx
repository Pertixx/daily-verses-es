// ============================================================================
// Weekly Streak Calendar - Calendario semanal de racha
// ============================================================================

import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInDown,
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import { useColors } from '@/hooks';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import type { StreakData } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface WeeklyStreakCalendarProps {
  /** Datos de racha del usuario */
  streakData: StreakData | null | undefined;
  /** Callback cuando se completa la animación */
  onAnimationComplete?: () => void;
}

interface DayInfo {
  /** Día de la semana (0-6, donde 0 es Domingo) */
  dayOfWeek: number;
  /** Fecha ISO string (YYYY-MM-DD) */
  dateString: string;
  /** Si es hoy */
  isToday: boolean;
  /** Si el día fue completado */
  isCompleted: boolean;
  /** Nombre corto del día */
  dayName: string;
  /** Número del día del mes */
  dayNumber: number;
}

// ============================================================================
// Constants
// ============================================================================

const DAYS_OF_WEEK = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Obtiene el inicio de la semana (Domingo) para una fecha dada
 */
const getWeekStart = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
};

/**
 * Formatea una fecha a ISO string (YYYY-MM-DD) usando timezone local
 */
const formatDateToLocalISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Genera la información de los días de la semana actual
 */
const generateWeekDays = (completedDays: string[]): DayInfo[] => {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const todayString = formatDateToLocalISO(today);
  
  // Normalizar los días completados al formato YYYY-MM-DD (usando timezone local)
  const normalizedCompletedDays = new Set(
    completedDays.map(day => {
      // Si viene con T, parsear y formatear con timezone local
      if (day.includes('T')) {
        const date = new Date(day);
        return formatDateToLocalISO(date);
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
      dayNumber: date.getDate(),
    };
  });
};

// ============================================================================
// Sub-components
// ============================================================================

interface DayCircleProps {
  day: DayInfo;
  index: number;
}

const DayCircle = ({ day, index }: DayCircleProps) => {
  const colors = useColors();
  
  const getCircleStyle = () => {
    if (day.isCompleted) {
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
      };
    }
    if (day.isToday) {
      return {
        backgroundColor: 'transparent',
        borderColor: colors.primary,
        borderWidth: 2,
      };
    }
    return {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
    };
  };
  
  const getTextColor = () => {
    if (day.isCompleted) {
      return '#FFFFFF';
    }
    if (day.isToday) {
      return colors.primary;
    }
    return colors.textSecondary;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300).springify()}
      style={styles.dayContainer}
    >
      {/* Nombre del día */}
      <Text style={[
        styles.dayName,
        { color: day.isToday ? colors.primary : colors.textTertiary }
      ]}>
        {day.dayName}
      </Text>
      
      {/* Círculo con el número */}
      <Animated.View
        style={[
          styles.dayCircle,
          getCircleStyle(),
          day.isToday && !day.isCompleted && styles.todayCircle,
        ]}
      >
        {day.isCompleted ? (
          <FontAwesome name="check" size={14} color="#FFFFFF" />
        ) : (
          <Text style={[styles.dayNumber, { color: getTextColor() }]}>
            {day.dayNumber}
          </Text>
        )}
      </Animated.View>
      
      {/* Indicador de hoy */}
      {day.isToday && (
        <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
      )}
    </Animated.View>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const WeeklyStreakCalendar = ({
  streakData,
  onAnimationComplete,
}: WeeklyStreakCalendarProps) => {
  const colors = useColors();
  
  // Generar los días de la semana
  const weekDays = useMemo(() => {
    const completedDays = streakData?.completedDays ?? [];
    return generateWeekDays(completedDays);
  }, [streakData?.completedDays]);
  
  // Contar días completados esta semana
  const completedThisWeek = useMemo(() => {
    return weekDays.filter(day => day.isCompleted).length;
  }, [weekDays]);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FontAwesome name="fire" size={20} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Tu racha
          </Text>
        </View>
        <View style={[styles.streakBadge, { backgroundColor: colors.badgePrimaryBg }]}>
          <Text style={[styles.streakBadgeText, { color: colors.primary }]}>
            {streakData?.currentStreak ?? 0} días
          </Text>
        </View>
      </View>
      
      {/* Calendario semanal */}
      <View style={styles.weekContainer}>
        {weekDays.map((day, index) => (
          <DayCircle key={day.dateString} day={day} index={index} />
        ))}
      </View>
      
      {/* Footer con progreso */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { backgroundColor: colors.surfaceSecondary }
            ]}
          >
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  backgroundColor: colors.primary,
                  width: `${(completedThisWeek / 7) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {completedThisWeek}/7 esta semana
          </Text>
        </View>
        
        {/* Mejor racha */}
        {(streakData?.longestStreak ?? 0) > 0 && (
          <View style={styles.bestStreakContainer}>
            <FontAwesome name="trophy" size={12} color={colors.accent} />
            <Text style={[styles.bestStreakText, { color: colors.textTertiary }]}>
              Mejor: {streakData?.longestStreak} días
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.l,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  headerTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Typography.fontFamily.heading,
  },
  streakBadge: {
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xl,
  },
  streakBadgeText: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.bold,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.l,
  },
  dayContainer: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  todayCircle: {
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  footer: {
    gap: Spacing.s,
  },
  progressContainer: {
    gap: Spacing.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
  },
  bestStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  bestStreakText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default WeeklyStreakCalendar;
