from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.shared import register_exception_handlers
from app.user.routes import router as users_router
from app.tasks.routes import router as tasks_router
from app.friends.routes import router as friends_router


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

    register_exception_handlers(app)
    app.include_router(users_router)
    app.include_router(tasks_router)
    app.include_router(friends_router)

    return app


app = create_app()
