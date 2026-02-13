// ============================================================================
// Audio Service - Reproducción de audio con expo-audio
// ============================================================================

import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useCallback, useEffect, useState, useRef } from 'react';

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface UseAudioPlayerResult {
  /** Estado actual del reproductor */
  state: AudioState;
  /** Reproducir/pausar audio - si se pasa URL, carga y reproduce */
  togglePlay: (url?: string) => void;
  /** Detener y resetear */
  stop: () => void;
  /** Cargar una nueva URL */
  load: (url: string) => void;
  /** Progreso actual (0-1) */
  progress: number;
  /** Duración total en segundos */
  duration: number;
  /** Tiempo actual en segundos */
  currentTime: number;
  /** Si está reproduciendo */
  isPlaying: boolean;
  /** URL actual del audio */
  currentAudioUrl: string | null;
}

// Configurar el modo de audio al importar el módulo
let audioModeConfigured = false;
async function ensureAudioModeConfigured() {
  if (audioModeConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    });
    audioModeConfigured = true;
    console.log('✅ Audio mode configurado correctamente');
  } catch (error) {
    console.error('❌ Error configurando audio mode:', error);
  }
}

/**
 * Hook para reproducir audio desde una URL
 */
export function useAffirmationAudio(): UseAudioPlayerResult {
  const [state, setState] = useState<AudioState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  
  // Crear el player sin fuente inicial
  const player = useAudioPlayer(audioUrl ?? undefined);
  const status = useAudioPlayerStatus(player);

  // Configurar audio mode al montar
  useEffect(() => {
    ensureAudioModeConfigured();
  }, []);

  // Actualizar estado basado en el status
  useEffect(() => {
    if (!player) return;
    
    if (status.isBuffering) {
      setState('loading');
    } else if (status.playing) {
      setState('playing');
    } else if (status.currentTime > 0 && !status.playing) {
      setState('paused');
    } else if (status.isLoaded && !status.playing) {
      setState('idle');
    }
  }, [player, status]);

  // Auto-play cuando el player esté listo con nueva URL
  useEffect(() => {
    if (player && status.isLoaded && currentUrlRef.current === audioUrl && state === 'loading') {
      console.log('🎵 Audio cargado, iniciando reproducción...');
      player.play();
    }
  }, [player, status.isLoaded, audioUrl, state]);

  // Cargar nueva URL
  const load = useCallback((url: string) => {
    console.log('🎵 Cargando audio:', url);
    currentUrlRef.current = url;
    setAudioUrl(url);
    setState('loading');
  }, []);

  // Toggle play/pause - acepta URL opcional
  const togglePlay = useCallback((url?: string) => {
    console.log('🎵 togglePlay llamado con URL:', url?.substring(0, 50));
    
    // Si se pasa una URL diferente, cargar y reproducir
    if (url && url !== audioUrl) {
      console.log('🎵 Nueva URL, cargando...');
      currentUrlRef.current = url;
      setAudioUrl(url);
      setState('loading');
      return;
    }

    // Toggle el estado actual
    if (player) {
      try {
        if (status.playing) {
          console.log('🎵 Pausando audio');
          player.pause();
          setState('paused');
        } else {
          // Si el audio terminó, reiniciar desde el principio
          if (status.duration > 0 && status.currentTime >= status.duration - 0.1) {
            console.log('🎵 Audio terminado, reiniciando...');
            player.seekTo(0);
          }
          console.log('🎵 Reproduciendo audio');
          player.play();
          setState('playing');
        }
      } catch (error) {
        console.error('❌ Error toggling audio:', error);
        setState('error');
      }
    }
  }, [player, audioUrl, status]);

  // Detener
  const stop = useCallback(() => {
    if (!player) return;

    try {
      player.pause();
      player.seekTo(0);
      setState('idle');
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  }, [player]);

  return {
    state,
    togglePlay,
    stop,
    load,
    progress: status.duration > 0 ? status.currentTime / status.duration : 0,
    duration: status.duration,
    currentTime: status.currentTime,
    isPlaying: status.playing,
    currentAudioUrl: audioUrl,
  };
}

// Exportar también el singleton del servicio
export const audioService = {
  useAffirmationAudio,
};
