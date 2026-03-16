from pydantic import BaseModel


class TaskCreate(BaseModel):
    title: str
    description: str
    user_id: int


class TaskUpdate(BaseModel):
    title: str
    description: str
    completed: bool


class TaskRead(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    user_id: int

    class Config:
        orm_mode = True


class TaskDelete(BaseModel):
    id: int
