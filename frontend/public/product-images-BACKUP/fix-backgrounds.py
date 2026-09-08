"""
Script pour remplacer le fond transparent des images PNG par un fond blanc.

Utilisation :
1. Place ce script dans le dossier contenant tes images
   (ex: frontend/public/product-images/)
2. Lance : python fix-backgrounds.py
3. Le script crée un sous-dossier "corrige/" avec les versions corrigées
   (les fichiers originaux ne sont PAS écrasés, par sécurité)
4. Vérifie le résultat, puis copie les fichiers de "corrige/" par-dessus
   les originaux si tout te convient.

Options en bas du fichier : tu peux changer la couleur de fond
(par défaut blanc) et le dossier cible.
"""

import os
from pathlib import Path
from PIL import Image

# ============ CONFIGURATION ============
SOURCE_DIR = "."              # dossier contenant les .png à corriger
OUTPUT_DIR = "corrige"        # sous-dossier où seront écrites les versions corrigées
BACKGROUND_COLOR = (255, 255, 255)  # blanc. Ex: (240, 248, 255) pour un blanc légèrement bleuté
ONLY_IF_TRANSPARENT = True    # ne traite que les images qui ont vraiment un canal alpha transparent
# ========================================


def has_transparency(img: Image.Image) -> bool:
    """Vérifie si l'image a des pixels réellement transparents (pas juste un canal alpha à 255 partout)."""
    if img.mode not in ("RGBA", "LA", "PA"):
        return False
    alpha = img.convert("RGBA").split()[-1]
    # Si la valeur minimale du canal alpha est 255, il n'y a aucune transparence réelle
    return alpha.getextrema()[0] < 255


def flatten_to_white(img: Image.Image, bg_color=(255, 255, 255)) -> Image.Image:
    """Compose l'image sur un fond de couleur unie et retourne une image RGB opaque."""
    rgba = img.convert("RGBA")
    background = Image.new("RGBA", rgba.size, bg_color + (255,))
    composited = Image.alpha_composite(background, rgba)
    return composited.convert("RGB")


def main():
    source = Path(SOURCE_DIR)
    output = source / OUTPUT_DIR
    output.mkdir(exist_ok=True)

    extensions = ("*.png", "*.jpg", "*.jpeg")
    image_files = sorted(
        f for ext in extensions for f in source.glob(ext)
    )

    if not image_files:
        print(f"Aucun fichier .png/.jpg/.jpeg trouvé dans {source.resolve()}")
        return

    treated = 0
    skipped = 0

    for path in image_files:
        try:
            img = Image.open(path)
        except Exception as e:
            print(f"⚠️  Impossible d'ouvrir {path.name}: {e}")
            continue

        if ONLY_IF_TRANSPARENT and not has_transparency(img):
            # Les .jpg n'ont jamais de transparence : ils sont toujours ignorés ici, c'est normal.
            skipped += 1
            continue

        fixed = flatten_to_white(img, BACKGROUND_COLOR)
        out_path = output / path.name
        # On garde le même format que l'original (jpg reste jpg, png reste png)
        save_format = "JPEG" if path.suffix.lower() in (".jpg", ".jpeg") else "PNG"
        fixed.save(out_path, save_format)
        treated += 1
        print(f"✅ Corrigé : {path.name}")

    print(f"\nTerminé. {treated} image(s) corrigée(s) (fond transparent → blanc), {skipped} sans transparence (ignorée(s), copie inchangée non créée).")
    print(f"Résultat dans : {output.resolve()}")
    print("Vérifie les fichiers, puis remplace les originaux si tout est bon.")


if __name__ == "__main__":
    main()