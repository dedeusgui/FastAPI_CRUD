from app.user.routes.user_route import router
from app.user.models.user import User
from app.tasks.models.tasks import Task
from fastapi import FastAPI
from config.database import Base, engine

Base.metadata.create_all(bind=engine)
app = FastAPI()

app.include_router(router)
