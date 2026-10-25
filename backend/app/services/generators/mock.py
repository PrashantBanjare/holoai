from pathlib import Path

from .base import GenerationInput, GenerationResult, ModelGenerator

KEYWORDS = {
    "engine": ["engine", "motor", "piston", "cylinder", "gearbox", "machine"],
    "truck": ["truck", "car", "van", "vehicle", "lorry", "automobile"],
}


class MockGenerator(ModelGenerator):
    """Picks a model from the local library by keyword. No AI involved."""

    def __init__(self, models_dir: Path):
        self.models_dir = models_dir

    async def generate(self, request: GenerationInput) -> GenerationResult:
        available = {p.stem for p in self.models_dir.glob("*.glb")}
        if not available:
            raise FileNotFoundError("No models found in storage/models.")

        text = (request.text or "").lower()
        chosen = next(
            (
                model_id
                for model_id, words in KEYWORDS.items()
                if model_id in available and any(w in text for w in words)
            ),
            None,
        )
        if chosen is None:
            chosen = "engine" if "engine" in available else sorted(available)[0]

        return GenerationResult(model_id=chosen, name=chosen.title(), source="mock-library")