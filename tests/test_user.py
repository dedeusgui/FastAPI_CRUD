def test_register_user(register_user):
    response = register_user(
        name="Test User",
        email="test@email.com",
        password="testpassword",
    )

    assert response.status_code == 200
    assert response.json() == {"message": "User registered successfully"}


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
    assert response.json() == {"detail": "Email already registered"}


def test_register_user_short_password_returns_422(client):
    response = client.post(
        "/users/register",
        json={
            "name": "Short Password",
            "email": "short@example.com",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_login_user_returns_cookie(register_user, login_user):
    register_user(
        name="Test User",
        email="test@email.com",
        password="testpassword",
    )

    response, token = login_user("test@email.com", "testpassword")

    assert response.status_code == 200
    assert response.json() == {"message": "Login successful"}
    assert token is not None


def test_login_user_payload_invalid_returns_422(client):
    response = client.post(
        "/users/login",
        json={"email": "invalid-email"},
    )

    assert response.status_code == 422
