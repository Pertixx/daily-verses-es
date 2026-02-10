// ============================================================================
// Create Mix Screen - Crear mezcla personalizada
// ============================================================================

import { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors } from '@/hooks';
import { storageService, analytics } from '@/services';
import { 
  VERSE_CATEGORIES, 
  MIX_LIMITS,
  type VerseCategory,
  type UserCustomMix,
} from '@/types';

// ============================================================================
// Constants
// ============================================================================

const MIX_COLORS = [
  '#FF6B9D', // Rosa
  '#5B7FCC', // Azul sereno
  '#C9A96E', // Dorado
  '#8B5CF6', // Púrpura
  '#10B981', // Verde
  '#F59E0B', // Amarillo
  '#EF4444', // Rojo
  '#22C55E', // Verde claro
  '#6366F1', // Indigo
  '#EC4899', // Magenta
  '#14B8A6', // Teal
  '#3B82F6', // Azul
];

const MIX_ICONS = [
  'star',
  'heart',
  'diamond',
  'bolt',
  'sun-o',
  'moon-o',
  'leaf',
  'fire',
  'music',
  'magic',
  'rocket',
  'trophy',
];

// ============================================================================
// CategorySelector Component
// ============================================================================

interface CategorySelectorProps {
  category: typeof VERSE_CATEGORIES[0];
  isSelected: boolean;
  onToggle: () => void;
  index: number;
}

