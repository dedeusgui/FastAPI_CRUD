from app.tasks.repositories.task_repository import TaskRepository
from app.shared import AppException
from app.user.services import UserService
from app.tasks.models.tasks import Task


class TaskService:
    def __init__(self, task_repository: TaskRepository, user_service: UserService):
        self.task_repository = task_repository
        self.user_service = user_service

    def create_task(
        self, title: str, description: str | None, user_id: int
    ) -> Task:
        self.user_service.get_user_by_id(user_id)
        task = Task(title=title, description=description, user_id=user_id)

        return self.task_repository.create_task(task)

    def complete_task(self, id: int, user_id: int) -> Task:
        task = self.task_repository.get_task_by_id(id)
        if not task:
            raise AppException(
                status_code=404,
                code="TASK_NOT_FOUND",
                message="Task not found",
            )
        if task.user_id != user_id:
            raise AppException(
                status_code=403,
                code="TASK_FORBIDDEN",
                message="Unauthorized",
            )
        return self.task_repository.complete_task(task)

    def update_task(
        self, id: int, title: str | None, description: str | None, user_id: int
    ) -> Task | None:
        task = self.task_repository.get_task_by_id(id)
        if not task:
            raise AppException(
                status_code=404,
                code="TASK_NOT_FOUND",
                message="Task not found",
            )
        if task.user_id != user_id:
            raise AppException(
                status_code=403,
                code="TASK_FORBIDDEN",
                message="Unauthorized",
            )

        return self.task_repository.update_task(
            task,
            title,
            description,
        )

    def delete_task(self, id: int, user_id: int) -> None:
        task = self.task_repository.get_task_by_id(id)
        if not task:
            raise AppException(
                status_code=404,
                code="TASK_NOT_FOUND",
                message="Task not found",
            )
        if task.user_id != user_id:
            raise AppException(
                status_code=403,
                code="TASK_FORBIDDEN",
                message="Unauthorized",
            )
        self.task_repository.delete_task(id)

    def get_tasks_by_user_id(self, user_id: int) -> list[Task]:
        if not user_id:
            raise AppException(
                status_code=400,
                code="BAD_REQUEST",
                message="User ID is required",
            )
        return self.task_repository.get_tasks_by_user_id(user_id)

    def get_task_by_id(self, id: int, user_id: int) -> Task:
        task = self.task_repository.get_task_by_id(id)
        if not task:
            raise AppException(
                status_code=404,
                code="TASK_NOT_FOUND",
                message="Task not found",
            )
        if task.user_id != user_id:
            raise AppException(
                status_code=403,
                code="TASK_FORBIDDEN",
                message="Unauthorized",
            )
        return task
