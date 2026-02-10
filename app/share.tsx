// ============================================================================
// Share Screen - Pantalla para compartir versículos
// ============================================================================

import { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { Image } from 'expo-image';
import { useColors } from '@/hooks';
import { analytics } from '@/services';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import type { AppBackgroundType } from '@/types';
import { APP_BACKGROUNDS } from '@/components/AppBackgroundSelector';

export default function ShareScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  // Obtener parámetros de la URL
  const params = useLocalSearchParams<{
    text: string;
    reference: string;
    backgroundType: string;
    affirmationId: string;
    category: string;
  }>();

  const verseText = params.text || '';
  const verseReference = params.reference || '';
  const backgroundType = (params.backgroundType || 'default') as AppBackgroundType;
  const verseId = params.affirmationId || '';
  const verseCategory = params.category || 'custom';

  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Ref para capturar la imagen
  const cardRef = useRef<View>(null);

  // Cerrar pantalla
  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  // Copiar texto
  const handleCopyText = useCallback(async () => {
    if (!verseText) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const textToCopy = verseReference 
        ? `"${verseText}" — ${verseReference}` 
        : verseText;
      await Clipboard.setStringAsync(textToCopy);
      setShowCopiedFeedback(true);

      setTimeout(() => {
        setShowCopiedFeedback(false);
      }, 2000);
    } catch (error) {
      console.error('Error al copiar texto:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [verseText, verseReference]);

  // Guardar imagen en galería
  const handleSaveImage = useCallback(async () => {
    if (!verseText || !cardRef.current) return;

    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Pedir permisos
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permisos de galería no concedidos');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      // Capturar la imagen
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Guardar en galería
      await MediaLibrary.saveToLibraryAsync(uri);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowSavedFeedback(true);

      setTimeout(() => {
        setShowSavedFeedback(false);
      }, 2000);
    } catch (error) {
      console.error('Error al guardar imagen:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  }, [verseText]);

  // Compartir imagen
  const handleShareImage = useCallback(async () => {
    if (!verseText || !cardRef.current) return;

    try {
      setIsSharing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Compartir versículo',
        });
        
        // Track share
        analytics.track('verse_shared', {
          verse_id: verseId,
          category: verseCategory,
          share_method: 'image',
          background_type: backgroundType,
        });
      } else {
        console.warn('Compartir no disponible en este dispositivo');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSharing(false);
    }
  }, [verseText, verseId, verseCategory, backgroundType]);

  // Obtener configuración del fondo
  const backgroundConfig = APP_BACKGROUNDS.find((bg) => bg.id === backgroundType) || APP_BACKGROUNDS[0];
  const isDefaultBg = backgroundConfig.id === 'default';

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Spacing.m }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <FontAwesome name="times" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Preview Card - Esta se captura como imagen */}
        <View
          ref={cardRef}
          collapsable={false}
          style={styles.previewCard}
        >
          {/* Background */}
          {isDefaultBg ? (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background }]} />
          ) : backgroundConfig.imageSource ? (
            <Image
              source={backgroundConfig.imageSource}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background }]} />
          )}

          {/* Overlay sutil para fondos con imagen */}
          {!isDefaultBg && backgroundConfig.imageSource && (
            <View style={styles.previewOverlay} />
          )}

          {/* Contenido */}
          <View style={styles.previewContent}>
            {/* Ícono decorativo */}
            <Text style={styles.decorativeIcon}>✝️</Text>

            {/* Texto del versículo */}
            <Text 
              style={[
                styles.previewText, 
                { color: isDefaultBg ? colors.text : '#FFFFFF' }
              ]}
            >
              {verseText}
            </Text>

            {/* Referencia bíblica */}
            {verseReference && (
              <Text 
                style={[
                  styles.previewReference, 
                  { color: isDefaultBg ? colors.textSecondary : 'rgba(255,255,255,0.8)' }
                ]}
              >
                — {verseReference}
              </Text>
            )}
          </View>

          {/* Branding sutil */}
          <View style={styles.brandingContainer}>
            <Text 
              style={[
                styles.brandingText, 
                { color: isDefaultBg ? colors.textTertiary : 'rgba(255,255,255,0.5)' }
              ]}
            >
              Versículo
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsRow}>
          {/* Guardar imagen */}
          <ActionButton
            icon={showSavedFeedback ? 'check' : 'download'}
            label={showSavedFeedback ? '¡Guardado!' : 'Guardar'}
            onPress={handleSaveImage}
            isLoading={isSaving}
            isSuccess={showSavedFeedback}
          />

          {/* Copiar texto */}
          <ActionButton
            icon={showCopiedFeedback ? 'check' : 'copy'}
            label={showCopiedFeedback ? '¡Copiado!' : 'Copiar'}
            onPress={handleCopyText}
            isSuccess={showCopiedFeedback}
          />
        </View>

        {/* Botón principal de compartir */}
        <View style={styles.shareButtonContainer}>
          <Pressable
            style={[styles.shareButton, { backgroundColor: colors.primary }]}
            onPress={handleShareImage}
            disabled={isSharing}
          >
            {isSharing ? (
              <FontAwesome name="spinner" size={24} color="#FFFFFF" />
            ) : (
              <FontAwesome name="share" size={24} color="#FFFFFF" />
            )}
          </Pressable>
          <Text style={[styles.shareButtonLabel, { color: colors.textSecondary }]}>
            Compartir
          </Text>
        </View>
      </View>

      {/* Spacer para el bottom */}
      <View style={{ height: insets.bottom + Spacing.l }} />
    </View>
  );
}

// ============================================================================
// ActionButton - Botón de acción pequeño
// ============================================================================

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
}

function ActionButton({
  icon,
  label,
  onPress,
  isLoading,
  isSuccess,
}: ActionButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = isSuccess ? colors.success : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}
      style={styles.actionButtonPressable}
    >
      <Animated.View
        style={[
          styles.actionButton,
          { backgroundColor: colors.surfaceSecondary },
          animatedStyle,
        ]}
      >
        {isLoading ? (
          <FontAwesome name="spinner" size={20} color={iconColor} />
        ) : (
          <FontAwesome name={icon as any} size={20} color={iconColor} />
        )}
      </Animated.View>
      <Text 
        style={[styles.actionButtonLabel, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
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
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.m,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },

  // Preview Card
  previewCard: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  decorativeIcon: {
    fontSize: 32,
    marginBottom: Spacing.l,
  },
  previewText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 34,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontFamily: Typography.fontFamily.heading,
  },
  previewReference: {
    fontSize: Typography.fontSize.body,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.m,
    fontStyle: 'italic',
    fontFamily: Typography.fontFamily.body,
  },

  // Branding
  brandingContainer: {
    position: 'absolute',
    bottom: Spacing.m,
    right: Spacing.m,
  },
  brandingText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Actions Row
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  actionButtonPressable: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 70,
  },

  // Share Button
  shareButtonContainer: {
    alignItems: 'center',
    gap: Spacing.s,
  },
  shareButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
