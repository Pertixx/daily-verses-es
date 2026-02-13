// ============================================================================
// Widget Task Handler - Maneja actualizaciones automáticas de widgets Android
// (Versículos bíblicos diarios)
// ============================================================================

/** @jsxImportSource react */
import * as React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SmallWidget } from './widgets/SmallWidget';
import { MediumWidget } from './widgets/MediumWidget';
import { LargeWidget } from './widgets/LargeWidget';

// Keys para AsyncStorage (idénticos a los del servicio)
const WIDGET_KEYS = {
  AFFIRMATIONS: '@tito_widget_verses',
  LAST_UPDATED: '@tito_widget_last_updated',
} as const;

interface WidgetAffirmation {
  id: string;
  text: string;
}

/**
 * Mapeo de nombres de widgets a componentes
 */
const nameToWidget = {
  TitoSmallWidget: SmallWidget,
  TitoMediumWidget: MediumWidget,
  TitoLargeWidget: LargeWidget,
};

/**
 * Obtiene un versículo aleatorio de AsyncStorage
 */
async function getRandomAffirmation(): Promise<WidgetAffirmation> {
  try {
    const affirmationsJson = await AsyncStorage.getItem(WIDGET_KEYS.AFFIRMATIONS);

    if (affirmationsJson) {
      const affirmations: WidgetAffirmation[] = JSON.parse(affirmationsJson);
      if (affirmations.length > 0) {
        const randomIndex = Math.floor(Math.random() * affirmations.length);
        return affirmations[randomIndex];
      }
    }
  } catch (error) {
    console.error('WidgetTaskHandler: Error obteniendo versículo:', error);
  }

  // Versículo por defecto
  return {
    id: 'default',
    text: 'Todo lo puedo en Cristo que me fortalece — Filipenses 4:13',
  };
}

/**
 * Widget Task Handler - Maneja todas las acciones de widgets
 *
 * Se invoca cuando:
 * - Se agrega un widget (WIDGET_ADDED)
 * - Se actualiza automáticamente cada 4 horas (WIDGET_UPDATE)
 * - Se redimensiona un widget (WIDGET_RESIZED)
 * - Se elimina un widget (WIDGET_DELETED)
 * - El usuario hace clic en un widget (WIDGET_CLICK)
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget = nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];

  if (!Widget) {
    console.error('WidgetTaskHandler: Widget no encontrado:', widgetInfo.widgetName);
    return;
  }

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
      console.log('📱 Android Widget: Widget agregado', widgetInfo.widgetName);
      // Cargar un versículo aleatorio cuando se agrega el widget
      const initialAffirmation = await getRandomAffirmation();
      props.renderWidget(<Widget affirmation={initialAffirmation} />);
      break;

    case 'WIDGET_UPDATE':
      console.log('📱 Android Widget: Actualizando widget', widgetInfo.widgetName);
      // Actualizar con un nuevo versículo aleatorio
      const updatedAffirmation = await getRandomAffirmation();
      props.renderWidget(<Widget affirmation={updatedAffirmation} />);
      break;

    case 'WIDGET_RESIZED':
      console.log('📱 Android Widget: Widget redimensionado', widgetInfo.widgetName);
      // Renderizar con el nuevo tamaño
      const resizedAffirmation = await getRandomAffirmation();
      props.renderWidget(<Widget affirmation={resizedAffirmation} />);
      break;

    case 'WIDGET_DELETED':
      console.log('📱 Android Widget: Widget eliminado', widgetInfo.widgetName);
      // Podríamos limpiar datos aquí si fuera necesario
      break;

    case 'WIDGET_CLICK':
      console.log('📱 Android Widget: Click en widget', props.clickAction);
      // El deep link se maneja automáticamente por clickAction="OPEN_APP"
      break;

    default:
      break;
  }
}
