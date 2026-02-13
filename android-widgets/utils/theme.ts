// ============================================================================
// Tema de Widgets Android - Paridad con iOS
// ============================================================================

/**
 * Colores de widgets Android (idénticos a iOS)
 * Referencia: /targets/widget/expo-target.config.js
 */
export const WIDGET_THEME = {
  light: {
    background: '#F5F0E8', // Crema - igual que iOS
    text: '#1A1A1A',       // Negro - igual que iOS
  },
  dark: {
    background: '#2D2D2D', // Gris oscuro - igual que iOS
    text: '#FFFFFF',       // Blanco - igual que iOS
  },
  accent: '#8B6F4E',       // Naranja - igual que iOS
} as const;

/**
 * Configuración de fuente
 * Referencia: /targets/widget/widgets.swift
 */
export const WIDGET_FONT = {
  family: 'DMSans_600SemiBold',
  sizes: {
    small: 13,   // Igual que iOS (small widget)
    medium: 17,  // Igual que iOS (medium widget)
    large: 24,   // Igual que iOS (large widget)
  },
} as const;
