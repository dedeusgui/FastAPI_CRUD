from fastapi import APIRouter, Depends, status

from app.auth.dependencies.auth_dependencies import get_current_user
from app.shared import ApiMessageResponse, build_success_response
from app.tasks.dependencies.task_dependencies import get_task_service
from app.tasks.services.task_service import TaskService
from app.tasks.schemas.tasks import (
    TaskCreate,
    TaskData,
    TaskEnvelope,
    TaskList,
    TaskListEnvelope,
    TaskUpdate,
)


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=TaskListEnvelope)
def get_tasks(
    user=Depends(get_current_user),
    task_service=Depends(get_task_service),
):
    task_list = TaskList(tasks=task_service.get_tasks_by_user_id(user.id))
    return build_success_response(task_list)


@router.post("/create", response_model=TaskEnvelope, status_code=status.HTTP_201_CREATED)
def create_task(
    task: TaskCreate,
    user=Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    task = task_service.create_task(task.title, task.description, user.id)

    return build_success_response(
        TaskData(task=task),
        message="Task created successfully",
    )


@router.post("/complete/{id}", response_model=TaskEnvelope)
def complete_task(
    id: int,
    task_service: TaskService = Depends(get_task_service),
    user=Depends(get_current_user),
):
    task = task_service.complete_task(id, user.id)
    return build_success_response(
        TaskData(task=task),
        message="Task completed successfully",
    )


@router.patch("/update/{id}", response_model=TaskEnvelope)
def update_task(
    id: int,
    task_update: TaskUpdate,
    user=Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    task = task_service.update_task(
        id, task_update.title, task_update.description, user.id
    )
    return build_success_response(
        TaskData(task=task),
        message="Task updated successfully",
    )


@router.delete("/delete/{id}", response_model=ApiMessageResponse)
def delete_task(
    id: int,
    user=Depends(get_current_user),
    task_service: TaskService = Depends(get_task_service),
):
    task_service.delete_task(id, user.id)
    return build_success_response(None, message="Task deleted successfully")
