from fastapi import Depends, HTTPException, Request
from app.auth.repositories.session_repository import SessionRepository
from app.auth.services.session_service import SessionService
from app.user.repositories.user_repository import UserRepository
from app.user.dependencies.user_dependencies import (
    get_user_repository,
)
from app.auth.services.auth_service import AuthService

from config.database import get_db


def get_session_repository(db=Depends(get_db)) -> SessionRepository:
    return SessionRepository(db)


def get_session_service(
    session_repository: SessionRepository = Depends(get_session_repository),
) -> SessionService:
    return SessionService(session_repository)


def get_auth_service(
    user_repository: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(user_repository)


def get_current_user(
    request: Request,
    session_service: SessionService = Depends(get_session_service),
):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = session_service.get_session_by_token(token)
    if session is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return session.user
