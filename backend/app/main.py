from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import images, models
from .config import settings

app = FastAPI(title="HoloAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

for sub in ("uploads", "models"):
    (settings.storage_path / sub).mkdir(parents=True, exist_ok=True)

app.include_router(models.router, prefix="/api")
app.include_router(images.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}