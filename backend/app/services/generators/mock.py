from fastapi import HTTPException

from app.services.generators.base import GenerationInput, GenerationResult, ModelGenerator
from app.services.model_service import load_catalog, match_entry


class MockGenerator(ModelGenerator):
    """Picks the closest model from the local catalog. A real generator would call an AI service."""

    name = "catalog"

    def generate(self, data: GenerationInput) -> GenerationResult:
        text = data.prompt or ""
        entry = match_entry(text) if text else None

        if entry is None:
            catalog = load_catalog()
            if not catalog:
                raise HTTPException(status_code=500, detail="The model catalog is empty.")
            names = ", ".join(e.name.lower() for e in catalog)
            raise HTTPException(
                status_code=404,
                detail=f'No model matches "{text or "your input"}". Try one of: {names}.',
            )
        return GenerationResult(model_id=entry.id, name=entry.name, source=self.name)


# One place to change when a real generator is added.
generator: ModelGenerator = MockGenerator()
