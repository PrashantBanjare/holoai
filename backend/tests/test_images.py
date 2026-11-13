def _upload(client, data, name="a.png", ctype="image/png"):
    return client.post("/api/upload-image", files={"file": (name, data, ctype)})


def test_upload_and_analyze(client, png_bytes):
    r = _upload(client, png_bytes)
    assert r.status_code == 200
    body = r.json()
    assert (body["width"], body["height"]) == (40, 20)

    a = client.post("/api/analyze-image", json={"image_id": body["image_id"]})
    assert a.status_code == 200
    assert a.json()["dominant_color"] == "#c81e1e"


def test_upload_rejects_wrong_type(client):
    assert _upload(client, b"hello", "a.txt", "text/plain").status_code == 415


def test_upload_rejects_fake_image(client):
    assert _upload(client, b"not really a png").status_code == 400


def test_upload_rejects_empty(client):
    assert _upload(client, b"").status_code == 400


def test_upload_too_large(client, monkeypatch):
    from app.config import settings

    monkeypatch.setattr(settings, "max_upload_mb", 0)
    assert _upload(client, b"x" * 10).status_code == 413


def test_analyze_unknown_image(client):
    assert client.post("/api/analyze-image", json={"image_id": "a" * 32}).status_code == 404


def test_generate_from_image_only_asks_for_a_name(client, png_bytes):
    image_id = _upload(client, png_bytes).json()["image_id"]
    r = client.post("/api/generate-model", json={"image_id": image_id})
    assert r.status_code == 422


def test_generate_from_image_with_prompt(client, png_bytes):
    image_id = _upload(client, png_bytes).json()["image_id"]
    r = client.post("/api/generate-model", json={"image_id": image_id, "prompt": "truck"})
    assert r.status_code == 200
    assert r.json()["model_id"] == "truck"
