from fastapi import APIRouter, File, UploadFile

from ...schemas import AnalyzeRequest, UploadResponse
from ...services import image_analysis
from ...utils.security import find_upload, save_image

router = APIRouter()


@router.post("/upload-image", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    return await save_image(file)


@router.post("/analyze-image")
async def analyze_image(req: AnalyzeRequest):
    return image_analysis.analyze(find_upload(req.image_id))