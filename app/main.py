from fastapi import FastAPI
from config.database import Base, engine
from app.user.routes import router as users_router
from app.tasks.routes import router as tasks_router

Base.metadata.create_all(bind=engine)


def create_app() -> FastAPI:
    app = FastAPI()
    app.include_router(users_router)
    app.include_router(tasks_router)
    return app


app = create_app()
