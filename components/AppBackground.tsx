// ============================================================================
// AppBackground - Componente de fondo de pantalla con el background del usuario
// ============================================================================

import { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks';
import type { AppBackgroundType } from '@/types';
import { APP_BACKGROUNDS } from './AppBackgroundSelector';

interface AppBackgroundProps {
  /** Tipo de fondo a mostrar (si no se pasa, usa el del perfil del usuario) */
  backgroundType?: AppBackgroundType;
  /** Contenido a renderizar sobre el fondo */
  children: ReactNode;
  /** Estilos adicionales para el contenedor */
  style?: StyleProp<ViewStyle>;
}

/**
 * Componente que renderiza el fondo de pantalla seleccionado por el usuario
 */
export function AppBackground({ backgroundType = 'default', children, style }: AppBackgroundProps) {
  const { colors } = useTheme();

  // Encontrar la configuración del fondo
  const backgroundConfig = APP_BACKGROUNDS.find((bg) => bg.id === backgroundType) || APP_BACKGROUNDS[0];

  // Para el fondo "default", usar colores del tema actual
  const isDefault = backgroundConfig.id === 'default';
  const backgroundColor = isDefault 
    ? colors.background
    : undefined;

  return (
    <View style={[styles.container, backgroundColor ? { backgroundColor } : undefined, style]}>
      {/* Background image for premium variants */}
      {!isDefault && backgroundConfig.imageSource && (
        <Image
          source={backgroundConfig.imageSource}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
      )}
      
      {/* Content */}
      {children}
    </View>
  );
}

/**
 * Helper para obtener el color de texto según el fondo
 */
export function getTextColorForBackground(backgroundType: AppBackgroundType, isDark: boolean): string {
  const backgroundConfig = APP_BACKGROUNDS.find((bg) => bg.id === backgroundType) || APP_BACKGROUNDS[0];
  
  if (backgroundConfig.id === 'default') {
    return isDark ? '#F9FAFB' : '#1F2937';
  }
  
  return backgroundConfig.textColor;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
