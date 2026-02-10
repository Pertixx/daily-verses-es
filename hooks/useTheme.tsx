// ============================================================================
// Theme Context - Contexto para manejar el tema de la aplicación
// ============================================================================

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors, ThemeColors } from '@/constants/theme';
import { storageService } from '@/services';
import type { Theme } from '@/types';

interface ThemeContextType {
  /** El tema actual efectivo (siempre 'light' o 'dark', nunca 'auto') */
  colorScheme: 'light' | 'dark';
  /** La preferencia del usuario ('light', 'dark', o 'auto') */
  themePreference: Theme;
  /** Los colores actuales según el tema */
  colors: ThemeColors;
  /** Si el tema actual es dark */
  isDark: boolean;
  /** Función para cambiar la preferencia del tema */
  setThemePreference: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<Theme>('auto');
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar preferencia guardada
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await storageService.getTheme();
      setThemePreferenceState(savedTheme);
      setIsLoaded(true);
    };
    loadTheme();
  }, []);

  // Determinar el tema efectivo
  const colorScheme = useMemo((): 'light' | 'dark' => {
    if (themePreference === 'auto') {
      return systemColorScheme ?? 'light';
    }
    return themePreference;
  }, [themePreference, systemColorScheme]);

  // Obtener colores según el tema
  const colors = useMemo((): ThemeColors => {
    return colorScheme === 'dark' ? DarkColors : LightColors;
  }, [colorScheme]);

  const isDark = colorScheme === 'dark';

  // Función para cambiar la preferencia
  const setThemePreference = async (theme: Theme) => {
    setThemePreferenceState(theme);
    await storageService.setTheme(theme);
  };

  const value = useMemo(
    () => ({
      colorScheme,
      themePreference,
      colors,
      isDark,
      setThemePreference,
    }),
    [colorScheme, themePreference, colors, isDark]
  );

  // No renderizar hasta que se cargue el tema
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acceder al tema actual y sus colores
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Hook simplificado que solo devuelve los colores actuales
 */
export function useColors(): ThemeColors {
  const { colors } = useTheme();
  return colors;
}
