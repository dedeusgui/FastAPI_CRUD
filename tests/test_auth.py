def _error_payload(response):
    return response.json()["error"]


def test_login_invalid_password_returns_401(register_user, login_user):
    register_user(
        name="Auth User",
        email="auth@example.com",
        password="correct-password",
    )

    response, _ = login_user("auth@example.com", "wrong-password")

    assert response.status_code == 401
    assert _error_payload(response) == {
        "code": "AUTH_INVALID_CREDENTIALS",
        "message": "Invalid email or password",
        "detail": None,
        "fields": [],
    }


def test_login_nonexistent_email_returns_401(login_user):
    response, _ = login_user("notfound@example.com", "any-password")

    assert response.status_code == 401
    assert _error_payload(response) == {
        "code": "AUTH_INVALID_CREDENTIALS",
        "message": "Invalid email or password",
        "detail": None,
        "fields": [],
    }


def test_get_me_with_valid_cookie_returns_user(register_user, login_user, client):
    register_user(
        name="Current User",
        email="current@example.com",
        password="testpassword",
    )
    _, token = login_user("current@example.com", "testpassword")

    response = client.get("/users/me", cookies={"access_token": token})
    payload = response.json()

    assert response.status_code == 200
    assert payload["data"]["user"]["email"] == "current@example.com"
    assert payload["data"]["user"]["name"] == "Current User"


def test_get_me_without_cookie_returns_401(client):
    response = client.get("/users/me")

    assert response.status_code == 401
    assert _error_payload(response) == {
        "code": "AUTH_NOT_AUTHENTICATED",
        "message": "Not authenticated",
        "detail": None,
        "fields": [],
    }


def test_get_me_with_invalid_cookie_returns_401(client):
    response = client.get("/users/me", cookies={"access_token": "invalid-token"})

    assert response.status_code == 401
    assert _error_payload(response) == {
        "code": "AUTH_INVALID_TOKEN",
        "message": "Invalid token",
        "detail": None,
        "fields": [],
    }


def test_logout_with_valid_cookie_revokes_only_current_session(
    register_user, login_user, client
):
    register_user(
        name="Logout User",
        email="logout@example.com",
        password="testpassword",
    )
    _, first_token = login_user("logout@example.com", "testpassword")
    _, second_token = login_user("logout@example.com", "testpassword")

    logout_response = client.post(
        "/users/logout", cookies={"access_token": first_token}
    )

    assert logout_response.status_code == 200
    assert logout_response.json() == {
        "data": None,
        "message": "Logout successful",
    }
    assert "access_token=" in logout_response.headers.get("set-cookie", "")

    first_me_response = client.get("/users/me", cookies={"access_token": first_token})
    second_me_response = client.get("/users/me", cookies={"access_token": second_token})

    assert first_me_response.status_code == 401
    assert _error_payload(first_me_response) == {
        "code": "AUTH_INVALID_TOKEN",
        "message": "Invalid token",
        "detail": None,
        "fields": [],
    }
    assert second_me_response.status_code == 200
    assert second_me_response.json()["data"]["user"]["email"] == "logout@example.com"


def test_logout_without_cookie_returns_401(client):
    response = client.post("/users/logout")

    assert response.status_code == 401
    assert _error_payload(response) == {
        "code": "AUTH_NOT_AUTHENTICATED",
        "message": "Not authenticated",
        "detail": None,
        "fields": [],
    }
