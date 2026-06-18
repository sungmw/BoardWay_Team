"""매치 CRUD + 참여/취소 관련 테스트."""

MATCH_PAYLOAD = {
    "games": ["스플랜더"],
    "difficulty": "보통",
    "tags": ["전략"],
    "date": "2030-01-01",
    "startTime": "19:00",
    "ruleVideoUrls": [],
    "location": {"venue": "테스트카페", "branch": "강남점", "address": "서울 강남구"},
    "maxPlayers": 4,
    "is_flexible": False,
}


def _create_match(client, headers):
    return client.post("/matches", json=MATCH_PAYLOAD, headers=headers)


def test_create_match_requires_auth(client):
    resp = client.post("/matches", json=MATCH_PAYLOAD)
    assert resp.status_code == 401


def test_create_match_success(client, auth_headers):
    resp = _create_match(client, auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["games"] == ["스플랜더"]
    assert data["maxPlayers"] == 4


def test_get_matches_returns_list(client, auth_headers):
    _create_match(client, auth_headers)
    resp = client.get("/matches")
    assert resp.status_code == 200
    # 응답 형태: {"matches": [...]}
    matches = resp.json()["matches"]
    assert isinstance(matches, list)
    assert len(matches) >= 1


def test_get_match_detail(client, auth_headers):
    match_id = _create_match(client, auth_headers).json()["id"]
    resp = client.get(f"/matches/{match_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == match_id


def test_get_match_not_found(client):
    resp = client.get("/matches/nonexistent-id")
    assert resp.status_code == 404


def test_join_match(client, auth_headers):
    match_id = _create_match(client, auth_headers).json()["id"]

    # 두 번째 사용자 생성
    client.post("/signup", json={"email": "user2@boardway.io", "password": "pw", "nickname": "참여자"})
    token2 = client.post("/login", json={"email": "user2@boardway.io", "password": "pw"}).json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    resp = client.post(f"/matches/{match_id}/join", json={"role": "participant"}, headers=headers2)
    assert resp.status_code == 200


def test_leave_match(client, auth_headers):
    match_id = _create_match(client, auth_headers).json()["id"]

    client.post("/signup", json={"email": "leaver@boardway.io", "password": "pw", "nickname": "떠나는자"})
    token = client.post("/login", json={"email": "leaver@boardway.io", "password": "pw"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post(f"/matches/{match_id}/join", json={"role": "participant"}, headers=headers)
    resp = client.delete(f"/matches/{match_id}/leave", headers=headers)
    assert resp.status_code == 200


def test_delete_match_by_creator(client, auth_headers):
    match_id = _create_match(client, auth_headers).json()["id"]
    resp = client.delete(f"/matches/{match_id}", headers=auth_headers)
    assert resp.status_code == 200


def test_delete_match_by_non_creator(client, auth_headers):
    match_id = _create_match(client, auth_headers).json()["id"]

    client.post("/signup", json={"email": "other@boardway.io", "password": "pw", "nickname": "남의것"})
    token = client.post("/login", json={"email": "other@boardway.io", "password": "pw"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.delete(f"/matches/{match_id}", headers=headers)
    assert resp.status_code == 403
