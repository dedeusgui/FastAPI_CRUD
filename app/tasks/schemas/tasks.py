from pydantic import BaseModel


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


class TaskRead(BaseModel):
    id: int
    title: str
    description: str | None = None
    completed: bool

    model_config = {"from_attributes": True}


class TaskDelete(BaseModel):
    id: int


class TaskList(BaseModel):
    tasks: list[TaskResponse]
