import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.config import settings
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    # Uploads go to a temp folder, so tests never touch real data
    uploads = tmp_path / "uploads"
    uploads.mkdir()
    monkeypatch.setattr(type(settings), "uploads_dir", property(lambda self: uploads))
    return TestClient(app)


@pytest.fixture
def png_bytes():
    buf = io.BytesIO()
    Image.new("RGB", (40, 20), (200, 30, 30)).save(buf, format="PNG")
    return buf.getvalue()
