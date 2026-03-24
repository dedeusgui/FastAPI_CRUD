def test_login_invalid_password_returns_401(register_user, login_user):
    register_user(
        name="Auth User",
        email="auth@example.com",
        password="correct-password",
    )

    response, _ = login_user("auth@example.com", "wrong-password")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}


def test_login_nonexistent_email_returns_401(login_user):
    response, _ = login_user("notfound@example.com", "any-password")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}


def test_get_me_with_valid_cookie_returns_user(register_user, login_user, client):
    register_user(
        name="Current User",
        email="current@example.com",
        password="testpassword",
    )
    _, token = login_user("current@example.com", "testpassword")

    response = client.get("/users/me", cookies={"access_token": token})

    assert response.status_code == 200
    assert response.json()["email"] == "current@example.com"
    assert response.json()["name"] == "Current User"


def test_get_me_without_cookie_returns_401(client):
    response = client.get("/users/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


def test_get_me_with_invalid_cookie_returns_401(client):
    response = client.get("/users/me", cookies={"access_token": "invalid-token"})

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid token"}
