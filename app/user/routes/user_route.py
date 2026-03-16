from app.user.schemas.user import UserCreate, UserLogin, UpdateUser
from app.user.services.auth_service import AuthService
from app.user.services.user_service import UserService
from app.user.repositories.user_repository import UserRepository
from fastapi import APIRouter, HTTPException


user_repository = UserRepository()
auth_service = AuthService(user_repository)
user_service = UserService(user_repository)

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register")
async def register_user(user: UserCreate):
    try:
        user_service.register_user(user.name, user.email, user.password)
        return {"message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login_user(user: UserLogin):
    token = auth_service.authenticate_user(user.email, user.password)
    if token:
        return {"message": "Login successful", "token": token}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/{user_id}")
async def get_user(user_id: int):
    user = user_service.get_user_by_id(user_id)
    if user:
        return {"id": user.id, "name": user.name, "email": user.email}
    else:
        raise HTTPException(status_code=404, detail="User not found")


@router.delete("/{user_id}")
async def delete_user(user_id: int):
    try:
        user_service.delete_user(user_id)
        return {"message": "User deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{user_id}")
async def update_user(user_id: int, user: UpdateUser):
    try:
        user_service.update_user(user_id, user.name, user.email)
        return {"message": "User updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
