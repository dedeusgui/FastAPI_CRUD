from app.user.schemas.user import UserCreate, UserLogin, UserUpdate
from app.user.services.auth_service import AuthService
from app.user.services.user_service import UserService
from fastapi import APIRouter, Depends, HTTPException
from config.dependencies import get_auth_service, get_current_user, get_user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register")
async def register_user(
    user: UserCreate, user_service: UserService = Depends(get_user_service)
):
    try:
        user_service.register_user(user.name, user.email, user.password)
        return {"message": "User registered successfully"}
    except ValueError as e:
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
async def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }
