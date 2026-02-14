// ============================================================================
// Theme Explore Screen - Explorar temas, íconos y fondos
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors } from '@/hooks';
import { storageService, revenueCatService, appIconService, analytics } from '@/services';
import { AppIconSelector, APP_ICONS } from '@/components/AppIconSelector';
import { AppBackgroundSelector, APP_BACKGROUNDS } from '@/components/AppBackgroundSelector';
import type { AppIconType, AppBackgroundType } from '@/types';

type TabType = 'backgrounds' | 'icons';

export default function ThemeExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>('backgrounds');
  const [selectedIcon, setSelectedIcon] = useState<AppIconType>('default');
  const [selectedBackground, setSelectedBackground] = useState<AppBackgroundType>('default');
  const [isPremium, setIsPremium] = useState(false);

  // Cargar configuración actual
  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      const [profile, hasSubscription] = await Promise.all([
        storageService.getProfile(),
        revenueCatService.hasActiveSubscription(),
      ]);
      
      setSelectedIcon(profile?.appIcon || 'default');
      setSelectedBackground(profile?.appBackground || 'default');
      setIsPremium(hasSubscription);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSelectIcon = useCallback(async (iconId: AppIconType) => {
    const iconConfig = APP_ICONS.find(icon => icon.id === iconId);
    
    // Si es premium y el usuario no tiene suscripción
    if (iconConfig?.isPremium && !isPremium) {
      analytics.track('paywall_viewed', { source: 'theme_icon_selection' });
      router.push('/paywall');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedIcon(iconId);
    
    // Guardar y aplicar el ícono
    try {
      await appIconService.setAppIcon(iconId);
      
      // Track icon change
      analytics.track('app_icon_changed', { icon: iconId });
    } catch (error) {
      console.error('Error setting app icon:', error);
    }
  }, [isPremium, router]);

  const handleSelectBackground = useCallback(async (backgroundId: AppBackgroundType) => {
    const bgConfig = APP_BACKGROUNDS.find(bg => bg.id === backgroundId);
    
    // Si es premium y el usuario no tiene suscripción
    if (bgConfig?.isPremium && !isPremium) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      analytics.track('paywall_viewed', { source: 'theme_background_selection' });
      router.push('/paywall');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBackground(backgroundId);
    
    // Guardar el fondo
    try {
      await storageService.updateProfile({ appBackground: backgroundId });
      
      // Track background change
      analytics.track('app_background_changed', { background: backgroundId });
    } catch (error) {
      console.error('Error saving background:', error);
    }
  }, [isPremium, router]);

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tab);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: Spacing.m }]}
      >
        <Pressable style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]} onPress={handleBack}>
          <FontAwesome name="times" size={18} color={colors.text} />
        </Pressable>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Tito Image */}
      <Animated.View
        entering={FadeInDown.delay(50).duration(300)}
        style={styles.titoContainer}
      >
        <Image
          source={require('@/assets/icons/Tito.png')}
          style={styles.titoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Premium Banner (si no es premium) */}
      {!isPremium && (
        <Animated.View
          entering={FadeInDown.delay(100).duration(300)}
          style={styles.bannerContainer}
        >
          <Pressable
            style={[styles.premiumBanner, { backgroundColor: colors.cardBackground, borderColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              analytics.track('paywall_viewed', { source: 'theme_explore_banner' });
              router.push('/paywall');
            }}
          >
            <View style={styles.premiumBannerContent}>
              <FontAwesome name="star" size={18} color={colors.primary} />
              <View style={styles.premiumBannerText}>
                <Text style={[styles.premiumBannerTitle, { color: colors.text }]}>
                  Desbloquea todos los temas
                </Text>
                <Text style={[styles.premiumBannerSubtitle, { color: colors.textSecondary }]}>
                  Accede a fondos e íconos exclusivos
                </Text>
              </View>
            </View>
            <FontAwesome name="chevron-right" size={14} color={colors.textTertiary} />
          </Pressable>
        </Animated.View>
      )}

      {/* Tab Selector */}
      <Animated.View
        entering={FadeInDown.delay(150).duration(300)}
        style={styles.tabContainer}
      >
        <View style={[styles.tabSelector, { backgroundColor: colors.surfaceSecondary }]}>
          <Pressable
            style={[
              styles.tab,
              activeTab === 'backgrounds' && [styles.tabActive, { backgroundColor: colors.cardBackground }],
            ]}
            onPress={() => handleTabChange('backgrounds')}
          >
            <FontAwesome 
              name="image" 
              size={16} 
              color={activeTab === 'backgrounds' ? colors.primary : colors.textSecondary} 
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'backgrounds' ? colors.primary : colors.textSecondary },
                activeTab === 'backgrounds' && styles.tabTextActive,
              ]}
            >
              Fondos
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.tab,
              activeTab === 'icons' && [styles.tabActive, { backgroundColor: colors.cardBackground }],
            ]}
            onPress={() => handleTabChange('icons')}
          >
            <FontAwesome 
              name="th-large" 
              size={16} 
              color={activeTab === 'icons' ? colors.primary : colors.textSecondary} 
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'icons' ? colors.primary : colors.textSecondary },
                activeTab === 'icons' && styles.tabTextActive,
              ]}
            >
              Íconos
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'backgrounds' ? (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Fondo de pantalla
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Elegí el fondo para tus versículos diarios
            </Text>
            
            <View style={styles.selectorContainer}>
              <AppBackgroundSelector
                selectedBackground={selectedBackground}
                onSelectBackground={handleSelectBackground}
                showPremiumBadge={false}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn.duration(200)}
            style={styles.section}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Ícono de la app
            </Text>
            <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
              Cambiá el ícono de Tito en tu pantalla
            </Text>
            
            <View style={styles.selectorContainer}>
              <AppIconSelector
                selectedIcon={selectedIcon}
                onSelectIcon={handleSelectIcon}
                showPremiumBadge={!isPremium}
              />
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.s,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  headerSpacer: {
    width: 36,
  },
  titoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  titoImage: {
    width: 150,
    height: 150,
  },
  bannerContainer: {
    paddingHorizontal: Spacing.l,
    marginBottom: Spacing.m,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.m,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    flex: 1,
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: Typography.fontSize.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  premiumBannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  tabContainer: {
    paddingHorizontal: Spacing.l,
    marginBottom: Spacing.l,
  },
  tabSelector: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingVertical: Spacing.m,
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.medium,
  },
  tabTextActive: {
    fontWeight: Typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.l,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.l,
  },
  selectorContainer: {
    alignItems: 'center',
  },
});
