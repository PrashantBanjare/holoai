from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings
from app.schemas import CatalogItem, GenerateRequest, GenerateResponse
from app.services.generators.base import GenerationInput
from app.services.generators.mock import generator
from app.services.model_service import get_entry, load_catalog
from app.utils.security import check_model_id, find_upload

router = APIRouter(prefix="/api", tags=["models"])


def _url(model_id: str) -> str:
    return f"/api/model/{model_id}/file"


@router.get("/models", response_model=list[CatalogItem])
def list_models():
    return [
        CatalogItem(id=e.id, name=e.name, keywords=list(e.keywords), url=_url(e.id)) for e in load_catalog()
    ]


@router.post("/generate-model", response_model=GenerateResponse)
def generate_model(body: GenerateRequest):
    prompt = (body.prompt or "").strip() or None
    if not prompt and not body.image_id:
        raise HTTPException(status_code=400, detail="Send a prompt or an image_id.")

    data = GenerationInput(prompt=prompt)
    if body.image_id:
        data.image_path = str(find_upload(settings.uploads_dir, body.image_id))
        if not prompt:
            raise HTTPException(
                status_code=422,
                detail="Images are not recognised automatically yet. Type an object name too.",
            )

    result = generator.generate(data)
    return GenerateResponse(model_id=result.model_id, name=result.name, url=_url(result.model_id), source=result.source)


@router.get("/model/{model_id}/metadata")
def model_metadata(model_id: str):
    entry = get_entry(check_model_id(model_id))
    size = (settings.models_dir / entry.file).stat().st_size
    return {"model_id": entry.id, "name": entry.name, "format": "glb", "size_bytes": size, "keywords": list(entry.keywords)}


@router.get("/model/{model_id}/file")
def model_file(model_id: str):
    entry = get_entry(check_model_id(model_id))
    return FileResponse(settings.models_dir / entry.file, media_type="model/gltf-binary", filename=entry.file)
