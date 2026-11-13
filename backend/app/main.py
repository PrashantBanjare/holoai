from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import images, models
from app.config import settings

app = FastAPI(title="HoloAI API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(images.router)
app.include_router(models.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
