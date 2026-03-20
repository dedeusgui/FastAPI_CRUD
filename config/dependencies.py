from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from config.database import get_db
from app.user.repositories.user_repository import UserRepository
from app.user.services.user_service import UserService
from app.user.services.auth_service import AuthService
from app.tasks.repositories.task_repository import TaskRepository
from app.tasks.services.task_service import TaskService


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


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


def get_task_repository(db: Session = Depends(get_db)) -> TaskRepository:
    return TaskRepository(db)


def get_task_service(
    task_repository: TaskRepository = Depends(get_task_repository),
    user_service: UserService = Depends(get_user_service),
) -> TaskService:
    return TaskService(task_repository, user_service)


def get_current_user(
    auth_service: AuthService = Depends(get_auth_service),
    token: str = Depends(oauth2_scheme),
):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return auth_service.get_current_user(token)
