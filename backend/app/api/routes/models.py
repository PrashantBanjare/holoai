from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ...schemas import GenerateRequest, GenerateResponse
from ...services import model_service
from ...services.generators.base import GenerationInput
from ...utils.security import find_upload

router = APIRouter()


@router.post("/generate-model", response_model=GenerateResponse)
async def generate_model(req: GenerateRequest):
    text = (req.prompt or "").strip()
    if not text and not req.image_id:
        raise HTTPException(400, "Provide a text prompt or an uploaded image id.")

    image_path = str(find_upload(req.image_id)) if req.image_id else None
    try:
        result = await model_service.generator.generate(
            GenerationInput(text=text or None, image_path=image_path)
        )
    except FileNotFoundError as e:
        raise HTTPException(503, str(e))

    return GenerateResponse(
        model_id=result.model_id,
        name=result.name,
        url=f"/api/model/{result.model_id}/file",
        source=result.source,
    )


@router.get("/model/{model_id}/metadata")
def get_metadata(model_id: str):
    return model_service.metadata(model_id)


@router.get("/model/{model_id}/file")
def get_model_file(model_id: str):
    return FileResponse(model_service.model_path(model_id), media_type="model/gltf-binary")