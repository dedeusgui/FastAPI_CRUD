from app.tasks.services.task_service import TaskService
from app.tasks.schemas.tasks import TaskCreate, TaskList, TaskResponse, TaskUpdate
from app.tasks.dependencies.task_dependencies import get_task_service
from app.auth.dependencies.auth_dependencies import get_current_user

from fastapi import APIRouter, Depends


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/")
def get_tasks(
    user=Depends(get_current_user),
    task_service=Depends(get_task_service),
):
    task_list = TaskList(tasks=task_service.get_tasks_by_user_id(user.id))
    return task_list


@router.post("/create")
def create_task(
    task: TaskCreate,
    user=Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    task = task_service.create_task(task.title, task.description, user.id)

    return TaskResponse(**task.__dict__)


@router.post("/complete/{id}")
def complete_task(
    id: int,
    task_service: TaskService = Depends(get_task_service),
    user=Depends(get_current_user),
):
    task = task_service.complete_task(id, user.id)
    return TaskResponse(**task.__dict__)


@router.patch("/update/{id}")
def update_task(
    id: int,
    task_update: TaskUpdate,
    user=Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    task = task_service.update_task(
        id, task_update.title, task_update.description, user.id
    )
    return TaskResponse(**task.__dict__)


@router.delete("/delete/{id}")
def delete_task(
    id: int,
    user=Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    task_service.delete_task(id, user.id)
    return {"detail": "Task deleted successfully"}
