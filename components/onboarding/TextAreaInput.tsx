// ============================================================================
// TextAreaInput - Campo de texto multilinea para onboarding
// ============================================================================

import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { useMemo, useState, useRef } from 'react';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Spacing, BorderRadius, Typography, ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks';

interface TextAreaInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: number;
  showCharacterCount?: boolean;
  delay?: number;
}

export function TextAreaInput({
  value,
  onChangeText,
  placeholder = 'Escribí acá...',
  maxLength = 300,
  minHeight = 150,
  showCharacterCount = true,
  delay = 0,
}: TextAreaInputProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark, minHeight), [colors, isDark, minHeight]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const characterCount = value.length;
  const isNearLimit = characterCount >= maxLength * 0.8;
  const isAtLimit = characterCount >= maxLength;

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(delay)}
      style={styles.container}
    >
      <Pressable 
        onPress={handleContainerPress}
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={maxLength}
          textAlignVertical="top"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          scrollEnabled={true}
          blurOnSubmit={false}
        />
      </Pressable>

      {showCharacterCount && (
        <Animated.View 
          entering={FadeIn.duration(300).delay(delay + 200)}
          style={styles.counterContainer}
        >
          <Text style={[
            styles.counterText,
            isNearLimit && styles.counterWarning,
            isAtLimit && styles.counterLimit,
          ]}>
            {characterCount}/{maxLength}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean, minHeight: number) =>
  StyleSheet.create({
    container: {
      gap: Spacing.s,
    },
    inputContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.lg,
      borderWidth: 2,
      borderColor: colors.border,
      padding: Spacing.l,
      minHeight,
    },
    inputContainerFocused: {
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 2,
    },
    textInput: {
      flex: 1,
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.regular,
      color: colors.text,
      lineHeight: Typography.fontSize.body * Typography.lineHeight.body,
    },
    counterContainer: {
      alignItems: 'flex-end',
      paddingHorizontal: Spacing.xs,
    },
    counterText: {
      fontSize: Typography.fontSize.caption,
      fontWeight: Typography.fontWeight.medium,
      color: colors.textMuted,
    },
    counterWarning: {
      color: colors.primary,
    },
    counterLimit: {
      color: colors.accent,
      fontWeight: Typography.fontWeight.bold,
    },
  });
