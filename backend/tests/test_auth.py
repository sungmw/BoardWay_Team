"""인증 관련 테스트 — 회원가입, 로그인, /me 엔드포인트."""


def test_signup_success(client):
    resp = client.post("/signup", json={
        "email": "new@boardway.io",
        "password": "pass1234",
        "nickname": "신규유저",
    })
    assert resp.status_code == 200
    data = resp.json()
    # 응답 형태: {"message": "...", "user": {"email": ..., "nickname": ..., "mannerScore": ...}}
    assert data["user"]["email"] == "new@boardway.io"
    assert data["user"]["nickname"] == "신규유저"


def test_signup_duplicate_email(client):
    payload = {"email": "dup@boardway.io", "password": "pass", "nickname": "유저A"}
    client.post("/signup", json=payload)
    resp = client.post("/signup", json={**payload, "nickname": "유저B"})
    assert resp.status_code == 400


def test_signup_duplicate_nickname(client):
    client.post("/signup", json={"email": "a@boardway.io", "password": "pass", "nickname": "같은닉"})
    resp = client.post("/signup", json={"email": "b@boardway.io", "password": "pass", "nickname": "같은닉"})
    assert resp.status_code == 400


def test_login_success(client):
    client.post("/signup", json={"email": "login@boardway.io", "password": "pw", "nickname": "로그인유저"})
    resp = client.post("/login", json={"email": "login@boardway.io", "password": "pw"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password(client):
    client.post("/signup", json={"email": "wp@boardway.io", "password": "correct", "nickname": "잘못비번"})
    resp = client.post("/login", json={"email": "wp@boardway.io", "password": "wrong"})
    assert resp.status_code == 401


def test_login_nonexistent_user(client):
    resp = client.post("/login", json={"email": "ghost@boardway.io", "password": "pw"})
    assert resp.status_code == 401


def test_me_authenticated(client, registered_user, auth_headers):
    resp = client.get("/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["nickname"] == registered_user["nickname"]


def test_me_unauthenticated(client):
    resp = client.get("/me")
    assert resp.status_code == 401
