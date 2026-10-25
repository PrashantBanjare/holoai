import re
import uuid
from io import BytesIO
from pathlib import Path

import aiofiles
from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from ..config import settings

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_FORMATS = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}
ID_PATTERN = re.compile(r"^[a-f0-9]{32}$")


def sanitize_filename(name: str | None) -> str:
    base = Path(name or "image").name
    base = re.sub(r"[^A-Za-z0-9._-]", "_", base)
    return base[:80] or "image"


def uploads_dir() -> Path:
    d = settings.storage_path / "uploads"
    d.mkdir(parents=True, exist_ok=True)
    return d


async def save_image(file: UploadFile) -> dict:
    """Validate type, size and content, then store under a random name."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(415, "Only JPG, PNG and WEBP images are allowed.")

    max_bytes = settings.max_upload_mb * 1024 * 1024
    data = await file.read(max_bytes + 1)
    if not data:
        raise HTTPException(400, "The file is empty.")
    if len(data) > max_bytes:
        raise HTTPException(413, f"The file is larger than {settings.max_upload_mb} MB.")

    # Check the real content, not just the declared type
    try:
        with Image.open(BytesIO(data)) as img:
            img.verify()
        with Image.open(BytesIO(data)) as img:
            fmt, width, height = img.format, img.width, img.height
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise HTTPException(400, "The file is not a valid image.")

    if fmt not in ALLOWED_FORMATS:
        raise HTTPException(415, "Only JPG, PNG and WEBP images are allowed.")

    image_id = uuid.uuid4().hex
    path = uploads_dir() / f"{image_id}.{ALLOWED_FORMATS[fmt]}"
    async with aiofiles.open(path, "wb") as f:
        await f.write(data)

    return {
        "image_id": image_id,
        "filename": sanitize_filename(file.filename),
        "width": width,
        "height": height,
        "format": fmt,
    }


def find_upload(image_id: str) -> Path:
    if not ID_PATTERN.match(image_id):
        raise HTTPException(400, "Invalid image id.")
    matches = list(uploads_dir().glob(f"{image_id}.*"))
    if not matches:
        raise HTTPException(404, "Image not found.")
    return matches[0]