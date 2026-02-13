/** @type {import('@bacons/apple-targets').Config} */
module.exports = (config) => ({
  type: "widget",
  name: "TitoWidget",
  displayName: "Tito",
  deploymentTarget: "17.0",

  // Colores para el widget
  colors: {
    // Color de acento del widget
    $accent: "#8B6F4E",
    // Color de fondo del widget
    $widgetBackground: {
      light: "#FFFFFF",
      dark: "#1A1A1A",
    },
    // Colores personalizados
    WidgetBackgroundLight: "#F5F0E8",
    WidgetBackgroundDark: "#2D2D2D",
    TextPrimary: {
      light: "#1A1A1A",
      dark: "#FFFFFF",
    },
    TextSecondary: {
      light: "#6B7280",
      dark: "#9CA3AF",
    },
    AccentColor: "#8B6F4E",
  },

  // Entitlements - usar el mismo App Group que la app principal
  entitlements: {
    "com.apple.security.application-groups":
      config.ios?.entitlements?.["com.apple.security.application-groups"] ||
      ["group.com.startnode.tito"],
  },
});
