import re
import secrets
from pathlib import Path

from fastapi import HTTPException

ALLOWED_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
ID_PATTERN = re.compile(r"^[a-f0-9]{32}$")
MODEL_ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")


def new_id() -> str:
    return secrets.token_hex(16)


def check_image_id(image_id: str) -> str:
    if not ID_PATTERN.match(image_id):
        raise HTTPException(status_code=400, detail="Invalid image id.")
    return image_id


def check_model_id(model_id: str) -> str:
    if not MODEL_ID_PATTERN.match(model_id):
        raise HTTPException(status_code=400, detail="Invalid model id.")
    return model_id


def find_upload(uploads_dir: Path, image_id: str) -> Path:
    """Locate an uploaded image by id. The id is validated, so no path tricks are possible."""
    check_image_id(image_id)
    for ext in ALLOWED_TYPES.values():
        path = uploads_dir / f"{image_id}.{ext}"
        if path.is_file():
            return path
    raise HTTPException(status_code=404, detail="Image not found. Upload it first.")
