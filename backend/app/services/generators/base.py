from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class GenerationInput:
    text: str | None = None
    image_path: str | None = None


@dataclass
class GenerationResult:
    model_id: str
    name: str
    source: str


class ModelGenerator(ABC):
    """Every generator (mock now, a real AI later) implements this one method."""

    @abstractmethod
    async def generate(self, request: GenerationInput) -> GenerationResult: ...