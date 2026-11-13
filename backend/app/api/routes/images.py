import io

from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

from app.config import settings
from app.schemas import AnalyzeRequest, AnalyzeResponse, UploadResponse
from app.services import image_analysis
from app.utils.security import ALLOWED_TYPES, find_upload, new_id

router = APIRouter(prefix="/api", tags=["images"])


@router.post("/upload-image", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    ext = ALLOWED_TYPES.get(file.content_type or "")
    if ext is None:
        raise HTTPException(status_code=415, detail="Only JPG, PNG or WEBP images are allowed.")

    limit = settings.max_upload_mb * 1024 * 1024
    data = await file.read(limit + 1)
    if len(data) > limit:
        raise HTTPException(status_code=413, detail=f"Image is larger than {settings.max_upload_mb} MB.")
    if not data:
        raise HTTPException(status_code=400, detail="The file is empty.")

    # Check the bytes really are an image, whatever the client claimed
    try:
        with Image.open(io.BytesIO(data)) as img:
            img.verify()
        with Image.open(io.BytesIO(data)) as img:
            width, height = img.size
            fmt = (img.format or "").lower()
    except (UnidentifiedImageError, OSError, SyntaxError):
        raise HTTPException(status_code=400, detail="The file is not a valid image.")

    image_id = new_id()
    settings.uploads_dir.mkdir(parents=True, exist_ok=True)
    (settings.uploads_dir / f"{image_id}.{ext}").write_bytes(data)

    return UploadResponse(image_id=image_id, filename=file.filename or "image", width=width, height=height, format=fmt)


@router.post("/analyze-image", response_model=AnalyzeResponse)
def analyze_image(body: AnalyzeRequest):
    path = find_upload(settings.uploads_dir, body.image_id)
    return AnalyzeResponse(**image_analysis.analyze(path))
