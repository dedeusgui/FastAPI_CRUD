def _error_payload(response):
    return response.json()["error"]


def test_register_user(register_user):
    response = register_user(
        name="Test User",
        email="test@email.com",
        password="testpassword",
    )
    payload = response.json()

    assert response.status_code == 201
    assert payload["message"] == "User registered successfully"
    assert payload["data"]["user"]["name"] == "Test User"
    assert payload["data"]["user"]["email"] == "test@email.com"
    assert "id" in payload["data"]["user"]


def test_register_user_with_existing_email(register_user):
    register_user(
        name="Test User",
        email="test@email.com",
        password="testpassword",
    )

    response = register_user(
        name="Test User",
        email="test@email.com",
        password="testpassword",
    )

    assert response.status_code == 400
    assert _error_payload(response) == {
        "code": "USER_EMAIL_ALREADY_REGISTERED",
        "message": "Email already registered",
        "detail": None,
        "fields": [],
    }


def test_register_user_short_password_returns_422(client):
    response = client.post(
        "/users/register",
        json={
            "name": "Short Password",
            "email": "short@example.com",
            "password": "123",
        },
    )
    payload = _error_payload(response)

    assert response.status_code == 422
    assert payload["code"] == "VALIDATION_ERROR"
    assert payload["message"] == "Request validation failed"
    assert {field["field"] for field in payload["fields"]} == {"password"}


def test_login_user_returns_cookie(register_user, login_user):
    register_user(
        name="Test User",
        email="test@email.com",
        password="testpassword",
    )

    response, token = login_user("test@email.com", "testpassword")
    payload = response.json()

    assert response.status_code == 200
    assert payload["message"] == "Login successful"
    assert payload["data"]["user"]["email"] == "test@email.com"
    assert payload["data"]["user"]["name"] == "Test User"
    assert token is not None


def test_login_user_payload_invalid_returns_422(client):
    response = client.post(
        "/users/login",
        json={"email": "invalid-email"},
    )
    payload = _error_payload(response)

    assert response.status_code == 422
    assert payload["code"] == "VALIDATION_ERROR"
    assert payload["message"] == "Request validation failed"
    assert {field["field"] for field in payload["fields"]} == {"email", "password"}
