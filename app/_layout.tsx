// ============================================================================
// Root Layout - Layout principal de la aplicación
// ============================================================================

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, AppState as RNAppState } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold
} from '@expo-google-fonts/dm-sans';
import * as Linking from 'expo-linking';
import { storageService, revenueCatService, widgetService, deepLinkService, updatesService, affirmationSyncService, affirmationService } from '@/services';
import { ThemeProvider } from '@/hooks';

// Registrar Widget Task Handler para Android (DEBE ejecutarse antes de la app)
if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('../android-widgets/widgetTaskHandler');

    registerWidgetTaskHandler(widgetTaskHandler);
    console.log('📱 Android Widget Task Handler registrado');
  } catch (error) {
    console.error('📱 Error registrando Widget Task Handler:', error);
  }
}

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
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold
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

  // Sincronizar afirmaciones al retomar la app (solo si completó onboarding)
  useEffect(() => {
    if (!appState.isReady || !appState.onboardingCompleted) return;

    const subscription = RNAppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('📱 App volvió al foreground, verificando sincronización...');
        try {
          const didSync = await affirmationSyncService.syncIfNeeded();
          if (didSync) {
            console.log('✅ Afirmaciones sincronizadas en foreground');
            await affirmationService.reloadAffirmations();
            await widgetService.syncAffirmationsToWidget();
          }
        } catch (error) {
          console.error('⚠️ Error al sincronizar en foreground:', error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
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

        // Leer datos del usuario con método seguro que distingue "sin datos" de "error"
        const result = await storageService.getUserDataSafe();

        if (result.error) {
          // ⚠️ Storage falló temporalmente — NO reinicializar datos del usuario
          // Esto previene sobreescribir datos existentes cuando AsyncStorage falla en iOS
          console.warn('⚠️ Storage temporalmente no disponible, usando fallback...');
          const completed = await resolveOnboardingFallback();
          setAppState({ isReady: true, onboardingCompleted: completed, initialNavigationDone: false });
          return;
        }

        if (!result.data) {
          // No hay datos Y no hubo error → usuario genuinamente nuevo
          console.log('👤 Usuario nuevo, inicializando datos...');
          const userData = await storageService.initializeUserData(userId);
          setAppState({ isReady: true, onboardingCompleted: userData.onboardingCompleted, initialNavigationDone: false });
          return;
        }

        // Datos leídos correctamente
        const completed = result.data.onboardingCompleted;
        console.log('✅ Estado de onboarding:', completed ? 'Completado' : 'Pendiente');

        // Sincronizar widget si ya completó onboarding
        if (completed) {
          widgetService.syncAffirmationsToWidget().catch(() => {});

          // DEBUG: Mostrar estado del storage al iniciar
          if (__DEV__) {
            affirmationSyncService.debugStorageState().catch(() => {});
            // DEBUG: Descomentar para forzar un sync limpio (útil para testing)
            await affirmationSyncService.clearSyncTimestamp();
          }

          // Sincronizar afirmaciones desde backend (no bloqueante)
          affirmationSyncService.syncIfNeeded()
            .then(async (didSync) => {
              if (didSync) {
                console.log('✅ Afirmaciones sincronizadas desde backend');
                // Recargar afirmaciones en AffirmationService
                await affirmationService.reloadAffirmations();
                // Actualizar widgets con nuevo contenido
                await widgetService.syncAffirmationsToWidget();
              }
            })
            .catch((error) => {
              console.error('⚠️ Error al sincronizar afirmaciones:', error);
              // No bloquear la app si falla la sincronización
            });
        }

        setAppState({ isReady: true, onboardingCompleted: completed, initialNavigationDone: false });
      } catch (error) {
        console.error('❌ Error en inicialización:', error);
        
        // Fallback: usar cadena de respaldo sin sobreescribir datos
        try {
          const completed = await resolveOnboardingFallback();
          setAppState({ isReady: true, onboardingCompleted: completed, initialNavigationDone: false });
        } catch {
          // Último recurso: asumir onboarding completado.
          // Es preferible que un usuario nuevo vea la home (y pueda navegar)
          // a que un usuario existente pierda su progreso y sea forzado al onboarding.
          console.error('❌ Todos los intentos de lectura fallaron - asumiendo onboarding completado');
          setAppState({ isReady: true, onboardingCompleted: true, initialNavigationDone: false });
        }
      }
    }

    /**
     * Cadena de fallback para resolver el estado de onboarding sin sobreescribir datos.
     * 1. Primero intenta el flag redundante de backup (key separada, más resistente)
     * 2. Luego intenta leer del blob principal de USER_DATA
     * 3. Si todo falla, asume false (usuario genuinamente nuevo)
     */
    async function resolveOnboardingFallback(): Promise<boolean> {
      // Intento 1: Flag de backup redundante (key separada, más resistente a corrupción)
      const backupCompleted = await storageService.isOnboardingCompletedBackup();
      if (backupCompleted) {
        console.log('✅ Flag de backup confirma onboarding completado');
        return true;
      }

      // Intento 2: Leer del blob principal (puede funcionar en un segundo intento)
      const completed = await storageService.isOnboardingCompleted();
      if (completed) {
        console.log('✅ Lectura secundaria confirma onboarding completado');
        return true;
      }

      console.warn('⚠️ No se pudo confirmar estado de onboarding por ningún medio');
      return false;
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

