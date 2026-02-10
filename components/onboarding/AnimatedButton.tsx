// ============================================================================
// AnimatedButton - Botón animado para onboarding
// ============================================================================

import { StyleSheet, Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BorderRadius, Spacing, Typography, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks';
import { useMemo } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
}

export function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  fullWidth = true,
  style,
  textStyle,
  haptic = true,
}: AnimatedButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const styles = useMemo(() => createStyles(colors), [colors]);
  const variantStyles = useMemo(() => getVariantStyles(variant, colors), [variant, colors]);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : opacity.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.button,
        variantStyles.button,
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.text, variantStyles.text, textStyle]}>{title}</Text>
    </AnimatedPressable>
  );
}

function getVariantStyles(variant: ButtonVariant, colors: ThemeColors) {
  switch (variant) {
    case 'primary':
      return {
        button: { backgroundColor: colors.primary },
        text: { color: colors.text },
      };
    case 'secondary':
      return {
        button: { backgroundColor: colors.secondary },
        text: { color: colors.text },
      };
    case 'outline':
      return {
        button: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.border },
        text: { color: colors.textSecondary },
      };
    case 'ghost':
      return {
        button: { backgroundColor: 'transparent' },
        text: { color: colors.textTertiary },
      };
  }
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.l,
      paddingHorizontal: Spacing.xxl,
      borderRadius: BorderRadius.lg,
      gap: Spacing.s,
    },
    fullWidth: {
      width: '100%',
    },
    text: {
      fontSize: Typography.fontSize.button,
      fontWeight: Typography.fontWeight.semibold,
    },
    icon: {
      fontSize: 20,
    },
  });
