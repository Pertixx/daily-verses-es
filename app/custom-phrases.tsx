// ============================================================================
// Custom Phrases Screen - Mis propias frases
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeOut } from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useColors } from '@/hooks';
import { storageService, revenueCatService, analytics } from '@/services';

// ============================================================================
// Types
// ============================================================================

interface CustomPhrase {
  id: string;
  text: string;
  createdAt: number;
}

// ============================================================================
// PhraseCard Component
// ============================================================================

interface PhraseCardProps {
  phrase: CustomPhrase;
  onDelete: () => void;
  index: number;
}

function PhraseCard({ phrase, onDelete, index }: PhraseCardProps) {
  const colors = useColors();

  const handleDelete = () => {
    Alert.alert(
      'Eliminar frase',
      '¿Estás seguro de que querés eliminar esta frase?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <Animated.View 
      entering={FadeInRight.delay(50 + index * 30).duration(300)}
      exiting={FadeOut.duration(200)}
    >
      <View style={[styles.phraseCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
        <Text style={[styles.phraseText, { color: colors.text }]}>&ldquo;{phrase.text}&rdquo;</Text>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <FontAwesome name="trash-o" size={16} color={colors.textTertiary} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function CustomPhrasesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [phrases, setPhrases] = useState<CustomPhrase[]>([]);
  const [newPhrase, setNewPhrase] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedPhrases, hasSubscription] = await Promise.all([
        storageService.getCustomPhrases(),
        revenueCatService.hasActiveSubscription(),
      ]);

      setPhrases(savedPhrases || []);
      setIsPremium(hasSubscription);
    } catch (error) {
      console.error('Error loading custom phrases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleAddPhrase = async () => {
    const trimmedPhrase = newPhrase.trim();
    
    if (!trimmedPhrase) {
      Alert.alert('Frase vacía', 'Por favor escribe una frase para agregar.');
      return;
    }

    if (trimmedPhrase.length < 10) {
      Alert.alert('Frase muy corta', 'Tu frase debe tener al menos 10 caracteres.');
      return;
    }

    // Si no es premium y ya tiene 3 frases
    if (!isPremium && phrases.length >= 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Límite alcanzado',
        'Con la versión gratuita podés tener hasta 3 frases personalizadas. ¡Actualizá a Premium para frases ilimitadas!',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver Premium', onPress: () => {
            analytics.track('paywall_viewed', { source: 'custom_phrases_limit' });
            router.push('/paywall');
          } },
        ]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newPhraseObj: CustomPhrase = {
      id: Date.now().toString(),
      text: trimmedPhrase,
      createdAt: Date.now(),
    };

    const updatedPhrases = [...phrases, newPhraseObj];
    setPhrases(updatedPhrases);
    setNewPhrase('');
    await storageService.setCustomPhrases(updatedPhrases);
    
    // Track phrase creation
    analytics.track('custom_phrase_created', {
      phrase_id: newPhraseObj.id,
      phrase_length: trimmedPhrase.length,
      total_phrases: updatedPhrases.length,
    });
  };

  const handleDeletePhrase = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedPhrases = phrases.filter(p => p.id !== id);
    setPhrases(updatedPhrases);
    await storageService.setCustomPhrases(updatedPhrases);
    
    // Track phrase deletion
    analytics.track('custom_phrase_deleted', {
      phrase_id: id,
      remaining_phrases: updatedPhrases.length,
    });
  };

  const handleInputFocus = () => {
    // Scroll al final cuando el input recibe foco
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

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
        <View style={styles.headerSpacer} />
      </Animated.View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: Spacing.l }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Mis propias frases</Text>
          </View>

        {/* Empty State */}
        {phrases.length === 0 && !isLoading && (
          <Animated.View 
            entering={FadeIn.delay(200).duration(300)}
            style={styles.emptyState}
          >
            <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}20` }]}>
              <FontAwesome name="pencil" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Crea tu primera frase
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Escribe versículos personalizados que te inspiren cada día
            </Text>
          </Animated.View>
        )}

        {/* Phrases List */}
        {phrases.map((phrase, index) => (
          <PhraseCard
            key={phrase.id}
            phrase={phrase}
            onDelete={() => handleDeletePhrase(phrase.id)}
            index={index}
          />
        ))}

        {/* Limit Info for Free Users */}
        {!isPremium && phrases.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <Text style={[styles.limitText, { color: colors.textSecondary }]}>
              {phrases.length}/3 frases{' '}
              {phrases.length >= 3 && (
                <Text style={{ color: colors.primary }}>• Actualiza a Premium para más</Text>
              )}
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* Input Area */}
      <Animated.View 
        entering={FadeIn.delay(200).duration(300)}
        style={[
          styles.inputContainer, 
          { 
            backgroundColor: colors.background,
            paddingBottom: insets.bottom + Spacing.m,
            borderTopColor: colors.border,
          }
        ]}
      >
        <View style={[styles.inputWrapper, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Escribe tu afirmación..."
            placeholderTextColor={colors.textTertiary}
            value={newPhrase}
            onChangeText={setNewPhrase}
            onFocus={handleInputFocus}
            multiline
            maxLength={200}
          />
          <Pressable 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddPhrase}
          >
            <FontAwesome name="plus" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
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
  headerCenter: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.fontSize.h2,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
  },
  headerSpacer: {
    width: 36,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.l,
    marginBottom: Spacing.l,
    padding: Spacing.m,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.l,
    gap: Spacing.s,
  },
  phraseCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.m,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.m,
  },
  phraseText: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.l,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.h3,
    fontWeight: Typography.fontWeight.bold,
    fontFamily: Typography.fontFamily.heading,
    marginBottom: Spacing.s,
  },
  emptyDescription: {
    fontSize: Typography.fontSize.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  limitText: {
    fontSize: Typography.fontSize.caption,
    textAlign: 'center',
    marginTop: Spacing.m,
  },
  inputContainer: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.m,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.s,
    gap: Spacing.s,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.body,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: Spacing.s,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
