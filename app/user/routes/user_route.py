from config.config import settings

from app.user.schemas.user import UserCreate, UserLogin
from app.auth.services.auth_service import AuthService
from app.auth.services.session_service import SessionService
from app.auth.utils.security import (
    create_max_age,
    create_session_expires_at,
    create_session_token,
)
from app.user.services.user_service import UserService
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from app.user.dependencies.user_dependencies import get_user_service
from app.auth.dependencies.auth_dependencies import (
    get_auth_service,
    get_current_user,
    get_session_service,
)

router = APIRouter(prefix="/users", tags=["users"])

COOKIE_SECURE = settings.cookie_secure
SESSION_HOURS = settings.session_hours


@router.post("/register")
def register_user(
    user: UserCreate, user_service: UserService = Depends(get_user_service)
):
    try:
        user_service.register_user(user.name, user.email, user.password)
        return {"message": "User registered successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login_user(
    user: UserLogin,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
    session_service: SessionService = Depends(get_session_service),
):
    auth_user = auth_service.authenticate_user(user.email, user.password)
    token = create_session_token()
    expires_at = create_session_expires_at(hours=SESSION_HOURS)

    session_service.create_session(auth_user.id, token, expires_at)

    max_age = create_max_age(hours=SESSION_HOURS)
    response.set_cookie(
        key="access_token",
        value=token,
        max_age=max_age,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
    )

    return {"message": "Login successful"}


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
    }


@router.post("/logout")
def logout_user(
    request: Request,
    response: Response,
    session_service: SessionService = Depends(get_session_service),
    current_user=Depends(get_current_user),
):
    actual_session = request.cookies.get("access_token")
    if actual_session:
        session_service.revoke_session(actual_session)
    response.delete_cookie(key="access_token")
    return {"message": "Logout successful"}
