from pathlib import Path

from PIL import Image


def analyze(path: Path) -> dict:
    """Basic facts about an uploaded image: size, format and average color."""
    with Image.open(path) as img:
        fmt = (img.format or "unknown").lower()
        width, height = img.size
        r, g, b = img.convert("RGB").resize((1, 1)).getpixel((0, 0))

    return {
        "width": width,
        "height": height,
        "format": fmt,
        "dominant_color": f"#{r:02x}{g:02x}{b:02x}",
        "note": "The image cannot be recognised automatically. Type the object name to pick a model.",
    }
