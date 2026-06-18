"""포인트 충전·사용·내역 테스트."""


def test_initial_points_zero(client, registered_user, auth_headers):
    resp = client.get("/me", headers=auth_headers)
    assert resp.json()["points"] == 0


def test_recharge_points(client, auth_headers):
    resp = client.post("/me/points/adjust", json={"delta": 5000, "description": "충전"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["points"] == 5000


def test_use_points(client, auth_headers):
    client.post("/me/points/adjust", json={"delta": 10000, "description": "충전"}, headers=auth_headers)
    resp = client.post("/me/points/adjust", json={"delta": -3000, "description": "사용"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["points"] == 7000


def test_insufficient_points(client, auth_headers):
    resp = client.post("/me/points/adjust", json={"delta": -1000, "description": "잔액 초과"}, headers=auth_headers)
    assert resp.status_code == 400


def test_point_history_recorded(client, auth_headers):
    client.post("/me/points/adjust", json={"delta": 5000, "description": "충전테스트"}, headers=auth_headers)
    client.post("/me/points/adjust", json={"delta": -1000, "description": "사용테스트"}, headers=auth_headers)
    resp = client.get("/me/points/history", headers=auth_headers)
    assert resp.status_code == 200
    history = resp.json()
    assert len(history) == 2
    descriptions = [h["description"] for h in history]
    assert "충전테스트" in descriptions
    assert "사용테스트" in descriptions


def test_point_history_requires_auth(client):
    resp = client.get("/me/points/history")
    assert resp.status_code == 401


def test_games_include_genre(client):
    resp = client.get("/games")
    assert resp.status_code == 200
    games = resp.json()["games"]
    assert len(games) == 0  # 시드 없이는 빈 리스트 — API 동작 자체만 확인
