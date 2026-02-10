#!/usr/bin/env python3
"""
Script para convertir íconos de iOS 18 (.icon folder de Icon Composer)
a PNG planos compatibles con expo-alternate-app-icons.

Uso:
    python3 scripts/flatten-icon.py <carpeta.icon> <output.png>

Ejemplo:
    python3 scripts/flatten-icon.py assets/icons/mimo-icon-variant-1.icon assets/icons/MimoVariant1Flat.png
"""

import json
import os
import sys
from PIL import Image


def parse_color(color_string):
    """Convierte color de formato icon.json a RGB tuple."""
    # Formato: "srgb:1.00000,0.60392,0.33725,1.00000" o "display-p3:..."
    parts = color_string.split(":")
    if len(parts) != 2:
        return (255, 255, 255)  # Default blanco

    values = parts[1].split(",")
    if len(values) < 3:
        return (255, 255, 255)

    r = int(float(values[0]) * 255)
    g = int(float(values[1]) * 255)
    b = int(float(values[2]) * 255)

    return (r, g, b)


def flatten_icon(icon_folder, output_path):
    """Aplana un .icon folder a un PNG de 1024x1024."""

    # Leer icon.json
    icon_json_path = os.path.join(icon_folder, "icon.json")
    if not os.path.exists(icon_json_path):
        print(f"❌ Error: No se encontró {icon_json_path}")
        sys.exit(1)

    with open(icon_json_path, "r") as f:
        config = json.load(f)

    # Obtener color de fondo
    fill_color = (255, 255, 255)  # Default blanco
    if "fill" in config and "solid" in config["fill"]:
        fill_color = parse_color(config["fill"]["solid"])

    print(f"📦 Color de fondo: RGB{fill_color}")

    # Crear imagen de fondo
    background = Image.new("RGBA", (1024, 1024), (*fill_color, 255))

    # Procesar cada grupo y capa
    assets_folder = os.path.join(icon_folder, "Assets")

    if "groups" in config:
        for group in config["groups"]:
            if "layers" not in group:
                continue

            for layer in group["layers"]:
                image_name = layer.get("image-name")
                if not image_name:
                    continue

                image_path = os.path.join(assets_folder, image_name)
                if not os.path.exists(image_path):
                    print(f"⚠️  Imagen no encontrada: {image_path}")
                    continue

                print(f"🖼️  Procesando capa: {image_name}")

                # Cargar imagen
                layer_img = Image.open(image_path).convert("RGBA")
                layer_width, layer_height = layer_img.size

                # Obtener posición (si existe)
                position = layer.get("position", {})
                scale = position.get("scale", 1)
                translation = position.get("translation-in-points", [0, 0])

                # Escalar si es necesario
                if scale != 1:
                    new_width = int(layer_width * scale)
                    new_height = int(layer_height * scale)
                    layer_img = layer_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    layer_width, layer_height = layer_img.size

                # Calcular posición (centro + translation)
                x = int(512 - layer_width / 2 + translation[0])
                y = int(512 - layer_height / 2 + translation[1])

                print(f"   Posición: ({x}, {y}), Escala: {scale}")

                # Pegar capa sobre el fondo
                background.paste(layer_img, (x, y), layer_img)

    # Convertir a RGB (sin alpha) para iOS
    final = background.convert("RGB")
    final.save(output_path, "PNG")

    print(f"✅ Ícono creado: {output_path}")
    print(f"   Tamaño: 1024x1024, sin alpha")


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    icon_folder = sys.argv[1]
    output_path = sys.argv[2]

    if not os.path.isdir(icon_folder):
        print(f"❌ Error: {icon_folder} no es una carpeta válida")
        sys.exit(1)

    flatten_icon(icon_folder, output_path)


if __name__ == "__main__":
    main()
