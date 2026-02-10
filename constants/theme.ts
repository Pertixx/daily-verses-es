// ============================================================================
// Theme Constants - Colores y estilos de Versículo Design System
// ============================================================================

// Colores base que no cambian con el tema
export const BaseColors = {
  // Colores de marca
  primary: '#5B7FCC', // Azul sereno — fe, confianza, cielo
  secondary: '#C9A96E', // Dorado cálido — divinidad, sabiduría
  tertiary: '#F5F0E8', // Pergamino claro — tradición, pureza
  accent: '#4A6BB5', // Azul profundo — hover/active

  // Estados
  success: '#059669',
  successLight: '#D1FAE5',
  successDark: '#1A4D3A',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  infoDark: '#1E3A5F',
} as const;

// Colores para Light Mode
export const LightColors = {
  ...BaseColors,
  // Neutrales
  text: '#2D3748', // Texto principal
  textSecondary: '#718096', // Texto secundario
  textTertiary: '#A0AEC0',
  textMuted: '#A0AEC0',
  background: '#FAF8F5', // Fondo pergamino suave
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSecondary: '#F7F4EF', // Superficie cálida
  surfaceElevated: '#F7F4EF',
  border: '#E2DDD5', // Borde cálido
  borderLight: '#F0ECE4',
  
  // Específicos de UI
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  buttonPrimaryBg: '#5B7FCC',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#E8E0D0',
  buttonSecondaryText: '#5B7FCC',
  selectedCardBg: '#EDE8DC',
  
  // Badges
  badgePrimaryBg: '#DDD5C3',
  badgePrimaryText: '#5B7FCC',
  badgeSuccessBg: '#D1FAE5',
  badgeSuccessText: '#059669',
  badgeInfoBg: '#DBEAFE',
  badgeInfoText: '#2563EB',
  
  // Overlays
  overlayLight: 'rgba(255, 255, 255, 0.6)',
  overlayDark: 'rgba(0, 0, 0, 0.05)',
} as const;

// Colores para Dark Mode
export const DarkColors = {
  ...BaseColors,
  // Neutrales
  text: '#F7F4EF', // Texto claro cálido
  textSecondary: '#D4CFC5', // Texto secundario
  textTertiary: '#A09A8E', // Texto terciario
  textMuted: '#A09A8E',
  background: '#1A1915', // Fondo oscuro cálido
  backgroundSecondary: '#2A2820', // Sección oscura
  surface: '#2A2820',
  surfaceSecondary: '#3D3A30',
  surfaceElevated: '#3D3A30',
  border: '#3D3A30', // Borde oscuro cálido
  borderLight: '#2A2820',
  
  // Específicos de UI
  cardBackground: '#2A2820',
  inputBackground: '#2A2820',
  buttonPrimaryBg: '#5B7FCC',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#3D3A30',
  buttonSecondaryText: '#C9A96E',
  selectedCardBg: '#3D3528',
  
  // Badges
  badgePrimaryBg: '#3D3528',
  badgePrimaryText: '#C9A96E',
  badgeSuccessBg: '#1A4D3A',
  badgeSuccessText: '#6EE7B7',
  badgeInfoBg: '#1E3A5F',
  badgeInfoText: '#93C5FD',
  
  // Overlays
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  overlayDark: 'rgba(0, 0, 0, 0.3)',
} as const;

// Colores legacy (para compatibilidad, usa LightColors por defecto)
export const Colors = {
  // Colores Principales
  primary: '#5B7FCC',
  secondary: '#C9A96E',
  tertiary: '#F5F0E8',
  accent: '#4A6BB5',

  // Colores Neutrales
  black: '#2D3748',
  grayDark: '#718096',
  grayMedium: '#A0AEC0',
  grayLight: '#E2DDD5',
  background: '#FAF8F5',
  white: '#FFFFFF',

  // Estados
  success: '#059669',
  info: '#2563EB',
} as const;

// Tipo flexible para colores de tema
export interface ThemeColors {
  // Base colors
  primary: string;
  secondary: string;
  tertiary: string;
  accent: string;
  // Estados
  success: string;
  successLight: string;
  successDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  // Neutrales
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  border: string;
  borderLight: string;
  // UI específicos
  cardBackground: string;
  inputBackground: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  selectedCardBg: string;
  // Badges
  badgePrimaryBg: string;
  badgePrimaryText: string;
  badgeSuccessBg: string;
  badgeSuccessText: string;
  badgeInfoBg: string;
  badgeInfoText: string;
  // Overlays
  overlayLight: string;
  overlayDark: string;
}

export const Spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const Typography = {
  fontFamily: {
    heading: 'Nunito',
    body: 'Nunito',
  },
  fontSize: {
    h1: 32,
    h2: 24,
    h3: 20,
    body: 16,
    caption: 14,
    button: 16,
    badge: 14,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  lineHeight: {
    heading: 1.2,
    body: 1.6,
    caption: 1.4,
  },
} as const;
