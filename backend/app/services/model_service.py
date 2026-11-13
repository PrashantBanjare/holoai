import json
from dataclasses import dataclass

from fastapi import HTTPException

from app.config import settings


@dataclass(frozen=True)
class CatalogEntry:
    id: str
    name: str
    file: str
    keywords: tuple[str, ...]


def load_catalog() -> list[CatalogEntry]:
    path = settings.storage_dir / "catalog.json"
    if not path.is_file():
        return []
    raw = json.loads(path.read_text(encoding="utf-8"))
    return [
        CatalogEntry(
            id=e["id"],
            name=e["name"],
            file=e["file"],
            keywords=tuple(k.lower() for k in e["keywords"]),
        )
        for e in raw
        if (settings.models_dir / e["file"]).is_file()  # skip entries whose file is missing
    ]


def match_entry(text: str) -> CatalogEntry | None:
    """Best catalog entry for a free-text description, or None if nothing matches."""
    t = text.lower()
    best, best_score = None, 0
    for entry in load_catalog():
        score = 0
        if entry.name.lower() in t:
            score += 3
        for k in entry.keywords:
            if k in t:
                score += 2 if " " in k else 1
        if score > best_score:
            best, best_score = entry, score
    return best


def get_entry(model_id: str) -> CatalogEntry:
    for entry in load_catalog():
        if entry.id == model_id:
            return entry
    raise HTTPException(status_code=404, detail="Model not found.")
