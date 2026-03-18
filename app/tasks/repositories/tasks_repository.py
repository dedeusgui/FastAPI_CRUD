from turtle import title

from sqlalchemy.orm import Session
from app.tasks.models.tasks import Task
from todo.app.tasks.schemas.tasks import TaskUpdate


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_task(self, task: Task) -> Task:
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, id: int):
        task = self.get_task_by_id(id)
        if task:
            self.db.delete(task)

    def update_task(
        self, task: Task, title: str | None, description: str | None, user_id: int
    ) -> None:

        if not task:
            return None

        if title is not None:
            task.title = title

        if description is not None:
            task.description = description

        self.db.commit()
        self.db.refresh(task)

    def complete_task(self, task: Task):
        task.completed = True
        self.db.commit()
        self.db.refresh(task)

    def get_task_by_id(self, id: int):
        return self.db.query(Task).filter(Task.id == id).first()
