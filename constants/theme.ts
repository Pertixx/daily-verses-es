// ============================================================================
// Theme Constants - Colores y estilos basados en Tito Design System
// ============================================================================

// Colores base que no cambian con el tema
export const BaseColors = {
  // Colores de marca
  primary: '#8B6F4E', // Marrón cálido
  secondary: '#D4B896', // Arena
  tertiary: '#F5F0E8', // Pergamino claro
  accent: '#C9A96E', // Dorado suave

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
  text: '#1F2937', // Dark Gray
  textSecondary: '#6B7280', // Medium Gray
  textTertiary: '#9CA3AF',
  textMuted: '#9CA3AF',
  background: '#F5F0E8', // Pergamino claro
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF', // White
  surfaceSecondary: '#FAF7F2', // Pergamino muy claro
  surfaceElevated: '#FAF7F2',
  border: '#E5E0D8', // Border cálido
  borderLight: '#F0EBE3',

  // Específicos de UI
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  buttonPrimaryBg: '#8B6F4E',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondaryBg: '#D4B896',
  buttonSecondaryText: '#8B6F4E',
  selectedCardBg: '#F5F0E8',

  // Badges
  badgePrimaryBg: '#E8DFD0',
  badgePrimaryText: '#8B6F4E',
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
  primary: '#C9A96E', // Dorado en dark mode
  // Neutrales
  text: '#F9FAFB', // Light Text
  textSecondary: '#E5E7EB', // Medium Text
  textTertiary: '#9CA3AF', // Secondary Text
  textMuted: '#9CA3AF',
  background: '#1A1612', // Marrón oscuro
  backgroundSecondary: '#2D2822', // Marrón medio oscuro
  surface: '#2D2822',
  surfaceSecondary: '#3D3630',
  surfaceElevated: '#3D3630',
  border: '#4A4035', // Dark Border cálido
  borderLight: '#2D2822',

  // Específicos de UI
  cardBackground: '#2D2822',
  inputBackground: '#2D2822',
  buttonPrimaryBg: '#C9A96E',
  buttonPrimaryText: '#1A1612',
  buttonSecondaryBg: '#4A3F35',
  buttonSecondaryText: '#D4B896',
  selectedCardBg: '#3D3630',

  // Badges
  badgePrimaryBg: '#3D3630',
  badgePrimaryText: '#D4B896',
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
  primary: '#8B6F4E',
  secondary: '#D4B896',
  tertiary: '#F5F0E8',
  accent: '#C9A96E',

  // Colores Neutrales
  black: '#1F2937',
  grayDark: '#6B7280',
  grayMedium: '#9CA3AF',
  grayLight: '#E5E7EB',
  background: '#F5F0E8',
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
    heading: 'DMSans',
    body: 'DMSans',
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
