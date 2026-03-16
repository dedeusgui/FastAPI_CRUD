from app.user.repositories.user_repository import UserRepository
from app.user.schemas.user import UserCreate, UserLogin, UpdateUser
from app.user.services.auth_service import AuthService
from app.user.services.user_service import UserService
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from config.dependencies import get_user_repository, get_user_service
from config.dependencies import get_auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register")
async def register_user(
    user: UserCreate, user_service: UserService = Depends(get_user_service)
):
    try:
        user_service.register_user(user.name, user.email, user.password)
        return {"message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login_user(
    user: UserLogin, auth_service: AuthService = Depends(get_auth_service)
):
    token = auth_service.authenticate_user(user.email, user.password)
    if token:
        return {"message": "Login successful", "token": token}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.get("/me")
async def get_me(
    auth_service: AuthService = Depends(get_auth_service),
    user_service: UserService = Depends(get_user_service),
    user_repository: UserRepository = Depends(get_user_repository),
    token: str = Depends(oauth2_scheme),
):
    current_user = auth_service.get_current_user(user_repository, token)
    if current_user:
        user = user_service.get_user_by_id(current_user.id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"id": user.id, "name": user.name, "email": user.email}
    else:
        raise HTTPException(status_code=401, detail="Not authenticated")


@router.get("/{user_id}")
async def get_user(user_id: int, user_service: UserService = Depends(get_user_service)):
    user = user_service.get_user_by_id(user_id)
    if user:
        return {"id": user.id, "name": user.name, "email": user.email}
    else:
        raise HTTPException(status_code=404, detail="User not found")


@router.delete("/{user_id}")
async def delete_user(
    user_id: int, user_service: UserService = Depends(get_user_service)
):
    try:
        user_service.delete_user(user_id)
        return {"message": "User deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{user_id}")
async def update_user(
    user_id: int,
    user: UpdateUser,
    user_service: UserService = Depends(get_user_service),
):
    try:
        user_service.update_user(user_id, user.name, user.email)
        return {"message": "User updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
