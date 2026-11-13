def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_list_models(client):
    ids = [m["id"] for m in client.get("/api/models").json()]
    assert {"engine", "truck"} <= set(ids)


def test_generate_from_prompt(client):
    r = client.post("/api/generate-model", json={"prompt": "a car engine"})
    assert r.status_code == 200
    assert r.json()["model_id"] == "engine"


def test_generate_matches_other_models(client):
    assert client.post("/api/generate-model", json={"prompt": "gearbox"}).json()["model_id"] == "gearbox"
    assert client.post("/api/generate-model", json={"prompt": "milk truck"}).json()["model_id"] == "truck"


def test_generate_unknown_prompt(client):
    r = client.post("/api/generate-model", json={"prompt": "dragon"})
    assert r.status_code == 404
    assert "Try one of" in r.json()["detail"]


def test_generate_needs_input(client):
    assert client.post("/api/generate-model", json={}).status_code == 400


def test_generate_rejects_bad_image_id(client):
    r = client.post("/api/generate-model", json={"image_id": "../../etc/passwd"})
    assert r.status_code == 400


def test_model_file_and_metadata(client):
    meta = client.get("/api/model/engine/metadata").json()
    assert meta["size_bytes"] > 0
    r = client.get("/api/model/engine/file")
    assert r.status_code == 200
    assert r.content[:4] == b"glTF"


def test_model_id_validation(client):
    assert client.get("/api/model/..%2Fsecret/file").status_code in (400, 404)
    assert client.get("/api/model/nope/file").status_code == 404
