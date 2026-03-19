from fastapi import HTTPException

from app.tasks.repositories.task_repository import TaskRepository
from app.tasks.models.tasks import Task


class TaskService:
    def __init__(self, task_repository: TaskRepository):
        self.task_repository = task_repository

    def create_task(self, title: str, description: str | None, user_id: int) -> None:
        task = Task(title=title, description=description, user_id=user_id)
        self.task_repository.create_task(task)

    def complete_task(self, id: int, user_id: int) -> None:
        task = self.task_repository.get_task_by_id(id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if task.user_id != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        self.task_repository.complete_task(task)

    def update_task(
        self, id: int, title: str | None, description: str | None, user_id: int
    ) -> None:
        task = self.task_repository.get_task_by_id(id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if task.user_id != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        self.task_repository.update_task(
            task,
            title,
            description,
        )

    def delete_task(self, id: int, user_id: int) -> None:
        task = self.task_repository.get_task_by_id(id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        if task.user_id != user_id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        self.task_repository.delete_task(id)

    def get_tasks_by_user_id(self, user_id: int) -> list[Task]:
        if not user_id:
            raise HTTPException(status_code=400, detail="User ID is required")
        return self.task_repository.get_tasks_by_user_id(user_id)
