from app.tasks.repositories.task_repository import TaskRepository
from app.user.dependencies.user_dependencies import get_user_service
from app.user.services.user_service import UserService
from app.tasks.services.task_service import TaskService
from fastapi import Depends, HTTPException
from config.database import get_db
from sqlalchemy.orm import Session


def get_task_repository(db: Session = Depends(get_db)) -> TaskRepository:
    return TaskRepository(db)


def get_task_service(
    task_repository: TaskRepository = Depends(get_task_repository),
    user_service: UserService = Depends(get_user_service),
) -> TaskService:
    return TaskService(task_repository, user_service)
