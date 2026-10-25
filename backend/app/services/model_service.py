import re
from pathlib import Path

from fastapi import HTTPException

from ..config import settings
from .generators.base import ModelGenerator
from .generators.mock import MockGenerator

MODEL_ID_PATTERN = re.compile(r"^[a-z0-9_-]{1,64}$")


def models_dir() -> Path:
    return settings.storage_path / "models"


# Swap this line for a real generator in Phase 7
generator: ModelGenerator = MockGenerator(models_dir())


def model_path(model_id: str) -> Path:
    if not MODEL_ID_PATTERN.match(model_id):
        raise HTTPException(400, "Invalid model id.")
    path = models_dir() / f"{model_id}.glb"
    if not path.is_file():
        raise HTTPException(404, "Model not found.")
    return path


def metadata(model_id: str) -> dict:
    path = model_path(model_id)
    return {
        "id": model_id,
        "name": model_id.title(),
        "format": "glb",
        "size_bytes": path.stat().st_size,
        "url": f"/api/model/{model_id}/file",
        "source": "mock-library",
    }