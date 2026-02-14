// ============================================================================
// Share Screen - Pantalla para compartir afirmaciones
// ============================================================================

import { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Share,
  Platform,
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

// ============================================================================
// Tito Outfit Variants - Variantes de outfit de Tito
// ============================================================================

type TitoOutfitId = 'default' | 'greetings' | 'stamp' | 'sleeps' | 'peeking' | 'hidden';

interface TitoOutfitStyle {
  width: number;
  height: number;
  // Offsets como porcentaje del tamaño de la imagen (0 = borde, -0.2 = 20% fuera, 0.1 = 10% adentro)
  bottomOffset: number;
  leftOffset?: number;
  rightOffset?: number;
}

interface TitoOutfit {
  id: TitoOutfitId;
  source: any; // require() image source
  label: string;
  style: TitoOutfitStyle;
}

// Configuración de variantes de Tito - agregar más aquí fácilmente
// Cada outfit tiene su propia configuración de tamaño y posición
// Los offsets son porcentajes del tamaño de la imagen (ej: -0.2 = 20% fuera del borde)
const TITO_OUTFITS: TitoOutfit[] = [
  {
    id: 'default',
    source: require('@/assets/icons/Tito.png'),
    label: 'Tito',
    style: { width: 150, height: 150, bottomOffset: -0.1, leftOffset: -0.13 },
  },
  {
    id: 'greetings',
    source: require('@/assets/icons/TitoGreetings.png'),
    label: 'Saludo',
    style: { width: 150, height: 150, bottomOffset: -0.1, leftOffset: -0.13 },
  },
  {
    id: 'stamp',
    source: require('@/assets/icons/TitoPraying.png'),
    label: 'Sello',
    style: { width: 150, height: 150, bottomOffset: -0.1, leftOffset: -0.13 },
  },
  {
    id: 'sleeps',
    source: require('@/assets/icons/TitoSleeping.png'),
    label: 'Duerme',
    style: { width: 150, height: 150, bottomOffset: -0.1, leftOffset: -0.13 },
  },
  {
    id: 'peeking',
    source: require('@/assets/icons/TitoPeeking.png'),
    label: 'Asomándose',
    style: { width: 150, height: 150, bottomOffset: -0.1, leftOffset: -0.4 },
  },
];

// Estado "hidden" no tiene imagen, es el último estado del ciclo
const TITO_STATES: TitoOutfitId[] = [...TITO_OUTFITS.map(o => o.id), 'hidden'];

const TITO_DOWNLOAD_URL = 'https://sagradapalabra.com/versiculos-diarios/download';

export default function ShareScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  // Obtener parámetros de la URL
  const params = useLocalSearchParams<{
    text: string;
    backgroundType: string;
    affirmationId: string;
    category: string;
  }>();

  const affirmationText = params.text || '';
  const backgroundType = (params.backgroundType || 'default') as AppBackgroundType;

  // Separar el título del versículo y la referencia bíblica
  const titleParts = affirmationText.split(' — ');
  const mainText = titleParts[0];
  const bibleReference = titleParts.length > 1 ? titleParts[1] : null;
  const affirmationId = params.affirmationId || '';
  const affirmationCategory = params.category || 'custom';

  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [currentTitoIndex, setCurrentTitoIndex] = useState(0); // Índice en TITO_STATES

  // Ref para capturar la imagen
  const cardRef = useRef<View>(null);

  // Obtener el estado actual de Tito
  const currentTitoState = TITO_STATES[currentTitoIndex];
  const currentTitoOutfit = TITO_OUTFITS.find(o => o.id === currentTitoState);
  const isTitoVisible = currentTitoState !== 'hidden';

  // Cerrar pantalla
  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  // Cambiar outfit de Tito (cicla entre todos los estados incluyendo hidden)
  const handleChangeTitoOutfit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentTitoIndex((prev) => (prev + 1) % TITO_STATES.length);
  }, []);

  // Copiar texto
  const handleCopyText = useCallback(async () => {
    if (!affirmationText) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Clipboard.setStringAsync(`${affirmationText}\n\nDescargá Tito - Versículos Diarios: ${TITO_DOWNLOAD_URL}`);
      setShowCopiedFeedback(true);

      setTimeout(() => {
        setShowCopiedFeedback(false);
      }, 2000);
    } catch (error) {
      console.error('Error al copiar texto:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [affirmationText]);

  // Guardar imagen en galería
  const handleSaveImage = useCallback(async () => {
    if (!affirmationText || !cardRef.current) return;

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
  }, [affirmationText]);

  // Compartir imagen
  const handleShareImage = useCallback(async () => {
    if (!affirmationText || !cardRef.current) return;

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
        const shareMessage = `"${affirmationText}"\n\nDescargá Tito - Versículos Diarios para más versículos como este: ${TITO_DOWNLOAD_URL}`;

        if (Platform.OS === 'ios') {
          await Share.share({
            message: shareMessage,
            url: uri,
          });
        } else {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Compartir versículo - Tito',
          });
        }
        
        // Track share
        analytics.track('affirmation_shared', {
          affirmation_id: affirmationId,
          category: affirmationCategory,
          share_method: 'image',
          background_type: backgroundType,
          has_tito: isTitoVisible,
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
  }, [affirmationText, affirmationId, affirmationCategory, backgroundType, isTitoVisible]);

  // Obtener configuración del fondo
  const backgroundConfig = APP_BACKGROUNDS.find((bg) => bg.id === backgroundType) || APP_BACKGROUNDS[0];
  const isDefaultBg = backgroundConfig.id === 'default';

  // Obtener label del botón de Tito
  const getTitoButtonLabel = () => {
    if (currentTitoState === 'hidden') {
      return 'Mostrar Tito';
    }
    const nextIndex = (currentTitoIndex + 1) % TITO_STATES.length;
    const nextState = TITO_STATES[nextIndex];
    if (nextState === 'hidden') {
      return 'Ocultar Tito';
    }
    const nextOutfit = TITO_OUTFITS.find(o => o.id === nextState);
    return nextOutfit?.label || 'Cambiar';
  };

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
            {/* Texto del versículo */}
            <Text
              style={[
                styles.previewText,
                { color: isDefaultBg ? colors.text : '#FFFFFF' }
              ]}
            >
              {mainText}
            </Text>
            {/* Referencia bíblica */}
            {bibleReference && (
              <Text
                style={[
                  styles.previewReference,
                  { color: isDefaultBg ? colors.text : '#FFFFFF' }
                ]}
              >
                {bibleReference}
              </Text>
            )}
          </View>

          {/* Tito - posición configurable */}
          {isTitoVisible && currentTitoOutfit && (
            <View style={[
              styles.titoContainer,
              {
                bottom: currentTitoOutfit.style.bottomOffset * currentTitoOutfit.style.height,
                ...(currentTitoOutfit.style.leftOffset !== undefined && {
                  left: currentTitoOutfit.style.leftOffset * currentTitoOutfit.style.width
                }),
                ...(currentTitoOutfit.style.rightOffset !== undefined && {
                  right: currentTitoOutfit.style.rightOffset * currentTitoOutfit.style.width
                }),
              }
            ]}>
              <Image
                source={currentTitoOutfit.source}
                style={{
                  width: currentTitoOutfit.style.width,
                  height: currentTitoOutfit.style.height,
                }}
                contentFit="contain"
              />
            </View>
          )}
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

          {/* Cambiar outfit de Tito */}
          <ActionButton
            icon="magic"
            label={getTitoButtonLabel()}
            onPress={handleChangeTitoOutfit}
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

  // Preview Card - más vertical (4:5 aspect ratio como Instagram)
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
  },
  previewText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontFamily: Typography.fontFamily.heading,
  },
  previewReference: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: Typography.fontFamily.body,
    opacity: 0.6,
    marginTop: Spacing.m,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Tito
  titoContainer: {
    position: 'absolute',
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
