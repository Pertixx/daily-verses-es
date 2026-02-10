// ============================================================================
// Profile Screen - Pantalla de perfil del usuario (Modal)
// ============================================================================

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors, useTheme } from '@/hooks';
import { storageService, revenueCatService, analytics } from '@/services';
import { WeeklyStreakCalendar } from '@/components/WeeklyStreakCalendar';
import { PremiumBanner } from '@/components/PremiumBanner';
import { LEGAL_URLS } from '@/types';
import type { UserData } from '@/types';

export default function ProfileScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(true); // Default true para no mostrar banner mientras carga

  useEffect(() => {
    loadUserData();
    checkPremiumStatus();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await storageService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const hasSubscription = await revenueCatService.hasActiveSubscription();
      setIsPremium(hasSubscription);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    }
  };

  const handleNavigateToPremium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    analytics.track('paywall_viewed', { source: 'profile' });
    router.push('/paywall');
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleNavigateToTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/theme-settings');
  };

  const handleNavigateToNotifications = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/notification-settings');
  };

  const handleNavigateToFavorites = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/favorites');
  };

  const handleNavigateToName = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/name-settings');
  };

  const profile = userData?.profile;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: Spacing.m }]}
      >
        <Pressable
          style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={handleClose}
        >
          <FontAwesome name="times" size={18} color={colors.text} />
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar y nombre */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.profileHeader}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Perfil
          </Text>
          <View style={[styles.avatarContainer, { backgroundColor: colors.surfaceSecondary }]}>
            <Text style={styles.avatarEmoji}>✞️</Text>
          </View>
        </Animated.View>

        {/* Banner Premium (solo para usuarios no premium) */}
        {!isPremium && (
          <PremiumBanner 
            onPress={handleNavigateToPremium} 
            animationDelay={150}
          />
        )}

        {/* Calendario semanal de racha */}
        <Animated.View entering={FadeInDown.delay(isPremium ? 200 : 250).duration(400)}>
          <WeeklyStreakCalendar streakData={userData?.streak} />
        </Animated.View>

        {/* Cuenta */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.optionsSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Cuenta
          </Text>

          {/* Nombre */}
          <Pressable
            style={[styles.optionItem, { backgroundColor: colors.cardBackground }]}
            onPress={handleNavigateToName}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <FontAwesome name="user-o" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.optionText, { color: colors.text }]}>
                  Nombre
                </Text>
                <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                  {profile?.name || 'No configurado'}
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
          </Pressable>
        </Animated.View>

        {/* Opciones */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.optionsSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Configuración
          </Text>

          {/* Toggle tema */}
          <Pressable
            style={[styles.optionItem, { backgroundColor: colors.cardBackground }]}
            onPress={handleNavigateToTheme}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <FontAwesome
                  name={isDark ? 'moon-o' : 'sun-o'}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Apariencia
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
          </Pressable>

          {/* Notificaciones */}
          <Pressable
            style={[styles.optionItem, { backgroundColor: colors.cardBackground }]}
            onPress={handleNavigateToNotifications}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <FontAwesome name="bell-o" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Notificaciones
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
          </Pressable>

          {/* Favoritos */}
          <Pressable
            style={[styles.optionItem, { backgroundColor: colors.cardBackground }]}
            onPress={handleNavigateToFavorites}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <FontAwesome name="heart-o" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Mis favoritos
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
          </Pressable>
        </Animated.View>

        {/* Info de la app */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={styles.optionsSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Legal
          </Text>

          <Pressable
            style={[styles.optionItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => Linking.openURL(LEGAL_URLS.termsOfService)}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <FontAwesome name="file-text-o" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Términos y condiciones
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
          </Pressable>

          <Pressable
            style={[styles.optionItem, { backgroundColor: colors.cardBackground }]}
            onPress={() => Linking.openURL(LEGAL_URLS.privacyPolicy)}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.optionIcon, { backgroundColor: colors.surfaceSecondary }]}>
                <FontAwesome name="shield" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>
                Política de privacidad
              </Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
          </Pressable>
        </Animated.View>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.xxxl,
  },
  headerTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  closeButton: {
    position: 'absolute',
    left: Spacing.l,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.l,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: Spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  userName: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.l,
    marginBottom: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.h1,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  statLabel: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
  },
  optionsSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.m,
    marginLeft: Spacing.xs,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.l,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.s,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  optionText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
  },
  optionSubtext: {
    fontSize: Typography.fontSize.caption,
    marginTop: 2,
  },
});
