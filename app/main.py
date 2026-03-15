from app.user.routes.user_route import router
from fastapi import FastAPI

app = FastAPI()

app.include_router(router)
