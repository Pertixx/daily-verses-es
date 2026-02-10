// ============================================================================
// Notification Settings Screen - Configuración de notificaciones
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors } from '@/hooks';
import { storageService, notificationService, analytics } from '@/services';
import { FrequencySelector } from '@/components/FrequencySelector';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import type { NotificationSettings } from '@/types';

// Utilidad para parsear hora "HH:00" a número
const parseHour = (time: string): number => {
  return parseInt(time.split(':')[0], 10);
};

// Utilidad para formatear número a "HH:00"
const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

export default function NotificationSettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await storageService.getNotificationSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!settings) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const newSettings = { ...settings, enabled };
    setSettings(newSettings);
    await storageService.setNotificationSettings(newSettings);
    await notificationService.scheduleVerseNotifications(newSettings);
    
    // Trackear cambio de estado de notificaciones
    analytics.track(enabled ? 'notification_enabled' : 'notification_disabled', {
      source: 'settings',
      frequency: newSettings.frequency
    });
  };

  const handleToggleStreakReminder = async (enabled: boolean) => {
    if (!settings) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const newSettings = { ...settings, dailyStreakReminder: enabled };
    setSettings(newSettings);
    await storageService.setNotificationSettings(newSettings);
    await notificationService.scheduleStreakReminder(newSettings);
  };

  const handleFrequencyChange = async (frequency: number) => {
    if (!settings) return;
    
    const newSettings = { ...settings, frequency };
    setSettings(newSettings);
    await storageService.setNotificationSettings(newSettings);
    await notificationService.scheduleVerseNotifications(newSettings);
  };

  const handleStartHourChange = async (hour: number) => {
    if (!settings) return;
    
    const newSettings = { ...settings, startTime: formatHour(hour) };
    setSettings(newSettings);
    await storageService.setNotificationSettings(newSettings);
    await notificationService.scheduleVerseNotifications(newSettings);
  };

  const handleEndHourChange = async (hour: number) => {
    if (!settings) return;
    
    const newSettings = { ...settings, endTime: formatHour(hour) };
    setSettings(newSettings);
    await storageService.setNotificationSettings(newSettings);
    await notificationService.scheduleVerseNotifications(newSettings);
  };

  // Parsear horas del settings
  const startHour = useMemo(() => parseHour(settings?.startTime || '09:00'), [settings?.startTime]);
  const endHour = useMemo(() => parseHour(settings?.endTime || '21:00'), [settings?.endTime]);

  if (isLoading || !settings) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Spacing.m }]}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <FontAwesome name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Notificaciones
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: Spacing.m }]}
      >
        <Pressable style={styles.backButton} onPress={handleBack}>
          <FontAwesome name="chevron-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Notificaciones
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle principal */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.settingItem, { backgroundColor: colors.cardBackground }]}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <FontAwesome name="bell" size={18} color={colors.primary} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Notificaciones
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Recibir recordatorios de versículos
              </Text>
            </View>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </Animated.View>

        {settings.enabled && (
          <>
            {/* Frecuencia */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(400)}
              style={styles.section}
            >
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Frecuencia
              </Text>
              <FrequencySelector
                value={settings.frequency}
                onChange={handleFrequencyChange}
                min={1}
                max={20}
                animationDelay={0}
              />
            </Animated.View>

            {/* Horario */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(400)}
              style={styles.section}
            >
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Horario
              </Text>
              <TimeRangeSelector
                startHour={startHour}
                endHour={endHour}
                onStartHourChange={handleStartHourChange}
                onEndHourChange={handleEndHourChange}
                showHint
                frequency={settings.frequency}
              />
            </Animated.View>

            {/* Recordatorio de racha */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(400)}
              style={[styles.settingItem, { backgroundColor: colors.cardBackground }]}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.surfaceSecondary }]}>
                  <FontAwesome name="fire" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Recordatorio de racha
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Avisarte si no leíste tu versículo diario
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.dailyStreakReminder}
                onValueChange={handleToggleStreakReminder}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.l,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.m,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.m,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSize.caption,
  },
  section: {
    marginBottom: Spacing.l,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.m,
    marginLeft: Spacing.xs,
  },
});
