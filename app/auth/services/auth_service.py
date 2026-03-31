from app.user.models.user import User
from app.user.repositories.user_repository import UserRepository
from app.auth.utils.security import verify_password
from app.shared import AppException


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def authenticate_user(self, email: str, password: str) -> User:
        user = self.user_repository.get_user_by_email(email)
        if user and verify_password(password, user.hashed_password):
            return user
        raise AppException(
            status_code=401,
            code="AUTH_INVALID_CREDENTIALS",
            message="Invalid email or password",
        )
