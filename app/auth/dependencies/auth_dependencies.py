from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException
from app.user.repositories.user_repository import UserRepository
from app.user.dependencies.user_dependencies import (
    get_user_repository,
)
from app.auth.services.auth_service import AuthService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


def get_auth_service(
    user_repository: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(user_repository)


def get_current_user(
    auth_service: AuthService = Depends(get_auth_service),
    token: str = Depends(oauth2_scheme),
):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return auth_service.get_current_user(token)
