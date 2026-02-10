// ============================================================================
// Category Service - Asignación de categorías de versículos
// ============================================================================

import type { UserProfile, VerseCategory } from '@/types';
import { VERSE_CATEGORIES } from '@/types';

// Categorías gratuitas (no premium)
const FREE_CATEGORIES: VerseCategory[] = VERSE_CATEGORIES
  .filter(cat => !cat.isPremium)
  .map(cat => cat.id);

// Categorías por defecto asignadas a todos los usuarios nuevos
const DEFAULT_CATEGORIES: VerseCategory[] = [
  'faith',
  'strength',
  'love',
  'hope',
  'peace',
  'gratitude',
];

/**
 * Calcula las categorías de versículos para el usuario.
 * En la versión simplificada, todos los usuarios reciben las 6 categorías gratuitas por defecto.
 * 
 * @param profile - Perfil del usuario
 * @returns Array de categorías asignadas
 */
export function calculateAssignedCategories(profile: UserProfile): VerseCategory[] {
  // Si el usuario ya tiene categorías asignadas, respetarlas
  if (profile.assignedCategories && profile.assignedCategories.length > 0) {
    return profile.assignedCategories;
  }

  // Por defecto, asignar las 6 categorías gratuitas
  return [...DEFAULT_CATEGORIES];
}

/**
 * Obtiene las categorías gratuitas disponibles
 */
export function getFreeCategories(): VerseCategory[] {
  return [...FREE_CATEGORIES];
}

/**
 * Obtiene todas las categorías disponibles (gratuitas + premium)
 */
export function getAllCategories(): VerseCategory[] {
  return VERSE_CATEGORIES.map(cat => cat.id);
}

/**
 * Verifica si una categoría es premium
 */
export function isCategoryPremium(category: VerseCategory): boolean {
  const config = VERSE_CATEGORIES.find(cat => cat.id === category);
  return config?.isPremium ?? false;
}
