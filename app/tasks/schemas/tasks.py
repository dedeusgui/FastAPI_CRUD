from pydantic import BaseModel

from app.shared.api import ApiSuccessResponse


class TaskCreate(BaseModel):
    title: str
    description: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str | None = None
    completed: bool

    model_config = {"from_attributes": True}


class TaskList(BaseModel):
    tasks: list[TaskResponse]


class TaskData(BaseModel):
    task: TaskResponse


TaskEnvelope = ApiSuccessResponse[TaskData]
TaskListEnvelope = ApiSuccessResponse[TaskList]
