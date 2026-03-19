from app.tasks.services.task_service import TaskService
from app.tasks.schemas.tasks import TaskCreate, TaskUpdate
from config.dependencies import get_current_user, get_task_service, get_task_repository
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/")
def get_tasks(
    user=Depends(get_current_user),
    task_service=Depends(get_task_repository),
):
    return task_service.get_tasks_by_user_id(user.id)


@router.post("/create")
def create_task(
    task: TaskCreate,
    task_service: TaskService = Depends(get_task_service),
):
    task_service.create_task(task.title, task.description, task.user_id)


@router.post("/complete/{id}")
def complete_task(
    id: int,
    user_id: int,
    task_service: TaskService = Depends(get_task_service),
):
    task_service.complete_task(id, user_id)


@router.patch("/update/{id}")
def update_task(
    id: int,
    task_update: TaskUpdate,
    user=Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    task_service.update_task(id, task_update.title, task_update.description, user.id)


@router.delete("/delete/{id}")
def delete_task(
    id: int,
    user=Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    task_service.delete_task(id, user.id)
