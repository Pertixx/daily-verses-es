// ============================================================================
// Root Layout - Layout principal de la aplicación
// ============================================================================

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold
} from '@expo-google-fonts/nunito';
import * as Linking from 'expo-linking';
import { storageService, revenueCatService, widgetService, deepLinkService, updatesService } from '@/services';
import { ThemeProvider } from '@/hooks';

// Mantener la splash screen visible mientras cargamos
SplashScreen.preventAutoHideAsync();

// Capturar URL inicial inmediatamente (antes de que React se monte)
let initialUrl: string | null = null;
Linking.getInitialURL().then((url) => {
  initialUrl = url;
  if (url) console.log('📱 URL inicial capturada:', url);
});

export default function RootLayout() {
  const [appState, setAppState] = useState<{
    isReady: boolean;
    onboardingCompleted: boolean | null; // null = aún no sabemos
    initialNavigationDone: boolean; // Para evitar re-navegación
  }>({
    isReady: false,
    onboardingCompleted: null,
    initialNavigationDone: false,
  });
  
  const router = useRouter();
  const segments = useSegments();

  // Cargar fuentes
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold
  });

  // Inicializar deep link service después de que la app esté lista
  useEffect(() => {
    if (appState.isReady && appState.onboardingCompleted !== null) {
      deepLinkService.initialize(initialUrl);
      return () => deepLinkService.cleanup();
    }
  }, [appState.isReady, appState.onboardingCompleted]);

  // Verificar actualizaciones OTA al iniciar (solo si completó onboarding)
  useEffect(() => {
    if (appState.isReady && appState.onboardingCompleted) {
      // Verificar actualizaciones de forma silenciosa en background
      updatesService.checkForUpdates(false);
    }
  }, [appState.isReady, appState.onboardingCompleted]);

  // Inicializar app - solo lee de AsyncStorage
  useEffect(() => {
    async function init() {
      try {
        console.log('🚀 Iniciando aplicación...');

        // Configurar RevenueCat (no bloquea si falla)
        await revenueCatService.configure().catch(err => {
          console.warn('⚠️ RevenueCat no se pudo configurar:', err);
        });

        // Obtener userId (genera uno si no existe)
        const userId = await revenueCatService.getOrCreateUserId();

        // Leer datos del usuario
        let userData = await storageService.getUserData();
        
        // Si no hay datos, inicializar (usuario nuevo)
        if (!userData) {
          console.log('👤 Usuario nuevo, inicializando datos...');
          userData = await storageService.initializeUserData(userId);
        }

        const completed = userData.onboardingCompleted;
        console.log('✅ Estado de onboarding:', completed ? 'Completado' : 'Pendiente');

        // Sincronizar widget si ya completó onboarding
        if (completed) {
          widgetService.syncVersesToWidget().catch(() => {});
        }

        setAppState({ isReady: true, onboardingCompleted: completed, initialNavigationDone: false });
      } catch (error) {
        console.error('❌ Error en inicialización:', error);
        
        // Fallback: intentar solo leer estado de onboarding
        try {
          const completed = await storageService.isOnboardingCompleted();
          setAppState({ isReady: true, onboardingCompleted: completed, initialNavigationDone: false });
        } catch {
          // Último recurso: asumir que no completó (mostrará onboarding)
          setAppState({ isReady: true, onboardingCompleted: false, initialNavigationDone: false });
        }
      }
    }

    init();
  }, []);

  // Navegación basada en estado de onboarding (solo al inicio, UNA VEZ)
  useEffect(() => {
    // Esperar a que todo esté listo
    if (!appState.isReady || appState.onboardingCompleted === null) return;
    
    // Si ya hicimos la navegación inicial, no volver a ejecutar
    if (appState.initialNavigationDone) return;

    const inOnboarding = segments[0] === '(onboarding)';
    
    // Si no completó onboarding y no está en onboarding → ir a onboarding
    if (!appState.onboardingCompleted && !inOnboarding) {
      console.log('🔄 Redirigiendo a onboarding...');
      setAppState(prev => ({ ...prev, initialNavigationDone: true }));
      router.replace('/(onboarding)/welcome');
    }
    // Si completó onboarding pero está en onboarding → ir a home
    else if (appState.onboardingCompleted && inOnboarding) {
      console.log('🔄 Usuario ya completó onboarding, redirigiendo a home...');
      setAppState(prev => ({ ...prev, initialNavigationDone: true }));
      router.replace('/');
    }
    // Ya está donde debe estar
    else {
      setAppState(prev => ({ ...prev, initialNavigationDone: true }));
    }
  }, [appState.isReady, appState.onboardingCompleted, appState.initialNavigationDone, segments, router]);

  // Ocultar splash cuando todo esté listo
  const onLayoutRootView = useCallback(async () => {
    if (appState.isReady && fontsLoaded && appState.onboardingCompleted !== null) {
      await SplashScreen.hideAsync();
    }
  }, [appState.isReady, fontsLoaded, appState.onboardingCompleted]);

  // Esperar hasta que sepamos el estado
  if (!appState.isReady || !fontsLoaded || appState.onboardingCompleted === null) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
          <Stack.Screen name="theme-settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="notification-settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="favorites" options={{ presentation: 'modal' }} />
          <Stack.Screen name="name-settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
          <Stack.Screen name="theme-explore" options={{ presentation: 'modal' }} />
          <Stack.Screen name="categories" options={{ presentation: 'modal' }} />
          <Stack.Screen name="create-mix" options={{ presentation: 'modal' }} />
          <Stack.Screen name="custom-phrases" options={{ presentation: 'modal' }} />
          <Stack.Screen name="share" options={{ presentation: 'modal' }} />
        </Stack>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

