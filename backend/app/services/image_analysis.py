from pathlib import Path

from PIL import Image


def analyze(path: Path) -> dict:
    """Placeholder analysis. A real vision model plugs in here in Phase 7."""
    with Image.open(path) as img:
        r, g, b = img.convert("RGB").resize((1, 1)).getpixel((0, 0))
        return {
            "width": img.width,
            "height": img.height,
            "format": img.format,
            "dominant_color": f"#{r:02x}{g:02x}{b:02x}",
            "detected_object": None,
            "note": "Mock analysis: object recognition is not connected yet.",
        }