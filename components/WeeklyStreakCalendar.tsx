// ============================================================================
// Weekly Streak Calendar - Calendario semanal de constancia espiritual
// ============================================================================

import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInUp,
  SlideInRight,
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

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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

/**
 * Devuelve un mensaje motivacional según los días completados
 */
const getMotivationalMessage = (completed: number): string => {
  if (completed === 7) return '¡Semana perfecta! Gloria a Dios 🙌';
  if (completed >= 5) return '¡Excelente dedicación esta semana!';
  if (completed >= 3) return 'Vas por buen camino, seguí así';
  if (completed >= 1) return 'Cada día cuenta en tu camino de fe';
  return 'Comenzá tu lectura de hoy';
};

// ============================================================================
// Sub-components
// ============================================================================

interface DayTileProps {
  day: DayInfo;
  index: number;
}

const DayTile = ({ day, index }: DayTileProps) => {
  const colors = useColors();
  
  const tileStyle = useMemo(() => {
    if (day.isCompleted && day.isToday) {
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        borderWidth: 2,
      };
    }
    if (day.isCompleted) {
      return {
        backgroundColor: `${colors.primary}18`,
        borderColor: colors.primary,
        borderWidth: 1.5,
      };
    }
    if (day.isToday) {
      return {
        backgroundColor: colors.surface,
        borderColor: colors.secondary,
        borderWidth: 2,
      };
    }
    return {
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.borderLight,
      borderWidth: 1,
    };
  }, [day.isCompleted, day.isToday, colors]);

  const dayNameColor = day.isToday 
    ? colors.secondary 
    : day.isCompleted 
      ? colors.primary 
      : colors.textTertiary;

  const dayNumberColor = day.isCompleted && day.isToday
    ? '#FFFFFF'
    : day.isCompleted
      ? colors.primary
      : day.isToday
        ? colors.text
        : colors.textSecondary;

  return (
    <Animated.View
      entering={SlideInRight.delay(80 + index * 60).duration(350)}
      style={styles.dayTileWrapper}
    >
      <Text style={[styles.dayLabel, { color: dayNameColor }]}>
        {day.dayName}
      </Text>
      
      <Animated.View style={[styles.dayTile, tileStyle]}>
        {day.isCompleted ? (
          <View style={styles.completedContent}>
            <FontAwesome 
              name="book" 
              size={13} 
              color={day.isToday ? '#FFFFFF' : colors.primary} 
            />
            <Text style={[
              styles.tileNumber, 
              { color: day.isToday ? '#FFFFFF' : colors.primary, fontSize: 11 }
            ]}>
              {day.dayNumber}
            </Text>
          </View>
        ) : (
          <Text style={[styles.tileNumber, { color: dayNumberColor }]}>
            {day.dayNumber}
          </Text>
        )}
      </Animated.View>

      {day.isToday && (
        <View style={[styles.todayLabel, { backgroundColor: colors.secondary }]}>
          <Text style={styles.todayLabelText}>Hoy</Text>
        </View>
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
  
  const weekDays = useMemo(() => {
    const completedDays = streakData?.completedDays ?? [];
    return generateWeekDays(completedDays);
  }, [streakData?.completedDays]);
  
  const completedThisWeek = useMemo(() => {
    return weekDays.filter(day => day.isCompleted).length;
  }, [weekDays]);

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={[styles.container, { backgroundColor: colors.cardBackground }]}
    >
      {/* Header con racha actual */}
      <Animated.View 
        entering={FadeInUp.delay(50).duration(400)}
        style={styles.header}
      >
        <View style={styles.streakInfo}>
          <View style={[styles.streakIcon, { backgroundColor: `${colors.secondary}20` }]}>
            <Text style={styles.streakEmoji}>✝️</Text>
          </View>
          <View style={styles.streakTextBlock}>
            <Text style={[styles.streakCount, { color: colors.text }]}>
              {currentStreak} {currentStreak === 1 ? 'día' : 'días'}
            </Text>
            <Text style={[styles.streakSubtitle, { color: colors.textTertiary }]}>
              de constancia
            </Text>
          </View>
        </View>

        {longestStreak > 0 && (
          <View style={[styles.bestBadge, { backgroundColor: `${colors.secondary}15` }]}>
            <FontAwesome name="star" size={10} color={colors.secondary} />
            <Text style={[styles.bestBadgeText, { color: colors.secondary }]}>
              {longestStreak}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Tiles de la semana */}
      <View style={styles.weekRow}>
        {weekDays.map((day, index) => (
          <DayTile key={day.dateString} day={day} index={index} />
        ))}
      </View>

      {/* Indicador de progreso segmentado */}
      <Animated.View 
        entering={FadeInUp.delay(600).duration(400)}
        style={styles.footer}
      >
        <View style={styles.segmentRow}>
          {Array.from({ length: 7 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  backgroundColor: i < completedThisWeek 
                    ? colors.primary 
                    : colors.surfaceSecondary,
                },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.motivationalText, { color: colors.textSecondary }]}>
          {getMotivationalMessage(completedThisWeek)}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  // -- Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
  },
  streakIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 20,
  },
  streakTextBlock: {
    gap: 1,
  },
  streakCount: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  streakSubtitle: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
  },
  bestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xl,
  },
  bestBadgeText: {
    fontSize: 13,
    fontWeight: Typography.fontWeight.bold,
  },

  // -- Week tiles
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.l,
    gap: 4,
  },
  dayTileWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: 0.3,
  },
  dayTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedContent: {
    alignItems: 'center',
    gap: 1,
  },
  tileNumber: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  todayLabel: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  todayLabelText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // -- Footer
  footer: {
    gap: Spacing.s,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  motivationalText: {
    fontSize: 12,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default WeeklyStreakCalendar;
