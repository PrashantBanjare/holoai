from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class GenerationInput:
    prompt: str | None = None
    image_path: str | None = None


@dataclass
class GenerationResult:
    model_id: str
    name: str
    source: str  # which generator produced it


class ModelGenerator(ABC):
    """Anything that turns text/image into a 3D model. Swap implementations without touching routes."""

    name: str

    @abstractmethod
    def generate(self, data: GenerationInput) -> GenerationResult: ...
