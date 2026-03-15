from app.user.repositories.user_repository import UserRepository
from app.user.models.user import User
from app.user.utils.security import hash_password, verify_password


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def authenticate_user(self, email: str, password: str) -> bool:
        user = self.user_repository.get_user_by_email(email)
        if user and verify_password(password, user.hashed_password):
            return True
        return False
