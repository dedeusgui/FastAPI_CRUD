from repositories.user_repository import UserRepository
from models.user import User
from utils.security import hash_password, verify_password


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register_user(self, name: str, email: str, password: str) -> None:

        hashed_password = hash_password(password)
        user = User(id=None, name=name, email=email, hashed_password=hashed_password)
        self.user_repository.create_user(user)

    def authenticate_user(self, email: str, password: str) -> bool:
        user = self.user_repository.get_user_by_email(email)
        if user and verify_password(password, user.hashed_password):
            return True
        return False
