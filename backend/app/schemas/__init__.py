from pydantic import BaseModel, Field


class UploadResponse(BaseModel):
    image_id: str
    filename: str
    width: int
    height: int
    format: str


class AnalyzeRequest(BaseModel):
    image_id: str


class AnalyzeResponse(BaseModel):
    width: int
    height: int
    format: str
    dominant_color: str
    note: str


class GenerateRequest(BaseModel):
    prompt: str | None = Field(default=None, max_length=200)
    image_id: str | None = None


class GenerateResponse(BaseModel):
    model_id: str
    name: str
    url: str
    source: str


class CatalogItem(BaseModel):
    id: str
    name: str
    keywords: list[str]
    url: str
