from fastapi import Depends
from sqlalchemy.orm import Session

from config.database import get_db
from app.user.repositories.user_repository import UserRepository
from app.user.services.user_service import UserService
from app.user.services.auth_service import AuthService


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_user_service(
    user_repository: UserRepository = Depends(get_user_repository),
) -> UserService:
    return UserService(user_repository)


def get_auth_service(
    user_repository: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(user_repository)
