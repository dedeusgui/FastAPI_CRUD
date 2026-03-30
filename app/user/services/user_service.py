from app.user.repositories.user_repository import UserRepository
from app.user.models.user import User
from app.auth.utils.security import hash_password


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register_user(self, name: str, email: str, password: str) -> None:
        if self.user_repository.get_user_by_email(email):
            raise ValueError("Email already registered")
        hashed_password = hash_password(password)
        user = User(id=None, name=name, email=email, hashed_password=hashed_password)
        self.user_repository.create_user(user)

    def get_user_by_id(self, user_id: int) -> User | None:
        user = self.user_repository.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    def get_user_by_username(self, username: str) -> User | None:
        user = self.user_repository.get_user_by_username(username)
        if user is None:
            raise ValueError("User not found")
        return user

    def get_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        return self.user_repository.get_users(skip=skip, limit=limit)
