from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.database import Base, engine
from app.user.routes import router as users_router
from app.tasks.routes import router as tasks_router
from app.friends.routes import router as friends_router

Base.metadata.create_all(bind=engine)


def create_app() -> FastAPI:
    app = FastAPI()

    origins = [
        "http://localhost:5173",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(users_router)
    app.include_router(tasks_router)
    app.include_router(friends_router)

    return app


app = create_app()
