from config.config import settings

from app.shared import ApiMessageResponse, build_success_response
from app.auth.services.auth_service import AuthService
from app.auth.services.session_service import SessionService
from app.auth.utils.security import (
    create_max_age,
    create_session_expires_at,
    create_session_token,
)
from app.user.services.user_service import UserService
from fastapi import APIRouter, Depends, Request, Response, status
from app.user.dependencies.user_dependencies import get_user_service
from app.auth.dependencies.auth_dependencies import (
    get_auth_service,
    get_current_user,
    get_session_service,
)
from app.user.schemas.user import (
    UserCreate,
    UserData,
    UserEnvelope,
    UserListData,
    UserListEnvelope,
    UserLogin,
)

router = APIRouter(prefix="/users", tags=["users"])

COOKIE_SECURE = settings.cookie_secure
SESSION_HOURS = settings.session_hours


@router.post("/register", response_model=UserEnvelope, status_code=status.HTTP_201_CREATED)
def register_user(
    user: UserCreate, user_service: UserService = Depends(get_user_service)
):
    created_user = user_service.register_user(user.name, user.email, user.password)
    return build_success_response(
        UserData(user=created_user),
        message="User registered successfully",
    )


@router.post("/login", response_model=UserEnvelope)
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

    return build_success_response(
        UserData(user=auth_user),
        message="Login successful",
    )


@router.get("/me", response_model=UserEnvelope)
def get_me(current_user=Depends(get_current_user)):
    return build_success_response(UserData(user=current_user))


@router.post("/logout", response_model=ApiMessageResponse)
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
    return build_success_response(None, message="Logout successful")


@router.get("/", response_model=UserListEnvelope)
def list_users(
    skip: int = 0,
    limit: int = 100,
    user_service: UserService = Depends(get_user_service),
):
    users = user_service.get_users(skip=skip, limit=limit)
    return build_success_response(UserListData(users=users))


@router.get("/by-username/{username}", response_model=UserEnvelope)
def get_user_by_username(
    username: str,
    user_service: UserService = Depends(get_user_service),
):
    user = user_service.get_user_by_username(username)
    return build_success_response(UserData(user=user))
