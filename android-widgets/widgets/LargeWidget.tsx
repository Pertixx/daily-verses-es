// ============================================================================
// Large Widget (4x4) - Widget grande de versículos con logo
// ============================================================================

'use no memo';
import React from 'react';
import { FlexWidget, TextWidget, ImageWidget } from 'react-native-android-widget';
import { WIDGET_THEME, WIDGET_FONT } from '../utils/theme';

interface LargeWidgetProps {
  affirmation?: {
    id: string;
    text: string;
  };
}

/**
 * Widget grande (4x4) - Versículo centrado grande + logo Tito grande abajo a la izquierda
 * Diseño idéntico a iOS Large Widget
 *
 * IMPORTANTE: Los widgets NO pueden ser async ni usar hooks
 */
export function LargeWidget(props: LargeWidgetProps) {
  // Versículo por defecto si no hay datos
  const defaultAffirmation = {
    id: 'default3',
    text: 'Todo lo puedo en Cristo que me fortalece — Filipenses 4:13',
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
        padding: 24,
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
          paddingBottom: 60,
        }}
      >
        <TextWidget
          text={affirmation.text}
          style={{
            fontSize: WIDGET_FONT.sizes.large,
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
          image="tito_logo"
          style={{
            width: 64,
            height: 64,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