function CategorySelector({ category, isSelected, onToggle, index }: CategorySelectorProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 30).duration(300)}>
      <Pressable
        style={[
          styles.categoryItem,
          { 
            backgroundColor: isSelected ? colors.selectedCardBg : colors.cardBackground,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={onToggle}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
          <FontAwesome name={category.icon as any} size={20} color={category.color} />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
          <Text style={[styles.categoryDescription, { color: colors.textSecondary }]} numberOfLines={1}>
            {category.description}
          </Text>
        </View>
        {isSelected && (
          <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
            <FontAwesome name="check" size={12} color="#FFFFFF" />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ============================================================================
// ColorPicker Component
// ============================================================================

interface ColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

function ColorPicker({ selectedColor, onSelect }: ColorPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.colorPicker}>
      {MIX_COLORS.map((color) => (
        <Pressable
          key={color}
          style={[
            styles.colorOption,
            { backgroundColor: color },
            selectedColor === color && styles.colorOptionSelected,
            selectedColor === color && { borderColor: colors.text },
          ]}
          onPress={() => onSelect(color)}
        >
          {selectedColor === color && (
            <FontAwesome name="check" size={12} color="#FFFFFF" />
          )}
        </Pressable>
      ))}
    </View>
  );
}

// ============================================================================
// IconPicker Component
// ============================================================================

interface IconPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onSelect: (icon: string) => void;
}

function IconPicker({ selectedIcon, selectedColor, onSelect }: IconPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.iconPicker}>
      {MIX_ICONS.map((icon) => (
        <Pressable
          key={icon}
          style={[
            styles.iconOption,
            { backgroundColor: colors.surfaceSecondary },
            selectedIcon === icon && { backgroundColor: `${selectedColor}20`, borderColor: selectedColor, borderWidth: 2 },
          ]}
          onPress={() => onSelect(icon)}
        >
          <FontAwesome 
            name={icon as any} 
            size={20} 
            color={selectedIcon === icon ? selectedColor : colors.textSecondary} 
          />
        </Pressable>
      ))}
    </View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CreateMixScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Estado del formulario
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(MIX_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(MIX_ICONS[0]);
  const [selectedCategories, setSelectedCategories] = useState<VerseCategory[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Validación
  const isValid = useMemo(() => {
    return name.trim().length >= 2 && selectedCategories.length >= 1;
  }, [name, selectedCategories]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const toggleCategory = useCallback((categoryId: VerseCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!isValid) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);

    try {
      // Verificar límite de mixes
      const existingMixes = await storageService.getUserCustomMixes();
      if (existingMixes.length >= MIX_LIMITS.MAX_USER_CUSTOM_MIXES) {
        Alert.alert(
          'Límite alcanzado',
          `Solo podés crear hasta ${MIX_LIMITS.MAX_USER_CUSTOM_MIXES} mezclas personalizadas.`,
          [{ text: 'Entendido' }]
        );
        setIsSaving(false);
        return;
      }

      // Crear el nuevo mix
      const newMix: UserCustomMix = {
        id: `user-mix-${Date.now()}`,
        type: 'user_custom',
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        isPremium: true,
        categories: selectedCategories,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storageService.addUserCustomMix(newMix);

      // Track mix creation
      analytics.track('mix_created', {
        mix_id: newMix.id,
        mix_name: newMix.name,
        categories_count: selectedCategories.length,
        categories: selectedCategories.join(','),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error saving mix:', error);
      Alert.alert('Error', 'No se pudo guardar la mezcla. Intentá de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }, [isValid, name, selectedIcon, selectedColor, selectedCategories, router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top + Spacing.s }]}
      >
        <Pressable 
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]} 
          onPress={handleBack}
        >
          <FontAwesome name="times" size={18} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Crear mezcla</Text>
        <Pressable 
          style={[
            styles.saveButton, 
            { backgroundColor: isValid ? colors.primary : colors.surfaceSecondary }
          ]} 
          onPress={handleSave}
          disabled={!isValid || isSaving}
        >
          <FontAwesome name="check" size={18} color={isValid ? '#FFFFFF' : colors.textTertiary} />
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview del mix */}
        <Animated.View 
          entering={FadeInDown.delay(50).duration(300)}
          style={styles.previewSection}
        >
          <View style={[styles.previewCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}20` }]}>
              <FontAwesome name={selectedIcon as any} size={32} color={selectedColor} />
            </View>
            <Text style={[styles.previewName, { color: colors.text }]}>
              {name.trim() || 'Mi mezcla'}
            </Text>
            <Text style={[styles.previewCount, { color: colors.textSecondary }]}>
              {selectedCategories.length} {selectedCategories.length === 1 ? 'categoría' : 'categorías'}
            </Text>
          </View>
        </Animated.View>

        {/* Nombre */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nombre</Text>
          <TextInput
            style={[
              styles.nameInput,
              { 
                backgroundColor: colors.inputBackground,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Ej: Mi rutina matutina"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            maxLength={30}
          />
        </Animated.View>

        {/* Color */}
        <Animated.View entering={FadeInDown.delay(150).duration(300)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Color</Text>
          <ColorPicker selectedColor={selectedColor} onSelect={setSelectedColor} />
        </Animated.View>

        {/* Icono */}
        <Animated.View entering={FadeInDown.delay(200).duration(300)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Icono</Text>
          <IconPicker 
            selectedIcon={selectedIcon} 
            selectedColor={selectedColor}
            onSelect={setSelectedIcon} 
          />
        </Animated.View>

        {/* Categorías */}
        <Animated.View entering={FadeInDown.delay(250).duration(300)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Categorías ({selectedCategories.length})
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Seleccioná al menos una categoría para tu mezcla
          </Text>
        </Animated.View>

        <View style={styles.categoriesList}>
          {VERSE_CATEGORIES.map((category, index) => (
            <CategorySelector
              key={category.id}
              category={category}
              isSelected={selectedCategories.includes(category.id)}
              onToggle={() => toggleCategory(category.id)}
              index={index}
            />
          ))}
        </View>
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
    paddingBottom: Spacing.m,
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
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.l,
  },

  // Preview
  previewSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  previewCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    width: '60%',
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  previewName: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  previewCount: {
    fontSize: Typography.fontSize.caption,
  },

  // Section
  sectionTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.s,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.caption,
    marginBottom: Spacing.m,
  },

  // Name Input
  nameInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.m,
    fontSize: Typography.fontSize.body,
    marginBottom: Spacing.xl,
  },

  // Color Picker
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginBottom: Spacing.xl,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
  },

  // Icon Picker
  iconPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.s,
    marginBottom: Spacing.xl,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Categories List
  categoriesList: {
    gap: Spacing.s,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.m,
    borderRadius: BorderRadius.md,
    gap: Spacing.m,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  categoryDescription: {
    fontSize: Typography.fontSize.caption,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
