// ============================================================================
// SelectionOption - Opción de selección reutilizable para onboarding
// ============================================================================

import { Text, StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks';
import { useMemo } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SelectionOptionProps {
  icon?: string;
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  delay?: number;
  /** Si es true, muestra un checkbox en lugar de radio (para selección múltiple) */
  multiSelect?: boolean;
}

export function SelectionOption({
  icon,
  title,
  description,
  selected,
  onSelect,
  delay = 0,
  multiSelect = false,
}: SelectionOptionProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onSelect();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          selected && styles.containerSelected,
          animatedStyle,
        ]}
      >
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
        
        <View style={styles.content}>
          <Text style={[styles.title, selected && styles.titleSelected]}>
            {title}
          </Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>

        {/* Radio/Checkbox indicator */}
        <View style={[
          multiSelect ? styles.checkbox : styles.radio,
          selected && (multiSelect ? styles.checkboxSelected : styles.radioSelected)
        ]}>
          {selected && (
            multiSelect 
              ? <Text style={styles.checkmark}>✓</Text>
              : <View style={styles.radioInner} />
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.m,
      backgroundColor: colors.surface,
      padding: Spacing.l,
      borderRadius: BorderRadius.xl,
      borderWidth: 2,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    containerSelected: {
      borderColor: colors.primary,
      backgroundColor: isDark ? `${colors.primary}20` : colors.badgeAzulBg,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: BorderRadius.md,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 24,
    },
    content: {
      flex: 1,
      gap: Spacing.xs,
    },
    title: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.semibold,
      color: colors.text,
      fontFamily: Typography.fontFamily.body
    },
    titleSelected: {
      color: colors.text,
    },
    description: {
      fontSize: Typography.fontSize.caption,
      color: colors.textSecondary,
      lineHeight: Typography.fontSize.caption * Typography.lineHeight.caption,
      fontFamily: Typography.fontFamily.body
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: BorderRadius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    checkmark: {
      fontSize: 14,
      fontWeight: Typography.fontWeight.bold,
      color: '#FFFFFF',
    },
  });
