from schemas.user import UserCreate, UserLogin
from services.auth_service import AuthService
from repositories.user_repository import UserRepository
from fastapi import FastAPI, HTTPException
from models.user import User

user_repository = UserRepository()
auth_service = AuthService(user_repository)

app = FastAPI()


@app.post("/register")
async def register_user(user: UserCreate):
    try:
        auth_service.register_user(user.name, user.email, user.password)
        return {"message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    pass


@app.post("/login")
async def login_user(user: UserLogin):
    if auth_service.authenticate_user(user.email, user.password):
        return {"message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = user_repository.get_user_by_id(user_id)
    if user:
        return {"id": user.id, "name": user.name, "email": user.email}
    else:
        raise HTTPException(status_code=404, detail="User not found")


@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    user_repository.delete_user(user_id)
    return {"message": "User deleted successfully"}


@app.put("/users/{user_id}")
async def update_user(user_id: int, user: UserCreate):
    existing_user = user_repository.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = User(
        id=user_id,
        name=user.name,
        email=user.email,
        hashed_password=existing_user.hashed_password,
    )
    user_repository.update_user(user_id, updated_user)
    return {"message": "User updated successfully"}
