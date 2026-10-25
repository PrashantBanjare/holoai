from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    prompt: str | None = Field(default=None, max_length=200)
    image_id: str | None = None


class GenerateResponse(BaseModel):
    model_id: str
    name: str
    url: str
    source: str


class AnalyzeRequest(BaseModel):
    image_id: str


class UploadResponse(BaseModel):
    image_id: str
    filename: str
    width: int
    height: int
    format: str