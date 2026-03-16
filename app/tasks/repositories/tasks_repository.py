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

    def delete_task(self, id: int):
        task = self.get_task_by_id(id)
        if task:
            self.db.delete(task)

    def update_task(self, id: int, title: str, description: str):
        task = self.get_task_by_id(id)
        if task:
            task = self.get_task_by_id(id)

        if not task:
            return None

        task.title = title
        task.description = description

        self.db.commit()
        self.db.refresh(task)

    def complete_task(self, id: int):
        task = self.get_task_by_id(id)
        if task:
            task.completed = True
            self.db.commit()
            self.db.refresh(task)

    def get_task_by_id(self, id: int):
        return self.db.query(Task).filter(Task.id == id).first()
