from app.user.schemas.user import TokenResponse, UserCreate, UserLogin
from app.auth.services.auth_service import AuthService
from app.user.services.user_service import UserService
from fastapi import APIRouter, Depends, HTTPException
from app.user.dependencies.user_dependencies import get_user_service
from app.auth.dependencies.auth_dependencies import get_auth_service, get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register")
def register_user(
    user: UserCreate, user_service: UserService = Depends(get_user_service)
):
    try:
        user_service.register_user(user.name, user.email, user.password)
        return {"message": "User registered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login_user(
    user: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    token = auth_service.authenticate_user(user.email, user.password)

    if not token:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return TokenResponse(access_token=token)


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }
