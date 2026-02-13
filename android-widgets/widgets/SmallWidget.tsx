// ============================================================================
// Small Widget (2x2) - Widget pequeño de versículos
// ============================================================================

'use no memo';
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WIDGET_THEME, WIDGET_FONT } from '../utils/theme';

interface SmallWidgetProps {
  affirmation?: {
    id: string;
    text: string;
  };
}

/**
 * Widget pequeño (2x2) - Versículo centrado
 * Diseño idéntico a iOS Small Widget
 *
 * IMPORTANTE: Los widgets NO pueden ser async ni usar hooks
 */
export function SmallWidget(props: SmallWidgetProps) {
  // Versículo por defecto si no hay datos
  const defaultAffirmation = {
    id: 'default1',
    text: 'Porque yo sé los planes que tengo para ustedes — Jeremías 29:11',
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
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
      clickActionData={{ affirmationId: affirmation.id }}
    >
      <TextWidget
        text={affirmation.text}
        style={{
          fontSize: WIDGET_FONT.sizes.small,
          color: textColor,
          fontFamily: WIDGET_FONT.family,
          textAlign: 'center',
          maxLines: 6,
        }}
      />
    </FlexWidget>
  );
}
