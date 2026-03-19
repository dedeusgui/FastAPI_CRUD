from sqlalchemy.orm import Session
from app.tasks.models.tasks import Task


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_task(self, task: Task) -> Task:
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, id: int) -> None:
        task = self.get_task_by_id(id)
        if task:
            self.db.delete(task)
            self.db.commit()

    def update_task(
        self, task: Task, title: str | None, description: str | None
    ) -> None:

        if not task:
            return None

        if title is not None:
            task.title = title

        if description is not None:
            task.description = description
        self.db.commit()
        self.db.refresh(task)

    def complete_task(self, task: Task) -> None:
        task.completed = True
        self.db.commit()
        self.db.refresh(task)

    def get_task_by_id(self, id: int) -> Task | None:
        return self.db.query(Task).filter(Task.id == id).first()

    def get_tasks_by_user_id(self, user_id: int) -> list[Task]:
        return self.db.query(Task).filter(Task.user_id == user_id).all()
