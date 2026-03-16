from app.user.repositories.user_repository import UserRepository
from app.user.models.user import User
from app.user.utils.security import hash_password


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register_user(self, name: str, email: str, password: str) -> None:

        hashed_password = hash_password(password)
        user = User(id=None, name=name, email=email, hashed_password=hashed_password)
        self.user_repository.create_user(user)

    def delete_user(self, user_id: int) -> None:
        if not self.user_repository.get_user_by_id(user_id):
            raise ValueError("User not found")
        self.user_repository.delete_user(user_id)

    def update_user(self, user_id: int, name: str, email: str) -> None:
        existing_user = self.user_repository.get_user_by_id(user_id)
        if not existing_user:
            raise ValueError("User not found")
        updated_user = User(
            id=user_id,
            name=name,
            email=email,
            hashed_password=existing_user.hashed_password,
        )
        self.user_repository.update_user(user_id, updated_user)

    def get_user_by_id(self, user_id: int) -> User | None:
        user = self.user_repository.get_user_by_id(user_id)
        if user is None:
            raise ValueError("User not found")
        return user

    def get_user_by_email(self, email: str) -> User | None:
        user = self.user_repository.get_user_by_email(email)
        if user is None:
            raise ValueError("User not found")
        return user
