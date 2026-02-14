// ============================================================================
// Medium Widget (4x2) - Widget mediano de versículos con logo
// ============================================================================

'use no memo';
import React from 'react';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';
import { WIDGET_THEME, WIDGET_FONT } from '../utils/theme';

interface MediumWidgetProps {
  affirmation?: {
    id: string;
    text: string;
  };
}

/**
 * Widget mediano (4x2) - Versículo centrado + logo Tito abajo a la izquierda
 * Diseño idéntico a iOS Medium Widget
 *
 * IMPORTANTE: Los widgets NO pueden ser async ni usar hooks
 */
export function MediumWidget(props: MediumWidgetProps) {
  // Versículo por defecto si no hay datos
  const defaultAffirmation = {
    id: 'default2',
    text: 'El Señor es mi pastor, nada me falta — Salmos 23:1',
  };

  const affirmation = props.affirmation || defaultAffirmation;

  // Colores según tema (light mode por defecto, dark mode se detecta automáticamente)
  const backgroundColor = WIDGET_THEME.light.background;
  const textColor = WIDGET_THEME.light.text;

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        backgroundColor: backgroundColor,
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
        flexDirection: 'column',
      }}
      clickAction="OPEN_APP"
      clickActionData={{ affirmationId: affirmation.id }}
    >
      {/* Texto centrado */}
      <FlexWidget
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 40,
        }}
      >
        <TextWidget
          text={affirmation.text}
          style={{
            fontSize: WIDGET_FONT.sizes.medium,
            color: textColor,
            fontFamily: WIDGET_FONT.family,
            textAlign: 'center',
          }}
        />
      </FlexWidget>

      {/* Logo Tito abajo a la izquierda (igual que iOS) */}
      <FlexWidget
        style={{
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <ImageWidget
          image={require('../../assets/icons/Tito.png')}
          imageWidth={50}
          imageHeight={50}
          style={{
            width: 50,
            height: 50,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
