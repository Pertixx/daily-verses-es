// ============================================================================
// Name Settings Screen - Pantalla para editar el nombre del usuario
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius, ThemeColors } from '@/constants/theme';
import { useColors, useTheme } from '@/hooks';
import { storageService } from '@/services';

export default function NameSettingsScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const userData = await storageService.getUserData();
      const currentName = userData?.profile?.name || '';
      setName(currentName);
      setOriginalName(currentName);
    } catch (error) {
      console.error('Error loading user name:', error);
    } finally {
      // Loading complete
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await storageService.updateProfile({ name: name.trim() });
    router.back();
  };

  const isValid = name.trim().length >= 2;
  const hasChanges = name.trim() !== originalName;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: Spacing.m }]}
      >
        <Pressable style={styles.backButton} onPress={handleClose}>
          <FontAwesome name="chevron-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Nombre
        </Text>
        <Pressable
          style={[
            styles.saveButton,
            {
              backgroundColor: isValid && hasChanges ? colors.primary : colors.surfaceSecondary,
              opacity: isValid && hasChanges ? 1 : 0.5,
            },
          ]}
          onPress={handleSave}
          disabled={!isValid || !hasChanges}
        >
          <Text
            style={[
              styles.saveButtonText,
              { color: isValid && hasChanges ? '#FFFFFF' : colors.textMuted },
            ]}
          >
            Guardar
          </Text>
        </Pressable>
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.inputSection}
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            ¿Cómo te llamas?
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="given-name"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.infoBox, { backgroundColor: colors.surfaceSecondary }]}
        >
          <FontAwesome name="lock" size={16} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Tu nombre se guarda solo en tu dispositivo
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.l,
      paddingBottom: Spacing.m,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: Typography.fontSize.h3,
      fontWeight: Typography.fontWeight.semibold,
      fontFamily: Typography.fontFamily.heading,
    },
    saveButton: {
      paddingHorizontal: Spacing.l,
      paddingVertical: Spacing.s,
      borderRadius: 20,
    },
    saveButtonText: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.semibold,
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.l,
      paddingTop: Spacing.xl,
    },
    inputSection: {
      marginBottom: Spacing.xl,
    },
    label: {
      fontSize: Typography.fontSize.body,
      fontWeight: Typography.fontWeight.medium,
      marginBottom: Spacing.m,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: BorderRadius.xl,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.l,
      fontSize: Typography.fontSize.h3,
      fontWeight: Typography.fontWeight.medium,
      color: colors.text,
      textAlign: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: isDark ? 1 : 0,
      borderColor: colors.border,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.m,
      padding: Spacing.l,
      borderRadius: BorderRadius.lg,
    },
    infoText: {
      flex: 1,
      fontSize: Typography.fontSize.caption,
    },
  });
