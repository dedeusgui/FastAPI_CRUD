import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import create_app
from config.database import Base
from config.database import get_db
from app.auth.models.session import Session as AuthSession
from app.tasks.models.tasks import Task
from app.user.models.user import User
from app.friends.models.friendships import Friendship
from app.user.repositories.user_repository import UserRepository
from app.user.services.user_service import UserService


@pytest.fixture
def test_engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    Base.metadata.create_all(
        bind=engine,
        tables=[
            User.__table__,
            Task.__table__,
            AuthSession.__table__,
            Friendship.__table__,
        ],
    )
    try:
        yield engine
    finally:
        Base.metadata.drop_all(
            bind=engine,
            tables=[
                User.__table__,
                Task.__table__,
                AuthSession.__table__,
                Friendship.__table__,
            ],
        )


@pytest.fixture
def session_factory(test_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture
def db_session(session_factory):
    db = session_factory()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(session_factory):
    app = create_app(create_tables=False)

    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def user_repository(db_session):
    return UserRepository(db_session)


@pytest.fixture
def user_service(user_repository):
    return UserService(user_repository)


@pytest.fixture
def register_user(client):
    def _register(
        name: str,
        email: str,
        password: str,
        username: str | None = None,
        avatar_url: str = "https://www.gravatar.com/avatar/",
    ):
        resolved_username = username or email.split("@")[0]
        return client.post(
            "/users/register",
            json={
                "name": name,
                "username": resolved_username,
                "email": email,
                "avatar_url": avatar_url,
                "password": password,
            },
        )

    return _register


@pytest.fixture
def login_user(client):
    def _login(email: str, password: str):
        response = client.post(
            "/users/login",
            json={"email": email, "password": password},
        )
        token = response.cookies.get("access_token")
        return response, token

    return _login


@pytest.fixture
def auth_headers(login_user, register_user):
    def _auth_headers(name: str, email: str, password: str):
        register_user(name=name, email=email, password=password)
        _, token = login_user(email, password)
        return {"access_token": token}

    return _auth_headers
