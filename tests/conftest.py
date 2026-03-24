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
from app.user.repositories.user_repository import UserRepository
from app.user.services.user_service import UserService


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SessionTesting = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    Base.metadata.create_all(
        bind=engine,
        tables=[User.__table__, Task.__table__, AuthSession.__table__],
    )
    db = SessionTesting()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(
            bind=engine,
            tables=[User.__table__, Task.__table__, AuthSession.__table__],
        )


@pytest.fixture
def client(db_session):
    app = create_app()

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

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
    def _register(name: str, email: str, password: str):
        return client.post(
            "/users/register",
            json={"name": name, "email": email, "password": password},
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
